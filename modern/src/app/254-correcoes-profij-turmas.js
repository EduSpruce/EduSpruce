/* v1.120 · PROFIJ: «Ano do curso» (1.º–3.º) em vez do ano de escolaridade */
function acurSync(p,val){const seg=$('#'+p+'-of');const ano=$('#'+p+'-ano');if(!ano)return;const on=seg&&seg.querySelector('[data-of].on');const pj=on&&on.dataset.of==='profij';
  const box=ano.closest('div');let w=$('#'+p+'-acurw');
  if(!w){box.insertAdjacentHTML('afterend',`<div id="${p}-acurw"><label for="${p}-acur">Ano do curso</label><select id="${p}-acur">${[1,2,3].map(n=>`<option value="${n}" ${n===(+val||1)?'selected':''}>${n}.º ano</option>`).join('')}</select></div>`);w=$('#'+p+'-acurw')}
  box.style.display=pj?'none':'';w.style.display=pj?'':'none'}
function acurLiga(p,val){acurSync(p,val);const wr=$('#'+p+'-ofw');if(wr&&!wr.dataset.acur){wr.dataset.acur=1;wr.addEventListener('click',()=>setTimeout(()=>acurSync(p),0))}const es=$('#'+p+'-esc');if(es)es.addEventListener('change',()=>setTimeout(()=>acurSync(p),0))}
{const _e=editarTurmaDlg;editarTurmaDlg=function(t){const r=_e.apply(this,arguments);try{acurLiga('et',t.anoCurso);const ok=$('#et-ok');if(ok)ok.addEventListener('click',()=>{const s=$('#et-acur'),w=$('#et-acurw');if(!s||!w||w.style.display==='none')return;const a=A();const L=[t,...((($('#et-irm')||{}).checked)?a.turmas.filter(x=>x!==t&&normTurma(x.nome)===normTurma(t.nome)):[])];L.forEach(x=>x.anoCurso=+s.value)},true)}catch(e){console.warn(e)}return r}}
{const _n=novaTurmaDlg;novaTurmaDlg=function(){const r=_n.apply(this,arguments);try{acurLiga('nt',1);const ok=$('#nt-ok');const antes=S.turmaAtiva;if(ok)ok.addEventListener('click',()=>{const s=$('#nt-acur'),w=$('#nt-acurw');if(!s||!w||w.style.display==='none'||S.turmaAtiva===antes)return;const t=A()&&A().turmas.find(x=>x.id===S.turmaAtiva);if(t&&ofertaDe(t)==='profij'){t.anoCurso=+s.value;saveNow()}})}catch(e){console.warn(e)}return r}}
/* Importar horários: ficheiro cujo nome de turma não coincide (ex.: «Profij II - Operador de Logística») → associar a uma turma da app */
{const _ih=importarHorariosDlg;importarHorariosDlg=function(res){const r=_ih.apply(this,arguments);try{const a=A();if(!a)return r;const ok=(res||[]).filter(h=>!h.erro);
  const cls=[...new Set(a.turmas.flatMap(t=>turmasDaClasse(t)))];const pal=s=>normT(s).replace(/[^a-z0-9 ]/g,' ').split(' ').filter(w=>w.length>4);
  const cur=VIEW==='horario'&&T()?(UI.horC||turmasDaClasse(T())[0]):'';
  const rows=$$('#dw-b table.lst tbody tr');
  ok.forEach((h,i)=>{if(cls.some(c=>normTurma(c)===normTurma(h.turma)))return;const P=pal(h.turma);let sug=cur&&!ok.some(o=>normTurma(o.turma)===normTurma(cur))?cur:'';
    if(!sug){let best=0;cls.forEach(c=>{const n=pal(c).filter(w=>P.some(p=>p.startsWith(w.slice(0,6))||w.startsWith(p.slice(0,6)))).length;if(n>best){best=n;sug=c}})}
    const td=rows[i]&&rows[i].children[2];if(td)td.innerHTML=`<label class="mut" style="font-size:12px;margin:0">Associar à turma</label><select data-hassoc="${i}"><option value="">— nenhuma (guardar como ${esc(h.turma)}) —</option>${cls.map(c=>`<option ${c===sug?'selected':''}>${esc(c)}</option>`).join('')}</select>`});
  const b=$('#h-ok');if(b)b.addEventListener('click',()=>{$$('[data-hassoc]').forEach(s=>{const h=ok[+s.dataset.hassoc];if(!h||!s.value)return;const ant=h.turma;h.turmaFicheiro=ant;h.turma=s.value;
    if(a.horarios){Object.keys(a.horarios).forEach(k=>{if(normTurma(k)===normTurma(ant))delete a.horarios[k]})}})},true)}catch(e){console.warn(e)}return r}}
/* Horário da turma conjunta: separadores sempre visíveis, mesmo quando a turma escolhida ainda não tem horário */
{const _vh=vHorario;vHorario=function(){const t=T(),a=A();try{const cls=turmasDaClasse(t);if(!cls.includes(UI.horC)){const c=cls.find(c=>horarioDe(a,c));if(c)UI.horC=c}}catch(_){}
  const r=_vh.apply(this,arguments);try{const cls=turmasDaClasse(t);if(cls.length>1&&!horarioDe(a,UI.horC)){const e=$('#view .card.empty');if(e&&!e.querySelector('[data-hc]')){
    const b=e.querySelector('b');if(b)b.textContent='Ainda não há horário para '+UI.horC;
    e.insertAdjacentHTML('afterbegin',`<div class="tabs" style="margin:0 auto 14px;justify-content:center;display:flex">${cls.map(c=>`<button data-hc="${esc(c)}" class="${c===UI.horC?'on':''}">${esc(c)}${horarioDe(a,c)?'':' · sem horário'}</button>`).join('')}</div>`);
    e.querySelectorAll('[data-hc]').forEach(x=>x.onclick=()=>{UI.horC=x.dataset.hc;vHorario()})}}}catch(e){console.warn(e)}return r}}
/* Direção de Turma: um horário guardado com outro nome (ex.: «Profij II - Operador de Logística») não duplica uma turma que já existe */
{const _md=minhasDT;minhasDT=function(a){const L=_md.apply(this,arguments);try{if(!a)return L;const cls=[...new Set(a.turmas.flatMap(t=>turmasDaClasse(t)))];const pal=s=>normT(s).replace(/[^a-z0-9 ]/g,' ').split(' ').filter(w=>w.length>4).map(w=>w.slice(0,6));
  return L.filter(n=>cls.some(c=>normTurma(c)===normTurma(n))||!cls.some(c=>{const P=pal(c);return P.length&&pal(n).filter(w=>P.includes(w)).length>=Math.min(2,P.length)}))}catch(e){return L}}}
/* Direção de Turma: sem o separador «Avaliações» (as classificações são de cada professor) */
{const i=DT_TABS.findIndex(x=>x[0]==='aval');if(i>=0)DT_TABS.splice(i,1);const _vd=vDirecao;vDirecao=function(){if(UI.dtTab==='aval')UI.dtTab='painel';return _vd.apply(this,arguments)}}
/* Documentos (folhas .sheet: relatórios, fichas…): logótipo do canto superior direito e do rodapé definidos em Escola */
{const lgSheets=()=>{let e;try{e=EC()||{}}catch(_){return}if(!e.logoDir&&!e.logoBaixo)return;document.querySelectorAll('section.sheet:not([data-lg])').forEach(s=>{s.dataset.lg=1;
    const h=s.querySelector('.hdr');if(e.logoDir&&h&&![...h.querySelectorAll('img')].some(i=>i.getAttribute('src')===e.logoDir)){const r=h.lastElementChild&&h.lastElementChild!==h.firstElementChild?h.lastElementChild:null;const im=`<img class="lgD" src="${esc(e.logoDir)}" alt="" style="max-height:14mm;max-width:42mm;object-fit:contain;display:block;margin:0 0 2mm auto">`;if(r)r.insertAdjacentHTML('afterbegin',im);else h.insertAdjacentHTML('beforeend',im)}
    if(e.logoBaixo&&!s.querySelector('img.lgB'))s.insertAdjacentHTML('beforeend',`<div class="lgBw" style="text-align:center;margin-top:6mm"><img class="lgB" src="${esc(e.logoBaixo)}" alt="" style="max-height:12mm;max-width:60mm;object-fit:contain"></div>`)})};
  let _lt=0;new MutationObserver(()=>{clearTimeout(_lt);_lt=setTimeout(lgSheets,60)}).observe(document.body,{childList:true,subtree:true})}
/* Aulas Previstas: gráficos (progresso do ano por turma e previstas por período) */
{const _vap=vAulasPrevistas;vAulasPrevistas=function(a,c){const h=_vap.apply(this,arguments);try{const U=UI.prevU||'tempos';const W=c.periodos.length===2?'Semestre':'Período';
  const L=turmasFiltradas(a).map(t=>({t,r:aulasPrevistas(t,a)})).filter(x=>x.r);if(!L.length)return h;
  const pv=o=>U==='tempos'?o.tempos:o.aulas,dd=o=>U==='tempos'?o.tDadas:o.dadas,ff=o=>U==='tempos'?(o.tFaltas||0):((o.faltas&&o.faltas.length!=null)?o.faltas.length:(+o.faltas||0));
  const un=U==='tempos'?'tempos':'aulas';
  const prog=L.map(({t,r})=>{const P=pv(r.tot)||0,D=dd(r.tot)||0,F=ff(r.tot),R=Math.max(0,P-D-F);const pc=x=>P?(x/P*100).toFixed(2):0;
    return `<div class="apg-r"><div class="apg-n">${anoBadge(t,'sm')}<b>${esc(t.nome)}</b><span class="mut">${esc(t.disciplina)}</span></div><div class="apg-b" title="${D} dadas · ${F} faltas · ${R} por dar de ${P} ${un}"><i class="d" style="width:${pc(D)}%"></i><i class="f" style="width:${pc(F)}%"></i></div><div class="apg-v"><b>${P?Math.round(D/P*100):0}%</b> <span class="mut">${D}/${P}</span></div></div>`}).join('');
  const mx=Math.max(1,...L.flatMap(({r})=>r.P.map(p=>pv(p)||0)));
  const per=`<div class="apc">${c.periodos.map(cp=>`<div class="apc-g"><div class="apc-bars">${L.map(({t,r},i)=>{const p=r.P.find(x=>x.n===cp.n);const v=p?pv(p):0,d=p?dd(p):0;return `<div class="apc-c" title="${esc(t.nome)} · ${v} ${un} previstas · ${d} dadas"><span>${v}</span><div class="apc-col" style="background:${corTurma(t.id)};height:${(v/mx*100).toFixed(1)}%"><i style="height:${v?(d/v*100).toFixed(1):0}%"></i></div></div>`}).join('')}</div><b>${cp.n}.º ${W}</b></div>`).join('')}</div>
    <div class="apc-leg">${L.map(({t},i)=>`<span><i style="background:${corTurma(t.id)}"></i>${esc(t.nome)} · ${esc(t.disciplina)}</span>`).join('')}<span><i class="apc-dd"></i>Parte já dada</span></div>`;
  return h+`<div class="apgw"><div class="card"><h2>${ic('chart',18)} Progresso do Ano</h2><p class="hint" style="margin-top:0">${un[0].toUpperCase()+un.slice(1)} dados, faltas e por dar, face ao total previsto.</p>${prog}<div class="apc-leg"><span><i class="apc-d"></i>Dados</span><span><i class="apc-f"></i>Faltas</span><span><i class="apc-r"></i>Por dar</span></div></div>
    <div class="card"><h2>${ic('chart',18)} Previstas por ${W}</h2><p class="hint" style="margin-top:0">${un[0].toUpperCase()+un.slice(1)} previstas em cada ${W.toLowerCase()}, por turma.</p>${per}</div></div>`}catch(e){console.warn(e);return h}}}
