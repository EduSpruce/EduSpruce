-- Spruce It: percurso professor → alunos → resultados nas funções da base de dados (jogo ao vivo, modo clássico).
-- Cada «certo(condição, o que se esperava)» pára o teste com erro se a condição falhar.
create function pg_temp.certo(c boolean, m text) returns text language plpgsql as $$ begin if c is not true then raise exception 'ERRO do teste: %', m; end if; return 'ok'; end $$;
insert into auth.users (id, email, email_confirmed_at) values ('11111111-1111-4111-8111-111111111111', 'prof@example.org', now()), ('22222222-2222-4222-8222-222222222222', 'outro@example.org', now());
insert into auth.identities (user_id, provider) values ('11111111-1111-4111-8111-111111111111', 'google'), ('22222222-2222-4222-8222-222222222222', 'google');
insert into public.eduspruce_autorizados (h, papel) values (encode(extensions.digest('eduspruce:prof@example.org','sha256'),'hex'), 'admin'), (encode(extensions.digest('eduspruce:outro@example.org','sha256'),'hex'), 'prof');
select set_config('request.headers', '{"x-es-ver":"9.999","cf-connecting-ip":"10.0.0.1"}', false) \gset x_
\set sala aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
\set prof 'select set_config(''test.uid'',''11111111-1111-4111-8111-111111111111'',false), set_config(''request.jwt.claims'',''{"role":"authenticated","email":"prof@example.org"}'',false)'
\set outro 'select set_config(''test.uid'',''22222222-2222-4222-8222-222222222222'',false), set_config(''request.jwt.claims'',''{"role":"authenticated","email":"outro@example.org"}'',false)'
\set aluno 'select set_config(''test.uid'','''',false), set_config(''request.jwt.claims'',''{"role":"anon"}'',false)'

-- 1) o professor cria a sala; as respostas certas ficam à parte, fora do que os alunos recebem
:prof \gset x_
set role authenticated;
select pg_temp.certo(public.arena_criar(:'sala','vivo','classico','{"tempo":20}'::jsonb,'[{"p":"1+1?","o":["1","2","3","4"]},{"p":"2+2?","o":["3","4","5","6"]}]'::jsonb,'[1,1]'::jsonb), 'criar a sala');
select pg_temp.certo((public.arena_prof(:'sala')->'sala'->>'estado') = 'espera', 'sala em espera');

-- 2) os alunos entram sem conta; não conseguem ler as tabelas diretamente
reset role; :aluno \gset x_
set role anon;
select pg_temp.certo((public.arena_info(:'sala')->>'estado') = 'espera', 'o aluno vê a sala');
select pg_temp.certo(public.arena_info(:'sala')::text not like '%certa":%1%' and (public.arena_info(:'sala')->>'certa') is null, 'a resposta certa não vai para os alunos antes de revelada');
select public.arena_entrar(:'sala','Lince','tok-aluno-1-xxxxxxxxxxxxxxxx')->>'j' as j1 \gset
select public.arena_entrar(:'sala','Raposa','tok-aluno-2-xxxxxxxxxxxxxxxx')->>'j' as j2 \gset
select pg_temp.certo(:'j1' <> :'j2', 'dois jogadores diferentes');
do $$ begin perform 1 from public.eduspruce_arena_jogador; raise exception 'ERRO do teste: um aluno leu a tabela dos jogadores'; exception when insufficient_privilege then null; end $$;
do $$ begin perform 1 from public.eduspruce_arena_chave; raise exception 'ERRO do teste: um aluno leu as respostas certas'; exception when insufficient_privilege then null; end $$;
-- um aluno não manda no jogo
do $$ begin perform public.arena_controlo('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','iniciar'); raise exception 'ERRO do teste: um aluno iniciou o jogo'; exception when others then if sqlerrm like 'ERRO do teste%' then raise; end if; end $$;

-- 3) outro professor também não manda nesta sala
reset role; :outro \gset x_
set role authenticated;
do $$ begin perform public.arena_controlo('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','terminar'); raise exception 'ERRO do teste: outro professor terminou o jogo'; exception when others then if sqlerrm like 'ERRO do teste%' then raise; end if; end $$;

-- 4) o professor inicia; os alunos respondem à 1.ª pergunta
reset role; :prof \gset x_
set role authenticated;
select pg_temp.certo((public.arena_controlo(:'sala','iniciar')->'sala'->>'estado') = 'jogo', 'jogo iniciado');
reset role; :aluno \gset x_
set role anon;
select public.arena_responder2(:'sala',:'j1','tok-aluno-1-xxxxxxxxxxxxxxxx',0,1) as r1 \gset
select public.arena_responder2(:'sala',:'j2','tok-aluno-2-xxxxxxxxxxxxxxxx',0,3) as r2 \gset
select public.arena_responder2(:'sala',:'j1','tok-aluno-1-xxxxxxxxxxxxxxxx',0,2) as r1b \gset
select public.arena_responder2(:'sala',:'j2','token-de-outra-pessoa-xxxxxxx',0,1) as rmau \gset
select pg_temp.certo((:'r1'::jsonb->>'seq')::int = 1 and (:'r1'::jsonb->>'certa') is null, 'resposta certa conta e não é revelada ao aluno');
select pg_temp.certo((:'r2'::jsonb->>'seq')::int = 0, 'resposta errada não conta');
select pg_temp.certo((:'r1b'::jsonb->>'erro') is not null, 'não se responde duas vezes à mesma pergunta');
select pg_temp.certo((:'rmau'::jsonb->>'erro') = 'jogador', 'com o token de outra pessoa não se responde');

-- 5) o professor revela, passa à 2.ª pergunta e termina
reset role; :prof \gset x_
set role authenticated;
select public.arena_controlo(:'sala','revelar') as c1 \gset
select public.arena_controlo(:'sala','perg','{"i":1}'::jsonb) as c2 \gset
reset role; :aluno \gset x_
set role anon;
select public.arena_responder2(:'sala',:'j2','tok-aluno-2-xxxxxxxxxxxxxxxx',1,1) as r3 \gset
select public.arena_estado(:'sala',:'j1','tok-aluno-1-xxxxxxxxxxxxxxxx') as e1 \gset
reset role; :prof \gset x_
set role authenticated;
select public.arena_controlo(:'sala','terminar') as c3 \gset
select public.arena_resultados(:'sala') as res \gset
select pg_temp.certo((:'c1'::jsonb->'sala'->>'revelada') = 'true' and (:'c1'::jsonb->'sala'->>'certa') = '1', 'o professor revela a resposta certa');
select pg_temp.certo((:'r3'::jsonb->>'erro') = 'depressa', 'duas respostas seguidas em menos de um instante são travadas');
select pg_temp.certo((:'e1'::jsonb->'eu'->>'pontos')::int = 1000 and (:'e1'::jsonb->'eu'->>'pos')::int = 1 and (:'e1'::jsonb->'eu'->>'certas')::int = 1, 'quem acertou fica em 1.º com 1000 pontos');
select pg_temp.certo((:'e1'::jsonb->'top'->1->>'alcunha') = 'Raposa' and (:'e1'::jsonb->'top'->1->>'pontos')::int = 0, 'quem errou fica em 2.º com 0 pontos');
select pg_temp.certo((:'c3'::jsonb->'sala'->>'estado') = 'fim', 'jogo terminado');
select pg_temp.certo(jsonb_array_length(:'res'::jsonb->'resp') = 2 and (:'res'::jsonb->'resp'->0->>3) = 'true' and (:'res'::jsonb->'resp'->1->>3) = 'false', 'o professor recebe as duas respostas, uma certa e uma errada');

-- 6) depois de terminado já não se responde; e o professor apaga a sala com tudo o que tem
reset role; :aluno \gset x_
set role anon;
select pg_temp.certo((public.arena_responder2(:'sala',:'j1','tok-aluno-1-xxxxxxxxxxxxxxxx',1,1)->>'erro') is not null, 'jogo terminado não aceita respostas');
reset role; :prof \gset x_
set role authenticated;
select public.arena_controlo(:'sala','apagar') \gset x_
reset role;
select pg_temp.certo((select count(*) from public.eduspruce_arena_sala) + (select count(*) from public.eduspruce_arena_jogador) + (select count(*) from public.eduspruce_arena_resp) + (select count(*) from public.eduspruce_arena_chave) = 0, 'apagar a sala apaga jogadores, respostas e chave');
select 'Spruce It (base de dados): criar, entrar, responder, revelar, classificar, terminar e apagar — 22 verificações certas';
