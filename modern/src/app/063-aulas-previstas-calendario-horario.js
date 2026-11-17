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
