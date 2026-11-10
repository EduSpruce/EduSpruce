
/* ===================== EduSpruce · Base de Dados EduSpruce (Supabase, UE) — sincronização automática =====================
   Os dados continuam a ser encriptados no aparelho (AES-256-GCM) antes de sair; a base de dados só guarda texto ilegível.
   · entra sozinho na base de dados com a mesma conta Google da app (uma vez por aparelho)
   · passa os dados do Google Drive para a base de dados automaticamente (o Drive fica como cópia)
   · tempo real: uma alteração num aparelho aparece nos outros aparelhos abertos em ~1 s */
NV_LOGO.supabase='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M13.2 2.6c.5-.6 1.5-.2 1.5.6v7.3h6.1c.9 0 1.4 1 .8 1.7l-9.1 10.5c-.5.6-1.5.2-1.5-.6v-7.3H4.9c-.9 0-1.4-1-.8-1.7z" fill="#3ecf8e"/></svg>';
const sbObter=async()=>{for(let i=0;i<120;i++){const m=window.EduSpruceModerno;if(m&&m.supabase)return m.supabase;if(m&&m.pronto&&!m.supabase)throw new Error(m.erro||'A base de dados não está configurada.');await new Promise(r=>setTimeout(r,100))}throw new Error('A base de dados não respondeu. Verifique a ligação à internet.')};
PROV.supabase={n:'Base de dados EduSpruce',async lista(){return (await sbObter()).lista()},async ler(n){return (await sbObter()).ler(n)},async escrever(n,t){return (await sbObter()).escrever(n,t)},async apagar(n){return (await sbObter()).apagar(n)}};
const sbEmailApp=()=>{try{return SESSAO&&SESSAO.tipo==='google'?String(SESSAO.u||'').trim().toLowerCase():''}catch(_){return ''}};
async function sbLigar(silencioso){const p=await sbObter();const {data}=await p.cliente.auth.getSession();
  if(data&&data.session){nvSet({sb:1,conta:data.session.user.email||'',renovar:false});return}
  if(silencioso===true||silencioso==='silencioso'){nvSet({sb:0});return}
  nvSet({prov:'supabase',sb:0});await p.entrarGoogle(sbEmailApp()||undefined);await sbVerificar()}
let _sbCanal=null,_sbOcup=false,_sbAviso=0;
function sbPuxar(){const L=nvL();if(L.prov!=='supabase'||!(L.k||_nvK)||document.getElementById('nvgate'))return;clearTimeout(sbPuxar._t);sbPuxar._t=setTimeout(()=>{nvSincronizar(false).then(()=>{try{nvBadge()}catch(_){}}).catch(()=>{})},150)}
function sbRedesenhar(){try{nvBadge()}catch(_){}try{const c=$('#nv-card');if(c&&typeof nvPainel==='function'){const d=document.createElement('div');d.innerHTML=nvPainel();c.replaceWith(d.firstElementChild);bindNvPainel()}}catch(_){}}
async function sbVerificar(){if(_sbOcup)return;_sbOcup=true;try{const p=await sbObter();const {data}=await p.cliente.auth.getSession();const ses=data&&data.session;const em=sbEmailApp();
  if(!ses){if(nvL().sb)nvSet({sb:0});
    /* entra sozinho com a mesma conta Google (uma vez por separador, para nunca ficar em ciclo) */
    let ja='';try{ja=sessionStorage.getItem('es.sbauto')||''}catch(_){}
    if(em&&!ja&&navigator.onLine&&!document.getElementById('nvgate')){try{sessionStorage.setItem('es.sbauto','1')}catch(_){}await p.entrarGoogle(em)}
    return}
  const se=String(ses.user.email||'').toLowerCase();
  if(em&&se&&se!==em){await p.sair();nvSet({sb:0});try{sessionStorage.removeItem('es.sbauto')}catch(_){}_sbOcup=false;return sbVerificar()}
  if(!nvL().sb||nvL().conta!==se)nvSet({sb:1,conta:se});
  if(!(await p.autorizado())){if(Date.now()-_sbAviso>6e5){_sbAviso=Date.now();toast('Esta conta Google ainda não está autorizada na base de dados EduSpruce.','erro')}return}
  if(!_sbCanal)_sbCanal=p.tempoReal(ses.user.id,sbPuxar)||1;
  const L=nvL();const chave=!!(L.k||_nvK);
  if(L.prov!=='supabase'&&chave){/* passar os dados para a base de dados (o Google Drive fica intacto, como cópia) */
    nvSet({prov:'supabase',base:null,mod:{},erro:'',renovar:false,sbDesde:L.sbDesde||Date.now(),sbDe:L.prov||''});toast('A passar os dados para a base de dados…');
    const r=await nvSincronizar(true).catch(e=>{toast(e.message,'erro');return null});if(r!==null&&!nvL().erro)toast('Os dados estão na base de dados. As alterações passam a aparecer nos outros aparelhos em segundos.','ok');sbRedesenhar()}
  else if(L.prov==='supabase'&&chave)sbPuxar();
  else{/* aparelho novo: a base de dados passa a ser o sítio dos dados; falta só o código de encriptação (uma vez) */
    if(L.prov!=='supabase')nvSet({prov:'supabase',base:null,mod:{},erro:'',renovar:false});
    let ped='';try{ped=sessionStorage.getItem('es.sbpw')||''}catch(_){}
    if(!ped){try{sessionStorage.setItem('es.sbpw','1')}catch(_){}setTimeout(()=>{try{UI.defTab='sync';go('definicoes');toast('Escreva o seu código de encriptação para receber os dados (só neste aparelho, uma vez).','ok');setTimeout(()=>{const i=$('#nv2-p1');if(i)i.focus()},400)}catch(_){}},300)}
    sbRedesenhar()}}
  catch(e){console.warn('[EduSpruce] base de dados:',e.message)}finally{_sbOcup=false}}

/* regresso do Google com erro (ex.: segredo do cliente errado no Supabase): explica e limpa o endereço, sem voltar a tentar sozinho */
try{const q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.slice(1));const er=q.get('error_description')||h.get('error_description');
  if(er&&(q.get('error_code')||h.get('error_code'))){history.replaceState(null,'',location.pathname);try{sessionStorage.setItem('es.sbauto','1')}catch(_){}
    setTimeout(()=>toast('Não foi possível entrar na base de dados ('+decodeURIComponent(er).replace(/\+/g,' ')+'). Os dados continuam no Google Drive.','erro'),1500)}}catch(_){}
/* arranque: espera pela sessão da app; depois verifica de novo sempre que fizer falta (palavra-passe definida, volta à app, rede) */
{let _ok=false;const t=setInterval(()=>{if(_ok)return;if(sbEmailApp()||(SESSAO&&nvL().prov==='supabase')){_ok=true;clearInterval(t);sbVerificar()}},700);
  setInterval(()=>{const L=nvL();if(SESSAO&&L.sb&&L.prov!=='supabase'&&(L.k||_nvK))sbVerificar()},5000);
  {const _dp=nvDefinirPalavra;nvDefinirPalavra=async function(){const r=await _dp.apply(this,arguments);try{if(nvL().prov==='supabase')setTimeout(sbPuxar,200)}catch(_){}return r}}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SESSAO&&nvL().prov==='supabase')setTimeout(sbPuxar,300)});
  addEventListener('online',()=>{if(SESSAO)setTimeout(sbVerificar,800)})}
