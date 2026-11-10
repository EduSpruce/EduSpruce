// EduSpruce · camada moderna (ES Modules). Só atua se existir supabase-config.json com "ativo": true.
// Sem configuração não faz nada: a app comporta-se exatamente como a baseline.
// O fornecedor fica em window.EduSpruceModerno.supabase; ligá-lo à lista interna de fornecedores (PROV) é o passo seguinte,
// que mexe no código da app e por isso só se faz com aprovação (ver docs/PLANO.md, etapa 5).
const cfg=await fetch('supabase-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
window.EduSpruceModerno={ativo:false};
if(cfg&&cfg.ativo&&cfg.url&&cfg.anonKey){const {criarProvSupabase}=await import('./supabase-prov.mjs');
  try{window.EduSpruceModerno={ativo:true,supabase:await criarProvSupabase(cfg)};console.info('[EduSpruce] fornecedor Supabase disponível')}catch(e){console.warn('[EduSpruce] Supabase indisponível:',e.message)}}
