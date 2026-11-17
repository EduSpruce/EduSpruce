/* ===================== v0.917 · Avaliação ===================== */
const IC_AMP='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
/* --- Produção Oral: cotação global padrão = 50 (N4 10 · N3 8 · N2 6 · N1 2 · 0) --- */
function oralMan50(){const m={};ORAL_P.forEach(p=>m[p.k]={N4:10,N3:8,N2:6,N1:2,'0':0});return m}
function oralMig(o){const c=o.cfgGlob;if(!c||c._m50)return;c._m50=1;
  const manVazio=!Object.keys(c.man||{}).some(k=>Object.keys(c.man[k]||{}).some(n=>c.man[k][n]!==''&&c.man[k][n]!=null));
  const pesos20=ORAL_P.every(p=>+((c.pesos||{})[p.k])===20);
  const temReg=R=>Object.values(R||{}).some(r=>r&&r.n&&Object.values(r.n).some(Boolean));
  const usado=temReg(o.regs)||Object.values(o.regsI||{}).some(temReg);
  if(+c.total===60&&manVazio&&pesos20&&!usado){c.total=50;c.man=oralMan50()}}
function oralPadrao50(c){c.total=50;c.pesos={amb:20,cor:20,flu:20,des:20,int:20};c.man=oralMan50()}

/* --- nomes longos: um nome antes do apelido só pela inicial --- */
function nomeAbr(n,max){n=String(n||'').trim().replace(/\s+/g,' ');max=max||16;if(n.length<=max)return n;const p=n.split(' ');if(p.length<3)return n;
  const ini=w=>w[0].toUpperCase()+'.';const LIG=/^(de|da|do|das|dos|e)$/i;const meio=p.slice(1,-1).filter(w=>!LIG.test(w));
  let r=p[0]+(meio.length?' '+ini(meio[meio.length-1]):'')+' '+p[p.length-1];if(r.length>max)r=p[0]+' '+p[p.length-1];return r}

/* --- Produção Oral: grelha arrumada (microfone sempre no mesmo sítio) e pares --- */
function oralArrumar(t,raiz,editavel){const o=oralM(t);
  raiz.querySelectorAll('.oral-al').forEach(c=>{if(c.dataset.arr)return;c.dataset.arr=1;const tr=c.closest('tr');const q=sel=>{const x=tr&&tr.querySelector(sel);return x?(x.dataset.oen||x.dataset.orn||'').split('|')[0]:''};const aid=tr&&(tr.dataset.ora||q('[data-oen]')||q('[data-orn]'));
    const a=aid&&t.alunos.find(x=>x.id===aid);const sp=[...c.children].find(x=>x.tagName==='SPAN'&&!x.classList.contains('foto-al')&&!x.classList.contains('ava')&&!x.classList.contains('av')&&!x.classList.contains('evb')&&!x.querySelector('img'));
    if(a&&sp){const tag=sp.querySelector('.tag');sp.classList.add('ornm');sp.title=a.nome;sp.innerHTML=`<span class="ornt">${esc(nomeAbr(a.nome))}</span>${tag?tag.outerHTML:''}`}
    c.classList.add('oral-g');if(!a)return;const r=o.regs[a.id];const par=r&&r.par&&t.alunos.find(x=>x.id===r.par);
    if(sp&&par)sp.insertAdjacentHTML('beforeend',`<span class="orpar" title="Fez par com ${esc(par.nome)} (cada um tem a sua nota)">${ic('users',11)} ${esc(numAl(par))} · ${esc(nomeAbr(par.nome,16))}</span>`);
    const ev=c.querySelector('.evb');const bt=document.createElement('button');bt.type='button';bt.className='orparb'+(par?' on':'');bt.title=par?'Par: '+par.nome+' (alterar)':'Indicar o par';bt.setAttribute('aria-label',bt.title);bt.innerHTML=ic('users',14);
    if(!editavel)bt.hidden=true;if(ev)c.insertBefore(bt,ev);else{c.appendChild(bt);c.insertAdjacentHTML('beforeend','<span class="evb-vz"></span>')}
    bt.onclick=e=>{e.preventDefault();e.stopPropagation();oralParDlg(t,a)}})}
function oralParDlg(t,a){const o=oralM(t);const R=o.regs;const al=alunosAval(t).filter(x=>x.id!==a.id);const cur=R[a.id]&&R[a.id].par;
  openDrawer('Par na Produção Oral',`<div class="ed"><p class="hint" style="margin-top:0">Só para organização: indica com quem <b>${esc(a.nome)}</b> fez a produção oral. Cada aluno continua com a sua nota, individual e independente.</p>
    <div class="orpl"><label class="chk"><input type="radio" name="orp" value="" ${!cur?'checked':''}> <span class="mut">Sem par (individual)</span></label>
    ${al.map(x=>{const op=R[x.id]&&R[x.id].par&&R[x.id].par!==a.id?t.alunos.find(y=>y.id===R[x.id].par):null;return `<label class="chk"><input type="radio" name="orp" value="${x.id}" ${cur===x.id?'checked':''}> <b class="n">${esc(numAl(x))}</b> ${esc(x.nome)}${op?` <span class="mut">· já em par com ${esc(nomeAbr(op.nome,18))}</span>`:''}</label>`}).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="orp-ok">${ic('check',15)} Guardar</button><button class="btn" id="orp-x">Cancelar</button></div></div>`);
  $('#orp-x').onclick=closeDrawer;
  $('#orp-ok').onclick=()=>{const v=(document.querySelector('[name=orp]:checked')||{}).value||'';const larga=id=>{const r=R[id];if(r&&r.par){const q=R[r.par];if(q&&q.par===id)delete q.par;delete r.par}};
    larga(a.id);if(v){larga(v);R[a.id]=R[a.id]||{n:{}};R[v]=R[v]||{n:{}};R[a.id].par=v;R[v].par=a.id}saveNow();closeDrawer();
    if(VIEW==='oral')vOral();else if(VIEW==='instrumentos'&&UI.inst)vInstrumento(UI.inst);toast(v?'Par registado: '+nomeAbr(a.nome)+' ↔ '+nomeAbr((t.alunos.find(x=>x.id===v)||{}).nome):'Sem par','ok')}}
{const _vo917=vOral;vOral=function(){const r=_vo917.apply(this,arguments);try{const t=T();if(t&&$('#view .orreg'))oralArrumar(t,$('#view'),true);
  const seg=$('#view [data-ortot]')&&$('#view [data-ortot]').parentElement;if(seg&&!seg.querySelector('[data-ortot="50"]')){seg.insertAdjacentHTML('afterbegin',`<button type="button" data-or50 class="${+oralM(t).cfg.total===50?'on':''}" title="Padrão: N4 10 · N3 8 · N2 6 · N1 2 · 0">50 pontos (padrão)</button>`);
    seg.querySelector('[data-or50]').onclick=()=>{const c=oralM(t).cfg;oralPadrao50(c);saveNow();try{oralSync(t)}catch(_){}vOral();toast('Cotação padrão: 50 pontos (10 · 8 · 6 · 2 · 0 por parâmetro)','ok')}}
  const h=$('#view #or-cot .hint');if(h&&!h.dataset.p50){h.dataset.p50=1;h.innerHTML='Padrão EduSpruce: 5 parâmetros × <b>N4 10 · N3 8 · N2 6 · N1 2 · 0</b> = <b>50 pontos</b> (os critérios oficiais do Inglês 358 usam 12 · 8 · 6 · 2 · 0 = 60). Mude a cotação total e os pesos — as pontuações de cada nível são recalculadas em proporção. Pode editar qualquer valor à mão (fica a azul); se deixar de bater certo com os pesos, aparece um aviso.'}}catch(e){console.warn(e)}return r}}
{const _in917=instNotas;instNotas=function(t,i){const r=_in917.apply(this,arguments);try{const b=$('#i-body');if(b&&b.querySelector('.oretb'))oralArrumar(t,b,false);opcGrelha(t,i)}catch(e){console.warn(e)}return r}}

/* --- notas possíveis por item (lista em vez de escrever) --- */
const opcFmt=v=>String(r2(+v)).replace('.',',');
function opcLer(s,cot){return [...new Set(String(s||'').split(/\s*;\s*|\s+|,\s+/).map(x=>num(x)).filter(x=>x!=null&&!isNaN(x)&&x>=0&&x<=+cot+1e-9).map(x=>r2(x)))].sort((a,b)=>a-b)}
function opcGerar(tipo,cot){cot=+cot||0;const L=[];if(tipo==='int'){for(let x=0;x<=cot;x++)L.push(x)}else if(tipo==='meio'){for(let x=0;x<=cot+1e-9;x+=.5)L.push(r2(x))}
  else if(tipo==='q'){[0,.25,.5,.75,1].forEach(f=>L.push(r2(cot*f)))}else if(tipo==='n5'){[0,.2,.4,.6,.8,1].forEach(f=>L.push(r2(cot*f)))}return [...new Set(L)]}
async function anexoTexto(i,k){const x=i.anexos&&i.anexos[k];if(!x)throw new Error('Sem ficheiro de critérios de correção.');let u=FOTOS[x.id];if(!u&&typeof idbDe==='function'){try{u=await idbDe(x.id)}catch(_){}}if(!u)throw new Error('O ficheiro dos critérios não está disponível neste dispositivo.');
  const b=atob(u.split(',')[1]);const arr=new Uint8Array(b.length);for(let j=0;j<b.length;j++)arr[j]=b.charCodeAt(j);const nm=(x.nome||'').toLowerCase();
  if(/\.pdf$/.test(nm)||/pdf/.test(x.tipo||'')){const lib=await getPdfLib();const doc=await lib.getDocument({data:arr.buffer}).promise;let txt='';
    for(let p=1;p<=doc.numPages;p++){const tc=await (await doc.getPage(p)).getTextContent();let y=null;tc.items.forEach(it=>{const yy=it.transform?Math.round(it.transform[5]):y;if(y!=null&&yy!==y)txt+='\n';else if(txt&&!/\s$/.test(txt))txt+=' ';txt+=it.str;y=yy;if(it.hasEOL){txt+='\n';y=null}});txt+='\n'}return txt}
  if(/\.docx$/.test(nm)||/wordprocessingml/.test(x.tipo||'')){const z=await unzip(arr.buffer);const xml=await z.text('word/document.xml');return String(xml||'').replace(/<w:tab\/>/g,' ').replace(/<\/w:p>/g,'\n').replace(/<\/w:tc>/g,' \t ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")}
  throw new Error('Só consigo ler critérios em PDF ou Word (.docx).')}
function opcDosCriterios(txt,it){const lab=String(itFolha(it)||'').trim().replace(/\.$/,'');if(!lab)return [];const cot=+it.cot||0;const e=lab.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const rx=new RegExp('(^|\\n|\\s)(?:item\\s*|quest[aã]o\\s*|pergunta\\s*)?'+e+'\\.?(?=[\\s):–-])','gi');const out=new Set();let m;
  while((m=rx.exec(txt))){const ini=m.index+m[0].length;let seg=txt.slice(ini,ini+1500);const nx=seg.slice(3).search(/\n\s*(?:item\s*)?\d+(?:\.\d+)*\.?\s+(?=\D)/i);if(nx>0)seg=seg.slice(0,nx+3);
    let q;const r1=/(\d+(?:[.,]\d+)?)\s*(?:pontos|ponto|pts?\b|p\b|valores|val\.)/gi;while((q=r1.exec(seg))){const v=num(q[1]);if(v!=null&&v<=cot+1e-9)out.add(r2(v))}
    const r2_=/(?:^|\n)\s*(?:n[ií]vel\s*\d|n\d|\d\s*[-–])[^\n]*?(\d+(?:[.,]\d+)?)\s*$/gim;while((q=r2_.exec(seg))){const v=num(q[1]);if(v!=null&&v<=cot+1e-9)out.add(r2(v))}}
  if(out.size){out.add(0);out.add(r2(cot))}return [...out].sort((a,b)=>a-b)}
function opcDlg(t,i,it,re){const tem=!!(i.anexos&&i.anexos.correcao);
  openDrawer('Notas Possíveis — '+itFolha(it),`<div class="ed"><p class="hint" style="margin-top:0">Escolha as classificações que este item pode ter (cotação <b>${opcFmt(it.cot)}</b> pts). Na grelha passa a aparecer uma lista em vez de uma caixa de texto.</p>
    <label for="opc-v">Valores possíveis</label><input id="opc-v" value="${esc((it.opc||[]).map(opcFmt).join('; '))}" placeholder="ex.: 0; 2; 4; 6; 8; 10" inputmode="decimal">
    <div class="opcprev" id="opc-p"></div>
    <label style="margin-top:12px">Sugestões</label><div class="row" style="gap:6px;flex-wrap:wrap">
      <button class="btn sm" data-og="n5">Níveis de desempenho (0–5)</button><button class="btn sm" data-og="q">0 · 25 · 50 · 75 · 100 %</button>${+it.cot<=40?'<button class="btn sm" data-og="int">Números inteiros</button>':''}${+it.cot<=12?'<button class="btn sm" data-og="meio">De meio em meio ponto</button>':''}
      <button class="btn sm" id="opc-cc" ${tem?'':'disabled title="Anexe primeiro os critérios de correção (PDF ou Word) no instrumento"'}>${ic('checks',13)} Ler dos critérios de correção</button></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="opc-ok">${ic('check',15)} Guardar</button><button class="btn" id="opc-cl">Sem lista (escrever)</button></div></div>`);
  const prev=()=>{const L=opcLer($('#opc-v').value,it.cot);$('#opc-p').innerHTML=L.length?L.map(v=>`<span class="chip">${opcFmt(v)}</span>`).join(''):'<span class="mut">Sem valores — a grelha mantém a caixa de texto.</span>'};prev();$('#opc-v').oninput=prev;
  $$('[data-og]').forEach(b=>b.onclick=()=>{$('#opc-v').value=opcGerar(b.dataset.og,it.cot).map(opcFmt).join('; ');prev()});
  $('#opc-cc').onclick=async()=>{const b=$('#opc-cc');b.disabled=true;b.textContent='A ler…';try{const L=opcDosCriterios(await anexoTexto(i,'correcao'),it);if(!L.length)toast('Não encontrei pontuações para “'+itFolha(it)+'” nos critérios. Escreva-as ou use uma sugestão.','erro');else{$('#opc-v').value=L.map(opcFmt).join('; ');prev()}}catch(e){toast(e.message||'Não foi possível ler os critérios','erro')}b.disabled=false;b.innerHTML=ic('checks',13)+' Ler dos critérios de correção'};
  $('#opc-ok').onclick=()=>{const L=opcLer($('#opc-v').value,it.cot);if(L.length)it.opc=L;else delete it.opc;saveNow();closeDrawer();re()};
  $('#opc-cl').onclick=()=>{delete it.opc;saveNow();closeDrawer();re()}}
async function opcTodosCriterios(t,i,re){try{toast('A ler os critérios de correção…');const txt=await anexoTexto(i,'correcao');let n=0;i.itens.forEach(it=>{if(it.oralLig)return;const L=opcDosCriterios(txt,it);if(L.length>2){it.opc=L;n++}});saveNow();re();
  toast(n?`Notas possíveis encontradas para ${n} de ${i.itens.length} itens — confirme em cada item.`:'Não encontrei pontuações por item nos critérios.',n?'ok':'erro')}catch(e){toast(e.message||'Não foi possível ler os critérios','erro')}}
{const _ii917=instItens;instItens=function(t,i){const r=_ii917.apply(this,arguments);try{const re=()=>manterPosicao(()=>instItens(t,i));
  $$('#i-body .itf[data-k]').forEach(row=>{const it=i.itens[+row.dataset.k];if(!it||row.querySelector('.itopc'))return;const w=row.querySelector('.itcw');if(!w)return;const n=(it.opc||[]).length;
    w.insertAdjacentHTML('afterend',`<button type="button" class="itopc ${n?'on':''}" title="${n?'Notas possíveis: '+it.opc.map(opcFmt).join(' · '):'Definir as notas possíveis (lista na grelha)'}" aria-label="Notas possíveis" ${it.oralLig?'hidden':''}>${ic('list',13)}${n?`<small>${n}</small>`:''}</button>`);
    row.querySelector('.itopc').onclick=()=>opcDlg(t,i,it,re)});
  const bar=$('#i-body .itbar2');if(bar&&!bar.querySelector('#opc-all')&&i.anexos&&i.anexos.correcao)bar.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:8px"><button type="button" class="btn sm" id="opc-all">${ic('checks',13)} Notas possíveis a partir dos critérios de correção</button></div>`);
  const ba=$('#opc-all');if(ba)ba.onclick=()=>opcTodosCriterios(t,i,re)}catch(e){console.warn(e)}return r}}
function opcGrelha(t,i){const M={};i.itens.forEach(it=>{if(it.opc&&it.opc.length&&!it.oralLig)M[it.id]=it});if(!Object.keys(M).length)return;
  $$('#grid input[data-i]').forEach(inp=>{const it=M[inp.dataset.i];if(!it||inp.classList.contains('orro')||inp.nextElementSibling&&inp.nextElementSibling.classList.contains('opcsel'))return;
    const v=num(inp.value);const s=document.createElement('select');s.className='opcsel';s.setAttribute('aria-label',(inp.getAttribute('aria-label')||itFolha(it))+' — nota');
    s.innerHTML='<option value="">—</option>'+it.opc.map(x=>`<option value="${x}" ${v!=null&&Math.abs(v-x)<1e-6?'selected':''}>${opcFmt(x)}</option>`).join('')+(v!=null&&!it.opc.some(x=>Math.abs(v-x)<1e-6)?`<option value="${v}" selected>${opcFmt(v)}*</option>`:'');
    if(inp.readOnly)s.disabled=true;inp.classList.add('opch');inp.after(s);
    s.onchange=()=>{inp.value=s.value===''?'':opcFmt(s.value);inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))};
    s.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const r=+inp.dataset.r+1,c=inp.dataset.c;const nx=document.querySelector(`#grid [data-r="${r}"][data-c="${c}"]`);if(nx){const ns=nx.nextElementSibling&&nx.nextElementSibling.classList.contains('opcsel')?nx.nextElementSibling:nx;ns.focus()}}}})}

/* --- vista ampla do instrumento (grelha e itens), como o Perfil de Aprendizagem --- */
{const _vi917=vInstrumento;vInstrumento=function(id){const pb=document.querySelector('#ampv.ampinst .ampb');const st=pb?pb.scrollTop:0;const r=_vi917.apply(this,arguments);try{instAmpla(id,st)}catch(e){console.warn(e)}return r}}
function instAmpla(id,st){const t=T();const i=t&&t.instrumentos.find(x=>x.id===id);const card=$('#view .card.wide');const tabs=card&&card.querySelector(':scope > .tabs');if(!i||!card||!tabs)return;
  if(!tabs.querySelector('.ampbtn'))tabs.insertAdjacentHTML('beforeend',`<button type="button" class="ampbtn noprint" title="Abrir em vista ampla">${IC_AMP} Vista Ampla</button>`);
  tabs.querySelector('.ampbtn').onclick=()=>{UI.instAmp=id;vInstrumento(id)};
  if(UI.instAmp!==id){const x=document.getElementById('ampv');if(x&&x.classList.contains('ampinst'))x.remove(),document.body.classList.remove('amp-on');return}
  tabs.querySelector('.ampbtn').hidden=true;const lab={notas:'Classificações',itens:'Itens e cotações',stats:'Análise'}[UI.instTab]||'';
  const ph=document.createElement('div');ph.className='card empty ampph';ph.innerHTML=`${IC_AMP}<br>${esc(i.nome)} está aberto em vista ampla.<br><br><button class="btn" type="button">Voltar ao ecrã normal</button>`;card.before(ph);
  const pr=document.createElement('button');pr.className='btn sm';pr.type='button';pr.innerHTML=ic('printer',14)+' Imprimir';pr.onclick=()=>{document.body.classList.add('print-landscape');typeof imprimirVista==='function'?imprimirVista():window.print()};
  const d=ecraAmplo({titulo:i.nome,sub:t.nome+(lab?' · '+lab:''),el:card,acoes:[pr],aoFechar:()=>{UI.instAmp=null;if(VIEW==='instrumentos'&&UI.inst===id)vInstrumento(id)}});d.classList.add('ampinst');
  ph.querySelector('button').onclick=()=>ecraAmplo.fechar();if(st){const b=d.querySelector('.ampb');if(b)b.scrollTop=st}}
{const _g917=go;go=function(v){if(UI.instAmp&&v!=='instrumentos'){UI.instAmp=null;const x=document.getElementById('ampv');if(x&&x.classList.contains('ampinst')){x.remove();document.body.classList.remove('amp-on')}}return _g917.apply(this,arguments)}}

/* --- Momento de Avaliação Completo e Momento de um Domínio --- */
function aulasOrd(t){try{return Object.keys(ocorrenciasTurma(t,A())).sort()}catch(_){return []}}
const aulaSeg=(t,iso)=>aulasOrd(t).find(d=>d>iso)||'';
const aulaAnt=(t,iso)=>aulasOrd(t).filter(d=>d<iso).pop()||'';
function sumAuto(t,iso,txt,ant){if(!iso&&!ant)return;const a=A();const SM=sumariosT(a,t);let L=[];try{L=listaAulas(t,a)}catch(_){}
  if(ant&&ant.d){const x=L.find(z=>z.data===ant.d);const s=x&&SM[x.k];if(s&&s.auto===ant.txt&&(s.texto||'')===ant.txt){delete s.texto;delete s.auto}}
  if(!iso)return;const x=L.find(z=>z.data===iso);if(!x)return;const s=SM[x.k]=SM[x.k]||{};if(!(s.texto||'').trim()){s.texto=txt;s.auto=txt}}
const TXT_REV='Aula de revisões para o teste.',TXT_PO='Momento de avaliação: Produção Oral.';
function momentoDatas(t,i,data,poData,revData){const dO=domOral(t);const antPo=i.poData,antRev=i.revData;
  i.revData=revData===undefined?aulaAnt(t,data):revData;i.poData=dO&&i.itens.some(it=>it.dom===dO.id)?(poData===undefined?aulaSeg(t,data):poData):'';
  if(antRev!==i.revData)sumAuto(t,i.revData,TXT_REV,{d:antRev,txt:TXT_REV});if(antPo!==i.poData)sumAuto(t,i.poData,TXT_PO,{d:antPo,txt:TXT_PO})}
function criarMomento(t,o){const dO=domOral(t);const per=Math.min(periodoDe(o.data)||perAtual(t),periodos().length);
  let doms=o.dom?t.dominios.filter(d=>d.id===o.dom):t.dominios.slice();if(!doms.length)return null;const TOT=o.dom?100:200;
  const n=doms.length;const base=Math.floor(TOT/n*100)/100;const itens=doms.map((d,k)=>({id:uid()+k,niv:[d.ab||d.nome],rot:d.ab||d.nome,dom:d.id,cot:base}));
  const oi=itens.find(it=>dO&&it.dom===dO.id);const fix=oi||itens[itens.length-1];fix.cot=r2(TOT-itens.filter(x=>x!==fix).reduce((s,x)=>s+x.cot,0));if(oi){oi.oralLig=true;oi.rot=oi.niv[0]=(dO.ab||'PO')}
  const i={id:uid(),nome:o.nome,tipo:'Momento de Avaliação',periodo:per,data:o.data,obs:o.obs||'',itens,notas:{},completo:!o.dom,momento:o.dom?'dominio':'completo'};t.instrumentos.push(i);
  if(!o.dom)momentoDatas(t,i,o.data);else if(oi)i.poData='';
  if(oi){try{oralTrocar(t,i.id);oralSync(t)}catch(e){console.warn(e)}}return i}
{const _md917=marcarDlg;marcarDlg=function(t,iso,insId){const r=_md917.apply(this,arguments);try{marcarMomento(t,iso,insId)}catch(e){console.warn(e)}return r}}
function marcarMomento(t,iso,insId){const cat=$('#dw-b .nlcat');const ok=$('#mk-ok');if(!cat||!ok)return;const ex=insId?t.instrumentos.find(i=>i.id===insId):null;const dO=domOral(t);
  const orig=ok.onclick;let modo=ex&&ex.momento||null;const st={dom:(t.dominios[0]||{}).id};
  if(!ex){cat.insertAdjacentHTML('afterbegin',`<button type="button" data-mm="completo" class="mmb"><span class="mtp" style="--pc:${TIPO_COR('Momento de Avaliação')}">MA</span> Momento de Avaliação Completo</button><button type="button" data-mm="dominio" class="mmb"><span class="mtp" style="--pc:${TIPO_COR('Momento de Avaliação')}">MA</span> Momento de um Domínio</button>`)}
  const box=document.createElement('div');box.className='mmbox';cat.after(box);
  const nomeSug=m=>{const n=t.instrumentos.filter(i=>i.momento&&+i.periodo===(periodoDe($('#mk-data').value)||perAtual(t))).length+1;return m==='dominio'?'Momento de Avaliação — '+((domById(t,st.dom)||{}).ab||''):'Momento de Avaliação '+n};
  const desenha=()=>{const d=$('#mk-data').value||iso;
    if(modo==='completo'){const po=ex?ex.poData:(dO?aulaSeg(t,d):''),rv=ex?ex.revData:aulaAnt(t,d);const doms=t.dominios;const cot=r2(200/(doms.length||1));
      box.innerHTML=`<div class="mmi"><div class="mmh">${ic('layers',15)} <b>Abrange todos os domínios · 200 pontos (20 valores)</b></div>
        <div class="mmd">${doms.map(x=>`<span class="chip ${dO&&x.id===dO.id?'or':''}">${esc(x.ab||x.nome)} ${dO&&x.id===dO.id?'· aula seguinte':''}</span>`).join('')}</div>
        <div class="g2" style="margin-top:8px">${dO?`<div><label for="mm-po">${ic('fala',13)} Produção Oral (ligada)</label><input type="date" id="mm-po" value="${esc(po||'')}"><div class="hint" style="margin:4px 0 0">${po?'Aula seguinte: '+esc(fmtIsoL(po)):'Sem aula seguinte no horário'}</div></div>`:''}
        <div><label for="mm-rv">${ic('book',13)} Aula de revisões</label><input type="date" id="mm-rv" value="${esc(rv||'')}"><div class="hint" style="margin:4px 0 0">${rv?'Aula anterior: '+esc(fmtIsoL(rv)):'Sem aula anterior no horário'}</div></div></div>
        <p class="hint" style="margin:8px 0 0">${doms.filter(x=>!dO||x.id!==dO.id).map(x=>esc(x.ab||x.nome)).join(', ')} ${doms.length>1?'são':'é'} avaliad${doms.length>1?'os':'o'} no dia marcado${dO?'; a '+esc(dO.ab||'PO')+' fica marcada e ligada à grelha da Produção Oral na aula seguinte (pode mudar a data, continua ligada)':''}. As revisões ficam no sumário da aula anterior.${ex?'':' Cotação de cada domínio: '+fmtP(cot)+' pontos.'}</p></div>`}
    else if(modo==='dominio'&&!ex){box.innerHTML=`<div class="mmi"><label for="mm-dom">Domínio</label><select id="mm-dom">${t.dominios.map(x=>`<option value="${x.id}" ${x.id===st.dom?'selected':''}>${esc(x.ab)} — ${esc(x.nome)}</option>`).join('')}</select><p class="hint" style="margin:6px 0 0">Cria um momento só deste domínio (100 pontos).${dO?' Se for a '+esc(dO.ab||'PO')+', fica ligado à grelha da Produção Oral.':''}</p></div>`;
      $('#mm-dom').onchange=e=>{st.dom=e.target.value;$('#mk-nome').value=nomeSug('dominio')}}
    else box.innerHTML=''};
  const marca=m=>{modo=m;$$('#dw-b [data-tp]').forEach(x=>x.classList.toggle('on',!m&&x.classList.contains('on')));$$('#dw-b [data-mm]').forEach(x=>x.classList.toggle('on',x.dataset.mm===m));if(m&&!ex)$('#mk-nome').value=nomeSug(m);desenha()};
  $$('#dw-b [data-mm]').forEach(b=>b.onclick=()=>marca(b.dataset.mm));
  $$('#dw-b [data-tp]').forEach(b=>b.addEventListener('click',()=>{modo=ex&&ex.momento||null;$$('#dw-b [data-mm]').forEach(x=>x.classList.remove('on'));desenha()}));
  if(ex&&ex.momento){$$('#dw-b [data-tp]').forEach(x=>x.classList.remove('on'));cat.insertAdjacentHTML('afterbegin',`<button type="button" class="mmb on" disabled><span class="mtp" style="--pc:${TIPO_COR('Momento de Avaliação')}">MA</span> ${ex.momento==='completo'?'Momento de Avaliação Completo':'Momento de um Domínio'}</button>`)}
  const md=$('#mk-data');if(md)md.addEventListener('change',()=>{if(modo==='completo'&&!ex)desenha()});desenha();
  ok.onclick=e=>{if(ex){const dAnt=ex.data,poO=ex.poData||'',rvO=ex.revData||'';const po=$('#mm-po'),rv=$('#mm-rv');const poV=po?po.value:poO,rvV=rv?rv.value:rvO;
      const tp=ex.tipo;orig.call(ok,e);if(ex.momento&&t.instrumentos.includes(ex)){ex.tipo=tp;if(ex.momento==='completo'){const mud=ex.data!==dAnt;momentoDatas(t,ex,ex.data,poV!==poO?poV:(mud?undefined:poO),rvV!==rvO?rvV:(mud?undefined:rvO))}saveNow();vTestes()}return}
    if(!modo)return orig.call(ok,e);const data=$('#mk-data').value;if(!data)return alert('Indique a data.');
    const i=criarMomento(t,{data,nome:$('#mk-nome').value.trim()||nomeSug(modo),obs:$('#mk-obs').value.trim(),dom:modo==='dominio'?($('#mm-dom')||{}).value||st.dom:null});if(!i)return alert('Defina primeiro os domínios em Critérios.');
    if(modo==='completo'){const po=$('#mm-po'),rv=$('#mm-rv');const ch={po:po&&po.value!==i.poData?po.value:undefined,rv:rv&&rv.value!==i.revData?rv.value:undefined};if(ch.po!==undefined||ch.rv!==undefined)momentoDatas(t,i,data,ch.po!==undefined?ch.po:i.poData,ch.rv!==undefined?ch.rv:i.revData)}
    const extra=[];$$('#dw-b [data-par]').forEach(c=>{if(!c.checked)return;const x=A().turmas.find(q=>q.id===c.dataset.par);if(!x)return;const d2=aulasOrd(x).find(d=>d>=data)||data;const dm=modo==='dominio'?(x.dominios.find(q=>q.ab===(domById(t,i.itens[0].dom)||{}).ab)||{}).id:null;if(modo==='dominio'&&!dm)return;criarMomento(x,{data:d2,nome:i.nome,obs:i.obs,dom:dm});extra.push(x.nome+' '+fmtIso(d2))});
    saveNow();closeDrawer();vTestes();toast(i.nome+' · '+fmtIsoL(data)+(i.poData?' · PO a '+fmtIsoL(i.poData):'')+(i.revData?' · revisões a '+fmtIsoL(i.revData):'')+(extra.length?' · também: '+extra.join(', '):''),'ok')}}
{const _vt917=vTestes;vTestes=function(){const r=_vt917.apply(this,arguments);try{const t=T();if(!t)return r;
  t.instrumentos.filter(i=>i.momento==='completo'&&i.data).forEach(i=>{const add=(iso,html,fn)=>{if(!iso)return;const c=document.querySelector(`#view [data-mt="${iso}"]`);if(!c)return;c.insertAdjacentHTML('beforeend',html);const el=c.lastElementChild;el.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();fn()})};
    add(i.poData,`<span class="mtp mtpo" style="--pc:${TIPO_COR('Prova Oral')}" title="${esc(i.nome)}: Produção Oral (ligada)">PO</span>`,()=>marcarDlg(t,i.data,i.id));
    add(i.revData,`<span class="mtrv" title="Aula de revisões para ${esc(i.nome)}">Rev</span>`,()=>marcarDlg(t,i.data,i.id))});
  momentoArrastar(t)}catch(e){console.warn(e)}return r}}
/* arrastar a PO ligada ou as revisões para outra aula (continua ligada) */
function momentoArrastar(t){let st=null;const alvo=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('[data-mt]'):null};
  $$('#view .mtpo,#view .mtrv').forEach(el=>{const cel=el.closest('[data-mt]');const iso=cel&&cel.dataset.mt;const i=t.instrumentos.find(x=>x.momento==='completo'&&(el.classList.contains('mtpo')?x.poData===iso:x.revData===iso));if(!i)return;
    el.addEventListener('pointerdown',e=>{if(e.button>0)return;e.stopPropagation();st={el,x:e.clientX,y:e.clientY,on:false,td:null};try{el.setPointerCapture(e.pointerId)}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!st||st.el!==el)return;if(!st.on){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<8)return;st.on=true;st.gh=el.cloneNode(true);st.gh.classList.add('ghost');document.body.appendChild(st.gh);el.style.opacity=.3}
      e.preventDefault();Object.assign(st.gh.style,{left:(e.clientX-14)+'px',top:(e.clientY-12)+'px'});const td=alvo(e.clientX,e.clientY);if(td!==st.td){if(st.td)st.td.classList.remove('drop');st.td=td;if(td)td.classList.add('drop')}});
    const fim=e=>{if(!st||st.el!==el)return;const s_=st;st=null;if(!s_.on)return;s_.gh.remove();el.style.opacity='';if(s_.td)s_.td.classList.remove('drop');cel._arr=true;setTimeout(()=>cel._arr=false,400);
      const td=s_.td;if(!td||td.dataset.mt===iso)return;const nv=td.dataset.mt;if(el.classList.contains('mtpo'))momentoDatas(t,i,i.data,nv,i.revData);else momentoDatas(t,i,i.data,i.poData,nv);saveNow();vTestes();
      toast((el.classList.contains('mtpo')?'Produção Oral':'Revisões')+' de '+i.nome+' → '+fmtIsoL(nv),'ok')};
    el.addEventListener('pointerup',fim);el.addEventListener('pointercancel',()=>{if(st&&st.el===el){if(st.gh)st.gh.remove();el.style.opacity='';st=null}})})}
/* a PO ligada aparece na grelha da Produção Oral com a data dela */
{const _om917=oralMomentos;oralMomentos=function(t){const L=_om917.apply(this,arguments);try{L.forEach(m=>{if(m.i&&m.i.momento==='completo'&&m.i.poData)m.data=m.i.poData})}catch(_){}return L}}

/* --- seletor de datas próprio (calendário escolar, aulas da turma, semana a começar à segunda) --- */
const DP={el:null,inp:null};
function dpFechar(){if(DP.el){DP.el.remove();DP.el=null}if(DP.inp){DP.inp.classList.remove('dp-on');DP.inp=null}document.removeEventListener('pointerdown',dpFora,true)}
function dpFora(e){if(DP.el&&!DP.el.contains(e.target)&&e.target!==DP.inp)dpFechar()}
function dpAbrir(inp){if(DP.inp===inp)return dpFechar();dpFechar();if(inp.disabled||inp.readOnly)return;DP.inp=inp;inp.classList.add('dp-on');
  const v=inp.value||isoData(new Date());let ym=v.slice(0,7);let foco=v;const a=A();const cal=a&&a.calendario;const t=T();let oc={};try{if(t&&cal)oc=ocorrenciasTurma(t,a)}catch(_){}
  const host=inp.closest('dialog[open]')||document.body;const el=document.createElement('div');el.className='esdp';el.setAttribute('role','dialog');el.setAttribute('aria-label','Escolher data');host.appendChild(el);DP.el=el;
  const mn=inp.min||'',mx=inp.max||'';
  const pinta=()=>{const [y,m]=ym.split('-').map(Number);const nd=new Date(y,m,0).getDate();const dw0=(new Date(y,m-1,1).getDay()+6)%7;const hj=isoData(new Date());let h='';
    for(let k=0;k<dw0;k++)h+='<span class="dpkv"></span>';
    for(let d=1;d<=nd;d++){const iso=isoD(y,m,d);const dw=(dw0+d-1)%7;const tp=cal&&cal.dias?cal.dias[iso]:null;const nl=tp&&!LETIVOS.includes(tp);const fora=(mn&&iso<mn)||(mx&&iso>mx);const T_=nl?(TIPOS_DIA[tp]||{}):null;
      h+=`<button type="button" class="dpkd ${dw>4?'fds':''} ${nl?'nl':''} ${oc[iso]?'dpa':''} ${iso===hj?'hj':''} ${iso===inp.value?'sel':''} ${iso===foco?'fo':''}" data-d="${iso}" ${fora?'disabled':''} tabindex="${iso===foco?0:-1}" title="${esc(fmtIsoL(iso)+(T_&&T_.n?' · '+T_.n:'')+(oc[iso]?' · aula de '+t.nome:''))}" ${nl&&T_&&T_.cor?`style="--tc:${T_.cor}"`:''}>${d}</button>`}
    el.innerHTML=`<div class="dpkh"><button type="button" class="dpkn" data-n="-1" aria-label="Mês anterior">‹</button><b>${MESES[m]} ${y}</b><button type="button" class="dpkn" data-n="1" aria-label="Mês seguinte">›</button></div>
      <div class="dpkg">${['S','T','Q','Q','S','S','D'].map(x=>`<span class="dpkw">${x}</span>`).join('')}${h}</div>
      <div class="dpkt"><label>${ic('pencil',13)}<input type="text" class="dpki" style="border:0!important;box-shadow:none!important;background:transparent!important;outline:0!important;padding:0!important;min-height:0!important" inputmode="numeric" autocomplete="off" placeholder="Escrever a data: dd/mm/aaaa" aria-label="Escrever a data (dia/mês/ano)" value="${inp.value?inp.value.split('-').reverse().join('/'):''}"></label><button type="button" class="btn sm pri dpko">OK</button></div><small class="dpke" role="alert"></small>
      <div class="dpkf"><button type="button" class="btn sm" data-q="hj">Hoje</button>${inp.required?'':'<button type="button" class="btn sm" data-q="x">Limpar</button>'}<span class="sp1"></span>${t&&Object.keys(oc).length?`<span class="dpkl"><i class="dpa"></i> aula de ${esc(t.nome)}</span>`:''}</div>`;
    el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const [yy,mm]=ym.split('-').map(Number);const d=new Date(yy,mm-1+(+b.dataset.n),1);ym=isoData(d).slice(0,7);foco=ym+'-01';pinta()});
    el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>esc_(b.dataset.d));
    el.querySelector('[data-q="hj"]').onclick=()=>esc_(isoData(new Date()));const x=el.querySelector('[data-q="x"]');if(x)x.onclick=()=>esc_('');
    const ti=el.querySelector('.dpki'),te=el.querySelector('.dpke');const aplica=()=>{const iso=dpLer(ti.value);if(!iso){te.textContent=ti.value.trim()?'Data inválida — use dia/mês/ano, por exemplo 25/12/2026':'';return}if((mn&&iso<mn)||(mx&&iso>mx)){te.textContent='Fora do intervalo permitido';return}esc_(iso)};
    ti.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();aplica()}else if(e.key==='Escape'){e.preventDefault();const i_=inp;dpFechar();i_.focus()}});
    ti.addEventListener('input',()=>{te.textContent='';const iso=dpLer(ti.value);if(iso&&iso.slice(0,7)!==ym&&ti.value.replace(/\D/g,'').length>=6){ym=iso.slice(0,7);foco=iso;const v=ti.value,p=ti.selectionStart;pinta();const n=el.querySelector('.dpki');n.value=v;n.focus();try{n.setSelectionRange(p,p)}catch(_){}}});
    el.querySelector('.dpko').onclick=aplica;pos()};
  const esc_=iso=>{inp.value=iso;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));const i_=inp;dpFechar();try{i_.focus({preventScroll:true})}catch(_){}};
  const pos=()=>{const r=inp.getBoundingClientRect();const W=el.offsetWidth,H=el.offsetHeight;let x=Math.min(Math.max(8,r.left),innerWidth-W-8),y=r.bottom+6;if(y+H>innerHeight-8)y=Math.max(8,r.top-H-6);el.style.left=x+'px';el.style.top=y+'px'};
  el.addEventListener('keydown',e=>{const mv={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];if(mv){e.preventDefault();const d=dataDeIso(foco);d.setDate(d.getDate()+mv);foco=isoData(d);ym=foco.slice(0,7);pinta();const f=el.querySelector('.fo');if(f)f.focus()}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();const i_=inp;dpFechar();i_.focus()}else if(e.key==='PageUp'||e.key==='PageDown'){e.preventDefault();el.querySelector(`[data-n="${e.key==='PageUp'?-1:1}"]`).click()}});
  pinta();setTimeout(()=>document.addEventListener('pointerdown',dpFora,true),0);addEventListener('resize',dpFechar,{once:true});document.addEventListener('scroll',function sc(ev){if(DP.el&&!DP.el.contains(ev.target)){dpFechar();document.removeEventListener('scroll',sc,true)}},true)}
document.addEventListener('pointerdown',e=>{const inp=e.target&&e.target.closest&&e.target.closest('input[type=date]');if(!inp||S.cfg&&S.cfg.dpNativo)return;
  if(e.pointerType==='mouse'){if(DP.inp!==inp)setTimeout(()=>{if(DP.inp!==inp)dpAbrir(inp)},0);return} /* rato: o campo recebe o foco e pode-se escrever a data diretamente */
  e.preventDefault();dpAbrir(inp)},true);
/* data escrita à mão: 25/12/2026 · 25-12-26 · 25.12 · 251226 · 25122026 · 2026-12-25 */
function dpLer(t){t=String(t||'').trim();if(!t)return '';let d,m,y;let q=t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if(q){y=+q[1];m=+q[2];d=+q[3]}else{q=t.match(/^(\d{1,2})\s*[-/. ]\s*(\d{1,2})(?:\s*[-/. ]\s*(\d{2,4}))?$/);if(q){d=+q[1];m=+q[2];y=q[3]?+q[3]:null}
    else{const n=t.replace(/\D/g,'');if(/^\d+$/.test(t)&&(n.length===4||n.length===6||n.length===8)){d=+n.slice(0,2);m=+n.slice(2,4);y=n.length>4?+n.slice(4):null}else return ''}}
  if(y==null)y=new Date().getFullYear();else if(y<100)y+=2000;if(m<1||m>12||d<1||d>31||y<1900||y>2100)return '';const dt=new Date(y,m-1,d);if(dt.getMonth()!==m-1)return '';return isoD(y,m,d)}
document.addEventListener('input',e=>{const inp=e.target;if(DP.inp!==inp||!DP.el||!inp.value)return;const ti=DP.el.querySelector('.dpki');if(ti&&document.activeElement!==ti)ti.value=inp.value.split('-').reverse().join('/')},true);
document.addEventListener('click',e=>{const inp=e.target&&e.target.closest&&e.target.closest('input[type=date]');if(inp&&!(S.cfg&&S.cfg.dpNativo))e.preventDefault()},true);
document.addEventListener('keydown',e=>{const inp=e.target&&e.target.matches&&e.target.matches('input[type=date]')?e.target:null;if(!inp||S.cfg&&S.cfg.dpNativo)return;if(e.key===' '||(e.key==='ArrowDown'&&e.altKey)||e.key==='F4'){e.preventDefault();dpAbrir(inp);setTimeout(()=>{const f=DP.el&&DP.el.querySelector('.fo');if(f)f.focus()},0)}},true);
document.addEventListener('touchend',e=>{const inp=e.target&&e.target.closest&&e.target.closest('input[type=date]');if(inp&&!(S.cfg&&S.cfg.dpNativo))e.preventDefault()},{capture:true,passive:false});

/* v0.917 · logótipos SGE (azul), Clássico (escuro) e Claro + Automático (segue o tema) */
