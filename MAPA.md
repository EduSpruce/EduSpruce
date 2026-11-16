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
- Desempenho: NUNCA `:has()` com `[style…]` dentro (nem `:not(:has(...[style]))`) — obriga a recalcular o estilo da página inteira a cada medição do cabeçalho (era o que deixava a app lenta nos PCs antigos; 1.020). Modo leve: `html.leve` (Definições › Aparência › Desempenho, `localStorage es.leve`).
- Privacidade (modo de apresentação, 1.020): `apresPrep`/`apresAplicar` + observador do documento filtram TUDO o que aparece (texto, atributos, valores, listas, canvas). Memória por turma em `S.cfg.apresT[turmaId]` (`auto` = liga ao abrir a turma). Código novo não precisa de fazer nada — mas não desenhar nomes de alunos em imagens.
- Em teste: `S.emt[instId]` (temporizador); entrada `.emtnav` por baixo da turma no menu. Coordenação só (sem docência): `CP().y.coordT` (nunca em `a.turmas`).
- Demonstração: `criarDemo()` cria 3 anos letivos (o atual + 2 anteriores com os mesmos alunos) e exemplos na Biblioteca, Contactos e SpruceNote.
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
