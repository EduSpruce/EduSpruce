-- EduSpruce · Spruce It! completo (1.178)
-- Tipos de pergunta novos (várias certas, resposta escrita, deslizante, ordenar, pino na imagem, sondagem, escala,
-- nuvem de palavras, resposta aberta, ideias com votação, diapositivo), modos de pontuação (precisão, confiança,
-- pontos a dobrar / sem pontos), perguntas do público com votos e moderação, reações, estudo ao ritmo do aluno,
-- opções do jogo mudadas no átrio e limite de jogadores escolhido pelo professor (até 2000).
-- Só acrescenta: as funções antigas continuam a funcionar como antes. Corre-se depois da 0017.

-- 1) colunas novas
alter table public.eduspruce_arena_resp add column if not exists resp jsonb;
alter table public.eduspruce_arena_resp add column if not exists conf smallint;
alter table public.eduspruce_arena_resp alter column certa drop not null;
alter table public.eduspruce_arena_chave add column if not exists extra jsonb not null default '[]'::jsonb;

-- 2) perguntas do público (P&R), votos, ideias e reações
create table if not exists public.eduspruce_arena_qa (
  id      bigint generated always as identity primary key,
  sala    text        not null references public.eduspruce_arena_sala(id) on delete cascade,
  jogador uuid        not null references public.eduspruce_arena_jogador(id) on delete cascade,
  texto   text        not null check (char_length(texto) between 2 and 240),
  estado  text        not null default 'visivel' check (estado in ('pendente','visivel','destaque','respondida','oculta')),
  anonima boolean     not null default false,
  criado  timestamptz not null default now()
);
create index if not exists eduspruce_arena_qa_sala on public.eduspruce_arena_qa (sala);
create table if not exists public.eduspruce_arena_qavoto (
  q       bigint not null references public.eduspruce_arena_qa(id) on delete cascade,
  jogador uuid   not null references public.eduspruce_arena_jogador(id) on delete cascade,
  primary key (q, jogador)
);
create table if not exists public.eduspruce_arena_ideiavoto (
  resp    bigint   not null references public.eduspruce_arena_resp(id) on delete cascade,
  idx     smallint not null check (idx between 0 and 4),
  jogador uuid     not null references public.eduspruce_arena_jogador(id) on delete cascade,
  primary key (resp, idx, jogador)
);
create index if not exists eduspruce_arena_ideiavoto_jog on public.eduspruce_arena_ideiavoto (jogador);
create table if not exists public.eduspruce_arena_reacao (
  id     bigint generated always as identity primary key,
  sala   text        not null references public.eduspruce_arena_sala(id) on delete cascade,
  r      smallint    not null check (r between 0 and 5),
  criado timestamptz not null default now()
);
create index if not exists eduspruce_arena_reacao_sala on public.eduspruce_arena_reacao (sala, criado);

do $$ declare t text; begin
  foreach t in array array['eduspruce_arena_qa','eduspruce_arena_qavoto','eduspruce_arena_ideiavoto','eduspruce_arena_reacao'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop; end $$;

create or replace function public.arena_versao() returns integer language sql immutable as $$ select 21 $$;

-- 3) estado público: mais opções do jogo e a solução das perguntas novas depois de revelada
create or replace function public.arena_publico(s public.eduspruce_arena_sala) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'modo', s.modo, 'tipo', s.tipo, 'estado', s.estado, 'atual', s.atual, 'revelada', s.revelada, 'n_perg', s.n_perg, 'versao', s.versao,
    'agora', now(), 'atual_ini', s.atual_ini, 'inicio', s.inicio, 'fim_em', s.fim_em, 'pausa_em', s.pausa_em, 'limite', s.limite,
    'cfg', jsonb_build_object('nomes', s.cfg->'nomes', 'lista_c', s.cfg->'lista_c', 'moedas', s.cfg->'moedas', 'tardias', s.cfg->'tardias',
            'duracao', s.cfg->'duracao', 'objetivo', s.cfg->'objetivo', 'titulo', s.cfg->'titulo', 'tempo', s.cfg->'tempo',
            'tema', s.cfg->'tema', 'equipas', s.cfg->'equipas', 'mostrar', s.cfg->'mostrar', 'dominar', s.cfg->'dominar',
            'alcunhas', s.cfg->'alcunhas', 'silencio', s.cfg->'silencio',
            'v3', s.cfg->'v3', 'precisao', s.cfg->'precisao', 'confianca', s.cfg->'confianca', 'aula', s.cfg->'aula',
            'reacoes', s.cfg->'reacoes', 'qa', s.cfg->'qa', 'marca', s.cfg->'marca', 'fase', s.cfg->'fase', 'estudo', s.cfg->'estudo',
            'eqnomes', s.cfg->'eqnomes'),
    'pergunta', case when s.modo = 'classico' and s.tipo = 'vivo' and s.atual >= 0 and s.estado in ('jogo','pausa') then s.perguntas->s.atual end,
    'certa', case when s.revelada and s.atual >= 0 then (select c.certas->s.atual from public.eduspruce_arena_chave c where c.sala = s.id) end,
    'certa3', case when s.revelada and s.atual >= 0 then (select c.extra->s.atual from public.eduspruce_arena_chave c where c.sala = s.id) end
  );
$$;

-- 4) criar com as soluções das perguntas novas
create or replace function public.arena_criar3(p_id text, p_tipo text, p_modo text, p_cfg jsonb, p_perguntas jsonb, p_certas jsonb, p_extra jsonb, p_limite timestamptz default null) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_extra is null or jsonb_typeof(p_extra) <> 'array' or jsonb_array_length(p_extra) <> jsonb_array_length(p_perguntas) then raise exception 'pedido inválido'; end if;
  perform public.arena_criar(p_id, p_tipo, p_modo, coalesce(p_cfg, '{}'::jsonb) || jsonb_build_object('v3', true), p_perguntas, p_certas, p_limite);
  update public.eduspruce_arena_chave set extra = p_extra where sala = p_id;
  return true;
end $$;

-- 5) corrigir uma resposta de um tipo novo (null = pergunta sem resposta certa)
create or replace function public.arena_norm(p text) returns text
language sql immutable set search_path = public as $$
  select btrim(regexp_replace(translate(lower(coalesce(p,'')),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc'), '[^a-z0-9%,.+\-/ ]', '', 'g'));
$$;

create or replace function public.arena_corrigir3(p_tp text, k jsonb, r jsonb, ci integer) returns boolean
language plpgsql immutable set search_path = public as $$
declare x text; v numeric; alvo numeric; tol numeric; dx numeric; dy numeric;
begin
  if p_tp in ('sond','escala','nuvem','aberta','ideias','slide') then return null; end if;
  if r is null then return false; end if;
  if p_tp is null or p_tp in ('mc','vf') then
    return jsonb_typeof(r) = 'number' and (r#>>'{}')::int = ci;
  elsif p_tp = 'multi' then
    if jsonb_typeof(r) <> 'array' then return false; end if;
    return (select coalesce(array_agg(a::int order by a::int), '{}') from (select distinct jsonb_array_elements_text(r) a) t) =
           (select coalesce(array_agg(b::int order by b::int), '{}') from jsonb_array_elements_text(coalesce(k->'c','[]'::jsonb)) b);
  elsif p_tp = 'rc' then
    if jsonb_typeof(r) <> 'string' then return false; end if;
    for x in select jsonb_array_elements_text(coalesce(k->'a','[]'::jsonb)) loop
      if public.arena_norm(x) = public.arena_norm(r#>>'{}') and public.arena_norm(x) <> '' then return true; end if;
    end loop;
    return false;
  elsif p_tp = 'slider' then
    if jsonb_typeof(r) <> 'number' then return false; end if;
    v := (r#>>'{}')::numeric; alvo := (k->>'v')::numeric; tol := coalesce((k->>'tol')::numeric, 0);
    return alvo is not null and abs(v - alvo) <= tol;
  elsif p_tp = 'ordem' then
    return jsonb_typeof(r) = 'array' and r = coalesce(k->'ord', '[]'::jsonb);
  elsif p_tp = 'pino' then
    if jsonb_typeof(r) <> 'object' then return false; end if;
    dx := (r->>'x')::numeric - (k->>'x')::numeric; dy := (r->>'y')::numeric - (k->>'y')::numeric;
    return sqrt(dx*dx + dy*dy) <= coalesce((k->>'r')::numeric, 0.1);
  end if;
  return false;
end $$;

-- 6) responder (todos os tipos e modos): corrige aqui, aplica as regras do modo pelas funções de sempre e acerta os pontos
create or replace function public.arena_responder3(p_id text, p_j uuid, p_tok text, p_perg integer, p_resp jsonb, p_conf integer default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; tp text; k jsonb; ci integer; certa boolean; v_opc integer;
        seq0 integer; r jsonb; rid bigint; pts0 integer; pts1 integer; pm numeric; v_conf integer; classico boolean;
begin
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not found then return jsonb_build_object('erro','sala'); end if;
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  if p_perg < 0 or p_perg >= s.n_perg then return jsonb_build_object('erro','pedido'); end if;
  if p_resp is not null and octet_length(p_resp::text) > 2000 then return jsonb_build_object('erro','pedido'); end if;
  tp := s.perguntas->p_perg->>'tp';
  classico := s.modo = 'classico';
  if tp = 'slide' then return jsonb_build_object('erro','pedido'); end if;
  if tp in ('sond','escala','nuvem','aberta','ideias') and not classico then return jsonb_build_object('erro','pedido'); end if;
  select (certas->>p_perg)::int, extra->p_perg into ci, k from public.eduspruce_arena_chave where sala = p_id;
  certa := public.arena_corrigir3(tp, k, p_resp, ci);
  if tp is null or tp in ('mc','vf','sond') then
    if p_resp is null or jsonb_typeof(p_resp) <> 'number' then v_opc := -1; else v_opc := (p_resp#>>'{}')::int; end if;
    if v_opc < -1 or v_opc > 5 then return jsonb_build_object('erro','pedido'); end if;
  elsif certa then v_opc := ci;
  else v_opc := -1; end if;
  seq0 := coalesce((j.estado->>'seq')::int, 0);
  r := public.arena_responder2(p_id, p_j, p_tok, p_perg, case when certa is null then -1 else v_opc end);
  if r ? 'erro' then return r; end if;
  select id, pts into rid, pts0 from public.eduspruce_arena_resp where jogador = j.id and perg = p_perg order by id desc limit 1;
  if rid is null then return r; end if;
  v_conf := greatest(0, least(coalesce(p_conf, 0), 2));
  update public.eduspruce_arena_resp set resp = p_resp, conf = case when coalesce((s.cfg->>'confianca')::boolean, false) then v_conf end where id = rid;
  if certa is null then
    -- sem resposta certa: não conta como errada nem parte a sequência
    update public.eduspruce_arena_resp set certa = null, opc = case when tp = 'sond' then v_opc else -2 end, pts = 0 where id = rid;
    update public.eduspruce_arena_jogador set erradas = greatest(0, erradas - 1), pontos = greatest(0, pontos - pts0),
           estado = estado || jsonb_build_object('seq', seq0) where id = j.id;
    r := r || jsonb_build_object('certa', null, 'pts', 0, 'seq', seq0);
  elsif classico then
    pm := coalesce((s.perguntas->p_perg->>'pm')::numeric, 1);
    pts1 := pts0;
    if certa and coalesce((s.cfg->>'precisao')::boolean, false) then pts1 := 1000; end if;
    pts1 := round(pts1 * pm)::int;
    if coalesce((s.cfg->>'confianca')::boolean, false) then
      if certa then pts1 := round(pts1 * (1 + 0.25 * v_conf))::int; else pts1 := -150 * v_conf * (case when pm = 0 then 0 else 1 end); end if;
    end if;
    if pts1 <> pts0 then
      update public.eduspruce_arena_resp set pts = pts1 where id = rid;
      update public.eduspruce_arena_jogador set pontos = greatest(0, pontos - pts0 + pts1) where id = j.id returning * into j;
      if r->>'pts' is not null then r := r || jsonb_build_object('pts', pts1, 'pontos', j.pontos); end if;
    end if;
  end if;
  if (r->>'ci') is not null and tp is not null and tp not in ('mc','vf','sond') then r := r || jsonb_build_object('sol', k); end if;
  return r || jsonb_build_object('certa3', case when classico and s.tipo = 'vivo' then null else certa end);
end $$;

-- 7) respostas à pergunta atual (ecrã do professor): texto, números, pinos, ideias e votos
create or replace function public.arena_atual3(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala;
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.atual < 0 then return '[]'::jsonb; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'j', r.jogador, 'a', j.alcunha, 'r', r.resp, 'c', r.certa, 'opc', r.opc, 'ms', r.ms, 'pts', r.pts, 'conf', r.conf,
      'v', (select coalesce(jsonb_object_agg(x.idx::text, x.n), '{}'::jsonb) from (select idx, count(*) n from public.eduspruce_arena_ideiavoto v where v.resp = r.id group by idx) x))
      order by r.id), '[]'::jsonb)
    from public.eduspruce_arena_resp r join public.eduspruce_arena_jogador j on j.id = r.jogador
    where r.sala = p_id and r.perg = s.atual and not j.expulso);
end $$;

-- 8) resultados com o conteúdo das respostas (relatórios)
create or replace function public.arena_resultados3(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  return public.arena_resultados(p_id) || jsonb_build_object(
    'extra', (select extra from public.eduspruce_arena_chave where sala = p_id),
    'resp3', (select coalesce(jsonb_agg(jsonb_build_array(r.jogador, r.perg, r.resp, r.conf) order by r.id), '[]'::jsonb) from public.eduspruce_arena_resp r where r.sala = p_id and (r.resp is not null or r.conf is not null)),
    'qa', (select coalesce(jsonb_agg(jsonb_build_object('t', q.texto, 'e', q.estado, 'v', (select count(*) from public.eduspruce_arena_qavoto v where v.q = q.id)) order by q.id), '[]'::jsonb) from public.eduspruce_arena_qa q where q.sala = p_id));
end $$;

-- 9) opções do jogo mudadas pelo professor (no átrio ou durante o jogo)
create or replace function public.arena_cfg3(p_id text, p_cfg jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; n jsonb := '{}'::jsonb; k text;
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  if p_cfg is null or jsonb_typeof(p_cfg) <> 'object' or octet_length(p_cfg::text) > 400000 then raise exception 'pedido inválido'; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id for update;
  foreach k in array array['precisao','confianca','aula','reacoes','qa','marca','fase','mostrar','silencio','tardias','maxjog','eqnomes'] loop
    if p_cfg ? k then n := n || jsonb_build_object(k, p_cfg->k); end if;
  end loop;
  if n ? 'maxjog' then n := n || jsonb_build_object('maxjog', greatest(2, least(coalesce((n->>'maxjog')::int, 80), 2000))); end if;
  if s.estado <> 'espera' then n := n - 'precisao' - 'confianca' - 'maxjog'; end if;
  update public.eduspruce_arena_sala set cfg = cfg || n, versao = versao + 1 where id = p_id;
  return public.arena_prof(p_id);
end $$;

-- 10) entrar: o limite de jogadores passa a ser escolhido pelo professor (80 por omissão, até 2000)
do $$ begin
  if to_regprocedure('public.arena_entrar_base(text,text,text,text,text)') is not null then
    execute $f$
create or replace function public.arena_entrar_base(p_id text, p_alcunha text, p_tok text, p_ref text default null, p_avatar text default 'p01') returns jsonb
language plpgsql security definer set search_path = public as $b$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; a text; n integer; h text;
begin
  if p_id !~ '^[0-9a-f]{40}$' or p_tok is null or char_length(p_tok) < 16 or char_length(p_tok) > 128 then return jsonb_build_object('erro','pedido'); end if;
  delete from public.eduspruce_arena_sala where expira < now() - interval '1 day';
  select * into s from public.eduspruce_arena_sala where id = p_id and expira > now();
  if not found or s.estado = 'fim' then return jsonb_build_object('erro','sala'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  a := regexp_replace(btrim(coalesce(p_alcunha,'')), '\s+', ' ', 'g');
  if char_length(a) < 2 or char_length(a) > 24 then return jsonb_build_object('erro','alcunha'); end if;
  if coalesce(s.cfg->>'nomes','livre') = 'livre' and public.arena_impropria(a) then return jsonb_build_object('erro','impropria'); end if;
  if coalesce(s.cfg->>'nomes','livre') = 'lista' and (p_ref is null or p_ref !~ '^[0-9a-f]{16,64}$') then return jsonb_build_object('erro','lista'); end if;
  if p_avatar !~ '^p[0-9]{2}$' then p_avatar := 'p01'; end if;
  h := public.arena_hash(p_tok);
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
  if n >= greatest(2, least(coalesce((s.cfg->>'maxjog')::int, 80), 2000)) then return jsonb_build_object('erro','cheia'); end if;
  begin
    insert into public.eduspruce_arena_jogador (sala, alcunha, ref, avatar, token) values (p_id, a, p_ref, p_avatar, h) returning * into j;
  exception when unique_violation then return jsonb_build_object('erro','emuso'); end;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('j', j.id, 'alcunha', j.alcunha, 'avatar', j.avatar, 'pontos', 0, 'voltou', false, 'sala', public.arena_publico(s));
end $b$;
    $f$;
    execute 'revoke all on function public.arena_entrar_base(text,text,text,text,text) from public, anon, authenticated';
  end if;
end $$;

-- 11) perguntas do público (P&R)
create or replace function public.arena_qa_enviar(p_id text, p_j uuid, p_tok text, p_texto text, p_anonima boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; t text; ult timestamptz; n integer;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if coalesce(s.cfg->>'qa', 'nao') not in ('livre','moderada') or s.estado = 'fim' then return jsonb_build_object('erro','fechada'); end if;
  t := regexp_replace(btrim(coalesce(p_texto,'')), '\s+', ' ', 'g');
  if char_length(t) < 2 or char_length(t) > 240 then return jsonb_build_object('erro','pedido'); end if;
  select max(criado), count(*) into ult, n from public.eduspruce_arena_qa where jogador = j.id;
  if ult is not null and ult > now() - interval '15 seconds' then return jsonb_build_object('erro','depressa'); end if;
  if n >= 15 then return jsonb_build_object('erro','muitas'); end if;
  insert into public.eduspruce_arena_qa (sala, jogador, texto, estado, anonima)
  values (p_id, j.id, t, case when public.arena_impropria(t) then 'oculta' when s.cfg->>'qa' = 'moderada' then 'pendente' else 'visivel' end, coalesce(p_anonima, false));
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('ok', true, 'moderada', s.cfg->>'qa' = 'moderada');
end $$;

create or replace function public.arena_qa_lista(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.eduspruce_arena_jogador;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null then return jsonb_build_object('erro','jogador'); end if;
  return jsonb_build_object('q', (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 't', q.texto, 'e', q.estado,
      'a', case when q.anonima then null else (select alcunha from public.eduspruce_arena_jogador x where x.id = q.jogador) end,
      'v', (select count(*) from public.eduspruce_arena_qavoto v where v.q = q.id),
      'eu', exists (select 1 from public.eduspruce_arena_qavoto v where v.q = q.id and v.jogador = j.id), 'minha', q.jogador = j.id)
      order by (q.estado = 'destaque') desc, (select count(*) from public.eduspruce_arena_qavoto v where v.q = q.id) desc, q.id), '[]'::jsonb)
    from public.eduspruce_arena_qa q where q.sala = p_id and (q.estado in ('visivel','destaque','respondida') or (q.jogador = j.id and q.estado = 'pendente'))));
end $$;

create or replace function public.arena_qa_votar(p_id text, p_j uuid, p_tok text, p_q bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.eduspruce_arena_jogador;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  if not exists (select 1 from public.eduspruce_arena_qa where id = p_q and sala = p_id and estado in ('visivel','destaque')) then return jsonb_build_object('erro','pedido'); end if;
  if exists (select 1 from public.eduspruce_arena_qavoto where q = p_q and jogador = j.id) then
    delete from public.eduspruce_arena_qavoto where q = p_q and jogador = j.id;
  else insert into public.eduspruce_arena_qavoto (q, jogador) values (p_q, j.id); end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.arena_qa_prof(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 't', q.texto, 'e', q.estado, 'a', case when q.anonima then null else j.alcunha end,
      'v', (select count(*) from public.eduspruce_arena_qavoto v where v.q = q.id), 'criado', q.criado) order by q.id), '[]'::jsonb)
    from public.eduspruce_arena_qa q join public.eduspruce_arena_jogador j on j.id = q.jogador where q.sala = p_id);
end $$;

create or replace function public.arena_qa_moderar(p_id text, p_q bigint, p_estado text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  if p_estado not in ('pendente','visivel','destaque','respondida','oculta','apagar') then raise exception 'pedido inválido'; end if;
  if p_estado = 'apagar' then delete from public.eduspruce_arena_qa where id = p_q and sala = p_id;
  else
    if p_estado = 'destaque' then update public.eduspruce_arena_qa set estado = 'visivel' where sala = p_id and estado = 'destaque'; end if;
    update public.eduspruce_arena_qa set estado = p_estado where id = p_q and sala = p_id;
  end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return public.arena_qa_prof(p_id);
end $$;

-- 12) ideias: os alunos votam nas ideias dos outros (até 3 votos por pergunta)
create or replace function public.arena_ideias(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.atual < 0 or coalesce(s.perguntas->s.atual->>'tp','') <> 'ideias' then return jsonb_build_object('erro','pedido'); end if;
  return jsonb_build_object('fase', s.cfg->>'fase', 'i', (select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'k', x.k - 1, 't', x.t,
      'eu', exists (select 1 from public.eduspruce_arena_ideiavoto v where v.resp = r.id and v.idx = x.k - 1 and v.jogador = j.id), 'minha', r.jogador = j.id)
      order by r.id, x.k), '[]'::jsonb)
    from public.eduspruce_arena_resp r cross join lateral jsonb_array_elements_text(case when jsonb_typeof(r.resp) = 'array' then r.resp else '[]'::jsonb end) with ordinality x(t, k)
    where r.sala = p_id and r.perg = s.atual and x.k <= 5));
end $$;

create or replace function public.arena_ideia_votar(p_id text, p_j uuid, p_tok text, p_resp bigint, p_idx integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; n integer;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if coalesce(s.cfg->>'fase','') <> 'votar' then return jsonb_build_object('erro','fechada'); end if;
  if not exists (select 1 from public.eduspruce_arena_resp where id = p_resp and sala = p_id and perg = s.atual and jogador <> j.id) then return jsonb_build_object('erro','pedido'); end if;
  if exists (select 1 from public.eduspruce_arena_ideiavoto where resp = p_resp and idx = p_idx and jogador = j.id) then
    delete from public.eduspruce_arena_ideiavoto where resp = p_resp and idx = p_idx and jogador = j.id;
  else
    select count(*) into n from public.eduspruce_arena_ideiavoto v join public.eduspruce_arena_resp r on r.id = v.resp where v.jogador = j.id and r.perg = s.atual and r.sala = p_id;
    if n >= 3 then return jsonb_build_object('erro','votos'); end if;
    insert into public.eduspruce_arena_ideiavoto (resp, idx, jogador) values (p_resp, p_idx, j.id);
  end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

-- 13) reações dos alunos (aparecem a flutuar no ecrã projetado)
create or replace function public.arena_reagir(p_id text, p_j uuid, p_tok text, p_r integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; ult timestamptz;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if coalesce((s.cfg->>'reacoes')::boolean, false) is not true or s.estado = 'fim' or p_r < 0 or p_r > 5 then return jsonb_build_object('erro','fechada'); end if;
  ult := (j.estado->>'rx')::timestamptz;
  if ult is not null and ult > now() - interval '1 second' then return jsonb_build_object('erro','depressa'); end if;
  update public.eduspruce_arena_jogador set estado = estado || jsonb_build_object('rx', now()) where id = j.id;
  insert into public.eduspruce_arena_reacao (sala, r) values (p_id, p_r);
  if random() < 0.05 then delete from public.eduspruce_arena_reacao where criado < now() - interval '2 minutes'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.arena_reacoes(p_id text, p_desde timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  return jsonb_build_object('agora', now(), 'r', (select coalesce(jsonb_agg(x.r order by x.id), '[]'::jsonb) from
    (select id, r from public.eduspruce_arena_reacao where sala = p_id and criado > greatest(coalesce(p_desde, now() - interval '5 seconds'), now() - interval '20 seconds') order by id limit 200) x));
end $$;

-- 14) estudo ao ritmo do aluno (cartões, aprender, teste): o conjunto inteiro, com as soluções, só nas salas de estudo
create or replace function public.arena_estudo(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; c public.eduspruce_arena_chave;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if coalesce((s.cfg->>'estudo')::boolean, false) is not true then return jsonb_build_object('erro','pedido'); end if;
  if s.estado = 'fim' or (s.limite is not null and s.limite < now()) then return jsonb_build_object('erro','limite'); end if;
  select * into c from public.eduspruce_arena_chave where sala = p_id;
  update public.eduspruce_arena_jogador set visto = now() where id = j.id;
  return jsonb_build_object('perguntas', s.perguntas, 'certas', c.certas, 'extra', c.extra, 'estudo', j.estado->'estudo');
end $$;

create or replace function public.arena_estudo_registo(p_id text, p_j uuid, p_tok text, p_modo text, p_certas integer, p_total integer, p_dominadas integer default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; e jsonb; pts integer;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if coalesce((s.cfg->>'estudo')::boolean, false) is not true or p_modo not in ('cartoes','aprender','teste','pares') then return jsonb_build_object('erro','pedido'); end if;
  if s.estado = 'fim' or (s.limite is not null and s.limite < now()) then return jsonb_build_object('erro','limite'); end if;
  p_total := greatest(0, least(coalesce(p_total, 0), 300)); p_certas := greatest(0, least(coalesce(p_certas, 0), p_total));
  p_dominadas := greatest(0, least(coalesce(p_dominadas, 0), s.n_perg));
  e := coalesce(j.estado->'estudo', '{}'::jsonb);
  e := e || jsonb_build_object(p_modo, jsonb_build_object('c', p_certas, 't', p_total, 'd', p_dominadas, 'em', now(),
        'n', coalesce((e->p_modo->>'n')::int, 0) + 1, 'melhor', greatest(coalesce((e->p_modo->>'melhor')::int, 0), case when p_total > 0 then round(100.0 * p_certas / p_total)::int else 0 end)));
  pts := (select coalesce(sum(coalesce((v->>'melhor')::int, 0)), 0) from jsonb_each(e) x(k, v)) * 10;
  update public.eduspruce_arena_jogador set estado = estado || jsonb_build_object('estudo', e), pontos = pts,
         certas = greatest(certas, p_certas), erradas = case when p_modo = 'teste' then p_total - p_certas else erradas end,
         terminou = terminou or p_dominadas >= s.n_perg, visto = now() where id = j.id;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('ok', true, 'pontos', pts, 'estudo', e);
end $$;

-- 15) mudar a fase da pergunta de ideias (escrever → votar) e permissões
create or replace function public.arena_fase(p_id text, p_fase text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  if p_fase is not null and p_fase not in ('escrever','votar','resultados') then raise exception 'pedido inválido'; end if;
  update public.eduspruce_arena_sala set cfg = case when p_fase is null then cfg - 'fase' else cfg || jsonb_build_object('fase', p_fase) end, versao = versao + 1 where id = p_id;
  return public.arena_prof(p_id);
end $$;

do $$ declare f text; begin
  foreach f in array array['arena_responder3(text,uuid,text,integer,jsonb,integer)','arena_qa_enviar(text,uuid,text,text,boolean)','arena_qa_lista(text,uuid,text)',
      'arena_qa_votar(text,uuid,text,bigint)','arena_ideias(text,uuid,text)','arena_ideia_votar(text,uuid,text,bigint,integer)','arena_reagir(text,uuid,text,integer)',
      'arena_estudo(text,uuid,text)','arena_estudo_registo(text,uuid,text,text,integer,integer,integer)','arena_versao()'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
  foreach f in array array['arena_criar3(text,text,text,jsonb,jsonb,jsonb,jsonb,timestamptz)','arena_atual3(text)','arena_resultados3(text)','arena_cfg3(text,jsonb)',
      'arena_qa_prof(text)','arena_qa_moderar(text,bigint,text)','arena_reacoes(text,timestamptz)','arena_fase(text,text)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  foreach f in array array['arena_corrigir3(text,jsonb,jsonb,integer)','arena_norm(text)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
  end loop;
end $$;
