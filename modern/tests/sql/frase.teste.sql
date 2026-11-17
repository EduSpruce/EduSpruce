-- Frase secreta: o professor apaga do histórico só as versões antigas da SUA linha «conta-chave».
create function pg_temp.certo(c boolean, m text) returns text language plpgsql as $$ begin if c is not true then raise exception 'ERRO do teste: %', m; end if; return 'ok'; end $$;
insert into auth.users (id, email, email_confirmed_at) values ('11111111-1111-4111-8111-111111111111', 'prof@example.org', now()), ('22222222-2222-4222-8222-222222222222', 'outro@example.org', now());
insert into public.eduspruce_partes_hist (user_id, nome, conteudo, motivo) values
  ('11111111-1111-4111-8111-111111111111','conta-chave','{"k":"antiga"}','teste'), ('11111111-1111-4111-8111-111111111111','ef-nucleo.bin','x','teste'),
  ('22222222-2222-4222-8222-222222222222','conta-chave','{"k":"de outro"}','teste');
select set_config('test.uid','',false) \gset x_
set role anon;
do $$ begin perform public.eduspruce_chave_hist_limpar(); raise exception 'ERRO do teste: sem conta conseguiu chamar a função'; exception when others then if sqlerrm like 'ERRO do teste%' then raise; end if; end $$;
reset role; select set_config('test.uid','11111111-1111-4111-8111-111111111111',false) \gset x_
set role authenticated;
select pg_temp.certo(public.eduspruce_chave_hist_limpar() = 1, 'apaga 1 versão antiga da chave');
reset role;
select pg_temp.certo((select count(*) from public.eduspruce_partes_hist where nome='conta-chave' and user_id='11111111-1111-4111-8111-111111111111') = 0, 'a chave antiga saiu do histórico');
select pg_temp.certo((select count(*) from public.eduspruce_partes_hist) = 2, 'o resto do histórico e o dos outros professores ficam como estavam');
select 'Frase secreta (base de dados): limpeza do histórico da chave — 4 verificações certas';
