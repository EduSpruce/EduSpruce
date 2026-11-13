/* =====================================================================
   DEFINIÇÕES
   ===================================================================== */
let defFiltro='';
function vDefGeral(){
  const c=S.cfg,a=A();
  const grupos=Object.entries(CICLOS).map(([k,n])=>({k,n,l:DISCIPLINAS.filter(d=>d.c.includes(k))}));
  $('#view').innerHTML=`
  <div class="card ed"><h2>Escola e professor</h2>
    <div class="g2"><div><label>Escola <a href="#" id="go-esc" class="lnk">Logotipo e dados da escola ›</a></label><input data-c="escola" value="${esc(c.escola)}" placeholder="Escola Básica e Secundária…"></div>
      <div><label>Ano letivo</label><div class="anotxt">${ic('calendar',16)} <b>${esc((A()||{}).nome||'—')}</b> <span class="mut">· escolhido no início de sessão</span></div></div></div>
    <div class="g2"><div><label>Nome do professor</label><input data-c="professor" value="${esc(c.professor)}"></div><div><label>E-mail institucional <span class="mut">(${esc(nomeEscola(EC()))})</span></label><div class="anotxt">${esc(emailProf()||'—')} <a href="#" class="lnk" data-gopf="1">Editar no separador Professor ›</a></div></div></div></div>
  <div class="card ed"><div class="row"><h2 style="margin:0">${ic('book',18)} Disciplinas que Leciono</h2><span class="sp1"></span><button class="btn sm" data-godisc="1">${ic('school',14)} Escolher em Ano Letivo e Turmas ›</button></div><p class="hint" style="margin:6px 0 0">As disciplinas são escolhidas <b>por ano letivo</b> (um professor pode lecionar disciplinas diferentes de ano para ano). </p>${A()?`<div class="discchips"><span class="mut">Em ${esc(A().nome)}:</span>${minhasDisc().length?minhasDisc().map(d=>`<span class="discchip">${discIc(d)}<b>${esc(d)}</b></span>`).join(''):'<span class="mut">nenhuma escolhida</span>'}</div>`:''}<p class="hint" style="margin:6px 0 0">${A()&&ufcdAno().length?`<br><b>Unidades que leciono (${ufcdAno().length}):</b> `+ufcdAno().map(u=>esc((/^uc/i.test(u.tipo||'')?'UC ':'UFCD ')+u.cod+' '+u.nome)).join(' · ')+'.':''}</p></div>
  <div class="card ed tpcard"><div class="row"><h2 style="margin:0">Tipos de instrumento</h2><span class="sp1"></span><button type="button" class="btn sm" id="tp-rep">${ic('refresh',13)} Repor Predefinidos</button></div><p class="hint" style="margin:6px 0 10px">Os tipos aparecem ao criar instrumentos e na marcação de testes. Arraste para ordenar; os tipos em uso não podem ser removidos.</p><div id="tpEd"></div><textarea id="tp" hidden>${esc(c.tipos.join('\n'))}</textarea></div>
  <div class="card"><div class="row"><h2 style="margin:0">Tipos de Tempo Não Letivo</h2><span class="sp1"></span><button class="btn" id="d-tnl">${ic('sliders',15)} Gerir Tipos</button></div><div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">${nlTipos().map(x=>`<span class="nlb" style="--nc:${x.cor}" title="${esc(x.n)}">${esc(x.sig)}</span>`).join('')}</div></div>
  <div class="card ed"><h2>Textos da síntese descritiva</h2><p class="hint">{dom} = domínio, {oa} = o/a, {aluno} = aluno/aluna, {nome} = primeiro nome, {turma}, {disciplina}, {periodo} (ex.: 1.º período), {mencao}.</p>
    ${Object.keys(SINTESE_DEF).map(k=>`<label>${esc(k)}</label><textarea data-s="${esc(k)}" style="min-height:60px;margin-bottom:8px">${esc(c.sinteses[k]||'')}</textarea>`).join('')}</div>
  `;
  $$('[data-c]').forEach(el=>el.oninput=()=>{c[el.dataset.c]=el.value;save()});
  if($('#c-ano'))$('#c-ano').onchange=e=>{if(e.target.value==='__novo'){const n=prompt('Ano letivo',sugAno());if(n&&/^\d{4}\/\d{4}$/.test(n.trim())&&!S.anos.some(x=>x.nome===n.trim()))novoAno(n.trim());else if(n)alert('Formato 2026/2027, e que ainda não exista.')}else{S.anoAtivo=e.target.value;const x=A();S.turmaAtiva=x&&x.turmas[0]?x.turmas[0].id:null;save()}go('definicoes')};
  $('#tp').onchange=e=>{c.tipos=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);save();toast('Tipos guardados')};
  $$('[data-s]').forEach(el=>el.oninput=()=>{c.sinteses[el.dataset.s]=el.value;save()});
  $('#d-tnl').onclick=()=>gerirTiposNL(()=>{closeDrawer();go('definicoes')});
  const ge=$('#go-esc');if(ge)ge.onclick=e=>{e.preventDefault();go('escola')};
}

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
    <a class="ajman ajman2" href="${MANUAL_URL}" target="_blank" rel="noopener" download><img class="ajcapa" src="${MANUAL_URL.replace('EduSpruce-Manual.pdf','capa.jpg')}" alt="Capa do Manual de Instruções" loading="lazy" onerror="this.remove()"><span class="ajtx"><b>Manual de Instruções Completo</b><small>PDF · 50 páginas com imagens · telemóvel, tablet e computador</small><small>Da primeira entrada à resolução de problemas.</small><span class="btn pri">${ic('download',16)} Descarregar</span></span></a>
    <input id="aj-q" type="search" placeholder="Pesquisar na ajuda (ex.: faltas, MSAI, calendário)…" value="${esc(UI.ajQ||'')}">
    <div class="ajidx">${AJUDA.map(s=>`<a href="#aj-${s.id}" class="chip" data-aj="${s.id}">${ic(s.ic,14)} ${esc(s.t)}</a>`).join('')}</div></div>
  ${L.length?L.map(s=>`<div class="card ajs" id="aj-${s.id}"><h2>${ic(s.ic,20)} ${esc(s.t)}</h2><div class="ajg ${s.gif&&gifsAjuda()[s.gif]?'':'sem'}"><div class="ajt">${s.txt}</div>${s.gif&&gifsAjuda()[s.gif]?`<figure class="ajf"><img src="${gifsAjuda()[s.gif]}" alt="Animação: ${esc(s.t)}" loading="lazy"><figcaption>${esc(s.t)} — animação</figcaption></figure>`:''}</div></div>`).join('')
    :'<div class="card empty">Sem resultados para essa pesquisa.</div>'}`;
  const qi=$('#aj-q');qi.oninput=()=>{UI.ajQ=qi.value;const p=qi.selectionStart;vAjuda();const n=$('#aj-q');n.focus();n.setSelectionRange(p,p)};
  $$('[data-aj]').forEach(a=>a.onclick=e=>{e.preventDefault();const el=$('#aj-'+a.dataset.aj);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})});
}


/* =====================================================================
   ARRANQUE
   ===================================================================== */
window.addEventListener('afterprint',()=>document.body.classList.remove('print-landscape'));
window.addEventListener('beforeunload',saveNow);
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
window.EduGest={state:()=>S,integ:()=>verificarIntegridade(false),ocorrenciasTurma,datasImportantes,lerHorarioProfPdf,ui:()=>UI,go:v=>go(v),aulasPrevistas,CAL,lerCalendarioPdf,eventosCalendario,parseLinhas,lerXlsx,lerFicheiro,calc:{pctsPer,pctsFinal,ponderada,fmtNota}};
if(S.anos.length&&!A())S.anoAtivo=S.anos[0].id;
function fotosUsadas(){const o={};S.anos.forEach(an=>an.turmas.forEach(t=>t.alunos.forEach(a=>{if(a.foto&&a.foto.startsWith('f:')){const k=a.foto.slice(2);if(FOTOS[k])o[k]=FOTOS[k]}})));return o}
$$('[data-ico]').forEach(el=>el.outerHTML=ic(el.dataset.ico,18));
{let dt;new MutationObserver(()=>{clearTimeout(dt);dt=setTimeout(()=>decorar(),0)}).observe(document.body,{childList:true,subtree:true})}
/* =====================================================================
   v0.23 — 100 MELHORIAS: preferências, navegação, toque, acessibilidade,
   dados/segurança, ferramentas
   ===================================================================== */
const ACENTOS={azul:['#2563eb','#60a5fa'],verde:['#1a7f4b','#4cd38a'],roxo:['#6d3fd1','#b28cff'],laranja:['#c25e00','#ffab5a'],rosa:['#c2185b','#ff7eb3'],petroleo:['#0e7c86','#4fd1db'],grafite:['#3c4656','#a9b6c8']};
/* paleta para daltonismo (Okabe-Ito) aplicada aos tipos de dia */
const DALT={letivo:'#9ad0f5',inicio:'#e69f00',inicio2:'#009e73',termo:'#f0e442',interrupcao:'#0072b2',feriadoN:'#cc79a7',feriadoR:'#d55e00',feriadoM:'#882255'};
const TIPOS_DIA_ORIG=JSON.parse(JSON.stringify(TIPOS_DIA));
const NAV_OPC=[['meuhorario','O Meu Horário'],['calendario','Calendário Escolar'],['horario','Horário (turma)'],['testes','Marcação de Testes'],['criterios','Critérios'],['instrumentos','Instrumentos'],['dominios','Domínios'],['avaliacao','Avaliação Final'],['relatorios','Relatórios'],['escola','Escola']];
const ESTILO_DEF='sge';
function aplicarPrefs(){
  try{const d={tema:'light',estilo:'sge',acento:'azul',logoApp:'auto',animPerfil:'cheio'};Object.keys(d).forEach(k=>{if(S.cfg[k]===undefined||S.cfg[k]===null||S.cfg[k]==='')S.cfg[k]=d[k]})}catch(_){}
  const c=S.cfg,r=document.documentElement,b=document.body;
  aplicarTema();
  const ac=ACENTOS[c.acento||'azul']||ACENTOS.azul;r.style.setProperty('--accL',ac[0]);r.style.setProperty('--accD',ac[1]);
  b.classList.toggle('compacto',c.densidade==='compacto');b.classList.toggle('estilo-azul',(c.estilo||ESTILO_DEF)==='azul');
  b.classList.toggle('hc',!!c.altoContraste);
  b.classList.toggle('dalt',!!c.daltonico);
  b.classList.toggle('letra-sis',c.letra==='sistema');
  r.style.setProperty('--zoom',c.letra&&c.letra!=='sistema'?String(+c.letra/100):'1');
  Object.keys(TIPOS_DIA_ORIG).forEach(k=>{TIPOS_DIA[k].cor=c.daltonico&&DALT[k]?DALT[k]:TIPOS_DIA_ORIG[k].cor;TIPOS_DIA[k].n=TIPOS_DIA_ORIG[k].n});
  $$('#side .nav').forEach(n=>n.style.display=(c.navOculto||[]).includes(n.dataset.v)?'none':'');
}
/* ---------- avisos (toast) com ícone, lidos pelo leitor de ecrã ---------- */
function toast(m,tipo){const t=$('#toast');if(!t)return;tipo=tipo||(/erro|não foi|inválid/i.test(m)?'erro':/atenção|aviso|sem aula|sobrepõe/i.test(m)?'aviso':'ok');
  t.className='';t.innerHTML=`<span class="ti">${ic(tipo==='erro'?'alert':tipo==='aviso'?'info':'check',15)}</span><span>${esc(m)}</span>`;void t.offsetWidth;t.className='on t-'+tipo;
  const dur=tipo==='erro'?5000:3000;t.dataset.ate=Date.now()+dur;clearTimeout(window.__toastT);window.__toastT=setTimeout(()=>t.classList.remove('on'),dur)}
setInterval(()=>{const t=document.getElementById('toast');if(t&&t.classList.contains('on')&&Date.now()>(+t.dataset.ate||0)+400)t.classList.remove('on')},1000);document.addEventListener('pointerdown',e=>{const t=document.getElementById('toast');if(t&&t.classList.contains('on')&&Date.now()>(+t.dataset.ate||0))t.classList.remove('on')},true);
/* ---------- indicador de ocupado (importações) ---------- */
function ocupado(msg){let o=$('#ocup');if(!o){o=document.createElement('div');o.id='ocup';o.setAttribute('role','status');document.body.appendChild(o)}o.innerHTML=`<div class="ocb"><span class="spin"></span><b>${esc(msg||'A trabalhar…')}</b><div class="skl"><i></i><i></i><i></i></div></div>`;o.classList.add('on')}
function livre(){const o=$('#ocup');if(o)o.classList.remove('on')}
/* ---------- migalhas (Ano › Turma › Secção) ---------- */
function migalhas(v){const el=$('#crumb');if(!el)return;const a=A(),t=T();const parts=[];
  if(a)parts.push(`<a href="#" data-cr="turmas">${esc(a.nome)}</a>`);if(t&&NEEDS_T.includes(v))parts.push(`<a href="#" data-cr="alunos">${esc(t.nome)} · ${esc(t.disciplina)}</a>`);parts.push(`<span>${esc(TITLES[v]||'')}</span>`);
  el.innerHTML=parts.join('<i>›</i>');el.querySelectorAll('[data-cr]').forEach(x=>x.onclick=e=>{e.preventDefault();go(x.dataset.cr)})}
/* ---------- cabeçalho de impressão uniforme ---------- */
function cabecalhoImpressao(v){let h=$('#printHdr');if(!h){h=document.createElement('div');h.id='printHdr';$('#main').prepend(h)}const a=A(),t=T(),c={...S.cfg,...escolaDe(t)};
  h.innerHTML=`${c.logo?`<img src="${c.logo}" alt="">`:''}<div><b>${esc(c.escola||'EduSpruce')}</b><span>${esc(TITLES[v]||'')}${t&&NEEDS_T.includes(v)?' — '+esc(t.nome+' · '+t.disciplina):''}${a?' · Ano letivo '+esc(a.nome):''}</span></div><span class="pd">${esc(profNome(c.professor))}<br>${new Date().toLocaleDateString('pt-PT')}</span>`}
/* ---------- dicas por toque longo / passar o rato (substituem title) ---------- */
(function(){let tm=null,bx=null,src=null;
  const mostra=(el,x,y)=>{const tx=el.getAttribute('data-tip')||el.getAttribute('title');if(!tx)return;if(el.hasAttribute('title')){el.setAttribute('data-tip',tx);el.removeAttribute('title')}
    bx=bx||Object.assign(document.createElement('div'),{id:'tipbox'});bx.setAttribute('role','tooltip');bx.textContent=tx;document.body.appendChild(bx);
    const w=Math.min(320,innerWidth-24);bx.style.maxWidth=w+'px';const r=el.getBoundingClientRect();let L=Math.max(12,Math.min(innerWidth-w-12,(x!=null?x:r.left+r.width/2)-w/2));
    bx.style.left=L+'px';bx.style.top=Math.max(8,r.top-8)+'px';bx.classList.add('on');requestAnimationFrame(()=>{const h=bx.offsetHeight;bx.style.top=(r.top-h-10<8?r.bottom+10:r.top-h-10)+'px'})};
  const esconde=()=>{clearTimeout(tm);if(bx)bx.classList.remove('on')};
  document.addEventListener('pointerdown',e=>{esconde();if(e.pointerType==='mouse')return;const el=e.target.closest('[title],[data-tip]');if(!el)return;src=el;tm=setTimeout(()=>{mostra(el,e.clientX,e.clientY);el._tipShown=true},520)},true);
  document.addEventListener('pointerup',()=>clearTimeout(tm),true);document.addEventListener('pointercancel',esconde,true);document.addEventListener('scroll',esconde,true);
  document.addEventListener('click',e=>{if(src&&src._tipShown){src._tipShown=false;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[title],[data-tip]');if(!el){esconde();return}clearTimeout(tm);tm=setTimeout(()=>mostra(el),450)});
})();
/* ---------- menu de contexto (toque longo / botão direito) ---------- */
function menuContexto(x,y,itens){fecharMenu();const m=document.createElement('div');m.id='cmenu';m.setAttribute('role','menu');
  m.innerHTML=itens.map((it,k)=>it==='-'?'<hr>':`<button role="menuitem" data-k="${k}" class="${it.dng?'dng':''}">${ic(it.ic||'check',16)} ${esc(it.t)}</button>`).join('');document.body.appendChild(m);
  const w=m.offsetWidth,h=m.offsetHeight;m.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+'px';m.style.top=Math.max(8,Math.min(innerHeight-h-8,y))+'px';m.classList.add('on');
  m.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{fecharMenu();itens[+b.dataset.k].f()});const f=m.querySelector('button');if(f)f.focus();
  setTimeout(()=>document.addEventListener('pointerdown',fora,{once:true}),0);function fora(e){if(!m.contains(e.target))fecharMenu();else document.addEventListener('pointerdown',fora,{once:true})}}
function fecharMenu(){const m=$('#cmenu');if(m)m.remove()}
function longoToque(el,cb){let tm=null,x0,y0;el.addEventListener('contextmenu',e=>{e.preventDefault();cb(e.clientX,e.clientY)});
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;x0=e.clientX;y0=e.clientY;tm=setTimeout(()=>{el._lp=true;vibrar();cb(x0,y0)},560)});
  el.addEventListener('pointermove',e=>{if(tm&&Math.hypot(e.clientX-x0,e.clientY-y0)>10){clearTimeout(tm);tm=null}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,()=>clearTimeout(tm)));
  el.addEventListener('click',e=>{if(el._lp){el._lp=false;e.stopImmediatePropagation();e.preventDefault()}},true)}
const vibrar=()=>{try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
/* ---------- deslizar para apagar ---------- */
function deslizarApagar(el,onDel){let x0=null,y0,dx=0;el.classList.add('swp');
  el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0},{passive:true});
  el.addEventListener('touchmove',e=>{if(x0==null)return;dx=e.touches[0].clientX-x0;if(Math.abs(e.touches[0].clientY-y0)>Math.abs(dx)){x0=null;el.style.transform='';return}if(dx<0)el.style.transform=`translateX(${Math.max(dx,-110)}px)`},{passive:true});
  el.addEventListener('touchend',()=>{if(x0==null)return;x0=null;if(dx<-80){el.style.transform='translateX(-110px)';el.classList.add('swiped');vibrar();
      let b=el.querySelector('.swdel');if(!b){b=document.createElement('button');b.className='swdel';b.type='button';b.innerHTML=ic('trash',18)+'<span>Apagar</span>';el.appendChild(b);b.onclick=e=>{e.stopPropagation();onDel()}}
      setTimeout(()=>document.addEventListener('touchstart',function f(e){if(!el.contains(e.target)){el.style.transform='';el.classList.remove('swiped');document.removeEventListener('touchstart',f)}},{passive:true}),0)}
    else el.style.transform=''})}
/* ---------- deslizar no topo para mudar de turma ---------- */
(function(){let x0=null,y0;document.addEventListener('touchstart',e=>{if(!e.target.closest('#bar')||e.target.closest('select,button,input'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)<70||Math.abs(dy)>50||!NEEDS_T.includes(VIEW))return;
    const L=turmasFiltradas(A());const i=L.findIndex(t=>t.id===S.turmaAtiva);if(i<0||L.length<2)return;const n=L[(i+(dx<0?1:-1)+L.length)%L.length];S.turmaAtiva=n.id;save();vibrar();go(VIEW);toast(n.nome+' · '+n.disciplina,'ok')},{passive:true})})();
/* ---------- paleta de comandos / pesquisa global (⌘K) ---------- */
function paleta(){const a=A();const itens=[];
  Object.entries(TITLES).forEach(([k,t])=>{if(!NEEDS_T.includes(k)||T())itens.push({t,s:'Secção',ic:'list',f:()=>go(k)})});
  (a?a.turmas:[]).forEach(t=>{itens.push({t:t.nome+' · '+t.disciplina,s:'Turma',ic:'users',f:()=>{S.turmaAtiva=t.id;save();go('alunos')}});
    t.alunos.forEach(al=>itens.push({t:al.nome,s:'Aluno · '+t.nome+' · '+t.disciplina+' · n.º '+al.num,ic:'user',f:()=>{S.turmaAtiva=t.id;save();go('alunos');setTimeout(()=>fichaAluno(al.id),60)}}));
    t.instrumentos.forEach(i=>itens.push({t:i.nome,s:'Instrumento · '+t.nome+(i.data?' · '+fmtIso(i.data):''),ic:'clipboard',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;UI.instTab='notas';save();go('instrumentos')}}))});
  AJUDA.forEach(h=>itens.push({t:'Ajuda: '+h.t,s:'Ajuda',ic:'help',f:()=>{UI.ajQ='';go('ajuda');setTimeout(()=>{const e=$('#aj-'+h.id);if(e)e.scrollIntoView()},80)}}));
  [['Anular última alteração','refresh',desfazer],['Tema escuro','moon',()=>{S.cfg.tema='dark';save();aplicarTema()}],['Tema claro','sun',()=>{S.cfg.tema='light';save();aplicarTema()}],['Modo de apresentação','image',alternarApresentacao],['Exportar cópia de segurança','download',()=>{UI.defTab='dados';go('definicoes')}],['Diagnóstico de dados','search',()=>{UI.defTab='ferr';go('definicoes')}]].forEach(([t,i,f])=>itens.push({t,s:'Ação',ic:i,f}));
  openDrawer('Pesquisar',`<div class="ed"><input id="pq" type="search" placeholder="Aluno, turma, instrumento, secção ou ajuda…" autocomplete="off"><div id="pqr" class="pqr" role="listbox"></div><p class="hint">Atalhos: ⌘K / Ctrl+K pesquisar · ⌘Z anular · ? ajuda desta secção · Esc fechar</p></div>`);
  const q=$('#pq'),r=$('#pqr');let sel=0,L=[];
  const desenha=()=>{const n=normT(q.value);L=itens.filter(x=>!n||normT(x.t+' '+x.s).includes(n)).slice(0,40);sel=Math.min(sel,Math.max(0,L.length-1));
    r.innerHTML=L.map((x,k)=>`<button type="button" role="option" class="pqi ${k===sel?'on':''}" data-k="${k}">${ic(x.ic,16)}<span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span></button>`).join('')||'<p class="mut">Sem resultados.</p>';
    r.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closeDrawer();L[+b.dataset.k].f()})};
  q.oninput=()=>{sel=0;desenha()};q.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(L.length-1,sel+1);desenha();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);desenha();e.preventDefault()}else if(e.key==='Enter'&&L[sel]){closeDrawer();L[sel].f()}};
  desenha();setTimeout(()=>q.focus(),60)}
/* ---------- atalhos de teclado ---------- */
document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase();const emCampo=['input','textarea','select'].includes(tag)||e.target.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();paleta();return}
  if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'&&!emCampo){e.preventDefault();desfazer();return}
  if(e.key==='?'&&!emCampo){e.preventDefault();ajudaContexto();return}
  if(e.key==='Escape')fecharMenu();
  if(e.key==='Tab'&&$('#drawer').classList.contains('on')){const f=[...$('#drawer').querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent);if(!f.length)return;const i=f.indexOf(document.activeElement);
    if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
/* ---------- ajuda contextual ---------- */
const AJ_VIEW={inicio:'inicio',reunioes:'reunioes',turmas:'turmas',alunos:'turmas',meuhorario:'naoletivos',horario:'horarios',calendario:'calendario',testes:'testes',criterios:'avaliacao',instrumentos:'avaliacao',dominios:'avaliacao',avaliacao:'avaliacao',relatorios:'avaliacao',escola:'comecar',definicoes:'aparencia',ajuda:'comecar'};
function ajudaContexto(){const id=AJ_VIEW[VIEW]||'comecar';UI.ajQ='';go('ajuda');setTimeout(()=>{const e=$('#aj-'+id);if(e){e.scrollIntoView({behavior:'smooth'});e.classList.add('pisca');setTimeout(()=>e.classList.remove('pisca'),1600)}},80)}
/* ---------- modo de apresentação (projetar sem nomes nem fotos) ---------- */

/* ---------- teclado numérico na grelha de classificações ---------- */
function tecladoNum(){let k=$('#numpad');if(k){k.remove();$$('table.grid input').forEach(i=>i.removeAttribute('inputmode'));$$('table.grid input').forEach(i=>i.setAttribute('inputmode','decimal'));return}
  k=document.createElement('div');k.id='numpad';k.innerHTML=`<div class="nph"><b>${ic('grid',15)} Teclado</b><button type="button" data-np="x" aria-label="Fechar">${ic('x',16)}</button></div><div class="npg">${['7','8','9','4','5','6','1','2','3',',','0','⌫'].map(x=>`<button type="button" data-np="${x}">${x}</button>`).join('')}<button type="button" data-np="limpar" class="w">Limpar</button><button type="button" data-np="↓" class="w pri">Seguinte ↓</button></div>`;
  document.body.appendChild(k);$$('table.grid input').forEach(i=>i.setAttribute('inputmode','none'));let alvo=document.activeElement&&document.activeElement.closest('table.grid')?document.activeElement:$('table.grid input');if(alvo)alvo.focus();
  document.addEventListener('focusin',function f(e){if(!$('#numpad')){document.removeEventListener('focusin',f);return}if(e.target.closest&&e.target.closest('table.grid'))alvo=e.target});
  k.querySelectorAll('[data-np]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();const v=b.dataset.np;if(v==='x'){tecladoNum();return}if(!alvo)return;
    if(v==='⌫')alvo.value=alvo.value.slice(0,-1);else if(v==='limpar')alvo.value='';else if(v==='↓'){alvo.dispatchEvent(new Event('change',{bubbles:true}));alvo.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return}else alvo.value+=v;
    alvo.dispatchEvent(new Event('input',{bubbles:true}));vibrar()}))}
/* ---------- largar ficheiros em qualquer ecrã ---------- */
(function(){let n=0;const ov=()=>{let o=$('#dropov');if(!o){o=document.createElement('div');o.id='dropov';o.innerHTML=`<div>${ic('upload',40)}<b>Largue o ficheiro para importar</b><span>Excel de alunos ou de horário · PDF do calendário ou do seu horário · cópia de segurança (.json)</span></div>`;document.body.appendChild(o)}return o};
  document.addEventListener('dragenter',e=>{if(![...(e.dataTransfer||{}).types||[]].includes('Files'))return;n++;ov().classList.add('on')});
  document.addEventListener('dragleave',()=>{n=Math.max(0,n-1);if(!n)ov().classList.remove('on')});
  document.addEventListener('dragover',e=>{if([...(e.dataTransfer||{}).types||[]].includes('Files'))e.preventDefault()});
  document.addEventListener('drop',async e=>{if(e.target.closest&&e.target.closest('#t-drop,.logo-zona'))return;n=0;ov().classList.remove('on');const f=e.dataTransfer&&e.dataTransfer.files[0];if(!f)return;e.preventDefault();importarQualquer(f)})})();
async function importarQualquer(f){const nm=f.name.toLowerCase();
  try{if(nm.endsWith('.json')){UI.defTab='dados';go('definicoes');setTimeout(()=>importarCopia(f),50);return}
    if(!A())novoAno(anoAuto());
    if(nm.endsWith('.pdf')){ocupado('A ler '+f.name+'…');try{const r=await lerHorarioProfPdf(f);livre();go('meuhorario');importarHorProfDlg(r);regista('Horário do professor (PDF)',f.name,r.aulas.length+' tempos letivos, '+r.naoLetivos.length+' não letivos');return}catch(_){}
      try{const c=await lerCalendarioPdf(f);livre();go('calendario');importarCalendarioDlg(c);return}catch(err){livre();throw new Error('O PDF não parece ser um calendário escolar nem um horário do professor. '+err.message)}}
    if(/\.xlsx$/.test(nm)){try{const rT=await lerTeacherScheduleXlsx(f);if(rT){go('meuhorario');importarHorProfDlg(rT);return}}catch(_){}}
    if(/\.xlsx?$/.test(nm)){ocupado('A ler '+f.name+'…');let hs=[];try{hs=await lerHorarioXlsx(f)}catch(_){}
      if(hs.length&&hs[0].aulas&&hs[0].aulas.length){livre();go('turmas');hs.forEach(h=>h.ficheiro=f.name);importarHorariosDlg(hs);return}
      const r=await lerFicheiro(f);livre();if(r&&!r.falhou){go('turmas');novaTurmaDlg(r)};return}
    toast('Formato não reconhecido: '+f.name+' (use .xlsx, .pdf ou .json)','erro')}
  catch(err){livre();alert('Não foi possível importar '+f.name+'.\n\n'+err.message+'\n\nSugestão: '+sugestaoErro(err.message))}}
function sugestaoErro(m){m=m||'';return /legenda/i.test(m)?'confirme que é o PDF do calendário com a legenda de cores (não uma digitalização).':/grelha|cabeçalho/i.test(m)?'use o PDF “Horário do professor” exportado pelo programa da escola (com Tempos/Segunda/Sala).':/xls\b|antigo/i.test(m)?'abra no Excel e guarde como .xlsx.':/ano letivo/i.test(m)?'confirme que o ficheiro tem o ano letivo (ex.: 2026/2027) escrito.':/zip|válido/i.test(m)?'o ficheiro pode estar corrompido ou não ser um .xlsx; volte a exportá-lo.':'tente exportar de novo o ficheiro do programa da escola; se persistir, use Ajuda › Perguntas Frequentes.'}
/* ---------- registo de importações ---------- */
function regista(tipo,ficheiro,resumo){S.registo=S.registo||[];S.registo.unshift({quando:new Date().toISOString(),tipo,ficheiro:ficheiro||'',resumo:resumo||''});S.registo=S.registo.slice(0,80);save()}
/* ---------- caixote do lixo (30 dias) ---------- */
function paraLixo(tipo,obj,ctx){S.lixo=S.lixo||[];S.lixo.unshift({id:uid(),tipo,obj:JSON.parse(JSON.stringify(obj)),ctx:ctx||{},quando:Date.now()});const lim=Date.now()-30*864e5;S.lixo=S.lixo.filter(x=>x.quando>lim).slice(0,60)}
function restaurarLixo(id){const x=(S.lixo||[]).find(l=>l.id===id);if(!x)return;
  if(x.tipo==='ano'){if(S.anos.some(a=>a.id===x.obj.id))x.obj.id=uid();{let n=x.obj.nome,k=2;while(S.anos.some(a=>a.nome===x.obj.nome)){x.obj.nome=n+' (restaurado'+(k>2?' '+(k-1):'')+')';k++}}S.anos.push(x.obj);S.anos.sort((p,q)=>q.nome.localeCompare(p.nome))}
  else{const a=S.anos.find(a=>a.id===x.ctx.ano)||A();if(!a)return toast('O ano letivo já não existe','erro');
    if(x.tipo==='turma')a.turmas.push(x.obj);else if(x.tipo==='instrumento'){const t=a.turmas.find(t=>t.id===x.ctx.turma);if(!t)return toast('A turma já não existe','erro');t.instrumentos.push(x.obj)}else if(x.tipo==='reuniao')reunioes(a).push(x.obj)}
  S.lixo=S.lixo.filter(l=>l!==x);saveNow();toast('Restaurado','ok');go(VIEW)}
/* ---------- PIN de acesso (não encripta os dados) ---------- */
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function pedirPin(){return new Promise(ok=>{const o=document.createElement('div');o.id='pinlock';o.innerHTML=`<div class="pinb">${S.cfg.logo?`<img src="${S.cfg.logo}" alt="">`:`<span class="logo">${ic('grad',26)}</span>`}<b>EduSpruce</b><span class="mut">Introduza o código</span><div class="pind"><i></i><i></i><i></i><i></i></div><div class="npg">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(x=>`<button type="button" ${x?'':'disabled'} data-p="${x}">${x}</button>`).join('')}</div><span class="pine"></span></div>`;document.body.appendChild(o);
  let v='';const dots=()=>o.querySelectorAll('.pind i').forEach((d,k)=>d.classList.toggle('on',k<v.length));
  const tecla=async x=>{if(x==='⌫')v=v.slice(0,-1);else if(v.length<4)v+=x;dots();if(v.length===4){if(segBloq('pin')){segMostrar(o,'.pine',null,'pin');v='';dots();return}const pOk=senhaForte(S.cfg.pinHash)?await verificarSenha(S.cfg.pinHash,v):(await pinOk(v));if(pOk&&!senhaForte(S.cfg.pinHash)){try{S.cfg.pinHash=await hashSenha(v);saveNow()}catch(_){}}if(pOk){segOk('pin');o.remove();document.removeEventListener('keydown',kb);ok()}else if(segFalha('pin').bloq){audit('Segurança','Código de acesso bloqueado '+SEG_MIN+' min','');segMostrar(o,'.pine',null,'pin');v='';dots()}else{o.querySelector('.pine').textContent='Código errado';o.querySelector('.pind').classList.add('erro');vibrar();setTimeout(()=>{v='';dots();o.querySelector('.pind').classList.remove('erro')},500)}}};
  o.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>b.dataset.p&&tecla(b.dataset.p));const kb=e=>{if(/^\d$/.test(e.key))tecla(e.key);else if(e.key==='Backspace')tecla('⌫')};document.addEventListener('keydown',kb)})}
/* ---------- cópia encriptada (AES-GCM, palavra-passe) ---------- */
async function chaveDe(pw,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function encriptar(txt,pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await chaveDe(pw,salt);const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(txt));return JSON.stringify({app:'EduGest',encriptado:true,salt:b64(salt),iv:b64(iv),dados:b64(ct)})}
async function desencriptar(o,pw){const k=await chaveDe(pw,unb64(o.salt));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv)},k,unb64(o.dados));return new TextDecoder().decode(pt)}
/* ---------- cópias de segurança ---------- */
function dadosCopia(soAno){const st0=soAno?{...S,anos:S.anos.filter(a=>a.id===S.anoAtivo)}:S;const rest=!window.__ES_SB&&typeof acessoRestrito==='function'&&acessoRestrito();const st=rest?acessoCopiaFiltrada(st0):st0;if(rest)soAno=true;const fotos={};const usados=new Set();st.anos.forEach(a=>a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.foto&&x.foto.startsWith('f:'))usados.add(x.foto.slice(2))})));usados.forEach(k=>{if(FOTOS[k])fotos[k]=FOTOS[k]});if(!soAno)Object.keys(FOTOS).filter(k=>k.startsWith('doc:')).forEach(k=>{fotos[k]=FOTOS[k]});
  return JSON.stringify({app:'EduGest',versao:6,data:new Date().toISOString(),parcial:!!soAno,estado:st,fotos,...(rest?{soMinhasTurmas:acessoUser()}:{})})}
