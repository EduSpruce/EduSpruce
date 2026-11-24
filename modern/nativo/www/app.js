/* Spruce It! (app iOS e Android) */
(()=>{
const $=s=>document.querySelector(s);const C=window.Capacitor||null;const P=(C&&C.Plugins)||{};
const VER='1.0.0';$('#ver').textContent='· '+VER;
const ler=(k,d)=>{try{const v=localStorage.getItem('si.'+k);return v==null?d:JSON.parse(v)}catch(_){return d}};const por=(k,v)=>{try{localStorage.setItem('si.'+k,JSON.stringify(v))}catch(_){}};
const limpa=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
const fmt=c=>c.length===6?c.slice(0,3)+'-'+c.slice(3):c;
const erro=t=>{$('#err').textContent=t||''};
/* servidor: eduspruce.pt; se a rede da escola o bloquear, o espelho */
let srv=null;
async function servidor(){const esc=ler('srv','auto');if(esc!=='auto')return esc;if(srv)return srv;
  const tenta=async u=>{const c=new AbortController();const t=setTimeout(()=>c.abort(),3500);try{const r=await fetch(u+'versao.json?t='+Date.now(),{signal:c.signal,cache:'no-store'});return r.ok}catch(_){return false}finally{clearTimeout(t)}};
  srv=(await tenta('https://eduspruce.pt/'))?'https://eduspruce.pt/':(await tenta('https://eduspruce.github.io/'))?'https://eduspruce.github.io/':'https://eduspruce.pt/';return srv}
function codigoDe(txt){const s=String(txt||'').trim();const m=s.match(/[#/]([A-Za-z0-9-]{6,8})\s*$/);return limpa(m?m[1]:s)}
async function entrar(c){c=limpa(c);if(c.length!==6)return erro('O código tem 6 letras ou números (ex.: ABC-123).');erro('');
  const base=await servidor();por('rec',{c,em:Date.now()});mostraRec();
  $('#j-cod').textContent=fmt(c);$('#fr').src=base+'spruceit.html#'+c;$('#ini').hidden=true;$('#jogo').hidden=false;vibrar()}
function sair(){$('#fr').src='about:blank';$('#jogo').hidden=true;$('#ini').hidden=false}
function mostraRec(){const r=ler('rec',null);const b=$('#b-rec');if(r&&Date.now()-r.em<8*36e5){b.hidden=false;$('#rec-t').textContent='Código '+fmt(r.c)}else b.hidden=true}
function vibrar(){if(!ler('vib',true))return;try{P.Haptics&&P.Haptics.impact({style:'LIGHT'})}catch(_){}}
$('#cod').addEventListener('input',e=>{const v=limpa(e.target.value);e.target.value=fmt(v)});
$('#f-cod').addEventListener('submit',e=>{e.preventDefault();entrar($('#cod').value)});
$('#b-rec').onclick=()=>{const r=ler('rec',null);if(r)entrar(r.c)};
$('#b-sair').onclick=sair;$('#b-rec2').onclick=()=>{const f=$('#fr');f.src=f.src};
/* QR: leitor nativo (ML Kit) na app; no navegador, a câmara do telemóvel abre logo o endereço */
$('#b-qr').onclick=async()=>{erro('');const BS=P.BarcodeScanner;if(!BS)return erro('Aponta a câmara do telemóvel ao QR, ou escreve o código.');
  try{const p=await BS.requestPermissions();if(p.camera!=='granted'&&p.camera!=='limited')return erro('Sem acesso à câmara. Ative-o nas definições do telemóvel.');
    if(BS.isGoogleBarcodeScannerModuleAvailable){const a=await BS.isGoogleBarcodeScannerModuleAvailable();if(!a.available){await BS.installGoogleBarcodeScannerModule();return erro('A preparar o leitor de QR… tenta de novo dentro de instantes.')}}
    const {barcodes}=await BS.scan({formats:['QR_CODE']});const v=barcodes&&barcodes[0]&&(barcodes[0].rawValue||barcodes[0].displayValue);if(v)entrar(codigoDe(v))}
  catch(e){if(!/cancel/i.test(String(e&&e.message)))erro('Não foi possível ler o QR. Escreve o código.')}};
/* professor: a EduSpruce abre no navegador do sistema (o «Entrar com Google» não funciona dentro de apps) */
$('#b-prof').onclick=async()=>{const u=(await servidor())+'#arena';try{if(P.Browser)return P.Browser.open({url:u,presentationStyle:'fullscreen',toolbarColor:'#6d28d9'})}catch(_){}location.href=u};
/* definições */
$('#b-def').onclick=()=>{$('#d-vib').checked=ler('vib',true);$('#d-srv').value=ler('srv','auto');$('#def').showModal()};
$('#d-vib').onchange=e=>por('vib',e.target.checked);$('#d-srv').onchange=e=>{por('srv',e.target.value);srv=null};
const abreWeb=async p=>{const u=(await servidor())+p;try{if(P.Browser)return P.Browser.open({url:u})}catch(_){}window.open(u,'_blank')};
$('#d-priv').onclick=e=>{e.preventDefault();abreWeb('privacidade.html')};$('#d-lic').onclick=e=>{e.preventDefault();abreWeb('licencas.html')};
/* ligações diretas: spruceit://jogo/ABC123 e https://eduspruce.pt/spruceit#ABC123 (quando o sistema as entrega à app) */
try{P.App&&P.App.addListener('appUrlOpen',ev=>{const c=codigoDe(ev.url);if(c.length===6)entrar(c)})}catch(_){}
try{P.App&&P.App.addListener('backButton',()=>{if(!$('#jogo').hidden)sair();else P.App.exitApp()})}catch(_){}
try{P.StatusBar&&P.StatusBar.setBackgroundColor({color:'#6d28d9'})}catch(_){}
const h=codigoDe(location.hash.slice(1));if(h.length===6)entrar(h);mostraRec();servidor();
})();
