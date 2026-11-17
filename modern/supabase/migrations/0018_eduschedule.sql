-- =====================================================================================
-- EduSpruce · EduSchedule (antigo EduTime): horários partilhados com colegas e publicação pública
-- Colar TUDO no «SQL Editor» do Supabase e carregar em «Run» (pode correr-se mais do que uma vez).
-- Sem este script, o EduSchedule funciona na mesma para um só professor (os dados vão com a conta);
-- este script é preciso para «Partilhar este horário» e para «Publicar horários e calendários».
-- Faz o que o servidor do EduTime fazia: estado partilhado com versão (quem guarda por cima de uma versão
-- mais recente recebe um conflito e a app junta as alterações), papéis admin/editor/leitor por e-mail,
-- e uma área pública (sem conta) com as páginas e os calendários .ics publicados.
-- =====================================================================================
create table if not exists public.eduspruce_eduschedule (
  id       uuid        primary key default gen_random_uuid(),
  dono     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  nome     text        not null default 'Horário' check (char_length(nome) between 1 and 160),
  estado   jsonb       not null default '{}'::jsonb check (octet_length(estado::text) < 40000000),
  anterior jsonb,
  v        integer     not null default 1,
  quem     text,
  quando   timestamptz not null default now(),
  pub      text        unique check (pub is null or pub ~ '^[0-9a-f]{24}$'),
  criado   timestamptz not null default now()
);
create table if not exists public.eduspruce_eduschedule_membros (
  horario uuid not null references public.eduspruce_eduschedule(id) on delete cascade,
  email   text not null check (email = lower(email) and email like '%@%'),
  papel   text not null check (papel in ('admin','editor','leitor')),
  primary key (horario, email)
);
create table if not exists public.eduspruce_eduschedule_pub (
  codigo    text        primary key check (codigo ~ '^[0-9a-f]{24}$'),
  horario   uuid        not null references public.eduspruce_eduschedule(id) on delete cascade,
  ficheiros jsonb       not null check (octet_length(ficheiros::text) < 60000000),
  quando    timestamptz not null default now()
);
do $$ declare t text; begin
  foreach t in array array['eduspruce_eduschedule','eduspruce_eduschedule_membros','eduspruce_eduschedule_pub'] loop
    execute 'alter table public.' || t || ' enable row level security';
    execute 'alter table public.' || t || ' force row level security';
    execute 'revoke all on public.' || t || ' from anon, authenticated';
  end loop;
end $$;

-- papel desta conta num horário: o dono é sempre administrador
create or replace function public.eduschedule_papel(p_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when h.dono = auth.uid() then 'admin'
    else (select m.papel from public.eduspruce_eduschedule_membros m where m.horario = h.id and m.email = public.eduspruce_email_atual()) end
  from public.eduspruce_eduschedule h where h.id = p_id and auth.uid() is not null and public.eduspruce_autorizado() $$;

-- o horário partilhado desta conta (o próprio primeiro; depois aquele em que foi juntada mais recentemente)
create or replace function public.eduschedule_eu() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', h.id, 'nome', h.nome, 'v', h.v, 'pub', h.pub, 'dono', h.dono = auth.uid(), 'papel', public.eduschedule_papel(h.id))
  from public.eduspruce_eduschedule h
  where auth.uid() is not null and public.eduspruce_autorizado()
    and (h.dono = auth.uid() or exists (select 1 from public.eduspruce_eduschedule_membros m where m.horario = h.id and m.email = public.eduspruce_email_atual()))
  order by (h.dono = auth.uid()) desc, h.quando desc limit 1 $$;

create or replace function public.eduschedule_criar(p_nome text, p_estado jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.eduspruce_eduschedule;
begin
  if auth.uid() is null or not public.eduspruce_autorizado() then raise exception 'sem autorização'; end if;
  select * into r from public.eduspruce_eduschedule where dono = auth.uid() limit 1;
  if found then return jsonb_build_object('id', r.id, 'v', r.v); end if;
  insert into public.eduspruce_eduschedule (dono, nome, estado, quem) values (auth.uid(), left(coalesce(nullif(p_nome,''),'Horário'),160), coalesce(p_estado,'{}'::jsonb), public.eduspruce_email_atual())
    returning * into r;
  return jsonb_build_object('id', r.id, 'v', r.v);
end $$;

create or replace function public.eduschedule_ler(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('v', h.v, 'state', h.estado, 'quem', h.quem, 'quando', h.quando)
  from public.eduspruce_eduschedule h where h.id = p_id and public.eduschedule_papel(p_id) is not null $$;

create or replace function public.eduschedule_versao(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('v', h.v, 'quem', h.quem, 'quando', h.quando)
  from public.eduspruce_eduschedule h where h.id = p_id and public.eduschedule_papel(p_id) is not null $$;

-- gravar só se ninguém gravou entretanto (p_base = versão de onde partiu); senão devolve o conflito
create or replace function public.eduschedule_gravar(p_id uuid, p_base integer, p_estado jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.eduspruce_eduschedule;
begin
  if coalesce(public.eduschedule_papel(p_id),'leitor') not in ('admin','editor') then raise exception 'só consulta'; end if;
  select * into r from public.eduspruce_eduschedule where id = p_id for update;
  if r.v <> p_base then return jsonb_build_object('ok', false, 'conflito', true, 'v', r.v, 'quem', r.quem); end if;
  update public.eduspruce_eduschedule set anterior = estado, estado = p_estado, v = v + 1, quem = public.eduspruce_email_atual(), quando = now()
    where id = p_id returning * into r;
  return jsonb_build_object('ok', true, 'v', r.v);
end $$;

create or replace function public.eduschedule_publicar(p_id uuid, p_ficheiros jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare c text;
begin
  if coalesce(public.eduschedule_papel(p_id),'leitor') not in ('admin','editor') then raise exception 'só consulta'; end if;
  if jsonb_typeof(p_ficheiros) <> 'array' or jsonb_array_length(p_ficheiros) = 0 or jsonb_array_length(p_ficheiros) > 5000 then raise exception 'ficheiros inválidos'; end if;
  select pub into c from public.eduspruce_eduschedule where id = p_id;
  if c is null then c := encode(extensions.gen_random_bytes(12), 'hex'); update public.eduspruce_eduschedule set pub = c where id = p_id; end if;
  insert into public.eduspruce_eduschedule_pub (codigo, horario, ficheiros) values (c, p_id, p_ficheiros)
    on conflict (codigo) do update set ficheiros = excluded.ficheiros, quando = now();
  return jsonb_build_object('codigo', c, 'n', jsonb_array_length(p_ficheiros));
end $$;

create or replace function public.eduschedule_membros(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when public.eduschedule_papel(p_id) = 'admin' then
    (select jsonb_build_array(jsonb_build_object('user', (select lower(u.email) from auth.users u where u.id = h.dono), 'role', 'admin'))
       || coalesce((select jsonb_agg(jsonb_build_object('user', m.email, 'role', m.papel) order by m.email) from public.eduspruce_eduschedule_membros m where m.horario = h.id), '[]'::jsonb)
     from public.eduspruce_eduschedule h where h.id = p_id) end $$;

create or replace function public.eduschedule_membro_guardar(p_id uuid, p_email text, p_papel text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if public.eduschedule_papel(p_id) is distinct from 'admin' then raise exception 'só o administrador'; end if;
  insert into public.eduspruce_eduschedule_membros (horario, email, papel) values (p_id, lower(trim(p_email)), p_papel)
    on conflict (horario, email) do update set papel = excluded.papel;
  return true;
end $$;

create or replace function public.eduschedule_membro_apagar(p_id uuid, p_email text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if public.eduschedule_papel(p_id) is distinct from 'admin' then raise exception 'só o administrador'; end if;
  delete from public.eduspruce_eduschedule_membros where horario = p_id and email = lower(trim(p_email));
  return true;
end $$;

-- sair: um colega deixa o horário; o dono deixa de o partilhar (o horário partilhado e o publicado são apagados)
create or replace function public.eduschedule_sair(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sem sessão'; end if;
  if exists (select 1 from public.eduspruce_eduschedule where id = p_id and dono = auth.uid()) then
    delete from public.eduspruce_eduschedule where id = p_id;
  else
    delete from public.eduspruce_eduschedule_membros where horario = p_id and email = public.eduspruce_email_atual();
  end if;
  return true;
end $$;

-- área pública (sem conta): um ficheiro publicado (página .html ou calendário .ics)
create or replace function public.eduschedule_publico(p_codigo text, p_nome text) returns text
language sql stable security definer set search_path = public as $$
  select f->>'text' from public.eduspruce_eduschedule_pub p, jsonb_array_elements(p.ficheiros) f
  where p.codigo = p_codigo and f->>'name' = coalesce(nullif(p_nome,''),'index.html') limit 1 $$;

do $$ declare f text; begin
  foreach f in array array['eduschedule_papel(uuid)','eduschedule_eu()','eduschedule_criar(text,jsonb)','eduschedule_ler(uuid)','eduschedule_versao(uuid)',
    'eduschedule_gravar(uuid,integer,jsonb)','eduschedule_publicar(uuid,jsonb)','eduschedule_membros(uuid)','eduschedule_membro_guardar(uuid,text,text)',
    'eduschedule_membro_apagar(uuid,text)','eduschedule_sair(uuid)'] loop
    execute 'revoke all on function public.' || f || ' from public, anon'; execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  execute 'revoke all on function public.eduschedule_publico(text,text) from public';
  execute 'grant execute on function public.eduschedule_publico(text,text) to anon, authenticated';
end $$;

-- Verificação: deve aparecer «eduschedule pronto»
select 'eduschedule pronto' as estado where to_regclass('public.eduspruce_eduschedule_pub') is not null;
