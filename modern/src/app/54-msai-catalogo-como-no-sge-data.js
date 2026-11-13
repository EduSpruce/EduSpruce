/* ===================== v0.920 · MSAI: catálogo como no SGE (Data de início · Ação · Disciplina) ===================== */
const MSAI_SGE={
  univ:{t:'Medidas Universais',cats:[
    {k:'dif',t:'Diferenciação pedagógica',leg:['univ',0],it:['Adequar o tempo de realização de tarefas ao aluno','Apresentar os conceitos recorrendo a múltiplas representações','Criar grupos de alunos segundo os seus interesses, temas ou capacidades','Disponibilizar material suplementar e ferramentas organizacionais','Escolher textos de acordo com o nível de leitura dos alunos','Explorar a interdisciplinaridade das noções e dos conceitos','Fornecer fichas de trabalho diferentes aos alunos, conforme as suas dificuldades de aprendizagem e ritmo de produção','Propor a realização de uma tarefa com diferentes materiais','Proporcionar oportunidades de trabalho em grupo','Usar maneiras diferentes de completar tarefas, testes e atividades']},
    {k:'psi',t:'Apoio psicopedagógico',leg:['selet',2],it:['Capacitação do(s) professor(es) ou de um outro agente educativo para desenvolver nos alunos estratégias de autorregulação da aprendizagem, da tomada de decisão e da resolução de problemas','Capacitação do(s) professor(es) ou de um outro agente educativo para intervir na resolução de problemas comportamentais','Capacitação do(s) professor(es) para potenciar a sua relação pedagógica']},
    {k:'aco',t:'Acomodações curriculares',leg:['univ',1],it:['Apresentação do conteúdo','Comportamento','Localização do aluno na sala de aula','Outra','Testes e fichas de trabalho'],outra:3},
    {k:'int',t:'Intervenção com foco académico ou comportamental em contexto de sala de aula, mas também em pequenos grupos;',leg:['univ',4],it:['Apoio ao estudo a um determinado ciclo','Atividades de Apoio à Aprendizagem (conforme alínea a) do n.º 1 do artigo 8.º e n.ºs 19,20, e 21 do artigo 9.º do DLR n.º 16/2019/A, de 23 de julho)','Criação de uma oficina de escrita','Grupos de promoção de competências matemáticas','Intervenção do professor, com alguma sistematicidade, junto de um grupo selecionado de alunos, na sala de aula, para apoio mais individualizado.']},
    {k:'enr',t:'Enriquecimento curricular',leg:['univ',2],it:['Atividades de complemento curricular (conforme alínea b) do n.º 1 do artigo 8.º e 15.º do DLR n.º 16/2019/A, de 23 de julho','Biblioteca escolar','Clubes escolares','Desporto escolar','Outras iniciativas da escola que complementem o currículo','Projetos de âmbito local, nacional e internacional','Sala de estudo']},
    {k:'pro',t:'Promoção do comportamento pró-social',leg:['univ',3],it:['Currículos e programas centrados no desenvolvimento de competências','Definição e ensino de expetativas comportamentais claras e declaradas de forma positiva','Ensino, modelagem e prática de procedimentos, regras e rotinas','Estratégias eficazes de gestão de comportamentos','Respostas adequadas e consistentes a comportamentos problemáticos','Sistemas de reconhecimento e reforço positivo dos comportamentos desejados']},
    {k:'tut',t:'Apoio tutorial',leg:['selet',4],it:['Atribuição de um tutor, docente ou par, com caráter preventivo e temporário']}]},
  selet:{t:'Medidas Seletivas',cats:[{k:'sel',t:'Medidas seletivas',leg:['selet',-1],it:MEDIDAS.selet.l.slice()}]},
  adic:{t:'Medidas Adicionais',cats:[{k:'adi',t:'Medidas adicionais',leg:['adic',-1],it:MEDIDAS.adic.l.slice()}]}};
const msaiId=(ac,c,i)=>ac+'.'+c+'.'+i;
function msaiDiscs(t,a){const A_=A();const L=new Set([t.disciplina]);try{(A_.turmas||[]).forEach(x=>{if(x===t)return;if((x.alunos||[]).some(y=>(a.processo&&y.processo===a.processo)||normT(y.nome)===normT(a.nome)))L.add(x.disciplina)})}catch(_){}return [...L].filter(Boolean)}
/* reflete o registo SGE nas medidas da app (quadro MSAI, PDF e CSV) */
function msaiLegado(a){const R=a.msaiSge||{};a.medidas=a.medidas||{};const auto=a.medSgeAuto=a.medSgeAuto||{};
  Object.keys(auto).forEach(k=>{a.medidas[k]=(a.medidas[k]||[]).filter(i=>!(auto[k]||[]).includes(i))});const nv={};
  Object.entries(MSAI_SGE).forEach(([ac,A_])=>A_.cats.forEach(c=>c.it.forEach((x,i)=>{const r=R[msaiId(ac,c.k,i)];if(!r||!Object.keys(r.d||{}).length)return;const [k,idx]=c.leg;const j=idx<0?i:idx;(nv[k]=nv[k]||new Set()).add(j);
    if(c.k==='aco'&&i===2){a.acomod=a.acomod||[];if(!a.acomod.includes(0))a.acomod.push(0)}})));
  a.medSgeAuto={};Object.entries(nv).forEach(([k,S_])=>{const ja=new Set(a.medidas[k]||[]);a.medSgeAuto[k]=[...S_].filter(j=>!ja.has(j));a.medidas[k]=[...new Set([...(a.medidas[k]||[]),...S_])].sort((p,q)=>p-q)})}
function msaiSgeAbrir(tid,aid){const t=A().turmas.find(x=>x.id===tid)||T();const a=t&&t.alunos.find(x=>x.id===aid);if(!a)return;a.msaiSge=a.msaiSge||{};const R=a.msaiSge;
  const st={ac:UI.msaiAc||'univ',disc:UI.msaiDisc&&msaiDiscs(t,a).includes(UI.msaiDisc)?UI.msaiDisc:'',ini:UI.msaiIni||isoData(new Date())};const el=document.createElement('div');el.className='msge';
  const D=msaiDiscs(t,a);let e={};try{e=escolaDe(t)||{}}catch(_){}
  const pinta=()=>{const A_=MSAI_SGE[st.ac];
    el.innerHTML=`<div class="msgeh"><div><b>N.º Processo:</b> ${esc(a.processo||'—')}</div><div><b>Aluno:</b> ${esc(a.nome)}</div><div><b>Entidade:</b> ${esc(nomeEscola(e)||S.cfg.escola||'—')}</div><div><b>Escolaridade:</b> ${esc((CICLOS[t.ciclo]||'')+(t.anoEsc?'/'+t.anoEsc+' Ano':''))}</div><div><b>Turma:</b> ${esc(a.origem||t.nome)}</div></div>
    <div class="msgef"><label for="ms-ini">Data de início:</label><input type="date" id="ms-ini" value="${esc(st.ini)}">
      <label for="ms-ac">Ação:</label><select id="ms-ac">${Object.entries(MSAI_SGE).map(([k,x])=>`<option value="${k}" ${k===st.ac?'selected':''}>${esc(x.t)}</option>`).join('')}</select>
      <label for="ms-di">Disciplina:</label><select id="ms-di"><option value="">selecionar</option>${D.map(d=>`<option ${d===st.disc?'selected':''}>${esc(d)}</option>`).join('')}<option value="*" ${st.disc==='*'?'selected':''}>Todas as disciplinas</option></select></div>
    ${st.disc?'':'<p class="msgew">Selecione a disciplina para assinalar as medidas.</p>'}
    <table class="msget"><thead><tr><th>${esc(A_.t)}</th><th></th><th>Disciplina(s)</th></tr></thead><tbody>
    ${A_.cats.map(c=>`<tr class="msgec"><td colspan="3">${esc(c.t)}</td></tr>`+c.it.map((x,i)=>{const id=msaiId(st.ac,c.k,i);const r=R[id];const ds=r?Object.keys(r.d||{}):[];const on=st.disc==='*'?D.every(d=>ds.includes(d))&&ds.length>0:ds.includes(st.disc);
      return `<tr class="msgei ${i===c.it.length-1?'ult':''}"><td><span class="msgel"></span>${esc(x)}${c.outra===i?` <input class="msgeo" data-mso="${id}" value="${esc(r&&r.outra||'')}" aria-label="Outra acomodação">`:''}</td><td class="ck"><input type="checkbox" data-msi="${id}" ${on?'checked':''} ${st.disc?'':'disabled'} aria-label="${esc(x)}"></td><td class="ds">${ds.map(d=>`<span title="Desde ${esc(fmtIsoL(r.d[d]))}">${esc(d)}</span>`).join('<br>')}</td></tr>`}).join('')).join('')}</tbody></table>`;
    el.querySelector('#ms-ac').onchange=ev=>{st.ac=UI.msaiAc=ev.target.value;pinta()};el.querySelector('#ms-di').onchange=ev=>{st.disc=UI.msaiDisc=ev.target.value;pinta()};el.querySelector('#ms-ini').onchange=ev=>{st.ini=UI.msaiIni=ev.target.value||isoData(new Date())};
    el.querySelectorAll('[data-msi]').forEach(cb=>cb.onchange=()=>{const id=cb.dataset.msi;const r=R[id]=R[id]||{d:{}};const alvo=st.disc==='*'?D:[st.disc];
      alvo.forEach(d=>{if(cb.checked)r.d[d]=r.d[d]||st.ini;else delete r.d[d]});if(!Object.keys(r.d).length&&!r.outra)delete R[id];msaiLegado(a);save();audit('MSAI',cb.checked?'Medida assinalada':'Medida retirada',a.nome+' · '+id);pinta()});
    el.querySelectorAll('[data-mso]').forEach(i=>i.onchange=()=>{const id=i.dataset.mso;const r=R[id]=R[id]||{d:{}};r.outra=i.value.trim();if(!Object.keys(r.d).length&&!r.outra)delete R[id];save()})};
  pinta();
  const pdf=document.createElement('button');pdf.className='btn sm';pdf.type='button';pdf.innerHTML=ic('file',14)+' Exportar PDF';pdf.onclick=()=>{try{exportarMsaiPdf(t,[a])}catch(e){toast(e.message,'erro')}};
  ecraAmplo({titulo:'Medidas de Suporte — '+a.nome,sub:'Registo como no SGE · '+(a.origem||t.nome),el,acoes:[pdf],aoFechar:()=>{try{if(UI._fichaId===a.id&&$('#drawer.on'))fichaAluno(a.id,'msai');else if(VIEW==='alunos')vAlunos()}catch(_){}}})}
function msaiSgeResumo(a){const R=a.msaiSge||{};const L=[];Object.entries(MSAI_SGE).forEach(([ac,A_])=>A_.cats.forEach(c=>c.it.forEach((x,i)=>{const r=R[msaiId(ac,c.k,i)];if(r&&Object.keys(r.d||{}).length)L.push({ac:A_.t,cat:c.t,x:x+(r.outra?': '+r.outra:''),d:r.d})})));return L}
/* na ficha do aluno (separador MSAI) */
{const _fM=fichaAluno;fichaAluno=function(id,tab){const r=_fM.apply(this,arguments);try{if((tab||UI.fichaTab)==='msai'){const dw=$('#dw-b');const t=T();const a=t&&t.alunos.find(x=>x.id===id);if(dw&&a&&!dw.querySelector('.msgeb')){const L=msaiSgeResumo(a);
  const alvo=dw.querySelector('.fichatabs')||dw.firstElementChild;alvo.insertAdjacentHTML('afterend',`<div class="msgeb"><div class="msgebh"><div><b>${ic('access',16)} Registo como no SGE</b><span>Data de início, ação e disciplina, com o catálogo de medidas do SGE.</span></div><button type="button" class="btn pri" data-msge="${esc(id)}">${ic('list',15)} Abrir Catálogo</button></div>
    ${L.length?`<ul class="msgel2">${L.map(x=>`<li><small>${esc(x.ac)} · ${esc(x.cat)}</small>${esc(x.x)}<span>${Object.entries(x.d).map(([d,i])=>esc(d)+' desde '+esc(fmtIso(i))).join(' · ')}</span></li>`).join('')}</ul>`:''}</div>`);
  dw.querySelector('[data-msge]').onclick=()=>msaiSgeAbrir(t.id,id)}}}catch(e){console.warn(e)}return r}}
/* no quadro MSAI: abrir o catálogo de qualquer aluno */
{const _vMs=vMsai;vMsai=function(t,al){const r=_vMs.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-msge')){bx.insertAdjacentHTML('afterbegin',`<button class="btn" id="b-msge">${ic('list',15)} Catálogo SGE</button>`);$('#b-msge').onclick=()=>{
  openDrawer('Catálogo SGE — escolher aluno',`<div class="ed"><p class="hint" style="margin-top:0">Escolha o aluno para registar as medidas como no SGE.</p><div class="msgea">${al.map(a=>{const n=msaiSgeResumo(a).length;return `<button type="button" class="btn" data-msa="${a.id}"><b class="n">${esc(numAl(a))}</b> ${esc(a.nome)}${n?` <span class="tag">${n}</span>`:''}</button>`}).join('')}</div></div>`);
  $$('[data-msa]').forEach(b=>b.onclick=()=>{closeDrawer();msaiSgeAbrir(t.id,b.dataset.msa)})}}}catch(e){console.warn(e)}return r}}

/* ===================== v0.920 · Perfil: «Onde Estou e Como Avançar» (sem espaços vazios; patamares e próximos passos por competência) ===================== */
const ONDE_B=[[0,'Em construção','#c0392b'],[.5,'A consolidar','#d98b00'],[.7,'Seguro','#1f7a4d'],[.9,'Excelente','#1b6e99']];
const ondeBanda=v=>{let b=0;ONDE_B.forEach((x,i)=>{if(v>=x[0])b=i});return b};
/* para cada competência e patamar: onde estou · dois passos concretos para avançar */
const ONDE={
  co:[['Percebe palavras soltas e ideias muito simples quando o discurso é lento e claro.',['Ouvir duas vezes: a 1.ª para o tema, a 2.ª para 3 palavras-chave','Usar vídeos curtos com legendas em inglês e repetir sem legendas']],
      ['Compreende a ideia geral de textos orais conhecidos, mas perde pormenores.',['Antes de ouvir, ler as perguntas e prever as respostas','Tomar notas com símbolos (números, nomes, datas) durante a audição']],
      ['Compreende a ideia geral e a maior parte dos pormenores em temas do programa.',['Ouvir podcasts autênticos de 3–5 minutos por semana','Identificar a opinião e a atitude do falante, não só a informação']],
      ['Compreende discurso autêntico, a ideia global e os pormenores, mesmo com sotaques diferentes.',['Explorar notícias e entrevistas com sotaques variados','Resumir oralmente o que ouviu em 60 segundos']]],
  ce:[['Reconhece palavras e frases simples, sobretudo com apoio de imagens.',['Ler textos curtos com imagens e sublinhar o que já conhece','Criar um glossário pessoal com 5 palavras novas por semana']],
      ['Compreende a ideia geral de textos simples, mas depende da tradução palavra a palavra.',['Ler primeiro o título e o 1.º parágrafo para prever o tema','Deduzir o sentido das palavras pelo contexto antes de consultar o dicionário']],
      ['Compreende textos do programa e localiza informação específica com segurança.',['Identificar a intenção do autor e as palavras que a revelam','Ler um texto autêntico por semana (artigo, conto, blogue)']],
      ['Lê com autonomia textos autênticos e infere sentidos implícitos.',['Comparar dois textos sobre o mesmo tema e as suas perspetivas','Ler uma obra curta em versão original (graded reader B2 ou superior)']]],
  pe:[['Escreve frases simples e isoladas, com erros que dificultam a compreensão.',['Escrever 3–4 frases ligadas com and, but, because','Copiar e adaptar um modelo de texto dado pelo professor']],
      ['Escreve textos curtos compreensíveis, mas pouco organizados e com erros frequentes.',['Planear antes de escrever: ideias principais em tópicos','Rever com uma lista de verificação (tempos verbais, ortografia, conectores)']],
      ['Escreve textos organizados e adequados ao objetivo, com alguns erros que não impedem a comunicação.',['Variar conectores e estruturas (although, however, relative clauses)','Reescrever um parágrafo a partir do feedback recebido']],
      ['Escreve textos coesos, ricos e adequados ao público, com bom controlo da língua.',['Experimentar géneros novos: artigo de opinião, crítica, carta formal','Fazer revisão entre pares e justificar as alterações']]],
  po:[['Fala com frases memorizadas, muitas pausas e ajuda frequente.',['Preparar um guião com 5 expressões-chave antes de falar','Ensaiar em voz alta e gravar 30 segundos']],
      ['Comunica o essencial em situações conhecidas, com hesitações e erros.',['Gravar 1 minuto sobre um tema e ouvir-se para se corrigir','Aprender 3 expressões para ganhar tempo (Well…, Let me think…)']],
      ['Exprime-se com relativa fluência e correção em temas do programa.',['Alargar o vocabulário com sinónimos e expressões idiomáticas','Fazer apresentações curtas sem ler, apenas com tópicos']],
      ['Fala com fluência, correção e à-vontade, adaptando o registo à situação.',['Participar em debates e defender um ponto de vista','Trabalhar a pronúncia e a entoação com materiais autênticos']]],
  io:[['Responde a perguntas simples com palavras isoladas.',['Usar frases de sobrevivência para pedir ajuda (Can you repeat, please?)','Praticar diálogos curtos em pares, com papéis definidos']],
      ['Participa em trocas simples, mas raramente toma a iniciativa.',['Preparar 3 perguntas antes de cada atividade oral','Reagir ao que o colega diz (Really? Why do you think so?)']],
      ['Interage com à-vontade, pergunta, responde e mantém a conversa.',['Moderar uma discussão em pequeno grupo','Pedir e dar opiniões fundamentadas']],
      ['Interage com naturalidade e gere a conversa com eficácia.',['Negociar e chegar a acordos em role-plays complexos','Apoiar colegas na interação (tutoria entre pares)']]],
  gr:[['Reconhece algumas estruturas, mas ainda não as aplica com correção.',['Exercícios curtos e diários (10 minutos)','Criar fichas de revisão com exemplos próprios']],
      ['Aplica as estruturas trabalhadas em exercícios, mas não as usa espontaneamente.',['Usar cada estrutura nova num pequeno texto','Corrigir os erros dos testes e refazer os exercícios']],
      ['Usa as estruturas e o vocabulário com correção na maior parte das situações.',['Alargar o vocabulário por famílias de palavras','Identificar os próprios erros recorrentes e trabalhá-los']],
      ['Domina as estruturas e usa vocabulário variado e preciso.',['Explorar collocations e registo formal/informal','Ajudar colegas a rever textos']]],
  at:[['Cumpre de forma irregular as tarefas e a participação.',['Usar uma agenda para registar tarefas e prazos','Definir com o professor uma meta semanal concreta']],
      ['É geralmente cumpridor, mas a participação e a autonomia ainda variam.',['Pedir ajuda logo que surja uma dúvida','Trazer sempre o material e rever a matéria da aula anterior']],
      ['Revela responsabilidade, empenho e autonomia.',['Assumir um papel de liderança no trabalho de grupo','Propor temas ou materiais para as aulas']],
      ['É um exemplo de responsabilidade e iniciativa.',['Apoiar colegas como tutor','Desenvolver um pequeno projeto pessoal ligado à disciplina']]]};
const ONDE_GEN=[['Ainda está a construir as bases deste domínio.',['Rever os conteúdos essenciais com fichas curtas','Pedir feedback ao professor depois de cada tarefa']],['Atingiu parte das aprendizagens, com lacunas a consolidar.',['Corrigir os erros e refazer as tarefas','Estudar um pouco todos os dias em vez de só antes dos testes']],['Domina as aprendizagens com segurança.',['Resolver tarefas mais exigentes','Explicar a matéria a um colega']],['Revela um domínio muito sólido e autónomo.',['Aprofundar com desafios e projetos','Ligar os conteúdos a outras disciplinas']]];
function ondeHTML(t,X,V){const ok=X.dom.filter(x=>x.v!=null);if(!ok.length)return `<p class="mut">Ainda sem classificações neste período. Assim que houver avaliações, aparece aqui onde está e como avançar em cada domínio.</p>`;
  const S_=ok.slice().sort((a,b)=>b.v-a.v);const forte=S_[0],foco=S_.length>1?S_[S_.length-1]:null;
  const linha=(x,papel)=>{const b=ondeBanda(x.v);const C=(ONDE[x.cat]||ONDE_GEN)[b]||ONDE_GEN[b];const prox=ONDE_B[b+1];const falta=prox?Math.max(0,prox[0]-x.v):0;
    const meta=prox?`Próxima meta: <b>${esc(prox[1])}</b> · faltam ${isSec(t)?(falta*20).toFixed(1).replace('.',',')+' valores':Math.ceil(falta*100)+' %'}`:'Patamar máximo: manter e aprofundar';
    const tr=x.va!=null?x.v-x.va:null;
    return `<div class="ond ${papel||''}" style="--bc:${ONDE_B[b][2]}"><div class="ondh">${icDom(x.d,15)}<b>${esc(x.d.nome)}</b>${papel==='forte'?`<span class="ondt ok">${x.v>=.7?'Ponto forte':'Melhor domínio'}</span>`:papel==='foco'?'<span class="ondt fo">Próximo passo</span>':''}<span class="sp1"></span><em>${V(x.v)}</em></div>
      <div class="ondb">${ONDE_B.map((q,i)=>`<i class="${i<=b?'on':''}" title="${esc(q[1])}"></i>`).join('')}<span>${esc(ONDE_B[b][1])}${tr!=null&&Math.abs(tr)>=.02?` · <span class="${tr>0?'up':'dn'}">${tr>0?'▲':'▼'} desde o período anterior</span>`:''}</span></div>
      <p class="ondw"><small>Onde estou</small>${esc(C[0])}</p><div class="onda"><small>Como avançar</small><ul>${C[1].map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div><p class="ondm">${meta}</p></div>`};
  return `<div class="ondg">${linha(forte,'forte')}${foco&&foco!==forte?linha(foco,'foco'):''}</div>${S_.length>2?`<details class="ondx"><summary>Ver todos os domínios (${S_.length})</summary><div class="ondg">${S_.filter(x=>x!==forte&&x!==foco).map(x=>linha(x)).join('')}</div></details>`:''}`}
{const _pA=perfilAluno;perfilAluno=function(aid,opt){const r=_pA.apply(this,arguments);try{ondeAplicar(aid)}catch(e){console.warn(e)}return r}}
function ondeAplicar(aid){const t=T();if(!t)return;const a=t.alunos.find(x=>x.id===aid);if(!a)return;const run=()=>{const o=document.querySelector('.pab');if(!o)return;
  const sec=[...o.querySelectorAll('section.pc')].find(s=>/Onde Estou e Como Avançar/.test((s.querySelector('h2')||{}).textContent||''));if(!sec||sec.dataset.onde)return;
  const pb=document.querySelector('[data-pap].on');const p=pb?+pb.dataset.pap:perAtual(t);const X=perfilDados(t,a,p);const sc=isSec(t);const V=f=>f==null?'—':sc?(f*20).toFixed(1).replace('.',','):Math.round(f*100)+'%';
  sec.dataset.onde=1;sec.classList.add('pwide','ondsec');sec.innerHTML=`<h2>${ic('sparkle',16)} Onde Estou e Como Avançar</h2>${ondeHTML(t,X,V)}`};
  run();if(window._ondeMO)window._ondeMO.disconnect();const mo=window._ondeMO=new MutationObserver(()=>{if(!document.querySelector('.pab')){mo.disconnect();return}run()});mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),10*60*1000)}

/* ===================== v0.920 · horário do professor a partir do TeacherSchedule (Excel ou PDF) ===================== */
const TS_DN={segunda:1,terca:2,quarta:3,quinta:4,sexta:5,sabado:6};
function tsSigNL(n){const k=normT(n);if(/atendimento/.test(k))return 'DT-AP';if(/dire[cç]?ao de turma|direcao de turma/.test(k))return 'DT';if(/biblioteca/.test(k))return 'Biblioteca';if(/tutori/.test(k))return 'Tutoria';if(/clube/.test(k))return 'Clube';if(/coadjuv/.test(k))return 'Coadj.';if(/apoio/.test(k))return 'Apoio';
  if(n.length<=10)return n.replace(/^CNLE/i,'CNL-E');return n.split(/\s+/).filter(w=>w.length>2).map(w=>w[0].toUpperCase()).join('')}
/* uma célula «Disciplina» (+ «Sala») → aulas e/ou tempos não letivos */
function tsCelula(txt,sala){const L=String(txt||'').split(/\n/).map(x=>x.trim()).filter(Boolean);if(!L.length)return {aulas:[],nl:[]};const S_=String(sala||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
  const reT=/^(\d{1,2})\s*[ºª°.]?\s*([A-Z]{1,3})$/i,reS=/^\((.+)\)$/;const A_=[];let i=0;
  while(i<L.length-1&&reT.test(L[i])&&reS.test(L[i+1])){A_.push({turma:L[i].replace(/\s+/g,''),sig:L[i+1].match(reS)[1].trim()});i+=2}
  if(A_.length&&i>=L.length)return {aulas:A_.map((x,k)=>({...x,sala:S_[k]||S_[0]||''})),nl:[]};
  const full=L.join(' ').replace(/\s+-\s*$/,'').replace(/\s+/g,' ').trim();const m=full.match(/^(.*?)\s*\(([^()]+)\)\s*$/);const nome=(m?m[1]:full).trim(),tag=m?m[2].trim():'';
  if(/letivo/i.test(tag)||!tag&&!/\d/.test(nome))return {aulas:[],nl:[{sig:tsSigNL(nome),nome:nome+(/n[aã]o letivo/i.test(tag)?'':tag?' (letivo)':''),sala:S_[0]||''}]};
  return {aulas:[{turma:nome,sig:tag||nome,sala:S_[0]||''}],nl:[]}}
/* grelha comum: linhas [{ini,fim,dias:{d:{t,s}}}] → estrutura do horário do professor */
function tsMontar(G,ficheiro,docente,ano,preview){const aulas=[],nl=[];const linhas=G.map(g=>({ini:g.ini,fim:g.fim}));const ult={};
  G.forEach(g=>Object.entries(g.dias).forEach(([d,c])=>{d=+d;const r=tsCelula(c.t,c.s);r.aulas.forEach(x=>{if(!aulas.some(y=>y.dia===d&&y.ini===g.ini&&y.turma===x.turma&&y.sig===x.sig))aulas.push({dia:d,ini:g.ini,fim:g.fim,turma:x.turma,sig:x.sig,sala:x.sala})});
    r.nl.forEach(x=>{const u=ult[d];const gid=u&&u.sig===x.sig&&u.fim>=g.ini-30?u.g:uid();ult[d]={sig:x.sig,fim:g.fim,g:gid};if(!nl.some(y=>y.dia===d&&y.ini===g.ini&&y.sig===x.sig))nl.push({dia:d,ini:g.ini,fim:g.fim,sig:x.sig,nome:normSig(x.nome)===normSig(x.sig)?nomeNL(x.sig):x.nome,sala:x.sala,g:gid})});
    if(!r.nl.length)ult[d]=null}));
  if(!aulas.length&&!nl.length)throw new Error('Não encontrei aulas no horário (TeacherSchedule).');
  aulas.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);nl.sort((a,b)=>a.dia-b.dia||a.ini-b.ini);
  return {ficheiro,docente:docente||'',grupo:'',escola:'',ano:ano||'',preview:preview||'',linhas,aulas,naoLetivos:nl,obs:[],obsMap:{},paginas:1,origemTS:true}}
const tsAno=txt=>{const m=String(txt||'').match(/(\d{1,2})\s+de\s+([A-Za-zçÇ]+)\s+de\s+(\d{4})/);if(!m)return '';const M=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'].indexOf(normT(m[2]));if(M<0)return '';const y=+m[3];return M>=8?y+'/'+(y+1):(y-1)+'/'+y};
async function lerTeacherScheduleXlsx(file){const z=await unzip(await file.arrayBuffer());const wb=xmlDoc(await z.text('xl/workbook.xml')||'<x/>');const rels=await relsDe(z,'xl/workbook.xml');
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));
  for(const sh of tagsNS(wb,'sheet')){const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');const rel=rels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;
    const doc=xmlDoc(sx);const C=new Map();
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');const m=ref&&ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const t=c.getAttribute('t');let v='';
      if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];v=ve?ve.textContent:'';if(t==='s')v=sst[+v]||''}if(String(v).trim()!=='')C.set((+m[2]-1)+','+colNum(m[1]),String(v))});
    const g=(r,c)=>(C.get(r+','+c)||'').trim();const cel=[...C.keys()].map(k=>k.split(',').map(Number));
    const porL={};cel.forEach(([r,c])=>{const k=normT(g(r,c));if(TS_DN[k])(porL[r]=porL[r]||[]).push({c,d:TS_DN[k]})});const hr=Object.keys(porL).map(Number).find(r=>porL[r].length>=3);if(hr==null)continue;
    const dias=porL[hr].sort((a,b)=>a.c-b.c);const maxC=Math.max(...cel.map(x=>x[1]));dias.forEach((d,i)=>{d.c2=i<dias.length-1?dias[i+1].c-1:maxC;d.dc=d.c;d.sc=null;for(let c=d.c;c<=d.c2;c++){const v=normT(g(hr+1,c));if(v==='disciplina')d.dc=c;if(v==='sala')d.sc=c}});
    const reT=/(\d{1,2}[:hH]\d{2})\s*[\n\r\-–—a]+\s*(\d{1,2}[:hH]\d{2})/;const tc={};cel.forEach(([r,c])=>{if(r>hr&&reT.test(g(r,c)))tc[c]=(tc[c]||0)+1});const tcol=+Object.keys(tc).sort((a,b)=>tc[b]-tc[a])[0];if(isNaN(tcol))continue;
    const nCls=cel.filter(([r,c])=>r>hr&&/\d{1,2}\s*º\s*[A-Z]/.test(g(r,c))).length;const temProf=cel.some(([r,c])=>r>hr&&/professor/i.test(g(r,c)));if(temProf&&nCls<2)continue;
    const G=[];const vis=new Set();const maxR=Math.max(...cel.map(x=>x[0]));
    for(let r=hr+2;r<=maxR;r++){const m=g(r,tcol).match(reT);if(!m)continue;const ini=hm(m[1]),fim=hm(m[2]);if(vis.has(ini))continue;vis.add(ini);const L={ini,fim,dias:{}};
      dias.forEach(d=>{const t=g(r,d.dc),s=d.sc!=null?g(r,d.sc):'';if(t)L.dias[d.d]={t,s}});G.push(L)}
    if(!G.length)continue;let doc_='';for(let r=hr-1;r>=0&&!doc_;r--){const v=cel.filter(([rr])=>rr===r).map(([rr,c])=>g(rr,c)).find(x=>x&&!/\d/.test(x)&&x.length>4);if(v)doc_=v}
    return tsMontar(G.sort((a,b)=>a.ini-b.ini),file.name,doc_,'')}
  return null}
async function lerTeacherSchedulePdf(file){const lib=await getPdfLib();const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;const page=await doc.getPage(1);const tc=await page.getTextContent();
  const it=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>{const t=i.transform;const h=Math.hypot(t[2],t[3])||8;return {s:i.str.replace(/\s+/g,' ').trim(),x:t[4],y:t[5],w:i.width||0,h,cx:t[4]+(i.width||0)/2}});
  const dh=it.filter(i=>TS_DN[normT(i.s)]);if(dh.length<3)throw new Error('Não encontrei os dias da semana no PDF.');const hy=Math.min(...dh.map(i=>i.y))-1;
  const sub=it.filter(i=>i.y<hy&&/^(disciplina|sala)$/i.test(i.s)).sort((a,b)=>a.cx-b.cx);if(sub.length<4)throw new Error('Não encontrei as colunas Disciplina/Sala.');const sy=Math.min(...sub.map(i=>i.y));
  const dias=dh.sort((a,b)=>a.cx-b.cx).map(i=>TS_DN[normT(i.s)]);const cols=[];let k=0;dias.forEach(d=>{const a=sub[k],b=sub[k+1];if(a&&/disciplina/i.test(a.s)){cols.push({d,tipo:'t',cx:a.cx});if(b&&/sala/i.test(b.s)){cols.push({d,tipo:'s',cx:b.cx});k+=2}else k+=1}});
  const x0=Math.min(...cols.map(c=>c.cx))-40;const T_=it.filter(i=>i.y<sy&&/^\d{1,2}:\d{2}$/.test(i.s)&&i.cx<x0+30).sort((a,b)=>b.y-a.y);const sl=[];
  for(let i=0;i<T_.length-1;i++){const a=T_[i],b=T_[i+1];if(a.y-b.y<a.h*1.8&&hm(b.s)>hm(a.s)){sl.push({ini:hm(a.s),fim:hm(b.s),cy:(a.y+b.y)/2});i++}}
  if(sl.length<2)throw new Error('Não encontrei os tempos (horas) no PDF.');const dy=sl.length>1?sl[0].cy-sl[1].cy:30;
  const G=sl.map(s=>({ini:s.ini,fim:s.fim,dias:{},_t:{}}));const tset=new Set(T_);
  it.filter(i=>i.y<sy-1&&!tset.has(i)&&i.cx>x0&&i.y>sl[sl.length-1].cy-dy*.75).forEach(i=>{let si=0,bd=1e9;sl.forEach((s,j)=>{const d=Math.abs(s.cy-i.y);if(d<bd){bd=d;si=j}});let ci=0,bc=1e9;cols.forEach((c,j)=>{const d=Math.abs(c.cx-i.cx);if(d<bc){bc=d;ci=j}});
    const c=cols[ci];const L=G[si];(L._t[c.d+c.tipo]=L._t[c.d+c.tipo]||[]).push(i)});
  const junta=A_=>{A_.sort((a,b)=>b.y-a.y||a.x-b.x);const out=[];A_.forEach(i=>{const u=out[out.length-1];if(u&&Math.abs(u.y-i.y)<2)u.s+=' '+i.s;else out.push({y:i.y,s:i.s})});return out.map(o=>o.s).join('\n')};
  G.forEach(L=>{dias.forEach(d=>{const t=L._t[d+'t'],s=L._t[d+'s'];if(t&&t.length)L.dias[d]={t:junta(t),s:s?junta(s):''}});delete L._t});
  const top=it.filter(i=>i.y>Math.max(...dh.map(z=>z.y))+2).sort((a,b)=>b.y-a.y);const docente=(top.find(i=>!/\d/.test(i.s)&&i.s.length>4)||{}).s||'';
  let preview='';try{const vp=page.getViewport({scale:1.25});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;preview=cv.toDataURL('image/jpeg',.7)}catch(_){}
  return tsMontar(G,file.name,docente,tsAno(it.map(i=>i.s).join(' ')),preview)}
{const _lhp=lerHorarioProfPdf;lerHorarioProfPdf=async function(file){const nm=(file&&file.name||'').toLowerCase();
  if(/\.xlsx$/.test(nm)){const r=await lerTeacherScheduleXlsx(file);if(r)return r;throw new Error('Não encontrei a grelha do horário do professor neste Excel (TeacherSchedule).')}
  try{return await _lhp.apply(this,arguments)}catch(e){try{return await lerTeacherSchedulePdf(file)}catch(e2){throw e}}}}

/* ===================== v0.921 · As Minhas Tarefas ao estilo do Microsoft To Do ===================== */
try{Object.assign(ICONS,{sun:ICONS.sun||'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',home2:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',steps:'<circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/><path d="M10 6h10M10 12h10M10 18h10"/>'})}catch(_){}
const TD_LISTAS_FIX=[['dia','O Meu Dia','sun','#2564cf'],['imp','Importante','star','#c2185b'],['plan','Planeado','calendar','#107c41'],['reun','Das Reuniões','meet','#8a5a00'],['todas','Tarefas','home2','#2564cf'],['avisos','Avisos Urgentes','bell','#c0392b']];
const TD_CORES=['#2564cf','#107c41','#c2185b','#8764b8','#ca5010','#038387','#5b6b7f','#b4009e'];
const TD_REP=[['','Não repetir'],['d','Diariamente'],['u','Dias úteis'],['s','Semanalmente'],['m','Mensalmente'],['a','Anualmente']];
const tdListas=()=>S.todoListas=S.todoListas||[];
const tdHoje=()=>isoData(new Date());
const tdImp=x=>x.prio==='alta';
const tdNoDia=x=>x.dia===tdHoje();
const tdAtr=x=>!x.feito&&x.prazo&&x.prazo<tdHoje();
function tdProx(iso,r){const d=dataDeIso(iso||tdHoje());if(r==='d')d.setDate(d.getDate()+1);else if(r==='u'){do{d.setDate(d.getDate()+1)}while(d.getDay()===0||d.getDay()===6)}else if(r==='s')d.setDate(d.getDate()+7);else if(r==='m')d.setMonth(d.getMonth()+1);else if(r==='a')d.setFullYear(d.getFullYear()+1);return isoData(d)}
function tdConcluir(x,on){x.feito=on;x.feitaEm=on?Date.now():null;if(on&&x.rep&&!x._repFeito){x._repFeito=1;const n=JSON.parse(JSON.stringify(x));Object.assign(n,{id:uid(),feito:false,feitaEm:null,criada:Date.now(),_repFeito:0,prazo:tdProx(x.prazo,x.rep),dia:'',lemb:x.lemb?tdProx(x.lemb.slice(0,10),x.rep)+x.lemb.slice(10):'',lembFeito:false,passos:(x.passos||[]).map(p=>({...p,f:false}))});tarefas().push(n);toast('Tarefa repetida: próxima a '+fmtIsoL(n.prazo),'ok')}
  if(on){try{audit('Tarefas','Tarefa concluída',x.t)}catch(_){}}}
function tdFiltro(k){const L=tarefas();if(k==='dia')return L.filter(tdNoDia);if(k==='imp')return L.filter(tdImp);if(k==='plan')return L.filter(x=>x.prazo);if(k==='todas')return L.filter(x=>!x.lista);const l=tdListas().find(z=>z.id===k);return l?L.filter(x=>x.lista===k):L}
function tdOrdena(L){const o=UI.tdOrd||'';const f=(x,y)=>o==='imp'?(tdImp(y)-tdImp(x))||(x.criada-y.criada):o==='data'?((x.prazo||'9').localeCompare(y.prazo||'9')):o==='alfa'?x.t.localeCompare(y.t,'pt'):o==='cri'?(y.criada-x.criada):((x.ord??x.criada)-(y.ord??y.criada));return L.slice().sort(f)}
function tdNomeLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[1];const l=tdListas().find(z=>z.id===k);return l?l.nome:'Tarefas'}
function tdCorLista(k){const f=TD_LISTAS_FIX.find(z=>z[0]===k);if(f)return f[3];const l=tdListas().find(z=>z.id===k);return l&&l.cor||'#2564cf'}
function tdReun(){const a=A();if(!a)return [];return reunioes(a).flatMap(r=>(r.decisoes||[]).map((d,i)=>({d,r,i})))}
function tdContar(k){if(k==='reun')return tdReun().filter(o=>!o.d.ok).length;if(k==='avisos'){try{return avisosM().length}catch(_){return 0}}return tdFiltro(k).filter(x=>!x.feito).length}
function vTarefasTD(){const sel=UI.tdL||'dia';const hj=tdHoje();const sch=UI.tdQ||'';const det=UI.tdSel&&tarefas().find(x=>x.id===UI.tdSel);
  barBtns([{id:'b-tdnl',t:ic('plus',15)+' Nova Lista',f:()=>tdListaDlg()},{id:'b-tdlimp',t:ic('trash',15)+' Limpar Concluídas',f:()=>{const L=tdFiltro(sel).filter(x=>x.feito);if(!L.length)return toast('Não há tarefas concluídas nesta lista');if(!confirm('Apagar '+L.length+' tarefa(s) concluída(s) desta lista?'))return;const ids=new Set(L.map(x=>x.id));S.todo=tarefas().filter(x=>!ids.has(x.id));save();vTarefasTD()}}]);
  const nav=k=>{const f=TD_LISTAS_FIX.find(z=>z[0]===k);const l=f?{id:k,nome:f[1],ic:f[2],cor:f[3]}:{...tdListas().find(z=>z.id===k),ic:'list'};const n=tdContar(k);
    return `<button type="button" class="xtn ${sel===k?'on':''}" data-tdl="${esc(k)}" style="--lc:${esc(l.cor||'#2564cf')}">${ic(l.ic,18)}<span>${esc(l.nome)}</span>${n?`<i>${n}</i>`:''}</button>`};
  const titulo=tdNomeLista(sel),cor=tdCorLista(sel);
  let corpo='';
  if(sel==='reun'){const R=tdReun().sort((x,y)=>(x.d.ok-y.d.ok)||(x.d.prazo||'9').localeCompare(y.d.prazo||'9'));
    corpo=R.length?`<div class="xtlist">${R.map(({d,r,i})=>`<div class="xtr ${d.ok?'ok':''}"><button type="button" class="xtck ${d.ok?'on':''}" data-rdk="${r.id}|${i}" aria-label="${d.ok?'Reabrir':'Concluir'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(d.t)}</b><small>${ic('meet',11)} ${esc(reunTitulo(r,A()))}${d.resp?' · '+esc(d.resp):''}${d.prazo?` · <span class="${!d.ok&&d.prazo<hj?'atr':''}">${esc(fmtIsoL(d.prazo))}</span>`:''}</small></div><button type="button" class="btn sm" data-ro="${r.id}">Reunião</button></div>`).join('')}</div>`:`<div class="xtvz">${ic('meet',40)}<b>Sem decisões das reuniões</b><span>As deliberações com responsável e prazo aparecem aqui.</span></div>`}
  else if(sel==='avisos'){corpo=cartaoAvisos()}
  else{let L=tdFiltro(sel);if(sch)L=tarefas().filter(x=>normT(x.t+' '+(x.nota||'')+' '+(x.passos||[]).map(p=>p.t).join(' ')).includes(normT(sch)));const P=tdOrdena(L.filter(x=>!x.feito)),F=L.filter(x=>x.feito).sort((a,b)=>(b.feitaEm||0)-(a.feitaEm||0));
    const TT=(A()||{turmas:[]}).turmas;
    const row=x=>{const np=(x.passos||[]).length,nf=(x.passos||[]).filter(p=>p.f).length;const sub=[];if(sel!=='todas'&&!tdListas().some(l=>l.id===sel)&&(x.lista||sel==='dia'||sel==='imp'||sel==='plan'))sub.push(esc(tdNomeLista(x.lista||'todas')));if(tdNoDia(x)&&sel!=='dia')sub.push(ic('sun',11)+' O Meu Dia');if(np)sub.push(`${nf} de ${np}`);
      if(x.prazo)sub.push(`<span class="${tdAtr(x)?'atr':x.prazo===hj?'hj':''}">${ic('calendar',11)} ${x.prazo===hj?'Hoje':esc(fmtIsoL(x.prazo))}</span>`);if(x.lemb)sub.push(ic('bell',11));if(x.rep)sub.push(ic('repeat',11));if(x.nota)sub.push(ic('note',11)+' Nota');
      if(x.turma){const t=TT.find(z=>z.id===x.turma);if(t)sub.push(esc(t.nome+' · '+t.disciplina))}
      return `<div class="xtr ${x.feito?'ok':''} ${det&&det.id===x.id?'sel':''}" data-tdx="${x.id}" draggable="${!x.feito&&!UI.tdOrd}"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="${x.feito?'Marcar como não concluída':'Marcar como concluída'}">${ic('check',12)}</button><div class="xtrt"><b>${esc(x.t)}</b>${sub.length?`<small>${sub.join('<i class="dot">•</i>')}</small>`:''}</div><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="${tdImp(x)?'Remover de Importante':'Marcar como importante'}">${ic('star',17)}</button></div>`};
    const sug=sel==='dia'?tarefas().filter(x=>!x.feito&&!tdNoDia(x)&&x.prazo&&x.prazo<=hj):[];
    corpo=`${sch?'':`<div class="xtadd"><span class="xtaddi">${ic('plus',18)}</span><input id="td-new" placeholder="Adicionar uma tarefa" autocomplete="off"><span class="xtaddo"><input type="date" id="td-newd" title="Data de conclusão" aria-label="Data de conclusão"><button type="button" class="btn sm ico" id="td-newimp" aria-pressed="false" title="Importante">${ic('star',15)}</button><button type="button" class="btn sm pri" id="td-newok">Adicionar</button></span></div>`}
      ${sug.length?`<details class="xtsug"><summary>${ic('sparkle',14)} Sugestões para hoje (${sug.length})</summary>${sug.map(x=>`<div class="xtr"><div class="xtrt"><b>${esc(x.t)}</b><small class="${tdAtr(x)?'atr':''}">${esc(fmtIsoL(x.prazo))}</small></div><button type="button" class="btn sm" data-xtsug="${x.id}">${ic('plus',13)} O Meu Dia</button></div>`).join('')}</details>`:''}
      <div class="xtlist" id="td-l">${P.map(row).join('')}</div>
      ${!P.length&&!F.length?`<div class="xtvz">${ic(sel==='dia'?'sun':sel==='imp'?'star':sel==='plan'?'calendar':'checks',42)}<b>${sel==='dia'?'Concentre-se no seu dia':sel==='imp'?'Tarefas importantes aparecem aqui':sel==='plan'?'Tarefas com data aparecem aqui':'Nada por fazer'}</b><span>${sel==='dia'?'Junte tarefas ao O Meu Dia — recomeça vazio todos os dias.':'Escreva acima e carregue em Enter.'}</span></div>`:''}
      ${F.length?`<details class="xtfeitas" ${UI.tdF?'open':''}><summary>Concluídas <i>${F.length}</i></summary><div class="xtlist">${F.map(row).join('')}</div></details>`:''}`}
  const hdrDia=sel==='dia'?`<small>${esc(new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'}))}</small>`:'';
  $('#view').innerHTML=`<div class="card xtw ${det?'comdet':''}" style="--lc:${esc(cor)}">
    <aside class="xtside"><div class="xtq">${ic('search',15)}<input type="search" id="td-q" placeholder="Procurar" value="${esc(sch)}"></div>${TD_LISTAS_FIX.map(z=>nav(z[0])).join('')}<hr>${tdListas().map(l=>nav(l.id)).join('')}<button type="button" class="xtn nova" id="td-nl">${ic('plus',18)}<span>Nova lista</span></button></aside>
    <section class="xtmain"><header class="xth"><div><h2>${sch?'A procurar «'+esc(sch)+'»':esc(titulo)}</h2>${hdrDia}</div><span class="sp1"></span>
      ${sel!=='reun'&&sel!=='avisos'?`<select id="td-ord" aria-label="Ordenar"><option value="">Ordem manual</option>${[['imp','Importância'],['data','Data de conclusão'],['alfa','Alfabeticamente'],['cri','Data de criação']].map(([k,l])=>`<option value="${k}" ${UI.tdOrd===k?'selected':''}>${l}</option>`).join('')}</select>`:''}
      ${tdListas().some(l=>l.id===sel)?`<button type="button" class="btn sm" id="td-led">${ic('pencil',13)} Lista</button>`:''}</header>${corpo}</section>
    ${det?tdDetalhe(det):''}</div>`;
  tdBind(sel)}
function tdDetalhe(x){const TT=(A()||{turmas:[]}).turmas;const P=x.passos||[];
  return `<aside class="xtdet" aria-label="Detalhes da tarefa"><div class="xtdh"><button type="button" class="xtck ${x.feito?'on':''}" data-tdk="${x.id}" aria-label="Concluir">${ic('check',12)}</button><textarea id="tdd-t" rows="2" aria-label="Título">${esc(x.t)}</textarea><button type="button" class="xtst ${tdImp(x)?'on':''}" data-tds="${x.id}" aria-label="Importante">${ic('star',18)}</button></div>
    <div class="xtps">${P.map((p,k)=>`<div class="xtp ${p.f?'ok':''}"><button type="button" class="xtck sm ${p.f?'on':''}" data-tdpk="${k}" aria-label="Concluir passo">${ic('check',10)}</button><input value="${esc(p.t)}" data-tdpt="${k}" aria-label="Passo ${k+1}"><button type="button" class="xtpx" data-xtpx="${k}" aria-label="Apagar passo">×</button></div>`).join('')}
      <div class="xtp nv">${ic('plus',14)}<input id="tdd-np" placeholder="${P.length?'Passo seguinte':'Adicionar passo'}"></div></div>
    <button type="button" class="xtdb ${tdNoDia(x)?'on':''}" id="tdd-dia">${ic('sun',16)} ${tdNoDia(x)?'Adicionado ao O Meu Dia':'Adicionar ao O Meu Dia'}</button>
    <div class="xtdg"><label class="xtdb">${ic('bell',16)}<span>Lembrar-me</span><input type="datetime-local" id="tdd-lb" value="${esc(x.lemb||'')}"></label>
      <label class="xtdb">${ic('calendar',16)}<span>Data de conclusão</span><input type="date" id="tdd-pz" value="${esc(x.prazo||'')}"></label>
      <label class="xtdb">${ic('repeat',16)}<span>Repetir</span><select id="tdd-rp">${TD_REP.map(([k,l])=>`<option value="${k}" ${(x.rep||'')===k?'selected':''}>${l}</option>`).join('')}</select></label></div>
    <div class="xtdg"><label class="xtdb">${ic('list',16)}<span>Lista</span><select id="tdd-ls"><option value="">Tarefas</option>${tdListas().map(l=>`<option value="${l.id}" ${x.lista===l.id?'selected':''}>${esc(l.nome)}</option>`).join('')}</select></label>
      <label class="xtdb">${ic('school',16)}<span>Turma</span><select id="tdd-tu"><option value="">Sem turma</option>${TT.map(t=>`<option value="${t.id}" ${x.turma===t.id?'selected':''}>${esc(t.nome+' · '+t.disciplina)}</option>`).join('')}</select></label></div>
    <textarea id="tdd-n" class="xtdn" placeholder="Adicionar nota" rows="5">${esc(x.nota||'')}</textarea>
    <footer class="xtdf"><button type="button" class="btn sm ico" id="tdd-x" aria-label="Fechar detalhes" title="Fechar">${ic('chev',14)}</button><span>Criada ${esc(new Date(x.criada||Date.now()).toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'long'}))}${x.orig&&x.orig.tipo==='contactoEE'?' · contacto com o EE':''}</span><button type="button" class="btn sm ico dng" id="tdd-del" aria-label="Apagar tarefa" title="Apagar">${ic('trash',14)}</button></footer></aside>`}
function tdBind(sel){const re=()=>vTarefasTD();const T_=id=>tarefas().find(z=>z.id===id);
  $$('[data-tdl]').forEach(b=>b.onclick=()=>{UI.tdL=b.dataset.tdl;UI.tdQ='';UI.tdSel=null;re()});
  const q=$('#td-q');if(q)q.oninput=()=>{UI.tdQ=q.value;const p=q.selectionStart;re();const n=$('#td-q');n.focus();n.setSelectionRange(p,p)};
  const nl=$('#td-nl');if(nl)nl.onclick=()=>tdListaDlg();const le=$('#td-led');if(le)le.onclick=()=>tdListaDlg(tdListas().find(l=>l.id===sel));
  const od=$('#td-ord');if(od)od.onchange=()=>{UI.tdOrd=od.value;re()};
  const ni=$('#td-new');if(ni){let imp=false;const ib=$('#td-newimp');ib.onclick=()=>{imp=!imp;ib.classList.toggle('on',imp);ib.setAttribute('aria-pressed',imp)};
    const add=()=>{const t=ni.value.trim();if(!t)return ni.focus();const x={id:uid(),t,feito:false,criada:Date.now(),ord:Date.now(),prazo:$('#td-newd').value||(sel==='plan'?tdHoje():''),prio:imp||sel==='imp'?'alta':'normal',dia:sel==='dia'?tdHoje():'',lista:tdListas().some(l=>l.id===sel)?sel:'',passos:[]};
      tarefas().push(x);save();try{audit('Tarefas','Tarefa criada',t)}catch(_){}re();setTimeout(()=>{const n=$('#td-new');n&&n.focus()},30)};
    ni.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};$('#td-newok').onclick=add}
  $$('[data-tdk]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tdk);if(!x)return;tdConcluir(x,!x.feito);save();if(x.feito){b.classList.add('on','pop');try{if(document.documentElement.classList.contains('anim-cheio')||1){const r=b.getBoundingClientRect();if(typeof animConfetes==='function'&&tdFiltro(sel).every(z=>z.feito))animConfetes(r.left,r.top)}}catch(_){}setTimeout(re,280)}else re();try{tarBadge()}catch(_){}});
  $$('[data-tds]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=T_(b.dataset.tds);if(!x)return;x.prio=tdImp(x)?'normal':'alta';save();re()});
  $$('[data-tdx]').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;UI.tdSel=UI.tdSel===r.dataset.tdx?null:r.dataset.tdx;re()});
  $$('[data-xtsug]').forEach(b=>b.onclick=()=>{const x=T_(b.dataset.xtsug);if(x){x.dia=tdHoje();save();re()}});
  $$('[data-rdk]').forEach(c=>c.onclick=()=>{const [rid,i]=c.dataset.rdk.split('|');const r=reunioes(A()).find(z=>z.id===rid);if(r&&r.decisoes[+i]){r.decisoes[+i].ok=!r.decisoes[+i].ok;save();try{audit('Reuniões','Decisão '+(r.decisoes[+i].ok?'concluída':'reaberta'),r.decisoes[+i].t)}catch(_){}re()}});
  $$('[data-ro]').forEach(b=>b.onclick=()=>{try{UI.reun=b.dataset.ro;go('reunioes')}catch(_){}});
  if(sel==='avisos'){try{$('#av-novo').onclick=()=>avisoDlg();$('#av-ver').onclick=()=>mostrarAvisos(true);$$('[data-ave]').forEach(b=>b.onclick=()=>avisoDlg(avisosM().find(z=>z.id===b.dataset.ave)));$$('[data-avx]').forEach(b=>b.onclick=()=>{S.avisos=avisosM().filter(z=>z.id!==b.dataset.avx);save();re()})}catch(_){}}
  const fd=$('.xtfeitas');if(fd)fd.ontoggle=()=>{UI.tdF=fd.open};
  /* arrastar para reordenar (ordem manual) ou largar numa lista */
  let dr=null;$$('#td-l .xtr[draggable=true]').forEach(r=>{r.ondragstart=e=>{dr=r.dataset.tdx;window.__dragInt=true;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','tarefa')}catch(_){}r.classList.add('arr')};r.ondragend=()=>{r.classList.remove('arr');dr=null};
    r.ondragover=e=>{if(!dr)return;e.preventDefault();r.classList.add('alvo')};r.ondragleave=()=>r.classList.remove('alvo');
    r.ondrop=e=>{e.preventDefault();r.classList.remove('alvo');if(!dr||dr===r.dataset.tdx)return;const L=tdOrdena(tdFiltro(sel).filter(x=>!x.feito));const a=L.findIndex(x=>x.id===dr),b=L.findIndex(x=>x.id===r.dataset.tdx);if(a<0||b<0)return;const [m]=L.splice(a,1);L.splice(b,0,m);L.forEach((x,k)=>x.ord=k);save();re()}});
  $$('.xtn[data-tdl]').forEach(n=>{n.ondragover=e=>{if(!dr)return;e.preventDefault();n.classList.add('alvo')};n.ondragleave=()=>n.classList.remove('alvo');n.ondrop=e=>{e.preventDefault();n.classList.remove('alvo');const x=T_(dr);if(!x)return;const k=n.dataset.tdl;
    if(k==='dia')x.dia=tdHoje();else if(k==='imp')x.prio='alta';else if(k==='plan'){if(!x.prazo)x.prazo=tdHoje()}else if(k==='todas')x.lista='';else if(tdListas().some(l=>l.id===k))x.lista=k;save();re();toast('Tarefa movida para '+tdNomeLista(k),'ok')}});
  /* detalhes */
  const x=UI.tdSel&&T_(UI.tdSel);if(!x)return;const sv=()=>{save()};
  const tt=$('#tdd-t');tt.onchange=()=>{x.t=tt.value.trim()||x.t;sv();re()};tt.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();tt.blur()}};
  $('#tdd-dia').onclick=()=>{x.dia=tdNoDia(x)?'':tdHoje();sv();re()};
  $('#tdd-lb').onchange=e=>{x.lemb=e.target.value;x.lembFeito=false;sv();re();if(x.lemb&&'Notification' in window&&Notification.permission==='default')try{Notification.requestPermission()}catch(_){}};
  $('#tdd-pz').onchange=e=>{x.prazo=e.target.value;sv();re()};$('#tdd-rp').onchange=e=>{x.rep=e.target.value;if(x.rep&&!x.prazo)x.prazo=tdHoje();sv();re()};
  $('#tdd-ls').onchange=e=>{x.lista=e.target.value;sv();re()};$('#tdd-tu').onchange=e=>{x.turma=e.target.value||null;sv()};
  const nn=$('#tdd-n');nn.oninput=()=>{x.nota=nn.value;clearTimeout(nn._t);nn._t=setTimeout(sv,400)};nn.onchange=()=>{sv();re()};
  const np=$('#tdd-np');np.onkeydown=e=>{if(e.key==='Enter'&&np.value.trim()){x.passos=x.passos||[];x.passos.push({t:np.value.trim(),f:false});sv();re();setTimeout(()=>{const n=$('#tdd-np');n&&n.focus()},30)}};
  $$('[data-tdpk]').forEach(b=>b.onclick=()=>{const p=x.passos[+b.dataset.tdpk];p.f=!p.f;sv();re()});
  $$('[data-tdpt]').forEach(i=>i.onchange=()=>{const k=+i.dataset.tdpt;if(i.value.trim())x.passos[k].t=i.value.trim();else x.passos.splice(k,1);sv();re()});
  $$('[data-xtpx]').forEach(b=>b.onclick=()=>{x.passos.splice(+b.dataset.xtpx,1);sv();re()});
  $('#tdd-x').onclick=()=>{UI.tdSel=null;re()};$('#tdd-del').onclick=()=>{if(!confirm('Apagar «'+x.t+'»?'))return;S.todo=tarefas().filter(z=>z.id!==x.id);UI.tdSel=null;save();re()}}
function tdListaDlg(l){const nova=!l;openDrawer(nova?'Nova Lista':'Editar Lista',`<div class="ed"><label for="tl-n">Nome</label><input id="tl-n" value="${esc(l&&l.nome||'')}" placeholder="ex.: Direção de Turma, Departamento, Casa…"><label style="margin-top:12px">Cor</label><div class="xtcor">${TD_CORES.map(c=>`<button type="button" data-tlc="${c}" class="${(l&&l.cor||TD_CORES[0])===c?'on':''}" style="background:${c}" aria-label="Cor"></button>`).join('')}</div>
  <div class="row" style="margin-top:16px"><button class="btn pri" id="tl-ok">${ic('check',14)} ${nova?'Criar Lista':'Guardar'}</button>${nova?'':`<span class="sp1"></span><button class="btn dng" id="tl-del">${ic('trash',14)} Apagar Lista</button>`}</div></div>`);
  let cor=l&&l.cor||TD_CORES[0];$$('[data-tlc]').forEach(b=>b.onclick=()=>{cor=b.dataset.tlc;$$('[data-tlc]').forEach(z=>z.classList.toggle('on',z===b))});setTimeout(()=>$('#tl-n').focus(),50);
  $('#tl-ok').onclick=()=>{const n=$('#tl-n').value.trim();if(!n)return toast('Escreva o nome da lista','erro');if(nova){const z={id:'l'+uid(),nome:n,cor};tdListas().push(z);UI.tdL=z.id}else{l.nome=n;l.cor=cor}save();closeDrawer();vTarefasTD()};
  const d=$('#tl-del');if(d)d.onclick=()=>{const n=tarefas().filter(x=>x.lista===l.id).length;if(!confirm('Apagar a lista «'+l.nome+'»'+(n?' e as suas '+n+' tarefa(s)':'')+'?'))return;S.todo=tarefas().filter(x=>x.lista!==l.id);S.todoListas=tdListas().filter(z=>z.id!==l.id);UI.tdL='dia';save();closeDrawer();vTarefasTD()}}
/* lembretes: avisa à hora marcada (toast + notificação do sistema) */
setInterval(()=>{try{if(!S||!S.todo)return;const now=new Date();const iso=isoData(now)+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');let m=false;
  tarefas().forEach(x=>{if(x.lemb&&!x.lembFeito&&!x.feito&&x.lemb<=iso){x.lembFeito=true;m=true;toast('Lembrete: '+x.t,'ok');try{if('Notification' in window&&Notification.permission==='granted'){if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(r=>r.showNotification('EduSpruce · Lembrete',{body:x.t,tag:'td-'+x.id,data:{v:'tarefas'}})).catch(()=>new Notification('EduSpruce · Lembrete',{body:x.t}));else new Notification('EduSpruce · Lembrete',{body:x.t})}}catch(_){}}});if(m)save()}catch(_){}},30000);
vTarefas=vTarefasTD;if(go._f)go._f.tarefas=vTarefasTD;

