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

