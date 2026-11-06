import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRun, selectCompanion, applyChoice, manage, beginBattle, actBattle, finishChapter, getEnding, getDailySeed, FORMATIONS, setFormation, COMPANION_ABILITIES, getCompanionAbility, useCompanionAbility, getDailyModifier } from '../dist/engine.js';
const chapter = (index, enemyHP = 92) => ({ index, id: `chapter-${index}`, title: '测试篇章', mission: { title: '守关', enemyHP }, events: Array.from({ length: 3 }, (_, i) => ({ id: `event-${i}`, title: `抉择${i}`, choices: [{ text: '安民', effects: { people: 8, grain: -2 }, tag: '仁心', result: '百姓渐安。' }, { text: '积粮', effects: { grain: 9, prestige: 2 }, tag: '谋略' }] })) });
const person = { id: 'yuqian', name: '于谦', bonus: { people: 7, army: 3 } };
function prepare(state, ch) {
  assert.equal(selectCompanion(state, person).ok, true);
  for (const event of ch.events) assert.equal(applyChoice(state, ch, event, 1).ok, true);
}
function play(seed) {
  const state = createRun(seed);
  for (let index = 0; index < 6; index++) {
    const ch = chapter(index);
    prepare(state, ch);
    assert.equal(manage(state, 'train').ok, true);
    assert.equal(manage(state, 'levy').ok, true);
    assert.equal(beginBattle(state, ch).ok, true);
    while (state.phase === 'battle') {
      const tactic = { rush: 'guard', fortify: 'flank', ambush: 'volley' }[state.battle.intent];
      assert.equal(actBattle(state, tactic, state.battle.lane).ok, true);
    }
    const after = JSON.stringify(state);
    assert.equal(actBattle(state, 'strike', 1).ok, false);
    assert.equal(JSON.stringify(state), after, 'finished battles cannot award twice');
    assert.equal(finishChapter(state).ok, true);
  }
  return state;
}
const first = play('same-seed');
assert.deepEqual(first, play('same-seed'), 'seed and decisions reproduce exactly');
assert.notDeepEqual(first, play('other-seed'), 'different seeds change enemy sequence');
assert.equal(first.phase, 'ending');
assert.equal(first.results.length, 6);
assert.equal(first.wins, 6, 'good counterplay can win every chapter');
assert.deepEqual(JSON.parse(JSON.stringify(first)), first, 'save state survives JSON roundtrip');
assert.equal(finishChapter(first).ok, false, 'cannot skip chapters');
for (const value of Object.values(first.stats)) assert.ok(value >= 0 && value <= 100);
assert.ok(getEnding(first).score >= 0 && getEnding(first).score <= 100);
{
  const state = createRun('guard-actions');
  const ch = chapter(0);
  assert.equal(manage(state, 'train').ok, false);
  assert.equal(beginBattle(state, ch).ok, false);
  assert.equal(applyChoice(state, ch, ch.events[0], 0).ok, false);
  assert.equal(selectCompanion(state, person).ok, true);
  const snapshot = JSON.stringify(state);
  assert.equal(selectCompanion(state, person).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(applyChoice(state, ch, ch.events[1], 0).ok, false, 'stale/future event is rejected');
  assert.equal(applyChoice(state, ch, ch.events[0], 0).ok, true);
  assert.equal(applyChoice(state, ch, ch.events[0], 0).ok, false, 'duplicate choice is rejected');
  assert.equal(applyChoice(state, ch, ch.events[1], -1).ok, false);
  assert.equal(applyChoice(state, ch, ch.events[1], 0).ok, true);
  assert.equal(applyChoice(state, ch, ch.events[2], 0).ok, true);
  state.stats.grain = 0;
  const before = JSON.stringify(state);
  assert.equal(manage(state, 'relief').ok, false);
  assert.equal(JSON.stringify(state), before, 'unaffordable action is atomic');
  state.stats.people = 7;
  assert.equal(manage(state, 'levy').ok, false);
  state.stats.people = 20;
  assert.equal(manage(state, 'levy').ok, true);
  assert.equal(manage(state, 'train').ok, true);
  assert.equal(manage(state, 'levy').ok, false, 'only two management actions');
  assert.equal(beginBattle(state, ch).ok, true);
  assert.equal(beginBattle(state, ch).ok, false, 'cannot reset active battle');
  state.stats.grain = 4;
  const pending = JSON.stringify(state);
  assert.equal(actBattle(state, 'volley', 1).ok, false);
  assert.equal(actBattle(state, 'strike', 3).ok, false);
  assert.equal(actBattle(state, 'unknown', 1).ok, false);
  assert.equal(JSON.stringify(state), pending, 'invalid combat actions do not consume RNG/turn');
}
{
  const state = createRun('round-limit');
  const ch = chapter(0, 250);
  prepare(state, ch);
  beginBattle(state, ch);
  while (state.phase === 'battle') actBattle(state, 'guard', state.battle.lane);
  assert.equal(state.battle.turn, 8);
  assert.equal(state.battle.log.length, 8);
  assert.equal(state.battle.done, true);
  assert.equal(state.battle.reason, 'round-limit');
  assert.equal(state.wins, 0);
  assert.equal(state.results.length, 1);
}
{
  const state = createRun('save-in-combat');
  const ch = chapter(0);
  prepare(state, ch); beginBattle(state, ch); actBattle(state, 'strike', 1);
  const restored = JSON.parse(JSON.stringify(state));
  actBattle(state, 'guard', 0); actBattle(restored, 'guard', 0);
  assert.deepEqual(restored, state, 'in-progress battle resumes identical RNG sequence');
}
{
  const endings = new Set();
  for (const [stats, tags, wins] of [
    [{ people: 90, grain: 60, army: 60, prestige: 60 }, { 仁心: 8, 谋略: 1, 胆识: 0 }, 4],
    [{ people: 60, grain: 50, army: 90, prestige: 60 }, { 仁心: 0, 谋略: 1, 胆识: 8 }, 6],
    [{ people: 60, grain: 90, army: 60, prestige: 60 }, { 仁心: 0, 谋略: 8, 胆识: 1 }, 4],
    [{ people: 60, grain: 50, army: 60, prestige: 90 }, { 仁心: 0, 谋略: 1, 胆识: 1 }, 4],
    [{ people: 20, grain: 40, army: 20, prestige: 20 }, { 仁心: 0, 谋略: 1, 胆识: 1 }, 1],
    [{ people: 60, grain: 50, army: 60, prestige: 60 }, { 仁心: 0, 谋略: 1, 胆识: 1 }, 4],
  ]) { const state = createRun('ending'); Object.assign(state, { stats, tags, wins }); endings.add(getEnding(state).title); }
  assert.equal(endings.size, 6);
}
{
  const state = createRun('content-schema');
  assert.equal(selectCompanion(state, { id: 'yu_qian', name: '于谦', skill: { stat: 'prestige', amount: 6 } }).ok, true);
  assert.equal(state.stats.prestige, 56, 'content skill schema applies exact stat bonus');
  const ch = chapter(0);
  ch.events[0].choices[0] = { label: '以民为先', detail: '先护住城中百姓。', effects: { people: 500, grain: -500 }, tag: '仁心' };
  const result = applyChoice(state, ch, ch.events[0], 0);
  assert.equal(result.message, '先护住城中百姓。');
  assert.equal(state.stats.people, 100);
  assert.equal(state.stats.grain, 0);
  assert.equal(state.tags.仁心, 1);
  assert.match(state.journal.at(-1).text, /以民为先/);
}
assert.equal(getDailySeed(new Date('2026-11-06T15:59:59Z')), 'ming-20261106');
assert.equal(getDailySeed(new Date('2026-11-06T16:00:00Z')), 'ming-20261107', 'daily challenge rolls over in China time');
console.log('PASS: six-chapter completion; deterministic/reloadable combat; action guards; resource bounds/costs; eight-turn limit; 6 endings; Asia/Shanghai daily seed.');
function terrainBattle(terrain, seed = 'terrain-rules') {
  const state = createRun(seed);
  const ch = chapter(0, 250);
  ch.mission.terrain = terrain;
  prepare(state, ch);
  beginBattle(state, ch);
  return state;
}
function compareTerrain(terrain, tactic, lane = 1, setup = () => {}) {
  const special = terrainBattle(terrain);
  setup(special);
  const plain = JSON.parse(JSON.stringify(special));
  plain.battle.terrain = 'plain';
  plain.battle.volleyCost = 5;
  const reference = actBattle(plain, tactic, lane);
  const actual = actBattle(special, tactic, lane);
  assert.equal(reference.ok, true);
  assert.equal(actual.ok, true);
  return { plain, special, reference, actual };
}
assert.equal(compareTerrain('lake', 'volley').actual.terrainBonus, 4);
assert.equal(compareTerrain('lake', 'volley').actual.dealt - compareTerrain('lake', 'volley').reference.dealt, 4);
assert.equal(compareTerrain('city', 'flank').actual.terrainBonus, 4);
assert.equal(compareTerrain('city', 'strike').actual.terrainBonus, 0, 'city only buffs flank');
{
  const { special, plain, actual, reference } = compareTerrain('sea', 'volley', 2, s => { s.battle.wind = 2; });
  assert.equal(actual.dealt - reference.dealt, 5);
  assert.equal(special.stats.grain, plain.stats.grain - 1, 'sea volley costs one extra grain');
  const state = terrainBattle('sea'); state.stats.grain = 5;
  const snapshot = JSON.stringify(state);
  assert.equal(actBattle(state, 'volley', 1).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
  const a = terrainBattle('sea', 'same-wind');
  const b = terrainBattle('sea', 'same-wind');
  for (let i = 0; i < 3; i++) { actBattle(a, 'guard', a.battle.wind); actBattle(b, 'guard', b.battle.wind); }
  assert.deepEqual(a, b, 'sea wind and combat remain deterministic');
}
{
  const { special, plain, actual } = compareTerrain('wall', 'guard', 1, s => { s.battle.hp = 40; });
  assert.equal(actual.recovered, 3);
  assert.equal(special.battle.hp, plain.battle.hp + 3);
  const state = terrainBattle('wall'); state.battle.hp = 1;
  actBattle(state, 'guard', (state.battle.lane + 1) % 3);
  assert.equal(state.battle.hp, 0, 'wall recovery cannot resurrect a broken defense');
}
{
  const state = terrainBattle('coast');
  const counter = { rush: 'guard', fortify: 'flank', ambush: 'volley' }[state.battle.intent];
  const { actual, reference } = compareTerrain('coast', counter);
  assert.equal(actual.dealt - reference.dealt, 4);
}
{
  const { actual, reference } = compareTerrain('capital', 'strike', 1, s => { s.stats.prestige = 75; s.stats.grain = 70; });
  assert.equal(actual.dealt - reference.dealt, 5);
  assert.equal(reference.received - actual.received, 2);
  assert.equal(compareTerrain('capital', 'strike', 1, s => { s.stats.grain = 59; }).reference.received,
    compareTerrain('capital', 'strike', 1, s => { s.stats.grain = 59; }).actual.received);
}
console.log('PASS: lake fire ships; city flank; sea wind/cost; wall repair; coast counters; capital prestige/supply rules.');
// Exercise the authored six chapters, not only synthetic fixtures.
const { CHAPTERS, CHARACTERS } = await import('../dist/content.js');
assert.equal(CHAPTERS.length, 6);
const actualResults = [];
for (const choiceIndex of [0, 1, 2]) {
  const state = createRun(`content-route-${choiceIndex}`);
  for (const ch of CHAPTERS) {
    const character = CHARACTERS.find(c => c.id === (ch.companions[0] ?? ch.lead));
    assert.ok(character, `${ch.id}: missing playable companion`);
    assert.equal(selectCompanion(state, character).ok, true);
    for (const event of ch.events) assert.equal(applyChoice(state, ch, event, choiceIndex).ok, true);
    for (let i = 0; i < 2; i++) {
      const action = state.stats.grain < 30 && state.stats.people >= 8 ? 'levy' : state.stats.grain >= 8 ? 'train' : null;
      if (action) assert.equal(manage(state, action).ok, true);
    }
    assert.equal(beginBattle(state, ch).ok, true);
    assert.equal(state.battle.terrain, ch.mission.terrain);
    let actions = 0;
    while (state.phase === 'battle') {
      let tactic = { rush: 'guard', fortify: 'flank', ambush: 'volley' }[state.battle.intent];
      if (tactic === 'volley' && state.stats.grain < (state.battle.terrain === 'sea' ? 6 : 5)) tactic = 'strike';
      assert.equal(actBattle(state, tactic, state.battle.lane).ok, true);
      assert.ok(++actions <= 8);
    }
    assert.equal(finishChapter(state).ok, true);
  }
  assert.equal(state.phase, 'ending');
  assert.equal(state.results.length, 6);
  assert.equal(state.journal.filter(j => j.type === 'choice').length, 18);
  assert.ok(CHARACTERS.some(c => c.id === getEnding(state).characterId));
  actualResults.push({ route: choiceIndex, wins: state.wins, ending: getEnding(state).title, stats: state.stats });
}
assert.equal(new Set(actualResults.map(r => r.ending)).size, 3, 'three actual decision routes produce distinct endings');
console.log('PASS: all authored content on 3 complete decision routes:', JSON.stringify(actualResults));

{
  const state = createRun('ending-priority');
  state.stats = { people: 34, grain: 100, army: 100, prestige: 100 };
  state.tags = { 仁心: 0, 谋略: 18, 胆识: 0 }; state.wins = 6;
  assert.equal(getEnding(state).archetype, '坚韧', 'low people overrides victories and planner');
  state.stats.people = 60; state.stats.grain = 55;
  assert.equal(getEnding(state).archetype, '谋略', 'planner at 55 grain outranks generic six-win military');
  state.stats.grain = 54;
  assert.equal(getEnding(state).archetype, '胆识');
  state.stats.people = 80; state.tags = { 仁心: 18, 谋略: 0, 胆识: 0 };
  assert.equal(getEnding(state).archetype, '仁心', 'guardian outranks military');
}
{
  const state = createRun('chapter-identity');
  selectCompanion(state, person);
  const ch = chapter(0); delete ch.index;
  applyChoice(state, ch, ch.events[0], 0);
  const wrong = chapter(1); delete wrong.index;
  assert.equal(applyChoice(state, wrong, wrong.events[1], 0).ok, false, 'sticky chapter ID guards content without numeric index');
  applyChoice(state, ch, ch.events[1], 0); applyChoice(state, ch, ch.events[2], 0);
  assert.equal(manage(state, 'constructor').ok, false, 'prototype names are not management actions');
  assert.equal(beginBattle(state, wrong).ok, false);
  assert.equal(beginBattle(state, ch).ok, true);
  const invalid = structuredClone(state); invalid.stats.grain = NaN;
  assert.equal(actBattle(invalid, 'strike', 1).ok, false, 'invalid resource values are rejected');
}
console.log('PASS: consequence/guardian/planner/military priority, chapter identity and malformed-action guards.');

// Regression evidence captured from the pre-upgrade engine before modifying it.
// This is a genuine v1 save shape, rather than a v2 run with a flag switched off.
{
  const state = JSON.parse('{"version":1,"seed":"legacy-snapshot","mode":"story","chapter":0,"event":0,"phase":"companion","activeChapterId":null,"stats":{"people":60,"grain":65,"army":55,"prestige":50},"tags":{"仁心":0,"谋略":0,"胆识":0},"bonds":{},"journal":[],"wins":0,"results":[],"management":0,"battle":null,"companions":[],"rng":3400148697}');
  assert.equal(setFormation(state, 'assault').ok, false);
  assert.equal(getCompanionAbility(state).ready, false);
  const before = JSON.stringify(state);
  assert.equal(useCompanionAbility(state).ok, false);
  assert.equal(JSON.stringify(state), before);
  for (let index = 0; index < 6; index++) {
    const ch = chapter(index);
    prepare(state, ch);
    manage(state, 'train'); manage(state, 'levy');
    beginBattle(state, ch);
    assert.equal(state.battle.maxEnemyHP, 92, 'old saves retain the original authored enemy HP');
    assert.equal(state.battle.objective, undefined);
    assert.equal(state.battle.ability, undefined);
    while (state.phase === 'battle') actBattle(state, { rush: 'guard', fortify: 'flank', ambush: 'volley' }[state.battle.intent], state.battle.lane);
    finishChapter(state);
  }
  assert.equal(createHash('sha256').update(JSON.stringify(state)).digest('hex'), 'e038ccfe9b6325fd8c664dd7fa0a638bfacef9fd3a4331b5162ead44af379e3f', 'legacy six-chapter state remains byte-for-byte identical');
  assert.equal(getEnding(state).score, 93);
  assert.equal(getEnding(state).objectiveBonus, undefined);
}

function newBattle(terrain = 'lake', companionId = 'yu_qian', options = {}) {
  const state = createRun(options.seed ?? 'modern-combat', options.mode ?? 'story');
  const ch = chapter(0, options.enemyHP ?? 250);
  ch.mission.terrain = terrain;
  assert.equal(selectCompanion(state, CHARACTERS.find(c => c.id === companionId)).ok, true);
  for (const event of ch.events) assert.equal(applyChoice(state, ch, event, 1).ok, true);
  if (options.formation) assert.equal(setFormation(state, options.formation).ok, true);
  assert.equal(beginBattle(state, ch).ok, true);
  return state;
}

{
  assert.equal(createRun('new').ruleset, 2);
  assert.deepEqual(Object.keys(FORMATIONS), ['balanced', 'assault', 'defense']);
  const state = createRun('formations');
  const ch = chapter(0);
  assert.equal(setFormation(state, 'assault').ok, false);
  prepare(state, ch);
  const resources = { ...state.stats };
  assert.equal(setFormation(state, 'constructor').ok, false);
  assert.equal(setFormation(state, 'assault').ok, true);
  assert.deepEqual(state.stats, resources);
  assert.equal(state.management, 0, 'formation selection does not spend preparation actions');
  beginBattle(state, ch);
  const locked = JSON.stringify(state);
  assert.equal(setFormation(state, 'defense').ok, false);
  assert.equal(JSON.stringify(state), locked, 'formation locks when battle begins');

  const neutral = newBattle('city');
  neutral.battle.intent = 'fortify'; neutral.battle.lane = 1;
  const assault = structuredClone(neutral); assault.battle.formation = 'assault';
  const defense = structuredClone(neutral); defense.battle.formation = 'defense';
  const a = actBattle(assault, 'strike', 1), b = actBattle(neutral, 'strike', 1), d = actBattle(defense, 'strike', 1);
  assert.equal(a.dealt - b.dealt, 4); assert.equal(a.received - b.received, 3);
  assert.equal(d.dealt - b.dealt, -3); assert.equal(d.received - b.received, -3);
}

{
  assert.equal(Object.keys(COMPANION_ABILITIES).length, 12);
  assert.equal(new Set(Object.values(COMPANION_ABILITIES).map(a => a.name)).size, 12);
  const expected = {
    zhu_yuanzhang: { hp: 52, next: 8 }, ma_huanghou: { hp: 54, grain: 32 }, xu_da: { enemy: 60 },
    liu_ji: { next: 10, shield: 12 }, zhu_yunwen: { hp: 58, people: 58 }, zhu_di: { enemy: 66, next: 10 },
    yao_guangxiao: { intent: 'fortify', shield: 16 }, zheng_he: { grain: 36, shield: 8 },
    yu_qian: { hp: 64, lanes: [12, 26, 30] }, qi_jiguang: { enemy: 68, next: 6, lanes: [19, 18, 25] },
    hai_rui: { grain: 38, people: 55 }, zhang_juzheng: { next: 14, grain: 28 },
  };
  for (const id of Object.keys(COMPANION_ABILITIES)) {
    const state = newBattle('lake', id);
    const before = JSON.stringify(state);
    assert.equal(useCompanionAbility(state).ok, false, `${id}: not charged at start`);
    assert.equal(JSON.stringify(state), before);
    actBattle(state, 'guard', state.battle.lane);
    assert.equal(getCompanionAbility(state).charge, 1);
    assert.equal(getCompanionAbility(state).ready, false);
    const invalid = JSON.stringify(state);
    assert.equal(actBattle(state, 'bad', 1).ok, false);
    assert.equal(JSON.stringify(state), invalid, 'invalid action cannot charge an ability');
    actBattle(state, 'guard', state.battle.lane);
    assert.equal(getCompanionAbility(state).ready, true);
    // Controlled wounded/low-supply fixture verifies each effect independently.
    state.battle.hp = 40; state.battle.enemyHP = 80; state.battle.laneHP = [4, 18, 25];
    state.stats.grain = 20; state.stats.people = 50;
    const restored = JSON.parse(JSON.stringify(state));
    const turn = state.battle.turn, rng = state.rng;
    const result = useCompanionAbility(state);
    assert.equal(result.ok, true, id);
    assert.equal(state.battle.turn, turn, `${id}: does not consume a turn`);
    assert.equal(state.rng, rng, `${id}: does not reroll enemy intent`);
    assert.equal(getCompanionAbility(state).used, true);
    assert.equal(getCompanionAbility(state).ready, false);
    useCompanionAbility(restored);
    assert.deepEqual(restored, state, `${id}: charged save resumes identically`);
    const e = expected[id];
    if (e.hp !== undefined) assert.equal(state.battle.hp, e.hp, id);
    if (e.enemy !== undefined) assert.equal(state.battle.enemyHP, e.enemy, id);
    if (e.next !== undefined) assert.equal(state.battle.nextAttackBonus, e.next, id);
    if (e.shield !== undefined) assert.equal(state.battle.guardBonus, e.shield, id);
    if (e.grain !== undefined) assert.equal(state.stats.grain, e.grain, id);
    if (e.people !== undefined) assert.equal(state.stats.people, e.people, id);
    if (e.intent !== undefined) assert.equal(state.battle.intent, e.intent, id);
    if (e.lanes) assert.deepEqual(state.battle.laneHP, e.lanes, id);
    const used = JSON.stringify(state);
    assert.equal(useCompanionAbility(state).ok, false, `${id}: use is limited to once per battle`);
    assert.equal(JSON.stringify(state), used);
    actBattle(state, 'guard', state.battle.lane); actBattle(restored, 'guard', restored.battle.lane);
    assert.deepEqual(restored, state, `${id}: post-ability continuation remains deterministic`);
    assert.equal(state.battle.nextAttackBonus, 0, `${id}: offensive buff expires on the next valid tactic`);
    assert.equal(state.battle.guardBonus, 0, `${id}: guard expires on the next valid tactic`);
  }
  const decisive = newBattle('city', 'xu_da');
  actBattle(decisive, 'guard', decisive.battle.lane); actBattle(decisive, 'guard', decisive.battle.lane);
  decisive.battle.enemyHP = 12; // Boundary test; not a claim of browser gameplay.
  const hp = decisive.battle.hp, turn = decisive.battle.turn;
  const result = useCompanionAbility(decisive);
  assert.equal(result.victory, true); assert.equal(decisive.phase, 'review');
  assert.equal(decisive.battle.turn, turn); assert.equal(decisive.battle.hp, hp);
  assert.equal(decisive.results.length, 1); assert.equal(decisive.wins, 1);
  const completed = JSON.stringify(decisive);
  assert.equal(useCompanionAbility(decisive).ok, false);
  assert.equal(actBattle(decisive, 'strike', 1).ok, false);
  assert.equal(JSON.stringify(decisive), completed, 'a decisive ability cannot award the victory twice');
}

{
  for (const terrain of ['lake', 'city', 'sea', 'wall', 'coast', 'capital']) {
    const state = newBattle(terrain);
    const target = state.battle.objective.target;
    for (let i = 0; i < target; i++) {
      const tactic = terrain === 'lake' ? 'volley' : terrain === 'city' ? 'flank' : terrain === 'wall' ? 'guard' : terrain === 'coast' ? ({ rush: 'guard', fortify: 'flank', ambush: 'volley' }[state.battle.intent]) : terrain === 'capital' ? ['strike', 'guard', 'flank'][i] : 'guard';
      const lane = terrain === 'sea' ? state.battle.wind : state.battle.lane;
      assert.equal(actBattle(state, tactic, lane).ok, true);
      assert.equal(state.battle.objective.progress, i + 1, `${terrain}: progress follows the actual tactical goal`);
    }
    assert.equal(state.battle.objective.complete, true, terrain);
    while (state.phase === 'battle') actBattle(state, 'guard', state.battle.lane);
    assert.equal(state.results[0].objectiveComplete, true);
    assert.equal(state.results[0].objectiveBonus, 2);
    assert.equal(state.battle.objective.progress, target, 'completed progress remains capped');
  }
  const state = newBattle('capital');
  actBattle(state, 'guard', state.battle.lane); actBattle(state, 'guard', state.battle.lane);
  assert.equal(state.battle.objective.progress, 1, 'capital counts different tactics, not repeated clicks');
  state.stats.grain = 29;
  actBattle(state, 'flank', state.battle.lane);
  assert.equal(state.battle.objective.progress, 1, 'capital requires adequate supply before the tactic');
  const empty = newBattle('lake'); empty.stats.grain = 0;
  assert.equal(actBattle(empty, 'volley', 1).ok, false);
  assert.equal(empty.battle.objective.progress, 0);
  assert.equal(getCompanionAbility(empty).charge, 0);
  assert.equal(actBattle(empty, 'strike', empty.battle.lane).ok, true, 'zero grain never locks all combat actions');
  const score = createRun('score-cap'); score.stats = { people: 100, grain: 100, army: 100, prestige: 100 }; score.wins = 6;
  score.results = Array.from({ length: 20 }, () => ({ objectiveComplete: true }));
  assert.equal(getEnding(score).score, 100); assert.equal(getEnding(score).objectiveBonus, 12);
}

{
  const seedByModifier = {};
  for (let day = 1; day <= 31; day++) {
    const seed = `ming-202611${String(day).padStart(2, '0')}`;
    seedByModifier[getDailyModifier(seed).id] ??= seed;
    assert.deepEqual(getDailyModifier(seed), getDailyModifier(seed));
  }
  assert.equal(Object.keys(seedByModifier).length, 3);
  assert.equal(getDailyModifier('journey-private'), null);
  assert.equal(createRun(seedByModifier.vanguard, 'story').dailyModifier, null, 'ordinary stories never receive a daily modifier');
  assert.equal(createRun('journey-private', 'daily').dailyModifier, null, 'friend story seeds do not silently become modified challenges');
  for (const [id, seed] of Object.entries(seedByModifier)) {
    const state = createRun(seed, 'daily');
    assert.equal(state.stats.grain, id === 'lean-granary' ? 55 : 65);
    assert.deepEqual(state, createRun(seed, 'daily'));
    const daily = newBattle('sea', 'zheng_he', { mode: 'daily', seed, enemyHP: 80 });
    const plain = newBattle('sea', 'zheng_he', { mode: 'story', seed, enemyHP: 80 });
    assert.equal(daily.battle.maxEnemyHP - plain.battle.maxEnemyHP, id === 'vanguard' ? 15 : 0);
    assert.equal(daily.battle.volleyCost - plain.battle.volleyCost, id === 'lean-granary' ? 1 : 0);
    const restored = JSON.parse(JSON.stringify(daily));
    const actual = actBattle(daily, 'volley', daily.battle.wind);
    actBattle(restored, 'volley', restored.battle.wind);
    assert.deepEqual(daily, restored, 'daily rules persist across a mid-battle reload');
    assert.equal(actual.dailyBonus, id === 'favorable-wind' ? 3 : 0);
  }
  const wind = newBattle('city', 'xu_da', { mode: 'daily', seed: seedByModifier['favorable-wind'] });
  assert.equal(actBattle(wind, 'strike', wind.battle.lane).dailyBonus, 2);
}

{
  const state = newBattle('city');
  while (state.phase === 'battle') actBattle(state, 'guard', state.battle.lane);
  const prior = { ...state.stats };
  assert.equal(finishChapter(state).ok, true);
  assert.equal(state.stats.grain, Math.max(0, prior.grain - 7));
  assert.equal(state.stats.army, Math.max(0, prior.army - 4));
  assert.equal(state.journal.at(-1).type, 'journey-cost');
  assert.equal(state.phase, 'companion');
  state.stats = { people: 0, grain: 0, army: 0, prestige: 0 };
  const next = chapter(1); prepare(state, next);
  assert.equal(beginBattle(state, next).ok, true, 'low-resource runs can still progress to the next battle');
}
console.log('PASS: byte-exact v1 compatibility; three formations; all 12 charged abilities; six tactical objectives; daily modifiers; travel costs; score caps; save/reload parity. Rules tests do not replace browser playtesting.');
