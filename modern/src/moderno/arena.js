/* ===================== EduSpruce Arena · app do professor =====================
   Conjuntos de perguntas, lançamento de jogos (ao vivo ou trabalho de casa), ecrã do anfitrião para projetar,
   relatórios e associação à turma. Os conjuntos e os relatórios ficam nos dados do professor (cifrados, na base de dados);
   os jogos usam as tabelas da Arena (ver supabase/migrations/0012_arena.sql). Módulo desativável nas Definições. */
const AR=window.ARENA;
const arOn=()=>S.cfg.arenaOn!==false;
const arD=()=>{S.arena=S.arena||{};const d=S.arena;d.conj=d.conj||[];d.jogos=d.jogos||[];return d};
const arMoedasOn=()=>S.cfg.arenaMoedas!==false;
async function arRpc(fn,args){const p=await sbObter();const c=p.cliente;if(!c||!c.rpc)throw new Error('A base de dados não está disponível.');const {data,error}=await c.rpc(fn,args||{});
  if(error){const m=String(error.message||error.code||error);if(/function .* does not exist|PGRST202|Could not find the function/i.test(m)){const e=new Error('A Arena ainda não está instalada na base de dados: falta correr o ficheiro 0012_arena.sql no Supabase.');e.semSql=true;throw e}throw new Error(m)}return data}
const arUrl=c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'arena.html#'+AR.limpaCod(c);
const arTempos=[5,10,15,20,30,45,60,90,120];
const arCores=['#e2453c','#1f7fd0','#e9a400','#2f9e44'];
const arFormas=['▲','◆','●','■'];
let arCanal=null;

/* ---------- dados de exemplo (fictícios) ---------- */
function arExemplo(){return {id:uid(),nome:'Exemplo · Present Simple',disc:'Inglês',turma:'',tema:'Gramática',pasta:'Exemplos',criado:Date.now(),mod:Date.now(),perg:[
  {id:uid(),tp:'mc',t:'She ___ to school every day.',o:['go','goes','going','gone'],c:1,s:20},
  {id:uid(),tp:'mc',t:'Which sentence is correct?',o:['He don\'t like tea.','He doesn\'t like tea.','He not like tea.','He doesn\'t likes tea.'],c:1,s:30},
  {id:uid(),tp:'vf',t:'"They plays football" is correct.',o:['Verdadeiro','Falso'],c:1,s:15},
  {id:uid(),tp:'mc',t:'We ___ English on Mondays.',o:['studies','study','studying','is study'],c:1,s:20},
  {id:uid(),tp:'vf',t:'We use the Present Simple for habits and routines.',o:['Verdadeiro','Falso'],c:0,s:15}]}}

/* ---------- navegação ---------- */
TITLES.arena='EduSpruce Arena';
{const h=document.querySelector('#side [data-v="contactos"]')||document.querySelector('#side [data-v="recursos"]');if(h&&!document.querySelector('#side [data-v="arena"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="arena" title="EduSpruce Arena · jogos de perguntas"><span data-ico="sparkle"></span><span class="lbl">Arena</span></button>`);const b=document.querySelector('#side [data-v="arena"]');b.querySelector('[data-ico]').innerHTML=ic('sparkle',18);b.onclick=()=>go('arena')}}
{const _gAr=go;go=function(v){if(v==='arena'&&!arOn())v='inicio';if(go._f&&go._f.arena!==vArena)go._f.arena=vArena;const r=_gAr.call(this,v);try{$$('#side [data-v="arena"]').forEach(b=>{b.hidden=!arOn();b.classList.toggle('on',VIEW==='arena')})}catch(_){}return r};go._f=_gAr._f;if(go._f)go._f.arena=vArena}
{const _vDa=vDefinicoes;vDefinicoes=function(){const r=_vDa.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#ar-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="ar-on" ${arOn()?'checked':''}> ${ic('sparkle',15)} <span><b>EduSpruce Arena</b><br><span class="mut">Jogos de perguntas em tempo real para a turma: os alunos entram pelo telemóvel com um código, sem contas. Também serve para trabalho de casa.</span></span></label>
      <label class="chk" style="margin:4px 0 0 30px" ${arOn()?'':'hidden'} id="ar-mdef"><input type="checkbox" id="ar-moe" ${arMoedasOn()?'checked':''}> <span>Moedas e coleção de Pinhas na Arena</span></label>`);
      $('#ar-on').onchange=e=>{S.cfg.arenaOn=e.target.checked;save();toast(e.target.checked?'Arena ligada':'Arena desligada','ok');$('#ar-mdef').hidden=!e.target.checked;try{$$('#side [data-v="arena"]').forEach(b=>b.hidden=!arOn())}catch(_){}};
      $('#ar-moe').onchange=e=>{S.cfg.arenaMoedas=e.target.checked;save();toast(e.target.checked?'Moedas e Pinhas ligadas':'Moedas e Pinhas desligadas','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}

/* ---------- vista principal ---------- */
function arDiscs(){const s=new Set();(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>t.disciplina&&s.add(t.disciplina)));arD().conj.forEach(c=>c.disc&&s.add(c.disc));return [...s].sort((a,b)=>a.localeCompare(b,'pt'))}
function arTurmas(){const a=A();return a?a.turmas.filter(t=>(t.alunos||[]).length):[]}
function vArena(){if(!arOn())return go('inicio');const d=arD();if(!d.conj.length&&!S.cfg.arenaEx){d.conj.push(arExemplo());S.cfg.arenaEx=1;save()}
  if(UI.arEd){const c=d.conj.find(x=>x.id===UI.arEd);if(c)return arEditor(c);UI.arEd=null}
  const tab=UI.arTab||'conj';
  barBtns(tab==='conj'?[{id:'ar-imp',t:ic('upload',15)+' Importar CSV/Excel',f:()=>arImportarDlg()},{id:'ar-novo',t:ic('plus',15)+' Novo Conjunto',c:'pri',f:()=>{const c={id:uid(),nome:'Novo conjunto',disc:(T()||{}).disciplina||'',turma:'',tema:'',pasta:'',criado:Date.now(),mod:Date.now(),perg:[{id:uid(),tp:'mc',t:'',o:['','','',''],c:0,s:20}]};d.conj.unshift(c);save();UI.arEd=c.id;vArena()}}]:[{id:'ar-atu',t:ic('refresh',15)+' Atualizar',f:()=>vArena()}]);
  const head=`<div class="card arhead"><div class="row" style="gap:12px;flex-wrap:wrap"><span class="arlogo">${AR.svg('p11',46)}</span><div style="flex:1;min-width:200px"><h2 style="margin:0">EduSpruce Arena</h2><span class="mut">Jogos de perguntas em tempo real para a turma. Os alunos entram em <b>arena.html</b> com o código da sala, sem contas.</span></div></div>
    <div class="tabs artabs"><button data-artab="conj" class="${tab==='conj'?'on':''}">${ic('layers',14)} Conjuntos de Perguntas</button><button data-artab="jogos" class="${tab==='jogos'?'on':''}">${ic('chart',14)} Jogos e Relatórios</button></div></div>`;
  let body='';
  if(tab==='conj'){const F=UI.arF=UI.arF||{disc:'',turma:'',q:''};const q=normT(F.q||'');
    const L=d.conj.filter(c=>(!F.disc||c.disc===F.disc)&&(!F.turma||c.turma===F.turma)&&(!q||normT([c.nome,c.tema,c.pasta,c.disc].join(' ')).includes(q)));
    const pastas=[...new Set(L.map(c=>c.pasta||''))].sort((a,b)=>(a===''?1:0)-(b===''?1:0)||a.localeCompare(b,'pt'));const TT=arTurmas();
    body=`<div class="card"><div class="row arfl"><select id="arf-d" aria-label="Disciplina"><option value="">Todas as disciplinas</option>${arDiscs().map(x=>`<option ${F.disc===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="arf-t" aria-label="Turma"><option value="">Todas as turmas</option>${TT.map(t=>`<option value="${t.id}" ${F.turma===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join('')}</select><input id="arf-q" type="search" placeholder="Procurar tema ou nome…" value="${esc(F.q||'')}"></div></div>
      ${L.length?pastas.map(p=>`<h3 class="arpasta">${ic('folder',15)} ${esc(p||'Sem pasta')}</h3><div class="arcgrid">${L.filter(c=>(c.pasta||'')===p).map(c=>{const t=TT.find(z=>z.id===c.turma);return `<article class="arcc"><div class="arcct"><b>${esc(c.nome)}</b><span class="mut">${esc([c.disc,t?t.nome:'',c.tema].filter(Boolean).join(' · '))}</span></div>
        <div class="arccm"><span class="tag">${c.perg.length} pergunta${c.perg.length===1?'':'s'}</span>${c.perg.some(x=>x.img)?`<span class="tag">${ic('image',11)} imagens</span>`:''}<span class="mut">${new Date(c.mod||c.criado).toLocaleDateString('pt-PT')}</span></div>
        <div class="arcca"><button class="btn pri" data-arj="${c.id}">${ic('sparkle',15)} Jogar</button><button class="btn" data-are="${c.id}">${ic('pencil',14)} Editar</button><button class="btn ico" data-arm="${c.id}" aria-label="Mais opções" title="Duplicar, exportar, apagar">${ic('list',15)}</button></div></article>`}).join('')}</div>`).join(''):`<div class="card empty">${ic('layers',28)}<br><b>Sem conjuntos${F.disc||F.turma||F.q?' com este filtro':''}</b><br><span class="mut">Crie um conjunto novo ou importe perguntas de um CSV/Excel.</span></div>`}`}
  else body=`<div class="card" id="ar-jogos"><p class="mut">A carregar…</p></div>`;
  $('#view').innerHTML=`<div class="arv">${head}${body}</div>`;
  $$('#view [data-artab]').forEach(b=>b.onclick=()=>{UI.arTab=b.dataset.artab;vArena()});
  if(tab==='conj'){const F=UI.arF;$('#arf-d').onchange=e=>{F.disc=e.target.value;vArena()};$('#arf-t').onchange=e=>{F.turma=e.target.value;vArena()};
    const qi=$('#arf-q');qi.oninput=()=>{F.q=qi.value;clearTimeout(vArena._t);vArena._t=setTimeout(()=>{vArena();const z=$('#arf-q');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},250)};
    $$('#view [data-are]').forEach(b=>b.onclick=()=>{UI.arEd=b.dataset.are;vArena()});
    $$('#view [data-arj]').forEach(b=>b.onclick=()=>arLancarDlg(d.conj.find(c=>c.id===b.dataset.arj)));
    $$('#view [data-arm]').forEach(b=>b.onclick=()=>arMaisDlg(d.conj.find(c=>c.id===b.dataset.arm)))}
  else arJogosLista()}

function arMaisDlg(c){if(!c)return;openDrawer(c.nome,`<div class="ed"><div class="armais"><button class="btn" id="arx-dup">${ic('copy',15)} Duplicar</button><button class="btn" id="arx-csv">${ic('download',15)} Exportar (CSV para Excel)</button><button class="btn" id="arx-jog">${ic('sparkle',15)} Jogar</button><button class="btn dng" id="arx-del">${ic('trash',15)} Apagar</button></div></div>`);
  $('#arx-dup').onclick=()=>{const n=JSON.parse(JSON.stringify(c));n.id=uid();n.nome=c.nome+' (cópia)';n.criado=n.mod=Date.now();n.perg.forEach(p=>p.id=uid());arD().conj.unshift(n);save();closeDrawer();toast('Conjunto duplicado','ok');vArena()};
  $('#arx-csv').onclick=()=>{arExportar(c);closeDrawer()};$('#arx-jog').onclick=()=>{closeDrawer();arLancarDlg(c)};
  $('#arx-del').onclick=()=>{if(!confirm('Apagar o conjunto «'+c.nome+'»? Os relatórios dos jogos já feitos ficam guardados.'))return;const d=arD();d.conj=d.conj.filter(z=>z!==c);c.perg.forEach(p=>{if(p.img)delete FOTOS[p.img]});save();closeDrawer();toast('Conjunto apagado');vArena()}}

/* ---------- editor de conjuntos ---------- */
function arEditor(c){const TT=arTurmas();
  barBtns([{id:'ar-vol',t:ic('back',15)+' Conjuntos',f:()=>{UI.arEd=null;vArena()}},{id:'ar-exp',t:ic('download',15)+' Exportar',f:()=>arExportar(c)},{id:'ar-jg',t:ic('sparkle',15)+' Jogar',c:'pri',f:()=>arLancarDlg(c)}]);
  const ok=p=>p.t.trim()&&p.o.filter(x=>String(x).trim()).length>=2&&String(p.o[p.c]||'').trim();
  $('#view').innerHTML=`<div class="arv arednv"><div class="card"><div class="g2 ared"><div style="grid-column:1/-1"><label>Nome do conjunto</label><input id="are-n" value="${esc(c.nome)}"></div>
    <div><label>Disciplina</label><input id="are-d" list="are-dl" value="${esc(c.disc||'')}"><datalist id="are-dl">${arDiscs().map(x=>`<option>${esc(x)}</option>`).join('')}</datalist></div>
    <div><label>Turma (opcional)</label><select id="are-t"><option value="">— Qualquer turma —</option>${TT.map(t=>`<option value="${t.id}" ${c.turma===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join('')}</select></div>
    <div><label>Tema</label><input id="are-tm" value="${esc(c.tema||'')}" placeholder="ex.: Gramática, Unidade 2…"></div><div><label>Pasta</label><input id="are-p" list="are-pl" value="${esc(c.pasta||'')}" placeholder="ex.: 10.º ano"><datalist id="are-pl">${[...new Set(arD().conj.map(x=>x.pasta).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join('')}</datalist></div></div></div>
    <div class="arpl">${c.perg.map((p,i)=>`<section class="card arq ${ok(p)?'':'arq-inc'}" data-q="${i}"><div class="row arqh"><b class="arqn">${i+1}</b><select data-qtp aria-label="Tipo"><option value="mc" ${p.tp==='mc'?'selected':''}>Escolha múltipla</option><option value="vf" ${p.tp==='vf'?'selected':''}>Verdadeiro / Falso</option></select>
        <select data-qs aria-label="Tempo">${arTempos.map(s=>`<option value="${s}" ${+p.s===s?'selected':''}>${s<60?s+' s':(s/60)+' min'}</option>`).join('')}</select><span class="sp1"></span>
        <button class="btn sm ico" data-qup aria-label="Subir" ${i?'':'disabled'}>${ic('arrowUp',13)}</button><button class="btn sm ico" data-qdn aria-label="Descer" ${i<c.perg.length-1?'':'disabled'} style="transform:rotate(180deg)">${ic('arrowUp',13)}</button><button class="btn sm ico" data-qcp aria-label="Duplicar">${ic('copy',13)}</button><button class="btn sm ico dng" data-qx aria-label="Apagar">${ic('trash',13)}</button></div>
      <div class="arqb"><div class="arqt"><textarea data-qt rows="2" placeholder="Escreva a pergunta…">${esc(p.t)}</textarea>${p.img&&FOTOS[p.img]?`<div class="arqimg"><img src="${FOTOS[p.img]}" alt=""><button class="btn sm dng" data-qimx>${ic('x',12)} Tirar imagem</button></div>`:`<button class="btn sm" data-qim>${ic('image',14)} Imagem (opcional)</button>`}</div>
      <div class="arqo">${(p.tp==='vf'?['Verdadeiro','Falso']:p.o).map((o,k)=>`<label class="arop" style="--oc:${arCores[k]}"><input type="radio" name="qc${i}" data-qc="${k}" ${p.c===k?'checked':''} aria-label="Resposta certa"><span class="arof">${arFormas[k]}</span>${p.tp==='vf'?`<b>${esc(o)}</b>`:`<input data-qo="${k}" value="${esc(o)}" placeholder="Opção ${k+1}${k>1?' (opcional)':''}">`}</label>`).join('')}</div></div>
      <p class="hint arqhint">Marque a bolinha da resposta certa.</p></section>`).join('')}</div>
    <div class="row" style="gap:8px;margin:4px 0 30px"><button class="btn pri" id="are-add">${ic('plus',15)} Pergunta</button><button class="btn" id="are-addvf">${ic('plus',15)} Verdadeiro / Falso</button><span class="sp1"></span><span class="mut">${c.perg.length} pergunta${c.perg.length===1?'':'s'} · as alterações ficam guardadas sozinhas</span></div><input type="file" id="are-f" accept="image/*" hidden></div>`;
  const toque=()=>{c.mod=Date.now();save()};const re=()=>{const y=window.scrollY,v=$('#view').scrollTop;arEditor(c);window.scrollTo(0,y);$('#view').scrollTop=v};
  $('#are-n').oninput=e=>{c.nome=e.target.value.trim()||'Sem nome';toque()};$('#are-d').oninput=e=>{c.disc=e.target.value.trim();toque()};$('#are-t').onchange=e=>{c.turma=e.target.value;toque()};
  $('#are-tm').oninput=e=>{c.tema=e.target.value.trim();toque()};$('#are-p').oninput=e=>{c.pasta=e.target.value.trim();toque()};
  let alvo=null;const fi=$('#are-f');fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f||!alvo)return;try{const u=await arReduzir(f);const k='ar-'+uid();FOTOS[k]=u;try{idbPor(k,u)}catch(_){}if(alvo.img)delete FOTOS[alvo.img];alvo.img=k;toque();re()}catch(e){toast('Não foi possível usar a imagem: '+e.message,'erro')}};
  $$('#view [data-q]').forEach(sec=>{const i=+sec.dataset.q;const p=c.perg[i];const val=()=>sec.classList.toggle('arq-inc',!ok(p));
    sec.querySelector('[data-qt]').oninput=e=>{p.t=e.target.value;toque();val()};
    sec.querySelector('[data-qtp]').onchange=e=>{p.tp=e.target.value;if(p.tp==='vf'){p._o=p.o;p.o=['Verdadeiro','Falso'];if(p.c>1)p.c=0}else{p.o=p._o&&p._o.length===4?p._o:['','','',''];delete p._o}toque();re()};
    sec.querySelector('[data-qs]').onchange=e=>{p.s=+e.target.value;toque()};
    sec.querySelectorAll('[data-qo]').forEach(x=>x.oninput=()=>{p.o[+x.dataset.qo]=x.value;toque();val()});
    sec.querySelectorAll('[data-qc]').forEach(x=>x.onchange=()=>{p.c=+x.dataset.qc;toque();val()});
    const im=sec.querySelector('[data-qim]');if(im)im.onclick=()=>{alvo=p;fi.click()};
    const imx=sec.querySelector('[data-qimx]');if(imx)imx.onclick=()=>{delete FOTOS[p.img];delete p.img;toque();re()};
    sec.querySelector('[data-qup]').onclick=()=>{if(i){[c.perg[i-1],c.perg[i]]=[c.perg[i],c.perg[i-1]];toque();re()}};
    sec.querySelector('[data-qdn]').onclick=()=>{if(i<c.perg.length-1){[c.perg[i+1],c.perg[i]]=[c.perg[i],c.perg[i+1]];toque();re()}};
    sec.querySelector('[data-qcp]').onclick=()=>{const n=JSON.parse(JSON.stringify(p));n.id=uid();if(n.img&&FOTOS[n.img]){const k='ar-'+uid();FOTOS[k]=FOTOS[n.img];n.img=k}c.perg.splice(i+1,0,n);toque();re()};
    sec.querySelector('[data-qx]').onclick=()=>{if(c.perg.length===1)return toast('Um conjunto precisa de pelo menos uma pergunta','aviso');if((p.t||'').trim()&&!confirm('Apagar a pergunta '+(i+1)+'?'))return;if(p.img)delete FOTOS[p.img];c.perg.splice(i,1);toque();re()}});
  const add=tp=>{const ult=c.perg[c.perg.length-1];c.perg.push(tp==='vf'?{id:uid(),tp:'vf',t:'',o:['Verdadeiro','Falso'],c:0,s:ult?ult.s:15}:{id:uid(),tp:'mc',t:'',o:['','','',''],c:0,s:ult?ult.s:20});toque();re();setTimeout(()=>{const L=$$('#view [data-qt]');const z=L[L.length-1];if(z){z.focus();z.scrollIntoView({block:'center'})}},50)};
  $('#are-add').onclick=()=>add('mc');$('#are-addvf').onclick=()=>add('vf')}
function arReduzir(f){return new Promise((ok,ko)=>{const r=new FileReader();r.onerror=()=>ko(r.error);r.onload=()=>{const im=new Image();im.onerror=()=>ko(new Error('formato não suportado'));im.onload=()=>{const m=900;const k=Math.min(1,m/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.74))};im.src=r.result};r.readAsDataURL(f)})}

/* ---------- importar / exportar ---------- */
const AR_CAB=['Pergunta','Tipo (EM/VF)','Opção 1','Opção 2','Opção 3','Opção 4','Certa (1-4 ou V/F)','Tempo (s)'];
function arCsvLinhas(txt){txt=txt.replace(/^﻿/,'');const sep=(txt.split('\n')[0].match(/;/g)||[]).length>=(txt.split('\n')[0].match(/,/g)||[]).length?(/\t/.test(txt.split('\n')[0])?'\t':';'):',';const L=[];let row=[],cur='',q=false;
  for(let i=0;i<txt.length;i++){const ch=txt[i];if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}else if(ch==='"')q=true;else if(ch===sep){row.push(cur);cur=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(cur);L.push(row);row=[];cur=''}else cur+=ch}
  if(cur||row.length){row.push(cur);L.push(row)}return L.filter(r=>r.some(x=>String(x).trim()))}
function arDeLinhas(L){const P=[];let ini=0;if(L.length&&/pergunta|question/i.test(String(L[0][0]||'')))ini=1;
  for(const r of L.slice(ini)){const t=String(r[0]||'').trim();if(!t)continue;let tp=/^v/i.test(String(r[1]||'').trim())?'vf':'mc';const ops=[r[2],r[3],r[4],r[5]].map(x=>String(x==null?'':x).trim());
    if(tp==='mc'&&!ops[2]&&!ops[3]&&/^(v|verdadeiro|true)$/i.test(ops[0])&&/^(f|falso|false)$/i.test(ops[1]))tp='vf';
    const cr=String(r[6]==null?'':r[6]).trim();let c=0;
    if(tp==='vf'){c=/^(f|falso|false|2)$/i.test(cr)?1:0}else{if(/^[1-4]$/.test(cr))c=+cr-1;else if(/^[a-d]$/i.test(cr))c=cr.toLowerCase().charCodeAt(0)-97;else{const k=ops.findIndex(o=>o&&normT(o)===normT(cr));c=k>=0?k:0}}
    let s=parseInt(r[7],10);if(!s||s<5)s=tp==='vf'?15:20;s=arTempos.reduce((a,b)=>Math.abs(b-s)<Math.abs(a-s)?b:a);
    if(tp==='mc'&&ops.filter(Boolean).length<2)continue;P.push({id:uid(),tp,t,o:tp==='vf'?['Verdadeiro','Falso']:ops,c,s})}return P}
function arImportarDlg(alvo){openDrawer('Importar perguntas',`<div class="ed"><p class="hint" style="margin-top:0">Um ficheiro CSV ou Excel com uma pergunta por linha e estas colunas:</p>
  <div class="tblw"><table class="lst arcab"><thead><tr>${AR_CAB.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody><tr><td>Capital de Portugal?</td><td>EM</td><td>Porto</td><td>Lisboa</td><td>Braga</td><td></td><td>2</td><td>20</td></tr><tr><td>O Sol é uma estrela.</td><td>VF</td><td></td><td></td><td></td><td></td><td>V</td><td>15</td></tr></tbody></table></div>
  <p class="hint">A «Certa» pode ser o número da opção (1 a 4), a letra (A a D) ou o próprio texto. As imagens acrescentam-se depois, no editor.</p>
  <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="ari-mod">${ic('download',15)} Descarregar Modelo</button><span class="sp1"></span><button class="btn pri" id="ari-f">${ic('upload',15)} Escolher Ficheiro</button><input type="file" id="ari-i" accept=".csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></div></div>`);
  $('#ari-mod').onclick=()=>download('Modelo de perguntas EduSpruce Arena.csv','﻿'+[AR_CAB,['Capital de Portugal?','EM','Porto','Lisboa','Braga','','2','20'],['O Sol é uma estrela.','VF','','','','','V','15']].map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');
  $('#ari-f').onclick=()=>$('#ari-i').click();
  $('#ari-i').onchange=async e=>{const f=e.target.files[0];if(!f)return;let L=[];try{if(/\.xlsx$/i.test(f.name)){const F=await lerXlsxCru(f);const C=Object.values(F)[0]||{};const R={};Object.entries(C).forEach(([ref,v])=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const col=m[1].split('').reduce((s,ch)=>s*26+ch.charCodeAt(0)-64,0)-1;(R[m[2]]=R[m[2]]||[])[col]=v});L=Object.keys(R).sort((a,b)=>a-b).map(k=>Array.from(R[k],x=>x==null?'':x))}else L=arCsvLinhas(await f.text())}catch(err){return toast('Não foi possível ler o ficheiro: '+err.message,'erro')}
    const P=arDeLinhas(L);if(!P.length)return toast('Não encontrei perguntas no ficheiro. Veja o modelo.','aviso');
    const d=arD();let c=alvo;if(!c){c={id:uid(),nome:f.name.replace(/\.[^.]+$/,''),disc:(T()||{}).disciplina||'',turma:'',tema:'',pasta:'',criado:Date.now(),mod:Date.now(),perg:[]};d.conj.unshift(c)}c.perg.push(...P);c.mod=Date.now();save();audit('Arena','Importação de perguntas',c.nome+' · '+P.length);closeDrawer();toast(P.length+' pergunta'+(P.length>1?'s':'')+' importada'+(P.length>1?'s':''),'ok');UI.arEd=c.id;vArena()}}
function arExportar(c){const L=[AR_CAB,...c.perg.map(p=>[p.t,p.tp==='vf'?'VF':'EM',...(p.tp==='vf'?['','','','']:[0,1,2,3].map(k=>p.o[k]||'')),p.tp==='vf'?(p.c===0?'V':'F'):String(p.c+1),String(p.s||20)])];
  download(c.nome+'.csv','﻿'+L.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');audit('Arena','Exportação de perguntas',c.nome)}

/* ---------- lançar um jogo ---------- */
function arLancarDlg(c){if(!c)return;const P=c.perg.filter(p=>p.t.trim()&&p.o.filter(x=>String(x).trim()).length>=2&&String(p.o[p.c]||'').trim());
  if(!P.length)return toast('Este conjunto ainda não tem perguntas completas.','aviso');
  const L=UI.arL=Object.assign({modo:'classico',tipo:'vivo',dur:420,obj:0,nomes:'livre',turma:c.turma||((T()||{}).id)||'',tardias:true,aleat:true,moedas:arMoedasOn(),limite:''},UI.arL||{});if(c.turma)L.turma=c.turma;
  const TT=arTurmas();const hoje=new Date(Date.now()+7*864e5);hoje.setHours(23,59,0,0);const limDef=new Date(hoje.getTime()-hoje.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  const desenha=()=>{const M=AR.MODOS[L.modo];openDrawer('Lançar Jogo · '+c.nome,`<div class="ed arlan">
    <label>Modo de jogo</label><div class="armodos">${Object.entries(AR.MODOS).map(([k,m])=>`<button type="button" data-arm2="${k}" class="armd ${L.modo===k?'on':''}" style="--mc:${m.cor}"><span class="armdi">${m.ic}</span><b>${m.nome}${m.esp?' <em class="armesp">★ Especial</em>':''}</b><small>${esc(m.desc)}</small></button>`).join('')}</div>
    <label>Como se joga</label><div class="seg arseg"><button type="button" data-art="vivo" class="${L.tipo==='vivo'?'on':''}">${ic('users',14)} Ao vivo na aula</button><button type="button" data-art="tpc" class="${L.tipo==='tpc'?'on':''}">${ic('calendar',14)} Trabalho de casa</button></div>
    <div class="g2">${M.dur?`<div><label>Duração${L.tipo==='tpc'?' (por aluno)':''}</label><select id="arl-dur">${[120,180,300,420,600,900,1200].map(s=>`<option value="${s}" ${L.dur===s?'selected':''}>${s/60} min</option>`).join('')}</select></div>
      <div><label>Objetivo (opcional)</label><select id="arl-obj"><option value="0">Sem objetivo — até ao fim do tempo</option>${(L.modo==='floresta'?[8,12,20,30,40]:L.modo==='corrida'?[10,15,20,30,40]:L.modo==='pesca'?[500,1000,2000,4000]:[500,1000,2000,3000,5000]).map(v=>`<option value="${v}" ${L.obj===v?'selected':''}>${L.modo==='floresta'?'Primeiro a '+v+' árvores':L.modo==='corrida'?'Meta a '+v+' casas':L.modo==='pesca'?'Primeiro a '+AR.metrica('pesca',v):'Primeiro a '+AR.nf(v)+' pontos'}</option>`).join('')}</select></div>`:`<div style="grid-column:1/-1"><p class="hint" style="margin:6px 0 0">${L.tipo==='vivo'?'Mostra as perguntas no ecrã projetado, uma a uma; cada pergunta usa o tempo definido no conjunto.':'Cada aluno responde às '+P.length+' perguntas uma vez, ao seu ritmo; a rapidez também conta.'}</p></div>`}
      ${L.tipo==='tpc'?`<div style="grid-column:1/-1"><label>Data-limite</label><input type="datetime-local" id="arl-lim" value="${esc(L.limite||limDef)}"></div>`:''}</div>
    <label>Nomes dos alunos</label><div class="seg arseg"><button type="button" data-arn="livre" class="${L.nomes==='livre'?'on':''}">Alcunhas livres</button><button type="button" data-arn="lista" class="${L.nomes==='lista'?'on':''}">Lista da turma</button></div>
    ${L.nomes==='lista'?`<select id="arl-t" style="margin-top:8px">${TT.map(t=>`<option value="${t.id}" ${L.turma===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)} (${alunosAval(t).length} alunos)</option>`).join('')}</select><p class="hint">Cada aluno escolhe o seu nome (só o primeiro e o último nome, cifrados com o código da sala). Os resultados ligam-se sozinhos à turma e as moedas ficam na coleção de cada aluno.</p>`:`<p class="hint">Os alunos escolhem uma alcunha (as palavras impróprias são recusadas). No fim pode ligar cada alcunha a um aluno da turma.</p>`}
    <div class="arops">${L.tipo==='vivo'?`<label class="chk"><input type="checkbox" id="arl-tar" ${L.tardias?'checked':''}> Deixar entrar depois de começar</label>`:''}<label class="chk"><input type="checkbox" id="arl-ale" ${L.aleat?'checked':''}> Perguntas por ordem aleatória</label>${arMoedasOn()?`<label class="chk"><input type="checkbox" id="arl-moe" ${L.moedas?'checked':''}> Moedas e Pinhas</label>`:''}</div>
    <div class="row" style="gap:8px;margin-top:16px"><span class="mut">${P.length} pergunta${P.length>1?'s':''}${P.length<c.perg.length?' (as incompletas ficam de fora)':''}</span><span class="sp1"></span><button class="btn" id="arl-can">Cancelar</button><button class="btn pri" id="arl-ok">${ic('sparkle',15)} Criar Sala</button></div></div>`);
    $$('#dw-b [data-arm2]').forEach(b=>b.onclick=()=>{L.modo=b.dataset.arm2;L.obj=L.modo==='corrida'?20:0;desenha()});$$('#dw-b [data-art]').forEach(b=>b.onclick=()=>{L.tipo=b.dataset.art;desenha()});$$('#dw-b [data-arn]').forEach(b=>b.onclick=()=>{if(b.dataset.arn==='lista'&&!TT.length)return toast('Não há turmas com alunos neste ano letivo','aviso');L.nomes=b.dataset.arn;if(!TT.some(t=>t.id===L.turma)&&TT[0])L.turma=TT[0].id;desenha()});
    const v=(s,k,f)=>{const e=$(s);if(e)e.onchange=()=>{L[k]=f(e)}};v('#arl-dur','dur',e=>+e.value);v('#arl-obj','obj',e=>+e.value);v('#arl-lim','limite',e=>e.value);v('#arl-t','turma',e=>e.value);v('#arl-tar','tardias',e=>e.checked);v('#arl-ale','aleat',e=>e.checked);v('#arl-moe','moedas',e=>e.checked);
    $('#arl-can').onclick=closeDrawer;
    $('#arl-ok').onclick=async()=>{const b=$('#arl-ok');b.disabled=true;b.textContent='A criar a sala…';try{if(!['classico','colheita','floresta'].includes(L.modo)){const sb=(await sbObter()).cliente;const r=await sb.rpc('arena_acao2',{p_id:'0'.repeat(40),p_j:'00000000-0000-0000-0000-000000000000',p_tok:'x'.repeat(20),p_escolha:0,p_alvo:null});if(r.error&&/PGRST202|does not exist|Could not find|schema cache/i.test((r.error.code||'')+' '+(r.error.message||'')))throw new Error('Este modo precisa de uma atualização da base de dados: o administrador tem de correr uma vez o script «0014_arena_modos.sql» no Supabase (SQL Editor › Run).')}await arCriar(c,P,L)}catch(e){b.disabled=false;b.innerHTML=ic('sparkle',15)+' Criar Sala';toast(e.message,'erro')}}};
  desenha()}
async function arCriar(c,P,L){const code=AR.codigo();const id=await AR.salaId(code);const M=AR.MODOS[L.modo];
  S.cfg.arenaSal=S.cfg.arenaSal||AR.token();let lista=null,refs={};
  if(L.nomes==='lista'){const t=arTurmas().find(x=>x.id===L.turma);if(!t)throw new Error('Escolha a turma.');const al=alunosAval(t);lista=[];
    for(const a of al){const r=(await AR.sha('es-arena-ref:'+S.cfg.arenaSal+':'+(a.cid||a.id))).slice(0,32);refs[r]=a.id;const pn=String(a.nome||'').trim().split(/\s+/);lista.push({r,n:(numAl(a)?numAl(a)+'. ':'')+pn[0]+(pn.length>1?' '+pn[pn.length-1]:'')})}}
  const perguntas=P.map(p=>{const o={t:p.t.trim(),o:(p.tp==='vf'?['Verdadeiro','Falso']:p.o.map(x=>String(x||'').trim())).filter((x,k)=>x||k<2),s:+p.s||20,tp:p.tp};if(p.img&&FOTOS[p.img])o.img=FOTOS[p.img];return o});
  const certas=P.map(p=>p.c);
  const cfg={titulo:c.nome,nomes:L.nomes,tardias:L.tipo==='vivo'?!!L.tardias:true,aleatoria:!!L.aleat,moedas:arMoedasOn()&&!!L.moedas,duracao:M.dur?L.dur:0,objetivo:M.dur?(L.obj||0):0};
  if(lista)cfg.lista_c=await AR.cifrar(lista,code);
  const limite=L.tipo==='tpc'?new Date(L.limite||Date.now()+7*864e5).toISOString():null;
  if(L.tipo==='tpc'&&new Date(limite)<=new Date())throw new Error('A data-limite tem de ser no futuro.');
  await arRpc('arena_criar',{p_id:id,p_tipo:L.tipo,p_modo:L.modo,p_cfg:cfg,p_perguntas:perguntas,p_certas:certas,p_limite:limite});
  const j={id,codigo:code,conj:c.id,nome:c.nome,modo:L.modo,tipo:L.tipo,turma:L.nomes==='lista'?L.turma:'',refs,criado:Date.now(),limite,perg:P.map(p=>({t:p.t,o:p.tp==='vf'?['Verdadeiro','Falso']:p.o.slice(),c:p.c}))};
  arD().jogos.unshift(j);if(arD().jogos.length>200)arD().jogos.length=200;save();audit('Arena','Jogo lançado',c.nome+' · '+M.nome+' · '+(L.tipo==='tpc'?'trabalho de casa':'ao vivo'));
  closeDrawer();arAnfitriao(j)}

/* ---------- ecrã do anfitrião ---------- */
let arH=null;
function arCanalAbrir(id){arCanalFechar();sbObter().then(p=>{try{const c=p.cliente;if(!c||!c.channel)return;arCanal=c.channel('arena-'+id,{config:{broadcast:{self:false,ack:false}}});arCanal.subscribe()}catch(_){}}).catch(()=>{})}
function arCanalFechar(){try{if(arCanal){arCanal.unsubscribe&&arCanal.unsubscribe()}}catch(_){}arCanal=null}
function arAvisar(ev){try{arCanal&&arCanal.send({type:'broadcast',event:'s',payload:{e:ev||'sync',t:Date.now()}})}catch(_){}}
async function arAnfitriao(j){arFecharHost();await aaQrLib().catch(()=>{});
  const o=document.createElement('div');o.id='arhost';o.className='arhost';o.setAttribute('role','dialog');o.setAttribute('aria-label','Arena · '+j.nome);document.body.appendChild(o);document.body.classList.add('arh-on');
  arH={j,o,d:null,vivo:true,ultV:-1,fase:'',rev:-1,ultAv:0,topAnt:{}};arCanalAbrir(j.id);
  o.innerHTML=`<header class="arhh"><span class="arhlogo">${AR.svg('p16',34)}</span><div class="arht"><b>${esc(j.nome)}</b><span>${AR.MODOS[j.modo].ic} ${AR.MODOS[j.modo].nome} · ${j.tipo==='tpc'?'Trabalho de casa':'Ao vivo'}</span></div><span class="sp1"></span>
    <span class="arhcod" title="Código da sala">${AR.fmt(j.codigo)}</span><button type="button" class="arhb" id="arh-som" aria-label="Som">${AR.som?'🔔':'🔕'}</button><button type="button" class="arhb" id="arh-pau" hidden>${ic('clock',16)} Pausar</button><button type="button" class="arhb dng" id="arh-fim" hidden>Terminar</button><button type="button" class="arhb" id="arh-x" aria-label="Fechar">${ic('x',18)}</button></header>
    <main class="arhm" id="arh-m"><div class="arhload">A ligar…</div></main>`;
  o.querySelector('#arh-x').onclick=()=>{arFecharHost();if(VIEW==='arena')vArena()};
  o.querySelector('#arh-som').onclick=e=>{AR.som=!AR.som;e.currentTarget.textContent=AR.som?'🔔':'🔕'};
  o.querySelector('#arh-pau').onclick=async()=>{const d=arH.d;if(!d)return;await arCtl(d.sala.estado==='pausa'?'retomar':'pausar')};
  o.querySelector('#arh-fim').onclick=async()=>{if(!confirm(j.tipo==='tpc'?'Fechar já o trabalho de casa? Os alunos deixam de poder jogar.':'Terminar o jogo agora?'))return;await arCtl('terminar')};
  arTick()}
function arFecharHost(){if(arH){arH.vivo=false;clearTimeout(arH.to);clearInterval(arH.relogio)}arH=null;arCanalFechar();const o=$('#arhost');if(o)o.remove();document.body.classList.remove('arh-on')}
async function arCtl(acao,arg){try{const d=await arRpc('arena_controlo',{p_id:arH.j.id,p_acao:acao,p_arg:arg||{}});if(arH){if(d&&d.sala)arH.d=d;arAvisar(acao);arDesenhar()}return d}catch(e){toast(e.message,'erro')}}
async function arTick(){if(!arH||!arH.vivo)return;const h=arH;try{const d=await arRpc('arena_prof',{p_id:h.j.id});if(!arH||arH!==h)return;h.erro=0;const mudou=!h.d||d.sala.versao!==h.d.sala.versao||d.sala.estado!==h.d.sala.estado;h.d=d;h.off=new Date(d.sala.agora).getTime()-Date.now();
    if(mudou){arDesenhar();if(Date.now()-h.ultAv>2500){h.ultAv=Date.now();arAvisar('sync')}}else arRelogio();
    if(d.sala.estado==='fim'&&!h.guardado){h.guardado=true;arGuardarRes(h.j).catch(()=>{})}}
  catch(e){h.erro=(h.erro||0)+1;const m=$('#arh-m');if(m&&!h.d)m.innerHTML=`<div class="arhload">${esc(e.message)}${e.semSql?'<br><small>Peça a quem gere a base de dados para correr o ficheiro supabase/migrations/0012_arena.sql.</small>':''}</div>`}
  if(arH===h)h.to=setTimeout(arTick,h.d&&h.d.sala.estado==='fim'?8000:h.j.tipo==='tpc'?5000:1500)}
const arAgora=()=>Date.now()+((arH&&arH.off)||0);
function arRestante(s){if(s.estado==='pausa')return null;if(s.fim_em)return Math.max(0,(new Date(s.fim_em).getTime()-arAgora())/1000);return null}
function arRelogio(){const h=arH;if(!h||!h.d)return;const s=h.d.sala;const el=$('#arh-rel');if(!el)return;
  if(h.j.modo==='classico'&&h.j.tipo==='vivo'&&s.estado==='jogo'&&!s.revelada&&s.pergunta){const t=+s.pergunta.s||20;const r=Math.max(0,t-(arAgora()-new Date(s.atual_ini).getTime())/1000);el.textContent=Math.ceil(r);el.classList.toggle('pouco',r<=5);const bar=$('#arh-bar');if(bar)bar.style.width=(100*r/t)+'%';
    const ativos=h.d.jogadores.filter(x=>!x.expulso).length;const resp=Object.values(h.d.atual||{}).reduce((a,b)=>a+b,0);if(!h.revPedida&&(r<=0||(ativos&&resp>=ativos))){h.revPedida=true;setTimeout(()=>arCtl('revelar'),r<=0?200:700)}}
  else{const r=arRestante(s);if(r!=null){el.textContent=Math.floor(r/60)+':'+String(Math.floor(r%60)).padStart(2,'0');el.classList.toggle('pouco',r<=30);if(r<=0&&s.estado==='jogo'&&!h.fimPedido){h.fimPedido=true;arCtl('terminar')}}}}
function arDesenhar(){const h=arH;if(!h||!h.d)return;const {sala:s,jogadores:J}=h.d;const m=$('#arh-m');const ativos=J.filter(x=>!x.expulso);
  const pau=$('#arh-pau'),fim=$('#arh-fim');pau.hidden=!(s.estado==='jogo'||s.estado==='pausa')||h.j.tipo==='tpc';pau.innerHTML=s.estado==='pausa'?'▶ Retomar':ic('clock',16)+' Pausar';fim.hidden=s.estado==='fim';fim.textContent=h.j.tipo==='tpc'?'Fechar TPC':'Terminar';
  clearInterval(h.relogio);h.relogio=setInterval(arRelogio,250);
  const url=arUrl(h.j.codigo);const qr=(()=>{try{return aaQR(url)}catch(_){return ''}})();
  const chips=L=>L.map(x=>`<button type="button" class="arhp ${x.expulso?'exp':''} ${x.ligado?'':'off'}" data-arhj="${x.id}" title="${x.expulso?'Readmitir':'Expulsar'} ${esc(x.alcunha)}">${AR.svg(x.avatar,40)}<span>${esc(x.alcunha)}</span></button>`).join('');
  const entrar=`<div class="arhent"><div class="arhqr">${qr}</div><div><p>Abram <b>${esc(url.replace(/^https?:\/\//,'').replace(/#.*$/,''))}</b> e escrevam o código</p><div class="arhbig">${AR.fmt(h.j.codigo)}</div></div></div>`;
  if(s.estado==='fim'){const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos);if(h.fase!=='fim'){h.fase='fim';AR.tocar('fim');setTimeout(()=>AR.confetes(m,90),300)}
    m.innerHTML=`<div class="arhfim"><h2>${h.j.tipo==='tpc'?'Trabalho de casa fechado':'Fim do jogo!'}</h2><div class="arpod">${[1,0,2].map(k=>top[k]?`<div class="arpodc p${k+1}"><div class="arpoda">${AR.svg(top[k].avatar,k===0?110:84)}</div><b>${esc(top[k].alcunha)}</b><span>${h.j.modo==='floresta'?AR.arvores(top[k].arv).inteiras+' árvores':AR.metrica(h.j.modo,top[k].pontos)+(['pesca','corrida'].includes(h.j.modo)?'':' pts')}</span><i>${k+1}.º</i></div>`:'<div></div>').join('')}</div>
      <div class="row" style="gap:10px;justify-content:center;margin-top:18px"><button class="btn pri arhbtn" id="arh-rel2">${ic('chart',16)} Ver Relatório</button><button class="btn arhbtn" id="arh-nov">${ic('refresh',16)} Jogar de Novo</button></div></div>`;
    m.querySelector('#arh-rel2').onclick=async()=>{const j=h.j;await arGuardarRes(j).catch(()=>{});arFecharHost();arRelatorio(j)};m.querySelector('#arh-nov').onclick=()=>{const c=arD().conj.find(x=>x.id===h.j.conj);arFecharHost();if(c)arLancarDlg(c);else toast('O conjunto já não existe','aviso')};return}
  if(h.j.tipo==='tpc'){const lim=s.limite?new Date(s.limite):null;h.fase='tpc';
    m.innerHTML=`<div class="arhtpc">${entrar}<p class="arhsub">${lim?'Até '+lim.toLocaleString('pt-PT',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):''} · partilhe o link na plataforma da turma</p>
      <div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn arhbtn" id="arh-cop">${ic('copy',15)} Copiar Link</button><button class="btn arhbtn" id="arh-pro">${ic('calendar',15)} Prolongar</button><button class="btn pri arhbtn" id="arh-rel3">${ic('chart',15)} Relatório</button></div>
      <h3>${ativos.length} aluno${ativos.length===1?'':'s'} · ${ativos.filter(x=>x.terminou).length} terminaram</h3><div class="arhrank">${ativos.map((x,i)=>`<div class="arhr"><b>${i+1}</b>${AR.svg(x.avatar,34)}<span>${esc(x.alcunha)}</span><small>${x.certas} certas · ${x.erradas} erradas${x.terminou?' · ✓':''}</small><em>${AR.metrica(h.j.modo,x.pontos,x.arv)}</em></div>`).join('')||'<p class="arhsub">Ainda ninguém jogou.</p>'}</div></div>`;
    m.querySelector('#arh-cop').onclick=()=>{try{navigator.clipboard.writeText(url);toast('Link copiado','ok')}catch(_){prompt('Link do trabalho de casa:',url)}};
    m.querySelector('#arh-pro').onclick=async()=>{const n=prompt('Nova data-limite (AAAA-MM-DD HH:MM):',new Date(Date.now()+3*864e5).toISOString().slice(0,16).replace('T',' '));if(!n)return;const dt=new Date(n.replace(' ','T'));if(isNaN(dt))return toast('Data inválida','aviso');await arCtl('prolongar',{limite:dt.toISOString()});const jj=arD().jogos.find(x=>x.id===h.j.id);if(jj){jj.limite=dt.toISOString();save()}toast('Data-limite alterada','ok')};
    m.querySelector('#arh-rel3').onclick=async()=>{const j=h.j;await arGuardarRes(j).catch(()=>{});arFecharHost();arRelatorio(j)};return}
  if(s.estado==='espera'){if(h.fase!=='espera')h.fase='espera';const n=ativos.length;if(n>(h.nAnt||0))AR.tocar('entra');h.nAnt=n;
    m.innerHTML=`<div class="arhlob">${entrar}<div class="arhlobb"><h3>${n} jogador${n===1?'':'es'}</h3><button class="btn pri arhbtn arhgo" id="arh-go" ${n?'':'disabled'}>${ic('sparkle',18)} Começar</button></div><div class="arhps">${chips(J)||'<p class="arhsub">À espera dos jogadores… Toque num nome para o expulsar.</p>'}</div></div>`;
    m.querySelector('#arh-go').onclick=()=>{AR.tocar('inicio');h.revPedida=false;arCtl('iniciar')};arLigarChips();return}
  /* a jogar */
  if(h.j.modo==='classico'){const p=s.pergunta||{};const i=s.atual;const ops=p.o||[];
    if(!s.revelada){if(h.fase!=='q'+i){h.fase='q'+i;h.revPedida=false;AR.tocar('tic')}const resp=Object.values(h.d.atual||{}).reduce((a,b)=>a+b,0);
      m.innerHTML=`<div class="arhq"><div class="arhqtop"><span class="arhqn">Pergunta ${i+1} de ${s.n_perg}</span><span class="arhrel" id="arh-rel"></span><span class="arhqn">${resp}/${ativos.length} responderam</span></div><div class="arhbarw"><i id="arh-bar"></i></div>
        <h2 class="arhqt">${esc(p.t||'')}</h2>${p.img?`<img class="arhqi" src="${p.img}" alt="">`:''}<div class="arhops n${ops.length}">${ops.map((x,k)=>`<div class="arhop" style="--oc:${arCores[k]}"><span>${arFormas[k]}</span><b>${esc(x)}</b></div>`).join('')}</div>${s.estado==='pausa'?'<div class="arhpausa">Em pausa</div>':''}</div>`;arRelogio();return}
    const ce=h.d.certas[i];const cont=h.d.atual||{};const tot=Object.values(cont).reduce((a,b)=>a+b,0)||1;if(h.fase!=='r'+i){h.fase='r'+i;AR.tocar('certo')}
    const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos).slice(0,5);const ult=i>=s.n_perg-1;
    m.innerHTML=`<div class="arhq rev"><div class="arhqtop"><span class="arhqn">Pergunta ${i+1} de ${s.n_perg}</span><span class="sp1"></span></div><h2 class="arhqt">${esc(p.t||'')}</h2>
      <div class="arhops n${ops.length}">${ops.map((x,k)=>`<div class="arhop ${k===ce?'certa':'errada'}" style="--oc:${arCores[k]}"><span>${k===ce?'✓':arFormas[k]}</span><b>${esc(x)}</b><em>${cont[k]||0}</em><i style="width:${100*(cont[k]||0)/tot}%"></i></div>`).join('')}</div>
      <div class="arhtop"><h3>Classificação</h3>${top.map((x,k)=>`<div class="arhr"><b>${k+1}</b>${AR.svg(x.avatar,34)}<span>${esc(x.alcunha)}</span><em>${AR.nf(x.pontos)}</em></div>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri arhbtn" id="arh-seg">${ult?'Ver Pódio':'Próxima Pergunta'} ›</button></div></div>`;
    m.querySelector('#arh-seg').onclick=()=>{if(ult)arCtl('terminar');else arCtl('perg',{i:i+1})};return}
  /* modos ao ritmo de cada aluno: classificação ao vivo / floresta */
  const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos);if(h.fase!=='livre'){h.fase='livre'}
  const mx=Math.max(1,...top.map(x=>h.j.modo==='floresta'?x.arv:x.pontos));
  const corpo=h.j.modo==='floresta'?`<div class="arhflo">${top.map((x,k)=>`<div class="arhfa">${arArvoreSVG(x.arv,Math.min(130,60+x.arv*4))}<span>${AR.svg(x.avatar,26)} ${esc(x.alcunha)}</span><b>${AR.arvores(x.arv).inteiras} 🌲 <small>+${AR.arvores(x.arv).fase}/4</small></b></div>`).join('')||'<p class="arhsub">Ninguém ainda…</p>'}</div>`
    :`<div class="arhbars">${top.slice(0,12).map((x,k)=>{const ant=h.topAnt[x.id];const sub=ant!=null&&x.pontos>ant,des=ant!=null&&x.pontos<ant;return `<div class="arhbr ${sub?'sobe':''} ${des?'desce':''}"><b>${k+1}</b>${AR.svg(x.avatar,36)}<span class="arhbn">${esc(x.alcunha)}</span><span class="arhbt"><i style="width:${Math.max(2,100*x.pontos/(h.j.modo==='corrida'&&s.cfg.objetivo?Math.max(mx,s.cfg.objetivo):mx))}%"></i>${h.j.modo==='corrida'?`<u style="left:${Math.min(100,100*x.pontos/(s.cfg.objetivo?Math.max(mx,s.cfg.objetivo):mx))}%">${AR.svg(x.avatar,30)}</u>`:''}</span><em>${AR.metrica(h.j.modo,x.pontos)}</em></div>`}).join('')}</div>`;
  top.forEach(x=>h.topAnt[x.id]=x.pontos);
  m.innerHTML=`<div class="arhlv"><div class="arhqtop"><span class="arhqn">${ativos.length} jogadores · ${h.d.respostas} respostas</span><span class="arhrel" id="arh-rel"></span><span class="arhqn">${s.cfg.objetivo?'Objetivo: '+(h.j.modo==='floresta'?s.cfg.objetivo+' árvores':['pesca','corrida'].includes(h.j.modo)?AR.metrica(h.j.modo,s.cfg.objetivo):AR.nf(s.cfg.objetivo)+' pts'):''}</span></div>${corpo}${s.estado==='pausa'?'<div class="arhpausa">Em pausa</div>':''}
    <details class="arhjd"><summary>Jogadores (expulsar)</summary><div class="arhps">${chips(J)}</div></details></div>`;arLigarChips();arRelogio()}
function arLigarChips(){$$('#arhost [data-arhj]').forEach(b=>b.onclick=()=>{const x=arH.d.jogadores.find(z=>z.id===b.dataset.arhj);if(!x)return;if(x.expulso){if(confirm('Deixar '+x.alcunha+' voltar ao jogo?'))arCtl('readmitir',{j:x.id})}else if(confirm('Expulsar '+x.alcunha+' do jogo?'))arCtl('expulsar',{j:x.id})})}
const arArvoreSVG=(u,sz)=>AR.arvore(u,sz);

/* ---------- jogos e relatórios ---------- */
async function arJogosLista(){const el=$('#ar-jogos');if(!el)return;const d=arD();let srv=[];let erro='';try{srv=await arRpc('arena_minhas',{})||[]}catch(e){erro=e.message}
  const vivos=new Map(srv.map(x=>[x.id,x]));if(!$('#ar-jogos'))return;
  el.innerHTML=`${erro?`<div class="alert">${ic('alert',15)} ${esc(erro)}</div>`:''}${d.jogos.length?`<div class="arjl">${d.jogos.map(j=>{const v=vivos.get(j.id);const est=v?v.estado:'guardado';const lab=v?(v.estado==='fim'?'Terminado':j.tipo==='tpc'?'Aberto até '+(j.limite?new Date(j.limite).toLocaleDateString('pt-PT'):'—'):v.estado==='espera'?'À espera de jogadores':'A decorrer'):(j.res?'Relatório guardado':'Expirado');const M=AR.MODOS[j.modo]||{};
    return `<article class="arji"><span class="arjic" style="--mc:${M.cor}">${M.ic||'?'}</span><div class="arjb"><b>${esc(j.nome)}</b><span class="mut">${M.nome||j.modo} · ${j.tipo==='tpc'?'Trabalho de casa':'Ao vivo'} · ${new Date(j.criado).toLocaleString('pt-PT',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${v?' · '+v.jogadores+' jogador'+(v.jogadores==1?'':'es'):j.res?' · '+j.res.jog.length+' jogadores':''}</span></div><span class="tag ${est==='jogo'||est==='espera'?'ok':''}">${lab}</span>
      <div class="arja">${v&&v.estado!=='fim'?`<button class="btn sm pri" data-arho="${j.id}">${ic('sparkle',13)} Abrir</button>`:''}${v||j.res?`<button class="btn sm" data-arrel="${j.id}">${ic('chart',13)} Relatório</button>`:''}<button class="btn sm ico dng" data-arjx="${j.id}" aria-label="Apagar">${ic('trash',13)}</button></div></article>`}).join('')}</div>`:`<div class="empty">${ic('sparkle',26)}<br><b>Ainda não lançou nenhum jogo</b><br><span class="mut">Em «Conjuntos de Perguntas», toque em «Jogar».</span></div>`}`;
  $$('#ar-jogos [data-arho]').forEach(b=>b.onclick=()=>arAnfitriao(d.jogos.find(j=>j.id===b.dataset.arho)));
  $$('#ar-jogos [data-arrel]').forEach(b=>b.onclick=async()=>{const j=d.jogos.find(x=>x.id===b.dataset.arrel);if(vivos.has(j.id))await arGuardarRes(j).catch(e=>toast(e.message,'erro'));arRelatorio(j)});
  $$('#ar-jogos [data-arjx]').forEach(b=>b.onclick=async()=>{const j=d.jogos.find(x=>x.id===b.dataset.arjx);if(!confirm('Apagar «'+j.nome+'» e o seu relatório?'))return;if(vivos.has(j.id))try{await arRpc('arena_controlo',{p_id:j.id,p_acao:'apagar',p_arg:{}})}catch(_){}d.jogos=d.jogos.filter(x=>x!==j);save();arJogosLista()})}
async function arGuardarRes(j){const r=await arRpc('arena_resultados',{p_id:j.id});const idx=new Map(r.jogadores.map((x,k)=>[x.id,k]));
  j.res={em:Date.now(),estado:r.sala.estado,jog:r.jogadores.filter(x=>!x.expulso).map(x=>({id:x.id,a:x.alcunha,ref:x.ref,pts:x.pontos,c:x.certas,e:x.erradas,arv:x.arv,m:x.moedas,al:(j.refs||{})[x.ref]||((j.liga||{})[x.id])||''})),
    resp:r.resp.filter(z=>idx.has(z[0])).map(z=>[z[0],z[1],z[2],z[3]?1:0,z[4]]),perg:(r.perguntas||[]).map((p,k)=>({t:p.t,o:p.o,c:(r.certas||[])[k]}))};
  save();return j.res}
function arRelatorio(j){const R=j.res;if(!R){toast('Ainda sem resultados','aviso');return}UI.arTab='jogos';if(VIEW!=='arena')go('arena');
  const P=R.perg.length?R.perg:(j.perg||[]);const jog=R.jog.slice().sort((a,b)=>b.pts-a.pts);
  const porP=P.map((p,k)=>{const L=R.resp.filter(z=>z[1]===k);const ok=L.filter(z=>z[3]).length;const dist=(p.o||[]).map((_,o)=>L.filter(z=>z[2]===o).length);return {p,k,n:L.length,ok,taxa:L.length?ok/L.length:null,dist,ms:L.length?L.reduce((s,z)=>s+z[4],0)/L.length:0}});
  const porA=jog.map(x=>{const L=R.resp.filter(z=>z[0]===x.id);const ok=L.filter(z=>z[3]).length;return {...x,n:L.length,ok,taxa:L.length?ok/L.length:null}});
  const med=porA.filter(x=>x.taxa!=null);const media=med.length?med.reduce((s,x)=>s+x.taxa,0)/med.length:null;const t=(A()||{turmas:[]}).turmas.find(z=>z.id===j.turma);
  const TT=arTurmas();const tSel=t||TT.find(z=>z.id===(UI.arRelT||''))||T()||TT[0];const AL=tSel?alunosAval(tSel):[];
  const corP=v=>v==null?'#94a3b8':v<.5?'#dc2626':v<.7?'#d97706':'#16a34a';
  barBtns([{id:'arr-v',t:ic('back',15)+' Jogos',f:()=>vArena()},{id:'arr-csv',t:ic('download',15)+' Exportar',f:()=>arRelCsv(j,porA,porP)},{id:'arr-pr',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  $('#view').innerHTML=`<div class="arv arrel"><div class="card"><div class="row" style="gap:12px;flex-wrap:wrap"><span class="arjic" style="--mc:${AR.MODOS[j.modo].cor}">${AR.MODOS[j.modo].ic}</span><div style="flex:1"><h2 style="margin:0">${esc(j.nome)}</h2><span class="mut">${AR.MODOS[j.modo].nome} · ${j.tipo==='tpc'?'Trabalho de casa':'Ao vivo'} · ${new Date(j.criado).toLocaleString('pt-PT')}${t?' · '+esc(t.nome):''}</span></div></div>
    <div class="kpis" style="margin-top:12px"><div class="kpi"><div class="l">${ic('users',14)} Jogadores</div><div class="v">${jog.length}</div></div><div class="kpi"><div class="l">${ic('check',14)} Acerto médio</div><div class="v" style="color:${corP(media)}">${media==null?'—':Math.round(media*100)+'%'}</div></div><div class="kpi"><div class="l">${ic('clipboard',14)} Perguntas</div><div class="v">${P.length}</div></div><div class="kpi"><div class="l">${ic('list',14)} Respostas</div><div class="v">${R.resp.length}</div></div></div></div>
    <div class="card"><h2>${ic('alert',18)} Perguntas mais falhadas</h2>${porP.filter(x=>x.n).sort((a,b)=>a.taxa-b.taxa).slice(0,5).map(x=>`<div class="arrp"><b>${x.k+1}.</b><span>${esc(x.p.t)}<small class="mut">Certa: ${esc((x.p.o||[])[x.p.c]||'')}</small></span><span class="arrbar"><i style="width:${x.taxa*100}%;background:${corP(x.taxa)}"></i></span><em style="color:${corP(x.taxa)}">${Math.round(x.taxa*100)}%</em></div>`).join('')||'<p class="mut">Sem respostas.</p>'}</div>
    <div class="card"><h2>${ic('users',18)} Por aluno</h2>${!j.turma?`<p class="hint" style="margin-top:0">Ligue cada alcunha ao aluno certo para poder associar os resultados à turma <select id="arr-t" style="width:auto;margin-left:6px">${TT.map(z=>`<option value="${z.id}" ${tSel&&tSel.id===z.id?'selected':''}>${esc(z.nome)} · ${esc(z.disciplina)}</option>`).join('')}</select></p>`:''}
      <div class="tblw"><table class="lst"><thead><tr><th>#</th><th>Jogador</th>${!j.turma?'<th>Aluno</th>':''}<th>Certas</th><th>Erradas</th><th>Acerto</th><th>${j.modo==='floresta'?'Árvores':j.modo==='pesca'?'Quilos':j.modo==='corrida'?'Casas':'Pontos'}</th></tr></thead><tbody>${porA.map((x,k)=>`<tr><td>${k+1}</td><td><b>${esc(x.a)}</b></td>${!j.turma?`<td><select data-arlg="${x.id}" aria-label="Aluno"><option value="">—</option>${AL.map(a=>`<option value="${a.id}" ${x.al===a.id?'selected':''}>${esc(numAl(a))}. ${esc(a.nome)}</option>`).join('')}</select></td>`:''}<td>${x.ok}</td><td>${x.n-x.ok}</td><td><b style="color:${corP(x.taxa)}">${x.taxa==null?'—':Math.round(x.taxa*100)+'%'}</b></td><td>${j.modo==='floresta'?AR.arvores(x.arv).inteiras:AR.metrica(j.modo,x.pts)}</td></tr>`).join('')||'<tr><td colspan="7" class="mut">Ninguém jogou.</td></tr>'}</tbody></table></div>
      <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><span class="mut">${j.assoc?'Já associado à turma: '+esc(j.assoc.txt):'Os resultados podem ficar na turma como instrumento formativo (sem peso na classificação).'}</span><span class="sp1"></span><button class="btn pri" id="arr-as">${ic('plus',15)} ${j.assoc?'Atualizar na Turma':'Associar à Turma'}</button></div></div>
    <div class="card"><h2>${ic('clipboard',18)} Por pergunta</h2>${porP.map(x=>`<div class="arrq"><div class="row" style="gap:8px"><b>${x.k+1}.</b><span style="flex:1">${esc(x.p.t)}</span><b style="color:${corP(x.taxa)}">${x.taxa==null?'—':Math.round(x.taxa*100)+'%'}</b></div><div class="arrqo">${(x.p.o||[]).map((o,k)=>`<span class="${k===x.p.c?'ok':''}"><i style="--oc:${arCores[k]}">${k===x.p.c?'✓':arFormas[k]}</i>${esc(o)} <b>${x.dist[k]||0}</b></span>`).join('')}</div></div>`).join('')}</div></div>`;
  const st=$('#arr-t');if(st)st.onchange=()=>{UI.arRelT=st.value;arRelatorio(j)};
  $$('#view [data-arlg]').forEach(s=>s.onchange=()=>{j.liga=j.liga||{};j.liga[s.dataset.arlg]=s.value;const x=R.jog.find(z=>z.id===s.dataset.arlg);if(x)x.al=s.value;save();const y=window.scrollY,v=$('#view').scrollTop;arRelatorio(j);window.scrollTo(0,y);$('#view').scrollTop=v});
  $('#arr-as').onclick=()=>arAssociar(j,porA,tSel)}
function arRelCsv(j,porA,porP){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';const L=[['Jogador','Certas','Erradas','Acerto (%)',j.modo==='floresta'?'Árvores':j.modo==='pesca'?'Quilos':j.modo==='corrida'?'Casas':'Pontos'],...porA.map(x=>[x.a,x.ok,x.n-x.ok,x.taxa==null?'':Math.round(x.taxa*100),j.modo==='floresta'?AR.arvores(x.arv).inteiras:j.modo==='pesca'?Math.round(x.pts)/10:x.pts]),[],['Pergunta','Resposta certa','Respostas','Acerto (%)'],...porP.map(x=>[x.p.t,(x.p.o||[])[x.p.c]||'',x.n,x.taxa==null?'':Math.round(x.taxa*100)])];
  download('Arena - '+j.nome+'.csv','﻿'+L.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');audit('Arena','Exportação de relatório',j.nome)}
function arAssociar(j,porA,t){if(!t)return toast('Escolha a turma','aviso');const lig=porA.filter(x=>x.al&&x.taxa!=null&&t.alunos.some(a=>a.id===x.al));if(!lig.length)return toast(j.turma?'Nenhum aluno da lista jogou.':'Ligue pelo menos uma alcunha a um aluno.','aviso');
  let i=j.assoc&&t.instrumentos.find(z=>z.id===j.assoc.inst);const hoje=new Date(j.criado).toISOString().slice(0,10);
  if(!i){i={id:uid(),nome:'Arena · '+j.nome,tipo:'Jogo Arena (formativo)',periodo:perAtual(t),data:hoje,itens:[{id:uid(),rot:'Acerto (%)',dom:'',cot:100}],notas:{},arena:j.id};t.instrumentos.push(i)}
  const it=i.itens[0].id;lig.forEach(x=>{i.notas[x.al]={[it]:Math.round(x.taxa*100)}});
  j.assoc={inst:i.id,turma:t.id,txt:t.nome+' · '+t.disciplina+' · '+lig.length+' alunos'};save();audit('Arena','Resultados associados à turma',j.nome+' · '+t.nome);toast('Resultados guardados em '+t.nome+' como instrumento formativo','ok');arRelatorio(j)}
/* os instrumentos formativos da Arena não têm domínio: não contam para a classificação, mas aparecem na Ficha Integral */

/* ---------- estilos ---------- */
(()=>{const st=document.createElement('style');st.id='arena-css';st.textContent=`
.arhead .arlogo{width:46px;height:46px;flex:none}.artabs{margin:12px 0 0;border:0;flex-wrap:wrap}
.arfl{gap:8px;flex-wrap:wrap}.arfl select,.arfl input{flex:1 1 200px;width:auto}
.arpasta{margin:18px 4px 8px;font-size:14px;color:var(--mut);display:flex;gap:6px;align-items:center}
.arcgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.arcc{background:var(--panel,#fff);border:1px solid var(--line,#dfe5eb);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.arcct b{display:block;font-size:16px}.arcct .mut{font-size:13px}.arccm{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12.5px}
.arcca{display:flex;gap:6px;margin-top:auto}.arcca .btn:first-child{flex:1}
.armais{display:flex;flex-direction:column;gap:8px}
.ared label{margin-top:4px}
.arq{padding:12px 14px}.arq.arq-inc{border-left:4px solid #f59e0b}.arqh{gap:6px;flex-wrap:wrap}.arqh select{width:auto}
.arqn{width:30px;height:30px;border-radius:50%;background:var(--acc,#127fa6);color:#fff;display:grid;place-items:center;font-size:14px;flex:none}
.arqb{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:12px;margin-top:10px}
@media (max-width:760px){.arqb{grid-template-columns:1fr}}
.arqt textarea{width:100%;font-size:16px;min-height:72px}.arqt .btn{margin-top:6px}
.arqimg{margin-top:8px;display:flex;gap:8px;align-items:flex-end}.arqimg img{max-width:180px;max-height:120px;border-radius:8px;border:1px solid var(--line)}
.arqo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}@media (max-width:520px){.arqo{grid-template-columns:minmax(0,1fr)}}
.arop{display:flex;align-items:center;gap:8px;border:2px solid color-mix(in srgb,var(--oc) 45%,transparent);border-radius:12px;padding:6px 8px;margin:0;background:color-mix(in srgb,var(--oc) 7%,transparent)}
.arop:has(input[type=radio]:checked){border-color:var(--oc);background:color-mix(in srgb,var(--oc) 18%,transparent)}
.arop input[type=radio]{width:20px;height:20px;flex:none;accent-color:var(--oc);margin:0}.arop{min-width:0}.arqt{min-width:0}html body .arop input[data-qo]{flex:1;min-width:0!important;width:100%!important;border:0;background:transparent;font-size:15px;padding:6px 4px}
.arof{color:var(--oc);font-size:16px;width:18px;text-align:center}.arqhint{margin:6px 0 0;font-size:12px}
.arcab td,.arcab th{font-size:12px;white-space:nowrap}
.armodos{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.armd{all:unset;box-sizing:border-box;cursor:pointer;border:2px solid var(--line,#dfe5eb);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:4px}
.armd.on{border-color:var(--mc);background:color-mix(in srgb,var(--mc) 9%,transparent)}.armd:focus-visible{outline:3px solid var(--mc)}
.armesp{display:inline-block;font-style:normal;font-size:10.5px;font-weight:800;letter-spacing:.03em;padding:2px 7px;border-radius:999px;background:linear-gradient(90deg,#f59e0b,#ec4899);color:#fff;vertical-align:2px;margin-left:4px}.armdi{font-size:28px}.armd b{font-size:15px}.armd small{color:var(--mut);font-size:12px;line-height:1.35}
.arseg{flex-wrap:wrap}.arops{display:flex;flex-direction:column;gap:2px;margin-top:10px}
.arjl{display:flex;flex-direction:column}.arji{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line,#e3e8ee);flex-wrap:wrap}.arji:first-child{border-top:0}
.arjic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:22px;background:color-mix(in srgb,var(--mc) 15%,transparent);flex:none}
.arjb{flex:1;min-width:200px}.arjb b{display:block}.arjb .mut{font-size:13px}.arja{display:flex;gap:6px}
.arrp{display:grid;grid-template-columns:auto minmax(0,1fr) 140px 46px;gap:10px;align-items:center;padding:6px 0}.arrp small{display:block}
.arrbar{height:12px;border-radius:6px;background:rgba(127,140,155,.18);overflow:hidden}.arrbar i{display:block;height:100%}
@media (max-width:600px){.arrp{grid-template-columns:auto 1fr 46px}.arrbar{display:none}}
.arrq{padding:10px 0;border-top:1px solid var(--line,#e3e8ee)}.arrq:first-of-type{border-top:0}.arrqo{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:13px;color:var(--mut)}
.arrqo span.ok{color:#16a34a;font-weight:600}.arrqo i{font-style:normal;color:var(--oc);margin-right:4px}
body.arh-on{overflow:hidden}
#arhost{position:fixed;inset:0;z-index:9000;background:radial-gradient(1200px 700px at 20% -10%,#1d4f6e 0,transparent 60%),radial-gradient(900px 600px at 110% 110%,#3b1d5e 0,transparent 55%),#0b1424;color:#f1f5f9;display:flex;flex-direction:column;font-size:16px}
#arhost .arhh{display:flex;align-items:center;gap:10px;padding:10px 16px;padding-top:max(10px,env(safe-area-inset-top))}
#arhost .arht b{display:block;font-size:16px}#arhost .arht span{font-size:12.5px;color:#9fb3c8}
#arhost .arhcod{font:800 20px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;background:rgba(255,255,255,.1);padding:8px 12px;border-radius:10px}
#arhost .arhb{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border-radius:10px;background:rgba(255,255,255,.1);font-weight:600;font-size:14px}#arhost .arhb:hover{background:rgba(255,255,255,.18)}#arhost .arhb[hidden],#arhost [hidden]{display:none!important}#arhost .arhb.dng{background:rgba(220,38,38,.35)}
#arhost .arhm{flex:1;min-height:0;overflow:auto;padding:10px 18px 24px;display:flex;flex-direction:column}
#arhost .arhload{margin:auto;text-align:center;color:#9fb3c8}
#arhost .arhsub{color:#9fb3c8;text-align:center}
#arhost .arhent{display:flex;align-items:center;justify-content:center;gap:28px;flex-wrap:wrap;text-align:center}
#arhost .arhqr{background:#fff;border-radius:16px;padding:10px;width:clamp(150px,22vmin,240px)}#arhost .arhqr svg{width:100%;height:auto;display:block}
#arhost .arhent p{margin:0 0 6px;font-size:clamp(15px,2.2vmin,22px);color:#cbd5e1}
#arhost .arhbig{font:900 clamp(44px,10vmin,110px)/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#fff;text-shadow:0 6px 30px rgba(56,189,248,.35)}
#arhost .arhlob{display:flex;flex-direction:column;gap:18px;flex:1}
#arhost .arhlobb{display:flex;align-items:center;justify-content:center;gap:18px}#arhost .arhlobb h3{margin:0;font-size:22px}
#arhost .arhbtn{min-height:52px;font-size:17px;padding:0 24px;border-radius:14px}#arhost .arhgo{min-height:60px;font-size:20px}
#arhost .arhps{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-content:flex-start}
#arhost .arhp{all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border-radius:999px;padding:4px 14px 4px 4px;font-weight:700;animation:arpop .4s cubic-bezier(.2,1.4,.3,1)}
#arhost .arhp:hover{background:rgba(220,38,38,.35)}#arhost .arhp.exp{opacity:.4;text-decoration:line-through}#arhost .arhp.off{opacity:.6}
#arhost .arhq{display:flex;flex-direction:column;gap:14px;flex:1;max-width:1200px;width:100%;margin:0 auto;position:relative}
#arhost .arhqtop{display:flex;align-items:center;gap:12px;justify-content:space-between}#arhost .arhqn{color:#9fb3c8;font-weight:600}
#arhost .arhrel{font:900 34px/1 system-ui;min-width:70px;text-align:center;background:rgba(255,255,255,.1);border-radius:14px;padding:8px 12px}#arhost .arhrel.pouco{color:#fca5a5;animation:arpul 1s infinite}
#arhost .arhbarw{height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden}#arhost .arhbarw i{display:block;height:100%;background:linear-gradient(90deg,#22d3ee,#a78bfa);transition:width .25s linear}
#arhost .arhqt{font-size:clamp(24px,4.4vmin,48px);text-align:center;margin:8px 0;line-height:1.2;text-transform:none;color:#fff}
#arhost .arhqi{max-height:30vh;max-width:min(90%,700px);align-self:center;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
#arhost .arhops{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto}#arhost .arhops.n2{grid-template-columns:1fr 1fr}
#arhost .arhop{position:relative;overflow:hidden;background:var(--oc);border-radius:16px;padding:18px 18px;display:flex;align-items:center;gap:14px;min-height:80px;box-shadow:0 6px 0 rgba(0,0,0,.25)}
#arhost .arhop span{font-size:26px;width:34px;text-align:center}#arhost .arhop b{font-size:clamp(17px,2.8vmin,30px);flex:1;position:relative;z-index:1}
#arhost .arhop em{font-style:normal;font-weight:900;font-size:24px;position:relative;z-index:1}#arhost .arhop i{position:absolute;left:0;bottom:0;height:6px;background:rgba(255,255,255,.75)}
#arhost .rev .arhop.errada{opacity:.35}#arhost .rev .arhop.certa{box-shadow:0 0 0 4px #fff,0 6px 0 rgba(0,0,0,.25)}
#arhost .arhtop{background:rgba(255,255,255,.06);border-radius:16px;padding:10px 14px;max-width:640px;width:100%;margin:6px auto 0}#arhost .arhtop h3{margin:0 0 6px;font-size:15px;color:#9fb3c8}
#arhost .arhr{display:flex;align-items:center;gap:10px;padding:4px 0}#arhost .arhr>b{width:24px;text-align:center;color:#facc15}#arhost .arhr span{flex:1;font-weight:700}#arhost .arhr em{font-style:normal;font-weight:800}#arhost .arhr small{color:#9fb3c8}
#arhost .arhpausa{position:absolute;inset:0;display:grid;place-items:center;background:rgba(11,20,36,.75);font-size:42px;font-weight:900;border-radius:16px;backdrop-filter:blur(4px)}
#arhost .arhlv{display:flex;flex-direction:column;gap:14px;flex:1;max-width:1200px;width:100%;margin:0 auto;position:relative}
#arhost .arhbars{display:flex;flex-direction:column;gap:8px}
#arhost .arhbr{display:grid;grid-template-columns:30px 40px minmax(90px,200px) 1fr 90px;gap:10px;align-items:center;background:rgba(255,255,255,.06);border-radius:14px;padding:6px 12px;transition:transform .3s}
#arhost .arhbr>b{color:#facc15;text-align:center;font-size:18px}#arhost .arhbn{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#arhost .arhbt:has(u){position:relative;overflow:visible!important;background:repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0 22px,rgba(255,255,255,.05) 22px 44px)!important;border-right:6px dashed #fff}#arhost .arhbt u{position:absolute;top:50%;transform:translate(-50%,-50%);text-decoration:none;transition:left .6s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}#arhost .arhbt{height:18px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}#arhost .arhbt i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#f59e0b,#f97316);transition:width .6s}
#arhost .arhbr em{font-style:normal;font-weight:900;text-align:right;font-size:18px}#arhost .arhbr.sobe{animation:arsobe .7s}#arhost .arhbr.desce{animation:ardesce .7s}
@media (max-width:640px){#arhost .arhbr{grid-template-columns:24px 36px 1fr 70px}#arhost .arhbt{display:none}}
#arhost .arhflo{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-end}
#arhost .arhfa{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.05);border-radius:16px;padding:8px 10px;min-width:120px}#arhost .arhfa span{display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px}#arhost .arhfa b{font-size:15px}#arhost .arhfa small{color:#9fb3c8}
#arhost .arhjd{margin-top:auto;color:#9fb3c8}#arhost .arhjd summary{cursor:pointer;padding:6px}
#arhost .arhtpc{display:flex;flex-direction:column;gap:12px;max-width:900px;margin:0 auto;width:100%}#arhost .arhtpc h3{margin:10px 0 0}
#arhost .arhrank{display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.05);border-radius:14px;padding:8px 14px}
#arhost .arhfim{margin:auto;text-align:center;width:100%;max-width:900px}#arhost .arhfim h2{font-size:clamp(30px,6vmin,60px);margin:0 0 20px;color:#fff;text-transform:none}
.arpod{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:12px;align-items:end}
.arpodc{background:rgba(255,255,255,.08);border-radius:18px 18px 8px 8px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;animation:arsob .8s cubic-bezier(.2,1.2,.3,1) both}
.arpodc.p1{min-height:260px;background:linear-gradient(180deg,rgba(250,204,21,.35),rgba(255,255,255,.06));animation-delay:.6s}.arpodc.p2{min-height:210px;animation-delay:.3s}.arpodc.p3{min-height:180px}
.arpodc b{font-size:18px}.arpodc span{color:#cbd5e1}.arpodc i{font-style:normal;font-weight:900;font-size:28px;color:#facc15}
.arcf{position:absolute;top:-10px;width:9px;height:14px;border-radius:2px;animation:arcai linear forwards;pointer-events:none;z-index:9}
@keyframes arcai{to{top:110%;transform:translateX(40px) rotate(720deg)}}
@keyframes arpop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@keyframes arpul{50%{transform:scale(1.08)}}
@keyframes arsob{from{transform:translateY(60px);opacity:0}}
@keyframes arsobe{30%{transform:translateX(10px);background:rgba(34,197,94,.3)}}
@keyframes ardesce{30%{transform:translateX(-10px);background:rgba(239,68,68,.3)}}
@media print{#arhost{display:none}}
`;document.head.appendChild(st)})();
