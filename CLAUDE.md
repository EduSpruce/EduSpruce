# EduSpruce — instruções para o Claude

Português de Portugal, respostas curtas. Publicar sem perguntar («publica e acabou»). Versão atual: `versao.json`.

## Regras do utilizador
- Sem dados no aparelho: tudo na base de dados (Supabase), sem o utilizador ver sincronização. Só a chave publicável do Supabase.
- Nunca escrever no SGE/DB da escola, nunca dados de alunos no GitHub, o e-mail nunca passa pela EduSpruce, nunca nomes reais em código, ajuda ou exemplos.
- Arena nunca conta para a nota. Pulso é formativo (só conta se o professor escolher um domínio). Nomes, personagens e aspeto da Arena criados de raiz. Nunca referir marcas de outras apps em nenhum lado (código, comentários, ajuda, Novidades, docs).
- Tema SGE: cantos retos em todos os módulos. Não mexer no eduspruce.app (landing) nem no manual PDF sem pedido.

## Gastar poucos tokens
- Depois de uma pausa (semanas ou meses) não reler o projeto para se reorientar: basta este ficheiro, `./es estado` e a secção do `MAPA.md` do módulo pedido. Não ler `CHANGELOG.md`, `docs/` nem o `MAPA.md` inteiro; o pedido do utilizador diz onde mexer.
- Nunca ler ficheiros inteiros nem juntar a app para editar: procurar → ler só as linhas precisas → editar.
- `./es onde PADRÃO` procura (linhas curtas, sem `dados/`) · `./es fn NOME` lista todas as definições e mostra o corpo das últimas (`-u N`, `-t` todas; «⤷» = embrulha a anterior) · `./es ver FICHEIRO LINHA N` · `./es mapa` dá vista → função → peças.
- Editar com a ferramenta Edit (antes, Read só das linhas com offset/limit) ou `./es troca FICHEIRO` com blocos `<<<<` antigo `====` novo `>>>>`.
- `./es testa` constrói, verifica a sintaxe e abre todas as vistas sem ecrã (só mostra erros); testar só mudanças de lógica, «sem testar» = não testar. Vários pedidos pequenos: um só `./es pub` no fim.
- Publicar: `CLAUDE_SESSION=<link da sessão> ./es pub "novidade 1|novidade 2"` (número de versão automático, eduspruce.pt + espelho; se outra sessão publicar entretanto, junta-se e refaz). `ES_COAUTOR="Claude <modelo> <noreply@anthropic.com>"` muda a linha Co-Authored-By.
- Nunca `grep -r`/`rg` na raiz sem caminho: o `.ignore` protege os gerados, mas `./es onde` é sempre mais barato.
- `./es estado` antes de começar: versão, o que está por publicar e o que outras sessões publicaram.
- `MAPA.md` tem as convenções do código e as notas de cada módulo: ler só a secção precisa.

## Equipa de agentes (`.claude/agents/`) — só no risco alto
- Risco baixo (texto, cor, ícone, espaçamento): fazer e publicar, sem agentes.
- Risco alto (contas das notas, dados gravados, entrada/contas, base de dados, páginas dos alunos): `triagem` → `executor` → `verificador-contas` (se tocar em notas) → `revisor` → `./es pub`. Quem publica é a sessão principal, nunca um agente.
- Se um agente falhar, volta ao `executor` com o caso concreto; à segunda falha, parar e perguntar ao utilizador.

## Onde está cada coisa (caminhos do `./es` relativos a `modern/src/`)
- `app/NNN-assunto.{js,css,html}` — a app: um só programa em peças, pela ordem de `app/ordem.txt`. Peças mais à frente redefinem funções das anteriores; quase sempre a nova EMBRULHA a anterior (correm todas as camadas, a última por fora) — ver `./es fn`.
- Código novo: `./es novo NOME` (peça JS no fim do programa) e `./es novo NOME --css` (peça no fim dos estilos; seletores fortes `html body …` por causa do tema SGE). Pequenos acertos: na peça do assunto.
- `app/dados/` — dados embutidos (imagens, bibliotecas, novidades, versão): não ler. O `./es pub` atualiza a versão e as Novidades.
- `moderno/*.js` — só na versão com base de dados (ordem em `moderno/ordem.txt`: basedados, autoav, digit, arena-comum, arena, pulso, forms, provas, banco, avisos, hub), juntados por `modern/scripts/db.mjs`, que também aplica `moderno/patches.json` (trocas de texto na app; se uma deixar de encaixar, o build diz qual).
- Páginas dos alunos: `/aluno.html`, `/forms.html`, `/provas.html` (editar diretamente); `arena/arena.html` → `/spruceit.html` (Spruce It, antiga Arena; `/arena.html` só reencaminha), `pulso/pulso.html` → `/pulso.html`.
- EduSchedule retirado (1.149); dados S.esched ficam na base de dados sem uso.
- SQL do Supabase: `modern/supabase/migrations/` (o utilizador corre-o no Supabase).
- Gerados (nunca editar à mão): `/index.html`, `/app/`, `/arquivo.html`, `/spruceit.html`, `/arena.html`, `/pulso.html`, `/versao.json`, `/esm/`.
- Espelho para a rede da escola: `EduSpruce/eduspruce.github.io` (o `./es pub` clona-o e atualiza-o). As pastas `boxdoc/` (BoxCheck) e `voa-cagarro/` (jogo Voa, Cagarro!) desse site são apps independentes, publicadas à parte: o espelho nunca as apaga (`ES_ESPELHO_MANTER` em `modern/scripts/espelho.sh`); não lhes mexer a partir da EduSpruce.
- eduspruce.app (landing, repositório `EduSpruce/eduspruce-app`): o `./es pub` também regenera `/changelog/` a partir das Novidades (`modern/scripts/changelog-app.mjs`).
