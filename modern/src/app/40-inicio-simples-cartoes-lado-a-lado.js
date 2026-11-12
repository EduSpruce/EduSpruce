/* ===================== Início simples: cartões lado a lado, redimensionáveis (puxar o canto) ===================== */
const INI_SP=[4,6,8,12];
function iniTamAplicar(){const m=$('#view .in-main');if(!m)return;m.classList.add('ingrid');const T0=S.cfg.iniTam||{};
  [...m.children].filter(c=>c.classList.contains('card')||/^w-/.test(c.id)).forEach(c=>{const k=c.dataset.ik||iniKey(c);const sp=iniLer(T0,k)||12;c.style.gridColumn='span '+sp;c.dataset.sp=sp;
    if(c.querySelector(':scope>.wgrs'))return;const h=document.createElement('button');h.type='button';h.className='wgrs';h.title='Puxar para mudar a largura (duplo clique alterna)';h.setAttribute('aria-label','Largura do cartão: '+sp+' de 12 colunas. Setas esquerda/direita mudam.');
    h.innerHTML='<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M11 4 4 11M11 8 8 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';c.appendChild(h);
    const set=sp=>{c.style.gridColumn='span '+sp;c.dataset.sp=sp;h.setAttribute('aria-label','Largura do cartão: '+sp+' de 12 colunas');S.cfg.iniTam=S.cfg.iniTam||{};for(const o in S.cfg.iniTam)if(o!==k&&iniLer({[o]:1},k))delete S.cfg.iniTam[o];if(sp===12)delete S.cfg.iniTam[k];else S.cfg.iniTam[k]=sp};
    h.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();try{h.setPointerCapture(e.pointerId)}catch(_){}
      const r=c.getBoundingClientRect();const col=(m.clientWidth+16)/12;const x0=e.clientX;document.body.classList.add('wgrsz');c.classList.add('wgrsing');
      const mv=ev=>{const w=r.width+(ev.clientX-x0);const want=Math.round((w+16)/col);const sp=INI_SP.reduce((a,b)=>Math.abs(b-want)<Math.abs(a-want)?b:a);if(+c.dataset.sp!==sp)set(sp)};
      const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);document.body.classList.remove('wgrsz');c.classList.remove('wgrsing');save()};
      h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
    h.addEventListener('dblclick',e=>{e.preventDefault();const i=INI_SP.indexOf(+c.dataset.sp);set(INI_SP[(i+1)%INI_SP.length]);save()});
    h.addEventListener('keydown',e=>{const i=INI_SP.indexOf(+c.dataset.sp);let n=i;if(e.key==='ArrowLeft')n=Math.max(0,i-1);else if(e.key==='ArrowRight')n=Math.min(INI_SP.length-1,i+1);else return;e.preventDefault();set(INI_SP[n]);save()})})}
{const _wp=wgPreparar;wgPreparar=function(){const r=_wp.apply(this,arguments);try{if(wgModo()==='simples')iniTamAplicar()}catch(e){console.warn(e)}return r}}
{const _wgG=wgGuardar;wgGuardar=function(){const r=_wgG.apply(this,arguments);try{if(wgModo()==='simples'){$$('#view .in-side>.card,#view .in-fav>.card').forEach(c=>{c.style.gridColumn='';const x=c.querySelector(':scope>.wgrs');if(x)x.remove()});iniTamAplicar()}}catch(_){}return r}}

/* ===================== Auditoria v0.38: contas coerentes, oralidade pendente, rede de segurança ===================== */
/* arredondamento único: a nota que se vê é a que decide positiva/negativa, nível e menção */
function _rdx(x,d){const m=Math.pow(10,d);return Math.round(+(x*m).toFixed(6))/m}
function notaDec(){return S.cfg.arred==null?1:+S.cfg.arred}
function pctCanon(t,f){if(f==null||!isFinite(f))return null;return isSec(t)?Math.round(+_rdx(f*20,notaDec()).toFixed(6))*5:_rdx(f*100,0)}
fmtNota=function(t,f){if(f==null||!isFinite(f))return '';const d=notaDec();return isSec(t)?_rdx(f*20,d).toFixed(d).replace('.',','):_rdx(f*100,0)+'%'};
nivel=function(t,f){const p=pctCanon(t,f);if(p==null)return '';if(isSec(t))return p/5;return p<20?1:p<50?2:p<70?3:p<90?4:5};
mencao=function(t,f){const p=pctCanon(t,f);if(p==null)return null;const M=t.mencoes||[];if(!M.length)return null;for(let i=0;i<M.length;i++)if(p<=+M[i].max)return {i,nome:M[i].nome};const l=M.length-1;return {i:l,nome:M[l].nome}};
/* itens de oralidade ainda sem grelha preenchida = pendentes (não contam como zero) */
const itPend=(n,it,i)=>(!!it.oralLig||!!(i&&i.branco!=='zero'))&&(!n||n[it.id]==null||n[it.id]==='');
function instPendentes(i,aid){const n=i.notas[aid];return i.itens.filter(it=>itPend(n,it,i))}
{const _iD=instDom;instDom=function(i,aid,dom){const r=_iD.apply(this,arguments);if(!r)return r;const n=i.notas[aid];const its=i.itens.filter(x=>x.dom===dom);const pend=its.filter(it=>itPend(n,it,i));if(!pend.length)return r;
  const ok=its.filter(it=>!itPend(n,it,i));const max=ok.reduce((s,x)=>s+(+x.cot||0),0);if(!max)return null;const pts=ok.reduce((s,x)=>s+(num(n[x.id])||0),0);return {pts,max,pct:pts/max,pend:pend.length}}}
{const _iT=instTotal;instTotal=function(i,aid){const r=_iT.apply(this,arguments);if(r==null)return r;const n=i.notas[aid];const pend=i.itens.filter(it=>itPend(n,it,i));if(!pend.length)return r;
  const M=instMax(i);const mOk=M-pend.reduce((s,x)=>s+(+x.cot||0),0);if(mOk<=0)return null;return r*M/mOk}}
/* análise: avisar quando há oralidade por classificar */
{const _iS=instStats;instStats=function(t,i){const r=_iS.apply(this,arguments);try{const al=alunosAval(t);const np=al.filter(a=>instAvaliado(i,a.id)&&instPendentes(i,a.id).length).length;
  if(np){const box=$('#i-body .stins');if(box)box.insertAdjacentHTML('afterbegin',`<div class="sti w">${ic('fala',15)}<span><b>${np} aluno${np>1?'s':''}</b> com a oralidade por classificar: a nota deste instrumento é calculada só com os itens já classificados. <button type="button" class="btn sm" id="st-oral">Abrir Grelha Oral</button></span></div>`);const b=$('#st-oral');if(b)b.onclick=()=>{UI.instTab='oral';vInstrumento(i.id)}}}catch(_){}return r}}
/* rede de segurança: uma vista com erro não bloqueia a app */
{const _gS=go;go=function(v){if(!TITLES[v]&&!(go._f&&go._f[v])&&!['oral','mra'].includes(v))v='inicio';try{return _gS.apply(this,[v,...[].slice.call(arguments,1)])}catch(e){console.error('[EduSpruce] erro na vista',v,e);
  try{const vw=$('#view');if(vw)vw.innerHTML=`<div class="card empty" role="alert">${ic('alert',30)}<br><b>Não foi possível abrir esta página</b><br><span class="mut">Os seus dados estão guardados. Tente de novo ou volte ao Início.</span><div class="mut" style="font-size:12px;margin-top:8px">${esc(String(e&&e.message||e).slice(0,160))}</div><div class="row" style="justify-content:center;gap:8px;margin-top:12px"><button class="btn pri" id="err-ini">${ic('home',15)} Início</button><button class="btn" id="err-rep">Tentar de Novo</button></div></div>`;
    const a=$('#err-ini');if(a)a.onclick=()=>go('inicio');const b=$('#err-rep');if(b)b.onclick=()=>go(v)}catch(_){}}}}
/* validação das classificações: só números entre 0 e a cotação do item */
document.addEventListener('focusin',e=>{const x=e.target;if(x&&x.matches&&x.matches('#grid input[data-i]'))x.dataset.prev=x.value},true);
document.addEventListener('change',e=>{const x=e.target;if(!x||!x.matches||!x.matches('#grid input[data-i]'))return;const t=T();const i=t&&t.instrumentos.find(z=>z.id===UI.inst);if(!i)return;const it=i.itens.find(z=>z.id===x.dataset.i);if(!it)return;
  const s=x.value.trim();if(s==='')return;const v=num(s);const c=+it.cot||0;let msg='';
  if(v==null||!/^-?\d+([.,]\d+)?$/.test(s))msg='“'+s+'” não é uma classificação válida';else if(v<0)msg='A classificação não pode ser negativa';else if(v>c+1e-9)msg='Máximo neste item: '+nf(c)+' pts';
  if(msg){x.value=x.dataset.prev||'';x.dispatchEvent(new Event('input',{bubbles:true}));x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),1600);toast(msg+' — valor anterior reposto','aviso')}},true);

/* lista de instrumentos em cartões no telemóvel */
{const _vIs=vInstrumentos;vInstrumentos=function(){const r=_vIs.apply(this,arguments);try{if(!UI.inst)$$('#view table.lst').forEach(tb=>{if(!tb.querySelector('[data-irow]'))return;tb.classList.add('instl');const H=[...tb.querySelectorAll('thead th')].map(h=>h.textContent.trim());tb.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,k)=>{if(k>0&&H[k])td.dataset.l=H[k]}))})}catch(_){}return r};if(go._f)go._f.instrumentos=vInstrumentos}


/* ===================== v0.39: apagar tudo a 100% · contexto só quando existe ===================== */
async function apagarTudo100(){
  const r=await avisoModal('Apagar TODOS os dados deste dispositivo?',['Anos letivos, turmas, alunos, fotografias, classificações, sumários, horários, documentos e evidências.','Escola, logótipo, professor, utilizadores e perfis, definições, temas e notas.','Cópias de segurança internas e o caixote do lixo. Esta ação não pode ser anulada.','A cópia na nuvem (OneDrive/Google Drive), se existir, não é apagada — apenas se desliga deste dispositivo.'],[{t:ic('download',15)+' Exportar Cópia Primeiro',v:'exp'},{t:ic('trash',15)+' Continuar',c:'dng',v:'sim'},{t:'Cancelar',v:null}]);
  if(r==='exp'){try{$('#bk-exp')?$('#bk-exp').click():toast('Use Definições › Dados e Segurança › Exportar','aviso')}catch(_){}return}
  if(r!=='sim')return;const w=prompt('Escreva APAGAR TUDO para confirmar:');if((w||'').trim().toUpperCase()!=='APAGAR TUDO')return toast('Nada foi apagado','aviso');
  window.__efApagar=true;const PG=apagProg();await PG.p(0);try{save=function(){};saveNow=function(){}}catch(_){}try{Storage.prototype.setItem=function(){};const _tx=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(n,m){if(m==='readwrite')throw new Error('apagado');return _tx.apply(this,arguments)};IDBFactory.prototype.open=function(){return {set onsuccess(f){},set onerror(f){},set onupgradeneeded(f){},addEventListener(){}}}}catch(_){}
  await PG.p(1);try{localStorage.clear()}catch(_){}try{sessionStorage.clear()}catch(_){}
  await PG.p(2);try{const L=indexedDB.databases?await indexedDB.databases():[{name:'edugest'}];await Promise.all([...L.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  await PG.p(3);try{if(window.caches){const K=await caches.keys();await Promise.all(K.map(k=>caches.delete(k)))}}catch(_){}
  await PG.p(4);try{if(navigator.serviceWorker){const R=await navigator.serviceWorker.getRegistrations();await Promise.all(R.map(x=>x.unregister()))}}catch(_){}
  await PG.p(5);try{document.cookie.split(';').forEach(c=>{const n=c.split('=')[0].trim();if(n)document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'})}catch(_){}
  await PG.fim();location.reload()}
addEventListener('beforeunload',e=>{if(window.__efApagar)e.stopImmediatePropagation()},true);
{const _vd=vDefinicoes;vDefinicoes=function(){const r=_vd.apply(this,arguments);try{const b=$('#bk-zero');if(b){const n=b.cloneNode(true);n.innerHTML=ic('trash',14)+' Apagar Tudo (100%)';b.replaceWith(n);n.onclick=apagarTudo100}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* barra: ano letivo e turma só aparecem quando existem */
{const _fc2=fillCtx;fillCtx=function(){const r=_fc2.apply(this,arguments);try{const temAno=!!(S.anos&&S.anos.length);const a=temAno&&A();const temT=!!(a&&a.turmas&&a.turmas.length);
  const ca=$('#ctxAno');if(ca)ca.style.display=temAno?'':'none';const st=$('#selTurma');const ct=st&&st.closest('.ctx');if(ct)ct.style.display=temT?'':'none';
  const be=$('#ctxEsc');if(be&&!temAno&&!(EC()||{}).escola)be.style.display='none';document.body.classList.toggle('semdados',!temAno);document.body.classList.toggle('semctx',!temT)}catch(_){}return r}}

/* ===================== v0.39: escalas de classificação e arredondamento configuráveis ===================== */
const CONV5_DEF=[19,49,69,89];
function escalaAuto(t){return t&&(t.ciclo==='sec'||t.oferta==='profij'||t.oferta==='profissional')?'20':'100'}
function escalaDe(t){if(!t)return '100';return t.escala==='20'||t.escala==='100'?t.escala:escalaAuto(t)}
function conv5(t){const v=(t&&Array.isArray(t.conv5)&&t.conv5.length===4)?t.conv5:(Array.isArray(S.cfg.conv5)&&S.cfg.conv5.length===4?S.cfg.conv5:CONV5_DEF);return v.map(Number)}
function arredModo(){return S.cfg.arredModo||'normal'}
/* arredondamento com modo (normal = meio para cima; cima; baixo) */
_rdx=function(x,d){const m=Math.pow(10,d);const y=+(x*m).toFixed(6);const md=arredModo();return (md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y))/m};
function _rint(x){const y=+(+x).toFixed(6);const md=arredModo();return md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y)}
pctCanon=function(t,f){if(f==null||!isFinite(f))return null;return isSec(t)?_rint(_rdx(f*20,notaDec()))*5:_rint(f*100)};
nivel=function(t,f){const p=pctCanon(t,f);if(p==null)return '';if(isSec(t))return p/5;const c=conv5(t);for(let k=0;k<4;k++)if(p<=c[k])return k+1;return 5};
fmtNota=function(t,f){if(f==null||!isFinite(f))return '';const d=notaDec();return isSec(t)?_rdx(f*20,d).toFixed(d).replace('.',','):_rint(f*100)+'%'};
/* cartão nos Critérios */
function cartaoEscala(t){const e=escalaDe(t),au=escalaAuto(t);const c=conv5(t);const lim=[0,...c.map(x=>x+1)];const prop=!!t.conv5;
  return `<div class="card esccl" id="esc-card"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sliders',18)} Escala de Classificação</h2><span class="tag ${e==='20'?'pri':'ok'}">${e==='20'?'0 a 20 valores':'0–100% · níveis 1 a 5'}</span></div>
    <p class="hint" style="margin:6px 0 10px">Secundário e PROFIJ/profissional: testes e nota final de 0 a 20. 3.º ciclo: testes em percentagem (0–100%) e nível final de 1 a 5, segundo a tabela abaixo.</p>
    <div class="seg" role="group" aria-label="Escala">${[['','Automática ('+(au==='20'?'0–20':'0–100% / 1–5')+')'],['20','0 a 20 Valores'],['100','0–100% e Níveis 1–5']].map(([v,l])=>`<button type="button" data-esc="${v}" class="${(t.escala||'')===v?'on':''}">${l}</button>`).join('')}</div>
    ${e==='100'?`<div class="convt"><div class="convh"><b>Conversão da percentagem em nível</b>${prop?'<span class="tag">própria desta turma</span>':'<span class="tag">da escola</span>'}</div>
      <div class="convg">${[1,2,3,4,5].map(n=>`<div class="convc n${n}"><span class="convn">${n}</span><span class="convr">${lim[n-1]}% a ${n<5?`<input type="number" min="0" max="99" data-conv="${n-1}" value="${c[n-1]}" aria-label="Limite superior do nível ${n}">`:'100'}%</span></div>`).join('')}</div>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn sm" id="conv-esc">${ic('layers',13)} Usar em Todas as Turmas</button><button type="button" class="btn sm" id="conv-rep">${ic('refresh',13)} Repor Oficial (0–19 · 20–49 · 50–69 · 70–89 · 90–100)</button></div></div>`:''}
    ${blocoArred(t)}</div>`}
function _arrV(v,d,md){const k=Math.pow(10,d);const y=+(v*k).toFixed(6);return (md==='cima'?Math.ceil(y):md==='baixo'?Math.floor(y):Math.round(y))/k}
function arrSimular(t,pc){const sec=isSec(t);const md=arredModo(),d=notaDec();const f=pc/100;const passos=[];if(sec){const v=f*20;const n=_arrV(v,d,md);const fin=_arrV(n,0,md);passos.push(['Resultado',nf(pc,2)+'%'],['Em valores',nf(v,3)],['Nota mostrada ('+['unidades','décimas','centésimas'][d]+')',n.toFixed(d).replace('.',',')],['Classificação final',String(fin)]);return {passos,pos:fin>=10,txt:fin>=10?'Positiva':'Negativa'}}
  const q=_arrV(pc,0,md);const c=conv5(t);let nv=5;for(let k=0;k<4;k++)if(q<=c[k]){nv=k+1;break}passos.push(['Resultado',nf(pc,2)+'%'],['Percentagem mostrada',q+'%'],['Nível',String(nv)]);return {passos,pos:nv>=3,txt:nv>=3?'Positivo':'Negativo'}}
function blocoArred(t){const sec=isSec(t);const d=notaDec(),md=arredModo();const ex=14.275,exr=14.25;
  const opD=[[0,'Unidades','Sem casas decimais'],[1,'Décimas','Uma casa decimal'],[2,'Centésimas','Duas casas decimais']];
  const opM=[['normal','Normal','5 ou mais sobe, abaixo de 5 desce'],['cima','Sempre para cima','Qualquer fração sobe'],['baixo','Sempre para baixo','Qualquer fração é cortada']];
  const sim=arrSimular(t,+(UI.arrSim??47.25));
  return `<div class="convt arrb"><div class="convh"><b>${ic('sliders',15)} Arredondamento</b><span class="tag">todas as turmas</span><span class="sp1"></span><span class="mut" style="font-size:12.5px">A nota que se vê é a que decide positiva/negativa, ${sec?'a classificação final':'o nível e a menção'}.</span></div>
    <div class="arrg"><section><h3>Casas decimais das notas <small>(turmas 0–20)</small></h3><div class="arro" role="radiogroup" aria-label="Casas decimais">${opD.map(([v,l,dsc])=>`<button type="button" role="radio" aria-checked="${d===v}" data-arrd="${v}" class="${d===v?'on':''}"><b>${l}</b><small>${dsc}</small><span class="arrx">${nf(ex,3)} → <i>${_arrV(ex,v,md).toFixed(v).replace('.',',')}</i></span></button>`).join('')}</div></section>
      <section><h3>Regra de arredondamento</h3><div class="arro" role="radiogroup" aria-label="Regra">${opM.map(([v,l,dsc])=>`<button type="button" role="radio" aria-checked="${md===v}" data-arrm="${v}" class="${md===v?'on':''}"><b>${l}</b><small>${dsc}</small><span class="arrx">${nf(exr,2)} → <i>${_arrV(exr,1,v).toFixed(1).replace('.',',')}</i> · ${nf(exr,2).replace(/,\d+/,',75')} → <i>${_arrV(14.75,0,v)}</i></span></button>`).join('')}</div></section></div>
    <div class="arrsim"><label for="arr-sim">${ic('target',14)} Experimentar</label><span class="arrin"><input id="arr-sim" type="number" min="0" max="100" step="0.01" value="${UI.arrSim??47.25}" inputmode="decimal"><span>%</span></span><div class="arrp" id="arr-p">${arrPassos(sim)}</div></div></div>`}
function arrPassos(sim){return sim.passos.map(([l,v],k)=>`${k?'<span class="arrse">→</span>':''}<span class="arrps"><small>${esc(l)}</small><b>${esc(v)}</b></span>`).join('')+`<span class="tag ${sim.pos?'ok':'bad'}" style="margin-left:6px">${sim.txt}</span>`}
function bindEscala(t){const c=$('#esc-card');if(!c)return;const re=()=>manterPosicao(vCriterios);
  const sm=c.querySelector('#arr-sim');if(sm)sm.oninput=()=>{const v=Math.max(0,Math.min(100,+String(sm.value).replace(',','.')||0));UI.arrSim=v;const p=c.querySelector('#arr-p');if(p)p.innerHTML=arrPassos(arrSimular(t,v))};
  c.querySelectorAll('[data-esc]').forEach(b=>b.onclick=()=>{const v=b.dataset.esc;if(v)t.escala=v;else delete t.escala;save();re()});
  c.querySelectorAll('[data-conv]').forEach(i=>i.onchange=()=>{const v=conv5(t).slice();const k=+i.dataset.conv;const n=Math.round(+i.value);const lo=k?v[k-1]+1:0,hi=k<3?v[k+1]-1:99;
    if(!(n>=lo&&n<=hi)){toast(`O limite do nível ${k+1} tem de estar entre ${lo}% e ${hi}%`,'aviso');i.value=v[k];return}v[k]=n;t.conv5=v;save();re()});
  const ce=$('#conv-esc');if(ce)ce.onclick=()=>{S.cfg.conv5=conv5(t);A().turmas.forEach(x=>delete x.conv5);save();toast('Tabela aplicada a todas as turmas','ok');re()};
  const cr=$('#conv-rep');if(cr)cr.onclick=()=>{delete t.conv5;if(!confirm('Repor também a tabela da escola para a oficial?')){save();return re()}delete S.cfg.conv5;save();re()};
  c.querySelectorAll('[data-arrd]').forEach(b=>b.onclick=()=>{S.cfg.arred=+b.dataset.arrd;save();re()});
  c.querySelectorAll('[data-arrm]').forEach(b=>b.onclick=()=>{S.cfg.arredModo=b.dataset.arrm;save();re()})}
{const _vc=vCriterios;vCriterios=function(){const r=_vc.apply(this,arguments);try{const t=T();const v=$('#view');const first=v.querySelector('.card');if(first)first.insertAdjacentHTML('afterend',cartaoEscala(t));bindEscala(t)}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}

/* ===================== v0.39: «A Decorrer» (intercalar / interrupção) com barra de progresso ===================== */
function emCurso(a){if(!a)return [];const hj=isoHoje();const L=[];try{datasImportantes(a,0).forEach(x=>{if(x.ini<=hj&&x.fim>=hj&&x.fim>x.ini&&(x.tipo==='interrupcao'||x.tipo==='aval'))L.push(x)})}catch(_){}
  const c=a.calendario;if(c)c.periodos.forEach(p=>{if(p.ini<=hj&&p.fim>=hj)L.push({ini:p.ini,fim:p.fim,t:p.n+'.º '+(c.periodos.length===2?'Semestre':'Período'),s:'',tipo:'periodo',cor:'#0a5aa8'})});return L}
function cartaoEmCurso(a){const L=emCurso(a);const esp=L.filter(x=>x.tipo!=='periodo');if(!esp.length)return '';const hj=dataDeIso(isoHoje());
  return `<div class="card emcurso" id="w-curso"><div class="row"><h2 style="margin:0">${ic('clock',18)} A Decorrer</h2></div>${esp.map(x=>{const i=dataDeIso(x.ini),f=dataDeIso(x.fim);const tot=Math.round((f-i)/864e5)+1;const dia=Math.min(tot,Math.round((hj-i)/864e5)+1);const pc=Math.round(dia/tot*100);const falta=tot-dia;
    return `<div class="ecx" style="--c:${x.cor||'#7c3aed'}"><div class="ecxh"><b>${esc(x.t)}</b><span class="mut">${esc(fmtIso(x.ini))} → ${esc(fmtIso(x.fim))}</span></div>
      <div class="ecbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}" aria-label="${esc(x.t)}: ${pc}%"><i style="width:${pc}%"></i></div>
      <div class="ecxf"><span>Dia <b>${dia}</b> de ${tot}</span><span>${falta?`termina daqui a <b>${falta}</b> dia${falta>1?'s':''}`:'<b>termina hoje</b>'}</span></div>${x.s?`<small class="mut">${esc(x.s)}</small>`:''}</div>`}).join('')}</div>`}
{const _vI=vInicio;vInicio=function(){const r=_vI.apply(this,arguments);try{const a=A();const h=cartaoEmCurso(a);if(h&&!$('#w-curso')){const side=$('#view .in-side');const dg=$('#view .dgrps,#view .dgrid');if(side)side.insertAdjacentHTML('afterbegin',h);else if(dg)dg.insertAdjacentHTML('beforebegin',h);try{iniAplicar()}catch(_){}requestAnimationFrame(()=>{try{wgPreparar()}catch(_){}})}}catch(e){console.warn(e)}return r};if(go._f)go._f.inicio=vInicio}

/* ===================== Notas flutuantes (em qualquer ecrã, desligáveis) ===================== */
const NF_CORES=['#fde68a','#bbf7d0','#bfdbfe','#fbcfe8','#ddd6fe','#fed7aa'];
const nfL=()=>S.cfg.notasF=S.cfg.notasF||[];
const nfOn=()=>S.cfg.notasOn!==false;
function nfRender(forcar){let L=$('#nflayer');if(!L){L=document.createElement('div');L.id='nflayer';document.body.appendChild(L)}let fab=$('#nffab');
  if(!fab){fab=document.createElement('button');fab.id='nffab';fab.type='button';fab.title='Notas flutuantes';fab.setAttribute('aria-label','Notas flutuantes');fab.innerHTML=ic('pencil',18)+'<span class="nfc"></span>';document.body.appendChild(fab);fab.onclick=nfMenu}
  const on=nfOn();fab.hidden=!on||document.body.classList.contains('login-on');L.hidden=!on;if(!on){L.innerHTML='';L.dataset.sig='';return}
  const v=go._ult||'inicio';const vis=nfL().filter(n=>!n.vista||n.vista===v);fab.querySelector('.nfc').textContent=vis.length||'';
  /* não redesenhar enquanto se escreve ou arrasta: a nota perderia o cursor */
  const sig=v+'|'+vis.map(n=>[n.id,n.min?1:0,n.vista||'',n.cor||''].join(':')).join(',');const ocupado=L.querySelector('.nf.drag')||(document.activeElement&&document.activeElement.tagName==='TEXTAREA'&&document.activeElement.closest('#nflayer'));
  if(!forcar&&L.dataset.sig===sig){vis.forEach(n=>{const el=L.querySelector(`[data-nf="${n.id}"]`);if(!el||el.classList.contains('drag'))return;nfCaber(n);el.style.left=n.x+'px';el.style.top=n.y+'px';const ta=el.querySelector('textarea');if(ta&&document.activeElement!==ta&&ta.value!==(n.txt||''))ta.value=n.txt||''});return}
  if(!forcar&&ocupado&&L.dataset.sig){clearTimeout(nfRender._t);nfRender._t=setTimeout(()=>nfRender(),1200);return}
  L.dataset.sig=sig;vis.forEach(nfCaber);
  L.innerHTML=vis.map(n=>`<div class="nf ${n.min?'min':''}" data-nf="${n.id}" style="left:${n.x}px;top:${n.y}px;width:${n.w||230}px;${n.min?'':`height:${n.h||180}px;`}--nf:${n.cor||NF_CORES[0]}" role="note">
    <div class="nfh" title="Arraste para mover · toque duas vezes para minimizar"><span class="nfv" title="${n.vista?'Só nesta página':'Em todas as páginas'}">${n.vista?esc(TITLES[n.vista]||n.vista):'Todas as páginas'}</span><span class="sp1"></span>
      <button type="button" data-nfc title="Cor" aria-label="Mudar a cor">●</button><button type="button" data-nfp title="${n.vista?'Mostrar em todas as páginas':'Só nesta página'}" aria-label="Âmbito">${n.vista?'⤢':'📌'}</button><button type="button" data-nfm title="${n.min?'Expandir':'Minimizar'}" aria-label="${n.min?'Expandir':'Minimizar'}">${n.min?'▢':'–'}</button><button type="button" data-nfx title="Apagar" aria-label="Apagar nota">✕</button></div>
    ${n.min?`<div class="nfmin">${esc((n.txt||'Nota').split('\n')[0].slice(0,40))}</div>`:`<textarea aria-label="Texto da nota" placeholder="Escreva aqui…" spellcheck="true">${esc(n.txt||'')}</textarea><span class="nfgrip" aria-hidden="true" title="Arraste para redimensionar"></span>`}</div>`).join('');
  L.querySelectorAll('[data-nf]').forEach(el=>{const n=nfL().find(x=>x.id===el.dataset.nf);if(!n)return;
    const frente=()=>{if(L.lastElementChild!==el&&!el.contains(document.activeElement)){const A=nfL();const i=A.indexOf(n);if(i>=0&&i<A.length-1){A.splice(i,1);A.push(n)}L.appendChild(el);L.dataset.sig=''}};
    el.addEventListener('pointerdown',e=>{if(!e.target.closest('textarea,button'))frente()});
    const ta=el.querySelector('textarea');if(ta){ta.oninput=()=>{n.txt=ta.value;save()};['keydown','keyup','keypress'].forEach(t=>ta.addEventListener(t,e=>e.stopPropagation()))}
    const gr=el.querySelector('.nfgrip');if(gr)gr.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const w0=el.offsetWidth,h0=el.offsetHeight,x0=e.clientX,y0=e.clientY;try{gr.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('drag');
      const mv=ev=>{n.w=Math.round(Math.max(170,Math.min(innerWidth-n.x-6,w0+ev.clientX-x0)));n.h=Math.round(Math.max(110,Math.min(innerHeight-n.y-6,h0+ev.clientY-y0)));el.style.width=n.w+'px';el.style.height=n.h+'px'};
      const up=()=>{gr.removeEventListener('pointermove',mv);gr.removeEventListener('pointerup',up);gr.removeEventListener('pointercancel',up);el.classList.remove('drag');save()};gr.addEventListener('pointermove',mv);gr.addEventListener('pointerup',up);gr.addEventListener('pointercancel',up)});
    el.querySelector('[data-nfx]').onclick=()=>{if((n.txt||'').trim()&&!confirm('Apagar esta nota?'))return;S.cfg.notasF=nfL().filter(x=>x!==n);save();nfRender(true)};
    const minT=()=>{n.min=!n.min;save();nfRender(true)};el.querySelector('[data-nfm]').onclick=minT;
    el.querySelector('[data-nfp]').onclick=()=>{n.vista=n.vista?null:(go._ult||'inicio');save();nfRender(true);toast(n.vista?'Nota só nesta página':'Nota em todas as páginas','ok')};
    el.querySelector('[data-nfc]').onclick=()=>{n.cor=NF_CORES[(NF_CORES.indexOf(n.cor)+1)%NF_CORES.length];el.style.setProperty('--nf',n.cor);L.dataset.sig='';save()};
    const h=el.querySelector('.nfh');let ult=0;const mn=el.querySelector('.nfmin');if(mn)mn.onclick=minT;
    h.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();const agora=Date.now();if(agora-ult<350){ult=0;return minT()}ult=agora;const x0=e.clientX-n.x,y0=e.clientY-n.y;let mexeu=false;try{h.setPointerCapture(e.pointerId)}catch(_){}
      const mv=ev=>{if(!mexeu&&Math.abs(ev.clientX-x0-n.x)+Math.abs(ev.clientY-y0-n.y)<4)return;mexeu=true;el.classList.add('drag');n.x=Math.round(Math.max(0,Math.min(innerWidth-el.offsetWidth,ev.clientX-x0)));n.y=Math.round(Math.max(0,Math.min(innerHeight-44,ev.clientY-y0)));el.style.left=n.x+'px';el.style.top=n.y+'px'};
      const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);el.classList.remove('drag');if(mexeu)save()};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)})})}
/* mantém a nota dentro do ecrã (mudança de aparelho, rotação, janela mais pequena) */
function nfCaber(n){const W=innerWidth,H=innerHeight;n.w=Math.max(170,Math.min(n.w||230,W-12));n.h=Math.max(110,Math.min(n.h||180,H-60));n.x=Math.round(Math.max(0,Math.min(n.x||0,W-n.w-4)));n.y=Math.round(Math.max(0,Math.min(n.y||0,H-(n.min?44:Math.min(n.h,H-8))-4)))}
function nfNova(){const L=nfL();const k=L.length%6;L.push({id:uid(),txt:'',cor:NF_CORES[k],x:Math.max(20,innerWidth-300-k*24),y:110+k*28,w:230,h:180,vista:null});save();nfRender(true);const ta=$('#nflayer [data-nf]:last-child textarea');if(ta)ta.focus()}
function nfMenu(){if(!nfL().length)return nfNova();const b=$('#nffab').getBoundingClientRect();const todasMin=nfL().every(n=>n.min);menuContexto(b.left-200,b.top-200,[{t:'Nova Nota',ic:'plus',f:nfNova},{t:todasMin?'Expandir Todas':'Minimizar Todas',ic:'layers',f:()=>{nfL().forEach(n=>n.min=!todasMin);save();nfRender(true)}},{t:'Arrumar no Ecrã',ic:'grid',f:()=>{nfL().forEach((n,k)=>{n.x=innerWidth-(n.w||230)-24-(k%4)*28;n.y=100+(k%8)*40});save();nfRender(true)}},{t:'Desligar Notas Flutuantes',ic:'x',f:()=>{S.cfg.notasOn=false;save();nfRender(true);toast('Notas desligadas — volte a ligá-las em Definições','aviso')}}])}
addEventListener('keydown',e=>{if(e.altKey&&(e.key==='n'||e.key==='N')&&nfOn()){e.preventDefault();nfNova()}});
addEventListener('resize',()=>{clearTimeout(nfRender._r);nfRender._r=setTimeout(()=>{try{nfRender()}catch(_){}},150)});
{const _gN=go;go=function(v){const r=_gN.apply(this,arguments);try{nfRender()}catch(_){}return r}}
{const _vdN=vDefinicoes;vDefinicoes=function(){const r=_vdN.apply(this,arguments);try{const host=(UI.defTab||'geral')==='aparencia'&&$('#view .card');if(host&&!$('#nf-cfg'))host.insertAdjacentHTML('afterend',`<div class="card" id="nf-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('pencil',18)} Notas Flutuantes</h2><span class="sp1"></span><label class="tgl"><input type="checkbox" id="nf-on" ${nfOn()?'checked':''}> Mostrar o botão e as notas</label></div><p class="hint" style="margin:6px 0 0">Post-its que ficam por cima de qualquer página. Cada nota pode estar em todas as páginas ou só numa. Atalho: <kbd>Alt</kbd>+<kbd>N</kbd>. ${nfL().length} nota${nfL().length!==1?'s':''} guardada${nfL().length!==1?'s':''}.</p></div>`);const c=$('#nf-on');if(c)c.onchange=()=>{S.cfg.notasOn=c.checked;save();nfRender()}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}

/* ===================== Ícone próprio da EduSpruce ===================== */
ICONS.flow='<path d="M4.5 7.2c2.6-1.3 5.1-1.2 7.5.6v11c-2.4-1.8-4.9-1.9-7.5-.6z" fill="currentColor" fill-opacity=".18"/><path d="M19.5 7.2c-2.6-1.3-5.1-1.2-7.5.6v11c2.4-1.8 4.9-1.9 7.5-.6z" fill="currentColor" fill-opacity=".32"/><path d="M4.5 7.2c2.6-1.3 5.1-1.2 7.5.6 2.4-1.8 4.9-1.9 7.5-.6v11c-2.6-1.3-5.1-1.2-7.5.6-2.4-1.8-4.9-1.9-7.5-.6z"/><path d="M8 3.6c1.4 1.5 2.8 1.6 4 .4s2.6-1.1 4 .4" stroke-width="2.1"/>';
{const fx=()=>$$('[data-ico="flow"]').forEach(s=>s.innerHTML=ic('flow',22));fx();const _gI=go;go=function(v){const r=_gI.apply(this,arguments);try{fx()}catch(_){}return r}}

/* ===================== v0.39: evidências por aluno e momento (fotografia, áudio, ficheiro) ===================== */
const EV_DB='eduflow-ev';
function evDb(){return evDb._p=evDb._p||new Promise((ok,ko)=>{const q=indexedDB.open(EV_DB,1);q.onupgradeneeded=()=>{const s=q.result.createObjectStore('ev',{keyPath:'id'});s.createIndex('k','k')};q.onsuccess=()=>ok(q.result);q.onerror=()=>ko(q.error)})}
async function evTx(modo,f){const db=await evDb();return new Promise((ok,ko)=>{const tx=db.transaction('ev',modo);const st=tx.objectStore('ev');let r;Promise.resolve(f(st)).then(x=>r=x);tx.oncomplete=()=>ok(r);tx.onerror=()=>ko(tx.error)})}
const evKey=(t,instId,aid)=>t.id+'|'+instId+'|'+aid;
function evLista(t,instId,aid){return evTx('readonly',st=>new Promise(ok=>{const q=st.index('k').getAll(evKey(t,instId,aid));q.onsuccess=()=>ok(q.result.sort((a,b)=>a.q-b.q))}))}
function evConta(t,instId,aid){return ((t.evid||{})[instId]||{})[aid]||0}
function evSetConta(t,instId,aid,n){t.evid=t.evid||{};t.evid[instId]=t.evid[instId]||{};if(n>0)t.evid[instId][aid]=n;else delete t.evid[instId][aid];save()}
async function evGuardar(t,instId,aid,blob,nome,tipo){const id=uid()+Math.random().toString(36).slice(2,5);await evTx('readwrite',st=>st.put({id,k:evKey(t,instId,aid),t:t.id,inst:instId,aluno:aid,tipo,nome:nome||'',mime:blob.type,tam:blob.size,q:Date.now(),blob}));const L=await evLista(t,instId,aid);evSetConta(t,instId,aid,L.length);return id}
async function evApagar(t,instId,aid,id){await evTx('readwrite',st=>st.delete(id));const L=await evLista(t,instId,aid);evSetConta(t,instId,aid,L.length)}
function evReduzir(file,max=1800,q=.82){return new Promise(ok=>{if(!/^image\/(jpe?g|png|webp|heic|heif)/i.test(file.type))return ok(file);const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height));if(s>=1&&file.size<1.5e6){URL.revokeObjectURL(u);return ok(file)}const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>ok(b||file),'image/jpeg',q)};im.onerror=()=>{URL.revokeObjectURL(u);ok(file)};im.src=u})}
const evTam=b=>b<1024?b+' B':b<1048576?Math.round(b/1024)+' KB':(b/1048576).toFixed(1).replace('.',',')+' MB';
let _evRec=null;
async function evAbrir(t,instId,aid,opc){opc=opc||{};const i=t.instrumentos.find(x=>x.id===instId);const a=t.alunos.find(x=>x.id===aid);if(!i||!a)return;
  const urls=[];const render=async()=>{urls.forEach(u=>URL.revokeObjectURL(u));urls.length=0;let L=[];try{L=await evLista(t,instId,aid)}catch(e){toast('Não foi possível abrir as evidências neste navegador','erro');return}
    const it=x=>{const u=URL.createObjectURL(x.blob);urls.push(u);const dt=new Date(x.q).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
      return `<div class="evi" data-ev="${x.id}">${x.tipo==='foto'?`<a href="${u}" target="_blank" rel="noopener" class="evth"><img src="${u}" alt="Fotografia de ${esc(a.nome)}"></a>`:x.tipo==='audio'?`<div class="evau">${ic('mic',20)}<audio controls preload="metadata" src="${u}"></audio></div>`:`<a class="evfi" href="${u}" download="${esc(x.nome||'evidencia')}">${ic('file',22)}<span>${esc(x.nome||'Ficheiro')}</span></a>`}
        <div class="evm"><span>${x.tipo==='foto'?'Fotografia':x.tipo==='audio'?'Áudio':'Ficheiro'} · ${dt} · ${evTam(x.tam||0)}</span><span class="sp1"></span><a class="btn sm ico" href="${u}" download="${esc((a.nome.split(' ')[0]||'aluno')+'_'+i.nome+'_'+x.id)}${x.tipo==='foto'?'.jpg':x.tipo==='audio'?(/mp4|m4a|aac/.test(x.mime)?'.m4a':'.webm'):''}" aria-label="Descarregar">${ic('download',13)}</a><button type="button" class="btn sm ico dng" data-evx="${x.id}" aria-label="Apagar">${ic('trash',13)}</button></div></div>`};
    const podeRec=!!(navigator.mediaDevices&&window.MediaRecorder);
    openDrawer('Evidências — '+a.nome,`<div class="evw"><p class="mut" style="margin:0 0 10px">${esc(i.nome)} · ${esc(t.nome)} · ${esc(t.disciplina)}</p>
      <div class="evbt"><label class="btn pri evcam">${ic('camera',16)} Fotografar<input type="file" accept="image/*" capture="environment" id="ev-cam" hidden></label>
        <label class="btn">${ic('image',16)} Carregar Fotografias / Ficheiros<input type="file" accept="image/*,audio/*,application/pdf,.doc,.docx" multiple id="ev-up" hidden></label>
        ${podeRec?`<button type="button" class="btn ${opc.audio?'pri':''}" id="ev-rec">${ic('mic',16)} Gravar Áudio</button>`:''}<label class="btn">${ic('headphones',16)} Carregar Áudio<input type="file" accept="audio/*" capture id="ev-aud" hidden></label></div>
      <div id="ev-recbox" hidden class="evrec"><span class="evdot"></span><b id="ev-rect">00:00</b><span class="mut">a gravar…</span><span class="sp1"></span><button type="button" class="btn sm" id="ev-pausa">${ic('pause',13)} Pausa</button><button type="button" class="btn sm pri" id="ev-stop">${ic('check',13)} Terminar</button><button type="button" class="btn sm" id="ev-canc">Cancelar</button></div>
      <div class="evl">${L.length?L.map(it).join(''):`<div class="empty" style="padding:22px">${ic('camera',26)}<br>Ainda sem evidências deste aluno neste momento de avaliação.</div>`}</div>
      <p class="hint" style="margin-top:10px">${ic('shield',13)} As evidências ficam guardadas só neste dispositivo (dados de menores, RGPD). Não são enviadas para a nuvem nem incluídas na cópia de segurança JSON.</p></div>`);
    const add=async(files,tipoF)=>{let n=0;for(const f of files){try{const tipo=tipoF||(/^image\//.test(f.type)?'foto':/^audio\//.test(f.type)?'audio':'ficheiro');const b=tipo==='foto'?await evReduzir(f):f;if(b.size>60e6){toast(f.name+': demasiado grande (máx. 60 MB)','aviso');continue}await evGuardar(t,instId,aid,b,f.name,tipo);n++}catch(e){toast('Não foi possível guardar '+(f.name||'o ficheiro')+': '+e.message,'erro')}}if(n)toast(n+' evidência'+(n>1?'s':'')+' guardada'+(n>1?'s':''),'ok');render();evBadges()};
    $('#ev-cam').onchange=e=>add([...e.target.files],'foto');$('#ev-up').onchange=e=>add([...e.target.files]);$('#ev-aud').onchange=e=>add([...e.target.files],'audio');
    $$('#dw-b [data-evx]').forEach(b=>b.onclick=async()=>{if(!confirm('Apagar esta evidência?'))return;await evApagar(t,instId,aid,b.dataset.evx);render();evBadges()});
    const rb=$('#ev-rec');if(rb)rb.onclick=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';const mr=new MediaRecorder(st,mt?{mimeType:mt}:undefined);const ch=[];let t0=Date.now(),acc=0,canc=false;
      _evRec={mr,st};mr.ondataavailable=e=>e.data.size&&ch.push(e.data);mr.onstop=async()=>{st.getTracks().forEach(x=>x.stop());clearInterval(tm);_evRec=null;$('#ev-recbox').hidden=true;rb.hidden=false;if(canc||!ch.length)return;const blob=new Blob(ch,{type:mr.mimeType||'audio/webm'});await evGuardar(t,instId,aid,blob,'Gravação '+new Date().toLocaleString('pt-PT'),'audio');toast('Gravação guardada','ok');render();evBadges()};
      mr.start(1000);rb.hidden=true;$('#ev-recbox').hidden=false;const tm=setInterval(()=>{const s=Math.floor((acc+(mr.state==='recording'?Date.now()-t0:0))/1000);$('#ev-rect').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},250);
      $('#ev-stop').onclick=()=>mr.stop();$('#ev-canc').onclick=()=>{canc=true;mr.stop()};$('#ev-pausa').onclick=e=>{if(mr.state==='recording'){mr.pause();acc+=Date.now()-t0;e.currentTarget.innerHTML=ic('play',13)+' Continuar'}else{mr.resume();t0=Date.now();e.currentTarget.innerHTML=ic('pause',13)+' Pausa'}}}
      catch(e){toast('Sem acesso ao microfone: '+(e.message||e)+'. Pode carregar um ficheiro de áudio.','erro')}}};
  await render()}
{const _cd=closeDrawer;closeDrawer=function(){try{if(_evRec){_evRec.mr.stop()}}catch(_){}return _cd.apply(this,arguments)}}
function evBadges(){const t=T();if(!t)return;$$('[data-evb]').forEach(b=>{const [inst,aid]=b.dataset.evb.split('|');const n=evConta(t,inst,aid);b.classList.toggle('tem',n>0);b.querySelector('i').textContent=n||''})}
const evBtn=(i,a,audio)=>`<button type="button" class="evb" data-evb="${i.id}|${a.id}" ${audio?'data-eva="1"':''} title="Evidências (fotografias, áudio)" aria-label="Evidências de ${esc(a.nome)}">${ic(audio?'mic':'camera',14)}<i></i></button>`;
{const _iN=instNotas;instNotas=function(t,i){const r=_iN.apply(this,arguments);try{$$('#grid tbody tr[data-a]').forEach(tr=>{const a=t.alunos.find(x=>x.id===tr.dataset.a);const c=tr.querySelector('.stk')||tr.children[1];if(a&&c&&!c.querySelector('.evb'))c.insertAdjacentHTML('beforeend',evBtn(i,a))});
  $$('#grid [data-evb]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [inst,aid]=b.dataset.evb.split('|');evAbrir(t,inst,aid)});evBadges()}catch(e){console.warn(e)}return r}}
{const _oE=oralEmbed;oralEmbed=function(t,i){const r=_oE.apply(this,arguments);try{$$('#i-body .oretb tbody tr').forEach(tr=>{const b=tr.querySelector('[data-oen]');if(!b)return;const aid=b.dataset.oen.split('|')[0];const a=t.alunos.find(x=>x.id===aid);const c=tr.querySelector('.nm .oral-al');if(a&&c&&!tr.querySelector('.evb'))c.insertAdjacentHTML('beforeend',evBtn(i,a,true))});
  $$('#i-body [data-evb]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [inst,aid]=b.dataset.evb.split('|');evAbrir(t,inst,aid,{audio:true})});evBadges()}catch(e){console.warn(e)}return r}}
{const _vO=vOral;vOral=function(){const r=_vO.apply(this,arguments);try{const t=T();if(!t||!UI.oralAberta)return r;const o=oralM(t);let inst=o.inst;if(!inst)return r;const i=t.instrumentos.find(x=>x.id===inst);if(!i)return r;
  $$('#view tr[data-ora]').forEach(tr=>{const a=t.alunos.find(x=>x.id===tr.dataset.ora);const c=tr.querySelector('.oral-al');if(a&&c&&!tr.querySelector('.evb'))c.insertAdjacentHTML('beforeend',evBtn(i,a,true))});
  $$('#view [data-evb]').forEach(b=>b.onclick=e=>{e.stopPropagation();const [ins,aid]=b.dataset.evb.split('|');evAbrir(t,ins,aid,{audio:true})});evBadges()}catch(e){console.warn(e)}return r}}

/* ===================== v0.39: Painel da Turma (dashboard por turma) ===================== */
TITLES.painel='Painel da Turma';NEEDS_T.push('painel');
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="alunos"]');if(ref&&!h.querySelector('[data-v="painel"]')){ref.insertAdjacentHTML('beforebegin',`<button class="nav tnav" data-v="painel" title="Painel da Turma"><span data-ico="chart"></span><span class="lbl">Painel da Turma</span></button>`);const b=h.querySelector('[data-v="painel"]');b.querySelector('[data-ico]').innerHTML=ic('grid',18);b.onclick=()=>go('painel')}}
{const _gP=go;go=function(v){const r=_gP.apply(this,arguments);if(go._f&&go._f.painel!==vPainel)go._f.painel=vPainel;return r}}
const PNL=()=>S.cfg.painel=S.cfg.painel||{per:null,ord:'num',dir:1,q:'',cols:{ass:true,fal:true,av:true,pend:true,acao:true},fil:''};
function pnlLimFaltas(t,a){const sem=(()=>{try{return blocos(aulasTurma(t,a)).reduce((s,b)=>s+Math.max(1,b.tempos||1),0)}catch(_){return 0}})();const prof=t.oferta==='profij'||t.oferta==='profissional';
  let lim;if(prof){let tot=0;try{const r=aulasPrevistas(t,a);tot=r?r.P.reduce((s,p)=>s+(p.n_||p.total||p.aulas||0),0):0}catch(_){}if(!tot)tot=sem*33;lim=Math.max(1,Math.floor(tot*0.1))}else lim=Math.max(1,sem*2);return {lim,sem,prof}}
function pnlDados(t,a,per){const al=alunosAval(t);const L=(()=>{try{return listaAulas(t,a)}catch(_){return []}})();const dadas=L.filter(x=>x.licao&&(per==null||x.per===per));const conf=dadas.filter(aulaConf);const porConf=dadas.length-conf.length;
  const fal=aid=>{let F=0,FD=0,J=0;conf.forEach(x=>{const p=(x.s&&x.s.pres||{})[aid];if(!p||!p.f)return;if(p.f==='FD')FD++;else F++;if(p.j||p.just)J++});return {F,FD,J,tot:F+FD}};
  const LF=pnlLimFaltas(t,a);const insts=t.instrumentos.filter(i=>per==null||+i.periodo===+per);const hj=isoHoje();
  const linhas=al.map(x=>{const f=fal(x.id);const pcts=per==null?pctsFinal(t,x.id,perAtual(t)):pctsPer(t,x.id,per);const nota=ponderada(t,pcts);const nInst=insts.filter(i=>instAvaliado(i,x.id)).length;
    const pend=insts.filter(i=>instAlunoEstado(t,i,x.id)==='porclass').length;const oralP=insts.filter(i=>instAlunoEstado(t,i,x.id)==='incompleta').length;
    const ass=conf.length?Math.round((1-f.tot/conf.length)*100):null;const neg=nota!=null&&negativa(t,nota);const risco=f.tot>=LF.lim?'lim':f.tot>=Math.ceil(LF.lim/2)?'meio':'';
    const acao=risco==='lim'?['Ultrapassou o limite de faltas','sumarios']:neg?['Plano de recuperação','perfil']:pend?['Classificar '+pend+' instrumento'+(pend>1?'s':''),'instrumentos']:oralP?['Classificar a oralidade','oral']:risco==='meio'?['Avisar o encarregado de educação','documentos']:nInst===0?['Sem classificações','instrumentos']:null;
    return {a:x,f,ass,nota,neg,nInst,pend,oralP,risco,acao}});
  return {al,L,dadas,conf,porConf,linhas,LF,insts}}
function pnlAtencao(t,a,D){const it=[];const hj=isoHoje();const res=t.painelRes=t.painelRes||{};
  D.linhas.forEach(l=>{if(l.risco==='lim')it.push({k:'f-'+l.a.id,g:3,ic:'alert',c:'bad',tit:l.a.nome,mot:`${l.f.tot} faltas — limite de ${D.LF.lim} atingido`,ac:'Ver Sumários',go:'sumarios'});else if(l.risco==='meio')it.push({k:'fm-'+l.a.id,g:2,ic:'clock',c:'w',tit:l.a.nome,mot:`${l.f.tot} faltas — metade do limite (${D.LF.lim})`,ac:'Comunicar ao EE',go:'documentos'})});
  t.instrumentos.forEach(i=>{const E=instEstado(t,i);if(!['porclass','parcial'].includes(E.e))return;const n=E.porClass;if(n&&n<D.al.length)it.push({k:'ip-'+i.id,g:2,ic:'clipboard',c:'w',tit:i.nome,mot:`${n} aluno${n>1?'s':''} por classificar · ${fmtIso(i.data)}`,ac:'Classificar',inst:i.id});else if(n===D.al.length)it.push({k:'iv-'+i.id,g:2,ic:'clipboard',c:'w',tit:i.nome,mot:`Realizado a ${fmtIso(i.data)} e ainda sem classificações`,ac:'Lançar',inst:i.id});
    const np=D.al.filter(x=>instAvaliado(i,x.id)&&instPendentes(i,x.id).length).length;if(np)it.push({k:'op-'+i.id,g:2,ic:'fala',c:'w',tit:i.nome+' — oralidade',mot:`${np} aluno${np>1?'s':''} com a grelha oral por preencher`,ac:'Abrir Grelha',inst:i.id,tab:'oral'})});
  try{matrizes(a,[t]).filter(x=>!x.enviada&&x.i.data>=hj&&x.data<=isoData(new Date(Date.now()+7*864e5))).forEach(x=>it.push({k:'mz-'+x.i.id,g:x.data<hj?3:1,ic:'file',c:x.data<hj?'bad':'',tit:'Matriz — '+x.i.nome,mot:`Envio ${x.data<hj?'em atraso desde':'até'} ${fmtIso(x.data)}`,ac:'Marcar Enviada',fn:()=>{x.i.matrizEnviada=true;save()}}))}catch(_){}
  const semS=D.L.filter(x=>x.licao&&x.passada&&!x.falta&&!((x.s&&x.s.texto)||'').trim()).length;if(semS)it.push({k:'ss',g:1,ic:'pen',c:'',tit:'Sumários',mot:`${semS} sumário${semS>1?'s':''} por escrever`,ac:'Escrever',go:'sumarios'});
  try{reunioes(a).forEach(r=>{const tt=[...(r.turmas||[]),...(r.turma?[r.turma]:[])];if(!tt.includes(t.id))return;(r.decisoes||[]).forEach((d,k)=>{if(d.ok)return;it.push({k:'dc-'+r.id+'-'+k,g:d.prazo&&d.prazo<hj?3:1,ic:'checks',c:d.prazo&&d.prazo<hj?'bad':'',tit:'Deliberação: '+(d.t||d.texto||'ação'),mot:(d.resp?d.resp+' · ':'')+(d.prazo?'prazo '+fmtIso(d.prazo):'sem prazo'),ac:'Reuniões',go:'reunioes'})});if(r.data<hj&&!r.ata&&!(r.notas||'').trim())it.push({k:'at-'+r.id,g:1,ic:'file',c:'',tit:'Ata por fazer',mot:(r.titulo||'Reunião')+' · '+fmtIso(r.data),ac:'Reuniões',go:'reunioes'})})}catch(_){}
  D.linhas.filter(l=>l.neg).forEach(l=>it.push({k:'ng-'+l.a.id,g:1,ic:'chart',c:'',tit:l.a.nome,mot:`Classificação ${fmtNota(t,l.nota)} — abaixo do limiar`,ac:'Ver Perfil',aluno:l.a.id}));
  return it.filter(x=>{const r=res[x.k];if(!r)return true;if(r.ate&&r.ate<hj){delete res[x.k];return true}return false}).sort((x,y)=>y.g-x.g)}
function pnlAgenda(t,a,dias){const hj=isoHoje();const lim=isoData(new Date(Date.now()+dias*864e5));const E=[];
  t.instrumentos.forEach(i=>{if(i.data&&i.data>=hj&&i.data<=lim)E.push({d:i.data,t:i.nome,s:i.tipo,ic:i.oral||/oral/i.test(i.tipo)?'fala':'target',av:true})});
  (a.datasAval||[]).forEach(x=>{if(!x.data||(x.turma&&x.turma!==t.id))return;const f=x.fim||x.data;if(f<hj||x.data>lim)return;E.push({d:x.data<hj?hj:x.data,t:nomeAval(x),s:x.fim&&x.fim!==x.data?'até '+fmtIso(x.fim):'',ic:'flag',av:x.tipo!=='reuniao'})});
  try{reunioes(a).forEach(r=>{const tt=[...(r.turmas||[]),...(r.turma?[r.turma]:[])];if(r.data>=hj&&r.data<=lim&&(!tt.length||tt.includes(t.id)))E.push({d:r.data,t:r.titulo||'Reunião',s:(r.hora||'')+(r.local?' · '+r.local:''),ic:'users'})})}catch(_){}
  try{datasImportantes(a,dias).filter(x=>x.tipo==='interrupcao'||x.tipo==='fimp'||/Feriado/.test(x.t)).forEach(x=>E.push({d:x.ini<hj?hj:x.ini,t:x.t,s:x.s||'',ic:'calendar'}))}catch(_){}
  try{matrizes(a,[t]).filter(x=>!x.enviada&&x.data>=hj&&x.data<=lim).forEach(x=>E.push({d:x.data,t:'Envio da matriz — '+x.i.nome,s:'',ic:'file'}))}catch(_){}
  E.sort((x,y)=>x.d.localeCompare(y.d));const sem={};E.filter(x=>x.av).forEach(x=>{const k=segIso(x.d);sem[k]=(sem[k]||0)+1});return {E,carga:Object.entries(sem).filter(([k,n])=>n>=3)}}
function vPainel(){const t=T();if(!t)return go('turmas');const a=A();const C=PNL();const P=periodos();const per=C.per==='ano'?null:(C.per?+C.per:perAtual(t));const D=pnlDados(t,a,per);const hj=isoHoje();
  barBtns([{id:'pn-sum',t:ic('pen',15)+' Sumário / Faltas',f:()=>go('sumarios')},{id:'pn-av',t:ic('plus',15)+' Lançar Avaliação',c:'pri',f:()=>{go('instrumentos');try{novoInstrumento()}catch(_){}}},{id:'pn-tst',t:ic('target',15)+' Marcar Teste',f:()=>go('testes')},{id:'pn-doc',t:ic('file',15)+' Documento',f:()=>go('documentos')},{id:'pn-pr',t:ic('printer',15)+' Exportar Vista',f:()=>window.print()}]);
  const L=D.linhas;const comNota=L.filter(l=>l.nota!=null);const negs=L.filter(l=>l.neg);const assV=L.map(l=>l.ass).filter(x=>x!=null);const ass=assV.length?Math.round(avg(assV)):null;
  const EST=t.instrumentos.filter(i=>(per==null||+i.periodo===+per)&&instMax(i)).map(i=>instEstado(t,i));const nE=k=>EST.filter(x=>x.e===k).length;const porClass=nE('porclass')+nE('parcial'),porInc=nE('incompleta'),porReal=nE('agendado'),naoReal=nE('naoreal'),semData=nE('semdata');const pendI={length:porClass+porInc};
  const AT=pnlAtencao(t,a,D);const sit=new Set(L.filter(l=>l.risco||l.neg||l.pend).map(l=>l.a.id)).size;const AG=pnlAgenda(t,a,14);const prox7=AG.E.filter(x=>x.d<=isoData(new Date(Date.now()+7*864e5))).length;
  const cobertura=`${D.insts.filter(i=>D.al.some(x=>instAvaliado(i,x.id))).length} instrumento(s) com classificações · ${D.dadas.length} aula(s) dadas${D.porConf?' ('+D.porConf+' com chamada por confirmar)':''}`;
  const kp=(id,icn,l,v,s,cls)=>`<button type="button" class="pnk ${cls||''}" data-pnk="${id}"><span class="pnkl">${ic(icn,15)} ${l}</span><b>${v}</b><small>${s}</small></button>`;
  const ord=C.ord,dir=C.dir;const q=normT(C.q||'');let LL=L.filter(l=>!q||normT(l.a.nome).includes(q)||String(l.a.num)===q);
  if(C.fil==='neg')LL=LL.filter(l=>l.neg);else if(C.fil==='risco')LL=LL.filter(l=>l.risco);else if(C.fil==='pend')LL=LL.filter(l=>l.pend||l.oralP);else if(C.fil==='sit')LL=LL.filter(l=>l.risco||l.neg||l.pend);
  const val=l=>ord==='nome'?l.a.nome:ord==='ass'?(l.ass??-1):ord==='fal'?l.f.tot:ord==='av'?(l.nota??-1):ord==='pend'?l.pend+l.oralP:(+l.a.num||0);LL.sort((x,y)=>{const A_=val(x),B_=val(y);return (typeof A_==='string'?A_.localeCompare(B_,'pt'):A_-B_)*dir});
  const th=(k,l)=>`<th scope="col"><button type="button" class="pnth ${ord===k?'on':''}" data-pnord="${k}">${l}${ord===k?(dir>0?' ▲':' ▼'):''}</button></th>`;const cl=C.cols;
  const prof=t.oferta==='profij'||t.oferta==='profissional';const mods=prof&&Array.isArray(t.modulos)?t.modulos:[];
  const perNotas=P.map(p=>{const v=D.al.map(x=>ponderada(t,pctsPer(t,x.id,p))).filter(x=>x!=null);return {p,n:v.length,m:v.length?avg(v):null,neg:v.filter(f=>negativa(t,f)).length}});
  const dist=classesDe(t).map((nome,k)=>({m:{nome},k,n:comNota.filter(l=>(mencao(t,l.nota)||{}).i===k).length}));
  const sem8=(()=>{const W=[];for(let k=7;k>=0;k--){const s=segIso(new Date(Date.now()-k*7*864e5));const fim=isoData(new Date(dataDeIso(s).getTime()+6*864e5));const au=D.L.filter(x=>x.licao&&aulaConf(x)&&x.data>=s&&x.data<=fim);let pres=0,tot=0;au.forEach(x=>D.al.forEach(al=>{tot++;const p=(x.s&&x.s.pres||{})[al.id];if(!p||!p.f)pres++}));W.push({s,au:au.length,pc:tot?Math.round(pres/tot*100):null})}return W})();
  const FT=L.reduce((s,l)=>({F:s.F+l.f.F,FD:s.FD+l.f.FD,J:s.J+l.f.J}),{F:0,FD:0,J:0});
  const R=(()=>{try{return reunioes(a).filter(r=>{const tt=[...(r.turmas||[]),...(r.turma?[r.turma]:[])];return tt.includes(t.id)})}catch(_){return []}})();const decP=R.flatMap(r=>(r.decisoes||[]).filter(d=>!d.ok));
  $('#view').innerHTML=`<div class="pnl">
  <div class="card pnhd"><div class="pnhd1">${anoBadge(t)}<div class="pnhdt"><h2>${esc(t.nome)} · ${esc(t.disciplina)}</h2><div class="mut">${esc(t.curso||(turmaDado?turmaDado(t,'cursoFicha'):'')||({profij:'PROFIJ',profissional:'Ensino Profissional'}[ofertaDe(t)]||'Ensino Regular'))}${t.anoEsc?' · '+esc(t.anoEsc):''} · ${esc(a.nome)}${t.dt?' · <b>Diretor(a) de turma: você</b>':''} · ${D.al.length} aluno${D.al.length!==1?'s':''} ativos</div></div><span class="sp1"></span>
    <div class="seg" role="group" aria-label="Período">${P.map(p=>`<button type="button" data-pnper="${p}" class="${per===p?'on':''}">${p}.º ${perW().slice(0,3).toLowerCase()}.</button>`).join('')}<button type="button" data-pnper="ano" class="${per==null?'on':''}">Ano</button></div></div>
    <small class="mut pnupd">${pnlCarimbo()} · ${cobertura}</small></div>
  <div class="pnks">${kp('alunos','users','Alunos',D.al.length,t.alunos.length!==D.al.length?(t.alunos.length-D.al.length)+' não frequentam':'todos frequentam')}
    ${kp('ass','check','Assiduidade',ass==null?'—':ass+'%',ass==null?(D.dadas.length?'chamada por confirmar em todas as aulas':'sem aulas dadas'):D.conf.length+' aulas confirmadas'+(D.porConf?' · <span class="pnpc">'+D.porConf+' por confirmar</span>':'')+' · limite '+D.LF.lim+' faltas',ass!=null&&ass<90||D.porConf?'w':'')}
    ${kp('neg','chart','Abaixo do Limiar',comNota.length?negs.length:'—',comNota.length?`de ${comNota.length} com classificação`:'dados insuficientes',negs.length?'bad':'')}
    ${kp('pend','clipboard','Avaliações Pendentes',pendI.length,[porClass?porClass+' por classificar':'',porInc?porInc+' incompleta'+(porInc>1?'s':''):'',porReal?porReal+' agendada'+(porReal>1?'s':''):'',naoReal?naoReal+' não realizada'+(naoReal>1?'s':''):'',semData?semData+' sem data':''].filter(Boolean).join(' · ')||'tudo classificado',porClass||porInc?'w':'')}
    ${kp('sit','alert','A Acompanhar',sit,'faltas, classificações ou pendências',sit?'w':'')}
    ${kp('prazos','calendar','Próximos 7 Dias',prox7,prox7?AG.E.slice(0,1).map(x=>esc(x.t)).join(''):'nada agendado')}</div>
  <div class="png2">
    <section class="card pnat"><div class="row"><h2 style="margin:0">${ic('alert',18)} Precisa da Sua Atenção</h2><span class="tag ${AT.length?'bad':'ok'}">${AT.length||'tudo em dia'}</span></div>
      ${AT.length?`<div class="pnatl">${AT.slice(0,10).map(x=>`<div class="pnai ${x.c}" data-pnai="${x.k}"><span class="pnaic">${ic(x.ic,16)}</span><span class="pnaib"><b>${esc(x.tit)}</b><small>${esc(x.mot)}</small></span><span class="pnaia"><button type="button" class="btn sm" data-pnact="${x.k}">${esc(x.ac)}</button><button type="button" class="btn sm ico" data-pnres="${x.k}" title="Resolvido / adiar" aria-label="Marcar como resolvido ou adiar">${ic('check',13)}</button></span></div>`).join('')}${AT.length>10?`<p class="mut" style="margin:6px 0 0">… e mais ${AT.length-10}</p>`:''}</div>`:`<p class="mut" style="margin:10px 0 0">${ic('check',14)} Nada pendente nesta turma.</p>`}</section>
    <section class="card pnag"><div class="row"><h2 style="margin:0">${ic('calendar',18)} Próximos 14 Dias</h2><span class="sp1"></span><button class="btn sm" data-goview="testes">Calendário</button></div>
      ${AG.carga.length?`<div class="alert w" style="margin:8px 0">${ic('alert',14)} Concentração de avaliações: ${AG.carga.map(([k,n])=>`${n} na semana de ${fmtIso(k).slice(0,5)}`).join(', ')}.</div>`:''}
      ${AG.E.length?`<div class="pnagl">${AG.E.slice(0,12).map(x=>{const d=dataDeIso(x.d);return `<div class="pnae ${x.av?'av':''}"><span class="pnad"><b>${d.getDate()}</b><small>${DIAS_C[d.getDay()]}</small></span>${ic(x.ic,15)}<span><b>${esc(x.t)}</b>${x.s?`<small class="mut"> · ${esc(x.s)}</small>`:''}</span><span class="sp1"></span><small class="mut">${x.d===hj?'hoje':diasEntre(hj,x.d)+' d'}</small></div>`}).join('')}</div>`:`<p class="mut" style="margin:10px 0 0">Sem eventos nos próximos 14 dias.</p>`}</section></div>
  <section class="card pnal"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('users',18)} Alunos</h2><input type="search" id="pn-q" placeholder="Pesquisar nome ou n.º" value="${esc(C.q||'')}" style="max-width:220px">
      <div class="seg" role="group" aria-label="Filtro">${[['','Todos'],['sit','A Acompanhar'],['neg','Abaixo do Limiar'],['risco','Faltas'],['pend','Pendências']].map(([k,l])=>`<button type="button" data-pnfil="${k}" class="${(C.fil||'')===k?'on':''}">${l}</button>`).join('')}</div><span class="sp1"></span>
      <button type="button" class="btn sm" id="pn-cols">${ic('sliders',13)} Colunas</button></div>
    <div class="pnsel" id="pn-sel" hidden><b id="pn-seln">0</b> selecionados <button type="button" class="btn sm" id="pn-csv">${ic('download',13)} Exportar CSV</button><button type="button" class="btn sm" id="pn-rel">${ic('file',13)} Relatórios</button><button type="button" class="btn sm" id="pn-limp">Limpar</button></div>
    <div class="tblw"><table class="lst pntb"><thead><tr><th scope="col"><input type="checkbox" id="pn-all" aria-label="Selecionar todos"></th>${th('num','N.º')}${th('nome','Aluno')}${cl.ass?th('ass','Assiduidade'):''}${cl.fal?th('fal','Faltas'):''}${cl.av?th('av','Avaliação'):''}${cl.pend?th('pend','Pendências'):''}${cl.acao?'<th scope="col">Próxima Ação</th>':''}</tr></thead><tbody>
    ${LL.map(l=>`<tr data-pna="${l.a.id}" class="${l.risco==='lim'||l.neg?'pnrb':l.risco||l.pend?'pnrw':''}"><td><input type="checkbox" data-pnck="${l.a.id}" aria-label="Selecionar ${esc(l.a.nome)}"></td><td class="n">${esc(numAl(l.a))}</td><td style="text-align:left"><button type="button" class="pnnm" data-pnp="${l.a.id}">${avatar(l.a,26)}<span>${esc(l.a.nome)}</span></button></td>
      ${cl.ass?`<td>${l.ass==null?'<span class="mut">sem dados</span>':`<span class="pnass ${l.ass<90?'lo':''}">${l.ass}%</span>`}</td>`:''}
      ${cl.fal?`<td>${l.f.tot?`<b class="${l.risco==='lim'?'neg':''}">${l.f.tot}</b><small class="mut">/${D.LF.lim}</small>${l.f.FD?` <span class="tag bad" title="Disciplinares">${l.f.FD} FD</span>`:''}${l.risco?` ${ic('alert',12)}`:''}`:'<span class="mut">0</span>'}</td>`:''}
      ${cl.av?`<td>${l.nota==null?`<span class="mut">${l.nInst?'—':'sem classificações'}</span>`:`<b class="${l.neg?'neg':''}">${fmtNota(t,l.nota)}</b> ${pillM(t,mencao(t,l.nota))}${!isSec(t)?` <small class="mut">nível ${nivel(t,l.nota)}</small>`:''}${l.neg?' '+ic('alert',12):''}`}</td>`:''}
      ${cl.pend?`<td>${l.pend||l.oralP?`${l.pend?`<span class="tag">${l.pend} por classificar</span>`:''}${l.oralP?` <span class="tag">${ic('fala',11)} oral</span>`:''}`:'<span class="mut">—</span>'}</td>`:''}
      ${cl.acao?`<td>${l.acao?`<button type="button" class="btn sm" data-pnac="${l.a.id}|${l.acao[1]}">${esc(l.acao[0])}</button>`:'<span class="mut">—</span>'}</td>`:''}</tr>`).join('')||`<tr><td colspan="8" class="mut" style="padding:16px">Nenhum aluno com este filtro.</td></tr>`}</tbody></table></div></section>
  <div class="png3">
    <section class="card"><h2>${ic('chart',18)} Avaliação da Turma</h2>
      <div class="pnstat"><span><b>${t.instrumentos.filter(i=>D.al.some(x=>instAvaliado(i,x.id))).length}</b> realizadas</span><span><b>${porReal}</b> por realizar</span><span><b>${porClass}</b> por classificar</span><span><b>${D.al.length-comNota.length}</b> sem avaliação</span></div>
      <h3>${temMencoes(t)?'Menções':'Classificações (valores)'} ${per==null?'(ano)':'('+per+'.º '+perW().slice(0,3).toLowerCase()+'.)'}</h3><div class="bars">${dist.map(x=>`<div class="b"><span>${esc(x.m.nome)}</span><div class="tr"><div class="fi ${mcls(t,{i:x.k})}" style="width:${comNota.length?Math.round(x.n/comNota.length*100):0}%"></div></div><b>${x.n}</b></div>`).join('')}</div>
      <h3>Evolução por ${perW().toLowerCase()}</h3><div class="pnev">${perNotas.map(x=>`<div class="pnevc"><small>${x.p}.º</small><b>${x.m==null?'—':fmtNota(t,x.m)}</b><span class="mut">${x.n?x.n+' alunos · '+x.neg+' neg.':'sem dados'}</span></div>`).join('')}</div></section>
    <section class="card"><h2>${ic('check',18)} Assiduidade</h2>
      <div class="pnweek">${sem8.map(w=>`<div class="pnwb" title="Semana de ${fmtIso(w.s)}: ${w.pc==null?'sem aulas':w.pc+'% de presenças'}"><i style="height:${w.pc==null?2:Math.max(4,w.pc)}%" class="${w.pc!=null&&w.pc<90?'lo':''}"></i><small>${fmtIso(w.s).slice(0,5)}</small></div>`).join('')}</div>
      <div class="pnstat"><span><b>${FT.F}</b> faltas de presença</span><span><b>${FT.FD}</b> disciplinares</span><span><b>${FT.J}</b> justificadas</span><span><b>${FT.F+FT.FD-FT.J}</b> por justificar</span></div>
      <p class="hint" style="margin:6px 0 0">Limite: ${D.LF.prof?'10% das horas de formação':'o dobro dos tempos semanais'} = <b>${D.LF.lim}</b> faltas (${D.LF.sem} tempos/semana). Alerta a partir de metade.</p>
      ${L.filter(l=>l.risco).length?`<div class="pnrisk">${L.filter(l=>l.risco).sort((x,y)=>y.f.tot-x.f.tot).slice(0,6).map(l=>`<span class="tag ${l.risco==='lim'?'bad':''}">${esc(l.a.nome.split(' ')[0])} · ${l.f.tot}</span>`).join('')}</div>`:''}</section>
    <section class="card"><h2>${ic('file',18)} Documentação e Conselho de Turma</h2>
      <table class="lst pndoc"><tbody>
        <tr><th scope="row">Reuniões da turma</th><td>${R.length?`${R.filter(r=>r.data>=hj).length} agendada(s) · ${R.filter(r=>r.data<hj).length} realizada(s)`:'<span class="mut">nenhuma</span>'}</td></tr>
        <tr><th scope="row">Atas por fazer</th><td>${R.filter(r=>r.data<hj&&!r.ata&&!(r.notas||'').trim()).length||'—'}</td></tr>
        <tr><th scope="row">Deliberações por concluir</th><td>${decP.length?decP.slice(0,3).map(d=>esc(d.t||d.texto||'ação')+(d.prazo?' <small class="mut">('+fmtIso(d.prazo)+')</small>':'')).join('<br>'):'—'}</td></tr>
        <tr><th scope="row">Sumários por escrever</th><td>${D.L.filter(x=>x.licao&&x.passada&&!x.falta&&!((x.s&&x.s.texto)||'').trim()).length||'—'}</td></tr>
        <tr><th scope="row">Evidências guardadas</th><td>${Object.values(t.evid||{}).reduce((s,o)=>s+Object.values(o).reduce((a,b)=>a+b,0),0)||'—'}</td></tr></tbody></table>
      <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" data-goview="reunioes">${ic('users',13)} Reuniões</button><button class="btn sm" data-goview="documentos">${ic('file',13)} Documentos</button><button class="btn sm" data-goview="relatorios">${ic('file',13)} Relatórios</button></div></section>
    <section class="card"><h2>${ic('grad',18)} ${prof?'Módulos / UFCD':'Projetos e Aulas'}</h2>
      ${prof?(mods.length?`<div class="pnmods">${mods.map(m=>{const nM=D.al.map(x=>notaMod(t,x.id,m.id)).filter(v=>v!=null);const ok=nM.filter(v=>v>=9.5).length;return `<div class="pnmod"><b>${esc(m.cod||m.codigo||'')} ${esc(m.nome||'Módulo')}</b><small class="mut">${m.horas?m.horas+' h · ':''}${nM.length?ok+'/'+D.al.length+' concluíram':'sem avaliação'}</small><div class="ecbar"><i style="width:${D.al.length?Math.round(ok/D.al.length*100):0}%"></i></div></div>`}).join('')}</div>`:'<p class="mut">Ainda sem módulos definidos.</p>')
        :`<div class="pnstat"><span><b>${D.L.filter(x=>x.licao).length}</b> aulas dadas</span><span><b>${D.L.filter(x=>!x.passada).length}</b> por dar</span><span><b>${D.LF.sem}</b> tempos/semana</span></div><p class="hint" style="margin:6px 0 0">Projetos interdisciplinares, apoios e Cidadania: registe-os em Reuniões ou Documentos para aparecerem aqui como deliberações.</p>`}
      ${prof?`<div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" data-goview="modulos">Módulos</button><button class="btn sm" data-goview="mra">MRA</button></div>`:''}</section></div></div>`;
  const re=()=>manterPosicao(vPainel);
  $$('[data-pnper]').forEach(b=>b.onclick=()=>{C.per=b.dataset.pnper;save();re()});
  $$('[data-pnord]').forEach(b=>b.onclick=()=>{const k=b.dataset.pnord;if(C.ord===k)C.dir=-C.dir;else{C.ord=k;C.dir=k==='num'||k==='nome'?1:-1}save();re()});
  $$('[data-pnfil]').forEach(b=>b.onclick=()=>{C.fil=b.dataset.pnfil;save();re()});
  const qi=$('#pn-q');qi.oninput=()=>{C.q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{const p=qi.selectionStart;re();const n=$('#pn-q');n.focus();n.setSelectionRange(p,p)},250)};
  $$('[data-pnk]').forEach(b=>b.onclick=()=>{const k=b.dataset.pnk;if(k==='alunos')return go('alunos');if(k==='prazos')return go('testes');if(k==='pend'){C.fil='pend'}else if(k==='neg'){C.fil='neg'}else if(k==='ass'){C.fil='risco';C.ord='ass';C.dir=1}else if(k==='sit')C.fil='sit';save();re();setTimeout(()=>{const s=$('#view .pnal');if(s)s.scrollIntoView({behavior:'smooth',block:'start'})},50)});
  $$('[data-pnp]').forEach(b=>b.onclick=()=>{try{perfilAluno(b.dataset.pnp,{p:per||perAtual(t)})}catch(_){go('alunos')}});
  $$('[data-pnac]').forEach(b=>b.onclick=()=>{const [aid,v]=b.dataset.pnac.split('|');if(v==='perfil'){try{perfilAluno(aid,{p:per||perAtual(t)})}catch(_){}}else if(v==='oral'){UI.oralAberta=false;go('oral')}else{UI.inst=null;go(v)}});
  const AI=Object.fromEntries(AT.map(x=>[x.k,x]));
  $$('[data-pnact]').forEach(b=>b.onclick=()=>{const x=AI[b.dataset.pnact];if(!x)return;if(x.fn){x.fn();toast('Feito','ok');return re()}if(x.inst){UI.inst=x.inst;UI.instTab=x.tab||'notas';return go('instrumentos')}if(x.aluno){try{return perfilAluno(x.aluno,{p:per||perAtual(t)})}catch(_){}}if(x.go)go(x.go)});
  $$('[data-pnres]').forEach(b=>b.onclick=async()=>{const k=b.dataset.pnres;const r=await avisoModal('Marcar como tratado?',['Resolvido: deixa de aparecer.','Adiar: volta a aparecer daqui a 7 dias.'],[{t:ic('check',14)+' Resolvido',c:'pri',v:'ok'},{t:'Adiar 7 Dias',v:'ad'},{t:'Cancelar',v:null}]);if(!r)return;const just=r==='ad'?(prompt('Justificação (opcional):')||''):'';t.painelRes=t.painelRes||{};t.painelRes[k]={q:Date.now(),just,ate:r==='ad'?isoData(new Date(Date.now()+7*864e5)):null};save();re()});
  const sel=new Set();const upd=()=>{$('#pn-sel').hidden=!sel.size;$('#pn-seln').textContent=sel.size};
  $$('[data-pnck]').forEach(c=>c.onchange=()=>{c.checked?sel.add(c.dataset.pnck):sel.delete(c.dataset.pnck);upd()});
  $('#pn-all').onchange=e=>{$$('[data-pnck]').forEach(c=>{c.checked=e.target.checked;c.checked?sel.add(c.dataset.pnck):sel.delete(c.dataset.pnck)});upd()};
  $('#pn-limp').onclick=()=>{sel.clear();$$('[data-pnck]').forEach(c=>c.checked=false);$('#pn-all').checked=false;upd()};
  $('#pn-csv').onclick=()=>{const R_=L.filter(l=>sel.has(l.a.id));download('Painel '+t.nome+'.csv',csv([['N.º','Nome','Assiduidade','Faltas','Classificação','Menção','Pendências','Próxima ação'],...R_.map(l=>[l.a.num,l.a.nome,l.ass==null?'':l.ass+'%',l.f.tot,l.nota==null?'':fmtNota(t,l.nota),(mencao(t,l.nota)||{}).nome||'',l.pend,l.acao?l.acao[0]:''])]),'text/csv')};
  $('#pn-rel').onclick=()=>go('relatorios');
  $('#pn-cols').onclick=()=>{const b=$('#pn-cols').getBoundingClientRect();menuContexto(b.left,b.bottom+4,[['ass','Assiduidade'],['fal','Faltas'],['av','Avaliação'],['pend','Pendências'],['acao','Próxima Ação']].map(([k,l])=>({t:(C.cols[k]?'✓ ':'   ')+l,f:()=>{C.cols[k]=!C.cols[k];save();re()}})))};
  $$('#view [data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview))}

