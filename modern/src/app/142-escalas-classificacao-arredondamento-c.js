/* ===================== v0.39: escalas de classificação e arredondamento configuráveis ===================== */
const CONV5_DEF=[19,49,69,89];
function escalaAuto(t){return t&&(t.ciclo==='sec'||t.oferta==='profij'||t.oferta==='profissional')?'20':'100'}
function escalaDe(t){if(!t)return '100';return t.escala==='20'||t.escala==='100'?t.escala:escalaAuto(t)}
function conv5(t){const v=(t&&Array.isArray(t.conv5)&&t.conv5.length===4)?t.conv5:(Array.isArray(S.cfg.conv5)&&S.cfg.conv5.length===4?S.cfg.conv5:CONV5_DEF);return v.map(Number)}
function arredModo(){return S.cfg.arredModo||'normal'}
/* arredondamento com modo (normal = meio para cima; cima; baixo) */
_rdx=function(x,d){const m=Math.pow(10,d);const y=+(x*m).toFixed(6);const md=arredModo();return (md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y))/m};
function _rint(x){const y=+(+x).toFixed(6);const md=arredModo();return md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y)}
pctCanon=function(t,f){if(f==null||!isFinite(f))return null;return isSec(t)?_rint(_rdx(f*20,notaDec()))*5:_rint(f*100)};
nivel=function(t,f){const p=pctCanon(t,f);if(p==null)return '';if(isSec(t))return p/5;const c=conv5(t);for(let k=0;k<4;k++)if(p<=c[k])return k+1;return 5};
fmtNota=function(t,f){if(f==null||!isFinite(f))return '';const d=notaDec();return isSec(t)?_rdx(f*20,d).toFixed(d).replace('.',','):_rint(f*100)+'%'};
/* cartão nos Critérios */
function cartaoEscala(t){const e=escalaDe(t),au=escalaAuto(t);const c=conv5(t);const lim=[0,...c.map(x=>x+1)];const prop=!!t.conv5;
  return `<div class="card esccl" id="esc-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sliders',18)} Escala de Classificação</h2><span class="tag ${e==='20'?'pri':'ok'}">${e==='20'?'0 a 20 valores':'0–100% · níveis 1 a 5'}</span></div>
    <p class="hint" style="margin:6px 0 10px">Secundário e PROFIJ/profissional: testes e nota final de 0 a 20. 3.º ciclo: testes em percentagem (0–100%) e nível final de 1 a 5, segundo a tabela abaixo.</p>
    <div class="seg" role="group" aria-label="Escala">${[['','Automática ('+(au==='20'?'0–20':'0–100% / 1–5')+')'],['20','0 a 20 Valores'],['100','0–100% e Níveis 1–5']].map(([v,l])=>`<button type="button" data-esc="${v}" class="${(t.escala||'')===v?'on':''}">${l}</button>`).join('')}</div>
    ${e==='100'?`<div class="convt"><div class="convh"><b>Conversão da percentagem em nível</b>${prop?'<span class="tag">própria desta turma</span>':'<span class="tag">da escola</span>'}</div>
      <div class="convg">${[1,2,3,4,5].map(n=>`<div class="convc n${n}"><span class="convn">${n}</span><span class="convr">${lim[n-1]}% a ${n<5?`<input type="number" min="0" max="99" data-conv="${n-1}" value="${c[n-1]}" aria-label="Limite superior do nível ${n}">`:'100'}%</span></div>`).join('')}</div>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn sm" id="conv-esc">${ic('layers',13)} Usar em Todas as Turmas</button><button type="button" class="btn sm" id="conv-rep">${ic('refresh',13)} Repor Oficial (0–19 · 20–49 · 50–69 · 70–89 · 90–100)</button></div></div>`:''}
    ${blocoArred(t)}</div>`}
function _arrV(v,d,md){const k=Math.pow(10,d);const y=+(v*k).toFixed(6);return (md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y))/k}
function arrSimular(t,pc){const sec=isSec(t);const md=arredModo(),d=notaDec();const f=pc/100;const passos=[];if(sec){const v=f*20;const n=_arrV(v,d,md);const fin=_arrV(n,0,md);passos.push(['Resultado',nf(pc,2)+'%'],['Em valores',nf(v,3)],['Nota mostrada ('+['unidades','décimas','centésimas'][d]+')',n.toFixed(d).replace('.',',')],['Classificação final',String(fin)]);return {passos,pos:fin>=10,txt:fin>=10?'Positiva':'Negativa'}}
  const q=_arrV(pc,0,md);const c=conv5(t);let nv=5;for(let k=0;k<4;k++)if(q<=c[k]){nv=k+1;break}passos.push(['Resultado',nf(pc,2)+'%'],['Percentagem mostrada',q+'%'],['Nível',String(nv)]);return {passos,pos:nv>=3,txt:nv>=3?'Positivo':'Negativo'}}
function blocoArred(t){const sec=isSec(t);const d=notaDec(),md=arredModo();const ex=14.275,exr=14.25;
  const opD=[[0,'Unidades','Sem casas decimais'],[1,'Décimas','Uma casa decimal'],[2,'Centésimas','Duas casas decimais']];
  const opM=[['normal','Normal','5 ou mais sobe, abaixo de 5 desce'],['cima','Sempre para cima','Qualquer fração sobe'],['baixo','Sempre para baixo','Qualquer fração é cortada']];
  const sim=arrSimular(t,+(UI.arrSim??47.25));
  return `<div class="convt arrb"><div class="convh"><b>${ic('sliders',15)} Arredondamento</b><span class="tag">todas as turmas</span><span class="sp1"></span><span class="mut" style="font-size:12.5px">A nota que se vê é a que decide positiva/negativa, ${sec?'a classificação final':'o nível e a menção'}.</span></div>
    <div class="arrg"><section><h3>Casas decimais das notas <small>(turmas 0–20)</small></h3><div class="arro" role="radiogroup" aria-label="Casas decimais">${opD.map(([v,l,dsc])=>`<button type="button" role="radio" aria-checked="${d===v}" data-arrd="${v}" class="${d===v?'on':''}"><b>${l}</b><small>${dsc}</small><span class="arrx">${nf(ex,3)} → <i>${_arrV(ex,v,md).toFixed(v).replace('.',',')}</i></span></button>`).join('')}</div></section>
      <section><h3>Regra de arredondamento</h3><div class="arro" role="radiogroup" aria-label="Regra">${opM.map(([v,l,dsc])=>`<button type="button" role="radio" aria-checked="${md===v}" data-arrm="${v}" class="${md===v?'on':''}"><b>${l}</b><small>${dsc}</small><span class="arrx">${nf(exr,2)} → <i>${_arrV(exr,1,v).toFixed(1).replace('.',',')}</i> · ${nf(exr,2).replace(/,\d+/,',75')} → <i>${_arrV(14.75,0,v)}</i></span></button>`).join('')}</div></section></div>
    <div class="arrsim"><label for="arr-sim">${ic('target',14)} Experimentar</label><span class="arrin"><input id="arr-sim" type="number" min="0" max="100" step="0.01" value="${UI.arrSim??47.25}" inputmode="decimal"><span>%</span></span><div class="arrp" id="arr-p">${arrPassos(sim)}</div></div></div>`}
function arrPassos(sim){return sim.passos.map(([l,v],k)=>`${k?'<span class="arrse">→</span>':''}<span class="arrps"><small>${esc(l)}</small><b>${esc(v)}</b></span>`).join('')+`<span class="tag ${sim.pos?'ok':'bad'}" style="margin-left:6px">${sim.txt}</span>`}
function bindEscala(t){const c=$('#esc-card');if(!c)return;const re=()=>manterPosicao(vCriterios);
  const sm=c.querySelector('#arr-sim');if(sm)sm.oninput=()=>{const v=Math.max(0,Math.min(100,+String(sm.value).replace(',','.')||0));UI.arrSim=v;const p=c.querySelector('#arr-p');if(p)p.innerHTML=arrPassos(arrSimular(t,v))};
  c.querySelectorAll('[data-esc]').forEach(b=>b.onclick=()=>{const v=b.dataset.esc;if(v)t.escala=v;else delete t.escala;save();re()});
  c.querySelectorAll('[data-conv]').forEach(i=>i.onchange=()=>{const v=conv5(t).slice();const k=+i.dataset.conv;const n=Math.round(+i.value);const lo=k?v[k-1]+1:0,hi=k<3?v[k+1]-1:99;
    if(!(n>=lo&&n<=hi)){toast(`O limite do nível ${k+1} tem de estar entre ${lo}% e ${hi}%`,'aviso');i.value=v[k];return}v[k]=n;t.conv5=v;save();re()});
  const ce=$('#conv-esc');if(ce)ce.onclick=()=>{S.cfg.conv5=conv5(t);A().turmas.forEach(x=>delete x.conv5);save();toast('Tabela aplicada a todas as turmas','ok');re()};
  const cr=$('#conv-rep');if(cr)cr.onclick=()=>{delete t.conv5;if(!confirm('Repor também a tabela da escola para a oficial?')){save();return re()}delete S.cfg.conv5;save();re()};
  c.querySelectorAll('[data-arrd]').forEach(b=>b.onclick=()=>{S.cfg.arred=+b.dataset.arrd;save();re()});
  c.querySelectorAll('[data-arrm]').forEach(b=>b.onclick=()=>{S.cfg.arredModo=b.dataset.arrm;save();re()})}
{const _vc=vCriterios;vCriterios=function(){const r=_vc.apply(this,arguments);try{const t=T();const v=$('#view');const first=v.querySelector('.card');if(first)first.insertAdjacentHTML('afterend',cartaoEscala(t));bindEscala(t)}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

