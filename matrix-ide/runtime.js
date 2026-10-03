(()=>{
  'use strict';
  const projectUiState=new Map([...window.MatrixIDE?.projectController?.states||[]].map(([id,state])=>[id,{mode:state.mode,expanded:[...state.tree.element.querySelectorAll('[aria-expanded="true"][data-path]')].map(el=>el.dataset.path)}]));
  window.MatrixIDE?.dispose();
  const ide=window.MatrixIDE={version:'6.0',modules:{},cleanups:[],projects:new Map(),activeFile:null,disposed:false};
  ide.initialProjectState=projectUiState;
  ide.dispose=()=>{ide.disposed=true;for(const fn of ide.cleanups.splice(0).reverse()){try{fn();}catch{}}document.querySelectorAll('[data-matrix-ide-owned]').forEach(e=>e.remove());document.querySelectorAll('.mx-ide-chat-hidden').forEach(e=>e.classList.remove('mx-ide-chat-hidden'));if(window.MatrixIDE===ide)delete window.MatrixIDE;};
  ide.i18n=window.MatrixI18n;
  ide.t=(...args)=>ide.i18n.t(...args);
  ide.label=(...args)=>ide.i18n.bind(...args);
  ide.localElement=(tag,cls,key,params={})=>ide.label(ide.element(tag,cls),key,params);
  ide.noticeKey=(key,params={})=>ide.notice(ide.t(key,params),key,params);
  ide.element=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
  ide.notice=(message,key=null,params={})=>{let e=document.getElementById('mx-ide-notice');if(!e){e=ide.element('div','mx-ide-notice');e.id='mx-ide-notice';e.dataset.matrixIdeOwned='';e.setAttribute('role','status');document.body.appendChild(e);}if(key)ide.label(e,key,params);else{for(const attr of [...e.attributes])if(attr.name.startsWith('data-mx-i18n-'))e.removeAttribute(attr.name);e.removeAttribute('data-matrix-i18n');e.textContent=message;}clearTimeout(ide.noticeTimer);ide.noticeTimer=setTimeout(()=>e.remove(),7000);};
  ide.safe=fn=>(...args)=>Promise.resolve().then(()=>fn(...args)).catch(e=>{console.warn('[Matrix IDE]',e);ide.notice(e.message||String(e));});
  ide.normalize=p=>p.replace(/\\/g,'/').replace(/\/$/,'');
  ide.join=(root,rel)=>{if(/(^|\/)\.\.(\/|$)|^[\\/]|^[a-z]:|\0/i.test(rel))throw Error(ide.t('error.path'));return ide.normalize(root)+'/'+rel;};
  ide.findScope=()=>{
    // Read the route context retained by the native composer. Never mutate React state.
    const visible=e=>e.getBoundingClientRect().width>0&&getComputedStyle(e).visibility==='visible'&&!e.closest('[inert]');
    const anchor=[...document.querySelectorAll('[data-codex-composer="true"]')].find(visible)||[...document.querySelectorAll('[data-app-shell-focus-area="main"]')].find(visible);
    let el=anchor,f=null;while(el&&!f){const key=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));if(key)f=el[key];el=el.parentElement;}
    const seen=new Set();function inspect(v,depth){if(!v||typeof v!=='object'||v instanceof Node||seen.has(v)||depth<0)return null;seen.add(v);try{if(typeof v.get==='function'&&typeof v.set==='function'&&v.value?.routeKind&&typeof v.getOwnValue==='function')return v;}catch{}
      if(depth)for(const[k,x]of Object.entries(v).slice(0,25)){if(['return','alternate','child','sibling','queryClient','store','window'].includes(k))continue;const result=inspect(x,depth-1);if(result)return result;}return null;}
    while(f){let r=inspect(f.memoizedProps,3);if(r)return r;let h=f.memoizedState,n=0;while(h&&n++<60){r=inspect(h.memoizedState,3);if(r)return r;h=h.next;}f=f.return;}
    throw Error(ide.t('error.scope'));
  };
  ide.connect=async()=>{
    if(!window.electronBridge)throw Error(ide.t('error.localOnly'));
    const index=Array.from(document.scripts).find(e=>/\/assets\/index-[^/]+\.js/.test(e.src));if(!index)throw Error(ide.t('error.adapter'));
    const indexSource=await fetch(index.src).then(r=>r.text()),base=new URL('.',index.src);
    const sharedName=indexSource.match(/\.\/app-shared-[\w]+\.js/)?.[0];const mainName=indexSource.match(/\.\/app-main-[\w]+\.js/)?.[0];if(!sharedName||!mainName)throw Error(ide.t('error.adapter'));
    const mainSource=await fetch(new URL(mainName,base)).then(r=>r.text()),initialName=mainSource.match(/\.\/app-initial-[\w]+\.js/)?.[0];if(!initialName)throw Error(ide.t('error.adapter'));
    const initialSource=await fetch(new URL(initialName,base)).then(r=>r.text());
    const openName=initialSource.match(/\.\/open-in-codex-[\w]+\.js/)?.[0],treeName=initialSource.match(/\.\/workspace-directory-entries-query-[\w]+\.js/)?.[0];if(!openName||!treeName)throw Error(ide.t('error.adapter'));
    const [openSource,treeSource,shared,initial]=await Promise.all([fetch(new URL(openName,base)).then(r=>r.text()),fetch(new URL(treeName,base)).then(r=>r.text()),import(new URL(sharedName,base).href),import(new URL(initialName,base).href)]);
    const localName=treeSource.match(/queryFn:[^=]+=>\s*([\w$]+)\(`workspace-directory-entries`/)?.[1];
    const alias=(source,local)=>local&&new RegExp('([\\w$]+) as '+local.replace(/\$/g,'\\$')+'(?=[,}])').exec(source)?.[1];
    const requestAlias=alias(treeSource,localName),openLocal=openSource.match(/case`file`:\{[^}]+?\bt=([\w$]+)\([\w$]+,[\w$]+\.path/)?.[1],openAlias=alias(openSource,openLocal);
    const panelLocal=openSource.match(/flatMap\([\w$]+=>[\w$]+\.get\(([\w$]+)\([\w$]+\)\.tabIds\$/)?.[1],panelAlias=alias(openSource,panelLocal);
    if(typeof shared[requestAlias]!=='function'||typeof initial[openAlias]!=='function'||typeof initial[panelAlias]!=='function')throw Error(ide.t('error.adapter'));
    ide.api={request:shared[requestAlias],openFile:initial[openAlias],panel:initial[panelAlias],compat:{sharedName,initialName,requestAlias,openAlias,panelAlias}};
    ide.request=(name,params,signal)=>ide.api.request(name,{params,signal});
    ide.refreshProjects=async()=>{const {value}=await ide.request('get-global-state',{key:'local-projects'});ide.projects=new Map(Object.values(value||{}).filter(p=>p.id&&p.rootPaths?.length).map(p=>[p.id,p]));};
    await ide.refreshProjects();
    const css=document.createElement('style');css.dataset.matrixIdeOwned='';css.textContent=`
      .mx-ide-chat-hidden{display:none!important}.mx-ide-tabs{display:flex;gap:2px;padding:3px 8px 4px 28px;font-size:11px}.mx-ide-tabs button,.mx-ide-tree button,.mx-ide-toolbar button{font:inherit;color:#8ddd9f;border:0;border-radius:4px;background:transparent;cursor:pointer;padding:4px 7px;text-align:left}.mx-ide-tabs button[aria-selected=true],.mx-ide-tree button[aria-selected=true]{background:#203b29!important;color:#baffca}.mx-ide-tabs button:hover,.mx-ide-tree button:hover,.mx-ide-toolbar button:hover{background:#203025!important}.mx-ide-tree{font:11px ui-monospace,monospace;margin:0 5px 5px 26px;max-height:360px;overflow:auto;border-left:1px solid #244430;padding-left:3px}.mx-ide-tree .mx-ide-tree-row{display:flex;align-items:center;width:100%;gap:5px;min-height:25px;white-space:nowrap}.mx-ide-tree-label{overflow:hidden;text-overflow:ellipsis}.mx-ide-tree-icon{color:#71b586;font-size:10px;min-width:19px}.mx-ide-tree-tools{display:flex;justify-content:space-between;gap:4px;color:#72a17e;padding:3px}.mx-ide-tree-message{padding:6px;color:#9bb5a2;white-space:normal}.mx-ide-toolbar{display:flex;flex-wrap:wrap;gap:3px;align-items:center;padding:5px 8px;background:#09120c!important;border-bottom:1px solid #244430!important;color:#adeabb;font:11px ui-monospace,monospace;flex-shrink:0;position:relative;z-index:4}.mx-ide-toolbar button{border:1px solid #244430!important;padding:4px 6px}.mx-ide-selection{margin-left:auto}.mx-ide-menu{position:fixed;background:#09120c!important;color:#b7f4c6;padding:4px;border:1px solid #315c3e;border-radius:6px;z-index:2147483500;font:12px ui-monospace,monospace;box-shadow:0 5px 24px #0008}.mx-ide-menu button{display:block;width:100%;text-align:left;background:none;color:inherit;border:0;padding:7px 12px;cursor:pointer}.mx-ide-menu button:hover{background:#1b3825}.mx-ide-notice{position:fixed;right:20px;bottom:24px;max-width:420px;padding:12px 16px;background:#13291b!important;color:#baffcc;border:1px solid #366548;border-radius:6px;z-index:2147483600;font:12px ui-monospace,monospace}.mx-ide-tabs button:focus-visible,.mx-ide-toolbar button:focus-visible,.mx-ide-tree button:focus-visible{outline:1px solid #72ea99;outline-offset:-1px}
      /* File names follow assistant text; type marks and expansion controls have separate contrast. */
      #root .mx-ide-tree .mx-ide-tree-row,#root .mx-ide-tree .mx-ide-tree-row .mx-ide-tree-label{color:var(--mx-bright,#e0ffe7)!important}
      #root .mx-ide-tree .mx-ide-tree-row[data-kind=directory] .mx-ide-tree-label{font-weight:500!important}
      #root .mx-ide-tree .mx-ide-tree-icon{color:#83a88d!important;font-size:8px!important;letter-spacing:-.25px;flex:0 0 19px;text-align:center;line-height:18px}
      #root .mx-ide-tree .mx-ide-tree-chevron{display:inline-flex;align-items:center;justify-content:center;width:19px;height:20px;font-size:0!important;flex:0 0 19px}
      #root .mx-ide-tree .mx-ide-tree-chevron::before{content:'';display:block;width:6px;height:6px;border-right:2px solid #bddcc6;border-bottom:2px solid #bddcc6;transform:rotate(-45deg);transform-origin:center}
      #root .mx-ide-tree .mx-ide-tree-row[aria-expanded=true] .mx-ide-tree-chevron::before{transform:rotate(45deg) translate(-1px,-1px)}
      #root .mx-ide-tree .mx-ide-tree-row[aria-selected=true]{background:#1b3022!important;border-radius:4px!important}
      #root .mx-ide-tree .mx-ide-tree-tools,#root .mx-ide-tree .mx-ide-tree-tools span{color:#a5c7ae!important}
      #root [data-app-action-sidebar-project-row] [data-marquee-content],#root [data-app-action-sidebar-project-row] [data-marquee-content] *{color:#d4dfc5!important;font-weight:600!important}
      #root [data-app-action-sidebar-project-row] [data-sidebar-project-drop-zone="project-icon"],#root [data-app-action-sidebar-project-row] [data-sidebar-project-drop-zone="project-icon"] svg,#root [data-app-action-sidebar-project-row] [data-sidebar-project-drop-zone="project-icon"] svg *{color:#8fae91!important}
      #root [data-app-action-sidebar-project-row]::before{content:'';display:block;width:6px;height:6px;flex:0 0 6px;margin-left:3px;margin-right:4px;border-right:2px solid #bddcc6;border-bottom:2px solid #bddcc6;transform:rotate(-45deg);transform-origin:center;transition:transform 180ms ease!important;pointer-events:none}
      #root [data-app-action-sidebar-project-row][aria-expanded=true]::before{transform:rotate(45deg)}
      #root .mx-ide-tree .mx-ide-tree-chevron::before{transition:transform 180ms ease!important}
      @media(prefers-reduced-motion:reduce){#root [data-app-action-sidebar-project-row]::before,#root .mx-ide-tree .mx-ide-tree-chevron::before{transition:none!important}}
`;document.head.appendChild(css);ide.cleanups.push(()=>css.remove());
  };
})();
