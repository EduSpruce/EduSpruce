/* ===================== v0.50 · Contactos com o encarregado de educação ===================== */
const MEIOS_EE=['Telefone','Presencial','E-mail','Mensagem / caderneta','Videochamada','Carta'];
function contactosEE(a,cid){const c=alC(a,cid);return c.contactosEE=c.contactosEE||[]}
function contactoDlg(t,x,ed,depois){const a=A();ligarClasse(a);const cid=x.cid;const L=contactosEE(a,cid);const c=ed||{};const hj=isoHoje();
  openDrawer((ed?'Editar':'Novo')+' Contacto com o EE — '+x.nome.split(' ')[0],`<div class="ed cee">
    <p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)}${x.eeNome?' · EE: '+esc(x.eeNome)+(x.eeParent?' ('+esc(x.eeParent)+')':''):''}${x.eeContacto?' · '+esc(x.eeContacto):''}</p>
    <div class="g2"><div><label>Data</label><input type="date" id="ce-d" value="${esc(c.data||hj)}"></div><div><label>Meio</label><select id="ce-m">${MEIOS_EE.map(m=>`<option ${c.meio===m?'selected':''}>${m}</option>`).join('')}</select></div>
    <div style="grid-column:1/-1"><label>Assunto</label><input id="ce-a" value="${esc(c.assunto||'')}" placeholder="ex.: Faltas a Inglês, resultado do teste, comportamento…" list="ce-al"><datalist id="ce-al">${['Assiduidade','Aproveitamento','Comportamento','Medidas de apoio','Informação intercalar','Convocatória','Pedido do encarregado de educação'].map(o=>`<option>${o}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Síntese</label><textarea id="ce-s" rows="4" placeholder="O que foi falado…">${esc(c.sintese||'')}</textarea></div>
    <div style="grid-column:1/-1"><label>Compromisso assumido</label><textarea id="ce-c" rows="2" placeholder="ex.: O EE vai acompanhar o estudo diário; o aluno vai ao apoio às quartas.">${esc(c.compromisso||'')}</textarea></div>
    <div><label>Data de acompanhamento</label><input type="date" id="ce-f" value="${esc(c.acomp||'')}"></div><div><label class="chk" style="margin-top:26px"><input type="checkbox" id="ce-t" ${c.tarefa||!ed?'checked':''}> Criar tarefa para essa data</label></div></div>
    <div class="row" style="margin-top:14px;gap:8px">${ed?`<button class="btn dng" id="ce-x">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn" id="ce-can">Cancelar</button><button class="btn pri" id="ce-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#ce-can').onclick=()=>{closeDrawer();depois&&depois()};
  const ex=$('#ce-x');if(ex)ex.onclick=()=>{if(!confirm('Apagar este registo de contacto?'))return;const k=L.indexOf(ed);if(k>=0)L.splice(k,1);if(ed.tarefa){const T_=tarefas();const j=T_.findIndex(z=>z.id===ed.tarefa);if(j>=0&&!T_[j].feito)T_.splice(j,1)}save();closeDrawer();toast('Contacto apagado');depois&&depois()};
  $('#ce-ok').onclick=()=>{const o=ed||{id:uid(),criado:Date.now()};Object.assign(o,{data:$('#ce-d').value||hj,meio:$('#ce-m').value,assunto:$('#ce-a').value.trim(),sintese:$('#ce-s').value.trim(),compromisso:$('#ce-c').value.trim(),acomp:$('#ce-f').value||'',disc:t.disciplina,turma:t.nome,autor:(S.cfg.professor||'')});
    if(!o.assunto&&!o.sintese){toast('Indique pelo menos o assunto ou a síntese','aviso');return}
    const querT=$('#ce-t').checked&&o.acomp;const T_=tarefas();let tk=o.tarefa&&T_.find(z=>z.id===o.tarefa);
    if(querT){const txt='Acompanhar contacto com o EE de '+x.nome.split(' ')[0]+' ('+t.nome+')'+(o.assunto?': '+o.assunto:'')+(o.compromisso?' — '+o.compromisso:'');if(tk){tk.t=txt;tk.prazo=o.acomp}else{tk={id:uid(),t:txt,prazo:o.acomp,feito:false,criada:Date.now(),orig:{tipo:'contactoEE',cid:x.cid,cont:o.id}};T_.push(tk)}o.tarefa=tk.id}
    else if(tk&&!tk.feito){T_.splice(T_.indexOf(tk),1);delete o.tarefa}
    if(!ed)L.push(o);L.sort((p,q)=>(q.data||'').localeCompare(p.data||''));save();audit('Contactos com o EE',ed?'Contacto editado':'Contacto registado',x.nome+' · '+o.data);closeDrawer();toast('Contacto registado'+(querT?' · tarefa criada para '+fmtIso(o.acomp):''),'ok');depois&&depois()}}

