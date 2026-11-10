
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
    const r=await nvSincronizar(true).catch(e=>{toast(e.message,'erro');return null});sbFecharPortao();if(r!==null&&!nvL().erro)toast('Os dados estão na base de dados. As alterações passam a aparecer nos outros aparelhos em segundos.','ok');sbRedesenhar()}
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

/* ===== Google Drive como cópia fria (opcional): a base de dados é o sítio dos dados; o Drive guarda, se quiser, uma cópia encriptada ===== */
const gdFrio=()=>nvL().gdFrio||{};
async function gdTokenOk(interativo){try{await gsToken(interativo?true:'silencioso');return true}catch(_){return false}}
async function gdCopiar(interativo){const L=nvL();if(L.prov!=='supabase'||!(L.k||_nvK))return interativo&&toast('Só disponível com a Base de Dados EduSpruce e o código de encriptação.','erro');
  if(gdCopiar._ocup)return;gdCopiar._ocup=true;try{
  if(interativo)ocupado('A preparar a cópia…');try{await nvSincronizar(false)}catch(_){}
  if(!(await gdTokenOk(interativo))){if(interativo){livre();toast('Não foi possível ligar ao Google Drive.','erro')}return}
  const bd=await PROV.supabase.lista();const N=Object.keys(bd);if(!bd[NV_PREF+'manifest.json'])throw new Error('a base de dados ainda não tem dados');
  const G=PROV.google;const m=await G._mapa(true);let n=0;const H={...(gdFrio().h||{})};
  await nvPool(N,4,async k=>{const t=await PROV.supabase.ler(k);if(t==null)return;const hh=nvHash(t);if(m[k]&&H[k]===hh)return;await G.escrever(k,t);H[k]=hh;n++;if(interativo)ocupado('A copiar para o Google Drive… '+n)});
  Object.keys(H).forEach(k=>{if(!bd[k])delete H[k]});
  /* espelho exato: tira do Drive o que já não existe na base de dados */
  const sobra=Object.keys(m).filter(k=>k.startsWith(NV_PREF)&&!bd[k]);await nvPool(sobra,4,async k=>{try{await G.apagar(k)}catch(_){}});
  nvSet({gdFrio:{...gdFrio(),ultima:Date.now(),n:N.length,h:H}});G._ids=null;try{audit('Sincronização','Cópia fria no Google Drive',N.length+' partes')}catch(_){}
  if(interativo)toast('Cópia guardada no Google Drive ('+N.length+' partes, encriptadas).','ok');sbRedesenhar()}
  catch(e){if(interativo)toast('Cópia no Google Drive: '+e.message,'erro');else console.warn('[EduSpruce] cópia fria:',e.message)}
  finally{gdCopiar._ocup=false;if(interativo)livre()}}
async function gdApagar(){const L=nvL();if(L.prov!=='supabase')return toast('Só disponível com a Base de Dados EduSpruce escolhida.','erro');
  if(!(L.k||_nvK))return toast('Escreva primeiro o código de encriptação.','erro');
  let bd;try{await nvSincronizar(true);bd=await PROV.supabase.lista()}catch(e){return toast('Não foi possível confirmar a base de dados: '+e.message,'erro')}
  const nb=Object.keys(bd).length;if(!bd[NV_PREF+'manifest.json']||nb<2)return toast('A base de dados ainda não tem os seus dados. Nada foi apagado.','erro');
  if(nvL().erro||Object.keys(nvL().mod||{}).length)return toast('Há alterações por enviar para a base de dados. Tente daqui a uns segundos.','erro');
  ocupado('A ligar ao Google Drive…');let m;try{await gsToken(true);m=await PROV.google._mapa(true)}catch(e){livre();return toast('Google Drive: '+e.message,'erro')}livre();
  const N=Object.keys(m||{}).filter(k=>k.startsWith(NV_PREF));if(!N.length){nvSet({gdFrio:{...gdFrio(),auto:false,ultima:0,n:0}});sbRedesenhar();return toast('O Google Drive já não tem dados da EduSpruce.','ok')}
  const w=(prompt(`Vai apagar ${N.length} ficheiro${N.length>1?'s':''} da EduSpruce do seu Google Drive (pasta privada da app).\n\nOs dados ficam só na Base de Dados EduSpruce (${nb} partes, confirmadas agora). A cópia diária fica desligada. Não é possível desfazer.\n\nPara confirmar, escreva APAGAR`)||'').trim().toUpperCase();
  if(w!=='APAGAR')return toast('Nada foi apagado.');
  ocupado('A apagar do Google Drive…');let ok=0,f=0;try{await nvPool(N,6,async n=>{try{await PROV.google.apagar(n);ok++}catch(_){f++}})}finally{livre()}
  PROV.google._ids=null;nvSet({gdFrio:{auto:false,ultima:0,n:0,h:{}}});try{localStorage.removeItem(NV_KEEP)}catch(_){}try{audit('Sincronização','Dados apagados do Google Drive',ok+' ficheiros')}catch(_){}
  toast(f?`Apagados ${ok}; ${f} não foi possível apagar — tente outra vez.`:`Google Drive limpo: ${ok} ficheiro${ok>1?'s':''} apagado${ok>1?'s':''}. Os dados estão na base de dados.`,f?'erro':'ok');sbRedesenhar()}
/* cópia diária automática (só se estiver ligada): no máximo uma vez por dia, em silêncio */
setInterval(()=>{try{const L=nvL(),F=gdFrio();if(SESSAO&&L.prov==='supabase'&&F.auto&&(L.k||_nvK)&&navigator.onLine&&document.visibilityState==='visible'&&Date.now()-(F.ultima||0)>864e5)gdCopiar(false)}catch(_){}},60000);
{const _bP=bindNvPainel;bindNvPainel=function(){const r=_bP.apply(this,arguments);try{const c=$('#nv-card');const L=nvL();
  if(c&&L.prov==='supabase'&&!c.querySelector('#nv-gdf')){const F=gdFrio();const s=document.createElement('section');s.className='nvs';s.id='nv-gdf';
    const q=F.ultima?new Date(F.ultima).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'';
    s.innerHTML=`<div class="nvsh"><h3>Cópia no Google Drive (opcional)</h3><p>Os seus dados vivem na base de dados. Se quiser, o Google Drive guarda uma cópia encriptada, só de reserva — nunca é usada para sincronizar.</p></div>
      <div class="nvsb"><label class="chk"><input type="checkbox" id="nv-gdauto" ${F.auto?'checked':''}> Guardar uma cópia por dia, automaticamente</label>
      <p class="hint" style="margin:6px 0 10px">${q?`Última cópia: <b>${esc(q)}</b> · ${F.n||0} partes`:'Ainda não há cópia no Google Drive.'}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn" id="nv-gdcp">${ic('upload',15)} Guardar Cópia Agora</button><button type="button" class="btn dng" id="nv-gdx">${ic('trash',15)} Apagar os Dados do Google Drive</button></div>
      <p class="hint" style="margin:8px 0 0">Antes de apagar, a app confirma que a base de dados tem tudo e pede para escrever APAGAR.</p></div>`;
    const card=c.querySelector('.card:not(.nvhero)')||c;card.appendChild(s);
    s.querySelector('#nv-gdcp').onclick=()=>gdCopiar(true);s.querySelector('#nv-gdx').onclick=gdApagar;
    s.querySelector('#nv-gdauto').onchange=e=>{nvSet({gdFrio:{...gdFrio(),auto:e.target.checked}});toast(e.target.checked?'Cópia diária no Google Drive ligada.':'Cópia diária desligada. A cópia que já existe fica no Drive até a apagar.','ok');if(e.target.checked&&!gdFrio().ultima)gdCopiar(true)}}}catch(e){console.warn(e)}return r}}
/* depois de passar para a base de dados, o ecrã «A sincronizar» antigo (do Google Drive) não fica preso */
function sbFecharPortao(){try{const g=document.getElementById('nvgate');if(g&&nvL().prov==='supabase'){const b=[...g.querySelectorAll('[data-g]')].find(x=>/Continuar/.test(x.textContent));if(b)b.click();else if(g.classList.contains('erro'))g.remove()}}catch(_){}}

/* ===== a lista «Quem Pode Entrar com Google» (Definições › Conta e Acesso) manda também na base de dados =====
   só o administrador a envia; vai a impressão digital de cada e-mail (como no eduspruce-config.json), nunca o e-mail */
async function sbContasLista(){const M=new Map();let C=null;try{C=await acCentral()}catch(_){}if(!C||!C.ok||!Array.isArray(C.contas))return null; /* sem a lista do site não se mexe em nada */
  C.contas.forEach(x=>M.set(x.h,x.papel||'professor'));
  for(const x of (acLocal().gContas||[])){if(x&&x.email){try{M.set(await acHash(x.email),x.papel||'professor')}catch(_){}}}return M}
async function sbContasSincronizar(forcar){try{if(!SESSAO||SESSAO.papel!=='admin'||nvL().prov!=='supabase'||!nvL().sb)return;const p=await sbObter();
  const M=await sbContasLista();if(!M||!M.size)return;const assin=[...M].sort().join('|');if(!forcar&&assin===sbContasSincronizar._a)return;
  const sb=p.cliente;const {data:bd,error}=await sb.from('eduspruce_autorizados').select('h,papel');if(error)return console.warn('[EduSpruce] contas na base de dados:',error.message);
  const tem=new Map((bd||[]).map(r=>[r.h,r.papel]));const juntar=[...M].filter(([h,pp])=>tem.get(h)!==pp).map(([h,papel])=>({h,papel}));
  if(juntar.length){const r=await sb.from('eduspruce_autorizados').upsert(juntar,{onConflict:'h'});if(r.error)return console.warn(r.error.message)}
  const tirar=[...tem.keys()].filter(h=>!M.has(h));if(tirar.length){const r=await sb.from('eduspruce_autorizados').delete().in('h',tirar);if(r.error)console.warn(r.error.message)}
  sbContasSincronizar._a=assin;if(juntar.length||tirar.length){try{audit('Sincronização','Contas autorizadas na base de dados',`+${juntar.length} −${tirar.length}`)}catch(_){}if(forcar)toast('Base de dados atualizada: '+M.size+' conta'+(M.size>1?'s':'')+' autorizada'+(M.size>1?'s':'')+'.','ok')}}
  catch(e){console.warn('[EduSpruce] contas na base de dados:',e.message)}}
setInterval(()=>sbContasSincronizar(false),15000);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ac-add,#ac-col,[data-acdel],[data-acpp],#view select');if(b&&VIEW==='definicoes')setTimeout(()=>sbContasSincronizar(true),900)},true);
document.addEventListener('change',e=>{if(VIEW==='definicoes'&&e.target.closest&&e.target.closest('.card'))setTimeout(()=>sbContasSincronizar(false),900)},true);
