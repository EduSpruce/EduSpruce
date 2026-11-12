-- =====================================================================================
-- EduSpruce · ARENA — jogos de perguntas em tempo real para a turma
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
--
-- Como funciona (sem contas para os alunos):
--   · o professor lança um jogo; a app gera um código de sala (ex.: K7Q-F2M). A base de dados só guarda o «hash» do código.
--   · o aluno abre eduspruce.pt/arena.html (QR code ou link), escreve o código e uma alcunha (ou escolhe o nome na lista
--     da turma, que vai CIFRADA com uma chave que sai do código) e joga.
--   · os alunos NUNCA leem tabelas: só chamam funções que verificam a sala, o token do jogador e o estado do jogo.
--   · as soluções ficam numa tabela à parte que só o professor lê; é o servidor que corrige e dá os pontos.
--   · de um aluno só se guarda a alcunha, o avatar e as respostas; as salas expiram sozinhas.
--   · as coleções de Pinhas (moedas) só existem quando o jogo usa a lista da turma e ficam na conta do professor.
-- =====================================================================================

-- 1) Salas (uma por jogo lançado)
create table if not exists public.eduspruce_arena_sala (
  id         text        primary key check (id ~ '^[0-9a-f]{40}$'),
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  tipo       text        not null check (tipo in ('vivo','tpc')),
  modo       text        not null check (modo ~ '^[a-z]{3,20}$'),
  estado     text        not null default 'espera' check (estado in ('espera','jogo','pausa','fim')),
  cfg        jsonb       not null default '{}'::jsonb,
  perguntas  jsonb       not null check (jsonb_typeof(perguntas) = 'array' and octet_length(perguntas::text) < 8000000),
  n_perg     integer     not null check (n_perg between 1 and 300),
  atual      integer     not null default -1,
  atual_ini  timestamptz,
  revelada   boolean     not null default false,
  inicio     timestamptz,
  fim_em     timestamptz,
  pausa_em   timestamptz,
  terminado  timestamptz,
  limite     timestamptz,
  versao     integer     not null default 0,
  expira     timestamptz not null check (expira <= now() + interval '45 days'),
  criado     timestamptz not null default now()
);
create index if not exists eduspruce_arena_sala_user on public.eduspruce_arena_sala (user_id);

-- 2) Soluções (só o professor)
create table if not exists public.eduspruce_arena_chave (
  sala   text  primary key references public.eduspruce_arena_sala(id) on delete cascade,
  certas jsonb not null check (jsonb_typeof(certas) = 'array')
);

-- 3) Jogadores (alcunha + pontuação; sem nomes completos, sem contas)
create table if not exists public.eduspruce_arena_jogador (
  id       uuid        primary key default gen_random_uuid(),
  sala     text        not null references public.eduspruce_arena_sala(id) on delete cascade,
  alcunha  text        not null check (char_length(alcunha) between 1 and 24),
  ref      text        check (ref is null or ref ~ '^[0-9a-f]{16,64}$'),
  avatar   text        not null default 'p01' check (avatar ~ '^p[0-9]{2}$'),
  token    text        not null check (token ~ '^[0-9a-f]{64}$'),
  pontos   bigint      not null default 0,
  certas   integer     not null default 0,
  erradas  integer     not null default 0,
  moedas   integer     not null default 0,
  estado   jsonb       not null default '{}'::jsonb,
  expulso  boolean     not null default false,
  terminou boolean     not null default false,
  visto    timestamptz not null default now(),
  criado   timestamptz not null default now()
);
create unique index if not exists eduspruce_arena_jog_alc on public.eduspruce_arena_jogador (sala, lower(alcunha));
create index if not exists eduspruce_arena_jog_sala on public.eduspruce_arena_jogador (sala);

-- 4) Respostas
create table if not exists public.eduspruce_arena_resp (
  id      bigint generated always as identity primary key,
  sala    text        not null references public.eduspruce_arena_sala(id) on delete cascade,
  jogador uuid        not null references public.eduspruce_arena_jogador(id) on delete cascade,
  perg    integer     not null,
  opc     integer     not null,
  certa   boolean     not null,
  ms      integer     not null,
  pts     integer     not null default 0,
  criado  timestamptz not null default now()
);
create index if not exists eduspruce_arena_resp_sala on public.eduspruce_arena_resp (sala);
create index if not exists eduspruce_arena_resp_jog on public.eduspruce_arena_resp (jogador, perg);

-- 5) Coleções de Pinhas (só com a lista da turma; na conta do professor)
create table if not exists public.eduspruce_arena_colecao (
  user_id uuid        not null references auth.users(id) on delete cascade,
  ref     text        not null check (ref ~ '^[0-9a-f]{16,64}$'),
  moedas  integer     not null default 0 check (moedas >= 0),
  pinhas  jsonb       not null default '{}'::jsonb,
  mudado  timestamptz not null default now(),
  primary key (user_id, ref)
);

-- Segurança: ninguém lê nem escreve nas tabelas diretamente, a não ser o professor dono (só leitura); tudo o resto passa pelas funções
do $$ declare t text; begin
  foreach t in array array['eduspruce_arena_sala','eduspruce_arena_chave','eduspruce_arena_jogador','eduspruce_arena_resp','eduspruce_arena_colecao'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop; end $$;
drop policy if exists "arena sala: as minhas" on public.eduspruce_arena_sala;
create policy "arena sala: as minhas" on public.eduspruce_arena_sala for select to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado());
grant select on public.eduspruce_arena_sala to authenticated;

-- ---------- utilitários ----------
create or replace function public.arena_hash(p text) returns text
language sql immutable set search_path = public as $$ select encode(sha256(convert_to(coalesce(p,''),'UTF8')),'hex') $$;

create or replace function public.arena_impropria(p text) returns boolean
language sql immutable set search_path = public as $$
  select translate(lower(coalesce(p,'')),'áàâãäéèêëíìîïóòôõöúùûüçñ013457@$','aaaaaeeeeiiiiooooouuuucnoieastas') ~
    '(merd|caralh|fod[aei]|foder|puta|put[oa]s|cabr[aã]o|cabrona|paneleir|panasc|conas?$|^cona|piça|picha|piroca|rabeta|maric|bich[ao]n|corno|otario|idiota|estupid|burr[oa]|atrasad|mongol|retardad|fuck|shit|bitch|dick|cock|pussy|cunt|nigg|whore|slut|bastard|asshole|porn|sex|nazi|hitler|vagin|penis|anus|cuzao|cu[sz]?$|^cu[sz]?$|bost|pila$|^pila|tesao|mamas$|broch|chupa|punhet|siririca)';
$$;

create or replace function public.arena_jog(p_sala text, p_j uuid, p_tok text) returns public.eduspruce_arena_jogador
language sql stable security definer set search_path = public as $$
  select j.* from public.eduspruce_arena_jogador j where j.id = p_j and j.sala = p_sala and j.token = public.arena_hash(p_tok);
$$;

-- estado público de uma sala (nunca inclui soluções, a não ser a da pergunta já revelada)
create or replace function public.arena_publico(s public.eduspruce_arena_sala) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'modo', s.modo, 'tipo', s.tipo, 'estado', s.estado, 'atual', s.atual, 'revelada', s.revelada, 'n_perg', s.n_perg, 'versao', s.versao,
    'agora', now(), 'atual_ini', s.atual_ini, 'inicio', s.inicio, 'fim_em', s.fim_em, 'pausa_em', s.pausa_em, 'limite', s.limite,
    'cfg', jsonb_build_object('nomes', s.cfg->'nomes', 'lista_c', s.cfg->'lista_c', 'moedas', s.cfg->'moedas', 'tardias', s.cfg->'tardias',
            'duracao', s.cfg->'duracao', 'objetivo', s.cfg->'objetivo', 'titulo', s.cfg->'titulo', 'tempo', s.cfg->'tempo'),
    'pergunta', case when s.modo = 'classico' and s.tipo = 'vivo' and s.atual >= 0 and s.estado in ('jogo','pausa') then s.perguntas->s.atual end,
    'certa', case when s.revelada and s.atual >= 0 then (select c.certas->s.atual from public.eduspruce_arena_chave c where c.sala = s.id) end
  );
$$;

create or replace function public.arena_top(p_sala text, p_n integer default 10) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x->>'pos'), '[]'::jsonb) from (
    select jsonb_build_object('pos', lpad((row_number() over (order by pontos desc, criado))::text, 3, '0'), 'id', id, 'alcunha', alcunha, 'avatar', avatar, 'pontos', pontos,
           'arv', coalesce((estado->>'arv')::int, 0)) x
    from public.eduspruce_arena_jogador where sala = p_sala and not expulso order by pontos desc, criado limit p_n) q;
$$;

-- =========================== FUNÇÕES DO ALUNO (sem conta) ===========================

-- informação para entrar (só salas ativas)
create or replace function public.arena_info(p_id text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.eduspruce_arena_sala;
begin
  if p_id !~ '^[0-9a-f]{40}$' then return null; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id and expira > now();
  if not found or s.estado = 'fim' or (s.tipo = 'tpc' and s.limite is not null and s.limite < now()) then return null; end if;
  return public.arena_publico(s) || jsonb_build_object('jogadores', (select count(*) from public.eduspruce_arena_jogador where sala = p_id and not expulso));
end $$;

-- entrar (ou voltar a entrar depois de uma quebra de rede)
create or replace function public.arena_entrar(p_id text, p_alcunha text, p_tok text, p_ref text default null, p_avatar text default 'p01') returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; a text; n integer; h text;
begin
  if p_id !~ '^[0-9a-f]{40}$' or p_tok is null or char_length(p_tok) < 16 or char_length(p_tok) > 128 then return jsonb_build_object('erro','pedido'); end if;
  delete from public.eduspruce_arena_sala where expira < now() - interval '1 day';   -- arrumação
  select * into s from public.eduspruce_arena_sala where id = p_id and expira > now();
  if not found or s.estado = 'fim' then return jsonb_build_object('erro','sala'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  a := regexp_replace(btrim(coalesce(p_alcunha,'')), '\s+', ' ', 'g');
  if char_length(a) < 2 or char_length(a) > 24 then return jsonb_build_object('erro','alcunha'); end if;
  if coalesce(s.cfg->>'nomes','livre') = 'livre' and public.arena_impropria(a) then return jsonb_build_object('erro','impropria'); end if;
  if coalesce(s.cfg->>'nomes','livre') = 'lista' and (p_ref is null or p_ref !~ '^[0-9a-f]{16,64}$') then return jsonb_build_object('erro','lista'); end if;
  if p_avatar !~ '^p[0-9]{2}$' then p_avatar := 'p01'; end if;
  h := public.arena_hash(p_tok);
  -- já existe? (mesmo token, ou mesmo nome da lista / mesma alcunha e o aparelho anterior desligou-se)
  select * into j from public.eduspruce_arena_jogador where sala = p_id and (token = h
     or (p_ref is not null and ref = p_ref) or lower(alcunha) = lower(a)) order by (token = h) desc limit 1;
  if found then
    if j.expulso then return jsonb_build_object('erro','expulso'); end if;
    if j.token <> h and j.visto > now() - interval '25 seconds' then return jsonb_build_object('erro','emuso'); end if;
    update public.eduspruce_arena_jogador set token = h, visto = now(), avatar = case when p_avatar <> 'p01' then p_avatar else avatar end where id = j.id returning * into j;
    return jsonb_build_object('j', j.id, 'alcunha', j.alcunha, 'avatar', j.avatar, 'pontos', j.pontos, 'voltou', true, 'sala', public.arena_publico(s));
  end if;
  if s.estado <> 'espera' and s.tipo = 'vivo' and coalesce((s.cfg->>'tardias')::boolean, true) = false then return jsonb_build_object('erro','tardia'); end if;
  select count(*) into n from public.eduspruce_arena_jogador where sala = p_id;
  if n >= 80 then return jsonb_build_object('erro','cheia'); end if;
  begin
    insert into public.eduspruce_arena_jogador (sala, alcunha, ref, avatar, token) values (p_id, a, p_ref, p_avatar, h) returning * into j;
  exception when unique_violation then return jsonb_build_object('erro','emuso'); end;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('j', j.id, 'alcunha', j.alcunha, 'avatar', j.avatar, 'pontos', 0, 'voltou', false, 'sala', public.arena_publico(s));
end $$;

-- estado (o aluno chama quando recebe um aviso em tempo real, e de poucos em poucos segundos)
create or replace function public.arena_estado(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; pos integer; tot integer; resp jsonb;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not found then return jsonb_build_object('erro','sala'); end if;
  update public.eduspruce_arena_jogador set visto = now() where id = j.id;
  select count(*) + 1 into pos from public.eduspruce_arena_jogador where sala = p_id and not expulso and (pontos > j.pontos or (pontos = j.pontos and criado < j.criado));
  select count(*) into tot from public.eduspruce_arena_jogador where sala = p_id and not expulso;
  if s.modo = 'classico' and s.tipo = 'vivo' and s.atual >= 0 then
    select jsonb_build_object('opc', r.opc, 'certa', case when s.revelada then r.certa end, 'pts', case when s.revelada then r.pts end) into resp
    from public.eduspruce_arena_resp r where r.jogador = j.id and r.perg = s.atual limit 1;
  end if;
  return jsonb_build_object('sala', public.arena_publico(s), 'top', public.arena_top(p_id, 5),
    'eu', jsonb_build_object('alcunha', j.alcunha, 'avatar', j.avatar, 'pontos', j.pontos, 'certas', j.certas, 'erradas', j.erradas, 'moedas', j.moedas,
          'estado', j.estado - 'ordem' - 'q_ini', 'expulso', j.expulso, 'terminou', j.terminou, 'pos', pos, 'total', tot, 'resp', resp));
end $$;

-- próxima pergunta (modos ao ritmo de cada aluno e trabalho de casa)
create or replace function public.arena_pergunta(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; e jsonb; ord jsonb; k integer; q integer; dur integer; ini timestamptz; obj integer;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  if s.tipo = 'vivo' and s.estado <> 'jogo' then return jsonb_build_object('erro','espera'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  if s.modo = 'classico' and s.tipo = 'vivo' then return jsonb_build_object('erro','vivo'); end if;
  if s.tipo = 'vivo' and s.fim_em is not null and s.fim_em < now() then perform public.arena_fechar(p_id); return jsonb_build_object('erro','fim'); end if;
  if j.terminou then return jsonb_build_object('erro','terminou'); end if;
  e := j.estado;
  if coalesce((e->>'escolha')::boolean, false) then return jsonb_build_object('escolha', true); end if;
  -- tempo de jogo de cada aluno no trabalho de casa
  if s.tipo = 'tpc' then
    ini := coalesce((e->>'ini')::timestamptz, now()); if e->>'ini' is null then e := e || jsonb_build_object('ini', now()); end if;
    dur := nullif((s.cfg->>'duracao')::int, 0);
    if s.modo <> 'classico' and dur is not null and now() > ini + make_interval(secs => dur) then
      update public.eduspruce_arena_jogador set terminou = true, estado = e where id = j.id; perform public.arena_creditar(j.id); return jsonb_build_object('erro','terminou'); end if;
  end if;
  ord := e->'ordem'; k := coalesce((e->>'k')::int, 0);
  if ord is null or jsonb_array_length(ord) <> s.n_perg or k >= s.n_perg then
    if s.modo = 'classico' and k >= s.n_perg and ord is not null then
      update public.eduspruce_arena_jogador set terminou = true where id = j.id; return jsonb_build_object('erro','terminou'); end if;
    select jsonb_agg(i order by case when coalesce((s.cfg->>'aleatoria')::boolean, true) then random() else i end) into ord from generate_series(0, s.n_perg - 1) i;
    -- não repetir a mesma pergunta seguida ao recomeçar
    if s.n_perg > 1 and (ord->>0)::int = coalesce((e->>'q')::int, -1) then ord := (ord - 0) || jsonb_build_array(ord->0); end if;
    k := 0;
  end if;
  q := (ord->>k)::int;
  e := e || jsonb_build_object('ordem', ord, 'k', k, 'q', q, 'q_ini', now());
  update public.eduspruce_arena_jogador set estado = e, visto = now() where id = j.id;
  return jsonb_build_object('i', q, 'n', k + 1, 'pergunta', s.perguntas->q, 'ini', e->>'ini');
end $$;

-- responder: o servidor corrige, dá pontos e aplica a regra do modo
create or replace function public.arena_responder(p_id text, p_j uuid, p_tok text, p_perg integer, p_opc integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; c jsonb; certa boolean; ms integer; tmax integer; pts integer := 0; e jsonb; seq integer;
        ultima timestamptz; ganho integer := 0; arv integer; obj integer; ci integer; fim boolean := false;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  if s.tipo = 'vivo' and s.estado <> 'jogo' then return jsonb_build_object('erro','espera'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  if p_perg < 0 or p_perg >= s.n_perg or p_opc < -1 or p_opc > 5 then return jsonb_build_object('erro','pedido'); end if;
  if s.tipo = 'vivo' and s.fim_em is not null and s.fim_em < now() + interval '-2 seconds' then perform public.arena_fechar(p_id); return jsonb_build_object('erro','fim'); end if;
  select max(criado) into ultima from public.eduspruce_arena_resp where jogador = j.id;
  if ultima is not null and ultima > now() - interval '300 milliseconds' then return jsonb_build_object('erro','depressa'); end if;
  select certas into c from public.eduspruce_arena_chave where sala = p_id;
  ci := (c->>p_perg)::int; certa := (p_opc = ci);
  e := j.estado; seq := coalesce((e->>'seq')::int, 0);
  tmax := greatest(5, coalesce((s.perguntas->p_perg->>'s')::int, (s.cfg->>'tempo')::int, 20));
  if s.modo = 'classico' and s.tipo = 'vivo' then
    if p_perg <> s.atual or s.revelada then return jsonb_build_object('erro','fora'); end if;
    if exists (select 1 from public.eduspruce_arena_resp where jogador = j.id and perg = p_perg) then return jsonb_build_object('erro','repetida'); end if;
    ms := (extract(epoch from (now() - s.atual_ini)) * 1000)::int;
    if ms > (tmax + 3) * 1000 then return jsonb_build_object('erro','tempo'); end if;
  else
    if coalesce((e->>'q')::int, -1) <> p_perg or coalesce((e->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
    ms := (extract(epoch from (now() - coalesce((e->>'q_ini')::timestamptz, now()))) * 1000)::int;
    e := e || jsonb_build_object('k', coalesce((e->>'k')::int, 0) + 1, 'q_ini', null);
  end if;
  ms := greatest(0, least(ms, 600000));
  if certa then seq := seq + 1; else seq := 0; end if;
  e := e || jsonb_build_object('seq', seq);
  if s.modo = 'classico' then
    if certa then pts := 500 + greatest(0, round(500 * (1 - least(ms, tmax * 1000)::numeric / (tmax * 1000))))::int + 50 * least(seq - 1, 5); end if;
  elsif s.modo = 'colheita' then
    if certa then e := e || jsonb_build_object('escolha', true); end if;
  elsif s.modo = 'floresta' then
    if certa then ganho := 1 + case when seq % 3 = 0 then 1 else 0 end; end if;
    arv := coalesce((e->>'arv')::int, 0) + ganho; e := e || jsonb_build_object('arv', arv); pts := ganho * 10;
  end if;
  insert into public.eduspruce_arena_resp (sala, jogador, perg, opc, certa, ms, pts) values (p_id, j.id, p_perg, p_opc, certa, ms, pts);
  update public.eduspruce_arena_jogador set pontos = pontos + pts, certas = certas + certa::int, erradas = erradas + (not certa)::int,
         moedas = moedas + case when certa and coalesce((s.cfg->>'moedas')::boolean, true) then 2 else 0 end, estado = e, visto = now()
  where id = j.id returning * into j;
  -- objetivo atingido?
  obj := nullif((s.cfg->>'objetivo')::int, 0);
  if obj is not null and ((s.modo = 'floresta' and coalesce((j.estado->>'arv')::int, 0) >= obj) or (s.modo <> 'floresta' and j.pontos >= obj)) then
    if s.tipo = 'vivo' then perform public.arena_fechar(p_id); else update public.eduspruce_arena_jogador set terminou = true where id = j.id; perform public.arena_creditar(j.id); end if; fim := true;
  end if;
  if s.tipo = 'tpc' and s.modo = 'classico' and coalesce((j.estado->>'k')::int, 0) >= s.n_perg then
    update public.eduspruce_arena_jogador set terminou = true where id = j.id; fim := true; perform public.arena_creditar(j.id);
  end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('certa', case when s.modo = 'classico' and s.tipo = 'vivo' then null else certa end,
    'ci', case when s.modo = 'classico' and s.tipo = 'vivo' then null else ci end,
    'pts', case when s.modo = 'classico' and s.tipo = 'vivo' then null else pts end,
    'pontos', case when s.modo = 'classico' and s.tipo = 'vivo' then null else j.pontos end,
    'escolha', coalesce((j.estado->>'escolha')::boolean, false), 'arv', coalesce((j.estado->>'arv')::int, 0), 'seq', seq, 'moedas', j.moedas, 'fim', fim);
end $$;

-- Colheita: abrir uma das três pinhas (o efeito decide-se aqui, no servidor)
create or replace function public.arena_acao(p_id text, p_j uuid, p_tok text, p_escolha integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; o public.eduspruce_arena_jogador; r numeric; ef text; v integer := 0; antes bigint; outros jsonb := '[]'::jsonb; i integer; x text;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.modo <> 'colheita' or not coalesce((j.estado->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  antes := j.pontos;
  -- sorteio do efeito
  r := random();
  if r < 0.50 then ef := 'ganha'; v := (array[10,15,20,25,30,40,50,75,100])[1 + floor(random() * 9)::int];
  elsif r < 0.56 then ef := 'mega'; v := 150 + 50 * floor(random() * 3)::int;
  elsif r < 0.68 then ef := 'dobra';
  elsif r < 0.80 then ef := 'perde';
  elsif r < 0.90 then ef := 'troca';
  else ef := 'vazia'; end if;
  if ef = 'troca' then
    select * into o from public.eduspruce_arena_jogador where sala = p_id and id <> j.id and not expulso and pontos <> j.pontos order by random() limit 1;
    if s.tipo = 'tpc' or o.id is null then ef := 'ganha'; v := 25; end if;
  end if;
  if ef in ('ganha','mega') then update public.eduspruce_arena_jogador set pontos = pontos + v where id = j.id;
  elsif ef = 'dobra' then v := greatest(j.pontos, 20)::int; update public.eduspruce_arena_jogador set pontos = pontos + v where id = j.id;
  elsif ef = 'perde' then v := ceil(j.pontos * 0.25)::int; update public.eduspruce_arena_jogador set pontos = pontos - v where id = j.id;
  elsif ef = 'troca' then
    update public.eduspruce_arena_jogador set pontos = o.pontos where id = j.id;
    update public.eduspruce_arena_jogador set pontos = antes, estado = estado || jsonb_build_object('trocado', jsonb_build_object('por', j.alcunha, 'em', now())) where id = o.id;
  end if;
  update public.eduspruce_arena_jogador set estado = (estado - 'escolha') || jsonb_build_object('ultimo', ef), visto = now() where id = j.id returning * into j;
  -- o que estava nas outras duas pinhas (só para mostrar)
  for i in 1..2 loop x := (array['ganha','ganha','ganha','dobra','perde','troca','vazia','mega'])[1 + floor(random() * 8)::int]; outros := outros || to_jsonb(x); end loop;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  if nullif((s.cfg->>'objetivo')::int, 0) is not null and j.pontos >= (s.cfg->>'objetivo')::int then
    if s.tipo = 'vivo' then perform public.arena_fechar(p_id); else update public.eduspruce_arena_jogador set terminou = true where id = j.id; perform public.arena_creditar(j.id); end if;
  end if;
  return jsonb_build_object('efeito', ef, 'valor', v, 'com', case when ef = 'troca' then o.alcunha end, 'antes', antes, 'pontos', j.pontos, 'outros', outros);
end $$;

create or replace function public.arena_avatar(p_id text, p_j uuid, p_tok text, p_avatar text) returns boolean
language plpgsql security definer set search_path = public as $$
declare j public.eduspruce_arena_jogador;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or p_avatar !~ '^p[0-9]{2}$' then return false; end if;
  update public.eduspruce_arena_jogador set avatar = p_avatar where id = j.id;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return true;
end $$;

-- coleção do aluno (só com a lista da turma e com as moedas ligadas)
create or replace function public.arena_colecao(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; c public.eduspruce_arena_colecao;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null then return null; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if j.ref is null or not coalesce((s.cfg->>'moedas')::boolean, true) then return jsonb_build_object('ativa', false, 'moedas_jogo', j.moedas); end if;
  select * into c from public.eduspruce_arena_colecao where user_id = s.user_id and ref = j.ref;
  return jsonb_build_object('ativa', true, 'moedas', coalesce(c.moedas, 0), 'pinhas', coalesce(c.pinhas, '{}'::jsonb), 'moedas_jogo', j.moedas);
end $$;

-- abrir um saco de Pinhas (gasta moedas da coleção; a raridade sorteia-se aqui)
create or replace function public.arena_saco(p_id text, p_j uuid, p_tok text, p_saco text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; c public.eduspruce_arena_colecao; preco integer; r numeric; rar text; ids text[]; p text;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.ref is null then return jsonb_build_object('erro','lista'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not coalesce((s.cfg->>'moedas')::boolean, true) then return jsonb_build_object('erro','desligado'); end if;
  preco := case p_saco when 'bosque' then 20 when 'serra' then 45 when 'cume' then 90 else null end;
  if preco is null then return jsonb_build_object('erro','pedido'); end if;
  insert into public.eduspruce_arena_colecao (user_id, ref) values (s.user_id, j.ref) on conflict do nothing;
  select * into c from public.eduspruce_arena_colecao where user_id = s.user_id and ref = j.ref for update;
  if c.moedas < preco then return jsonb_build_object('erro','moedas', 'moedas', c.moedas); end if;
  r := random();
  if p_saco = 'bosque' then rar := case when r < 0.70 then 'c' when r < 0.93 then 'r' when r < 0.99 then 'e' else 'l' end;
  elsif p_saco = 'serra' then rar := case when r < 0.40 then 'c' when r < 0.80 then 'r' when r < 0.96 then 'e' when r < 0.995 then 'l' else 'm' end;
  else rar := case when r < 0.45 then 'r' when r < 0.83 then 'e' when r < 0.97 then 'l' else 'm' end; end if;
  ids := case rar when 'c' then array['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10']
                  when 'r' then array['p11','p12','p13','p14','p15','p16','p17']
                  when 'e' then array['p18','p19','p20','p21','p22']
                  when 'l' then array['p23','p24','p25']
                  else array['p26','p27'] end;
  p := ids[1 + floor(random() * array_length(ids, 1))::int];
  update public.eduspruce_arena_colecao set moedas = moedas - preco,
    pinhas = jsonb_set(pinhas, array[p], to_jsonb(coalesce((pinhas->>p)::int, 0) + 1)), mudado = now()
  where user_id = s.user_id and ref = j.ref returning * into c;
  return jsonb_build_object('pinha', p, 'rar', rar, 'moedas', c.moedas, 'pinhas', c.pinhas);
end $$;

-- passa as moedas ganhas no jogo para a coleção (uma vez por jogador)
create or replace function public.arena_creditar(p_jog uuid) returns void
language plpgsql security definer set search_path = public as $$
declare j public.eduspruce_arena_jogador; s public.eduspruce_arena_sala;
begin
  select * into j from public.eduspruce_arena_jogador where id = p_jog;
  if j.id is null or j.ref is null or coalesce((j.estado->>'creditado')::boolean, false) then return; end if;
  select * into s from public.eduspruce_arena_sala where id = j.sala;
  if not coalesce((s.cfg->>'moedas')::boolean, true) then return; end if;
  insert into public.eduspruce_arena_colecao (user_id, ref, moedas) values (s.user_id, j.ref, j.moedas + 5)
    on conflict (user_id, ref) do update set moedas = public.eduspruce_arena_colecao.moedas + excluded.moedas, mudado = now();
  update public.eduspruce_arena_jogador set estado = estado || '{"creditado":true}'::jsonb where id = j.id;
end $$;

create or replace function public.arena_fechar(p_id text) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.eduspruce_arena_sala set estado = 'fim', terminado = now(), versao = versao + 1,
    expira = least(expira, now() + interval '2 days') where id = p_id and estado <> 'fim';
  for r in select id from public.eduspruce_arena_jogador where sala = p_id and not expulso loop perform public.arena_creditar(r.id); end loop;
end $$;

-- =========================== FUNÇÕES DO PROFESSOR (com sessão iniciada) ===========================
create or replace function public.arena_dono(p_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and public.eduspruce_autorizado() and exists (select 1 from public.eduspruce_arena_sala where id = p_id and user_id = auth.uid());
$$;

create or replace function public.arena_criar(p_id text, p_tipo text, p_modo text, p_cfg jsonb, p_perguntas jsonb, p_certas jsonb, p_limite timestamptz default null) returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'sem autorização'; end if;
  if p_id !~ '^[0-9a-f]{40}$' or jsonb_typeof(p_perguntas) <> 'array' or jsonb_typeof(p_certas) <> 'array' then raise exception 'pedido inválido'; end if;
  n := jsonb_array_length(p_perguntas);
  if n < 1 or n > 300 or jsonb_array_length(p_certas) <> n then raise exception 'perguntas inválidas'; end if;
  if (select count(*) from public.eduspruce_arena_sala where user_id = auth.uid() and estado <> 'fim' and expira > now()) >= 30 then raise exception 'demasiados jogos abertos'; end if;
  insert into public.eduspruce_arena_sala (id, user_id, tipo, modo, cfg, perguntas, n_perg, limite, expira)
  values (p_id, auth.uid(), p_tipo, p_modo, coalesce(p_cfg, '{}'::jsonb), p_perguntas, n, p_limite,
    case when p_tipo = 'tpc' then least(coalesce(p_limite, now() + interval '7 days') + interval '2 days', now() + interval '44 days') else now() + interval '8 hours' end);
  insert into public.eduspruce_arena_chave (sala, certas) values (p_id, p_certas);
  delete from public.eduspruce_arena_sala where user_id = auth.uid() and expira < now();
  return true;
end $$;

create or replace function public.arena_controlo(p_id text, p_acao text, p_arg jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; d interval; dur integer;
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id for update;
  if p_acao = 'iniciar' and s.estado = 'espera' then
    dur := nullif((s.cfg->>'duracao')::int, 0);
    update public.eduspruce_arena_sala set estado = 'jogo', inicio = now(), fim_em = case when dur is not null and s.modo <> 'classico' then now() + make_interval(secs => dur) end,
      atual = case when s.modo = 'classico' then 0 else -1 end, atual_ini = now(), revelada = false where id = p_id;
  elsif p_acao = 'perg' and s.estado = 'jogo' then
    update public.eduspruce_arena_sala set atual = least(greatest((p_arg->>'i')::int, 0), s.n_perg - 1), atual_ini = now(), revelada = false where id = p_id;
  elsif p_acao = 'revelar' then
    update public.eduspruce_arena_sala set revelada = true where id = p_id;
  elsif p_acao = 'pausar' and s.estado = 'jogo' then
    update public.eduspruce_arena_sala set estado = 'pausa', pausa_em = now() where id = p_id;
  elsif p_acao = 'retomar' and s.estado = 'pausa' then
    d := now() - coalesce(s.pausa_em, now());
    update public.eduspruce_arena_sala set estado = 'jogo', pausa_em = null, fim_em = fim_em + d, atual_ini = atual_ini + d, limite = limite where id = p_id;
  elsif p_acao = 'expulsar' then
    update public.eduspruce_arena_jogador set expulso = true where id = (p_arg->>'j')::uuid and sala = p_id;
  elsif p_acao = 'readmitir' then
    update public.eduspruce_arena_jogador set expulso = false where id = (p_arg->>'j')::uuid and sala = p_id;
  elsif p_acao = 'terminar' then
    perform public.arena_fechar(p_id);
  elsif p_acao = 'prolongar' and s.tipo = 'tpc' then
    update public.eduspruce_arena_sala set limite = (p_arg->>'limite')::timestamptz, expira = least((p_arg->>'limite')::timestamptz + interval '2 days', now() + interval '44 days') where id = p_id;
  elsif p_acao = 'apagar' then
    delete from public.eduspruce_arena_sala where id = p_id; return jsonb_build_object('apagada', true);
  end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return public.arena_prof(p_id);
end $$;

-- tudo o que o ecrã do anfitrião precisa (inclui contagem das respostas à pergunta atual)
create or replace function public.arena_prof(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; c jsonb;
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  -- jogos com tempo: terminam sozinhos
  if s.estado = 'jogo' and s.fim_em is not null and s.fim_em < now() then perform public.arena_fechar(p_id); select * into s from public.eduspruce_arena_sala where id = p_id; end if;
  select certas into c from public.eduspruce_arena_chave where sala = p_id;
  return jsonb_build_object('sala', public.arena_publico(s) || jsonb_build_object('id', s.id, 'criado', s.criado, 'expira', s.expira, 'terminado', s.terminado),
    'certas', c,
    'jogadores', (select coalesce(jsonb_agg(jsonb_build_object('id', j.id, 'alcunha', j.alcunha, 'ref', j.ref, 'avatar', j.avatar, 'pontos', j.pontos, 'certas', j.certas,
        'erradas', j.erradas, 'moedas', j.moedas, 'arv', coalesce((j.estado->>'arv')::int, 0), 'expulso', j.expulso, 'terminou', j.terminou,
        'ligado', j.visto > now() - interval '20 seconds', 'criado', j.criado) order by j.pontos desc, j.criado), '[]'::jsonb)
      from public.eduspruce_arena_jogador j where j.sala = p_id),
    'atual', case when s.atual >= 0 then (select coalesce(jsonb_object_agg(r.opc::text, r.n), '{}'::jsonb) from
       (select opc, count(*) n from public.eduspruce_arena_resp where sala = p_id and perg = s.atual and s.modo = 'classico' and s.tipo = 'vivo' group by opc) r) end,
    'respostas', (select count(*) from public.eduspruce_arena_resp where sala = p_id));
end $$;

create or replace function public.arena_resultados(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  return public.arena_prof(p_id) || jsonb_build_object(
    'perguntas', (select perguntas from public.eduspruce_arena_sala where id = p_id),
    'resp', (select coalesce(jsonb_agg(jsonb_build_array(r.jogador, r.perg, r.opc, r.certa, r.ms, r.pts) order by r.id), '[]'::jsonb) from public.eduspruce_arena_resp r where r.sala = p_id));
end $$;

create or replace function public.arena_minhas() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'tipo', s.tipo, 'modo', s.modo, 'estado', s.estado, 'criado', s.criado, 'limite', s.limite, 'expira', s.expira,
    'titulo', s.cfg->>'titulo', 'jogadores', (select count(*) from public.eduspruce_arena_jogador j where j.sala = s.id)) order by s.criado desc), '[]'::jsonb)
  from public.eduspruce_arena_sala s where s.user_id = auth.uid() and public.eduspruce_autorizado() and s.expira > now();
$$;

-- permissões das funções
do $$ declare f text; begin
  foreach f in array array['arena_info(text)','arena_entrar(text,text,text,text,text)','arena_estado(text,uuid,text)','arena_pergunta(text,uuid,text)',
     'arena_responder(text,uuid,text,integer,integer)','arena_acao(text,uuid,text,integer)','arena_avatar(text,uuid,text,text)','arena_colecao(text,uuid,text)','arena_saco(text,uuid,text,text)'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
  foreach f in array array['arena_criar(text,text,text,jsonb,jsonb,jsonb,timestamptz)','arena_controlo(text,text,jsonb)','arena_prof(text)','arena_resultados(text)','arena_minhas()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  foreach f in array array['arena_jog(text,uuid,text)','arena_publico(public.eduspruce_arena_sala)','arena_top(text,integer)','arena_creditar(uuid)','arena_fechar(text)','arena_dono(text)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
  end loop;
end $$;

-- Verificação: deve mostrar 5 linhas com «rls = true»
select c.relname as tabela, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname like 'eduspruce_arena_%' and c.relkind = 'r' order by 1;
