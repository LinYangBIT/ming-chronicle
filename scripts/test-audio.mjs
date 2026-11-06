import assert from 'node:assert/strict';

// A small Web Audio contract double tests scheduling/lifecycle, not audibility.
// Real-browser playback state and listening remain separate acceptance checks.
const originals = new Map(['window', 'document', 'localStorage', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const originalDateNow = Date.now;
let wallTime = 100000, timerId = 0;
const timers = new Map(), storage = new Map(), contexts = [];
const later = (fn, delay, repeat) => { const id = ++timerId; timers.set(id, { fn, at: wallTime + delay, repeat }); return id; };
class Surface extends EventTarget { hidden = false; }
class Param {
  value = 0;
  setValueAtTime(v) { this.value = v; }
  linearRampToValueAtTime(v) { this.value = v; }
  exponentialRampToValueAtTime(v) { this.value = v; }
  cancelScheduledValues() {}
  cancelAndHoldAtTime() {}
}
class Node {
  connected = false;
  connect() { this.connected = true; }
  disconnect() { this.connected = false; }
}
class Source extends Node {
  constructor(ctx, kind) { super(); this.ctx = ctx; this.kind = kind; this.frequency = new Param(); this.started = false; this.ended = false; this.stopAt = Infinity; this.onended = null; ctx.sources.add(this); }
  start(at = this.ctx.currentTime) { assert.equal(this.started, false, 'an audio source starts once'); this.started = true; this.startAt = at; this.ctx.startCount += 1; this.ctx.kinds.add(this.kind); this.ctx.latestStart = Math.max(this.ctx.latestStart, at); }
  stop(at = this.ctx.currentTime) { assert.equal(this.started, true, 'AudioScheduledSourceNode.stop requires start first'); this.stopAt = at; }
}
class FakeContext {
  static allowed = false;
  state = 'suspended'; currentTime = 0; sampleRate = 8000; sources = new Set(); kinds = new Set(); startCount = 0; latestStart = 0;
  destination = new Node(); onstatechange = null;
  constructor() { contexts.push(this); }
  createGain() { return Object.assign(new Node(), { gain: new Param() }); }
  createDynamicsCompressor() { return Object.assign(new Node(), Object.fromEntries(['threshold', 'knee', 'ratio', 'attack', 'release'].map(key => [key, new Param()]))); }
  createAnalyser() { return Object.assign(new Node(), { fftSize: 256, getFloatTimeDomainData: data => data.fill(0) }); }
  createBiquadFilter() { return Object.assign(new Node(), { frequency: new Param(), Q: new Param() }); }
  createStereoPanner() { return Object.assign(new Node(), { pan: new Param() }); }
  createOscillator() { return new Source(this, 'oscillator'); }
  createBufferSource() { return new Source(this, 'buffer'); }
  createBuffer(channels, length, sampleRate) { const data = Array.from({ length: channels }, () => new Float32Array(length)); return { sampleRate, length, getChannelData: channel => data[channel] }; }
  resume() {
    if (!FakeContext.allowed) return Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
    if (this.state !== 'running') { this.state = 'running'; this.onstatechange?.(); }
    return Promise.resolve();
  }
  suspend() { this.state = 'suspended'; this.onstatechange?.(); return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
}
function advance(milliseconds) {
  const end = wallTime + milliseconds;
  while (wallTime < end) {
    const amount = Math.min(25, end - wallTime); wallTime += amount;
    for (const ctx of contexts) if (ctx.state === 'running') {
      ctx.currentTime += amount / 1000;
      for (const source of [...ctx.sources]) if (source.started && source.stopAt <= ctx.currentTime) { source.ended = true; source.onended?.(); ctx.sources.delete(source); }
    }
    for (const [id, timer] of [...timers]) if (timer.at <= wallTime) {
      if (timer.repeat) timer.at = wallTime + timer.repeat; else timers.delete(id);
      timer.fn();
    }
  }
}
async function flush() { for (let i = 0; i < 5; i++) await Promise.resolve(); }
function emit(target, name, extras = {}) { const event = new Event(name); Object.assign(event, extras); target.dispatchEvent(event); }
const fakeWindow = new Surface(), fakeDocument = new Surface(); fakeWindow.AudioContext = FakeContext;
Object.assign(globalThis, {
  window: fakeWindow, document: fakeDocument,
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  setTimeout: (fn, delay = 0) => later(fn, delay, 0), clearTimeout: id => timers.delete(id),
  setInterval: (fn, delay) => later(fn, delay, delay), clearInterval: id => timers.delete(id),
});
Date.now = () => wallTime;
try {
  const audio = await import('../dist/audio.js?audio-test=first');
  assert.deepEqual(audio.getAudioSettings(), { musicEnabled: true, sfxEnabled: true, musicVolume: 0.55, sfxVolume: 0.7 });
  audio.initAudio(); audio.initAudio(); await flush();
  assert.equal(contexts.length, 1, 'initialization never creates stacked contexts');
  assert.equal(audio.getAudioStatus().schedulerCount, 0, 'blocked autoplay does not silently schedule music');
  assert.match(audio.getAudioStatus().lastError, /首次点击/);
  FakeContext.allowed = true; emit(fakeDocument, 'pointerdown'); await flush();
  assert.equal(audio.getAudioStatus().playing, true, 'first ordinary gesture unlocks music');
  assert.equal(audio.getAudioStatus().schedulerCount, 1);
  advance(4000);
  assert.ok(audio.getAudioStatus().notesScheduled > 12, 'continuous harmony and melody are scheduled');
  assert.deepEqual(contexts[0].kinds, new Set(['buffer', 'oscillator']), 'plucked and sustained instruments both play');
  const started = audio.getAudioStatus().loopsStarted;
  audio.setAudioScene('story');
  for (let i = 0; i < 20; i++) audio.setAudioScene('story');
  assert.equal(audio.getAudioStatus().loopsStarted, started + 1, 're-rendering same scene does not restart music');
  assert.equal(audio.getAudioStatus().schedulerCount, 1);
  advance(120000);
  assert.ok(audio.getAudioStatus().beatsScheduled > 128, 'music continues beyond the full 32-bar arrangement');
  assert.ok(contexts[0].latestStart > 120, 'new notes continue after two minutes');
  assert.ok(audio.getAudioStatus().activeMusicVoices <= 32, 'ended nodes do not accumulate');
  assert.ok(contexts[0].sources.size <= 32);
  audio.setAudioScene('battle'); advance(500); assert.equal(audio.getAudioStatus().bpm, 112);
  audio.setAudioScene('ending'); advance(500); assert.equal(audio.getAudioStatus().bpm, 68);
  assert.equal(audio.getAudioStatus().schedulerCount, 1);
  assert.equal(contexts.length, 1);

  audio.setAudioSetting('musicEnabled', false); advance(250);
  assert.equal(audio.getAudioStatus().schedulerCount, 0);
  audio.chime('win'); await flush(); advance(25);
  assert.ok(audio.getAudioStatus().activeSfxVoices > 0, 'SFX works while music is disabled');
  assert.equal(audio.getAudioStatus().activeMusicVoices, 0);
  audio.setAudioSetting('sfxEnabled', false); advance(200);
  audio.chime('choice'); await flush();
  assert.equal(audio.getAudioStatus().activeSfxVoices, 0, 'SFX mute is independent and immediate');
  audio.setAudioSetting('musicVolume', 0.23); audio.setAudioSetting('sfxVolume', 0.81);
  assert.equal(audio.toggleSound(), true); await flush(); advance(100);
  assert.equal(audio.getAudioStatus().playing, true);
  const beforePause = audio.getAudioStatus().notesScheduled;
  audio.setAudioPaused(true); advance(200); await flush();
  assert.equal(audio.getAudioStatus().contextState, 'suspended');
  assert.equal(audio.getAudioStatus().schedulerCount, 0);
  advance(15000); assert.equal(audio.getAudioStatus().notesScheduled, beforePause);
  audio.setAudioPaused(false); await flush();
  assert.equal(audio.getAudioStatus().playing, true);
  assert.ok(audio.getAudioStatus().notesScheduled - beforePause <= 8, 'resume does not replay missed notes');

  fakeDocument.hidden = true; emit(fakeDocument, 'visibilitychange'); advance(200); await flush();
  assert.equal(audio.getAudioStatus().contextState, 'suspended');
  assert.equal(audio.getAudioStatus().schedulerCount, 0);
  fakeDocument.hidden = false; emit(fakeDocument, 'visibilitychange'); await flush();
  assert.equal(audio.getAudioStatus().playing, true);
  emit(fakeWindow, 'pagehide', { persisted: true }); advance(200);
  assert.equal(audio.getAudioStatus().playing, false);
  emit(fakeWindow, 'pageshow'); await flush(); assert.equal(audio.getAudioStatus().playing, true);

  audio.setAudioSetting('musicEnabled', false); audio.setAudioSetting('sfxEnabled', false);
  const saved = audio.getAudioSettings();
  audio.disposeAudio(); audio.disposeAudio(); await flush();
  assert.equal(timers.size, 0, 'disposal cancels scheduler and cleanup timers');
  assert.equal(contexts[0].state, 'closed');
  assert.equal(audio.getAudioStatus().activeMusicVoices, 0);
  const reloaded = await import('../dist/audio.js?audio-test=persisted');
  assert.deepEqual(reloaded.getAudioSettings(), saved, 'separate channel settings survive reload');
  reloaded.initAudio(); emit(fakeDocument, 'pointerdown'); await flush();
  assert.equal(reloaded.getAudioStatus().schedulerCount, 0, 'saved mute is never overwritten by first gesture');
  assert.equal(contexts.length, 1, 'fully muted reload need not create a context');
  reloaded.disposeAudio();

  storage.set('ming-chronicle-audio-v2', '{broken json');
  const recovered = await import('../dist/audio.js?audio-test=damaged');
  assert.equal(recovered.getAudioSettings().musicEnabled, true);
  recovered.initAudio(); await flush(); assert.equal(recovered.getAudioStatus().playing, true);
  recovered.setAudioSetting('musicVolume', NaN); assert.equal(recovered.getAudioSettings().musicVolume, 0.55);
  recovered.setAudioSetting('musicVolume', 0); advance(250); assert.equal(recovered.getAudioStatus().playing, false);
  recovered.setAudioSetting('musicVolume', 0.4); await flush(); assert.equal(recovered.getAudioStatus().playing, true);
  emit(fakeWindow, 'pagehide', { persisted: false }); await flush(); assert.equal(timers.size, 0);

  delete fakeWindow.AudioContext;
  const unsupported = await import('../dist/audio.js?audio-test=unsupported');
  unsupported.initAudio(); unsupported.chime('tap'); await flush();
  assert.equal(unsupported.getAudioStatus().supported, false);
  assert.equal(unsupported.getAudioStatus().playing, false);
  assert.match(unsupported.getAudioStatus().lastError, /游戏仍可继续/);
  unsupported.disposeAudio();
  console.log('PASS: default ON/nonzero; first-gesture unlock; >32 bars continuous scheduling; scene idempotence; voice bounds; independent persistent music/SFX; pause/background/BFCache/reload; no backlog; cleanup; damaged preferences and unsupported-audio fallback.');
  console.log('These are Web Audio contract tests, not listening or physical-device evidence.');
} finally {
  Date.now = originalDateNow;
  for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
}
