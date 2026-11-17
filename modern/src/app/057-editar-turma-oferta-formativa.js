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

