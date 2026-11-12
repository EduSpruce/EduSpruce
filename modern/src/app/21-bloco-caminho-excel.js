/* =====================================================================
   IMPORTAÇÃO DE ALUNOS — Excel exportado do programa da escola
   (Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel)
   ===================================================================== */
const CAMINHO_EXCEL='Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel';
function dicaExcel(){return `<span class="dica" tabindex="0" role="button" aria-label="Onde obter o Excel">${ic('info',16)}<span class="dica-t"><b>Onde obter o Excel com as fotos</b><br>${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span></span>`}
function pickPdf(cb){const f=$('#pdfIn');f.value='';f.onchange=()=>{if(f.files[0])lerFicheiro(f.files[0]).then(cb)};f.click()}
function dropZone(el,cb){
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over')});
  el.addEventListener('dragleave',()=>el.classList.remove('over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');const f=e.dataTransfer.files[0];if(f)lerFicheiro(f).then(cb)});
}
const RE_DATA=/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b/;
const RE_NOME=/^[\p{L}][\p{L}'’.\-]*(\s+[\p{L}][\p{L}'’.\-]*)+$/u;
const PALAVRAS_CAB=/^(n\.?º|nº|número|numero|nome|aluno|alunos|processo|sexo|género|genero|data|turma|ano|escola|idade|ee|encarregado|lista|página|pagina)\b/i;
const RE_SEXO=/^(M|F|Masc\.?|Fem\.?|Masculino|Feminino|Sim|Não|Nao)$/i;
function detTurma(s){
  const tm=s.match(/turma[ \t]*[:\-]?[ \t]*(\d{1,2})[ \t]*\.?[ \t]*[º°o]?[ \t]*(?:ano[ \t]*)?[ \t\-]*([A-Z]{1,2}\d?)\b/i)||s.match(/\b(\d{1,2})[ \t]*\.?[ \t]*[º°][ \t]*(?:ano[ \t]*)?[ \t\-–]*(?:turma[ \t]*)?([A-Z])\b/i);
  return tm?tm[1]+'.º '+tm[2].toUpperCase():'';
}
const limpaNome=s=>{const n=s.replace(/\s+/g,' ').trim();return n===n.toUpperCase()?titleCase(n):n};
/* ---------- método TABELA ---------- */
function parseLinhas(linhas){
  linhas=linhas.map(l=>Array.isArray(l)?{cells:l}:l);
  const txt=linhas.map(l=>l.cells.join(' ')).join('\n');
  const turma=detTurma(txt);
  const ano=(txt.match(/(\d{4})\s*\/\s*(\d{4})/)||[]).slice(1,3).join('/');
  const alunos=[];const vistos=new Set();
  linhas.forEach(l=>{
    const full=l.cells.join(' ').replace(/\s+/g,' ').trim();if(!full||PALAVRAS_CAB.test(full))return;
    let processo='',genero='',nasc='';
    const m=full.match(/^(\d{1,2})\s*[.)\-]?\s+(.*)$/);if(!m)return;
    const num=+m[1];if(num<1||num>60)return;let rest=m[2];
    const pm=rest.match(/^\(?(\d{3,})\)?\s+(.*)$/);if(pm){processo=pm[1];rest=pm[2]}
    const dm=rest.match(RE_DATA);if(dm)nasc=dm[4]?`${dm[4]}-${dm[5]}-${dm[6]}`:`${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
    const nt=[];for(const w of rest.split(/\s+/)){if(/^\p{L}[\p{L}'’.\-]*$/u.test(w)&&!RE_SEXO.test(w))nt.push(w);else break}
    if(!processo){const p2=rest.match(/\s\(?(\d{4,})\)?(\s|$)/);if(p2)processo=p2[1]}
    const g=rest.match(/(?:^|\s)(M|F|Masculino|Feminino|Masc\.?|Fem\.?)(?=\s|$)/i);if(g)genero=/^f/i.test(g[1])?'F':'M';
    let nome=nt.join(' ');if(nt.length<2||!RE_NOME.test(nome))return;nome=limpaNome(nome);
    const k=num+'|'+nome;if(vistos.has(k))return;vistos.add(k);
    alunos.push({num,processo,nome,genero:genero||guessGen(nome),generoManual:!!genero,nasc,frequenta:true,turma,p:l.p,bx:l.y!=null?{x1:l.x1,x2:l.x2,y1:l.y-l.h*.3,y2:l.y+l.h}:null});
  });
  return {alunos,turma,ano};
}
function cortaFoto(src,x,y,w,h){const Q={alta:[320,.9],media:[240,.85],baixa:[160,.78]}[(S.cfg&&S.cfg.fotoQ)||'media'];const W=Math.round(Math.min(Q[0],Math.max(120,w))),H=Math.round(W*h/w);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(src,x,y,w,h,0,0,W,H);return c.toDataURL('image/jpeg',Q[1])}
function fotoDeFicheiro(file){return new Promise((ok,ko)=>{const img=new Image();img.onload=()=>{const s=Math.min(img.width,img.height*0.8);const w=s,h=s*1.25>img.height?img.height:s*1.25;ok(cortaFoto(img,(img.width-w)/2,(img.height-h)/2,w,h));URL.revokeObjectURL(img.src)};img.onerror=()=>ko(new Error('Imagem inválida'));img.src=URL.createObjectURL(file)})}
/* =====================================================================
   IMPORTAÇÃO DE EXCEL (.xlsx) — ex.: ClassPhotos exportado do programa da escola
   Leitor nativo (sem bibliotecas): zip + XML. Fotos ancoradas às células.
   ===================================================================== */
async function unzip(buf){
  const dv=new DataView(buf),td=new TextDecoder();
  let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;
  if(e<0)throw new Error('O ficheiro não é um Excel (.xlsx) válido.');
  const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const F={};
  for(let i=0;i<n;i++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lho=dv.getUint32(p+42,true);
    F[td.decode(new Uint8Array(buf,p+46,nl))]={method,csize,lho};p+=46+nl+xl+cl;
  }
  const bytes=async name=>{
    name=name.replace(/^\//,'');const f=F[name];if(!f)return null;
    const ln=dv.getUint16(f.lho+26,true),lx=dv.getUint16(f.lho+28,true);
    const data=new Uint8Array(buf,f.lho+30+ln+lx,f.csize);
    if(f.method===0)return data.slice();
    if(typeof DecompressionStream==='undefined')throw new Error('Este browser é antigo demais para ler Excel. Atualize-o.');
    return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  };
  return {has:n=>!!F[n.replace(/^\//,'')],bytes,text:async n=>{const b=await bytes(n);return b?td.decode(b):null}};
}
const xmlDoc=s=>new DOMParser().parseFromString(s,'application/xml');
const tagsNS=(el,name)=>Array.from(el.getElementsByTagNameNS('*',name));
function resolvePath(base,target){
  if(target.startsWith('/'))return target.slice(1);
  const parts=base.split('/');parts.pop();
  target.split('/').forEach(s=>{if(s==='..')parts.pop();else if(s&&s!=='.')parts.push(s)});
  return parts.join('/');
}
async function relsDe(z,partPath){
  const dir=partPath.split('/');const file=dir.pop();const rp=(dir.length?dir.join('/')+'/':'')+'_rels/'+file+'.rels';
  const t=await z.text(rp);const m={};if(!t)return m;
  tagsNS(xmlDoc(t),'Relationship').forEach(r=>m[r.getAttribute('Id')]={target:resolvePath(partPath,r.getAttribute('Target')),type:r.getAttribute('Type')||''});
  return m;
}
const colNum=s=>{let n=0;for(const ch of s)n=n*26+(ch.charCodeAt(0)-64);return n-1};
function bytesParaImagem(bytes,ext){
  const tipo={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',bmp:'image/bmp',webp:'image/webp'}[ext]||'image/jpeg';
  return new Promise((ok,ko)=>{const img=new Image();const u=URL.createObjectURL(new Blob([bytes],{type:tipo}));img.onload=()=>{ok(img);setTimeout(()=>URL.revokeObjectURL(u),1000)};img.onerror=()=>ko(new Error('imagem'));img.src=u});
}
async function lerXlsx(file){
  const z=await unzip(await file.arrayBuffer());
  const wbPath='xl/workbook.xml';const wb=xmlDoc(await z.text(wbPath)||'<x/>');const wbRels=await relsDe(z,wbPath);
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');
  if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  const folhas=[];
  for(const sh of tagsNS(wb,'sheet')){
    const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');
    const rel=wbRels[rid];if(!rel)continue;const path=rel.target;const sx=await z.text(path);if(!sx)continue;
    const doc=xmlDoc(sx);const cells=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');if(!ref)return;const m=ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;
      const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');
      else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}
      if(v!==''&&v!=null)cells.set((+m[2]-1)+','+colNum(m[1]),{r:+m[2]-1,c:colNum(m[1]),v:String(v)})});
    // imagens ancoradas
    const imgs=[];const shRels=await relsDe(z,path);
    for(const r of Object.values(shRels).filter(r=>/drawing$/.test(r.type))){
      const dx=await z.text(r.target);if(!dx)continue;const dd=xmlDoc(dx);const dRels=await relsDe(z,r.target);
      ['twoCellAnchor','oneCellAnchor'].forEach(tag=>tagsNS(dd,tag).forEach(an=>{
        const fr=tagsNS(an,'from')[0];if(!fr)return;const to=tagsNS(an,'to')[0]||fr;
        const g=(el,n)=>+((tagsNS(el,n)[0]||{}).textContent||0);
        const blip=tagsNS(an,'blip')[0];if(!blip)return;
        const emb=blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed')||blip.getAttribute('r:embed');
        const ir=dRels[emb];if(!ir)return;
        imgs.push({r1:g(fr,'row'),c1:g(fr,'col'),r2:g(to,'row'),c2:g(to,'col'),path:ir.target});
      }));
    }
    folhas.push({nome:sh.getAttribute('name'),cells,imgs});
  }
  // ---- interpretar ----
  const porFolha=[];let ano='';const turmasVistas=[];let melhorLinhas=null;
  for(const f of folhas){
    const all=[...f.cells.values()];
    let anoF='';all.forEach(x=>{const m=x.v.match(/(\d{4})\s*\/\s*(\d{4})/);if(m&&!anoF)anoF=m[1]+'/'+m[2]});if(!ano)ano=anoF;
    const heads=all.map(x=>({r:x.r,t:detTurma(x.v)})).filter(h=>h.t);
    const get=(r,c)=>{const x=f.cells.get(r+','+c);return x?x.v:''};
    const usados=new Set();const doFolha=[];
    all.sort((a,b)=>a.r-b.r||a.c-b.c).forEach(x=>{
      const v=x.v.trim();let num=null,proc='',r0=x.r;
      let m=v.match(/^(\d{1,2})\s*[\r\n]*\s*[-–.]?\s*\(\s*(\d{3,7})\s*\)$/)||v.match(/^(\d{1,2})\s*[-–]\s*(\d{3,7})$/)||v.match(/^(\d{1,2})[\r\n]+\s*(\d{3,7})$/);
      if(m){num=+m[1];proc=m[2]}
      else if(/^\d{1,2}$/.test(v)){const b=get(x.r+1,x.c).trim();const mp=b.match(/^\(?\s*(\d{3,7})\s*\)?$/);if(mp){num=+v;proc=mp[1];r0=x.r+1}}
      if(num==null||num<1||num>60)return;
      // nome: mesma coluna (ou vizinha), nas linhas seguintes
      let nome='',rn=-1;
      for(let dr=1;dr<=5&&!nome;dr++)for(const dc of [0,1,-1]){const t=get(r0+dr,x.c+dc).replace(/\s+/g,' ').trim();
        if(t&&!/^\d/.test(t)&&RE_NOME.test(t)&&!PALAVRAS_CAB.test(t)&&!detTurma(t)){nome=t;rn=r0+dr;break}}
      if(!nome){const t=get(x.r,x.c+1).replace(/\s+/g,' ').trim();if(RE_NOME.test(t)){nome=t;rn=x.r}}  // formato tabela: nome ao lado
      if(!nome)return;
      const h=heads.filter(h=>h.r<=x.r).sort((a,b)=>b.r-a.r)[0];
      const n=limpaNome(nome);
      doFolha.push({num,processo:proc,nome:n,genero:guessGen(n),nasc:'',frequenta:true,turma:h?h.t:'',_r:x.r,_rn:rn,_c:x.c});
    });
    // fotos: a imagem ancorada entre o número e o nome, na mesma coluna
    const livres=f.imgs.slice();
    doFolha.forEach(a=>{
      let best=-1,bd=1e9;
      livres.forEach((im,k)=>{if(!im)return;
        const dentroCol=a._c>=im.c1-1&&a._c<=im.c2+1;if(!dentroCol)return;
        const dRow=im.r1>=a._r&&im.r1<=Math.max(a._rn,a._r+1)?0:Math.min(Math.abs(im.r1-a._r),Math.abs(im.r2-a._r))+2;
        const d=dRow*10+Math.abs(im.c1-a._c);if(d<bd&&dRow<4){bd=d;best=k}});
      if(best>=0){a._img=livres[best].path;livres[best]=null}
    });
    if(doFolha.length){doFolha.ano=anoF;porFolha.push(doFolha)}
    
    if(!doFolha.length){ // folha em formato de tabela simples
      const rows={};all.forEach(x=>{(rows[x.r]=rows[x.r]||[]).push(x)});
      const linhas=Object.keys(rows).sort((a,b)=>a-b).map(r=>({cells:rows[r].sort((a,b)=>a.c-b.c).map(x=>x.v.replace(/\s+/g,' ').trim())}));
      const pr=parseLinhas(linhas);if(pr.alunos.length>(melhorLinhas?melhorLinhas.alunos.length:0))melhorLinhas=pr;
    }
  }
  // em livros com várias folhas: ficam as folhas com fotos (se houver) e com pelo menos 3 alunos
  let fs=porFolha.filter(L=>L.length>=3);if(!fs.length)fs=porFolha;
  if(fs.some(L=>L.some(a=>a._img)))fs=fs.filter(L=>L.some(a=>a._img));
  if(fs[0]&&fs[0].ano)ano=fs[0].ano;
  const alunos=fs.flat();
  let lista=alunos;
  if(!lista.length&&melhorLinhas){lista=melhorLinhas.alunos;lista.forEach(a=>{delete a.p;delete a.bx});if(melhorLinhas.turma)turmasVistas.push(melhorLinhas.turma)}
  alunos.forEach(a=>{if(a.turma&&!turmasVistas.includes(a.turma))turmasVistas.push(a.turma)});
  // converter fotos
  const cache={};let nImgs=0;
  for(const a of lista){
    if(a._img){
      try{if(!(a._img in cache)){const ext=(a._img.split('.').pop()||'').toLowerCase();const img=await bytesParaImagem(await z.bytes(a._img),ext);cache[a._img]=cortaFoto(img,0,0,img.naturalWidth,img.naturalHeight)}
        a.foto=cache[a._img];nImgs++}catch(e){}
    }
    delete a._img;delete a._r;delete a._rn;delete a._c;
  }
  return {alunos:lista,turmas:turmasVistas,turma:turmasVistas[0]||'',ano,ficheiro:file.name,metodo:'excel',
    nImgs:folhas.reduce((s,f)=>s+f.imgs.length,0),nFotos:nImgs,linhas:folhas.flatMap(f=>[...f.cells.values()].sort((a,b)=>a.r-b.r||a.c-b.c).map(x=>[x.v.replace(/\s+/g,' ')]))};
}
/* escolhe o leitor conforme o tipo de ficheiro */
async function lerFicheiro(file){
  if(/\.xls$/i.test(file.name)){alert('Formato Excel antigo (.xls). Abra-o no Excel e guarde como “Livro do Excel (.xlsx)”.');return {alunos:[],falhou:true,linhas:[]}}
  if(/\.(xlsx|xlsm)$/i.test(file.name)){
    toast('A ler '+file.name+'…');
    try{const r=await lerXlsx(file);
      if(!r.alunos.length){r.falhou=true;toast('Não encontrei alunos no Excel')}
      else toast(r.alunos.length+' alunos'+(r.nFotos?' e '+r.nFotos+' fotos':'')+' encontrados');
      return r}
    catch(e){alert('Não foi possível ler o Excel.\n\n'+e.message);return {alunos:[],falhou:true,linhas:[]}}
  }
  alert('Use o ficheiro Excel (.xlsx) exportado do programa da escola:\n'+CAMINHO_EXCEL);return {alunos:[],falhou:true,linhas:[]};
}

/* =====================================================================
   CALENDÁRIO ESCOLAR — importação do PDF (Excel da escola exportado para PDF)
   A informação está nas CORES das células: a página é desenhada, as cores
   da legenda são lidas e cada dia é classificado pela cor da sua célula.
   A data de cada célula é calculada pela coluna (dia da semana), não pelo
   número escrito (que pode ter gralhas).
   ===================================================================== */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let pdfLib=null;
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o leitor de PDF (é preciso internet da primeira vez).'));document.head.appendChild(s)})}
async function gunzipB64(id){const el=document.getElementById(id);if(!el||typeof DecompressionStream==='undefined')return null;const bin=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));return await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
/* pdf.js 3.11.174 incluído no ficheiro (funciona sem internet); a internet só é usada se o browser não suportar a descompressão */
async function getPdfLib(){
  if(pdfLib)return pdfLib;
  if(!window.pdfjsLib){let code=null;try{code=await gunzipB64('pdfgz-lib')}catch(_){}
    if(code)await loadScript(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));else await loadScript(PDFJS+'pdf.min.js')}
  const lib=window.pdfjsLib;let wk=null;try{wk=await gunzipB64('pdfgz-wk')}catch(_){}
  if(wk)lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([wk],{type:'text/javascript'}));
  else{try{const w=await fetch(PDFJS+'pdf.worker.min.js').then(r=>r.text());lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([w],{type:'text/javascript'}))}catch(e){lib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'}}
  return pdfLib=lib;
}
const TIPOS_DIA={
  letivo:{n:'Dia Letivo',cor:'#a8dcf0',ink:'#0b3a52'},
  inicio:{n:'Início do Ano Letivo',cor:'#8b4a12',ink:'#fff'},
  inicio2:{n:'Início 3.º Ciclo e Secundário',cor:'#22a447',ink:'#fff'},
  termo:{n:'Termo das Aulas',cor:'#ffe14d',ink:'#4a3b00'},
  interrupcao:{n:'Interrupção Letiva',cor:'#2a3fd6',ink:'#fff'},
  feriadoN:{n:'Feriado Nacional',cor:'#f59bcd',ink:'#5a0e36'},
  feriadoR:{n:'Feriado Regional',cor:'#e5251f',ink:'#fff'},
  feriadoM:{n:'Feriado Municipal',cor:'#7c2d12',ink:'#fff'},
  nao:{n:'Sem Atividades Letivas',cor:'',ink:''}
};
const LETIVOS=['letivo','inicio','inicio2','termo'];
const MESES_AB={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
const MESES=['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const isoD=(y,m,d)=>y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const dataDeIso=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])};
const fmtIso=s=>{if(!s)return '';const p=s.split('-');return p[2]+'/'+p[1]};
const fmtIsoL=s=>{if(!s)return '';const d=dataDeIso(s);return DIAS_C[d.getDay()]+', '+d.getDate()+' '+MESES[d.getMonth()+1].slice(0,3).toLowerCase()};
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const sat=c=>Math.max(...c)-Math.min(...c);
/* distância de cor perceptual (CIE Lab, ΔE76) */
function lab(c){const f=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92};const r=f(c[0]),g=f(c[1]),b=f(c[2]);
  let x=(r*0.4124+g*0.3576+b*0.1805)/0.95047,y=r*0.2126+g*0.7152+b*0.0722,z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const h=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;x=h(x);y=h(y);z=h(z);return [116*y-16,500*(x-y),200*(y-z)]}
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])};
async function lerCalendarioPdf(file){
  const lib=await getPdfLib();
  const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;
  const page=await doc.getPage(1);
  const tc=await page.getTextContent();
  const vp=page.getViewport({scale:3});
  const cv=document.createElement('canvas');cv.width=Math.ceil(vp.width);cv.height=Math.ceil(vp.height);
  const g=cv.getContext('2d',{willReadFrequently:true});
  await page.render({canvasContext:g,viewport:vp}).promise;
  const img=g.getImageData(0,0,cv.width,cv.height).data;
  const pxl=(X,Y)=>{X=Math.round(X);Y=Math.round(Y);if(X<0||Y<0||X>=cv.width||Y>=cv.height)return [255,255,255];const k=(Y*cv.width+X)*4;return [img[k],img[k+1],img[k+2]]};
  const P=(x,y)=>vp.convertToViewportPoint(x,y);
  const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||6;const rot=Math.abs(t[0])<0.01;return {s:i.str.trim(),x:t[4],y:t[5],w:i.width||0,h,rot}});
  const txt=items.map(i=>i.s).join(' ');
  const am=txt.match(/(\d{4})\s*\/\s*(\d{4})/);if(!am)throw new Error('Não encontrei o ano letivo (ex.: 2026/2027) no PDF.');
  const y1=+am[1],y2=+am[2];
  // cor dominante perto de um ponto (ignora branco, preto/cinzento do texto e das linhas)
  const corEm=(X,Y,r)=>{const cont={};let best=null,bn=0;
    for(let dx=-r;dx<=r;dx+=2)for(let dy=-r;dy<=r;dy+=2){const c=pxl(X+dx,Y+dy);if(sat(c)<25)continue;
      const k=c.map(v=>v>>4).join(',');cont[k]=(cont[k]||0)+1;if(cont[k]>bn){bn=cont[k];best=c}}
    return best};
  // ---- cores da legenda ----
  const LEG=[['inicio2',/in[ií]cio do ano letivo para/i],['inicio',/^in[ií]cio do ano letivo$/i],['feriadoR',/feriado regional/i],['feriadoN',/feriado nacional/i],['letivo',/^dia letivo$/i],['interrupcao',/interrup[cç][aã]o letiva/i]];
  const cores={};
  LEG.forEach(([k,re])=>{const it=items.find(i=>re.test(i.s));if(!it)return;
    const [X,Y]=P(it.x,it.y+it.h*0.35);
    for(let d=6;d<150;d+=3){const c=corEm(X-d,Y,4);if(c&&sat(c)>=25){cores[k]=c;break}}});
  // termos: linhas "junho de 2027 para os alunos dos 9º, 11º…" com o número (dia) na caixa amarela à esquerda
  const termos=[];
  items.filter(i=>/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)\s+de\s+20/i.test(i.s)&&/\d\s*º|pr[eé]-escolar/i.test(i.s)).forEach(it=>{
    const num=items.filter(o=>/^\d{1,2}$/.test(o.s)&&Math.abs(o.y-it.y)<it.h*0.8&&o.x<it.x&&it.x-o.x<70).sort((a,b)=>b.x-a.x)[0];if(!num)return;
    const mes=MESES_AB[normT(it.s.match(/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)/i)[1]).slice(0,3)];
    const [X,Y]=P(num.x+num.w/2,num.y+num.h*0.35);const c=corEm(X+num.w*1.4,Y,5);if(c&&!cores.termo)cores.termo=c;
    const resto=it.s.replace(/.*?de\s+20\s*\d*\s*/i,' ');
    const anos=[...new Set((resto.match(/\b(\d{1,2})\s*º?/g)||[]).map(x=>parseInt(x)).filter(n=>n>=1&&n<=12))];
    if(/pr[eé]-escolar/i.test(it.s))anos.push(0);
    termos.push({data:isoD(mes>=9?y1:y2,mes,+num.s),anos:anos.sort((a,b)=>a-b),texto:it.s.replace(/\s+/g,' ').trim()});
  });
  if(!cores.letivo)throw new Error('Não encontrei a legenda de cores (Dia letivo, Interrupção letiva…).');
  // ---- grelha: colunas a partir do cabeçalho dos dias da semana ----
  const DS={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,sab:6};
  const hdr=items.filter(i=>DS[normT(i.s).slice(0,3)]!=null&&normT(i.s).length<=4);
  const ys={};hdr.forEach(i=>{const k=Math.round(i.y/4);(ys[k]=ys[k]||[]).push(i)});
  const linhaHdr=Object.values(ys).sort((a,b)=>b.length-a.length)[0]||[];
  const cols=linhaHdr.map(i=>({x:i.rot?i.x-i.h/2:i.x+i.w/2,dow:DS[normT(i.s).slice(0,3)]})).sort((a,b)=>a.x-b.x);
  if(cols.length<20)throw new Error('Não encontrei a grelha dos dias da semana.');
  const esp=(cols[cols.length-1].x-cols[0].x)/(cols.length-1);
  // ---- linhas dos meses ----
  const meses=items.filter(i=>MESES_AB[normT(i.s)]!=null).sort((a,b)=>b.y-a.y);
  const perLab=items.filter(i=>/^[1-3]\s*º\s*p$/i.test(i.s)).map(i=>({n:+i.s[0],y:i.y}));
  const dias={},notas={},perDia={},amostras=[];
  meses.forEach(mi=>{
    const m=MESES_AB[normT(mi.s)],ano=m>=9?y1:y2,nd=new Date(ano,m,0).getDate();
    const dow1=new Date(ano,m-1,1).getDay();
    const naLinha=items.filter(o=>Math.abs(o.y-mi.y)<mi.h*0.5&&o.x>mi.x+mi.w&&o.x<cols[cols.length-1].x+esp*0.6);
    const prim=naLinha.slice().sort((a,b)=>a.x-b.x)[0];if(!prim)return;
    const cIdx=x=>{let b=0,bd=1e9;cols.forEach((c,i)=>{const d=Math.abs(c.x-x);if(d<bd){bd=d;b=i}});return b};
    let c1=cIdx(prim.x+prim.w/2);
    if(cols[c1].dow!==dow1){const alt=[1,-1,2,-2,3,-3].map(k=>c1+k).find(k=>cols[k]&&cols[k].dow===dow1);if(alt!=null)c1=alt}
    const per=(perLab.filter(p=>p.y>mi.y).sort((a,b)=>a.y-b.y)[0]||{}).n||null;
    for(let d=1;d<=nd;d++){
      const c=c1+d-1;if(!cols[c])break;const X0=cols[c].x,Y0=mi.y+mi.h*0.35;
      const [X,Y]=P(X0,Y0);const sx=esp*vp.scale*0.38;
      const cs=[corEm(X-sx,Y,3),corEm(X+sx,Y,3)].filter(Boolean);
      const cor=cs.length?cs.sort((a,b)=>sat(b)-sat(a))[0]:null;
      const iso=isoD(ano,m,d);amostras.push({iso,cor,dow:new Date(ano,m-1,d).getDay()});
      const lt=naLinha.find(o=>Math.abs(o.x+o.w/2-X0)<esp*0.45&&/^[A-Z]$/.test(o.s));
      if(lt)notas[iso]={C:'Carnaval',P:'Páscoa'}[lt.s]||lt.s;
      if(per)perDia[iso]=per;
    }
  });
  // cor dos fins de semana (dominante) = sem atividades letivas
  const fds=amostras.filter(a=>(a.dow===0||a.dow===6)&&a.cor);const grupos=[];
  fds.forEach(a=>{const gr=grupos.find(g=>dE(g.c,a.cor)<12);if(gr)gr.n++;else grupos.push({c:a.cor,n:1})});
  const corNao=grupos.filter(g=>g.n>=fds.length*0.15).map(g=>g.c);
  amostras.forEach(a=>{let tipo='nao';
    if(a.cor&&!corNao.some(c=>dE(c,a.cor)<14)){let bd=45;Object.entries(cores).forEach(([k,ref])=>{const dd=dE(a.cor,ref);if(dd<bd){bd=dd;tipo=k}})}
    dias[a.iso]=tipo});
  const pv=document.createElement('canvas');pv.width=760;pv.height=Math.round(cv.height*760/cv.width);pv.getContext('2d').drawImage(cv,0,0,pv.width,pv.height);
  return montarCalendario({preview:pv.toDataURL('image/jpeg',.72),dias,notas,perDia,termos,anoLetivo:y1+'/'+y2,ficheiro:file.name,cores:Object.fromEntries(Object.entries(cores).map(([k,c])=>[k,'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')]))});
}
/* calcula períodos e marcos a partir dos dias classificados */
function montarCalendario(c){
  const isos=Object.keys(c.dias).sort();
  const let_=isos.filter(i=>LETIVOS.includes(c.dias[i]));
  c.inicio=isos.find(i=>c.dias[i]==='inicio')||let_[0]||'';
  c.inicio2=isos.find(i=>c.dias[i]==='inicio2')||'';
  const ns=[...new Set(Object.values(c.perDia||{}))].sort();
  c.periodos=(ns.length?ns:[1]).map(n=>{const L=let_.filter(i=>!c.perDia||!Object.keys(c.perDia).length||c.perDia[i]===n);return {n,ini:L[0]||'',fim:L[L.length-1]||'',dias:L.length}}).filter(p=>p.ini);
  if(c.termos&&c.termos.length){const ult=c.termos.map(t=>t.data).sort().pop();const p=c.periodos[c.periodos.length-1];if(p&&ult>p.fim)p.fim=ult}
  c.importado=new Date().toISOString();
  return c;
}
/* ---------- consultas ---------- */
const CAL=()=>(A()||{}).calendario||null;
const tipoDia=iso=>{const c=CAL();return c?c.dias[iso]||null:null};
function inicioTurma(t,c){c=c||CAL();if(!c)return '';return c.inicio2&&t&&['3c','sec'].includes(t.ciclo)?c.inicio2:c.inicio}
function termoTurma(t,c){c=c||CAL();if(!c)return '';const n=t?parseInt(t.anoEsc):NaN;const T_=(c.termos||[]).find(x=>x.anos.includes(n));
  const fimP=(c.periodos[c.periodos.length-1]||{}).fim||'';return T_?T_.data:fimP}
function letivoPara(t,d){const c=CAL();if(!c)return true;const iso=typeof d==='string'?d:isoData(d);const tp=c.dias[iso];
  if(!tp)return false;if(!LETIVOS.includes(tp))return false;if(t){const a=inicioTurma(t,c),b=termoTurma(t,c);if(a&&iso<a)return false;if(b&&iso>b)return false}return true}
function periodoDe(iso){const c=CAL();if(!c||!c.periodos.length)return null;iso=iso||isoData(new Date());
  const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim);if(p)return p.n;const nx=c.periodos.find(p=>iso<p.ini);return nx?nx.n:c.periodos[c.periodos.length-1].n}
function diasLetivosEntre(a,b,t){const c=CAL();if(!c)return 0;return Object.keys(c.dias).filter(i=>i>=a&&i<=b&&letivoPara(t,i)).length}
/* sequências de dias (interrupções, feriados) → eventos */
function eventosCalendario(c){c=c||CAL();if(!c)return [];const ev=[];const isos=Object.keys(c.dias).sort();
  isos.forEach(i=>{const tp=c.dias[i];if(!['interrupcao','feriadoN','feriadoR','feriadoM','inicio','inicio2','termo'].includes(tp))return;
    // interrupções seguidas (incluindo fins de semana e feriados pelo meio) num só evento
    const p=tp==='interrupcao'?ev.filter(e=>e.t==='interrupcao').pop():null;
    if(p&&diasNaoLetivosAte(c,p.fim,i)){p.fim=i;if(!p.nota&&(c.notas||{})[i])p.nota=c.notas[i]}
    else ev.push({t:tp,ini:i,fim:i,nota:(c.notas||{})[i]||''})});
  (c.termos||[]).forEach(x=>{if(!ev.some(e=>e.t==='termo'&&e.ini===x.data))ev.push({t:'termo',ini:x.data,fim:x.data})});
  ev.forEach(e=>{if(e.t==='interrupcao'&&!e.nota){const k=Object.keys(c.notas||{}).sort().find(i=>i>=e.ini&&i<=e.fim);if(k)e.nota=c.notas[k]}});
  ev.forEach(e=>{if(e.t==='termo'){const x=(c.termos||[]).find(t=>t.data===e.ini);e.nota=x?anosTxt(x.anos):''}});
  return ev.sort((a,b)=>a.ini.localeCompare(b.ini));
}
function diasNaoLetivosAte(c,a,b){const d0=dataDeIso(a);d0.setDate(d0.getDate()+1);for(let d=d0;isoData(d)<b;d.setDate(d.getDate()+1)){if(LETIVOS.includes(c.dias[isoData(d)]))return false}return true}
const anosTxt=L=>!L||!L.length?'':L.map(n=>n===0?'pré-escolar':n+'.º').join(', ')+(L.length?' ano'+(L.length>1?'s':''):'');
/* ---------- criação manual ---------- */
function calendarioManual(an,ps){
  const dias={},perDia={};const[y1,y2]=an.split('/').map(Number);
  for(let d=new Date(y1,8,1);d<=new Date(y2,6,31);d.setDate(d.getDate()+1)){const i=isoData(d);const dow=d.getDay();
    const p=ps.find(p=>i>=p.ini&&i<=p.fim);dias[i]=p&&dow>0&&dow<6?'letivo':(dow>0&&dow<6&&i>ps[0].ini&&i<ps[ps.length-1].fim?'interrupcao':'nao');if(p)perDia[i]=p.n}
  dias[ps[0].ini]='inicio';
  return montarCalendario({dias,notas:{},perDia,termos:[],anoLetivo:an,ficheiro:'(manual)'});
}

/* ---------- feriados nacionais (para o calendário criado à mão) ---------- */
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(y,mes-1,dia)}
function feriadosNacionais(y1,y2){const out={};
  [[y1,10,5],[y1,11,1],[y1,12,1],[y1,12,8],[y1,12,25],[y2,1,1],[y2,4,25],[y2,5,1],[y2,6,10]].forEach(([y,m,d])=>out[isoD(y,m,d)]='');
  const p=pascoa(y2),dd=n=>isoData(new Date(p.getFullYear(),p.getMonth(),p.getDate()+n));
  out[dd(-2)]='Sexta-feira Santa';out[dd(0)]='Páscoa';out[dd(60)]='Corpo de Deus';return out}
/* ---------- importação do PDF ---------- */
const pickCalendario=()=>{const f=$('#calIn');f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;ocupado('A ler '+file.name+'…');
  try{const c=await lerCalendarioPdf(file);livre();importarCalendarioDlg(c)}catch(e){livre();alert('Não foi possível ler o calendário.\n\n'+e.message+'\n\nSugestão: '+sugestaoErro(e.message))}};f.click()};
function importarCalendarioDlg(c){
  const a=A();const ev=eventosCalendario(c);const n=k=>Object.values(c.dias).filter(x=>x===k).length;
  const difAno=c.anoLetivo&&a.nome!==c.anoLetivo;
  openDrawer('Importar Calendário Escolar',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('file',14)} ${esc(c.ficheiro)} · ano letivo <b>${esc(c.anoLetivo)}</b></p>
    ${difAno?`<div class="alert w">${ic('alert',15)} O calendário é de ${esc(c.anoLetivo)} mas o ano letivo ativo é ${esc(a.nome)}.${S.anos.some(x=>x.nome===c.anoLetivo)?' Mude o ano letivo ativo antes de importar, ou importe assim mesmo.':''}</div>`:''}
    ${a.calendario?`<div class="alert w">${ic('alert',15)} Substitui o calendário atual (${esc(a.calendario.ficheiro||'')}).</div>`:''}
    <table class="lst"><thead><tr><th>${c.periodos.length===2?'Semestre':'Período'}</th><th>Início</th><th>Fim</th><th>Dias Letivos</th></tr></thead><tbody>
    ${c.periodos.map(p=>`<tr><td><b>${p.n}.º</b></td><td>${esc(fmtIsoL(p.ini))}</td><td>${esc(fmtIsoL(p.fim))}</td><td><b>${p.dias}</b></td></tr>`).join('')}</tbody></table>
    <div class="cal-res">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}
      <div><span class="sw" style="background:${TIPOS_DIA.interrupcao.cor}"></span>Interrupções: ${ev.filter(e=>e.t==='interrupcao').map(e=>`<b>${esc(fmtIso(e.ini))}${e.fim!==e.ini?'–'+esc(fmtIso(e.fim)):''}</b>${e.nota?' ('+esc(e.nota)+')':''}`).join(' · ')||'—'}</div>
      <div><span class="sw" style="background:${TIPOS_DIA.feriadoN.cor}"></span>Feriados nacionais: ${n('feriadoN')} · <span class="sw" style="background:${TIPOS_DIA.feriadoR.cor}"></span>regionais: ${n('feriadoR')}</div>
    </div>
    ${c.preview?`<details class="pdfprev" open><summary>${ic('file',14)} O PDF lido (para comparar)</summary><img src="${c.preview}" alt="Pré-visualização do calendário em PDF"></details>`:''}
    <p class="hint">Confira com o PDF. Depois de guardar, pode corrigir qualquer dia em Calendário Escolar → “Editar Dias”.</p>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cal-ok">${ic('check',15)} Guardar Calendário</button></div></div>`);
  $('#cal-ok').onclick=()=>{delete c.preview;regista('Calendário escolar (PDF)',c.ficheiro,c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(', '));guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário guardado · '+c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(' · '))};
}
function guardarCalendario(c){const a=A();delete c.periodos3;delete c.periodos2;a.calendario=c;ajustarOrgCalendario(a);saveNow()}
/* ---------- criação manual ---------- */
function calendarioManualDlg(){
  const a=A();const[y1,y2]=a.nome.split('/').map(Number);
  const sem=a.org==='semestre';
  const def=sem?[[isoD(y1,9,14),isoD(y2,1,29)],[isoD(y2,2,1),isoD(y2,6,18)]]:[[isoD(y1,9,14),isoD(y1,12,18)],[isoD(y2,1,4),isoD(y2,3,19)],[isoD(y2,4,5),isoD(y2,6,18)]];
  openDrawer('Criar Calendário',`<div class="ed"><p class="hint" style="margin-top:0">Indique o início e o fim de cada ${sem?'semestre':'período'}. Os dias úteis ficam letivos, os intervalos entre ${sem?'semestres':'períodos'} ficam como interrupções e os feriados nacionais são marcados automaticamente. Depois pode ajustar dia a dia.</p>
    <table class="lst"><thead><tr><th>${sem?'Semestre':'Período'}</th><th>Início</th><th>Fim</th></tr></thead><tbody>
    ${def.map((p,k)=>`<tr><td><b>${k+1}.º</b></td><td><input type="date" id="cm-i${k}" value="${p[0]}"></td><td><input type="date" id="cm-f${k}" value="${p[1]}"></td></tr>`).join('')}</tbody></table>
    <label class="row" style="margin-top:12px;gap:8px"><input type="checkbox" id="cm-fer" checked> Marcar feriados nacionais</label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cm-ok">${ic('check',15)} Criar Calendário</button></div></div>`);
  $('#cm-ok').onclick=()=>{const ps=def.map((_,k)=>({n:k+1,ini:$('#cm-i'+k).value,fim:$('#cm-f'+k).value}));
    if(ps.some(p=>!p.ini||!p.fim||p.fim<p.ini)||ps.some((p,k)=>k&&p.ini<=ps[k-1].fim))return alert('Verifique as datas (cada um começa depois do anterior terminar).');
    const c=calendarioManual(a.nome,ps);
    if($('#cm-fer').checked)Object.entries(feriadosNacionais(y1,y2)).forEach(([i,nota])=>{if(c.dias[i]&&dataDeIso(i).getDay()%6){c.dias[i]='feriadoN';if(nota)c.notas[i]=nota}});
    montarCalendario(c);guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário criado')};
}
/* ---------- edição: pincel ---------- */
function pintarDia(iso,tp){const c=CAL();if(!c)return;
  if(tp==='nota'){const v=prompt('Nota para '+fmtIsoL(iso)+' (vazio para apagar)',(c.notas||{})[iso]||'');if(v==null)return;c.notas=c.notas||{};if(v.trim())c.notas[iso]=v.trim();else delete c.notas[iso]}
  else{c.dias[iso]=tp;
    if(LETIVOS.includes(tp)&&!c.perDia[iso]&&Object.keys(c.perDia).length){const p=c.periodos.slice().reverse().find(p=>p.ini<=iso)||c.periodos[0];if(p)c.perDia[iso]=p.n}
    if(tp==='termo'&&!(c.termos||[]).some(t=>t.data===iso)){/* termo pintado à mão: vale para todos os anos que não tenham outro */}
    const imp=c.importado;montarCalendario(c);c.importado=imp;c.editado=new Date().toISOString()}
  save();
}
/* ---------- vista ---------- */
function mesesDoCal(c){const s=[...new Set(Object.keys(c.dias).map(i=>i.slice(0,7)))].sort();return s}
function miniMes(c,ym,opts){
  const [y,m]=ym.split('-').map(Number);const nd=new Date(y,m,0).getDate();const off=(new Date(y,m-1,1).getDay()+6)%7;const hj=isoData(new Date());
  let cells='';for(let k=0;k<off;k++)cells+='<span class="cd vz"></span>';
  for(let d=1;d<=nd;d++){const iso=isoD(y,m,d);const tp=c.dias[iso]||'nao';const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;const nota=(c.notas||{})[iso];const dow=(off+d-1)%7;
    const ttl=fmtIsoL(iso)+' — '+T_.n+(nota?' · '+nota:'')+(c.perDia&&c.perDia[iso]?' · '+c.perDia[iso]+'.º '+(c.periodos.length===2?'semestre':'período'):'');
    const ai=(opts.ai||[]).some(d=>iso>=d.data&&iso<=(d.fim||d.data));cells+=`<button type="button" class="cd t-${tp} ${dow>4?'fds':''} ${ai?'ai':''} ${iso===hj?'hj':''} ${opts.passado&&iso<hj?'pas':''}" data-cd="${iso}" title="${esc(ttl)}" style="${T_.cor?`background:${T_.cor};color:${T_.ink}`:''}">${d}${nota?`<i>${esc(nota[0])}</i>`:''}</button>`}
  return `<div class="cmes"><div class="cmh">${MESES[m]} <span class="mut">${y}</span></div><div class="cgr">${['S','T','Q','Q','S','S','D'].map(x=>`<span class="cw">${x}</span>`).join('')}${cells}</div></div>`;
}
function resumoPeriodoAtual(c,t){
  const hj=isoData(new Date());const P=c.periodos;if(!P.length)return null;
  const p=P.find(p=>hj>=p.ini&&hj<=p.fim);const W=P.length===2?'semestre':'período';
  if(p){const feitos=diasLetivosEntre(p.ini,hj,t)-(letivoPara(t,hj)?1:0);const rest=diasLetivosEntre(hj,p.fim,t);return {p,W,estado:'decorre',feitos,rest,pct:Math.round(100*feitos/Math.max(1,feitos+rest))}}
  const nx=P.find(p=>hj<p.ini);if(nx)return {p:nx,W,estado:'antes',falta:Math.round((dataDeIso(nx.ini)-dataDeIso(hj))/864e5)};
  return {p:P[P.length-1],W,estado:'fim'};
}
function vCalendario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  const c=a.calendario;
  if(!c){
    barBtns([{id:'b-ci',t:'Importar PDF…',f:pickCalendario}]);
    $('#view').innerHTML=`<div class="card empty">${ic('calendar',30)}<br><b>Calendário Escolar ${esc(a.nome)}</b><br><span class="mut">Importe o PDF do calendário escolar (com a legenda de cores: dias letivos, interrupções, feriados, termo das aulas) ou crie-o indicando as datas dos ${a.org==='semestre'?'semestres':'períodos'}.</span><br><br>
      <div class="row" style="justify-content:center"><button class="btn pri" id="c-imp">${ic('upload',15)} Importar PDF do Calendário</button><button class="btn" id="c-man">${ic('plus',15)} Criar Manualmente</button></div></div>`;
    $('#c-imp').onclick=pickCalendario;$('#c-man').onclick=calendarioManualDlg;return}
  const tabs=`<div class="tabs noprint">${[['cal','calendar','Calendário'],['prev','calcheck','Aulas Previstas']].map(([k,i,l])=>`<button data-ct="${k}" class="${(UI.calTab||'cal')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  const bindTabs=()=>$$('[data-ct]').forEach(b=>b.onclick=()=>{UI.calTab=b.dataset.ct;UI.calEd=false;vCalendario()});
  if(UI.calTab==='prev'){
    barBtns([{id:'b-csv',t:'Exportar CSV',f:exportPrevistas},{id:'b-pr',t:'Imprimir',f:()=>window.print()}]);
    $('#view').innerHTML=tabs+vAulasPrevistas(a,c);bindTabs();
    $$('#pv-u [data-u]').forEach(b=>b.onclick=()=>{UI.prevU=b.dataset.u;vCalendario()});
    $$('[data-pv]').forEach(r=>r.onclick=()=>prevDetalheDlg(a.turmas.find(t=>t.id===r.dataset.pv)));
    $$('[data-hor]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.hor;save();go('horario')});
    return}
  barBtns([{id:'b-ed',t:UI.calEd?'Concluir Edição':'Editar Dias',c:UI.calEd?'pri':'',f:()=>{UI.calEd=!UI.calEd;vCalendario()}},{id:'b-ci',t:'Importar PDF…',f:pickCalendario},{id:'b-pr',t:'Imprimir',f:()=>window.print()},
    {id:'b-cx',t:'Remover',c:'dng',f:()=>{if(confirm('Remover o calendário escolar de '+a.nome+'?')){delete a.calendario;UI.calEd=false;saveNow();go('calendario')}}}]);
  const hj=isoData(new Date());const ev=eventosCalendario(c);const W=c.periodos.length===2?'Semestre':'Período';
  const r=resumoPeriodoAtual(c);const futuros=ev.filter(e=>e.fim>=hj);
  const prox=futuros.find(e=>!['inicio','inicio2'].includes(e.t)||e.ini>=hj);
  const nomeEv=e=>e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas':e.t==='inicio'?'Início do Ano Letivo':e.t==='inicio2'?'Início 3.º Ciclo e Secundário':(e.nota||TIPOS_DIA[e.t].n);
  const durEv=e=>e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim);
  const difAno=c.anoLetivo&&c.anoLetivo!==a.nome;
  const pincel=UI.calPin||'letivo';
  $('#view').innerHTML=tabs+cartaoOrg(a)+`
  ${difAno?`<div class="card"><div class="alert w" style="margin:0">${ic('alert',15)} Este calendário é de ${esc(c.anoLetivo)} e está associado ao ano letivo ${esc(a.nome)}.</div></div>`:''}
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('calendar',14)} ${r&&r.estado==='decorre'?W+' Atual':r&&r.estado==='antes'?'Próximo '+W:'Ano Letivo'}</div><div class="v">${r?(r.estado==='fim'?'Terminado':r.p.n+'.º '+W):'—'}</div><div class="mut">${r&&r.estado!=='fim'?esc(fmtIso(r.p.ini)+' a '+fmtIso(r.p.fim)):''}${r&&r.estado==='antes'?' · começa daqui a '+r.falta+' dia'+(r.falta>1?'s':''):''}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Dias Letivos Restantes</div><div class="v">${r&&r.estado==='decorre'?r.rest:r&&r.estado==='antes'?r.p.dias:0}</div><div class="mut">${r&&r.estado==='decorre'?'até '+esc(fmtIsoL(r.p.fim))+' · '+r.feitos+' já decorridos':r&&r.estado==='antes'?'no '+r.p.n+'.º '+W.toLowerCase():''}</div></div>
    <div class="kpi"><div class="l">${ic('flag',14)} Próximo Marco</div><div class="v" style="font-size:17px">${prox?esc(nomeEv(prox)):'—'}</div><div class="mut">${prox?esc(durEv(prox)):''}</div></div>
    <div class="kpi"><div class="l">${ic('grad',14)} Total de Dias Letivos</div><div class="v">${c.periodos.reduce((s,p)=>s+p.dias,0)}</div><div class="mut">${c.periodos.map(p=>p.n+'.º '+p.dias).join(' · ')}</div></div>
  </div>
  <div class="card wide"><h2>${W==='Semestre'?'Semestres':'Períodos Letivos'}</h2><div class="cper">
    ${c.periodos.map(p=>{const tot=p.dias,feitos=hj<p.ini?0:hj>p.fim?tot:diasLetivosEntre(p.ini,hj)-(letivoPara(null,hj)?1:0);const on=hj>=p.ini&&hj<=p.fim;
      return `<div class="cp pcor ${on?'on':''} ${hj>p.fim?'done':''}" style="--pc:var(--p${p.n})"><div class="row"><b>${p.n}.º ${W}</b><span class="sp1"></span>${on?'<span class="tag now">a decorrer</span>':hj>p.fim?'<span class="tag">concluído</span>':''}</div>
      <div class="cpd">${esc(fmtIsoL(p.ini))} → ${esc(fmtIsoL(p.fim))}</div>
      <div class="pbar"><span style="width:${Math.round(100*feitos/Math.max(1,tot))}%"></span></div>
      <div class="mut">${tot} dias letivos${on?' · faltam '+(tot-feitos):''}</div></div>`}).join('')}</div>
    ${c.inicio2||(c.termos||[]).length>1?`<div class="cal-res" style="margin-top:12px">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo das Aulas: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}</div>`:''}
  </div>
  ${cartaoIntercalar(a,c)}
  <div class="calwrap"><div class="card wide calc"><div class="row calhd"><h2 style="margin:0">Calendário ${esc(c.anoLetivo||a.nome)}</h2><span class="sp1"></span><div class="seg zoomseg noprint" aria-label="Tamanho do calendário"><button type="button" data-zm="-" aria-label="Diminuir" title="Diminuir">−</button><button type="button" data-zm="+" aria-label="Aumentar" title="Aumentar">+</button></div></div>
    <span class="cleg">${['letivo','inicio','inicio2','termo','interrupcao','feriadoN','feriadoR','feriadoM'].filter(k=>k==='letivo'||Object.values(c.dias).includes(k)).map(k=>`<span><span class="sw" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}</span>`).join('')}<span><span class="sw nao"></span>Sem Atividades Letivas</span></span>
    ${UI.calEd?`<p class="hint noprint" style="margin:0 0 8px">Escolha o tipo e toque num dia, ou arraste o dedo por vários dias seguidos. Toque em “Concluir Edição” no fim.</p><div class="cpin noprint">${[...Object.keys(TIPOS_DIA),'nota'].map(k=>`<button type="button" data-pin="${k}" class="${pincel===k?'on':''}">${k==='nota'?ic('pencil',14)+' Nota':`<span class="sw ${k==='nao'?'nao':''}" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}`}</button>`).join('')}</div>`:''}
    <div class="cmeses ${UI.calEd?'ed':''}" style="--cz:${zoomCal()}">${mesesDoCal(c).map(ym=>miniMes(c,ym,{passado:true,ai:(a.datasAval||[]).filter(d=>d.tipo==='intercalar'&&!d.turma&&d.data&&intercalarPeriodos(a).includes(d.per))})).join('')}</div>
    <p class="hint">${c.ficheiro==='(manual)'?'Criado manualmente':'Importado de '+esc(c.ficheiro)}${c.editado?' · editado':''}. ${Object.keys(c.notas||{}).length?'Letras nos dias: '+[...new Set(Object.values(c.notas))].map(n=>esc(n[0]+' = '+n)).join(', ')+'.':''}</p>
  </div>
  <div class="card calev"><h2>Interrupções, Feriados e Marcos</h2>
    ${ev.map(e=>`<div class="lin cev ${e.fim<hj?'pas':''} ${e===prox?'now':''}"><span class="sw" style="background:${TIPOS_DIA[e.t].cor}"></span><span class="hh">${esc(durEv(e))}</span><b>${esc(nomeEv(e))}</b>${e.t==='termo'&&e.nota?`<span class="mut">${esc(e.nota)}</span>`:''}${e.t==='interrupcao'?`<span class="mut">${Object.keys(c.dias).filter(i=>i>=e.ini&&i<=e.fim&&c.dias[i]==='interrupcao').length} dias sem aulas</span>`:''}</div>`).join('')||'<p class="mut">Sem eventos.</p>'}
  </div></div>`;
  bindTabs();bindIntercalar(a,()=>{const y=$('#view').scrollTop;vCalendario();$('#view').scrollTop=y});
  $$('[data-pin]').forEach(b=>b.onclick=()=>{UI.calPin=b.dataset.pin;vCalendario()});
  bindZoom(vCalendario);
  const grid=$('.cmeses');
  if(!UI.calEd)$$('[data-cd]').forEach(b=>b.onclick=()=>diaDlg(b.dataset.cd));
  else if(pincel==='nota')$$('[data-cd]').forEach(b=>b.onclick=()=>{pintarDia(b.dataset.cd,'nota');vCalendario()});
  else{ // pintar tocando ou arrastando o dedo sobre vários dias
    let ativo=false;const feitos=new Set();
    const pinta=el=>{const cd=el&&el.closest&&el.closest('[data-cd]');if(!cd||feitos.has(cd.dataset.cd))return;feitos.add(cd.dataset.cd);
      const T_=TIPOS_DIA[pincel];cd.className=cd.className.replace(/t-\w+/,'t-'+pincel);cd.style.background=T_.cor;cd.style.color=T_.ink;cd.classList.add('pint')};
    grid.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-cd]'))return;try{e.target.releasePointerCapture(e.pointerId)}catch(_){}ativo=true;feitos.clear();pinta(e.target);e.preventDefault()});
    grid.addEventListener('pointermove',e=>{if(ativo)pinta(document.elementFromPoint(e.clientX,e.clientY))});
    const fim=()=>{if(!ativo)return;ativo=false;feitos.forEach(iso=>pintarDia(iso,pincel));if(feitos.size>1)toast(feitos.size+' dias marcados como '+TIPOS_DIA[pincel].n);vCalendario()};
    document.onpointerup=fim;document.onpointercancel=fim;
  }
}
const diasUteis=(a,b)=>{let n=0;for(let d=dataDeIso(a);isoData(d)<=b;d.setDate(d.getDate()+1))if(d.getDay()%6)n++;return n};
/* cartão do Início */
function cartaoCalendario(a){
  const c=a&&a.calendario;if(!c)return a?`<div class="card"><div class="row"><h2 style="margin:0">${ic('calendar',18)} Calendário Escolar</h2><span class="sp1"></span><button class="btn sm" data-go="calendario">Importar PDF</button></div><p class="hint" style="margin:6px 0 0">Importe o calendário escolar para ver o período atual, os dias letivos que faltam e saltar as interrupções nas próximas aulas.</p></div>`:'';
  const r=resumoPeriodoAtual(c);const hj=isoData(new Date());const ev=eventosCalendario(c).filter(e=>e.fim>=hj&&!['inicio','inicio2'].includes(e.t));const e=ev[0];
  const tp=c.dias[hj];const W=c.periodos.length===2?'semestre':'período';
  return `<button class="card ccal" data-go="calendario"><div class="row"><h2 style="margin:0">${ic('calendar',18)} ${r?r.estado==='decorre'?r.p.n+'.º '+W:r.estado==='antes'?r.p.n+'.º '+W+' começa a '+esc(fmtIsoL(r.p.ini)):'Ano letivo terminado':'Calendário'}</h2><span class="sp1"></span>
    ${tp&&!LETIVOS.includes(tp)&&tp!=='nao'?`<span class="tag" style="background:${TIPOS_DIA[tp].cor};color:${TIPOS_DIA[tp].ink}">Hoje: ${esc(TIPOS_DIA[tp].n)}</span>`:''}</div>
    ${r&&r.estado==='decorre'?`<div class="pbar"><span style="width:${r.pct}%"></span></div><div class="mut">${esc(fmtIsoL(r.p.ini))} → ${esc(fmtIsoL(r.p.fim))} · <b>${r.rest}</b> dias letivos por dar · ${r.feitos} decorridos</div>`:''}
    ${e?`<div class="mut" style="margin-top:4px">${ic('flag',13)} Próximo: <b>${esc(e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas ('+e.nota+')':e.nota||TIPOS_DIA[e.t].n)}</b> — ${esc(e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim))}</div>`:''}</button>`;
}

/* ---------- aulas previstas (calendário × horário da turma) ---------- */
function aulasPrevistas(t,a){
  a=a||A();const c=a&&a.calendario;if(!c||!c.periodos.length)return null;
  const B=blocos(aulasTurma(t,a));if(!B.length)return null;
  const ini=inicioTurma(t,c),fim=termoTurma(t,c);
  const agora=new Date(),hj=isoData(agora),mins=agora.getHours()*60+agora.getMinutes();
  const FT=faltasDe(t,a);
  const P=c.periodos.map(p=>({n:p.n,ini:p.ini>ini?p.ini:ini,fim:fim&&p.fim>fim?fim:p.fim,aulas:0,tempos:0,dadas:0,tDadas:0,faltas:[],tFaltas:0,porDia:{},perdidas:[]})).filter(p=>p.ini<=p.fim);
  P.forEach(p=>{for(let d=dataDeIso(p.ini);isoData(d)<=p.fim;d.setDate(d.getDate()+1)){
    const iso=isoData(d),Bd=blocosDia(t,a,B,d);if(!Bd.length)continue;
    if(letivoPara(t,iso)){Bd.forEach(b=>{p.aulas++;p.tempos+=b.tempos;p.porDia[b.dia]=(p.porDia[b.dia]||0)+b.tempos;
      if(iso<hj||(iso===hj&&b.fim<=mins)){p.dadas++;p.tDadas+=b.tempos}});
      const f=FT.find(x=>x.data===iso&&!x.subst);if(f){const tp=Bd.reduce((s,b)=>s+b.tempos,0);const ft=Math.min(tp,+f.tempos||tp);p.tFaltas+=ft;p.faltas.push({...f,ft});
        if(iso<=hj){p.tDadas=Math.max(0,p.tDadas-ft);if(ft>=tp)p.dadas=Math.max(0,p.dadas-Bd.length)}}}
    else p.perdidas.push({iso,tipo:c.dias[iso]||'nao',nota:(c.notas||{})[iso]||'',aulas:Bd.length,tempos:Bd.reduce((s,b)=>s+b.tempos,0)});
  }});
  (a.reposicoes||[]).filter(r=>r.turma===t.id&&r.data<=hj).forEach(r=>{const p=P.find(q=>r.data>=q.ini&&r.data<=q.fim)||P[P.length-1];if(p){const tp=+r.tempos||1;p.dadas++;p.tDadas+=tp;p.repostas=(p.repostas||0)+tp}});
  const sem=B.reduce((s,b)=>s+b.tempos,0);
  return {P,semana:sem,aulasSemana:B.length,ini,fim,tot:{aulas:P.reduce((s,p)=>s+p.aulas,0),tempos:P.reduce((s,p)=>s+p.tempos,0),dadas:P.reduce((s,p)=>s+p.dadas,0),tDadas:P.reduce((s,p)=>s+p.tDadas,0),tFaltas:P.reduce((s,p)=>s+p.tFaltas,0),faltas:P.reduce((s,p)=>s+p.faltas.length,0)}};
}
/* ---------- faltas do professor ---------- */
const MOTIVOS_F=['Doença','Formação','Serviço oficial','Visita de estudo','Greve','Assistência à família','Conta férias (art. 102.º ECD)','Outro'];
const faltasDe=(t,a)=>((a||A()).faltasProf||[]).filter(f=>f.turma===t.id).sort((x,y)=>x.data.localeCompare(y.data));
const porDar=p=>Math.max(0,p.tempos-p.tDadas-p.tFaltas);
function faltaDlg(t,iso,id,depois){
  const a=A();a.faltasProf=a.faltasProf||[];const ex=id?a.faltasProf.find(f=>f.id===id):(iso?a.faltasProf.find(f=>f.turma===t.id&&f.data===iso):null);
  const oc=ocorrenciasTurma(t,a);iso=(ex&&ex.data)||iso||Object.keys(oc).filter(i=>i<=isoData(new Date())).pop()||isoData(new Date());
  const tpDia=d=>(oc[d]||{}).tempos||0;let motivo=ex?ex.motivo:'Doença';
  openDrawer(ex?'Falta do Professor':'Registar Falta do Professor',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('user',14)} ${esc(t.nome)} · ${esc(t.disciplina)} — a falta conta como aula não dada (não entra nas aulas dadas nem na soma Σ), e não como aula por dar.</p>
    <div class="g2"><div><label>Dia</label><input type="date" id="fa-data" value="${esc(iso)}"></div><div><label>Tempos em falta</label><input type="number" id="fa-t" min="1" max="12" value="${ex?ex.tempos:(tpDia(iso)||1)}" inputmode="numeric"></div></div>
    <p class="mut" id="fa-info" style="margin:6px 0 0"></p>
    <label style="margin-top:10px">Motivo</label><div class="nlcat">${MOTIVOS_F.map(m=>`<button type="button" data-fm="${esc(m)}" class="${m===motivo?'on':''}">${esc(m)}</button>`).join('')}</div>
    <label style="margin-top:10px">Observações</label><input id="fa-obs" value="${esc(ex&&ex.obs||'')}" placeholder="ex.: plano de aula entregue; reposição a combinar">
    <div class="row" style="margin-top:16px"><button class="btn pri" id="fa-ok">${ic('check',15)} Guardar Falta</button>${ex?`<button class="btn dng" id="fa-del">${ic('trash',15)} Apagar Falta</button>`:''}</div></div>`);
  const info=()=>{const d=$('#fa-data').value;const o=oc[d];$('#fa-info').innerHTML=o?`${esc(fmtIsoL(d))}: ${o.blocos.map(b=>fmtHM(b.ini)+'–'+fmtHM(b.fim)).join(', ')} · ${o.tempos} tempo${o.tempos>1?'s':''}`:`<span style="color:var(--warn)">${ic('alert',13)} Neste dia não há aula desta turma no horário.</span>`};info();
  $('#fa-data').onchange=()=>{info();const o=oc[$('#fa-data').value];if(o)$('#fa-t').value=o.tempos};
  $$('[data-fm]').forEach(b=>b.onclick=()=>{motivo=b.dataset.fm;$$('[data-fm]').forEach(x=>x.classList.toggle('on',x===b))});
  const fim=()=>{saveNow();closeDrawer();if(depois)depois();else go(VIEW)};
  $('#fa-ok').onclick=()=>{const d=$('#fa-data').value;if(!d)return alert('Indique o dia.');const f=ex||{id:uid(),turma:t.id};
    const dup=a.faltasProf.find(x=>x!==ex&&x.turma===t.id&&x.data===d);if(dup)a.faltasProf=a.faltasProf.filter(x=>x!==dup);
    Object.assign(f,{data:d,tempos:Math.max(1,+$('#fa-t').value||1),motivo,obs:$('#fa-obs').value.trim()});if(!ex)a.faltasProf.push(f);toast('Falta registada · '+fmtIsoL(d));fim()};
  const del=$('#fa-del');if(del)del.onclick=()=>{if(confirm('Apagar esta falta?')){a.faltasProf=a.faltasProf.filter(x=>x!==ex);fim()}};
}
const nomeTipo=tp=>(TIPOS_DIA[tp]||TIPOS_DIA.nao).n;
function vAulasPrevistas(a,c){
  const TT=turmasFiltradas(a);const U=UI.prevU||'tempos';const W=c.periodos.length===2?'Semestre':'Período';const hj=isoData(new Date());
  const L=TT.map(t=>({t,r:aulasPrevistas(t,a)}));const v=(o,k)=>U==='tempos'?o[k==='p'?'tempos':'tDadas']:o[k==='p'?'aulas':'dadas'];
  const cel=p=>{if(!p)return '<td class="num mut">—</td>';const ativo=hj>=p.ini&&hj<=p.fim;
    return `<td class="num"><b>${v(p,'p')}</b>${ativo?`<div class="sub">${v(p,'d')} dadas · faltam ${U==='tempos'?porDar(p):Math.max(0,p.aulas-p.dadas-p.faltas.length)}${p.tFaltas?' · '+(U==='tempos'?p.tFaltas:p.faltas.length)+' F':''}</div>`:hj>p.fim?'<div class="sub">concluído</div>':''}</td>`};
  const comR=L.filter(x=>x.r);
  return `<div class="card wide">
    <div class="row" style="margin-bottom:12px"><h2 style="margin:0">Aulas Previstas</h2><span class="sp1"></span>
      <div class="seg" id="pv-u"><button type="button" data-u="tempos" class="${U==='tempos'?'on':''}">Tempos</button><button type="button" data-u="aulas" class="${U==='aulas'?'on':''}">Aulas</button></div></div>
    <p class="hint" style="margin-top:0">Contagem a partir do horário de cada turma e do calendário escolar: só dias letivos, entre o início e o termo das aulas do ano de escolaridade da turma. ${U==='tempos'?'Um tempo = uma linha do horário (ex.: 45 min); uma aula de 90 min conta 2 tempos.':'Uma aula = tempos seguidos da mesma disciplina (ex.: um bloco de 90 min).'}</p>
    ${TT.length?`<div class="tblw"><table class="lst prev"><thead><tr><th>Turma</th><th class="num">Por Semana</th>${c.periodos.map(p=>`<th class="num">${p.n}.º ${W}</th>`).join('')}<th class="num">Total</th><th class="num">Dadas</th><th class="num">Faltas</th><th></th></tr></thead><tbody>
    ${gruposOferta(TT).map(g=>`${gruposOferta(TT).length>1?`<tr class="gr"><td colspan="${c.periodos.length+6}"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)}</td></tr>`:''}
      ${g.L.map(t=>{const r=aulasPrevistas(t,a);
      return r?`<tr class="clk" data-pv="${t.id}"><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}</span>${ofertaTag(t)}</div></div></td><td class="num">${U==='tempos'?r.semana:r.aulasSemana}</td>
        ${c.periodos.map(cp=>cel(r.P.find(p=>p.n===cp.n))).join('')}<td class="num"><b>${v(r.tot,'p')}</b></td><td class="num">${v(r.tot,'d')}</td><td class="num ${r.tot.tFaltas?'neg':''}">${r.tot.tFaltas?(U==='tempos'?r.tot.tFaltas:r.tot.faltas):'—'}</td><td class="act"><span class="chev">${ic('back',16)}</span></td></tr>`
      :`<tr><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}</span>${ofertaTag(t)}</div></div></td><td colspan="${c.periodos.length+4}" class="mut">Sem horário ou sem aulas reconhecidas desta disciplina.</td><td class="act"><button class="btn sm" data-hor="${t.id}">Horário</button></td></tr>`}).join('')}`).join('')}
    </tbody>${comR.length>1?`<tfoot><tr><td><b>Total</b></td><td class="num">${comR.reduce((s,x)=>s+(U==='tempos'?x.r.semana:x.r.aulasSemana),0)}</td>${c.periodos.map(cp=>`<td class="num"><b>${comR.reduce((s,x)=>{const p=x.r.P.find(p=>p.n===cp.n);return s+(p?v(p,'p'):0)},0)}</b></td>`).join('')}<td class="num"><b>${comR.reduce((s,x)=>s+v(x.r.tot,'p'),0)}</b></td><td class="num">${comR.reduce((s,x)=>s+v(x.r.tot,'d'),0)}</td><td class="num">${comR.reduce((s,x)=>s+(U==='tempos'?x.r.tot.tFaltas:x.r.tot.faltas),0)||'—'}</td><td></td></tr></tfoot>`:''}</table></div>`
    :'<div class="empty">Sem turmas neste ano letivo.</div>'}
  </div>`;
}
function prevDetalheDlg(t){
  const a=A(),c=a.calendario,r=aulasPrevistas(t,a);if(!r)return;const W=c.periodos.length===2?'semestre':'período';const hj=isoData(new Date());
  openDrawer(t.nome+' · '+t.disciplina,`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('calendar',14)} Aulas de ${esc(fmtIsoL(r.ini))} a ${esc(fmtIsoL(r.fim))} · ${r.semana} tempos por semana (${r.aulasSemana} aula${r.aulasSemana>1?'s':''})</p>
    ${r.P.map(p=>`<div class="pvp pcor ${hj>=p.ini&&hj<=p.fim?'on':''}" style="--pc:var(--p${p.n})">
      <div class="row"><h3 style="margin:0">${p.n}.º ${W}</h3><span class="sp1"></span><span class="mut">${esc(fmtIso(p.ini))} a ${esc(fmtIso(p.fim))}</span></div>
      <div class="pvn"><div><b>${p.tempos}</b><span>tempos previstos</span></div><div><b>${p.tDadas}</b><span>tempos dados</span></div><div class="${p.tFaltas?'fal':''}"><b>${p.tFaltas}</b><span>faltas (tempos)</span></div><div><b>${porDar(p)}</b><span>tempos por dar</span></div></div>
      ${p.faltas.length?`<div class="pvl"><div class="mut" style="margin-bottom:4px">Faltas do professor:</div>${p.faltas.map(f=>`<button type="button" class="pvx fx" data-fx="${f.id}"><span class="sw" style="background:var(--bad)"></span><b>${esc(fmtIsoL(f.data))}</b><span>${esc(f.motivo)}${f.obs?' · '+esc(f.obs):''}</span><span class="mut">${f.ft} t.</span></button>`).join('')}</div>`:''}
      <div class="pvd">${Object.entries(p.porDia).map(([d,n])=>`<span class="chip">${DIAS[d]}: ${n} tempos</span>`).join('')}</div>
      ${p.perdidas.length?`<div class="pvl"><div class="mut" style="margin-bottom:4px">Dias de aula sem atividades letivas (${p.perdidas.reduce((s,x)=>s+x.tempos,0)} tempos):</div>${p.perdidas.map(x=>`<div class="pvx"><span class="sw" style="background:${(TIPOS_DIA[x.tipo]||{}).cor||'var(--panel)'}"></span><b>${esc(fmtIsoL(x.iso))}</b><span>${esc(x.nota||nomeTipo(x.tipo))}</span><span class="mut">${x.tempos} t.</span></div>`).join('')}</div>`:''}
    </div>`).join('')}
    <div class="row" style="margin-top:12px"><button class="btn pri" id="pv-f">${ic('plus',15)} Registar Falta</button><button class="btn" id="pv-h">${ic('calendar',15)} Ver Horário da Turma</button></div></div>`);
  $('#pv-h').onclick=()=>{S.turmaAtiva=t.id;save();go('horario')};
  $('#pv-f').onclick=()=>faltaDlg(t,null,null,()=>{go(VIEW);prevDetalheDlg(t)});
  $$('[data-fx]').forEach(b=>b.onclick=()=>faltaDlg(t,null,b.dataset.fx,()=>{go(VIEW);prevDetalheDlg(t)}));
}
function exportPrevistas(){
  const a=A(),c=a.calendario;const W=c.periodos.length===2?'Semestre':'Período';
  const linhas=[['Turma','Disciplina','Oferta','Tempos/semana',...c.periodos.flatMap(p=>[p.n+'.º '+W+' (tempos)',p.n+'.º '+W+' (aulas)']),'Total tempos','Total aulas','Tempos dados']];
  turmasFiltradas(a).forEach(t=>{const r=aulasPrevistas(t,a);if(!r)return;linhas.push([t.nome,t.disciplina,OFERTAS[ofertaDe(t)].nome,r.semana,...c.periodos.flatMap(cp=>{const p=r.P.find(p=>p.n===cp.n);return p?[p.tempos,p.aulas]:['','']}),r.tot.tempos,r.tot.aulas,r.tot.tDadas])});
  download('Aulas previstas '+a.nome+'.csv','﻿'+linhas.map(l=>l.map(x=>{x=String(x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x}).join(';')).join('\r\n'),'text/csv;charset=utf-8');
}
/* ---------- dia: detalhe (toque num dia, sem modo de edição) ---------- */
function diaDlg(iso){
  const a=A(),c=a.calendario;const tp=c.dias[iso]||'nao';const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;const d=dataDeIso(iso);
  const per=(c.periodos.find(p=>iso>=p.ini&&iso<=p.fim)||{}).n;const W=c.periodos.length===2?'semestre':'período';
  const termo=(c.termos||[]).find(x=>x.data===iso);
  const aulas=[];turmasFiltradas(a).forEach(t=>blocos(aulasTurma(t,a)).filter(b=>b.dia===d.getDay()).forEach(b=>aulas.push({...b,t,ok:letivoPara(t,iso)})));
  aulas.sort((x,y)=>x.ini-y.ini);
  openDrawer(DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()+1]+' de '+d.getFullYear(),`<div class="ed">
    <div class="diah"><span class="sw lg ${tp==='nao'?'nao':''}" style="background:${T_.cor||''}"></span><div><b>${esc(T_.n)}</b><div class="mut">${per?per+'.º '+W:'Fora dos '+(W==='semestre'?'semestres':'períodos')}${(c.notas||{})[iso]?' · '+esc(c.notas[iso]):''}</div></div></div>
    ${termo?`<div class="alert">${ic('flag',15)} Termo das aulas: ${esc(anosTxt(termo.anos))}</div>`:''}
    <h3>As Suas Aulas Neste Dia</h3>
    ${aulas.length?aulas.map(x=>`<div class="lin ${x.ok?'':'off'}"><span class="hh">${fmtHM(x.ini)}–${fmtHM(x.fim)}</span><b>${esc(x.t.nome)}</b> ${esc(x.t.disciplina)}${x.sala?`<span class="mut">Sala ${esc(x.sala)}</span>`:''}<span class="sp1"></span>${x.ok?'':'<span class="tag">sem aula</span>'}</div>`).join(''):'<p class="mut">Sem aulas no horário neste dia da semana.</p>'}
    <h3>Alterar Este Dia</h3>
    <div class="cpin dd">${Object.keys(TIPOS_DIA).map(k=>`<button type="button" data-dt="${k}" class="${tp===k?'on':''}"><span class="sw ${k==='nao'?'nao':''}" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}</button>`).join('')}</div>
    <label>Nota</label><input id="dd-nota" value="${esc((c.notas||{})[iso]||'')}" placeholder="ex.: Visita de estudo, Reunião de avaliação…">
  </div>`);
  $$('#dw-b [data-dt]').forEach(b=>b.onclick=()=>{pintarDia(iso,b.dataset.dt);diaDlg(iso);vCalendario()});
  $('#dd-nota').onchange=e=>{c.notas=c.notas||{};const v=e.target.value.trim();if(v)c.notas[iso]=v;else delete c.notas[iso];save();vCalendario()};
}

