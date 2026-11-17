/* ---------- 6. Painel da turma no iPhone ---------- */
function vPainelMovel(){const t=T();if(!t)return go('turmas');const a=A();const C=PNL();const P=periodos();const per=C.per==='ano'?null:(C.per?+C.per:perAtual(t));const D=pnlDados(t,a,per);const hj=isoHoje();
  barBtns([{id:'pn-sum',t:ic('pen',15)+' Sumário / Faltas',f:()=>go('sumarios')},{id:'pn-av',t:ic('plus',15)+' Avaliação',c:'pri',f:()=>{go('instrumentos');try{novoInstrumento()}catch(_){}}}]);
  const L=D.linhas;const comNota=L.filter(l=>l.nota!=null);const negs=L.filter(l=>l.neg);const assV=L.map(l=>l.ass).filter(x=>x!=null);const ass=assV.length?Math.round(avg(assV)):null;const med=comNota.length?avg(comNota.map(l=>l.nota)):null;
  const EST=t.instrumentos.filter(i=>(per==null||+i.periodo===+per)&&instMax(i)).map(i=>instEstado(t,i));const pend=EST.filter(x=>['porclass','parcial','incompleta'].includes(x.e)).length;
  const AT=pnlAtencao(t,a,D);const AG=pnlAgenda(t,a,14);const tab=UI.pnmTab||(AT.length?'at':'al');
  const prof=t.oferta==='profij'||t.oferta==='profissional';
  const q=normT(C.q||'');let LL=L.filter(l=>!q||normT(l.a.nome).includes(q)||String(l.a.num)===q);
  if(C.fil==='neg')LL=LL.filter(l=>l.neg);else if(C.fil==='risco')LL=LL.filter(l=>l.risco);else if(C.fil==='pend')LL=LL.filter(l=>l.pend||l.oralP);else if(C.fil==='sit')LL=LL.filter(l=>l.risco||l.neg||l.pend);
  LL.sort((x,y)=>(+x.a.num||0)-(+y.a.num||0));
  const sc=[['alunos','users','Alunos'],['sumarios','pen','Sumários'],['testes','target','Testes'],['instrumentos','clipboard','Instrumentos'],['avaliacao','grad','Avaliação'],['horario','calendar','Horário'],['planta','grid','Planta'],['relatorios','file','Relatórios'],...(prof?[['modulos','layers','Módulos'],['mra','refresh','MRA']]:[])];
  const kp=(k,l,v,s,cls)=>`<button type="button" class="pmk ${cls||''}" data-pmk="${k}"><small>${l}</small><b>${v}</b><span>${s}</span></button>`;
  const prox=imProxTurma(t,a);
  $('#view').innerHTML=`<div class="pm">
   <section class="pmhd">${anoBadge(t)}<div><h2>${esc(t.nome)}</h2><small>${esc(t.disciplina)} · ${D.al.length} aluno${D.al.length!==1?'s':''}${t.dt?' · Diretor(a) de turma':''}</small>${prox?`<span class="pmnx">${ic('clock',12)} Próxima aula: ${esc(prox)}</span>`:''}</div></section>
   <div class="seg pmper" role="group" aria-label="Período">${P.map(p=>`<button type="button" data-pnper="${p}" class="${per===p?'on':''}">${p}.º ${perW().slice(0,3).toLowerCase()}.</button>`).join('')}<button type="button" data-pnper="ano" class="${per==null?'on':''}">Ano</button></div>
   <div class="pmks">${kp('av','Média',med==null?'—':fmtNota(t,med),comNota.length?comNota.length+' com nota':'sem classificações')}${kp('ass','Assiduidade',ass==null?'—':ass+'%',D.porConf?D.porConf+' por confirmar':'limite '+D.LF.lim+' faltas',ass!=null&&ass<90?'w':'')}${kp('neg','Abaixo do limiar',comNota.length?negs.length:'—','alunos',negs.length?'bad':'')}${kp('pend','Por classificar',pend,'avaliações',pend?'w':'')}</div>
   <div class="pmsc">${sc.map(([v,i,l])=>`<button type="button" data-pmgo="${v}"><span>${ic(i,19)}</span>${l}</button>`).join('')}</div>
   <div class="seg pmtab" role="tablist">${[['at','Atenção',AT.length],['al','Alunos',D.al.length],['ag','Agenda',AG.E.length]].map(([k,l,n])=>`<button type="button" role="tab" data-pmtab="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l}${n?` <em>${n}</em>`:''}</button>`).join('')}</div>
   ${tab==='at'?`<section class="card pmat">${AT.length?AT.slice(0,15).map(x=>`<div class="pmai ${x.c}"><span class="pmaic">${ic(x.ic,15)}</span><span class="pmait"><b>${esc(x.tit)}</b><small>${esc(x.mot)}</small></span><button type="button" class="btn sm" data-pnact="${x.k}">${esc(x.ac)}</button></div>`).join(''):`<p class="mut">${ic('check',14)} Nada pendente nesta turma.</p>`}</section>`:''}
   ${tab==='al'?`<section class="card pmal"><input type="search" id="pn-q" placeholder="Pesquisar nome ou n.º" value="${esc(C.q||'')}"><div class="pmfil">${[['','Todos'],['sit','A acompanhar'],['neg','Abaixo do limiar'],['risco','Faltas'],['pend','Pendências']].map(([k,l])=>`<button type="button" data-pnfil="${k}" class="${(C.fil||'')===k?'on':''}">${l}</button>`).join('')}</div>
     <ul class="pml">${LL.map(l=>`<li><button type="button" class="pmr ${l.risco==='lim'||l.neg?'bad':l.risco||l.pend?'w':''}" data-pnp="${l.a.id}">${avatar(l.a,34)}<span class="pmrn"><b>${esc(numAl(l.a))}. ${esc(l.a.nome)}</b><small>${[l.f.tot?l.f.tot+'/'+D.LF.lim+' faltas':'sem faltas',l.ass!=null?l.ass+'% assid.':'',l.pend?l.pend+' por classificar':'',l.oralP?'oral':''].filter(Boolean).join(' · ')}</small></span><span class="pmrv">${l.nota==null?'<span class="mut">—</span>':`<b class="${l.neg?'neg':''}">${fmtNota(t,l.nota)}</b>${!isSec(t)?`<small>nível ${nivel(t,l.nota)}</small>`:''}`}</span></button></li>`).join('')||'<li class="mut" style="padding:12px">Nenhum aluno com este filtro.</li>'}</ul></section>`:''}
   ${tab==='ag'?`<section class="card pmag">${AG.E.length?`<ul class="iml">${AG.E.slice(0,20).map(x=>{const d=dataDeIso(x.d);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${DIAS_C[d.getDay()]}</small></span><span class="imlb"><span class="imic">${ic(x.ic,13)}</span><span><b>${esc(x.t)}</b>${x.s?` <small>${esc(x.s)}</small>`:''}</span></span><small class="mut">${x.d===hj?'hoje':diasEntre(hj,x.d)+' d'}</small></li>`}).join('')}</ul>`:'<p class="mut">Sem eventos nos próximos 14 dias.</p>'}</section>`:''}
   <button type="button" class="imfull" data-pmfull="1">${ic('chart',14)} Ver o painel completo</button></div>`;
  const v=$('#view');const re=()=>vPainelMovel();
  v.querySelectorAll('[data-pnper]').forEach(b=>b.onclick=()=>{C.per=b.dataset.pnper;save();re()});
  v.querySelectorAll('[data-pmtab]').forEach(b=>b.onclick=()=>{UI.pnmTab=b.dataset.pmtab;re()});
  v.querySelectorAll('[data-pmgo]').forEach(b=>b.onclick=()=>{if(b.dataset.pmgo==='instrumentos')UI.inst=null;go(b.dataset.pmgo)});
  v.querySelectorAll('[data-pmk]').forEach(b=>b.onclick=()=>{const k=b.dataset.pmk;UI.pnmTab='al';C.fil=k==='neg'?'neg':k==='pend'?'pend':k==='ass'?'risco':'';if(k==='av'){go('avaliacao');return}save();re()});
  v.querySelectorAll('[data-pnfil]').forEach(b=>b.onclick=()=>{C.fil=b.dataset.pnfil;save();re()});
  const qi=$('#pn-q');if(qi)qi.oninput=()=>{C.q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{const p=qi.selectionStart;re();const n=$('#pn-q');if(n){n.focus();n.setSelectionRange(p,p)}},250)};
  v.querySelectorAll('[data-pnp]').forEach(b=>b.onclick=()=>{try{perfilAluno(b.dataset.pnp,{p:per||perAtual(t)})}catch(_){go('alunos')}});
  const AI=Object.fromEntries(AT.map(x=>[x.k,x]));
  v.querySelectorAll('[data-pnact]').forEach(b=>b.onclick=()=>{const x=AI[b.dataset.pnact];if(!x)return;if(x.fn){x.fn();toast('Feito','ok');return re()}if(x.inst){UI.inst=x.inst;UI.instTab=x.tab||'notas';return go('instrumentos')}if(x.aluno){try{return perfilAluno(x.aluno,{p:per||perAtual(t)})}catch(_){}}if(x.go)go(x.go)});
  const fl=v.querySelector('[data-pmfull]');if(fl)fl.onclick=()=>{S.cfg.painelMovel='completo';save();go('painel')}}
{const _vPM=vPainel;vPainel=function(){if(ES_MOVEL()&&S.cfg.painelMovel!=='completo'&&!document.body.classList.contains('apres'))return vPainelMovel();const r=_vPM.apply(this,arguments);
  try{if(ES_MOVEL()&&!$('#pm-volta')){$('#view').insertAdjacentHTML('afterbegin',`<button type="button" class="imvolta" id="pm-volta">${ic('grid',14)} Vista compacta para o telemóvel</button>`);$('#pm-volta').onclick=()=>{S.cfg.painelMovel='';save();go('painel')}}}catch(_){}return r};if(go._f)go._f.painel=vPainel}
/* mudar de orientação/tamanho: volta a desenhar o Início e o Painel */
{let _mv=ES_MOVEL();addEventListener('resize',()=>{const m=ES_MOVEL();if(m!==_mv){_mv=m;if(['inicio','painel'].includes(VIEW))go(VIEW)}})}

/* v0.91 · ajuda */
{const _aa=ajudaAtualizar;ajudaAtualizar=function(){const pr=AJUDA._v91;_aa.apply(this,arguments);if(pr)return;AJUDA._v91=1;
  const N=[{id:'notificacoes',ic:'bell',t:'Notificações no iPhone, iPad e Computador',gif:null,txt:`<ol><li><b>iPhone/iPad</b>: no Safari, Partilhar › <b>Adicionar ao ecrã principal</b> e abra a app pelo ícone (a Apple só permite notificações assim, iOS 16.4+).</li><li>Em <b>Definições › Notificações</b> toque em <b>Ativar Notificações</b> e aceite.</li><li>Escolha o que quer receber: aula a começar (5, 10 ou 15 min antes), sumário por escrever depois da aula, resumo do dia (07:45), avaliações de amanhã (18:00), lembretes de reuniões e avisos urgentes, número no ícone da app. Defina o horário de silêncio e os fins de semana.</li></ol><p>Tocar numa notificação abre a secção certa. <b>Com a app fechada</b>: em Definições › Notificações › <b>Com a App Fechada</b>, toque em <b>Ativar Avisos com a App Fechada</b> em cada aparelho — a EduSpruce passa a enviar os avisos a partir da base de dados, mesmo com a app fechada ou o aparelho bloqueado (use <b>Testar com a App Fechada</b> para confirmar). Em alternativa, <b>Juntar ao Calendário (.ics)</b> põe reuniões, avaliações, tarefas e avisos dos próximos 45 dias no Calendário com alarmes.</p>`},
   {id:'contasg',ic:'shield',t:'Contas Autorizadas e Dados Só na Nuvem',gif:null,txt:`<p>Não basta ter uma conta Google: <b>só entram as contas que o administrador autorizar</b>. Em <b>Definições › Conta e Acesso › Quem Pode Entrar com Google</b> o administrador acrescenta o e-mail e o perfil (Professor, Direção, Administrador), descarrega a configuração e publica-a no site — vale para todos os aparelhos. O ficheiro guarda só uma impressão digital (SHA-256) de cada e-mail. Uma conta retirada perde o acesso na próxima vez que a app abrir.</p><p>Neste site os dados <b>só existem sincronizados com a conta Google</b>, encriptados: entra-se com Google (a conta local é só uma entrada de emergência do administrador), a sincronização não se desliga e, ao terminar a sessão, a app envia as últimas alterações e limpa a cópia do aparelho.</p>`}];
  N.forEach(n=>{if(!AJUDA.find(x=>x.id===n.id)){const i=AJUDA.findIndex(x=>x.id==='instalar');AJUDA.splice(i>=0?i+1:AJUDA.length,0,n)}})}}

/* v0.92 · ecrã de arranque: sai quando a app (ou o ecrã de entrada) está pronta */
window.esSplash=function(txt){let d=document.getElementById('splash');if(txt===false){if(d){d.classList.add('fora');setTimeout(()=>d&&d.remove(),400)}return}
  if(!d){d=document.createElement('div');d.id='splash';d.innerHTML='<div class="spw">'+(document.querySelector('#splash-tpl')||{innerHTML:''}).innerHTML+'</div>';document.body.appendChild(d)}const t=document.getElementById('splash-t');if(t&&txt)t.textContent=txt};
{const _sl=()=>{const d=document.getElementById('splash');if(!d)return clearInterval(_slT);const pronto=document.body.classList.contains('login-on')&&document.getElementById('login')||(document.getElementById('view')&&document.getElementById('view').children.length>0&&SESSAO);if(pronto){clearInterval(_slT);esSplash(false)}};const _slT=setInterval(_sl,80);setTimeout(()=>{clearInterval(_slT);esSplash(false)},25000)}
/* v0.92 · sincroniza antes de sair (fechar, mudar de app, recarregar, terminar sessão) */
function nvPendenteAgora(){try{const L=nvL();if(!L.prov||!_nvK||L.auto===false)return false;try{saveNow()}catch(_){}return Object.keys(nvL().mod||{}).length>0}catch(_){return false}}
let _nvSaida=null;
function nvSyncSaida(){if(_nvSaida)return _nvSaida;if(!nvPendenteAgora())return null;clearTimeout(_nvT);
  _nvSaida=(async()=>{for(let i=0;i<4;i++){if(_nvBusy){await new Promise(r=>setTimeout(r,350));continue}await nvSincronizar(false);if(!Object.keys(nvL().mod||{}).length)break}})().catch(()=>{}).finally(()=>{_nvSaida=null;try{nvBadge()}catch(_){}});return _nvSaida}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')nvSyncSaida()});
addEventListener('pagehide',()=>{nvSyncSaida()});
addEventListener('beforeunload',e=>{if(window.__efApagar||window.__nvSemAviso)return;if(nvPendenteAgora()){nvSyncSaida();e.preventDefault();e.returnValue='Ainda há alterações a enviar para a nuvem. Espere uns segundos.';return e.returnValue}});
{const _gl=gLogin;gLogin=function(){window.__nvSemAviso=true;setTimeout(()=>{window.__nvSemAviso=false},8000);return _gl.apply(this,arguments)}}
{const _ts2=terminarSessao;terminarSessao=async function(){if(nvPendenteAgora()){esSplash('A guardar as últimas alterações na nuvem…');const d=document.getElementById('splash');if(d){d.style.animation='none';d.style.opacity='1'}
    await Promise.race([nvSyncSaida()||Promise.resolve(),new Promise(r=>setTimeout(r,20000))]);if(Object.keys(nvL().mod||{}).length){esSplash(false);const r=await avisoModal('Alterações ainda por enviar',['Não foi possível enviar tudo para a nuvem (sem internet?). As alterações ficam guardadas neste aparelho e são enviadas na próxima vez que abrir a app aqui.'],[{t:'Ficar',c:'pri',v:null},{t:'Sair Mesmo Assim',v:'sim'}]);if(r!=='sim')return}}
  window.__nvSemAviso=true;return _ts2.apply(this,arguments)}}

/* v0.93 · palavra-passe de encriptação numérica, com teclado numérico em todos os aparelhos */
const NV_PIN_IDS=['nvas-p1','nvas-p2','nv2-p1','nv2-p2','np-1','np-2','nv-pw1','nv-pw2','mc-0','mc-1','mc-2'];
const NV_PIN_MIN=8;
function nvPinErro(a,id,novo){if(novo===undefined)novo=true;const el=document.getElementById(id);const letras=el&&el.dataset.letras==='1';a=String(a||'');
  if(letras)return a.length<8?'Use pelo menos 8 caracteres.':'';
  if(!/^\d+$/.test(a))return 'O código de encriptação tem só algarismos.';
  if(a.length<NV_PIN_MIN)return 'Use pelo menos '+NV_PIN_MIN+' algarismos.';
  if(novo&&(/^(\d)\1+$/.test(a)||'01234567890123456789'.includes(a)||'98765432109876543210'.includes(a)))return 'Esse código é fácil de adivinhar — evite repetições e sequências.';return ''}
const nvToque=()=>{try{return matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0}catch(_){return false}};
function nvPinPrep(){NV_PIN_IDS.forEach(id=>{const el=document.getElementById(id);if(!el||el.dataset.pin)return;el.dataset.pin='1';
    const letras=()=>el.dataset.letras==='1';
    const aplicar=()=>{if(letras()){el.setAttribute('inputmode','text');el.removeAttribute('pattern')}else{el.setAttribute('inputmode',nvToque()?'none':'numeric');el.setAttribute('pattern','[0-9]*')}};aplicar();
    el.setAttribute('enterkeyhint','done');el.setAttribute('autocapitalize','off');el.setAttribute('spellcheck','false');
    el.addEventListener('input',()=>{if(!letras()){const v=el.value.replace(/\D/g,'');if(v!==el.value)el.value=v}});
    const grp=el.closest('form')||el.closest('dialog')||el.parentElement;if(!grp)return;
    grp.addEventListener('focusin',e=>{if(NV_PIN_IDS.includes(e.target.id))grp._pinAlvo=e.target});
    if(!grp._pinAlvo)grp._pinAlvo=el;
    const ultimo=[...grp.querySelectorAll('input[type=password]')].filter(x=>NV_PIN_IDS.includes(x.id)).pop();
    if(grp.querySelector('.pinpad')||el!==ultimo)return;
    const pad=document.createElement('div');pad.className='pinpad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Teclado numérico');
    pad.innerHTML=['1','2','3','4','5','6','7','8','9','apagar','0','ok'].map(k=>`<button type="button" data-pk="${k}" ${k==='apagar'?'aria-label="Apagar"':k==='ok'?'aria-label="Seguinte"':''}>${k==='apagar'?ic('back',18):k==='ok'?ic('check',18):k}</button>`).join('')+(grp.querySelector('#nvas-p2,#np-2,#nv-pw2')&&!grp.querySelector('[data-antigo]')?'':`<button type="button" class="pinlet" data-pk="letras">A minha palavra-passe antiga tem letras</button>`);
    ultimo.insertAdjacentElement('afterend',pad);
    pad.addEventListener('pointerdown',e=>{if(e.target.closest('[data-pk]'))e.preventDefault()});
    pad.addEventListener('click',e=>{const b=e.target.closest('[data-pk]');if(!b)return;const k=b.dataset.pk;const campos=[...grp.querySelectorAll('input[type=password]')].filter(x=>NV_PIN_IDS.includes(x.id)&&!x.hidden&&x.offsetParent!==null);
      let alvo=grp._pinAlvo&&campos.includes(grp._pinAlvo)?grp._pinAlvo:campos[0];if(!alvo)return;
      if(k==='letras'){const ant=campos.filter(c=>!c.dataset.novo);ant.forEach(c=>{c.dataset.letras='1';c.setAttribute('inputmode','text');c.removeAttribute('pattern')});if(ant.length===campos.length)pad.classList.add('letras');else b.remove();(ant[0]||alvo).focus();return}
      if(k==='apagar'){alvo.value=alvo.value.slice(0,-1)}
      else if(k==='ok'){const i=campos.indexOf(alvo);if(i<campos.length-1&&!campos[i+1].value){grp._pinAlvo=campos[i+1];campos[i+1].classList.add('pinfoco');setTimeout(()=>campos[i+1].classList.remove('pinfoco'),600);return}
        const bt=grp.querySelector('#nvas-ok,#nv2-pwok,#nv-pwok,[data-np="1"],button[type=submit].pri,.btn.pri');if(bt)bt.click();return}
      else{if(alvo.value.length>=32)return;alvo.value+=k}
      alvo.dispatchEvent(new Event('input',{bubbles:true}));if(!nvToque())alvo.focus();if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}})})}
setInterval(nvPinPrep,350);document.addEventListener('focusin',()=>setTimeout(nvPinPrep,0));

/* v0.94 · o ID da Google nunca falta (configuração lenta ou bloqueada) */
const ES_G_ID='275856895734-48n60vhatvltml3t601o24cbak7ndjq2.apps.googleusercontent.com';
{const _gid=gLoginId;gLoginId=function(){return _gid.apply(this,arguments)||(/(^|\.)eduspruce\.(pt|app)$/.test(location.hostname)?ES_G_ID:'')}}
{const _gl3=gLogin;gLogin=async function(A_){if(!gLoginId(A_)){try{await nvCentralCarregar()}catch(_){}}return _gl3.apply(this,arguments)}}
setTimeout(()=>{try{if(!NV_CENTRAL.google&&/(^|\.)eduspruce\.(pt|app)$/.test(location.hostname))NV_CENTRAL.google=ES_G_ID}catch(_){}},4000);
/* v0.94 · mudar o código de encriptação (volta a encriptar tudo na nuvem) */
async function nvMudarCodigo(antigo,novo,prog){const prov=nvProv();const L=nvL();prog=prog||(()=>{});if(!prov||!L.k)throw new Error('A sincronização não está ligada neste aparelho.');
  let kOld=null;if(L.rekey&&L.rekey.kOld){kOld=await crypto.subtle.importKey('raw',unb64(L.rekey.kOld),'AES-GCM',true,['encrypt','decrypt'])}
  else{const k0=await nvChaveDe(antigo,L.salt);if(b64(await crypto.subtle.exportKey('raw',k0))!==L.k)throw new Error('O código atual está errado.');kOld=k0}
  let salt,kNew;if(L.rekey&&L.rekey.k){salt=L.rekey.salt;kNew=await crypto.subtle.importKey('raw',unb64(L.rekey.k),'AES-GCM',true,['encrypt','decrypt'])}
  else{prog('A sincronizar antes de mudar…');await nvSincronizar(true);if(Object.keys(nvL().mod||{}).length)throw new Error('Não foi possível sincronizar antes de mudar o código. Verifique a internet e tente de novo.');
    salt=b64(crypto.getRandomValues(new Uint8Array(16)));kNew=await nvChaveDe(novo,salt);nvSet({rekey:{salt,k:b64(await crypto.subtle.exportKey('raw',kNew)),kOld:b64(await crypto.subtle.exportKey('raw',kOld)),desde:Date.now()}})}
  while(_nvBusy)await new Promise(r=>setTimeout(r,300));_nvBusy=true;
  try{const man=JSON.parse(await prov.ler(NV_PREF+'manifest.json')||'null');if(!man)throw new Error('Não há dados na nuvem.');
    const re=async nome=>{const txt=await prov.ler(nome);if(txt==null)return;let pt;try{pt=await nvDecifrar(txt,kOld)}catch(_){try{await nvDecifrar(txt,kNew);return}catch(__){throw new Error('Um ficheiro na nuvem não abre com nenhum dos códigos: '+nome)}}await prov.escrever(nome,await nvCifrar(pt,kNew))};
    const P=Object.keys(man.partes||{}),F=Object.keys(man.fotos||{});const tot=P.length+F.length;let i=0;
    for(const n of P){prog('A encriptar de novo… '+(++i)+' de '+tot);await re(NV_PREF+n+'.bin')}
    for(const id of F){prog('A encriptar de novo… '+(++i)+' de '+tot);await re(nvNomeF(id))}
    man.salt=salt;man.chk=await nvCifrar('eduflow',kNew);man.rev=(man.rev||0)+1;man.rekeyEm=Date.now();await prov.escrever(NV_PREF+'manifest.json',JSON.stringify(man));
    await nvGuardarChave(kNew);nvSet({salt,rekey:null,erro:null});try{audit('Segurança','Código de encriptação da nuvem mudado',tot+' ficheiros')}catch(_){}return tot}
  finally{_nvBusy=false}}
/* noutro aparelho: o código mudou → pede o novo em vez de dar erro */
{const _nsR=nvSincronizar;nvSincronizar=async function(){const L=nvL();if(L.rekey&&L.rekey.k&&!_nvBusy){try{await nvMudarCodigo('','',()=>{});toast('Acabou de mudar o código de encriptação na nuvem','ok')}catch(e){console.warn(e)}}
  const r=await _nsR.apply(this,arguments);try{const e=nvL().erro||'';if(!r&&/não corresponde/.test(e)&&SESSAO){_nvK=null;try{localStorage.removeItem('eskeep')}catch(_){}nvSet({k:null,erro:null});toast('O código de encriptação foi mudado noutro aparelho. Escreva o código novo.','aviso');try{sessionStorage.removeItem('es.assist')}catch(_){}setTimeout(()=>nvAssist(true),400)}}catch(_){}return r}}
function nvMudarDlg(){const d=document.createElement('dialog');d.className='nvmc';d.setAttribute('aria-labelledby','mc-t');
  d.innerHTML=`<form class="nvmcf" data-nosub autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg().email||(SESSAO||{}).u||'')}" hidden readonly><h2 id="mc-t">${ic('shield',18)} Mudar o Código de Encriptação</h2>
   <p class="hint">Os dados na nuvem são encriptados de novo com o código novo. Nos outros aparelhos a app vai pedir o código novo. Faça-o com a internet ligada e, se possível, com a app fechada nos outros aparelhos.</p>
   <label for="mc-0">Código atual</label><input type="password" id="mc-0" data-antigo="1" autocomplete="current-password" placeholder="Código atual">
   <label for="mc-1">Código novo (só algarismos, mín. 8)</label><input type="password" id="mc-1" data-novo="1" name="new-password" autocomplete="new-password" placeholder="Código novo">
   <input type="password" id="mc-2" data-novo="1" autocomplete="new-password" placeholder="Repetir o código novo" aria-label="Repetir o código novo">
   <div class="nverr" id="mc-e" role="alert"></div><div class="mut" id="mc-p" aria-live="polite"></div>
   <div class="row" style="gap:8px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn" id="mc-x">Cancelar</button><button type="button" class="btn pri" id="mc-ok">${ic('shield',15)} Mudar o Código</button></div></form>`;
  document.body.appendChild(d);d.showModal();setTimeout(nvPinPrep,0);const er=d.querySelector('#mc-e'),pg=d.querySelector('#mc-p');
  d.querySelector('#mc-x').onclick=()=>{d.close();d.remove()};
  d.querySelector('#mc-ok').onclick=async()=>{er.textContent='';const a=d.querySelector('#mc-0').value,b=d.querySelector('#mc-1').value,c=d.querySelector('#mc-2').value;
    if(!a)return er.textContent='Escreva o código atual.';{const e=nvPinErro(b,'mc-1',true);if(e)return er.textContent=e}if(b!==c)return er.textContent='Os códigos novos não coincidem.';if(a===b)return er.textContent='O código novo é igual ao atual.';
    const bt=d.querySelector('#mc-ok');bt.disabled=true;d.querySelector('#mc-x').disabled=true;
    try{const n=await nvMudarCodigo(a,b,t=>pg.textContent=t);try{if(window.PasswordCredential&&navigator.credentials){const cr=new PasswordCredential({id:gsCfg().email||(SESSAO||{}).u||'eduspruce',password:b,name:'EduSpruce — código de encriptação'});navigator.credentials.store(cr).catch(()=>{})}}catch(_){}
      d.close();d.remove();toast('Código mudado — '+n+' ficheiro(s) encriptados de novo','ok');if(VIEW==='definicoes')vDefinicoes()}
    catch(e){er.textContent=e.message;pg.textContent='';bt.disabled=false;d.querySelector('#mc-x').disabled=false}}}
{const _bs2=bindSync;bindSync=function(){const r=_bs2.apply(this,arguments);try{const pm=$('#nv2-pwm');if(pm&&!$('#nv2-mc')){pm.insertAdjacentHTML('beforebegin',`<button class="btn" id="nv2-mc">${ic('shield',14)} Mudar o Código</button>`);$('#nv2-mc').onclick=nvMudarDlg}}catch(e){console.warn(e)}return r}}

/* v0.95 · iPad: menu lateral que abre com os nomes (botão, toque no logótipo ou deslizar da margem) */
const railModo=()=>{try{return matchMedia('(min-width:701px) and (max-width:1100px)').matches||document.body.classList.contains('menu-ico')}catch(_){return false}};
const RAIL_IC_ABRIR='<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><path d="M13 10l2 2-2 2"/></svg>';
const RAIL_IC_FECHAR='<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><path d="M16 10l-2 2 2 2"/></svg>';
function railAbrir(on){if(on&&!railModo())on=false;document.body.classList.toggle('rail-aberta',!!on);const b=$('#railTgl');if(b){b.setAttribute('aria-expanded',on?'true':'false');b.setAttribute('aria-label',on?'Recolher o menu':'Mostrar o menu com os nomes');b.innerHTML=on?RAIL_IC_FECHAR+'<span class="lbl">Recolher</span>':RAIL_IC_ABRIR}
  let bg=$('#railBg');if(on&&!bg){bg=document.createElement('div');bg.id='railBg';bg.onclick=()=>railAbrir(false);document.body.appendChild(bg)}else if(!on&&bg)bg.remove();try{if(on)$('#side').scrollTop=0}catch(_){}try{a11ySide()}catch(_){}}
function railPrep(){const sd=$('#side');if(!sd||$('#railTgl'))return;const br=sd.querySelector('.brand');const b=document.createElement('button');b.type='button';b.id='railTgl';b.className='railtgl';b.innerHTML=RAIL_IC_ABRIR;b.setAttribute('aria-label','Mostrar o menu com os nomes');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','side');
  if(br)br.insertAdjacentElement('afterend',b);else sd.prepend(b);b.onclick=e=>{e.stopPropagation();railAbrir(!document.body.classList.contains('rail-aberta'))};
  if(br){br.style.cursor='pointer';br.addEventListener('click',()=>{if(railModo())railAbrir(!document.body.classList.contains('rail-aberta'))})}
  sd.addEventListener('click',e=>{if(!document.body.classList.contains('rail-aberta'))return;const n=e.target.closest('[data-v],[data-go],.tsec');if(n&&!e.target.closest('.chev'))setTimeout(()=>railAbrir(false),60)})}
railPrep();setInterval(railPrep,1500);
/* menu só com ícones: o botão do tema mostra o tema atual e muda para o seguinte a cada toque (Auto → Claro → Escuro) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#temaSel>button.on');if(!b||!railModo()||document.body.classList.contains('rail-aberta'))return;
  const L=[...b.parentElement.querySelectorAll('button[data-tema]')];const n=L[(L.indexOf(b)+1)%L.length];if(!n||n===b)return;e.preventDefault();e.stopImmediatePropagation();n.click();
  setTimeout(()=>{const o=$('#temaSel>button.on');if(o){const nm={auto:'automático',light:'claro',dark:'escuro'}[o.dataset.tema]||o.dataset.tema;o.title='Tema '+nm+' — toque para mudar';try{o.focus({preventScroll:true})}catch(_){}try{anunciar('Tema '+nm)}catch(_){}}},30)},true);
/* v0.939 · computadores com ecrã pequeno: menu lateral só com ícones (Automático), ou como o utilizador escolher (Só ícones / Completo) */
const MENU_PEQ='(min-width:1101px) and (max-width:1440px), (min-width:1101px) and (max-height:820px)';
const menuPref=()=>{const m=S&&S.cfg&&S.cfg.menuModo;return m==='icones'||m==='completo'?m:'auto'};
function menuCss(){if($('#menuIcoCss'))return;const out=[];const RX=/#side|railtgl|railBg|rail-aberta|\.tema\b|\.sessao|verlegal/;
  const parte=t=>{const r=[];let d=0,c='';for(const ch of t){if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){r.push(c);c=''}else c+=ch}r.push(c);return r.map(x=>x.trim()).filter(Boolean)};
  const pref=sel=>/^(html\s+)?body(?![-\w])/.test(sel)?sel.replace(/\bbody(?![-\w])/,'body.menu-ico'):'body.menu-ico '+sel;
  for(const sh of document.styleSheets){let R;try{R=sh.cssRules}catch(_){continue}if(!R)continue;
    for(const m of R){if(!(m instanceof CSSMediaRule))continue;const q=m.media.mediaText.replace(/\s+/g,'');if(!/max-width:1100px/.test(q)||/pointer|hover|max-height|prefers/.test(q))continue;
      for(const r of m.cssRules){if(r instanceof CSSKeyframesRule){out.push(r.cssText);continue}if(!(r instanceof CSSStyleRule)||!RX.test(r.selectorText))continue;
        out.push(parte(r.selectorText).map(pref).join(',')+'{'+r.style.cssText+'}')}}}
  const st=document.createElement('style');st.id='menuIcoCss';st.textContent='@media (min-width:1101px){'+out.join('\n')+`
  body.menu-ico.rail-aberta #side{width:300px}
  body.menu-ico:not(.rail-aberta) #side .seg.mini{display:none!important}
  }
  .menutgl{display:none}
  #side .tmrow{display:flex;align-items:center;gap:6px;margin:10px 4px 0;flex:none}#side .tmrow>#temaSel{flex:1 1 auto;margin:0!important;min-width:0}#side .tmrow>#menuTgl{margin:0!important;flex:none!important}
  @media (min-width:701px) and (max-width:1100px){body:not(.rail-aberta) #side .tmrow{flex-direction:column;margin:2px 0 0;gap:0}}
  body.menu-ico:not(.rail-aberta) #side .tmrow{flex-direction:column;margin:2px 0 0;gap:0}
  @media (min-width:1101px){
   .menutgl{display:grid;place-items:center;width:34px!important;height:34px!important;min-height:0!important;margin:10px 6px 4px;padding:0!important;border-radius:10px!important;border:0!important;background:transparent!important;color:inherit;opacity:.5;cursor:pointer;flex:none!important;align-self:flex-start}
   .menutgl .lbl{display:none!important}
   .menutgl:hover,.menutgl:focus-visible{opacity:1;background:rgba(255,255,255,.1)!important}
   body.menu-ico.rail-aberta .menutgl{align-self:flex-start}
   body.menu-ico:not(.rail-aberta) .menutgl{display:none}
  }`;document.head.appendChild(st)}
function menuAplicar(){try{menuCss()}catch(e){console.warn(e)}const b=document.body;const largo=matchMedia('(min-width:1101px)').matches;const p=menuPref();
  const on=largo&&(p==='icones'||(p==='auto'&&matchMedia(MENU_PEQ).matches));if(b.classList.contains('menu-ico')!==on){b.classList.toggle('menu-ico',on);if(!on&&b.classList.contains('rail-aberta')&&!railModo())railAbrir(false);if(on)railAbrir(false)}
  const sd=$('#side');if(!sd)return;let t=$('#menuTgl');if(!t){t=document.createElement('button');t.type='button';t.id='menuTgl';t.className='menutgl';sd.appendChild(t);
    t.onclick=e=>{e.stopPropagation();const ico=b.classList.contains('menu-ico');S.cfg.menuModo=ico?'completo':'icones';try{save()}catch(_){}railAbrir(false);menuAplicar();toast(ico?'Menu completo fixado — pode voltar a recolhê-lo aqui':'Menu só com ícones — o botão no topo do menu mostra os nomes','ok')}}
  {const tm=$('#temaSel');if(tm){let rw=$('#tmRow');if(!rw||tm.parentElement!==rw){rw=rw||document.createElement('div');rw.id='tmRow';rw.className='tmrow';tm.before(rw);rw.appendChild(tm)}if(t.parentElement!==rw||t.previousElementSibling!==tm)rw.appendChild(t)}else if(t.nextElementSibling)sd.appendChild(t)}const ico=b.classList.contains('menu-ico');const h=ico?RAIL_IC_ABRIR+'<span class="lbl">Manter o menu aberto</span>':RAIL_IC_FECHAR+'<span class="lbl">Recolher (só ícones)</span>';if(t.dataset.k!==String(ico)){t.dataset.k=String(ico);t.innerHTML=h;t.title=ico?'Mostrar sempre o menu com os nomes neste computador':'Mostrar só os ícones no menu, para ganhar espaço';t.setAttribute('aria-label',t.title)}}
menuAplicar();setInterval(menuAplicar,1500);addEventListener('resize',menuAplicar);
addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('rail-aberta'))railAbrir(false)});
addEventListener('resize',()=>{if(!railModo()&&document.body.classList.contains('rail-aberta'))railAbrir(false)});
{let x0=null,y0r=null,dentro=false;document.addEventListener('touchstart',e=>{if(!railModo()||e.touches.length!==1)return;const t=e.touches[0];const ab=document.body.classList.contains('rail-aberta');dentro=ab&&!!e.target.closest('#side');if(t.clientX<28||dentro||(!ab&&e.target.closest('#side'))){x0=t.clientX;y0r=t.clientY}else x0=null},{passive:true});
  document.addEventListener('touchmove',e=>{if(x0==null)return;const t=e.touches[0];const dx=t.clientX-x0,dy=Math.abs(t.clientY-y0r);if(dy>40){x0=null;return}const ab=document.body.classList.contains('rail-aberta');if(!ab&&dx>48){railAbrir(true);x0=null}else if(ab&&dx<-60){railAbrir(false);x0=null}},{passive:true});
  document.addEventListener('touchend',()=>{x0=null},{passive:true})}

/* v0.97 · o endereço principal passa a ser eduspruce.pt — no eduspruce.app a app guarda tudo na nuvem e muda de endereço sozinha */
const ES_DOM='eduspruce.pt';
(async()=>{try{if(!/^(www\.)?eduspruce\.app$/.test(location.hostname))return;if(/access_token=|[?&#]code=|state=/.test(location.hash+location.search))return;
  const ok=await fetch('https://'+ES_DOM+'/eduspruce-config.json',{cache:'no-store',mode:'cors'}).then(r=>r.ok).catch(()=>false);if(!ok)return; /* o .pt ainda não está no ar (ou a rede bloqueia-o): fica aqui */
  const destino='https://'+ES_DOM+location.pathname+location.search;
  try{esSplash('A EduSpruce mudou para '+ES_DOM+' — a guardar as últimas alterações…');const d=document.getElementById('splash');if(d){d.style.animation='none';d.style.opacity='1'}}catch(_){}
  for(let i=0;i<30;i++){let L={};try{L=nvL()}catch(_){}const pend=Object.keys(L.mod||{}).length;if(!L.prov||!_nvK||!pend)break;if(!_nvBusy){try{await nvSincronizar(false)}catch(_){}}await new Promise(r=>setTimeout(r,1200))}
  try{esSplash('A abrir '+ES_DOM+'… Entre com Google e escreva o seu código: os dados vêm da nuvem.')}catch(_){}
  setTimeout(()=>location.replace(destino),1600)}catch(e){console.warn(e)}})();

/* v1.00 · bloqueio dos dados de base: aviso só 5 s; desbloquear apenas em Definições › Segurança */
let _bloqBanAte=0;
function bloqIrDef(){toast('Para desbloquear: Definições › Segurança','aviso');UI.defTab='dados';go('definicoes');setTimeout(()=>{const c=$('#bloq-card');if(c){c.scrollIntoView({behavior:'smooth',block:'center'});c.classList.add('realce');setTimeout(()=>c.classList.remove('realce'),1800)}},350)}
{const _gBB=go;go=function(v){if(v!==go._bbUlt){_bloqBanAte=Date.now()+5000;go._bbUlt=v}return _gBB.apply(this,arguments)};if(go._f)go._f=go._f}
{const _ba=bloqAlternar;bloqAlternar=async function(ligar){if(ligar)_bloqBanAte=Date.now()+5000;return _ba.apply(this,arguments)}}
{const _bu3=bloqUI;bloqUI=function(){const r=_bu3.apply(this,arguments);try{
  const bb=$('#view .bloqban:not(.sug)');if(bb){const falta=_bloqBanAte-Date.now();if(falta<=0){bb.remove()}else{
      const b=bb.querySelector('[data-bloqoff]');if(b){b.innerHTML=ic('gear',14)+' Definições';b.onclick=bloqIrDef}
      const t=bb.querySelector('span:not(.sp1)');if(t&&!t.querySelector('.bloqdef'))t.insertAdjacentHTML('beforeend',' <span class="bloqdef">Para desbloquear: <b>Definições › Segurança</b>.</span>');
      clearTimeout(bloqUI._t);bloqUI._t=setTimeout(()=>{const x=$('#view .bloqban:not(.sug)');if(x){x.classList.add('fora');setTimeout(()=>x.remove(),450)}},falta)}}
  if(bloqOn())['#bloqBar','#bloqNav'].forEach(q=>{const e=$(q);if(e){e.onclick=bloqIrDef;e.title='Dados de base bloqueados — desbloqueie em Definições › Segurança';e.setAttribute('aria-label',e.title)}});
  else['#bloqBar','#bloqNav'].forEach(q=>{const e=$(q);if(e)e.onclick=()=>bloqAlternar(true)});
}catch(e){console.warn(e)}return r}}

/* 0.992 · versão discreta junto ao logótipo na barra lateral */
function verSide(){$$('#side .bver').forEach(x=>x.remove())}
verSide();setInterval(verSide,3000);

/* 0.994 · sincronização discreta: só o ícone a rodar; o código escreve-se uma vez por aparelho */
let _nvSil=0,_nvGoPend=null;
{const _nsS=nvSincronizar;nvSincronizar=async function(interativo){if(interativo)return _nsS.apply(this,arguments);_nvSil++;try{return await _nsS.apply(this,arguments)}finally{_nvSil--;if(!_nvSil){try{nvBadge()}catch(_){}}}}}
{const _tS=toast;toast=function(m,tipo){if(_nvSil&&tipo!=='erro'&&/sincroniz|recebid|conflit|parte\(s\)|nuvem|fotografia|enviad/i.test(String(m)))return;return _tS.apply(this,arguments)}}
/* dados que chegam de outro aparelho: não redesenha a página por baixo do dedo */
{const _gS=go;go=function(v){if(_nvSil&&v===VIEW){const ae=document.activeElement;if(ae&&ae.closest&&ae.closest('#view,dialog')&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)||document.querySelector('dialog[open]:not(.nvas)')){_nvGoPend=v;return}try{return manterPosicao(()=>_gS.call(this,v))}catch(_){return _gS.call(this,v)}}return _gS.apply(this,arguments)};if(go._f)go._f=go._f}
document.addEventListener('focusout',()=>setTimeout(()=>{if(_nvGoPend&&!document.querySelector('dialog[open]')){const ae=document.activeElement;if(!(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))){const v=_nvGoPend;_nvGoPend=null;try{manterPosicao(()=>go(v))}catch(_){go(v)}}}},300));
/* código de encriptação lembrado neste aparelho para a mesma conta Google (mesmo depois de terminar a sessão) */
const NV_KEEP='eskeep';
function nvKeepGuardar(){try{const L=nvL();const em=String((gsCfg().email||(SESSAO&&SESSAO.u)||'')).toLowerCase();if(L.k&&L.salt&&em&&L.prov==='google')localStorage.setItem(NV_KEEP,JSON.stringify({e:em,k:L.k,salt:L.salt,t:Date.now()}))}catch(_){}}
function nvKeepRepor(){try{const L=nvL();if(L.k)return false;const K=JSON.parse(localStorage.getItem(NV_KEEP)||'null');if(!K)return false;const em=String((gsCfg().email||(SESSAO&&SESSAO.u)||'')).toLowerCase();if(!em||K.e!==em)return false;nvSet({k:K.k,salt:K.salt,prov:'google',base:null,mod:{}});_nvK=null;return true}catch(_){return false}}
setInterval(nvKeepGuardar,10000);setTimeout(nvKeepGuardar,3000);
{const _sn=sairNuvem;sairNuvem=async function(){nvKeepGuardar();return _sn.apply(this,arguments)}}

/* o código mudou noutro aparelho: a chave lembrada deixa de servir */
{const _nsK=nvSincronizar;nvSincronizar=async function(){const r=await _nsK.apply(this,arguments);try{if(!nvL().k){const K=JSON.parse(localStorage.getItem(NV_KEEP)||'null');if(K&&/não corresponde/.test(nvL().erro||''))localStorage.removeItem(NV_KEEP)}}catch(_){}return r}}
/* assistente: no fim fecha sozinho */
setInterval(()=>{const b=document.querySelector('dialog.nvas #nvas-fim');if(b&&!b.dataset.auto){b.dataset.auto=1;setTimeout(()=>{if(document.body.contains(b))b.click()},2500)}},500);

