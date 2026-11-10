# Relatório de equivalência (10 nov 2026)

Baseline: ramo `EDUSPRUCE_ORIGINAL_BASELINE` (0.923). Versão testada: `dist/moderno/index.html` (módulos reconstruídos + camada ES Modules desligada).

| Teste | Resultado |
|---|---|
| Reconstrução a partir de `src/` | **byte a byte igual** à baseline (sha256 `710fa738…`) |
| Cálculos (classificações por período, finais, instrumentos, oralidade) | **1602/1602 valores iguais** |
| Visual, versão moderna × baseline (16 vistas × 3 temas em computador + tablet + telemóvel) | **78/80** iguais (≤ 4 píxeis) |
| Visual, **controlo**: baseline × a própria baseline | **76/80** iguais |

## Leitura honesta dos resultados visuais
- As 2 capturas diferentes da versão moderna (Avaliação/SGE e Alunos/iOS 27) são **só no cabeçalho** (a barra de ações reorganiza-se de forma assíncrona) ou 12 píxeis de antialiasing; o conteúdo é idêntico.
- O teste de controlo mostra o mesmo tipo de diferenças **entre duas aberturas da própria baseline** (4 capturas). Não são causadas pela modernização: são ruído de temporização do navegador.
- Antes de juntar a camada ES Modules, a versão reconstruída deu 80/80.
- Melhoria proposta para o teste (não para a app): comparar o cabeçalho depois de um evento «layout estável», para eliminar este ruído.

Saídas completas em `tests/saida/` (não versionadas).
