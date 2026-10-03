'use strict';
// Exercise controller attach/reload/binding without starting an app or watcher.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const config=require('../skin-manager/config.cjs'),registry=require('../skin-manager/registry.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'codex-skins-startup-')),file=path.join(dir,'config.json');
class Session {
  constructor(target,onEvent){this.target=target;this.onEvent=onEvent;this.calls=[];}
  async connect(){} async call(method,params){if(method==='Page.addScriptToEvaluateOnNewDocument')(this.preloads??=[]).push(params.source);return{identifier:'fixture'};} close(){}
  async evaluate(expression){this.calls.push(expression);return false;}
}
const source=fs.readFileSync(path.join(__dirname,'../skin-manager/controller.cjs'),'utf8');
const context=vm.createContext({require(name){
  if(name==='./config.cjs')return config;
  if(name==='./registry.js')return registry;
  if(name==='./bundle.cjs')return{build:()=>'(void 0)',buildManager:()=>'(void "early-manager")'};
  if(name==='./cdp.cjs')return{Session,targets:()=>{throw Error('No process discovery in this test');}};
  if(name==='node:child_process')return{execFile(){throw Error('No external app in this test');}};
  return require(name);
},__dirname:path.join(__dirname,'../skin-manager'),process:{env:{CODEX_SKINS_STATE:dir},argv:['node','controller.cjs','1']},setTimeout(){throw Error('No waiting loop in this test');}});
vm.runInContext(source.slice(0,source.lastIndexOf('main().catch'))+'\nglobalThis.harness={attach};',context);
const states=session=>session.calls.filter(x=>x.startsWith('window.CodexSkins.start(')).map(x=>JSON.parse(x.slice('window.CodexSkins.start('.length,-1)));
const settle=()=>new Promise(setImmediate);
(async()=>{try{
  for(const hidden of [false,true]) {
    config.save(file,{skin:'matrix',remember:true,hideOnStartup:hidden});
    for(let instance=0;instance<2;instance++) {
      const session=await context.harness.attach({id:hidden+'-'+instance});
      assert(session.calls.indexOf('(void "early-manager")')<session.calls.indexOf('(void 0)'),'Palette must precede full skin evaluation');
      assert.equal(session.preloads[0],'(void "early-manager")','Separate early preload cannot wait for DOMContentLoaded');
      assert.equal(states(session).at(-1).showSelector,!hidden,'Each fresh target must honor startup flag');
      assert.equal(states(session).at(-1).config.skin,'matrix');
      session.onEvent({method:'Page.loadEventFired'});await settle();
      assert.equal(states(session).at(-1).showSelector,!hidden,'Renderer restore must honor startup flag');
      session.onEvent({method:'Runtime.bindingCalled',params:{name:'__codexSkinsRequest',payload:JSON.stringify({action:'selector'})}});await settle();
      assert(session.calls.some(x=>x.startsWith('window.CodexSkins.show(')),'Manual palette ignores startup flag');
    }
  }
  const current=await context.harness.attach({id:'unremembered-selection'});
  current.onEvent({method:'Runtime.bindingCalled',params:{name:'__codexSkinsRequest',payload:JSON.stringify({action:'apply',skin:'matrix',remember:false,hideOnStartup:true})}});await settle();
  assert.equal(config.read(file).config.remember,false);assert.equal(config.read(file).config.skin,'default');assert.equal(config.read(file).showSelector,false);
  current.onEvent({method:'Page.loadEventFired'});await settle();
  assert.equal(states(current).at(-1).config.skin,'matrix','Unremembered choice stays active within this renderer session');
  assert.equal(states(current).at(-1).showSelector,false);
  const next=await context.harness.attach({id:'next-startup'});
  assert.equal(states(next).at(-1).config.skin,'default','New target uses persisted choice');
  fs.writeFileSync(file,'{broken');
  current.onEvent({method:'Page.loadEventFired'});await settle();
  assert.equal(states(current).at(-1).config.skin,'default');assert.equal(states(current).at(-1).showSelector,true);
  const corrupt=await context.harness.attach({id:'corrupt'});
  assert.equal(states(corrupt).at(-1).config.skin,'default');assert.equal(states(corrupt).at(-1).showSelector,true);
  fs.unlinkSync(file);
  const missing=await context.harness.attach({id:'missing'});
  assert.equal(states(missing).at(-1).config.skin,'default');assert.equal(states(missing).at(-1).showSelector,true);
  console.log('PASS Controller: repeated attach, renderer restore, manual palette, corrupt/missing fallback (simulated CDP)');
}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1;});
