/* =====================================================================
   NAVEGAÇÃO
   ===================================================================== */
const TITLES={inicio:'Início',turmas:'Ano letivo e turmas',meuhorario:'O meu horário',calendario:'Calendário escolar',reunioes:'Reuniões',horario:'Horário',testes:'Marcação de testes',alunos:'Alunos',criterios:'Critérios de avaliação',instrumentos:'Instrumentos de avaliação',dominios:'Domínios por período',avaliacao:'Avaliação final',relatorios:'Relatórios individuais',tarefas:'As minhas tarefas',planta:'Planta da sala de aula',sumarios:'Aulas e sumários',recursos:'Biblioteca',direcao:'Direção de turma',documentos:'Documentos',escola:'Escolas',definicoes:'Definições',modulos:'Módulos',ajuda:'Ajuda'};
const NEEDS_T=['planta','sumarios','modulos','alunos','horario','testes','criterios','instrumentos','dominios','avaliacao','relatorios'];
let VIEW='inicio',UI={inst:null,instTab:'notas',per:null,dom:null,relAluno:'all',relPer:null};
function go(v){
  if(document.body.classList.contains('apres-prof')&&APRES_BLOQ.includes(v)){toast('Indisponível no modo de apresentação');return}
  if(NEEDS_T.includes(v)&&!T())v='turmas';
  if(v!==VIEW){const vw=$('#view');if(vw)vw.scrollTop=0;window.scrollTo(0,0)}
  VIEW=v;closeDrawer();document.body.classList.remove('menu');
  $$('#side .nav').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  $$('#side .tnav').forEach(b=>b.disabled=!T());
  const t=T();$('#grpT').innerHTML=t?anoBadge(t,'sm')+' Turma '+esc(t.nome):'Turma';
  $('#ttl').textContent=TITLES[v]+(t&&NEEDS_T.includes(v)?' — '+t.nome+' · '+t.disciplina:'');
  $('#barx').innerHTML='';document.body.classList.remove('print-landscape');
{const tt=T();if(tt&&escId(escolaDe(tt))!==escAtiva())S.escolaAtiva=escId(escolaDe(tt))}if(document.body.classList.contains('apres'))apresPrep();
  const mudouVista=go._ult!==v;go._ult=v;
  fillCtx();
  renderFiltroOferta();migalhas(v);cabecalhoImpressao(v);fecharMenu();{const np=document.getElementById('numpad');if(np)np.remove()}
  (go._f=go._f||{inicio:vInicio,turmas:vTurmas,meuhorario:vMeuHorario,calendario:vCalendario,reunioes:vReunioes,horario:vHorario,testes:vTestes,alunos:vAlunos,criterios:vCriterios,instrumentos:vInstrumentos,dominios:vDominios,avaliacao:vAvaliacao,relatorios:vRelatorios,tarefas:vTarefas,planta:vPlanta,sumarios:vSumarios,recursos:vRecursos,direcao:vDirecao,documentos:vDocumentos,escola:vEscola,modulos:vModulos,jornal:vJornal,definicoes:vDefinicoes,ajuda:vAjuda})[v]();
  ajustarBarra();reunBadge();navModular();sessBox();try{favBtn();navDT();navTurmas();tarBadge();corrigirNotasFer()}catch(e){console.error(e)}
  if(mudouVista)animarNumeros();
}
$$('#side .nav').forEach(b=>b.onclick=()=>go(b.dataset.v));
function barEscola(){const b=document.getElementById('barEsc');if(!b)return;const c=EC()||{};const n=(c.escola||'').trim();
  if(!n&&!c.logo){b.hidden=true;return}b.hidden=false;
  b.innerHTML=(c.logo?`<img src="${c.logo}" alt="">`:`<span class="besi">${ic('school',16)}</span>`)+`<span class="besn">${esc(n||'Escola')}</span>`;b.title=n||'Escola'}
function fillCtx(){{const be=$('#brandEsc');if(be){const e=EC();be.textContent=e&&e.escola?e.escola:'Plataforma Integrada de Gestão Educativa';be.title=be.textContent}}
  {const ES=todasEscolas();const se=$('#selEsc'),ce=$('#ctxEsc');const multi=ES.length>1;const temE=!!((EC()||{}).escola||(EC()||{}).logo);if(ce){ce.style.display=multi||temE?'':'none';ce.classList.toggle('unica',!multi)}if(se)se.disabled=!multi;document.body.classList.toggle('multiesc',multi);document.body.classList.toggle('escunica',!multi&&temE);
   {const en=$('#escNome');if(en)en.textContent=nomeEscola(EC());const lg=$('#escLogo');if(lg){const e=EC();lg.innerHTML=e.logo?`<img src="${e.logo}" alt="">`:ic(TIPOS_ESCOLA[tipoEscola(e)].ic,16)}}
   if(se&&multi){se.innerHTML=ES.map(e=>`<option value="${escId(e)}" ${escId(e)===escAtiva()?'selected':''}>${esc(nomeEscola(e))}</option>`).join('');
     se.onchange=()=>{S.escolaAtiva=se.value;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null;UI.inst=null;save();toast(nomeEscola(EC())+' · '+TIPOS_ESCOLA[tipoEscola(EC())].n,'ok');go(NEEDS_T.includes(VIEW)&&!T()?'inicio':VIEW)}}}
  barEscola();
  {const ai=$('#anoInd');if(ai){const a0=A();ai.innerHTML='<span class="anol">Ano Letivo:</span> '+ic('calendar',15)+' <b>'+(a0?esc(a0.nome):'—')+'</b>'}}
  const sa=$('#selAno');sa.innerHTML=S.anos.length?S.anos.map(a=>`<option value="${a.id}" ${a.id===S.anoAtivo?'selected':''}>${esc(a.nome)}</option>`).join(''):'<option>—</option>';
  sa.onchange=()=>{S.anoAtivo=sa.value;const a=A();const TF=turmasFiltradas(a);S.turmaAtiva=TF[0]?TF[0].id:null;UI.inst=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)};
  const a=A(),st=$('#selTurma');
  const TF=turmasFiltradas(a);const opt=t=>`<option value="${t.id}" ${t.id===S.turmaAtiva?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`;const G=gruposOferta(TF);
  st.classList.toggle('vazio',!TF.length);st.innerHTML=TF.length?'<option value="">— escolher —</option>'+(G.length>1?G.map(g=>`<optgroup label="${esc(g.nome)}">${g.L.map(opt).join('')}</optgroup>`).join(''):TF.map(opt).join('')):'<option value="">Sem turmas</option>';
  st.onchange=()=>{S.turmaAtiva=st.value||null;UI.inst=null;UI.orig='';save();go(T()?(NEEDS_T.includes(VIEW)?VIEW:'alunos'):'turmas')};
}
/* ---------- ícones (SVG, traço) ---------- */
const ICONS={
 flow:'<rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="13" width="7" height="7" rx="2.2"/><path d="M7.5 11v1.5a3 3 0 0 0 3 3H13"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
 meet:'<circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5"/><path d="M3 21v-4a4 4 0 0 1 8 0"/><path d="M13 17a4 4 0 0 1 8 0v4"/><path d="M2 21h20"/><path d="M12 13v8"/>',
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
 school:'<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-5h4v5"/><path d="M12 9.5h.01"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.7c2 .7 3.2 2.6 3.5 5.3"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
 sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M9 11h6M9 15h4"/>',
 chart:'<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
 grad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 9v6"/>',
 file:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 upload:'<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
 printer:'<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 merge:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10"/><path d="M6 7c0 4 5 5 10 5"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.6 4.4L20 16"/><path d="M20 21v-5h-5"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 idcard:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8M15 10h4M15 14h3"/>',
 star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h8"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 calcheck:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 auto:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
 calx:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
 headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
 bookopen:'<path d="M2 5c3-1.5 7-1.5 10 1v14c-3-2.5-7-2.5-10-1z"/><path d="M22 5c-3-1.5-7-1.5-10 1v14c3-2.5 7-2.5 10-1z"/>',
 pen:'<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 6l3 3"/><path d="M13 20h7"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 puzzle:'<path d="M10 3h4v3a2 2 0 1 0 0 0h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4H4a2 2 0 1 1 0-4h2V6h4z"/>',
 heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
 run:'<circle cx="14" cy="4.5" r="2"/><path d="M9 21l2.5-6L14 17v4M7 12l3-4 4 1 2 3 3 1M10 8l-1 6"/>',
 flask:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
 brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V4z"/>',
 calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="10" r="1"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 check:'<path d="M5 12l5 5L20 7"/>',
 checks:'<path d="M3 12l4 4 8-8"/><path d="M11 16l1 1 9-9"/>',
 paste:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M12 10v7M9 14l3 3 3-3"/>',
 crown:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
 access:'<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5"/><path d="M12 10v5l-3 6M12 15l3 6"/>',
 building:'<path d="M4 21V5l8-2v18"/><path d="M12 7l8 2v12"/><path d="M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01"/>',
 award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21l5-3 5 3-1.5-7"/>',
 text:'<path d="M4 6h16M4 12h16M4 18h10"/>',
 pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
};
function ic(n,sz){sz=Math.round((sz||16)*1.2);const p=ICONS[n];return p?`<svg class="ic" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`:''}
/* ícone automático pelo texto de botões e títulos */
const IC_BTN=[[/^(\+|Adicionar)/,'plus'],[/^Importar|Turma a partir/i,'upload'],[/^Exportar/i,'download'],[/^Imprimir/i,'printer'],[/^Apagar|^Remover|^×$/i,'trash'],[/^Duplicar|^\+ Outra disciplina|Copiar/i,'copy'],[/Juntar/i,'merge'],[/^↻|Atualizar/i,'refresh'],[/^Colar/i,'paste'],[/^←/,'back'],[/^Fechar$/,'x'],[/^Abrir$/,'folder'],[/^Ficha$/,'idcard'],[/^Assinalar todos/i,'checks'],[/^Desmarcar todos/i,'x'],[/^Guardar|^Criar|^Continuar|^Importar$/i,'check'],[/^Ajustar/i,'search'],[/Alterar fotografia|Adicionar fotografia/i,'image'],[/Repor|Começar/i,'refresh']];
const IC_H=[[/Primeiros passos/i,'sparkle'],[/^Ano letivo/i,'calendar'],[/^Turmas/i,'school'],[/^Turma$/i,'school'],[/Outros anos/i,'calendar'],[/Escola e professor/i,'building'],[/Disciplinas/i,'book'],[/Tipos de instrumento/i,'clipboard'],[/síntese/i,'text'],[/Cópia de segurança/i,'shield'],[/Domínios|ponderações/i,'layers'],[/Classificação final/i,'grad'],[/Menções/i,'award'],[/Desempenho/i,'chart'],[/Distribuição/i,'chart'],[/Instrumentos recentes/i,'clipboard'],[/Período|Semestre/i,'calendar'],[/Organização|Como funciona/i,'help'],[/fotografias/i,'image'],[/alunos na turma/i,'users']];
/* ---------- Maiúsculas iniciais coerentes (títulos, menus, botões, separadores, rótulos) ---------- */
const MINUS=new Set('a o e as os de da do das dos em no na nos nas por para com ao à aos às um uma que ou sem até pelo pela'.split(' '));
function tcap(str){let first=true;return str.replace(/[^\s]+/g,w=>{const lw=w.toLowerCase();
  if(!first&&MINUS.has(lw)){return w}first=false;
  return w.replace(/(^|[\/(\-“"'])(\p{Ll})(?=\p{L})/gu,(m,a,b)=>a+b.toUpperCase())})}
const TC_SEL='table.grid thead th:not(.v),.cleg span,.cp b,.pvn span:not(.mut),.kpi .v.tc,#side .lbl,#ttl,#bar .ctx,.oa,.selall,.card h2,.card h3,#drawer h3,#dw-t,.btn,.tabs button,.seg button,table.lst th,table.mx th:not(.v),.ed label:not(.chk),.kpi .l,.sheet .sec,.sheet h1,.sheet th,table.msai tr.sec td,.dica-t b,.sign div';
const TC_SKIP='.mut,.tag,.nt,.cargo,.pill,.art,.mb,.cam,input,select,textarea,option,.hint';
function titulos(root){
  (root||document).querySelectorAll(TC_SEL).forEach(el=>{
    if(el.matches(TC_SKIP))return;
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const sk=n.parentElement.closest(TC_SKIP);return sk&&el.contains(sk)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    let n;while((n=w.nextNode())){const v=n.nodeValue;if(!/\p{L}/u.test(v))continue;const nv=tcap(v);if(nv!==v)n.nodeValue=nv}
  });
}
function acessib(){document.querySelectorAll('table.grid tbody tr[data-a]').forEach(tr=>{const sk=tr.querySelector('.stk');let nm='';if(sk){const cl=sk.cloneNode(true);cl.querySelectorAll('*').forEach(x=>{if(x.isConnected&&x!==cl&&x.textContent.trim().length<=3)x.remove()});cl.querySelectorAll('.tag,.bdg,[aria-hidden=true],sup,small').forEach(x=>x.remove());nm=cl.textContent.replace(/\s+/g,' ')}tr.querySelectorAll('input:not([aria-label])').forEach(inp=>{const c=inp.dataset.c;const th=c!=null?tr.closest('table').querySelectorAll('thead tr:nth-child(2) th')[+c]:null;inp.setAttribute('aria-label',nm.trim()+(th?' — '+th.textContent.trim():''))})});
  document.querySelectorAll('img:not([alt]),img[alt=""]').forEach(im=>{const tr=im.closest('[data-a],[data-fi],.fcard,.mscard,tr');const n=tr&&(tr.querySelector('b,.stk,.nm')||{}).textContent;im.setAttribute('alt',n?'Fotografia de '+n.trim():'Imagem')})}
/* tabelas largas: deslocamento horizontal dentro do cartão (nunca a página inteira) */
function envolverTabelas(){document.querySelectorAll('#view table').forEach(t=>{if(t.closest('.tblw,.gwrap,.mxw,.sheet')||t.parentElement.dataset.ov)return;const p=t.parentElement;
  if(getComputedStyle(p).overflowX!=='visible'){p.dataset.ov=1;return}const w=document.createElement('div');w.className='tblw';p.insertBefore(w,t);w.appendChild(t)})}
document.addEventListener('click',e=>{if(e.target.id==='dwscrim'){closeDrawer();return}{const ro=e.target.closest('[data-ro]');if(ro&&VIEW!=='reunioes'){reuniaoVer(ro.dataset.ro);return}}if(e.target.closest('#barEsc')){go('escola');return}const bb=e.target.closest('#pqBtn,#undoBtn,#apresBtn,#ajBtn,#favBtn');if(bb){({pqBtn:paleta,undoBtn:desfazer,apresBtn:alternarApresentacao,ajBtn:ajudaContexto,favBtn:alternarFavorito})[bb.id]();return}if(e.target.closest('#menuBtn')){document.body.classList.toggle('menu');return}if(e.target.id==='scrim'){document.body.classList.remove('menu')}});
/* ---------- tema: automático / claro / escuro ---------- */
function aplicarTema(){const t=(S.cfg&&S.cfg.tema)||'auto';const r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.dataset.theme=t;
  const el=document.getElementById('temaSel');if(!el)return;
  el.innerHTML=[['auto','auto','Auto'],['light','sun','Claro'],['dark','moon','Escuro']].map(([k,i,l])=>`<button type="button" data-tema="${k}" class="${t===k?'on':''}" title="Tema ${l.toLowerCase()}" aria-label="Tema ${l.toLowerCase()}">${ic(i,14)}<span>${l}</span></button>`).join('');
  el.querySelectorAll('[data-tema]').forEach(b=>b.onclick=()=>{S.cfg.tema=b.dataset.tema;save();aplicarTema();if(VIEW==='definicoes')go('definicoes')})}
/* ---------- animações subtis: números a contar ao entrar numa secção ---------- */
const REDUZ=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function ajustarBarra(){const b=document.getElementById('bar');if(!b)return;b.classList.remove('bar2');if(innerWidth<=1000)return;const x=document.getElementById('barx');
  const t=document.querySelector('.ttlw #ttl');if(b.scrollWidth>b.clientWidth+1||(x&&x.children.length&&t&&t.scrollWidth>t.clientWidth+1))b.classList.add('bar2')}
addEventListener('resize',()=>{clearTimeout(ajustarBarra._t);ajustarBarra._t=setTimeout(ajustarBarra,80)});

/* ===================== MODO DE APRESENTAÇÃO (v0.26) ===================== */
const APRES_DEF={nomes:'primeiro',fotos:'mostrar',sens:true,prof:true,ocultos:[]};
const apresCfg=()=>(S.cfg.apres=Object.assign({},APRES_DEF,S.cfg.apres||{}));
const APRES_BLOQ=['reunioes','definicoes','escola','meuhorario'];
let APRES_RX=null,APRES_MAP=null;
function apresPrep(){const c=apresCfg();const a=A();const M=new Map();const oc=new Set(c.ocultos||[]);
  if(a){const all=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
    const ocN=new Set(all.filter(x=>oc.has(x.id)||(x.origemId&&oc.has(x.origemId))).map(x=>normT(x.nome)));
    const byF={};all.forEach(x=>{const f=x.nome.trim().split(/\s+/)[0];(byF[f]=byF[f]||new Set()).add(normT(x.nome))});
    all.forEach(x=>{const nm=x.nome.trim().replace(/\s+/g,' ');const p=nm.split(' ');const h=ocN.has(normT(nm));let d;
      if(h)d='Aluno(a) oculto(a)';else if(c.nomes==='iniciais')d=p.filter(w=>w.length>2||/^[A-ZÁÉÍÓÚ]/.test(w)).map(w=>w[0].toUpperCase()).join('.')+'.';
      else if(c.nomes==='ocultar')d='Aluno(a) n.º '+(x.num||'?');else if(c.nomes==='completo')d=nm;else d=byF[p[0]].size>1&&p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0];
      const o=M.get(nm);M.set(nm,{d:o&&o.h?o.d:d,h:h||(o&&o.h)})})}
  APRES_MAP=M;const ks=[...M.keys()].filter(k=>M.get(k).d!==k).sort((x,y)=>y.length-x.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));APRES_RX=ks.length?new RegExp(ks.join('|'),'g'):null;
  // alunos ocultos que não são encontrados pelo nome (ex.: só o número) — marcados por id
  apresPrep.ids=oc}
function apresMarcar(el){const box=el.closest('tr,.intr,.fgc,.pnai,.dfa,.sti,.mac,.aniv,.fcard,.mscard,.lin,.cdr,.sheet,.rmini,li,.dimp,.pq-i,.kv');if(box)box.classList.add('apres-oc');else{const d=el.closest('#dw-b');if(d)d.classList.add('apres-oc')}}
function apresAplicar(){if(!document.body.classList.contains('apres'))return;
  document.querySelectorAll('#view [contenteditable="true"],#drawer [contenteditable="true"]').forEach(e=>{e.setAttribute('contenteditable','false');e.dataset.apce=1});
  (apresPrep.ids||new Set()).forEach(id=>document.querySelectorAll(`[data-a="${id}"],tr[data-fi="${id}"],.fcard[data-fi="${id}"],.fgc[data-fi="${id}"],.mscard[data-fi="${id}"]`).forEach(e=>e.classList.add('apres-oc')));
  if(!APRES_RX)return;const RX=APRES_RX,M=APRES_MAP;
  ['#view','#drawer','#toast','#cmenu','#tipbox'].forEach(sel=>{const root=document.querySelector(sel);if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&/^(TEXTAREA|SCRIPT|STYLE|OPTION)$/.test(n.parentElement.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const L=[];let n;while(n=w.nextNode()){RX.lastIndex=0;if(RX.test(n.nodeValue))L.push(n)}
    L.forEach(n=>{let h=false;n.nodeValue=n.nodeValue.replace(RX,m=>{const v=M.get(m);if(v.h)h=true;return v.d});if(h&&n.parentElement)apresMarcar(n.parentElement)});
    root.querySelectorAll('[title],[aria-label]').forEach(e=>['title','aria-label'].forEach(at=>{const v=e.getAttribute(at);if(v){RX.lastIndex=0;if(RX.test(v))e.setAttribute(at,v.replace(RX,m=>M.get(m).d))}}));
    root.querySelectorAll('input,textarea').forEach(e=>{const v=(e.value||'').trim().replace(/\s+/g,' ');const m=M.get(v);if(m&&m.d!==v&&!e.dataset.apv){e.dataset.apv=1;e.readOnly=true;e.value=m.d;const wr=e.closest('.nmw');if(wr)wr.dataset.v=m.d;if(m.h)apresMarcar(e)}})})}
function apresClasses(on){const c=apresCfg();const b=document.body.classList;b.toggle('apres',on);b.toggle('apres-sens',on&&c.sens);b.toggle('apres-prof',on&&c.prof);b.toggle('apres-fotos',on&&c.fotos==='ocultar');
  const bt=$('#apresBtn');if(bt)bt.classList.toggle('on',on)}
function alternarApresentacao(){if(document.body.classList.contains('apres')){apresClasses(false);closeDrawer();toast('Modo de apresentação desligado','ok');go(VIEW);return}apresDlg()}
function apresDlg(){const c=apresCfg();const t=T();const al=t?alunosTodos(t):[];const oc=new Set(c.ocultos||[]);
  const op=(k,v,l,d)=>`<button type="button" data-ap="${k}" data-v="${v}" class="${c[k]===v?'on':''}" title="${esc(d||'')}">${l}</button>`;
  openDrawer('Modo de Apresentação',`<div class="ed apdlg">
    <p class="hint" style="margin-top:0">Para projetar na aula sem expor dados pessoais. Nada é alterado nos seus dados — só o que se vê no ecrã.</p>
    <label>Nomes dos alunos</label><div class="seg">${op('nomes','primeiro','Primeiro Nome')}${op('nomes','iniciais','Iniciais')}${op('nomes','ocultar','Só o N.º')}${op('nomes','completo','Completos')}</div>
    <label style="margin-top:12px">Fotografias dos alunos</label><div class="seg">${op('fotos','mostrar','Mostrar')}${op('fotos','ocultar','Desfocar')}</div>
    <label class="chk" style="margin-top:14px"><input type="checkbox" id="ap-sens" ${c.sens?'checked':''}> <span><b>Ocultar dados sensíveis dos alunos</b><br><span class="mut">N.º de processo, data de nascimento e idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação e contactos, observações.</span></span></label>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-prof" ${c.prof?'checked':''}> <span><b>Proteger a informação do professor</b><br><span class="mut">Esconde reuniões e respetivos lembretes, o seu horário, definições e escola, avisos de cópias de segurança, a pesquisa e a troca para outras turmas.</span></span></label>
    ${al.length?`<h3>${ic('user',15)} Alunos a ocultar <span class="mut" style="font-weight:500">— ${esc(t.nome)}</span></h3><p class="hint" style="margin-top:0">Os dados destes alunos ficam totalmente ocultos (nome, notas, fotografia, relatório) — para quem não quer que a turma veja a sua informação.</p>
      <div class="row" style="gap:6px;margin-bottom:6px"><button type="button" class="btn sm" id="ap-nen">Nenhum</button><button type="button" class="btn sm" id="ap-tod">Todos</button></div>
      <div class="apal">${al.map(x=>`<label class="chk"><input type="checkbox" data-apo="${x.id}" ${oc.has(x.id)?'checked':''}> <span><b>${esc(numAl(x))}</b> ${esc(x.nome)}</span></label>`).join('')}</div>`:''}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="ap-ok">${ic('access',15)} Iniciar Apresentação</button></div></div>`);
  $$('[data-ap]').forEach(b=>b.onclick=()=>{c[b.dataset.ap]=b.dataset.v;$$(`[data-ap="${b.dataset.ap}"]`).forEach(x=>x.classList.toggle('on',x===b))});
  const tod=v=>$$('[data-apo]').forEach(x=>x.checked=v);if($('#ap-nen')){$('#ap-nen').onclick=()=>tod(false);$('#ap-tod').onclick=()=>tod(true)}
  $('#ap-ok').onclick=()=>{c.sens=$('#ap-sens').checked;c.prof=$('#ap-prof').checked;
    if(al.length){const ids=new Set(al.map(x=>x.id));c.ocultos=(c.ocultos||[]).filter(id=>!ids.has(id)).concat($$('[data-apo]').filter(x=>x.checked).map(x=>x.dataset.apo))}
    save();closeDrawer();apresPrep();apresClasses(true);if(c.prof&&APRES_BLOQ.includes(VIEW))go('inicio');else go(VIEW);
    const n=al.filter(x=>(c.ocultos||[]).includes(x.id)).length;toast('Modo de apresentação ligado'+(n?' · '+n+(n===1?' aluno oculto':' alunos ocultos'):'')+' — toque no olho para sair','ok')}}
/* ---------- Diretor(a) de turma ---------- */
function dtDe(a,nome){const h=horarioDe(a,nome);return h&&h.diretor||''}
const tituloDT=(nome,cap)=>{const g=nome?guessGen(nome):'';const w=g==='F'?'Diretora de Turma':g==='M'?'Diretor de Turma':'Diretor(a) de Turma';return cap===false?w.toLowerCase():w};
function souDT(a,nome){if(!a)return false;const n=normTurma(nome);if((a.dt||[]).includes(n))return true;const d=dtDe(a,nome);return !!(d&&S.cfg.professor&&mesmoNome(d,S.cfg.professor))}
function minhasDT(a){if(!a)return [];const L=new Set();a.turmas.forEach(t=>turmasDaClasse(t).forEach(n=>{if(souDT(a,n))L.add(n)}));Object.keys(a.horarios||{}).forEach(n=>{if(souDT(a,n))L.add(n)});(a.dt||[]).forEach(()=>{});return [...L].sort((x,y)=>x.localeCompare(y,'pt'))}
function navModular(){const b=document.querySelector('#side [data-v="modulos"]');if(!b)return;const t=T();const on=ehModular(t);b.hidden=!on;b.style.display=on?'':'none';if(on){const U=unidMod(t);b.querySelector('.lbl').textContent=U.p;b.title=U.p;if(VIEW==='modulos')$('#ttl').textContent=U.p+' — '+t.nome+' · '+t.disciplina}}
function sessBox(){const el=document.getElementById('sessBox');if(!el)return;const s=SESSAO;if(!s){el.innerHTML='';return}el.innerHTML=`<span class="sav">${esc((s.nome||s.u||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span><span class="snm"><b>${esc(s.nome||s.u)}</b><span>${s.tipo==='ms'?'Microsoft 365':esc(s.u)}</span></span><button class="btn sm ico" id="sessOut" title="Terminar sessão" aria-label="Terminar sessão">${ic('back',14)}</button>`;$('#sessOut').onclick=()=>{if(confirm('Terminar a sessão?'))terminarSessao()}}
function reunBadge(){const b=document.getElementById('reunBadge');if(!b)return;const a=A();if(!a){b.hidden=true;return}const hj=isoData(new Date());
  const n=reunioes(a).filter(r=>reunAtiva(r)&&r.data===hj&&reunFim(r)>Date.now()).length;const e=avisosReunioes(a).filter(v=>v.g==='erro').length;
  b.hidden=!(n||e);b.textContent=n||'!';b.className='nbadge'+(n?'':' bad');b.title=n?n+' reunião(ões) hoje':e+' aviso(s)'}
function animarNumeros(){if(REDUZ()||document.documentElement.classList.contains('a11y-rm'))return;const els=[...document.querySelectorAll('#view .kpi .v, #view .ringc b, #view .pvn b, #view .dimd .dd')].filter(e=>/^\d{1,4}$/.test(e.textContent.trim())&&!e.children.length).slice(0,24);
  els.forEach(e=>{const fim=+e.textContent.trim();if(fim<2)return;const t0=performance.now(),dur=Math.min(900,380+fim*6);e.textContent='0';
    e.setAttribute('aria-label',String(fim));const passo=t=>{if(e.dataset.vivo){e.removeAttribute('aria-label');return}const k=Math.min(1,(t-t0)/dur),ease=1-Math.pow(1-k,3);e.textContent=String(Math.round(fim*ease));if(k<1)requestAnimationFrame(passo);else e.removeAttribute('aria-label')};requestAnimationFrame(passo)})}
function decorar(root){
  titulos(root);envolverTabelas();acessib();try{apresAplicar()}catch(_){}
  (root||document).querySelectorAll('.btn:not([data-dec]),.card h2:not([data-dec]),#drawer .dwh b:not([data-dec])').forEach(el=>{
    el.dataset.dec=1;if(el.querySelector('svg'))return;
    const txt=el.textContent.trim();const L=el.tagName==='H2'||el.tagName==='B'?IC_H:IC_BTN;
    const m=L.find(([r])=>r.test(txt));if(!m)return;
    if(el.tagName==='BUTTON'&&/^[+←↻×⇄]\s*/.test(txt)&&el.firstChild&&el.firstChild.nodeType===3)el.firstChild.textContent=el.firstChild.textContent.replace(/^[+←↻⇄]\s*/,'');
    if(el.tagName==='BUTTON'&&txt==='×'){el.innerHTML=ic(m[1],14);return}
    el.insertAdjacentHTML('afterbegin',ic(m[1],el.tagName==='H2'?17:15)+' ');
  });
}
function barBtns(arr){$('#barx').innerHTML=arr.map(b=>`<button class="btn ${b.c||''}" id="${b.id}">${b.t}</button>`).join('');arr.forEach(b=>$('#'+b.id).onclick=b.f)}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function vInicio0(){
  const c=S.cfg,a=A();const TF=turmasFiltradas(a);
  const hojeAulas=a?proximasAulas(TF.flatMap(t=>aulasTurma(t,a).map(x=>({...x,t}))),40).filter(p=>p.k===0):[];
  const passos=[
    {ok:!!(c.escola&&c.professor),t:'Preencher escola e professor',v:'definicoes'},
    {ok:S.anos.length>0,t:'Criar o ano letivo',v:'turmas'},
    {ok:!!a&&minhasDisc().length>0,t:'Escolher as disciplinas que leciona neste ano letivo',v:'turmas'},
    {ok:!!(a&&a.turmas.length),t:'Criar as turmas (importando o Excel com as fotos)',v:'turmas'},
    {ok:!!(a&&a.turmas.some(t=>t.alunos.length)),t:'Assinalar os alunos que frequentam a sua disciplina',v:'alunos'}
  ];
  const tudo=passos.every(p=>p.ok);
  $('#view').innerHTML=`<div class="inlay"><div class="in-hero">${heroEscola(a)}</div>${ladoInicio(a)}<div class="in-main">
  ${lembreteCopia()}${cartaoMatrizes(a)}${cartoesInicioAval(a)}
  ${!tudo?`<div class="card"><h2>Primeiros passos</h2><ol class="steps">${passos.map((p,i)=>`<li class="${p.ok?'done':''}"><span class="sp1">${esc(p.t)}</span>${p.ok?'':`<button class="btn sm ${passos.findIndex(x=>!x.ok)===i?'pri':''}" data-go="${p.v}">Abrir</button>`}</li>`).join('')}</ol></div>`:''}
  ${a?cartaoCalendario(a):''}
  ${a&&hojeAulas.length?`<div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">Hoje · ${esc(DIAS[new Date().getDay()])}</h2><span class="sp1"></span><button class="btn sm" data-go="meuhorario">O meu horário</button></div>
    ${hojeAulas.map(p=>`<button class="lin hjl ${p.agora?'now':''}" data-t="${p.t.id}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span>${anoBadge(p.t,'sm')}<b>${esc(p.t.nome)}</b> ${esc(p.t.disciplina)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}${ofertaTag(p.t)}${p.agora?'<span class="tag now">agora</span>':''}</button>`).join('')}</div>`:''}
  ${a?`<div class="card"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span></div>
    ${TF.length?gruposOferta(TF).map(g=>`<h3 class="gof"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)} <span class="mut">· ${g.L.length} turma${g.L.length>1?'s':''}</span></h3><div class="tcards">${g.L.map(t=>{const al=alunosAval(t);const ns=al.map(x=>ponderada(t,pctsFinal(t,x.id,perAtual(t))));const v=ns.filter(x=>x!=null);const neg=ns.filter(x=>negativa(t,x)).length;const px=proximasAulas(aulasTurma(t,a),1,null,t)[0];
      return `<button class="tcard ${t.id===S.turmaAtiva?'on':''} ${ofertaDe(t)}" data-t="${t.id}"><div class="tch">${anoBadge(t,'lg')}<div class="tchn"><b><span class="tnm">${esc(t.nome)}</span>${t.origens?' <span class="tag">conjunta</span>':''}${ofertaTag(t)}</b><div class="d">${icDisc(t.disciplina,14)} ${esc(t.disciplina)}</div></div><span class="sp1"></span>${sparkTurma(t)}</div>
      <div class="s">${(()=>{const pt=proxTeste(t,a);return pt?`<span class="tcpt">${ic('target',13)} ${esc(pt.i.nome)} · ${esc(fmtIso(pt.i.data))}${pt.aulas?' · '+pt.aulas+' aula'+(pt.aulas>1?'s':'')+' antes':''}</span><br>`:''})()}${ic('users',13)} ${(()=>{const n=al.filter(y=>typeof foraEm==='function'&&foraEm(y)).length;return (al.length-n)+' alunos na disciplina'+(n?' (+'+n+' transferido'+(n>1?'s':'')+')':'')})()}${t.alunos.length!==al.length?' (de '+t.alunos.length+' na turma)':''}<br>${ic('clipboard',13)} ${t.instrumentos.length} instrumento${t.instrumentos.length===1?'':'s'} · ${v.length?'média '+fmtNota(t,avg(v)):'sem avaliações'}${neg?` · <span class="neg">${neg} negativa${neg>1?'s':''}</span>`:''}${px?`<br><span class="${px.agora?'neg':''}" style="${px.agora?'color:var(--ok)':''}">${ic('calendar',13)} ${esc(quando(px))}</span>`:''}</div></button>`}).join('')}</div>`).join(''):`<div class="empty">${S.filtroOferta?'Sem turmas de '+OFERTAS[S.filtroOferta].nome+' neste ano letivo.':'Ainda sem turmas neste ano letivo.'}</div>`}
  </div>`:''}</div></div>`;
  iniciarContagem();{const cp=$('#cp-agora');if(cp)cp.onclick=()=>exportarCopia({})}
  $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
  $$('[data-tst]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.tst;save();go('testes')});
  $$('[data-t]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.t;UI.alView='lista';save();go('alunos')});
  $$('.tcard[data-t]').forEach(b=>longoToque(b,(x,y)=>{const id=b.dataset.t;const ir=v=>()=>{S.turmaAtiva=id;save();go(v)};menuContexto(x,y,[{t:'Alunos',ic:'users',f:ir('alunos')},{t:'Horário',ic:'calendar',f:ir('horario')},{t:'Marcação de Testes',ic:'target',f:ir('testes')},{t:'Instrumentos',ic:'clipboard',f:ir('instrumentos')},{t:'Avaliação Final',ic:'grad',f:ir('avaliacao')},'-',{t:'Editar Turma',ic:'pencil',f:()=>editarTurmaDlg(A().turmas.find(q=>q.id===id))}])}));
}
const perAtual=t=>{const p=periodoDe();if(p&&CAL())return Math.min(p,periodos().length);return Math.max(1,...t.instrumentos.map(i=>+i.periodo||1))};

/* =====================================================================
   ANO LETIVO E TURMAS
   ===================================================================== */
function novoAno(nome){{const ja=S.anos.find(x=>x.nome===(nome||anoAuto()));if(ja){S.anoAtivo=ja.id;S.turmaAtiva=null;save();try{toast('O ano letivo '+ja.nome+' já existe — foi aberto.','aviso')}catch(_){}return ja}}const a=prepAno({id:uid(),nome:nome||anoAuto(),turmas:[]});a.org='periodo';S.anos.push(a);S.anos.sort((x,y)=>y.nome.localeCompare(x.nome));S.anoAtivo=a.id;S.turmaAtiva=null;save();return a}
function vTurmas(){
  const a=A();const TF=turmasFiltradas(a);
  barBtns(!A()?[]:[{id:'b-na',t:'+ Ano letivo',f:()=>{const n=prompt('Ano letivo (ex.: '+anoAuto()+')',sugAno());if(!n)return;if(!/^\d{4}\/\d{4}$/.test(n.trim()))return alert('Use o formato 2026/2027.');if(S.anos.some(x=>x.nome===n.trim()))return alert('Esse ano letivo já existe.');novoAno(n.trim());go('turmas')}}]);
  if(!a){$('#view').innerHTML=`<div class="card empty">Comece por criar o ano letivo.<br><br><button class="btn pri" id="mkA">Criar ano letivo ${anoAuto()}</button></div>`;$('#mkA').onclick=()=>{novoAno(anoAuto());go('turmas')};return}
  $('#view').innerHTML=`
  <div class="card ed"><div class="row"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span>
    <span class="oa" style="font-size:13px;color:var(--mut)">Organização do ano</span><div class="seg" role="group" aria-label="Organização do ano letivo">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>
    <button class="btn sm dng" id="a-del">Apagar ano letivo</button></div></div>
  <div class="card"><div class="row" style="margin-bottom:12px"><h2 style="margin:0">Turmas</h2><span class="sp1"></span>
    <button class="btn pri" id="t-pdf">+ Turma a partir do Excel</button>${dicaExcel()}<button class="btn" id="t-new">+ Turma vazia</button>${a.turmas.filter(x=>!x.origens).length>1?'<button class="btn" id="t-join">⇄ Juntar turmas</button>':''}<button class="btn" id="t-hor">${ic('calendar',15)} Importar horários</button></div>
    ${a.turmas.length?(TF.length?`<table class="lst"><thead><tr><th>Turma</th><th>Disciplina</th><th>Alunos</th><th>Instrumentos</th><th>Horário</th><th></th></tr></thead><tbody>
    ${gruposOferta(TF).map(g=>`<tr class="gr"><td colspan="6"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)}</td></tr>`+g.L.map(t=>{const ta=aulasTurma(t,a);return `<tr${t.id===S.turmaAtiva?' style="background:var(--acc2)"':''}><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b>${turmasDaClasse(t).some(n=>souDT(A(),n))?` <span class="tag dt" title="É ${tituloDT(S.cfg.professor,false)} desta turma">${ic('crown',11)} ${tituloDT(S.cfg.professor)}</span>`:''}${t.origens?` <span class="tag" title="Turma conjunta">conjunta: ${esc(t.origens.join(' + '))}</span>`:''}${ofertaTag(t)}</div></div></td><td>${esc(t.disciplina)||'<span class="neg">por definir</span>'}<div class="hint">${esc(t.anoEsc||'')} ano · ${esc(CICLOS[t.ciclo]||'')}${t.cnq?' · '+esc(t.cnq.nome):''}${t.codigo?' · <span class="tag">'+esc(t.codigo)+'</span>':''}</div></td><td title="na disciplina / na turma">${alunosAval(t).length} / ${t.alunos.length}</td><td>${t.instrumentos.length}</td>
      <td><div class="row" style="gap:6px;flex-wrap:nowrap">${ta.length?`<span class="tag">${ta.length} tempos/sem.</span>`:turmasDaClasse(t).some(c=>horarioDe(a,c))?'<span class="mut">disciplina não reconhecida</span>':'<span class="mut">—</span>'}${ta.length||turmasDaClasse(t).some(c=>horarioDe(a,c))?`<button class="btn sm ico dng" data-hxt="${t.id}" title="Apagar horário desta turma" aria-label="Apagar horário">${ic('calx',15)}</button>`:''}</div></td>
      <td class="act"><button class="btn sm" data-open="${t.id}">Abrir</button> <button class="btn sm ico" data-edt="${t.id}" title="Editar turma" aria-label="Editar turma">${ic('pencil',15)}</button> <button class="btn sm" data-dup="${t.id}" title="Mesma turma, outra disciplina">+ Disciplina</button> <button class="btn sm ico dng" data-del="${t.id}" title="Apagar turma" aria-label="Apagar turma">${ic('trash',15)}</button></td></tr>`}).join('')).join('')}</tbody></table>`:`<div class="empty">Sem turmas${S.filtroOferta&&OFERTAS[S.filtroOferta]?' de '+OFERTAS[S.filtroOferta].nome:''}${todasEscolas().length>1?' em '+esc(nomeEscola(EC())):''}. Crie uma turma ou importe a lista de alunos.</div>`)
    :`<div class="drop" id="t-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Os alunos são lidos automaticamente; depois assinala os que frequentam a sua disciplina.</span></div>`}
  </div>
  ${Object.keys(a.horarios||{}).length?`<div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">Horários Importados</h2><span class="sp1"></span></div>
    <div class="hcards">${Object.entries(a.horarios).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([k,h])=>`<div class="hcard"><div class="hch"><b>${esc(k)}</b><span class="sp1"></span><button class="btn sm ico dng" data-hdel="${esc(k)}" title="Remover horário" aria-label="Remover horário">${ic('trash',16)}</button></div><div class="hcl">${(()=>{const lig=a.turmas.filter(t=>turmasDaClasse(t).some(c=>normTurma(c)===normTurma(k)));return lig.length?lig.map(t=>{const n=aulasTurma(t,a).filter(x=>(x.classe||'')===''||normTurma(x.classe||k)===normTurma(k)).length;return `<span>${ic('clipboard',14)} ${esc(t.disciplina)}: ${n?n+' tempos semanais':'disciplina não reconhecida'}</span>`}).join(''):`<span>${ic('clipboard',14)} Ainda sem turma com este nome</span>`})()}<span>${ic('crown',14)} ${tituloDT(h.diretor)}: ${esc(h.diretor?profNome(h.diretor):'—')}${h.diretor?contEmailHtml(h.diretor):''}</span>${siglasDoProfessor(h).length?`<span>${ic('star',14)} As suas: ${esc(siglasDoProfessor(h).map(l=>l.ab).join(', '))}</span>`:''}</div></div>`).join('')}</div></div>`:''}
  ${S.anos.some(x=>x!==a&&x.nome===a.nome)?`<div class="card" id="anodup"><div class="alert">${ic('alert',16)} <span><b>Há mais do que um ano letivo «${esc(a.nome)}».</b> Não pode haver dois com o mesmo nome. Pode juntar as turmas do outro a este (as que ainda não existirem aqui) — o ano repetido vai para o caixote do lixo (30 dias).</span></div>${S.anos.filter(x=>x!==a&&x.nome===a.nome).map(x=>`<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px"><span>${esc(x.nome)} · ${x.turmas.length} turma${x.turmas.length===1?'':'s'}${x.turmas.length?' ('+esc(x.turmas.map(t=>t.nome).join(', '))+')':''}</span><span class="sp1"></span><button class="btn" data-ano="${x.id}">Abrir Esse</button><button class="btn pri" data-anojunta="${x.id}">Juntar a Este Ano</button></div>`).join('')}</div>`:''}
  ${S.anos.some(x=>x!==a&&x.nome!==a.nome)?`<div class="card"><h2>Outros anos letivos</h2>${S.anos.filter(x=>x!==a&&x.nome!==a.nome).map(x=>`<button class="btn" data-ano="${x.id}" style="margin:0 6px 6px 0">${esc(x.nome)} · ${x.turmas.length} turmas</button>`).join('')}</div>`:''}`;
  $$('[data-anojunta]').forEach(b=>b.onclick=()=>{const x=S.anos.find(z=>z.id===b.dataset.anojunta);if(!x||x===a)return;const chave=t=>normT((t.nome||'')+'|'+(t.disciplina||''));const tem=new Set(a.turmas.map(chave));const novas=x.turmas.filter(t=>!tem.has(chave(t)));const rep=x.turmas.length-novas.length;
    if(!confirm('Juntar o ano repetido a este?\n\n• '+novas.length+' turma(s) passam para este ano'+(rep?'\n• '+rep+' turma(s) já existem aqui com o mesmo nome e disciplina e ficam no ano repetido':'')+'\n• o ano repetido vai para o caixote do lixo (pode restaurar durante 30 dias)'))return;
    paraLixo('ano',x,{});novas.forEach(t=>a.turmas.push(t));x.turmas=x.turmas.filter(t=>!novas.includes(t));
    ['horarios','calendario'].forEach(k=>{if(x[k]&&(!a[k]||(typeof a[k]==='object'&&!Object.keys(a[k]).length)))a[k]=x[k]});
    S.anos=S.anos.filter(z=>z!==x);save();try{audit('Ano letivo','Ano repetido juntado',a.nome+' · '+novas.length+' turma(s)')}catch(_){}toast('Anos juntados: '+novas.length+' turma(s) passaram para este ano.','ok');go('turmas')});
  $$('[data-org]').forEach(b=>b.onclick=()=>mudarOrg(a,b.dataset.org));
  $('#a-del').onclick=()=>{if(confirm('Apagar o ano letivo '+a.nome+' com TODAS as turmas e classificações?')&&prompt('Para confirmar, escreva o nome do ano letivo ('+a.nome+'):')===a.nome){paraLixo('ano',a,{jornal:S.jornal&&S.jornal.anos?S.jornal.anos[a.nome]:null,cprofij:S.cprofij&&S.cprofij.anos?S.cprofij.anos[a.id]:null});anoLimparTudo(a);S.anos=S.anos.filter(x=>x!==a);toast('Ano letivo apagado com tudo o que lhe pertence, incluindo o Jornal Escolar desse ano (pode restaurar em Definições › Dados durante 30 dias)','aviso');S.anoAtivo=(S.anos[0]||{}).id||null;S.turmaAtiva=null;save();go('turmas')}};
  $('#t-new').onclick=()=>novaTurmaDlg(null);
  const tj=$('#t-join');if(tj)tj.onclick=juntarDlg;
  $('#t-hor').onclick=()=>pickHorarios(importarHorariosDlg);
  $$('[data-hdel]').forEach(b=>b.onclick=()=>{if(confirm('Remover o horário de '+b.dataset.hdel+'?')){delete a.horarios[b.dataset.hdel];save();go('turmas')}});
  $('#t-pdf').onclick=()=>pickPdf(r=>novaTurmaDlg(r));
  const dr=$('#t-drop');if(dr){dr.onclick=()=>pickPdf(r=>novaTurmaDlg(r));dropZone(dr,r=>novaTurmaDlg(r))}
  $$('[data-open]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.open;save();go('alunos')});
  $$('[data-hxt]').forEach(b=>b.onclick=()=>apagarHorarioTurma(a.turmas.find(x=>x.id===b.dataset.hxt),a));
  $$('[data-edt]').forEach(b=>b.onclick=()=>editarTurmaDlg(a.turmas.find(x=>x.id===b.dataset.edt)));
  $$('[data-dup]').forEach(b=>b.onclick=()=>{const s=a.turmas.find(x=>x.id===b.dataset.dup);novaTurmaDlg({base:s})});
  $$('[data-del]').forEach(b=>b.onclick=()=>{const s=a.turmas.find(x=>x.id===b.dataset.del);if(confirm('Apagar '+s.nome+' · '+s.disciplina+' com todos os alunos e classificações?\n(Fica 30 dias no caixote do lixo.)')){paraLixo('turma',s,{ano:a.id});a.turmas=a.turmas.filter(x=>x!==s);if(S.turmaAtiva===s.id)S.turmaAtiva=null;save();go('turmas')}});
  $$('[data-ano]').forEach(b=>b.onclick=()=>{S.anoAtivo=b.dataset.ano;S.turmaAtiva=null;save();go('turmas')});
}
/* ---------- turma conjunta: junta alunos de 2+ turmas para uma disciplina; as turmas originais mantêm-se ---------- */
function fontesTurmas(a){const m={};a.turmas.filter(t=>!t.origens).forEach(t=>{if(!m[t.nome]||t.alunos.length>m[t.nome].alunos.length)m[t.nome]=t});return Object.values(m).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'))}
function juntarDlg(){
  const a=A();const F=a.turmas.filter(t=>!t.origens).sort((x,y)=>x.nome.localeCompare(y.nome,'pt')||x.disciplina.localeCompare(y.disciplina,'pt'));const disc=minhasDisc();
  openDrawer('Juntar turmas',`<div class="ed">
    <p class="hint" style="margin-top:0">Junta duas ou mais turmas numa só (ex.: 10.º A + 10.º B → <b>10.º A/B</b>). Os alunos são numerados seguido por ordem alfabética, com o <b>n.º original</b> entre parênteses (ex.: n.º 1 (3)) e a indicação da sua turma; a pauta e os relatórios podem ser filtrados por turma.</p>
    <h3>Turmas a juntar</h3>${F.map(t=>`<label class="chk"><input type="checkbox" data-j="${t.id}"> <b>${esc(t.nome)}</b> · ${esc(t.disciplina)}${ofertaTag(t)} <span class="mut">· ${t.alunos.length} alunos${t.instrumentos.length?' · '+t.instrumentos.length+' instrumentos':''}</span></label>`).join('')}
    <div class="g2" style="margin-top:12px"><div><label>Nome da turma conjunta</label><input id="j-nome" placeholder="10.º A/B"></div>
      <div><label>Disciplina</label>${disc.length?`<select id="j-disc">${disc.map(d=>`<option>${esc(d)}</option>`).join('')}</select>`:'<input id="j-disc" placeholder="Disciplina">'}</div></div>
    <label class="chk" style="margin-top:6px"><input type="checkbox" id="j-del" checked> <span><b>Apagar as turmas originais</b> depois de juntar <span class="mut">(desmarque se ainda precisar delas noutra disciplina)</span></span></label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="j-ok">${ic('merge')} Juntar turmas</button></div></div>`);
  const sel=()=>$$('[data-j]').filter(x=>x.checked).map(x=>F.find(t=>t.id===x.dataset.j));
  const sug=()=>{const L=sel();const nomes=[...new Set(L.map(t=>t.nome))];$('#j-nome').value=nomes.length?nomes.map((n,i)=>i?n.split(' ').pop():n).join('/'):'';
    const ds=[...new Set(L.map(t=>t.disciplina))];const jd=$('#j-disc');if(ds.length===1&&jd.tagName==='SELECT'&&[...jd.options].some(o=>o.value===ds[0]))jd.value=ds[0]};
  $$('[data-j]').forEach(x=>x.onchange=sug);
  $('#j-ok').onclick=()=>{
    const L=sel();if(L.length<2)return alert('Escolha pelo menos duas turmas.');
    if(new Set(L.map(t=>t.nome)).size<L.length)return alert('Escolheu a mesma turma duas vezes (disciplinas diferentes). Escolha uma de cada turma.');
    const nome=$('#j-nome').value.trim();const d=($('#j-disc').value||'').trim();if(!nome||!d)return alert('Indique o nome e a disciplina.');
    const apagar=$('#j-del').checked;
    if(a.turmas.some(t=>t.nome===nome&&t.disciplina===d&&!(apagar&&L.includes(t))))return alert('Já existe '+nome+' · '+d+'.');
    const nInst=L.reduce((s,t)=>s+t.instrumentos.length,0);
    if(apagar&&!confirm('Vão ser apagadas as turmas '+L.map(t=>t.nome+' · '+t.disciplina).join(' e ')+(nInst?' com '+nInst+' instrumento(s) e respetivas classificações':'')+'.\nOs alunos (com fotos e fichas) passam para '+nome+'. Continuar?'))return;
    {const k=discKey(d,L[0].ciclo);if(!discAno().includes(k)&&!discExtraAno().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(k);else discExtraAno().push(d)}}
    const info=discInfo(d);const base=L[0];const mesma=L.every(x=>x.disciplina===d);
    const t={id:uid(),nome,anoEsc:base.anoEsc,ciclo:base.ciclo,oferta:ofertaDe(base),disciplina:d,
      dominios:mesma?JSON.parse(JSON.stringify(base.dominios)):mkDominiosDisc(d,base.ciclo,ofertaDe(base)),mencoes:mesma?JSON.parse(JSON.stringify(base.mencoes)):MENCOES_DEF.map(m=>({...m})),regra:mesma?{...base.regra}:{2:'media',3:'media'},
      alunos:[],instrumentos:[],origens:L.map(x=>x.nome),delegados:{}};
    let k=0;L.forEach(src=>alunosTodos(src).forEach(x=>{const c=JSON.parse(JSON.stringify(x));
      Object.assign(c,{id:uid()+(k++).toString(36),origem:src.nome,origemId:apagar?null:x.id,autoav:{},obsPer:{},sintese:{}});t.alunos.push(c)}));
    renumerarConjunta(t);
    if(apagar){a.turmas=a.turmas.filter(x=>!L.includes(x))}
    a.turmas.push(t);S.turmaAtiva=t.id;regista('Juntar turmas',L.map(x=>x.nome).join(' + '),nome+': '+t.alunos.length+' alunos');saveNow();closeDrawer();go('alunos');toast(nome+' criada com '+t.alunos.length+' alunos'+(apagar?' · turmas originais apagadas':''));
  };
}
/* acrescenta/atualiza alunos a partir das turmas de origem */
function atualizarDeOrigens(t){
  const a=A();const F=fontesTurmas(a);let novos=0,at=0;
  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  t.origens.forEach(o=>{const src=F.find(x=>x.nome===o);if(!src)return;
    src.alunos.forEach(x=>{const ex=t.alunos.find(y=>y.origemId===x.id||(x.processo&&y.processo===x.processo&&y.origem===o)||(y.origem===o&&norm(y.nome)===norm(x.nome)));
      if(ex){['nome','processo','genero','nasc','foto','eeNome','eeContacto','email','ase','repetente','medidas','acomod'].forEach(f=>{if(x[f]!=null&&x[f]!=='')ex[f]=JSON.parse(JSON.stringify(x[f]))});ex.origemId=x.id;at++}
      else{const c=JSON.parse(JSON.stringify(x));Object.assign(c,{id:uid()+Math.random().toString(36).slice(2,5),origem:o,origemId:x.id,frequenta:true,autoav:{},obsPer:{},sintese:{}});t.alunos.push(c);novos++}})});
  save();vAlunos();toast(novos+' novos, '+at+' atualizados a partir de '+t.origens.join(' e '));
}
function sugAno(){const ns=S.anos.map(a=>+a.nome.slice(0,4)).filter(Boolean);if(!ns.length)return anoAuto();const y=Math.max(...ns)+1;return y+'/'+(y+1)}
/* diálogo de nova turma. r = resultado da leitura do Excel ({alunos,turma,ano}) ou {base:turma} */
/* ---------- editar turma: oferta formativa, nome, ano de escolaridade ---------- */
function editarTurmaDlg(t){
  const a=A();const irmas=a.turmas.filter(x=>x!==t&&normTurma(x.nome)===normTurma(t.nome));
  let oferta=ofertaDe(t);
  openDrawer('Editar Turma',`<div class="ed">
    ${escolaSelect('et-esc',escId(escolaDe(t)))}
    <div style="margin-bottom:12px"><label>Oferta Formativa</label><div id="et-ofw">${segOferta('et-of',oferta,tipoEscola(escolaDe(t)))}</div></div>
    <div id="et-prof" class="g2" style="margin-bottom:12px;${oferta==='profissional'?'':'display:none'}"><div><label>Curso profissional</label><input id="et-curso" value="${esc(t.curso||'')}" placeholder="ex.: Técnico de Turismo"></div><div><label>Ano de formação</label><select id="et-af">${['1.º','2.º','3.º'].map(x=>`<option ${t.anoForm===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
    ${oferta!=='regular'?`<fieldset class="etmra"><legend>${ic('file',14)} Dados da turma para as fichas (MRA) · ${esc((A()||{}).nome||'')}</legend><div class="g2">
      <div style="grid-column:1/-1"><label for="et-proj">N.º do projeto</label><input id="et-proj" value="${esc(projetoDe(t,A()))}" placeholder="ex.: ACORES2030-FSE+-01717300" autocapitalize="characters" spellcheck="false"></div>
      <div style="grid-column:1/-1"><label for="et-cfich">Curso (como aparece na ficha)</label><input id="et-cfich" value="${esc(turmaDado(t,'cursoFicha')||(_mraDef?mraCursoNome(t):''))}" placeholder="ex.: A01 - Mecatrónica Automóvel (24-27)"></div>
      <div><label for="et-ori">Orientador(a) educativo(a)</label><input id="et-ori" value="${esc(turmaDado(t,'orientador'))}" placeholder="Nome"></div>
      <div><label for="et-gen">Tratamento</label><select id="et-gen"><option value="F" ${turmaDado(t,'genero')!=='M'?'selected':''}>A Orientadora Educativa</option><option value="M" ${turmaDado(t,'genero')==='M'?'selected':''}>O Orientador Educativo</option></select></div></div></fieldset>`:''}
    <div class="g2"><div><label>Turma</label><input id="et-nome" value="${esc(t.nome)}"></div>
    <div><label>Ano de Escolaridade</label><select id="et-ano">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===t.anoEsc?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div></div>
    <div style="margin-top:10px"><label>Disciplina</label><input value="${esc(t.disciplina)}" disabled></div>
    ${irmas.length?`<label class="chk" style="margin-top:12px"><input type="checkbox" id="et-irm" checked> Aplicar também a ${irmas.map(x=>esc(x.nome+' · '+x.disciplina)).join(', ')}</label>`:''}
    ${t.origens?`<p class="hint">Turma conjunta de ${esc(t.origens.join(' e '))}.</p>`:''}
    ${turmasDaClasse(t).map(n=>`<label class="chk" style="margin-top:10px"><input type="checkbox" data-etdt="${esc(n)}" ${souDT(a,n)?'checked':''} ${dtDe(a,n)&&S.cfg.professor&&mesmoNome(dtDe(a,n),S.cfg.professor)?'disabled':''}> ${ic('crown',14)} Sou ${tituloDT(S.cfg.professor,false)} ${turmasDaClasse(t).length>1?'do '+esc(n):'desta turma'}${dtDe(a,n)?` <span class="mut">(no horário: ${esc(dtDe(a,n))})</span>`:''}</label>`).join('')}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="et-ok">${ic('check',15)} Guardar</button></div></div>`);
  const etProf=()=>{$('#et-prof').style.display=oferta==='profissional'?'':'none'};
  const etSeg=()=>{const tp=tipoEscola(escolaPorId(($('#et-esc')||{}).value||escId(escolaDe(t))));const ok=TIPOS_ESCOLA[tp].ofertas;if(!ok.includes(oferta))oferta=ok[0];$('#et-ofw').innerHTML=segOferta('et-of',oferta,tp);bindSegOferta('et-of',v=>{oferta=v;etProf()});etProf()};
  etSeg();if($('#et-esc'))$('#et-esc').onchange=etSeg;
  $('#et-ok').onclick=()=>{const nome=$('#et-nome').value.trim();if(!nome)return alert('Indique o nome da turma.');
    const ano=$('#et-ano').value;const L=[t,...(($('#et-irm')||{}).checked?irmas:[])];
    const antes=t.nome;
    {const es=($('#et-esc')||{}).value;L.forEach(x=>{if(es)x.escola=es==='principal'?undefined:es;if(oferta==='profissional'){x.curso=$('#et-curso').value.trim();x.anoForm=$('#et-af').value}if(oferta!=='regular')x.modulos=x.modulos||[]})}
    L.forEach(x=>{x.oferta=oferta;x.anoEsc=ano;x.ciclo=cicloDoAno(ano);if(normTurma(x.nome)===normTurma(antes))x.nome=nome});
    a.dt=a.dt||[];$$('[data-etdt]').forEach(c=>{if(c.disabled)return;let n=normTurma(c.dataset.etdt===antes?nome:c.dataset.etdt);a.dt=a.dt.filter(z=>z!==normTurma(c.dataset.etdt)&&z!==n);if(c.checked)a.dt.push(n)});
    if(S.filtroOferta&&S.filtroOferta!==oferta)S.filtroOferta='';
    saveNow();closeDrawer();go(VIEW);toast(nome+' · '+OFERTAS[oferta].nome)};
}
function novaTurmaDlg(r){
  const disc=minhasDisc();r=r||{};
  const base=r.base;
  const tAll=(r.turmas||[]).length>1?r.turmas.map((x,i)=>i?x.split(' ').pop():x).join('/'):'';
  const nomeSug=base?base.nome:(tAll||r.turma||'');
  const anoSug=base?base.anoEsc:(((nomeSug.match(/(\d{1,2})\s*\.?\s*º/)||[])[1]||'10')+'.º');
  openDrawer(base?'Mesma turma, outra disciplina':'Nova turma',`<div class="ed">
    ${!disc.length?`<div class="alert w">Ainda não escolheu as disciplinas que leciona. <a href="#" id="go-def">Abrir Definições</a> — ou escreva a disciplina abaixo.</div>`:''}
    ${escolaSelect('nt-esc',base?escId(escolaDe(base)):escAtiva())}
    <div style="margin-bottom:10px"><label>Oferta formativa</label><div id="nt-ofw">${segOferta('nt-of',base?ofertaDe(base):(/profij/i.test(nomeSug+(r.ficheiro||''))?'profij':(S.filtroOferta||'regular')),tipoEscola(escolaPorId(base?escId(escolaDe(base)):escAtiva())))}</div></div>
    <div id="nt-prof" class="g2" style="display:none;margin-bottom:10px"><div><label>Curso profissional</label><input id="nt-curso" placeholder="ex.: Técnico de Turismo"></div><div><label>Ano de formação</label><select id="nt-af"><option>1.º</option><option>2.º</option><option>3.º</option></select></div><div style="grid-column:1/-1"><label for="nt-proj">N.º do projeto <span class="mut">(neste ano letivo)</span></label><input id="nt-proj" placeholder="ex.: ACORES2030-FSE+-01717300" autocapitalize="characters" spellcheck="false"></div></div>
    <div class="g2"><div><label>Turma</label><input id="nt-nome" value="${esc(nomeSug)}" placeholder="10.º A"></div>
    <div><label>Ano de escolaridade</label><select id="nt-ano">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===anoSug?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div></div>
    <div><label>Disciplina que leciona nesta turma</label>
      ${disc.length?`<select id="nt-disc">${minhasDiscK().filter(k=>!base||discNome(k)!==base.disciplina).sort((x,y)=>{const o=['1c','2c','3c','sec','profij'];return o.indexOf(discCic(x))-o.indexOf(discCic(y))||discNome(x).localeCompare(discNome(y),'pt')}).map(k=>`<option value="${esc(k)}" ${discCic(k)&&discCic(k)===cicloDoAno(anoSug)&&!base?'selected':''}>${esc(discRotulo(k))}</option>`).join('')}<option value="__outra">Outra…</option></select>`:''}
      <input id="nt-outra" placeholder="Nome da disciplina" style="margin-top:6px;${disc.length?'display:none':''}" list="dl-disc"><datalist id="dl-disc">${DISCIPLINAS.map(d=>`<option value="${esc(d.n)}">`).join('')}</datalist></div>
    ${r.ano&&A()&&r.ano!==A().nome?`<div class="alert w">O ficheiro indica o ano letivo <b>${esc(r.ano)}</b>, mas está a criar a turma em <b>${esc(A().nome)}</b>.</div>`:''}
    ${r.ficheiro?`<h3>Alunos lidos de ${esc(r.ficheiro)}</h3>${infoLeitura(r)}${tabelaPreview(r.alunos,r.turmas)}${textoLido(r)}`:base?`<p class="hint" style="margin-top:12px">Copia os ${base.alunos.length} alunos de ${esc(base.nome)} (com as fichas). Depois assinale quem frequenta esta disciplina.</p>`:`<p class="hint" style="margin-top:12px">Pode importar os alunos depois, a partir do PDF ou colando a lista.</p>`}
    <div class="row" style="margin-top:14px"><button class="btn pri" id="nt-ok">Criar turma</button><span class="hint">Domínios e ponderações ficam com o modelo da disciplina e podem ser ajustados em Critérios.</span></div></div>`);
  const gd=$('#go-def');if(gd)gd.onclick=e=>{e.preventDefault();go('definicoes')};
  const sd=$('#nt-disc');if(sd)sd.onchange=()=>{$('#nt-outra').style.display=sd.value==='__outra'?'':'none';const c=discCic(sd.value);if(c&&ANOS_ESC[c]&&cicloDoAno($('#nt-ano').value)!==c)$('#nt-ano').value=ANOS_ESC[c][0]};
  let oferta=base?ofertaDe(base):(/profij/i.test(nomeSug+(r.ficheiro||''))?'profij':(S.filtroOferta||'regular'));
  const ntTipo=()=>tipoEscola(escolaPorId(($('#nt-esc')||{}).value||(base?escId(escolaDe(base)):escAtiva())));
  const ntSeg=()=>{const ok=TIPOS_ESCOLA[ntTipo()].ofertas;if(!ok.includes(oferta))oferta=ok[0];$('#nt-ofw').innerHTML=segOferta('nt-of',oferta,ntTipo());bindSegOferta('nt-of',v=>{oferta=v;ntProf()});ntProf()};
  const ntProf=()=>{$('#nt-prof').style.display=oferta==='profissional'?'':'none'};
  ntSeg();if($('#nt-esc'))$('#nt-esc').onchange=ntSeg;
  bindPreview(tn=>{$('#nt-nome').value=tn||tAll;const m=tn.match(/^(\d{1,2})\.º/);if(m)$('#nt-ano').value=m[1]+'.º'});
  $('#nt-ok').onclick=()=>{
    const a=A()||novoAno(anoAuto());
    const nome=$('#nt-nome').value.trim();if(!nome)return alert('Indique o nome da turma.');
    let d=sd&&sd.value!=='__outra'?discNome(sd.value):$('#nt-outra').value.trim();if(!d)return alert('Indique a disciplina.');
    {const k=sd&&sd.value!=='__outra'?sd.value:discKey(d,oferta==='profij'?'profij':cicloDoAno($('#nt-ano').value));if(!discAno().includes(k)&&!discExtraAno().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(k);else discExtraAno().push(d)}}
    if(a.turmas.some(t=>t.nome===nome&&t.disciplina===d))return alert('Já existe '+nome+' · '+d+' neste ano letivo.');
    const anoEsc=$('#nt-ano').value,ciclo=cicloDoAno(anoEsc);
    const info=discInfo(d);
    const t={id:uid(),nome,anoEsc,ciclo,oferta,disciplina:d,dominios:mkDominiosDisc(d,oferta==='profij'?'profij':ciclo,oferta),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[]};
    {const es=($('#nt-esc')||{}).value;if(es&&es!=='principal')t.escola=es;if(oferta==='profissional'){t.curso=$('#nt-curso').value.trim();t.anoForm=$('#nt-af').value;t.modulos=[]}if(oferta==='profij')t.modulos=t.modulos||[]}
    if(base){if(base.origens)t.origens=base.origens.slice();t.alunos=JSON.parse(JSON.stringify(base.alunos)).map(x=>Object.assign(x,{id:uid()+Math.random().toString(36).slice(2,5),frequenta:true,autoav:{},obsPer:{},sintese:{}}))}
    if(r.alunos&&r.alunos.length){const rows=previewRows();const ts=[...new Set(rows.map(p=>p.turma).filter(Boolean))];
      t.alunos=rows.map(p=>Object.assign(novoAluno(t,p.nome),{num:p.num,processo:p.processo,genero:p.genero,generoManual:!!p.generoManual,nasc:p.nasc,frequenta:p.frequenta,foto:p.foto||''},ts.length>1?{origem:p.turma}:{}));
      if(ts.length>1)t.origens=ts}
    if(r&&r.alunos&&r.alunos.length&&r.ficheiro)try{regista('Turmas (importação)',r.ficheiro,nome+': '+t.alunos.length+' alunos')}catch(_){}
    a.turmas.push(t);S.turmaAtiva=t.id;saveNow();closeDrawer();go('alunos');
    toast('Turma '+nome+' criada'+(t.alunos.length?' com '+t.alunos.length+' alunos':''));
  };
}

