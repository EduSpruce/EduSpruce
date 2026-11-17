/* ===================== v0.921 · As Minhas Tarefas ao estilo do Microsoft To Do ===================== */
try{Object.assign(ICONS,{sun:ICONS.sun||'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',home2:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',steps:'<circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/><path d="M10 6h10M10 12h10M10 18h10"/>'})}catch(_){}
const TD_LISTAS_FIX=[['dia','O Meu Dia','sun','#2564cf'],['imp','Importante','star','#c2185b'],['plan','Planeado','calendar','#107c41'],['reun','Das Reuniões','meet','#8a5a00'],['todas','Tarefas','home2','#2564cf'],['avisos','Avisos Urgentes','bell','#c0392b']];
const TD_CORES=['#2564cf','#107c41','#c2185b','#8764b8','#ca5010','#038387','#5b6b7f','#b4009e'];
const TD_REP=[['','Não repetir'],['d','Diariamente'],['u','Dias úteis'],['s','Semanalmente'],['m','Mensalmente'],['a','Anualmente']];
const tdListas=()=>S.todoListas=S.todoListas||[];
const tdHoje=()=>isoData(new Date());
const tdImp=x=>x.prio==='alta';
const tdNoDia=x=>x.dia===tdHoje();
const tdAtr=x=>!x.feito&&x.prazo&&x.prazo<tdHoje();
function tdProx(iso,r){const d=dataDeIso(iso||tdHoje());if(r==='d')d.setDate(d.getDate()+1);else if(r==='u'){do{d.setDate(d.getDate()+1)}while(d.getDay()===0||d.getDay()===6)}else if(r==='s')d.setDate(d.getDate()+7);else if(r==='m')d.setMonth(d.getMonth()+1);else if(r==='a')d.setFullYear(d.getFullYear()+1);return isoData(d)}
function tdConcluir(x,on){x.feito=on;x.feitaEm=on?Date.now():null;if(on&&x.rep&&!x._repFeito){x._repFeito=1;const n=JSON.parse(JSON.stringify(x));Object.assign(n,{id:uid(),feito:false,feitaEm:null,criada:Date.now(),_repFeito:0,prazo:tdProx(x.prazo,x.rep),dia:'',lemb:x.lemb?tdProx(x.lemb.slice(0,10),x.rep)+x.lemb.slice(10):'',lembFeito:false,passos:(x.passos||[]).map(p=>({...p,f:false}))});tarefas().push(n);toast('Tarefa repetida: próxima a '+fmtIsoL(n.prazo),'ok')}
  if(on){try{audit('Tarefas','Tarefa concluída',x.t)}catch(_){}}}
function tdFiltro(k){const L=tarefas();if(k==='dia')return L.filter(tdNoDia);if(k==='imp')return L.filter(tdImp);if(k==='plan')return L.filter(x=>x.prazo);if(k==='todas')return L.filter(x=>!x.lista);const l=tdListas().find(z=>z.id===k);return l?L.filter(x=>x.lista===k):L}
function tdOrdena(L){const o=UI.tdOrd||'';const f=(x,y)=>o==='imp'?(tdImp(y)-tdImp(x))||(x.criada-y.criada):o==='data'?((x.prazo||'9').localeCompare(y.prazo||'9')):o==='alfa'?x.t.localeCompare(y.t,'pt'):o==='cri'?(y.criada-x.criada):((x.ord??x.criada)-(y.ord??y.criada));return L.slice().sort(f)}
function tdNomeLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[1];const l=tdListas().find(z=>z.id===k);return l?l.nome:'Tarefas'}
function tdCorLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[3];const l=tdListas().find(z=>z.id===k);return l&&l.cor||'#2564cf'}
function tdReun(){const a=A();if(!a)return [];return reunioes(a).flatMap(r=>(r.decisoes||[]).map((d,i)=>({d,r,i})))}
function tdContar(k){if(k==='reun')return tdReun().filter(o=>!o.d.ok).length;if(k==='avisos'){try{return avisosM().length}catch(_){return 0}}return tdFiltro(k).filter(x=>!x.feito).length}
function vTarefasTD(){const sel=UI.tdL||'dia';const hj=tdHoje();const sch=UI.tdQ||'';const det=UI.tdSel&&tarefas().find(x=>x.id===UI.tdSel);
  barBtns([{id:'b-tdnl',t:ic('plus',15)+' Nova Lista',f:()=>tdListaDlg()},{id:'b-tdlimp',t:ic('trash',15)+' Limpar Concluídas',f:()=>{const L=tdFiltro(sel).filter(x=>x.feito);if(!L.length)return toast('Não há tarefas concluídas nesta lista');if(!confirm('Apagar '+L.length+' tarefa(s) concluída(s) desta lista?'))return;const ids=new Set(L.map(x=>x.id));S.todo=tarefas().filter(x=>!ids.has(x.id));save();vTarefasTD()}}]);
  const nav=k=>{const f=TD_LISTAS_FIX.find(z=>z[0]===k);const l=f?{id:k,nome:f[1],ic:f[2],cor:f[3]}:{...tdListas().find(z=>z.id===k),ic:'list'};const n=tdContar(k);
    return `<button type="button" class="xtn ${sel===k?'on':''}" data-tdl="${esc(k)}" style="--lc:${esc(l.cor||'#2564cf')}">${ic(l.ic,18)}<span>${esc(l.nome)}</span>${n?`<i>${n}</i>`:''}</button>`};
  const titulo=tdNomeLista(sel),cor=tdCorLista(sel);
  let corpo='';
  if(sel==='reun'){const R=tdReun().sort((x,y)=>(x.d.ok-y.d.ok)||(x.d.prazo||'9').localeCompare(y.d.prazo||'9'));
    corpo=R.length?`<div class="xtlist">${R.map(({d,r,i})=>`<div class="xtr ${d.ok?'ok':''}"><button type="button" class="xtck ${d.ok?'on':''}" data-rdk="${r.id}|${i}" aria-label="${d.ok?'Reabrir':'Concluir'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(d.t)}</b><small>${ic('meet',11)} ${esc(reunTitulo(r,A()))}${d.resp?' · '+esc(d.resp):''}${d.prazo?` · <span class="${!d.ok&&d.prazo<hj?'atr':''}">${esc(fmtIsoL(d.prazo))}</span>`:''}</small></div><button type="button" class="btn sm" data-ro="${r.id}">Reunião</button></div>`).join('')}</div>`:`<div class="xtvz">${ic('meet',40)}<b>Sem decisões das reuniões</b><span>As deliberações com responsável e prazo aparecem aqui.</span></div>`}
  else if(sel==='avisos'){corpo=cartaoAvisos()}
  else{let L=tdFiltro(sel);if(sch)L=tarefas().filter(x=>normT(x.t+' '+(x.nota||'')+' '+(x.passos||[]).map(p=>p.t).join(' ')).includes(normT(sch)));const P=tdOrdena(L.filter(x=>!x.feito)),F=L.filter(x=>x.feito).sort((a,b)=>(b.feitaEm||0)-(a.feitaEm||0));
    const TT=(A()||{turmas:[]}).turmas;
    const row=x=>{const np=(x.passos||[]).length,nf=(x.passos||[]).filter(p=>p.f).length;const sub=[];if(sel!=='todas'&&!tdListas().some(l=>l.id===sel)&&(x.lista||sel==='dia'||sel==='imp'||sel==='plan'))sub.push(esc(tdNomeLista(x.lista||'todas')));if(tdNoDia(x)&&sel!=='dia')sub.push(ic('sun',11)+' O Meu Dia');if(np)sub.push(`${nf} de ${np}`);
      if(x.prazo)sub.push(`<span class="${tdAtr(x)?'atr':x.prazo===hj?'hj':''}">${ic('calendar',11)} ${x.prazo===hj?'Hoje':esc(fmtIsoL(x.prazo))}</span>`);if(x.lemb)sub.push(ic('bell',11));if(x.rep)sub.push(ic('repeat',11));if(x.nota)sub.push(ic('note',11)+' Nota');
      if(x.turma){const t=TT.find(z=>z.id===x.turma);if(t)sub.push(esc(t.nome+' · '+t.disciplina))}
      return `<div class="xtr ${x.feito?'ok':''} ${det&&det.id===x.id?'sel':''}" data-tdx="${x.id}" draggable="${!x.feito&&!UI.tdOrd}"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="${x.feito?'Marcar como não concluída':'Marcar como concluída'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(x.t)}</b>${sub.length?`<small>${sub.join('<i class="dot">•</i>')}</small>`:''}</div><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="${tdImp(x)?'Remover de Importante':'Marcar como importante'}">${ic('star',17)}</button></div>`};
    const sug=sel==='dia'?tarefas().filter(x=>!x.feito&&!tdNoDia(x)&&x.prazo&&x.prazo<=hj):[];
    corpo=`${sch?'':`<div class="xtadd"><span class="xtaddi">${ic('plus',18)}</span><input id="td-new" placeholder="Adicionar uma tarefa" autocomplete="off"><span class="xtaddo"><input type="date" id="td-newd" title="Data de conclusão" aria-label="Data de conclusão"><button type="button" class="btn sm ico" id="td-newimp" aria-pressed="false" title="Importante">${ic('star',15)}</button><button type="button" class="btn sm pri" id="td-newok">Adicionar</button></span></div>`}
      ${sug.length?`<details class="xtsug"><summary>${ic('sparkle',14)} Sugestões para hoje (${sug.length})</summary>${sug.map(x=>`<div class="xtr"><div class="xtrt"><b>${esc(x.t)}</b><small class="${tdAtr(x)?'atr':''}">${esc(fmtIsoL(x.prazo))}</small></div><button type="button" class="btn sm" data-xtsug="${x.id}">${ic('plus',13)} O Meu Dia</button></div>`).join('')}</details>`:''}
      <div class="xtlist" id="td-l">${P.map(row).join('')}</div>
      ${!P.length&&!F.length?`<div class="xtvz">${ic(sel==='dia'?'sun':sel==='imp'?'star':sel==='plan'?'calendar':'checks',42)}<b>${sel==='dia'?'Concentre-se no seu dia':sel==='imp'?'Tarefas importantes aparecem aqui':sel==='plan'?'Tarefas com data aparecem aqui':'Nada por fazer'}</b><span>${sel==='dia'?'Junte tarefas ao O Meu Dia — recomeça vazio todos os dias.':'Escreva acima e carregue em Enter.'}</span></div>`:''}
      ${F.length?`<details class="xtfeitas" ${UI.tdF?'open':''}><summary>Concluídas <i>${F.length}</i></summary><div class="xtlist">${F.map(row).join('')}</div></details>`:''}`}
  const hdrDia=sel==='dia'?`<small>${esc(new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'}))}</small>`:'';
  $('#view').innerHTML=`<div class="card xtw ${det?'comdet':''}" style="--lc:${esc(cor)}">
    <aside class="xtside"><div class="xtq">${ic('search',15)}<input type="search" id="td-q" placeholder="Procurar" value="${esc(sch)}"></div>${TD_LISTAS_FIX.map(z=>nav(z[0])).join('')}<hr>${tdListas().map(l=>nav(l.id)).join('')}<button type="button" class="xtn nova" id="td-nl">${ic('plus',18)}<span>Nova lista</span></button></aside>
    <section class="xtmain"><header class="xth"><div><h2>${sch?'A procurar «'+esc(sch)+'»':esc(titulo)}</h2>${hdrDia}</div><span class="sp1"></span>
      ${sel!=='reun'&&sel!=='avisos'?`<select id="td-ord" aria-label="Ordenar"><option value="">Ordem manual</option>${[['imp','Importância'],['data','Data de conclusão'],['alfa','Alfabeticamente'],['cri','Data de criação']].map(([k,l])=>`<option value="${k}" ${UI.tdOrd===k?'selected':''}>${l}</option>`).join('')}</select>`:''}
      ${tdListas().some(l=>l.id===sel)?`<button type="button" class="btn sm" id="td-led">${ic('pencil',13)} Lista</button>`:''}</header>${corpo}</section>
    ${det?tdDetalhe(det):''}</div>`;
  tdBind(sel)}
function tdDetalhe(x){const TT=(A()||{turmas:[]}).turmas;const P=x.passos||[];
  return `<aside class="xtdet" aria-label="Detalhes da tarefa"><div class="xtdh"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="Concluir">${ic('check',12)}</button><textarea id="tdd-t" rows="2" aria-label="Título">${esc(x.t)}</textarea><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="Importante">${ic('star',18)}</button></div>
    <div class="xtps">${P.map((p,k)=>`<div class="xtp ${p.f?'ok':''}"><button type="button" class="xtck sm ${p.f?'on':''}" data-tdpk="${k}" aria-label="Concluir passo">${ic('check',10)}</button><input value="${esc(p.t)}" data-tdpt="${k}" aria-label="Passo ${k+1}"><button type="button" class="xtpx" data-xtpx="${k}" aria-label="Apagar passo">×</button></div>`).join('')}
      <div class="xtp nv">${ic('plus',14)}<input id="tdd-np" placeholder="${P.length?'Passo seguinte':'Adicionar passo'}"></div></div>
    <button type="button" class="xtdb ${tdNoDia(x)?'on':''}" id="tdd-dia">${ic('sun',16)} ${tdNoDia(x)?'Adicionado ao O Meu Dia':'Adicionar ao O Meu Dia'}</button>
    <div class="xtdg"><label class="xtdb">${ic('bell',16)}<span>Lembrar-me</span><input type="datetime-local" id="tdd-lb" value="${esc(x.lemb||'')}"></label>
      <label class="xtdb">${ic('calendar',16)}<span>Data de conclusão</span><input type="date" id="tdd-pz" value="${esc(x.prazo||'')}"></label>
      <label class="xtdb">${ic('repeat',16)}<span>Repetir</span><select id="tdd-rp">${TD_REP.map(([k,l])=>`<option value="${k}" ${(x.rep||'')===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <div class="xtdg"><label class="xtdb">${ic('list',16)}<span>Lista</span><select id="tdd-ls"><option value="">Tarefas</option>${tdListas().map(l=>`<option value="${l.id}" ${x.lista===l.id?'selected':''}>${esc(l.nome)}</option>`).join('')}</select></label>
      <label class="xtdb">${ic('school',16)}<span>Turma</span><select id="tdd-tu"><option value="">Sem turma</option>${TT.map(t=>`<option value="${t.id}" ${x.turma===t.id?'selected':''}>${esc(t.nome+' · '+t.disciplina)}</option>`).join('')}</select></label></div>
    <textarea id="tdd-n" class="xtdn" placeholder="Adicionar nota" rows="5">${esc(x.nota||'')}</textarea>
    <footer class="xtdf"><button type="button" class="btn sm ico" id="tdd-x" aria-label="Fechar detalhes" title="Fechar">${ic('chev',14)}</button><span>Criada ${esc(new Date(x.criada||Date.now()).toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'long'}))}${x.orig&&x.orig.tipo==='contactoEE'?' · contacto com o EE':''}</span><button type="button" class="btn sm ico dng" id="tdd-del" aria-label="Apagar tarefa" title="Apagar">${ic('trash',14)}</button></footer></aside>`}
function tdBind(sel){const re=()=>vTarefasTD();const T_=id=>tarefas().find(z=>z.id===id);
  $$('[data-tdl]').forEach(b=>b.onclick=()=>{UI.tdL=b.dataset.tdl;UI.tdQ='';UI.tdSel=null;re()});
  const q=$('#td-q');if(q)q.oninput=()=>{UI.tdQ=q.value;const p=q.selectionStart;re();const n=$('#td-q');n.focus();n.setSelectionRange(p,p)};
  const nl=$('#td-nl');if(nl)nl.onclick=()=>tdListaDlg();const le=$('#td-led');if(le)le.onclick=()=>tdListaDlg(tdListas().find(l=>l.id===sel));
  const od=$('#td-ord');if(od)od.onchange=()=>{UI.tdOrd=od.value;re()};
  const ni=$('#td-new');if(ni){let imp=false;const ib=$('#td-newimp');ib.onclick=()=>{imp=!imp;ib.classList.toggle('on',imp);ib.setAttribute('aria-pressed',imp)};
    const add=()=>{const t=ni.value.trim();if(!t)return ni.focus();const x={id:uid(),t,feito:false,criada:Date.now(),ord:Date.now(),prazo:$('#td-newd').value||(sel==='plan'?tdHoje():''),prio:imp||sel==='imp'?'alta':'normal',dia:sel==='dia'?tdHoje():'',lista:tdListas().some(l=>l.id===sel)?sel:'',passos:[]};
      tarefas().push(x);save();try{audit('Tarefas','Tarefa criada',t)}catch(_){}re();setTimeout(()=>{const n=$('#td-new');n&&n.focus()},30)};
    ni.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};$('#td-newok').onclick=add}
  $$('[data-tdk]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tdk);if(!x)return;tdConcluir(x,!x.feito);save();if(x.feito){b.classList.add('on','pop');try{if(document.documentElement.classList.contains('anim-cheio')||1){const r=b.getBoundingClientRect();if(typeof animConfetes==='function'&&tdFiltro(sel).every(z=>z.feito))animConfetes(r.left,r.top)}}catch(_){}setTimeout(re,280)}else re();try{tarBadge()}catch(_){}});
  $$('[data-tds]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tds);if(!x)return;x.prio=tdImp(x)?'normal':'alta';save();re()});
  $$('[data-tdx]').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;UI.tdSel=UI.tdSel===r.dataset.tdx?null:r.dataset.tdx;re()});
  $$('[data-xtsug]').forEach(b=>b.onclick=()=>{const x=T_(b.dataset.xtsug);if(x){x.dia=tdHoje();save();re()}});
  $$('[data-rdk]').forEach(c=>c.onclick=()=>{const [rid,i]=c.dataset.rdk.split('|');const r=reunioes(A()).find(z=>z.id===rid);if(r&&r.decisoes[+i]){r.decisoes[+i].ok=!r.decisoes[+i].ok;save();try{audit('Reuniões','Decisão '+(r.decisoes[+i].ok?'concluída':'reaberta'),r.decisoes[+i].t)}catch(_){}re()}});
  $$('[data-ro]').forEach(b=>b.onclick=()=>{try{UI.reun=b.dataset.ro;go('reunioes')}catch(_){}});
  if(sel==='avisos'){try{$('#av-novo').onclick=()=>avisoDlg();$('#av-ver').onclick=()=>mostrarAvisos(true);$$('[data-ave]').forEach(b=>b.onclick=()=>avisoDlg(avisosM().find(z=>z.id===b.dataset.ave)));$$('[data-avx]').forEach(b=>b.onclick=()=>{S.avisos=avisosM().filter(z=>z.id!==b.dataset.avx);save();re()})}catch(_){}}
  const fd=$('.xtfeitas');if(fd)fd.ontoggle=()=>{UI.tdF=fd.open};
  /* arrastar para reordenar (ordem manual) ou largar numa lista */
  let dr=null;$$('#td-l .xtr[draggable=true]').forEach(r=>{r.ondragstart=e=>{dr=r.dataset.tdx;window.__dragInt=true;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','tarefa')}catch(_){}r.classList.add('arr')};r.ondragend=()=>{r.classList.remove('arr');dr=null};
    r.ondragover=e=>{if(!dr)return;e.preventDefault();r.classList.add('alvo')};r.ondragleave=()=>r.classList.remove('alvo');
    r.ondrop=e=>{e.preventDefault();r.classList.remove('alvo');if(!dr||dr===r.dataset.tdx)return;const L=tdOrdena(tdFiltro(sel).filter(x=>!x.feito));const a=L.findIndex(x=>x.id===dr),b=L.findIndex(x=>x.id===r.dataset.tdx);if(a<0||b<0)return;const [m]=L.splice(a,1);L.splice(b,0,m);L.forEach((x,k)=>x.ord=k);save();re()}});
  $$('.xtn[data-tdl]').forEach(n=>{n.ondragover=e=>{if(!dr)return;e.preventDefault();n.classList.add('alvo')};n.ondragleave=()=>n.classList.remove('alvo');n.ondrop=e=>{e.preventDefault();n.classList.remove('alvo');const x=T_(dr);if(!x)return;const k=n.dataset.tdl;
    if(k==='dia')x.dia=tdHoje();else if(k==='imp')x.prio='alta';else if(k==='plan'){if(!x.prazo)x.prazo=tdHoje()}else if(k==='todas')x.lista='';else if(tdListas().some(l=>l.id===k))x.lista=k;save();re();toast('Tarefa movida para '+tdNomeLista(k),'ok')}});
  /* detalhes */
  const x=UI.tdSel&&T_(UI.tdSel);if(!x)return;const sv=()=>{save()};
  const tt=$('#tdd-t');tt.onchange=()=>{x.t=tt.value.trim()||x.t;sv();re()};tt.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();tt.blur()}};
  $('#tdd-dia').onclick=()=>{x.dia=tdNoDia(x)?'':tdHoje();sv();re()};
  $('#tdd-lb').onchange=e=>{x.lemb=e.target.value;x.lembFeito=false;sv();re();if(x.lemb&&'Notification' in window&&Notification.permission==='default')try{Notification.requestPermission()}catch(_){}};
  $('#tdd-pz').onchange=e=>{x.prazo=e.target.value;sv();re()};$('#tdd-rp').onchange=e=>{x.rep=e.target.value;if(x.rep&&!x.prazo)x.prazo=tdHoje();sv();re()};
  $('#tdd-ls').onchange=e=>{x.lista=e.target.value;sv();re()};$('#tdd-tu').onchange=e=>{x.turma=e.target.value||null;sv()};
  const nn=$('#tdd-n');nn.oninput=()=>{x.nota=nn.value;clearTimeout(nn._t);nn._t=setTimeout(sv,400)};nn.onchange=()=>{sv();re()};
  const np=$('#tdd-np');np.onkeydown=e=>{if(e.key==='Enter'&&np.value.trim()){x.passos=x.passos||[];x.passos.push({t:np.value.trim(),f:false});sv();re();setTimeout(()=>{const n=$('#tdd-np');n&&n.focus()},30)}};
  $$('[data-tdpk]').forEach(b=>b.onclick=()=>{const p=x.passos[+b.dataset.tdpk];p.f=!p.f;sv();re()});
  $$('[data-tdpt]').forEach(i=>i.onchange=()=>{const k=+i.dataset.tdpt;if(i.value.trim())x.passos[k].t=i.value.trim();else x.passos.splice(k,1);sv();re()});
  $$('[data-xtpx]').forEach(b=>b.onclick=()=>{x.passos.splice(+b.dataset.xtpx,1);sv();re()});
  $('#tdd-x').onclick=()=>{UI.tdSel=null;re()};$('#tdd-del').onclick=()=>{if(!confirm('Apagar «'+x.t+'»?'))return;S.todo=tarefas().filter(z=>z.id!==x.id);UI.tdSel=null;save();re()}}
function tdListaDlg(l){const nova=!l;openDrawer(nova?'Nova Lista':'Editar Lista',`<div class="ed"><label for="tl-n">Nome</label><input id="tl-n" value="${esc(l&&l.nome||'')}" placeholder="ex.: Direção de Turma, Departamento, Casa…"><label style="margin-top:12px">Cor</label><div class="xtcor">${TD_CORES.map(c=>`<button type="button" data-tlc="${c}" class="${(l&&l.cor||TD_CORES[0])===c?'on':''}" style="background:${c}" aria-label="Cor"></button>`).join('')}</div>
  <div class="row" style="margin-top:16px"><button class="btn pri" id="tl-ok">${ic('check',14)} ${nova?'Criar Lista':'Guardar'}</button>${nova?'':`<span class="sp1"></span><button class="btn dng" id="tl-del">${ic('trash',14)} Apagar Lista</button>`}</div></div>`);
  let cor=l&&l.cor||TD_CORES[0];$$('[data-tlc]').forEach(b=>b.onclick=()=>{cor=b.dataset.tlc;$$('[data-tlc]').forEach(z=>z.classList.toggle('on',z===b))});setTimeout(()=>$('#tl-n').focus(),50);
  $('#tl-ok').onclick=()=>{const n=$('#tl-n').value.trim();if(!n)return toast('Escreva o nome da lista','erro');if(nova){const z={id:'l'+uid(),nome:n,cor};tdListas().push(z);UI.tdL=z.id}else{l.nome=n;l.cor=cor}save();closeDrawer();vTarefasTD()};
  const d=$('#tl-del');if(d)d.onclick=()=>{const n=tarefas().filter(x=>x.lista===l.id).length;if(!confirm('Apagar a lista «'+l.nome+'»'+(n?' e as suas '+n+' tarefa(s)':'')+'?'))return;S.todo=tarefas().filter(x=>x.lista!==l.id);S.todoListas=tdListas().filter(z=>z.id!==l.id);UI.tdL='dia';save();closeDrawer();vTarefasTD()}}
/* lembretes: avisa à hora marcada (toast + notificação do sistema) */
setInterval(()=>{try{if(!S||!S.todo)return;const now=new Date();const iso=isoData(now)+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');let m=false;
  tarefas().forEach(x=>{if(x.lemb&&!x.lembFeito&&!x.feito&&x.lemb<=iso){x.lembFeito=true;m=true;toast('Lembrete: '+x.t,'ok');try{if('Notification' in window&&Notification.permission==='granted'){if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(r=>r.showNotification('EduSpruce · Lembrete',{body:x.t,tag:'td-'+x.id,data:{v:'tarefas'}})).catch(()=>new Notification('EduSpruce · Lembrete',{body:x.t}));else new Notification('EduSpruce · Lembrete',{body:x.t})}}catch(_){}}});if(m)save()}catch(_){}},30000);
vTarefas=vTarefasTD;if(go._f)go._f.tarefas=vTarefasTD;

