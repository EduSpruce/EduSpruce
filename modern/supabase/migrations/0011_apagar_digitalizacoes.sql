-- =====================================================================================
-- EduSpruce · APAGAR DIGITALIZAÇÕES POR ENGANO (opcional; correr uma vez)
-- A app (0.969+) já deixa apagar uma digitalização em caso de erro: a referência sai dos dados e fica registado
-- na auditoria. Sem este script as páginas cifradas ficam na base de dados a ocupar espaço (ninguém as consegue abrir).
-- Com este script, as páginas são mesmo apagadas. Continuam a NÃO poder ser alteradas.
-- =====================================================================================
drop policy if exists "partes: apagar as minhas" on public.eduspruce_partes;
create policy "partes: apagar as minhas" on public.eduspruce_partes for delete to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado() and public.eduspruce_versao_ok());
select 'pronto' as estado;
