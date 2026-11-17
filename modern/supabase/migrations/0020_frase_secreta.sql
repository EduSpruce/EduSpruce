-- =====================================================================================
-- EduSpruce · 0020 — frase secreta (opcional)
-- Quando um professor liga a frase secreta, a chave dos dados passa a ficar na linha «conta-chave» cifrada com a frase.
-- A versão anterior dessa linha (com a chave legível) ia para o histórico e ficava lá até 30 dias; esta função deixa o
-- próprio professor apagar do histórico as versões antigas da SUA linha «conta-chave», logo que liga a frase.
-- Sem este script a frase secreta funciona na mesma: a cópia antiga sai do histórico sozinha ao fim de 30 dias.
-- Pode correr-se várias vezes.
-- =====================================================================================
create or replace function public.eduspruce_chave_hist_limpar() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0;
begin
  if auth.uid() is null then raise exception 'sem sessão'; end if;
  if to_regclass('public.eduspruce_partes_hist') is not null then
    delete from public.eduspruce_partes_hist where user_id = auth.uid() and nome = 'conta-chave';
    get diagnostics n = row_count;
  end if;
  return n;
end $$;
revoke all on function public.eduspruce_chave_hist_limpar() from public, anon;
grant execute on function public.eduspruce_chave_hist_limpar() to authenticated;
notify pgrst, 'reload schema';
select 'frase secreta: função de limpeza do histórico instalada' as resultado;
