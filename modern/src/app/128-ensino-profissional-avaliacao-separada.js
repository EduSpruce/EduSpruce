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


