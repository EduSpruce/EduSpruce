/* ===================== Início: desempenho por critério de avaliação ===================== */
function estCriterios(t,per){const AL=alunosAval(t);const D=t.dominios||[];const lin=D.map(d=>({d,v:[],ant:[]}));const fin=[];
  AL.forEach(al=>{const P=pctsFinal(t,al.id,per);lin.forEach(l=>{const x=P[l.d.id];if(x!=null)l.v.push({x,al})});const f=ponderada(t,P);if(f!=null)fin.push({f,al});
    if(per>1){const Q=pctsPer(t,al.id,per-1);lin.forEach(l=>{const x=Q[l.d.id];if(x!=null)l.ant.push(x)})}});
  const med=a=>a.length?a.reduce((s,b)=>s+b,0)/a.length:null;
  lin.forEach(l=>{const xs=l.v.map(o=>o.x);l.m=med(xs);l.min=xs.length?Math.min(...xs):null;l.max=xs.length?Math.max(...xs):null;l.neg=xs.filter(x=>x<.495).length;l.top=xs.filter(x=>x>=.895).length;l.n=xs.length;l.ma=med(l.ant);
    l.dp=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-l.m)**2,0)/xs.length):0;l.fracos=l.v.filter(o=>o.x<.495).sort((a,b)=>a.x-b.x).map(o=>o.al)});
  return {lin,fin,AL,mf:med(fin.map(o=>o.f)),pos:fin.filter(o=>o.f>=.495).length}}
function widgetCriterios(){const a=A();if(!a)return '';const TF=turmasFiltradas(a).filter(t=>(t.dominios||[]).length&&t.instrumentos.some(i=>alunosAval(t).some(al=>instAvaliado(i,al.id))));if(!TF.length)return '';
  UI.estC=UI.estC||{};let t=TF.find(x=>x.id===UI.estC.t)||TF.find(x=>x.id===S.turmaAtiva)||TF[0];const pmax=Math.max(1,...t.instrumentos.map(i=>+i.periodo||1));let per=Math.min(UI.estC.p||perAtual(t),pmax);
  const sec=isSec(t);const V=f=>f==null?'—':sec?(f*20).toFixed(1).replace('.',','):Math.round(f*100)+'%';const cor=f=>f==null?'var(--mut)':f<.495?'#dc2626':f<.695?'#d97706':f<.895?'#2563eb':'#16a34a';
  const E=estCriterios(t,per);const ok=E.lin.filter(l=>l.m!=null);if(!ok.length)return '';
  const forte=ok.slice().sort((x,y)=>y.m-x.m)[0],fraco=ok.slice().sort((x,y)=>x.m-y.m)[0];const W=CAL()&&periodos().length===2?'S':'P';
  const bins=sec?[[0,.245,'0–4'],[.245,.495,'5–9'],[.495,.695,'10–13'],[.695,.895,'14–17'],[.895,1.01,'18–20']]:[[0,.495,'<50'],[.495,.695,'50–69'],[.695,.895,'70–89'],[.895,1.01,'90+']];
  const H=bins.map(([lo,hi,n])=>({n,c:E.fin.filter(o=>o.f>=lo&&o.f<hi).length,lo}));const hm=Math.max(1,...H.map(h=>h.c));
  const pctP=E.fin.length?Math.round(E.pos/E.fin.length*100):0;
  return `<div class="card estc" id="estc"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0;font-size:15px">${ic('chart',17)} Desempenho por Critério</h2><span class="sp1"></span>
    <div class="estps" role="group" aria-label="Período">${Array.from({length:pmax},(_,i)=>`<button type="button" class="${i+1===per?'on':''}" data-estp="${i+1}" aria-pressed="${i+1===per}">${i+1}.º ${W}</button>`).join('')}</div></div>
    ${TF.length>1?(()=>{const dup=n=>TF.filter(y=>y.nome===n).length>1;const lb=x=>esc(x.nome)+(dup(x.nome)?' · '+esc(discAbrev(x.disciplina)):'');return TF.length>3?`<div class="estsel">${anoBadge(t,'sm')}<select aria-label="Turma" data-estsel>${TF.map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${esc(x.nome)} · ${esc(x.disciplina)}</option>`).join('')}</select></div><div hidden>${TF.map(x=>`<button type="button" data-estt="${x.id}"></button>`).join('')}</div>`:`<div class="estts" role="group" aria-label="Turma">${TF.map(x=>`<button type="button" class="${x.id===t.id?'on':''}" data-estt="${x.id}" aria-pressed="${x.id===t.id}">${anoBadge(x,'sm')}<span>${lb(x)}</span></button>`).join('')}</div>`})():''}
    <div class="estk"><div class="estring" style="--p:${(E.mf||0)*100};--c:${cor(E.mf)}"><b>${V(E.mf)}</b><span>média</span></div>
      <div class="estkk"><div><b>${E.pos}<small>/${E.fin.length}</small></b><span>positivas · ${pctP}%</span></div><div><b style="color:${domCor(t,forte.d)}">${esc(forte.d.ab||forte.d.nome)}</b><span>ponto forte</span></div><div><b style="color:${domCor(t,fraco.d)}">${esc(fraco.d.ab||fraco.d.nome)}</b><span>a reforçar</span></div></div></div>
    <ul class="estl">${E.lin.map(l=>{const tr=l.ma!=null&&l.m!=null?l.m-l.ma:null;return `<li style="--dc:${domCor(t,l.d)}"><div class="estn"><span class="dcic">${icDom(l.d,14)}</span><span title="${esc(l.d.nome)}">${esc(l.d.nome)}</span><small>${+l.d.peso||0}%</small><span class="sp1"></span>${tr!=null&&Math.abs(tr)>=.01?`<em class="${tr>0?'up':'dn'}" title="Em relação ao ${per-1}.º ${W==='S'?'semestre':'período'}">${tr>0?'▲':'▼'} ${sec?Math.abs(tr*20).toFixed(1).replace('.',','):Math.round(Math.abs(tr)*100)}</em>`:''}<b class="estv" style="--vc:${cor(l.m)}">${V(l.m)}</b></div>
      <div class="estb" title="Mínimo ${V(l.min)} · Máximo ${V(l.max)}"><i class="rg" style="left:${(l.min||0)*100}%;width:${((l.max||0)-(l.min||0))*100}%"></i><i class="mv" style="width:${(l.m||0)*100}%;background:${domCor(t,l.d)}"></i><i class="lim"></i></div>
      <div class="estm"><span>${l.n} aval.</span>${l.neg?`<span class="neg" title="${esc(l.fracos.map(x=>x.nome).join(', '))}">${l.neg} negativa${l.neg>1?'s':''}</span>`:'<span class="okk">sem negativas</span>'}${l.top?`<span>${l.top} excelente${l.top>1?'s':''}</span>`:''}<span>dispersão ${sec?(l.dp*20).toFixed(1).replace('.',','):Math.round(l.dp*100)}</span></div></li>`}).join('')}</ul>
    <div class="esth" aria-label="Distribuição das classificações">${H.map(h=>`<div title="${h.c} aluno(s) com ${h.n}"><i style="height:${Math.max(4,h.c/hm*100)}%;background:${cor(h.lo+.01)}"></i><b>${h.c}</b><span>${h.n}</span></div>`).join('')}</div>
    ${fraco.neg?`<p class="estdica">${ic('sparkle',13)}<span><b>${esc(fraco.d.nome)}</b> é o critério mais fraco${fraco.neg?` — ${fraco.neg} aluno${fraco.neg>1?'s':''} abaixo de ${sec?'10':'50%'}`:''}. Vale a pena um instrumento ou uma atividade de recuperação focada aqui.</span></p>`:''}
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn sm" type="button" data-estgo="avaliacao">${ic('grad',14)} Avaliação</button><button class="btn sm" type="button" data-estgo="instrumentos">${ic('file',14)} Instrumentos</button></div></div>`}
function bindCriterios(){const c=$('#estc');if(!c)return;const re=()=>{const d=document.createElement('div');d.innerHTML=widgetCriterios();const n=d.firstElementChild;if(n){$('#estc').replaceWith(n);bindCriterios()}};
  c.querySelectorAll('[data-estp]').forEach(b=>b.onclick=()=>{UI.estC={...(UI.estC||{}),p:+b.dataset.estp};re()});
  c.querySelectorAll('[data-estt]').forEach(b=>b.onclick=()=>{UI.estC={t:b.dataset.estt};re()});
  c.querySelectorAll('[data-estgo]').forEach(b=>b.onclick=()=>{const tt=(UI.estC||{}).t;if(tt&&tt!==S.turmaAtiva){S.turmaAtiva=tt;save()}go(b.dataset.estgo)})}
{const _piE=posInicio;posInicio=function(){const r=_piE.apply(this,arguments);try{const cd=$('#view .cdown');const side=cd?cd.closest('.in-side')||cd.parentElement:$('.in-side');if(side&&!$('#estc')){const h=widgetCriterios();if(h){if(cd&&cd.parentElement===side)cd.insertAdjacentHTML('afterend',h);else side.insertAdjacentHTML('beforeend',h);bindCriterios()}}}catch(e){console.warn(e)}return r}}


/* ===================== Ensino profissional: avaliação separada por módulo =====================
   Cada módulo tem os seus critérios, menções, regra, instrumentos e produção oral (m.av).
   Alunos, horário, planta, sumários e direção de turma continuam a ser os da turma.
   Na turma, t.dominios / t.instrumentos / … passam a apontar para o módulo ativo. */
const MOD_KS=['dominios','mencoes','regra','instrumentos','oral'];
const MODAT_KEY='edugest.modAtivo';let MODAT={};try{MODAT=JSON.parse(localStorage.getItem(MODAT_KEY)||'{}')}catch(_){}
const _clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
function modAvDe(t,m,b){if(!m.av){const src=b||t;m.av={dominios:_clone(src.dominios||[]),mencoes:_clone(src.mencoes||MENCOES_DEF),regra:_clone(src.regra||{2:'media',3:'media'}),instrumentos:[]}}
  MOD_KS.forEach(k=>{if(k!=='oral'&&m.av[k]==null)m.av[k]=k==='instrumentos'?[]:_clone((b||{})[k])});return m.av}
function modAtivo(t){const M=t.modulos||[];if(!M.length)return null;let m=M.find(x=>x.id===MODAT[t.id]);if(!m){const hj=isoData(new Date());m=M.find(x=>x.ini&&x.ini<=hj&&(!x.fim||x.fim>=hj))||M.find(x=>!(x.ini&&x.fim&&x.fim<hj))||M[0]}return m}
function modEscolher(t,id){MODAT[t.id]=id;try{localStorage.setItem(MODAT_KEY,JSON.stringify(MODAT))}catch(_){}}
function modAttach(t){if(!t||!t.porModulo||Object.prototype.hasOwnProperty.call(t,'__mod'))return;const b={};MOD_KS.forEach(k=>{b[k]=t[k]});
  Object.defineProperty(t,'__mod',{value:b,enumerable:false,writable:true,configurable:true});
  MOD_KS.forEach(k=>Object.defineProperty(t,k,{enumerable:k!=='oral'||b.oral!==undefined,configurable:true,
    get(){const m=modAtivo(t);if(!m)return b[k];return modAvDe(t,m,b)[k]},
    set(v){const m=modAtivo(t);if(!m){b[k]=v;return}modAvDe(t,m,b)[k]=v}}));
  Object.defineProperty(t,'toJSON',{enumerable:false,configurable:true,value:function(){const o={};Object.keys(this).forEach(k=>{if(!MOD_KS.includes(k))o[k]=this[k]});MOD_KS.forEach(k=>{if(b[k]!==undefined)o[k]=b[k]});return o}})}
function modDetach(t){if(!t||!Object.prototype.hasOwnProperty.call(t,'__mod'))return;const b=t.__mod;delete t.toJSON;MOD_KS.forEach(k=>{delete t[k];if(b[k]!==undefined)t[k]=b[k]});delete t.__mod}
function modAttachAll(st){try{(st||S).anos.forEach(a=>a.turmas.forEach(t=>{if(t.porModulo)modAttach(t)}))}catch(_){}}
const modRaw=(t,k)=>t&&t.__mod?t.__mod[k]:t[k];
/* ligar a separação: copia os critérios da turma para cada módulo e leva os instrumentos já marcados com o módulo */
function modAtivar(t){if(!t||t.porModulo)return;const M=t.modulos=t.modulos||[];
  M.forEach(m=>{if(m.av)return;const ins=(t.instrumentos||[]).filter(i=>i.modulo===m.id);m.av={dominios:_clone(t.dominios||[]),mencoes:_clone(t.mencoes||MENCOES_DEF),regra:_clone(t.regra||{2:'media',3:'media'}),instrumentos:ins}});
  const usados=new Set(M.map(m=>m.id));t.instrumentos=(t.instrumentos||[]).filter(i=>!usados.has(i.modulo));t.porModulo=true;modAttach(t)}
function modDesativar(t){if(!t||!t.porModulo)return;const b=t.__mod||t;modDetach(t);t.instrumentos=t.instrumentos||[];(t.modulos||[]).forEach(m=>{if(m.av){(m.av.instrumentos||[]).forEach(i=>{i.modulo=m.id;t.instrumentos.push(i)})}});t.porModulo=false}
/* classificação do módulo: critérios do módulo, todos os instrumentos do módulo (0–20) */
function notaModAuto(t,aid,mid){if(!t||!t.porModulo)return null;const m=(t.modulos||[]).find(x=>x.id===mid);if(!m||!m.av)return null;const D=m.av.dominios||[],I=m.av.instrumentos||[];if(!D.length||!I.length)return null;
  const p={};D.forEach(d=>{const v=I.map(i=>instDom(i,aid,d.id)).filter(Boolean).map(x=>x.pct);p[d.id]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null});const f=ponderada({dominios:D},p);return f==null?null:Math.round(f*20)}
/* ligações: migrar, guardar e navegar voltam a ligar os módulos (o estado pode ter sido recarregado) */
{const _mg=migrate;migrate=function(st){const r=_mg.apply(this,arguments);modAttachAll(r);return r}}
{const _svM=saveNow;saveNow=function(){modAttachAll();return _svM.apply(this,arguments)}}
{const _gM=go;go=function(){modAttachAll();return _gM.apply(this,arguments)}}
modAttachAll();
/* o bloqueio compara os critérios guardados (não os do módulo que está aberto) */
{const _bs=bloqSig;bloqSig=function(st,c){if(c!=='criterios')return _bs.apply(this,arguments);return JSON.stringify((st.anos||[]).map(a=>(a.turmas||[]).map(t=>[t.id,modRaw(t,'dominios'),modRaw(t,'mencoes'),modRaw(t,'regra'),(t.modulos||[]).map(m=>m.av?[m.id,m.av.dominios,m.av.mencoes,m.av.regra]:m.id)])))}}
/* barra de módulos nas vistas de avaliação */
const MOD_VISTAS=new Set(['criterios','instrumentos','dominios','avaliacao','relatorios','oral','inicio_x']);
function barraModulos(t){const M=t.modulos||[];const m=modAtivo(t);const U=unidMod(t);
  if(!M.length)return `<div class="modbar vz" role="note">${ic('layers',16)}<span><b>Esta disciplina ainda não tem ${U.p.toLowerCase()}.</b> No ensino profissional cada ${U.um} tem os seus critérios e a sua avaliação.</span><span class="sp1"></span><button class="btn sm pri" type="button" data-modnovo>${ic('plus',14)} Criar ${U.p}</button></div>`;
  const hs=M.reduce((s,x)=>s+(+x.horas||0),0);
  return `<div class="modbar" role="group" aria-label="${U.s} em avaliação"><span class="modl">${ic('layers',15)} ${U.s}</span><div class="modch">${M.map((x,i)=>{const n=(x.av&&x.av.instrumentos||[]).length;return `<button type="button" class="modc ${x===m?'on':''}" data-modsel="${x.id}" aria-pressed="${x===m}" title="${esc((x.cod?x.cod+' · ':'')+x.nome)}"><b>${esc(x.cod||String(i+1))}</b><span>${esc(x.nome)}</span><small>${x.horas?x.horas+' h':''}${n?' · '+n+' instr.':''}</small></button>`}).join('')}</div>
    <span class="sp1"></span><span class="mut modtot">${M.length} ${M.length===1?U.um:U.p.toLowerCase()}${hs?' · '+hs+' h':''}</span><button class="btn sm" type="button" data-modger>${ic('pencil',13)} Gerir</button></div>
    ${m?`<p class="modinfo">${ic('info',13)||''} A ver <b>${esc((m.cod?m.cod+' — ':'')+m.nome)}</b>: critérios, instrumentos e classificação são só deste ${U.um}. Alunos, horário e planta da sala são os da turma.</p>`:''}`}
function modPorBarra(){const v=$('#view');if(!v)return;const t=T();const ex=v.querySelector(':scope>.modwrap');
  if(!t||!t.porModulo||!MOD_VISTAS.has(VIEW)){if(ex)ex.remove();return}
  const html=barraModulos(t);if(ex&&ex.dataset.h===html)return;if(ex)ex.remove();
  const w=document.createElement('div');w.className='modwrap';w.dataset.h=html;w.innerHTML=html;const h=v.querySelector(':scope>h1');if(h)h.after(w);else v.prepend(w);
  w.querySelectorAll('[data-modsel]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.modsel);go(VIEW)});
  const g=w.querySelector('[data-modger]');if(g)g.onclick=()=>go('modulos');const n=w.querySelector('[data-modnovo]');if(n)n.onclick=()=>{go('modulos');setTimeout(()=>{try{moduloDlg(t)}catch(_){}},100)}}
{let _mo=null;const liga=()=>{const v=$('#view');if(!v||_mo)return;_mo=new MutationObserver(()=>{if(!v.querySelector(':scope>.modwrap')||VIEW)requestAnimationFrame(()=>{try{modPorBarra()}catch(_){}})});_mo.observe(v,{childList:true})};
  setTimeout(liga,0);{const _gMb=go;go=function(){const r=_gMb.apply(this,arguments);liga();try{modPorBarra()}catch(_){}return r}}}
/* Módulos: interruptor da avaliação separada e classificação automática visível */
{const _vm=vModulos;vModulos=function(){const r=_vm.apply(this,arguments);try{const t=T();if(!t||!ehModular(t))return r;const U=unidMod(t);const v=$('#view');const h=v.querySelector(':scope>h1');
  const html=`<div class="card modsep"><div class="row" style="gap:10px;flex-wrap:wrap"><span class="modsi">${ic('layers',20)}</span><div style="flex:1;min-width:220px"><b>Avaliação separada por ${U.um}</b><div class="mut" style="font-size:13px">${t.porModulo?`Cada ${U.um} tem critérios, instrumentos e classificação próprios. A classificação do ${U.um} é calculada com os seus instrumentos (pode escrevê-la à mão na pauta).`:`Os critérios e os instrumentos são comuns a todos os ${U.p.toLowerCase()} da turma.`}</div></div>
    <label class="modsw"><input type="checkbox" role="switch" id="mod-sep" ${t.porModulo?'checked':''} aria-label="Avaliação separada por módulo"><span aria-hidden="true"></span></label></div></div>`;
  if(h)h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);
  $('#mod-sep').onchange=e=>{if(e.target.checked){if(!(t.modulos||[]).length){e.target.checked=false;return toast('Crie primeiro os '+U.p.toLowerCase(),'aviso')}modAtivar(t);toast('Avaliação separada por '+U.um+' ligada — os critérios da turma foram copiados para cada '+U.um,'ok')}else{if(!confirm('Voltar a critérios comuns? Os instrumentos de cada '+U.um+' passam para a turma (ficam marcados com o '+U.um+'); os critérios próprios de cada '+U.um+' deixam de ser usados.')){e.target.checked=true;return}modDesativar(t)}saveNow();vModulos()};
  /* novos módulos já ficam com avaliação própria */
  if(t.porModulo)(t.modulos||[]).forEach(m=>{if(!m.av)modAvDe(t,m,t.__mod)})}catch(e){console.warn(e)}return r}}
/* ---------- Nova Turma (ensino profissional): os módulos da disciplina são obrigatórios ---------- */
{const _ntM=novaTurmaDlg;novaTurmaDlg=function(){const r=_ntM.apply(this,arguments);try{const dw=$('#dw-b');const ok=$('#nt-ok');if(!dw||!ok)return r;
  const ofA=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};const disc=()=>{const sd=$('#nt-disc');return sd&&sd.value!=='__outra'?discNome(sd.value):(($('#nt-outra')||{}).value||'').trim()};
  let rows=[{n:'',h:''},{n:'',h:''}];
  const wrap=document.createElement('div');wrap.id='nt-modsx';const ref=$('#nt-maisw')||($('#nt-outra')&&$('#nt-outra').closest('div'));if(ref)ref.before(wrap);else ok.before(wrap);
  const cnqSel=()=>dw.querySelectorAll('.cnqp input[type=checkbox]:checked,[data-cnqu]:checked,.cnqt input[type=checkbox]:checked').length;
  const desenha=()=>{if(ofA()!=='profissional'){wrap.innerHTML='';return}const d=disc();const ae=document.activeElement;const foco=ae&&ae.dataset&&ae.dataset.mr!=null?[ae.dataset.mr,ae.dataset.mk,ae.selectionStart]:null;
    wrap.innerHTML=`<div class="ntmod"><div class="row" style="gap:8px"><b>${ic('layers',15)} Módulos de ${esc(d||'a disciplina')} <span class="req" aria-hidden="true">*</span></b><span class="sp1"></span><span class="mut" style="font-size:12px">cada módulo tem critérios e avaliação próprios</span></div>
      <div class="ntmr hd" aria-hidden="true"><span>N.º</span><span>Designação</span><span>Horas</span><span></span></div>
      ${rows.map((x,i)=>`<div class="ntmr"><span class="ntmn">${i+1}</span><input data-mr="${i}" data-mk="n" value="${esc(x.n)}" placeholder="${i===0?'ex.: Folha de cálculo':'ex.: Bases de dados'}" aria-label="Designação do módulo ${i+1}"><input data-mr="${i}" data-mk="h" value="${esc(x.h)}" inputmode="numeric" placeholder="h" aria-label="Horas do módulo ${i+1}"><button type="button" class="btn sm ico" data-mrx="${i}" aria-label="Retirar módulo ${i+1}" ${rows.length<2?'disabled':''}>${ic('x',12)}</button></div>`).join('')}
      <div class="row" style="gap:8px;margin-top:6px"><button type="button" class="btn sm" id="nt-modadd">${ic('plus',13)} Acrescentar Módulo</button><span class="mut" style="font-size:12px">Se escolher UC/UFCD do catálogo acima, também ficam como módulos.</span></div>
      <p class="lgerr" id="nt-moderr" role="alert"></p></div>`;
    wrap.querySelectorAll('[data-mr]').forEach(inp=>inp.oninput=()=>{rows[+inp.dataset.mr][inp.dataset.mk]=inp.value});
    wrap.querySelectorAll('[data-mrx]').forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.mrx,1);desenha()});
    $('#nt-modadd').onclick=()=>{rows.push({n:'',h:''});desenha();const L=wrap.querySelectorAll('[data-mk="n"]');L[L.length-1].focus()};
    if(foco){const e=wrap.querySelector(`[data-mr="${foco[0]}"][data-mk="${foco[1]}"]`);if(e){e.focus();try{e.setSelectionRange(foco[2],foco[2])}catch(_){}}}};
  desenha();dw.addEventListener('click',e=>{if(e.target.closest('#nt-ofw'))setTimeout(desenha,30)});dw.addEventListener('change',e=>{if(e.target.id==='nt-disc'||e.target.id==='nt-outra')desenha()});
  ok.addEventListener('click',e=>{if(ofA()!=='profissional')return;const val=rows.filter(x=>x.n.trim());
    if(!val.length&&!cnqSel()){e.stopImmediatePropagation();e.preventDefault();const er=$('#nt-moderr');if(er)er.textContent='Indique pelo menos um módulo (designação e horas).';const f=wrap.querySelector('[data-mk="n"]');if(f)f.focus();toast('No ensino profissional a disciplina tem de ter módulos','erro');return}
    const a=A();const antes=new Set(a?a.turmas.map(t=>t.id):[]);const d=disc();const nome=(($('#nt-nome')||{}).value||'').trim();
    setTimeout(()=>{const a2=A();if(!a2)return;const novas=a2.turmas.filter(t=>!antes.has(t.id));if(!novas.length)return;
      novas.forEach(t=>{t.modulos=t.modulos||[];if(t.disciplina===d&&t.nome===nome)val.forEach((x,i)=>t.modulos.push({id:uid()+i,cod:String(t.modulos.length+1),nome:x.n.trim(),horas:+String(x.h).replace(/\D/g,'')||'',ini:'',fim:''}));modAtivar(t)});
      saveNow();try{go(VIEW)}catch(_){}const tp=novas.find(t=>t.disciplina===d);if(tp)toast(tp.modulos.length+' módulo(s) criados em '+tp.nome+' · '+tp.disciplina+' — cada um com avaliação própria','ok')},0)},true)}catch(e){console.warn(e)}return r}}


/* ===================== Mecanismo de Recuperação (MRA) por módulo — ensino profissional =====================
   A ficha original (folha A4 e PDF) é a mesma da app MRA: corre dentro de uma moldura, já preenchida com a turma,
   o formador, o formando, o módulo, as horas e as faltas. As fichas ficam guardadas na turma (t.mra[módulo][aluno]). */
const MRA_K={cur:'mra.atual.v1',reg:'mra.registos.v1',data:'mra.dados.v1',cfg:'mra.config.v1'};
let _mraHtml=null,_mraDef=null;
async function mraFonte(){if(_mraHtml)return _mraHtml;const h=await gunzipB64('mragz');if(!h)throw new Error('Este browser não consegue abrir a ficha MRA (sem descompressão).');_mraHtml=h;
  try{const i=h.indexOf('const DEFAULT_DATA=');const j=h.indexOf('\n',i);_mraDef=JSON.parse(h.slice(i+19,j).trim().replace(/;$/,''))}catch(_){_mraDef={cursos:[],formadores:[],disciplinas:[],modulos:[]}}return h}
const _nz=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const mraM=t=>t.mra=t.mra||{};
const mraCfgM=t=>t.mraCfg=t.mraCfg||{};
const mraAlLabel=a=>((a.processo||a.numInterno||a.num||'')+'').trim()?((a.processo||a.numInterno||a.num)+' - '+a.nome):a.nome;
const mraModLabel=m=>(m.cod?String(m.cod).padStart(/^\d+$/.test(m.cod)?3:0,'0')+' - ':'')+m.nome;
function mraCursoDef(t){const D=_mraDef||{cursos:[]};const cod=_nz(t.codigo||t.nome).split(' ')[0];return D.cursos.find(c=>_nz(c.nome).split(' ')[0]===cod)||D.cursos.find(c=>t.curso&&_nz(c.nome).includes(_nz(t.curso)))||null}
function mraCursoNome(t){const d=mraCursoDef(t);if(d)return d.nome;return [t.codigo||t.nome,t.curso||(t.cnq&&t.cnq.nome)||''].filter(Boolean).join(' - ')}
function mraFormador(){const D=_mraDef||{formadores:[]};const ps=[S.cfg.professor,profNome(S.cfg.professor)].map(_nz).filter(Boolean);if(!ps.length)return '';for(const p of ps){const L=D.formadores.find(f=>_nz(f).endsWith(p)||_nz(f).includes(p));if(L)return L}
  const w=ps[0].split(' ');const L=D.formadores.find(f=>{const z=_nz(f);return w.length>1&&z.includes(w[0])&&z.endsWith(w[w.length-1])});return L||S.cfg.professor}
function mraDisc(t){const D=_mraDef||{disciplinas:[]};const d=_nz(t.disciplina);return D.disciplinas.find(x=>_nz(x.replace(/^\s*\d+\s+-\s+/,''))===d)||D.disciplinas.find(x=>_nz(x).endsWith(d))||t.disciplina}
/* faltas do aluno nas datas do módulo (tempos registados na ficha do aluno e nas presenças das aulas) */
function mraFaltas(t,a,m){if(!m.ini&&!m.fim)return null;const ini=m.ini||'0000',fim=m.fim||'9999';
  return (a.faltasAl||[]).filter(f=>(f.tipo==='injust'||f.tipo==='just'||!f.tipo)&&f.data>=ini&&f.data<=fim).reduce((s,f)=>s+(+f.tempos||1),0)}
const mraCalc=(h,f)=>{h=parseFloat(h)||0;f=parseFloat(f)||0;const lim=Math.ceil(h/10-1e-9),ex=f-lim;return {lim,ex:ex>0?ex:0}};
function mraFichaNova(t,a,m){const k=mraCalc(m.horas,mraFaltas(t,a,m)||0);const disc=mraDisc(t),mod=mraModLabel(m);const n=Math.max(1,Math.min(k.ex||1,51));
  return {id:uid(),curso:mraCursoNome(t),formador:mraFormador(),formando:mraAlLabel(a),tipo:ofertaDe(t)==='profij'||/^UC/i.test(m.cod||'')?'UFCD/Unidade':'Módulo',horas:+m.horas||25,faltas:mraFaltas(t,a,m)||0,exame:'Não',data:isoHoje(),
    rows:Array.from({length:n},()=>({dt:'',disc,mod,ativ:'',parecer:''})),atualizado:null}}
function mraDados(t,m){const D=_clone(_mraDef||{cursos:[],formadores:[],disciplinas:[],modulos:[]});const c=mraCfgM(t);const d=mraCursoDef(t);const nome=mraCursoNome(t);
  const cur={nome,projeto:projetoDe(t),orientador:c.orientador!=null?c.orientador:(d?d.orientador:''),genero:c.genero||(d?d.genero:'F'),formandos:alunosAval(t).map(mraAlLabel)};
  D.cursos=D.cursos.filter(x=>x.nome!==nome);D.cursos.unshift(cur);const f=mraFormador();if(f&&!D.formadores.includes(f))D.formadores.unshift(f);
  const di=mraDisc(t);if(!D.disciplinas.includes(di))D.disciplinas.unshift(di);(t.modulos||[]).map(mraModLabel).reverse().forEach(x=>{if(!D.modulos.includes(x))D.modulos.unshift(x)});return D}
/* abrir a ficha original numa moldura, por cima da app */
async function mraAbrir(t,m,a){let html;try{html=await mraFonte()}catch(e){return toast(e.message,'erro')}
  const M=mraM(t);M[m.id]=M[m.id]||{};let F=M[m.id][a.id];if(!F){F=mraFichaNova(t,a,m)}else{F=_clone(F);F.formando=mraAlLabel(a);F.curso=mraCursoNome(t)}
  const ant={};Object.values(MRA_K).forEach(k=>{ant[k]=localStorage.getItem(k)});
  const reg=(M[m.id]._reg||[]);try{localStorage.setItem(MRA_K.cur,JSON.stringify(F));localStorage.setItem(MRA_K.data,JSON.stringify(mraDados(t,m)));localStorage.setItem(MRA_K.reg,JSON.stringify(Object.values(M[m.id]).filter(x=>x&&x.id&&x.guardada)));
    localStorage.setItem(MRA_K.cfg,JSON.stringify({anoModo:'manual',anoManual:(A()&&/^\d{4}\/\d{4}$/.test(A().nome)?A().nome:'')||''}))}catch(e){return toast('Sem espaço no browser para abrir a ficha','erro')}
  const css=`<style id="ef-mra">#side{display:none!important}#b-novo{display:none!important}#bar{padding-left:16px}
</style>`;
  const doc=html.replace('</head>',css+'</head>');
  const o=document.createElement('div');o.id='mraov';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Ficha MRA');
  const k=mraCalc(F.horas,F.faltas);
  o.innerHTML=`<div class="mrah"><button class="btn" type="button" id="mra-x">${ic('arrowL',16)} Voltar</button><div class="mrat"><b>${esc(a.nome)}</b><span>${esc(mraModLabel(m))} · ${esc(t.nome)} · ${esc(t.disciplina)}</span></div><span class="sp1"></span><span class="tag ${k.ex?'':'ok'}" id="mra-ex">${k.ex?'Excesso: '+k.ex+' h':'Sem reposição'}</span><span class="mut mras" id="mra-st">guardado automaticamente</span></div>
    <iframe id="mra-if" title="Ficha do Mecanismo de Recuperação" srcdoc=""></iframe>`;
  document.body.appendChild(o);document.body.classList.add('mra-on');const fr=o.querySelector('#mra-if');fr.srcdoc=doc;
  const guardar=()=>{try{const v=JSON.parse(localStorage.getItem(MRA_K.cur)||'null');if(!v)return;const R=JSON.parse(localStorage.getItem(MRA_K.reg)||'[]');v.guardada=R.some(x=>x.id===v.id)||!!(M[m.id][a.id]&&M[m.id][a.id].guardada);
      const vaz=!v.rows||!v.rows.some(r=>r.dt||r.ativ||r.parecer);const mud=JSON.stringify(v)!==JSON.stringify(F);if(!mud&&!M[m.id][a.id])return;M[m.id][a.id]=v;F=_clone(v);save();
      const kk=mraCalc(v.horas,v.faltas);const ex=$('#mra-ex');if(ex){ex.textContent=kk.ex?'Excesso: '+kk.ex+' h':'Sem reposição';ex.classList.toggle('ok',!kk.ex)}const st=$('#mra-st');if(st)st.textContent=v.guardada?'ficha guardada':vaz?'rascunho':'guardado automaticamente'}catch(e){console.warn(e)}};
  const onSt=e=>{if(e.key===MRA_K.cur||e.key===MRA_K.reg)guardar()};addEventListener('storage',onSt);const iv=setInterval(guardar,1500);
  const fechar=()=>{guardar();clearInterval(iv);removeEventListener('storage',onSt);document.removeEventListener('keydown',kb,true);Object.entries(ant).forEach(([k,v])=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(_){}});
    o.remove();document.body.classList.remove('mra-on');try{manterPosicao(()=>go(VIEW))}catch(_){go(VIEW)}};
  const kb=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();fechar()}};document.addEventListener('keydown',kb,true);
  o.querySelector('#mra-x').onclick=fechar;setTimeout(()=>o.querySelector('#mra-x').focus(),50)}
/* vista: Turma › Recuperação (MRA) */
function vMra(){const t=T();if(!t)return go('turmas');const U=unidMod(t);const v=$('#view');
  if(ofertaDe(t)==='profij'){go('precup');return}
  if(!ehModular(t)){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Só para turmas do ensino profissional e PROFIJ</b><br><span class="mut">O Mecanismo de Recuperação é feito por ${U.um}.</span></div>`;return}
  const M=t.modulos||[];if(!M.length){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Esta turma ainda não tem ${U.p.toLowerCase()}</b><br><button class="btn pri" style="margin-top:10px" data-goview="modulos">${ic('plus',15)} Criar ${U.p}</button></div>`;v.querySelector('[data-goview]').onclick=()=>go('modulos');return}
  if(!_mraDef)mraFonte().then(()=>{if(VIEW==='mra')manterPosicao(vMra)}).catch(()=>{});
  const m=modAtivo(t);const al=alunosAval(t);const MM=(mraM(t)[m.id])||{};const c=mraCfgM(t);const d=_mraDef?mraCursoDef(t):null;const lim=mraCalc(m.horas,0).lim;const hj=isoHoje();
  const L=al.map(a=>{const F=MM[a.id];const auto=mraFaltas(t,a,m);const f=F?+F.faltas||0:(auto||0);const k=mraCalc(F?F.horas:m.horas,f);return {a,F,f,auto,k}});
  const nEx=L.filter(x=>x.k.ex).length,nG=L.filter(x=>x.F&&x.F.guardada).length,nR=L.filter(x=>x.F&&!x.F.guardada).length,hRec=L.reduce((s,x)=>s+x.k.ex,0);
  const fl=UI.mraF||'todos';const LL=fl==='ex'?L.filter(x=>x.k.ex):fl==='ficha'?L.filter(x=>x.F):L;
  barBtns([{id:'b-mrm',t:ic('pencil',15)+' Editar '+U.s,f:()=>{try{moduloDlg(t,m)}catch(_){go('modulos')}}},{id:'b-mrc',t:ic('download',15)+' Exportar CSV',f:()=>download('MRA '+t.nome+' '+(m.cod||'')+' '+m.nome+'.csv',csv([['N.º','Formando(a)','Horas','Faltas','Limite','Excesso','Ficha'],...L.map(x=>[x.a.num||'',x.a.nome,m.horas||'',x.f,lim,x.k.ex,x.F?(x.F.guardada?'Guardada':'Rascunho'):''])]),'text/csv')},{id:'b-mrp',t:ic('printer',15)+' Imprimir Lista',f:()=>window.print()}]);
  const dur=m.ini&&m.fim?Math.max(1,diasEntre(m.ini,m.fim)):null;const dec=dur&&hj>=m.ini?Math.min(100,Math.round(diasEntre(m.ini,hj<m.fim?hj:m.fim)/dur*100)):0;
  const ini=n=>{const w=n.split(' ').filter(Boolean);return ((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()};
  v.innerHTML=`${!t.porModulo?`<div class="modbar mramods" role="group" aria-label="${U.s}"><span class="modl">${ic('layers',15)} ${U.s}</span><div class="modch">${M.map((x,i)=>{const n=Object.values((mraM(t)[x.id])||{}).filter(F=>F&&mraCalc(F.horas,F.faltas).ex).length;return `<button type="button" class="modc ${x===m?'on':''}" data-mrasel="${x.id}" aria-pressed="${x===m}"><b>${esc(x.cod||String(i+1))}</b><span>${esc(x.nome)}</span><small>${x.horas?x.horas+' h':'sem horas'}${n?' · '+n+' MRA':''}</small></button>`}).join('')}</div></div>`:''}
    <div class="mralay"><div class="mramain">
    <section class="card mrahero"><div class="mrahl"><span class="mracod">${esc(m.cod||'—')}</span><div><h2>${esc(m.nome)}</h2><p class="mut">${esc(t.nome)} · ${esc(t.disciplina)}${t.curso?' · '+esc(t.curso):''}</p></div></div>
      <div class="mraf3"><label><span>Horas</span><input id="mr-h" inputmode="numeric" value="${esc(m.horas||'')}" placeholder="ex.: 25" class="${m.horas?'':'falta'}"></label><label><span>Início</span><input type="date" id="mr-i" value="${esc(m.ini||'')}"></label><label><span>Fim</span><input type="date" id="mr-f" value="${esc(m.fim||'')}"></label>
        <div class="mralim"><span>Limite de faltas</span><b>${m.horas?lim+' h':'—'}</b><small>10% das horas, arredondado para cima</small></div></div>
      ${dur?`<div class="mraprog"><span class="dprog lg"><i style="width:${dec}%"></i></span><small>${hj<m.ini?'começa a '+fmtIso(m.ini):hj>m.fim?'terminou a '+fmtIso(m.fim):dec+'% do tempo do '+U.um+' decorrido'}</small></div>`:`<p class="mranote">${ic('info',14)} Indique o início e o fim para as faltas registadas nesse intervalo serem contadas automaticamente.</p>`}
      ${!m.horas?`<p class="mranote warn">${ic('alert',14)} Sem horas definidas, não é possível calcular o limite nem o excesso.</p>`:''}</section>
    <div class="dkps mrakp"><div class="dkp"><span class="dkl">${ic('alert',15)} Com excesso</span><b class="dkv ${nEx?'bad':''}">${nEx}<small>/${al.length}</small></b><span class="dks">alunos acima do limite</span></div>
      <div class="dkp"><span class="dkl">${ic('clock',15)} A recuperar</span><b class="dkv">${hRec}<small> h</small></b><span class="dks">soma dos excessos</span></div>
      <div class="dkp"><span class="dkl">${ic('check',15)} Fichas</span><b class="dkv">${nG}<small> guardadas</small></b><span class="dks">${nR} em rascunho</span></div>
      <div class="dkp"><span class="dkl">${ic('file',15)} Por fazer</span><b class="dkv ${L.filter(x=>x.k.ex&&!x.F).length?'bad':''}">${L.filter(x=>x.k.ex&&!x.F).length}</b><span class="dks">alunos com excesso sem ficha</span></div></div>
    <section class="card"><div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:10px"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><div class="dseg" role="radiogroup" aria-label="Filtrar">${[['todos','Todos',L.length],['ex','Com excesso',nEx],['ficha','Com ficha',nG+nR]].map(([k,n,c])=>`<button type="button" role="radio" aria-checked="${fl===k}" class="${fl===k?'on':''}" data-mrafl="${k}">${n} <span class="mrac">${c}</span></button>`).join('')}</div></div>
      ${!al.length?`<div class="empty" style="padding:22px">${ic('users',26)}<br><b>Ainda sem alunos nesta turma</b><br><button class="btn pri" style="margin-top:10px" data-goview="alunos">${ic('plus',14)} Acrescentar Alunos</button></div>`:!LL.length?`<p class="mut" style="padding:10px 4px">Nenhum aluno neste filtro.</p>`:
      `<ul class="mral">${LL.map(({a,F,f,auto,k})=>{const pc=lim?Math.min(100,f/(lim*2)*100):0;const fo=fotoSrc(a);return `<li class="${k.ex?'ex':''}"><span class="mrav">${fo?`<img src="${fo}" alt="">`:esc(ini(a.nome))}</span><div class="mran"><b>${esc(a.nome)}</b><small>${a.num?'n.º '+esc(numAl(a)):''}${auto!=null&&!F?' · faltas contadas automaticamente':''}</small></div>
        <div class="mrafw"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="-1" aria-label="Menos uma falta">−</button><input class="mraf" data-mraf="${a.id}" value="${esc(f)}" inputmode="numeric" aria-label="Faltas de ${esc(a.nome)}"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="1" aria-label="Mais uma falta">+</button></div>
        <div class="mram" title="${f} h de faltas · limite ${lim} h"><span class="mrab"><i style="width:${pc}%"></i><b style="left:50%"></b></span><small>${f} / ${lim} h</small></div>
        <span class="mrae">${k.ex?`<span class="tag bad">+${k.ex} h</span>`:'<span class="tag ok">ok</span>'}</span>
        <span class="mras">${F?(F.guardada?`<span class="tag ok">${ic('check',11)} Guardada</span>`:'<span class="tag">Rascunho</span>'):'<span class="mut">—</span>'}</span>
        <span class="mraa"><button class="btn sm ${k.ex&&!F?'pri':''}" data-mraab="${a.id}">${ic('file',13)} ${F?'Abrir':'Ficha'}</button>${F?`<button class="btn sm ico" data-mradel="${a.id}" aria-label="Apagar ficha de ${esc(a.nome)}">${ic('trash',13)}</button>`:''}</span></li>`}).join('')}</ul>`}
    </section></div>
    <aside class="mraside"><section class="card"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0">${ic('gear',16)} Dados da Ficha</h2><span class="sp1"></span><button class="btn sm" type="button" id="mra-edt">${ic('pencil',13)} Editar Turma</button></div>
      <dl class="mradl"><dt>Projeto N.º</dt><dd>${projetoDe(t)?esc(projetoDe(t)):'<span class="bad">por definir</span>'} <span class="mut">(${esc(A().nome)})</span></dd>
      <dt>Curso</dt><dd>${esc(_mraDef?mraCursoNome(t):(turmaDado(t,'cursoFicha')||'…'))}</dd>
      <dt>${turmaDado(t,'genero')==='M'?'Orientador':'Orientadora'}</dt><dd>${turmaDado(t,'orientador')?esc(turmaDado(t,'orientador')):'<span class="bad">por definir</span>'}</dd>
      <dt>Formador(a)</dt><dd>${esc(_mraDef?mraFormador():profNome(S.cfg.professor)||'')}</dd><dt>Disciplina</dt><dd>${esc(_mraDef?mraDisc(t):t.disciplina)}</dd></dl>
      <p class="mut" style="font-size:12px;margin:10px 0 0">Estes dados vêm das definições da turma (comuns a todas as disciplinas da turma neste ano letivo).</p></section>
      <section class="card mrahow"><h2 style="margin:0 0 8px">${ic('info',16)} Como Funciona</h2><ol><li>As faltas acima de <b>10% das horas</b> do ${U.um} têm de ser recuperadas.</li><li>O excesso define o número de linhas (sessões) da ficha.</li><li><b>Ficha</b> abre a folha oficial já preenchida; imprima ou exporte em PDF para assinar.</li><li>As fichas ficam guardadas na turma, por ${U.um} e por aluno.</li></ol></section></aside></div>`;
  const re=()=>manterPosicao(vMra);
  v.querySelectorAll('[data-mrasel]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.mrasel);vMra()});
  v.querySelectorAll('[data-mrafl]').forEach(b=>b.onclick=()=>{UI.mraF=b.dataset.mrafl;re()});
  v.querySelectorAll('[data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));
  [['mr-h','horas',x=>+String(x).replace(/\D/g,'')||''],['mr-i','ini',x=>x],['mr-f','fim',x=>x]].forEach(([id,k,f])=>{const e=$('#'+id);if(e)e.onchange=()=>{m[k]=f(e.value);save();re()}});
  const setF=(a,val)=>{const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};val=Math.max(0,val);if(MMm[a.id]){MMm[a.id].faltas=val;const k=mraCalc(MMm[a.id].horas,val);const R=MMm[a.id].rows||[];const r0=R[0]||{};while(R.length<Math.min(k.ex||1,51))R.push({dt:'',disc:r0.disc||'',mod:r0.mod||'',ativ:'',parecer:''})}else{MMm[a.id]=Object.assign(mraFichaNova(t,a,m),{faltas:val});const k=mraCalc(MMm[a.id].horas,val);const r0=MMm[a.id].rows[0];MMm[a.id].rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...r0}))}save();re()};
  v.querySelectorAll('[data-mraf]').forEach(i=>i.onchange=()=>setF(al.find(x=>x.id===i.dataset.mraf),+String(i.value).replace(',','.')||0));
  v.querySelectorAll('[data-mrad]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mrad);const cur=L.find(x=>x.a===a).f;setF(a,cur+(+b.dataset.dlt))});
  v.querySelectorAll('[data-mraab]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mraab);const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};if(!MMm[a.id]){const f=L.find(x=>x.a===a).f;const F=mraFichaNova(t,a,m);F.faltas=f;const k=mraCalc(F.horas,f);F.rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...F.rows[0]}));MMm[a.id]=F;save()}mraAbrir(t,m,a)});
  v.querySelectorAll('[data-mradel]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mradel);if(!confirm('Apagar a ficha MRA de '+a.nome+' neste '+U.um+'?'))return;delete mraM(t)[m.id][a.id];save();re()});
  {const e=$('#mra-edt');if(e)e.onclick=()=>{editarTurmaDlg(t);const obs=new MutationObserver(()=>{if(!$('#drawer.on')){obs.disconnect();if(VIEW==='mra')manterPosicao(vMra)}});obs.observe($('#drawer'),{attributes:true,attributeFilter:['class']})}}}
TITLES.mra='Recuperação (MRA)';NEEDS_T.push('mra');MOD_VISTAS.add('mra');
{const _gR=go;go=function(v){const r=_gR.apply(this,arguments);if(go._f&&!go._f.mra)go._f.mra=vMra;try{navMra()}catch(_){}return r}}
function navMra(){const t=T();const on=!!t&&ehProfT(t);$$('#side [data-v="mra"],#tnavHold [data-v="mra"]').forEach(b=>{b.hidden=!on;b.style.display=on?'':'none'})}
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="modulos"]');if(ref&&!h.querySelector('[data-v="mra"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="mra" title="Mecanismo de Recuperação (faltas por módulo)" hidden><span data-ico="refresh"></span><span class="lbl">Recuperação (MRA)</span></button>`);const b=h.querySelector('[data-v="mra"] [data-ico]');if(b)b.innerHTML=ic('refresh',18);h.querySelector('[data-v="mra"]').onclick=()=>go('mra')}}
/* atalho na lista de módulos */
{const _vmR=vModulos;vModulos=function(){const r=_vmR.apply(this,arguments);try{const t=T();if(t&&ehProfT(t)&&(t.modulos||[]).length){$$('#view table.modlst tbody tr').forEach((tr,i)=>{const m=t.modulos[i];const cel=tr.lastElementChild;if(m&&cel&&!cel.querySelector('[data-modmra]'))cel.insertAdjacentHTML('afterbegin',`<button class="btn sm ico" data-modmra="${m.id}" title="Mecanismo de Recuperação (MRA)" aria-label="Recuperação de ${esc(m.nome)}">${ic('refresh',14)}</button>`)});
  $$('[data-modmra]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.modmra);go('mra')})}}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'mra',ic:'refresh',t:'Mecanismo de Recuperação (MRA) por módulo',gif:null,txt:`<p>Nas turmas do ensino profissional, Turma › <b>Recuperação (MRA)</b> mostra, para cada módulo, as faltas de cada aluno, o limite (10% das horas, arredondado para cima) e o excesso. <b>Preencher Ficha</b> abre a ficha oficial do Mecanismo de Recuperação (a mesma folha da app MRA, com Imprimir e Exportar PDF), já com o curso, o formador, o formando, a disciplina, o módulo, as horas e as faltas. A ficha guarda-se sozinha na turma.</p>`});


/* botão de bloqueio também na barra de cima */
function bloqBarBtn(){const aj=$('#ajBtn');if(!aj)return;let b=$('#bloqBar');const tem=S.anos.some(a=>a.turmas.length);
  if(!tem){if(b)b.remove();return}if(!b){aj.insertAdjacentHTML('beforebegin','<button class="btn ico" id="bloqBar" type="button"></button>');b=$('#bloqBar');b.onclick=()=>bloqAlternar(!bloqOn())}
  const on=bloqOn();b.classList.toggle('bloqon',on);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Dados de base bloqueados — desbloquear':'Bloquear dados de base');b.title=on?'Dados de base bloqueados — toque para desbloquear':'Bloquear turmas, alunos, critérios, horários e calendário';b.innerHTML=ic(on?'cadeado':'cadeadoAb',18)}
{const _bu=bloqUI;bloqUI=function(){const r=_bu.apply(this,arguments);try{bloqBarBtn()}catch(_){}return r}}
setTimeout(()=>{try{bloqBarBtn()}catch(_){}},60);


/* avisos: também o que há de especial hoje (aniversários, feriados, dias nacionais e internacionais, fim de semana) */
function avisosHoje(){const d=new Date(),iso=isoHoje(),md=iso.slice(5);const V=avVistos(),agora=Date.now();const ok=k=>!(V[k]&&V[k]>agora);const out=[];const add=(k,o)=>{k='h:'+iso+':'+k;if(ok(k))out.push({k,...o})};
  try{const p=perfil();if(p.nascimento&&p.nascimento.slice(5)===md)add('anos',{ic:'sparkle',cor:'#d4a20b',t:'Hoje é o seu aniversário! Parabéns 🎂',s:'Um dia para celebrar — o trabalho pode esperar.'})}catch(_){}
  const a=A();if(a){const N=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nasc&&x.nasc.slice(5)===md&&x.frequenta!==false&&!N.some(n=>n.id===x.id))N.push({id:x.id,n:x.nome.split(' ')[0]+' '+(x.nome.split(' ').slice(-1)[0]||''),t:t.nome})}));
    if(N.length)add('alanos',{ic:'users',cor:'#7a4fd0',t:N.length===1?'Aniversário de '+N[0].n:N.length+' aniversários de alunos',s:N.slice(0,5).map(x=>x.n+' ('+x.t+')').join(' · ')+(N.length>5?' …':''),ir:()=>go('alunos')});
    const cal=a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const nota=cal&&cal.notas&&cal.notas[iso];if(tp&&tp!=='letivo'&&TIPOS_DIA[tp])add('cal',{ic:'flag',cor:'#c0392b',t:nomeTipo(tp),s:nota||'Calendário escolar',ir:()=>go('calendario')})}
  const todos=[...(DIAS_COMEM[md]||[])];(diasMoveis(d.getFullYear())[iso]||[]).forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  if(nac.length)add('nac',{ic:'flag',cor:'#0a5aa8',t:nac.length===1?nac[0]:'Dias nacionais',s:nac.length===1?'Dia nacional':nac.join(' · ')});
  if(int.length)add('int',{ic:'globo',cor:'#0f766e',t:int.length===1?int[0]:'Dias internacionais',s:int.length===1?'Dia internacional':int.join(' · ')});
  const pz=piadaHoje(d);if(pz)add('pz',{ic:'sparkle',cor:'#f59e0b',t:pz,s:d.getDay()===0?'É domingo':'É sábado'});
  return out}
{const _auH=avisosUrgentes;avisosUrgentes=function(){const L=_auH.apply(this,arguments)||[];try{L.push(...avisosHoje())}catch(e){console.warn(e)}return L}}


/* ===================== Início: versão Simples / versão Geral (painel completo) ===================== */
const dashM=()=>{const d=S.cfg.dash=S.cfg.dash||{};d.modo=d.modo||'simples';d.f=d.f||{};d.w=d.w||{};d.ordem=d.ordem||[];d.layout=d.layout||'grade';return d};
const DASH_W=[
  ['resumo','Resumo Geral','Turmas, alunos, aulas, tarefas e pendências','layers','xl','Alta'],
  ['dia','O Meu Dia','Horário, aulas, reuniões e compromissos','calendar','s','Alta'],
  ['alertas','Alertas Inteligentes','Avaliações, documentos e prazos pendentes','alert','s','Alta'],
  ['desempenho','Desempenho Escolar','Médias, evolução e aproveitamento','chart','s','Alta'],
  ['avaliacoes','Avaliações','Testes realizados, por corrigir e por lançar','clipboard','s','Alta'],
  ['estado','Estado das Turmas','Indicadores individuais por turma','users','xl','Alta'],
  ['calendario','Calendário','Eventos e próximos prazos','calcheck','s','Média'],
  ['sumarios','Sumários','Tempos lecionados e registos pendentes','pen','m','Média'],
  ['dt','Direção de Turma','Assiduidade, comunicações e processos','crown','s','Média'],
  ['profij','PROFIJ e Profissional','Progresso de módulos/UFCD, horas e avaliação','layers','s','Média'],
  ['criterios','Desempenho por Critério','Média por domínio, negativas e evolução','chart','s','Média'],
  ['assiduidade','Assiduidade dos Alunos','Faltas, atrasos e alunos em risco','user','m','Média'],
  ['aniversarios','Aniversários','Próximos 14 dias','sparkle','s','Baixa'],
  ['tarefas','Tarefas','Por fazer, atrasadas e de hoje','check','s','Baixa'],
  ['atividade','Atividade Recente','Últimas alterações (auditoria)','refresh','s','Baixa'],
  ['seguranca','Dados e Segurança','Cópia, nuvem e bloqueio','shield','s','Baixa']];
const DASH_TAM={s:'Pequeno',m:'Médio',l:'Grande',xl:'Largura total'};
const DASH_G=[['geral','Visão Geral',['resumo']],['hoje','Hoje',['dia','alertas','tarefas']],['aval','Avaliação e Desempenho',['desempenho','avaliacoes','criterios']],['turmas','Turmas e Aulas',['estado','sumarios','assiduidade']],['gestao','Agenda e Gestão',['calendario','dt','profij','aniversarios','atividade','seguranca']]];
const dashCfgW=id=>{const d=dashM();const base=DASH_W.find(w=>w[0]===id);return Object.assign({on:true,tam:base?base[4]:'m'},d.w[id]||{})};
const dashOrdem=()=>{const d=dashM();const ids=DASH_W.map(w=>w[0]);return [...d.ordem.filter(x=>ids.includes(x)),...ids.filter(x=>!d.ordem.includes(x))]};
/* ---------- contexto (com filtros globais) ---------- */
function dashCtx(){const a=A();const d=dashM();const f=d.f;const hj=isoData(new Date());let TF=a?turmasFiltradas(a):[];
  if(f.oferta)TF=TF.filter(t=>ofertaDe(t)===f.oferta);if(f.disc)TF=TF.filter(t=>t.disciplina===f.disc);if(f.turma)TF=TF.filter(t=>t.nome===f.turma);
  const perAt=periodoDe(hj)||1;const per=f.per?+f.per:perAt;const W=perW();
  const cache=new Map();const ap=t=>{const k='ap'+t.id;if(!cache.has(k)){let r=null;try{r=aulasPrevistas(t,a)}catch(_){}cache.set(k,r)}return cache.get(k)};
  const la=t=>{const k='la'+t.id;if(!cache.has(k)){let r=[];try{r=listaAulas(t,a)}catch(_){}cache.set(k,r)}return cache.get(k)};
  const notas=(t,p)=>{const k='n'+t.id+'|'+p;if(!cache.has(k)){const al=alunosAval(t);const v=al.map(x=>{let fv=null;try{fv=ponderada(t,pctsFinal(t,x.id,p))}catch(_){}return {al:x,f:fv}}).filter(o=>o.f!=null);cache.set(k,v)}return cache.get(k)};
  return {a,TF,per,perAt,W,hj,ap,la,notas,f}}
const _avg=v=>v.length?v.reduce((s,x)=>s+x,0)/v.length:null;
const dashV=(t,f)=>f==null?'—':isSec(t)?(f*20).toFixed(1).replace('.',','):Math.round(f*100)+'%';
const dashCor=f=>f==null?'var(--mut)':f<.495?'#dc2626':f<.695?'#d97706':f<.895?'#2563eb':'#16a34a';
function dashTrend(cur,prev,fmt,inv){if(cur==null||prev==null)return '';const d=cur-prev;if(Math.abs(d)<1e-9)return `<span class="dtr eq">= ${fmt?fmt(0):'0'}</span>`;const bom=inv?d<0:d>0;return `<span class="dtr ${bom?'up':'dn'}">${d>0?'▲':'▼'} ${fmt?fmt(Math.abs(d)):Math.abs(d)}</span>`}
/* ---------- widgets ---------- */
const DW={};
DW.resumo=C=>{const {TF,ap,la,per,W}=C;const al=TF.reduce((s,t)=>s+alunosAval(t).length,0);const disc=new Set(TF.map(t=>t.disciplina)).size;
  let prev=0,dadas=0,prevAnt=0,dadasAnt=0;TF.forEach(t=>{const r=ap(t);if(!r)return;const p=r.P.find(x=>x.n===per);if(p){prev+=p.tempos;dadas+=p.tDadas}const q=r.P.find(x=>x.n===per-1);if(q){prevAnt+=q.tempos;dadasAnt+=q.tDadas}});
  const semSum=TF.reduce((s,t)=>s+la(t).filter(x=>x.passada&&!x.falta&&x.s&&x.s.estado!=='nao'&&!(x.s.texto||'').trim()&&x.per===per).length,0);
  const T_=tarefas();const pend=T_.filter(x=>!x.feito);const atr=pend.filter(x=>x.prazo&&x.prazo<C.hj).length;
  const porCor=TF.reduce((s,t)=>s+t.instrumentos.filter(i=>i.data&&i.data<=C.hj&&alunosAval(t).some(x=>!instAvaliado(i,x.id))).length,0);
  let av=0;try{av=avisosUrgentes().length}catch(_){}
  const pc=prev?Math.round(dadas/prev*100):0;const pcA=prevAnt?Math.round(dadasAnt/prevAnt*100):null;
  const tile=(ic_,l,v,sub,extra,go_)=>`<button type="button" class="dkp" ${go_?`data-dgo="${go_}"`:''}><span class="dkl">${ic(ic_,15)} ${l}</span><b class="dkv">${v}</b><span class="dks">${sub}</span>${extra||''}</button>`;
  return `<div class="dkps">${tile('users','Turmas',TF.length,disc+' disciplina'+(disc!==1?'s':''),'','turmas')}${tile('user','Alunos',al,TF.length?'média de '+Math.round(al/TF.length)+' por turma':'—')}
    ${tile('calendar','Aulas Dadas',dadas+'<small>/'+prev+'</small>',pc+'% do '+per+'.º '+W.toLowerCase()+' · '+Math.max(0,prev-dadas)+' por dar'+(pcA!=null?' · '+dashTrend(pc,pcA,x=>x+' pp')+' vs. '+(per-1)+'.º':''),`<i class="dkbar"><i style="width:${pc}%"></i></i>`)}
    ${tile('check','Tarefas',pend.length,atr?`<span class="bad">${atr} atrasada${atr>1?'s':''}</span>`:'nenhuma atrasada','','tarefas')}
    ${tile('alert','Pendências',semSum+porCor+av,`${semSum} sumários · ${porCor} por corrigir · ${av} avisos`,'',semSum?'sumarios':'')}</div>`};
DW.dia=C=>{const {a,TF,hj}=C;if(!a)return '';let L=[];try{L=proximasAulas(TF.flatMap(t=>aulasTurma(t,a).map(x=>({...x,t}))),60)}catch(_){}
  const hoje=L.filter(p=>p.k===0);let dia=hoje,rot='Hoje';if(!hoje.length&&L.length){const k=L[0].k;dia=L.filter(p=>p.k===k);rot=k===1?'Amanhã':DIAS[L[0].data.getDay()]}
  const isoD=dia.length?isoData(dia[0].data):hj;const R=reunioes(a).filter(r=>reunAtiva(r)&&r.data===isoD);const Tk=tarefas().filter(x=>!x.feito&&x.prazo===isoD);
  const ev=[...dia.map(p=>({h:p.ini,f:p.fim,tp:'aula',p})),...R.map(r=>({h:r.semHora?-1:r.ini||0,f:r.fim,tp:'reun',r})),...Tk.map(x=>({h:-2,tp:'tar',x}))].sort((x,y)=>x.h-y.h);
  const mins=new Date().getHours()*60+new Date().getMinutes();
  return `<p class="dsub">${esc(rot)}${rot!=='Hoje'?' · próximo dia com aulas':''} · ${dia.length} tempo${dia.length!==1?'s':''}${R.length?' · '+R.length+' reunião'+(R.length>1?'ões':''):''}</p>
    ${ev.length?`<ol class="dtl">${ev.map(e=>e.tp==='aula'?`<li class="${e.p.agora?'now':rot==='Hoje'&&e.f<mins?'past':''}"><span class="dth">${fmtHM(e.p.ini)}</span><button type="button" class="dte" data-dtt="${e.p.t.id}">${anoBadge(e.p.t,'sm')}<span><b>${esc(e.p.t.nome)}</b> ${esc(e.p.t.disciplina)}<small>${fmtHM(e.p.ini)}–${fmtHM(e.p.fim)}${e.p.sala?' · Sala '+esc(e.p.sala):''}</small></span>${e.p.agora?'<span class="tag now">agora</span>':''}</button></li>`
      :e.tp==='reun'?`<li><span class="dth">${e.r.semHora?'—':fmtHM(e.r.ini||0)}</span><button type="button" class="dte reun" data-dreun="${e.r.id}">${ic('meet',16)}<span><b>${esc(reunTitulo(e.r,a))}</b><small>${e.r.local?esc(e.r.local):'Reunião'}</small></span></button></li>`
      :`<li><span class="dth">${ic('check',13)}</span><div class="dte tar">${ic('flag',15)}<span><b>${esc(e.x.t)}</b><small>Tarefa com prazo ${rot==='Hoje'?'hoje':'neste dia'}</small></span></div></li>`).join('')}</ol>`:`<p class="mut">Sem aulas nem compromissos.</p>`}`};
DW.alertas=C=>{const {a,TF,la,hj,per}=C;if(!a)return '';const A_=[];const add=(n,ic_,t,s,go_,acc)=>A_.push({n,ic:ic_,t,s,go:go_,acc});
  TF.forEach(t=>{const ss=la(t).filter(x=>x.passada&&!x.falta&&x.s.estado!=='nao'&&!(x.s.texto||'').trim());if(ss.length)add(ss.length>5?3:2,'pen',`${ss.length} sumário${ss.length>1?'s':''} por escrever`,t.nome+' · '+t.disciplina,'sumarios:'+t.id,'Escrever');
    const pc=t.instrumentos.filter(i=>i.data&&i.data<=hj&&alunosAval(t).some(x=>!instAvaliado(i,x.id)));if(pc.length)add(2,'clipboard',`${pc.length} instrumento${pc.length>1?'s':''} por corrigir`,t.nome+' · '+pc.map(i=>i.nome).slice(0,2).join(', '),'instrumentos:'+t.id,'Corrigir');
    const soma=(t.dominios||[]).reduce((s,d)=>s+(+d.peso||0),0);if((t.dominios||[]).length&&Math.abs(soma-100)>.5)add(2,'alert','Ponderações somam '+soma+'%',t.nome+' · critérios','criterios:'+t.id,'Rever');
    t.instrumentos.filter(i=>i.data&&i.data>hj&&diasEntre(hj,i.data)<=7).forEach(i=>add(1,'calendar',`${esc(i.nome)} dentro de ${diasEntre(hj,i.data)} dia${diasEntre(hj,i.data)!==1?'s':''}`,t.nome+' · '+fmtIso(i.data),'testes:'+t.id,'Ver'));
    if(ehModular(t))(t.modulos||[]).forEach(m=>{if(m.fim&&m.fim<hj&&alunosAval(t).some(x=>notaMod(t,x.id,m.id)==null))add(2,'layers',`${m.cod?m.cod+' · ':''}${esc(m.nome)} terminou sem todas as classificações`,t.nome,'modulos:'+t.id,'Lançar')})});
  try{matrizes(a,TF).filter(x=>!x.enviada&&x.data>=hj&&diasEntre(hj,x.data)<=7).forEach(x=>add(2,'file',`Enviar matriz — ${esc(x.i.nome)}`,x.t.nome+' · até '+fmtIso(x.data),'testes:'+x.t.id,'Ver'))}catch(_){}
  tarefas().filter(x=>!x.feito&&x.prazo&&x.prazo<hj).forEach(x=>add(2,'flag','Tarefa atrasada: '+x.t,'prazo '+fmtIso(x.prazo),'tarefas','Ver'));
  try{(S.docsArq||[]).filter(d=>d.estado==='rascunho'||d.estado==='revisao').forEach(d=>add(1,'file',`Documento ${d.estado==='rascunho'?'em rascunho':'em revisão'}: ${esc(d.titulo||d.modelo||'')}`,d.numero||'','documentos','Abrir'))}catch(_){}
  try{reunioes(a).filter(r=>r.estado==='realizada'&&!(r.notas||'').trim()).forEach(r=>add(1,'meet','Ata por escrever: '+reunTitulo(r,a),fmtIso(r.data),'reunioes','Abrir'))}catch(_){}
  try{const c=a.calendario;const p=c&&c.periodos.find(x=>x.n===per);if(p&&p.fim>=hj&&diasEntre(hj,p.fim)<=14)TF.forEach(t=>{const al=alunosAval(t);const sem=al.filter(x=>ponderada(t,pctsFinal(t,x.id,per))==null).length;if(sem)add(3,'grad',`Fim do ${per}.º ${perW().toLowerCase()} em ${diasEntre(hj,p.fim)} dias — ${sem} aluno${sem>1?'s':''} sem classificação`,t.nome+' · '+t.disciplina,'avaliacao:'+t.id,'Avaliar')})}catch(_){}
  try{const dd=S.cfg.ultimaCopia?Math.floor((Date.now()-S.cfg.ultimaCopia)/864e5):null;if((dd==null||dd>14)&&!nvL().prov)add(1,'shield',dd==null?'Ainda sem cópia de segurança':'Última cópia há '+dd+' dias','Exporte uma cópia ou ligue a sincronização','definicoes:dados','Resolver')}catch(_){}
  A_.sort((x,y)=>y.n-x.n);const cor=['','#0a5aa8','#d97706','#dc2626'];
  return A_.length?`<p class="dsub">${A_.length} alerta${A_.length>1?'s':''} · ${A_.filter(x=>x.n===3).length} urgente${A_.filter(x=>x.n===3).length!==1?'s':''}</p><ul class="dal">${A_.slice(0,C.big?14:7).map(x=>`<li style="--ac:${cor[x.n]}">${ic(x.ic,15)}<span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>${x.go?`<button class="btn sm" type="button" data-dgo="${esc(x.go)}">${esc(x.acc||'Abrir')}</button>`:''}</li>`).join('')}</ul>${A_.length>(C.big?14:7)?`<p class="mut dmore">+ ${A_.length-(C.big?14:7)} alertas</p>`:''}`:`<div class="dok">${ic('check',22)}<b>Tudo em dia</b><span class="mut">Sem pendências para os filtros escolhidos.</span></div>`};
DW.desempenho=C=>{const {TF,per,notas,W}=C;const R=TF.map(t=>{const v=notas(t,per);const va=per>1?notas(t,per-1):[];const m=_avg(v.map(o=>o.f)),ma=_avg(va.map(o=>o.f));return {t,m,ma,n:v.length,pos:v.filter(o=>o.f>=.495).length}}).filter(r=>r.n);
  if(!R.length)return `<p class="mut">Ainda sem classificações no ${per}.º ${W.toLowerCase()}.</p>`;
  const all=R.reduce((s,r)=>s+r.n,0),pos=R.reduce((s,r)=>s+r.pos,0);const mg=_avg(R.map(r=>r.m)),mga=_avg(R.filter(r=>r.ma!=null).map(r=>r.ma));const pc=Math.round(pos/all*100);
  const sec=R.every(r=>isSec(r.t));const fmt=x=>sec?(x*20).toFixed(1).replace('.',','):Math.round(x*100)+' pp';
  return `<div class="dperf"><div class="estring" style="--p:${(mg||0)*100};--c:${dashCor(mg)}"><b>${sec?(mg*20).toFixed(1).replace('.',','):Math.round(mg*100)+'%'}</b><span>média</span></div>
    <div class="dpk"><div><b>${pc}%</b><span>aproveitamento · ${pos}/${all}</span></div><div><b>${dashTrend(mg,mga,fmt)||'—'}</b><span>vs. ${per-1>0?(per-1)+'.º '+W.toLowerCase():'período anterior'}</span></div></div></div>
    <ul class="dbars">${R.sort((x,y)=>y.m-x.m).map(r=>`<li><span class="dbn">${anoBadge(r.t,'sm')}<b>${esc(r.t.nome)}</b><small>${esc(r.t.disciplina)}</small></span><span class="dbb"><i style="width:${r.m*100}%;background:${dashCor(r.m)}"></i><i class="lim"></i></span><b class="dbv" style="color:${dashCor(r.m)}">${dashV(r.t,r.m)}</b>${dashTrend(r.m,r.ma,x=>isSec(r.t)?(x*20).toFixed(1).replace('.',','):Math.round(x*100))}<small class="mut">${Math.round(r.pos/r.n*100)}% pos.</small></li>`).join('')}</ul>`};
DW.avaliacoes=C=>{const {TF,hj}=C;const I=TF.flatMap(t=>t.instrumentos.filter(i=>i.data).map(i=>({t,i,ok:alunosAval(t).length&&alunosAval(t).every(x=>instAvaliado(i,x.id)),alg:alunosAval(t).some(x=>instAvaliado(i,x.id))})));
  const fut=I.filter(x=>x.i.data>hj).sort((x,y)=>x.i.data.localeCompare(y.i.data)),pc=I.filter(x=>x.i.data<=hj&&!x.ok),fe=I.filter(x=>x.i.data<=hj&&x.ok);
  const lan=TF.filter(t=>{const p=(A().calendario||{periodos:[]}).periodos.find(z=>z.n===C.per);return p&&diasEntre(hj,p.fim)<=21&&diasEntre(hj,p.fim)>=-14});
  const chip=(n,l,c,go_)=>`<button type="button" class="dch" style="--ac:${c}" ${go_?`data-dgo="${go_}"`:''}><b>${n}</b><span>${l}</span></button>`;
  return `<div class="dchs">${chip(fut.length,'Marcadas','#2563eb','testes')}${chip(pc.length,'Por corrigir','#d97706','instrumentos')}${chip(fe.length,'Corrigidas','#16a34a','instrumentos')}${chip(lan.length,'Turmas por lançar','#7a4fd0','avaliacao')}</div>
    ${pc.length?`<h4 class="dh4">Por corrigir</h4><ul class="dli">${pc.slice(0,4).map(x=>{const k=alunosAval(x.t).filter(a=>instAvaliado(x.i,a.id)).length,n=alunosAval(x.t).length;return `<li><button type="button" data-dinst="${x.t.id}|${x.i.id}"><b>${esc(x.i.nome)}</b><small>${esc(x.t.nome)} · ${fmtIso(x.i.data)}</small><span class="dprog"><i style="width:${n?k/n*100:0}%"></i></span><em>${k}/${n}</em></button></li>`}).join('')}</ul>`:''}
    ${fut.length?`<h4 class="dh4">Próximas</h4><ul class="dli">${fut.slice(0,4).map(x=>`<li><button type="button" data-dgo="testes:${x.t.id}"><b>${esc(x.i.nome)}</b><small>${esc(x.t.nome)} · ${fmtIso(x.i.data)}</small><em>${diasEntre(hj,x.i.data)} d</em></button></li>`).join('')}</ul>`:''}
    ${lan.length?`<p class="dnote">${ic('grad',13)} Avaliação do ${C.per}.º ${perW().toLowerCase()} a lançar no SGE: ${lan.map(t=>esc(t.nome)).join(', ')}</p>`:''}`};
DW.estado=C=>{const {TF,ap,la,per,notas,hj}=C;if(!TF.length)return '<p class="mut">Sem turmas.</p>';
  return `<div class="tblw"><table class="lst dest"><thead><tr><th>Turma</th><th>Alunos</th><th>Média</th><th>Positivas</th><th>Aulas</th><th>Sumários</th><th>Faltas</th><th>Próxima avaliação</th></tr></thead><tbody>${TF.map(t=>{const v=notas(t,per),va=per>1?notas(t,per-1):[];const m=_avg(v.map(o=>o.f)),ma=_avg(va.map(o=>o.f));const pos=v.filter(o=>o.f>=.495).length;
    const r=ap(t);const p=r&&r.P.find(x=>x.n===per);const ss=la(t).filter(x=>x.passada&&!x.falta&&x.s.estado!=='nao'&&!(x.s.texto||'').trim()).length;
    const fa=alunosAval(t).reduce((s,x)=>s+(x.faltasAl||[]).filter(f=>f.tipo==='injust').reduce((q,f)=>q+(+f.tempos||1),0),0);const nx=t.instrumentos.filter(i=>i.data&&i.data>=hj).sort((x,y)=>x.data.localeCompare(y.data))[0];
    return `<tr data-dtt="${t.id}" tabindex="0"><td><span class="dbn">${anoBadge(t,'sm')}<b>${esc(t.nome)}</b><small>${esc(t.disciplina)}</small></span></td><td>${alunosAval(t).length}</td>
      <td><b style="color:${dashCor(m)}">${dashV(t,m)}</b> ${dashTrend(m,ma,x=>isSec(t)?(x*20).toFixed(1).replace('.',','):Math.round(x*100))}</td><td>${v.length?Math.round(pos/v.length*100)+'%':'—'}</td>
      <td>${p?`<span class="dmini"><i style="width:${p.tempos?p.tDadas/p.tempos*100:0}%"></i></span> ${p.tDadas}/${p.tempos}`:'—'}</td><td>${ss?`<span class="tag bad">${ss} em falta</span>`:'<span class="tag ok">em dia</span>'}</td><td>${fa||'—'}</td><td>${nx?esc(nx.nome)+' · '+fmtIso(nx.data):'<span class="mut">—</span>'}</td></tr>`}).join('')}</tbody></table></div>`};
DW.calendario=C=>{const {a,TF,hj}=C;if(!a)return '';const E=[];const ate=isoData(new Date(Date.now()+45*864e5));
  try{const c=a.calendario;if(c){c.periodos.forEach(p=>{if(p.fim>=hj&&p.fim<=ate)E.push({d:p.fim,t:'Fim do '+p.n+'.º '+perW().toLowerCase(),ic:'flag',c:'#c0392b'});if(p.ini>hj&&p.ini<=ate)E.push({d:p.ini,t:'Início do '+p.n+'.º '+perW().toLowerCase(),ic:'flag',c:'#16a34a'})});
    Object.entries(c.dias||{}).filter(([d,tp])=>d>=hj&&d<=ate&&/^feriado/.test(tp)).forEach(([d,tp])=>E.push({d,t:(c.notas&&c.notas[d])||nomeTipo(tp),ic:'flag',c:'#c0392b'}));
    let ini=null;Object.keys(c.dias||{}).sort().forEach(d=>{if(d<hj||d>ate)return;if(c.dias[d]==='interrupcao'){if(!ini){ini=d;E.push({d,t:'Interrupção letiva',ic:'sun',c:'#0f8b8d'})}}else ini=null})}}catch(_){}
  reunioes(a).filter(r=>reunAtiva(r)&&r.data>=hj&&r.data<=ate).forEach(r=>E.push({d:r.data,t:reunTitulo(r,a),ic:'meet',c:'#0f8b8d',go:'reunioes',h:r.semHora?'':fmtHM(r.ini||0)}));
  TF.forEach(t=>t.instrumentos.filter(i=>i.data&&i.data>=hj&&i.data<=ate).forEach(i=>E.push({d:i.data,t:i.nome+' · '+t.nome,ic:'clipboard',c:'#2563eb',go:'testes:'+t.id})));
  try{TF.forEach(t=>datasAvalDe(a,t).filter(x=>x.data&&x.data>=hj&&x.data<=ate).forEach(x=>{if(!E.some(e=>e.d===x.data&&e.t.startsWith((AVAL_T[x.tipo]||{}).n||'§')))E.push({d:x.data,t:(AVAL_T[x.tipo]||{n:'Avaliação'}).n,ic:'grad',c:'#7a4fd0'})}))}catch(_){}
  tarefas().filter(x=>!x.feito&&x.prazo&&x.prazo>=hj&&x.prazo<=ate).forEach(x=>E.push({d:x.prazo,t:x.t,ic:'check',c:'#d97706',go:'tarefas'}));
  E.sort((x,y)=>x.d.localeCompare(y.d));if(!E.length)return '<p class="mut">Sem eventos nas próximas 6 semanas.</p>';
  return `<ul class="dcl">${E.slice(0,C.big?16:8).map(e=>{const dt=dataDeIso(e.d);return `<li style="--ac:${e.c}"><span class="dcd"><b>${dt.getDate()}</b><small>${dt.toLocaleDateString('pt-PT',{month:'short'}).replace('.','')}</small></span>${ic(e.ic,14)}<span class="dct"><b>${esc(e.t)}</b><small>${e.d===hj?'hoje':'daqui a '+diasEntre(hj,e.d)+' dia'+(diasEntre(hj,e.d)!==1?'s':'')}${e.h?' · '+e.h:''}</small></span>${e.go?`<button class="btn sm ico" type="button" data-dgo="${e.go}" aria-label="Abrir">${ic('chev',12)}</button>`:''}</li>`}).join('')}</ul>`};
DW.sumarios=C=>{const {TF,la,per,W}=C;const R=TF.map(t=>{const L=la(t).filter(x=>x.per===per);const dadas=L.filter(x=>x.licao).length;const prev=L.length;const sem=L.filter(x=>x.passada&&!x.falta&&x.s.estado!=='nao'&&!(x.s.texto||'').trim());return {t,dadas,prev,sem}}).filter(r=>r.prev);
  if(!R.length)return '<p class="mut">Sem horário ou calendário para contar as aulas.</p>';const td=R.reduce((s,r)=>s+r.dadas,0),tp=R.reduce((s,r)=>s+r.prev,0),ts=R.reduce((s,r)=>s+r.sem.length,0);
  return `<div class="dchs">${`<div class="dch" style="--ac:#2563eb"><b>${td}</b><span>tempos lecionados</span></div><div class="dch" style="--ac:#64748b"><b>${tp}</b><span>previstos no ${per}.º ${W.toLowerCase()}</span></div><div class="dch" style="--ac:${ts?'#dc2626':'#16a34a'}"><b>${ts}</b><span>sumários por escrever</span></div>`}</div>
    <ul class="dli">${R.map(r=>`<li><button type="button" data-dgo="sumarios:${r.t.id}"><b>${esc(r.t.nome)}</b><small>${esc(r.t.disciplina)} · ${r.dadas}/${r.prev} tempos</small><span class="dprog"><i style="width:${r.prev?r.dadas/r.prev*100:0}%"></i></span><em class="${r.sem.length?'bad':''}">${r.sem.length?r.sem.length+' em falta':'em dia'}</em></button></li>`).join('')}</ul>
    ${ts?`<button class="btn sm pri" type="button" data-dsum style="margin-top:8px">${ic('pen',13)} Escrever o Mais Antigo</button>`:''}`};
DW.dt=C=>{const {a}=C;if(!a)return '';let N=[];try{N=minhasDT(a)}catch(_){}if(!N.length)return '';const lim=S.cfg.limFaltas||10;
  return N.map(n=>{let AL=[];try{AL=alunosDaClasse(a,n)}catch(_){}const D=dtDados(a,n);const fx=AL.map(o=>({x:o.x,f:o.reg.reduce((s,r)=>s+(r.x.faltasAl||[]).filter(z=>z.tipo==='injust').reduce((q,z)=>q+(+z.tempos||1),0),0)}));const risco=fx.filter(o=>o.f>=lim*.8);const tot=fx.reduce((s,o)=>s+o.f,0);
    return `<div class="ddt"><div class="row" style="gap:8px"><b>${ic('crown',15)} ${esc(n)}</b><span class="mut">${AL.length} alunos</span><span class="sp1"></span><button class="btn sm" type="button" data-ddt="${esc(n)}">Abrir</button></div>
      <div class="dchs sm"><div class="dch" style="--ac:${risco.length?'#dc2626':'#16a34a'}"><b>${risco.length}</b><span>perto/acima de ${lim} faltas</span></div><div class="dch" style="--ac:#64748b"><b>${tot}</b><span>faltas injust.</span></div><div class="dch" style="--ac:#0f8b8d"><b>${(D.atend||[]).length}</b><span>atendimentos</span></div><div class="dch" style="--ac:#d97706"><b>${(D.ocorr||[]).length}</b><span>ocorrências</span></div><div class="dch" style="--ac:#7a4fd0"><b>${(D.planos||[]).filter(p=>p.estado!=='concluido').length}</b><span>planos ativos</span></div><div class="dch" style="--ac:#2563eb"><b>${(D.comun||[]).length}</b><span>comunicações</span></div></div>
      ${risco.length?`<p class="dnote bad">${ic('alert',13)} ${risco.slice(0,4).map(o=>esc(o.x.nome.split(' ')[0]+' '+(o.x.nome.split(' ').slice(-1)[0]))+' ('+o.f+')').join(' · ')}</p>`:''}</div>`}).join('')};
DW.profij=C=>{const {TF,hj}=C;const M=TF.filter(t=>ehModular(t));if(!M.length)return '';
  return M.map(t=>{const U=unidMod(t);const L=t.modulos||[];const al=alunosAval(t);const ht=L.reduce((s,m)=>s+(+m.horas||0),0);const conc=L.filter(m=>al.length&&al.every(x=>notaMod(t,x.id,m.id)!=null));const hc=conc.reduce((s,m)=>s+(+m.horas||0),0);
    let ap=0,nn=0;L.forEach(m=>al.forEach(x=>{const n=notaMod(t,x.id,m.id);if(n!=null){nn++;if(n>=10)ap++}}));const cur=L.find(m=>m.ini&&m.ini<=hj&&(!m.fim||m.fim>=hj));let mra=0;try{L.forEach(m=>al.forEach(x=>{const F=((t.mra||{})[m.id]||{})[x.id];const f=F?+F.faltas:mraFaltas(t,x,m);if(f&&mraCalc(F?F.horas:m.horas,f).ex)mra++}))}catch(_){}
    return `<div class="dpf"><div class="row" style="gap:8px"><span class="dbn">${anoBadge(t,'sm')}<b>${esc(t.nome)}</b><small>${esc(t.disciplina)}</small></span><span class="sp1"></span><button class="btn sm" type="button" data-dgo="modulos:${t.id}">${U.p}</button></div>
      <div class="dpfb"><span class="dprog lg"><i style="width:${L.length?conc.length/L.length*100:0}%"></i></span><span><b>${conc.length}/${L.length}</b> ${U.p.toLowerCase()} · <b>${hc}/${ht} h</b></span></div>
      <p class="mut dpfs">${nn?Math.round(ap/nn*100)+'% de aprovação':'sem classificações'}${cur?' · a decorrer: '+esc((cur.cod?cur.cod+' ':'')+cur.nome):''}${mra?` · <span class="bad">${mra} recuperação(ões) MRA</span>`:''}</p></div>`}).join('')};
DW.criterios=C=>{try{const h=widgetCriterios();if(!h)return '';const d=document.createElement('div');d.innerHTML=h;const c=d.firstElementChild;c.querySelectorAll('h2').forEach(x=>x.remove());return c.innerHTML}catch(e){return ''}};
DW.assiduidade=C=>{const {TF}=C;const X=[];TF.forEach(t=>alunosAval(t).forEach(x=>{const F=x.faltasAl||[];const inj=F.filter(f=>f.tipo==='injust').reduce((s,f)=>s+(+f.tempos||1),0),at=F.filter(f=>f.tipo==='atraso').length,mat=F.filter(f=>f.tipo==='material').length;if(inj||at||mat)X.push({x,t,inj,at,mat})}));
  if(!X.length)return '<div class="dok">'+ic('check',20)+'<b>Sem faltas registadas</b></div>';const lim=S.cfg.limFaltas||10;X.sort((p,q)=>q.inj-p.inj||q.at-p.at);
  return `<ul class="dli">${X.slice(0,C.big?10:5).map(o=>`<li><button type="button" data-dal="${o.t.id}|${o.x.id}"><b>${esc(o.x.nome)}</b><small>${esc(o.t.nome)}${o.at?' · '+o.at+' atraso'+(o.at>1?'s':''):''}${o.mat?' · '+o.mat+' sem material':''}</small><span class="dprog ${o.inj>=lim?'bad':''}"><i style="width:${Math.min(100,o.inj/lim*100)}%"></i></span><em class="${o.inj>=lim?'bad':''}">${o.inj}</em></button></li>`).join('')}</ul>`};
DW.aniversarios=C=>{const {TF}=C;const hj=new Date();const L=[];const vis=new Set();TF.forEach(t=>alunosAval(t).forEach(x=>{if(!x.nasc||vis.has(x.nome))return;const p=x.nasc.split('-');let d=new Date(hj.getFullYear(),+p[1]-1,+p[2]);if(d<new Date(hj.getFullYear(),hj.getMonth(),hj.getDate()))d.setFullYear(d.getFullYear()+1);const k=Math.round((d-new Date(hj.getFullYear(),hj.getMonth(),hj.getDate()))/864e5);if(k<=14){vis.add(x.nome);L.push({x,t,k,d,anos:d.getFullYear()-+p[0]})}}));
  L.sort((a,b)=>a.k-b.k);return L.length?`<ul class="dli">${L.slice(0,6).map(o=>`<li><div class="dlr"><b>${esc(o.x.nome.split(' ')[0]+' '+o.x.nome.split(' ').slice(-1)[0])}</b><small>${esc(o.t.nome)} · faz ${o.anos} anos</small><em class="${o.k===0?'ok':''}">${o.k===0?'hoje 🎂':o.k===1?'amanhã':o.d.toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}</em></div></li>`).join('')}</ul>`:'<p class="mut">Sem aniversários nos próximos 14 dias.</p>'};
DW.tarefas=C=>{const hj=C.hj;const P=tarefas().filter(x=>!x.feito);const atr=P.filter(x=>x.prazo&&x.prazo<hj),hoj=P.filter(x=>x.prazo===hj);const L=[...atr,...hoj,...P.filter(x=>!atr.includes(x)&&!hoj.includes(x)).sort((a,b)=>(a.prazo||'9').localeCompare(b.prazo||'9'))].slice(0,6);
  return `<div class="dchs sm"><div class="dch" style="--ac:#64748b"><b>${P.length}</b><span>por fazer</span></div><div class="dch" style="--ac:#dc2626"><b>${atr.length}</b><span>atrasadas</span></div><div class="dch" style="--ac:#d97706"><b>${hoj.length}</b><span>hoje</span></div></div>
    ${L.length?`<ul class="dtk">${L.map(x=>`<li><label class="chk"><input type="checkbox" data-dtk="${x.id}"> <span><b>${esc(x.t)}</b>${x.prazo?`<small class="${x.prazo<hj?'bad':''}">${fmtIso(x.prazo)}</small>`:''}</span></label></li>`).join('')}</ul>`:''}`};
DW.atividade=C=>{const L=(S.audit||[]).slice(0,C.big?10:6);return L.length?`<ul class="dli">${L.map(e=>`<li><div class="dlr"><b>${esc(e.acao)}</b><small>${esc(e.area)}${e.det?' · '+esc(String(e.det).slice(0,60)):''}</small><em>${new Date(e.q).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</em></div></li>`).join('')}</ul>`:'<p class="mut">Sem atividade registada.</p>'};
DW.seguranca=C=>{const c=S.cfg;const dd=c.ultimaCopia?Math.floor((Date.now()-c.ultimaCopia)/864e5):null;let L={};try{L=nvL()}catch(_){}
  const lin=(ok,t,s)=>`<li><span class="dsg ${ok?'ok':'bad'}">${ic(ok?'check':'alert',13)}</span><span><b>${t}</b><small>${s}</small></span></li>`;
  return `<ul class="dsgl">${lin(dd!=null&&dd<14,'Cópia de segurança',dd==null?'nunca exportada':'há '+dd+' dia'+(dd!==1?'s':''))}${lin(!!(L.prov&&L.k),'Sincronização na nuvem',L.prov&&L.k?(PROV[L.prov]||{}).n+' · '+(L.ultimo?new Date(L.ultimo).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'—'):'desligada')}${lin(bloqOn(),'Bloqueio dos dados de base',bloqOn()?'ativo':'desligado')}${lin(!!c.pinHash,'Código de acesso',c.pinHash?'definido':'sem código')}</ul><button class="btn sm" type="button" data-dgo="definicoes:dados" style="margin-top:8px">${ic('shield',13)} Dados e Segurança</button>`};
/* ---------- barra: modo, filtros, pesquisa, ações rápidas ---------- */
function dashFiltros(C){const a=C.a;const d=dashM();const f=d.f;const T0=a?turmasFiltradas(a):[];const discs=[...new Set(T0.map(t=>t.disciplina))].sort((x,y)=>x.localeCompare(y,'pt'));const turmas=[...new Set(T0.map(t=>t.nome))].sort((x,y)=>x.localeCompare(y,'pt',{numeric:true}));const ofs=[...new Set(T0.map(ofertaDe))];
  const sel=(id,l,ops,v)=>`<label class="dfl"><span>${l}</span><select id="${id}">${ops.map(([k,n])=>`<option value="${esc(k)}" ${String(v||'')===String(k)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
  return `<div class="dfs">${sel('df-ano','Ano letivo',S.anos.slice().sort((x,y)=>y.nome.localeCompare(x.nome)).map(x=>[x.id,x.nome]),S.anoAtivo)}${sel('df-per',perW(),[['','Atual ('+C.perAt+'.º)'],...periodos().map(p=>[p,p+'.º '+perW()])],f.per)}
    ${sel('df-tur','Turma',[['','Todas'],...turmas.map(n=>[n,n])],f.turma)}${sel('df-dis','Disciplina',[['','Todas'],...discs.map(n=>[n,n])],f.disc)}${ofs.length>1||f.oferta?sel('df-of','Modalidade',[['','Todas'],...ofs.map(o=>[o,(OFERTAS[o]||{nome:o==='profissional'?'Ensino Profissional':o}).nome])],f.oferta):''}
    ${f.per||f.turma||f.disc||f.oferta?`<button class="btn sm" type="button" id="df-lim">${ic('x',12)} Limpar</button>`:''}</div>`}
function dashItensPesquisa(){const a=A();const it=[];(a?a.turmas:[]).forEach(t=>{it.push({t:t.nome+' · '+t.disciplina,s:'Turma',ic:'users',f:()=>{S.turmaAtiva=t.id;save();go('alunos')}});
  t.alunos.forEach(al=>it.push({t:al.nome,s:'Aluno · '+t.nome+' · n.º '+(al.num||''),ic:'user',f:()=>{S.turmaAtiva=t.id;save();go('alunos');setTimeout(()=>{try{fichaAluno(al.id)}catch(_){}},80)}}));
  t.instrumentos.forEach(i=>it.push({t:i.nome,s:(ehTeste(i)?'Teste':'Instrumento')+' · '+t.nome+(i.data?' · '+fmtIso(i.data):''),ic:'clipboard',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;UI.instTab='notas';save();go('instrumentos')}}))});
  if(a)reunioes(a).forEach(r=>it.push({t:reunTitulo(r,a),s:'Reunião · '+fmtIso(r.data),ic:'meet',f:()=>{try{reuniaoVer(r.id)}catch(_){go('reunioes')}}}));
  (S.docsArq||[]).forEach(d=>it.push({t:d.titulo||d.modelo||'Documento',s:'Documento'+(d.numero?' · '+d.numero:''),ic:'file',f:()=>go('documentos')}));
  (S.biblioteca||[]).forEach(r=>it.push({t:r.titulo,s:'Biblioteca'+(r.disciplina?' · '+r.disciplina:''),ic:'book',f:()=>go('recursos')}));
  tarefas().forEach(x=>it.push({t:x.t,s:'Tarefa'+(x.prazo?' · '+fmtIso(x.prazo):'')+(x.feito?' · feita':''),ic:'check',f:()=>go('tarefas')}));return it}
function dashTopo(C){const d=dashM();
  return `<div class="dtop"><div class="dseg" role="radiogroup" aria-label="Versão do início"><button type="button" role="radio" aria-checked="${d.modo==='simples'}" data-dmodo="simples" class="${d.modo==='simples'?'on':''}">${ic('list',14)} Simples</button><button type="button" role="radio" aria-checked="${d.modo==='geral'}" data-dmodo="geral" class="${d.modo==='geral'?'on':''}">${ic('chart',14)} Geral</button></div>
    ${d.modo!=='geral'?`<span class="mut dhint">${ic('layers',13)} Arraste os cartões pelo título ou pela pega ${ic('grip',12)} (no iPad: toque longo no cartão) para qualquer área · puxe o canto para mudar a largura</span>${S.cfg.iniPos?`<button class="btn sm" type="button" id="ini-rep">${ic('refresh',13)} Repor Disposição</button>`:''}`:''}${d.modo==='geral'?`<div class="dsrch" role="search"><span class="dsi">${ic('search',16)}</span><input id="dq" type="search" placeholder="Pesquisar aluno, turma, teste, reunião, documento…" autocomplete="off" aria-label="Pesquisa universal"><div id="dqr" class="dqr" role="listbox" hidden></div></div>
    <div class="dqa" role="group" aria-label="Ações rápidas"><button class="btn sm" type="button" data-dqa="teste">${ic('clipboard',14)} Criar Teste</button><button class="btn sm" type="button" data-dqa="sumario">${ic('pen',14)} Registar Sumário</button><button class="btn sm" type="button" data-dqa="reuniao">${ic('meet',14)} Agendar Reunião</button><button class="btn sm" type="button" data-dqa="tarefa">${ic('plus',14)} Tarefa</button><button class="btn sm ico" type="button" id="dpers" title="Personalizar o painel" aria-label="Personalizar o painel">${ic('sliders',15)}</button></div>`:''}</div>
    ${d.modo==='geral'?dashFiltros(C):''}`}
/* ---------- montagem ---------- */
function dashRender(){const v=$('#view');if(!v)return;const d=dashM();const C=dashCtx();
  const hero=v.querySelector('.in-hero');const top=document.createElement('div');top.className='dashtop';top.innerHTML=dashTopo(C);
  if(d.modo!=='geral'){const il=v.querySelector(':scope>.inlay');if(il)il.before(top);else v.prepend(top);top.classList.add('dtsimples');dashBindTopo(top);return}
  const grid=document.createElement('div');grid.className='dgrid lay-'+d.layout;const cartoes={};
  dashOrdem().forEach(id=>{const w=DASH_W.find(x=>x[0]===id);const cf=dashCfgW(id);if(!cf.on||!DW[id])return;let h='';const C2={...C,big:cf.tam==='l'||cf.tam==='xl'};try{h=DW[id](C2)}catch(e){console.warn('dash',id,e);h='<p class="mut">Não foi possível calcular.</p>'}if(!h)return;
    const el=document.createElement('section');el.className='card dw t-'+cf.tam;el.dataset.dw=id;el.setAttribute('aria-labelledby','dwh-'+id);
    el.innerHTML=`<header class="dwh"><span class="dwi">${ic(w[3],16)}</span><h2 id="dwh-${id}" data-dec="1">${esc(w[1])}</h2><span class="sp1"></span><button type="button" class="btn sm ico dwtam" data-dwtam="${id}" title="Mudar tamanho (${DASH_TAM[cf.tam]})" aria-label="Mudar tamanho de ${esc(w[1])}">${ic('sliders',13)}</button></header><div class="dwb">${h}</div>`;cartoes[id]=el});
  if(d.agrupar!==false&&d.layout!=='lista'){const O=dashOrdem();DASH_G.forEach(([gk,gn,ids])=>{const L=O.filter(id=>dashGrupo(id)===gk&&cartoes[id]);if(!L.length)return;const sec=document.createElement('div');sec.className='dgsec';sec.dataset.dg=gk;sec.innerHTML=`<h3 class="dgh">${esc(gn)}</h3>`;const g2=document.createElement('div');g2.className='dgrid lay-'+d.layout;L.forEach(id=>g2.appendChild(cartoes[id]));sec.appendChild(g2);grid.appendChild(sec)});grid.className='dgrps'}
  else dashOrdem().forEach(id=>{if(cartoes[id])grid.appendChild(cartoes[id])});
  const keep=hero;v.innerHTML='';v.appendChild(top);if(keep)v.appendChild(keep);v.appendChild(grid);
  dashBindTopo(top);dashBind(grid,C)}
function dashBindTopo(top){{const rp=top.querySelector('#ini-rep');if(rp)rp.onclick=()=>{delete S.cfg.iniPos;save();go('inicio')}}top.querySelectorAll('[data-dmodo]').forEach(b=>b.onclick=()=>{dashM().modo=b.dataset.dmodo;save();go('inicio')});
  const fs=[['df-per','per'],['df-tur','turma'],['df-dis','disc'],['df-of','oferta']];fs.forEach(([id,k])=>{const e=top.querySelector('#'+id);if(e)e.onchange=()=>{dashM().f[k]=e.value;save();manterPosicao(()=>go('inicio'))}});
  const an=top.querySelector('#df-ano');if(an)an.onchange=()=>{S.anoAtivo=an.value;const TF=turmasFiltradas(A());S.turmaAtiva=TF[0]?TF[0].id:null;dashM().f={};save();go('inicio')};
  const lim=top.querySelector('#df-lim');if(lim)lim.onclick=()=>{dashM().f={};save();go('inicio')};
  const q=top.querySelector('#dq'),r=top.querySelector('#dqr');if(q){let L=[],sel=0,I=null;const des=()=>{const n=normT(q.value);if(!n){r.hidden=true;return}I=I||dashItensPesquisa();L=I.filter(x=>normT(x.t+' '+x.s).includes(n)).slice(0,12);sel=Math.min(sel,Math.max(0,L.length-1));r.hidden=false;
      r.innerHTML=L.length?L.map((x,k)=>`<button type="button" role="option" aria-selected="${k===sel}" class="pqi ${k===sel?'on':''}" data-qk="${k}">${ic(x.ic,16)}<span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span></button>`).join(''):'<p class="mut" style="margin:8px 12px">Sem resultados.</p>';r.querySelectorAll('[data-qk]').forEach(b=>b.onmousedown=e=>{e.preventDefault();L[+b.dataset.qk].f()})};
    q.oninput=()=>{sel=0;des()};q.onfocus=des;q.onblur=()=>setTimeout(()=>{r.hidden=true},150);q.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(L.length-1,sel+1);des();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);des();e.preventDefault()}else if(e.key==='Enter'&&L[sel]){L[sel].f()}else if(e.key==='Escape'){q.value='';r.hidden=true}}}
  top.querySelectorAll('[data-dqa]').forEach(b=>b.onclick=()=>dashAcao(b.dataset.dqa));const p=top.querySelector('#dpers');if(p)p.onclick=dashPersonalizar}
function dashIr(s){const [v,arg]=String(s).split(':');if(v==='definicoes'&&arg){UI.defTab=arg;go('definicoes');return}if(arg){const a=A();if(a&&a.turmas.some(t=>t.id===arg)){S.turmaAtiva=arg;save()}}go(v)}
function dashBind(g,C){g.querySelectorAll('[data-dgo]').forEach(b=>b.onclick=()=>dashIr(b.dataset.dgo));
  g.querySelectorAll('[data-dtt]').forEach(b=>{const f=()=>{S.turmaAtiva=b.dataset.dtt;save();go(b.tagName==='TR'?'alunos':'sumarios')};b.onclick=f;b.onkeydown=e=>{if(e.key==='Enter')f()}});
  g.querySelectorAll('[data-dreun]').forEach(b=>b.onclick=()=>{try{reuniaoVer(b.dataset.dreun)}catch(_){go('reunioes')}});
  g.querySelectorAll('[data-dinst]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.dinst.split('|');S.turmaAtiva=tid;UI.inst=iid;UI.instTab='notas';save();go('instrumentos')});
  g.querySelectorAll('[data-dal]').forEach(b=>b.onclick=()=>{const [tid,aid]=b.dataset.dal.split('|');S.turmaAtiva=tid;save();go('alunos');setTimeout(()=>{try{fichaAluno(aid,'assid')}catch(_){}},80)});
  g.querySelectorAll('[data-ddt]').forEach(b=>b.onclick=()=>{UI.dtSel=b.dataset.ddt;go('direcao')});
  g.querySelectorAll('[data-dtk]').forEach(c=>c.onchange=()=>{const x=tarefas().find(z=>z.id===c.dataset.dtk);if(x){x.feito=c.checked;x.feitaEm=Date.now();save();toast('Tarefa concluída','ok');manterPosicao(()=>go('inicio'))}});
  const ds=g.querySelector('[data-dsum]');if(ds)ds.onclick=()=>dashAcao('sumario');
  g.querySelectorAll('[data-dwtam]').forEach(b=>b.onclick=()=>{const id=b.dataset.dwtam;const d=dashM();const o=['s','m','l','xl'];const cur=dashCfgW(id).tam;d.w[id]={...dashCfgW(id),tam:o[(o.indexOf(cur)+1)%o.length]};save();manterPosicao(()=>go('inicio'))});
  g.querySelectorAll('[data-dw="criterios"] [data-estp]').forEach(b=>b.onclick=()=>{UI.estC={...(UI.estC||{}),p:+b.dataset.estp};manterPosicao(()=>go('inicio'))});g.querySelectorAll('[data-dw="criterios"] [data-estt]').forEach(b=>b.onclick=()=>{UI.estC={t:b.dataset.estt};manterPosicao(()=>go('inicio'))});g.querySelectorAll('[data-dw="criterios"] [data-estgo]').forEach(b=>b.onclick=()=>{const tt=(UI.estC||{}).t;if(tt){S.turmaAtiva=tt;save()}go(b.dataset.estgo)});
  /* arrastar: reordenar, mudar de secção, largar num espaço vazio */
  const tipo=e=>[...e.dataTransfer.types].includes('text/x-dw');
  const mover=(de,alvo,grupo,depois)=>{const d=dashM();const O=dashOrdem().filter(x=>x!==de);if(alvo){O.splice(O.indexOf(alvo)+(depois?1:0),0,de)}else{const L=O.filter(x=>dashGrupo(x)===grupo);const ult=L[L.length-1];O.splice(ult?O.indexOf(ult)+1:O.length,0,de)}d.ordem=O;if(grupo)d.w[de]={...dashCfgW(de),g:grupo};save();manterPosicao(()=>go('inicio'))};
  g.querySelectorAll('.dw').forEach(el=>{const h=el.querySelector('.dwh');h.draggable=true;h.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/x-dw',el.dataset.dw);e.dataTransfer.effectAllowed='move';el.classList.add('drag');g.classList.add('arrastando')});h.addEventListener('dragend',()=>{el.classList.remove('drag');g.classList.remove('arrastando');g.querySelectorAll('.over').forEach(x=>x.classList.remove('over'))});
    el.addEventListener('dragover',e=>{if(tipo(e)){e.preventDefault();e.stopPropagation();el.classList.add('over')}});el.addEventListener('dragleave',()=>el.classList.remove('over'));
    el.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();el.classList.remove('over');const de=e.dataTransfer.getData('text/x-dw');if(!de||de===el.dataset.dw)return;const sec=el.closest('.dgsec');const r=el.getBoundingClientRect();mover(de,el.dataset.dw,sec?sec.dataset.dg:null,e.clientX>r.left+r.width/2)})});
  {const vw=$('#view');g.addEventListener('dragover',e=>{if(!vw)return;const r=vw.getBoundingClientRect();if(e.clientY<r.top+80)vw.scrollTop-=18;else if(e.clientY>r.bottom-80)vw.scrollTop+=18})}
  g.querySelectorAll('.dgsec').forEach(sec=>{const gr=sec.querySelector('.dgrid');sec.addEventListener('dragover',e=>{if(tipo(e)){e.preventDefault();sec.classList.add('over')}});sec.addEventListener('dragleave',e=>{if(!sec.contains(e.relatedTarget))sec.classList.remove('over')});
    sec.addEventListener('drop',e=>{e.preventDefault();sec.classList.remove('over');const de=e.dataTransfer.getData('text/x-dw');if(!de)return;
      /* largar ao lado de um cartão: fica antes do cartão seguinte na mesma linha */
      const cards=[...gr.querySelectorAll(':scope>.dw')].filter(c=>c.dataset.dw!==de);let alvo=null;for(const c of cards){const r=c.getBoundingClientRect();if(e.clientY<r.top||(e.clientY<=r.bottom&&e.clientX<r.left)){alvo=c.dataset.dw;break}}mover(de,alvo,sec.dataset.dg)})});
  dashAjustar(g);dashObs(g)}
/* ajuste automático: os cartões de cada linha crescem até ocupar as 12 colunas */
const DASH_SPAN={s:4,m:6,l:8,xl:12};
function dashAjustar(root){const d=dashM();root.querySelectorAll('.dgrid').forEach(gr=>{const C=[...gr.querySelectorAll(':scope>.dw')];C.forEach(c=>c.style.gridColumn='');
  if(d.autofit===false||gr.classList.contains('lay-colunas')||gr.classList.contains('lay-lista')||gr.clientWidth<900)return;
  let row=[],soma=0;const fecha=()=>{if(!row.length)return;const sobra=12-soma;if(sobra>0){const n=row.length;row.forEach((o,k)=>{o.sp+=Math.floor(sobra/n)+(k<sobra%n?1:0)})}row.forEach(o=>o.c.style.gridColumn='span '+o.sp);row=[];soma=0};
  C.forEach(c=>{const t=(c.className.match(/\bt-(s|m|l|xl)\b/)||[])[1]||'m';const sp=DASH_SPAN[t];if(soma+sp>12)fecha();row.push({c,sp});soma+=sp;if(soma>=12)fecha()});fecha()})}
function dashObs(root){if(!window.ResizeObserver)return;if(dashObs._o)dashObs._o.disconnect();let w=0;const o=new ResizeObserver(en=>{const nw=Math.round(en[0].contentRect.width);if(Math.abs(nw-w)>20){w=nw;dashAjustar(root)}});o.observe(root);dashObs._o=o}
const dashGrupo=id=>{const g=(dashM().w[id]||{}).g;if(g&&DASH_G.some(x=>x[0]===g))return g;const f=DASH_G.find(x=>x[2].includes(id));return f?f[0]:'gestao'};
function dashAcao(k){const a=A();if(!a)return toast('Crie primeiro o ano letivo e as turmas','aviso');const C=dashCtx();const t=C.TF.find(x=>x.id===S.turmaAtiva)||C.TF[0];
  if(k==='teste'){if(!t)return toast('Sem turmas','aviso');if(!a.calendario){toast('Importe primeiro o calendário escolar','aviso');return go('calendario')}S.turmaAtiva=t.id;save();go('testes');setTimeout(()=>{try{marcarDlg(T(),null)}catch(e){console.warn(e)}},60);return}
  if(k==='sumario'){let best=null;C.TF.forEach(tt=>{C.la(tt).forEach(x=>{if(x.passada&&!x.falta&&x.s.estado!=='nao'&&!(x.s.texto||'').trim()&&(!best||x.data<best.x.data))best={t:tt,x}})});
    if(!best){C.TF.forEach(tt=>{const L=C.la(tt).filter(x=>x.passada);const x=L[L.length-1];if(x&&(!best||x.data>best.x.data))best={t:tt,x}})}
    if(!best)return go('sumarios');S.turmaAtiva=best.t.id;save();go('sumarios');setTimeout(()=>{try{aulaDlg(best.t,best.x.k,'sum')}catch(e){console.warn(e)}},80);return}
  if(k==='reuniao'){try{reuniaoDlg(null)}catch(e){go('reunioes')}return}
  if(k==='tarefa'){const d=document.createElement('dialog');d.className='amodal';d.setAttribute('aria-labelledby','dtq-t');
    d.innerHTML=`<div class="amh">${ic('check',22)}<h2 id="dtq-t">Nova Tarefa</h2></div><label for="dtq-n">Tarefa</label><input id="dtq-n" placeholder="ex.: Corrigir o teste do 10.º A"><div class="g2" style="margin-top:8px"><div><label for="dtq-p">Prazo</label><input type="date" id="dtq-p"></div><div><label for="dtq-pr">Prioridade</label><select id="dtq-pr"><option value="normal">Normal</option><option value="alta">Alta</option><option value="baixa">Baixa</option></select></div></div>
      <div class="row amb"><button type="button" class="btn" data-dtq="0">Cancelar</button><button type="button" class="btn pri" data-dtq="1">${ic('plus',14)} Acrescentar</button></div>`;
    document.body.appendChild(d);const fim=()=>{try{d.close()}catch(_){}d.remove()};d.addEventListener('cancel',e=>{e.preventDefault();fim()});d.querySelector('[data-dtq="0"]').onclick=fim;
    const ok=()=>{const n=d.querySelector('#dtq-n').value.trim();if(!n)return d.querySelector('#dtq-n').focus();tarefas().push({id:uid(),t:n,prazo:d.querySelector('#dtq-p').value,prio:d.querySelector('#dtq-pr').value,feito:false,criada:Date.now()});save();fim();toast('Tarefa acrescentada','ok');manterPosicao(()=>go('inicio'))};
    d.querySelector('[data-dtq="1"]').onclick=ok;d.querySelector('#dtq-n').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#dtq-n').focus(),50)}}
function dashPersonalizar(){const d=dashM();const O=dashOrdem();
  const html=()=>`<div class="ed"><label>Disposição</label><div class="dlays" role="radiogroup" aria-label="Disposição">${[['grade','Grelha','Cartões lado a lado, com tamanhos'],['colunas','Colunas','Empilhados em colunas, sem espaços'],['lista','Lista','Um cartão por linha']].map(([k,n,s])=>`<button type="button" role="radio" aria-checked="${d.layout===k}" class="nvp ${d.layout===k?'on':''}" data-dlay="${k}"><b>${n}</b><span>${s}</span></button>`).join('')}</div>
    <label class="chk" style="margin-top:12px"><input type="checkbox" id="dp-agr" ${d.agrupar!==false?'checked':''}> Agrupar por secções (Hoje, Avaliação, Turmas, Agenda)</label><label class="chk"><input type="checkbox" id="dp-auto" ${d.autofit!==false?'checked':''}> Ajustar tamanhos automaticamente (preencher os espaços vazios de cada linha)</label><label style="margin-top:14px">Cartões <span class="mut">(arraste no painel pelo título, ou use as setas)</span></label><ul class="dpl">${O.map((id,i)=>{const w=DASH_W.find(x=>x[0]===id);const c=dashCfgW(id);return `<li><label class="chk"><input type="checkbox" data-dpon="${id}" ${c.on?'checked':''}> <span><b>${esc(w[1])}</b><small>${esc(w[2])} · prioridade ${w[5].toLowerCase()}</small></span></label><select data-dptam="${id}" aria-label="Tamanho de ${esc(w[1])}">${Object.entries(DASH_TAM).map(([k,n])=>`<option value="${k}" ${c.tam===k?'selected':''}>${n}</option>`).join('')}</select><button type="button" class="btn sm ico" data-dpup="${i}" ${i?'':'disabled'} aria-label="Subir">${ic('chev',12)}</button></li>`}).join('')}</ul>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn" type="button" id="dp-rep">Repor</button><span class="sp1"></span><button class="btn pri" type="button" id="dp-ok">${ic('check',14)} Concluir</button></div></div>`;
  openDrawer('Personalizar o Painel',html());const bind=()=>{const b=$('#dw-b');
    b.querySelectorAll('[data-dlay]').forEach(x=>x.onclick=()=>{d.layout=x.dataset.dlay;save();re()});b.querySelectorAll('[data-dpon]').forEach(x=>x.onchange=()=>{d.w[x.dataset.dpon]={...dashCfgW(x.dataset.dpon),on:x.checked};save()});
    b.querySelectorAll('[data-dptam]').forEach(x=>x.onchange=()=>{d.w[x.dataset.dptam]={...dashCfgW(x.dataset.dptam),tam:x.value};save()});
    b.querySelectorAll('[data-dpup]').forEach(x=>x.onclick=()=>{const i=+x.dataset.dpup;const L=dashOrdem();[L[i-1],L[i]]=[L[i],L[i-1]];d.ordem=L;save();re()});
    $('#dp-rep').onclick=()=>{d.w={};d.ordem=[];d.layout='grade';d.agrupar=true;save();re()};{const ag=$('#dp-agr');if(ag)ag.onchange=()=>{d.agrupar=ag.checked;save()}};{const au=$('#dp-auto');if(au)au.onchange=()=>{d.autofit=au.checked;save()}};$('#dp-ok').onclick=()=>{closeDrawer();go('inicio')}};
  const re=()=>{$('#dw-b').innerHTML=html();bind()};bind()}
{const _vIn=vInicio;vInicio=function(){const r=_vIn.apply(this,arguments);try{dashRender()}catch(e){console.error(e)}return r};if(go._f)go._f.inicio=vInicio}
{const _gD=go;go=function(v){const r=_gD.apply(this,arguments);if(go._f&&go._f.inicio!==vInicio)go._f.inicio=vInicio;return r}}
function diasEntre(a,b){return Math.round((dataDeIso(b)-dataDeIso(a))/864e5)}

if(!ICONS.eye)ICONS.eye='<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';

