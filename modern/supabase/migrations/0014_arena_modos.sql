-- =====================================================================================
-- EduSpruce · ARENA — modos novos (v0.990)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
-- Precisa de já ter corrido o 0012_arena.sql.
--
-- Modos: Pesca no Lago, Corrida, Máquina da Garra, Mina Profunda, Colmeia, Caça-Estrelas, Código Pirata e Laser.
-- O servidor continua a corrigir as respostas e a decidir os efeitos (os alunos não conseguem fazer batota).
-- Também acrescenta os 24 Bichos novos (p28–p51) aos sacos de Pinhas.
-- =====================================================================================

create or replace function public.arena_responder(p_id text, p_j uuid, p_tok text, p_perg integer, p_opc integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; c jsonb; certa boolean; ms integer; tmax integer; pts integer := 0; e jsonb; seq integer;
        ultima timestamptz; ganho integer := 0; arv integer; obj integer; ci integer; fim boolean := false; r numeric; peixe text; peso integer := 0; mel integer;
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
  elsif s.modo = 'pesca' then
    -- peso em décimas de quilo; de 5 em 5 certas seguidas o isco é duplo
    if certa then
      r := random();
      if r < 0.05 then peixe := 'bota'; peso := 0;
      elsif r < 0.30 then peixe := 'sardinha'; peso := 2 + floor(random() * 7)::int;
      elsif r < 0.58 then peixe := 'carapau'; peso := 4 + floor(random() * 9)::int;
      elsif r < 0.80 then peixe := 'robalo'; peso := 15 + floor(random() * 26)::int;
      elsif r < 0.92 then peixe := 'polvo'; peso := 30 + floor(random() * 51)::int;
      elsif r < 0.985 then peixe := 'atum'; peso := 80 + floor(random() * 121)::int;
      else peixe := 'baleia'; peso := 300 + floor(random() * 201)::int; end if;
      if seq > 0 and seq % 5 = 0 then peso := peso * 2; end if;
      pts := peso; e := e || jsonb_build_object('peixe', peixe, 'kg', peso, 'peixes', coalesce((e->>'peixes')::int, 0) + case when peixe = 'bota' then 0 else 1 end);
    end if;
  elsif s.modo = 'corrida' then
    if certa then ganho := 1 + case when seq % 3 = 0 then 1 else 0 end; end if; pts := ganho;
  elsif s.modo = 'colmeia' then
    if certa then
      mel := coalesce((e->>'mel')::int, 0) + 10 * coalesce((e->>'abelhas')::int, 1) * (1 + coalesce((e->>'flores')::int, 0));
      e := e || jsonb_build_object('mel', mel, 'escolha', true);
    end if;
  elsif s.modo in ('garra','mina','estrelas','pirata','laser') then
    if certa then e := e || jsonb_build_object('escolha', true); end if;
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
    'escolha', coalesce((j.estado->>'escolha')::boolean, false), 'arv', coalesce((j.estado->>'arv')::int, 0), 'seq', seq, 'moedas', j.moedas, 'fim', fim,
    'peixe', peixe, 'kg', peso, 'mel', (j.estado->>'mel')::int, 'abelhas', coalesce((j.estado->>'abelhas')::int, 1), 'flores', coalesce((j.estado->>'flores')::int, 0));
end $$;

-- escolha depois de uma resposta certa nos modos novos (o efeito decide-se aqui, no servidor)
create or replace function public.arena_acao2(p_id text, p_j uuid, p_tok text, p_escolha integer, p_alvo uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.eduspruce_arena_sala; j public.eduspruce_arena_jogador; o public.eduspruce_arena_jogador; r numeric; ef text; v integer := 0; antes bigint;
        e jsonb; outros jsonb := '[]'::jsonb; i integer; n integer; com text; x text;
begin
  j := public.arena_jog(p_id, p_j, p_tok); if j.id is null or j.expulso then return jsonb_build_object('erro','jogador'); end if;
  select * into s from public.eduspruce_arena_sala where id = p_id;
  if s.modo not in ('garra','mina','colmeia','estrelas','pirata','laser') or not coalesce((j.estado->>'escolha')::boolean, false) then return jsonb_build_object('erro','fora'); end if;
  if s.estado = 'pausa' then return jsonb_build_object('erro','pausa'); end if;
  if s.estado = 'fim' then return jsonb_build_object('erro','fim'); end if;
  antes := j.pontos; e := j.estado - 'escolha'; r := random();
  if s.modo = 'garra' then
    if r < 0.40 then ef := 'falha';
    elsif r < 0.75 then ef := 'peluche'; v := 20 + 10 * floor(random() * 5)::int;
    elsif r < 0.94 then ef := 'grande'; v := 80 + 10 * floor(random() * 8)::int;
    else ef := 'dourado'; v := 300; end if;
    n := 2;
  elsif s.modo = 'mina' then
    if r < 0.30 then ef := 'pedra'; v := 5;
    elsif r < 0.42 then ef := 'carvao'; v := 10;
    elsif r < 0.70 then ef := 'ouro'; v := 30 + 10 * floor(random() * 4)::int;
    elsif r < 0.84 then ef := 'gema'; v := 100 + 20 * floor(random() * 4)::int;
    elsif r < 0.90 then ef := 'diamante'; v := 250;
    else ef := 'dinamite'; v := ceil(j.pontos * 0.20)::int; end if;
    n := 8;
  elsif s.modo = 'estrelas' then
    if r < 0.52 then ef := 'estrela'; v := 20 + 10 * floor(random() * 7)::int;
    elsif r < 0.64 then ef := 'cometa'; v := greatest(20, ceil(j.pontos * 0.5))::int;
    elsif r < 0.69 then ef := 'supernova'; v := 200;
    elsif r < 0.80 then ef := 'buraco'; v := ceil(j.pontos * 0.20)::int;
    elsif r < 0.90 then ef := 'meteoro';
    else ef := 'nada'; end if;
    if ef = 'meteoro' then
      select * into o from public.eduspruce_arena_jogador where sala = p_id and id <> j.id and not expulso and pontos > 0 order by pontos desc limit 1;
      if s.tipo = 'tpc' or o.id is null then ef := 'estrela'; v := 40;
      else v := greatest(5, ceil(o.pontos * 0.10))::int; v := least(v, o.pontos::int); com := o.alcunha;
        update public.eduspruce_arena_jogador set pontos = pontos - v, estado = estado || jsonb_build_object('atingido', jsonb_build_object('por', j.alcunha, 'v', v, 'como', 'meteoro', 'em', now())) where id = o.id; end if;
    end if;
    n := 2;
  elsif s.modo = 'pirata' then
    if r < 0.52 then ef := 'cristais'; v := 15 + 5 * floor(random() * 18)::int;
    elsif r < 0.62 then ef := 'dobra'; v := greatest(j.pontos, 20)::int;
    elsif r < 0.77 then ef := 'piratear';
    elsif r < 0.89 then ef := 'alarme'; v := ceil(j.pontos * 0.15)::int;
    else ef := 'vazio'; end if;
    if ef = 'piratear' then
      select * into o from public.eduspruce_arena_jogador where sala = p_id and id <> j.id and not expulso and pontos > 0 order by random() limit 1;
      if s.tipo = 'tpc' or o.id is null then ef := 'cristais'; v := 25;
      else v := greatest(10, ceil(o.pontos * 0.20))::int; v := least(v, o.pontos::int); com := o.alcunha;
        update public.eduspruce_arena_jogador set pontos = pontos - v, estado = estado || jsonb_build_object('atingido', jsonb_build_object('por', j.alcunha, 'v', v, 'como', 'pirata', 'em', now())) where id = o.id; end if;
    end if;
    n := 2;
  elsif s.modo = 'laser' then
    if p_escolha = 1 then ef := 'escudo'; e := e || jsonb_build_object('escudo', true);
    elsif p_escolha = 2 or s.tipo = 'tpc' then ef := 'carga'; v := 40 + 10 * floor(random() * 4)::int;
    else
      if p_alvo is not null and p_alvo <> j.id then select * into o from public.eduspruce_arena_jogador where id = p_alvo and sala = p_id and not expulso; end if;
      if o.id is null then ef := 'falha';
      elsif coalesce((o.estado->>'escudo')::boolean, false) then ef := 'bloqueado'; com := o.alcunha;
        update public.eduspruce_arena_jogador set estado = (estado - 'escudo') || jsonb_build_object('atingido', jsonb_build_object('por', j.alcunha, 'v', 0, 'como', 'escudo', 'em', now())) where id = o.id;
      else ef := 'acerto'; com := o.alcunha; v := least(greatest(10, ceil(o.pontos * 0.15))::int, o.pontos::int);
        update public.eduspruce_arena_jogador set pontos = pontos - v, estado = estado || jsonb_build_object('atingido', jsonb_build_object('por', j.alcunha, 'v', v, 'como', 'laser', 'em', now())) where id = o.id; end if;
    end if;
    n := 0;
  elsif s.modo = 'colmeia' then
    if p_escolha = 0 then ef := 'abelha'; e := e || jsonb_build_object('abelhas', least(30, coalesce((e->>'abelhas')::int, 1) + 1));
    elsif p_escolha = 1 then ef := 'flor'; e := e || jsonb_build_object('flores', least(30, coalesce((e->>'flores')::int, 0) + 1));
    else ef := 'venda'; v := coalesce((e->>'mel')::int, 0); e := e || jsonb_build_object('mel', 0); end if;
    n := 0;
  end if;
  -- aplicar o efeito aos pontos de quem escolheu
  if ef in ('peluche','grande','dourado','pedra','carvao','ouro','gema','diamante','estrela','cometa','supernova','meteoro','cristais','dobra','piratear','acerto','carga','venda') then
    update public.eduspruce_arena_jogador set pontos = pontos + v where id = j.id;
  elsif ef in ('dinamite','buraco','alarme') then
    update public.eduspruce_arena_jogador set pontos = greatest(0, pontos - v) where id = j.id;
  end if;
  update public.eduspruce_arena_jogador set estado = e || jsonb_build_object('ultimo', ef), visto = now() where id = j.id returning * into j;
  -- o que estava nas outras opções (só para mostrar)
  for i in 1..coalesce(n, 0) loop
    x := case s.modo when 'garra' then (array['falha','peluche','peluche','grande','dourado'])[1 + floor(random() * 5)::int]
                     when 'mina' then (array['pedra','pedra','carvao','ouro','ouro','gema','diamante','dinamite'])[1 + floor(random() * 8)::int]
                     when 'estrelas' then (array['estrela','estrela','cometa','supernova','buraco','meteoro','nada'])[1 + floor(random() * 7)::int]
                     else (array['cristais','cristais','dobra','piratear','alarme','vazio'])[1 + floor(random() * 6)::int] end;
    outros := outros || to_jsonb(x);
  end loop;
  update public.eduspruce_arena_sala set versao = versao + 1 where id = p_id;
  if nullif((s.cfg->>'objetivo')::int, 0) is not null and j.pontos >= (s.cfg->>'objetivo')::int then
    if s.tipo = 'vivo' then perform public.arena_fechar(p_id); else update public.eduspruce_arena_jogador set terminou = true where id = j.id; perform public.arena_creditar(j.id); end if;
  end if;
  return jsonb_build_object('efeito', ef, 'valor', v, 'com', com, 'antes', antes, 'pontos', j.pontos, 'outros', outros,
    'mel', coalesce((j.estado->>'mel')::int, 0), 'abelhas', coalesce((j.estado->>'abelhas')::int, 1), 'flores', coalesce((j.estado->>'flores')::int, 0), 'escudo', coalesce((j.estado->>'escudo')::boolean, false));
end $$;

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
  ids := case rar when 'c' then array['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p28','p29','p30','p31','p32','p33','p34','p35']
                  when 'r' then array['p11','p12','p13','p14','p15','p16','p17','p36','p37','p38','p39','p40','p41']
                  when 'e' then array['p18','p19','p20','p21','p22','p42','p43','p44','p45','p46']
                  when 'l' then array['p23','p24','p25','p47','p48','p49']
                  else array['p26','p27','p50','p51'] end;
  p := ids[1 + floor(random() * array_length(ids, 1))::int];
  update public.eduspruce_arena_colecao set moedas = moedas - preco,
    pinhas = jsonb_set(pinhas, array[p], to_jsonb(coalesce((pinhas->>p)::int, 0) + 1)), mudado = now()
  where user_id = s.user_id and ref = j.ref returning * into c;
  return jsonb_build_object('pinha', p, 'rar', rar, 'moedas', c.moedas, 'pinhas', c.pinhas);
end $$;

do $$ begin
  execute 'revoke all on function public.arena_acao2(text,uuid,text,integer,uuid) from public';
  execute 'grant execute on function public.arena_acao2(text,uuid,text,integer,uuid) to anon, authenticated';
end $$;

-- Verificação: deve mostrar «arena_acao2»
select proname from pg_proc where proname = 'arena_acao2';
