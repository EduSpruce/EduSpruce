-- EduSpruce · DIAGNÓSTICO DA SESSÃO (só leitura; pode correr-se mais do que uma vez)
-- Mostra o que a base de dados vê num pedido da app: papel, conta, e-mail. Não devolve dados de ninguém além da própria sessão.
create or replace function public.eduspruce_quem() returns json
language sql stable security definer set search_path = public, auth, extensions as $$
  select json_build_object(
    'papel_bd', current_setting('request.jwt.claims', true)::json->>'role',
    'uid', left(coalesce(auth.uid()::text,'(nenhum)'),8),
    'email_jwt', coalesce(auth.jwt()->>'email','(nenhum)'),
    'email_usado', public.eduspruce_email_atual(),
    'autorizado', public.eduspruce_autorizado(),
    'listas', (select count(*) from public.eduspruce_autorizados));
$$;
grant execute on function public.eduspruce_quem() to public, anon, authenticated;
notify pgrst, 'reload schema';
select 'pronto' as estado;
