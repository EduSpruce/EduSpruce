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
function vCProfij(){if(!cpOn()){$('#view').innerHTML=`<div class="card empty">${ic('award',30)}<br><b>O módulo Coord. PROFIJ está desativado</b><br><span class="mut">Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor, ou ative-o em Definições › Os Meus Módulos.</span><br><br><button class="btn pri" id="cp-on">Ativar o Módulo</button></div>`;$('#cp-on').onclick=()=>{cpAtivar(true);go('cprofij')};return}
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
     ${cl.formandos.map(al=>{const r=cpLinha(cl,al,a);return `<tr><td class="n">${esc(al.num||'')}</td><td style="text-align:left"><span class="cpfo">${avatar(al.ref||{nome:al.nome},32)}<span>${esc(al.nome)}</span></span></td>${CP_COMP.map(([k])=>{const v=r.comp[k];return `<td><button type="button" class="cpv ${cpCls(v&&v.v)} ${v&&v.man?'man':''}" data-cpman="${esc(cl.nome)}|${esc(al.k)}|${k}" title="${v&&v.man?'Média escrita à mão — toque para mudar':v?'Calculada a partir de '+v.n+' disciplina(s) desta app — toque para escrever a média da pauta':'Toque para escrever a média da pauta'}">${cpFmt(v&&v.v)}</button></td>`}).join('')}
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
try{AJUDA.push({id:'cprofij',ic:'award',t:'Coord. PROFIJ — Coordenação do Programa PROFIJ',gif:null,txt:`<p>Módulo opcional para o(a) <b>coordenador(a) do PROFIJ</b>. Aparece sozinho quando assinala o cargo «Coordenador(a) do PROFIJ» em Definições › Professor (ou em Definições › Os Meus Módulos).</p><ul><li><b>Painel</b>: turmas PROFIJ, formandos em risco, FPCT por colocar, provas dos próximos 30 dias e o que precisa de atenção.</li><li><b>Turmas e Formandos</b>: médias por componente (sociocultural, científica, tecnológica), FPCT e PAF de cada formando, com a regra da Portaria n.º 86/2018 (≥ 10 em cada uma). As médias vêm das suas disciplinas; as dos colegas escrevem-se à mão a partir da pauta. Indique o diretor de turma de cada turma.</li><li><b>FPCT</b>: entidades de acolhimento (tutor, contactos, protocolo) e, por formando, entidade, datas, horas previstas e feitas, classificação e estado.</li><li><b>PAF e PEA</b>: marcar provas com data, hora, sala, júri, formandos e classificações; exportar para o Calendário (.ics) com alarme na véspera.</li><li><b>Conselho dos Cursos</b>: membros (coordenador e diretores de turma) e as reuniões com «Conselho dos Cursos PROFIJ» no título, com o estado da ata.</li><li><b>Legislação</b>: Portaria n.º 52/2016, Portaria n.º 86/2018 e os documentos da escola, com ligações.</li><li><b>Exportar CSV</b> com a situação de todos os formandos.</li></ul>`})}catch(_){}

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
  if(!modo){alert('Não há outra forma de confirmar a sua identidade neste aparelho.\n\nToque em «Sair», entre de novo com a sua conta e defina um código novo em Definições › Segurança.');return}
  const d=document.createElement('dialog');d.className='nvmc';d.innerHTML=`<form class="nvmcf" data-nosub autocomplete="on"><input type="text" name="username" autocomplete="username" value="${esc(gsCfg&&gsCfg().email||s.u||'')}" hidden readonly><h2>${ic('cadeadoAb',18)} Esqueci-me do Código</h2>
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
setInterval(()=>{if(document.hidden)return;const g=document.getElementById('nvgate');document.body.classList.toggle('nv-gating',!!g);if(!g&&window.__nvGateFila&&document.querySelector('dialog[data-espera]'))window.__nvGateFila()},150);
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
