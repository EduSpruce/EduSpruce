-- =====================================================================================
-- EduSpruce · autoavaliação dos alunos pelo telemóvel (QR code ou link + código)
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run». Pode correr-se mais do que uma vez.
--
-- Como funciona (sem contas para os alunos):
--   · o professor abre uma sessão temporária para uma turma e um período; a app gera um código (ex.: K7QF-M2XA)
--   · o conteúdo da sessão (turma, domínios, lista «n.º · nome curto») vai CIFRADO com uma chave derivada do código;
--     a base de dados nunca vê o código nem a chave — só texto ilegível
--   · o aluno abre eduspruce.pt/aluno.html (QR code ou link), escreve o código, responde; a resposta vai cifrada
--   · o aluno só pode LER a sua ficha de perguntas e ENVIAR a resposta; nunca vê respostas de ninguém
--   · só o professor dono da sessão lê as respostas; a sessão expira sozinha e pode ser fechada a qualquer momento
-- =====================================================================================

-- 1) Sessões (uma por turma/período aberta pelo professor)
create table if not exists public.eduspruce_autoav (
  id      text        primary key check (id ~ '^[0-9a-f]{40}$'),
  user_id uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  dados   text        not null check (char_length(dados) between 10 and 200000),
  aberta  boolean     not null default true,
  expira  timestamptz not null check (expira <= now() + interval '8 days'),
  criado  timestamptz not null default now()
);
alter table public.eduspruce_autoav enable row level security;
alter table public.eduspruce_autoav force row level security;
drop policy if exists "autoav: as minhas" on public.eduspruce_autoav;
create policy "autoav: as minhas" on public.eduspruce_autoav for all to authenticated
  using (auth.uid() = user_id and public.eduspruce_autorizado())
  with check (auth.uid() = user_id and public.eduspruce_autorizado());
revoke all on public.eduspruce_autoav from anon;
grant select, insert, update, delete on public.eduspruce_autoav to authenticated;

-- 2) Respostas dos alunos (cifradas)
create table if not exists public.eduspruce_autoav_resp (
  id       bigint generated always as identity primary key,
  sessao   text        not null references public.eduspruce_autoav(id) on delete cascade,
  conteudo text        not null check (char_length(conteudo) between 10 and 40000),
  criado   timestamptz not null default now()
);
create index if not exists eduspruce_autoav_resp_sessao on public.eduspruce_autoav_resp (sessao);
alter table public.eduspruce_autoav_resp enable row level security;
alter table public.eduspruce_autoav_resp force row level security;
drop policy if exists "autoav resp: ler as minhas"   on public.eduspruce_autoav_resp;
drop policy if exists "autoav resp: apagar as minhas" on public.eduspruce_autoav_resp;
create policy "autoav resp: ler as minhas" on public.eduspruce_autoav_resp for select to authenticated
  using (exists (select 1 from public.eduspruce_autoav s where s.id = sessao and s.user_id = auth.uid()) and public.eduspruce_autorizado());
create policy "autoav resp: apagar as minhas" on public.eduspruce_autoav_resp for delete to authenticated
  using (exists (select 1 from public.eduspruce_autoav s where s.id = sessao and s.user_id = auth.uid()) and public.eduspruce_autorizado());
revoke all on public.eduspruce_autoav_resp from anon;
grant select, delete on public.eduspruce_autoav_resp to authenticated;

-- 3) O que o aluno (sem conta) pode fazer: ler a ficha de perguntas de uma sessão aberta e enviar a resposta
create or replace function public.eduspruce_autoav_ler(p_id text)
returns table (dados text, expira timestamptz)
language sql stable security definer set search_path = public as $$
  select s.dados, s.expira from public.eduspruce_autoav s
  where s.id = p_id and s.aberta and s.expira > now();
$$;
create or replace function public.eduspruce_autoav_enviar(p_id text, p_conteudo text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  if p_id !~ '^[0-9a-f]{40}$' or p_conteudo is null or char_length(p_conteudo) not between 10 and 40000 then return false; end if;
  if not exists (select 1 from public.eduspruce_autoav s where s.id = p_id and s.aberta and s.expira > now()) then return false; end if;
  select count(*) into n from public.eduspruce_autoav_resp r where r.sessao = p_id;
  if n >= 400 then return false; end if;   -- limite por sessão (evita abusos)
  insert into public.eduspruce_autoav_resp (sessao, conteudo) values (p_id, p_conteudo);
  delete from public.eduspruce_autoav where expira < now() - interval '30 days';   -- arrumação das sessões antigas
  return true;
end $$;
revoke all on function public.eduspruce_autoav_ler(text) from public;
revoke all on function public.eduspruce_autoav_enviar(text, text) from public;
grant execute on function public.eduspruce_autoav_ler(text) to anon, authenticated;
grant execute on function public.eduspruce_autoav_enviar(text, text) to anon, authenticated;

-- Verificação: deve mostrar 2 linhas com «rls = true»
select c.relname as tabela, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('eduspruce_autoav','eduspruce_autoav_resp');
