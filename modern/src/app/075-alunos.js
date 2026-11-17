/* =====================================================================
   ALUNOS
   ===================================================================== */
function vAlunos(){
  const t=T();const al=alunosTodos(t);const nf_=alunosAval(t).length;UI.alView=UI.alView||'lista';
  if(UI.alView==='fotos'&&al.length)return vFotos(t,al,nf_);
  if(UI.alView==='msai'&&al.length)return vMsai(t,al);
  setTimeout(()=>{if(VIEW==='alunos'&&$('#b-pdf')&&!$('#barx .dica'))$('#b-pdf').insertAdjacentHTML('afterend',dicaExcel())});
  barBtns([{id:'b-edt',t:ic('pencil',15)+' Editar Turma',f:()=>editarTurmaDlg(t)},{id:'b-pdf',t:'Importar Excel…',f:()=>pickPdf(r=>importDlg(r))},{id:'b-add',t:'+ Aluno',f:()=>{t.alunos.push(novoAluno(t));save();vAlunos()}},
    {id:'b-csv',t:'Exportar CSV',f:()=>download('Alunos '+t.nome+' '+t.disciplina+'.csv',csv([[...(t.origens?['Turma']:[]),'N.º','Processo','Nome','Sexo','Nascimento','Frequenta '+t.disciplina,'Repetente','ASE','EE','Contacto EE','Email','Observações'],...al.map(a=>[...(t.origens?[a.origem||'']:[]),a.num,a.processo,a.nome,a.genero,fmtD(a.nasc),a.frequenta?'Sim':'Não',a.repetente?'Sim':'',a.ase,a.eeNome,a.eeContacto,a.email,a.obs])]),'text/csv')}]);
  $('#view').innerHTML=`<div class="card wide">
    <div class="row" style="margin-bottom:8px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} <span class="nt" style="font-weight:400;font-size:14px;color:var(--mut)">${al.length} alunos · <span style="color:var(--acc);font-weight:600">${nf_} frequentam</span></span></h2>${t.origens?`<span class="tag">conjunta: ${esc(t.origens.join(' + '))}</span>${fontesTurmas(A()).some(x=>t.origens.includes(x.nome))?`<button class="btn sm" id="b-orig" title="Acrescenta alunos novos e atualiza fotos e fichas a partir das turmas originais">↻ Atualizar das turmas de origem</button>`:''}`:''}<span class="sp1"></span>
      ${al.length?fzBtns('l')+alTabs('lista'):''}</div>
    ${al.length?`<div class="deleg">${proxAulaHtml(t)}${proxAulaHtml(t)?'<span style="margin:0 10px;color:var(--line)">|</span>':''}${turmasDaClasse(t).filter(n=>dtDe(A(),n)||souDT(A(),n)).map(n=>'<span class="mut">'+tituloDT(souDT(A(),n)&&!dtDe(A(),n)?S.cfg.professor:dtDe(A(),n))+(turmasDaClasse(t).length>1?' do '+esc(n):'')+':</span> <b>'+(souDT(A(),n)?'Você'+(dtDe(A(),n)?' ('+esc(profNome(dtDe(A(),n)))+')':''):esc(profNome(dtDe(A(),n))))+'</b>'+(souDT(A(),n)?'':contEmailHtml(dtDe(A(),n)))).join(' <span style="margin:0 6px;color:var(--line)">|</span> ')}</div><div class="deleg">${delegadosResumo(t)}</div><p class="hint" style="margin:0 0 8px">Só os alunos assinalados em “Frequenta” aparecem nos instrumentos, na avaliação e nos relatórios desta disciplina.</p>
    <div style="overflow:auto"><table class="lst alst"><thead><tr><th class="c-fq"><label class="selall" title="Assinalar/desmarcar todos — frequenta esta disciplina"><input type="checkbox" id="f-allcb" ${al.every(a=>a.frequenta)?"checked":""}> <span>Freq.</span></label></th><th class="c-ft"><span class="sr">Fotografia</span></th>${t.origens?'<th>Turma</th>':''}<th class="c-n">N.º</th><th class="sens">Processo</th><th class="c-nm">Nome</th><th>Sexo</th><th class="sens">Nascimento</th><th class="sens c-id">Idade</th><th class="sens">Repet.</th><th class="sens">ASE</th><th class="sens">MSAI</th><th><span class="sr">Ações</span></th></tr></thead><tbody>
    ${al.map(a=>`<tr data-a="${a.id}" class="${a.frequenta?'':'off'}"><td class="keep c-fq"><input type="checkbox" data-k="frequenta" aria-label="Frequenta" ${a.frequenta?'checked':''}></td><td class="c-ft" style="cursor:pointer" data-fi="${a.id}">${avatar(a,S.cfg.alFotoSz||64)}</td>${t.origens?`<td><span class="tag">${esc(a.origem||'—')}</span></td>`:''}<td class="c-n"><input data-k="num" value="${esc(a.num)}" inputmode="numeric" aria-label="Número"></td><td class="sens"><input data-k="processo" value="${esc(a.processo)}"></td><td class="tdnome"><div class="nmcell"><span class="nmw" data-v="${esc(a.nome)}"><textarea data-k="nome" rows="1" spellcheck="false" aria-label="Nome">${esc(a.nome)}</textarea></span>${cargoTag(a,1)}</div></td>
      <td><select data-k="genero" style="min-width:64px"><option value="M" ${a.genero!=='F'?'selected':''}>M</option><option value="F" ${a.genero==='F'?'selected':''}>F</option></select></td>
      <td class="sens"><input type="date" data-k="nasc" style="min-width:118px" value="${esc(a.nasc)}"></td><td class="mut sens c-id">${idade(a.nasc)}</td>
      <td class="sens"><select data-k="repetente" style="min-width:72px"><option value="">Não</option><option value="1" ${a.repetente?'selected':''}>Sim</option></select></td>
      <td class="sens"><select data-k="ase" style="min-width:58px"><option value="">—</option>${['A','B','C'].map(x=>`<option ${a.ase===x?'selected':''}>${x}</option>`).join('')}</select></td>
      <td class="sens" style="font-size:12px">${msaiBadges(a)||'<span class="mut">—</span>'}</td>
      <td class="act keep"><div class="acts"><button class="btn sm" data-fi="${a.id}" aria-label="Ficha do aluno">${ic('idcard',14)}<span class="lb">Ficha</span></button><button class="btn sm ico dng" data-rm="${a.id}" title="Remover da turma" aria-label="Remover da turma">${ic('trash',14)}</button></div></td></tr>`).join('')}
    </tbody></table></div>`:`<div class="drop" id="al-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Também pode usar “Colar lista…” (copiar do Excel) ou “+ Aluno”.</span></div>`}
  </div>`;
  const dr=$('#al-drop');if(dr){dr.onclick=()=>pickPdf(r=>importDlg(r));dropZone(dr,r=>importDlg(r))}
  const bo=$('#b-orig');if(bo)bo.onclick=()=>atualizarDeOrigens(t);
  bindAlTabs();
  const fa=$('#f-allcb');if(fa){fa.indeterminate=al.some(a=>a.frequenta)&&!al.every(a=>a.frequenta);fa.onchange=async()=>{const v=fa.checked,N=t.alunos.length,n=t.alunos.filter(a=>a.frequenta).length;/* 1.086: com alunos assinalados um a um, um toque nesta barra (grande no telemóvel, onde não há o botão Anular) apagava essa escolha sem perguntar */if(n&&n<N){const r=await avisoModal(v?'Assinalar todos os alunos?':'Desmarcar todos os alunos?',[`Há ${n} aluno(s) assinalado(s) e ${N-n} por assinalar.`,'Ao continuar, ficam todos iguais e perde-se a escolha feita aluno a aluno.'],[{t:v?'Assinalar Todos':'Desmarcar Todos',c:'pri',v:1},{t:'Cancelar',v:0}]);if(!r){vAlunos();return}}t.alunos.forEach(a=>a.frequenta=v);save();vAlunos()}}
  $$('#view tr[data-a] [data-k]').forEach(el=>el.addEventListener('change',()=>{
    const a=t.alunos.find(x=>x.id===el.closest('tr').dataset.a);const k=el.dataset.k;
    if(k==='genero'){if(el.value==='auto'){a.generoManual=false;a.genero=guessGen(a.nome)}else{a.generoManual=true;a.genero=el.value}}
    else if(k==='nome')setNome(a,el.value);
    else a[k]=k==='repetente'?!!el.value:k==='frequenta'?el.checked:el.value;
    save();if(['num','nasc','nome','frequenta','genero'].includes(k))vAlunos();
  }));
  $$('#view tr[data-a]').forEach(tr=>longoToque(tr,(x,y)=>{const al=t.alunos.find(q=>q.id===tr.dataset.a);if(!al)return;const outras=A().turmas.filter(q=>q!==t);
    const mv=(dest,copiar)=>()=>{if(dest.alunos.some(q=>normT(q.nome)===normT(al.nome)))return toast(al.nome+' já está em '+dest.nome,'aviso');const c=JSON.parse(JSON.stringify(al));c.id=copiar?uid():al.id;dest.alunos.push(c);if(!copiar)t.alunos=t.alunos.filter(q=>q!==al);save();vAlunos();toast(al.nome+(copiar?' copiado para ':' movido para ')+dest.nome+' · '+dest.disciplina,'ok')};
    menuContexto(x,y,[{t:'Ficha do aluno',ic:'idcard',f:()=>fichaAluno(al.id)},'-',...outras.slice(0,6).map(d=>({t:'Mover para '+d.nome+' · '+d.disciplina,ic:'merge',f:mv(d,false)})),...outras.slice(0,6).map(d=>({t:'Copiar para '+d.nome+' · '+d.disciplina,ic:'copy',f:mv(d,true)})),'-',{t:'Remover da turma',ic:'trash',dng:true,f:()=>{const b=tr.querySelector('[data-rm]');if(b)b.click()}}])}));
  $$('[data-rm]').forEach(b=>b.onclick=()=>{const a=t.alunos.find(x=>x.id===b.dataset.rm);if(confirm('Remover '+a.nome+' da turma? As classificações deste aluno também são apagadas.\n\n(Se o aluno apenas não frequenta a disciplina, desmarque “Frequenta”.)')){t.alunos=t.alunos.filter(x=>x!==a);t.instrumentos.forEach(i=>delete i.notas[a.id]);save();vAlunos()}});
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
/* tamanho das fotografias (lista de alunos e quadro de fotografias) */
function fzBtns(k){if(k==='c'){const v=S.cfg.chFotoSz||72;return `<span class="fzb noprint" style="display:inline-flex;gap:4px;align-items:center;margin-right:8px"><button class="btn sm" data-fz="c-" title="Fotografias mais pequenas" aria-label="Fotografias mais pequenas" ${v<=40?'disabled':''}>−</button><button class="btn sm" data-fz="c+" title="Fotografias maiores" aria-label="Fotografias maiores" ${v>=200?'disabled':''}>+</button></span>`}const v=k==='l'?(S.cfg.alFotoSz||64):(S.cfg.alFotoGr||225);return `<span class="fzb noprint" style="display:inline-flex;gap:4px;align-items:center;margin-right:8px"><button class="btn sm" data-fz="${k}-" title="Fotografias mais pequenas" aria-label="Fotografias mais pequenas" ${v<=(k==='l'?34:140)?'disabled':''}>−</button><button class="btn sm" data-fz="${k}+" title="Fotografias maiores" aria-label="Fotografias maiores" ${v>=(k==='l'?160:420)?'disabled':''}>+</button></span>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fz]');if(!b)return;const k=b.dataset.fz[0],up=b.dataset.fz[1]==='+';
  if(k==='c'){S.cfg.chFotoSz=Math.max(40,Math.min(200,(S.cfg.chFotoSz||72)+(up?16:-16)));save();return vAula()}
  if(k==='l')S.cfg.alFotoSz=Math.max(34,Math.min(160,(S.cfg.alFotoSz||64)+(up?16:-16)));else S.cfg.alFotoGr=Math.max(140,Math.min(420,(S.cfg.alFotoGr||225)+(up?40:-40)));
  save();vAlunos()});
function vFotos(t,al,nf_){
  barBtns([{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const semFoto=al.filter(a=>!a.foto).length;
  $('#view').innerHTML=`<div class="card wide">
    <div class="row noprint" style="margin-bottom:12px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} — fotografias</h2><span class="sp1"></span>
      ${fzBtns('g')}${alTabs('fotos')}</div>
    <div style="text-align:center;margin-bottom:12px"><b style="font-size:16px">${esc(escolaDe(t).escola||'')}</b><br>Turma ${esc(t.nome)} · Ano letivo ${esc((A()||{}).nome||'')}</div>
    <div class="deleg" style="justify-content:center">${delegadosResumo(t)}</div>
    ${semFoto?`<p class="hint noprint">${semFoto} aluno${semFoto>1?'s':''} sem foto — clique num aluno para adicionar a fotografia. Alunos esbatidos não frequentam ${esc(t.disciplina)}.</p>`:''}
    <div class="fotos fotosr" style="grid-template-columns:repeat(auto-fill,minmax(min(${S.cfg.alFotoGr||225}px,100%),1fr))">${al.map(a=>`<div class="fcard ${a.frequenta?'':'off'}" data-fi="${a.id}"><div class="ph">${avatar(a,200)}</div><small>${t.origens&&a.origem?esc(a.origem)+' · ':''}${esc(numAl(a))}${a.processo?' ('+esc(a.processo)+')':''}</small><b>${esc(a.nome)}</b>${cargoTag(a)}</div>`).join('')}</div></div>`;
  bindAlTabs();
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
function alTabs(cur){return `<div class="tabs noprint" style="margin:0">${[['lista','list','Lista'],['fotos','image','Fotografias'],['msai','access','Quadro MSAI']].map(([k,i,l])=>`<button data-alv="${k}" class="${k===cur?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div>`}
function bindAlTabs(){$$('[data-alv]').forEach(b=>b.onclick=()=>{UI.alView=b.dataset.alv;vAlunos()})}
/* quadro MSAI da turma: alunos × medidas (quadro em ecrãs largos, cartões em ecrãs estreitos) */
