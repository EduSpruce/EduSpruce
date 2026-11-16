# EduSpruce · mapa rápido para uma conversa nova do Claude

Responder sempre em português, curto. Versões 0.900–0.999 (nunca 1.0); a atual está em `versao.json`.

## Regras do utilizador
- Publicar diretamente, sem perguntar.
- Sem dados no aparelho: tudo na base de dados Supabase, sem o utilizador ver sincronização.
- Nunca escrever no SGE/DB da escola; nunca dados de alunos no GitHub; o e-mail nunca passa pela EduSpruce.
- Nunca nomes reais em código, ajuda ou exemplos. Nunca a chave secreta do Supabase (só a publicável).
- Não mexer no eduspruce.app nem no PDF até à versão final.
- Arena: nunca conta para a nota. Pulso: sempre formativo, só conta se o professor escolher um domínio.

## Onde está cada coisa
- Fonte da app: `modern/src/app/` (módulos = index.html byte a byte; `modern/scripts/partir.py juntar|partir|conferir`). Na sessão: `/home/claude/edugest/index.html`.
- Só na versão com base de dados: `modern/src/moderno/` (basedados, autoav, digit, arena-comum + arena, pulso), juntados por `modern/scripts/db.mjs`.
- Páginas dos alunos: `aluno.html`, `modern/src/arena/arena.html` → `arena.html`, `modern/src/pulso/pulso.html` → `pulso.html`.
- SQL para correr no Supabase: `modern/supabase/migrations/`.
- Espelho para a rede da escola: repositório `EduSpruce/eduspruce.github.io`.

## Convenções
- Código novo antes da âncora `/* SpruceNote e JornalNote: ao entrar, o quadro ajusta-se sozinho ao ecrã */`.
- CSS novo em `<style id="css965">`, com seletores fortes (`html body …`) por causa do tema SGE.
- Vistas: `TITLES.x`, envolver `go` e `go._f.x=vX`; módulos desativáveis põem o interruptor em `#def-mods`.

## Sessão nova
```
git clone https://github.com/EduSpruce/eduspruce.git /home/claude/eduspruce
git clone https://github.com/EduSpruce/eduspruce.github.io.git /home/claude/eduspruce.github.io
bash /home/claude/eduspruce/modern/scripts/sessao/preparar.sh
```
## Publicar
```
CLAUDE_SESSION=<link da sessão> /tmp/es/pubm.sh 0.9XX "novidade 1|novidade 2" "changelog" "mensagem do commit"
```

## Índice: onde está cada parte (modern/src/app)
Os módulos mais recentes (número maior) reescrevem funções dos anteriores: procurar sempre com `grep -l "texto visível" modern/src/app/*` e editar o último que aparecer.
- Estilos: CSS novo em `12-estilos-css965.css`. Cabeçalho, menu e HTML base: `01-cabeca.html`, `13-corpo.html`.
- Dados embutidos (não abrir, são enormes): `14`–`17` (gifs, pdf.js, MRA).
- Núcleo (estado `S`, `A()`, `T()`, escolas por ano `prepAno`/`CTX_ESC`, cálculos): `19-nucleo.js`.
- Início: `20` (vInicio0), `31` (vInicio, tarefas), `40` (cartões), `37` (desempenho), `48` (telemóvel). Turmas/ano letivo: `20` (vTurmas).
- Calendário escolar, aulas previstas, intercalar: `21`. O Meu Calendário: `55`. Menu lateral: `55`.
- Reuniões, marcação de testes: `22`. Horário da turma e O Meu Horário: `23`, grelha nova `39`.
- Alunos, fotos, MSAI: `24`, catálogo MSAI `56`. Critérios, instrumentos, avaliação, relatórios: `25`, relatórios PDF/intercalar da turma `42`.
- Escola e escolas (dados, procurar na internet, tipologia), módulos profissionais: `26`.
- Definições: `27`, `28` (também `VERSAO` e Novidades). Ajuda: `27`, `54`.
- Sumários e planta da sala: `29`. Direção de Turma, documentos, biblioteca: `30`.
- Oral e conselho de turma: `33`. Entrar/autenticação: `35`. Google Drive: `36`.
- Perfis de utilizador e muitas funções mistas (575 KB, evitar ler): `41`.
- Aula e turma completa: `43`. Transferências de escola: `45`. Jornal/PAA: `46`. Segurança: `47`.
- Conselho PROFIJ e cargos: `49`. SpruceNote: `50`. Contactos e sorteio: `51`. Análise de resultados: `52`.
- PROFIJ: planos de recuperação (`vPrecup`, Portaria 52/2016) e MRA: `53`, `37`. Pautas PROFIJ/FPCT: `57`. FCT e PAP no calendário: `54`.
- Só na versão com base de dados (`modern/src/moderno/`): base de dados, cópia no Drive, palavra-passe → `basedados.js` (+ `modern/src/esm/supabase-prov.mjs` = `esm/`); Forms → `forms.js`; Arena, Pulso, banco de perguntas, autoavaliação → os ficheiros com esse nome.

## Para gastar menos (pedidos)
- Uma conversa nova por lote de pedidos; nunca duas sessões a publicar ao mesmo tempo.
- Procurar pelo texto exato do ecrã; não ler módulos inteiros nem o index.html (7 MB).
- Testar no browser só mudanças de lógica; «sem testar» = não testar.

## Para gastar menos (trabalho)
- Mudanças pequenas: procurar com grep pelo texto visível no ecrã e editar só essa linha.
- Sem capturas de teste quando o utilizador disser «sem testar».
