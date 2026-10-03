'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const registry=require('../skin-manager/registry.js'),config=require('../skin-manager/config.cjs');
assert.deepEqual(registry.list().map(entry=>entry.id),['default','matrix']);
assert.equal(registry.get('default').features.length,0);assert.equal(registry.get('matrix').features.length,5);
assert.throws(()=>registry.register({...registry.get('matrix')}));
const fixture={id:'fixture',name:'Fixture',description:'skins.defaultDescription',theme:{...registry.get('default').theme,appCss:'.fixture-theme{color:white}'},features:[{keys:['F1'],description:'skins.noFeatures'}]};
registry.register(fixture);
for(let index=1;index<30;index++)registry.register({...fixture,id:'fixture-'+index,name:'Fixture '+index});
assert.equal(registry.list().length,32);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'codex-skin-registry-')),file=path.join(dir,'config.json');
try{config.save(file,{skin:'fixture',remember:true,hideSelector:true});assert.equal(config.read(file).config.skin,'fixture');assert.equal(config.read(file).showSelector,false);assert(Object.isFrozen(registry.get('fixture').theme));}
finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log('PASS Shared registry: 30 extra registrations, theme/features, duplicate rejection and new skin config');
