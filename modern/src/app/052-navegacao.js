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
  b.innerHTML=(c.logo?`<img src="${esc(c.logo)}" alt="">`:`<span class="besi">${ic('school',16)}</span>`)+`<span class="besn">${esc(n||'Escola')}</span>`;b.title=n||'Escola'}
function fillCtx(){{const be=$('#brandEsc');if(be){const e=EC();be.textContent=e&&e.escola?e.escola:'Plataforma Integrada de Gestão Educativa';be.title=be.textContent}}
  {const ES=todasEscolas();const se=$('#selEsc'),ce=$('#ctxEsc');const multi=ES.length>1;const temE=!!((EC()||{}).escola||(EC()||{}).logo);if(ce){ce.style.display=multi||temE?'':'none';ce.classList.toggle('unica',!multi)}if(se)se.disabled=!multi;document.body.classList.toggle('multiesc',multi);document.body.classList.toggle('escunica',!multi&&temE);
   {const en=$('#escNome');if(en)en.textContent=nomeEscola(EC());const lg=$('#escLogo');if(lg){const e=EC();lg.innerHTML=e.logo?`<img src="${esc(e.logo)}" alt="">`:ic(TIPOS_ESCOLA[tipoEscola(e)].ic,16)}}
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
