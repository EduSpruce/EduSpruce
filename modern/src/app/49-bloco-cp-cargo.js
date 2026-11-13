/* =====================================================================
   0.995 · Módulo opcional «Coord. PROFIJ» — Coordenador(a) do Programa PROFIJ
   (Regulamento PROFIJ: Portaria n.º 52/2016, alterada pela Portaria n.º 86/2018)
   ===================================================================== */
TITLES.cprofij='Coordenação PROFIJ';
if(!CARGOS.includes('Coordenador(a) do PROFIJ'))CARGOS.splice(CARGOS.indexOf('Coordenador(a) do jornal da escola'),0,'Coordenador(a) do PROFIJ');
const cpCargo=()=>{try{const pf=perfil();return Object.values(pf.porEscola||{}).concat([pf]).some(o=>((o&&o.cargos)||[]).some(c=>/profij/i.test(c)))}catch(_){return false}};
const cpTurmas=a=>(a?a.turmas:[]).filter(t=>ofertaDe(t)==='profij');
const cpOn=()=>{const m=S.cfg.modulos&&S.cfg.modulos.cprofij;if(m===false)return false;if(m===true)return true;return cpCargo()||!!(A()&&A().demo&&cpTurmas(A()).length)};
const CP_LEG0=[{id:'l1',t:'Portaria n.º 52/2016 — Regulamento dos cursos do Programa Formativo de Inserção de Jovens (PROFIJ)',u:'',n:'Regulamento base do programa.'},
  {id:'l2',t:'Portaria n.º 86/2018 — altera o Regulamento PROFIJ',u:'https://edu.azores.gov.pt/wp-content/uploads/2017/05/Portaria-N.º-86-2018.pdf',n:'Turmas de 10 a 25 alunos; média de cada componente, FPCT, PAF e classificação final do curso ≥ 10.'},
  {id:'l3',t:'Regimento do Conselho dos Cursos de Formação Profissional (da escola)',u:'',n:'Acrescente a ligação para o regimento da sua escola.'}];
function CP(){const c=S.cprofij=S.cprofij||{};c.leg=c.leg||CP_LEG0.map(x=>({...x}));c.anos=c.anos||{};const a=A();const k=a?a.id:'_';const y=c.anos[k]=c.anos[k]||{};
  y.ent=y.ent||[];y.fpct=y.fpct||{};y.provas=y.provas||[];y.dts=y.dts||{};y.man=y.man||{};return {c,y,a}}
const CP_COMP=[['sociocultural','Sociocult.'],['cientifica','Científica'],['tecnologica','Tecnológica']];
const cpCompKey=t=>{const n=compDe(t.disciplina)||'';return /Sociocultural/.test(n)?'sociocultural':/Científica/.test(n)?'cientifica':/Tecnológica/.test(n)||ehComp(t.disciplina)?'tecnologica':/Prática/.test(n)?'pratica':'sociocultural'};
const cpAlKey=x=>String(x.proc||x.processo||'')||((x.num||'')+'|'+normT(x.nome||''));
/* turmas PROFIJ agrupadas pela classe (o mesmo nome em várias disciplinas) */
function cpClasses(a){const M={};cpTurmas(a).forEach(t=>{const n=t.nome;(M[n]=M[n]||{nome:n,disc:[],al:{}}).disc.push(t);alunosAval(t).forEach(x=>{const k=cpAlKey(x);if(!M[n].al[k])M[n].al[k]={k,nome:x.nome,num:x.num,ref:x,t}})});
  return Object.values(M).map(c=>({...c,curso:(c.disc.find(t=>t.curso)||{}).curso||'',anoEsc:(c.disc[0]||{}).anoEsc||'',formandos:Object.values(c.al).sort((p,q)=>(+p.num||0)-(+q.num||0)||p.nome.localeCompare(q.nome,'pt'))})).sort((p,q)=>p.nome.localeCompare(q.nome,'pt',{numeric:true}))}
/* classificação 0–20 de um formando numa disciplina registada na app */
function cpNotaDisc(t,a,al){const x=alunosAval(t).find(z=>cpAlKey(z)===al.k);if(!x)return null;
  if(Array.isArray(t.modulos)&&t.modulos.length){const v=t.modulos.map(m=>{try{return notaMod(t,x.id,m.id)}catch(_){return null}}).filter(v=>v!=null);if(v.length)return avg(v)}
  try{const f=ponderada(t,pctsFinal(t,x.id));if(f!=null)return f*20}catch(_){}try{const P=periodos();for(let i=P.length-1;i>=0;i--){const f=ponderada(t,pctsPer(t,x.id,P[i]));if(f!=null)return f*20}}catch(_){}return null}
function cpLinha(cl,al,a){const {y}=CP();const man=y.man[cl.nome+'|'+al.k]||{};const r={comp:{},fp:null,paf:null};
  CP_COMP.forEach(([k])=>{if(man[k]!=null&&man[k]!==''){r.comp[k]={v:+man[k],man:true};return}const v=cl.disc.filter(t=>cpCompKey(t)===k).map(t=>cpNotaDisc(t,a,al)).filter(v=>v!=null);r.comp[k]=v.length?{v:avg(v),n:v.length}:null});
  const f=y.fpct[cl.nome+'|'+al.k];if(f&&f.nota!=null&&f.nota!=='')r.fp=+f.nota;
  const pv=y.provas.filter(p=>p.tipo==='PAF'&&p.turma===cl.nome&&(p.alunos||[]).includes(al.k)&&p.notas&&p.notas[al.k]!=null&&p.notas[al.k]!=='');if(pv.length)r.paf=+pv[pv.length-1].notas[al.k];
  const vals=[...CP_COMP.map(([k])=>r.comp[k]&&r.comp[k].v),r.fp,r.paf];const neg=vals.some(v=>v!=null&&Math.round(v)<10);const todos=vals.every(v=>v!=null);
  r.sit=neg?'risco':todos?'ok':'curso';return r}
const cpFmt=v=>v==null?'—':(Math.round(v*10)/10).toString().replace('.',',');
const cpCls=v=>v==null?'mut':Math.round(v)<10?'neg':'pos';
function cpFpctEst(f){if(!f||!f.ent)return 'colocar';const hj=isoHoje();if(f.nota!=null&&f.nota!=='')return 'avaliado';if(f.fim&&f.fim<hj)return 'avaliar';if(f.ini&&f.ini<=hj)return 'curso';return 'colocado'}
const CP_FE={colocar:['Por colocar','bad'],colocado:['Colocado',''],curso:['Em curso','w'],avaliar:['Por avaliar','w'],avaliado:['Avaliado','ok']};
function cpAtencao(){const {y,a}=CP();if(!a)return [];const L=[];const hj=isoHoje();const C=cpClasses(a);
  C.forEach(cl=>cl.formandos.forEach(al=>{const r=cpLinha(cl,al,a);if(r.sit==='risco')L.push({c:'bad',ic:'alert',t:al.nome+' · '+cl.nome,s:'Componente, FPCT ou PAF abaixo de 10',tab:'turmas'});
    const e=cpFpctEst(y.fpct[cl.nome+'|'+al.k]);if(e==='colocar')L.push({c:'w',ic:'building',t:al.nome+' · '+cl.nome,s:'FPCT por colocar numa entidade',tab:'fpct'});else if(e==='avaliar')L.push({c:'w',ic:'clipboard',t:al.nome+' · '+cl.nome,s:'FPCT terminada — falta a classificação',tab:'fpct'})}));
  y.provas.forEach(p=>{if(p.data&&p.data>=hj&&diasEntre(hj,p.data)<=21){if(!(p.juri||'').trim())L.push({c:'w',ic:'users',t:p.tipo+' · '+p.turma+' · '+fmtIsoL(p.data),s:'Prova sem júri definido',tab:(p.tipo==='PEA'?'pea':'paf')});else L.push({c:'',ic:'calendar',t:p.tipo+' · '+p.turma,s:'Prova '+(p.data===hj?'hoje':'daqui a '+diasEntre(hj,p.data)+' dias')+(p.hora?' às '+p.hora:''),tab:(p.tipo==='PEA'?'pea':'paf')})}
    if(p.data&&p.data<hj&&(p.alunos||[]).some(k=>!p.notas||p.notas[k]==null||p.notas[k]===''))L.push({c:'w',ic:'pen',t:p.tipo+' · '+p.turma+' · '+fmtIsoL(p.data),s:'Prova realizada — faltam classificações',tab:(p.tipo==='PEA'?'pea':'paf')})});
  return L}
function cpNav(){const side=$('#side');if(!side)return;let b=$('#side [data-v="cprofij"]');if(!b){const j=$('#side [data-v="jornal"]');if(!j)return;j.insertAdjacentHTML('afterend',`<button class="nav" data-v="cprofij" title="Coordenação do Programa PROFIJ"><span data-ico>${ic('award',18)}</span><span class="lbl">Coord. PROFIJ</span><span class="nbadge" id="cpBadge" hidden></span></button>`);b=$('#side [data-v="cprofij"]');b.onclick=()=>go('cprofij')}
  b.style.display=cpOn()?'':'none';const n=cpOn()?cpAtencao().filter(x=>x.c==='bad').length:0;const bd=$('#cpBadge');if(bd){bd.hidden=!n;bd.textContent=n}}
function vCProfij(){if(!cpOn()){$('#view').innerHTML=`<div class="card empty">${ic('award',30)}<br><b>O módulo Coord. PROFIJ está desativado</b><br><span class="mut">Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor, ou ative-o em Definições › Geral › Módulos Opcionais.</span><br><br><button class="btn pri" id="cp-on">Ativar o Módulo</button></div>`;$('#cp-on').onclick=()=>{cpAtivar(true);go('cprofij')};return}
  const {y,a,c}=CP();if(UI.cpTab==='provas')UI.cpTab='paf';if(UI.cpTab==='paf'&&!cpAlgumTerminal())UI.cpTab='fpct';const tab=UI.cpTab||'painel';const C=cpClasses(a);const nF=C.reduce((s,x)=>s+x.formandos.length,0);const AT=cpAtencao();
  barBtns([{id:'b-cpcsv',t:ic('download',15)+' Exportar CSV',f:cpCSV},{id:'b-cpics',t:ic('calendar',15)+' Provas (.ics)',f:cpICS},{id:'b-cpcfg',t:ic('gear',15)+' Opções',f:cpOpcoes}]);
  const linhas=[];C.forEach(cl=>cl.formandos.forEach(al=>linhas.push({cl,al,r:cpLinha(cl,al,a)})));
  const risco=linhas.filter(l=>l.r.sit==='risco').length,porCol=linhas.filter(l=>cpFpctEst(y.fpct[l.cl.nome+'|'+l.al.k])==='colocar').length;const hj=isoHoje();const prox=y.provas.filter(p=>p.data&&p.data>=hj&&diasEntre(hj,p.data)<=30).length;
  const kp=(k,i,l,v,s,cls)=>`<button type="button" class="pnk ${cls||''}" data-cpk="${k}"><span class="pnkl">${ic(i,15)} ${l}</span><b>${v}</b><small>${s}</small></button>`;
  const CPG=cpGrupos();const grp=CPG.find(g=>g.t.some(x=>x[0]===tab))||CPG[1];const tabs=grp.t;
  let corpo='';
  if(tab==='painel')corpo=`<div class="png2"><section class="card pnat"><div class="row"><h2 style="margin:0">${ic('alert',18)} Precisa da Sua Atenção</h2><span class="tag ${AT.length?'bad':'ok'}">${AT.length||'tudo em dia'}</span></div>
      ${AT.length?`<div class="pnatl">${AT.slice(0,14).map(x=>`<div class="pnai ${x.c}"><span class="pnaic">${ic(x.ic,16)}</span><span class="pnaib"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span><span class="pnaia"><button type="button" class="btn sm" data-cptab="${x.tab}">Abrir</button></span></div>`).join('')}${AT.length>14?`<p class="mut" style="margin:6px 0 0">… e mais ${AT.length-14}</p>`:''}</div>`:`<p class="mut" style="margin:10px 0 0">${ic('check',14)} Nada pendente no programa.</p>`}</section>
    <section class="card"><div class="row"><h2 style="margin:0">${ic('layers',18)} Turmas do Programa</h2><span class="sp1"></span><button class="btn sm" data-cptab="turmas">Ver</button></div>
      ${C.length?`<table class="lst cpres"><thead><tr><th>Turma</th><th>Curso</th><th>Formandos</th><th>Em risco</th><th>FPCT</th></tr></thead><tbody>${C.map(cl=>{const L=linhas.filter(l=>l.cl===cl);const col=L.filter(l=>cpFpctEst(y.fpct[cl.nome+'|'+l.al.k])!=='colocar').length;return `<tr><td><b>${esc(cl.nome)}</b></td><td>${esc(cl.curso||'—')}</td><td>${cl.formandos.length}</td><td>${L.filter(l=>l.r.sit==='risco').length?`<span class="tag bad">${L.filter(l=>l.r.sit==='risco').length}</span>`:'0'}</td><td>${col}/${L.length} colocados</td></tr>`}).join('')}</tbody></table>`:`<p class="mut">Ainda não há turmas PROFIJ neste ano letivo. Crie-as em Ano Letivo e Turmas (oferta PROFIJ).</p>`}</section></div>`;
  if(tab==='turmas')corpo=C.map(cl=>{const dt=y.dts[cl.nome]!=null?y.dts[cl.nome]:(()=>{try{return dtDe(a,cl.nome)||''}catch(_){return ''}})();
    return `<section class="card cpcl"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} ${esc(cl.nome)}</h2><span class="mut">${esc(cl.curso||'Curso por definir')}${cl.anoEsc?' · '+esc(cl.anoEsc):''} · ${cl.formandos.length} formandos · ${cl.disc.length} disciplina(s) nesta app</span><span class="sp1"></span><label class="cpdt">Diretor(a) de turma <input data-cpdt="${esc(cl.nome)}" value="${esc(dt)}" placeholder="Nome"></label></div>
     <div class="tblw"><table class="lst cpt"><thead><tr><th>N.º</th><th>Formando</th>${CP_COMP.map(([,l])=>`<th>${l}</th>`).join('')}<th>FPCT</th><th>PAF</th><th>Situação</th></tr></thead><tbody>
     ${cl.formandos.map(al=>{const r=cpLinha(cl,al,a);return `<tr><td class="n">${esc(al.num||'')}</td><td style="text-align:left">${esc(al.nome)}</td>${CP_COMP.map(([k])=>{const v=r.comp[k];return `<td><button type="button" class="cpv ${cpCls(v&&v.v)} ${v&&v.man?'man':''}" data-cpman="${esc(cl.nome)}|${esc(al.k)}|${k}" title="${v&&v.man?'Média escrita à mão — toque para mudar':v?'Calculada a partir de '+v.n+' disciplina(s) desta app — toque para escrever a média da pauta':'Toque para escrever a média da pauta'}">${cpFmt(v&&v.v)}</button></td>`}).join('')}
       <td><span class="${cpCls(r.fp)}">${cpFmt(r.fp)}</span></td><td><span class="${cpCls(r.paf)}">${cpFmt(r.paf)}</span></td><td>${r.sit==='risco'?'<span class="tag bad">Em risco</span>':r.sit==='ok'?'<span class="tag ok">Tudo ≥ 10</span>':'<span class="tag">Em curso</span>'}</td></tr>`}).join('')}</tbody></table></div></section>`}).join('')||`<div class="card empty">Sem turmas PROFIJ neste ano letivo.</div>`;
  if(tab==='turmas'&&C.length)corpo=`<p class="hint" style="margin:0 0 10px">As médias vêm das disciplinas registadas nesta app (as suas). Para as dos colegas, toque na célula e escreva a média da pauta. A conclusão exige média ≥ 10 em cada componente, na FPCT e na PAF (Portaria n.º 86/2018, art. 27.º).</p>`+corpo;
  if(tab==='fpct')corpo=`<section class="card" id="cp-ptf"></section>`+`<section class="card"><div class="row" style="gap:10px"><h2 style="margin:0">${ic('building',18)} Entidades de Acolhimento</h2><span class="sp1"></span><button class="btn pri sm" id="cp-ent">${ic('plus',14)} Entidade</button></div>
     ${y.ent.length?`<div class="cpents">${y.ent.map(e=>{const n=Object.values(y.fpct).filter(f=>f.ent===e.id).length;return `<button type="button" class="cpent" data-cpent="${e.id}"><b>${esc(e.nome)}</b><small>${esc([e.area,e.tutor?'Tutor: '+e.tutor:'',e.tel].filter(Boolean).join(' · '))}</small><span class="tag">${n} formando(s)</span>${e.prot?`<span class="tag ok">${ic('check',11)} protocolo</span>`:'<span class="tag w">sem protocolo</span>'}</button>`}).join('')}</div>`:'<p class="mut">Ainda não há entidades. Acrescente as empresas e instituições que recebem os formandos.</p>'}</section>
    ${C.map(cl=>`<section class="card"><h2>${ic('clipboard',18)} Formação Prática em Contexto de Trabalho · ${esc(cl.nome)}</h2><div class="tblw"><table class="lst cpf"><thead><tr><th>Formando</th><th>Entidade</th><th>Início</th><th>Fim</th><th>Horas prev.</th><th>Horas feitas</th><th>Classif.</th><th>Estado</th></tr></thead><tbody>
      ${cl.formandos.map(al=>{const K=cl.nome+'|'+al.k;const f=y.fpct[K]||{};const e=cpFpctEst(f);return `<tr><td style="text-align:left">${esc(al.nome)}</td><td><select data-cpf="${esc(K)}|ent"><option value="">— escolher —</option>${y.ent.map(x=>`<option value="${x.id}" ${f.ent===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></td>
        <td><input type="date" data-cpf="${esc(K)}|ini" value="${esc(f.ini||'')}"></td><td><input type="date" data-cpf="${esc(K)}|fim" value="${esc(f.fim||'')}"></td><td><input type="number" min="0" step="1" data-cpf="${esc(K)}|hp" value="${esc(f.hp!=null?f.hp:'')}" style="width:76px"></td><td><input type="number" min="0" step="1" data-cpf="${esc(K)}|hr" value="${esc(f.hr!=null?f.hr:'')}" style="width:76px"></td><td><input type="number" min="0" max="20" step="1" data-cpf="${esc(K)}|nota" value="${esc(f.nota!=null?f.nota:'')}" style="width:64px"></td><td><span class="tag ${CP_FE[e][1]}">${CP_FE[e][0]}</span></td></tr>`}).join('')}</tbody></table></div></section>`).join('')}`;
  if(tab==='paf'||tab==='pea'){const TP=tab==='pea'?'PEA':'PAF';const P=y.provas.filter(p=>p.tipo===TP).sort((p,q)=>(p.data||'9').localeCompare(q.data||'9'));corpo=`<section class="card"><div class="row" style="gap:10px"><h2 style="margin:0">${ic('clipboard',18)} ${TP==='PAF'?'Prova de Avaliação Final (PAF)':'Prova Especial de Avaliação (PEA)'}</h2><span class="mut">${TP==='PAF'?'no fim do curso, com júri; a classificação entra na CFC':'de recuperação, quando o formando não obteve aprovação'}</span><span class="sp1"></span><button class="btn pri sm" id="cp-prova">${ic('plus',14)} Nova ${tab==='pea'?'PEA':'PAF'}</button></div>
     ${P.length?`<div class="tblw"><table class="lst"><thead><tr><th>Tipo</th><th>Turma</th><th>Data</th><th>Hora</th><th>Sala</th><th>Formandos</th><th>Júri</th><th>Classificadas</th><th></th></tr></thead><tbody>${P.map(p=>{const n=(p.alunos||[]).length,cl=(p.alunos||[]).filter(k=>p.notas&&p.notas[k]!=null&&p.notas[k]!=='').length;return `<tr><td><span class="tag ${p.tipo==='PAF'?'ok':''}">${esc(p.tipo)}</span>${p.ufcd?' <small class="mut">'+esc(p.ufcd)+'</small>':''}</td><td><b>${esc(p.turma)}</b></td><td>${p.data?esc(fmtIsoL(p.data)):'—'}</td><td>${esc(p.hora||'—')}</td><td>${esc(p.sala||'—')}</td><td>${n}</td><td>${(p.juri||'').trim()?esc(p.juri):'<span class="tag w">por definir</span>'}</td><td>${cl}/${n}</td><td class="act"><button class="btn sm" data-cpp="${p.id}">${ic('pencil',14)} Abrir</button></td></tr>`}).join('')}</tbody></table></div>`:(tab==='pea'?'<p class="mut">Ainda não há Provas Especiais de Avaliação marcadas. Marque-as quando um formando precisar de recuperar.</p>':'<p class="mut">Ainda não há Provas de Avaliação Final marcadas. Marque a PAF de cada turma.</p>')}</section>`}
  if(tab==='cc'){const R=(()=>{try{return reunioes(a).filter(r=>/profij|conselho dos cursos|forma[çc][ãa]o profissional/i.test(reunTitulo(r,a)+' '+(r.tipo||'')+' '+(r.notas||'')))}catch(_){return []}})().sort((p,q)=>q.data.localeCompare(p.data));
    corpo=`<section class="card"><h2>${ic('meet',18)} Conselho dos Cursos (PROFIJ)</h2><p class="hint" style="margin-top:0">Presidido pelo(a) coordenador(a), com os diretores de turma das turmas PROFIJ. Planeia e acompanha as Provas Especiais de Avaliação, a Formação Prática em Contexto de Trabalho e a Prova de Avaliação Final.</p>
      <h3>Membros</h3><ul class="cpmem"><li><b>${esc(S.cfg.professor||'Coordenador(a)')}</b> — coordenador(a)</li>${C.map(cl=>{const dt=y.dts[cl.nome]!=null?y.dts[cl.nome]:(()=>{try{return dtDe(a,cl.nome)||''}catch(_){return ''}})();return `<li>${dt?esc(dt):'<span class="mut">DT por indicar</span>'} — diretor(a) de turma do ${esc(cl.nome)}</li>`}).join('')}</ul>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn pri" id="cp-reun">${ic('plus',14)} Convocar Reunião</button><span class="mut" style="font-size:12.5px">Ponha «Conselho dos Cursos PROFIJ» no título para a reunião aparecer aqui.</span></div></section>
      <section class="card"><h2>${ic('list',18)} Reuniões</h2>${R.length?`<ul class="iml">${R.map(r=>{const d=dataDeIso(r.data);return `<li class="imli"><span class="imdt"><b>${d.getDate()}</b><small>${MESES[d.getMonth()+1].slice(0,3)}</small></span><button type="button" class="imlb" data-cpr="${r.id}"><span><b>${esc(reunTitulo(r,a))}</b> <small>${r.semHora?'':fmtHM(r.ini)}${r.local?' · '+esc(r.local):''}</small></span></button>${r.data<isoHoje()?(r.ata||(r.notas||'').trim()?'<span class="tag ok">ata</span>':'<span class="tag w">sem ata</span>'):''}</li>`}).join('')}</ul>`:'<p class="mut">Ainda não há reuniões do Conselho dos Cursos.</p>'}</section>`}
  if(tab==='leg')corpo=`<section class="card"><div class="row"><h2 style="margin:0">${ic('book',18)} Legislação e Documentos de Referência</h2><span class="sp1"></span><button class="btn sm" id="cp-leg">${ic('plus',14)} Acrescentar</button></div>
      <ul class="cpleg">${c.leg.map(l=>`<li><div><b>${l.u?`<a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)}</a>`:esc(l.t)}</b>${l.n?`<small>${esc(l.n)}</small>`:''}</div><button class="btn sm ico" data-cplx="${l.id}" aria-label="Editar">${ic('pencil',14)}</button></li>`).join('')}</ul>
      <p class="hint">As ligações ficam guardadas na sua conta e servem para partilhar com os diretores de turma nas reuniões.</p></section>`;
  if(tab==='matriz')corpo=cpmMatrizHTML(a,C);if(tab==='plano')corpo=cpmPlanoHTML(a,C);if(tab==='dist')corpo=cpdHTML(a,C,'semanal');if(tab==='equipa')corpo=cpdHTML(a,C,'equipa');if(tab==='pontos')corpo=cpmMatrizHTML(a,C);if(tab==='recup')corpo=cpRecupHTML(a);if(tab==='pautas')corpo=`<section class="card" id="cp-ptc"></section>`;if(tab==='oficiais')corpo=`<section class="card" id="cp-pto"></section>`;
  $('#view').innerHTML=`<div class="cp ${tab==='matriz'?'m-criar':tab==='pontos'?'m-ponto':''}"><div class="pnks">${kp('turmas','layers','Turmas PROFIJ',C.length,nF+' formandos')}${kp('risco','alert','Em Risco',risco,'componente, FPCT ou PAF < 10',risco?'bad':'')}${kp('fpct','building','FPCT por Colocar',porCol,y.ent.length+' entidade(s)',porCol?'w':'')}${kp('provas','clipboard','Provas (30 dias)',prox,y.provas.length+' marcadas')}</div>
    ${cpGruposHTML(CPG,grp)}<div class="tabs noprint cptabs" role="tablist" aria-label="${esc(grp.n)}" ${tabs.length<2?'hidden':''}>${tabs.map(([k,i,l,c])=>`<button data-cptab="${k}" role="tab" aria-selected="${tab===k}" title="${esc(l)}" class="${tab===k?'on':''}">${ic(i,15)}<span class="tl">${l}</span><span class="ts">${c||l}</span></button>`).join('')}</div>${corpo}</div>`;
  const v=$('#view');const re=()=>manterPosicao(vCProfij);
  v.querySelectorAll('[data-cptab]').forEach(b=>b.onclick=()=>{UI.cpTab=b.dataset.cptab;vCProfij()});
  if(tab==='matriz')cpmBindMatriz(v,a);if(tab==='plano')cpmBindPlano(v,a);if(tab==='dist'||tab==='equipa')cpdBind(v,a);if(tab==='pontos')cpmBindMatriz(v,a);if(tab==='recup')cpRecupBind(v);v.querySelectorAll('[data-cpg]').forEach(b=>b.onclick=()=>{const g=CPG.find(x=>x.k===b.dataset.cpg);UI.cpTab=(g.t.find(x=>x[0]===UI['cpUlt_'+g.k])||g.t[0])[0];vCProfij()});UI['cpUlt_'+grp.k]=tab;{const z=v.querySelector('#cp-ptf');if(z)ptAbrir(null,{alvo:z,modo:'fpct'});const z2=v.querySelector('#cp-ptc');if(z2)ptAbrir(null,{alvo:z2,modo:'cfc'});const z3=v.querySelector('#cp-pto');if(z3)ptAbrir(null,{alvo:z3,modo:'docs'})}
  v.querySelectorAll('[data-cpk]').forEach(b=>b.onclick=()=>{UI.cpTab={turmas:'turmas',risco:'turmas',fpct:'fpct',provas:'paf'}[b.dataset.cpk];vCProfij()});
  v.querySelectorAll('[data-cpdt]').forEach(i=>i.onchange=()=>{y.dts[i.dataset.cpdt]=i.value.trim();save()});
  v.querySelectorAll('[data-cpman]').forEach(b=>b.onclick=()=>{const [cn,k,comp]=b.dataset.cpman.split('|');const K=cn+'|'+k;const atual=(y.man[K]||{})[comp];const r=prompt('Média da componente '+CP_COMP.find(x=>x[0]===comp)[1]+' (0–20), tal como na pauta.\nDeixe vazio para voltar ao cálculo automático.',atual!=null?atual:'');if(r==null)return;const n=r.trim()===''?null:+r.replace(',','.');if(n!=null&&(isNaN(n)||n<0||n>20))return toast('Escreva um valor de 0 a 20','erro');y.man[K]=y.man[K]||{};if(n==null)delete y.man[K][comp];else y.man[K][comp]=n;save();re()});
  v.querySelectorAll('[data-cpf]').forEach(i=>i.onchange=()=>{const p=i.dataset.cpf.split('|');const campo=p.pop();const K=p.join('|');const f=y.fpct[K]=y.fpct[K]||{};let val=i.value;if(['hp','hr','nota'].includes(campo))val=val===''?null:Math.max(0,campo==='nota'?Math.min(20,+val):+val);f[campo]=val;save();re()});
  const be=$('#cp-ent');if(be)be.onclick=()=>cpEntDlg();v.querySelectorAll('[data-cpent]').forEach(b=>b.onclick=()=>cpEntDlg(b.dataset.cpent));
  const bp=$('#cp-prova');if(bp)bp.onclick=()=>cpProvaDlg(null,tab==='pea'?'PEA':'PAF');v.querySelectorAll('[data-cpp]').forEach(b=>b.onclick=()=>cpProvaDlg(b.dataset.cpp));
  const br=$('#cp-reun');if(br)br.onclick=()=>{go('reunioes');toast('Nova reunião: escreva «Conselho dos Cursos PROFIJ» no título e convoque os diretores de turma','ok')};
  v.querySelectorAll('[data-cpr]').forEach(b=>b.onclick=()=>{try{reuniaoVer(b.dataset.cpr)}catch(_){go('reunioes')}});
  const bl=$('#cp-leg');if(bl)bl.onclick=()=>cpLegDlg();v.querySelectorAll('[data-cplx]').forEach(b=>b.onclick=()=>cpLegDlg(b.dataset.cplx));
  cpNav()}
function cpEntDlg(id){const {y}=CP();const e=id?y.ent.find(x=>x.id===id):{id:uid(),nome:''};if(!e)return;const F=[['nome','Nome da entidade'],['area','Área / setor'],['morada','Morada'],['tutor','Tutor(a) na entidade'],['tel','Telefone'],['email','E-mail'],['prot','Protocolo assinado em (data)','date'],['nota','Notas']];
  openDrawer(id?'Entidade de Acolhimento':'Nova Entidade de Acolhimento',`<div class="ed">${F.map(([k,l,tp])=>`<label>${l}</label>${k==='nota'?`<textarea id="ce-${k}" rows="3">${esc(e[k]||'')}</textarea>`:`<input id="ce-${k}" ${tp?`type="${tp}"`:''} value="${esc(e[k]||'')}">`}`).join('')}
   <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="ce-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="ce-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#ce-ok').onclick=()=>{F.forEach(([k])=>e[k]=$('#ce-'+k).value.trim());if(!e.nome)return toast('Escreva o nome da entidade','erro');if(!id)y.ent.push(e);save();audit('Coord. PROFIJ',id?'Entidade alterada':'Entidade criada',e.nome);closeDrawer();vCProfij()};
  const d=$('#ce-del');if(d)d.onclick=()=>{if(!confirm('Apagar a entidade «'+e.nome+'»? Os formandos colocados ficam sem entidade.'))return;y.ent=y.ent.filter(x=>x!==e);Object.values(y.fpct).forEach(f=>{if(f.ent===e.id)f.ent=''});save();closeDrawer();vCProfij()}}
function cpProvaDlg(id,tp){const {y,a}=CP();const C=cpClasses(a);const p=id?y.provas.find(x=>x.id===id):{id:uid(),tipo:tp||'PAF',turma:(C[0]||{}).nome||'',alunos:[],notas:{}};if(!p)return;
  const desenha=()=>{const cl=C.find(x=>x.nome===p.turma);openDrawer((id?'':'Nova ')+(p.tipo==='PEA'?'Prova Especial de Avaliação (PEA)':'Prova de Avaliação Final (PAF)'),`<div class="ed"><div class="jn-g3"><div><label>Tipo</label><select id="cq-tipo"><option value="PAF" ${p.tipo==='PAF'?'selected':''}>PAF — Prova de Avaliação Final</option><option value="PEA" ${p.tipo==='PEA'?'selected':''}>PEA — Prova Especial de Avaliação</option></select></div><div><label>Turma</label><select id="cq-turma">${C.map(x=>`<option ${x.nome===p.turma?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></div><div><label>UFCD / disciplina (PEA)</label><input id="cq-ufcd" value="${esc(p.ufcd||'')}" placeholder="opcional"></div></div>
    <div class="jn-g3"><div><label>Data</label><input type="date" id="cq-data" value="${esc(p.data||'')}"></div><div><label>Hora</label><input type="time" id="cq-hora" value="${esc(p.hora||'')}"></div><div><label>Sala</label><input id="cq-sala" value="${esc(p.sala||'')}"></div></div>
    <label>Júri</label><input id="cq-juri" value="${esc(p.juri||'')}" placeholder="Nomes, separados por vírgulas">
    <label>Formandos e classificações (0–20)</label><div class="cpal">${cl?cl.formandos.map(al=>`<div class="cpali"><label class="chk"><input type="checkbox" data-cqa="${esc(al.k)}" ${(p.alunos||[]).includes(al.k)?'checked':''}> ${esc(al.num?al.num+'. ':'')}${esc(al.nome)}</label><input type="number" min="0" max="20" step="1" data-cqn="${esc(al.k)}" value="${esc(p.notas&&p.notas[al.k]!=null?p.notas[al.k]:'')}" placeholder="—"></div>`).join(''):'<p class="mut">Escolha a turma.</p>'}</div>
    <div class="row" style="gap:8px;margin:6px 0 0"><button class="btn sm" id="cq-todos">Todos</button><button class="btn sm" id="cq-nenhum">Nenhum</button></div>
    <label>Notas</label><textarea id="cq-nota" rows="2">${esc(p.nota||'')}</textarea>
    <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="cq-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="cq-ok">${ic('check',15)} Guardar</button></div></div>`);
    const ler=()=>{p.tipo=$('#cq-tipo').value;p.ufcd=$('#cq-ufcd').value.trim();p.data=$('#cq-data').value;p.hora=$('#cq-hora').value;p.sala=$('#cq-sala').value.trim();p.juri=$('#cq-juri').value.trim();p.nota=$('#cq-nota').value.trim();
      p.alunos=[...document.querySelectorAll('[data-cqa]')].filter(x=>x.checked).map(x=>x.dataset.cqa);p.notas=p.notas||{};document.querySelectorAll('[data-cqn]').forEach(x=>{const v=x.value===''?null:Math.max(0,Math.min(20,+x.value));if(v==null)delete p.notas[x.dataset.cqn];else p.notas[x.dataset.cqn]=v})};
    $('#cq-turma').onchange=()=>{ler();p.turma=$('#cq-turma').value;p.alunos=[];desenha()};
    $('#cq-todos').onclick=()=>document.querySelectorAll('[data-cqa]').forEach(x=>x.checked=true);$('#cq-nenhum').onclick=()=>document.querySelectorAll('[data-cqa]').forEach(x=>x.checked=false);
    $('#cq-ok').onclick=()=>{ler();if(!p.turma)return toast('Escolha a turma','erro');if(!id&&!y.provas.includes(p))y.provas.push(p);save();audit('Coord. PROFIJ',id?'Prova alterada':'Prova marcada',p.tipo+' · '+p.turma+(p.data?' · '+p.data:''));closeDrawer();vCProfij()};
    const d=$('#cq-del');if(d)d.onclick=()=>{if(!confirm('Apagar esta prova?'))return;y.provas=y.provas.filter(x=>x!==p);save();closeDrawer();vCProfij()}};
  if(!id&&!p.alunos.length){const cl=C.find(x=>x.nome===p.turma);if(cl&&p.tipo==='PAF')p.alunos=cl.formandos.map(x=>x.k)}desenha()}
function cpLegDlg(id){const {c}=CP();const l=id?c.leg.find(x=>x.id===id):{id:uid(),t:'',u:'',n:''};if(!l)return;
  openDrawer(id?'Documento de Referência':'Novo Documento de Referência',`<div class="ed"><label>Título</label><input id="cl-t" value="${esc(l.t)}"><label>Ligação (opcional)</label><input id="cl-u" type="url" value="${esc(l.u||'')}" placeholder="https://…"><label>Nota</label><textarea id="cl-n" rows="3">${esc(l.n||'')}</textarea>
   <div class="row" style="margin-top:12px">${id?`<button class="btn dng" id="cl-del">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn pri" id="cl-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#cl-ok').onclick=()=>{l.t=$('#cl-t').value.trim();l.u=$('#cl-u').value.trim();l.n=$('#cl-n').value.trim();if(!l.t)return toast('Escreva o título','erro');if(l.u&&!/^https?:\/\//i.test(l.u))l.u='https://'+l.u;if(!id)c.leg.push(l);save();closeDrawer();vCProfij()};
  const d=$('#cl-del');if(d)d.onclick=()=>{c.leg=c.leg.filter(x=>x!==l);save();closeDrawer();vCProfij()}}
function cpCSV(){const {y,a}=CP();const R=[['Turma','Curso','N.º','Formando',...CP_COMP.map(([,l])=>l),'FPCT entidade','FPCT início','FPCT fim','FPCT horas','FPCT classificação','PAF','Situação']];
  cpClasses(a).forEach(cl=>cl.formandos.forEach(al=>{const r=cpLinha(cl,al,a);const f=y.fpct[cl.nome+'|'+al.k]||{};const e=y.ent.find(x=>x.id===f.ent);R.push([cl.nome,cl.curso,al.num,al.nome,...CP_COMP.map(([k])=>r.comp[k]?cpFmt(r.comp[k].v):''),e?e.nome:'',f.ini||'',f.fim||'',f.hr!=null?f.hr:'',f.nota!=null?f.nota:'',r.paf!=null?r.paf:'',{risco:'Em risco',ok:'Tudo ≥ 10',curso:'Em curso'}[r.sit]])}));
  download('Coordenação PROFIJ.csv',csv(R),'text/csv')}
function cpICS(){const {y}=CP();const P=y.provas.filter(p=>p.data);if(!P.length)return toast('Não há provas com data','aviso');
  const ev=P.map(p=>{const [h,m]=(p.hora||'09:00').split(':').map(Number);const d=dataDeIso(p.data);d.setHours(h,m||0,0,0);const f=new Date(d.getTime()+90*6e4);
    return ['BEGIN:VEVENT','UID:cp-'+p.id+'@eduspruce.app','DTSTAMP:'+icsData(new Date()),'DTSTART:'+icsData(d),'DTEND:'+icsData(f),'SUMMARY:'+icsEsc(p.tipo+' · '+p.turma+(p.ufcd?' · '+p.ufcd:'')),p.sala?'LOCATION:'+icsEsc(p.sala):'','DESCRIPTION:'+icsEsc('Júri: '+(p.juri||'por definir')),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(p.tipo+' · '+p.turma),'TRIGGER:-P1D','END:VALARM','END:VEVENT'].filter(Boolean).join('\r\n')});
  download('Provas PROFIJ.ics',['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EduSpruce//PROFIJ//PT','METHOD:PUBLISH',...ev,'END:VCALENDAR'].join('\r\n'),'text/calendar')}
function cpOpcoes(){openDrawer('Coord. PROFIJ',`<div class="ed"><p class="hint" style="margin-top:0">O módulo aparece sozinho quando o cargo «Coordenador(a) do PROFIJ» está assinalado em Definições › Professor › Cargos e Funções. Os dados (entidades, FPCT, provas, médias escritas à mão) ficam guardados por ano letivo e sincronizados com a sua conta.</p><div class="row" style="margin-top:12px"><button class="btn" id="co-off">Desativar o módulo</button><span class="sp1"></span><button class="btn pri" id="co-x">Fechar</button></div></div>`);
  $('#co-x').onclick=closeDrawer;$('#co-off').onclick=()=>{if(confirm('Desativar o módulo Coord. PROFIJ? Os dados ficam guardados.')){cpAtivar(false);closeDrawer();go('inicio')}}}
function cpAtivar(on){S.cfg.modulos=S.cfg.modulos||{};S.cfg.modulos.cprofij=!!on;save();audit('Coord. PROFIJ',on?'Módulo ativado':'Módulo desativado','');cpNav()}
if(go._f)go._f.cprofij=vCProfij;
{const _gC=go;go=function(v){if(v==='cprofij'&&go._f&&!go._f.cprofij)go._f.cprofij=vCProfij;const r=_gC.apply(this,arguments);try{cpNav();$$('#side [data-v="cprofij"]').forEach(b=>b.classList.toggle('on',v==='cprofij'))}catch(_){}return r}}
setTimeout(cpNav,400);setInterval(cpNav,15000);
/* Definições › Módulos Opcionais */
{const _ca2=cartaoAvisosDef,_ba2=bindAvisosDef;cartaoAvisosDef=function(){let h=_ca2.apply(this,arguments);return h.replace(/(<div class="card ed" id="def-mods">[\s\S]*?)(<\/div>)$/,`$1<label class="chk" style="margin-top:8px"><input type="checkbox" id="mod-cp" ${cpOn()?'checked':''}> ${ic('award',15)} <span><b>Coord. PROFIJ</b><br><span class="mut">Coordenação do Programa PROFIJ: turmas e formandos, FPCT, PAF e PEA, Conselho dos Cursos e legislação</span></span></label>$2`)};
  bindAvisosDef=function(){const r=_ba2.apply(this,arguments);const c=$('#mod-cp');if(c)c.onchange=()=>{cpAtivar(c.checked);toast(c.checked?'Módulo Coord. PROFIJ ativado':'Módulo Coord. PROFIJ desativado','ok')};return r}}
/* avisos urgentes: provas sem júri nos próximos 7 dias e formandos em risco */
{const _au=avisosUrgentes;avisosUrgentes=function(){const L=_au.apply(this,arguments);try{if(cpOn()){const {y}=CP();const hj=isoHoje();const V=avVistos(),agora=Date.now();y.provas.forEach(p=>{if(p.data&&p.data>=hj&&diasEntre(hj,p.data)<=7&&!(p.juri||'').trim()){const k='cp:j:'+p.id;if(!(V[k]&&V[k]>agora))L.push({k,ic:'users',cor:'#b8860b',t:p.tipo+' sem júri · '+p.turma,s:'Prova '+fmtIsoL(p.data),ir:()=>{UI.cpTab=(p.tipo==='PEA'?'pea':'paf');go('cprofij')}})}})}}catch(_){}return L}}
try{AJUDA.push({id:'cprofij',ic:'award',t:'Coord. PROFIJ — Coordenação do Programa PROFIJ',gif:null,txt:`<p>Módulo opcional para o(a) <b>coordenador(a) do PROFIJ</b>. Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor (ou em Definições › Geral › Módulos Opcionais).</p><ul><li><b>Painel</b>: turmas PROFIJ, formandos em risco, FPCT por colocar, provas dos próximos 30 dias e o que precisa de atenção.</li><li><b>Turmas e Formandos</b>: médias por componente (sociocultural, científica, tecnológica), FPCT e PAF de cada formando, com a regra da Portaria n.º 86/2018 (≥ 10 em cada uma). As médias vêm das suas disciplinas; as dos colegas escrevem-se à mão a partir da pauta. Indique o diretor de turma de cada turma.</li><li><b>FPCT</b>: entidades de acolhimento (tutor, contactos, protocolo) e, por formando, entidade, datas, horas previstas e feitas, classificação e estado.</li><li><b>PAF e PEA</b>: marcar provas com data, hora, sala, júri, formandos e classificações; exportar para o Calendário (.ics) com alarme na véspera.</li><li><b>Conselho dos Cursos</b>: membros (coordenador e diretores de turma) e as reuniões com «Conselho dos Cursos PROFIJ» no título, com o estado da ata.</li><li><b>Legislação</b>: Portaria n.º 52/2016, Portaria n.º 86/2018 e os documentos da escola, com ligações.</li><li><b>Exportar CSV</b> com a situação de todos os formandos.</li></ul>`})}catch(_){}

/* 0.995 · ao entrar: barra de progresso 0–100 % e a app só abre depois de sincronizar */
let _gateOn=false;
function nvGateUI(){let o=document.getElementById('nvgate');if(o)return o;o=document.createElement('div');o.id='nvgate';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','nvg-t');
  const tpl=document.querySelector('#splash-tpl');const logo=tpl?tpl.innerHTML.split('<div class="spn">')[0]:'';
  o.innerHTML=`<div class="nvgw">${logo}<div class="spn">Edu<em>Spruce</em></div><h2 id="nvg-t">A sincronizar os seus dados</h2><div class="nvgb" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="nvg-t"><i></i></div><div class="nvgp"><b id="nvg-p">0%</b><span id="nvg-m">A preparar…</span></div><div class="nvga" id="nvg-a" hidden></div></div>`;
  document.body.appendChild(o);return o}
async function nvSyncGate(){if(_gateOn)return;let L;try{L=nvL()}catch(_){return}if(!L.prov||!(L.k||_nvK)||!SESSAO){const g=document.getElementById('nvgate');if(g)g.remove();return}_gateOn=true;
  const o=nvGateUI();o.classList.remove('fora');const bar=o.querySelector('.nvgb'),fill=bar.querySelector('i'),pct=o.querySelector('#nvg-p'),msg=o.querySelector('#nvg-m'),acts=o.querySelector('#nvg-a');
  let alvo=0,atual=0,raf=0;const anima=()=>{atual+=(alvo-atual)*0.35;if(alvo-atual<0.3)atual=alvo;fill.style.width=atual+'%';pct.textContent=Math.round(atual)+'%';bar.setAttribute('aria-valuenow',Math.round(atual));if(atual<alvo)raf=requestAnimationFrame(anima);else raf=0};
  let fim=false;const set=(v,t)=>{if(fim&&v<100)return;alvo=Math.max(alvo,Math.min(100,v));if(t)msg.textContent=t;if(v>=100)fim=true;if(!raf)raf=requestAnimationFrame(anima)};
  /* enquanto espera pela rede, avança devagar para mostrar que está vivo */
  const lento=setInterval(()=>{if(alvo<88)set(alvo+0.6)},400);
  const fechar=()=>{clearInterval(lento);window.__nvProg=null;o.classList.add('fora');setTimeout(()=>{o.remove();_gateOn=false;document.body.classList.remove('nv-gating');try{window.__nvGateFila&&window.__nvGateFila()}catch(_){}setTimeout(()=>{try{mostrarAvisos(false)}catch(_){}},400)},200)};
  const botoes=B=>{acts.hidden=!B.length;acts.innerHTML=B.map((b,i)=>`<button type="button" class="btn ${b.c||''}" data-g="${i}">${b.t}</button>`).join('');acts.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>B[+x.dataset.g].f())};
  const correr=async()=>{botoes([]);o.classList.remove('erro');set(6,'A ligar à sua conta Google…');
    if(!navigator.onLine){set(100,'Sem internet — os dados deste aparelho estão prontos; sincroniza quando a ligação voltar.');o.classList.add('erro');botoes([{t:'Continuar',c:'pri',f:fechar}]);return}
    window.__nvProg=f=>set(18+f*72,'A receber e a enviar as alterações…');
    set(12,'A verificar a nuvem…');let r=null;if(await nvNadaNovo()){alvo=atual=100;fill.style.width='100%';pct.textContent='100%';msg.textContent='Pronto';setTimeout(fechar,60);setTimeout(()=>{window.__nvFotos=1;nvSincronizar(false).catch(()=>{}).finally(()=>{window.__nvFotos=0})},700);return}window.__nvSemFotos=true;try{r=await nvSincronizar(false)}catch(_){}finally{window.__nvSemFotos=false}if(r&&!r.rapida)nvFotosFundo();
    if(r){alvo=atual=100;fill.style.width='100%';pct.textContent='100%';msg.textContent='Pronto';setTimeout(fechar,90);return}
    const L2=nvL();
    if(L2.renovar){o.classList.add('erro');msg.textContent='A ligação à Google expirou. Toque para renovar e sincronizar.';botoes([{t:ic('refresh',15)+' Renovar e Sincronizar',c:'pri',f:async()=>{try{await nvRenovar(false)}catch(e){msg.textContent=e.message;return}correr()}},{t:'Continuar sem Sincronizar',f:fechar}]);return}
    if(!L2.k){fechar();return} /* o assistente trata do código */
    o.classList.add('erro');msg.textContent='Não foi possível sincronizar: '+(L2.erro||'sem resposta da nuvem')+'.';botoes([{t:ic('refresh',15)+' Tentar de Novo',c:'pri',f:correr},{t:'Continuar com os Dados Deste Aparelho',f:fechar}])};
  await correr()}
/* progresso real dentro da sincronização (partes e ficheiros) */
/* ao abrir com sessão iniciada e depois de entrar com Google */
{let _gn=0;const _gt=setInterval(()=>{_gn++;try{const s=sessaoAtual();if(!s||s.tipo!=='google'){if(_gn>4)clearInterval(_gt);return}if(SESSAO&&!document.body.classList.contains('login-on')){clearInterval(_gt);nvKeepRepor();nvSyncGate()}}catch(e){console.warn(e)}if(_gn>200)clearInterval(_gt)},50)}
/* cobre a app logo à partida, antes de a sessão estar pronta, para não se ver nada por sincronizar */
try{const s0=sessaoAtual();const L0=JSON.parse(localStorage.getItem(NV_KEY)||'{}');if(s0&&s0.tipo==='google'&&L0.prov&&(L0.k||localStorage.getItem('eskeep'))){const g=nvGateUI();g.querySelector('#nvg-m').textContent='A ligar à sua conta Google…'}}catch(_){}
{const _as2=nvAssist;nvAssist=function(forcar){if(nvKeepRepor()){setTimeout(nvSyncGate,100);return}return _as2.apply(this,arguments)}}

/* 0.905 · «Esqueci-me do código»: confirma a identidade e escolhe um código novo */
{const _pp=pedirPin;pedirPin=function(){const pr=_pp.apply(this,arguments);setTimeout(()=>{const o=document.querySelector('#login.pinmode .pinc');if(!o||o.querySelector('.plesq'))return;
  const n=o.querySelector('.lgnota');const b=document.createElement('button');b.type='button';b.className='plesq';b.textContent='Esqueci-me do código';(n||o).insertAdjacentElement(n?'beforebegin':'beforeend',b);b.onclick=pinRecuperar},0);return pr}}
let _pinTent=0;
async function pinRecuperar(alvo){if(!(alvo instanceof Element))alvo=null;const L=(()=>{try{return nvL()}catch(_){return {}}})();const s=SESSAO||{};const conta=((S.cfg.auth||{}).contas||[]).find(c=>c.u===s.u);
  const modo=L.k&&L.salt?'nuvem':conta?'conta':null;
  if(!modo){alert('Não há outra forma de confirmar a sua identidade neste aparelho.\n\nToque em «Sair», entre de novo com a sua conta e defina um código novo em Definições › Dados e Segurança.');return}
  const d=document.createElement('dialog');d.className='nvmc';d.innerHTML=`<form class="nvmcf" onsubmit="return false" autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg&&gsCfg().email||s.u||'')}" hidden readonly><h2>${ic('cadeadoAb',18)} Esqueci-me do Código</h2>
    <p class="hint">${modo==='nuvem'?'Para confirmar que é você, escreva o <b>código de encriptação da sincronização</b> (o que usa para os dados na nuvem, com pelo menos 8 algarismos).':'Para confirmar que é você, escreva a <b>palavra-passe da sua conta</b> ('+esc(s.u)+').'}</p>
    <label for="rp-0">${modo==='nuvem'?'Código de encriptação':'Palavra-passe'}</label><input type="password" id="${modo==='nuvem'?'rp-0':'rp-0p'}" autocomplete="current-password" ${modo==='nuvem'?'inputmode="numeric"':''}>
    <label for="rp-1">Novo código de acesso (4 algarismos)</label><input type="password" id="rp-1" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
    <input type="password" id="rp-2" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="Repetir o novo código" aria-label="Repetir o novo código">
    <div class="nverr" id="rp-e" role="alert"></div>
    <div class="row" style="gap:8px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn" id="rp-x">Cancelar</button><button type="button" class="btn pri" id="rp-ok">${ic('check',15)} Mudar o Código</button></div></form>`;
  document.body.appendChild(d);d.addEventListener('keydown',e=>e.stopPropagation());d.showModal();const g=id=>d.querySelector('#'+id),er=g('rp-e');setTimeout(()=>{const f=g('rp-0')||g('rp-0p');if(f)f.focus()},50);['rp-1','rp-2'].forEach(id=>g(id).addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4)}));
  g('rp-x').onclick=()=>{d.close();d.remove()};
  g('rp-ok').onclick=async()=>{er.textContent='';if(_pinTent>=5){er.textContent='Demasiadas tentativas. Toque em «Sair» e entre de novo.';return}
    const prova=(g('rp-0')||g('rp-0p')).value,a=g('rp-1').value,b=g('rp-2').value;if(!prova)return er.textContent='Escreva '+(modo==='nuvem'?'o código de encriptação.':'a palavra-passe.');
    if(!/^\d{4}$/.test(a))return er.textContent='O novo código tem 4 algarismos.';if(a!==b)return er.textContent='Os códigos novos não coincidem.';
    let ok=false;try{if(modo==='nuvem'){const k0=await nvChaveDe(prova,L.salt);ok=b64(await crypto.subtle.exportKey('raw',k0))===L.k}else ok=await verificarPasse(conta,conta.u,prova)}catch(_){ok=false}
    if(!ok){_pinTent++;try{audit('Segurança','Recuperação do código de acesso falhada',s.u||'')}catch(_){}er.textContent=(modo==='nuvem'?'Código de encriptação errado.':'Palavra-passe errada.')+(5-_pinTent<=3?' Restam '+(5-_pinTent)+' tentativa(s).':'');return}
    S.cfg.pinHash=await hashSenha(a);try{saveNow()}catch(_){}try{audit('Segurança','Código de acesso mudado (recuperação)',s.u||'')}catch(_){}
    d.close();d.remove();toast('Código de acesso mudado','ok');
    /* entra logo com o código novo */
    const pad=alvo&&alvo.isConnected?alvo:document.querySelector('#login.pinmode');if(pad){for(const x of a){const k=pad.querySelector(`[data-pk="${x}"]`);if(k)k.click();await new Promise(r=>setTimeout(r,60))}}}}

/* 0.907 · «Esqueci-me do código» também nas janelas que pedem o código (desbloquear dados, mudar ou desativar o código…) */
{const _pd=pinDialog;pinDialog=function(o){const pr=_pd.apply(this,arguments);try{if(S.cfg.pinHash&&o&&o.verifica&&!/repita/i.test(o.t||'')){const ds=document.querySelectorAll('dialog.pindlg');const d=ds[ds.length-1];if(d&&!d.querySelector('.plesq')){const b=document.createElement('button');b.type='button';b.className='plesq';b.textContent='Esqueci-me do código';d.appendChild(b);b.onclick=()=>pinRecuperar(d)}}}catch(e){console.warn(e)}return pr}}

/* 0.908 · sincronização rápida: sem alterações locais e com o manifesto igual na nuvem, só um pedido pequeno */
{const _nsF=nvSincronizar;nvSincronizar=async function(interativo){try{const L=nvL();const prov=nvProv();
    if(!interativo&&!window.__nvFotos&&prov===PROV.google&&L.base&&L.manVer&&!Object.keys(L.mod||{}).length&&!L.rekey&&!_nvBusy&&_nvK){const m=prov._ids&&prov._ids[NV_PREF+'manifest.json'];
      if(m){const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version');const j=await r.json().catch(()=>({}));if(j.version&&String(j.version)===String(L.manVer)){nvSet({ultimo:Date.now(),erro:''});try{nvBadge()}catch(_){}return {rapida:true,env:0,rec:0}}}}}catch(_){}
  const r=await _nsF.apply(this,arguments);
  try{if(r&&nvProv()===PROV.google){const m=PROV.google._ids&&PROV.google._ids[NV_PREF+'manifest.json'];if(m){const _v=gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version').then(x=>x.json()).then(j=>{if(j&&j.version)nvSet({manVer:String(j.version)})}).catch(()=>{});if(window.__nvSemFotos)await _v}}}catch(_){}
  return r}}
/* avisos, parabéns, guia e janelas só depois de a sincronização chegar aos 100 % */
{const _sm=HTMLDialogElement.prototype.showModal;const fila=[];HTMLDialogElement.prototype.showModal=function(){if(document.getElementById('nvgate')&&!this.matches('.nvas,.nvmc,.pindlg')){fila.push(this);this.dataset.espera=1;return}return _sm.apply(this,arguments)};
  window.__nvGateFila=()=>{while(fila.length){const d=fila.shift();if(d.isConnected&&!d.open){delete d.dataset.espera;try{_sm.call(d)}catch(_){}}}}}
setInterval(()=>{const g=document.getElementById('nvgate');document.body.classList.toggle('nv-gating',!!g);if(!g&&window.__nvGateFila&&document.querySelector('dialog[data-espera]'))window.__nvGateFila()},150);
{const _ma2=mostrarAvisos;mostrarAvisos=function(){if(document.getElementById('nvgate')){clearTimeout(mostrarAvisos._t);mostrarAvisos._t=setTimeout(()=>mostrarAvisos.apply(this,arguments),800);return}return _ma2.apply(this,arguments)}}

/* 0.909 · sincronização inicial ~10× mais rápida
   - guarda os ids dos ficheiros da nuvem (por conta Google): ao abrir, basta 1 pedido pequeno para saber se algo mudou
   - fotografias e anexos passam para segundo plano: a app abre logo que os dados (texto) chegam
   - até 12 partes ao mesmo tempo; a versão do manifesto é lida sem atrasar a entrada */
const NV_GIDS='es.gids';
const nvGEmail=()=>{try{const s=sessaoAtual();return String(gsCfg().email||(s&&(s.email||s.u))||'').toLowerCase()}catch(_){return ''}};
function nvGidsCache(){try{const c=JSON.parse(localStorage.getItem(NV_GIDS)||'null');if(c&&c.m&&c.u&&c.u===nvGEmail())return c.m}catch(_){}return null}
{const G=PROV.google;const _m=G._mapa,_l=G.ler,_e=G.escrever;
  G._mapa=async function(f){if(!this._ids&&!f){const c=nvGidsCache();if(c)this._ids=c}if(this._ids&&!f)return this._ids;const m=await _m.call(this,true);try{localStorage.setItem(NV_GIDS,JSON.stringify({u:nvGEmail(),m}))}catch(_){}return m};
  const _guarda=()=>{try{if(G._ids)localStorage.setItem(NV_GIDS,JSON.stringify({u:nvGEmail(),m:G._ids}))}catch(_){}};
  G.ler=async function(n){try{return await _l.call(this,n)}catch(e){if(/erro 404/.test(e.message||'')){await this._mapa(true);return await _l.call(this,n)}throw e}};
  G.escrever=async function(n,t){try{const r=await _e.call(this,n,t);_guarda();return r}catch(e){if(/erro 404/.test(e.message||'')){await this._mapa(true);const r=await _e.call(this,n,t);_guarda();return r}throw e}}}
{const _ns=nvSincronizar;nvSincronizar=async function(){try{if(nvL().prov==='google'&&!PROV.google._ids){const c=nvGidsCache();if(c)PROV.google._ids=c}}catch(_){}return _ns.apply(this,arguments)}}
/* entrada: 1 pedido pequeno diz se outro dispositivo mudou alguma coisa; se não mudou, a app abre logo */
async function nvNadaNovo(){const P=window.__nvPre;window.__nvPre=null;if(P&&Date.now()-P.t<20000)return await P.p;return await nvNadaNovo0()}
async function nvNadaNovo0(){try{const L=nvL();if(L.prov!=='google'||!L.base||!L.manVer||L.rekey||!(L.k||_nvK))return false;
  const G=PROV.google;if(!G._ids){const c=nvGidsCache();if(c)G._ids=c}const m=G._ids&&G._ids[NV_PREF+'manifest.json'];if(!m)return false;
  const r=await gsFetch('https://www.googleapis.com/drive/v3/files/'+m.id+'?fields=version');const j=await r.json().catch(()=>({}));return !!j.version&&String(j.version)===String(L.manVer)}catch(_){return false}}

/* depois da barra: fotografias e anexos em segundo plano, sem bloquear */
function nvFotosFundo(){setTimeout(async()=>{if(_nvBusy){nvFotosFundo();return}window.__nvFotos=1;try{await nvSincronizar(false)}catch(_){}finally{window.__nvFotos=0}},400)}
/* o pedido pequeno parte logo enquanto a app ainda está a abrir */
try{const s0=sessaoAtual();if(s0&&s0.tipo==='google'&&nvL().prov==='google')window.__nvPre={t:Date.now(),p:nvNadaNovo0()}}catch(_){}

/* 0.909 · Coord. PROFIJ › Matriz Curricular / Ponto de Situação e Planeamento Anual
   (o equivalente ao Excel do coordenador: horas → aulas de 45 min, dadas, diferença, previsão de conclusão,
    calendário dia a dia por disciplina e por professor, FPCT e horário da turma importado do PDF) */
const CPM_SIG={'mat':'Matemática Aplicada','ma':'Matemática Aplicada','port':'Língua Portuguesa','lp':'Língua Portuguesa','ing':'Língua Estrangeira I - Inglês','le ing':'Língua Estrangeira I - Inglês','lei ing':'Língua Estrangeira I - Inglês','fran':'Língua Estrangeira - Francês','fr':'Língua Estrangeira - Francês','ef':'Educação Física','cid m at':'Cidadania e Mundo Atual','cma':'Cidadania e Mundo Atual','cid':'Cidadania e Mundo Atual','tic':'Tecnologias de Informação e Comunicação','ae':'Atividades Económicas','hsst':'Higiene, Saúde e Segurança no Trabalho','psi':'Psicologia','psisoc':'Psicossociologia'};
const CPM_H0={'Cidadania e Mundo Atual':70,'Tecnologias de Informação e Comunicação':50,'Educação Física':75,'Língua Portuguesa':90,'Língua Estrangeira I - Inglês':70,'Matemática Aplicada':100,'Atividades Económicas':50};
const cpmH0=n=>{const k=normT(n).replace(/\b(da|de|do)\b/g,'').replace(/\s+/g,' ');const e=Object.entries(CPM_H0).find(([x])=>normT(x).replace(/\b(da|de|do)\b/g,'').replace(/\s+/g,' ')===k);return e?e[1]:''};
const CPM_COMP=[['sociocultural','Componente de Formação Sociocultural'],['cientifica','Componente de Formação Científica'],['tecnologica','Componente de Formação Tecnológica'],['pratica','Componente de Formação Prática em Contexto de Trabalho']];
const cpmCompDe=n=>{const s=normT(n);return /^ufcd|unidades de formacao|tecnolog(?!ias d[ae] inf)|\b\d{4}\b/.test(s)?'tecnologica':/matemat|atividades econ|fisica e quim|biolog|psicolog|economia/.test(s)?'cientifica':/fct|formacao pratica|contexto de trabalho/.test(s)?'pratica':'sociocultural'};
const cpmAulas=h=>{h=+h||0;return h>0?Math.ceil(h/0.75-1e-9):0};
const cpmNomeSig=s=>CPM_SIG[normT(s).replace(/\./g,'').trim()]||String(s||'').replace(/\.$/,'').trim();
function cpmM(nome){const {y}=CP();y.mat=y.mat||{};const M=y.mat[nome]=y.mat[nome]||{curso:'',area:'',nivel:'II',cod:'',ref:'',anoCurso:'1.º',ini:'',fim:'',nasInt:false,disc:[],fct:{horas:'',ini:'',fim:'',hDia:7}};M.disc=M.disc||[];M.fct=M.fct||{horas:'',ini:'',fim:'',hDia:7};return M}
function cpmNomes(a,C){const {y}=CP();const L=C.map(c=>c.nome).filter(n=>n&&n!=='undefined'&&n!=='null');Object.keys(y.mat||{}).forEach(n=>{if(n&&n!=='undefined'&&n!=='null'&&!L.includes(n))L.push(n)});return L}
function cpmLimites(a,M){const c=CAL();const al=String((a&&a.nome)||anoLetivoDeHoje()).match(/(\d{4})/);const y1=al?+al[1]:new Date().getFullYear();
  const ini=M.ini||(c&&c.inicio)||y1+'-09-15';const fim=M.fim||(c&&termoTurma(null,c))||(y1+1)+'-06-30';return {ini,fim}}
/* tipo de cada dia para a turma: letivo, fds, feriado, interrupção, FPCT, fora do ano */
function cpmTipo(iso,M,L,c){const d=dataDeIso(iso),w=d.getDay();if(iso<L.ini||iso>L.fim)return 'fora';
  const f=M.fct||{};if(f.ini&&f.fim&&iso>=f.ini&&iso<=f.fim)return w===0||w===6?'fds':'fct';
  if(w===0||w===6)return 'fds';if(!c)return 'let';const tp=c.dias[iso];
  if(/^feriado/.test(tp||''))return 'fer';if(tp==='interrupcao')return M.nasInt?'let':'int';
  if(!tp)return M.nasInt?'let':'nl';return LETIVOS.includes(tp)?'let':'nl'}
/* aulas (tempos de 45 min) de cada disciplina no horário da turma */
function cpmAulasHor(a,nome,d){const h=horarioDe(a,nome);if(!h||!d.sig||!d.sig.length)return [];const S_=d.sig.map(normSig);return h.aulas.filter(x=>S_.includes(normSig(x.ab)))}
/* opt: {ref:'AAAA-MM-DD' (dia a partir do qual tudo é futuro), dadas:{discId:n} (valores de um ponto de situação), semPontos:true}
   sem opt: usa o último ponto de situação até hoje e soma as aulas do horário desde esse dia (estimativa) */
function cpmCalc(a,nome,opt){opt=opt||{};const M=cpmM(nome),L=cpmLimites(a,M),c=CAL();const real=isoHoje();const hj=opt.ref||real,agora=new Date(),mins=agora.getHours()*60+agora.getMinutes();
  const P0=!opt.ref&&!opt.semPontos?(M.pontos||[]).filter(p=>p.data<=real).sort((x,y)=>x.data.localeCompare(y.data)).pop()||null:null;
  const dias=[];for(let d=dataDeIso(L.ini);isoData(d)<=L.fim;d.setDate(d.getDate()+1)){const iso=isoData(d);dias.push({iso,w:d.getDay(),t:cpmTipo(iso,M,L,c)})}
  const R=M.disc.map(d=>{const H=cpmAulasHor(a,nome,d);const sem=[0,0,0,0,0,0,0];H.forEach(x=>sem[x.dia]++);const aulas=cpmAulas(d.horas);
    let auto=0,autoP=0,fut=0,fimPrev='',acum=0,tot=0;const porDia={};
    dias.forEach(z=>{if(z.t!=='let')return;let n=sem[z.w];if(!n)return;tot+=n;
      if(z.iso<hj){auto+=n;if(P0&&z.iso<=P0.data)autoP+=n}else if(z.iso===hj&&!opt.ref){const k=H.filter(x=>x.dia===z.w&&x.fim<=mins).length;auto+=k;fut+=n-k}else fut+=n;porDia[z.iso]=n});
    const ov=opt.dadas&&opt.dadas[d.id]!=null&&opt.dadas[d.id]!==''?+opt.dadas[d.id]:null;const pv=P0&&P0.dadas&&P0.dadas[d.id]!=null&&P0.dadas[d.id]!==''?+P0.dadas[d.id]:null;
    let fonte='horario',dadas;
    if(ov!=null){dadas=ov;fonte='ponto'}else if(d.dadas!=null&&d.dadas!==''&&!opt.ref){dadas=+d.dadas;fonte='manual'}else if(pv!=null){dadas=Math.max(0,pv+(auto-autoP));fonte=auto>autoP?'estimativa':'ponto'}else dadas=Math.max(0,auto+(opt.ref?0:(+d.aj||0)));
    acum=dadas;Object.keys(porDia).sort().forEach(iso=>{if(iso<hj||fimPrev)return;acum+=porDia[iso];if(!fimPrev&&acum>=aulas&&aulas)fimPrev=iso});
    if(aulas&&dadas>=aulas)fimPrev='feito';
    const falta=Math.max(0,aulas-dadas),saldo=dadas+fut-aulas,semT=sem.reduce((s,v)=>s+v,0);
    const est=!aulas?'sem':dadas>=aulas?'ok':saldo<0?'bad':saldo<semT?'w':'curso';
    return {d,H,sem,semT,aulas,dadas,auto,autoP,prev:auto,tot,fut,falta,saldo,fimPrev,porDia,porDiaT:porDia,est,fonte,ov,pv}});cpmSeq(R,hj,P0);
  const f=M.fct||{};let fctH=0;if(f.ini&&f.fim){for(let d=dataDeIso(f.ini);isoData(d)<=f.fim;d.setDate(d.getDate()+1)){const iso=isoData(d),w=d.getDay();if(w===0||w===6)continue;if(c&&/^feriado/.test(c.dias[iso]||''))continue;fctH+=+f.hDia||7}}
  return {M,L,dias,R,fctH,c,P0,ref:hj}}
/* UFCD que partilham os mesmos tempos do horário (ex.: «UFCD») dão-se umas a seguir às outras, pela ordem da matriz */
function cpmSeq(R,hj,P0){const G={};R.forEach(r=>{if(r.d.comp!=='tecnologica'||!r.d.sig||!r.d.sig.length)return;const k=r.d.sig.map(normSig).sort().join('|');(G[k]=G[k]||[]).push(r)});
  Object.values(G).filter(g=>g.length>1).forEach(g=>{const desde=g[0].auto-g[0].autoP;
    const temOv=g.some(r=>r.ov!=null),temPv=g.some(r=>r.pv!=null);
    const A_=temOv?g.reduce((s,r)=>s+(r.ov||0),0):temPv?g.reduce((s,r)=>s+(r.pv||0),0)+desde:Math.max(0,g[0].auto+g.reduce((s,r)=>s+(+r.d.aj||0),0));
    const dias=Object.keys(g[0].porDiaT).filter(i=>i>=hj).sort();let antes=0;
    g.forEach(r=>{const man=r.ov==null&&!temPv&&r.d.dadas!=null&&r.d.dadas!=='';const dd=r.ov!=null?r.ov:man?+r.d.dadas:Math.max(0,Math.min(r.aulas,A_-antes));r.dadas=dd;r.falta=Math.max(0,r.aulas-dd);
      const a0=antes,a1=antes+r.aulas;let ac=A_,ini=A_>a0?'feito':'',fim=A_>=a1?'feito':'';const pd={};
      for(const iso of dias){if(fim&&fim!=='feito'&&iso>fim)break;const n=g[0].porDiaT[iso];const ant=ac;ac+=n;if(!ini&&ac>a0)ini=iso;if(!fim&&ac>=a1)fim=iso;if(ini&&ac>a0&&ant<a1&&!(fim==='feito'))pd[iso]=Math.min(ac,a1)-Math.max(ant,a0)}
      r.porDia=pd;r.fimPrev=r.aulas?fim:'';r.iniPrev=ini;r.saldo=(A_+g[0].fut)-a1;r.seq=g.length;r.est=!r.aulas?'sem':dd>=r.aulas?'ok':r.saldo<0?'bad':r.saldo<r.semT?'w':'curso';antes=a1})})}
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
function cpmPontoVer(nome,p){const a=A(),M=cpmM(nome);const K=cpmCalc(a,nome,{ref:cpmDiaSeg(p.data),dadas:p.dadas||{}});const PI=M.plano&&M.plano.R?M.plano.R:null;
  const el=document.createElement('div');el.className='cpm-pv';
  const comp=CPM_COMP.filter(([k])=>k!=='pratica').map(([k,l])=>{const L=K.R.filter(r=>r.d.comp===k);if(!L.length)return '';const f=L.reduce((s,r)=>s+r.falta,0);
    return `<tr class="cpm-comp"><th colspan="9">${l}</th></tr>${L.map(r=>{const dv=r.dadas-r.prev;const pi=PI&&PI.find(x=>x.id===r.d.id);return `<tr class="${r.est==='bad'?'bad':r.est==='w'?'w':''}"><td><b>${esc(r.d.nome)}</b></td><td class="n">${r.d.horas||'—'}</td><td class="n">${r.aulas||'—'}</td><td class="n mut">${r.prev}</td><td class="n"><b>${r.dadas}</b></td><td class="n ${dv<0?'neg':dv>0?'pos':'mut'}">${dv>0?'+':''}${dv}</td><td class="n">${r.falta}</td><td>${r.fimPrev?cpmFD(r.fimPrev):r.aulas?`<span class="neg">faltam ${-r.saldo} no fim</span>`:'—'}${pi&&pi.fim&&r.fimPrev&&r.fimPrev!=='feito'&&pi.fim!=='feito'&&pi.fim!==r.fimPrev?`<div class="hint">planeado: ${fmtIsoL(pi.fim)}</div>`:''}</td><td>${esc(r.d.prof||'—')}</td></tr>`}).join('')}<tr class="cpm-tot"><td>Total da componente em falta</td><td colspan="5"></td><td class="n"><b>${f}</b></td><td colspan="2"></td></tr>`}).join('');
  el.innerHTML=`<section class="card cpm-cab"><div class="cpm-tit">${esc(M.curso||'Curso PROFIJ — '+nome)}</div><div class="mut cpm-meta">${[M.area&&'Área: '+esc(M.area),M.nivel&&'Nível '+esc(M.nivel),M.anoCurso&&'Ano: '+esc(M.anoCurso)].filter(Boolean).join(' · ')}</div>
    <div class="cpm-ps"><b>Ponto de Situação — ${p.data.split('-').reverse().join('.')}</b> <span class="mut">· ${esc(nome)}</span></div>${p.obs?`<p style="margin:6px 0 0">${esc(p.obs)}</p>`:''}</section>
    <section class="card"><div class="cpm-tw"><table class="lst cpm-t"><thead><tr><th>Disciplina / UFCD</th><th class="n">Horas</th><th class="n">Aulas</th><th class="n">Previstas até à data</th><th class="n">Dadas</th><th class="n">Desvio</th><th class="n">Faltam</th><th>Previsão até ao fim</th><th>Professor(a)</th></tr></thead><tbody>${comp}</tbody></table></div>
    <p class="hint">«Previstas até à data» = aulas que o horário e o calendário previam até ${fmtIsoL(p.data)}. A previsão até ao fim junta às aulas dadas as que o horário ainda tem até ${fmtIsoL(K.L.fim)}.</p></section>
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
  const ass=`<div class="cpm-ass"><span>${esc((S.cfg.escola||'')+'')}</span><div><div class="cpm-lin">${S.cfg.assinaturaImg?`<img src="${S.cfg.assinaturaImg}" alt="Assinatura" class="cpm-assimg">`:''}</div>O Coordenador do PROFIJ<br><small>${esc(S.cfg.professor||'')}</small></div></div>`;
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
  const tam=()=>{const W=sec.clientWidth-40,H=innerHeight-260;const c=Math.max(22,Math.min(64,Math.floor(Math.min((W-110)/34.5,H/13.5))));sec.style.setProperty('--cs',c+'px')};requestAnimationFrame(tam);addEventListener('resize',tam)}
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
  const r=await avisoModal('Reposição dos seus dados',['O administrador da EduSpruce pediu a reposição dos dados desta conta ('+s.u+') em '+new Date(o.q).toLocaleDateString('pt-PT')+'.','Todos os dados desta conta — na nuvem (Google Drive) e neste aparelho — vão ser apagados definitivamente. A app volta a começar do zero.','Se precisar de alguma coisa, exporte primeiro uma cópia em Definições › Dados e Segurança.'],[{t:'Exportar Cópia Primeiro',v:'copia'},{t:'Repor Agora',c:'dng',v:'sim'}]);
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
function MQ(){const jn=UI.mqCtx==='jornal';const j=jn?(S.snj=S.snj||{}):(S.sn=S.sn||{});if(!jn&&!j.quadros&&S.jornal&&Array.isArray(S.jornal.quadros)){j.quadros=S.jornal.quadros;delete S.jornal.quadros}if(jn&&(!Array.isArray(j.quadros)||!j.quadros.length))j.quadros=[{id:'raiz',nome:'JornalNote',pai:null,itens:[],setas:[],cor:'#f59e0b'}];if(!Array.isArray(j.quadros)||!j.quadros.length)j.quadros=[{id:'raiz',nome:'SpruceNote',pai:null,itens:[],setas:[],cor:'#60a5fa'}];j.quadros.forEach(q=>{q.itens=q.itens||[];q.setas=q.setas||[]});return j.quadros}
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
/* ---------- vista ---------- */
function mqVista(){const c=$('#sn-c')||$('#jn-c');if(!c)return;MQ();const u=mqUI();if(!MQ().some(q=>q.id===u.q))u.q='raiz';
  c.innerHTML=`<div class="mq" id="mq"><div class="mq-top"><nav class="mq-bc" id="mq-bc"></nav><span class="sp1"></span><span class="mq-dica mut">Arraste da barra para o quadro · duplo toque para abrir ou editar</span><button class="btn sm" id="mq-amp" title="Abrir o quadro em grande">${ic('image',14)} Aumentar</button><button class="btn sm ghost" id="mq-und" title="Desfazer (Ctrl+Z)">${ic('undo',15)}</button><button class="btn sm ghost" id="mq-red" title="Refazer (Ctrl+Shift+Z)" style="transform:scaleX(-1)">${ic('undo',15)}</button></div>
    <div class="mq-body"><aside class="mq-bar" role="toolbar" aria-label="Acrescentar ao quadro">${mqBarra()}</aside>
    <div class="mq-cv" id="mq-cv" tabindex="0" aria-label="Quadro"><div class="mq-w" id="mq-w"><svg class="mq-svg" id="mq-svg"><defs><marker id="mq-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#8e8e93"/></marker></defs></svg><div id="mq-its"></div></div>
      <div class="mq-zoom"><button type="button" id="mq-zm" aria-label="Afastar">−</button><button type="button" id="mq-zr" title="Repor 100 %">100%</button><button type="button" id="mq-zp" aria-label="Aproximar">+</button><button type="button" id="mq-zf" title="Ajustar ao ecrã">${ic('target',14)}</button></div>
      <div class="mq-ctx" id="mq-ctx" hidden></div><div class="mq-fmt" id="mq-fmt" hidden>${[['bold','B','Negrito'],['italic','I','Itálico'],['underline','U','Sublinhado'],['strikeThrough','S','Riscado'],['insertUnorderedList','•','Lista'],['h3','H','Título'],['link','🔗','Ligação']].map(([c_,l,t])=>`<button type="button" data-fmt="${c_}" title="${t}">${l}</button>`).join('')}</div></div></div></div>`;
  mqBind();mqRender()}
function mqBC(){const u=mqUI();const L=[];let q=mqQ(u.q);while(q){L.unshift(q);q=q.pai?MQ().find(z=>z.id===q.pai):null}
  $('#mq-bc').innerHTML=L.map((q,i)=>i<L.length-1?`<button type="button" class="mq-bcb" data-mqq="${q.id}">${esc(q.nome)}</button><span class="mut">›</span>`:`<b>${esc(q.nome)}</b>`).join('');
  $$('#mq-bc [data-mqq]').forEach(b=>b.onclick=()=>mqAbrir(b.dataset.mqq))}
function mqAbrir(id){const u=mqUI();u.q=id;u.sel=[];_mqLig=null;mqRender();const w=$('#mq-w');if(w&&animPerfil&&animPerfil()==='cheio'){w.classList.remove('mq-in');void w.offsetWidth;w.classList.add('mq-in')}}
function mqHTML(it,q){const sel=mqUI().sel.includes(it.id)?' sel':'';const cor=it.cor?` style="--mqc:${it.cor}"`:'';const cl=`mq-it mq-${it.t}${sel}${it.cor?' tem-cor':''}`;
  const pos=it.pai?'':` style="left:${it.x}px;top:${it.y}px;width:${it.w}px${it.cor?';--mqc:'+it.cor:''}"`;const st=it.pai?(it.cor?` style="--mqc:${it.cor}"`:''):pos;
  const rz=it.pai||['quadro','cor'].includes(it.t)?'':'<span class="mq-rz" data-rz aria-hidden="true"></span>';
  if(it.t==='nota')return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-txt" data-ed>${mqLimpa(it.txt)||'<span class="mq-ph">Escreva…</span>'}</div>${rz}</div>`;
  if(it.t==='titulo')return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-txt" data-ed>${mqLimpa(it.txt)||'<span class="mq-ph">Título</span>'}</div>${rz}</div>`;
  if(it.t==='tarefa'){const n=it.l.filter(x=>x.f).length;return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-th"><input class="mq-nm" data-tit value="${esc(it.tit||'')}" placeholder="Lista" aria-label="Nome da lista"><small>${n}/${it.l.length}</small></div><i class="mq-pb"><i style="width:${it.l.length?Math.round(n/it.l.length*100):0}%"></i></i><div class="mq-tl">${it.l.map((x,k)=>`<label class="${x.f?'f':''}"><input type="checkbox" data-tk="${k}" ${x.f?'checked':''}><input type="text" data-tt="${k}" value="${esc(x.t)}" placeholder="Tarefa…"></label>`).join('')}</div><button type="button" class="mq-add" data-tadd>${ic('plus',13)} Tarefa</button>${rz}</div>`}
  if(it.t==='link'){let d='';try{d=new URL(it.url).hostname.replace(/^www\./,'')}catch(_){}return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-lk"><span class="mq-lki">${esc((d||'?').charAt(0).toUpperCase())}</span><div><b>${esc(it.tit||d||it.url||'Ligação')}</b><small>${esc(d)}</small></div></div>${it.desc?`<p class="mq-lkd">${esc(it.desc)}</p>`:''}<div class="mq-lka"><a href="${esc(/^https?:/i.test(it.url||'')?it.url:'#')}" target="_blank" rel="noopener" class="btn sm">${ic('link',13)} Abrir</a><button type="button" class="btn sm ghost" data-lked>${ic('pencil',13)}</button></div>${rz}</div>`}
  if(it.t==='imagem'){const src=FOTOS[it.fid];return `<div class="${cl}" data-mq="${it.id}"${st}>${src?`<img src="${src}" alt="${esc(it.leg||'Imagem')}" draggable="false">`:`<div class="mq-semimg">${ic('image',22)}<small>imagem ainda não disponível neste aparelho</small></div>`}<input class="mq-leg" data-leg value="${esc(it.leg||'')}" placeholder="Legenda…" aria-label="Legenda">${rz}</div>`}
  if(it.t==='cor')return `<div class="${cl}" data-mq="${it.id}"${st}><label class="mq-sw" style="background:${esc(it.hex)}"><input type="color" data-hex value="${esc(it.hex)}" aria-label="Cor"></label><small>${esc(it.hex.toUpperCase())}</small></div>`;
  if(it.t==='quadro'){const s=mqQ(it.ref);const n=s&&s.id===it.ref?s.itens.length:0;return `<div class="${cl}" data-mq="${it.id}"${st}><span class="mq-qi" style="background:${esc((s&&s.cor)||'#60a5fa')}">${ic('grid',26)}</span><input class="mq-nm" data-qnm value="${esc((s&&s.id===it.ref&&s.nome)||'Quadro')}" aria-label="Nome do quadro"><small>${n} ${n===1?'elemento':'elementos'}</small></div>`}
  if(it.t==='coluna'){const F=q.itens.filter(x=>x.pai===it.id).sort((a,b)=>(a.o||0)-(b.o||0));return `<div class="${cl}" data-mq="${it.id}"${st}><div class="mq-ch"><input class="mq-nm" data-tit value="${esc(it.tit||'')}" placeholder="Coluna" aria-label="Nome da coluna"><small>${F.length}</small></div><div class="mq-cb" data-colb="${it.id}">${F.map(x=>mqHTML(x,q)).join('')||'<div class="mq-cvaz">Arraste para aqui</div>'}</div>${rz}</div>`}
  return ''}
function mqRender(){const w=$('#mq-its');if(!w)return;const u=mqUI(),q=mqQ(u.q);u.sel=u.sel.filter(id=>mqItem(q,id));mqBC();
  w.innerHTML=q.itens.filter(i=>!i.pai).map(i=>mqHTML(i,q)).join('')+(q.itens.length?'':`<div class="mq-vaz">${ic('grid',34)}<b>Quadro vazio</b><span>Arraste uma nota, uma lista, uma imagem ou um quadro da barra à esquerda — ou cole texto, ligações e imagens aqui.</span></div>`);
  mqZoomAp();mqItensBind();requestAnimationFrame(mqSetas);mqCtx()}
function mqZoomAp(){const v=mqVis(mqUI().q),w=$('#mq-w');if(!w)return;w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;const r=$('#mq-zr');if(r)r.textContent=Math.round(v.z*100)+'%';const cv=$('#mq-cv');if(cv){cv.style.backgroundSize=`${22*v.z}px ${22*v.z}px`;cv.style.backgroundPosition=`${v.x}px ${v.y}px`}}
function mqPt(cx,cy){const r=$('#mq-cv').getBoundingClientRect(),v=mqVis(mqUI().q);return {x:(cx-r.left-v.x)/v.z,y:(cy-r.top-v.y)/v.z}}
function mqCentro(){const r=$('#mq-cv').getBoundingClientRect();const p=mqPt(r.left+r.width/2,r.top+r.height/2);return {x:p.x-100+Math.random()*40,y:p.y-60+Math.random()*40}}
function mqRectW(el){const r=el.getBoundingClientRect(),cv=$('#mq-cv').getBoundingClientRect(),v=mqVis(mqUI().q);return {x:(r.left-cv.left-v.x)/v.z,y:(r.top-cv.top-v.y)/v.z,w:r.width/v.z,h:r.height/v.z}}
function mqSetas(){const svg=$('#mq-svg');if(!svg)return;const q=mqQ(mqUI().q);const u=mqUI();svg.querySelectorAll('g').forEach(g=>g.remove());
  const borda=(R,px,py)=>{const cx=R.x+R.w/2,cy=R.y+R.h/2,dx=px-cx,dy=py-cy;if(!dx&&!dy)return {x:cx,y:cy};const s=Math.min(Math.abs((R.w/2+6)/(dx||1e-9)),Math.abs((R.h/2+6)/(dy||1e-9)));return {x:cx+dx*s,y:cy+dy*s}};
  q.setas=q.setas.filter(s=>mqItem(q,s.de)&&mqItem(q,s.para));
  q.setas.forEach(s=>{const a=$(`[data-mq="${s.de}"]`),b=$(`[data-mq="${s.para}"]`);if(!a||!b)return;const A_=mqRectW(a),B_=mqRectW(b);const p1=borda(A_,B_.x+B_.w/2,B_.y+B_.h/2),p2=borda(B_,A_.x+A_.w/2,A_.y+A_.h/2);
    const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dx=p2.x-p1.x,dy=p2.y-p1.y,cx=mx-dy*0.12,cy=my+dx*0.12;const d=`M${p1.x} ${p1.y} Q${cx} ${cy} ${p2.x} ${p2.y}`;
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','mq-seta'+(u.sel.includes(s.id)?' sel':''));g.dataset.seta=s.id;
    g.innerHTML=`<path class="hit" d="${d}"/><path class="ln" d="${d}" marker-end="url(#mq-ah)"/>`;svg.appendChild(g);g.onpointerdown=e=>{e.stopPropagation();u.sel=[s.id];mqRender()}})}
function mqCtx(){const box=$('#mq-ctx');if(!box)return;const u=mqUI(),q=mqQ(u.q);if(!u.sel.length||_mqEd){box.hidden=true;return}
  const seta=q.setas.find(s=>u.sel.includes(s.id));const its=u.sel.map(id=>mqItem(q,id)).filter(Boolean);
  box.innerHTML=(its.length&&!its.some(i=>i.t==='cor')?`<span class="mq-cs">${MQ_CORES.map(c=>`<button type="button" data-cc="${c}" class="${its.every(i=>(i.cor||'')===c)?'on':''}" style="${c?'background:'+c:''}" title="${c?'Cor':'Sem cor'}">${c?'':'×'}</button>`).join('')}</span>`:'')+
    (its.length===1&&its[0].t==='quadro'?`<button type="button" class="btn sm" data-ca="abrir">${ic('grid',13)} Abrir</button>`:'')+(its.length===1&&!its[0].pai?`<button type="button" class="btn sm ghost" data-ca="frente" title="Trazer para a frente">${ic('layers',14)}</button>`:'')+
    (its.length?`<button type="button" class="btn sm ghost" data-ca="dup" title="Duplicar (Ctrl+D)">${ic('copy',14)}</button>`:'')+`<button type="button" class="btn sm ghost dng" data-ca="del" title="Apagar">${ic('trash',14)}</button>`;
  box.hidden=false;box.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{mqAntes();its.forEach(i=>i.cor=b.dataset.cc);save();mqRender()});
  box.querySelectorAll('[data-ca]').forEach(b=>b.onclick=()=>{const a=b.dataset.ca;if(a==='abrir')return mqAbrir(its[0].ref);if(a==='del')return mqApagar();if(a==='dup')return mqDuplicar();if(a==='frente'){mqAntes();q.itens=q.itens.filter(i=>i!==its[0]).concat(its[0]);save();mqRender()}});
  if(seta&&!its.length){}}
function mqApagar(){const u=mqUI(),q=mqQ(u.q);if(!u.sel.length)return;const its=u.sel.map(id=>mqItem(q,id)).filter(Boolean);
  const sub=its.filter(i=>i.t==='quadro');if(sub.length){const n=sub.reduce((s,i)=>{const z=MQ().find(x=>x.id===i.ref);return s+(z?z.itens.length:0)},0);if(n&&!confirm('Apagar '+(sub.length>1?'estes quadros':'este quadro')+' e '+n+' elemento(s) lá dentro?'))return}
  mqAntes();const ids=new Set(u.sel);its.filter(i=>i.t==='coluna').forEach(c=>q.itens.filter(x=>x.pai===c.id).forEach(x=>ids.add(x.id)));
  const apagaQ=id=>{const z=MQ().find(x=>x.id===id);if(!z)return;z.itens.filter(i=>i.t==='quadro').forEach(i=>apagaQ(i.ref));(UI.mqCtx==='jornal'?S.snj:S.sn).quadros=MQ().filter(x=>x.id!==id)};sub.forEach(i=>apagaQ(i.ref));
  q.itens=q.itens.filter(i=>!ids.has(i.id));q.setas=q.setas.filter(s=>!ids.has(s.id)&&!ids.has(s.de)&&!ids.has(s.para));u.sel=[];save();mqRender()}
function mqDuplicar(){const u=mqUI(),q=mqQ(u.q);const its=u.sel.map(id=>mqItem(q,id)).filter(i=>i&&i.t!=='quadro'&&i.t!=='coluna');if(!its.length)return;mqAntes();
  const nv=its.map(i=>{const c=JSON.parse(JSON.stringify(i));c.id=uid();if(c.pai){const el=$(`[data-mq="${i.id}"]`);const R=el?mqRectW(el):{x:i.x,y:i.y};c.pai=null;c.x=R.x;c.y=R.y}c.x+=24;c.y+=24;return c});q.itens.push(...nv);u.sel=nv.map(i=>i.id);save();mqRender()}
/* ---------- edição de texto ---------- */
let _mqEd=null;window._mqFim=null;
function mqEditar(id){const el=$(`[data-mq="${id}"] [data-ed]`);if(!el)return;const q=mqQ(mqUI().q),it=mqItem(q,id);if(!it)return;_mqEd=id;const ph=el.querySelector('.mq-ph');if(ph)el.innerHTML='';
  el.contentEditable='true';el.closest('.mq-it').classList.add('ed');el.focus();try{const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(_){}
  const f=$('#mq-fmt');if(f&&it.t==='nota'){f.hidden=false;mqFmtPos(el)}$('#mq-ctx').hidden=true;
  const fim=window._mqFim=()=>{if(_mqEd!==id)return;window._mqFim=null;el.removeEventListener('blur',blur);el.contentEditable='false';el.closest('.mq-it')&&el.closest('.mq-it').classList.remove('ed');const v=mqLimpa(el.innerHTML).replace(/^(<br>|\s)+$/,'');if(v!==(it.txt||'')){mqAntes();it.txt=v;save()}_mqEd=null;if(f)f.hidden=true;mqRender()};
  const blur=e=>{setTimeout(()=>{if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#mq-fmt'))return;if(_mqEd===id)fim()},120)};el.addEventListener('blur',blur);
  el.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();el.blur()}e.stopPropagation()};el.oninput=()=>{mqFmtPos(el);requestAnimationFrame(mqSetas)}}
function mqFmtPos(el){const f=$('#mq-fmt'),cv=$('#mq-cv');if(!f||f.hidden)return;const r=el.closest('.mq-it').getBoundingClientRect(),c=cv.getBoundingClientRect();f.style.left=Math.max(6,Math.min(c.width-260,r.left-c.left))+'px';f.style.top=Math.max(6,r.top-c.top-44)+'px'}
/* ---------- imagens ---------- */
function mqReduz(file){return new Promise((ok,ko)=>{const r=new FileReader();r.onerror=()=>ko(r.error);r.onload=()=>{const im=new Image();im.onload=()=>{const M=1600,s=Math.min(1,M/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  ok({u:/png|gif|webp/.test(file.type)&&s===1&&file.size<400000?r.result:c.toDataURL('image/jpeg',.82),w:c.width,h:c.height})};im.onerror=()=>ko(new Error('Imagem inválida'));im.src=r.result};r.readAsDataURL(file)})}
async function mqImagens(files,x,y){let k=0;for(const f of files){if(!/^image\//.test(f.type))continue;try{const r=await mqReduz(f);const id='mq:'+uid();FOTOS[id]=r.u;idbPor(id,r.u);mqNovo('imagem',x+k*30,y+k*30,{fid:id,leg:'',w:Math.min(320,Math.max(160,r.w/3))});k++}catch(e){toast(e.message,'erro')}}}
function mqLinkDlg(it){const nov=!it;openDrawer(nov?'Nova Ligação':'Editar Ligação',`<div class="ed"><label>Endereço</label><input id="ml-u" type="url" inputmode="url" value="${esc(it&&it.url||'')}" placeholder="https://…" autocapitalize="none"><label>Título</label><input id="ml-t" value="${esc(it&&it.tit||'')}" placeholder="(o nome do site, se ficar vazio)"><label>Descrição</label><textarea id="ml-d" rows="3">${esc(it&&it.desc||'')}</textarea><div class="row" style="margin-top:14px"><span class="sp1"></span><button class="btn" id="ml-0">Cancelar</button><button class="btn pri" id="ml-ok">${ic('check',14)} Guardar</button></div></div>`);
  setTimeout(()=>$('#ml-u').focus(),60);$('#ml-0').onclick=closeDrawer;$('#ml-ok').onclick=()=>{let u=$('#ml-u').value.trim();if(u&&!/^[a-z]+:/i.test(u))u='https://'+u;if(!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(u))return toast('Escreva um endereço válido','erro');
    const d={url:u,tit:$('#ml-t').value.trim(),desc:$('#ml-d').value.trim()};closeDrawer();if(nov){const p=mqLinkPos||mqCentro();mqNovo('link',p.x,p.y,d)}else{mqAntes();Object.assign(it,d);save();mqRender()}}}
let mqLinkPos=null;
function mqCriar(t,p){p=p||mqCentro();if(t==='imagem'){mqLinkPos=p;$('#mq-f').click();return}if(t==='link'){mqLinkPos=p;mqLinkDlg(null);return}if(t==='seta'){_mqLig={de:null};toast('Toque no primeiro elemento e depois no segundo');$('#mq').classList.add('ligar');return}mqNovo(t,p.x,p.y)}
let _mqLig=null;
/* ---------- interação ---------- */
function mqBind(){const cv=$('#mq-cv'),u=mqUI();
  $('#mq-und').onclick=()=>mqDesfazer(false);
  const abreAmp=()=>{UI.mqFull=true;const m=$('#mq');ecraAmplo({titulo:UI.mqCtx==='jornal'?'JornalNote':'SpruceNote',sub:mqQ(u.q).nome,el:m,aoFechar:()=>{UI.mqFull=false;if(VIEW==='sprucenote')vSpruceNote();if(VIEW==='snjornal')vSnJornal()}});requestAnimationFrame(()=>{try{mqSetas()}catch(_){}})};
  $('#mq-amp').onclick=abreAmp;if(UI.mqFull&&!document.getElementById('ampv'))setTimeout(abreAmp,0);$('#mq-red').onclick=()=>mqDesfazer(true);
  const zoom=(f,cx,cy)=>{const v=mqVis(u.q),r=cv.getBoundingClientRect();cx=cx==null?r.width/2:cx-r.left;cy=cy==null?r.height/2:cy-r.top;const nz=Math.max(.25,Math.min(2.5,v.z*f));v.x=cx-(cx-v.x)*nz/v.z;v.y=cy-(cy-v.y)*nz/v.z;v.z=nz;mqZoomAp();mqFmtPos($('.mq-it.ed [data-ed]')||document.body)};
  $('#mq-zp').onclick=()=>zoom(1.2);$('#mq-zm').onclick=()=>zoom(1/1.2);$('#mq-zr').onclick=()=>{const v=mqVis(u.q);v.z=1;mqZoomAp()};
  $('#mq-zf').onclick=()=>{const q=mqQ(u.q);const L=q.itens.filter(i=>!i.pai);if(!L.length)return;const els=L.map(i=>$(`[data-mq="${i.id}"]`)).filter(Boolean).map(mqRectW);const x0=Math.min(...els.map(r=>r.x)),y0=Math.min(...els.map(r=>r.y)),x1=Math.max(...els.map(r=>r.x+r.w)),y1=Math.max(...els.map(r=>r.y+r.h));const r=cv.getBoundingClientRect();const z=Math.max(.25,Math.min(1.5,Math.min((r.width-60)/(x1-x0),(r.height-60)/(y1-y0))));const v=mqVis(u.q);v.z=z;v.x=(r.width-(x1-x0)*z)/2-x0*z;v.y=(r.height-(y1-y0)*z)/2-y0*z;mqZoomAp()};
  cv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoom(Math.exp(-e.deltaY*0.01),e.clientX,e.clientY);else{const v=mqVis(u.q);v.x-=e.deltaX;v.y-=e.deltaY;mqZoomAp()}},{passive:false});
  /* barra: tocar cria no centro; arrastar cria onde largar */
  $$('.mq-tool').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();const t=b.dataset.mqt;let g=null;const x0=e.clientX,y0=e.clientY;
    const mv=ev=>{if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>6){g=document.createElement('div');g.className='mq-ghost';g.innerHTML=ic(MQ_T[t][0],18)+' '+MQ_T[t][1];document.body.appendChild(g)}if(g){g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px'}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(g){g.remove();const r=cv.getBoundingClientRect();if(ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom){const p=mqPt(ev.clientX,ev.clientY);mqCriar(t,{x:p.x-40,y:p.y-20})}}else mqCriar(t)};
    addEventListener('pointermove',mv);addEventListener('pointerup',up)}});
  $('#mq-f').onchange=e=>{const p=mqLinkPos||mqCentro();mqImagens([...e.target.files],p.x,p.y);e.target.value=''};
  /* fundo: arrastar desloca; seleção por retângulo com Shift; dois dedos aproximam */
  const P=new Map();let pan=null,pinch=null,box=null;
  cv.onpointerdown=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx,.mq-fmt,.mq-seta'))return;if(_mqEd){document.activeElement&&document.activeElement.blur();}
    P.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId);cv.focus({preventScroll:true})}catch(_){}
    if(P.size===2){const [a,b]=[...P.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};pan=null;return}
    if(_mqLig){_mqLig=null;$('#mq').classList.remove('ligar')}
    if(e.shiftKey){const p=mqPt(e.clientX,e.clientY);box={x0:p.x,y0:p.y,el:document.createElement('div')};box.el.className='mq-box';$('#mq-w').appendChild(box.el);return}
    const v=mqVis(u.q);pan={x:e.clientX,y:e.clientY,vx:v.x,vy:v.y,mov:false};cv.classList.add('pan')};
  cv.onpointermove=e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&P.size===2){const [a,b]=[...P.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoom(d/pinch.d,pinch.cx,pinch.cy);pinch.d=d;return}
    if(box){const p=mqPt(e.clientX,e.clientY);const x=Math.min(p.x,box.x0),y=Math.min(p.y,box.y0),w=Math.abs(p.x-box.x0),h=Math.abs(p.y-box.y0);Object.assign(box.el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});box.r={x,y,w,h};return}
    if(pan){const v=mqVis(u.q);v.x=pan.vx+e.clientX-pan.x;v.y=pan.vy+e.clientY-pan.y;if(Math.abs(e.clientX-pan.x)+Math.abs(e.clientY-pan.y)>4)pan.mov=true;mqZoomAp()}};
  cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;cv.classList.remove('pan');
    if(box){const R=box.r;box.el.remove();box=null;if(R){const q=mqQ(u.q);u.sel=q.itens.filter(i=>!i.pai).filter(i=>{const el=$(`[data-mq="${i.id}"]`);if(!el)return false;const r=mqRectW(el);return r.x<R.x+R.w&&r.x+r.w>R.x&&r.y<R.y+R.h&&r.y+r.h>R.y}).map(i=>i.id);mqRender()}return}
    if(pan&&!pan.mov&&u.sel.length){u.sel=[];mqRender()}pan=null};
  cv.ondblclick=e=>{if(e.target.closest('.mq-it,.mq-zoom,.mq-ctx'))return;const p=mqPt(e.clientX,e.clientY);mqNovo('nota',p.x-20,p.y-20)};
  /* largar ficheiros e colar */
  cv.ondragover=e=>{e.preventDefault();cv.classList.add('drop')};cv.ondragleave=()=>cv.classList.remove('drop');
  cv.ondrop=e=>{e.preventDefault();cv.classList.remove('drop');const p=mqPt(e.clientX,e.clientY);const F=[...(e.dataTransfer.files||[])];if(F.length)return mqImagens(F,p.x,p.y);const t=e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain');if(t)mqColarTexto(t,p)};
  cv.onpaste=e=>{if(_mqEd||e.target.closest('input,textarea'))return;const F=[...(e.clipboardData.files||[])];const p=mqCentro();if(F.length){e.preventDefault();return mqImagens(F,p.x,p.y)}const t=e.clipboardData.getData('text/plain');if(t){e.preventDefault();mqColarTexto(t,p)}};
  cv.onkeydown=e=>{if(_mqEd||e.target.closest('input,textarea,[contenteditable=true]'))return;const k=e.key;const m=e.ctrlKey||e.metaKey;
    if((k==='Delete'||k==='Backspace')&&u.sel.length){e.preventDefault();mqApagar()}else if(m&&k.toLowerCase()==='z'){e.preventDefault();mqDesfazer(e.shiftKey)}else if(m&&k.toLowerCase()==='d'){e.preventDefault();mqDuplicar()}else if(m&&k.toLowerCase()==='a'){e.preventDefault();u.sel=mqQ(u.q).itens.filter(i=>!i.pai).map(i=>i.id);mqRender()}else if(k==='Escape'){u.sel=[];_mqLig=null;$('#mq').classList.remove('ligar');mqRender()}
    else if(k.startsWith('Arrow')&&u.sel.length){e.preventDefault();const d=e.shiftKey?20:4;const q=mqQ(u.q);u.sel.forEach(id=>{const i=mqItem(q,id);if(i&&!i.pai){if(k==='ArrowLeft')i.x-=d;if(k==='ArrowRight')i.x+=d;if(k==='ArrowUp')i.y-=d;if(k==='ArrowDown')i.y+=d}});save();mqRender()}};
  $$('#mq-fmt [data-fmt]').forEach(b=>{b.onpointerdown=e=>e.preventDefault();b.onclick=()=>{const c_=b.dataset.fmt;if(c_==='h3')document.execCommand('formatBlock',false,'h3');else if(c_==='link'){const l=prompt('Endereço da ligação:','https://');if(l&&/^https?:\/\//.test(l))document.execCommand('createLink',false,l)}else document.execCommand(c_)}})}
function mqColarTexto(t,p){t=t.trim();if(/^https?:\/\/\S+$/i.test(t)){let d='';try{d=new URL(t).hostname.replace(/^www\./,'')}catch(_){}mqNovo('link',p.x,p.y,{url:t,tit:d,desc:''})}else{const txt=esc(t).replace(/\n/g,'<br>');const it=mqNovo('nota',p.x,p.y,{txt});setTimeout(()=>{if(_mqEd===it.id){const el=$(`[data-mq="${it.id}"] [data-ed]`);el&&el.blur()}},40)}}
function mqItensBind(){const u=mqUI(),q=mqQ(u.q),cv=$('#mq-cv');
  $$('#mq-its .mq-it').forEach(el=>{const id=el.dataset.mq,it=mqItem(q,id);if(!it)return;
    el.onpointerdown=e=>{if(e.button>0||e.target.closest('input,textarea,a,button,select,audio,video,[contenteditable=true],label.mq-sw'))return;e.stopPropagation();try{cv.focus({preventScroll:true})}catch(_){}
      if(_mqLig){if(!_mqLig.de){_mqLig.de=id;el.classList.add('lig');return}if(_mqLig.de!==id){mqAntes();q.setas.push({id:uid(),de:_mqLig.de,para:id});save()}_mqLig=null;$('#mq').classList.remove('ligar');mqRender();return}
      if(e.shiftKey||e.metaKey||e.ctrlKey){u.sel=u.sel.includes(id)?u.sel.filter(x=>x!==id):[...u.sel,id];mqRender();return}
      if(!u.sel.includes(id)){u.sel=[id];$$('#mq-its .mq-it.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');mqCtx()}
      const rz=e.target.closest('[data-rz]');const v=mqVis(u.q);const x0=e.clientX,y0=e.clientY;let mov=false,ghost=null,colAlvo=null;
      const grupo=rz?[it]:u.sel.map(x=>mqItem(q,x)).filter(i=>i&&!(i.pai&&i.id!==it.id));const ori=grupo.map(i=>({i,x:i.x,y:i.y,w:i.w}));
      try{el.setPointerCapture(e.pointerId)}catch(_){}
      const mv=ev=>{const dx=(ev.clientX-x0)/v.z,dy=(ev.clientY-y0)/v.z;if(!mov&&Math.hypot(dx,dy)<4/v.z)return;
        if(!mov){mov=true;mqAntes();if(!rz&&it.pai){/* tirar da coluna */const R=mqRectW(el);it.pai=null;it.x=R.x;it.y=R.y;ori[0].x=R.x;ori[0].y=R.y;mqRender();ghost=$(`[data-mq="${id}"]`)}else ghost=el;ghost.classList.add('arr')}
        if(rz){it.w=Math.max(120,Math.round(ori[0].w+dx));ghost.style.width=it.w+'px';requestAnimationFrame(mqSetas);return}
        ori.forEach(o=>{if(o.i.pai)return;o.i.x=Math.round(o.x+dx);o.i.y=Math.round(o.y+dy);const g=o.i.id===id?ghost:$(`[data-mq="${o.i.id}"]`);if(g){g.style.left=o.i.x+'px';g.style.top=o.i.y+'px'}});
        /* coluna por baixo? */
        if(grupo.length===1&&!['coluna'].includes(it.t)){ghost.style.pointerEvents='none';const t=document.elementFromPoint(ev.clientX,ev.clientY);ghost.style.pointerEvents='';const cb=t&&t.closest&&t.closest('[data-colb]');$$('.mq-cb.alvo').forEach(x=>x!==cb&&x.classList.remove('alvo'));colAlvo=cb&&cb.dataset.colb!==id?cb:null;if(colAlvo)colAlvo.classList.add('alvo')}
        requestAnimationFrame(mqSetas)};
      const up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);if(ghost&&ghost!==el){ghost.removeEventListener('pointermove',mv)}
        if(!mov)return;if(colAlvo){colAlvo.classList.remove('alvo');const cid=colAlvo.dataset.colb;const F=q.itens.filter(x=>x.pai===cid).sort((a,b)=>(a.o||0)-(b.o||0));let k=F.length;
          [...colAlvo.querySelectorAll(':scope > .mq-it')].forEach((c,n)=>{const r=c.getBoundingClientRect();if(k===F.length&&ev.clientY<r.top+r.height/2)k=n});F.splice(k,0,it);it.pai=cid;F.forEach((x,n)=>x.o=n)}
        save();mqRender()};
      el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)};
    el.ondblclick=e=>{e.stopPropagation();if(it.t==='quadro')return mqAbrir(it.ref);if(it.t==='nota'||it.t==='titulo')return mqEditar(id);if(it.t==='link')return mqLinkDlg(it)};
    const ed=el.querySelector(':scope > [data-ed]');if(ed)ed.onclick=e=>{if(u.sel.length===1&&u.sel[0]===id&&!e.target.closest('a'))mqEditar(id)};
    el.querySelectorAll(':scope [data-tit]').forEach(i=>{if(i.closest('.mq-it')!==el)return;i.onchange=()=>{mqAntes();it.tit=i.value.trim();save()}});
    const qn=el.querySelector('[data-qnm]');if(qn)qn.onchange=()=>{const s=MQ().find(z=>z.id===it.ref);if(s){s.nome=qn.value.trim()||'Quadro';save();mqBC()}};
    const lg=el.querySelector('[data-leg]');if(lg&&lg.closest('.mq-it')===el)lg.onchange=()=>{it.leg=lg.value;save()};
    const hx=el.querySelector('[data-hex]');if(hx)hx.oninput=()=>{it.hex=hx.value;el.querySelector('.mq-sw').style.background=hx.value;el.querySelector('small').textContent=hx.value.toUpperCase()},hx&&(hx.onchange=()=>save());
    const le=el.querySelector('[data-lked]');if(le&&le.closest('.mq-it')===el)le.onclick=()=>mqLinkDlg(it);
    if(it.t==='tarefa'){el.querySelectorAll('[data-tk]').forEach(c=>c.onchange=()=>{mqAntes();it.l[+c.dataset.tk].f=c.checked;save();if(c.checked&&it.l.every(x=>x.f)){try{const r=c.getBoundingClientRect();animConfetes(r.left,r.top)}catch(_){}}mqRender()});
      el.querySelectorAll('[data-tt]').forEach(t=>{const k=+t.dataset.tt;t.onchange=()=>{it.l[k].t=t.value;save()};t.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();it.l[k].t=t.value;mqAntes();it.l.splice(k+1,0,{t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${k+1}"]`);n&&n.focus()},20)}else if(e.key==='Backspace'&&!t.value&&it.l.length>1){e.preventDefault();mqAntes();it.l.splice(k,1);save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${Math.max(0,k-1)}"]`);n&&n.focus()},20)}}});
      const ad=el.querySelector('[data-tadd]');if(ad)ad.onclick=()=>{mqAntes();it.l.push({t:'',f:false});save();mqRender();setTimeout(()=>{const n=$(`[data-mq="${id}"] [data-tt="${it.l.length-1}"]`);n&&n.focus()},20)}}});
  $$('#mq-its input').forEach(i=>i.addEventListener('keydown',e=>e.stopPropagation()))}

/* 0.910 · «Cheio de animações»: mais efeitos (ondas ao tocar, cartões em cascata, revelação ao deslizar, visto a saltar, mini-confetes, contador da barra, inclinação suave) */
{const cheio=()=>{try{return animPerfil()==='cheio'&&animOK()&&!document.documentElement.classList.contains('a11y-rm')}catch(_){return false}};
  /* onda a partir do ponto tocado */
  addEventListener('pointerdown',e=>{if(!cheio())return;const b=e.target.closest&&e.target.closest('.btn,.nav,.chip,.tabs button,.pnk,.kpi,.mq-tool,.anopt');if(!b||b.disabled)return;const r=b.getBoundingClientRect();const d=Math.max(r.width,r.height)*2.2;
    const s=document.createElement('span');s.className='an-rip';s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`;if(getComputedStyle(b).position==='static')b.style.position='relative';b.classList.add('an-ripp');b.appendChild(s);setTimeout(()=>s.remove(),650)},{passive:true,capture:true});
  /* visto a saltar e mini-confetes ao marcar caixas */
  addEventListener('change',e=>{if(!cheio())return;const c=e.target;if(!(c instanceof HTMLInputElement)||c.type!=='checkbox'||!c.checked)return;c.classList.remove('an-chk');void c.offsetWidth;c.classList.add('an-chk');
    if(c.closest('#view,.mq')){const r=c.getBoundingClientRect();const box=document.createElement('div');box.className='an-conf an-mini';box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';const C=['#10b981','#3b82f6','#f59e0b','#ec4899'];
      for(let k=0;k<8;k++){const i=document.createElement('i');const a=k/8*Math.PI*2;i.style.cssText=`--dx:${Math.cos(a)*26}px;--dy:${Math.sin(a)*26}px;--r:${k*45}deg;background:${C[k%4]}`;box.appendChild(i)}document.body.appendChild(box);setTimeout(()=>box.remove(),800)}},true);
  /* cartões em cascata + revelação ao deslizar */
  let io=null;const rev=root=>{if(!cheio()||!('IntersectionObserver' in window))return;io=io||new IntersectionObserver(L=>L.forEach(x=>{if(x.isIntersecting){x.target.classList.add('an-vis');io.unobserve(x.target)}}),{rootMargin:'0px 0px -6% 0px'});
    const C=[...(root||document).querySelectorAll('#view .card, #view .cpm-pc, #view .pnk, #view .jn-pc')].slice(0,60);C.forEach((c,k)=>{const r=c.getBoundingClientRect();if(r.top<innerHeight){c.style.setProperty('--ci',Math.min(k,10));c.classList.add('an-card')}else{c.classList.add('an-rev');io.observe(c)}})};
  {const _g=go;go=function(){const r=_g.apply(this,arguments);try{requestAnimationFrame(()=>rev())}catch(_){}return r}}
  /* inclinação suave dos indicadores com o rato */
  addEventListener('pointermove',e=>{if(!cheio()||e.pointerType!=='mouse')return;const k=e.target.closest&&e.target.closest('#view .kpi,#view .pnk');if(!k)return;const r=k.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;k.style.transform=`perspective(600px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-2px)`;k.classList.add('an-tilt')},{passive:true});
  addEventListener('pointerout',e=>{const k=e.target.closest&&e.target.closest('.an-tilt');if(k&&!k.contains(e.relatedTarget)){k.style.transform='';k.classList.remove('an-tilt')}},{passive:true});
  /* o número de avisos da barra lateral salta quando muda */
  const mo=new MutationObserver(M=>{if(!cheio())return;M.forEach(m=>{const el=m.target.nodeType===1?m.target:m.target.parentElement;const b=el&&el.closest&&el.closest('.nbadge,#cpBadge,#jnBadge,.badge');if(b){b.classList.remove('an-bump');void b.offsetWidth;b.classList.add('an-bump')}})});
  setTimeout(()=>{const sd=document.getElementById('side');if(sd)mo.observe(sd,{subtree:true,childList:true,characterData:true})},1500);
  /* título da secção desliza ao mudar */
  {const _g2=go;go=function(){const r=_g2.apply(this,arguments);try{if(cheio()){const t=document.getElementById('ttl');if(t){t.classList.remove('an-ttl');void t.offsetWidth;t.classList.add('an-ttl')}}}catch(_){}return r}}}

/* 0.910 · sessões abertas noutros aparelhos atualizam-se sozinhas: com a app à vista, verifica a nuvem a cada 4 s
   (1 pedido pequeno; só descarrega quando outro aparelho mudou alguma coisa — ex.: testes orais gravados no telemóvel) */
{let _lv=0;const vivo=()=>{try{const L=nvL();if(document.visibilityState!=='visible'||!navigator.onLine||!L.prov||L.auto===false||L.renovar||_nvBusy||!(L.k||_nvK)||!SESSAO||document.getElementById('nvgate')||document.body.classList.contains('priv-on'))return;
    if(Date.now()-_lv<3500)return;_lv=Date.now();nvSincronizar(false).catch(()=>{})}catch(_){}};
  setInterval(()=>{if(!window.__nvRapido)vivo()},4000);addEventListener('focus',()=>setTimeout(vivo,300));addEventListener('online',()=>setTimeout(vivo,800))}

/* 0.915 · arrastar dentro da app nunca abre «Largue aqui o e-mail» */
addEventListener('dragstart',()=>{window.__dragInt=true},true);addEventListener('dragend',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);addEventListener('drop',()=>{setTimeout(()=>{window.__dragInt=false},50)},true);
/* Esc fecha os Avisos Urgentes */
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const x=document.querySelector('#avpop #av-x');if(x&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopPropagation();x.click()}},true);
/* intercalar: mudar a turma de origem */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='sel-orig'&&VIEW==='intercalar'){UI.orig=e.target.value;vIntercalar()}});
/* barra lateral: Planta da Sala logo a seguir aos Alunos; «Sumários» como subnível do Modo Aula */
function navOrdem(){['#tnavHold','#tTree','#side'].forEach(sel=>{const h=document.querySelector(sel);if(!h)return;const al=h.querySelector('[data-v="alunos"]'),pl=h.querySelector('[data-v="planta"]'),au=h.querySelector('[data-v="aula"]'),su=h.querySelector('[data-v="sumarios"]');
  if(al&&pl&&al.parentElement===pl.parentElement&&al.nextElementSibling!==pl)al.after(pl);
  if(au&&su&&au.parentElement===su.parentElement){if(au.nextElementSibling!==su)au.after(su);su.classList.add('navsub');const l=su.querySelector('.lbl');if(l&&l.textContent!=='Sumários')l.textContent='Sumários';su.title='Sumários'}})}
{const _gN=go;go=function(){const r=_gN.apply(this,arguments);try{navOrdem()}catch(_){}return r}}setTimeout(navOrdem,300);setTimeout(navOrdem,1500);
/* apagar o ano letivo limpa tudo o que lhe pertence (jornal, coordenação PROFIJ, tarefas e avisos das turmas desse ano) */
function anoLimparTudo(a){try{const ids=new Set((a.turmas||[]).map(t=>t.id));
  if(S.jornal&&S.jornal.anos){delete S.jornal.anos[a.nome];Object.keys(S.jornal.anos).forEach(k=>{if(k===a.id)delete S.jornal.anos[k]})}
  if(S.cprofij&&S.cprofij.anos){delete S.cprofij.anos[a.id];delete S.cprofij.anos[a.nome]}
  if(Array.isArray(S.todo))S.todo=S.todo.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(Array.isArray(S.avisos))S.avisos=S.avisos.filter(x=>!(x&&(ids.has(x.turma)||ids.has(x.tid)||x.ano===a.id)));
  if(S.avisosVistos)Object.keys(S.avisosVistos).forEach(k=>{if([...ids].some(i=>k.includes(i)))delete S.avisosVistos[k]});
  if(UI){UI.cpmT='';UI.jnTab='painel';UI.inst=null}}catch(e){console.warn(e)}}

/* Início: marca as colunas sem cartões para o espaço ser usado pelas outras */
function iniColVazias(){const v=$('#view .inlay');if(!v)return;const n=el=>el?[...el.children].filter(c=>(c.classList.contains('card')||/^w-/.test(c.id))&&c.style.display!=='none'&&c.offsetParent!==null).length:0;
  v.classList.toggle('sem-fav',!n($('#view .in-fav')));v.classList.toggle('sem-side',!n($('#view .in-side')))}
{const _vIC=vInicio;vInicio=function(){const r=_vIC.apply(this,arguments);try{requestAnimationFrame(iniColVazias)}catch(_){}return r};if(go._f)go._f.inicio=vInicio}
document.addEventListener('drop',()=>setTimeout(iniColVazias,60));

