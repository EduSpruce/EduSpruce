# Segurança e privacidade

- **Encriptação no aparelho**: o servidor (Supabase/PostgreSQL) só recebe texto já cifrado — o mesmo que hoje vai para o Google Drive/OneDrive. Ninguém do lado do servidor consegue ler nomes ou notas.
- **Row Level Security** (`supabase/migrations/0001_partes_encriptadas.sql`): `force row level security`; cada operação (ler, criar, alterar, apagar) exige `auth.uid() = user_id`. O papel `anon` não tem qualquer permissão.
- **Ficheiros** (fotografias, documentos): bucket privado `eduspruce-ficheiros`, uma pasta por utilizador, com políticas iguais.
- **Chaves**: no frontend só a chave pública `anon`. A `service_role` nunca entra no código nem no GitHub. `supabase-config.json` está no `.gitignore`.
- **Autenticação**: OAuth Google pelo Supabase Auth (`signInWithOAuth`), sessão renovada automaticamente.
- **SGE/base de dados da escola**: nunca se escreve.
- **E-mail**: continua a não passar pela EduSpruce.

## Decisão pendente
`supabase/migrations/0002_PROPOSTA_tabelas_normalizadas.sql.txt` — tabelas em claro (alunos, notas…) permitiriam consultas no servidor, mas **contrariam a regra atual** de dados só encriptados na conta do professor e exigiriam acordo com a escola (RGPD). Fica como proposta, não aplicada.
