/* ---------- ata ---------- */
function ataHTML(r){const a=A();const t=reunTurma(r,a);const c={...S.cfg,...escolaDe(t)};
  return `<html><head><meta charset="utf-8"><title>Ata</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;max-width:720px;margin:24px auto}h1{font-size:15pt;text-align:center;margin:4px 0 2px}h2{font-size:12pt;margin:16px 0 4px}.c{text-align:center;color:#444}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4px 6px;text-align:left;font-size:10pt}</style></head><body>
  ${c.logo?`<p class="c"><img src="${esc(c.logo)}" style="height:60px"></p>`:''}<p class="c"><b>${esc(c.escola||'')}</b>${c.agrupamento?'<br>'+esc(c.agrupamento):''}</p>
  <h1>Ata — ${esc(reunTitulo(r,a))}</h1><p class="c">${esc(DIAS[dataDeIso(r.data).getDay()])}, ${esc(r.data.split('-').reverse().join('/'))} · ${fmtHM(r.ini)}${r.fim!=null?'–'+fmtHM(r.fim):''}${r.local?' · '+esc(r.local):''}</p>
  ${r.participantes?`<h2>Presentes</h2><p>${esc(r.participantes)}</p>`:''}${reunTurmas(r,a).length?`<p><b>${reunTurmas(r,a).length>1?'Turmas':'Turma'}:</b> ${reunTurmas(r,a).map(x=>esc(x.nome)+' · '+esc(x.disciplina)).join('; ')}</p>`:''}
  ${(r.ordem||[]).length?`<h2>Ordem de Trabalhos</h2><ol>${r.ordem.map(o=>`<li>${esc(o.t)}</li>`).join('')}</ol>`:''}
  <h2>Desenvolvimento</h2><p>${esc(r.notas||'').replace(/\n/g,'<br>')||'—'}</p>
  ${(r.decisoes||[]).length?`<h2>Decisões e Tarefas</h2><table><tr><th>Tarefa</th><th>Responsável</th><th>Prazo</th><th>Estado</th></tr>${r.decisoes.map(d=>`<tr><td>${esc(d.t)}</td><td>${esc(d.resp||'')}</td><td>${d.prazo?esc(d.prazo.split('-').reverse().join('/')):''}</td><td>${d.ok?'Concluída':'Pendente'}</td></tr>`).join('')}</table>`:''}
  <p style="margin-top:40px">O(A) Secretário(a): ______________________________ &nbsp; O(A) Presidente: ______________________________</p></body></html>`}
function ataTexto(r){const a=A();return ['ATA — '+reunTitulo(r,a),fmtIsoL(r.data)+' · '+fmtHM(r.ini)+(r.local?' · '+r.local:''),r.participantes?'Presentes: '+r.participantes:'',(r.ordem||[]).length?'\nOrdem de trabalhos:\n'+r.ordem.map((o,i)=>(i+1)+'. '+o.t).join('\n'):'',
  '\nDesenvolvimento:\n'+(r.notas||'—'),(r.decisoes||[]).length?'\nDecisões e tarefas:\n'+r.decisoes.map(d=>'- '+d.t+(d.resp?' ('+d.resp+')':'')+(d.prazo?' — até '+fmtIsoL(d.prazo):'')+(d.ok?' ✓':'')).join('\n'):''].filter(Boolean).join('\n')}
/* ---------- editor ---------- */
function reuniaoDlg(id,pre){const a=A();if(!a)return;const L=reunioes(a);const ed=id?L.find(x=>x.id===id):null;
  const r=ed?JSON.parse(JSON.stringify(ed)):Object.assign({id:uid(),tipo:'ct',titulo:'',data:isoData(new Date(Date.now()+864e5)),ini:17*60,fim:18*60+30,local:'',link:'',turma:null,convocante:'',participantes:'',lembretes:[1440,60],ordem:[],prep:[],notas:'',decisoes:[],estado:'agendada'},pre||{});
  const TS=a.turmas.filter(t=>escId(escolaDe(t))===escAtiva()||reunTurmas(r,a).includes(t)).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
  openDrawer(ed?'Editar Reunião':'Nova Reunião',`<div class="ed reued">
    <label>Tipo</label><div class="rtipos">${Object.entries(REUN_T).filter(([k])=>k!=='avl'||r.tipo==='avl').map(([k,v])=>`<button type="button" class="chip ${r.tipo===k?'on':''}" data-rt="${k}" style="--rc:${v.cor}"><i></i>${v.n}</button>`).join('')}<button type="button" class="chip ${r.tipo==='avl'?'on':''}" data-rt="avl" style="--rc:${REUN_T.avl.cor}"><i></i>${REUN_T.avl.n}</button></div>
    <div class="g2" style="margin-top:12px"><div style="grid-column:1/-1"><label>Título <span class="mut">(opcional — por omissão: tipo · turma)</span></label><input id="r-tit" value="${esc(r.titulo)}" placeholder="${esc(reunTitulo({...r,titulo:''},a))}"></div>
      <div><label>Data</label><input type="date" id="r-data" value="${r.data}"></div>
      <div class="g2" style="gap:8px"><div><label>Início</label><input type="time" id="r-ini" value="${fmtHM(r.ini)}"></div><div><label>Fim</label><input type="time" id="r-fim" value="${fmtHM(r.fim)}"></div></div>
      <div><label>Local</label><input id="r-loc" value="${esc(r.local)}" placeholder="Sala, biblioteca…" list="r-locs"><datalist id="r-locs">${[...new Set(L.map(x=>x.local).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join('')}</datalist></div>
      <div><label>Ligação (reunião online)</label><input id="r-link" value="${esc(r.link)}" placeholder="https://…" inputmode="url"></div>
      <div style="grid-column:1/-1"><label>Turmas associadas <span class="mut">(opcional — pode escolher várias)</span></label><div class="rtur">${TS.length?TS.map(t=>`<button type="button" class="chip ${reunTurmas(r,a).includes(t)?'on':''}" data-rtu="${t.id}">${anoBadge(t,'sm')} ${esc(t.nome)} <span class="mut">${esc(t.disciplina)}</span></button>`).join(''):'<span class="mut">Ainda não há turmas.</span>'}</div></div>
      <div><label>Convocada por</label><input id="r-conv" value="${esc(r.convocante)}" placeholder="Direção, coordenador(a)…"></div>
      <div style="grid-column:1/-1"><label>Participantes</label><input id="r-part" value="${esc(r.participantes)}" placeholder="Conselho de turma, grupo 330…"></div></div>
    <div id="r-conf"></div>
    <label style="margin-top:12px">${ic('bell',14)} Lembretes</label><div class="row" style="gap:6px;flex-wrap:wrap">${REUN_LEMB.map(([m,l])=>`<button type="button" class="chip ${(r.lembretes||[]).includes(m)?'on':''}" data-lb="${m}">${l} antes</button>`).join('')}</div>
    ${ed?'':`<div class="g2" style="margin-top:12px"><div><label>Repetir</label><select id="r-rep"><option value="">Não repetir</option><option value="7">Todas as semanas</option><option value="14">De 15 em 15 dias</option><option value="m">Todos os meses</option></select></div><div><label>Até</label><input type="date" id="r-ate" value="${(a.calendario&&a.calendario.periodos.length?a.calendario.periodos[a.calendario.periodos.length-1].fim:'')}"></div></div>`}
    <label style="margin-top:12px">Ordem de trabalhos <span class="mut">(um ponto por linha)</span></label><textarea id="r-ord" rows="4" placeholder="1. Informações\n2. Avaliação intercalar\n3. Outros assuntos">${esc((r.ordem||[]).map(o=>o.t).join('\n'))}</textarea>
    <label style="margin-top:10px">A preparar / levar <span class="mut">(um item por linha — vira uma lista de verificação)</span></label><textarea id="r-prep" rows="3" placeholder="Grelhas de avaliação\nPropostas de níveis\nRelatório do PAPI">${esc((r.prep||[]).map(o=>o.t).join('\n'))}</textarea>
    ${ed?`<label style="margin-top:10px">Estado</label><div class="seg" id="r-est">${Object.entries(REUN_EST).map(([k,v])=>`<button type="button" data-es="${k}" class="${r.estado===k?'on':''}">${v.n}</button>`).join('')}</div>`:''}
    <div class="row" style="margin-top:16px;gap:8px"><button class="btn pri" id="r-ok">${ic('check',15)} ${ed?'Guardar':'Agendar Reunião'}</button>${ed?`<button class="btn" id="r-dup">${ic('copy',15)} Duplicar</button><span class="sp1"></span><button class="btn dng" id="r-del">${ic('trash',15)} Apagar</button>`:''}</div></div>`);
  const ler=()=>{r.titulo=$('#r-tit').value.trim();r.data=$('#r-data').value;r.ini=hm($('#r-ini').value)??r.ini;r.fim=hm($('#r-fim').value);if(r.fim!=null&&r.fim<=r.ini)r.fim=r.ini+60;
    r.local=$('#r-loc').value.trim();r.link=$('#r-link').value.trim();r.turmas=$$('[data-rtu].on').map(b=>b.dataset.rtu);r.turma=null;r.convocante=$('#r-conv').value.trim();r.participantes=$('#r-part').value.trim();
    const ant=k=>Object.fromEntries((r[k]||[]).map(o=>[o.t,o]));const lin=s=>s.split('\n').map(x=>x.replace(/^\s*(\d+[.)]|[-•*])\s*/,'').trim()).filter(Boolean);
    const ao=ant('ordem'),ap=ant('prep');r.ordem=lin($('#r-ord').value).map(t=>ao[t]||{t,feito:false});r.prep=lin($('#r-prep').value).map(t=>ap[t]||{t,ok:false})};
  const conf=()=>{ler();const c=conflitosReuniao(a,r);const el=$('#r-conf');if(!el)return;$('#r-tit').placeholder=reunTitulo({...r,titulo:''},a);
    el.innerHTML=c.length?`<div class="alert w" style="margin:12px 0 0">${ic('alert',15)} Neste horário já tem: ${c.map(x=>`<b>${esc(x.lbl)}</b> (${fmtHM(x.ini)}–${fmtHM(x.fim)})`).join(', ')}.</div>`:(r.data?`<div class="hint" style="margin-top:10px">${ic('check',13)} Sem sobreposições com as suas aulas, tempos não letivos ou outras reuniões.</div>`:'')};
  $$('[data-rt]').forEach(b=>b.onclick=()=>{r.tipo=b.dataset.rt;$$('[data-rt]').forEach(x=>x.classList.toggle('on',x===b));
    if(!$('#r-ord').value.trim()){const mod={ct:'Informações\nAnálise do comportamento e aproveitamento da turma\nAvaliação dos alunos\nMedidas de suporte à aprendizagem\nOutros assuntos',avl:'Informações\nAvaliação dos alunos\nAprovação das pautas\nOutros assuntos',dep:'Informações\nArticulação curricular\nOutros assuntos',grupo:'Informações\nPlanificações e critérios\nMatriz dos testes\nOutros assuntos',ped:'Informações\nAssuntos pedagógicos\nOutros assuntos',ee:'Apresentação\nComportamento e aproveitamento\nInformações sobre a avaliação\nOutros assuntos'}[r.tipo];if(mod)$('#r-ord').value=mod}conf()});
  $$('[data-lb]').forEach(b=>b.onclick=()=>{const m=+b.dataset.lb;r.lembretes=(r.lembretes||[]).includes(m)?r.lembretes.filter(x=>x!==m):[...(r.lembretes||[]),m].sort((x,y)=>y-x);b.classList.toggle('on')});
  $$('#r-est [data-es]').forEach(b=>b.onclick=()=>{r.estado=b.dataset.es;$$('#r-est [data-es]').forEach(x=>x.classList.toggle('on',x===b))});
  ['r-data','r-ini','r-fim'].forEach(i=>{const e=$('#'+i);if(e)e.addEventListener('change',conf)});$$('[data-rtu]').forEach(b=>b.onclick=()=>{b.classList.toggle('on');conf()});conf();
  $('#r-ok').onclick=()=>{ler();if(!r.data)return alert('Indique a data da reunião.');let n=1;
    if(ed){if(ed.data!==r.data||ed.ini!==r.ini)r.avisados={};Object.assign(ed,r)}
    else{const rep=($('#r-rep')||{}).value,ate=($('#r-ate')||{}).value;L.push(r);
      if(rep&&ate){r.serie=r.id;let d=dataDeIso(r.data);for(let k=0;k<60;k++){if(rep==='m'){const d0=dataDeIso(r.data),m1=new Date(d0.getFullYear(),d0.getMonth()+k+1,1);d=new Date(m1.getFullYear(),m1.getMonth(),Math.min(d0.getDate(),new Date(m1.getFullYear(),m1.getMonth()+1,0).getDate()))}else d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(+rep));const iso=isoData(d);if(iso>ate)break;
        L.push({...JSON.parse(JSON.stringify(r)),id:uid()+k,data:iso,serie:r.id,avisados:{}});n++}}
      if(n>1)toast(n+' reuniões agendadas','ok')}
    saveNow();closeDrawer();if(ed||!(n>1))toast(ed?'Reunião guardada':'Reunião agendada para '+fmtIsoL(r.data)+' às '+fmtHM(r.ini),'ok');verificarLembretes(true);go(VIEW==='reunioes'?'reunioes':VIEW)};
  if(ed){$('#r-dup').onclick=()=>{ler();closeDrawer();const c=JSON.parse(JSON.stringify(r));delete c.id;delete c.serie;c.estado='agendada';c.notas='';c.decisoes=[];c.avisados={};(c.prep||[]).forEach(p=>p.ok=false);(c.ordem||[]).forEach(o=>o.feito=false);setTimeout(()=>reuniaoDlg(null,c),60)};
    $('#r-del').onclick=()=>{const serie=ed.serie&&L.filter(x=>x.serie===ed.serie&&x.data>=ed.data).length>1;
      const todas=serie&&confirm('Esta reunião faz parte de uma série. Apagar também as seguintes da série?\n\nOK = esta e as seguintes · Cancelar = só esta');
      if(!serie&&!confirm('Apagar a reunião “'+reunTitulo(ed,a)+'”?'))return;
      a.reunioes=L.filter(x=>!(x===ed||(todas&&x.serie===ed.serie&&x.data>=ed.data)));S.lixo=S.lixo||[];S.lixo.unshift({id:uid(),tipo:'reuniao',obj:ed,ctx:{ano:a.id},quando:Date.now()});saveNow();closeDrawer();toast('Reunião apagada');go(VIEW)}}}
/* ---------- ficha da reunião (preparação, ordem de trabalhos, notas, tarefas) ---------- */
function reuniaoVer(id){const a=A();if(!a)return;if(String(id).startsWith('av:')){UI.reTab='prox';toast('Reunião de avaliação: edite-a na Marcação de Testes (painel de avaliação).');return}
  const r=reunioes(a).find(x=>x.id===id);if(!r)return;const T_=reunTipo(r);const t=reunTurma(r,a);const c=reunAtiva(r)?conflitosReuniao(a,r):[];
  const lista=(k,f)=>(r[k]||[]).map((o,i)=>`<label class="chk rck"><input type="checkbox" data-${k}="${i}" ${o[f]?'checked':''}> <span>${esc(o.t)}</span></label>`).join('');
  const html=`<div class="rver" style="--rc:${T_.cor}">
    <div class="rvh"><span class="rbadge">${T_.ab}</span><div><b>${esc(reunTitulo(r,a))}</b><div class="mut">${esc(T_.n)}${reunTurmas(r,a).length?' · '+reunTurmas(r,a).map(x=>esc(x.nome)+' ('+esc(x.disciplina)+')').join(', '):''}</div></div><span class="rest" style="--ec:${REUN_EST[r.estado].cor}">${REUN_EST[r.estado].n}</span></div>
    <div class="rvq"><div>${ic('calendar',15)} <b>${esc(DIAS[dataDeIso(r.data).getDay()])}, ${esc(fmtIsoL(r.data).split(', ')[1])}</b> · ${fmtHM(r.ini)}${r.fim!=null?'–'+fmtHM(r.fim)+' <span class="mut">('+durTxt(r.fim-r.ini)+')</span>':''}</div>
      <div>${ic('clock',15)} ${reunAtiva(r)?esc(quandoTxt(r)):esc(contagem(r.data))}</div>${r.local?`<div>${ic('flag',15)} ${esc(r.local)}</div>`:''}${r.convocante?`<div>${ic('user',15)} Convocada por ${esc(r.convocante)}</div>`:''}${r.participantes?`<div>${ic('users',15)} ${esc(r.participantes)}</div>`:''}
      ${(r.lembretes||[]).length?`<div>${ic('bell',15)} ${r.lembretes.slice().sort((x,y)=>y-x).map(m=>(REUN_LEMB.find(x=>x[0]===m)||[0,m+' min'])[1]).join(', ')} antes</div>`:''}</div>
    ${r.link?`<a class="btn pri" href="${esc(r.link)}" target="_blank" rel="noopener" style="margin-top:10px">${ic('mic',15)} Entrar na Reunião Online</a>`:''}
    ${c.length?`<div class="alert w" style="margin-top:12px">${ic('alert',15)} Sobrepõe-se a ${c.map(x=>'<b>'+esc(x.lbl)+'</b>').join(', ')}.</div>`:''}
    <div class="row" style="gap:6px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" id="rv-ed">${ic('pencil',14)} Editar</button>${reunAtiva(r)?`<button class="btn sm" id="rv-real">${ic('check',14)} Realizada</button><button class="btn sm" id="rv-adi">${ic('clock',14)} Adiar</button><button class="btn sm" id="rv-can">${ic('calx',14)} Cancelar</button>`:`<button class="btn sm" id="rv-reab">${ic('refresh',14)} Reabrir</button>`}<button class="btn sm" id="rv-ics">${ic('download',14)} Calendário (.ics)</button></div>
    ${(r.prep||[]).length?`<h3>${ic('checks',15)} Preparação <span class="mut">${r.prep.filter(p=>p.ok).length}/${r.prep.length}</span></h3><div class="pbar"><span style="width:${Math.round(100*r.prep.filter(p=>p.ok).length/r.prep.length)}%"></span></div>${lista('prep','ok')}`:''}
    ${(r.ordem||[]).length?`<h3>${ic('list',15)} Ordem de Trabalhos</h3>${lista('ordem','feito')}`:''}
    <h3>${ic('pen',15)} Notas / Ata</h3><textarea id="rv-not" class="autoalto" rows="6" placeholder="Apontamentos durante a reunião — servem de base à ata.">${esc(r.notas||'')}</textarea>
    <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" id="rv-ata">${ic('file',14)} Descarregar Ata (.doc)</button><button class="btn sm" id="rv-cop">${ic('copy',14)} Copiar Ata</button></div>
    <h3>${ic('target',15)} Decisões e Tarefas</h3><div id="rv-dec">${(r.decisoes||[]).map((d,i)=>`<div class="rdec ${d.ok?'ok':''} ${!d.ok&&d.prazo&&d.prazo<isoData(new Date())?'atr':''}"><input type="checkbox" data-dk="${i}" ${d.ok?'checked':''} aria-label="Concluída"><span><b>${esc(d.t)}</b><span class="mut">${d.resp?esc(d.resp):''}${d.prazo?(d.resp?' · ':'')+'até '+esc(fmtIsoL(d.prazo)):''}</span></span><button class="btn sm ico" data-dx="${i}" aria-label="Apagar tarefa">${ic('x',13)}</button></div>`).join('')||'<p class="mut" style="margin:0">Sem tarefas registadas.</p>'}</div>
    <div class="rdnew"><input id="rd-t" placeholder="Nova tarefa ou decisão…"><input id="rd-r" placeholder="Responsável" value="${esc(S.cfg.professor?'Eu':'')}"><input type="date" id="rd-p"><button class="btn sm pri" id="rd-ok">${ic('plus',14)}</button></div></div>`;
  openDrawer('Reunião',html);
  const salvar=()=>{saveNow();if(VIEW==='reunioes')vReunioes();else if(VIEW==='inicio')go('inicio')};
  $$('[data-prep]').forEach(x=>x.onchange=()=>{r.prep[+x.dataset.prep].ok=x.checked;salvar();reuniaoVer(id)});
  $$('[data-ordem]').forEach(x=>x.onchange=()=>{r.ordem[+x.dataset.ordem].feito=x.checked;save()});
  $('#rv-not').addEventListener('input',e=>{r.notas=e.target.value;save()});autoAlto($('#rv-not'));$('#rv-not').addEventListener('change',()=>{if(VIEW==='reunioes')vReunioes()});
  $$('[data-dk]').forEach(x=>x.onchange=()=>{r.decisoes[+x.dataset.dk].ok=x.checked;salvar();reuniaoVer(id)});
  $$('[data-dx]').forEach(x=>x.onclick=()=>{r.decisoes.splice(+x.dataset.dx,1);salvar();reuniaoVer(id)});
  const nova=()=>{const tx=$('#rd-t').value.trim();if(!tx)return $('#rd-t').focus();(r.decisoes=r.decisoes||[]).push({id:uid(),t:tx,resp:$('#rd-r').value.trim(),prazo:$('#rd-p').value||'',ok:false});salvar();reuniaoVer(id);setTimeout(()=>$('#rd-t')&&$('#rd-t').focus(),50)};
  $('#rd-ok').onclick=nova;$('#rd-t').onkeydown=e=>{if(e.key==='Enter')nova()};
  $('#rv-ed').onclick=()=>{closeDrawer();setTimeout(()=>reuniaoDlg(id),60)};
  const est=v=>{r.estado=v;salvar();toast('Reunião '+REUN_EST[v].n.toLowerCase(),'ok');reuniaoVer(id)};
  if($('#rv-real'))$('#rv-real').onclick=()=>est('realizada');if($('#rv-can'))$('#rv-can').onclick=()=>{if(confirm('Marcar a reunião como cancelada?'))est('cancelada')};if($('#rv-reab'))$('#rv-reab').onclick=()=>est('agendada');
  if($('#rv-adi'))$('#rv-adi').onclick=async()=>{const D_=await pedirDatas('Adiar a reunião',[{l:'Nova data',v:r.data,vazio:'Deixe em branco para «adiada, sem data».'}]);if(D_===null)return;const v=D_[0]?D_[0].split('-').reverse().join('/'):'';
    const m=v.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);if(m){r.data=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');r.estado='agendada';r.avisados={};toast('Reunião adiada para '+fmtIsoL(r.data),'ok')}else{r.estado='adiada';toast('Reunião adiada (sem nova data)')}salvar();reuniaoVer(id)};
  $('#rv-ics').onclick=()=>exportarICS([r],reunTitulo(r,a));
  $('#rv-ata').onclick=()=>download('Ata '+reunTitulo(r,a).replace(/[\\/:*?"<>|]/g,'-')+' '+r.data+'.doc',ataHTML(r),'application/msword');
  $('#rv-cop').onclick=async()=>{try{await navigator.clipboard.writeText(ataTexto(r));toast('Ata copiada','ok')}catch(_){prompt('Copie o texto:',ataTexto(r))}}}
