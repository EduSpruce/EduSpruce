-- Spruce It! completo (0021): tipos novos, pontos, ideias, perguntas do público, reações e estudo.
create function pg_temp.certo(c boolean, m text) returns text language plpgsql as $$ begin if c is not true then raise exception 'ERRO do teste: %', m; end if; return 'ok'; end $$;
insert into auth.users (id, email, email_confirmed_at) values ('11111111-1111-4111-8111-111111111111', 'prof@example.org', now());
insert into auth.identities (user_id, provider) values ('11111111-1111-4111-8111-111111111111', 'google');
insert into public.eduspruce_autorizados (h, papel) values (encode(extensions.digest('eduspruce:prof@example.org','sha256'),'hex'), 'admin');
select set_config('request.headers', '{"x-es-ver":"9.999","cf-connecting-ip":"10.0.0.1"}', false) \gset x_
\set sala bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
\set est cccccccccccccccccccccccccccccccccccccccc
\set prof 'select set_config(''test.uid'',''11111111-1111-4111-8111-111111111111'',false), set_config(''request.jwt.claims'',''{"role":"authenticated","email":"prof@example.org"}'',false)'
\set aluno 'select set_config(''test.uid'','''',false), set_config(''request.jwt.claims'',''{"role":"anon"}'',false)'
\set t1 'tok-aluno-1-xxxxxxxxxxxxxxxx'
\set t2 'tok-aluno-2-xxxxxxxxxxxxxxxx'

-- 0: várias certas (×2 pontos) · 1: resposta escrita · 2: deslizante · 3: ordenar · 4: pino · 5: nuvem · 6: ideias · 7: sondagem
:prof \gset x_
set role authenticated;
select pg_temp.certo(public.arena_criar3(:'sala','vivo','classico','{"tempo":20,"qa":"moderada","reacoes":true,"maxjog":2}'::jsonb,
  '[{"t":"pares","tp":"multi","o":["2","3","4","5"],"pm":2},{"t":"capital","tp":"rc"},{"t":"7×6","tp":"slider","min":0,"max":100},{"t":"ordena","tp":"ordem","o":["c","a","b"]},
    {"t":"onde","tp":"pino","img":"data:,"},{"t":"palavra","tp":"nuvem"},{"t":"ideias","tp":"ideias"},{"t":"gostas","tp":"sond","o":["sim","não"]}]'::jsonb,
  '[0,0,0,0,0,0,0,0]'::jsonb,
  '[{"c":[0,2]},{"a":["Lisboa"]},{"v":42,"tol":2},{"ord":[1,2,0]},{"x":0.5,"y":0.5,"r":0.1},null,null,null]'::jsonb), 'criar com tipos novos');
reset role; :aluno \gset x_
set role anon;
select public.arena_entrar(:'sala','Lince',:'t1')->>'j' as j1 \gset
select public.arena_entrar(:'sala','Raposa',:'t2')->>'j' as j2 \gset
select pg_temp.certo((public.arena_entrar(:'sala','Texugo','tok-aluno-3-xxxxxxxxxxxxxxxx')->>'erro') = 'cheia', 'o limite de jogadores escolhido pelo professor conta');
select pg_temp.certo(public.arena_info(:'sala')::text not like '%Lisboa%', 'as soluções novas não vão para os alunos');
reset role; :prof \gset x_
set role authenticated;
select public.arena_controlo(:'sala','iniciar') as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',0,'[2,0]'::jsonb) as r \gset
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j2',:'t2',0,'[0]'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa and pts >= 1000 from public.eduspruce_arena_resp where perg = 0 and jogador = :'j1'), 'várias certas: certo e a dobrar');
set role authenticated;
reset role;
select pg_temp.certo((select not certa from public.eduspruce_arena_resp where perg = 0 and jogador = :'j2'), 'várias certas: incompleto = errado');
set role authenticated;
select pg_temp.certo(jsonb_array_length(public.arena_atual3(:'sala')) = 2, 'o professor vê as respostas da pergunta atual');
select public.arena_controlo(:'sala','perg','{"i":1}'::jsonb) as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',1,'"  lisbóa "'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa from public.eduspruce_arena_resp where perg = 1 and jogador = :'j1'), 'resposta escrita sem acentos nem espaços');
set role authenticated;
select public.arena_controlo(:'sala','perg','{"i":2}'::jsonb) as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',2,'43'::jsonb) as r \gset
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j2',:'t2',2,'50'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa from public.eduspruce_arena_resp where perg = 2 and jogador = :'j1') and (select not certa from public.eduspruce_arena_resp where perg = 2 and jogador = :'j2'), 'deslizante com margem');
set role authenticated;
select public.arena_controlo(:'sala','perg','{"i":3}'::jsonb) as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',3,'[1,2,0]'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa from public.eduspruce_arena_resp where perg = 3 and jogador = :'j1'), 'ordenar');
set role authenticated;
select public.arena_controlo(:'sala','perg','{"i":4}'::jsonb) as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',4,'{"x":0.55,"y":0.48}'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa from public.eduspruce_arena_resp where perg = 4 and jogador = :'j1'), 'pino dentro da zona');
set role authenticated;
select public.arena_controlo(:'sala','perg','{"i":5}'::jsonb) as c \gset
reset role;
select (select erradas from public.eduspruce_arena_jogador where id = :'j1') as err0 \gset
set role authenticated;
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',5,'"azul"'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
reset role;
select pg_temp.certo((select certa is null and pts = 0 from public.eduspruce_arena_resp where perg = 5 and jogador = :'j1') and (select erradas from public.eduspruce_arena_jogador where id = :'j1') = :err0, 'nuvem: sem certa, não conta como errada');
set role authenticated;
select public.arena_controlo(:'sala','perg','{"i":6}'::jsonb) as c \gset
reset role; :aluno \gset x_
set role anon;
select pg_sleep(0.32);
select public.arena_responder3(:'sala',:'j1',:'t1',6,'["ideia A","ideia B"]'::jsonb) as r \gset
reset role; :prof \gset x_
set role authenticated;
select public.arena_fase(:'sala','votar') as c \gset
reset role; :aluno \gset x_
set role anon;
select (public.arena_ideias(:'sala',:'j2',:'t2')->'i'->0->>'id') as rid \gset
select pg_temp.certo((public.arena_ideia_votar(:'sala',:'j2',:'t2',:rid,1)->>'ok') = 'true', 'votar numa ideia de outro');
select pg_temp.certo((public.arena_ideia_votar(:'sala',:'j1',:'t1',:rid,0)->>'erro') = 'pedido', 'não se vota nas próprias ideias');
-- perguntas do público (moderadas) e reações
select pg_temp.certo((public.arena_qa_enviar(:'sala',:'j2',:'t2','Podemos repetir?')->>'moderada') = 'true', 'enviar pergunta moderada');
select pg_temp.certo(jsonb_array_length(public.arena_qa_lista(:'sala',:'j1',:'t1')->'q') = 0, 'pergunta por aprovar não aparece aos outros');
select pg_temp.certo((public.arena_reagir(:'sala',:'j1',:'t1',2)->>'ok') = 'true', 'reagir');
do $$ begin perform 1 from public.eduspruce_arena_qa; raise exception 'ERRO do teste: um aluno leu a tabela das perguntas'; exception when insufficient_privilege then null; end $$;
reset role; :prof \gset x_
set role authenticated;
select (public.arena_qa_prof(:'sala')->0->>'id') as qid \gset
select public.arena_qa_moderar(:'sala',:qid,'visivel') as m \gset
select pg_temp.certo(jsonb_array_length((public.arena_reacoes(:'sala', now() - interval '10 seconds'))->'r') = 1, 'o professor vê as reações');
select pg_temp.certo((public.arena_atual3(:'sala')->0->'v'->>'1')::int = 1, 'o professor vê os votos nas ideias');
reset role; :aluno \gset x_
set role anon;
select pg_temp.certo(jsonb_array_length(public.arena_qa_lista(:'sala',:'j1',:'t1')->'q') = 1, 'pergunta aprovada aparece');
select pg_temp.certo((public.arena_qa_votar(:'sala',:'j1',:'t1',:qid)->>'ok') = 'true', 'votar numa pergunta');

-- estudo: só nas salas de estudo o aluno recebe o conjunto com as soluções
reset role; :prof \gset x_
set role authenticated;
select pg_temp.certo(public.arena_criar3(:'est','tpc','estudo','{"estudo":true}'::jsonb,'[{"t":"a","o":["1","2"]},{"t":"b","tp":"rc"}]'::jsonb,'[1,0]'::jsonb,'[null,{"a":["x"]}]'::jsonb, now() + interval '2 days'), 'criar estudo');
reset role; :aluno \gset x_
set role anon;
select public.arena_entrar(:'est','Lince',:'t1')->>'j' as e1 \gset
select pg_temp.certo((public.arena_estudo(:'est',:'e1',:'t1')->'certas'->>0)::int = 1, 'estudo traz as soluções');
select pg_temp.certo((public.arena_estudo(:'sala',:'j1',:'t1')->>'erro') = 'pedido', 'um jogo normal não entrega as soluções');
select pg_temp.certo((public.arena_estudo_registo(:'est',:'e1',:'t1','teste',2,2,2)->>'pontos')::int = 1000, 'registo do estudo');
select 'spruceit3: 26 verificações ok';
