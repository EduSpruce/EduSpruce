// Fornecedor «Base de dados EduSpruce» (Supabase): a conta (entra-se com Google) e os dados de cada professor.
//   sessao() · guardada() · entrarGoogle() · sair() · autorizado() · tempoReal()
//   lista() → {nome: tamanho} · lerDados() → {nome: texto} · ler(nome) → texto|null · escrever(nome, texto) · criar(nome, texto) · apagar(nome)
// O texto dos dados chega já cifrado pela app (AES-256-GCM); a chave fica guardada na conta, na linha «conta-chave».
const CHAVE_SESSAO='eduspruce.sb';
const eRede=e=>{const m=(e&&e.message)||String(e||'');return /Failed to fetch|NetworkError|Load failed|network|fetch failed|timeout|aborted/i.test(m)||(e&&(e.name==='AuthRetryableFetchError'||e.status===0||e.status>=500))};
const msg=e=>{const c=e&&e.code,m=(e&&e.message)||String(e);let x;
  if(c==='42501'||/row-level security|permission denied/i.test(m)){x=new Error('Esta conta Google não está autorizada na EduSpruce. Peça ao administrador para a autorizar.');x.semAcesso=true}
  else if(c==='PGRST205'||/does not exist|schema cache/i.test(m))x=new Error('A base de dados ainda não foi preparada (falta correr o script SQL).');
  else if(eRede(e)){x=new Error('Sem ligação à base de dados. Verifique a internet ou se a rede da escola a bloqueia.');x.rede=true}
  else if(c==='PGRST301'||/JWT|401|invalid.*token|not authenticated/i.test(m)){x=new Error('A sessão terminou. Entre de novo com a sua conta Google.');x.semSessao=true}
  else x=new Error('Base de dados: '+m);
  x.code=c;return x};
const perfil=u=>{const m=(u&&u.user_metadata)||{};return {id:u.id,email:String(u.email||'').toLowerCase(),nome:m.full_name||m.name||'',foto:m.avatar_url||m.picture||''}};
export async function criarProvSupabase({url,anonKey,tabela='eduspruce_partes'}){
  const {createClient}=await import('./supabase-2.117.3.min.js');
  /* versão da app em cada pedido: a base de dados só aceita gravações de versões seguras (cópias antigas guardadas noutros aparelhos não escrevem por cima) */
  let ver='0.940';try{const v=new URL(import.meta.url).searchParams.get('v');if(v&&/^\d+\.\d+/.test(v))ver=v.replace(/[^0-9.]/g,'')}catch(_){}
  const sb=createClient(url,anonKey,{global:{headers:{'x-es-ver':ver}},auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:CHAVE_SESSAO}});
  const uid=async()=>{const {data,error}=await sb.auth.getSession();if(data&&data.session)return data.session.user.id;if(error&&eRede(error))throw msg(error);const e=new Error('A sessão terminou. Entre de novo com a sua conta Google.');e.semSessao=true;throw e};
  const ok=r=>{if(r.error)throw msg(r.error);return r.data};
  return {n:'Base de dados EduSpruce',cliente:sb,
    /* conta com sessão neste aparelho (confirma e renova a sessão); null = sem sessão; lança erro .rede se não houver internet para a renovar */
    async sessao(){const {data,error}=await sb.auth.getSession();if(data&&data.session)return perfil(data.session.user);if(error&&eRede(error))throw msg(error);return null},
    aoMudar(cb){try{sb.auth.onAuthStateChange((ev,ses)=>{setTimeout(()=>{try{cb(ev,ses?perfil(ses.user):null)}catch(_){}},0)})}catch(_){}},
    async entrarGoogle(email){const qp=email?{login_hint:email}:{prompt:'select_account'};const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:qp}});if(error)throw msg(error)},
    async autorizado(){const r=await sb.rpc('eduspruce_autorizado');if(r.error)throw msg(r.error);return r.data===true},
    tempoReal(uid,cb){try{const c=sb.channel('es-'+uid).on('postgres_changes',{event:'*',schema:'public',table:'eduspruce_sinal',filter:'user_id=eq.'+uid},()=>cb()).subscribe();return c}catch(e){console.warn('[EduSpruce] tempo real indisponível',e);return null}},
    async sair(){try{await sb.auth.signOut({scope:'local'})}catch(_){}},
    async lista(){await uid();const o={};let de=0;for(;;){const d=ok(await sb.from(tabela).select('nome,tamanho').order('nome').range(de,de+999));d.forEach(r=>o[r.nome]=r.tamanho);if(d.length<1000)break;de+=1000}return o},
    /* tudo o que é preciso para abrir, num só pedido: todas as linhas da conta menos as fotografias e anexos (ef-f-…), que chegam depois */
    async lerDados(){await uid();const o={};let de=0;for(;;){const d=ok(await sb.from(tabela).select('nome,conteudo').not('nome','like','ef-f-%').order('nome').range(de,de+199));d.forEach(r=>o[r.nome]=r.conteudo);if(d.length<200)break;de+=200}return o},
    async ler(nome){await uid();const d=ok(await sb.from(tabela).select('conteudo').eq('nome',nome).maybeSingle());return d?d.conteudo:null},
    async escrever(nome,texto){const u=await uid();ok(await sb.from(tabela).upsert({user_id:u,nome,conteudo:texto,tamanho:texto.length,atualizado:new Date().toISOString()},{onConflict:'user_id,nome'}))},
    /* cria só se ainda não existir (nunca escreve por cima): devolve true se criou */
    async criar(nome,texto){const u=await uid();const r=await sb.from(tabela).insert({user_id:u,nome,conteudo:texto,tamanho:texto.length,atualizado:new Date().toISOString()});if(r.error){if(r.error.code==='23505'||/duplicate key/i.test(r.error.message||''))return false;throw msg(r.error)}return true},
    async apagar(nome){await uid();ok(await sb.from(tabela).delete().eq('nome',nome))}}}
