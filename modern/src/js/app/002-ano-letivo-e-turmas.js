/* =====================================================================
   ANO LETIVO E TURMAS
   ===================================================================== */
function novoAno(nome){const a=prepAno({id:uid(),nome:nome||anoAuto(),turmas:[]});a.org='periodo';S.anos.push(a);S.anos.sort((x,y)=>y.nome.localeCompare(x.nome));S.anoAtivo=a.id;S.turmaAtiva=null;save();return a}
function vTurmas(){
  const a=A();const TF=turmasFiltradas(a);
  barBtns([{id:'b-na',t:'+ Ano letivo',f:()=>{const n=prompt('Ano letivo (ex.: '+anoAuto()+')',sugAno());if(!n)return;if(!/^\d{4}\/\d{4}$/.test(n.trim()))return alert('Use o formato 2026/2027.');if(S.anos.some(x=>x.nome===n.trim()))return alert('Esse ano letivo já existe.');novoAno(n.trim());go('turmas')}}]);
  if(!a){$('#view').innerHTML=`<div class="card empty">Comece por criar o ano letivo.<br><br><button class="btn pri" id="mkA">Criar ano letivo ${anoAuto()}</button></div>`;$('#mkA').onclick=()=>{novoAno(anoAuto());go('turmas')};return}
  $('#view').innerHTML=`
  <div class="card ed"><div class="row"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span>
    <span class="oa" style="font-size:13px;color:var(--mut)">Organização do ano</span><div class="seg" role="group" aria-label="Organização do ano letivo">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>
    <button class="btn sm dng" id="a-del">Apagar ano letivo</button></div></div>
  <div class="card"><div class="row" style="margin-bottom:12px"><h2 style="margin:0">Turmas</h2><span class="sp1"></span>
    <button class="btn pri" id="t-pdf">+ Turma a partir do Excel</button>${dicaExcel()}<button class="btn" id="t-new">+ Turma vazia</button>${a.turmas.filter(x=>!x.origens).length>1?'<button class="btn" id="t-join">⇄ Juntar turmas</button>':''}<button class="btn" id="t-hor">${ic('calendar',15)} Importar horários</button></div>
    ${a.turmas.length?(TF.length?`<table class="lst"><thead><tr><th>Turma</th><th>Disciplina</th><th>Alunos</th><th>Instrumentos</th><th>Horário</th><th></th></tr></thead><tbody>
    ${gruposOferta(TF).map(g=>`<tr class="gr"><td colspan="6"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)}</td></tr>`+g.L.map(t=>{const ta=aulasTurma(t,a);return `<tr${t.id===S.turmaAtiva?' style="background:var(--acc2)"':''}><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b>${turmasDaClasse(t).some(n=>souDT(A(),n))?` <span class="tag dt" title="É ${tituloDT(S.cfg.professor,false)} desta turma">${ic('crown',11)} ${tituloDT(S.cfg.professor)}</span>`:''}${t.origens?` <span class="tag" title="Turma conjunta">conjunta: ${esc(t.origens.join(' + '))}</span>`:''}${ofertaTag(t)}</div></div></td><td>${esc(t.disciplina)||'<span class="neg">por definir</span>'}<div class="hint">${esc(t.anoEsc||'')} ano · ${esc(CICLOS[t.ciclo]||'')}${t.cnq?' · '+esc(t.cnq.nome):''}${t.codigo?' · <span class="tag">'+esc(t.codigo)+'</span>':''}</div></td><td title="na disciplina / na turma">${alunosAval(t).length} / ${t.alunos.length}</td><td>${t.instrumentos.length}</td>
      <td><div class="row" style="gap:6px;flex-wrap:nowrap">${ta.length?`<span class="tag">${ta.length} tempos/sem.</span>`:turmasDaClasse(t).some(c=>horarioDe(a,c))?'<span class="mut">disciplina não reconhecida</span>':'<span class="mut">—</span>'}${ta.length||turmasDaClasse(t).some(c=>horarioDe(a,c))?`<button class="btn sm ico dng" data-hxt="${t.id}" title="Apagar horário desta turma" aria-label="Apagar horário">${ic('calx',15)}</button>`:''}</div></td>
      <td class="act"><button class="btn sm" data-open="${t.id}">Abrir</button> <button class="btn sm ico" data-edt="${t.id}" title="Editar turma" aria-label="Editar turma">${ic('pencil',15)}</button> <button class="btn sm" data-dup="${t.id}" title="Mesma turma, outra disciplina">+ Disciplina</button> <button class="btn sm ico dng" data-del="${t.id}" title="Apagar turma" aria-label="Apagar turma">${ic('trash',15)}</button></td></tr>`}).join('')).join('')}</tbody></table>`:`<div class="empty">Sem turmas${S.filtroOferta&&OFERTAS[S.filtroOferta]?' de '+OFERTAS[S.filtroOferta].nome:''}${todasEscolas().length>1?' em '+esc(nomeEscola(EC())):''}. Crie uma turma ou importe a lista de alunos.</div>`)
    :`<div class="drop" id="t-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Os alunos são lidos automaticamente; depois assinala os que frequentam a sua disciplina.</span></div>`}
  </div>
  ${Object.keys(a.horarios||{}).length?`<div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">Horários Importados</h2><span class="sp1"></span></div>
    <div class="hcards">${Object.entries(a.horarios).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([k,h])=>`<div class="hcard"><div class="hch"><b>${esc(k)}</b><span class="sp1"></span><button class="btn sm ico dng" data-hdel="${esc(k)}" title="Remover horário" aria-label="Remover horário">${ic('trash',16)}</button></div><div class="hcl">${(()=>{const lig=a.turmas.filter(t=>turmasDaClasse(t).some(c=>normTurma(c)===normTurma(k)));return lig.length?lig.map(t=>{const n=aulasTurma(t,a).filter(x=>(x.classe||'')===''||normTurma(x.classe||k)===normTurma(k)).length;return `<span>${ic('clipboard',14)} ${esc(t.disciplina)}: ${n?n+' tempos semanais':'disciplina não reconhecida'}</span>`}).join(''):`<span>${ic('clipboard',14)} Ainda sem turma com este nome</span>`})()}<span>${ic('crown',14)} ${tituloDT(h.diretor)}: ${esc(h.diretor?profNome(h.diretor):'—')}</span>${siglasDoProfessor(h).length?`<span>${ic('star',14)} As suas: ${esc(siglasDoProfessor(h).map(l=>l.ab).join(', '))}</span>`:''}</div></div>`).join('')}</div></div>`:''}
  ${S.anos.length>1?`<div class="card"><h2>Outros anos letivos</h2>${S.anos.filter(x=>x!==a).map(x=>`<button class="btn" data-ano="${x.id}" style="margin:0 6px 6px 0">${esc(x.nome)} · ${x.turmas.length} turmas</button>`).join('')}</div>`:''}`;
  $$('[data-org]').forEach(b=>b.onclick=()=>mudarOrg(a,b.dataset.org));
  $('#a-del').onclick=()=>{if(confirm('Apagar o ano letivo '+a.nome+' com TODAS as turmas e classificações?')&&prompt('Para confirmar, escreva o nome do ano letivo ('+a.nome+'):')===a.nome){paraLixo('ano',a,{jornal:S.jornal&&S.jornal.anos?S.jornal.anos[a.nome]:null,cprofij:S.cprofij&&S.cprofij.anos?S.cprofij.anos[a.id]:null});anoLimparTudo(a);S.anos=S.anos.filter(x=>x!==a);toast('Ano letivo apagado com tudo o que lhe pertence, incluindo o Jornal Escolar desse ano (pode restaurar em Definições › Dados durante 30 dias)','aviso');S.anoAtivo=(S.anos[0]||{}).id||null;S.turmaAtiva=null;save();go('turmas')}};
  $('#t-new').onclick=()=>novaTurmaDlg(null);
  const tj=$('#t-join');if(tj)tj.onclick=juntarDlg;
  $('#t-hor').onclick=()=>pickHorarios(importarHorariosDlg);
  $$('[data-hdel]').forEach(b=>b.onclick=()=>{if(confirm('Remover o horário de '+b.dataset.hdel+'?')){delete a.horarios[b.dataset.hdel];save();go('turmas')}});
  $('#t-pdf').onclick=()=>pickPdf(r=>novaTurmaDlg(r));
  const dr=$('#t-drop');if(dr){dr.onclick=()=>pickPdf(r=>novaTurmaDlg(r));dropZone(dr,r=>novaTurmaDlg(r))}
  $$('[data-open]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.open;save();go('alunos')});
  $$('[data-hxt]').forEach(b=>b.onclick=()=>apagarHorarioTurma(a.turmas.find(x=>x.id===b.dataset.hxt),a));
  $$('[data-edt]').forEach(b=>b.onclick=()=>editarTurmaDlg(a.turmas.find(x=>x.id===b.dataset.edt)));
  $$('[data-dup]').forEach(b=>b.onclick=()=>{const s=a.turmas.find(x=>x.id===b.dataset.dup);novaTurmaDlg({base:s})});
  $$('[data-del]').forEach(b=>b.onclick=()=>{const s=a.turmas.find(x=>x.id===b.dataset.del);if(confirm('Apagar '+s.nome+' · '+s.disciplina+' com todos os alunos e classificações?\n(Fica 30 dias no caixote do lixo.)')){paraLixo('turma',s,{ano:a.id});a.turmas=a.turmas.filter(x=>x!==s);if(S.turmaAtiva===s.id)S.turmaAtiva=null;save();go('turmas')}});
  $$('[data-ano]').forEach(b=>b.onclick=()=>{S.anoAtivo=b.dataset.ano;S.turmaAtiva=null;save();go('turmas')});
}
/* ---------- turma conjunta: junta alunos de 2+ turmas para uma disciplina; as turmas originais mantêm-se ---------- */
function fontesTurmas(a){const m={};a.turmas.filter(t=>!t.origens).forEach(t=>{if(!m[t.nome]||t.alunos.length>m[t.nome].alunos.length)m[t.nome]=t});return Object.values(m).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'))}
function juntarDlg(){
  const a=A();const F=a.turmas.filter(t=>!t.origens).sort((x,y)=>x.nome.localeCompare(y.nome,'pt')||x.disciplina.localeCompare(y.disciplina,'pt'));const disc=minhasDisc();
  openDrawer('Juntar turmas',`<div class="ed">
    <p class="hint" style="margin-top:0">Junta duas ou mais turmas numa só (ex.: 10.º A + 10.º B → <b>10.º A/B</b>). Os alunos são numerados seguido por ordem alfabética, com o <b>n.º original</b> entre parênteses (ex.: n.º 1 (3)) e a indicação da sua turma; a pauta e os relatórios podem ser filtrados por turma.</p>
    <h3>Turmas a juntar</h3>${F.map(t=>`<label class="chk"><input type="checkbox" data-j="${t.id}"> <b>${esc(t.nome)}</b> · ${esc(t.disciplina)}${ofertaTag(t)} <span class="mut">· ${t.alunos.length} alunos${t.instrumentos.length?' · '+t.instrumentos.length+' instrumentos':''}</span></label>`).join('')}
    <div class="g2" style="margin-top:12px"><div><label>Nome da turma conjunta</label><input id="j-nome" placeholder="10.º A/B"></div>
      <div><label>Disciplina</label>${disc.length?`<select id="j-disc">${disc.map(d=>`<option>${esc(d)}</option>`).join('')}</select>`:'<input id="j-disc" placeholder="Disciplina">'}</div></div>
    <label class="chk" style="margin-top:6px"><input type="checkbox" id="j-del" checked> <span><b>Apagar as turmas originais</b> depois de juntar <span class="mut">(desmarque se ainda precisar delas noutra disciplina)</span></span></label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="j-ok">${ic('merge')} Juntar turmas</button></div></div>`);
  const sel=()=>$$('[data-j]').filter(x=>x.checked).map(x=>F.find(t=>t.id===x.dataset.j));
  const sug=()=>{const L=sel();const nomes=[...new Set(L.map(t=>t.nome))];$('#j-nome').value=nomes.length?nomes.map((n,i)=>i?n.split(' ').pop():n).join('/'):'';
    const ds=[...new Set(L.map(t=>t.disciplina))];const jd=$('#j-disc');if(ds.length===1&&jd.tagName==='SELECT'&&[...jd.options].some(o=>o.value===ds[0]))jd.value=ds[0]};
  $$('[data-j]').forEach(x=>x.onchange=sug);
  $('#j-ok').onclick=()=>{
    const L=sel();if(L.length<2)return alert('Escolha pelo menos duas turmas.');
    if(new Set(L.map(t=>t.nome)).size<L.length)return alert('Escolheu a mesma turma duas vezes (disciplinas diferentes). Escolha uma de cada turma.');
    const nome=$('#j-nome').value.trim();const d=($('#j-disc').value||'').trim();if(!nome||!d)return alert('Indique o nome e a disciplina.');
    const apagar=$('#j-del').checked;
    if(a.turmas.some(t=>t.nome===nome&&t.disciplina===d&&!(apagar&&L.includes(t))))return alert('Já existe '+nome+' · '+d+'.');
    const nInst=L.reduce((s,t)=>s+t.instrumentos.length,0);
    if(apagar&&!confirm('Vão ser apagadas as turmas '+L.map(t=>t.nome+' · '+t.disciplina).join(' e ')+(nInst?' com '+nInst+' instrumento(s) e respetivas classificações':'')+'.\nOs alunos (com fotos e fichas) passam para '+nome+'. Continuar?'))return;
    {const k=discKey(d,L[0].ciclo);if(!discAno().includes(k)&&!discExtraAno().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(k);else discExtraAno().push(d)}}
    const info=discInfo(d);const base=L[0];const mesma=L.every(x=>x.disciplina===d);
    const t={id:uid(),nome,anoEsc:base.anoEsc,ciclo:base.ciclo,oferta:ofertaDe(base),disciplina:d,
      dominios:mesma?JSON.parse(JSON.stringify(base.dominios)):mkDominiosDisc(d,base.ciclo,ofertaDe(base)),mencoes:mesma?JSON.parse(JSON.stringify(base.mencoes)):MENCOES_DEF.map(m=>({...m})),regra:mesma?{...base.regra}:{2:'media',3:'media'},
      alunos:[],instrumentos:[],origens:L.map(x=>x.nome),delegados:{}};
    let k=0;L.forEach(src=>alunosTodos(src).forEach(x=>{const c=JSON.parse(JSON.stringify(x));
      Object.assign(c,{id:uid()+(k++).toString(36),origem:src.nome,origemId:apagar?null:x.id,autoav:{},obsPer:{},sintese:{}});t.alunos.push(c)}));
    renumerarConjunta(t);
    if(apagar){a.turmas=a.turmas.filter(x=>!L.includes(x))}
    a.turmas.push(t);S.turmaAtiva=t.id;regista('Juntar turmas',L.map(x=>x.nome).join(' + '),nome+': '+t.alunos.length+' alunos');saveNow();closeDrawer();go('alunos');toast(nome+' criada com '+t.alunos.length+' alunos'+(apagar?' · turmas originais apagadas':''));
  };
}
/* acrescenta/atualiza alunos a partir das turmas de origem */
function atualizarDeOrigens(t){
  const a=A();const F=fontesTurmas(a);let novos=0,at=0;
  const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  t.origens.forEach(o=>{const src=F.find(x=>x.nome===o);if(!src)return;
    src.alunos.forEach(x=>{const ex=t.alunos.find(y=>y.origemId===x.id||(x.processo&&y.processo===x.processo&&y.origem===o)||(y.origem===o&&norm(y.nome)===norm(x.nome)));
      if(ex){['nome','processo','genero','nasc','foto','eeNome','eeContacto','email','ase','repetente','medidas','acomod'].forEach(f=>{if(x[f]!=null&&x[f]!=='')ex[f]=JSON.parse(JSON.stringify(x[f]))});ex.origemId=x.id;at++}
      else{const c=JSON.parse(JSON.stringify(x));Object.assign(c,{id:uid()+Math.random().toString(36).slice(2,5),origem:o,origemId:x.id,frequenta:true,autoav:{},obsPer:{},sintese:{}});t.alunos.push(c);novos++}})});
  save();vAlunos();toast(novos+' novos, '+at+' atualizados a partir de '+t.origens.join(' e '));
}
function sugAno(){const ns=S.anos.map(a=>+a.nome.slice(0,4)).filter(Boolean);if(!ns.length)return anoAuto();const y=Math.max(...ns)+1;return y+'/'+(y+1)}
/* diálogo de nova turma. r = resultado da leitura do Excel ({alunos,turma,ano}) ou {base:turma} */
/* ---------- editar turma: oferta formativa, nome, ano de escolaridade ---------- */
function editarTurmaDlg(t){
  const a=A();const irmas=a.turmas.filter(x=>x!==t&&normTurma(x.nome)===normTurma(t.nome));
  let oferta=ofertaDe(t);
  openDrawer('Editar Turma',`<div class="ed">
    ${escolaSelect('et-esc',escId(escolaDe(t)))}
    <div style="margin-bottom:12px"><label>Oferta Formativa</label><div id="et-ofw">${segOferta('et-of',oferta,tipoEscola(escolaDe(t)))}</div></div>
    <div id="et-prof" class="g2" style="margin-bottom:12px;${oferta==='profissional'?'':'display:none'}"><div><label>Curso profissional</label><input id="et-curso" value="${esc(t.curso||'')}" placeholder="ex.: Técnico de Turismo"></div><div><label>Ano de formação</label><select id="et-af">${['1.º','2.º','3.º'].map(x=>`<option ${t.anoForm===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
    ${oferta!=='regular'?`<fieldset class="etmra"><legend>${ic('file',14)} Dados da turma para as fichas (MRA) · ${esc((A()||{}).nome||'')}</legend><div class="g2">
      <div style="grid-column:1/-1"><label for="et-proj">N.º do projeto</label><input id="et-proj" value="${esc(projetoDe(t,A()))}" placeholder="ex.: ACORES2030-FSE+-01717300" autocapitalize="characters" spellcheck="false"></div>
      <div style="grid-column:1/-1"><label for="et-cfich">Curso (como aparece na ficha)</label><input id="et-cfich" value="${esc(turmaDado(t,'cursoFicha')||(_mraDef?mraCursoNome(t):''))}" placeholder="ex.: A01 - Mecatrónica Automóvel (24-27)"></div>
      <div><label for="et-ori">Orientador(a) educativo(a)</label><input id="et-ori" value="${esc(turmaDado(t,'orientador'))}" placeholder="Nome"></div>
      <div><label for="et-gen">Tratamento</label><select id="et-gen"><option value="F" ${turmaDado(t,'genero')!=='M'?'selected':''}>A Orientadora Educativa</option><option value="M" ${turmaDado(t,'genero')==='M'?'selected':''}>O Orientador Educativo</option></select></div></div></fieldset>`:''}
    <div class="g2"><div><label>Turma</label><input id="et-nome" value="${esc(t.nome)}"></div>
    <div><label>Ano de Escolaridade</label><select id="et-ano">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===t.anoEsc?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div></div>
    <div style="margin-top:10px"><label>Disciplina</label><input value="${esc(t.disciplina)}" disabled></div>
    ${irmas.length?`<label class="chk" style="margin-top:12px"><input type="checkbox" id="et-irm" checked> Aplicar também a ${irmas.map(x=>esc(x.nome+' · '+x.disciplina)).join(', ')}</label>`:''}
    ${t.origens?`<p class="hint">Turma conjunta de ${esc(t.origens.join(' e '))}.</p>`:''}
    ${turmasDaClasse(t).map(n=>`<label class="chk" style="margin-top:10px"><input type="checkbox" data-etdt="${esc(n)}" ${souDT(a,n)?'checked':''} ${dtDe(a,n)&&S.cfg.professor&&mesmoNome(dtDe(a,n),S.cfg.professor)?'disabled':''}> ${ic('crown',14)} Sou ${tituloDT(S.cfg.professor,false)} ${turmasDaClasse(t).length>1?'do '+esc(n):'desta turma'}${dtDe(a,n)?` <span class="mut">(no horário: ${esc(dtDe(a,n))})</span>`:''}</label>`).join('')}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="et-ok">${ic('check',15)} Guardar</button></div></div>`);
  const etProf=()=>{$('#et-prof').style.display=oferta==='profissional'?'':'none'};
  const etSeg=()=>{const tp=tipoEscola(escolaPorId(($('#et-esc')||{}).value||escId(escolaDe(t))));const ok=TIPOS_ESCOLA[tp].ofertas;if(!ok.includes(oferta))oferta=ok[0];$('#et-ofw').innerHTML=segOferta('et-of',oferta,tp);bindSegOferta('et-of',v=>{oferta=v;etProf()});etProf()};
  etSeg();if($('#et-esc'))$('#et-esc').onchange=etSeg;
  $('#et-ok').onclick=()=>{const nome=$('#et-nome').value.trim();if(!nome)return alert('Indique o nome da turma.');
    const ano=$('#et-ano').value;const L=[t,...(($('#et-irm')||{}).checked?irmas:[])];
    const antes=t.nome;
    {const es=($('#et-esc')||{}).value;L.forEach(x=>{if(es)x.escola=es==='principal'?undefined:es;if(oferta==='profissional'){x.curso=$('#et-curso').value.trim();x.anoForm=$('#et-af').value}if(oferta!=='regular')x.modulos=x.modulos||[]})}
    L.forEach(x=>{x.oferta=oferta;x.anoEsc=ano;x.ciclo=cicloDoAno(ano);if(normTurma(x.nome)===normTurma(antes))x.nome=nome});
    a.dt=a.dt||[];$$('[data-etdt]').forEach(c=>{if(c.disabled)return;let n=normTurma(c.dataset.etdt===antes?nome:c.dataset.etdt);a.dt=a.dt.filter(z=>z!==normTurma(c.dataset.etdt)&&z!==n);if(c.checked)a.dt.push(n)});
    if(S.filtroOferta&&S.filtroOferta!==oferta)S.filtroOferta='';
    saveNow();closeDrawer();go(VIEW);toast(nome+' · '+OFERTAS[oferta].nome)};
}
function novaTurmaDlg(r){
  const disc=minhasDisc();r=r||{};
  const base=r.base;
  const tAll=(r.turmas||[]).length>1?r.turmas.map((x,i)=>i?x.split(' ').pop():x).join('/'):'';
  const nomeSug=base?base.nome:(tAll||r.turma||'');
  const anoSug=base?base.anoEsc:(((nomeSug.match(/(\d{1,2})\s*\.?\s*º/)||[])[1]||'10')+'.º');
  openDrawer(base?'Mesma turma, outra disciplina':'Nova turma',`<div class="ed">
    ${!disc.length?`<div class="alert w">Ainda não escolheu as disciplinas que leciona. <a href="#" id="go-def">Abrir Definições</a> — ou escreva a disciplina abaixo.</div>`:''}
    ${escolaSelect('nt-esc',base?escId(escolaDe(base)):escAtiva())}
    <div style="margin-bottom:10px"><label>Oferta formativa</label><div id="nt-ofw">${segOferta('nt-of',base?ofertaDe(base):(/profij/i.test(nomeSug+(r.ficheiro||''))?'profij':(S.filtroOferta||'regular')),tipoEscola(escolaPorId(base?escId(escolaDe(base)):escAtiva())))}</div></div>
    <div id="nt-prof" class="g2" style="display:none;margin-bottom:10px"><div><label>Curso profissional</label><input id="nt-curso" placeholder="ex.: Técnico de Turismo"></div><div><label>Ano de formação</label><select id="nt-af"><option>1.º</option><option>2.º</option><option>3.º</option></select></div><div style="grid-column:1/-1"><label for="nt-proj">N.º do projeto <span class="mut">(neste ano letivo)</span></label><input id="nt-proj" placeholder="ex.: ACORES2030-FSE+-01717300" autocapitalize="characters" spellcheck="false"></div></div>
    <div class="g2"><div><label>Turma</label><input id="nt-nome" value="${esc(nomeSug)}" placeholder="10.º A"></div>
    <div><label>Ano de escolaridade</label><select id="nt-ano">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===anoSug?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div></div>
    <div><label>Disciplina que leciona nesta turma</label>
      ${disc.length?`<select id="nt-disc">${minhasDiscK().filter(k=>!base||discNome(k)!==base.disciplina).sort((x,y)=>{const o=['1c','2c','3c','sec','profij'];return o.indexOf(discCic(x))-o.indexOf(discCic(y))||discNome(x).localeCompare(discNome(y),'pt')}).map(k=>`<option value="${esc(k)}" ${discCic(k)&&discCic(k)===cicloDoAno(anoSug)&&!base?'selected':''}>${esc(discRotulo(k))}</option>`).join('')}<option value="__outra">Outra…</option></select>`:''}
      <input id="nt-outra" placeholder="Nome da disciplina" style="margin-top:6px;${disc.length?'display:none':''}" list="dl-disc"><datalist id="dl-disc">${DISCIPLINAS.map(d=>`<option value="${esc(d.n)}">`).join('')}</datalist></div>
    ${r.ano&&A()&&r.ano!==A().nome?`<div class="alert w">O ficheiro indica o ano letivo <b>${esc(r.ano)}</b>, mas está a criar a turma em <b>${esc(A().nome)}</b>.</div>`:''}
    ${r.ficheiro?`<h3>Alunos lidos de ${esc(r.ficheiro)}</h3>${infoLeitura(r)}${tabelaPreview(r.alunos,r.turmas)}${textoLido(r)}`:base?`<p class="hint" style="margin-top:12px">Copia os ${base.alunos.length} alunos de ${esc(base.nome)} (com as fichas). Depois assinale quem frequenta esta disciplina.</p>`:`<p class="hint" style="margin-top:12px">Pode importar os alunos depois, a partir do PDF ou colando a lista.</p>`}
    <div class="row" style="margin-top:14px"><button class="btn pri" id="nt-ok">Criar turma</button><span class="hint">Domínios e ponderações ficam com o modelo da disciplina e podem ser ajustados em Critérios.</span></div></div>`);
  const gd=$('#go-def');if(gd)gd.onclick=e=>{e.preventDefault();go('definicoes')};
  const sd=$('#nt-disc');if(sd)sd.onchange=()=>{$('#nt-outra').style.display=sd.value==='__outra'?'':'none';const c=discCic(sd.value);if(c&&ANOS_ESC[c]&&cicloDoAno($('#nt-ano').value)!==c)$('#nt-ano').value=ANOS_ESC[c][0]};
  let oferta=base?ofertaDe(base):(/profij/i.test(nomeSug+(r.ficheiro||''))?'profij':(S.filtroOferta||'regular'));
  const ntTipo=()=>tipoEscola(escolaPorId(($('#nt-esc')||{}).value||(base?escId(escolaDe(base)):escAtiva())));
  const ntSeg=()=>{const ok=TIPOS_ESCOLA[ntTipo()].ofertas;if(!ok.includes(oferta))oferta=ok[0];$('#nt-ofw').innerHTML=segOferta('nt-of',oferta,ntTipo());bindSegOferta('nt-of',v=>{oferta=v;ntProf()});ntProf()};
  const ntProf=()=>{$('#nt-prof').style.display=oferta==='profissional'?'':'none'};
  ntSeg();if($('#nt-esc'))$('#nt-esc').onchange=ntSeg;
  bindPreview(tn=>{$('#nt-nome').value=tn||tAll;const m=tn.match(/^(\d{1,2})\.º/);if(m)$('#nt-ano').value=m[1]+'.º'});
  $('#nt-ok').onclick=()=>{
    const a=A()||novoAno(anoAuto());
    const nome=$('#nt-nome').value.trim();if(!nome)return alert('Indique o nome da turma.');
    let d=sd&&sd.value!=='__outra'?discNome(sd.value):$('#nt-outra').value.trim();if(!d)return alert('Indique a disciplina.');
    {const k=sd&&sd.value!=='__outra'?sd.value:discKey(d,oferta==='profij'?'profij':cicloDoAno($('#nt-ano').value));if(!discAno().includes(k)&&!discExtraAno().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(k);else discExtraAno().push(d)}}
    if(a.turmas.some(t=>t.nome===nome&&t.disciplina===d))return alert('Já existe '+nome+' · '+d+' neste ano letivo.');
    const anoEsc=$('#nt-ano').value,ciclo=cicloDoAno(anoEsc);
    const info=discInfo(d);
    const t={id:uid(),nome,anoEsc,ciclo,oferta,disciplina:d,dominios:mkDominiosDisc(d,oferta==='profij'?'profij':ciclo,oferta),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[]};
    {const es=($('#nt-esc')||{}).value;if(es&&es!=='principal')t.escola=es;if(oferta==='profissional'){t.curso=$('#nt-curso').value.trim();t.anoForm=$('#nt-af').value;t.modulos=[]}if(oferta==='profij')t.modulos=t.modulos||[]}
    if(base){if(base.origens)t.origens=base.origens.slice();t.alunos=JSON.parse(JSON.stringify(base.alunos)).map(x=>Object.assign(x,{id:uid()+Math.random().toString(36).slice(2,5),frequenta:true,autoav:{},obsPer:{},sintese:{}}))}
    if(r.alunos&&r.alunos.length){const rows=previewRows();const ts=[...new Set(rows.map(p=>p.turma).filter(Boolean))];
      t.alunos=rows.map(p=>Object.assign(novoAluno(t,p.nome),{num:p.num,processo:p.processo,genero:p.genero,generoManual:!!p.generoManual,nasc:p.nasc,frequenta:p.frequenta,foto:p.foto||''},ts.length>1?{origem:p.turma}:{}));
      if(ts.length>1)t.origens=ts}
    if(r&&r.alunos&&r.alunos.length&&r.ficheiro)try{regista('Turmas (importação)',r.ficheiro,nome+': '+t.alunos.length+' alunos')}catch(_){}
    a.turmas.push(t);S.turmaAtiva=t.id;saveNow();closeDrawer();go('alunos');
    toast('Turma '+nome+' criada'+(t.alunos.length?' com '+t.alunos.length+' alunos':''));
  };
}

/* =====================================================================
   IMPORTAÇÃO DE ALUNOS — Excel exportado do programa da escola
   (Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel)
   ===================================================================== */
const CAMINHO_EXCEL='Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel';
function dicaExcel(){return `<span class="dica" tabindex="0" role="button" aria-label="Onde obter o Excel">${ic('info',16)}<span class="dica-t"><b>Onde obter o Excel com as fotos</b><br>${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span></span>`}
function pickPdf(cb){const f=$('#pdfIn');f.value='';f.onchange=()=>{if(f.files[0])lerFicheiro(f.files[0]).then(cb)};f.click()}
function dropZone(el,cb){
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over')});
  el.addEventListener('dragleave',()=>el.classList.remove('over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');const f=e.dataTransfer.files[0];if(f)lerFicheiro(f).then(cb)});
}
const RE_DATA=/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b/;
const RE_NOME=/^[\p{L}][\p{L}'’.\-]*(\s+[\p{L}][\p{L}'’.\-]*)+$/u;
const PALAVRAS_CAB=/^(n\.?º|nº|número|numero|nome|aluno|alunos|processo|sexo|género|genero|data|turma|ano|escola|idade|ee|encarregado|lista|página|pagina)\b/i;
const RE_SEXO=/^(M|F|Masc\.?|Fem\.?|Masculino|Feminino|Sim|Não|Nao)$/i;
function detTurma(s){
  const tm=s.match(/turma[ \t]*[:\-]?[ \t]*(\d{1,2})[ \t]*\.?[ \t]*[º°o]?[ \t]*(?:ano[ \t]*)?[ \t\-]*([A-Z]{1,2}\d?)\b/i)||s.match(/\b(\d{1,2})[ \t]*\.?[ \t]*[º°][ \t]*(?:ano[ \t]*)?[ \t\-–]*(?:turma[ \t]*)?([A-Z])\b/i);
  return tm?tm[1]+'.º '+tm[2].toUpperCase():'';
}
const limpaNome=s=>{const n=s.replace(/\s+/g,' ').trim();return n===n.toUpperCase()?titleCase(n):n};
/* ---------- método TABELA ---------- */
function parseLinhas(linhas){
  linhas=linhas.map(l=>Array.isArray(l)?{cells:l}:l);
  const txt=linhas.map(l=>l.cells.join(' ')).join('\n');
  const turma=detTurma(txt);
  const ano=(txt.match(/(\d{4})\s*\/\s*(\d{4})/)||[]).slice(1,3).join('/');
  const alunos=[];const vistos=new Set();
  linhas.forEach(l=>{
    const full=l.cells.join(' ').replace(/\s+/g,' ').trim();if(!full||PALAVRAS_CAB.test(full))return;
    let processo='',genero='',nasc='';
    const m=full.match(/^(\d{1,2})\s*[.)\-]?\s+(.*)$/);if(!m)return;
    const num=+m[1];if(num<1||num>60)return;let rest=m[2];
    const pm=rest.match(/^\(?(\d{3,})\)?\s+(.*)$/);if(pm){processo=pm[1];rest=pm[2]}
    const dm=rest.match(RE_DATA);if(dm)nasc=dm[4]?`${dm[4]}-${dm[5]}-${dm[6]}`:`${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
    const nt=[];for(const w of rest.split(/\s+/)){if(/^\p{L}[\p{L}'’.\-]*$/u.test(w)&&!RE_SEXO.test(w))nt.push(w);else break}
    if(!processo){const p2=rest.match(/\s\(?(\d{4,})\)?(\s|$)/);if(p2)processo=p2[1]}
    const g=rest.match(/(?:^|\s)(M|F|Masculino|Feminino|Masc\.?|Fem\.?)(?=\s|$)/i);if(g)genero=/^f/i.test(g[1])?'F':'M';
    let nome=nt.join(' ');if(nt.length<2||!RE_NOME.test(nome))return;nome=limpaNome(nome);
    const k=num+'|'+nome;if(vistos.has(k))return;vistos.add(k);
    alunos.push({num,processo,nome,genero:genero||guessGen(nome),generoManual:!!genero,nasc,frequenta:true,turma,p:l.p,bx:l.y!=null?{x1:l.x1,x2:l.x2,y1:l.y-l.h*.3,y2:l.y+l.h}:null});
  });
  return {alunos,turma,ano};
}
function cortaFoto(src,x,y,w,h){const Q={alta:[320,.9],media:[240,.85],baixa:[160,.78]}[(S.cfg&&S.cfg.fotoQ)||'media'];const W=Math.round(Math.min(Q[0],Math.max(120,w))),H=Math.round(W*h/w);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(src,x,y,w,h,0,0,W,H);return c.toDataURL('image/jpeg',Q[1])}
function fotoDeFicheiro(file){return new Promise((ok,ko)=>{const img=new Image();img.onload=()=>{const s=Math.min(img.width,img.height*0.8);const w=s,h=s*1.25>img.height?img.height:s*1.25;ok(cortaFoto(img,(img.width-w)/2,(img.height-h)/2,w,h));URL.revokeObjectURL(img.src)};img.onerror=()=>ko(new Error('Imagem inválida'));img.src=URL.createObjectURL(file)})}
/* =====================================================================
   IMPORTAÇÃO DE EXCEL (.xlsx) — ex.: ClassPhotos exportado do programa da escola
   Leitor nativo (sem bibliotecas): zip + XML. Fotos ancoradas às células.
   ===================================================================== */
async function unzip(buf){
  const dv=new DataView(buf),td=new TextDecoder();
  let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;
  if(e<0)throw new Error('O ficheiro não é um Excel (.xlsx) válido.');
  const n=dv.getUint16(e+10,true);let p=dv.getUint32(e+16,true);const F={};
  for(let i=0;i<n;i++){
    if(dv.getUint32(p,true)!==0x02014b50)break;
    const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lho=dv.getUint32(p+42,true);
    F[td.decode(new Uint8Array(buf,p+46,nl))]={method,csize,lho};p+=46+nl+xl+cl;
  }
  const bytes=async name=>{
    name=name.replace(/^\//,'');const f=F[name];if(!f)return null;
    const ln=dv.getUint16(f.lho+26,true),lx=dv.getUint16(f.lho+28,true);
    const data=new Uint8Array(buf,f.lho+30+ln+lx,f.csize);
    if(f.method===0)return data.slice();
    if(typeof DecompressionStream==='undefined')throw new Error('Este browser é antigo demais para ler Excel. Atualize-o.');
    return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  };
  return {has:n=>!!F[n.replace(/^\//,'')],bytes,text:async n=>{const b=await bytes(n);return b?td.decode(b):null}};
}
const xmlDoc=s=>new DOMParser().parseFromString(s,'application/xml');
const tagsNS=(el,name)=>Array.from(el.getElementsByTagNameNS('*',name));
function resolvePath(base,target){
  if(target.startsWith('/'))return target.slice(1);
  const parts=base.split('/');parts.pop();
  target.split('/').forEach(s=>{if(s==='..')parts.pop();else if(s&&s!=='.')parts.push(s)});
  return parts.join('/');
}
async function relsDe(z,partPath){
  const dir=partPath.split('/');const file=dir.pop();const rp=(dir.length?dir.join('/')+'/':'')+'_rels/'+file+'.rels';
  const t=await z.text(rp);const m={};if(!t)return m;
  tagsNS(xmlDoc(t),'Relationship').forEach(r=>m[r.getAttribute('Id')]={target:resolvePath(partPath,r.getAttribute('Target')),type:r.getAttribute('Type')||''});
  return m;
}
const colNum=s=>{let n=0;for(const ch of s)n=n*26+(ch.charCodeAt(0)-64);return n-1};
function bytesParaImagem(bytes,ext){
  const tipo={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',bmp:'image/bmp',webp:'image/webp'}[ext]||'image/jpeg';
  return new Promise((ok,ko)=>{const img=new Image();const u=URL.createObjectURL(new Blob([bytes],{type:tipo}));img.onload=()=>{ok(img);setTimeout(()=>URL.revokeObjectURL(u),1000)};img.onerror=()=>ko(new Error('imagem'));img.src=u});
}
async function lerXlsx(file){
  const z=await unzip(await file.arrayBuffer());
  const wbPath='xl/workbook.xml';const wb=xmlDoc(await z.text(wbPath)||'<x/>');const wbRels=await relsDe(z,wbPath);
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');
  if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  const folhas=[];
  for(const sh of tagsNS(wb,'sheet')){
    const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');
    const rel=wbRels[rid];if(!rel)continue;const path=rel.target;const sx=await z.text(path);if(!sx)continue;
    const doc=xmlDoc(sx);const cells=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');if(!ref)return;const m=ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;
      const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');
      else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}
      if(v!==''&&v!=null)cells.set((+m[2]-1)+','+colNum(m[1]),{r:+m[2]-1,c:colNum(m[1]),v:String(v)})});
    // imagens ancoradas
    const imgs=[];const shRels=await relsDe(z,path);
    for(const r of Object.values(shRels).filter(r=>/drawing$/.test(r.type))){
      const dx=await z.text(r.target);if(!dx)continue;const dd=xmlDoc(dx);const dRels=await relsDe(z,r.target);
      ['twoCellAnchor','oneCellAnchor'].forEach(tag=>tagsNS(dd,tag).forEach(an=>{
        const fr=tagsNS(an,'from')[0];if(!fr)return;const to=tagsNS(an,'to')[0]||fr;
        const g=(el,n)=>+((tagsNS(el,n)[0]||{}).textContent||0);
        const blip=tagsNS(an,'blip')[0];if(!blip)return;
        const emb=blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed')||blip.getAttribute('r:embed');
        const ir=dRels[emb];if(!ir)return;
        imgs.push({r1:g(fr,'row'),c1:g(fr,'col'),r2:g(to,'row'),c2:g(to,'col'),path:ir.target});
      }));
    }
    folhas.push({nome:sh.getAttribute('name'),cells,imgs});
  }
  // ---- interpretar ----
  const porFolha=[];let ano='';const turmasVistas=[];let melhorLinhas=null;
  for(const f of folhas){
    const all=[...f.cells.values()];
    let anoF='';all.forEach(x=>{const m=x.v.match(/(\d{4})\s*\/\s*(\d{4})/);if(m&&!anoF)anoF=m[1]+'/'+m[2]});if(!ano)ano=anoF;
    const heads=all.map(x=>({r:x.r,t:detTurma(x.v)})).filter(h=>h.t);
    const get=(r,c)=>{const x=f.cells.get(r+','+c);return x?x.v:''};
    const usados=new Set();const doFolha=[];
    all.sort((a,b)=>a.r-b.r||a.c-b.c).forEach(x=>{
      const v=x.v.trim();let num=null,proc='',r0=x.r;
      let m=v.match(/^(\d{1,2})\s*[\r\n]*\s*[-–.]?\s*\(\s*(\d{3,7})\s*\)$/)||v.match(/^(\d{1,2})\s*[-–]\s*(\d{3,7})$/)||v.match(/^(\d{1,2})[\r\n]+\s*(\d{3,7})$/);
      if(m){num=+m[1];proc=m[2]}
      else if(/^\d{1,2}$/.test(v)){const b=get(x.r+1,x.c).trim();const mp=b.match(/^\(?\s*(\d{3,7})\s*\)?$/);if(mp){num=+v;proc=mp[1];r0=x.r+1}}
      if(num==null||num<1||num>60)return;
      // nome: mesma coluna (ou vizinha), nas linhas seguintes
      let nome='',rn=-1;
      for(let dr=1;dr<=5&&!nome;dr++)for(const dc of [0,1,-1]){const t=get(r0+dr,x.c+dc).replace(/\s+/g,' ').trim();
        if(t&&!/^\d/.test(t)&&RE_NOME.test(t)&&!PALAVRAS_CAB.test(t)&&!detTurma(t)){nome=t;rn=r0+dr;break}}
      if(!nome){const t=get(x.r,x.c+1).replace(/\s+/g,' ').trim();if(RE_NOME.test(t)){nome=t;rn=x.r}}  // formato tabela: nome ao lado
      if(!nome)return;
      const h=heads.filter(h=>h.r<=x.r).sort((a,b)=>b.r-a.r)[0];
      const n=limpaNome(nome);
      doFolha.push({num,processo:proc,nome:n,genero:guessGen(n),nasc:'',frequenta:true,turma:h?h.t:'',_r:x.r,_rn:rn,_c:x.c});
    });
    // fotos: a imagem ancorada entre o número e o nome, na mesma coluna
    const livres=f.imgs.slice();
    doFolha.forEach(a=>{
      let best=-1,bd=1e9;
      livres.forEach((im,k)=>{if(!im)return;
        const dentroCol=a._c>=im.c1-1&&a._c<=im.c2+1;if(!dentroCol)return;
        const dRow=im.r1>=a._r&&im.r1<=Math.max(a._rn,a._r+1)?0:Math.min(Math.abs(im.r1-a._r),Math.abs(im.r2-a._r))+2;
        const d=dRow*10+Math.abs(im.c1-a._c);if(d<bd&&dRow<4){bd=d;best=k}});
      if(best>=0){a._img=livres[best].path;livres[best]=null}
    });
    if(doFolha.length){doFolha.ano=anoF;porFolha.push(doFolha)}
    
    if(!doFolha.length){ // folha em formato de tabela simples
      const rows={};all.forEach(x=>{(rows[x.r]=rows[x.r]||[]).push(x)});
      const linhas=Object.keys(rows).sort((a,b)=>a-b).map(r=>({cells:rows[r].sort((a,b)=>a.c-b.c).map(x=>x.v.replace(/\s+/g,' ').trim())}));
      const pr=parseLinhas(linhas);if(pr.alunos.length>(melhorLinhas?melhorLinhas.alunos.length:0))melhorLinhas=pr;
    }
  }
  // em livros com várias folhas: ficam as folhas com fotos (se houver) e com pelo menos 3 alunos
  let fs=porFolha.filter(L=>L.length>=3);if(!fs.length)fs=porFolha;
  if(fs.some(L=>L.some(a=>a._img)))fs=fs.filter(L=>L.some(a=>a._img));
  if(fs[0]&&fs[0].ano)ano=fs[0].ano;
  const alunos=fs.flat();
  let lista=alunos;
  if(!lista.length&&melhorLinhas){lista=melhorLinhas.alunos;lista.forEach(a=>{delete a.p;delete a.bx});if(melhorLinhas.turma)turmasVistas.push(melhorLinhas.turma)}
  alunos.forEach(a=>{if(a.turma&&!turmasVistas.includes(a.turma))turmasVistas.push(a.turma)});
  // converter fotos
  const cache={};let nImgs=0;
  for(const a of lista){
    if(a._img){
      try{if(!(a._img in cache)){const ext=(a._img.split('.').pop()||'').toLowerCase();const img=await bytesParaImagem(await z.bytes(a._img),ext);cache[a._img]=cortaFoto(img,0,0,img.naturalWidth,img.naturalHeight)}
        a.foto=cache[a._img];nImgs++}catch(e){}
    }
    delete a._img;delete a._r;delete a._rn;delete a._c;
  }
  return {alunos:lista,turmas:turmasVistas,turma:turmasVistas[0]||'',ano,ficheiro:file.name,metodo:'excel',
    nImgs:folhas.reduce((s,f)=>s+f.imgs.length,0),nFotos:nImgs,linhas:folhas.flatMap(f=>[...f.cells.values()].sort((a,b)=>a.r-b.r||a.c-b.c).map(x=>[x.v.replace(/\s+/g,' ')]))};
}
/* escolhe o leitor conforme o tipo de ficheiro */
async function lerFicheiro(file){
  if(/\.xls$/i.test(file.name)){alert('Formato Excel antigo (.xls). Abra-o no Excel e guarde como “Livro do Excel (.xlsx)”.');return {alunos:[],falhou:true,linhas:[]}}
  if(/\.(xlsx|xlsm)$/i.test(file.name)){
    toast('A ler '+file.name+'…');
    try{const r=await lerXlsx(file);
      if(!r.alunos.length){r.falhou=true;toast('Não encontrei alunos no Excel')}
      else toast(r.alunos.length+' alunos'+(r.nFotos?' e '+r.nFotos+' fotos':'')+' encontrados');
      return r}
    catch(e){alert('Não foi possível ler o Excel.\n\n'+e.message);return {alunos:[],falhou:true,linhas:[]}}
  }
  alert('Use o ficheiro Excel (.xlsx) exportado do programa da escola:\n'+CAMINHO_EXCEL);return {alunos:[],falhou:true,linhas:[]};
}

/* =====================================================================
   CALENDÁRIO ESCOLAR — importação do PDF (Excel da escola exportado para PDF)
   A informação está nas CORES das células: a página é desenhada, as cores
   da legenda são lidas e cada dia é classificado pela cor da sua célula.
   A data de cada célula é calculada pela coluna (dia da semana), não pelo
   número escrito (que pode ter gralhas).
   ===================================================================== */
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let pdfLib=null;
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('Não foi possível carregar o leitor de PDF (é preciso internet da primeira vez).'));document.head.appendChild(s)})}
async function gunzipB64(id){const el=document.getElementById(id);if(!el||typeof DecompressionStream==='undefined')return null;const bin=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));return await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
/* pdf.js 3.11.174 incluído no ficheiro (funciona sem internet); a internet só é usada se o browser não suportar a descompressão */
async function getPdfLib(){
  if(pdfLib)return pdfLib;
  if(!window.pdfjsLib){let code=null;try{code=await gunzipB64('pdfgz-lib')}catch(_){}
    if(code)await loadScript(URL.createObjectURL(new Blob([code],{type:'text/javascript'})));else await loadScript(PDFJS+'pdf.min.js')}
  const lib=window.pdfjsLib;let wk=null;try{wk=await gunzipB64('pdfgz-wk')}catch(_){}
  if(wk)lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([wk],{type:'text/javascript'}));
  else{try{const w=await fetch(PDFJS+'pdf.worker.min.js').then(r=>r.text());lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([w],{type:'text/javascript'}))}catch(e){lib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js'}}
  return pdfLib=lib;
}
const TIPOS_DIA={
  letivo:{n:'Dia Letivo',cor:'#a8dcf0',ink:'#0b3a52'},
  inicio:{n:'Início do Ano Letivo',cor:'#8b4a12',ink:'#fff'},
  inicio2:{n:'Início 3.º Ciclo e Secundário',cor:'#22a447',ink:'#fff'},
  termo:{n:'Termo das Aulas',cor:'#ffe14d',ink:'#4a3b00'},
  interrupcao:{n:'Interrupção Letiva',cor:'#2a3fd6',ink:'#fff'},
  feriadoN:{n:'Feriado Nacional',cor:'#f59bcd',ink:'#5a0e36'},
  feriadoR:{n:'Feriado Regional',cor:'#e5251f',ink:'#fff'},
  feriadoM:{n:'Feriado Municipal',cor:'#7c2d12',ink:'#fff'},
  nao:{n:'Sem Atividades Letivas',cor:'',ink:''}
};
const LETIVOS=['letivo','inicio','inicio2','termo'];
const MESES_AB={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
const MESES=['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const isoD=(y,m,d)=>y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
const dataDeIso=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])};
const fmtIso=s=>{if(!s)return '';const p=s.split('-');return p[2]+'/'+p[1]};
const fmtIsoL=s=>{if(!s)return '';const d=dataDeIso(s);return DIAS_C[d.getDay()]+', '+d.getDate()+' '+MESES[d.getMonth()+1].slice(0,3).toLowerCase()};
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const sat=c=>Math.max(...c)-Math.min(...c);
/* distância de cor perceptual (CIE Lab, ΔE76) */
function lab(c){const f=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92};const r=f(c[0]),g=f(c[1]),b=f(c[2]);
  let x=(r*0.4124+g*0.3576+b*0.1805)/0.95047,y=r*0.2126+g*0.7152+b*0.0722,z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const h=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;x=h(x);y=h(y);z=h(z);return [116*y-16,500*(x-y),200*(y-z)]}
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])};
async function lerCalendarioPdf(file){
  const lib=await getPdfLib();
  const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;
  const page=await doc.getPage(1);
  const tc=await page.getTextContent();
  const vp=page.getViewport({scale:3});
  const cv=document.createElement('canvas');cv.width=Math.ceil(vp.width);cv.height=Math.ceil(vp.height);
  const g=cv.getContext('2d',{willReadFrequently:true});
  await page.render({canvasContext:g,viewport:vp}).promise;
  const img=g.getImageData(0,0,cv.width,cv.height).data;
  const pxl=(X,Y)=>{X=Math.round(X);Y=Math.round(Y);if(X<0||Y<0||X>=cv.width||Y>=cv.height)return [255,255,255];const k=(Y*cv.width+X)*4;return [img[k],img[k+1],img[k+2]]};
  const P=(x,y)=>vp.convertToViewportPoint(x,y);
  const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||6;const rot=Math.abs(t[0])<0.01;return {s:i.str.trim(),x:t[4],y:t[5],w:i.width||0,h,rot}});
  const txt=items.map(i=>i.s).join(' ');
  const am=txt.match(/(\d{4})\s*\/\s*(\d{4})/);if(!am)throw new Error('Não encontrei o ano letivo (ex.: 2026/2027) no PDF.');
  const y1=+am[1],y2=+am[2];
  // cor dominante perto de um ponto (ignora branco, preto/cinzento do texto e das linhas)
  const corEm=(X,Y,r)=>{const cont={};let best=null,bn=0;
    for(let dx=-r;dx<=r;dx+=2)for(let dy=-r;dy<=r;dy+=2){const c=pxl(X+dx,Y+dy);if(sat(c)<25)continue;
      const k=c.map(v=>v>>4).join(',');cont[k]=(cont[k]||0)+1;if(cont[k]>bn){bn=cont[k];best=c}}
    return best};
  // ---- cores da legenda ----
  const LEG=[['inicio2',/in[ií]cio do ano letivo para/i],['inicio',/^in[ií]cio do ano letivo$/i],['feriadoR',/feriado regional/i],['feriadoN',/feriado nacional/i],['letivo',/^dia letivo$/i],['interrupcao',/interrup[cç][aã]o letiva/i]];
  const cores={};
  LEG.forEach(([k,re])=>{const it=items.find(i=>re.test(i.s));if(!it)return;
    const [X,Y]=P(it.x,it.y+it.h*0.35);
    for(let d=6;d<150;d+=3){const c=corEm(X-d,Y,4);if(c&&sat(c)>=25){cores[k]=c;break}}});
  // termos: linhas "junho de 2027 para os alunos dos 9º, 11º…" com o número (dia) na caixa amarela à esquerda
  const termos=[];
  items.filter(i=>/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)\s+de\s+20/i.test(i.s)&&/\d\s*º|pr[eé]-escolar/i.test(i.s)).forEach(it=>{
    const num=items.filter(o=>/^\d{1,2}$/.test(o.s)&&Math.abs(o.y-it.y)<it.h*0.8&&o.x<it.x&&it.x-o.x<70).sort((a,b)=>b.x-a.x)[0];if(!num)return;
    const mes=MESES_AB[normT(it.s.match(/(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho)/i)[1]).slice(0,3)];
    const [X,Y]=P(num.x+num.w/2,num.y+num.h*0.35);const c=corEm(X+num.w*1.4,Y,5);if(c&&!cores.termo)cores.termo=c;
    const resto=it.s.replace(/.*?de\s+20\s*\d*\s*/i,' ');
    const anos=[...new Set((resto.match(/\b(\d{1,2})\s*º?/g)||[]).map(x=>parseInt(x)).filter(n=>n>=1&&n<=12))];
    if(/pr[eé]-escolar/i.test(it.s))anos.push(0);
    termos.push({data:isoD(mes>=9?y1:y2,mes,+num.s),anos:anos.sort((a,b)=>a-b),texto:it.s.replace(/\s+/g,' ').trim()});
  });
  if(!cores.letivo)throw new Error('Não encontrei a legenda de cores (Dia letivo, Interrupção letiva…).');
  // ---- grelha: colunas a partir do cabeçalho dos dias da semana ----
  const DS={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,sab:6};
  const hdr=items.filter(i=>DS[normT(i.s).slice(0,3)]!=null&&normT(i.s).length<=4);
  const ys={};hdr.forEach(i=>{const k=Math.round(i.y/4);(ys[k]=ys[k]||[]).push(i)});
  const linhaHdr=Object.values(ys).sort((a,b)=>b.length-a.length)[0]||[];
  const cols=linhaHdr.map(i=>({x:i.rot?i.x-i.h/2:i.x+i.w/2,dow:DS[normT(i.s).slice(0,3)]})).sort((a,b)=>a.x-b.x);
  if(cols.length<20)throw new Error('Não encontrei a grelha dos dias da semana.');
  const esp=(cols[cols.length-1].x-cols[0].x)/(cols.length-1);
  // ---- linhas dos meses ----
  const meses=items.filter(i=>MESES_AB[normT(i.s)]!=null).sort((a,b)=>b.y-a.y);
  const perLab=items.filter(i=>/^[1-3]\s*º\s*p$/i.test(i.s)).map(i=>({n:+i.s[0],y:i.y}));
  const dias={},notas={},perDia={},amostras=[];
  meses.forEach(mi=>{
    const m=MESES_AB[normT(mi.s)],ano=m>=9?y1:y2,nd=new Date(ano,m,0).getDate();
    const dow1=new Date(ano,m-1,1).getDay();
    const naLinha=items.filter(o=>Math.abs(o.y-mi.y)<mi.h*0.5&&o.x>mi.x+mi.w&&o.x<cols[cols.length-1].x+esp*0.6);
    const prim=naLinha.slice().sort((a,b)=>a.x-b.x)[0];if(!prim)return;
    const cIdx=x=>{let b=0,bd=1e9;cols.forEach((c,i)=>{const d=Math.abs(c.x-x);if(d<bd){bd=d;b=i}});return b};
    let c1=cIdx(prim.x+prim.w/2);
    if(cols[c1].dow!==dow1){const alt=[1,-1,2,-2,3,-3].map(k=>c1+k).find(k=>cols[k]&&cols[k].dow===dow1);if(alt!=null)c1=alt}
    const per=(perLab.filter(p=>p.y>mi.y).sort((a,b)=>a.y-b.y)[0]||{}).n||null;
    for(let d=1;d<=nd;d++){
      const c=c1+d-1;if(!cols[c])break;const X0=cols[c].x,Y0=mi.y+mi.h*0.35;
      const [X,Y]=P(X0,Y0);const sx=esp*vp.scale*0.38;
      const cs=[corEm(X-sx,Y,3),corEm(X+sx,Y,3)].filter(Boolean);
      const cor=cs.length?cs.sort((a,b)=>sat(b)-sat(a))[0]:null;
      const iso=isoD(ano,m,d);amostras.push({iso,cor,dow:new Date(ano,m-1,d).getDay()});
      const lt=naLinha.find(o=>Math.abs(o.x+o.w/2-X0)<esp*0.45&&/^[A-Z]$/.test(o.s));
      if(lt)notas[iso]={C:'Carnaval',P:'Páscoa'}[lt.s]||lt.s;
      if(per)perDia[iso]=per;
    }
  });
  // cor dos fins de semana (dominante) = sem atividades letivas
  const fds=amostras.filter(a=>(a.dow===0||a.dow===6)&&a.cor);const grupos=[];
  fds.forEach(a=>{const gr=grupos.find(g=>dE(g.c,a.cor)<12);if(gr)gr.n++;else grupos.push({c:a.cor,n:1})});
  const corNao=grupos.filter(g=>g.n>=fds.length*0.15).map(g=>g.c);
  amostras.forEach(a=>{let tipo='nao';
    if(a.cor&&!corNao.some(c=>dE(c,a.cor)<14)){let bd=45;Object.entries(cores).forEach(([k,ref])=>{const dd=dE(a.cor,ref);if(dd<bd){bd=dd;tipo=k}})}
    dias[a.iso]=tipo});
  const pv=document.createElement('canvas');pv.width=760;pv.height=Math.round(cv.height*760/cv.width);pv.getContext('2d').drawImage(cv,0,0,pv.width,pv.height);
  return montarCalendario({preview:pv.toDataURL('image/jpeg',.72),dias,notas,perDia,termos,anoLetivo:y1+'/'+y2,ficheiro:file.name,cores:Object.fromEntries(Object.entries(cores).map(([k,c])=>[k,'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')]))});
}
/* calcula períodos e marcos a partir dos dias classificados */
function montarCalendario(c){
  const isos=Object.keys(c.dias).sort();
  const let_=isos.filter(i=>LETIVOS.includes(c.dias[i]));
  c.inicio=isos.find(i=>c.dias[i]==='inicio')||let_[0]||'';
  c.inicio2=isos.find(i=>c.dias[i]==='inicio2')||'';
  const ns=[...new Set(Object.values(c.perDia||{}))].sort();
  c.periodos=(ns.length?ns:[1]).map(n=>{const L=let_.filter(i=>!c.perDia||!Object.keys(c.perDia).length||c.perDia[i]===n);return {n,ini:L[0]||'',fim:L[L.length-1]||'',dias:L.length}}).filter(p=>p.ini);
  if(c.termos&&c.termos.length){const ult=c.termos.map(t=>t.data).sort().pop();const p=c.periodos[c.periodos.length-1];if(p&&ult>p.fim)p.fim=ult}
  c.importado=new Date().toISOString();
  return c;
}
/* ---------- consultas ---------- */
const CAL=()=>(A()||{}).calendario||null;
const tipoDia=iso=>{const c=CAL();return c?c.dias[iso]||null:null};
function inicioTurma(t,c){c=c||CAL();if(!c)return '';return c.inicio2&&t&&['3c','sec'].includes(t.ciclo)?c.inicio2:c.inicio}
function termoTurma(t,c){c=c||CAL();if(!c)return '';const n=t?parseInt(t.anoEsc):NaN;const T_=(c.termos||[]).find(x=>x.anos.includes(n));
  const fimP=(c.periodos[c.periodos.length-1]||{}).fim||'';return T_?T_.data:fimP}
function letivoPara(t,d){const c=CAL();if(!c)return true;const iso=typeof d==='string'?d:isoData(d);const tp=c.dias[iso];
  if(!tp)return false;if(!LETIVOS.includes(tp))return false;if(t){const a=inicioTurma(t,c),b=termoTurma(t,c);if(a&&iso<a)return false;if(b&&iso>b)return false}return true}
function periodoDe(iso){const c=CAL();if(!c||!c.periodos.length)return null;iso=iso||isoData(new Date());
  const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim);if(p)return p.n;const nx=c.periodos.find(p=>iso<p.ini);return nx?nx.n:c.periodos[c.periodos.length-1].n}
function diasLetivosEntre(a,b,t){const c=CAL();if(!c)return 0;return Object.keys(c.dias).filter(i=>i>=a&&i<=b&&letivoPara(t,i)).length}
/* sequências de dias (interrupções, feriados) → eventos */
function eventosCalendario(c){c=c||CAL();if(!c)return [];const ev=[];const isos=Object.keys(c.dias).sort();
  isos.forEach(i=>{const tp=c.dias[i];if(!['interrupcao','feriadoN','feriadoR','feriadoM','inicio','inicio2','termo'].includes(tp))return;
    // interrupções seguidas (incluindo fins de semana e feriados pelo meio) num só evento
    const p=tp==='interrupcao'?ev.filter(e=>e.t==='interrupcao').pop():null;
    if(p&&diasNaoLetivosAte(c,p.fim,i)){p.fim=i;if(!p.nota&&(c.notas||{})[i])p.nota=c.notas[i]}
    else ev.push({t:tp,ini:i,fim:i,nota:(c.notas||{})[i]||''})});
  (c.termos||[]).forEach(x=>{if(!ev.some(e=>e.t==='termo'&&e.ini===x.data))ev.push({t:'termo',ini:x.data,fim:x.data})});
  ev.forEach(e=>{if(e.t==='interrupcao'&&!e.nota){const k=Object.keys(c.notas||{}).sort().find(i=>i>=e.ini&&i<=e.fim);if(k)e.nota=c.notas[k]}});
  ev.forEach(e=>{if(e.t==='termo'){const x=(c.termos||[]).find(t=>t.data===e.ini);e.nota=x?anosTxt(x.anos):''}});
  return ev.sort((a,b)=>a.ini.localeCompare(b.ini));
}
function diasNaoLetivosAte(c,a,b){const d0=dataDeIso(a);d0.setDate(d0.getDate()+1);for(let d=d0;isoData(d)<b;d.setDate(d.getDate()+1)){if(LETIVOS.includes(c.dias[isoData(d)]))return false}return true}
const anosTxt=L=>!L||!L.length?'':L.map(n=>n===0?'pré-escolar':n+'.º').join(', ')+(L.length?' ano'+(L.length>1?'s':''):'');
/* ---------- criação manual ---------- */
function calendarioManual(an,ps){
  const dias={},perDia={};const[y1,y2]=an.split('/').map(Number);
  for(let d=new Date(y1,8,1);d<=new Date(y2,6,31);d.setDate(d.getDate()+1)){const i=isoData(d);const dow=d.getDay();
    const p=ps.find(p=>i>=p.ini&&i<=p.fim);dias[i]=p&&dow>0&&dow<6?'letivo':(dow>0&&dow<6&&i>ps[0].ini&&i<ps[ps.length-1].fim?'interrupcao':'nao');if(p)perDia[i]=p.n}
  dias[ps[0].ini]='inicio';
  return montarCalendario({dias,notas:{},perDia,termos:[],anoLetivo:an,ficheiro:'(manual)'});
}

/* ---------- feriados nacionais (para o calendário criado à mão) ---------- */
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(y,mes-1,dia)}
function feriadosNacionais(y1,y2){const out={};
  [[y1,10,5],[y1,11,1],[y1,12,1],[y1,12,8],[y1,12,25],[y2,1,1],[y2,4,25],[y2,5,1],[y2,6,10]].forEach(([y,m,d])=>out[isoD(y,m,d)]='');
  const p=pascoa(y2),dd=n=>isoData(new Date(p.getFullYear(),p.getMonth(),p.getDate()+n));
  out[dd(-2)]='Sexta-feira Santa';out[dd(0)]='Páscoa';out[dd(60)]='Corpo de Deus';return out}
/* ---------- importação do PDF ---------- */
const pickCalendario=()=>{const f=$('#calIn');f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;ocupado('A ler '+file.name+'…');
  try{const c=await lerCalendarioPdf(file);livre();importarCalendarioDlg(c)}catch(e){livre();alert('Não foi possível ler o calendário.\n\n'+e.message+'\n\nSugestão: '+sugestaoErro(e.message))}};f.click()};
function importarCalendarioDlg(c){
  const a=A();const ev=eventosCalendario(c);const n=k=>Object.values(c.dias).filter(x=>x===k).length;
  const difAno=c.anoLetivo&&a.nome!==c.anoLetivo;
  openDrawer('Importar Calendário Escolar',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('file',14)} ${esc(c.ficheiro)} · ano letivo <b>${esc(c.anoLetivo)}</b></p>
    ${difAno?`<div class="alert w">${ic('alert',15)} O calendário é de ${esc(c.anoLetivo)} mas o ano letivo ativo é ${esc(a.nome)}.${S.anos.some(x=>x.nome===c.anoLetivo)?' Mude o ano letivo ativo antes de importar, ou importe assim mesmo.':''}</div>`:''}
    ${a.calendario?`<div class="alert w">${ic('alert',15)} Substitui o calendário atual (${esc(a.calendario.ficheiro||'')}).</div>`:''}
    <table class="lst"><thead><tr><th>${c.periodos.length===2?'Semestre':'Período'}</th><th>Início</th><th>Fim</th><th>Dias Letivos</th></tr></thead><tbody>
    ${c.periodos.map(p=>`<tr><td><b>${p.n}.º</b></td><td>${esc(fmtIsoL(p.ini))}</td><td>${esc(fmtIsoL(p.fim))}</td><td><b>${p.dias}</b></td></tr>`).join('')}</tbody></table>
    <div class="cal-res">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}
      <div><span class="sw" style="background:${TIPOS_DIA.interrupcao.cor}"></span>Interrupções: ${ev.filter(e=>e.t==='interrupcao').map(e=>`<b>${esc(fmtIso(e.ini))}${e.fim!==e.ini?'–'+esc(fmtIso(e.fim)):''}</b>${e.nota?' ('+esc(e.nota)+')':''}`).join(' · ')||'—'}</div>
      <div><span class="sw" style="background:${TIPOS_DIA.feriadoN.cor}"></span>Feriados nacionais: ${n('feriadoN')} · <span class="sw" style="background:${TIPOS_DIA.feriadoR.cor}"></span>regionais: ${n('feriadoR')}</div>
    </div>
    ${c.preview?`<details class="pdfprev" open><summary>${ic('file',14)} O PDF lido (para comparar)</summary><img src="${c.preview}" alt="Pré-visualização do calendário em PDF"></details>`:''}
    <p class="hint">Confira com o PDF. Depois de guardar, pode corrigir qualquer dia em Calendário Escolar → “Editar Dias”.</p>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cal-ok">${ic('check',15)} Guardar Calendário</button></div></div>`);
  $('#cal-ok').onclick=()=>{delete c.preview;regista('Calendário escolar (PDF)',c.ficheiro,c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(', '));guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário guardado · '+c.periodos.map(p=>p.n+'.º '+p.dias+' dias').join(' · '))};
}
function guardarCalendario(c){const a=A();delete c.periodos3;delete c.periodos2;a.calendario=c;ajustarOrgCalendario(a);saveNow()}
/* ---------- criação manual ---------- */
function calendarioManualDlg(){
  const a=A();const[y1,y2]=a.nome.split('/').map(Number);
  const sem=a.org==='semestre';
  const def=sem?[[isoD(y1,9,14),isoD(y2,1,29)],[isoD(y2,2,1),isoD(y2,6,18)]]:[[isoD(y1,9,14),isoD(y1,12,18)],[isoD(y2,1,4),isoD(y2,3,19)],[isoD(y2,4,5),isoD(y2,6,18)]];
  openDrawer('Criar Calendário',`<div class="ed"><p class="hint" style="margin-top:0">Indique o início e o fim de cada ${sem?'semestre':'período'}. Os dias úteis ficam letivos, os intervalos entre ${sem?'semestres':'períodos'} ficam como interrupções e os feriados nacionais são marcados automaticamente. Depois pode ajustar dia a dia.</p>
    <table class="lst"><thead><tr><th>${sem?'Semestre':'Período'}</th><th>Início</th><th>Fim</th></tr></thead><tbody>
    ${def.map((p,k)=>`<tr><td><b>${k+1}.º</b></td><td><input type="date" id="cm-i${k}" value="${p[0]}"></td><td><input type="date" id="cm-f${k}" value="${p[1]}"></td></tr>`).join('')}</tbody></table>
    <label class="row" style="margin-top:12px;gap:8px"><input type="checkbox" id="cm-fer" checked> Marcar feriados nacionais</label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="cm-ok">${ic('check',15)} Criar Calendário</button></div></div>`);
  $('#cm-ok').onclick=()=>{const ps=def.map((_,k)=>({n:k+1,ini:$('#cm-i'+k).value,fim:$('#cm-f'+k).value}));
    if(ps.some(p=>!p.ini||!p.fim||p.fim<p.ini)||ps.some((p,k)=>k&&p.ini<=ps[k-1].fim))return alert('Verifique as datas (cada um começa depois do anterior terminar).');
    const c=calendarioManual(a.nome,ps);
    if($('#cm-fer').checked)Object.entries(feriadosNacionais(y1,y2)).forEach(([i,nota])=>{if(c.dias[i]&&dataDeIso(i).getDay()%6){c.dias[i]='feriadoN';if(nota)c.notas[i]=nota}});
    montarCalendario(c);guardarCalendario(c);closeDrawer();go('calendario');toast('Calendário criado')};
}
/* ---------- edição: pincel ---------- */
function pintarDia(iso,tp){const c=CAL();if(!c)return;
  if(tp==='nota'){const v=prompt('Nota para '+fmtIsoL(iso)+' (vazio para apagar)',(c.notas||{})[iso]||'');if(v==null)return;c.notas=c.notas||{};if(v.trim())c.notas[iso]=v.trim();else delete c.notas[iso]}
  else{c.dias[iso]=tp;
    if(LETIVOS.includes(tp)&&!c.perDia[iso]&&Object.keys(c.perDia).length){const p=c.periodos.slice().reverse().find(p=>p.ini<=iso)||c.periodos[0];if(p)c.perDia[iso]=p.n}
    if(tp==='termo'&&!(c.termos||[]).some(t=>t.data===iso)){/* termo pintado à mão: vale para todos os anos que não tenham outro */}
    const imp=c.importado;montarCalendario(c);c.importado=imp;c.editado=new Date().toISOString()}
  save();
}
/* ---------- vista ---------- */
function mesesDoCal(c){const s=[...new Set(Object.keys(c.dias).map(i=>i.slice(0,7)))].sort();return s}
function miniMes(c,ym,opts){
  const [y,m]=ym.split('-').map(Number);const nd=new Date(y,m,0).getDate();const off=(new Date(y,m-1,1).getDay()+6)%7;const hj=isoData(new Date());
  let cells='';for(let k=0;k<off;k++)cells+='<span class="cd vz"></span>';
  for(let d=1;d<=nd;d++){const iso=isoD(y,m,d);const tp=c.dias[iso]||'nao';const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;const nota=(c.notas||{})[iso];const dow=(off+d-1)%7;
    const ttl=fmtIsoL(iso)+' — '+T_.n+(nota?' · '+nota:'')+(c.perDia&&c.perDia[iso]?' · '+c.perDia[iso]+'.º '+(c.periodos.length===2?'semestre':'período'):'');
    const ai=(opts.ai||[]).some(d=>iso>=d.data&&iso<=(d.fim||d.data));cells+=`<button type="button" class="cd t-${tp} ${dow>4?'fds':''} ${ai?'ai':''} ${iso===hj?'hj':''} ${opts.passado&&iso<hj?'pas':''}" data-cd="${iso}" title="${esc(ttl)}" style="${T_.cor?`background:${T_.cor};color:${T_.ink}`:''}">${d}${nota?`<i>${esc(nota[0])}</i>`:''}</button>`}
  return `<div class="cmes"><div class="cmh">${MESES[m]} <span class="mut">${y}</span></div><div class="cgr">${['S','T','Q','Q','S','S','D'].map(x=>`<span class="cw">${x}</span>`).join('')}${cells}</div></div>`;
}
function resumoPeriodoAtual(c,t){
  const hj=isoData(new Date());const P=c.periodos;if(!P.length)return null;
  const p=P.find(p=>hj>=p.ini&&hj<=p.fim);const W=P.length===2?'semestre':'período';
  if(p){const feitos=diasLetivosEntre(p.ini,hj,t)-(letivoPara(t,hj)?1:0);const rest=diasLetivosEntre(hj,p.fim,t);return {p,W,estado:'decorre',feitos,rest,pct:Math.round(100*feitos/Math.max(1,feitos+rest))}}
  const nx=P.find(p=>hj<p.ini);if(nx)return {p:nx,W,estado:'antes',falta:Math.round((dataDeIso(nx.ini)-dataDeIso(hj))/864e5)};
  return {p:P[P.length-1],W,estado:'fim'};
}
function vCalendario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  const c=a.calendario;
  if(!c){
    barBtns([{id:'b-ci',t:'Importar PDF…',f:pickCalendario}]);
    $('#view').innerHTML=`<div class="card empty">${ic('calendar',30)}<br><b>Calendário Escolar ${esc(a.nome)}</b><br><span class="mut">Importe o PDF do calendário escolar (com a legenda de cores: dias letivos, interrupções, feriados, termo das aulas) ou crie-o indicando as datas dos ${a.org==='semestre'?'semestres':'períodos'}.</span><br><br>
      <div class="row" style="justify-content:center"><button class="btn pri" id="c-imp">${ic('upload',15)} Importar PDF do Calendário</button><button class="btn" id="c-man">${ic('plus',15)} Criar Manualmente</button></div></div>`;
    $('#c-imp').onclick=pickCalendario;$('#c-man').onclick=calendarioManualDlg;return}
  const tabs=`<div class="tabs noprint">${[['cal','calendar','Calendário'],['prev','calcheck','Aulas Previstas']].map(([k,i,l])=>`<button data-ct="${k}" class="${(UI.calTab||'cal')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  const bindTabs=()=>$$('[data-ct]').forEach(b=>b.onclick=()=>{UI.calTab=b.dataset.ct;UI.calEd=false;vCalendario()});
  if(UI.calTab==='prev'){
    barBtns([{id:'b-csv',t:'Exportar CSV',f:exportPrevistas},{id:'b-pr',t:'Imprimir',f:()=>window.print()}]);
    $('#view').innerHTML=tabs+vAulasPrevistas(a,c);bindTabs();
    $$('#pv-u [data-u]').forEach(b=>b.onclick=()=>{UI.prevU=b.dataset.u;vCalendario()});
    $$('[data-pv]').forEach(r=>r.onclick=()=>prevDetalheDlg(a.turmas.find(t=>t.id===r.dataset.pv)));
    $$('[data-hor]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.hor;save();go('horario')});
    return}
  barBtns([{id:'b-ed',t:UI.calEd?'Concluir Edição':'Editar Dias',c:UI.calEd?'pri':'',f:()=>{UI.calEd=!UI.calEd;vCalendario()}},{id:'b-ci',t:'Importar PDF…',f:pickCalendario},{id:'b-pr',t:'Imprimir',f:()=>window.print()},
    {id:'b-cx',t:'Remover',c:'dng',f:()=>{if(confirm('Remover o calendário escolar de '+a.nome+'?')){delete a.calendario;UI.calEd=false;saveNow();go('calendario')}}}]);
  const hj=isoData(new Date());const ev=eventosCalendario(c);const W=c.periodos.length===2?'Semestre':'Período';
  const r=resumoPeriodoAtual(c);const futuros=ev.filter(e=>e.fim>=hj);
  const prox=futuros.find(e=>!['inicio','inicio2'].includes(e.t)||e.ini>=hj);
  const nomeEv=e=>e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas':e.t==='inicio'?'Início do Ano Letivo':e.t==='inicio2'?'Início 3.º Ciclo e Secundário':(e.nota||TIPOS_DIA[e.t].n);
  const durEv=e=>e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim);
  const difAno=c.anoLetivo&&c.anoLetivo!==a.nome;
  const pincel=UI.calPin||'letivo';
  $('#view').innerHTML=tabs+cartaoOrg(a)+`
  ${difAno?`<div class="card"><div class="alert w" style="margin:0">${ic('alert',15)} Este calendário é de ${esc(c.anoLetivo)} e está associado ao ano letivo ${esc(a.nome)}.</div></div>`:''}
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('calendar',14)} ${r&&r.estado==='decorre'?W+' Atual':r&&r.estado==='antes'?'Próximo '+W:'Ano Letivo'}</div><div class="v">${r?(r.estado==='fim'?'Terminado':r.p.n+'.º '+W):'—'}</div><div class="mut">${r&&r.estado!=='fim'?esc(fmtIso(r.p.ini)+' a '+fmtIso(r.p.fim)):''}${r&&r.estado==='antes'?' · começa daqui a '+r.falta+' dia'+(r.falta>1?'s':''):''}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Dias Letivos Restantes</div><div class="v">${r&&r.estado==='decorre'?r.rest:r&&r.estado==='antes'?r.p.dias:0}</div><div class="mut">${r&&r.estado==='decorre'?'até '+esc(fmtIsoL(r.p.fim))+' · '+r.feitos+' já decorridos':r&&r.estado==='antes'?'no '+r.p.n+'.º '+W.toLowerCase():''}</div></div>
    <div class="kpi"><div class="l">${ic('flag',14)} Próximo Marco</div><div class="v" style="font-size:17px">${prox?esc(nomeEv(prox)):'—'}</div><div class="mut">${prox?esc(durEv(prox)):''}</div></div>
    <div class="kpi"><div class="l">${ic('grad',14)} Total de Dias Letivos</div><div class="v">${c.periodos.reduce((s,p)=>s+p.dias,0)}</div><div class="mut">${c.periodos.map(p=>p.n+'.º '+p.dias).join(' · ')}</div></div>
  </div>
  <div class="card wide"><h2>${W==='Semestre'?'Semestres':'Períodos Letivos'}</h2><div class="cper">
    ${c.periodos.map(p=>{const tot=p.dias,feitos=hj<p.ini?0:hj>p.fim?tot:diasLetivosEntre(p.ini,hj)-(letivoPara(null,hj)?1:0);const on=hj>=p.ini&&hj<=p.fim;
      return `<div class="cp pcor ${on?'on':''} ${hj>p.fim?'done':''}" style="--pc:var(--p${p.n})"><div class="row"><b>${p.n}.º ${W}</b><span class="sp1"></span>${on?'<span class="tag now">a decorrer</span>':hj>p.fim?'<span class="tag">concluído</span>':''}</div>
      <div class="cpd">${esc(fmtIsoL(p.ini))} → ${esc(fmtIsoL(p.fim))}</div>
      <div class="pbar"><span style="width:${Math.round(100*feitos/Math.max(1,tot))}%"></span></div>
      <div class="mut">${tot} dias letivos${on?' · faltam '+(tot-feitos):''}</div></div>`}).join('')}</div>
    ${c.inicio2||(c.termos||[]).length>1?`<div class="cal-res" style="margin-top:12px">
      <div><span class="sw" style="background:${TIPOS_DIA.inicio.cor}"></span>Início: <b>${esc(fmtIsoL(c.inicio))}</b>${c.inicio2?` · 3.º Ciclo e Secundário: <b>${esc(fmtIsoL(c.inicio2))}</b>`:''}</div>
      ${(c.termos||[]).slice().sort((x,y)=>x.data.localeCompare(y.data)).map(t=>`<div><span class="sw" style="background:${TIPOS_DIA.termo.cor}"></span>Termo das Aulas: <b>${esc(fmtIsoL(t.data))}</b> — ${esc(anosTxt(t.anos))}</div>`).join('')}</div>`:''}
  </div>
  ${cartaoIntercalar(a,c)}
  <div class="calwrap"><div class="card wide calc"><div class="row calhd"><h2 style="margin:0">Calendário ${esc(c.anoLetivo||a.nome)}</h2><span class="sp1"></span><div class="seg zoomseg noprint" aria-label="Tamanho do calendário"><button type="button" data-zm="-" aria-label="Diminuir" title="Diminuir">−</button><button type="button" data-zm="+" aria-label="Aumentar" title="Aumentar">+</button></div></div>
    <span class="cleg">${['letivo','inicio','inicio2','termo','interrupcao','feriadoN','feriadoR','feriadoM'].filter(k=>k==='letivo'||Object.values(c.dias).includes(k)).map(k=>`<span><span class="sw" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}</span>`).join('')}<span><span class="sw nao"></span>Sem Atividades Letivas</span></span>
    ${UI.calEd?`<p class="hint noprint" style="margin:0 0 8px">Escolha o tipo e toque num dia, ou arraste o dedo por vários dias seguidos. Toque em “Concluir Edição” no fim.</p><div class="cpin noprint">${[...Object.keys(TIPOS_DIA),'nota'].map(k=>`<button type="button" data-pin="${k}" class="${pincel===k?'on':''}">${k==='nota'?ic('pencil',14)+' Nota':`<span class="sw ${k==='nao'?'nao':''}" style="background:${TIPOS_DIA[k].cor}"></span>${TIPOS_DIA[k].n}`}</button>`).join('')}</div>`:''}
    <div class="cmeses ${UI.calEd?'ed':''}" style="--cz:${zoomCal()}">${mesesDoCal(c).map(ym=>miniMes(c,ym,{passado:true,ai:(a.datasAval||[]).filter(d=>d.tipo==='intercalar'&&!d.turma&&d.data&&intercalarPeriodos(a).includes(d.per))})).join('')}</div>
    <p class="hint">${c.ficheiro==='(manual)'?'Criado manualmente':'Importado de '+esc(c.ficheiro)}${c.editado?' · editado':''}. ${Object.keys(c.notas||{}).length?'Letras nos dias: '+[...new Set(Object.values(c.notas))].map(n=>esc(n[0]+' = '+n)).join(', ')+'.':''}</p>
  </div>
  <div class="card calev"><h2>Interrupções, Feriados e Marcos</h2>
    ${ev.map(e=>`<div class="lin cev ${e.fim<hj?'pas':''} ${e===prox?'now':''}"><span class="sw" style="background:${TIPOS_DIA[e.t].cor}"></span><span class="hh">${esc(durEv(e))}</span><b>${esc(nomeEv(e))}</b>${e.t==='termo'&&e.nota?`<span class="mut">${esc(e.nota)}</span>`:''}${e.t==='interrupcao'?`<span class="mut">${Object.keys(c.dias).filter(i=>i>=e.ini&&i<=e.fim&&c.dias[i]==='interrupcao').length} dias sem aulas</span>`:''}</div>`).join('')||'<p class="mut">Sem eventos.</p>'}
  </div></div>`;
  bindTabs();bindIntercalar(a,()=>{const y=$('#view').scrollTop;vCalendario();$('#view').scrollTop=y});
  $$('[data-pin]').forEach(b=>b.onclick=()=>{UI.calPin=b.dataset.pin;vCalendario()});
  bindZoom(vCalendario);
  const grid=$('.cmeses');
  if(!UI.calEd)$$('[data-cd]').forEach(b=>b.onclick=()=>diaDlg(b.dataset.cd));
  else if(pincel==='nota')$$('[data-cd]').forEach(b=>b.onclick=()=>{pintarDia(b.dataset.cd,'nota');vCalendario()});
  else{ // pintar tocando ou arrastando o dedo sobre vários dias
    let ativo=false;const feitos=new Set();
    const pinta=el=>{const cd=el&&el.closest&&el.closest('[data-cd]');if(!cd||feitos.has(cd.dataset.cd))return;feitos.add(cd.dataset.cd);
      const T_=TIPOS_DIA[pincel];cd.className=cd.className.replace(/t-\w+/,'t-'+pincel);cd.style.background=T_.cor;cd.style.color=T_.ink;cd.classList.add('pint')};
    grid.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-cd]'))return;try{e.target.releasePointerCapture(e.pointerId)}catch(_){}ativo=true;feitos.clear();pinta(e.target);e.preventDefault()});
    grid.addEventListener('pointermove',e=>{if(ativo)pinta(document.elementFromPoint(e.clientX,e.clientY))});
    const fim=()=>{if(!ativo)return;ativo=false;feitos.forEach(iso=>pintarDia(iso,pincel));if(feitos.size>1)toast(feitos.size+' dias marcados como '+TIPOS_DIA[pincel].n);vCalendario()};
    document.onpointerup=fim;document.onpointercancel=fim;
  }
}
const diasUteis=(a,b)=>{let n=0;for(let d=dataDeIso(a);isoData(d)<=b;d.setDate(d.getDate()+1))if(d.getDay()%6)n++;return n};
/* cartão do Início */
function cartaoCalendario(a){
  const c=a&&a.calendario;if(!c)return a?`<div class="card"><div class="row"><h2 style="margin:0">${ic('calendar',18)} Calendário Escolar</h2><span class="sp1"></span><button class="btn sm" data-go="calendario">Importar PDF</button></div><p class="hint" style="margin:6px 0 0">Importe o calendário escolar para ver o período atual, os dias letivos que faltam e saltar as interrupções nas próximas aulas.</p></div>`:'';
  const r=resumoPeriodoAtual(c);const hj=isoData(new Date());const ev=eventosCalendario(c).filter(e=>e.fim>=hj&&!['inicio','inicio2'].includes(e.t));const e=ev[0];
  const tp=c.dias[hj];const W=c.periodos.length===2?'semestre':'período';
  return `<button class="card ccal" data-go="calendario"><div class="row"><h2 style="margin:0">${ic('calendar',18)} ${r?r.estado==='decorre'?r.p.n+'.º '+W:r.estado==='antes'?r.p.n+'.º '+W+' começa a '+esc(fmtIsoL(r.p.ini)):'Ano letivo terminado':'Calendário'}</h2><span class="sp1"></span>
    ${tp&&!LETIVOS.includes(tp)&&tp!=='nao'?`<span class="tag" style="background:${TIPOS_DIA[tp].cor};color:${TIPOS_DIA[tp].ink}">Hoje: ${esc(TIPOS_DIA[tp].n)}</span>`:''}</div>
    ${r&&r.estado==='decorre'?`<div class="pbar"><span style="width:${r.pct}%"></span></div><div class="mut">${esc(fmtIsoL(r.p.ini))} → ${esc(fmtIsoL(r.p.fim))} · <b>${r.rest}</b> dias letivos por dar · ${r.feitos} decorridos</div>`:''}
    ${e?`<div class="mut" style="margin-top:4px">${ic('flag',13)} Próximo: <b>${esc(e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas ('+e.nota+')':e.nota||TIPOS_DIA[e.t].n)}</b> — ${esc(e.ini===e.fim?fmtIsoL(e.ini):fmtIsoL(e.ini)+' a '+fmtIsoL(e.fim))}</div>`:''}</button>`;
}

