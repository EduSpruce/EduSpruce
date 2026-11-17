-- =====================================================================================
-- EduSpruce · avisos com a app fechada (notificações push) — versão 1.035
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
--
-- Como funciona:
--  · cada aparelho que ativa os avisos guarda aqui a sua «subscrição» (endereço do serviço de avisos da Apple/Google/Mozilla)
--  · a app (aberta em qualquer aparelho) guarda a lista dos próximos avisos: só título curto, hora e secção da app
--    (nada de notas nem de nomes de alunos; com «avisos discretos» nem o título vai)
--  · de minuto a minuto, o agendamento (pg_cron) chama a função «eduspruce-avisos», que envia os avisos que chegaram à hora
--    e apaga-os logo a seguir
--  · as chaves VAPID são criadas pela própria função na primeira vez e ficam na tabela eduspruce_push_vapid,
--    que ninguém lê a não ser a função (service_role)
-- Precisa também da função «eduspruce-avisos» (modern/supabase/functions/eduspruce-avisos/index.ts),
-- criada em Edge Functions › Deploy a new function › Via Editor, com «Verify JWT» desligado.
-- =====================================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 1) Subscrições (uma por aparelho)
create table if not exists public.eduspruce_push_subs (
  endpoint text primary key check (endpoint ~ '^https://' and char_length(endpoint) < 1200),
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  p256dh   text not null check (char_length(p256dh) < 200),
  auth     text not null check (char_length(auth) < 100),
  aparelho text not null default '' check (char_length(aparelho) <= 80),
  criado   timestamptz not null default now(),
  visto    timestamptz not null default now()
);
create index if not exists eduspruce_push_subs_user on public.eduspruce_push_subs(user_id);
alter table public.eduspruce_push_subs enable row level security;
alter table public.eduspruce_push_subs force row level security;
revoke all on public.eduspruce_push_subs from anon, authenticated;

-- 2) Avisos por enviar (substituídos pela app sempre que algo muda; apagados ao serem enviados)
create table if not exists public.eduspruce_avisos (
  id      bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  chave   text not null check (char_length(chave) <= 120),
  quando  timestamptz not null,
  titulo  text not null check (char_length(titulo) <= 140),
  corpo   text not null default '' check (char_length(corpo) <= 300),
  v       text not null default 'inicio' check (char_length(v) <= 40),
  t       text not null default '' check (char_length(t) <= 80),
  unique (user_id, chave)
);
create index if not exists eduspruce_avisos_quando on public.eduspruce_avisos(quando);
alter table public.eduspruce_avisos enable row level security;
alter table public.eduspruce_avisos force row level security;
revoke all on public.eduspruce_avisos from anon, authenticated;

-- 3) Chaves VAPID (criadas pela função; só a função lê)
create table if not exists public.eduspruce_push_vapid (
  id   int primary key check (id = 1),
  pub  text not null,
  priv text not null,
  criado timestamptz not null default now()
);
alter table public.eduspruce_push_vapid enable row level security;
alter table public.eduspruce_push_vapid force row level security;
revoke all on public.eduspruce_push_vapid from anon, authenticated;

-- 4) Funções para a app (professor com sessão iniciada e conta autorizada)
create or replace function public.eduspruce_push_registar(p_endpoint text, p_p256dh text, p_auth text, p_aparelho text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'Conta não autorizada'; end if;
  if (select count(*) from public.eduspruce_push_subs where user_id = auth.uid() and endpoint <> p_endpoint) >= 10 then
    delete from public.eduspruce_push_subs where endpoint in (select endpoint from public.eduspruce_push_subs where user_id = auth.uid() order by visto limit 1);
  end if;
  insert into public.eduspruce_push_subs(endpoint, user_id, p256dh, auth, aparelho)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth, left(coalesce(p_aparelho,''), 80))
  on conflict (endpoint) do update set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, aparelho = excluded.aparelho, visto = now();
  return true;
end $$;

create or replace function public.eduspruce_push_remover(p_endpoint text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.eduspruce_push_subs where endpoint = p_endpoint and user_id = auth.uid();
  if not exists (select 1 from public.eduspruce_push_subs where user_id = auth.uid()) then
    delete from public.eduspruce_avisos where user_id = auth.uid();
  end if;
  return true;
end $$;

-- quantos aparelhos têm os avisos ligados (a app só guarda a lista de avisos se houver algum)
create or replace function public.eduspruce_push_estado()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'aparelhos', (select count(*) from public.eduspruce_push_subs where user_id = auth.uid()),
    'pendentes', (select count(*) from public.eduspruce_avisos where user_id = auth.uid()),
    'servico',   exists (select 1 from public.eduspruce_push_vapid where id = 1))
  where public.eduspruce_autorizado() $$;

-- substitui a lista de avisos da conta (no máximo 400, nos próximos 31 dias)
create or replace function public.eduspruce_avisos_definir(p_lista jsonb)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'Conta não autorizada'; end if;
  delete from public.eduspruce_avisos where user_id = auth.uid() and chave not like 'teste:%';
  if not exists (select 1 from public.eduspruce_push_subs where user_id = auth.uid()) then return 0; end if;
  insert into public.eduspruce_avisos(user_id, chave, quando, titulo, corpo, v, t)
  select auth.uid(), left(x->>'k',120), (x->>'q')::timestamptz, left(coalesce(x->>'ti','EduSpruce'),140), left(coalesce(x->>'c',''),300),
         left(coalesce(x->>'v','inicio'),40), left(coalesce(x->>'t',''),80)
  from (select x from jsonb_array_elements(coalesce(p_lista,'[]'::jsonb)) x limit 400) l
  where x->>'k' is not null and (x->>'q')::timestamptz > now() and (x->>'q')::timestamptz < now() + interval '31 days'
  on conflict (user_id, chave) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- aviso de teste: chega daqui a ~1 minuto (dá tempo para fechar a app)
create or replace function public.eduspruce_avisos_teste()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'Conta não autorizada'; end if;
  delete from public.eduspruce_avisos where user_id = auth.uid() and chave like 'teste:%';
  insert into public.eduspruce_avisos(user_id, chave, quando, titulo, corpo, v)
  values (auth.uid(), 'teste:' || extract(epoch from now())::bigint, now() + interval '50 seconds',
          'EduSpruce — teste', 'Os avisos com a app fechada estão a funcionar neste aparelho.', 'definicoes');
  return true;
end $$;

-- 5) Usada só pela função «eduspruce-avisos»: tira (e apaga) os avisos que chegaram à hora
create or replace function public.eduspruce_avisos_tirar(p_lim integer default 300)
returns setof public.eduspruce_avisos language sql security definer set search_path = public as $$
  delete from public.eduspruce_avisos where id in (
    select id from public.eduspruce_avisos where quando <= now() order by quando limit greatest(1, least(p_lim, 1000)) for update skip locked)
  returning * $$;

do $$ declare f text; begin
  foreach f in array array['eduspruce_push_registar(text,text,text,text)','eduspruce_push_remover(text)','eduspruce_push_estado()',
                           'eduspruce_avisos_definir(jsonb)','eduspruce_avisos_teste()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon'; execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  execute 'revoke all on function public.eduspruce_avisos_tirar(integer) from public, anon, authenticated';
  execute 'grant execute on function public.eduspruce_avisos_tirar(integer) to service_role';
end $$;
grant select, insert, update, delete on public.eduspruce_push_subs, public.eduspruce_avisos, public.eduspruce_push_vapid to service_role;
grant usage, select on sequence public.eduspruce_avisos_id_seq to service_role;

-- 6) Agendamento: de minuto a minuto, só chama a função se houver avisos à hora
do $$ begin perform cron.unschedule('eduspruce-avisos'); exception when others then null; end $$;
select cron.schedule('eduspruce-avisos', '* * * * *', $cron$
  select net.http_post(
    url := 'https://ssuescpqyhuqkphauwde.supabase.co/functions/v1/eduspruce-avisos',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"cron":true}'::jsonb,
    timeout_milliseconds := 20000)
  where exists (select 1 from public.eduspruce_avisos where quando <= now())
$cron$);

-- avisos com mais de 1 dia de atraso (ex.: função ainda não instalada) são apagados sem enviar
do $$ begin perform cron.unschedule('eduspruce-avisos-limpar'); exception when others then null; end $$;
select cron.schedule('eduspruce-avisos-limpar', '17 3 * * *', $cron$
  delete from public.eduspruce_avisos where quando < now() - interval '1 day'
$cron$);

select 'ok: avisos com a app fechada' as estado,
  (select count(*) from cron.job where jobname like 'eduspruce-avisos%') as agendamentos;
