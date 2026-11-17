/* ===================== v1.003 · Pautas Oficiais = só os documentos (a avaliação faz-se na FPCT e na Classificação Final de Curso) ===================== */
function ptDocsPinta(el,cl,C,P,L,pinta){const fN=(v,d)=>v==null?'—':ptN(v,d);const nF=L.filter(x=>x.fin!=null).length,nC=L.filter(x=>x.cfc!=null).length,n=L.length;
  const doc=(t,tit,sub,ok)=>`<div class="ptdoc ${ok?'':'inc'}"><div><b>${tit}</b><small>${sub}</small></div><div class="row" style="gap:6px"><button type="button" class="btn sm pri" data-ptx="${t}|w">${ic('file',13)} Word</button><button type="button" class="btn sm" data-ptx="${t}|p">${ic('printer',13)} PDF</button></div></div>`;
  el.classList.remove('pt-in');
  el.innerHTML=`<div class="ptbar"><select id="pt-cl" aria-label="Turma">${C.map(c=>`<option ${c.nome===cl.nome?'selected':''}>${esc(c.nome)}</option>`).join('')}</select><b class="pt-tt">Pautas Oficiais · ${esc(cl.nome)}</b>${cpCursoChip(cl.nome)}<span class="sp1"></span></div>
    <p class="hint" style="margin:6px 0 10px">Os documentos finais, com a composição dos modelos da escola. As notas vêm da <button type="button" class="lnk" data-ptir="fpct">avaliação da FPCT</button> e da <button type="button" class="lnk" data-ptir="pautas">Classificação Final de Curso</button>.</p>
    <div class="ptdocs"><h3>${ic('building',15)} Formação Prática em Contexto de Trabalho <span class="tag ${nF===n&&n?'ok':'w'}">${nF}/${n} avaliados</span></h3>${doc('fpctF','Pauta Final','N.º, BI/CC, nome e nota',nF===n)}${doc('fpctD','Pauta Detalhada','Relatório, avaliação da entidade, nota e nota final',nF===n)}
      ${cpCurso(cl.nome).terminal||UI.cpTodos?`<h3>${ic('award',15)} Classificação Final de Curso <span class="tag ${nC===n&&n?'ok':'w'}">${nC}/${n} com CFC</span></h3>${doc('cfcF','Pauta Final','N.º, BI/CC, nome e nota',nC===n)}${doc('cfcD','Pauta Detalhada',cpAnosArr(cpCurso(cl.nome)).map(k=>'CFA'+k).join(', ')+', CPAF e nota final, com as fórmulas',nC===n)}`:`<p class="hint" style="margin-top:12px">${ic('cadeado',13)} A pauta da Classificação Final de Curso aparece no ${cpCurso(cl.nome).anos}.º ano (terminal). Esta turma está no ${cpCurso(cl.nome).ano}.º ano.</p>`}</div>
    <div class="tblw" style="margin-top:12px"><table class="lst"><thead><tr><th>N.º</th><th style="text-align:left">Nome</th><th>FPCT</th>${cpAnosArr(cpCurso(cl.nome)).map(k=>`<th>CFA${k}</th>`).join('')}${cpCurso(cl.nome).terminal||UI.cpTodos?'<th>CPAF</th><th>CFC</th>':''}</tr></thead><tbody>${L.map(x=>`<tr><td>${esc(x.proc)}</td><td style="text-align:left">${esc(x.nome)}</td><td>${x.fin==null?'—':x.fin}</td>${cpAnosArr(cpCurso(cl.nome)).map(k=>`<td>${fN(x.cfa[k].cfa)}</td>`).join('')}${cpCurso(cl.nome).terminal||UI.cpTodos?`<td>${fN(x.cpaf)}</td><td><b>${x.cfc==null?'—':x.cfc}</b></td>`:''}</tr>`).join('')}</tbody></table></div>
    <details class="ptcfg"><summary>${ic('sliders',14)} Cabeçalho e assinatura</summary><div class="ptg">
      <label>Entidade<input data-ptc="sec" value="${esc(P.sec)}"></label><label>Ano letivo<input data-ptc="ano" value="${esc(P.ano)}"></label>
      <label>Curso (FPCT)<input data-ptc="curso" value="${esc(P.curso)}"></label><label>Curso (Classificação Final)<input data-ptc="cursoCF" value="${esc(P.cursoCF)}"></label>
      <label class="w2">Legislação<input data-ptc="port" value="${esc(P.port)}"></label><label>Localidade<input data-ptc="local" value="${esc(P.local)}"></label><label>Data<input type="date" data-ptc="data" value="${esc(P.data)}"></label>
      <label>Assinatura<input data-ptc="assin" value="${esc(P.assin)}"></label>
      <div class="w2 ptlg"><span>Logótipos do cabeçalho: o da escola (Definições) à esquerda${(CP().c.ptLogos||[]).length?' e '+(CP().c.ptLogos.length)+' imagem(ns) do seu modelo à direita':''}.</span><label class="btn sm">${ic('upload',13)} Usar os logótipos do meu modelo Word<input type="file" id="pt-mod" accept=".docx" hidden></label>${(CP().c.ptLogos||[]).length?'<button type="button" class="btn sm" id="pt-modx">Retirar</button>':''}</div></div></details>`;
  el.querySelector('#pt-cl').onchange=e=>{UI.ptCl=e.target.value;pinta()};
  el.querySelectorAll('[data-ptc]').forEach(i=>i.onchange=()=>{P[i.dataset.ptc]=i.dataset.ptc==='anoC'?+i.value:i.value;save();pinta()});
  el.querySelectorAll('[data-ptx]').forEach(b=>b.onclick=()=>{const [t,f_]=b.dataset.ptx.split('|');(f_==='w'?ptDocx:ptPdf)(cl,t).catch(e=>alert(e.message))});
  el.querySelectorAll('[data-ptir]').forEach(b=>b.onclick=()=>{UI.cpTab=b.dataset.ptir;const x=document.querySelector('#ampv #amp-x');if(x)x.click();if(VIEW!=='cprofij')go('cprofij');else vCProfij()});
  const md=el.querySelector('#pt-mod');if(md)md.onchange=async()=>{try{CP().c.ptLogos=await ptModeloLogos(md.files[0]);save();toast('Logótipos do modelo guardados','ok');pinta()}catch(e){toast(e.message,'erro')}};
  const mx=el.querySelector('#pt-modx');if(mx)mx.onclick=()=>{CP().c.ptLogos=[];save();pinta()}}
/* grelha de avaliação da FPCT (Excel da escola: folhas «Relatório» e «Final») → avaliação da FPCT da turma */
async function ptImportarGrelha(cl,file){const F=await ptXlsxFolhas(file);const P=ptCfg(cl);
  const shR=F.find(x=>/relat/i.test(x.nome))||F[0],shF=F.find(x=>/final/i.test(x.nome));const g=(sh,r)=>sh?(sh.C.get(r)||'').trim():'';
  const col=s=>s.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),ltr=n=>{let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  const acha=(sh,re)=>{if(!sh)return null;for(const [k,v] of sh.C)if(re.test(v)){const m=k.match(/^([A-Z]+)(\d+)$/);return {c:col(m[1]),r:+m[2]}}return null};
  const hN=acha(shR,/^nome$/i),hRel=acha(shR,/^relat[oó]rio$/i);if(!hN||!hRel)throw new Error('Não encontrei a grelha (colunas NOME e Relatório) neste ficheiro.');
  let rc=hRel.r+1;while(rc<hRel.r+6&&!g(shR,ltr(hRel.c)+rc))rc++;const crit=[];for(let c=hRel.c;c<hRel.c+12;c++){const t=g(shR,ltr(c)+rc);if(!t)continue;if(/nota|classif/i.test(t))break;crit.push({c,n:t,m:+String(g(shR,ltr(c)+(rc+1))).replace(',','.')||20})}
  if(crit.length)P.crit=crit.map(c=>({n:c.n,m:c.m}));
  const ent={},bi={};if(shF){const fN=acha(shF,/^nome$/i),fE=acha(shF,/entidade/i),fR=acha(shF,/^relat[oó]rio$/i),fB=acha(shF,/^bi\/?cc$/i);
    if(fR){const w=+String(g(shF,ltr(fR.c)+(fR.r+2))).replace(',','.');if(w>0&&w<1)P.pRel=Math.round(w*100)}
    if(fN)for(let r=fN.r+1;r<fN.r+80;r++){const n=g(shF,ltr(fN.c)+r);if(!n)continue;if(fE){const v=g(shF,ltr(fE.c)+r);if(/^\d/.test(v))ent[normT(n)]=+v.replace(',','.')}if(fB)bi[normT(n)]=g(shF,ltr(fB.c)+r)}}
  let n=0;for(let r=rc+2;r<rc+80;r++){const nome=g(shR,ltr(hN.c)+r);if(!nome||!/[a-zà-ÿ]{3}/i.test(nome))continue;
    const al=cl.formandos.find(x=>normT(x.nome)===normT(nome));if(!al)continue;const f=ptFp(cl,al);const d=f.det=f.det||{};
    d.rel=crit.map(c=>{const v=g(shR,ltr(c.c)+r);return /^\d/.test(v)?+v.replace(',','.'):null});if(ent[normT(nome)]!=null)d.ent=ent[normT(nome)];if(bi[normT(nome)]&&!d.cc)d.cc=bi[normT(nome)];ptGravarNota(cl,al);n++}
  save();return n}

