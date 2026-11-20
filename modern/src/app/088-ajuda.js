/* =====================================================================
   AJUDA
   ===================================================================== */
/*GIFS*/let _gifs=null;const gifsAjuda=()=>{if(!_gifs){try{_gifs=JSON.parse(document.getElementById('gifs-json').textContent)}catch(e){_gifs={}}}return _gifs};
/* =====================================================================
   AJUDA — guia aprofundado com animações (GIF) e pesquisa
   ===================================================================== */
const AJUDA=[
 {id:'comecar',ic:'sparkle',t:'Começar',gif:null,txt:`
  <p>O EduSpruce organiza-se em <b>Escola → Ano letivo → Turmas</b>. Faça uma vez a configuração inicial:</p>
  <ol><li><b>Escola</b> (Configuração › Escola): nome, agrupamento, morada e o <b>logotipo</b> (toque na imagem ou arraste-a). Aparece no Início e nos relatórios.</li>
  <li><b>Definições</b>: o seu nome (é o que permite à app reconhecer as <i>suas</i> aulas nos horários), grupo e as <b>disciplinas que leciona</b>. Cada disciplina é escolhida <b>por ciclo</b>: Inglês do 3.º ciclo e Inglês do secundário são disciplinas diferentes.</li>
  <li><b>Ano Letivo e Turmas</b>: crie o ano letivo (3 períodos ou 2 semestres) e as turmas.</li>
  <li><b>Calendário Escolar</b>: importe o PDF do calendário — a partir daí a app sabe os períodos, as interrupções e os feriados.</li>
  <li><b>O Meu Horário</b>: importe o PDF do seu horário — aulas e tempos não letivos ficam logo prontos.</li></ol>
  <p class="hint">O Início mostra uma lista de “Primeiros passos” até tudo estar configurado.</p>`},
 {id:'turmas',ic:'users',t:'Turmas e Alunos',gif:'alunos',txt:`
  <p><b>Importar alunos (Excel com fotografias):</b> no programa da escola siga <b>${CAMINHO_EXCEL.replace(/>/g,'›')}</b> e guarde o ficheiro <b>.xlsx</b>. Em <b>Ano Letivo e Turmas › Turma a Partir do Excel</b> escolha o ficheiro: a app lê o n.º, o processo, o nome, a foto, a turma e o ano letivo, e mostra uma pré-visualização para confirmar.</p>
  <ul><li><b>Frequenta</b>: desmarque quem não tem a sua disciplina — só os assinalados entram na avaliação e nos relatórios.</li>
  <li><b>Editar turma</b> (botão Editar ou “Editar Turma” em Alunos): oferta formativa <b>Ensino Regular / PROFIJ</b>, nome e ano de escolaridade. O ícone com o número (10, 11, 12…) identifica o ano.</li>
  <li><b>+ Disciplina</b>: a mesma turma noutra disciplina (copia os alunos).</li>
  <li><b>Juntar turmas</b>: para turmas com aulas juntas numa disciplina (ex.: 10.º A + 10.º B → 10.º A/B). Cada aluno mantém o seu número e a turma de origem.</li>
  <li><b>Ficha do aluno</b>: toque no nome — dados, encarregado de educação, delegado/subdelegado, observações e o separador <b>MSAI</b>.</li>
  <li>Tocar numa turma no Início abre a <b>lista de alunos</b>.</li></ul>`},
 {id:'msai',ic:'access',t:'Medidas de Suporte (MSAI)',gif:null,txt:`
  <p>Na ficha do aluno, separador <b>MSAI</b>, assinale as medidas universais, seletivas e adicionais (DL 54/2018), as adaptações ao processo de avaliação, os recursos e as acomodações curriculares — com observações em cada medida.</p>
  <ul><li><b>Alunos › Quadro MSAI</b> mostra a turma inteira: modo <b>Quadro</b> (alunos × medidas, cabeçalhos legíveis na horizontal) ou <b>Por Aluno</b> (cartões, ideal no iPad na vertical).</li>
  <li>“Só alunos com medidas” e “Só medidas em uso” tornam o quadro compacto. Exporte em CSV ou imprima.</li></ul>`},
 {id:'horarios',ic:'calendar',t:'Horários',gif:'horario',txt:`
  <p><b>O Meu Horário (PDF do professor):</b> em O Meu Horário › <b>Importar o Meu Horário (PDF ou Excel)</b>. A app lê a grelha (tempos × dias, salas, células de dois tempos) e as observações, separa <b>tempos letivos</b> e <b>não letivos</b> e propõe a associação de cada linha (ex.: “10º A · ING”) a uma turma da app. Estas aulas têm prioridade — indicam exatamente quando tem aula com a turma.</p>
  <p><b>Horários das turmas (Excel ClassSchedule):</b> “Importar Horários” (vários ficheiros de uma vez). Em Turma › Horário vê a grelha da turma com as suas aulas destacadas, a próxima aula e o Diretor de Turma.</p>
  <ul><li>A grelha semanal fica alinhada com os restantes cartões e desliza na horizontal em ecrãs pequenos.</li>
  <li><b>Apagar:</b> em Turma › Horário › “Apagar Horário” (horário da turma ou associação ao seu PDF) e em O Meu Horário › “Apagar…” (o seu PDF, tempos não letivos, horários das turmas).</li></ul>`},
 {id:'naoletivos',ic:'layers',t:'Tempos Não Letivos',gif:'naoletivo',txt:`
  <p>Ficam a tracejado na grelha de O Meu Horário, com uma cor por tipo, na lista de Hoje e num quadro próprio com a contagem semanal.</p>
  <ul><li><b>Arrastar:</b> agarre um tempo não letivo na grelha e largue-o noutro dia/hora (os tempos do mesmo bloco movem-se juntos).</li>
  <li><b>Acrescentar:</b> “Tempo Não Letivo” — escolha o tipo, o dia e toque nos tempos.</li>
  <li><b>Tipos:</b> “Tipos” (ou Definições › Tipos de Tempo Não Letivo) para <b>acrescentar, editar (sigla, designação, cor) ou apagar</b> tipos. Mudar a sigla atualiza os tempos já marcados.</li></ul>`},
 {id:'calendario',ic:'calcheck',t:'Calendário Escolar',gif:'calendario',txt:`
  <p><b>Importar PDF:</b> a app lê a legenda de cores e cada dia (letivo, interrupção, feriados, início, termo das aulas por ano de escolaridade) e calcula os períodos e os dias letivos. Pode também <b>criar manualmente</b> com as datas dos períodos.</p>
  <ul><li><b>Tocar num dia</b> abre a ficha do dia: tipo, período, nota e as suas aulas nesse dia; pode mudar o tipo ali mesmo.</li>
  <li><b>Editar Dias:</b> escolha o tipo na faixa de cima e toque ou <b>arraste o dedo</b> por vários dias.</li>
  <li><b>Cores dos critérios harmonizadas</b> com a cor de destaque do estilo (barra lateral): a paleta é gerada a partir dela e acompanha o tema claro/escuro.</li><li><b>Avaliação Intercalar</b> (global ao ano letivo): escolha Nenhuma, Dois ou Três Períodos e as datas “De/Até” — vale para todas as turmas.</li></ul>`},
 {id:'previstas',ic:'clock',t:'Aulas Previstas, Dadas e Faltas',gif:'faltas',txt:`
  <p>Em Calendário Escolar › <b>Aulas Previstas</b> a app cruza o horário de cada turma com o calendário: tempos (ou aulas) previstos por período, dados, por dar e <b>faltas</b>; total e exportação CSV.</p>
  <ul><li><b>Σ</b> (na Marcação de Testes) é a <b>soma dos tempos dados</b> até esse dia — a numeração das lições.</li>
  <li><b>Faltas do professor:</b> toque num dia de aula (Marcação de Testes) › “Registar Falta”, ou no detalhe de uma turma em Aulas Previstas › “Registar Falta”. Indique os tempos e o motivo (doença, formação, serviço oficial, visita de estudo, greve…). A falta não conta como aula dada nem como aula por dar, e o dia fica marcado com <b>F</b>.</li></ul>`},
 {id:'reunioes',ic:'meet',t:'Reuniões',gif:null,txt:`
  <p>Em <b>Geral › Reuniões</b> tem o mapa de todas as reuniões do ano: conselhos de turma, departamento, grupo disciplinar, pedagógico, encarregados de educação, equipas, formações…</p>
  <ol><li><b>Nova Reunião</b>: escolha o tipo (a ordem de trabalhos é sugerida), data, hora, local ou ligação online, turma e participantes. A app avisa logo se a hora <b>coincide com uma aula, um tempo não letivo ou outra reunião</b>.</li>
  <li><b>Lembretes</b>: escolha quando quer ser avisado (15 min, 1 hora, 1 dia, 2 dias, 1 semana antes). Com a app aberta aparece um aviso no topo com som; se ativar as notificações, aparecem também no sistema.</li>
  <li><b>Com a app fechada</b>: use <b>Exportar (.ics)</b> — as reuniões entram no Calendário do iPad/computador com os alarmes escolhidos.</li>
  <li><b>Repetir</b>: semanal, quinzenal ou mensal, até uma data (ex.: reuniões de grupo).</li>
  <li><b>Ficha da reunião</b> (toque numa reunião): lista de preparação (o que levar), ordem de trabalhos, notas, decisões e tarefas com responsável e prazo; marcar como realizada, adiar ou cancelar; <b>descarregar a ata</b> (.doc, com o logotipo da escola) ou copiá-la.</li>
  <li><b>Avisos</b>: sobreposições, preparação em falta na véspera, reuniões que já passaram sem ata e tarefas em atraso. O número ao lado de “Reuniões” na barra lateral indica as reuniões de hoje.</li></ol>
  <p>As reuniões de avaliação marcadas na Marcação de Testes também aparecem no mapa, e as próximas reuniões aparecem no Início.</p>`},
 {id:'testes',ic:'target',t:'Marcação de Testes',gif:'testes',txt:`
  <p>Turma › <b>Marcação de Testes</b>: calendário do ano (ou de um período) só com os dias de semana. Cada dia de aula mostra a hora, os tempos e Σ.</p>
  <ul><li><b>Marcar:</b> toque num dia → escolha Teste, Questão-aula, Ficha, Apresentação Oral (AO), Prova Oral (PO) ou Trabalho → cria o instrumento de avaliação com a data e o período certos.</li>
  <li><b>Mudar a data:</b> arraste a marcação para outro dia.</li>
  <li><b>Painel ao lado:</b> avaliações de cada período com Σ e “+n desde o anterior”, a avaliação intercalar, a <b>reunião de avaliação</b> desta turma e outras datas.</li>
  <li>Os próximos testes de todas as turmas aparecem no <b>Início</b>.</li></ul>`},
 {id:'avaliacao',ic:'grad',t:'Avaliação',gif:'avaliacao',txt:`
  <ol><li><b>Critérios:</b> domínios (ex.: PO, CO, CE, PE) e ponderações, menções e regra do 2.º/3.º período.</li>
  <li><b>Instrumentos:</b> itens (perguntas/critérios) com domínio e cotação; depois as classificações por aluno (linha em branco = não avaliado).</li>
  <li><b>Domínios:</b> % de cada domínio por período.</li>
  <li><b>Avaliação Final:</b> nota por período (0–20 no secundário; % e nível 1–5 no básico), pauta CSV.</li>
  <li><b>Relatórios:</b> relatório individual imprimível com síntese descritiva e logotipo da escola.</li></ol>
  <p class="hint">Regras: % do domínio = pontos ÷ cotação; nota = Σ(% × ponderação); no 2.º/3.º período, média por domínio dos períodos até esse (configurável).</p>`},
 {id:'inicio',ic:'home',t:'Início',gif:null,txt:`
  <ul><li><b>Contagem decrescente</b> para o fim do período (dias letivos, relógio, tempos por dar em cada turma).</li>
  <li><b>Datas Importantes</b>: avaliação intercalar, reuniões, feriados, interrupções, fim de período, termo.</li>
  <li><b>Próximos Testes</b> de todas as turmas, com as aulas que faltam até lá.</li>
  <li>Aulas de hoje e cartões das turmas (tocar abre a lista de alunos).</li></ul>`},
 {id:'aparencia',ic:'sun',t:'Aparência, iPad e Telemóvel',gif:'tema',txt:`
  <ul><li><b>Tema:</b> no fundo da barra lateral (ou Definições › Aparência) escolha <b>Auto</b> (segue o sistema), <b>Claro</b> ou <b>Escuro</b>.</li>
  <li><b>iPad:</b> na vertical a barra lateral mostra só ícones; no telemóvel abre com o botão ☰.</li>
  <li><b>Ecrã principal:</b> no Safari, Partilhar › “Adicionar ao ecrã principal” para abrir como uma app.</li>
  <li>Tudo é tocável com o dedo (alvos de 44 px), e é possível arrastar tempos não letivos, marcações de testes e dias do calendário.</li></ul>`},
 {id:'escolas',ic:'building',t:'Escolas, Tipologias e Módulos',gif:null,txt:`
  <p>Em <b>Configuração › Escolas</b> pode ter <b>mais do que uma escola</b> no mesmo ano letivo (ex.: uma escola secundária e uma escola profissional). Cada escola tem nome, logotipo, dados e <b>tipologia</b>:</p>
  <ul><li><b>Ensino Regular</b> — turmas do ensino básico/secundário (disciplinas, avaliação por períodos ou semestres) e turmas <b>PROFIJ</b>, que também têm <b>UFCD</b>.</li>
  <li><b>Escola Profissional</b> — turmas de <b>cursos profissionais</b> (curso, ano de formação) avaliadas por <b>módulos</b>: horas, classificação 0–20, aprovação a partir de 10, módulos em atraso.</li></ul>
  <p>Ao criar ou editar uma turma escolhe a escola; as ofertas disponíveis mudam conforme a tipologia. Os relatórios, PDF, atas e o cabeçalho usam o logotipo e o nome da escola da turma. Com várias escolas, a barra lateral mostra um filtro por escola.</p>
  <p><b>Módulos / UFCD</b> (barra lateral, nas turmas modulares): crie-os um a um ou cole a lista (<i>código ; designação ; horas</i>), indique início e fim previsto, lance as classificações na grelha (verde aprovado, vermelho não aprovado, amarelo em atraso) ou calcule-as a partir dos instrumentos associados ao módulo (no instrumento, escolha o módulo).</p>`},
 {id:'organizacao',ic:'layers',t:'Períodos ou Semestres',gif:null,txt:`
  <p>A organização do ano letivo (<b>3 períodos</b> ou <b>2 semestres</b>) é <b>global</b>: escolhe-se em Ano Letivo e Turmas ou no Calendário Escolar e aplica-se ao calendário, contagens, aulas previstas, marcação de testes, avaliação intercalar, instrumentos, avaliação final, relatórios e reuniões.</p>
  <p>Se o calendário importado tiver 3 períodos e a escola funcionar por semestres, a app calcula os semestres a partir dele (pode ajustar o último dia do 1.º semestre). Ao mudar, os instrumentos com data passam para o período/semestre dessa data.</p>`},
 {id:'sessao',ic:'user',t:'Sessão e Integridade dos Dados',gif:null,txt:`
  <p>A app pede <b>início de sessão</b>. No primeiro acesso use <b>admin / admin</b> e altere logo a palavra-passe. Em Definições › Conta e Acesso pode criar contas, mudar palavras-passe e terminar a sessão. A entrada com <b>Microsoft 365 (Office)</b> está preparada: quando a escola registar a aplicação (Client ID / Tenant ID) e a app estiver num endereço https, o botão fica ativo.</p>
  <p>Em Definições › Ferramentas, <b>Integridade dos Dados</b> verifica ligações partidas, identificadores repetidos, períodos inexistentes, datas inválidas, ponderações e fotografias, e corrige o que for seguro. A verificação também corre ao abrir a app.</p>`},
 {id:'apresentacao',ic:'access',t:'Modo de Apresentação (projetar)',gif:null,txt:`
  <p>Toque no <b>olho</b> na barra de cima para projetar a app na aula sem expor dados pessoais. Antes de começar escolhe:</p>
  <ul><li><b>Nomes</b>: só o primeiro nome (se houver dois iguais, junta a inicial do apelido), iniciais, só o número ou completos.</li>
  <li><b>Fotografias</b>: mostrar ou desfocar (as imagens da ajuda e o logotipo nunca são ocultados).</li>
  <li><b>Dados sensíveis</b>: processo, nascimento/idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação, contactos e observações ficam desfocados — também nos relatórios, onde o resto (notas, domínios, síntese) continua visível.</li>
  <li><b>Informação do professor</b>: esconde reuniões e lembretes, o seu horário, definições, escola, avisos de cópias, a pesquisa e a troca de turma.</li>
  <li><b>Alunos a ocultar</b>: escolha alunos que não querem que a turma veja os seus dados — o nome passa a “Aluno(a) oculto(a)” e a linha, a ficha e o relatório ficam totalmente desfocados.</li></ul>
  <p>Nada é alterado nos dados; os campos ficam só de leitura. Toque de novo no olho para sair. As escolhas ficam guardadas para a próxima vez.</p>`},
 {id:'dados',ic:'shield',t:'Dados e Cópias de Segurança',gif:null,txt:`
  <p>Os dados ficam <b>só neste dispositivo</b> (no navegador). Em Definições › <b>Cópia de segurança</b> exporte regularmente o ficheiro JSON (inclui fotografias) e guarde-o no iCloud/Drive; para mudar de dispositivo, importe essa cópia.</p>
  <p class="hint">Atenção: o Safari pode apagar dados de sites que não abre há 7 dias — faça cópias com frequência ou use a app a partir do ecrã principal.</p>`},
 {id:'glossario',ic:'book',t:'Glossário',gif:null,txt:`<dl class="glos">
  <dt>Σ</dt><dd>Soma dos tempos letivos dados até um dia (numeração das lições).</dd><dt>AI</dt><dd>Avaliação intercalar (global ao ano letivo).</dd><dt>RA</dt><dd>Reunião de avaliação (conselho de turma) de uma turma.</dd><dt>OD</dt><dd>Teste de outra disciplina marcado para a turma.</dd><dt>F</dt><dd>Falta do professor (não conta como aula dada).</dd>
  <dt>MSAI</dt><dd>Medidas de suporte à aprendizagem e à inclusão (DL 54/2018): universais, seletivas e adicionais.</dd><dt>RTP · PEI · PIT</dt><dd>Relatório técnico‑pedagógico · Programa educativo individual · Plano individual de transição.</dd>
  <dt>DAC</dt><dd>Domínios de autonomia curricular.</dd><dt>DT</dt><dd>Direção de turma / Diretor(a) de turma.</dd><dt>CNL‑E</dt><dd>Componente não letiva de estabelecimento.</dd><dt>PROFIJ</dt><dd>Programa formativo de inserção de jovens (Açores); UFCD = unidade de formação de curta duração.</dd>
  <dt>PO · CO · CE · PE</dt><dd>Produção oral · Compreensão oral · Compreensão escrita · Produção escrita.</dd><dt>Instrumento rápido</dt><dd>Registo de uma % por domínio, sem itens.</dd></dl>`},
 {id:'atalhos',ic:'grid',t:'Atalhos e Gestos',gif:null,txt:`<ul><li><b>⌘K / Ctrl+K</b> — pesquisar alunos, turmas, instrumentos e secções.</li><li><b>⌘Z / Ctrl+Z</b> ou botão ↶ — anular a última alteração.</li><li><b>?</b> — ajuda da secção onde está.</li><li><b>Esc</b> — fechar janelas e menus.</li>
  <li><b>Toque longo</b> numa turma, instrumento ou aluno — menu de ações (mover, duplicar, mudar de período…); em botões e dias — mostra a dica.</li><li><b>Deslizar para a esquerda</b> num instrumento ou tempo não letivo — apagar.</li><li><b>Deslizar no título</b> (secções da turma) — mudar para a turma seguinte/anterior.</li>
  <li><b>Arrastar</b> — tempos não letivos, marcações de testes, dias do calendário (em Editar Dias) e ficheiros para importar.</li><li><b>Grelha de classificações</b> — Enter desce, setas navegam; “Teclado Numérico” para escrever só com o dedo; o Apple Pencil (Rabiscar) também escreve nas células.</li></ul>`},
 {id:'faq',ic:'help',t:'Perguntas Frequentes',gif:null,txt:`
  <p><b>A app não reconhece as minhas aulas no horário da turma.</b> Confirme o seu nome em Definições e a disciplina por ciclo; em Turma › Horário assinale a sigla certa em “Disciplina Nesta Turma”, ou importe o seu horário em PDF.</p>
  <p><b>O 3.º período tem menos dias para a minha turma.</b> O termo das aulas depende do ano de escolaridade (ex.: 9.º, 11.º e 12.º terminam mais cedo) — vem do calendário.</p>
  <p><b>Faltei a uma aula.</b> Registe a falta (Marcação de Testes ou Aulas Previstas): não conta como dada e o Σ seguinte não avança.</p>
  <p><b>Quero apagar um horário importado.</b> Turma › Horário › Apagar Horário, ou O Meu Horário › Apagar….</p>`}
];
function vAjuda(){
  try{ajudaAtualizar()}catch(_){}
  const q=normT(UI.ajQ||'');const L=AJUDA.filter(s=>!q||normT(s.t+' '+s.txt.replace(/<[^>]+>/g,' ')).includes(q));
  $('#view').innerHTML=`
  <div class="card ajh"><div class="ajhd"><h2 style="margin:0">${ic('help',20)} Guia do EduSpruce</h2><p class="mut" style="margin:4px 0 0">Tudo o que a app faz, passo a passo, com animações.</p></div>
    <a class="ajman ajman2" href="${MANUAL_URL}" target="_blank" rel="noopener" download><img class="ajcapa" src="${esc(MANUAL_URL.replace('EduSpruce-Manual.pdf','capa.jpg'))}" alt="Capa do Manual de Instruções" loading="lazy" data-rmerro><span class="ajtx"><b>Manual de Instruções Completo</b><small>PDF · 80 páginas · 182 imagens · app a app, no tema Spruce</small><small>Da primeira entrada à resolução de problemas.</small><span class="btn pri">${ic('bookopen',16)} Ler o manual</span></span></a>
    <input id="aj-q" type="search" placeholder="Pesquisar na ajuda (ex.: faltas, MSAI, calendário)…" value="${esc(UI.ajQ||'')}">
    <div class="ajidx">${AJUDA.map(s=>`<a href="#aj-${s.id}" class="chip" data-aj="${s.id}">${ic(s.ic,14)} ${esc(s.t)}</a>`).join('')}</div></div>
  ${L.length?L.map(s=>`<div class="card ajs" id="aj-${s.id}"><h2>${ic(s.ic,20)} ${esc(s.t)}</h2><div class="ajg ${s.gif&&gifsAjuda()[s.gif]?'':'sem'}"><div class="ajt">${s.txt}</div>${s.gif&&gifsAjuda()[s.gif]?`<figure class="ajf"><img src="${esc(gifsAjuda()[s.gif])}" alt="Animação: ${esc(s.t)}" loading="lazy"><figcaption>${esc(s.t)} — animação</figcaption></figure>`:''}</div></div>`).join('')
    :'<div class="card empty">Sem resultados para essa pesquisa.</div>'}`;
  const qi=$('#aj-q');qi.oninput=()=>{UI.ajQ=qi.value;const p=qi.selectionStart;vAjuda();const n=$('#aj-q');n.focus();n.setSelectionRange(p,p)};
  $$('[data-aj]').forEach(a=>a.onclick=e=>{e.preventDefault();const el=$('#aj-'+a.dataset.aj);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})});
}


