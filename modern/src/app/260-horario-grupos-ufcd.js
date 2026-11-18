/* ===================== horario-grupos-ufcd ===================== */
/* Grupos de UFCD (A–Z). Definem-se na Matriz Curricular (Coord. PROFIJ): cada UFCD fica num grupo
   e cada grupo tem um professor. No horário da turma, cada bloco «UFCD» leva a letra do grupo
   (guardada no próprio tempo: aula.g), que acompanha o bloco quando se move e passa para as
   alterações semanais ao horário base. A matriz conta as aulas de cada UFCD só nos blocos do seu
   grupo; o professor vê como suas as aulas do seu grupo. */
const AZ_='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function ufSiglas(h){return ((h&&h.legenda)||[]).filter(l=>/^ufcd$|curta dura/i.test(normT(l.ab))||/curta dura/i.test(normT(l.nome))).map(l=>l.ab)}
function ufMat(classe){try{const y=CP().y;const M=y&&y.mat;if(!M||!classe)return null;if(M[classe])return M[classe];const k=Object.keys(M).find(k=>normTurma(k)===normTurma(classe));return k?M[k]:null}catch(_){return null}}
function ufGruposMat(M){const G={};((M&&M.disc)||[]).forEach(d=>{if(d.grupo)(G[d.grupo]=G[d.grupo]||[]).push(d)});return G}
function ufProfGrupo(M,g){const P=(M&&M.grpProf)||{};if(P[g])return P[g];const L=(ufGruposMat(M)[g]||[]).map(d=>d.prof).filter(Boolean);return L.length&&L.every(x=>x===L[0])?L[0]:''}
const ufMesmoProf=(a,b)=>{a=normT(a);b=normT(b);if(!a||!b)return false;if(a===b)return true;const A1=a.split(' '),B1=b.split(' ');return A1[0]===B1[0]&&A1[A1.length-1]===B1[B1.length-1]};
/* a pauta das UFCD da turma (ou a própria turma) */
function ufPauta(t){if(!t)return null;if(t.disciplina===UFCD_N)return t;const a=A();if(!a)return t;const C=turmasDaClasse(t);
  return (a.turmas||[]).find(x=>x.disciplina===UFCD_N&&escolaDe(x)===escolaDe(t)&&turmasDaClasse(x).some(c=>C.includes(c)))||t}
/* o meu grupo: o da matriz cujo professor sou eu; senão o que escolhi na turma */
function ufMeu(t,classe){const u=ufPauta(t);const M=ufMat(classe||turmasDaClasse(t)[0]);if(M){const eu=S.cfg.professor||'';const g=Object.keys(ufGruposMat(M)).concat(Object.keys(M.grpProf||{})).find(g=>ufMesmoProf(ufProfGrupo(M,g),eu));if(g)return {g,mat:true}}
  return u&&u.ufMeu?{g:u.ufMeu,mat:false}:{g:'',mat:false}}
/* letra de um tempo: a do próprio tempo; nas semanas alteradas, a do tempo igual no horário base */
function ufLetraH(h,x){if(x.g)return x.g;const b=h&&h.aulas.find(y=>y!==x&&y.dia===x.dia&&y.ini===x.ini&&normSig(y.ab)===normSig(x.ab));return b&&b.g||''}
function ufTemLetras(h,g){return !!(h&&h.aulas.some(x=>g?x.g===g:x.g))}
/* migração: letras que estavam guardadas na pauta (1.125–1.127) passam para os tempos do horário */
function ufMigrar(t){const u=ufPauta(t);if(!u||!u.ufH)return;const a=A();Object.keys(u.ufH).forEach(k=>{const [c,d,i]=k.split('|');const h=horarioDe(a,c);const v=u.ufH[k];if(h&&v&&v.slice(0,2)==='g:'){const x=h.aulas.find(x=>x.dia===+d&&x.ini===+i&&ufSiglas(h).includes(x.ab));if(x&&!x.g)x.g=v.slice(2)}});delete u.ufH;try{save()}catch(_){}}
function ufAtivo(t){const m=ufMeu(t);if(!m.g)return false;const a=A();return turmasDaClasse(t).some(c=>ufTemLetras(horarioDe(a,c),m.g))}
function ufFiltra(t,L,classe){const a=A();const m=ufMeu(t,classe);const h=horarioDe(a,classe);if(!h)return L;const SG=ufSiglas(h).map(normSig);return L.filter(x=>!x.ab||!SG.includes(normSig(x.ab))||ufLetraH(h,x)===m.g)}
function htSlots(h){if(h.tempos&&h.tempos.length){const S_=h.tempos.slice();h.aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});return S_.sort((x,y)=>x.ini-y.ini)}
  const S_=[];h.aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});return S_.sort((x,y)=>x.ini-y.ini)}
/* mover um bloco (arrastado ou pelo painel) para outro dia/tempo; se o destino estiver ocupado, os dois trocam de lugar */
function htMover(t,h,dia,ini,fim,ab,dDia,dIni){if(dia===dDia&&ini===dIni)return false;const slots=htSlots(h);const B=h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim).sort((x,y)=>x.ini-y.ini);const n=B.length;if(!n)return false;
  const i0=slots.findIndex(s=>s.ini===dIni);const D=i0<0?[]:slots.slice(i0,i0+n);if(D.length<n||D.some((s,k)=>k&&s.ini-D[k-1].fim>=15)){toast('O bloco não cabe aí: precisa de '+n+' tempos seguidos','warn');return false}
  const O=h.aulas.filter(x=>x.dia===dDia&&!B.includes(x)&&D.some(s=>s.ini===x.ini));
  if(O.length&&dia===dDia&&D.some(s=>B.some(b=>b.ini===s.ini))){toast('Esses tempos estão ocupados — mova primeiro o outro bloco','warn');return false}
  if(!h.tempos)h.tempos=slots.map(s=>({ini:s.ini,fim:s.fim}));
  const src=B.map(b=>({ini:b.ini,fim:b.fim}));
  O.forEach((x,q)=>{const p=D.findIndex(s=>s.ini===x.ini);x.dia=dia;x.ini=src[p].ini;x.fim=src[p].fim});
  B.forEach((b,p)=>{b.dia=dDia;b.ini=D[p].ini;b.fim=D[p].fim});
  save();try{audit('Turmas','Horário',UI.horC+': '+ab+' '+DIAS[dia]+' '+fmtHM(ini)+' → '+DIAS[dDia]+' '+fmtHM(dIni)+(O.length?' (troca)':''))}catch(_){}return true}
function htGrelhaOpts(t,h,mn){const SG=ufSiglas(h);const u=ufPauta(t);const M=ufMat(UI.horC);const m=ufMeu(t,UI.horC);const o={slots:h.tempos||[],
    attr:(a,ini,fim)=>` data-blk="${a.dia}|${ini}|${fim}|${esc(a.ab)}" draggable="true" role="button" tabindex="0" aria-label="${esc(a.ab+(a.g?' '+a.g:'')+' · '+DIAS[a.dia]+' '+fmtHM(ini)+'–'+fmtHM(fim)+' — mudar a disciplina ou mover')}"`,
    extra:a=>{if(!SG.includes(a.ab)||!a.g)return '';const pf=M?ufProfGrupo(M,a.g):'';return `<span class="htuf" title="Grupo de UFCD ${a.g}${pf?' — '+esc(pf):''}${a.g===m.g?' (o seu grupo)':''}">UFCD ${a.g}${pf?` · ${esc(pf.split(' ')[0])}`:''}</span>`}};
  if(SG.length&&u===t&&m.g&&ufTemLetras(h,m.g))o.minha=x=>SG.includes(x.ab)?x.g===m.g:mn(x);return o}
{const _at=aulasTurma;aulasTurma=function(t,a){const r=_at.apply(this,arguments);try{if(!t||!r.length||ufPauta(t)!==t||!ufAtivo(t))return r;const C=turmasDaClasse(t);const by={};r.forEach(x=>{const c=x.classe||C[0];(by[c]=by[c]||[]).push(x)});
    return Object.keys(by).flatMap(c=>ufFiltra(t,by[c],c)).sort((x,y)=>x.dia-y.dia||x.ini-y.ini)}catch(e){console.warn(e);return r}}}
/* alterações semanais ao horário base: só os tempos do meu grupo */
{const _sa=semAulas;semAulas=function(t,seg){const r=_sa.apply(this,arguments);try{if(!r||!r.length||!t||ufPauta(t)!==t||!ufAtivo(t))return r;return ufFiltra(t,r,turmasDaClasse(t)[0])}catch(e){return r}}}
function ufGruposCard(t,h){if(!ufSiglas(h).length)return '';const u=ufPauta(t);const M=ufMat(UI.horC);const G=ufGruposMat(M);const m=ufMeu(t,UI.horC);const gs=Object.keys(G).sort();
  const meus=m.g?h.aulas.filter(x=>x.g===m.g).length:0;
  return `<div class="hug"><h3>${ic('layers',16)} Grupos de UFCD</h3>
    ${gs.length?`<div class="hugr">${gs.map(g=>`<span class="${g===m.g?'meu':''}"><b>UFCD ${g}</b>${ufProfGrupo(M,g)?` · ${esc(ufProfGrupo(M,g))}`:''}<br><small class="mut">${esc(G[g].map(d=>d.det||d.nome).join(', '))} · ${h.aulas.filter(x=>x.g===g).length} tempos/semana</small></span>`).join('')}</div>
      <p class="hint" style="margin-bottom:0">${m.g?`O seu grupo é o <b>UFCD ${m.g}</b>${m.mat?' (da matriz curricular)':''}: ${meus?`os <b>${meus}</b> tempos marcados com ${m.g} são as suas aulas de UFCD`:'marque no horário os blocos com essa letra'}.`:'O seu nome não está em nenhum grupo da matriz.'} Clique num bloco «UFCD» do horário para lhe dar a letra do grupo.</p>`
     :`<p class="hint" style="margin-top:0">Os grupos (UFCD A, B, C…, cada um com o seu professor e as suas UFCD) definem-se na <b>Matriz Curricular</b> do curso${typeof cpAtivar==='function'?' (Coord. PROFIJ)':''}. Clique num bloco «UFCD» do horário para lhe dar a letra do grupo.</p>`}
    ${m.mat?'':`<label class="hugm">O meu grupo <select id="hug-meu" aria-label="O meu grupo de UFCD"><option value="">—</option>${AZ_.map(g=>`<option ${u.ufMeu===g?'selected':''}>${g}</option>`).join('')}</select></label>`}</div>`}
function htBlocoDlg(t,h,dia,ini,fim,ab){const u=ufPauta(t);const SG=ufSiglas(h);const eUf=SG.includes(ab);const k0=UI.horC+'|'+dia+'|';const B=()=>h.aulas.filter(x=>x.dia===dia&&x.ab===ab&&x.ini>=ini&&x.ini<fim);const at=eUf?(B()[0]||{}).g||'':'';const M=ufMat(UI.horC);const G=ufGruposMat(M);const mg=ufMeu(t,UI.horC).g;
  const slots=htSlots(h);const ds=[1,2,3,4,5,...(h.aulas.some(a=>a.dia===6)?[6]:[])];const fecha=()=>{closeDrawer();manterPosicao(vHorario)};
  openDrawer(`${ab} · ${DIAS[dia]} ${fmtHM(ini)}–${fmtHM(fim)}`,`<div class="ed">
    ${eUf?`<h3 class="hugh">Grupo de UFCD${mg?` <span class="mut">· o seu grupo é o ${mg}</span>`:''}</h3>${Object.keys(G).length?`<div class="hugml">${Object.keys(G).sort().map(g=>`<button type="button" class="hugo ${at===g?'on':''}" data-ufv="${g}" aria-pressed="${at===g}"><b>UFCD ${g}${ufProfGrupo(M,g)?' · '+esc(ufProfGrupo(M,g)):''}</b><span class="mut">${esc(G[g].map(d=>d.det||d.nome).join(', '))}</span></button>`).join('')}</div><p class="hint" style="margin:6px 0">Outra letra:</p>`:''}<div class="hugaz">${AZ_.map(g=>`<button type="button" class="${at===g?'on':''} ${mg===g?'meu':''}" data-ufv="${g}" aria-label="UFCD ${g}${mg===g?' (o meu grupo)':''}" aria-pressed="${at===g}">${g}</button>`).join('')}</div>${at?`<button type="button" class="btn sm" data-ufv="" style="margin-top:8px">${ic('x',13)} Sem Grupo</button>`:''}`:''}
    <h3 class="hugh">Disciplina</h3><div class="row" style="gap:8px"><select id="hb-ab" style="flex:1;min-width:0">${h.legenda.map(l=>`<option value="${esc(l.ab)}" ${l.ab===ab?'selected':''}>${esc(l.ab+' — '+l.nome)}</option>`).join('')}${h.legenda.some(l=>l.ab===ab)?'':`<option selected>${esc(ab)}</option>`}</select><button type="button" class="btn pri" id="hb-abok">Mudar</button></div>
    <h3 class="hugh">Mover para</h3><div class="row" style="gap:8px"><select id="hb-d" aria-label="Dia">${ds.map(d=>`<option value="${d}" ${d===dia?'selected':''}>${DIAS[d]}</option>`).join('')}</select><select id="hb-i" aria-label="Hora de início">${slots.map(s=>`<option value="${s.ini}" ${s.ini===ini?'selected':''}>${fmtHM(s.ini)}</option>`).join('')}</select><button type="button" class="btn pri" id="hb-mok">Mover</button></div>
    <p class="hint">Também pode arrastar o bloco no horário. Se o destino estiver ocupado, os dois blocos trocam de lugar.</p>
    <button type="button" class="btn dng" id="hb-del" style="margin-top:14px">${ic('x',14)} Retirar do Horário</button></div>`);
  $$('[data-ufv]').forEach(b=>b.onclick=()=>{const v=b.dataset.ufv;B().forEach(x=>{if(v)x.g=v;else delete x.g});save();
    try{audit('Turmas','UFCD no horário',u.nome+': '+DIAS[dia]+' '+fmtHM(ini)+' → '+(v?'UFCD '+v:'sem grupo'))}catch(_){}fecha()});
  $('#hb-abok').onclick=()=>{const n=$('#hb-ab').value;if(n===ab)return fecha();const para=ufSiglas(h).includes(n);B().forEach(x=>{if(!para)delete x.g;x.ab=n});save();try{audit('Turmas','Horário',UI.horC+': '+DIAS[dia]+' '+fmtHM(ini)+' '+ab+' → '+n)}catch(_){}fecha()};
  $('#hb-mok').onclick=()=>{if(htMover(t,h,dia,ini,fim,ab,+$('#hb-d').value,+$('#hb-i').value))fecha()};
  $('#hb-del').onclick=()=>{if(!confirm('Retirar '+ab+' ('+DIAS[dia]+' '+fmtHM(ini)+'–'+fmtHM(fim)+') do horário da turma?'))return;if(!h.tempos)h.tempos=htSlots(h).map(s=>({ini:s.ini,fim:s.fim}));const R=B();h.aulas=h.aulas.filter(x=>!R.includes(x));save();try{audit('Turmas','Horário',UI.horC+': retirado '+ab+' '+DIAS[dia]+' '+fmtHM(ini))}catch(_){}fecha()}}
{const _vh=vHorario;vHorario=function(){try{const t0=T();if(t0)ufMigrar(t0)}catch(_){}const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=t&&a&&horarioDe(a,UI.horC);if(h&&!$('#view .hug')){
    const html=ufGruposCard(t,h);if(html){const card=[...$$('#view .card')].find(c=>c.querySelector('[data-sig]'));if(card)card.insertAdjacentHTML('beforeend',html);else $('#view').insertAdjacentHTML('beforeend',`<div class="card">${html}</div>`)}
    const mm=$('#hug-meu');if(mm)mm.onchange=()=>{const u=ufPauta(t);if(mm.value)u.ufMeu=mm.value;else delete u.ufMeu;save();manterPosicao(vHorario)};
    const P=c=>{const [d,i,f,...ab]=c.dataset.blk.split('|');return [+d,+i,+f,ab.join('|')]};const larga=(e,dDia,dIni)=>{e.preventDefault();$$('#view .htdrop').forEach(x=>x.classList.remove('htdrop'));const o=vHorario._arr;vHorario._arr=null;if(o&&htMover(t,h,...o,dDia,dIni))manterPosicao(vHorario)};
    const alvo=(el,fn)=>{el.ondragover=e=>{if(vHorario._arr){e.preventDefault();el.classList.add('htdrop')}};el.ondragleave=()=>el.classList.remove('htdrop');el.ondrop=e=>{const [d,i]=fn();larga(e,d,i)}};
    $$('#view [data-blk]').forEach(c=>{const go_=()=>htBlocoDlg(t,h,...P(c));c.onclick=go_;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go_()}};
      c.ondragstart=e=>{vHorario._arr=P(c);try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',c.dataset.blk)}catch(_){}c.classList.add('htarr')};c.ondragend=()=>{c.classList.remove('htarr');vHorario._arr=null;$$('#view .htdrop').forEach(x=>x.classList.remove('htdrop'))};alvo(c,()=>P(c))});
    $$('#view .htf[data-cel]').forEach(f=>alvo(f,()=>f.dataset.cel.split('|').map(Number)))}}catch(e){console.warn(e)}return r}}

/* ---------- Matriz Curricular (Coord. PROFIJ): grupos de UFCD ---------- */
{const _ah=cpmAulasHor;cpmAulasHor=function(a,nome,d){const r=_ah.apply(this,arguments);try{if(!d||!d.grupo||!r.length)return r;const h=horarioDe(a,nome);if(!ufTemLetras(h))return r;return r.filter(x=>x.g===d.grupo)}catch(_){return r}}}
{const _sq=cpmSeq;cpmSeq=function(R){const sv=R.map(r=>r.d.sig);try{R.forEach(r=>{if(r.d.grupo&&r.d.sig&&r.d.sig.length)r.d.sig=r.d.sig.concat('§'+r.d.grupo)});return _sq.apply(this,arguments)}finally{R.forEach((r,i)=>r.d.sig=sv[i])}}}
function cpmGruposHTML(a,nome){const M=cpmM(nome);const U=M.disc.filter(d=>d.comp==='tecnologica');if(!U.length)return '';const h=horarioDe(a,nome);const G=ufGruposMat(M);const gs=Object.keys(G).sort();
  const profs=[...new Set([...(h?h.legenda.filter(l=>ufSiglas(h).includes(l.ab)).flatMap(l=>l.profs):[]),...M.disc.map(d=>d.prof)].filter(Boolean).map(p=>typeof profNome==='function'?profNome(p):p))].sort((x,y)=>x.localeCompare(y,'pt'));
  const tl=g=>h?h.aulas.filter(x=>x.g===g).length:0;
  return `<section class="card cpm-gr"><h2 style="margin:0 0 6px">${ic('layers',18)} Grupos de UFCD</h2>
    <p class="hint" style="margin-top:0">Junte as UFCD em grupos (A a Z) e indique o professor de cada grupo. No horário da turma, cada bloco «UFCD» leva a letra do grupo (Turma › Horário, ou aqui por baixo): a matriz conta as aulas de cada UFCD só nos tempos do seu grupo, e cada professor vê como suas as aulas do seu grupo — também nas alterações semanais ao horário base.</p>
    ${gs.length?`<div class="tblw"><table class="lst cpm-grt"><thead><tr><th>Grupo</th><th>Professor(a)</th><th>UFCD</th><th class="n">Horas</th><th class="n">Tempos / semana</th></tr></thead><tbody>${gs.map(g=>`<tr><td><b class="cpm-gl">${g}</b></td><td><input list="cpm-grpl" data-cgp="${g}" value="${esc(ufProfGrupo(M,g))}" placeholder="Professor(a) do grupo ${g}" aria-label="Professor do grupo ${g}"></td><td>${G[g].map(d=>esc(d.det||d.nome)).join(', ')}</td><td class="n">${G[g].reduce((s,d)=>s+(+d.horas||0),0)}</td><td class="n">${h?(tl(g)||'<span class="tag w">por marcar</span>'):'—'}</td></tr>`).join('')}</tbody></table></div><datalist id="cpm-grpl">${profs.map(p=>`<option value="${esc(p)}">`).join('')}</datalist>`:''}
    <details class="cpm-grd" ${gs.length?'':'open'}><summary>${gs.length?'Mudar as UFCD de cada grupo':'Criar os grupos'}</summary><div class="hugl">${U.map(d=>`<label><select data-cgu="${esc(d.id)}" aria-label="Grupo de ${esc(d.nome)}"><option value="">—</option>${AZ_.map(g=>`<option ${d.grupo===g?'selected':''}>${g}</option>`).join('')}</select><span>${esc(d.nome)}${d.horas?` <span class="mut">· ${d.horas} h</span>`:''}</span></label>`).join('')}</div></details>
    ${h&&gs.length&&ufSiglas(h).length?`<details class="cpm-grd"><summary>Marcar os blocos «UFCD» do horário</summary><div class="cpm-grh">${(()=>{const L=[];h.aulas.filter(x=>ufSiglas(h).includes(x.ab)).sort((x,y)=>x.dia-y.dia||x.ini-y.ini).forEach(x=>{const p=L[L.length-1];if(p&&p.dia===x.dia&&p.g===(x.g||'')&&x.ini-p.fim<=5){p.fim=x.fim;p.X.push(x)}else L.push({dia:x.dia,ini:x.ini,fim:x.fim,g:x.g||'',X:[x]})});
      return L.map((b,i)=>`<label><span>${DIAS[b.dia]} ${fmtHM(b.ini)}–${fmtHM(b.fim)}</span><select data-cgb="${i}" aria-label="Grupo do bloco de ${DIAS[b.dia]} ${fmtHM(b.ini)}"><option value="">—</option>${gs.map(g=>`<option ${b.g===g?'selected':''} value="${g}">UFCD ${g}${ufProfGrupo(M,g)?' · '+esc(ufProfGrupo(M,g)):''}</option>`).join('')}</select></label>`).join('')})()}</div></details>`:''}</section>`}
function cpmGruposBind(v,a,nome){const M=cpmM(nome);const h=horarioDe(a,nome);const fim=txt=>{save();try{audit('Coord. PROFIJ','Grupos de UFCD · '+nome,txt)}catch(_){}vCProfij()};
  v.querySelectorAll('[data-cgu]').forEach(s=>s.onchange=()=>{const d=M.disc.find(x=>x.id===s.dataset.cgu);if(!d)return;if(s.value){d.grupo=s.value;const pf=ufProfGrupo(M,s.value);if(pf)d.prof=pf}else delete d.grupo;fim((d.det||d.nome)+' → '+(s.value||'sem grupo'))});
  v.querySelectorAll('[data-cgp]').forEach(i=>i.onchange=()=>{const g=i.dataset.cgp,p=i.value.trim();M.grpProf=M.grpProf||{};if(p)M.grpProf[g]=p;else delete M.grpProf[g];M.disc.forEach(d=>{if(d.grupo===g&&p)d.prof=p});fim('Grupo '+g+' → '+(p||'sem professor'))});
  if(h){const L=[];h.aulas.filter(x=>ufSiglas(h).includes(x.ab)).sort((x,y)=>x.dia-y.dia||x.ini-y.ini).forEach(x=>{const p=L[L.length-1];if(p&&p.dia===x.dia&&p.g===(x.g||'')&&x.ini-p.fim<=5){p.fim=x.fim;p.X.push(x)}else L.push({dia:x.dia,ini:x.ini,fim:x.fim,g:x.g||'',X:[x]})});
    v.querySelectorAll('[data-cgb]').forEach(s=>s.onchange=()=>{const b=L[+s.dataset.cgb];if(!b)return;b.X.forEach(x=>{if(s.value)x.g=s.value;else delete x.g});fim(DIAS[b.dia]+' '+fmtHM(b.ini)+' → '+(s.value?'UFCD '+s.value:'sem grupo'))})}}
{const _mh=cpmMatrizHTML;cpmMatrizHTML=function(a,C){const r=_mh.apply(this,arguments);try{const nome=UI.cpmT;if(!nome||!r.includes('<div data-cpz="pontos">'))return r;return r.replace('<div data-cpz="pontos">',cpmGruposHTML(a,nome)+'<div data-cpz="pontos">')}catch(e){console.warn(e);return r}}}
{const _mb=cpmBindMatriz;cpmBindMatriz=function(v,a){const r=_mb.apply(this,arguments);try{if(UI.cpmT)cpmGruposBind(v,a,UI.cpmT)}catch(e){console.warn(e)}return r}}
