-- =====================================================================================
-- EduSpruce · AUTORIZAÇÃO ROBUSTA + DIAGNÓSTICO (correr uma vez; pode correr-se mais do que uma vez)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run».
-- A verificação «esta conta está autorizada?» passa a usar o e-mail guardado na própria conta
-- (e não só o que vem no testemunho de sessão), seja a entrada feita com Google ou com palavra-passe.
-- =====================================================================================
create or replace function public.eduspruce_email_atual() returns text
language sql stable security definer set search_path = public, auth as $$
  select lower(trim(coalesce(nullif(auth.jwt()->>'email',''), (select u.email from auth.users u where u.id = auth.uid()), '')));
$$;
create or replace function public.eduspruce_autorizado() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.eduspruce_autorizados a
    where a.h = encode(extensions.digest('eduspruce:' || public.eduspruce_email_atual(), 'sha256'), 'hex'));
$$;
create or replace function public.eduspruce_admin() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.eduspruce_autorizados a
    where a.papel = 'admin' and a.h = encode(extensions.digest('eduspruce:' || public.eduspruce_email_atual(), 'sha256'), 'hex'));
$$;
revoke all on function public.eduspruce_email_atual() from public, anon;
revoke all on function public.eduspruce_autorizado() from public, anon;
revoke all on function public.eduspruce_admin() from public, anon;
grant execute on function public.eduspruce_email_atual() to authenticated;
grant execute on function public.eduspruce_autorizado() to authenticated;
grant execute on function public.eduspruce_admin() to authenticated;

-- a sua conta, de novo, como administrador
insert into public.eduspruce_autorizados (h, papel)
values ('f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a', 'admin')
on conflict (h) do update set papel = 'admin';

-- DIAGNÓSTICO: simula um pedido da sua conta e mostra o que a base de dados responde
do $$
declare uid uuid; r record;
begin
  select id into uid from auth.users where encode(extensions.digest('eduspruce:' || lower(trim(email)), 'sha256'), 'hex') = 'f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a' order by last_sign_in_at desc nulls last limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
  raise notice 'conta encontrada: %', uid is not null;
end $$;

select 'contas com este e-mail' as verificacao, count(*)::text as resultado from auth.users where encode(extensions.digest('eduspruce:' || lower(trim(email)), 'sha256'), 'hex') = 'f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a'
union all
select 'autorizado (simulado)', (
  select exists (select 1 from public.eduspruce_autorizados a
    where a.h = 'f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a'))::text
union all
select 'quem pode executar a verificação', string_agg(distinct grantee, ', ')
  from information_schema.routine_privileges where routine_schema = 'public' and routine_name = 'eduspruce_autorizado'
union all
select 'fornecedores da conta', coalesce((select string_agg(provider, ', ') from auth.identities i join auth.users u on u.id = i.user_id where encode(extensions.digest('eduspruce:' || lower(trim(u.email)), 'sha256'), 'hex') = 'f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a'), '(nenhum)')
union all
select 'última entrada', coalesce((select to_char(max(last_sign_in_at) at time zone 'Atlantic/Azores', 'YYYY-MM-DD HH24:MI') from auth.users where encode(extensions.digest('eduspruce:' || lower(trim(email)), 'sha256'), 'hex') = 'f311a15e184c53a993b13bf8062c72e985ae07fc1ecc4995e8fd28035d1f1d6a'), '—');
