/* ===================== dia20 ===================== */
/* dia 20, nas escolas públicas de ensino regular: é dia de ordenado — aviso no cartão de hoje e uma festa uma vez por mês */
const DIA20_FRASES=['Conseguiste! É dia 20 outra vez!','Sobreviveste a mais um mês de testes, grelhas e reuniões. Hoje o mês paga-te de volta.','Dia 20: o único dia do mês em que o multibanco sorri para ti.','Hoje o café é por tua conta. Ou não — é dia 20, mereces que seja por conta de alguém.','Mais um mês fechado. Os sumários estão escritos, o ordenado está a caminho.','Dia 20: a conta bancária acorda da hibernação.'];
/* o dia 20 ao fim de semana passa para a sexta-feira antes («será hoje…?») */
const dia20Tipo=()=>{const d=new Date(),g=d.getDate(),w=d.getDay(),v=new Date(d.getFullYear(),d.getMonth(),20).getDay();if(g===20&&w>0&&w<6)return 'dia';if(w===5&&((v===6&&g===19)||(v===0&&g===18)))return 'sexta';return ''};
const dia20Hoje=()=>{try{return !!dia20Tipo()&&todasEscolas().some(e=>tipoEscola(e)==='regular')}catch(_){return false}};
const DIA20_SEXTA=['Será hoje…? O dia 20 calha ao fim de semana — espreita a conta.','Será hoje…? Dizem que, quando o 20 cai ao fim de semana, o ordenado chega à sexta.','Será hoje…? O multibanco já está a fazer suspense.'];
const dia20Frase=()=>{const d=new Date();const L=dia20Tipo()==='sexta'?DIA20_SEXTA:DIA20_FRASES;return L[(d.getFullYear()*12+d.getMonth())%L.length]};
function dia20Festa(){if(document.getElementById('d20f'))return;const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const w=document.createElement('div');w.id='d20f';w.setAttribute('role','status');
  w.innerHTML=`<canvas aria-hidden="true"></canvas><div class="d20m"><div class="d20e" aria-hidden="true">💶</div>${dia20Tipo()==='sexta'?'<b>Será hoje…?</b><span>O dia 20 calha ao fim de semana!</span><small>Pode ser hoje o dia de ordenado — espreita a conta 👀</small>':'<b>Conseguiste!</b><span>É dia 20 outra vez!</span><small>Dia de ordenado — bom fim de mês 🎉</small>'}<button type="button" class="btn pri">Obrigado!</button></div>`;
  document.body.appendChild(w);let fim=false;const sai=()=>{if(fim)return;fim=true;w.classList.add('sai');setTimeout(()=>w.remove(),400)};
  w.querySelector('button').onclick=sai;w.addEventListener('click',e=>{if(e.target===w)sai()});setTimeout(sai,7000);
  if(reduz)return;const c=w.querySelector('canvas'),x=c.getContext('2d');const R=()=>{c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)};R();
  const P=[],cores=['#f39200','#1b93c6','#17705a','#d8432f','#facc15','#a855f7','#ffffff'];let t0=performance.now(),prox=0;
  const rebenta=()=>{const cx=innerWidth*(.15+Math.random()*.7),cy=innerHeight*(.12+Math.random()*.4),cor=cores[Math.random()*cores.length|0],n=70;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,v=2+Math.random()*3.5;P.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,v:1,cor,r:1.6+Math.random()*1.6})}};
  const passo=t=>{if(fim||!w.isConnected)return;x.clearRect(0,0,innerWidth,innerHeight);if(t-t0<5200&&t>prox){rebenta();prox=t+380+Math.random()*420}
    for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.045;p.vx*=.985;p.vy*=.985;p.v-=.011;if(p.v<=0){P.splice(i,1);continue}
      x.globalAlpha=p.v;x.fillStyle=p.cor;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()}x.globalAlpha=1;requestAnimationFrame(passo)};requestAnimationFrame(passo)}
/* uma vez por mês (guardado na conta, não no aparelho) */
function dia20Verifica(){try{if(!dia20Hoje())return;const k=isoHoje().slice(0,7);if(S.cfg.dia20Festa===k)return;S.cfg.dia20Festa=k;save();setTimeout(dia20Festa,600)}catch(e){console.warn(e)}}
{const _wh20=widgetHojeInfo;widgetHojeInfo=function(){let h=_wh20.apply(this,arguments);try{if(dia20Hoje()){
  const n=`<button type="button" class="d20n" data-d20>${'<span class="d20i" aria-hidden="true">💶</span>'}<span><b>${dia20Tipo()==='sexta'?'Será hoje o dia de ordenado…?':'Dia de ordenado!'}</b><small>${esc(dia20Frase())}</small></span></button>`;
  h=h.replace(/<\/div>\s*$/,n+'</div>');setTimeout(()=>{document.querySelectorAll('[data-d20]').forEach(b=>b.onclick=dia20Festa);dia20Verifica()},50)}}catch(e){console.warn(e)}return h}}
