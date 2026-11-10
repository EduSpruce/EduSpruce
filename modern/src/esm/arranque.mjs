// EduSpruce · camada moderna (ES Modules). Só atua se existir supabase-config.json com "ativo": true.
// Sem configuração não faz nada: a app comporta-se exatamente como a baseline.
window.EduSpruceModerno={ativo:false,pronto:false};
const cfg=await fetch('supabase-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
if(cfg&&cfg.ativo&&cfg.url&&cfg.anonKey){
  try{const {criarProvSupabase}=await import('./supabase-prov.mjs');window.EduSpruceModerno={ativo:true,pronto:true,supabase:await criarProvSupabase(cfg)};console.info('[EduSpruce] base de dados disponível')}
  catch(e){window.EduSpruceModerno={ativo:true,pronto:true,erro:'Não foi possível carregar a base de dados ('+e.message+').'};console.warn('[EduSpruce] base de dados indisponível:',e.message)}}
else window.EduSpruceModerno={ativo:false,pronto:true,erro:'A base de dados não está configurada.'};
