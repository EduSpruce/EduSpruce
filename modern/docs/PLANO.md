# EduSpruce · Modernização experimental (ramo `modernizacao`)

> O site publicado **não muda**. Todo este trabalho vive no ramo `modernizacao`; o `main` e o domínio publicado ficam iguais.
> A baseline imutável é o ramo `EDUSPRUCE_ORIGINAL_BASELINE` (versão 0.923, commit `6ae3c6b`).

| Etapa | O quê | Estado |
|---|---|---|
| 1 | Congelar a baseline (ramo `EDUSPRUCE_ORIGINAL_BASELINE`) | ✅ feito (a etiqueta foi recusada pelo GitHub — 403 — ficou o ramo) |
| 2 | Inventário de menus e ecrãs → `MATRIZ_EQUIVALENCIA.md` | ✅ gerado automaticamente (`npm run inventario`) |
| 3a | Dividir o ficheiro único em módulos (`src/`) e reconstruir **byte a byte** igual | ✅ `npm run verificar` → igual à baseline |
| 3b | Camada ES Modules (`src/esm/`) desligada por omissão | ✅ incluída em `dist/moderno/` |
| 4 | Testes de equivalência (cálculos + regressão visual) | ✅ ver `RELATORIO.md` |
| 5 | Ligar o fornecedor Supabase à sincronização da app (PROV) | ⏸ por aprovar — mexe no código da app |
| 6 | Migração real de dados de um professor | ⏸ por aprovar |
| 7 | Publicação num domínio de teste | ⏸ por aprovar (ver `PUBLICACAO_DOMINIOS_PT.md`) |
| 8 | Substituir a versão publicada | ⛔ só com validação final **e** aprovação expressa |

## Como usar
```
cd modern
npm install          # pixelmatch + pngjs (Playwright já instalado no sistema)
npm run build        # dist/index.html (igual à baseline) + dist/moderno/ (com a camada ES Modules)
npm test             # verificação byte a byte + cálculos + visual
node tests/visual.mjs --controlo   # baseline contra ela própria (mede o ruído do navegador)
```

## Regras seguidas
- Nenhuma alteração à versão publicada; nenhum push para `main`.
- Sem credenciais no repositório (`supabase-config.json` está no `.gitignore`; só existe o `.example`).
- Sem chaves administrativas no frontend: só a chave pública `anon`, protegida por RLS.
- Sem dados pessoais em recursos públicos; os testes usam a turma de demonstração.
- Equivalência funcional e visual total; qualquer melhoria fica como proposta.
