/* ===================== MODO DE APRESENTAÇÃO (v0.26) ===================== */
const APRES_DEF={nomes:'primeiro',fotos:'mostrar',sens:true,prof:true,ocultos:[]};
const apresCfg=()=>(S.cfg.apres=Object.assign({},APRES_DEF,S.cfg.apres||{}));
const APRES_BLOQ=['reunioes','definicoes','escola','meuhorario'];
let APRES_RX=null,APRES_MAP=null;
function apresPrep(){const c=apresCfg();const a=A();const M=new Map();const oc=new Set(c.ocultos||[]);
  if(a){const all=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nome&&x.nome.trim().length>2)all.push(x)}));
    const ocN=new Set(all.filter(x=>oc.has(x.id)||(x.origemId&&oc.has(x.origemId))).map(x=>normT(x.nome)));
    const byF={};all.forEach(x=>{const f=x.nome.trim().split(/\s+/)[0];(byF[f]=byF[f]||new Set()).add(normT(x.nome))});
    all.forEach(x=>{const nm=x.nome.trim().replace(/\s+/g,' ');const p=nm.split(' ');const h=ocN.has(normT(nm));let d;
      if(h)d='Aluno(a) oculto(a)';else if(c.nomes==='iniciais')d=p.filter(w=>w.length>2||/^[A-ZÁÉÍÓÚ]/.test(w)).map(w=>w[0].toUpperCase()).join('.')+'.';
      else if(c.nomes==='ocultar')d='Aluno(a) n.º '+(x.num||'?');else if(c.nomes==='completo')d=nm;else d=byF[p[0]].size>1&&p.length>1?p[0]+' '+p[p.length-1][0]+'.':p[0];
      const o=M.get(nm);M.set(nm,{d:o&&o.h?o.d:d,h:h||(o&&o.h)})})}
  APRES_MAP=M;const ks=[...M.keys()].filter(k=>M.get(k).d!==k).sort((x,y)=>y.length-x.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));APRES_RX=ks.length?new RegExp(ks.join('|'),'g'):null;
  // alunos ocultos que não são encontrados pelo nome (ex.: só o número) — marcados por id
  apresPrep.ids=oc}
function apresMarcar(el){const box=el.closest('tr,.intr,.fgc,.pnai,.dfa,.sti,.mac,.aniv,.fcard,.mscard,.lin,.cdr,.sheet,.rmini,li,.dimp,.pq-i,.kv');if(box)box.classList.add('apres-oc');else{const d=el.closest('#dw-b');if(d)d.classList.add('apres-oc')}}
function apresAplicar(){if(!document.body.classList.contains('apres'))return;
  document.querySelectorAll('#view [contenteditable="true"],#drawer [contenteditable="true"]').forEach(e=>{e.setAttribute('contenteditable','false');e.dataset.apce=1});
  (apresPrep.ids||new Set()).forEach(id=>document.querySelectorAll(`[data-a="${id}"],tr[data-fi="${id}"],.fcard[data-fi="${id}"],.fgc[data-fi="${id}"],.mscard[data-fi="${id}"]`).forEach(e=>e.classList.add('apres-oc')));
  if(!APRES_RX)return;const RX=APRES_RX,M=APRES_MAP;
  ['#view','#drawer','#toast','#cmenu','#tipbox'].forEach(sel=>{const root=document.querySelector(sel);if(!root)return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&/^(TEXTAREA|SCRIPT|STYLE|OPTION)$/.test(n.parentElement.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const L=[];let n;while(n=w.nextNode()){RX.lastIndex=0;if(RX.test(n.nodeValue))L.push(n)}
    L.forEach(n=>{let h=false;n.nodeValue=n.nodeValue.replace(RX,m=>{const v=M.get(m);if(v.h)h=true;return v.d});if(h&&n.parentElement)apresMarcar(n.parentElement)});
    root.querySelectorAll('[title],[aria-label]').forEach(e=>['title','aria-label'].forEach(at=>{const v=e.getAttribute(at);if(v){RX.lastIndex=0;if(RX.test(v))e.setAttribute(at,v.replace(RX,m=>M.get(m).d))}}));
    root.querySelectorAll('input,textarea').forEach(e=>{const v=(e.value||'').trim().replace(/\s+/g,' ');const m=M.get(v);if(m&&m.d!==v&&!e.dataset.apv){e.dataset.apv=1;e.readOnly=true;e.value=m.d;const wr=e.closest('.nmw');if(wr)wr.dataset.v=m.d;if(m.h)apresMarcar(e)}})})}
function apresClasses(on){const c=apresCfg();const b=document.body.classList;b.toggle('apres',on);b.toggle('apres-sens',on&&c.sens);b.toggle('apres-prof',on&&c.prof);b.toggle('apres-fotos',on&&c.fotos==='ocultar');
  const bt=$('#apresBtn');if(bt)bt.classList.toggle('on',on)}
function alternarApresentacao(){if(document.body.classList.contains('apres')){apresClasses(false);closeDrawer();toast('Modo de apresentação desligado','ok');go(VIEW);return}apresDlg()}
function apresDlg(){const c=apresCfg();const t=T();const al=t?alunosTodos(t):[];const oc=new Set(c.ocultos||[]);
  const op=(k,v,l,d)=>`<button type="button" data-ap="${k}" data-v="${v}" class="${c[k]===v?'on':''}" title="${esc(d||'')}">${l}</button>`;
  openDrawer('Modo de Apresentação',`<div class="ed apdlg">
    <p class="hint" style="margin-top:0">Para projetar na aula sem expor dados pessoais. Nada é alterado nos seus dados — só o que se vê no ecrã.</p>
    <label>Nomes dos alunos</label><div class="seg">${op('nomes','primeiro','Primeiro Nome')}${op('nomes','iniciais','Iniciais')}${op('nomes','ocultar','Só o N.º')}${op('nomes','completo','Completos')}</div>
    <label style="margin-top:12px">Fotografias dos alunos</label><div class="seg">${op('fotos','mostrar','Mostrar')}${op('fotos','ocultar','Desfocar')}</div>
    <label class="chk" style="margin-top:14px"><input type="checkbox" id="ap-sens" ${c.sens?'checked':''}> <span><b>Ocultar dados sensíveis dos alunos</b><br><span class="mut">N.º de processo, data de nascimento e idade, repetência, ASE, medidas (MSAI / DL 54), encarregado de educação e contactos, observações.</span></span></label>
    <label class="chk" style="margin-top:8px"><input type="checkbox" id="ap-prof" ${c.prof?'checked':''}> <span><b>Proteger a informação do professor</b><br><span class="mut">Esconde reuniões e respetivos lembretes, o seu horário, definições e escola, avisos de cópias de segurança, a pesquisa e a troca para outras turmas.</span></span></label>
    ${al.length?`<h3>${ic('user',15)} Alunos a ocultar <span class="mut" style="font-weight:500">— ${esc(t.nome)}</span></h3><p class="hint" style="margin-top:0">Os dados destes alunos ficam totalmente ocultos (nome, notas, fotografia, relatório) — para quem não quer que a turma veja a sua informação.</p>
      <div class="row" style="gap:6px;margin-bottom:6px"><button type="button" class="btn sm" id="ap-nen">Nenhum</button><button type="button" class="btn sm" id="ap-tod">Todos</button></div>
      <div class="apal">${al.map(x=>`<label class="chk"><input type="checkbox" data-apo="${x.id}" ${oc.has(x.id)?'checked':''}> <span><b>${esc(numAl(x))}</b> ${esc(x.nome)}</span></label>`).join('')}</div>`:''}
    <div class="row" style="margin-top:16px"><button class="btn pri" id="ap-ok">${ic('access',15)} Iniciar Apresentação</button></div></div>`);
  $$('[data-ap]').forEach(b=>b.onclick=()=>{c[b.dataset.ap]=b.dataset.v;$$(`[data-ap="${b.dataset.ap}"]`).forEach(x=>x.classList.toggle('on',x===b))});
  const tod=v=>$$('[data-apo]').forEach(x=>x.checked=v);if($('#ap-nen')){$('#ap-nen').onclick=()=>tod(false);$('#ap-tod').onclick=()=>tod(true)}
  $('#ap-ok').onclick=()=>{c.sens=$('#ap-sens').checked;c.prof=$('#ap-prof').checked;
    if(al.length){const ids=new Set(al.map(x=>x.id));c.ocultos=(c.ocultos||[]).filter(id=>!ids.has(id)).concat($$('[data-apo]').filter(x=>x.checked).map(x=>x.dataset.apo))}
    save();closeDrawer();apresPrep();apresClasses(true);if(c.prof&&APRES_BLOQ.includes(VIEW))go('inicio');else go(VIEW);
    const n=al.filter(x=>(c.ocultos||[]).includes(x.id)).length;toast('Modo de apresentação ligado'+(n?' · '+n+(n===1?' aluno oculto':' alunos ocultos'):'')+' — toque no olho para sair','ok')}}
/* ---------- Diretor(a) de turma ---------- */
function dtDe(a,nome){const h=horarioDe(a,nome);return h&&h.diretor||''}
const tituloDT=(nome,cap)=>{const g=nome?guessGen(nome):'';const w=g==='F'?'Diretora de Turma':g==='M'?'Diretor de Turma':'Diretor(a) de Turma';return cap===false?w.toLowerCase():w};
function souDT(a,nome){if(!a)return false;const n=normTurma(nome);if((a.dt||[]).includes(n))return true;const d=dtDe(a,nome);return !!(d&&S.cfg.professor&&mesmoNome(d,S.cfg.professor))}
function minhasDT(a){if(!a)return [];const L=new Set();const ea=escAtiva();a.turmas.filter(t=>escId(escolaDe(t))===ea).forEach(t=>turmasDaClasse(t).forEach(n=>{if(souDT(a,n))L.add(n)}));Object.keys(a.horarios||{}).forEach(n=>{if(souDT(a,n))L.add(n)});(a.dt||[]).forEach(()=>{});return [...L].sort((x,y)=>x.localeCompare(y,'pt'))}
function navModular(){const b=document.querySelector('#side [data-v="modulos"]');if(!b)return;const t=T();const on=ehModular(t);b.hidden=!on;b.style.display=on?'':'none';if(on){const U=unidMod(t);b.querySelector('.lbl').textContent=U.p;b.title=U.p;if(VIEW==='modulos')$('#ttl').textContent=U.p+' — '+t.nome+' · '+t.disciplina}}
function sessBox(){const el=document.getElementById('sessBox');if(!el)return;const s=SESSAO;if(!s){el.innerHTML='';return}el.innerHTML=`<span class="sav">${esc((s.nome||s.u||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase())}</span><span class="snm"><b>${esc(s.nome||s.u)}</b><span>${s.tipo==='ms'?'Microsoft 365':esc(s.u)}</span></span><button class="btn sm ico" id="sessOut" title="Terminar sessão" aria-label="Terminar sessão">${ic('back',14)}</button>`;$('#sessOut').onclick=()=>{if(confirm('Terminar a sessão?'))terminarSessao()}}
function reunBadge(){const b=document.getElementById('reunBadge');if(!b)return;const a=A();if(!a){b.hidden=true;return}const hj=isoData(new Date());
  const n=reunioes(a).filter(r=>reunAtiva(r)&&r.data===hj&&reunFim(r)>Date.now()).length;const e=avisosReunioes(a).filter(v=>v.g==='erro').length;
  b.hidden=!(n||e);b.textContent=n||'!';b.className='nbadge'+(n?'':' bad');b.title=n?n+' reunião(ões) hoje':e+' aviso(s)'}
function animarNumeros(){if(REDUZ()||document.documentElement.classList.contains('a11y-rm'))return;const els=[...document.querySelectorAll('#view .kpi .v, #view .ringc b, #view .pvn b, #view .dimd .dd')].filter(e=>/^\d{1,4}$/.test(e.textContent.trim())&&!e.children.length).slice(0,24);
  els.forEach(e=>{const fim=+e.textContent.trim();if(fim<2)return;const t0=performance.now(),dur=Math.min(900,380+fim*6);e.textContent='0';
    e.setAttribute('aria-label',String(fim));const passo=t=>{if(e.dataset.vivo){e.removeAttribute('aria-label');return}const k=Math.min(1,(t-t0)/dur),ease=1-Math.pow(1-k,3);e.textContent=String(Math.round(fim*ease));if(k<1)requestAnimationFrame(passo);else e.removeAttribute('aria-label')};requestAnimationFrame(passo)})}
function decorar(root){
  titulos(root);envolverTabelas();acessib();try{apresAplicar()}catch(_){}
  (root||document).querySelectorAll('.btn:not([data-dec]),.card h2:not([data-dec]),#drawer .dwh b:not([data-dec])').forEach(el=>{
    el.dataset.dec=1;if(el.querySelector('svg'))return;
    const txt=el.textContent.trim();const L=el.tagName==='H2'||el.tagName==='B'?IC_H:IC_BTN;
    const m=L.find(([r])=>r.test(txt));if(!m)return;
    if(el.tagName==='BUTTON'&&/^[+←↻×⇄]\s*/.test(txt)&&el.firstChild&&el.firstChild.nodeType===3)el.firstChild.textContent=el.firstChild.textContent.replace(/^[+←↻⇄]\s*/,'');
    if(el.tagName==='BUTTON'&&txt==='×'){el.innerHTML=ic(m[1],14);return}
    el.insertAdjacentHTML('afterbegin',ic(m[1],el.tagName==='H2'?17:15)+' ');
  });
}
function barBtns(arr){$('#barx').innerHTML=arr.map(b=>`<button class="btn ${b.c||''}" id="${b.id}">${b.t}</button>`).join('');arr.forEach(b=>$('#'+b.id).onclick=b.f)}

