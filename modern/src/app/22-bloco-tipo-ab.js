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
      cells+=`<button type="button" class="mtc ${o?'aula':''} ${o&&o.falta?'falta':''} ${nl?'nl t-'+tp:'lt'} ${iso===hj?'hj':''} ${iso<hj?'pas':''} ${fora?'fora':''}" data-mt="${iso}" style="${nl&&T_.cor?'--tc:'+T_.cor+';--ti:'+T_.ink:''}">
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
  if($('#rv-adi'))$('#rv-adi').onclick=()=>{const v=prompt('Nova data (dd/mm/aaaa) — deixe em branco para “adiada, sem data”:',r.data.split('-').reverse().join('/'));if(v===null)return;
    const m=v.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);if(m){r.data=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');r.estado='agendada';r.avisados={};toast('Reunião adiada para '+fmtIsoL(r.data),'ok')}else{r.estado='adiada';toast('Reunião adiada (sem nova data)')}salvar();reuniaoVer(id)};
  $('#rv-ics').onclick=()=>exportarICS([r],reunTitulo(r,a));
  $('#rv-ata').onclick=()=>download('Ata '+reunTitulo(r,a).replace(/[\\/:*?"<>|]/g,'-')+' '+r.data+'.doc',ataHTML(r),'application/msword');
  $('#rv-cop').onclick=async()=>{try{await navigator.clipboard.writeText(ataTexto(r));toast('Ata copiada','ok')}catch(_){prompt('Copie o texto:',ataTexto(r))}}}
/* ---------- vista principal ---------- */
function vReunioes(){const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  const tab=UI.reTab||'prox';const R=todasReunioes(a);const hj=isoData(new Date());const agora=Date.now();
  barBtns([{id:'b-rn',t:ic('plus',15)+' Nova Reunião',c:'pri',f:()=>reuniaoDlg()},{id:'b-rics',t:ic('download',15)+' Exportar (.ics)',f:()=>{const L=reunioes(a).filter(r=>reunAtiva(r)&&r.data>=hj);if(!L.length)return toast('Não há reuniões agendadas para exportar');exportarICS(L,'Reuniões '+a.nome.replace('/','-'))}},{id:'b-rpr',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  const prox=R.filter(r=>reunAtiva(r)&&reunFim(r).getTime()>=agora);const p0=prox.find(r=>!r.semHora)||prox[0];
  const fimSem=isoData(new Date(dataDeIso(inicioSemana(hj)).getTime()+6*864e5));const semana=prox.filter(r=>r.data<=fimSem).length;
  const tar=reunioes(a).flatMap(r=>(r.decisoes||[]).map(d=>({d,r}))).filter(x=>!x.d.ok);const atr=tar.filter(x=>x.d.prazo&&x.d.prazo<hj).length;
  const atas=reunioes(a).filter(pendAta).length;const AV=avisosReunioes(a);
  const notif='Notification' in window?Notification.permission:'na';
  const kpis=`<div class="kpis">
    <div class="kpi"><div class="l">${ic('clock',14)} Próxima Reunião</div><div class="v">${p0?esc(quandoTxt(p0)):'—'}</div><div class="mut">${p0?esc(reunTitulo(p0,a))+(p0.semHora?'':' · '+fmtHM(p0.ini)):'Sem reuniões agendadas'}</div></div>
    <div class="kpi"><div class="l">${ic('calendar',14)} Esta Semana</div><div class="v">${semana}</div><div class="mut">${prox.length} agendadas no total</div></div>
    <div class="kpi"><div class="l">${ic('checks',14)} Tarefas Pendentes</div><div class="v">${tar.length}</div><div class="mut">${atr?'<b style="color:var(--bad,#c0392b)">'+atr+' em atraso</b>':'nenhuma em atraso'}</div></div>
    <div class="kpi"><div class="l">${ic('file',14)} Atas por Fazer</div><div class="v">${atas}</div><div class="mut">reuniões realizadas sem notas</div></div></div>`;
  const avisos=AV.length?`<div class="card ravisos"><div class="row"><h2 style="margin:0">${ic('bell',18)} Avisos</h2><span class="sp1"></span><span class="mut">${AV.length}</span></div>${AV.slice(0,8).map((v,i)=>`<div class="rav ${v.g}"><span class="rdot"></span><span>${v.t}</span>${v.acao?`<button class="btn sm" data-rav="${i}">Marcar Realizada</button>`:''}<button class="btn sm" data-rvo="${v.r.id}">Abrir</button></div>`).join('')}</div>`:'';
  const notifCard=notif==='granted'?'':`<div class="rnotif mut">${ic('bell',14)} Lembretes ${notif==='granted'?'com notificações do sistema ativas':'na app (enquanto estiver aberta)'}${notif==='default'?' · <button class="lnk" id="r-notif">ativar notificações</button>':''} · para avisos com a app fechada, <button class="lnk" id="r-ics2">exporte para o Calendário</button>.</div>`;
  const tabs=`<div class="tabs noprint">${[['prox','list','Próximas'],['cal','calendar','Mapa Mensal'],['tar','checks','Tarefas'],['hist','file','Histórico e Atas']].map(([k,i,l])=>`<button data-rtab="${k}" class="${tab===k?'on':''}">${ic(i,15)} ${l}</button>`).join('')}</div>`;
  const linha=r=>{const T_=reunTipo(r);const t=reunTurma(r,a);const c=reunAtiva(r)&&!r.ext?conflitosReuniao(a,r).length:0;const pp=(r.prep||[]).length?r.prep.filter(p=>p.ok).length+'/'+r.prep.length:'';const d=dataDeIso(r.data);
    return `<button class="rlin ${r.estado}" data-ro="${r.id}" style="--rc:${T_.cor}"><span class="rdt"><b>${d.getDate()}</b><span>${MESES[d.getMonth()+1].slice(0,3)}</span></span>
      <span class="rinf"><b>${esc(reunTitulo(r,a))}</b><span class="mut">${esc(DIAS_C[d.getDay()])} · ${r.semHora?'hora por definir':fmtHM(r.ini)+(r.fim!=null?'–'+fmtHM(r.fim):'')}${r.local?' · '+esc(r.local):''}${t&&r.titulo?' · '+esc(reunTurmasTxt(r,a)):''}</span></span>
      <span class="rtags">${r.ext?'<span class="tag">Marcação de Testes</span>':''}${c?`<span class="tag bad">${ic('alert',12)} sobreposição</span>`:''}${pp?`<span class="tag">${ic('checks',12)} ${pp}</span>`:''}${(r.lembretes||[]).length&&reunAtiva(r)?`<span class="tag">${ic('bell',12)}</span>`:''}${r.link?`<span class="tag">online</span>`:''}${r.estado!=='agendada'?`<span class="tag" style="--ec:${REUN_EST[r.estado].cor}">${REUN_EST[r.estado].n}</span>`:''}</span>
      <span class="rqd">${reunAtiva(r)?esc(quandoTxt(r)):''}</span></button>`};
  let corpo='';
  if(tab==='prox'){const grupos=[['Hoje',r=>r.data===hj],['Amanhã',r=>r.data===isoData(new Date(Date.now()+864e5))],['Esta Semana',r=>r.data<=fimSem],['Próximas Semanas',r=>r.data<=isoData(new Date(Date.now()+35*864e5))],['Mais Tarde',()=>true]];
    const usados=new Set();const G=grupos.map(([n,f])=>[n,prox.filter(r=>!usados.has(r.id)&&f(r)).map(r=>(usados.add(r.id),r))]).filter(g=>g[1].length);
    const adi=reunioes(a).filter(r=>r.estado==='adiada'&&reunFim(r).getTime()<agora);
    corpo=G.length?G.map(([n,L])=>`<div class="card"><h2>${n} <span class="mut" style="font-weight:500">${L.length}</span></h2><div class="rlista">${L.map(linha).join('')}</div></div>`).join(''):`<div class="card empty">${ic('users',30)}<br><b>Sem reuniões agendadas</b><br><span class="mut">Registe conselhos de turma, reuniões de departamento e de grupo, atendimentos… com lembretes, ordem de trabalhos, preparação e ata.</span><br><br><button class="btn pri" id="r-nova">${ic('plus',15)} Nova Reunião</button></div>`;
    if(adi.length)corpo+=`<div class="card"><h2>Adiadas sem nova data</h2><div class="rlista">${adi.map(linha).join('')}</div></div>`}
  else if(tab==='cal'){const base=UI.reMes||hj.slice(0,7);const [y,m]=base.split('-').map(Number);const d1=new Date(y,m-1,1);const off=(d1.getDay()+6)%7;const nd=new Date(y,m,0).getDate();const cal=a.calendario;
    let cel='';for(let k=0;k<off;k++)cel+='<div class="rmc vz"></div>';
    for(let dd=1;dd<=nd;dd++){const iso=y+'-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');const L=R.filter(r=>r.data===iso);const tp=cal&&cal.dias?cal.dias[iso]:'';const fds=[0,6].includes(new Date(y,m-1,dd).getDay());
      cel+=`<div class="rmc ${iso===hj?'hj':''} ${fds?'fds':''} ${tp&&!['letivo','inicio','inicio2'].includes(tp)?'nl':''}" data-rd="${iso}"><span class="rmn">${dd}</span>${L.map(r=>`<span class="rme ${r.estado}" data-ro="${r.id}" style="--rc:${reunTipo(r).cor}">${r.semHora?'':fmtHM(r.ini)+' '}${esc(reunTipo(r).ab)}<i>${esc(reunTitulo(r,a))}</i></span>`).join('')}</div>`}
    const nav=(dlt)=>{const d=new Date(y,m-1+dlt,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
    corpo=`<div class="card"><div class="row"><h2 style="margin:0">${MESES[m]} ${y}</h2><span class="sp1"></span><button class="btn sm ico" data-rm="${nav(-1)}" aria-label="Mês anterior">${ic('back',15)}</button><button class="btn sm" data-rm="${hj.slice(0,7)}">Hoje</button><button class="btn sm ico rot" data-rm="${nav(1)}" aria-label="Mês seguinte">${ic('back',15)}</button></div>
      <div class="rmgrid">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div class="rmh">${x}</div>`).join('')}${cel}</div>
      <div class="rleg">${Object.entries(REUN_T).map(([k,v])=>`<span><i style="background:${v.cor}"></i>${v.n}</span>`).join('')}</div><p class="hint">Toque num dia para agendar uma reunião nesse dia.</p></div>`}
  else if(tab==='tar'){const todas=reunioes(a).flatMap(r=>(r.decisoes||[]).map((d,i)=>({d,r,i}))).sort((x,y)=>(x.d.ok-y.d.ok)||((x.d.prazo||'9')).localeCompare(y.d.prazo||'9'));
    corpo=`<div class="card"><h2>Decisões e Tarefas das Reuniões</h2>${todas.length?`<div class="rlista">${todas.map(({d,r,i})=>`<div class="rdec ${d.ok?'ok':''} ${!d.ok&&d.prazo&&d.prazo<hj?'atr':''}"><input type="checkbox" data-tk="${r.id}|${i}" ${d.ok?'checked':''} aria-label="Concluída"><span><b>${esc(d.t)}</b><span class="mut">${d.resp?esc(d.resp)+' · ':''}${d.prazo?'até '+esc(fmtIsoL(d.prazo))+' ('+esc(contagem(d.prazo))+') · ':''}${esc(reunTitulo(r,a))}</span></span><button class="btn sm" data-ro="${r.id}">Reunião</button></div>`).join('')}</div>`:'<p class="mut">Ainda não há tarefas. Abra uma reunião e registe as decisões e tarefas em “Decisões e Tarefas”.</p>'}</div>`}
  else{const H=R.filter(r=>!reunAtiva(r)||reunFim(r).getTime()<agora).reverse();
    corpo=`<div class="card"><div class="row"><h2 style="margin:0">Histórico</h2><span class="sp1"></span><span class="mut">${H.length} reuniões · ${H.filter(pendAta).length} sem ata</span></div><div class="rlista" style="margin-top:12px">${H.map(r=>linha(r).replace('<span class="rqd">',`<span class="rqd">${r.ext?'':pendAta(r)?'<span class="tag bad">sem ata</span>':r.estado==='realizada'?'<span class="tag ok">'+ic('check',12)+' ata</span>':''}`)).join('')||'<p class="mut">Ainda não há reuniões passadas.</p>'}</div></div>`}
  $('#view').innerHTML=kpis+avisos+tabs+notifCard+corpo;
  $$('[data-rtab]').forEach(b=>b.onclick=()=>{UI.reTab=b.dataset.rtab;vReunioes()});
  $$('[data-ro]').forEach(b=>b.onclick=e=>{e.stopPropagation();reuniaoVer(b.dataset.ro)});$$('[data-rvo]').forEach(b=>b.onclick=()=>reuniaoVer(b.dataset.rvo));
  $$('[data-rav]').forEach(b=>b.onclick=()=>{const v=AV[+b.dataset.rav];v.r.estado='realizada';saveNow();toast('Marcada como realizada — registe as notas da ata','ok');vReunioes();reuniaoVer(v.r.id)});
  $$('[data-rm]').forEach(b=>b.onclick=()=>{UI.reMes=b.dataset.rm;vReunioes()});
  $$('[data-rd]').forEach(c=>c.onclick=()=>reuniaoDlg(null,{data:c.dataset.rd}));
  $$('[data-tk]').forEach(x=>x.onchange=()=>{const [rid,i]=x.dataset.tk.split('|');const r=reunioes(a).find(z=>z.id===rid);r.decisoes[+i].ok=x.checked;saveNow();vReunioes()});
  const nv=$('#r-nova');if(nv)nv.onclick=()=>reuniaoDlg();const ntf=$('#r-notif');if(ntf)ntf.onclick=pedirNotificacoes;
  const i2=$('#r-ics2');if(i2)i2.onclick=()=>$('#b-rics').click()}
/* ---------- Início: cartão das próximas reuniões ---------- */
function cartaoReunioesInicio(a){if(!a)return '';const agora=Date.now();const L=todasReunioes(a).filter(r=>reunAtiva(r)&&reunFim(r).getTime()>=agora).slice(0,4);const AV=avisosReunioes(a).filter(v=>v.g==='erro').length;
  if(!L.length&&!reunioes(a).length)return '';
  return `<div class="card rcard"><div class="row"><h2 style="margin:0">${ic('meet',18)} Reuniões</h2><span class="sp1"></span><button class="btn sm" data-go="reunioes">Ver Mapa</button></div>
    ${L.length?L.map((r,k)=>{const T_=reunTipo(r);const d=dataDeIso(r.data);return `<button class="rmini ${k===0?'prim':''}" data-ro="${r.id}" style="--rc:${T_.cor}"><span class="rdt"><b>${d.getDate()}</b><span>${MESES[d.getMonth()+1].slice(0,3)}</span></span><span class="rinf"><b>${esc(reunTitulo(r,a))}</b><span class="mut">${r.semHora?'':fmtHM(r.ini)+' · '}${esc(quandoTxt(r))}${r.local?' · '+esc(r.local):''}</span></span></button>`}).join(''):'<p class="mut" style="margin:8px 0 0">Sem reuniões agendadas.</p>'}
    ${AV?`<div class="alert w" style="margin:10px 0 0">${ic('alert',14)} ${AV} ${AV===1?'aviso':'avisos'} (sobreposições ou tarefas em atraso).</div>`:''}</div>`}

function ladoInicio(a){const h=ladoInicio0(a);const rc=cartaoReunioesInicio(a)+cartaoAniversarios(a);return rc?h.replace(/<\/aside>\s*$/,rc+'</aside>'):h}
function ladoInicio0(a){
  if(!a)return '';const c=a.calendario;const W=c&&c.periodos.length===2?'Semestre':'Período';
  if(!c)return `<aside class="in-side"><div class="card cdown vz"><h2 style="margin:0 0 6px">${ic('clock',18)} Fim do Período</h2><p class="mut" style="margin:0 0 12px">Importe o calendário escolar para ver a contagem decrescente.</p><button class="btn pri" data-go="calendario">Calendário Escolar</button></div></aside>`;
  const f=fimPeriodoAlvo(a);if(!f)return `<aside class="in-side"><div class="card cdown"><h2 style="margin:0">${ic('clock',18)} Ano letivo terminado</h2><p class="mut">Boas férias!</p></div></aside>`;
  const r=resumoPeriodoAtual(c);const hj=isoData(new Date());const p=f.p;
  const tot=p.dias,rest=f.antes?tot:r.rest,feitos=tot-rest;const pct=Math.round(100*feitos/Math.max(1,tot));
  const R_=52,C=2*Math.PI*R_;
  const intr=eventosCalendario(c).find(e=>e.t==='interrupcao'&&e.ini>hj);
  const TF=turmasFiltradas(a).map(t=>({t,r:aulasPrevistas(t,a)})).filter(x=>x.r);
  return `<aside class="in-side"><div class="card cdown">
    <div class="cdh"><span class="mut">${f.antes?'Início do '+p.n+'.º '+W.toLowerCase()+' a '+esc(fmtIsoL(p.ini)):'Contagem decrescente'}</span><b>Fim do ${p.n}.º ${W}</b><span class="mut">${esc(fmtIsoL(p.fim))}</span></div>
    <div class="ring"><svg viewBox="0 0 120 120" width="168" height="168"><circle cx="60" cy="60" r="${R_}" class="rt"/><circle cx="60" cy="60" r="${R_}" class="rv" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}" style="--c:${C.toFixed(1)}" transform="rotate(-90 60 60)"/></svg>
      <div class="ringc"><b>${rest}</b><span>dias letivos<br>por dar</span></div></div>
    <div class="cdt" id="cdt" data-alvo="${f.alvo.getTime()}">${['dias','horas','min','seg'].map(k=>`<div><b data-k="${k}">–</b><span>${k}</span></div>`).join('')}</div>
    <div class="cdx"><span>${pct}% do ${W.toLowerCase()} concluído</span><span>${Math.ceil((dataDeIso(p.fim)-dataDeIso(hj))/864e5/7)} semanas</span></div>
    ${intr?`<div class="cdi" style="--dc:${TIPOS_DIA.interrupcao.cor}">${ic('flag',14)} <span>Próxima interrupção${intr.nota?' ('+esc(intr.nota)+')':''}: <b>${esc(fmtIsoL(intr.ini))}</b> · ${contagem(intr.ini)}</span></div>`:''}
    ${TF.length?`<div class="cdtl"><div class="mut" style="font-size:12.5px;margin-bottom:6px">Tempos por dar até ao fim do ${p.n}.º ${W.toLowerCase()}</div>${TF.map(({t,r})=>{const q=r.P.find(x=>x.n===p.n);if(!q)return '';const falta=porDar(q);
      return `<div class="cdr">${anoBadge(t,'sm')}<span><b>${esc(t.nome)}</b> <span class="mut">${esc(t.disciplina)}${q.fim!==p.fim?' · termina a '+esc(fmtIso(q.fim)):''}</span></span><span class="sp1"></span><b>${falta}</b><span class="mut">/${q.tempos}</span></div>`}).join('')}</div>`:''}
  </div></aside>`;
}
let _cdTimer=null;
function iniciarContagem(){clearInterval(_cdTimer);const el=$('#cdt');if(!el)return;const alvo=+el.dataset.alvo;
  const tick=()=>{const e=$('#cdt');if(!e){clearInterval(_cdTimer);return}let ms=Math.max(0,alvo-Date.now());const v={dias:Math.floor(ms/864e5)};ms-=v.dias*864e5;v.horas=Math.floor(ms/36e5);ms-=v.horas*36e5;v.min=Math.floor(ms/6e4);ms-=v.min*6e4;v.seg=Math.floor(ms/1e3);
    Object.entries(v).forEach(([k,n])=>{const b=e.querySelector('[data-k="'+k+'"]');if(b)b.textContent=k==='dias'?n:String(n).padStart(2,'0')})};
  tick();_cdTimer=setInterval(tick,1000)}
function lembreteCopia(){const c=S.cfg;if(!S.anos.length)return '';try{if(nvL().prov||nuvemObrig())return ''}catch(_){}const d=c.ultimaCopia?Math.floor((Date.now()-c.ultimaCopia)/864e5):null;if(d!=null&&d<14)return '';
  return `<div class="card copiab priv"><span class="cbi">${ic('shield',18)}</span><div><b>${d==null?'Ainda não exportou nenhuma cópia de segurança':'A última cópia de segurança foi há '+d+' dias'}</b><div class="mut">Os dados só existem neste dispositivo. Exporte uma cópia (pode ser encriptada) e guarde-a no iCloud ou numa pen.</div></div><span class="sp1"></span><button class="btn pri" id="cp-agora">${ic('download',15)} Exportar Agora</button></div>`}
function inkDe(c){const m=String(c||'').match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return '#fff';let x=m[1];if(x.length===3)x=x.split('').map(q=>q+q).join('');const [r,g,b]=[0,2,4].map(i=>parseInt(x.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));const L=.2126*r+.7152*g+.0722*b;return L>.42?'#1f2328':'#fff'}
function cartoesInicioAval(a){
  if(!a)return '';const hj=isoData(new Date());
  const D=datasImportantes(a,60).slice(0,8);const PT=proximosTestes(a,45);
  const dias=iso=>Math.round((dataDeIso(iso)-dataDeIso(hj))/864e5);
  const tile=x=>{const d=dataDeIso(x.ini),n=dias(x.ini);const agora=x.ini<=hj&&x.fim>=hj;
    return `<div class="dimp ${n<=7?'perto':''} ${agora?'agora':''} ${x.tipo==='reun'?'priv':''}" style="--dc:${x.cor};--di:${inkDe(x.cor)}"><div class="dimd"><span class="dd">${d.getDate()}</span><span class="dm">${MESES[d.getMonth()+1].slice(0,3)}</span></div>
      <div class="dimt"><b>${esc(x.t)}</b><span class="mut">${x.fim!==x.ini?esc(fmtIsoL(x.ini))+' a '+esc(fmtIsoL(x.fim)):esc(DIAS[d.getDay()])}${x.s?' · '+esc(x.s):''}</span><span class="dimc">${agora?'a decorrer':n===0?'hoje':n===1?'amanhã':'daqui a '+n+' dias'}</span></div></div>`};
  return `${D.length?`<div class="card dimps"><div class="row" style="margin-bottom:12px"><h2 style="margin:0">${ic('flag',18)} Datas Importantes</h2><span class="sp1"></span><button class="btn sm" data-go="calendario">Calendário</button></div><div class="dimg">${D.map(tile).join('')}</div></div>`:''}
  <div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">${ic('target',18)} Próximos Testes</h2><span class="sp1"></span><span class="mut">próximas 6 semanas</span></div>
    ${PT.length?PT.map(({t,i})=>{const n=dias(i.data);const oc=ocorrenciasTurma(t,a);const ant=Object.keys(oc).filter(d=>d>=hj&&d<i.data).length;
      return `<button class="lin ptl ${n<=3?'perto':''}" data-tst="${t.id}"><span class="ptd"><b>${dataDeIso(i.data).getDate()}</b><span>${MESES[dataDeIso(i.data).getMonth()+1].slice(0,3)}</span></span>${anoBadge(t,'sm')}<span class="ptn"><b>${esc(i.nome)}</b> <span class="mut">${esc(t.nome)} · ${esc(t.disciplina)}</span><span class="mut ptx">${esc(DIAS[dataDeIso(i.data).getDay()])}${oc[i.data]?' · '+oc[i.data].blocos.map(b=>fmtHM(b.ini)).join(', '):''}${ant?' · '+ant+' aula'+(ant>1?'s':'')+' antes':''}</span></span><span class="sp1"></span><span class="mtp" style="--pc:${TIPO_COR(i.tipo)}">${esc(TIPO_AB(i.tipo))}</span><span class="ptc">${n===0?'hoje':n===1?'amanhã':n+' dias'}</span></button>`}).join('')
      :`<p class="mut" style="margin:0">Sem testes marcados nas próximas semanas. Marque-os em <b>Turma › Marcação de Testes</b>.</p>`}</div>`;
}

