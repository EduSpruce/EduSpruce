/* =====================================================================
   RELATÓRIOS
   ===================================================================== */
function vRelatorios(){
  const t=T(),al=alunosFiltro(t),P=periodos();
  if(!UI.relPer||!P.includes(UI.relPer))UI.relPer=perAtual(t);
  if(UI.relAluno!=='all'&&!al.some(a=>a.id===UI.relAluno))UI.relAluno='all';
  barBtns([{id:'b-pr',t:'Imprimir',c:'pri',f:()=>window.print()}]);
  const sel=UI.relAluno==='all'?al:al.filter(a=>a.id===UI.relAluno);
  $('#view').innerHTML=`<div class="card noprint"><div class="row">
    ${selOrigem(t)}<label class="mut">Aluno</label><select class="fld" id="r-al" style="width:auto"><option value="all">Todos (${al.length})</option>${al.map(a=>`<option value="${a.id}" ${a.id===UI.relAluno?'selected':''}>${esc(numAl(a))}. ${esc(a.nome)}</option>`).join('')}</select>
    <label class="mut">Até ao</label><select class="fld" id="r-per" style="width:auto">${P.map(p=>`<option value="${p}" ${p===UI.relPer?'selected':''}>${perNome(p)}</option>`).join('')}</select>
    <label class="mut">Documento</label><select class="fld" id="r-tipo" style="width:auto"><option value="rel" ${UI.relTipo!=='auto'?'selected':''}>Relatório Individual</option><option value="auto" ${UI.relTipo==='auto'?'selected':''}>Registo de Autoavaliação (Departamento)</option></select>
    <span class="sp1"></span><span class="hint">${UI.relTipo==='auto'?'Preenchido com os resultados e com a autoavaliação feita na app.':'A síntese descritiva pode ser editada diretamente na folha.'}</span></div></div>
    <div class="sheetwrap">${sel.length?sel.map(a=>UI.relTipo==='auto'?regAutoav(t,a,UI.relPer):relatorio(t,a,UI.relPer)).join(''):'<div class="card empty">Sem alunos.</div>'}</div>`;
  $('#r-tipo').onchange=e=>{UI.relTipo=e.target.value;vRelatorios()};
  $('#r-al').onchange=e=>{UI.relAluno=e.target.value;vRelatorios()};
  bindOrigem(()=>{UI.relAluno='all';vRelatorios()});
  $('#r-per').onchange=e=>{UI.relPer=+e.target.value;vRelatorios()};
  $$('.sheet [data-sint]').forEach(el=>el.addEventListener('input',()=>{const a=t.alunos.find(x=>x.id===el.dataset.sint);a.sintese=a.sintese||{};a.sintese[UI.relPer]=el.innerText;save()}));
}
function sintese(t,a,per){
  const pf=pctsFinal(t,a.id,per);const w=perW().toLowerCase();
  const parts=t.dominios.map(d=>{const m=mencao(t,pf[d.id]);if(!m)return null;if(m.banda||!temMencoes(t)){const v=pf[d.id];return `Em ${d.nome}, ${oa(a)} ${aluno_a(a)} obteve ${fmtNota(t,v)} valores${v>=.895?', um desempenho muito bom':v>=.695?', um bom desempenho':v>=.495?', um desempenho suficiente':', abaixo do esperado'}.`}const tpl=S.cfg.sinteses[m.nome]||SINTESE_DEF[m.nome]||'Em {dom}, {oa} {aluno} obteve a menção de '+m.nome+'.';return tpl.replace(/\{dom\}/g,d.nome).replace(/\{oa\}/g,oa(a)).replace(/\{aluno\}/g,aluno_a(a)).replace(/\{nome\}/g,a.nome.split(' ')[0]).replace(/\{turma\}/g,a.origem||t.nome).replace(/\{disciplina\}/g,t.disciplina).replace(/\{periodo\}/g,per+'.º '+w).replace(/\{mencao\}/g,m.nome)}).filter(Boolean);
  if(per>1){const n1=ponderada(t,pctsPer(t,a.id,per-1)),n2=ponderada(t,pctsPer(t,a.id,per));
    if(n1!=null&&n2!=null){const d=(n2-n1)*(isSec(t)?20:100),u=isSec(t)?' valores':' pontos percentuais';
      parts.push(Math.abs(d)<(isSec(t)?.5:3)?`Relativamente ao ${per-1}.º ${w}, manteve um desempenho estável.`:d>0?`Relativamente ao ${per-1}.º ${w}, registou uma evolução positiva (+${nf(d)}${u}).`:`Relativamente ao ${per-1}.º ${w}, registou uma descida (−${nf(-d)}${u}), devendo reforçar o estudo.`)}}
  const ok=t.dominios.filter(d=>pf[d.id]!=null).sort((x,y)=>pf[y.id]-pf[x.id]);
  if(ok.length>1&&pf[ok[0].id]-pf[ok[ok.length-1].id]>.08)parts.push(`Pontos fortes: ${ok[0].nome}. A melhorar: ${ok[ok.length-1].nome}.`);
  return parts.join('\n\n');
}
function grafico(t,a,P){
  /* 0.924 · os domínios ocupam toda a largura (antes ficavam encostados à esquerda) e a legenda fica por cima da grelha */
  const D=t.dominios||[];const W=640,H=214,pl=34,pr=8,top=28,bot=50,ch=H-top-bot,gw=(W-pl-pr)/Math.max(1,D.length);const nb=Math.max(1,P.length);
  const bw=Math.min(54,gw*.72/nb),gap=Math.min(6,bw*.15);const cols=['#9fbbe0','#2f7fd0','#0a3d75'];const y=v=>top+ch-v*ch;let g='';
  D.forEach((d,i)=>{const cx=pl+gw*i+gw/2,tot=nb*bw+(nb-1)*gap;let x=cx-tot/2;
    P.forEach((p,k)=>{const v=domPer(t,a.id,d.id,p);if(v!=null){const vv=Math.max(0,Math.min(1,v));g+=`<rect x="${x.toFixed(1)}" y="${y(vv).toFixed(1)}" width="${bw.toFixed(1)}" height="${(vv*ch).toFixed(1)}" fill="${P.length===1?domCor(t,d):cols[k%3]}" rx="2"/><text x="${(x+bw/2).toFixed(1)}" y="${(y(vv)-4).toFixed(1)}" font-size="10" font-weight="700" text-anchor="middle" fill="#333">${isSec(t)?String(Math.round(v*200)/10).replace('.',','):Math.round(v*100)}</text>`}x+=bw+gap});
    g+=(()=>{/* nome completo do critério, partido em linhas que cabem na coluna */const mx=Math.max(8,Math.floor(gw/5.6));const L=[];String(d.nome||d.ab).split(/\s+/).forEach(w=>{const u=L[L.length-1];if(u&&(u+' '+w).length<=mx)L[L.length-1]=u+' '+w;else L.push(w)});const L3=L.slice(0,3);if(L.length>3)L3[2]=L3[2].replace(/.$/,'…');return `<text x="${cx.toFixed(1)}" y="${H-bot+14}" font-size="9.5" font-weight="700" text-anchor="middle" fill="${P.length===1?domCor(t,d):'#333'}"><title>${esc(d.nome||'')}</title>${L3.map((l,j)=>`<tspan x="${cx.toFixed(1)}" dy="${j?11:0}">${esc(l)}</tspan>`).join('')}</text>`})()});
  let lx=W-pr;const leg=P.slice().reverse().map((p,kk)=>{const k=P.length-1-kk;const tx=tUnid(t)?esc(String(relPerNome(t,p)).slice(0,48)):`${p}.º ${perW().slice(0,3).toLowerCase()}.`;lx-=tx.length*5.6+20;return `<rect x="${lx.toFixed(1)}" y="5" width="10" height="10" rx="2" fill="${cols[k%3]}"/><text x="${(lx+14).toFixed(1)}" y="14" font-size="10" fill="#333">${tx}</text>`}).join('');
  const grid=[0,50,100].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v/100)}" y2="${y(v/100)}" stroke="${v?'#e3e3e3':'#888'}" ${v?'stroke-dasharray="3 3"':''}/>${v?`<text x="${pl-5}" y="${y(v/100)+3}" font-size="9" text-anchor="end" fill="#555">${isSec(t)?v/5:v+'%'}</text>`:''}`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:214px">${grid}${g}${leg}</svg>`;
}
/* autoavaliação do aluno no relatório individual (o que o aluno respondeu, por domínio) */
/* assinatura no relatório: apara as margens brancas da imagem para ficar centrada e assente na linha */
const _assinCache=new Map();
document.addEventListener('load',e=>{const im=e.target;if(!im||!im.classList||!im.classList.contains('assinrel')||im.dataset.ap)return;im.dataset.ap='1';const k=im.src.length+':'+im.src.slice(-60);if(_assinCache.has(k)){im.src=_assinCache.get(k);return}
  try{const w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)return;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=(y*w+x)*4;if(d[q+3]>40&&(d[q]+d[q+1]+d[q+2])<600){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
    if(x1<0){_assinCache.set(k,im.src);return}const c2=document.createElement('canvas');c2.width=x1-x0+1;c2.height=y1-y0+1;c2.getContext('2d').drawImage(c,x0,y0,c2.width,c2.height,0,0,c2.width,c2.height);try{const g2=c2.getContext('2d');const D2=g2.getImageData(0,0,c2.width,c2.height);const q=D2.data;for(let i=0;i<q.length;i+=4){const l=(q[i]+q[i+1]+q[i+2])/3;if(l>=235)q[i+3]=0;else if(l>170)q[i+3]=Math.round(q[i+3]*(235-l)/65)}g2.putImageData(D2,0,0)}catch(_){}const u=c2.toDataURL('image/png');_assinCache.set(k,u);im.src=u}catch(_){}},true);
function relAuto(t,a,per){const AV=((a.autoavD||{})[per])||{};const dom=AV.dom||{};const nota=AV.nota||((a.autoav||{})[per])||'';
  const L=(t.dominios||[]).filter(d=>dom[d.id]);if(!L.length&&!nota&&!AV.forte&&!AV.melhorar)return '';
  const lab=k=>{const x=(typeof AUTO_N!=='undefined'?AUTO_N:[]).find(z=>String(z[0])===String(k));return x?x[1]:k};
  return `<div style="margin-top:10px;border:1px solid #c9d6e6;border-radius:4px;padding:6px 8px;font-size:12px;break-inside:avoid"><b style="color:#0a4f8f">Autoavaliação ${a.genero==='F'?'da aluna':'do aluno'}</b>
    ${L.length?`<div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin-top:4px">${L.map(d=>`<span>${esc(d.nome)}</span><b>${esc(lab(dom[d.id]))}</b>`).join('')}</div>`:''}
    ${nota?`<div style="margin-top:4px">Classificação que propõe: <b>${esc(nota)}</b></div>`:''}
    ${AV.forte?`<div style="margin-top:3px"><i>O que fiz bem:</i> ${esc(AV.forte)}</div>`:''}${AV.melhorar?`<div><i>O que posso melhorar:</i> ${esc(AV.melhorar)}</div>`:''}</div>`}
/* Registo de Autoavaliação no modelo do departamento (uma folha por aluno, todos os períodos), preenchido com os dados da app */
function regAutoav(t,a,perAte){const c={...S.cfg,...escolaDe(t)};const P=periodos();const D=t.dominios||[];const lab=k=>{const z=AUTO_N.find(q=>String(q[0])===String(k));return z?z:null};
  const crit=D.map(d=>esc(d.nome)+' – '+d.peso+'%').join(' + ');const nAv=p=>{const AV=((a.autoavD||{})[p])||{};return AV.nota||((a.autoav||{})[p])||''};
  const bloco=p=>{const feito=p<=perAte;const AV=((a.autoavD||{})[p])||{};const insts=t.instrumentos.filter(i=>+i.periodo===+p).sort((x,y)=>String(x.data||'').localeCompare(String(y.data||'')));
    const col=d=>{if(!feito)return [];return insts.map(i=>{const r=instDom(i,a.id,d.id);return r?{n:i.nome,v:pctD(t,r.pct)}:null}).filter(Boolean)};const C=D.map(col);const linhas=Math.max(3,...C.map(x=>x.length));
    const nota=feito?nAv(p):'';const np=feito?fmtNota(t,ponderada(t,pctsPer(t,a.id,p))):'';const q=+AV.alunoQ;const dt=feito&&q>1e11?new Date(q).toLocaleDateString('pt-PT'):'';
    const refl=feito?[AV.forte?'<b>O que fiz bem:</b> '+esc(AV.forte):'',AV.melhorar?'<b>O que posso melhorar:</b> '+esc(AV.melhorar):'',AV.compromisso?'<b>Compromisso:</b> '+esc(AV.compromisso):''].filter(Boolean).join(' &nbsp;·&nbsp; '):'';
    return `<div class="rgp"><div class="rgpt"><b>${perNome(p)}</b></div>
      <table class="rgt"><thead><tr>${D.map(d=>`<th>${esc(d.nome)} <span>(${d.peso}%)</span></th>`).join('')}</tr></thead><tbody>
      ${Array.from({length:linhas},(_,k)=>`<tr>${C.map(x=>`<td>${x[k]?`<span class="rgn">${esc(x[k].n)}</span><b>${x[k].v||'—'}</b>`:'&nbsp;'}</td>`).join('')}</tr>`).join('')}
      <tr class="rgav">${D.map(d=>{const z=feito&&lab((AV.dom||{})[d.id]);return `<td>${z?`<i style="background:${z[2]}"></i>${esc(z[1])}`:'<span class="rgvz">Autoavaliação: —</span>'}</td>`}).join('')}</tr></tbody></table>
      <div class="rgf"><div class="rgnota"><span>${perNome(p)} · Avaliação final</span><b>Nota: ${nota?esc(nota):'_______'}</b>${np?`<small>Classificação do professor: ${np}</small>`:''}</div>
        <div class="rgass"><span>Ass. Prof.</span><span class="rgl">${feito&&S.cfg.assinaturaImg?`<img src="${esc(S.cfg.assinaturaImg)}" class="assinrel" alt="">`:''}</span></div>
        <div class="rgass"><span>Ass. Aluno</span><span class="rgl">${dt?'<em>respondido na app</em>':''}</span></div>
        <div class="rgass rgd"><span>Data</span><span class="rgl">${dt}</span></div></div>
      <div class="rgc"><b>Comentário / Reflexão:</b> ${refl||''}</div></div>`};
  const ns=P.map(p=>p<=perAte?parseFloat(String(nAv(p)).replace(',','.')):NaN);const ok=ns.filter(x=>!isNaN(x));const fin=ok.length===P.length&&P.every(p=>p<=perAte)?Math.round(ok.reduce((s,x)=>s+x,0)/ok.length*10)/10:null;
  return `<section class="sheet rgsheet">
    <div class="hdr"><span class="hl">${c.logo?`<img src="${esc(c.logo)}" alt="">`:''}<span><b>${esc(c.escola||'')}</b><br>${esc(S.cfg.departamento||(S.cfg.grupo?'Grupo '+S.cfg.grupo:''))}</span></span><span style="text-align:right">${c.logoDir?`<img src="${esc(c.logoDir)}" alt="" style="max-height:26px;max-width:92px;display:block;margin-left:auto;object-fit:contain">`:''}Ano letivo ${esc((A()||{}).nome||'')}<br>${esc(relNivelT(t))}</span></div>
    <h1>Registo de Autoavaliação – ${esc(t.disciplina||'')}</h1><div class="sub">Critérios: ${crit}</div>
    <div class="rgal"><span><small>Aluno</small><b>${esc(a.nome)}</b></span><span><small>N.º</small><b>${esc(numAl(a))}</b></span><span><small>Turma</small><b>${esc(a.origem||t.nome)}</b></span></div>
    ${P.map(bloco).join('')}
    <div class="rgfin">${P.map((p,k)=>`${perNome(p).replace(/ .*/,'').replace('.º','.ºP')} <b>${!isNaN(ns[k])?String(ns[k]).replace('.',','):'___'}</b>`).join(' + ')} &nbsp;/ ${P.length} = <span>NOTA FINAL <b>${fin!=null?String(fin).replace('.',','):'_____'}</b></span></div></section>`}
/* nível/oferta no cabeçalho dos relatórios: PROFIJ e profissional dizem-no (antes saía «Ensino Secundário» ou «3.º Ciclo» pelo ciclo da turma) */
function relNivelT(t){try{const o=ofertaDe(t);if(o==='profij'){const n=t.nivelEns==='sec'?'Ensino Secundário · ':t.nivelEns==='bas'?'Ensino Básico · ':'';return n+'PROFIJ'+(t.anoCurso?' · '+t.anoCurso+'.º ano':'')}if(o==='profissional')return 'Curso Profissional'+(t.curso?' de '+t.curso:'');return CICLOS[t.ciclo]||''}catch(_){return CICLOS[t.ciclo]||''}}
/* escola nos Açores (concelho dos Açores ou nome/morada com «Açores»): sem referência ao DL 54/2018 nos relatórios */
function escNosAcores(c){try{c=c||{};if(c.concelho&&typeof CONCELHOS_ACORES!=='undefined'&&CONCELHOS_ACORES.some(x=>x[0]===c.concelho))return true;return /a[çc]ores/i.test([c.escola,c.agrupamento,c.morada,c.localidade,c.regiao].filter(Boolean).join(' '))}catch(_){return false}}
function relatorio(t,a,per){
  const P=relPers(t,per),c={...S.cfg,...escolaDe(t)};
  const meds=Object.entries(MEDIDAS).filter(([k])=>k!=='rec').map(([k,g])=>(a.medidas&&a.medidas[k]||[]).map(i=>g.l[i])).flat();
  const sint=(a.sintese&&a.sintese[per])||sintese(t,a,per);const nfin=ponderada(t,pctsFinal(t,a.id,per));
  return `<section class="sheet">
    <div class="hdr"><span class="hl">${c.logo?`<img src="${esc(c.logo)}" alt="">`:''}<span><b>${esc(c.escola||'')}</b><br>Ano letivo ${esc((A()||{}).nome||'')}</span></span><span style="text-align:right">${esc(t.disciplina)} · Turma ${esc(a.origem||t.nome)}${a.origem?' <span style="color:#666">(aulas em '+esc(t.nome)+')</span>':''}<br>${esc(relNivelT(t))}</span></div>
    <h1>Relatório Individual ${a.genero==='F'?'da Aluna':'do Aluno'}</h1><div class="sub">${tUnid(t)?esc(relPerNome(t,per)):perNome(per)}</div>
    <div class="sec">Dados ${a.genero==='F'?'da aluna':'do aluno'}</div>
    <div style="display:flex;gap:14px;align-items:flex-start">${fotoSrc(a)?`<img class="foto-al" src="${esc(fotoSrc(a))}" alt="" style="width:39mm;height:48.75mm;object-fit:cover;border:1px solid #999;border-radius:3px">`:''}<div style="flex:1;min-width:0"><div class="rdal"><div class="rdnm">${esc(a.nome)}</div><div class="rdg">
      <div><small>N.º</small><span>${esc(numAl(a))}</span></div>${a.processo?`<div><small>Processo</small><span class="sens">${esc(a.processo)}</span></div>`:''}
      <div><small>Turma</small><span>${esc(a.origem||t.nome)}</span></div><div><small>${typeof tUnid==='function'&&tUnid(t)?'UFCD':'Disciplina'}</small><span>${esc(typeof tUnid==='function'&&tUnid(t)?(relPerNome(t,per)||t.disciplina):t.disciplina)}</span></div>
      <div><small>Data de nascimento</small><span class="sens">${a.nasc?fmtD(a.nasc)+' ('+idade(a.nasc)+' anos)':'—'}</span></div><div><small title="Ação Social Escolar">ASE</small><span class="sens">${esc(a.ase)||'Não se aplica'}</span></div>
      <div><small>Encarregado de educação</small><span class="sens">${esc(a.eeNome)||'—'}</span></div><div><small>Contacto</small><span class="sens">${esc(a.eeContacto)||'—'}</span></div>
      ${escNosAcores(c)?(meds.length?`<div class="rdw"><small>Medidas de suporte à aprendizagem</small><span class="sens">${esc(meds.join('; '))}</span></div>`:''):`<div class="rdw"><small>DL 54/2018</small><span class="sens">${meds.length?esc(meds.join('; ')):'Não se aplica'}</span></div>`}</div></div>${relAuto(t,a,per)}</div></div>
    <div class="sec">Avaliação por domínios</div>
    <table><thead><tr><th>Domínio</th><th class="c">Ponderação</th>${P.map(p=>`<th class="c">${esc(relPerNome(t,p))}</th>`).join('')}<th class="c">Menção</th></tr></thead><tbody>
    ${t.dominios.map((d,k)=>`${relGrpTr(t,d,k,P.length+3)}<tr class="${d.grupo?'relsub':''}">${(b=>`<td>${b?'<b>':''}${esc(d.nome)}${b?'</b>':''}</td><td class="c">${b?'<b>':''}${d.peso}%${b?'</b>':''}</td>`)(!d.grupo&&t.dominios.some(x=>x.grupo))}${P.map(p=>`<td class="c">${pctD(t,domPer(t,a.id,d.id,p))||'—'}</td>`).join('')}<td class="c">${esc((mencao(t,pctsFinal(t,a.id,per)[d.id])||{}).nome||'—')}</td></tr>`).join('')}
    ${tUnid(t)?'':`<tr><th>Nota do ${perW().toLowerCase()}</th><th></th>${P.map(p=>`<th class="c">${fmtNota(t,ponderada(t,pctsPer(t,a.id,p)))||'—'}</th>`).join('')}<th></th></tr>`}
    <tr><th>Classificação Final</th><th></th><th class="c" colspan="${P.length}" style="font-size:14px">${fmtNota(t,nfin)||'—'} ${nfin!=null?(isSec(t)?'valores':'· Nível '+nivel(t,nfin)):''}</th><th class="c">${esc((mencao(t,nfin)||{}).nome||'')}</th></tr></tbody></table>
    ${grafico(t,a,P)}
    <div class="sec">Síntese descritiva</div><div class="txt" contenteditable="true" data-sint="${a.id}">${esc(sint)}</div>
    ${(o=>o?`<div class="sec">Observações</div><div class="txt sens">${esc(o)}</div>`:'')((a.obsPer||{})[tUnid(t)&&modAtivo(t)?'u:'+modAtivo(t).id:per])}
    <div class="sign"><div style="position:relative">${S.cfg.assinaturaImg?`<img src="${esc(S.cfg.assinaturaImg)}" alt="Assinatura" class="assinrel" style="position:absolute;left:50%;bottom:100%;transform:translate(-50%,32%);height:13mm;max-width:78%;object-fit:contain;pointer-events:none">`:''}${esc(profRotulo()+(c.professor?' — '+profNome(c.professor):''))}</div><div>O(A) Encarregado(a) de Educação</div></div></section>`;
}

