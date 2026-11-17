/* =====================================================================
   ANO LETIVO E TURMAS
   ===================================================================== */
function novoAno(nome){{const ja=S.anos.find(x=>x.nome===(nome||anoAuto()));if(ja){S.anoAtivo=ja.id;S.turmaAtiva=null;save();try{toast('O ano letivo '+ja.nome+' já existe — foi aberto.','aviso')}catch(_){}return ja}}const a=prepAno({id:uid(),nome:nome||anoAuto(),turmas:[]});a.org='periodo';S.anos.push(a);S.anos.sort((x,y)=>y.nome.localeCompare(x.nome));S.anoAtivo=a.id;S.turmaAtiva=null;save();return a}
function vTurmas(){
  const a=A();const TF=turmasFiltradas(a);
  barBtns(!A()?[]:[{id:'b-na',t:'+ Ano letivo',f:()=>{const n=prompt('Ano letivo (ex.: '+anoAuto()+')',sugAno());if(!n)return;if(!/^\d{4}\/\d{4}$/.test(n.trim()))return alert('Use o formato 2026/2027.');if(S.anos.some(x=>x.nome===n.trim()))return alert('Esse ano letivo já existe.');novoAno(n.trim());go('turmas')}}]);
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
    <div class="hcards">${Object.entries(a.horarios).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([k,h])=>`<div class="hcard"><div class="hch"><b>${esc(k)}</b><span class="sp1"></span><button class="btn sm ico dng" data-hdel="${esc(k)}" title="Remover horário" aria-label="Remover horário">${ic('trash',16)}</button></div><div class="hcl">${(()=>{const lig=a.turmas.filter(t=>turmasDaClasse(t).some(c=>normTurma(c)===normTurma(k)));return lig.length?lig.map(t=>{const n=aulasTurma(t,a).filter(x=>(x.classe||'')===''||normTurma(x.classe||k)===normTurma(k)).length;return `<span>${ic('clipboard',14)} ${esc(t.disciplina)}: ${n?n+' tempos semanais':'disciplina não reconhecida'}</span>`}).join(''):`<span>${ic('clipboard',14)} Ainda sem turma com este nome</span>`})()}<span>${ic('crown',14)} <span class="hdt">${tituloDT(h.diretor)}: ${esc(h.diretor?profNome(h.diretor):'—')}${h.diretor?contEmailHtml(h.diretor):''}</span></span>${siglasDoProfessor(h).length?`<span>${ic('star',14)} As suas: ${esc(siglasDoProfessor(h).map(l=>l.ab).join(', '))}</span>`:''}</div></div>`).join('')}</div></div>`:''}
  ${S.anos.some(x=>x!==a&&x.nome===a.nome)?`<div class="card" id="anodup"><div class="alert">${ic('alert',16)} <span><b>Há mais do que um ano letivo «${esc(a.nome)}».</b> Não pode haver dois com o mesmo nome. Pode juntar as turmas do outro a este (as que ainda não existirem aqui) — o ano repetido vai para o caixote do lixo (30 dias).</span></div>${S.anos.filter(x=>x!==a&&x.nome===a.nome).map(x=>`<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px"><span>${esc(x.nome)} · ${x.turmas.length} turma${x.turmas.length===1?'':'s'}${x.turmas.length?' ('+esc(x.turmas.map(t=>t.nome).join(', '))+')':''}</span><span class="sp1"></span><button class="btn" data-ano="${x.id}">Abrir Esse</button><button class="btn pri" data-anojunta="${x.id}">Juntar a Este Ano</button></div>`).join('')}</div>`:''}
  ${S.anos.some(x=>x!==a&&x.nome!==a.nome)?`<div class="card"><h2>Outros anos letivos</h2>${S.anos.filter(x=>x!==a&&x.nome!==a.nome).map(x=>`<button class="btn" data-ano="${x.id}" style="margin:0 6px 6px 0">${esc(x.nome)} · ${x.turmas.length} turmas</button>`).join('')}</div>`:''}`;
  $$('[data-anojunta]').forEach(b=>b.onclick=()=>{const x=S.anos.find(z=>z.id===b.dataset.anojunta);if(!x||x===a)return;const chave=t=>normT((t.nome||'')+'|'+(t.disciplina||''));const tem=new Set(a.turmas.map(chave));const novas=x.turmas.filter(t=>!tem.has(chave(t)));const rep=x.turmas.length-novas.length;
    if(!confirm('Juntar o ano repetido a este?\n\n• '+novas.length+' turma(s) passam para este ano'+(rep?'\n• '+rep+' turma(s) já existem aqui com o mesmo nome e disciplina e ficam no ano repetido':'')+'\n• o ano repetido vai para o caixote do lixo (pode restaurar durante 30 dias)'))return;
    paraLixo('ano',x,{});novas.forEach(t=>a.turmas.push(t));x.turmas=x.turmas.filter(t=>!novas.includes(t));
    ['horarios','calendario'].forEach(k=>{if(x[k]&&(!a[k]||(typeof a[k]==='object'&&!Object.keys(a[k]).length)))a[k]=x[k]});
    S.anos=S.anos.filter(z=>z!==x);save();try{audit('Ano letivo','Ano repetido juntado',a.nome+' · '+novas.length+' turma(s)')}catch(_){}toast('Anos juntados: '+novas.length+' turma(s) passaram para este ano.','ok');go('turmas')});
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

