/* =====================================================================
   CÁLCULOS
   ===================================================================== */
const num=v=>{if(v===''||v==null)return null;const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n};
const isSec=t=>!!t&&escalaDe(t)==='20';
const periodos=()=>(A()||{}).org==='semestre'?[1,2]:[1,2,3];
const perW=()=>(A()||{}).org==='semestre'?'Semestre':'Período';
const perNome=p=>p+'.º '+perW();
const ordA=t=>(a,b)=>{const o=t.origens||[];return ((o.indexOf(a.origem)+1||99)-(o.indexOf(b.origem)+1||99))||((+a.num||999)-(+b.num||999))};
const alunosAval=t=>t.alunos.filter(a=>a.frequenta).sort(ordA(t));
const alunosTodos=t=>t.alunos.slice().sort(ordA(t));
/* filtro por turma de origem (turmas conjuntas) */
const alunosFiltro=t=>alunosAval(t).filter(a=>!t.origens||!UI.orig||a.origem===UI.orig);
const numAl=x=>x?(x.numOrig!=null&&x.numOrig!==''?x.num+' ('+x.numOrig+')':x.num):'',tagOrig=(t,a)=>t.origens&&a.origem?` <span class="tag" title="Turma ${esc(a.origem)}">${esc(a.origem)}</span>`:'';
function selOrigem(t,cb){if(!t.origens)return '';if(UI.orig&&!t.origens.includes(UI.orig))UI.orig='';
  return `<label class="mut" style="margin:0">Turma de origem</label><select class="fld" id="sel-orig" style="width:auto"><option value="">Todas (${esc(t.origens.join(' + '))})</option>${t.origens.map(o=>`<option ${o===UI.orig?'selected':''}>${esc(o)}</option>`).join('')}</select>`}
function bindOrigem(cb){const s=$('#sel-orig');if(s)s.onchange=()=>{UI.orig=s.value;cb()}}
const instMax=i=>i.itens.reduce((s,x)=>s+(+x.cot||0),0);
function instAvaliado(i,aid){const n=i.notas[aid];return !!n&&i.itens.some(it=>num(n[it.id])!=null)}
function instTotal(i,aid){if(!instAvaliado(i,aid))return null;const n=i.notas[aid];return i.itens.reduce((s,it)=>s+(num(n[it.id])||0),0)}
function instDom(i,aid,dom){
  const its=i.itens.filter(x=>x.dom===dom);if(!its.length)return null;
  const max=its.reduce((s,x)=>s+(+x.cot||0),0);if(!max||!instAvaliado(i,aid))return null;
  const n=i.notas[aid];const pts=its.reduce((s,x)=>s+(num(n[x.id])||0),0);return {pts,max,pct:pts/max};
}
function domPer(t,aid,dom,per){const v=t.instrumentos.filter(i=>+i.periodo===+per).map(i=>instDom(i,aid,dom)).filter(Boolean).map(x=>x.pct);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function pctsPer(t,aid,per){const o={};t.dominios.forEach(d=>o[d.id]=domPer(t,aid,d.id,per));return o}
function pctsFinal(t,aid,per){
  if(+per===1||t.regra[per]==='periodo')return pctsPer(t,aid,per);
  const o={};if(t.dominios.every(d=>domPer(t,aid,d.id,per)==null)){t.dominios.forEach(d=>o[d.id]=null);return o}
  t.dominios.forEach(d=>{const v=[];for(let p=1;p<=per;p++){const x=domPer(t,aid,d.id,p);if(x!=null)v.push(x)}o[d.id]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null});return o;
}
function ponderada(t,pcts){let w=0,s=0;t.dominios.forEach(d=>{const p=pcts[d.id];if(p!=null&&+d.peso>0){s+=p*d.peso;w+=+d.peso}});return w?s/w:null}
function fmtNota(t,f){if(f==null)return '';const d=S.cfg.arred==null?1:S.cfg.arred,m=Math.pow(10,d);return isSec(t)?(Math.round(f*20*m)/m).toFixed(d).replace('.',','):Math.round(f*100)+'%'}
function nivel(t,f){if(f==null)return '';if(isSec(t))return Math.round(f*20+1e-9);const p=f*100;return p<20?1:p<50?2:p<70?3:p<90?4:5}
function mencao(t,f){if(f==null)return null;const p=Math.round(f*1000)/10;for(let i=0;i<t.mencoes.length;i++)if(p<=t.mencoes[i].max)return {i,nome:t.mencoes[i].nome};const l=t.mencoes.length-1;return {i:l,nome:t.mencoes[l].nome}}
const mcls=(t,m)=>m?'mc'+Math.min(4,Math.max(1,Math.round((m.i/Math.max(1,t.mencoes.length-1))*3)+1)):'';
const tcls=(t,m)=>m?'t'+mcls(t,m).slice(1):'';
const pillM=(t,m)=>m&&!m.banda&&m.nome?`<span class="pill ${mcls(t,m)}">${esc(m.nome)}</span>`:'';
const pct=f=>f==null?'':Math.round(f*100)+'%';
const pctD=(t,f)=>f==null||!isFinite(f)?'':(t&&isSec(t)?fmtNota(t,f):pct(f));
const negativa=(t,f)=>{const p=pctCanon(t,f);return p!=null&&(isSec(t)?p<50:nivel(t,f)<3)};
function avg(a){const v=a.filter(x=>x!=null&&x!==false);return v.length?v.reduce((x,y)=>x+y,0)/v.length:null}

