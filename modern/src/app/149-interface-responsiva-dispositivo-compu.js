/* ===================== v0.41: interface responsiva por dispositivo (Computador · iPad · Telemóvel) ===================== */
function dispDetetado(){const ua=navigator.userAgent||'';const tp=navigator.maxTouchPoints||0;const coarse=matchMedia('(pointer:coarse)').matches;const curto=Math.min(screen.width||innerWidth,screen.height||innerHeight);
  const ipadUA=/iPad/.test(ua)||(/Macintosh/.test(ua)&&tp>1);const tlmUA=/iPhone|iPod|Android.+Mobile|Windows Phone/.test(ua);
  if(tlmUA||(coarse&&curto<600)||innerWidth<560)return 'tlm';if(ipadUA||/Android/.test(ua)||(coarse&&tp>0))return 'ipad';return 'pc'}
function dispAtual(){const c=S.cfg&&S.cfg.disp;return c==='pc'||c==='ipad'||c==='tlm'?c:dispDetetado()}
const DISP_N={pc:'Computador',ipad:'iPad / Tablet',tlm:'Telemóvel'};
function dispAplicar(){const b=document.body;if(!b)return;const d=dispAtual();['pc','ipad','tlm'].forEach(k=>b.classList.toggle('dev-'+k,k===d));b.classList.toggle('dev-forc',!!(S.cfg&&S.cfg.disp&&S.cfg.disp!=='auto'));
  b.classList.toggle('ori-p',innerHeight>=innerWidth);b.classList.toggle('ori-l',innerWidth>innerHeight);tabbar()}
/* barra de separadores inferior (telemóvel) */
function tabbar(){const on=document.body.classList.contains('dev-tlm')&&!document.body.classList.contains('login-on');let tb=$('#tabbar');
  if(!on){if(tb)tb.remove();return}const t=T();const L=[['inicio','home','Início'],[t?'painel':'turmas',t?'grid':'school',t?'Turma':'Turmas'],[t?'sumarios':'meuhorario',t?'pen':'calendar',t?'Sumários':'Horário'],[t?'instrumentos':'tarefas',t?'clipboard':'checks',t?'Avaliação':'Tarefas'],['__mais','list','Mais']];
  if(!tb){tb=document.createElement('nav');tb.id='tabbar';tb.setAttribute('aria-label','Navegação principal');document.body.appendChild(tb)}
  const v=go._ult||'inicio';const grp={painel:['painel','alunos','horario','planta','criterios','dominios','avaliacao','relatorios','direcao','modulos','mra'],instrumentos:['instrumentos','oral','testes'],sumarios:['sumarios']};
  tb.innerHTML=L.map(([k,i,l])=>{const at=k===v||(grp[k]||[]).includes(v);return `<button type="button" data-tb="${k}" class="${at?'on':''}" aria-current="${at?'page':'false'}">${ic(i,22)}<span>${l}</span></button>`}).join('');
  tb.querySelectorAll('[data-tb]').forEach(b=>b.onclick=()=>{const k=b.dataset.tb;if(k==='__mais'){const mb=$('#menuBtn');if(mb)mb.click();else document.body.classList.toggle('menu');return}document.body.classList.remove('menu');if(k==='instrumentos')UI.inst=null;go(k);try{$('#view').scrollTop=0}catch(_){}})}
{const _gD=go;go=function(v){const r=_gD.apply(this,arguments);try{dispAplicar()}catch(_){}return r}}
addEventListener('resize',()=>{clearTimeout(dispAplicar._t);dispAplicar._t=setTimeout(dispAplicar,120)});
addEventListener('orientationchange',()=>setTimeout(dispAplicar,200));
{const _apD=aplicarPrefs;aplicarPrefs=function(){const r=_apD.apply(this,arguments);try{dispAplicar()}catch(_){}return r}}
/* Definições › Aparência: escolha do dispositivo */
{const _vdD=vDefinicoes;vDefinicoes=function(){const r=_vdD.apply(this,arguments);try{const est=$('#ap-est');if(est&&!$('#ap-disp')){const pref=est.closest('.pref')||est.parentElement;const cur=(S.cfg.disp||'auto');
  pref.insertAdjacentHTML('afterend',`<div class="pref" id="ap-dispw"><b>Interface por dispositivo</b><div class="seg" id="ap-disp">${[['auto','Automático','auto'],['pc','Computador','grid'],['ipad','iPad','clipboard'],['tlm','Telemóvel','user']].map(([k,l,i])=>`<button type="button" data-v="${k}" class="${cur===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>
    <p class="hint" style="margin:6px 0 0">Detetado: <b>${DISP_N[dispDetetado()]}</b>. No modo automático, a app passa sozinha para a interface do iPad (alvos de toque grandes, barra lateral compacta ao alto) ou do telemóvel (barra de separadores em baixo, cartões numa coluna, tabelas em fichas), e volta ao rodar o ecrã.</p></div>`);
  $$('#ap-disp button').forEach(b=>b.onclick=()=>{S.cfg.disp=b.dataset.v;save();$$('#ap-disp button').forEach(x=>x.classList.toggle('on',x===b));dispAplicar();toast('Interface: '+(b.dataset.v==='auto'?'automática ('+DISP_N[dispDetetado()]+')':DISP_N[b.dataset.v]),'ok')})}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* telemóvel: tabelas de dados como fichas (etiquetas a partir do cabeçalho) */
function tabelasFicha(){$$('#view table.alst').forEach(tb=>{const H=[...tb.querySelectorAll('thead th')].map(h=>h.textContent.replace(/[▲▼]/g,'').trim());tb.querySelectorAll('tbody tr').forEach(tr=>{if(tr.dataset.lab)return;tr.dataset.lab=1;[...tr.children].forEach((td,k)=>{if(H[k]&&!td.dataset.l)td.dataset.l=H[k];if(H[k])td.querySelectorAll('select,input:not([type=checkbox]),textarea').forEach(f=>{if(!f.getAttribute('aria-label'))f.setAttribute('aria-label',H[k])})})})});if(!document.body.classList.contains('dev-tlm'))return;$$('#view table.pntb').forEach(tb=>{if(tb.dataset.fich)return;tb.dataset.fich=1;tb.classList.add('ficha');const H=[...tb.querySelectorAll('thead th')].map(h=>h.textContent.replace(/[▲▼]/g,'').trim());tb.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,k)=>{if(H[k])td.dataset.l=H[k]}))})}
{let _tf=0;new MutationObserver(()=>{cancelAnimationFrame(_tf);_tf=requestAnimationFrame(()=>{try{tabelasFicha()}catch(_){}})}).observe(document.body,{childList:true,subtree:true})}
try{dispAplicar()}catch(_){}

