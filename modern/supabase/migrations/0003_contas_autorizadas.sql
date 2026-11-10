-- =====================================================================================
-- EduSpruce · a lista «Quem Pode Entrar com Google» da app passa a mandar também na base de dados
-- (colar no «SQL Editor» e carregar em «Run»; pode repetir-se)
-- Só o administrador pode ver e mudar a lista. Guarda-se a impressão digital (SHA-256) de cada e-mail, nunca o e-mail.
-- =====================================================================================
alter table public.eduspruce_autorizados drop constraint if exists eduspruce_autorizados_papel_check;

create or replace function public.eduspruce_admin() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.eduspruce_autorizados a
    where a.papel = 'admin'
      and a.h = encode(extensions.digest('eduspruce:' || lower(trim(coalesce(auth.jwt()->>'email',''))), 'sha256'), 'hex'));
$$;
revoke all on function public.eduspruce_admin() from public, anon;
grant execute on function public.eduspruce_admin() to authenticated;

drop policy if exists "autorizados: admin vê"     on public.eduspruce_autorizados;
drop policy if exists "autorizados: admin junta"  on public.eduspruce_autorizados;
drop policy if exists "autorizados: admin muda"   on public.eduspruce_autorizados;
drop policy if exists "autorizados: admin retira" on public.eduspruce_autorizados;
create policy "autorizados: admin vê"     on public.eduspruce_autorizados for select to authenticated using (public.eduspruce_admin());
create policy "autorizados: admin junta"  on public.eduspruce_autorizados for insert to authenticated with check (public.eduspruce_admin());
create policy "autorizados: admin muda"   on public.eduspruce_autorizados for update to authenticated using (public.eduspruce_admin()) with check (public.eduspruce_admin());
create policy "autorizados: admin retira" on public.eduspruce_autorizados for delete to authenticated using (public.eduspruce_admin()
  and h <> encode(extensions.digest('eduspruce:' || lower(trim(coalesce(auth.jwt()->>'email',''))), 'sha256'), 'hex'));  -- nunca se retira a si próprio
grant select, insert, update, delete on public.eduspruce_autorizados to authenticated;

-- Verificação: mostra a lista (impressões digitais e perfis)
select left(h, 12) || '…' as conta, papel, criado from public.eduspruce_autorizados order by criado;
