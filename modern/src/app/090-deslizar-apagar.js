/* ---------- deslizar para apagar ---------- */
function deslizarApagar(el,onDel){let x0=null,y0,dx=0;el.classList.add('swp');
  el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0},{passive:true});
  el.addEventListener('touchmove',e=>{if(x0==null)return;dx=e.touches[0].clientX-x0;if(Math.abs(e.touches[0].clientY-y0)>Math.abs(dx)){x0=null;el.style.transform='';return}if(dx<0)el.style.transform=`translateX(${Math.max(dx,-110)}px)`},{passive:true});
  el.addEventListener('touchend',()=>{if(x0==null)return;x0=null;if(dx<-80){el.style.transform='translateX(-110px)';el.classList.add('swiped');vibrar();
      let b=el.querySelector('.swdel');if(!b){b=document.createElement('button');b.className='swdel';b.type='button';b.innerHTML=ic('trash',18)+'<span>Apagar</span>';el.appendChild(b);b.onclick=e=>{e.stopPropagation();onDel()}}
      setTimeout(()=>document.addEventListener('touchstart',function f(e){if(!el.contains(e.target)){el.style.transform='';el.classList.remove('swiped');document.removeEventListener('touchstart',f)}},{passive:true}),0)}
    else el.style.transform=''})}
/* ---------- deslizar no topo para mudar de turma ---------- */
(function(){let x0=null,y0;document.addEventListener('touchstart',e=>{if(!e.target.closest('#bar')||e.target.closest('select,button,input'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)<70||Math.abs(dy)>50||!NEEDS_T.includes(VIEW))return;
    const L=turmasFiltradas(A());const i=L.findIndex(t=>t.id===S.turmaAtiva);if(i<0||L.length<2)return;const n=L[(i+(dx<0?1:-1)+L.length)%L.length];S.turmaAtiva=n.id;save();vibrar();go(VIEW);toast(n.nome+' · '+n.disciplina,'ok')},{passive:true})})();
/* ---------- paleta de comandos / pesquisa global (⌘K) ---------- */
function paleta(){const a=A();const itens=[];
  Object.entries(TITLES).forEach(([k,t])=>{if(!NEEDS_T.includes(k)||T())itens.push({t,s:'Secção',ic:'list',f:()=>go(k)})});
  (a?a.turmas:[]).forEach(t=>{itens.push({t:t.nome+' · '+t.disciplina,s:'Turma',ic:'users',f:()=>{S.turmaAtiva=t.id;save();go('alunos')}});
    t.alunos.forEach(al=>itens.push({t:al.nome,s:'Aluno · '+t.nome+' · '+t.disciplina+' · n.º '+al.num,ic:'user',f:()=>{S.turmaAtiva=t.id;save();go('alunos');setTimeout(()=>fichaAluno(al.id),60)}}));
    t.instrumentos.forEach(i=>itens.push({t:i.nome,s:'Instrumento · '+t.nome+(i.data?' · '+fmtIso(i.data):''),ic:'clipboard',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;UI.instTab='notas';save();go('instrumentos')}}))});
  AJUDA.forEach(h=>itens.push({t:'Ajuda: '+h.t,s:'Ajuda',ic:'help',f:()=>{UI.ajQ='';go('ajuda');setTimeout(()=>{const e=$('#aj-'+h.id);if(e)e.scrollIntoView()},80)}}));
  [['Anular última alteração','refresh',desfazer],['Tema escuro','moon',()=>{S.cfg.tema='dark';save();aplicarTema()}],['Tema claro','sun',()=>{S.cfg.tema='light';save();aplicarTema()}],['Modo de apresentação','image',alternarApresentacao],['Exportar cópia de segurança','download',()=>{UI.defTab='dados';go('definicoes')}],['Diagnóstico de dados','search',()=>{UI.defTab='ferr';go('definicoes')}]].forEach(([t,i,f])=>itens.push({t,s:'Ação',ic:i,f}));
  openDrawer('Pesquisar',`<div class="ed"><input id="pq" type="search" placeholder="Aluno, turma, instrumento, secção ou ajuda…" autocomplete="off"><div id="pqr" class="pqr" role="listbox"></div><p class="hint">Atalhos: ⌘K / Ctrl+K pesquisar · ⌘Z anular · ? ajuda desta secção · Esc fechar</p></div>`);
  const q=$('#pq'),r=$('#pqr');let sel=0,L=[];
  const desenha=()=>{const n=normT(q.value);L=itens.filter(x=>!n||normT(x.t+' '+x.s).includes(n)).slice(0,40);sel=Math.min(sel,Math.max(0,L.length-1));
    r.innerHTML=L.map((x,k)=>`<button type="button" role="option" class="pqi ${k===sel?'on':''}" data-k="${k}">${ic(x.ic,16)}<span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span></button>`).join('')||'<p class="mut">Sem resultados.</p>';
    r.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closeDrawer();L[+b.dataset.k].f()})};
  q.oninput=()=>{sel=0;desenha()};q.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(L.length-1,sel+1);desenha();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);desenha();e.preventDefault()}else if(e.key==='Enter'&&L[sel]){closeDrawer();L[sel].f()}};
  desenha();setTimeout(()=>q.focus(),60)}
/* ---------- atalhos de teclado ---------- */
document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase();const emCampo=['input','textarea','select'].includes(tag)||e.target.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&String(e.key||'').toLowerCase()==='k'){e.preventDefault();paleta();return}
  if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&String(e.key||'').toLowerCase()==='z'&&!emCampo){e.preventDefault();desfazer();return}
  if(e.key==='?'&&!emCampo){e.preventDefault();ajudaContexto();return}
  if(e.key==='Escape')fecharMenu();
  if(e.key==='Tab'&&$('#drawer').classList.contains('on')){const f=[...$('#drawer').querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent);if(!f.length)return;const i=f.indexOf(document.activeElement);
    if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
/* ---------- ajuda contextual ---------- */
const AJ_VIEW={inicio:'inicio',reunioes:'reunioes',turmas:'turmas',alunos:'turmas',meuhorario:'naoletivos',horario:'horarios',calendario:'calendario',testes:'testes',criterios:'avaliacao',instrumentos:'avaliacao',dominios:'avaliacao',avaliacao:'avaliacao',relatorios:'avaliacao',escola:'comecar',definicoes:'aparencia',ajuda:'comecar'};
function ajudaContexto(){const id=AJ_VIEW[VIEW]||'comecar';UI.ajQ='';go('ajuda');setTimeout(()=>{const e=$('#aj-'+id);if(e){e.scrollIntoView({behavior:'smooth'});e.classList.add('pisca');setTimeout(()=>e.classList.remove('pisca'),1600)}},80)}
/* ---------- modo de apresentação (projetar sem nomes nem fotos) ---------- */

/* ---------- teclado numérico na grelha de classificações ---------- */
function tecladoNum(){let k=$('#numpad');if(k){k.remove();$$('table.grid input').forEach(i=>i.removeAttribute('inputmode'));$$('table.grid input').forEach(i=>i.setAttribute('inputmode','decimal'));return}
  k=document.createElement('div');k.id='numpad';k.innerHTML=`<div class="nph"><b>${ic('grid',15)} Teclado</b><button type="button" data-np="x" aria-label="Fechar">${ic('x',16)}</button></div><div class="npg">${['7','8','9','4','5','6','1','2','3',',','0','⌫'].map(x=>`<button type="button" data-np="${x}">${x}</button>`).join('')}<button type="button" data-np="limpar" class="w">Limpar</button><button type="button" data-np="↓" class="w pri">Seguinte ↓</button></div>`;
  document.body.appendChild(k);$$('table.grid input').forEach(i=>i.setAttribute('inputmode','none'));let alvo=document.activeElement&&document.activeElement.closest('table.grid')?document.activeElement:$('table.grid input');if(alvo)alvo.focus();
  document.addEventListener('focusin',function f(e){if(!$('#numpad')){document.removeEventListener('focusin',f);return}if(e.target.closest&&e.target.closest('table.grid'))alvo=e.target});
  k.querySelectorAll('[data-np]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();const v=b.dataset.np;if(v==='x'){tecladoNum();return}if(!alvo)return;
    if(v==='⌫')alvo.value=alvo.value.slice(0,-1);else if(v==='limpar')alvo.value='';else if(v==='↓'){alvo.dispatchEvent(new Event('change',{bubbles:true}));alvo.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return}else alvo.value+=v;
    alvo.dispatchEvent(new Event('input',{bubbles:true}));vibrar()}))}
/* ---------- largar ficheiros em qualquer ecrã ---------- */
(function(){let n=0;const ov=()=>{let o=$('#dropov');if(!o){o=document.createElement('div');o.id='dropov';o.innerHTML=`<div>${ic('upload',40)}<b>Largue o ficheiro para importar</b><span>Excel de alunos ou de horário · PDF do calendário ou do seu horário · cópia de segurança (.json)</span></div>`;document.body.appendChild(o)}return o};
  document.addEventListener('dragenter',e=>{if(![...(e.dataTransfer||{}).types||[]].includes('Files'))return;n++;ov().classList.add('on')});
  document.addEventListener('dragleave',()=>{n=Math.max(0,n-1);if(!n)ov().classList.remove('on')});
  document.addEventListener('dragover',e=>{if([...(e.dataTransfer||{}).types||[]].includes('Files'))e.preventDefault()});
  document.addEventListener('drop',async e=>{if(e.target.closest&&e.target.closest('#t-drop,.logo-zona'))return;n=0;ov().classList.remove('on');const f=e.dataTransfer&&e.dataTransfer.files[0];if(!f)return;e.preventDefault();importarQualquer(f)})})();
async function importarQualquer(f){const nm=f.name.toLowerCase();
  try{if(nm.endsWith('.json')){UI.defTab='dados';go('definicoes');setTimeout(()=>importarCopia(f),50);return}
    if(!A())novoAno(anoAuto());
    if(nm.endsWith('.pdf')){ocupado('A ler '+f.name+'…');try{const r=await lerHorarioProfPdf(f);livre();go('meuhorario');importarHorProfDlg(r);regista('Horário do professor (PDF)',f.name,r.aulas.length+' tempos letivos, '+r.naoLetivos.length+' não letivos');return}catch(_){}
      try{const c=await lerCalendarioPdf(f);livre();go('calendario');importarCalendarioDlg(c);return}catch(err){livre();throw new Error('O PDF não parece ser um calendário escolar nem um horário do professor. '+err.message)}}
    if(/\.xlsx$/.test(nm)){try{const rT=await lerTeacherScheduleXlsx(f);if(rT){go('meuhorario');importarHorProfDlg(rT);return}}catch(_){}}
    if(/\.xlsx?$/.test(nm)){ocupado('A ler '+f.name+'…');let hs=[];try{hs=await lerHorarioXlsx(f)}catch(_){}
      if(hs.length&&hs[0].aulas&&hs[0].aulas.length){livre();go('turmas');hs.forEach(h=>h.ficheiro=f.name);importarHorariosDlg(hs);return}
      const r=await lerFicheiro(f);livre();if(r&&!r.falhou){go('turmas');novaTurmaDlg(r)};return}
    toast('Formato não reconhecido: '+f.name+' (use .xlsx, .pdf ou .json)','erro')}
  catch(err){livre();alert('Não foi possível importar '+f.name+'.\n\n'+err.message+'\n\nSugestão: '+sugestaoErro(err.message))}}
function sugestaoErro(m){m=m||'';return /legenda/i.test(m)?'confirme que é o PDF do calendário com a legenda de cores (não uma digitalização).':/grelha|cabeçalho/i.test(m)?'use o PDF “Horário do professor” exportado pelo programa da escola (com Tempos/Segunda/Sala).':/xls\b|antigo/i.test(m)?'abra no Excel e guarde como .xlsx.':/ano letivo/i.test(m)?'confirme que o ficheiro tem o ano letivo (ex.: 2026/2027) escrito.':/zip|válido/i.test(m)?'o ficheiro pode estar corrompido ou não ser um .xlsx; volte a exportá-lo.':'tente exportar de novo o ficheiro do programa da escola; se persistir, use Ajuda › Perguntas Frequentes.'}
/* ---------- registo de importações ---------- */
function regista(tipo,ficheiro,resumo){S.registo=S.registo||[];S.registo.unshift({quando:new Date().toISOString(),tipo,ficheiro:ficheiro||'',resumo:resumo||''});S.registo=S.registo.slice(0,80);save()}
/* ---------- caixote do lixo (30 dias) ---------- */
function paraLixo(tipo,obj,ctx){S.lixo=S.lixo||[];S.lixo.unshift({id:uid(),tipo,obj:JSON.parse(JSON.stringify(obj)),ctx:ctx||{},quando:Date.now()});const lim=Date.now()-30*864e5;S.lixo=S.lixo.filter(x=>x.quando>lim).slice(0,60)}
function restaurarLixo(id){const x=(S.lixo||[]).find(l=>l.id===id);if(!x)return;
  if(x.tipo==='ano'){if(S.anos.some(a=>a.id===x.obj.id))x.obj.id=uid();{let n=x.obj.nome,k=2;while(S.anos.some(a=>a.nome===x.obj.nome)){x.obj.nome=n+' (restaurado'+(k>2?' '+(k-1):'')+')';k++}}S.anos.push(x.obj);S.anos.sort((p,q)=>q.nome.localeCompare(p.nome))}
  else{const a=S.anos.find(a=>a.id===x.ctx.ano)||A();if(!a)return toast('O ano letivo já não existe','erro');
    if(x.tipo==='turma')a.turmas.push(x.obj);else if(x.tipo==='instrumento'){const t=a.turmas.find(t=>t.id===x.ctx.turma);if(!t)return toast('A turma já não existe','erro');t.instrumentos.push(x.obj)}else if(x.tipo==='reuniao')reunioes(a).push(x.obj)}
  S.lixo=S.lixo.filter(l=>l!==x);saveNow();toast('Restaurado','ok');go(VIEW)}
