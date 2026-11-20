/* ===== Planeador de Horários: interface (parte 1: base, estado, estrutura) ===== */
'use strict';
const LS='planeador-horarios-v3',LS_V2='planeador-horarios-v2',$=(s,r)=>(r||document).querySelector(s);
const KINDS={c:['classes','Turma','Turmas'],t:['teachers','Professor','Professores'],r:['rooms','Sala','Salas'],s:['subjects','Disciplina','Disciplinas']};
const DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb'];
const PERL={A:'sem. A',B:'sem. B',S1:'1.º sem.',S2:'2.º sem.'};
const ICONS={
  home:'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',db:'M4 6.5C4 5 7.6 3.5 12 3.5s8 1.5 8 3-3.6 3-8 3-8-1.5-8-3zM4 6.5v5.5c0 1.5 3.6 3 8 3s8-1.5 8-3V6.5M4 12v5.5c0 1.5 3.6 3 8 3s8-1.5 8-3V12',
  book:'M5 4.5h13.5v15H6.5A1.5 1.5 0 0 1 5 18zM5 18V4.5M9 8.5h6M9 12h6',users:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20v-1a6.5 6.5 0 0 1 13 0v1M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.2a6 6 0 0 1 3.5 5.3v.5',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.2 2',sliders:'M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1M15 5v4M9 10v4M17 15v4',
  bolt:'M13 2.5 4.5 13.5H11L10 21.5l9.5-11.5H13z',grid:'M3.5 5h17v14h-17zM3.5 10h17M3.5 14.5h17M9 5v14M15 5v14',check:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.2l2.8 2.8L16 9.5',
  swap:'M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7',meet:'M4 5h16v11H10l-5 4v-4H4zM8 9h8M8 12h5',eye:'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  list:'M8.5 6h12M8.5 12h12M8.5 18h12M4 6h.01M4 12h.01M4 18h.01',print:'M7 8V3.5h10V8M7 17H4.5v-7A2 2 0 0 1 6.5 8h11a2 2 0 0 1 2 2v7H17M7 14h10v6.5H7z',file:'M6.5 3h7.5l4.5 4.5V21h-12zM14 3v4.5h4.5M9.5 13h5M9.5 16.5h5',
  sun:'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',moon:'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  undo:'M8 6 4 10l4 4M4 10h10a5.5 5.5 0 0 1 0 11h-3',redo:'M16 6l4 4-4 4M20 10H10a5.5 5.5 0 0 0 0 11h3',menu:'M4 6.5h16M4 12h16M4 17.5h16',search:'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 20 20',
  info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.5h.01',warn:'M12 4 2.5 20h19zM12 10v4.5M12 17.5h.01',play:'M7 4.5v15l12-7.5z',stop:'M6.5 6.5h11v11h-11z',lock:'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z',cal:'M4.5 6h15v14h-15zM4.5 10h15M8.5 3.5v4M15.5 3.5v4'};
const NAV=[
  {t:'',items:[['inicio','Painel','home'],['ajuda','Ajuda','check']]},
  {t:'Preparar',items:[['dados','Dados da escola','db'],['aulas','Aulas','book'],['servico','Serviço docente','users'],['alunos','Alunos e cursos','users'],['requisitos','Disponibilidades','clock'],['ponderacoes','Prioridades','sliders']]},
  {t:'Construir',items:[['otimizacao','Otimização','bolt'],['horarios','Horários','grid'],['diagnostico','Diagnóstico','check']]},
  {t:'Gerir',items:[['diario','Gestão diária','list'],['substituicoes','Substituições','swap'],['exames','Exames','cal'],['anual','Planificação anual','cal'],['reunioes','Reuniões','meet'],['vigilancias','Vigilâncias','eye']]},
  {t:'Saídas',items:[['listagens','Listagens','list'],['impressao','Impressão','print'],['ficheiro','Ficheiro','file'],['definicoes','Definições','sliders']]}];
const PAGES={};
const APP={nome:'EduSchedule',ver:'0.1',data:'2026-11-16'};
const TEMAS=[['claro','Claro (EduSchedule)'],['escuro','Escuro (EduSchedule)'],['sge','SGE (EduSpruce)'],['sge-escuro','SGE escuro (EduSpruce)'],['corporate','Corporativo'],['emerald','Esmeralda'],['nord','Nórdico'],['winter','Inverno'],['cupcake','Pastel'],['dim','Penumbra'],['night','Noite'],['dracula','Drácula'],['sunset','Pôr do sol'],['pessoal','Personalizado']],TEMAS_ESC=['escuro','sge-escuro','dim','night','dracula','sunset'];
let S=null,undo=[],redo=[],MV=1,busy=false,dl=null,fileHandle=null,fileName='',saveT=null,saveState='ls';
const ui={tab:'inicio',kind:'c',id:null,sel:null,fase:0,visao:'ind',dataTab:'classes',avKind:'c',avId:null,brush:-3,fC:'',fT:'',fS:'',svc:'',cdate:new Date().toISOString().slice(0,10),cteacher:'',pg:{},q:{},serie:{},dCat:'',dSev:'',clash:new Set(),lst:'dt',prn:{c:true,t:false,r:false}};
const cache={v:0,m:null,ix:null,is:null,rep:null};

/* ---------- DOM ---------- */
function h(tag,attrs){
  const e=document.createElement(tag);let val;
  for(const k in attrs||{}){const v=attrs[k];if(v==null||v===false)continue;
    if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(k==='value')val=v;else if(k==='checked'||k==='disabled'||k==='draggable'||k==='open')e[k]=!!v;else e.setAttribute(k,v===true?'':v);}
  for(const c of Array.prototype.slice.call(arguments,2).flat(Infinity)){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c));}
  if(val!==undefined)e.value=val;return e;
}
function ic(name,cls){
  const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');
  for(const [k,v] of [['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','1.8'],['stroke-linecap','round'],['stroke-linejoin','round'],['class',cls||'w-4 h-4 shrink-0'],['aria-hidden','true']])s.setAttribute(k,v);
  p.setAttribute('d',ICONS[name]||'');s.append(p);return s;
}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const col=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c:'#6b7280';
const uniq=a=>[...new Set(a.filter(Boolean))];
const btn=(label,onclick,cls,attrs)=>h('button',Object.assign({type:'button',class:'btn '+(cls||''),onclick},attrs||{}),label);
const optsOf=(arr,empty)=>(empty!=null?[['',empty]]:[]).concat(arr.map(x=>[x.id,x.name]));
function selEl(id,value,items,onchange,label,cls){return h('select',{id,class:'select select-sm '+(cls||''),'aria-label':label,title:label,value:value==null?'':value,onchange:e=>onchange(e.target.value)},items.map(it=>h('option',{value:it[0]},it[1])));}
function tabsEl(items,active,onPick,label){return h('div',{role:'tablist','aria-label':label,class:'tabs tabs-box tabs-sm w-fit flex-wrap noprint'},items.map(it=>h('button',{type:'button',role:'tab','aria-selected':String(it[0]===active),class:'tab'+(it[0]===active?' tab-active':''),onclick:()=>onPick(it[0])},it[1])));}
function badge(text,kind){return h('span',{class:'badge badge-soft badge-sm whitespace-nowrap '+({bad:'badge-error',warn:'badge-warning',ok:'badge-success',info:'badge-info',mute:'badge-ghost'}[kind]||'badge-neutral')},text);}
function panel(title){return h('section',{class:'card card-border border-base-300 bg-base-100'},h('div',{class:'card-body p-4 gap-3 min-w-0'},title?h('h3',{class:'card-title text-base'},title):null,Array.prototype.slice.call(arguments,1)));}
function pageHead(title,sub){return h('div',{class:'flex flex-wrap items-center gap-x-3 gap-y-2'},h('h2',{class:'text-xl font-bold'},title),sub?h('span',{class:'text-sm opacity-70'},sub):null,h('span',{class:'grow'}),Array.prototype.slice.call(arguments,2));}
function note(kind){return h('div',{role:'note',class:'alert alert-soft text-sm '+({info:'alert-info',warn:'alert-warning',ok:'alert-success',bad:'alert-error'}[kind]||'')},ic(kind==='warn'||kind==='bad'?'warn':'info'),h('div',{class:'flex flex-wrap items-center gap-2'},Array.prototype.slice.call(arguments,1)));}
function field(label,control,hint){return h('label',{class:'flex flex-col gap-1 text-sm'},h('span',{class:'font-medium'},label),control,hint?h('span',{class:'text-xs opacity-60'},hint):null);}
function tableWrap(table){return h('div',{class:'overflow-x-auto'},table);}
function pager(key,total,per){
  const pages=Math.max(1,Math.ceil(total/per)),p=Math.max(0,Math.min(ui.pg[key]||0,pages-1));ui.pg[key]=p;
  return {from:p*per,to:Math.min(total,(p+1)*per),el:pages>1?h('div',{class:'join noprint'},btn('‹',()=>{ui.pg[key]=p-1;render();},'btn-sm join-item',{disabled:p===0,'aria-label':'Página anterior'}),
    h('span',{class:'btn btn-sm join-item pointer-events-none num'},(p+1)+' / '+pages),btn('›',()=>{ui.pg[key]=p+1;render();},'btn-sm join-item',{disabled:p>=pages-1,'aria-label':'Página seguinte'})):null};
}
function searchEl(key,ph){return h('label',{class:'input input-sm w-52 noprint'},ic('search','w-4 h-4 opacity-60'),h('input',{type:'search',id:'q-'+key,placeholder:ph||'Procurar','aria-label':ph||'Procurar',value:ui.q[key]||'',oninput:e=>{ui.q[key]=e.target.value;ui.pg[key]=0;render();}}));}
const matchQ=(key,texts)=>{const q=(ui.q[key]||'').trim().toLowerCase();return !q||texts.some(t=>String(t||'').toLowerCase().includes(q));};
function toast(msg,label,fn,kind){
  const box=$('#toast'),el=h('div',{class:'alert shadow-lg text-sm max-w-md '+(kind==='bad'?'alert-error':kind==='ok'?'alert-success':'')},h('span',{},msg),label?btn(label,()=>{el.remove();fn();},'btn-sm'):null);
  box.append(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>el.remove(),label?8000:4200);
}
function openDlg(title,body,actions,wide){
  const b=$('#dlg-box');b.className='modal-box '+(wide?'max-w-5xl':'max-w-3xl');
  b.replaceChildren(h('h3',{class:'text-lg font-bold mb-3'},title),body,h('div',{class:'modal-action'},actions));$('#dlg').showModal();
}
const closeDlg=()=>$('#dlg').close();

/* ---------- estado, índices e modelo ---------- */
function buildIx(){
  const ix={c:new Map(),t:new Map(),r:new Map(),s:new Map(),l:new Map(),cl:new Map(),lt:new Map(),free:[]};
  for(const x of S.classes)ix.c.set(x.id,x);for(const x of S.teachers)ix.t.set(x.id,x);for(const x of S.rooms)ix.r.set(x.id,x);for(const x of S.subjects)ix.s.set(x.id,x);
  for(const l of S.lessons){ix.l.set(l.id,l);for(const ln of l.linhas){if(ln.t){let a=ix.lt.get(ln.t);if(!a)ix.lt.set(ln.t,a=[]);a.push([l,ln]);}else ix.free.push([l,ln]);}}
  for(const c of S.cards){let a=ix.cl.get(c.lessonId);if(!a)ix.cl.set(c.lessonId,a=[]);a.push(c);}
  return ix;
}
function M(){if(cache.v!==MV){cache.ix=buildIx();const m=createModel(S);m.load();cache.m=m;cache.is=null;cache.rep=null;cache.v=MV;}return cache.m;}
const IX=()=>(M(),cache.ix);
const REP=()=>(M(),cache.rep||(cache.rep=cache.m.report()));
const ISS=()=>(M(),cache.is||(cache.is=issues()));
const gradeDe=cid=>{const c=cid&&IX().c.get(cid),g=c&&c.grelha&&S.grelhas.find(x=>x.id===c.grelha);return g&&g.periods.length===S.periods.length?g.periods:null;};
const tempoDe=(l,i)=>{const g=gradeDe(l&&l.classIds[0]),p=S.periods[i];return g?Object.assign({},p,{start:g[i].start||p.start,end:g[i].end||p.end}):p;};
function perOptions(){const K=cicloK(S),w=[['','Todas as semanas']];if(K===2)w.push(['A','Semana A'],['B','Semana B']);else{for(let i=1;i<=K;i++)w.push(['W'+i,'Semana '+i+' de '+K]);for(let i=1;i<=K;i++)for(let j=i+1;j<=K;j++)w.push(['W'+i+j,'Semanas '+i+' e '+j+' de '+K]);if(K===4)for(let i=1;i<=4;i++)w.push(['W'+[1,2,3,4].filter(x=>x!==i).join(''),'Todas menos a semana '+i]);}
  const out=[];for(const [c,t] of w)for(const [sc,stx] of [['',''],['S1',' · 1.º semestre'],['S2',' · 2.º semestre']]){const code=c&&sc?c+'/'+sc:c||sc;out.push([code,c||!sc?t+stx:stx.slice(3).replace(/^./,x=>x.toUpperCase())]);}return out;}
const nm=(k,id)=>{const x=IX()[k].get(id);return x?x.name:'?';};
const sh=(k,id)=>{const x=IX()[k].get(id);return x?(x.short||x.name):'?';};
const list=k=>S[KINDS[k][0]];
function roomOfLine(l,ln){const ix=IX();if(ln.r)return ln.r;const s=ix.s.get(ln.s);if(s&&s.roomId)return s.roomId;if(l.classIds.length){const c=ix.c.get(l.classIds[0]);if(c&&c.roomId)return c.roomId;}return '';}
function roomsOfCard(c){const l=IX().l.get(c.lessonId);return l.linhas.map((ln,i)=>{const x=c.day!=null&&c.r&&c.r[i];return x==='-'?'':(x||roomOfLine(l,ln));});}
function lessonLabel(l){return (l.classIds.map(i=>nm('c',i)).join('+')||uniq(l.linhas.map(ln=>ln.t&&sh('t',ln.t))).join('/'))+' '+uniq(l.linhas.map(ln=>sh('s',ln.s))).join('/');}
function cardsFor(kind,id){const m=M(),r=m.resIdx(kind,id);if(r===undefined)return [];return m.cardsOf(r).map(a=>S.cards[a]);}
function setStatus(){
  const el=$('#status');if(!el)return;
  el.textContent=busy?'A otimizar…':saveState==='pend'?'A guardar…':saveState==='file'?'Guardado em '+fileName:saveState==='err'?'Não foi possível guardar: descarregue uma cópia em Ficheiro':'Guardado na sua conta';
}
function save(){clearTimeout(saveT);saveState='pend';setStatus();saveT=setTimeout(doSave,400);}
async function doSave(){
  const txt=JSON.stringify(S);let ok=true;try{localStorage.setItem(LS,txt);}catch(e){ok=false;}
  if(fileHandle){try{const w=await fileHandle.createWritable();await w.write(txt);await w.close();saveState='file';}catch(e){fileHandle=null;saveState=ok?'ls':'err';toast('Deixou de ser possível escrever no ficheiro ligado. Os dados continuam guardados na conta.',null,null,'bad');}}
  else saveState=ok?'ls':'err';
  setStatus();
}
function mutate(fn,force){
  if(busy){toast('A otimização está a decorrer. Pare-a antes de alterar os dados.');return false;}
  if(S.ro&&!force){toast('Modo só de leitura: desligue-o em Ficheiro, Segurança, para alterar os dados.');return false;}
  const before=JSON.stringify(S),sig=()=>JSON.stringify(S.cards.map(c=>[c.id,c.day,c.period,c.r])),s0=S.bloq&&!force?sig():null;fn();
  if(s0!==null&&sig()!==s0){S=JSON.parse(before);MV++;render();toast('O horário está bloqueado: desbloqueie-o em Ficheiro, Segurança, para mudar aulas de tempo ou de sala.');return false;}
  delete S.example;delete S.teste;syncCards(S);bkAuto(before);(S.log=S.log||[]).push([Date.now(),ui.tab]);if(S.log.length>300)S.log.splice(0,S.log.length-300);
  undo.push(before);undoT.push([Date.now(),ui.tab]);while(undoT.length>200)undoT.shift();const lim=before.length>1500000?8:before.length>400000?25:100;while(undo.length>lim)undo.shift();redo=[];MV++;save();render();return true;
}
function step(from,to){if(!from.length||busy)return;to.push(JSON.stringify(S));S=JSON.parse(from.pop());MV++;ui.sel=null;save();render();}
const desfazer=()=>step(undo,redo);
function replaceAll(st,msg){if(busy)return;const before=JSON.stringify(S);S=normalize(st);undo.push(before);while(undo.length>8)undo.shift();redo=[];MV++;ui.sel=null;ui.id=null;ui.pg={};save();render();toast(msg,'Anular',desfazer);}

/* ---------- legenda em minutos ---------- */
function legenda(tid){
  const rows=new Map(),ix=IX();
  for(const [l,ln] of ix.lt.get(tid)||[]){if(l.ign)continue;const s=ix.s.get(ln.s)||{};
    let r=rows.get(ln.s);if(!r)rows.set(ln.s,r={s,tl:0,min:0,cls:new Set()});
    const fr=perFrac(l.per,cicloK(S));r.tl+=l.tl*fr;r.min+=l.valor?+l.valor:l.tl*fr*(+s.fator||S.tlMin);l.classIds.forEach(i=>r.cls.add(nm('c',i)));}
  const arr=[...rows.values()],sum=(f,k)=>arr.filter(f).reduce((a,r)=>a+r[k],0);
  return {arr,tlLet:sum(r=>!r.s.cnl,'tl'),minLet:sum(r=>!r.s.cnl,'min'),tlCnl:sum(r=>r.s.cnl,'tl'),minCnl:sum(r=>r.s.cnl,'min')};
}
function legendaEl(tid){
  const g=legenda(tid),falta=S.alvo-g.minLet;
  const row=r=>h('tr',{},h('td',{},h('span',{class:'sw',style:'--sc:'+col(r.s.color)}),r.s.name||'?'),h('td',{},[...r.cls].join(', ')),h('td',{class:'num'},String(r.tl)),h('td',{class:'num'},String(r.min)));
  return tableWrap(h('table',{class:'table table-sm'},h('thead',{},h('tr',{},h('th',{},'Disciplina'),h('th',{},'Turmas'),h('th',{class:'num'},'TL'),h('th',{class:'num'},'Minutos'))),
    h('tbody',{},g.arr.filter(r=>!r.s.cnl).map(row),
      h('tr',{class:'font-semibold'},h('td',{colspan:2},'Componente letiva ',badge(falta===0?'completa':falta>0?'faltam '+falta+' min':'excede '+(-falta)+' min',falta===0?'ok':falta>0?'warn':'bad')),h('td',{class:'num'},String(g.tlLet)),h('td',{class:'num'},g.minLet+' / '+S.alvo)),
      g.tlCnl?g.arr.filter(r=>r.s.cnl).map(row):null,
      g.tlCnl?h('tr',{class:'font-semibold'},h('td',{colspan:2},'Componente não letiva'),h('td',{class:'num'},String(g.tlCnl)),h('td',{class:'num'},String(g.minCnl))):null)));
}

/* ---------- diagnóstico ---------- */
function issues(){
  const m=cache.m,ix=cache.ix,out=[],clash=new Set(),P=m.P;
  const slotTxt=s=>S.days[(s/P)|0]+', '+S.periods[s%P].label+'.º tempo';
  const goL=l=>l.classIds.length?{kind:'c',id:l.classIds[0]}:{kind:'t',id:(l.linhas.find(ln=>ln.t)||{}).t};
  const add=(sev,cat,text,go)=>out.push({sev,cat,text,go});
  for(const l of S.lessons){
    if(l.ign)continue;let n=0,dead=false;
    for(const c of ix.cl.get(l.id)||[])if(c.day==null){n+=c.len;if(!m.feasCount(m.cardIdx(c.id)))dead=true;}
    if(n)add('bad','Por colocar',lessonLabel(l)+': '+n+' TL por colocar'+(dead?'. Não tem nenhum tempo possível: reveja os tempos impedidos e os intervalos':''),goL(l));
    if(l.linhas.some(ln=>!ln.t))add('warn','Sem professor',lessonLabel(l)+': sem professor atribuído',goL(l));
  }
  for(const k of m.clashes(300)){
    if(k.r>=m.G0){const g=m.stuG[k.r-m.G0];k.cards.forEach(a=>clash.add(S.cards[a].id));add('bad','Choque de alunos',g.alunos.length+(g.alunos.length>1?' alunos':' aluno')+' de '+nm('c',g.classId)+' com '+k.cards.length+' aulas em simultâneo ('+slotTxt(k.s)+'): '+k.cards.map(a=>lessonLabel(ix.l.get(S.cards[a].lessonId))).join('; '),{kind:'c',id:g.classId});continue;}
    k.cards.forEach(a=>clash.add(S.cards[a].id));const kind=k.r<m.T0?'c':k.r<m.R0?'t':'r',ent=kind==='c'?S.classes[k.r]:kind==='t'?S.teachers[k.r-m.T0]:S.rooms[k.r-m.R0];
    add('bad','Sobreposição',KINDS[kind][1]+' '+ent.name+' com '+k.cards.length+' aulas em simultâneo ('+slotTxt(k.s)+'): '+k.cards.map(a=>lessonLabel(ix.l.get(S.cards[a].lessonId))).join('; '),{kind,id:ent.id});
  }
  for(let a=0;a<m.N;a++)if(m.isBlocked(a)){const c=S.cards[a],l=ix.l.get(c.lessonId);clash.add(c.id);add('bad','Tempo impedido',lessonLabel(l)+' ('+slotTxt(m.posOf(a))+') está num tempo impedido ou atravessa um intervalo',goL(l));}
  S.classes.forEach((cl,ci)=>{
    const go={kind:'c',id:cl.id};
    for(let d=0;d<m.D;d++){
      const inf=m.dayInfo(ci,d);if(!inf.n){if(cl.minDay>0)add('warn','TL por dia',cl.name+': sem aulas na '+S.days[d]+' (mínimo '+cl.minDay+')',go);continue;}
      if(inf.gaps>0)add('warn','Furos',cl.name+': '+inf.gaps+' furo(s) na '+S.days[d],go);
      if(cl.maxDay&&inf.n>cl.maxDay)add('warn','TL por dia',cl.name+': '+inf.n+' TL na '+S.days[d]+' (máximo '+cl.maxDay+')',go);
      if(cl.minDay&&inf.n<cl.minDay)add('warn','TL por dia',cl.name+': '+inf.n+' TL na '+S.days[d]+' (mínimo '+cl.minDay+')',go);
      if(inf.lunch)add('warn','Almoço',cl.name+': sem tempo livre para almoço na '+S.days[d],go);
      const seen=new Map();
      for(let p=inf.first;p<=inf.last;p++)for(const a of m.cardsAt(ci,d*P+p)){if(m.posOf(a)!==d*P+p)continue;const sj=ix.l.get(S.cards[a].lessonId).linhas[0].s;seen.set(sj,(seen.get(sj)||0)+1);}
      for(const [sj,v] of seen)if(v>1)add('warn','Repetição',cl.name+': '+nm('s',sj)+' aparece '+v+' vezes separadas na '+S.days[d],go);
    }
  });
  S.teachers.forEach((t,ti)=>{
    const r=m.T0+ti,go={kind:'t',id:t.id};
    if(t.prev){let tl=0;for(const [l] of ix.lt.get(t.id)||[])if(!l.ign)tl+=l.tl*perFrac(l.per,cicloK(S));if(tl>t.prev)add('warn','Serviço',t.name+': '+tl+' TL atribuídos, previstos '+t.prev,go);}
    for(let d=0;d<m.D;d++){const inf=m.dayInfo(r,d);if(!inf.n)continue;
      if(t.maxDay&&inf.n>t.maxDay)add('warn','TL por dia',t.name+': '+inf.n+' TL na '+S.days[d]+' (máximo '+t.maxDay+')',go);
      if(inf.lunch)add('warn','Almoço',t.name+': sem tempo livre para almoço na '+S.days[d],go);}
  });
  let bad=0;for(const x of out)if(x.sev==='bad')bad++;
  return {list:out,clash,bad,warn:out.length-bad};
}

/* ---------- estrutura da página ---------- */
function applyTheme(t){const r=document.documentElement;if(t)r.setAttribute('data-theme',t);else r.removeAttribute('data-theme');try{if(t)localStorage.setItem('ph-tema',t);else localStorage.removeItem('ph-tema');}catch(e){}
  const dark=t?TEMAS_ESC.includes(t):window.matchMedia('(prefers-color-scheme: dark)').matches;$('#tema').replaceChildren(ic(dark?'sun':'moon','w-5 h-5'));}
function renderNav(){
  const is=ISS(),rep=REP(),items=[];
  for(const g of NAV){
    if(g.t)items.push(h('li',{class:'menu-title pt-3'},g.t));
    for(const it of g.items){
      let extra=null;
      if(it[0]==='diagnostico'&&is.bad)extra=h('span',{class:'badge badge-error badge-xs num'},String(is.bad));
      else if(it[0]==='otimizacao'&&busy)extra=h('span',{class:'loading loading-spinner loading-xs'});
      else if(it[0]==='horarios'&&rep.total)extra=h('span',{class:'text-[0.65rem] opacity-60 num'},Math.floor(rep.placed/rep.total*100)+'%');
      items.push(h('li',{},h('a',{href:'#'+it[0],class:ui.tab===it[0]?'menu-active':'','aria-current':ui.tab===it[0]?'page':null,onclick:()=>{$('#nav-drawer').checked=false;}},ic(it[2]),h('span',{class:'grow'},it[1]),extra)));
    }
  }
  $('#nav').replaceChildren.apply($('#nav'),items);
}
function render(){
  if(!S)return;
  const main=$('#main'),ae=document.activeElement,fid=ae&&ae.id&&main.contains(ae)?ae.id:null;let ss=null;
  if(fid)try{if(ae.selectionStart!=null)ss=[ae.selectionStart,ae.selectionEnd];}catch(e){}
  const is=ISS();ui.clash=is.clash;renderNav();
  for(const [sel,k] of [['#school','name'],['#ano','ano']]){const el=$(sel);if(document.activeElement!==el)el.value=S[k];el.disabled=busy;}
  $('#undo').disabled=!undo.length||busy;$('#redo').disabled=!redo.length||busy;
  const sy=window.scrollY;main.replaceChildren();(PAGES[ui.tab]||PAGES.inicio)(main);
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});if(ss&&el.setSelectionRange)try{el.setSelectionRange(ss[0],ss[1]);}catch(e){}}}
  window.scrollTo(0,sy);setStatus();
}
function route(){const t=location.hash.slice(1);const nt=PAGES[t]?t:'inicio';if(nt!==ui.tab)window.scrollTo(0,0);ui.tab=nt;ui.sel=null;render();}
function imprimir(){try{window.print();}catch(e){toast('A impressão não está disponível aqui. Abra o ficheiro HTML no navegador.');}}
async function deliver(filename,text){
  if(dl){try{await dl.save({filename,data:text});return;}catch(e){if(e&&e.code==='declined')return;}}
  else if(!window.claude){try{const a=h('a',{href:URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),download:filename});document.body.append(a);a.click();a.remove();toast('Descarregado: '+filename,null,null,'ok');return;}catch(e){}}
  const ta=h('textarea',{id:'ex-text',class:'textarea w-full h-64 font-mono text-xs',readonly:true,value:text,'aria-label':filename});
  openDlg(filename,h('div',{class:'flex flex-col gap-2'},h('span',{class:'text-sm opacity-70'},'Copie este texto e guarde-o como '+filename+'.'),ta),
    [btn('Fechar',closeDlg),btn('Copiar',async()=>{try{await navigator.clipboard.writeText(text);toast('Copiado.');}catch(e){ta.select();toast('Selecione tudo e copie com Ctrl+C.');}},'btn-primary')]);
}
