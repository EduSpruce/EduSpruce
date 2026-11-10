/* ---------- aulas previstas (calendário × horário da turma) ---------- */
function aulasPrevistas(t,a){
  a=a||A();const c=a&&a.calendario;if(!c||!c.periodos.length)return null;
  const B=blocos(aulasTurma(t,a));if(!B.length)return null;
  const ini=inicioTurma(t,c),fim=termoTurma(t,c);
  const agora=new Date(),hj=isoData(agora),mins=agora.getHours()*60+agora.getMinutes();
  const FT=faltasDe(t,a);
  const P=c.periodos.map(p=>({n:p.n,ini:p.ini>ini?p.ini:ini,fim:fim&&p.fim>fim?fim:p.fim,aulas:0,tempos:0,dadas:0,tDadas:0,faltas:[],tFaltas:0,porDia:{},perdidas:[]})).filter(p=>p.ini<=p.fim);
  P.forEach(p=>{for(let d=dataDeIso(p.ini);isoData(d)<=p.fim;d.setDate(d.getDate()+1)){
    const iso=isoData(d),Bd=blocosDia(t,a,B,d);if(!Bd.length)continue;
    if(letivoPara(t,iso)){Bd.forEach(b=>{p.aulas++;p.tempos+=b.tempos;p.porDia[b.dia]=(p.porDia[b.dia]||0)+b.tempos;
      if(iso<hj||(iso===hj&&b.fim<=mins)){p.dadas++;p.tDadas+=b.tempos}});
      const f=FT.find(x=>x.data===iso&&!x.subst);if(f){const tp=Bd.reduce((s,b)=>s+b.tempos,0);const ft=Math.min(tp,+f.tempos||tp);p.tFaltas+=ft;p.faltas.push({...f,ft});
        if(iso<=hj){p.tDadas=Math.max(0,p.tDadas-ft);if(ft>=tp)p.dadas=Math.max(0,p.dadas-Bd.length)}}}
    else p.perdidas.push({iso,tipo:c.dias[iso]||'nao',nota:(c.notas||{})[iso]||'',aulas:Bd.length,tempos:Bd.reduce((s,b)=>s+b.tempos,0)});
  }});
  (a.reposicoes||[]).filter(r=>r.turma===t.id&&r.data<=hj).forEach(r=>{const p=P.find(q=>r.data>=q.ini&&r.data<=q.fim)||P[P.length-1];if(p){const tp=+r.tempos||1;p.dadas++;p.tDadas+=tp;p.repostas=(p.repostas||0)+tp}});
  const sem=B.reduce((s,b)=>s+b.tempos,0);
  return {P,semana:sem,aulasSemana:B.length,ini,fim,tot:{aulas:P.reduce((s,p)=>s+p.aulas,0),tempos:P.reduce((s,p)=>s+p.tempos,0),dadas:P.reduce((s,p)=>s+p.dadas,0),tDadas:P.reduce((s,p)=>s+p.tDadas,0),tFaltas:P.reduce((s,p)=>s+p.tFaltas,0),faltas:P.reduce((s,p)=>s+p.faltas.length,0)}};
}
/* ---------- faltas do professor ---------- */
const MOTIVOS_F=['Doença','Formação','Serviço oficial','Visita de estudo','Greve','Assistência à família','Conta férias (art. 102.º ECD)','Outro'];
const faltasDe=(t,a)=>((a||A()).faltasProf||[]).filter(f=>f.turma===t.id).sort((x,y)=>x.data.localeCompare(y.data));
const porDar=p=>Math.max(0,p.tempos-p.tDadas-p.tFaltas);
function faltaDlg(t,iso,id,depois){
  const a=A();a.faltasProf=a.faltasProf||[];const ex=id?a.faltasProf.find(f=>f.id===id):(iso?a.faltasProf.find(f=>f.turma===t.id&&f.data===iso):null);
  const oc=ocorrenciasTurma(t,a);iso=(ex&&ex.data)||iso||Object.keys(oc).filter(i=>i<=isoData(new Date())).pop()||isoData(new Date());
  const tpDia=d=>(oc[d]||{}).tempos||0;let motivo=ex?ex.motivo:'Doença';
  openDrawer(ex?'Falta do Professor':'Registar Falta do Professor',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('user',14)} ${esc(t.nome)} · ${esc(t.disciplina)} — a falta conta como aula não dada (não entra nas aulas dadas nem na soma Σ), e não como aula por dar.</p>
    <div class="g2"><div><label>Dia</label><input type="date" id="fa-data" value="${esc(iso)}"></div><div><label>Tempos em falta</label><input type="number" id="fa-t" min="1" max="12" value="${ex?ex.tempos:(tpDia(iso)||1)}" inputmode="numeric"></div></div>
    <p class="mut" id="fa-info" style="margin:6px 0 0"></p>
    <label style="margin-top:10px">Motivo</label><div class="nlcat">${MOTIVOS_F.map(m=>`<button type="button" data-fm="${esc(m)}" class="${m===motivo?'on':''}">${esc(m)}</button>`).join('')}</div>
    <label style="margin-top:10px">Observações</label><input id="fa-obs" value="${esc(ex&&ex.obs||'')}" placeholder="ex.: plano de aula entregue; reposição a combinar">
    <div class="row" style="margin-top:16px"><button class="btn pri" id="fa-ok">${ic('check',15)} Guardar Falta</button>${ex?`<button class="btn dng" id="fa-del">${ic('trash',15)} Apagar Falta</button>`:''}</div></div>`);
  const info=()=>{const d=$('#fa-data').value;const o=oc[d];$('#fa-info').innerHTML=o?`${esc(fmtIsoL(d))}: ${o.blocos.map(b=>fmtHM(b.ini)+'–'+fmtHM(b.fim)).join(', ')} · ${o.tempos} tempo${o.tempos>1?'s':''}`:`<span style="color:var(--warn)">${ic('alert',13)} Neste dia não há aula desta turma no horário.</span>`};info();
  $('#fa-data').onchange=()=>{info();const o=oc[$('#fa-data').value];if(o)$('#fa-t').value=o.tempos};
  $$('[data-fm]').forEach(b=>b.onclick=()=>{motivo=b.dataset.fm;$$('[data-fm]').forEach(x=>x.classList.toggle('on',x===b))});
  const fim=()=>{saveNow();closeDrawer();if(depois)depois();else go(VIEW)};
  $('#fa-ok').onclick=()=>{const d=$('#fa-data').value;if(!d)return alert('Indique o dia.');const f=ex||{id:uid(),turma:t.id};
    const dup=a.faltasProf.find(x=>x!==ex&&x.turma===t.id&&x.data===d);if(dup)a.faltasProf=a.faltasProf.filter(x=>x!==dup);
    Object.assign(f,{data:d,tempos:Math.max(1,+$('#fa-t').value||1),motivo,obs:$('#fa-obs').value.trim()});if(!ex)a.faltasProf.push(f);toast('Falta registada · '+fmtIsoL(d));fim()};
  const del=$('#fa-del');if(del)del.onclick=()=>{if(confirm('Apagar esta falta?')){a.faltasProf=a.faltasProf.filter(x=>x!==ex);fim()}};
}
const nomeTipo=tp=>(TIPOS_DIA[tp]||TIPOS_DIA.nao).n;
function vAulasPrevistas(a,c){
  const TT=turmasFiltradas(a);const U=UI.prevU||'tempos';const W=c.periodos.length===2?'Semestre':'Período';const hj=isoData(new Date());
  const L=TT.map(t=>({t,r:aulasPrevistas(t,a)}));const v=(o,k)=>U==='tempos'?o[k==='p'?'tempos':'tDadas']:o[k==='p'?'aulas':'dadas'];
  const cel=p=>{if(!p)return '<td class="num mut">—</td>';const ativo=hj>=p.ini&&hj<=p.fim;
    return `<td class="num"><b>${v(p,'p')}</b>${ativo?`<div class="sub">${v(p,'d')} dadas · faltam ${U==='tempos'?porDar(p):Math.max(0,p.aulas-p.dadas-p.faltas.length)}${p.tFaltas?' · '+(U==='tempos'?p.tFaltas:p.faltas.length)+' F':''}</div>`:hj>p.fim?'<div class="sub">concluído</div>':''}</td>`};
  const comR=L.filter(x=>x.r);
  return `<div class="card wide">
    <div class="row" style="margin-bottom:12px"><h2 style="margin:0">Aulas Previstas</h2><span class="sp1"></span>
      <div class="seg" id="pv-u"><button type="button" data-u="tempos" class="${U==='tempos'?'on':''}">Tempos</button><button type="button" data-u="aulas" class="${U==='aulas'?'on':''}">Aulas</button></div></div>
    <p class="hint" style="margin-top:0">Contagem a partir do horário de cada turma e do calendário escolar: só dias letivos, entre o início e o termo das aulas do ano de escolaridade da turma. ${U==='tempos'?'Um tempo = uma linha do horário (ex.: 45 min); uma aula de 90 min conta 2 tempos.':'Uma aula = tempos seguidos da mesma disciplina (ex.: um bloco de 90 min).'}</p>
    ${TT.length?`<div class="tblw"><table class="lst prev"><thead><tr><th>Turma</th><th class="num">Por Semana</th>${c.periodos.map(p=>`<th class="num">${p.n}.º ${W}</th>`).join('')}<th class="num">Total</th><th class="num">Dadas</th><th class="num">Faltas</th><th></th></tr></thead><tbody>
    ${gruposOferta(TT).map(g=>`${gruposOferta(TT).length>1?`<tr class="gr"><td colspan="${c.periodos.length+6}"><span class="dot" style="background:${OFERTAS[g.k].cor}"></span>${esc(g.nome)}</td></tr>`:''}
      ${g.L.map(t=>{const r=aulasPrevistas(t,a);
      return r?`<tr class="clk" data-pv="${t.id}"><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}</span>${ofertaTag(t)}</div></div></td><td class="num">${U==='tempos'?r.semana:r.aulasSemana}</td>
        ${c.periodos.map(cp=>cel(r.P.find(p=>p.n===cp.n))).join('')}<td class="num"><b>${v(r.tot,'p')}</b></td><td class="num">${v(r.tot,'d')}</td><td class="num ${r.tot.tFaltas?'neg':''}">${r.tot.tFaltas?(U==='tempos'?r.tot.tFaltas:r.tot.faltas):'—'}</td><td class="act"><span class="chev">${ic('back',16)}</span></td></tr>`
      :`<tr><td><div class="tnm">${anoBadge(t)}<div><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}</span>${ofertaTag(t)}</div></div></td><td colspan="${c.periodos.length+4}" class="mut">Sem horário ou sem aulas reconhecidas desta disciplina.</td><td class="act"><button class="btn sm" data-hor="${t.id}">Horário</button></td></tr>`}).join('')}`).join('')}
    </tbody>${comR.length>1?`<tfoot><tr><td><b>Total</b></td><td class="num">${comR.reduce((s,x)=>s+(U==='tempos'?x.r.semana:x.r.aulasSemana),0)}</td>${c.periodos.map(cp=>`<td class="num"><b>${comR.reduce((s,x)=>{const p=x.r.P.find(p=>p.n===cp.n);return s+(p?v(p,'p'):0)},0)}</b></td>`).join('')}<td class="num"><b>${comR.reduce((s,x)=>s+v(x.r.tot,'p'),0)}</b></td><td class="num">${comR.reduce((s,x)=>s+v(x.r.tot,'d'),0)}</td><td class="num">${comR.reduce((s,x)=>s+(U==='tempos'?x.r.tot.tFaltas:x.r.tot.faltas),0)||'—'}</td><td></td></tr></tfoot>`:''}</table></div>`
    :'<div class="empty">Sem turmas neste ano letivo.</div>'}
  </div>`;
}
function prevDetalheDlg(t){
  const a=A(),c=a.calendario,r=aulasPrevistas(t,a);if(!r)return;const W=c.periodos.length===2?'semestre':'período';const hj=isoData(new Date());
  openDrawer(t.nome+' · '+t.disciplina,`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('calendar',14)} Aulas de ${esc(fmtIsoL(r.ini))} a ${esc(fmtIsoL(r.fim))} · ${r.semana} tempos por semana (${r.aulasSemana} aula${r.aulasSemana>1?'s':''})</p>
    ${r.P.map(p=>`<div class="pvp pcor ${hj>=p.ini&&hj<=p.fim?'on':''}" style="--pc:var(--p${p.n})">
      <div class="row"><h3 style="margin:0">${p.n}.º ${W}</h3><span class="sp1"></span><span class="mut">${esc(fmtIso(p.ini))} a ${esc(fmtIso(p.fim))}</span></div>
      <div class="pvn"><div><b>${p.tempos}</b><span>tempos previstos</span></div><div><b>${p.tDadas}</b><span>tempos dados</span></div><div class="${p.tFaltas?'fal':''}"><b>${p.tFaltas}</b><span>faltas (tempos)</span></div><div><b>${porDar(p)}</b><span>tempos por dar</span></div></div>
      ${p.faltas.length?`<div class="pvl"><div class="mut" style="margin-bottom:4px">Faltas do professor:</div>${p.faltas.map(f=>`<button type="button" class="pvx fx" data-fx="${f.id}"><span class="sw" style="background:var(--bad)"></span><b>${esc(fmtIsoL(f.data))}</b><span>${esc(f.motivo)}${f.obs?' · '+esc(f.obs):''}</span><span class="mut">${f.ft} t.</span></button>`).join('')}</div>`:''}
      <div class="pvd">${Object.entries(p.porDia).map(([d,n])=>`<span class="chip">${DIAS[d]}: ${n} tempos</span>`).join('')}</div>
      ${p.perdidas.length?`<div class="pvl"><div class="mut" style="margin-bottom:4px">Dias de aula sem atividades letivas (${p.perdidas.reduce((s,x)=>s+x.tempos,0)} tempos):</div>${p.perdidas.map(x=>`<div class="pvx"><span class="sw" style="background:${(TIPOS_DIA[x.tipo]||{}).cor||'var(--panel)'}"></span><b>${esc(fmtIsoL(x.iso))}</b><span>${esc(x.nota||nomeTipo(x.tipo))}</span><span class="mut">${x.tempos} t.</span></div>`).join('')}</div>`:''}
    </div>`).join('')}
    <div class="row" style="margin-top:12px"><button class="btn pri" id="pv-f">${ic('plus',15)} Registar Falta</button><button class="btn" id="pv-h">${ic('calendar',15)} Ver Horário da Turma</button></div></div>`);
  $('#pv-h').onclick=()=>{S.turmaAtiva=t.id;save();go('horario')};
  $('#pv-f').onclick=()=>faltaDlg(t,null,null,()=>{go(VIEW);prevDetalheDlg(t)});
  $$('[data-fx]').forEach(b=>b.onclick=()=>faltaDlg(t,null,b.dataset.fx,()=>{go(VIEW);prevDetalheDlg(t)}));
}
function exportPrevistas(){
  const a=A(),c=a.calendario;const W=c.periodos.length===2?'Semestre':'Período';
  const linhas=[['Turma','Disciplina','Oferta','Tempos/semana',...c.periodos.flatMap(p=>[p.n+'.º '+W+' (tempos)',p.n+'.º '+W+' (aulas)']),'Total tempos','Total aulas','Tempos dados']];
  turmasFiltradas(a).forEach(t=>{const r=aulasPrevistas(t,a);if(!r)return;linhas.push([t.nome,t.disciplina,OFERTAS[ofertaDe(t)].nome,r.semana,...c.periodos.flatMap(cp=>{const p=r.P.find(p=>p.n===cp.n);return p?[p.tempos,p.aulas]:['','']}),r.tot.tempos,r.tot.aulas,r.tot.tDadas])});
  download('Aulas previstas '+a.nome+'.csv','﻿'+linhas.map(l=>l.map(x=>{x=String(x);return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x}).join(';')).join('\r\n'),'text/csv;charset=utf-8');
}
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

/* =====================================================================
   MARCAÇÃO DE TESTES — calendário anual da turma (dias de semana com os
   tempos letivos pré-preenchidos e a soma acumulada) + datas de avaliação
   A().datasAval = [{id,tipo:'intercalar'|'reuniao'|'outra',per,data,fim,titulo,turma:null|id}]
   ===================================================================== */
const TIPO_AB=tp=>{const n=normT(tp);return n.startsWith('teste')||n.startsWith('prova escrita')?'T':n.startsWith('prova oral')?'PO':n.startsWith('apresentacao oral')?'AO':n.startsWith('questao')?'Q':n.startsWith('ficha')?'F':n.startsWith('trabalho')?'Tr':n.startsWith('avaliacao diag')?'D':n.startsWith('momento')?'MA':(tp||'?').slice(0,2)};
const TIPO_COR=tp=>({MA:'#a61e4d',T:'#c0392b',AO:'#d98b00',PO:'#b85c00',Q:'#7a4fd0',F:'#2f7fd0',Tr:'#1a7f37',D:'#5b6b7f'})[TIPO_AB(tp)]||'#b0457b';
const ehTeste=i=>!!(i&&i.momento)||/teste|prova|momento de avalia/i.test(i&&i.tipo||'');
const AVAL_T={intercalar:{n:'Avaliação Intercalar',ab:'AI',cor:'#7a4fd0'},reuniao:{n:'Reunião de Avaliação',ab:'RA',cor:'#0f8b8d'},outra:{n:'Outra Data',ab:'•',cor:'#5b6b7f'},outrotest:{n:'Teste de outra disciplina',ab:'OD',cor:'#8e8e93'}};
/* ocorrências de aulas da turma ao longo do ano, com a soma acumulada (ano e período) */
const zoomCal=()=>UI.zoom||S.cfg.calZoom||1.6;
function bindZoom(re){$$('[data-zm]').forEach(b=>b.onclick=()=>{const z=zoomCal();UI.zoom=Math.max(.8,Math.min(1.6,Math.round((z+(b.dataset.zm==='+'?.2:-.2))*10)/10));S.cfg.calZoom=UI.zoom;save();re()})}
function ocorrenciasTurma(t,a){
  a=a||A();const c=a&&a.calendario;const B=blocos(aulasTurma(t,a));const out={};if(!c||!c.periodos.length)return out;
  const ini=inicioTurma(t,c),fim=termoTurma(t,c);let cumA=0,cumP=0,perAnt=null;const FT=faltasDe(t,a);
  const isos=Object.keys(c.dias).sort();
  isos.forEach(iso=>{if(iso<ini||(fim&&iso>fim))return;const p=c.periodos.find(p=>iso>=p.ini&&iso<=p.fim);if(!p)return;
    if(p.n!==perAnt){cumP=0;perAnt=p.n}
    const Bd=B.filter(b=>b.dia===dataDeIso(iso).getDay());if(!Bd.length||!letivoPara(t,iso))return;
    const tp=Bd.reduce((s,b)=>s+b.tempos,0);const f=FT.find(x=>x.data===iso);const ft=f?Math.min(tp,+f.tempos||tp):0;cumA+=tp-ft;cumP+=tp-ft;
    out[iso]={blocos:Bd,tempos:tp,aulas:Bd.length,falta:f||null,ft,cumA,cumP,per:p.n}});
  return out;
}
/* ---------- avaliação intercalar: global ao ano letivo ---------- */
function intercalarPeriodos(a){const c=a.calendario;const P=c?c.periodos.map(p=>p.n):periodos();const x=a.intercalar&&a.intercalar.periodos;return x?x.filter(n=>P.includes(n)):P}
function intercalarDe(a,per){return (a.datasAval||[]).find(d=>d.tipo==='intercalar'&&!d.turma&&d.per===per)}
function cartaoIntercalar(a,c){
  const P=c.periodos;const W=P.length===2?'Semestre':'Período';const at=intercalarPeriodos(a);const n=at.length;
  const opc=[[0,'Nenhuma'],...(P.length===3?[[2,'Dois Períodos'],[3,'Três Períodos']]:[[1,'Um Semestre'],[2,'Dois Semestres']])];
  return `<div class="card wide ed" id="ai-card"><div class="row" style="margin-bottom:10px;gap:10px"><h2 style="margin:0"><span class="mta" style="--pc:${AVAL_T.intercalar.cor};margin-right:8px">AI</span>Avaliação Intercalar</h2></div>
    <p class="hint" style="margin-top:0" id="ai-lbl">Vale para todas as turmas do ano letivo ${esc(a.nome)}. Toque nos ${W==='Período'?'períodos':'semestres'} em que há avaliação intercalar:</p>
    <div class="row aichips" role="group" aria-labelledby="ai-lbl" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">${P.map(p=>`<button type="button" class="chip ${at.includes(p.n)?'on':''}" aria-pressed="${at.includes(p.n)?'true':'false'}" data-aip="${p.n}">${at.includes(p.n)?ic('check',13)+' ':''}${p.n}.º ${W}</button>`).join('')}<button type="button" class="btn sm" data-ain="${n===P.length?0:P.length}">${n===P.length?'Nenhum':'Todos'}</button></div>
    ${n?`<div class="aigrid">${at.map(pn=>{const p=P.find(x=>x.n===pn);const d=intercalarDe(a,pn);return `<div class="aip"><b>${pn}.º ${W}</b><span class="mut">${esc(fmtIso(p.ini))} → ${esc(fmtIso(p.fim))}</span>
      <div class="g2"><div><label>De</label><input type="date" data-aid="${pn}" value="${d?d.data:''}" min="${p.ini}" max="${p.fim}"></div><div><label>Até</label><input type="date" data-aif="${pn}" value="${d&&d.fim?d.fim:''}" min="${p.ini}" max="${p.fim}"></div></div></div>`}).join('')}</div>`:'<p class="mut" style="margin:0">Sem avaliação intercalar neste ano letivo.</p>'}
  </div>`;
}
function bindIntercalar(a,rerender){
  a.datasAval=a.datasAval||[];const c=a.calendario;const P=c.periodos.map(p=>p.n);
  const re2=()=>manterPosicao(rerender);
  $$('[data-ain]').forEach(b=>b.onclick=()=>{const k=+b.dataset.ain;a.intercalar={periodos:k?P.slice():[]};save();re2()});
  $$('[data-aip]').forEach(b=>b.onclick=()=>{const n=+b.dataset.aip;const at=intercalarPeriodos(a);const nv=at.includes(n)?at.filter(x=>x!==n):[...at,n].sort((x,y)=>x-y);a.intercalar={periodos:nv};save();re2()});
  const set=(per,campo,val)=>{let d=intercalarDe(a,per);if(!d){if(!val)return;d={id:uid(),tipo:'intercalar',per,data:'',fim:'',turma:null};a.datasAval.push(d)}
    d[campo]=val;if(campo==='data'&&val&&(!d.fim||d.fim<val))d.fim=d.fim&&d.fim>=val?d.fim:'';if(!d.data)a.datasAval=a.datasAval.filter(x=>x!==d);save();rerender()};
  $$('[data-aid]').forEach(el=>el.onchange=()=>set(+el.dataset.aid,'data',el.value));
  $$('[data-aif]').forEach(el=>el.onchange=()=>set(+el.dataset.aif,'fim',el.value));
}
function datasAvalDe(a,t){const at=intercalarPeriodos(a);return (a.datasAval||[]).filter(d=>(d.tipo!=='intercalar'||at.includes(d.per))&&(!d.turma||(t&&d.turma===t.id)))}
function nomeAval(d){return d.tipo==='outra'?(d.titulo||'Outra data'):d.tipo==='outrotest'?'Teste de '+(d.titulo||'outra disciplina'):AVAL_T[d.tipo].n+(d.hora?' · '+d.hora:'')+(d.local?' · '+d.local:'')}
/* ---------- vista ---------- */
function vTestes(){
  const t=T(),a=A();const c=a.calendario;
  barBtns([{id:'b-mt',t:ic('plus',15)+' Marcar Avaliação',f:()=>marcarDlg(t,null)},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  if(!c){$('#view').innerHTML=`<div class="card empty">${ic('calendar',30)}<br>Para marcar os testes no calendário do ano, importe primeiro o <b>calendário escolar</b>.<br><br><button class="btn pri" data-go="calendario">Abrir Calendário Escolar</button></div>`;$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));return}
  const oc=ocorrenciasTurma(t,a);const hj=isoData(new Date());const W=c.periodos.length===2?'Semestre':'Período';
  const insts=t.instrumentos.filter(i=>i.data).slice().sort((x,y)=>x.data.localeCompare(y.data));
  const porDia={};insts.forEach(i=>(porDia[i.data]=porDia[i.data]||[]).push(i));
  const mzDia={};matrizes(a,[t]).forEach(x=>(mzDia[x.data]=mzDia[x.data]||[]).push(x));
  const DA=datasAvalDe(a,t);const daDia={};DA.forEach(d=>{if(!d.data)return;for(let x=dataDeIso(d.data);isoData(x)<=(d.fim||d.data);x.setDate(x.getDate()+1))(daDia[isoData(x)]=daDia[isoData(x)]||[]).push(d)});
  const semHor=!Object.keys(oc).length;
  const prox=insts.find(i=>i.data>=hj);const ocH=Object.entries(oc).filter(([i])=>i<=hj).pop();
  const UIp=UI.mtPer||'ano';
  const meses=[...new Set(Object.keys(c.dias).map(i=>i.slice(0,7)))].sort().filter(ym=>{if(UIp==='ano')return true;const p=c.periodos.find(p=>p.n===+UIp);return p&&ym>=p.ini.slice(0,7)&&ym<=p.fim.slice(0,7)});
  const mes=ym=>{const [y,m]=ym.split('-').map(Number);const nd=new Date(y,m,0).getDate();let cells='';let first=true;
    for(let d=1;d<=nd;d++){const dt=new Date(y,m-1,d);const dw=dt.getDay();if(dw===0||dw===6)continue;const iso=isoD(y,m,d);
      if(first){for(let k=1;k<dw;k++)cells+='<span class="mtc vz"></span>';first=false}
      const tp=c.dias[iso]||'nao';const o=oc[iso];const I=porDia[iso]||[];const D=daDia[iso]||[];
      const per=UIp==='ano'?null:+UIp;const fora=per&&!(c.periodos.find(p=>p.n===per&&iso>=p.ini&&iso<=p.fim));
      const nl=!LETIVOS.includes(tp);const T_=TIPOS_DIA[tp]||TIPOS_DIA.nao;
      cells+=`<button type="button" class="mtc ${o?'aula':''} ${o&&o.falta?'falta':''} ${nl?'nl t-'+tp:''} ${iso===hj?'hj':''} ${iso<hj?'pas':''} ${fora?'fora':''}" data-mt="${iso}" style="${nl&&T_.cor?'--tc:'+T_.cor:''}">
        <span class="mtd">${d}${o?`<span class="mts" title="Soma de tempos até este dia">Σ${UI.mtSoma==='per'?o.cumP:o.cumA}</span>`:''}</span>
        ${o?`<span class="mth">${o.blocos.map(b=>fmtHM(b.ini)).join(' · ')}<em>${o.tempos}t</em></span>${o.falta?`<span class="mtf" title="Falta do professor: ${esc(o.falta.motivo)}">F${o.ft<o.tempos?' '+o.ft+'t':''}</span>`:''}`:nl&&tp!=='nao'?`<span class="mtn">${esc(((c.notas||{})[iso])||T_.n.split(' ')[0])}</span>`:''}
        ${I.map(i=>`<span class="mtp" data-ins="${i.id}" style="--pc:${TIPO_COR(i.tipo)}">${esc(TIPO_AB(i.tipo))}${esc((i.nome.match(/\d+/)||[''])[0])}</span>`).join('')}
        ${(mzDia[iso]||[]).map(x=>`<span class="mtz ${x.enviada?'ok':''}" title="Envio da matriz: ${esc(x.i.nome)} (teste a ${esc(fmtIsoL(x.i.data))})${x.enviada?' — enviada':''}">${x.enviada?'✓':''}MZ</span>`).join('')}
        ${D.map(x=>`<span class="mta ${x.tipo==='outrotest'?'od':''}" style="--pc:${AVAL_T[x.tipo].cor}" title="${esc(nomeAval(x))}">${esc(x.tipo==='outra'||x.tipo==='outrotest'?(x.titulo||'•').slice(0,8):AVAL_T[x.tipo].ab)}</span>`).join('')}
      </button>`}
    return `<div class="mtm"><div class="mth2">${MESES[m]} <span class="mut">${y}</span></div><div class="mtg">${['Seg','Ter','Qua','Qui','Sex'].map(x=>`<span class="mtw">${x}</span>`).join('')}${cells}</div></div>`};
  $('#view').innerHTML=`
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('target',14)} Próximo Teste</div><div class="v" style="font-size:19px">${prox?esc(fmtIsoL(prox.data)):'—'}</div><div class="mut">${prox?esc(prox.nome)+' · '+contagem(prox.data):'Nenhum marcado'}</div></div>
    <div class="kpi"><div class="l">${ic('clipboard',14)} Avaliações Marcadas</div><div class="v">${insts.length}</div><div class="mut">${c.periodos.map(p=>p.n+'.º '+insts.filter(i=>+i.periodo===p.n).length).join(' · ')}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Tempos Dados</div><div class="v">${ocH?ocH[1].cumA:0}</div><div class="mut">${ocH?'no '+ocH[1].per+'.º '+W.toLowerCase()+': '+ocH[1].cumP:'—'}</div></div>
    <div class="kpi"><div class="l">${ic('calcheck',14)} Aulas até ao Teste</div><div class="v">${prox?Object.keys(oc).filter(i=>i>=hj&&i<prox.data).length:'—'}</div><div class="mut">${prox?Object.entries(oc).filter(([i])=>i>=hj&&i<prox.data).reduce((s,[,o])=>s+o.tempos,0)+' tempos antes do teste':''}</div></div>
  </div>
  <div class="mtlay">
    <div class="card wide mtmain">
      <div class="row" style="margin-bottom:10px;gap:10px"><h2 style="margin:0">Calendário de Avaliações</h2><span class="sp1"></span>
        <div class="seg" id="mt-per"><button type="button" data-mp="ano" class="${UIp==='ano'?'on':''}">Ano</button>${c.periodos.map(p=>`<button type="button" data-mp="${p.n}" class="${UIp==String(p.n)?'on':''}">${p.n}.º ${W==='Período'?'P':'S'}</button>`).join('')}</div>
        <div class="seg zoomseg" aria-label="Zoom"><button type="button" data-zm="-">−</button><button type="button" data-zm="+">+</button></div>
        <div class="seg" id="mt-soma"><button type="button" data-ms="ano" class="${UI.mtSoma!=='per'?'on':''}">Σ Ano</button><button type="button" data-ms="per" class="${UI.mtSoma==='per'?'on':''}">Σ ${W}</button></div></div>
      ${semHor?`<div class="alert w">${ic('alert',15)} Esta turma ainda não tem aulas no horário: importe o horário da turma ou o seu horário (PDF) para ver os tempos letivos em cada dia.</div>`:''}
      <p class="hint" style="margin-top:0">Dias de semana com as suas aulas (hora de início e tempos) e <b>Σ</b> = soma dos tempos dados até esse dia, incluindo-o. Toque num dia para marcar um teste ou outra avaliação; arraste uma marcação para outro dia.</p>
      <div class="mtmeses" style="--cz:${zoomCal()}">${meses.map(mes).join('')}</div>
      <div class="mtleg">${['Teste de Avaliação','Questão-aula','Ficha de Trabalho','Apresentação Oral','Trabalho'].map(x=>`<span><span class="mtp" style="--pc:${TIPO_COR(x)}">${TIPO_AB(x)}</span>${x}</span>`).join('')}<span><span class="mta" style="--pc:${AVAL_T.intercalar.cor}">AI</span>Avaliação Intercalar</span><span><span class="mta" style="--pc:${AVAL_T.reuniao.cor}">RA</span>Reunião de Avaliação</span><span><span class="mtf">F</span>Falta do professor</span></div>
    </div>
    <div class="mtside">${c.periodos.map(p=>painelPeriodo(t,a,p,oc,insts,DA,W)).join('')}</div>
  </div>`;
  $$('[data-mp]').forEach(b=>b.onclick=()=>{UI.mtPer=b.dataset.mp;vTestes()});
  $$('[data-ms]').forEach(b=>b.onclick=()=>{UI.mtSoma=b.dataset.ms;vTestes()});
  bindZoom(vTestes);
  $$('[data-mt]').forEach(b=>b.onclick=e=>{if(b._arr){b._arr=false;return}const ins=e.target.closest('[data-ins]');marcarDlg(t,b.dataset.mt,ins?ins.dataset.ins:null)});
  $$('[data-insx]').forEach(b=>b.onclick=()=>{const i=t.instrumentos.find(x=>x.id===b.dataset.insx);marcarDlg(t,i.data,i.id)});
  bindPainelAval(t,a);
  $$('[data-go-cal]').forEach(b=>b.onclick=e=>{e.preventDefault();UI.calTab='cal';go('calendario');setTimeout(()=>{const k=$('#ai-card');if(k)k.scrollIntoView({block:'start'})},50)});
  arrastarMarcacoes(t);
}
const contagem=iso=>{const d=Math.round((dataDeIso(iso)-dataDeIso(isoData(new Date())))/864e5);return d===0?'hoje':d===1?'amanhã':d<0?'há '+(-d)+' dias':'daqui a '+d+' dias'};
function painelPeriodo(t,a,p,oc,insts,DA,W){
  const L=insts.filter(i=>i.data>=p.ini&&i.data<=p.fim);const tot=Object.values(oc).filter(o=>o.per===p.n);const hj=isoData(new Date());
  const tempos=tot.reduce((s,o)=>s+o.tempos,0);
  const linha=(tipo)=>{const d=DA.find(d=>d.tipo===tipo&&d.per===p.n);return `<div class="avr"><span class="mta" style="--pc:${AVAL_T[tipo].cor}">${AVAL_T[tipo].ab}</span><label>${AVAL_T[tipo].n}</label>
    <input type="date" aria-label="${esc(AVAL_T[tipo].n)} — ${p.n}.º" data-av="${tipo}" data-per="${p.n}" value="${d?d.data:''}" min="${p.ini}" max="${isoData(new Date(dataDeIso(p.fim).getTime()+21*864e5))}">${tipo==='intercalar'?`<input type="date" data-avf="${tipo}" data-per="${p.n}" value="${d&&d.fim?d.fim:''}" title="Até (opcional)" class="fimd">`:''}
    ${tipo==='reuniao'&&d?`<div class="avhl"><input type="time" data-avh="${p.n}" value="${esc(d.hora||'')}" aria-label="Hora"><input data-avl="${p.n}" value="${esc(d.local||'')}" placeholder="Local (ex.: sala 1.05)"></div>`:''}
    <span class="mut avs">${tipo==='intercalar'?'todas as turmas':'esta turma'}</span></div>`};
  let ant=null;
  return `<div class="card mtp-card pcor ${hj>=p.ini&&hj<=p.fim?'on':''}" style="--pc:var(--p${p.n})">
    <div class="row"><h3 style="margin:0">${p.n}.º ${W}</h3><span class="sp1"></span><span class="mut">${esc(fmtIso(p.ini))} → ${esc(fmtIso(p.fim))}</span></div>
    <div class="mut" style="margin:2px 0 10px">${tot.length} aulas · ${tempos} tempos previstos</div>
    <div class="mtlist">${L.length?L.map(i=>{const o=Object.entries(oc).filter(([d])=>d<=i.data).pop();const cum=o?o[1].cumP:0;const desde=ant!=null?cum-ant:null;ant=cum;
      return `<button class="mti ${i.data<hj?'pas':''}" data-insx="${i.id}"><span class="mtp" style="--pc:${TIPO_COR(i.tipo)}">${esc(TIPO_AB(i.tipo))}</span><span class="mtin"><b>${esc(i.nome)}</b><span class="mut">${esc(fmtIsoL(i.data))} · ${i.data<hj?'realizado':contagem(i.data)}</span></span><span class="mtic"><b>Σ${cum}</b><span class="mut">${desde!=null?'+'+desde+' desde o anterior':'tempos dados'}</span></span></button>`}).join('')
      :'<p class="mut" style="margin:0 0 6px">Sem avaliações marcadas.</p>'}</div>
    <div class="avbox">${(()=>{if(!intercalarPeriodos(a).includes(p.n))return `<div class="avr ro"><span class="mta" style="--pc:${AVAL_T.intercalar.cor}">AI</span><span class="mut">Sem avaliação intercalar</span></div>`;const d=intercalarDe(a,p.n);
      return `<div class="avr ro"><span class="mta" style="--pc:${AVAL_T.intercalar.cor}">AI</span><span><b>Avaliação Intercalar</b><br><span class="mut">${d?esc(fmtIsoL(d.data))+(d.fim&&d.fim!==d.data?' a '+esc(fmtIsoL(d.fim)):''):'data por definir'} · todas as turmas</span></span><a href="#" class="lnk" data-go-cal>${d?'Alterar':'Definir'}</a></div>`})()}${linha('reuniao')}
      ${DA.filter(d=>d.tipo==='outra'&&d.per===p.n).map(d=>`<div class="avr"><span class="mta" style="--pc:${AVAL_T.outra.cor}">•</span><input class="avt" data-avt="${d.id}" value="${esc(d.titulo||'')}" placeholder="Descrição"><input type="date" data-avd="${d.id}" value="${d.data||''}"><button class="btn sm ico dng" data-avx="${d.id}" aria-label="Apagar">${ic('trash',14)}</button></div>`).join('')}
      <button class="btn sm" data-avn="${p.n}">${ic('plus',14)} Outra Data</button></div>
  </div>`;
}
function bindPainelAval(t,a){
  a.datasAval=a.datasAval||[];
  const set=(tipo,per,campo,val)=>{let d=a.datasAval.find(d=>d.tipo===tipo&&d.per===per&&(tipo==='intercalar'?!d.turma:d.turma===t.id));
    if(!d){if(!val)return;d={id:uid(),tipo,per,data:'',fim:'',turma:tipo==='intercalar'?null:t.id};a.datasAval.push(d)}
    d[campo]=val;if(!d.data)a.datasAval=a.datasAval.filter(x=>x!==d);save();vTestes()};
  $$('[data-av]').forEach(el=>el.onchange=()=>set(el.dataset.av,+el.dataset.per,'data',el.value));
  $$('[data-avf]').forEach(el=>el.onchange=()=>set(el.dataset.avf,+el.dataset.per,'fim',el.value));
  $$('[data-avh]').forEach(el=>el.onchange=()=>set('reuniao',+el.dataset.avh,'hora',el.value));$$('[data-avl]').forEach(el=>el.onchange=()=>set('reuniao',+el.dataset.avl,'local',el.value.trim()));
  $$('[data-avn]').forEach(b=>b.onclick=()=>{const p=CAL().periodos.find(p=>p.n===+b.dataset.avn);a.datasAval.push({id:uid(),tipo:'outra',per:p.n,data:'',titulo:'',turma:t.id});save();vTestes();const el=$$('[data-avt]').pop();if(el)el.focus()});
  $$('[data-avt]').forEach(el=>el.onchange=()=>{const d=a.datasAval.find(x=>x.id===el.dataset.avt);d.titulo=el.value.trim();save()});
  $$('[data-avd]').forEach(el=>el.onchange=()=>{const d=a.datasAval.find(x=>x.id===el.dataset.avd);d.data=el.value;const p=periodoDe(el.value);if(p)d.per=p;save();vTestes()});
  $$('[data-avx]').forEach(b=>b.onclick=()=>{a.datasAval=a.datasAval.filter(x=>x.id!==b.dataset.avx);save();vTestes()});
}
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
    ${!ex?(()=>{const par=a.turmas.filter(x=>x!==t&&x.disciplina===t.disciplina&&x.anoEsc===t.anoEsc);return par.length?`<div class="mtpar"><b style="font-size:13.5px">Marcar também nas turmas paralelas</b>${par.map(x=>`<label class="chk"><input type="checkbox" data-par="${x.id}"> ${anoBadge(x,'sm')} ${esc(x.nome)} <span class="mut">(na aula mais próxima a partir deste dia)</span></label>`).join('')}</div>`:''})():''}
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
/* ---------- Início: contagem decrescente para o fim do período ---------- */
function fimPeriodoAlvo(a){const c=a&&a.calendario;if(!c||!c.periodos.length)return null;const hj=isoData(new Date());
  const p=c.periodos.find(p=>hj>=p.ini&&hj<=p.fim)||c.periodos.find(p=>hj<p.ini);if(!p)return null;
  // hora de fim: fim da última aula desse dia (no seu horário), senão 17:00
  let fimMin=0;const dow=dataDeIso(p.fim).getDay();
  (a.turmas||[]).forEach(t=>aulasTurma(t,a).forEach(x=>{if(x.dia===dow&&x.fim>fimMin)fimMin=x.fim}));((a.horProf||{}).aulas||[]).forEach(x=>{if(x.dia===dow&&x.fim>fimMin)fimMin=x.fim});
  if(!fimMin)fimMin=17*60;const d=dataDeIso(p.fim);d.setHours(Math.floor(fimMin/60),fimMin%60,0,0);return {p,alvo:d,antes:hj<p.ini}}
/* ===================== REUNIÕES: mapa, gestão, lembretes e avisos ===================== */
const REUN_T={ct:{n:'Conselho de Turma',ab:'CT',cor:'#0f8b8d'},avl:{n:'Reunião de Avaliação',ab:'RA',cor:'#0b6e70'},dep:{n:'Departamento',ab:'DP',cor:'#7a4fd0'},grupo:{n:'Grupo Disciplinar',ab:'GD',cor:'#2f7fd0'},
  ped:{n:'Conselho Pedagógico',ab:'CP',cor:'#c0392b'},dt:{n:'Diretores de Turma',ab:'DT',cor:'#d35400'},ee:{n:'Encarregados de Educação',ab:'EE',cor:'#e07a00'},geral:{n:'Reunião Geral',ab:'RG',cor:'#5b6b7f'},
  equipa:{n:'Equipa / Projeto',ab:'EQ',cor:'#b8860b'},form:{n:'Formação',ab:'FO',cor:'#1a7f37'},outra:{n:'Outra',ab:'•',cor:'#8e8e93'}};
const REUN_EST={agendada:{n:'Agendada',cor:'#2f7fd0'},realizada:{n:'Realizada',cor:'#1a7f37'},adiada:{n:'Adiada',cor:'#e07a00'},cancelada:{n:'Cancelada',cor:'#8e8e93'}};
const REUN_LEMB=[[15,'15 min'],[60,'1 hora'],[180,'3 horas'],[1440,'1 dia'],[2880,'2 dias'],[10080,'1 semana']];
const reunioes=a=>(a&&(a.reunioes=a.reunioes||[]))||[];
const reunInicio=r=>{const d=dataDeIso(r.data);d.setHours(Math.floor((r.ini||0)/60),(r.ini||0)%60,0,0);return d};
const reunFim=r=>{const d=dataDeIso(r.data);const f=r.fim!=null?r.fim:(r.ini||0)+60;d.setHours(Math.floor(f/60),f%60,0,0);return d};
const reunTipo=r=>REUN_T[r.tipo]||REUN_T.outra;
const reunTurmas=(r,a)=>[...new Set([...(r.turmas||[]),...(r.turma?[r.turma]:[])])].map(id=>a.turmas.find(t=>t.id===id)).filter(Boolean);
const reunTurma=(r,a)=>reunTurmas(r,a)[0]||null;
const reunTurmasTxt=(r,a)=>[...new Set(reunTurmas(r,a).map(t=>t.nome))].join(', ');
const reunAtiva=r=>r.estado==='agendada'||r.estado==='adiada';
const pendAta=r=>r.estado==='realizada'&&!(r.notas||'').trim();
const reunTitulo=(r,a)=>r.titulo||(reunTipo(r).n+((x=>x?' · '+x:'')(reunTurmasTxt(r,a))));
const durTxt=m=>m>=60?(Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'')):m+' min';
function quandoTxt(r){const ms=reunInicio(r)-Date.now();if(ms<0&&reunFim(r)>Date.now())return 'a decorrer';if(ms<0)return contagem(r.data);
  const m=Math.round(ms/6e4);if(m<60)return 'daqui a '+m+' min';if(m<24*60&&r.data===isoData(new Date()))return 'daqui a '+durTxt(Math.round(m/5)*5);return contagem(r.data)}
/* datas de reunião vindas da Marcação de Testes (reuniões de avaliação) — mostradas no mapa */
function reunDeAval(a){return (a.datasAval||[]).filter(d=>d.tipo==='reuniao'&&d.data).map(d=>{const t=d.turma?a.turmas.find(x=>x.id===d.turma):null;const ini=hm(d.hora||'')??null;
  return {id:'av:'+d.id,ext:true,tipo:'avl',titulo:'Reunião de Avaliação'+(d.per?' · '+d.per+'.º '+(a.org==='semestre'?'semestre':'período'):'')+(t?' · '+t.nome:''),data:d.data,ini:ini??0,fim:ini!=null?ini+90:null,semHora:ini==null,local:d.local||'',turma:d.turma||null,estado:d.data<isoData(new Date())?'realizada':'agendada',lembretes:[1440],ordem:[],prep:[],decisoes:[]}})}
function todasReunioes(a){if(!a)return [];return reunioes(a).concat(reunDeAval(a)).sort((x,y)=>x.data.localeCompare(y.data)||(x.ini||0)-(y.ini||0))}
/* ocupação do professor num dia (aulas + tempos não letivos + outras reuniões) */
function ocupacaoDia(a,iso,excluirId){const dow=dataDeIso(iso).getDay();const L=[];const c=a.calendario;const letivo=!c||!c.dias||['letivo','inicio','inicio2'].includes(c.dias[iso]);
  if(letivo){(a.turmas||[]).forEach(t=>aulasTurma(t,a).forEach(x=>{if(x.dia===dow)L.push({ini:x.ini,fim:x.fim,lbl:'Aula '+t.nome+' · '+t.disciplina,k:'aula'})}));
    ((a.horProf||{}).aulas||[]).filter(x=>x.dia===dow&&!(a.horProf.mapa||{})[chaveAula(x)]).forEach(x=>L.push({ini:x.ini,fim:x.fim,lbl:'Aula '+x.turma+' · '+x.sig,k:'aula'}));
    (a.naoLetivos||[]).filter(n=>n.dia===dow&&nlAtivoHoje(n,iso)).forEach(n=>L.push({ini:n.ini,fim:n.fim,lbl:(n.nome||n.sig),k:'nl'}))}
  todasReunioes(a).filter(r=>r.data===iso&&r.id!==excluirId&&reunAtiva(r)&&!r.semHora).forEach(r=>L.push({ini:r.ini,fim:r.fim!=null?r.fim:r.ini+60,lbl:reunTitulo(r,a),k:'reun'}));
  const seen=new Set();return L.filter(x=>{const k=x.ini+'|'+x.lbl;if(seen.has(k))return false;seen.add(k);return true})}
function conflitosReuniao(a,r){if(!r.data||r.ini==null||r.semHora)return [];const f=r.fim!=null?r.fim:r.ini+60;const M={};
  ocupacaoDia(a,r.data,r.id).filter(x=>x.ini<f&&x.fim>r.ini).sort((x,y)=>x.ini-y.ini).forEach(x=>{const m=M[x.lbl];if(m){m.ini=Math.min(m.ini,x.ini);m.fim=Math.max(m.fim,x.fim)}else M[x.lbl]={...x}});return Object.values(M)}
/* avisos do mapa de reuniões */
function avisosReunioes(a){const L=[];if(!a)return L;const agora=Date.now(),hj=isoData(new Date());const am=isoData(new Date(Date.now()+864e5));
  const serieVista=new Map();
  reunioes(a).forEach(r=>{const nm=esc(reunTitulo(r,a));
    if(reunAtiva(r)&&r.data>=hj){const c=conflitosReuniao(a,r);let rep=false;if(c.length&&r.serie){if(serieVista.has(r.serie)){serieVista.get(r.serie).n++;rep=true}else serieVista.set(r.serie,{n:0,i:L.length})}if(c.length&&!rep)L.push({g:'erro',r,t:`<b>${nm}</b> (${esc(fmtIsoL(r.data))}, ${fmtHM(r.ini)}) sobrepõe-se a ${c.map(x=>esc(x.lbl)).slice(0,2).join(' e ')}${c.length>2?'…':''}.`})}
    if(reunAtiva(r)&&(r.data===hj||r.data===am)){const f=(r.prep||[]).filter(p=>!p.ok).length;if(f)L.push({g:'aviso',r,t:`<b>${nm}</b> é ${r.data===hj?'hoje':'amanhã'} e faltam <b>${f}</b> ${f===1?'tarefa':'tarefas'} de preparação.`})}
    if(r.estado==='agendada'&&reunFim(r)<agora&&r.data>=isoData(new Date(Date.now()-30*864e5)))L.push({g:'aviso',r,t:`<b>${nm}</b> (${esc(fmtIsoL(r.data))}) já passou — marque como realizada e registe a ata.`,acao:'realizada'});
    if(pendAta(r)&&r.data>=isoData(new Date(Date.now()-60*864e5)))L.push({g:'info',r,t:`<b>${nm}</b> foi realizada mas ainda não tem notas / ata.`});
    (r.decisoes||[]).forEach(d=>{if(!d.ok&&d.prazo&&d.prazo<hj)L.push({g:'erro',r,t:`Tarefa em atraso: <b>${esc(d.t)}</b>${d.resp?' ('+esc(d.resp)+')':''} — prazo ${esc(fmtIsoL(d.prazo))} · ${nm}.`})})});
  serieVista.forEach(v=>{if(v.n)L[v.i].t=L[v.i].t.replace(/\.$/,'')+` <span class="mut">(e mais ${v.n} ${v.n===1?'reunião':'reuniões'} desta série)</span>.`});
  return L}
/* ---------- lembretes (enquanto a app está aberta) + notificações do sistema ---------- */
let _reunTimer=null;
function verificarLembretes(silencioso){const a=A();if(!a)return;const agora=Date.now();let mud=false;
  reunioes(a).filter(reunAtiva).forEach(r=>{const ini=reunInicio(r).getTime();if(ini+5*6e4<agora)return;r.avisados=r.avisados||{};
    const lst=[...(r.lembretes||[]),0];lst.forEach(L=>{const k=String(L);if(r.avisados[k])return;if(agora>=ini-L*6e4){r.avisados[k]=1;mud=true;
      // só o lembrete mais próximo do início é mostrado quando vários já passaram
      const outros=lst.filter(x=>x<L&&agora>=ini-x*6e4);if(outros.length)return;
      const msg=(L===0?'A começar: ':'Lembrete: ')+reunTitulo(r,a)+' · '+(r.data===isoData(new Date())?'hoje':fmtIsoL(r.data))+' às '+fmtHM(r.ini)+(r.local?' · '+r.local:'');
      if(!silencioso)avisoReuniao(msg,r)}})});
  if(mud)save()}
function avisoReuniao(msg,r){toast(msg,'ok');try{if('Notification' in window&&Notification.permission==='granted')window.__ntNotif('EduSpruce — Reunião',{body:msg,tag:'eg-'+r.id})}catch(_){}
  try{const c=new (window.AudioContext||window.webkitAudioContext)();const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.08,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.55)}catch(_){}
  const b=document.getElementById('reunBan');if(b)b.remove();const d=document.createElement('div');d.id='reunBan';d.className='reunban';d.setAttribute('role','alert');
  d.innerHTML=`<span class="rbi">${ic('bell',18)}</span><span class="rbt">${esc(msg)}</span><button class="btn sm" data-rb="ver">Ver</button><button class="btn sm ico" data-rb="x" aria-label="Fechar">${ic('x',14)}</button>`;document.body.appendChild(d);
  d.onclick=e=>{const k=(e.target.closest('[data-rb]')||{}).dataset;if(!k)return;if(k.rb==='ver'){UI.reTab='prox';go('reunioes');setTimeout(()=>reuniaoVer(r.id),60)}d.remove()};setTimeout(()=>d.remove&&d.remove(),60000)}
function iniciarLembretes(){clearInterval(_reunTimer);verificarLembretes(false);_reunTimer=setInterval(()=>verificarLembretes(false),30000)}
async function pedirNotificacoes(){if(!('Notification' in window))return alert('Este navegador não permite notificações a partir de um ficheiro local.\n\nPara receber lembretes mesmo com a app fechada, use “Exportar para o Calendário (.ics)”: as reuniões entram no Calendário do iPad/computador com os alarmes definidos.');
  const p=await Notification.requestPermission();toast(p==='granted'?'Notificações ativadas':'As notificações não foram autorizadas',p==='granted'?'ok':'erro');if(VIEW==='reunioes')vReunioes()}
/* ---------- exportar para calendário (.ics, com alarmes) ---------- */
function icsData(d){const p=n=>String(n).padStart(2,'0');return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'T'+p(d.getHours())+p(d.getMinutes())+'00'}
const icsEsc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
function exportarICS(lista,nome){const a=A();const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//Reunioes//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  lista.forEach(r=>{const t=reunTitulo(r,a);const desc=[(r.ordem||[]).length?'Ordem de trabalhos:\n'+r.ordem.map((o,i)=>(i+1)+'. '+o.t).join('\n'):'',(r.prep||[]).length?'Preparar:\n'+r.prep.map(p=>'- '+p.t).join('\n'):'',r.participantes?'Participantes: '+r.participantes:'',r.link?'Ligação: '+r.link:''].filter(Boolean).join('\n\n');
    L.push('BEGIN:VEVENT','UID:'+r.id+'@edugest','DTSTAMP:'+icsData(new Date()),'DTSTART:'+icsData(reunInicio(r)),'DTEND:'+icsData(reunFim(r)),'SUMMARY:'+icsEsc(t));
    if(r.local)L.push('LOCATION:'+icsEsc(r.local));if(desc)L.push('DESCRIPTION:'+icsEsc(desc));if(r.link)L.push('URL:'+r.link);if(r.estado==='cancelada')L.push('STATUS:CANCELLED');
    (r.lembretes||[]).forEach(m=>L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(t),'TRIGGER:-PT'+m+'M','END:VALARM'));L.push('END:VEVENT')});
  L.push('END:VCALENDAR');download((nome||'Reuniões')+'.ics',L.join('\r\n'),'text/calendar');toast(lista.length+(lista.length===1?' reunião exportada':' reuniões exportadas')+' — abra o ficheiro para as adicionar ao Calendário','ok')}
/* ---------- ata ---------- */
function ataHTML(r){const a=A();const t=reunTurma(r,a);const c={...S.cfg,...escolaDe(t)};
  return `<html><head><meta charset="utf-8"><title>Ata</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;max-width:720px;margin:24px auto}h1{font-size:15pt;text-align:center;margin:4px 0 2px}h2{font-size:12pt;margin:16px 0 4px}.c{text-align:center;color:#444}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4px 6px;text-align:left;font-size:10pt}</style></head><body>
  ${c.logo?`<p class="c"><img src="${c.logo}" style="height:60px"></p>`:''}<p class="c"><b>${esc(c.escola||'')}</b>${c.agrupamento?'<br>'+esc(c.agrupamento):''}</p>
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
  const TS=a.turmas.slice().sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
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
      if(rep&&ate){r.serie=r.id;let d=dataDeIso(r.data);for(let k=0;k<60;k++){if(rep==='m')d=new Date(d.getFullYear(),d.getMonth()+1,d.getDate());else d=new Date(d.getTime()+(+rep)*864e5);const iso=isoData(d);if(iso>ate)break;
        L.push({...JSON.parse(JSON.stringify(r)),id:uid()+k,data:iso,serie:r.id,avisados:{}});n++}}
      if(n>1)toast(n+' reuniões agendadas','ok')}
    saveNow();closeDrawer();if(ed||!(n>1))toast(ed?'Reunião guardada':'Reunião agendada para '+fmtIsoL(r.data)+' às '+fmtHM(r.ini),'ok');verificarLembretes(true);go(VIEW==='reunioes'?'reunioes':VIEW)};
  if(ed){$('#r-dup').onclick=()=>{ler();closeDrawer();const c=JSON.parse(JSON.stringify(r));delete c.id;delete c.serie;c.estado='agendada';c.notas='';c.decisoes=[];c.avisados={};(c.prep||[]).forEach(p=>p.ok=false);(c.ordem||[]).forEach(o=>o.feito=false);setTimeout(()=>reuniaoDlg(null,c),60)};
    $('#r-del').onclick=()=>{const serie=ed.serie&&L.filter(x=>x.serie===ed.serie&&x.data>=ed.data).length>1;
      const todas=serie&&confirm('Esta reunião faz parte de uma série. Apagar também as seguintes da série?\n\nOK = esta e as seguintes · Cancelar = só esta');
      if(!serie&&!confirm('Apagar a reunião “'+reunTitulo(ed,a)+'”?'))return;
      a.reunioes=L.filter(x=>!(x===ed||(todas&&x.serie===ed.serie&&x.data>=ed.data)));S.lixo=S.lixo||[];S.lixo.unshift({id:uid(),tipo:'reuniao',obj:ed,ctx:{ano:a.id},quando:Date.now()});saveNow();closeDrawer();toast('Reunião apagada');go(VIEW)}}}
