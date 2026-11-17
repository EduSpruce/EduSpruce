/* ---------- dia: detalhe (toque num dia, sem modo de edição) ---------- */
function diaDlg(iso){
  const a=A(),c=a.calendario;const tp=c.dias[iso]||'nao';const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;const d=dataDeIso(iso);
  const per=(c.periodos.find(p=>iso>=p.ini&&iso<=p.fim)||{}).n;const W=c.periodos.length===2?'semestre':'período';
  const termo=(c.termos||[]).find(x=>x.data===iso);
  const aulas=[];turmasFiltradas(a).forEach(t=>blocos(aulasTurma(t,a)).filter(b=>b.dia===d.getDay()).forEach(b=>aulas.push({...b,t,ok:letivoPara(t,iso)})));
  aulas.sort((x,y)=>x.ini-y.ini);
  openDrawer(DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()+1]+' de '+d.getFullYear(),`<div class="ed">
    <div class="diah"><span class="sw lg ${tp==='nao'?'nao':''}" style="background:${T_.cor||''}"></span><div><b>${esc(T_.n)}</b><div class="mut">${per?per+'.º '+W:'Fora dos '+(W==='semestre'?'semestres':'períodos')}${(c.notas||{})[iso]?' · '+esc(c.notas[iso]):''}</div></div></div>
    ${termo?`<div class="alert">${ic('flag',15)} Termo das aulas: ${esc(anosTxt(termo.anos))}</div>`:''}
    <h3>As Suas Aulas Neste Dia</h3>
    ${aulas.length?aulas.map(x=>`<div class="lin ${x.ok?'':'off'}"><span class="hh">${fmtHM(x.ini)}–${fmtHM(x.fim)}</span><b>${esc(x.t.nome)}</b> ${esc(x.t.disciplina)}${x.sala?`<span class="mut">Sala ${esc(x.sala)}</span>`:''}<span class="sp1"></span>${x.ok?'':'<span class="tag">sem aula</span>'}</div>`).join(''):'<p class="mut">Sem aulas no horário neste dia da semana.</p>'}
    <h3>Alterar Este Dia</h3>
    <div class="cpin dd">${Object.keys(TIPOS_DIA).map(k=>`<button type="button" data-dt="${k}" class="${tp===k?'on':''}"><span class="sw ${k==='nao'?'nao':''}" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}</button>`).join('')}</div>
    <label>Nota</label><input id="dd-nota" value="${esc((c.notas||{})[iso]||'')}" placeholder="ex.: Visita de estudo, Reunião de avaliação…">
  </div>`);
  $$('#dw-b [data-dt]').forEach(b=>b.onclick=()=>{pintarDia(iso,b.dataset.dt);diaDlg(iso);vCalendario()});
  $('#dd-nota').onchange=e=>{c.notas=c.notas||{};const v=e.target.value.trim();if(v)c.notas[iso]=v;else delete c.notas[iso];save();vCalendario()};
}

