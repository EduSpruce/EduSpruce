/* =====================================================================
   ANO LETIVO E TURMAS
   ===================================================================== */
function novoAno(nome){{const ja=S.anos.find(x=>x.nome===(nome||anoAuto()));if(ja){S.anoAtivo=ja.id;S.turmaAtiva=null;save();try{toast('O ano letivo '+ja.nome+' já existe — foi aberto.','aviso')}catch(_){}return ja}}const a=prepAno({id:uid(),nome:nome||anoAuto(),turmas:[]});a.org='periodo';S.anos.push(a);S.anos.sort((x,y)=>y.nome.localeCompare(x.nome));S.anoAtivo=a.id;S.turmaAtiva=null;save();return a}
function vTurmas(){
  const a=A();const TF=turmasFiltradas(a);
  barBtns(!A()?[]:[{id:'b-na',t:ic('cadeado',15)+(A().fechado?' Ano Letivo Fechado':' Fechar Ano Letivo'),f:()=>fecharAnoDlg()}]);
  if(!a){$('#view').innerHTML=`<div class="card empty">Comece por criar o ano letivo.<br><br><button class="btn pri" id="mkA">Criar ano letivo ${anoAuto()}</button></div>`;$('#mkA').onclick=()=>{novoAno(anoAuto());go('turmas')};return}
  $('#view').innerHTML=`
  <div class="card ed"><div class="row"><h2 style="margin:0">Ano letivo ${esc(a.nome)}</h2><span class="sp1"></span>
    <span class="oa" style="font-size:13px;color:var(--mut)">Organização do ano</span><div class="seg" role="group" aria-label="Organização do ano letivo">${[['periodo','calendar','3 Períodos'],['semestre','layers','2 Semestres']].map(([k,i,l])=>`<button data-org="${k}" class="${(a.org||'periodo')===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>
    <button class="btn sm dng" id="a-del">Apagar ano letivo</button></div></div>
  <div class="card"><div class="row" style="margin-bottom:12px"><h2 style="margin:0">Turmas</h2><span class="sp1"></span>
    <button class="btn pri" id="t-pdf">+ Turma a partir do Excel</button>${dicaExcel()}<button class="btn" id="t-new">+ Turma vazia</button>${a.turmas.filter(x=>!x.origens).length>1?'<button class="btn" id="t-join">⇄ Juntar turmas</button>':''}<button class="btn" id="t-hor">${ic('calendar',15)} Importar horários</button></div>
    ${a.turmas.length?(TF.length?`<table class="lst"><thead><tr><th>Turma</th><th>Disciplina</th><th>Alunos</th><th>Instrumentos</th><th>Horário</th><th></th></tr></thead><tbody>
    ${gruposOferta(TF).map(g=>`<tr class="gr"><td colspan="6"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)}</td></tr>`+g.L.map(t=>{const ta=aulasTurma(t,a);return `<tr${t.id===S.turmaAtiva?' style="background:var(--acc2)"':''}><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b>${turmasDaClasse(t).some(n=>souDT(A(),n))?` <span class="tag dt" title="É ${tituloDT(S.cfg.professor,false)} desta turma">${ic('crown',11)} ${tituloDT(S.cfg.professor)}</span>`:''}${t.origens?` <span class="tag" title="Turma conjunta">conjunta: ${esc(t.origens.join(' + '))}</span>`:''}${ofertaTag(t)}</div></div></td><td>${esc(t.disciplina)||'<span class="neg">por definir</span>'}<div class="hint">${ofertaDe(t)==='profij'?esc((t.anoCurso||1)+'.º ano do curso'):esc(t.anoEsc||'')+' ano · '+esc(CICLOS[t.ciclo]||'')}${t.cnq?' · '+esc(t.cnq.nome):''}${t.codigo?' · <span class="tag">'+esc(t.codigo)+'</span>':''}</div></td><td title="na disciplina / na turma">${alunosAval(t).length} / ${t.alunos.length}</td><td>${t.instrumentos.length}</td>
      <td><div class="row" style="gap:6px;flex-wrap:nowrap">${ta.length?`<span class="tag">${ta.length} tempos/sem.</span>`:turmasDaClasse(t).some(c=>horarioDe(a,c))?'<span class="mut">disciplina não reconhecida</span>':'<span class="mut">—</span>'}${ta.length||turmasDaClasse(t).some(c=>horarioDe(a,c))?`<button class="btn sm ico dng" data-hxt="${t.id}" title="Apagar horário desta turma" aria-label="Apagar horário">${ic('calx',15)}</button>`:''}</div></td>
      <td class="act"><button class="btn sm" data-open="${t.id}">Abrir</button> <button class="btn sm ico" data-edt="${t.id}" title="Editar turma" aria-label="Editar turma">${ic('pencil',15)}</button> <button class="btn sm" data-dup="${t.id}" title="Mesma turma, outra disciplina">+ Disciplina</button> <button class="btn sm ico dng" data-del="${t.id}" title="Apagar turma" aria-label="Apagar turma">${ic('trash',15)}</button></td></tr>`}).join('')).join('')}</tbody></table>`:`<div class="empty">Sem turmas${S.filtroOferta&&OFERTAS[S.filtroOferta]?' de '+OFERTAS[S.filtroOferta].nome:''}${todasEscolas().length>1?' em '+esc(nomeEscola(EC())):''}. Crie uma turma ou importe a lista de alunos.</div>`)
    :`<div class="drop" id="t-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Os alunos são lidos automaticamente; depois assinala os que frequentam a sua disciplina.</span></div>`}
  </div>
  ${Object.keys(a.horarios||{}).length?`<div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">Horários Importados</h2><span class="sp1"></span></div>
    <div class="hcards">${Object.entries(a.horarios).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([k,h])=>`<div class="hcard"><div class="hch"><b>${esc(k)}</b><span class="sp1"></span><button class="btn sm ico dng" data-hdel="${esc(k)}" title="Remover horário" aria-label="Remover horário">${ic('trash',16)}</button></div><div class="hcl">${(()=>{const lig=a.turmas.filter(t=>escId(escolaDe(t))===escAtiva()&&turmasDaClasse(t).some(c=>normTurma(c)===normTurma(k)));return lig.length?lig.map(t=>{const n=aulasTurma(t,a).filter(x=>(x.classe||'')===''||normTurma(x.classe||k)===normTurma(k)).length;return `<span>${ic('clipboard',14)} ${esc(t.disciplina)}: ${n?n+' tempos semanais':'disciplina não reconhecida'}</span>`}).join(''):`<span>${ic('clipboard',14)} Ainda sem turma com este nome</span>`})()}<span>${ic('crown',14)} <span class="hdt">${tituloDT(h.diretor)}: ${esc(h.diretor?profNome(h.diretor):'—')}${h.diretor?contEmailHtml(h.diretor):''}</span></span>${siglasDoProfessor(h).length?`<span>${ic('star',14)} As suas: ${esc(siglasDoProfessor(h).map(l=>l.ab).join(', '))}</span>`:''}</div></div>`).join('')}</div></div>`:''}
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
function fontesTurmas(a){const m={};a.turmas.filter(t=>!t.origens&&escId(escolaDe(t))===escAtiva()).forEach(t=>{if(!m[t.nome]||t.alunos.length>m[t.nome].alunos.length)m[t.nome]=t});return Object.values(m).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'))}
function juntarDlg(){
  const a=A();const F=a.turmas.filter(t=>!t.origens&&escId(escolaDe(t))===escAtiva()).sort((x,y)=>x.nome.localeCompare(y.nome,'pt')||x.disciplina.localeCompare(y.disciplina,'pt'));const disc=minhasDisc();
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
    if(a.turmas.some(t=>t.nome===nome&&t.disciplina===d&&escId(escolaDe(t))===escId(escolaDe(L[0]))&&!(apagar&&L.includes(t))))return alert('Já existe '+nome+' · '+d+'.');
    const nInst=L.reduce((s,t)=>s+t.instrumentos.length,0);
    if(apagar&&!confirm('Vão ser apagadas as turmas '+L.map(t=>t.nome+' · '+t.disciplina).join(' e ')+(nInst?' com '+nInst+' instrumento(s) e respetivas classificações':'')+'.\nOs alunos (com fotos e fichas) passam para '+nome+'. Continuar?'))return;
    {const k=discKey(d,L[0].ciclo);if(!discAno().includes(k)&&!discExtraAno().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(k);else discExtraAno().push(d)}}
    const info=discInfo(d);const base=L[0];const mesma=L.every(x=>x.disciplina===d);
    const t={id:uid(),nome,anoEsc:base.anoEsc,ciclo:base.ciclo,oferta:ofertaDe(base),disciplina:d,
      dominios:mesma?JSON.parse(JSON.stringify(base.dominios)):mkDominiosDisc(d,base.ciclo,ofertaDe(base)),mencoes:mesma?JSON.parse(JSON.stringify(base.mencoes)):MENCOES_DEF.map(m=>({...m})),regra:mesma?{...base.regra}:{2:'media',3:'media'},
      alunos:[],instrumentos:[],origens:L.map(x=>x.nome),delegados:{}};if(base.escola&&base.escola!=='principal')t.escola=base.escola;
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
