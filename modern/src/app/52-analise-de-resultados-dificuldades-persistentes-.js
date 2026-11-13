/* ===================== v0.985 · Análise de Resultados, Dificuldades Persistentes, Ficha Integral e Registo de Contactos ===================== */
const anPct=(i,aid)=>{const M=instMax(i),v=instTotal(i,aid);return M&&v!=null?v/M:null};
const anInsts=(t,per)=>(t.instrumentos||[]).filter(i=>instMax(i)&&!i.diag&&!/diagn/i.test(i.tipo||'')&&(per==null||+i.periodo===+per)).sort((x,y)=>String(x.data||'').localeCompare(String(y.data||''))||(+x.periodo||0)-(+y.periodo||0));
const anCor=p=>p==null?'#9aa5b1':p<.5?'#c0392b':p<.7?'#d4880f':p<.9?'#2e8b57':'#127fa6';
const anP=p=>p==null?'—':Math.round(p*100)+'%';
const difLim=()=>+S.cfg.difLim||.5;
/* Dificuldades persistentes: num domínio, pelo menos 2 dos últimos 3 elementos abaixo do limite e média desses abaixo do limite (+5) */
function dificuldades(t,x,lim){lim=lim||difLim();const R=[];const I=anInsts(t,null);
  (t.dominios||[]).forEach(d=>{const pts=I.map(i=>{const r=instDom(i,x.id,d.id);return r?{i,p:r.pct}:null}).filter(Boolean);if(pts.length<2)return;
    const u=pts.slice(-3);const ab=u.filter(z=>z.p<lim).length;const m=avg(u.map(z=>z.p));if(ab>=2&&m<lim+.05)R.push({d,pts,u,m,ab,tend:u[u.length-1].p-u[0].p})});return R}
function anSpark(pts,lim){const W=96,H=26;if(!pts.length)return '';const n=pts.length;const sx=k=>4+k*((W-8)/Math.max(1,n-1)),sy=p=>H-3-Math.max(0,Math.min(1,p))*(H-6);
  return `<svg class="ansp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><line x1="0" x2="${W}" y1="${sy(lim)}" y2="${sy(lim)}" stroke="#c0392b" stroke-dasharray="2 2" stroke-width=".8"/><polyline fill="none" stroke="#5b6b7b" stroke-width="1.5" points="${pts.map((z,k)=>sx(k)+','+sy(z.p)).join(' ')}"/>${pts.map((z,k)=>`<circle cx="${sx(k)}" cy="${sy(z.p)}" r="2.4" fill="${anCor(z.p)}"/>`).join('')}</svg>`}
function anBarras(rows){return `<div class="anbs">${rows.map(r=>`<div class="anb${r.k?' anck':''}" ${r.k?`data-ank="${esc(r.k)}" role="button" tabindex="0"`:''}><span class="anl">${r.l}</span><span class="ant"><i style="width:${Math.max(0,Math.min(100,(r.v||0)*100)).toFixed(1)}%;background:${r.c||anCor(r.v)}"></i>${r.v2!=null?`<u style="left:${Math.max(0,Math.min(100,r.v2*100)).toFixed(1)}%" title="Média da turma"></u>`:''}<em>${r.txt!=null?r.txt:anP(r.v)}</em></span>${r.s?`<small>${r.s}</small>`:''}</div>`).join('')}</div>`}
function anLinha(S1,S2,lab){const W=640,H=210,pl=40,pr=44,top=14,bot=34;const n=lab.length;if(!n)return '';const ch=H-top-bot;const sx=k=>pl+(n===1?(W-pl-pr)/2:k*((W-pl-pr)/(n-1))),sy=p=>top+ch-Math.max(0,Math.min(1,p))*ch;
  const grid=[0,.5,1].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${sy(v)}" y2="${sy(v)}" stroke="${v===.5?'#c0392b':'#d5dbe1'}" ${v?'stroke-dasharray="3 3"':''}/><text x="${pl-5}" y="${sy(v)+3}" font-size="9" text-anchor="end" fill="#6b7785">${v*100}%</text>`).join('');
  const ln=(P,cor,w,dash)=>{const q=P.map((p,k)=>p==null?null:[sx(k),sy(p)]).filter(Boolean);return q.length?`<polyline fill="none" stroke="${cor}" stroke-width="${w}" ${dash?'stroke-dasharray="5 4"':''} points="${q.map(z=>z.join(',')).join(' ')}"/>`:''};
  const dots=S1.map((p,k)=>p==null?'':`<circle cx="${sx(k)}" cy="${sy(p)}" r="4.5" fill="${anCor(p)}" stroke="#fff" stroke-width="1.5"/><text x="${sx(k)}" y="${sy(p)-9}" font-size="10" font-weight="700" text-anchor="middle" fill="#2b3640">${Math.round(p*100)}</text>`).join('');
  const lb=lab.map((l,k)=>`<text x="${sx(k)}" y="${H-bot+14}" font-size="9.5" text-anchor="middle" fill="#4a5663">${esc(l[0])}</text><text x="${sx(k)}" y="${H-bot+26}" font-size="8.5" text-anchor="middle" fill="#8a95a1">${esc(l[1]||'')}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" class="anln" role="img" aria-label="Evolução nos instrumentos de avaliação">${grid}${ln(S2,'#9aa5b1',2,1)}${ln(S1,'#127fa6',2.5)}${dots}${lb}</svg>`}
TITLES.analise='Análise de Resultados';NEEDS_T.push('analise');
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="dominios"]');if(ref&&!h.querySelector('[data-v="analise"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="analise" title="Análise de Resultados"><span data-ico="chart"></span><span class="lbl">Análise de Resultados</span></button>`);const b=h.querySelector('[data-v="analise"]');b.querySelector('[data-ico]').innerHTML=ic('target',18);b.onclick=()=>go('analise')}}
function vAnalise(){const t=T();if(!t)return go('turmas');const an=A();const P=periodos();const tab=UI.anTab||'dom';const per=UI.anPer===''||UI.anPer==null?(UI.anPer==null?perAtual(t):null):+UI.anPer;if(UI.anPer==null)UI.anPer=String(per);
  const AL=alunosAval(t);const I=anInsts(t,per);const lim=difLim();
  const DIF=AL.map(x=>({x,r:dificuldades(t,x,lim)})).filter(o=>o.r.length);
  barBtns([{id:'an-pr',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  const tabs=[['dom','layers','Por Domínio'],['inst','clipboard','Por Instrumento'],['turmas','users','Por Turma'],['aluno','user','Por Aluno'],['dif','alert','Dificuldades'+(DIF.length?' ('+DIF.length+')':'')]];
  const domAl=(x,d)=>per!=null?domPer(t,x.id,d.id,per):avg(anInsts(t,null).map(i=>{const r=instDom(i,x.id,d.id);return r?r.pct:null}));
  const notaAl=x=>per!=null?ponderada(t,pctsPer(t,x.id,per)):ponderada(t,pctsFinal(t,x.id,perAtual(t)));
  let body='';
  if(!I.length&&tab!=='turmas')body=`<div class="card empty">${ic('chart',28)}<br><b>Ainda sem instrumentos classificados${per!=null?' neste '+perW().toLowerCase():''}</b><br><span class="mut">Os gráficos aparecem assim que houver classificações lançadas.</span></div>`;
  else if(tab==='dom'){const rows=(t.dominios||[]).map(d=>{const v=AL.map(x=>domAl(x,d)).filter(z=>z!=null);const m=avg(v);const ab=v.filter(z=>z<.5).length;return {l:`<b>${esc(d.nome)}</b> <span class="mut">${d.peso}%</span>`,v:m,s:v.length?`${v.length} aluno${v.length>1?'s':''} · ${ab?`<b class="stlo">${ab} abaixo de 50%</b>`:'nenhum abaixo de 50%'} · mín. ${anP(Math.min(...v))} · máx. ${anP(Math.max(...v))}`:'sem classificações'}});
    const hm=`<div class="tblw"><table class="lst anhm"><thead><tr><th>Domínio</th>${P.map(p=>`<th>${perNome(p)}</th>`).join('')}</tr></thead><tbody>${(t.dominios||[]).map(d=>`<tr><td><b>${esc(d.ab||d.nome)}</b> <span class="mut">${esc(d.ab?d.nome:'')}</span></td>${P.map(p=>{const m=avg(AL.map(x=>domPer(t,x.id,d.id,p)));return `<td style="background:${m==null?'transparent':anCor(m)+'22'}"><b style="color:${anCor(m)}">${anP(m)}</b></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
    const dist=(t.dominios||[]).map(d=>{const v=AL.map(x=>domAl(x,d)).filter(z=>z!=null);const n=v.length||1;const B=[[0,.5,'#c0392b','< 50%'],[.5,.7,'#d4880f','50–69%'],[.7,.9,'#2e8b57','70–89%'],[.9,1.01,'#127fa6','≥ 90%']].map(([a_,b_,c,l])=>({c,l,k:v.filter(z=>z>=a_&&z<b_).length}));return `<div class="andist"><span class="anl"><b>${esc(d.ab||d.nome)}</b></span><span class="anst">${B.map(z=>z.k?`<i style="flex:${z.k};background:${z.c}" title="${z.l}: ${z.k}">${z.k}</i>`:'').join('')||'<span class="mut">—</span>'}</span></div>`}).join('');
    const DK=(t.dominios||[]).map(d=>{const v=AL.map(x=>domAl(x,d)).filter(z=>z!=null);return {d,m:avg(v)}}).filter(o=>o.m!=null);const pt=DK.reduce((q,o)=>q+(+o.d.peso||0),0);const glob=DK.length?(pt?DK.reduce((q,o)=>q+o.m*(+o.d.peso||0),0)/pt:avg(DK.map(o=>o.m))):null;const nAv=AL.filter(x=>(t.dominios||[]).some(d=>domAl(x,d)!=null)).length;const nAb=AL.filter(x=>(t.dominios||[]).some(d=>{const z=domAl(x,d);return z!=null&&z<.5})).length;const ord=DK.slice().sort((x,y)=>y.m-x.m);const dif=ord.length>1&&ord[0].m-ord[ord.length-1].m>.005;const kpis=`<div class="ankp"><div style="--kc:${anCor(glob)}"><span>Média global</span><b>${anP(glob)}</b><small>ponderada pelos domínios</small></div><div><span>Alunos avaliados</span><b>${nAv}<small> de ${AL.length}</small></b><small>${I.length} instrumento${I.length===1?'':'s'}</small></div>${dif?`<div style="--kc:${anCor(ord[0].m)}"><span>Domínio mais forte</span><b class="tx">${esc(ord[0].d.nome)}</b><small>${anP(ord[0].m)}</small></div><div style="--kc:${anCor(ord[ord.length-1].m)}"><span>Domínio a reforçar</span><b class="tx">${esc(ord[ord.length-1].d.nome)}</b><small>${anP(ord[ord.length-1].m)}</small></div>`:''}<div style="--kc:${nAb?'#c0392b':'#2e8b57'}"><span>Abaixo de 50%</span><b>${nAb}</b><small>${nAb?'aluno'+(nAb>1?'s':'')+' com algum domínio negativo':'nenhum aluno com domínio negativo'}</small></div></div>`;
    body=`${kpis}<div class="card andom"><h2>${ic('layers',18)} Média da turma por domínio</h2>${anBarras(rows)}</div><div class="ang2"><div class="card"><h2>${ic('chart',18)} Distribuição dos alunos</h2>${dist}<div class="anleg"><span><i style="background:#c0392b"></i>&lt; 50%</span><span><i style="background:#d4880f"></i>50–69%</span><span><i style="background:#2e8b57"></i>70–89%</span><span><i style="background:#127fa6"></i>≥ 90%</span></div></div><div class="card"><h2>${ic('calendar',18)} Evolução por ${perW().toLowerCase()}</h2>${hm}</div></div>`}
  else if(tab==='inst'){const rows=I.map(i=>{const v=AL.map(x=>anPct(i,x.id)).filter(z=>z!=null);const m=avg(v);const neg=v.filter(z=>z<.5).length;return {l:`<b>${esc(i.nome)}</b> <span class="mut">${esc(i.tipo||'')}${i.data?' · '+esc(fmtIso(i.data)):''}</span>`,v:m,s:v.length?`${v.length}/${AL.length} classificados · ${neg?`<b class="stlo">${Math.round(100*neg/v.length)}% negativas</b>`:'sem negativas'} · ${anP(Math.min(...v))}–${anP(Math.max(...v))}`:'por classificar',k:'i:'+i.id}});
    const D=(t.dominios||[]);const hm=`<div class="tblw"><table class="lst anhm"><thead><tr><th>Instrumento</th>${D.map(d=>`<th title="${esc(d.nome)}">${esc(d.ab||d.nome)}</th>`).join('')}</tr></thead><tbody>${I.map(i=>`<tr><td><b>${esc(i.nome)}</b></td>${D.map(d=>{const m=avg(AL.map(x=>{const r=instDom(i,x.id,d.id);return r?r.pct:null}));return `<td style="background:${m==null?'transparent':anCor(m)+'22'}">${m==null?'<span class="mut">—</span>':`<b style="color:${anCor(m)}">${anP(m)}</b>`}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
    body=`<div class="card"><h2>${ic('clipboard',18)} Média de cada instrumento</h2><p class="hint" style="margin-top:0">Toque num instrumento para abrir a análise detalhada por item.</p>${anBarras(rows)}</div><div class="card"><h2>${ic('layers',18)} Instrumentos × domínios</h2>${hm}</div>`}
  else if(tab==='turmas'){const TT=an.turmas.filter(z=>(z.alunos||[]).length&&(z.instrumentos||[]).some(i=>instMax(i)));const rows=TT.map(z=>{const p=per!=null?Math.min(per,periodos().length):perAtual(z);const v=alunosAval(z).map(x=>ponderada(z,per!=null?pctsPer(z,x.id,p):pctsFinal(z,x.id,p))).filter(q=>q!=null);const m=avg(v);const pos=v.filter(q=>!negativa(z,q)).length;
      return {l:`<b>${esc(z.nome)}</b> <span class="mut">${esc(z.disciplina||'')}</span>${z.id===t.id?' <span class="tag">atual</span>':''}`,v:m,txt:m==null?'—':fmtNota(z,m),s:v.length?`${v.length} alunos com classificação · <b>${Math.round(100*pos/v.length)}% positivas</b>`:'sem classificações',k:'t:'+z.id}});
    body=`<div class="card"><h2>${ic('users',18)} Comparação entre as suas turmas</h2><p class="hint" style="margin-top:0">Média das classificações ${per!=null?'do '+per+'.º '+perW().toLowerCase():'atuais'} em cada turma. Toque numa turma para a abrir.</p>${rows.length?anBarras(rows):'<p class="mut">Sem turmas com classificações.</p>'}</div>`}
  else if(tab==='aluno'){const x=AL.find(z=>z.id===UI.anAl)||AL[0];UI.anAl=x&&x.id;if(!x)body='<div class="card empty">Sem alunos.</div>';else{
    const II=I.filter(i=>AL.some(z=>anPct(i,z.id)!=null));const S1=II.map(i=>anPct(i,x.id)),S2=II.map(i=>avg(AL.map(z=>anPct(i,z.id))));const nf_=notaAl(x);const dif=dificuldades(t,x,lim);
    const rows=(t.dominios||[]).map(d=>({l:`<b>${esc(d.nome)}</b>`,v:domAl(x,d),v2:avg(AL.map(z=>domAl(z,d))),s:`turma: ${anP(avg(AL.map(z=>domAl(z,d))))}`}));
    body=`<div class="card"><div class="row anals"><select id="an-al" aria-label="Aluno">${AL.map(z=>`<option value="${z.id}" ${z.id===x.id?'selected':''}>${esc(numAl(z))}. ${esc(z.nome)}</option>`).join('')}</select><span class="sp1"></span><button class="btn" id="an-fi">${ic('idcard',15)} Ficha Integral</button></div>
      <div class="row anhd">${avatar(x,52)}<div><b style="font-size:17px">${esc(x.nome)}</b><div class="mut">${per!=null?perNome(per):'Ano letivo'} · classificação ${nf_==null?'—':`<b style="color:${anCor(nf_)}">${esc(fmtNota(t,nf_))}</b> (nível ${nivel(t,nf_)})`}</div>${dif.length?`<div class="anchips">${dif.map(o=>`<span class="tag bad">${ic('alert',12)} ${esc(o.d.nome)}</span>`).join('')}</div>`:''}</div></div></div>
      <div class="card"><h2>${ic('chart',18)} Evolução nos instrumentos</h2><div class="anleg"><span><i style="background:#127fa6"></i>${esc(x.nome.split(' ')[0])}</span><span><i class="dsh"></i>Média da turma</span></div>${II.length?anLinha(S1,S2,II.map(i=>[i.nome.length>14?i.nome.slice(0,13)+'…':i.nome,i.data?fmtIso(i.data):''])):'<p class="mut">Sem instrumentos.</p>'}</div>
      <div class="card"><h2>${ic('layers',18)} Domínios: aluno e turma</h2><p class="hint" style="margin-top:0">A barra é o aluno; o traço vertical é a média da turma.</p>${anBarras(rows)}</div>`}}
  else if(tab==='dif'){const porDom=(t.dominios||[]).map(d=>({d,n:DIF.filter(o=>o.r.some(z=>z.d.id===d.id)).length})).filter(z=>z.n);
    body=`<div class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('alert',18)} Dificuldades persistentes</h2><span class="sp1"></span><label style="margin:0">Abaixo de</label><select id="an-lim" style="width:auto">${[.4,.45,.5,.55,.6].map(v=>`<option value="${v}" ${Math.abs(v-lim)<1e-6?'selected':''}>${Math.round(v*100)}%</option>`).join('')}</select></div>
      <p class="hint">Um aluno é sinalizado num domínio quando, nos últimos três elementos de avaliação desse domínio (ou nos dois, se só houver dois), pelo menos dois ficaram abaixo de ${Math.round(lim*100)}% e a média deles também. Considera o ano todo, não só o ${perW().toLowerCase()} escolhido.</p>
      ${porDom.length?`<h3>Onde se concentram</h3>${anBarras(porDom.map(z=>({l:`<b>${esc(z.d.nome)}</b>`,v:z.n/Math.max(1,AL.length),c:'#c0392b',txt:z.n+' aluno'+(z.n>1?'s':''),s:Math.round(100*z.n/Math.max(1,AL.length))+'% da turma'})))}`:''}</div>
      ${DIF.length?`<div class="card"><h2>${ic('users',18)} Alunos sinalizados</h2>${DIF.map(o=>`<div class="andf">${avatar(o.x,40)}<div class="andfb"><b>${esc(numAl(o.x))}. ${esc(o.x.nome)}</b>${o.r.map(z=>`<div class="andfd"><span class="andfn">${esc(z.d.nome)}</span>${anSpark(z.pts,lim)}<span class="mut">${z.u.map(q=>Math.round(q.p*100)+'%').join(' → ')}</span>${z.tend>.05?'<span class="tag ok">a melhorar</span>':z.tend<-.05?'<span class="tag bad">a piorar</span>':''}</div>`).join('')}</div><div class="andfa"><button class="btn sm" data-anfi="${o.x.id}">${ic('idcard',13)} Ficha</button><button class="btn sm" data-anal="${o.x.id}">${ic('chart',13)} Gráficos</button></div></div>`).join('')}</div>`:`<div class="card empty">${ic('check',26)}<br><b>Nenhum aluno com dificuldades persistentes</b><br><span class="mut">Com o limite de ${Math.round(lim*100)}%.</span></div>`}`}
  $('#view').innerHTML=`<div class="anv"><div class="card anhead"><div class="row" style="gap:10px;flex-wrap:wrap"><div class="tabs antabs">${tabs.map(([k,i,l])=>`<button data-antab="${k}" class="${tab===k?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div><span class="sp1"></span><select id="an-per" style="width:auto" aria-label="${perW()}">${P.map(p=>`<option value="${p}" ${per===p?'selected':''}>${perNome(p)}</option>`).join('')}<option value="" ${per==null?'selected':''}>Ano letivo</option></select></div></div>${body}</div>`;
  $$('#view [data-antab]').forEach(b=>b.onclick=()=>{UI.anTab=b.dataset.antab;vAnalise()});
  $('#an-per').onchange=e=>{UI.anPer=e.target.value;vAnalise()};
  const sa=$('#an-al');if(sa)sa.onchange=()=>{UI.anAl=sa.value;vAnalise()};
  const fi=$('#an-fi');if(fi)fi.onclick=()=>fichaAluno(UI.anAl,'integral');
  const li=$('#an-lim');if(li)li.onchange=()=>{S.cfg.difLim=+li.value;save();vAnalise()};
  $$('#view [data-anfi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.anfi,'integral'));
  $$('#view [data-anal]').forEach(b=>b.onclick=()=>{UI.anAl=b.dataset.anal;UI.anTab='aluno';vAnalise()});
  $$('#view [data-ank]').forEach(b=>{const f=()=>{const [k,id]=b.dataset.ank.split(':');if(k==='t'){S.turmaAtiva=id;save();go('analise')}else if(k==='i'){UI.instSel=id;UI.instTab='stats';go('instrumentos');try{const i=t.instrumentos.find(z=>z.id===id);if(i&&typeof abrirInstrumento==='function')abrirInstrumento(i.id)}catch(_){}}};b.onclick=f;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}})}
{const _gAn=go;go=function(v){if(go._f&&go._f.analise!==vAnalise)go._f.analise=vAnalise;return _gAn.apply(this,arguments)};go._f=_gAn._f;if(go._f)go._f.analise=vAnalise}
/* Alerta precoce: também as dificuldades persistentes num domínio */
{const _apD=alertaPrecoce;alertaPrecoce=function(t,a){const R=_apD.apply(this,arguments);try{if(S.cfg.difAlerta!==false)dificuldades(t,a).forEach(o=>R.push('dificuldade persistente em '+o.d.nome+' ('+o.u.map(q=>Math.round(q.p*100)+'%').join(' → ')+')'))}catch(_){}return R}}
/* ---------- Ficha integral do aluno: tudo por ordem cronológica ---------- */
FICHA_TABS.splice(1,0,['integral','list','Ficha Integral']);
const FI_TIPOS={aval:['grad','Avaliações','#127fa6'],falta:['calcheck','Faltas','#c0392b'],ocor:['alert','Ocorrências','#d4880f'],cont:['chat','Contactos','#6c4fb3'],interv:['refresh','Intervenções e apoios','#2e8b57'],ativ:['award','Participação','#0f8b8d']};
function fichaIntegralDados(a){const an=A();try{ligarClasse(an)}catch(_){}const OC=ocorrenciasAluno(a).filter(o=>o.an===an);const E=[];const vistos=new Set();const add=o=>{if(o.d)E.push(o)};
  OC.forEach(({t,x})=>{const dc=t.disciplina||t.nome;
    anInsts(t,null).forEach(i=>{if(!i.data)return;const v=anPct(i,x.id);let st='';try{st=instAlunoEstado(t,i,x.id)}catch(_){}
      if(v!=null)add({d:i.data,k:'aval',t:`${esc(i.nome)}`,s:`${esc(dc)}${i.tipo?' · '+esc(i.tipo):''}`,v:`<b style="color:${anCor(v)}">${esc(fmtNota(t,v))}</b>`});else if(st==='faltou')add({d:i.data,k:'falta',t:'Faltou a '+esc(i.nome),s:esc(dc),bad:1})});
    let L=[];try{L=listaAulas(t,an).filter(z=>z.licao&&aulaConf(z))}catch(_){}
    L.forEach(z=>{const p=(z.s&&z.s.pres||{})[x.id];if(!p)return;const lic=z.licao?' · lição '+z.licao:'';
      if(p.f)add({d:z.data,k:'falta',t:p.f==='FD'?'Falta disciplinar':(p.j||p.just)?'Falta justificada':'Falta injustificada',s:esc(dc)+lic,bad:p.f==='FD'||!(p.j||p.just)});
      if(p.at)add({d:z.data,k:'falta',t:'Atraso',s:esc(dc)+lic});if(p.fm)add({d:z.data,k:'falta',t:'Falta de material',s:esc(dc)+lic});
      if(p.oc&&(p.oc.n||p.oc.t)){const nv=(OCOR.find(q=>q[0]===p.oc.n)||[])[1]||'';add({d:z.data,k:'ocor',t:'Ocorrência'+(nv?' '+nv.toLowerCase():''),s:esc(dc)+(p.oc.t?' · '+esc(p.oc.t):''),bad:p.oc.n&&p.oc.n!=='positiva',ok:p.oc.n==='positiva'})}});
    (x.faltasAl||[]).forEach(f=>{if(vistos.has(f.id))return;vistos.add(f.id);add({d:f.data,k:'falta',t:(TIPOS_FALTA[f.tipo]||'Falta')+(f.tempos>1?' ('+f.tempos+' tempos)':''),s:'Registo na ficha'+(f.obs?' · '+esc(f.obs):''),bad:f.tipo==='injust'||f.tipo==='disc'})});
    (x.intervencoes||[]).forEach(z=>{if(vistos.has(z.id))return;vistos.add(z.id);const k=/ocorr/i.test(z.tipo||'')?'ocor':/contacto/i.test(z.tipo||'')?'cont':'interv';add({d:z.data,k,t:esc(z.tipo||'Intervenção'),s:esc(z.desc||'')+(z.resp?' · '+esc(z.resp):''),bad:k==='ocor'})});
    (x.atividades||[]).forEach(z=>{if(vistos.has(z.id))return;vistos.add(z.id);add({d:z.data,k:'ativ',t:esc(z.atividade),s:[z.papel,z.obs].filter(Boolean).map(esc).join(' · ')})})});
  try{contactosEE(an,a.cid).forEach(c=>add({d:c.data,k:'cont',t:`Contacto · ${esc(c.meio||'')}${c.sentido==='rec'?' (recebido)':''}`,s:[c.quem,c.assunto,c.sintese].filter(Boolean).map(esc).join(' · ')+(c.compromisso?` · <i>Compromisso: ${esc(c.compromisso)}</i>`:'')}))}catch(_){}
  try{const cl=a.origem||(T()||{}).nome||'';const D=dtDados(an,cl);const eu=normT(a.nome);D.atend.filter(z=>normT(z.aluno||'').includes(eu)).forEach(z=>add({d:z.data,k:'cont',t:'Atendimento · '+esc(z.modo||''),s:[z.quem,z.assunto,z.resumo].filter(Boolean).map(esc).join(' · ')}));D.ocorr.filter(z=>normT(z.aluno||'').includes(eu)).forEach(z=>add({d:z.data,k:'ocor',t:'Ocorrência (Direção de Turma)',s:esc(z.desc||'')+(z.medida?' · Medida: '+esc(z.medida):''),bad:1}))}catch(_){}
  E.sort((p,q)=>String(q.d).localeCompare(String(p.d)));return {OC,E}}
function fichaIntegral(t,a){const {OC,E}=fichaIntegralDados(a);const f=UI.fiF||'';const an=A();
  const med=a.medidas||{};const MD=['univ','selet','adic'].flatMap(k=>(med[k]||[]).map(i=>({k,l:typeof i==='number'?((MEDIDAS[k]||{}).l||[])[i]||'':i}))).filter(z=>z.l);
  const n=k=>E.filter(e=>e.k===k).length;const fInj=E.filter(e=>e.k==='falta'&&e.bad).length;
  const notas=OC.map(({t:z,x})=>{const p=perAtual(z);const v=ponderada(z,pctsFinal(z,x.id,p));return `<span class="fichp"><b>${esc(z.disciplina)}</b> ${v==null?'<span class="mut">—</span>':`<b style="color:${anCor(v)}">${esc(fmtNota(z,v))}</b>`}</span>`}).join('');
  const dif=OC.flatMap(({t:z,x})=>dificuldades(z,x).map(o=>`<span class="tag bad">${ic('alert',12)} ${esc(z.disciplina)}: ${esc(o.d.nome)}</span>`));
  const L=E.filter(e=>!f||e.k===f);let mes='';
  const lin=L.map(e=>{const dt=dataDeIso(e.d);const m=dt.getFullYear()+'-'+dt.getMonth();const h=m!==mes?`<h4 class="fimes">${MESES[dt.getMonth()+1]} ${dt.getFullYear()}</h4>`:'';mes=m;const T_=FI_TIPOS[e.k];
    return `${h}<div class="fii ${e.bad?'bad':''} ${e.ok?'ok':''}"><span class="fid"><b>${dt.getDate()}</b><small>${['dom','seg','ter','qua','qui','sex','sáb'][dt.getDay()]}</small></span><span class="fic" style="--fc:${T_[2]}">${ic(T_[0],14)}</span><span class="fit"><b>${e.t}</b>${e.s?`<small>${e.s}</small>`:''}</span>${e.v?`<span class="fiv">${e.v}</span>`:''}</div>`}).join('');
  return `<div class="finte"><div class="fikp"><div><b>${n('aval')}</b><span>avaliações</span></div><div class="${fInj?'bad':''}"><b>${n('falta')}</b><span>faltas e atrasos${fInj?' · '+fInj+' a assinalar':''}</span></div><div class="${E.some(e=>e.k==='ocor'&&e.bad)?'w':''}"><b>${n('ocor')}</b><span>ocorrências</span></div><div><b>${n('cont')}</b><span>contactos</span></div><div><b>${MD.length}</b><span>medidas</span></div></div>
    ${notas?`<div class="fichps">${notas}</div>`:''}${MD.length?`<div class="fimed">${ic('shield',14)} <b>Medidas em vigor:</b> ${MD.map(z=>`<span class="tag">${esc(z.l)}</span>`).join(' ')}</div>`:''}${dif.length?`<div class="fimed">${ic('alert',14)} <b>Dificuldades persistentes:</b> ${dif.join(' ')}</div>`:''}
    <div class="row fifl"><div class="seg">${[['','Tudo'],...Object.entries(FI_TIPOS).map(([k,v])=>[k,v[1]])].map(([k,l])=>`<button type="button" data-fif="${k}" class="${f===k?'on':''}">${l}${k?' <small>'+n(k)+'</small>':''}</button>`).join('')}</div><span class="sp1"></span><button type="button" class="btn sm" id="fi-pr">${ic('printer',14)} Imprimir / PDF</button></div>
    <div class="fitl">${lin||'<p class="mut">Sem registos.</p>'}</div><p class="hint">Junta as classificações dos instrumentos, as faltas e ocorrências das chamadas, os registos da ficha, os contactos com o encarregado de educação e os atendimentos da direção de turma, em todas as disciplinas que tem com este aluno em ${esc(an?an.nome:'')}.</p></div>`}
{const _ftI=fichaTab;fichaTab=function(t,a,tab){if(tab==='integral')return fichaIntegral(t,a);return _ftI.apply(this,arguments)}}
{const _bfI=bindFichaTab;bindFichaTab=function(t,a,tab,id){if(tab!=='integral')return _bfI.apply(this,arguments);
  $$('#dw-b [data-fif]').forEach(b=>b.onclick=()=>{UI.fiF=b.dataset.fif;const sc=($('#dw-b')||{}).scrollTop;fichaAluno(id,'integral');try{$('#dw-b').scrollTop=sc}catch(_){}});
  const pr=$('#fi-pr');if(pr)pr.onclick=()=>{const c=$('#dw-b .finte');if(!c)return;const w=window.open('','_blank');if(!w){toast('Permita janelas pop-up para imprimir','aviso');return}const e=escolaDe(t)||{};
    w.document.write(`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Ficha integral — ${esc(a.nome)}</title><style>body{font:12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1d2731;margin:18px}h1{font-size:18px;margin:0}.sub{color:#5b6875;margin:2px 0 12px}.fikp{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.fikp div{border:1px solid #cfd8e1;border-radius:6px;padding:4px 10px}.fikp b{font-size:15px;margin-right:4px}.fichps,.fimed{margin:6px 0}.fichp{margin-right:12px}.tag{border:1px solid #cfd8e1;border-radius:10px;padding:0 6px;margin-right:4px;font-size:11px}.fifl,.hint .x{display:none}.fimes{margin:12px 0 4px;font-size:13px;border-bottom:1px solid #cfd8e1;text-transform:capitalize}.fii{display:flex;gap:10px;align-items:flex-start;padding:3px 0;break-inside:avoid}.fid{width:34px;text-align:center}.fid b{display:block;font-size:14px}.fid small{color:#7b8691}.fic{display:none}.fit{flex:1}.fit small{display:block;color:#5b6875}.fii.bad .fit b{color:#b42318}svg{display:none}.hint{color:#6b7785;font-size:11px;margin-top:12px}</style></head><body><h1>Ficha integral — ${esc(a.nome)}</h1><div class="sub">${esc(nomeEscola(e))} · ${esc(a.origem||t.nome)} · n.º ${esc(numAl(a))} · ${esc((A()||{}).nome||'')} · ${esc(fmtIsoL(isoHoje()))}</div>${c.innerHTML}</body></html>`);w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch(_){}},300)}}}
/* ---------- Direção de Turma: Registo de Contactos (chamadas, e-mails, reuniões e contactos presenciais) ---------- */
if(!MEIOS_EE.includes('Reunião'))MEIOS_EE.splice(2,0,'Reunião');
const RC_IC={'Telefone':'phone','E-mail':'mail','Reunião':'meet','Presencial':'user','Videochamada':'meet','Mensagem / caderneta':'chat','Carta':'file'};
{const k=DT_TABS.findIndex(x=>x[0]==='contactos');if(!DT_TABS.some(x=>x[0]==='regc'))DT_TABS.splice(k>=0?k+1:2,0,['regc','phone','Registo de Contactos'])}
function rcLista(a,n,AL){const D=dtDados(a,n);D.contGerais=D.contGerais||[];const L=[];
  AL.forEach(o=>{try{ligarClasse(a)}catch(_){}contactosEE(a,o.x.cid).forEach(c=>L.push({c,o,src:'ee'}))});
  D.contGerais.forEach(c=>L.push({c,o:null,src:'ger'}));
  D.atend.forEach(z=>L.push({c:{id:z.id,data:z.data,hora:z.hora,meio:/telef/i.test(z.modo||'')?'Telefone':z.modo==='Presencial'?'Presencial':z.modo||'Presencial',quem:z.quem,assunto:z.assunto,sintese:z.resumo,compromisso:z.enc},o:AL.find(q=>normT(q.x.nome)===normT(z.aluno||''))||null,src:'at',nomeAl:z.aluno}));
  return L.sort((p,q)=>String(q.c.data||'').localeCompare(String(p.c.data||''))||String(q.c.hora||'').localeCompare(String(p.c.hora||'')))}
function rcDlg(a,n,AL,ed,depois){const hj=isoHoje();const c=ed?ed.c:{};const o0=ed?ed.o:null;const D=dtDados(a,n);D.contGerais=D.contGerais||[];
  openDrawer((ed?'Editar':'Registar')+' Contacto — '+n,`<div class="ed rcdlg">
    <div class="g2"><div style="grid-column:1/-1"><label>Aluno</label><select id="rc-al" ${ed?'disabled':''}><option value="">— Contacto geral da turma (sem aluno) —</option>${AL.map(o=>`<option value="${esc(o.x.cid)}" ${o0&&o0.x.cid===o.x.cid?'selected':''}>${esc(numAl(o.x))}. ${esc(o.x.nome)}</option>`).join('')}</select></div>
    <div><label>Data</label><input type="date" id="rc-d" value="${esc(c.data||hj)}"></div><div><label>Hora</label><input type="time" id="rc-h" value="${esc(c.hora||'')}"></div>
    <div style="grid-column:1/-1"><label>Meio</label><div class="seg rcmeio">${MEIOS_EE.map(m=>`<button type="button" data-rcm="${esc(m)}" class="${(c.meio||'Telefone')===m?'on':''}">${ic(RC_IC[m]||'chat',14)} ${esc(m)}</button>`).join('')}</div></div>
    <div><label>Sentido</label><select id="rc-s"><option value="ef" ${c.sentido!=='rec'?'selected':''}>Efetuado por mim</option><option value="rec" ${c.sentido==='rec'?'selected':''}>Recebido</option></select></div>
    <div><label>Com quem</label><input id="rc-q" list="rc-ql" value="${esc(c.quem||'')}" placeholder="Encarregado(a) de educação"><datalist id="rc-ql">${['Encarregado(a) de educação','Mãe','Pai','Aluno(a)','Professor(a)','Psicólogo(a) / SPO','Direção','Outro'].map(z=>`<option>${z}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Assunto</label><input id="rc-a" list="ce-al2" value="${esc(c.assunto||'')}" placeholder="ex.: Assiduidade, aproveitamento, comportamento…"><datalist id="ce-al2">${['Assiduidade','Aproveitamento','Comportamento','Medidas de apoio','Informação intercalar','Convocatória','Pedido do encarregado de educação','Justificação de faltas','Saúde'].map(z=>`<option>${z}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Síntese</label><textarea id="rc-t" rows="4" placeholder="O que foi falado…">${esc(c.sintese||'')}</textarea></div>
    <div style="grid-column:1/-1"><label>Compromisso / encaminhamento</label><textarea id="rc-c" rows="2">${esc(c.compromisso||'')}</textarea></div>
    <div><label>Acompanhar em</label><input type="date" id="rc-f" value="${esc(c.acomp||'')}"></div><div><label class="chk" style="margin-top:26px"><input type="checkbox" id="rc-tk" ${c.tarefa||!ed?'checked':''}> Criar tarefa para essa data</label></div></div>
    <div class="row" style="margin-top:14px;gap:8px">${ed?`<button class="btn dng" id="rc-x">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn" id="rc-can">Cancelar</button><button class="btn pri" id="rc-ok">${ic('check',14)} Guardar</button></div></div>`);
  let meio=c.meio||'Telefone';$$('#dw-b [data-rcm]').forEach(b=>b.onclick=()=>{meio=b.dataset.rcm;$$('#dw-b [data-rcm]').forEach(z=>z.classList.toggle('on',z===b))});
  const alSel=$('#rc-al');const prefQ=()=>{const o=AL.find(z=>z.x.cid===alSel.value);const q=$('#rc-q');if(o&&!q.value&&o.x.eeNome)q.placeholder=o.x.eeNome+(o.x.eeParent?' ('+o.x.eeParent+')':'')};alSel.onchange=prefQ;prefQ();
  const lista=()=>{const cid=alSel.value;return cid?contactosEE(a,cid):D.contGerais};
  $('#rc-can').onclick=()=>{closeDrawer();depois&&depois()};
  const ex=$('#rc-x');if(ex)ex.onclick=()=>{if(!confirm('Apagar este registo de contacto?'))return;const L=lista();const k=L.indexOf(c);if(k>=0)L.splice(k,1);if(c.tarefa){const T_=tarefas();const j=T_.findIndex(z=>z.id===c.tarefa);if(j>=0&&!T_[j].feito)T_.splice(j,1)}save();closeDrawer();toast('Contacto apagado');depois&&depois()};
  $('#rc-ok').onclick=()=>{const o=ed?c:{id:uid(),criado:Date.now()};const q=$('#rc-q');Object.assign(o,{data:$('#rc-d').value||hj,hora:$('#rc-h').value||'',meio,sentido:$('#rc-s').value,quem:q.value.trim()||q.placeholder||'',assunto:$('#rc-a').value.trim(),sintese:$('#rc-t').value.trim(),compromisso:$('#rc-c').value.trim(),acomp:$('#rc-f').value||'',disc:o.disc||'Direção de Turma',turma:n,autor:o.autor||S.cfg.professor||''});
    if(!o.assunto&&!o.sintese){toast('Indique pelo menos o assunto ou a síntese','aviso');return}
    const al=AL.find(z=>z.x.cid===alSel.value);const nm=al?al.x.nome.split(' ')[0]:'a turma '+n;const T_=tarefas();let tk=o.tarefa&&T_.find(z=>z.id===o.tarefa);const querT=$('#rc-tk').checked&&o.acomp;
    if(querT){const txt='Acompanhar contacto ('+o.meio.toLowerCase()+') sobre '+nm+(o.assunto?': '+o.assunto:'')+(o.compromisso?' — '+o.compromisso:'');if(tk){tk.t=txt;tk.prazo=o.acomp}else{tk={id:uid(),t:txt,prazo:o.acomp,feito:false,criada:Date.now(),orig:al?{tipo:'contactoEE',cid:al.x.cid,cont:o.id}:{tipo:'contactoDT',turma:n,cont:o.id}};T_.push(tk)}o.tarefa=tk.id}
    else if(tk&&!tk.feito){T_.splice(T_.indexOf(tk),1);delete o.tarefa}
    const L=lista();if(!ed)L.push(o);L.sort((p,r)=>(r.data||'').localeCompare(p.data||''));save();audit('Direção de Turma',ed?'Contacto editado':'Contacto registado',(al?al.x.nome:'Turma '+n)+' · '+o.meio+' · '+o.data);closeDrawer();toast('Contacto registado'+(querT?' · tarefa para '+fmtIso(o.acomp):''),'ok');depois&&depois()}}
function rcCorpo(a,n,AL){const L=rcLista(a,n,AL);const F=UI.rcF=UI.rcF||{m:'',al:'',q:''};const q=normT(F.q||'');
  const LL=L.filter(z=>(!F.m||z.c.meio===F.m)&&(!F.al||(F.al==='_g'?!z.o:z.o&&z.o.x.cid===F.al))&&(!q||normT([z.c.assunto,z.c.sintese,z.c.quem,z.o&&z.o.x.nome,z.nomeAl].join(' ')).includes(q)));
  const cnt=m=>L.filter(z=>z.c.meio===m).length;const desde=isoData(new Date(Date.now()-60*864e5));const sem=AL.filter(o=>!L.some(z=>z.o===o&&(z.c.data||'')>=desde));
  return `<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('phone',18)} Registo de Contactos</h2><span class="sp1"></span><button class="btn" id="rc-csv">${ic('download',15)} Exportar (CSV)</button><button class="btn pri" id="rc-novo">${ic('plus',15)} Registar Contacto</button></div>
    <p class="hint">Chamadas, e-mails, reuniões e contactos presenciais com os encarregados de educação e outros intervenientes. Os contactos de cada aluno aparecem também no Dossiê e na Ficha Integral; os atendimentos registados continuam a contar.</p>
    <div class="rckp"><button type="button" data-rcfm="" class="${!F.m?'on':''}"><b>${L.length}</b><span>Todos</span></button>${MEIOS_EE.filter(m=>cnt(m)||['Telefone','E-mail','Reunião','Presencial'].includes(m)).map(m=>`<button type="button" data-rcfm="${esc(m)}" class="${F.m===m?'on':''}">${ic(RC_IC[m]||'chat',15)}<b>${cnt(m)}</b><span>${esc(m)}</span></button>`).join('')}</div>
    <div class="row rcfl"><select id="rc-fal" aria-label="Filtrar por aluno"><option value="">Todos os alunos</option><option value="_g" ${F.al==='_g'?'selected':''}>Contactos gerais da turma</option>${AL.map(o=>`<option value="${esc(o.x.cid)}" ${F.al===o.x.cid?'selected':''}>${esc(numAl(o.x))}. ${esc(o.x.nome)}</option>`).join('')}</select><input id="rc-fq" type="search" placeholder="Procurar assunto, síntese…" value="${esc(F.q||'')}"></div></div>
    ${sem.length?`<div class="card rcsem"><b>${ic('clock',15)} Sem contactos nos últimos 60 dias (${sem.length})</b><div>${sem.map(o=>`<button type="button" class="tag" data-rcna="${esc(o.x.cid)}" title="Registar contacto">${esc(numAl(o.x))}. ${esc(o.x.nome.split(' ')[0])} ${esc(o.x.nome.split(' ').slice(-1)[0]===o.x.nome.split(' ')[0]?'':o.x.nome.split(' ').slice(-1)[0])}</button>`).join('')}</div></div>`:''}
    <div class="card rcl">${LL.map((z,k)=>{const c=z.c;const al=z.o?z.o.x:null;return `<article class="rci"><span class="rcic" title="${esc(c.meio||'')}">${ic(RC_IC[c.meio]||'chat',18)}</span><div class="rcb"><header><b>${esc(fmtIsoL(c.data))}${c.hora?' · '+esc(c.hora):''}</b><span class="tag">${esc(c.meio||'')}</span>${c.sentido==='rec'?'<span class="tag">recebido</span>':''}${z.src==='at'?'<span class="tag">atendimento</span>':''}<span class="sp1"></span>${z.src!=='at'?`<button class="btn sm ico" data-rced="${k}" aria-label="Editar">${ic('pencil',13)}</button>`:''}</header>
      <div class="rcw"><b>${al?esc(numAl(al))+'. '+esc(al.nome):esc(z.nomeAl||'Turma '+n)}</b>${c.quem?` <span class="mut">com ${esc(c.quem)}</span>`:''}${c.assunto?` · <b>${esc(c.assunto)}</b>`:''}</div>${c.sintese?`<p>${esc(c.sintese)}</p>`:''}${c.compromisso?`<p class="dscm">${ic('check',12)} ${esc(c.compromisso)}</p>`:''}${c.acomp?`<p class="mut">${ic('clock',12)} Acompanhar em ${esc(fmtIso(c.acomp))}</p>`:''}${c.autor&&c.autor!==S.cfg.professor?`<small class="mut">${esc(profNome(c.autor))}${c.disc&&c.disc!=='Direção de Turma'?' · '+esc(c.disc):''}</small>`:''}</div></article>`}).join('')||'<p class="mut" style="margin:0">Sem contactos registados'+(F.m||F.al||F.q?' com este filtro':'')+'.</p>'}</div>`}
{const _vDrc=vDirecao;vDirecao=function(){const r=_vDrc.apply(this,arguments);try{if((UI.dtTab||'painel')==='regc'){const a=A();const L=minhasDT(a);const n=UI.dtT;if(!a||!L.includes(n))return r;const AL=alunosDaClasse(a,n);const v=$('#view');const hd=v.querySelector('.dthead');if(!hd)return r;while(hd.nextSibling)hd.nextSibling.remove();hd.insertAdjacentHTML('afterend',rcCorpo(a,n,AL));
    const re=()=>vDirecao();const LL=()=>{const F=UI.rcF;const q=normT(F.q||'');return rcLista(a,n,AL).filter(z=>(!F.m||z.c.meio===F.m)&&(!F.al||(F.al==='_g'?!z.o:z.o&&z.o.x.cid===F.al))&&(!q||normT([z.c.assunto,z.c.sintese,z.c.quem,z.o&&z.o.x.nome,z.nomeAl].join(' ')).includes(q)))};
    $('#rc-novo').onclick=()=>rcDlg(a,n,AL,null,re);
    $$('#view [data-rcfm]').forEach(b=>b.onclick=()=>{UI.rcF.m=b.dataset.rcfm;re()});
    $('#rc-fal').onchange=e=>{UI.rcF.al=e.target.value;re()};
    const fq=$('#rc-fq');fq.oninput=()=>{UI.rcF.q=fq.value;clearTimeout(rcCorpo._t);rcCorpo._t=setTimeout(()=>{re();const z=$('#rc-fq');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},250)};
    $$('#view [data-rced]').forEach(b=>b.onclick=()=>{const z=LL()[+b.dataset.rced];if(z)rcDlg(a,n,AL,z,re)});
    $$('#view [data-rcna]').forEach(b=>b.onclick=()=>{rcDlg(a,n,AL,null,re);const s=$('#rc-al');if(s){s.value=b.dataset.rcna;s.onchange&&s.onchange()}});
    $('#rc-csv').onclick=()=>{const q_=v_=>'"'+String(v_==null?'':v_).replace(/"/g,'""')+'"';const rows=[['Data','Hora','Meio','Sentido','Aluno','Com quem','Assunto','Síntese','Compromisso','Acompanhar em'],...LL().map(z=>[z.c.data,z.c.hora||'',z.c.meio||'',z.c.sentido==='rec'?'Recebido':'Efetuado',z.o?z.o.x.nome:(z.nomeAl||'Turma '+n),z.c.quem||'',z.c.assunto||'',z.c.sintese||'',z.c.compromisso||'',z.c.acomp||''])];
      const b_=new Blob(['﻿'+rows.map(r_=>r_.map(q_).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(b_);const l=document.createElement('a');l.href=u;l.download='Registo de contactos '+n.replace(/[\\/:*?"<>|]/g,'')+'.csv';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);audit('Direção de Turma','Exportação do registo de contactos',n)}}}catch(e){console.warn(e)}return r};if(go._f)go._f.direcao=vDirecao}
{const _hRc=historicoDT;historicoDT=function(a,n,AL){const H=_hRc.apply(this,arguments)||[];try{const D=dtDados(a,n);(D.contGerais||[]).forEach(c=>H.push({data:c.data,tipo:'Contacto ('+(c.meio||'')+')',desc:'Turma · '+(c.assunto||c.sintese||'')}));H.sort((x,y)=>String(y.data).localeCompare(String(x.data)))}catch(_){}return H}}
/*V0990-INI*/
/* ===================== v0.990 · separadores do topo alinhados com o conteúdo que vem por baixo (ecrãs largos) ===================== */
function alinharTabsTopo(){const v=document.getElementById('view');if(!v)return;const t=v.querySelector(':scope>.tabs,:scope>.deftabs');if(!t)return;t.style.removeProperty('margin-left');
  const n=t.nextElementSibling;if(!n||!n.matches('.vlay,.card,.kpis,.mtlay,.inlay,.anv,.cmw'))return;const vr=v.getBoundingClientRect(),nr=n.getBoundingClientRect();if(!nr.width)return;
  const d=nr.left-vr.left-(parseFloat(getComputedStyle(v).paddingLeft)||0);t.style.setProperty('margin-left',Math.max(0,Math.round(d))+'px','important')}
{let _at=0;const q=()=>{cancelAnimationFrame(_at);_at=requestAnimationFrame(()=>{try{alinharTabsTopo()}catch(_){}})};const v=document.getElementById('view');if(v)new MutationObserver(q).observe(v,{childList:true});addEventListener('resize',q)}
/* v0.990 · desempenho: o alinhamento do cabeçalho junta as chamadas repetidas num só cálculo e não se repete se nada mudou */
{const assin=()=>{const b=document.getElementById('bar');if(!b)return '';return b.clientWidth+'|'+b.textContent.length+'|'+b.querySelectorAll('button:not([hidden])').length+'|'+document.body.classList.contains('dev-pc')};
  const _alb=alinharBar;let ka='',fila=0;const kAl=()=>{const v=document.getElementById('view');const f=v&&v.firstElementChild;return VIEW+'|'+(v?v.clientWidth:0)+'|'+(v?v.children.length:0)+'|'+(f?f.className:'')+'|'+assin()};
  alinharBar=function(){if(fila)return;fila=requestAnimationFrame(()=>{fila=0;const k=kAl();if(k===ka)return;try{_alb()}catch(e){console.warn(e)}ka=kAl()})}}
/* v0.992 · Produção Oral: organização individual / pares / grupos, formação pelo sorteio (aleatória ou equilibrada pela nota da PO) e guiões A/B */
function oralOrg(o){o.orgI=o.orgI||{};const k=oralKey(o)||'_proprio';const g=o.orgI[k]=o.orgI[k]||{};if(!g.modo)g.modo='ind';if(!(g.n>=3))g.n=3;if(!g.form)g.form='aleat';if(!g.gui)g.gui='aleat';return g}
/* nota de referência para equilibrar: média do domínio da oralidade nos períodos já avaliados; se não houver, média dos outros momentos orais */
function oralNotaRef(t,aid){const d=domOral(t);let v=[];if(d)for(let p=1;p<=4;p++){const x=domPer(t,aid,d.id,p);if(x!=null)v.push(x)}
  if(!v.length){const o=oralM(t);const k0=oralKey(o);oralMomentos(t).forEach(m=>{if(m.k===k0)return;const tt=oralTotK(t,m.k,aid);const c=oralCfgDe(o,m.k);if(tt&&tt.completo&&c.total)v.push(100*tt.pts/c.total)})}
  return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
const _bar=A=>{const B=A.slice();for(let i=B.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[B[i],B[j]]=[B[j],B[i]]}return B};
/* formação equilibrada: ordena pela nota e divide em faixas (boas → fracas); cada par/grupo leva um aluno de cada faixa */
function oralEquilibrar(t,AL,n){const com=AL.map(a=>({a,v:oralNotaRef(t,a.id)}));const sem=_bar(com.filter(x=>x.v==null)).map(x=>x.a);
  const ord=_bar(com.filter(x=>x.v!=null)).sort((x,y)=>y.v-x.v).map(x=>x.a);const mid=Math.floor(ord.length/2);const L=[...ord.slice(0,mid),...sem,...ord.slice(mid)];
  const k=Math.max(1,Math.floor(L.length/n));const G=Array.from({length:k},()=>[]);
  for(let b=0;b<n;b++){const faixa=_bar(L.slice(b*k,b*k+k));faixa.forEach((a,i)=>G[i].push(a))}
  const resto=L.slice(n*k);resto.forEach((a,i)=>G[(Math.floor(k/2)+i)%k].push(a));return G}
/* guiões: em cada par/grupo, um A e um B (alternados, ao acaso); individual: metade A, metade B */
function oralGuioes(G){const m={};G.forEach(g=>{const ab=_bar(['A','B']);_bar(g).forEach((a,i)=>m[a.id]=ab[i%2])});/* no resultado, sempre do A para o B */G.forEach(g=>g.sort((x,y)=>(m[x.id]||'').localeCompare(m[y.id]||'')));return m}
function oralAplicar(t,o,org,G,gui){G.forEach((g,i)=>g.forEach(a=>{const r=o.regs[a.id]=o.regs[a.id]||{n:{}};r.p=i+1;/* o colega de par (indicador por baixo do nome) */if(g.length===2)r.par=g.find(x=>x!==a).id;else delete r.par}));if(gui)Object.entries(gui).forEach(([aid,g])=>{const r=o.regs[aid]=o.regs[aid]||{n:{}};r.g=g});save()}
function oralOrgCard(t,o,org,al){const seg=(nm,k,ops)=>`<div class="seg" role="group" aria-label="${nm}">${ops.map(([v,l])=>`<button type="button" data-oo="${k}|${v}" class="${org[k]===v?'on':''}">${l}</button>`).join('')}</div>`;
  const ind=org.modo==='ind';const nomeG=org.modo==='par'?'pares':'grupos';const temNotas=al.some(a=>oralNotaRef(t,a.id)!=null);const ng=new Set(al.map(a=>(o.regs[a.id]||{}).p).filter(Boolean)).size;
  return `<div class="card ororg"><div class="row" style="flex-wrap:wrap;gap:10px;align-items:center"><h2 style="margin:0">${ic('users',18)} Organização</h2><span class="tag">A classificação é sempre individual</span><span class="sp1"></span>${seg('Modalidade','modo',[['ind','Individual'],['par','Pares'],['grp','Grupos']])}${org.modo==='grp'?`<label class="mut" style="margin:0">de <input type="number" id="oo-n" min="3" max="8" value="${org.n}" style="width:60px" inputmode="numeric" aria-label="Alunos por grupo"> alunos</label>`:''}</div>
    <div class="ororgl">${ind?'':`<div><span class="oolab">Formação dos ${nomeG}</span>${seg('Formação','form',[['aleat','Aleatória'],['equil','Equilibrada pela nota da PO'],['manual','Manual']])}</div>`}
      <div><span class="oolab">Guiões A/B</span>${seg('Guiões','gui',[['aleat','Ao acaso'],['manual','Manual']])}</div></div>
    ${!ind&&org.form==='equil'?`<p class="hint">${temNotas?'Cada '+(org.modo==='par'?'par junta':'grupo junta')+' alunos com notas mais altas e mais baixas na Produção Oral (média dos períodos já avaliados).':'Ainda não há notas de Produção Oral: a formação fica aleatória até haver avaliações.'}</p>`:''}
    ${!ind&&org.form==='manual'?`<p class="hint">Escreva o número do ${org.modo==='par'?'par':'grupo'} de cada aluno na coluna «${org.modo==='par'?'Par':'Grupo'}» da ficha.</p>`:''}
    ${org.gui==='manual'?`<p class="hint">Escreva A ou B na coluna «Guião» da ficha.</p>`:`<p class="hint">Guiões ao acaso: ${ind?'metade da turma com o A e metade com o B':'em cada '+(org.modo==='par'?'par':'grupo')+' há um A e um B'}, sorteados com ${ind?'o botão abaixo':'os '+(org.modo==='par'?'pares':'grupos')}.</p>`}
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">${!ind&&org.form!=='manual'?`<button type="button" class="btn pri" id="oo-sort">${ic('refresh',15)} Sortear ${nomeG} na roda</button><button type="button" class="btn" id="oo-rap">Formar sem animação</button>`:''}
      ${org.gui==='aleat'?`<button type="button" class="btn" id="oo-gui">${ic('refresh',15)} Sortear guiões${ind?'':' (nos '+nomeG+' atuais)'}</button>`:''}
      ${!ind&&ng?`<button type="button" class="btn" id="oo-lim">${ic('x',14)} Limpar ${nomeG}</button><span class="mut" style="align-self:center">${ng} ${ng===1?(org.modo==='par'?'par':'grupo'):nomeG} formado${ng===1?'':'s'}</span>`:''}</div></div>`}
function oralGruposAtuais(o,al){const M={};al.forEach(a=>{const p=(o.regs[a.id]||{}).p;if(p)(M[p]=M[p]||[]).push(a)});return Object.keys(M).sort((a,b)=>a-b).map(k=>M[k])}
function oralOrgLigar(t,o,org,al,re){
  $$('[data-oo]').forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.oo.split('|');/* de Manual para Aleatória/Equilibrada: os pares feitos à mão são limpos */if(k==='form'&&org.form==='manual'&&v!=='manual'){let n=0;al.forEach(a=>{const x=o.regs[a.id];if(x&&(x.p||x.par)){delete x.p;delete x.par;n++}});if(n)toast((org.modo==='par'?'Pares':'Grupos')+' manuais limpos','ok')}org[k]=v;save();re()});
  const nn=$('#oo-n');if(nn)nn.onchange=()=>{org.n=Math.max(3,Math.min(8,+nn.value||3));save();re()};
  const n=org.modo==='par'?2:org.n;const formar=AL=>org.form==='equil'?oralEquilibrar(t,AL,n):rodaPartir(AL,n);
  const AV=()=>alunosAval(t).filter(a=>al.some(x=>x.id===a.id));
  const s=$('#oo-sort');if(s)s.onclick=()=>{let gui=null;rodaAbrir(t,AV().map(a=>a.id),{modo:org.modo==='par'?'pares':'grupos',n,formar,
      depois:G=>{gui=org.gui==='aleat'?oralGuioes(G):null},etiqueta:a=>gui&&gui[a.id]?`<em class="rdgu">Guião ${gui[a.id]}</em>`:'',
      destino:{t:'Usar na Produção Oral',fn:G=>{oralAplicar(t,o,org,G,gui);toast((org.modo==='par'?'Pares':'Grupos')+' guardados na ficha','ok');re()}}})};
  const r=$('#oo-rap');if(r)r.onclick=()=>{const G=formar(AV());oralAplicar(t,o,org,G,org.gui==='aleat'?oralGuioes(G):null);toast((org.modo==='par'?'Pares formados':'Grupos formados')+(org.gui==='aleat'?' e guiões sorteados':''),'ok');re()};
  const g=$('#oo-gui');if(g)g.onclick=()=>{const G=org.modo==='ind'?al.map(a=>[a]):oralGruposAtuais(o,al);if(!G.length)return toast('Forme primeiro os '+(org.modo==='par'?'pares':'grupos'),'aviso');
    let m;if(org.modo==='ind'){const ab=_bar(al).map((a,i)=>[a.id,i%2?'B':'A']);m=Object.fromEntries(ab)}else m=oralGuioes(G);oralAplicar(t,o,org,[],m);toast('Guiões sorteados','ok');re()};
  const l=$('#oo-lim');if(l)l.onclick=()=>{if(!confirm('Limpar os '+(org.modo==='par'?'pares':'grupos')+' deste momento? As classificações ficam.'))return;al.forEach(a=>{const x=o.regs[a.id];if(x){delete x.p;delete x.par}});save();re()};
  $$('[data-orp]').forEach(i=>i.onchange=()=>{const x=o.regs[i.dataset.orp]=o.regs[i.dataset.orp]||{n:{}};const v=parseInt(i.value,10);if(v>0)x.p=v;else delete x.p;save()});
  $$('[data-org]').forEach(i=>i.addEventListener('input',()=>{i.value=i.value.toUpperCase()}))}

/* v0.995 · Contactos: a barra das listas pode encolher (fica só com os ícones) */
function cmSbAplicar(){const w=document.getElementById('cm-w');if(!w)return;const sb=w.querySelector('.cmsb');if(!sb)return;
  const col=!!(S.cfg&&S.cfg.cmSbCol);w.classList.toggle('sbcol',col);
  sb.querySelectorAll('.cmli').forEach(b=>{if(!b.title){const sp=b.querySelector('span');if(sp)b.title=sp.textContent.trim()}});
  let t=sb.querySelector('.cmsbt');if(!t){t=document.createElement('button');t.type='button';t.className='cmsbt';sb.prepend(t);
    t.onclick=()=>{S.cfg=S.cfg||{};S.cfg.cmSbCol=!S.cfg.cmSbCol;try{save()}catch(_){}cmSbAplicar()}}
  t.innerHTML=ic('back',14)+(col?'':'<span>Encolher</span>');t.title=col?'Mostrar as listas':'Encolher a barra das listas';t.setAttribute('aria-label',t.title);t.setAttribute('aria-expanded',String(!col))}
{let _cmQ=0;new MutationObserver(()=>{if(_cmQ)return;_cmQ=requestAnimationFrame(()=>{_cmQ=0;const w=document.getElementById('cm-w');if(w&&(!w.querySelector('.cmsbt')||w.classList.contains('sbcol')!==!!(S.cfg&&S.cfg.cmSbCol)))cmSbAplicar()})}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true})}
/*V0990-FIM*/
/*V0996-INI*/
/* v0.996 · Coord. PROFIJ › Distribuição e Horários
   Simulação tempo a tempo (45 min) do ano da turma, com:
   · contagem global por professor (um professor com várias disciplinas/UFCD: quando uma acaba, os tempos dela passam para as outras dele);
   · cedência de tempos (ex.: quando TIC acaba, os tempos de TIC passam para Inglês), com data ou «quando acabar»;
   · tempos livres (de quem já acabou) entregues a quem está atrasado;
   · substituição de professor a partir de uma data; data de fim manual ou automática;
   · horários semanais com datas (alterações só nessa semana) e contagem do que falta;
   · exportação: cronogramas por professor, horários semanais, matriz com distribuição de serviço e horário original. */
const CPD_DS=[1,2,3,4,5];
const cpdSeg=iso=>{const d=dataDeIso(iso);const w=d.getDay();d.setDate(d.getDate()-((w+6)%7));return isoData(d)};
const cpdMais=(iso,n)=>{const d=dataDeIso(iso);d.setDate(d.getDate()+n);return isoData(d)};
const cpdHm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const cpdDM=iso=>{const p=iso.split('-');return p[2]+'/'+p[1]};
const cpdSk=x=>x.dia+'|'+x.ini;
function cpdProfEm(d,iso){let p=d.prof||'';(d.subs||[]).slice().sort((x,y)=>x.desde.localeCompare(y.desde)).forEach(s=>{if(s.desde&&s.desde<=iso&&s.prof)p=s.prof});return (p||'Sem professor').trim()}
const cpdProfs=d=>{const L=[(d.prof||'Sem professor').trim()];(d.subs||[]).forEach(s=>{if(s.prof&&!L.includes(s.prof.trim()))L.push(s.prof.trim())});return L};
const cpdCurto=d=>{const s=(d.sig||[])[0];return d.comp==='tecnologica'&&d.det?d.det:(s&&normSig(s)!=='ufcd'?s:d.nome.replace(/^UFCD\s*/i,'').slice(0,18))};
/* opt.ini: simular desde o início do ano sem pontos de situação (planeamento inicial) */
function cpdSim(a,nome,opt){opt=opt||{};const M=cpmM(nome),L=cpmLimites(a,M),c=CAL(),h=horarioDe(a,nome);const hoje=isoHoje();
  const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const need={},done={},fim={},log=[],livres=[];D.forEach(d=>{need[d.id]=cpmAulas(d.horas);done[d.id]=0});
  const P0=opt.ini?null:(M.pontos||[]).filter(p=>p.data<=hoje).sort((x,y)=>x.data.localeCompare(y.data)).pop()||null;
  let desde=L.ini;if(P0){desde=cpdMais(P0.data,1);D.forEach(d=>{const v=P0.dadas&&P0.dadas[d.id];if(v!=null&&v!=='')done[d.id]=+v})}
  if(!opt.ini)D.forEach(d=>{done[d.id]+=+d.aj||0});
  D.forEach(d=>{if(done[d.id]>=need[d.id])fim[d.id]='feito'});
  const aulas=h?h.aulas.slice().sort((x,y)=>x.dia-y.dia||x.ini-y.ini):[];
  const base=x=>{const k=normSig(x.ab);return D.filter(d=>(d.sig||[]).some(s=>normSig(s)===k))};
  const R=opt.ini?[]:(M.reat||[]).filter(r=>r.destino);const SEM=opt.ini?{}:M.sem||{};const pool=M.pool!==false;
  const aberta=id=>id&&need[id]!=null&&done[id]<need[id];
  let manAplic=!!opt.ini;
  for(let iso=L.ini;iso<=L.fim;iso=cpdMais(iso,1)){
    if(!manAplic&&iso>=hoje){D.forEach(d=>{if(d.dadas!=null&&d.dadas!==''){done[d.id]=+d.dadas;if(done[d.id]>=need[d.id]&&!fim[d.id])fim[d.id]='feito'}});manAplic=true}
    if(iso<desde)continue;
    const t=cpmTipo(iso,M,L,c);if(t!=='let')continue;const w=dataDeIso(iso).getDay();const wk=SEM[cpdSeg(iso)]||{};
    aulas.filter(x=>x.dia===w).forEach(x=>{const sk=cpdSk(x);const B=base(x);if(!B.length&&wk[sk]==null)return;
      let id=null,via='horario';
      if(wk[sk]!=null&&wk[sk]!==''){id=wk[sk]==='livre'?null:wk[sk];via='semana';if(id&&!aberta(id))id=null}
      else{const B0=B.find(d=>aberta(d.id))||null;const dono=B[B.length-1];
        for(const r of R){if(r.desde&&iso<r.desde)continue;if(r.ate&&iso>r.ate)continue;if(!aberta(r.destino))continue;
          if(r.origem==='*'){continue}
          if(!B.some(d=>d.id===r.origem))continue;if(r.quando==='fim'&&aberta(r.origem))continue;id=r.destino;via='cedido';break}
        if(!id&&B0)id=B0.id;
        if(!id&&pool){const pr=cpdProfEm(dono,iso);const o=D.find(d=>aberta(d.id)&&cpdProfEm(d,iso)===pr);if(o){id=o.id;via='professor'}}
        if(!id){for(const r of R){if(r.origem!=='*')continue;if(r.desde&&iso<r.desde)continue;if(r.ate&&iso>r.ate)continue;if(aberta(r.destino)){id=r.destino;via='livre';break}}}}
      if(!id){livres.push({iso,sk,x});log.push({iso,sk,id:null,via:'livre'});return}
      done[id]++;const d=D.find(z=>z.id===id);log.push({iso,sk,id,n:done[id],via,prof:cpdProfEm(d,iso)});if(done[id]>=need[id]&&!fim[id])fim[id]=iso})}
  /* por professor: total global de tempos (todas as disciplinas e UFCD dele) */
  const P={};D.forEach(d=>{const pr=cpdProfEm(d,L.fim);const p=P[pr]=P[pr]||{nome:pr,disc:[],need:0,done:0,fim:'',falta:0};p.disc.push(d);p.need+=need[d.id];p.done+=Math.min(done[d.id],need[d.id]);p.falta+=Math.max(0,need[d.id]-done[d.id])});
  Object.values(P).forEach(p=>{p.fim=p.falta?'':p.disc.map(d=>fim[d.id]).filter(f=>f&&f!=='feito').sort().pop()||'feito'});
  const tot=D.reduce((s,d)=>s+Math.max(0,need[d.id]-done[d.id]),0);const fins=D.map(d=>fim[d.id]).filter(f=>f&&f!=='feito').sort();
  /* tempos que ainda faltam a cada um, semana a semana (para os horários semanais) */
  const dh={};D.forEach(d=>dh[d.id]=done[d.id]);log.forEach(e=>{if(e.id&&e.iso>hoje)dh[e.id]--});Object.values(P).forEach(p=>{p.dh=p.disc.reduce((s,d)=>s+Math.min(Math.max(0,dh[d.id]),need[d.id]),0)});
  return {M,L,c,h,D,need,done,dh,fim,log,livres,P,P0,aulas,turmaFim:tot?'':(fins.pop()||'feito'),falta:tot,hoje}}
/* contagem no fim de cada dia (para os horários semanais: «faltam X» no fim da semana) */
function cpdAte(S_,iso){const n={};S_.D.forEach(d=>n[d.id]=0);let ini={};S_.D.forEach(d=>ini[d.id]=S_.done[d.id]);
  /* parte do total final e desconta o que foi dado depois de iso */
  S_.log.forEach(e=>{if(e.id&&e.iso>iso)ini[e.id]--});return ini}
function cpdSemanasFalta(S_,iso){const n=S_.L.fim>iso?Math.max(1,Math.ceil((dataDeIso(S_.L.fim)-dataDeIso(iso))/(7*864e5))):1;return n}
/* ---------- vista ---------- */
function cpdHTML(a,C,vista){const N=cpmNomes(a,C);if(!N.length)return cpmMatrizHTML(a,C);const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;
  const M=cpmM(nome);const modo=UI.cpdModo||'atual';const S_=cpdSim(a,nome,{ini:modo==='ini'});const S0=modo==='ini'?S_:cpdSim(a,nome,{ini:true});
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  if(!S_.h)return sel+`<section class="card empty">${ic('calendar',28)}<br><b>Falta o horário da turma</b><br><span class="mut">Importe o horário da turma (PDF ou Excel) em «Matriz e Ponto de Situação» para simular os tempos de cada professor.</span></section>`;
  if(!S_.D.length)return sel+`<section class="card empty">${ic('grid',28)}<br><b>A matriz ainda não tem horas</b><br><span class="mut">Preencha as horas das disciplinas e UFCD em «Matriz e Ponto de Situação».</span></section>`;
  const FD=f=>f==='feito'?'<span class="tag ok">concluída</span>':f?fmtIsoL(f):'<span class="neg">não acaba</span>';
  const sem=cpdSemanasFalta(S_,S_.hoje>S_.L.ini?S_.hoje:S_.L.ini);
  const fct=M.fct||{};
  const glob=`<section class="card cpd-g"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:260px"><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div>
      <div class="mut">${fmtIsoL(S_.L.ini)} a ${fmtIsoL(S_.L.fim)} · ${S_.aulas.length} tempos por semana no horário${S_.P0&&modo!=='ini'?` · desde o ponto de situação de ${fmtIsoL(S_.P0.data)}`:''}</div></div>
      <div class="cpd-seg noprint" role="group" aria-label="Simulação"><button type="button" data-cpdm="atual" class="${modo!=='ini'?'on':''}">Situação atual</button><button type="button" data-cpdm="ini" class="${modo==='ini'?'on':''}">Planeamento inicial</button></div></div>
    <div class="cpm-kp"><div class="${S_.falta?'bad':''}"><small>A turma acaba</small><b>${S_.turmaFim==='feito'?'concluída':S_.turmaFim?fmtIsoL(S_.turmaFim):'não acaba'}</b>${S_.falta?`<small class="neg">faltam ${S_.falta} tempos a ${fmtIsoL(S_.L.fim)}</small>`:''}</div>
      <div><small>Planeamento inicial</small><b>${S0.turmaFim==='feito'?'—':S0.turmaFim?fmtIsoL(S0.turmaFim):'não acaba'}</b></div>
      <div><small>Tempos livres até ao fim</small><b>${S_.livres.filter(l=>l.iso>=S_.hoje).length}</b><small>de quem já acabou</small></div>
      <div class="${fct.ini&&fct.fim?'':'w'}"><small>FPCT</small><b>${fct.ini&&fct.fim?cpdDM(fct.ini)+' a '+cpdDM(fct.fim):'por marcar'}</b>${fct.horas?`<small>${cpmCalc(a,nome).fctH} h de ${fct.horas} h</small>`:''}</div></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm" id="cpd-ced">${ic('repeat',14)} Ceder Tempos</button><button class="btn sm" id="cpd-sub">${ic('user',14)} Substituir Professor(a)</button><button class="btn sm" id="cpm-fct">${ic('building',14)} Período da FPCT</button>
      <label class="chk" style="margin:0 6px"><input type="checkbox" id="cpd-pool" ${M.pool!==false?'checked':''}> <span>Quando uma disciplina acaba, os tempos passam para as outras do mesmo professor</span></label>
      <span class="sp1"></span><button class="btn sm" id="cpd-x-cron">${ic('download',14)} Cronogramas</button><button class="btn sm" id="cpd-x-sem">${ic('calendar',14)} Horários Semanais</button><button class="btn sm pri" id="cpd-x-mat">${ic('printer',14)} Matriz e Distribuição de Serviço</button></div></section>`;
  /* professores (contagem global) */
  const PR=Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
  const prof=`<section class="card"><h2 style="margin:0 0 8px">${ic('users',18)} Professores — Contagem Global</h2><div class="cpm-tw"><table class="lst cpd-t"><thead><tr><th>Professor(a)</th><th>Disciplinas e UFCD</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Acaba</th><th>Plano inicial</th><th class="noprint">Simulação</th></tr></thead><tbody>${PR.map(p=>{const p0=S0.P[p.nome];
      const pre=p.falta?Math.ceil(p.falta/sem):0;const lv=S_.livres.filter(l=>l.iso>=S_.hoje).length;
      return `<tr class="${p.falta?'bad':''}"><td><b>${esc(p.nome)}</b></td><td><small>${p.disc.map(d=>`${esc(d.nome)} <span class="mut">(${S_.need[d.id]})</span>`).join(' + ')}</small></td><td class="n"><b>${p.need}</b></td><td class="n">${p.dh}</td><td class="n ${p.falta?'neg':'mut'}">${p.falta}</td><td>${FD(p.fim)}</td><td>${p0?FD(p0.fim):'—'}</td>
        <td class="noprint">${p.falta?`<small>precisa de mais ${pre} tempo(s) por semana${lv?` · há ${lv} livre(s)`:''}</small> <button class="btn sm" data-cpdlv="${esc(p.nome)}">${ic('plus',13)} Dar Tempos Livres</button>`:`<small class="mut">${p.fim==='feito'?'concluído':'chega ao fim'}</small>`}</td></tr>`}).join('')}</tbody></table></div>
    <p class="hint">Cada professor conta a totalidade dos tempos (45 min) de todas as suas disciplinas e UFCD. Quando uma acaba, os tempos dela continuam com as outras do mesmo professor (se a opção acima estiver ligada).</p></section>`;
  /* disciplinas */
  const disc=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('grid',18)} Disciplinas e UFCD</h2><span class="sp1"></span>${S_.D.some(cpdMinha)?`<button class="btn sm noprint" id="cpd-my">${ic('user',14)} Criar as Minhas no Modo Professor</button>`:''}</div><p class="hint" style="margin:4px 0 8px">Assinale na coluna «Eu» as disciplinas e UFCD que leciona: essas passam para o modo professor (avaliação, sumários); o resto fica só na coordenação.</p><div class="cpm-tw"><table class="lst cpd-t"><thead><tr><th>Disciplina / UFCD</th><th>Professor(a)</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Fim previsto</th><th>Fim marcado</th><th class="noprint" title="Disciplinas que eu leciono (passam para o modo professor)">Eu</th><th class="noprint"></th></tr></thead><tbody>${S_.D.map(d=>{const f=S_.fim[d.id];const fa=Math.max(0,S_.need[d.id]-S_.done[d.id]);const atr=d.fimMan&&f&&f!=='feito'&&f>d.fimMan;
      return `<tr class="${fa?'bad':atr?'w':''}"><td><b>${esc(d.nome)}</b>${d.det?` <span class="mut">${esc(d.det)}</span>`:''}</td><td>${esc(d.prof||'—')}${(d.subs||[]).map(s=>`<div class="hint">→ ${esc(s.prof)} desde ${cpdDM(s.desde)}</div>`).join('')}</td><td class="n">${S_.need[d.id]}</td><td class="n">${Math.min(Math.max(0,S_.dh[d.id]),S_.need[d.id])}</td><td class="n ${fa?'neg':'mut'}">${fa}</td><td>${FD(f)}</td>
        <td class="noprint"><input type="date" class="cpd-fm" data-cpdfm="${d.id}" value="${esc(d.fimMan||'')}" title="Data de fim marcada à mão (deixe vazio para automática)">${atr?`<div class="hint neg">a previsão passa a data marcada</div>`:''}</td><td class="noprint"><input type="checkbox" data-cpdmy="${d.id}" ${cpdMinha(d)?'checked':''} aria-label="Eu leciono ${esc(d.nome)}"></td><td class="noprint"><button class="btn sm ghost" data-cpdsub="${d.id}" title="Substituir professor a partir de uma data">${ic('user',14)}</button></td></tr>`}).join('')}</tbody></table></div></section>`;
  /* cedências */
  const RE=(M.reat||[]);const dn=id=>{const d=M.disc.find(x=>x.id===id);return d?d.nome:'—'};
  const ced=`<section class="card"><div class="row"><h2 style="margin:0">${ic('repeat',18)} Cedências de Tempos</h2><span class="sp1"></span><button class="btn sm noprint" id="cpd-ced2">${ic('plus',14)} Nova</button></div>
    ${RE.length?`<ul class="cpd-rl">${RE.map(r=>`<li><span>${r.origem==='*'?'<b>Tempos livres</b>':`Tempos de <b>${esc(dn(r.origem))}</b>`} → <b>${esc(dn(r.destino))}</b> <span class="mut">${r.quando==='fim'&&r.origem!=='*'?'quando acabar':''}${r.desde?' desde '+fmtIsoL(r.desde):''}${r.ate?' até '+fmtIsoL(r.ate):''}</span></span><button class="btn sm ghost noprint" data-cpdrx="${r.id}" title="Apagar">${ic('trash',13)}</button></li>`).join('')}</ul>`:`<p class="mut" style="margin:8px 0 0">Ex.: quando TIC acabar, os tempos de TIC passam para Inglês. A app recalcula logo a nova data de fim de cada um.</p>`}</section>`;
  if(vista==='equipa'){const eq=`<section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} Equipa Pedagógica · ${esc(nome)}</h2><span class="sp1"></span><button class="btn sm" id="cpd-sub">${ic('user',14)} Substituir Professor(a)</button><button class="btn sm pri" id="cpd-x-mat">${ic('printer',14)} Matriz e Distribuição de Serviço</button></div><p class="hint" style="margin:6px 0 0">Quem leciona cada disciplina e UFCD, a contagem global de tempos de cada professor e quando acaba no planeamento inicial. Assinale na coluna «Eu» o que leciona (passa para o modo professor).</p>
      <label class="chk" style="margin:8px 0 0"><input type="checkbox" id="cpd-pool" ${M.pool!==false?'checked':''}> <span>Quando uma disciplina acaba, os tempos passam para as outras do mesmo professor</span></label></section>`;return sel+eq+disc+prof}
  return sel+glob+ced+cpdSemanaHTML(a,nome,S_)+prof}
/* horário semanal com datas */
function cpdSemanaHTML(a,nome,S_){const M=S_.M;const hj=S_.hoje<S_.L.ini?S_.L.ini:S_.hoje>S_.L.fim?S_.L.fim:S_.hoje;const seg=UI.cpdSem||cpdSeg(hj);
  return `<section class="card cpd-sw"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Horário Semanal</h2><span class="sp1"></span>
    <div class="row noprint" style="gap:4px"><button class="btn sm" data-cpdw="-7" aria-label="Semana anterior">${ic('back',14)}</button><button class="btn sm" data-cpdw="0">Esta Semana</button><button class="btn sm" data-cpdw="7" aria-label="Semana seguinte"><span style="display:inline-block;transform:rotate(180deg)">${ic('back',14)}</span></button></div></div>
    ${cpdGrelha(S_,seg,true)}<p class="hint noprint">Toque num tempo para o mudar só nesta semana (outra disciplina, ou livre). O número é o tempo dessa disciplina (ex.: 31/94). Em baixo, o que falta a cada professor no fim da semana.</p></section>`}
function cpdGrelha(S_,seg,edit){const M=S_.M;const dias=CPD_DS.map(w=>cpdMais(seg,w-1));const T=[...new Set(S_.aulas.map(x=>x.ini))].sort((x,y)=>x-y);
  const E={};S_.log.forEach(e=>{if(e.iso>=seg&&e.iso<=dias[4])E[e.iso+'|'+e.sk]=e});const wk=(M.sem||{})[seg]||{};
  const dd=id=>S_.D.find(d=>d.id===id);
  const cab=`<tr><th></th>${dias.map((iso,i)=>{const t=cpmTipo(iso,M,S_.L,S_.c);return `<th class="${t!=='let'?'cpd-nl':''}">${DIAS_C[i+1]} ${cpdDM(iso)}${t!=='let'?`<div class="cpd-tp">${{fer:'feriado',int:'interrupção',fct:'FPCT',nl:'sem aulas',fora:'fora do ano',fds:''}[t]||''}</div>`:''}</th>`}).join('')}</tr>`;
  const lin=T.map(ini=>{const x0=S_.aulas.find(x=>x.ini===ini);return `<tr><th class="cpd-h">${cpdHm(ini)}<small>${x0?cpdHm(x0.fim):''}</small></th>${dias.map((iso,i)=>{const w=i+1;const x=S_.aulas.find(z=>z.dia===w&&z.ini===ini);if(!x)return '<td class="cpd-v"></td>';
      const sk=cpdSk(x);const t=cpmTipo(iso,M,S_.L,S_.c);const e=E[iso+'|'+sk];const ov=wk[sk]!=null&&wk[sk]!=='';
      if(t!=='let')return `<td class="cpd-nl"><small>${esc(x.ab)}</small></td>`;
      if(!e)return `<td class="cpd-v"><small>${esc(x.ab)}</small></td>`;
      const d=e.id&&dd(e.id);const at=edit?` data-cpdc="${esc(seg+'|'+sk)}" tabindex="0" role="button"`:'';
      return d?`<td class="cpd-c ${ov?'ov':''} v-${e.via}"${at} style="--dc:${corDisc(d.nome)}"><b>${esc(cpdCurto(d))}</b><small>${esc(e.prof.split(' ')[0])}${e.prof.split(' ').length>1?' '+esc(e.prof.split(' ').slice(-1)[0]):''}</small><i>${e.n}/${S_.need[d.id]}</i>${e.via==='professor'||e.via==='cedido'||e.via==='livre'?`<em title="tempo de ${esc(x.ab)}">${esc(x.ab)}</em>`:''}</td>`
        :`<td class="cpd-c livre ${ov?'ov':''}"${at}><b>livre</b><small>${esc(x.ab)}</small></td>`}).join('')}</tr>`}).join('');
  const fimS=dias[4];const n=cpdAte(S_,fimS);const PR={};S_.D.forEach(d=>{const p=cpdProfEm(d,fimS);PR[p]=(PR[p]||0)+Math.max(0,S_.need[d.id]-n[d.id])});
  const rod=`<div class="cpd-rod">${Object.entries(PR).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([p,f])=>`<span class="${f?'':'ok'}"><b>${esc(p)}</b> ${f?'faltam '+f:'acabou'}</span>`).join('')}</div>`;
  return `<div class="cpm-tw"><table class="cpd-gr"><thead>${cab}</thead><tbody>${lin}</tbody></table></div>${rod}`}
const corDisc=n=>{let h=0;for(const ch of String(n))h=(h*31+ch.charCodeAt(0))%360;return `hsl(${h} 55% 45%)`};
/* ---------- diálogos ---------- */
function cpdCedDlg(nome,pre){const M=cpmM(nome);const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const op=(v,s)=>D.map(d=>`<option value="${d.id}" ${v===d.id?'selected':''}>${esc(d.nome)}${d.prof?' · '+esc(d.prof):''}</option>`).join('');pre=pre||{};
  openDrawer('Ceder Tempos · '+nome,`<div class="ed"><label>Os tempos de</label><select id="cd-o"><option value="*" ${pre.origem==='*'?'selected':''}>Qualquer tempo livre (de quem já acabou)</option>${op(pre.origem)}</select>
    <label>passam para</label><select id="cd-d">${op(pre.destino)}</select>
    <label>Quando</label><select id="cd-q"><option value="fim">Quando a disciplina de origem acabar</option><option value="data">Já, a partir da data indicada (mesmo que a origem não tenha acabado)</option></select>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Desde</label><input type="date" id="cd-i" value="${esc(pre.desde||'')}"></div><div style="flex:1"><label>Até (opcional)</label><input type="date" id="cd-f"></div></div>
    <p class="hint">A app volta a simular o ano e mostra a nova data de fim de cada professor. Pode apagar a cedência a qualquer momento.</p>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="cd-x">Cancelar</button><button class="btn pri" id="cd-ok">Guardar</button></div></div>`);
  $('#cd-x').onclick=closeDrawer;$('#cd-ok').onclick=()=>{const o=$('#cd-o').value,d=$('#cd-d').value;if(o===d)return toast('Escolha disciplinas diferentes.','aviso');
    M.reat=M.reat||[];M.reat.push({id:uid(),origem:o,destino:d,quando:$('#cd-q').value,desde:$('#cd-i').value,ate:$('#cd-f').value});save();closeDrawer();vCProfij();toast('Cedência guardada: datas recalculadas.')}}
function cpdSubDlg(nome,id){const M=cpmM(nome);const d=M.disc.find(x=>x.id===id)||M.disc[0];if(!d)return;
  openDrawer('Substituir Professor(a)',`<div class="ed"><label>Disciplina / UFCD</label><select id="sb-d">${M.disc.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select>
    <label>Novo(a) professor(a)</label><input id="sb-p" placeholder="nome"><label>A partir de</label><input type="date" id="sb-i" value="${isoHoje()}">
    <div id="sb-l">${(d.subs||[]).length?`<p class="hint">Já registadas: ${(d.subs||[]).map(s=>esc(s.prof)+' desde '+fmtIsoL(s.desde)).join(' · ')} <button class="btn sm ghost" id="sb-lx">Limpar</button></p>`:''}</div>
    <p class="hint">Os tempos dados até essa data contam para o(a) professor(a) anterior; os seguintes contam para o(a) novo(a), também na contagem global dele(a).</p>
    <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="sb-x">Cancelar</button><button class="btn pri" id="sb-ok">Guardar</button></div></div>`);
  const lx=$('#sb-lx');if(lx)lx.onclick=()=>{d.subs=[];save();closeDrawer();vCProfij()};
  $('#sb-x').onclick=closeDrawer;$('#sb-ok').onclick=()=>{const x=M.disc.find(z=>z.id===$('#sb-d').value);const p=$('#sb-p').value.trim(),i=$('#sb-i').value;if(!p||!i)return toast('Indique o professor e a data.','aviso');x.subs=x.subs||[];x.subs.push({desde:i,prof:p});save();closeDrawer();vCProfij()}}
function cpdCelDlg(nome,seg,sk){const M=cpmM(nome);M.sem=M.sem||{};const W=M.sem[seg]=M.sem[seg]||{};const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const [w,ini]=sk.split('|').map(Number);const v=W[sk]||'';
  openDrawer(DIAS[w]+' '+cpdDM(cpdMais(seg,w-1))+' · '+cpdHm(ini),`<div class="ed"><p class="hint" style="margin-top:0">Muda só este tempo, só nesta semana.</p><div class="cpd-op">
    <label class="chk"><input type="radio" name="cpdo" value="" ${!v?'checked':''}> <span>Automático (horário e cedências)</span></label>
    <label class="chk"><input type="radio" name="cpdo" value="livre" ${v==='livre'?'checked':''}> <span>Livre (não há aula)</span></label>
    ${D.map(d=>`<label class="chk"><input type="radio" name="cpdo" value="${d.id}" ${v===d.id?'checked':''}> <span>${esc(d.nome)} <small class="mut">${esc(d.prof||'')}</small></span></label>`).join('')}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="cc-all">Limpar a Semana</button><span class="sp1"></span><button class="btn" id="cc-x">Cancelar</button><button class="btn pri" id="cc-ok">Guardar</button></div></div>`);
  $('#cc-x').onclick=closeDrawer;$('#cc-all').onclick=()=>{delete M.sem[seg];save();closeDrawer();vCProfij()};
  $('#cc-ok').onclick=()=>{const r=document.querySelector('input[name=cpdo]:checked');const x=r?r.value:'';if(x)W[sk]=x;else delete W[sk];if(!Object.keys(W).length)delete M.sem[seg];save();closeDrawer();vCProfij()}}
function cpdBind(v,a){const nome=UI.cpmT;const M=cpmM(nome);const q=s=>v.querySelector(s);
  v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;vCProfij()});
  v.querySelectorAll('[data-cpdm]').forEach(b=>b.onclick=()=>{UI.cpdModo=b.dataset.cpdm;manterPosicao(vCProfij)});
  [q('#cpd-ced'),q('#cpd-ced2')].forEach(b=>b&&(b.onclick=()=>cpdCedDlg(nome)));
  const sb=q('#cpd-sub');if(sb)sb.onclick=()=>cpdSubDlg(nome);v.querySelectorAll('[data-cpdsub]').forEach(b=>b.onclick=()=>cpdSubDlg(nome,b.dataset.cpdsub));
  const fc=q('#cpm-fct');if(fc)fc.onclick=()=>cpmFctDlg(nome);
  const pl=q('#cpd-pool');if(pl)pl.onchange=()=>{M.pool=pl.checked;save();manterPosicao(vCProfij)};
  v.querySelectorAll('[data-cpdfm]').forEach(i=>i.onchange=()=>{const d=M.disc.find(x=>x.id===i.dataset.cpdfm);if(d){d.fimMan=i.value;save();manterPosicao(vCProfij)}});
  v.querySelectorAll('[data-cpdrx]').forEach(b=>b.onclick=()=>{M.reat=(M.reat||[]).filter(r=>r.id!==b.dataset.cpdrx);save();manterPosicao(vCProfij)});
  v.querySelectorAll('[data-cpdlv]').forEach(b=>b.onclick=()=>{const S_=cpdSim(a,nome);const p=S_.P[b.dataset.cpdlv];const d=p&&p.disc.find(x=>S_.done[x.id]<S_.need[x.id]);if(d)cpdCedDlg(nome,{origem:'*',destino:d.id,desde:isoHoje()})});
  v.querySelectorAll('[data-cpdw]').forEach(b=>b.onclick=()=>{const n=+b.dataset.cpdw;UI.cpdSem=n?cpdMais(UI.cpdSem||cpdSeg(isoHoje()),n):cpdSeg(isoHoje());manterPosicao(vCProfij)});
  v.querySelectorAll('[data-cpdc]').forEach(c=>{const f=()=>{const [s,sk]=[c.dataset.cpdc.slice(0,10),c.dataset.cpdc.slice(11)];cpdCelDlg(nome,s,sk)};c.onclick=f;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
  v.querySelectorAll('[data-cpdmy]').forEach(i=>i.onchange=()=>{const d=M.disc.find(x=>x.id===i.dataset.cpdmy);if(d){d.minha=i.checked;save();manterPosicao(vCProfij)}});
  const my=q('#cpd-my');if(my)my.onclick=()=>cpdCriarMinhas(a,nome);
  const xc=q('#cpd-x-cron');if(xc)xc.onclick=()=>cpdExpCron(a,nome);const xs=q('#cpd-x-sem');if(xs)xs.onclick=()=>cpdExpSem(a,nome);const xm=q('#cpd-x-mat');if(xm)xm.onclick=()=>cpdExpMat(a,nome)}
/* ---------- exportação (documento para imprimir ou guardar em PDF) ---------- */
const CPD_CSS=`body{font:11px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;margin:0}h1{font-size:16px;margin:0 0 2px}h2{font-size:13px;margin:14px 0 6px}.m{color:#555;margin:0 0 8px}
table{border-collapse:collapse;width:100%;margin:0 0 8px}th,td{border:1px solid #9aa4ad;padding:3px 5px;text-align:left;vertical-align:top}th{background:#eef2f5}td.n,th.n{text-align:right}
.pg{break-after:page;page-break-after:always}.pg:last-child{break-after:auto}.cpd-gr td,.cpd-gr th{text-align:center;width:18%}.cpd-gr th:first-child{width:8%}.cpd-gr b{display:block}.cpd-gr small{display:block;color:#555}.cpd-gr i{font-style:normal;font-weight:700}
.nl{background:#f1f1f1;color:#888}.lv{background:#fff7d6}.rod span{display:inline-block;margin:0 12px 0 0}.ass{margin-top:28px;display:flex;justify-content:flex-end}.ass div{text-align:center;min-width:240px}.ass i{display:block;border-top:1px solid #333;margin-bottom:4px}
@page{size:A4;margin:12mm}@page land{size:A4 landscape}.land{page:land}`;
function cpdDoc(tit,corpo){const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
  const w=f.contentWindow;w.document.open();w.document.write(`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${esc(tit)}</title><style>${CPD_CSS}</style></head><body>${corpo}</body></html>`);w.document.close();
  setTimeout(()=>{try{w.focus();w.print()}catch(e){console.warn(e)}setTimeout(()=>f.remove(),60000)},300)}
const cpdCab=(M,nome,t)=>`<h1>${esc(t)}</h1><p class="m">${esc(M.curso||'Curso PROFIJ')} · ${esc(nome)}${S.cfg.escola?' · '+esc(S.cfg.escola):''} · ${fmtIsoL(isoHoje())}</p>`;
const cpdAss=()=>`<div class="ass"><div><i></i>O(A) Coordenador(a) do PROFIJ<br>${esc(S.cfg.professor||'')}</div></div>`;
function cpdExpCron(a,nome){const S_=cpdSim(a,nome);const M=S_.M;const PR=Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt'));
  const dn=id=>{const d=S_.D.find(x=>x.id===id);return d?cpdCurto(d):''};
  const html=PR.map(p=>{const L=S_.log.filter(e=>e.id&&e.prof===p.nome);const porD={};L.forEach(e=>(porD[e.iso]=porD[e.iso]||[]).push(e));let ac=0;
    const lin=Object.keys(porD).sort().map(iso=>{const E=porD[iso];ac+=E.length;const d=dataDeIso(iso);return `<tr><td>${cpdDM(iso)}/${iso.slice(0,4)}</td><td>${DIAS_C[d.getDay()]}</td><td>${E.map(e=>esc(dn(e.id))+' '+e.n).join(' · ')}</td><td class="n">${E.length}</td><td class="n">${ac}</td></tr>`}).join('');
    return `<section class="pg">${cpdCab(M,nome,'Cronograma — '+p.nome)}<p class="m">${p.disc.map(d=>esc(d.nome)+' ('+S_.need[d.id]+' tempos)').join(' + ')} = <b>${p.need} tempos</b> · acaba: <b>${p.fim==='feito'?'concluído':p.fim?fmtIsoL(p.fim):'não acaba (faltam '+p.falta+')'}</b></p>
      <table><thead><tr><th>Data</th><th>Dia</th><th>Tempos (disciplina e n.º do tempo)</th><th class="n">No dia</th><th class="n">Acumulado</th></tr></thead><tbody>${lin||'<tr><td colspan="5">Sem tempos a partir da data de referência.</td></tr>'}</tbody></table>${cpdAss()}</section>`}).join('');
  cpdDoc('Cronogramas '+nome,html);
  const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const R=[['Data','Dia','Hora','Tempo do horário','Disciplina/UFCD','N.º do tempo','Total','Professor(a)','Origem']];
  S_.log.forEach(e=>{const x=S_.aulas.find(z=>cpdSk(z)===e.sk)||{};const d=e.id&&S_.D.find(z=>z.id===e.id);R.push([e.iso,DIAS_C[dataDeIso(e.iso).getDay()],x.ini!=null?cpdHm(x.ini):'',x.ab||'',d?d.nome:'livre',e.n||'',d?S_.need[d.id]:'',e.prof||'',{horario:'horário',professor:'mesmo professor',cedido:'cedência',livre:'tempo livre',semana:'alteração da semana'}[e.via]||e.via])});
  download('cronograma-'+normSig(nome)+'-'+isoHoje()+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}
function cpdExpSem(a,nome){const S_=cpdSim(a,nome);const M=S_.M;const de=prompt('Primeira semana (AAAA-MM-DD):',cpdSeg(S_.hoje<S_.L.ini?S_.L.ini:S_.hoje));if(!de)return;const ate=prompt('Última semana (AAAA-MM-DD):',S_.turmaFim&&S_.turmaFim!=='feito'?S_.turmaFim:S_.L.fim);if(!ate)return;
  let html='';for(let s=cpdSeg(de);s<=ate;s=cpdMais(s,7)){html+=`<section class="pg land">${cpdCab(M,nome,'Horário Semanal — '+fmtIsoL(s)+' a '+fmtIsoL(cpdMais(s,4)))}${cpdGrelha(S_,s,false).replace(/class="cpd-nl"/g,'class="nl"').replace(/cpd-c livre/g,'lv').replace(/<div class="cpd-rod">/,'<p class="rod"><b>No fim da semana:</b> ').replace(/<\/div>$/,'</p>')}${cpdAss()}</section>`}
  cpdDoc('Horários semanais '+nome,html)}
function cpdExpMat(a,nome){const S_=cpdSim(a,nome);const S0=cpdSim(a,nome,{ini:true});const M=S_.M;const K=cpmCalc(a,nome);
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=S_.D.filter(d=>d.comp===k);if(!L.length)return '';const hh=L.reduce((s,d)=>s+(+d.horas||0),0),tt=L.reduce((s,d)=>s+S_.need[d.id],0);
    return `<tr><th colspan="9">${l}</th></tr>${L.map(d=>{const r=K.R.find(x=>x.d.id===d.id)||{};return `<tr><td>${esc(d.nome)}${d.det?' <small>'+esc(d.det)+'</small>':''}</td><td class="n">${d.horas}</td><td class="n">${S_.need[d.id]}</td><td>${esc(d.prof||'')}${(d.subs||[]).map(s=>'<br><small>→ '+esc(s.prof)+' desde '+cpdDM(s.desde)+'</small>').join('')}</td><td>${esc((d.sig||[]).join(', '))}</td><td class="n">${r.semT||''}</td><td class="n">${Math.min(Math.max(0,S_.dh[d.id]),S_.need[d.id])}</td><td>${S0.fim[d.id]&&S0.fim[d.id]!=='feito'?fmtIsoL(S0.fim[d.id]):'—'}</td><td>${S_.fim[d.id]==='feito'?'concluída':S_.fim[d.id]?fmtIsoL(S_.fim[d.id]):'não acaba'}${d.fimMan?'<br><small>marcada: '+fmtIsoL(d.fimMan)+'</small>':''}</td></tr>`}).join('')}<tr><td><b>Total da componente</b></td><td class="n"><b>${hh}</b></td><td class="n"><b>${tt}</b></td><td colspan="6"></td></tr>`}).join('');
  const f=M.fct||{};
  const mat=`<section class="pg">${cpdCab(M,nome,'Matriz Curricular e Distribuição de Serviço')}<p class="m">${[M.area&&'Área: '+esc(M.area),M.nivel&&'Nível: '+esc(M.nivel),M.anoCurso&&'Ano: '+esc(M.anoCurso),M.ref&&'Referencial: '+esc(M.ref)].filter(Boolean).join(' · ')} · ${fmtIsoL(S_.L.ini)} a ${fmtIsoL(S_.L.fim)}</p>
    <table><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Tempos (45 min)</th><th>Professor(a)</th><th>No horário</th><th class="n">Tempos/sem.</th><th class="n">Dados até hoje</th><th>Fim (plano inicial)</th><th>Fim previsto</th></tr></thead><tbody>${comp}</tbody></table>
    ${f.ini&&f.fim?`<p><b>FPCT:</b> ${fmtIsoL(f.ini)} a ${fmtIsoL(f.fim)} · ${K.fctH} h possíveis${f.horas?' de '+f.horas+' h exigidas':''}</p>`:''}
    <p><b>A turma acaba:</b> ${S_.turmaFim==='feito'?'concluída':S_.turmaFim?fmtIsoL(S_.turmaFim):'não acaba no ano (faltam '+S_.falta+' tempos)'} · plano inicial: ${S0.turmaFim&&S0.turmaFim!=='feito'?fmtIsoL(S0.turmaFim):'—'}</p>
    <h2>Distribuição de Serviço (contagem global por professor)</h2><table><thead><tr><th>Professor(a)</th><th>Disciplinas e UFCD</th><th class="n">Tempos</th><th class="n">Dados até hoje</th><th class="n">Ficam por dar</th><th>Acaba</th></tr></thead><tbody>${Object.values(S_.P).sort((x,y)=>x.nome.localeCompare(y.nome,'pt')).map(p=>`<tr><td>${esc(p.nome)}</td><td>${p.disc.map(d=>esc(d.nome)+' ('+S_.need[d.id]+')').join(' + ')}</td><td class="n">${p.need}</td><td class="n">${p.dh}</td><td class="n">${p.falta}</td><td>${p.fim==='feito'?'concluído':p.fim?fmtIsoL(p.fim):'não acaba'}</td></tr>`).join('')}</tbody></table>${cpdAss()}</section>`;
  /* horário original da turma */
  const T=[...new Set(S_.aulas.map(x=>x.ini))].sort((x,y)=>x-y);const leg=(S_.h.legenda||[]);
  const hor=`<section class="pg land">${cpdCab(M,nome,'Horário Original da Turma')}<table class="cpd-gr"><thead><tr><th></th>${CPD_DS.map(w=>`<th>${DIAS[w]}</th>`).join('')}</tr></thead><tbody>${T.map(ini=>{const x0=S_.aulas.find(x=>x.ini===ini);return `<tr><th>${cpdHm(ini)}<small>${x0?cpdHm(x0.fim):''}</small></th>${CPD_DS.map(w=>{const x=S_.aulas.find(z=>z.dia===w&&z.ini===ini);if(!x)return '<td></td>';const l=leg.find(l=>normSig(l.ab)===normSig(x.ab));return `<td><b>${esc(x.ab)}</b><small>${esc(l?(l.profs||[]).join(', '):'')}${x.sala?' · '+esc(x.sala):''}</small></td>`}).join('')}</tr>`}).join('')}</tbody></table>
    ${leg.length?`<table><thead><tr><th>Sigla</th><th>Atividade</th><th>Professor(a)</th></tr></thead><tbody>${leg.map(l=>`<tr><td>${esc(l.ab)}</td><td>${esc(l.nome||'')}</td><td>${esc((l.profs||[]).join(', '))}</td></tr>`).join('')}</tbody></table>`:''}</section>`;
  cpdDoc('Matriz e distribuição de serviço '+nome,mat+hor)}

const cpdMinha=d=>d.minha!=null?!!d.minha:!!(S.cfg.professor&&d.prof&&String(d.prof).split(/,\s*/).some(p=>mesmoNome(p,S.cfg.professor)));
/* cria no modo professor as turmas·disciplinas que o coordenador leciona (com os formandos da turma, se já existirem) */
function cpdCriarMinhas(a,nome){const M=cpmM(nome);const L=M.disc.filter(cpdMinha);const novas=L.filter(d=>!a.turmas.some(t=>normTurma(t.nome)===normTurma(nome)&&normT(t.disciplina)===normT(d.nome)));
  if(!novas.length)return toast('As suas disciplinas desta turma já estão no modo professor.');
  if(!confirm('Criar no modo professor:\n\n'+novas.map(d=>'· '+nome+' — '+d.nome).join('\n')+'\n\nOs formandos são copiados da turma, se ela já existir.'))return;
  const base=a.turmas.find(t=>normTurma(t.nome)===normTurma(nome)&&t.alunos&&t.alunos.length);
  novas.forEach(d=>{const anoEsc=base?base.anoEsc:'10',ciclo=cicloDoAno(anoEsc);
    const t={id:uid(),nome,anoEsc,ciclo,oferta:'profij',disciplina:d.nome,dominios:mkDominiosDisc(d.nome,'profij',ciclo),mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[],modulos:[],cpmDisc:d.id};
    if(base){if(base.origens)t.origens=base.origens.slice();t.alunos=JSON.parse(JSON.stringify(base.alunos)).map(x=>Object.assign(x,{id:uid()+Math.random().toString(36).slice(2,5),frequenta:true,autoav:{},obsPer:{},sintese:{}}))}
    a.turmas.push(t)});
  saveNow();vCProfij();toast(novas.length+' disciplina(s) criada(s) no modo professor.')}

