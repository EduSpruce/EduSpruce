/* =====================================================================
   v0.91 · Acesso controlado pelo administrador · Nuvem obrigatória
          · Notificações (iPhone/iPad/computador) · Início e Painel no iPhone
   ===================================================================== */
const ES_MOVEL=()=>{try{return matchMedia('(max-width: 640px)').matches}catch(_){return false}};
const ES_PC_KEY='es.cfgc';

/* ---------- 1. política central (eduspruce-config.json) ---------- */
const AC_SAL='eduspruce:';
async function acHash(email){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(AC_SAL+String(email||'').trim().toLowerCase()));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
let _acCentralP=null,AC_CENTRAL=(()=>{try{return JSON.parse(localStorage.getItem(ES_PC_KEY)||'null')}catch(_){return null}})();
function acNorm(j){return {modo:String(j.acessoGoogle||'aberto'),contas:(Array.isArray(j.contasGoogle)?j.contasGoogle:[]).filter(x=>x&&x.h).map(x=>({h:String(x.h).toLowerCase(),papel:x.papel||'professor'})),dominios:(Array.isArray(j.dominiosGoogle)?j.dominiosGoogle:[]).map(d=>String(d).toLowerCase().replace(/^@/,'')),nuvem:String(j.modoNuvem||'opcional'),ok:true}}
function acCentral(forcar){if(_acCentralP&&!forcar)return _acCentralP;_acCentralP=(async()=>{if(!/^https?:/.test(location.protocol))return AC_CENTRAL;try{const r=await fetch('eduspruce-config.json',{cache:'no-cache'});if(!r.ok)return AC_CENTRAL;AC_CENTRAL=acNorm(await r.json());try{localStorage.setItem(ES_PC_KEY,JSON.stringify(AC_CENTRAL))}catch(_){}}catch(_){}nuvemObrigAplicar();return AC_CENTRAL})();return _acCentralP}
/* lista local (mantida pelo administrador neste aparelho, sincronizada com os dados dele) */
const acLocal=()=>{const A_=S.cfg.auth=S.cfg.auth||{};A_.gContas=Array.isArray(A_.gContas)?A_.gContas:[];return A_};
const acPapelNome=p=>{try{const x=perfis().find(z=>z.id===p);if(x)return x.nome}catch(_){}return {admin:'Administrador',direcao:'Direção',professor:'Professor'}[p]||p};
/* decide se o e-mail pode entrar; devolve o perfil (papel) ou lança erro */
async function acVerificar(email){email=String(email||'').toLowerCase();const C=await acCentral();const h=await acHash(email);const loc=acLocal();
  const lLoc=loc.gContas.find(x=>String(x.email).toLowerCase()===email);
  if(C&&C.modo==='lista'){const e=C.contas.find(x=>x.h===h);if(!e)throw acErro(email);return {papel:e.papel||(lLoc&&lLoc.papel)||'professor',fonte:'site'}}
  if(C&&C.modo==='dominio'&&C.dominios.length&&!C.dominios.some(d=>email.endsWith('@'+d)))throw acErro(email,'o domínio '+C.dominios.join(', '));
  if(loc.gModo==='lista'||loc.gContas.length){if(!lLoc)throw acErro(email);return {papel:lLoc.papel||'professor',fonte:'aparelho'}}
  return {papel:'professor',fonte:'aberto'}}
function acErro(email,qual){const e=new Error('A conta '+email+' não está autorizada a usar a EduSpruce'+(qual?' ('+qual+')':'')+'. Peça ao administrador para a acrescentar à lista de contas autorizadas.');e.semAcesso=true;return e}
/* sessões já guardadas: volta a confirmar ao abrir (o administrador pode ter retirado a conta) */
setTimeout(()=>{acCentral().then(async()=>{try{const s=sessaoAtual();if(!s||s.tipo!=='google')return;let r;try{r=await acVerificar(s.u)}catch(e){if(!e.semAcesso)return;try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY)}catch(_){}alert(e.message);location.reload();return}
  if(r&&r.papel&&r.papel!==s.papel){s.papel=r.papel;guardarSessao(s,!!localStorage.getItem(SESS_KEY));if(SESSAO)SESSAO.papel=r.papel;try{sessBox()}catch(_){}}}catch(e){console.warn(e)}})},300);

/* ---------- 2. nuvem obrigatória: só dados sincronizados com a conta Google ---------- */
const nuvemObrig=()=>!!(AC_CENTRAL&&AC_CENTRAL.nuvem==='obrigatorio'&&/^https:/.test(location.protocol));
function nuvemObrigAplicar(){const on=nuvemObrig();document.body.classList.toggle('nv-obrig',on);if(!on)return;
  try{const L=nvL();if(L.auto===false)nvSet({auto:true})}catch(_){}
  /* ecrã de entrada: só Google; a conta local fica como entrada de emergência do administrador */
  const lg=$('#login .lgb');if(lg&&!lg.querySelector('.lgemg')){const ou=lg.querySelector('.lgou');if(ou){ou.insertAdjacentHTML('beforebegin',`<p class="lgobr">${ic('shield',14)}<span>Neste site entra-se só com a <b>conta Google autorizada</b> pelo administrador. Os dados ficam encriptados na sua conta e sincronizados em todos os aparelhos.</span></p><button type="button" class="lgemg" title="Entrada do administrador (conta local)">Administrador</button>`);lg.querySelector('.lgemg').onclick=()=>lg.classList.toggle('emg')}}}
setInterval(()=>{if(nuvemObrig()&&$('#login .lgb')&&!$('#login .lgemg'))nuvemObrigAplicar()},700);
/* assistente: sem «Agora não» — sem nuvem não há app */
setInterval(()=>{if(!nuvemObrig()||!SESSAO)return;const d=$('dialog.nvas');if(d){const no=d.querySelector('#nvas-no');if(no&&!no.dataset.obr){no.dataset.obr=1;no.innerHTML=ic('back',14)+' Terminar Sessão';no.onclick=e=>{e.preventDefault();terminarSessao()}}if(!d.dataset.obr){d.dataset.obr=1;d.addEventListener('cancel',e=>e.preventDefault())}return}
  if(SESSAO.tipo==='google'){const L=nvL();if(!L.k&&!document.body.classList.contains('login-on')){try{sessionStorage.removeItem('es.assist')}catch(_){}try{if(L.prov!=='google')nvSet({prov:'google'});nvAssist(true)}catch(e){console.warn(e)}}}},1500);
/* painel de sincronização: sempre automático, sem «desligar» (só terminando a sessão) */
{const _bs=bindSync;bindSync=function(){const r=_bs.apply(this,arguments);try{if(nuvemObrig()){const au=$('#nv2-auto');if(au){au.checked=true;au.disabled=true;const lb=au.closest('label');if(lb)lb.title='Obrigatório neste site'}
  const of=$('#nv2-off');if(of){of.innerHTML=ic('back',14)+' Terminar Sessão e Limpar Aparelho';of.onclick=e=>{e.preventDefault();sairNuvem()}}
  const c=$('#nv-card');if(c&&!c.querySelector('.nvobr'))c.insertAdjacentHTML('afterbegin',`<div class="nvobr">${ic('shield',14)} Neste site a sincronização com a conta Google é obrigatória: os dados existem na sua conta (encriptados) e cada aparelho guarda apenas uma cópia de trabalho.</div>`)}}catch(e){console.warn(e)}return r}}
/* terminar sessão: sincroniza tudo e só depois limpa a cópia deste aparelho */
async function sairNuvem(){const L=nvL();let pend=Object.keys(L.mod||{}).length;
  if(L.k&&navigator.onLine){toast('A enviar as últimas alterações…');try{await nvSincronizar(true)}catch(_){}pend=Object.keys(nvL().mod||{}).length}
  if(pend||nvL().erro){const r=await avisoModal('Há alterações ainda por enviar',['Não foi possível sincronizar '+(pend||'algumas')+' alteração(ões) com o Google Drive.','Se limpar agora, essas alterações perdem-se. Ligue-se à internet e tente de novo.'],[{t:'Tentar Mais Tarde',c:'pri',v:null},{t:'Limpar Mesmo Assim',c:'dng',v:'sim'}]);if(r!=='sim')return}
  try{audit('Sessão','Sessão terminada e aparelho limpo',(SESSAO||{}).u||'');saveNow()}catch(_){}
  window.__efApagar=true;try{save=function(){};saveNow=function(){}}catch(_){}
  const _rm=Storage.prototype.removeItem;const _ks=Object.keys(localStorage).filter(k=>/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)&&k!==ES_PC_KEY);try{Storage.prototype.setItem=function(){}}catch(_){}
  try{_ks.forEach(k=>_rm.call(localStorage,k))}catch(_){}
  try{Object.keys(localStorage).filter(k=>/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)&&k!==ES_PC_KEY).forEach(k=>localStorage.removeItem(k))}catch(_){}
  try{sessionStorage.clear()}catch(_){}
  try{const D=indexedDB.databases?await indexedDB.databases():[];await Promise.all([...D.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  location.reload()}
{const _ts=terminarSessao;terminarSessao=function(){if(nuvemObrig()&&SESSAO&&SESSAO.tipo==='google')return sairNuvem();return _ts.apply(this,arguments)}}

/* ---------- 3. Definições › Conta e Acesso: quem pode entrar com Google ---------- */
async function acCartao(){const C=await acCentral();const loc=acLocal();try{const su=SESSAO&&SESSAO.tipo==='google'&&String(SESSAO.u).toLowerCase();if(su&&C&&C.contas.length&&!loc.gContas.some(x=>x.email===su)){const hh=await acHash(su);const e=C.contas.find(x=>x.h===hh);if(e){loc.gContas.unshift({email:su,nome:SESSAO.nome||'',papel:e.papel,desde:Date.now()});save()}}}catch(_){}const hs={};for(const x of loc.gContas)hs[x.email]=await acHash(x.email);
  const noSite=e=>C&&C.contas.some(z=>z.h===hs[e.email]);const nSite=C?C.contas.length:0;const adm=SESSAO&&SESSAO.papel==='admin';
  const est=!C?`<span class="tag">configuração do site indisponível (ficheiro local)</span>`:C.modo==='lista'?`<span class="tag ok">${ic('shield',12)} Só contas autorizadas · ${nSite} no site</span>`:C.modo==='dominio'?`<span class="tag">Só o domínio ${esc(C.dominios.join(', '))}</span>`:`<span class="tag bad">${ic('alert',12)} Qualquer conta Google pode entrar</span>`;
  const PF=(()=>{try{return perfis()}catch(_){return [{id:'admin',nome:'Administrador'},{id:'professor',nome:'Professor'}]}})();
  return `<div class="card" id="ac-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('shield',18)} Quem Pode Entrar com Google</h2><span class="sp1"></span>${est}</div>
   <p class="hint" style="margin:8px 0 12px">Só entram as contas Google que o administrador autorizar — não basta ter uma conta Google. A lista do site está no ficheiro <code>eduspruce-config.json</code> e guarda apenas uma impressão digital (SHA-256) de cada e-mail, nunca o e-mail. Cada conta recebe um perfil: o Professor vê só as suas turmas, a Direção vê todas, o Administrador gere tudo.${nuvemObrig()?' <b>Neste site os dados só existem sincronizados com a conta Google</b> (não há dados apenas locais).':''}</p>
   ${adm?`<div class="acl">${loc.gContas.map((x,i)=>`<div class="acr"><div class="acrn"><b>${esc(x.email)}</b><small>${esc(x.nome||'')}${noSite(x)?` <span class="tag ok">${ic('check',11)} publicado</span>`:' <span class="tag w">por publicar</span>'}</small></div><select data-acp="${i}" aria-label="Perfil de ${esc(x.email)}">${PF.map(p=>`<option value="${p.id}" ${p.id===(x.papel||'professor')?'selected':''}>${esc(p.nome)}</option>`).join('')}</select><button class="btn sm ico dng" data-acx="${i}" aria-label="Retirar ${esc(x.email)}">${ic('trash',14)}</button></div>`).join('')||'<p class="mut" style="margin:0">Ainda não acrescentou contas.</p>'}</div>
     <div class="acadd"><input type="email" id="ac-e" placeholder="email@escola.pt" autocapitalize="none" spellcheck="false" aria-label="E-mail da conta Google"><input id="ac-n" placeholder="Nome (opcional)" aria-label="Nome"><select id="ac-pp" aria-label="Perfil">${PF.map(p=>`<option value="${p.id}" ${p.id==='professor'?'selected':''}>${esc(p.nome)}</option>`).join('')}</select><button class="btn pri" id="ac-add">${ic('plus',15)} Autorizar</button><button class="btn" id="ac-col">${ic('paste',15)} Colar Lista…</button></div>
     <div class="acpub"><div><b>Publicar no site</b><small>Descarregue o ficheiro e substitua <code>eduspruce-config.json</code> no alojamento (no GitHub: abrir o ficheiro › lápis › colar › Commit). A mudança vale para todos os aparelhos em menos de um minuto.${C&&C.modo==='lista'&&loc.gContas.length&&!loc.gContas.some(x=>noSite(x)&&x.papel==='admin')?'<br><b class="neg">Atenção:</b> inclua pelo menos um Administrador, ou ninguém poderá gerir a lista.':''}</small></div><button class="btn pri" id="ac-dl">${ic('download',15)} Descarregar a Configuração</button></div>
     <details class="acmais"><summary>Mais segurança: a própria Google também pode filtrar</summary><p class="hint">A lista acima é verificada pela app. Para que a <b>Google</b> recuse logo outras contas, em Google Auth Platform › <b>Público</b> deixe a app em «Em teste» e acrescente as mesmas contas em «Utilizadores de teste» (até 100), ou escolha «Interno» se todos tiverem conta Google Workspace da escola.</p></details>`
   :`<p class="mut">Só o administrador pode alterar a lista.</p>`}</div>`}
function acBind(){const loc=acLocal();const re=()=>{const c=$('#ac-card');if(!c)return;acCartao().then(h=>{c.outerHTML=h;acBind()})};
  const add=(email,nome,papel)=>{email=String(email||'').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return false;const x=loc.gContas.find(z=>z.email===email);if(x){if(nome)x.nome=nome;if(papel)x.papel=papel}else loc.gContas.push({email,nome:nome||'',papel:papel||'professor',desde:Date.now()});return true};
  const b=$('#ac-add');if(b)b.onclick=()=>{if(!add($('#ac-e').value,$('#ac-n').value.trim(),$('#ac-pp').value))return toast('Escreva um e-mail válido','erro');save();audit('Contas','Conta Google autorizada',$('#ac-e').value.trim());re()};
  const ae=$('#ac-e');if(ae)ae.onkeydown=e=>{if(e.key==='Enter')b.click()};
  const col=$('#ac-col');if(col)col.onclick=()=>{const t=prompt('Cole os e-mails (um por linha; opcional: «email; nome; admin|direcao|professor»):');if(!t)return;let n=0;t.split(/\n|,(?=[^;]*@)/).forEach(l=>{const [e,nm,p]=l.split(/[;\t]/).map(x=>(x||'').trim());if(add(e,nm,['admin','direcao','professor'].includes(p)?p:null))n++});save();toast(n+' conta(s) autorizada(s)','ok');re()};
  $$('[data-acp]').forEach(s=>s.onchange=()=>{loc.gContas[+s.dataset.acp].papel=s.value;save();re()});
  $$('[data-acx]').forEach(x=>x.onclick=()=>{const c=loc.gContas[+x.dataset.acx];if(SESSAO&&SESSAO.u===c.email&&!confirm('Esta é a sua conta. Retirá-la impede-o de entrar com Google depois de publicar. Continuar?'))return;loc.gContas.splice(+x.dataset.acx,1);save();audit('Contas','Conta Google retirada',c.email);re()});
  const dl=$('#ac-dl');if(dl)dl.onclick=async()=>{if(!loc.gContas.some(x=>x.papel==='admin')&&!confirm('Nenhuma conta tem o perfil Administrador. Publicar mesmo assim?'))return;
    const contas=[];for(const x of loc.gContas)contas.push({h:await acHash(x.email),papel:x.papel||'professor'});
    const C=AC_CENTRAL||{};const j={microsoftClientId:NV_CENTRAL.ms||'',googleClientId:NV_CENTRAL.google||'',acessoGoogle:'lista',modoNuvem:C.nuvem||'obrigatorio',contasGoogle:contas};
    download('eduspruce-config.json',JSON.stringify(j,null,2)+'\n','application/json');audit('Contas','Lista de contas exportada para o site',contas.length+' contas')}}
{const _dc=defConta;defConta=function(){return `<div id="ac-slot"></div>`+_dc.apply(this,arguments)};const _bc=bindConta;bindConta=function(){const r=_bc.apply(this,arguments);acCartao().then(h=>{const s=$('#ac-slot');if(s){s.outerHTML=h;acBind()}});return r}}

/* ---------- 4. Notificações ---------- */
const NT_DEF={aulas:true,ante:5,sumario:true,resumo:true,resumoH:'07:45',testes:true,testesH:'18:00',urgentes:true,badge:true,silDe:'22:00',silAte:'07:30',fds:true};
const ntCfg=()=>{S.cfg.notif=Object.assign({},NT_DEF,S.cfg.notif||{});return S.cfg.notif};
let _ntSW=null;
function ntRegistarSW(){if(_ntSW||!('serviceWorker' in navigator)||!/^https:/.test(location.protocol))return _ntSW;_ntSW=navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(e=>{console.warn('sw',e);return null});return _ntSW}
ntRegistarSW();
try{navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};if(d.es==='ir'&&d.v)ntIr(d.v,d.t)})}catch(_){}
function ntIr(v,tid){try{if(tid&&A()&&A().turmas.some(x=>x.id===tid)){S.turmaAtiva=tid;save()}go(v)}catch(_){}}
{const q=new URLSearchParams(location.search);if(q.get('ir')){const v=q.get('ir'),t=q.get('t');history.replaceState(null,'',location.pathname);setTimeout(()=>{if(SESSAO)ntIr(v,t)},2500)}}
const ntSuporta=()=>'Notification' in window;
function ntEstado(){if(!/^https:/.test(location.protocol))return 'local';if(!ntSuporta())return nvIOS()&&!nvStandalone()?'instalar':'nao';return Notification.permission}
async function ntMostrar(titulo,corpo,o){o=o||{};if(!ntSuporta()||Notification.permission!=='granted')return false;
  const opt={body:corpo||'',tag:o.tag||('es-'+Date.now()),icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{v:o.v||'inicio',t:o.t||''},renotify:!!o.tag};
  try{const r=await (ntRegistarSW()||Promise.resolve(null));const reg=r&&(await navigator.serviceWorker.ready);if(reg&&reg.showNotification){await reg.showNotification(titulo,opt);return true}}catch(e){console.warn(e)}
  try{const n=new Notification(titulo,opt);n.onclick=()=>{window.focus();ntIr(opt.data.v,opt.data.t);n.close()};return true}catch(_){return false}}
/* os avisos que já existiam (reuniões, avisos urgentes) passam a usar o serviço de notificações (necessário no iPhone/iPad) */
window.__ntNotif=function(t,o){o=o||{};if(!ntCfg().urgentes)return;ntMostrar(t,o.body,{tag:o.tag,v:/Reuni/.test(t)?'reunioes':'inicio'})};
const ntMin=s=>{const [h,m]=String(s||'0:0').split(':').map(Number);return h*60+(m||0)};
function ntSilencio(d){const c=ntCfg();const m=d.getHours()*60+d.getMinutes();const a=ntMin(c.silDe),b=ntMin(c.silAte);const sil=a>b?(m>=a||m<b):(m>=a&&m<b);return sil||(c.fds&&(d.getDay()===0||d.getDay()===6))}
const ntEnv=()=>{try{return JSON.parse(localStorage.getItem('es.nt.env')||'{}')}catch(_){return {}}};
function ntMarca(k){const E=ntEnv();E[k]=Date.now();const lim=Date.now()-4*864e5;Object.keys(E).forEach(x=>{if(E[x]<lim)delete E[x]});try{localStorage.setItem('es.nt.env',JSON.stringify(E))}catch(_){}}
/* o que deve ser notificado agora (aulas, sumários em falta, resumo do dia, testes de amanhã) */
function ntAgora(){const c=ntCfg();const a=A();if(!a)return [];const agora=new Date();const mins=agora.getHours()*60+agora.getMinutes();const hj=isoData(agora);const L=[];
  let D=null;try{D=meuDiaDados(0)}catch(_){}
  if(D){const AU=D.ev.filter(e=>e.tp==='aula'&&!e.falta);
    if(c.aulas)AU.forEach(e=>{const ant=+c.ante||5;if(mins>=e.h-ant&&mins<e.h+2)L.push({k:'a:'+hj+':'+e.t.id+':'+e.h,t:(mins>=e.h?'A começar: ':'Daqui a '+(e.h-mins)+' min: ')+e.t.nome+' · '+e.t.disciplina,b:[fmtHM(e.h)+'–'+fmtHM(e.f),e.sala?'Sala '+e.sala:'',e.x.licao?'Lição '+e.x.licao:''].filter(Boolean).join(' · '),v:'sumarios',tid:e.t.id})});
    if(c.sumario)AU.forEach(e=>{if(!e.sum&&mins>=e.f+2&&mins<e.f+90)L.push({k:'s:'+hj+':'+e.t.id+':'+e.h,t:'Sumário por escrever · '+e.t.nome,b:e.t.disciplina+' · aula das '+fmtHM(e.h)+(e.x.licao?' · Lição '+e.x.licao:''),v:'sumarios',tid:e.t.id})});
    if(c.resumo&&mins>=ntMin(c.resumoH)&&mins<ntMin(c.resumoH)+120){const nA=AU.length,nR=D.ev.filter(e=>e.tp==='reun').length,nT=D.ev.filter(e=>e.tp==='tar').length,nV=D.ev.filter(e=>e.tp==='aval').length;
      if(nA+nR+nT+nV){const pr=AU[0];L.push({k:'r:'+hj,t:'Hoje: '+[nA?nA+' aula'+(nA>1?'s':''):'',nR?nR+' reunião'+(nR>1?'ões':''):'',nV?nV+' avaliação'+(nV>1?'ões':''):'',nT?nT+' tarefa'+(nT>1?'s':''):''].filter(Boolean).join(' · '),b:pr?'Primeira aula às '+fmtHM(pr.h)+': '+pr.t.nome+' · '+pr.t.disciplina:'Bom dia!',v:'inicio'})}}}
  if(c.testes&&mins>=ntMin(c.testesH)&&mins<ntMin(c.testesH)+180){const am=isoData(new Date(agora.getTime()+864e5));const T_=[];try{turmasFiltradas(a).forEach(t=>t.instrumentos.forEach(i=>{if(i.data===am)T_.push(i.nome+' · '+t.nome)}))}catch(_){}
    if(T_.length)L.push({k:'t:'+am,t:'Amanhã: '+T_.length+' avaliação'+(T_.length>1?'ões':''),b:T_.slice(0,4).join('\n'),v:'testes'})}
  return L}
function ntBadge(){if(!ntCfg().badge||!navigator.setAppBadge)return;try{let n=0;try{n=avisosUrgentes().length}catch(_){}n?navigator.setAppBadge(n):navigator.clearAppBadge()}catch(_){}}
function ntTick(){if(!SESSAO||document.body.classList.contains('login-on'))return;ntBadge();if(ntEstado()!=='granted')return;const agora=new Date();if(ntSilencio(agora))return;const E=ntEnv();
  ntAgora().forEach(x=>{if(E[x.k])return;ntMarca(x.k);if(document.visibilityState==='visible'){toast(x.t,'ok');return}ntMostrar('EduSpruce — '+x.t,x.b,{tag:x.k,v:x.v,t:x.tid})})}
setInterval(ntTick,30000);document.addEventListener('visibilitychange',()=>setTimeout(ntTick,800));setTimeout(ntTick,6000);
/* lembretes para o Calendário (funcionam com a app fechada) */
function ntICS(dias){dias=dias||45;const a=A();if(!a)return '';const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+dias*864e5));const ev=[];const dt=(iso,hm)=>{const d=dataDeIso(iso);d.setHours(Math.floor(hm/60),hm%60,0,0);return d};
  const add=(uid,ini,fim,t,desc,alarmes,loc)=>ev.push(['BEGIN:VEVENT','UID:'+uid+'@eduspruce.app','DTSTAMP:'+icsData(new Date()),'DTSTART:'+icsData(ini),'DTEND:'+icsData(fim),'SUMMARY:'+icsEsc(t),desc?'DESCRIPTION:'+icsEsc(desc):'',loc?'LOCATION:'+icsEsc(loc):'',...alarmes.map(m=>['BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(t),'TRIGGER:-PT'+m+'M','END:VALARM'].join('\r\n')),'END:VEVENT'].filter(Boolean).join('\r\n'));
  try{reunioes(a).filter(r=>reunAtiva(r)&&r.data>=hj&&r.data<=lim).forEach(r=>{const i=r.semHora?dt(r.data,540):dt(r.data,r.ini||540);const f=r.semHora?dt(r.data,600):dt(r.data,r.fim||(r.ini||540)+60);add('reun-'+r.id,i,f,reunTitulo(r,a),Array.isArray(r.ordem)?r.ordem.map((x,k)=>(k+1)+'. '+(typeof x==='string'?x:(x.t||x.texto||''))).join('\n'):'',(r.lembretes&&r.lembretes.length?r.lembretes:[60]).slice(0,3),r.local||r.link||'')})}catch(e){console.warn(e)}
  try{turmasFiltradas(a).forEach(t=>t.instrumentos.filter(i=>i.data&&i.data>=hj&&i.data<=lim).forEach(i=>{const d=dt(i.data,480);add('inst-'+t.id+'-'+i.id,d,dt(i.data,490),i.nome+' · '+t.nome+' · '+t.disciplina,'Avaliação marcada na EduSpruce',[14*60],'')}))}catch(e){console.warn(e)}
  try{tarefas().filter(x=>!x.feito&&x.prazo&&x.prazo>=hj&&x.prazo<=lim).forEach(x=>add('tar-'+x.id,dt(x.prazo,540),dt(x.prazo,555),'Tarefa: '+x.t,x.notas||'',[0],''))}catch(_){}
  try{avisosM().filter(x=>!x.feito&&x.quando&&x.quando>=hj).forEach(x=>{const d=new Date(x.quando);add('avi-'+x.id,d,new Date(d.getTime()+6e5),'Aviso: '+x.t,x.txt||'',[0],'')})}catch(_){}
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//Lembretes//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:EduSpruce',...ev,'END:VCALENDAR'].join('\r\n')}
function ntICSdl(){const t=ntICS(45);const n=(t.match(/BEGIN:VEVENT/g)||[]).length;if(!n)return toast('Não há reuniões, avaliações, tarefas ou avisos nos próximos 45 dias','aviso');download('EduSpruce-lembretes.ics',t,'text/calendar');toast(n+' lembrete(s) exportado(s) — abra o ficheiro para os juntar ao Calendário','ok')}
async function ntAtivar(){if(!ntSuporta()){toast('Instale primeiro a app no ecrã principal','aviso');return}const p=await Notification.requestPermission();if(p==='granted'){ntRegistarSW();await ntMostrar('EduSpruce','As notificações estão ativas neste aparelho.',{tag:'es-ok'});toast('Notificações ativadas','ok')}else toast('As notificações não foram autorizadas','aviso');if(VIEW==='definicoes')vDefinicoes();if(VIEW==='inicio')go('inicio')}
function ntPassos(){const e=ntEstado();const ios=nvIOS();
  if(e==='granted')return `<div class="ntok">${ic('check',16)} <b>Ativas neste aparelho.</b> <span class="mut">Recebe avisos com a app aberta ou em segundo plano.</span></div>`;
  if(e==='local')return `<div class="alert w">${ic('alert',14)} As notificações só funcionam com a app no seu endereço https (eduspruce.pt).</div>`;
  if(e==='instalar')return `<ol class="ntst"><li>No Safari, toque em <b>Partilhar</b> (o quadrado com a seta) › <b>Adicionar ao ecrã principal</b>.</li><li>Abra a EduSpruce a partir do <b>ícone</b> no ecrã principal.</li><li>Volte aqui (Definições › Notificações) e toque em <b>Ativar Notificações</b>.</li></ol><p class="hint">No iPhone e no iPad, a Apple só permite notificações de apps web adicionadas ao ecrã principal (iOS 16.4 ou mais recente).</p>`;
  if(e==='denied')return `<div class="alert w">${ic('alert',14)} As notificações estão bloqueadas. ${ios?'Abra <b>Ajustes › Notificações › EduSpruce</b> e ative «Permitir notificações».':'Nas definições do navegador, permita notificações para eduspruce.pt.'}</div>`;
  if(e==='nao')return `<div class="alert w">${ic('alert',14)} Este navegador não suporta notificações. Use o Calendário (abaixo).</div>`;
  return `<button class="btn pri" id="nt-on">${ic('bell',16)} Ativar Notificações</button>`}
/* ícone de cada disciplina (bandeiras desenhadas para as línguas; símbolo para as restantes) */
function discIc(n){const x=String(n||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const fl=(inner)=>`<svg class="discfl" viewBox="0 0 30 20" width="24" height="16" aria-hidden="true">${inner}</svg>`;
  if(/ingl/.test(x))return fl('<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6.6"/><path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="4"/>');
  if(/franc/.test(x))return fl('<rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#EF4135"/>');
  if(/espanh|castelh/.test(x))return fl('<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>');
  if(/alem/.test(x))return fl('<rect width="30" height="6.67" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/>');
  if(/portugu|plnm/.test(x))return fl('<rect width="12" height="20" fill="#046A38"/><rect x="12" width="18" height="20" fill="#DA291C"/><circle cx="12" cy="10" r="3.6" fill="#FFE900"/>');
  const M=[[/matem|macs/,'📐'],[/fisic|quimic|fq/,'⚗️'],[/biolog|geolog|ciencias nat|^cn/,'🧬'],[/cienc/,'🔬'],[/geograf/,'🌍'],[/histor|hgp/,'🏛️'],[/visual|desenh|arte|\bev\b/,'🎨'],[/music/,'🎵'],[/educacao fis|desport|\bef\b/,'⚽'],[/tic|inform|program|aplicac/,'💻'],[/filosof|psicol/,'🧠'],[/econom|gest|contab/,'💼'],[/cidadan|formacao civ/,'🤝'],[/moral|relig|emr/,'🕊️'],[/tecnol|\bet\b/,'🛠️'],[/teatro|drama|expressao/,'🎭']];
  const m=M.find(([r])=>r.test(x));return `<span class="discem" aria-hidden="true">${m?m[1]:'📘'}</span>`}
function defNotif(){const c=ntCfg();const tg=(k,l,s)=>`<label class="nvsw"><input type="checkbox" data-ntk="${k}" ${c[k]?'checked':''}><span class="nvswk" aria-hidden="true"></span><span><b>${l}</b><small>${s}</small></span></label>`;
  return `<div class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('bell',18)} Notificações Neste Aparelho</h2><span class="sp1"></span>${ntEstado()==='granted'?`<button class="btn sm" id="nt-test">${ic('bell',13)} Testar</button>`:''}</div><div style="margin-top:12px">${ntPassos()}</div></div>
  <div class="card"><h2>${ic('sliders',18)} O Que Notificar</h2><div class="ntlist">
    <div class="ntrow">${tg('aulas','Aula a começar','Antes de cada aula do seu horário')}<label class="ntsel">Antecedência <select id="nt-ante">${[0,5,10,15].map(m=>`<option value="${m}" ${+c.ante===m?'selected':''}>${m?m+' min':'à hora'}</option>`).join('')}</select></label></div>
    <div class="ntrow">${tg('sumario','Sumário por escrever','Logo a seguir a uma aula sem sumário')}</div>
    <div class="ntrow">${tg('resumo','Resumo do dia','Aulas, reuniões, avaliações e tarefas de hoje')}<label class="ntsel">Hora <input type="time" id="nt-rh" value="${esc(c.resumoH)}"></label></div>
    <div class="ntrow">${tg('testes','Avaliações de amanhã','Testes, questões-aula e trabalhos marcados')}<label class="ntsel">Hora <input type="time" id="nt-th" value="${esc(c.testesH)}"></label></div>
    <div class="ntrow">${tg('urgentes','Avisos urgentes e reuniões','Os lembretes de cada reunião e os avisos urgentes')}</div>
    <div class="ntrow">${tg('badge','Número no ícone da app','Quantos avisos urgentes há por tratar')}</div></div></div>
  <div class="card"><h2>${ic('moon',18)} Silêncio</h2><div class="row" style="gap:12px;flex-wrap:wrap"><label class="ntsel">Das <input type="time" id="nt-sd" value="${esc(c.silDe)}"></label><label class="ntsel">às <input type="time" id="nt-sa" value="${esc(c.silAte)}"></label>${tg('fds','Fins de semana em silêncio','Sábado e domingo sem notificações')}</div></div>
  <div class="card"><h2>${ic('calendar',18)} Com a App Fechada</h2><p class="hint" style="margin:0 0 10px">O iPhone e o iPad suspendem as apps web quando são fechadas — e a EduSpruce não tem servidores com os seus dados para enviar avisos. Para não perder nada, junte os lembretes ao <b>Calendário</b>: reuniões (com os alarmes de cada uma), avaliações (na véspera às 18:00), tarefas e avisos dos próximos 45 dias. Volte a exportar quando marcar coisas novas.</p><button class="btn pri" id="nt-ics">${ic('calendar',15)} Juntar ao Calendário (.ics)</button></div>`}
function bindNotif(){const c=ntCfg();const on=$('#nt-on');if(on)on.onclick=ntAtivar;const ts=$('#nt-test');if(ts)ts.onclick=()=>ntMostrar('EduSpruce — teste','Assim aparece uma notificação.',{tag:'es-teste'}).then(ok=>{if(!ok)toast('Não foi possível mostrar a notificação','erro')});
  $$('[data-ntk]').forEach(x=>x.onchange=()=>{c[x.dataset.ntk]=x.checked;save();if(x.dataset.ntk==='badge'&&!x.checked)try{navigator.clearAppBadge&&navigator.clearAppBadge()}catch(_){}});
  [['nt-ante','ante'],['nt-rh','resumoH'],['nt-th','testesH'],['nt-sd','silDe'],['nt-sa','silAte']].forEach(([id,k])=>{const e=$('#'+id);if(e)e.onchange=()=>{c[k]=k==='ante'?+e.value:e.value;save()}});
  const ic_=$('#nt-ics');if(ic_)ic_.onclick=ntICSdl}
/* separador «Notificações» nas Definições */
{const _vd=vDefinicoes;vDefinicoes=function(){const t=UI.defTab;let r;if(t==='notif'){UI.defTab='auditoria';r=_vd.apply(this,arguments);UI.defTab='notif';const tabs=$('#view .deftabs');$('#view').innerHTML='';if(tabs)$('#view').appendChild(tabs);$('#view').insertAdjacentHTML('beforeend',defNotif());bindNotif()}else r=_vd.apply(this,arguments);
  try{const tb=$('#view .deftabs');if(tb&&!tb.querySelector('[data-dtn]')){const ref=tb.querySelector('[data-dt2="sync"]');const b=document.createElement('button');b.dataset.dtn='1';b.innerHTML=ic('bell',15)+' Notificações';ref?ref.after(b):tb.appendChild(b);b.onclick=()=>{UI.defTab='notif';vDefinicoes()}}
    if(t==='notif'&&tb){tb.querySelectorAll('button').forEach(x=>x.classList.toggle('on',!!x.dataset.dtn))}}catch(_){}return r};if(go._f)go._f.definicoes=vDefinicoes}

/* ---------- 5. Início no iPhone ---------- */
const imSaud=()=>{const h=new Date().getHours();return h<12?'Bom dia':h<20?'Boa tarde':'Boa noite'};
const imMin=m=>m>=60?Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''):m+' min';
function imProxTurma(t,a){try{const hj=isoData(new Date());const m=new Date().getHours()*60+new Date().getMinutes();const x=listaAulas(t,a).find(z=>(z.data>hj||(z.data===hj&&z.fim>m))&&!(z.falta&&!z.falta.subst));if(!x)return '';const d=dataDeIso(x.data);const dd=x.data===hj?'Hoje':diasEntre(hj,x.data)===1?'Amanhã':DIAS_C[d.getDay()]+' '+d.getDate();return dd+' · '+fmtHM(x.ini)}catch(_){return ''}}
function imSemSum(t,a){try{return listaAulas(t,a).filter(x=>x.licao&&x.passada&&!(x.falta&&!x.falta.subst)&&!((x.s&&x.s.texto)||'').trim()).length}catch(_){return 0}}
function vInicioMovel(){const a=A();const s=SESSAO||{};const nome=(S.cfg.professor||s.nome||'').trim().split(/\s+/)[0]||'';const hoje=new Date();
  if(!a){$('#view').innerHTML=`<div class="im"><div class="card"><h2>${imSaud()}${nome?', '+esc(nome):''}</h2><p class="mut">Comece por criar o ano letivo e as turmas.</p><button class="btn pri" data-imgo="turmas">Ano Letivo e Turmas</button></div></div>`;return imBind()}
  const off=UI.imOff||0;const D=meuDiaDados(off);const mins=hoje.getHours()*60+hoje.getMinutes();const AU=D.ev.filter(e=>e.tp==='aula');
  const atual=off===0?AU.find(e=>e.h<=mins&&e.f>mins&&!e.falta):null;const prox=off===0?AU.find(e=>e.h>mins&&!e.falta):null;
  let hero='';
  if(atual){const pc=Math.round((mins-atual.h)/(atual.f-atual.h)*100);hero=`<section class="imhero now" style="--tc:${'var(--acc)'}"><div class="imhl">${ic('clock',14)} A decorrer · até às ${fmtHM(atual.f)}</div><button type="button" class="imht" data-imt="${atual.t.id}">${anoBadge(atual.t)}<span><b>${esc(atual.t.nome)}</b><small>${esc(atual.t.disciplina)}${atual.sala?' · Sala '+esc(atual.sala):''}${atual.x.licao?' · Lição '+atual.x.licao:''}</small></span></button><div class="imbar"><i style="width:${pc}%"></i></div><div class="imha"><button class="btn pri" data-imsum="${atual.t.id}|${atual.x.k}">${ic('pen',15)} Sumário</button><button class="btn" data-impres="${atual.t.id}|${atual.x.k}">${ic('users',15)} Presenças</button></div></section>`}
  else if(prox){hero=`<section class="imhero"><div class="imhl">${ic('clock',14)} Próxima aula daqui a <b>${imMin(prox.h-mins)}</b> · ${fmtHM(prox.h)}</div><button type="button" class="imht" data-imt="${prox.t.id}">${anoBadge(prox.t)}<span><b>${esc(prox.t.nome)}</b><small>${esc(prox.t.disciplina)}${prox.sala?' · Sala '+esc(prox.sala):''}${prox.x.licao?' · Lição '+prox.x.licao:''}</small></span></button><div class="imha"><button class="btn" data-imt="${prox.t.id}">${ic('grid',15)} Abrir Turma</button><button class="btn" data-imsum="${prox.t.id}|${prox.x.k}">${ic('pen',15)} Preparar Sumário</button></div></section>`}
  else if(off===0&&AU.length){hero=`<section class="imhero fim"><div class="imhl">${ic('check',14)} Aulas de hoje terminadas</div><p>${D.semSum?`Falta${D.semSum>1?'m':''} <b>${D.semSum} sumário${D.semSum>1?'s':''}</b>.`:'Todos os sumários escritos. Bom trabalho!'}</p>${D.semSum?`<div class="imha"><button class="btn pri" data-imgo="sumarios">${ic('pen',15)} Escrever Sumários</button></div>`:''}</section>`}
  else if(off===0){hero=`<section class="imhero livre"><div class="imhl">${ic('sun',14)} Sem aulas hoje</div><p>${D.ev.length?'Veja abaixo o que tem para hoje.':'Dia livre de aulas e de compromissos.'}</p></section>`}
  /* atenção */
  let urg=[];try{urg=avisosUrgentes()}catch(_){}const tAtr=tarefas().filter(x=>!x.feito&&x.prazo&&x.prazo<isoData(hoje)).length;
  let sumF=0;try{turmasFiltradas(a).forEach(t=>sumF+=imSemSum(t,a))}catch(_){}
  let mz=0;try{mz=matrizes(a).filter(x=>!x.enviada&&x.data<=isoData(hoje)).length}catch(_){}
  const pills=[urg.length?`<button class="impl bad" data-imav="1">${ic('bell',14)} ${urg.length} aviso${urg.length>1?'s':''}</button>`:'',tAtr?`<button class="impl w" data-imgo="tarefas">${ic('checks',14)} ${tAtr} tarefa${tAtr>1?'s':''} em atraso</button>`:'',sumF?`<button class="impl w" data-imgo="sumarios">${ic('pen',14)} ${sumF} sumário${sumF>1?'s':''} por escrever</button>`:'',mz?`<button class="impl" data-imgo="testes">${ic('file',14)} ${mz} matriz${mz>1?'es':''} por enviar</button>`:''].filter(Boolean);
  /* notificações (iPhone instalado, ainda por decidir) */
  const ntE=ntEstado();const ntPede=(ntE==='default'||ntE==='instalar')&&!S.cfg.ntDispensa;
  /* linha do tempo compacta */
  const evs=D.ev.filter(e=>e.tp!=='furo');const abertos=UI.imTudo;const lista=abertos?evs:evs.slice(0,5);
  const li=e=>{if(e.tp==='aula'){const st=e.falta?'<span class="tag bad">falta</span>':e.x.passada?(e.sum?`<span class="tag ok">${ic('check',10)}</span>`:'<span class="tag w">sem sumário</span>'):'';const cur=off===0&&e.h<=mins&&e.f>mins;
      return `<li class="imli ${cur?'cur':''} ${off===0&&e.f<=mins?'pas':''}"><span class="imh">${fmtHM(e.h)}</span><button type="button" class="imlb" data-imt="${e.t.id}">${anoBadge(e.t,'sm')}<span><b>${esc(e.t.nome)}</b> <small>${esc(e.t.disciplina)}${e.sala?' · '+esc(e.sala):''}</small></span></button>${st}</li>`}
    if(e.tp==='reun')return `<li class="imli"><span class="imh">${e.h<0?'—':fmtHM(e.h)}</span><button type="button" class="imlb" data-imreun="${e.r.id}"><span class="imic" style="--c:#0f8b8d">${ic('meet',13)}</span><span><b>${esc(reunTitulo(e.r,a))}</b>${e.r.local?' <small>'+esc(e.r.local)+'</small>':''}</span></button></li>`;
    if(e.tp==='aval')return `<li class="imli"><span class="imh">${ic('target',13)}</span><button type="button" class="imlb" data-iminst="${e.t.id}|${e.i.id}"><span><b>${esc(e.i.nome)}</b> <small>${esc(e.t.nome)}</small></span></button></li>`;
    if(e.tp==='tar')return `<li class="imli"><span class="imh"><input type="checkbox" data-imtk="${e.x.id}" aria-label="Feita"></span><span class="imlb"><span><b class="${e.atraso?'neg':''}">${esc(e.x.t)}</b>${e.atraso?' <small class="neg">em atraso</small>':''}</span></span></li>`;
    if(e.tp==='matriz')return `<li class="imli"><span class="imh">${ic('file',13)}</span><button type="button" class="imlb" data-imgo="testes"><span><b>Enviar matriz</b> <small>${esc(e.m.i.nome)} · ${esc(e.m.t.nome)}</small></span></button></li>`;
    if(e.tp==='aniv')return `<li class="imli"><span class="imh">🎂</span><span class="imlb"><span><b>${esc(e.v.x.nome)}</b> <small>faz anos · ${esc((e.v.turmas||[]).join(', '))}</small></span></span></li>`;return ''};
  const rot=off===0?'Hoje':off===1?'Amanhã':off===-1?'Ontem':DIAS[D.d.getDay()];
  /* próximos dias */
  const hj=isoData(hoje),lim=isoData(new Date(Date.now()+7*864e5));const PX=[];
  try{proximosTestes(a,7).filter(x=>x.i.data>hj).forEach(x=>PX.push({d:x.i.data,ic:'target',t:x.i.nome,s:x.t.nome+' · '+x.t.disciplina,at:`data-iminst="${x.t.id}|${x.i.id}"`}))}catch(_){}
  try{reunioes(a).filter(r=>reunAtiva(r)&&r.data>hj&&r.data<=lim).forEach(r=>PX.push({d:r.data,ic:'meet',t:reunTitulo(r,a),s:(r.semHora?'':fmtHM(r.ini))+(r.local?' · '+r.local:''),at:`data-imreun="${r.id}"`}))}catch(_){}
  try{tarefas().filter(x=>!x.feito&&x.prazo>hj&&x.prazo<=lim).forEach(x=>PX.push({d:x.prazo,ic:'checks',t:x.t,s:'tarefa',at:'data-imgo="tarefas"'}))}catch(_){}
  PX.sort((x,y)=>x.d.localeCompare(y.d));
  /* turmas */
  const TF=turmasFiltradas(a);
  /* período */
  let per='';try{const f=fimPeriodoAlvo(a);if(f&&!f.antes){const r=resumoPeriodoAtual(a.calendario);const tot=f.p.dias,rest=r.rest;const pc=Math.round(100*(tot-rest)/Math.max(1,tot));const W=a.calendario.periodos.length===2?'Semestre':'Período';per=`<button type="button" class="card imper" data-imgo="calendario"><div><b>${rest}</b> dias letivos até ao fim do ${f.p.n}.º ${W.toLowerCase()}<small>${esc(fmtIsoL(f.p.fim))}</small></div><div class="imbar"><i style="width:${pc}%"></i></div></button>`}}catch(_){}
  const dataTxt=hoje.toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
  $('#view').innerHTML=`<div class="im">
   <header class="imtop"><div><small>${esc(dataTxt.charAt(0).toUpperCase()+dataTxt.slice(1))}</small><h2>${imSaud()}${nome?', '+esc(nome):''}</h2></div><button type="button" class="imav" data-imgo="definicoes" data-imdef="prof" aria-label="Perfil">${(()=>{const f=(perfil()||{}).foto||s.foto;return f?`<img src="${esc(f)}" alt="">`:esc((nome||'?').slice(0,1))})()}</button></header>
   ${ntPede?`<div class="imnt">${ic('bell',18)}<div><b>Receber avisos das aulas e reuniões?</b><small>${ntE==='instalar'?'Adicione primeiro a app ao ecrã principal.':'Ative as notificações neste iPhone.'}</small></div><button class="btn sm pri" data-imnt="1">${ntE==='instalar'?'Como':'Ativar'}</button><button class="btn sm ico" data-imntx="1" aria-label="Agora não">${ic('x',13)}</button></div>`:''}
   ${hero}
   ${pills.length?`<div class="impls">${pills.join('')}</div>`:''}
   <div class="imq">${[['sumarios','pen','Sumário'],['tarefas','checks','Tarefa'],['testes','target','Teste'],['reunioes','meet','Reunião'],['alunos','users','Alunos'],['meuhorario','calendar','Horário']].map(([v,i,l])=>`<button type="button" data-imgo="${v}"><span>${ic(i,20)}</span>${l}</button>`).join('')}</div>
   <section class="card imday"><div class="imdh"><h3>${rot}</h3><small class="mut">${D.aulas} aula${D.aulas!==1?'s':''}${D.ev.filter(e=>e.tp==='tar').length?' · '+D.ev.filter(e=>e.tp==='tar').length+' tarefa(s)':''}</small><span class="sp1"></span><div class="seg sm"><button type="button" data-imoff="-1" aria-label="Dia anterior">‹</button><button type="button" data-imoff="0" class="${off===0?'on':''}">Hoje</button><button type="button" data-imoff="1" aria-label="Dia seguinte">›</button></div></div>
     ${evs.length?`<ul class="iml">${lista.map(li).join('')}</ul>${evs.length>5?`<button type="button" class="imver" data-imtudo="1">${abertos?'Mostrar menos':'Ver o dia todo ('+evs.length+')'}</button>`:''}`:`<p class="mut" style="margin:6px 0 0">Nada marcado.</p>`}
     <div class="imnew"><input id="im-t" placeholder="Nova tarefa para ${off===0?'hoje':rot.toLowerCase()}…" enterkeyhint="done"><button class="btn pri ico" id="im-ok" aria-label="Juntar tarefa">${ic('plus',16)}</button></div></section>
   ${PX.length?`<section class="card imnx"><div class="imdh"><h3>Próximos 7 dias</h3><span class="sp1"></span><button class="btn sm" data-imgo="calendario">Calendário</button></div><ul class="iml">${PX.slice(0,6).map(x=>{const d=dataDeIso(x.d);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${DIAS_C[d.getDay()]}</small></span><button type="button" class="imlb" ${x.at}><span class="imic">${ic(x.ic,13)}</span><span><b>${esc(x.t)}</b> <small>${esc(x.s)}</small></span></button></li>`}).join('')}</ul></section>`:''}
   ${TF.length?`<section class="imts"><div class="imdh"><h3>As Minhas Turmas</h3><span class="sp1"></span><button class="btn sm" data-imgo="turmas">Todas</button></div><div class="imtc">${TF.map(t=>{const ss=imSemSum(t,a);const al=(t.alunos||[]).filter(x=>x.frequenta!==false).length;return `<button type="button" class="imtcard" data-imt="${t.id}">${anoBadge(t)}<b>${esc(t.nome)}</b><small>${esc(t.disciplina)}</small><span class="imtm">${ic('users',12)} ${al}${ss?` · <em>${ss} sem sumário</em>`:''}</span><span class="imtp">${esc(imProxTurma(t,a)||'—')}</span></button>`}).join('')}</div></section>`:''}
   ${per}
   <button type="button" class="imfull" data-imfull="1">${ic('grid',14)} Ver o Início completo</button></div>`;
  imBind()}
function imBind(){const v=$('#view');const re=()=>vInicioMovel();
  v.querySelectorAll('[data-imgo]').forEach(b=>b.onclick=()=>{if(b.dataset.imdef)UI.defTab=b.dataset.imdef;const w=b.dataset.imgo;if(['testes','alunos','sumarios'].includes(w)&&!T()){const TF=turmasFiltradas(A()||{turmas:[]});if(TF[0])S.turmaAtiva=TF[0].id}go(w)});
  v.querySelectorAll('[data-imt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.imt;save();go('painel')});
  const kx=(val,fn)=>{const j=val.indexOf('|');const tid=val.slice(0,j),k=val.slice(j+1);const t=A().turmas.find(x=>x.id===tid);if(!t)return;S.turmaAtiva=tid;save();try{aulaDlg(t,k,fn)}catch(_){go('sumarios')}};
  v.querySelectorAll('[data-imsum]').forEach(b=>b.onclick=()=>kx(b.dataset.imsum,'sum'));v.querySelectorAll('[data-impres]').forEach(b=>b.onclick=()=>kx(b.dataset.impres,'pres'));
  v.querySelectorAll('[data-imreun]').forEach(b=>b.onclick=()=>{try{reuniaoVer(b.dataset.imreun)}catch(_){go('reunioes')}});
  v.querySelectorAll('[data-iminst]').forEach(b=>b.onclick=()=>{const [tid,iid]=b.dataset.iminst.split('|');S.turmaAtiva=tid;UI.inst=iid;UI.instTab='notas';save();go('instrumentos')});
  v.querySelectorAll('[data-imtk]').forEach(c=>c.onchange=()=>{const x=tarefas().find(z=>z.id===c.dataset.imtk);if(!x)return;x.feito=c.checked;x.feitaEm=Date.now();save();try{tarBadge()}catch(_){}setTimeout(re,300)});
  v.querySelectorAll('[data-imoff]').forEach(b=>b.onclick=()=>{const k=+b.dataset.imoff;UI.imOff=k===0?0:(UI.imOff||0)+k;re()});
  const td=v.querySelector('[data-imtudo]');if(td)td.onclick=()=>{UI.imTudo=!UI.imTudo;re()};
  const av=v.querySelector('[data-imav]');if(av)av.onclick=()=>{try{mostrarAvisos(true)}catch(_){}};
  const nt=v.querySelector('[data-imnt]');if(nt)nt.onclick=()=>{if(ntEstado()==='instalar'){UI.defTab='notif';go('definicoes')}else ntAtivar()};
  const nx=v.querySelector('[data-imntx]');if(nx)nx.onclick=()=>{S.cfg.ntDispensa=Date.now();save();re()};
  const fl=v.querySelector('[data-imfull]');if(fl)fl.onclick=()=>{S.cfg.inicioMovel='completo';save();go('inicio')};
  const it=$('#im-t'),ok=$('#im-ok');const add=()=>{if(!it.value.trim())return;const d=new Date();d.setDate(d.getDate()+(UI.imOff||0));tarefas().push({id:uid(),t:it.value.trim(),prazo:isoData(d),prio:'normal',feito:false,criada:Date.now()});save();audit('Tarefas','Tarefa criada',it.value.trim());re();setTimeout(()=>$('#im-t')&&$('#im-t').focus(),60)};
  if(ok){ok.onclick=add;it.onkeydown=e=>{if(e.key==='Enter')add()}}}
{const _vIM=vInicio;vInicio=function(){if(ES_MOVEL()&&S.cfg.inicioMovel!=='completo'&&!document.body.classList.contains('apres')){try{barBtns([])}catch(_){}return vInicioMovel()}const r=_vIM.apply(this,arguments);
  try{if(ES_MOVEL()&&!$('#im-volta')){$('#view').insertAdjacentHTML('afterbegin',`<button type="button" class="imvolta" id="im-volta">${ic('sun',14)} Vista «Hoje» para o telemóvel</button>`);$('#im-volta').onclick=()=>{S.cfg.inicioMovel='hoje';save();go('inicio')}}}catch(_){}return r};if(go._f)go._f.inicio=vInicio}

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
  const N=[{id:'notificacoes',ic:'bell',t:'Notificações no iPhone, iPad e Computador',gif:null,txt:`<ol><li><b>iPhone/iPad</b>: no Safari, Partilhar › <b>Adicionar ao ecrã principal</b> e abra a app pelo ícone (a Apple só permite notificações assim, iOS 16.4+).</li><li>Em <b>Definições › Notificações</b> toque em <b>Ativar Notificações</b> e aceite.</li><li>Escolha o que quer receber: aula a começar (5, 10 ou 15 min antes), sumário por escrever depois da aula, resumo do dia (07:45), avaliações de amanhã (18:00), lembretes de reuniões e avisos urgentes, número no ícone da app. Defina o horário de silêncio e os fins de semana.</li></ol><p>Tocar numa notificação abre a secção certa. <b>Com a app fechada</b> o iPhone não deixa as apps web avisar: use <b>Juntar ao Calendário (.ics)</b> — reuniões, avaliações, tarefas e avisos dos próximos 45 dias ficam no Calendário com alarmes.</p>`},
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
  d.innerHTML=`<form class="nvmcf" onsubmit="return false" autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg().email||(SESSAO||{}).u||'')}" hidden readonly><h2 id="mc-t">${ic('shield',18)} Mudar o Código de Encriptação</h2>
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
function verSide(){const n=$('#side .brand .bt')||$('#side .brand');if(!n)return;let v=$('#side .bver');if(v&&v.parentElement!==n){v.remove();v=null}if(!v){v=document.createElement('span');v.className='bver';v.title='Versão da app — toque para ver as novidades';n.appendChild(v);v.onclick=e=>{e.stopPropagation();try{UI.defTab='geral';go('ajuda')}catch(_){}}}v.textContent='v'+VERSAO}
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

