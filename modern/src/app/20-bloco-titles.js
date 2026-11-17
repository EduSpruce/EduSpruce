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
 phone:'<path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
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
Object.assign(ICONS,{
 cTruck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
 cMonitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
 cPlane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
 cChef:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
 cCoffee:'<path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
 cZap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
 cWrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
 cCart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
 cBrief:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
 cLeaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
 cScissors:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
 cHammer:'<path d="m15 12-8.37 8.37a1 1 0 1 1-3-3L12 9M18 15l4-4M21.5 11.5l-1.91-1.91A2 2 0 0 1 19 8.17V7l-2.26-2.26a6 6 0 0 0-4.2-1.76L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.17a2 2 0 0 1 1.41.59L18.5 14.5"/>',
 cCamera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'});
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
function minhasDT(a){if(!a)return [];const L=new Set();const ea=escAtiva();a.turmas.filter(t=>escId(escolaDe(t))===ea).forEach(t=>turmasDaClasse(t).forEach(n=>{if(souDT(a,n))L.add(n)}));Object.keys(a.horarios||{}).forEach(n=>{if(souDT(a,n))L.add(n)});(a.dt||[]).forEach(()=>{});return [...L].sort((x,y)=>x.localeCompare(y,'pt'))}
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
  const tudo=passos.every(p=>p.ok)||!!(a&&a.demo);
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

