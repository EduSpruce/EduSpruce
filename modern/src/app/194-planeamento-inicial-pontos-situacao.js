/* ---------- Planeamento inicial e Pontos de Situação ---------- */
function cpmPlanoIni(a,nome){const M=cpmM(nome),L=cpmLimites(a,M);const K=cpmCalc(a,nome,{ref:L.ini,dadas:{}});return K.R.map(r=>({id:r.d.id,nome:r.d.nome,aulas:r.aulas,tot:r.tot,fim:r.fimPrev,saldo:r.saldo,seq:r.seq,ini:r.iniPrev}))}
function cpmPontosHTML(a,nome){const M=cpmM(nome);const P=(M.pontos||[]).slice().sort((x,y)=>y.data.localeCompare(x.data));const PI=M.plano&&M.plano.R?M.plano.R:cpmPlanoIni(a,nome);
  const fx=M.plano&&M.plano.em;const L=cpmLimites(a,M);
  const pi=`<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('flag',18)} Planeamento Inicial</h2><span class="mut">${fx?'fixado em '+fmtIsoL(fx):'calculado do horário e do calendário'} · ${fmtIsoL(L.ini)} a ${fmtIsoL(L.fim)}</span><span class="sp1"></span><button class="btn sm noprint" id="cpm-fix">${ic(fx?'refresh':'check',14)} ${fx?'Voltar a Calcular':'Fixar Planeamento'}</button></div>
    <div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Aulas a dar</th><th class="n">Aulas no horário até ao fim</th><th class="n">Saldo</th><th>Última aula prevista</th></tr></thead><tbody>${PI.map(x=>`<tr class="${x.saldo<0?'bad':''}"><td><b>${esc(x.nome)}</b>${x.seq&&x.ini&&x.ini!=='feito'?`<div class="hint">começa ${fmtIsoL(x.ini)}</div>`:''}</td><td class="n">${x.aulas||'—'}</td><td class="n">${x.seq?'—':x.tot}</td><td class="n ${x.saldo<0?'neg':'pos'}">${x.aulas?(x.saldo>0?'+':'')+x.saldo:'—'}</td><td>${x.fim?cpmFD(x.fim):x.aulas?'<span class="neg">não chega ao fim</span>':'—'}</td></tr>`).join('')}</tbody></table></div>
    <p class="hint">${fx?'O planeamento ficou fixado: serve de comparação para os pontos de situação, mesmo que o horário mude.':'Fixe o planeamento no início do ano para comparar depois com o que foi realmente dado.'}</p></section>`;
  const lst=`<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('clipboard',18)} Pontos de Situação</h2><span class="sp1"></span><button class="btn pri sm noprint" id="cpm-pnovo">${ic('plus',14)} Novo Ponto de Situação</button></div>
    ${P.length?`<div class="cpm-pl">${P.map(p=>{const K=cpmCalc(a,nome,{ref:cpmDiaSeg(p.data),dadas:p.dadas||{}});const atr=K.R.filter(r=>r.aulas&&r.dadas-r.prev<0).length,bad=K.R.filter(r=>r.est==='bad').length;
      return `<button type="button" class="cpm-pi ${bad?'bad':''}" data-cpmp="${p.id}"><b>${fmtIsoL(p.data)}</b><small>${Object.keys(p.dadas||{}).length} disciplina(s)${atr?' · '+atr+' atrasada(s)':''}${bad?' · '+bad+' sem tempo':''}</small></button>`}).join('')}</div>`:`<p class="mut" style="margin:8px 0 0">Ainda não há pontos de situação. Toque em «Novo Ponto de Situação», escreva as aulas dadas de cada disciplina nesse dia e a app calcula o que falta até ao fim.</p>`}</section>`;
  return pi+lst}
const cpmDiaSeg=iso=>{const d=dataDeIso(iso);d.setDate(d.getDate()+1);return isoData(d)};
function cpmPontoDlg(nome,p){const a=A(),M=cpmM(nome);M.pontos=M.pontos||[];const novo=!p;p=p||{id:uid(),data:isoHoje(),dadas:{},obs:''};
  const linhas=dt=>{const K=cpmCalc(a,nome,{ref:cpmDiaSeg(dt||p.data),dadas:{}});return K.R.map(r=>`<tr><td><b>${esc(r.d.nome)}</b></td><td class="n mut">${r.aulas||'—'}</td><td class="n mut" title="Aulas que o horário previa até este dia">${r.prev}</td><td class="n"><input type="number" min="0" step="1" inputmode="numeric" data-ppd="${r.d.id}" value="${p.dadas[r.d.id]!=null?esc(p.dadas[r.d.id]):''}" placeholder="${r.prev}" style="width:76px;text-align:right"></td></tr>`).join('')};
  openDrawer(novo?'Novo Ponto de Situação':'Ponto de Situação',`<div class="ed"><p class="hint" style="margin-top:0">Escreva as aulas (tempos de 45 min) <b>realmente dadas</b> até ao dia escolhido. Em branco fica o que o horário previa.</p>
    <label>Data</label><input type="date" id="pp-d" value="${esc(p.data)}">
    <div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Aulas</th><th class="n">Previstas</th><th class="n">Dadas</th></tr></thead><tbody id="pp-l">${linhas(p.data)}</tbody></table></div>
    <label>Observações</label><textarea id="pp-o" rows="2">${esc(p.obs||'')}</textarea>
    <div class="row" style="margin-top:14px">${novo?'':`<button class="btn bad" id="pp-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn" id="pp-0">Cancelar</button><button class="btn pri" id="pp-ok">${ic('check',14)} Guardar e Calcular</button></div></div>`);
  const ler=()=>{$$('[data-ppd]').forEach(i=>{if(i.value==='')delete p.dadas[i.dataset.ppd];else p.dadas[i.dataset.ppd]=+i.value})};
  $('#pp-d').onchange=()=>{ler();$('#pp-l').innerHTML=linhas($('#pp-d').value)};$('#pp-0').onclick=closeDrawer;
  const x=$('#pp-x');if(x)x.onclick=()=>{if(!confirm('Apagar o ponto de situação de '+fmtIsoL(p.data)+'?'))return;M.pontos=M.pontos.filter(z=>z.id!==p.id);save();closeDrawer();vCProfij()};
  $('#pp-ok').onclick=()=>{ler();const K=cpmCalc(a,nome,{ref:cpmDiaSeg($('#pp-d').value||p.data),dadas:{}});K.R.forEach(r=>{if(p.dadas[r.d.id]==null)p.dadas[r.d.id]=r.prev});
    p.data=$('#pp-d').value||isoHoje();p.obs=$('#pp-o').value.trim();if(novo)M.pontos.push(p);save();audit('Coord. PROFIJ','Ponto de situação · '+nome,fmtIsoL(p.data));closeDrawer();UI.cpmP=p.id;vCProfij()}}
/* relatório de um ponto de situação (como a folha LOG: horas, aulas, dadas, diferença, professor — e a previsão até ao fim) */
function cpmPontoVer(nome,p){const a=A(),M=cpmM(nome);const K=cpmCalc(a,nome,{ref:cpmDiaSeg(p.data),dadas:p.dadas||{}});const PI=M.plano&&M.plano.R?M.plano.R:null;const PA=(M.pontos||[]).filter(q=>q.id!==p.id&&q.data<p.data).sort((x,y)=>x.data.localeCompare(y.data)).pop()||null;const KA=PA?cpmCalc(a,nome,{ref:cpmDiaSeg(PA.data),dadas:PA.dadas||{}}):null;const dA=r=>{const x=KA&&KA.R.find(z=>z.d.id===r.d.id);if(!x)return '—';const v=r.dadas-x.dadas;return (v>0?'+':'')+v};
  const el=document.createElement('div');el.className='cpm-pv';
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=K.R.filter(r=>r.d.comp===k);if(!L.length)return '';const f=L.reduce((s,r)=>s+r.falta,0);
    return `<tr class="cpm-comp"><th colspan="${KA?10:9}">${l}</th></tr>${L.map(r=>{const dv=r.dadas-r.prev;const pi=PI&&PI.find(x=>x.id===r.d.id);return `<tr class="${r.est==='bad'?'bad':r.est==='w'?'w':''}"><td><b>${esc(r.d.nome)}</b></td><td class="n">${r.d.horas||'—'}</td><td class="n">${r.aulas||'—'}</td><td class="n mut">${r.prev}</td><td class="n"><b>${r.dadas}</b></td>${KA?`<td class="n">${dA(r)}</td>`:''}<td class="n ${dv<0?'neg':dv>0?'pos':'mut'}">${dv>0?'+':''}${dv}</td><td class="n">${r.falta}</td><td>${r.fimPrev?cpmFD(r.fimPrev):r.aulas?`<span class="neg">faltam ${-r.saldo} no fim</span>`:'—'}${pi&&pi.fim&&r.fimPrev&&r.fimPrev!=='feito'&&pi.fim!=='feito'&&pi.fim!==r.fimPrev?`<div class="hint">planeado: ${fmtIsoL(pi.fim)}</div>`:''}</td><td>${esc(r.d.prof||'—')}</td></tr>`}).join('')}<tr class="cpm-tot"><td>Total da componente em falta</td><td colspan="${KA?6:5}"></td><td class="n"><b>${f}</b></td><td colspan="2"></td></tr>`}).join('');
  el.innerHTML=`<section class="card cpm-cab"><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div><div class="mut cpm-meta">${[M.area&&'Área: '+esc(M.area),M.nivel&&'Nível '+esc(M.nivel),M.anoCurso&&'Ano: '+esc(M.anoCurso)].filter(Boolean).join(' · ')}</div>
    <div class="cpm-ps"><b>Ponto de Situação — ${p.data.split('-').reverse().join('.')}</b> <span class="mut">· ${esc(nome)}</span></div>${p.obs?`<p style="margin:6px 0 0">${esc(p.obs)}</p>`:''}</section>
    <section class="card"><div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Aulas</th><th class="n">Previstas até à data</th><th class="n">Dadas</th>${KA?`<th class="n">Desde ${PA.data.split('-').reverse().slice(0,2).join('.')}</th>`:''}<th class="n">Desvio</th><th class="n">Faltam</th><th>Previsão até ao fim</th><th>Professor(a)</th></tr></thead><tbody>${comp}</tbody></table></div>
    <p class="hint">«Previstas até à data» = aulas que o horário e o calendário previam até ${fmtIsoL(p.data)}. ${KA?`«Desde ${PA.data.split('-').reverse().slice(0,2).join('.')}» = aulas dadas desde o ponto de situação anterior. `:''}A previsão até ao fim junta às aulas dadas as que o horário ainda tem até ${fmtIsoL(K.L.fim)}.</p></section>
    <div class="cpm-ass"><span>${esc(S.cfg.escola||'')}</span><div><div class="cpm-lin"></div>O Coordenador do PROFIJ<br><small>${esc(S.cfg.professor||'')}</small></div></div>`;
  const ed=document.createElement('button');ed.className='btn sm';ed.type='button';ed.innerHTML=ic('pencil',14)+' Editar';ed.onclick=()=>{ecraAmplo.fechar&&ecraAmplo.fechar();cpmPontoDlg(nome,p)};
  const pr=document.createElement('button');pr.className='btn sm';pr.type='button';pr.innerHTML=ic('printer',14)+' Imprimir';pr.onclick=()=>{document.body.classList.add('amp-print');setTimeout(()=>{try{window.print()}catch(_){}document.body.classList.remove('amp-print')},50)};
  ecraAmplo({titulo:'Ponto de Situação',sub:nome+' · '+fmtIsoL(p.data),el,acoes:[ed,pr],aoFechar:()=>{UI.cpmP=null}})}
function cpmBindPontos(v,a){const nome=UI.cpmT;const M=cpmM(nome);
  const fx=v.querySelector('#cpm-fix');if(fx)fx.onclick=()=>{if(M.plano&&M.plano.em){if(!confirm('Voltar a calcular o planeamento inicial a partir do horário e do calendário atuais?'))return;delete M.plano}else M.plano={em:isoHoje(),R:cpmPlanoIni(a,nome)};save();vCProfij()};
  const nv=v.querySelector('#cpm-pnovo');if(nv)nv.onclick=()=>cpmPontoDlg(nome);
  v.querySelectorAll('[data-cpmp]').forEach(b=>b.onclick=()=>{const p=(M.pontos||[]).find(z=>z.id===b.dataset.cpmp);if(p)cpmPontoVer(nome,p)});
  if(UI.cpmP){const p=(M.pontos||[]).find(z=>z.id===UI.cpmP);UI.cpmP=null;if(p)setTimeout(()=>cpmPontoVer(nome,p),0)}}
const cpmFD=iso=>iso==='feito'?'concluída':iso?fmtIsoL(iso):'—';
const CPM_E={ok:['Concluída','ok'],curso:['Dentro do previsto',''],w:['Margem curta','w'],bad:['Não chega ao fim do ano','bad'],sem:['Sem horas','']};
function cpmMatrizHTML(a,C){const N=cpmNomes(a,C);if(!N.length)return `<section class="card empty">${ic('grid',28)}<br><b>Ainda não há turmas PROFIJ</b><br><span class="mut">Crie a matriz de uma turma (por exemplo, a partir do horário da turma em PDF).</span><br><br><button class="btn pri" id="cpm-nova">${ic('plus',14)} Nova Matriz</button> <button class="btn" id="cpm-pdf">${ic('upload',14)} Importar Horário da Turma (PDF ou Excel)</button></section>`;
  const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;const K=cpmCalc(a,nome),M=K.M;const h=horarioDe(a,nome);
  const tot=K.R.reduce((s,r)=>({a:s.a+r.aulas,d:s.d+Math.min(r.dadas,r.aulas||r.dadas),f:s.f+r.falta,b:s.b+(r.est==='bad'?1:0)}),{a:0,d:0,f:0,b:0});const pc=tot.a?Math.round(tot.d/tot.a*100):0;
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}<button type="button" class="chip" id="cpm-nova">${ic('plus',13)} Nova</button></div>`;
  const cab=`<section class="card cpm-cab"><div><div><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div>
    <div class="mut cpm-meta">${[M.area&&'Área de Educação e Formação: '+esc(M.area),M.nivel&&'Nível de Qualificação do QNQ: '+esc(M.nivel),M.cod&&'Cód. interno: '+esc(M.cod),M.anoCurso&&'Ano: '+esc(M.anoCurso),M.ref&&'Referencial: '+esc(M.ref)].filter(Boolean).join(' · ')||'Toque em «Dados do Curso» para preencher o cabeçalho.'}</div>
    <div class="cpm-ps"><b>Situação atual — ${isoHoje().split('-').reverse().join('.')}</b>${K.P0?` <span class="tag ok">desde o ponto de ${fmtIsoL(K.P0.data)}</span>`:''} <span class="mut">· ${esc(nome)} · ${fmtIsoL(K.L.ini)} a ${fmtIsoL(K.L.fim)}${M.nasInt?' · com sessões nas interrupções':''}</span></div></div>
    <div class="row noprint" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm pri" id="cpm-pfj">${ic('layers',14)} Criar Curso Completo</button><button class="btn sm" id="cpm-mpdf">${ic('upload',14)} Importar Matriz (PDF)</button><button class="btn sm" id="cpm-curso">${ic('pencil',14)} Dados do Curso</button><button class="btn sm" id="cpm-pdf">${ic('upload',14)} Horário da Turma (PDF ou Excel)</button>${h?`<button class="btn sm" id="cpm-ger">${ic('flow',14)} Gerar do Horário</button>`:''}<button class="btn sm" id="cpm-add">${ic('plus',14)} Disciplina / UFCD</button><button class="btn sm" id="cpm-csv">${ic('download',14)} CSV</button><button class="btn sm pri" id="cpm-imp">${ic('printer',14)} Imprimir</button></div></div>
    ${!K.c?`<div class="alert w noprint" style="margin-top:10px">${ic('alert',15)} Sem calendário escolar: só os fins de semana são descontados. Importe o calendário (Calendário › Importar) para descontar feriados e interrupções letivas.</div>`:''}
    ${!h?`<div class="alert noprint" style="margin-top:10px">${ic('calendar',15)} Importe o horário da turma (PDF «Horário da Turma») para a app contar sozinha as aulas dadas e prever quando termina cada disciplina.</div>`:''}
    <div class="cpm-kp"><div><small>Aulas previstas</small><b>${tot.a}</b></div><div><small>Dadas</small><b>${tot.d}</b><i class="cpm-bar"><i style="width:${pc}%"></i></i></div><div><small>Em falta</small><b>${tot.f}</b></div><div class="${tot.b?'bad':''}"><small>Não chegam ao fim</small><b>${tot.b}</b></div></div></section>`;
  const linha=r=>{const e=CPM_E[r.est];const p=r.aulas?Math.min(100,Math.round(r.dadas/r.aulas*100)):0;
    return `<tr class="cpm-r ${e[1]}"><td><b>${esc(r.d.nome)}</b>${r.d.det?`<div class="hint">${esc(r.d.det)}</div>`:''}${r.d.sig&&r.d.sig.length?`<div class="hint noprint">horário: ${esc(r.d.sig.join(', '))}</div>`:''}</td><td class="n">${r.d.horas||'—'}</td><td class="n">${r.aulas||'—'}</td>
      <td class="n"><b>${r.dadas}</b>${r.fonte==='manual'?' <span class="tag" title="escrito à mão">manual</span>':r.fonte==='ponto'?' <span class="tag ok" title="do ponto de situação">ponto</span>':r.fonte==='estimativa'?' <span class="tag" title="ponto de situação + aulas do horário desde então">estim.</span>':r.d.aj?` <span class="mut" title="ajuste">(${r.d.aj>0?'+':''}${r.d.aj})</span>`:''}<i class="cpm-bar"><i style="width:${p}%"></i></i></td>
      <td class="n ${r.falta?'':'mut'}">${r.falta}</td><td class="n">${r.semT||'—'}</td><td>${r.fimPrev?cpmFD(r.fimPrev):r.aulas?`<span class="neg">faltam ${-r.saldo} no fim</span>`:'—'}${r.seq&&r.iniPrev&&r.iniPrev!=='feito'?`<div class="hint">começa ${fmtIsoL(r.iniPrev)} (em sequência)</div>`:''}${r.fimPrev&&r.fimPrev!=='feito'&&r.saldo>0&&!r.seq?`<div class="hint">sobram ${r.saldo} tempo(s)</div>`:''}</td>
      <td>${esc(r.d.prof||'—')}</td><td><span class="tag ${e[1]}">${e[0]}</span></td><td class="act noprint">${r.d.comp==='tecnologica'?`<button class="btn sm ghost" data-cpmu="${r.d.id}" title="Dividir em UFCD (dadas em sequência)">${ic('list',14)}</button>`:''}<button class="btn sm ghost" data-cpmd="${r.d.id}" title="Editar">${ic('pencil',14)}</button></td></tr>`};
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=K.R.filter(r=>r.d.comp===k);if(!L.length)return '';const f=L.reduce((s,r)=>s+r.falta,0),au=L.reduce((s,r)=>s+r.aulas,0),dd=L.reduce((s,r)=>s+r.dadas,0),hh=L.reduce((s,r)=>s+(+r.d.horas||0),0);
    return `<tr class="cpm-comp"><th colspan="10">${l}</th></tr>${L.map(linha).join('')}<tr class="cpm-tot"><td>Total da componente${f?' em falta':''}</td><td class="n">${hh}</td><td class="n">${au}</td><td class="n">${dd}</td><td class="n"><b>${f}</b></td><td colspan="5"></td></tr>`}).join('');
  const tab=K.R.length?`<section class="card"><h2 style="margin:0 0 8px">${ic('grid',18)} Matriz Curricular</h2><div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Aulas</th><th class="n">Dadas</th><th class="n">Diferença</th><th class="n">Tempos / semana</th><th>Previsão de conclusão</th><th>Professor(a)</th><th>Situação</th><th class="noprint"></th></tr></thead><tbody>${comp}</tbody></table></div>
    <p class="hint">Aulas = horas ÷ 0,75 (tempos de 45 minutos), arredondado para cima. As dadas contam-se pelo horário da turma e pelo calendário escolar até agora; acerte com «Ajuste» (aulas repostas ou não dadas) ou escreva o total à mão.</p></section>`:`<section class="card empty">${ic('grid',26)}<br><b>Matriz vazia</b><br><span class="mut">${h?'Toque em «Gerar do Horário» para criar as disciplinas a partir do horário da turma.':'Importe o horário da turma em PDF ou acrescente as disciplinas e UFCD à mão.'}</span></section>`;
  /* por professor (as folhas por professor do Excel) */
  const P={};K.R.forEach(r=>{const k=(r.d.prof||'Sem professor').trim();(P[k]=P[k]||[]).push(r)});
  const prof=K.R.length?`<section class="card"><h2 style="margin:0 0 8px">${ic('users',18)} Por Professor(a)</h2><div class="cpm-pg">${Object.entries(P).sort((x,y)=>x[0].localeCompare(y[0],'pt')).map(([p,L])=>{const au=L.reduce((s,r)=>s+r.aulas,0),dd=L.reduce((s,r)=>s+Math.min(r.dadas,r.aulas||r.dadas),0),f=L.reduce((s,r)=>s+r.falta,0),b=L.some(r=>r.est==='bad');
    return `<div class="cpm-pc ${b?'bad':''}"><b>${esc(p)}</b><small>${L.map(r=>esc(r.d.nome)).join(' · ')}</small><div class="row" style="gap:10px"><span>${dd}/${au} dadas</span><span class="${f?'':'mut'}">faltam ${f}</span>${b?`<span class="tag bad">risco</span>`:''}</div><i class="cpm-bar"><i style="width:${au?Math.round(dd/au*100):0}%"></i></i></div>`}).join('')}</div></section>`:'';
  const f=M.fct||{};const fh=+f.horas||0;
  const fct=`<section class="card"><div class="row"><h2 style="margin:0">${ic('building',18)} Formação Prática em Contexto de Trabalho</h2><span class="sp1"></span><button class="btn sm noprint" id="cpm-fct">${ic('pencil',14)} Período</button></div>
    ${f.ini&&f.fim?`<p style="margin:8px 0 0">${fmtIsoL(f.ini)} a ${fmtIsoL(f.fim)} · ${+f.hDia||7} h/dia → <b>${K.fctH} h possíveis</b>${fh?` de ${fh} h exigidas · <span class="${K.fctH>=fh?'pos':'neg'}">${K.fctH>=fh?'chega (sobram '+(K.fctH-fh)+' h)':'faltam '+(fh-K.fctH)+' h — alargue o período'}</span>`:''}</p><p class="hint">Durante a FPCT não há aulas: os dias deste período não contam para as disciplinas. Os feriados são descontados das horas da FPCT.</p>`:`<p class="mut" style="margin:8px 0 0">Indique o período e as horas da FPCT (ex.: 100 h no 1.º ano) para a app descontar esses dias das aulas e verificar se as horas chegam.</p>`}</section>`;
  const ass=`<div class="cpm-ass"><span>${esc((S.cfg.escola||'')+'')}</span><div><div class="cpm-lin">${S.cfg.assinaturaImg?`<img src="${esc(assinaturaSemFundo())}" alt="Assinatura" class="cpm-assimg">`:''}</div>O Coordenador do PROFIJ<br><small>${esc(S.cfg.professor||'')}</small></div></div>`;
  return sel+cab+tab+'<div data-cpz="pontos">'+cpmPontosHTML(a,nome)+'</div><div data-cpz="prof">'+prof+'</div><div data-cpz="fct">'+fct+'</div>'+ass}
function cpmDiscDlg(nome,d){const M=cpmM(nome);const novo=!d;d=d||{id:uid(),nome:'',comp:'sociocultural',horas:'',prof:'',sig:[],aj:0,dadas:null,det:''};const a=A();const h=horarioDe(a,nome);
  const sigs=h?[...new Set(h.aulas.map(x=>x.ab))].sort():[];
  openDrawer(novo?'Nova Disciplina / UFCD':'Editar Disciplina',`<div class="ed"><label>Nome</label><input id="dm-n" value="${esc(d.nome)}" placeholder="ex.: Matemática Aplicada · UFCD A">
    <label>Componente</label><select id="dm-c">${CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>`<option value="${k}" ${d.comp===k?'selected':''}>${l.replace('Componente de Formação ','')}</option>`).join('')}</select>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Horas (este ano)</label><input id="dm-h" type="number" min="0" step="1" inputmode="numeric" value="${esc(d.horas)}"></div><div style="flex:1"><label>Aulas de 45 min</label><input id="dm-a" disabled value="${cpmAulas(d.horas)||''}"></div></div>
    <label>UFCD incluídas (opcional)</label><input id="dm-u" value="${esc(d.det||'')}" placeholder="ex.: 0349 · 1122 · 0778">
    <label>Professor(a)</label><input id="dm-p" value="${esc(d.prof)}">
    <label>Siglas no horário da turma</label>${sigs.length?`<div class="row" style="gap:6px;flex-wrap:wrap">${sigs.map(s=>`<label class="chk"><input type="checkbox" data-dms="${esc(s)}" ${(d.sig||[]).map(normSig).includes(normSig(s))?'checked':''}> ${esc(s)}</label>`).join('')}</div>`:`<input id="dm-s" value="${esc((d.sig||[]).join(', '))}" placeholder="ex.: MAT"><div class="hint">Importe o horário da turma para escolher da lista.</div>`}
    <div class="row" style="gap:10px"><div style="flex:1"><label>Ajuste às dadas</label><input id="dm-j" type="number" step="1" inputmode="numeric" value="${+d.aj||0}"><div class="hint">+ repostas · − não dadas (greves, visitas…)</div></div><div style="flex:1"><label>Dadas (escrever à mão)</label><input id="dm-d" type="number" min="0" step="1" inputmode="numeric" value="${d.dadas!=null?esc(d.dadas):''}" placeholder="automático"></div></div>
    <div class="row" style="margin-top:14px">${novo?'':`<button class="btn bad" id="dm-x">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn" id="dm-c0">Cancelar</button><button class="btn pri" id="dm-ok">${ic('check',14)} Guardar</button></div></div>`);
  const H=$('#dm-h');H.oninput=()=>{$('#dm-a').value=cpmAulas(H.value)||''};
  $('#dm-n').onchange=()=>{const v=$('#dm-n').value;if(novo){$('#dm-c').value=cpmCompDe(v);if(!H.value&&CPM_H0[v]){H.value=CPM_H0[v];H.oninput()}}};
  $('#dm-c0').onclick=closeDrawer;const x=$('#dm-x');if(x)x.onclick=()=>{if(!confirm('Apagar «'+d.nome+'» da matriz?'))return;M.disc=M.disc.filter(z=>z.id!==d.id);save();closeDrawer();vCProfij()};
  $('#dm-ok').onclick=()=>{const n=$('#dm-n').value.trim();if(!n){toast('Escreva o nome.');return}
    d.nome=n;d.comp=$('#dm-c').value;d.horas=H.value===''?'':+H.value;d.det=$('#dm-u').value.trim();d.prof=$('#dm-p').value.trim();d.aj=+$('#dm-j').value||0;const dv=$('#dm-d').value;d.dadas=dv===''?null:+dv;
    d.sig=sigs.length?$$('[data-dms]').filter(i=>i.checked).map(i=>i.dataset.dms):($('#dm-s').value||'').split(/[,;]/).map(s=>s.trim()).filter(Boolean);
    if(novo)M.disc.push(d);save();audit('Coord. PROFIJ',(novo?'Disciplina acrescentada à matriz':'Matriz alterada')+' · '+nome,d.nome);closeDrawer();vCProfij()}}
function cpmCursoDlg(nome){const M=cpmM(nome);const a=A(),L=cpmLimites(a,{...M,ini:'',fim:''});
  const f=(id,l,v,ph,t)=>`<label>${l}</label><input id="${id}" ${t?`type="${t}"`:''} value="${esc(v||'')}" placeholder="${esc(ph||'')}">`;
  openDrawer('Dados do Curso · '+nome,`<div class="ed">${f('mc-c','Curso',M.curso,'ex.: Curso PROFIJ II - Operador/a de …')}${f('mc-a','Área de Educação e Formação',M.area,'ex.: 341 - Comércio')}
    <div class="row" style="gap:10px"><div style="flex:1">${f('mc-n','Nível de Qualificação do QNQ',M.nivel,'II')}</div><div style="flex:1">${f('mc-y','Ano do curso',M.anoCurso,'1.º')}</div></div>
    ${f('mc-k','Cód. interno',M.cod,'')}${f('mc-r','Referencial de Formação',M.ref,'')}
    <div class="row" style="gap:10px"><div style="flex:1">${f('mc-i','Início das aulas',M.ini,'','date')}<div class="hint">vazio = ${fmtIsoL(L.ini)}</div></div><div style="flex:1">${f('mc-f','Fim das aulas',M.fim,'','date')}<div class="hint">vazio = ${fmtIsoL(L.fim)}</div></div></div>
    <label class="chk" style="margin-top:10px"><input type="checkbox" id="mc-int" ${M.nasInt?'checked':''}> Há sessões de formação nas interrupções letivas</label>
    <div class="row" style="margin-top:14px">${UI.cpmT===nome&&!cpClasses(a).some(c=>c.nome===nome)?`<button class="btn bad" id="mc-x">${ic('trash',14)} Apagar Matriz</button>`:''}<span class="sp1"></span><button class="btn" id="mc-0">Cancelar</button><button class="btn pri" id="mc-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#mc-0').onclick=closeDrawer;const x=$('#mc-x');if(x)x.onclick=()=>{if(!confirm('Apagar a matriz de '+nome+'?'))return;delete CP().y.mat[nome];UI.cpmT='';save();closeDrawer();vCProfij()};
  $('#mc-ok').onclick=()=>{Object.assign(M,{curso:$('#mc-c').value.trim(),area:$('#mc-a').value.trim(),nivel:$('#mc-n').value.trim(),anoCurso:$('#mc-y').value.trim(),cod:$('#mc-k').value.trim(),ref:$('#mc-r').value.trim(),ini:$('#mc-i').value,fim:$('#mc-f').value,nasInt:$('#mc-int').checked});save();closeDrawer();vCProfij()}}
function cpmFctDlg(nome){const M=cpmM(nome),f=M.fct;openDrawer('FPCT · '+nome,`<div class="ed"><div class="row" style="gap:10px"><div style="flex:1"><label>Início</label><input type="date" id="mf-i" value="${esc(f.ini||'')}"></div><div style="flex:1"><label>Fim</label><input type="date" id="mf-f" value="${esc(f.fim||'')}"></div></div>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Horas exigidas</label><input type="number" min="0" inputmode="numeric" id="mf-h" value="${esc(f.horas||'')}" placeholder="ex.: 100"></div><div style="flex:1"><label>Horas por dia</label><input type="number" min="1" max="10" inputmode="numeric" id="mf-d" value="${esc(f.hDia||7)}"></div></div>
    <div class="row" style="margin-top:14px"><span class="sp1"></span><button class="btn" id="mf-0">Cancelar</button><button class="btn pri" id="mf-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#mf-0').onclick=closeDrawer;$('#mf-ok').onclick=()=>{const i=$('#mf-i').value,fi=$('#mf-f').value;if(i&&fi&&fi<i){toast('O fim é antes do início.');return}Object.assign(f,{ini:i,fim:fi,horas:$('#mf-h').value===''?'':+$('#mf-h').value,hDia:+$('#mf-d').value||7});save();closeDrawer();vCProfij()}}
/* cria as disciplinas a partir da legenda do horário da turma */
function cpmGerar(a,nome,silencioso){const h=horarioDe(a,nome);if(!h)return 0;const M=cpmM(nome);let n=0;
  const sigs=[...new Set(h.aulas.map(x=>x.ab))];const leg=h.legenda||[];
  sigs.forEach(s=>{if(M.disc.some(d=>(d.sig||[]).map(normSig).includes(normSig(s))))return;const l=leg.find(x=>normSig(x.ab)===normSig(s))||{};const nm=/^unidades de forma/i.test(normT(l.nome||''))?'UFCD (Formação Tecnológica)':l.nome&&normSig(l.nome)!==normSig(s)?l.nome:cpmNomeSig(s);
    const ex=M.disc.find(d=>normT(d.nome)===normT(nm));if(ex){ex.sig=[...(ex.sig||[]),s];return}
    M.disc.push({id:uid(),nome:nm,comp:cpmCompDe(nm),horas:cpmH0(nm),prof:(l.profs||[]).join(', '),sig:[s],aj:0,dadas:null,det:''});n++});
  const ord={sociocultural:0,cientifica:1,tecnologica:2};M.disc.sort((x,y)=>(ord[x.comp]-ord[y.comp])||x.nome.localeCompare(y.nome,'pt',{numeric:true}));
  save();if(!silencioso)toast(n?n+' disciplina(s) criada(s). Confirme as horas de cada uma.':'A matriz já tem todas as disciplinas do horário.');return n}
/* horário da turma em PDF (ex.: «Horário da Turma: …», com legenda Atividade / Nome do Professor) */
async function cpmLerHorTurma(file){const r=await lerHorarioProfPdf(file);
  const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const it=[];
  for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();tc.items.filter(i=>i.str&&i.str.trim()).forEach(i=>it.push({s:i.str.replace(/\s+/g,' ').trim(),x:i.transform[4],y:i.transform[5]-p*2000,w:i.width||0}))}
  const txt=it.map(i=>i.s).join(' ');const tm=txt.match(/Hor[aá]rio da Turma:?\s*(.+?)(?=\s+Ano letivo|\s+Tempos|$)/i);const turma=tm?tm[1].trim():'';
  const at=it.find(i=>normT(i.s)==='atividade'),np=it.find(i=>/nome do professor/i.test(i.s));const leg=[];let diretor='';
  if(at&&np){const rows={};it.filter(i=>i.y<at.y-1).forEach(i=>{const k=Math.round(i.y/3);(rows[k]=rows[k]||[]).push(i)});
    Object.keys(rows).map(Number).sort((x,y)=>y-x).forEach(k=>{const R=rows[k].sort((p,q)=>p.x-q.x);const sg=R.filter(i=>i.x<np.x-4).map(i=>i.s).join(' ').trim(),pf=R.filter(i=>i.x>=np.x-4).map(i=>i.s).join(' ').trim();if(!sg||!pf)return;
      if(/^dir\.?\s*(de\s*)?turma|diretor/i.test(sg)){diretor=pf;return}const e=leg.find(l=>normSig(l.ab)===normSig(sg));if(e){if(!e.profs.includes(pf))e.profs.push(pf)}else leg.push({ab:sg,nome:cpmNomeSig(sg),profs:[pf]})})}
  const LS=leg.map(l=>normSig(l.ab));const aulas=[];
  [...r.aulas.map(x=>({...x,sig:(x.turma?x.turma+' ':'')+x.sig})),...r.naoLetivos].forEach(x=>{const s=String(x.sig||'').trim();if(!s||/atividade|professor/i.test(s))return;
    if(LS.length&&!LS.includes(normSig(s))){const m=LS.find(k=>normSig(s).startsWith(k));if(!m)return}
    if(!aulas.some(o=>o.dia===x.dia&&o.ini===x.ini))aulas.push({dia:x.dia,ini:x.ini,fim:x.fim,ab:s,sala:x.sala||''})});
  aulas.sort((p,q)=>p.dia-q.dia||p.ini-q.ini);if(!aulas.length)throw new Error('Não encontrei aulas na grelha do horário.');
  return {turma,aulas,legenda:leg,diretor,ficheiro:file.name}}
function cpmImportarPdf(alvo){const inp=document.createElement('input');inp.type='file';inp.accept='.pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';inp.multiple=true;
  inp.onchange=async()=>{const a=A();const ok=[];for(const f of inp.files){ocupado('A ler '+f.name+'…');try{if(/\.xlsx?$/i.test(f.name)){const hs=await lerHorarioXlsx(f);if(!hs.length||!hs[0].aulas.length)throw new Error('não encontrei um horário de turma');hs.forEach(h=>{h.ficheiro=f.name;ok.push(h)})}else{const h=await cpmLerHorTurma(f);ok.push(h)}}catch(e){toast(f.name+': '+e.message)}}livre();if(!ok.length)return;
    a.horarios=a.horarios||{};ok.forEach(h=>{let nm=h.turma||alvo||'Turma PROFIJ';if(alvo&&ok.length===1&&normTurma(nm)!==normTurma(alvo)&&confirm('O PDF é da turma «'+nm+'». Associar à matriz «'+alvo+'»?'))nm=alvo;
      const k=Object.keys(a.horarios).find(k=>normTurma(k)===normTurma(nm))||nm;a.horarios[k]={turma:nm,aulas:h.aulas,legenda:h.legenda,diretor:h.diretor,ficheiro:h.ficheiro,importado:new Date().toISOString()};
      const {y}=CP();y.mat=y.mat||{};const ex=Object.keys(y.mat).find(n=>normTurma(n)===normTurma(k));const mn=ex||k;cpmM(mn);const n=cpmGerar(a,mn,true);UI.cpmT=mn;
      toast('Horário de '+nm+': '+h.aulas.length+' tempos'+(n?' · '+n+' disciplina(s) criada(s) — confirme as horas':''))});
    regista('Horário da turma (PDF)',ok.map(h=>h.ficheiro).join(', '),ok.map(h=>h.turma).join(', '));saveNow();UI.cpTab='matriz';vCProfij()};inp.click()}
function cpmCSV(a,nome){const K=cpmCalc(a,nome);const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const R=[['Componente','Disciplina/UFCD','UFCD incluídas','Horas','Aulas (45 min)','Dadas','Diferença','Tempos/semana','Previsão de conclusão','Professor(a)','Situação']];
  K.R.forEach(r=>R.push([(CPM_COMP.find(c=>c[0]===r.d.comp)||[,''])[1],r.d.nome,r.d.det||'',r.d.horas,r.aulas,r.dadas,r.falta,r.semT,r.fimPrev==='feito'?'concluída':r.fimPrev||('faltam '+(-r.saldo)),r.d.prof,CPM_E[r.est][0]]));
  download('ponto-situacao-'+normSig(nome)+'-'+isoHoje()+'.csv','﻿'+R.map(l=>l.map(q).join(';')).join('\n'),'text/csv')}
function cpmBindMatriz(v,a){const nome=UI.cpmT;const g=id=>v.querySelector('#'+id);
  v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;vCProfij()});
  const nv=g('cpm-nova');if(nv)nv.onclick=()=>{const n=(prompt('Nome da turma (como no horário, ex.: Profij 2):')||'').trim();if(!n)return;cpmM(n);UI.cpmT=n;save();vCProfij();pfjCursoDlg(n)};
  const pdf=g('cpm-pdf');if(pdf)pdf.onclick=()=>cpmImportarPdf(nome);
  const ge=g('cpm-ger');if(ge)ge.onclick=()=>{cpmGerar(a,nome);vCProfij()};
  const ad=g('cpm-add');if(ad)ad.onclick=()=>cpmDiscDlg(nome);
  const cu=g('cpm-curso');if(cu)cu.onclick=()=>cpmCursoDlg(nome);const pj=g('cpm-pfj');if(pj)pj.onclick=()=>pfjCursoDlg(nome);const mp=g('cpm-mpdf');if(mp)mp.onclick=()=>cpmImportarMatrizPdf(nome);
  const fc=g('cpm-fct');if(fc)fc.onclick=()=>cpmFctDlg(nome);
  const cs=g('cpm-csv');if(cs)cs.onclick=()=>cpmCSV(a,nome);
  const im=g('cpm-imp');if(im)im.onclick=()=>imprimirVista();
  v.querySelectorAll('[data-cpmd]').forEach(b=>b.onclick=()=>cpmDiscDlg(nome,cpmM(nome).disc.find(d=>d.id===b.dataset.cpmd)));
  v.querySelectorAll('[data-cpmu]').forEach(b=>b.onclick=()=>cpmUfcdDlg(nome,cpmM(nome).disc.find(d=>d.id===b.dataset.cpmu)));cpmBindPontos(v,a)}
function cpmUfcdDlg(nome,d){const M=cpmM(nome);const irm=M.disc.filter(x=>x.comp==='tecnologica'&&(x.sig||[]).map(normSig).sort().join('|')===(d.sig||[]).map(normSig).sort().join('|'));
  const txt=irm.map(x=>[x.det||'',x.nome,x.horas||'',x.prof||''].join(' ; ')).join('\n');
  openDrawer('UFCD em Sequência',`<div class="ed"><p class="hint" style="margin-top:0">Uma linha por UFCD, pela ordem em que são dadas: <b>código ; nome ; horas ; professor(a)</b>. Todas usam os tempos «${esc((d.sig||[]).join(', ')||'—')}» do horário: a app dá-as umas a seguir às outras e prevê quando começa e acaba cada uma.</p>
    <textarea id="mu-t" rows="14" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px" placeholder="0349 ; Ambiente, segurança, higiene e saúde no trabalho ; 25 ; …">${esc(txt)}</textarea>
    <div class="row" style="margin-top:14px"><span class="mut" id="mu-n"></span><span class="sp1"></span><button class="btn" id="mu-0">Cancelar</button><button class="btn pri" id="mu-ok">${ic('check',14)} Guardar</button></div></div>`);
  const T=$('#mu-t'),cont=()=>{const L=T.value.split('\n').map(l=>l.split(/\s*[;\t]\s*/)).filter(p=>p.join('').trim());const h=L.reduce((s,p)=>s+(+String(p[2]||'').replace(',','.')||0),0);$('#mu-n').textContent=L.length+' UFCD · '+h+' h · '+cpmAulas(h)+' aulas'};T.oninput=cont;cont();
  $('#mu-0').onclick=closeDrawer;$('#mu-ok').onclick=()=>{const L=T.value.split('\n').map(l=>l.split(/\s*[;\t]\s*/).map(x=>x.trim())).filter(p=>p.join(''));if(!L.length)return toast('Escreva pelo menos uma UFCD.','erro');
    const pos=M.disc.indexOf(irm[0]);const nov=L.map((p,k)=>{const ex=irm[k];return {id:ex?ex.id:uid(),nome:p[1]?(p[0]?p[0]+' - ':'')+p[1]:(p[0]||'UFCD '+(k+1)),det:p[0]||'',comp:'tecnologica',horas:+String(p[2]||'').replace(',','.')||'',prof:p[3]||d.prof||'',sig:(d.sig||[]).slice(),aj:ex?ex.aj||0:0,dadas:ex?ex.dadas:null}});
    M.disc=M.disc.filter(x=>!irm.includes(x));M.disc.splice(Math.max(0,pos),0,...nov);save();audit('Coord. PROFIJ','UFCD em sequência · '+nome,nov.length+' UFCD');closeDrawer();vCProfij()}}
/* Planeamento anual: grelha mês × dia, como a folha «Geral» e as folhas por professor */
function cpmPlanoHTML(a,C){const N=cpmNomes(a,C);if(!N.length)return cpmMatrizHTML(a,C);const nome=UI.cpmT&&N.includes(UI.cpmT)?UI.cpmT:N[0];UI.cpmT=nome;const K=cpmCalc(a,nome);
  const profs=[...new Set(K.R.map(r=>(r.d.prof||'').trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y,'pt'));const fil=UI.cpmF||'geral';
  const Rs=fil==='geral'?K.R:fil.startsWith('p:')?K.R.filter(r=>(r.d.prof||'').trim()===fil.slice(2)):K.R.filter(r=>r.d.id===fil);
  const um=Rs.length===1?Rs[0]:null;const hj=isoHoje();
  const porDia={};if(um)Object.entries(um.seq?{...Object.fromEntries(Object.entries(um.porDiaT).filter(([i])=>i<hj)),...um.porDia}:um.porDia).forEach(([iso,n])=>porDia[iso]=n);else{const vis=new Set();Rs.forEach(r=>{const k=(r.d.sig||[]).map(normSig).sort().join('|')||r.d.id;if(vis.has(k))return;vis.add(k);Object.entries(r.porDiaT).forEach(([iso,n])=>porDia[iso]=(porDia[iso]||0)+n)})}
  /* no modo de uma disciplina, depois de atingir as aulas os dias deixam de contar (como o «j» do Excel) */
  let acum=um?um.dadas:0;const meses=[];K.dias.forEach(z=>{const m=z.iso.slice(0,7);let M_=meses.find(x=>x.m===m);if(!M_){M_={m,d:{},tot:0};meses.push(M_)}M_.d[+z.iso.slice(8)]=z});
  const sel=`<div class="row cpm-sel noprint" style="gap:8px;flex-wrap:wrap">${N.map(n=>`<button type="button" class="chip ${n===nome?'on':''}" data-cpmt="${esc(n)}">${esc(n)}</button>`).join('')}</div>`;
  const opt=`<select id="cpm-f" class="noprint"><option value="geral" ${fil==='geral'?'selected':''}>Geral (todas as disciplinas)</option><optgroup label="Disciplina / UFCD">${K.R.map(r=>`<option value="${r.d.id}" ${fil===r.d.id?'selected':''}>${esc(r.d.nome)}</option>`).join('')}</optgroup>${profs.length?`<optgroup label="Professor(a)">${profs.map(p=>`<option value="p:${esc(p)}" ${fil==='p:'+p?'selected':''}>${esc(p)}</option>`).join('')}</optgroup>`:''}</select>`;
  let tGeral=0;const rows=meses.map(M_=>{const [yy,mm]=M_.m.split('-').map(Number);const nd=new Date(yy,mm,0).getDate();let tot=0;
    const cel=Array.from({length:31},(_,i)=>{const d=i+1;if(d>nd)return '<td class="x"></td>';const z=M_.d[d];if(!z)return '<td class="fora"></td>';
      let n=porDia[z.iso]||0,cls=z.t+(z.t==='fer'&&K.c&&K.c.dias&&/^feriado/.test(K.c.dias[z.iso]||'')?' f-'+K.c.dias[z.iso]:'');let txt='';if(z.t==='let'){if(n){if(um&&z.iso>=hj){if(acum>=um.aulas){cls='j';n=0}else{acum+=n;if(acum>=um.aulas)cls='let fimd'}}tot+=n;txt=n||''}}
      else if(z.t==='fct')txt='F';else if(z.t==='fer')txt='•';
      return `<td class="${cls}${z.iso===hj?' hj':''}" title="${fmtIsoL(z.iso)}">${txt}</td>`}).join('');tGeral+=tot;M_.tot=tot;
    return `<tr><th>${MESES[mm].slice(0,3)} ’${String(yy).slice(2)}</th>${cel}<td class="n"><b>${tot||''}</b></td><td class="n mut">${tGeral||''}</td></tr>`}).join('');
  const cal=K.c?`<p class="cpm-calk">${ic('calendar',14)} Ligado ao <button type="button" class="lnk" id="cpm-cal">Calendário Escolar</button> importado — feriados, interrupções e fim das aulas vêm de lá${K.c.periodos&&K.c.periodos.length?' · '+K.c.periodos.length+' períodos':''} · ${K.dias.filter(z=>z.t==='let').length} dias de aulas</p>`:`<div class="alert w" style="margin-top:8px">${ic('alert',15)} Sem calendário escolar importado: só se descontam os fins de semana. <button type="button" class="btn sm" id="cpm-cal">Importar o Calendário</button></div>`;const resumo=um?`<p style="margin:8px 0 0"><b>${esc(um.d.nome)}</b> · ${um.aulas} aulas · ${um.dadas} dadas · ${um.semT} tempos por semana · ${um.fimPrev?'conclusão prevista: <b>'+cpmFD(um.fimPrev)+'</b>':'<span class="neg">faltam '+(-um.saldo)+' tempos no fim do ano</span>'}</p>`:`<p class="mut" style="margin:8px 0 0">${Rs.length} disciplina(s) · tempos por dia segundo o horário da turma. Escolha uma disciplina para ver o dia em que termina.</p>`;
  return sel+`<section class="card cpm-plano"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('calendar',18)} Planeamento Anual · ${esc(nome)}</h2><span class="sp1"></span>${opt}<button class="btn sm noprint" id="cpm-amp" title="Abrir o calendário em grande">${ic('image',14)} Aumentar</button><button class="btn sm noprint" id="cpm-imp">${ic('printer',14)} Imprimir</button></div>${cal}${resumo}
    <div class="cpm-cw"><table class="cpm-cal"><thead><tr><th></th>${Array.from({length:31},(_,i)=>`<th>${i+1}</th>`).join('')}<th>Mês</th><th>Acum.</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="cpm-leg"><span><i class="let"></i>dia de aulas (n.º de tempos)</span>${um?'<span><i class="let fimd"></i>última aula</span><span><i class="j"></i>já concluída</span>':''}<span><i class="fds"></i>fim de semana</span><span><i class="fer f-feriadoN"></i>feriado nacional</span><span><i class="fer f-feriadoR"></i>feriado regional</span><span><i class="fer f-feriadoM"></i>feriado municipal</span><span><i class="int"></i>interrupção letiva</span><span><i class="fct"></i>FPCT</span><span><i class="hjl"></i>hoje</span></div></section>`}
function cpmBindPlano(v,a){v.querySelectorAll('[data-cpmt]').forEach(b=>b.onclick=()=>{UI.cpmT=b.dataset.cpmt;UI.cpmF='geral';vCProfij()});const f=v.querySelector('#cpm-f');if(f)f.onchange=()=>{UI.cpmF=f.value;vCProfij()};const im=v.querySelector('#cpm-imp');if(im)im.onclick=()=>imprimirVista();const cl=v.querySelector('#cpm-cal');if(cl)cl.onclick=()=>go('calendario');cpmAmpliar(v);cpmBindMatriz(v,a)}
/* ecrã ampliado (como o Perfil de Aprendizagem): barra com «Fechar», título e ações; o conteúdo passa para dentro */
function ecraAmplo(o){const x=document.getElementById('ampv');if(x)x.remove();const d=document.createElement('div');d.id='ampv';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',o.titulo);
  d.innerHTML=`<div class="pah"><button class="btn" type="button" id="amp-x">${ic('arrowL',16)} Fechar</button><div class="pat"><b>${esc(o.titulo)}</b><span>${esc(o.sub||'')}</span></div><span class="sp1"></span><span class="ampa"></span></div><div class="pab ampb"></div>`;
  document.body.appendChild(d);document.body.classList.add('amp-on');if(o.acoes)o.acoes.forEach(e=>d.querySelector('.ampa').appendChild(e));d.querySelector('.ampb').appendChild(o.el);
  const fechar=()=>{if(!d.isConnected)return;document.removeEventListener('keydown',kb,true);d.remove();document.body.classList.remove('amp-on');try{o.aoFechar&&o.aoFechar()}catch(e){console.warn(e)}};
  const kb=e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&!document.querySelector('#drawer.on')&&!(e.target.closest&&e.target.closest('[contenteditable=true],input,textarea'))){e.preventDefault();fechar()}};document.addEventListener('keydown',kb,true);
  d.querySelector('#amp-x').onclick=fechar;ecraAmplo.fechar=fechar;return d}
function cpmAmpliar(v){const sec=v.querySelector('.cpm-plano'),b=v.querySelector('#cpm-amp');if(!sec||!b)return;
  b.onclick=()=>{UI.cpmFull=true;vCProfij()};if(!UI.cpmFull)return;
  const {y}=CP();const fil=v.querySelector('#cpm-f');const sub=(UI.cpmT||'')+(fil&&fil.selectedOptions[0]?' · '+fil.selectedOptions[0].textContent:'');
  const pr=document.createElement('button');pr.className='btn sm';pr.type='button';pr.innerHTML=ic('printer',14)+' Imprimir';pr.onclick=()=>imprimirVista();
  ecraAmplo({titulo:'Planeamento Anual',sub,el:sec,acoes:[pr],aoFechar:()=>{UI.cpmFull=false;removeEventListener('resize',tam);if(VIEW==='cprofij')vCProfij()}});
  const tam=()=>{const t=sec.querySelector('table.cpm-cal');if(t)t.dataset.rs='';};requestAnimationFrame(tam);addEventListener('resize',tam)}
{const _gF=go;go=function(v){const d=document.getElementById('ampv');if(d){if(v!==VIEW){UI.cpmFull=false;UI.mqFull=false}d.remove();document.body.classList.remove('amp-on')}return _gF.apply(this,arguments)}}
/* atenção do painel: disciplinas que não chegam ao fim do ano */
{const _at=cpAtencao;cpAtencao=function(){const L=_at.apply(this,arguments);try{const a=A(),{y}=CP();Object.keys(y.mat||{}).forEach(n=>{cpmCalc(a,n).R.filter(r=>r.est==='bad').forEach(r=>L.push({c:'bad',ic:'clock',t:r.d.nome+' · '+n,s:'Faltam '+(-r.saldo)+' tempo(s) no fim do ano — planear reposições',tab:'matriz'}))})}catch(e){console.warn(e)}return L}}

/* 0.909 · modo de privacidade: sem atividade durante algum tempo, o ecrã fica bloqueado e sem nada visível */
const PRIV_OPC=[0,2,5,10,15,30,60];
const privMin=()=>{const v=S.cfg&&S.cfg.privMin;return v==null?10:+v};
let _privUlt=Date.now(),_privOn=false;
function privCfgHTML(){const v=privMin();return `<div class="row privrow" style="gap:10px;flex-wrap:wrap;align-items:center"><b style="font-weight:600">${ic('shield',15)} Modo de privacidade</b><select id="priv-min" aria-label="Modo de privacidade por inatividade">${PRIV_OPC.map(m=>`<option value="${m}" ${m===v?'selected':''}>${m?'depois de '+m+' min sem atividade':'desligado'}</option>`).join('')}</select></div>
  <p class="hint">O ecrã fica bloqueado e sem nada visível (nomes, notas, fotografias, janelas abertas). ${S.cfg.pinHash?'Para voltar, pede o código de acesso.':'Defina um código de acesso para que seja preciso o código para voltar.'} Não bloqueia em ecrã inteiro (projeção).</p>`}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='priv-min'){S.cfg.privMin=+e.target.value;save();toast(S.cfg.privMin?'Modo de privacidade depois de '+S.cfg.privMin+' min':'Modo de privacidade desligado','ok')}});
function privPodeBloquear(f){if(_privOn||(!f&&!privMin())||typeof SESSAO==='undefined'||!SESSAO)return false;const b=document.body;if(b.classList.contains('login-on')||document.getElementById('nvgate')||document.getElementById('pinlock')||document.getElementById('splash'))return false;if(!f&&(document.fullscreenElement||document.webkitFullscreenElement))return false;return true}
function privBloquear(f){if(!privPodeBloquear(f))return;try{if(f&&document.fullscreenElement)document.exitFullscreen()}catch(_){}_privOn=true;document.body.classList.add('priv-on');
  const o=document.createElement('div');o.id='privlock';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','prv-t');
  o.innerHTML=`<div class="prvb"><span class="prvl">${ic('shield',30)}</span><b id="prv-t">Modo de Privacidade</b><span class="prvs">${f?'Ecrã escondido — nada fica visível.':'Bloqueado por inatividade — nada fica visível.'}</span><button type="button" class="btn pri" id="prv-ok">${S.cfg.pinHash?'Desbloquear com o Código':'Continuar'}</button></div>`;
  document.body.appendChild(o);const b=o.querySelector('#prv-ok');b.onclick=privDesbloquear;setTimeout(()=>{try{b.focus()}catch(_){}},50);audit('Privacidade',f?'Modo de privacidade ativado':'Ecrã bloqueado por inatividade','')}
let _privA=false;
async function privDesbloquear(){if(_privA)return;_privA=true;try{if(S.cfg.pinHash){const o=document.getElementById('privlock');if(o)o.classList.add('pin');await pedirPin()}}finally{_privA=false}
  const o=document.getElementById('privlock');if(o){o.classList.add('fora');setTimeout(()=>o.remove(),180)}document.body.classList.remove('priv-on');_privOn=false;_privUlt=Date.now()}
{const mexeu=()=>{if(!_privOn)_privUlt=Date.now()};let _mm=0;
  ['pointerdown','keydown','wheel','touchstart','input','scroll'].forEach(ev=>addEventListener(ev,mexeu,{capture:true,passive:true}));
  addEventListener('mousemove',()=>{const t=Date.now();if(t-_mm>2000){_mm=t;mexeu()}},{passive:true});
  const ver=()=>{const m=privMin();if(m&&Date.now()-_privUlt>=m*60000)privBloquear()};
  setInterval(ver,10000);
  /* ao voltar à app (separador, iPad acordado) verifica logo, antes de se ver o conteúdo */
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){window.__privH=Date.now()}else ver()});
  addEventListener('pageshow',ver);addEventListener('focus',ver)}

/* botão no canto superior direito: entrar já no modo de privacidade (atalho: Ctrl+Shift+L) */
{const pb=()=>{const a=document.getElementById('ajBtn');if(!a||document.getElementById('privBtn'))return;a.insertAdjacentHTML('beforebegin',`<button class="btn ico" id="privBtn" title="Modo de privacidade — esconder tudo (Ctrl+Shift+L)" aria-label="Entrar no modo de privacidade">${ic('shield',20)}</button>`);document.getElementById('privBtn').onclick=()=>privBloquear(true);try{barLayout()}catch(_){}};pb();setTimeout(pb,800);
  /* o cabeçalho volta a arrumar-se quando os ícones da direita mudam de largura (evita botões por cima do título) */
  {let _rt=0,_w=0;const ro=new ResizeObserver(()=>{const ic_=document.querySelector('#bar>.barico');const w=ic_?Math.round(ic_.getBoundingClientRect().width):0;if(w===_w)return;_w=w;cancelAnimationFrame(_rt);_rt=requestAnimationFrame(()=>{try{barLayout()}catch(_){}})});setTimeout(()=>{const ic_=document.querySelector('#bar>.barico');if(ic_)ro.observe(ic_)},300)}
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='L'||e.key==='l')){e.preventDefault();privBloquear(true)}},true)}

/* 0.910 · ordem de reposição: o administrador manda apagar definitivamente os dados de um utilizador
   (nuvem + aparelhos) — por exemplo, para repor os dados de demonstração. Cumpre-se uma vez por ordem. */
const REP_KEY='esrep';
{const _an=acNorm;acNorm=function(j){const r=_an.apply(this,arguments);r.repor=(Array.isArray(j&&j.reposicoes)?j.reposicoes:[]).filter(x=>x&&x.h&&x.q).map(x=>({h:String(x.h).toLowerCase(),q:+x.q}));return r}}
try{if(AC_CENTRAL&&!AC_CENTRAL.repor)AC_CENTRAL.repor=[]}catch(_){}
const repFeitas=()=>{try{return JSON.parse(localStorage.getItem(REP_KEY)||'{}')||{}}catch(_){return {}}};
let _repA=false;
/* devolve true se a app vai recarregar (reposição feita) */
async function repVerificar(){if(_repA)return false;try{const s=sessaoAtual();if(!s||s.tipo!=='google')return false;const C=await acCentral();if(!C||!C.repor||!C.repor.length)return false;
  const h=await acHash(s.u);const o=C.repor.filter(x=>x.h===h).sort((a,b)=>b.q-a.q)[0];if(!o)return false;const F=repFeitas();if((F[h]||0)>=o.q)return false;
  _repA=true;const g=document.getElementById('nvgate');if(g)g.remove();document.body.classList.remove('nv-gating');
  const r=await avisoModal('Reposição dos seus dados',['O administrador da EduSpruce pediu a reposição dos dados desta conta ('+s.u+') em '+new Date(o.q).toLocaleDateString('pt-PT')+'.','Todos os dados desta conta — na nuvem (Google Drive) e neste aparelho — vão ser apagados definitivamente. A app volta a começar do zero.','Se precisar de alguma coisa, exporte primeiro uma cópia em Definições › Segurança.'],[{t:'Exportar Cópia Primeiro',v:'copia'},{t:'Repor Agora',c:'dng',v:'sim'}]);
  if(r==='copia'){_repA=false;try{UI.defTab='dados';go('definicoes')}catch(_){}toast('Depois de exportar, termine a sessão e volte a entrar para concluir a reposição.','aviso');return true}
  if(r!=='sim'){_repA=false;return false}
  ocupado('A apagar os dados…');
  /* 1) nuvem: só uma vez por ordem — outros aparelhos encontram a marca e limpam apenas o que têm */
  try{if(nvL().prov==='google'){const G=PROV.google;const m=await G._mapa(true);const marca=NV_PREF+'reposto-'+o.q+'.json';
      if(!m[marca]){const L=Object.keys(m).filter(n=>n!==marca);await nvPool(L,8,async n=>{try{await G.apagar(n)}catch(e){console.warn(e)}});await G.escrever(marca,JSON.stringify({q:o.q,em:Date.now()}))}}}
  catch(e){livre();_repA=false;await avisoModal('Não foi possível apagar a nuvem',['A ligação ao Google Drive falhou ('+(e.message||e)+').','A reposição fica pendente e volta a ser pedida na próxima entrada.'],[{t:'Continuar',c:'pri',v:1}]);return false}
  /* 2) aparelho */
  audit('Contas','Dados repostos por ordem do administrador',s.u);window.__efApagar=true;try{save=function(){};saveNow=function(){}}catch(_){}
  const _set=Storage.prototype.setItem,_rm=Storage.prototype.removeItem;
  try{Object.keys(localStorage).filter(k=>(/^(edugest|eduflow|es\.|ef\.|nv)/i.test(k)||k==='eskeep')&&k!==ES_PC_KEY&&k!==REP_KEY).forEach(k=>_rm.call(localStorage,k))}catch(_){}
  try{sessionStorage.clear()}catch(_){}
  try{const D=indexedDB.databases?await indexedDB.databases():[];await Promise.all([...D.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  F[h]=o.q;try{_set.call(localStorage,REP_KEY,JSON.stringify(F))}catch(_){}
  try{Storage.prototype.setItem=function(){}}catch(_){}
  location.reload();return true}catch(e){console.warn(e);_repA=false;return false}}
{const _sg=nvSyncGate;nvSyncGate=async function(){if(await repVerificar())return;return _sg.apply(this,arguments)}}
setTimeout(()=>{try{const s=sessaoAtual();if(s&&s.tipo==='google'&&!(nvL().prov))repVerificar()}catch(_){}},1500);
/* Definições › Conta e Acesso: botão «Repor dados» por conta e exportação das ordens */
{const _ac=acCartao;acCartao=async function(){let h=await _ac.apply(this,arguments);try{const loc=acLocal();const C=AC_CENTRAL;const hs={};for(const x of loc.gContas)hs[x.email]=await acHash(x.email);
  loc.gContas.forEach((x,i)=>{const pub=C&&C.repor&&x.repor&&C.repor.some(r=>r.h===hs[x.email]&&r.q===x.repor);const tag=x.repor?` <span class="tag ${pub?'w':'bad'}" title="Ordem de reposição">${ic('refresh',11)} reposição ${pub?'publicada':'por publicar'} · ${new Date(x.repor).toLocaleDateString('pt-PT')}</span>`:'';
    h=h.replace(`<button class="btn sm ico dng" data-acx="${i}"`,`<button class="btn sm ico" data-acrep="${i}" title="${x.repor?'Cancelar a ordem de reposição':'Repor (apagar todos os dados desta conta)'}" aria-label="Repor os dados de ${esc(x.email)}">${ic(x.repor?'x':'refresh',14)}</button><button class="btn sm ico dng" data-acx="${i}"`);
    if(tag)h=h.replace(`<b>${esc(x.email)}</b><small>`,`<b>${esc(x.email)}</b><small>${tag} `)})}catch(e){console.warn(e)}return h}}
{const _ab=acBind;acBind=function(){const r=_ab.apply(this,arguments);const loc=acLocal();
  $$('[data-acrep]').forEach(b=>b.onclick=async()=>{const x=loc.gContas[+b.dataset.acrep];if(!x)return;
    if(x.repor){delete x.repor;save();audit('Contas','Ordem de reposição cancelada',x.email);toast('Ordem cancelada — descarregue e publique a configuração.');}
    else{const v=await avisoModal('Repor os dados de '+x.email+'?',['Na próxima vez que esta conta entrar na EduSpruce, todos os seus dados — no Google Drive e nos aparelhos — são apagados definitivamente e a app começa do zero (útil para repor os dados de demonstração).','A ordem só vale depois de descarregar e publicar a configuração no site. Cumpre-se uma vez; para repetir, dê nova ordem.'],[{t:'Cancelar',v:null},{t:'Dar Ordem de Reposição',c:'dng',v:'sim'}]);if(v!=='sim')return;
      x.repor=Date.now();save();audit('Contas','Ordem de reposição dada',x.email);toast('Ordem registada — agora descarregue e publique a configuração.','aviso')}
    const c=$('#ac-card');if(c)acCartao().then(h=>{c.outerHTML=h;acBind()})});return r}}
/* a configuração descarregada leva as ordens de reposição */
{const _dl=download;download=function(nome,txt,tipo){if(nome==='eduspruce-config.json'){try{const j=JSON.parse(txt);const loc=acLocal();Promise.all(loc.gContas.filter(x=>x.repor).map(async x=>({h:await acHash(x.email),q:x.repor}))).then(R=>{if(R.length)j.reposicoes=R;else delete j.reposicoes;_dl.call(this,nome,JSON.stringify(j,null,2)+'\n',tipo)});return}catch(e){console.warn(e)}}return _dl.apply(this,arguments)}}

/* 0.910 · Jornal Escolar › Quadros — quadro visual livre (notas, listas, links, imagens, colunas, títulos, cores, setas e quadros dentro de quadros) */
try{Object.assign(ICONS,{undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',arrow:'<path d="M5 19 19 5"/><path d="M9 5h10v10"/>',type:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>'})}catch(_){}
const MQ_CORES=['','#f87171','#fb923c','#facc15','#4ade80','#2dd4bf','#60a5fa','#a78bfa','#f472b6','#94a3b8'];
const MQ_T={nota:['pen','Nota'],tarefa:['check','Lista'],link:['link','Link'],imagem:['image','Imagem'],coluna:['layers','Coluna'],quadro:['grid','Quadro'],titulo:['type','Título'],cor:['sparkle','Cor'],seta:['arrow','Seta']};
function MQ(){const jn=UI.mqCtx==='jornal';const j=jn?(S.snj=S.snj||{}):(S.sn=S.sn||{});if(!jn&&!j.quadros&&S.jornal&&Array.isArray(S.jornal.quadros)){j.quadros=S.jornal.quadros;delete S.jornal.quadros}if(jn&&(!Array.isArray(j.quadros)||!j.quadros.length))j.quadros=[{id:'raiz',nome:'Jornal Notes',pai:null,itens:[],setas:[],cor:'#f59e0b'}];if(!Array.isArray(j.quadros)||!j.quadros.length)j.quadros=[{id:'raiz',nome:'Spruce Notes',pai:null,itens:[],setas:[],cor:'#60a5fa'}];j.quadros.forEach(q=>{q.itens=q.itens||[];q.setas=q.setas||[]});return j.quadros}
const mqQ=id=>MQ().find(q=>q.id===id)||MQ()[0];
const mqUI=()=>{const K=UI.mqCtx==='jornal'?'mqj':'mq';UI[K]=UI[K]||{q:'raiz',sel:[],vis:{}};UI.mq=UI.mq||{q:'raiz',sel:[],vis:{}};if(K==='mqj')return UI.mqj;return UI.mq};
const mqVis=qid=>{const u=mqUI();return u.vis[qid]=u.vis[qid]||{x:40,y:30,z:1}};
function mqLimpa(html){const t=document.createElement('template');t.innerHTML=String(html||'');const OK={B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,BR:1,DIV:1,P:1,UL:1,OL:1,LI:1,H3:1,A:1,SPAN:1,BLOCKQUOTE:1,CODE:1};
  const anda=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===1){if(!OK[c.tagName]){const f=document.createDocumentFragment();while(c.firstChild)f.appendChild(c.firstChild);c.replaceWith(f);anda(n);return}
    [...c.attributes].forEach(a=>{if(!(c.tagName==='A'&&a.name==='href'&&/^(https?:|mailto:)/i.test(a.value)))c.removeAttribute(a.name)});if(c.tagName==='A'){c.setAttribute('target','_blank');c.setAttribute('rel','noopener')}anda(c)}else if(c.nodeType!==3)c.remove()})};anda(t.content);return t.innerHTML}
let _mqHist=[],_mqRef=[];
function mqAntes(){const q=mqQ(mqUI().q);_mqHist.push({qid:q.id,j:JSON.stringify({itens:q.itens,setas:q.setas})});if(_mqHist.length>60)_mqHist.shift();_mqRef=[]}
function mqDesfazer(refazer){const A_=refazer?_mqRef:_mqHist,B_=refazer?_mqHist:_mqRef;const h=A_.pop();if(!h)return toast(refazer?'Nada para refazer':'Nada para desfazer');const q=mqQ(h.qid);B_.push({qid:q.id,j:JSON.stringify({itens:q.itens,setas:q.setas})});const o=JSON.parse(h.j);q.itens=o.itens;q.setas=o.setas;mqUI().q=q.id;save();mqRender()}
const mqItem=(q,id)=>q.itens.find(i=>i.id===id);
function mqNovo(t,x,y,extra){if(_mqEd&&window._mqFim)window._mqFim();const q=mqQ(mqUI().q);mqAntes();const it={id:uid(),t,x:Math.round(x),y:Math.round(y),w:{nota:220,tarefa:240,link:240,imagem:260,coluna:270,quadro:150,titulo:320,cor:120}[t]||220,cor:'',pai:null,...(extra||{})};
  if(t==='nota'&&it.txt==null)it.txt='';if(t==='tarefa'){it.tit=it.tit||'Lista';it.l=it.l||[{t:'',f:false}]}if(t==='titulo'&&it.txt==null)it.txt='Título';if(t==='cor')it.hex=it.hex||'#60a5fa';if(t==='coluna')it.tit=it.tit||'Coluna';
  if(t==='quadro'&&!it.ref){const nq={id:uid(),nome:it.nome||'Novo quadro',pai:q.id,itens:[],setas:[],cor:MQ_CORES[1+Math.floor(Math.random()*8)]};MQ().push(nq);it.ref=nq.id}
  q.itens.push(it);mqUI().sel=[it.id];save();mqRender();if(['nota','titulo'].includes(t))setTimeout(()=>mqEditar(it.id),30);if(t==='tarefa')setTimeout(()=>{const i=document.querySelector(`[data-mq="${it.id}"] .mq-tl input[type=text]`);if(i)i.focus()},30);if(t==='coluna'||t==='quadro')setTimeout(()=>{const i=document.querySelector(`[data-mq="${it.id}"] .mq-nm`);if(i){i.focus();i.select&&i.select()}},30);return it}
