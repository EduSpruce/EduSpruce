/* =====================================================================
   HORÁRIOS — importação do Excel do horário da turma (ClassSchedule)
   Guardados por ano letivo: A().horarios[nome da turma] = {turma, aulas, legenda, diretor}
   ===================================================================== */
const DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS_C=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const normT=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const normTurma=s=>normT(s).replace(/[^a-z0-9/]/g,'');            // "10ºA" == "10.º A" == "10 a"
const hm=s=>{const m=String(s).match(/(\d{1,2})[:hH.](\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const fmtHM=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const diaIdx=s=>{const n=normT(s);return n.startsWith('seg')?1:n.startsWith('ter')?2:n.startsWith('qua')?3:n.startsWith('qui')?4:n.startsWith('sex')?5:n.startsWith('sab')?6:0};
async function lerHorarioXlsx(file){
  const z=await unzip(await file.arrayBuffer());
  const wbPath='xl/workbook.xml';const wb=xmlDoc(await z.text(wbPath)||'<x/>');const wbRels=await relsDe(z,wbPath);
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  const out=[];
  for(const sh of tagsNS(wb,'sheet')){
    const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');
    const rel=wbRels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;
    const doc=xmlDoc(sx);const cells=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;
      const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}
      if(String(v).trim()!=='')cells.set((+m[2]-1)+','+colNum(m[1]),{r:+m[2]-1,c:colNum(m[1]),v:String(v)})});
    // células unidas: o valor do canto superior esquerdo vale para todo o bloco
    tagsNS(doc,'mergeCell').forEach(mc=>{const [a,b]=(mc.getAttribute('ref')||'').split(':');if(!b)return;
      const pa=a.match(/^([A-Z]+)(\d+)$/),pb=b.match(/^([A-Z]+)(\d+)$/);if(!pa||!pb)return;
      const r1=+pa[2]-1,c1=colNum(pa[1]),r2=+pb[2]-1,c2=colNum(pb[1]);const top=cells.get(r1+','+c1);if(!top)return;
      for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(!cells.has(r+','+c))cells.set(r+','+c,{r,c,v:top.v,m:1})});
    const h=parseHorario(cells);if(h){h.folha=sh.getAttribute('name');out.push(h)}
  }
  return out;
}
function parseHorario(cells){
  const all=[...cells.values()];
  const get=(r,c)=>{const x=cells.get(r+','+c);return x?String(x.v).trim():''};
  const reDia=/^(segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado)/i;
  const porLinha={};all.forEach(x=>{if(reDia.test(x.v.trim()))(porLinha[x.r]=porLinha[x.r]||[]).push(x)});
  const hr=Object.keys(porLinha).map(Number).sort((a,b)=>new Set(porLinha[b].map(x=>diaIdx(x.v))).size-new Set(porLinha[a].map(x=>diaIdx(x.v))).size)[0];
  if(hr==null||new Set(porLinha[hr].map(x=>diaIdx(x.v))).size<3)return null;
  const dias=[];porLinha[hr].sort((a,b)=>a.c-b.c).forEach(x=>{const d=diaIdx(x.v);if(d&&!dias.find(y=>y.d===d))dias.push({d,c:x.c})});
  const maxC=Math.max(...all.map(x=>x.c));
  dias.forEach((d,i)=>{d.c2=i<dias.length-1?dias[i+1].c-1:maxC;d.sala=null;
    for(let r=hr+1;r<=hr+2&&d.sala==null;r++)for(let c=d.c;c<=d.c2;c++)if(/^sala$/i.test(get(r,c))){d.sala=c;break}});
  const reT=/(\d{1,2}[:hH]\d{2})\s*[\n\r\-–—a]+\s*(\d{1,2}[:hH]\d{2})/;
  const tcount={};all.forEach(x=>{if(x.r>hr&&reT.test(x.v))tcount[x.c]=(tcount[x.c]||0)+1});
  const tcol=Object.keys(tcount).sort((a,b)=>tcount[b]-tcount[a])[0];if(tcol==null)return null;const tc=+tcol;
  const legC=all.filter(x=>x.r>hr&&/^disciplina$/i.test(x.v.trim())&&all.some(y=>y.r===x.r&&/professor/i.test(y.v)));
  const legR=legC.length?Math.min(...legC.map(x=>x.r)):null;
  const fimR=legR!=null?legR:Math.max(...all.map(x=>x.r))+1;
  const aulas=[];let slot=null;
  for(let r=hr+1;r<fimR;r++){
    const m=get(r,tc).match(reT);if(m)slot={ini:hm(m[1]),fim:hm(m[2])};
    if(!slot)continue;
    dias.forEach(d=>{const ab=get(r,d.c);if(!ab||/^(disciplina|sala)$/i.test(ab)||reT.test(ab))return;
      const sala=d.sala!=null?get(r,d.sala):'';
      if(!aulas.some(a=>a.dia===d.d&&a.ini===slot.ini&&a.ab===ab))aulas.push({dia:d.d,ini:slot.ini,fim:slot.fim,ab,sala})});
  }
  const leg=[];
  if(legR!=null){
    const hc=all.filter(x=>x.r===legR&&!x.m).sort((a,b)=>a.c-b.c);
    const cD=(hc.find(x=>/^disciplina$/i.test(x.v.trim()))||{c:0}).c,cP=(hc.find(x=>/professor/i.test(x.v))||{c:99}).c;
    for(let r=legR+1;r<legR+60;r++){
      const row=all.filter(x=>x.r===r&&!x.m).sort((a,b)=>a.c-b.c);if(!row.length)continue;
      if(row.some(x=>/diretor/i.test(x.v)))break;
      const ab=get(r,cD);if(!ab)continue;
      const nome=row.find(x=>x.c>cD&&x.c<cP);const prof=row.find(x=>x.c>=cP);
      leg.push({ab,nome:nome?nome.v.trim():ab,profs:prof?prof.v.split(/;|\n/).map(x=>x.trim()).filter(Boolean):[]});
    }
  }
  let turma='';const tt=all.find(x=>/hor[aá]rio/i.test(x.v)&&/turma/i.test(x.v));
  if(tt)turma=detTurma(tt.v)||tt.v.replace(/.*turma\s*:?\s*/i,'').trim();
  if(!turma){const x=all.find(x=>x.r<hr&&detTurma(x.v));if(x)turma=detTurma(x.v)}
  let diretor='';const dr=all.find(x=>/diretor/i.test(x.v)&&!x.m);
  if(dr){const nx=all.filter(x=>x.r===dr.r&&x.c>dr.c&&!x.m&&x.v.trim()).sort((a,b)=>a.c-b.c)[0];if(nx)diretor=nx.v.trim()}
  aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);
  return aulas.length?{turma,aulas,legenda:leg,diretor}:null;
}
/* que siglas do horário correspondem à disciplina (prefere as do próprio professor) */
const mesmoNome=(a,b)=>{const x=normT(a).replace(/[^a-z ]/g,' ').split(' ').filter(w=>w.length>1),y=normT(b).replace(/[^a-z ]/g,' ').split(' ').filter(w=>w.length>1);
  return !!x.length&&!!y.length&&x[0]===y[0]&&x[x.length-1]===y[y.length-1]};
function siglasDaDisciplina(h,disc){
  const d=normT(disc).replace(/\(.*\)/,'').trim();if(!h||!d)return [];
  const cand=h.legenda.filter(l=>{const n=normT(l.nome);return n===d||n.includes(d)||d.includes(n)||normT(l.ab)===d});
  const prof=S.cfg.professor;const meus=cand.filter(l=>prof&&l.profs.some(p=>mesmoNome(p,prof)));
  return (meus.length?meus:cand).map(l=>l.ab);
}
function siglasDoProfessor(h){const prof=S.cfg.professor;return prof&&h?h.legenda.filter(l=>l.profs.some(p=>mesmoNome(p,prof))):[]}
const horarioDe=(a,nome)=>{const H=(a||{}).horarios||{};const k=Object.keys(H).find(k=>normTurma(k)===normTurma(nome));return k?H[k]:null};
const turmasDaClasse=t=>t.origens||[t.nome];
/* aulas da turma·disciplina */
function comEscola(id,fn){const ant=S.escolaAtiva;S.escolaAtiva=id;try{return fn()}finally{S.escolaAtiva=ant}}
function aulasTurma(t,a){const e=escId(escolaDe(t));if(e!==escAtiva())return comEscola(e,()=>aulasTurma0(t,a));return aulasTurma0(t,a)}
function aulasTurma0(t,a){
  a=a||A();const out=[];
  turmasDaClasse(t).forEach(c=>{const h=horarioDe(a,c);if(!h)return;
    const sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);
    h.aulas.filter(x=>sig.includes(x.ab)).forEach(x=>{if(!out.some(o=>o.dia===x.dia&&o.ini===x.ini&&o.ab===x.ab))out.push({...x,classe:c})})});
  // o horário do professor (PDF), quando associado a esta turma, tem prioridade: diz exatamente quando o professor tem aula
  const P_=aulasProfTurma(t,a);if(P_.length){const o2=[];P_.forEach(x=>{if(!o2.some(o=>o.dia===x.dia&&o.ini===x.ini))o2.push(x)});return o2.sort((x,y)=>x.dia-y.dia||x.ini-y.ini)}
  return out.sort((x,y)=>x.dia-y.dia||x.ini-y.ini);
}
/* junta tempos seguidos da mesma disciplina/sala num bloco (ex.: 08:30–10:00) */
function blocos(aulas){
  const L=aulas.slice().sort((x,y)=>x.dia-y.dia||x.ini-y.ini);const out=[];
  L.forEach(x=>{const p=out[out.length-1];if(p&&p.dia===x.dia&&p.ab===x.ab&&p.sala===x.sala&&x.ini-p.fim<=5&&x.ini>=p.ini){p.fim=x.fim;p.tempos++}else out.push({...x,tempos:1})});
  return out;
}
/* próximas aulas a partir de agora */
function proximasAulas(aulas,n,desde,t){
  const B=blocos(aulas);if(!B.length)return [];
  const agora=desde||new Date();const out=[];
  for(let k=0;k<(CAL()?240:70)&&out.length<(n||1);k++){
    const d=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()+k);const dow=d.getDay();
    const mins=agora.getHours()*60+agora.getMinutes();
    const temC=!!CAL();const iso=isoData(d);
    blocosDiaP(B,d,t).filter(b=>b.dia===dow&&(k>0||b.fim>mins)&&(!temC||letivoPara(b.t||t,iso))).forEach(b=>{if(out.length<(n||1))out.push({...b,data:d,agora:k===0&&b.ini<=mins,k})});
  }
  return out;
}
function quando(p){if(!p)return '';const d=p.data;const dd=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
  return (p.agora?'Agora':p.k===0?'Hoje':p.k===1?'Amanhã':DIAS_C[d.getDay()]+', '+dd)+' · '+fmtHM(p.ini)+'–'+fmtHM(p.fim)+(p.sala?' · Sala '+p.sala:'')}
const isoData=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function proxAulaHtml(t){const p=proximasAulas(aulasTurma(t),1,null,t)[0];return p?`<span class="prox ${p.agora?'now':''}">${ic('calendar',13)} ${p.agora?'Aula a decorrer':'Próxima aula'}: <b>${esc(quando(p))}</b></span>`:''}
