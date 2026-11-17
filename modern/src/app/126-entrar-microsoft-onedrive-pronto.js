/* ===================== Entrar com Microsoft 365 → OneDrive pronto a sincronizar ===================== */
/* ID da aplicação (Microsoft Entra) embutido: preencha aqui quando alojar a app para não ter de o escrever em cada dispositivo.
   Também pode ser passado uma vez no endereço: https://…/index.html?ms=<ID> */
const EF_MS_ID='';
try{const q=new URLSearchParams(location.search).get('ms');if(q&&/^[0-9a-f-]{36}$/i.test(q)){nvSet({msId:q});history.replaceState(null,'',location.pathname+location.hash)}}catch(_){}
const msIdAtual=()=>{const L=nvL();const a=(S.cfg.auth&&S.cfg.auth.ms)||{};return L.msId||a.clientId||EF_MS_ID||''};
/* a ligação usa o ID atual e o inquilino da escola (se indicado) */
{const _ml=msLigar;msLigar=async function(){const id=msIdAtual();if(id&&!nvL().msId)nvSet({msId:id});return _ml.apply(this,arguments)}}
/* pedido do ID quando ainda não existe neste dispositivo */
function msPedirId(){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal msid';d.setAttribute('aria-labelledby','mi-t');
  d.innerHTML=`<div class="amh"><svg width="22" height="22" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg><h2 id="mi-t">Ligar o EduSpruce à Microsoft</h2></div>
  <p class="hint" style="margin:0 0 10px">Só é preciso uma vez. O EduSpruce precisa do <b>ID da aplicação</b> registada na Microsoft Entra (grátis).</p>
  <label for="mi-id">ID da aplicação (cliente)</label><input id="mi-id" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="none" spellcheck="false" inputmode="text">
  <details class="nvaj"><summary>Como obter</summary><ol><li><b>portal.azure.com</b> › Microsoft Entra ID › Registos de aplicações › <b>Novo registo</b>.</li><li>Tipos de conta: <b>qualquer organização e contas pessoais</b>.</li><li>URI de redirecionamento: <b>Aplicação de página única (SPA)</b> → <code>${esc(nvRedirect())}</code></li><li>Permissões de API › Microsoft Graph › Delegadas: <b>User.Read</b> e <b>Files.ReadWrite.AppFolder</b>.</li><li>Copie o “ID da aplicação (cliente)”. Numa conta da escola o administrador pode ter de aprovar.</li></ol></details>
  <p class="lgerr" id="mi-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-mi="0">Cancelar</button><button type="button" class="btn pri" data-mi="1">Continuar</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  d.querySelector('[data-mi="0"]').onclick=()=>fim(null);const ok=()=>{const v=d.querySelector('#mi-id').value.trim();if(!/^[0-9a-f-]{36}$/i.test(v)){d.querySelector('#mi-err').textContent='O ID tem o formato 00000000-0000-0000-0000-000000000000.';return}nvSet({msId:v});fim(v)};
  d.querySelector('[data-mi="1"]').onclick=ok;d.querySelector('#mi-id').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#mi-id').focus(),50)})}
/* palavra-passe de encriptação depois de entrar */
function nvPedirPalavra(existe,conta){return new Promise(res=>{const d=document.createElement('dialog');d.className='amodal nvpwd';d.setAttribute('aria-labelledby','np-t');
  d.innerHTML=`<div class="amh">${ic('shield',22)}<h2 id="np-t">${existe?'Abrir os Seus Dados na Nuvem':'Proteger os Dados na Nuvem'}</h2></div>
  <p class="hint" style="margin:0 0 10px">${existe?`Encontrámos dados do EduSpruce no OneDrive de <b>${esc(conta||'')}</b>. Escreva a palavra-passe de encriptação que definiu no outro dispositivo.`:`Os dados vão ser guardados no OneDrive de <b>${esc(conta||'')}</b>, encriptados neste dispositivo. Escolha uma palavra-passe só sua (mín. 8) e guarde-a: vai precisar dela no iPad, no Mac ou noutro browser.`}</p>
  <input type="password" id="np-1" placeholder="Palavra-passe de encriptação" autocomplete="${existe?'current-password':'new-password'}">${existe?'':'<input type="password" id="np-2" placeholder="Repetir" autocomplete="new-password" style="margin-top:8px">'}
  <p class="lgerr" id="np-err" role="alert"></p><div class="row amb"><button type="button" class="btn" data-np="0">Mais Tarde</button><button type="button" class="btn pri" data-np="1">${ic('refresh',15)} ${existe?'Abrir e Sincronizar':'Guardar e Sincronizar'}</button></div>`;
  document.body.appendChild(d);const fim=v=>{try{d.close()}catch(_){}d.remove();res(v)};d.addEventListener('cancel',e=>{e.preventDefault();fim(false)});d.querySelector('[data-np="0"]').onclick=()=>fim(false);
  const ok=async()=>{const a=d.querySelector('#np-1').value,b=existe?a:d.querySelector('#np-2').value;const er=d.querySelector('#np-err');{const _e=nvPinErro(a,'np-1',!existe);if(_e){er.textContent=_e;return}}if(a!==b){er.textContent='As palavras-passe não coincidem.';return}
    const bt=d.querySelector('[data-np="1"]');bt.disabled=true;er.textContent='';try{await nvDefinirPalavra(a);fim(true)}catch(e){er.textContent=e.message;bt.disabled=false;d.classList.add('abana');setTimeout(()=>d.classList.remove('abana'),400)}};
  d.querySelector('[data-np="1"]').onclick=ok;d.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}}));try{d.showModal()}catch(_){d.setAttribute('open','')}setTimeout(()=>d.querySelector('#np-1').focus(),50)})}
async function nvAposLogin(){if(nvAposLogin._a)return;nvAposLogin._a=1;try{const L=nvL();if(L.prov!=='onedrive'||!L.ms)return;if(await nvChave()){nvSincronizar(false);return}
  let existe=false;try{existe=!!(await PROV.onedrive.ler(NV_PREF+'manifest.json'))}catch(e){toast(e.message,'erro');return}
  const ok=await nvPedirPalavra(existe,L.conta);if(!ok){toast('Pode ativar a sincronização mais tarde em Definições › Segurança','aviso');return}
  const r=await nvSincronizar(true);if(r&&!existe)toast('Tudo pronto: os seus dados estão no OneDrive (encriptados)','ok')}catch(e){console.warn(e)}finally{nvAposLogin._a=0}}
/* Entrar com Microsoft 365: uma só autorização dá a sessão e o acesso à pasta da app no OneDrive */
msLogin=async function(A_){if(!nvHttps())throw new Error('Entrar com Microsoft 365 precisa que a app esteja num endereço https (alojada num servidor), não aberta como ficheiro.');
  let id=msIdAtual();if(!id){id=await msPedirId();if(!id)return null}if(!nvL().msId)nvSet({msId:id});
  await msLigar();const L=nvL();let me={};try{me=await (await msF('https://graph.microsoft.com/v1.0/me')).json()}catch(_){}
  const email=String(me.mail||me.userPrincipalName||L.conta||'').toLowerCase();const m=(A_&&A_.ms)||{};
  if(m.dominio&&!email.endsWith('@'+m.dominio.toLowerCase().replace(/^@/,''))){nvSet({ms:null});throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+m.dominio+').')}
  const nome=me.displayName||email;nvSet({prov:L.prov||'onedrive',conta:email,auto:L.auto!==false});
  if(L.prov&&L.prov!=='onedrive')nvSet({prov:'onedrive',base:null,mod:{}});
  try{if(!S.cfg.professor)S.cfg.professor=nome;if((!S.cfg.email||typeof S.cfg.email!=='string')&&/@/.test(email))S.cfg.email=email;S.cfg.auth=S.cfg.auth||{};S.cfg.auth.ms=S.cfg.auth.ms||{};if(!S.cfg.auth.ms.clientId)S.cfg.auth.ms.clientId=id;save()}catch(_){}
  setTimeout(nvAposLogin,900);
  return {u:email,nome,papel:'professor',tipo:'ms',desde:Date.now()}};
/* o botão fica sempre disponível (o ID pode ser pedido no momento) */
{const _pl=pedirLogin;pedirLogin=function(){const p=_pl.apply(this,arguments);setTimeout(()=>{const b=$('#lg-ms');if(b){b.removeAttribute('aria-disabled');const m=b.querySelector('.mut');if(m)m.remove();
    if(!$('#lg-msn'))($('#lg-gg')||b).insertAdjacentHTML('afterend',`<p class="lgmsn" id="lg-msn">${ic('refresh',13)} Entre com Google: os dados ficam iguais no computador, no iPad e no iPhone (Google Drive, encriptado).</p>`)}},0);return p}}
/* sessão Microsoft já iniciada: confirma a sincronização ao abrir */
setTimeout(()=>{try{const s=sessaoAtual();if(s&&s.tipo==='ms')nvAposLogin()}catch(_){}},2500);
/* Definições › Conta e Acesso: o ID da Microsoft passa também para este dispositivo */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ms-cid'){const v=e.target.value.trim();if(v)nvSet({msId:v})}},true);


/* ecrã de código ao abrir: mesmo fundo do início de sessão, cartão moderno com teclado */
pedirPin=function(){return new Promise(ok=>{const p=(()=>{try{return perfil()}catch(_){return {}}})();const nome=profNome?(profNome(S.cfg.professor)||''):(S.cfg.professor||'');const pn=(S.cfg.professor||'').trim().split(/\s+/)[0]||'';
  let foto=p.foto||'';if(foto&&!/^data:/.test(foto))foto=FOTOS[foto]||FOTOS[String(foto).replace(/^f:/,'')]||'';const ini=(S.cfg.professor||'E').trim().split(/\s+/).filter(Boolean);const inic=((ini[0]||'E')[0]+(ini.length>1?ini[ini.length-1][0]:'')).toUpperCase();
  const h=new Date().getHours();const sd=h<6?'Boa noite':h<13?'Bom dia':h<20?'Boa tarde':'Boa noite';
  const o=document.createElement('div');o.id='login';o.className='pinmode';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','pl-t');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','b'];
  o.innerHTML=`<div class="lgb pinc"><div class="lgh"><span class="lgi">${ic('flow',30)}</span><div><b>Edu<em>Spruce</em></b><span>${esc(S.cfg.escola||'Menos papelada. Mais tempo para ensinar.')}</span></div></div>
    <div class="plav">${foto?`<img src="${esc(foto)}" alt="">`:`<span>${esc(inic)}</span>`}<i>${ic('cadeado',14)}</i></div>
    <h1 id="pl-t">${sd}${pn?', '+esc(pn):''}</h1><p class="mut plsub">Introduza o seu código para continuar</p>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de 4 algarismos"><i></i><i></i><i></i><i></i></div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x">Sair</button>`:k==='b'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>
    <p class="lgnota">${SESSAO&&SESSAO.nome?'Sessão de <b>'+esc(SESSAO.nome)+'</b>'+(SESSAO.tipo==='ms'?' · Microsoft 365':''):''}</p></div>`;
  document.body.appendChild(o);document.body.classList.add('login-on');let v='',ocup=false;const D=o.querySelector('.pdots'),E_=o.querySelector('.pderr');
  const dots=()=>{D.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k<v.length));D.setAttribute('aria-label',v.length+' de 4 algarismos')};
  const tecla=async x=>{if(ocup)return;if(x==='x'){if(confirm('Terminar a sessão?'))terminarSessao();return}if(x==='b')v=v.slice(0,-1);else if(v.length<4){v+=x;E_.textContent=''}dots();
    const bt=o.querySelector(`[data-pk="${x}"]`);if(bt){bt.classList.remove('prem');void bt.offsetWidth;bt.classList.add('prem')}
    if(v.length===4){ocup=true;if(await pinOk(v)){D.classList.add('ok');document.removeEventListener('keydown',kb);setTimeout(()=>{o.classList.add('sai');document.body.classList.remove('login-on');setTimeout(()=>o.remove(),300);ok()},220)}
      else{E_.textContent='Código errado';D.classList.add('abana');try{vibrar()}catch(_){}setTimeout(()=>{v='';dots();D.classList.remove('abana');ocup=false},420)}}};
  o.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>tecla(b.dataset.pk));const kb=e=>{if(e.target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest&&e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}};document.addEventListener('keydown',kb);
  const c=o.querySelector('.pinc');c.tabIndex=-1;setTimeout(()=>c.focus({preventScroll:true}),80)})};


