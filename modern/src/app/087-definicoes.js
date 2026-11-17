/* =====================================================================
   DEFINIÇÕES
   ===================================================================== */
let defFiltro='';
function vDefGeral(){
  const c=S.cfg,a=A();
  const grupos=Object.entries(CICLOS).map(([k,n])=>({k,n,l:DISCIPLINAS.filter(d=>d.c.includes(k))}));
  $('#view').innerHTML=`
  <div class="card ed"><h2>Escola e professor</h2>
    <div class="g2"><div><label>Escola <a href="#" id="go-esc" class="lnk">Logotipo e dados da escola ›</a></label><input data-c="escola" value="${esc(c.escola)}" placeholder="Escola Básica e Secundária…"></div>
      <div><label>Ano letivo</label><div class="anotxt">${ic('calendar',16)} <b>${esc((A()||{}).nome||'—')}</b> <span class="mut">· escolhido no início de sessão</span></div></div></div>
    <div class="g2"><div><label>Nome do professor</label><input data-c="professor" value="${esc(c.professor)}"></div><div><label>E-mail institucional <span class="mut">(${esc(nomeEscola(EC()))})</span></label><div class="anotxt">${esc(emailProf()||'—')} <a href="#" class="lnk" data-gopf="1">Editar no separador Professor ›</a></div></div></div></div>
  <div class="card ed"><div class="row"><h2 style="margin:0">${ic('book',18)} Disciplinas que Leciono</h2><span class="sp1"></span><button class="btn sm" data-godisc="1">${ic('school',14)} Escolher em Ano Letivo e Turmas ›</button></div><p class="hint" style="margin:6px 0 0">As disciplinas são escolhidas <b>por ano letivo</b> (um professor pode lecionar disciplinas diferentes de ano para ano). </p>${A()?`<div class="discchips"><span class="mut">Em ${esc(A().nome)}:</span>${minhasDisc().length?minhasDisc().map(d=>`<span class="discchip">${discIc(d)}<b>${esc(d)}</b></span>`).join(''):'<span class="mut">nenhuma escolhida</span>'}</div>`:''}<p class="hint" style="margin:6px 0 0">${A()&&ufcdAno().length?`<br><b>Unidades que leciono (${ufcdAno().length}):</b> `+ufcdAno().map(u=>esc((/^uc/i.test(u.tipo||'')?'UC ':'UFCD ')+u.cod+' '+u.nome)).join(' · ')+'.':''}</p></div>
  <div class="card ed tpcard"><div class="row"><h2 style="margin:0">Tipos de instrumento</h2><span class="sp1"></span><button type="button" class="btn sm" id="tp-rep">${ic('refresh',13)} Repor Predefinidos</button></div><p class="hint" style="margin:6px 0 10px">Os tipos aparecem ao criar instrumentos e na marcação de testes. Arraste para ordenar; os tipos em uso não podem ser removidos.</p><div id="tpEd"></div><textarea id="tp" hidden>${esc(c.tipos.join('\n'))}</textarea></div>
  <div class="card"><div class="row"><h2 style="margin:0">Tipos de Tempo Não Letivo</h2><span class="sp1"></span><button class="btn" id="d-tnl">${ic('sliders',15)} Gerir Tipos</button></div><div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">${nlTipos().map(x=>`<span class="nlb" style="--nc:${x.cor}" title="${esc(x.n)}">${esc(x.sig)}</span>`).join('')}</div></div>
  <div class="card ed"><h2>Textos da síntese descritiva</h2><p class="hint">{dom} = domínio, {oa} = o/a, {aluno} = aluno/aluna, {nome} = primeiro nome, {turma}, {disciplina}, {periodo} (ex.: 1.º período), {mencao}.</p>
    ${Object.keys(SINTESE_DEF).map(k=>`<label>${esc(k)}</label><textarea data-s="${esc(k)}" style="min-height:60px;margin-bottom:8px">${esc(c.sinteses[k]||'')}</textarea>`).join('')}</div>
  `;
  $$('[data-c]').forEach(el=>el.oninput=()=>{c[el.dataset.c]=el.value;save()});
  if($('#c-ano'))$('#c-ano').onchange=e=>{if(e.target.value==='__novo'){const n=prompt('Ano letivo',sugAno());if(n&&/^\d{4}\/\d{4}$/.test(n.trim())&&!S.anos.some(x=>x.nome===n.trim()))novoAno(n.trim());else if(n)alert('Formato 2026/2027, e que ainda não exista.')}else{S.anoAtivo=e.target.value;const x=A();S.turmaAtiva=x&&x.turmas[0]?x.turmas[0].id:null;save()}go('definicoes')};
  $('#tp').onchange=e=>{c.tipos=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);save();toast('Tipos guardados')};
  $$('[data-s]').forEach(el=>el.oninput=()=>{c.sinteses[el.dataset.s]=el.value;save()});
  $('#d-tnl').onclick=()=>gerirTiposNL(()=>{closeDrawer();go('definicoes')});
  const ge=$('#go-esc');if(ge)ge.onclick=e=>{e.preventDefault();go('escola')};
}

