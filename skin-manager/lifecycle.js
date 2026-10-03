(() => {
  'use strict';
  // Scope only the existing Matrix skin, without rewriting its effects.
  window.CodexSkinScope = function() {
    const nodes = new Set(), observers = new Set(), timers = new Set(), frames = new Set(), listeners = [];
    const originalAttributes = new Map();
    const native = {timeout: window.setTimeout.bind(window), interval: window.setInterval.bind(window), raf: window.requestAnimationFrame.bind(window),
      add: EventTarget.prototype.addEventListener, remove: EventTarget.prototype.removeEventListener,
      create: Document.prototype.createElement, createNS: Document.prototype.createElementNS,
      MutationObserver, ResizeObserver};
    let disposed = false, depth = 0;
    const audit = new native.MutationObserver(() => {});
    audit.observe(document.documentElement, {subtree: true, attributes: true, attributeOldValue: true});
    function collect() {
      for (const record of audit.takeRecords()) {
        const el = record.target, key = record.attributeName;
        if (nodes.has(el) || !['style', 'class', 'inert'].includes(key) && !key.startsWith('data-mx') && !key.startsWith('data-matrix')) continue;
        let attributes = originalAttributes.get(el);
        if (!attributes) originalAttributes.set(el, attributes = new Map());
        if (!attributes.has(key)) attributes.set(key, {before: record.oldValue, after: el.getAttribute(key)});
        else attributes.get(key).after = el.getAttribute(key);
      }
    }
    function wrap(callback) {
      if (typeof callback !== 'function') throw Error('Matrix callbacks must be functions');
      return function(...args) { if (!disposed) return run(() => callback.apply(this, args)); };
    }
    function run(callback) {
      if (disposed) return;
      if (depth++) { try { return callback(); } finally { depth--; } }
      audit.takeRecords();
      EventTarget.prototype.addEventListener = function(type, fn, options) {
        if (!fn) return native.add.call(this, type, fn, options);
        const duplicate = listeners.find(x => x.target === this && x.type === type && x.original === fn && x.capture === !!(typeof options === 'boolean' ? options : options?.capture));
        const wrapped = duplicate?.wrapped || wrap(typeof fn === 'function' ? fn : e => fn.handleEvent(e));
        if (!duplicate) listeners.push({target: this, type, original: fn, wrapped, capture: !!(typeof options === 'boolean' ? options : options?.capture)});
        return native.add.call(this, type, wrapped, options);
      };
      EventTarget.prototype.removeEventListener = function(type, fn, options) {
        const capture = !!(typeof options === 'boolean' ? options : options?.capture);
        const record = listeners.find(x => x.target === this && x.type === type && x.original === fn && x.capture === capture);
        return native.remove.call(this, type, record?.wrapped || fn, options);
      };
      Document.prototype.createElement = function(...args) { const el = native.create.apply(this, args); nodes.add(el); return el; };
      Document.prototype.createElementNS = function(...args) { const el = native.createNS.apply(this, args); nodes.add(el); return el; };
      try { return callback(); }
      finally {
        collect(); depth--;
        EventTarget.prototype.addEventListener = native.add;
        EventTarget.prototype.removeEventListener = native.remove;
        Document.prototype.createElement = native.create;
        Document.prototype.createElementNS = native.createNS;
      }
    }
    const observer = Constructor => class {
      constructor(callback) { const instance = new Constructor(wrap(callback)); observers.add(instance); return instance; }
    };
    const timeout = (fn, ms, ...args) => { let id; id = native.timeout(wrap(() => { timers.delete(id); fn(...args); }), ms); timers.add(id); return id; };
    const interval = (fn, ms, ...args) => { const id = native.interval(wrap(() => fn(...args)), ms); timers.add(id); return id; };
    const raf = fn => { let id; id = native.raf(wrap(t => { frames.delete(id); fn(t); })); frames.add(id); return id; };
    function dispose() {
      if (disposed) return;
      collect(); disposed = true; audit.disconnect();
      for (const observer of observers) observer.disconnect();
      for (const timer of timers) { clearTimeout(timer); clearInterval(timer); }
      for (const frame of frames) cancelAnimationFrame(frame);
      for (const x of listeners) native.remove.call(x.target, x.type, x.wrapped, x.capture);
      for (const key of ['MatrixWakeIntro','matrixCornerFault','matrixStickerDamage','matrixCaseSticker','matrixScreenSurfaces']) {
        try { window[key]?.dispose(); } catch (error) { console.warn('[Codex Skins cleanup]', error); }
      }
      document.getElementById('matrixskin-v32-rain')?.matrixRainDispose?.();
      document.getElementById('matrix-main-crt')?.matrixCrtNoise?.dispose();
      for (const node of nodes) node.remove();
      for (const [el, attrs] of originalAttributes) {
        for (const [key, values] of attrs) {
          if (key === 'class') {
            for (const name of [...el.classList]) if (/^mx-(?!(?:auto|px|\d+(?:\.\d+)?)$)/.test(name) && !(values.before || '').split(/\s+/).includes(name)) el.classList.remove(name);
          } else if (key === 'style') {
            const old = native.create.call(document, 'span').style, last = native.create.call(document, 'span').style;
            old.cssText = values.before || ''; last.cssText = values.after || '';
            for (const prop of new Set([...old, ...last])) {
              if (el.style.getPropertyValue(prop) !== last.getPropertyValue(prop) || el.style.getPropertyPriority(prop) !== last.getPropertyPriority(prop)) continue;
              if (old.getPropertyValue(prop)) el.style.setProperty(prop, old.getPropertyValue(prop), old.getPropertyPriority(prop));
              else el.style.removeProperty(prop);
            }
            if (!el.style.length && values.before === null) el.removeAttribute('style');
          } else if (el.getAttribute(key) === values.after) {
            if (values.before === null) el.removeAttribute(key); else el.setAttribute(key, values.before);
          }
        }
      }
      delete window.__MATRIXSKIN_V32__;
      nodes.clear(); observers.clear(); timers.clear(); frames.clear(); listeners.length = 0; originalAttributes.clear();
    }
    return {run, timeout, interval, raf, MutationObserver: observer(native.MutationObserver), ResizeObserver: observer(native.ResizeObserver), dispose,
      get status() { return {disposed, nodes: nodes.size, observers: observers.size, timers: timers.size, frames: frames.size, listeners: listeners.length}; }};
  };
})();
