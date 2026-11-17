/* ===================== v0.999 · Coord. PROFIJ › Classificações e Pautas =====================
   Histórico de classificações do SGE (Excel, uma folha por formando) → médias por componente e por ano,
   CFA = (FSC + FC + 2·FT + FP) / 5 (às décimas), CFC = (CFA1 + … + CPAF) / n (às unidades),
   grelha de avaliação da FPCT (relatório + entidade acolhedora) e pautas (FPCT e CFC, detalhada e final) em Word ou PDF. */
const PZ_COMP=[['FSC','Sociocultural'],['FC','Científica'],['FT','Tecnológica'],['FP','Prática (FPCT)']];
const PZ_SOC=/^(l[ií]ngua portuguesa|l[ií]ngua estrangeira|ingl[eê]s|tecnologias da informa|tic\b|mundo atual|cidadania|desenvolvimento pessoal|educa[cç][aã]o f[ií]sica|higiene)/i;
const pzR=(v,d)=>{if(v==null||isNaN(v))return null;const m=Math.pow(10,d);return Math.sign(v)*Math.round(Math.abs(v)*m+1e-9)/m};
const pzF=(v,d)=>v==null?'':(d==null?String(v):v.toFixed(d)).replace('.',',');
const pzCompDe=n=>/franc[eê]s|alem[aã]o|espanhol/i.test(n)?'FC':/^\d{3,5}\s*[-–]/.test(n)||/^ufcd/i.test(n)?'FT':/fpct|forma[cç][aã]o pr[aá]tica|est[aá]gio/i.test(n)?'FP':PZ_SOC.test(normT(n).replace(/\s+/g,' '))||PZ_SOC.test(n)?'FSC':'FC';
function PZS(){const {c}=CP();c.pautas=c.pautas||{};return c.pautas}
function pzNovo(nome){const P=PZS();const id=uid();P[id]={id,nome:nome||'Curso',curso:'',tipo:'IV-4',anos:3,anoAtual:3,anoLetivo:(A()&&A().nome)||'',local:S.cfg.localidade||'',data:isoHoje(),pesos:{FSC:1,FC:1,FT:2,FP:1},
  form:[],disc:[],notas:{},fpct:{crit:[['Caraterização da Entidade Enquadradora',60],['Descrição das Atividades Desenvolvidas',60],['Análise Crítica',60],['Capacidade de Autoavaliação',20]],pRel:0.2,pEnt:0.8,v:{}},cpaf:{}};return P[id]}
/* ---------- importar o «Histórico de classificações do aluno» (SGE) ---------- */
async function pzImportar(pid){const inp=document.createElement('input');inp.type='file';inp.accept='.xlsx';inp.multiple=true;inp.onchange=async()=>{const fs=[...inp.files];if(!fs.length)return;
  try{let n=0,nd=0;const P=PZS();let p=pid&&P[pid];
    for(const f of fs){const F=await ptXlsxFolhas(f);for(const sh of F){const r=pzLerFolha(sh);if(!r)continue;if(!p){const gs=f.name.replace(/\.xlsx$/i,'').replace(/^[0-9a-f]{8}-/i,'').replace(/_/g,' ').replace(/\s+/g,' ').trim();const nn=(prompt('Nome deste curso/turma na app:',gs)||gs).trim();p=pzNovo(nn);UI.pzId=p.id}
      let fo=p.form.find(x=>normT(x.nome)===normT(r.nome));if(!fo){const al=pzProcurarAluno(r.nome);fo={id:uid(),nome:r.nome,num:al&&(al.processo||al.num)||'',bi:''};p.form.push(fo);n++}
      if(r.anos.length){const mx=Math.max(...r.anos);if(mx!==p.anos&&!p._tipoMan){p.anos=mx;p.tipo=mx>=3?'IV-4':mx===2?'II-2':'II-3';p.pesos=Object.assign({},p.pesos)}p.anoAtual=mx}
      r.linhas.forEach(l=>{let d=p.disc.find(x=>normT(x.nome)===normT(l.nome));if(!d){d={id:uid(),nome:l.nome,comp:pzCompDe(l.nome)};p.disc.push(d);nd++}
        Object.entries(l.v).forEach(([ano,v])=>{const k=fo.id+'|'+ano+'|'+d.id;p.notas[k]=v})})}}
    if(!p)return toast('Não encontrei nenhum «Histórico de classificações do aluno» nesse ficheiro.','aviso');
    pzOrdenar(p);save();vCProfij();toast(`Importado: ${p.form.length} formando(s), ${p.disc.length} disciplinas/UFCD${n?' · '+n+' novo(s)':''}.`)}
  catch(e){console.warn(e);toast('Não foi possível ler o ficheiro: '+e.message,'erro')}};inp.click()}
function pzProcurarAluno(nome){const a=A();if(!a)return null;for(const t of a.turmas){const x=(t.alunos||[]).find(z=>normT(z.nome)===normT(nome));if(x)return x}return null}
function pzLerFolha(sh){const C=sh.C;const g=r=>C.get(r)||'';let nome='';for(const [k,v] of C){if(/hist[oó]rico de classifica/i.test(v)){const m=v.match(/aluno\s*\(?a?\)?\s+(.+)$/i);if(m)nome=m[1].trim()}}if(!nome)return null;
  const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  let rDisc=0,cDisc=0;for(const [k,v] of C)if(/^disciplinas$/i.test(v.trim())){const m=k.match(/^([A-Z]+)(\d+)$/);rDisc=+m[2];cDisc=col(m[1])}if(!rDisc)return null;
  /* blocos de ano: «… 1.º Ano» na linha das disciplinas; períodos e «Aval» na linha seguinte */
  const anos=[];for(const [k,v] of C){const m=k.match(/^([A-Z]+)(\d+)$/);if(+m[2]!==rDisc)continue;const a=v.match(/(\d)\.?\s*º\s*Ano/i);if(a)anos.push({ano:+a[1],c:col(m[1]),al:(v.match(/(\d{4}\/\d{4})/)||[])[1]||''})}
  anos.sort((x,y)=>x.c-y.c);anos.forEach((b,i)=>{b.f=i<anos.length-1?anos[i+1].c-1:b.c+12;b.cols=[];for(let c=b.c;c<=b.f;c++){const h=g(ltr(c)+(rDisc+1)).trim();if(h)b.cols.push({c,h})}});
  const linhas=[];for(let r=rDisc+2;r<rDisc+200;r++){let n=g(ltr(cDisc)+r).trim();if(!n)continue;if(/^total$/i.test(n))break;n=n.replace(/^unidades? de forma[cç][aã]o de curta dura[cç][aã]o\s*[-–]\s*/i,'');
    const v={};anos.forEach(b=>{const av=b.cols.find(x=>/aval|cif|cfd/i.test(x.h));const per=b.cols.filter(x=>/p\./i.test(x.h)).map(x=>g(ltr(x.c)+r).trim());let val=av?g(ltr(av.c)+r).trim():'';
      /* «Aval» com fórmula sobre períodos vazios dá 0: só conta se houver classificação nalgum período (as UFCD só têm «Aval») */
      if(per.length&&!per.some(x=>x!==''))val=per.length&&/^0([.,]0+)?$/.test(val)?'':val;
      if(!/\d/.test(val)){const num=per.filter(x=>/^\d+([.,]\d+)?$/.test(x));const fl=per.filter(x=>/^[a-z]\)$/i.test(x));val=num.length?num[num.length-1]:fl.length?fl[fl.length-1]:''}
      if(val!=='')v[b.ano]=/^\d/.test(val)?+String(val).replace(',','.'):val});
    if(Object.keys(v).length)linhas.push({nome:n,v})}
  return {nome,anos:anos.map(b=>b.ano),linhas}}
function pzOrdenar(p){const o={FSC:0,FC:1,FT:2,FP:3};p.disc.sort((x,y)=>(o[x.comp]-o[y.comp])||(x.comp==='FT'?x.nome.localeCompare(y.nome,'pt',{numeric:true}):0))}
/* ---------- cálculo ---------- */
const pzNum=v=>typeof v==='number'&&!isNaN(v)?v:(typeof v==='string'&&/^\d+([.,]\d+)?$/.test(v)?+v.replace(',','.'):null);
function pzFpct(p,fo){const x=p.fpct.v[fo.id]||{};const tot=p.fpct.crit.reduce((s,c)=>s+(+c[1]||0),0)||200;const sc=p.fpct.crit.map((c,i)=>pzNum(x['c'+i]));const rel=sc.every(v=>v!=null)?sc.reduce((s,v)=>s+v,0)/(tot/20):(pzNum(x.rel));const ent=pzNum(x.ent);
  const nota=rel!=null&&ent!=null?rel*(+p.fpct.pRel)+ent*(+p.fpct.pEnt):null;return {sc,rel:rel!=null?pzR(rel,2):null,ent,nota:nota!=null?pzR(nota,2):null,fin:nota!=null?pzR(nota,0):null}}
function pzAno(p,fo,ano){const r={};PZ_COMP.forEach(([k])=>{const L=p.disc.filter(d=>d.comp===k).map(d=>pzNum(p.notas[fo.id+'|'+ano+'|'+d.id])).filter(v=>v!=null);
    if(k==='FP'){const m=pzNum(p.notas[fo.id+'|'+ano+'|FP']);const f=+ano===+p.anoAtual?pzFpct(p,fo).fin:null;const v=m!=null?m:f!=null?f:L.length?L.reduce((s,v)=>s+v,0)/L.length:null;r[k]=v!=null?pzR(v,1):null;return}
    r[k]=L.length?pzR(L.reduce((s,v)=>s+v,0)/L.length,1):null});
  const W=p.pesos;const ks=PZ_COMP.map(c=>c[0]).filter(k=>+W[k]>0);const ok=ks.every(k=>r[k]!=null);const sw=ks.reduce((s,k)=>s+(+W[k]),0);
  r.CFA=ok&&sw?pzR(ks.reduce((s,k)=>s+r[k]*(+W[k]),0)/sw,1):null;return r}
function pzCFC(p,fo){const L=[];for(let a=1;a<=p.anos;a++)L.push(pzAno(p,fo,a).CFA);const cp=pzNum(p.cpaf[fo.id]);const ok=L.every(v=>v!=null)&&cp!=null;return {cfa:L,cpaf:cp,cfc:ok?pzR((L.reduce((s,v)=>s+v,0)+cp)/(L.length+1),0):null,bruto:ok?(L.reduce((s,v)=>s+v,0)+cp)/(L.length+1):null}}
/* ---------- vista ---------- */
function pzHTML(a){const P=PZS();const L=Object.values(P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt',{numeric:true}));const p=P[UI.pzId]||L[0];if(p)UI.pzId=p.id;
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${L.map(x=>`<button type="button" class="chip ${p&&x.id===p.id?'on':''}" data-pzid="${x.id}">${esc(x.nome)}</button>`).join('')}<button type="button" class="chip" id="pz-novo">${ic('plus',13)} Novo</button><button type="button" class="chip" id="pz-imp">${ic('upload',13)} Importar Histórico do SGE (Excel)</button></div>`;
  if(!p)return sel+`<section class="card empty">${ic('award',28)}<br><b>Classificações e Pautas</b><br><span class="mut">Importe o «Histórico de classificações do aluno» exportado do SGE (Excel, uma folha por formando). A app calcula as médias por componente, a CFA de cada ano, a FPCT e a CFC, e faz as pautas.</span><br><br><button class="btn pri" id="pz-imp2">${ic('upload',14)} Importar Histórico (Excel)</button> <button class="btn" id="pz-ifp0">${ic('upload',14)} Importar Grelha da FPCT</button></section>`;
  const W=p.pesos;const ft=PZ_COMP.filter(([k])=>+W[k]>0).map(([k])=>(+W[k]===1?'':W[k])+k).join('+');
  const cab=`<section class="card"><div class="pz-cab">
      <div class="pz-w2"><label>Curso (como na pauta)</label><input data-pzc="curso" value="${esc(p.curso)}" placeholder="ex.: Animador/a Sociocultural"></div>
      <div><label>Nome na app</label><input data-pzc="nome" value="${esc(p.nome)}"></div>
      <div><label>Tipo</label><select data-pzc="tipo">${[['II-2','PROFIJ II – Tipo 2',2],['II-3','PROFIJ II – Tipo 3',1],['IV-4','PROFIJ IV – Tipo 4',3]].map(([k,l])=>`<option value="${k}" ${p.tipo===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div><label>Anos</label><input type="number" min="1" max="3" data-pzc="anos" value="${p.anos}" ></div>
      <div><label>Ano atual</label><input type="number" min="1" max="3" data-pzc="anoAtual" value="${p.anoAtual}" ></div>
      <div><label>Ano letivo</label><input data-pzc="anoLetivo" value="${esc(p.anoLetivo)}" ></div>
      <div><label>Localidade</label><input data-pzc="local" value="${esc(p.local)}" ></div>
      <div><label>Data das pautas</label><input type="date" data-pzc="data" value="${esc(p.data)}"></div></div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center"><b>CFA = (${ft})/${PZ_COMP.reduce((s,[k])=>s+(+W[k]||0),0)}</b>${PZ_COMP.map(([k,l])=>`<label class="prl"><span title="${l}">${k}</span><input type="number" min="0" max="5" step="0.5" data-pzw="${k}" value="${W[k]}"></label>`).join('')}<span class="mut">às décimas · CFC = (CFA1${p.anos>1?'+…+CFA'+p.anos:''}+CPAF)/${p.anos+1}, às unidades</span>
      <span class="sp1"></span><button class="btn sm" id="pz-imp3">${ic('upload',14)} Importar Histórico</button><button class="btn sm dng" id="pz-del">${ic('trash',14)}</button></div></section>`;
  const fo=`<section class="card"><div class="row"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><button class="btn sm noprint" id="pz-fadd">${ic('plus',13)} Formando</button></div>
    <div class="tblw"><table class="lst pz-t"><thead><tr><th>N.º</th><th>BI/CC</th><th>Nome</th><th></th></tr></thead><tbody>${p.form.map(f=>`<tr><td><input data-pzf="${f.id}|num" value="${esc(f.num||'')}" style="width:80px"></td><td><input data-pzf="${f.id}|bi" value="${esc(f.bi||'')}" placeholder="…000" style="width:80px"></td><td><input data-pzf="${f.id}|nome" value="${esc(f.nome)}" style="min-width:260px"></td><td><button class="btn sm ghost" data-pzfx="${f.id}" title="Retirar">${ic('trash',13)}</button></td></tr>`).join('')}</tbody></table></div>
    <p class="hint">Na pauta, o BI/CC aparece só com os últimos dígitos (ex.: …123).</p></section>`;
  const ano=Math.min(p.anos,Math.max(1,+UI.pzAno||p.anoAtual));UI.pzAno=ano;
  const anoT=`<div class="cpd-seg noprint" role="group">${Array.from({length:p.anos},(_,i)=>`<button type="button" data-pzano="${i+1}" class="${ano===i+1?'on':''}">${i+1}.º ano</button>`).join('')}</div>`;
  const D=p.disc;const usados=D.filter(d=>p.form.some(f=>p.notas[f.id+'|'+ano+'|'+d.id]!=null));const R=p.form.map(f=>pzAno(p,f,ano));
  const cel=(f,d)=>{const v=p.notas[f.id+'|'+ano+'|'+d.id];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|${d.id}" value="${v==null?'':esc(String(v).replace('.',','))}" inputmode="decimal"></td>`};
  const notas=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('grid',18)} Classificações</h2>${anoT}<span class="sp1"></span><label class="chk" style="margin:0"><input type="checkbox" id="pz-tod" ${UI.pzTod?'checked':''}> <span>Mostrar todas as disciplinas e UFCD</span></label><button class="btn sm noprint" id="pz-dadd">${ic('plus',13)} Disciplina / UFCD</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Disciplina / UFCD</th><th>Comp.</th>${p.form.map(f=>`<th class="n" title="${esc(f.nome)}">${esc(f.nome.split(' ')[0])}</th>`).join('')}</tr></thead><tbody>
    ${(UI.pzTod?D:usados).map(d=>`<tr><td>${esc(d.nome)}</td><td><select data-pzdc="${d.id}">${PZ_COMP.map(([k])=>`<option ${d.comp===k?'selected':''}>${k}</option>`).join('')}</select></td>${p.form.map(f=>cel(f,d)).join('')}</tr>`).join('')||`<tr><td colspan="${p.form.length+2}" class="mut">Sem classificações neste ano. Importe o histórico ou ligue «Mostrar todas».</td></tr>`}
    <tr class="pz-fp"><td><b>FPCT</b> <small class="mut">${ano===+p.anoAtual?'(vazio = nota da grelha abaixo)':''}</small></td><td>FP</td>${p.form.map(f=>{const v=p.notas[f.id+'|'+ano+'|FP'];return `<td class="n"><input class="pz-n" data-pzn="${f.id}|${ano}|FP" value="${v==null?'':esc(String(v).replace('.',','))}" placeholder="${ano===+p.anoAtual&&pzFpct(p,f).fin!=null?pzFpct(p,f).fin:''}"></td>`}).join('')}</tr>
    ${PZ_COMP.map(([k,l])=>`<tr class="pz-m"><td>Média ${l}</td><td>${k}</td>${R.map(r=>`<td class="n ${r[k]!=null&&r[k]<9.5?'neg':''}">${pzF(r[k],1)||'—'}</td>`).join('')}</tr>`).join('')}
    <tr class="pz-cfa"><td><b>CFA${ano}</b></td><td></td>${R.map(r=>`<td class="n"><b class="${r.CFA!=null&&r.CFA<9.5?'neg':''}">${pzF(r.CFA,1)||'—'}</b></td>`).join('')}</tr></tbody></table></div>
    <p class="hint">Cada componente é a média das classificações das suas disciplinas e UFCD desse ano (às décimas). Escreva «u)» ou «i)» para excluído / sem avaliação.</p></section>`;
  /* FPCT */
  const FC=p.fpct;const fp=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('building',18)} Grelha de Avaliação da FPCT — ${p.anoAtual}.º ano</h2><span class="sp1"></span>
      <label class="prl"><span>Relatório</span><input type="number" step="0.05" min="0" max="1" data-pzp="pRel" value="${FC.pRel}"></label><label class="prl"><span>Entidade</span><input type="number" step="0.05" min="0" max="1" data-pzp="pEnt" value="${FC.pEnt}"></label><button class="btn sm noprint" id="pz-crit">${ic('pencil',13)} Critérios do Relatório</button><button class="btn sm pri noprint" id="pz-ifp">${ic('upload',13)} Importar Grelha da FPCT (Excel)</button></div>
    <div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>Formando</th>${FC.crit.map(c=>`<th class="n" title="${esc(c[0])}">${esc(c[0].split(' ').slice(0,2).join(' '))}<br><small>${c[1]}</small></th>`).join('')}<th class="n">Relatório</th><th class="n">Aval. Entidade</th><th class="n">Nota</th><th class="n">Nota Final</th></tr></thead><tbody>
    ${p.form.map(f=>{const x=FC.v[f.id]||{};const r=pzFpct(p,f);return `<tr><td>${esc(f.nome)}</td>${FC.crit.map((c,i)=>`<td class="n"><input class="pz-n" data-pzq="${f.id}|c${i}" value="${x['c'+i]==null?'':esc(String(x['c'+i]))}"></td>`).join('')}<td class="n">${pzF(r.rel,2)||'—'}</td><td class="n"><input class="pz-n" data-pzq="${f.id}|ent" value="${x.ent==null?'':esc(String(x.ent).replace('.',','))}"></td><td class="n">${pzF(r.nota,2)||'—'}</td><td class="n"><b>${r.fin==null?'—':r.fin}</b></td></tr>`}).join('')}</tbody></table></div>
    <p class="hint">Relatório = soma dos critérios ÷ ${(FC.crit.reduce((s,c)=>s+(+c[1]||0),0)/20)||10} (0–20). Nota = Relatório × ${FC.pRel} + Entidade × ${FC.pEnt}; a nota final (arredondada) entra na FP do ${p.anoAtual}.º ano.</p>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-pzx="fdet">${ic('file',14)} Pauta FPCT Detalhada</button><button class="btn sm" data-pzx="ffin">${ic('file',14)} Pauta FPCT Final</button><button class="btn sm" data-pzx="grelha">${ic('printer',14)} Grelha da FPCT</button></div></section>`;
  /* CFC */
  const cf=`<section class="card"><h2 style="margin:0 0 8px">${ic('award',18)} Classificação Final de Curso</h2><div class="cpm-tw"><table class="lst pz-g"><thead><tr><th>N.º</th><th>Formando</th>${Array.from({length:p.anos},(_,i)=>`<th class="n">CFA${i+1}</th>`).join('')}<th class="n">CPAF</th><th class="n">CFC</th></tr></thead><tbody>
    ${p.form.map(f=>{const r=pzCFC(p,f);return `<tr><td>${esc(f.num||'')}</td><td>${esc(f.nome)}</td>${r.cfa.map(v=>`<td class="n ${v!=null&&v<9.5?'neg':''}">${pzF(v,1)||'—'}</td>`).join('')}<td class="n"><input class="pz-n" data-pzcp="${f.id}" value="${p.cpaf[f.id]==null?'':esc(String(p.cpaf[f.id]).replace('.',','))}"></td><td class="n"><b class="${r.cfc!=null&&r.cfc<10?'neg':''}">${r.cfc==null?'—':r.cfc}</b></td></tr>`}).join('')}</tbody></table></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn sm" data-pzx="cdet">${ic('file',14)} Pauta CFC Detalhada</button><button class="btn sm" data-pzx="cfin">${ic('file',14)} Pauta CFC Final</button><button class="btn sm" data-pzx="med">${ic('download',14)} Médias Detalhadas (CSV)</button>
      <label class="chk" style="margin:0 0 0 8px"><input type="checkbox" id="pz-word" ${UI.pzWord!==false?'checked':''}> <span>Em Word (desligado: imprimir / PDF)</span></label></div></section>`;
  return sel+cab+fo+notas+fp+cf}
function pzBind(v,a){const P=PZS();const p=P[UI.pzId];const re=()=>manterPosicao(vCProfij);
  v.querySelectorAll('[data-pzid]').forEach(b=>b.onclick=()=>{UI.pzId=b.dataset.pzid;vCProfij()});
  [v.querySelector('#pz-imp'),v.querySelector('#pz-imp2'),v.querySelector('#pz-imp3')].forEach(b=>b&&(b.onclick=()=>pzImportar(b.id==='pz-imp3'?UI.pzId:null)));
  const if0=v.querySelector('#pz-ifp0');if(if0)if0.onclick=()=>pzImportarFpct(null);
  const nv=v.querySelector('#pz-novo');if(nv)nv.onclick=()=>{const n=(prompt('Nome do curso/turma (ex.: ASC 3):')||'').trim();if(!n)return;const x=pzNovo(n);UI.pzId=x.id;save();vCProfij()};
  if(!p)return;
  v.querySelectorAll('[data-pzc]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzc;let x=i.value;if(k==='anos'||k==='anoAtual')x=Math.min(3,Math.max(1,+x||1));p[k]=x;if(k==='tipo'){p._tipoMan=true;const A_={'II-2':2,'II-3':1,'IV-4':3}[x];p.anos=A_;p.anoAtual=Math.min(p.anoAtual,A_)}save();re()});
  v.querySelectorAll('[data-pzw]').forEach(i=>i.onchange=()=>{p.pesos[i.dataset.pzw]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  v.querySelectorAll('[data-pzp]').forEach(i=>i.onchange=()=>{p.fpct[i.dataset.pzp]=Math.max(0,+i.value.replace(',','.')||0);save();re()});
  const dl=v.querySelector('#pz-del');if(dl)dl.onclick=()=>{if(!confirm('Apagar «'+p.nome+'» e todas as classificações importadas?'))return;delete P[p.id];UI.pzId='';save();vCProfij()};
  v.querySelectorAll('[data-pzf]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzf.split('|');const f=p.form.find(x=>x.id===id);if(f){f[k]=i.value.trim();save()}});
  v.querySelectorAll('[data-pzfx]').forEach(b=>b.onclick=()=>{if(!confirm('Retirar este formando?'))return;p.form=p.form.filter(x=>x.id!==b.dataset.pzfx);save();re()});
  const fa=v.querySelector('#pz-fadd');if(fa)fa.onclick=()=>{const n=(prompt('Nome do formando:')||'').trim();if(!n)return;const al=pzProcurarAluno(n);p.form.push({id:uid(),nome:n,num:al&&(al.processo||al.num)||'',bi:''});save();re()};
  const da=v.querySelector('#pz-dadd');if(da)da.onclick=()=>{const n=(prompt('Disciplina ou UFCD (ex.: 1234 - Nome da UFCD):')||'').trim();if(!n)return;p.disc.push({id:uid(),nome:n,comp:pzCompDe(n)});pzOrdenar(p);UI.pzTod=true;save();re()};
  const td=v.querySelector('#pz-tod');if(td)td.onchange=()=>{UI.pzTod=td.checked;re()};
  v.querySelectorAll('[data-pzano]').forEach(b=>b.onclick=()=>{UI.pzAno=+b.dataset.pzano;re()});
  v.querySelectorAll('[data-pzdc]').forEach(s=>s.onchange=()=>{const d=p.disc.find(x=>x.id===s.dataset.pzdc);if(d){d.comp=s.value;save();re()}});
  const val=x=>{x=String(x).trim();if(x==='')return null;if(/^\d+([.,]\d+)?$/.test(x))return +x.replace(',','.');return x};
  v.querySelectorAll('[data-pzn]').forEach(i=>i.onchange=()=>{const k=i.dataset.pzn;const x=val(i.value);if(x==null)delete p.notas[k];else p.notas[k]=x;save();re()});
  v.querySelectorAll('[data-pzq]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.pzq.split('|');const o=p.fpct.v[id]=p.fpct.v[id]||{};const x=val(i.value);if(x==null)delete o[k];else o[k]=x;pzFpctParaCoord(p);save();re()});
  v.querySelectorAll('[data-pzcp]').forEach(i=>i.onchange=()=>{const x=val(i.value);if(x==null)delete p.cpaf[i.dataset.pzcp];else p.cpaf[i.dataset.pzcp]=x;save();re()});
  const cr=v.querySelector('#pz-crit');if(cr)cr.onclick=()=>{const t=prompt('Critérios do relatório, um por linha: nome ; máximo\n(ex.: Análise Crítica ; 60)',p.fpct.crit.map(c=>c[0]+' ; '+c[1]).join(' | '));if(t==null)return;const L=t.split(/\||\n/).map(x=>x.split(';').map(y=>y.trim())).filter(x=>x[0]).map(x=>[x[0],+x[1]||20]);if(L.length){p.fpct.crit=L;save();re()}};
  const ifp=v.querySelector('#pz-ifp');if(ifp)ifp.onclick=()=>pzImportarFpct(p.id);
  const wd=v.querySelector('#pz-word');if(wd)wd.onchange=()=>{UI.pzWord=wd.checked};
  v.querySelectorAll('[data-pzx]').forEach(b=>b.onclick=()=>pzExportar(p,b.dataset.pzx))}
