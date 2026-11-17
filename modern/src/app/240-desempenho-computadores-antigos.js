/* ===================== v1.026 · Desempenho em computadores mais antigos =====================
   1) As regras de estilo com :has() sobre o atributo style obrigavam a recalcular o estilo da página inteira a cada medição do
      cabeçalho (até 10 s a abrir «Aulas e sumários» num PC antigo) — foram retiradas.
   2) Modo leve (Definições › Aparência › Desempenho): sem desfoques de vidro, sombras e animações. Liga-se sozinho em computadores
      com poucos recursos ou quando o ecrã fica lento; pode forçar-se «Leve» ou «Normal» neste dispositivo. */
const LEVE_K='es.leve';const leveCfg=()=>{try{return localStorage.getItem(LEVE_K)||'auto'}catch(_){return 'auto'}};
let LEVE_AUTO=false;try{const c=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;if(c<=2||m<=2)LEVE_AUTO=true}catch(_){}
try{if(localStorage.getItem('es.leveAuto')==='1')LEVE_AUTO=true}catch(_){}
const leveAtivo=()=>{const v=leveCfg();return v==='on'||(v==='auto'&&LEVE_AUTO)};
function leveAplicar(){const on=leveAtivo();const r=document.documentElement;r.classList.toggle('leve',on);if(on)r.classList.add('a11y-rm')}
{const _aaL=animAplicar;animAplicar=function(){const r=_aaL.apply(this,arguments);try{leveAplicar()}catch(_){}return r}}
leveAplicar();
/* medição automática: 120 imagens do ecrã depois de a app sossegar; se mais de metade forem lentas, liga o modo leve */
setTimeout(function leveMedir(){if(leveCfg()!=='auto'||LEVE_AUTO||document.hidden)return;let n=0,lentos=0,prev=0;const f=t=>{if(document.hidden)return;if(prev&&t-prev>40)lentos++;prev=t;if(++n<120)requestAnimationFrame(f);else if(lentos>60){LEVE_AUTO=true;try{localStorage.setItem('es.leveAuto','1')}catch(_){}leveAplicar();toast('Modo leve ligado: este computador estava lento. Pode mudar em Definições › Aparência.','ok')}};requestAnimationFrame(f)},9000);
function cartaoLeve(){const v=leveCfg();const o=(k,n,d)=>`<button type="button" role="radio" aria-checked="${v===k}" class="anopt ${v===k?'on':''}" data-lv="${k}"><b>${n}</b><small>${d}</small></button>`;
  return `<div class="card" id="lv-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sliders',18)} Desempenho</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo${v==='auto'?' · agora: '+(LEVE_AUTO?'leve':'normal'):''}</span></div>
  <div class="angrid" role="radiogroup" aria-label="Desempenho">${o('auto','Automático','Liga o modo leve sozinho em computadores mais antigos ou lentos.')}${o('on','Leve','Sem desfoques de vidro, sombras nem animações — mais rápido em PCs antigos e quadros interativos.')}${o('off','Normal','Aspeto completo, com todos os efeitos.')}</div></div>`}
{const _vdL=vDefinicoes;vDefinicoes=function(){const r=_vdL.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#lv-cfg')){const c=$('#an-cfg')||$('#view .card');if(c){c.insertAdjacentHTML($('#an-cfg')?'afterend':'beforebegin',cartaoLeve());$$('#lv-cfg [data-lv]').forEach(b=>b.onclick=()=>{try{localStorage.setItem(LEVE_K,b.dataset.lv);if(b.dataset.lv!=='auto')localStorage.removeItem('es.leveAuto')}catch(_){}if(b.dataset.lv==='auto'){LEVE_AUTO=false;try{const c2=navigator.hardwareConcurrency||8,m2=navigator.deviceMemory||8;if(c2<=2||m2<=2)LEVE_AUTO=true}catch(_){}}try{animAplicar()}catch(_){leveAplicar()}go('definicoes');toast('Desempenho: '+({auto:'automático',on:'leve',off:'normal'})[b.dataset.lv],'ok')})}}}catch(e){console.warn(e)}return r}}

