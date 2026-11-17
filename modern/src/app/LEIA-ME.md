# Código-fonte da app, em peças

A app publicada nasce de **um único ficheiro** (`index.html`). Esta pasta tem esse código em peças com nome
(estilos `.css`, programa `.js`, estrutura `.html`), pela ordem de `ordem.txt`. Juntas, dão o ficheiro byte a byte.

- As peças partilham o mesmo espaço de nomes (são partes de um só programa). Peças mais à frente redefinem funções
  das anteriores: vale a última (`./es fn NOME` mostra todas).
- `dados/` — imagens, bibliotecas, novidades e versão embutidas: não é código para ler. O `./es pub` trata da versão e das novidades.
- Peça nova: `./es novo NOME` (JS, no fim do programa) ou `./es novo NOME --css` (no fim dos estilos).
- `python3 modern/scripts/partir.py juntar modern/src/app SAIDA.html` junta as peças; `conferir` compara com um ficheiro;
  `partir` reparte um index.html editado pelas peças existentes; `reorganizar` refaz a divisão do zero.
