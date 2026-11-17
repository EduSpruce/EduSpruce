-- =====================================================================================
-- EduSpruce · ARENA — 6 modos novos e aspeto novo (v1.054)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
-- Precisa de já ter corrido o 0012_arena.sql e o 0014_arena_modos.sql.
--
-- Modos: Corrida ao Cume (cume), Cofre Partilhado (cofre), Maré Viva (mare), Duelo Relâmpago (duelo),
--        Expedição (expedicao) e Estafeta (estafeta).
-- Também: aspeto da página dos alunos (cfg.tema), número de equipas (cfg.equipas), «até dominar» (cfg.dominar),
--         alcunhas aleatórias (cfg.alcunhas), sons dos alunos desligados (cfg.silencio)
--         e «mostrar a resposta certa» (cfg.mostrar).
-- Os modos antigos continuam a usar as funções de sempre; as novas só tratam dos 6 modos novos.
-- O servidor continua a corrigir as respostas e a decidir os efeitos (os alunos não conseguem fazer batota).
-- =====================================================================================

alter table public.eduspruce_arena_sala add column if not exists equipas jsonb not null default '{}'::jsonb;

create or replace function public.arena_versao() returns integer language sql immutable as $$ select 17 $$;

-- estado público de uma sala (+ aspeto, equipas, mostrar)
create or replace function public.arena_publico(s public.eduspruce_arena_sala) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'modo', s.modo, 'tipo', s.tipo, 'estado', s.estado, 'atual', s.atual, 'revelada', s.revelada, 'n_perg', s.n_perg, 'versao', s.versao,
    'agora', now(), 'atual_ini', s.atual_ini, 'inicio', s.inicio, 'fim_em', s.fim_em, 'pausa_em', s.pausa_em, 'limite', s.limite,
    'cfg', jsonb_build_object('nomes', s.cfg->'nomes', 'lista_c', s.cfg->'lista_c', 'moedas', s.cfg->'moedas', 'tardias', s.cfg->'tardias',
            'duracao', s.cfg->'duracao', 'objetivo', s.cfg->'objetivo', 'titulo', s.cfg->'titulo', 'tempo', s.cfg->'tempo',
            'tema', s.cfg->'tema', 'equipas', s.cfg->'equipas', 'mostrar', s.cfg->'mostrar', 'dominar', s.cfg->'dominar',
            'alcunhas', s.cfg->'alcunhas', 'silencio', s.cfg->'silencio'),
    'pergunta', case when s.modo = 'classico' and s.tipo = 'vivo' and s.atual >= 0 and s.estado in ('jogo','pausa') then s.perguntas->s.atual end,
    'certa', case when s.revelada and s.atual >= 0 then (select c.certas->s.atual from public.eduspruce_arena_chave c where c.sala = s.id) end
  );
$$;

-- classificação curta (+ equipa, maré, apoio)
create or replace function public.arena_top(p_sala text, p_n integer default 10) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x->>'pos'), '[]'::jsonb) from (
    select jsonb_build_object('pos', lpad((row_number() over (order by pontos desc, criado))::text, 3, '0'), 'id', id, 'alcunha', alcunha, 'avatar', avatar, 'pontos', pontos,
           'arv', coalesce((estado->>'arv')::int, 0), 'eq', estado->'eq', 'agua', estado->'agua', 'fora', estado->'fora', 'apoia', estado->'apoia') x
    from public.eduspruce_arena_jogador where sala = p_sala and not expulso order by pontos desc, criado limit p_n) q;
$$;

-- ---------- utilitários dos modos novos ----------
-- seguinte (dir = 1) ou anterior (dir = -1) da equipa, só entre quem está ligado (quem tem o testemunho conta sempre)
create or replace function public.arena_eq_seguinte(p_id text, p_eq integer, p_atual uuid, p_dir integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare m uuid[]; i integer; n integer;
begin
  select array_agg(id order by criado) into m from public.eduspruce_arena_jogador
   where sala = p_id and not expulso and (estado->>'eq')::int = p_eq and (visto > now() - interval '25 seconds' or id = p_atual);
  n := coalesce(array_length(m, 1), 0);
  if n = 0 then return null; end if;
  i := array_position(m, p_atual);
  if i is null then return m[1]; end if;
  i := ((i - 1 + p_dir) % n + n) % n + 1;
  return m[i];
end $$;

-- campeão que um jogador apoia (segue a cadeia de apoios do Duelo Relâmpago)
create or replace function public.arena_campeao(p_j uuid) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := p_j; nx uuid; k integer := 0;
begin
  loop
    select (estado->>'apoia')::uuid into nx from public.eduspruce_arena_jogador where id = cur;
    exit when nx is null or k > 60;
    cur := nx; k := k + 1;
  end loop;
  return cur;
end $$;

-- fim de um duelo: decide quem ganha (p_desist = o adversário desistiu/desligou-se → ganha p_a)
create or replace function public.arena_duelo_fim(p_id text, p_a uuid, p_b uuid, p_desist boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.eduspruce_arena_jogador; b public.eduspruce_arena_jogador; w public.eduspruce_arena_jogador; l public.eduspruce_arena_jogador;
        aok integer; bok integer; ams integer; bms integer;
begin
  select * into a from public.eduspruce_arena_jogador where id = p_a for update;
  select * into b from public.eduspruce_arena_jogador where id = p_b for update;
  aok := coalesce((a.estado->'dl'->>'ok')::int, 0); ams := coalesce((a.estado->'dl'->>'ms')::int, 0);
  bok := coalesce((b.estado->'dl'->>'ok')::int, 0); bms := coalesce((b.estado->'dl'->>'ms')::int, 0);
  if b.id is null or p_desist or aok > bok or (aok = bok and ams < bms) or (aok = bok and ams = bms and random() < 0.5) then w := a; l := b; else w := b; l := a; end if;
  update public.eduspruce_arena_jogador set pontos = pontos + 300,
    estado = (estado - 'dl') || jsonb_build_object('procura', now(), 'vit', coalesce((estado->>'vit')::int, 0) + 1,
      'apo', coalesce((estado->>'apo')::int, 0) + 1 + coalesce((l.estado->>'apo')::int, 0),
      'ult', jsonb_build_object('adv', l.alcunha, 'eu', coalesce((w.estado->'dl'->>'ok')::int, 0), 'ele', coalesce((l.estado->'dl'->>'ok')::int, 0), 'ganhou', true, 'desist', p_desist, 'em', now()))
  where id = w.id;
  if l.id is not null then
    update public.eduspruce_arena_jogador set
      estado = (estado - 'dl' - 'procura') || jsonb_build_object('apoia', w.id, 'apoia_nome', w.alcunha,
        'ult', jsonb_build_object('adv', w.alcunha, 'eu', coalesce((l.estado->'dl'->>'ok')::int, 0), 'ele', coalesce((w.estado->'dl'->>'ok')::int, 0), 'ganhou', false, 'desist', p_desist, 'em', now()))
    where id = l.id;
  end if;
  return jsonb_build_object('vencedor', w.id, 'vencedor_nome', w.alcunha, 'perdedor', l.id);
end $$;

-- ---------- próxima pergunta (modos novos) ----------
create or replace function public.arena_pergunta2(p_id text, p_j uuid, p_tok text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; o public.eduspruce_arena_jogador; e jsonb; ord jsonb; k integer; q integer;
        dur integer; ini timestamptz; eq integer; t jsonb; vez uuid; dl jsonb; dq jsonb; n integer; treino boolean := false; lim integer; di integer;
begin
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not found then return jsonb_build_object('erro','sala'); end if;
  if s.modo not in ('cume','cofre','mare','duelo','expedicao','estafeta') then return public.arena_pergunta(p_id, p_j, p_tok); end if;
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  if s.tipo = 'vivo' and s.estado <> 'jogo' then return jsonb_build_object('erro','espera'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  if s.tipo = 'vivo' and s.fim_em is not null and s.fim_em < now() then perform public.arena_fechar(p_id); return jsonb_build_object('erro','fim'); end if;
  perform pg_advisory_xact_lock(hashtext('arena:' || p_id));
  select * into j from public.eduspruce_arena_jogador where id = j.id;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if j.terminou or coalesce((j.estado->>'fora')::boolean, false) then return jsonb_build_object('erro','terminou'); end if;
  e := j.estado;
  if coalesce((e->>'escolha')::boolean, false) then return jsonb_build_object('escolha', true); end if;
  update public.eduspruce_arena_jogador set visto = now() where id = j.id;

  -- tempo de jogo de cada aluno no trabalho de casa
  if s.tipo = 'tpc' then
    ini := coalesce((e->>'ini')::timestamptz, now()); if e->>'ini' is null then e := e || jsonb_build_object('ini', now()); end if;
    dur := nullif((s.cfg->>'duracao')::int, 0);
    if s.modo <> 'expedicao' and dur is not null and now() > ini + make_interval(secs => dur) then
      update public.eduspruce_arena_jogador set terminou = true, estado = e where id = j.id; perform public.arena_creditar(j.id); return jsonb_build_object('erro','terminou'); end if;
  end if;

  -- equipas (distribuição equilibrada, à chegada)
  if s.modo in ('cofre','estafeta') then
    eq := (e->>'eq')::int;
    if eq is null then
      n := least(6, greatest(2, coalesce((s.cfg->>'equipas')::int, 4)));
      select g into eq from generate_series(0, n - 1) g
        left join public.eduspruce_arena_jogador x on x.sala = p_id and not x.expulso and (x.estado->>'eq')::int = g
        group by g order by count(x.id), g limit 1;
      e := e || jsonb_build_object('eq', eq);
      update public.eduspruce_arena_jogador set estado = e where id = j.id;
    end if;
  end if;

  -- Estafeta: só quem tem o testemunho recebe pergunta
  if s.modo = 'estafeta' then
    t := coalesce(s.equipas->(eq::text), '{}'::jsonb);
    vez := (t->>'vez')::uuid;
    if vez is not null then select * into o from public.eduspruce_arena_jogador where id = vez; end if;
    if vez is null or o.id is null or o.expulso or o.visto < now() - interval '25 seconds'
       or (o.id <> j.id and t->>'ini' is not null and (t->>'ini')::timestamptz < now() - make_interval(secs => coalesce((s.perguntas->coalesce((o.estado->>'q')::int, 0)->>'s')::int, 20) + 10)) then
      vez := coalesce(public.arena_eq_seguinte(p_id, eq, vez, 1), j.id);
      t := t || jsonb_build_object('vez', vez, 'ini', now());
      update public.eduspruce_arena_sala set equipas = equipas || jsonb_build_object(eq::text, t), versao = versao + 1 where id = p_id;
    end if;
    if vez <> j.id then
      select * into o from public.eduspruce_arena_jogador where id = vez;
      update public.eduspruce_arena_jogador set estado = e - 'q' where id = j.id;
      return jsonb_build_object('vez', false, 'quem', o.alcunha, 'avatar', o.avatar, 'eq', eq, 'etapas', coalesce((t->>'etapas')::int, 0), 'ultimo', t->'ultimo');
    end if;
  end if;

  -- Duelo Relâmpago (só ao vivo): pares sorteados, 3 perguntas iguais para os dois
  if s.modo = 'duelo' and s.tipo = 'vivo' and e->'apoia' is null then
    dl := e->'dl';
    if dl is not null and coalesce((dl->>'di')::int, 0) >= 3 then
      select * into o from public.eduspruce_arena_jogador where id = (dl->>'adv')::uuid;
      if o.id is null or o.expulso or o.visto < now() - interval '30 seconds' or o.estado->'dl' is null
         or now() > (dl->>'ini')::timestamptz + make_interval(secs => 3 * greatest(5, coalesce((s.cfg->>'tempo')::int, 20)) + 40) then
        perform public.arena_duelo_fim(p_id, j.id, o.id, true);
        select * into j from public.eduspruce_arena_jogador where id = j.id; e := j.estado; dl := null;
        update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
      else
        return jsonb_build_object('duelo_espera', true, 'adv', o.alcunha, 'avatar', o.avatar, 'adv_di', coalesce((o.estado->'dl'->>'di')::int, 0), 'eu_ok', (dl->>'ok')::int);
      end if;
    end if;
    if dl is null then
      select * into o from public.eduspruce_arena_jogador x where x.sala = p_id and x.id <> j.id and not x.expulso and not x.terminou
         and x.visto > now() - interval '20 seconds' and x.estado->'dl' is null and x.estado->'apoia' is null and x.estado->>'procura' is not null
       order by (x.estado->>'procura')::timestamptz limit 1;
      if o.id is not null then
        if s.n_perg >= 3 then select jsonb_agg(i) into dq from (select i from generate_series(0, s.n_perg - 1) i order by random() limit 3) z;
        else dq := jsonb_build_array(0, 1 % s.n_perg, 2 % s.n_perg); end if;
        dl := jsonb_build_object('dq', dq, 'di', 0, 'ok', 0, 'ms', 0, 'ini', now());
        update public.eduspruce_arena_jogador set estado = (estado - 'procura') || jsonb_build_object('dl', dl || jsonb_build_object('adv', j.id)) where id = o.id;
        dl := dl || jsonb_build_object('adv', o.id);
        e := (e - 'procura') || jsonb_build_object('dl', dl);
        update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
      else
        if e->>'procura' is null then e := e || jsonb_build_object('procura', now()); end if;
        treino := true;
      end if;
    end if;
    if dl is not null then
      di := coalesce((dl->>'di')::int, 0);
      q := (dl->'dq'->>di)::int;
      select * into o from public.eduspruce_arena_jogador where id = (dl->>'adv')::uuid;
      e := e || jsonb_build_object('q', q, 'q_ini', now(), 'qd', true);
      update public.eduspruce_arena_jogador set estado = e, visto = now() where id = j.id;
      return jsonb_build_object('i', q, 'n', di + 1, 'pergunta', s.perguntas->q,
        'duelo', jsonb_build_object('adv', o.alcunha, 'avatar', o.avatar, 'r', di + 1, 'eu', coalesce((dl->>'ok')::int, 0), 'adv_di', coalesce((o.estado->'dl'->>'di')::int, 0)));
    end if;
  end if;

  -- pergunta seguinte da ordem do aluno («até dominar»: as falhadas voltam ao fim)
  ord := e->'ordem'; k := coalesce((e->>'k')::int, 0);
  if ord is null or k >= jsonb_array_length(ord) then
    if s.modo = 'expedicao' and ord is not null then
      update public.eduspruce_arena_jogador set terminou = true, estado = e where id = j.id; perform public.arena_creditar(j.id);
      update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
      return jsonb_build_object('erro','terminou');
    end if;
    select jsonb_agg(i order by case when coalesce((s.cfg->>'aleatoria')::boolean, true) then random() else i end) into ord from generate_series(0, s.n_perg - 1) i;
    if s.n_perg > 1 and (ord->>0)::int = coalesce((e->>'q')::int, -1) then ord := (ord - 0) || jsonb_build_array(ord->0); end if;
    k := 0;
  end if;
  q := (ord->>k)::int;
  e := e || jsonb_build_object('ordem', ord, 'k', k, 'q', q, 'q_ini', now(), 'qd', false);
  update public.eduspruce_arena_jogador set estado = e, visto = now() where id = j.id;
  if s.modo = 'estafeta' then
    update public.eduspruce_arena_sala set equipas = jsonb_set(equipas, array[eq::text, 'ini'], to_jsonb(now())) where id = p_id;
  end if;
  lim := case when s.modo = 'expedicao' then s.n_perg else null end;
  return jsonb_build_object('i', q, 'n', k + 1, 'pergunta', s.perguntas->q, 'ini', e->>'ini', 'treino', treino, 'eq', eq, 'total', lim);
end $$;

-- ---------- responder (modos novos) ----------
create or replace function public.arena_responder2(p_id text, p_j uuid, p_tok text, p_perg integer, p_opc integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; o public.eduspruce_arena_jogador; c jsonb; certa boolean; ms integer; tmax integer;
        pts integer := 0; e jsonb; seq integer; ultima timestamptz; ci integer; fim boolean := false; obj integer; eq integer; t jsonb; vez uuid;
        agua integer; afogou boolean := false; baixou boolean := false; mao integer; perdeu integer := 0; qd boolean; dl jsonb; res jsonb; camp uuid;
        nomeCamp text; vivos integer; tot integer; soma bigint; prox text; ext jsonb := '{}'::jsonb;
begin
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not found then return jsonb_build_object('erro','sala'); end if;
  if s.modo not in ('cume','cofre','mare','duelo','expedicao','estafeta') then return public.arena_responder(p_id, p_j, p_tok, p_perg, p_opc); end if;
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  if s.tipo = 'vivo' and s.estado <> 'jogo' then return jsonb_build_object('erro','espera'); end if;
  if s.tipo = 'tpc' and s.limite is not null and s.limite < now() then return jsonb_build_object('erro','limite'); end if;
  if p_perg < 0 or p_perg >= s.n_perg or p_opc < -1 or p_opc > 5 then return jsonb_build_object('erro','pedido'); end if;
  if s.tipo = 'vivo' and s.fim_em is not null and s.fim_em < now() + interval '-2 seconds' then perform public.arena_fechar(p_id); return jsonb_build_object('erro','fim'); end if;
  perform pg_advisory_xact_lock(hashtext('arena:' || p_id));
  select * into j from public.eduspruce_arena_jogador where id = j.id;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if j.terminou or coalesce((j.estado->>'fora')::boolean, false) then return jsonb_build_object('erro','terminou'); end if;
  select max(criado) into ultima from public.eduspruce_arena_resp where jogador = j.id;
  if ultima is not null and ultima > now() - interval '300 milliseconds' then return jsonb_build_object('erro','depressa'); end if;
  e := j.estado;
  if coalesce((e->>'q')::int, -1) <> p_perg or coalesce((e->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
  eq := (e->>'eq')::int;
  if s.modo = 'estafeta' then
    t := coalesce(s.equipas->(eq::text), '{}'::jsonb);
    if (t->>'vez')::uuid is distinct from j.id then return jsonb_build_object('erro','fora'); end if;
  end if;
  select certas into c from public.eduspruce_arena_chave where sala = p_id;
  ci := (c->>p_perg)::int; certa := (p_opc = ci);
  seq := coalesce((e->>'seq')::int, 0);
  tmax := greatest(5, coalesce((s.perguntas->p_perg->>'s')::int, (s.cfg->>'tempo')::int, 20));
  ms := (extract(epoch from (now() - coalesce((e->>'q_ini')::timestamptz, now()))) * 1000)::int;
  ms := greatest(0, least(ms, 600000));
  qd := coalesce((e->>'qd')::boolean, false);
  e := e || jsonb_build_object('k', coalesce((e->>'k')::int, 0) + 1, 'q_ini', null, 'qd', false);
  if certa then seq := seq + 1; else seq := 0; end if;
  e := e || jsonb_build_object('seq', seq);
  -- «até dominar»: a pergunta falhada volta ao fim da fila (Expedição sempre)
  if not certa and not qd and (s.modo = 'expedicao' or coalesce((s.cfg->>'dominar')::boolean, false)) and e->'ordem' is not null
     and jsonb_array_length(e->'ordem') < s.n_perg * 4 then
    e := jsonb_set(e, '{ordem}', (e->'ordem') || to_jsonb(p_perg));
  end if;

  if s.modo = 'cume' then
    -- sobe a montanha: 10 m + até 20 m pela rapidez (+5 m a partir de 3 certas seguidas)
    if certa then pts := 10 + greatest(0, round(20 * (1 - least(ms, tmax * 1000)::numeric / (tmax * 1000))))::int + case when seq >= 3 then 5 else 0 end; end if;
    ext := jsonb_build_object('subiu', pts);
  elsif s.modo = 'mare' then
    agua := coalesce((e->>'agua')::int, 0);
    if certa then pts := 100; if seq % 3 = 0 and agua > 0 then agua := agua - 1; baixou := true; end if;
    else agua := agua + 1; if agua >= 5 then afogou := true; e := e || jsonb_build_object('fora', true, 'fora_em', now()); end if; end if;
    e := e || jsonb_build_object('agua', agua);
    ext := jsonb_build_object('agua', agua, 'baixou', baixou, 'fora', afogou);
  elsif s.modo = 'expedicao' then
    if certa then pts := 1; end if;
    ext := jsonb_build_object('falta', greatest(0, jsonb_array_length(e->'ordem') - coalesce((e->>'k')::int, 0)), 'total', s.n_perg);
  elsif s.modo = 'cofre' then
    mao := coalesce((e->>'mao')::int, 0);
    if certa then mao := mao + 100 + 25 * least(seq - 1, 4); e := e || jsonb_build_object('mao', mao, 'escolha', true);
    else perdeu := mao - mao / 2; mao := mao / 2; e := e || jsonb_build_object('mao', mao); end if;
    ext := jsonb_build_object('mao', mao, 'perdeu', perdeu);
  elsif s.modo = 'estafeta' then
    if certa then pts := 100; t := t || jsonb_build_object('etapas', coalesce((t->>'etapas')::int, 0) + 1); vez := public.arena_eq_seguinte(p_id, eq, j.id, 1);
    else vez := public.arena_eq_seguinte(p_id, eq, j.id, -1); end if;
    vez := coalesce(vez, j.id);
    t := t || jsonb_build_object('vez', vez, 'ini', now(), 'ultimo', jsonb_build_object('quem', j.alcunha, 'certa', certa, 'em', now()));
    update public.eduspruce_arena_sala set equipas = equipas || jsonb_build_object(eq::text, t) where id = p_id;
    select alcunha into prox from public.eduspruce_arena_jogador where id = vez;
    e := e - 'q';
    ext := jsonb_build_object('etapas', coalesce((t->>'etapas')::int, 0), 'proximo', prox, 'eu_outra_vez', vez = j.id);
  elsif s.modo = 'duelo' then
    dl := e->'dl';
    if qd and dl is not null and (dl->'dq'->>coalesce((dl->>'di')::int, 0))::int = p_perg then
      dl := dl || jsonb_build_object('di', coalesce((dl->>'di')::int, 0) + 1, 'ok', coalesce((dl->>'ok')::int, 0) + certa::int, 'ms', coalesce((dl->>'ms')::int, 0) + ms);
      e := e || jsonb_build_object('dl', dl);
      if certa then pts := 50; end if;
      ext := jsonb_build_object('duelo', jsonb_build_object('r', (dl->>'di')::int, 'eu', (dl->>'ok')::int));
    elsif e->'apoia' is not null then
      -- quem perdeu apoia o campeão: cada certa dá 50 ao campeão (e 10 a quem respondeu)
      if certa then
        pts := 10; camp := public.arena_campeao(j.id);
        if camp is not null and camp <> j.id then update public.eduspruce_arena_jogador set pontos = pontos + 50 where id = camp returning alcunha into nomeCamp; end if;
      else select alcunha into nomeCamp from public.eduspruce_arena_jogador where id = public.arena_campeao(j.id); end if;
      ext := jsonb_build_object('apoia', nomeCamp);
    else
      if certa then pts := 50; end if;
      ext := jsonb_build_object('treino', true);
    end if;
  end if;

  insert into public.eduspruce_arena_resp (sala, jogador, perg, opc, certa, ms, pts) values (p_id, j.id, p_perg, p_opc, certa, ms, pts);
  update public.eduspruce_arena_jogador set pontos = pontos + pts, certas = certas + certa::int, erradas = erradas + (not certa)::int,
         moedas = moedas + case when certa and coalesce((s.cfg->>'moedas')::boolean, true) then 2 else 0 end, estado = e, visto = now(),
         terminou = terminou or afogou
  where id = j.id returning * into j;

  -- Duelo: os dois já responderam às 3 perguntas?
  if s.modo = 'duelo' and qd and dl is not null and (dl->>'di')::int >= 3 then
    select * into o from public.eduspruce_arena_jogador where id = (dl->>'adv')::uuid;
    if o.id is not null and coalesce((o.estado->'dl'->>'di')::int, 0) >= 3 then
      res := public.arena_duelo_fim(p_id, j.id, o.id, false);
      select * into j from public.eduspruce_arena_jogador where id = j.id;
      ext := ext || jsonb_build_object('resultado', j.estado->'ult');
    end if;
  end if;

  -- Maré Viva: quem fica em terra firme ganha 50 por cada colega que a maré leva; o último em terra ganha 200 e o jogo acaba
  if afogou then
    perform public.arena_creditar(j.id);
    update public.eduspruce_arena_jogador set pontos = pontos + 50 where sala = p_id and not expulso and id <> j.id and not coalesce((estado->>'fora')::boolean, false);
    select count(*) filter (where not coalesce((estado->>'fora')::boolean, false)), count(*) into vivos, tot from public.eduspruce_arena_jogador where sala = p_id and not expulso;
    if s.tipo = 'vivo' and tot >= 2 and vivos <= 1 then
      update public.eduspruce_arena_jogador set pontos = pontos + 200 where sala = p_id and not expulso and not coalesce((estado->>'fora')::boolean, false);
      perform public.arena_fechar(p_id); fim := true;
    end if;
  end if;
  -- Duelo: resta um campeão?
  if s.modo = 'duelo' and s.tipo = 'vivo' and res is not null then
    select count(*) filter (where estado->'apoia' is null), count(*) into vivos, tot from public.eduspruce_arena_jogador where sala = p_id and not expulso;
    if tot >= 2 and vivos <= 1 then perform public.arena_fechar(p_id); fim := true; end if;
  end if;

  -- objetivo atingido?
  obj := nullif((s.cfg->>'objetivo')::int, 0);
  if obj is not null and not fim then
    if s.modo = 'estafeta' then soma := coalesce((t->>'etapas')::int, 0);
    elsif s.modo = 'cofre' then select coalesce(sum(pontos), 0) into soma from public.eduspruce_arena_jogador where sala = p_id and not expulso and (estado->>'eq')::int = eq;
    else soma := j.pontos; end if;
    if soma >= obj then
      if s.tipo = 'vivo' then perform public.arena_fechar(p_id); else update public.eduspruce_arena_jogador set terminou = true where id = j.id; perform public.arena_creditar(j.id); end if; fim := true;
    end if;
  end if;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  return jsonb_build_object('certa', certa, 'ci', case when coalesce((s.cfg->>'mostrar')::boolean, true) or certa then ci end, 'pts', pts, 'pontos', j.pontos,
    'seq', seq, 'moedas', j.moedas, 'fim', fim or afogou, 'escolha', coalesce((j.estado->>'escolha')::boolean, false)) || ext;
end $$;

-- ---------- Cofre Partilhado: depois de uma certa, guardar, arriscar ou continuar ----------
create or replace function public.arena_acao_modo(p_id text, p_j uuid, p_tok text, p_escolha integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; e jsonb; mao integer; ef text; v integer := 0; ganho integer := 0; eq integer; soma bigint; obj integer;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.modo <> 'cofre' or not coalesce((j.estado->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  perform pg_advisory_xact_lock(hashtext('arena:' || p_id));
  select * into j from public.eduspruce_arena_jogador where id = j.id;
  if not coalesce((j.estado->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
  e := j.estado - 'escolha'; mao := coalesce((e->>'mao')::int, 0); eq := (e->>'eq')::int;
  if p_escolha = 0 then ef := 'guardou'; v := mao; ganho := mao; mao := 0;
  elsif p_escolha = 1 then
    if random() < 0.5 then ef := 'dobrou'; v := mao; mao := mao * 2; else ef := 'perdeu'; v := mao; mao := 0; end if;
  else ef := 'manteve'; v := mao; end if;
  update public.eduspruce_arena_jogador set pontos = pontos + ganho, estado = e || jsonb_build_object('mao', mao, 'ultimo', ef), visto = now()
  where id = j.id returning * into j;
  select coalesce(sum(pontos), 0) into soma from public.eduspruce_arena_jogador where sala = p_id and not expulso and (estado->>'eq')::int = eq;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  obj := nullif((s.cfg->>'objetivo')::int, 0);
  if obj is not null and soma >= obj then
    if s.tipo = 'vivo' then perform public.arena_fechar(p_id); else update public.eduspruce_arena_jogador set terminou = true where id = j.id; perform public.arena_creditar(j.id); end if;
  end if;
  return jsonb_build_object('efeito', ef, 'valor', v, 'mao', mao, 'pontos', j.pontos, 'cofre', soma, 'eq', eq);
end $$;

-- ---------- equipas (para a página dos alunos e para o ecrã projetado) ----------
create or replace function public.arena_equipas(p_id text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; n integer;
begin
  if p_id !~ '^[0-9a-f]{40}$' then return null; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if not found or s.modo not in ('cofre','estafeta') then return '[]'::jsonb; end if;
  n := least(6, greatest(2, coalesce((s.cfg->>'equipas')::int, 4)));
  return (select coalesce(jsonb_agg(jsonb_build_object('eq', g,
      'pontos', (select coalesce(sum(x.pontos), 0) from public.eduspruce_arena_jogador x where x.sala = p_id and not x.expulso and (x.estado->>'eq')::int = g),
      'etapas', coalesce((s.equipas->(g::text)->>'etapas')::int, 0),
      'vez', (select x.alcunha from public.eduspruce_arena_jogador x where x.id = (s.equipas->(g::text)->>'vez')::uuid),
      'vez_id', s.equipas->(g::text)->'vez',
      'membros', (select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'alcunha', x.alcunha, 'avatar', x.avatar, 'pontos', x.pontos, 'mao', coalesce((x.estado->>'mao')::int, 0)) order by x.criado), '[]'::jsonb)
                  from public.eduspruce_arena_jogador x where x.sala = p_id and not x.expulso and (x.estado->>'eq')::int = g)) order by g), '[]'::jsonb)
    from generate_series(0, n - 1) g);
end $$;

-- ecrã do anfitrião: + dados dos modos novos (equipa, maré, duelo, cofre)
create or replace function public.arena_prof(p_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; c jsonb;
begin
  if not public.arena_dono(p_id) then raise exception 'sem autorização'; end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.estado = 'jogo' and s.fim_em is not null and s.fim_em < now() then perform public.arena_fechar(p_id); select * into s from public.eduspruce_arena_sala where id = p_id; end if;
  select certas into c from public.eduspruce_arena_chave where sala = p_id;
  return jsonb_build_object('sala', public.arena_publico(s) || jsonb_build_object('id', s.id, 'criado', s.criado, 'expira', s.expira, 'terminado', s.terminado),
    'certas', c,
    'jogadores', (select coalesce(jsonb_agg(jsonb_build_object('id', j.id, 'alcunha', j.alcunha, 'ref', j.ref, 'avatar', j.avatar, 'pontos', j.pontos, 'certas', j.certas,
        'erradas', j.erradas, 'moedas', j.moedas, 'arv', coalesce((j.estado->>'arv')::int, 0), 'expulso', j.expulso, 'terminou', j.terminou,
        'ligado', j.visto > now() - interval '20 seconds', 'criado', j.criado,
        'x', jsonb_build_object('eq', j.estado->'eq', 'agua', j.estado->'agua', 'fora', j.estado->'fora', 'apoia', j.estado->'apoia', 'apo', j.estado->'apo',
              'vit', j.estado->'vit', 'mao', j.estado->'mao', 'adv', j.estado->'dl'->'adv', 'di', j.estado->'dl'->'di', 'ok', j.estado->'dl'->'ok')) order by j.pontos desc, j.criado), '[]'::jsonb)
      from public.eduspruce_arena_jogador j where j.sala = p_id),
    'equipas', case when s.modo in ('cofre','estafeta') then public.arena_equipas(p_id) end,
    'atual', case when s.atual >= 0 then (select coalesce(jsonb_object_agg(r.opc::text, r.n), '{}'::jsonb) from
       (select opc, count(*) n from public.eduspruce_arena_resp where sala = p_id and perg = s.atual and s.modo = 'classico' and s.tipo = 'vivo' group by opc) r) end,
    'respostas', (select count(*) from public.eduspruce_arena_resp where sala = p_id));
end $$;

-- permissões
do $$ declare f text; begin
  foreach f in array array['arena_pergunta2(text,uuid,text)','arena_responder2(text,uuid,text,integer,integer)','arena_acao_modo(text,uuid,text,integer)','arena_equipas(text)','arena_versao()'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
  foreach f in array array['arena_eq_seguinte(text,integer,uuid,integer)','arena_campeao(uuid)','arena_duelo_fim(text,uuid,uuid,boolean)','arena_publico(public.eduspruce_arena_sala)','arena_top(text,integer)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon, authenticated';
  end loop;
  execute 'revoke all on function public.arena_prof(text) from public, anon';
  execute 'grant execute on function public.arena_prof(text) to authenticated';
end $$;

-- Verificação: deve mostrar «17»
select public.arena_versao() as versao_arena;
