# Histórico de versões

O histórico detalhado de cada versão está em [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md). Resumo das versões mais recentes:

## 0.79
- Google Drive: corrigido «Method doesn't allow unregistered callers» (ligações antigas sem a permissão do Drive deixam de ser reutilizadas).

## 0.78
- Google Drive: mensagens claras para o erro 403 (API do Drive por ativar / permissão desmarcada) e novo pedido de consentimento quando falta a permissão.

## 0.77
- Ecrã de entrada: versão da app discreta ao lado do nome.

## 0.76
- Entrar com Google: permissões pedidas pelo nome completo, e-mail confirmado em vários serviços da Google e mensagem clara se a permissão do e-mail ficar desmarcada.

## 0.75
- Entrar com Google sempre visível; sem ID de cliente, explica o que falta e liga ao guia.
- Logótipo para descarregar em `docs/logotipo/` (SVG e PNG, claro/escuro, monocromático).

## 0.74
- Política de Privacidade (`privacidade.html`) e Termos de Serviço (`termos.html`) públicos, com ligações no ecrã de entrada, na barra lateral, nas Definições e na Ajuda.

## 0.73
- Ecrã de entrada harmonizado: cartão e apresentação centrados lado a lado, com separador e logótipo junto ao nome.

## 0.72
- Aparência por defeito: tema Claro, estilo Institucional, azul, logótipo Monograma, animações completas.
- Entrar com Google (também no iPhone/iPad); ecrã de entrada sem utilizador/palavra-passe iniciais.
- Novo ecrã de entrada institucional (azul-marinho, abetos, apresentação das funcionalidades).
- Guia de configuração pormenorizado (nov. 2026) para Microsoft Entra e Google Auth Platform, na app e em docs/guias.

## 0.71
- Sincronização em computadores, iPad e iPhone testada de ponta a ponta: IDs centrais em `eduspruce-config.json`, início de sessão por redirecionamento no iPhone/iPad, renovação automática da ligação, ícone de estado na barra, ligar outro dispositivo por link, ETag no manifesto, novas tentativas, bloqueio entre separadores.
- Corrigido: ano letivo por escolher num aparelho novo; auditoria sempre por enviar; perda de alteração quando dois aparelhos sincronizavam ao mesmo tempo.
- Logótipo Monograma predefinido com as cores do tema Institucional.
- Corrigido: sublinhado duplicado nos separadores (Institucional); Primeiros passos legíveis.

## 0.70
- A app passa a chamar-se **EduSpruce** (Sumários, Planeamento, Registos, Unidades, Calendário e Ensino).
- 5 logótipos à escolha em Definições › Aparência: Abeto, Livro, Monograma, Floresta e Ramo; novos ícones da app.
- Os dados guardados não mudam (chaves internas e pasta «EduFlow» do OneDrive mantêm-se).

## 0.69
- Convocatórias/atividades: quem assina (convocante/responsável), ordem de trabalhos a partir do ponto 1, turma, data e hora mais robustas.
- Notas/Ata e caixas de texto crescem para mostrar o texto todo.

## 0.68 — 4 nov 2026
- Arrastar mensagens da lista do Outlook na web para qualquer sítio da app; colar o texto completo no próprio diálogo; botão «Colar E-mail…».

## 0.67 — 4 nov 2026
- Convocatórias e atividades por e-mail (arrastar/colar .msg, .eml, .ics, texto) com marcação no calendário; assinaturas com género; tema SGE mais legível; gráficos sem sobreposições.

## 0.66 — 4 nov 2026
- Segurança: bloqueio de 15 min após 5 tentativas falhadas, palavras-passe e código com Argon2id, perfis de acesso às turmas (Professor / Direção / Administrador).
- Inclui hash-wasm (argon2) — MIT © Dani Biro.

## 0.65 — 4 nov 2026
- Listas de seleção legíveis no Windows; tema SGE com separadores discretos e barra de ações compacta; síntese descritiva justificada e com avanço (ecrã e PDF).

## 0.64 — 4 nov 2026
- Estilo «iOS 27» (Liquid Glass com controlo de transparência); tema SGE corrigido; avisos do Jornal numa secção própria; módulo Jornal ativado pelo cargo.

## 0.63 — 4 nov 2026
- Jornal Escolar consolidado (PAA .docx, peças, edições, redação, calendário, avisos) e incluído na demonstração.
- Perfis de animação: Sem · Minimalista · Cheio de Animações.

## 0.62 — 4 nov 2026
- Ensino profissional: ficha de correção do Teste Escrito (preparar itens, fichas individuais em PDF) e Teste de Produção Oral com a grelha da Parte D nas línguas.
- App mais responsiva: largura total em ecrãs largos e 4K, ajustes para telemóveis e tablets.

## 0.61 — 4 nov 2026
- Ensino profissional: medidas compensatórias ligadas ao MRA, avaliação só por módulo/UFCD (sem períodos), criação transversal na importação, demonstração com escola profissional.

## 0.60 — 4 nov 2026
- Ensino profissional: avaliação por módulo/UFCD (Saber Estar 30 % + Saber Fazer 70 %), ficha de atitudes com síntese descritiva, pauta do módulo com medidas compensatórias e PDF, importação da «Grelha de Avaliação» (.xlsm).

## 0.59
- Análise automática do enunciado (PDF/Word): itens, cotações e domínios propostos a partir da tabela de cotações.
- «Não realizou»: não imputável (não conta) ou imputável (conta 0).
- Disciplina/UFCD de cada aula quando a turma tem várias; transferidos fora da chamada e dos períodos seguintes.
- Envio por e-mail corrigido (remetente) com endereços e autorização RGPD editáveis no próprio envio.

## 0.58
- Transferências de escola: saída (escola, concelho, data), regresso, histórico; aluno a cinzento depois da saída sem perder notas nem percurso.
- Relatório de Transferência (PDF) completo para o novo professor.

## 0.57
- Cabeçalho redesenhado em grelha: escola alinhada com a coluna principal, adaptação por passos sem sobreposições.
- UFCD/UC escolhidas contam como lecionadas e entram nas turmas da Componente Tecnológica.
- Retirado o cartão «Hoje» (duplicava «O Meu Dia»).
- Cada UFCD/UC aparece como disciplina na barra lateral; avaliação da Componente Tecnológica por unidade, sem períodos.

## 0.56
- Revisão completa: análise estática, 30 testes de cálculo, cópias de segurança verificadas, 15 cenários de dados danificados, todas as secções em 7 estilos × claro/escuro × 4 larguras.
- Segurança: palavras-passe com PBKDF2 (conversão automática), bloqueio de tentativas corrigido, proteção contra HTML malicioso em nomes.
- Contraste WCAG AA, barra de topo numa linha, correções no Modo Aula e no telemóvel.

## 0.55
- Enviar o relatório individual por e-mail (Outlook, Gmail ou app do dispositivo) a partir do e-mail institucional do professor; nada passa por servidores do EduFlow.
- O Meu Horário: tocar numa aula abre o sumário da semana; cotação máxima por item na grelha.
- Cartões das turmas 4 por linha; barras de topo alinhadas e centradas; modo de apresentação corrigido em mais secções; Perfis e Permissões revistos; mais animações.

## 0.46
- Cor fixa por critério; Domínios por Período com gráficos, estatísticas e fichas do melhor aluno e do que precisa de mais apoio.
- Relatórios: exportar PDF único, um por aluno ou ZIP.
- «Avaliação Oral» passa a «Produção Oral»; novo destaque dos separadores.

## 0.45
- «O Meu Dia» no Início: linha do tempo das aulas, reuniões, avaliações, tarefas e aniversários do dia.
- Barra de topo adaptativa e cantos iguais em toda a app.

## 0.44
- Animações subtis em toda a app; efemérides mundiais; notas 0–20 por domínio no secundário/PROFIJ.
- Abrir turma leva ao Painel; barra de topo uniforme; correções do tema escuro e do estilo Institucional.

## 0.43
- Novo logótipo «Turma Ligada», com alternativa «Página com Visto» escolhível na app.
- Primeiros passos num guia que abre na primeira utilização.
- Versão na barra lateral sempre atualizada; correções no tema escuro e na barra de topo.

## 0.42 — EduFlow
- O nome volta a ser EduFlow, com o logótipo do livro e da onda.
- Novidades na app organizadas por versão.
- Manifesto e ícones para instalar como app.

## 0.41 — Interface por dispositivo
- Interfaces próprias para computador, iPad e telemóvel, com deteção automática e mudança ao rodar o ecrã.
- Telemóvel: barra de separadores inferior, tabelas em fichas, gaveta em ecrã inteiro.
- iPad: alvos de toque de 44 px, barra lateral compacta, barra de ações fixa.

## 0.40
- Regimes de classificação: Ensino Básico Regular (%, níveis 1–5, menções) vs Secundário · PROFIJ · Profissional (0–20, sem menções).

## 0.39
- Escalas e arredondamento configuráveis; tabela de conversão % → nível.
- Painel da Turma; evidências (fotografia, áudio, ficheiros); notas flutuantes.
- Perfis de utilizador e permissões; estilos de interface; «Apagar Tudo (100 %)».

## 0.38
- Auditoria geral: arredondamento único, oralidade pendente, validação de classificações, rede de segurança nas vistas.
- Avaliação oral por momentos com cotações globais ou por momento; análise exaustiva dos instrumentos.

## 0.37
- Sincronização cifrada com OneDrive e Google Drive; entrada com Microsoft 365.
- Avaliação por módulos (profissional), MRA integrado, horário semanal, itens em árvore até 4 níveis.## [0.54] — 2026-11-04
### Adicionado
- Ficha de correção dos testes com estatísticas por pergunta e por domínio; pré-visualização de enunciados num modal; «Criar Outra Turma».
### Corrigido
- Verificação dos cálculos; fantasma do arrasto no horário; caixa da chamada esticada; contorno do título; atualização após registar aulas.

## [0.53] — 2026-11-03
### Corrigido
- Botão «Ficha» do aluno não abria.
### Melhorado
- Síntese descritiva minuciosa: domínios, evolução por domínio, balanço anual, plano de estudo e trabalho; sem repetições entre períodos.

## [0.52] — 2026-11-03
### Corrigido
- Botões do «O Meu Dia» não abriam a aula; sobreposição nos modelos de domínios; tabelas que não cabiam (Domínios, Avaliação Final, Dossiê, Como foi calculado).
### Melhorado
- Síntese descritiva em português padrão e linguagem pedagógica; Direção de Turma; Desempenho por Critério; cores dos tipos de instrumento; demonstração com domínios diferenciados.

## [0.51] — 2026-11-03
### Adicionado
- Bloquear o horário; enunciado e critérios de correção nos instrumentos; síntese descritiva automática e personalizada.
- Demonstração com 6 turmas e exemplos de todas as funcionalidades.
### Melhorado
- «Apagar Tudo» com barra de progresso; separadores com sublinhado à largura do texto; cabeçalho adaptável; Intercalar sem colunas partidas.
### Corrigido
- «Invalid Date» na próxima aula.

## [0.50] — 2026-11-03
### Adicionado
- Turma comum às disciplinas (dados pessoais, EE e medidas partilhados) e vista «A Turma Completa» no Painel.
- Dossiê do aluno e registo estruturado de contactos com o EE, com tarefas de acompanhamento.
- «O que mudou desde o último CT?», fotografias por CT e lista de preparação do CT.
- «Como foi calculado» para assiduidade e classificações; pré-visualização do impacto ao apagar instrumentos e mudar ponderações.
- Modo Aula e fecho de aula em 30 segundos.

## [0.49] — 2026-11-03
### Adicionado
- Chamada por confirmar; estados de avaliação (agendado, não realizado, por classificar, incompleta…); última alteração real e sincronização.
- Versão do formato dos dados com migrações controladas e cópia prévia.
- Estilo SGE; arredondamento com simulador; juntar turmas com numeração seguida e n.º original entre parênteses.

## [0.48] — 2026-11-03
### Adicionado
- Painel da Turma: barra da classificação, resultado por domínio, evolução, posição, diferença para a média e resumo da turma.
- Editor de tipos de instrumento em etiquetas (renomear, ordenar, contagem de uso, repor predefinidos).

## [0.47] — 2026-11-03
### Adicionado
- Avaliação Intercalar por momento definido no calendário.
- Distinção entre classificação em branco e zero; confirmação de gravação.
### Alterado
- Cores dos critérios harmonizadas com a cor de destaque do estilo.


