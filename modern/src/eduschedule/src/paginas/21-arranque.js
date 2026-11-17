/* ---------- arranque ---------- */
function quickSolve(st,ms){
  normalize(st);const mm=createModel(st);mm.load();const sv=mm.solver({keep:false,ms,level:'quick'});let pr;do{pr=sv.step(150);}while(!pr.done);
  const by=new Map(st.cards.map(c=>[c.id,c]));for(const r of sv.result()){const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.day!=null)c.r=r.r;}
}
function start(){
  if(!PONTE){document.body.innerHTML='<div style="font:16px system-ui;max-width:520px;margin:15vh auto;padding:24px;text-align:center"><b>O EduSchedule abre-se dentro da EduSpruce.</b><br><br><a href="./">Abrir a EduSpruce</a></div>';return;}
  $('#menu-btn').append(ic('menu','w-5 h-5'));$('#es-casa').append(ic('home','w-5 h-5'));$('#es-casa').addEventListener('click',()=>PONTE.voltar());$('#undo').append(ic('undo'));$('#redo').append(ic('redo'));$('#logo').append(ic('grid','w-5 h-5'));
  $('#foot').textContent='Os dados ficam guardados na sua conta EduSpruce.';
  let raw=null;try{raw=localStorage.getItem(LS)||localStorage.getItem(LS_V2);}catch(e){}
  if(raw){try{S=normalize(JSON.parse(raw));}catch(e){S=null;}}
  if(!S){S=sample();quickSolve(S,900);}
  $('#school').addEventListener('change',e=>mutate(()=>{S.name=e.target.value.trim()||'A minha escola';}));
  $('#ano').addEventListener('change',e=>mutate(()=>{S.ano=e.target.value.trim()||S.ano;}));
  $('#undo').addEventListener('click',desfazer);$('#redo').addEventListener('click',()=>step(redo,undo));
  let tema=null;try{tema=localStorage.getItem('ph-tema');}catch(e){}if(!tema&&PONTE.sge())tema='sge';
  $('#tema').addEventListener('click',()=>{const dark=tema?tema==='escuro':window.matchMedia('(prefers-color-scheme: dark)').matches;tema=dark?'claro':'escuro';applyTheme(tema);});
  applyTheme(tema);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&ui.sel&&!$('#dlg').open){ui.sel=null;render();return;}
    if(!(e.ctrlKey||e.metaKey)||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||busy)return;
    const k=e.key.toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();desfazer();}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();step(redo,undo);}
  });
  window.addEventListener('beforeunload',()=>{if(saveState==='pend')try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}});
  window.addEventListener('hashchange',route);route();
  if(window.claude&&window.claude.use)window.claude.use('downloads').then(x=>{dl=x;}).catch(()=>{});
}
if(typeof document!=='undefined')start();
