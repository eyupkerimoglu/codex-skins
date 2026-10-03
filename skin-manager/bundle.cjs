'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function buildManager() {
  // Small manager bootstrap: expose the palette before compiling/loading Matrix and the IDE.
  const manager = `(()=>{if(window.CodexSkins)return;\n${read('matrix-i18n.js')}\n${read('skin-manager/registry.js')}\n${read('skin-manager/lifecycle.js')}\n${read('skin-manager/renderer.js')}\n})();`;
  return `(()=>{const boot=()=>{${manager}};if(document.documentElement)boot();else{const observer=new MutationObserver(()=>{if(document.documentElement){observer.disconnect();boot();}});observer.observe(document,{childList:true});}})();`;
}
function build(state) {
  const ide = ['runtime.js','codex-context-bridge.js','file-tree.js','project-tabs.js','editor-panel.js','bootstrap.js'].map(file => read('matrix-ide/' + file)).join('\n');
  return `(()=>{${buildManager()}\n` +
    `window.CodexSkins.setLoader(scope=>{scope.run(()=>{(function(setTimeout,setInterval,requestAnimationFrame,MutationObserver,ResizeObserver,addEventListener,removeEventListener){\n${read('matrix-skin-v2.js')}\n})(scope.timeout,scope.interval,scope.raf,scope.MutationObserver,scope.ResizeObserver,window.addEventListener.bind(window),window.removeEventListener.bind(window));});\n${read('matrix-monitor-audio.js')}\n${ide}\n});\n` +
    `})();`;
}
module.exports = {build, buildManager};
