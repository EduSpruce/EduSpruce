/* ===================== 0.933 ===================== */
/* verificação dos códigos (aceita o formato forte e o antigo) */
async function pinOk(x){const h=String(S.cfg.pinHash||'');if(!h)return false;try{if(await sha('eg:'+x)===h)return true}catch(_){}try{return !!(await verificarSenha(h,x))}catch(_){return false}}
/* uma cor por turma (sempre a mesma), nos cartões e na barra lateral */
const TCORES=['#1f77b4','#d9480f','#2b8a3e','#7048e8','#c2255c','#0b7285','#e67700','#5c7cfa','#8f3b1b','#087f5b'];
function corTurma(id){const a=A();if(a){const k=a.turmas.findIndex(t=>t.id===id);if(k>=0)return TCORES[k%TCORES.length]}let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return TCORES[h%TCORES.length]}
function pintarTurmas(){try{$$('.tcard[data-t]').forEach(c=>c.style.setProperty('--tc',corTurma(c.dataset.t)));$$('#side .tnode[data-tt]').forEach(c=>c.style.setProperty('--tc',corTurma(c.dataset.tt)))}catch(_){}}
/* fora da turma: o menu da turma fecha e não fica assinalado */
{const _gN=go;go=function(v){const r=_gN.apply(this,arguments);try{const TV=new Set([...document.querySelectorAll('#side .tnav[data-v]')].map(k=>k.dataset.v));const dentro=TV.has(VIEW);
  document.body.classList.toggle('vgeral',!dentro);if(!dentro){if(S.turmaAtiva&&UI.navTFech!==S.turmaAtiva){UI.navTFech=S.turmaAtiva;UI._navAuto=1;try{navTurmas()}catch(_){}}}else if(UI._navAuto){UI.navTFech=null;UI._navAuto=0;try{navTurmas()}catch(_){}}
  requestAnimationFrame(pintarTurmas)}catch(_){}return r}}
{const _nT=navTurmas;navTurmas=function(){const r=_nT.apply(this,arguments);try{pintarTurmas()}catch(_){}return r}}
/* Avaliação Final: estatística da turma por baixo da pauta */
function avEstatistica(){try{const t=T();if(!t||VIEW!=='avaliacao')return;const v=$('#view');if(!v||v.querySelector('.avst'))return;const p=UI.per||perAtual(t);const sc=isSec(t);
  const al=alunosAval(t);const N=al.map(a=>({a,n:ponderada(t,pctsFinal(t,a.id,p))}));const A_=N.filter(x=>x.n!=null);if(!al.length)return;
  const F=x=>x==null?'—':sc?(x*20).toFixed(1).replace('.',','):Math.round(x*100)+'%';const val=A_.map(x=>x.n).sort((a,b)=>a-b);
  const med=val.length?val.reduce((s,x)=>s+x,0)/val.length:null;const mdn=val.length?(val.length%2?val[(val.length-1)/2]:(val[val.length/2-1]+val[val.length/2])/2):null;
  const neg=A_.filter(x=>negativa(t,x.n)).length,pos=A_.length-neg;const dp=val.length>1?Math.sqrt(val.reduce((s,x)=>s+(x-med)**2,0)/(val.length-1)):null;
  const B=sc?[['0–4',0,4.5],['5–9',4.5,9.5],['10–13',9.5,13.5],['14–17',13.5,17.5],['18–20',17.5,21]].map(([l,a,b])=>[l,val.filter(x=>x*20>=a&&x*20<b).length,a<9.5]):[['Nível 1',0,.2],['Nível 2',.2,.5],['Nível 3',.5,.7],['Nível 4',.7,.9],['Nível 5',.9,1.01]].map(([l,a,b])=>[l,val.filter(x=>x>=a&&x<b).length,a<.5]);
  const mx=Math.max(1,...B.map(x=>x[1]));const D=t.dominios.map(d=>{const L=al.map(a=>domPer(t,a.id,d.id,p)).filter(x=>x!=null);return {d,m:L.length?L.reduce((s,x)=>s+x,0)/L.length:null,n:L.length}});
  const un=typeof tUnid==='function'&&tUnid(t);const top=A_.filter(x=>!negativa(t,x.n)).sort((x,y)=>y.n-x.n).slice(0,3),bx=A_.slice().sort((x,y)=>x.n-y.n).filter(x=>negativa(t,x.n)).slice(0,5);
  const card=document.createElement('section');card.className='card avst';
  card.innerHTML=`<h2 style="margin:0">${ic('chart',18)} Estatística da Turma · ${esc(perNome(p))}</h2>
   <div class="avstg"><div class="avstk"><small>Alunos avaliados</small><b>${A_.length}</b><small>de ${al.length}</small></div><div class="avstk"><small>Média</small><b>${F(med)}</b></div><div class="avstk"><small>Mediana</small><b>${F(mdn)}</b></div>
   <div class="avstk ok"><small>${un?'Aprovados (≥ 9,5)':'Positivas'}</small><b>${pos}</b><small>${A_.length?Math.round(pos/A_.length*100):0}%</small></div><div class="avstk bad"><small>${un?'Não aprovados':'Negativas'}</small><b>${neg}</b><small>${A_.length?Math.round(neg/A_.length*100):0}%</small></div>
   <div class="avstk"><small>Mais alta · mais baixa</small><b>${F(val[val.length-1])} · ${F(val[0])}</b></div>${un&&typeof domGer==='function'&&domGer(t).length?(n=>`<div class="avstk"><small>Fichas dos critérios gerais</small><b>${n}</b><small>de ${al.length} preenchidas</small></div>`)(al.filter(a=>domGer(t).every(d=>critGVal(t,a.id,d.id,1)!=null)).length):''}${dp!=null?`<div class="avstk"><small>Desvio-padrão</small><b>${sc?(dp*20).toFixed(1).replace('.',','):Math.round(dp*100)+' pp'}</b></div>`:''}</div>
   <div class="avstd"><div><h3>Distribuição</h3><div class="avsb">${B.map(([l,n,m])=>`<span>${l}</span><i class="${m?'bad':'ok'}" style="width:${n/mx*100}%"></i><span>${n}</span>`).join('')}</div></div>
   <div><h3>Média por ${un?'critério':'domínio'}</h3><div class="avsb">${D.map(x=>`<span title="${esc(x.d.nome)} · ${x.d.peso}%">${esc(un?x.d.nome:(x.d.ab||x.d.nome))}</span><i style="width:${x.m!=null?x.m*100:0}%;background:${x.d.cor||'var(--acc)'}"></i><span>${x.m!=null?(sc?(x.m*20).toFixed(1).replace('.',','):Math.round(x.m*100)+'%'):'—'}</span>`).join('')}</div></div>
   <div><h3>Melhores resultados</h3>${top.length?`<div class="avsb">${top.map(x=>`<span>${esc(numAl(x.a))}</span><span title="${esc(x.a.nome)}">${esc(x.a.nome)}</span><span>${F(x.n)}</span>`).join('')}</div>`:`<p class="mut" style="margin:0">${A_.length?(un?'Ainda nenhum aluno aprovado.':'Sem positivas.'):'Sem classificações.'}</p>`}
    <h3 style="margin-top:12px">${un?'A acompanhar (não aprovados)':'A acompanhar (negativa)'}</h3>${bx.length?`<div class="avsb">${bx.map(x=>`<span>${esc(numAl(x.a))}</span><span title="${esc(x.a.nome)}">${esc(x.a.nome)}</span><span style="color:#c0392b">${F(x.n)}</span>`).join('')}</div>`:`<p class="mut" style="margin:0">${un?'Todos os alunos avaliados estão aprovados.':'Nenhum aluno com negativa.'}</p>`}</div></div>`;
  v.appendChild(card)}catch(e){console.warn('[EduSpruce] estatística:',e)}}
{const _vA=vAvaliacao;vAvaliacao=function(){const r=_vA.apply(this,arguments);try{avEstatistica()}catch(_){}return r};if(go._f)go._f.avaliacao=vAvaliacao}

addEventListener('pageshow',e=>{if(e.persisted)go('inicio')});
