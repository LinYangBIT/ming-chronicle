/* Original battlefield artwork and animation. Phaser 3.90.0 is loaded by index.html. */
const WIDTH = 900;
const HEIGHT = 520;
const FONT = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
const LANES = ['左路', '中路', '右路'];
const ROW_Y = [215, 325, 435];
let active = null;

const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function random(seed = 19) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

function path(ctx, points, fill, stroke, width = 1) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function rounded(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
}

function mountain(ctx, points, color, base = 230) {
  path(ctx, [[-40, base], ...points, [940, base]], color);
}

function pavilion(ctx, x, y, scale, roof = '#3e5955', body = '#c4a47a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = body; ctx.fillRect(-43, -46, 86, 46);
  ctx.fillStyle = '#554d3f';
  for (const px of [-35, -12, 12, 35]) ctx.fillRect(px - 2, -46, 4, 46);
  path(ctx, [[-60, -43], [-48, -48], [-35, -59], [0, -74], [35, -59], [48, -48], [60, -43]], roof);
  path(ctx, [[-60, -43], [-36, -46], [0, -63], [36, -46], [60, -43]], null, '#d1b982', 2);
  path(ctx, [[-46, -76], [-30, -80], [0, -95], [30, -80], [46, -76]], roof);
  ctx.fillStyle = body; ctx.fillRect(-24, -76, 48, 18);
  path(ctx, [[-46, -76], [-30, -80], [0, -95], [30, -80], [46, -76]], roof);
  ctx.fillStyle = '#584c3d'; ctx.fillRect(-9, -32, 18, 32);
  ctx.fillStyle = '#d1b982'; ctx.fillRect(-50, 0, 100, 6);
  ctx.restore();
}

function pine(ctx, x, y, scale, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  path(ctx, [[0, 1], [3, -32], [-1, -65]], null, '#596154', 3);
  for (let i = 0; i < 4; i++) {
    const yy = -17 - i * 12;
    path(ctx, [[-26 + i * 5, yy], [-10, yy - 4], [0, yy - 16], [12, yy - 5], [26 - i * 5, yy + 2]], color);
  }
  ctx.restore();
}

function paintLandscape(ctx, terrain) {
  const rnd = random(71);
  const water = ['lake', 'sea', 'coast'].includes(terrain);
  const sea = terrain === 'sea' || terrain === 'coast';
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#ebe0c8'); sky.addColorStop(.42, '#e0d9b9');
  sky.addColorStop(1, water ? '#6f9692' : '#a2ad86');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const sun = ctx.createRadialGradient(630, 75, 8, 630, 75, 130);
  sun.addColorStop(0, '#f9efd3aa'); sun.addColorStop(1, '#f9efd300');
  ctx.fillStyle = sun; ctx.fillRect(450, 0, 360, 240);
  ellipse(ctx, 640, 81, 28, 28, '#d9ad7460');
  mountain(ctx, [[-10, 150], [75, 75], [115, 116], [185, 66], [235, 117], [310, 91], [385, 150], [465, 107], [530, 155], [610, 109], [695, 155], [790, 79], [880, 129]], '#92a69a55', 205);
  mountain(ctx, [[-10, 174], [62, 122], [110, 146], [168, 112], [239, 165], [315, 143], [395, 179], [465, 153], [545, 189], [630, 147], [725, 182], [820, 132], [940, 180]], '#68857955', 233);
  if (water) {
    const lake = ctx.createLinearGradient(0, 180, 0, HEIGHT);
    lake.addColorStop(0, '#9eada0'); lake.addColorStop(.4, '#779b94'); lake.addColorStop(1, '#4c807f');
    ctx.fillStyle = lake; ctx.fillRect(0, 180, WIDTH, HEIGHT - 180);
    for (let i = 0; i < 150; i++) {
      const x = rnd() * WIDTH, y = 190 + rnd() * 330;
      path(ctx, [[x, y], [x + 9 + rnd() * 28, y - 1]], null, i % 3 ? '#dce4ce30' : '#224e4b25');
    }
    path(ctx, [[0, 177], [105, 163], [205, 176], [263, 199], [188, 219], [72, 218], [0, 240]], '#708a69');
    for (let i = 0; i < 7; i++) pine(ctx, 20 + i * 24, 184 + i % 2 * 8, .45 + rnd() * .2, '#385b4c');
    pavilion(ctx, 118, 181, .48);
    path(ctx, [[900, 147], [780, 165], [727, 188], [747, 204], [900, 217]], '#7c8e70');
    if (!sea) pavilion(ctx, 818, 178, .7);
    if (terrain === 'coast') {
      path(ctx, [[0, 475], [77, 459], [140, 487], [218, 509], [233, 520], [0, 520]], '#cbbd91');
      pine(ctx, 38, 499, 1, '#385f53');
    }
  } else {
    const field = ctx.createLinearGradient(0, 180, 0, HEIGHT);
    field.addColorStop(0, '#a8af8b'); field.addColorStop(1, '#6c896e');
    ctx.fillStyle = field; ctx.fillRect(0, 190, WIDTH, HEIGHT - 190);
    path(ctx, [[365, 190], [422, 190], [620, 520], [235, 520]], '#c1b38caa');
    path(ctx, [[382, 190], [420, 280], [420, 365], [444, 520]], null, '#e0cd9d70', 2);
    for (let i = 0; i < 24; i++) {
      const y = 200 + i * 14;
      path(ctx, [[0, y], [300 - i * 2, y + 18]], null, '#d6d4a22b', 2);
      path(ctx, [[620 + i * 2, y + 14], [900, y - 8]], null, '#d6d4a22b', 2);
    }
    for (let i = 0; i < 70; i++) {
      const x = rnd() * WIDTH, y = 200 + rnd() * 320;
      path(ctx, [[x - 3, y], [x, y - 6], [x + 3, y]], null, '#284a3940', 1);
    }
    if (terrain === 'wall') {
      path(ctx, [[0, 160], [180, 145], [285, 174], [440, 149], [545, 177], [715, 137], [900, 161], [900, 199], [710, 177], [550, 211], [435, 184], [285, 209], [180, 181], [0, 199]], '#7b7e67');
      path(ctx, [[0, 159], [180, 144], [285, 173], [440, 148], [545, 176], [715, 136], [900, 160]], null, '#d1c49a', 6);
      for (const [x, y] of [[175, 166], [440, 171], [714, 161]]) {
        ctx.fillStyle = '#8a8970'; ctx.fillRect(x - 21, y - 32, 42, 45);
        pavilion(ctx, x, y - 5, .43, '#445a4c', '#9f9878');
      }
    } else {
      const cityX = terrain === 'capital' ? 625 : 725;
      ctx.fillStyle = '#8c9177'; ctx.fillRect(cityX - 154, 163, 340, 40);
      ctx.fillStyle = '#b6ad89';
      for (let i = 0; i < 23; i++) ctx.fillRect(cityX - 154 + i * 15, 157, 9, 12);
      for (let i = 0; i < 4; i++) {
        path(ctx, [[cityX - 154, 171 + i * 9], [cityX + 186, 171 + i * 9]], null, '#555e4c40');
      }
      pavilion(ctx, cityX, 177, terrain === 'capital' ? 1.1 : .8, '#3e5650', '#b3946e');
      pavilion(ctx, cityX - 105, 169, .52);
      pavilion(ctx, cityX + 108, 166, .52);
      ctx.fillStyle = '#384b43'; ctx.beginPath(); ctx.arc(cityX, 195, 14, Math.PI, 0); ctx.fill();
      ctx.fillRect(cityX - 14, 195, 28, 11);
    }
    for (let i = 0; i < 6; i++) pine(ctx, 24 + i * 31, 192 + i % 2 * 7, .65, '#365746');
    pine(ctx, 24, 504, 1.55, '#2b5143'); pine(ctx, 876, 510, 1.25, '#315547');
  }
  // Fine deterministic paper texture; no external bitmap dependency.
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = i % 2 ? '#fff9df09' : '#182e2509';
    ctx.fillRect(rnd() * WIDTH, rnd() * HEIGHT, rnd() * 2 + .5, .8);
  }
  const vignette = ctx.createRadialGradient(450, 260, 150, 450, 260, 550);
  vignette.addColorStop(0, '#183e3000'); vignette.addColorStop(1, '#163d343c');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function paintUnit(ctx, faction, boat) {
  const ally = faction === 'ally';
  const cloth = ally ? '#ac4637' : '#344d59';
  const trim = '#ebce92';
  const direction = ally ? 1 : -1;
  ctx.save();
  if (!ally) { ctx.translate(128, 0); ctx.scale(-1, 1); }
  ellipse(ctx, 64, 97, boat ? 51 : 38, 7, '#163a3138');
  if (boat) {
    path(ctx, [[9, 73], [112, 73], [101, 90], [28, 91]], '#604b34', '#d5bc7d', 1.3);
    path(ctx, [[13, 74], [60, 82], [112, 73]], null, '#d3ac6c', 2);
    path(ctx, [[59, 76], [59, 13]], null, '#514b37', 3);
    path(ctx, [[61, 17], [92, 22], [101, 63], [61, 65]], '#e4d3a6', '#aa9b70', 1);
    for (let i = 0; i < 4; i++) path(ctx, [[61, 28 + i * 9], [94 + i * 2, 30 + i * 10]], null, '#c6b68b', 1);
    ctx.fillStyle = cloth; ctx.fillRect(72, 34, 17, 20);
    path(ctx, [[38, 78], [22, 101]], null, '#cab17b', 2);
    path(ctx, [[84, 82], [70, 105]], null, '#cab17b', 2);
  }
  for (const [x, y] of boat ? [[28, 69], [45, 72], [103, 69]] : [[38, 92], [61, 86], [84, 94]]) {
    const scale = boat ? .72 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    path(ctx, [[-7, -1], [-8, -20], [8, -20], [8, -1]], cloth);
    path(ctx, [[-7, -17], [0, -8], [7, -17]], null, '#d1b57b', 1);
    ctx.fillStyle = '#253c39'; ctx.fillRect(-7, -2, 5, 7); ctx.fillRect(3, -2, 5, 7);
    ellipse(ctx, 0, -27, 6.8, 7.5, '#d6b287');
    path(ctx, [[-9, -27], [-6, -36], [0, -40], [6, -36], [9, -27]], '#515c55', '#d2c08b', 1);
    path(ctx, [[11, 1], [13, -46]], null, '#5a523d', 2);
    path(ctx, [[10, -44], [13, -54], [16, -44]], trim);
    ctx.restore();
  }
  const poleX = boat ? 32 : 22;
  path(ctx, [[poleX, 79], [poleX, 10]], null, '#534b35', 2.2);
  path(ctx, [[poleX + 1, 12], [poleX + 29, 17], [poleX + 26, 40], [poleX + 1, 35]], cloth, trim, 1);
  // Render a seal instead of mirrored lettering on enemy pennants.
  rounded(ctx, poleX + 9, 20, 11, 12, 1, null, trim);
  path(ctx, [[poleX + 11, 24], [poleX + 18, 24], [poleX + 15, 31]], null, trim, 1);
  ctx.restore();
  return direction;
}

function createCanvasTexture(scene, key, width, height, painter) {
  const texture = scene.textures.createCanvas(key, width, height);
  painter(texture.context);
  texture.refresh();
}

function text(scene, x, y, content, size = 16, color = '#f7ebcf', extra = {}) {
  return scene.add.text(x, y, content, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...extra });
}

function laneNumber(value, fallback = 1) {
  if (typeof value === 'string') {
    const found = LANES.indexOf(value);
    if (found !== -1) return found;
  }
  return clamp(Math.round(number(value, fallback)), 0, 2);
}

function battleData(state) {
  const b = state?.battle;
  if (!b || typeof b !== 'object') return null;
  return b;
}

function refreshScene(record, animate = true) {
  const scene = record.scene;
  if (!scene || !record.ready) return;
  const state = record.state || {};
  const battle = battleData(state);
  const chosen = laneNumber(state.selectedLane, 1);
  const intent = battle?.intent;
  const target = typeof intent === 'object' && intent !== null && intent.lane !== undefined
    ? laneNumber(intent.lane) : battle?.lane !== undefined ? laneNumber(battle.lane) : null;
  const running = Boolean(battle && !battle.done);
  const hp = Math.max(0, number(battle?.hp, 100));
  const maxHp = Math.max(1, number(battle?.maxHp, 100));
  const enemyHP = Math.max(0, number(battle?.enemyHP, 100));
  const enemyMax = Math.max(1, number(battle?.maxEnemyHP, record.enemyMax || Math.max(enemyHP, 100)));
  if (battle) record.enemyMax = enemyMax;
  record.selection.clear();
  record.selection.lineStyle(2, 0xf4dc9e, .95);
  record.selection.fillStyle(0xf8de99, .08);
  record.selection.fillRoundedRect(64, ROW_Y[chosen] - 44, 772, 88, 12);
  record.selection.strokeRoundedRect(64, ROW_Y[chosen] - 44, 772, 88, 12);
  record.laneNames.forEach((label, index) => {
    label.setColor(index === chosen ? '#fff0c6' : '#e0e6d2');
    record.selectedMarks[index].setVisible(index === chosen);
    record.intentMarks[index].setVisible(running && index === target);
  });
  const bars = record.bars;
  bars.clear(); bars.fillStyle(0x1c3c34, .65);
  bars.fillRoundedRect(154, 84, 234, 7, 3); bars.fillRoundedRect(512, 84, 234, 7, 3);
  bars.fillStyle(0xe9c37a, 1); bars.fillRoundedRect(154, 84, 234 * clamp(hp / maxHp, 0, 1), 7, 3);
  bars.fillStyle(0xd48a78, 1); bars.fillRoundedRect(512, 84, 234 * clamp(enemyHP / enemyMax, 0, 1), 7, 3);
  record.hpText.setText(battle ? `${Math.ceil(hp)} / ${maxHp}` : '整军待发');
  record.enemyText.setText(battle ? `${Math.ceil(enemyHP)} / ${enemyMax}` : '静观敌势');
  record.turnText.setText(battle ? `第 ${Math.max(1, number(battle.turn, 1))} 回合` : '山河无言 · 风云将起');
  let intentLabel = typeof intent === 'string' ? intent : intent?.label || intent?.name || intent?.type || '';
  if (typeof intentLabel !== 'string') intentLabel = '';
  intentLabel = { rush: '突进', fortify: '固守', ambush: '伏击' }[intentLabel] || intentLabel;
  record.intentText.setText(running
    ? `敌情 · ${intentLabel || '两军对垒'}${target !== null ? ` · ${LANES[target]}` : ''}`
    : battle?.done ? (battle.victory ? '大局已定 · 军旗仍在风中' : '胜负有时 · 且待东山再起') : '点选一路，观山川形势');
  record.result.setVisible(Boolean(battle?.done));
  record.resultText.setText(battle?.victory ? '此役告捷' : '暂且收兵');
  if (animate && battle && record.lastHP !== null && hp < record.lastHP) {
    scene.tweens.add({ targets: record.allies, x: '-=8', duration: 70, yoyo: true, repeat: 2 });
    scene.cameras.main.shake(150, .002);
  }
  if (animate && battle && record.lastEnemyHP !== null && enemyHP < record.lastEnemyHP) {
    scene.tweens.add({ targets: record.enemies, x: '+=9', duration: 75, yoyo: true, repeat: 2 });
    const burst = scene.add.circle(638, ROW_Y[chosen], 28, 0xffdf9c, .35).setDepth(9);
    scene.tweens.add({ targets: burst, scale: 2.2, alpha: 0, duration: 420, onComplete: () => burst.destroy() });
  }
  record.lastHP = battle ? hp : null;
  record.lastEnemyHP = battle ? enemyHP : null;
}

/** Mount one independently owned Phaser canvas. Re-mounting destroys the previous game. */
export function mountScene(container, chapter = {}, state = {}, onLane = () => {}) {
  destroyScene();
  const Phaser = globalThis.Phaser;
  if (!Phaser) throw new Error('Phaser 引擎尚未加载');
  const parent = typeof container === 'string' ? document.querySelector(container) : container;
  if (!parent) throw new Error('找不到战场容器');
  const terrain = chapter.mission?.terrain || 'city';
  const boat = ['lake', 'sea', 'coast'].includes(terrain);
  const record = { game: null, scene: null, state, ready: false, observer: null, lastHP: null, lastEnemyHP: null, enemyMax: null };
  active = record;

  class Battlefield extends Phaser.Scene {
    constructor() { super({ key: 'MingBattlefield' }); }
    create() {
      if (active !== record) return;
      record.scene = this;
      createCanvasTexture(this, 'landscape', WIDTH, HEIGHT, ctx => paintLandscape(ctx, terrain));
      createCanvasTexture(this, 'ally-unit', 128, 112, ctx => paintUnit(ctx, 'ally', boat));
      createCanvasTexture(this, 'enemy-unit', 128, 112, ctx => paintUnit(ctx, 'enemy', boat));
      this.add.image(WIDTH / 2, HEIGHT / 2, 'landscape');

      const veil = this.add.graphics().setDepth(1);
      veil.fillStyle(0x1b3b34, .81); veil.fillRoundedRect(126, 28, 648, 81, 12);
      veil.lineStyle(1, 0xd5bd7f, .38); veil.strokeRoundedRect(126, 28, 648, 81, 12);
      text(this, 154, 43, '我军', 17, '#f3dfac', { fontStyle: 'bold' }).setDepth(2);
      text(this, 512, 43, '敌军', 17, '#f0c5b3', { fontStyle: 'bold' }).setDepth(2);
      record.hpText = text(this, 387, 47, '', 13).setOrigin(1, 0).setDepth(2);
      record.enemyText = text(this, 746, 47, '', 13).setOrigin(1, 0).setDepth(2);
      text(this, 450, 56, '对阵', 16, '#c4c6a9').setOrigin(.5).setDepth(2);
      record.bars = this.add.graphics().setDepth(2);
      record.turnText = text(this, 450, 126, '', 12, '#344f43', { letterSpacing: 2 }).setOrigin(.5).setDepth(2);
      record.intentText = text(this, 450, 151, '', 15, '#274b40', { fontStyle: 'bold' }).setOrigin(.5).setDepth(2);

      record.selection = this.add.graphics().setDepth(3);
      record.laneNames = []; record.selectedMarks = []; record.intentMarks = [];
      record.allies = []; record.enemies = [];
      ROW_Y.forEach((y, lane) => {
        const row = this.add.rectangle(450, y, 772, 88, 0x143d34, .13).setDepth(2);
        row.setStrokeStyle(1, 0xf3e7bf, .14).setInteractive({ useHandCursor: true });
        row.on('pointerup', () => { if (active === record) onLane(lane); });
        row.on('pointerover', () => row.setFillStyle(0x153c33, .23));
        row.on('pointerout', () => row.setFillStyle(0x153c33, .13));
        const label = text(this, 92, y - 12, LANES[lane], 17, '#e0e6d2', { fontStyle: 'bold' }).setDepth(7);
        record.laneNames.push(label);
        record.selectedMarks.push(text(this, 92, y + 13, '已布阵', 10, '#f5dfaa').setDepth(7));
        record.intentMarks.push(text(this, 800, y + 18, '敌袭', 11, '#ffe1c2', { backgroundColor: '#9a4b3b', padding: { x: 5, y: 3 } }).setOrigin(1, .5).setDepth(7));
        const divider = this.add.graphics().setDepth(3);
        divider.lineStyle(1, 0xe1dcba, .4);
        for (let j = 0; j < 5; j++) divider.lineBetween(450, y - 27 + j * 12, 450, y - 22 + j * 12);
        for (let i = 0; i < 2; i++) {
          const yy = y + 5 + i * 4;
          const ally = this.add.image(235 + i * 94, yy, 'ally-unit').setScale(boat ? .85 : .8).setDepth(5 + i);
          const enemy = this.add.image(665 - i * 94, yy, 'enemy-unit').setScale(boat ? .85 : .8).setDepth(5 + i);
          record.allies.push(ally); record.enemies.push(enemy);
          this.tweens.add({ targets: [ally, enemy], y: yy - (boat ? 3 : 1), duration: 1800 + lane * 300 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      });

      // Slow wind and mist bring the illustration to life without a busy game loop.
      createCanvasTexture(this, 'mist', 420, 66, ctx => {
        const grad = ctx.createRadialGradient(210, 33, 2, 210, 33, 210);
        grad.addColorStop(0, '#e2e7d34d'); grad.addColorStop(1, '#e2e7d300');
        ctx.fillStyle = grad; ctx.scale(1, .2); ctx.beginPath(); ctx.arc(210, 165, 210, 0, Math.PI * 2); ctx.fill();
      });
      [177, 389, 504].forEach((y, i) => {
        const fog = this.add.image(100 + i * 230, y, 'mist').setAlpha(.55).setDepth(8);
        this.tweens.add({ targets: fog, x: '+=75', duration: 11000 + i * 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      });
      for (let i = 0; i < 7; i++) {
        const mote = this.add.circle(80 + i * 119, 130 + i * 44, 1 + i % 2, 0xf4df9e, .38).setDepth(8);
        this.tweens.add({ targets: mote, x: '+=38', y: '-=16', alpha: .05, duration: 3000 + i * 600, yoyo: true, repeat: -1 });
      }
      const seal = this.add.container(450, 287).setDepth(12).setVisible(false);
      const sealBg = this.add.rectangle(0, 0, 244, 86, 0x173b31, .95).setStrokeStyle(2, 0xd9ba72, .95);
      record.resultText = text(this, 0, 0, '', 34, '#f5dfaa', { fontStyle: 'bold', letterSpacing: 6 }).setOrigin(.5);
      seal.add([sealBg, record.resultText]); record.result = seal;
      text(this, 450, 503, boat ? '一江风浪 · 千帆竞渡' : '旌旗所向 · 山河故人', 11, '#eee3be', { letterSpacing: 3 }).setOrigin(.5).setDepth(9);
      record.ready = true;
      refreshScene(record, false);
      if (record.game?.canvas) {
        record.game.canvas.setAttribute('role', 'img');
        record.game.canvas.setAttribute('aria-label', '明朝战场示意图：左路、中路、右路。可使用画布外的布阵按钮操作。');
      }
    }
  }

  record.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#c7c7a4',
    transparent: false,
    antialias: true,
    audio: { noAudio: true },
    render: { roundPixels: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: WIDTH, height: HEIGHT },
    scene: Battlefield,
    banner: false,
    fps: { target: 30, forceSetTimeOut: false },
  });
  if (typeof ResizeObserver !== 'undefined') {
    record.observer = new ResizeObserver(() => {
      if (active === record && record.game?.scale && parent.isConnected) record.game.scale.refresh();
    });
    record.observer.observe(parent);
  }
  return record.game;
}

/** Synchronize visual state only; gameplay decisions remain in the application. */
export function updateScene(state = {}) {
  if (!active) return;
  active.state = state;
  refreshScene(active);
}

/** Remove owned observers, animations, textures, listeners and canvas. */
export function destroyScene() {
  const previous = active;
  active = null;
  if (!previous) return;
  previous.observer?.disconnect();
  previous.ready = false;
  if (previous.game) {
    previous.game.destroy(true);
    // Phaser finalizes destruction on the next frame. Detach immediately when
    // a parent re-render is about to mount a replacement canvas in the same node.
    previous.game.canvas?.remove();
  }
  previous.scene = null;
}

/** Pause only the owned animation scene, retaining the current turn and canvas. */
export function pauseScene(paused = true) {
 if (!active?.game) return;
 if (paused) active.game.scene.pause('MingBattlefield');
 else active.game.scene.resume('MingBattlefield');
}
