/* =====================================================================
   APPS (1.052) — página inicial com as apps da EduSpruce em mosaicos
   agrupados (Gestão · Recreio · Organização), com ícones personalizáveis.
   Dados: S.cfg.hub = {ini:bool (abrir aqui ao entrar), est:'cheio'|'suave'|'linha',
                       ic:{[id]:{g:glifo, c:cor, e:emoji/letras, img:dataURL, n:nome}}}
   ===================================================================== */
ICONS.apps='<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>';
const HUB_CORES={azul:['#3b82f6','#1d4ed8'],ceu:['#38bdf8','#0369a1'],ciano:['#22d3ee','#0e7490'],verde:['#34d399','#047857'],pinho:['#4ade80','#166534'],lima:['#a3e635','#4d7c0f'],ambar:['#fbbf24','#b45309'],laranja:['#fb923c','#c2410c'],vermelho:['#f87171','#b91c1c'],rosa:['#f472b6','#be185d'],roxo:['#a78bfa','#6d28d9'],indigo:['#818cf8','#4338ca'],ardosia:['#94a3b8','#334155'],grafite:['#525252','#171717']};
/* nome do grupo igual ao do menu lateral (quando o professor tem um grupo com estas apps, ex.: «EduApps») */
function hubNomeGr(g){try{let M=null;try{M=menuCfg()}catch(_){}if(!Array.isArray(M))return g.n;
  const vs=new Set(HUB_APPS.filter(a=>a.gr===g.id).map(a=>a.v));let melhor=null,n=0;
  const vis=G=>(G||[]).forEach(x=>{if(!x||typeof x!=='object')return;if(Array.isArray(x.f)){const k=x.f.filter(i=>i&&vs.has(i.v)).length;const outras=x.f.some(i=>i&&!vs.has(i.v)&&HUB_APPS.some(z=>z.v===i.v));if(x.nome&&k>n&&!outras){n=k;melhor=x.nome}vis(x.f)}});vis(M);
  return melhor&&n>=2?String(melhor).replace(/^./,c=>c.toUpperCase()):g.n}catch(_){return g.n}}
const HUB_GRUPOS=[{id:'gestao',n:'Gestão',g:'school'},{id:'recreio',n:'EduApps',g:'sparkle'},{id:'org',n:'Organização',g:'layers'}];
const hubN=(n,s,p)=>n+' '+(n===1?s:p);
const HUB_APPS=[
  {id:'turmas',gr:'gestao',n:'Turmas e Alunos',v:'turmas',g:['mvTurmas','users'],c:'azul',d:'Ano letivo, turmas, alunos e fichas',
   info:()=>{const a=A();if(!a)return'Criar o ano letivo';const L=turmasFiltradas(a);const n=L.reduce((s,t)=>s+((t.alunos||[]).length),0);return hubN(L.length,'turma','turmas')+' · '+hubN(n,'aluno','alunos')}},
  {id:'avaliacao',gr:'gestao',n:'Avaliação',v:'avaliacao',g:['grad'],c:'verde',d:'Critérios, instrumentos e classificações',
   info:()=>{const t=T();return t?'Turma '+t.nome+' · '+t.disciplina:'Escolha a turma acima'},turma:1},
  {id:'sumarios',gr:'gestao',n:'Sumários',v:'sumarios',g:['nvaula','pen'],c:'laranja',d:'Aulas, sumários e presenças',
   info:()=>{const t=T();return t?'Turma '+t.nome+' · '+t.disciplina:'Escolha a turma acima'},turma:1},
  {id:'arena',gr:'recreio',n:'Spruce It',v:'arena',g:['mvArena','sparkle'],c:'roxo',d:'Jogos de perguntas em tempo real',on:()=>typeof arOn!=='function'||arOn(),
   info:()=>hubN(((S.arena||{}).conj||[]).length,'conjunto de perguntas','conjuntos de perguntas'),tag:'Nunca conta para a nota'},
  {id:'pulso',gr:'recreio',n:'Pulso',v:'pulso',g:['mvPulso','target'],c:'rosa',d:'Avaliação formativa em tempo real',on:()=>typeof puOn!=='function'||puOn(),
   info:()=>hubN(((S.pulso||{}).quiz||[]).length,'questionário','questionários'),tag:'Formativo · conta se escolher'},
  {id:'forms',gr:'recreio',n:'Formulários',v:'forms',g:['mvForms','clipboard'],c:'ciano',d:'Formulários e testes online',on:()=>typeof fmOn!=='function'||fmOn(),
   info:()=>{const F=Array.isArray(S.forms)?S.forms:[];const r=F.reduce((s,o)=>s+((o.resp||[]).length),0);return hubN(F.length,'formulário','formulários')+(r?' · '+hubN(r,'resposta','respostas'):'')},tag:'Liga à Avaliação'},
  {id:'provas',gr:'recreio',n:'Provas',v:'provas',g:['award'],c:'ambar',d:'Avaliações digitais corrigidas',on:()=>typeof pvOn!=='function'||pvOn(),
   info:()=>{const p=S.pv||{};return hubN((p.ex||[]).length,'prova','provas')+' · '+hubN((p.av||[]).length,'avaliação','avaliações')},tag:'Liga à Avaliação'},
  {id:'sprucenote',gr:'org',n:'SpruceNote',v:'sprucenote',g:['nvsn','grid'],c:'pinho',d:'Quadros de notas e ideias',on:()=>typeof snOn!=='function'||snOn(),
   info:()=>hubN(((S.sn||{}).quadros||[]).length,'quadro','quadros')},
  {id:'eduschedule',gr:'org',n:'EduSchedule',v:'eduschedule',g:['calendar'],c:'azul',d:'Horários da escola, gestão diária e pleon',on:()=>typeof esOn!=='function'||esOn(),
   info:()=>(S.esched&&S.esched.estado)?'Horário guardado na conta':'Criar o horário da escola'}
];
const hubCfg=()=>{S.cfg=S.cfg||{};const h=S.cfg.hub=(S.cfg.hub&&typeof S.cfg.hub==='object')?S.cfg.hub:{};if(!h.ic||typeof h.ic!=='object')h.ic={};return h};
const hubIni=()=>hubCfg().ini===true;
const hubG=(a,o)=>{const c=(o||hubCfg().ic[a.id]||{}).g;if(c&&ICONS[c])return c;return a.g.find(k=>ICONS[k])||'apps'};
/* tema SGE (1.059): cores por omissão da paleta SGE (azul SGE, azul-escuro, laranja SGE), por grupo; uma cor escolhida pelo professor mantém-se */
const HUB_SGE={sgeAzul:['#1b93c6','#1b93c6'],sgeEscuro:['#0e7095','#0e7095'],sgeLaranja:['#f39200','#f39200'],sgeCeu:['#5bb7de','#2a9fd0'],sgeCinza:['#7a8a96','#55656f'],sgeVerde:['#16a34a','#15803d'],sgeTeal:['#0f8b8d','#0b6b6d'],sgeVermelho:['#dc2626','#b91c1c'],sgeTerra:['#c2410c','#9a3412'],sgeAmbar:['#f59e0b','#b45309']};
Object.assign(HUB_CORES,HUB_SGE);
/* 1.076: cada app com a sua cor dentro da paleta SGE */
const HUB_SGE_DEF={turmas:'sgeAzul',avaliacao:'sgeVerde',sumarios:'sgeCeu',arena:'sgeLaranja',pulso:'sgeVermelho',forms:'sgeTeal',provas:'sgeTerra',sprucenote:'sgeAmbar',eduschedule:'sgeEscuro'};
const hubSge=()=>{try{return document.body.classList.contains('est-sge')}catch(_){return false}};
const hubCorDef=a=>hubSge()?(HUB_SGE_DEF[a.id]||'sgeAzul'):a.c;
const hubCor=(a,o)=>{const c=((o||hubCfg().ic[a.id]||{}).c)||hubCorDef(a);if(HUB_CORES[c])return HUB_CORES[c];if(/^#[0-9a-f]{6}$/i.test(c))return[c,'color-mix(in srgb,'+c+' 62%,#000)'];return HUB_CORES[a.c]};
const hubNome=a=>{const n=(hubCfg().ic[a.id]||{}).n;return n&&n.trim()?n.trim():a.n};
/* o símbolo de cada app é o mesmo do menu lateral (incluindo ícones mudados em Definições › Menu Lateral) */
function hubIcMenu(a,px){try{const L=[...document.querySelectorAll('#side [data-v="'+a.v+'"] svg')];const sv=L.find(x=>x.closest('[data-v]').offsetParent)||L[0];if(!sv)return'';
  const c=sv.cloneNode(true);c.setAttribute('width',px);c.setAttribute('height',px);c.removeAttribute('style');return c.outerHTML}catch(_){return''}}
function hubIcone(a,sz,o){o=o||hubCfg().ic[a.id]||{};const [c1,c2]=hubCor(a,o);const est=hubCfg().est||'cheio';sz=sz||64;
  const st=`--h1:${c1};--h2:${c2};width:${sz}px;height:${sz}px`;
  let dentro;if(o.img)dentro=`<img src="${esc(o.img)}" alt="">`;else if(o.e&&o.e.trim())dentro=`<span class="hbe" style="font-size:${Math.round(sz*(([...o.e.trim()].length>1)?.36:.5))}px">${esc([...o.e.trim()].slice(0,3).join(''))}</span>`;else dentro=(!o.g&&hubIcMenu(a,Math.round(sz*.44)))||ic(hubG(a,o),Math.round(sz*.4));
  return `<span class="hbic hb-${o.img?'img':est}" style="${st}">${dentro}</span>`}

TITLES.hub='Apps';
{const h=document.querySelector('#side [data-v="inicio"]');if(h&&!document.querySelector('#side [data-v="hub"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="hub" title="Apps da EduSpruce"><span data-ico="apps"></span><span class="lbl">Apps</span></button>`);const b=document.querySelector('#side [data-v="hub"]');b.querySelector('[data-ico]').innerHTML=ic('apps',18);b.onclick=()=>{go._hubU=1;go('hub')}}}
try{MN_NOME.hub='Apps'}catch(_){}
/* menu lateral: «Apps» logo a seguir a «Início» (também em menus personalizados), uma única vez */
function hubMenu(){try{if(!S.cfg||S.cfg.hubMenu)return;const vist=S.cfg.menuVistos||[];const temSrc=!!(S.cfg.menuL||mnDaEscola());if(!temSrc){S.cfg.hubMenu=1;return}
  const M=menuCfg();const tira=L=>{for(let i=L.length-1;i>=0;i--){if(L[i].v==='hub')L.splice(i,1);else if(L[i].f)tira(L[i].f)}};tira(M);
  const poe=L=>{for(let i=0;i<L.length;i++){if(L[i].v==='inicio'){L.splice(i+1,0,{v:'hub'});return true}if(L[i].f&&poe(L[i].f))return true}return false};
  if(!poe(M))M.unshift({v:'hub'});S.cfg.hubMenu=1;menuGuardar(M);void vist}catch(e){console.warn(e)}}
/* ao entrar: abrir nas Apps em vez do Início (até o professor navegar) */
{const ini=document.querySelector('#side [data-v="inicio"]');if(ini)ini.addEventListener('click',()=>{go._hubU=1},true)}
{const _gHb=go;go=function(v){if(v==='inicio'&&!go._hubU&&hubIni())v='hub';else if(v!=='inicio'&&v!=='hub')go._hubU=1;
  if(go._f&&go._f.hub!==vHub)go._f.hub=vHub;const r=_gHb.apply(this,[v,...[].slice.call(arguments,1)]);try{$$('#side [data-v="hub"]').forEach(b=>b.classList.toggle('on',VIEW==='hub'));hubMenu()}catch(_){}return r};go._f=_gHb._f;if(go._f)go._f.hub=vHub}

function hubCss(){if(document.getElementById('hubcss'))return;const s=document.createElement('style');s.id='hubcss';s.textContent=`
html body .hub{max-width:1100px;margin:0 auto;padding:6px 4px 40px}
html body .hub-top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;margin:4px 0 18px}
html body .hub-top h2{margin:0;font-size:26px;letter-spacing:-.3px}
html body .hub-top .mut{font-size:13.5px}
html body .hub-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
html body .hub-sec{margin:22px 0 10px;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--mut);display:flex;align-items:center;gap:10px}
html body .hub-sec:after{content:"";flex:1;height:1px;background:var(--line)}
html body .hub-grid{display:flex;flex-wrap:wrap;justify-content:flex-start;gap:14px}
html body .hub-grid>.hbt{flex:0 1 calc((100% - 42px)/4);min-width:230px}
@media (max-width:560px){html body .hub-grid>.hbt{flex-basis:100%}}
html body .hub-sec .ic{display:none}
html body .hub-tur{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;text-transform:none;letter-spacing:0;font-weight:500;color:var(--ink)}
html body .hub-tur select{min-width:200px;max-width:280px}
html body .hub-tur.falta select{border-color:var(--acc);box-shadow:0 0 0 3px color-mix(in srgb,var(--acc) 25%,transparent)}
html body .hbt{position:relative;display:flex;gap:14px;align-items:center;text-align:left;padding:16px;border:1px solid var(--line);background:var(--panel);border-radius:18px;cursor:pointer;color:var(--ink);font:inherit;
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease;animation:hbIn .42s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0)*45ms)}
html body .hbt:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.10);border-color:color-mix(in srgb,var(--h1,var(--acc)) 45%,var(--line))}
html body .hbt:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
html body .hbt .hbtx{min-width:0;display:flex;flex-direction:column;gap:3px}
html body .hbt .hbn{font-weight:700;font-size:15.5px}
html body .hbt .hbd{font-size:12.5px;color:var(--mut);line-height:1.3}
html body .hbt .hbi{font-size:12.5px;color:var(--ink);opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body .hbt .hblig{align-self:flex-start;margin-top:3px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,var(--h1,var(--acc)) 14%,transparent);color:color-mix(in srgb,var(--h2,var(--acc)) 80%,var(--ink))}
html body .hbt .hbed{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;border:1px solid var(--line);background:var(--panel);display:none;align-items:center;justify-content:center;color:var(--ink)}
html body .hub.edit .hbt .hbed{display:flex}
html body .hub.edit .hbt{animation:hbIn .42s cubic-bezier(.2,.8,.2,1) both,hbWig 1.6s ease-in-out infinite;animation-delay:calc(var(--i,0)*45ms),calc(var(--i,0)*-170ms)}
html body .hbic{flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:28%;overflow:hidden;position:relative;line-height:1}
html body .hbic.hb-cheio{background:linear-gradient(145deg,var(--h1),var(--h2));color:#fff;box-shadow:0 6px 16px color-mix(in srgb,var(--h2) 35%,transparent),inset 0 1px 0 rgba(255,255,255,.35)}
html body .hbic.hb-cheio:before{content:"";position:absolute;inset:0;background:radial-gradient(120% 70% at 20% 0%,rgba(255,255,255,.35),transparent 55%);pointer-events:none}
html body .hbic.hb-suave{background:color-mix(in srgb,var(--h1) 18%,var(--panel));color:var(--h2)}
html body .hbic.hb-linha{background:transparent;border:2px solid var(--h1);color:var(--h1)}
html body .hbic.hb-img{background:var(--panel);border:1px solid var(--line)}
html body .hbic img{width:100%;height:100%;object-fit:cover;display:block}
html body .hbic .ic{position:relative}
html body .hbic .hbe{font-weight:800;position:relative;letter-spacing:-.5px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .hbic.hb-suave{color:var(--h1)}}
:root[data-theme="dark"] .hbic.hb-suave{color:var(--h1)}
@keyframes hbIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
@keyframes hbWig{0%,100%{rotate:0deg}25%{rotate:-.6deg}75%{rotate:.6deg}}
html.leve body .hbt,html.leve body .hub.edit .hbt{animation:none;transition:none}
@media (prefers-reduced-motion:reduce){html body .hbt,html body .hub.edit .hbt{animation:none}}
/* editor */
html body .hbe-prev{display:flex;align-items:center;gap:16px;margin:4px 0 14px}
html body .hbe-glifos{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:6px;max-height:228px;overflow:auto;padding:2px}
html body .hbe-glifos button,html body .hbe-cores button{border:1px solid var(--line);background:var(--panel);border-radius:10px;height:42px;display:flex;align-items:center;justify-content:center;padding:0}
html body .hbe-glifos button.on{border:2px solid var(--acc);background:var(--acc2)}
html body .hbe-cores{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
html body .hbe-cores button{width:34px;height:34px;border-radius:50%}
html body .hbe-cores button.on{outline:3px solid var(--acc);outline-offset:2px}
html body .hbe-cores input[type=color]{width:40px;height:34px;border:1px solid var(--line);border-radius:10px;padding:2px;background:var(--panel)}
html body .hbe-lbl{font-weight:600;margin:14px 0 6px;display:block}
html body .hbe-est{display:flex;gap:8px;flex-wrap:wrap}
/* tema SGE: painéis brancos com título, mosaicos planos, azul SGE */
html body.est-sge .hub{max-width:1180px;font-family:"Ubuntu","Segoe UI",Roboto,Arial,sans-serif}
html body.est-sge .hub-top{background:var(--panel);border:1px solid var(--line);padding:16px 20px;margin:0 0 16px;align-items:center}
html body.est-sge .hub-top h2{font-weight:400;font-size:24px;color:#0e7095;letter-spacing:0;display:flex;align-items:center;gap:10px}
html body.est-sge .hub-top h2 .ic{color:#1f9fcf}
html body.est-sge .hub-gr{background:var(--panel);border:1px solid var(--line);margin:0 0 16px}
html body.est-sge .hub-sec{margin:0;padding:12px 20px;font-size:17px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--ink);border-bottom:1px solid var(--line);flex-wrap:wrap}
html body.est-sge .hub-sec:after{display:none}
html body.est-sge .hub-sec>.ic{display:inline-block;color:#1f9fcf}
html body.est-sge .hub-sec .hub-tur{margin-left:auto}
html body.est-sge .hub-grid{padding:18px 20px 20px;gap:12px}
html body.est-sge .hub-grid>.hbt{flex-basis:calc((100% - 36px)/4)}
@media (max-width:560px){html body.est-sge .hub-grid>.hbt{flex-basis:100%}} /* 1.086: no telemóvel, um mosaico por linha também no tema SGE */
html body.est-sge .hbt{border-radius:0;box-shadow:none;background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--h1);padding:14px 14px 14px 12px;animation:none;transition:background .15s,border-color .15s}
html body.est-sge .hbt:hover{transform:none;box-shadow:none;background:color-mix(in srgb,#1f9fcf 7%,var(--panel));border-color:color-mix(in srgb,#1f9fcf 55%,var(--line));border-left-color:var(--h1)}
html body.est-sge .hbt .hbn{font-weight:500;font-size:15.5px;color:#0e7095}
html body.est-sge.escurox .hbt .hbn{color:var(--ink)}
html body.est-sge .hbt .hbi{font-weight:500}
html body.est-sge .hbt .hblig{border-radius:0;background:transparent;border:1px solid color-mix(in srgb,var(--h1) 60%,var(--line));color:color-mix(in srgb,var(--h2) 85%,var(--ink));font-weight:500}
html body.est-sge .hbic.hb-cheio{background:var(--h2);box-shadow:none}
html body.est-sge .hbic.hb-cheio:before{display:none}
html body.est-sge .hbic{border-radius:0}
html body.est-sge .hub-tur select{border-radius:0}
html body.est-sge .hub.edit .hbt{animation:none}
/* tema de cantos retos */
html body.est-sge .hbt,html body.est-sge .hbic,html body.est-sge .hbt .hblig,html body.est-sge .hbt .hbed,html body.est-sge .hbe-glifos button,html body.est-sge .hbe-cores button,html body.est-sge .hbe-cores input{border-radius:0}
`;document.head.appendChild(s)}

/* nas Apps, os módulos desligados não aparecem; um grupo sem nenhum módulo ligado desaparece até se ligar um nas Definições */
function vHub(){hubCss();const h=hubCfg();const ed=!!UI.hubEd;let i=0;
  const tile=a=>{let inf='';try{inf=a.info?a.info():''}catch(_){}const [c1,c2]=hubCor(a);
    return `<button type="button" class="hbt" data-hub="${a.id}" style="--i:${i++};--h1:${c1};--h2:${c2}" title="${esc(hubNome(a))} — ${esc(a.d)}">
      ${hubIcone(a,60)}<span class="hbtx"><span class="hbn">${esc(hubNome(a))}</span><span class="hbd">${esc(a.d)}</span>${inf?`<span class="hbi">${esc(inf)}</span>`:''}${a.tag?`<span class="hblig">${esc(a.tag)}</span>`:''}</span>
      <span class="hbed" data-hbed="${a.id}" title="Personalizar ícone">${ic('pencil',14)}</span></button>`};
  const hoje=new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'});
  const a0=A(),TL=a0?turmasFiltradas(a0):[],t0=T();
  const selT=`<label class="hub-tur${t0?'':' falta'}" data-semprop><span>Turma</span><select id="hb-tur" aria-label="Turma para Avaliação e Sumários">${t0?'':'<option value="">— Escolher a turma —</option>'}${TL.map(t=>`<option value="${esc(t.id)}"${t0&&t.id===t0.id?' selected':''}>${esc(t.nome+' · '+(t.disciplina||''))}</option>`).join('')}</select></label>`;
  $('#view').innerHTML=`<div class="hub${ed?' edit':''}">
    <div class="hub-top"><div><h2>${ic('apps',22)}Apps</h2><div class="mut">${esc(hoje.charAt(0).toUpperCase()+hoje.slice(1))}${ed?' · toque num ícone para o personalizar':''}</div></div>
      <div class="hub-bar"><label class="chk" style="margin:0"><input type="checkbox" id="hb-ini" ${hubIni()?'checked':''}> <span>Abrir aqui ao entrar</span></label>
        <button class="btn${ed?' pri':''}" id="hb-ed">${ic(ed?'check':'pencil',15)} ${ed?'Concluído':'Personalizar'}</button></div></div>
    ${HUB_GRUPOS.map(g=>{const L=HUB_APPS.filter(a=>a.gr===g.id&&(!a.on||a.on()));return L.length?`<section class="hub-gr"><div class="hub-sec">${ic(g.g,18)}<span>${esc(hubNomeGr(g))}</span>${L.some(a=>a.turma)&&TL.length?selT:''}</div><div class="hub-grid">${L.map(tile).join('')}</div></section>`:''}).join('')}
  </div>`;
  $$('#view [data-semprop]').forEach(l=>l.addEventListener('click',e=>e.stopPropagation()));{const st=$('#hb-tur');if(st)st.onchange=e=>{if(!e.target.value)return;S.turmaAtiva=e.target.value;save();go('hub')}}
  $('#hb-ini').onchange=e=>{hubCfg().ini=e.target.checked;save();toast(e.target.checked?'A app abre nas Apps':'A app abre no Início','ok')};
  $('#hb-ed').onclick=()=>{UI.hubEd=!UI.hubEd;vHub()};
  $$('#view .hbt').forEach(b=>b.onclick=e=>{const a=HUB_APPS.find(x=>x.id===b.dataset.hub);if(!a)return;
    if(UI.hubEd||e.target.closest('[data-hbed]')){hubEditar(a);return}
    if(a.turma&&!T()){const st=$('#hb-tur');if(st){st.focus();try{st.showPicker()}catch(_){}}toast('Escolha primeiro a turma','info');return}
    go._hubU=1;go(a.v)})}

function hubEditar(a){const h=hubCfg();const o=Object.assign({},h.ic[a.id]||{});
  const EXC=new Set(['chev','arrowUp','arrowL','arrow','setaE','x','back','check','checks','grip','dots','undo','plus','line','lines','pause','play','mvMover','mvDesbloq','refresh','paste','copy','trash','merge','upload','download','apps']);
  const GL=Object.keys(ICONS).filter(k=>!EXC.has(k));
  const prev=()=>{const p=$('#hbe-p');if(p)p.innerHTML=hubIcone(a,84,o)+`<div><b style="font-size:16px">${esc((o.n||'').trim()||a.n)}</b><div class="mut">${esc(a.d)}</div></div>`};
  const corSel=o.c||hubCorDef(a);
  openDrawer('Personalizar · '+a.n,`
    <div class="hbe-prev" id="hbe-p"></div>
    <label class="hbe-lbl" for="hbe-n">Nome</label><input id="hbe-n" style="width:100%" maxlength="28" placeholder="${esc(a.n)}" value="${esc(o.n||'')}">
    <span class="hbe-lbl">Cor</span><div class="hbe-cores">${Object.entries(HUB_CORES).filter(([k])=>hubSge()||!HUB_SGE[k]).sort(([x],[y])=>hubSge()?(!!HUB_SGE[y])-(!!HUB_SGE[x]):0).map(([k,[c1,c2]])=>`<button type="button" data-c="${k}" title="${k}" class="${corSel===k?'on':''}" style="background:linear-gradient(145deg,${c1},${c2})"></button>`).join('')}
      <input type="color" id="hbe-cc" title="Cor própria" value="${/^#/.test(corSel)?corSel:'#0a5aa8'}"></div>
    <span class="hbe-lbl">Estilo (todos os ícones)</span><div class="hbe-est">${[['cheio','Preenchido'],['suave','Suave'],['linha','Contorno']].map(([k,n])=>`<button type="button" class="btn sm${(h.est||'cheio')===k?' pri':''}" data-est="${k}">${n}</button>`).join('')}</div>
    <span class="hbe-lbl">Símbolo</span><div class="hbe-glifos">${GL.map(k=>`<button type="button" data-g="${k}" title="${k}" class="${hubG(a,o)===k&&!o.e&&!o.img?'on':''}">${ic(k,18)}</button>`).join('')}</div>
    <label class="hbe-lbl" for="hbe-e">Ou um emoji / letras</label><input id="hbe-e" maxlength="6" style="width:120px" placeholder="ex.: 🎯 ou IN" value="${esc(o.e||'')}">
    <span class="hbe-lbl">Ou uma imagem</span><div class="hbe-est"><label class="btn sm">${ic('image',14)} Escolher imagem<input type="file" id="hbe-img" accept="image/*" hidden></label>${o.img?'<button type="button" class="btn sm ghost" id="hbe-imgx">Tirar imagem</button>':''}</div>
    <div style="display:flex;gap:8px;justify-content:space-between;margin-top:22px;flex-wrap:wrap"><button type="button" class="btn ghost" id="hbe-rep">${ic('refresh',14)} Repor o original</button><button type="button" class="btn pri" id="hbe-ok">${ic('check',14)} Guardar</button></div>`);
  prev();
  const B=$('#dw-b');
  B.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{o.c=b.dataset.c;B.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b));prev()});
  $('#hbe-cc').oninput=e=>{o.c=e.target.value;B.querySelectorAll('[data-c]').forEach(x=>x.classList.remove('on'));prev()};
  B.querySelectorAll('[data-est]').forEach(b=>b.onclick=()=>{h.est=b.dataset.est;B.querySelectorAll('[data-est]').forEach(x=>x.classList.toggle('pri',x===b));prev()});
  B.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{o.g=b.dataset.g;o.e='';delete o.img;$('#hbe-e').value='';B.querySelectorAll('[data-g]').forEach(x=>x.classList.toggle('on',x===b));prev()});
  $('#hbe-n').oninput=e=>{o.n=e.target.value;prev()};
  $('#hbe-e').oninput=e=>{o.e=e.target.value;if(o.e)delete o.img;prev()};
  $('#hbe-img').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');const s=Math.max(N/im.width,N/im.height);const w=im.width*s,hh=im.height*s;x.drawImage(im,(N-w)/2,(N-hh)/2,w,hh);let u='';try{u=cv.toDataURL('image/webp',.85)}catch(_){}if(!/^data:image\/webp/.test(u))u=cv.toDataURL('image/png');o.img=u;o.e='';$('#hbe-e').value='';prev()};im.onerror=()=>toast('Não foi possível ler a imagem','erro');im.src=r.result};r.readAsDataURL(f)};
  {const x=$('#hbe-imgx');if(x)x.onclick=()=>{delete o.img;x.remove();prev()}}
  $('#hbe-rep').onclick=()=>{delete h.ic[a.id];save();closeDrawer();vHub();toast('Ícone original reposto','ok')};
  $('#hbe-ok').onclick=()=>{const L={};['g','c','e','img','n'].forEach(k=>{if(o[k]&&String(o[k]).trim())L[k]=k==='n'||k==='e'?String(o[k]).trim():o[k]});if(Object.keys(L).length)h.ic[a.id]=L;else delete h.ic[a.id];save();closeDrawer();vHub();toast('Ícone guardado','ok')}}
/* 1.054 — Início: barra de ferramentas com as apps em ícones pequenos, alinhada à direita (por cima do cartão do ano letivo) */
if(typeof dashTopo==='function'){const _dtHb=dashTopo;dashTopo=function(){const h=_dtHb.apply(this,arguments);try{hubCss();
  const L=HUB_APPS.filter(a=>!a.on||a.on());if(!L.length)return h;
  const bar=`<div class="hub-mini" role="toolbar" aria-label="Apps">${L.map(a=>`<button type="button" class="hbm" data-hubmini="${a.id}" title="${esc(hubNome(a))} — ${esc(a.d)}" aria-label="${esc(hubNome(a))}">${hubIcone(a,34)}</button>`).join('')}<span class="hbm-sep"></span><button type="button" class="hbm hbm-todas" data-hubmini="@hub" title="Todas as apps" aria-label="Todas as apps">${ic('apps',22)}</button></div>`;
  requestAnimationFrame(hubMiniAjusta);setTimeout(hubMiniAjusta,350);
  const k=h.lastIndexOf('</div>');return k<0?h+bar:h.slice(0,k)+bar+h.slice(k)}catch(e){console.warn(e);return h}}}
/* a barra fica com a largura e as margens do cartão da coluna da direita (ex.: Ano Letivo / contagem) */
function hubMiniAjusta(){try{const bar=document.querySelector('#view .hub-mini');if(!bar)return;const top=bar.closest('.dtop');
  const n=bar.querySelectorAll('.hbm').length;
  const tam=()=>{const w=bar.clientWidth-14-9;const t=Math.floor((w-(n-1)*4)/n)-4;bar.style.setProperty('--hbs',Math.max(26,Math.min(46,t))+'px');bar.classList.toggle('apert',t<26)};
  const limpa=()=>{bar.classList.remove('larg','apert','mob');bar.style.width='';bar.style.removeProperty('--hbs')};
  if(innerWidth<=700){limpa();bar.classList.add('larg','mob');tam();return}
  const sd=[...document.querySelectorAll('#view .inlay>.in-side')].find(e=>e.offsetWidth);const tr=top&&top.getBoundingClientRect();
  if(!sd||!tr){limpa();return}const r=sd.getBoundingClientRect();
  if(Math.abs(r.right-tr.right)>4||r.left<tr.left+20){limpa();return}
  bar.style.width=Math.round(r.width)+'px';bar.classList.add('larg');bar.classList.remove('mob');tam()}catch(_){}}
addEventListener('resize',()=>{clearTimeout(hubMiniAjusta._t);hubMiniAjusta._t=setTimeout(hubMiniAjusta,120)});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-hubmini]');if(!b)return;e.preventDefault();const id=b.dataset.hubmini;go._hubU=1;
  if(id==='@hub'){go('hub');return}const a=HUB_APPS.find(x=>x.id===id);if(a)go(a.v)});
{const s=document.createElement('style');s.textContent=`
html body .dtop .hub-mini{margin-left:auto;display:flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--line);background:var(--panel);border-radius:12px;flex-wrap:wrap}
html body .dtop:has(.hub-mini) .dhint{flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html body .hub-mini .hbm{border:0;background:transparent;padding:3px;border-radius:9px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .15s,transform .15s}
html body .hub-mini .hbm:hover{background:color-mix(in srgb,var(--acc) 10%,transparent);transform:translateY(-1px)}
html body .hub-mini .hbm:focus-visible{outline:2px solid var(--acc);outline-offset:1px}
html body .hub-mini .hbm .hbic{box-shadow:none}
html body .hub-mini .hbm-todas{width:40px;height:40px;color:var(--mut)}
html body .dtop .hub-mini.larg{box-sizing:border-box;justify-content:space-between;flex-wrap:nowrap;padding:4px 6px;gap:2px}
html body .hub-mini.larg .hbm{padding:2px;flex:0 1 auto;min-width:0}
html body .hub-mini.larg .hbm-sep{margin:0;flex:none}
html body .hub-mini.larg .hbm-todas{width:34px}
html body .hub-mini .hbm-sep{width:1px;height:22px;background:var(--line);margin:0 2px}
html body.est-sge .dtop .hub-mini,html body.est-sge .hub-mini .hbm{border-radius:0}
html body.est-sge .hub-mini .hbm:hover{background:color-mix(in srgb,#1f9fcf 12%,transparent);transform:none}
html body.est-sge .hub-mini .hbm-todas{color:#0e7095}
html body .hub-mini.larg .hbm .hbic{width:var(--hbs,34px)!important;height:var(--hbs,34px)!important}
html body .hub-mini.larg .hbm .hbic>svg{width:44%;height:44%}
html body .hub-mini.larg .hbm-todas{width:calc(var(--hbs,34px) + 4px);height:calc(var(--hbs,34px) + 4px)}
html body .hub-mini.larg .hbm-todas>svg{width:62%;height:62%}
html body .hub-mini.apert{flex-wrap:wrap;justify-content:center}
html body .dtop .hub-mini.mob{margin-left:0;width:100%;flex:1 1 100%}
html body .dtop:has(.hub-mini.mob){flex-wrap:wrap}
html body .in-side .cdown h2{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:clamp(17px,2.2vw,22px)}
@media (max-width:700px){html body .dtop .hub-mini{margin-left:0}}
html body .hub-mini .hbm{margin:0!important;min-height:0!important;line-height:0;vertical-align:middle;align-self:center}
html body .hub-mini .hbm>svg{display:block}
/* vista Geral: a barra fica na linha dos filtros, alinhada com as caixas de escolha (38 px) */
html body .hub-mini:not(.dtop>.hub-mini){margin-left:auto;align-self:flex-end;height:38px;box-sizing:border-box;padding:0 4px;gap:4px;flex-wrap:nowrap;align-items:center}
html body .hub-mini:not(.dtop>.hub-mini) .hbm{padding:0;height:34px;width:34px}
html body .hub-mini:not(.dtop>.hub-mini) .hbm .hbic{width:30px!important;height:30px!important}
html body .hub-mini:not(.dtop>.hub-mini) .hbm-todas{width:34px;height:34px}
`;document.head.appendChild(s)}
/* menu lateral: um módulo desligado nunca aparece, seja qual for o menu (original, criado pelo professor ou da escola) nem o tema;
   aparece e desaparece conforme se liga ou desliga o módulo */
function hubMenuMods(){try{HUB_APPS.forEach(a=>{if(!a.on)return;const on=!!a.on();document.querySelectorAll('#side [data-v="'+a.v+'"],#tnavHold [data-v="'+a.v+'"]').forEach(b=>{if(b.hidden===on)b.hidden=!on})})}catch(e){console.warn(e)}}
if(typeof menuRender==='function'){const _mrHb=menuRender;menuRender=function(){hubMenuMods();return _mrHb.apply(this,arguments)}}
if(typeof aplicarPrefs==='function'){const _apHb=aplicarPrefs;aplicarPrefs=function(){const r=_apHb.apply(this,arguments);try{hubMenuMods();menuAgendar()}catch(_){}return r}}
{const s=document.createElement('style');s.textContent='html body #side .nav[hidden],html body #tnavHold .nav[hidden]{display:none!important}';document.head.appendChild(s)}
