/* ---------- Ajuda atualizada ---------- */
(()=>{const novos=[
 {id:'professor',ic:'user',t:'Perfil do Professor',gif:null,txt:`<p>Em Definições › <b>Professor</b> indica a fotografia, o nome completo (nos documentos aparece “Prof. Primeiro Último”), o género para “Diretor/Diretora”, contactos, horário de atendimento aos encarregados de educação, grupo de recrutamento, departamento, situação profissional, cargos e a assinatura digitalizada usada nos PDF. A fotografia aparece na barra lateral; toque nela para abrir o perfil.</p>`},
 {id:'tarefas',ic:'checks',t:'Minhas Tarefas',gif:null,txt:`<p>Secção própria com prioridade, prazo, turma e notas, agrupada em Em atraso, Hoje, Esta semana, Mais tarde e Sem prazo; inclui as decisões das reuniões. No Início, o cartão <b>Próximas Tarefas</b> mostra as próximas, deixa juntar uma tarefa rápida e concluir com um toque. O número na barra lateral indica as que estão em atraso ou para hoje.</p>`},
 {id:'arvore',ic:'layers',t:'Turmas na Barra Lateral',gif:null,txt:`<p>Com várias turmas, a barra lateral mostra <b>Turmas › turma › secções</b> (Alunos, Horário, Aulas e Sumários, Planta, Testes, Critérios, Instrumentos, Domínios, Avaliação Final, Relatórios). Com uma só turma aparece no formato simples, sem desdobráveis.</p>`},
 {id:'arrastar',ic:'calendar',t:'Arrastar Aulas no Meu Horário',gif:null,txt:`<p>Em O Meu Horário pode <b>arrastar qualquer tempo</b> — aulas ou tempos não letivos — para outro dia ou hora (com o rato ou com o dedo). Tocar numa aula abre o editor do horário. Se o tempo de destino já estiver ocupado, a app pergunta antes. ⌘Z anula.</p>`},
 {id:'importados',ic:'upload',t:'Ficheiros Importados',gif:null,txt:`<p>Sempre que importa um PDF ou Excel (turmas, horários, calendário, reuniões, critérios), o ficheiro original fica guardado em <b>Documentos › Ficheiros Importados</b>, organizado por tipo, para o abrir mais tarde. Entra na cópia de segurança completa e na sincronização com a conta Google.</p>`},
 {id:'popups',ic:'bell',t:'Testar os Avisos',gif:null,txt:`<p>Em Definições › Ferramentas › <b>Avisos em Pop-up</b>: “Testar Pop-up” mostra exemplos sem alterar dados; “Ver Avisos Reais” mostra o que está por tratar. Pode também autorizar notificações do sistema para receber avisos com a app em segundo plano.</p>`}];
 novos.forEach(n=>{const i=AJUDA.findIndex(x=>x.id===n.id);if(i>=0)AJUDA[i]=n;else AJUDA.push(n)});
 const ordem=['comecar','inicio','inicio2','tarefas','avisos','popups','professor','turmas','arvore','multidisc','naoletivos','horarios','arrastar','horedit','calendario','feriados','reunioes','reunimp','testes','avaliacao','planta','sumarios','direcao','documentos','importados','recursos','gsync','auditoria'];
 AJUDA.sort((a,b)=>{const ia=ordem.indexOf(a.id),ib=ordem.indexOf(b.id);return (ia<0?999:ia)-(ib<0?999:ib)})})();
[['tarefas','tarefas'],['avisos','avisos'],['popups','avisos'],['professor','professor'],['reunimp','reunimp'],['arrastar','arrastar'],['horedit','horedit'],['planta','planta'],['sumarios','sumarios'],['direcao','direcao'],['documentos','documentos'],['recursos','recursos'],['multidisc','multidisc'],['importados','importados']].forEach(([id,g])=>{const s=AJUDA.find(x=>x.id===id);if(s)s.gif=g});
Object.assign(AJ_VIEW,{tarefas:'tarefas',meuhorario:'arrastar',documentos:'documentos'});

document.addEventListener('click',e=>{const l=e.target.closest&&e.target.closest('[data-gopf]');if(!l)return;e.preventDefault();UI.defTab='prof';go('definicoes');const v=$('#view');if(v)v.scrollTop=0;window.scrollTo(0,0)});
/* ---------- disciplinas por ano letivo (v0.35) ---------- */
function anoAnterior(a){return S.anos.filter(x=>x!==a&&x.nome<a.nome).sort((x,y)=>y.nome.localeCompare(x.nome))[0]}
function discAno(){const a=A();if(!a)return S.cfg.disciplinas=S.cfg.disciplinas||[];if(!Array.isArray(a.disciplinas)){const ant=anoAnterior(a);a.disciplinas=[...new Set([...((ant&&Array.isArray(ant.disciplinas))?ant.disciplinas:(S.cfg.disciplinas||[])),...a.turmas.map(t=>discKey(t.disciplina,t.oferta==='profij'?'profij':t.ciclo)).filter(k=>DISCIPLINAS.some(d=>d.n===discNome(k)))])]}return a.disciplinas}
function discExtraAno(){const a=A();if(!a)return S.cfg.extra=S.cfg.extra||[];if(!Array.isArray(a.discExtra)){const ant=anoAnterior(a);a.discExtra=[...((ant&&Array.isArray(ant.discExtra))?ant.discExtra:(S.cfg.extra||[]))]}return a.discExtra}
function cartaoDisciplinas(){const c=S.cfg;const grupos=Object.entries(CICLOS).filter(([k])=>k!=='profij').map(([k,n])=>({k,n,l:DISCIPLINAS.filter(d=>d.c.includes(k))}));const vazio=!minhasDiscK().length;
  return `<details class="card ed discard" id="disc-card" ${vazio||UI.discAberto?'open':''}><summary class="row" style="list-style:none;cursor:pointer"><h2 style="margin:0">${ic('book',18)} Disciplinas que Leciono${A()?' em '+esc(A().nome):''}</h2><span class="tag">${minhasDiscK().length} escolhida${minhasDiscK().length===1?'':'s'}</span><span class="sp1"></span>${vazio?'':`<span class="btn sm dsalt">${ic('pencil',13)} Alterar</span><span class="btn sm dsfec">${ic('x',12)} Fechar</span>`}</summary>
`+`<div class="row" style="margin:10px 0 6px"><input id="d-f" placeholder="Pesquisar disciplina…" value="${esc(defFiltro)}" style="max-width:300px"></div>
    <p class="hint" style="margin-top:0">Cada disciplina é escolhida por ciclo (ex.: Inglês do 3.º ciclo e Inglês do secundário são disciplinas diferentes). Lista das disciplinas do ensino regular (1.º, 2.º e 3.º ciclos e cursos científico-humanísticos do secundário). As escolhidas aparecem ao criar turmas. <b>Cada ano letivo tem a sua lista</b> — um ano novo começa com as do ano anterior.</p>
    ${minhasDiscK().length?`<div style="margin-bottom:10px">${minhasDiscK().map(k=>`<span class="tag" style="margin:0 4px 4px 0">${esc(discNome(k))}${discCic(k)?' · '+esc(CICLOS[discCic(k)]):''}</span>`).join('')}</div>`:''}
    ${grupos.map(g=>{const l=g.l.filter(d=>!defFiltro||d.n.toLowerCase().includes(defFiltro.toLowerCase()));return l.length?`<h3>${g.n}</h3><div class="disc-grid">${l.map(d=>{const k=discKey(d.n,g.k);return `<label class="${discAno().includes(k)?'on':''}"><input type="checkbox" data-disc="${esc(k)}" ${discAno().includes(k)?'checked':''}> ${esc(d.n)}</label>`}).join('')}</div>`:''}).join('')}
    <h3>Outras disciplinas</h3><div class="row"><input id="d-x" placeholder="Nome de outra disciplina (ex.: oferta de escola)" style="max-width:360px"><button class="btn" id="d-xa">Adicionar</button></div>
    ${discExtraAno().length?`<div style="margin-top:8px">${discExtraAno().map((d,k)=>`<span class="tag" style="margin:0 4px 4px 0">${esc(d)} <a href="#" data-rx="${k}" style="color:inherit;text-decoration:none">×</a></span>`).join('')}</div>`:''}</div>
`.replace(/<\/div>\s*$/,'')+`</details>`}
function bindDisciplinas(re){const c=S.cfg;const dc=$('#disc-card');if(dc)dc.addEventListener('toggle',()=>{UI.discAberto=dc.open});
  $('#d-f').oninput=e=>{defFiltro=e.target.value;const p=e.target.selectionStart;re();const n=$('#d-f');if(n){n.focus();n.setSelectionRange(p,p)}};
  $$('[data-disc]').forEach(el=>el.onchange=()=>{const d=el.dataset.disc;UI.discAberto=true;const L=discAno();const i=L.indexOf(d);if(i>=0)L.splice(i,1);if(el.checked)L.push(d);S.cfg.disciplinas=L.slice();save();re()});
  $('#d-xa').onclick=()=>{const v=$('#d-x').value.trim();if(v&&!minhasDisc().includes(v)){discExtraAno().push(v);save();re()}};
  $$('[data-rx]').forEach(el=>el.onclick=e=>{e.preventDefault();discExtraAno().splice(+el.dataset.rx,1);save();re()});
}

{const _vt2=vTurmas;vTurmas=function(){_vt2.apply(this,arguments);const a=A();if(!a)return;const c1=$('#view > .card');if(!c1)return;c1.insertAdjacentHTML('afterend',cartaoDisciplinas());bindDisciplinas(()=>manterPosicao(vTurmas))}}
document.addEventListener('click',e=>{const l=e.target.closest&&e.target.closest('[data-godisc]');if(!l)return;e.preventDefault();UI.discAberto=true;go('turmas');setTimeout(()=>{const d=$('#disc-card');if(d)d.scrollIntoView({behavior:'smooth',block:'start'})},80)});
{const _ve2=vEscola;vEscola=function(){_ve2.apply(this,arguments);const v=$('#view');if(!v||v.querySelector('.esclay'))return;const cards=[...v.children];const tip=cards.find(c=>/Tipologia da Escola/.test((c.querySelector('h2')||{}).textContent||''));if(!tip)return;
  const lay=document.createElement('div');lay.className='esclay';const m=document.createElement('div');m.className='escmain';const s=document.createElement('div');s.className='escside';
  const prev=cards.find(c=>c.classList.contains('esc-hero'));cards.forEach(c=>{if(c===tip||c===prev)return;m.appendChild(c)});if(prev)s.appendChild(prev);s.appendChild(tip);lay.appendChild(m);lay.appendChild(s);v.appendChild(lay)}}

/* ---------- “filosofia” de ecrãs largos: cartões secundários numa coluna ao lado ---------- */
const LADO={calendario:[/^AI\s*Avaliação Intercalar|^Avaliação Intercalar/],meuhorario:['kpis',/^Tempos Não Letivos/,/^Turmas sem Horário/,/Sobreposições/],tarefas:['kpis',/^Avisos Urgentes/,/^Decisões e Tarefas das Reuniões/],
  turmas:[/^Horários Importados/],horario:['kpis',/^Disciplina Nesta Turma/,/^Aulas Previstas/,/^Próximas Aulas/],criterios:[/^Turma$/],definicoes:[/^Avisos em Pop-up/],ajuda:[/^Guia do EduSpruce/]};
const LADO_MIN=1150;
function layoutLado(){const v=document.getElementById('view');if(!v)return;const R=LADO[VIEW];if(!R||v.clientWidth<LADO_MIN)return;
  const kids=[...v.children];if(kids.some(c=>c.classList.contains('vlay'))&&kids.every(c=>c.classList.contains('vlay')||c.matches('.tabs,.deftabs,input[type=file]')))return;
  const tit=c=>(((c.querySelector(':scope>h2,:scope>.row>h2,:scope>summary>h2,:scope .ajhd>h2,:scope>div>h2')||{}).textContent)||'').trim();
  const lado=kids.filter(c=>(c.matches('.kpis')&&R.includes('kpis'))||(c.matches('.card')&&R.some(re=>re instanceof RegExp&&re.test(tit(c)))));if(!lado.length)return;
  const lay=document.createElement('div');lay.className='vlay';const m=document.createElement('div');m.className='vmain';const s=document.createElement('div');s.className='vside';
  const topo=[];for(const c of kids){if(c.matches('.tabs,.deftabs')&&!m.children.length)topo.push(c);else break}
  const ae=document.activeElement;let ss=null,se=null;try{ss=ae&&ae.selectionStart;se=ae&&ae.selectionEnd}catch(_){}const y=v.scrollTop;
  kids.forEach(c=>{if(topo.includes(c)||c.matches('input[type=file]'))return;(lado.includes(c)?s:m).appendChild(c)});lay.appendChild(m);lay.appendChild(s);v.appendChild(lay);v.scrollTop=y;
  if(ae&&ae!==document.body&&v.contains(ae)&&document.activeElement!==ae){try{ae.focus({preventScroll:true});if(ss!=null)ae.setSelectionRange(ss,se)}catch(_){}}}
{let _lt=0;new MutationObserver(()=>{cancelAnimationFrame(_lt);_lt=requestAnimationFrame(()=>{try{layoutLado()}catch(e){console.error(e)}})}).observe(document.getElementById('view'),{childList:true});
 let _lw=null;addEventListener('resize',()=>{const v=document.getElementById('view');if(!v||!LADO[VIEW])return;const larg=v.clientWidth>=LADO_MIN;if(_lw!==null&&larg!==_lw){clearTimeout(layoutLado._r);layoutLado._r=setTimeout(()=>go(VIEW),120)}_lw=larg})}

/* análise: no Gerador de Documentos a pré-visualização fica ao lado do texto */
{const _vdoc=vDocumentos;vDocumentos=function(){_vdoc.apply(this,arguments);const v=$('#view');const pv=$('#dc-pv');if(!v||!pv||v.clientWidth<LADO_MIN)return;const card=pv.closest('.card');if(!card)return;
  const h3=[...card.querySelectorAll('h3')].find(x=>/Pré-visualização/i.test(x.textContent));const tabs=v.querySelector(':scope>.tabs');
  const lay=document.createElement('div');lay.className='vlay';const m=document.createElement('div');m.className='vmain';const s=document.createElement('div');s.className='vside';
  const sc=document.createElement('div');sc.className='card';sc.innerHTML=`<h2 style="margin:0 0 10px">${ic('access',18)} Pré-Visualização</h2>`;if(h3)h3.remove();sc.appendChild(pv);s.appendChild(sc);
  [...v.children].forEach(c=>{if(c!==tabs)m.appendChild(c)});lay.appendChild(m);lay.appendChild(s);v.appendChild(lay)}}
/* glossário: dica (tooltip) em todas as siglas que aparecem na app */
const GLOSS=(()=>{const G={};try{const s=AJUDA.find(x=>x.id==='glossario');const d=document.createElement('div');d.innerHTML=s.txt;const dts=[...d.querySelectorAll('dt')];
  dts.forEach(dt=>{const dd=dt.nextElementSibling;if(!dd)return;const ks=dt.textContent.split('·').map(x=>x.trim().replace(/‑/g,'-')).filter(Boolean);const vs=dd.textContent.trim().replace(/\.$/,'').split('·').map(x=>x.trim());ks.forEach((k,i)=>{G[k]=ks.length>1&&vs.length===ks.length?vs[i]:dd.textContent.trim()})})}catch(_){}
  Object.assign(G,{UFCD:'Unidade de formação de curta duração (PROFIJ / cursos profissionais)',UC:'Unidade de competência (referencial de competências do Catálogo Nacional de Qualificações)',EE:'Encarregado(a) de educação',CT:'Conselho de turma',CP:'Conselho pedagógico',DP:'Departamento',GD:'Grupo disciplinar',ASE:'Ação Social Escolar','DT-AP':'Direção de turma — atendimento aos encarregados de educação','CNL-E/s':'Componente não letiva de estabelecimento — atividades colaborativas / projetos',PLNM:'Português língua não materna',EMRC:'Educação Moral e Religiosa Católica',TIC:'Tecnologias da Informação e Comunicação','F':'Falta do professor (não conta como aula dada)'});return G})();
function aplicarGlossario(root){if(!root)return;root.querySelectorAll('span,b,th,td,small,button,.tag,.mta,.mtp,.nlb,label,dt').forEach(el=>{if(el.hasAttribute('title')||el.hasAttribute('data-tip')||el.children.length>2)return;const t=(el.textContent||'').trim().replace(/‑/g,'-');if(!t||t.length>14)return;
  let k=GLOSS[t]?t:(/^Σ/.test(t)?'Σ':null);if(!k){const u=t.replace(/[:·.]$/,'').toUpperCase();if(GLOSS[u]&&u.length>=2&&t===t.toUpperCase())k=u}if(!k||(k==='F'&&!el.closest('.cd,.mtc,.cal,.mtmeses')))return;el.setAttribute('title',(k==='Σ'?'Σ — ':k+' — ')+GLOSS[k]);el.classList.add('gl-tip')})}
{let _g=0;const run=()=>{cancelAnimationFrame(_g);_g=requestAnimationFrame(()=>{try{aplicarGlossario($('#view'));aplicarGlossario($('#dw-b'))}catch(_){}})};new MutationObserver(run).observe(document.body,{childList:true,subtree:true});run()}

