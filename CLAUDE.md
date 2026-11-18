# EduSpruce — instruções para o Claude

Português de Portugal, respostas curtas. Publicar sem perguntar («publica e acabou»). Versão atual: `versao.json`.

## Regras do utilizador
- Sem dados no aparelho: tudo na base de dados (Supabase), sem o utilizador ver sincronização. Só a chave publicável do Supabase.
- Nunca escrever no SGE/DB da escola, nunca dados de alunos no GitHub, o e-mail nunca passa pela EduSpruce, nunca nomes reais em código, ajuda ou exemplos.
- Arena nunca conta para a nota. Pulso é formativo (só conta se o professor escolher um domínio). Nomes da Arena originais (inspirados no Blooket, nunca copiados).
- Tema SGE: cantos retos em todos os módulos. Não mexer no eduspruce.app (landing) nem no manual PDF sem pedido.

## Gastar poucos tokens
- Nunca ler ficheiros inteiros nem juntar a app para editar: procurar → ler só as linhas precisas → editar.
- `./es onde PADRÃO` procura (linhas curtas, sem `dados/`) · `./es fn NOME` mostra a definição e todas as redefinições · `./es ver FICHEIRO LINHA N` · `./es mapa` dá vista → função → peças.
- Editar com a ferramenta Edit (antes, Read só das linhas com offset/limit) ou `./es troca FICHEIRO` com blocos `<<<<` antigo `====` novo `>>>>`.
- `./es testa` constrói, verifica a sintaxe e abre todas as vistas sem ecrã (só mostra erros); testar só mudanças de lógica, «sem testar» = não testar. Vários pedidos pequenos: um só `./es pub` no fim.
- Publicar: `CLAUDE_SESSION=<link da sessão> ./es pub "novidade 1|novidade 2"` (número de versão automático, eduspruce.pt + espelho; se outra sessão publicar entretanto, junta-se e refaz). `ES_COAUTOR="Claude <modelo> <noreply@anthropic.com>"` muda a linha Co-Authored-By.
- `./es estado` antes de começar: versão, o que está por publicar e o que outras sessões publicaram.
- `MAPA.md` tem as convenções do código e as notas de cada módulo: ler só a secção precisa.

## Onde está cada coisa (caminhos do `./es` relativos a `modern/src/`)
- `app/NNN-assunto.{js,css,html}` — a app: um só programa em peças, pela ordem de `app/ordem.txt`. Peças mais à frente redefinem funções das anteriores: vale a última (ver `./es fn`).
- Código novo: `./es novo NOME` (peça JS no fim do programa) e `./es novo NOME --css` (peça no fim dos estilos; seletores fortes `html body …` por causa do tema SGE). Pequenos acertos: na peça do assunto.
- `app/dados/` — dados embutidos (imagens, bibliotecas, novidades, versão): não ler. O `./es pub` atualiza a versão e as Novidades.
- `moderno/*.js` — só na versão com base de dados (ordem em `moderno/ordem.txt`: basedados, autoav, digit, arena-comum, arena, pulso, forms, provas, banco, avisos, hub, eduschedule), juntados por `modern/scripts/db.mjs`, que também aplica `moderno/patches.json` (trocas de texto na app; se uma deixar de encaixar, o build diz qual).
- Páginas dos alunos: `/aluno.html`, `/forms.html`, `/provas.html` (editar diretamente); `arena/arena.html` → `/spruceit.html` (Spruce It, antiga Arena; `/arena.html` só reencaminha), `pulso/pulso.html` → `/pulso.html`.
- EduSchedule (antigo EduTime, horários da escola): fonte em `eduschedule/src/` (peças em `paginas/`, ordem em `src/ordem.json`; Tailwind + daisyUI), construída pelo `./es` em `/eduschedule.html` e `/horarios.html` (consulta pública); abre dentro da app por `moderno/eduschedule.js`.
- SQL do Supabase: `modern/supabase/migrations/` (o utilizador corre-o no Supabase).
- Gerados (nunca editar à mão): `/index.html`, `/app/`, `/arquivo.html`, `/eduschedule.html`, `/horarios.html`, `/spruceit.html`, `/arena.html`, `/pulso.html`, `/versao.json`, `/esm/`.
- Espelho para a rede da escola: `EduSpruce/eduspruce.github.io` (o `./es pub` clona-o e atualiza-o). A pasta `boxdoc/` desse site é a BoxCheck (app independente, publicada à parte): o espelho nunca a apaga (`ES_ESPELHO_MANTER` em `modern/scripts/espelho.sh`); não a mexer a partir da EduSpruce.
