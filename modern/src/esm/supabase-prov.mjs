// Fornecedor «Base de dados EduSpruce» (Supabase) com a mesma interface dos fornecedores existentes (PROV.google / PROV.onedrive):
//   lista() → {nome: tamanho} · ler(nome) → texto|null · escrever(nome, texto) · apagar(nome)
// O texto chega JÁ ENCRIPTADO pela app (AES-256-GCM no aparelho): a base de dados só guarda dados ilegíveis.
const SB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm';
const msg=e=>{const c=e&&e.code,m=(e&&e.message)||String(e);
  if(c==='42501'||/row-level security|permission denied/i.test(m))return new Error('Esta conta Google não está autorizada na base de dados EduSpruce. Peça ao administrador para a autorizar.');
  if(c==='PGRST205'||/does not exist|schema cache/i.test(m))return new Error('A base de dados ainda não foi preparada (falta correr o script SQL).');
  if(/Failed to fetch|NetworkError|Load failed/i.test(m))return new Error('Sem ligação à base de dados. Verifique a internet ou se a rede da escola a bloqueia.');
  return new Error('Base de dados: '+m)};
export async function criarProvSupabase({url,anonKey,tabela='eduspruce_partes'}){
  const {createClient}=await import(SB);
  const sb=createClient(url,anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'eduspruce.sb'}});
  const uid=async()=>{const {data}=await sb.auth.getSession();if(!data||!data.session)throw new Error('Entre na base de dados com a sua conta Google (Definições › Sincronização).');return data.session.user.id};
  const ok=r=>{if(r.error)throw msg(r.error);return r.data};
  return {n:'Base de dados EduSpruce',cliente:sb,
    async entrarGoogle(email){const qp=email?{login_hint:email}:{prompt:'select_account'};const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:qp}});if(error)throw msg(error)},
    async autorizado(){try{const r=await sb.rpc('eduspruce_autorizado');return r.data===true}catch(_){return false}},
    tempoReal(uid,cb){try{const c=sb.channel('es-'+uid).on('postgres_changes',{event:'*',schema:'public',table:'eduspruce_sinal',filter:'user_id=eq.'+uid},()=>cb()).subscribe();return c}catch(e){console.warn('[EduSpruce] tempo real indisponível',e);return null}},
    async sair(){await sb.auth.signOut()},
    async lista(){await uid();const o={};let de=0;for(;;){const d=ok(await sb.from(tabela).select('nome,tamanho').order('nome').range(de,de+999));d.forEach(r=>o[r.nome]=r.tamanho);if(d.length<1000)break;de+=1000}return o},
    async ler(nome){await uid();const d=ok(await sb.from(tabela).select('conteudo').eq('nome',nome).maybeSingle());return d?d.conteudo:null},
    async escrever(nome,texto){const u=await uid();ok(await sb.from(tabela).upsert({user_id:u,nome,conteudo:texto,tamanho:texto.length,atualizado:new Date().toISOString()},{onConflict:'user_id,nome'}))},
    async apagar(nome){await uid();ok(await sb.from(tabela).delete().eq('nome',nome))}}}
