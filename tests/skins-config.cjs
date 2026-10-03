'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const store=require('../skin-manager/config.cjs'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'codex-skins-config-')),file=path.join(dir,'config.json');
const write=value=>fs.writeFileSync(file,JSON.stringify(value));
try {
  assert.deepEqual(store.read(file),{config:store.defaults(),showSelector:true,recovered:false});
  fs.writeFileSync(file,'{broken');assert.deepEqual(store.read(file),{config:store.defaults(),showSelector:true,recovered:true});
  for(const remember of [false,true]) for(const hideOnStartup of [false,true]) {
    const saved=store.save(file,{skin:'matrix',remember,hideOnStartup});
    assert.equal(saved.remember,remember,'Hide must not enable remember');
    assert.equal(saved.skin,remember?'matrix':'default');
    assert.equal(saved.hideOnStartup,hideOnStartup);
    assert.equal(store.read(file).showSelector,!hideOnStartup);
    assert.equal(store.read(file).config.remember,remember);
  }
  write({version:1,skin:'matrix',remember:true});assert.equal(store.read(file).showSelector,true);
  assert.equal(store.read(file).config.skin,'matrix');
  for(const hideSelector of [false,true]) {
    write({version:1,skin:'matrix',remember:true,hideSelector});
    assert.equal(store.read(file).config.hideOnStartup,hideSelector,'Legacy config migration');
    assert.equal(store.read(file).showSelector,!hideSelector);
  }
  write({version:1,skin:'matrix',remember:true,hideOnStartup:false,hideSelector:true});
  assert.equal(store.read(file).showSelector,true,'Canonical flag takes precedence');
  for(const invalid of [{skin:'fallout'},{hideOnStartup:'false'},{hideOnStartup:null},{hideSelector:0},{remember:'true'},{version:2}]) {
    write({version:1,skin:'matrix',remember:true,...invalid});
    assert.deepEqual(store.read(file),{config:store.defaults(),showSelector:true,recovered:true});
  }
  store.save(file,{skin:'default',remember:false,hideSelector:true});
  assert.equal(store.read(file).showSelector,false,'Legacy apply payload is accepted');
  assert.equal(store.read(file).config.remember,false);
  assert.throws(()=>store.save(file,{skin:'fallout',remember:true,hideOnStartup:true}));
  assert.throws(()=>store.save(file,{skin:'matrix',remember:true,hideOnStartup:'true'}));
  console.log('PASS Config: independent remember/startup flags, missing/corrupt fallback, legacy migration');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
