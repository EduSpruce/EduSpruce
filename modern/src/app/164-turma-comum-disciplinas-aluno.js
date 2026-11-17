/* ===================== v0.50 · Turma comum às disciplinas (aluno único) ===================== */
/* Cada «turma» da app é turma + disciplina. As turmas com o mesmo nome e escola no mesmo ano formam uma classe.
   Os alunos da mesma classe partilham um identificador comum (aluno.cid). Os dados pessoais (CAMPOS_COMUNS)
   são mantidos iguais em todas as disciplinas: uma alteração numa cópia propaga-se às outras ao guardar.
   Registos que pertencem ao aluno e não à disciplina (contactos com o EE) ficam em ano.alunosC[cid]. */
const CAMPOS_COMUNS=['nome','num','processo','numInterno','genero','generoManual','nasc','foto','eeNome','eeParent','eeContacto','email','morada','contactos','contactoAutorizado','ase','repetente','medidas','acomod'];
const classeKey=t=>t&&!t.origens?escId(escolaDe(t))+'|'+normTurma(t.nome):null;
function turmasIrmas(t,a){a=a||A();const k=classeKey(t);if(!a||!k)return [t];return a.turmas.filter(x=>classeKey(x)===k)}
function alC(a,cid){a.alunosC=a.alunosC||{};return a.alunosC[cid]=a.alunosC[cid]||{}}
const _hs=v=>{let j=typeof v==='string'&&v.length>4000?v.length+'|'+v.slice(0,200)+v.slice(-200):JSON.stringify(v==null?null:v);let h=5381;for(let i=0;i<j.length;i++)h=((h<<5)+h+j.charCodeAt(i))|0;return h};
function ligarClasse(a){if(!a)return;const G={};(a.turmas||[]).forEach(t=>{const k=classeKey(t);if(k)(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(L=>{const vistos=[];L.forEach(t=>{const usados=new Set();t.alunos.forEach(x=>{if(x.cid){usados.add(x.cid);vistos.push(x)}});
    t.alunos.forEach(x=>{if(x.cid)return;const m=vistos.find(y=>y.cid&&!usados.has(y.cid)&&((x.processo&&y.processo&&String(y.processo)===String(x.processo))||normT(y.nome||'')===normT(x.nome||'')));x.cid=m?m.cid:uid();usados.add(x.cid);vistos.push(x)})})});
  (a.turmas||[]).filter(t=>t.origens).forEach(t=>t.alunos.forEach(x=>{if(x.cid)return;const src=x.origemId&&(a.turmas||[]).find(z=>z!==t&&z.alunos.some(y=>y.id===x.origemId));const y=src&&src.alunos.find(y=>y.id===x.origemId);x.cid=y&&y.cid||uid()}))}
function copiasDe(a,cid){const L=[];(a.turmas||[]).forEach(t=>t.alunos.forEach(x=>{if(x.cid===cid)L.push([t,x])}));return L}
function sincComuns(a){if(!a||!a.turmas)return 0;ligarClasse(a);const by={};a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.cid)(by[x.cid]=by[x.cid]||[]).push([t,x])}));let n=0;
  Object.entries(by).forEach(([cid,L])=>{if(L.length<2)return;const c=alC(a,cid);c.h=c.h||{};
    CAMPOS_COMUNS.forEach(f=>{const P=L.filter(([t])=>!(f==='num'&&t.origens));if(P.length<2&&!(P.length===1&&c.h[f]==null))return;const hs=P.map(([,x])=>_hs(x[f]));
      let fonte=null;if(c.h[f]==null){/* primeira ligação: o valor mais completo */let best=-1;P.forEach(([,x],k)=>{const v=x[f];const sz=v==null||v===''?-1:JSON.stringify(v).length;if(sz>best){best=sz;fonte=k}})}
      else{const k=hs.findIndex(h=>h!==c.h[f]);if(k>=0)fonte=k}
      if(fonte==null||fonte<0)return;const v=P[fonte][1][f];const vj=v==null?undefined:JSON.stringify(v);P.forEach(([,x],k)=>{if(k!==fonte&&hs[k]!==hs[fonte]){if(vj===undefined)delete x[f];else x[f]=JSON.parse(vj);n++}});c.h[f]=hs[fonte]})});
  return n}
MIGRACOES.push({v:3,n:'Alunos ligados entre as disciplinas da mesma turma (dados pessoais comuns)',f:st=>{(st.anos||[]).forEach(a=>{try{sincComuns(a)}catch(e){console.warn(e)}})}});
try{migrarDados()}catch(e){console.error(e)}
{const _svC=saveNow;saveNow=function(){try{const a=A();if(a)sincComuns(a)}catch(e){console.warn('sincComuns',e)}return _svC.apply(this,arguments)}}

