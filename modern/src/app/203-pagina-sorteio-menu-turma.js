/* ===================== v0.975 · Página «Sorteio» no menu da turma (por baixo de Aulas e sumários) ===================== */
TITLES.sorteio='Sorteio';NEEDS_T.push('sorteio');
function vSorteio(){const t=T();if(!t)return go('turmas');const c=rodaCfg();const a=A();const AL=alunosAval(t);
  /* presenças da aula de hoje (se a chamada já foi feita) */
  let aus=new Set(),fonte='';try{const L=listaAulas(t,a);const x=aulaAtual(t,a);const s=x&&sumariosT(a,t)[x.k];if(s&&s.pres&&Object.keys(s.pres).length){AL.forEach(y=>{const f=(s.pres[y.id]||{}).f||'P';if(f!=='P')aus.add(y.id)});fonte='chamada da aula de '+fmtIso(x.data)+', '+fmtHM(x.ini)}}catch(_){}
  UI.sortFora=UI.sortFora&&UI.sortT===t.id?UI.sortFora:[...aus];UI.sortT=t.id;const fora=new Set(UI.sortFora);
  $('#view').innerHTML=`<div class="card sortpg"><div class="rodah"><span class="rodaico" aria-hidden="true"><i></i></span><div><h2 style="margin:0">Sorteio · ${esc(t.nome)}${t.disciplina?' · '+esc(t.disciplina):''}</h2><p class="mut">Escolher ao acaso um aluno, pares ou grupos, com roda ou cartas animadas. Abre em ecrã inteiro para projetar.</p></div></div>
    <div class="sortgo"><button type="button" class="sortbig" data-sq="um"><span>🎯</span><b>1 Aluno</b><small>Roda ou cartas</small></button><button type="button" class="sortbig" data-sq="pares"><span>👥</span><b>Pares</b><small>${Math.floor((AL.length-fora.size)/2)} pares</small></button>
      <div class="sortbig sortgr"><button type="button" data-sq="grupos"><span>🧩</span><b>Grupos</b></button><label>de <input type="number" id="so-n" min="2" max="12" value="${c.n}" inputmode="numeric" aria-label="Alunos por grupo"> alunos</label></div></div>
    <div class="row" style="gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px"><span class="mut">Estilo</span><div class="seg" role="group" aria-label="Estilo">${[['roda','Roda'],['cartas','Cartas']].map(([k,n])=>`<button type="button" class="btn sm ${c.estilo===k?'pri':''}" data-se="${k}" aria-pressed="${c.estilo===k}">${n}</button>`).join('')}</div><label class="chk" style="margin:0"><input type="checkbox" id="so-som" ${c.som?'checked':''}> Som</label><label class="chk" style="margin:0"><input type="checkbox" id="so-ret" ${c.retirar?'checked':''}> Não repetir o mesmo aluno</label></div></div>
  <div class="card"><div class="row" style="align-items:center;gap:8px;flex-wrap:wrap"><h2 style="margin:0">Quem entra no sorteio</h2><span class="tag">${AL.length-fora.size} de ${AL.length}</span><span class="sp1"></span><button class="btn sm" id="so-todos">Todos</button>${aus.size?`<button class="btn sm" id="so-cham">Como na Chamada</button>`:''}</div>
    <p class="hint">${fonte?'Os alunos que faltaram na '+esc(fonte)+' ficam de fora. ':''}Toque num aluno para o tirar ou voltar a pôr.</p>
    <div class="sortal">${AL.map(y=>`<button type="button" class="sortch ${fora.has(y.id)?'off':''}" data-sa="${y.id}" aria-pressed="${!fora.has(y.id)}">${avatar(y,40)}<span>${esc(numAl(y))}. ${esc(y.nome)}</span></button>`).join('')}</div></div>`;
  const ids=()=>AL.filter(y=>!fora.has(y.id)).map(y=>y.id);
  $$('#view [data-sq]').forEach(b=>b.onclick=()=>{c.modo=b.dataset.sq;save();rodaAbrir(t,ids())});
  $('#so-n').onchange=e=>{c.n=Math.max(2,Math.min(12,+e.target.value||4));e.target.value=c.n;save()};
  $$('#view [data-se]').forEach(b=>b.onclick=()=>{c.estilo=b.dataset.se;save();vSorteio()});
  $('#so-som').onchange=e=>{c.som=e.target.checked;save()};$('#so-ret').onchange=e=>{c.retirar=e.target.checked;save()};
  $$('#view [data-sa]').forEach(b=>b.onclick=()=>{const id=b.dataset.sa;fora.has(id)?fora.delete(id):fora.add(id);UI.sortFora=[...fora];vSorteio()});
  $('#so-todos').onclick=()=>{UI.sortFora=[];vSorteio()};const ch=$('#so-cham');if(ch)ch.onclick=()=>{UI.sortFora=[...aus];vSorteio()}}
{const _gSo=go;go=function(v){if(v==='sorteio'&&!rodaOn())v='aula';if(go._f&&go._f.sorteio!==vSorteio)go._f.sorteio=vSorteio;const r=_gSo.call(this,v);
  try{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="sumarios"]');let b=h&&h.querySelector('[data-v="sorteio"]');
    if(ref&&!b){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="sorteio" title="Sorteio: escolher ao acaso um aluno, pares ou grupos"><span data-ico="target"></span><span class="lbl">Sorteio</span></button>`);b=h.querySelector('[data-v="sorteio"]');b.querySelector('[data-ico]').innerHTML=ic('target',18);b.onclick=()=>go('sorteio')}
    ['#tnavHold','#tTree','#side'].forEach(sel=>{const H=document.querySelector(sel);if(!H)return;const su=H.querySelector('[data-v="sumarios"].nav'),so=H.querySelector('[data-v="sorteio"].nav');if(su&&so&&su.nextElementSibling!==so)su.after(so)});
    $$('[data-v="sorteio"].nav').forEach(x=>{x.classList.add('navsub');x.hidden=!rodaOn();x.classList.toggle('on',VIEW==='sorteio');x.disabled=!T()})}catch(e){console.warn(e)}return r};go._f=_gSo._f;if(go._f)go._f.sorteio=vSorteio}
