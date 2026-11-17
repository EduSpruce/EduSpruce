/* ===================== v0.37 — bloqueio dos dados de base ===================== */
ICONS.cadeado='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>';
ICONS.cadeadoAb='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>';
ICONS.globo='<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>';
const BLOQ_CAT=[
  ['turmas','Ano letivo e turmas','Criar, apagar ou mudar o nome, disciplina, código, curso ou oferta das turmas e dos anos letivos'],
  ['alunos','Alunos (identificação)','Acrescentar ou retirar alunos; mudar nome, número, processo, género, data de nascimento'],
  ['criterios','Critérios de avaliação','Domínios, pesos, menções e regra de arredondamento'],
  ['horario','Horários','O meu horário, horários das turmas e tempos não letivos'],
  ['calendario','Calendário escolar','Períodos/semestres, interrupções e feriados']];
const bloqM=()=>{const b=S.cfg.bloq=S.cfg.bloq||{};b.cat=b.cat||{turmas:true,alunos:true,criterios:true,horario:true,calendario:true};return b};
const bloqOn=()=>!!(S.cfg.bloq&&S.cfg.bloq.on);
const _pk=(o,ks)=>{const r={};ks.forEach(k=>{if(o[k]!==undefined)r[k]=o[k]});return r};
function bloqSig(st,c){const A_=st.anos||[];const pe=a=>a.porEscola||{};
  if(c==='turmas')return JSON.stringify(A_.map(a=>[a.id,a.nome,(a.turmas||[]).map(t=>_pk(t,['id','nome','anoEsc','ciclo','oferta','disciplina','codigo','curso','cnq','escola']))]));
  if(c==='alunos')return JSON.stringify(A_.map(a=>(a.turmas||[]).map(t=>[t.id,(t.alunos||[]).map(x=>_pk(x,['id','num','nome','processo','genero','nasc','numInterno']))])));
  if(c==='criterios')return JSON.stringify(A_.map(a=>(a.turmas||[]).map(t=>[t.id,t.dominios,t.mencoes,t.regra])));
  if(c==='horario')return JSON.stringify(A_.map(a=>[a.horarios,a.horProf,a.naoLetivos,Object.entries(pe(a)).map(([e,v])=>[e,v&&v.horarios,v&&v.horProf,v&&v.naoLetivos])]));
  if(c==='calendario')return JSON.stringify(A_.map(a=>[a.calendario,Object.entries(pe(a)).map(([e,v])=>[e,v&&v.calendario])]));return ''}
const bloqSigs=st=>{const o={};BLOQ_CAT.forEach(([c])=>o[c]=bloqSig(st,c));return o};
let _bloqRef=null,_bloqLivre=0,_bloqAviso=false;
const bloqRefAtual=()=>{try{_bloqRef=bloqSigs(_ultimoJ?JSON.parse(_ultimoJ):S)}catch(_){_bloqRef=bloqSigs(S)}};
function bloqViolacoes(){if(!bloqOn()||_bloqLivre)return [];if(!_bloqRef)bloqRefAtual();const cat=bloqM().cat;return BLOQ_CAT.filter(([c])=>cat[c]&&bloqSig(S,c)!==_bloqRef[c])}
{const _svB=saveNow;saveNow=function(){const v=bloqViolacoes();
  if(v.length&&_ultimoJ){/* repõe o último estado guardado e explica */const ctx={};['anoAtivo','turmaAtiva','escolaAtiva','filtroOferta'].forEach(k=>ctx[k]=S[k]);
    try{S=JSON.parse(_ultimoJ);Object.assign(S,ctx)}catch(e){return _svB.apply(this,arguments)}
    clearTimeout(saveT);try{if($('#drawer.on'))closeDrawer()}catch(_){}try{manterPosicao(()=>go(VIEW))}catch(_){go(VIEW)}
    if(!_bloqAviso){_bloqAviso=true;avisoModal('Dados Bloqueados',[...v.map(([,n])=>n+' está bloqueado.'),'A alteração foi desfeita para proteger a informação de base.','Para alterar, desbloqueie em Definições › Segurança (com o seu código, se tiver um) e volte a bloquear no fim.'],[{t:'Ok',v:0},{t:ic('gear',15)+' Abrir Definições',v:1,c:'pri'}]).then(r=>{_bloqAviso=false;if(r===1)bloqIrDef()})}
    return}
  const r=_svB.apply(this,arguments);if(bloqOn())_bloqRef=bloqSigs(S);return r}}
async function bloqAlternar(ligar){const b=bloqM();
  if(ligar){b.on=true;b.desde=Date.now();_bloqLivre++;save();saveNow();_bloqLivre--;_bloqRef=bloqSigs(S);try{audit('Segurança','Dados de base bloqueados','')}catch(_){}bloqFlash();bloqUI();return true}
  if(S.cfg.pinHash){const v=await pinDialog({t:'Desbloquear Dados',s:'Escreva o seu código para poder alterar turmas, alunos, critérios, horários e calendário.',verifica:async x=>await pinOk(x),erro:'Código errado'});if(v==null)return false}
  else{const r=await avisoModal('Desbloquear Dados de Base?',['Volta a ser possível alterar ou apagar turmas, alunos, critérios, horários e calendário.','Lembre-se de voltar a bloquear quando terminar.','Dica: defina um código em Definições › Segurança para que só você possa desbloquear.'],[{t:'Cancelar',v:0},{t:ic('cadeadoAb',15)+' Desbloquear',v:1,c:'pri'}]);if(r!==1)return false}
  b.on=false;_bloqLivre++;save();saveNow();_bloqLivre--;try{audit('Segurança','Dados de base desbloqueados','')}catch(_){}toast('Desbloqueado — pode fazer alterações','aviso');bloqUI();return true}
/* v0.942 · o aviso «Bloqueado» aparece 1 segundo ao bloquear e depois não fica no ecrã; só volta (em janela) se se tentar alterar algo bloqueado */
function bloqFlash(){$$('.bloqflash').forEach(x=>x.remove());const d=document.createElement('div');d.className='bloqflash';d.setAttribute('role','status');d.innerHTML=ic('cadeado',20)+'<b>Dados bloqueados</b>';document.body.appendChild(d);setTimeout(()=>{d.classList.add('sai');setTimeout(()=>d.remove(),220)},1000)}
function bloqModal(oQue){if(_bloqAviso)return;_bloqAviso=true;avisoModal('Dados Bloqueados',[(oQue||'Esta informação')+' está bloqueado(a) e não pode ser alterado(a).','Para alterar, desbloqueie em Definições › Segurança (com o seu código, se tiver um) e volte a bloquear no fim.'],[{t:'Ok',v:0},{t:ic('cadeadoAb',15)+' Desbloquear Agora',v:1,c:'pri'}]).then(r=>{_bloqAviso=false;if(r===1)bloqAlternar(false)})}
document.addEventListener('click',e=>{const v=e.target.closest&&e.target.closest('#view.horbloq');if(!v)return;const a=e.target.closest('.aula,.hcel,[data-hslot],td[data-d]');if(!a||e.target.closest('a,button:not(.aula)'))return;e.preventDefault();e.stopPropagation();bloqModal('O horário')},true);
try{const st=document.createElement('style');st.textContent='html body .hbtag,html body #view .bloqban:not(.sug){display:none!important}.bloqflash{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100000;display:flex;align-items:center;gap:10px;padding:14px 22px;border-radius:14px;background:rgba(17,24,39,.92);color:#fff;font-size:16px;box-shadow:0 20px 50px rgba(0,0,0,.35);pointer-events:none;transition:opacity .2s}.bloqflash.sai{opacity:0}';document.head.appendChild(st)}catch(_){}
/* botão na barra lateral + faixa nas vistas protegidas */
const BLOQ_VISTAS={turmas:'turmas',alunos:'alunos',criterios:'criterios',meuhorario:'horario',horario:'horario',calendario:'calendario'};
/* alunos bloqueados: os campos de identificação passam a texto simples (sem caixa, sem cursor), com a mesma posição do texto */
const BLOQ_AL_K=['num','processo','nome','genero','nasc'];
function bloqAlRO(){const on=document.body.classList.contains('bloq-alunos');document.querySelectorAll('table.alst :is(input,textarea,select)[data-k]').forEach(e=>{if(!BLOQ_AL_K.includes(e.dataset.k))return;
  if(on){if(!e.dataset.ro){e.dataset.ro='1';if(e.tagName==='SELECT')e.disabled=true;else e.readOnly=true;e.tabIndex=-1}}else if(e.dataset.ro){delete e.dataset.ro;if(e.tagName==='SELECT')e.disabled=false;else e.readOnly=false;e.removeAttribute('tabindex')}})}
try{new MutationObserver(()=>{if(document.body.classList.contains('bloq-alunos')||document.querySelector('table.alst [data-ro]'))bloqAlRO()}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true})}catch(_){}
try{const st=document.createElement('style');st.textContent=`html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) :is(input,textarea,select)[data-ro]{border-color:transparent!important;background:transparent!important;box-shadow:none!important;outline:none!important;-webkit-appearance:none;appearance:none;cursor:default;color:var(--ink)!important;opacity:1!important;-webkit-text-fill-color:var(--ink)}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro]::-webkit-calendar-picker-indicator{display:none}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro]:not([value]),html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) input[type=date][data-ro][value=""]{color:transparent!important;-webkit-text-fill-color:transparent}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) select[data-ro]{background-image:none!important}
html body.bloq-alunos.bloq-alunos.bloq-alunos #main #view table.alst:not(#_q1):not(#_q2):not(#_q3) [data-rm],body.bloq-alunos #b-add{display:none!important}`;document.head.appendChild(st)}catch(_){}
function bloqUI(){const sp=$('#side .sessao');if(sp){let n=$('#bloqNav');const tem=S.anos.some(a=>a.turmas.length);
    if(!tem){if(n)n.remove()}else{if(!n){sp.insertAdjacentHTML('beforebegin','<button class="nav" id="bloqNav" type="button"></button>');n=$('#bloqNav');n.onclick=()=>bloqAlternar(!bloqOn())}
      const on=bloqOn();n.className='nav bloqnav'+(on?' on':'');n.setAttribute('aria-pressed',on);n.title=on?'Dados de base bloqueados — toque para desbloquear':'Bloquear turmas, alunos, critérios, horários e calendário';
      n.innerHTML=`<span data-ico>${ic(on?'cadeado':'cadeadoAb',18)}</span><span class="lbl">${on?'Dados Bloqueados':'Bloquear Dados'}</span>`}}
  document.body.classList.toggle('bloq-on',bloqOn());document.body.classList.toggle('bloq-alunos',bloqOn()&&!_bloqLivre&&!!bloqM().cat.alunos);bloqAlRO();
  const v=$('#view');if(!v)return;const ex=v.querySelector('.bloqban');if(ex)ex.remove();const c=BLOQ_VISTAS[VIEW];
  if(c&&bloqOn()&&bloqM().cat[c]){const h=v.querySelector('h1')||v.firstElementChild;const html=`<div class="bloqban" role="status">${ic('cadeado',16)}<span><b>Dados de base bloqueados.</b> ${esc(BLOQ_CAT.find(x=>x[0]===c)[1])} não podem ser alterados nem apagados.</span><span class="sp1"></span><button class="btn sm" type="button" data-bloqoff>${ic('cadeadoAb',14)} Desbloquear</button></div>`;
    if(h&&h.tagName==='H1')h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);const bb=v.querySelector('[data-bloqoff]');if(bb)bb.onclick=()=>bloqAlternar(false)}
  else if(VIEW==='turmas'&&!bloqOn()&&S.anos.some(a=>a.turmas.length>1&&a.turmas.some(t=>t.alunos.length))&&!S.cfg.bloqSugVisto){const h=v.querySelector('h1');const html=`<div class="bloqban sug" role="note">${ic('cadeado',16)}<span><b>Já inseriu as turmas e os alunos?</b> Bloqueie os dados de base para não os apagar ou alterar sem querer.</span><span class="sp1"></span><button class="btn sm pri" type="button" data-bloqon>${ic('cadeado',14)} Bloquear</button><button class="btn sm ico" type="button" data-bloqx aria-label="Agora não">${ic('x',12)}</button></div>`;
    if(h)h.insertAdjacentHTML('afterend',html);else v.insertAdjacentHTML('afterbegin',html);v.querySelector('[data-bloqon]').onclick=()=>bloqAlternar(true);v.querySelector('[data-bloqx]').onclick=()=>{S.cfg.bloqSugVisto=1;save();bloqUI()}}}
{const _gB=go;go=function(){const r=_gB.apply(this,arguments);try{bloqUI()}catch(e){console.warn(e)}return r}}
/* cartão nas Definições › Segurança */
function cartaoBloq(){const b=bloqM();return `<div class="card" id="bloq-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('cadeado',18)} Bloqueio dos Dados de Base</h2><span class="tag ${b.on?'ok':''}">${b.on?'Bloqueado'+(b.desde?' desde '+new Date(b.desde).toLocaleDateString('pt-PT'):''):'Desbloqueado'}</span><span class="sp1"></span>
  <button class="btn ${b.on?'':'pri'}" id="bloq-tg">${ic(b.on?'cadeadoAb':'cadeado',15)} ${b.on?'Desbloquear':'Bloquear Agora'}</button></div>
  <p class="hint" style="margin-top:6px">Depois de inserir as turmas, os alunos, os critérios, os horários e o calendário, bloqueie o que não muda durante o ano. Sumários, presenças, notas, observações e o resto continuam a funcionar normalmente. ${S.cfg.pinHash?'Para desbloquear é pedido o seu código.':'Defina um código (acima) para que só você possa desbloquear.'}</p>
  <div class="bloqcats">${BLOQ_CAT.map(([k,n,d])=>`<label class="chk bloqc"><input type="checkbox" data-bloqc="${k}" ${b.cat[k]?'checked':''} ${b.on?'disabled':''}><span><b>${n}</b><small>${d}</small></span></label>`).join('')}</div>
  ${b.on?'<p class="mut" style="font-size:12.5px;margin:8px 0 0">Para escolher o que fica bloqueado, desbloqueie primeiro.</p>':''}</div>`}
{const _ddB=defDados;defDados=function(){const h=_ddB.apply(this,arguments);const i=h.indexOf('<div class="card"><h2>'+ic('layers',18)+' Espaço Utilizado');return i>0?h.slice(0,i)+cartaoBloq()+h.slice(i):h+cartaoBloq()}}
{const _bdB=bindDados;bindDados=function(){const r=_bdB.apply(this,arguments);const re=()=>{const c=$('#bloq-card');if(!c)return;const d=document.createElement('div');d.innerHTML=cartaoBloq();c.replaceWith(d.firstElementChild);lig()};
  const lig=()=>{const t=$('#bloq-tg');if(t)t.onclick=async()=>{await bloqAlternar(!bloqOn());re()};$$('[data-bloqc]').forEach(x=>x.onchange=()=>{bloqM().cat[x.dataset.bloqc]=x.checked;save()})};lig();return r}}
/* a sincronização e o repor de conflitos trazem dados já validados noutro dispositivo */
{const _nsB=nvSincronizar;nvSincronizar=async function(){_bloqLivre++;try{return await _nsB.apply(this,arguments)}finally{_bloqLivre--;if(bloqOn())_bloqRef=bloqSigs(S);try{bloqUI()}catch(_){}}}}
setTimeout(()=>{try{bloqUI()}catch(_){}},50);

