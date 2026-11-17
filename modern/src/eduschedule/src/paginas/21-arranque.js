/* ---------- arranque ---------- */
function quickSolve(st,ms){
  normalize(st);const mm=createModel(st);mm.load();const sv=mm.solver({keep:false,ms,level:'quick'});let pr;do{pr=sv.step(150);}while(!pr.done);
  const by=new Map(st.cards.map(c=>[c.id,c]));for(const r of sv.result()){const c=by.get(r.id);c.day=r.day;c.period=r.period;if(r.day!=null)c.r=r.r;}
}
/* ---------- ir buscar automaticamente os dados da escola à EduSpruce (escola, ano letivo, turmas, disciplinas, professor, salas, tempos e calendário) ---------- */
const ES_CORES=['#c2410c','#2f6fd6','#7c3aed','#a16207','#15803d','#0e7490','#be185d','#b91c1c','#9333ea','#475569','#0f766e','#64748b'];
function esSigla(n,usadas){const w=String(n).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9 ]/g,' ').split(/\s+/).filter(x=>x&&!/^(de|da|do|das|dos|e|a|o)$/i.test(x));
  let b=(w.length>1?w.map(x=>x[0]).join(''):(w[0]||'X').slice(0,4)).toUpperCase().slice(0,5)||'X',s=b,i=2;while(usadas.has(s))s=b+(i++);usadas.add(s);return s}
function esExemplo(st){return !st||st.example||st.name==='Escola Básica de Exemplo'}
function esImportar(st){
  const d=PONTE&&PONTE.escola&&PONTE.escola();if(!d||!(d.turmas||[]).length&&!d.escola)return {st,n:0};
  const novo=esExemplo(st);if(novo){st=baseState(d.escola||'A minha escola');if(d.ano)st.ano=d.ano;
    const slots=new Map();d.turmas.forEach(t=>t.aulas.forEach(a=>{if(a.ini!=null&&a.fim!=null)slots.set(a.ini+'-'+a.fim,[a.ini,a.fim])}));
    const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    const L=[...slots.values()].sort((x,y)=>x[0]-y[0]).filter((x,i,A)=>!i||x[0]>=A[i-1][1]);
    (L.length>=4?L.map(x=>[hm(x[0]),hm(x[1])]):GRELHA).forEach((t,i,A)=>st.periods.push({label:String(i+1),start:t[0],end:t[1],breakAfter:!!(A[i+1]&&A[i+1][0]>t[1])}));
    if(d.calendario){st.inicio=d.calendario.inicio||st.inicio;st.fim=d.calendario.fim||st.fim;if(d.calendario.ferias.length)st.ferias=d.calendario.ferias.map((f,i)=>({id:'f'+(i+1),nome:f.nome,de:f.de,ate:f.ate}))}}
  else{if(d.escola&&(!st.name||st.name==='A minha escola'))st.name=d.escola;if(d.ano&&!st.ano)st.ano=d.ano}
  const vis=st.esVistos=st.esVistos||[];let n=0;
  const sig=new Set([...st.subjects.map(x=>x.short),...st.teachers.map(x=>x.short)]);
  let prof=null;if(d.professor){prof=st.teachers.find(x=>x.name===d.professor);if(!prof){const c=esSigla(d.professor,sig);prof={id:c,short:c,name:d.professor,proc:'',prev:22,maxDay:6,maxSeg:0,maxSpan:0,umTurno:false,diasLivres:0,dep:''};st.teachers.push(prof)}}
  d.turmas.forEach(t=>{if(vis.includes(t.id))return;vis.push(t.id);if(!t.nome)return;n++;
    let c=st.classes.find(x=>x.name===t.nome);if(!c){c={id:'es'+uid(),name:t.nome,full:t.nome,roomId:'',dt:'',minDay:0,maxDay:7,tardesLivres:0,dep:''};st.classes.push(c)}
    t.salas.forEach(sl=>{let r=st.rooms.find(x=>x.name===sl||x.name==='Sala '+sl);if(!r){r={id:'es'+uid(),name:/^\d/.test(sl)?'Sala '+sl:sl,alt:'',ed:''};st.rooms.push(r)}if(!c.roomId&&t.salas.length===1)c.roomId=r.id});
    if(!t.disciplina)return;let s=st.subjects.find(x=>x.name===t.disciplina);
    if(!s){const k=esSigla(t.disciplina,sig);s={id:k,short:k,name:t.disciplina,color:ES_CORES[st.subjects.length%ES_CORES.length],roomId:'',fator:50,seq:'',marg:false,cnl:false};st.subjects.push(s)}
    if(t.tempos&&!st.lessons.some(l=>l.classIds.includes(c.id)&&l.linhas.some(x=>x.s===s.id)))st.lessons.push({id:uid(),classIds:[c.id],linhas:[{s:s.id,t:prof?prof.id:'',r:'',tip:''}],tl:t.tempos,duplos:0,blocos:'',per:''});
  });
  if(novo||n){syncCards(st)}return {st,n,novo}}
function start(){
  if(!PONTE){document.body.innerHTML='<div style="font:16px system-ui;max-width:520px;margin:15vh auto;padding:24px;text-align:center"><b>O EduSchedule abre-se dentro da EduSpruce.</b><br><br><a href="./">Abrir a EduSpruce</a></div>';return;}
  $('#menu-btn').append(ic('menu','w-5 h-5'));$('#es-casa').append(ic('home','w-5 h-5'));$('#es-casa').addEventListener('click',()=>PONTE.voltar());$('#undo').append(ic('undo'));$('#redo').append(ic('redo'));$('#logo').append(ic('grid','w-5 h-5'));
  $('#foot').textContent='Os dados ficam guardados na sua conta EduSpruce.';
  let raw=null;try{raw=localStorage.getItem(LS)||localStorage.getItem(LS_V2);}catch(e){}
  if(raw){try{S=normalize(JSON.parse(raw));}catch(e){S=null;}}
  {const r=esImportar(S);if(r.st!==S||r.n){S=normalize(r.st);if(r.novo||r.n)setTimeout(()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}if(typeof toast==='function')toast(r.novo?'Dados da escola obtidos da EduSpruce.':r.n+' turma(s) nova(s) obtida(s) da EduSpruce.')},0)}}
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
