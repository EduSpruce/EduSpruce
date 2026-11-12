/* =====================================================================
   ALUNOS
   ===================================================================== */
function vAlunos(){
  const t=T();const al=alunosTodos(t);const nf_=alunosAval(t).length;UI.alView=UI.alView||'lista';
  if(UI.alView==='fotos'&&al.length)return vFotos(t,al,nf_);
  if(UI.alView==='msai'&&al.length)return vMsai(t,al);
  setTimeout(()=>{if(VIEW==='alunos'&&$('#b-pdf')&&!$('#barx .dica'))$('#b-pdf').insertAdjacentHTML('afterend',dicaExcel())});
  barBtns([{id:'b-edt',t:ic('pencil',15)+' Editar Turma',f:()=>editarTurmaDlg(t)},{id:'b-pdf',t:'Importar Excel…',f:()=>pickPdf(r=>importDlg(r))},{id:'b-add',t:'+ Aluno',f:()=>{t.alunos.push(novoAluno(t));save();vAlunos()}},
    {id:'b-csv',t:'Exportar CSV',f:()=>download('Alunos '+t.nome+' '+t.disciplina+'.csv',csv([[...(t.origens?['Turma']:[]),'N.º','Processo','Nome','Sexo','Nascimento','Frequenta '+t.disciplina,'Repetente','ASE','EE','Contacto EE','Email','Observações'],...al.map(a=>[...(t.origens?[a.origem||'']:[]),a.num,a.processo,a.nome,a.genero,fmtD(a.nasc),a.frequenta?'Sim':'Não',a.repetente?'Sim':'',a.ase,a.eeNome,a.eeContacto,a.email,a.obs])]),'text/csv')}]);
  $('#view').innerHTML=`<div class="card wide">
    <div class="row" style="margin-bottom:8px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} <span class="nt" style="font-weight:400;font-size:14px;color:var(--mut)">${al.length} alunos · <span style="color:var(--acc);font-weight:600">${nf_} frequentam</span></span></h2>${t.origens?`<span class="tag">conjunta: ${esc(t.origens.join(' + '))}</span>${fontesTurmas(A()).some(x=>t.origens.includes(x.nome))?`<button class="btn sm" id="b-orig" title="Acrescenta alunos novos e atualiza fotos e fichas a partir das turmas originais">↻ Atualizar das turmas de origem</button>`:''}`:''}<span class="sp1"></span>
      ${al.length?fzBtns('l')+alTabs('lista'):''}</div>
    ${al.length?`<div class="deleg">${proxAulaHtml(t)}${proxAulaHtml(t)?'<span style="margin:0 10px;color:var(--line)">|</span>':''}${turmasDaClasse(t).filter(n=>dtDe(A(),n)||souDT(A(),n)).map(n=>'<span class="mut">'+tituloDT(souDT(A(),n)&&!dtDe(A(),n)?S.cfg.professor:dtDe(A(),n))+(turmasDaClasse(t).length>1?' do '+esc(n):'')+':</span> <b>'+(souDT(A(),n)?'Você'+(dtDe(A(),n)?' ('+esc(profNome(dtDe(A(),n)))+')':''):esc(profNome(dtDe(A(),n))))+'</b>'+(souDT(A(),n)?'':contEmailHtml(dtDe(A(),n)))).join(' <span style="margin:0 6px;color:var(--line)">|</span> ')}</div><div class="deleg">${delegadosResumo(t)}</div><p class="hint" style="margin:0 0 8px">Só os alunos assinalados em “Frequenta” aparecem nos instrumentos, na avaliação e nos relatórios desta disciplina.</p>
    <div style="overflow:auto"><table class="lst alst"><thead><tr><th class="c-fq"><label class="selall" title="Assinalar/desmarcar todos — frequenta esta disciplina"><input type="checkbox" id="f-allcb" ${al.every(a=>a.frequenta)?"checked":""}> <span>Freq.</span></label></th><th class="c-ft"><span class="sr">Fotografia</span></th>${t.origens?'<th>Turma</th>':''}<th class="c-n">N.º</th><th class="sens">Processo</th><th class="c-nm">Nome</th><th>Sexo</th><th class="sens">Nascimento</th><th class="sens c-id">Idade</th><th class="sens">Repet.</th><th class="sens">ASE</th><th class="sens">MSAI</th><th><span class="sr">Ações</span></th></tr></thead><tbody>
    ${al.map(a=>`<tr data-a="${a.id}" class="${a.frequenta?'':'off'}"><td class="keep c-fq"><input type="checkbox" data-k="frequenta" aria-label="Frequenta" ${a.frequenta?'checked':''}></td><td class="c-ft" style="cursor:pointer" data-fi="${a.id}">${avatar(a,S.cfg.alFotoSz||64)}</td>${t.origens?`<td><span class="tag">${esc(a.origem||'—')}</span></td>`:''}<td class="c-n"><input data-k="num" value="${esc(a.num)}" inputmode="numeric" aria-label="Número"></td><td class="sens"><input data-k="processo" value="${esc(a.processo)}"></td><td class="tdnome"><div class="nmcell"><span class="nmw" data-v="${esc(a.nome)}"><textarea data-k="nome" rows="1" spellcheck="false" aria-label="Nome">${esc(a.nome)}</textarea></span>${cargoTag(a,1)}</div></td>
      <td><select data-k="genero" style="min-width:64px"><option value="M" ${a.genero!=='F'?'selected':''}>M</option><option value="F" ${a.genero==='F'?'selected':''}>F</option></select></td>
      <td class="sens"><input type="date" data-k="nasc" style="min-width:118px" value="${esc(a.nasc)}"></td><td class="mut sens c-id">${idade(a.nasc)}</td>
      <td class="sens"><select data-k="repetente" style="min-width:72px"><option value="">Não</option><option value="1" ${a.repetente?'selected':''}>Sim</option></select></td>
      <td class="sens"><select data-k="ase" style="min-width:58px"><option value="">—</option>${['A','B','C'].map(x=>`<option ${a.ase===x?'selected':''}>${x}</option>`).join('')}</select></td>
      <td class="sens" style="font-size:12px">${msaiBadges(a)||'<span class="mut">—</span>'}</td>
      <td class="act keep"><div class="acts"><button class="btn sm" data-fi="${a.id}" aria-label="Ficha do aluno">${ic('idcard',14)}<span class="lb">Ficha</span></button><button class="btn sm ico dng" data-rm="${a.id}" title="Remover da turma" aria-label="Remover da turma">${ic('trash',14)}</button></div></td></tr>`).join('')}
    </tbody></table></div>`:`<div class="drop" id="al-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Também pode usar “Colar lista…” (copiar do Excel) ou “+ Aluno”.</span></div>`}
  </div>`;
  const dr=$('#al-drop');if(dr){dr.onclick=()=>pickPdf(r=>importDlg(r));dropZone(dr,r=>importDlg(r))}
  const bo=$('#b-orig');if(bo)bo.onclick=()=>atualizarDeOrigens(t);
  bindAlTabs();
  const fa=$('#f-allcb');if(fa){fa.indeterminate=al.some(a=>a.frequenta)&&!al.every(a=>a.frequenta);fa.onchange=()=>{t.alunos.forEach(a=>a.frequenta=fa.checked);save();vAlunos()}}
  $$('#view tr[data-a] [data-k]').forEach(el=>el.addEventListener('change',()=>{
    const a=t.alunos.find(x=>x.id===el.closest('tr').dataset.a);const k=el.dataset.k;
    if(k==='genero'){if(el.value==='auto'){a.generoManual=false;a.genero=guessGen(a.nome)}else{a.generoManual=true;a.genero=el.value}}
    else if(k==='nome')setNome(a,el.value);
    else a[k]=k==='repetente'?!!el.value:k==='frequenta'?el.checked:el.value;
    save();if(['num','nasc','nome','frequenta','genero'].includes(k))vAlunos();
  }));
  $$('#view tr[data-a]').forEach(tr=>longoToque(tr,(x,y)=>{const al=t.alunos.find(q=>q.id===tr.dataset.a);if(!al)return;const outras=A().turmas.filter(q=>q!==t);
    const mv=(dest,copiar)=>()=>{if(dest.alunos.some(q=>normT(q.nome)===normT(al.nome)))return toast(al.nome+' já está em '+dest.nome,'aviso');const c=JSON.parse(JSON.stringify(al));c.id=copiar?uid():al.id;dest.alunos.push(c);if(!copiar)t.alunos=t.alunos.filter(q=>q!==al);save();vAlunos();toast(al.nome+(copiar?' copiado para ':' movido para ')+dest.nome+' · '+dest.disciplina,'ok')};
    menuContexto(x,y,[{t:'Ficha do aluno',ic:'idcard',f:()=>fichaAluno(al.id)},'-',...outras.slice(0,6).map(d=>({t:'Mover para '+d.nome+' · '+d.disciplina,ic:'merge',f:mv(d,false)})),...outras.slice(0,6).map(d=>({t:'Copiar para '+d.nome+' · '+d.disciplina,ic:'copy',f:mv(d,true)})),'-',{t:'Remover da turma',ic:'trash',dng:true,f:()=>{const b=tr.querySelector('[data-rm]');if(b)b.click()}}])}));
  $$('[data-rm]').forEach(b=>b.onclick=()=>{const a=t.alunos.find(x=>x.id===b.dataset.rm);if(confirm('Remover '+a.nome+' da turma? As classificações deste aluno também são apagadas.\n\n(Se o aluno apenas não frequenta a disciplina, desmarque “Frequenta”.)')){t.alunos=t.alunos.filter(x=>x!==a);t.instrumentos.forEach(i=>delete i.notas[a.id]);save();vAlunos()}});
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
/* tamanho das fotografias (lista de alunos e quadro de fotografias) */
function fzBtns(k){if(k==='c'){const v=S.cfg.chFotoSz||72;return `<span class="fzb noprint" style="display:inline-flex;gap:4px;align-items:center;margin-right:8px"><button class="btn sm" data-fz="c-" title="Fotografias mais pequenas" aria-label="Fotografias mais pequenas" ${v<=40?'disabled':''}>−</button><button class="btn sm" data-fz="c+" title="Fotografias maiores" aria-label="Fotografias maiores" ${v>=200?'disabled':''}>+</button></span>`}const v=k==='l'?(S.cfg.alFotoSz||64):(S.cfg.alFotoGr||225);return `<span class="fzb noprint" style="display:inline-flex;gap:4px;align-items:center;margin-right:8px"><button class="btn sm" data-fz="${k}-" title="Fotografias mais pequenas" aria-label="Fotografias mais pequenas" ${v<=(k==='l'?34:140)?'disabled':''}>−</button><button class="btn sm" data-fz="${k}+" title="Fotografias maiores" aria-label="Fotografias maiores" ${v>=(k==='l'?160:420)?'disabled':''}>+</button></span>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fz]');if(!b)return;const k=b.dataset.fz[0],up=b.dataset.fz[1]==='+';
  if(k==='c'){S.cfg.chFotoSz=Math.max(40,Math.min(200,(S.cfg.chFotoSz||72)+(up?16:-16)));save();return vAula()}
  if(k==='l')S.cfg.alFotoSz=Math.max(34,Math.min(160,(S.cfg.alFotoSz||64)+(up?16:-16)));else S.cfg.alFotoGr=Math.max(140,Math.min(420,(S.cfg.alFotoGr||225)+(up?40:-40)));
  save();vAlunos()});
function vFotos(t,al,nf_){
  barBtns([{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const semFoto=al.filter(a=>!a.foto).length;
  $('#view').innerHTML=`<div class="card wide">
    <div class="row noprint" style="margin-bottom:12px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} — fotografias</h2><span class="sp1"></span>
      ${fzBtns('g')}${alTabs('fotos')}</div>
    <div style="text-align:center;margin-bottom:12px"><b style="font-size:16px">${esc(escolaDe(t).escola||'')}</b><br>Turma ${esc(t.nome)} · Ano letivo ${esc((A()||{}).nome||'')}</div>
    <div class="deleg" style="justify-content:center">${delegadosResumo(t)}</div>
    ${semFoto?`<p class="hint noprint">${semFoto} aluno${semFoto>1?'s':''} sem foto — clique num aluno para adicionar a fotografia. Alunos esbatidos não frequentam ${esc(t.disciplina)}.</p>`:''}
    <div class="fotos fotosr" style="grid-template-columns:repeat(auto-fill,minmax(min(${S.cfg.alFotoGr||225}px,100%),1fr))">${al.map(a=>`<div class="fcard ${a.frequenta?'':'off'}" data-fi="${a.id}"><div class="ph">${avatar(a,200)}</div><small>${t.origens&&a.origem?esc(a.origem)+' · ':''}${esc(numAl(a))}${a.processo?' ('+esc(a.processo)+')':''}</small><b>${esc(a.nome)}</b>${cargoTag(a)}</div>`).join('')}</div></div>`;
  bindAlTabs();
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
function alTabs(cur){return `<div class="tabs noprint" style="margin:0">${[['lista','list','Lista'],['fotos','image','Fotografias'],['msai','access','Quadro MSAI']].map(([k,i,l])=>`<button data-alv="${k}" class="${k===cur?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div>`}
function bindAlTabs(){$$('[data-alv]').forEach(b=>b.onclick=()=>{UI.alView=b.dataset.alv;vAlunos()})}
/* quadro MSAI da turma: alunos × medidas (quadro em ecrãs largos, cartões em ecrãs estreitos) */
/* ===================== PDF simples (sem bibliotecas): texto, linhas, retângulos e logotipo JPEG ===================== */
const WIN={0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};
function pdfStr(s){let o='';for(const ch of String(s).replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/[✓✔]/g,'v').replace(/[★☆]/g,'*').replace(/[←]/g,'<-')){let c=ch.codePointAt(0);if(c===0x200B)continue;if(c>255)c=WIN[c]||(c===0x2192?0x3E:0x3F);const x=String.fromCharCode(c);o+=x==='('||x===')'||x==='\\'?'\\'+x:x}return '('+o+')'}
const _pdfCtx=(()=>{let c=null;return ()=>c||(c=document.createElement('canvas').getContext('2d'))})();
function pdfW(s,sz,b){const c=_pdfCtx();c.font=(b?'bold ':'')+'100px Helvetica, Arial, sans-serif';return c.measureText(String(s)).width/100*sz}
function pdfWrap(s,w,sz,b){const out=[];String(s||'').split('\n').forEach(par=>{let l='';par.split(/\s+/).filter(Boolean).forEach(word=>{const t=l?l+' '+word:word;if(pdfW(t,sz,b)<=w||!l)l=t;else{out.push(l);l=word}});out.push(l)});return out}
function corPdf(hex){let h=hex.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>(parseInt(h.substr(i,2),16)/255).toFixed(3)).join(' ')}
class MiniPDF{constructor(w,h){this.W=w;this.H=h;this.pages=[];this.img=null;this.nova()}
  nova(){this.cur=[];this.pages.push(this.cur)}
  txt(x,y,s,sz,o){o=o||{};this.cur.push(`BT /${o.b?'F2':'F1'} ${sz} Tf ${o.cor?corPdf(o.cor)+' rg ':'0.1 0.1 0.12 rg '}${x.toFixed(2)} ${(this.H-y).toFixed(2)} Td ${o.tw?o.tw.toFixed(3)+' Tw ':''}${pdfStr(s)} Tj ${o.tw?'0 Tw ':''}ET`)}
  rect(x,y,w,h,cor,stroke){this.cur.push(`${stroke?corPdf(stroke)+' RG 0.6 w ':''}${cor?corPdf(cor)+' rg ':''}${x.toFixed(2)} ${(this.H-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${cor&&stroke?'B':cor?'f':'S'}`)}
  linha(x1,y1,x2,y2,cor,lw){this.cur.push(`${corPdf(cor||'#c8ccd2')} RG ${lw||0.5} w ${x1.toFixed(2)} ${(this.H-y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.H-y2).toFixed(2)} l S`)}
  imagem(x,y,w,h){if(this.img)this.cur.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${(this.H-y-h).toFixed(2)} cm /Im1 Do Q`)}
  bytes(){const enc=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b};const parts=[];let off=0;const offs=[];
    const push=s=>{const b=typeof s==='string'?enc(s):s;parts.push(b);off+=b.length};
    const objs=[];const add=o=>{objs.push(o);return objs.length};
    const cat=add(null),pgs=add(null),f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    let im=0;if(this.img)im=add({img:this.img});
    const kids=this.pages.map(p=>{const st=p.join('\n');const c=add({stream:st});return add(`<< /Type /Page /Parent ${pgs} 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >>${im?` /XObject << /Im1 ${im} 0 R >>`:''} >> /Contents ${c} 0 R >>`)});
    objs[cat-1]=`<< /Type /Catalog /Pages ${pgs} 0 R >>`;objs[pgs-1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    objs.forEach((o,i)=>{offs.push(off);push(`${i+1} 0 obj\n`);
      if(o&&o.stream!=null){const b=enc(o.stream);push(`<< /Length ${b.length} >>\nstream\n`);push(b);push('\nendstream')}
      else if(o&&o.img){push(`<< /Type /XObject /Subtype /Image /Width ${o.img.w} /Height ${o.img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${o.img.data.length} >>\nstream\n`);push(o.img.data);push('\nendstream')}
      else push(o);push('\nendobj\n')});
    const x=off;push(`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`);
    const out=new Uint8Array(off);let p=0;parts.forEach(b=>{out.set(b,p);p+=b.length});return out}}
function logoJpeg(src){return new Promise(ok=>{if(!src)return ok(null);const im=new Image();im.onload=()=>{try{const k=Math.min(1,240/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);
  const b=atob(c.toDataURL('image/jpeg',.9).split(',')[1]);const d=new Uint8Array(b.length);for(let i=0;i<b.length;i++)d[i]=b.charCodeAt(i);ok({w:c.width,h:c.height,data:d})}catch(_){ok(null)}};im.onerror=()=>ok(null);im.src=src})}
/* ---------- PDF das MSAI (turma ou um aluno) ---------- */
async function exportarMsaiPdf(t,alunos,opts){opts=opts||{};const a=A();const c={...S.cfg,...escolaDe(t)};ocupado&&ocupado('A preparar o PDF…');
  try{const pdf=new MiniPDF(842,595);pdf.img=await logoJpeg(c.logo);const M=36,LW=842-2*M;let y=M;
    const temM=x=>Object.keys(MEDIDAS).some(k=>(x.medidas&&x.medidas[k]||[]).length)||(x.acomod||[]).length||Object.values(x.docs||{}).some(d=>d&&d.on);
    const L=alunos.filter(x=>opts.todos||temM(x));const sem=alunos.filter(x=>!temM(x));
    const cab=()=>{y=M;if(pdf.img){const h=34,w=h*pdf.img.w/pdf.img.h;pdf.imagem(M,y,Math.min(w,90),h)}const xo=pdf.img?M+Math.min(34*pdf.img.w/pdf.img.h,90)+10:M;
      pdf.txt(xo,y+12,c.escola||'',11,{b:true});pdf.txt(xo,y+26,[c.agrupamento,'Ano letivo '+((a||{}).nome||'')].filter(Boolean).join(' · '),8.5,{cor:'#555b66'});
      const dir=t.disciplina+' · Turma '+(t.origens?t.origens.join(' + '):t.nome);pdf.txt(842-M-pdfW(dir,9,true),y+12,dir,9,{b:true});const pr=c.professor?profNome(c.professor):'';pdf.txt(842-M-pdfW(pr,8.5),y+26,pr,8.5,{cor:'#555b66'});
      y+=44;pdf.linha(M,y,842-M,y,'#1b5fbf',1.2);y+=8};
    cab();
    const tit=opts.titulo||('Medidas de Suporte à Aprendizagem e à Inclusão');pdf.txt(M,y+16,tit,15,{b:true});
    pdf.txt(M,y+30,'Decreto-Lei n.º 54/2018 · '+(alunos.length===1?alunos[0].nome:alunos.length+' alunos, '+L.filter(temM).length+' com medidas')+' · emitido a '+new Date().toLocaleDateString('pt-PT'),8.5,{cor:'#555b66'});y+=42;
    // resumo por tipo de medida
    if(alunos.length>1){const G=Object.entries(MEDIDAS);const bw=(LW-(G.length-1)*8)/G.length;G.forEach(([k,g],i)=>{const n=alunos.filter(x=>(x.medidas&&x.medidas[k]||[]).length).length;const x=M+i*(bw+8);
      pdf.rect(x,y,bw,34,'#f4f6f9','#dde1e7');pdf.rect(x,y,4,34,g.cor);pdf.txt(x+12,y+14,g.t.replace('Adaptações ao processo de avaliação','Adaptações à avaliação').replace('Recursos específicos de apoio','Recursos específicos'),8,{cor:'#555b66'});pdf.txt(x+12,y+28,String(n)+(n===1?' aluno':' alunos'),11,{b:true})});y+=46}
    // tabela
    const cols=[{k:'n',t:'N.º',w:26},{k:'nome',t:'Aluno',w:118}];const rest=LW-26-118;const grupos=['univ','selet','adic','aval','rec'];
    const ws=[0.2,0.19,0.19,0.22,0.2];grupos.forEach((k,i)=>cols.push({k,t:MEDIDAS[k].t.replace('Adaptações ao processo de avaliação','Adaptações à avaliação').replace('Recursos específicos de apoio','Recursos e documentos'),w:rest*ws[i],cor:MEDIDAS[k].cor}));
    const FS=7.6,LH=9.6,PAD=5;
    const cabTab=()=>{let x=M;pdf.rect(M,y,LW,20,'#1f2937');cols.forEach(cl=>{if(cl.cor)pdf.rect(x,y,cl.w,3,cl.cor);pdfWrap(cl.t,cl.w-2*PAD,7.5,true).slice(0,2).forEach((l,i)=>pdf.txt(x+PAD,y+(cl.t.length>24?10:13)+i*8,l,7.5,{b:true,cor:'#ffffff'}));x+=cl.w});y+=20};
    const rodape=()=>{};
    cabTab();
    L.forEach((al,ri)=>{const m=al.medidas||{},ob=al.medObs||{};
      const cel={n:[String(al.num||'')],nome:pdfWrap(al.nome+(al.origem&&t.origens?' ('+al.origem+')':''),118-2*PAD,FS+.4,true)};
      grupos.forEach(k=>{const g=MEDIDAS[k];let it=(m[k]||[]).slice().sort((p,q)=>p-q).map(i=>'• '+g.l[i]);
        if(k==='univ'&&(al.acomod||[]).length)it.push('Acomodações: '+al.acomod.slice().sort((p,q)=>p-q).map(i=>ACOMOD[i]).join('; '));
        if(k==='rec'){DOCS.forEach((d,i)=>{if(al.docs&&al.docs[i]&&al.docs[i].on)it.push('› '+d)})}
        const o=ob[k]&&Object.values(ob[k]).filter(Boolean).join('; ');if(o)it.push('Obs.: '+o);
        const cw=cols.find(c=>c.k===k).w-2*PAD;cel[k]=it.length?it.flatMap(s=>pdfWrap(s,cw,FS).map((l,i)=>s.startsWith('Obs.:')&&i?'\u200b'+l:l)):['—']});
      const nl=Math.max(...Object.values(cel).map(v=>v.length));const h=nl*LH+2*PAD;
      if(y+h>595-M-16){pdf.nova();cab();cabTab()}
      if(ri%2)pdf.rect(M,y,LW,h,'#f7f8fa');let x=M;
      cols.forEach(cl=>{(cel[cl.k]||[]).forEach((l,i)=>pdf.txt(x+PAD,y+PAD+FS+i*LH,l,cl.k==='nome'?FS+.4:FS,{b:cl.k==='nome'||cl.k==='n',cor:l==='—'?'#9aa1ab':l.startsWith('Obs.:')||l.startsWith('\u200b')?'#5b6b7f':null}));x+=cl.w;if(x<M+LW-1)pdf.linha(x,y,x,y+h,'#e3e6ea')});
      y+=h;pdf.linha(M,y,M+LW,y,'#d5d9df')});
    if(!L.length){pdf.txt(M,y+18,'Nenhum aluno com medidas registadas.',10,{cor:'#555b66'});y+=28}
    if(alunos.length>1&&sem.length&&!opts.todos){const s='Sem medidas registadas: '+sem.map(x=>x.num?x.num+'.':'').filter(Boolean).join(' ')+(sem.length?' ('+sem.length+' alunos)':'');const ls=pdfWrap(s,LW,8);if(y+ls.length*10+20>595-M-16){pdf.nova();cab()}y+=14;ls.forEach(l=>{pdf.txt(M,y,l,8,{cor:'#555b66'});y+=10})}
    // assinaturas e rodapé
    if(y+60>595-M-16){pdf.nova();cab()}y=Math.max(y+40,595-M-56);pdf.linha(M,y,M+220,y,'#888');pdf.linha(842-M-220,y,842-M,y,'#888');
    pdf.txt(M,y+12,profRotulo()+(c.professor?' — '+profNome(c.professor):''),8,{cor:'#555b66'});pdf.txt(842-M-220,y+12,(t=>{const d=dtDe(a,turmasDaClasse(t)[0]);return (d?(guessGen(d)==='F'?'A ':'O '):'O(A) ')+tituloDT(d)+(d?' — '+d:'')})(t),8,{cor:'#555b66'});
    const N=pdf.pages.length;pdf.pages.forEach((p,i)=>{pdf.cur=p;pdf.linha(M,595-24,842-M,595-24,'#e3e6ea');pdf.txt(M,595-14,'Documento confidencial — contém dados pessoais e de saúde/educação especial (RGPD). Não divulgar.',7,{cor:'#8a909a'});const pg='Página '+(i+1)+' de '+N;pdf.txt(842-M-pdfW(pg,7),595-14,pg,7,{cor:'#8a909a'})});
    const nome=(opts.ficheiro||('MSAI '+t.nome+' '+t.disciplina)).replace(/[\\/:*?"<>|]/g,'-')+'.pdf';
    download(nome,pdf.bytes(),'application/pdf');regista('Exportação','MSAI (PDF)',nome);toast('PDF das MSAI exportado','ok')}
  catch(e){console.error(e);alert('Não foi possível criar o PDF: '+e.message)}finally{livre&&livre()}}

function vMsai(t,al){
  UI.msaiSo=UI.msaiSo!==false;UI.msaiUso=UI.msaiUso!==false;
  barBtns([{id:'b-mpdf',t:ic('file',15)+' Exportar PDF',c:'pri',f:()=>exportarMsaiPdf(t,al)},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}},
    {id:'b-csv',t:'Exportar CSV',f:()=>download('MSAI '+t.nome+'.csv',csv([[...(t.origens?['Turma']:[]),'N.º','Nome',...Object.values(MEDIDAS).flatMap(g=>g.l.map((x,i)=>g.ab+' '+String.fromCharCode(97+i)+') '+x)),'Acomodações',...DOCS],...al.map(a=>[...(t.origens?[a.origem||'']:[]),a.num,a.nome,...Object.entries(MEDIDAS).flatMap(([k,g])=>g.l.map((x,i)=>(a.medidas&&a.medidas[k]||[]).includes(i)?'X':'')),(a.acomod||[]).map(i=>i+1).join(', '),...DOCS.map((d,i)=>(a.docs&&a.docs[i]&&a.docs[i].on)?'X':'')])]),'text/csv')}]);
  const has=(a,k,i)=>(a.medidas&&a.medidas[k]||[]).includes(i);
  const temM=a=>Object.keys(MEDIDAS).some(k=>(a.medidas&&a.medidas[k]||[]).length)||(a.acomod||[]).length||Object.values(a.docs||{}).some(d=>d&&d.on);
  const L=UI.msaiSo?al.filter(temM):al;const nCom=al.filter(temM).length;
  const largura=($('#view').clientWidth||1000);const modo=UI.msaiModo||(largura<900?'cartoes':'quadro');
  // colunas: só medidas em uso (por algum aluno da lista) ou todas
  const G=Object.entries(MEDIDAS).map(([k,g])=>({k,g,cols:g.l.map((x,i)=>({i,x})).filter(c=>!UI.msaiUso||L.some(a=>has(a,k,c.i)))})).filter(x=>x.cols.length);
  const DC=DOCS.map((d,i)=>({i,ab:(d.match(/\((\w+)\)/)||[])[1]||d})).filter(d=>!UI.msaiUso||L.some(a=>a.docs&&a.docs[d.i]&&a.docs[d.i].on));
  const usaAc=!UI.msaiUso||L.some(a=>(a.acomod||[]).length);
  const numA=a=>(t.origens&&a.origem?esc(a.origem.split(' ').pop())+' ':'')+esc(numAl(a));
  const quadro=()=>`<div class="mxw"><table class="mx"><thead>
      <tr><th rowspan="2" class="stc0">N.º</th><th rowspan="2" class="stc1" style="text-align:left">Nome</th>${G.map(({k,g,cols})=>`<th colspan="${cols.length}" class="gh" style="background:${g.cor}" title="${esc(tcap(g.t))}">${esc(cols.length<=2?({univ:'Universais',selet:'Seletivas',adic:'Adicionais',aval:'Avaliação',rec:'Recursos'})[k]||tcap(g.t):tcap(g.t))}<div>${esc(g.art.replace(/^art/,'Art'))}</div></th>`).join('')}${usaAc?'<th rowspan="2" class="v acc"><div>Acomodações</div></th>':''}${DC.map(d=>`<th rowspan="2" class="v dc"><div>${esc(d.ab)}</div></th>`).join('')}</tr>
      <tr>${G.map(({g,cols})=>cols.map(c=>`<th class="v" style="--gc:${g.cor}"><div><b>${String.fromCharCode(97+c.i)})</b> ${esc(c.x)}</div></th>`).join('')).join('')}</tr></thead><tbody>
      ${L.map(a=>`<tr data-fi="${a.id}"><td class="stc0">${numA(a)}</td><td class="nm stc1">${esc(a.nome)}${cargoTag(a)}</td>
        ${G.map(({k,g,cols})=>cols.map(c=>{const on=has(a,k,c.i);return `<td class="${on?'x':''}" style="${on?'background:'+g.cor:''}">${on?'✓':''}</td>`}).join('')).join('')}
        ${usaAc?`<td class="ac">${esc((a.acomod||[]).map(i=>i+1).join(', '))}</td>`:''}${DC.map(d=>`<td>${a.docs&&a.docs[d.i]&&a.docs[d.i].on?'✓':''}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  const cartoes=()=>`<div class="mscards">${L.map(a=>{const sec=Object.entries(MEDIDAS).map(([k,g])=>({g,l:g.l.map((x,i)=>({x,i})).filter(c=>has(a,k,c.i))})).filter(s=>s.l.length);
      const docs=DOCS.filter((d,i)=>a.docs&&a.docs[i]&&a.docs[i].on).map(d=>(d.match(/\((\w+)\)/)||[])[1]||d);
      return `<button class="mscard" data-fi="${a.id}"><div class="msh"><span class="n">${numA(a)}</span><b>${esc(a.nome)}</b>${cargoTag(a)}<span class="sp1"></span>${docs.map(d=>`<span class="tag">${esc(d)}</span>`).join(' ')}</div>
        ${sec.map(s=>`<div class="mss" style="--gc:${s.g.cor}"><div class="mst">${esc(tcap(s.g.t))} <span>${esc(s.g.art.replace(/^art/,'Art'))}</span></div><ul>${s.l.map(c=>`<li><b>${String.fromCharCode(97+c.i)})</b> ${esc(c.x)}</li>`).join('')}</ul></div>`).join('')}
        ${(a.acomod||[]).length?`<div class="mss" style="--gc:#5b6b7f"><div class="mst">Acomodações Curriculares</div><ul>${a.acomod.map(i=>`<li><b>${i+1}.</b> ${esc(ACOMOD[i])}</li>`).join('')}</ul></div>`:''}
        ${!sec.length&&!(a.acomod||[]).length&&!docs.length?'<div class="mut">Sem medidas assinaladas.</div>':''}</button>`}).join('')}</div>`;
  $('#view').innerHTML=`<div class="card wide">
    <div class="row" style="margin-bottom:10px"><h2 style="margin:0">${ic('access')} Quadro MSAI — ${esc(t.nome)}</h2><span class="mut">${nCom} aluno${nCom===1?'':'s'} com medidas</span><span class="sp1"></span>${alTabs('msai')}</div>
    <div class="row msopt noprint">
      <div class="seg" id="ms-modo"><button type="button" data-mm="quadro" class="${modo==='quadro'?'on':''}">${ic('grid',15)} Quadro</button><button type="button" data-mm="cartoes" class="${modo==='cartoes'?'on':''}">${ic('list',15)} Por Aluno</button></div>
      <label class="chk"><input type="checkbox" id="ms-so" ${UI.msaiSo?'checked':''}> Só alunos com medidas</label>
      ${modo==='quadro'?`<label class="chk"><input type="checkbox" id="ms-uso" ${UI.msaiUso?'checked':''}> Só medidas em uso</label>`:''}</div>
    ${L.length?(modo==='quadro'?(G.length||usaAc||DC.length?quadro():'<div class="empty">Nenhuma medida assinalada nestes alunos.</div>'):cartoes()):'<div class="empty">Nenhum aluno com medidas assinaladas. Abra a ficha de um aluno → separador MSAI.</div>'}
    <p class="hint">Toque num aluno para abrir a ficha.${modo==='quadro'&&usaAc?' Acomodações: '+ACOMOD.map((x,i)=>(i+1)+'. '+esc(x)).join(' · '):''}</p></div>`;
  const tr1=$('.mxw thead tr');if(tr1)$('.mxw').style.setProperty('--h1',tr1.offsetHeight+'px');
  bindAlTabs();$('#ms-so').onchange=e=>{UI.msaiSo=e.target.checked;vAlunos()};
  const u=$('#ms-uso');if(u)u.onchange=e=>{UI.msaiUso=e.target.checked;vAlunos()};
  $$('[data-mm]').forEach(b=>b.onclick=()=>{UI.msaiModo=b.dataset.mm;vAlunos()});
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi,'msai'));
}
function medidasTxt(a){const m=a.medidas||{};return Object.entries(MEDIDAS).filter(([k])=>(m[k]||[]).length).map(([k,g])=>g.ab+'('+m[k].length+')').join(' ')}
function msaiBadges(a){const m=a.medidas||{};const b=Object.entries(MEDIDAS).filter(([k])=>(m[k]||[]).length).map(([k,g])=>`<span class="mb" style="background:${g.cor}" title="${esc(g.t)}: ${esc(m[k].map(i=>String.fromCharCode(97+i)+') '+g.l[i]).join('; '))}">${g.ab} ${m[k].map(i=>String.fromCharCode(97+i)).join('')}</span>`);
  if((a.acomod||[]).length)b.push(`<span class="mb" style="background:#5b6b7f" title="Acomodações: ${esc(a.acomod.map(i=>(i+1)+'. '+ACOMOD[i]).join('; '))}">Ac ${a.acomod.length}</span>`);
  return b.join(' ')}
function importDlg(r){
  const t=T();
  openDrawer('Importar alunos — '+(r.ficheiro||'Excel'),`<div class="ed">
    ${infoLeitura(r)}
    ${r.turma&&(r.turmas||[]).length<2&&r.turma!==t.nome?`<div class="alert w">O ficheiro parece ser da turma <b>${esc(r.turma)}</b> e está a importar para <b>${esc(t.nome)}</b>.</div>`:''}
    ${diffAlunos(t,r)}${tabelaPreview(r.alunos,r.turmas)}${textoLido(r)}
    ${r.alunos.length?`<label class="chk" style="margin-top:10px"><input type="radio" name="md" value="juntar" checked> Juntar aos alunos atuais (os que já existem com o mesmo nome são atualizados)</label>
    <label class="chk"><input type="radio" name="md" value="subst"> Substituir a lista atual (apaga as classificações dos alunos removidos)</label>
    <div class="row" style="margin-top:10px"><button class="btn pri" id="im-ok">Importar</button></div>`:''}</div>`);
  bindPreview();
  const st=$('#prev-t');if(st&&(r.turmas||[]).includes(t.nome)){st.value=t.nome;st.dispatchEvent(new Event('change'))}
  const ok=$('#im-ok');if(ok)ok.onclick=()=>{
    const rows=previewRows();const subst=document.querySelector('input[name=md]:checked').value==='subst';
    const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
    let novos=0,atual=0;const keep=new Set();
    rows.forEach(p=>{const ex=t.alunos.find(a=>norm(a.nome)===norm(p.nome)||(p.processo&&a.processo===p.processo));
      if(ex){if(p.generoManual||!ex.generoManual){ex.genero=p.genero;ex.generoManual=!!p.generoManual}Object.assign(ex,{num:p.num,processo:p.processo||ex.processo,nasc:p.nasc||ex.nasc,foto:p.foto||ex.foto||''});keep.add(ex.id);atual++}
      else{const a=Object.assign(novoAluno(t,p.nome),{num:p.num,processo:p.processo,genero:p.genero,generoManual:!!p.generoManual,nasc:p.nasc,frequenta:p.frequenta,foto:p.foto||''});t.alunos.push(a);keep.add(a.id);novos++}});
    if(subst){const rm=t.alunos.filter(a=>!keep.has(a.id));if(rm.length&&!confirm('Vão ser removidos '+rm.length+' alunos que não estão no ficheiro. Continuar?'))return;t.alunos=t.alunos.filter(a=>keep.has(a.id));rm.forEach(a=>t.instrumentos.forEach(i=>delete i.notas[a.id]))}
    regista('Alunos (Excel)',r.ficheiro,t.nome+': '+novos+' novos, '+atual+' atualizados');save();closeDrawer();vAlunos();toast(novos+' novos, '+atual+' atualizados','ok');
  };
}
function fichaAluno0(id,tab){
  const t=T(),a=t.alunos.find(x=>x.id===id);a.medidas=a.medidas||{};a.medObs=a.medObs||{};a.acomod=a.acomod||[];a.docs=a.docs||{};
  UI.fichaTab=tab||UI.fichaTab||'geral';const turmaA=a.origem||t.nome;
  const nMed=Object.keys(MEDIDAS).reduce((n,k)=>n+(a.medidas[k]||[]).length,0)+a.acomod.length;
  const linhaM=(k,g,x,i)=>{const on=(a.medidas[k]||[]).includes(i);return `<tr class="${on?'on':''}"><td class="ck"><input type="checkbox" data-m="${k}" value="${i}" ${on?'checked':''}></td><td class="al">${String.fromCharCode(97+i)})</td><td>${esc(x)}</td><td class="ob"><input data-mo="${k}:${i}" value="${esc((a.medObs[k]||{})[i]||'')}" placeholder="disciplinas, horário, observações…"></td></tr>`};
  const sec=(g,extra)=>`<tr class="sec" style="--c:${g.cor}"><td colspan="4"><span class="mb" style="background:${g.cor}">${g.ab}</span> ${esc(g.t)}<span class="art">${esc(g.art)}</span>${extra||''}</td></tr>`;
  openDrawer(a.num+'. '+a.nome,`<div class="ed">
    <div class="row" style="align-items:flex-start;margin-bottom:10px"><div id="fa-ph">${avatar(a,150)}</div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
      <b style="font-size:16px">${esc(a.nome)}</b><span class="mut">Turma ${esc(turmaA)} · N.º ${esc(numAl(a))}${a.processo?' · processo '+esc(a.processo):''}</span>
      <div class="row" style="gap:6px"><button class="btn sm" id="fa-up">${a.foto?'Alterar fotografia':'Adicionar fotografia'}</button>${a.foto?'<button class="btn sm dng" id="fa-rm">Remover fotografia</button>':''}<input type="file" id="fa-f" accept="image/*" hidden></div>
      <div id="fa-bd">${msaiBadges(a)}</div></div></div>
    <div class="tabs"><button data-ft="geral" class="${UI.fichaTab==='geral'?'on':''}">Dados</button><button data-ft="msai" class="${UI.fichaTab==='msai'?'on':''}">MSAI${nMed?' ('+nMed+')':''}</button></div>
    ${UI.fichaTab==='geral'?`
    <div class="g2"><div><label>Sexo</label><select id="fa-gen"><option value="M" ${a.genero!=='F'?'selected':''}>Masculino</option><option value="F" ${a.genero==='F'?'selected':''}>Feminino</option></select></div>
      <div><label>Cargo na turma ${esc(turmaA)}</label><select id="fa-cargo"><option value="">—</option><option value="D" ${a.cargo==='D'?'selected':''}>${a.genero==='F'?'Delegada':'Delegado'} de turma</option><option value="SD" ${a.cargo==='SD'?'selected':''}>${a.genero==='F'?'Subdelegada':'Subdelegado'} de turma</option></select></div></div>
    <label class="chk" style="font-size:14px"><input type="checkbox" data-fq ${a.frequenta?'checked':''}> Frequenta ${esc(t.disciplina)}</label>
    <h3>Encarregado de educação</h3>
    <div class="g2"><div><label>Nome</label><input data-f="eeNome" value="${esc(a.eeNome)}"></div><div><label>Contacto</label><input data-f="eeContacto" value="${esc(a.eeContacto)}"></div></div>
    <div class="g2"><div><label>Endereço eletrónico</label><input data-f="email" value="${esc(a.email)}"></div></div>
    <h3>Observações</h3><textarea data-f="obs">${esc(a.obs)}</textarea>`
    :`<p class="hint" style="margin-top:0">Medidas de Suporte à Aprendizagem e à Inclusão (DL n.º 54/2018). Assinale as medidas aplicadas e, se quiser, indique as disciplinas ou observações.</p>
    <table class="msai"><tbody>
      <tr class="sec" style="--c:#0a5aa8"><td colspan="4">${ic('file')} Documentos</td></tr>
      ${DOCS.map((d,i)=>{const o=a.docs[i]||{};return `<tr class="${o.on?'on':''}"><td class="ck"><input type="checkbox" data-doc="${i}" ${o.on?'checked':''}></td><td class="al"></td><td>${esc(d)}</td><td class="ob"><input data-docd="${i}" value="${esc(o.obs||'')}" placeholder="data / observações"></td></tr>`}).join('')}
      ${Object.entries(MEDIDAS).map(([k,g])=>sec(g)+g.l.map((x,i)=>linhaM(k,g,x,i)).join('')+(k==='univ'?`<tr class="sec" style="--c:#5b6b7f"><td colspan="4"><span class="mb" style="background:#5b6b7f">Ac</span> Acomodações curriculares<span class="art">art. 8.º, n.º 2, b)</span></td></tr>
        ${ACOMOD.map((x,i)=>{const on=a.acomod.includes(i);return `<tr class="${on?'on':''}"><td class="ck"><input type="checkbox" data-ac value="${i}" ${on?'checked':''}></td><td class="al">${i+1}</td><td colspan="2">${esc(x)}</td></tr>`}).join('')}`:'')).join('')}
    </tbody></table>`}
  </div>`);
  const refr=()=>{save();fichaAluno(id);if(VIEW==='alunos')vAlunos()};
  $$('#dw-b table.msai tbody tr:not(.sec)').forEach(tr=>tr.addEventListener('click',e=>{if(e.target.closest('input'))return;const cb=tr.querySelector('input[type=checkbox]');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'))}}));
  const marca=el=>{el.closest('tr').classList.toggle('on',el.checked);const bd=$('#fa-bd');if(bd)bd.innerHTML=msaiBadges(a);save();if(VIEW==='alunos')vAlunos()};
  $$('[data-ft]').forEach(b=>b.onclick=()=>fichaAluno(id,b.dataset.ft));
  $('#fa-up').onclick=()=>$('#fa-f').click();
  $('#fa-f').onchange=e=>{const f=e.target.files[0];if(f)fotoDeFicheiro(f).then(u=>{a.foto=u;refr()}).catch(er=>alert(er.message))};
  const rmf=$('#fa-rm');if(rmf)rmf.onclick=()=>{a.foto='';refr()};
  const fg=$('#fa-gen');if(fg)fg.onchange=()=>{if(fg.value==='auto'){a.generoManual=false;a.genero=guessGen(a.nome)}else{a.generoManual=true;a.genero=fg.value}refr()};
  const fc=$('#fa-cargo');if(fc)fc.onchange=()=>{definirCargo(t,a,fc.value);refr()};
  const fq=$('#dw-b [data-fq]');if(fq)fq.onchange=e=>{a.frequenta=e.target.checked;save();if(VIEW==='alunos')vAlunos()};
  $$('#dw-b [data-f]').forEach(el=>el.oninput=()=>{a[el.dataset.f]=el.value;save()});
  $$('#dw-b [data-m]').forEach(el=>el.onchange=()=>{const k=el.dataset.m,i=+el.value;a.medidas[k]=(a.medidas[k]||[]).filter(x=>x!==i);if(el.checked)a.medidas[k].push(i);a.medidas[k].sort();propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-mo]').forEach(el=>el.oninput=()=>{const [k,i]=el.dataset.mo.split(':');a.medObs[k]=a.medObs[k]||{};a.medObs[k][i]=el.value;propagarFicha(t,a);save()});
  $$('#dw-b [data-ac]').forEach(el=>el.onchange=()=>{const i=+el.value;a.acomod=a.acomod.filter(x=>x!==i);if(el.checked)a.acomod.push(i);a.acomod.sort((x,y)=>x-y);propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-doc]').forEach(el=>el.onchange=()=>{const i=el.dataset.doc;a.docs[i]=a.docs[i]||{};a.docs[i].on=el.checked;propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-docd]').forEach(el=>el.oninput=()=>{const i=el.dataset.docd;a.docs[i]=a.docs[i]||{};a.docs[i].obs=el.value;propagarFicha(t,a);save()});
}
/* o mesmo aluno noutras turmas/disciplinas do mesmo ano (mesma turma de origem; mesmo processo ou nome) */
function mesmosAlunos(t,a){
  const cls=a.origem||t.nome;const norm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();const out=[];
  (A()||{turmas:[]}).turmas.forEach(r=>{if(r===t)return;r.alunos.forEach(x=>{const xc=x.origem||r.nome;if(xc!==cls)return;
    if((a.processo&&x.processo===a.processo)||norm(x.nome)===norm(a.nome))out.push({r,x})})});
  return out;
}
function propagarFicha(t,a){mesmosAlunos(t,a).forEach(({x})=>{['medidas','medObs','acomod','docs'].forEach(f=>x[f]=JSON.parse(JSON.stringify(a[f]||{})));if(Array.isArray(a.acomod))x.acomod=a.acomod.slice()})}
/* delegado / subdelegado: um de cada por turma (de origem) */
function definirCargo(t,a,cargo){
  const cls=a.origem||t.nome;
  const limpa=(r,lista)=>lista.forEach(x=>{if(cargo&&x.cargo===cargo&&(x.origem||r.nome)===cls)x.cargo=''});
  limpa(t,t.alunos);(A()||{turmas:[]}).turmas.forEach(r=>{if(r!==t)limpa(r,r.alunos)});
  a.cargo=cargo;mesmosAlunos(t,a).forEach(({x})=>x.cargo=cargo);
}
const cargoNome=a=>(a.cargo==='D'?'Delegad':'Subdelegad')+(a.genero==='F'?'a':'o');
const cargoTag=(a,curto)=>!a.cargo?'':`<span class="cargo ${a.cargo==='SD'?'sd':''}" title="${cargoNome(a)} de turma">${a.cargo==='D'?ic('crown',11)+' ':''}${curto?a.cargo:cargoNome(a)}</span>`;
function delegadosResumo(t){
  const cls=t.origens||[t.nome];
  const parte=(a,cargo)=>a?`${cargo==='D'?ic('crown',14)+' ':''}<span class="mut">${cargoNome(a)}:</span> <b>${esc(a.nome)}</b>`:`<span class="mut">${cargo==='D'?ic('crown',14)+' Delegado(a)':'Subdelegado(a)'} por definir</span>`;
  return cls.map(c=>{const L=t.alunos.filter(x=>(x.origem||t.nome)===c);
    return `${t.origens?'<span class="tag">'+esc(c)+'</span> ':''}${parte(L.find(x=>x.cargo==='D'),'D')} <span style="color:var(--line)">·</span> ${parte(L.find(x=>x.cargo==='SD'),'SD')}`}).join('<span style="margin:0 12px;color:var(--line)">|</span>');
}

