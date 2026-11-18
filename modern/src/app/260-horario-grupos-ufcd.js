/* ===================== horario-grupos-ufcd ===================== */
/* Horário da turma: juntar as UFCD em grupos (A–Z) e atribuir a cada bloco «UFCD»
   do horário uma UFCD ou um grupo. Fica na pauta «Componente Tecnológica (UFCD)»
   da turma: ufG = {idDaUfcd:'A'} · ufH = {'turma|dia|ini':'g:A' ou 'm:idDaUfcd'}. */
function ufPauta(t){if(!t)return null;if(t.disciplina===UFCD_N)return t;const a=A();if(!a)return null;const C=turmasDaClasse(t);
  return (a.turmas||[]).find(x=>x.disciplina===UFCD_N&&escolaDe(x)===escolaDe(t)&&turmasDaClasse(x).some(c=>C.includes(c)))||null}
function ufSiglas(h){return ((h&&h.legenda)||[]).filter(l=>/^ufcd$|curta dura/i.test(normT(l.ab))||/curta dura/i.test(normT(l.nome))).map(l=>l.ab)}
function ufNome(m){return (m.cod?m.cod+' ':'')+m.nome}
function ufDoGrupo(u,g){const G=u.ufG||{};return (u.modulos||[]).filter(m=>G[m.id]===g)}
function ufGrupos(u){return [...new Set(Object.values(u.ufG||{}))].filter(g=>ufDoGrupo(u,g).length).sort()}
function ufRot(u,v,longo){if(!v)return '';if(v[0]==='g'){const g=v.slice(2);return 'Grupo '+g+(longo?': '+(ufDoGrupo(u,g).map(ufNome).join('; ')||'sem UFCD'):'')}
  const m=(u.modulos||[]).find(x=>x.id===v.slice(2));return m?(longo?ufNome(m):(m.cod?'UFCD '+m.cod:m.nome)):''}
function htGrelhaOpts(t,h){const u=ufPauta(t);const SG=ufSiglas(h);if(!u||!SG.length)return {};const H=u.ufH||{};const val=(a,ini)=>H[UI.horC+'|'+a.dia+'|'+ini];
  return {attr:(a,ini,fim)=>SG.includes(a.ab)?` data-ufs="${a.dia}|${ini}|${fim}|${esc(a.ab)}" role="button" tabindex="0" aria-label="${esc(a.ab+' '+DIAS[a.dia]+' '+fmtHM(ini)+(val(a,ini)?' — '+ufRot(u,val(a,ini),1):'')+' — atribuir UFCD ou grupo')}"`:'',
    extra:(a,ini)=>{if(!SG.includes(a.ab))return '';const r=ufRot(u,val(a,ini));return r?`<span class="htuf" title="${esc(ufRot(u,val(a,ini),1))}">${esc(r)}</span>`:''}}}
function ufGruposCard(t,h){const u=ufPauta(t);if(!ufSiglas(h).length)return '';
  if(!u||!(u.modulos||[]).length)return `<div class="hug"><h3>${ic('layers',16)} Grupos de UFCD</h3><p class="hint" style="margin:0">Para agrupar as UFCD e atribuí-las aos blocos do horário, é precisa a pauta «${esc(UFCD_N)}» desta turma, com as UFCD assinaladas.</p></div>`;
  const G=u.ufG||{};const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const gs=ufGrupos(u);
  return `<div class="hug"><h3>${ic('layers',16)} Grupos de UFCD <span class="mut">A–Z</span></h3>
    <p class="hint" style="margin-top:0">Junte as UFCD em grupos (de A a Z). Depois clique num bloco «UFCD» do horário para lhe atribuir uma UFCD ou um grupo.</p>
    <div class="hugl">${u.modulos.map(m=>`<label><select data-hug="${esc(m.id)}" aria-label="Grupo de ${esc(ufNome(m))}"><option value="">—</option>${AZ.map(g=>`<option ${G[m.id]===g?'selected':''}>${g}</option>`).join('')}</select><span>${m.cod?`<b>${esc(m.cod)}</b> `:''}${esc(m.nome)}</span></label>`).join('')}</div>
    ${gs.length?`<div class="hugr">${gs.map(g=>`<span><b>Grupo ${g}</b> ${esc(ufDoGrupo(u,g).map(m=>m.cod||m.nome).join(', '))}</span>`).join('')}</div>`:''}</div>`}
function ufAtribDlg(t,h,dia,ini,fim,ab){const u=ufPauta(t);if(!u||!(u.modulos||[]).length)return toast('Assinale primeiro as UFCD da pauta «'+UFCD_N+'» desta turma','warn');
  const k0=UI.horC+'|'+dia+'|';const tempos=h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim).map(x=>x.ini);const at=(u.ufH||{})[k0+ini]||'';const gs=ufGrupos(u);
  const op=(v,tit,sub)=>`<button type="button" class="hugo ${at===v?'on':''}" data-ufv="${esc(v)}"><b>${esc(tit)}</b>${sub?`<span class="mut">${esc(sub)}</span>`:''}</button>`;
  openDrawer(`${ab} · ${DIAS[dia]} ${fmtHM(ini)}–${fmtHM(fim)}`,`<div class="ed"><p class="hint" style="margin-top:0">Escolha a UFCD ou o grupo de UFCD deste bloco do horário.</p>
    ${gs.length?`<h3 class="hugh">Grupos</h3>${gs.map(g=>op('g:'+g,'Grupo '+g,ufDoGrupo(u,g).map(ufNome).join(' · '))).join('')}`:''}
    <h3 class="hugh">UFCD</h3>${u.modulos.map(m=>op('m:'+m.id,m.cod?'UFCD '+m.cod:m.nome,m.cod?m.nome:'')).join('')}
    ${at?`<h3 class="hugh">&nbsp;</h3>${op('','Sem atribuição','')}`:''}</div>`);
  $$('[data-ufv]').forEach(b=>b.onclick=()=>{const v=b.dataset.ufv;u.ufH=u.ufH||{};tempos.forEach(i=>{if(v)u.ufH[k0+i]=v;else delete u.ufH[k0+i]});save();
    try{audit('Turmas','UFCD no horário',u.nome+': '+DIAS[dia]+' '+fmtHM(ini)+' → '+(ufRot(u,v)||'sem atribuição'))}catch(_){}closeDrawer();manterPosicao(vHorario)})}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=t&&a&&horarioDe(a,UI.horC);if(h&&!$('#view .hug')){
    const html=ufGruposCard(t,h);if(html){const card=[...$$('#view .card')].find(c=>c.querySelector('[data-sig]'));if(card)card.insertAdjacentHTML('beforeend',html);else $('#view').insertAdjacentHTML('beforeend',`<div class="card">${html}</div>`)}
    const u=ufPauta(t);$$('[data-hug]').forEach(s=>s.onchange=()=>{u.ufG=u.ufG||{};if(s.value)u.ufG[s.dataset.hug]=s.value;else delete u.ufG[s.dataset.hug];save();manterPosicao(vHorario)});
    $$('#view [data-ufs]').forEach(c=>{const [d,i,f,...ab]=c.dataset.ufs.split('|');const go_=()=>ufAtribDlg(t,h,+d,+i,+f,ab.join('|'));c.onclick=go_;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go_()}}})}}catch(e){console.warn(e)}return r}}
