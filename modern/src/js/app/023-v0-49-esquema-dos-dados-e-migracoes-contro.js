/* ===================== v0.49 · Esquema dos dados e migrações controladas ===================== */
/* Cada migração tem número, descrição e função. Antes de migrar guarda-se uma cópia (localStorage KEY+'.premig').
   S.esquema regista a versão; S.cfg.migracoes o histórico. Novas alterações de formato: acrescentar aqui. */
const MIGRACOES=[
  {v:2,n:'Chamada confirmada nas aulas que já tinham presenças registadas',f:st=>{(st.anos||[]).forEach(a=>Object.values(a.sumarios||{}).forEach(SM=>Object.values(SM||{}).forEach(x=>{if(x&&x.pres&&Object.keys(x.pres).length&&!x.cham)x.cham=1})))}}
];
const ESQUEMA=()=>Math.max(1,...MIGRACOES.map(m=>m.v));
function migrarDados(semGuardar){const v0=+S.esquema||1;const P=MIGRACOES.filter(m=>m.v>v0).sort((a,b)=>a.v-b.v);if(!P.length){if(!S.esquema)S.esquema=v0;return []}
  if(!semGuardar&&S.anos&&S.anos.length){try{localStorage.setItem(KEY+'.premig',JSON.stringify(S));localStorage.setItem(KEY+'.premigd',new Date().toLocaleString('pt-PT')+' · esquema '+v0)}catch(_){}}
  const feitas=[];P.forEach(m=>{try{m.f(S);S.esquema=m.v;feitas.push(m);(S.cfg=S.cfg||{},S.cfg.migracoes=S.cfg.migracoes||[]).push({v:m.v,n:m.n,em:Date.now()})}catch(e){console.error('Migração '+m.v+' falhou',e)}});
  if(feitas.length&&!semGuardar){try{saveNow();audit('Dados','Formato atualizado para o esquema '+S.esquema,feitas.map(m=>m.n).join(' · '))}catch(_){}}return feitas}
try{migrarDados()}catch(e){console.error(e)}
/* cópias importadas ou recebidas da nuvem também passam pelas migrações */
{const _ap0=aplicarPrefs;aplicarPrefs=function(){try{if((+S.esquema||1)<ESQUEMA())migrarDados()}catch(_){}return _ap0.apply(this,arguments)}}

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

/* ===================== v0.50 · Turma comum às disciplinas (aluno único) ===================== */
/* Cada «turma» da app é turma + disciplina. As turmas com o mesmo nome e escola no mesmo ano formam uma classe.
   Os alunos da mesma classe partilham um identificador comum (aluno.cid). Os dados pessoais (CAMPOS_COMUNS)
   são mantidos iguais em todas as disciplinas: uma alteração numa cópia propaga-se às outras ao guardar.
   Registos que pertencem ao aluno e não à disciplina (contactos com o EE) ficam em ano.alunosC[cid]. */
const CAMPOS_COMUNS=['nome','num','processo','numInterno','genero','generoManual','nasc','foto','eeNome','eeParent','eeContacto','email','morada','contactos','contactoAutorizado','ase','repetente','medidas','acomod'];
const classeKey=t=>t&&!t.origens?escId(escolaDe(t))+'|'+normTurma(t.nome):null;
function turmasIrmas(t,a){a=a||A();const k=classeKey(t);if(!a||!k)return [t];return a.turmas.filter(x=>classeKey(x)===k)}
function alC(a,cid){a.alunosC=a.alunosC||{};return a.alunosC[cid]=a.alunosC[cid]||{}}
const _hs=v=>{let j=typeof v==='string'&&v.length>4000?v.length+'|'+v.slice(0,200)+v.slice(-200):JSON.stringify(v==null?null:v);let h=5381;for(let i=0;i<j.length;i++)h=((h<<5)+h+j.charCodeAt(i))|0;return h};
function ligarClasse(a){if(!a)return;const G={};(a.turmas||[]).forEach(t=>{const k=classeKey(t);if(k)(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(L=>{const vistos=[];L.forEach(t=>{const usados=new Set();t.alunos.forEach(x=>{if(x.cid){usados.add(x.cid);vistos.push(x)}});
    t.alunos.forEach(x=>{if(x.cid)return;const m=vistos.find(y=>y.cid&&!usados.has(y.cid)&&((x.processo&&y.processo&&String(y.processo)===String(x.processo))||normT(y.nome||'')===normT(x.nome||'')));x.cid=m?m.cid:uid();usados.add(x.cid);vistos.push(x)})})});
  (a.turmas||[]).filter(t=>t.origens).forEach(t=>t.alunos.forEach(x=>{if(x.cid)return;const src=x.origemId&&(a.turmas||[]).find(z=>z!==t&&z.alunos.some(y=>y.id===x.origemId));const y=src&&src.alunos.find(y=>y.id===x.origemId);x.cid=y&&y.cid||uid()}))}
function copiasDe(a,cid){const L=[];(a.turmas||[]).forEach(t=>t.alunos.forEach(x=>{if(x.cid===cid)L.push([t,x])}));return L}
function sincComuns(a){if(!a||!a.turmas)return 0;ligarClasse(a);const by={};a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.cid)(by[x.cid]=by[x.cid]||[]).push([t,x])}));let n=0;
  Object.entries(by).forEach(([cid,L])=>{if(L.length<2)return;const c=alC(a,cid);c.h=c.h||{};
    CAMPOS_COMUNS.forEach(f=>{const P=L.filter(([t])=>!(f==='num'&&t.origens));if(P.length<2&&!(P.length===1&&c.h[f]==null))return;const hs=P.map(([,x])=>_hs(x[f]));
      let fonte=null;if(c.h[f]==null){/* primeira ligação: o valor mais completo */let best=-1;P.forEach(([,x],k)=>{const v=x[f];const sz=v==null||v===''?-1:JSON.stringify(v).length;if(sz>best){best=sz;fonte=k}})}
      else{const k=hs.findIndex(h=>h!==c.h[f]);if(k>=0)fonte=k}
      if(fonte==null||fonte<0)return;const v=P[fonte][1][f];const vj=v==null?undefined:JSON.stringify(v);P.forEach(([,x],k)=>{if(k!==fonte&&hs[k]!==hs[fonte]){if(vj===undefined)delete x[f];else x[f]=JSON.parse(vj);n++}});c.h[f]=hs[fonte]})});
  return n}
MIGRACOES.push({v:3,n:'Alunos ligados entre as disciplinas da mesma turma (dados pessoais comuns)',f:st=>{(st.anos||[]).forEach(a=>{try{sincComuns(a)}catch(e){console.warn(e)}})}});
try{migrarDados()}catch(e){console.error(e)}
{const _svC=saveNow;saveNow=function(){try{const a=A();if(a)sincComuns(a)}catch(e){console.warn('sincComuns',e)}return _svC.apply(this,arguments)}}

/* ===================== v0.50 · Contactos com o encarregado de educação ===================== */
const MEIOS_EE=['Telefone','Presencial','E-mail','Mensagem / caderneta','Videochamada','Carta'];
function contactosEE(a,cid){const c=alC(a,cid);return c.contactosEE=c.contactosEE||[]}
function contactoDlg(t,x,ed,depois){const a=A();ligarClasse(a);const cid=x.cid;const L=contactosEE(a,cid);const c=ed||{};const hj=isoHoje();
  openDrawer((ed?'Editar':'Novo')+' Contacto com o EE — '+x.nome.split(' ')[0],`<div class="ed cee">
    <p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)}${x.eeNome?' · EE: '+esc(x.eeNome)+(x.eeParent?' ('+esc(x.eeParent)+')':''):''}${x.eeContacto?' · '+esc(x.eeContacto):''}</p>
    <div class="g2"><div><label>Data</label><input type="date" id="ce-d" value="${esc(c.data||hj)}"></div><div><label>Meio</label><select id="ce-m">${MEIOS_EE.map(m=>`<option ${c.meio===m?'selected':''}>${m}</option>`).join('')}</select></div>
    <div style="grid-column:1/-1"><label>Assunto</label><input id="ce-a" value="${esc(c.assunto||'')}" placeholder="ex.: Faltas a Inglês, resultado do teste, comportamento…" list="ce-al"><datalist id="ce-al">${['Assiduidade','Aproveitamento','Comportamento','Medidas de apoio','Informação intercalar','Convocatória','Pedido do encarregado de educação'].map(o=>`<option>${o}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Síntese</label><textarea id="ce-s" rows="4" placeholder="O que foi falado…">${esc(c.sintese||'')}</textarea></div>
    <div style="grid-column:1/-1"><label>Compromisso assumido</label><textarea id="ce-c" rows="2" placeholder="ex.: O EE vai acompanhar o estudo diário; o aluno vai ao apoio às quartas.">${esc(c.compromisso||'')}</textarea></div>
    <div><label>Data de acompanhamento</label><input type="date" id="ce-f" value="${esc(c.acomp||'')}"></div><div><label class="chk" style="margin-top:26px"><input type="checkbox" id="ce-t" ${c.tarefa||!ed?'checked':''}> Criar tarefa para essa data</label></div></div>
    <div class="row" style="margin-top:14px;gap:8px">${ed?`<button class="btn dng" id="ce-x">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn" id="ce-can">Cancelar</button><button class="btn pri" id="ce-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#ce-can').onclick=()=>{closeDrawer();depois&&depois()};
  const ex=$('#ce-x');if(ex)ex.onclick=()=>{if(!confirm('Apagar este registo de contacto?'))return;const k=L.indexOf(ed);if(k>=0)L.splice(k,1);if(ed.tarefa){const T_=tarefas();const j=T_.findIndex(z=>z.id===ed.tarefa);if(j>=0&&!T_[j].feito)T_.splice(j,1)}save();closeDrawer();toast('Contacto apagado');depois&&depois()};
  $('#ce-ok').onclick=()=>{const o=ed||{id:uid(),criado:Date.now()};Object.assign(o,{data:$('#ce-d').value||hj,meio:$('#ce-m').value,assunto:$('#ce-a').value.trim(),sintese:$('#ce-s').value.trim(),compromisso:$('#ce-c').value.trim(),acomp:$('#ce-f').value||'',disc:t.disciplina,turma:t.nome,autor:(S.cfg.professor||'')});
    if(!o.assunto&&!o.sintese){toast('Indique pelo menos o assunto ou a síntese','aviso');return}
    const querT=$('#ce-t').checked&&o.acomp;const T_=tarefas();let tk=o.tarefa&&T_.find(z=>z.id===o.tarefa);
    if(querT){const txt='Acompanhar contacto com o EE de '+x.nome.split(' ')[0]+' ('+t.nome+')'+(o.assunto?': '+o.assunto:'')+(o.compromisso?' — '+o.compromisso:'');if(tk){tk.t=txt;tk.prazo=o.acomp}else{tk={id:uid(),t:txt,prazo:o.acomp,feito:false,criada:Date.now(),orig:{tipo:'contactoEE',cid:x.cid,cont:o.id}};T_.push(tk)}o.tarefa=tk.id}
    else if(tk&&!tk.feito){T_.splice(T_.indexOf(tk),1);delete o.tarefa}
    if(!ed)L.push(o);L.sort((p,q)=>(q.data||'').localeCompare(p.data||''));save();audit('Contactos com o EE',ed?'Contacto editado':'Contacto registado',x.nome+' · '+o.data);closeDrawer();toast('Contacto registado'+(querT?' · tarefa criada para '+fmtIso(o.acomp):''),'ok');depois&&depois()}}

/* ===================== v0.50 · Dossiê único do aluno ===================== */
function dossieDados(a,cid){const C=copiasDe(a,cid);const dados=C.map(([t,x])=>{let D=null;try{D=pnlDados(t,a,null)}catch(_){}const l=D&&D.linhas.find(l=>l.a.id===x.id);const p=perAtual(t);
    return {t,x,freq:x.frequenta!==false,nota:l?l.nota:null,neg:l?l.neg:false,f:l?l.f:{F:0,FD:0,J:0,tot:0},ass:l?l.ass:null,porConf:D?D.porConf:0,pend:l?l.pend:0,inc:l?l.oralP:0,p,conj:!!t.origens,
      inter:(()=>{try{const M=intMomentos(t,a).filter(m=>(t.interc||{})[m.id]&&(t.interc[m.id][x.id]));const m=M[M.length-1];return m?{p:m.p,...t.interc[m.id][x.id]}:null}catch(_){return null}})()}});
  return dados}
function dossieAluno(cid,tab){const a=A();if(!a)return;ligarClasse(a);const C=copiasDe(a,cid);if(!C.length)return;const base=(C.find(([t])=>t.id===S.turmaAtiva)||C.find(([t])=>!t.origens)||C[0]);const [t0,x]=base;
  const D=dossieDados(a,cid).filter(d=>d.freq);const CE=contactosEE(a,cid);const hj=isoHoje();tab=tab||UI.dosTab||'resumo';UI.dosTab=tab;
  const TK=tarefas().filter(z=>z.orig&&z.orig.cid===cid);const decs=(()=>{try{return reunioes(a).flatMap(r=>(r.decisoes||[]).filter(d=>!d.ok&&normT(d.t||'').includes(normT((x.nome||'').split(' ')[0]))).map(d=>({d,r})))}catch(_){return []}})();
  const med=x.medidas||{};const nMed=['univ','selet','adic'].reduce((s_,k)=>s_+((med[k]||[]).length),0);
  const fT=D.reduce((s_,d)=>s_+d.f.tot,0),fI=D.reduce((s_,d)=>s_+(d.f.tot-d.f.J),0),negs=D.filter(d=>d.neg);
  const orig=(txt,go_,extra)=>`<button type="button" class="dsor" data-dsgo="${go_}" ${extra||''} title="Abrir a origem">${ic('arrowUp',11)} ${esc(txt)}</button>`;
  const tabs=[['resumo','chart','Resumo'],['aval','grad','Avaliação'],['assid','calcheck','Assiduidade'],['ee','chat','Contactos com o EE'+(CE.length?' ('+CE.length+')':'')],['med','shield','Medidas'],['tar','checks','Tarefas'+(TK.filter(z=>!z.feito).length?' ('+TK.filter(z=>!z.feito).length+')':'')]];
  let body='';
  if(tab==='resumo')body=`<div class="dskp"><div class="${negs.length?'bad':''}"><b>${negs.length}</b><span>negativa${negs.length===1?'':'s'}</span></div><div class="${fI?'w':''}"><b>${fT}</b><span>faltas${fI?' · '+fI+' injust.':''}</span></div><div><b>${CE.length}</b><span>contacto${CE.length===1?'':'s'} com o EE</span></div><div class="${nMed?'pri':''}"><b>${nMed}</b><span>medida${nMed===1?'':'s'}</span></div><div class="${TK.filter(z=>!z.feito).length?'w':''}"><b>${TK.filter(z=>!z.feito).length}</b><span>tarefas abertas</span></div></div>
    <table class="lst dstb"><thead><tr><th>Disciplina</th><th>Classificação</th><th>Assiduidade</th><th>Pendências</th><th>Intercalar</th></tr></thead><tbody>${D.map(d=>`<tr><td><b>${esc(d.t.disciplina)}</b>${d.conj?' <span class="tag">'+esc(d.t.nome)+'</span>':''}</td><td>${d.nota==null?'<span class="mut">—</span>':`<b class="${d.neg?'stlo':''}">${fmtNota(d.t,d.nota)}</b> <small class="mut">${d.p}.º ${perW().toLowerCase().slice(0,3)}.</small>`}</td><td>${d.ass==null?'<span class="mut">—</span>':d.ass+'%'} <small class="mut">${d.f.tot} f.</small>${d.porConf?` <small class="pnpc" title="Aulas com chamada por confirmar">${d.porConf} p/conf.</small>`:''}</td><td>${d.pend||d.inc?`<span class="tag w">${d.pend?d.pend+' por classificar':''}${d.pend&&d.inc?' · ':''}${d.inc?d.inc+' incompleta'+(d.inc>1?'s':''):''}</span>`:'<span class="mut">—</span>'}</td><td>${d.inter?(d.inter.sem?'<span class="mut">s/ aval.</span>':`<span class="itm m${INT_M.indexOf(d.inter.m)}">${esc(d.inter.m)}</span>`):'<span class="mut">—</span>'}</td></tr>`).join('')}</tbody></table>
    <h3>Últimos registos</h3>${[...CE.slice(0,3).map(c=>({d:c.data,h:`${ic('chat',13)} <b>Contacto com o EE</b> · ${esc(c.meio)} · ${esc(c.assunto||'')}`,o:orig('Contactos','ee')})),...TK.filter(z=>!z.feito).slice(0,3).map(z=>({d:z.prazo,h:`${ic('checks',13)} <b>Tarefa</b> · ${esc(z.t)}`,o:orig('Tarefas','tar')})),...decs.slice(0,3).map(({d,r})=>({d:r.data,h:`${ic('meet',13)} <b>Deliberação</b> · ${esc(d.t)}`,o:orig(reunTipo(r).ab+' '+fmtIso(r.data),'reunioes')}))].sort((p,q)=>(q.d||'').localeCompare(p.d||'')).map(r=>`<div class="dsln"><small class="mut">${r.d?fmtIso(r.d):''}</small><span>${r.h}</span>${r.o}</div>`).join('')||'<p class="mut">Sem registos.</p>'}`;
  if(tab==='aval')body=D.map(d=>{const t=d.t;let pc={};try{pc=pctsFinal(t,d.x.id,d.p)}catch(_){}return `<section class="dsav"><div class="row"><h3 style="margin:0">${esc(t.disciplina)}</h3><span class="sp1"></span>${d.nota!=null?`<b class="${d.neg?'stlo':''}" style="font-size:18px">${fmtNota(t,d.nota)}</b>`:''}${orig('Avaliação Final','avaliacao',`data-dst="${t.id}"`)}</div>
      <div class="dsdm">${t.dominios.map(dm=>`<span style="--dc:${domCor(t,dm)}"><b>${esc(dm.ab)}</b> ${pc[dm.id]!=null?pctD(t,pc[dm.id]):'—'} <small class="mut">${dm.peso}%</small></span>`).join('')}</div>
      <div class="dsil">${t.instrumentos.filter(i=>instMax(i)).map(i=>{const k=instAlunoEstado(t,i,d.x.id);const v=instTotal(i,d.x.id);return `<span class="dsi ${k}" title="${esc(i.nome)} · ${esc((EST_INST[k]||['Não realizou'])[0])}"><small>${esc(fmtIso(i.data||''))}</small> ${esc(i.nome)} <b>${v!=null?fmtNota(t,v/instMax(i)):k==='faltou'?'F':'—'}</b></span>`}).join('')||'<span class="mut">Sem instrumentos.</span>'}</div></section>`}).join('');
  if(tab==='assid')body=D.map(d=>`<div class="dsln"><b>${esc(d.t.disciplina)}</b><span>${d.ass==null?'—':d.ass+'%'} · ${d.f.F} injust./just. · ${d.f.J} justificadas · ${d.f.FD} disciplinares${d.porConf?` · <span class="pnpc">${d.porConf} aulas por confirmar</span>`:''}</span>${orig('Sumários','sumarios',`data-dst="${d.t.id}"`)}</div>`).join('')+`<p class="hint">A assiduidade conta apenas as aulas com chamada confirmada.</p>`;
  if(tab==='ee')body=`<div class="row" style="gap:8px"><button class="btn pri" id="ds-nc">${ic('plus',14)} Registar Contacto</button><span class="mut">${x.eeNome?'EE: '+esc(x.eeNome)+(x.eeParent?' ('+esc(x.eeParent)+')':''):'Sem encarregado de educação registado'}${x.eeContacto?' · '+esc(x.eeContacto):''}</span></div>
    <div class="dscl">${CE.map(c=>{const tk=c.tarefa&&tarefas().find(z=>z.id===c.tarefa);const atras=c.acomp&&c.acomp<hj&&tk&&!tk.feito;return `<article class="dsc"><header><b>${esc(fmtIsoL(c.data))}</b><span class="tag">${esc(c.meio)}</span>${c.assunto?`<b>${esc(c.assunto)}</b>`:''}<span class="sp1"></span><small class="mut">${esc([c.disc,c.autor].filter(Boolean).join(' · '))}</small><button class="btn sm ico" data-dsce="${c.id}" aria-label="Editar">${ic('pencil',12)}</button></header>${c.sintese?`<p>${esc(c.sintese)}</p>`:''}${c.compromisso?`<p class="dscm">${ic('check',12)} <b>Compromisso:</b> ${esc(c.compromisso)}</p>`:''}${c.acomp?`<p class="mut ${atras?'stlo':''}">${ic('clock',12)} Acompanhamento ${fmtIsoL(c.acomp)}${tk?(tk.feito?' · feito':atras?' · em atraso':' · tarefa aberta'):''}</p>`:''}</article>`}).join('')||'<p class="mut">Sem contactos registados.</p>'}</div>`;
  if(tab==='med')body=`${['univ','selet','adic'].map(k=>`<div class="dsln"><b>${{univ:'Universais',selet:'Seletivas',adic:'Adicionais'}[k]}</b><span>${(med[k]||[]).map(i=>esc(typeof i==='number'?((MEDIDAS[k]||{}).l||[])[i]||'':i)).join(' · ')||'<span class="mut">—</span>'}</span></div>`).join('')}${(x.acomod||[]).length?`<div class="dsln"><b>Adaptações</b><span>${x.acomod.map(esc).join(' · ')}</span></div>`:''}<p class="hint">As medidas são comuns a todas as disciplinas da turma. ${orig('Editar na ficha do aluno','ficha')}</p>`;
  if(tab==='tar')body=`${TK.map(z=>`<label class="dsln chk"><input type="checkbox" data-dstk="${z.id}" ${z.feito?'checked':''}><span>${esc(z.t)}</span><small class="mut">${z.prazo?fmtIso(z.prazo):''}</small></label>`).join('')||'<p class="mut">Sem tarefas ligadas a este aluno.</p>'}${decs.length?`<h3>Deliberações em aberto que referem o aluno</h3>${decs.map(({d,r})=>`<div class="dsln"><span>${esc(d.t)}</span><small class="mut">${esc(reunTipo(r).n)} · ${fmtIso(r.data)}${d.prazo?' · prazo '+fmtIso(d.prazo):''}</small></div>`).join('')}`:''}`;
  openDrawer('Dossiê do Aluno',`<div class="dos"><header class="dsh">${avatar(x,58)}<div><b>${esc(x.nome)}</b><small class="mut">${esc(t0.origens?(x.origem||t0.nome):t0.nome)} · n.º ${esc(numAl(x))}${x.processo?' · proc. '+esc(x.processo):''}${idade(x.nasc)?' · '+idade(x.nasc)+' anos':''}</small><small class="mut">${D.length} disciplina${D.length===1?'':'s'} nesta app: ${D.map(d=>esc(d.t.disciplina)).join(', ')}</small></div></header>
    <div class="tabs dstabs">${tabs.map(([k,i,l])=>`<button data-dstab="${k}" class="${tab===k?'on':''}">${ic(i,13)} ${l}</button>`).join('')}</div><div class="dsb">${body}</div></div>`);
  const re=k=>dossieAluno(cid,k||tab);
  $$('#dw-b [data-dstab]').forEach(b=>b.onclick=()=>re(b.dataset.dstab));
  const nc=$('#ds-nc');if(nc)nc.onclick=()=>contactoDlg(t0,x,null,()=>re('ee'));
  $$('#dw-b [data-dsce]').forEach(b=>b.onclick=()=>contactoDlg(t0,x,CE.find(c=>c.id===b.dataset.dsce),()=>re('ee')));
  $$('#dw-b [data-dstk]').forEach(c=>c.onchange=()=>{const z=tarefas().find(y=>y.id===c.dataset.dstk);if(z){z.feito=c.checked;save()}});
  $$('#dw-b [data-dsgo]').forEach(b=>b.onclick=()=>{const g=b.dataset.dsgo;if(['ee','tar'].includes(g))return re(g);if(b.dataset.dst){S.turmaAtiva=b.dataset.dst}closeDrawer();if(g==='ficha'){go('alunos');setTimeout(()=>fichaAluno(x.id,'msai'),80);return}go(g)})}

/* ===================== v0.50 · Painel: «A minha disciplina» / «A turma completa» ===================== */
function vTurmaCompleta(t,a){const L=turmasIrmas(t,a);ligarClasse(a);const hj=isoHoje();
  const D=L.map(x=>{let d=null;try{d=pnlDados(x,a,null)}catch(_){}return {t:x,d}});
  const cids=[];const info={};L.forEach(x=>alunosTodos(x).forEach(y=>{if(!info[y.cid]){info[y.cid]={x:y,t:x};cids.push(y.cid)}}));
  cids.sort((p,q)=>(+info[p].x.num||999)-(+info[q].x.num||999)||(info[p].x.nome||'').localeCompare(info[q].x.nome||'','pt'));
  const linha=cid=>{const cel=D.map(({t:x,d})=>{const y=x.alunos.find(z=>z.cid===cid);if(!y||y.frequenta===false)return {na:true};const l=d&&d.linhas.find(l=>l.a.id===y.id);return l?{nota:l.nota,neg:l.neg,f:l.f.tot,t:x}:{na:true}});
    const fT=cel.reduce((s_,c)=>s_+(c.f||0),0),neg=cel.filter(c=>c.neg).length;const CE=contactosEE(a,cid);const ult=CE[0];const y=info[cid].x;const med=y.medidas||{};const nMed=['univ','selet','adic'].reduce((s_,k)=>s_+((med[k]||[]).length),0);
    return {cid,y,cel,fT,neg,CE,ult,nMed}};
  const R=cids.map(linha);const nNeg=R.filter(r=>r.neg).length;const semCont=R.filter(r=>(r.neg||r.fT>=4)&&!r.CE.length).length;
  return `<div class="card tcc"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} Turma ${esc(t.nome)} — visão completa</h2><span class="tag">${L.length} disciplina${L.length===1?'':'s'} nesta app</span><span class="sp1"></span><button class="btn sm" id="tc-csv">${ic('download',13)} CSV</button></div>
    <p class="hint" style="margin:6px 0 10px">Junta todas as disciplinas desta turma registadas na app. Os dados pessoais e os contactos com o EE são comuns: alterar numa disciplina altera em todas.${L.length<2?' Para ver outras disciplinas, crie-as em Ano Letivo e Turmas com o mesmo nome de turma.':''}</p>
    <div class="tcsum"><span><b>${R.length}</b> alunos</span><span class="${nNeg?'stlo':''}"><b>${nNeg}</b> com negativas</span><span><b>${R.reduce((s_,r)=>s_+r.fT,0)}</b> faltas</span><span class="${semCont?'pnpc':''}"><b>${semCont}</b> a precisar de contacto com o EE</span></div>
    <div class="tblw"><table class="lst tctb"><thead><tr><th>N.º</th><th>Aluno</th>${D.map(({t:x})=>`<th title="${esc(x.disciplina)}">${esc(discAbrev(x.disciplina))}</th>`).join('')}<th>Faltas</th><th>Neg.</th><th>Contacto EE</th><th></th></tr></thead><tbody>
    ${R.map(r=>`<tr class="${r.neg?'pnrb':''}"><td class="n">${esc(numAl(r.y))}</td><td><div class="tnm">${avatar(r.y,28)}<b>${esc(r.y.nome)}</b>${r.nMed?` <span class="tag pri" title="Com medidas de apoio">${ic('shield',10)} ${r.nMed}</span>`:''}</div></td>
      ${r.cel.map(c=>c.na?'<td class="mut">·</td>':`<td><b class="${c.neg?'stlo':''}">${c.nota==null?'—':fmtNota(c.t,c.nota)}</b>${c.f?` <small class="mut">${c.f}f</small>`:''}</td>`).join('')}
      <td>${r.fT||'<span class="mut">0</span>'}</td><td>${r.neg?`<b class="stlo">${r.neg}</b>`:'<span class="mut">0</span>'}</td><td>${r.ult?`<small>${fmtIso(r.ult.data)}</small> <span class="mut">${esc(r.ult.meio)}</span>`:(r.neg||r.fT>=4)?'<span class="pnpc">por fazer</span>':'<span class="mut">—</span>'}</td>
      <td class="act"><button class="btn sm" data-tcce="${r.cid}" title="Registar contacto com o EE">${ic('chat',12)}</button> <button class="btn sm" data-tcds="${r.cid}">${ic('idcard',13)} Dossiê</button></td></tr>`).join('')}</tbody></table></div></div>`}
const discAbrev=n=>{const m={'Português':'Port','Inglês':'Ing','Matemática':'Mat','Francês':'Fr','Espanhol':'Esp','História':'Hist','Geografia':'Geo','Ciências Naturais':'CN','Físico-Química':'FQ','Educação Física':'EF','Educação Visual':'EV','Cidadania e Desenvolvimento':'CD','TIC':'TIC','Filosofia':'Fil'};return m[n]||(n.length>8?n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,4):n)};
{const _vPV=vPainel;vPainel=function(){const t=T();const a=A();const C=PNL();if(t&&a&&C.vista==='turma'){barBtns([{id:'pn-dis',t:ic('back',15)+' A Minha Disciplina',f:()=>{C.vista='disc';save();vPainel()}}]);$('#view').innerHTML=pnlVistaSeg('turma')+vTurmaCompleta(t,a);bindVista();bindTC(t,a);return}
  const r=_vPV.apply(this,arguments);try{const v=$('#view');if(v&&t)v.insertAdjacentHTML('afterbegin',pnlVistaSeg('disc'));bindVista();
    $$('#view table.pntb tbody tr[data-pna]').forEach(tr=>{const x=t.alunos.find(z=>z.id===tr.dataset.pna);if(!x)return;const c=tr.cells[[...tr.parentElement.parentElement.tHead.rows[0].cells].findIndex(th=>/Aluno/.test(th.textContent))];if(c&&!c.querySelector('[data-pnds]'))c.insertAdjacentHTML('beforeend',` <button type="button" class="btn sm ico pnds" data-pnds="${x.id}" title="Dossiê do aluno" aria-label="Dossiê de ${esc(x.nome)}">${ic('idcard',13)}</button>`)});
    $$('#view [data-pnds]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=t.alunos.find(z=>z.id===b.dataset.pnds);ligarClasse(a);if(x)dossieAluno(x.cid)})}catch(e){console.warn(e)}return r};if(go._f)go._f.painel=vPainel}
function pnlVistaSeg(v){return `<div class="pnvis seg" role="tablist" aria-label="Vista do painel"><button type="button" data-pnvis="disc" class="${v==='disc'?'on':''}">${ic('book',14)} A Minha Disciplina</button><button type="button" data-pnvis="turma" class="${v==='turma'?'on':''}">${ic('users',14)} A Turma Completa</button></div>`}
function bindVista(){$$('#view [data-pnvis]').forEach(b=>b.onclick=()=>{PNL().vista=b.dataset.pnvis;save();vPainel()})}
function bindTC(t,a){$$('#view [data-tcds]').forEach(b=>b.onclick=()=>dossieAluno(b.dataset.tcds));
  $$('#view [data-tcce]').forEach(b=>b.onclick=()=>{const C=copiasDe(a,b.dataset.tcce);const c=C.find(([x])=>x.id===t.id)||C[0];if(c)contactoDlg(c[0],c[1],null,()=>vPainel())});
  const cs=$('#tc-csv');if(cs)cs.onclick=()=>{const L=turmasIrmas(t,a);const rows=[['N.º','Nome',...L.map(x=>x.disciplina),'Faltas','Negativas','Contactos EE']];const vis=$$('#view table.tctb tbody tr');vis.forEach(tr=>rows.push([...tr.cells].slice(0,-1).map(c=>c.textContent.trim())));download('Turma completa '+t.nome+'.csv',csv(rows),'text/csv')}}
/* ficha do aluno › Contactos: ligação ao registo estruturado */
new MutationObserver(()=>{const dw=$('#dw-b');if(!dw||dw.querySelector('.ceapp'))return;const ok=dw.querySelector('#fc-ok');if(!ok)return;const t=T();const a=A();if(!t||!a)return;const nm=($('#dw-t')||{}).textContent||'';const x=t.alunos.find(z=>nm.includes(z.nome));if(!x)return;ligarClasse(a);const n=contactosEE(a,x.cid).length;
  const h=dw.querySelector('h3');if(h)h.insertAdjacentHTML('beforebegin',`<div class="ceapp alert"><span>${ic('chat',15)} <b>Registo de contactos com o EE</b> · ${n} registo${n===1?'':'s'} (comuns a todas as disciplinas)</span><span class="sp1"></span><button type="button" class="btn sm pri" data-ceapp="novo">${ic('plus',13)} Registar</button><button type="button" class="btn sm" data-ceapp="ver">Ver no Dossiê</button></div>`);
  dw.querySelectorAll('[data-ceapp]').forEach(b=>b.onclick=()=>{if(b.dataset.ceapp==='novo')contactoDlg(t,x,null,()=>dossieAluno(x.cid,'ee'));else dossieAluno(x.cid,'ee')})}).observe(document.getElementById('drawer')||document.body,{childList:true,subtree:true});

/* ===================== v0.50 · Conselhos de Turma: fotografias, «O que mudou?» e preparação ===================== */
/* ano.ctFotos = [{id, classe, data, reuniao, em, al:{cid:{n:{disc:nota0a1},f:{disc:faltas},neg,ce,med}}, dec:[ids em aberto], inst:n}] */
const ctFotos=a=>a.ctFotos=a.ctFotos||[];
function ctReunioes(t,a){const L=turmasIrmas(t,a);const ids=new Set(L.map(x=>x.id));const k=normTurma(t.nome);
  return reunioes(a).filter(r=>['ct','avl'].includes(r.tipo)&&(reunTurmas(r,a).some(x=>ids.has(x.id)||normTurma(x.nome)===k)||(r.turmaNome&&normTurma(r.turmaNome)===k))).sort((p,q)=>(p.data||'').localeCompare(q.data||''))}
function ctEstado(t,a){const L=turmasIrmas(t,a);ligarClasse(a);const al={};let inst=0;
  L.forEach(x=>{let D=null;try{D=pnlDados(x,a,null)}catch(_){}inst+=x.instrumentos.length;alunosAval(x).forEach(y=>{const o=al[y.cid]=al[y.cid]||{n:{},f:{},neg:0,ce:0,med:0,nome:y.nome};const l=D&&D.linhas.find(l=>l.a.id===y.id);if(l){if(l.nota!=null)o.n[x.disciplina]=+l.nota.toFixed(4);o.f[x.disciplina]=l.f.tot;if(l.neg)o.neg++}
    const m=y.medidas||{};o.med=['univ','selet','adic'].reduce((s_,k2)=>s_+((m[k2]||[]).length),0);o.ce=contactosEE(a,y.cid).length})});
  return {al,inst}}
function ctFotografar(t,a,r){const E=ctEstado(t,a);const f={id:uid(),classe:classeKey(t),turma:t.nome,data:r?r.data:isoHoje(),reuniao:r?r.id:null,tipo:r?r.tipo:'manual',em:Date.now(),al:E.al,inst:E.inst,
  dec:r?(r.decisoes||[]).map(d=>d.id):[]};ctFotos(a).push(f);save();audit('Conselho de Turma','Fotografia registada',t.nome+' · '+f.data);return f}
function ctAuto(t,a){const hj=isoHoje();const F=ctFotos(a);let n=0;ctReunioes(t,a).filter(r=>r.data&&r.data<=hj).forEach(r=>{if(!F.some(f=>f.reuniao===r.id)){ctFotografar(t,a,r);n++}});return n}
function ctUltima(t,a){const k=classeKey(t);return ctFotos(a).filter(f=>f.classe===k).sort((p,q)=>(p.data||'').localeCompare(q.data||'')||p.em-q.em).pop()}
function ctMudou(t,a,f){const E=ctEstado(t,a);const L=turmasIrmas(t,a);const sec=x=>x&&isSec(x);const td=d=>L.find(x=>x.disciplina===d)||t;
  const sobe=[],desce=[],novNeg=[],recup=[],faltas=[];let novCont=0;
  Object.entries(E.al).forEach(([cid,o])=>{const p=f.al[cid];if(!p)return;Object.keys(o.n).forEach(d=>{const a0=p.n[d],a1=o.n[d];if(a0==null||a1==null)return;const dt=a1-a0;const lim=sec(td(d))?0.025:0.03;if(dt>=lim)sobe.push({o,d,a0,a1});else if(dt<=-lim)desce.push({o,d,a0,a1});
      const n0=negativa(td(d),a0),n1=negativa(td(d),a1);if(!n0&&n1)novNeg.push({o,d,a1});if(n0&&!n1)recup.push({o,d,a1})});
    const f0=Object.values(p.f).reduce((s_,v)=>s_+v,0),f1=Object.values(o.f).reduce((s_,v)=>s_+v,0);if(f1>f0)faltas.push({o,df:f1-f0,f1});novCont+=Math.max(0,o.ce-p.ce)});
  const r=f.reuniao&&reunioes(a).find(x=>x.id===f.reuniao);const decs=r?(r.decisoes||[]):[];const decAb=decs.filter(d=>!d.ok),decOk=decs.filter(d=>d.ok);
  const novos=Object.keys(E.al).filter(c=>!f.al[c]).map(c=>E.al[c]);const sairam=Object.keys(f.al).filter(c=>!E.al[c]).map(c=>f.al[c]);
  return {sobe,desce,novNeg,recup,faltas:faltas.sort((p,q)=>q.df-p.df),novCont,decAb,decOk,r,instNov:Math.max(0,E.inst-(f.inst||0)),novos,sairam}}
function ctPreparacao(t,a){const L=turmasIrmas(t,a);const hj=isoHoje();const f=ctUltima(t,a);const IT=[];
  L.forEach(x=>{const p=perAtual(x);const al=alunosAval(x);const sem=al.filter(y=>ponderada(x,pctsPer(x,y.id,p))==null).length;
    IT.push({ok:!sem,t:`${x.disciplina}: classificação do ${p}.º ${perW().toLowerCase()} para todos os alunos`,m:sem?sem+' aluno'+(sem>1?'s':'')+' sem classificação':'',go:'avaliacao',tid:x.id});
    const E=x.instrumentos.filter(i=>instMax(i)).map(i=>instEstado(x,i));const pend=E.filter(e=>['porclass','parcial','incompleta'].includes(e.e)).length;
    IT.push({ok:!pend,t:`${x.disciplina}: avaliações classificadas`,m:pend?pend+' por classificar ou incompleta'+(pend>1?'s':''):'',go:'instrumentos',tid:x.id});
    let D=null;try{D=pnlDados(x,a,null)}catch(_){}if(D&&D.dadas.length)IT.push({ok:!D.porConf,t:`${x.disciplina}: chamada confirmada em todas as aulas dadas`,m:D.porConf?D.porConf+' aula'+(D.porConf>1?'s':'')+' por confirmar':'',go:'sumarios',tid:x.id});
    try{const M=intMomentos(x,a).find(m=>m.p===p&&m.data&&m.data<=hj);if(M){const R=(x.interc||{})[M.id]||{};const fal=al.filter(y=>!R[y.id]).length;IT.push({ok:!fal,t:`${x.disciplina}: avaliação intercalar do ${p}.º ${perW().toLowerCase()}`,m:fal?fal+' por avaliar':'',go:'intercalar',tid:x.id})}}catch(_){}});
  const E=ctEstado(t,a);const desde=f?f.data:'0000';const prec=Object.entries(E.al).filter(([cid,o])=>o.neg||Object.values(o.f).reduce((s_,v)=>s_+v,0)>=4);
  const semC=prec.filter(([cid])=>!contactosEE(a,cid).some(c=>(c.data||'')>=desde));
  IT.push({ok:!semC.length,t:'Contacto com o EE dos alunos com negativas ou muitas faltas'+(f?' desde o último CT':''),m:semC.length?semC.map(([,o])=>o.nome.split(' ')[0]).slice(0,6).join(', ')+(semC.length>6?'…':''):'',go:'turma'});
  const tres=Object.values(E.al).filter(o=>o.neg>=3&&!o.med);IT.push({ok:!tres.length,t:'Medidas de apoio para alunos com 3 ou mais negativas',m:tres.length?tres.map(o=>o.nome.split(' ')[0]).join(', '):'',go:'alunos'});
  if(f&&f.reuniao){const r=reunioes(a).find(x=>x.id===f.reuniao);const ab=r?(r.decisoes||[]).filter(d=>!d.ok):[];IT.push({ok:!ab.length,t:'Deliberações do último CT executadas',m:ab.length?ab.length+' em aberto':'',go:'reunioes'})}
  return IT}
function ctPainel(t,a){const novas=ctAuto(t,a);const f=(UI.ctRef&&ctFotos(a).find(x=>x.id===UI.ctRef&&x.classe===classeKey(t)))||ctUltima(t,a);const hj=isoHoje();const prox=ctReunioes(t,a).find(r=>r.data>=hj);const IT=ctPreparacao(t,a);const nok=IT.filter(i=>i.ok).length;
  const nm=o=>esc(o.nome.split(' ').slice(0,2).join(' '));const vv=(d,v)=>{const x=turmasIrmas(t,a).find(z=>z.disciplina===d)||t;return fmtNota(x,v)};
  let mud='';if(f){const M=ctMudou(t,a,f);const blk=(tit,cls,L,fn)=>L.length?`<div class="ctm ${cls}"><b>${tit} <span class="tag">${L.length}</span></b><ul>${L.slice(0,8).map(x=>`<li>${fn(x)}</li>`).join('')}${L.length>8?`<li class="mut">… e mais ${L.length-8}</li>`:''}</ul></div>`:'';
    mud=`<div class="ctmg">${blk('Novas negativas','bad',M.novNeg,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a1)}`)}${blk('Recuperações concluídas','ok',M.recup,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a1)}`)}${blk('Subidas','ok',M.sobe,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a0)} → <b>${vv(x.d,x.a1)}</b>`)}${blk('Descidas','w',M.desce,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a0)} → <b>${vv(x.d,x.a1)}</b>`)}${blk('Mais faltas','w',M.faltas,x=>`${nm(x.o)} · +${x.df} (total ${x.f1})`)}${blk('Deliberações ainda por executar','bad',M.decAb,d=>`${esc(d.t)}${d.resp?' <span class="mut">· '+esc(d.resp)+'</span>':''}${d.prazo?' <span class="mut">· '+fmtIso(d.prazo)+'</span>':''}`)}${blk('Deliberações concluídas','ok',M.decOk,d=>esc(d.t))}
      ${M.novos.length?blk('Alunos novos','',M.novos,o=>nm(o)):''}${M.sairam.length?blk('Deixaram de frequentar','',M.sairam,o=>nm(o)):''}</div>
      <p class="mut" style="margin:8px 0 0">${M.instNov} instrumento${M.instNov===1?'':'s'} novo${M.instNov===1?'':'s'} · ${M.novCont} contacto${M.novCont===1?'':'s'} com o EE registado${M.novCont===1?'':'s'} desde ${fmtIsoL(f.data)}.${!M.novNeg.length&&!M.recup.length&&!M.sobe.length&&!M.desce.length&&!M.faltas.length?' Sem alterações relevantes nas classificações e faltas.':''}</p>`}
  return `<div class="png2 ctwrap"><section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('meet',18)} O Que Mudou Desde o Último CT?</h2><span class="sp1"></span><button class="btn sm" id="ct-foto" title="Guardar agora o estado da turma para comparar mais tarde">${ic('image',13)} Registar Fotografia</button></div>
      ${f?`<p class="hint" style="margin:4px 0 10px">Comparação com ${f.tipo==='manual'?'a fotografia de':esc((REUN_T[f.tipo]||{}).n||'CT')+' de'} <b>${fmtIsoL(f.data)}</b>${novas?' (registada agora)':''}.</p>${mud}`:`<p class="mut" style="margin:10px 0">Ainda não há fotografia de um Conselho de Turma. É registada automaticamente quando passa a data de um CT marcado em Reuniões, ou agora com «Registar Fotografia».</p>`}
      ${ctFotos(a).filter(x=>x.classe===classeKey(t)).length>1?`<details class="cthist"><summary>Fotografias anteriores</summary>${ctFotos(a).filter(x=>x.classe===classeKey(t)).slice().reverse().map(x=>`<div class="dsln"><span>${fmtIsoL(x.data)} · ${esc(x.tipo==='manual'?'manual':(REUN_T[x.tipo]||{}).ab||'')}</span><button class="btn sm" data-ctcmp="${x.id}">Comparar</button></div>`).join('')}</details>`:''}</section>
    <section class="card"><div class="row" style="gap:8px"><h2 style="margin:0">${ic('checks',18)} Preparação do ${prox?esc((REUN_T[prox.tipo]||{}).ab||'CT')+' de '+fmtIso(prox.data):'Próximo CT'}</h2><span class="sp1"></span><span class="tag ${nok===IT.length?'ok':'w'}">${nok}/${IT.length}</span></div>
      <div class="ctpb"><i style="width:${Math.round(nok/Math.max(1,IT.length)*100)}%"></i></div>
      <ul class="ctck">${IT.map((i,k)=>`<li class="${i.ok?'ok':''}"><span class="ctci">${ic(i.ok?'check':'alert',13)}</span><span><b>${esc(i.t)}</b>${i.m?`<small>${esc(i.m)}</small>`:''}</span>${i.ok?'':`<button class="btn sm" data-ctgo="${k}">Resolver</button>`}</li>`).join('')}</ul></section></div>`}
function bindCT(t,a){const IT=ctPreparacao(t,a);
  const fb=$('#ct-foto');if(fb)fb.onclick=()=>{ctFotografar(t,a,null);UI.ctRef=null;toast('Fotografia da turma registada','ok');vPainel()};
  $$('#view [data-ctgo]').forEach(b=>b.onclick=()=>{const i=IT[+b.dataset.ctgo];if(!i)return;if(i.go==='turma'){const el=$('#view .tctb');if(el)el.scrollIntoView({behavior:'smooth'});return}if(i.tid)S.turmaAtiva=i.tid;PNL().vista='disc';go(i.go)});
  $$('#view [data-ctcmp]').forEach(b=>b.onclick=()=>{const f=ctFotos(a).find(x=>x.id===b.dataset.ctcmp);if(!f)return;UI.ctRef=f.id;vPainel();toast('A comparar com '+fmtIsoL(f.data))})}
{const _vtc=vTurmaCompleta;vTurmaCompleta=function(t,a){return ctPainel(t,a)+_vtc.apply(this,arguments)}}
{const _btc=bindTC;bindTC=function(t,a){_btc.apply(this,arguments);bindCT(t,a)}}

/* ===================== v0.50 · Explicação dos indicadores ===================== */
function explicarNota(t,aid,per){const x=t.alunos.find(z=>z.id===aid);if(!x)return;const pRef=per||perAtual(t);const acum=per==null&&pRef>1&&t.regra[pRef]!=='periodo';const P=acum?Array.from({length:pRef},(_,k)=>k+1):[pRef];
  const pc=per==null?pctsFinal(t,aid,pRef):pctsPer(t,aid,per);const f=ponderada(t,pc);const U=v=>v==null?'—':pctD(t,v);
  const linhasP=P.map(p=>{const I=t.instrumentos.filter(i=>+i.periodo===p&&instMax(i));return `<h3>${p}.º ${perW().toLowerCase()}</h3><div class="tblw"><table class="lst expt"><thead><tr><th>Instrumento</th>${t.dominios.map(d=>`<th style="--dc:${domCor(t,d)}"><b>${esc(d.nome)}</b><small>${+d.peso||0}%</small></th>`).join('')}</tr></thead><tbody>
    ${I.map(i=>{const k=instAlunoEstado(t,i,aid);return `<tr class="${['completo','incompleta'].includes(k)?'':'expx'}"><td><b>${esc(i.nome)}</b><small class="mut">${esc(fmtIso(i.data||''))} · ${esc((EST_INST[k]||['Não realizou'])[0].toLowerCase())}</small></td>${t.dominios.map(d=>{const r=instDom(i,aid,d.id);return `<td>${r?`<b>${U(r.pct)}</b><small class="mut">${nf(r.pts,2)}/${nf(r.max,2)}</small>`:'<span class="mut">·</span>'}</td>`}).join('')}</tr>`}).join('')||`<tr><td colspan="${t.dominios.length+1}" class="mut">Sem instrumentos.</td></tr>`}
    <tr class="exps"><td><b>Média do período</b><small class="mut">média simples dos instrumentos</small></td>${t.dominios.map(d=>`<td><b>${U(domPer(t,aid,d.id,p))}</b></td>`).join('')}</tr></tbody></table></div>`}).join('');
  const usados=t.dominios.filter(d=>pc[d.id]!=null&&+d.peso>0);const wT=usados.reduce((s_,d)=>s_+ +d.peso,0);const wAll=t.dominios.reduce((s_,d)=>s_+(+d.peso||0),0);
  const formula=usados.map(d=>`<span style="color:${domCor(t,d)}">${esc(d.nome)}</span> ${U(pc[d.id])} × ${d.peso}%`).join(' + ');
  const fora=t.instrumentos.filter(i=>P.includes(+i.periodo)&&instMax(i)).map(i=>({i,k:instAlunoEstado(t,i,aid)})).filter(o=>!['completo','incompleta'].includes(o.k));
  openDrawer('Como foi calculado — '+x.nome.split(' ')[0],`<div class="ed expl"><p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)} · ${esc(t.disciplina)} · ${per==null?(acum?'nota final acumulada até ao '+pRef+'.º '+perW().toLowerCase():pRef+'.º '+perW().toLowerCase()):per+'.º '+perW().toLowerCase()}</p>
    <ol class="exsteps"><li><b>Pontos por domínio em cada instrumento</b> — pontos obtidos ÷ cotação dos itens desse domínio.${linhasP}</li>
    ${acum?`<li><b>Acumulado</b> — cada domínio é a média dos períodos 1.º a ${pRef}.º: ${t.dominios.map(d=>`<span style="color:${domCor(t,d)}">${esc(d.nome)}</span> ${U(pc[d.id])}`).join(' · ')}</li>`:''}
    <li><b>Ponderação dos domínios</b> — (${formula||'sem dados'}) ÷ ${wT}%${wT!==wAll?` <span class="tag w">ponderações reajustadas: ${t.dominios.filter(d=>pc[d.id]==null&&+d.peso>0).map(d=>esc(d.ab)).join(', ')} sem classificações</span>`:''} = <b>${f==null?'—':(isSec(t)?nf(f*20,3)+' valores':nf(f*100,2)+'%')}</b></li>
    <li><b>Arredondamento</b> (${['unidades','décimas','centésimas'][notaDec()]}, regra ${({normal:'normal',cima:'sempre para cima',baixo:'sempre para baixo'})[arredModo()]}) → <b class="${f!=null&&negativa(t,f)?'stlo':''}">${f==null?'—':fmtNota(t,f)}</b>${f!=null?(isSec(t)?' → classificação '+nivel(t,f):' → nível '+nivel(t,f)+(temMencoes(t)&&mencao(t,f)&&mencao(t,f).nome?' · '+esc(mencao(t,f).nome):'')):''}${f!=null?` <span class="tag ${negativa(t,f)?'bad':'ok'}">${negativa(t,f)?'negativa':'positiva'}</span>`:''}</li></ol>
    ${fora.length?`<div class="alert w"><b>Não entram no cálculo:</b> ${fora.map(o=>esc(o.i.nome)+' ('+esc((EST_INST[o.k]||['não realizou'])[0].toLowerCase())+')').join(' · ')}</div>`:''}</div>`)}
function explicarAssid(t,a,aid,per){const x=t.alunos.find(z=>z.id===aid);if(!x)return;let L=[];try{L=listaAulas(t,a)}catch(_){}const dadas=L.filter(z=>z.licao&&(per==null||z.per===per));const conf=dadas.filter(aulaConf),pc=dadas.filter(z=>!aulaConf(z));
  const fl=conf.map(z=>({z,p:(z.s&&z.s.pres||{})[aid]})).filter(o=>o.p&&o.p.f);const tot=fl.length;const ass=conf.length?Math.round((1-tot/conf.length)*100):null;
  openDrawer('Como foi calculado — '+x.nome.split(' ')[0],`<div class="ed expl"><p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.disciplina)} · ${per==null?'ano letivo':per+'.º '+perW().toLowerCase()}</p>
    <div class="dskp"><div><b>${dadas.length}</b><span>aulas dadas</span></div><div><b>${conf.length}</b><span>com chamada confirmada</span></div><div class="${pc.length?'w':''}"><b>${pc.length}</b><span>por confirmar (não contam)</span></div><div class="${tot?'bad':''}"><b>${tot}</b><span>faltas</span></div></div>
    <p><b>Assiduidade</b> = 1 − faltas ÷ aulas com chamada confirmada = 1 − ${tot} ÷ ${conf.length} = <b>${ass==null?'—':ass+'%'}</b></p>
    ${fl.length?`<h3>Faltas</h3>${fl.map(o=>`<div class="dsln"><b>${fmtIsoL(o.z.data)}</b><span>${fmtHM(o.z.ini)} · lição ${o.z.licao} · ${esc(o.p.f==='FD'?'disciplinar':o.p.j||o.p.just?'justificada':'injustificada')}</span></div>`).join('')}`:''}
    ${pc.length?`<h3>Aulas com chamada por confirmar</h3>${pc.slice(0,30).map(z=>`<div class="dsln"><b>${fmtIsoL(z.data)}</b><span>${fmtHM(z.ini)} · lição ${z.licao}</span><button class="btn sm" data-exch="${esc(z.k)}">Confirmar</button></div>`).join('')}`:''}</div>`);
  $$('#dw-b [data-exch]').forEach(b=>b.onclick=()=>{closeDrawer();aulaDlg(t,b.dataset.exch,'pres')})}
/* Painel: clicar na assiduidade ou na avaliação de um aluno explica o cálculo */
{const _vPX=vPainel;vPainel=function(){const r=_vPX.apply(this,arguments);try{const t=T(),a=A();const tb=$('#view table.pntb');if(!t||!tb)return r;const C=PNL();const per=C.per==='ano'?null:(C.per?+C.per:perAtual(t));
  const H=[...tb.tHead.rows[0].cells].map(c=>c.textContent.trim());const kA=H.findIndex(h=>/^Assiduidade/.test(h)),kV=H.findIndex(h=>/^Avalia/.test(h));
  [...tb.tBodies[0].rows].forEach(tr=>{const aid=tr.dataset.pna;if(!aid)return;[[kA,'ass'],[kV,'av']].forEach(([k,w])=>{const c=tr.cells[k];if(!c||k<0)return;c.classList.add('expc');c.title='Ver como foi calculado';c.tabIndex=0;const f=e=>{e.stopPropagation();w==='ass'?explicarAssid(t,a,aid,per):explicarNota(t,aid,per)};c.onclick=f;c.onkeydown=e=>{if(e.key==='Enter')f(e)}})})}catch(e){console.warn(e)}return r};if(go._f)go._f.painel=vPainel}
/* Avaliação Final: clicar na nota do aluno explica */
{const _vAX=vAvaliacao;vAvaliacao=function(){const r=_vAX.apply(this,arguments);try{const t=T();$$('#view tr[data-a] td.calc').forEach(c=>{const aid=c.closest('tr').dataset.a;c.classList.add('expc');c.title='Ver como foi calculado';c.onclick=()=>explicarNota(t,aid,null)})}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}

/* ===================== v0.50 · Pré-visualização do impacto ===================== */
function notasTurma(t){const p=perAtual(t);const o={};alunosAval(t).forEach(x=>{o[x.id]=ponderada(t,pctsFinal(t,x.id,p))});return o}
function impactoCalc(t,mudar,repor){const antes=notasTurma(t);mudar();let depois;try{depois=notasTurma(t)}finally{repor()}
  const L=alunosAval(t).map(x=>({x,a:antes[x.id],d:depois[x.id]})).filter(o=>{const fa=o.a==null?'':fmtNota(t,o.a),fd=o.d==null?'':fmtNota(t,o.d);return fa!==fd});
  return {L,neg:L.filter(o=>o.d!=null&&negativa(t,o.d)&&!(o.a!=null&&negativa(t,o.a))),pos:L.filter(o=>o.a!=null&&negativa(t,o.a)&&!(o.d!=null&&negativa(t,o.d))),nivel:L.filter(o=>o.a!=null&&o.d!=null&&nivel(t,o.a)!==nivel(t,o.d))}}
function impactoDlg(t,tit,desc,R,extra,ok){const d=document.createElement('dialog');d.className='impdlg';
  d.innerHTML=`<form method="dialog"><h2>${ic('alert',18)} ${esc(tit)}</h2><p>${desc}</p>
    <div class="dskp"><div class="${R.L.length?'w':''}"><b>${R.L.length}</b><span>classificaç${R.L.length===1?'ão muda':'ões mudam'}</span></div><div class="${R.nivel.length?'w':''}"><b>${R.nivel.length}</b><span>${isSec(t)?'classificações finais':'níveis'} mudam</span></div><div class="${R.neg.length?'bad':''}"><b>${R.neg.length}</b><span>passam a negativa</span></div><div><b>${R.pos.length}</b><span>passam a positiva</span></div></div>
    ${R.L.length?`<div class="impl">${R.L.map(o=>`<div class="dsln"><span>${esc(numAl(o.x))}. ${esc(o.x.nome)}</span><span class="mut">${o.a==null?'—':fmtNota(t,o.a)} → <b class="${o.d!=null&&negativa(t,o.d)?'stlo':''}">${o.d==null?'—':fmtNota(t,o.d)}</b>${o.a!=null&&o.d!=null&&nivel(t,o.a)!==nivel(t,o.d)?` <span class="tag w">${isSec(t)?'':'nível '}${nivel(t,o.a)} → ${nivel(t,o.d)}</span>`:''}</span></div>`).join('')}</div>`:'<p class="mut">Nenhuma classificação visível muda.</p>'}
    ${extra||''}<div class="row" style="gap:8px;margin-top:14px"><span class="sp1"></span><button value="no" class="btn">Cancelar</button><button value="ok" class="btn pri">${ic('check',14)} Confirmar</button></div></form>`;
  document.body.appendChild(d);d.addEventListener('close',()=>{const v=d.returnValue;d.remove();ok(v==='ok')});d.showModal()}
/* apagar instrumento */
{const _vIP=vInstrumentos;vInstrumentos=function(){const r=_vIP.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;
  $$('#view [data-x]').forEach(b=>{b.onclick=()=>{const i=t.instrumentos.find(x=>x.id===b.dataset.x);if(!i)return;const k=t.instrumentos.indexOf(i);
    const R=impactoCalc(t,()=>{t.instrumentos.splice(k,1)},()=>{t.instrumentos.splice(k,0,i)});const nc=alunosAval(t).filter(x=>instAvaliado(i,x.id)).length;
    impactoDlg(t,'Apagar «'+i.nome+'»?',`O instrumento tem ${nc} aluno${nc===1?'':'s'} classificado${nc===1?'':'s'}. Fica 30 dias no caixote do lixo. Impacto nas classificações do ${perAtual(t)}.º ${perW().toLowerCase()}:`,R,'',ok=>{if(!ok)return;paraLixo('instrumento',i,{ano:S.anoAtivo,turma:t.id});t.instrumentos=t.instrumentos.filter(x=>x!==i);save();vInstrumentos();toast('Instrumento apagado'+(R.L.length?' · '+R.L.length+' classificações alteradas':''),'ok')})}})}catch(e){console.warn(e)}return r};if(go._f)go._f.instrumentos=vInstrumentos}
/* mudar ponderações dos critérios */
{const _vCP=vCriterios;vCriterios=function(){const r=_vCP.apply(this,arguments);try{const t=T();if(!t)return r;
  $$('#view [data-d="peso"]').forEach(el=>{el.addEventListener('change',e=>{const d=t.dominios[+el.closest('tr').dataset.k];if(!d)return;const novo=num(el.value)||0,velho=d.peso;if(+novo===+velho)return;
    const temNotas=alunosAval(t).some(x=>ponderada(t,pctsFinal(t,x.id,perAtual(t)))!=null);if(!temNotas)return;e.stopImmediatePropagation();if($('dialog.impdlg[open]'))return;
    const R=impactoCalc(t,()=>{d.peso=novo},()=>{d.peso=velho});const tot=t.dominios.reduce((s_,z)=>s_+(z===d?+novo:(+z.peso||0)),0);
    impactoDlg(t,'Alterar a ponderação de '+d.ab+'?',`${esc(d.nome)}: ${velho}% → <b>${novo}%</b>${tot!==100?` · <span class="stlo">total ${tot}%</span>`:''}.`,R,'',ok=>{if(ok){d.peso=novo;save();audit('Critérios','Ponderação alterada',t.nome+' · '+d.ab+' '+velho+'% → '+novo+'%')}else el.value=velho;vCriterios()})},true)})}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

/* ===================== v0.50 · Modo Aula e fecho em 30 segundos ===================== */
TITLES.aula='Modo Aula';NEEDS_T.push('aula');
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="sumarios"]');if(ref&&!h.querySelector('[data-v="aula"]')){ref.insertAdjacentHTML('beforebegin',`<button class="nav tnav" data-v="aula" title="Modo Aula: chamada, sumário e observações no mesmo ecrã"><span data-ico="target"></span><span class="lbl">Modo Aula</span></button>`);const b=h.querySelector('[data-v="aula"]');b.querySelector('[data-ico]').innerHTML=ic('target',18);b.onclick=()=>go('aula')}}
{const _gMA=go;go=function(v){const r=_gMA.apply(this,arguments);if(go._f&&go._f.aula!==vAula)go._f.aula=vAula;return r}}
function aulaAtual(t,a){let L=[];try{L=listaAulas(t,a)}catch(_){}const hj=isoHoje();const ag=new Date().getHours()*60+new Date().getMinutes();
  const hoje=L.filter(x=>x.data===hj&&!(x.falta&&!x.falta.subst));
  return hoje.find(x=>x.ini-10<=ag&&ag<=x.fim+15)||hoje.find(x=>x.ini>ag)||L.filter(x=>x.licao&&!aulaConf(x)).pop()||hoje[hoje.length-1]||L.filter(x=>x.licao).pop()||L.find(x=>x.data>hj)||null}
function proximaAula(t,a,x){let L=[];try{L=listaAulas(t,a)}catch(_){}return L.find(z=>(z.data>x.data||(z.data===x.data&&z.ini>x.ini))&&!(z.falta&&!z.falta.subst))||null}
function vAula(){const t=T();if(!t)return go('turmas');const a=A();let L=[];try{L=listaAulas(t,a)}catch(_){}
  if(!L.length){$('#view').innerHTML=`<div class="card empty">${ic('target',30)}<br><b>Sem aulas calculadas</b><br><span class="mut">Defina o horário e o calendário escolar para usar o Modo Aula.</span></div>`;return}
  const x=(UI.aulaK&&L.find(z=>z.k===UI.aulaK))||aulaAtual(t,a);if(!x){$('#view').innerHTML='<div class="card empty">Sem aulas.</div>';return}UI.aulaK=x.k;
  const SM=sumariosT(a,t);const s=SM[x.k]=SM[x.k]||{};s.pres=s.pres||{};const al=alunosAval(t).filter(y=>!(typeof depoisSaida==='function'&&depoisSaida(y,x.data)));const prev=L.filter(z=>z.licao&&(z.data<x.data||(z.data===x.data&&z.ini<x.ini))).pop();const sp=prev&&SM[prev.k]||{};
  const nx=proximaAula(t,a,x);const k=L.indexOf(x);const hj=isoHoje();
  barBtns([{id:'ma-fim',t:ic('check',15)+' Fechar Aula',c:'pri',f:()=>fechoAula(t,a,x)},{id:'ma-plt',t:ic('grid',15)+' Planta',f:()=>go('planta')},{id:'ma-sum',t:ic('pen',15)+' Sumários',f:()=>go('sumarios')}]);
  const nF=al.filter(y=>(s.pres[y.id]||{}).f).length;
  $('#view').innerHTML=`<div class="maula"><div class="card mahd"><button class="btn ico" data-mamov="-1" ${k>0?'':'disabled'} aria-label="Aula anterior">‹</button><div><b>${esc(t.nome)} · ${esc(t.disciplina)}</b><small class="mut">${fmtIsoL(x.data)} · ${fmtHM(x.ini)}–${fmtHM(x.fim)}${x.licao?' · lição n.º '+x.licao:''}${x.data===hj?' · hoje':''}</small></div><span class="tag ${s.cham?'ok':'w'}">${s.cham?ic('check',11)+' chamada confirmada':'chamada por confirmar'}</span><button class="btn ico" data-mamov="1" ${k<L.length-1?'':'disabled'} aria-label="Aula seguinte">›</button></div>
    <div class="magr"><section class="card"><div class="row" style="gap:8px"><h2 style="margin:0">${ic('users',17)} Chamada</h2><span class="tag ${nF?'bad':'ok'}">${al.length-nF}/${al.length} presentes</span><span class="sp1"></span><button class="btn sm" id="ma-tp">Todos Presentes</button><button class="btn sm pri" id="ma-cc">${ic('check',13)} Confirmar Chamada</button></div>
        <p class="hint" style="margin:4px 0 8px">Toque no aluno para alternar Presente → Falta → Disciplinar. ★ regista uma observação rápida.</p>
        <div class="mach">${al.map(y=>{const p=s.pres[y.id]||{};const f=p.f||'P';const o=PRES.find(z=>z.k===f)||PRES[0];return `<div class="mac ${f!=='P'?'aus':''}" style="--c:${o.c}"><button type="button" class="macb" data-map="${y.id}" aria-label="${esc(y.nome)}: ${o.n}">${avatar(y,46)}<span><b>${esc(numAl(y))}</b> ${esc(y.nome.split(' ')[0])} ${esc(y.nome.split(' ').slice(-1)[0]===y.nome.split(' ')[0]?'':y.nome.split(' ').slice(-1)[0])}</span><i>${f==='P'?ic('check',13):esc(f)}</i></button><button type="button" class="maob ${p.oc&&p.oc.n?'on':''}" data-maob="${y.id}" title="Observação rápida">★</button></div>`}).join('')}</div>
        <div id="ma-obs"></div></section>
      <section class="card"><h2 style="margin:0 0 8px">${ic('pen',17)} Sumário${x.licao?' n.º '+x.licao:''}</h2>
        ${s.partida||sp.prox?`<div class="alert">${ic('target',14)} <b>Ponto de partida:</b> ${esc(s.partida||sp.prox)}</div>`:''}${sp.dif?`<p class="mut" style="margin:6px 0">${ic('alert',12)} Dificuldade registada na aula anterior: ${esc(sp.dif)}</p>`:''}
        <textarea id="ma-txt" rows="6" placeholder="Sumário da aula…">${esc(s.texto||'')}</textarea>
        <label style="margin-top:10px">Atividade prevista / notas</label><textarea id="ma-pl" rows="3" placeholder="Plano para esta aula…">${esc(s.plano||'')}</textarea>
        ${nx?`<p class="mut" style="margin:10px 0 0">Próxima aula: ${fmtIsoL(nx.data)} · ${fmtHM(nx.ini)}</p>`:''}</section></div></div>`;
  const grava=()=>{SM[x.k]={...SM[x.k],...s};save()};
  $$('#view [data-mamov]').forEach(b=>b.onclick=()=>{UI.aulaK=L[k+(+b.dataset.mamov)].k;vAula()});
  $$('#view [data-map]').forEach(b=>b.onclick=()=>{const id=b.dataset.map;const p=s.pres[id]=s.pres[id]||{};const ord=['','F','FD'];p.f=ord[(ord.indexOf(p.f||'')+1)%ord.length];sincFaltasAula(t,x,id,p);grava();manterPosicao(vAula)});
  $('#ma-tp').onclick=()=>{al.forEach(y=>{const p=s.pres[y.id]=s.pres[y.id]||{};p.f='';sincFaltasAula(t,x,y.id,p)});grava();vAula()};
  $('#ma-cc').onclick=()=>{s.cham=Date.now();al.forEach(y=>sincFaltasAula(t,x,y.id,s.pres[y.id]||{}));grava();audit('Sumários','Chamada confirmada (Modo Aula)',t.nome+' · '+x.data);toast('Chamada confirmada · '+(al.length-nF)+' presentes'+(nF?' · '+nF+' falta'+(nF>1?'s':''):''),'ok');vAula()};
  $('#ma-txt').oninput=e=>{s.texto=e.target.value;grava()};$('#ma-pl').oninput=e=>{s.plano=e.target.value;grava()};
  $$('#view [data-maob]').forEach(b=>b.onclick=()=>{const id=b.dataset.maob;const y=al.find(z=>z.id===id);const p=s.pres[id]=s.pres[id]||{};p.oc=p.oc||{};
    $('#ma-obs').innerHTML=`<div class="maobs"><b>${esc(y.nome)}</b><div class="chips">${OCOR.map(([kk,l])=>`<button type="button" class="chip ${(p.oc.n||'')===kk?'on':''}" data-maoc="${kk}">${esc(l)}</button>`).join('')}${['Participou bem','Sem TPC','Sem material','Distraído'].map(q=>`<button type="button" class="chip" data-maq="${q}">${q}</button>`).join('')}</div><input id="ma-ot" placeholder="Nota rápida…" value="${esc(p.oc.t||'')}"><button class="btn sm pri" id="ma-ok">Guardar</button></div>`;
    $$('#ma-obs [data-maoc]').forEach(c=>c.onclick=()=>{p.oc.n=c.dataset.maoc;$$('#ma-obs [data-maoc]').forEach(z=>z.classList.toggle('on',z===c))});
    $$('#ma-obs [data-maq]').forEach(c=>c.onclick=()=>{const i=$('#ma-ot');i.value=(i.value?i.value+'; ':'')+c.dataset.maq});
    $('#ma-ok').onclick=()=>{p.oc.t=$('#ma-ot').value.trim();if(!p.oc.n&&!p.oc.t)delete p.oc;grava();toast('Observação guardada: '+y.nome.split(' ')[0],'ok');vAula()};setTimeout(()=>$('#ma-ot').focus(),30)})}
function fechoAula(t,a,x){const SM=sumariosT(a,t);const s=SM[x.k]=SM[x.k]||{};s.pres=s.pres||{};const al=alunosAval(t).filter(y=>!(typeof depoisSaida==='function'&&depoisSaida(y,x.data)));const nF=al.filter(y=>(s.pres[y.id]||{}).f);const nx=proximaAula(t,a,x);
  const d=document.createElement('dialog');d.className='impdlg fecho';
  d.innerHTML=`<form method="dialog"><h2>${ic('check',18)} Fechar a Aula</h2><p class="mut">${esc(t.nome)} · ${fmtIsoL(x.data)} · ${fmtHM(x.ini)}${x.licao?' · lição '+x.licao:''}</p>
    <ol class="fsteps"><li><b>Chamada</b><label class="chk"><input type="checkbox" id="fa-ch" ${s.cham||true?'checked':''}> Confirmar: ${al.length-nF.length} presentes${nF.length?' · faltas: '+nF.map(y=>esc(y.nome.split(' ')[0])).join(', '):''}</label></li>
    <li><b>Sumário</b><textarea id="fa-s" rows="3" placeholder="Sumário…">${esc(s.texto||'')}</textarea></li>
    <li><b>Uma dificuldade observada</b> <span class="mut">(opcional)</span><input id="fa-d" value="${esc(s.dif||'')}" placeholder="ex.: confusão entre present perfect e past simple"></li>
    <li><b>Ponto de partida da próxima aula</b>${nx?` <span class="mut">(${fmtIsoL(nx.data)})</span>`:''}<input id="fa-p" value="${esc(s.prox||'')}" placeholder="ex.: corrigir o exercício 3 e rever o vocabulário"></li></ol>
    <div class="row" style="gap:8px;margin-top:12px"><span class="sp1"></span><button value="no" class="btn">Cancelar</button><button value="ok" class="btn pri">${ic('check',14)} Fechar Aula</button></div></form>`;
  document.body.appendChild(d);d.addEventListener('close',()=>{const ok=d.returnValue==='ok';if(ok){s.texto=d.querySelector('#fa-s').value;s.dif=d.querySelector('#fa-d').value.trim();s.prox=d.querySelector('#fa-p').value.trim();if(d.querySelector('#fa-ch').checked){s.cham=s.cham||Date.now();al.forEach(y=>sincFaltasAula(t,x,y.id,s.pres[y.id]||{}))}
      SM[x.k]={...SM[x.k],...s};if(nx&&s.prox){const sn=SM[nx.k]=SM[nx.k]||{};sn.partida=s.prox}saveNow();audit('Sumários','Aula fechada',t.nome+' · '+x.data);toast('Aula fechada'+(s.prox&&nx?' · ponto de partida guardado para '+fmtIso(nx.data):''),'ok');if(VIEW==='aula')vAula()}d.remove()});d.showModal();setTimeout(()=>{const ta=d.querySelector('#fa-s');if(ta&&!ta.value)ta.focus()},40)}
/* Sumários: mostra o ponto de partida nas aulas futuras */
{const _vSP=vSumarios;vSumarios=function(){const r=_vSP.apply(this,arguments);try{const t=T(),a=A();const SM=sumariosT(a,t);$$('#view [data-sum]').forEach(ta=>{const s=SM[ta.dataset.sum];if(s&&s.partida&&!ta.previousElementSibling?.classList?.contains('sump'))ta.insertAdjacentHTML('beforebegin',`<div class="sump">${ic('target',12)} Ponto de partida: ${esc(s.partida)}</div>`)})}catch(e){console.warn(e)}return r};if(go._f)go._f.sumarios=vSumarios}

