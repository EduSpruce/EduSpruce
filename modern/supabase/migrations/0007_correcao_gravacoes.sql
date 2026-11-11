-- =====================================================================================
-- EduSpruce · CORREÇÃO DAS GRAVAÇÕES (correr uma vez; pode correr-se mais do que uma vez)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run».
--
-- Repõe, de forma limpa, as regras de quem pode criar/alterar/apagar os dados e garante que o
-- histórico automático nunca impede uma gravação. No fim mostra um diagnóstico.
-- =====================================================================================

-- 1) o histórico nunca pode fazer falhar uma gravação
alter table public.eduspruce_partes_hist no force row level security;
create or replace function public.eduspruce_partes_guardar_hist() returns trigger
language plpgsql security definer set search_path = public as $$
declare encolheu boolean := false;
begin
  begin
    if old.nome like 'ef-f-%' then return coalesce(new, old); end if;
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
  exception when others then
    raise warning 'EduSpruce: histórico não guardado (%)', sqlerrm;
  end;
  return coalesce(new, old);
end $$;

-- 2) a versão mínima da app: função acessível a quem tem sessão
create or replace function public.eduspruce_versao_ok() returns boolean
language plpgsql stable security definer set search_path = public as $$
declare v text;
begin
  begin
    v := regexp_replace(coalesce(current_setting('request.headers', true)::json->>'x-es-ver', ''), '[^0-9.]', '', 'g');
    return coalesce(nullif(v, '')::numeric >= 0.940, false);
  exception when others then return false;
  end;
end $$;
grant execute on function public.eduspruce_versao_ok() to authenticated;
grant execute on function public.eduspruce_autorizado() to authenticated;

-- 3) regras da tabela dos dados, repostas de raiz
alter table public.eduspruce_partes enable row level security;
drop policy if exists "partes: ler as minhas"     on public.eduspruce_partes;
drop policy if exists "partes: criar as minhas"   on public.eduspruce_partes;
drop policy if exists "partes: alterar as minhas" on public.eduspruce_partes;
drop policy if exists "partes: apagar as minhas"  on public.eduspruce_partes;
create policy "partes: ler as minhas"     on public.eduspruce_partes for select to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado());
create policy "partes: criar as minhas"   on public.eduspruce_partes for insert to authenticated
  with check (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok());
create policy "partes: alterar as minhas" on public.eduspruce_partes for update to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok() and nome not like 'ef-f-dg-%')
  with check (auth.uid() = user_id);
create policy "partes: apagar as minhas"  on public.eduspruce_partes for delete to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok() and nome not like 'ef-f-dg-%');
grant select, insert, update, delete on public.eduspruce_partes to authenticated;

-- 4) diagnóstico: última gravação de cada parte e quantas versões há no histórico
select p.nome, p.tamanho, to_char(p.atualizado at time zone 'Atlantic/Azores', 'YYYY-MM-DD HH24:MI:SS') as ultima_gravacao,
       (select count(*) from public.eduspruce_partes_hist h where h.user_id = p.user_id and h.nome = p.nome) as versoes_no_historico
from public.eduspruce_partes p
where p.nome not like 'ef-f-%'
order by p.atualizado desc;
