(() => {
  'use strict';
  if (window.CodexSkins) return;
  const i18n = window.MatrixI18n, registry = window.CodexSkinRegistry;
  let mode = 'default', loader, scope, modal, modalHost, returnFocus, preferences, selected, pickerOpen = false, popupEscape = false, changing = false, disposed = false;
  const button = document.createElement('button');
  button.id = 'codex-skins-button'; button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.1a2.1 2.1 0 0 0 1.4-3.65 1.25 1.25 0 0 1 .85-2.18H17A4 4 0 0 0 21 11a9 9 0 0 0-9-8Z"/><circle cx="7.5" cy="10" r=".7" fill="#F0B137" stroke="none" style="fill:#F0B137!important;stroke:none!important"/><circle cx="11" cy="6.7" r=".7" fill="#4AA3FF" stroke="none" style="fill:#4AA3FF!important;stroke:none!important"/><circle cx="16" cy="8" r=".7" fill="#E84C3D" stroke="none" style="fill:#E84C3D!important;stroke:none!important"/></svg>';
  const css = document.createElement('style'); css.id = 'codex-skins-style';
  css.textContent = `
    #codex-skins-button{position:fixed!important;top:6px!important;right:284px!important;z-index:2147483000!important;display:flex!important;align-items:center;justify-content:center;width:30px;height:28px;padding:5px!important;border:1px solid transparent!important;border-radius:6px!important;background:transparent!important;color:#9ca8a0!important;box-shadow:none!important;cursor:pointer;pointer-events:auto!important;flex:0 0 auto;-webkit-app-region:no-drag}
    #codex-skins-button:hover{background:#27302b!important;color:#bdf2ce!important;border-color:#3b4b41!important}
    #codex-skins-button:focus-visible{outline:2px solid #70bf8c!important;outline-offset:2px}
    #codex-skins-overlay{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);font:13px/1.5 'Segoe UI',sans-serif;color:#e9e9e9;text-shadow:none;pointer-events:auto;-webkit-app-region:no-drag}
    #codex-skins-dialog{width:min(480px,calc(100vw - 32px));max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #3c3c3c;border-radius:12px;box-shadow:0 20px 80px #000a;background:var(--skins-surface);color:var(--skins-text)}
    #codex-skins-dialog *{box-sizing:border-box;text-shadow:none!important}
    #codex-skins-dialog .skins-header{padding:18px 22px 0;background:#1b1c1e;color:#ededed;flex-shrink:0}
    #codex-skins-dialog .skins-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
    #codex-skins-dialog h2{margin:0;font:600 15px/24px 'Segoe UI',sans-serif!important;letter-spacing:.15px}
    #codex-skins-dialog button{cursor:pointer;box-shadow:none!important;min-width:0}
    #codex-skins-dialog #codex-skins-close{display:flex;align-items:center;justify-content:center;width:26px;height:26px;padding:4px!important;background:transparent!important;border:0!important;border-radius:5px!important;color:#aaa!important}
    #codex-skins-dialog #codex-skins-close:hover{background:#303135!important;color:#fff!important}
    #codex-skins-dialog .skins-header{position:relative;z-index:2;border-bottom:1px solid #393a3c}
    #codex-skins-dialog .skins-picker{position:relative;width:200px;max-width:100%;margin:0 0 17px}
    #codex-skins-dialog #codex-skins-picker-button{display:flex;align-items:center;justify-content:space-between;gap:28px;width:100%;padding:7px 10px!important;border:1px solid #434447!important;border-radius:6px!important;background:#262729!important;color:#e7e7e7!important;font:500 13px/22px 'Segoe UI',sans-serif!important}
    #codex-skins-dialog #codex-skins-picker-button:hover{background:#303134!important;border-color:#595a5d!important}
    #codex-skins-dialog #codex-skins-picker-button svg{transition:transform .16s}
    #codex-skins-dialog #codex-skins-picker-button[aria-expanded="true"] svg{transform:rotate(180deg)}
    #codex-skins-dialog .skins-dropdown{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:3;max-height:min(260px,calc(100vh - 250px));overflow-y:auto;padding:4px;border:1px solid #4b4c4f;border-radius:7px;background:#242527;color:#eee;box-shadow:0 8px 24px #0008;scrollbar-width:thin;scrollbar-color:#696a6c #242527}
    #codex-skins-dialog .skins-dropdown[hidden]{display:none!important}
    #codex-skins-dialog .skins-dropdown button{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;width:100%;padding:8px 9px!important;border:0!important;border-radius:4px!important;background:transparent!important;color:#d5d5d5!important;font:13px/20px 'Segoe UI',sans-serif!important}
    #codex-skins-dialog .skins-dropdown button:hover,#codex-skins-dialog .skins-dropdown button:focus{background:#37383b!important;color:#fff!important;outline:none!important}
    #codex-skins-dialog .skins-dropdown button[aria-selected="true"]{background:#303134!important;color:#fff!important}
    #codex-skins-dialog .skins-dropdown button svg{opacity:0;flex-shrink:0}
    #codex-skins-dialog .skins-dropdown button[aria-selected="true"] svg{opacity:1}
    #codex-skins-dialog .skins-body{padding:23px 24px 16px;overflow-y:auto;min-height:268px;background-color:var(--skins-surface);background-image:var(--skins-texture);font:13px/1.5 var(--skins-font);transition:background-color .18s,color .18s}
    #codex-skins-dialog .skins-skin-name{margin:0 0 4px;font:600 20px/28px var(--skins-font)!important;color:var(--skins-accent)}
    #codex-skins-dialog .skins-description{margin:0 0 14px;font:12px/19px 'Segoe UI',sans-serif;color:var(--skins-muted)}
    #codex-skins-dialog .skins-features{list-style:none;padding:0;margin:0}
    #codex-skins-dialog .skins-features li{display:flex;align-items:center;gap:16px;padding:9px 0;border-bottom:1px solid var(--skins-line)}
    #codex-skins-dialog .skins-features li:last-child{border-bottom:0}
    #codex-skins-dialog .skins-keys{display:flex;gap:4px;width:76px;flex-shrink:0}
    #codex-skins-dialog kbd{display:inline-flex;align-items:center;justify-content:center;min-width:29px;padding:2px 8px;border:1px solid var(--skins-line);border-bottom-width:2px;border-radius:4px;background:var(--skins-key);color:var(--skins-accent);font:12px/20px Consolas,monospace!important}
    #codex-skins-dialog .skins-feature-label{font:12px/19px 'Segoe UI',sans-serif;color:var(--skins-text)}
    #codex-skins-dialog .skins-empty{margin:36px 0 18px;padding:16px 0;border-top:1px solid var(--skins-line);color:var(--skins-muted);font:13px/20px 'Segoe UI',sans-serif}
    #codex-skins-dialog footer{padding:16px 24px 20px;border-top:1px solid var(--skins-line);background:var(--skins-surface);flex-shrink:0;font:12px/19px 'Segoe UI',sans-serif}
    #codex-skins-dialog .skins-check{display:flex;align-items:center;gap:9px;color:var(--skins-text);margin-bottom:10px;cursor:pointer}
    #codex-skins-dialog input{appearance:auto!important;accent-color:var(--skins-accent);width:15px;height:15px;margin:0;flex:0 0 auto}
    #codex-skins-dialog .skins-actions{display:flex;justify-content:flex-end;margin-top:15px}
    #codex-skins-dialog #codex-skins-apply{font:600 12px/22px 'Segoe UI',sans-serif!important;padding:6px 22px!important;min-width:94px;border-radius:6px!important;border:1px solid var(--skins-action)!important;background:var(--skins-action)!important;color:var(--skins-actionText)!important}
    #codex-skins-dialog #codex-skins-apply:hover{filter:brightness(1.08)}
    #codex-skins-dialog button:disabled{opacity:.55;cursor:wait}
    #codex-skins-dialog :focus-visible{outline:2px solid var(--skins-accent);outline-offset:3px}
    #codex-skins-error{color:#f1b0a2;margin-top:10px;font:12px/18px 'Segoe UI',sans-serif}
    #codex-skins-error:empty{display:none}
    @media(prefers-reduced-motion:reduce){#codex-skins-dialog .skins-body{transition:none}}
    @media(max-height:540px){#codex-skins-dialog .skins-body{min-height:0}}
  `;
  (document.head || document.documentElement).appendChild(css);
  function label(el, key, attr = 'textContent') { i18n.bind(el, 'skins.' + key, {}, attr); return el; }
  function request(payload) { if (typeof window.__codexSkinsRequest !== 'function') throw Error('Skin controller unavailable'); window.__codexSkinsRequest(JSON.stringify(payload)); }
  // The existing fixed title-bar position only needs the document body, not React or Matrix readiness.
  function mount() {
    if (disposed) return;
    if (document.head && css.parentElement !== document.head) document.head.appendChild(css);
    if (document.body && button.parentElement !== document.body) document.body.appendChild(button);
  }
  label(button, 'button', 'title'); label(button, 'button', 'aria-label'); button.onclick = () => request({action: 'selector'});
  const observer = new MutationObserver(mount); observer.observe(document.documentElement, {subtree: true, childList: true}); mount();
  function close() { modalHost?.remove(); modalHost = null; modal = null; selected = null; pickerOpen = false; popupEscape = false; changing = false; returnFocus?.focus?.(); }
  const unsubscribe = i18n.subscribe(() => {
    for (const element of modal?.querySelectorAll('[data-matrix-i18n]') || []) for (const attr of [...element.attributes]) {
      if (!attr.name.startsWith('data-mx-i18n-')) continue;
      const token = attr.name.slice(13), spec = JSON.parse(attr.value);
      i18n.bind(element, spec.key, spec.params, token === 'text' ? 'textContent' : token);
    }
  });
  function preview(id, focus = false) {
    if (!modal || changing) return;
    const entry = registry.get(id); if (!entry) return;
    selected = id;
    const dialog = modal.querySelector('#codex-skins-dialog'); dialog.dataset.skin = id;
    for (const [key, value] of Object.entries(entry.theme)) if (key !== 'appCss') dialog.style.setProperty('--skins-' + key, value);
    for (const option of modal.querySelectorAll('[role="option"]')) option.setAttribute('aria-selected', String(option.dataset.skin === id));
    modal.querySelector('#codex-skins-name').textContent = entry.name;
    i18n.bind(modal.querySelector('#codex-skins-description'), entry.description);
    const panel = modal.querySelector('#codex-skins-preview'); panel.setAttribute('aria-labelledby', 'codex-skins-name');
    const features = modal.querySelector('#codex-skins-features'); features.replaceChildren();
    for (const feature of entry.features) {
      const row = document.createElement('li'), keys = document.createElement('span'), text = document.createElement('span');
      keys.className = 'skins-keys'; text.className = 'skins-feature-label';
      for (const key of feature.keys || []) { const kbd = document.createElement('kbd'); kbd.textContent = key; keys.appendChild(kbd); }
      i18n.bind(text, feature.description); row.append(keys, text); features.appendChild(row);
    }
    const empty = modal.querySelector('#codex-skins-empty'); empty.hidden = entry.features.length > 0;
    if (focus) modal.querySelector('#codex-skins-picker-button')?.focus();
  }
  function show(config) {
    if (modal) { modal.querySelector('#codex-skins-picker-button')?.focus(); return; }
    preferences = config; returnFocus = document.activeElement;
    modal = document.createElement('div'); modal.id = 'codex-skins-overlay';
    modal.innerHTML = '<section id="codex-skins-dialog" role="dialog" aria-modal="true" aria-labelledby="codex-skins-title"><header class="skins-header"><div class="skins-title-row"><h2 id="codex-skins-title"></h2><button id="codex-skins-close" type="button"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button></div><div class="skins-picker"><button id="codex-skins-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="codex-skins-list"><span id="codex-skins-picker-text"></span><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button><div id="codex-skins-list" class="skins-dropdown" role="listbox" aria-labelledby="codex-skins-picker-text" hidden></div></div></header><main id="codex-skins-preview" class="skins-body" role="region"><h3 id="codex-skins-name" class="skins-skin-name"></h3><p id="codex-skins-description" class="skins-description"></p><ul id="codex-skins-features" class="skins-features"></ul><p id="codex-skins-empty" class="skins-empty"></p></main><footer><label class="skins-check"><input type="checkbox" id="codex-skins-remember"><span id="codex-skins-remember-text"></span></label><label class="skins-check"><input type="checkbox" id="codex-skins-skip"><span id="codex-skins-skip-text"></span></label><div id="codex-skins-error" role="alert"></div><div class="skins-actions"><button id="codex-skins-apply" type="button"></button></div></footer></section>';
    for (const [id, key] of [['title','title'],['remember-text','remember'],['skip-text','skip'],['apply','apply'],['empty','noFeatures']]) label(modal.querySelector('#codex-skins-' + id), key);
    label(modal.querySelector('#codex-skins-close'), 'close', 'title'); label(modal.querySelector('#codex-skins-close'), 'close', 'aria-label'); label(modal.querySelector('#codex-skins-picker-text'), 'button');
    const picker = modal.querySelector('#codex-skins-picker-button'), list = modal.querySelector('#codex-skins-list');
    function closePicker(focus = false) { pickerOpen = false; list.hidden = true; picker.setAttribute('aria-expanded','false'); if (focus) picker.focus(); }
    function openPicker() {
      if (changing) return;
      list.replaceChildren();
      for (const entry of registry.list()) {
        const option = document.createElement('button'), name = document.createElement('span');
        option.type = 'button'; option.dataset.skin = entry.id; option.id = 'codex-skins-option-' + entry.id; option.tabIndex = -1;
        option.setAttribute('role','option'); option.setAttribute('aria-selected',String(entry.id === selected)); name.textContent = entry.name;
        option.appendChild(name); option.insertAdjacentHTML('beforeend','<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>');
        option.onclick = () => { preview(entry.id); closePicker(true); }; list.appendChild(option);
      }
      pickerOpen = true; list.hidden = false; picker.setAttribute('aria-expanded','true');
      const active = list.querySelector('[aria-selected="true"]') || list.firstElementChild; active?.focus(); active?.scrollIntoView({block:'nearest'});
    }
    picker.onclick = () => pickerOpen ? closePicker(true) : openPicker();
    picker.onkeydown = e => { if (['ArrowDown','ArrowUp'].includes(e.key)) { e.preventDefault(); openPicker(); } };
    list.onkeydown = e => {
      if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
      e.preventDefault(); const options = [...list.querySelectorAll('[role="option"]')], index = options.indexOf(modal.getRootNode().activeElement);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[next]?.focus(); options[next]?.scrollIntoView({block:'nearest'});
    };
    modal.onpointerdown = e => { if (pickerOpen && !e.target.closest('.skins-picker')) closePicker(); };
    const remember = modal.querySelector('#codex-skins-remember'), skip = modal.querySelector('#codex-skins-skip');
    remember.checked = config.remember; skip.checked = (config.hideOnStartup ?? config.hideSelector) === true;
    modal.querySelector('#codex-skins-close').onclick = () => { if (!changing) close(); };
    modal.querySelector('#codex-skins-apply').onclick = () => {
      if (changing) return; changing = true;
      modal.querySelectorAll('button,input').forEach(el => el.disabled = true);
      label(modal.querySelector('#codex-skins-apply'), 'busy');
      try { request({action: 'apply', skin: selected, remember: remember.checked, hideOnStartup: skip.checked}); }
      catch { failed(); }
    };
    modal.onkeydown = e => {
      if (e.key === 'Escape' && !changing) { e.preventDefault(); if (pickerOpen) { popupEscape = true; closePicker(true); } else close(); }
      if (e.key === 'Tab') {
        if (pickerOpen) { closePicker(); e.preventDefault(); (e.shiftKey ? picker : remember).focus(); return; }
        const active = modal.getRootNode().activeElement;
        const els = [...modal.querySelectorAll('input:not(:disabled),button:not(:disabled)')].filter(el => el.tabIndex !== -1 && el.getClientRects().length > 0);
        if (!els.length) { e.preventDefault(); return; }
        if (e.shiftKey && active === els[0]) { e.preventDefault(); els.at(-1).focus(); }
        else if (!e.shiftKey && active === els.at(-1)) { e.preventDefault(); els[0].focus(); }
      }
    };
    // Electron may consume Escape on keydown; keyup still reaches this dialog.
    modal.onkeyup = e => { if (e.key !== 'Escape' || changing) return; e.preventDefault(); if (popupEscape) { popupEscape = false; return; } if (pickerOpen) closePicker(true); else close(); };
    // Keep the manager independent of the active skin's popup styling.
    modalHost = document.createElement('div'); modalHost.id = 'codex-skins-host';
    const shadow = modalHost.attachShadow({mode:'open'}), localCss = css.cloneNode(true); localCss.removeAttribute('id');
    shadow.append(localCss, modal); preview(mode); document.body.appendChild(modalHost); picker.focus();
  }
  function failed() { changing = false; if (modal) { modal.querySelectorAll('button,input').forEach(el => el.disabled = false); label(modal.querySelector('#codex-skins-apply'), 'apply'); label(modal.querySelector('#codex-skins-error'), 'error'); } }
  function unload() { registry.get(mode)?.unload?.(); scope?.dispose(); scope = null; mode = 'default'; }
  async function apply(skin) {
    const entry = registry.get(skin); if (!entry) throw Error('Unknown skin');
    if (skin === mode && (!entry.ready || entry.ready())) return;
    unload();
    if (entry.load || entry.theme.appCss) {
      scope = window.CodexSkinScope();
      try {
        if (entry.theme.appCss) scope.run(() => { const style = document.createElement('style'); style.textContent = entry.theme.appCss; document.head.appendChild(style); });
        await entry.load?.({scope, loadMatrix() { if (!loader) throw Error('Matrix loader unavailable'); loader(scope); }});
        const deadline = Date.now() + 20000;
        while (entry.ready && !entry.ready() && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 80));
        if (entry.ready && !entry.ready()) throw Error('Skin initialization failed');
      } catch (error) { entry.unload?.(); scope.dispose(); scope = null; throw error; }
    }
    mode = skin; button.dataset.skin = mode;
  }
  window.CodexSkins = {
    version: '1.0.2', setLoader(fn) { loader = fn; }, apply, show, close, failed,
    acknowledge(config) { preferences = config; close(); },
    get state() { return {skin: mode, preview: selected, selectorOpen: !!modal, scope: scope?.status, config: preferences}; },
    async start(state) { preferences = state.config; await apply(state.config.skin); if ((state.config.hideOnStartup ?? state.config.hideSelector) !== true) show(state.config); },
    dispose() { unload(); disposed = true; observer.disconnect(); unsubscribe(); close(); button.remove(); css.remove(); delete window.CodexSkins; delete window.CodexSkinRegistry; }
  };
})();
