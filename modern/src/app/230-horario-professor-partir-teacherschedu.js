/* ===================== v0.920 · horário do professor a partir do TeacherSchedule (Excel ou PDF) ===================== */
const TS_DN={segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6};
function tsSigNL(n){const k=normT(n);if(/atendimento/.test(k))return 'DT-AP';if(/dire[cç]?ao de turma|direcao de turma/.test(k))return 'DT';if(/biblioteca/.test(k))return 'Biblioteca';if(/tutori/.test(k))return 'Tutoria';if(/clube/.test(k))return 'Clube';if(/coadjuv/.test(k))return 'Coadj.';if(/apoio/.test(k))return 'Apoio';
  if(n.length<=10)return n.replace(/^CNLE/i,'CNL-E');return n.split(/\s+/).filter(w=>w.length>2).map(w=>w[0].toUpperCase()).join('')}
/* uma célula «Disciplina» (+ «Sala») → aulas e/ou tempos não letivos */
function tsCelula(txt,sala){const L=String(txt||'').split(/\n/).map(x=>x.trim()).filter(Boolean);if(!L.length)return {aulas:[],nl:[]};const S_=String(sala||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
  const reT=/^(\d{1,2})\s*[ºª°.]?\s*([A-Z]{1,3})$/i,reS=/^\((.+)\)$/;const A_=[];let i=0;
  while(i<L.length-1&&reT.test(L[i])&&reS.test(L[i+1])){A_.push({turma:L[i].replace(/\s+/g,''),sig:L[i+1].match(reS)[1].trim()});i+=2}
  if(A_.length&&i>=L.length)return {aulas:A_.map((x,k)=>({...x,sala:S_[k]||S_[0]||''})),nl:[]};
  const full=L.join(' ').replace(/\s+-\s*$/,'').replace(/\s+/g,' ').trim();const m=full.match(/^(.*?)\s*\(([^()]+)\)\s*$/);const nome=(m?m[1]:full).trim(),tag=m?m[2].trim():'';
  if(/letivo/i.test(tag)||!tag&&!/\d/.test(nome))return {aulas:[],nl:[{sig:tsSigNL(nome),nome:nome+(/n[aã]o letivo/i.test(tag)?'':tag?' (letivo)':''),sala:S_[0]||''}]};
  return {aulas:[{turma:nome,sig:tag||nome,sala:S_[0]||''}],nl:[]}}
/* grelha comum: linhas [{ini,fim,dias:{d:{t,s}}}] → estrutura do horário do professor */
function tsMontar(G,ficheiro,docente,ano,preview){const aulas=[],nl=[];const linhas=G.map(g=>({ini:g.ini,fim:g.fim}));const ult={};
  G.forEach(g=>Object.entries(g.dias).forEach(([d,c])=>{d=+d;const r=tsCelula(c.t,c.s);r.aulas.forEach(x=>{if(!aulas.some(y=>y.dia===d&&y.ini===g.ini&&y.turma===x.turma&&y.sig===x.sig))aulas.push({dia:d,ini:g.ini,fim:g.fim,turma:x.turma,sig:x.sig,sala:x.sala})});
    r.nl.forEach(x=>{const u=ult[d];const gid=u&&u.sig===x.sig&&u.fim>=g.ini-30?u.g:uid();ult[d]={sig:x.sig,fim:g.fim,g:gid};if(!nl.some(y=>y.dia===d&&y.ini===g.ini&&y.sig===x.sig))nl.push({dia:d,ini:g.ini,fim:g.fim,sig:x.sig,nome:normSig(x.nome)===normSig(x.sig)?nomeNL(x.sig):x.nome,sala:x.sala,g:gid})});
    if(!r.nl.length)ult[d]=null}));
  if(!aulas.length&&!nl.length)throw new Error('Não encontrei aulas no horário (TeacherSchedule).');
  aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);nl.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);
  return {ficheiro,docente:docente||'',grupo:'',escola:'',ano:ano||'',preview:preview||'',linhas,aulas,naoLetivos:nl,obs:[],obsMap:{},paginas:1,origemTS:true}}
const tsAno=txt=>{const m=String(txt||'').match(/(\d{1,2})\s+de\s+([A-Za-zçÇ]+)\s+de\s+(\d{4})/);if(!m)return '';const M=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'].indexOf(normT(m[2]));if(M<0)return '';const y=+m[3];return M>=8?y+'/'+(y+1):(y-1)+'/'+y};
async function lerTeacherScheduleXlsx(file){const z=await unzip(await file.arrayBuffer());const wb=xmlDoc(await z.text('xl/workbook.xml')||'<x/>');const rels=await relsDe(z,'xl/workbook.xml');
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  for(const sh of tagsNS(wb,'sheet')){const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');const rel=rels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;
    const doc=xmlDoc(sx);const C=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}if(String(v).trim()!=='')C.set((+m[2]-1)+','+colNum(m[1]),String(v))});
    const g=(r,c)=>(C.get(r+','+c)||'').trim();const cel=[...C.keys()].map(k=>k.split(',').map(Number));
    const porL={};cel.forEach(([r,c])=>{const k=normT(g(r,c));if(TS_DN[k])(porL[r]=porL[r]||[]).push({c,d:TS_DN[k]})});const hr=Object.keys(porL).map(Number).find(r=>porL[r].length>=3);if(hr==null)continue;
    const dias=porL[hr].sort((a,b)=>a.c-b.c);const maxC=Math.max(...cel.map(x=>x[1]));dias.forEach((d,i)=>{d.c2=i<dias.length-1?dias[i+1].c-1:maxC;d.dc=d.c;d.sc=null;for(let c=d.c;c<=d.c2;c++){const v=normT(g(hr+1,c));if(v==='disciplina')d.dc=c;if(v==='sala')d.sc=c}});
    const reT=/(\d{1,2}[:hH]\d{2})\s*[\n\r\-–—a]+\s*(\d{1,2}[:hH]\d{2})/;const tc={};cel.forEach(([r,c])=>{if(r>hr&&reT.test(g(r,c)))tc[c]=(tc[c]||0)+1});const tcol=+Object.keys(tc).sort((a,b)=>tc[b]-tc[a])[0];if(isNaN(tcol))continue;
    const nCls=cel.filter(([r,c])=>r>hr&&/\d{1,2}\s*º\s*[A-Z]/.test(g(r,c))).length;const temProf=cel.some(([r,c])=>r>hr&&/professor/i.test(g(r,c)));if(temProf&&nCls<2)continue;
    const G=[];const vis=new Set();const maxR=Math.max(...cel.map(x=>x[0]));
    for(let r=hr+2;r<=maxR;r++){const m=g(r,tcol).match(reT);if(!m)continue;const ini=hm(m[1]),fim=hm(m[2]);if(vis.has(ini))continue;vis.add(ini);const L={ini,fim,dias:{}};
      dias.forEach(d=>{const t=g(r,d.dc),s=d.sc!=null?g(r,d.sc):'';if(t)L.dias[d.d]={t,s}});G.push(L)}
    if(!G.length)continue;let doc_='';for(let r=hr-1;r>=0&&!doc_;r--){const v=cel.filter(([rr])=>rr===r).map(([rr,c])=>g(rr,c)).find(x=>x&&!/\d/.test(x)&&x.length>4);if(v)doc_=v}
    return tsMontar(G.sort((a,b)=>a.ini-b.ini),file.name,doc_,'')}
  return null}
async function lerTeacherSchedulePdf(file){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const page=await doc.getPage(1);const tc=await page.getTextContent();
  const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||8;return {s:i.str.replace(/\s+/g,' ').trim(),x:t[4],y:t[5],w:i.width||0,h,cx:t[4]+(i.width||0)/2}});
  const dh=it.filter(i=>TS_DN[normT(i.s)]);if(dh.length<3)throw new Error('Não encontrei os dias da semana no PDF.');const hy=Math.min(...dh.map(i=>i.y))-1;
  const sub=it.filter(i=>i.y<hy&&/^(disciplina|sala)$/i.test(i.s)).sort((a,b)=>a.cx-b.cx);if(sub.length<4)throw new Error('Não encontrei as colunas Disciplina/Sala.');const sy=Math.min(...sub.map(i=>i.y));
  const dias=dh.sort((a,b)=>a.cx-b.cx).map(i=>TS_DN[normT(i.s)]);const cols=[];let k=0;dias.forEach(d=>{const a=sub[k],b=sub[k+1];if(a&&/disciplina/i.test(a.s)){cols.push({d,tipo:'t',cx:a.cx});if(b&&/sala/i.test(b.s)){cols.push({d,tipo:'s',cx:b.cx});k+=2}else k+=1}});
  const x0=Math.min(...cols.map(c=>c.cx))-40;const T_=it.filter(i=>i.y<sy&&/^\d{1,2}:\d{2}$/.test(i.s)&&i.cx<x0+30).sort((a,b)=>b.y-a.y);const sl=[];
  for(let i=0;i<T_.length-1;i++){const a=T_[i],b=T_[i+1];if(a.y-b.y<a.h*1.8&&hm(b.s)>hm(a.s)){sl.push({ini:hm(a.s),fim:hm(b.s),cy:(a.y+b.y)/2});i++}}
  if(sl.length<2)throw new Error('Não encontrei os tempos (horas) no PDF.');const dy=sl.length>1?sl[0].cy-sl[1].cy:30;
  const G=sl.map(s=>({ini:s.ini,fim:s.fim,dias:{},_t:{}}));const tset=new Set(T_);
  it.filter(i=>i.y<sy-1&&!tset.has(i)&&i.cx>x0&&i.y>sl[sl.length-1].cy-dy*.75).forEach(i=>{let si=0,bd=1e9;sl.forEach((s,j)=>{const d=Math.abs(s.cy-i.y);if(d<bd){bd=d;si=j}});let ci=0,bc=1e9;cols.forEach((c,j)=>{const d=Math.abs(c.cx-i.cx);if(d<bc){bc=d;ci=j}});
    const c=cols[ci];const L=G[si];(L._t[c.d+c.tipo]=L._t[c.d+c.tipo]||[]).push(i)});
  const junta=A_=>{A_.sort((a,b)=>b.y-a.y||a.x-b.x);const out=[];A_.forEach(i=>{const u=out[out.length-1];if(u&&Math.abs(u.y-i.y)<2)u.s+=' '+i.s;else out.push({y:i.y,s:i.s})});return out.map(o=>o.s).join('\n')};
  G.forEach(L=>{dias.forEach(d=>{const t=L._t[d+'t'],s=L._t[d+'s'];if(t&&t.length)L.dias[d]={t:junta(t),s:s?junta(s):''}});delete L._t});
  const top=it.filter(i=>i.y>Math.max(...dh.map(z=>z.y))+2).sort((a,b)=>b.y-a.y);const docente=(top.find(i=>!/\d/.test(i.s)&&i.s.length>4)||{}).s||'';
  let preview='';try{const vp=page.getViewport({scale:1.25});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;preview=cv.toDataURL('image/jpeg',.7)}catch(_){}
  return tsMontar(G,file.name,docente,tsAno(it.map(i=>i.s).join(' ')),preview)}
{const _lhp=lerHorarioProfPdf;lerHorarioProfPdf=async function(file){const nm=(file&&file.name||'').toLowerCase();
  if(/\.xlsx$/.test(nm)){const r=await lerTeacherScheduleXlsx(file);if(r)return r;throw new Error('Não encontrei a grelha do horário do professor neste Excel (TeacherSchedule).')}
  try{return await _lhp.apply(this,arguments)}catch(e){try{return await lerTeacherSchedulePdf(file)}catch(e2){throw e}}}}

