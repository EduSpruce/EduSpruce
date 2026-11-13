# EduFlow (antes EduGest) — especificação e roadmap

**EduFlow** — *A educação organizada. Simplesmente.* · Plataforma Integrada de Gestão Educativa · “Tudo o que precisas para ensinar.” Identidade: azul, branco e cinzento; logótipo em quadrado azul arredondado com dois quadrados ligados.

App de gestão escolar (avaliação) que substitui o "Dossier Digital de Avaliação" em Excel, com o aspeto e o funcionamento da app MRA (HTML único, dados no computador, cópia de segurança em JSON, impressão A4).

## v0.23 (atual) — `index.html` — implementação das 100 melhorias (SUGESTOES.md, parte B)

**Interface (1–20):** densidade compacta/confortável; cor de destaque (7 cores); ícone por disciplina nos cartões; estados vazios ilustrados; indicador de trabalho com esqueleto nas importações; avisos com ícone e animação; barra de ações fixa no fundo no iPad/telemóvel (toque); atalhos ⌘K/⌘Z/?/Esc; secções da barra lateral ocultáveis; migalhas Ano › Turma › Secção; dicas por toque longo (substituem `title`); indicador “Guardado/A guardar…”; tamanho do texto (A−…A++, do sistema); mini‑gráfico de médias nos cartões das turmas; modo de apresentação (oculta nomes e fotos); cabeçalho de impressão uniforme (logotipo, escola, secção, professor, data); alto contraste; cores fixas por período; Anular (histórico de 40 alterações).
**Toque (21–30):** deslizar para apagar (instrumentos, tempos não letivos); menu de contexto por toque longo/botão direito (turmas, instrumentos, alunos); Apple Pencil (Rabiscar) nas células numéricas; teclado numérico próprio na grelha; layout testado de 390 a 1440 px (Split View); mover/copiar alunos entre turmas; mover instrumentos entre períodos; zoom no calendário e na marcação; deslizar no título para mudar de turma; vibração ao largar (onde suportado).
**Desempenho (31–40):** animações da ajuda fora do código e lidas só ao abrir a ajuda; estado também no IndexedDB (prevalece o mais recente); renderização diferida de cartões fora do ecrã; PDF lido num worker; **pdf.js incluído** (funciona sem internet); testes automáticos dos cálculos (Definições › Ferramentas); validação das cópias ao importar; recuperação com a cópia automática diária; espaço usado e pedido de armazenamento persistente; qualidade das fotografias configurável.
**Acessibilidade (41–50):** foco preso e devolvido nas janelas; etiquetas ARIA nas células da grelha; contraste AA dos textos secundários; letras nos dias do calendário (daltonismo/alto contraste); avisos `aria-live`; alvos de 40–46 px em ecrãs de toque; letra do sistema; paleta Okabe‑Ito; texto alternativo nas fotos.
**Dados e segurança (51–60):** lembrete de cópia no Início (> 14 dias) e data da última cópia; cópia só do ano letivo; confirmação dupla para apagar anos letivos e todos os dados; caixote do lixo (30 dias) para anos, turmas e instrumentos; código de acesso (PIN); aviso RGPD; exportar/importar só definições; cópia encriptada (AES‑256); registo de importações.
**Importações (61–70):** PDF do horário com várias páginas; UFCD/módulos PROFIJ associados à turma PROFIJ; criar turmas em falta a partir do horário; alunos novos/saídos ao reimportar; pré‑visualização do PDF lido (calendário e horário); critérios exportáveis/importáveis; largar ficheiros em qualquer ecrã (deteta o tipo); mensagens de erro com sugestão. Não feito: 64 (PDF de listas de alunos — retirado por decisão anterior); 66 parcial (calendários com outra legenda dependem das cores).
**Avaliação (71–80):** instrumento rápido (% por domínio); duplicar instrumento (já existia); alunos sem classificação a amarelo; médias por item (já existia); casas decimais configuráveis; bloquear período; nível atribuído vs. proposto; relatórios em lote (já existia); variáveis {turma} {disciplina} {periodo} {mencao} na síntese; “Corrigir para 100 %”.
**Calendário/testes (81–90):** testes de outras disciplinas (OD); limite semanal configurável com aviso; marcar também nas turmas paralelas; aviso de teste em dia de falta/sem aula; próximo teste e aulas até lá no cartão da turma; hora e local das reuniões; calendário anual numa página A4; termo próprio de cada turma na contagem; tempos não letivos quinzenais (semanas pares/ímpares); aviso de sobreposições.
**Ajuda e qualidade (91–100):** visita guiada (primeira utilização); “?” contextual; GIFs regravados com a nova interface (93 parcial: 8 animações); novidades da versão; dados de demonstração; enviar sugestão/problema (copia diagnóstico); glossário e atalhos na ajuda; diagnóstico de consistência com “Corrigir”; documentação do formato dos dados (FORMATO_DADOS.md). Não feito: 99 (código modular — é a Fase 1).

## v0.22.1

- **Ícones dos domínios** (escolhidos pelo nome): Produção Oral = microfone, Compreensão Oral = auscultadores, Compreensão Escrita = livro, Produção Escrita = caneta; também interação, gramática/léxico, atitudes, educação física, experimental, cálculo, expressões, conhecimentos. Nos separadores de Domínios e na tabela de Critérios.
- **Apagar horário mais à vista** (ícone de calendário com ×): em Ano Letivo e Turmas (coluna Horário de cada turma), no cartão do Horário da turma, na barra do Horário, e em O Meu Horário (cartão da grelha e barra). Na lista de turmas, Editar e Apagar passam a botões só com ícone para caber tudo.

## v0.22

- **Tema claro / escuro / automático**: seletor no fundo da barra lateral e em Definições › Aparência; a escolha manual força o tema independentemente do sistema (todas as regras do modo escuro duplicadas para `data-theme="dark"`).
- **Interface modernizada (tendências 2026/27)**: material translúcido (vidro) só na camada de navegação — barra lateral e barra superior — com conteúdo sólido e legível; fundo com gradiente suave; cantos de 22 px nos cartões; botões, separadores e seletores em cápsula; botão principal com gradiente e sombra; sombras em camadas; tipografia mais forte com números tabulares; elevação suave nos cartões tocáveis; entrada animada discreta das secções; foco visível; respeito por “reduzir movimento” e “reduzir transparência”.
- **Alinhamento**: grelhas de horário (O Meu Horário e Horário da turma) e Marcação de Testes com a mesma largura dos restantes cartões (1200 px), deslocando-se na horizontal quando o ecrã é pequeno.
- **Faltas do professor**: registar/editar/apagar faltas por dia de aula (tempos e motivo: doença, formação, serviço oficial, visita de estudo, greve, assistência à família, conta férias, outro; observações). A falta não conta como aula dada nem por dar; Σ não avança; dia marcado com “F” na Marcação de Testes; coluna “Faltas” e lista no detalhe das Aulas Previstas; contagem do Início e Horário atualizadas.
- **MSAI**: quadro sem texto na vertical — cabeçalhos na horizontal (até 4 linhas), letra maior (15 px) e células maiores; cartões “Por Aluno” com letra maior.
- **Disciplinas por ciclo**: cada disciplina escolhe-se por ciclo (Inglês 1.º/2.º/3.º ciclo/Secundário/PROFIJ são independentes). Migração automática das escolhas antigas (pelos ciclos das turmas existentes). Ao criar turma, a lista mostra “Disciplina — Ciclo” e ajusta o ano de escolaridade.
- **Tipos de tempo não letivo editáveis**: acrescentar, editar (sigla, designação, cor) e apagar; repor predefinidos; mudar a sigla atualiza os tempos já marcados. Acesso em O Meu Horário › Tipos, no diálogo “Gerir tipos” e em Definições.
- **Apagar horários**: Turma › Horário › “Apagar Horário” (horário da turma e/ou associação ao PDF do professor); O Meu Horário › “Apagar…” (PDF do professor, tempos não letivos importados/à mão, horários das turmas).
- **Início**: tocar numa turma abre a lista de alunos.
- **Ajuda aprofundada**: 13 secções (começar, turmas e alunos, MSAI, horários, tempos não letivos, calendário, aulas previstas e faltas, marcação de testes, avaliação, início, aparência/iPad, dados, FAQ), índice, pesquisa e **8 animações GIF** gravadas da própria app (importar alunos, calendário, o meu horário, arrastar tempos não letivos, marcar testes, faltas, classificações, tema).

## v0.21

- **Tudo responsivo** (telemóvel, iPad vertical/horizontal, computador), verificado em 390, 600, 820, 1024, 1180 e 1440 px em todas as secções:
  - Telemóvel (< 700 px): barra lateral passa a menu deslizante (botão ☰, véu para fechar, fecha ao navegar); barra superior em duas linhas (título + seletores de Ano Letivo e Turma lado a lado); botões da barra deslizam na horizontal; KPIs 2 por linha; formulários numa coluna; gaveta em ecrã inteiro.
  - Grelhas (meses, cartões, mosaicos, disciplinas, horários importados…) nunca mais largas que o ecrã (`minmax(min(…,100%),1fr)`).
  - Tabelas largas deslocam-se dentro do próprio cartão (envolvidas automaticamente), nunca a página.
  - Linhas de listas (Hoje, tempos não letivos) quebram linha em vez de sair do cartão.
  - **Marcação de Testes**: painel de avaliação passa para baixo do calendário abaixo de 900 px; dias de semana mais compactos no telemóvel (dia, Σ, hora e tempos, marcações) sem cortes; meses num só coluna em ecrãs muito estreitos.

## v0.20

- **Contagem decrescente para o fim do período no Início**: anel de progresso com os dias letivos por dar, relógio dias/horas/minutos/segundos até ao fim da última aula do último dia do período, % concluída, semanas, próxima interrupção e tempos por dar em cada turma. Em ecrãs largos (área de conteúdo ≥ 1180 px) fica numa coluna ao lado, fixa ao deslocar; no iPad fica logo a seguir ao título da escola (anel à esquerda), e em ecrãs estreitos empilhada.
- **Campos de data e texto legíveis no modo escuro** em toda a app (fundo e texto do tema, calendário nativo escuro, marcadores de posição visíveis) — ex.: painel de avaliação da Marcação de Testes.

## v0.19

- **Avaliação Intercalar global ao ano letivo**: definida em Calendário Escolar (cartão “Avaliação Intercalar”), vale para todas as turmas. Escolha de quantas há: **Nenhuma · Dois Períodos · Três Períodos** (com semestres: Nenhuma · Um Semestre · Dois Semestres); com dois, escolhe-se em que períodos (tocar no período troca). Datas “De” e “Até” por período, limitadas às datas do período.
- Os dias da intercalar ficam sublinhados a roxo no calendário mensal.
- Na Marcação de Testes, o painel de cada turma mostra a intercalar só para leitura (data ou “por definir”, ou “Sem avaliação intercalar”) com ligação “Definir/Alterar” para o Calendário Escolar; a Reunião de Avaliação e as outras datas continuam por turma.
- Datas Importantes do Início só mostram a intercalar dos períodos ativos.

## v0.18.1

- Correção do modo escuro: o texto dos botões de tipo (Marcar Avaliação, Tempo Não Letivo) e de todos os botões sem cor própria passa a usar a cor do tema (estava escuro sobre fundo escuro); botões de tipo maiores (44 px) com etiqueta e nome alinhados; siglas distintas para Apresentação Oral (AO) e Prova Oral (PO); etiquetas de siglas mais legíveis no modo escuro.

## v0.18

- **Marcação de Testes** (Turma › Marcação de Testes): calendário do ano inteiro (ou de um período) só com os dias de semana. Usa o calendário escolar e o horário da turma (ou o seu horário em PDF).
  - Cada dia de aula vem pré-preenchido com a hora de início e os tempos (ex.: “10:20 1t”) e com **Σ = soma dos tempos dados até esse dia** (no ano ou no período, à escolha). Feriados e interrupções ficam marcados. Hoje fica destacado.
  - Tocar num dia → marcar Teste, Questão-aula, Ficha, Apresentação/Prova Oral ou Trabalho: cria o instrumento de avaliação com a data e o período certos (nome automático, conteúdos/observações). Tocar numa marcação → editar, abrir o instrumento ou desmarcar. Arrastar uma marcação para outro dia (com aviso se não houver aula).
  - KPIs: próximo teste, avaliações marcadas por período, tempos dados, aulas/tempos até ao próximo teste.
  - **Painel de avaliação ao lado** (por período): lista de avaliações com Σ e “+n desde o anterior”; datas da **Avaliação Intercalar** (início e fim, para todas as turmas) e da **Reunião de Avaliação** (desta turma); “Outra Data” livre. Estas datas aparecem no calendário (AI, RA).
- **Início**: novo cartão **Datas Importantes** em destaque (mosaicos com dia e mês grandes, cor por tipo, “daqui a n dias”, realce nos próximos 7 dias): avaliação intercalar, reuniões, feriados, interrupções, fim/início de período, termo das aulas. Cartão **Próximos Testes** (6 semanas, todas as turmas): data, turma, hora, aulas que faltam, contagem.
- Ao mudar de secção a página volta ao topo.

## v0.17

- **Ícone do ano de escolaridade**: cada turma mostra um ícone com o número do ano (10, 11, 12…; PE no pré-escolar), com cor por ciclo (1.º verde, 2.º laranja, 3.º roxo, secundário azul, PROFIJ verde-azulado): cartões do Início, lista de turmas, Aulas Previstas, “Hoje” e barra lateral (grupo da turma).
- **Ícones maiores** em toda a app (+20 %; barra lateral 24 px, botões 20 px, títulos 24 px).
- **Arrastar tempos não letivos** na grelha de O Meu Horário (rato ou dedo) para outro dia/hora; os tempos do mesmo bloco (ex.: CNL-E de 2 tempos) movem-se juntos; a célula de destino fica destacada; aviso se sobrepuser outra aula ou tempo; tocar sem arrastar continua a abrir a edição. A grelha mostra todos os tempos do dia (incluindo os vazios) para poder largar em qualquer hora.

## v0.16

- **Importar o Meu Horário (PDF do professor)** em O Meu Horário: lê o “Horário do professor” do programa da escola (grelha Tempos × dias com salas, células de 1 ou 2 tempos, observações). Testado com HorProf_Joel_Cunha.pdf: 20 tempos letivos + 8 não letivos = 28 (Biblioteca 2, DT 1, DT-AP 1, CNL-E 2, CNL-E/s 2), designações tiradas das observações (ex.: CNL-E = Equipa da biblioteca escolar).
  - Associação de cada linha (ex.: “10º A · ING”) a uma turma da app (automática pelo nome da turma e sigla da disciplina; ajustável). As aulas associadas têm prioridade sobre o horário da turma (indicam exatamente quando o professor tem aula: ex.: 10.º A seg 10:20 e qui 15:30; 10.º B seg 11:05 e qui 16:15) e contam para próxima aula, Horário, aulas previstas.
  - Preenche escola, grupo e nome do professor se estiverem vazios.
- **Tempos não letivos**: guardados por ano letivo; aparecem na grelha semanal (tracejados, cor por tipo), na lista “Hoje” e num quadro próprio. Acrescentar/editar/apagar à mão: tipo (DT, DT-AP, CNL-E, CNL-E/s, Biblioteca, Tutoria, Clube, Apoio, Coadjuvação, Reunião ou outro), designação, dia, um ou mais tempos (tocar), sala, observações. Reimportar substitui só os importados.
- O Meu Horário: KPIs de tempos letivos, não letivos e total semanal; aulas de turmas que não acompanha na app aparecem como “Outras turmas”.
- Horário de uma turma sem horário de turma mostra as suas aulas a partir do PDF do professor.

## v0.15

- **Barra superior uniforme**: seletores (Ano Letivo, Turma), botões e dica com a mesma altura (44 px), o mesmo tamanho de letra (15 px), os mesmos cantos e a mesma cor de texto; seta própria nos seletores (igual no iPad e no Mac); rótulos “Ano Letivo”/“Turma” a 14 px. “Editar Turma” com ícone.

## v0.14

- **Página Escola** (Configuração → Escola): logotipo (tocar ou arrastar; PNG/JPG/SVG reduzido a 480 px, guardado nos dados e na cópia de segurança; opção “fundo branco” para o modo escuro) e dados da escola: nome, agrupamento/unidade orgânica, código, morada, código postal e localidade, telefone, endereço eletrónico, sítio na Internet. Pré-visualização do cabeçalho ao editar.
- **Início** abre com o título da escola no topo: logotipo, nome, agrupamento, ano letivo e professor, com botão para editar. Sem escola definida, mostra um atalho “Configurar Escola”.
- **Relatórios individuais** com o logotipo no cabeçalho.
- Definições: ligação “Logotipo e dados da escola ›” junto ao campo Escola.

## v0.13

- **Editar Turma**: botão “Editar” em cada turma (Ano Letivo e Turmas) e “Editar Turma” na barra de Alunos. Permite mudar a **oferta formativa (Ensino Regular / PROFIJ)**, o nome e o ano de escolaridade. Opção para aplicar às outras disciplinas da mesma turma. A lista, os filtros e o agrupamento atualizam-se de imediato.

## v0.12

- **Horários importados**: em vez do total de tempos da turma, cada cartão mostra os tempos semanais da sua disciplina (ex.: “Inglês: 4 tempos semanais”) ou que a disciplina não foi reconhecida; no diálogo de importação a coluna passou a “Tempos da Turma”.
- **Quadro MSAI responsivo**: dois modos, **Quadro** (ecrãs largos) e **Por Aluno** (cartões, por defeito em ecrãs estreitos como o iPad na vertical).
  - Quadro: opção “Só medidas em uso” (ativa por defeito) mostra só as colunas assinaladas; cabeçalhos com o nome completo em duas linhas (sem cortes); grupos com poucas colunas usam o nome curto (Seletivas, Avaliação, Recursos); N.º e Nome fixos ao deslocar na horizontal; cabeçalho fixo ao deslocar na vertical; células de 42 px para toque.
  - Por Aluno: um cartão por aluno com as medidas agrupadas e coloridas por secção, acomodações por extenso e etiquetas RTP/PEI/PIT.

## v0.11

- **Aulas previstas** (Calendário Escolar → separador “Aulas Previstas”): cruza o horário de cada turma com o calendário. Conta os tempos (ou aulas = blocos seguidos) por período, os já dados e os que faltam. Só conta dias letivos, entre o início e o termo das aulas do ano de escolaridade da turma (ex.: 10.º A: 21/09 a 11/06 → 50 + 42 + 34 = 126 tempos). Tem total geral, agrupamento por oferta e exportação em CSV.
  - Detalhe por turma: tempos/aulas previstos, dados e por dar; tempos por dia da semana; dias de aula perdidos por feriados ou interrupções.
  - O Horário da turma mostra o cartão “Aulas Previstas” e o KPI das aulas até ao fim do período.
- **Calendário no iPad**: tocar num dia abre a ficha do dia (tipo, período, nota, as suas aulas nesse dia e se há aula) com mudança rápida do tipo e da nota. Em “Editar Dias” pode tocar ou arrastar o dedo por vários dias. A paleta é uma faixa fixa que desliza na horizontal. As células ocupam a largura disponível e não dependem do “passar o rato”.
- **Maiúsculas iniciais**: tipos de dia, legenda, cabeçalhos da Avaliação Final e dos Domínios (Nota Final, Nível Proposto, Média Anual, Média da Turma, Classificação Final), marcos do calendário.
- **Alinhamentos**: tabela de turmas sem deslocamento horizontal no iPad na vertical (ações empilhadas com a mesma largura); cartões de horários importados com cabeçalho e ícones alinhados; KPIs e cartões de período em grelha 2×2 ou 3 colunas; relatórios A4 com deslocamento contido no iPad na vertical.

## v0.10

- **Calendário Escolar** (novo item em Geral), guardado por ano letivo.
  - **Importar o PDF** do calendário escolar (como o CALENDARIO2627.pdf): lê o ano letivo, a legenda de cores e a grelha dos dias; classifica cada dia (letivo, início, início 3.º ciclo/secundário, termo, interrupção, feriado nacional/regional, sem atividades), as letras C/P (Carnaval, Páscoa), os períodos (1.º P/2.º P/3.º P) e os termos das aulas por ano de escolaridade. Pré-visualização antes de guardar.
  - Testado com o PDF real 2026/2027: 1.º período 14/09–18/12 (67 dias), 2.º 04/01–19/03 (52), 3.º 05/04–18/06 (52); início 3.º ciclo/secundário 21/09; termos 4/6 (9.º, 11.º, 12.º), 11/6 (5.º–8.º, 10.º), 18/6 (pré-escolar e 1.º ciclo); 10 feriados nacionais, 1 regional; interrupções 21–30/12, 8–10/2 (Carnaval), 22/3–2/4 (Páscoa).
  - **Criar manualmente** com as datas dos períodos/semestres (dias úteis letivos, interrupções entre períodos, feriados nacionais incluindo Sexta-feira Santa e Corpo de Deus calculados pela Páscoa).
  - Vista: período atual, dias letivos restantes, próximo marco, total de dias letivos; cartões dos períodos com progresso; meses coloridos com o dia de hoje; lista de interrupções, feriados e termos. **Editar Dias**: escolher o tipo (“pincel”) e tocar nos dias; notas por dia. Imprimível.
- **Ligações ao resto da app**: as próximas aulas saltam dias sem atividades letivas (e respeitam o início e o termo de cada ano de escolaridade); período atual por omissão em novos instrumentos, Avaliação e Relatórios; mudar a data de um instrumento acerta o período; Início com cartão do período (progresso, dias que faltam, próximo marco); Horário com “Aulas até ao fim do período”. Importar o calendário com 3 períodos ou 2 semestres acerta a organização do ano.

## v0.9

- **Horários (Excel ClassSchedule)**: “Importar horários” em Ano Letivo e Turmas (vários ficheiros de uma vez). Lê dias, tempos, disciplina (sigla), sala, turnos (duas disciplinas no mesmo tempo), legenda (sigla → disciplina → professores) e diretor(a) de turma; células unidas tratadas. Guardado por ano letivo e associado à turma com o mesmo nome (“10ºA” = “10.º A”); nas conjuntas, junta os horários das turmas de origem.
  - A disciplina de cada turma é reconhecida pela legenda (nome da disciplina e nome do professor em Definições); pode corrigir-se em Horário → “Disciplina nesta turma”.
  - Testado com o ClassSchedule real do 10.º A: 57 tempos, 10 disciplinas, DT, ING reconhecido (Seg 10:20–11:50, Qui 15:30–17:00, sala 2.08).
- **Referências às aulas**: vista **Horário** da turma (grelha semanal, aulas da disciplina destacadas, próxima aula, tempos semanais, DT); **O Meu Horário** (todas as turmas, “Hoje” e grelha semanal por cor); Início com as aulas de hoje e a próxima aula em cada turma; cabeçalho de Alunos com próxima aula e DT; nos instrumentos, atalhos com as datas das próximas aulas.
- **Separação transversal Ensino Regular / PROFIJ**: oferta formativa em cada turma (nova turma, juntar, critérios); filtro global na barra lateral (Todas · Regular · PROFIJ) aplicado ao Início, Turmas, seletor de turma e O Meu Horário; agrupamento por oferta nas listas; etiqueta PROFIJ; catálogo de disciplinas PROFIJ em Definições.

## v0.8

- **Maiúsculas iniciais coerentes** em menus, títulos, separadores, botões, cabeçalhos de tabela e rótulos (ex.: “Ano Letivo e Turmas”, “Avaliação Final”); palavras como de/da/e/a ficam em minúscula. Frases (dicas, mensagens) mantêm-se normais.
- **Sexo sem indicação “auto”**: só M/F (lista) e Masculino/Feminino (ficha); continua a ser atribuído pelo primeiro nome até ser alterado.
- **Marca** com logótipo na barra lateral.
- **Caixas de seleção próprias** (24 px, visíveis em modo claro e escuro); “Frequenta” com caixa para assinalar/desmarcar todos no cabeçalho.
- **Barra de ferramentas**: a dica ⓘ fica colada ao botão Importar.
- **Quadro MSAI da ficha**: linhas em cartão, tocar em qualquer ponto da linha assinala a medida; campo de observações visível nas medidas assinaladas.

## v0.7

- **Interface para toque (iPad)** sem mudar o aspeto: alvos ≥ 44 px, botões e campos maiores, controlos segmentados (separadores e organização do ano), caixas de seleção de 22 px, grelha de classificações com células de 58×40 px, gaveta lateral tipo “sheet”, barra lateral só com ícones abaixo de 1100 px (iPad na vertical).
- **Organização do ano** (3 Períodos / 2 Semestres) passou a controlo segmentado.
- **Importação só por Excel** (PDF e “colar lista” removidos). Dica tocável com o caminho no programa da escola: *Área do docente › Turma › Fotos › Gerar Relatório › Exportação Excel*.
- **Delegado/Delegada, Subdelegado/Subdelegada** conforme o sexo do aluno (opções da ficha, resumo e etiquetas).

## v0.6

- **Juntar turmas**: escolhe-se cada turma·disciplina a juntar; por defeito as **turmas originais são apagadas** (com confirmação; opção para as manter). Os alunos passam com fotos e fichas; se as originais forem da mesma disciplina, herda domínios/menções.
- **Numeração original** mantida sempre (no juntar e na importação de várias turmas do mesmo ficheiro); ordenação por turma de origem e n.º.
- **Género automático** pelo primeiro nome (dicionário alargado de nomes femininos sem “-a” e masculinos em “-a”), mostrado como “F · auto”; override na lista e na ficha (“Automático pelo nome / Masculino / Feminino”). Sexo vindo do ficheiro conta como definido.
- **MSAI (DL 54/2018)** — ficha do aluno com separadores *Dados* / *MSAI*; quadro organizado por secções coloridas: documentos (RTP, PEI, PIT), medidas universais (art. 8.º), acomodações curriculares, seletivas (art. 9.º), adicionais (art. 10.º), adaptações ao processo de avaliação (art. 28.º), recursos específicos (art. 11.º); cada medida com campo de disciplinas/observações. Medidas sincronizadas com o mesmo aluno noutras turmas/disciplinas.
- **Quadro MSAI da turma** (Alunos → Quadro MSAI): matriz alunos × medidas, imprimível e exportável em CSV. Etiquetas MSAI na lista de alunos.
- **Delegado(a) e subdelegado(a)** por turma (por turma de origem nas conjuntas): na ficha; resumo no topo de Alunos/Fotografias; etiqueta junto ao nome.
- **Ícones SVG** em toda a app (barra lateral, botões, títulos, separadores).

## v0.5

- **Fotos maiores** (≥ 2×): lista 64 px, pré-visualização 56 px, vista Fotografias 200×250 px (4 por linha; impressão 40×50 mm), ficha 180 px, relatório 52×65 mm. Resolução guardada até 240 px.
- Fotos guardadas no **IndexedDB** (fora do localStorage), partilhadas entre turmas/disciplinas; a cópia de segurança JSON inclui as fotos.
- **Juntar turmas** (turma conjunta): em “Ano letivo e turmas” → “⇄ Juntar turmas”. Escolhem-se 2+ turmas e a disciplina em que estão juntas; cria-se a turma conjunta (ex.: 10.º A/B · Inglês) e as turmas originais mantêm-se para as outras disciplinas.
  - Cada aluno guarda a turma de origem (coluna/etiqueta em listas e grelhas); numeração mantida por turma ou seguida.
  - Avaliação final, pauta CSV e relatórios filtráveis por turma de origem; relatório indica a turma do aluno.
  - “↻ Atualizar das turmas de origem”: acrescenta alunos novos e atualiza fotos/fichas.

## v0.4

- **Importação do Excel ClassPhotos (.xlsx)** — método recomendado. Leitor nativo (sem internet): célula `n.º (processo)`, nome na célula por baixo, foto ancorada entre ambos; cabeçalho da turma ("10ºA") e ano letivo. Livros com várias folhas: usa as folhas com fotos (ex.: o dossier de avaliação com 10.º A e 10.º B → 22 alunos, 22 fotos). Folhas em tabela simples também são aceites.
- Testado com o ClassPhotos.xlsx real: 7 alunos, 7 fotos, n.º e processo corretos.

## v0.3

- **Importação de PDF com fotos**: lê o texto pela posição na página. Reconhece dois formatos:
  - *Fotografias/grelha* (como a folha ClassPhotos): foto, `n.º (processo)` e nome por baixo (nome em várias linhas).
  - *Tabela*: uma linha por aluno (n.º, processo, nome, sexo, data).
- Associa a cada aluno a foto mais próxima, recorta-a e guarda-a (JPEG 120 px).
- Vários grupos/turmas no mesmo PDF (ex.: 10.º A e 10.º B): escolher uma ou importar todas como turma conjunta (10.º A/B, renumerada).
- Fotos: miniatura na lista, vista **Fotografias** imprimível, alterar/remover foto na ficha, foto no relatório individual.
- Se não for possível ler: mostra o texto lido; PDFs digitalizados (sem texto) são assinalados.

## v0.2

Estrutura: **Definições → Ano letivo → Turmas → (Alunos, Critérios, Instrumentos, Domínios, Avaliação final, Relatórios)**.

- **Definições**: escola, ano letivo atual, nome do professor, email, grupo de recrutamento, disciplinas que leciona (catálogo do ensino regular: 1.º/2.º/3.º ciclos e secundário científico-humanístico, + disciplinas extra), tipos de instrumento, textos da síntese descritiva, cópia de segurança.
- **Ano letivo e turmas**: vários anos letivos; cada um com 3 períodos ou 2 semestres. Turma = turma + disciplina (para duas disciplinas na mesma turma: "+ Outra disciplina" copia os alunos).
- **Criar turma a partir de PDF** (lista de turma): leitura com pdf.js, reconhece n.º, n.º de processo, nome, sexo e data de nascimento; deteta turma ("10.º A") e ano letivo; pré-visualização editável antes de importar. Alternativa: colar lista.
- **Alunos**: coluna **Frequenta [disciplina]** — só os assinalados entram em instrumentos, avaliação e relatórios. Ficha do aluno: EE, DL 54/2018, acomodações, observações.
- **Critérios**: domínios e ponderações com modelos (Línguas estrangeiras PO/CO/CE/PE; Português; Educação Física; Genérico), menções, regra do 2.º/3.º período, copiar critérios de outra turma da mesma disciplina.
- Escala definida pelo ano de escolaridade: secundário 0–20; básico % e níveis 1–5.
- Instrumentos, Domínios, Avaliação final e Relatórios como na v0.1.

### Regras de cálculo
- % do domínio num instrumento = pontos nos itens do domínio ÷ cotação desses itens.
- % do domínio no período = média das % dos instrumentos do período que avaliam o domínio.
- Nota = Σ(% domínio × ponderação).
- Nota final 2.º/3.º = média por domínio dos períodos até esse (configurável: só o período).
- Linha em branco = não avaliado; itens em branco numa linha preenchida = 0.
- Menções: Insuficiente ≤49,4; Suficiente ≤69,4; Bom ≤89,4; Muito Bom ≤100.

## Plano de evolução (decidido a 30/10/2026)
1. **Protótipo (atual)** — continuar no ficheiro HTML único para validar funcionalidades e fluxo de trabalho. Usar a cópia de segurança JSON como ponte para a versão seguinte. Não confiar o único exemplar de dados reais ao Safari do iPad (apaga dados de sites não usados há 7 dias).
2. **Fase 1 — base sólida**: projeto modular com testes dos cálculos; modelo normalizado (Aluno → Inscrição turma+disciplina → Instrumentos → Classificações), sem alunos duplicados; tudo em IndexedDB com arquivo por ano letivo; PWA alojada e instalável (iPad/Mac, offline); importação das cópias JSON do protótipo.
3. **Fase 2 — sincronização** (a decidir): só o professor → app nativa (Capacitor) + iCloud; partilha com colegas/escola → servidor na UE com contas (ex.: Supabase). Ter em conta o RGPD (fotos de menores, MSAI = dados de categoria especial).

## Próximas fases (propostas)
1. Importar o dossier Excel atual (alunos e instrumentos INST1–10).
2. Feedback por critérios de Produção Oral (níveis AN1–AN4).
3. Planificação/cronograma anual (folha CRONO), sumários.
4. Assiduidade e ligação à app MRA.
5. Caracterização da turma e fotografias.
6. Versão Mac (Electron, como a MRA).

### v0.36 — Acessibilidade, avaliação oral, janela da aula, conselho de turma, pastas

- **Acessibilidade (WCAG 2.2 AA · Apple HIG)**: ligação “Saltar para o conteúdo”; regiões (navegação, principal); `aria-current` na navegação; título da página e anúncio da vista (VoiceOver); painel lateral como diálogo modal com o resto da app inerte; barra lateral fora do ecrã inerte no iPhone/iPad; Esc fecha painéis e menu; nomes acessíveis automáticos para campos, seletores e botões só com ícone/símbolo; cabeçalhos de tabela com `scope`; regiões deslocáveis focáveis; grupos de alternar com `aria-pressed`; contraste mínimo 4,5:1 garantido também nas cores dinâmicas (etiquetas, tempos, eventos, períodos), modo claro e escuro; alvos de toque de 44 pt no iPhone/iPad (24 px mínimo com rato); campos sem zoom ao tocar no iPhone; refluxo sem scroll horizontal a 320 px; foco sempre visível; Reduzir Movimento (sistema ou definição) pára animações, contadores e GIFs da ajuda (botão Reproduzir/Pausar); Aumentar Contraste reforça contornos; cores forçadas. Definições › Geral › **Acessibilidade**: tamanho do texto (100–150 %), movimento, contraste, ligações sublinhadas.
- **Avaliação Oral** (Turma › Avaliação Oral): critérios da Parte D de Inglês 358 (5 parâmetros, N4 12 · N3 8 · N2 6 · N1 2 · 0); cotação total (60/100/200/20 valores) e pesos por parâmetro com pontuações proporcionais; edição manual de qualquer pontuação com aviso modal (“Ajustar aos pesos” / “Manter”) quando deixa de bater certo; ficha de registo por aluno (guião, nível por parâmetro com descritor, total) em PDF e CSV.
- **Janela da aula** (Aulas e Sumários): sumário, observações e ocorrências da sala de aula; separador Presenças com P / F / FD e FM / At por aluno (miniatura), ocorrências por aluno (Grave/Média/Leve/Positiva + texto); as faltas passam para a ficha do aluno (`faltasAl`, id `s:<aula>:<tipo>`). Botão **Faltei** (falta do professor) em cada aula; contador “Sem Sumário” ao vivo.
- **Avaliação Final › Vista Conselho de Turma**: turmas juntas lado a lado, uma coluna por turma, com miniatura, nota/nível do período e nível atribuído; PDF por turma.
- **Biblioteca**: pastas próprias (criar, mudar o nome, apagar) e uma pasta automática por turma; arrastar recurso para a pasta ou botão Mover; carregamentos com uma pasta aberta ficam nela; margens alinhadas.
- **Catálogo Nacional de Qualificações**: cursos com UFCD e cursos com UC em pesquisas separadas (aparece só o tipo da disciplina escolhida); disciplina Componente Tecnológica (UC); curso da turma PROFIJ/profissional; módulos/UFCD/UC das turmas profissionais.
- **Épocas (temas sazonais)**: Natal (1 dez–6 jan, com neve), Halloween (30 out–1 nov), Dia Mundial do Professor (5 out, faixa de parabéns e confetes), Inverno, Primavera, Verão e Outono mudam a cor de destaque e a barra lateral; Definições › Aparência › Temas sazonais (ligar/desligar, neve, experimentar um tema). Desliga a neve com Reduzir Movimento.
- **Início › Hoje**: data, época, feriado/evento do calendário escolar, dias nacionais e internacionais (efemérides), aniversários de alunos. Sem turmas: botões para criar a turma (Excel ou vazia).
- **Aniversário do professor** (Definições › Professor › Data de nascimento): parabéns em ecrã inteiro uma vez no dia; o × fecha só ao terceiro toque.
- **Escola profissional**: em Disciplinas que Leciono aparecem as disciplinas do ensino profissional por componente (sociocultural, científica, tecnológica, FCT/PAP) e o motor de busca do Catálogo (UFCD/UC). Nova Turma: código interno da turma (`codigo`), nome do curso na escola, um só seletor de curso — as UFCD/UC seguem o curso escolhido.
- **Avaliação Oral** só aparece quando os critérios da turma têm um domínio de oralidade (PO, CO, “oral”); os totais são lançados automaticamente num instrumento “Avaliação Oral” (Prova Oral) no domínio oral, um item por parâmetro, no período escolhido.
- **Ícone de aplicação** (iPad/iPhone “Adicionar ao ecrã principal” e Android/Chrome): ícone 180/192/512 px, manifesto, modo autónomo.
- **Início de sessão** com imagem de fundo e cartão ao lado; grelhas de horário com entradas mais altas; dropdowns com o mesmo aspeto em toda a app; margens uniformes; separador “Turma” na ficha do aluno.
- **Início**: cartão Aulas Dadas (dadas/previstas por turma, período ou ano). **Imprimir** = documento próprio (o do Exportar PDF). Barra superior com título dinâmico e tudo numa linha quando cabe. Horário estica até ao fim da coluna lateral. Avaliação intercalar por toque em cada período. Estados vazios com atalhos para o Calendário/Horário.

### v0.35 — Importar reuniões de PDF, ficheiros importados, tarefas e turmas na barra lateral, sumários por tempo
- **UFCD do Catálogo Nacional de Qualificações**: na Nova Turma PROFIJ com Componente Tecnológica, lista de todos os cursos (filtro por nome/código/área) lida de catalogo.snq.gov.pt; ao escolher o curso, quadro com todas as UFCD (código, designação, horas, obrigatória/opcional) para marcar; botão Atualizar; cache local (`cfg.cnq`), renovada a cada 30 dias.
- **Glossário em dica**: as siglas do glossário (Σ, AI, RA, OD, DT, MSAI, PEI, UFCD, EE, CT…) mostram a explicação ao passar o rato/toque longo, onde quer que apareçam (sublinhado pontilhado).
- **Coluna lateral revista**: no Calendário os indicadores voltam ao topo (só a Avaliação Intercalar fica ao lado); no Gerador de Documentos a pré-visualização passa para a coluna lateral.
- **Importar reuniões** (Reuniões › Importar PDF…): PDF com texto (pdf.js) ou digitalizado/fotografia (OCR Tesseract.js, português, carregado da internet). Reconstrói linhas e colunas pelas posições do texto e interpreta: tabela de resumo (dia, hora início–fim, lista de turmas) e tabela por turma (turma, início, diretor(a), secretário(a), comissão de verificação, local). Ano deduzido do texto (“dezembro de 2026”) ou do ano letivo. Pré-visualização editável (datas/horas), filtro “As que me dizem respeito” (minhas turmas ou o meu nome — com o papel: diretor(a), secretário(a), comissão), duplicados desmarcados, tipo de reunião detetado. Cria reuniões com participantes, lembretes 1 dia/1 hora, notas com o papel.
- **Ficheiros importados** guardados em Documentos › Ficheiros Importados (turmas, horários das turmas e do professor, calendário, reuniões, critérios), por tipo, com abrir/apagar; entram na cópia completa (`S.importados`).
- **Minhas Tarefas** passa a secção própria (prioridade, turma, notas, grupos Em atraso/Hoje/Esta semana/Mais tarde/Sem prazo, decisões das reuniões, contador na barra lateral); sai do Início.
- **Turmas em árvore** na barra lateral: Turmas › turma › secções (Alunos, Horário, Aulas e Sumários, Planta, Testes, Critérios, Instrumentos, Domínios, Avaliação Final, Módulos, Relatórios).
- **Sumários por tempo de 45 minutos** (blocos de 90 min dão duas lições; reposições também divididas).
- **Planta da sala**: fotografias maiores, nota por aluno (no lugar e no PDF) e notas gerais; PDF com fotografias.
- **Avisos urgentes em pop-up**: janela modal em destaque ao abrir a app e a cada minuto com avisos programados (Minhas Tarefas › Avisos Urgentes, data e hora), reuniões que começam na próxima hora, tarefas de prioridade alta para hoje ou em atraso e matrizes por enviar; ações Abrir, adiar 1 h, Visto, Marcar todos.
- **Várias disciplinas na mesma turma**: ao criar a turma assinalam-se as outras disciplinas lecionadas (uma pauta por disciplina com os mesmos alunos); no PROFIJ por componentes (sociocultural, científica, tecnológica com UFCD coladas logo na criação, prática). Novas disciplinas PROFIJ: Física e Química, Ciências da Natureza.
- **Próximas Tarefas no Início** (primeiro cartão, personalizável): tarefas por fazer ordenadas por prazo (atrasadas primeiro, prioridade alta destacada), decisões das reuniões com prazo, juntar tarefa rápida e concluir com um toque; “Ver Todas” abre Minhas Tarefas.
- **Barra lateral**: com uma só turma volta ao formato simples (cabeçalho “Turma …” e secções), sem desdobráveis; nomes das secções sempre completos.
- **Editar o horário do professor à mão** (O Meu Horário › Editar Horário): tabela de tempos (dia, início/fim, turma da app ou outra, sigla, sala), duplicar para o tempo seguinte, fim automático a 45 min; parte do horário importado ou dos horários das turmas; guarda em `horProf` com o mapa para as turmas.
- **Modo escuro**: títulos, nomes e valores sempre com a cor de texto do tema; barra lateral escura no estilo azul.
- **Arrastar aulas** em O Meu Horário (rato ou dedo), como os tempos não letivos; tocar numa aula abre o editor; confirma se o destino estiver ocupado.
- **Importações sempre nos Documentos**: todo o PDF/Excel lido (turmas, horários, calendário, reuniões, critérios, ficheiros largados no ecrã) é guardado de imediato em Documentos › Ficheiros Importados, sem duplicados.
- **Sincronização com a conta Google** (Definições › Dados e Segurança): OAuth Google Identity Services (ID de cliente do próprio utilizador, origem https), ficheiro `eduflow-dados.json` na pasta privada `appDataFolder` do Google Drive com estado, fotografias e anexos; sincroniza ao abrir (sem janelas, se já autorizado), 15 s após cada alteração e ao sair; deteção de alterações por conteúdo; em conflito pergunta que versão manter (cópia `edugest.v2.antesSync` antes de substituir); enviar/receber forçados; desligar.
- **Definições › Professor**: fotografia (também na barra lateral, que abre o perfil), nome completo e nome nos documentos, género (usado em Diretor/Diretora), n.º de docente, contactos, atendimento aos EE, grupo de recrutamento, departamento, situação, anos de serviço, disciplinas, cargos, assinatura digitalizada, notas (`cfg.perfil`).
- **Ferramentas › Avisos em Pop-up**: testar com exemplos (sem alterar dados), ver avisos reais, autorizar notificações do sistema (avisos com a app em segundo plano).
- **Perfil por escola**: e-mail institucional, n.º de docente, atendimento aos EE, grupo, departamento, situação e cargos guardados por escola (`perfil.porEscola[escId]`), com seletor da escola no separador Professor; dados pessoais (nome, fotografia, género, e-mail pessoal, telemóvel, anos de serviço) comuns. Novas variáveis nos documentos: `{{email_professor}}`, `{{grupo_professor}}`, `{{departamento}}`, `{{atendimento_ee}}`, `{{telefone_professor}}` (da escola da turma).
- **Formulários**: campos de uma mesma linha sempre alinhados, mesmo quando uma etiqueta ocupa duas linhas (em toda a app).
- Correção: o pop-up de avisos usava nomes de classes já existentes (`.avbox`, `.ava`, `.avt`), o que desarrumava o painel lateral da Marcação de Testes; passou a ter estilos próprios.
- **Disciplinas por ano letivo** (`ano.disciplinas`, `ano.discExtra`): escolhidas em Ano Letivo e Turmas (cartão desdobrável); um ano novo herda as do ano anterior; Definições › Geral só mostra o resumo. Primeiros passos reordenados (escola e professor → ano letivo → disciplinas desse ano → turmas → alunos).
- **Início**: Favoritos numa coluna própria (à esquerda em ecrãs muito largos; ao lado, por baixo da contagem/reuniões, nos outros); botão “Ver Avisos”.
- **Fotografias da turma** ocupam toda a largura, com fotografias que se adaptam (2 a 9 por linha).
- **Escola**: pré-visualização e tipologia numa coluna ao lado em ecrãs largos; pesquisa da escola na internet limitada por região (Açores por omissão, Madeira, continente, todo o país) com “Procurar Novamente” e opção de substituir os campos já preenchidos.
- **O Meu Horário** mais compacto (menos espaço entre tempos; linhas sem aulas reduzidas).
- **Ajuda**: 13 novas animações (tarefas, avisos, professor, importar reuniões, arrastar e editar horário, planta, sumários, direção de turma, documentos, biblioteca, várias disciplinas, ficheiros importados) e as 8 anteriores refeitas com o aspeto EduFlow.
- **Coluna lateral em ecrãs largos (filosofia geral)**: a partir de ~1400 px de janela, os cartões secundários passam para uma coluna à direita (340 px, fixa ao deslocar): Calendário (indicadores e Avaliação Intercalar), O Meu Horário (indicadores, Tempos Não Letivos, Turmas sem Horário), Horário da Turma (indicadores, Disciplina Nesta Turma, Aulas Previstas, Próximas Aulas), Minhas Tarefas (indicadores, Avisos Urgentes, decisões das reuniões), Ano Letivo e Turmas (Horários Importados), Critérios (Turma), Definições (Tipos de Tempo Não Letivo, Avisos em Pop-up), Ajuda (índice e pesquisa), Escola (pré-visualização e Tipologia) e Início (Favoritos). Em ecrãs estreitos mantém-se uma só coluna.
- **Ajuda** reorganizada e atualizada com todas as funcionalidades novas.
- **Escola única** mostrada na barra como texto (logótipo + nome), com o mesmo aspeto do seletor de várias escolas.
- **Calendários** abrem com zoom ampliado e lembram o zoom escolhido (`cfg.calZoom`).
- Correções: “Feriado Municipal” com maiúscula (também nos dados já guardados); setas da árvore; botão de informação do Excel separado e redondo.

### v0.34 — EduFlow: Direção de Turma, Gerador de Documentos, Biblioteca, ficha do aluno completa, PDF em todo o lado
- **Identidade EduFlow** (nome, logótipo, tagline, designação, slogan). Ecrã de início de sessão agnóstico (sem escola). Ano letivo escolhido automaticamente pela data (set.–dez. de 2026 e jan.–jul. de 2027 → 2026/2027; agosto → ano seguinte); sem “(mais recente)”. Na barra: “Ano Letivo: 📅 2026/2027” como texto. Nas Definições o ano é só indicação. Turma vazia: “Sem turmas” em itálico. Coluna do nome alarga até ocupar o espaço livre.
- **Prof. Nome Apelido** sempre que aparece o nome de um professor (Início, PDF, relatórios, diretor de turma, assinaturas, impressão) — `profNome()`.
- **Exportar PDF** ao lado de cada “Imprimir” (e em Alunos, Reuniões, Avaliação, Domínios, Horários, Critérios): documento A4 próprio para cada vista (cabeçalho institucional com logótipo, título, subtítulo, tabelas paginadas, fotografias, assinaturas, rodapé “EduFlow · Plataforma Integrada de Gestão Educativa · data · Página n de N”), não a impressão do ecrã. Construtores específicos: lista/fotografias/MSAI de alunos, relatórios individuais (página por aluno), mapa de reuniões, calendário escolar, calendário de avaliações, livro de sumários, planta da sala, ficha do aluno, plano de acompanhamento, preparação do conselho de turma, informação intercalar, auditoria; nas restantes vistas extrai as tabelas ou o conteúdo dos cartões.
- **Auditoria** (Definições › Auditoria): inícios/fins de sessão e tentativas falhadas, edições por secção (agrupadas por 90 s), exportações, importações, documentos, escolas, organização, modo de apresentação, restauros. Filtros, CSV, PDF, limpar > 1 ano. Máx. 5000 registos.
- **Feriados locais dos Açores**: concelho da escola (Escola › Localização e Feriados Locais) → Dia dos Açores (Segunda-feira do Espírito Santo = Páscoa + 50) e feriado municipal dos 19 concelhos (novo tipo de dia `feriadoM`, cor própria, legenda e daltonismo “M”), aplicados aos dias letivos e retirados ao mudar de concelho; reaplicados ao importar/criar o calendário; os dias letivos dos períodos são recontados. Povoação: data indicada à mão.
- **Nova escola a partir de listas**: 39 escolas públicas (ensino regular) e 16 escolas profissionais dos Açores, com pesquisa, concelho, e listas editáveis (acrescentar/renomear/apagar, repor).
- **Início personalizável**: “Personalizar” escolhe e ordena os cartões (contagem, matrizes, tarefas, favoritos, datas, testes, turmas, reuniões, aniversários, aulas de hoje). **Favoritos** (estrela na barra). **As Minhas Tarefas** (prazos, atrasos, decisões pendentes das reuniões).
- **Ficha do aluno em 15 separadores**: Identificação (n.º interno, e-mail da escola), Turma e fotografia, Percurso (automático + manual), Disciplinas, Classificações e evolução (gráfico), Assiduidade (injustificadas, justificadas, atrasos, material, disciplinares), Trabalhos e instrumentos, Medidas de apoio, Observações, Atividades, Contactos (só com autorização RGPD), Documentos (anexos guardados no dispositivo), Intervenções, Portefólio, Exportação (PDF/JSON com escolha das secções permitidas).
- **Turma**: **Planta da sala** (filas × colunas, arrastar/tocar, corredores, distribuir por número/alfabética/aleatória, PDF); **Aulas e Sumários** (lições numeradas, sumário por aula, substituições — a aula conta como dada — e reposições — somam às aulas dadas do período; livro de sumários em PDF/CSV).
- **Biblioteca de recursos**: fichas, testes, apresentações, planificações, imagens, áudio, ligações; disciplina/ano/tema, etiquetas, pesquisa e filtros; pré-visualização (PDF com pdf.js, imagens, áudio, texto); versões; coleções individuais e de departamento; modelos; partilha; arquivo por ano letivo; ligação a pastas do Google Drive.
- **Direção de Turma** (aparece quando assinala a turma como sua): Painel, Processos, Encarregados de Educação, Atendimentos (presencial/telefónico/e-mail), Convocatórias e Comunicações, Assiduidade (limite de alerta e comunicação ao EE), Avaliações, Intervenções e Ocorrências, Conselhos de Turma (preparação + PDF de síntese), Avaliação Intercalar (apreciação + relatórios PDF), Planos de Acompanhamento (PDF), Histórico de Diligências, Arquivo.
- **Gerador de documentos**: 15 modelos base (convocatória EE, e-mail institucional, comunicação de assiduidade, plano de recuperação, plano de reposição, relatório individual, ata, relatório intercalar, grelha, planificação, certificado, declaração, relatório de atividades, balanço de departamento, documento para conselho de turma) com 25 variáveis `{{…}}` preenchidas com os dados registados; um documento por aluno num só PDF; numeração por ano (001/2027); cabeçalho institucional; assinatura (texto + imagem digitalizada); estados (rascunho, para aprovação, aprovado, enviado); versões; arquivo; abrir no e-mail; modelos editáveis e próprios.
- Cópia de segurança completa inclui os anexos (documentos, portefólio, biblioteca); a verificação de integridade já não os trata como fotografias órfãs.
- Testes: cálculos 9/9; regressões t28–t40, reuniões, apresentação, calendário; novo teste ponta-a-ponta da v0.34 (widgets, favoritos, feriados Calheta 25/11 e Ponta Delgada 3/5/2027, Espírito Santo 17/5/2027, listas de escolas, 15 separadores, planta, sumários/reposição, biblioteca com pré-visualização, DT, documentos com versões/aprovação, 12 PDF validados, auditoria, 0 erros; 1180/820/390 px sem deslocamento horizontal).

### v0.33 — Azul por omissão, escola por extenso, ano letivo escolhido ao entrar
- **Estilo “Azul Corporativo” passa a ser o padrão** (o anterior continua disponível em Aparência). Revisto como meio-termo: barra lateral na **cor de destaque** (os 7 acentos mudam o azul), fundo cinzento-claro com cartões brancos com contorno e cantos suaves, botões em pílula, separadores sublinhados, cabeçalhos de tabela em maiúsculas; modo escuro suportado.
- **Lista de alunos, Fotografias e MSAI** no novo estilo: fotografias com moldura, campos “invisíveis” até tocar (lista mais limpa), cartões de fotografia e MSAI com contorno, sombra e elevação ao passar.
- **Nome da escola sempre completo**: no seletor da barra (até 2 linhas, com logotipo; o seletor nativo fica transparente por cima) e por baixo de “EduGest” na barra lateral.
- **Ano letivo escolhido no início de sessão** (por omissão o mais recente); dentro da app a barra mostra só a indicação do ano (para mudar, terminar sessão). Com a sessão mantida, a app abre sempre no ano mais recente.

### v0.31–0.32 — Espaçamento global, calendário lado a lado, escola em destaque, pesquisa da escola, estilo alternativo
- **Ritmo vertical único** (auditoria automática às 22 secções): cabeçalho do cartão → conteúdo 12 px; linhas de informação seguidas 8 px; rótulo → campo 6 px; blocos 12 px; subtítulos de secção 20 px; texto 1,45. Listas em cartões (aniversários, matrizes, avisos, reuniões) com separador só entre itens e 12 px após o cabeçalho. Cabeçalho dos Alunos (próxima aula, diretores de turma, delegados, nota) com espaçamento regular.
- **Calendário Escolar**: o cartão “Interrupções, Feriados e Marcos” fica **ao lado** do calendário quando há espaço (≥ 1000 px de área útil), fixo ao deslocar; os botões − / + do tamanho passaram para o cabeçalho do calendário.
- **Escola em destaque**: com várias escolas, o seletor fica à esquerda, junto ao título, com o logotipo dentro e o nome a negrito; Ano Letivo e Turma à direita; em iPad vertical os seletores ocupam uma linha própria.
- **Procurar Dados na Internet** (página Escola): pesquisa o nome no OpenStreetMap (Nominatim, sem chave), mostra os resultados para escolher e preenche morada, código postal e localidade, telefone, e-mail, sítio e código (quando existem), sem substituir campos já preenchidos. Requer internet (em ficheiro local alguns navegadores bloqueiam).
- **Estilo “Azul Corporativo”** (Definições › Aparência › Estilo da interface): barra lateral azul, conteúdo branco e plano, botões em pílula, separadores sublinhados, cabeçalhos de tabela em maiúsculas — inspirado em aplicações de gestão de ficheiros. `EduGest-Azul.html` abre já com este estilo.
- Correções: aniversários ignoram datas de nascimento inválidas (ex.: ano 0003) e a verificação de integridade assinala-as; a verificação de integridade usa a organização da escola de cada turma; seletores de Definições numa só linha (deslizam).

### v0.30 — Escola como contexto (como o ano letivo e a turma)
- **Seletor “Escola” na barra superior** (aparece quando há mais de uma escola), ao lado de Ano Letivo e Turma. Mudar de escola muda **tudo**: turmas visíveis (seletor de turma, Ano Letivo e Turmas, filtros), Início (cabeçalho, logotipo, contagens, aniversários, matrizes, datas), calendário escolar, organização (períodos/semestres), horários das turmas, O Meu Horário e tempos não letivos, reuniões, datas de avaliação e avaliação intercalar.
- Dados por escola dentro de cada ano letivo: `a.porEscola[escola]` com `calendario, horarios, horProf, naoLetivos, reunioes, datasAval, intercalar, org` (acesso transparente por `a.calendario`, etc., conforme a escola ativa). Migração automática: os dados existentes ficam na escola principal.
- Uma escola sem calendário próprio usa o da principal (com aviso e botões “Criar Calendário Próprio” e “Importar PDF desta Escola”); ao mudar a organização numa escola que partilha o calendário é criada automaticamente uma cópia própria — a outra escola não é afetada. A mudança de organização só remapeia instrumentos das turmas dessa escola.
- Escolher uma turma de outra escola (pesquisa, Início, ligações) muda a escola ativa; criar escola ou tocar num cartão em Escolas torna-a ativa; nova turma fica na escola ativa. As sobreposições de reuniões consideram as aulas de cada turma no horário da sua escola.
- Barra: com várias escolas, o logotipo fica junto ao título e o nome no seletor; larguras ajustadas no iPad.

### v0.29 — Datas, aniversários, matrizes e modelos de critérios
- **Escrever datas** (correção global): os campos de data já não perdem o foco a meio da escrita. A alteração só é aplicada quando termina (sair do campo, Enter ou 1,5 s sem escrever); datas incompletas/inválidas (ano fora de 1900–2099) são repostas com aviso.
- **Aniversários** no Início (cartão lateral): próximos N dias (14 por omissão), hoje em destaque com 🎂, ontem incluído, turma e idade que faz (idade oculta no modo de apresentação com dados sensíveis); alunos repetidos em várias turmas aparecem uma vez; 29 de fevereiro tratado.
- **Envio da matriz**: cada teste marcado (tipo teste/prova com data) gera automaticamente a marcação “Envio da matriz” N dias antes (10 por omissão; fim de semana → sexta anterior): cartão “Matrizes a Enviar” no Início (7 dias de antecedência, atraso a vermelho, botão “Enviada”), Datas Importantes e marca **MZ** no calendário da Marcação de Testes; o aviso ao marcar indica a data. Mudar a data do teste volta a pedir o envio.
- **Definições › Geral › Avisos Automáticos**: ligar/desligar e nº de dias da matriz (atalhos 5/7/10/14) e aniversários (mostrar e nº de dias).
- **Definições › Domínios e Ponderações**: 22 modelos de base cobrindo todas as disciplinas da lista (línguas estrangeiras, Português básico/secundário, PLNM, Matemática básico/secundário, Educação Física, ciências experimentais, História/Geografia, Filosofia, Economia, artes visuais, música/dança/teatro, Educação Tecnológica, TIC, Cidadania, EMRC, Estudo do Meio, línguas clássicas, Apoio ao Estudo/Oferta, módulos/UFCD, genérico) com barra de ponderações; editar (disciplinas, ciclos, domínios, pesos, pesos iguais, total), duplicar, criar novos, repor os de base, apagar os próprios; pesquisa. Nova turma usa o modelo da disciplina/ciclo (próprio > base > tipo). Em Critérios, “Aplicar modelo” sugere o da disciplina e religa os itens dos instrumentos pela abreviatura.

### v0.28 — Organização global, várias escolas e tipologias, módulos/UFCD, integridade e início de sessão
- **Períodos/semestres globais** (`a.org` é a fonte de verdade): o calendário importado já não muda a organização — adapta-se a ela. Com semestres, os 2 semestres são calculados a partir do calendário de 3 períodos (fim do 1.º semestre = último dia letivo de janeiro, ajustável); ao voltar a períodos, repõe os 3 originais (ou calcula-os pelas interrupções do Natal e da Páscoa). Ao mudar: instrumentos e datas de avaliação passam para o período/semestre da sua data; sínteses/observações/autoavaliação do 3.º passam para o 2.º; bloqueios/níveis atribuídos inexistentes são removidos; avaliação intercalar ajustada. Seletor no Calendário Escolar (cartão “Organização do Ano Letivo”) e em Ano Letivo e Turmas.
- **Várias escolas por ano letivo** (`S.escolas`, a principal continua em `S.cfg`): página Escolas com cartões, adicionar/remover (as turmas passam para a principal), logotipo e dados por escola; **tipologia** por escola: *Ensino Regular* (ofertas Regular e PROFIJ) ou *Escola Profissional* (Curso Profissional). Turmas com `escola`; ao criar/editar turma escolhe-se a escola e as ofertas mudam conforme a tipologia (curso e ano de formação nos cursos profissionais). Filtro por escola na barra lateral. Cabeçalho, barra, relatórios, PDF das MSAI, atas e impressão usam a escola da turma.
- **Módulos / UFCD** (turmas de cursos profissionais e PROFIJ): nova secção na barra lateral (com o nome “Módulos” ou “UFCD”); lista com código, designação, horas, início e fim previsto, instrumentos associados e aprovados; colar lista; grelha de classificações 0–20 (aprovado ≥ 10, não aprovado, em atraso), concluídos, horas e média ponderada pelas horas; calcular a partir dos instrumentos associados ao módulo; exportar CSV e imprimir.
- **Integridade dos dados** (Definições › Ferramentas): identificadores repetidos, ligações partidas (alunos, itens, domínios, turmas, escolas, módulos, horário do professor, reuniões, faltas), períodos inexistentes na organização atual, instrumentos com data noutro período, datas inválidas, ponderações ≠ 100 %, números repetidos, fotografias em falta ou órfãs, tamanho dos dados; correção automática (com cópia prévia). Verificação silenciosa ao abrir (avisa se houver erros).
- **Início de sessão**: ecrã de entrada com o logotipo da escola; conta inicial **admin / admin** com pedido para alterar; palavras-passe em SHA-256; limite de tentativas; “manter sessão 30 dias”; sessão na barra lateral (terminar sessão); Definições › Conta e Acesso (contas locais, alterar palavra-passe). **Microsoft 365 preparado**: Client ID, Tenant ID, domínio autorizado e URI de redirecionamento; com https e configuração, o botão usa MSAL (popup, `User.Read`).

### v0.27 — PDF das MSAI, reuniões com várias turmas, diretor/diretora de turma
- **Exportar PDF das MSAI** (Alunos › Quadro MSAI): PDF A4 horizontal gerado na própria app (sem bibliotecas nem internet) — cabeçalho com logotipo, escola, disciplina, turma e professor; resumo por tipo de medida; tabela por aluno com medidas universais (+ acomodações), seletivas, adicionais, adaptações à avaliação, recursos e documentos (RTP/PEI/PIT) e observações; alunos sem medidas listados no fim; linhas de assinatura (professor e diretor/diretora de turma); rodapé “documento confidencial (RGPD)” e numeração de páginas.
- **Reuniões**: associar **várias turmas** a uma reunião (seleção por botões com o ícone do ano); aparecem no título automático, na ficha, na lista e na ata. Reuniões antigas com uma turma continuam a funcionar.
- **“Diretor de Turma” / “Diretora de Turma”** escrito por extenso conforme o primeiro nome (em vez de “DT”): cartão do Horário, cabeçalho dos Alunos, etiqueta nas turmas, Início, Editar Turma, horários importados e assinatura do PDF.
- Barra superior: a escola aparece como **imagem + texto** (sem aspeto de botão); só a imagem abaixo de 1100 px.
- Margens: linhas soltas diretamente na vista (ex.: nota dos lembretes nas Reuniões, dicas, avisos) alinhadas com a largura dos cartões em ecrãs largos.

### v0.26 — Modo de apresentação seguro, lista de alunos, DT e consistência
- **Modo de Apresentação** (olho na barra): painel de opções antes de começar, guardado em `cfg.apres`.
  - Nomes: **só o primeiro nome** (por omissão; com inicial do apelido se houver dois iguais), iniciais, só o n.º ou completos — aplicado a toda a app (tabelas, fichas, relatórios, dicas, títulos), com os campos de nome só de leitura.
  - Fotografias: mostrar ou desfocar — só as fotografias dos alunos (as imagens/GIF da ajuda e o logotipo nunca são ocultados).
  - Dados sensíveis desfocados: processo, nascimento/idade, repetência, ASE, MSAI / DL 54, EE e contactos, observações; separador MSAI da ficha escondido. **Relatórios**: só a informação sensível é desfocada.
  - Proteger informação do professor: esconde Reuniões (e lembretes), O Meu Horário, Definições, Escola, aviso de cópias, datas de reuniões no Início, pesquisa e troca de turma; essas secções ficam bloqueadas.
  - **Alunos a ocultar**: escolha por aluno; nome passa a “Aluno(a) oculto(a)” e linha / cartão / ficha / relatório ficam totalmente desfocados (também na turma conjunta).
  - Etiqueta “Apresentação” no canto; sair volta a mostrar tudo.
- **Lista de alunos**: tabela compacta e alinhada (coluna Freq. com o checkbox alinhado ao cabeçalho, fotografia 46 px, ações Ficha + apagar com ícones), sem cortar à direita no iPad (coluna Idade e textos das ações escondem-se abaixo de 1240 px de área útil); **nomes compridos translineiam** quando falta largura e a coluna alarga quando há espaço.
- **Diretor(a) de turma**: KPI do Horário indica de que turma; se for você, “É você”; cabeçalho dos Alunos “DT da turma / DT do 10.º A | DT do 10.º B” nas conjuntas; etiqueta **DT** nas turmas de que é diretor(a); Início: “Diretor(a) de Turma do …”. Reconhecido pelo nome no horário da turma ou marcado em Editar Turma (“Sou diretor(a) de turma”).
- **Auditoria de consistência** (22 secções): subtítulos de cartão (h3) com tamanho/margens únicos, cabeçalhos de tabela 12 px/600, rótulos de formulários 13 px/600, botões pequenos 40 px, valores de texto dos KPI 19 px.
- Ajuda: nova secção “Modo de Apresentação”; “Reuniões” passou para junto do Calendário.

### v0.25 — Reuniões (mapa, gestão, lembretes e avisos)
- Nova secção **Geral › Reuniões** com 4 separadores: **Próximas** (Hoje / Amanhã / Esta Semana / Próximas Semanas / Mais Tarde / Adiadas), **Mapa Mensal** (grelha do mês com fins de semana e dias não letivos sombreados; toque num dia para agendar), **Tarefas** (todas as decisões e tarefas com responsável e prazo) e **Histórico e Atas**.
- Indicadores: próxima reunião (contagem), reuniões desta semana, tarefas pendentes / em atraso, atas por fazer.
- **Tipos**: Conselho de Turma, Reunião de Avaliação, Departamento, Grupo Disciplinar, Conselho Pedagógico, Diretores de Turma, Encarregados de Educação, Reunião Geral, Equipa/Projeto, Formação, Outra — cada um com cor; ordem de trabalhos sugerida pelo tipo.
- **Editor**: título (automático tipo · turma), data, início/fim, local (com sugestões), ligação online, turma, convocante, participantes, lembretes (15 min, 1 h, 3 h, 1 dia, 2 dias, 1 semana), repetição (semanal, quinzenal, mensal, até uma data), ordem de trabalhos e lista de preparação; deteção imediata de **sobreposições** com aulas (horário do professor e das turmas, só em dias letivos), tempos não letivos (incl. quinzenais) e outras reuniões; duplicar; apagar (com série) — vai para o Lixo e pode ser restaurada.
- **Ficha da reunião**: quando/onde/contagem, entrar na reunião online, estado (agendada, realizada, adiada, cancelada; adiar para nova data), preparação com barra de progresso, ordem de trabalhos com visto, notas da ata (gravação automática), decisões/tarefas (responsável, prazo, atraso), **ata em .doc** (com logotipo e cabeçalho da escola) ou copiada, exportação .ics.
- **Lembretes**: com a app aberta, aviso no topo com som no momento de cada lembrete e no início da reunião (notificações do sistema se autorizadas); para a app fechada, **exportar .ics** com alarmes (VALARM) para o Calendário do iPad/computador.
- **Avisos**: sobreposições (agrupadas por série), preparação incompleta na véspera/no dia, reuniões passadas por marcar como realizadas, realizadas sem ata, tarefas em atraso. Contador na barra lateral (reuniões de hoje, ou “!” se houver avisos graves).
- Integração: as reuniões de avaliação da Marcação de Testes aparecem no mapa; as próximas reuniões aparecem no Início (cartão lateral) e nas Datas Importantes.
- Barra superior: escola (logotipo + nome) entre o título e os seletores; toque abre a página da Escola (só logotipo abaixo de 1440 px).

### v0.24 — Margens coerentes e animações subtis
- **Escala de espaçamento única** (4/8/12/16/20/24 px) aplicada a cartões, KPI, grelhas, títulos, avisos e dicas; padding da barra alinhado com o conteúdo (24 px; 12 px em telemóvel); modo compacto ajustado.
- **Barra superior numa só linha**: título, Ano Letivo, Turma, ações da secção e ícones (pesquisa, desfazer, apresentação, ajuda, guardado) alinhados. Se não couberem, só os botões da secção descem para uma 2.ª linha; título longo encurta com reticências; entre 1000 e 1440 px os rótulos "Ano Letivo"/"Turma" e o texto "Guardado" ficam ocultos para poupar espaço.
- Separadores de secção (Definições, Calendário) com largura ajustada ao conteúdo; espaço garantido entre tabelas/grelhas e as notas abaixo (Horário, Calendário, MSAI, Avaliação, Escola, Critérios, Marcação de Testes).
- **Animações**: entrada em cascata de KPI, cartões de turma, datas importantes, períodos e meses; anel da contagem e barras de progresso desenham-se; números contam até ao valor ao entrar numa secção; gaveta lateral com efeito mola e véu (toque fora fecha); botões com resposta ao toque; ícone da navegação ativa com pequeno salto; "hoje" e datas próximas com pulsação breve; "a guardar" com respiração; dias do calendário reagem ao toque.
- Tudo desativado com "Reduzir movimento" do sistema.
- Ano Letivo e Turma encostados aos ícones da direita (pesquisa, desfazer…); ações da secção logo a seguir ao título.
- Seletor de tema na barra lateral sempre visível por inteiro: o tema ativo mostra o nome, os outros só o ícone.
- **Correções**: a app abre sempre no Início (mostrado logo ao abrir, mesmo que o armazenamento interno demore; também ao voltar à app); "Juntar Turmas" avança para a lista de alunos da turma conjunta (antes parava com um erro interno); as fotografias em miniatura já não desaparecem na vista Lista quando a tabela é larga (ex.: turma conjunta com coluna Turma).

## v0.37 (01/11/2026)
- **Sincronização na Nuvem** (Definições › Dados e Segurança): OneDrive (Microsoft 365/pessoal, PKCE, pasta da app) ou Google Drive (appDataFolder). Dados divididos por partes, encriptados no dispositivo (AES-256-GCM, palavra-passe própria), junção a três vias por parte; em conflito fica a versão mais recente e a outra fica para repor. Automática: 20 s após alterar, ao abrir, ao sair e a cada 5 min. Requer https e um ID de aplicação (Entra / Google Cloud). Substitui a sincronização antiga de ficheiro único quando ativa.
- **Bloqueio dos dados de base**: botão na barra lateral e cartão nas Definições; protege turmas/anos, identificação dos alunos, critérios, horários e calendário (escolha por área). Alterações bloqueadas são desfeitas com aviso; desbloquear pede o código. Sugestão de bloqueio na vista de turmas.
- Início › Hoje: dias nacionais e internacionais (lista alargada, datas móveis: Carnaval, Páscoa, Dia dos Açores, Corpo de Deus, Dia da Mãe) e piadas ao sábado e domingo (também no horário).
- Horário: os tempos ocupam toda a altura da célula.
- Ensino profissional: o distintivo da turma mostra o código interno.
- Introdução do código (PIN) com teclado numérico.
- **Entrar com Microsoft 365** (v0.37): uma só autorização (PKCE, sem bibliotecas externas) inicia a sessão e liga o OneDrive (`User.Read`, `Files.ReadWrite.AppFolder`). Se o dispositivo não tiver o ID da aplicação, é pedido no momento (ou embutido em `EF_MS_ID`, ou passado uma vez por `?ms=<ID>`). Depois de entrar: se já há dados no OneDrive pede a palavra-passe de encriptação e recebe-os; se não, cria-a e envia. Preenche o nome e o e-mail do professor se estiverem vazios.
- **Ecrã do código** (v0.37): mesmo fundo do início de sessão, cartão com fotografia/iniciais, saudação, teclado redondo e “Sair”.
- **Início › Desempenho por Critério** (v0.37): na coluna da direita, por turma e período — média e positivas, ponto forte/critério a reforçar, por critério média, intervalo mín–máx, negativas (com nomes), excelentes, dispersão e evolução face ao período anterior; histograma das classificações; dica de recuperação. Retirada da contagem decrescente a lista “Tempos por dar” (repetia o cartão Aulas Dadas).
- **Ensino profissional — avaliação por módulo** (v0.37): ao criar a turma (oferta profissional) é obrigatório indicar os módulos da disciplina (designação e horas) ou escolher UC/UFCD do catálogo. Cada módulo tem critérios, instrumentos, avaliação e oral próprios; alunos, horário, planta, sumários são da turma. Barra de módulos em Critérios, Instrumentos, Domínios, Avaliação, Relatórios, Oral e MRA; interruptor em Módulos.
- **Recuperação (MRA)** (v0.37): Turma › Recuperação (MRA) por módulo — faltas (contadas pelas datas do módulo), limite 10%, excesso, estado da ficha; abre a ficha original da app MRA (folha e PDF iguais) já preenchida (curso das listas da escola pelo código da turma, formador, formando, disciplina, módulo, horas, faltas, linhas = excesso); guarda-se na turma.
- Bloqueio também na barra de cima; Marcação de Testes a toda a largura (meses em 2 colunas em ecrãs muito largos); data do cartão Hoje maior; avisos incluem o dia de hoje (aniversários, feriado, dias nacionais/internacionais, piada de fim de semana).
- **Início — versões Simples e Geral** (v0.37): botões Simples/Geral no Início. A versão Geral tem pesquisa universal (alunos, turmas, testes, reuniões, documentos, biblioteca, tarefas), ações rápidas (Criar Teste, Registar Sumário — abre a aula mais antiga sem sumário —, Agendar Reunião, Tarefa), filtros globais (ano letivo, período/semestre, turma, disciplina, modalidade) e 16 cartões: Resumo Geral, O Meu Dia, Alertas Inteligentes, Desempenho Escolar, Avaliações, Estado das Turmas, Calendário, Sumários, Direção de Turma, PROFIJ/Profissional, Desempenho por Critério, Assiduidade, Aniversários, Tarefas, Atividade Recente, Dados e Segurança. Indicadores com tendência (▲/▼ face ao período anterior). Personalizar: mostrar/ocultar, ordem (setas ou arrastar pelo título), tamanho (pequeno, médio, grande, largura total) e disposição (grelha, colunas, lista). Guardado em `cfg.dash` `{modo, f:{per,turma,disc,oferta}, w:{id:{on,tam}}, ordem, layout}`.
- Painel Geral organizado em secções (Visão Geral, Hoje, Avaliação e Desempenho, Turmas e Aulas, Agenda e Gestão), cartões da mesma linha com a mesma altura; opção "Agrupar por secções" em Personalizar.
- **Perfil de Aprendizagem** (v0.37): ficha detalhada do aluno (a ficha normal mantém-se; botão "Perfil" no topo da ficha e "Abrir Perfil" em Classificações). Resumo com frase de situação (progressão/estabilidade/descida, tendência nos instrumentos, regularidade), classificações por período (e média da turma), gráfico radar por domínio (agora, período anterior, turma), pontos fortes e a melhorar com feedback e estratégias por tipo de domínio, domínios em detalhe (nível, evolução, posição face à turma), evolução nos instrumentos com linha de tendência, autoavaliação do aluno (escala 1–4 por domínio, classificação proposta, reflexão) com comparação perceção/desempenho, compromisso para o próximo período, assiduidade e medidas de apoio. Modo Projetar (ecrã inteiro, letra maior; por omissão oculta comparação com a turma, assiduidade e medidas de apoio; opção só iniciais), escolha das secções visíveis, imprimir, aluno anterior/seguinte. Guardado em `aluno.autoavD[período]` `{dom:{domId:1–4}, nota, forte, melhorar, plano:{meta, estr, apoio}, data}` (a nota proposta também em `autoav[período]`); preferências em `cfg.perfilOcultos {normal, proj}`, `cfg.perfilAnon`.
- Painel Geral: arrastar um cartão (pelo título) para outra secção ou para um espaço vazio; os tamanhos ajustam-se automaticamente para preencher cada linha (opção em Personalizar). `cfg.dash.w[id].g` = secção escolhida, `cfg.dash.autofit`.
- Recuperação (MRA) redesenhada: cartão do módulo com horas/início/fim editáveis, limite e progresso; indicadores (com excesso, horas a recuperar, fichas, por fazer); lista de formandos com faltas −/+, barra face ao limite, estado e filtros; coluna lateral com dados da ficha e explicação; Editar Módulo, Exportar CSV, Imprimir Lista.
- Alunos › Fotografias redesenhada: estatísticas, carregar várias fotografias de uma vez (arrastar ou escolher; associa pelo número ou pelo nome no nome do ficheiro), cartões 3:4 com número, iniciais e “+ Fotografia”, “Sem nome”, “não frequenta”.
- **N.º de projeto** (v0.37): por turma e por ano letivo (`anos[i].projetos {turmaNormalizada: n.º}`), comum a todas as disciplinas da turma. Editável em Nova Turma e Editar Turma (oferta profissional), no cartão "N.º de Projeto por Turma" de Ano Letivo e Turmas (com "Usar o de <ano anterior>") e na Recuperação (MRA); as fichas MRA usam-no.
- Estados vazios coerentes em toda a app: ícone em cartão arredondado com halo e leve flutuação (respeita "reduzir movimento"), título, descrição e botões com ícones no tamanho certo; os que não tinham ícone ganham um adequado ao contexto. Acabamentos discretos em botões e campos (transições, foco).
- Dados da turma para as fichas MRA, por ano letivo e comuns a todas as disciplinas da turma: N.º do projeto, curso como aparece na ficha, orientador(a) educativo(a) e tratamento — editados em Editar Turma (`anos[i].dadosTurma {turmaNormalizada:{cursoFicha, orientador, genero}}`); a Recuperação (MRA) mostra-os só para consulta, com botão Editar Turma.
- **Itens dos instrumentos em árvore** (até 4 níveis: Grupo/Parte › Pergunta › Alínea › Subalínea): `item.niv[]` (caminho), `instrumento.nNiv`; só o último nível é cotado; ↳ cria sub-item, “Novo Grupo”, numeração automática (A1.→A2., 1.1→1.2). A grelha de classificações mostra o cabeçalho por níveis, ocupa toda a largura, fixa N.º e Nome à esquerda e desliza os itens na horizontal.
- **Avaliação oral ligada a instrumentos**: em Avaliação Oral escolhe-se o instrumento (os que têm itens de oralidade) — a grelha oral preenche esses itens (`item.oralLig`), proporcionalmente à cotação; na grelha do instrumento ficam só de leitura. Registos por instrumento em `oral.regsI[instId]`.
- **Horário semanal (ensino profissional)**: em Horário, lista das semanas de aulas (do calendário escolar) por período, com carregar Excel por semana (ou arrastar), copiar a semana anterior, marcar sem aulas; `turma.horSem {segundaISO:{aulas, fonte, q, vazia?}}`. Aulas previstas, sumários, aulas dadas e próximas aulas usam o horário de cada semana (as semanas sem ficheiro usam o horário habitual).
- Barra lateral: Critérios antes de Marcação de Testes. Marcação de Testes sem espaço vazio. Início (versão simples): arrastar cartões entre as colunas (`cfg.iniPos`), com “Repor Disposição”.
- **Arrastar widgets** (Início simples e Geral): pega ⠿ no título de cada cartão; funciona com rato, toque (iPad) e teclado (setas ↑↓ dentro da coluna, ←→ para mudar de coluna); cartão fantasma a seguir o dedo, espaço tracejado onde vai cair, deslocação automática da página; a disposição fica guardada.
- Avaliação Oral como sub-item de Instrumentos (barra lateral); instrumentos com itens de oralidade mostram “Avaliação Oral” (lista e separador do instrumento), que abre a grelha oral já ligada a esse instrumento; os itens de oralidade ficam ligados automaticamente. Lista de instrumentos a toda a largura.

### v0.37 — Editor de Itens e Cotações em árvore
- O separador «Itens e Cotações» passa a ser uma árvore: cabeçalhos de grupo (nome editável, que renomeia o bloco todo, soma dos pontos, «+ Item», apagar grupo) e itens finais indentados por nível (Item/Pergunta/Alínea/Subalínea).
- Cada item tem designação, domínio, cotação e as ações ↳ (dividir em N sub-itens, repartindo a cotação), ← (subir um nível), ↑, ↓ e apagar. Os níveis passam a ser automáticos (até 4).
- No topo há um resumo com chips por domínio (pontos e %) e o total.
- Os itens de produção oral têm o botão «Oral», que liga ou desliga a pontuação vinda da grelha da Avaliação Oral.
- O editor é responsivo: abaixo de 1100px a designação ocupa uma linha inteira e o domínio, a cotação e as ações passam para a linha seguinte.
- A Avaliação Oral tem um ícone próprio (balão de fala). Corrigido: o botão da barra lateral não abria a vista.

### v0.38 — Avaliação Oral por momentos, Análise exaustiva, Início redimensionável
- **Avaliação Oral abre numa lista de momentos.** Cada instrumento com itens de oralidade é um momento, mais a avaliação oral autónoma. Os momentos aparecem em cartões agrupados por período. Cada cartão mostra:
  - a data;
  - os itens de oralidade;
  - quantos alunos já foram avaliados;
  - a média;
  - a data, quando o momento ainda está agendado.
- Ao escolher um cartão abre-se a grelha, com o botão «← Momentos» para voltar à lista.
- **Cotações e Pesos: Global ou Só Este Momento.**
  - As cotações globais ficam em `oral.cfgGlob`.
  - As cotações próprias de um momento ficam em `oral.cfgI[instId|'_proprio']`.
  - `oral.cfg` aponta sempre para as cotações que estão ativas.
  - Voltar às cotações globais pede confirmação.
- **Separador «Avaliação Oral» dentro do instrumento.** A grelha de oralidade passa a aparecer dentro do próprio separador (com a coluna «No Instrumento»), sem sair do instrumento. «Cotações e Ecrã Completo» abre a vista inteira.
- **Análise mais completa.** O separador «Análise» passa a mostrar:
  - KPIs: média, mediana, positivas e negativas, melhor e mais baixa, desvio padrão e amplitude;
  - conclusões automáticas;
  - histograma por 10% e distribuição por menções;
  - tabela por domínio (média, mínimo, máximo, alunos ≥ 50%);
  - comparação por turma de origem e com os outros instrumentos do período;
  - análise por item: sucesso, dificuldade, cotação total, zeros, sem resposta e índice de discriminação (27% melhores vs 27% piores);
  - resultados por aluno com os domínios e o desvio à média, ordenáveis por nota ou por número.
- **Início simples em grelha de 12 colunas.** Os cartões da coluna principal ficam lado a lado. A largura muda puxando o canto inferior direito (4, 6, 8 ou 12 colunas), com duplo clique ou com as setas do teclado. Fica guardada em `S.cfg.iniTam`. Os cartões continuam a mudar de sítio pela pega.
- Cotações e Pesos (e outros painéis recolhíveis): fechado mostra só «Alterar»; aberto mostra só «Fechar».

### v0.38 — Auditoria geral (aspeto, funcionalidades, contas e dados)
**Método.** Testes automáticos em todas as vistas (26 + separadores dos instrumentos, perfil e dashboard) em 1440, 1024, 768 e 390 px, com três conjuntos de dados:
- dados de demonstração;
- sem dados;
- turma profissional.

Em cada vista recolhem-se erros JS, textos NaN/undefined e transbordos. Foram ainda feitos testes de contas nos limites, de robustez de dados e de desempenho (12 turmas × 30 alunos × 20 instrumentos).

**Contas corrigidas**
- **Arredondamento único** (`pctCanon`). A nota que se vê decide a positiva/negativa, o nível e a menção. Antes:
  - 9,45 aparecia como «9,5» (positiva), mas com nível 9 e menção Insuficiente;
  - no básico, 49,45% contava como negativa e ao mesmo tempo «Suficiente».
  - Também corrigidos os erros de vírgula flutuante (`toFixed(6)` antes de arredondar).
- **Oralidade pendente.**
  - Itens orais ligados (`oralLig`) que ainda não foram classificados na grelha oral deixam de contar como zero.
  - O domínio fica «por classificar» e a nota do instrumento é calculada com os itens já classificados (pro rata).
  - A Análise mostra o aviso e o atalho para a grelha.
- **Validação das classificações.** Só se aceitam números entre 0 e a cotação do item. Valores negativos, acima da cotação, texto ou «1e3» repõem o valor anterior e mostram um aviso.
- **Cotação dos itens:** nunca negativa.

**Dados corrigidos**
- **Modelo da avaliação oral** (`oral.propId`).
  - O instrumento autónomo deixa de ser confundido com um momento ligado.
  - Mudar de momento já não cria instrumentos «Avaliação Oral» duplicados nem perde registos.
  - Apagar um instrumento ligado arquiva os registos (`regsI['apagado:id']`) em vez de recriar um instrumento fantasma.
  - A migração é automática.
- `migrate` foi verificado como idempotente (uma segunda passagem não altera nada).

**Robustez**
- **Rede de segurança no `go()`.** Uma vista com erro mostra «Não foi possível abrir esta página» com «Início» e «Tentar de Novo», em vez de deixar a app num estado incoerente. Vistas desconhecidas abrem o Início.

**Aspeto**
- **Telemóvel.**
  - O ano letivo na barra corta com reticências.
  - A barra de ações tem um esbatimento a indicar que desliza.
  - A lista de instrumentos aparece em cartões, com etiquetas.
- **Grelha oral maior.**
  - N.º sempre visível e nome do aluno numa só linha, fixo à esquerda.
  - Botões de nível de 44 px.
  - A vista ocupa toda a largura.

**Arrastar cartões (Início)**
- Todos os cartões passam a ter pega, incluindo os que não têm título.
- Com o rato, arrasta-se também pelo título.
- No iPad, toque longo no título ou arrastar pela pega. O deslocamento da página é bloqueado durante o arrasto, o que antes cancelava o gesto em iOS.
- O clique a seguir a um arrasto é ignorado.

**Desempenho medido:**
- Início simples 25 ms;
- Início geral 78 ms;
- Avaliação final 38 ms;
- gravar 56 ms com cerca de 1 MB de dados.

## v0.39
- **Escalas de classificação** (Critérios › Escala de Classificação).
  - *Automática*: secundário, PROFIJ e profissional de 0 a 20; 3.º ciclo com testes em 0–100% e nível final de 1 a 5. Pode forçar-se 0–20 ou 0–100% por turma (`t.escala`).
  - *Tabela de conversão % → nível*: editável por turma (`t.conv5`) ou para a escola (`S.cfg.conv5`). A oficial é 0–19 · 20–49 · 50–69 · 70–89 · 90–100.
  - *Negativa no 3.º ciclo*: nível < 3.
- **Arredondamento configurável.** Casas decimais (0/1/2) e regra normal, sempre para cima ou sempre para baixo (`S.cfg.arredModo`). Aplica-se à nota, ao nível, à menção e à positiva/negativa.
- **Painel da Turma** (nova vista `painel`, primeira entrada da turma):
  - *Cabeçalho*: período/ano e cobertura dos dados.
  - *6 indicadores clicáveis*: alunos, assiduidade, abaixo do limiar, avaliações pendentes, a acompanhar, próximos 7 dias.
  - *«Precisa da Sua Atenção»*: faltas no limite ou a metade, instrumentos por classificar, oralidade pendente, matrizes, sumários, deliberações, atas, negativas. Cada item tem uma ação e pode ser marcado como resolvido ou adiado 7 dias, com justificação (`t.painelRes`).
  - *Agenda de 14 dias*, com aviso de concentração de avaliações (3 ou mais por semana).
  - *Tabela de alunos*: ordenar, pesquisar, filtros, colunas configuráveis, seleção múltipla com CSV e perfil lateral.
  - *Avaliação*: distribuição e evolução por período; realizadas, por realizar, por classificar e sem avaliação.
  - *Assiduidade*: 8 semanas; faltas F/FD/justificadas; limite = 2 × tempos semanais no regular, 10% das horas no profissional/PROFIJ.
  - *Documentação e conselho de turma*.
  - *Bloco do curso*: módulos/UFCD no profissional; aulas no regular.
  - Filtros persistentes em `S.cfg.painel`.
- **Evidências por aluno e momento.**
  - Fotografia: câmara direta no iPhone/iPad, com `capture=environment`, reduzida para 1800 px em JPEG.
  - Ficheiros e áudio: carregar ficheiros, gravar áudio (MediaRecorder, com pausa) ou carregar áudio.
  - Guardadas em IndexedDB `eduflow-ev`, só neste dispositivo, sem nuvem nem JSON. `t.evid` guarda as contagens.
  - Botão em cada aluno nas Classificações, na grelha oral e no separador oral.
- **«A Decorrer»**: cartão com barra de progresso enquanto decorre a avaliação intercalar ou uma interrupção letiva.
- **Notas flutuantes**: post-its em qualquer ecrã, arrastáveis e redimensionáveis, com cor, minimizar e âmbito (todas as páginas ou só uma). Atalho Alt+N. Desligam-se em Definições › Aparência (`S.cfg.notasF`, `S.cfg.notasOn`).
- **Perfis e permissões** (Definições › Conta).
  - O Administrador tem tudo.
  - O Professor, por omissão, não cria anos letivos, não edita a escola, não apaga dados e não gere contas.
  - Podem criar-se perfis novos, e cada conta escolhe o seu perfil.
  - Botões sem permissão ficam desativados e mostram um aviso.
  - Limitação: no modo local, as permissões protegem a interface neste dispositivo; só um servidor as torna invioláveis.
- **Estilos de interface**: Coral, Social, Gradiente, Institucional e Académico, inspirados no Airbnb, Facebook, Instagram, SGE e Schoology, sem usar as marcas.
- **Apagar Tudo (100%)**: limpa localStorage, sessionStorage, todas as IndexedDB (dados, cópias, evidências), caches e cookies, e reinicia. A escola, as contas e as definições também são apagadas. A nuvem não é apagada, apenas desligada.
- **Barra superior**: ano letivo e turma só aparecem quando existem.
- **Matrizes**: os instrumentos orais (oral, «Prova Oral», «Apresentação Oral») não têm matriz.
- **Início**: os cartões com invólucro (ex.: Aulas Dadas, `#w-*`) também se arrastam entre colunas, com posição e largura guardadas.
- **Ícone novo**: livro aberto com onda de fluxo, em gradiente azul–índigo, no favicon, no ícone iOS, na barra lateral e no início de sessão.

## v0.40 — Regimes de classificação
Há dois regimes, apresentados lado a lado em Critérios › Escala e na Nova Turma, com o regime ativo assinalado:
- **Ensino Básico Regular**: testes em percentagem, nível final de 1 a 5, com menções qualitativas.
- **Secundário · PROFIJ · Profissional**: 0 a 20 valores nos testes e no final, sem menções qualitativas.

O regime é definido pelo ano de escolaridade, pela oferta e pela disciplina escolhida. Na Nova Turma, o ano e a disciplina sincronizam-se: escolher uma disciplina do secundário passa o ano para o 10.º, e vice-versa.

No regime 0–20:
- `mencao()` devolve só uma banda numérica, sem nome, usada para as cores.
- As pills e as colunas «Menção» ficam escondidas em todas as tabelas.
- O cartão das menções qualitativas é substituído por uma explicação.
- As distribuições passam a usar bandas de valores: 0–9, 10–13, 14–17 e 18–20.
- O perfil passa a dizer «Classificação de 12,9 valores».
- A Avaliação Final mostra «Nota Proposta».

## v0.40 — Novo nome: EduPulse
- A app passa a chamar-se **EduPulse** em toda a interface: título, barra lateral, início de sessão, PDF, notificações, exportações e ajuda.
- O logótipo passa a ser um livro aberto com uma linha de pulso, em gradiente azul–índigo, usado no favicon, no ícone iOS, na barra lateral e no início de sessão.
- Mantêm-se por compatibilidade:
  - as chaves internas de armazenamento (`edugest.*`);
  - a pasta de sincronização no OneDrive (`Aplicações/EduFlow/`), para os dados já sincronizados continuarem a ser encontrados.

## v0.41 — Interface responsiva por dispositivo
**Análise de responsividade** em 9 dispositivos (iPhone SE, iPhone 15, iPad mini, iPad e iPad Pro, ao alto e deitados, portátil e ecrã grande) e nas 27 vistas:
- Não há transbordo horizontal.
- Alvos de toque abaixo de 32 px (pegas de arrastar 28 px, redimensionar 22 px, caixas de seleção 24 px, cabeçalhos ordenáveis 15 px) passam a ter pelo menos 40–44 px no toque.
- Os botões de ação da lista de instrumentos ficavam cortados no iPad ao alto.
- No iPad deitado, a barra de ações ocupava três linhas no cabeçalho.
- No telemóvel, o cabeçalho tinha três linhas e a navegação dependia só do menu.

**Deteção automática** (`dispDetetado`):
- telemóvel: iPhone ou Android Mobile, ecrã com lado curto < 600, ou janela < 560;
- iPad/tablet: iPad, incluindo o iPadOS que se identifica como Mac, Android ou ponteiro de toque;
- computador: os restantes casos.

A app aplica as classes `dev-pc` / `dev-ipad` / `dev-tlm` e `ori-p` / `ori-l`, e reavalia ao redimensionar ou rodar o ecrã. Em Definições › Aparência › «Interface por dispositivo» pode escolher-se Automático, Computador, iPad ou Telemóvel (`S.cfg.disp`).

**iPad**
- Alvos de toque de 44 px e pegas sempre visíveis.
- Ao alto: barra lateral compacta, grelhas a 1–3 colunas e lista de instrumentos em fichas.
- Deitado: barra de ações fixa em baixo.
- Gaveta lateral até 720 px.

**Telemóvel**
- Barra de separadores em baixo: Início, Turma, Sumários, Avaliação e Mais (abre o menu).
- Cabeçalho numa linha (título com reticências) e seletor de turma.
- Ações flutuantes acima da barra.
- Indicadores a 2 colunas; tabela de alunos do Painel em fichas.
- Gaveta em ecrã inteiro.
- Campos a 16 px, para o iOS não fazer zoom.
- Margens de segurança (notch e barra inicial).

## v0.42
- O nome volta a ser **EduFlow**, com o logótipo do livro e da onda (favicon, ícone iOS, barra lateral, início de sessão).
- As **Novidades** (Definições › Ferramentas) estão agora organizadas por versão (0.42 → 0.37) em secções que se abrem e fecham, com a versão atual aberta; o histórico até à 0.36 fica em «Versões anteriores».
- Manifesto e ícones para instalar como app quando alojada em https.

## v0.43
- **Logótipo «Turma Ligada»**: pontos ligados (os alunos) a formar o F. Pode trocar-se pelo «Página com Visto» em Definições › Aparência › Logótipo da app (`S.cfg.logoApp` = `turma` | `pagina`). A troca muda o favicon, o ícone iOS, a barra lateral e o início de sessão.
- **Primeiros passos em modal**: abre sozinho enquanto não houver ano letivo, uma vez por sessão (`sessionStorage ef.ppm`), e também em «Ver Guia» no cartão do Início. Tem barra de progresso, um atalho para cada passo, «Experimentar com Dados de Demonstração», «Visita Guiada» e «Mais Tarde».
- **Versão na barra lateral**: passa a ser gerada a partir de `VERSAO` (estava fixa em «v0.37») e abre as Novidades.
- **Novidades**: atualizadas em todas as versões.
- **Tema escuro**: a barra de topo dos estilos Institucional e Académico deixa de ficar branca.
- **Barra de topo**: sem ano letivo nem turma, os ícones ficam alinhados à direita.
- Tema escuro: a classe .escurox segue agora a troca de tema na barra lateral e no sistema (MutationObserver + matchMedia). No estilo Institucional, os cabeçalhos de tabela e os títulos ficam legíveis no escuro.
- Estilo Institucional: cantos arredondados uniformes (os mesmos do estilo base), mantendo a densidade e as cores formais.
- Estilo Institucional: um só raio de canto (14 px, como a caixa da sessão; 10 px nos botões dentro de caixas) em menu, botões, cartões, campos, separadores e janelas.

## v0.44
- **Animações subtis**:
  - entrada escalonada de páginas e cartões;
  - indicadores que contam até ao valor;
  - barras, histogramas e semanas a crescer;
  - radar do perfil a desenhar-se;
  - janelas e notas a aparecer;
  - botões que reagem ao toque e cartões que se elevam ao passar o rato.
  
  Respeitam «Reduzir movimento» do sistema e das Definições; `S.cfg.animacoes=false` desliga tudo.
- **Navegação**: abrir uma turma na barra lateral leva ao Painel da Turma.
- **Painel da Turma**: ocupa toda a largura do ecrã.
- **Barra de topo** (computador e iPad deitado):
  - linha 1: título, contexto e ícones, com os ícones encostados à direita;
  - linha 2: ações.
- **Secundário e PROFIJ**: os resultados por domínio aparecem em valores de 0 a 20 (`pctD`) na Avaliação Final, na grelha e na análise dos instrumentos e no perfil. As ponderações continuam em %.
- **Efemérides mundiais**: a secção «Neste dia na história» do cartão do dia traz cerca de 80 datas (`EFEM_MUNDO`); desliga-se com `S.cfg.efemMundo=false`.
- **Concordância**: «1 escolhida».
- **Tema escuro**: tokens de cor indefinidos (`--bg2`, `--card`, `--bd`, `--pri`, `--fg`), que deixavam fundos claros no escuro, foram substituídos. Avatares de iniciais e editor de itens ficam legíveis.
- **Estilo Institucional**: os separadores mantêm o sublinhado, sem caixa arredondada.

## v0.45
- **O Meu Dia** (Início, cartão `#w-meudia`; pode ser arrastado e redimensionado). Mostra:
  - uma linha do tempo com as aulas do dia em todas as turmas, cada uma com sala, lição, tempo do bloco e estado do sumário (escrito, sem sumário ou falta), e os botões Sumário e Presenças (`aulaDlg`);
  - os intervalos de 30 minutos ou mais entre aulas, as reuniões e as avaliações marcadas nesse dia;
  - as matrizes a enviar (com o botão «Enviada»), as tarefas com prazo e as que estão em atraso (com caixa para as concluir) e os aniversários;
  - em destaque, a aula a decorrer (com o botão Sumário), a próxima aula com contagem ou a indicação de que as aulas acabaram, com os sumários em falta.
  
  Inclui uma barra de progresso do dia, os botões ‹ Hoje › para navegar entre dias e um campo para acrescentar tarefas a esse dia. O cartão atualiza-se a cada minuto e pode ser ocultado em Definições › Aparência (`S.cfg.meuDiaOff`).
- **Barra de topo adaptativa** (`barLayout`): quando cabe tudo numa só linha (título, ações, contexto e ícones), as ações ficam ao lado do título (`#bar.bar1`); se não couber, passam para uma segunda linha. Os ícones ficam sempre encostados à direita (`.icwrap`).
- **Cantos**: um só raio em toda a app (`--rA: 12px`, igual ao do botão «Novo Documento»). Os cartões e janelas têm 16 px, os botões dentro de caixas 9 px e as etiquetas 7 px.

## v0.46
- **Cor fixa por critério/domínio** (`domCor`): uma paleta de 10 cores atribuída pela ordem dos domínios, ou a cor escolhida em Critérios (`dominio.cor`). A cor aparece nas barras e etiquetas do Desempenho por Critério, nos cabeçalhos das tabelas (traço e texto), nos chips e seletores de itens, nos eixos do radar do perfil e nos gráficos dos Domínios.
- **Domínios por Período**, reconstruído com a tabela original mantida:
  - indicadores: média e mediana, positivas, dispersão, instrumentos;
  - gráfico de linhas animado da evolução da turma por instrumento e médias por período;
  - histograma (valores ou níveis) e comparação com os outros critérios;
  - fichas detalhadas do melhor aluno e do aluno que precisa de mais apoio: evolução face à média, diferença para a turma, intervalo, melhor e pior momento, acesso ao perfil;
  - alertas de maior progressão, maior descida e alunos abaixo do limiar;
  - na tabela, colunas Evolução (mini-gráfico com seta) e Posição;
  - valores em 0–20 no secundário e PROFIJ.
- **Relatórios individuais**: «Exportar Todos…» em três formatos.
  - Formatos: PDF único, um PDF por aluno, ou ZIP com um PDF por aluno (`zipCriar`, ZIP sem compressão; ficheiros «NN - Nome.pdf» dentro de uma pasta com o nome da turma).
  - No secundário e PROFIJ não há coluna de menção e a síntese aparece em valores («obteve 10,8 valores, um desempenho suficiente»).
  - Corrigido: o PDF ignorava o aluno escolhido (`UI.relAl` → `UI.relAluno`).
- **Produção Oral**: novo nome da antiga «Avaliação Oral»; o instrumento próprio já existente é renomeado.
- **Separadores e segmentos**: pílula suave na cor de destaque e um traço que cresce com animação.
- **Início**:
  - a coluna lateral deixa de ficar fixa no layout de 2 colunas, por isso já não fica por cima dos Favoritos e do cartão do dia;
  - o texto de «Neste dia na história» passa a ser maior.

## v0.47 — Avaliação intercalar · em branco ≠ zero · cores harmonizadas
- **Avaliação Intercalar** (`vIntercalar`): por momento definido no calendário (`intercalarPeriodos`), assiduidade P/D/A/FI/FJ/FD até ao fim do momento, menção (Apenas Descritiva…Muito Bom) com sugestão, «Sem avaliação», observação; Editar/Submeter individual ou todos; CSV e impressão. Guardado em `turma.interc[pN][aid]`.
- **Em branco ≠ zero**: por instrumento (`i.branco` = `pend` | `zero`); célula vazia tracejada, zero a vermelho, contador de pendentes; confirmação «Guardado às…».
- **Paleta dos critérios** gerada a partir da cor de destaque do estilo (`domPal`), em claro e escuro.

## v0.48 — Painel da Turma com mais resultados · editor de tipos
- Tabela de alunos do Painel: barra da classificação, **Por Domínio** (mini-barras com cor do domínio, ponto forte/a reforçar), **Evolução** (face ao período anterior; no 1.º, do primeiro ao último instrumento), **Posição** na turma, **vs. Turma** (diferença para a média; «= média»). Resumo: média, mediana, amplitude, melhor, mais dificuldades, maior subida/descida. Valores em 0–20 no secundário/PROFIJ e em pp no básico.
- **Tipos de instrumento** (Definições › Geral): editor em etiquetas a toda a largura — adicionar, renomear no sítio (atualiza os instrumentos existentes), arrastar para ordenar, contagem de uso (os usados não se removem), «Repor Predefinidos». `cfg.tipos` mantém o formato.

## v0.49 — Indicadores fiáveis · estilo SGE
- **Chamada por confirmar** (`aulaConf`): só as aulas com `sumario.cham` contam para a assiduidade (Painel, Intercalar — coluna PC —, gráfico semanal). `cham` é gravado ao guardar a aula depois de abrir as Presenças ou marcar faltas, em «Confirmar Chamada» (Modo Aula) ou no fecho de aula.
- **Estados de instrumento** (`instEstado`, `instAlunoEstado`): agendado, sem data, não realizado (`i.naoReal`), por classificar, parcial, incompleta, classificado; aluno que não realizou (`i.nr[aid]`) não conta como pendente. Coluna «Estado» nos Instrumentos; KPI de pendências discriminado.
- **Carimbo** (`pnlCarimbo`): `S._mod` (última alteração real, gravada só quando o JSON muda) e última sincronização (`nvL().ultimo` / `gsCfg().ultimo`).
- **Esquema e migrações** (`MIGRACOES`, `migrarDados`, `S.esquema`, `S.cfg.migracoes`): cópia em `KEY+'.premig'` antes de migrar; também corre ao importar/receber dados.
- **Estilo SGE** (`est-sge`): cabeçalho ciano, menu cinzento, separadores em caixa com seta, tabelas em faixas azuis com contraste ≥ 4,5:1; o corretor automático de contraste ignora o cabeçalho neste estilo.
- **Arredondamento**: opções em cartões com exemplos e simulador (`blocoArred`, `arrSimular`).
- **Juntar turmas**: numeração seguida por ordem alfabética com `aluno.numOrig` (n.º 1 (3)); `numAl()` em todas as listagens; «Numerar Seguido» em Alunos para conjuntas antigas.
- Avaliação Final com coluna «Intercalar».

## v0.50 — Turma comum, DT, CT, explicações, Modo Aula
- **Turma comum** (`classeKey`, `turmasIrmas`, `ligarClasse`, `sincComuns`): turmas com o mesmo nome e escola no ano formam uma classe; `aluno.cid` liga as cópias; `CAMPOS_COMUNS` sincronizados ao guardar (deteção por hash em `ano.alunosC[cid].h`). Migração 3.
- **Painel**: «A Minha Disciplina» / «A Turma Completa» (`vTurmaCompleta`) com classificação e faltas por disciplina, negativas, último contacto com o EE, CSV.
- **Dossiê do aluno** (`dossieAluno`): resumo, avaliação por disciplina e instrumento, assiduidade, contactos com o EE, medidas, tarefas e deliberações; cada registo com ligação à origem.
- **Contactos com o EE** (`contactoDlg`, `ano.alunosC[cid].contactosEE`): data, meio, assunto, síntese, compromisso, acompanhamento → tarefa (`tarefa.orig={tipo:'contactoEE',cid,cont}`).
- **Conselhos de Turma** (`ano.ctFotos`): fotografia automática ao passar a data de um CT/RA da turma, ou manual; «O que mudou» (`ctMudou`); «Preparação do CT» (`ctPreparacao`) com «Resolver».
- **Como foi calculado** (`explicarNota`, `explicarAssid`) no Painel e na Avaliação Final.
- **Pré-visualização do impacto** (`impactoCalc`, `impactoDlg`) ao apagar instrumento e ao mudar ponderação.
- **Modo Aula** (`vAula`) e **Fechar Aula** (`fechoAula`): `sumario.dif`, `sumario.prox` e `partida` na aula seguinte.

## v0.51 — Bloqueio do horário, enunciados, síntese automática, demonstração completa
- **Bloquear Horário** (`ano.horBloq`): sem arrastar, editar, importar ou apagar até desbloquear.
- **Anexos do instrumento** (`instrumento.anexos.enunciado|correcao = {id,nome,tipo,tam,q}`, ficheiro em `guardarDoc`): carregar/arrastar, abrir, substituir, remover; destaque ao criar um instrumento novo.
- **Síntese descritiva automática** (`sintesePers`, `S.cfg.sintAuto={modo,ext,assid,comp,recom,evol}`): frase global, pontos fortes/fracos por domínio, evolução, assiduidade das aulas confirmadas, atrasos e material, comportamento/participação, observação intercalar, recomendações por tipo de domínio. Modo «Modelos por menção» mantém os textos de Definições. Texto editado à mão prevalece.
- **Demonstração** (`criarDemo`): 6 turmas — 7.º A Inglês e Português (turma comum, DT), 9.º B, 10.º A (0–20), 11.º B/C conjunta (n.º original), PROFIJ II com UFCD — com instrumentos em todos os estados, enunciado, sumários, chamada, faltas, atrasos, material, ocorrências, intercalar, reuniões (CT, RA, departamento, grupo) com deliberações, contactos com o EE, tarefas, medidas, falta do professor e reposição e fotografia de CT.
- «Apagar Tudo» com progresso animado (`apagProg`); sublinhado dos separadores à largura do texto (`sublinharTabs`); `barLayout` com ResizeObserver; Intercalar com colunas automáticas; corrigido conflito de nomes `quando()` («Invalid Date»).

## v0.52 — Correções e linguagem pedagógica
- O Meu Dia: chave da aula (`turma|data|hora`) separada só no primeiro «|» — Sumário/Ver/Presenças voltam a abrir a aula.
- Síntese descritiva (`sintesePers`): tempos verbais coerentes (pretérito para o período, presente para recomendações), artigos e preposições corretos por domínio (`emDom`, `oDom`), estratégias no conjuntivo, envolvimento do EE nos casos de insucesso, mensagem final de incentivo; sem números, salvo «Indicar a classificação».
- Direção de Turma: página a toda a largura, separadores em várias linhas, «Classificações em Falta» por `instAlunoEstado`, contactos com o EE no histórico de diligências.
- Caber no ecrã: separadores do Dossiê, tabela dos Domínios (`.domt`), Avaliação Final (`.aft`), «Como foi calculado» com nomes completos.
- Tipos de instrumento com cor própria; Modelos de domínios com classes próprias (`.mdmc`, `.mdml`, `.mdmbar`) — corrigida a colisão com O Meu Dia; Desempenho por Critério com lista de turmas e cartões por critério.
- Demonstração: resultados diferentes por domínio.

## v0.53 — Ficha do aluno e síntese minuciosa
- Corrigido: a função `fichaAluno` do novo ecrã de Domínios (v0.47) tinha o mesmo nome da ficha do aluno e sobrepunha-a — passou a `domFichaAluno`. Verificação automática sem declarações duplicadas.
- Síntese (`sintesePers` v0.53): apreciação global; retrato por domínio agrupado por nível; ponto forte e domínio a reforçar; evolução por domínio face ao período anterior; assiduidade, pontualidade, material e participação; observação intercalar (exceto no último período); balanço do ano no último período; plano de estudo e trabalho com atividades concretas por domínio (`SINT_PLANO`, 3 variantes cada) e hábitos gerais; envolvimento do EE quando há insucesso; frase final de incentivo. As variantes rodam com o período (`_vs`), pelo que o texto do mesmo aluno não se repete entre períodos. Extensão «Completa» por omissão.

## v0.54 — Ficha de correção e correções
- **Ficha de correção** (`fichaCorrecao`, no topo da Análise do instrumento): melhor aluno e aluno com mais dificuldades, máximo/média/mínimo, tabela por pergunta (média, taxa de sucesso, % por responder, % com zero, % com negativa, com mapa de cores), distribuição global e por domínio (menções no básico, faixas 0–20 no secundário), itens da Produção Oral; animações respeitam «reduzir movimento».
- Anexos do instrumento maiores; `verFicheiro` abre modal de pré-visualização (PDF, imagem, texto).
- Separadores do instrumento com destaque (`.itabs`), Produção Oral antes da Análise.
- «Criar Outra Turma» temporário depois de criar uma turma (`UI.criarOutra`).
- Atualização automática do Início, Painel, Modo Aula, Sumários e DT ao fechar o registo de uma aula.
- Horário: limpeza garantida do «fantasma» do arrasto; aviso de dias em falta na importação (os ficheiros 11.º A e 11.º B exportados não têm segunda-feira).
- `autoTestes` reescrito: 18 casos (secundário e básico, menções, níveis, arredondamento, em branco/zero, não realizou).

## v0.55 — E-mail, horário clicável, apresentação e animações
- **Enviar por e-mail** o relatório individual (Relatórios › Enviar por E-mail…, Dossiê): ao EE e/ou ao aluno, a partir do e-mail institucional do professor na escola da turma (`emailDe(t)` = From/Reply-To e variável `{email}`). Três vias: Outlook/Microsoft 365 (Graph `sendMail`, permissão `Mail.Send`), Gmail (`gmail.send`) ou app de correio do dispositivo (partilha com anexo, ou descarregar + `mailto`). O envio vai diretamente do dispositivo ao fornecedor — não passa por servidores do EduFlow. Aviso de dados de menores e de `contactoAutorizado`; cada envio regista um contacto EE.
- Ficha do aluno: campos «E-mail do encarregado de educação» e «E-mail do aluno» (`emailAluno`, comum entre disciplinas da turma).
- O Meu Horário: tocar numa aula abre o sumário dessa aula na semana atual (`aulaDaSemana`).
- Grelha de classificação: valores limitados à cotação de cada item (e ≥ 0), com aviso e animação.
- Barra de topo alinhada com o conteúdo (`alinharBar`) e barra de ações centrada; no Início a barra Simples/Geral alinha com os cartões (`alinharDash`).
- Ano Letivo (Início): cartões das turmas num único grelha (`juntarTcards`), 4 por linha, com a oferta formativa em etiqueta e mini-gráfico no canto.
- Modo de apresentação corrigido em Fotografias, Avaliação Intercalar, Painel, Domínios, chamada da aula e aniversários (alunos ocultos desfocados; idade/processo escondidos com «dados sensíveis»).
- Definições › Geral: «Tipos de Tempo Não Letivo» passa para a coluna principal, depois dos Tipos de Instrumento. Perfis e Permissões com espaçamento e cores corrigidos (também no estilo SGE).
- Correções de estilo SGE, Dossiê, Aulas Dadas, data de nascimento e separadores do diálogo da aula.
- Mais animações (respeitam Reduzir Movimento / `a11y-rm`): ondulação nos botões, elevação dos cartões, contagem dos números (`contarNumeros`), entradas em cascata, «pop» nas caixas de seleção.

## v0.56 — Revisão completa (pronta para uso alargado)
Auditoria automática repetida a todo o código e a todas as secções:
- **Análise estática** (ESLint: variáveis não definidas, chaves duplicadas, código inalcançável, promessas, regex) e pesquisa de funções com o mesmo nome — sem erros.
- **Contas:** `autoTestes` passa a 30 casos (limites 49,5 % / 9,5 valores, negativas, ponderações, domínios sem dados); invariantes verificadas em todas as turmas, alunos e períodos (intervalos 0–100 %, nível coerente com a nota mostrada, cotações respeitadas). Dispersão = desvio-padrão populacional em todas as secções. Destaques de negativa usam o limiar 49,5 %, igual ao arredondamento.
- **Dados:** cópia de segurança exportada → importada sem diferenças; cópia encriptada (AES-GCM, PBKDF2 150 000) só abre com a palavra-passe certa; 15 cenários de dados danificados ou antigos abrem todas as secções sem erros; cópias parciais antigas são migradas (`migrarDados(true)`, sem gravar) antes de serem juntadas.
- **Segurança:** hash de palavra-passe `p2:` = PBKDF2-SHA-256, 210 000 iterações, sal por utilizador; hashes antigos convertidos no início de sessão (`verificarPasse`); bloqueio de 30 s após 5 falhas (`bloqAte`); `EduGest.ev` só existe em `file:`/localhost ou com `localStorage['edugest.debug']='1'`; interpolações de nomes de menções, domínios, instrumentos, reuniões e documentos passam por `esc()` (teste com 1100 campos contaminados: 0 execuções).
- **Interface:** contraste WCAG AA garantido por `a11yContraste` em todo o texto do conteúdo (exceto sobre gradientes), também nos botões principais; cabeçalho SGE `#0e7095`; sem transbordos nem erros em 29 secções × 7 estilos × claro/escuro × 390/768/1024/1440 px; painéis e janelas percorridos clique a clique.
- **Barra de topo:** `barLayout` + `barCompacto` + `alinharBar` mantêm tudo numa linha sempre que cabe.
- Correções: id duplicado `ma-pl` (o plano da aula não era guardado), janela de boas-vindas no telemóvel, rótulos acessíveis (datas de avaliação, campos da grelha sem a letra do género colada ao nome).

## v0.57 — Cabeçalho em grelha e UFCD lecionadas
- `cabecalho()` (dev-pc): `#bar.hgrid` com colunas explícitas `[título][escola] 1fr [ano][turma][ícones]` e ações (`#barx`) na linha 2 centradas, ou na linha 1 (`.hx1`) quando cabem. A coluna do título tem a largura que alinha a escola com a coluna principal do Início (`HCOL1`, medida em `.in-hero`) e é reutilizada nas outras secções. Níveis de compactação verificados por medição: `hcomp` (esconde rótulos), `hcomp2` (ícones 38 px, «Guardado» só com ícone, turma ≤170 px), `hcomp3` (esconde o ano letivo, < 1300 px); só depois encurta título/escola. `alinharBar` só aplica margens que não aumentem o aperto (`cabecalho.aperto`).
- Widget «Aulas de Hoje» retirado do Início (duplicava «O Meu Dia»).
- `ufcdSinc(u,on)`: UFCD/UC escolhidas em `ano.ufcds` entram (ou saem, se criadas automaticamente e sem instrumentos) em `t.modulos` das turmas com `Componente Tecnológica (UFCD/UC)`; sincronização inicial silenciosa; listadas em «Disciplinas que Leciono».
- **Componente Tecnológica (UFCD/UC)** (`ehUnid(t)`): cada módulo aparece na barra lateral como disciplina («UFCD 8517»), ao lado das outras disciplinas da turma; escolher uma chama `modEscolher` e liga automaticamente a separação por módulo (`modAtivar`, `t.porModulo`). Instrumentos num só cartão da unidade (`instPorUnid`), sem períodos; Avaliação Intercalar/Final e Domínios por Período redirecionam para a classificação por UFCD (`UNID_REDIR`) e ficam escondidos no menu. As restantes disciplinas (ex.: Inglês) mantêm a avaliação por período.

## v0.58 — Transferências de escola
- `aluno.movs[]` (campo comum a todas as disciplinas do aluno): `{id,tipo:'saida'|'regresso',data,escola,concelho,codigo,motivo,q}`. `foraEm(a,data)` = saída anterior sem regresso posterior; `depoisSaida(a,data)` para datas de instrumentos.
- `instAvaliado` ignora instrumentos com data posterior à saída (e anterior ao regresso): o aluno deixa de contar para médias e estatísticas depois da transferência; tudo o que existe antes mantém-se.
- `marcarTransferidos()` põe a cinzento (`.al-transf`) as linhas/cartões do aluno em todas as vistas, acrescenta a etiqueta «transferido(a) dd/mm · concelho» e bloqueia os campos de instrumentos posteriores.
- `transferirDlg(aid)` (ficha do aluno): registar saída (data, concelho com sugestões, escola, código, motivo), registar regresso, histórico com anulação.
- `relatorioTransferencia(aid)`: PDF para o novo professor com identificação, origem/destino, por disciplina (domínios × períodos, classificação, nível/menção, intercalar, instrumentos até à data, UFCD/módulos, assiduidade detalhada, sumários, síntese, observações), medidas DL 54/2018, percurso escolar e movimentos; aviso RGPD.
- Títulos da Componente Tecnológica só com o código («UFCD 8517»).

## v0.59 — E-mail, «não realizou», análise do enunciado, disciplina da aula
- **E-mail:** as definições do envio passam de `S.cfg.email` (que é o e-mail do professor) para `S.cfg.emailEnvio` — migração automática; `emailProf` só devolve texto. Endereços do EE/aluno e autorização RGPD (`contactoAutorizado`, `contactoAutorizadoEm`) editáveis no próprio diálogo de envio.
- **Não realizou:** `i.nr[aid]` = `'j'` (não imputável — não conta: `instAvaliado` devolve falso e a média do domínio faz-se com os restantes instrumentos) ou `'z'` (imputável — conta 0: itens em branco passam a 0, `i._nrZ` permite anular). Valores antigos `1` = não conta. Testes automáticos: 32.
- **Análise do enunciado** (`analisarEnunciado(paginas)`): reconstrói linhas a partir do texto do PDF (pdf.js, com posições), encontra a zona «COTAÇÕES/Mark Scheme» e reconhece: (1) «A1. 10 x 3 points» e «C1. 15 points»; (2) linhas de valores alinhadas com a linha de códigos acima (incluindo a letra da parte à esquerda, «CA1.», rótulos por extenso como «Competência Pragmática», «Parte 1»); (3) «D Produção e Interação Oral 50». Partes e domínios a partir dos títulos («Part A – Listening – COMPREENSÃO ORAL (25%)»): CO, CE, PE, PO. Compara a soma com o total; a parte oral «realizada em separado» vem desmarcada. Corre automaticamente ao anexar o enunciado (`anexoInst`), com diálogo de confirmação editável (substituir/acrescentar).
- **Transferidos:** fora da chamada do Modo Aula depois da saída; sem classificação nos períodos inteiramente posteriores à saída (`perFora`, `pctsFinal`/`pctsPer`); contagens «N alunos (+n transferidos)».
- **Disciplina de cada aula:** `ano.aulaDisc[turma|escola|chave] = idTurma` reatribui um tempo do horário a outra disciplina/UFCD da mesma turma; `listaAulas` move a aula e renumera as lições; o sumário e as presenças acompanham. Para a Componente Tecnológica, a UFCD fica em `sumário.modulo`.
- Ficha do aluno: separadores em várias linhas; retirados «Percurso Escolar» e «Portefólio».

## 0.60 — 4 nov 2026 · Ensino Profissional
- Só em turmas com oferta «profissional» (escola regular inalterada).
- Modelo por módulo/UFCD: Saber Estar 30 % (ER 10, AU 7, AC 8, RI 5; 18 indicadores 0–20, área = média arredondada) + Saber Fazer 70 % (2–10 elementos, soma validada; por omissão TP 40 + TE 30). Final = arredondamento às unidades; < 10 → Exame.
- Pauta do módulo, medidas compensatórias (Exame/Pendente), estatísticas por escalão, PDF «Grelha de Avaliação Final do Módulo».
- Ficha de Atitudes com síntese descritiva (bancos de frases por género formando × formador, 5 bandas).
- Trabalho Prático com 10 critérios (200 pontos); Teste Escrito convertido para 0–20.
- Importação do .xlsm «Grelha de Avaliação» (folha «Avaliação Final Modular», fichas individuais, grelhas TE/TP quando ligadas, medidas).

## 0.61 — 4 nov 2026 · Profissional: MRA, sem períodos, criação transversal, demo
- Medidas compensatórias: `medComp` = 'exame'|'pendente'|'nao'|'' (vazio = automático pelo MRA: `exame:'Sim'` na ficha → Exame; excesso sem ficha guardada → Pendente). Coluna MRA na pauta abre a ficha; mudar a medida atualiza `ficha.exame`.
- `ehUnid` inclui as turmas com oferta profissional: sem períodos (Avaliação/Intercalar/Critérios → Módulos; sem campo Período no instrumento; instrumentos sem módulo vão para o módulo da data).
- Importação transversal: disciplina nas lecionadas, projeto em `ano.projetos`, ano de formação deduzido, alunos partilhados com as outras disciplinas da turma.
- Demonstração: escola profissional extra com todas as vertentes.

## 0.62 — 4 nov 2026 · Ficha de correção, Produção Oral (profissional) e responsividade
- Teste Escrito (profissional): cartão «Preparar» (enunciado / estrutura rápida `profEstruturaTE` / itens à mão / só nota final `i.soFinal`); fichas individuais de correção em PDF (`profFichasPdf`).
- Línguas estrangeiras (profissional): `domOral` devolve o domínio do elemento «Teste Oral»; o instrumento chama-se «Teste de Produção Oral», item ligado à grelha (`oralLig`), conversão para 0–20.
- Responsivo: limite de 1200 px removido a partir de 1300 px (até 2400 px; acima de 2800 px centrado a 2560 px; zoom 1,3 em 4K a 100 %); telemóvel: separadores compactos, módulos em faixa horizontal, ações dos cartões em linha, anexos e `.modinfo` corrigidos, folhas A4 ajustadas (`ajustarFolhas`).

## 0.63 — 4 nov 2026 · Jornal Escolar consolidado + perfis de animação
- Módulo Jornal Escolar (vindo de outra versão de trabalho, integrado sobre a 0.62): vista `jornal` (Painel, Atividades do PAA, Calendário, Peças, Edições, Redação), importação do PAA (.docx), avisos, exportação .ics; desativável (`S.cfg.modulos.jornal=false`). Demonstração do Jornal (`criarDemoJornal`, só com o jornal do ano vazio).
- Perfis de animação `S.cfg.animPerfil` = 'sem' | 'min' | 'cheio' (predefinição: cheio); classes `anim-*` no `<html>`; «sem» liga `a11y-rm`; a Acessibilidade «Reduzir» prevalece.

## 0.64 — 4 nov 2026 · Estilo iOS 27, tema SGE, avisos e cargos do Jornal
- Estilo `ios27` (Liquid Glass) com `S.cfg.iosVidro` (0–100, transparente ↔ com cor → `--lg-a`).
- Tema SGE: campos legíveis nas faixas azuis, etiquetas `td::before` no telemóvel, estados das etiquetas, `#ctxEsc` com contraste ≥ 4,5.
- Avisos Urgentes: itens `g:'jornal'` no fim, em secção própria.
- Jornal: `jnOn()` = interruptor explícito (`S.cfg.modulos.jornal`) ou cargo com «jornal» em `perfil().porEscola[*].cargos` ou ano de demonstração. Novos cargos: «Coordenador(a) do jornal da escola», «Equipa do jornal da escola».

## 0.65 — 4 nov 2026 · Correções do tema SGE
- `select option` com cor e fundo próprios (claro/escuro) — corrige listas invisíveis no Windows.
- SGE: separadores discretos; `#barx` com largura do conteúdo; `#ctxEsc .escsw` com fundo arredondado; seletores nas faixas azuis com seta e campos sem cortes.
- PDF: blocos `{p, just:1, ind:1}` justificados (operador Tw) e com avanço da 1.ª linha; sínteses no ecrã com `text-align:justify;text-indent:1.5em`.

## 0.66 — 4 nov 2026 · Segurança
- Bloqueio: `localStorage['edugest.bloqueios']` = {login|pin: {n, ate, vezes}}; 5 falhas → 15 min; contagem no formulário; auditoria.
- Hash: `hashSenha` → `'a2:' + $argon2id$v=19$m=19456,t=2,p=1$…` (hash-wasm, MIT, embutido); alternativa `'p3:' sal:hash` PBKDF2-SHA-256 600 000. Conversão automática de `p2:`/SHA-256 e do PIN.
- Acesso: `turma.donos` = [utilizadores]; perfis com `verTodas`/`editarTodas`; perfil de sistema `direcao`. O ano letivo expõe `turmas` filtradas (getter) e `toJSON` devolve todas — o que se guarda/sincroniza continua completo. Turmas de outros em só leitura (`body.so-leitura`). Cópias de professores restritos: parciais, só as suas turmas e a sua conta.

## 0.67 — 4 nov 2026 · Convocatórias por e-mail e correções
- Arrastar/colar em qualquer sítio: `.msg` (CFB), `.eml` (MIME, QP/base64, cabeçalhos RFC 2047), `.ics`, `.txt`, `.html` e texto. `cvInterpretar` → {tipo:'conv'|'ativ', reTipo, titulo, data, ini, fim, local, link, turmas, ordem, convocante}; confirmação em `cvDlg`; grava em `ano.reunioes` (`origem:'email'`, tipo `ativ` para atividades) e opcionalmente no Jornal.
- `profRotulo()`/`profAssin()`: rótulos de assinatura com género (perfil › género ou nome).
- SGE: tabelas claras alternadas; correções de seletores, pesquisa e barra de ações; histogramas e eixos dos gráficos de linhas sem sobreposição.

## 0.68 — 4 nov 2026 · Arrastar do Outlook na web
- Largar dados de outras apps (não só ficheiros) em qualquer sítio: recolhe todos os tipos de `dataTransfer` (texto, HTML, JSON próprio do Outlook); se só vier o assunto, o diálogo pede para colar o texto e reinterpreta. Sobreposição «Largue aqui o e-mail». Botão «Colar E-mail…» nas Reuniões.

## 0.69 — Leitura das convocatórias/atividades (assinatura, pontos, turma, data/hora) e Notas/Ata completas
- `cvAssina(texto,de)`: procura o bloco após a fórmula de despedida (cumprimentos/atenciosamente/atentamente/saudações/obrigado), separa nome e cargo (qualquer ordem, ou «O Diretor de Turma, Nome» numa linha); recua para «O/A Presidente|Diretor|Coordenador…» + nome; por fim o remetente. Resultado «Nome (Cargo)» → convocante (reunião) / responsável (atividade).
- `cvOrdem`: só procura pontos após «ordem de trabalhos» ou com «ponto 1/um»; deteção sequencial ponto 1…20 (algarismo com `.`/`)`/`º`/`-`/`:` ou palavra um/dois/três…/primeiro…, «Ponto dois –», «dois)»), multilinha ou inline; «ponto único»; corta na despedida.
- `cvTurmaTxt`: «12.º B», «12ºB», «12B», «turma B do 11.º ano», «11.º B/C», PROFIJ, CEF/PIEF (ignora horas como «8.30h»). `R.turmaTxt` é mostrado no diálogo mesmo sem turma correspondente.
- `cvData`: dd de mês [de aaaa], dd/mm[/aa], hoje/amanhã/depois de amanhã, dia da semana; prefere datas futuras próximas de palavras-chave. `cvHoras`: intervalos «das X às Y», «X-Y», horas com h/H/:/.h/«horas», «da tarde».
- Título de atividade a partir de «intitulada «…»»; local truncado antes de «com a turma», «no dia», «pelas»…; sala/auditório/biblioteca reconhecidos sem preposição.
- `autoAlto(el)` + classe `textarea.autoalto`: Notas/Ata, ordem e texto colado crescem com o conteúdo (também ao abrir o painel).

## 0.70 — Novo nome EduSpruce e 5 logótipos
- Nome visível: **EduSpruce** (S Sumários · P Planeamento · R Registos · U Unidades · C Calendário · E Ensino). Substituído em título, marca (`Edu<em>Spruce</em>`), ecrã de entrada, PDF, notificações, ICS (PRODID), ajuda e manifesto embutido. Histórico de novidades anterior mantém o nome da época.
- **Mantido de propósito** (compatibilidade dos dados): chaves `edugest.*` do localStorage, IndexedDB `eduflow-ev`, ficheiro `eduflow-dados.json` (Google Drive), pasta `EduFlow` do OneDrive, verificação `nvCifrar('eduflow')` da nuvem e etiquetas internas.
- `EF_LOGOS` (sistema da v0.43) passa a ter 5 opções: `abeto` (predefinido), `livro`, `monograma`, `floresta`, `ramo` — cada uma com `svg`, `fav` (PNG 192) e `ios` (PNG 180). Escolha em Definições › Aparência › Logótipo da app (`S.cfg.logoApp`); valores antigos (`turma`, `pagina`) caem no Abeto.
- Ícones PWA do repositório e do manifesto embutido regenerados com o Abeto; `theme_color` do manifesto do repositório `#0f766e`.

## 0.71 — Sincronização multi-dispositivo completa + logótipo institucional
- `eduspruce-config.json` (raiz do site, opcional): `{microsoftClientId, googleClientId}` → `NV_CENTRAL`; `nvMsId()`/`nvGId()` usam o ID do utilizador ou o central. Cartão esconde o campo técnico quando há ID central. `msLogin` (entrada com M365) também usa o central.
- OAuth: `msLigar({silent,redirect,hint})` — pop-up aberto antes de qualquer `await` (gesto do utilizador) ou redirecionamento (iOS/standalone/pop-up bloqueado); estado `nvmsR…` + verificador PKCE em `localStorage['edugest.nuvem.auth']`; regresso tratado ao carregar (`msTroca`). Google: GIS no computador, fluxo implícito por redirecionamento no iOS (`nvgsR…`, `#access_token`); token Google guardado (`nvL().g`).
- Renovação: refresh falhado → `nvL().renovar=true` (ícone amarelo). Ao abrir a app, sem interação do utilizador, tenta `prompt=none` por redirecionamento (no máx. 1× por 30 min, `renTent`).
- `nvFetchRetry`: 4 novas tentativas (rede, 429 com Retry-After, 5xx). OneDrive: manifesto lido por metadados (eTag + downloadUrl) e escrito com `If-Match`; 412 → repete (`__nvCorrida`, até 3×). `navigator.locks` (`eduspruce-sync`) com reentrada.
- Algoritmo: partes enviadas numa passagem interrompida por corrida voltam ao `base` anterior (continuam por enviar); acertos de hash depois de aplicar dados recebidos obrigam a gravar o manifesto (`res._fix`); auditoria de "Edição" não é registada durante gravações da sincronização (`_semHist`); receber só auditoria não mostra aviso nem redesenha.
- `nvMontar`: escolhe o último ano letivo quando `anoAtivo` não existe (aparelho novo).
- Ícone `#nv-badge` em `.barico` (estados ok/pend/sync/renovar/falta/erro/offline). `pagehide` envia pendentes. `navigator.storage.persist()`.
- Ligar outro dispositivo: `#ligar=<base64url {p,ms?,g?,c}>` (sem dados nem chave).
- Teste ponta-a-ponta (`synct.py`): OneDrive simulado com rotas Playwright, dois contextos (computador por pop-up, iPhone 13 por redirecionamento), palavra errada, junção, conflito, corrida (ETag), expiração 24 h + renovação silenciosa, ficheiros ilegíveis na nuvem.
- Logótipo `monograma` predefinido (`#2f6ea5→#1c3f63`, ponto `#e3b448`, «S» em caminho vetorial Inter ExtraBold); ícones PWA regenerados; `theme_color #1f4e79`.

## 0.72 — Aparência institucional por defeito, Entrar com Google, novo ecrã de entrada, guias
- Predefinições aplicadas em `aplicarPrefs` quando o valor não existe: `tema:'light'`, `estilo:'institucional'` (também `ESTILO_DEF`), `acento:'azul'`, `logoApp:'monograma'`, `animPerfil:'cheio'`. Escolhas já feitas mantêm-se.
- Ecrã de entrada: sem a nota «admin/admin»; botão **Entrar com Google** (`gLogin`): GIS (pop-up) no computador, fluxo implícito por redirecionamento no iPhone/iPad (`nvglR…`), âmbitos `openid email profile`, userinfo OpenID; sessão `{tipo:'google'}` aceite em `pedirLogin`; domínio autorizado = `auth.google.dominio` ou `auth.ms.dominio`. Botões Microsoft/Google ativam-se quando `eduspruce-config.json` chega.
- Novo visual: fundo azul-marinho com padrão de abetos (SVG), painel `.lghero` com logótipo, lema e 4 funcionalidades (escondido < 980 px).
- Guias `nvGuiaMs()`/`nvGuiaG()` (Microsoft Entra admin center e Google Auth Platform, nov. 2026) com URI/origem desta app preenchidos e botões Copiar; `nvGuiaDlg()` no cartão da nuvem e na Ajuda; resolução de erros (AADSTS50011, AADSTS9002326, AADSTS700016, redirect_uri_mismatch, origin_mismatch, access_denied).

## 0.73 — Ecrã de entrada harmonizado
- `#login` em grelha centrada (440px | 520px, 560px acima de 1700px), cartão e `.lghero` alinhados ao centro com separador vertical; logótipo ao lado do nome (`.lgh-top`); abaixo de 980px só o cartão.

## 0.74 — Política de Privacidade e Termos de Serviço
- Páginas estáticas públicas `privacidade.html` e `termos.html` na raiz do site (mesmo estilo institucional, claro/escuro, imprimíveis). Ligações: rodapé do formulário de entrada (`.lglegal`), rodapé da barra lateral (`.verlegal`), cartão Privacidade (RGPD) em Definições › Dados (`legalLinks()`), entrada na Ajuda. URLs a usar nos ecrãs de consentimento: `https://eduspruce.app/privacidade.html` e `https://eduspruce.app/termos.html`.

## 0.82 — Sincronização sem esforço com Google
- `gLogin` pede também `drive.appdata`; o testemunho fica guardado para a sincronização (`gLigarDrive`, `nvGGuardar(t,exp,sc)`), `prov` passa a `google` se não havia outro.
- Assistente `nvAssist()` (dialog `.nvas`) ao entrar com Google sem chave: passo 1 conta/Drive, passo 2 criar ou escrever a palavra-passe (deteta `ef-manifest.json` na nuvem), passo 3 sincronizar; formulário com `autocomplete` username/new-password/current-password e `PasswordCredential` para o gestor de palavras-passe preencher noutros aparelhos. Tem prioridade sobre os «Primeiros passos». O ícone da nuvem sem chave abre o assistente.
- Ritmo: 6 s após cada alteração, a cada 60 s com a app visível, ao ganhar foco (>20 s desde a última).
- Google no computador: renovação silenciosa do testemunho (`prompt:""`) no primeiro toque quando faltam <5 min.
- Google Drive: a lista de ficheiros é refrescada em cada sincronização e quando um ficheiro não é encontrado (ficheiros criados noutros aparelhos).
- `nvMontar` escolhe também a primeira turma quando `turmaAtiva` não existe.
- Teste ponta-a-ponta `gsynct.py` (GIS e Drive simulados, computador + iPhone).

## 0.84–0.85 — Separador Sincronização e fiabilidade
- Definições › **Sincronização** (`defSync`/`bindSync`, painel `nvPainel()` com estado, fornecedor, conta, palavra-passe, automático, aparelhos, conflitos); Dados e Segurança mostra só um atalho. `nvLigado()` considera o ID central da Google.
- `nvFetchRetry` reescrito: 3 tentativas (0,5/1/2 s), mensagem com serviço, caminho e erro (`window.__nvRedeErro`).
- Fotografias/anexos: falha num ficheiro não interrompe a sincronização (`res.fotosFalha`). Google Drive: envio retomável para ficheiros > 4 MB.
- `nvRedirect()` normalizado (sem `index.html`, sempre com «/» final).

## v0.90 · Manual em PDF e Ajuda atualizada
- `manual/EduSpruce-Manual.pdf` (A4, 46 páginas): capa, índice, 19 capítulos + anexo para quem aloja; capturas com dados da demonstração. Gerado a partir de HTML (Inter, estilo institucional) com Playwright `page.pdf`.
- `MANUAL_URL`: relativo (`manual/EduSpruce-Manual.pdf`) no site; em file:// aponta para https://eduspruce.app/manual/….
- `ajudaAtualizar()` (idempotente, chamada no início de `vAjuda`): revê `comecar`, `sessao`, `dados`, `nuvem`, `nuvem2`, `nuvemcfg`, `aparencia`; remove `gsync` (substituído por `nuvem`); junta `manual`, `gentrar`, `convemail`, `instalar`, `seguranca`, `problemas`; ordem: manual, comecar, gentrar, instalar, resto.
- Cartão `.ajman` no cabeçalho da Ajuda com o botão Descarregar.

## v0.91 · Acesso, nuvem obrigatória, notificações e iPhone
- `eduspruce-config.json`: `acessoGoogle` (`aberto`|`dominio`|`lista`), `dominiosGoogle`, `contasGoogle` [{h: sha256("eduspruce:"+email minúsculo), papel}], `modoNuvem` (`opcional`|`obrigatorio`). Lido por `acCentral()` (cache `localStorage['es.cfgc']`).
- `acVerificar(email)` chamado em `gSessaoDe` (popup e redirecionamento): lista do site > domínio > lista local (`S.cfg.auth.gContas`) > aberto; devolve o papel. Sessões Google guardadas são revalidadas ao abrir.
- Definições › Conta e Acesso › «Quem Pode Entrar com Google»: lista local (e-mail, nome, perfil), estado «publicado/por publicar», exportação do JSON com hashes.
- Nuvem obrigatória: classe `body.nv-obrig`; login local só para `papel==='admin'`; assistente sem «Agora Não»; `#nv2-auto` bloqueado; `terminarSessao` → `sairNuvem()` (sincroniza, confirma pendentes, apaga localStorage/IndexedDB).
- Notificações: `sw.js` (notificationclick → postMessage {es:'ir',v,t} ou `?ir=&t=`; cache da app rede-primeiro). `ntMostrar` usa `registration.showNotification`; `ntTick` a cada 30 s (chaves enviadas em `es.nt.env`); `S.cfg.notif` (aulas/ante, sumario, resumo/resumoH, testes/testesH, urgentes, badge, silDe/silAte, fds); `navigator.setAppBadge`; `ntICS(45)`. Separador Definições › Notificações (`UI.defTab='notif'`).
- iPhone (≤640 px): `vInicioMovel()` (`S.cfg.inicioMovel!=='completo'`) e `vPainelMovel()` (`S.cfg.painelMovel!=='completo'`, `UI.pnmTab` at|al|ag).

## v0.92 · Sincronizar antes de sair · ecrã de arranque
- `nvPendenteAgora()` (faz `saveNow()` e vê `nvL().mod`), `nvSyncSaida()` (até 4 tentativas, espera `_nvBusy`); chamados em `visibilitychange→hidden`, `pagehide`, `beforeunload` (com aviso do navegador, exceto `__efApagar`/`__nvSemAviso`, p. ex. durante «Entrar com Google»).
- `terminarSessao` espera pela sincronização (máx. 20 s) com o ecrã de arranque e a mensagem «A guardar…»; se ficar algo por enviar pergunta antes de sair.
- `#splash` logo a seguir a `<body>` (CSS próprio `#splash-css`, aparece só após 250 ms, respeita «Reduzir movimento»); `esSplash(txt|false)`; retirado quando aparece o ecrã de entrada ou a primeira vista; mensagens aos 4 s e 15 s.

## v0.93 · Código de encriptação numérico
- `nvPinErro(a,id)`: só algarismos, `NV_PIN_MIN=8`, recusa repetições e sequências; com `data-letras="1"` aceita palavras-passe antigas (≥ 8 caracteres).
- `nvPinPrep()` nos campos `nvas-p1/p2`, `nv2-p1/p2`, `np-1/2`, `nv-pw1/2`: `inputmode` `none` em ecrãs tácteis (só o teclado da app) e `numeric` no computador, `pattern=[0-9]*`, remove não-algarismos; `.pinpad` 3×4 (apagar, 0, seguinte/confirmar) e «A minha palavra-passe antiga tem letras» quando é para desbloquear.
- A derivação da chave não muda (PBKDF2-SHA256, 210 000 iterações): códigos e palavras-passe existentes continuam válidos.

## v0.94 · Mudar o código de encriptação
- `nvMudarCodigo(antigo,novo,prog)`: confirma o código atual (deriva com `L.salt` e compara com `L.k`), sincroniza, guarda `nvL().rekey {salt,k,kOld}` e volta a encriptar cada `partes`/`fotos` do manifesto (decifra com a chave antiga; se já abrir com a nova, salta); no fim escreve `manifest.salt`/`chk` novos e `rekeyEm`. Retoma sozinho em `nvSincronizar` enquanto houver `rekey`.
- Noutro aparelho, «não corresponde» → apaga a chave local e abre o assistente para o código novo.
- `nvPinErro(a,id,novo)`: regras contra repetições/sequências só para códigos novos.
- `gLoginId` com reserva `ES_G_ID` em eduspruce.app; `gLogin` espera por `nvCentralCarregar()` se o ID ainda não chegou.

## v0.95 · iPad: menu lateral expansível
- Entre 701 e 1100 px a barra lateral é uma coluna de ícones (74 px). `#railTgl` (sob `.brand`), o toque no logótipo ou deslizar a partir da margem esquerda (< 28 px, > 48 px para a direita) chamam `railAbrir(true)`: `body.rail-aberta` mostra `#side` fixo com 288 px e os nomes, com `#railBg` por trás. Fecha ao escolher uma secção, tocar fora, Esc, deslizar para a esquerda ou sair da largura de iPad.
- Ajustes de layout no mesmo intervalo: `.esc-hero` em duas linhas, `.dhint` numa linha, `#view` com 20 px, `#barx` com deslocamento horizontal.

## v0.96 · iPad responsivo
- `body.dev-ipad.ori-l #bar`: uma linha (sem `#ctxAno`, que já aparece no caminho), `.escsw` ≤ 190 px, `#selTurma` ≤ 170 px, botões de 38 px; `#side` com 224 px.
- `body.dev-ipad.ori-p #bar`: título + botões na 1.ª linha, escola/ano/turma na 2.ª (`.brk`).
- `.lst td.act` sem texto (só ícones, `font-size:0`, nome acessível mantido), numa linha; em modo cartão (`tr.swp`) ocupa a linha inteira. `.pnks` em 6 colunas na horizontal, `auto-fit` 140 px na vertical; `.tabs` com deslocamento horizontal.

## v0.97 · Mudança de endereço para eduspruce.pt
- `ES_DOM='eduspruce.pt'`. Em `eduspruce.app` (e www), fora do regresso OAuth, a app faz `fetch('https://eduspruce.pt/eduspruce-config.json')` (CORS do GitHub Pages); se responder, mostra o ecrã de arranque, espera até 36 s que `nvL().mod` fique vazio (sincroniza) e faz `location.replace` para o mesmo caminho em eduspruce.pt. Se o .pt não responder (ainda não está no ar ou a rede bloqueia), fica no .app.
- O armazenamento local é por endereço: no .pt cada aparelho entra com Google e escreve o código; os dados vêm da nuvem. UID dos eventos .ics mantém `@eduspruce.app` para não duplicar no Calendário.
- `gLoginId`/`NV_CENTRAL.google` com reserva em `eduspruce.(pt|app)`.

## v0.900 · Bloqueio dos dados de base
- `_bloqBanAte` = agora + 5 s ao mudar de vista (`go`) e ao bloquear (`bloqAlternar(true)`); `bloqUI` só mostra `.bloqban` dentro desse prazo e depois esconde-o com transição.
- `bloqIrDef()`: abre Definições › Dados e Segurança e realça `#bloq-card`. Com o bloqueio ligado, `#bloqBar`/`#bloqNav` e o aviso «Dados Bloqueados» chamam `bloqIrDef`, já não desbloqueiam.

## v0.903 · Sincronização discreta e código uma só vez
- Debounce 2 s após `saveNow`, intervalo 30 s (visível, online). Em sincronizações automáticas (`_nvSil`), `toast` cala mensagens de sincronização (erros continuam) e `go(VIEW)` com dados recebidos é adiado enquanto houver um campo focado ou um diálogo aberto (`_nvGoPend`, aplicado no `focusout`), sempre com `manterPosicao`.
- `eskeep` = {e: e-mail Google, k, salt}: guardado a cada 10 s e antes de `sairNuvem`; `nvKeepRepor()` repõe a chave se a sessão Google for do mesmo e-mail (o assistente já não aparece). Apagado se a nuvem disser que o código não corresponde (mudado noutro aparelho).
- O assistente carrega sozinho em «Começar» 2,5 s depois do fim.

## v0.904 · Coord. PROFIJ e sincronização ao entrar
- Numeração: depois de 0.99 segue 0.900, 0.901, … até 0.999 (sem 1.0).
- `cpOn()` (cargo com «PROFIJ», `S.cfg.modulos.cprofij`, ou demonstração com turmas PROFIJ); vista `cprofij` (separadores painel · turmas · fpct · provas · cc · leg). Dados em `S.cprofij`: `leg[]` e `anos[anoId] = {ent[], fpct{"turma|formando"}, provas[], dts{}, man{"turma|formando":{componente:nota}}}`. Formando = `proc` ou `num|nome` normalizado; componentes via `compDe(disciplina)`; nota da disciplina = média dos UFCD (`notaMod`) ou `ponderada(pctsFinal)` / último período. Situação: «Em risco» se algum valor < 10; «Tudo ≥ 10» se componentes, FPCT e PAF existem e ≥ 10.
- `nvSyncGate()`: `#nvgate` cobre a app desde o arranque com sessão Google e chave; progresso real via `window.__nvProg` dentro de `nvSincronizar` (partes 0–80 %, ficheiros 80–100 %), mais avanço lento enquanto espera pela rede. Sem internet → «Continuar»; ligação expirada → «Renovar e Sincronizar» (gesto do utilizador); erro → «Tentar de Novo» ou «Continuar com os Dados Deste Aparelho».


## v0.909 · Matriz PROFIJ, planeamento anual, entrada rápida e modo de privacidade
- Separadores `matriz` e `plano` em `vCProfij` (`cpmMatrizHTML`/`cpmPlanoHTML`, `cpmBindMatriz`/`cpmBindPlano`). Cálculo em `cpmCalc(a,turma)`: dias de `ini`→`fim` (matriz ou calendário), tipo por dia (`let`, `fds`, `fer`, `int`, `fct`, `nl`, `fora`; `nasInt` conta interrupções como letivas), tempos/semana a partir das siglas do horário da turma, dadas até agora (+`aj`, ou `dadas` manual), previsão do dia em que se atingem as aulas (`ROUNDUP(horas/0,75)`), estado ok/curso/w/bad. Disciplinas que não chegam ao fim entram em `cpAtencao`.
- `cpmLerHorTurma(file)`: reaproveita `lerHorarioProfPdf` (grelha) e lê a legenda «Atividade / Nome do Professor» e «Dir. Turma»; guarda em `a.horarios[turma]` e `cpmGerar` cria as disciplinas (siglas conhecidas → nomes; horas sugeridas só como ponto de partida).
- Sincronização: `PROV.google._mapa` com cache `es.gids` {u: email, m: mapa}; 404 → refresca o mapa e repete. `nvNadaNovo()` (pedido `?fields=version` lançado no arranque em `window.__nvPre`) fecha a barra se o manifesto não mudou e sincroniza em segundo plano; senão a barra corre `nvSincronizar` com `__nvSemFotos` e `nvFotosFundo()` trata das fotografias depois. Paralelismo 12 (partes) / 10 (ficheiros).
- Privacidade: `S.cfg.privMin` (minutos; 0 = desligado; omissão 10). `privBloquear()` cria `#privlock` e `body.priv-on` esconde tudo o resto (incluindo `dialog`); `privDesbloquear()` usa `pedirPin()` quando há `pinHash`. Não bloqueia em ecrã inteiro, no login, na barra de sincronização nem no PIN.


## v0.910 · Quadros, atualização ao vivo, junção de conflitos, reposição
- Jornal › separador `quadros` (`mqVista`). Dados em `S.jornal.quadros`: [{id, nome, pai, cor, itens:[{id, t: nota|tarefa|link|imagem|coluna|quadro|titulo|cor, x, y, w, cor, pai (coluna), o (ordem na coluna), txt|tit|l|url|desc|fid|leg|hex|ref}], setas:[{id, de, para}]}]; a raiz é `raiz`. Imagens reduzidas a 1600 px em `FOTOS['mq:…']` (sincronizadas como os outros ficheiros). Texto das notas limpo por `mqLimpa` (lista branca de etiquetas). Histórico de desfazer em memória (60 passos).
- `nvSincronizar`: num conflito (a mesma parte mudou nos dois lados) lê a versão remota e grava `nvJuntar(antiga, recente)`; só cria cópia de conflito quando não é possível juntar (valores que não são objetos). Limitação: um registo apagado num aparelho pode voltar se o outro aparelho o tiver alterado ao mesmo tempo.
- Verificação ao vivo: `setInterval` 4 s → `nvSincronizar(false)` (caminho rápido: versão do manifesto) quando a app está visível, com sessão, chave e sem barra/privacidade.
- Reposição: `eduspruce-config.json` › `reposicoes:[{h, q}]` (h = SHA-256 de «eduspruce:»+e-mail, q = data da ordem). `repVerificar()` corre antes da barra de sincronização: confirma com o utilizador, apaga todos os ficheiros `ef-*` do appDataFolder (se ainda não houver `ef-reposto-<q>.json`), cria essa marca, limpa o aparelho e guarda `esrep` {h:q}.
- Cabeçalho: botão `#privBtn` antes da Ajuda; `ResizeObserver` nos ícones volta a arrumar o cabeçalho; antes de passar os botões para a 2.ª linha tenta esconder as etiquetas (`hcomp`); na 2.ª linha ficam alinhados à direita.


## v0.911 · Planeamento em grande e acertos de alinhamento
- `cpmAmpliar(v)`: com `UI.cpmFull` o cartão `.cpm-plano` passa para `#cpm-fullbox` (fora de `#view`, que tem transformações) e fica `position:fixed` no ecrã inteiro; `--cs` (tamanho das células, 22–64 px) calcula-se pela largura e altura disponíveis; sai com o botão, Esc, fim do ecrã inteiro ou mudança de secção.
- `dashRender`: no modo Geral o topo (seletor, pesquisa, ações, filtros) vai antes do cartão da escola, como no modo Simples.


## v0.912 · Ecrã ampliado
- `ecraAmplo({titulo, sub, el, acoes, aoFechar})`: cria `#ampv` (mesmo aspeto de `#perfilap`: `.pah` com «Fechar», `.pat`, ações; `.pab` com o conteúdo movido). Usado por `cpmAmpliar` (`UI.cpmFull`) e pelos Quadros (`UI.mqFull`); fecha com Esc, «Fechar» ou ao mudar de secção; volta a abrir sozinho quando a vista se redesenha.


## v0.913 · Planeamento inicial e pontos de situação
- `cpmCalc(a, turma, opt)`: `opt.ref` = primeiro dia «futuro» (tudo antes conta como previsto/dado); `opt.dadas` = valores de um ponto. Sem `opt`, usa o último ponto até hoje (`P0`) e soma as aulas do horário desde esse dia (`fonte:'estimativa'`). Cada linha tem `prev` (previstas até à data), `tot` (aulas do horário no ano), `fonte` (horario|ponto|estimativa|manual).
- `cpmPlanoIni` (ref = início das aulas): planeamento inicial; `M.plano = {em, R:[{id, nome, aulas, tot, fim, saldo}]}` quando fixado.
- `M.pontos = [{id, data, dadas:{discId:n}, obs}]`; `cpmPontoDlg` (dadas em branco = previstas), `cpmPontoVer` (relatório em `ecraAmplo`, impressão só do relatório com `body.amp-print`).


## v0.915
- SpruceNote: `S.sn.quadros` (migra de `S.jornal.quadros`), `snOn()` = `S.cfg.modSN!==false`, vista `sprucenote` (`vSpruceNote` → `mqVista` em `#sn-c`).
- `anoLimparTudo(a)` ao apagar o ano: `S.jornal.anos[a.nome]`, `S.cprofij.anos[a.id]`, tarefas/avisos com turma desse ano (cópia no lixo).
- `nvApagarTudo()`: apaga todos os ficheiros `ef-*` do appDataFolder e o armazenamento local.
- `bloqDetetar()`: isca de anúncio + pedido ao GIS; janela uma vez por sessão.
- Início: `.inlay.sem-fav/.sem-side`, `.in-main.ingrid{grid-auto-flow:row dense}`.


## v0.916
SpruceNote do Jornal (S.snj, UI.mqCtx); logótipo animado (S.cfg.logoAnim, LGA); zoom nas folhas A4 (UI.zm); PIN com variáveis --pin-* por tema; fotografias com .phdel; nvRedirect trata /app/ como raiz (eduspruce.app); página de apresentação em landing/.


## v0.917
Momentos: i.momento ('completo'|'dominio'), i.completo, i.poData, i.revData; sumários automáticos (s.auto). Oral: r.par; cfg padrão total 50 com man N4 10/N3 8/N2 6/N1 2 (oralMan50, migração _m50 só sem registos). Itens: it.opc (valores possíveis). UI.instAmp (vista ampla). Seletor de datas: S.cfg.dpNativo=true volta ao do sistema. Logótipos: EF_LOGOS.auto/sge/escuro/claro. JornalNote = S.snj.


## v0.918
Novos tipos no quadro: comentario (txt, aut, resp[], res), audio (fid), video (url|fid), mapa (lq, z), documento (tit, html), esboco (fid png), tabela (lin[][]), ficheiro (fid, nome, tam, tipo), traco (d, w, h, cor, esp). Lixeira em S.sn.lixo / S.snj.lixo (30 dias; itens, setas e quadros apagados).


## v0.919
Tema predefinido: sge (migração única _sge919: institucional→sge, logótipo monograma→auto). Verificação rápida da nuvem: GET files/{manifest}?fields=version a cada 1 s (só Google); sincronização completa só quando muda. window.__gsiBloq ativa o início de sessão por redirecionamento. EFEM (efemérides MM-DD) e CITAS no ecrã do código.


## v0.920
MSAI SGE: aluno.msaiSge[ação.categoria.item]={d:{disciplina:dataInício},outra}; reflete-se em aluno.medidas (medSgeAuto). TeacherSchedule: lerTeacherScheduleXlsx/lerTeacherSchedulePdf → mesma estrutura do horário do professor (aulas, naoLetivos, linhas). Perfil: ONDE[competência][patamar] com onde estou e como avançar.


## v0.921
Tarefas: S.todo[] com dia (O Meu Dia, ISO do dia), prio 'alta' = importante, prazo, lemb (datetime), lembFeito, rep (d|u|s|m|a), passos[{t,f}], lista (id em S.todoListas[{id,nome,cor}]), nota, turma, ord.


## v0.922
Pautas: CP().y.pautas[turma] (cabeçalho), y.fpct[turma|aluno].det={rel[],ent,cc}, S.cprofij.hist[aluno]={a1,a2,a3:{fsc,fc,ft,fp},cpaf}. Word gerado em OOXML (zipCriar) e PDF (DocPDF) com a mesma composição.


## v0.923
Ajuda: AJ_VISTA (tópico → ecrã); imagens em ajuda/<tema>/<ecrã>.webp ao lado da app; sem a pasta, o tópico mostra só o texto.


## v0.924
Sincronização com a Base de Dados EduSpruce (Supabase/PostgreSQL na UE, RLS por utilizador e contas autorizadas por hash; conteúdo encriptado AES-256-GCM no aparelho). Cores do horário da turma por disciplina (COR_DISC). Gráfico do relatório individual com distribuição uniforme.


## v0.925
Sincronização automática (Supabase): sessão automática com login_hint, migração do Google Drive com base:null, canal de tempo real na tabela eduspruce_sinal (trigger nas partes). Realce da barra lateral só com .hov (pointer real). #view[data-vista].


## v0.926
Animações da Ajuda (gifs-json) regeneradas a partir da demonstração; verificação por OCR sem nomes fora da lista da demonstração.


## v0.927
Cópia fria no Google Drive (gdFrio), apagar com confirmação APAGAR após verificar a base de dados; contas autorizadas (hash SHA-256) em eduspruce_autorizados com políticas de administrador; mqAjustarBarra.


## v0.928
calcMostrar (registo de cada chk), cartaoTestePopups redesenhado, esProgresso para a cópia fria, .privrow.


## v0.929
sbContasSincronizar pára após 42501/PGRST na sessão.


## v0.930
apple-touch-icon, favicon e ícones do manifesto (any + maskable) com o logótipo SGE; theme-color #1b93c6.


## v0.931
nvSyncGate ignorado com prov supabase e dados locais; nvAssist só com gesto do utilizador, senão sbLembrete; semSync; S.cfg.gdFrio; barBtns sem + Ano letivo quando não há ano; .lgemg em fluxo.


## v0.932
Modo só nuvem: shim de localStorage em memória para KEY/NV_CONF/mra.*, IndexedDB desligado, base:null ao abrir, esLimparAparelho, evidências como anexos encriptados, parte loc-mra; esCarregar sem portão; sw.js stale-while-revalidate.


## v0.933
pinOk (sha antigo + verificarSenha); avEstatistica; corTurma/pintarTurmas; body.vgeral; #view:has(.bloqban) campos só leitura; toque longo em qualquer parte do cartão.


## v0.934



## v0.935



## v0.936



## v0.937



## v0.938



## v0.939
Arrasto de cartões único (wgIniciar/wgAtivar/wgPosicionar/wgFim) com áreas .wgarea; S.cfg.menuModo auto|icones|completo (body.menu-ico, CSS clonado das regras ≤1100px); dpLer() para datas escritas; mpFixo() envolve as vistas de go._f para manter o scroll.


## v0.940
Incidente 11/11/2026: um iPad com uma versão antiga em cache e estado de sincronização antigo (prov google) escreveu por cima dos dados mais recentes. Correções: esAbrir0 força base:null e __esAbrirBD (partes só locais não sobem); sbIndiceOk; sbCopiaAntes; sw.js rede primeiro; SQL 0005 (histórico + versão mínima); recDrive.


## v0.941



## v0.942



## v0.943



## v0.944



## v0.945



## v0.946



## v0.947



## v0.948



## v0.949



## v0.950



## v0.951



## v0.952



## v0.953



## v0.954



## v0.955



## v0.956



## v0.957



## v0.958



## v0.959



## v0.960



## v0.961



## v0.962



## v0.963



## v0.964



## v0.965



## v0.966



## v0.967



## v0.968



## v0.969



## v0.970



## v0.971



## v0.972



## v0.973



## v0.974



## v0.975



## v0.976



## v0.977



## v0.978



## v0.979



## v0.980



## v0.981



## v0.982



## v0.983



## v0.984



## v0.985



## v0.986



## v0.987



## v0.988



## v0.989



## v0.990



## v0.991



## v0.992



## v0.993



## v0.994



## v0.995



## v0.996



## v0.997



## v0.998



## v0.999



## v1.000



## v1.001



## v1.002



## v1.003



## v1.004



## v1.005

