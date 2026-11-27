/* UFCD / módulos: cada unidade é uma disciplina estanque, com avaliação própria — nada por período, sem avaliação intercalar */
const tUnid=t=>{try{return !!t&&typeof ehUnid==='function'&&ehUnid(t)}catch(_){return false}};
function unidMarcar(){try{document.body.classList.toggle('t-unid',tUnid(T()))}catch(_){}}
/* os valores de cada critério contam com todos os instrumentos da unidade, seja qual for o período (tudo fica no 1.º; os outros ficam vazios) */
{const _dP=domPer;domPer=function(t,aid,dom,per){if(!tUnid(t))return _dP.apply(this,arguments);if(+per>1)return null;const v=(t.instrumentos||[]).map(i=>instDom(i,aid,dom)).filter(Boolean).map(x=>x.pct);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}}
/* sem avaliação intercalar nas unidades */
{const _iM=intMomentos;intMomentos=function(t){return tUnid(t)?[]:_iM.apply(this,arguments)}}
{const _dA=datasAvalDe;datasAvalDe=function(a,t){const r=_dA.apply(this,arguments);return tUnid(t)?r.filter(d=>d.tipo!=='intercalar'):r}}
/* Painel: a unidade toda, sem separadores de período */
{const _vP=vPainel;vPainel=function(){unidMarcar();const t=T();if(!tUnid(t))return _vP.apply(this,arguments);const C=PNL();const o=C.per;C.per='ano';try{return _vP.apply(this,arguments)}finally{C.per=o}}}
{const _nU=navUnid;navUnid=function(){const r=_nU.apply(this,arguments);unidMarcar();return r}}
