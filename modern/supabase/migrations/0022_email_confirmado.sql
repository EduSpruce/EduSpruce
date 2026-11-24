-- EduSpruce · 0022 · só e-mails CONFIRMADOS contam para a autorização
-- Porquê: o registo de contas no Supabase está aberto. Sem isto, alguém podia criar uma conta de e-mail/palavra-passe
-- com o e-mail de um professor (ou do administrador) sem o confirmar e passar em eduspruce_autorizado()/eduspruce_admin().
-- As contas Google vêm sempre confirmadas; as de e-mail/palavra-passe só contam depois de confirmarem o e-mail.
-- Não apaga nem altera dados. Correr no Supabase › SQL Editor.

create or replace function public.eduspruce_email_atual() returns text
language sql stable security definer set search_path = public, auth as $$
  select coalesce((
    select lower(trim(u.email)) from auth.users u
     where u.id = auth.uid()
       and u.email_confirmed_at is not null
       and coalesce(u.is_anonymous, false) = false
       and (u.banned_until is null or u.banned_until < now())
  ), '');
$$;
grant execute on function public.eduspruce_email_atual() to public, anon, authenticated; -- como em 0009 (para anónimos devolve vazio)

notify pgrst, 'reload schema';

-- verificação (deve devolver o seu e-mail e autorizado = true quando corrido com a sua sessão; no SQL Editor devolve vazio/false)
select public.eduspruce_email_atual() as email_usado, public.eduspruce_autorizado() as autorizado;
