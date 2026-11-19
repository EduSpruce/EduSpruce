/* ===================== Arena · app do professor =====================
   Conjuntos de perguntas, lançamento de jogos (ao vivo ou trabalho de casa), ecrã do anfitrião para projetar,
   relatórios e associação à turma. Os conjuntos e os relatórios ficam nos dados do professor (cifrados, na base de dados);
   os jogos usam as tabelas da Arena (ver supabase/migrations/0012_arena.sql). Módulo desativável nas Definições. */
const AR=window.ARENA;
const arOn=()=>S.cfg.arenaOn!==false;
const arD=()=>{S.arena=S.arena||{};const d=S.arena;d.conj=d.conj||[];d.jogos=d.jogos||[];return d};
const arMoedasOn=()=>S.cfg.arenaMoedas!==false;
async function arRpc(fn,args){const p=await sbObter();const c=p.cliente;if(!c||!c.rpc)throw new Error('A base de dados não está disponível.');const {data,error}=await c.rpc(fn,args||{});
  if(error){const m=String(error.message||error.code||error);if(/function .* does not exist|PGRST202|Could not find the function/i.test(m)){const e=new Error('O Spruce It ainda não está instalado na base de dados: falta correr o ficheiro 0012_arena.sql no Supabase.');e.semSql=true;throw e}throw new Error(m)}return data}
const arUrl=c=>location.origin+location.pathname.replace(/[^/]*$/,'')+'spruceit#'+AR.limpaCod(c);
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
TITLES.arena='Spruce It';
{const h=document.querySelector('#side [data-v="contactos"]')||document.querySelector('#side [data-v="recursos"]');if(h&&!document.querySelector('#side [data-v="arena"]')){h.insertAdjacentHTML('afterend',`<button class="nav" data-v="arena" title="Spruce It · jogos de perguntas"><span data-ico="sparkle"></span><span class="lbl">Spruce It</span></button>`);const b=document.querySelector('#side [data-v="arena"]');b.querySelector('[data-ico]').innerHTML=ic('sparkle',18);b.onclick=()=>go('arena')}}
{const _gAr=go;go=function(v){if(v==='arena'&&!arOn())v='inicio';if(go._f&&go._f.arena!==vArena)go._f.arena=vArena;const r=_gAr.call(this,v);try{$$('#side [data-v="arena"]').forEach(b=>{b.hidden=!arOn();b.classList.toggle('on',VIEW==='arena')})}catch(_){}return r};go._f=_gAr._f;if(go._f)go._f.arena=vArena}
{const _vDa=vDefinicoes;vDefinicoes=function(){const r=_vDa.apply(this,arguments);try{const mods=$('#view #def-mods');if(mods&&!$('#ar-on')){mods.insertAdjacentHTML('beforeend',`<label class="chk" style="margin-top:8px"><input type="checkbox" id="ar-on" ${arOn()?'checked':''}> ${ic('sparkle',15)} <span><b>Spruce It</b><br><span class="mut">Jogos de perguntas em tempo real para a turma: os alunos entram pelo telemóvel com um código, sem contas. Também serve para trabalho de casa.</span></span></label>
      <label class="chk" style="margin:4px 0 0 30px" ${arOn()?'':'hidden'} id="ar-mdef"><input type="checkbox" id="ar-moe" ${arMoedasOn()?'checked':''}> <span>Moedas e coleção de Pinhas no Spruce It</span></label>`);
      $('#ar-on').onchange=e=>{S.cfg.arenaOn=e.target.checked;save();toast(e.target.checked?'Arena ligada':'Arena desligada','ok');$('#ar-mdef').hidden=!e.target.checked;try{$$('#side [data-v="arena"]').forEach(b=>b.hidden=!arOn())}catch(_){}};
      $('#ar-moe').onchange=e=>{S.cfg.arenaMoedas=e.target.checked;save();toast(e.target.checked?'Moedas e Pinhas ligadas':'Moedas e Pinhas desligadas','ok')}}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}

/* ---------- vista principal ---------- */
function arHa(t){const d=Math.floor((Date.now()-(+t||Date.now()))/864e5);return d<=0?'hoje':d===1?'ontem':d<7?'há '+d+' dias':d<14?'há 1 semana':d<60?'há '+Math.floor(d/7)+' semanas':'em '+new Date(+t).toLocaleDateString('pt-PT')}
function arDiscs(){const s=new Set();(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>t.disciplina&&s.add(t.disciplina)));arD().conj.forEach(c=>c.disc&&s.add(c.disc));return [...s].sort((a,b)=>a.localeCompare(b,'pt'))}
function arTurmas(){const a=A();return a?a.turmas.filter(t=>(t.alunos||[]).length):[]}
function vArena(){if(!arOn())return go('inicio');const d=arD();if(!d.conj.length&&!S.cfg.arenaEx){d.conj.push(arExemplo());S.cfg.arenaEx=1;save()}
  if(UI.arEd){const c=d.conj.find(x=>x.id===UI.arEd);if(c)return arEditor(c);UI.arEd=null}
  const tab=UI.arTab||'conj';
  barBtns(tab==='conj'?[{id:'ar-imp',t:ic('upload',15)+' Importar CSV/Excel',f:()=>arImportarDlg()},{id:'ar-novo',t:ic('plus',15)+' Novo Conjunto',c:'pri',f:()=>{const c={id:uid(),nome:'Novo conjunto',disc:(T()||{}).disciplina||'',turma:'',tema:'',pasta:'',criado:Date.now(),mod:Date.now(),perg:[{id:uid(),tp:'mc',t:'',o:['','','',''],c:0,s:20}]};d.conj.unshift(c);save();UI.arEd=c.id;vArena()}}]:[{id:'ar-atu',t:ic('refresh',15)+' Atualizar',f:()=>vArena()}]);
  const head=`<div class="arhead sph"><span class="sph-logo">Spruce <em>It</em></span><nav class="sph-tabs" aria-label="Secções"><button data-artab="conj" aria-current="${tab==='conj'?'page':'false'}">${ic('layers',15)} Os meus conjuntos</button><button data-artab="jogos" aria-current="${tab==='jogos'?'page':'false'}">${ic('chart',15)} Jogos e relatórios</button></nav><span class="sph-info">Os alunos entram em <b>eduspruce.pt/spruceit</b> com o código da sala</span></div>`;
  let body='';
  if(tab==='conj'){const F=UI.arF=UI.arF||{disc:'',turma:'',q:''};const q=normT(F.q||'');
    const L=d.conj.filter(c=>(!F.disc||c.disc===F.disc)&&(!F.turma||c.turma===F.turma)&&(!q||normT([c.nome,c.tema,c.pasta,c.disc].join(' ')).includes(q)));
    const pastas=[...new Set(L.map(c=>c.pasta||''))].sort((a,b)=>(a===''?1:0)-(b===''?1:0)||a.localeCompare(b,'pt'));const TT=arTurmas();
    body=`<div class="sph-tit"><h1>Os meus conjuntos</h1><input id="arf-q" type="search" placeholder="Procurar na biblioteca…" value="${esc(F.q||'')}" aria-label="Procurar"><button class="btn sph-novo" id="sp-novo">${ic('plus',15)} Novo conjunto</button></div><div class="row arfl sph-fl"><select id="arf-d" aria-label="Disciplina"><option value="">Todas as disciplinas</option>${arDiscs().map(x=>`<option ${F.disc===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="arf-t" aria-label="Turma"><option value="">Todas as turmas</option>${TT.map(t=>`<option value="${t.id}" ${F.turma===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)}</option>`).join('')}</select><span class="mut sph-n">${L.length} conjunto${L.length===1?'':'s'}</span></div>
      ${L.length?pastas.map(p=>`${pastas.length>1||p?`<h3 class="arpasta">${ic('folder',15)} ${esc(p||'Sem pasta')}</h3>`:''}<div class="arclist">${L.filter(c=>(c.pasta||'')===p).map(c=>{const t=TT.find(z=>z.id===c.turma);const nj=arD().jogos.filter(j=>j.conj===c.id).length;const cor=['var(--acc,#127fa6)','color-mix(in srgb,var(--acc,#127fa6) 70%,#000)','color-mix(in srgb,var(--acc,#127fa6) 65%,#fff)','color-mix(in srgb,var(--acc,#127fa6) 82%,#f59e0b)'][[...String(c.disc||c.nome)].reduce((a,ch)=>a+ch.charCodeAt(0),0)%4];return `<article class="arcc arrow"><div class="arcapa" style="--cc:${cor}" aria-hidden="true">${esc(String(c.disc||c.nome||'?').replace(/[^A-Za-zÀ-ÿ0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?')}</div><div class="arcct"><b>${esc(c.nome)}</b><span class="mut">${c.perg.length} pergunta${c.perg.length===1?'':'s'} · ${nj?nj+' jogo'+(nj===1?'':'s'):'ainda sem jogos'} · editado ${arHa(c.mod||c.criado)}${[c.disc,t?t.nome:'',c.tema].filter(Boolean).length?' · '+esc([c.disc,t?t.nome:'',c.tema].filter(Boolean).join(' · ')):''}</span></div>
        <div class="arcca"><button class="btn" data-are="${c.id}">${ic('pencil',14)} Editar</button><button class="btn" data-artpc="${c.id}" title="Trabalho de casa">${ic('calendar',14)} Atribuir</button><button class="btn pri" data-arj="${c.id}">${ic('sparkle',15)} Lançar jogo</button><button class="btn ico" data-arm="${c.id}" aria-label="Mais opções" title="Duplicar, exportar, apagar"><svg class="icdots" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:block"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button></div></article>`}).join('')}</div>`).join(''):`<div class="card empty">${ic('layers',28)}<br><b>Sem conjuntos${F.disc||F.turma||F.q?' com este filtro':''}</b><br><span class="mut">Crie um conjunto novo ou importe perguntas de um CSV/Excel.</span></div>`}`}
  else body=`<div class="card" id="ar-jogos"><p class="mut">A carregar…</p></div>`;
  $('#view').innerHTML=`<div class="arv spv">${head}${body}</div>`;{const n=$('#sp-novo');if(n)n.onclick=()=>{const b=document.getElementById('ar-novo');if(b)b.click()}}
  $$('#view [data-artab]').forEach(b=>b.onclick=()=>{UI.arTab=b.dataset.artab;vArena()});
  if(tab==='conj'){const F=UI.arF;$('#arf-d').onchange=e=>{F.disc=e.target.value;vArena()};$('#arf-t').onchange=e=>{F.turma=e.target.value;vArena()};
    const qi=$('#arf-q');qi.oninput=()=>{F.q=qi.value;clearTimeout(vArena._t);vArena._t=setTimeout(()=>{vArena();const z=$('#arf-q');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},250)};
    $$('#view [data-are]').forEach(b=>b.onclick=()=>{UI.arEd=b.dataset.are;vArena()});
    $$('#view [data-arj]').forEach(b=>b.onclick=()=>arLancarDlg(d.conj.find(c=>c.id===b.dataset.arj)));
    $$('#view [data-artpc]').forEach(b=>b.onclick=()=>arLancarDlg(d.conj.find(c=>c.id===b.dataset.artpc),'tpc'));
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
      <div class="arqb"><div class="arqt"><textarea data-qt rows="2" placeholder="Escreva a pergunta…">${esc(p.t)}</textarea>${p.img&&FOTOS[p.img]?`<div class="arqimg"><img src="${esc(FOTOS[p.img])}" alt=""><button class="btn sm dng" data-qimx>${ic('x',12)} Tirar imagem</button></div>`:`<button class="btn sm" data-qim>${ic('image',14)} Imagem (opcional)</button>`}</div>
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
  $('#ari-mod').onclick=()=>download('Modelo de perguntas Arena.csv','﻿'+[AR_CAB,['Capital de Portugal?','EM','Porto','Lisboa','Braga','','2','20'],['O Sol é uma estrela.','VF','','','','','V','15']].map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');
  $('#ari-f').onclick=()=>$('#ari-i').click();
  $('#ari-i').onchange=async e=>{const f=e.target.files[0];if(!f)return;let L=[];try{if(/\.xlsx$/i.test(f.name)){const F=await lerXlsxCru(f);const C=Object.values(F)[0]||{};const R={};Object.entries(C).forEach(([ref,v])=>{const m=ref.match(/^([A-Z]+)(\d+)$/);if(!m)return;const col=m[1].split('').reduce((s,ch)=>s*26+ch.charCodeAt(0)-64,0)-1;(R[m[2]]=R[m[2]]||[])[col]=v});L=Object.keys(R).sort((a,b)=>a-b).map(k=>Array.from(R[k],x=>x==null?'':x))}else L=arCsvLinhas(await f.text())}catch(err){return toast('Não foi possível ler o ficheiro: '+err.message,'erro')}
    const P=arDeLinhas(L);if(!P.length)return toast('Não encontrei perguntas no ficheiro. Veja o modelo.','aviso');
    const d=arD();let c=alvo;if(!c){c={id:uid(),nome:f.name.replace(/\.[^.]+$/,''),disc:(T()||{}).disciplina||'',turma:'',tema:'',pasta:'',criado:Date.now(),mod:Date.now(),perg:[]};d.conj.unshift(c)}c.perg.push(...P);c.mod=Date.now();save();audit('Spruce It','Importação de perguntas',c.nome+' · '+P.length);closeDrawer();toast(P.length+' pergunta'+(P.length>1?'s':'')+' importada'+(P.length>1?'s':''),'ok');UI.arEd=c.id;vArena()}}
function arExportar(c){const L=[AR_CAB,...c.perg.map(p=>[p.t,p.tp==='vf'?'VF':'EM',...(p.tp==='vf'?['','','','']:[0,1,2,3].map(k=>p.o[k]||'')),p.tp==='vf'?(p.c===0?'V':'F'):String(p.c+1),String(p.s||20)])];
  download(c.nome+'.csv','﻿'+L.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');audit('Spruce It','Exportação de perguntas',c.nome)}

/* ---------- lançar um jogo ---------- */
/* v1.054 · lançar jogo em dois passos (como no design): 1) escolher o modo, 2) definições da sala */
const AR_OBJ={floresta:{u:'árvores',p:2,min:4,d:12,f:v=>'Primeiro a '+v+' árvores'},corrida:{u:'casas',p:5,min:5,d:20,f:v=>'Meta a '+v+' casas'},pesca:{u:'quilos',p:500,min:500,d:1000,f:v=>'Primeiro a '+AR.metrica('pesca',v)},
  cume:{u:'metros',p:50,min:100,d:300,f:v=>'Cume a '+AR.nf(v)+' m'},cofre:{u:'pontos no cofre',p:500,min:1000,d:3000,f:v=>'Cofre de equipa a '+AR.nf(v)},estafeta:{u:'etapas',p:5,min:5,d:15,f:v=>'Equipa a '+v+' etapas'},
  _:{u:'pontos',p:250,min:500,d:1500,f:v=>'Primeiro a '+AR.nf(v)+' pontos'}};
const arObjDe=m=>AR_OBJ[m]||AR_OBJ._;
function arLancarDlg(c,tipo0){if(!c)return;const P=c.perg.filter(p=>p.t.trim()&&p.o.filter(x=>String(x).trim()).length>=2&&String(p.o[p.c]||'').trim());
  if(!P.length)return toast('Este conjunto ainda não tem perguntas completas.','aviso');
  const L=UI.arL=Object.assign({modo:'classico',tipo:'vivo',dur:420,obj:0,fim:'tempo',nomes:'livre',turma:c.turma||((T()||{}).id)||'',tardias:true,moedas:arMoedasOn(),limite:'',tema:S.cfg.arenaTema||'recreio',equipas:4,mostrar:true,alcAleat:false,silencio:true},UI.arL||{});
  if(L.ordem==null)L.ordem=L.aleat===false?'seq':'ale';if(!AR.MODOS[L.modo])L.modo='classico';if(c.turma)L.turma=c.turma;if(tipo0)L.tipo=tipo0;L.passo='modo';
  const TT=arTurmas();const hoje=new Date(Date.now()+7*864e5);hoje.setHours(23,59,0,0);const limDef=new Date(hoje.getTime()-hoje.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  const tagDe=(k,m)=>m.tag||(k==='classico'?'Todos ao mesmo tempo':'Ao ritmo de cada um');
  const modoPadrao=k=>{const M=AR.MODOS[k];L.modo=k;L.dur=(M.min||7)*60;L.fim='tempo';L.obj=arObjDe(k).d;if(M.soVivo)L.tipo='vivo';if(L.ordem==='dom'&&!M.v2)L.ordem='ale'};
  const desenha=()=>{const M=AR.MODOS[L.modo];const ink=M.inkc||'#fff';
    if(L.passo==='modo'){openDrawer('Lançar Jogo · '+c.nome,`<div class="ed arlan2"><h2 class="arh2">Escolhe o modo</h2><p class="mut" style="margin:0 0 14px">As mesmas perguntas, regras diferentes. Todos funcionam com qualquer conjunto.</p>
      <div class="armgrid">${Object.entries(AR.MODOS).map(([k,m])=>`<button type="button" class="armc" data-arm2="${k}" aria-pressed="${L.modo===k}"><div class="armart" style="background:${m.cor};color:${m.inkc||'#fff'}">${AR.emblema(k,m.inkc||'#fff',m.cor)}<b>${esc(m.nome)}</b>${m.v2?'<em class="armnovo">Novo</em>':''}</div><div class="armft"><b>${esc(tagDe(k,m))}</b><small>${m.min?m.min+' min · '+m.jog:m.dur?'com tempo':'pergunta a pergunta'}</small></div></button>`).join('')}</div>
      <div class="arbarra"><div><b>${esc(M.nome)}</b><small>${esc(M.desc)}</small></div><button class="btn pri" id="arl-seg">Continuar ›</button></div></div>`);
      $$('#dw-b [data-arm2]').forEach(b=>{b.onclick=()=>{modoPadrao(b.dataset.arm2);desenha();const x=$(`#dw-b [data-arm2="${b.dataset.arm2}"]`);if(x)x.focus({preventScroll:true})};b.ondblclick=()=>{modoPadrao(b.dataset.arm2);L.passo='sala';desenha()}});
      $('#arl-seg').onclick=()=>{L.passo='sala';desenha()};return}
    const O=arObjDe(L.modo);const objOK=M.dur&&!!M.obj;if(!objOK)L.fim='tempo';const tpc=L.tipo==='tpc';const tSel=TT.find(t=>t.id===L.turma);
    const sw=(id,on,tit,sub,vis)=>vis===false?'':`<button type="button" role="switch" class="arsw" aria-checked="${!!on}" data-arsw="${id}"><span><b>${tit}</b><small>${sub}</small></span><i aria-hidden="true"></i></button>`;
    openDrawer('Lançar Jogo · '+c.nome,`<div class="ed arlan2"><div class="arsala">
      <aside class="arhero2"><button type="button" class="arvolta" id="arl-volta">← Escolhe o modo</button><div class="areb">${M.ic} ${esc(M.nome)}</div><h2>${esc(c.nome)}</h2><div>${P.length} pergunta${P.length>1?'s':''}${P.length<c.perg.length?' (as incompletas ficam de fora)':''}${L.nomes==='lista'&&tSel?' · '+esc(tSel.nome):''}</div><button type="button" class="arabrir" id="arl-ok">${tpc?'Criar trabalho de casa':'Abrir sala'}</button></aside>
      <section class="arcfg">
        <div><label>Como se joga</label><div class="seg arseg"><button type="button" data-art="vivo" class="${!tpc?'on':''}">${ic('users',14)} Ao vivo na aula</button><button type="button" data-art="tpc" class="${tpc?'on':''}" ${M.soVivo?'disabled title="Este modo só se joga ao vivo"':''}>${ic('calendar',14)} Trabalho de casa</button></div></div>
        ${M.dur?`<div><label>O jogo termina</label><div class="seg arseg"><button type="button" data-arf="tempo" class="${L.fim==='tempo'?'on':''}">Quando o tempo acabar</button><button type="button" data-arf="obj" class="${L.fim==='obj'?'on':''}" ${objOK?'':'disabled title="Este modo termina pelo tempo"'}>Ao atingir ${O.u==='pontos'?'a pontuação':'o objetivo'}</button></div></div>
          <div class="arstep"><b id="arl-sl">${L.fim==='obj'?'Objetivo ('+O.u+')':'Minutos'+(tpc?' por aluno':'')}</b><span><button type="button" data-ars="-1" aria-label="Menos">−</button><output>${L.fim==='obj'?(L.modo==='pesca'?AR.metrica('pesca',L.obj):AR.nf(L.obj)):Math.round(L.dur/60)}</output><button type="button" data-ars="1" aria-label="Mais">+</button></span></div>
          ${L.fim==='obj'?`<p class="hint" style="margin:0">${esc(O.f(L.obj))}. Por segurança, o jogo também acaba ao fim de 20 minutos.</p>`:''}`
        :`<p class="hint" style="margin:0">${L.modo==='expedicao'?'Sem relógio: cada aluno avança no mapa ao seu ritmo; as perguntas falhadas voltam até estarem dominadas.':!tpc?'Mostra as perguntas no ecrã projetado, uma a uma; cada pergunta usa o tempo definido no conjunto.':'Cada aluno responde às '+P.length+' perguntas uma vez, ao seu ritmo; a rapidez também conta.'}</p>`}
        ${tpc?`<div><label>Data-limite</label><input type="datetime-local" id="arl-lim" value="${esc(L.limite||limDef)}"></div>`:''}
        ${L.modo!=='expedicao'?`<div><label>Ordem das perguntas</label><div class="seg arseg"><button type="button" data-aro="ale" class="${L.ordem==='ale'?'on':''}">Aleatória</button><button type="button" data-aro="seq" class="${L.ordem==='seq'?'on':''}">Sequencial</button>${M.v2?`<button type="button" data-aro="dom" class="${L.ordem==='dom'?'on':''}">Até dominar</button>`:''}</div></div>`:''}
        ${M.eq?`<div class="arstep"><b>Equipas</b><span><button type="button" data-areq="-1" aria-label="Menos equipas">−</button><output>${L.equipas}</output><button type="button" data-areq="1" aria-label="Mais equipas">+</button></span></div><p class="hint" style="margin:0">${AR.EQUIPAS.slice(0,L.equipas).map(e=>`<span class="areqc" style="background:${e[1]}">${e[0]}</span>`).join(' ')} — os alunos são distribuídos à chegada.</p>`:''}
        <div><label>Aspeto no ecrã dos alunos e no quadro</label><div class="seg arseg artemas">${Object.entries(AR.TEMAS).map(([k,t])=>`<button type="button" data-artm="${k}" class="${L.tema===k?'on':''}"><i style="background:${t.v['--hero']};border-color:${t.v['--accent']}"></i>${t.nome}</button>`).join('')}</div></div>
        <div><label>Nomes dos alunos</label><div class="seg arseg"><button type="button" data-arn="livre" class="${L.nomes==='livre'?'on':''}">Alcunhas</button><button type="button" data-arn="lista" class="${L.nomes==='lista'?'on':''}">Lista da turma</button></div>
        ${L.nomes==='lista'?`<select id="arl-t" style="margin-top:8px">${TT.map(t=>`<option value="${t.id}" ${L.turma===t.id?'selected':''}>${esc(t.nome)} · ${esc(t.disciplina)} (${alunosAval(t).length} alunos)</option>`).join('')}</select><p class="hint">Cada aluno escolhe o seu nome (só o primeiro e o último nome, cifrados com o código da sala). Os resultados ligam-se sozinhos à turma e as moedas ficam na coleção de cada aluno.</p>`:`<p class="hint">As palavras impróprias são recusadas. No fim pode ligar cada alcunha a um aluno da turma.</p>`}</div>
        <div class="arsws">${sw('mostrar',L.mostrar,'Mostrar a resposta certa','Depois de cada pergunta',!!M.v2)}${sw('tardias',L.tardias,'Permitir entradas tardias','Quem chega atrasado ainda joga',!tpc)}${sw('alcAleat',L.alcAleat,'Alcunhas aleatórias','Evita nomes demasiado criativos',L.nomes==='livre')}${sw('silencio',L.silencio,'Silenciar os sons dos jogadores','Para salas partilhadas')}${sw('moedas',L.moedas,'Moedas e Pinhas','Os alunos da lista ganham moedas para a coleção',arMoedasOn())}</div>
      </section></div></div>`);
    $('#arl-volta').onclick=()=>{L.passo='modo';desenha()};
    $$('#dw-b [data-art]').forEach(b=>b.onclick=()=>{L.tipo=b.dataset.art;desenha()});
    $$('#dw-b [data-arf]').forEach(b=>b.onclick=()=>{L.fim=b.dataset.arf;if(L.fim==='obj'&&!L.obj)L.obj=O.d;desenha()});
    $$('#dw-b [data-ars]').forEach(b=>b.onclick=()=>{const k=+b.dataset.ars;if(L.fim==='obj')L.obj=Math.max(O.min,(L.obj||O.d)+k*O.p);else L.dur=Math.min(60,Math.max(2,Math.round(L.dur/60)+k))*60;desenha()});
    $$('#dw-b [data-aro]').forEach(b=>b.onclick=()=>{L.ordem=b.dataset.aro;desenha()});
    $$('#dw-b [data-areq]').forEach(b=>b.onclick=()=>{L.equipas=Math.min(6,Math.max(2,L.equipas+(+b.dataset.areq)));desenha()});
    $$('#dw-b [data-artm]').forEach(b=>b.onclick=()=>{L.tema=b.dataset.artm;S.cfg.arenaTema=L.tema;save();desenha()});
    $$('#dw-b [data-arn]').forEach(b=>b.onclick=()=>{if(b.dataset.arn==='lista'&&!TT.length)return toast('Não há turmas com alunos neste ano letivo','aviso');L.nomes=b.dataset.arn;if(!TT.some(t=>t.id===L.turma)&&TT[0])L.turma=TT[0].id;desenha()});
    $$('#dw-b [data-arsw]').forEach(b=>b.onclick=()=>{const k=b.dataset.arsw;L[k]=!L[k];b.setAttribute('aria-checked',!!L[k])});
    const v=(s,k,f)=>{const e=$(s);if(e)e.onchange=()=>{L[k]=f(e)}};v('#arl-lim','limite',e=>e.value);{const e=$('#arl-t');if(e)e.onchange=()=>{L.turma=e.value;desenha()}}
    $('#arl-ok').onclick=async()=>{const b=$('#arl-ok');const txt=b.textContent;b.disabled=true;b.textContent='A criar a sala…';
      try{if(M.v2){let ver=0;try{ver=+(await arRpc('arena_versao',{}))||0}catch(_){}if(ver<17)throw new Error('Este modo precisa de uma atualização da base de dados: o administrador tem de correr uma vez o script «0017_arena_modos_cume.sql» no Supabase (SQL Editor › Run).')}
        else if(!['classico','colheita','floresta'].includes(L.modo)){const sb=(await sbObter()).cliente;const r=await sb.rpc('arena_acao2',{p_id:'0'.repeat(40),p_j:'00000000-0000-0000-0000-000000000000',p_tok:'x'.repeat(20),p_escolha:0,p_alvo:null});if(r.error&&/PGRST202|does not exist|Could not find|schema cache/i.test((r.error.code||'')+' '+(r.error.message||'')))throw new Error('Este modo precisa de uma atualização da base de dados: o administrador tem de correr uma vez o script «0014_arena_modos.sql» no Supabase (SQL Editor › Run).')}
        await arCriar(c,P,L)}catch(e){b.disabled=false;b.textContent=txt;toast(e.message,'erro')}}};
  desenha()}
async function arCriar(c,P,L){const code=AR.codigo();const id=await AR.salaId(code);const M=AR.MODOS[L.modo];
  S.cfg.arenaSal=S.cfg.arenaSal||AR.token();let lista=null,refs={};
  if(L.nomes==='lista'){const t=arTurmas().find(x=>x.id===L.turma);if(!t)throw new Error('Escolha a turma.');const al=alunosAval(t);lista=[];
    for(const a of al){const r=(await AR.sha('es-arena-ref:'+S.cfg.arenaSal+':'+(a.cid||a.id))).slice(0,32);refs[r]=a.id;const pn=String(a.nome||'').trim().split(/\s+/);lista.push({r,n:(numAl(a)?numAl(a)+'. ':'')+pn[0]+(pn.length>1?' '+pn[pn.length-1]:'')})}}
  const perguntas=P.map(p=>{const o={t:p.t.trim(),o:(p.tp==='vf'?['Verdadeiro','Falso']:p.o.map(x=>String(x||'').trim())).filter((x,k)=>x||k<2),s:+p.s||20,tp:p.tp};if(p.img&&FOTOS[p.img])o.img=FOTOS[p.img];return o});
  const certas=P.map(p=>p.c);
  const porObj=M.dur&&M.obj&&L.fim==='obj';
  const cfg={titulo:c.nome,nomes:L.nomes,tardias:L.tipo==='vivo'?!!L.tardias:true,aleatoria:L.ordem!=='seq',dominar:!!M.v2&&L.ordem==='dom',moedas:arMoedasOn()&&!!L.moedas,duracao:M.dur?(porObj?1200:L.dur):0,objetivo:porObj?(L.obj||0):0,
    tema:AR.temaOk(L.tema),mostrar:L.mostrar!==false,silencio:!!L.silencio};if(M.eq)cfg.equipas=L.equipas;if(L.alcAleat&&L.nomes==='livre')cfg.alcunhas='aleat';
  if(lista)cfg.lista_c=await AR.cifrar(lista,code);
  const limite=L.tipo==='tpc'?new Date(L.limite||Date.now()+7*864e5).toISOString():null;
  if(L.tipo==='tpc'&&new Date(limite)<=new Date())throw new Error('A data-limite tem de ser no futuro.');
  await arRpc('arena_criar',{p_id:id,p_tipo:L.tipo,p_modo:L.modo,p_cfg:cfg,p_perguntas:perguntas,p_certas:certas,p_limite:limite});
  const j={id,codigo:code,conj:c.id,nome:c.nome,modo:L.modo,tipo:L.tipo,tema:cfg.tema,turma:L.nomes==='lista'?L.turma:'',refs,criado:Date.now(),limite,perg:P.map(p=>({t:p.t,o:p.tp==='vf'?['Verdadeiro','Falso']:p.o.slice(),c:p.c}))};
  arD().jogos.unshift(j);if(arD().jogos.length>200)arD().jogos.length=200;save();audit('Spruce It','Jogo lançado',c.nome+' · '+M.nome+' · '+(L.tipo==='tpc'?'trabalho de casa':'ao vivo'));
  closeDrawer();arAnfitriao(j)}

/* v1.054 · ecrã projetado dos modos novos */
function arFontes(){if(!document.getElementById('es-fontes')){const l=document.createElement('link');l.id='es-fontes';l.rel='stylesheet';l.href='fontes/fontes.css';document.head.appendChild(l)}}
function arNovoCorpo(h,ativos,s){const m=h.j.modo;const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos);const x=p=>p.x||{};const av=(p,n)=>AR.svg(p.avatar,n||34);
  const lista=(L,f)=>`<div class="arhn-l">${L.slice(0,8).map((p,k)=>`<div class="arhr"><b>${k+1}</b>${av(p)}<span>${esc(p.alcunha)}</span><em>${f?f(p):AR.metrica(m,p.pontos)}</em></div>`).join('')||'<p class="arhsub">Ninguém ainda…</p>'}</div>`;
  if(m==='cume'){const obj=+(s.cfg||{}).objetivo||0;const lid=Math.max(1,...top.map(p=>+p.pontos||0));const meta=obj||Math.max(150,Math.ceil(lid*1.15/50)*50);
    const pos=(v,k)=>{const q=Math.min(1,(+v||0)/meta);return `left:${3+q*72+((k%3)-1)*2.2}%;top:${92-q*82+((k%2)?3:0)}%`};
    return `<div class="arhn-2"><div class="arhmont"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,100 75,8 100,100" fill="var(--a1)" opacity=".85"/><polygon points="38,100 75,8 100,100" fill="#000" opacity=".12"/><polygon points="66.5,18.5 75,8 83.5,18.5 79.5,16.5 75,21 70.5,16.5" fill="#fff" opacity=".9"/></svg><span class="arhalp arhflag" style="left:75%;top:8%">🚩</span>${top.slice(0,20).reverse().map((p,k)=>`<span class="arhalp" style="${pos(p.pontos,k)}" title="${esc(p.alcunha)}">${av(p,40)}<i>${esc(p.alcunha)}</i></span>`).join('')}</div>
      <div><h3>${obj?'Cume a '+AR.nf(obj)+' m':'Mais alto'}</h3>${lista(top)}</div></div>`}
  if(m==='mare'){const vivos=ativos.filter(p=>!x(p).fora);return `<h3 class="arhn-t">🏝️ ${vivos.length} em terra firme · 🌊 ${ativos.length-vivos.length} levado${ativos.length-vivos.length===1?'':'s'} pela maré</h3>
    <div class="arhn-g">${top.map(p=>{const a=+x(p).agua||0;return `<div class="arhn-c ${x(p).fora?'fora':''}">${av(p,44)}<b>${esc(p.alcunha)}</b><div class="arhagua ${a>=3?'perigo':''}">${[0,1,2,3,4].map(i=>`<i class="${i<a?'on':''}"></i>`).join('')}</div><small>${x(p).fora?'🌊 levado pela maré':AR.nf(p.pontos)+' pts'}</small></div>`}).join('')||'<p class="arhsub">Ninguém ainda…</p>'}</div>`}
  if(m==='expedicao'){const N=s.n_perg;return `<div class="arhn-l">${top.map((p,k)=>{const v=Math.min(N,+p.pontos||0);return `<div class="arhr arhexp"><b>${k+1}</b>${av(p)}<span>${esc(p.alcunha)}</span><div class="arhmapa">${Array.from({length:N},(_,i)=>`<i class="${i<v?'on':''}"></i>`).join('')}<u class="${v>=N?'on':''}"></u></div><em>${v}/${N}${p.terminou?' ✓':''}</em></div>`}).join('')||'<p class="arhsub">Ninguém ainda…</p>'}</div>`}
  if(m==='duelo'){const by=Object.fromEntries(ativos.map(p=>[p.id,p]));const vistos=new Set();const pares=[];ativos.forEach(p=>{const a=x(p).adv;if(a&&by[a]&&!vistos.has(p.id)){vistos.add(p.id);vistos.add(a);pares.push([p,by[a]])}});
    const camp=top.filter(p=>!x(p).apoia);const apo=ativos.length-camp.length;
    return `<div class="arhn-2"><div><h3>⚔️ Duelos a decorrer</h3><div class="arhduelos">${pares.map(([a,b])=>`<div class="arhduelo"><span>${av(a,40)}<b>${esc(a.alcunha)}</b><small>${+x(a).ok||0} certas · ronda ${Math.min(3,(+x(a).di||0)+1)}</small></span><i>VS</i><span>${av(b,40)}<b>${esc(b.alcunha)}</b><small>${+x(b).ok||0} certas · ronda ${Math.min(3,(+x(b).di||0)+1)}</small></span></div>`).join('')||'<p class="arhsub">À espera de pares…</p>'}</div></div>
      <div><h3>🏆 Ainda em prova (${camp.length}) · 📣 ${apo} a apoiar</h3>${lista(camp,p=>AR.nf(p.pontos)+(x(p).apo?` <small>📣${x(p).apo}</small>`:''))}</div></div>`}
  if(AR.MODOS[m].eq){const E=(h.d.equipas||[]).slice();const est=m==='estafeta';const val=e=>est?e.etapas:e.pontos;const obj=+(s.cfg||{}).objetivo||0;const mx=Math.max(obj,...E.map(val),est?10:1000);
    return `<div class="arhn-eqs">${E.sort((a,b)=>val(b)-val(a)).map(e=>{const Q=AR.equipa(e.eq);return `<div class="arhn-eq" style="--ec:${Q[1]}"><div class="arhn-eqh"><b>${esc(Q[0])}</b><span class="disp">${est?e.etapas+' etapa'+(e.etapas===1?'':'s'):'🔐 '+AR.nf(e.pontos)}</span></div>
      <div class="arhn-pista"><i style="width:${Math.max(2,100*val(e)/mx)}%"></i>${est&&e.vez?`<u style="left:${Math.min(96,100*val(e)/mx)}%">🏃</u>`:''}</div>
      <div class="arhn-mb">${(e.membros||[]).map(p=>`<span class="${est&&p.id===e.vez_id?'vez':''}">${AR.svg(p.avatar,26)}${esc(p.alcunha)}${est?'':' · 🎒'+AR.nf(p.mao)}</span>`).join('')||'<small>sem jogadores</small>'}</div>${est&&e.vez?`<small>É a vez de <b>${esc(e.vez)}</b></small>`:''}</div>`}).join('')}</div>`}
  return ''}

/* ---------- ecrã do anfitrião ---------- */
let arH=null;
function arCanalAbrir(id){arCanalFechar();sbObter().then(p=>{try{const c=p.cliente;if(!c||!c.channel)return;arCanal=c.channel('arena-'+id,{config:{broadcast:{self:false,ack:false}}});arCanal.subscribe()}catch(_){}}).catch(()=>{})}
function arCanalFechar(){try{if(arCanal){arCanal.unsubscribe&&arCanal.unsubscribe()}}catch(_){}arCanal=null}
function arAvisar(ev){try{arCanal&&arCanal.send({type:'broadcast',event:'s',payload:{e:ev||'sync',t:Date.now()}})}catch(_){}}
async function arAnfitriao(j){arFecharHost();await aaQrLib().catch(()=>{});arFontes();
  const o=document.createElement('div');o.id='arhost';o.className='arhost v2';o.style.cssText=AR.temaCss(j.tema);o.setAttribute('role','dialog');o.setAttribute('aria-label','Spruce It · '+j.nome);document.body.appendChild(o);document.body.classList.add('arh-on');
  arH={j,o,d:null,vivo:true,ultV:-1,fase:'',rev:-1,ultAv:0,topAnt:{}};arCanalAbrir(j.id);
  o.innerHTML=`<header class="arhh"><span class="arhlogo">Spruce <em>It</em></span><div class="arht"><b>${esc(j.nome)}</b><span>${AR.MODOS[j.modo].ic} ${AR.MODOS[j.modo].nome} · ${j.tipo==='tpc'?'Trabalho de casa':'Ao vivo'}</span></div><span class="sp1"></span>
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
  const entrar=`<div class="arhent"><div class="arhqr">${qr}</div><div class="arhcodb"><p>Entra em <b>${esc(url.replace(/^https?:\/\//,'').replace(/#.*$/,''))}</b></p><div class="arhhero"><span>Código da sala</span><div class="arhbig">${AR.fmt(h.j.codigo)}</div></div></div></div>`;
  if(s.estado==='fim'){const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos);if(h.fase!=='fim'){h.fase='fim';AR.tocar('fim');setTimeout(()=>AR.confetes(m,90),300)}
    const EQ=(AR.MODOS[h.j.modo]||{}).eq&&(h.d.equipas||[]).length?(h.d.equipas||[]).slice().sort((a,b)=>h.j.modo==='estafeta'?b.etapas-a.etapas||b.pontos-a.pontos:b.pontos-a.pontos):null;
    m.innerHTML=`<div class="arhfim"><p class="arheb">Classificação final</p><h2>${h.j.tipo==='tpc'?'Trabalho de casa fechado':EQ?'Ganharam os '+esc(AR.equipa(EQ[0].eq)[0])+'!':top[0]?esc(top[0].alcunha)+' ganhou!':'Fim do jogo!'}</h2>${EQ?`<div class="arhn-eqf">${EQ.map((e,k)=>{const Q=AR.equipa(e.eq);return `<div style="--ec:${Q[1]}"><i>${k+1}.º</i><b>${esc(Q[0])}</b><span>${h.j.modo==='estafeta'?e.etapas+' etapas':'🔐 '+AR.nf(e.pontos)}</span></div>`}).join('')}</div>`:''}<div class="arpod">${[1,0,2].map(k=>top[k]?`<div class="arpodc p${k+1}"><div class="arpoda">${AR.svg(top[k].avatar,k===0?110:84)}</div><b>${esc(top[k].alcunha)}</b><span>${h.j.modo==='floresta'?AR.arvores(top[k].arv).inteiras+' árvores':AR.metrica(h.j.modo,top[k].pontos)+(['pesca','corrida','cume','expedicao'].includes(h.j.modo)?'':' pts')}</span><i>${k+1}.º</i></div>`:'<div></div>').join('')}</div>
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
        <h2 class="arhqt">${esc(p.t||'')}</h2>${p.img?`<img class="arhqi" src="${esc(p.img)}" alt="">`:''}<div class="arhops n${ops.length}">${ops.map((x,k)=>`<div class="arhop" style="--oc:var(--a${k+1})"><span>${arFormas[k]}</span><b>${esc(x)}</b></div>`).join('')}</div>${s.estado==='pausa'?'<div class="arhpausa">Em pausa</div>':''}</div>`;arRelogio();return}
    const ce=h.d.certas[i];const cont=h.d.atual||{};const tot=Object.values(cont).reduce((a,b)=>a+b,0)||1;if(h.fase!=='r'+i){h.fase='r'+i;AR.tocar('certo')}
    const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos).slice(0,5);const ult=i>=s.n_perg-1;
    m.innerHTML=`<div class="arhq rev"><div class="arhqtop"><span class="arhqn">Pergunta ${i+1} de ${s.n_perg}</span><span class="sp1"></span></div><h2 class="arhqt">${esc(p.t||'')}</h2>
      <div class="arhops n${ops.length}">${ops.map((x,k)=>`<div class="arhop ${k===ce?'certa':'errada'}" style="--oc:var(--a${k+1})"><span>${k===ce?'✓':arFormas[k]}</span><b>${esc(x)}</b><em>${cont[k]||0}</em><i style="width:${100*(cont[k]||0)/tot}%"></i></div>`).join('')}</div>
      <div class="arhtop"><h3>Classificação</h3>${top.map((x,k)=>`<div class="arhr"><b>${k+1}</b>${AR.svg(x.avatar,34)}<span>${esc(x.alcunha)}</span><em>${AR.nf(x.pontos)}</em></div>`).join('')}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri arhbtn" id="arh-seg">${ult?'Ver Pódio':'Próxima Pergunta'} ›</button></div></div>`;
    m.querySelector('#arh-seg').onclick=()=>{if(ult)arCtl('terminar');else arCtl('perg',{i:i+1})};return}
  /* modos ao ritmo de cada aluno: classificação ao vivo / floresta */
  const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos);if(h.fase!=='livre'){h.fase='livre'}
  const mx=Math.max(1,...top.map(x=>h.j.modo==='floresta'?x.arv:x.pontos));
  const corpo=AR.NOVOS.includes(h.j.modo)?arNovoCorpo(h,ativos,s):h.j.modo==='floresta'?`<div class="arhflo">${top.map((x,k)=>`<div class="arhfa">${arArvoreSVG(x.arv,Math.min(130,60+x.arv*4))}<span>${AR.svg(x.avatar,26)} ${esc(x.alcunha)}</span><b>${AR.arvores(x.arv).inteiras} 🌲 <small>+${AR.arvores(x.arv).fase}/4</small></b></div>`).join('')||'<p class="arhsub">Ninguém ainda…</p>'}</div>`
    :`<div class="arhbars">${top.slice(0,12).map((x,k)=>{const ant=h.topAnt[x.id];const sub=ant!=null&&x.pontos>ant,des=ant!=null&&x.pontos<ant;return `<div class="arhbr ${sub?'sobe':''} ${des?'desce':''}"><b>${k+1}</b>${AR.svg(x.avatar,36)}<span class="arhbn">${esc(x.alcunha)}</span><span class="arhbt"><i style="width:${Math.max(2,100*x.pontos/(h.j.modo==='corrida'&&s.cfg.objetivo?Math.max(mx,s.cfg.objetivo):mx))}%"></i>${h.j.modo==='corrida'?`<u style="left:${Math.min(100,100*x.pontos/(s.cfg.objetivo?Math.max(mx,s.cfg.objetivo):mx))}%">${AR.svg(x.avatar,30)}</u>`:''}</span><em>${AR.metrica(h.j.modo,x.pontos)}</em></div>`}).join('')}</div>`;
  top.forEach(x=>h.topAnt[x.id]=x.pontos);
  m.innerHTML=`<div class="arhlv"><div class="arhqtop"><span class="arhqn">${ativos.length} jogadores · ${h.d.respostas} respostas</span><span class="arhrel" id="arh-rel"></span><span class="arhqn">${s.cfg.objetivo?'Objetivo: '+(AR.NOVOS.includes(h.j.modo)?arObjDe(h.j.modo).f(s.cfg.objetivo):h.j.modo==='floresta'?s.cfg.objetivo+' árvores':['pesca','corrida'].includes(h.j.modo)?AR.metrica(h.j.modo,s.cfg.objetivo):AR.nf(s.cfg.objetivo)+' pts'):(AR.MODOS[h.j.modo]||{}).nome||''}</span></div>${corpo}${s.estado==='pausa'?'<div class="arhpausa">Em pausa</div>':''}
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
      <div class="tblw"><table class="lst"><thead><tr><th>#</th><th>Jogador</th>${!j.turma?'<th>Aluno</th>':''}<th>Certas</th><th>Erradas</th><th>Acerto</th><th>${j.modo==='floresta'?'Árvores':j.modo==='pesca'?'Quilos':j.modo==='corrida'?'Casas':j.modo==='cume'?'Metros':j.modo==='expedicao'?'Etapas':'Pontos'}</th></tr></thead><tbody>${porA.map((x,k)=>`<tr><td>${k+1}</td><td><b>${esc(x.a)}</b></td>${!j.turma?`<td><select data-arlg="${x.id}" aria-label="Aluno"><option value="">—</option>${AL.map(a=>`<option value="${a.id}" ${x.al===a.id?'selected':''}>${esc(numAl(a))}. ${esc(a.nome)}</option>`).join('')}</select></td>`:''}<td>${x.ok}</td><td>${x.n-x.ok}</td><td><b style="color:${corP(x.taxa)}">${x.taxa==null?'—':Math.round(x.taxa*100)+'%'}</b></td><td>${j.modo==='floresta'?AR.arvores(x.arv).inteiras:AR.metrica(j.modo,x.pts)}</td></tr>`).join('')||'<tr><td colspan="7" class="mut">Ninguém jogou.</td></tr>'}</tbody></table></div>
      <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><span class="mut">${j.assoc?'Já associado à turma: '+esc(j.assoc.txt):'Os resultados podem ficar na turma como instrumento formativo (sem peso na classificação).'}</span><span class="sp1"></span><button class="btn pri" id="arr-as">${ic('plus',15)} ${j.assoc?'Atualizar na Turma':'Associar à Turma'}</button></div></div>
    <div class="card"><h2>${ic('clipboard',18)} Por pergunta</h2>${porP.map(x=>`<div class="arrq"><div class="row" style="gap:8px"><b>${x.k+1}.</b><span style="flex:1">${esc(x.p.t)}</span><b style="color:${corP(x.taxa)}">${x.taxa==null?'—':Math.round(x.taxa*100)+'%'}</b></div><div class="arrqo">${(x.p.o||[]).map((o,k)=>`<span class="${k===x.p.c?'ok':''}"><i style="--oc:${arCores[k]}">${k===x.p.c?'✓':arFormas[k]}</i>${esc(o)} <b>${x.dist[k]||0}</b></span>`).join('')}</div></div>`).join('')}</div></div>`;
  const st=$('#arr-t');if(st)st.onchange=()=>{UI.arRelT=st.value;arRelatorio(j)};
  $$('#view [data-arlg]').forEach(s=>s.onchange=()=>{j.liga=j.liga||{};j.liga[s.dataset.arlg]=s.value;const x=R.jog.find(z=>z.id===s.dataset.arlg);if(x)x.al=s.value;save();const y=window.scrollY,v=$('#view').scrollTop;arRelatorio(j);window.scrollTo(0,y);$('#view').scrollTop=v});
  $('#arr-as').onclick=()=>arAssociar(j,porA,tSel)}
function arRelCsv(j,porA,porP){const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';const L=[['Jogador','Certas','Erradas','Acerto (%)',j.modo==='floresta'?'Árvores':j.modo==='pesca'?'Quilos':j.modo==='corrida'?'Casas':j.modo==='cume'?'Metros':j.modo==='expedicao'?'Etapas':'Pontos'],...porA.map(x=>[x.a,x.ok,x.n-x.ok,x.taxa==null?'':Math.round(x.taxa*100),j.modo==='floresta'?AR.arvores(x.arv).inteiras:j.modo==='pesca'?Math.round(x.pts)/10:x.pts]),[],['Pergunta','Resposta certa','Respostas','Acerto (%)'],...porP.map(x=>[x.p.t,(x.p.o||[])[x.p.c]||'',x.n,x.taxa==null?'':Math.round(x.taxa*100)])];
  download('Arena - '+j.nome+'.csv','﻿'+L.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');audit('Spruce It','Exportação de relatório',j.nome)}
function arAssociar(j,porA,t){if(!t)return toast('Escolha a turma','aviso');const lig=porA.filter(x=>x.al&&x.taxa!=null&&t.alunos.some(a=>a.id===x.al));if(!lig.length)return toast(j.turma?'Nenhum aluno da lista jogou.':'Ligue pelo menos uma alcunha a um aluno.','aviso');
  let i=j.assoc&&t.instrumentos.find(z=>z.id===j.assoc.inst);const hoje=new Date(j.criado).toISOString().slice(0,10);
  if(!i){i={id:uid(),nome:'Spruce It · '+j.nome,tipo:'Jogo Spruce It (formativo)',periodo:perAtual(t),data:hoje,itens:[{id:uid(),rot:'Acerto (%)',dom:'',cot:100}],notas:{},arena:j.id};t.instrumentos.push(i)}
  const it=i.itens[0].id;lig.forEach(x=>{i.notas[x.al]={[it]:Math.round(x.taxa*100)}});
  j.assoc={inst:i.id,turma:t.id,txt:t.nome+' · '+t.disciplina+' · '+lig.length+' alunos'};save();audit('Spruce It','Resultados associados à turma',j.nome+' · '+t.nome);toast('Resultados guardados em '+t.nome+' como instrumento formativo','ok');arRelatorio(j)}
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
/* ---------- v1.054 · estilos do aspeto novo (biblioteca em linhas, lançar em dois passos, ecrã projetado com temas) ---------- */
(()=>{const st=document.createElement('style');st.id='arena-css2';st.textContent=`
.arclist{display:flex;flex-direction:column;gap:10px}
.arcc.arrow{flex-direction:row;flex-wrap:wrap;align-items:center;gap:14px;padding:12px}
.arcapa{width:96px;height:64px;flex:none;border-radius:10px;background:var(--cc);color:#fff;display:grid;place-items:center;font:800 24px/1 system-ui,sans-serif;letter-spacing:.04em;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.14) 0 2px,transparent 2px 12px)}
.arcc.arrow .arcct{flex:1 1 240px;min-width:0}.arcc.arrow .arcct b{font-size:17px}.arcc.arrow .arcct .mut{font-size:13.5px}
.arcc.arrow .arcca{margin:0;flex-wrap:wrap}.arcc.arrow .arcca .btn:first-child{flex:none}
.arlan2 .arh2{margin:0 0 4px;font-size:22px}
.armgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:12px;padding-bottom:6px}
.armc{all:unset;box-sizing:border-box;cursor:pointer;border:2px solid var(--line,#dfe5eb);border-radius:14px;overflow:hidden;background:var(--panel,#fff);display:flex;flex-direction:column}
.armc[aria-pressed="true"]{outline:4px solid #f2b233;outline-offset:2px}.armc:focus-visible{outline:4px solid var(--acc,#127fa6);outline-offset:2px}
.armart{position:relative;min-height:128px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px 10px;text-align:center}
.armart b{font:800 19px/1.05 'Baloo 2',system-ui,sans-serif}.armart .es-formas{transform:scale(.8);margin:-6px 0}
.armnovo{position:absolute;top:8px;right:8px;font-style:normal;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;background:#fff;color:#1d2b24;border-radius:999px;padding:2px 8px}
.armft{padding:9px 12px 11px;display:flex;flex-direction:column}.armft b{font-size:13.5px}.armft small{color:var(--mut);font-size:12.5px}
.arbarra{position:sticky;bottom:-16px;margin:12px -16px -16px;padding:12px 16px;background:var(--panel,#fff);border-top:2px solid var(--line,#dfe5eb);display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:2}
.arbarra>div{flex:1 1 220px;min-width:0}.arbarra b{display:block;font:800 19px/1.1 'Baloo 2',system-ui,sans-serif}.arbarra small{color:var(--mut);font-size:13.5px}.arbarra .btn{min-height:46px;padding:0 22px;font-size:16px}
.arsala{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;align-items:start}
.arhero2{background:#1f6b4a;color:#fffaf0;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px}
.arhero2 h2{margin:0;font:800 clamp(24px,3vw,32px)/1.05 'Baloo 2',system-ui,sans-serif;color:inherit;text-wrap:balance}.arhero2 .areb{font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.arvolta{all:unset;cursor:pointer;font-weight:700;align-self:flex-start;min-height:32px}
.arabrir{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;margin-top:8px;background:#f2b233;color:#1d2b24;border-radius:14px;box-shadow:0 4px 0 #b8841c;font-weight:700;font-size:18px;padding:14px}.arabrir:active{transform:translateY(2px)}.arabrir[disabled]{opacity:.6;pointer-events:none}
.arcfg{display:flex;flex-direction:column;gap:14px}.arcfg label{margin:0 0 6px}
.arstep{display:flex;align-items:center;justify-content:space-between;gap:12px;border:2px solid var(--line,#dfe5eb);border-radius:12px;padding:8px 12px}
.arstep span{display:flex;align-items:center;gap:10px}.arstep button{all:unset;box-sizing:border-box;cursor:pointer;width:42px;height:42px;border:2px solid var(--line,#dfe5eb);border-radius:10px;display:grid;place-items:center;font-size:22px;font-weight:700}
.arstep output{min-width:62px;text-align:center;font:800 24px/1 'Baloo 2',system-ui,sans-serif}
.artemas button{display:inline-flex;align-items:center;gap:6px}.artemas i{width:14px;height:14px;border-radius:50%;border:3px solid;display:inline-block}
.areqc{display:inline-block;color:#fff;border-radius:6px;padding:1px 7px;font-size:12px;font-weight:700;margin:2px 0}
.arsws{border:2px solid var(--line,#dfe5eb);border-radius:12px;padding:2px 14px}
.arsw{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;min-height:48px;border-bottom:1px solid var(--line,#dfe5eb)}.arsw:last-child{border-bottom:0}
.arsw b{display:block;font-size:15px}.arsw small{display:block;color:var(--mut);font-size:13px}.arsw:focus-visible{outline:3px solid var(--acc,#127fa6)}
.arsw i{flex:none;width:52px;height:30px;border-radius:30px;background:var(--line,#d9cfb8);position:relative;transition:background .15s}.arsw i::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .15s}
.arsw[aria-checked="true"] i{background:var(--acc,#1f6b4a)}.arsw[aria-checked="true"] i::after{left:25px}
body.est-sge :is(.arcapa,.armc,.armnovo,.arbarra,.arhero2,.arabrir,.arstep,.arstep button,.artemas i,.areqc,.arsws,.arsw i,.arsw i::after){border-radius:0!important}
/* ecrã projetado: tokens do tema escolhido para o jogo */
#arhost.v2{background:var(--bg);color:var(--ink);font-family:Figtree,system-ui,sans-serif}
#arhost.v2 :is(.arhlogo,.arht b,h2,h3,.arhqt,.arhbig,.arhrel,.arhop b,.arpodc b,.arpodc i,.arhbr>b,.arhr>b,.arhr em,.arhbr em,.disp){font-family:var(--display),'Baloo 2',system-ui,sans-serif;font-weight:var(--dw);text-transform:var(--case);letter-spacing:var(--track)}
#arhost.v2 .arhlogo{font-size:22px;white-space:nowrap}#arhost.v2 .arhlogo em{font-style:normal;background:var(--accent);color:var(--on-accent);padding:0 8px;border-radius:var(--radius);margin-left:3px}
#arhost.v2 :is(.arht span,.arhsub,.arhqn,.arhload,.arhjd,.arhr small,.arhfa small,.arpodc span,.arhent p,.arhtop h3){color:var(--muted)}
#arhost.v2 .arhcod{background:var(--accent);color:var(--on-accent);border-radius:var(--radius);font-family:var(--display),'Baloo 2',sans-serif;font-weight:var(--dw)}
#arhost.v2 .arhb{background:var(--surface);color:var(--ink);border:var(--bw) solid var(--line);border-radius:var(--radius)}#arhost.v2 .arhb.dng{background:var(--a1);border-color:var(--a1);color:var(--on-a)}
#arhost.v2 .arhbtn{background:var(--surface)!important;color:var(--ink)!important;border:var(--bw) solid var(--line)!important;border-radius:var(--radius)!important;box-shadow:none!important;font-weight:700}
#arhost.v2 .arhbtn.pri{background:var(--primary)!important;border-color:var(--primary)!important;color:var(--on-primary)!important;box-shadow:var(--shadow)!important}
#arhost.v2 .arhgo{background:var(--accent)!important;border-color:var(--accent)!important;color:var(--on-accent)!important;box-shadow:var(--shadow-a)!important;font-size:22px;padding:0 44px}
#arhost.v2 .arhent{gap:clamp(18px,4vw,48px)}#arhost.v2 .arhqr{border-radius:var(--radius);border:var(--bw) solid var(--line)}
#arhost.v2 .arhcodb{display:flex;flex-direction:column;align-items:center;gap:12px}#arhost.v2 .arhent p{font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:clamp(14px,1.8vmin,18px)}#arhost.v2 .arhent p b{color:var(--ink);text-transform:none;letter-spacing:0}
#arhost.v2 .arhhero{background:var(--hero);color:var(--hero-ink);border:var(--bw) solid var(--hero-line);border-radius:calc(var(--radius)*1.3);padding:16px clamp(24px,6vw,64px);text-align:center}
#arhost.v2 .arhhero span{font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase}
#arhost.v2 .arhbig{color:inherit;text-shadow:none;letter-spacing:.08em;text-transform:none;font-size:clamp(56px,12vmin,120px)}
#arhost.v2 .arhlobb h3{font-size:clamp(22px,3vmin,30px)}
#arhost.v2 .arhp{background:var(--surface);color:var(--ink);border:var(--bw) solid var(--line);border-radius:var(--radius)}#arhost.v2 .arhp:hover{background:var(--a1);color:var(--on-a)}
#arhost.v2 .arhrel{background:var(--accent);color:var(--on-accent);border-radius:var(--radius)}#arhost.v2 .arhrel.pouco{color:var(--on-accent)}
#arhost.v2 .arhbarw{height:10px;border-radius:0;background:var(--line)}#arhost.v2 .arhbarw i{background:var(--primary);transition:width .25s linear}
#arhost.v2 .arhqt{color:var(--ink);background:var(--surface);border:var(--bw) solid var(--line);border-radius:calc(var(--radius)*1.3);padding:clamp(20px,4vmin,44px);text-transform:none;line-height:1.1}
#arhost.v2 .arhops{grid-template-columns:1fr 1fr;gap:14px}@media (max-width:700px){#arhost.v2 .arhops{grid-template-columns:1fr}}#arhost.v2 .arhqt,#arhost.v2 .arhop b{text-transform:none!important}
#arhost.v2 .arhop{background:var(--oc);color:var(--on-a);border-radius:var(--radius);box-shadow:none;min-height:96px;outline-offset:3px}#arhost.v2 .arhop b{font-size:clamp(20px,3vmin,30px);text-transform:none}#arhost.v2 .arhop i{background:currentColor;opacity:.6}
#arhost.v2 .rev .arhop.errada{opacity:.25}#arhost.v2 .rev .arhop.certa{box-shadow:none;outline:5px solid var(--ink)}
#arhost.v2 :is(.arhtop,.arhrank,.arhfa){background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius)}
#arhost.v2 .arhr>b,#arhost.v2 .arhbr>b{color:var(--primary)}
#arhost.v2 .arhbr{background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius)}#arhost.v2 .arhbt{background:var(--line)!important}#arhost.v2 .arhbt i{background:var(--primary)!important}
#arhost.v2 .arhbt:has(u){background:repeating-linear-gradient(90deg,var(--line) 0 22px,transparent 22px 44px)!important;border-right-color:var(--ink)}
#arhost.v2 .arhpausa{background:color-mix(in srgb,var(--bg) 85%,transparent);color:var(--ink);font-family:var(--display),sans-serif}
#arhost.v2 .arhfim h2{color:var(--ink);text-transform:var(--case)}#arhost.v2 .arheb{margin:0 0 6px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
#arhost.v2 .arpodc{background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius) var(--radius) 0 0}#arhost.v2 .arpodc.p1{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}#arhost.v2 .arpodc.p1 span{color:inherit}#arhost.v2 .arpodc i{color:var(--accent)}#arhost.v2 .arpodc.p1 i{color:inherit}
#arhost.v2 .arhn-2{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:18px;align-items:start}@media (max-width:820px){#arhost.v2 .arhn-2{grid-template-columns:1fr}}
#arhost.v2 .arhn-2 h3,#arhost.v2 .arhn-t{margin:0 0 8px;font-size:clamp(18px,2.4vmin,24px)}
#arhost.v2 .arhn-l{display:flex;flex-direction:column;gap:6px}#arhost.v2 .arhn-l .arhr{background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius);padding:6px 12px}
#arhost.v2 .arhmont{position:relative;height:min(56vh,520px);background:var(--surface);border:var(--bw) solid var(--line);border-radius:calc(var(--radius)*1.3);overflow:hidden}
#arhost.v2 .arhmont>svg{position:absolute;inset:0;width:100%;height:100%}#arhost.v2 .arhalp{position:absolute;transform:translate(-50%,-85%);display:flex;flex-direction:column;align-items:center;transition:left 1s cubic-bezier(.2,.8,.2,1),top 1s cubic-bezier(.2,.8,.2,1)}
#arhost.v2 .arhalp i{font-style:normal;font-size:12px;font-weight:700;background:var(--surface);color:var(--ink);border-radius:var(--radius);padding:0 6px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis}#arhost.v2 .arhflag{font-size:30px}
#arhost.v2 .arhn-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
#arhost.v2 .arhn-c{background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius);padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}#arhost.v2 .arhn-c b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#arhost.v2 .arhn-c.fora{opacity:.4;filter:grayscale(.7)}#arhost.v2 .arhagua{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:100%}#arhost.v2 .arhagua i{height:10px;border-radius:3px;background:var(--line)}#arhost.v2 .arhagua i.on{background:var(--a2)}#arhost.v2 .arhagua.perigo i.on{background:var(--a1)}
#arhost.v2 .arhexp{display:grid;grid-template-columns:28px 36px minmax(80px,180px) 1fr 70px;align-items:center}#arhost.v2 .arhmapa{display:flex;gap:4px;align-items:center}#arhost.v2 .arhmapa i{flex:1;height:10px;border-radius:5px;background:var(--line)}#arhost.v2 .arhmapa i.on{background:var(--primary)}#arhost.v2 .arhmapa u{width:16px;height:16px;transform:rotate(45deg);background:var(--line);flex:none}#arhost.v2 .arhmapa u.on{background:var(--accent)}
#arhost.v2 .arhduelos{display:flex;flex-direction:column;gap:10px}#arhost.v2 .arhduelo{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--radius);padding:10px}
#arhost.v2 .arhduelo span{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0}#arhost.v2 .arhduelo b{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#arhost.v2 .arhduelo small{color:var(--muted)}#arhost.v2 .arhduelo>i{font-style:normal;font-family:var(--display),sans-serif;font-weight:var(--dw);font-size:30px;color:var(--a4)}
#arhost.v2 .arhn-eqs{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
#arhost.v2 .arhn-eq{background:var(--surface);border:var(--bw) solid var(--line);border-top:8px solid var(--ec);border-radius:var(--radius);padding:12px 14px;display:flex;flex-direction:column;gap:10px}
#arhost.v2 .arhn-eqh{display:flex;justify-content:space-between;align-items:baseline;gap:10px}#arhost.v2 .arhn-eqh b{font-size:20px;color:var(--ec)}#arhost.v2 .arhn-eqh .disp{font-size:clamp(26px,4vmin,40px)}
#arhost.v2 .arhn-pista{position:relative;height:14px;border-radius:7px;background:var(--line)}#arhost.v2 .arhn-pista i{display:block;height:100%;border-radius:7px;background:var(--ec);transition:width .8s}#arhost.v2 .arhn-pista u{position:absolute;top:50%;transform:translate(-50%,-55%);text-decoration:none;font-size:24px;transition:left .8s}
#arhost.v2 .arhn-mb{display:flex;flex-wrap:wrap;gap:6px}#arhost.v2 .arhn-mb span{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;background:var(--bg);border-radius:var(--radius);padding:2px 8px 2px 2px}#arhost.v2 .arhn-mb span.vez{background:var(--ec);color:#fff}
#arhost.v2 .arhn-eqf{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0 0 18px}#arhost.v2 .arhn-eqf div{display:flex;align-items:center;gap:10px;background:var(--surface);border:var(--bw) solid var(--line);border-left:8px solid var(--ec);border-radius:var(--radius);padding:8px 14px}#arhost.v2 .arhn-eqf div:first-child{background:var(--ec);color:#fff}#arhost.v2 .arhn-eqf i{font-style:normal;font-weight:800}
`;document.head.appendChild(st)})();
/* ---------- v1.054 · Spruce It: módulo especial que abre sem o menu lateral (com botão para voltar à EduSpruce) ---------- */
TITLES.arena='Spruce It';try{MN_NOME.arena='Spruce It'}catch(_){}
function spVoltar(){document.body.classList.remove('spruceit');go(go._f&&go._f.hub?'hub':'inicio')}
{const _gSp=go;go=function(v){const r=_gSp.apply(this,arguments);try{document.body.classList.toggle('spruceit',VIEW==='arena')}catch(_){}return r};Object.assign(go,_gSp);if(_gSp._f)go._f=_gSp._f}
{const _vSp=vArena;vArena=function(){const r=_vSp.apply(this,arguments);try{arFontes();document.body.classList.add('spruceit');const h=$('#view .arhead');if(h&&!h.querySelector('.spvolta')){const b=document.createElement('button');b.type='button';b.className='btn spvolta';b.innerHTML='← Voltar à EduSpruce';b.title='Voltar ao menu e às outras ferramentas';b.onclick=spVoltar;h.prepend(b)}}catch(_){}return r}}
(()=>{const st=document.createElement('style');st.id='arena-css3';st.textContent=`
html body.spruceit #side,html body.spruceit #railTgl{display:none!important}
html body.spruceit #main{margin-left:0!important;width:100%!important;max-width:none!important}
html body.spruceit .spvolta{margin:0;font-weight:700;min-height:38px}
html body .spv{max-width:1080px;margin:0 auto}
html body .spv .sph{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px;background:var(--panel,#fff);border:1px solid var(--line,#dfe5eb);border-radius:18px;padding:12px 18px;margin:0 0 26px}
html body .spv .sph-logo{font:800 26px/1.1 'Baloo 2',system-ui,sans-serif;white-space:nowrap}html body .spv .sph-logo em{font-style:normal;background:var(--acc,#127fa6);color:#fff;padding:0 9px;border-radius:12px;margin-left:4px}
html body .spv .sph-tabs{display:flex;flex-wrap:wrap;gap:4px}html body .spv .sph-tabs button{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 16px;border-radius:999px;font-weight:700;color:var(--mut)}
html body .spv .sph-tabs button:hover{color:inherit;background:color-mix(in srgb,var(--acc,#127fa6) 8%,transparent)}html body .spv .sph-tabs button[aria-current="page"]{background:var(--acc,#127fa6);color:#fff}html body .spv .sph-tabs button:focus-visible{outline:3px solid var(--acc,#127fa6);outline-offset:2px}
html body .spv .sph-info{margin-left:auto;color:var(--mut);font-size:13.5px}
html body .spv .sph-tit{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 12px}html body .spv .sph-tit h1{margin:0 auto 0 0;font:800 clamp(32px,4.4vw,48px)/1 'Baloo 2',system-ui,sans-serif;letter-spacing:0}
html body .spv .sph-tit input{flex:1 1 200px;max-width:300px;min-height:46px;border-radius:14px}
html body .spv .sph-novo{min-height:46px;padding:0 20px;border-radius:14px;font-weight:700;background:var(--acc,#127fa6)!important;color:#fff!important;border-color:var(--acc,#127fa6)!important;box-shadow:0 4px 0 color-mix(in srgb,var(--acc,#127fa6) 65%,#000)}html body .spv .sph-novo:active{transform:translateY(2px);box-shadow:0 2px 0 color-mix(in srgb,var(--acc,#127fa6) 65%,#000)}
html body .spv .sph-fl{gap:8px;margin:0 0 18px;align-items:center}html body .spv .sph-fl select{flex:0 1 240px;width:auto;min-height:40px;border-radius:12px}html body .spv .sph-n{margin-left:auto;font-size:14px}
html body .spv .arpasta{margin:22px 2px 10px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
html body .spv .arclist{gap:14px}
html body .spv .arcc.arrow{border-radius:18px;padding:14px;gap:16px;border:1px solid var(--line,#dfe5eb);transition:border-color .15s,box-shadow .15s}html body .spv .arcc.arrow:hover{border-color:var(--acc,#127fa6);box-shadow:0 4px 18px color-mix(in srgb,var(--acc,#127fa6) 14%,transparent)}
html body .spv .arcapa{width:120px;height:80px;border-radius:12px;font:800 28px/1 'Baloo 2',system-ui,sans-serif}
html body .spv .arcc.arrow .arcct b{font:800 22px/1.15 'Baloo 2',system-ui,sans-serif}html body .spv .arcc.arrow .arcct .mut{font-size:14.5px;margin-top:3px;display:block}
html body .spv .arcca .btn{min-height:42px;border-radius:12px;font-weight:700}html body .spv .arcca .btn.pri{box-shadow:0 4px 0 color-mix(in srgb,var(--acc,#127fa6) 65%,#000)}html body .spv .arcca .btn.pri:active{transform:translateY(2px)}
html body .spv #ar-jogos{border-radius:18px}
html body.est-sge .spv :is(.sph,.sph-logo em,.sph-tabs button,.sph-tit input,.sph-novo,.sph-fl select,.arcc.arrow,.arcapa,.arcca .btn,#ar-jogos){border-radius:0!important}
`;document.head.appendChild(st)})();
