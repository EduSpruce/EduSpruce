/* ---------- definições: temas, letra, versão ---------- */
function temaCss(txt){const ok=String(txt||'').split(/\r?\n|;/).map(x=>x.trim()).filter(x=>/^--[\w-]+\s*:\s*[^{}<>;]+$/.test(x));return ok.length?'[data-theme=pessoal]{color-scheme:'+(/color-scheme\s*:\s*dark/.test(txt)?'dark':'light')+';'+ok.join(';')+'}':'';}
function temaPessoal(){let css='';try{css=temaCss(localStorage.getItem('ph-tema-css'));}catch(e){}let el=document.getElementById('tema-pers');if(!el){el=document.createElement('style');el.id='tema-pers';document.head.append(el);}el.textContent=css;return !!css;}
temaPessoal();
PAGES.definicoes=function(m){
  let cur=null,raw='';try{cur=localStorage.getItem('ph-tema');raw=localStorage.getItem('ph-tema-css')||'';}catch(e){}
  m.append(pageHead('Definições','Aparência da aplicação e informação da versão.'));
  const sw=c=>h('span',{class:'w-4 h-4 rounded-full border border-base-content/20 '+c});
  m.append(panel('Temas',h('div',{class:'grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3',id:'temas'},
      h('button',{type:'button',id:'tema-auto',class:'btn h-auto py-3 justify-start normal-case '+(cur?'btn-outline border-base-300':'btn-primary'),onclick:()=>{applyTheme(null);render();}},'Automático (segue o sistema)'),
      TEMAS.filter(t=>t[0]!=='pessoal'||temaCss(raw)).map(t=>h('button',{type:'button',id:'tema-'+t[0],'data-theme':t[0],'aria-pressed':String(cur===t[0]),class:'btn h-auto py-3 justify-between normal-case bg-base-100 text-base-content border-2 flex-wrap gap-2 min-w-0 '+(cur===t[0]?'border-primary':'border-base-300'),onclick:()=>{applyTheme(t[0]);render();}},h('span',{},t[1]),h('span',{class:'flex gap-1'},sw('bg-primary'),sw('bg-secondary'),sw('bg-accent'),sw('bg-base-300'))))),
    h('p',{class:'text-xs opacity-60'},'Os dois primeiros são os temas originais do EduSchedule. O botão do sol e da lua, no topo, continua a alternar entre claro e escuro.')));
  m.append(panel('Tema personalizado',h('span',{class:'text-sm opacity-70'},'Cole aqui as variáveis de um tema daisyUI, por exemplo o bloco de um tema do EduSpruce (linhas como --color-primary: oklch(55% 0.2 250);). Só são aceites linhas de variáveis.'),
    h('textarea',{id:'tema-css',class:'textarea w-full h-40 font-mono text-xs','aria-label':'Variáveis do tema',placeholder:'--color-primary: oklch(55% 0.2 250);\n--color-primary-content: oklch(98% 0.01 250);\n--color-base-100: oklch(99% 0.005 250);\n--radius-box: 1rem;'},raw),
    h('div',{class:'flex flex-wrap gap-2'},btn('Aplicar tema personalizado',()=>{const v=$('#tema-css').value;try{localStorage.setItem('ph-tema-css',v);}catch(e){}if(temaPessoal()){applyTheme('pessoal');render();toast('Tema personalizado aplicado.',null,null,'ok');}else toast('Não encontrei variáveis válidas. Cada linha deve ser do género --color-primary: valor;');},'btn-primary btn-sm'),btn('Apagar',()=>{try{localStorage.removeItem('ph-tema-css');}catch(e){}temaPessoal();if(cur==='pessoal')applyTheme(null);render();},'btn-sm btn-ghost'))));
  m.append(panel('Tamanho da letra',h('div',{class:'join'},btn('A−',()=>zoomUI(-1),'btn-sm join-item'),btn('Repor 100%',()=>zoomUI(0),'btn-sm join-item'),btn('A+',()=>zoomUI(1),'btn-sm join-item'))));
  m.append(panel('Sobre',h('div',{class:'flex flex-wrap items-center gap-3',id:'sobre'},h('span',{class:'fd text-2xl font-bold'},APP.nome),badge('versão '+APP.ver,'info'),h('span',{class:'text-sm opacity-70'},'de '+APP.data+' · horários escolares, gestão diária e exportação para o DBG pleon'))));
};
