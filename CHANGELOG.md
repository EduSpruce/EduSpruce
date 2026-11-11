# Histórico de versões

O histórico detalhado de cada versão está em [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md). Resumo das versões mais recentes:

## 0.961
- cl
- Definições › Dados: exportar app offline para cópias de segurança

## 0.960
- cl
- Fotografias inteiras em todas as vistas

## 0.959
- cl
- Chamada com fotografias ajustáveis

## 0.958
- cl
- Relatório individual com autoavaliação e assinatura digitalizada

## 0.957
- cl
- Alunos: tamanho das fotografias ajustável (+/−)

## 0.956
- cl
- Barra de topo sem o seletor de turma

## 0.955
- cl
- Alunos: cabeçalhos e valores centrados

## 0.954
- cl
- Entrada: deteta bloqueadores que alteram os pedidos

## 0.953
- cl
- Entrada: diagnóstico mais completo

## 0.952
- cl
- Entrada: verificação da conta mais robusta e com diagnóstico

## 0.951
- autorizado(): nova tentativa após renovar a sessão e erro detalhado

## 0.950
- autorizado(): nova tentativa após renovar a sessão e erro detalhado

## 0.949
- Entrada por e-mail e palavra-passe (Supabase signInWithPassword) e definição da palavra-passe de reserva (updateUser)

## 0.948
- Gravação recusada (42501) deixa de ser tratada como conta não autorizada; aviso #essemgrav com o detalhe; abertura só de leitura
- SQL 0007: regras de gravação repostas e histórico que nunca bloqueia

## 0.947
- Regresso do OAuth: cortina por cima do ecrã de entrada até abrir; erros continuam a aparecer no formulário

## 0.946
- Cortina de entrada com saída garantida (login, erro, 12 s) e removida ao terminar sessão

## 0.945
- sw.js v4: navegação com carimbo no endereço e no-store; ao ativar recarrega as janelas
- versao.json + esVerNova() (verificação de versão e recarga única)

## 0.944
- Importar do Outlook: olHub (colar, ICS link/ficheiro, Microsoft Graph Calendars.Read/Mail.Read com ID de aplicação próprio)

## 0.943
- Digitalização de testes (digit.js): captura página a página, envio selado (linhas ef-f-dg-*, só criar/ler), vista em livro, verificação SHA-256
- SQL 0006: a base de dados recusa alterar/apagar páginas digitalizadas

## 0.942
- Autoavaliação v2 (papéis anuais, código pessoal, recusas/duplicados, sugestões)
- Anos letivos sem nomes repetidos + juntar
- Início sem seletor de turma
- Bloqueio: aviso de 1 s + modal
- Tarefas: aumentar
- Entrada: cortina e sessão caducada confirmada antes
- theme-color = cor da barra
- manterPosicao não puxa o scroll; toque só vigiado nos cartões

## 0.941
- Menu só ícones: sessão/tema compactos, tema num só botão
- Recolher menu: só ícone no fundo
- #barmais reaproveitado; sem animação de entrada nos botões da barra

## 0.940
- Correção: ao abrir, a BD manda (base:null, sem subir restos locais); índice protegido
- Cópias automáticas ef-f-bk-* antes de apagar/substituir (30 dias)
- sw.js: rede primeiro na navegação (v3)
- SQL 0005: histórico eduspruce_partes_hist + versão mínima 0.940 (cabeçalho x-es-ver)
- Recuperar cópia do Google Drive (comparar e repor)
- Cópia diária automática ao Drive suspensa

## 0.939
- Início: novo motor de arrasto (rato/toque/teclado) para qualquer área designada; chaves de posição estáveis
- Menu lateral só com ícones em PCs pequenos, escolha do utilizador (S.cfg.menuModo)
- Seletor de datas: escrever a data; rato não bloqueia o campo
- Re-desenho das vistas mantém o scroll (mpFixo)
- Autoavaliação: botões no Painel e na Avaliação; «Perfil de Aprendizagem»

## 0.938
- cl
- Ícone de sincronização removido no modo base de dados

## 0.937
- cl
- Modo base de dados: sessão Supabase como sessão da app; chave da conta guardada na conta (conta-chave) e entregue a cada aparelho; arranque com lerDados; autoavaliação dos alunos (aluno.html, SQL 0004) cifrada com chave derivada do código

## 0.936
- cl
- barx do iPad com fundo do painel, desfoque, botões 44 px em pílula; margem negativa do tema anulada; nffab acima da barra

## 0.935
- cl
- Auditoria automática de 29 vistas em 4 formatos; CSS tlm/ipad com especificidade acima do tema; cartões alst; barx flex-start + scroll; cores TIPOS_DIA no calendário de avaliações e cpm-cal

## 0.934
- cl
- Arrastar cartões: alvo encontrado mesmo com cartões dentro de invólucros; calendário sem conflito com a classe .aula; anoBadge com cor da turma; botão Perfil no dossiê

## 0.933
- Códigos verificados com o mesmo método em todo o lado
- Janela do código centrada
- Estatística da turma na Avaliação Final
- Chamada maior e responsiva
- Pesquisa e filtros alinhados
- Produção Oral sem instrumentos marcados
- Cor por turma
- Menu da turma fecha fora da turma
- Campos bloqueados não editáveis
- Mover cartões com toque longo
- Fotografia do relatório menor

## 0.932
- Dados só na base de dados (memória + Supabase), migração e limpeza da cópia local
- Entrada imediata sem ecrã de espera; service worker abre a partir da cópia
- Sem animações de entrada
- Contadores a 0 escondidos
- Código de encriptação: layout
- Campos de data uniformes
- Cartão Hoje: padding

## 0.931
- Sem ecrã de sincronizar com a base de dados (dados locais + tempo real)
- Lembrete em vez do assistente ao entrar
- Opção Não Sincronizar
- Estado da cópia fria partilhado entre aparelhos
- Sem botão repetido de ano letivo
- Padding do botão Administrador no ecrã de entrada

## 0.930
- Ícone da app (Mac, iPad, iPhone, Chrome) com o logótipo SGE

## 0.929
- Contas na base de dados: sem tentativas repetidas quando o script SQL falta

## 0.928
- Verificar os Cálculos: lista de todos os testes
- Avisos em Pop-up: cartão redesenhado
- Cópia no Google Drive: progresso real
- Código de Acesso: espaço e linha antes do modo de privacidade

## 0.927
- Google Drive como cópia fria opcional (manual/diária) e apagar dados do Drive
- Contas autorizadas sincronizadas com a base de dados (só o administrador)
- SpruceNote: barra mostra todos os elementos quando cabem
- Mensagem clara quando a entrada na base de dados falha

## 0.926
- Ajuda: animações substituídas por gravações só com dados de demonstração (as anteriores mostravam nomes reais)

## 0.925
- Base de dados: entrada automática, migração automática do Drive, tempo real
- Minhas Tarefas: sem moldura dupla nos campos (SGE)
- Barra lateral: realce de hover controlado pelo rato real
- Reuniões: separadores centrados

## 0.924
- Base de dados EduSpruce (Supabase, UE) como fornecedor de sincronização; versão anterior em /old
- Horário da turma: cores por disciplina bem separadas; estilo SGE
- Gráfico do relatório individual distribuído por toda a largura

## 0.923
- Ajuda com capturas por tema (175 capturas em ajuda/<tema>/)

## 0.922
- Pautas oficiais PROFIJ (FPCT e CFC, final e detalhada) em Word e PDF
- Cálculo da FPCT, CFA e CFC como nos Excel da escola
- Importação do histórico/média detalhada (xlsx)

## 0.921
- Minhas Tarefas ao estilo do Microsoft To Do (listas, O Meu Dia, Importante, Planeado, passos, lembretes, repetição, notas, listas próprias)

## 0.920
- Catálogo MSAI do SGE (Data de início · Ação · Disciplina) na ficha e no Quadro MSAI
- Importação do TeacherSchedule (xlsx e pdf) para O Meu Horário
- Onde Estou e Como Avançar com patamares, passos e metas

## 0.919
- Tema SGE predefinido
- Sincronização ~1 s e à prova de bloqueadores (início de sessão por redirecionamento automático)
- Efemérides e citações no ecrã do código
- Botão «Mais» no cabeçalho
- Lista de turmas responsiva
- Ícones únicos na barra lateral
- Página de apresentação no estilo SGE

## 0.918
- SpruceNote/JornalNote: comentário, áudio, vídeo, mapa, documento, esboço, tabela, enviar ficheiros, desenho livre
- Menu ••• com os elementos extra
- Lixeira com recuperação (30 dias)

## 0.917
- Momento de Avaliação Completo e por domínio (PO ligada na aula seguinte, revisões na anterior)
- Produção Oral: pares, nomes abreviados, cotação padrão 50
- Notas possíveis por item (lista na grelha, leitura dos critérios de correção)
- Vista Ampla nos instrumentos
- Seletor de datas próprio
- Logótipos SGE, Clássico (escuro), Claro e Automático
- JornalNote separado do SpruceNote
- Política de privacidade atualizada (dados só na nuvem do professor)

## 0.916
- SpruceNote do Jornal (quadros próprios do jornal)
- Logótipo animado configurável
- Zoom e modos de página nos relatórios
- Ecrã do código por tema, responsivo
- Caixote do lixo nas fotografias
- Correções no tema SGE e no gráfico de distribuição
- Página de apresentação em landing/ (também na raiz de eduspruce.app)

## 0.915
- SpruceNote como módulo opcional (S.sn.quadros, migrado de S.jornal.quadros)
- Início em largura total, colunas vazias recolhidas, grid-auto-flow dense
- Apagar ano letivo limpa jornal/cprofij/tarefas/avisos desse ano
- Recomeçar do zero (apagar nuvem + aparelho)
- Aviso de bloqueador de anúncios
- Barra lateral, intercalar por turma, conselho por n.º antigo, Esc nos avisos, vários acertos de interface

## 0.913
- Coord. PROFIJ: Planeamento Inicial (calculado e fixável) e Pontos de Situação datados com aulas dadas reais, desvio e previsão até ao fim.

## 0.912
- «Aumentar» no Planeamento Anual e nos Quadros abre um ecrã próprio ao estilo do Perfil de Aprendizagem (`ecraAmplo`).

## 0.911
- Planeamento Anual: botão «Aumentar» (ecrã inteiro, células à medida do ecrã; Esc para sair).
- Início: seletor Simples/Geral sempre por cima do cartão da escola; lupa da pesquisa corrigida.
- Barra lateral: rodapé alinhado; texto conforme a sincronização.

## 0.910
- Jornal Escolar › Quadros (quadro visual: notas, listas, ligações, imagens, colunas, títulos, cores, setas, quadros dentro de quadros; desfazer/refazer, zoom, dois dedos).
- Atualização ao vivo entre aparelhos: verificação da nuvem a cada 4 s com a app à vista (1 pedido pequeno).
- Conflitos resolvidos automaticamente: `nvJuntar` junta os dois lados (listas por id, objetos campo a campo, valor mais recente nos campos iguais).
- Botão do modo de privacidade no cabeçalho (Ctrl+Shift+L).
- Ordem de reposição pelo administrador (`reposicoes` no `eduspruce-config.json`), cumprida uma vez por conta, com marca na nuvem.
- Coord. PROFIJ: horário da turma em Excel, UFCD em sequência, ligação ao calendário, TIC na Sociocultural.
- Mais animações no perfil «Cheio»; cabeçalho e lista de alunos mais responsivos; seta nos cartões que abrem.

## 0.909
- Coord. PROFIJ › **Matriz e Ponto de Situação**: matriz curricular por componente (horas → aulas de 45 min, dadas pelo horário e calendário, ajuste/valor manual, diferença, tempos por semana, previsão de conclusão), resumo por professor, FPCT (período, horas possíveis vs. exigidas), CSV e impressão com «O Coordenador do PROFIJ».
- Coord. PROFIJ › **Planeamento Anual**: grelha mês × dia (geral, por disciplina ou por professor) com feriados, interrupções, FPCT, última aula e dias já concluídos.
- Importação do **Horário da Turma em PDF** (grelha + legenda sigla → professor + diretor de turma), que cria as disciplinas da matriz.
- **Entrada mais rápida**: ids dos ficheiros do Drive guardados por conta (`es.gids`), verificação da versão do manifesto lançada logo no arranque; se nada mudou na nuvem, a app abre com 1 pedido e sincroniza o resto em segundo plano; fotografias/anexos depois da barra; 12 partes em paralelo; sem esperas na barra.
- **Modo de privacidade**: bloqueio por inatividade (10 min por omissão, configurável), ecrã sem nada visível; com código de acesso, pede o código para voltar.

## 0.908
- Sincronização mais rápida: 0,5 s após cada alteração, até 4 transferências em paralelo (partes e ficheiros), verificação rápida da versão do manifesto (Google Drive) e intervalo de 10 s.
- Avisos, aniversários, novidades e janelas só aparecem depois de a barra de sincronização chegar aos 100 %.
- Corrigido: depois de mudar o código noutro aparelho, a chave lembrada antiga deixa de ser reposta.

## 0.907
- «Esqueci-me do código» também nas janelas que pedem o código de acesso (desbloquear dados de base, mudar e desativar o código).

## 0.906
- Ecrã do código de acesso: o teclado físico deixa de apanhar as teclas escritas em campos e janelas («Esqueci-me do código» funcionava só com o teclado do ecrã).

## 0.905
- «Esqueci-me do código» no ecrã do código de acesso: confirma a identidade com o código de encriptação da sincronização (ou a palavra-passe da conta local), até 5 tentativas, e define um código novo de 4 algarismos; registado na auditoria.

## 0.904
- Módulo opcional Coord. PROFIJ (cargo «Coordenador(a) do PROFIJ»): painel, turmas e formandos (médias por componente, FPCT, PAF, regra ≥ 10), entidades e colocações da FPCT, PAF/PEA com júri e classificações, Conselho dos Cursos, legislação; CSV e .ics.
- Ao entrar, barra de sincronização 0–100 % e a app só abre depois de sincronizar (com opções sem internet, ligação expirada ou erro).

## 0.903
- Sincronização discreta (sem mensagens, só o ícone), sem redesenhar a página enquanto se escreve; 2 s após cada alteração e a cada 30 s.
- Código de encriptação lembrado por aparelho e conta Google (`localStorage.eskeep`), também depois de terminar a sessão; pedido de novo só se mudar noutro aparelho. Assistente fecha sozinho no fim.

## 0.902
- Versão numa linha própria por baixo do nome da plataforma (não fica cortada em ecrãs estreitos).

## 0.901
- Versão discreta junto ao logótipo na barra lateral (toque abre a Ajuda/novidades).

## 0.99
- http → https automático em eduspruce.pt/.app quando o certificado existe; mensagem de erro clara.

## 0.900
- Bloqueio dos dados de base: aviso visível só 5 s (ao bloquear e ao entrar numa vista bloqueada), com indicação de onde desbloquear; desbloqueio apenas em Definições › Dados e Segurança (cadeado da barra e aviso de alteração levam lá).

## 0.98
- Barra lateral fixa: sem deslocamento horizontal no iPad (`#side{overflow-x:hidden}`, ligações legais escondidas na coluna de ícones) e sem «salto» da página nos limites (`overscroll-behavior`).

## 0.97
- Endereço principal passa a eduspruce.pt (textos, páginas legais, guias e manual). No eduspruce.app a app verifica se eduspruce.pt já está no ar; se estiver, sincroniza o que estiver pendente e muda de endereço sozinha.

## 0.96
- iPad mais responsivo: na horizontal o cabeçalho cabe numa só linha (título, escola, turma e botões; barra lateral de 224 px); na vertical, duas linhas baixas. Ações das tabelas só com ícones e numa linha, cartões de indicadores ajustados à largura, separadores que deslizam.

## 0.95
- iPad: menu lateral expansível com os nomes (botão sob o logótipo, toque no logótipo ou deslizar da margem esquerda); fecha ao escolher, tocar fora, Esc ou deslizar.
- iPad: cartão da escola sem texto esmagado, instruções numa linha, margens de 20 px, barra de ações deslizável.

## 0.94
- Mudar o código de encriptação (Definições › Sincronização › Mudar o Código): volta a encriptar todos os ficheiros na nuvem, retoma se for interrompido; os outros aparelhos pedem o código novo.
- Códigos existentes aceites sem as regras de força (só para códigos novos).
- ID da Google com valor de reserva quando a configuração demora; aviso do ecrã de entrada numa coluna.

## 0.93
- Código de encriptação da sincronização só com algarismos (mín. 8, sem repetições/sequências) e teclado numérico no ecrã em todos os aparelhos; palavras-passe antigas com letras continuam aceites ao desbloquear.

## 0.92
- Sincroniza antes de sair: ao esconder/fechar a app, recarregar ou terminar a sessão grava e envia logo as alterações pendentes; aviso do navegador se ainda houver envios; ecrã «A guardar as últimas alterações na nuvem…» ao terminar a sessão.
- Ecrã de arranque com o logótipo animado.

## 0.91
- Acesso controlado pelo administrador: só entram com Google as contas autorizadas (lista em `eduspruce-config.json`, com SHA-256 dos e-mails) e com o perfil definido; sessões revalidadas ao abrir.
- Nuvem obrigatória (`modoNuvem: "obrigatorio"`): só Google (conta local apenas para emergência do administrador), sincronização sempre ligada, limpeza do aparelho ao terminar a sessão.
- Notificações via service worker (`sw.js`) no iPhone/iPad (ecrã principal) e computador; resumo do dia, aulas, sumários, avaliações, reuniões, avisos, número no ícone, silêncio; lembretes para o Calendário (.ics).
- iPhone: Início «Hoje» e Painel da Turma compactos.

## 0.90
- Manual de Instruções completo em PDF (46 páginas, com imagens), disponível em [manual/EduSpruce-Manual.pdf](manual/EduSpruce-Manual.pdf) e para descarregar no topo da Ajuda.
- Ajuda atualizada: novos tópicos (Entrar com Google e assistente, convocatórias por e-mail, instalar, segurança, problemas de ligação) e textos revistos.

## 0.89
- Perfil do professor preenchido com a conta Google (nome, e-mail, fotografia); nome na barra lateral em vez do e-mail, atualizado ao escrever.

## 0.88
- Ligação ao Google Drive bloqueada: a app explica como desligar bloqueadores de publicidade/conteúdos (incluindo no Safari) ou mudar de rede.

## 0.87
- Safari no Mac: início de sessão Google por redirecionamento (sem janela bloqueada).

## 0.86
- Google Drive: corrigido «Failed to fetch» (autorização enviada uma só vez; formato simples quando o navegador ou um filtro bloqueia o pedido).

## 0.85
- Sincronização mais fiável: ficheiros grandes por envio retomável, um ficheiro com erro não pára o resto, tentativas rápidas e mensagens exatas; endereço de regresso normalizado no iPhone/iPad.

## 0.84
- Novo separador Definições › Sincronização, redesenhado.

## 0.83
- Entrar com Microsoft 365 aparece como «em breve» até haver ID da Microsoft.

## 0.82
- Entrar com Google já liga o Google Drive; assistente de 3 passos na primeira vez; noutro aparelho só pede a palavra-passe.
- Sincroniza 6 s depois de cada alteração, a cada minuto e ao voltar à app; renovação silenciosa da ligação Google no computador.
- Corrigido: ficheiros criados noutro aparelho (ex.: turma nova) passam a ser encontrados no Google Drive.

## 0.81
- Google Drive: repetição com o testemunho no endereço quando a autorização se perde pelo caminho; ligação direta para ativar a Drive API quando a ligação está correta mas a Google recusa.

## 0.80
- Google Drive: diagnóstico (ID de cliente e permissões da ligação) quando a Google recusa o acesso.

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


