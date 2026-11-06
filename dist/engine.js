/** Deterministic, DOM-free rules for 大明·故人长卷. All accepted actions mutate state. */
export const STAT_KEYS = ['people', 'grain', 'army', 'prestige'];
export const TACTICS = ['strike', 'guard', 'flank', 'volley'];
const COUNTERS = { rush: 'guard', fortify: 'flank', ambush: 'volley' };
const INTENTS = Object.keys(COUNTERS);
const INTENT_NAMES = { rush: '突进', fortify: '固守', ambush: '伏击' };
const TACTIC_NAMES = { strike: '强攻', guard: '坚守', flank: '迂回', volley: '齐射' };
const LANES = ['左路', '中路', '右路'];
export const FORMATIONS = {
  balanced: { name: '持衡阵', description: '攻守均衡，不改变伤害与损耗。', damage: 0, incoming: 0 },
  assault: { name: '锋矢阵', description: '每次战术伤害 +4，但承受损耗 +3。', damage: 4, incoming: 3 },
  defense: { name: '坚壁阵', description: '每次战术伤害 -3，承受损耗 -3；要留意八回合时限。', damage: -3, incoming: -3 },
};
export const COMPANION_ABILITIES = {
  zhu_yuanzhang: { name: '聚众成军', description: '回复 12 点阵线，下一次战术伤害 +8。', heal: 12, nextAttack: 8 },
  ma_huanghou: { name: '一饭之恩', description: '回复 14 点阵线，补充 12 点粮草。', heal: 14, stats: { grain: 12 } },
  xu_da: { name: '破阵先登', description: '立即对敌方造成 20 点伤害，不受阵形增减影响。', damage: 20 },
  liu_ji: { name: '筹策定局', description: '下一次战术伤害 +10，并抵消下一次交锋的 12 点损耗。', nextAttack: 10, shield: 12 },
  zhu_yunwen: { name: '宽政安民', description: '回复 18 点阵线，恢复 8 点民心。', heal: 18, stats: { people: 8 } },
  zhu_di: { name: '乘势突击', description: '立即造成 14 点伤害，下一次战术伤害再 +10。', damage: 14, nextAttack: 10 },
  yao_guangxiao: { name: '奇谋伏线', description: '把当前敌势诱为固守，抵消下一次交锋的 16 点损耗。', forceIntent: 'fortify', shield: 16 },
  zheng_he: { name: '通航接济', description: '补充 16 点粮草，并抵消下一次交锋的 8 点损耗。', stats: { grain: 16 }, shield: 8 },
  yu_qian: { name: '再守京城', description: '回复 24 点阵线，并为三路各修复 8 点防线。', heal: 24, lanes: 8 },
  qi_jiguang: { name: '鸳鸯合阵', description: '立即造成 12 点伤害；修复最薄弱一路 15 点，下一击伤害 +6。', damage: 12, weakestLane: 15, nextAttack: 6 },
  hai_rui: { name: '清丈归公', description: '补充 18 点粮草，恢复 5 点民心，留作齐射与后续行军。', stats: { grain: 18, people: 5 } },
  zhang_juzheng: { name: '考成督战', description: '下一次战术伤害 +14，并补充 8 点粮草。', nextAttack: 14, stats: { grain: 8 } },
};
const DAILY_MODIFIERS = [
  { id: 'vanguard', title: '劲敌临阵', description: '每幕敌方阵线额外增加 15 点，更考验战术与故人配合。' },
  { id: 'lean-granary', title: '粮道紧张', description: '起始粮草减少 10 点，每次齐射多消耗 1 点粮草。' },
  { id: 'favorable-wind', title: '东风相助', description: '海战顺风伤害额外 +3；其他战场命中敌方来路额外 +2。' },
];
const OBJECTIVES = {
  lake: { title: '借火破阵', description: '本幕使用两次齐射，让火船配合正面攻势。', target: 2 },
  city: { title: '穿街破阵', description: '本幕使用两次迂回，利用城巷绕开正面。', target: 2 },
  sea: { title: '顺风远航', description: '两次在本回合的顺风一路出击。顺风与敌路未必相同。', target: 2 },
  wall: { title: '城门不失', description: '两次选准敌方来路并使用坚守。', target: 2 },
  coast: { title: '识势破敌', description: '本幕三次用克制战术应对敌方来势。', target: 3 },
  capital: { title: '新政有序', description: '在行动前粮草不少于 30 时，累计使用三种不同战术。', target: 3 },
  plain: { title: '料敌先机', description: '两次用克制战术应对来敌。', target: 2 },
};
const TERRAIN_RULES = {
  lake: '湖战演练：火船齐射额外造成 4 点伤害。',
  city: '城巷演练：迂回额外造成 4 点伤害。',
  sea: '海路演练：顺风一路额外造成 5 点伤害；齐射耗粮 6 点。',
  wall: '城防演练：坚守后回复 3 点防线，最多至上限。',
  coast: '海防演练：战术克制额外造成 4 点伤害。',
  capital: '改革推演：每 15 点声望增加 1 点攻势；粮草不低于 60 时损耗减少 2 点。',
};
const fail = message => ({ ok: false, message });
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const modern = state => state?.ruleset === 2;
function hashSeed(seed) {
  let n = 2166136261;
  for (const c of String(seed)) { n ^= c.codePointAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}
function random(state) {
  state.rng = (Math.imul(state.rng >>> 0, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}
function effects(state, effect = {}) {
  const applied = {};
  for (const key of STAT_KEYS) {
    const amount = Number(effect[key]);
    if (!Number.isFinite(amount)) continue;
    const old = state.stats[key];
    state.stats[key] = clamp(old + amount);
    applied[key] = state.stats[key] - old;
  }
  return applied;
}
function validState(state) {
  return state?.version === 1 && state.stats && STAT_KEYS.every(key => Number.isFinite(state.stats[key]) && state.stats[key] >= 0 && state.stats[key] <= 100)
    && state.tags && state.bonds && Array.isArray(state.journal) && Array.isArray(state.companions) && Array.isArray(state.results)
    && Number.isInteger(state.chapter) && state.chapter >= 0 && Number.isInteger(state.event) && state.event >= 0;
}
function note(state, text, detail = {}) {
  state.journal.push({ chapter: state.chapter, text, ...detail });
}
function eventIdentity(event) { return event?.id ?? event?.title ?? event?.question ?? event?.text; }
function currentChapter(state, chapter) {
  if (!chapter || typeof chapter !== 'object') return false;
  if (Number.isInteger(chapter.index) && chapter.index !== state.chapter) return false;
  if (state.activeChapterId != null && chapter.id !== state.activeChapterId) return false;
  return true;
}
export function getDailySeed(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = name => parts.find(p => p.type === name)?.value;
  return `ming-${part('year')}${part('month')}${part('day')}`;
}
export function getDailyModifier(seed) {
  if (!/^ming-\d{8}$/.test(String(seed))) return null;
  return { ...DAILY_MODIFIERS[hashSeed(seed) % DAILY_MODIFIERS.length] };
}
export function createRun(seed, mode = 'story') {
  const safeSeed = String(seed ?? getDailySeed()).slice(0, 100);
  const dailyModifier = mode === 'daily' ? getDailyModifier(safeSeed) : null;
  const state = {
    version: 1, ruleset: 2, seed: safeSeed, mode: mode === 'daily' ? 'daily' : 'story',
    chapter: 0, event: 0, phase: 'companion', activeChapterId: null,
    stats: { people: 60, grain: 65, army: 55, prestige: 50 },
    tags: { 仁心: 0, 谋略: 0, 胆识: 0 }, bonds: {}, journal: [], wins: 0,
    results: [], management: 0, battle: null, companions: [], rng: hashSeed(safeSeed),
    formation: 'balanced', dailyModifier,
  };
  if (dailyModifier?.id === 'lean-granary') effects(state, { grain: -10 });
  if (dailyModifier) note(state, `今日同题 · ${dailyModifier.title}：${dailyModifier.description}`, { type: 'daily-modifier', modifierId: dailyModifier.id });
  return state;
}
export function selectCompanion(state, character) {
  if (!validState(state) || state.phase !== 'companion') return fail('本幕已经选过同行之人。');
  if (!character?.id || !character?.name) return fail('请选择一位同行人物。');
  if (state.companions.some(c => c.chapter === state.chapter)) return fail('本幕已经选过同行之人。');
  const skill = character.skill && STAT_KEYS.includes(character.skill.stat) ? { [character.skill.stat]: character.skill.amount } : {};
  const applied = effects(state, character.bonus ?? character.effects ?? character.effect ?? skill);
  const id = String(character.id);
  state.companions.push({ chapter: state.chapter, id, name: String(character.name) });
  state.bonds[id] = (state.bonds[id] ?? 0) + 1;
  state.phase = 'story';
  note(state, `${character.name}与你同行。`, { type: 'companion', characterId: id, effects: applied });
  return { ok: true, effects: applied };
}
export function applyChoice(state, chapter, event, choiceIndex) {
  if (!validState(state) || state.phase !== 'story') return fail('现在不能作出剧情抉择。');
  if (!currentChapter(state, chapter)) return fail('这不是当前篇章。');
  const currentEvent = chapter.events?.[state.event];
  if (!currentEvent || (event !== currentEvent && eventIdentity(event) !== eventIdentity(currentEvent))) return fail('这段故事已翻篇，请选择当前情节。');
  event = currentEvent;
  if (!event || !Array.isArray(event.choices) || !Number.isInteger(choiceIndex) || !event.choices[choiceIndex]) return fail('这个选项不存在。');
  const identity = eventIdentity(event) ?? `event-${state.event}`;
  if (state.journal.some(entry => entry.type === 'choice' && entry.chapter === state.chapter && entry.eventId === identity)) return fail('这个选择已经记录。');
  const choice = event.choices[choiceIndex];
  state.activeChapterId = chapter.id ?? null;
  const applied = effects(state, choice.effects ?? choice.effect);
  const tags = choice.tags ?? choice.tag;
  if (typeof tags === 'string' && Object.hasOwn(state.tags, tags)) state.tags[tags] += 1;
  else if (Array.isArray(tags)) for (const tag of tags) { if (Object.hasOwn(state.tags, tag)) state.tags[tag] += 1; }
  else if (tags && typeof tags === 'object') for (const [tag, value] of Object.entries(tags)) { if (Object.hasOwn(state.tags, tag) && Number.isFinite(value)) state.tags[tag] = Math.max(0, state.tags[tag] + value); }
  if (choice.bond && Object.hasOwn(state.bonds, choice.bond)) state.bonds[choice.bond] += 1;
  const result = choice.result ?? choice.outcome ?? choice.detail ?? '你的决定已写入长卷。';
  note(state, `${event.title ?? '抉择'}：${choice.text ?? choice.label ?? '已选择'}。${result}`, {
    type: 'choice', eventId: identity, choiceIndex, effects: applied,
  });
  state.event += 1;
  const count = Array.isArray(chapter.events) ? chapter.events.length : 3;
  if (state.event >= count) state.phase = 'manage';
  return { ok: true, effects: applied, message: result, result };
}
export const MANAGEMENT_ACTIONS = {
  relief: { name: '开仓赈济', cost: { grain: 12 }, effects: { grain: -12, people: 12 } },
  train: { name: '整军练兵', cost: { grain: 8 }, effects: { grain: -8, army: 12 } },
  levy: { name: '征调粮赋', cost: { people: 8 }, effects: { people: -8, grain: 14 } },
  diplomacy: { name: '修好通商', cost: { grain: 8 }, effects: { grain: -8, prestige: 12 } },
};
export function setFormation(state, formation) {
  if (!validState(state) || !modern(state)) return fail('旧卷沿用原有战斗规则；另起新卷可体验阵形。');
  if (state.phase !== 'manage') return fail('阵形只能在战前筹备时调整。');
  if (!Object.hasOwn(FORMATIONS, formation)) return fail('请选择有效阵形。');
  state.formation = formation;
  return { ok: true, formation, message: `已采用${FORMATIONS[formation].name}。` };
}
export function manage(state, action) {
  if (!validState(state) || state.phase !== 'manage') return fail('现在不在战前筹备阶段。');
  if (state.management >= 2) return fail('本幕两次筹备机会已经用完。');
  const rule = Object.hasOwn(MANAGEMENT_ACTIONS, action) ? MANAGEMENT_ACTIONS[action] : null;
  if (!rule) return fail('未知的筹备行动。');
  for (const [key, cost] of Object.entries(rule.cost)) if (state.stats[key] < cost) return fail(key === 'grain' ? '粮草不足，无法执行。' : '民心不足，无法继续征调。');
  const applied = effects(state, rule.effects);
  state.management += 1;
  note(state, `${rule.name}，完成第 ${state.management} 次筹备。`, { type: 'manage', action, effects: applied });
  return { ok: true, effects: applied, remaining: 2 - state.management };
}
function nextIntent(state, battle) {
  battle.intent = INTENTS[Math.floor(random(state) * INTENTS.length)];
  battle.lane = Math.floor(random(state) * 3);
  if (battle.terrain === 'sea') battle.wind = Math.floor(random(state) * 3);
}
function makeObjective(terrain) {
  const id = Object.hasOwn(OBJECTIVES, terrain) ? terrain : 'plain';
  return { id, ...OBJECTIVES[id], progress: 0, complete: false };
}
function updateObjective(state, battle, action = null) {
  if (!modern(state) || !battle.objective) return false;
  const goal = battle.objective;
  const wasComplete = goal.complete;
  if (action?.type === 'tactic') {
    let increment = false;
    if (goal.id === 'lake') increment = action.tactic === 'volley';
    else if (goal.id === 'city') increment = action.tactic === 'flank';
    else if (goal.id === 'sea') increment = action.lane === action.wind;
    else if (goal.id === 'wall') increment = action.targeted && action.tactic === 'guard';
    else if (goal.id === 'coast' || goal.id === 'plain') increment = action.counter;
    else if (goal.id === 'capital' && action.grainBefore >= 30) {
      if (!battle.objectiveTactics.includes(action.tactic)) battle.objectiveTactics.push(action.tactic);
      goal.progress = battle.objectiveTactics.length;
    }
    if (increment) goal.progress += 1;
  }
  goal.progress = clamp(goal.progress, 0, goal.target);
  goal.complete = goal.progress >= goal.target;
  return !wasComplete && goal.complete;
}
export function beginBattle(state, chapter) {
  if (!validState(state) || state.phase !== 'manage') return fail('请先完成本幕剧情。');
  if (!currentChapter(state, chapter)) return fail('这不是当前篇章。');
  const rawHP = Number(chapter.mission?.enemyHP ?? 90);
  const addedHP = modern(state) ? 46 + state.chapter * 4 + (state.dailyModifier?.id === 'vanguard' ? 15 : 0) : 0;
  const enemyHP = clamp((Number.isFinite(rawHP) ? Math.round(rawHP) : 90) + addedHP, 20, modern(state) ? 320 : 250);
  const maxHp = 80 + Math.floor(state.stats.army / 4);
  state.battle = {
    turn: 1, enemyHP, enemyMaxHP: enemyHP, maxEnemyHP: enemyHP,
    hp: maxHp, maxHp, intent: 'rush', lane: 1, laneHP: [30, 30, 30],
    log: [], done: false, victory: false, chapterId: chapter.id ?? state.chapter,
    title: chapter.mission?.title ?? chapter.title ?? '本幕演练',
    terrain: chapter.mission?.terrain ?? 'plain',
    terrainRule: TERRAIN_RULES[chapter.mission?.terrain] ?? '据敌来势选择战术与路线，守住这一程。',
  };
  if (modern(state)) {
    const b = state.battle;
    b.formation = Object.hasOwn(FORMATIONS, state.formation) ? state.formation : 'balanced';
    b.volleyCost = (b.terrain === 'sea' ? 6 : 5) + (state.dailyModifier?.id === 'lean-granary' ? 1 : 0);
    b.ability = { charge: 0, maxCharge: 2, used: false };
    b.objective = makeObjective(b.terrain);
    b.objectiveTactics = [];
    b.nextAttackBonus = 0;
    b.guardBonus = 0;
    note(state, `列阵 · ${FORMATIONS[b.formation].name}。本幕目标「${b.objective.title}」：${b.objective.description}`, { type: 'formation', formation: b.formation, objectiveId: b.objective.id });
  }
  nextIntent(state, state.battle);
  state.phase = 'battle';
  return { ok: true, battle: state.battle };
}
function resolveBattle(state, battle, victory, reason) {
  if (battle.done) return;
  updateObjective(state, battle);
  battle.done = true;
  battle.victory = victory;
  battle.reason = reason;
  const applied = effects(state, victory ? { prestige: 10, army: 4, grain: 5 } : { prestige: -5, army: -6, people: -4 });
  if (victory) state.wins += 1;
  const result = {
    chapter: state.chapter, chapterId: battle.chapterId, victory, turns: battle.turn,
    hp: battle.hp, enemyHP: battle.enemyHP, title: battle.title, effects: applied,
  };
  if (modern(state)) {
    result.objectiveComplete = Boolean(battle.objective?.complete);
    result.objectiveBonus = result.objectiveComplete ? 2 : 0;
    result.objectiveTitle = battle.objective?.title ?? '';
    result.formation = battle.formation;
    result.abilityUsed = Boolean(battle.ability?.used);
  }
  state.results.push(result);
  note(state, `${battle.title}：${victory ? '守住了这一程' : '此役未竟，故人仍在'}。`, { type: 'battle', victory, effects: applied });
  state.phase = 'review';
}
export function actBattle(state, tactic, lane) {
  if (!validState(state) || state.phase !== 'battle' || !state.battle || state.battle.done) return fail('这场演练已经结束。');
  if (!TACTICS.includes(tactic)) return fail('请选择有效的战术。');
  if (!Number.isInteger(lane) || lane < 0 || lane > 2) return fail('请选择左、中、右其中一路。');
  const b = state.battle;
  const isNew = modern(state);
  const volleyCost = isNew ? b.volleyCost : b.terrain === 'sea' ? 6 : 5;
  if (tactic === 'volley' && state.stats.grain < volleyCost) return fail(`齐射需要 ${volleyCost} 点粮草。`);
  const counter = COUNTERS[b.intent] === tactic;
  const targeted = lane === b.lane;
  const base = { strike: 15, guard: 7, flank: 12, volley: 13 }[tactic];
  const terrainBonus = (b.terrain === 'lake' && tactic === 'volley' ? 4 : 0)
    + (b.terrain === 'city' && tactic === 'flank' ? 4 : 0)
    + (b.terrain === 'sea' && lane === b.wind ? 5 : 0)
    + (b.terrain === 'coast' && counter ? 4 : 0)
    + (b.terrain === 'capital' ? Math.floor(state.stats.prestige / 15) : 0);
  const formation = isNew ? (FORMATIONS[b.formation] ?? FORMATIONS.balanced) : FORMATIONS.balanced;
  const dailyBonus = isNew && state.dailyModifier?.id === 'favorable-wind' ? (b.terrain === 'sea' ? (lane === b.wind ? 3 : 0) : targeted ? 2 : 0) : 0;
  const chargedDamage = isNew ? b.nextAttackBonus : 0;
  const dealt = Math.max(1, base + Math.floor(state.stats.army / 18) + Math.floor(random(state) * 4) + (counter ? 9 : 0) + (targeted ? 4 : 0) + terrainBonus + formation.damage + dailyBonus + chargedDamage);
  let received = 10 + Math.floor(random(state) * 5) + (b.intent === 'rush' ? 3 : 0) + (!targeted ? 4 : 0) + (isNew ? 2 + Math.floor(state.chapter / 2) : 0);
  if (b.laneHP[b.lane] <= 0) received += 5;
  if (counter) received = Math.max(2, received - 6);
  if (tactic === 'guard') received = Math.max(1, Math.round(received * (targeted ? 0.35 : 0.65)));
  if (tactic === 'strike' && b.intent === 'fortify') received += 4;
  if (b.terrain === 'capital' && state.stats.grain >= 60) received = Math.max(0, received - 2);
  const shielded = isNew ? Math.min(Math.max(0, received + formation.incoming), b.guardBonus) : 0;
  if (isNew) received = Math.max(0, received + formation.incoming - shielded);
  const grainBefore = state.stats.grain;
  if (tactic === 'volley') effects(state, { grain: -volleyCost });
  b.enemyHP = Math.max(0, b.enemyHP - dealt);
  // A decisive hit ends the battle before a defeated enemy can retaliate.
  if (b.enemyHP === 0) received = 0;
  b.hp = Math.max(0, b.hp - received);
  const recovered = b.terrain === 'wall' && tactic === 'guard' && b.hp > 0 ? Math.min(3, b.maxHp - b.hp) : 0;
  b.hp += recovered;
  b.laneHP[b.lane] = Math.max(0, b.laneHP[b.lane] - received);
  const text = `第 ${b.turn} 回合 · ${LANES[lane]}${TACTIC_NAMES[tactic]}${counter ? '，克制敌方' + INTENT_NAMES[b.intent] : ''}${targeted ? '，命中来势' : ''}：造成 ${dealt} 点伤害，承受 ${received} 点损耗${recovered ? `，修复 ${recovered} 点防线` : ''}。`;
  const entry = { turn: b.turn, tactic, lane, enemyIntent: b.intent, enemyLane: b.lane, counter, targeted, dealt, received, recovered, terrainBonus, ...(b.wind === undefined ? {} : { wind: b.wind }), text };
  if (isNew) {
    b.nextAttackBonus = 0;
    b.guardBonus = 0;
    b.ability.charge = Math.min(2, b.ability.charge + 1);
    Object.assign(entry, { type: 'tactic', grainBefore, formation: b.formation, dailyBonus, chargedDamage, shielded });
    entry.objectiveJustCompleted = updateObjective(state, b, entry);
    if (entry.objectiveJustCompleted) entry.text += ` 本幕目标「${b.objective.title}」已达成。`;
  }
  b.log.push(entry);
  if (b.enemyHP <= 0) resolveBattle(state, b, true, 'enemy-defeated');
  else if (b.hp <= 0) resolveBattle(state, b, false, 'defense-broken');
  else if (b.turn >= 8) resolveBattle(state, b, false, 'round-limit');
  else { b.turn += 1; nextIntent(state, b); }
  return { ok: true, ...entry, damage: dealt, incoming: received, done: b.done, victory: b.victory, message: entry.text };
}
export function getCompanionAbility(state) {
  const companion = state?.companions?.find(c => c.chapter === state.chapter);
  const rule = companion && Object.hasOwn(COMPANION_ABILITIES, companion.id) ? COMPANION_ABILITIES[companion.id] : null;
  const b = state?.battle;
  const charge = modern(state) ? clamp(Number(b?.ability?.charge) || 0, 0, 2) : 0;
  const used = modern(state) && Boolean(b?.ability?.used);
  return {
    id: rule ? companion.id : null,
    name: rule?.name ?? '故人相助',
    description: modern(state) ? (rule?.description ?? '本幕暂无可用的故人战技。') : '旧卷沿用原有战斗规则；另起新卷可体验故人战技。',
    ready: Boolean(rule && modern(state) && state.phase === 'battle' && !b?.done && !used && charge >= 2),
    used, charge, maxCharge: 2,
  };
}
export function useCompanionAbility(state) {
  if (!validState(state) || !modern(state) || state.phase !== 'battle' || !state.battle || state.battle.done) return fail('现在不能施展故人战技。');
  const ability = getCompanionAbility(state);
  if (ability.used) return fail('本幕的故人战技已经施展。');
  if (!ability.ready) return fail('先完成两次有效战术，再请故人相助。');
  const rule = COMPANION_ABILITIES[ability.id];
  const b = state.battle;
  b.ability.used = true;
  const healed = Math.min(rule.heal ?? 0, b.maxHp - b.hp);
  b.hp += healed;
  const dealt = Math.min(rule.damage ?? 0, b.enemyHP);
  b.enemyHP -= dealt;
  const applied = effects(state, rule.stats);
  b.nextAttackBonus += rule.nextAttack ?? 0;
  b.guardBonus += rule.shield ?? 0;
  if (rule.forceIntent) b.intent = rule.forceIntent;
  let laneRepair = 0;
  if (rule.lanes) b.laneHP = b.laneHP.map(hp => { const repaired = Math.min(rule.lanes, 30 - hp); laneRepair += repaired; return hp + repaired; });
  if (rule.weakestLane) {
    const lane = b.laneHP.indexOf(Math.min(...b.laneHP));
    laneRepair = Math.min(rule.weakestLane, 30 - b.laneHP[lane]); b.laneHP[lane] += laneRepair;
  }
  updateObjective(state, b);
  const changes = [dealt ? `造成 ${dealt} 点伤害` : '', healed ? `回复 ${healed} 点阵线` : '', laneRepair ? `修复 ${laneRepair} 点分路防线` : '', rule.nextAttack ? `下一击 +${rule.nextAttack}` : '', rule.shield ? `下次抵消 ${rule.shield} 点损耗` : '', rule.forceIntent ? '敌势转为固守' : '', ...Object.entries(applied).filter(([,n]) => n).map(([key,n]) => `${{grain:'粮草',people:'民心',army:'军备',prestige:'声望'}[key]} +${n}`)].filter(Boolean);
  const entry = { type: 'ability', turn: b.turn, abilityId: ability.id, dealt, healed, laneRepair, effects: applied, text: `${ability.name}：${changes.join('，') || '稳住当前阵线'}。不消耗回合。` };
  b.log.push(entry);
  note(state, entry.text, { type: 'ability', abilityId: ability.id });
  if (b.enemyHP <= 0) resolveBattle(state, b, true, 'companion-decisive');
  return { ok: true, ...entry, damage: dealt, done: b.done, victory: b.victory, message: entry.text };
}
export function finishChapter(state) {
  if (!validState(state) || state.phase !== 'review' || !state.battle?.done) return fail('请先完成本幕演练。');
  if (modern(state)) {
    updateObjective(state, state.battle);
    if (state.chapter < 5) {
      const applied = effects(state, { grain: -7, army: -4 });
      note(state, `整顿行装，走向下一幕：行军消耗 ${Math.abs(applied.grain)} 点粮草、${Math.abs(applied.army)} 点军备。资源不足时只扣至零，仍可继续长卷。`, { type: 'journey-cost', effects: applied });
    }
  }
  state.chapter += 1;
  state.event = 0;
  state.management = 0;
  state.battle = null;
  state.activeChapterId = null;
  state.phase = state.chapter >= 6 ? 'ending' : 'companion';
  return { ok: true, phase: state.phase, chapter: state.chapter };
}
export function getEnding(state) {
  if (!validState(state)) return { title: '长卷待启', subtitle: '故事还未开始', text: '与故人同行，留下你的选择。', score: 0, archetype: '初心', characterId: 'zhu_yuanzhang', color: '#a74937' };
  const s = state.stats;
  const tags = state.tags;
  const sum = STAT_KEYS.reduce((n, k) => n + s[k], 0);
  const objectiveBonus = modern(state) ? Math.min(12, state.results.filter(r => r.objectiveComplete).length * 2) : 0;
  const score = Math.round(clamp(sum * 0.15 + state.wins * (40 / 6) + objectiveBonus));
  const max = Math.max(...Object.values(tags));
  const consequence = { title: '风雨未改的归来客', subtitle: '胜负之外，还要看见苍生', text: '军报上的胜负，并不能照亮每一扇窗。你走过这一程，也留下了需要弥补的遗憾；再来一次，试着护住那些没有名字的人。', archetype: '坚韧', characterId: 'ma_huanghou', color: '#737369' };
  let ending;
  if (s.people < 35) {
    ending = consequence;
  } else if (s.people >= 75 && tags.仁心 === max && tags.仁心 > 0) {
    ending = { title: '万家灯火的守望者', subtitle: '功名之外，先见苍生', text: '你把大事写在史册，也把小民放在心上。多少年后，人们或许记不清奏章，却仍记得那一仓粮、那一盏灯。', archetype: '仁心', characterId: 'yu_qian', color: '#507568' };
  } else if (s.grain >= 55 && tags.谋略 === max && tags.谋略 > 0) {
    ending = { title: '经世济民的布局者', subtitle: '一纸筹策，十年回响', text: '你没有只望着眼前的胜负。粮仓、制度与人才，在你的选择里慢慢长成撑起山河的梁柱。', archetype: '谋略', characterId: 'zhang_juzheng', color: '#96723f' };
  } else if (s.army >= 65 && ((tags.胆识 === max && tags.胆识 > 0) || state.wins >= 5)) {
    ending = { title: '山河无恙的执旗人', subtitle: '千里烽烟，身后是家', text: '你知进退，也敢迎风。边关的鼓声终于渐远，同行之人的名字，留在每一道平安归来的城门上。', archetype: '胆识', characterId: 'qi_jiguang', color: '#a24b39' };
  } else if (s.prestige >= 70) {
    ending = { title: '海天万里的问路人', subtitle: '见过天地，仍念故人', text: '你让信任越过城墙，让远路通向相逢。长卷之外，还有海风与新的故事等待你。', archetype: '远见', characterId: 'zheng_he', color: '#416f7c' };
  } else if (state.wins <= 2) {
    ending = { title: '风雨未改的归来客', subtitle: '未必皆胜，仍有来处', text: '你走过遗憾，也没有把故人遗忘。这一卷并非完满，却留下了再来一次的勇气。', archetype: '坚韧', characterId: 'ma_huanghou', color: '#737369' };
  } else {
    ending = { title: '行过山河的知心人', subtitle: '在时代里，做自己的选择', text: '你曾权衡，也曾坚持。没有哪一种人生能包揽所有答案，而你的这一路，自有温度与回声。', archetype: '知行', characterId: 'liu_ji', color: '#6b696f' };
  }
  return { ...ending, score, ...(modern(state) ? { objectiveBonus } : {}) };
}
