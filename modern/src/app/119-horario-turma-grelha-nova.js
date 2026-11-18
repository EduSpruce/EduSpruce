/* ---------- Horário da turma: grelha nova (blocos contínuos, turnos lado a lado, cor por disciplina) ---------- */
/* 0.924 · cor por disciplina: tons fixos e bem separados para as disciplinas habituais (antes várias saíam no mesmo verde) */
const COR_DISC=[[/^(PORT|PT|LP|PLNM)/,215],[/^MAT|^MACS/,28],[/^(ING|LE ?I(?!I)|LEI\b)/,195],[/^(FRAN|LE ?II|LEII|ALEM|ESP|FR\b)/,338],[/^FIL/,258],[/^(EF|ED\.? ?F)/,46],[/^(BIO|CN|CIEN|BG)/,138],[/^(FQ|FIS|QUI|CFQ)/,2],[/^(HIST|HGP|HCA)/,178],[/^GEO/,292],[/^(TIC|INF|APLIC|AI\b|PROG)/,88],[/^(EV|ET|EDV|DES|GD|ART|HCA)/,318],[/^(MUS|EM\b)/,272],[/^(EMRC|EMR|REL)/,60],[/^(CID|DAC|OF|OC)/,160],[/^(ECON|ECO|SOC|PSI)/,232]];
const corSigla=ab=>{const k=String(ab||'').trim().toUpperCase();for(const [r,h] of COR_DISC)if(r.test(k))return h;let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))%997;return [8,22,52,72,105,120,150,168,205,225,245,265,282,305,328,350][h%16]};
function grelhaTurma(aulas,o){o=o||{};if(!aulas.length)return '<div class="empty">Sem aulas.</div>';
  const ds=[1,2,3,4,5,...(aulas.some(a=>a.dia===6)?[6]:[])];const S_=[];[...(o.slots||[]),...aulas].forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});S_.sort((x,y)=>x.ini-y.ini);
  /* linhas: tempos + intervalos (≥15 min) */
  const R=[];S_.forEach((s,i)=>{if(i&&s.ini-S_[i-1].fim>=15)R.push({pausa:true,ini:S_[i-1].fim,fim:s.ini});R.push(s)});
  const rowDe=ini=>R.findIndex(r=>!r.pausa&&r.ini===ini);
  const hoje=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes();
  const chave=L=>L.map(a=>a.ab+'@'+(a.sala||'')).sort().join('|');
  let blocos='';
  ds.forEach((d,ci)=>{let i=0;while(i<R.length){const r=R[i];if(r.pausa){i++;continue}const L=aulas.filter(a=>a.dia===d&&a.ini===r.ini);if(!L.length){i++;continue}
    /* junta tempos seguidos com as mesmas aulas */
    let j=i,k=chave(L);while(true){let n=j+1;if(n<R.length&&R[n].pausa)break;if(n>=R.length)break;const L2=aulas.filter(a=>a.dia===d&&a.ini===R[n].ini);if(!L2.length||chave(L2)!==k)break;j=n}
    const ini=r.ini,fim=R[j].fim;const now=d===hoje&&ini<=mins&&fim>mins;const n=j-i+1;
    blocos+=`<div class="htb ${now?'agora':''}" style="grid-column:${ci+2};grid-row:${i+2}/${j+3}">${L.map(a=>{const m=o.minha&&o.minha(a);return `<div class="htc ${m?'minha':''}"${o.attr?o.attr(a,ini,fim):''} style="--h:${corSigla(a.ab)}" title="${esc((o.titulo?o.titulo(a):a.ab)+' · '+fmtHM(ini)+'–'+fmtHM(fim)+(a.sala?' · Sala '+a.sala:''))}"><b>${esc(a.ab)}</b>${a.sala?`<span class="hts">${esc(a.sala)}</span>`:''}${n>1?`<span class="htt">${fmtHM(ini)}–${fmtHM(fim)}</span>`:''}${o.extra?o.extra(a,ini,fim):''}</div>`}).join('')}</div>`;i=j+1}});
  const cab=`<div class="hth hhd"></div>${ds.map((d,ci)=>`<div class="hth ${d===hoje?'hj':''}" style="grid-column:${ci+2}">${DIAS[d]}</div>`).join('')}`;
  const tms=R.map((r,i)=>r.pausa?`<div class="htp" style="grid-row:${i+2};grid-column:1/-1"><span>${r.fim-r.ini>=45?'Almoço':'Intervalo'} · ${fmtHM(r.ini)}–${fmtHM(r.fim)}</span></div>`:`<div class="htm" style="grid-row:${i+2}"><b>${fmtHM(r.ini)}</b><span>${fmtHM(r.fim)}</span></div>`).join('');
  const fundos=R.map((r,i)=>r.pausa?'':ds.map((d,ci)=>`<div class="htf ${d===hoje?'hj':''}" data-cel="${d}|${r.ini}" style="grid-row:${i+2};grid-column:${ci+2}"></div>`).join('')).join('');
  const rows=R.map(r=>r.pausa?'22px':'minmax(54px,auto)').join(' ');
  return `<div class="htw" role="region" aria-label="Horário semanal" tabindex="0"><div class="htg" style="grid-template-columns:62px repeat(${ds.length},minmax(110px,1fr));grid-template-rows:auto ${rows}">${cab}${fundos}${tms}${blocos}</div></div>`}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=horarioDe(a,UI.horC);if(!h)return r;
  const old=$('#view .card.wide div[style*="overflow:auto"]:has(> table.hor)')||($('#view table.hor')||{}).parentElement;if(!old)return r;
  const minhas=aulasTurma(t);const sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);
  const tit=x=>{const l=h.legenda.find(l=>l.ab===x.ab);return l?l.nome+(l.profs.length?' — '+l.profs.join(', '):''):x.ab};
  const wrap=document.createElement('div');wrap.innerHTML=grelhaTurma(h.aulas,{minha:x=>sig.includes(x.ab)&&(!minhas.some(m=>m.prof)||minhas.some(m=>m.dia===x.dia&&m.ini===x.ini)),titulo:tit,...(typeof htGrelhaOpts==='function'?htGrelhaOpts(t,h,x=>sig.includes(x.ab)&&(!minhas.some(m=>m.prof)||minhas.some(m=>m.dia===x.dia&&m.ini===x.ini))):{})});old.replaceWith(wrap.firstElementChild);
  const usadas=[...new Set(h.aulas.map(x=>x.ab))];const leg=h.legenda.filter(l=>usadas.includes(l.ab));
  const g=$('#view .htw');if(g&&leg.length)g.insertAdjacentHTML('afterend',`<div class="htleg">${leg.map(l=>`<span class="htl ${sig.includes(l.ab)?'minha':''}" style="--h:${corSigla(l.ab)}"><b>${esc(l.ab)}</b> ${esc(l.nome)}${l.profs.length?` <span class="mut">· ${esc(l.profs.map(p=>profNome(p)).join(', '))}</span>`:''}</span>`).join('')}</div>`);
  const lg=$('#view .card.wide .leg');if(lg)lg.innerHTML=`<span class="htl minha" style="--h:0;padding:2px 8px"><b>${esc(t.disciplina)}</b></span>`;
  }catch(e){console.warn(e)}return r}}

/* ecrãs muito largos: coluna à esquerda (Horário da turma: Aulas Previstas e Próximas Aulas) */
const LADO_ESQ={horario:[/^Aulas Previstas/,/^Próximas Aulas/]};
{const _ll=layoutLado;layoutLado=function(){const r=_ll.apply(this,arguments);try{const v=$('#view');const lay=v&&v.querySelector(':scope>.vlay');const R=LADO_ESQ[VIEW];
  if(!lay||!R)return r;let esq=lay.querySelector(':scope>.vesq');const larga=v.clientWidth>=1780;
  const cards=[...lay.querySelectorAll(':scope>.vside>.card,:scope>.vmain>.card,:scope>.vesq>.card')].filter(c=>{const h=c.querySelector('h2');return h&&R.some(x=>x.test(h.textContent.trim()))});
  if(larga){if(!esq){esq=document.createElement('div');esq.className='vesq';lay.prepend(esq)}cards.forEach(c=>{if(c.parentElement!==esq)esq.appendChild(c)});lay.classList.add('vlay3')}
  else if(esq){const s=lay.querySelector(':scope>.vside');cards.forEach(c=>s&&s.appendChild(c));esq.remove();lay.classList.remove('vlay3')}}catch(e){console.warn(e)}return r}}
addEventListener('resize',()=>{clearTimeout(layoutLado._e);layoutLado._e=setTimeout(()=>{try{layoutLado()}catch(_){}},120)});

/* Nova Turma (curso profissional): disciplina principal e outras disciplinas do ensino profissional */
function ntProfDisc(){const sd=$('#nt-disc');const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';if(!sd)return;
  if(of==='profissional'){if(!sd.dataset.orig)sd.dataset.orig=sd.innerHTML;const todos=DISC_PROF.flatMap(([g,L])=>L.map(n=>[g,n]));const meus=todos.filter(([,n])=>discAno().includes(discKey(n,'sec')));const L=meus.length?meus:todos;const cur=sd.value;
    sd.innerHTML=DISC_PROF.map(([g])=>{const X=L.filter(x=>x[0]===g);return X.length?`<optgroup label="Componente ${esc(g)}">${X.map(([,n])=>`<option value="${esc(discKey(n,'sec'))}">${esc(n)}</option>`).join('')}</optgroup>`:''}).join('')+'<option value="__outra">Outra…</option>';
    if([...sd.options].some(o=>o.value===cur))sd.value=cur;sd.dispatchEvent(new Event('change'))}
  else if(sd.dataset.orig){sd.innerHTML=sd.dataset.orig;delete sd.dataset.orig;sd.dispatchEvent(new Event('change'))}}
{const _nt4=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt4.apply(this,arguments);try{const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ntProfDisc,20));setTimeout(ntProfDisc,30);
  const lb=$('#nt-modw label');if(lb)lb.innerHTML='Módulos / UFCD / UC desta turma <span class="mut">(da disciplina que leciona — marque no quadro do curso ou escreva: código ; designação ; horas)</span>'}catch(e){console.warn(e)}return res}}

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tvadd]');if(!b)return;e.preventDefault();go('turmas');setTimeout(()=>{const c=[...document.querySelectorAll('#view .card')].find(x=>x.querySelector('#t-pdf,#t-new'));if(c){c.scrollIntoView({behavior:'smooth',block:'start'});const f=c.querySelector('#t-pdf')||c.querySelector('#t-new');if(f)f.focus({preventScroll:true})}},150)});

/* Barra lateral: turmas com várias disciplinas agrupadas (uma linha por turma, disciplinas como sub-escolha) */
navTurmas=function(){const tree=$('#tTree'),hold=$('#tnavHold'),hd=$('#navTurmas');if(!tree||!hold||!hd)return;
  const a=A();const TF=a?turmasFiltradas(a):[];const ab=S.cfg.navTurmas!==false;
  const exp=S.turmaAtiva&&UI.navTFech!==S.turmaAtiva?S.turmaAtiva:null;
  hd.classList.toggle('aberto',ab);hd.setAttribute('aria-expanded',String(ab));hd.querySelector('.chev').innerHTML=ic('chev',13);
  const kids=[...document.querySelectorAll('#side .tnav')];kids.forEach(k=>hold.appendChild(k));
  const gT=$('#grpT');const uma=TF.length===1;hd.style.display=uma?'none':'';if(gT)gT.style.display=uma?'':'none';tree.classList.toggle('uma',uma);
  if(uma){const t=TF[0];if(S.turmaAtiva!==t.id){S.turmaAtiva=t.id}if(gT)gT.innerHTML=anoBadge(t,'sm')+' Turma '+esc(t.nome);tree.innerHTML='';kids.forEach(k=>{tree.appendChild(k);k.disabled=false});navModular();return}
  if(!ab){tree.innerHTML='';return}
  if(!TF.length){tree.innerHTML='<div class="tvazio"><span class="lbl">Sem turmas</span><button type="button" class="btn sm tvadd" data-tvadd title="Adicionar turma">'+ic('plus',14)+'<span class="lbl">Adicionar Turma</span></button></div>';return}
  /* agrupar por turma (nome + escola) mantendo a ordem */
  const G=[];TF.forEach(t=>{const k=t.nome+'|'+escId(escolaDe(t));let g=G.find(x=>x.k===k);if(!g){g={k,nome:t.nome,L:[]};G.push(g)}g.L.push(t)});
  tree.innerHTML=G.map(g=>{const t0=g.L[0];
    if(g.L.length===1){const t=t0;return `<button class="nav tnode ${t.id===exp?'aberto':''} ${t.id===S.turmaAtiva?'cur':''}" data-tt="${t.id}" title="${esc(t.nome+' · '+t.disciplina)}" aria-expanded="${t.id===exp}">${anoBadge(t,'sm')}<span class="lbl"><b>${esc(t.nome)}</b><span class="tdisc">${esc(t.disciplina)}</span></span><span class="chev">${ic('chev',12)}</span></button><div class="tkids" data-tk="${t.id}"></div>`}
    const ativa=g.L.find(t=>t.id===S.turmaAtiva);const aberto=!!(ativa&&exp===ativa.id);
    return `<button class="nav tnode tgrp ${aberto?'aberto':''} ${ativa?'cur':''}" data-tgk="${esc(g.k)}" title="${esc(g.nome+' · '+g.L.map(t=>t.disciplina).join(', '))}" aria-expanded="${aberto}">${anoBadge(t0,'sm')}<span class="lbl"><b>${esc(g.nome)}</b><span class="tdisc">${ativa&&aberto?esc(ativa.disciplina):g.L.length+' disciplinas'}</span></span><span class="tcnt" aria-hidden="true">${g.L.length}</span><span class="chev">${ic('chev',12)}</span></button>
      ${aberto?`<div class="tdsel" role="radiogroup" aria-label="Disciplina em ${esc(g.nome)}">${g.L.map(t=>`<button type="button" role="radio" aria-checked="${t.id===S.turmaAtiva}" class="tdsb ${t.id===S.turmaAtiva?'on':''}" data-tt="${t.id}" title="${esc(t.disciplina)}"><span class="tdd" style="--h:${corSigla(siglaDe(t))}"></span><span class="lbl">${esc(t.disciplina)}</span></button>`).join('')}</div><div class="tkids" data-tk="${ativa.id}"></div>`:''}`}).join('');
  if(exp){const box=tree.querySelector(`[data-tk="${exp}"]`);if(box)kids.forEach(k=>box.appendChild(k))}
  const escolhe=id=>{if(S.turmaAtiva===id&&UI.navTFech!==id){UI.navTFech=id;navTurmas();return}
    UI.navTFech=null;const menu=document.body.classList.contains('menu');
    if(S.turmaAtiva!==id){S.turmaAtiva=id;save();UI.inst=null;go('painel')}else{navTurmas();if(VIEW!=='painel'&&!NEEDS_T.includes(VIEW))go('painel')}
    if(menu)document.body.classList.add('menu');const box=tree.querySelector(`[data-tk="${id}"]`);if(box&&box.animate)box.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'})};
  tree.querySelectorAll('.tnode[data-tt]').forEach(b=>b.onclick=()=>escolhe(b.dataset.tt));
  tree.querySelectorAll('.tdsb[data-tt]').forEach(b=>b.onclick=()=>{const id=b.dataset.tt;if(S.turmaAtiva===id)return;UI.navTFech=null;escolhe(id)});
  tree.querySelectorAll('[data-tgk]').forEach(b=>b.onclick=()=>{const g=G.find(x=>x.k===b.dataset.tgk);const ativa=g.L.find(t=>t.id===S.turmaAtiva);if(ativa)escolhe(ativa.id);else{UI.navTFech=null;escolhe(g.L[0].id)}})};
setTimeout(()=>{try{navTurmas()}catch(_){}},0);

/* Código interno obrigatório nas turmas de curso profissional */
{const _nt5=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt5.apply(this,arguments);try{const of=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};
  const rot=()=>{const lb=$('label[for="nt-cod"]');const i=$('#nt-cod');if(!lb||!i)return;const pr=of()==='profissional';lb.innerHTML=pr?'Código interno <span class="obr" aria-hidden="true">*</span>':'Código interno <span class="mut">(opcional)</span>';i.required=pr;i.setAttribute('aria-required',pr?'true':'false')};
  rot();const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(rot,30));
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){const i=$('#nt-cod');if(of()==='profissional'&&i&&!i.value.trim()){i.classList.add('erro');i.focus();toast('Indique o código interno da turma (obrigatório nos cursos profissionais).','erro');return}return orig.apply(this,arguments)}}
  const i=$('#nt-cod');if(i)i.addEventListener('input',()=>i.classList.remove('erro'))}catch(e){console.warn(e)}return res}}

/* introdução de códigos: teclado numérico com pontos (substitui as caixas do browser) */
function pinDialog(o){o=o||{};const N=o.n||4;return new Promise(res=>{let v='';let ocup=false;const d=document.createElement('dialog');d.className='pindlg';d.setAttribute('aria-labelledby','pd-t');d.setAttribute('aria-describedby','pd-s');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','⌫'];
  d.innerHTML=`<div class="pdh"><span class="pdi">${ic('shield',26)}</span><h2 id="pd-t">${esc(o.t||'Código')}</h2><p id="pd-s" class="mut">${esc(o.s||'')}</p></div>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de ${N} algarismos">${Array.from({length:N},()=>'<i></i>').join('')}</div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x" aria-label="Cancelar">Cancelar</button>`:k==='⌫'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)||'⌫'}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>`;
  document.body.appendChild(d);const dots=d.querySelector('.pdots'),er=d.querySelector('.pderr');
  const pinta=()=>{dots.querySelectorAll('i').forEach((x,i)=>x.classList.toggle('on',i<v.length));dots.setAttribute('aria-label',v.length+' de '+N+' algarismos')};
  const fim=x=>{try{d.close()}catch(_){}d.remove();document.removeEventListener('keydown',kb,true);res(x)};
  const abana=m=>{er.textContent=m||'';dots.classList.remove('abana');void dots.offsetWidth;dots.classList.add('abana');if(navigator.vibrate)try{navigator.vibrate(120)}catch(_){}};
  const tecla=async k=>{if(ocup)return;if(k==='x')return fim(null);if(k==='b'){v=v.slice(0,-1);pinta();return}if(v.length>=N)return;v+=k;er.textContent='';pinta();
    if(v.length===N){ocup=true;await new Promise(r=>setTimeout(r,140));const ok=o.verifica?await o.verifica(v):true;if(ok){dots.classList.add('ok');setTimeout(()=>fim(v),160)}else{abana(o.erro||'Código incorreto.');setTimeout(()=>{v='';pinta()},380)}ocup=false}};
  const kb=e=>{if(!d.isConnected)return;if(e.target&&e.target.closest&&e.target.closest('dialog')!==d&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}else if(e.key==='Escape'){e.preventDefault();fim(null)}};document.addEventListener('keydown',kb,true);
  d.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{tecla(b.dataset.pk);b.classList.remove('prem');void b.offsetWidth;b.classList.add('prem')});d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  try{d.showModal()}catch(_){d.setAttribute('open','')}const f=d.querySelector('[data-pk="1"]');if(f)f.focus()})}
if(!ICONS.arrowL)ICONS.arrowL='<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-6 6M11 9l6 6"/>';


