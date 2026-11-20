# Manual de Instruções (PDF) — como regenerar

Tema das capturas: **Spruce** (o `lib.mjs` liga-o, marca as boas-vindas como vistas e dá nome fictício à escola).
1. App de teste: copiar a raiz do repositório para `/home/claude/man/app/` (sem `old`, `manual`, `classica`, `modern`, `docs`) e tirar a linha `esm/arranque.mjs` do `index.html`. Copiar esta pasta para `/home/claude/man/`. `cd modern && npm ci` (playwright).
2. Capturas (dados de demonstração + `seed.js` com Spruce It, Pulso (sala), Formulários e Provas fictícios), cada uma para a sua pasta:
   `OUT=cap node plan1.mjs` · `OUT=cap1b node plan1b.mjs` · `OUT=cap2 node plan2.mjs` · `OUT=cap3 node plan3.mjs` (+`plan3b`) · `OUT=capN node planN.mjs` · `OUT=capN node planN2.mjs` · `node sb.mjs` (menu lateral) · `node login.mjs` e `VP='{"width":390,"height":844}' P=tel OUT=cap4 node plan4.mjs` (+ `P=ipad` com 1180×820).
3. `python3 prep.py` → `img/` (corta a barra lateral, o fundo vazio em baixo e as gavetas; 1400 px).
4. Texto: `m1.txt`…`m5.txt`, organizado por app/módulo (marcação: `@parte`, `#`, `##`, `!img | legenda`, `!!a,b`, `!!!`, `!!!!` (até 4 lado a lado), `!> img` (flutua à direita), `- `, `1. `, `> exemplo`, `? dica`, tabelas com `|`). Imagens estreitas flutuam sozinhas à direita.
5. `python3 build.py 1.0XX && node pdf.mjs 1.0XX && python3 paginas.py && python3 build.py 1.0XX && node pdf.mjs 1.0XX` → `manual.pdf` → `manual/EduSpruce-Manual.pdf`; capa: 1.ª página a 496×701 → `manual/capa.jpg`. Mudar sempre o número (última: **1.038**).
Nunca nomes reais: só os dados de demonstração.
