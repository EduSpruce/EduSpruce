/* ---------- O Meu Calendário: reuniões, tarefas, testes e o calendário escolar num só mês ---------- */
function mcEventos(a){const E={};const add=(iso,o)=>{if(iso)(E[iso]=E[iso]||[]).push(o)};
  try{if(a)todasReunioes(a).forEach(r=>{if(r.estado==='cancelada')return;add(r.data,{k:'reun',t:(r.ini!=null?fmtHM(r.ini)+' ':'')+reunTitulo(r,a),f:()=>go('reunioes')})})}catch(_){}
  try{tarefas().forEach(x=>{if(x.prazo)add(x.prazo,{k:'tar',t:x.t,feito:!!x.feito,f:()=>go('tarefas')})})}catch(_){}
  try{if(a)turmasFiltradas(a).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.data&&ehTeste(i))add(i.data,{k:'tes',t:(i.nome||'Teste')+' · '+t.nome,f:()=>{S.turmaAtiva=t.id;save();go('testes')}})}))}catch(_){}
  return E}
function vMeuCal(){const a=A();const hj=isoData(new Date());const m=UI.mcMes||hj.slice(0,7);const dia=UI.mcDia||hj;const [Y,Mo]=m.split('-').map(Number);
  const d1=new Date(Y,Mo-1,1),off=(d1.getDay()+6)%7,nd=new Date(Y,Mo,0).getDate();const E=mcEventos(a);
  const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const cls=iso=>{const t=tipoDia(iso)||'';return /^feriado/.test(t)?'mc-dfer':t==='interrupcao'?'mc-dint':''};
  let cel='';for(let i=0;i<off;i++)cel+='<div class="mc-d mc-x"></div>';
  for(let d=1;d<=nd;d++){const iso=`${Y}-${String(Mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const ev=E[iso]||[];const fds=[0,6].includes(new Date(Y,Mo-1,d).getDay());
    cel+=`<button type="button" class="mc-d ${cls(iso)} ${fds?'mc-fds':''} ${iso===hj?'mc-hj':''} ${iso===dia?'mc-sel':''}" data-mcd="${iso}"><span class="mc-n">${d}</span>${ev.slice(0,3).map(e=>`<span class="mc-e mc-${e.k} ${e.feito?'mc-feito':''}">${esc(e.t)}</span>`).join('')}${ev.length>3?`<span class="mc-mais">+${ev.length-3}</span>`:''}</button>`}
  const ev=E[dia]||[];const tp=tipoDia(dia);const nota=(((a||{}).calendario||{}).notas||{})[dia]||'';
  const nomeK={reun:'Reunião',tar:'Tarefa',tes:'Teste'};
  $('#view').innerHTML=`<div class="mcw"><div class="card"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><button class="btn sm ico" id="mc-ant" aria-label="Mês anterior" title="Mês anterior">${ic('back',15)}</button><h2 style="margin:0;min-width:170px;text-align:center">${MES[Mo-1]} ${Y}</h2><button class="btn sm ico" id="mc-seg" aria-label="Mês seguinte" title="Mês seguinte" style="transform:scaleX(-1)">${ic('back',15)}</button><button class="btn sm" id="mc-hoje">Hoje</button><span class="sp1"></span><span class="mc-leg"><i class="mc-reun"></i>Reuniões <i class="mc-tar"></i>Tarefas <i class="mc-tes"></i>Testes <i class="mc-fer"></i>Feriados <i class="mc-int"></i>Interrupções</span></div>
    <div class="mc-g mc-h">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(x=>`<div>${x}</div>`).join('')}</div><div class="mc-g">${cel}</div></div>
    <div class="card"><h2 style="margin:0 0 8px">${ic('mvMeuCal',18)} ${esc(fmtIsoL(dia))}</h2>${tp&&!LETIVOS.includes(tp)?`<p class="mut" style="margin:0 0 8px">${/^feriado/.test(tp)?'Feriado':tp==='interrupcao'?'Interrupção letiva':'Sem aulas'}${nota?' · '+esc(nota):''}</p>`:''}
    ${ev.length?`<ul class="mc-lst">${ev.map((e,i)=>`<li><button type="button" class="mc-it" data-mci="${i}"><i class="mc-${e.k}"></i><span class="${e.feito?'mc-feito':''}">${esc(e.t)}</span><small class="mut">${nomeK[e.k]}</small></button></li>`).join('')}</ul>`:'<p class="mut">Nada marcado para este dia.</p>'}
    <div class="row" style="gap:8px;margin-top:10px"><input id="mc-nt" placeholder="Nova tarefa para este dia" style="flex:1"><button class="btn pri" id="mc-add">${ic('plus',15)} Tarefa</button></div></div></div>`;
  const mes=k=>{const d=new Date(Y,Mo-1+k,1);UI.mcMes=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;vMeuCal()};
  $('#mc-ant').onclick=()=>mes(-1);$('#mc-seg').onclick=()=>mes(1);$('#mc-hoje').onclick=()=>{UI.mcMes=hj.slice(0,7);UI.mcDia=hj;vMeuCal()};
  $$('[data-mcd]').forEach(b=>b.onclick=()=>{UI.mcDia=b.dataset.mcd;vMeuCal()});
  $$('[data-mci]').forEach(b=>b.onclick=()=>ev[+b.dataset.mci].f());
  const add=()=>{const t=$('#mc-nt').value.trim();if(!t)return;tarefas().push({id:uid(),t,prazo:dia,feito:false,criada:Date.now()});save();try{tarBadge()}catch(_){}toast('Tarefa criada');vMeuCal()};
  $('#mc-add').onclick=add;$('#mc-nt').onkeydown=e=>{if(e.key==='Enter')add()}}

/* ---------- Definições › Menu Lateral: reordenar, mudar nome e ícone, criar menus e secções ---------- */
const mnGet=(M,p)=>p.length===1?M[p[0]]:M[p[0]].f[p[1]];
const mnLista=(M,p)=>p.length===1?M:(M[p[0]].f=M[p[0]].f||[]);
const mnPodeTer=n=>!!n&&n.v!=='@sep'&&n.v!=='@turmas'&&n.v!=='@bloq'&&n.v!=='@ofsel';
const mnPodeIr=n=>!!n&&!!n.v&&n.v!=='@sep'&&n.v!=='@turmas'&&!(n.f&&n.f.length);
function mnTirar(M,p){return mnLista(M,p).splice(p[p.length-1],1)[0]}
function mnIcHTML(n){if(n.ic)return ic(n.ic,18);if(MN_IC[n.v])return ic(MN_IC[n.v],18);const e=n.v?mnAlvo(n.v):null;const sv=e&&e.querySelector('svg');if(sv){const c=sv.cloneNode(true);c.setAttribute('width','22');c.setAttribute('height','22');return c.outerHTML}return ic('mgPasta',18)}
function defMenu(){const M=menuCfg();const usa=new Set(mnFolhas(M));const disp=mnCatalogo().filter(v=>!usa.has(v));
  const linha=(n,p)=>{if(!mnExiste(n))return '';const sep=n.v==='@sep',grupo=!n.v,sec=grupo&&n.t==='sec',fixo=n.v==='@ofsel';const el=n.v?mnEl(n.v):null;const desl=n.v&&!sep&&n.v[0]!=='@'&&el&&!mnVisivel(el)&&!el.closest('#mnavOff');
    const tipo=sep?'Separador':sec?'Secção (título)':grupo?'Menu (abre e fecha)':n.v==='@turmas'?'Turmas e as suas secções':fixo?'Filtro':(n.f&&n.f.length?'Menu com página':(p.length>1&&M[p[0]].t!=='sec'?'Submenu':'Item'));
    const k=p.join('.'),sub=p.length>1;
    return `<li class="mnr ${grupo?'mnr-g':''} ${sec?'mnr-s':''} ${sep?'mnr-sep':''}" data-p="${k}"><div class="mnrow"><span class="mnh" data-mnh="${k}" title="Arrastar" aria-label="Arrastar">${ic('mvMover',16)}</span>
      ${sep?'<span class="mnsepv"></span>':fixo?`<span class="mnn mnfix">${esc(MN_NOME['@ofsel'])}</span>`:`${sec?'':`<button type="button" class="btn sm ico mnic" data-mnic="${k}" title="Mudar o ícone" aria-label="Mudar o ícone">${mnIcHTML(n)}</button>`}<input class="mnn" data-mnn="${k}" value="${esc(mnNome(n))}" aria-label="Nome" placeholder="${sec?'Título da secção':'Nome do menu'}">`}
      <span class="mnt">${tipo}${desl?' · <i>módulo desligado</i>':''}</span>
      <span class="mnb">${grupo?`<button type="button" class="btn sm" data-mntp="${k}" title="${sec?'Passar a menu que abre e fecha':'Passar a secção com título (sempre aberta)'}">${sec?'Tornar Menu':'Tornar Secção'}</button>`:''}<button type="button" class="btn sm ico" data-mnmv="${k}|-1" title="Subir" aria-label="Subir">${ic('chev',13).replace('<svg','<svg style="transform:rotate(-90deg)"')}</button><button type="button" class="btn sm ico" data-mnmv="${k}|1" title="Descer" aria-label="Descer">${ic('chev',13).replace('<svg','<svg style="transform:rotate(90deg)"')}</button>
      ${sub?`<button type="button" class="btn sm" data-mnout="${k}" title="Tirar e pôr no nível de cima">← Fora</button>`:(mnPodeIr(n)&&p[0]>0&&mnPodeTer(M[p[0]-1])?`<button type="button" class="btn sm" data-mnin="${k}" title="Pôr dentro do menu ou da secção de cima">Dentro →</button>`:'')}
      <button type="button" class="btn sm ico" data-mnx="${k}" title="${grupo?'Apagar (os itens ficam no menu lateral)':'Tirar do menu lateral'}" aria-label="Tirar">${ic(grupo||sep?'trash':'x',14)}</button></span></div>
      ${(grupo||(n.f&&n.f.length))?`<ul class="mnl mnsub">${(n.f||[]).map((x,j)=>linha(x,[p[0],j])).join('')}${grupo&&!(n.f||[]).length?'<li class="mnvz mut">Vazio: arraste itens para aqui ou use «Dentro →».</li>':''}</ul>`:''}</li>`};
  return `<div class="card mned"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('mgPasta',18)} Menu Lateral</h2><span class="sp1"></span><button class="btn sm" id="mn-ng">${ic('plus',14)} Novo Menu</button><button class="btn sm" id="mn-nsc">${ic('plus',14)} Nova Secção</button><button class="btn sm" id="mn-ns">${ic('plus',14)} Separador</button><button class="btn sm" id="mn-rp">${ic('refresh',14)} Repor o Original</button></div>
    <p class="hint">Arraste pela pega ${ic('mvMover',13)} para mudar a ordem, ou largue em cima de um menu ou secção para o pôr lá dentro. Toque no ícone para o mudar e no nome para o reescrever. <b>Secção</b>: título sempre aberto (como «Geral»); <b>Menu</b>: abre e fecha com um toque. As alterações aparecem logo e ficam guardadas na sua conta.</p>
    <ul class="mnl" id="mnl">${M.map((n,i)=>linha(n,[i])).join('')}</ul>
    ${disp.length?`<h3 style="margin:16px 0 6px">Fora do menu</h3><div class="mnoff">${disp.map(v=>`<button type="button" class="btn sm" data-mnadd="${v}">${esc(mnNome({v}))} ${ic('plus',12)}</button>`).join('')}</div>`:''}</div>${defMenusG()}`}
function defMenusG(){const G=mnGuardados(),at=mnDaEscola(),ES=todasEscolas();const eA=escAtiva();
  return `<div class="card mned mng"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('star',18)} Menus Guardados</h2><span class="sp1"></span><button class="btn sm pri" id="mng-novo">${ic('plus',14)} Guardar o Menu Atual</button></div>
    <p class="hint">Guarde várias versões do menu lateral e associe cada uma a escolas: ao mudar de escola no topo, o menu muda sozinho. Escolas sem menu associado usam o menu habitual. ${at?`Agora está a editar <b>«${esc(at.nome)}»</b> (associado a ${esc(nomeEscola(EC()))}).`:'Agora está a editar o <b>menu habitual</b>.'}</p>
    ${G.length?`<ul class="mngl">${G.map((m,i)=>`<li class="mngi ${m===at?'on':''}"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><input class="mnn" data-mgn="${i}" value="${esc(m.nome)}" aria-label="Nome do menu guardado">${m===at?'<span class="tag ok">em uso nesta escola</span>':''}<span class="sp1"></span>
      ${m===at?'':`<button type="button" class="btn sm" data-mgld="${i}" title="Copiar este menu para o menu que está a editar">Usar Agora</button><button type="button" class="btn sm" data-mgup="${i}" title="Substituir pelo menu que está a editar">Atualizar</button>`}<button type="button" class="btn sm ico" data-mgx="${i}" title="Apagar" aria-label="Apagar">${ic('trash',14)}</button></div>
      <div class="mnges"><span class="mut">Escolas:</span>${ES.map(e=>{const id=escId(e);const on=(m.escolas||[]).includes(id);return `<label class="chk"><input type="checkbox" data-mges="${i}|${id}" ${on?'checked':''}> ${esc(nomeEscola(e))}${id===eA?' <small class="mut">(atual)</small>':''}</label>`}).join('')}</div></li>`).join('')}</ul>`:'<p class="mut">Ainda não guardou nenhum menu.</p>'}</div>`}
function bindMenusG(){const G=mnGuardados();const re=()=>{save();menuRender();vDefinicoes()};
  const nv=$('#mng-novo');if(nv)nv.onclick=()=>{const nm=(prompt('Nome para este menu:','Menu '+(G.length+1))||'').trim();if(!nm)return;G.push({id:'m'+uid(),nome:nm,M:menuCfg(),escolas:[]});re();toast('Menu guardado')};
  $$('[data-mgn]').forEach(i=>i.onchange=()=>{const v=i.value.trim();if(v){G[+i.dataset.mgn].nome=v;save()}else i.value=G[+i.dataset.mgn].nome});
  $$('[data-mgld]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgld];if(!confirm('Substituir o menu que está a editar por «'+m.nome+'»?'))return;menuGuardar(JSON.parse(JSON.stringify(m.M)));vDefinicoes();toast('Menu aplicado')});
  $$('[data-mgup]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgup];if(!confirm('Substituir «'+m.nome+'» pelo menu que está a editar?'))return;m.M=menuCfg();save();toast('«'+m.nome+'» atualizado')});
  $$('[data-mgx]').forEach(b=>b.onclick=()=>{const m=G[+b.dataset.mgx];if(!confirm('Apagar o menu guardado «'+m.nome+'»?'+((m.escolas||[]).length?'\n\nAs escolas associadas voltam ao menu habitual.':'')))return;G.splice(+b.dataset.mgx,1);re()});
  $$('[data-mges]').forEach(c=>c.onchange=()=>{const [i,id]=c.dataset.mges.split('|');if(c.checked)G.forEach(m=>m.escolas=(m.escolas||[]).filter(x=>x!==id));const m=G[+i];m.escolas=(m.escolas||[]).filter(x=>x!==id);if(c.checked)m.escolas.push(id);re()})}
/* ao mudar de escola, o menu lateral muda para o que lhe está associado */
{let _mnK=null;setInterval(()=>{try{const G=mnDaEscola();const k=G?G.id:'';if(_mnK!==null&&k!==_mnK){menuRender();if(VIEW==='definicoes'&&UI.defTab==='menu')vDefinicoes()}_mnK=k}catch(_){}},700)}
function bindMenu(){const M=menuCfg();const P=k=>k.split('.').map(Number);const ok=()=>{menuGuardar(M);vDefinicoes()};
  const fimTopo=()=>{const i=M.findIndex(n=>n.v==='@sep'||(n.t==='sec'&&n.id==='s-config'));return i<0?(M.length&&M[M.length-1].v==='@bloq'?M.length-1:M.length):i};
  $$('[data-mnn]').forEach(i=>i.onchange=()=>{const n=mnGet(M,P(i.dataset.mnn));const v=i.value.trim();if(!n.v){if(!v&&n.t!=='sec'){i.value=mnNome(n);return}n.nome=v}else{const o=mnNome({v:n.v});if(v&&v!==o&&v!==(n.nome||''))n.nome=v;else if(!v||v===o)delete n.nome}menuGuardar(M)});
  $$('[data-mntp]').forEach(b=>b.onclick=()=>{const n=mnGet(M,P(b.dataset.mntp));if(n.t==='sec'){delete n.t;if(!n.nome)n.nome='Menu';n.ic=n.ic||'mgPasta'}else n.t='sec';ok()});
  $$('[data-mnmv]').forEach(b=>b.onclick=()=>{const [k,d]=b.dataset.mnmv.split('|');const p=P(k);const L=mnLista(M,p);const i=p[p.length-1];let j=i+ +d;while(j>=0&&j<L.length&&!mnExiste(L[j]))j+= +d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];ok()});
  $$('[data-mnin]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnin);const n=mnTirar(M,p);const alvo=M[p[0]-1];(alvo.f=alvo.f||[]).push(n);ok()});
  $$('[data-mnout]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnout);const n=mnTirar(M,p);M.splice(p[0]+1,0,n);ok()});
  $$('[data-mnx]').forEach(b=>b.onclick=()=>{const p=P(b.dataset.mnx);const n=mnGet(M,p);if(!n.v){if((n.f||[]).length&&!confirm('Apagar «'+(mnNome(n)||'secção')+'»? Os itens que tem passam para o nível de cima.'))return;mnTirar(M,p);M.splice(p[0],0,...(n.f||[]))}else mnTirar(M,p);ok()});
  $$('[data-mnadd]').forEach(b=>b.onclick=()=>{M.splice(fimTopo(),0,{v:b.dataset.mnadd});ok()});
  $('#mn-ng').onclick=()=>{const nm=(prompt('Nome do novo menu:','Novo Menu')||'').trim();if(!nm)return;M.splice(fimTopo(),0,{id:'g'+uid(),nome:nm,ic:'mgPasta',f:[]});ok()};
  $('#mn-nsc').onclick=()=>{const nm=(prompt('Título da nova secção:','Nova Secção')||'').trim();if(!nm)return;M.splice(fimTopo(),0,{id:'g'+uid(),t:'sec',nome:nm,f:[]});ok()};
  $('#mn-ns').onclick=()=>{M.splice(fimTopo(),0,{v:'@sep'});ok()};
  $('#mn-rp').onclick=()=>{if(!confirm('Repor o menu lateral original? Perde a ordem, os nomes, os ícones e os menus que criou.'))return;{const G=mnDaEscola();if(G)G.M=MENU_ORIG();else delete S.cfg.menuL}delete S.cfg.menuFech;save();menuRender();vDefinicoes();toast('Menu original reposto')};
  $$('[data-mnic]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.mnic;const old=$('.mnpick');if(old){const same=old.dataset.k===k;old.remove();if(same)return}
    b.closest('.mnrow').insertAdjacentHTML('afterend',`<div class="mnpick" data-k="${k}"><button type="button" class="btn sm" data-mnpk="">Original</button>${MN_ESC_IC.filter(x=>ICONS[x]).map(x=>`<button type="button" class="btn sm ico" data-mnpk="${x}" title="${x}">${ic(x,18)}</button>`).join('')}</div>`);
    $$('[data-mnpk]').forEach(q=>q.onclick=()=>{const n=mnGet(M,P(k));if(q.dataset.mnpk)n.ic=q.dataset.mnpk;else delete n.ic;ok()})});
  /* arrastar (rato e toque) */
  $$('[data-mnh]').forEach(h=>h.onpointerdown=e=>{e.preventDefault();const src=P(h.dataset.mnh);const li=h.closest('.mnr');const n0=mnGet(M,src);li.classList.add('mn-arr');let alvo=null,pos=null;try{h.setPointerCapture(e.pointerId)}catch(_){}
    const limpa=()=>$$('.mn-b4,.mn-af,.mn-in').forEach(x=>x.classList.remove('mn-b4','mn-af','mn-in'));
    let ult=null;const auto=setInterval(()=>{if(!ult)return;const y=ult.clientY,H=innerHeight;const d=y<90?-16:y>H-70?16:0;if(!d)return;[document.scrollingElement,$('#view'),$('#main')].forEach(x=>{try{if(x&&x.scrollHeight>x.clientHeight+2)x.scrollTop+=d}catch(_){}});mv(ult)},40);
    const mv=ev=>{ult={clientX:ev.clientX,clientY:ev.clientY};limpa();const el=document.elementFromPoint(ev.clientX,ev.clientY);const r=el&&el.closest('.mnr');alvo=null;pos=null;if(!r||r===li||li.contains(r))return;
      const rw=r.querySelector(':scope>.mnrow').getBoundingClientRect();const tp=P(r.dataset.p);const tn=mnGet(M,tp);const y=(ev.clientY-rw.top)/rw.height;
      const podeIn=tp.length===1&&mnPodeTer(tn)&&mnPodeIr(n0);if(tp.length===2&&!mnPodeIr(n0))return;
      pos=podeIn&&y>.28&&y<.72?'in':y<.5?'b4':'af';alvo=tp;r.classList.add('mn-'+pos)};
    const up=()=>{clearInterval(auto);h.onpointermove=null;h.onpointerup=h.onpointercancel=null;li.classList.remove('mn-arr');limpa();if(!alvo)return;
      const n=mnTirar(M,src);let tp=alvo.slice();if(src.length===tp.length&&(src.length===1||src[0]===tp[0])&&src[src.length-1]<tp[tp.length-1])tp[tp.length-1]--;
      if(src.length===1&&tp.length===2&&src[0]<tp[0])tp[0]--;
      if(pos==='in'){const t=mnGet(M,[tp[0]]);(t.f=t.f||[]).push(n)}else{const L=mnLista(M,tp);L.splice(tp[tp.length-1]+(pos==='af'?1:0),0,n)}
      ok()};
    h.onpointermove=mv;h.onpointerup=up;h.onpointercancel=()=>{alvo=null;up()}})}
{const _vdMn=vDefinicoes;vDefinicoes=function(){const quer=UI.defTab==='menu';if(quer)UI.defTab='aparencia';const r=_vdMn.apply(this,arguments);if(quer)UI.defTab='menu';
  try{const tb=$('#view .deftabs');if(tb&&!tb.querySelector('[data-dt2="menu"]')){const ap=tb.querySelector('[data-dt2="aparencia"]');const b=document.createElement('button');b.dataset.dt2='menu';b.innerHTML=ic('mgPasta',15)+' Menu Lateral';(ap?ap.after(b):tb.appendChild(b))}
    if(tb){tb.querySelectorAll('[data-dt2]').forEach(b=>{b.classList.toggle('on',b.dataset.dt2===UI.defTab);b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()}})}
    if(quer){const v=$('#view');const keep=tb?tb.outerHTML:'';v.innerHTML=keep+defMenu();v.querySelectorAll('[data-dt2]').forEach(b=>b.onclick=()=>{UI.defTab=b.dataset.dt2;vDefinicoes()});bindMenu();bindMenusG()}
    menuRender()}catch(e){console.warn(e)}return r}
  if(go._f)go._f.definicoes=vDefinicoes}
{const _gMn2=go;go=function(v){if(go._f&&go._f.definicoes!==vDefinicoes)go._f.definicoes=vDefinicoes;return _gMn2.apply(this,arguments)}}

