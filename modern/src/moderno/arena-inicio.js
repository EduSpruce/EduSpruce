/* ===================== 1.142 · Spruce It: página inicial nova e atividade ao vivo no ecrã projetado =====================
   Página «Os meus conjuntos»:
   · indicadores (conjuntos, perguntas, jogos, participações, acerto médio, último jogo)
   · conjuntos em grelha (capa com a 1.ª imagem do conjunto ou iniciais, n.º de perguntas, jogos, editado há…) ou em lista
   · ordenar (editados há menos tempo, mais jogados, nome, n.º de perguntas), favoritos ★ e pastas em botões
   · painéis: continuar (último editado / último jogado), jogos recentes com vencedor e acerto, atividade das últimas
     8 semanas, modos mais usados e perguntas a rever (as que menos acertam nos relatórios guardados)
   Ecrã projetado (modos ao ritmo de cada aluno): painel «Ao vivo» com o que acontece (quem ganhou, perdeu ou ficou com
   pontos de outro jogador), total da sala e acerto. Os nomes e as personagens são originais (nada copiado do Blooket). */

const ARS_ORD={recente:'Editados há menos tempo',jogos:'Mais jogados',nome:'Nome (A–Z)',perg:'Mais perguntas'};
function arsConjs(){const d=arD();let ano=null;try{if(typeof bcAnoNome==='function'){if(typeof bcMarcar==='function')bcMarcar(d.conj);ano=bcAnoNome()}}catch(_){}return d.conj.filter(c=>!ano||c.ano===ano)}
function arsJogos(L){const ids=new Set(L.map(c=>c.id));return arD().jogos.filter(j=>ids.has(j.conj))}
function arsPct(v){return v==null?'—':Math.round(v*100)+'%'}
function arsCor(c){return ['#127fa6','#0e5f7d','#5bb7de','#d98a1f','#0f8b8d','#7c5cc4'][[...String(c.disc||c.nome)].reduce((a,ch)=>a+ch.charCodeAt(0),0)%6]}
function arsIni(c){const sw=new Set(['a','o','as','os','de','da','do','das','dos','e','em','no','na','um','uma','the','of','and']);return String(c.nome||c.disc||'?').replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(w=>w&&!sw.has(w.toLowerCase())).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?'}
function arsImg(c){try{const p=(c.perg||[]).find(p=>p.img&&FOTOS[p.img]);return p?FOTOS[p.img]:''}catch(_){return ''}}
function arsAcerto(G){let n=0,ok=0;G.forEach(j=>{(j.res&&j.res.resp||[]).forEach(z=>{n++;if(z[3])ok++})});return n?ok/n:null}
function arsStats(L,G){const perg=L.reduce((s,c)=>s+(c.perg||[]).length,0);const part=G.reduce((s,j)=>s+(j.res?j.res.jog.length:0),0);const ult=G.reduce((m,j)=>Math.max(m,+j.criado||0),0);
  return {conj:L.length,perg,jogos:G.length,vivo:G.filter(j=>j.tipo!=='tpc').length,tpc:G.filter(j=>j.tipo==='tpc').length,part,acerto:arsAcerto(G),ult}}
function arsSemanas(G){const agora=new Date();const seg=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()-((agora.getDay()+6)%7)).getTime();const W=[];
  for(let k=7;k>=0;k--){const a=seg-k*7*864e5,b=a+7*864e5;W.push({a,n:G.filter(j=>+j.criado>=a&&+j.criado<b).length})}return W}
function arsModos(G){const M={};G.forEach(j=>{M[j.modo]=(M[j.modo]||0)+1});return Object.entries(M).sort((a,b)=>b[1]-a[1]).slice(0,4)}
function arsRever(L,G){const por=new Map(L.map(c=>[c.id,c]));const A=new Map();
  G.forEach(j=>{const c=por.get(j.conj);if(!c||!j.res)return;const P=j.res.perg&&j.res.perg.length?j.res.perg:[];P.forEach((p,k)=>{const R=j.res.resp.filter(z=>z[1]===k);if(!R.length)return;const key=c.id+'|'+(p.t||'');const o=A.get(key)||{c,t:p.t||'(sem texto)',n:0,ok:0};o.n+=R.length;o.ok+=R.filter(z=>z[3]).length;A.set(key,o)})});
  return [...A.values()].filter(o=>o.n>=3).map(o=>({...o,taxa:o.ok/o.n})).filter(o=>o.taxa<.7).sort((a,b)=>a.taxa-b.taxa).slice(0,5)}

function arsMelhora(){const v=$('#view .arv.spv');const fl=$('#view .sph-fl');if(!v||!fl||v.querySelector('.ars-lay'))return;const d=arD();
  /* tira a lista antiga (a que vem do vArena original) */
  let n=fl.nextElementSibling;while(n){const x=n.nextElementSibling;n.remove();n=x}
  const tit=v.querySelector('.sph-tit');
  const L0=arsConjs(),G=arsJogos(L0),st=arsStats(L0,G);
  const F=UI.arF=UI.arF||{disc:'',turma:'',q:''};const q=normT(F.q||'');
  const vista=UI.arVista||(S.cfg&&S.cfg.arVista)||'grelha',ord=UI.arOrd||(S.cfg&&S.cfg.arOrd)||'recente',pasta=UI.arPasta==null?'':UI.arPasta;
  const nj=c=>d.jogos.filter(j=>j.conj===c.id).length;
  let L=L0.filter(c=>(!F.disc||c.disc===F.disc)&&(!F.turma||c.turma===F.turma)&&(!q||normT([c.nome,c.tema,c.pasta,c.disc].join(' ')).includes(q)));
  const pastas=[...new Set(L0.map(c=>c.pasta||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
  if(pasta==='★')L=L.filter(c=>c.fav);else if(pasta)L=L.filter(c=>(c.pasta||'')===pasta);
  L=L.slice().sort((a,b)=>ord==='nome'?String(a.nome).localeCompare(String(b.nome),'pt'):ord==='jogos'?nj(b)-nj(a)||(b.mod||0)-(a.mod||0):ord==='perg'?b.perg.length-a.perg.length:(b.mod||b.criado||0)-(a.mod||a.criado||0));
  /* favoritos primeiro (exceto quando se ordena por nome) */
  if(ord!=='nome')L.sort((a,b)=>(b.fav?1:0)-(a.fav?1:0));
  const TT=arTurmas();
  const kpi=(i,v_,l,sub)=>`<div class="ars-k"><span class="ars-ki">${ic(i,18)}</span><div><b>${v_}</b><span>${l}</span>${sub?`<small>${sub}</small>`:''}</div></div>`;
  const kpis=`<div class="ars-kpis">${kpi('layers',AR.nf(st.conj),st.conj===1?'conjunto':'conjuntos',pastas.length?pastas.length+(pastas.length===1?' pasta':' pastas'):'')}${kpi('list',AR.nf(st.perg),st.perg===1?'pergunta':'perguntas',st.conj?'média de '+Math.round(st.perg/st.conj)+' por conjunto':'')}${kpi('sparkle',AR.nf(st.jogos),st.jogos===1?'jogo':'jogos',st.jogos?st.vivo+' ao vivo · '+st.tpc+' TPC':'')}${kpi('users',AR.nf(st.part),st.part===1?'participação':'participações','nos relatórios guardados')}${kpi('target',arsPct(st.acerto),'acerto médio',st.acerto==null?'ainda sem relatórios':'em todas as respostas')}${kpi('clock',st.ult?arHa(st.ult):'—','último jogo','')}</div>`;
  const capa=c=>{const im=arsImg(c);return `<div class="ars-capa" style="--cc:${arsCor(c)}">${im?`<img src="${esc(im)}" alt="" loading="lazy">`:`<span class="ars-ini">${esc(arsIni(c))}</span>`}<span class="ars-np">${c.perg.length} pergunta${c.perg.length===1?'':'s'}</span><button type="button" class="ars-fav" data-arsfav="${c.id}" aria-pressed="${c.fav?'true':'false'}" title="${c.fav?'Tirar dos favoritos':'Marcar como favorito'}">${c.fav?'★':'☆'}</button></div>`};
  const meta=c=>{const t=TT.find(z=>z.id===c.turma);const n_=nj(c);return {t,n_,chips:[c.disc,t?t.nome:'',c.tema,c.pasta?'📁 '+c.pasta:''].filter(Boolean)}};
  const card=c=>{const m=meta(c);return `<article class="ars-card" data-arsc="${c.id}">${capa(c)}<div class="ars-cb"><b title="${esc(c.nome)}">${esc(c.nome)}</b><span class="mut">${m.n_?m.n_+' jogo'+(m.n_===1?'':'s'):'Ainda sem jogos'} · editado ${arHa(c.mod||c.criado)}</span>${m.chips.length?`<div class="ars-chips">${m.chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}</div>
    <div class="ars-ca"><button class="btn ico" data-are="${c.id}" title="Editar" aria-label="Editar">${ic('pencil',15)}</button><button class="btn ico" data-arm="${c.id}" title="Duplicar, exportar, apagar" aria-label="Mais opções">${ic('dots',16)}</button><button class="btn ico" data-artpc="${c.id}" title="Atribuir como trabalho de casa" aria-label="Atribuir">${ic('calendar',15)}</button><button class="btn pri" data-arj="${c.id}">${ic('sparkle',15)} Lançar</button></div></article>`};
  const linha=c=>{const m=meta(c);const im=arsImg(c);return `<article class="arcc arrow ars-row" data-arsc="${c.id}"><div class="arcapa" style="--cc:${arsCor(c)}" aria-hidden="true">${im?`<img src="${esc(im)}" alt="">`:esc(arsIni(c))}</div><button type="button" class="ars-fav s" data-arsfav="${c.id}" aria-pressed="${c.fav?'true':'false'}" title="Favorito">${c.fav?'★':'☆'}</button><div class="arcct"><b>${esc(c.nome)}</b><span class="mut">${c.perg.length} pergunta${c.perg.length===1?'':'s'} · ${m.n_?m.n_+' jogo'+(m.n_===1?'':'s'):'ainda sem jogos'} · editado ${arHa(c.mod||c.criado)}${m.chips.length?' · '+esc(m.chips.join(' · ')):''}</span></div>
    <div class="arcca"><button class="btn" data-are="${c.id}">${ic('pencil',14)} Editar</button><button class="btn" data-artpc="${c.id}">${ic('calendar',14)} Atribuir</button><button class="btn pri" data-arj="${c.id}">${ic('sparkle',15)} Lançar jogo</button><button class="btn ico" data-arm="${c.id}" aria-label="Mais opções">${ic('dots',16)}</button></div></article>`};
  const barra=`<div class="ars-bar"><div class="ars-pastas" role="group" aria-label="Pastas"><button data-arsp="" aria-pressed="${pasta===''}">Todos</button><button data-arsp="★" aria-pressed="${pasta==='★'}">★ Favoritos</button>${pastas.map(p=>`<button data-arsp="${esc(p)}" aria-pressed="${pasta===p}">${ic('folder',13)} ${esc(p)}</button>`).join('')}</div><span class="sp1"></span>
    <label class="ars-ord">Ordenar<select id="ars-ord" aria-label="Ordenar">${Object.entries(ARS_ORD).map(([k,t])=>`<option value="${k}" ${ord===k?'selected':''}>${t}</option>`).join('')}</select></label>
    <div class="ars-vis" role="group" aria-label="Vista"><button data-arsv="grelha" aria-pressed="${vista==='grelha'}" title="Grelha">${ic('grid',15)}</button><button data-arsv="lista" aria-pressed="${vista==='lista'}" title="Lista">${ic('list',15)}</button></div></div>`;
  const lista=L.length?(vista==='lista'?`<div class="arclist">${L.map(linha).join('')}</div>`:`<div class="ars-grid">${L.map(card).join('')}<button type="button" class="ars-novo" id="ars-novo">${ic('plus',26)}<b>Novo conjunto</b><span>ou importe perguntas de um CSV/Excel</span></button></div>`)
    :`<div class="card empty">${ic('layers',28)}<br><b>Sem conjuntos${F.disc||F.turma||F.q||pasta?' com este filtro':''}</b><br><span class="mut">${pasta==='★'?'Toque na estrela ☆ de um conjunto para o marcar como favorito.':'Crie um conjunto novo ou importe perguntas de um CSV/Excel.'}</span></div>`;
  /* painéis do lado */
  const por=new Map(d.conj.map(c=>[c.id,c]));
  const ultEd=L0.slice().sort((a,b)=>(b.mod||0)-(a.mod||0))[0];const ultJ=G.slice().sort((a,b)=>(+b.criado||0)-(+a.criado||0))[0];const cJ=ultJ&&por.get(ultJ.conj);
  const cont=(ultEd||cJ)?`<section class="ars-p"><h3>${ic('play',15)} Continuar</h3>${ultEd?`<button class="ars-ct" data-are="${ultEd.id}"><span class="ars-mini" style="--cc:${arsCor(ultEd)}">${esc(arsIni(ultEd))}</span><span><b>${esc(ultEd.nome)}</b><small>Editado ${arHa(ultEd.mod||ultEd.criado)} · continuar a editar</small></span>${ic('pencil',14)}</button>`:''}${cJ?`<button class="ars-ct" data-arj="${cJ.id}"><span class="ars-mini" style="--cc:${(AR.MODOS[ultJ.modo]||{}).cor||'#127fa6'}">${(AR.MODOS[ultJ.modo]||{}).ic||'⚡'}</span><span><b>${esc(cJ.nome)}</b><small>${esc((AR.MODOS[ultJ.modo]||{}).nome||'')} ${arHa(ultJ.criado)} · jogar outra vez</small></span>${ic('sparkle',14)}</button>`:''}</section>`:'';
  const rec=G.slice().sort((a,b)=>(+b.criado||0)-(+a.criado||0)).slice(0,4);
  const recentes=`<section class="ars-p"><h3>${ic('chart',15)} Jogos recentes<button class="ars-vt" data-artab2="jogos">Ver todos</button></h3>${rec.length?rec.map(j=>{const M=AR.MODOS[j.modo]||{};const R=j.res;const w=R&&R.jog.length?R.jog.slice().sort((a,b)=>b.pts-a.pts)[0]:null;const ac=R?arsAcerto([j]):null;
      return `<div class="ars-j"><span class="ars-jm" style="--mc:${M.cor||'#127fa6'}" title="${esc(M.nome||j.modo)}">${M.ic||'?'}</span><div><b>${esc(j.nome)}</b><small>${esc(M.nome||j.modo)} · ${j.tipo==='tpc'?'TPC':'ao vivo'} · ${arHa(j.criado)}${R?' · '+R.jog.length+' jogadores':''}</small>${w?`<small class="ars-w">🏆 ${esc(w.a||'—')} · acerto ${arsPct(ac)}</small>`:''}</div>${R?`<button class="btn sm" data-arsrel="${j.id}" title="Relatório">${ic('chart',13)}</button>`:''}</div>`}).join(''):'<p class="mut ars-vz">Os jogos que lançar aparecem aqui, com o vencedor e a percentagem de acerto.</p>'}</section>`;
  const W=arsSemanas(G),mx=Math.max(1,...W.map(w=>w.n));
  const ativ=`<section class="ars-p"><h3>${ic('calendar',15)} Atividade <small>últimas 8 semanas</small></h3><div class="ars-sem">${W.map((w,k)=>`<div title="Semana de ${new Date(w.a).toLocaleDateString('pt-PT',{day:'numeric',month:'short'})}: ${w.n} jogo${w.n===1?'':'s'}"><i style="height:${Math.max(4,Math.round(64*w.n/mx))}px" class="${k===7?'h':''}"></i><span>${w.n||''}</span></div>`).join('')}</div><p class="mut ars-semt">${W.reduce((s,w)=>s+w.n,0)} jogos em 8 semanas${W[7].n?' · '+W[7].n+' esta semana':''}</p></section>`;
  const MD=arsModos(G),mm=Math.max(1,...MD.map(x=>x[1]));
  const modos=MD.length?`<section class="ars-p"><h3>${ic('sparkle',15)} Modos mais usados</h3>${MD.map(([k,n_])=>{const M=AR.MODOS[k]||{nome:k,ic:'?',cor:'#127fa6'};return `<div class="ars-md"><span class="ars-jm" style="--mc:${M.cor}">${M.ic}</span><span class="ars-mdn">${esc(M.nome)}</span><span class="ars-mdb"><i style="width:${Math.round(100*n_/mm)}%;background:${M.cor}"></i></span><b>${n_}</b></div>`}).join('')}</section>`:'';
  const RV=arsRever(L0,G);
  const rever=`<section class="ars-p"><h3>${ic('alert',15)} Perguntas a rever</h3>${RV.length?RV.map(o=>`<button class="ars-rv" data-are="${o.c.id}"><span class="ars-rvp" style="--p:${Math.round(o.taxa*100)}">${arsPct(o.taxa)}</span><span><b>${esc(o.t.length>90?o.t.slice(0,88)+'…':o.t)}</b><small>${esc(o.c.nome)} · ${o.n} respostas</small></span></button>`).join(''):'<p class="mut ars-vz">Quando houver relatórios guardados, aparecem aqui as perguntas em que a turma mais erra (menos de 70% de acerto).</p>'}</section>`;
  const lay=document.createElement('div');lay.className='ars-lay';
  lay.innerHTML=`<div class="ars-main"></div><aside class="ars-side" aria-label="Resumo">${cont}${recentes}${ativ}${modos}${rever}</aside>`;
  const main=lay.querySelector('.ars-main');
  fl.insertAdjacentElement('afterend',lay);
  if(tit)main.appendChild(tit);main.appendChild(fl);main.insertAdjacentHTML('beforeend',barra+lista);
  lay.insertAdjacentHTML('beforebegin',kpis);
  const sn=fl.querySelector('.sph-n');if(sn)sn.textContent=L.length+' conjunto'+(L.length===1?'':'s');
  /* ações */
  const C=id=>d.conj.find(c=>c.id===id);
  $$('#view .ars-lay [data-are]').forEach(b=>b.onclick=()=>{UI.arEd=b.dataset.are;vArena()});
  $$('#view .ars-lay [data-arj]').forEach(b=>b.onclick=()=>{const c=C(b.dataset.arj);if(c)arLancarDlg(c)});
  $$('#view .ars-lay [data-artpc]').forEach(b=>b.onclick=()=>{const c=C(b.dataset.artpc);if(c)arLancarDlg(c,'tpc')});
  $$('#view .ars-lay [data-arm]').forEach(b=>b.onclick=()=>{const c=C(b.dataset.arm);if(c)arMaisDlg(c)});
  $$('#view .ars-lay [data-arsfav]').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=C(b.dataset.arsfav);if(!c)return;c.fav=!c.fav;save();vArena()});
  $$('#view .ars-lay [data-arsp]').forEach(b=>b.onclick=()=>{UI.arPasta=b.dataset.arsp;vArena()});
  $$('#view .ars-lay [data-arsv]').forEach(b=>b.onclick=()=>{UI.arVista=b.dataset.arsv;S.cfg.arVista=b.dataset.arsv;save();vArena()});
  const o=$('#ars-ord');if(o)o.onchange=()=>{UI.arOrd=o.value;S.cfg.arOrd=o.value;save();vArena()};
  $$('#view .ars-lay [data-artab2]').forEach(b=>b.onclick=()=>{UI.arTab=b.dataset.artab2;vArena()});
  $$('#view .ars-lay [data-arsrel]').forEach(b=>b.onclick=()=>{const j=d.jogos.find(x=>x.id===b.dataset.arsrel);if(j)arRelatorio(j)});
  const nv=$('#ars-novo');if(nv)nv.onclick=()=>{const b=document.getElementById('ar-novo');if(b)b.click()};
  /* tocar na capa abre o editor */
  $$('#view .ars-card .ars-capa').forEach(c=>c.onclick=e=>{if(e.target.closest('button'))return;UI.arEd=c.closest('[data-arsc]').dataset.arsc;vArena()})}

const _arsV=vArena;
vArena=function(){const r=_arsV.apply(this,arguments);try{if(!UI.arEd&&(UI.arTab||'conj')==='conj')arsMelhora()}catch(e){console.warn(e)}return r};
try{if(go._f)go._f.arena=vArena}catch(_){}

/* ---------- ecrã projetado: atividade ao vivo ---------- */
function arsFeed(){const h=arH;if(!h||!h.d||h.j.tipo==='tpc')return;const lv=document.querySelector('#arh-m .arhlv');if(!lv||lv.querySelector('.arhfeed'))return;
  const at=(h.d.jogadores||[]).filter(x=>!x.expulso);const fl=h.j.modo==='floresta';const val=x=>fl?(+x.arv||0):(+x.pontos||0);
  h._fv=h._fv||{};h._feed=h._feed||[];const dl=[];
  at.forEach(x=>{const a=h._fv[x.id];const v_=val(x);if(a!=null&&v_!==a)dl.push({x,d:v_-a});h._fv[x.id]=v_});
  const usados=new Set();const agora=Date.now();
  dl.filter(o=>o.d>0).forEach(g=>{const p=dl.find(o=>o.d<0&&!usados.has(o)&&Math.abs(o.d)===g.d);if(p){usados.add(p);usados.add(g);h._feed.unshift({t:agora,k:'tira',a:g.x,b:p.x,n:g.d})}});
  dl.forEach(o=>{if(!usados.has(o))h._feed.unshift({t:agora,k:o.d>0?'ganha':'perde',a:o.x,n:Math.abs(o.d)})});
  h._feed=h._feed.slice(0,10);
  const fmt=n=>fl?n+(n===1?' rebento':' rebentos'):AR.metrica(h.j.modo,n)+(/^[\d.\s ]+$/.test(String(AR.metrica(h.j.modo,n)))?' pts':'');
  const nm=x=>`<b>${esc(x.alcunha)}</b>`;
  const linha=e=>`<li class="${agora-e.t<1500?'novo':''} ${e.k}">${AR.svg(e.a.avatar,30)}<span>${e.k==='tira'?`${nm(e.a)} ficou com ${fmt(e.n)} de ${nm(e.b)}`:e.k==='ganha'?`${nm(e.a)} ganhou ${fmt(e.n)}`:`${nm(e.a)} perdeu ${fmt(e.n)}`}</span></li>`;
  const tot=at.reduce((s,x)=>s+val(x),0);const ce=at.reduce((s,x)=>s+(+x.certas||0),0),er=at.reduce((s,x)=>s+(+x.erradas||0),0);
  const lider=at.slice().sort((a,b)=>val(b)-val(a))[0];
  const ap=document.createElement('aside');ap.className='arhfeed';ap.setAttribute('aria-live','polite');
  ap.innerHTML=`<h3><i></i> Ao vivo</h3><ul>${h._feed.length?h._feed.map(linha).join(''):'<li class="vz"><span>O que acontecer no jogo aparece aqui.</span></li>'}</ul>
    <div class="arhtot"><div><span>Total da sala</span><b>${fl?AR.nf(Math.floor(tot/4))+' 🌲':AR.metrica(h.j.modo,tot)}</b></div><div><span>Acerto</span><b>${ce+er?Math.round(100*ce/(ce+er))+'%':'—'}</b><small>${AR.nf(ce)} certas · ${AR.nf(er)} erradas</small></div>${lider?`<div class="arhlid">${AR.svg(lider.avatar,34)}<span>Na frente<b>${esc(lider.alcunha)}</b></span></div>`:''}</div>`;
  lv.classList.add('com-feed');lv.appendChild(ap)}
const _arsDes=arDesenhar;
arDesenhar=function(){const r=_arsDes.apply(this,arguments);try{arsFeed()}catch(e){console.warn(e)}return r};

/* ---------- estilos ---------- */
(()=>{if(document.getElementById('ars-css'))return;const st=document.createElement('style');st.id='ars-css';st.textContent=`
.spv .ars-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:14px 0 16px}
.spv .ars-k{display:flex;gap:10px;align-items:flex-start;background:var(--panel,#fff);border:1px solid var(--line,#dfe5eb);padding:12px 12px 10px}
.spv .ars-ki{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--acc,#127fa6) 12%,transparent);color:var(--acc,#127fa6)}
.spv .ars-k b{display:block;font-weight:800;font-size:22px;line-height:1.1}.spv .ars-k span{display:block;font-size:13px;color:var(--mut,#5f6b76)}.spv .ars-k small{display:block;font-size:11.5px;color:var(--mut,#5f6b76);opacity:.85;margin-top:2px}
.spv .ars-lay{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px;align-items:start}
.spv .ars-main{min-width:0}
.spv .ars-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 12px}
.spv .ars-pastas{display:flex;gap:6px;flex-wrap:wrap}
.spv .ars-pastas button,.spv .ars-vis button{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line,#dfe5eb);background:var(--panel,#fff);color:inherit;padding:6px 11px;font:600 13px inherit;cursor:pointer}
.spv .ars-pastas button[aria-pressed=true],.spv .ars-vis button[aria-pressed=true]{background:var(--acc,#127fa6);border-color:var(--acc,#127fa6);color:#fff}
.spv .ars-vis{display:flex}.spv .ars-vis button{padding:6px 9px}
.spv .ars-ord{display:inline-flex;align-items:center;gap:6px;color:var(--mut,#5f6b76)}.spv .ars-ord select{min-height:32px;padding:4px 8px}
.spv .ars-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.spv .ars-card{background:var(--panel,#fff);border:1px solid var(--line,#dfe5eb);display:flex;flex-direction:column;overflow:hidden;transition:transform .18s,box-shadow .18s}
.spv .ars-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px -14px rgba(0,0,0,.35)}
.spv .ars-capa{position:relative;height:120px;background:var(--cc);background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 10px,transparent 10px 20px);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}
.spv .ars-capa img{width:100%;height:100%;object-fit:cover}
.spv .ars-ini{font-weight:800;font-size:40px;line-height:1;color:#fff;letter-spacing:.04em;text-shadow:0 2px 0 rgba(0,0,0,.15)}
.spv .ars-np{position:absolute;right:8px;bottom:8px;background:rgba(15,23,42,.82);color:#fff;font:700 12px inherit;padding:4px 8px}
.spv .ars-fav{position:absolute;left:8px;top:8px;width:30px;height:30px;border:0;background:rgba(15,23,42,.55);color:#fff;font-size:17px;line-height:1;cursor:pointer}
.spv .ars-fav[aria-pressed=true]{color:#fbbf24}
.spv .ars-fav.s{position:static;background:none;color:var(--mut,#94a3b8);font-size:20px;width:auto;height:auto;padding:0 2px}.spv .ars-fav.s[aria-pressed=true]{color:#f59e0b}
.spv .ars-cb{padding:11px 12px 6px;flex:1;min-width:0}.spv .ars-cb b{display:block;font-size:16px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spv .ars-cb .mut{font-size:12.5px}
.spv .ars-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}.spv .ars-chips span{font-size:11.5px;padding:2px 7px;background:color-mix(in srgb,var(--acc,#127fa6) 10%,transparent);color:var(--ink,#334155)}
.spv .ars-ca{display:flex;gap:6px;padding:8px 12px 12px;flex-wrap:nowrap}.spv .ars-ca .btn{min-width:0}.spv .ars-ca .btn.ico{flex:none;width:38px;padding:0;justify-content:center}.spv .ars-ca .btn.pri{flex:1;padding-left:8px;padding-right:8px;justify-content:center;overflow:hidden;white-space:nowrap}
.spv .ars-main .sph-tit h1{font-size:clamp(28px,3vw,40px)}.spv .ars-ca .btn.pri{flex:1}
.spv .ars-novo{border:2px dashed var(--line,#cbd5e1);background:transparent;color:var(--mut,#5f6b76);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:240px;cursor:pointer;font:inherit}
.spv .ars-novo:hover{border-color:var(--acc,#127fa6);color:var(--acc,#127fa6)}.spv .ars-novo b{font-size:16px}.spv .ars-novo span{font-size:12.5px}
.spv .ars-row .arcapa img{width:100%;height:100%;object-fit:cover}
.spv .ars-side{display:flex;flex-direction:column;gap:12px;position:sticky;top:12px}
.spv .ars-p{background:var(--panel,#fff);border:1px solid var(--line,#dfe5eb);padding:12px 14px}
.spv .ars-p h3{display:flex;align-items:center;gap:7px;font-size:15px;margin:0 0 10px}.spv .ars-p h3 small{font-weight:400;color:var(--mut,#5f6b76);font-size:12px}
.spv .ars-vt{margin-left:auto;border:0;background:none;color:var(--acc,#127fa6);font:600 12.5px inherit;cursor:pointer;padding:0}
.spv .ars-vz{font-size:13px;margin:0}
.spv .ars-ct,.spv .ars-rv{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;border-top:1px solid var(--line,#eef2f6);background:none;color:inherit;padding:9px 2px;cursor:pointer;font:inherit}
.spv .ars-ct:first-of-type,.spv .ars-rv:first-of-type{border-top:0}
.spv .ars-ct:hover,.spv .ars-rv:hover{background:color-mix(in srgb,var(--acc,#127fa6) 6%,transparent)}
.spv .ars-ct>span:nth-child(2),.spv .ars-rv>span:nth-child(2){flex:1;min-width:0}
.spv .ars-ct b,.spv .ars-rv b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spv .ars-ct small,.spv .ars-rv small{display:block;font-size:12px;color:var(--mut,#5f6b76)}
.spv .ars-mini{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--cc);color:#fff;font-weight:800;font-size:13px}
.spv .ars-j{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line,#eef2f6)}.spv .ars-j:first-of-type{border-top:0}
.spv .ars-j>div{flex:1;min-width:0}.spv .ars-j b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.spv .ars-j small{display:block;font-size:12px;color:var(--mut,#5f6b76)}.spv .ars-j .ars-w{color:var(--ink,#334155)}
.spv .ars-jm{width:32px;height:32px;flex:none;display:flex;align-items:center;justify-content:center;font-size:16px;background:color-mix(in srgb,var(--mc) 16%,transparent)}
.spv .ars-sem{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;align-items:end;height:84px}
.spv .ars-sem div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;height:100%}
.spv .ars-sem i{width:100%;background:color-mix(in srgb,var(--acc,#127fa6) 45%,transparent);transition:height .4s}.spv .ars-sem i.h{background:var(--acc,#127fa6)}
.spv .ars-sem span{font-size:11px;color:var(--mut,#5f6b76);min-height:13px}.spv .ars-semt{font-size:12.5px;margin:6px 0 0}
.spv .ars-md{display:flex;align-items:center;gap:8px;padding:4px 0}.spv .ars-mdn{width:90px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.spv .ars-mdb{flex:1;height:8px;background:var(--line,#eef2f6)}.spv .ars-mdb i{display:block;height:100%}.spv .ars-md b{font-size:13px;min-width:18px;text-align:right}
.spv .ars-rvp{width:42px;height:42px;flex:none;display:flex;align-items:center;justify-content:center;font:800 12px inherit;color:#b91c1c;background:conic-gradient(#dc2626 calc(var(--p)*1%),color-mix(in srgb,#dc2626 15%,transparent) 0);-webkit-mask:radial-gradient(circle 14px,#0000 98%,#000);mask:radial-gradient(circle 14px,#0000 98%,#000)}
.spv .ars-rv{position:relative}
@media (max-width:1200px){.spv .ars-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1000px){.spv .ars-lay{grid-template-columns:1fr}.spv .ars-side{position:static;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}}
@media (max-width:560px){.spv .ars-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.spv .ars-grid{grid-template-columns:1fr 1fr}.spv .ars-capa{height:90px}.spv .ars-ca{gap:4px}}
/* ecrã projetado */
@media (min-width:1100px){#arhost .arhlv.com-feed{display:grid;grid-template-columns:minmax(0,1fr) 340px;column-gap:18px;align-items:start}
  #arhost .arhlv.com-feed>*{grid-column:1}#arhost .arhlv.com-feed>.arhqtop{grid-column:1/-1}#arhost .arhlv.com-feed>.arhfeed{grid-column:2;grid-row:2/span 6}}
#arhost .arhfeed{background:var(--surface,rgba(255,255,255,.06));border:var(--bw,1px) solid var(--line,rgba(255,255,255,.14));border-radius:var(--radius,12px);padding:14px;margin-top:12px;color:var(--ink,#f1f5f9)}
#arhost .arhfeed h3{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
#arhost .arhfeed h3 i{width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 0 #ef444499;animation:arsPulso 1.4s infinite}
@keyframes arsPulso{70%{box-shadow:0 0 0 8px #ef444400}100%{box-shadow:0 0 0 0 #ef444400}}
#arhost .arhfeed ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;min-height:120px}
#arhost .arhfeed li{display:flex;align-items:center;gap:9px;font-size:15px;line-height:1.3;padding:6px 8px;border-radius:calc(var(--radius,12px) - 4px);background:color-mix(in srgb,var(--ink,#fff) 5%,transparent)}
#arhost .arhfeed li.novo{animation:arsEntra .5s ease-out}
@keyframes arsEntra{from{opacity:0;transform:translateX(16px)}}
#arhost .arhfeed li.tira{border-left:4px solid #f59e0b}#arhost .arhfeed li.ganha{border-left:4px solid #16a34a}#arhost .arhfeed li.perde{border-left:4px solid #dc2626}
#arhost .arhfeed li.vz{opacity:.7;font-size:14px}
#arhost .arhtot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
#arhost .arhtot>div{background:color-mix(in srgb,var(--primary,#127fa6) 18%,transparent);border-radius:calc(var(--radius,12px) - 4px);padding:10px}
#arhost .arhtot span{display:block;font-size:12px;opacity:.8;text-transform:uppercase;letter-spacing:.05em}#arhost .arhtot b{display:block;font-size:26px;font-weight:800;line-height:1.15}#arhost .arhtot small{font-size:12px;opacity:.8}
#arhost .arhtot .arhlid{grid-column:1/-1;display:flex;align-items:center;gap:10px}#arhost .arhtot .arhlid b{font-size:18px}
`;document.head.appendChild(st)})();
