-- =====================================================================================
-- EduSpruce · módulos por conta (base para, mais tarde, vender o acesso a módulos)
-- (colar no «SQL Editor» e carregar em «Run»; pode repetir-se)
-- Cada conta autorizada pode ter a lista dos módulos a que tem acesso. Vazio (null) = todos os módulos.
-- Só o administrador muda a lista (políticas do 0003); cada conta só lê a sua, pela função abaixo.
-- =====================================================================================
alter table public.eduspruce_autorizados add column if not exists modulos text[];

create or replace function public.eduspruce_meus_modulos() returns text[]
language sql stable security definer set search_path = public, extensions as $$
  select a.modulos from public.eduspruce_autorizados a
   where a.h = encode(extensions.digest('eduspruce:' || public.eduspruce_email_atual(), 'sha256'), 'hex')
   limit 1;
$$;
revoke all on function public.eduspruce_meus_modulos() from public, anon;
grant execute on function public.eduspruce_meus_modulos() to authenticated;

-- Verificação: contas e módulos (null = todos)
select left(h, 12) || '…' as conta, papel, coalesce(array_to_string(modulos, ', '), 'todos') as modulos from public.eduspruce_autorizados order by criado;
