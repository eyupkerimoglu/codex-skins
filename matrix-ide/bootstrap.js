(()=>{
  const ide=window.MatrixIDE;
  const start=async()=>{try{await ide.connect();if(ide.disposed)return;ide.projectController=ide.modules.projects.install();ide.editorController=ide.modules.editor.install();ide.ready=true;console.info('[Matrix IDE 6.0] native file tree/editor/context bridge ready');}catch(e){if(!ide.disposed){console.error('[Matrix IDE]',e);ide.notice('Matrix IDE: '+e.message);}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
