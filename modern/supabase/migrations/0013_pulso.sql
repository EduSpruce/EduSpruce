-- =====================================================================================
-- EduSpruce · PULSO — avaliação em tempo real na sala de aula (quizzes, corrida de equipas, bilhete de saída, pergunta rápida)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
--
-- Como funciona (sem contas para os alunos):
--   · o professor tem até 20 salas fixas, cada uma com um código (ex.: PRF-7KQ); a base de dados só guarda o «hash» do código
--   · lança atividades numa sala; os alunos abrem eduspruce.pt/pulso.html, escrevem o código e respondem
--   · salas com lista: a lista da turma vai CIFRADA com o código da sala e cada aluno confirma com o seu código pessoal
--   · os alunos NUNCA leem tabelas: só chamam funções; as soluções ficam numa tabela que só o professor lê
--   · de um aluno só se guarda o nome curto (ou «anónimo») e as respostas; as atividades expiram sozinhas
-- =====================================================================================

create table if not exists public.eduspruce_pulso_sala (
  id      text        primary key check (id ~ '^[0-9a-f]{40}$'),
  user_id uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  nome    text        not null check (char_length(nome) between 1 and 60),
  cfg     jsonb       not null default '{}'::jsonb check (octet_length(cfg::text) < 400000),
  criado  timestamptz not null default now()
);
create index if not exists eduspruce_pulso_sala_user on public.eduspruce_pulso_sala (user_id);

create table if not exists public.eduspruce_pulso_ativ (
  id        uuid        primary key default gen_random_uuid(),
  sala      text        not null references public.eduspruce_pulso_sala(id) on delete cascade,
  user_id   uuid        not null references auth.users(id) on delete cascade,
  tipo      text        not null check (tipo in ('quiz','corrida','saida','rapida')),
  modo      text        not null default 'imediato' check (modo in ('imediato','livre','prof')),
  cfg       jsonb       not null default '{}'::jsonb,
  perguntas jsonb       not null check (jsonb_typeof(perguntas) = 'array' and octet_length(perguntas::text) < 8000000),
  n_perg    integer     not null check (n_perg between 1 and 300),
  estado    text        not null default 'jogo' check (estado in ('jogo','voto','fim')),
  atual     integer     not null default 0,
  fim_em    timestamptz,
  versao    integer     not null default 0,
  criado    timestamptz not null default now(),
  terminado timestamptz,
  expira    timestamptz not null check (expira <= now() + interval '45 days')
);
create index if not exists eduspruce_pulso_ativ_sala on public.eduspruce_pulso_ativ (sala, estado);

create table if not exists public.eduspruce_pulso_chave (
  ativ   uuid  primary key references public.eduspruce_pulso_ativ(id) on delete cascade,
  certas jsonb not null check (jsonb_typeof(certas) = 'array'),
  exp    jsonb not null default '[]'::jsonb
);

create table if not exists public.eduspruce_pulso_aluno (
  id        uuid        primary key default gen_random_uuid(),
  ativ      uuid        not null references public.eduspruce_pulso_ativ(id) on delete cascade,
  nome      text        not null check (char_length(nome) between 1 and 40),
  ref       text        check (ref is null or ref ~ '^[0-9a-f]{16,64}$'),
  equipa    integer,
  token     text        not null check (token ~ '^[0-9a-f]{64}$'),
  submetido boolean     not null default false,
  pontos    numeric     not null default 0,
  certas    integer     not null default 0,
  visto     timestamptz not null default now(),
  criado    timestamptz not null default now()
);
create unique index if not exists eduspruce_pulso_aluno_nome on public.eduspruce_pulso_aluno (ativ, lower(nome));
create index if not exists eduspruce_pulso_aluno_ativ on public.eduspruce_pulso_aluno (ativ);

create table if not exists public.eduspruce_pulso_resp (
  id      bigint generated always as identity primary key,
  ativ    uuid        not null references public.eduspruce_pulso_ativ(id) on delete cascade,
  aluno   uuid        not null references public.eduspruce_pulso_aluno(id) on delete cascade,
  perg    integer     not null,
  opc     jsonb,
  texto   text        check (texto is null or char_length(texto) <= 2000),
  certa   boolean,
  pts     numeric     not null default 0,
  manual  boolean     not null default false,
  votos   integer     not null default 0,
  criado  timestamptz not null default now(),
  unique (aluno, perg)
);
create index if not exists eduspruce_pulso_resp_ativ on public.eduspruce_pulso_resp (ativ);

create table if not exists public.eduspruce_pulso_voto (
  ativ  uuid   not null references public.eduspruce_pulso_ativ(id) on delete cascade,
  aluno uuid   not null references public.eduspruce_pulso_aluno(id) on delete cascade,
  resp  bigint not null references public.eduspruce_pulso_resp(id) on delete cascade,
  primary key (ativ, aluno)
);

create table if not exists public.eduspruce_pulso_mao (
  id        bigint generated always as identity primary key,
  sala      text        not null references public.eduspruce_pulso_sala(id) on delete cascade,
  aluno     uuid        references public.eduspruce_pulso_aluno(id) on delete cascade,
  nome      text        not null,
  resolvida boolean     not null default false,
  criado    timestamptz not null default now()
);
create index if not exists eduspruce_pulso_mao_sala on public.eduspruce_pulso_mao (sala, resolvida);

-- partilha de quizzes entre professores (por código ou na biblioteca de equipa); nunca tem dados de alunos
create table if not exists public.eduspruce_pulso_partilha (
  codigo  text        primary key check (codigo ~ '^[0-9a-f]{40}$'),
  user_id uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  titulo  text        not null check (char_length(titulo) between 1 and 120),
  disc    text,
  equipa  boolean     not null default false,
  dados   jsonb       not null check (octet_length(dados::text) < 8000000),
  autor   text,
  criado  timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['eduspruce_pulso_sala','eduspruce_pulso_ativ','eduspruce_pulso_chave','eduspruce_pulso_aluno','eduspruce_pulso_resp','eduspruce_pulso_voto','eduspruce_pulso_mao','eduspruce_pulso_partilha'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop; end $$;

-- ---------- utilitários ----------
create or replace function public.pulso_hash(p text) returns text
language sql immutable set search_path = public as $$ select encode(sha256(convert_to(coalesce(p,''),'UTF8')),'hex') $$;
create or replace function public.pulso_norm(p text) returns text
language sql immutable set search_path = public as $$
  select regexp_replace(translate(lower(btrim(coalesce(p,''))),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'),'[^a-z0-9]+',' ','g') $$;
create or replace function public.pulso_al(p_ativ uuid, p_a uuid, p_tok text) returns public.eduspruce_pulso_aluno
language sql stable security definer set search_path = public as $$
  select a.* from public.eduspruce_pulso_aluno a where a.id = p_a and a.ativ = p_ativ and a.token = public.pulso_hash(p_tok) $$;

-- vista pública de uma atividade (sem soluções; explicações só depois de responder, se o professor deixar)
create or replace function public.pulso_publica(t public.eduspruce_pulso_ativ) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', t.id, 'tipo', t.tipo, 'modo', t.modo, 'estado', t.estado, 'atual', t.atual, 'n_perg', t.n_perg, 'versao', t.versao,
    'agora', now(), 'fim_em', t.fim_em,
    'cfg', t.cfg - 'refs',
    'perguntas', case when t.tipo = 'quiz' and t.modo = 'prof' then null else t.perguntas end,
    'pergunta', case when t.tipo = 'quiz' and t.modo = 'prof' then t.perguntas->t.atual end) $$;

-- =========================== ALUNO (sem conta) ===========================
create or replace function public.pulso_sala_info(p_sala text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.eduspruce_pulso_sala; t public.eduspruce_pulso_ativ;
begin
  if p_sala !~ '^[0-9a-f]{40}$' then return null; end if;
  select * into s from public.eduspruce_pulso_sala where id = p_sala; if not found then return null; end if;
  select * into t from public.eduspruce_pulso_ativ where sala = p_sala and estado <> 'fim' and expira > now() order by criado desc limit 1;
  return jsonb_build_object('nome', s.nome, 'lista', coalesce((s.cfg->>'lista')::boolean, false), 'lista_c', s.cfg->'lista_c', 'mao', coalesce((s.cfg->>'mao')::boolean, true),
    'ativ', case when t.id is null then null else jsonb_build_object('id', t.id, 'tipo', t.tipo, 'modo', t.modo, 'titulo', t.cfg->'titulo', 'nomes', t.cfg->'nomes', 'equipas', t.cfg->'equipas') end);
end $$;

create or replace function public.pulso_entrar(p_sala text, p_ativ uuid, p_nome text, p_tok text, p_ref text default null, p_cod text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_pulso_sala; t public.eduspruce_pulso_ativ; a public.eduspruce_pulso_aluno; nm text; h text; n integer; eq integer; neq integer; tent integer;
begin
  if p_tok is null or char_length(p_tok) not between 16 and 128 then return jsonb_build_object('erro','pedido'); end if;
  select * into s from public.eduspruce_pulso_sala where id = p_sala; if not found then return jsonb_build_object('erro','sala'); end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ and sala = p_sala and estado <> 'fim' and expira > now();
  if not found then return jsonb_build_object('erro','ativ'); end if;
  h := public.pulso_hash(p_tok);
  if coalesce((s.cfg->>'lista')::boolean, false) then
    if p_ref is null or p_ref !~ '^[0-9a-f]{16,64}$' then return jsonb_build_object('erro','lista'); end if;
    if (s.cfg->'codigos'->>p_ref) is null or s.cfg->'codigos'->>p_ref <> public.pulso_hash(upper(btrim(coalesce(p_cod,''))) || ':' || p_sala) then return jsonb_build_object('erro','codigo'); end if;
  end if;
  nm := regexp_replace(btrim(coalesce(p_nome,'')), '\s+', ' ', 'g');
  if coalesce((t.cfg->>'nomes')::boolean, true) = false and p_ref is null then
    select count(*) into n from public.eduspruce_pulso_aluno where ativ = p_ativ and token = h;
    if n = 0 then select count(*) + 1 into n from public.eduspruce_pulso_aluno where ativ = p_ativ; nm := 'Anónimo ' || n; end if;
  end if;
  if char_length(nm) < 2 or char_length(nm) > 40 then return jsonb_build_object('erro','nome'); end if;
  select * into a from public.eduspruce_pulso_aluno where ativ = p_ativ and (token = h or (p_ref is not null and ref = p_ref) or (nm not like 'Anónimo %' and lower(nome) = lower(nm))) order by (token = h) desc limit 1;
  if found then
    if a.token <> h and a.ref is null and a.visto > now() - interval '25 seconds' then return jsonb_build_object('erro','emuso'); end if;
    update public.eduspruce_pulso_aluno set token = h, visto = now() where id = a.id returning * into a;
  else
    select count(*) into n from public.eduspruce_pulso_aluno where ativ = p_ativ; if n >= 300 then return jsonb_build_object('erro','cheia'); end if;
    neq := nullif((t.cfg->>'equipas')::int, 0);
    if t.tipo = 'corrida' and neq is not null then
      select g into eq from generate_series(1, neq) g order by (select count(*) from public.eduspruce_pulso_aluno x where x.ativ = p_ativ and x.equipa = g), g limit 1;
    end if;
    for tent in 1..30 loop
      begin
        insert into public.eduspruce_pulso_aluno (ativ, nome, ref, equipa, token) values (p_ativ, nm, p_ref, eq, h) returning * into a; exit;
      exception when unique_violation then
        if nm like 'Anónimo %' then n := n + 1; nm := 'Anónimo ' || n; else return jsonb_build_object('erro','emuso'); end if;
      end;
    end loop;
    if a.id is null then return jsonb_build_object('erro','cheia'); end if;
    update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  end if;
  return jsonb_build_object('a', a.id, 'nome', a.nome, 'equipa', a.equipa, 'submetido', a.submetido);
end $$;

create or replace function public.pulso_estado(p_ativ uuid, p_a uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_pulso_aluno; t public.eduspruce_pulso_ativ; r jsonb; eqs jsonb; vt jsonb; c jsonb; e jsonb;
begin
  a := public.pulso_al(p_ativ, p_a, p_tok); if a.id is null then return jsonb_build_object('erro','aluno'); end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ;
  if t.estado <> 'fim' and t.fim_em is not null and t.fim_em < now() then perform public.pulso_fechar(p_ativ); select * into t from public.eduspruce_pulso_ativ where id = p_ativ; end if;
  update public.eduspruce_pulso_aluno set visto = now() where id = a.id;
  select coalesce(jsonb_agg(jsonb_build_object('p', x.perg, 'opc', x.opc, 'texto', x.texto,
      'certa', case when t.tipo = 'saida' then null when t.modo = 'imediato' or t.tipo = 'corrida' or (a.submetido and coalesce((t.cfg->>'feedback')::boolean, true)) then x.certa end) order by x.perg), '[]'::jsonb)
    into r from public.eduspruce_pulso_resp x where x.aluno = a.id;
  if (t.modo = 'imediato' or t.tipo = 'corrida' or (a.submetido and coalesce((t.cfg->>'feedback')::boolean, true))) and t.tipo in ('quiz','corrida') then
    select certas, exp into c, e from public.eduspruce_pulso_chave where ativ = p_ativ;
  end if;
  if t.tipo = 'corrida' then
    select coalesce(jsonb_agg(jsonb_build_object('e', g, 'n', (select count(*) from public.eduspruce_pulso_aluno x where x.ativ = p_ativ and x.equipa = g),
       'certas', (select coalesce(sum(certas),0) from public.eduspruce_pulso_aluno x where x.ativ = p_ativ and x.equipa = g)) order by g), '[]'::jsonb)
    into eqs from generate_series(1, greatest(1, coalesce((t.cfg->>'equipas')::int, 1))) g;
  end if;
  if t.tipo = 'rapida' and t.estado = 'voto' then
    select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'texto', x.texto) order by x.id), '[]'::jsonb) into vt from public.eduspruce_pulso_resp x where x.ativ = p_ativ and x.texto is not null and btrim(x.texto) <> '';
  end if;
  return jsonb_build_object('ativ', public.pulso_publica(t), 'eu', jsonb_build_object('nome', a.nome, 'equipa', a.equipa, 'submetido', a.submetido, 'pontos', a.pontos, 'certas', a.certas),
    'resp', r, 'sol', case when c is null then null else (select coalesce(jsonb_agg(case when exists (select 1 from public.eduspruce_pulso_resp y where y.aluno = a.id and y.perg = (i - 1)) or a.submetido then jsonb_build_object('c', c->(i-1), 'exp', e->>(i-1)) end order by i), '[]'::jsonb) from generate_series(1, jsonb_array_length(c)) i) end,
    'equipas', eqs, 'votacao', vt, 'votei', (select v.resp from public.eduspruce_pulso_voto v where v.ativ = p_ativ and v.aluno = a.id));
end $$;

-- corrigir uma resposta (servidor)
create or replace function public.pulso_corrigir_resp(t public.eduspruce_pulso_ativ, p_perg integer, p_opc jsonb, p_texto text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare k jsonb; tp text; certa boolean; pts numeric := 0; v numeric; aceites jsonb; x text;
begin
  select certas->p_perg into k from public.eduspruce_pulso_chave where ativ = t.id;
  tp := t.perguntas->p_perg->>'tp'; v := coalesce((t.perguntas->p_perg->>'pts')::numeric, 1);
  if t.tipo = 'saida' or tp in ('escala','txt') then return jsonb_build_object('certa', null, 'pts', 0); end if;
  if tp = 'rc' then
    aceites := k->'a';
    if aceites is null or jsonb_array_length(aceites) = 0 then certa := null;
    else certa := false; for x in select jsonb_array_elements_text(aceites) loop if public.pulso_norm(x) = public.pulso_norm(p_texto) then certa := true; end if; end loop; end if;
  else
    certa := (select coalesce(array_agg(v2::int order by v2::int), '{}') from jsonb_array_elements_text(coalesce(p_opc,'[]'::jsonb)) v2) =
             (select coalesce(array_agg(v3::int order by v3::int), '{}') from jsonb_array_elements_text(coalesce(k->'c','[]'::jsonb)) v3);
  end if;
  if certa then pts := v; end if;
  return jsonb_build_object('certa', certa, 'pts', pts);
end $$;

create or replace function public.pulso_responder(p_ativ uuid, p_a uuid, p_tok text, p_perg integer, p_opc jsonb, p_texto text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_pulso_aluno; t public.eduspruce_pulso_ativ; r jsonb; ex public.eduspruce_pulso_resp; sol jsonb;
begin
  a := public.pulso_al(p_ativ, p_a, p_tok); if a.id is null then return jsonb_build_object('erro','aluno'); end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ;
  if t.estado <> 'jogo' then return jsonb_build_object('erro','fechada'); end if;
  if t.fim_em is not null and t.fim_em < now() then perform public.pulso_fechar(p_ativ); return jsonb_build_object('erro','fechada'); end if;
  if a.submetido then return jsonb_build_object('erro','submetido'); end if;
  if p_perg < 0 or p_perg >= t.n_perg then return jsonb_build_object('erro','pedido'); end if;
  if t.tipo = 'quiz' and t.modo = 'prof' and p_perg <> t.atual then return jsonb_build_object('erro','fora'); end if;
  if p_texto is not null and char_length(p_texto) > 2000 then p_texto := left(p_texto, 2000); end if;
  if p_opc is not null and (jsonb_typeof(p_opc) <> 'array' or jsonb_array_length(p_opc) > 6) then return jsonb_build_object('erro','pedido'); end if;
  select * into ex from public.eduspruce_pulso_resp where aluno = a.id and perg = p_perg;
  -- só o modo livre deixa mudar a resposta
  if found and not (t.tipo = 'quiz' and t.modo = 'livre') and not (t.tipo = 'rapida' and coalesce((t.cfg->>'varias')::boolean, false)) then return jsonb_build_object('erro','repetida'); end if;
  r := public.pulso_corrigir_resp(t, p_perg, p_opc, p_texto);
  insert into public.eduspruce_pulso_resp (ativ, aluno, perg, opc, texto, certa, pts) values (p_ativ, a.id, p_perg, p_opc, nullif(btrim(coalesce(p_texto,'')),''), (r->>'certa')::boolean, (r->>'pts')::numeric)
    on conflict (aluno, perg) do update set opc = excluded.opc, texto = excluded.texto, certa = excluded.certa, pts = excluded.pts, manual = false, criado = now();
  update public.eduspruce_pulso_aluno set pontos = (select coalesce(sum(pts),0) from public.eduspruce_pulso_resp where aluno = a.id),
    certas = (select count(*) from public.eduspruce_pulso_resp where aluno = a.id and certa), visto = now() where id = a.id;
  if t.tipo in ('saida','rapida') or (t.tipo in ('quiz','corrida') and t.modo <> 'livre' and t.modo <> 'prof' and (select count(*) from public.eduspruce_pulso_resp where aluno = a.id) >= t.n_perg) then
    update public.eduspruce_pulso_aluno set submetido = true where id = a.id and t.tipo <> 'rapida';
  end if;
  update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  if t.modo = 'imediato' or t.tipo = 'corrida' then
    select jsonb_build_object('c', certas->p_perg, 'exp', exp->>p_perg) into sol from public.eduspruce_pulso_chave where ativ = p_ativ;
    return jsonb_build_object('certa', (r->>'certa')::boolean, 'sol', sol);
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.pulso_submeter(p_ativ uuid, p_a uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_pulso_aluno;
begin
  a := public.pulso_al(p_ativ, p_a, p_tok); if a.id is null then return jsonb_build_object('erro','aluno'); end if;
  update public.eduspruce_pulso_aluno set submetido = true where id = a.id;
  update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  return public.pulso_estado(p_ativ, p_a, p_tok);
end $$;

create or replace function public.pulso_votar(p_ativ uuid, p_a uuid, p_tok text, p_resp bigint) returns boolean
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_pulso_aluno; t public.eduspruce_pulso_ativ;
begin
  a := public.pulso_al(p_ativ, p_a, p_tok); if a.id is null then return false; end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ; if t.estado <> 'voto' then return false; end if;
  if not exists (select 1 from public.eduspruce_pulso_resp where id = p_resp and ativ = p_ativ) then return false; end if;
  insert into public.eduspruce_pulso_voto (ativ, aluno, resp) values (p_ativ, a.id, p_resp) on conflict (ativ, aluno) do update set resp = excluded.resp;
  update public.eduspruce_pulso_resp r set votos = (select count(*) from public.eduspruce_pulso_voto v where v.resp = r.id) where r.ativ = p_ativ;
  update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  return true;
end $$;

create or replace function public.pulso_mao(p_ativ uuid, p_a uuid, p_tok text, p_levantar boolean default true) returns boolean
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_pulso_aluno; t public.eduspruce_pulso_ativ; s public.eduspruce_pulso_sala;
begin
  a := public.pulso_al(p_ativ, p_a, p_tok); if a.id is null then return false; end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ; select * into s from public.eduspruce_pulso_sala where id = t.sala;
  if not coalesce((s.cfg->>'mao')::boolean, true) then return false; end if;
  if p_levantar then
    if not exists (select 1 from public.eduspruce_pulso_mao where aluno = a.id and not resolvida) then insert into public.eduspruce_pulso_mao (sala, aluno, nome) values (t.sala, a.id, a.nome); end if;
  else update public.eduspruce_pulso_mao set resolvida = true where aluno = a.id and not resolvida; end if;
  update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  return true;
end $$;

create or replace function public.pulso_fechar(p_ativ uuid) returns void
language sql security definer set search_path = public as $$
  update public.eduspruce_pulso_ativ set estado = 'fim', terminado = now(), versao = versao + 1, expira = least(expira, now() + interval '7 days') where id = p_ativ and estado <> 'fim';
$$;

-- =========================== PROFESSOR ===========================
create or replace function public.pulso_dono_sala(p_sala text) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and public.eduspruce_autorizado() and exists (select 1 from public.eduspruce_pulso_sala where id = p_sala and user_id = auth.uid()) $$;
create or replace function public.pulso_dono(p_ativ uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and public.eduspruce_autorizado() and exists (select 1 from public.eduspruce_pulso_ativ where id = p_ativ and user_id = auth.uid()) $$;

create or replace function public.pulso_sala_guardar(p_id text, p_nome text, p_cfg jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'sem autorização'; end if;
  if p_id !~ '^[0-9a-f]{40}$' then raise exception 'pedido inválido'; end if;
  if exists (select 1 from public.eduspruce_pulso_sala where id = p_id and user_id <> auth.uid()) then raise exception 'código em uso'; end if;
  if not exists (select 1 from public.eduspruce_pulso_sala where id = p_id) and (select count(*) from public.eduspruce_pulso_sala where user_id = auth.uid()) >= 20 then raise exception 'Pode ter até 20 salas.'; end if;
  insert into public.eduspruce_pulso_sala (id, user_id, nome, cfg) values (p_id, auth.uid(), p_nome, coalesce(p_cfg,'{}'::jsonb))
    on conflict (id) do update set nome = excluded.nome, cfg = excluded.cfg;
  return true;
end $$;

create or replace function public.pulso_sala_apagar(p_id text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not public.pulso_dono_sala(p_id) then raise exception 'sem autorização'; end if;
  delete from public.eduspruce_pulso_sala where id = p_id; return true;
end $$;

create or replace function public.pulso_lancar(p_sala text, p_tipo text, p_modo text, p_cfg jsonb, p_perguntas jsonb, p_certas jsonb, p_exp jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare i uuid; n integer; dur integer;
begin
  if not public.pulso_dono_sala(p_sala) then raise exception 'sem autorização'; end if;
  n := jsonb_array_length(p_perguntas);
  if n < 1 or n > 300 or jsonb_array_length(p_certas) <> n then raise exception 'perguntas inválidas'; end if;
  if (select count(*) from public.eduspruce_pulso_ativ where user_id = auth.uid() and estado <> 'fim' and expira > now()) >= 20 then raise exception 'Pode ter até 20 atividades abertas ao mesmo tempo.'; end if;
  update public.eduspruce_pulso_ativ set estado = 'fim', terminado = now(), versao = versao + 1 where sala = p_sala and estado <> 'fim';   -- uma atividade de cada vez em cada sala
  dur := nullif((p_cfg->>'tempo')::int, 0);
  insert into public.eduspruce_pulso_ativ (sala, user_id, tipo, modo, cfg, perguntas, n_perg, fim_em, expira)
    values (p_sala, auth.uid(), p_tipo, coalesce(p_modo,'imediato'), coalesce(p_cfg,'{}'::jsonb), p_perguntas, n, case when dur is not null then now() + make_interval(secs => dur) end, now() + interval '30 days')
    returning id into i;
  insert into public.eduspruce_pulso_chave (ativ, certas, exp) values (i, p_certas, coalesce(p_exp, '[]'::jsonb));
  delete from public.eduspruce_pulso_ativ where user_id = auth.uid() and expira < now();
  delete from public.eduspruce_pulso_mao where sala = p_sala and criado < now() - interval '1 day';
  return i;
end $$;

create or replace function public.pulso_controlo(p_ativ uuid, p_acao text, p_arg jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.eduspruce_pulso_ativ; r jsonb; x record;
begin
  if not public.pulso_dono(p_ativ) then raise exception 'sem autorização'; end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ for update;
  if p_acao = 'perg' then update public.eduspruce_pulso_ativ set atual = least(greatest((p_arg->>'i')::int, 0), t.n_perg - 1) where id = p_ativ;
  elsif p_acao = 'votacao' and t.tipo = 'rapida' then update public.eduspruce_pulso_ativ set estado = 'voto' where id = p_ativ;
  elsif p_acao = 'terminar' then perform public.pulso_fechar(p_ativ);
  elsif p_acao = 'reabrir' then update public.eduspruce_pulso_ativ set estado = 'jogo', terminado = null, fim_em = null, expira = now() + interval '30 days' where id = p_ativ;
  elsif p_acao = 'corrigir' then
    update public.eduspruce_pulso_resp set certa = (p_arg->>'certa')::boolean, manual = true,
      pts = case when (p_arg->>'certa')::boolean then coalesce((t.perguntas->perg->>'pts')::numeric, 1) else 0 end
    where id = (p_arg->>'r')::bigint and ativ = p_ativ;
    update public.eduspruce_pulso_aluno a set pontos = (select coalesce(sum(pts),0) from public.eduspruce_pulso_resp where aluno = a.id),
      certas = (select count(*) from public.eduspruce_pulso_resp where aluno = a.id and certa) where a.ativ = p_ativ;
  elsif p_acao = 'mao' then update public.eduspruce_pulso_mao set resolvida = true where id = (p_arg->>'m')::bigint and sala = t.sala;
  elsif p_acao = 'remover' then delete from public.eduspruce_pulso_aluno where id = (p_arg->>'a')::uuid and ativ = p_ativ;
  elsif p_acao = 'apagar' then delete from public.eduspruce_pulso_ativ where id = p_ativ; return jsonb_build_object('apagada', true);
  end if;
  update public.eduspruce_pulso_ativ set versao = versao + 1 where id = p_ativ;
  return public.pulso_resultados(p_ativ);
end $$;

create or replace function public.pulso_resultados(p_ativ uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.eduspruce_pulso_ativ;
begin
  if not public.pulso_dono(p_ativ) then raise exception 'sem autorização'; end if;
  select * into t from public.eduspruce_pulso_ativ where id = p_ativ;
  if t.estado <> 'fim' and t.fim_em is not null and t.fim_em < now() then perform public.pulso_fechar(p_ativ); select * into t from public.eduspruce_pulso_ativ where id = p_ativ; end if;
  return jsonb_build_object('ativ', public.pulso_publica(t) || jsonb_build_object('perguntas', t.perguntas, 'criado', t.criado, 'terminado', t.terminado, 'sala', t.sala),
    'chave', (select jsonb_build_object('certas', certas, 'exp', exp) from public.eduspruce_pulso_chave where ativ = p_ativ),
    'alunos', (select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'nome', a.nome, 'ref', a.ref, 'equipa', a.equipa, 'submetido', a.submetido, 'pontos', a.pontos, 'certas', a.certas,
        'ligado', a.visto > now() - interval '20 seconds') order by a.criado), '[]'::jsonb) from public.eduspruce_pulso_aluno a where a.ativ = p_ativ),
    'resp', (select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'a', r.aluno, 'p', r.perg, 'opc', r.opc, 'texto', r.texto, 'certa', r.certa, 'pts', r.pts, 'manual', r.manual, 'votos', r.votos) order by r.id), '[]'::jsonb)
        from public.eduspruce_pulso_resp r where r.ativ = p_ativ),
    'maos', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'nome', m.nome, 'criado', m.criado) order by m.criado), '[]'::jsonb) from public.eduspruce_pulso_mao m where m.sala = t.sala and not m.resolvida));
end $$;

create or replace function public.pulso_minhas() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'salas', (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'nome', s.nome, 'maos', (select count(*) from public.eduspruce_pulso_mao m where m.sala = s.id and not m.resolvida))), '[]'::jsonb) from public.eduspruce_pulso_sala s where s.user_id = auth.uid()),
    'ativs', (select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'sala', t.sala, 'tipo', t.tipo, 'modo', t.modo, 'estado', t.estado, 'criado', t.criado, 'titulo', t.cfg->>'titulo',
        'alunos', (select count(*) from public.eduspruce_pulso_aluno a where a.ativ = t.id)) order by t.criado desc), '[]'::jsonb) from public.eduspruce_pulso_ativ t where t.user_id = auth.uid() and t.expira > now()))
  where public.eduspruce_autorizado();
$$;

-- partilha entre professores
create or replace function public.pulso_partilhar(p_codigo text, p_titulo text, p_disc text, p_equipa boolean, p_dados jsonb, p_autor text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'sem autorização'; end if;
  insert into public.eduspruce_pulso_partilha (codigo, user_id, titulo, disc, equipa, dados, autor) values (p_codigo, auth.uid(), p_titulo, p_disc, coalesce(p_equipa,false), p_dados, left(p_autor, 80))
    on conflict (codigo) do update set titulo = excluded.titulo, disc = excluded.disc, equipa = excluded.equipa, dados = excluded.dados, autor = excluded.autor where public.eduspruce_pulso_partilha.user_id = auth.uid();
  return true;
end $$;
create or replace function public.pulso_importar(p_codigo text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('titulo', titulo, 'disc', disc, 'dados', dados, 'autor', autor) from public.eduspruce_pulso_partilha
  where codigo = p_codigo and auth.uid() is not null and public.eduspruce_autorizado() $$;
create or replace function public.pulso_biblioteca() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('codigo', codigo, 'titulo', titulo, 'disc', disc, 'autor', autor, 'meu', user_id = auth.uid(), 'n', jsonb_array_length(coalesce(dados->'perg','[]'::jsonb)), 'criado', criado) order by criado desc), '[]'::jsonb)
  from public.eduspruce_pulso_partilha where equipa and public.eduspruce_autorizado() $$;
create or replace function public.pulso_despartilhar(p_codigo text) returns boolean
language plpgsql security definer set search_path = public as $$
begin delete from public.eduspruce_pulso_partilha where codigo = p_codigo and user_id = auth.uid(); return true; end $$;

do $$ declare f text; begin
  foreach f in array array['pulso_sala_info(text)','pulso_entrar(text,uuid,text,text,text,text)','pulso_estado(uuid,uuid,text)','pulso_responder(uuid,uuid,text,integer,jsonb,text)',
     'pulso_submeter(uuid,uuid,text)','pulso_votar(uuid,uuid,text,bigint)','pulso_mao(uuid,uuid,text,boolean)'] loop
    execute 'revoke all on function public.' || f || ' from public'; execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
  foreach f in array array['pulso_sala_guardar(text,text,jsonb)','pulso_sala_apagar(text)','pulso_lancar(text,text,text,jsonb,jsonb,jsonb,jsonb)','pulso_controlo(uuid,text,jsonb)','pulso_resultados(uuid)','pulso_minhas()',
     'pulso_partilhar(text,text,text,boolean,jsonb,text)','pulso_importar(text)','pulso_biblioteca()','pulso_despartilhar(text)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon'; execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  foreach f in array array['pulso_al(uuid,uuid,text)','pulso_publica(public.eduspruce_pulso_ativ)','pulso_corrigir_resp(public.eduspruce_pulso_ativ,integer,jsonb,text)','pulso_fechar(uuid)','pulso_dono_sala(text)','pulso_dono(uuid)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
  end loop;
end $$;

select c.relname as tabela, c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname like 'eduspruce_pulso_%' and c.relkind = 'r' order by 1;
