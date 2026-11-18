/* ===================== horario-grupos-ufcd ===================== */
/* Horário da turma: grupos de UFCD (A–Z). Cada professor tem um grupo (UFCD A, B, C…),
   que reúne todas as UFCD que leciona na turma. No horário, cada bloco «UFCD» recebe a
   letra do grupo; os blocos com a letra do professor são as aulas dele.
   Fica na pauta das UFCD (ou na própria pauta, se a turma não tiver outra):
   ufMeu = 'A' · ufH = {'turma|dia|ini':'g:A'}. */
function ufPauta(t){if(!t)return null;if(t.disciplina===UFCD_N)return t;const a=A();if(!a)return t;const C=turmasDaClasse(t);
  return (a.turmas||[]).find(x=>x.disciplina===UFCD_N&&escolaDe(x)===escolaDe(t)&&turmasDaClasse(x).some(c=>C.includes(c)))||t}
function ufSiglas(h){return ((h&&h.legenda)||[]).filter(l=>/^ufcd$|curta dura/i.test(normT(l.ab))||/curta dura/i.test(normT(l.nome))).map(l=>l.ab)}
function ufLetra(u,classe,dia,ini){const v=(u.ufH||{})[classe+'|'+dia+'|'+ini]||'';return v.slice(0,2)==='g:'?v.slice(2):''}
/* há blocos com a letra do professor? (só então a letra decide quais são as aulas dele) */
function ufAtivo(u){return !!(u&&u.ufMeu&&Object.values(u.ufH||{}).includes('g:'+u.ufMeu))}
function htSlots(h){if(h.tempos&&h.tempos.length){const S_=h.tempos.slice();h.aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});return S_.sort((x,y)=>x.ini-y.ini)}
  const S_=[];h.aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});return S_.sort((x,y)=>x.ini-y.ini)}
function htGrelhaOpts(t,h,mn){const SG=ufSiglas(h);const u=ufPauta(t);const L=(a,ini)=>ufLetra(u,UI.horC,a.dia,ini);const o={slots:h.tempos||[],
    attr:(a,ini,fim)=>` data-blk="${a.dia}|${ini}|${fim}|${esc(a.ab)}" draggable="true" role="button" tabindex="0" aria-label="${esc(a.ab+(SG.includes(a.ab)&&L(a,ini)?' '+L(a,ini):'')+' · '+DIAS[a.dia]+' '+fmtHM(ini)+'–'+fmtHM(fim)+' — mudar a disciplina ou mover')}"`,
    extra:(a,ini)=>{const l=SG.includes(a.ab)&&L(a,ini);return l?`<span class="htuf" title="Grupo de UFCD ${l}${l===u.ufMeu?' — o seu grupo':''}">UFCD ${l}</span>`:''}};
  if(SG.length&&u===t&&ufAtivo(u))o.minha=x=>SG.includes(x.ab)?L(x,x.ini)===u.ufMeu:mn(x);return o}
/* mover um bloco (arrastado ou pelo painel) para outro dia/tempo; se o destino estiver ocupado, os dois trocam de lugar */
function htMover(t,h,dia,ini,fim,ab,dDia,dIni){if(dia===dDia&&ini===dIni)return false;const u=ufPauta(t);const slots=htSlots(h);const B=h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim).sort((x,y)=>x.ini-y.ini);const n=B.length;if(!n)return false;
  const i0=slots.findIndex(s=>s.ini===dIni);const D=i0<0?[]:slots.slice(i0,i0+n);if(D.length<n||D.some((s,k)=>k&&s.ini-D[k-1].fim>=15)){toast('O bloco não cabe aí: precisa de '+n+' tempos seguidos','warn');return false}
  const O=h.aulas.filter(x=>x.dia===dDia&&!B.includes(x)&&D.some(s=>s.ini===x.ini));
  if(O.length&&dia===dDia&&D.some(s=>B.some(b=>b.ini===s.ini))){toast('Esses tempos estão ocupados — mova primeiro o outro bloco','warn');return false}
  if(!h.tempos)h.tempos=slots.map(s=>({ini:s.ini,fim:s.fim}));const H=u.ufH=u.ufH||{};const k=(d,i)=>UI.horC+'|'+d+'|'+i;const tira=x=>{const v=H[k(x.dia,x.ini)];delete H[k(x.dia,x.ini)];return v};
  const src=B.map(b=>({ini:b.ini,fim:b.fim}));const vB=B.map(tira),vO=O.map(tira);
  O.forEach((x,q)=>{const p=D.findIndex(s=>s.ini===x.ini);x.dia=dia;x.ini=src[p].ini;x.fim=src[p].fim;if(vO[q])H[k(x.dia,x.ini)]=vO[q]});
  B.forEach((b,p)=>{b.dia=dDia;b.ini=D[p].ini;b.fim=D[p].fim;if(vB[p])H[k(b.dia,b.ini)]=vB[p]});
  save();try{audit('Turmas','Horário',UI.horC+': '+ab+' '+DIAS[dia]+' '+fmtHM(ini)+' → '+DIAS[dDia]+' '+fmtHM(dIni)+(O.length?' (troca)':''))}catch(_){}return true}
{const _at=aulasTurma;aulasTurma=function(t,a){const r=_at.apply(this,arguments);try{if(!t||!r.length||!t.ufMeu||ufPauta(t)!==t||!ufAtivo(t))return r;a=a||A();const C=turmasDaClasse(t);const SG={};
    const sg=c=>SG[c]||(SG[c]=ufSiglas(horarioDe(a,c)));return r.filter(x=>{const c=x.classe||C[0];return !x.ab||!sg(c).includes(x.ab)||ufLetra(t,c,x.dia,x.ini)===t.ufMeu})}catch(e){console.warn(e);return r}}}
function ufGruposCard(t,h){if(!ufSiglas(h).length)return '';const u=ufPauta(t);const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const n=u.disciplina===UFCD_N?(u.modulos||[]).length:0;
  const meus=u.ufMeu?Object.values(u.ufH||{}).filter(v=>v==='g:'+u.ufMeu).length:0;
  return `<div class="hug"><h3>${ic('layers',16)} Grupo de UFCD</h3>
    <p class="hint" style="margin-top:0">No horário, as UFCD aparecem por grupos (UFCD A, B, C…), um por professor. O seu grupo reúne <b>todas as UFCD que leciona nesta turma</b>${n?` (${n})`:''}.</p>
    <label class="hugm">O meu grupo <select id="hug-meu" aria-label="O meu grupo de UFCD"><option value="">—</option>${AZ.map(g=>`<option ${u.ufMeu===g?'selected':''}>${g}</option>`).join('')}</select></label>
    <p class="hint" style="margin-bottom:0">Clique em cada bloco «UFCD» do horário e indique a letra do grupo. ${u.ufMeu?(meus?`Os <b>${meus}</b> tempos marcados com <b>UFCD ${u.ufMeu}</b> são as suas aulas de UFCD.`:`Ainda não marcou nenhum bloco com <b>UFCD ${u.ufMeu}</b>.`):'Os blocos com a sua letra passam a ser as suas aulas de UFCD.'}</p></div>`}
function htBlocoDlg(t,h,dia,ini,fim,ab){const u=ufPauta(t);const SG=ufSiglas(h);const eUf=SG.includes(ab);const k0=UI.horC+'|'+dia+'|';const B=()=>h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim);const at=eUf?ufLetra(u,UI.horC,dia,ini):'';
  const slots=htSlots(h);const ds=[1,2,3,4,5,...(h.aulas.some(a=>a.dia===6)?[6]:[])];const fecha=()=>{closeDrawer();manterPosicao(vHorario)};
  openDrawer(`${ab} · ${DIAS[dia]} ${fmtHM(ini)}–${fmtHM(fim)}`,`<div class="ed">
    ${eUf?`<h3 class="hugh">Grupo de UFCD${u.ufMeu?` <span class="mut">· o seu grupo é o ${u.ufMeu}</span>`:''}</h3><div class="hugaz">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(g=>`<button type="button" class="${at===g?'on':''} ${u.ufMeu===g?'meu':''}" data-ufv="${g}" aria-label="UFCD ${g}${u.ufMeu===g?' (o meu grupo)':''}" aria-pressed="${at===g}">${g}</button>`).join('')}</div>${at?`<button type="button" class="btn sm" data-ufv="" style="margin-top:8px">${ic('x',13)} Sem Grupo</button>`:''}`:''}
    <h3 class="hugh">Disciplina</h3><div class="row" style="gap:8px"><select id="hb-ab" style="flex:1;min-width:0">${h.legenda.map(l=>`<option value="${esc(l.ab)}" ${l.ab===ab?'selected':''}>${esc(l.ab+' — '+l.nome)}</option>`).join('')}${h.legenda.some(l=>l.ab===ab)?'':`<option selected>${esc(ab)}</option>`}</select><button type="button" class="btn pri" id="hb-abok">Mudar</button></div>
    <h3 class="hugh">Mover para</h3><div class="row" style="gap:8px"><select id="hb-d" aria-label="Dia">${ds.map(d=>`<option value="${d}" ${d===dia?'selected':''}>${DIAS[d]}</option>`).join('')}</select><select id="hb-i" aria-label="Hora de início">${slots.map(s=>`<option value="${s.ini}" ${s.ini===ini?'selected':''}>${fmtHM(s.ini)}</option>`).join('')}</select><button type="button" class="btn pri" id="hb-mok">Mover</button></div>
    <p class="hint">Também pode arrastar o bloco no horário. Se o destino estiver ocupado, os dois blocos trocam de lugar.</p>
    <button type="button" class="btn dng" id="hb-del" style="margin-top:14px">${ic('x',14)} Retirar do Horário</button></div>`);
  $$('[data-ufv]').forEach(b=>b.onclick=()=>{const v=b.dataset.ufv;u.ufH=u.ufH||{};B().forEach(x=>{if(v)u.ufH[k0+x.ini]='g:'+v;else delete u.ufH[k0+x.ini]});save();
    try{audit('Turmas','UFCD no horário',u.nome+': '+DIAS[dia]+' '+fmtHM(ini)+' → '+(v?'UFCD '+v:'sem grupo'))}catch(_){}fecha()});
  $('#hb-abok').onclick=()=>{const n=$('#hb-ab').value;if(n===ab)return fecha();const para=ufSiglas(h).includes(n);B().forEach(x=>{if(!para&&u.ufH)delete u.ufH[k0+x.ini];x.ab=n});save();try{audit('Turmas','Horário',UI.horC+': '+DIAS[dia]+' '+fmtHM(ini)+' '+ab+' → '+n)}catch(_){}fecha()};
  $('#hb-mok').onclick=()=>{if(htMover(t,h,dia,ini,fim,ab,+$('#hb-d').value,+$('#hb-i').value))fecha()};
  $('#hb-del').onclick=()=>{if(!confirm('Retirar '+ab+' ('+DIAS[dia]+' '+fmtHM(ini)+'–'+fmtHM(fim)+') do horário da turma?'))return;if(!h.tempos)h.tempos=htSlots(h).map(s=>({ini:s.ini,fim:s.fim}));const R=B();R.forEach(x=>{if(u.ufH)delete u.ufH[k0+x.ini]});h.aulas=h.aulas.filter(x=>!R.includes(x));save();try{audit('Turmas','Horário',UI.horC+': retirado '+ab+' '+DIAS[dia]+' '+fmtHM(ini))}catch(_){}fecha()}}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=t&&a&&horarioDe(a,UI.horC);if(h&&!$('#view .hug')){
    const html=ufGruposCard(t,h);if(html){const card=[...$$('#view .card')].find(c=>c.querySelector('[data-sig]'));if(card)card.insertAdjacentHTML('beforeend',html);else $('#view').insertAdjacentHTML('beforeend',`<div class="card">${html}</div>`)}
    const m=$('#hug-meu');if(m)m.onchange=()=>{const u=ufPauta(t);if(m.value)u.ufMeu=m.value;else delete u.ufMeu;save();manterPosicao(vHorario)};
    const P=c=>{const [d,i,f,...ab]=c.dataset.blk.split('|');return [+d,+i,+f,ab.join('|')]};const larga=(e,dDia,dIni)=>{e.preventDefault();$$('#view .htdrop').forEach(x=>x.classList.remove('htdrop'));const o=vHorario._arr;vHorario._arr=null;if(o&&htMover(t,h,...o,dDia,dIni))manterPosicao(vHorario)};
    const alvo=(el,fn)=>{el.ondragover=e=>{if(vHorario._arr){e.preventDefault();el.classList.add('htdrop')}};el.ondragleave=()=>el.classList.remove('htdrop');el.ondrop=e=>{const [d,i]=fn();larga(e,d,i)}};
    $$('#view [data-blk]').forEach(c=>{const go_=()=>htBlocoDlg(t,h,...P(c));c.onclick=go_;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go_()}};
      c.ondragstart=e=>{vHorario._arr=P(c);try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',c.dataset.blk)}catch(_){}c.classList.add('htarr')};c.ondragend=()=>{c.classList.remove('htarr');vHorario._arr=null;$$('#view .htdrop').forEach(x=>x.classList.remove('htdrop'))};alvo(c,()=>P(c))});
    $$('#view .htf[data-cel]').forEach(f=>alvo(f,()=>f.dataset.cel.split('|').map(Number)))}}catch(e){console.warn(e)}return r}}
