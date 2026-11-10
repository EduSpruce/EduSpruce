
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
async function sbVerificar(){if(_sbOcup||nvL().semSync)return;_sbOcup=true;try{const p=await sbObter();const {data}=await p.cliente.auth.getSession();const ses=data&&data.session;const em=sbEmailApp();
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
    setTimeout(()=>{try{sbLembrete()}catch(_){}},600);
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


/* janela de progresso: título, barra, percentagem, «x de y» e tempo que falta */
function esProgresso(tit,feito,total,sub,t0){let o=$('#ocup');if(!o){o=document.createElement('div');o.id='ocup';o.setAttribute('role','status');document.body.appendChild(o)}
  const pc=total?Math.round(feito/total*100):0;let falta='';if(t0&&feito>2&&feito<total){const s=Math.round((Date.now()-t0)/feito*(total-feito)/1000);falta=s<60?`falta${s===1?'':'m'} ~${Math.max(1,s)} s`:`faltam ~${Math.round(s/60)} min`}
  if(!o.querySelector('.esprg')){o.innerHTML=`<div class="ocb esprg"><div class="esph">${ic('cloud',18)}<b class="espt"></b></div><div class="espb" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="espn"><b class="espp"></b><span class="espx"></span><span class="sp1"></span><span class="espf"></span></div><p class="esps"></p></div>`}
  o.classList.add('on');o.querySelector('.espt').textContent=tit;o.querySelector('.espb i').style.width=pc+'%';o.querySelector('.espb').setAttribute('aria-valuenow',pc);
  o.querySelector('.espp').textContent=pc+'%';o.querySelector('.espx').textContent=`${feito} de ${total} partes`;o.querySelector('.espf').textContent=falta;o.querySelector('.esps').textContent=sub||''}
(()=>{const st=document.createElement('style');st.textContent=`#ocup .esprg{min-width:min(440px,86vw);text-align:left;align-items:stretch}#ocup .esprg>*{width:100%;align-self:stretch}.esprg .esph{justify-content:flex-start;display:flex;align-items:center;gap:10px;margin-bottom:14px;color:var(--acc,#1b93c6)}.esph b{color:var(--ink,#222);font-size:17px}
.esprg .espb{display:block;height:10px;border-radius:99px;background:color-mix(in srgb,var(--mut,#777) 18%,transparent);overflow:hidden}.espb i{display:block;height:100%;width:0;background:var(--acc,#1b93c6);border-radius:inherit;transition:width .25s ease}
.espn{display:flex;align-items:baseline;gap:8px;margin-top:10px;font-size:14px}.espn b{font-size:18px;font-variant-numeric:tabular-nums}.espx,.espf{color:var(--mut,#666);font-variant-numeric:tabular-nums}.esps{margin:8px 0 0;font-size:13px;color:var(--mut,#666)}
body.est-sge .espb,body.est-sge .espb i{border-radius:0}`;document.head.appendChild(st)})();
/* ===== Google Drive como cópia fria (opcional): a base de dados é o sítio dos dados; o Drive guarda, se quiser, uma cópia encriptada ===== */
/* o estado da cópia (ligada, última cópia, n.º de partes) vai com os dados — vê-se igual em todos os aparelhos; os resumos (hashes) ficam em cada aparelho */
const gdFrio=()=>{let c={};try{c=(S.cfg&&S.cfg.gdFrio)||{}}catch(_){}const l=nvL().gdFrio||{};return {auto:c.auto!=null?c.auto:!!l.auto,ultima:Math.max(c.ultima||0,l.ultima||0),n:c.n||l.n||0,h:nvL().gdFrioH||l.h||{}}};
const gdFrioSet=o=>{const x={...gdFrio(),...o};try{S.cfg.gdFrio={auto:!!x.auto,ultima:x.ultima||0,n:x.n||0};save()}catch(_){}nvSet({gdFrioH:x.h||{},gdFrio:null})};
async function gdTokenOk(interativo){try{await gsToken(interativo?true:'silencioso');return true}catch(_){return false}}
async function gdCopiar(interativo){const L=nvL();if(L.prov!=='supabase'||!(L.k||_nvK))return interativo&&toast('Só disponível com a Base de Dados EduSpruce e o código de encriptação.','erro');
  if(gdCopiar._ocup)return;gdCopiar._ocup=true;try{
  if(interativo)ocupado('A preparar a cópia…');try{await nvSincronizar(false)}catch(_){}
  if(!(await gdTokenOk(interativo))){if(interativo){livre();toast('Não foi possível ligar ao Google Drive.','erro')}return}
  const bd=await PROV.supabase.lista();const N=Object.keys(bd);if(!bd[NV_PREF+'manifest.json'])throw new Error('a base de dados ainda não tem dados');
  const G=PROV.google;const m=await G._mapa(true);let n=0,feito=0;const H={...(gdFrio().h||{})};const t0=Date.now();
  if(interativo)esProgresso('Cópia no Google Drive',0,N.length,'A comparar com a cópia anterior…');
  await nvPool(N,4,async k=>{try{const t=await PROV.supabase.ler(k);if(t==null)return;const hh=nvHash(t);if(m[k]&&H[k]===hh)return;await G.escrever(k,t);H[k]=hh;n++}finally{feito++;if(interativo)esProgresso('Cópia no Google Drive',feito,N.length,n?`${n} parte${n>1?'s':''} atualizada${n>1?'s':''} · ${feito-n} já estava${feito-n===1?'':'m'} em dia`:'A comparar com a cópia anterior…',t0)}});
  Object.keys(H).forEach(k=>{if(!bd[k])delete H[k]});
  /* espelho exato: tira do Drive o que já não existe na base de dados */
  const sobra=Object.keys(m).filter(k=>k.startsWith(NV_PREF)&&!bd[k]);await nvPool(sobra,4,async k=>{try{await G.apagar(k)}catch(_){}});
  gdFrioSet({ultima:Date.now(),n:N.length,h:H});G._ids=null;try{audit('Sincronização','Cópia fria no Google Drive',N.length+' partes')}catch(_){}
  if(interativo)toast(n?`Cópia guardada no Google Drive: ${n} parte${n>1?'s':''} atualizada${n>1?'s':''} de ${N.length} (encriptadas).`:`A cópia no Google Drive já estava em dia (${N.length} partes).`,'ok');sbRedesenhar()}
  catch(e){if(interativo)toast('Cópia no Google Drive: '+e.message,'erro');else console.warn('[EduSpruce] cópia fria:',e.message)}
  finally{gdCopiar._ocup=false;if(interativo)livre()}}
async function gdApagar(){const L=nvL();if(L.prov!=='supabase')return toast('Só disponível com a Base de Dados EduSpruce escolhida.','erro');
  if(!(L.k||_nvK))return toast('Escreva primeiro o código de encriptação.','erro');
  let bd;try{await nvSincronizar(true);bd=await PROV.supabase.lista()}catch(e){return toast('Não foi possível confirmar a base de dados: '+e.message,'erro')}
  const nb=Object.keys(bd).length;if(!bd[NV_PREF+'manifest.json']||nb<2)return toast('A base de dados ainda não tem os seus dados. Nada foi apagado.','erro');
  if(nvL().erro||Object.keys(nvL().mod||{}).length)return toast('Há alterações por enviar para a base de dados. Tente daqui a uns segundos.','erro');
  ocupado('A ligar ao Google Drive…');let m;try{await gsToken(true);m=await PROV.google._mapa(true)}catch(e){livre();return toast('Google Drive: '+e.message,'erro')}livre();
  const N=Object.keys(m||{}).filter(k=>k.startsWith(NV_PREF));if(!N.length){gdFrioSet({auto:false,ultima:0,n:0});sbRedesenhar();return toast('O Google Drive já não tem dados da EduSpruce.','ok')}
  const w=(prompt(`Vai apagar ${N.length} ficheiro${N.length>1?'s':''} da EduSpruce do seu Google Drive (pasta privada da app).\n\nOs dados ficam só na Base de Dados EduSpruce (${nb} partes, confirmadas agora). A cópia diária fica desligada. Não é possível desfazer.\n\nPara confirmar, escreva APAGAR`)||'').trim().toUpperCase();
  if(w!=='APAGAR')return toast('Nada foi apagado.');
  ocupado('A apagar do Google Drive…');let ok=0,f=0;try{await nvPool(N,6,async n=>{try{await PROV.google.apagar(n);ok++}catch(_){f++}})}finally{livre()}
  PROV.google._ids=null;gdFrioSet({auto:false,ultima:0,n:0,h:{}});try{localStorage.removeItem(NV_KEEP)}catch(_){}try{audit('Sincronização','Dados apagados do Google Drive',ok+' ficheiros')}catch(_){}
  toast(f?`Apagados ${ok}; ${f} não foi possível apagar — tente outra vez.`:`Google Drive limpo: ${ok} ficheiro${ok>1?'s':''} apagado${ok>1?'s':''}. Os dados estão na base de dados.`,f?'erro':'ok');sbRedesenhar()}
/* cópia diária automática (só se estiver ligada): no máximo uma vez por dia, em silêncio */
setInterval(()=>{try{const L=nvL(),F=gdFrio();if(SESSAO&&L.prov==='supabase'&&F.auto&&(L.k||_nvK)&&navigator.onLine&&document.visibilityState==='visible'&&Date.now()-(F.ultima||0)>864e5)gdCopiar(false)}catch(_){}},60000);
{const _bP=bindNvPainel;bindNvPainel=function(){const r=_bP.apply(this,arguments);try{const c=$('#nv-card');const L=nvL();
  if(c&&L.prov==='supabase'&&!c.querySelector('#nv-gdf')){const F=gdFrio();const s=document.createElement('section');s.className='nvs';s.id='nv-gdf';
    const q=F.ultima?new Date(F.ultima).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):'';
    s.innerHTML=`<div class="nvsh"><h3>Cópia no Google Drive (opcional)</h3><p>Os seus dados vivem na base de dados. Se quiser, o Google Drive guarda uma cópia encriptada, só de reserva — nunca é usada para sincronizar.</p></div>
      <div class="nvsb"><label class="chk"><input type="checkbox" id="nv-gdauto" ${F.auto?'checked':''}> Guardar uma cópia por dia, automaticamente</label>
      <p class="hint" style="margin:6px 0 10px">${q?`Última cópia: <b>${esc(q)}</b> · ${F.n||0} partes`:'Ainda não foi feita nenhuma cópia a partir da base de dados. (O Google Drive pode ter ainda os dados da sincronização antiga — pode apagá-los aqui.)'}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn" id="nv-gdcp">${ic('upload',15)} Guardar Cópia Agora</button><button type="button" class="btn dng" id="nv-gdx">${ic('trash',15)} Apagar os Dados do Google Drive</button></div>
      <p class="hint" style="margin:8px 0 0">Antes de apagar, a app confirma que a base de dados tem tudo e pede para escrever APAGAR.</p></div>`;
    const card=c.querySelector('.card:not(.nvhero)')||c;card.appendChild(s);
    s.querySelector('#nv-gdcp').onclick=()=>gdCopiar(true);s.querySelector('#nv-gdx').onclick=gdApagar;
    s.querySelector('#nv-gdauto').onchange=e=>{gdFrioSet({auto:e.target.checked});toast(e.target.checked?'Cópia diária no Google Drive ligada.':'Cópia diária desligada. A cópia que já existe fica no Drive até a apagar.','ok');if(e.target.checked&&!gdFrio().ultima)gdCopiar(true)}}}catch(e){console.warn(e)}return r}}
/* depois de passar para a base de dados, o ecrã «A sincronizar» antigo (do Google Drive) não fica preso */
function sbFecharPortao(){try{const g=document.getElementById('nvgate');if(g&&nvL().prov==='supabase'){const b=[...g.querySelectorAll('[data-g]')].find(x=>/Continuar/.test(x.textContent));if(b)b.click();else if(g.classList.contains('erro'))g.remove()}}catch(_){}}

/* ===== a lista «Quem Pode Entrar com Google» (Definições › Conta e Acesso) manda também na base de dados =====
   só o administrador a envia; vai a impressão digital de cada e-mail (como no eduspruce-config.json), nunca o e-mail */
async function sbContasLista(){const M=new Map();let C=null;try{C=await acCentral()}catch(_){}if(!C||!C.ok||!Array.isArray(C.contas))return null; /* sem a lista do site não se mexe em nada */
  C.contas.forEach(x=>M.set(x.h,x.papel||'professor'));
  for(const x of (acLocal().gContas||[])){if(x&&x.email){try{M.set(await acHash(x.email),x.papel||'professor')}catch(_){}}}return M}
async function sbContasSincronizar(forcar){try{if(!SESSAO||SESSAO.papel!=='admin'||nvL().prov!=='supabase'||!nvL().sb)return;const p=await sbObter();
  const M=await sbContasLista();if(!M||!M.size)return;const assin=[...M].sort().join('|');if(!forcar&&assin===sbContasSincronizar._a)return;
  if(sbContasSincronizar._parado)return;const sb=p.cliente;const {data:bd,error}=await sb.from('eduspruce_autorizados').select('h,papel');if(error){/* sem o script das contas no Supabase: pára até recarregar, para não encher os registos de erros */if(/42501|PGRST|permission|does not exist/i.test((error.code||'')+' '+error.message))sbContasSincronizar._parado=true;return console.warn('[EduSpruce] contas na base de dados:',error.message)}
  const tem=new Map((bd||[]).map(r=>[r.h,r.papel]));const juntar=[...M].filter(([h,pp])=>tem.get(h)!==pp).map(([h,papel])=>({h,papel}));
  if(juntar.length){const r=await sb.from('eduspruce_autorizados').upsert(juntar,{onConflict:'h'});if(r.error)return console.warn(r.error.message)}
  const tirar=[...tem.keys()].filter(h=>!M.has(h));if(tirar.length){const r=await sb.from('eduspruce_autorizados').delete().in('h',tirar);if(r.error)console.warn(r.error.message)}
  sbContasSincronizar._a=assin;if(juntar.length||tirar.length){try{audit('Sincronização','Contas autorizadas na base de dados',`+${juntar.length} −${tirar.length}`)}catch(_){}if(forcar)toast('Base de dados atualizada: '+M.size+' conta'+(M.size>1?'s':'')+' autorizada'+(M.size>1?'s':'')+'.','ok')}}
  catch(e){console.warn('[EduSpruce] contas na base de dados:',e.message)}}
setInterval(()=>sbContasSincronizar(false),15000);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ac-add,#ac-col,[data-acdel],[data-acpp],#view select');if(b&&VIEW==='definicoes')setTimeout(()=>sbContasSincronizar(true),900)},true);
document.addEventListener('change',e=>{if(VIEW==='definicoes'&&e.target.closest&&e.target.closest('.card'))setTimeout(()=>sbContasSincronizar(false),900)},true);

/* ===== abrir como uma app normal: com a base de dados e dados neste aparelho, nada de ecrã «A sincronizar» =====
   mostra logo os dados deste aparelho e atualiza em segundo plano (tempo real); o ecrã de espera só aparece num aparelho novo, sem dados */
{const _sg=nvSyncGate;nvSyncGate=async function(){try{const L=nvL();const temDados=S&&Array.isArray(S.anos)&&S.anos.length>0;
  if(L.prov==='supabase'&&temDados&&(L.k||_nvK)){const g=document.getElementById('nvgate');if(g)g.remove();document.body.classList.remove('nv-gating');try{window.__nvGateFila&&window.__nvGateFila()}catch(_){}setTimeout(sbPuxar,400);return}}catch(_){}return _sg.apply(this,arguments)}}

/* ===== sem perguntas ao entrar: um lembrete discreto em vez do assistente; e a opção «Não Sincronizar» ===== */
let _gesto=0;['pointerdown','keydown'].forEach(t=>addEventListener(t,e=>{if(e.isTrusted)_gesto=Date.now()},true));
{const _as=nvAssist;nvAssist=function(forcar){/* só abre o assistente quando a pessoa o pede (toque/clique); ao entrar, mostra apenas o lembrete */
  if(Date.now()-_gesto<1500)return _as.apply(this,arguments);try{sbLembrete()}catch(_){}}}
function sbNaoSincronizar(){nvSet({semSync:true,prov:'',base:null,mod:{},erro:'',renovar:false});try{_nvK=null}catch(_){}
  $$('dialog.nvas').forEach(d=>{try{d.close()}catch(_){}d.remove()});const g=document.getElementById('nvgate');if(g)g.remove();document.body.classList.remove('nv-gating');
  const l=document.getElementById('sblemb');if(l)l.remove();try{nvBadge()}catch(_){}try{audit('Sincronização','Não sincronizar neste aparelho','')}catch(_){}
  toast('Sem sincronização neste aparelho: os dados ficam só aqui. Pode ativar em Definições › Sincronização.','ok');sbRedesenhar()}
function sbAtivarSync(){nvSet({semSync:false,prov:'supabase',base:null,mod:{},erro:''});const l=document.getElementById('sblemb');if(l)l.remove();
  UI.defTab='sync';go('definicoes');setTimeout(()=>{sbVerificar();const i=$('#nv2-p1');if(i)i.focus()},400)}
function sbLembrete(){try{const L=nvL();if(!SESSAO||L.semSync||(L.k||_nvK)||document.getElementById('sblemb')||document.body.classList.contains('login-on'))return;
  let vis='';try{vis=sessionStorage.getItem('es.sblemb')||''}catch(_){}if(vis)return;
  const d=document.createElement('div');d.id='sblemb';d.setAttribute('role','status');
  d.innerHTML=`<span class="sbli">${ic('cloud',18)}</span><div class="sblt"><b>Sincronização por ativar</b><span>Para ter os mesmos dados no computador, no iPad e no iPhone, escreva o seu código de encriptação.</span></div><div class="sbla"><button type="button" class="btn pri sm" id="sbl-at">Ativar</button><button type="button" class="btn sm" id="sbl-no">Não Sincronizar</button><button type="button" class="btn sm ico" id="sbl-x" aria-label="Fechar">${ic('x',14)}</button></div>`;
  document.body.appendChild(d);d.querySelector('#sbl-at').onclick=sbAtivarSync;d.querySelector('#sbl-no').onclick=sbNaoSincronizar;
  d.querySelector('#sbl-x').onclick=()=>{try{sessionStorage.setItem('es.sblemb','1')}catch(_){}d.remove()}}catch(e){console.warn(e)}}
/* o assistente (quando a pessoa o abre) e o painel também têm «Não Sincronizar»; com a sincronização desligada, o painel mostra como voltar a ligar */
setInterval(()=>{const d=$('dialog.nvas');if(d&&!d.querySelector('#nvas-nosync')){const f=d.querySelector('footer');if(f){const b=document.createElement('button');b.type='button';b.className='btn';b.id='nvas-nosync';b.textContent='Não Sincronizar';b.onclick=e=>{e.preventDefault();sbNaoSincronizar()};f.insertBefore(b,f.firstChild)}}},500);
{const _bP=bindNvPainel;bindNvPainel=function(){const r=_bP.apply(this,arguments);try{const c=$('#nv-card');const L=nvL();if(!c)return r;
  const o=c.querySelector('.nvobr');if(o)o.remove();
  if(L.semSync&&!c.querySelector('#nv-semsync')){const s=document.createElement('div');s.id='nv-semsync';s.className='alert';s.innerHTML=`${ic('info',16)} <span><b>Sincronização desligada neste aparelho.</b> Os dados ficam só aqui (não vão para a base de dados nem para os outros aparelhos).</span> <button type="button" class="btn pri sm" id="nv-ssat">Ativar Sincronização</button>`;c.insertBefore(s,c.firstChild);s.querySelector('#nv-ssat').onclick=sbAtivarSync}
  else if(!L.semSync&&L.prov&&!c.querySelector('#nv-ssno')){const card=c.querySelector('.card:not(.nvhero)')||c;const s=document.createElement('section');s.className='nvs';s.innerHTML=`<div class="nvsh"><h3>Não Sincronizar</h3><p>Usar a app só neste aparelho, mesmo com a conta Google. Os dados deixam de ir para a base de dados.</p></div><div class="nvsb"><button type="button" class="btn" id="nv-ssno">${ic('x',15)} Não Sincronizar neste Aparelho</button></div>`;card.appendChild(s);
    s.querySelector('#nv-ssno').onclick=()=>{if(confirm('Deixar de sincronizar neste aparelho?\n\nOs dados ficam só aqui. Os outros aparelhos e a base de dados não recebem as alterações feitas aqui.'))sbNaoSincronizar()}}}catch(e){console.warn(e)}return r}}
(()=>{const st=document.createElement('style');st.textContent=`#sblemb{position:fixed;left:12px;right:12px;margin:0 auto;bottom:max(16px,env(safe-area-inset-bottom));z-index:9000;max-width:680px;box-sizing:border-box;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 14px;background:var(--panel,#fff);color:var(--ink,#222);border:1px solid var(--line,#ddd);border-left:4px solid var(--acc,#1b93c6);border-radius:12px;box-shadow:0 14px 40px -12px rgba(0,0,0,.35);animation:egUp .35s ease both}
#sblemb .sbli{color:var(--acc,#1b93c6);display:flex}#sblemb .sblt{flex:1 1 260px;min-width:0}#sblemb .sblt b{display:block;font-size:14.5px}#sblemb .sblt span{display:block;font-size:13px;color:var(--mut,#666);line-height:1.35}
#sblemb .sbla{display:flex;gap:6px;flex-wrap:wrap}body.est-sge #sblemb{border-radius:0}#nv-semsync{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}#nv-semsync span{flex:1 1 260px}`;document.head.appendChild(st)})();
