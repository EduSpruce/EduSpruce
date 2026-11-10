-- =====================================================================================
-- EduSpruce · sincronização em tempo real (colar no «SQL Editor» e carregar em «Run»; pode repetir-se)
-- Uma linha pequena por professor muda sempre que os seus dados mudam; os outros aparelhos abertos
-- recebem o aviso em menos de 1 segundo e vão buscar só o que mudou. O aviso não leva dados.
-- =====================================================================================
create table if not exists public.eduspruce_sinal (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  versao     bigint      not null default 0,
  atualizado timestamptz not null default now()
);
alter table public.eduspruce_sinal enable row level security;
alter table public.eduspruce_sinal force row level security;
drop policy if exists "sinal: ler o meu" on public.eduspruce_sinal;
create policy "sinal: ler o meu" on public.eduspruce_sinal for select to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado());
revoke all on public.eduspruce_sinal from anon, authenticated;
grant select on public.eduspruce_sinal to authenticated;

create or replace function public.eduspruce_sinalizar() returns trigger
language plpgsql security definer set search_path = public as $$
declare u uuid;
begin
  if tg_op = 'DELETE' then u := old.user_id; else u := new.user_id; end if;
  insert into public.eduspruce_sinal (user_id, versao, atualizado) values (u, 1, now())
  on conflict (user_id) do update set versao = public.eduspruce_sinal.versao + 1, atualizado = now();
  return null;
end $$;
revoke all on function public.eduspruce_sinalizar() from public, anon, authenticated;
drop trigger if exists eduspruce_partes_sinal on public.eduspruce_partes;
create trigger eduspruce_partes_sinal after insert or update or delete on public.eduspruce_partes
  for each row execute function public.eduspruce_sinalizar();

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'eduspruce_sinal') then
    alter publication supabase_realtime add table public.eduspruce_sinal;
  end if;
end $$;

-- Verificação: deve mostrar «tempo_real = true»
select exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'eduspruce_sinal') as tempo_real;
