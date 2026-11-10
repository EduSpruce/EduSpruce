-- EduSpruce · Supabase (PostgreSQL) — armazenamento das partes ENCRIPTADAS no aparelho.
-- A base de dados nunca vê dados de alunos em claro: guarda o mesmo conteúdo cifrado que hoje vai para o Google Drive/OneDrive.
create table if not exists public.eduspruce_partes (
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  nome       text        not null check (char_length(nome) between 1 and 200),
  conteudo   text        not null,
  tamanho    integer     not null default 0,
  atualizado timestamptz not null default now(),
  primary key (user_id, nome)
);
alter table public.eduspruce_partes enable row level security;
alter table public.eduspruce_partes force row level security;
-- Row Level Security: cada utilizador só vê e altera as suas próprias linhas
create policy "partes: ler as minhas"     on public.eduspruce_partes for select using (auth.uid() = user_id);
create policy "partes: criar as minhas"   on public.eduspruce_partes for insert with check (auth.uid() = user_id);
create policy "partes: alterar as minhas" on public.eduspruce_partes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "partes: apagar as minhas"  on public.eduspruce_partes for delete using (auth.uid() = user_id);
revoke all on public.eduspruce_partes from anon;
grant select, insert, update, delete on public.eduspruce_partes to authenticated;

-- Storage: fotografias e documentos (também cifrados no aparelho), numa pasta por utilizador
insert into storage.buckets (id, name, public) values ('eduspruce-ficheiros','eduspruce-ficheiros', false) on conflict (id) do nothing;
create policy "ficheiros: só a minha pasta (ler)"   on storage.objects for select using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ficheiros: só a minha pasta (gravar)" on storage.objects for insert with check (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ficheiros: só a minha pasta (mudar)"  on storage.objects for update using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ficheiros: só a minha pasta (apagar)" on storage.objects for delete using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text);
