/* ===================== v1.006 · Anos de curso conforme a Portaria n.º 52/2016 =====================
   PROFIJ II · Tipo 2 = 2 anos · PROFIJ II · Tipo 3 = 1 ano · PROFIJ IV · Tipo 4 = 3 anos.
   CFA = (FSC+FC+2FT+FP)/5 às décimas; CFC: II-2 (CFA1+CFA2+CPAF)/3 · II-3 (2CFA+CPAF)/3 · IV-4 (CFA1+CFA2+CFA3+CPAF)/4, às unidades (art. 39.º).
   A PAF e a classificação final só existem no ano terminal; nos outros anos vê-se só o ano em curso (a não ser com «todos os anos» desbloqueado). */
const CP_TIPOS={'II-2':{anos:2,rot:'PROFIJ II – Tipo 2',niv:'nível II – tipo 2',f:'CFC = (CFA1+CFA2+CPAF)/3'},'II-3':{anos:1,rot:'PROFIJ II – Tipo 3',niv:'nível II – tipo 3',f:'CFC = (2CFA+CPAF)/3'},'IV-4':{anos:3,rot:'PROFIJ IV – Tipo 4',niv:'nível IV – tipo 4',f:'CFC = (CFA1+CFA2+CFA3+CPAF)/4'}};
function cpCurso(nome){const {y}=CP();const M=(y.mat||{})[nome]||{};const P=(y.pautas||{})[nome]||{};
  let tipo=M.tipoPfj&&CP_TIPOS[M.tipoPfj]?M.tipoPfj:P.tipo&&CP_TIPOS[P.tipo]?P.tipo:'';
  if(!tipo){const t=String(P.cursoCF||P.curso||M.curso||'')+' '+String(M.nivel||'');tipo=/\bIV\b|tipo\s*4/i.test(t)?'IV-4':/tipo\s*3/i.test(t)?'II-3':'II-2'}
  const T=CP_TIPOS[tipo];let ano=parseInt(M.anoCurso)||+P.anoC||1;ano=Math.max(1,Math.min(T.anos,ano));
  return {tipo,anos:T.anos,ano,terminal:ano===T.anos,rot:T.rot,nivelTxt:T.niv,formula:T.f,txt:T.rot.replace(' – ',' · ')+' · '+(T.anos===1?'1 ano':ano+'.º ano de '+T.anos)}}
const cpAnosArr=CI=>Array.from({length:CI.anos},(_,i)=>i+1);
function cpCFC(CI,cfa,cpaf){if(cpaf==null)return null;const v=cpAnosArr(CI).map(n=>cfa[n]&&cfa[n].cfa);if(v.some(x=>x==null))return null;
  if(CI.tipo==='II-3')return Math.round((2*v[0]+cpaf)/3);return Math.round((v.reduce((s,x)=>s+x,0)+cpaf)/(v.length+1))}
function cpCursoSet(nome,tipo,ano){const {y}=CP();y.pautas=y.pautas||{};const P=y.pautas[nome]=y.pautas[nome]||{};const T=CP_TIPOS[tipo]||CP_TIPOS['II-2'];ano=Math.max(1,Math.min(T.anos,+ano||1));
  const velho=cpCurso(nome);P.tipo=tipo;P.anoC=ano;const M=cpmM(nome);M.tipoPfj=tipo;M.anoCurso=ano+'.º';M.nivel=tipo.startsWith('IV')?'IV':'II';
  const tr=s=>String(s||'').replace(velho.rot,T.rot).replace(/–\s*\d\.º ano/,'– '+ano+'.º ano');if(P.curso)P.curso=tr(P.curso);if(P.cursoCF)P.cursoCF=String(P.cursoCF).replace(velho.rot,T.rot);save()}
/* chip do curso com tipo e ano editáveis + cadeado «só este ano / todos os anos» */
function cpCursoChip(nome){const CI=cpCurso(nome);const tod=!!UI.cpTodos;
  return `<span class="cpcur" data-cpcur="${esc(nome)}"><span class="tag ${CI.terminal?'ok':''}" title="${CI.terminal?'Ano terminal: PAF e classificação final de curso':'Ano não terminal: só a avaliação deste ano'}">${esc(CI.txt)}${CI.terminal?' · terminal':''}</span>
    <select data-cpcs="tipo" aria-label="Tipo de curso">${Object.entries(CP_TIPOS).map(([k,v])=>`<option value="${k}" ${k===CI.tipo?'selected':''}>${v.rot.replace(' – ',' · ')} (${v.anos} ano${v.anos>1?'s':''})</option>`).join('')}</select>
    <select data-cpcs="ano" aria-label="Ano do curso">${cpAnosArr(CI).map(n=>`<option value="${n}" ${n===CI.ano?'selected':''}>${n}.º ano</option>`).join('')}</select>
    ${CI.anos>1?`<button type="button" class="btn sm ${tod?'':'pri'}" data-cptod title="${tod?'A ver todos os anos do curso — toque para ver só este ano':'A ver só este ano — toque para desbloquear os outros anos'}">${ic(tod?'cadeadoAb':'cadeado',13)} ${tod?'Todos os anos':'Só este ano'}</button>`:''}</span>`}
document.addEventListener('change',e=>{const s=e.target.closest&&e.target.closest('[data-cpcs]');if(!s)return;const w=s.closest('[data-cpcur]');if(!w)return;const nome=w.dataset.cpcur;const CI=cpCurso(nome);
  if(s.dataset.cpcs==='tipo')cpCursoSet(nome,s.value,CI.ano);else cpCursoSet(nome,CI.tipo,s.value);try{manterPosicao(vCProfij)}catch(_){vCProfij()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cptod]');if(!b)return;UI.cpTodos=!UI.cpTodos;try{manterPosicao(vCProfij)}catch(_){vCProfij()}});
/* FPCT dos anos anteriores: procurada nos anos letivos anteriores pelo mesmo formando (n.º de processo ou n.º + nome) */
function ptFpAnteriores(al,CI){const out={};try{const {c,a}=CP();const anos=(S.anos||[]).slice().sort((x,y)=>String(x.nome).localeCompare(String(y.nome)));const ia=anos.findIndex(x=>x===a||x.id===(a&&a.id));if(ia<0)return out;
  for(let n=CI.ano-1,j=ia-1;n>=1&&j>=0;n--,j--){const y=(c.anos||{})[anos[j].id];if(!y||!y.fpct)continue;const e=Object.entries(y.fpct).find(([k,v])=>k.endsWith('|'+al.k)&&v&&v.nota!=null&&v.nota!=='');if(e)out[n]=+e[1].nota}}catch(_){}return out}
/* grelha da classificação: só os anos do curso; no ano não terminal só este ano e sem CPAF/CFC (a não ser desbloqueado) */
function ptCfcHTML(cl,P,L,fN){const CI=cpCurso(cl.nome);const tod=!!UI.cpTodos;const A_=tod?cpAnosArr(CI):[CI.ano];const fim=CI.terminal||tod;
  const tit=fim?`CFA = (FSC + FC + 2 × FT + FP) ÷ 5, às décimas · ${CI.formula.replace('CFC = ','CFC = ')}, às unidades (Portaria n.º 52/2016, art. 39.º).`:`Classificação anual do ${CI.ano}.º ano: CFA = (FSC + FC + 2 × FT + FP) ÷ 5, às décimas. A PAF e a classificação final de curso só aparecem no ${CI.anos}.º ano (terminal).`;
  return `<p class="hint">${tit} ${A_.length>1?`O ${CI.ano}.º ano vem da app (componentes e FPCT); a FPCT dos anos anteriores vem dos anos letivos anteriores; o resto importa-se do Excel da escola ou escreve-se.`:''}</p>
    <div class="row" style="gap:8px;margin-bottom:8px"><label class="btn sm">${ic('upload',13)} Importar Excel (histórico ou média detalhada)<input type="file" id="pt-imp" accept=".xlsx,.xlsm" hidden></label></div>
    <div class="tblw"><table class="lst pttb ptcf"><thead><tr><th rowspan="2">N.º</th><th rowspan="2" style="text-align:left">Nome</th>${A_.map(n=>`<th colspan="5" class="${n===CI.ano?'atual':''}">${n}.º ano${n===CI.ano?' · este ano':''}</th>`).join('')}${fim?'<th rowspan="2">CPAF</th><th rowspan="2">CFC</th>':''}</tr>
      <tr>${A_.map(()=>['FSC','FC','FT','FP','CFA'].map(h=>`<th>${h}</th>`).join('')).join('')}</tr></thead><tbody>
    ${L.map(x=>`<tr data-k="${esc(x.al.k)}"><td>${esc(x.proc)}</td><td style="text-align:left"><span class="cpfo">${avatar(x.al.ref||{nome:x.nome},28)}<b>${esc(x.nome)}</b></span></td>${A_.map(n=>['fsc','fc','ft','fp'].map(k=>{const ov=x.h['a'+n]&&x.h['a'+n][k]!=null&&x.h['a'+n][k]!=='';return `<td><input class="ptin ${ov?'man':''}" data-ph="${n}|${k}" value="${esc(ptN(x.cfa[n][k]))}" inputmode="decimal" placeholder="—" aria-label="${n}.º ano ${k.toUpperCase()}"></td>`}).join('')+`<td class="calc"><b>${fN(x.cfa[n].cfa)}</b></td>`).join('')}
      ${fim?`<td><input class="ptin" data-pcp value="${esc(x.cpaf!=null?ptN(x.cpaf):'')}" inputmode="decimal" aria-label="CPAF"></td><td class="calc"><b class="${x.cfc!=null&&x.cfc<10?'neg':''}">${x.cfc==null?'—':x.cfc}</b></td>`:''}</tr>`).join('')}</tbody></table></div>`}

function cpAlgumTerminal(){if(UI.cpTodos)return true;try{return cpClasses(A()).some(c=>cpCurso(c.nome).terminal)}catch(_){return true}}
/* v1.008 · assinatura do coordenador (Definições › Professor › Assinatura) nos documentos da coordenação */
function ptAssDocx(o){const cy=Math.round(15*36000),cx=Math.min(Math.round(cy*o.w/o.h),Math.round(60*36000));
  return `<w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="901" name="Assinatura"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="901" name="assinatura.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdAss"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`}
const cpAssImg=()=>S.cfg.assinaturaImg?`<img src="${esc(assinaturaSemFundo())}" alt="Assinatura" style="display:block;height:14mm;max-width:58mm;object-fit:contain;margin:0 auto 1mm;mix-blend-mode:multiply">`:'';
/* v1.010 · Planeamento Anual: casas quase quadradas, a crescer com a largura (fora e dentro do ecrã grande) */
{const tamCal=t=>{if(!t||!t.isConnected)return;const th=t.querySelector('thead th:nth-child(2)');if(!th)return;const w=th.getBoundingClientRect().width;if(!w)return;
    const amp=!!t.closest('#ampv');const maxH=amp?Math.max(22,(innerHeight-250)/13):56;t.style.setProperty('--cs',Math.round(Math.max(20,Math.min(w*.82,maxH)))+'px')};
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(E=>E.forEach(e=>tamCal(e.target))):null;
  new MutationObserver(()=>{document.querySelectorAll('table.cpm-cal:not([data-rs])').forEach(t=>{t.dataset.rs=1;if(ro)ro.observe(t);requestAnimationFrame(()=>tamCal(t))})}).observe(document.body,{childList:true,subtree:true})}
/* assinatura sem fundo: o branco à volta passa a transparente (para não tapar a linha nem o texto) */
let _assT={src:'',out:''};
function assinaturaSemFundo(){const src=S.cfg.assinaturaImg||'';if(!src)return '';if(_assT.src===src)return _assT.out||src;_assT={src,out:''};
  const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),p=d.data;
    for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+1],p[i+2]);if(m>235)p[i+3]=0;else if(m>200)p[i+3]=Math.round(p[i+3]*(235-m)/35)}g.putImageData(d,0,0);
    /* recortar as margens vazias */
    let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(p[(y*c.width+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    if(x1>x0&&y1>y0){const c2=document.createElement('canvas');c2.width=x1-x0+1;c2.height=y1-y0+1;c2.getContext('2d').drawImage(c,x0,y0,c2.width,c2.height,0,0,c2.width,c2.height);_assT.out=c2.toDataURL('image/png')}else _assT.out=c.toDataURL('image/png')}catch(e){_assT.out=src}};im.src=src;return src}
setTimeout(()=>{try{assinaturaSemFundo()}catch(_){}},1500);

