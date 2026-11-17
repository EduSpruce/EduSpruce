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

