-- =====================================================================================
-- EduSpruce · SEGURANÇA E RGPD (1.084) — correr uma vez; pode correr-se mais do que uma vez
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run».
--
-- IMPORTANTE: este ficheiro redefine funções criadas pelos scripts 0012 (Spruce It) e 0013 (Pulso).
--             Se algum dia voltar a correr esses scripts, corra este OUTRA VEZ a seguir.
--
-- O que faz:
--   1) Limite de tentativas falhadas por rede (anti-adivinhação de códigos de sala e de códigos pessoais dos alunos).
--   2) Limites de espaço: tamanho máximo de cada parte dos dados e de cada sessão de respostas dos alunos.
--   3) Limpeza diária automática do que já expirou (histórico com mais de 30 dias, sessões, salas, atividades).
--   4) Direito ao apagamento: o professor pode eliminar a sua conta e TUDO o que lhe pertence, de uma vez
--      (e corrige um erro que impedia eliminar contas com dados, também no painel do Supabase).
--   5) Espaço ocupado por conta (só o administrador) e número desta versão dos scripts (a app mostra-o no diagnóstico).
--   6) Verificações no fim (só leitura).
-- =====================================================================================
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------------------
-- 1) LIMITE DE TENTATIVAS FALHADAS
--    Os códigos das salas têm 6 carateres. Sem limite, um programa podia experimentar códigos até acertar numa sala
--    e ler a lista da turma (que vem cifrada com o próprio código). Passa a haver um máximo de tentativas FALHADAS
--    por rede, em janelas de 10 minutos. As entradas certas nunca contam. Do endereço de rede guarda-se só uma
--    impressão digital (SHA-256), apagada ao fim de um dia.
-- ---------------------------------------------------------------------------------------
create table if not exists public.eduspruce_ritmo (
  h      text        not null check (h ~ '^[0-9a-f]{64}$'),
  balde  text        not null check (char_length(balde) between 1 and 20),
  janela timestamptz not null default now(),
  n      integer     not null default 0,
  primary key (h, balde)
);
alter table public.eduspruce_ritmo enable row level security;
alter table public.eduspruce_ritmo force row level security;
revoke all on public.eduspruce_ritmo from public, anon, authenticated;

-- impressão digital da rede de quem faz o pedido (null se a base de dados não a receber: nesse caso não há limite)
create or replace function public.eduspruce_ritmo_ip() returns text
language sql stable security definer set search_path = public, extensions as $$
  select case when ip is null then null else encode(extensions.digest('es-ritmo:' || ip, 'sha256'), 'hex') end
  from (select nullif(btrim(split_part(coalesce(nullif(h->>'cf-connecting-ip',''), nullif(h->>'x-real-ip',''), h->>'x-forwarded-for', ''), ',', 1)), '') as ip
        from (select coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json as h) q) r;
$$;

create or replace function public.eduspruce_ritmo_bloqueado(p_balde text, p_max integer) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select r.n >= p_max from public.eduspruce_ritmo r
                   where r.h = public.eduspruce_ritmo_ip() and r.balde = p_balde and r.janela > now() - interval '10 minutes'), false);
$$;

create or replace function public.eduspruce_ritmo_falha(p_balde text) returns void
language plpgsql security definer set search_path = public as $$
declare ip text := public.eduspruce_ritmo_ip();
begin
  if ip is null then return; end if;
  insert into public.eduspruce_ritmo as r (h, balde, janela, n) values (ip, p_balde, now(), 1)
  on conflict (h, balde) do update set
    n      = case when r.janela > now() - interval '10 minutes' then r.n + 1 else 1 end,
    janela = case when r.janela > now() - interval '10 minutes' then r.janela else now() end;
end $$;
revoke all on function public.eduspruce_ritmo_ip() from public, anon, authenticated;
revoke all on function public.eduspruce_ritmo_bloqueado(text, integer) from public, anon, authenticated;
revoke all on function public.eduspruce_ritmo_falha(text) from public, anon, authenticated;

-- 1a) Spruce It: informação para entrar numa sala (igual à do 0012, com o limite; só conta como falha a sala que não existe)
do $$ begin
  if to_regclass('public.eduspruce_arena_sala') is null then raise notice 'Spruce It (0012) ainda não instalado: passo 1a ignorado.'; return; end if;
  execute $f$
    create or replace function public.arena_info(p_id text) returns jsonb
    language plpgsql volatile security definer set search_path = public as $b$
    declare s public.eduspruce_arena_sala;
    begin
      if p_id is null or p_id !~ '^[0-9a-f]{40}$' then return null; end if;
      if public.eduspruce_ritmo_bloqueado('sala', 300) then return null; end if;
      select * into s from public.eduspruce_arena_sala where id = p_id and expira > now();
      if not found then perform public.eduspruce_ritmo_falha('sala'); return null; end if;
      if s.estado = 'fim' or (s.tipo = 'tpc' and s.limite is not null and s.limite < now()) then return null; end if;
      return public.arena_publico(s) || jsonb_build_object('jogadores', (select count(*) from public.eduspruce_arena_jogador where sala = p_id and not expulso));
    end $b$;
  $f$;
  execute 'revoke all on function public.arena_info(text) from public';
  execute 'grant execute on function public.arena_info(text) to anon, authenticated';
end $$;

-- 1b) Pulso: informação da sala (igual à do 0013, com o limite)
do $$ begin
  if to_regclass('public.eduspruce_pulso_sala') is null then raise notice 'Pulso (0013) ainda não instalado: passo 1b ignorado.'; return; end if;
  execute $f$
    create or replace function public.pulso_sala_info(p_sala text) returns jsonb
    language plpgsql volatile security definer set search_path = public as $b$
    declare s public.eduspruce_pulso_sala; t public.eduspruce_pulso_ativ;
    begin
      if p_sala is null or p_sala !~ '^[0-9a-f]{40}$' then return null; end if;
      if public.eduspruce_ritmo_bloqueado('sala', 300) then return null; end if;
      select * into s from public.eduspruce_pulso_sala where id = p_sala;
      if not found then perform public.eduspruce_ritmo_falha('sala'); return null; end if;
      select * into t from public.eduspruce_pulso_ativ where sala = p_sala and estado <> 'fim' and expira > now() order by criado desc limit 1;
      return jsonb_build_object('nome', s.nome, 'lista', coalesce((s.cfg->>'lista')::boolean, false), 'lista_c', s.cfg->'lista_c', 'mao', coalesce((s.cfg->>'mao')::boolean, true),
        'ativ', case when t.id is null then null else jsonb_build_object('id', t.id, 'tipo', t.tipo, 'modo', t.modo, 'titulo', t.cfg->'titulo', 'nomes', t.cfg->'nomes', 'equipas', t.cfg->'equipas') end);
    end $b$;
  $f$;
  execute 'revoke all on function public.pulso_sala_info(text) from public';
  execute 'grant execute on function public.pulso_sala_info(text) to anon, authenticated';
end $$;

-- 1c) Entrar (Spruce It e Pulso): a função original passa a «…_base» (só chamada por dentro) e fica uma função de entrada
--     com o mesmo nome que conta as falhas: sala que não existe e, no Pulso, código pessoal errado.
do $$
declare ja boolean;
begin
  -- Spruce It
  if to_regprocedure('public.arena_entrar(text,text,text,text,text)') is not null then
    select p.prosrc like '%eduspruce_ritmo%' into ja from pg_proc p where p.oid = to_regprocedure('public.arena_entrar(text,text,text,text,text)');
    if not ja then
      if to_regprocedure('public.arena_entrar_base(text,text,text,text,text)') is not null then execute 'drop function public.arena_entrar_base(text,text,text,text,text)'; end if;
      execute 'alter function public.arena_entrar(text,text,text,text,text) rename to arena_entrar_base';
    end if;
    execute $f$
      create or replace function public.arena_entrar(p_id text, p_alcunha text, p_tok text, p_ref text default null, p_avatar text default 'p01') returns jsonb
      language plpgsql volatile security definer set search_path = public as $b$
      declare r jsonb;
      begin
        if public.eduspruce_ritmo_bloqueado('sala', 300) then return jsonb_build_object('erro', 'espere'); end if;
        r := public.arena_entrar_base(p_id, p_alcunha, p_tok, p_ref, p_avatar);
        if r->>'erro' = 'sala' then perform public.eduspruce_ritmo_falha('sala'); end if;
        return r;
      end $b$;
    $f$;
    execute 'revoke all on function public.arena_entrar_base(text,text,text,text,text) from public, anon, authenticated';
    execute 'revoke all on function public.arena_entrar(text,text,text,text,text) from public';
    execute 'grant execute on function public.arena_entrar(text,text,text,text,text) to anon, authenticated';
  end if;
  -- Pulso
  if to_regprocedure('public.pulso_entrar(text,uuid,text,text,text,text)') is not null then
    select p.prosrc like '%eduspruce_ritmo%' into ja from pg_proc p where p.oid = to_regprocedure('public.pulso_entrar(text,uuid,text,text,text,text)');
    if not ja then
      if to_regprocedure('public.pulso_entrar_base(text,uuid,text,text,text,text)') is not null then execute 'drop function public.pulso_entrar_base(text,uuid,text,text,text,text)'; end if;
      execute 'alter function public.pulso_entrar(text,uuid,text,text,text,text) rename to pulso_entrar_base';
    end if;
    execute $f$
      create or replace function public.pulso_entrar(p_sala text, p_ativ uuid, p_nome text, p_tok text, p_ref text default null, p_cod text default null) returns jsonb
      language plpgsql volatile security definer set search_path = public as $b$
      declare r jsonb;
      begin
        if public.eduspruce_ritmo_bloqueado('sala', 300) or (p_cod is not null and public.eduspruce_ritmo_bloqueado('codigo', 150)) then return jsonb_build_object('erro', 'espere'); end if;
        r := public.pulso_entrar_base(p_sala, p_ativ, p_nome, p_tok, p_ref, p_cod);
        if r->>'erro' = 'sala' then perform public.eduspruce_ritmo_falha('sala');
        elsif r->>'erro' = 'codigo' then perform public.eduspruce_ritmo_falha('codigo'); end if;
        return r;
      end $b$;
    $f$;
    execute 'revoke all on function public.pulso_entrar_base(text,uuid,text,text,text,text) from public, anon, authenticated';
    execute 'revoke all on function public.pulso_entrar(text,uuid,text,text,text,text) from public';
    execute 'grant execute on function public.pulso_entrar(text,uuid,text,text,text,text) to anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------------------
-- 2) LIMITES DE ESPAÇO
-- ---------------------------------------------------------------------------------------
-- cada parte dos dados (uma linha) tem no máximo 26 MB de texto cifrado (só se verifica nas gravações novas)
alter table public.eduspruce_partes drop constraint if exists eduspruce_partes_tamanho;
alter table public.eduspruce_partes add constraint eduspruce_partes_tamanho check (char_length(conteudo) <= 26000000) not valid;

-- respostas dos alunos (autoavaliação, Formulários, Provas): além das 400 respostas por sessão, 30 MB no total por sessão
do $$ begin
  if to_regclass('public.eduspruce_autoav_resp') is null then raise notice 'Autoavaliação (0004) ainda não instalada: passo 2 ignorado.'; return; end if;
  execute $f$
    create or replace function public.eduspruce_autoav_enviar(p_id text, p_conteudo text) returns boolean
    language plpgsql security definer set search_path = public as $b$
    declare n integer; tot bigint;
    begin
      if p_id is null or p_id !~ '^[0-9a-f]{40}$' or p_conteudo is null or char_length(p_conteudo) not between 10 and 200000 then return false; end if;
      if not exists (select 1 from public.eduspruce_autoav s where s.id = p_id and s.aberta and s.expira > now()) then return false; end if;
      select count(*), coalesce(sum(char_length(r.conteudo)), 0) into n, tot from public.eduspruce_autoav_resp r where r.sessao = p_id;
      if n >= 400 or tot + char_length(p_conteudo) > 30000000 then return false; end if;
      insert into public.eduspruce_autoav_resp (sessao, conteudo) values (p_id, p_conteudo);
      delete from public.eduspruce_autoav where expira < now() - interval '30 days';   -- arrumação (também feita pela limpeza diária)
      return true;
    end $b$;
  $f$;
  execute 'revoke all on function public.eduspruce_autoav_enviar(text, text) from public';
  execute 'grant execute on function public.eduspruce_autoav_enviar(text, text) to anon, authenticated';
end $$;

-- ---------------------------------------------------------------------------------------
-- 3) LIMPEZA DIÁRIA do que já expirou (antes só acontecia quando o próprio professor voltava a usar a app)
-- ---------------------------------------------------------------------------------------
create or replace function public.eduspruce_limpeza() returns jsonb
language plpgsql security definer set search_path = public as $$
declare o jsonb := '{}'::jsonb; n bigint;
begin
  if to_regclass('public.eduspruce_partes_hist') is not null then
    delete from public.eduspruce_partes_hist where guardado < now() - interval '30 days'; get diagnostics n = row_count; o := o || jsonb_build_object('historico', n); end if;
  if to_regclass('public.eduspruce_autoav') is not null then
    execute 'delete from public.eduspruce_autoav where expira < now() - interval ''30 days'''; get diagnostics n = row_count; o := o || jsonb_build_object('sessoes', n); end if;
  if to_regclass('public.eduspruce_arena_sala') is not null then
    execute 'delete from public.eduspruce_arena_sala where expira < now() - interval ''1 day'''; get diagnostics n = row_count; o := o || jsonb_build_object('salas', n); end if;
  if to_regclass('public.eduspruce_pulso_ativ') is not null then
    execute 'delete from public.eduspruce_pulso_ativ where expira < now() - interval ''1 day'''; get diagnostics n = row_count; o := o || jsonb_build_object('atividades', n);
    execute 'delete from public.eduspruce_pulso_mao where criado < now() - interval ''2 days'''; end if;
  if to_regclass('public.eduspruce_avisos') is not null then
    execute 'delete from public.eduspruce_avisos where quando < now() - interval ''2 days'''; get diagnostics n = row_count; o := o || jsonb_build_object('avisos', n); end if;
  delete from public.eduspruce_ritmo where janela < now() - interval '1 day'; get diagnostics n = row_count; o := o || jsonb_build_object('ritmo', n);
  return o;
end $$;
revoke all on function public.eduspruce_limpeza() from public, anon, authenticated;
do $$ begin
  begin perform cron.unschedule('eduspruce-limpeza'); exception when others then null; end;
  begin perform cron.schedule('eduspruce-limpeza', '23 3 * * *', 'select public.eduspruce_limpeza()');
  exception when others then raise notice 'Limpeza diária NÃO agendada (falta a extensão pg_cron: Database › Extensions › pg_cron). A limpeza continua a acontecer quando cada professor usa a app.'; end;
end $$;

-- ---------------------------------------------------------------------------------------
-- 4a) CORREÇÃO: eliminar uma conta falhava (também no painel do Supabase, em Authentication › Users › Delete user)
--     Ao apagar as linhas da conta, o aviso em tempo real tentava registar uma alteração para uma conta que já não existe.
-- ---------------------------------------------------------------------------------------
do $$ begin
  if to_regclass('public.eduspruce_sinal') is null then return; end if;
  execute $f$
    create or replace function public.eduspruce_sinalizar() returns trigger
    language plpgsql security definer set search_path = public as $b$
    declare u uuid;
    begin
      if tg_op = 'DELETE' then u := old.user_id; else u := new.user_id; end if;
      begin
        insert into public.eduspruce_sinal (user_id, versao, atualizado) values (u, 1, now())
        on conflict (user_id) do update set versao = public.eduspruce_sinal.versao + 1, atualizado = now();
      exception when foreign_key_violation then null;   -- a própria conta está a ser eliminada: não há ninguém para avisar
      end;
      return null;
    end $b$;
  $f$;
  execute 'revoke all on function public.eduspruce_sinalizar() from public, anon, authenticated';
end $$;

-- ---------------------------------------------------------------------------------------
-- 4) DIREITO AO APAGAMENTO (RGPD, art.º 17.º): eliminar a própria conta e tudo o que lhe pertence
--    Apaga de uma vez: dados e histórico, sessões e respostas de alunos, salas e jogos, partilhas, avisos, horários de que é dono
--    e a própria conta. Não há cópia que fique. (A autorização para entrar — impressão digital do e-mail — é gerida pelo administrador.)
-- ---------------------------------------------------------------------------------------
create or replace function public.eduspruce_apagar_conta(p_confirmar text) returns boolean
language plpgsql security definer set search_path = public, auth as $$
declare u uuid := auth.uid(); em text;
begin
  if u is null then raise exception 'sem sessão'; end if;
  if p_confirmar is distinct from 'APAGAR' then raise exception 'confirmação em falta'; end if;
  select lower(btrim(email)) into em from auth.users where id = u;
  if em is not null and to_regclass('public.eduspruce_eduschedule_membros') is not null then
    begin execute 'delete from public.eduspruce_eduschedule_membros where lower(email) = $1' using em; exception when others then null; end;
  end if;
  delete from auth.users where id = u;   -- todas as tabelas da EduSpruce apagam em cascata
  return true;
end $$;
revoke all on function public.eduspruce_apagar_conta(text) from public, anon;
grant execute on function public.eduspruce_apagar_conta(text) to authenticated;

-- ---------------------------------------------------------------------------------------
-- 5) ESPAÇO OCUPADO (só o administrador) e versão dos scripts
-- ---------------------------------------------------------------------------------------
create or replace function public.eduspruce_admin_uso() returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.eduspruce_admin() then raise exception 'só o administrador'; end if;
  return jsonb_build_object(
    'bd_bytes', pg_database_size(current_database()),
    'contas', (select count(*) from auth.users),
    'por_conta', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('email', (select lower(u.email) from auth.users u where u.id = p.user_id), 'partes', count(*),
                                  'bytes', sum(char_length(p.conteudo))::bigint, 'ultima', max(p.atualizado)) x
        from public.eduspruce_partes p group by p.user_id order by sum(char_length(p.conteudo)) desc limit 100) q));
end $$;
revoke all on function public.eduspruce_admin_uso() from public, anon;
grant execute on function public.eduspruce_admin_uso() to authenticated;

-- número desta versão dos scripts (a app mostra no diagnóstico e avisa o administrador se faltar)
create or replace function public.eduspruce_bd_versao() returns integer language sql immutable as $$ select 19 $$;
grant execute on function public.eduspruce_bd_versao() to anon, authenticated;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------------------
-- 6) VERIFICAÇÕES (só leitura) — o que deve aparecer está entre parênteses
-- ---------------------------------------------------------------------------------------
create or replace function pg_temp.es_ver() returns table (verificacao text, resultado text) language plpgsql as $$
declare x text;
begin
  verificacao := 'versão dos scripts (19)'; resultado := public.eduspruce_bd_versao()::text; return next;
  verificacao := 'limite de tentativas ativo no Spruce It e no Pulso (true)';
  resultado := (coalesce((select prosrc like '%eduspruce_ritmo%' from pg_proc where oid = to_regprocedure('public.arena_entrar(text,text,text,text,text)')), true)
            and coalesce((select prosrc like '%eduspruce_ritmo%' from pg_proc where oid = to_regprocedure('public.pulso_entrar(text,uuid,text,text,text,text)')), true))::text; return next;
  verificacao := 'limpeza diária agendada (1)';
  begin execute $q$select count(*)::text from cron.job where jobname = 'eduspruce-limpeza'$q$ into x; exception when others then x := 'pg_cron em falta'; end; resultado := x; return next;
  verificacao := 'contas sem entrada Google (0 — ver nota abaixo)';
  begin execute $q$select count(*)::text from auth.users u where not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider in ('google','azure'))$q$ into x; exception when others then x := '?'; end; resultado := x; return next;
  verificacao := 'tabelas da EduSpruce sem RLS (0)';
  resultado := (select count(*)::text from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'eduspruce_%' and not c.relrowsecurity); return next;
end $$;
select * from pg_temp.es_ver();

-- NOTA SOBRE AS CONTAS (verificar uma vez, à mão, no painel do Supabase):
--   A autorização é feita pelo e-mail da conta. Para ninguém conseguir criar uma conta com o e-mail de outra pessoa:
--     Authentication › Sign In / Providers › Email › «Confirm email» tem de estar LIGADO.
--   Se todas as contas entram com Google (resultado 0 na verificação acima), pode ir mais longe e exigir que a conta
--   tenha entrada Google: descomente o bloco seguinte e corra-o. Quem só tiver e-mail + palavra-passe deixa de entrar.
--
-- create or replace function public.eduspruce_autorizado() returns boolean
-- language sql stable security definer set search_path = public, auth, extensions as $$
--   select exists (select 1 from public.eduspruce_autorizados a
--            where a.h = encode(extensions.digest('eduspruce:' || public.eduspruce_email_atual(), 'sha256'), 'hex'))
--      and exists (select 1 from auth.identities i where i.user_id = auth.uid() and i.provider in ('google','azure'));
-- $$;
