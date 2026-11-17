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
function intercalarPeriodos(a){if(semIntercalar())return [];const c=a.calendario;const P=c?c.periodos.map(p=>p.n):periodos();const x=a.intercalar&&a.intercalar.periodos;return x?x.filter(n=>P.includes(n)):P}
function intercalarDe(a,per){return (a.datasAval||[]).find(d=>d.tipo==='intercalar'&&!d.turma&&d.per===per)}
const semIntercalar=()=>{try{return tipoEscola(EC())==='profissional'}catch(_){return false}};
function cartaoIntercalar(a,c){if(semIntercalar())return cartaoFormProf(a,c);
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
      <div class="mtleg">${['Teste de Avaliação','Questão-aula','Ficha de Trabalho','Apresentação Oral','Trabalho'].map(x=>`<span><span class="mtp" style="--pc:${TIPO_COR(x)}">${TIPO_AB(x)}</span>${x}</span>`).join('')}${semIntercalar()?'':`<span><span class="mta" style="--pc:${AVAL_T.intercalar.cor}">AI</span>Avaliação Intercalar</span>`}<span><span class="mta" style="--pc:${AVAL_T.reuniao.cor}">RA</span>Reunião de Avaliação</span><span><span class="mtf">F</span>Falta do professor</span></div>
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
const contagem=iso=>{const d=Math.round((dataDeIso(iso)-dataDeIso(isoData(new Date())))/864e5);return d===0?'hoje':d===1?'amanhã':d===-1?'ontem':d<0?'há '+(-d)+' dias':'daqui a '+d+' dias'};
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
    <div class="avbox">${(()=>{if(semIntercalar())return '';if(!intercalarPeriodos(a).includes(p.n))return `<div class="avr ro"><span class="mta" style="--pc:${AVAL_T.intercalar.cor}">AI</span><span class="mut">Sem avaliação intercalar</span></div>`;const d=intercalarDe(a,p.n);
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
