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
## Para gastar menos
- Mudanças pequenas: procurar com grep pelo texto visível no ecrã e editar só essa linha.
- Sem capturas de teste quando o utilizador disser «sem testar».
