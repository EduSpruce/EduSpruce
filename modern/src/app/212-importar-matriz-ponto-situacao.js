/* ===================== v0.999 · Importar a matriz / ponto de situação em PDF (horas, professores e UFCD automáticos) =====================
   Lê o PDF «Curso PROFIJ … Matriz Curricular / Componente de Formação Tecnológica Detalhada»: dados do curso, disciplinas
   (horas, aulas, dadas, professor), UFCD (código, nome, horas, dadas, professor), FPCT e cria um ponto de situação.
   O referencial (UFCD sem professores) fica guardado para criar outras turmas do mesmo curso. */
const PFJ_REF0={'341026':{curso:'Operador/a de Logística',area:'341 - Comércio',tipo:'II-2',anos:{1:[['0349','Ambiente, segurança, higiene e saúde no trabalho – conceitos básicos',25],['0403','Relacionamento interpessoal',25],['0404','Organização pessoal e gestão do tempo',25],['0778','Folha de cálculo',50],['1122','Noções e normas de qualidade',25],['8142','Cadeia de Abastecimento – Introdução',25],['8143','Proteção ambiental – introdução',25],['8144','Receção no armazém',50],['8145','Armazenagem de mercadorias',50],['8146','Preparação de encomendas - fundamentos',50],['8147','Processos de preparação de encomendas',50],['8517','Armazém- processos e atividades',25],['8518','Layout do armazém',50]]}}};
const pfjRefs=()=>{const {c}=CP();c.refs=c.refs||{};const R={};Object.entries(PFJ_REF0).forEach(([k,v])=>R[k]=JSON.parse(JSON.stringify(v)));Object.entries(c.refs).forEach(([k,v])=>{R[k]=R[k]||{curso:v.curso,area:v.area,tipo:v.tipo,anos:{}};Object.assign(R[k].anos,v.anos||{})});return R};
async function cpmLinhasPdf(file){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const L=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({x:i.transform[4],y:i.transform[5],s:i.str})).sort((a,b)=>b.y-a.y);const rows=[];
    it.forEach(i=>{const r=rows.find(r=>Math.abs(r.y-i.y)<=2.2);if(r)r.it.push(i);else rows.push({y:i.y,it:[i]})});
    rows.sort((a,b)=>b.y-a.y).forEach(r=>L.push(r.it.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim()))}return L}
function cpmLerMatrizTxt(L){const T=L.join('\n');const g=re=>{const m=T.match(re);return m?m[1].trim():''};
  const r={curso:g(/Curso\s+PROFIJ\s+[IV]+\s*[-–]\s*(.+)/i),area:g(/[ÁA]rea de Educa[cç][aã]o e Forma[cç][aã]o:\s*(.+)/i),nivel:g(/QNQ:\s*([IV]+)/i),tipo:g(/QNQ:\s*[IV]+\s*-\s*Tipo\s*(\d)/i),cod:g(/C[oó]d\.?\s*Interno:\s*(.+?)\s+Ano:/i),ano:g(/Ano:\s*(\d)\.?\s*º/i),ref:g(/Referencial de Forma[cç][aã]o:\s*(\d+)/i),disc:[],ufcd:[],fct:'',data:''};
  const dm=T.match(/Ponto de Situa[cç][aã]o\s*[-–]\s*(\d{2})\.(\d{2})\.(\d{4})/i);const dc=T.match(/\b\d\.º\s+(\d{2})\/(\d{2})\/(\d{2})\b/);
  r.data=dc?'20'+dc[3]+'-'+dc[2]+'-'+dc[1]:dm?dm[3]+'-'+dm[2]+'-'+dm[1]:'';
  let comp='';L.forEach(l=>{if(/Componente de Forma[cç][aã]o Sociocultural/i.test(l))comp='sociocultural';else if(/Componente de Forma[cç][aã]o Cient[ií]fica/i.test(l))comp='cientifica';else if(/Componente de Forma[cç][aã]o Tecnol[oó]gica/i.test(l))comp='tecnologica';else if(/Pr[aá]tica em Contexto/i.test(l))comp='pratica';
    let m=l.match(/^(\d{4})\s*[-–]\s*(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)(?:\s+(.+))?$/);if(m){if(!r.ufcd.some(u=>u.cod===m[1]))r.ufcd.push({cod:m[1],nome:m[2].trim(),horas:+m[3],dadas:+m[5],prof:(m[7]||'').trim()});return}
    m=l.match(/^CPFCT\s+(\d+)/i);if(m){r.fct=m[1];return}
    if(comp==='sociocultural'||comp==='cientifica'){m=l.match(/^([A-Za-zÀ-ÿ].+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)(?:\s+(.+))?$/);if(m&&!/^total/i.test(m[1])){let n=m[1].trim();if(/^l[ií]ngua estrangeira\s*[-–]\s*ingl/i.test(n))n='Língua Estrangeira I - Inglês';r.disc.push({nome:n,comp,horas:+m[2],dadas:+m[4],prof:(m[6]||'').trim()})}}});
  return r}
function cpmImportarMatrizPdf(nome){const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,application/pdf';inp.onchange=async()=>{const f=inp.files[0];if(!f)return;
  try{toast('A ler a matriz…');const r=cpmLerMatrizTxt(await cpmLinhasPdf(f));if(!r.disc.length&&!r.ufcd.length)return toast('Não encontrei a matriz curricular neste PDF.','aviso');
    cpmMatrizPrev(nome,r,f.name)}
  catch(e){console.warn(e);toast('Não foi possível ler o PDF: '+e.message,'erro')}};inp.click()}
function cpmMatrizPrev(nome,r,fn){const M=cpmM(nome);const nn=n=>normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' ');
  const fora=M.disc.filter(d=>!r.disc.some(x=>nn(x.nome)===nn(d.nome))&&!r.ufcd.some(u=>u.cod===d.det||normT(u.nome)===normT(d.nome)));
  const L=[...r.disc.map(x=>({...x,k:x.comp==='sociocultural'?'Sociocultural':'Científica'})),...r.ufcd.map(u=>({...u,nome:u.cod+' - '+u.nome,k:'UFCD'}))];
  openDrawer('Importar Matriz · '+nome,`<div class="ed"><p style="margin-top:0"><b>${esc(r.curso||fn)}</b>${r.ref?' · referencial '+esc(r.ref):''}${r.ano?' · '+r.ano+'.º ano':''}${r.area?' · '+esc(r.area):''}${r.nivel?' · nível '+esc(r.nivel)+(r.tipo?' tipo '+r.tipo:''):''}</p>
    <div class="cpm-tw"><table class="lst"><thead><tr><th></th><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Tempos</th><th class="n">Dadas</th><th>Professor(a)</th></tr></thead><tbody>${L.map((x,i)=>`<tr><td><small class="mut">${x.k}</small></td><td>${esc(x.nome)}</td><td class="n">${x.horas}</td><td class="n">${cpmAulas(x.horas)}</td><td class="n">${x.dadas}</td><td>${esc(x.prof||'—')}</td></tr>`).join('')}
      <tr><td><small class="mut">FPCT</small></td><td>CPFCT</td><td class="n">${esc(r.fct||'—')}</td><td></td><td></td><td></td></tr></tbody></table></div>
    <p class="hint">${L.length} linhas · ${L.reduce((s,x)=>s+x.horas,0)} h${r.data?' · as «dadas» entram como ponto de situação de '+fmtIsoL(r.data):''}.</p>
    ${fora.length?`<label class="chk"><input type="checkbox" id="mi-sub" checked> <span>Retirar da matriz o que não está no PDF: ${fora.map(d=>esc(d.nome)).join(', ')}</span></label>`:''}
    <label class="chk"><input type="checkbox" id="mi-pt" ${r.data?'checked':''} ${r.data?'':'disabled'}> <span>Criar o ponto de situação com as aulas dadas</span></label>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="mi-x">Cancelar</button><button class="btn pri" id="mi-ok">${ic('check',14)} Importar</button></div></div>`);
  $('#mi-x').onclick=closeDrawer;$('#mi-ok').onclick=()=>{const sub=$('#mi-sub')&&$('#mi-sub').checked,pt=$('#mi-pt').checked;closeDrawer();cpmMatrizAplicar(nome,r,fn,{sub,pt,fora})}}
function cpmMatrizAplicar(nome,r,fn,o){const M=cpmM(nome);const f={name:fn};{
    const igual=n=>M.disc.find(d=>normT(d.nome).replace(/\bi\b/g,'').replace(/\s+/g,' ')===normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' '));const dadas={};
    r.disc.forEach(x=>{let d=igual(x.nome);if(!d){d={id:uid(),sig:[],aj:0,dadas:null,det:''};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:x.comp,horas:x.horas});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    r.ufcd.forEach(x=>{let d=M.disc.find(z=>z.comp==='tecnologica'&&(z.det===x.cod||normT(z.nome)===normT(x.nome)));if(!d){d={id:uid(),sig:[],aj:0,dadas:null};M.disc.push(d)}Object.assign(d,{nome:x.nome,comp:'tecnologica',horas:x.horas,det:x.cod});if(x.prof)d.prof=x.prof;dadas[d.id]=x.dadas});
    /* a linha genérica «UFCD» do horário passa a ser as UFCD detalhadas */
    if(r.ufcd.length){const gen=M.disc.filter(d=>d.comp==='tecnologica'&&!d.det&&/^ufcd/i.test(d.nome));const sg=[...new Set(gen.flatMap(d=>d.sig||[]))];M.disc=M.disc.filter(d=>!gen.includes(d));M.disc.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=sg.slice())}
    pfjLigarSiglas(A(),nome,M.disc);
    Object.assign(M,{curso:r.curso||M.curso,area:r.area||M.area,nivel:r.nivel||M.nivel,cod:r.cod||M.cod,ref:r.ref||M.ref,anoCurso:r.ano?r.ano+'.º':M.anoCurso,tipoPfj:r.nivel==='IV'?'IV-4':r.tipo==='3'?'II-3':'II-2'});if(r.fct)M.fct.horas=r.fct;
    if(o.sub&&o.fora&&o.fora.length){const keep=new Set(o.fora.map(d=>d.id));const gsig=[...new Set(o.fora.filter(d=>d.comp==='tecnologica').flatMap(d=>d.sig||[]))];M.disc=M.disc.filter(d=>!keep.has(d.id));if(gsig.length)M.disc.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=gsig.slice())}
    if(o.pt&&r.data&&Object.keys(dadas).length){M.pontos=M.pontos||[];M.pontos=M.pontos.filter(p=>p.data!==r.data);M.pontos.push({id:uid(),data:r.data,dadas,obs:'Importado de '+f.name})}
    if(r.ref&&r.ufcd.length){const {c}=CP();c.refs=c.refs||{};const R=c.refs[r.ref]=c.refs[r.ref]||{curso:r.curso,area:r.area,tipo:M.tipoPfj,anos:{}};R.anos[r.ano||'1']=r.ufcd.map(u=>[u.cod,u.nome,u.horas])}
    const ord={sociocultural:0,cientifica:1,tecnologica:2};M.disc.sort((x,y)=>(ord[x.comp]-ord[y.comp])||(x.comp==='tecnologica'?0:0));
    save();vCProfij();toast(`Matriz importada: ${r.disc.length} disciplinas, ${r.ufcd.length} UFCD${o.pt&&r.data?', ponto de situação de '+fmtIsoL(r.data):''}.`)}}
/* siglas do horário da turma pelas legendas (usado na criação do curso e na importação da matriz) */
function pfjLigarSiglas(a,nome,lista){const h=horarioDe(a,nome);if(!h)return;const leg=h.legenda||[];const sigs=[...new Set(h.aulas.map(x=>x.ab))];const nn=n=>normT(n).replace(/\bi\b/g,'').replace(/\s+/g,' ');
  sigs.forEach(sg=>{const l=leg.find(x=>normSig(x.ab)===normSig(sg))||{};const nm=l.nome&&normSig(l.nome)!==normSig(sg)?l.nome:cpmNomeSig(sg);
    if(/^ufcd|unidades de forma|tecnolog/i.test(normT(nm))||/^ufcd/i.test(sg)){lista.filter(d=>d.comp==='tecnologica'&&!(d.sig||[]).length).forEach(d=>d.sig=[sg]);return}
    const d=lista.find(z=>z.comp!=='tecnologica'&&nn(z.nome)===nn(nm));if(d&&!(d.sig||[]).some(x=>normSig(x)===normSig(sg)))d.sig=[...(d.sig||[]),sg]})}
/* separador aberto sempre visível na faixa deslizante (telemóvel) */
{let _cpq=0;new MutationObserver(()=>{if(_cpq)return;_cpq=requestAnimationFrame(()=>{_cpq=0;const b=document.querySelector('#view .cptabs>button.on');const t=b&&b.parentElement;if(t&&t.scrollWidth>t.clientWidth+4&&!t.dataset.cen){t.dataset.cen=1;t.scrollLeft=Math.max(0,b.offsetLeft-t.clientWidth/2+b.offsetWidth/2)}})}).observe(document.getElementById('view')||document.body,{childList:true})}

