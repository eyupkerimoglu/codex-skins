(function(root, factory) {
  const registry = factory();
  if (typeof module === 'object' && module.exports) module.exports = registry;
  else root.CodexSkinRegistry = registry;
})(globalThis, function() {
  'use strict';
  const entries = new Map();
  function register(entry) {
    if (!entry || !/^[a-z][a-z0-9-]*$/.test(entry.id) || !entry.name || !entry.theme || !Array.isArray(entry.features)) throw Error('Invalid skin registration');
    if (entries.has(entry.id)) throw Error('Duplicate skin registration');
    entries.set(entry.id, Object.freeze({...entry, theme: Object.freeze({...entry.theme}), features: Object.freeze(entry.features.map(feature => Object.freeze({...feature})))}));
  }
  register({
    id: 'default', name: 'Default Codex', description: 'skins.defaultDescription', features: [],
    theme: {surface:'#1b1b1b', text:'#e8e8e8', muted:'#a9a9a9', line:'#383838', accent:'#ededed', tint:'#292929', key:'#252525', action:'#e5e5e5', actionText:'#191919', font:"'Segoe UI',sans-serif", texture:'none'}
  });
  register({
    id: 'matrix', name: 'Matrix', description: 'skins.matrixDescription',
    theme: {surface:'#070e0a', text:'#c7e8cf', muted:'#80a88b', line:'#23412c', accent:'#67f98b', tint:'#12271a', key:'#102318', action:'#60e982', actionText:'#06210e', font:"Consolas,'Segoe UI',monospace", texture:'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(94,245,130,.035) 3px,rgba(94,245,130,.035) 4px)'},
    features: [
      {keys:['1'], description:'skins.rainFeature'},
      {keys:['←','→'], description:'skins.intensityFeature'},
      {keys:['2'], description:'skins.retroFeature'},
      {keys:['Power'], description:'skins.powerFeature'},
      {keys:['IDE'], description:'skins.ideFeature'}
    ],
    load(context) { context.loadMatrix(); },
    ready() { return !!globalThis.MatrixIDE?.ready && !!document.getElementById('matrix-main-crt'); },
    unload() { globalThis.MatrixIDE?.dispose(); globalThis.MatrixMonitorClickAudio?.dispose(); }
  });
  return Object.freeze({register, has: id => entries.has(id), get: id => entries.get(id), list: () => [...entries.values()]});
});
