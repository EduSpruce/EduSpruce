/* =====================================================================
   v0.35 (D) — arrastar aulas no meu horário; importações sempre nos
   Documentos; sincronização com uma conta Google (Google Drive)
   ===================================================================== */
/* ---------- arrastar aulas (como os tempos não letivos) ---------- */
function garantirHorProf(a){if(a.horProf&&a.horProf.aulas&&a.horProf.aulas.length)return a.horProf;const TT=a.turmas.filter(t=>escolaDe(t)===EC());const aulas=[],mapa={};
  TT.forEach(t=>aulasTurma(t,a).forEach(x=>{const o={dia:x.dia,ini:x.ini,fim:x.fim,turma:x.classe||turmasDaClasse(t)[0]||t.nome,sig:x.ab||siglaDe(t),sala:x.sala||''};if(!aulas.some(q=>q.dia===o.dia&&q.ini===o.ini&&q.turma===o.turma&&q.sig===o.sig)){aulas.push(o);mapa[chaveAula(o)]=t.id}}));
  const ant=a.horProf||{};a.horProf={...ant,ficheiro:ant.ficheiro||'(manual)',docente:ant.docente||S.cfg.professor||'',ano:ant.ano||a.nome,aulas,mapa:{...(ant.mapa||{}),...mapa}};return a.horProf}
function moverAula(spec,dia,ini){const a=A();const p=spec.split('|');const d0=+p[1],i0=+p[2];if(d0===dia&&i0===ini)return;const H=garantirHorProf(a);
  const x=H.aulas.find(o=>o.dia===d0&&o.ini===i0&&(p[0]==='t'?H.mapa[chaveAula(o)]===p[3]:normTurma(o.turma)===normTurma(p[3])&&normSig(o.sig)===normSig(p[4]||o.sig)));if(!x)return toast('Não foi possível mover este tempo','erro');
  const ocup=H.aulas.find(o=>o!==x&&o.dia===dia&&o.ini===ini)||(a.naoLetivos||[]).find(n=>n.dia===dia&&n.ini===ini);
  if(ocup&&!confirm('Esse tempo já está ocupado ('+(ocup.turma||ocup.sig)+'). Pôr também esta aula lá?'))return;
  const s=slotsConhecidos(a).find(s=>s.ini===ini);const dur=(x.fim||x.ini+45)-x.ini;const de=DIAS_C[x.dia]+' '+fmtHM(x.ini);x.dia=dia;x.ini=ini;x.fim=s?s.fim:ini+dur;H.editado=new Date().toISOString();
  saveNow();audit('Horário','Aula movida',x.turma+' '+x.sig+': '+de+' → '+DIAS_C[dia]+' '+fmtHM(ini));toast(x.turma+' · '+DIAS[dia]+' '+fmtHM(ini)+' (⌘Z para anular)','ok');go('meuhorario')}
function ativarArrastoAulas(tab){if(!tab)return;let st=null;const alvo=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('td[data-cel]'):null};
  tab.querySelectorAll('.aula[data-aula]').forEach(el=>{el.style.cursor='grab';el.style.touchAction='none';
    el.addEventListener('pointerdown',e=>{if(e.button>0)return;st={el,x:e.clientX,y:e.clientY,on:false,td:null};try{el.setPointerCapture(e.pointerId)}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!st||st.el!==el)return;if(!st.on){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<8)return;st.on=true;const r=el.getBoundingClientRect();
        st.gh=el.cloneNode(true);st.gh.classList.add('ghost');Object.assign(st.gh.style,{width:r.width+'px',left:r.left+'px',top:r.top+'px'});st.dx=e.clientX-r.left;st.dy=e.clientY-r.top;document.body.appendChild(st.gh);el.classList.add('drag-src');tab.classList.add('arrastar')}
      e.preventDefault();st.gh.style.left=(e.clientX-st.dx)+'px';st.gh.style.top=(e.clientY-st.dy)+'px';const td=alvo(e.clientX,e.clientY);if(td!==st.td){if(st.td)st.td.classList.remove('drop');st.td=td;if(td)td.classList.add('drop')}});
    const fim=e=>{if(!st||st.el!==el)return;const s_=st;st=null;if(!s_.on){if(e.type==='pointerup'&&!String(el.dataset.aula||'').startsWith('t|'))editarHorarioDlg();return}s_.gh.remove();el.classList.remove('drag-src');tab.classList.remove('arrastar');if(s_.td)s_.td.classList.remove('drop');
      const td=s_.td||alvo(e.clientX,e.clientY);if(!td)return;const [d,ini]=td.dataset.cel.split('|').map(Number);moverAula(el.dataset.aula,d,ini)};
    el.addEventListener('pointerup',fim);el.addEventListener('pointercancel',fim)})}
{const _mh=vMeuHorario;vMeuHorario=function(){_mh.apply(this,arguments);const tab=$('.card.wide table.hor');if(!tab)return;const a=A();const TT=turmasFiltradas(a);const H=a.horProf;
  /* marca cada aula da grelha com a sua identificação (dia|hora|turma) para poder ser arrastada */
  tab.querySelectorAll('td[data-cel]').forEach(td=>{const [d,ini]=td.dataset.cel.split('|').map(Number);const els=[...td.querySelectorAll('.aula:not(.nl)')];if(!els.length)return;
    const daqui=[];TT.forEach(t=>aulasTurma(t,a).filter(x=>x.dia===d&&x.ini===ini).forEach(x=>daqui.push('t|'+d+'|'+ini+'|'+t.id)));
    if(H&&!S.filtroOferta)H.aulas.filter(x=>!H.mapa[chaveAula(x)]&&x.dia===d&&x.ini===ini).forEach(x=>daqui.push('o|'+d+'|'+ini+'|'+x.turma+'|'+x.sig));
    els.forEach((el,i)=>{if(daqui[i])el.dataset.aula=daqui[i]})});
  tab.querySelectorAll('tbody tr:not(.pausa)').forEach(tr=>{if(!tr.querySelector('.aula'))tr.classList.add('tvaz')});
  ativarArrastoAulas(tab);const h=[...$$('.card.wide .hint')].find(x=>/Arraste/.test(x.textContent));const txt='Toque numa aula para fazer o sumário desta semana; arraste qualquer tempo para outro dia ou hora; use «Editar Horário» para alterar o horário.';
  if(h)h.textContent=txt;else{const r=$('.card.wide .row');if(r&&tab.querySelector('[data-aula]'))r.insertAdjacentHTML('beforeend',`<span class="hint noprint" style="margin:0 0 0 6px;flex-basis:100%">${txt}</span>`)}}}

/* ---------- importações: guardar sempre o ficheiro original nos Documentos ---------- */
{const tipos={lerXlsx:'Turmas (Excel)',lerFicheiro:'Importação',lerCalendarioPdf:'Calendário escolar (PDF)',lerHorarioXlsx:'Horários das turmas (Excel)',lerHorarioProfPdf:'Horário do professor (PDF)'};
  const w=(fn,tp)=>function(file){try{if(file&&file.name){const t_=tp==='Importação'?(/\.pdf$/i.test(file.name)?'Documentos PDF importados':/\.(xlsx|xlsm|xls|csv)$/i.test(file.name)?'Folhas de cálculo importadas':'Outros ficheiros importados'):tp;guardarImportado(t_,file)}}catch(_){}return fn.apply(this,arguments)};
  lerXlsx=w(lerXlsx,tipos.lerXlsx);lerFicheiro=w(lerFicheiro,tipos.lerFicheiro);lerCalendarioPdf=w(lerCalendarioPdf,tipos.lerCalendarioPdf);lerHorarioXlsx=w(lerHorarioXlsx,tipos.lerHorarioXlsx);lerHorarioProfPdf=w(lerHorarioProfPdf,tipos.lerHorarioProfPdf)}
/* qualquer escolha de ficheiro fica marcada; quando a importação é registada, o original vai para os Documentos */
document.addEventListener('change',e=>{const i=e.target;if(i&&i.type==='file'&&i.files)[...i.files].forEach(marcarImport)},true);
document.addEventListener('drop',e=>{try{[...(e.dataTransfer&&e.dataTransfer.files||[])].forEach(marcarImport)}catch(_){}},true);
{const _gi=guardarImportado;guardarImportado=async function(tipo,f){if(!f)return;const L=importados();const ex=L.find(x=>x.nome===f.name&&x.tam===f.size);if(ex){if(!/importad|^Importação/.test(tipo))ex.tipo=tipo;ex.q=Date.now();save();return}return _gi.apply(this,arguments)}}

/* ---------- Sincronização com uma conta Google (Google Drive, pasta privada da app) ---------- */
const GS_KEY='edugest.gsync';const GS_FICH='eduflow-dados.json';
const gsCfg=()=>S.cfg.gsync=S.cfg.gsync||{clientId:'',auto:true};
const gsLocal=()=>{try{return JSON.parse(localStorage.getItem(GS_KEY)||'{}')}catch(_){return {}}};const gsSetLocal=o=>{try{localStorage.setItem(GS_KEY,JSON.stringify({...gsLocal(),...o}))}catch(_){}};
let _gsTok=null,_gsCli=null,_gsBusy=false;
async function gsCarregar(){if(window.google&&google.accounts&&google.accounts.oauth2)return;await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível ligar à Google (sem internet?).'));document.head.appendChild(s)})}
async function gsToken(interativo){if(_gsTok&&_gsTok.exp>Date.now()+60000)return _gsTok.t;const c=gsCfg();if(!c.clientId)throw new Error('Indique primeiro o ID de cliente OAuth da Google (Definições › Segurança › Sincronização).');
  if(!/^https:/.test(location.protocol)&&!/^http:\/\/localhost/.test(location.href))throw new Error('A sincronização com a Google só funciona com a app alojada num endereço https.');
  await gsCarregar();return await new Promise((ok,ko)=>{_gsCli=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope:'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email',
    callback:r=>{if(r&&r.access_token){_gsTok={t:r.access_token,exp:Date.now()+(+r.expires_in||3600)*1000};ok(r.access_token)}else ko(new Error((r&&r.error)||'Sem autorização'))},error_callback:e=>ko(new Error(e&&e.type==='popup_closed'?'Janela da Google fechada':'Não foi possível obter autorização da Google'))});
    _gsCli.requestAccessToken({prompt:interativo?(c.email?'':'consent'):'none',hint:c.email||undefined})})}
async function gsFetch(url,opt){const t=await gsToken(false).catch(()=>null)||_gsTok&&_gsTok.t;const r=await fetch(url,{...(opt||{}),headers:{...((opt||{}).headers||{}),Authorization:'Bearer '+t}});if(r.status===401){_gsTok=null;throw new Error('Sessão Google expirada — volte a ligar a conta.')}if(!r.ok)throw new Error('Google Drive: erro '+r.status);return r}
async function gsRemoto(){const q=encodeURIComponent("name='"+GS_FICH+"'");const r=await gsFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+q+'&fields=files(id,modifiedTime,size,appProperties)');const j=await r.json();return (j.files||[])[0]||null}
async function gsEnviar(f){const txt=dadosCopia(false);const ts=String(S._ts||Date.now());const meta={name:GS_FICH,appProperties:{ts,disp:navigator.platform||'',ver:VERSAO}};if(!f)meta.parents=['appDataFolder'];
  const b='eduflow'+Math.random().toString(36).slice(2);const body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${txt}\r\n--${b}--`;
  await gsFetch('https://www.googleapis.com/upload/drive/v3/files'+(f?'/'+f.id:'')+'?uploadType=multipart',{method:f?'PATCH':'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body});gsSetLocal({rts:+ts,lts:+ts});gsCfg().ultimo=Date.now();save();return txt.length}
async function gsReceber(f){const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+f.id+'?alt=media');const o=await r.json();const st=o.estado||o;const err=validarCopia(st);if(err.length)throw new Error('Os dados na conta Google estão danificados: '+err[0]);
  const keep={clientId:gsCfg().clientId,email:gsCfg().email,auto:gsCfg().auto};S=migrate(st);S.cfg.gsync={...(S.cfg.gsync||{}),...keep,ultimo:Date.now()};Object.entries(o.fotos||{}).forEach(([k,v])=>{FOTOS[k]=v;idbPor(k,v)});
  _semHist=true;saveNow();_semHist=false;const ts=+(f.appProperties&&f.appProperties.ts)||Date.now();gsSetLocal({rts:ts,lts:S._ts});aplicarPrefs();go('inicio')}
async function sincronizarGoogle(interativo,forcar){if(_gsBusy)return;_gsBusy=true;gsEstado('a sincronizar…');
  try{if(interativo)await gsToken(true);const f=await gsRemoto();const L=gsLocal();const rts=f?+((f.appProperties||{}).ts||0):0;const locMud=(S._ts||0)>(L.lts||0),remMud=rts>(L.rts||0);
    if(!f){const n=await gsEnviar(null);gsEstado('dados enviados para a conta Google');audit('Sincronização','Primeiro envio',fmtBytes(n));if(interativo)toast('Dados guardados na conta Google','ok');return}
    if(forcar==='enviar'||(locMud&&!remMud)){const n=await gsEnviar(f);gsEstado('sincronizado');audit('Sincronização','Envio',fmtBytes(n));if(interativo)toast('Sincronizado — alterações enviadas','ok');return}
    if(forcar==='receber'||(remMud&&!locMud)){await gsReceber(f);gsEstado('sincronizado');audit('Sincronização','Receção',new Date(rts).toLocaleString('pt-PT'));toast('Dados atualizados a partir da conta Google','ok');return}
    if(remMud&&locMud){gsEstado('conflito');gsConflito(f,rts);return}
    gsEstado('sincronizado');if(interativo)toast('Já está tudo sincronizado','ok')}
  catch(e){gsEstado('erro: '+e.message);if(interativo)alert(e.message)}finally{_gsBusy=false}}
function gsConflito(f,rts){openDrawer('Sincronização — Escolher os Dados',`<div class="ed"><div class="alert w">${ic('alert',15)} Os dados mudaram neste dispositivo <b>e</b> noutro dispositivo desde a última sincronização.</div>
  <div class="g2" style="margin-top:12px"><button class="btn gsop" id="gs-rec"><b>${ic('download',16)} Usar os da Conta Google</b><span class="mut">Guardados a ${esc(new Date(rts).toLocaleString('pt-PT'))}${f.appProperties&&f.appProperties.disp?' · '+esc(f.appProperties.disp):''}</span></button>
  <button class="btn gsop" id="gs-env"><b>${ic('upload',16)} Manter os Deste Dispositivo</b><span class="mut">Alterados a ${esc(new Date(S._ts).toLocaleString('pt-PT'))} — substituem os da conta</span></button></div>
  <p class="hint">Antes de substituir, é feita uma cópia automática dos dados atuais (pode anular com ⌘Z ou recuperar em Definições › Dados).</p></div>`);
  $('#gs-rec').onclick=()=>{try{localStorage.setItem(KEY+'.antesSync',JSON.stringify(S))}catch(_){}closeDrawer();sincronizarGoogle(false,'receber')};$('#gs-env').onclick=()=>{closeDrawer();sincronizarGoogle(false,'enviar')}}
function gsEstado(t){UI.gsEst=t;const e=$('#gs-st');if(e)e.textContent=t;const b=$('#gsBadge');if(b){b.title='Google: '+t;b.classList.toggle('err',/erro|conflito/.test(t));b.classList.toggle('run',/a sincronizar/.test(t))}}
/* envio automático alguns segundos depois de cada alteração (quando a conta está ligada e há autorização) */
let _gsT=null;{const _sv2=saveNow;saveNow=function(){const r=_sv2.apply(this,arguments);try{const c=S.cfg.gsync;if(c&&c.clientId&&c.email&&c.auto!==false&&_gsTok&&!_gsBusy){clearTimeout(_gsT);_gsT=setTimeout(()=>sincronizarGoogle(false),15000)}}catch(_){}return r}}
/* ao abrir a app: tenta sincronizar sem janelas (se a conta já foi autorizada) */
setTimeout(()=>{try{const c=S.cfg.gsync;if(c&&c.clientId&&c.email&&c.auto!==false&&SESSAO)gsToken(false).then(()=>sincronizarGoogle(false)).catch(()=>gsEstado('toque em Sincronizar para voltar a ligar'))}catch(_){}},4000);
addEventListener('visibilitychange',()=>{try{const c=S.cfg.gsync;if(document.visibilityState==='hidden'&&c&&c.email&&_gsTok&&(S._ts||0)>(gsLocal().lts||0))sincronizarGoogle(false)}catch(_){}});
function cartaoSyncGoogle(){const c=gsCfg();const L=gsLocal();
  return `<div class="card ed" id="gs-card"><div class="row"><h2 style="margin:0">${ic('refresh',18)} Sincronização com a Conta Google</h2><span class="sp1"></span>${c.email?`<span class="tag ok">${esc(c.email)}</span>`:'<span class="tag">não ligada</span>'}</div>
   <p class="hint">Guarda os dados (incluindo fotografias e documentos) numa pasta privada da app no seu Google Drive e mantém o iPad, o computador e outros dispositivos iguais. Só esta app tem acesso a essa pasta; não aparece nos seus ficheiros do Drive.</p>
   ${c.email?`<div class="kvl"><span>Estado</span><b id="gs-st">${esc(UI.gsEst||(c.ultimo?'última sincronização '+new Date(c.ultimo).toLocaleString('pt-PT'):'por sincronizar'))}</b><span>Última sincronização</span><b>${c.ultimo?esc(new Date(c.ultimo).toLocaleString('pt-PT')):'—'}</b></div>
     <label class="chk"><input type="checkbox" id="gs-auto" ${c.auto!==false?'checked':''}> Sincronizar automaticamente (ao abrir, ao alterar e ao sair)</label>
     <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" id="gs-sync">${ic('refresh',15)} Sincronizar Agora</button><button class="btn" id="gs-up">${ic('upload',15)} Enviar Estes Dados</button><button class="btn" id="gs-down">${ic('download',15)} Receber da Conta</button><span class="sp1"></span><button class="btn dng" id="gs-off">${ic('x',14)} Desligar</button></div>`
   :`<label>ID de cliente OAuth da Google</label><input id="gs-cid" value="${esc(c.clientId||'')}" placeholder="123456789-xxxx.apps.googleusercontent.com" spellcheck="false" autocapitalize="none">
     <details style="margin-top:8px"><summary class="mut">Como obter o ID (uma vez, 5 minutos)</summary><ol class="hint" style="margin:6px 0 0 18px;line-height:1.6"><li>Em <b>console.cloud.google.com</b> crie um projeto (ex.: EduSpruce) e ative a <b>Google Drive API</b>.</li><li>Em <b>APIs e serviços › Ecrã de consentimento OAuth</b>, escolha “Externo”, preencha o nome e adicione o seu e-mail como utilizador de teste.</li><li>Em <b>Credenciais › Criar credenciais › ID de cliente OAuth</b>, tipo “Aplicação Web”; em <b>Origens JavaScript autorizadas</b> ponha o endereço da app (ex.: https://eduflow.seudominio.com).</li><li>Copie o ID de cliente e cole-o aqui.</li></ol></details>
     <div class="row" style="gap:8px;margin-top:12px"><button class="btn pri" id="gs-lig">${ic('user',15)} Ligar Conta Google</button><span class="hint" style="margin:0">${/^https:/.test(location.protocol)?'':'Precisa de a app estar alojada em https (não funciona a partir de um ficheiro).'}</span></div>`}</div>`}
async function gsLigar(){const c=gsCfg();const cid=($('#gs-cid')||{}).value;if(cid!=null)c.clientId=cid.trim();if(!c.clientId)return alert('Cole primeiro o ID de cliente OAuth.');save();
  try{const t=await gsToken(true);let email='';try{const r=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+t}});email=(await r.json()).email||''}catch(_){}c.email=email||'conta Google';save();audit('Sincronização','Conta ligada',c.email);
    const f=await gsRemoto();if(f&&+((f.appProperties||{}).ts||0)&&S.anos.length){gsConflito(f,+f.appProperties.ts)}else if(f){await gsReceber(f)}else await sincronizarGoogle(false);go('definicoes')}
  catch(e){alert(e.message)}}
{const _dd=defDados;defDados=function(){return _dd.apply(this,arguments)+cartaoSyncGoogle()};const _bd2=bindDados;bindDados=function(){_bd2.apply(this,arguments);
  const lg=$('#gs-lig');if(lg)lg.onclick=gsLigar;const sy=$('#gs-sync');if(sy)sy.onclick=()=>sincronizarGoogle(true);const up=$('#gs-up');if(up)up.onclick=()=>{if(confirm('Substituir os dados da conta Google pelos deste dispositivo?'))sincronizarGoogle(true,'enviar')};
  const dn=$('#gs-down');if(dn)dn.onclick=()=>{if(confirm('Substituir os dados deste dispositivo pelos da conta Google?')){try{localStorage.setItem(KEY+'.antesSync',JSON.stringify(S))}catch(_){}sincronizarGoogle(true,'receber')}};
  const au=$('#gs-auto');if(au)au.onchange=()=>{gsCfg().auto=au.checked;save()};const of=$('#gs-off');if(of)of.onclick=()=>{if(!confirm('Desligar a conta Google deste dispositivo? Os dados na conta não são apagados.'))return;try{if(_gsTok&&window.google)google.accounts.oauth2.revoke(_gsTok.t,()=>{})}catch(_){}_gsTok=null;const c=gsCfg();delete c.email;save();audit('Sincronização','Conta desligada','');go('definicoes')}}}
AJUDA.push({id:'gsync',ic:'refresh',t:'Sincronizar com a Conta Google',gif:null,txt:`<p>Em Definições › Segurança › <b>Sincronização com a Conta Google</b> liga a sua conta: os dados (com fotografias e documentos) ficam numa pasta privada da app no seu Google Drive e todos os dispositivos onde abrir o EduSpruce ficam iguais. Sincroniza ao abrir, alguns segundos depois de cada alteração e ao sair; se os dois lados mudaram, pergunta quais quer manter.</p><p>Precisa da app alojada em <b>https</b> e de um ID de cliente OAuth da Google (os passos estão no próprio cartão).</p>`});

