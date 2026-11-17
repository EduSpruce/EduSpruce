-- Pulso: percurso professor → alunos → resultados nas funções da base de dados (atividade com escolha múltipla e resposta curta).
create function pg_temp.certo(c boolean, m text) returns text language plpgsql as $$ begin if c is not true then raise exception 'ERRO do teste: %', m; end if; return 'ok'; end $$;
insert into auth.users (id, email, email_confirmed_at) values ('11111111-1111-4111-8111-111111111111', 'prof@example.org', now()), ('22222222-2222-4222-8222-222222222222', 'outro@example.org', now());
insert into auth.identities (user_id, provider) values ('11111111-1111-4111-8111-111111111111', 'google'), ('22222222-2222-4222-8222-222222222222', 'google');
insert into public.eduspruce_autorizados (h, papel) values (encode(extensions.digest('eduspruce:prof@example.org','sha256'),'hex'), 'admin'), (encode(extensions.digest('eduspruce:outro@example.org','sha256'),'hex'), 'prof');
select set_config('request.headers', '{"x-es-ver":"9.999","cf-connecting-ip":"10.0.0.2"}', false) \gset x_
\set sala bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
\set prof 'select set_config(''test.uid'',''11111111-1111-4111-8111-111111111111'',false), set_config(''request.jwt.claims'',''{"role":"authenticated","email":"prof@example.org"}'',false)'
\set outro 'select set_config(''test.uid'',''22222222-2222-4222-8222-222222222222'',false), set_config(''request.jwt.claims'',''{"role":"authenticated","email":"outro@example.org"}'',false)'
\set aluno 'select set_config(''test.uid'','''',false), set_config(''request.jwt.claims'',''{"role":"anon"}'',false)'

-- 1) o professor cria a sala e lança uma atividade
:prof \gset x_
set role authenticated;
select pg_temp.certo(public.pulso_sala_guardar(:'sala','Sala de teste','{}'::jsonb), 'criar a sala');
select public.pulso_lancar(:'sala','quiz','imediato','{}'::jsonb,'[{"tp":"em","p":"1+1?","o":["1","2","3"],"pts":2},{"tp":"rc","p":"Capital de Portugal?","pts":1}]'::jsonb,'[{"c":[1]},{"a":["Lisboa"]}]'::jsonb,'[]'::jsonb) as ativ \gset
-- 2) outro professor não lança nada nesta sala
reset role; :outro \gset x_
set role authenticated;
do $$ begin perform public.pulso_lancar('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','quiz','imediato','{}'::jsonb,'[{"tp":"em","p":"x","o":["a","b"]}]'::jsonb,'[{"c":[0]}]'::jsonb,'[]'::jsonb); raise exception 'ERRO do teste: outro professor lançou uma atividade na sala'; exception when others then if sqlerrm like 'ERRO do teste%' then raise; end if; end $$;
-- 3) os alunos entram sem conta e respondem
reset role; :aluno \gset x_
set role anon;
select public.pulso_sala_info(:'sala') as info \gset
select public.pulso_entrar(:'sala',:'ativ','Ana','tok-aluno-1-xxxxxxxxxxxxxxxx') as e1 \gset
select public.pulso_entrar(:'sala',:'ativ','Rui','tok-aluno-2-xxxxxxxxxxxxxxxx') as e2 \gset
select pg_temp.certo((:'info'::jsonb->'ativ'->>'id') = :'ativ', 'o aluno vê a atividade aberta na sala');
select :'e1'::jsonb->>'a' as a1, :'e2'::jsonb->>'a' as a2 \gset
do $$ begin perform 1 from public.eduspruce_pulso_chave; raise exception 'ERRO do teste: um aluno leu as respostas certas'; exception when insufficient_privilege then null; end $$;
do $$ begin perform 1 from public.eduspruce_pulso_resp; raise exception 'ERRO do teste: um aluno leu as respostas dos colegas'; exception when insufficient_privilege then null; end $$;
select public.pulso_estado(:'ativ',:'a1','tok-aluno-1-xxxxxxxxxxxxxxxx') as est \gset
select public.pulso_responder(:'ativ',:'a1','tok-aluno-1-xxxxxxxxxxxxxxxx',0,'[1]'::jsonb) as r1 \gset
select public.pulso_responder(:'ativ',:'a1','tok-aluno-1-xxxxxxxxxxxxxxxx',1,null,' lisboa ') as r2 \gset
select public.pulso_responder(:'ativ',:'a2','tok-aluno-2-xxxxxxxxxxxxxxxx',0,'[2]'::jsonb) as r3 \gset
select public.pulso_responder(:'ativ',:'a2','token-de-outra-pessoa-xxxxxxx',1,null,'Lisboa') as rmau \gset
select public.pulso_submeter(:'ativ',:'a1','tok-aluno-1-xxxxxxxxxxxxxxxx') as s1 \gset
select public.pulso_responder(:'ativ',:'a1','tok-aluno-1-xxxxxxxxxxxxxxxx',0,'[2]'::jsonb) as r1b \gset
select pg_temp.certo((:'est'::jsonb->'sol'->>0) is null and :'est'::text not like '%Lisboa%', 'antes de responder, o aluno não recebe as soluções');
select pg_temp.certo((:'r1'::jsonb->>'certa') = 'true' and (:'r2'::jsonb->>'certa') = 'true', 'escolha certa e resposta curta certa (sem contar maiúsculas nem espaços)');
select pg_temp.certo((:'r3'::jsonb->>'certa') = 'false', 'escolha errada');
select pg_temp.certo((:'rmau'::jsonb->>'erro') = 'aluno', 'com o token de outra pessoa não se responde');
select pg_temp.certo((:'s1'::jsonb->'eu'->>'pontos')::numeric = 3 and (:'s1'::jsonb->'eu'->>'submetido') = 'true', 'ao submeter: 2 + 1 = 3 pontos');
select pg_temp.certo((:'r1b'::jsonb->>'erro') is not null, 'depois de submeter já não se muda a resposta');
-- 4) o professor vê os resultados, termina e apaga a sala
reset role; :prof \gset x_
set role authenticated;
select public.pulso_resultados(:'ativ') as res \gset
select pg_temp.certo(jsonb_array_length(:'res'::jsonb->'resp') = 3 and (select sum((x->>'pts')::numeric) from jsonb_array_elements(:'res'::jsonb->'resp') x) = 3, 'o professor recebe as 3 respostas, com 3 pontos no total');
select public.pulso_controlo(:'ativ','terminar') as fim \gset
reset role; :aluno \gset x_
set role anon;
select pg_temp.certo((public.pulso_responder(:'ativ',:'a2','tok-aluno-2-xxxxxxxxxxxxxxxx',1,null,'Lisboa')->>'erro') is not null, 'atividade terminada não aceita respostas');
reset role; :prof \gset x_
set role authenticated;
select pg_temp.certo(public.pulso_sala_apagar(:'sala'), 'apagar a sala');
reset role;
select pg_temp.certo((select count(*) from public.eduspruce_pulso_sala) + (select count(*) from public.eduspruce_pulso_ativ) + (select count(*) from public.eduspruce_pulso_aluno) + (select count(*) from public.eduspruce_pulso_resp) + (select count(*) from public.eduspruce_pulso_chave) = 0, 'apagar a sala apaga atividades, alunos, respostas e chave');
select 'Pulso (base de dados): criar sala, lançar, entrar, responder, corrigir, submeter, terminar e apagar — 15 verificações certas';
