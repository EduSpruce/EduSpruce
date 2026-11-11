-- =====================================================================================
-- EduSpruce · PROTEÇÃO DOS DADOS (correr uma vez; pode correr-se mais do que uma vez)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run».
--
-- 1) Histórico no servidor: antes de qualquer parte dos dados ser substituída ou apagada, a versão anterior
--    fica guardada (cifrada, tal como está) durante 30 dias. Funciona seja qual for o aparelho ou a versão da app.
--      · substituições: no máximo uma cópia por parte de 20 em 20 minutos
--      · se a nova versão for muito mais pequena (perdeu conteúdo) ou se a parte for apagada: guarda SEMPRE
-- 2) Versão mínima da app: só a app 0.940 ou mais recente pode gravar. Uma cópia antiga da app que ainda esteja
--    guardada num aparelho (iPad, telemóvel…) pode ler, mas não consegue escrever por cima dos dados.
-- =====================================================================================

-- 1) Histórico
create table if not exists public.eduspruce_partes_hist (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  nome       text        not null,
  conteudo   text        not null,
  tamanho    integer,
  atualizado timestamptz,
  guardado   timestamptz not null default now(),
  motivo     text        not null
);
create index if not exists eduspruce_partes_hist_u on public.eduspruce_partes_hist (user_id, nome, guardado desc);
alter table public.eduspruce_partes_hist enable row level security;
alter table public.eduspruce_partes_hist force row level security;
drop policy if exists "hist: ler o meu" on public.eduspruce_partes_hist;
create policy "hist: ler o meu" on public.eduspruce_partes_hist for select to authenticated using (auth.uid() = user_id and public.eduspruce_autorizado());
revoke all on public.eduspruce_partes_hist from anon, authenticated;
grant select on public.eduspruce_partes_hist to authenticated;

create or replace function public.eduspruce_partes_guardar_hist() returns trigger
language plpgsql security definer set search_path = public as $$
declare encolheu boolean := false;
begin
  if old.nome like 'ef-f-%' then return coalesce(new, old); end if;   -- fotografias (imutáveis) e cópias da app
  if tg_op = 'UPDATE' then
    if new.conteudo is not distinct from old.conteudo then return new; end if;
    encolheu := char_length(old.conteudo) > 2000 and char_length(new.conteudo) < char_length(old.conteudo) * 0.6;
    if not encolheu and exists (select 1 from public.eduspruce_partes_hist h
        where h.user_id = old.user_id and h.nome = old.nome and h.guardado > now() - interval '20 minutes') then
      return new;
    end if;
  end if;
  insert into public.eduspruce_partes_hist (user_id, nome, conteudo, tamanho, atualizado, motivo)
  values (old.user_id, old.nome, old.conteudo, old.tamanho, old.atualizado,
          case when tg_op = 'DELETE' then 'apagada' when encolheu then 'encolheu' else 'alteração' end);
  delete from public.eduspruce_partes_hist where user_id = old.user_id and guardado < now() - interval '30 days';
  return coalesce(new, old);
end $$;
drop trigger if exists eduspruce_partes_hist_t on public.eduspruce_partes;
create trigger eduspruce_partes_hist_t before update or delete on public.eduspruce_partes
  for each row execute function public.eduspruce_partes_guardar_hist();

-- 2) Versão mínima da app para gravar (a app envia o cabeçalho x-es-ver)
create or replace function public.eduspruce_versao_ok() returns boolean
language sql stable as $$
  select coalesce(nullif(regexp_replace(coalesce(current_setting('request.headers', true)::json->>'x-es-ver', ''), '[^0-9.]', '', 'g'), '')::numeric >= 0.940, false)
$$;
drop policy if exists "partes: criar as minhas"   on public.eduspruce_partes;
drop policy if exists "partes: alterar as minhas" on public.eduspruce_partes;
drop policy if exists "partes: apagar as minhas"  on public.eduspruce_partes;
create policy "partes: criar as minhas"   on public.eduspruce_partes for insert to authenticated
  with check (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok());
create policy "partes: alterar as minhas" on public.eduspruce_partes for update to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok()) with check (auth.uid() = user_id);
create policy "partes: apagar as minhas"  on public.eduspruce_partes for delete to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok());

-- Verificação: deve mostrar «historico = true» e «gatilho = true»
select exists (select 1 from pg_class where relname = 'eduspruce_partes_hist') as historico,
       exists (select 1 from pg_trigger where tgname = 'eduspruce_partes_hist_t') as gatilho;
