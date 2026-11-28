/* ===================== v1.044 · Perfis de Aprendizagem: «Evolução por Período» ao lado do Perfil por Domínio =====================
   Linhas por domínio (cor do domínio), classificação do período (linha grossa) e média da turma (tracejada, se a comparação estiver visível). */
function perfilEvol(X,show){const t=T();if(!t||!X||!X.P||!X.P.length)return '';const P=X.P,sec=isSec(t);const al=alunosAval(t);
  const tur=P.map(q=>_avg(al.map(x=>ponderada(t,pctsPer(t,x.id,q))).filter(v=>v!=null)));
  const D=X.dom.filter(o=>o.porP.some(v=>v!=null));if(!D.length&&!X.fin.some(v=>v!=null))return '';
  const W=420,H=300,L=44,R=24,Tp=22,B=40;const sx=i=>P.length<2?(L+W-R)/2:L+i*((W-L-R)/(P.length-1)),sy=v=>Tp+(1-Math.max(0,Math.min(1,v)))*(H-Tp-B);
  const V=v=>fmtNota(t,v);const Wp=perW();
  const linha=(vals,cls,sty)=>{let d='',ab=false;vals.forEach((v,i)=>{if(v==null){ab=false;return}d+=(ab?'L':'M')+sx(i).toFixed(1)+' '+sy(v).toFixed(1)+' ';ab=true});return d?`<path d="${d}" class="${cls}" style="${sty||''}"/>`:''};
  const grid=[0,.25,.5,.75,1].map(g=>`<line x1="${L}" x2="${W-R}" y1="${sy(g)}" y2="${sy(g)}" class="${g===.5?'pe50':'peg'}"/><text x="${L-8}" y="${sy(g)}" text-anchor="end" dominant-baseline="middle" class="pey">${sec?Math.round(g*20):Math.round(g*100)+'%'}</text>`).join('');
  const xl=P.map((q,i)=>`<text x="${sx(i)}" y="${H-B+20}" text-anchor="middle" class="pex">${q}.º ${esc(Wp.slice(0,3))}.</text>`).join('');
  const doms=D.map(o=>{const c=domCor(t,o.d);return linha(o.porP,'ped',`stroke:${c}`)+o.porP.map((v,i)=>v==null?'':`<circle cx="${sx(i)}" cy="${sy(v)}" r="3.5" style="fill:${c}"><title>${esc(o.d.nome)} · ${q2(i)}: ${V(v)}</title></circle>`).join('')}).join('');
  function q2(i){return P[i]+'.º '+Wp.toLowerCase()}
  const tm=show.comparar?linha(tur,'pet')+tur.map((v,i)=>v==null?'':`<circle cx="${sx(i)}" cy="${sy(v)}" r="3.5" class="petc"><title>Média da turma · ${q2(i)}: ${V(v)}</title></circle>`).join(''):'';
  const fin=linha(X.fin,'pef')+X.fin.map((v,i)=>v==null?'':`<circle cx="${sx(i)}" cy="${sy(v)}" r="6" class="pefc"><title>Classificação · ${q2(i)}: ${V(v)}</title></circle><text x="${sx(i)}" y="${sy(v)-12}" text-anchor="middle" class="pev">${V(v)}</text>`).join('');
  const leg=`<div class="pleg"><span><i class="pefl"></i>Classificação</span>${D.map(o=>`<span><i style="background:${domCor(t,o.d)}"></i>${esc(o.d.ab||o.d.nome.slice(0,14))}</span>`).join('')}${show.comparar?'<span><i class="rt"></i>Média da turma</span>':''}</div>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="pevo" role="img" aria-label="Evolução por ${esc(Wp.toLowerCase())}">${grid}${xl}${tm}${doms}${fin}</svg>${leg}`}
{const _pR=perfilRadar;perfilRadar=function(X,show){const r=_pR.apply(this,arguments);let e='';try{e=perfilEvol(X,show)}catch(err){console.warn(err)}
  if(!e)return r;return (r||'<p class="mut">São precisos pelo menos 3 domínios avaliados.</p>')+`</section><section class="pc pevs"><h2>${ic('chart',16)} Evolução por ${esc(perW())}</h2>${e}`}}
