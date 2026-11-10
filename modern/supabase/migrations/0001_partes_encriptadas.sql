-- =====================================================================================
-- EduSpruce · base de dados (Supabase / PostgreSQL)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
-- A base de dados só recebe dados JÁ ENCRIPTADOS no aparelho do professor: nunca vê nomes nem notas.
-- =====================================================================================
create extension if not exists pgcrypto with schema extensions;

-- 1) Contas autorizadas (as mesmas do eduspruce-config.json: SHA-256 de 'eduspruce:'+email, sem e-mails em claro)
create table if not exists public.eduspruce_autorizados (
  h      text primary key check (h ~ '^[0-9a-f]{64}$'),
  papel  text not null default 'professor' check (papel in ('admin','professor')),
  criado timestamptz not null default now()
);
alter table public.eduspruce_autorizados enable row level security;
revoke all on public.eduspruce_autorizados from anon, authenticated;
insert into public.eduspruce_autorizados (h, papel)
values ('f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a','admin')
on conflict (h) do nothing;

create or replace function public.eduspruce_autorizado() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.eduspruce_autorizados a
    where a.h = encode(extensions.digest('eduspruce:' || lower(trim(coalesce(auth.jwt()->>'email',''))), 'sha256'), 'hex'));
$$;
revoke all on function public.eduspruce_autorizado() from public, anon;
grant execute on function public.eduspruce_autorizado() to authenticated;

-- 2) Partes encriptadas (o mesmo conteúdo cifrado que hoje vai para o Google Drive)
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
drop policy if exists "partes: ler as minhas"     on public.eduspruce_partes;
drop policy if exists "partes: criar as minhas"   on public.eduspruce_partes;
drop policy if exists "partes: alterar as minhas" on public.eduspruce_partes;
drop policy if exists "partes: apagar as minhas"  on public.eduspruce_partes;
create policy "partes: ler as minhas"     on public.eduspruce_partes for select to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado());
create policy "partes: criar as minhas"   on public.eduspruce_partes for insert to authenticated with check (auth.uid() = user_id and public.eduspruce_autorizado());
create policy "partes: alterar as minhas" on public.eduspruce_partes for update to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado()) with check (auth.uid() = user_id);
create policy "partes: apagar as minhas"  on public.eduspruce_partes for delete to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado());
revoke all on public.eduspruce_partes from anon;
grant select, insert, update, delete on public.eduspruce_partes to authenticated;

-- 3) Ficheiros (fotografias, documentos — também cifrados), bucket privado, uma pasta por utilizador
insert into storage.buckets (id, name, public) values ('eduspruce-ficheiros','eduspruce-ficheiros', false) on conflict (id) do nothing;
drop policy if exists "eduspruce ficheiros: ler"    on storage.objects;
drop policy if exists "eduspruce ficheiros: gravar" on storage.objects;
drop policy if exists "eduspruce ficheiros: mudar"  on storage.objects;
drop policy if exists "eduspruce ficheiros: apagar" on storage.objects;
create policy "eduspruce ficheiros: ler"    on storage.objects for select to authenticated using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text and public.eduspruce_autorizado());
create policy "eduspruce ficheiros: gravar" on storage.objects for insert to authenticated with check (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text and public.eduspruce_autorizado());
create policy "eduspruce ficheiros: mudar"  on storage.objects for update to authenticated using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text and public.eduspruce_autorizado());
create policy "eduspruce ficheiros: apagar" on storage.objects for delete to authenticated using (bucket_id = 'eduspruce-ficheiros' and (storage.foldername(name))[1] = auth.uid()::text and public.eduspruce_autorizado());

-- 4) Verificação: deve mostrar 2 tabelas com «rls = true» e 1 conta autorizada
select c.relname as tabela, c.relrowsecurity as rls,
       (select count(*) from public.eduspruce_autorizados) as contas_autorizadas
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('eduspruce_partes','eduspruce_autorizados');
