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
function htGrelhaOpts(t,h,mn){const SG=ufSiglas(h);if(!SG.length)return {};const u=ufPauta(t);const L=(a,ini)=>ufLetra(u,UI.horC,a.dia,ini);const o={
    attr:(a,ini,fim)=>SG.includes(a.ab)?` data-ufs="${a.dia}|${ini}|${fim}|${esc(a.ab)}" role="button" tabindex="0" aria-label="${esc(a.ab+(L(a,ini)?' '+L(a,ini):'')+' · '+DIAS[a.dia]+' '+fmtHM(ini)+' — indicar o grupo de UFCD')}"`:'',
    extra:(a,ini)=>{const l=SG.includes(a.ab)&&L(a,ini);return l?`<span class="htuf" title="Grupo de UFCD ${l}${l===u.ufMeu?' — o seu grupo':''}">UFCD ${l}</span>`:''}};
  if(u===t&&ufAtivo(u))o.minha=x=>SG.includes(x.ab)?L(x,x.ini)===u.ufMeu:mn(x);return o}
{const _at=aulasTurma;aulasTurma=function(t,a){const r=_at.apply(this,arguments);try{if(!t||!r.length||!t.ufMeu||ufPauta(t)!==t||!ufAtivo(t))return r;a=a||A();const C=turmasDaClasse(t);const SG={};
    const sg=c=>SG[c]||(SG[c]=ufSiglas(horarioDe(a,c)));return r.filter(x=>{const c=x.classe||C[0];return !x.ab||!sg(c).includes(x.ab)||ufLetra(t,c,x.dia,x.ini)===t.ufMeu})}catch(e){console.warn(e);return r}}}
function ufGruposCard(t,h){if(!ufSiglas(h).length)return '';const u=ufPauta(t);const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const n=u.disciplina===UFCD_N?(u.modulos||[]).length:0;
  const meus=u.ufMeu?Object.values(u.ufH||{}).filter(v=>v==='g:'+u.ufMeu).length:0;
  return `<div class="hug"><h3>${ic('layers',16)} Grupo de UFCD</h3>
    <p class="hint" style="margin-top:0">No horário, as UFCD aparecem por grupos (UFCD A, B, C…), um por professor. O seu grupo reúne <b>todas as UFCD que leciona nesta turma</b>${n?` (${n})`:''}.</p>
    <label class="hugm">O meu grupo <select id="hug-meu" aria-label="O meu grupo de UFCD"><option value="">—</option>${AZ.map(g=>`<option ${u.ufMeu===g?'selected':''}>${g}</option>`).join('')}</select></label>
    <p class="hint" style="margin-bottom:0">Clique em cada bloco «UFCD» do horário e indique a letra do grupo. ${u.ufMeu?(meus?`Os <b>${meus}</b> tempos marcados com <b>UFCD ${u.ufMeu}</b> são as suas aulas de UFCD.`:`Ainda não marcou nenhum bloco com <b>UFCD ${u.ufMeu}</b>.`):'Os blocos com a sua letra passam a ser as suas aulas de UFCD.'}</p></div>`}
function ufAtribDlg(t,h,dia,ini,fim,ab){const u=ufPauta(t);const k0=UI.horC+'|'+dia+'|';const tempos=h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim).map(x=>x.ini);const at=ufLetra(u,UI.horC,dia,ini);
  openDrawer(`${ab} · ${DIAS[dia]} ${fmtHM(ini)}–${fmtHM(fim)}`,`<div class="ed"><p class="hint" style="margin-top:0">Indique o grupo de UFCD deste bloco do horário${u.ufMeu?` — o seu grupo é o <b>${u.ufMeu}</b>`:''}.</p>
    <div class="hugaz">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(g=>`<button type="button" class="${at===g?'on':''} ${u.ufMeu===g?'meu':''}" data-ufv="${g}" aria-label="UFCD ${g}${u.ufMeu===g?' (o meu grupo)':''}" aria-pressed="${at===g}">${g}</button>`).join('')}</div>
    ${at?`<button type="button" class="btn" data-ufv="" style="margin-top:14px">${ic('x',14)} Sem Grupo</button>`:''}</div>`);
  $$('[data-ufv]').forEach(b=>b.onclick=()=>{const v=b.dataset.ufv;u.ufH=u.ufH||{};tempos.forEach(i=>{if(v)u.ufH[k0+i]='g:'+v;else delete u.ufH[k0+i]});save();
    try{audit('Turmas','UFCD no horário',u.nome+': '+DIAS[dia]+' '+fmtHM(ini)+' → '+(v?'UFCD '+v:'sem grupo'))}catch(_){}closeDrawer();manterPosicao(vHorario)})}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=t&&a&&horarioDe(a,UI.horC);if(h&&!$('#view .hug')){
    const html=ufGruposCard(t,h);if(html){const card=[...$$('#view .card')].find(c=>c.querySelector('[data-sig]'));if(card)card.insertAdjacentHTML('beforeend',html);else $('#view').insertAdjacentHTML('beforeend',`<div class="card">${html}</div>`)}
    const m=$('#hug-meu');if(m)m.onchange=()=>{const u=ufPauta(t);if(m.value)u.ufMeu=m.value;else delete u.ufMeu;save();manterPosicao(vHorario)};
    $$('#view [data-ufs]').forEach(c=>{const [d,i,f,...ab]=c.dataset.ufs.split('|');const go_=()=>ufAtribDlg(t,h,+d,+i,+f,ab.join('|'));c.onclick=go_;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go_()}}})}}catch(e){console.warn(e)}return r}}
