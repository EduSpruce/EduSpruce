
/* ===================== EduSpruce moderna · fornecedor «Base de dados EduSpruce» (Supabase, UE) =====================
   Os dados continuam a ser encriptados no aparelho (AES-256-GCM) antes de sair; a base de dados só guarda texto ilegível.
   O fornecedor vem da camada ES Modules (esm/supabase-prov.mjs), exposto em window.EduSpruceModerno.supabase. */
NV_LOGO.supabase='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M13.2 2.6c.5-.6 1.5-.2 1.5.6v7.3h6.1c.9 0 1.4 1 .8 1.7l-9.1 10.5c-.5.6-1.5.2-1.5-.6v-7.3H4.9c-.9 0-1.4-1-.8-1.7z" fill="#3ecf8e"/></svg>';
const sbObter=async()=>{for(let i=0;i<120;i++){const m=window.EduSpruceModerno;if(m&&m.supabase)return m.supabase;if(m&&m.pronto&&!m.supabase)throw new Error(m.erro||'A base de dados não está configurada.');await new Promise(r=>setTimeout(r,100))}throw new Error('A base de dados não respondeu. Verifique a ligação à internet.')};
PROV.supabase={n:'Base de dados EduSpruce',async lista(){return (await sbObter()).lista()},async ler(n){return (await sbObter()).ler(n)},async escrever(n,t){return (await sbObter()).escrever(n,t)},async apagar(n){return (await sbObter()).apagar(n)}};
async function sbLigar(silencioso){const p=await sbObter();const {data}=await p.cliente.auth.getSession();
  if(data&&data.session){nvSet({sb:1,conta:data.session.user.email||'',renovar:false});return}
  if(silencioso===true||silencioso==='silencioso'){nvSet({sb:0,renovar:true});return}
  nvSet({prov:'supabase',sb:0});await p.entrarGoogle();await sbVerificar()}
async function sbVerificar(){try{const p=await sbObter();const {data}=await p.cliente.auth.getSession();const L=nvL();
  if(data&&data.session){const em=data.session.user.email||'';if(!L.sb||L.conta!==em)nvSet({sb:1,conta:em,renovar:false});
    if(nvL().prov==='supabase'&&nvL().k)setTimeout(()=>{try{nvSincronizar(false).then(()=>nvBadge()).catch(()=>{})}catch(_){}},1200)}
  else if(L.sb)nvSet({sb:0});
  try{nvBadge()}catch(_){}try{const c=$('#nv-card');if(c&&typeof nvPainel==='function'){const d=document.createElement('div');d.innerHTML=nvPainel();c.replaceWith(d.firstElementChild);bindNvPainel()}}catch(_){}}
  catch(e){console.warn('[EduSpruce] base de dados:',e.message)}}
setTimeout(sbVerificar,700);
