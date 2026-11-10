// Fornecedor de nuvem «Supabase» com a mesma interface dos fornecedores existentes (PROV.google / PROV.onedrive):
//   lista() → {nome: tamanho} · ler(nome) → texto|null · escrever(nome, texto) · apagar(nome)
// O texto chega JÁ ENCRIPTADO pela app (AES-256-GCM no aparelho): a base de dados só guarda dados ilegíveis.
const SB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
export async function criarProvSupabase({url,anonKey,tabela='eduspruce_partes'}){
  const {createClient}=await import(SB);const sb=createClient(url,anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const uid=async()=>{const {data}=await sb.auth.getUser();if(!data||!data.user)throw new Error('Sessão Supabase em falta — entre primeiro.');return data.user.id};
  return {n:'Supabase',cliente:sb,
    async entrarGoogle(){const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error)throw error},
    async sair(){await sb.auth.signOut()},
    async lista(){await uid();const {data,error}=await sb.from(tabela).select('nome,tamanho');if(error)throw error;const o={};(data||[]).forEach(r=>o[r.nome]=r.tamanho);return o},
    async ler(nome){await uid();const {data,error}=await sb.from(tabela).select('conteudo').eq('nome',nome).maybeSingle();if(error)throw error;return data?data.conteudo:null},
    async escrever(nome,texto){const u=await uid();const {error}=await sb.from(tabela).upsert({user_id:u,nome,conteudo:texto,tamanho:texto.length,atualizado:new Date().toISOString()},{onConflict:'user_id,nome'});if(error)throw error},
    async apagar(nome){await uid();const {error}=await sb.from(tabela).delete().eq('nome',nome);if(error)throw error}}}
