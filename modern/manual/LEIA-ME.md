# Manual de Instruções (PDF) — como regenerar

1. App de teste: `index.html` da raiz copiado para `/home/claude/man/app/` (sem a linha `esm/arranque.mjs`), mais `aluno/arena/pulso/forms/provas.html`.
2. Capturas (dados de demonstração + `seed.js` com Arena, Pulso, Forms e Provas fictícios): `OUT=cap node plan1.mjs`, `OUT=cap2 node plan2.mjs`, `OUT=cap3 node plan3.mjs` (+`plan3b`), `VP='{"width":390,"height":844}' P=tel OUT=cap4 node plan4.mjs`, `node login.mjs`. Reduzir para `img/` (1400 px, JPEG q66).
3. Imagens da Ajuda nos 7 estilos: `node temas.mjs` → `temas/<estilo>/*.png` → `ajuda/<estilo>/*.webp` (1100×692).
4. Texto: `m1.txt`…`m4.txt` (marcação: `@parte`, `#`, `##`, `!img | legenda`, `!!a,b | legenda`, `- `, `1. `, `> exemplo`, `? dica`, tabelas com `|`).
5. `python3 build.py 1.0XX && node pdf.mjs 1.0XX && python3 paginas.py && python3 build.py 1.0XX && node pdf.mjs 1.0XX` (2.ª passagem põe os números de página no índice) → `manual.pdf` → `manual/EduSpruce-Manual.pdf` e `manual/capa.jpg`.
Nunca nomes reais: só os dados de demonstração.
