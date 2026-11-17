/* ===================== Ensino profissional: horário semanal (uma grelha por semana) ===================== */
const segIso=d=>{d=typeof d==='string'?dataDeIso(d):new Date(d);const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return isoData(x)};
const horSemM=t=>t.horSem=t.horSem||{};
const usaSemanal=t=>!!t&&(t.horSemOn===true||(t.horSemOn!==false&&(ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional')));
const temSemanal=t=>!!t&&!!t.horSem&&Object.keys(t.horSem).length>0;
function semAulas(t,seg){const w=t&&t.horSem&&t.horSem[seg];return w?(w.vazia?[]:w.aulas||[]):null}
function blocosDia(t,a,B,d){const w=semAulas(t,segIso(d));if(w==null)return B.filter(b=>b.dia===d.getDay());return blocos(w).filter(b=>b.dia===d.getDay())}
function blocosDiaP(B,d,t){const seg=segIso(d);const TT=[...new Set([...(t?[t]:[]),...B.map(b=>b.t).filter(Boolean)])].filter(x=>semAulas(x,seg)!=null);if(!TT.length)return B;
  const out=B.filter(b=>!TT.includes(b.t||t));TT.forEach(tt=>blocos(semAulas(tt,seg).map(x=>({...x,t:tt}))).forEach(b=>out.push(b.t?b:{...b,t:tt})));return out}
{const _at=aulasTurma;aulasTurma=function(t,a){const r=_at.apply(this,arguments);if(r.length||!temSemanal(t))return r;const H=t.horSem;const hj=segIso(new Date());const ks=Object.keys(H).filter(k=>!H[k].vazia&&(H[k].aulas||[]).length).sort();const k=ks.find(x=>x>=hj)||ks[ks.length-1];return k?H[k].aulas.map(x=>({...x})):r}}
/* semanas de aulas a partir do calendário escolar */
function semanasAno(t,a){a=a||A();const c=a&&a.calendario;if(!c||!c.periodos.length)return [];const out=[];
  c.periodos.forEach(p=>{let d=dataDeIso(segIso(p.ini));while(isoData(d)<=p.fim){const seg=isoData(d);const dias=[];for(let k=0;k<5;k++){const x=new Date(d);x.setDate(x.getDate()+k);const iso=isoData(x);if(iso<p.ini||iso>p.fim)continue;dias.push({iso,let:letivoPara(t,iso),tipo:c.dias[iso]||''})}
    if(dias.some(x=>x.let)&&!out.some(w=>w.seg===seg))out.push({seg,per:p.n,dias,nLet:dias.filter(x=>x.let).length});d.setDate(d.getDate()+7)}});return out}
async function importarSemana(t,seg,file){ocupado('A ler '+file.name+'…');let hs=[];try{hs=await lerHorarioXlsx(file)}catch(e){livre();return toast('Não foi possível ler o ficheiro: '+e.message,'erro')}livre();
  const ok=hs.filter(h=>!h.erro&&h.aulas&&h.aulas.length);if(!ok.length)return toast('Não encontrei um horário de turma neste ficheiro','erro');
  const cls=turmasDaClasse(t).map(normTurma);const h=ok.find(x=>cls.includes(normTurma(x.turma||'')))||ok[0];
  let sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);if(!sig||!sig.length)sig=siglasDoProfessor?siglasDoProfessor(h):[];
  const aulas=h.aulas.filter(x=>!sig.length||sig.includes(x.ab)).map(x=>({...x,classe:h.turma}));
  horSemM(t)[seg]={aulas,fonte:file.name,q:Date.now(),turmaFich:h.turma||''};save();
  toast(`Semana de ${fmtIso(seg)}: ${aulas.length} tempo${aulas.length!==1?'s':''} de ${t.disciplina}${h.turma&&!cls.includes(normTurma(h.turma))?' (horário de '+h.turma+')':''}`,aulas.length?'ok':'aviso')}
function cartaoSemanal(t){const a=A();const W=semanasAno(t,a);const H=horSemM(t);const hj=segIso(new Date());const temAnual=(()=>{try{const x=t.horSem;t.horSem=null;const r=aulasTurma(t,a).length;t.horSem=x;return r}catch(_){return 0}})();
  if(!a.calendario)return `<div class="card hsem"><h2>${ic('calendar',18)} Horário Semanal</h2><p class="mut">Importe primeiro o <b>calendário escolar</b>: as semanas de aulas são calculadas a partir dele.</p><button class="btn pri" data-goview="calendario">${ic('calendar',15)} Calendário Escolar</button></div>`;
  const nC=W.filter(w=>H[w.seg]).length,nF=W.filter(w=>!H[w.seg]&&w.seg<=segIso(new Date(Date.now()+14*864e5))&&!temAnual).length;const P=[...new Set(W.map(w=>w.per))];const perSel=UI.hsemPer||(W.find(w=>w.seg>=hj)||{}).per||P[0];
  const semL=W.filter(w=>w.per===perSel);
  return `<div class="card hsem" id="hsem"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Horário Semanal</h2><span class="tag">${nC}/${W.length} semanas carregadas</span>${nF?`<span class="tag bad">${nF} em falta</span>`:''}<span class="sp1"></span>
      <div class="estps" role="group" aria-label="${perW()}">${P.map(p=>`<button type="button" class="${p===perSel?'on':''}" data-hsper="${p}">${p}.º ${perW().slice(0,3).toLowerCase()}.</button>`).join('')}</div></div>
    <p class="hint" style="margin:6px 0 12px">No ensino profissional o horário muda de semana para semana. Carregue o Excel de cada semana; as aulas previstas, os sumários e as aulas dadas passam a usar o horário dessa semana.${temAnual?' As semanas sem ficheiro usam o horário habitual da turma.':''}</p>
    <div class="hsl">${semL.map(w=>{const x=H[w.seg];const n=x?(x.vazia?0:blocos(x.aulas||[]).reduce((s,b)=>s+b.tempos,0)):null;const fim=w.dias[w.dias.length-1].iso;const cur=w.seg===hj;const passada=fim<isoHoje();
      const st=x?(x.vazia?'<span class="tag">sem aulas</span>':`<span class="tag ok">${ic('check',11)} ${n} tempo${n!==1?'s':''}</span>`):temAnual?'<span class="tag">horário habitual</span>':`<span class="tag ${passada||cur?'bad':''}">em falta</span>`;
      const dias=x&&!x.vazia?['Seg','Ter','Qua','Qui','Sex'].map((dn,k)=>{const B=blocos((x.aulas||[]).filter(z=>z.dia===k+1));return `<span class="hsd ${B.length?'':'vz'}"><b>${dn}</b>${B.map(b=>`${fmtHM(b.ini)}${b.tempos>1?' ('+b.tempos+'t)':''}`).join(' · ')||'—'}</span>`}).join(''):'';
      return `<div class="hsw ${cur?'cur':''} ${passada?'pas':''} ${x?'tem':''}" data-hseg="${w.seg}"><div class="hswh"><div class="hswd"><b>${fmtIso(w.seg).slice(0,5)} – ${fmtIso(fim).slice(0,5)}</b><small>${w.nLet} dia${w.nLet!==1?'s':''} letivo${w.nLet!==1?'s':''}${w.dias.some(z=>!z.let)?' · '+w.dias.filter(z=>!z.let).length+' sem aulas':''}${cur?' · <b>esta semana</b>':''}</small></div>${st}<span class="sp1"></span>
        <span class="hsa"><button class="btn sm ${x||temAnual?'':'pri'}" data-hsup="${w.seg}">${ic('upload',13)} ${x?'Substituir':'Carregar'}</button><button class="btn sm ico" data-hscp="${w.seg}" title="Copiar a semana anterior" aria-label="Copiar a semana anterior">${ic('copy',13)}</button><button class="btn sm ico" data-hsvz="${w.seg}" title="Marcar sem aulas" aria-label="Marcar sem aulas">${ic('x',12)}</button>${x?`<button class="btn sm ico dng" data-hsdel="${w.seg}" title="Limpar" aria-label="Limpar">${ic('trash',12)}</button>`:''}</span></div>
        ${dias?`<div class="hsds">${dias}</div>`:''}${x&&x.fonte?`<small class="hsf">${ic('file',11)} ${esc(x.fonte)}</small>`:''}</div>`}).join('')}</div>
    <input type="file" id="hsem-in" accept=".xlsx,.xls,.xlsm" hidden></div>`}
function bindSemanal(t){const c=$('#hsem');if(!c)return;const re=()=>manterPosicao(vHorario);let alvo=null;const inp=$('#hsem-in');
  c.querySelectorAll('[data-hsper]').forEach(b=>b.onclick=()=>{UI.hsemPer=+b.dataset.hsper;re()});
  c.querySelectorAll('[data-hsup]').forEach(b=>b.onclick=()=>{alvo=b.dataset.hsup;inp.value='';inp.click()});
  inp.onchange=async()=>{const f=inp.files[0];if(f&&alvo){await importarSemana(t,alvo,f);re()}};
  c.querySelectorAll('[data-hsw],[data-hseg]').forEach(w=>{w.ondragover=e=>{e.preventDefault();w.classList.add('over')};w.ondragleave=()=>w.classList.remove('over');w.ondrop=async e=>{e.preventDefault();w.classList.remove('over');const f=e.dataTransfer.files[0];if(f){await importarSemana(t,w.dataset.hseg,f);re()}}});
  c.querySelectorAll('[data-hscp]').forEach(b=>b.onclick=()=>{const seg=b.dataset.hscp;const H=horSemM(t);const ant=Object.keys(H).filter(k=>k<seg&&!H[k].vazia).sort().pop();if(!ant)return toast('Não há nenhuma semana anterior carregada','aviso');H[seg]={aulas:JSON.parse(JSON.stringify(H[ant].aulas||[])),fonte:'cópia de '+fmtIso(ant),q:Date.now()};save();re()});
  c.querySelectorAll('[data-hsvz]').forEach(b=>b.onclick=()=>{horSemM(t)[b.dataset.hsvz]={vazia:true,aulas:[],q:Date.now()};save();re()});
  c.querySelectorAll('[data-hsdel]').forEach(b=>b.onclick=()=>{delete horSemM(t)[b.dataset.hsdel];save();re()});
  c.querySelectorAll('[data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));
  const cur=c.querySelector('.hsw.cur');if(cur&&!UI._hsemScroll){UI._hsemScroll=1;cur.scrollIntoView({block:'nearest'})}}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T();if(t&&usaSemanal(t)){const v=$('#view');const vm=v.querySelector('.vmain')||v;const h1=vm.querySelector(':scope>h1');const e=vm.querySelector(':scope>.card.empty');
    const html=cartaoSemanal(t);if(e)e.outerHTML=html;else if(h1)h1.insertAdjacentHTML('afterend',html);else vm.insertAdjacentHTML('afterbegin',html);bindSemanal(t)}}catch(e){console.warn(e)}return r}}


