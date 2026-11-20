/* =====================================================================
   v0.84 · Definições › Sincronização (separador próprio, painel redesenhado)
   ===================================================================== */
const nvLigado=()=>{const L=nvL();if(L.prov==='google')return !!(nvGId()&&(nvGTok()||gsCfg().email||(L.g&&L.g.t)));if(L.prov==='onedrive')return !!L.ms;return false};
const nvQuando=q=>{if(!q)return 'nunca';const s=Math.round((Date.now()-q)/1000);if(s<45)return 'agora mesmo';if(s<3600)return 'há '+Math.round(s/60)+' min';if(s<86400)return 'há '+Math.round(s/3600)+' h';return new Date(q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})};
const NV_LOGO={google:'<svg width="26" height="26" viewBox="0 0 87.3 78" aria-hidden="true"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5A9 9 0 0 0 0 53h27.5z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/><path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>',
 onedrive:'<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.1 8.6a5.4 5.4 0 0 1 9.2 2.6A3.9 3.9 0 0 1 19 19H8.5z" fill="#0364b8"/><path d="M10.1 8.6 8.5 19H5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 5.7-2.45z" fill="#0078d4"/><path d="M19.3 11.2A3.9 3.9 0 0 1 19 19H8.5l5.9-6.6a5 5 0 0 1 4.9-1.2z" fill="#1490df"/><path d="M14.4 12.4 8.5 19H5a4 4 0 0 1-3.1-6.5z" fill="#28a8ea"/></svg>'};

function nvAjudaBloq(){const saf=nvSafari()||nvIOS();return `<div class="alert w nvbloq">${ic('shield',16)}<div><b>A ligação ao Google Drive está a ser bloqueada neste navegador.</b><ol>
 <li>Desligue o <b>bloqueador de publicidade/conteúdos</b> para <b>eduspruce.pt</b> (uBlock, AdBlock, AdGuard, Ghostery, Privacy Badger…).${saf?' No Safari: <b>Safari › Definições › Extensões</b> (Mac) ou <b>Definições › Apps › Safari › Extensões</b> (iPhone/iPad) e desative os bloqueadores de conteúdos, ou toque em «aA» › <i>Desativar bloqueadores de conteúdos</i>.':''}</li>
 <li>Se estiver na rede da escola, experimente outra rede (por ex. os dados do telemóvel) — alguns filtros bloqueiam o Google Drive.</li>
 <li>Recarregue a página e volte a tentar.</li></ol></div></div>`}
function nvPainel(){const L=nvL();const prov=PROV[L.prov];const lig=nvLigado();const ativa=lig&&!!L.k;const msOk=!!(L.msId||NV_CENTRAL.ms);const C=nvConflitos();const https=nvHttps();
  const conta=L.prov==='google'?(gsCfg().email||''):(L.conta||'');const pend=Object.keys(L.mod||{}).length;
  const est=!L.prov?['off','Desligada','Escolha onde guardar os dados para os ter em todos os aparelhos.']:L.renovar?['ren','Ligação a renovar','A '+(prov?prov.n:'nuvem')+' pede para renovar a ligação de vez em quando.']:!lig?['off','Por ligar','Entre na sua conta '+(L.prov==='google'?'Google':'Microsoft')+'.']:!L.k?['off','Falta a palavra-passe','Defina a palavra-passe de encriptação para começar.']:L.erro&&!/renovad/.test(L.erro)?['err','Com erro',L.erro]:!navigator.onLine?['off','Sem internet','As alterações ficam guardadas aqui e seguem quando a ligação voltar.']:pend?['pend','Alterações por enviar','Vão ser enviadas dentro de segundos.']:['ok','Sincronizada','Última sincronização '+nvQuando(L.ultimo)+'.'];
  const sec=(t,d,c)=>`<section class="nvs"><div class="nvsh"><h3>${t}</h3>${d?`<p>${d}</p>`:''}</div><div class="nvsb">${c}</div></section>`;
  const tile=(k,n,d,dis)=>`<button type="button" class="nvt ${L.prov===k?'on':''}" data-nvp2="${k}" ${dis?'disabled aria-disabled="true"':''} role="radio" aria-checked="${L.prov===k}"><span class="nvtl">${NV_LOGO[k]}</span><span class="nvtt"><b>${n}</b><span>${d}</span></span>${dis?'<span class="nvtb">em breve</span>':L.prov===k?`<span class="nvtk">${ic('check',14)}</span>`:''}</button>`;
  return `<div class="nvpw2" id="nv-card">
  <div class="card nvhero nvst-${est[0]}"><div class="nvhi">${ic('cloud',30)}</div><div class="nvht"><div class="nvhk">Sincronização na Nuvem</div><h2>${est[1]}</h2><p>${esc(est[2])}</p>
    ${ativa?`<div class="nvhm"><span>${NV_LOGO[L.prov]||''} ${esc(prov.n)}</span>${conta?`<span>${ic('user',13)} ${esc(conta)}</span>`:''}<span>${ic('shield',13)} Encriptado (AES-256)</span><span>${ic('clock',13)} ${esc(nvQuando(L.ultimo))}</span></div>`:''}</div>
    <div class="nvha">${ativa?`<button class="btn pri" id="nv2-agora">${ic('refresh',15)} Sincronizar Agora</button>`:L.prov==='google'&&!L.k?`<button class="btn pri" id="nv2-assist">${ic('sparkle',15)} Configurar em 3 Passos</button>`:''}${L.renovar?`<button class="btn pri" id="nv2-ren">${ic('refresh',15)} Renovar Ligação</button>`:''}</div></div>
  ${/Não foi possível contactar|Failed to fetch|Load failed/i.test(L.erro||'')?nvAjudaBloq():''}
  ${!https?`<div class="alert w">${ic('alert',15)} A sincronização só funciona com a app num endereço <b>https</b> (como eduspruce.pt). Aberta como ficheiro no computador não está disponível.</div>`:''}
  <div class="card nvbody">
  ${sec('Onde guardar','Os ficheiros ficam na pasta privada da app na sua conta — a app não vê os seus outros ficheiros.',`<div class="nvts" role="radiogroup" aria-label="Onde guardar">${tile('google','Google Drive','Conta Google (pessoal ou da escola)',false)}${tile('onedrive','OneDrive','Conta Microsoft 365 ou pessoal',!msOk&&L.prov!=='onedrive')}</div>`)}
  ${L.prov?sec('Conta',L.prov==='google'?'A ligação à Google renova-se sozinha.':'A ligação à Microsoft dura um dia e renova-se ao abrir a app.',`<div class="nvrow"><div class="nvrt">${lig?`${ic('check',15)} <b>${esc(conta||'Ligada')}</b>`:`<span class="mut">Ainda não ligada</span>`}</div><button class="btn ${lig?'':'pri'}" id="nv2-lig">${ic('link',15)} ${lig?'Voltar a Ligar':(L.prov==='google'?'Ligar ao Google Drive':'Ligar ao OneDrive')}</button></div>`):''}
  ${L.prov?sec('Palavra-passe de encriptação','Tudo é encriptado neste aparelho antes de sair. Sem esta palavra-passe ninguém — nem a EduSpruce — consegue abrir os dados.',L.k?`<div class="nvrow"><div class="nvrt">${ic('check',15)} <b>Definida neste aparelho</b> <span class="mut">· use a mesma nos outros</span></div><button class="btn" id="nv2-pwm">Esquecer Neste Aparelho</button></div>`:
    `<form class="nvpwf" id="nv2-pwf" autocomplete="on" action="#"><input type="text" name="username" autocomplete="username" value="${esc(conta)}" hidden readonly><input type="password" id="nv2-p1" autocomplete="new-password" placeholder="Código numérico (mín. 8 algarismos)"><input type="password" id="nv2-p2" autocomplete="new-password" placeholder="Repetir (se for nova)"><button type="submit" class="btn pri" id="nv2-pwok">${ic('shield',15)} Guardar e Sincronizar</button></form><p class="nvhint">Se já usa a EduSpruce noutro aparelho, escreva a mesma palavra-passe (basta uma vez).</p>`):''}
  ${L.prov&&L.k?sec('Automático','',`<label class="nvsw"><input type="checkbox" id="nv2-auto" ${L.auto!==false?'checked':''}><span class="nvswk" aria-hidden="true"></span><span><b>Sincronizar sozinha</b><small>6 s depois de cada alteração, a cada minuto com a app aberta, ao abrir, ao voltar e ao sair.</small></span></label>`):''}
  ${L.prov&&L.k?sec('Aparelhos','',`<div class="nvrow"><div class="nvrt">Este aparelho: <b>${esc(nvDisp())}</b></div><div class="nvbtns"><button class="btn" id="nv2-outro">${ic('link',15)} Ligar Outro Aparelho</button><button class="btn dng" id="nv2-off">${ic('x',14)} Desligar Este</button></div></div>`):''}
  ${C.length?sec('Versões guardadas de conflitos','Quando a mesma parte muda em dois aparelhos fica a mais recente; a outra fica aqui.',C.map((c,i)=>`<div class="nvrow nvcf"><div class="nvrt"><b>${esc(nvRotulo(c.parte))}</b> <span class="mut">· ${esc(c.de)} · ${new Date(c.q).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'})}</span></div><div class="nvbtns"><button class="btn sm" data-nvrep2="${i}">Repor</button><button class="btn sm ico" data-nvdel2="${i}" aria-label="Descartar">${ic('x',12)}</button></div></div>`).join('')):''}
  <div class="nvfoot"><button class="btn sm" id="nv2-guia">${ic('help',13)} Guia de configuração</button><span class="mut">Microsoft e Google guardam só ficheiros ilegíveis · <a href="privacidade.html" target="_blank" rel="noopener">Privacidade</a></span></div>
  </div></div>`}
function bindNvPainel(){const re=()=>{const c=$('#nv-card');if(!c)return;const d=document.createElement('div');d.innerHTML=nvPainel();c.replaceWith(d.firstElementChild);bindNvPainel()};
  $$('[data-nvp2]').forEach(b=>b.onclick=()=>{if(b.disabled)return;nvSet({prov:b.dataset.nvp2,base:null,mod:{},erro:''});PROV.google._ids=null;re()});
  const lg=$('#nv2-lig');if(lg)lg.onclick=async()=>{try{if(nvL().prov==='google'){await gsToken(true)}else{await msLigar()}toast('Conta ligada','ok');if(nvL().k)await nvSincronizar(true);re()}catch(e){toast(e.message,'erro')}};
  const f=$('#nv2-pwf');if(f){f.onsubmit=async e=>{e.preventDefault();const a=$('#nv2-p1').value,b=$('#nv2-p2').value;{const _e=nvPinErro(a,'nv2-p1',!!b);if(_e)return toast(_e,'erro')}if(b&&a!==b)return toast('As palavras-passe não coincidem.','erro');const bt=$('#nv2-pwok');bt.disabled=true;
    try{const exist=await nvDefinirPalavra(a);if(!exist&&a!==b){_nvK=null;nvSet({k:null});bt.disabled=false;return toast('É uma palavra-passe nova: escreva-a também em «Repetir».','erro')}toast(exist?'Palavra-passe confirmada — a receber os dados…':'A encriptar e enviar os dados…','ok');await nvSincronizar(true)}catch(e2){toast(e2.message,'erro')}bt.disabled=false;re()}}
  const pm=$('#nv2-pwm');if(pm)pm.onclick=()=>{if(!confirm('Esquecer a palavra-passe neste aparelho? Terá de a escrever outra vez para sincronizar.'))return;_nvK=null;nvSet({k:null});re()};
  const ag=$('#nv2-agora');if(ag)ag.onclick=async()=>{ag.disabled=true;ag.classList.add('gira');await nvSincronizar(true);re()};
  const as=$('#nv2-assist');if(as)as.onclick=()=>nvAssist(true);
  const rn=$('#nv2-ren');if(rn)rn.onclick=async()=>{try{await nvRenovar(false);await nvSincronizar(true);re()}catch(e){toast(e.message,'erro')}};
  const au=$('#nv2-auto');if(au)au.onchange=()=>{nvSet({auto:au.checked});toast(au.checked?'Sincronização automática ligada':'Sincronização automática desligada','ok')};
  const ou=$('#nv2-outro');if(ou)ou.onclick=nvLigarDlg;
  const of=$('#nv2-off');if(of)of.onclick=()=>{if(!confirm('Desligar a sincronização neste aparelho? Os dados ficam aqui e na nuvem.'))return;_nvK=null;localStorage.removeItem(NV_KEY);re()};
  const gu=$('#nv2-guia');if(gu)gu.onclick=()=>nvGuiaDlg(nvL().prov==='onedrive'?'ms':'g');
  $$('[data-nvrep2]').forEach(b=>b.onclick=()=>{const C=nvConflitos();const c=C[+b.dataset.nvrep2];if(!c||!confirm('Repor a versão de '+c.de+' de '+nvRotulo(c.parte)+'? A versão atual passa para esta lista.'))return;const P=nvPartes();if(P[c.parte]!==undefined)nvGuardaConflito(c.parte,P[c.parte],'antes de repor');P[c.parte]=c.dados;S=migrate(nvMontar(P));saveNow();localStorage.setItem(NV_CONF,JSON.stringify(nvConflitos().filter(x=>x.q!==c.q)));toast('Versão reposta','ok');re()});
  $$('[data-nvdel2]').forEach(b=>b.onclick=()=>{const C=nvConflitos();C.splice(+b.dataset.nvdel2,1);localStorage.setItem(NV_CONF,JSON.stringify(C));re()});
  clearInterval(bindNvPainel._t);bindNvPainel._t=setInterval(()=>{if(!$('#nv-card.nvpw2')){clearInterval(bindNvPainel._t);return}if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#nv-card'))return;re()},15000)}
function defSync(){return nvPainel()}
function bindSync(){bindNvPainel()}
/* em Segurança fica só um atalho */
{const _cSG=cartaoSyncGoogle;cartaoSyncGoogle=function(){const L=nvL();return `<div class="card nvatalho"><div class="row" style="gap:12px;align-items:center;flex-wrap:wrap"><span class="nvai">${ic('cloud',22)}</span><div style="flex:1;min-width:200px"><b>Sincronização na Nuvem</b><div class="mut" style="font-size:13.5px">${nvLigado()&&L.k?'Ativa · '+esc((PROV[L.prov]||{}).n||'')+' · '+esc(nvQuando(L.ultimo)):'Os mesmos dados no computador, no iPad e no iPhone.'}</div></div><button class="btn" data-dt2="sync">${ic('cloud',15)} Abrir Sincronização</button></div></div>`}}
{const _bDS=bindDados;bindDados=function(){let r;try{r=_bDS.apply(this,arguments)}catch(e){console.warn(e)}$$('.nvatalho [data-dt2]').forEach(b=>b.onclick=()=>{UI.defTab='sync';vDefinicoes()});return r}}

/* Google Drive: ficheiros grandes (> 4 MB, ex.: documentos importados) por envio retomável */
{const gd=PROV.google;const _escG=gd.escrever.bind(gd);
  gd.escrever=async function(n,txt){if(String(txt).length<4*1024*1024)return _escG(n,txt);const m=await this._mapa();const f=m[n];
    const ini=await gsFetch(f?'https://www.googleapis.com/upload/drive/v3/files/'+f.id+'?uploadType=resumable':'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id',{method:f?'PATCH':'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'text/plain'},body:JSON.stringify(f?{}:{name:n,parents:['appDataFolder']})});
    const loc=ini.headers.get('Location')||ini.headers.get('location');if(!loc)throw new Error('Google Drive: não foi possível iniciar o envio de um ficheiro grande.');
    const r=await nvFetchRetry(loc,{method:'PUT',headers:{'Content-Type':'text/plain'},body:txt},2);if(!r.ok)throw new Error('Google Drive: erro '+r.status+' ao enviar um ficheiro grande');
    if(!f){try{const j=await r.json();m[n]={id:j.id,s:txt.length}}catch(_){this._ids=null}}}}
/* erros de rede: tentativas rápidas e mensagem com o serviço e o erro exatos */
nvFetchRetry=async function(url,opt,n){n=n==null?3:n;let host='',cam='';try{const u=new URL(url);host=u.host;cam=u.pathname.split('/').slice(0,4).join('/')}catch(_){}let ult=null;
  for(let i=0;i<=n;i++){try{const r=await fetch(url,opt);if((r.status===429||r.status>=500&&r.status!==501)&&i<n){const ra=+r.headers.get('Retry-After');await nvEspera(ra?Math.min(ra,10)*1000:500*2**i);continue}return r}
    catch(e){ult=e;window.__nvRedeErro={host,cam,msg:String(e&&e.message||e),q:Date.now(),online:navigator.onLine};console.warn('[EduSpruce] rede',host+cam,e);if(i<n)await nvEspera(500*2**i)}}
  throw new Error(!navigator.onLine?'Sem ligação à internet — a sincronização volta a tentar sozinha.':'Não foi possível contactar '+host+' ('+String(ult&&ult.message||ult)+'). Quase sempre é um bloqueador de publicidade ou de conteúdos: desligue-o para eduspruce.pt (uBlock, AdBlock, AdGuard, Ghostery, Privacy Badger ou os «Bloqueadores de conteúdos» do Safari) e tente de novo. Também pode ser um filtro da rede da escola.')};

/* v0.88 · o perfil do professor é preenchido com os dados da conta Google (só o que estiver vazio) */
function gPerfilPreencher(j,email){if(!j)return;const p=perfil();let m=false;
  if(j.name&&!S.cfg.professor){S.cfg.professor=j.name;m=true}
  if(email&&!p.emailPessoal&&!/\.(edu|gov)\./i.test(email)){p.emailPessoal=email;m=true}
  if(j.picture&&!p.foto){const url=String(j.picture).replace(/=s\d+-c$/,'=s256-c');p.foto=url;m=true;
    fetch(url).then(r=>r.ok?r.blob():null).then(b=>{if(!b)return;const fr=new FileReader();fr.onload=()=>{if(perfil().foto===url){perfil().foto=fr.result;save();try{go(VIEW)}catch(_){}}};fr.readAsDataURL(b)}).catch(()=>{})}
  if(m){save();try{toast('Perfil preenchido com a sua conta Google — pode completá-lo em Definições › Professor','ok')}catch(_){}}}
/* na barra lateral, mostrar o nome em vez do e-mail */
{const _gNm=go;go=function(v){const r=_gNm.apply(this,arguments);try{if(SESSAO&&SESSAO.tipo==='google'&&S.cfg.professor&&SESSAO.nome!==S.cfg.professor&&(!SESSAO.nome||SESSAO.nome.includes('@'))){SESSAO.nome=S.cfg.professor;guardarSessao(SESSAO,!!localStorage.getItem(SESS_KEY))}}catch(_){}return r}}

/* v0.88 · barra lateral: o nome do professor (quando definido) em vez do e-mail; atualiza ao escrever */
const nomeCurto=n=>{const w=String(n||'').trim().split(/\s+/).filter(Boolean);return w.length>2?w[0]+' '+w[w.length-1]:w.join(' ')};
{const _sbN=sessBox;sessBox=function(){const r=_sbN.apply(this,arguments);try{const s=SESSAO;const b=$('#sessBox .snm b');if(s&&b&&(s.tipo==='google'||s.tipo==='ms'||s.papel==='professor')&&S.cfg.professor){const n=nomeCurto(S.cfg.professor);if(b.textContent!==n){b.textContent=n;b.title=S.cfg.professor}const av=$('#sessBox .sav:not(.fotosav)');if(av&&!perfil().foto)av.textContent=n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}}catch(_){}return r}}
document.addEventListener('input',e=>{try{if(e.target&&e.target.matches&&e.target.matches('[data-pf="professor"]')){S.cfg.professor=e.target.value;clearTimeout(sessBox._t);sessBox._t=setTimeout(()=>{try{sessBox()}catch(_){}},150)}}catch(_){}},true);

/* v0.90 · Ajuda atualizada + Manual em PDF */
const MANUAL_URL=(location.protocol==='file:'?'https://eduspruce.pt/':'')+'manual/EduSpruce-Manual.pdf';
function ajudaAtualizar(){
  if(AJUDA._v90)return;AJUDA._v90=1;
  const set=(id,o)=>{const x=AJUDA.find(s=>s.id===id);if(x)Object.assign(x,o)};
  const del=id=>{const i=AJUDA.findIndex(s=>s.id===id);if(i>=0)AJUDA.splice(i,1)};
  const mn=t=>`<span class="ajmn">${t}</span>`;
  set('comecar',{txt:`<p><b>1. Entrar.</b> No ecrã de entrada toque em <b>Entrar com Google</b> (conta da escola ou pessoal). Na primeira vez abre um assistente em 3 passos: conta ligada › palavra-passe de encriptação › sincronizar. A partir daí os dados ficam iguais em todos os seus aparelhos. Também pode usar uma <b>conta local</b> (utilizador e palavra-passe criados na app); «Entrar com Microsoft 365» está <i>em breve</i>.</p>
  <p><b>2. Configurar.</b> O EduSpruce organiza-se em <b>Escola → Ano letivo → Turmas</b>:</p>
  <ol><li><b>Escola</b>: nome, agrupamento, concelho e o <b>logotipo</b> (aparece no Início, relatórios e PDF).</li>
  <li><b>Definições › Professor</b>: o seu nome completo (é o que permite reconhecer as suas aulas nos horários), género, grupo e disciplinas por ciclo. Ao entrar com Google, o nome, o e-mail e a fotografia já vêm preenchidos.</li>
  <li><b>Ano Letivo e Turmas</b>: crie o ano letivo (3 períodos ou 2 semestres) e as turmas — à mão ou a partir do Excel do programa da escola.</li>
  <li><b>Calendário Escolar</b>: importe o PDF do calendário.</li>
  <li><b>O Meu Horário</b>: importe o PDF do seu horário.</li></ol>
  <p>O Início mostra «Primeiros passos» até tudo estar configurado. Para experimentar sem dados reais, escolha <b>Demonstração</b> no seletor do ano letivo. O <a href="${MANUAL_URL}" target="_blank" rel="noopener">manual completo em PDF</a> explica tudo com imagens.</p>`});
  set('sessao',{t:'Sessão, Contas e Integridade dos Dados',txt:`<p>Entre com <b>Google</b> ou com uma <b>conta local</b>. «Manter a sessão iniciada neste dispositivo» evita voltar a entrar (não marque num computador partilhado). Em ${mn('Definições › Conta e Acesso')} pode criar contas, mudar palavras-passe, limitar «Entrar com Google» a um domínio (ex.: o da escola), definir o código de acesso e terminar a sessão. A entrada com <b>Microsoft 365</b> aparece como «em breve» e fica ativa sozinha quando o site tiver o ID da Microsoft.</p>
  <p><b>Integridade dos Dados</b> (Definições › Geral) verifica ligações partidas, identificadores repetidos, períodos inexistentes, datas inválidas, ponderações e fotografias, e corrige o que for seguro. Também corre ao abrir a app.</p>`});
  set('dados',{txt:`<p>Os dados ficam <b>no dispositivo</b> e — com a sincronização ligada — também na <b>sua</b> conta Google Drive (ou OneDrive), encriptados antes de saírem. A EduSpruce não tem servidores com dados de alunos.</p>
  <ul><li>Em ${mn('Definições › Segurança')} exporte a <b>cópia completa</b> (JSON, com fotografias e documentos) ou uma <b>cópia encriptada</b> e guarde-a fora do aparelho; para mudar de dispositivo sem sincronização, importe essa cópia.</li>
  <li>As cópias têm dados pessoais de alunos: guarde-as num local seguro e nunca as publique.</li></ul>
  <p class="mut">No iPhone/iPad o Safari pode apagar dados de sites que não abre há 7 dias: use a app a partir do ecrã principal e ligue a sincronização.</p>`});
  del('gsync');
  set('nuvem',{txt:`<p>Em ${mn('Definições › Sincronização')} vê o estado (sincronizada, por enviar, a renovar, erro), escolhe <b>Google Drive</b> ou OneDrive (em breve), a conta, a palavra-passe de encriptação, o interruptor «Sincronizar sozinha» e «Ligar Outro Dispositivo».</p>
  <ul><li><b>Encriptação no dispositivo</b> (AES-256-GCM): a Google ou a Microsoft só guardam ficheiros ilegíveis. Sem a palavra-passe ninguém os abre — nem a EduSpruce.</li>
  <li>Os dados ficam numa <b>pasta privada e escondida</b> da app no Drive (não aparece na lista de ficheiros; vê-se em drive.google.com › Definições › Gerir apps).</li>
  <li>Dividida por partes (definições, cada ano, cada turma, auditoria, fotografias): alterações em turmas diferentes juntam-se sem conflito; se a mesma turma mudar em dois aparelhos, fica a mais recente e a outra é guardada.</li>
  <li>Sincroniza sozinha <b>6 s depois de cada alteração</b>, <b>a cada minuto</b> com a app aberta, ao abrir, ao voltar à app e ao sair. Sem internet, envia quando a ligação voltar.</li>
  <li>Ícone da nuvem na barra de cima: verde sincronizado, ponto azul por enviar, amarelo renovar (toque), vermelho erro, cinzento sem internet. Tocar sincroniza logo.</li></ul>`});
  set('nuvem2',{txt:`<ol><li><b>No primeiro aparelho</b>: «Entrar com Google» — o assistente liga o Drive e pede uma palavra-passe de encriptação. Guarde-a quando o navegador perguntar.</li>
  <li><b>Nos outros</b> (computador, iPad, iPhone): abra eduspruce.pt e «Entrar com Google» com a mesma conta. A app vê que já há dados e só pede a <b>mesma</b> palavra-passe (o gestor de palavras-passe pode preenchê-la). Os dados aparecem logo.</li>
  <li>No iPhone/iPad adicione a app ao ecrã principal (Partilhar › Adicionar ao ecrã principal).</li></ol>
  <p>Também pode usar ${mn('Definições › Sincronização › Ligar Outro Dispositivo')} para enviar o link por AirDrop, Mail ou Mensagens.</p>`});
  set('nuvemcfg',{txt:`<p>Em ${mn('Definições › Sincronização › Guia de configuração')} estão os passos pormenorizados da <b>Google Auth Platform</b> (Google Drive e «Entrar com Google») e do <b>Microsoft Entra</b> (OneDrive), com os endereços desta app já preenchidos e botões para copiar. Os IDs escrevem-se uma vez no ficheiro <code>eduspruce-config.json</code> do site; os professores só entram com a sua conta. O anexo do <a href="${MANUAL_URL}" target="_blank" rel="noopener">manual em PDF</a> resume também o alojamento no GitHub Pages e o domínio próprio.</p>`});
  set('aparencia',{t:'Aparência, Logótipo, iPad e Telemóvel',txt:`<ul><li><b>Por defeito</b>: tema Claro, estilo Institucional, destaque Azul, logótipo Monograma e animações completas.</li>
  <li>${mn('Definições › Aparência')}: <b>tema</b> (Auto, Claro, Escuro — também no fundo da barra lateral), <b>estilo da interface</b> (Institucional, SGE, Vidro, Azul), <b>cor de destaque</b>, <b>logótipo da app</b> (Abeto, Livro, Monograma, Floresta, Ramo — muda a barra lateral, o ecrã de entrada e o ícone), <b>animações</b> (Sem, Minimalista, Cheio) e densidade.</li>
  <li><b>iPad</b>: na vertical a barra lateral mostra só ícones. <b>iPhone</b>: barra de separadores em baixo (Início, Turma, Sumários, Avaliação, Mais).</li>
  <li>Tudo é tocável com o dedo (alvos de 44 px); pode arrastar tempos, testes, dias do calendário, ficheiros e e-mails.</li></ul>`});
  const novos=[
   {id:'manual',ic:'book',t:'Manual de Instruções (PDF)',gif:null,txt:`<p>O manual completo, com imagens, explica a app de ponta a ponta: entrar e assistente de sincronização, interface, escola e calendário, turmas e alunos, horários, aulas e testes, avaliação, ensino profissional e PROFIJ, direção de turma, reuniões e convocatórias por e-mail, tarefas, documentos, jornal escolar, sincronização, segurança, definições, resolução de problemas, glossário e um anexo para quem aloja a app.</p><p><a class="btn pri" href="${MANUAL_URL}" target="_blank" rel="noopener" download>${ic('download',16)} Descarregar o Manual (PDF)</a></p>`},
   {id:'gentrar',ic:'user',t:'Entrar com Google e Assistente de Sincronização',gif:null,txt:`<p><b>Entrar com Google</b> inicia a sessão <i>e</i> autoriza a app a guardar os seus dados numa pasta privada do seu Google Drive. No computador abre uma pequena janela da Google; no iPhone, iPad e Safari do Mac a Google abre na própria página e regressa à app.</p>
   <ol><li><b>Conta Google ligada</b> — mostra o e-mail.</li><li><b>Código de encriptação</b> (só algarismos, mín. 8, com teclado numérico no ecrã) — tudo é encriptado neste aparelho antes de ir para o Drive. <b>Não a perca</b>: nem a EduSpruce nem a Google a conhecem.</li><li><b>Sincronizar</b> — «Está tudo pronto».</li></ol>
   <p>O nome, o e-mail e a fotografia da conta preenchem o perfil (só campos vazios). A ligação à Google expira de hora a hora e renova-se sozinha no primeiro toque; se não conseguir, o ícone da nuvem fica amarelo.</p>`},
   {id:'convemail',ic:'send',t:'Convocatórias e Atividades por E-mail',gif:null,txt:`<p><b>Arraste</b> para qualquer sítio da app o e-mail do Outlook (.msg/.eml), o convite (.ics), um ficheiro de texto ou o texto selecionado — ou <b>cole</b> (Ctrl+V / ⌘V) fora de um campo, ou ${mn('Reuniões › Colar E-mail…')}. Tudo é lido no dispositivo.</p>
   <ul><li><b>Convocante / responsável</b>: quem assina (depois de «Com os melhores cumprimentos», «Atenciosamente»…).</li>
   <li><b>Ordem de trabalhos</b>: procura o ponto 1 («1.», «1)», «Ponto um», «Primeiro:») e os seguintes; reconhece «ponto único».</li>
   <li><b>Turma</b>: «12.º B», «12B», «turma B do 11.º ano», «11.º B/C», PROFIJ, CEF.</li>
   <li><b>Data e hora</b>: «6 de novembro», «25/11», «próxima quinta-feira», «17h30», «8.30h», «das 11h às 11:50».</li>
   <li><b>Local</b> e ligações Teams/Zoom.</li></ul>
   <p>Mostra tudo para confirmar e marca com lembretes; as atividades podem ir também para o Jornal Escolar. No <b>Outlook na web</b> pode arrastar da lista de mensagens: a app pede depois para colar o texto (Ctrl+A, Ctrl+C, Ctrl+V).</p>`},
   {id:'instalar',ic:'download',t:'Instalar no iPad, iPhone e Computador',gif:null,txt:`<ul><li><b>iPad / iPhone (Safari)</b>: Partilhar › <b>Adicionar ao ecrã principal</b> — abre em ecrã inteiro, com o logótipo.</li><li><b>Mac (Safari)</b>: Ficheiro › <b>Adicionar à Dock</b>.</li><li><b>Chrome / Edge</b>: ícone de instalar na barra de endereço ou menu › Instalar EduSpruce.</li></ul><p>Depois de aberta, a app funciona sem internet; a internet só faz falta para sincronizar, para o OCR e para atualizar o catálogo de cursos.</p>`},
   {id:'seguranca',ic:'cadeado',t:'Segurança: Palavras-passe, Bloqueio e Perfis',gif:null,txt:`<ul><li><b>Palavras-passe</b> guardadas com <b>Argon2id</b> (sal aleatório), nunca em texto.</li>
   <li><b>5 tentativas falhadas</b> seguidas (sessão ou código de acesso) bloqueiam a entrada <b>15 minutos</b>, mesmo recarregando a página; a partir do 3.º erro a app avisa quantas restam. Tudo fica na Auditoria.</li>
   <li><b>Perfis</b>: o <b>Professor</b> vê e edita só as suas turmas; a <b>Direção</b> vê todas (as dos outros em só leitura); o <b>Administrador</b> vê e edita tudo. Em ${mn('Conta e Acesso')}, «Turmas» escolhe as turmas de cada conta.</li>
   <li><b>Cadeado</b> na barra de cima: bloqueia o ecrã com o código de acesso. <b>Olho</b>: modo de apresentação para projetar sem dados pessoais.</li></ul>`},
   {id:'problemas',ic:'alert',t:'Problemas de Ligação e Sincronização',gif:null,txt:`<ul><li><b>«Sem ligação», «Failed to fetch» ou a sincronizar muito tempo</b>: quase sempre um <b>bloqueador de publicidade/conteúdos</b>. Desligue-o para eduspruce.pt (Safari no Mac: Safari › Definições › Extensões; iPhone/iPad: «aA» na barra de endereço ou Definições › Apps › Safari › Extensões). Na rede da escola experimente outra rede. Depois toque em Sincronizar Agora.</li>
   <li><b>«Janela da Google fechada»</b>: permita janelas pop-up para eduspruce.pt (no Safari a app já abre na própria página).</li>
   <li><b>«redirect_uri_mismatch»</b> (iPhone/iPad): quem aloja a app tem de registar <code>https://eduspruce.pt/</code> no cliente OAuth da Google.</li>
   <li><b>Erro 403 / «unregistered callers»</b>: Google Drive API por ativar no projeto, ou permissão do Drive desmarcada — volte a entrar e marque todas as permissões.</li>
   <li><b>«A Google não validou esta app» (Unverified)</b>: enquanto a marca não for validada, toque em Avançadas › Aceder a eduspruce.pt.</li>
   <li><b>Palavra-passe de encriptação</b>: tem de ser a mesma em todos os aparelhos.</li></ul>
   <p>Problemas ou sugestões: <a href="https://github.com/EduSpruce/EduSpruce/issues" target="_blank" rel="noopener">GitHub Issues</a> (nunca inclua dados de alunos).</p>`}
  ];
  const ordem=['manual','comecar','gentrar','instalar'];
  novos.forEach(n=>{if(!AJUDA.find(s=>s.id===n.id))AJUDA.push(n)});
  const ini=ordem.map(id=>AJUDA.find(s=>s.id===id)).filter(Boolean);
  const resto=AJUDA.filter(s=>!ordem.includes(s.id));AJUDA.length=0;AJUDA.push(...ini,...resto);AJUDA._v90=1;
}

/* v0.72 · Entrar com Google (conta da escola Google Workspace ou pessoal) */
function gLoginId(A_){return ((A_&&A_.google&&A_.google.clientId)||NV_CENTRAL.google||(S.cfg.gsync&&S.cfg.gsync.clientId)||'').trim()}
function gDominio(A_){return ((A_&&A_.google&&A_.google.dominio)||(A_&&A_.ms&&A_.ms.dominio)||'').toLowerCase().replace(/^@/,'')}
async function gSessaoDe(at,A_){let j={},st=0;
  for(const u of ['https://openidconnect.googleapis.com/v1/userinfo','https://www.googleapis.com/oauth2/v3/userinfo']){try{const r=await fetch(u,{headers:{Authorization:'Bearer '+at}});st=r.status;if(r.ok){j=await r.json().catch(()=>({}));if(j.email)break}}catch(_){}}
  if(!j.email){try{const r=await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token='+encodeURIComponent(at));const t=await r.json().catch(()=>({}));if(t.email)j.email=t.email}catch(_){}}
  const email=String(j.email||'').toLowerCase();
  if(!email){const e=new Error(st===401||st===403?'A Google recusou o pedido ('+st+'). Tente de novo.':'A Google não deu acesso ao e-mail da conta. Volte a tocar em «Entrar com Google» e, no ecrã da Google, deixe marcada a permissão «Ver o seu endereço de email».');e.semEmail=true;throw e}
  const dom=gDominio(A_);if(dom&&!email.endsWith('@'+dom))throw new Error('A conta '+email+' não pertence ao domínio autorizado ('+dom+').');const _ac=await acVerificar(email);try{gPerfilPreencher(j,email)}catch(e){console.warn(e)}try{audit('Sessão','Entrada Google autorizada ('+_ac.fonte+')',email)}catch(_){}return {u:email,nome:j.name||S.cfg.professor||email,papel:_ac.papel||'professor',tipo:'google',foto:j.picture||'',desde:Date.now()}}
async function gLogin(A_){const id=gLoginId(A_);if(!id){const e=new Error('O início de sessão com Google ainda não está configurado.');e.semId=true;throw e}if(!/^https:/.test(location.protocol))throw new Error(location.protocol==='http:'&&/eduspruce/.test(location.hostname)?'Está a abrir a app sem https. Abra https://'+location.host+' (com «s»). Se o navegador disser que a ligação não é segura, o certificado ainda está a ser emitido: tente daqui a uns minutos.':'A Google exige que a app esteja alojada num endereço https.');
  const scope='openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  if(nvUsarRedirect()){const state='nvglR'+Math.random().toString(36).slice(2);try{localStorage.setItem(NV_AUTH,JSON.stringify({p:'gl',state,q:Date.now(),manter:!!($('#lg-m')&&$('#lg-m').checked)}))}catch(_){}
    location.href='https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:id,redirect_uri:nvRedirect(),response_type:'token',scope,state,prompt:'consent select_account',include_granted_scopes:'true'});return new Promise(()=>{})}
  await gsCarregar();const at=await new Promise((ok,ko)=>{const cli=google.accounts.oauth2.initTokenClient({client_id:id,scope,callback:r=>{if(!(r&&r.access_token))return ko(new Error((r&&r.error)||'Sem autorização'));try{if(google.accounts.oauth2.hasGrantedAnyScope&&!google.accounts.oauth2.hasGrantedAnyScope(r,'https://www.googleapis.com/auth/userinfo.email','email')){const e=new Error('Ficou desmarcada a permissão do e-mail. Volte a tocar em «Entrar com Google» e deixe-a marcada.');return ko(e)}}catch(_){}ok(r.access_token)},error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Janela da Google fechada':'Não foi possível obter autorização da Google'))});cli.requestAccessToken({prompt:'consent select_account'})});
  return await gSessaoDe(at,A_)}
/* regresso do início de sessão Google por redirecionamento (iPhone/iPad) */
(async()=>{try{const h=new URLSearchParams((location.hash||'').replace(/^#/,''));const st=h.get('state')||'';if(!st.startsWith('nvglR'))return;let A0=null;try{A0=JSON.parse(localStorage.getItem(NV_AUTH)||'null')}catch(_){}localStorage.removeItem(NV_AUTH);history.replaceState(null,'',nvRedirect());
  if(!A0||A0.state!==st)return;if(h.get('error')){setTimeout(()=>{const e=$('#lg-err');if(e)e.textContent='Google: '+h.get('error')},800);return}
  const A_=await authCfg();const sess=await gSessaoDe(h.get('access_token'),A_);try{_gLoginTok={t:h.get('access_token'),exp:h.get('expires_in'),sc:h.get('scope')||'',email:sess.u};gLigarDrive()}catch(e){console.warn(e)}guardarSessao(sess,A0.manter!==false);try{regista('Sessão','',sess.u+' entrou (Google)')}catch(_){}location.reload()}
  catch(e){console.warn(e);setTimeout(()=>{const x=$('#lg-err');if(x)x.textContent=e.message},800)}})();
/* quando o ficheiro de configuração chega depois do ecrã de entrada, ativa os botões */
nvCentralCarregar().then(()=>{try{[['#lg-ms',NV_CENTRAL.ms],['#lg-gg',NV_CENTRAL.google]].forEach(([q,v])=>{const b=$(q);if(b&&v&&/^https:/.test(location.protocol)){b.removeAttribute('aria-disabled');const m=b.querySelector('.mut');if(m)m.remove()}})}catch(_){}});
