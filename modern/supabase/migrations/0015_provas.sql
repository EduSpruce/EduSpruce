-- =====================================================================================
-- EduSpruce · Provas (avaliações digitais)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
--
-- 1) As provas usam as mesmas sessões cifradas do Forms (eduspruce_autoav), mas com mais espaço
--    (enunciados com imagens) e agendamento até 60 dias. As respostas podem ter até 200 000 caracteres
--    (justificações e respostas longas).
-- 2) Partilha com colegas (grupos / espaço da escola): exercícios, avaliações e rubricas, sem dados de alunos.
--    Um grupo é identificado por um código secreto que só os membros conhecem (a base de dados guarda só o hash).
-- =====================================================================================

-- 1) limites das sessões e das respostas
alter table public.eduspruce_autoav drop constraint if exists eduspruce_autoav_dados_check;
alter table public.eduspruce_autoav add constraint eduspruce_autoav_dados_check check (char_length(dados) between 10 and 4000000);
alter table public.eduspruce_autoav drop constraint if exists eduspruce_autoav_expira_check;
alter table public.eduspruce_autoav add constraint eduspruce_autoav_expira_check check (expira <= now() + interval '62 days');
alter table public.eduspruce_autoav_resp drop constraint if exists eduspruce_autoav_resp_conteudo_check;
alter table public.eduspruce_autoav_resp add constraint eduspruce_autoav_resp_conteudo_check check (char_length(conteudo) between 10 and 200000);

create or replace function public.eduspruce_autoav_enviar(p_id text, p_conteudo text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_id !~ '^[0-9a-f]{40}$' or p_conteudo is null or char_length(p_conteudo) not between 10 and 200000 then return false; end if;
  if not exists (select 1 from public.eduspruce_autoav s where s.id = p_id and s.aberta and s.expira > now()) then return false; end if;
  select count(*) into n from public.eduspruce_autoav_resp r where r.sessao = p_id;
  if n >= 400 then return false; end if;
  insert into public.eduspruce_autoav_resp (sessao, conteudo) values (p_id, p_conteudo);
  delete from public.eduspruce_autoav where expira < now() - interval '30 days';
  return true;
end $$;
revoke all on function public.eduspruce_autoav_enviar(text, text) from public;
grant execute on function public.eduspruce_autoav_enviar(text, text) to anon, authenticated;

-- 2) partilha com colegas
create table if not exists public.eduspruce_provas_partilha (
  codigo  text        primary key check (codigo ~ '^[0-9a-f]{40}$'),
  user_id uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  grupo   text        check (grupo is null or grupo ~ '^[0-9a-f]{40}$'),
  tipo    text        not null check (tipo in ('av','ex','rub')),
  titulo  text        not null check (char_length(titulo) between 1 and 160),
  dados   jsonb       not null check (octet_length(dados::text) < 8000000),
  autor   text,
  criado  timestamptz not null default now()
);
create index if not exists eduspruce_provas_partilha_grupo on public.eduspruce_provas_partilha (grupo);
alter table public.eduspruce_provas_partilha enable row level security;
alter table public.eduspruce_provas_partilha force row level security;
revoke all on public.eduspruce_provas_partilha from anon, authenticated;

create or replace function public.provas_partilhar(p_codigo text, p_grupo text, p_tipo text, p_titulo text, p_dados jsonb, p_autor text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'sem autorização'; end if;
  insert into public.eduspruce_provas_partilha (codigo, user_id, grupo, tipo, titulo, dados, autor)
    values (p_codigo, auth.uid(), nullif(p_grupo,''), p_tipo, left(p_titulo,160), p_dados, left(p_autor,80))
    on conflict (codigo) do update set grupo = excluded.grupo, titulo = excluded.titulo, dados = excluded.dados, autor = excluded.autor, criado = now()
    where public.eduspruce_provas_partilha.user_id = auth.uid();
  return true;
end $$;
create or replace function public.provas_importar(p_codigo text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('tipo', tipo, 'titulo', titulo, 'dados', dados, 'autor', autor) from public.eduspruce_provas_partilha
  where codigo = p_codigo and auth.uid() is not null and public.eduspruce_autorizado() $$;
create or replace function public.provas_grupo(p_grupo text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('codigo', codigo, 'tipo', tipo, 'titulo', titulo, 'autor', autor, 'meu', user_id = auth.uid(), 'criado', criado) order by criado desc), '[]'::jsonb)
  from public.eduspruce_provas_partilha where grupo = p_grupo and auth.uid() is not null and public.eduspruce_autorizado() $$;
create or replace function public.provas_despartilhar(p_codigo text) returns boolean
language plpgsql security definer set search_path = public as $$
begin delete from public.eduspruce_provas_partilha where codigo = p_codigo and user_id = auth.uid(); return true; end $$;

do $$ declare f text; begin
  foreach f in array array['provas_partilhar(text,text,text,text,jsonb,text)','provas_importar(text)','provas_grupo(text)','provas_despartilhar(text)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon'; execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $$;

-- Verificação
select c.relname as tabela, c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('eduspruce_autoav','eduspruce_autoav_resp','eduspruce_provas_partilha');
