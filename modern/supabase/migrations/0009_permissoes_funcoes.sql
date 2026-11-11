-- =====================================================================================
-- EduSpruce · PERMISSÕES DAS FUNÇÕES DE VERIFICAÇÃO (correr uma vez; pode correr-se mais do que uma vez)
-- Corrige «permission denied for function eduspruce_autorizado».
-- Estas funções só respondem sobre a própria pessoa que pergunta (sim/não), por isso podem ser
-- executadas por qualquer pedido: sem sessão respondem sempre «não».
-- =====================================================================================
alter function public.eduspruce_autorizado() owner to postgres;
alter function public.eduspruce_admin() owner to postgres;
alter function public.eduspruce_email_atual() owner to postgres;
alter function public.eduspruce_versao_ok() owner to postgres;
grant usage on schema public to anon, authenticated;
grant execute on function public.eduspruce_autorizado()  to public, anon, authenticated;
grant execute on function public.eduspruce_admin()       to public, anon, authenticated;
grant execute on function public.eduspruce_email_atual() to public, anon, authenticated;
grant execute on function public.eduspruce_versao_ok()   to public, anon, authenticated;
notify pgrst, 'reload schema';

-- Verificação: as quatro linhas devem dizer «true»
select p.proname as funcao, pg_get_userbyid(p.proowner) as dono,
       has_function_privilege('authenticated', p.oid, 'execute') as pode_executar
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('eduspruce_autorizado','eduspruce_admin','eduspruce_email_atual','eduspruce_versao_ok');
