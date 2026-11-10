# Publicação (quando aprovada)

- **Produção** (inalterada): o site atual continua a servir a versão do `main`.
- **Teste**: publicar `dist/moderno/` num subdomínio de teste (p. ex. `teste.` + domínio atual) ou numa pré-visualização do GitHub Pages a partir deste ramo — nunca no domínio de produção.
- Antes de publicar: `npm test` verde, `supabase-config.json` só no servidor de teste, cabeçalhos CSP a permitir `*.supabase.co` e `cdn.jsdelivr.net`.
- Domínio `.pt`: registo via um registrar acreditado pela .PT (DNS.PT); apontar com CNAME para o alojamento; HTTPS automático.
- Passagem a produção: só após validação final e aprovação expressa.
