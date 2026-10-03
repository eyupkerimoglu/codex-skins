'use strict';
const fs = require('node:fs'), path = require('node:path');
const {execFile} = require('node:child_process'), {promisify} = require('node:util');
const configStore = require('./config.cjs'), {build, buildManager} = require('./bundle.cjs'), {Session, targets} = require('./cdp.cjs');
const registry = require('./registry.js');
const execute = promisify(execFile), root = path.resolve(__dirname, '..');
const stateDir = process.env.CODEX_SKINS_STATE || path.join(process.env.LOCALAPPDATA, 'Codex Skins');
const configPath = path.join(stateDir, 'config.json'), lockPath = path.join(stateDir, 'controller.json'), inbox = path.join(stateDir, 'open-selector.json');
const logPath = path.join(stateDir, 'controller.log');
let guiPid = Number(process.argv[2]), sessionSkin;
const sessions = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
function log(event, details = {}) {
  try { if (fs.existsSync(logPath) && fs.statSync(logPath).size > 262144) fs.renameSync(logPath, logPath + '.old'); fs.appendFileSync(logPath, JSON.stringify({time: new Date().toISOString(), event, ...details}) + '\n'); } catch {}
}
function acquire() {
  fs.mkdirSync(stateDir, {recursive: true});
  for (let retry = 0; retry < 2; retry++) {
    try { const fd = fs.openSync(lockPath, 'wx'); fs.writeFileSync(fd, JSON.stringify({pid: process.pid, guiPid, root})); fs.closeSync(fd); return true; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner; try { owner = JSON.parse(fs.readFileSync(lockPath, 'utf8')); } catch { owner = {}; }
      if (owner.pid && alive(owner.pid)) { fs.writeFileSync(inbox, JSON.stringify({action: 'launch', time: Date.now()})); return false; }
      fs.unlinkSync(lockPath);
    }
  }
  return false;
}
async function attach(target) {
  let queue = Promise.resolve(), ready = false, reconnecting = false, source;
  let finishStartup;
  const startup = new Promise(resolve => { finishStartup = resolve; });
  const session = new Session(target, event => {
    if (event.method === 'Runtime.bindingCalled' && event.params.name === '__codexSkinsRequest') {
      queue = queue.then(async () => {
        const message = JSON.parse(event.params.payload);
        if (message.action === 'selector') await session.evaluate('window.CodexSkins.show(' + JSON.stringify(configStore.read(configPath).config) + ')');
        else if (message.action === 'apply') {
          // The early palette can open immediately; applying still waits for the existing startup load.
          await startup;
          if (!registry.has(message.skin) || typeof message.remember !== 'boolean' || typeof configStore.hideOnStartup(message) !== 'boolean') throw Error('Invalid selection');
          const previous = sessionSkin;
          await session.evaluate('window.CodexSkins.apply(' + JSON.stringify(message.skin) + ')');
          try {
            const config = configStore.save(configPath, message); sessionSkin = message.skin;
            await session.evaluate('window.CodexSkins.acknowledge(' + JSON.stringify(config) + ')');
            log('selected', {skin: sessionSkin, remember: config.remember, hideOnStartup: config.hideOnStartup});
          } catch (error) { await session.evaluate('window.CodexSkins.apply(' + JSON.stringify(previous) + ')'); throw error; }
        }
      }).catch(async error => { log('selection-failed', {reason: error.message}); try { await session.evaluate('window.CodexSkins?.failed()'); } catch {} });
    }
    if (event.method === 'Page.loadEventFired' && ready && !reconnecting) {
      reconnecting = true;
      queue = queue.then(async () => {
        const state = configStore.read(configPath);
        if (!state.recovered && fs.existsSync(configPath)) state.config.skin = sessionSkin;
        else sessionSkin = 'default';
        await session.evaluate(source); await session.evaluate('window.CodexSkins.start(' + JSON.stringify(state) + ')');
        log('renderer-restored', {skin: sessionSkin});
      }).catch(error => log('reload-failed', {reason: error.message})).finally(() => reconnecting = false);
    }
  });
  await session.connect();
  try {
    await session.call('Runtime.enable'); await session.call('Page.enable');
    await session.call('Runtime.addBinding', {name: '__codexSkinsRequest'});
    const legacy = await session.evaluate("(!!window.__MATRIXSKIN_V32__ || !!document.getElementById('matrix-main-crt')) && !window.CodexSkins");
    if (legacy) {
      const dirty = await session.evaluate("(()=>{const i=window.MatrixIDE;try{return !!i?.composerView?.().state.doc.textContent.trim() || !!i?.findScope?.().get(i.api.panel('right').tabs$).some(t=>t.hasUnsavedChanges)}catch{return true}})()");
      if (dirty) throw Error('Save editor changes and clear the composer before migrating the legacy Matrix session.');
      await session.call('Page.reload');
      await sleep(1500);
    }
    const manager = buildManager();
    const paletteScript = await session.call('Page.addScriptToEvaluateOnNewDocument', {source: manager}); session.palettePreloadId = paletteScript.identifier;
    await session.evaluate(manager);
    source = build();
    // Expose to the event callback without copying the multi-MB skin each time.
    session.source = source;
    const preload = '(()=>{const boot=()=>{' + source + '};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();})();';
    const script = await session.call('Page.addScriptToEvaluateOnNewDocument', {source: preload}); session.preloadId = script.identifier;
    await session.evaluate(source);
    const state = configStore.read(configPath); sessionSkin = state.config.skin;
    await session.evaluate('window.CodexSkins.start(' + JSON.stringify(state) + ')');
    ready = true;
    sessions.set(target.id, session); log('attached', {target: target.id, skin: sessionSkin});
    return session;
  } catch (error) { session.close(); throw error; }
  finally { finishStartup(); }
}
async function main() {
  if (!Number.isInteger(guiPid) || guiPid < 1) throw Error('Official Codex GUI PID is required');
  if (!acquire()) return;
  sessionSkin = configStore.read(configPath).config.skin;
  log('started', {pid: process.pid, guiPid});
  let exitDeadline = 0, failedSince = 0;
  try {
    while (!fs.existsSync(path.join(root, '.codex-skins-disabled'))) {
      if (!alive(guiPid)) {
        if (!exitDeadline) exitDeadline = Date.now() + 10000;
        try {
          const {stdout} = await execute('powershell.exe', ['-NoProfile','-Command', "Get-CimInstance Win32_Process -Filter \"Name='ChatGPT.exe'\" | Where-Object { $_.ExecutablePath -match '\\\\WindowsApps\\\\OpenAI[.]Codex_' -and $_.CommandLine -notmatch '\\s--type=' } | Select-Object -First 1 -ExpandProperty ProcessId"], {windowsHide: true, timeout: 5000});
          const replacement = Number(stdout.trim());
          if (replacement > 0 && alive(replacement)) { guiPid = replacement; exitDeadline = 0; }
        } catch {}
        if (exitDeadline && Date.now() >= exitDeadline) break;
      } else exitDeadline = 0;
      try {
        const pages = await targets();
        for (const target of pages) { const current = sessions.get(target.id); if (!current || current.closed) await attach(target); }
        for (const [id, session] of sessions) if (!pages.some(target => target.id === id)) { session.close(); sessions.delete(id); }
        if (fs.existsSync(inbox)) {
          fs.unlinkSync(inbox);
          const state = configStore.read(configPath);
          for (const session of sessions.values()) {
            if (state.recovered || !fs.existsSync(configPath)) { await session.evaluate('window.CodexSkins.apply("default")'); sessionSkin = 'default'; }
            if (state.showSelector) await session.evaluate('window.CodexSkins.show(' + JSON.stringify(state.config) + ')');
            else { await session.evaluate('window.CodexSkins.apply(' + JSON.stringify(state.config.skin) + ')'); sessionSkin = state.config.skin; }
          }
        }
        failedSince = 0;
      } catch (error) {
        if (!failedSince) failedSince = Date.now();
        log('retry', {reason: error.message});
        if (!sessions.size && Date.now() - failedSince > 30000) {
          // A normal already-running Codex cannot gain debug flags retroactively.
          const notice = fs.readFileSync(path.join(root, 'skin-manager','startup-notice.ps1'), 'utf8');
          await execute('powershell.exe', ['-NoProfile','-Command', notice], {windowsHide: true}).catch(() => {});
          break;
        }
      }
      await sleep(sessions.size ? 1200 : 75);
    }
  } finally {
    for (const session of sessions.values()) {
      try { if (fs.existsSync(path.join(root, '.codex-skins-disabled'))) await session.evaluate('window.CodexSkins?.dispose();window.MatrixI18n?.dispose();'); for (const identifier of [session.palettePreloadId, session.preloadId]) if (identifier) await session.call('Page.removeScriptToEvaluateOnNewDocument', {identifier}); } catch {}
      session.close();
    }
    try { if (JSON.parse(fs.readFileSync(lockPath,'utf8')).pid === process.pid) fs.unlinkSync(lockPath); } catch {}
    log('stopped', {pid: process.pid});
  }
}
main().catch(error => { log('failure', {reason: error.message}); process.exitCode = 1; });
