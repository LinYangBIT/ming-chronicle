/** Original procedural score: D-pentatonic themes, plucked strings, soft reeds,
 * sustained open harmonies and restrained frame-drum/wood percussion.
 * No recordings or third-party compositions. The 32-bar arrangement is scheduled
 * against AudioContext.currentTime; UI/frame rate never determines its tempo. */
const STORAGE_KEY = 'ming-chronicle-audio-v2';
const DEFAULTS = { musicEnabled: true, sfxEnabled: true, musicVolume: 0.55, sfxVolume: 0.7 };
const SCENES = {
  menu: { bpm: 72, melody: 0.074, pad: 0.019, percussion: 0.018 },
  story: { bpm: 78, melody: 0.071, pad: 0.017, percussion: 0.023 },
  battle: { bpm: 112, melody: 0.082, pad: 0.018, percussion: 0.052 },
  ending: { bpm: 68, melody: 0.074, pad: 0.023, percussion: 0.015 },
};
const SCALE = [62, 64, 66, 69, 71, 74, 76, 78];
const HARMONIES = [[50, 57, 62], [47, 54, 59], [45, 52, 57], [50, 57, 62]];
// Four original two-bar phrases. Nulls leave space for the strings to ring.
const CALM = [
  [0, null, 2, 3, null, 2, 1, null], [2, null, 1, null, 0, null, null, null],
  [3, null, 4, 5, null, 4, 2, null], [1, 2, 3, null, 2, null, 0, null],
  [4, null, 5, null, 3, 2, 1, null], [2, null, 3, 4, null, 2, 0, null],
  [1, 2, 3, null, 5, null, 4, 2], [1, null, 2, null, 0, null, null, null],
];
const TENSION = [
  [0, 2, 3, 2, 4, 3, 2, 1], [0, null, 0, 2, 3, 2, 1, null],
  [3, 4, 5, 4, 3, 2, 1, 2], [3, null, 2, 1, 0, null, 0, null],
];
const win = () => typeof window === 'undefined' ? null : window;
const doc = () => typeof document === 'undefined' ? null : document;
const clamp = value => Math.max(0, Math.min(1, value));
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
let settings = readSettings();
let context = null, musicBus = null, sfxBus = null, master = null, analyser = null, meterData = null;
let initialized = false, unlocked = false, paused = false, pageHidden = false, scene = 'menu';
let interval = null, nextStepAt = 0, step = 0, track = null, generation = 0, lastError = '';
let notesScheduled = 0, stepsScheduled = 0, loopsStarted = 0, lifecycle = 0;
const voices = new Set(), cleanupTimers = new Set(), pluckBuffers = new Map(), sfxTimes = new Map();
let noiseBuffer = null, gestureListeners = false;
const hidden = () => pageHidden || Boolean(doc()?.hidden);
const canMusic = () => settings.musicEnabled && settings.musicVolume > 0 && !paused && !hidden();
const canSfx = () => settings.sfxEnabled && settings.sfxVolume > 0 && !paused && !hidden();

function readSettings() {
  const result = { ...DEFAULTS };
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? 'null');
    if (saved && typeof saved === 'object') for (const key of Object.keys(DEFAULTS)) {
      if (typeof DEFAULTS[key] === 'boolean' && typeof saved[key] === 'boolean') result[key] = saved[key];
      if (typeof DEFAULTS[key] === 'number' && typeof saved[key] === 'number' && Number.isFinite(saved[key])) result[key] = clamp(saved[key]);
    }
  } catch { /* A damaged or blocked local preference does not prevent play. */ }
  return result;
}
function persist() { try { globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* local-only preference unavailable */ } }
function smooth(param, value, seconds = 0.12) {
  if (!context || !param) return;
  const now = context.currentTime;
  try {
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else { param.cancelScheduledValues(now); param.setValueAtTime(param.value, now); }
    param.linearRampToValueAtTime(value, now + seconds);
  } catch { param.value = value; }
}
function later(fn, milliseconds) {
  const id = setTimeout(() => { cleanupTimers.delete(id); fn(); }, milliseconds);
  cleanupTimers.add(id); return id;
}
function makeContext() {
  if (context && context.state !== 'closed') return context;
  const AudioContextClass = win()?.AudioContext || win()?.webkitAudioContext;
  if (!AudioContextClass) { lastError = '当前浏览器不支持 Web Audio；游戏仍可继续。'; return null; }
  try {
    context = new AudioContextClass({ latencyHint: 'interactive' });
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16; compressor.knee.value = 18; compressor.ratio.value = 4;
    compressor.attack.value = 0.008; compressor.release.value = 0.2;
    master = context.createGain(); master.gain.value = 0.72;
    musicBus = context.createGain(); musicBus.gain.value = settings.musicVolume;
    sfxBus = context.createGain(); sfxBus.gain.value = settings.sfxVolume;
    analyser = context.createAnalyser(); analyser.fftSize = 256;
    meterData = new Float32Array(analyser.fftSize);
    musicBus.connect(master); sfxBus.connect(master); master.connect(compressor);
    compressor.connect(analyser); analyser.connect(context.destination);
    context.onstatechange = () => {
      if (!initialized) return;
      if (context.state === 'running') {
        unlocked = true; lastError = ''; removeGestureListeners(); reconcile();
      } else { stopMusic(0.04); if (!hidden() && !paused) addGestureListeners(); }
    };
    return context;
  } catch (error) { lastError = `音频暂未就绪：${error?.message || '初始化失败'}`; return null; }
}
function ensureRunning() {
  const ctx = makeContext();
  if (!ctx || paused || hidden()) return Promise.resolve(false);
  const life = lifecycle;
  // Call resume synchronously inside the genuine input handler. An earlier
  // autoplay resume may still be pending; it must not suppress this attempt.
  let resumed;
  try { resumed = ctx.state === 'running' ? Promise.resolve() : ctx.resume(); }
  catch (error) { resumed = Promise.reject(error); }
  return Promise.resolve(resumed).then(() => {
    if (life !== lifecycle || !initialized || context !== ctx || ctx.state !== 'running' || paused || hidden()) return false;
    unlocked = true; lastError = ''; removeGestureListeners(); reconcile(); return true;
  }).catch(error => {
    if (life === lifecycle) {
      lastError = error?.name === 'NotAllowedError' ? '等待首次点击或按键，音乐将自动开始。' : '音频尚未解锁，可在下次操作时重试。';
      addGestureListeners();
    }
    return false;
  });
}
function gesture() { if (!paused && !hidden() && (settings.musicEnabled || settings.sfxEnabled)) void ensureRunning(); }
function addGestureListeners() {
  if (!initialized || gestureListeners || !doc()) return;
  gestureListeners = true;
  for (const name of ['pointerdown', 'pointerup', 'keydown']) doc().addEventListener(name, gesture, { capture: true, passive: true });
}
function removeGestureListeners() {
  if (!gestureListeners || !doc()) return;
  for (const name of ['pointerdown', 'pointerup', 'keydown']) doc().removeEventListener(name, gesture, true);
  gestureListeners = false;
}
function finishVoice(voice) {
  if (!voices.delete(voice)) return;
  for (const node of voice.nodes) { try { node.disconnect(); } catch { /* already detached */ } }
}
function registerVoice(source, nodes, channel, endAt) {
  const voice = { source, nodes, channel, generation, endAt };
  voices.add(voice); source.onended = () => finishVoice(voice);
  source.stop(endAt); return voice;
}
function voiceLimit(channel) { return [...voices].filter(v => v.channel === channel).length < (channel === 'music' ? 32 : 12); }
function outputFor(channel) { return channel === 'music' ? track : sfxBus; }
function shapedSource(source, channel, at, duration, volume, pan = 0, attack = 0.008, release = 0.18, filterHz = 4800) {
  const output = outputFor(channel);
  if (!context || !output || !voiceLimit(channel)) return false;
  const gain = context.createGain(), filter = context.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = filterHz; filter.Q.value = 0.5;
  const nodes = [source, filter, gain];
  const endAt = at + Math.max(duration, attack + release + 0.02);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(volume, at + attack);
  gain.gain.setValueAtTime(volume * 0.64, Math.max(at + attack, endAt - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
  source.connect(filter); filter.connect(gain);
  if (context.createStereoPanner) {
    const panner = context.createStereoPanner(); panner.pan.value = pan;
    gain.connect(panner); panner.connect(output); nodes.push(panner);
  } else gain.connect(output);
  source.start(at); registerVoice(source, nodes, channel, endAt + 0.02);
  if (channel === 'music') notesScheduled += 1;
  return true;
}
function pluckBuffer(midi) {
  const key = `${midi}:${context.sampleRate}`;
  if (pluckBuffers.has(key)) return pluckBuffers.get(key);
  const duration = 1.9, length = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate), data = buffer.getChannelData(0);
  const period = Math.max(4, Math.round(context.sampleRate / frequency(midi))), ring = new Float32Array(period);
  let seed = (midi * 8179 + 139) >>> 0;
  for (let i = 0; i < period; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    ring[i] = (seed / 2147483648 - 1) * 0.65 + Math.sin(i / period * Math.PI * 2) * 0.35;
  }
  for (let i = 0; i < length; i++) {
    const pos = i % period;
    data[i] = ring[pos] * (1 - i / length);
    ring[pos] = 0.497 * (ring[pos] + ring[(pos + 1) % period]);
  }
  if (pluckBuffers.size >= 40) pluckBuffers.delete(pluckBuffers.keys().next().value);
  pluckBuffers.set(key, buffer); return buffer;
}
function pluck(midi, at, volume, pan = 0, channel = 'music', duration = 1.7) {
  if (!context || !voiceLimit(channel)) return;
  const source = context.createBufferSource(); source.buffer = pluckBuffer(midi);
  shapedSource(source, channel, at, duration, volume, pan, 0.006, duration * 0.7, 4800);
}
function tone(midi, at, duration, volume, type = 'sine', pan = 0, channel = 'music', attack = 0.1) {
  if (!context || !voiceLimit(channel)) return;
  const source = context.createOscillator(); source.type = type; source.frequency.value = frequency(midi);
  shapedSource(source, channel, at, duration, volume, pan, attack, Math.min(0.5, duration * 0.35), type === 'triangle' ? 1600 : 4200);
}
function noise() {
  if (noiseBuffer) return noiseBuffer;
  noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.2), context.sampleRate);
  const data = noiseBuffer.getChannelData(0); let seed = 617;
  for (let i = 0; i < data.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; data[i] = seed / 2147483648 - 1; }
  return noiseBuffer;
}
function percussion(at, volume, wood = false, channel = 'music') {
  if (!context || !voiceLimit(channel)) return;
  if (wood) {
    const source = context.createBufferSource(); source.buffer = noise();
    shapedSource(source, channel, at, 0.09, volume * 0.5, 0.22, 0.002, 0.07, 2300);
  } else {
    const source = context.createOscillator(); source.type = 'sine';
    source.frequency.setValueAtTime(112, at); source.frequency.exponentialRampToValueAtTime(49, at + 0.18);
    shapedSource(source, channel, at, 0.32, volume, -0.1, 0.004, 0.28, 900);
  }
}
function arrange(at, tick) {
  const score = SCENES[scene], beat = 60 / score.bpm;
  const bar = Math.floor(tick / 8) % 32, eighth = tick % 8, section = Math.floor(bar / 8);
  const chord = HARMONIES[Math.floor(bar / 2) % HARMONIES.length];
  const battle = scene === 'battle';
  const phrase = battle ? TENSION[(bar + section) % 4] : CALM[(bar + (section === 1 ? 2 : section === 3 ? 4 : 0)) % 8];
  let degree = phrase[eighth];
  // The third eight-bar passage answers the opening with small, consonant turns.
  if (degree !== null && section === 2 && eighth === 6) degree = Math.min(7, degree + 1);
  const cadenceRest = !battle && bar === 31 && eighth > 2;
  if (degree !== null && !cadenceRest) {
    const note = SCALE[degree];
    pluck(note, at, score.melody, eighth % 4 === 0 ? -0.18 : 0.18, 'music', Math.min(1.8, beat * 2.2));
    if ((section === 1 || section === 3 || scene === 'ending') && eighth === 0)
      tone(note, at + 0.035, beat * 2.7, 0.018, 'sine', 0.3, 'music', 0.2);
  }
  if (eighth === 0) {
    chord.forEach((note, index) => tone(note, at, beat * 4.1, score.pad, 'sine', (index - 1) * 0.28, 'music', 0.3));
    tone(chord[0] - 12, at, beat * 1.7, 0.038, 'triangle', 0, 'music', 0.025);
    if (battle || scene === 'story' || bar % 2 === 0) percussion(at, score.percussion);
  }
  if (battle) {
    if (eighth === 4) { percussion(at, score.percussion * 0.8); tone(chord[0] - 12, at, beat * 1.3, 0.036, 'triangle', 0, 'music', 0.02); }
    if (eighth % 2 === 1) pluck(chord[eighth % 3], at, 0.033, -0.32, 'music', beat * 0.8);
    if (eighth === 2 || eighth === 6) percussion(at, 0.04, true);
  } else if (section !== 0 && (eighth === 3 || eighth === 7) && !cadenceRest) percussion(at, score.percussion * 0.6, true);
}
function schedule() {
  if (!context || context.state !== 'running' || !canMusic() || !track) { stopMusic(0.05); return; }
  const now = context.currentTime;
  // A throttled tab/device must never catch up with a burst of old notes.
  if (nextStepAt < now - 0.2) nextStepAt = now + 0.04;
  let count = 0;
  while (nextStepAt < now + 0.15 && count++ < 4) {
    arrange(nextStepAt, step); step = (step + 1) % 256; stepsScheduled += 1;
    nextStepAt += 30 / SCENES[scene].bpm;
  }
}
function startMusic() {
  if (interval !== null || !context || context.state !== 'running' || !canMusic()) return;
  track = context.createGain(); track.gain.setValueAtTime(0.0001, context.currentTime);
  track.gain.linearRampToValueAtTime(1, context.currentTime + 0.4); track.connect(musicBus);
  generation += 1; loopsStarted += 1; nextStepAt = context.currentTime + 0.045;
  interval = setInterval(schedule, 25); schedule();
}
function stopChannel(channel, fade = 0.08) {
  if (!context) return;
  const stopAt = context.currentTime + fade + 0.025;
  const ending = [...voices].filter(voice => voice.channel === channel);
  for (const voice of ending) {
    smooth(voice.nodes[2]?.gain, 0, fade);
    try { voice.source.stop(Math.min(voice.endAt, stopAt)); } catch { finishVoice(voice); }
  }
  if (ending.length) later(() => ending.forEach(finishVoice), (fade + 0.1) * 1000);
}
function stopMusic(fade = 0.12) {
  if (interval !== null) { clearInterval(interval); interval = null; }
  const old = track; track = null;
  if (old) { smooth(old.gain, 0, fade); stopChannel('music', fade); later(() => { try { old.disconnect(); } catch { /* detached */ } }, (fade + 0.08) * 1000); }
}
function reconcile() {
  if (!initialized || !context) return;
  smooth(musicBus?.gain, settings.musicVolume); smooth(sfxBus?.gain, settings.sfxEnabled ? settings.sfxVolume : 0);
  if (canMusic() && context.state === 'running') startMusic(); else stopMusic();
}
function quietAndSuspend() {
  stopMusic(0.045); stopChannel('sfx', 0.04); smooth(master?.gain, 0, 0.04);
  const ctx = context, life = lifecycle;
  later(() => {
    if (ctx && ctx === context && life === lifecycle && (paused || hidden())) void ctx.suspend().catch(() => {});
  }, 75);
}
function onVisibility() {
  if (hidden()) quietAndSuspend();
  else if (!paused) { smooth(master?.gain, 0.72, 0.15); if (settings.musicEnabled || settings.sfxEnabled) void ensureRunning(); }
}
function onPageHide(event) { pageHidden = true; if (event.persisted) quietAndSuspend(); else disposeAudio(); }
function onPageShow() { pageHidden = false; onVisibility(); }

export function initAudio() {
  if (initialized) return getAudioSettings();
  initialized = true; pageHidden = false; addGestureListeners();
  doc()?.addEventListener('visibilitychange', onVisibility);
  win()?.addEventListener('pagehide', onPageHide);
  win()?.addEventListener('pageshow', onPageShow);
  if (!paused && !hidden() && (settings.musicEnabled || settings.sfxEnabled)) void ensureRunning();
  return getAudioSettings();
}
export function soundEnabled() { return settings.musicEnabled; }
export function toggleSound() { setAudioSetting('musicEnabled', !settings.musicEnabled); return settings.musicEnabled; }
export function getAudioSettings() { return { ...settings }; }
export function setAudioSetting(key, value) {
  if (!Object.hasOwn(DEFAULTS, key)) return getAudioSettings();
  if (typeof DEFAULTS[key] === 'boolean') { if (typeof value !== 'boolean') return getAudioSettings(); settings[key] = value; }
  else { if (typeof value !== 'number' || !Number.isFinite(value)) return getAudioSettings(); settings[key] = clamp(value); }
  persist(); initAudio();
  if (!settings.sfxEnabled || settings.sfxVolume === 0) { smooth(sfxBus?.gain, 0, 0.05); stopChannel('sfx', 0.05); }
  reconcile();
  if (!paused && !hidden() && (settings.musicEnabled || settings.sfxEnabled)) void ensureRunning();
  return getAudioSettings();
}
export function setAudioScene(nextScene) {
  if (!Object.hasOwn(SCENES, nextScene)) return scene;
  if (nextScene !== scene) { stopMusic(0.24); scene = nextScene; step = 0; }
  initAudio(); reconcile(); return scene;
}
export function setAudioPaused(value) {
  const next = Boolean(value);
  if (paused === next) return paused;
  paused = next;
  if (paused) quietAndSuspend();
  else { initAudio(); smooth(master?.gain, 0.72, 0.18); if (!hidden() && (settings.musicEnabled || settings.sfxEnabled)) void ensureRunning(); }
  return paused;
}
export function chime(kind = 'tap') {
  initAudio(); if (!canSfx()) return;
  const now = Date.now(), last = sfxTimes.get(kind) ?? -Infinity;
  if (now - last < (kind === 'win' || kind === 'lose' ? 450 : 80)) return;
  sfxTimes.set(kind, now);
  void ensureRunning().then(ready => {
    if (!ready || !canSfx() || Date.now() - now > 600) return;
    const at = context.currentTime + 0.008;
    if (kind === 'hit' || kind === 'battle') { percussion(at, 0.18, false, 'sfx'); pluck(50, at, 0.15, 0, 'sfx', 0.45); return; }
    if (kind === 'guard') { pluck(57, at, 0.16, 0, 'sfx', 0.65); percussion(at + 0.04, 0.12, true, 'sfx'); return; }
    const notes = kind === 'win' ? [62, 66, 69, 74] : kind === 'lose' || kind === 'error' ? [64, 62, 57] : kind === 'choice' ? [66, 69] : [69];
    notes.forEach((note, index) => pluck(note, at + index * 0.105, kind === 'win' ? 0.2 : 0.15, (index % 2 ? 0.1 : -0.1), 'sfx', kind === 'win' ? 1.15 : 0.7));
  });
}
export function getAudioStatus() {
  let outputLevel = 0;
  if (analyser && meterData && context?.state === 'running') {
    try { analyser.getFloatTimeDomainData(meterData); outputLevel = Math.sqrt(meterData.reduce((sum, value) => sum + value * value, 0) / meterData.length); } catch { /* Meter is optional. */ }
  }
  return {
    supported: Boolean(win()?.AudioContext || win()?.webkitAudioContext), scene,
    contextState: context?.state ?? 'uninitialized', unlocked,
    playing: interval !== null && context?.state === 'running' && canMusic(), paused, hidden: hidden(),
    activeMusicVoices: [...voices].filter(v => v.channel === 'music').length,
    activeSfxVoices: [...voices].filter(v => v.channel === 'sfx').length,
    schedulerCount: interval === null ? 0 : 1,
    bar: Math.floor(step / 8) % 32 + 1, arrangementBars: 32, bpm: SCENES[scene].bpm,
    beatsScheduled: stepsScheduled / 2, notesScheduled, loopsStarted,
    outputLevel: Math.round(outputLevel * 100000) / 100000,
    lastError,
  };
}
export function disposeAudio() {
  initialized = false; lifecycle += 1; removeGestureListeners();
  doc()?.removeEventListener('visibilitychange', onVisibility);
  win()?.removeEventListener('pagehide', onPageHide); win()?.removeEventListener('pageshow', onPageShow);
  stopMusic(0); stopChannel('sfx', 0);
  for (const id of cleanupTimers) clearTimeout(id); cleanupTimers.clear();
  for (const voice of [...voices]) { try { voice.source.stop(); } catch { /* already stopped */ } finishVoice(voice); }
  const old = context; context = null; musicBus = null; sfxBus = null; master = null; analyser = null; meterData = null;
  noiseBuffer = null; pluckBuffers.clear(); sfxTimes.clear(); unlocked = false;
  if (old) { old.onstatechange = null; void old.close().catch(() => {}); }
}
