# Código-fonte da app, por módulos

A app publicada é **um único ficheiro** (`index.html`). Esta pasta tem exatamente o mesmo código, cortado em módulos
(estilos `.css`, programa `.js`, estrutura `.html`), pela ordem de `ordem.txt`.

- `python3 modern/scripts/partir.py juntar modern/src/app SAIDA.html` — junta os módulos num ficheiro.
- `python3 modern/scripts/partir.py partir FONTE.html modern/src/app` — volta a cortar.
- `python3 modern/scripts/partir.py conferir FONTE.html modern/src/app` — confirma, por SHA-256, que são iguais byte a byte.

Os cortes são só em fronteiras de linha, por isso juntar devolve sempre o ficheiro original, sem diferença nenhuma.
Os ficheiros `NN-dados-*.html` são bibliotecas e imagens embutidas (não é código para ler).
Os módulos partilham o mesmo espaço de nomes (são partes de um só programa), não são módulos isolados.
