/* ===================== v0.49 · Estados de avaliação, chamada confirmada, carimbo de dados ===================== */
/* Chamada: uma aula dada só conta para a assiduidade depois de a chamada ser confirmada (aba Presenças aberta e guardada, ou faltas marcadas). */
const aulaConf=x=>!!(x&&x.s&&x.s.cham);
/* Estados de um instrumento:
   agendado   — data futura, sem classificações
   semdata    — sem data e sem classificações
   naoreal    — assinalado como não realizado (adiado/cancelado)
   porclass   — realizado e ainda sem classificações
   parcial    — há alunos por classificar
   incompleta — todos lançados mas com itens em branco/pendentes
   completo   — tudo classificado
   Por aluno: 'faltou' quando o aluno não realizou (i.nr[aid]); não conta como pendência. */
const EST_INST={agendado:['Agendado','calendar','#2563eb'],semdata:['Sem data','calendar','#64748b'],naoreal:['Não realizado','x','#64748b'],porclass:['Por classificar','clipboard','#d97706'],parcial:['Classificação parcial','clipboard','#d97706'],incompleta:['Classificação incompleta','alert','#b45309'],completo:['Classificado','check','#15803d']};
function instAlunoEstado(t,i,aid){if(i.naoReal)return 'naoreal';if(i.nr&&i.nr[aid])return 'faltou';const hj=isoHoje();const av=instAvaliado(i,aid);
  if(!av){if(!i.data)return 'semdata';if(i.data>hj)return 'agendado';return 'porclass'}
  return instPendentes(i,aid).length?'incompleta':'completo'}
function instEstado(t,i){const al=alunosAval(t);const hj=isoHoje();const E={e:'completo',porClass:0,inc:0,faltou:0,feitos:0,tot:al.length};
  if(i.naoReal){E.e='naoreal';return E}
  al.forEach(x=>{const k=instAlunoEstado(t,i,x.id);if(k==='faltou')E.faltou++;else if(k==='porclass'||k==='agendado'||k==='semdata')E.porClass++;else{E.feitos++;if(k==='incompleta')E.inc++}});
  if(!E.feitos){E.e=!i.data?'semdata':i.data>hj?'agendado':'porclass';return E}
  E.e=E.porClass?'parcial':E.inc?'incompleta':'completo';return E}
function chipEstado(E){const [l,icn,c]=EST_INST[E.e]||EST_INST.completo;const extra=E.e==='parcial'?` · ${E.porClass} por classificar`:E.e==='incompleta'?` · ${E.inc} aluno${E.inc>1?'s':''} com itens em branco`:'';return `<span class="ests" style="--ec:${c}" title="${esc(l+extra+(E.faltou?' · '+E.faltou+' não realizou':''))}">${ic(icn,12)} ${l}${E.e==='parcial'?' ('+E.porClass+')':''}</span>`}
/* carimbo: última alteração real dos dados e última sincronização confirmada */
function quandoTs(ts){if(!ts)return '';const d=new Date(ts),h=new Date();const hm=d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'});const dd=Math.round((new Date(h.toDateString())-new Date(d.toDateString()))/864e5);return dd===0?'hoje às '+hm:dd===1?'ontem às '+hm:d.toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'})+' às '+hm}
function ultimaSinc(){let a=0;try{a=Math.max(+(nvL().ultimo||0),+((gsCfg()||{}).ultimo||0))}catch(_){}return a}
function pnlCarimbo(){const m=S._mod||S._ts;const sy=ultimaSinc();return `<span title="Hora da última alteração real dos dados (não da abertura do ecrã)">${ic('pen',12)} Última alteração ${m?quandoTs(m):'—'}</span> · <span title="Última sincronização concluída com a nuvem">${ic('refresh',12)} ${sy?'Sincronizado '+quandoTs(sy):'Sem sincronização'}</span>`}

/* lista de instrumentos: coluna Estado */
{const _vIE=vInstrumentos;vInstrumentos=function(){const r=_vIE.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;$$('#view table.lst').forEach(tb=>{const h=tb.tHead&&tb.tHead.rows[0];if(!h||h.querySelector('.thest'))return;const k=[...h.cells].findIndex(c=>/Avaliados/.test(c.textContent));if(k<0)return;h.cells[k].insertAdjacentHTML('beforebegin','<th class="thest">Estado</th>');
  [...tb.tBodies[0].rows].forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);if(!i||!tr.cells[k])return;tr.cells[k].insertAdjacentHTML('beforebegin',`<td>${chipEstado(instEstado(t,i))}</td>`)})})}catch(e){console.warn(e)}return r};if(go._f)go._f.instrumentos=vInstrumentos}

/* grelha: instrumento não realizado / aluno não realizou */
{const _iN3=instNotas;instNotas=function(t,i){const r=_iN3.apply(this,arguments);try{const body=$('#i-body');if(!body||!$('#grid'))return r;i.nr=i.nr||{};
  const bar=`<div class="estbar noprint">${chipEstado(instEstado(t,i))}<span class="sp1"></span><label class="chk" title="O instrumento não chegou a realizar-se (adiado, cancelado). Deixa de contar nas pendências."><input type="checkbox" id="gr-nreal" ${i.naoReal?'checked':''}> Não realizado</label></div>`;
  const g=body.querySelector('.gwrap');if(g)g.insertAdjacentHTML('beforebegin',bar);
  $$('#grid tbody tr[data-a]').forEach(tr=>{const aid=tr.dataset.a;const c=tr.querySelector('td.stk');if(!c)return;c.insertAdjacentHTML('beforeend',`<button type="button" class="nrbt ${i.nr[aid]?'on':''}" data-nr="${aid}" title="${i.nr[aid]?'Não realizou — clique para anular':'Assinalar que o aluno não realizou (faltou)'}">${i.nr[aid]?'não realizou':'F'}</button>`);if(i.nr[aid])tr.classList.add('nrrow')});
  $$('#grid [data-nr]').forEach(b=>b.onclick=e=>{e.stopPropagation();const aid=b.dataset.nr;if(i.nr[aid])delete i.nr[aid];else{if(instAvaliado(i,aid)&&!confirm('Este aluno já tem classificações neste instrumento. Assinalar que não realizou mantém-nas mas deixa de as considerar pendentes. Continuar?'))return;i.nr[aid]=1}save();manterPosicao(()=>vInstrumento(i.id))});
  const nr=$('#gr-nreal');if(nr)nr.onchange=()=>{i.naoReal=nr.checked||undefined;save();toast(nr.checked?'Assinalado como não realizado':'Instrumento de novo ativo','ok');manterPosicao(()=>vInstrumento(i.id))}}catch(e){console.warn(e)}return r}}

/* sumários: assinala aulas dadas com chamada por confirmar */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-scham]');if(!b)return;const t=T();if(t)aulaDlg(t,b.dataset.scham,'pres')});

/* v0.49: estilo SGE */
ESTILOS_X.unshift(['sge','SGE (predefinido)','grid','Igual ao SGE: cabeçalho azul-ciano, menus cinzentos, separadores em caixa e tabelas em faixas azuis']);
try{aplicarPrefs()}catch(_){}
/* demonstração: chamada confirmada nas aulas dadas, exceto as duas últimas */
{const _cD=criarDemo;criarDemo=function(){const r=_cD.apply(this,arguments);try{(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>{const L=listaAulas(t,a).filter(x=>x.licao);const SM=sumariosT(a,t);L.slice(0,-2).forEach(x=>{SM[x.k]={...(SM[x.k]||{}),cham:Date.now()}})}));S.esquema=ESQUEMA();save()}catch(e){console.warn(e)}return r}}

/* v0.49: turmas conjuntas — numeração seguida, com o n.º original entre parênteses */
function renumerarConjunta(t){const L=t.alunos.slice().sort((a,b)=>(a.nome||'').localeCompare(b.nome||'','pt',{sensitivity:'base'}));L.forEach((x,k)=>{if(x.numOrig==null)x.numOrig=x.num;x.num=k+1});return L.length}
{const _aDO=atualizarDeOrigens;atualizarDeOrigens=function(t){const antes=new Set(t.alunos.map(x=>x.id));const r=_aDO.apply(this,arguments);try{if(t.alunos.some(x=>x.numOrig!=null)){let mx=Math.max(0,...t.alunos.filter(x=>antes.has(x.id)).map(x=>+x.num||0));t.alunos.filter(x=>!antes.has(x.id)).forEach(x=>{x.numOrig=x.num;x.num=++mx});save()}}catch(e){console.warn(e)}return r}}
{const _vAlR=vAlunos;vAlunos=function(){const r=_vAlR.apply(this,arguments);try{const t=T();if(t&&t.origens&&!$('#b-renum')){const bx=$('#barx');if(bx){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-renum" title="Numera 1, 2, 3… por ordem alfabética e guarda o n.º da turma de origem entre parênteses">${ic('list',15)} Numerar Seguido</button>`);$('#b-renum').onclick=()=>{const ja=t.alunos.some(x=>x.numOrig!=null);if(!confirm((ja?'Voltar a numerar':'Numerar')+' os '+t.alunos.length+' alunos de '+t.nome+' por ordem alfabética?\nO número original fica entre parênteses, ex.: n.º 1 (3).'))return;renumerarConjunta(t);save();vAlunos();toast('Alunos numerados de 1 a '+t.alunos.length,'ok')}}}}catch(e){console.warn(e)}return r};if(go._f)go._f.alunos=vAlunos}
{const _gNO=go;go=function(){try{const t=T();document.body.classList.toggle('numorig',!!(t&&t.alunos&&t.alunos.some(x=>x.numOrig!=null)))}catch(_){}return _gNO.apply(this,arguments)}}

