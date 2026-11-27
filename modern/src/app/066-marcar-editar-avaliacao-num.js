/* ---------- marcar / editar uma avaliação num dia ---------- */
function marcarDlg(t,iso,insId){
  const a=A(),c=a.calendario;const oc=c?ocorrenciasTurma(t,a):{};const hj=isoData(new Date());
  const ex=insId?t.instrumentos.find(i=>i.id===insId):null;iso=iso||(ex&&ex.data)||Object.keys(oc).find(i=>i>=hj)||hj;
  const doDia=t.instrumentos.filter(i=>i.data===iso&&i!==ex);
  const o=oc[iso];const tp=c?c.dias[iso]:null;const per=periodoDe(iso)||perAtual(t);
  const nT=t.instrumentos.filter(i=>ehTeste(i)&&+i.periodo===per&&i!==ex).length+1;
  const tipos=[...new Set([...(S.cfg.tipos||TIPOS_INST)])];
  openDrawer(ex?'Avaliação Marcada':'Marcar Avaliação',`<div class="ed">
    <div class="mtdh"><b>${esc(fmtIsoL(iso))}</b>${o?`<span class="mut">${o.blocos.map(b=>fmtHM(b.ini)+'–'+fmtHM(b.fim)+(b.sala?' · Sala '+b.sala:'')).join(' · ')} · ${o.tempos} tempo${o.tempos>1?'s':''} · Σ${o.cumA} no ano (${o.cumP} no ${o.per}.º)</span>`:`<span class="mut">${tp&&!LETIVOS.includes(tp)?esc((TIPOS_DIA[tp]||{}).n||''):'Sem aulas desta turma neste dia'}</span>`}</div>
    ${!o?`<div class="alert w">${ic('alert',15)} Neste dia não tem aula com ${esc(t.nome)}.</div>`:''}
    ${doDia.length?`<div class="alert">${ic('info',15)} Já marcado neste dia: ${doDia.map(i=>esc(i.nome)).join(', ')}</div>`:''}
    ${o&&o.falta?`<div class="alert w">${ic('alert',15)} Registou uma falta sua neste dia (${esc(o.falta.motivo)}).</div>`:''}
    ${(()=>{const lim=S.cfg.limTestes==null?3:S.cfg.limTestes;const n=testesSemana(t,a,iso)-(ex&&ehTeste(ex)&&inicioSemana(ex.data)===inicioSemana(iso)?1:0);return lim&&n>=lim?`<div class="alert w">${ic('alert',15)} Esta turma já tem ${n} teste${n>1?'s':''} nesta semana (limite definido: ${lim}).</div>`:''})()}
    <label>Tipo</label><div class="nlcat">${['Teste de Avaliação','Questão-aula','Ficha de Trabalho','Apresentação Oral','Prova Oral','Trabalho de Grupo'].filter(x=>tipos.includes(x)||true).map(x=>`<button type="button" data-tp="${esc(x)}" class="${(ex?ex.tipo:'Teste de Avaliação')===x?'on':''}"><span class="mtp" style="--pc:${TIPO_COR(x)}">${esc(TIPO_AB(x))}</span> ${esc(x)}</button>`).join('')}</div>
    <div class="g2" style="margin-top:10px"><div><label>Designação</label><input id="mk-nome" value="${esc(ex?ex.nome:'Teste '+nT)}"></div><div><label>Data</label><input type="date" id="mk-data" value="${esc(iso)}"></div></div>
    <label style="margin-top:10px">Conteúdos / Observações</label><textarea id="mk-obs" style="min-height:70px" placeholder="ex.: Unidade 2 — Tech and Society">${esc(ex&&ex.obs||'')}</textarea>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="mk-ok">${ic('check',15)} ${ex?'Guardar':'Marcar'}</button>${ex?`<button class="btn" id="mk-open">${ic('clipboard',15)} Abrir Instrumento</button><button class="btn dng" id="mk-del">${ic('trash',15)} Desmarcar</button>`:''}</div>
    <div class="mtod"><div class="row" style="gap:6px"><span class="mta od" style="--pc:#8e8e93">OD</span><b style="font-size:13.5px">Testes de outras disciplinas neste dia</b></div>
      ${(a.datasAval||[]).filter(d=>d.tipo==='outrotest'&&d.turma===t.id&&d.data===iso).map(d=>`<div class="row" style="gap:6px;margin-top:6px"><span>${esc(d.titulo)}</span><span class="sp1"></span><button class="btn sm ico dng" data-odx="${d.id}" aria-label="Apagar">${ic('trash',14)}</button></div>`).join('')}
      <div class="row" style="gap:6px;margin-top:6px"><input id="od-n" placeholder="Disciplina (ex.: Matemática A)" style="flex:1"><button class="btn sm" id="od-add">${ic('plus',14)} Acrescentar</button></div></div>
    ${!ex?(()=>{const par=a.turmas.filter(x=>x!==t&&x.disciplina===t.disciplina&&x.anoEsc===t.anoEsc&&escId(escolaDe(x))===escId(escolaDe(t)));return par.length?`<div class="mtpar"><b style="font-size:13.5px">Marcar também nas turmas paralelas</b>${par.map(x=>`<label class="chk"><input type="checkbox" data-par="${x.id}"> ${anoBadge(x,'sm')} ${esc(x.nome)} <span class="mut">(na aula mais próxima a partir deste dia)</span></label>`).join('')}</div>`:''})():''}
    ${o?`<div class="mtfx">${o.falta?`<span class="mtf">F</span><span>Falta do professor neste dia: <b>${esc(o.falta.motivo)}</b> · ${o.ft} tempo${o.ft>1?'s':''}</span><span class="sp1"></span><button class="btn sm" id="mk-fal">Editar Falta</button>`:`<span class="mut">Faltou a esta aula?</span><span class="sp1"></span><button class="btn sm" id="mk-fal">${ic('plus',14)} Registar Falta</button>`}</div>`:''}
    ${ex?'':`<p class="hint">Cria um instrumento de avaliação com esta data no ${per}.º ${perW().toLowerCase()} (itens por domínio, que pode ajustar em Instrumentos).</p>`}</div>`);
  let tipo=ex?ex.tipo:'Teste de Avaliação';
  $$('[data-tp]').forEach(b=>b.onclick=()=>{tipo=b.dataset.tp;$$('[data-tp]').forEach(x=>x.classList.toggle('on',x===b));
    if(!ex){const n=t.instrumentos.filter(i=>normT(i.tipo)===normT(tipo)&&+i.periodo===per).length+1;$('#mk-nome').value=(ehTeste({tipo})?'Teste':tipo)+' '+n}});
  $('#mk-ok').onclick=()=>{const data=$('#mk-data').value;if(!data)return alert('Indique a data.');const p=Math.min(periodoDe(data)||per,periodos().length);
    let i=ex;const dAnt=i&&i.data;if(!i){i={id:uid(),nome:'',tipo,periodo:p,data,itens:t.dominios.map((d,k)=>({id:uid()+k,rot:'Item '+(k+1),dom:d.id,cot:10})),notas:{}};t.instrumentos.push(i)}
    i.nome=$('#mk-nome').value.trim()||i.nome||tipo;i.tipo=tipo;i.data=data;i.periodo=p;i.obs=$('#mk-obs').value.trim();
    const extra=[];$$('[data-par]').forEach(c=>{if(!c.checked)return;const x=a.turmas.find(q=>q.id===c.dataset.par);if(!x)return;const ocx=ocorrenciasTurma(x,a);const d2=Object.keys(ocx).find(d=>d>=data)||data;const p2=Math.min(periodoDe(d2)||p,periodos().length);
      x.instrumentos.push({id:uid(),nome:i.nome,tipo,periodo:p2,data:d2,obs:i.obs,itens:x.dominios.map((d,k)=>({id:uid()+k,rot:'Item '+(k+1),dom:d.id,cot:10})),notas:{}});extra.push(x.nome+' '+fmtIso(d2))});
    if(dAnt!==data)delete i.matrizEnviada;saveNow();closeDrawer();vTestes();toast(i.nome+' · '+fmtIsoL(data)+(extra.length?' · também: '+extra.join(', '):'')+(ehTeste(i)&&cfgMatriz().ativo?' · envio da matriz: '+fmtIsoL(dataMatriz(data)):''),'ok')};
  $('#od-add').onclick=()=>{const v=$('#od-n').value.trim();if(!v)return;a.datasAval=a.datasAval||[];a.datasAval.push({id:uid(),tipo:'outrotest',per:per,data:iso,titulo:v,turma:t.id});saveNow();marcarDlg(t,iso,insId);vTestes()};
  $$('[data-odx]').forEach(b=>b.onclick=()=>{a.datasAval=a.datasAval.filter(d=>d.id!==b.dataset.odx);saveNow();marcarDlg(t,iso,insId);vTestes()});
  const fb=$('#mk-fal');if(fb)fb.onclick=()=>faltaDlg(t,iso,o&&o.falta?o.falta.id:null,()=>vTestes());
  const op=$('#mk-open');if(op)op.onclick=()=>{UI.inst=ex.id;UI.instTab='itens';closeDrawer();go('instrumentos')};
  const dl=$('#mk-del');if(dl)dl.onclick=()=>{const tem=Object.keys(ex.notas||{}).length;
    if(tem){if(!confirm(ex.nome+' já tem classificações. Retirar só a data (o instrumento mantém-se)?'))return;ex.data=''}
    else{if(!confirm('Desmarcar '+ex.nome+'?'))return;t.instrumentos=t.instrumentos.filter(x=>x!==ex)}
    saveNow();closeDrawer();vTestes()};
}
/* arrastar marcações (testes) para outro dia */
function arrastarMarcacoes(t){
  let st=null;const alvo=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('[data-mt]'):null};
  $$('.mtc .mtp[data-ins]').forEach(el=>{
    el.addEventListener('pointerdown',e=>{if(e.button>0)return;e.stopPropagation();st={el,id:el.dataset.ins,x:e.clientX,y:e.clientY,on:false,td:null};try{el.setPointerCapture(e.pointerId)}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!st||st.el!==el)return;if(!st.on){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<8)return;st.on=true;st.gh=el.cloneNode(true);st.gh.classList.add('ghost');document.body.appendChild(st.gh);el.style.opacity=.3}
      e.preventDefault();Object.assign(st.gh.style,{left:(e.clientX-14)+'px',top:(e.clientY-12)+'px'});const td=alvo(e.clientX,e.clientY);if(td!==st.td){if(st.td)st.td.classList.remove('drop');st.td=td;if(td)td.classList.add('drop')}});
    const fim=e=>{if(!st||st.el!==el)return;const s_=st;st=null;if(!s_.on)return;s_.gh.remove();el.style.opacity='';if(s_.td)s_.td.classList.remove('drop');
      const cel=el.closest('[data-mt]');if(cel){cel._arr=true;setTimeout(()=>cel._arr=false,400)}
      const td=s_.td||alvo(e.clientX,e.clientY);if(!td)return;const i=t.instrumentos.find(x=>x.id===s_.id);const novo=td.dataset.mt;if(!i||i.data===novo)return;
      if(td._arr!==undefined)td._arr=true;
      i.data=novo;const p=periodoDe(novo);if(p&&p<=periodos().length)i.periodo=p;saveNow();vTestes();
      const oc=ocorrenciasTurma(t);toast(i.nome+' → '+fmtIsoL(novo)+(oc[novo]?'':' · atenção: sem aula nesse dia'))};
    el.addEventListener('pointerup',fim);el.addEventListener('pointercancel',fim);
  });
}
/* ---------- Início: próximos testes e datas importantes ---------- */
function proximosTestes(a,dias){const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+dias*864e5));const L=[];
  turmasFiltradas(a).forEach(t=>t.instrumentos.forEach(i=>{if(i.data&&i.data>=hj&&i.data<=lim)L.push({t,i})}));return L.sort((x,y)=>x.i.data.localeCompare(y.i.data))}
function datasImportantes(a,dias){
  const hj=isoData(new Date());const lim=isoData(new Date(Date.now()+dias*864e5));const c=a.calendario;const L=[];
  if(c){eventosCalendario(c).forEach(e=>{if(e.fim<hj||e.ini>lim||['inicio','inicio2'].includes(e.t))return;
      L.push({ini:e.ini,fim:e.fim,cor:TIPOS_DIA[e.t].cor,ink:TIPOS_DIA[e.t].ink,t:e.t==='interrupcao'?'Interrupção Letiva'+(e.nota?' ('+e.nota+')':''):e.t==='termo'?'Termo das Aulas':(e.nota||TIPOS_DIA[e.t].n),s:e.t==='termo'?e.nota:e.t==='interrupcao'?'sem aulas':'',tipo:e.t})});
    c.periodos.forEach(p=>{if(p.fim>=hj&&p.fim<=lim)L.push({ini:p.fim,fim:p.fim,cor:'#0a5aa8',ink:'#fff',t:'Fim do '+p.n+'.º '+(c.periodos.length===2?'Semestre':'Período'),s:'último dia de aulas',tipo:'fimp'});
      if(p.ini>hj&&p.ini<=lim)L.push({ini:p.ini,fim:p.ini,cor:'#1a7f37',ink:'#fff',t:'Início do '+p.n+'.º '+(c.periodos.length===2?'Semestre':'Período'),s:'',tipo:'inip'})})}
  const atI=intercalarPeriodos(a);(a.datasAval||[]).forEach(d=>{if(!d.data||(d.tipo==='intercalar'&&(d.turma||!atI.includes(d.per))))return;const f=d.fim||d.data;if(f<hj||d.data>lim)return;const t=d.turma?a.turmas.find(x=>x.id===d.turma):null;if(d.turma&&!t)return;
    if(d.tipo==='outrotest')return;L.push({ini:d.data,fim:f,cor:AVAL_T[d.tipo].cor,ink:'#fff',t:nomeAval(d)+(d.tipo==='intercalar'?' ('+d.per+'.º)':''),s:t?t.nome+' · '+t.disciplina:'todas as turmas',tipo:'aval'})});
  matrizes(a).filter(x=>!x.enviada&&x.i.data>=hj&&x.data<=lim).forEach(x=>L.push({ini:x.data<hj?hj:x.data,fim:x.data<hj?hj:x.data,cor:'#c2410c',ink:'#fff',t:'Envio da Matriz — '+x.i.nome,s:x.t.nome+' · teste '+fmtIsoL(x.i.data)+(x.data<hj?' · em atraso':''),tipo:'matriz'}));
  reunioes(a).filter(r=>reunAtiva(r)&&r.data>=hj&&r.data<=lim).forEach(r=>L.push({ini:r.data,fim:r.data,cor:reunTipo(r).cor,ink:'#fff',t:reunTitulo(r,a),s:fmtHM(r.ini)+(r.local?' · '+r.local:''),tipo:'reun',rid:r.id}));
  const seen=new Set();return L.filter(x=>{const k=x.ini+x.t;if(seen.has(k))return false;seen.add(k);return true}).sort((x,y)=>x.ini.localeCompare(y.ini));
}
