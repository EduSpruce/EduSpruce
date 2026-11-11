-- =====================================================================================
-- EduSpruce · TESTES DIGITALIZADOS SELADOS (correr uma vez; pode correr-se mais do que uma vez)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run».
--
-- As páginas dos testes digitalizados (linhas «ef-f-dg-…») só podem ser CRIADAS e LIDAS.
-- A base de dados recusa alterá-las ou apagá-las, seja qual for o aparelho ou a versão da app.
-- (Só desaparecem se a própria conta for eliminada.)
-- =====================================================================================
drop policy if exists "partes: alterar as minhas" on public.eduspruce_partes;
drop policy if exists "partes: apagar as minhas"  on public.eduspruce_partes;
create policy "partes: alterar as minhas" on public.eduspruce_partes for update to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok() and nome not like 'ef-f-dg-%')
  with check (auth.uid() = user_id and nome not like 'ef-f-dg-%');
create policy "partes: apagar as minhas"  on public.eduspruce_partes for delete to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok() and nome not like 'ef-f-dg-%');

-- Verificação: espaço ocupado pelos testes digitalizados, por conta
select u.email, count(*) as paginas, pg_size_pretty(sum(char_length(p.conteudo))::bigint) as espaco
from public.eduspruce_partes p join auth.users u on u.id = p.user_id
where p.nome like 'ef-f-dg-%' group by u.email;
