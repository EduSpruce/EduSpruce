/* ---------- arranque ---------- */
function quickSolve(st,ms){
  normalize(st);const mm=createModel(st);mm.load();const sv=mm.solver({keep:false,ms,level:'quick'});let pr;do{pr=sv.step(150);}while(!pr.done);
  const by=new Map(st.cards.map(c=>[c.id,c]));for(const r of sv.result()){const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.day!=null)c.r=r.r;}
}
/* ---------- como na EduSpruce: um horário por escola e por ano letivo; a escola, o ano e o calendário escolar vêm automaticamente da EduSpruce (turmas, professores, salas e disciplinas acrescentam-se à mão) ---------- */
function esExemplo(st){return !st||st.example||st.name==='Escola Básica de Exemplo'}
function esImportar(st){
  const d=PONTE&&!PONTE.equipa&&PONTE.escola&&PONTE.escola();if(!d)return st;
  if(esExemplo(st)){st=baseState(d.escola);if(d.calendario)st.ferias=[];GRELHA.forEach((t,i)=>st.periods.push({label:String(i+1),start:t[0],end:t[1],breakAfter:!!t[2]}));}
  st.name=d.escola||st.name;st.ano=d.ano||st.ano;
  const c=d.calendario;if(c){st.inicio=c.inicio||st.inicio;st.fim=c.fim||st.fim;
    const meus=(st.ferias||[]).filter(f=>!f.es);st.ferias=c.ferias.map((f,i)=>({id:'es'+(i+1),nome:f.nome,de:f.de,ate:f.ate,es:1})).concat(meus.filter(f=>!c.ferias.some(x=>x.de===f.de&&x.ate===f.ate)))}
  return st}
function start(){
  if(!PONTE){document.body.innerHTML='<div style="font:16px system-ui;max-width:520px;margin:15vh auto;padding:24px;text-align:center"><b>O EduSchedule abre-se dentro da EduSpruce.</b><br><br><a href="./">Abrir a EduSpruce</a></div>';return;}
  $('#menu-btn').append(ic('menu','w-5 h-5'));$('#es-casa').append(ic('home','w-5 h-5'));$('#es-casa').addEventListener('click',()=>PONTE.voltar());$('#undo').append(ic('undo'));$('#redo').append(ic('redo'));$('#logo').append(ic('grid','w-5 h-5'));
  $('#foot').textContent='Os dados ficam guardados na sua conta EduSpruce.';
  let raw=null;try{raw=localStorage.getItem(LS)||localStorage.getItem(LS_V2);}catch(e){}
  if(raw){try{S=normalize(JSON.parse(raw));}catch(e){S=null;}}
  if(PONTE.escola){const antes=S&&JSON.stringify(S);const r=esImportar(S);S=r?normalize(r):S;if(JSON.stringify(S)!==antes)setTimeout(()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}},0)}
  if(!S){S=sample();quickSolve(S,900);}
  if(PONTE.escola&&!PONTE.equipa){for(const x of ['#school','#ano']){$(x).readOnly=true;$(x).title='Vem da EduSpruce: escolha a escola e o ano letivo na EduSpruce';}}
  else{$('#school').addEventListener('change',e=>mutate(()=>{S.name=e.target.value.trim()||'A minha escola';}));
  $('#ano').addEventListener('change',e=>mutate(()=>{S.ano=e.target.value.trim()||S.ano;}));}
  $('#undo').addEventListener('click',desfazer);$('#redo').addEventListener('click',()=>step(redo,undo));
  let tema=null;try{tema=localStorage.getItem('ph-tema');}catch(e){}if(!tema&&PONTE.sge())tema='sge';
  $('#tema').addEventListener('click',()=>{const dark=tema?tema==='escuro':window.matchMedia('(prefers-color-scheme: dark)').matches;tema=dark?'claro':'escuro';applyTheme(tema);});
  applyTheme(tema);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&ui.sel&&!$('#dlg').open){ui.sel=null;render();return;}
    if(!(e.ctrlKey||e.metaKey)||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||busy)return;
    const k=String(e.key||'').toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();desfazer();}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();step(redo,undo);}
  });
  window.addEventListener('beforeunload',()=>{if(saveState==='pend')try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}});
  window.addEventListener('hashchange',route);route();
  if(window.claude&&window.claude.use)window.claude.use('downloads').then(x=>{dl=x;}).catch(()=>{});
}
if(typeof document!=='undefined')start();
