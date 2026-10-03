/* Soft mechanical feedback for the CRT bezel controls. No startup sound. */
(() => {
  'use strict';
  if (window.MatrixMonitorClickAudio?.version === '6.8') return;
  window.MatrixMonitorClickAudio?.dispose();

  let context, buffer, output, disposed = false, activations = 0, played = 0;
  const keyboardHeld = new WeakSet();
  const keyboardRelease = new WeakMap();
  const selector = '#matrix-main-crt .mx-monitor-key';

  function makeClick(ctx) {
    const rate = ctx.sampleRate;
    const result = ctx.createBuffer(1, Math.ceil(rate * 0.055), rate);
    const samples = result.getChannelData(0);
    let seed = 17073, low = 0, high = 0, peak = 0;
    const fast = 1 - Math.exp(-2 * Math.PI * 5800 / rate);
    const slow = 1 - Math.exp(-2 * Math.PI * 180 / rate);
    for (let i = 0; i < samples.length; i++) {
      const t = i / rate;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      low += fast * (noise - low);
      high += slow * (low - high);
      const attack = Math.min(1, t / 0.00035);
      const contact = Math.exp(-t / 0.0045);
      const second = t > 0.0077 ? 0.26 * Math.exp(-(t - 0.0077) / 0.0025) : 0;
      const body = (0.22 * Math.sin(2 * Math.PI * 810 * t) +
        0.10 * Math.sin(2 * Math.PI * 1370 * t)) * Math.exp(-t / 0.008);
      samples[i] = attack * ((low - high) * (contact + second) + body) *
        Math.min(1, (0.055 - t) / 0.004);
      peak = Math.max(peak, Math.abs(samples[i]));
    }
    // Fixed gentle level regardless of the device's sample rate.
    for (let i = 0; i < samples.length; i++) samples[i] *= 0.16 / (peak || 1);
    return result;
  }

  function play() {
    if (disposed) return;
    activations++;
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        context = new AudioContext({ latencyHint: 'interactive' });
        buffer = makeClick(context);
        output = context.createGain();
        output.gain.value = 0.55;
        output.connect(context.destination);
      }
      const start = () => {
        if (disposed || context.state !== 'running') return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(output);
        source.onended = () => source.disconnect();
        source.start();
        played++;
      };
      if (context.state === 'running') start();
      else context.resume().then(start).catch(() => {});
    } catch (_) { /* Audio failure must never block the native control. */ }
  }

  function keyFor(event) {
    const key = event.target instanceof Element ? event.target.closest(selector) : null;
    return key && !key.disabled && key.getAttribute('aria-disabled') !== 'true' ? key : null;
  }
  function pointerdown(event) {
    if (event.button === 0 && event.isPrimary !== false && keyFor(event)) play();
  }
  function keydown(event) {
    const key = keyFor(event);
    if (!key || event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return;
    keyboardHeld.add(key);
    play();
  }
  function keyup(event) {
    const key = keyFor(event);
    if (!key || (event.key !== ' ' && event.key !== 'Enter')) return;
    keyboardHeld.delete(key);
    keyboardRelease.set(key, performance.now());
  }
  function click(event) {
    const key = keyFor(event);
    // Pointer and keyboard clicks already sound when the key is depressed.
    if (!key || event.detail !== 0 || keyboardHeld.has(key) ||
        performance.now() - (keyboardRelease.get(key) ?? -Infinity) < 750) return;
    play();
  }
  const listeners = { pointerdown, keydown, keyup, click };
  for (const [type, handler] of Object.entries(listeners)) document.addEventListener(type, handler, true);
  window.MatrixMonitorClickAudio = {
    version: '6.8',
    get status() { return { activations, played, state: context?.state || 'idle' }; },
    dispose() {
      disposed = true;
      for (const [type, handler] of Object.entries(listeners)) document.removeEventListener(type, handler, true);
      if (context) context.close().catch(() => {});
      if (window.MatrixMonitorClickAudio === this) delete window.MatrixMonitorClickAudio;
    }
  };
})();
