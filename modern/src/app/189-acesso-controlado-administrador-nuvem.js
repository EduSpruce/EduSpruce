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
setTimeout(()=>{acCentral().then(async()=>{try{const s=sessaoAtual();if(!s||s.tipo!=='google')return;let r;try{r=await acVerificar(s.u)}catch(e){if(!e.semAcesso)return;try{sessionStorage.removeItem(SESS_KEY);localStorage.removeItem(SESS_KEY)}catch(_){}(window._alertNativo||alert)(e.message);location.reload();return}
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
async function sairNuvem(){try{nvMarcar()}catch(_){}const L=nvL();let pend=Object.keys(L.mod||{}).length;
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

