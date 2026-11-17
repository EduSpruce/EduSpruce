/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name.replace(/[\/\\:*?"<>|]/g,'-');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
const fmtD=iso=>{if(!iso)return'';const p=iso.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:iso};
const nf=(v,d=1)=>v==null||v===''?'':(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toString().replace('.',',');
const domById=(t,id)=>t.dominios.find(d=>d.id===id);
const oa=a=>a.genero==='F'?'a':'o';
const aluno_a=a=>a.genero==='F'?'aluna':'aluno';
function csv(rows){return '﻿'+rows.map(r=>r.map(c=>{c=c==null?'':String(c);return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')).join('\n')}
/* género automático pelo primeiro nome (pode ser alterado à mão) */
const FEM=new Set('inês ines beatriz raquel isabel isabelle isabele carmen lurdes lourdes mercedes ruth rute ester esther abigail leonor matilde alice clarice clarisse íris iris irene simone yasmin yasmine jasmim jasmin noémi noemi luz liz rosário rosario conceição conceicao assunção assuncao graça graca dulce denise beatrice yolanda yolande sol miriam míriam ingrid zoé zoe chloe chloé charlotte nicole michelle michele jéssica jessica mel mercês merces glória gloria nazaré nazare aline eliane elaine gabrielle tainá taina raissa celeste arlete bernadete odete ivone liliane margarete elisabete elizabete lisete susete salomé salome taís tais thaís thais tatiane cristiane daniele danielle emily emilly kelly kimberly lauren lily lorraine madeleine nadine nathalie natalie noelle sharon valerie vivian vivianne yasmim hellen helen kathleen caroline carolyne jennifer jenifer grace joyce janice anne annie marie maryline evelyn evelin ellen allison alison camille juliet juliette rachel raquel ariane josiane rosane viviane iolanda mafalda inez esperança esperanca deise daise'.split(' '));
const MASC_A=new Set('luca lucca joshua nikita elia batista garcia andrea jonatha mattia noah juda judas josua sacha sasha akira kosta moussa aliyah'.split(' '));
const MASC=new Set('noa'.split(' '));
function guessGen(n){const f=((n||'').trim().split(/\s+/)[0]||'').toLowerCase().replace(/[^\p{L}]/gu,'');if(!f)return 'M';if(FEM.has(f))return 'F';if(MASC_A.has(f)||MASC.has(f))return 'M';return /a$/.test(f)?'F':'M'}
function setNome(a,nome){a.nome=nome;if(!a.generoManual)a.genero=guessGen(nome)}
function titleCase(s){const low=['de','da','do','das','dos','e'];return s.toLowerCase().split(/\s+/).map((w,i)=>i&&low.includes(w)?w:w.replace(/(^|[-'])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase())).join(' ')}
function idade(n){if(!n)return'';const d=new Date(n);if(isNaN(d))return'';return Math.floor((Date.now()-d)/31557600000)}
function openDrawer(title,html){const d=$('#drawer');if(!d.classList.contains('on'))openDrawer.ret=document.activeElement;$('#dw-t').textContent=title;$('#dw-b').innerHTML=html;d.classList.add('on');document.body.classList.add('dw-on');d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','dw-t');setTimeout(()=>{if(!d.contains(document.activeElement)){const f=d.querySelector('.dwb input:not([type=hidden]),.dwb select,.dwb textarea,.dwb button');(f||$('#dw-x')).focus({preventScroll:true})}},60)}
function closeDrawer(){const d=$('#drawer');if(!d.classList.contains('on'))return;d.classList.remove('on');document.body.classList.remove('dw-on');const r=openDrawer.ret;openDrawer.ret=null;if(r&&document.contains(r)&&r.focus)try{r.focus({preventScroll:true})}catch(_){}}
$('#dw-x').onclick=closeDrawer;
function novoAluno(t,nome){const n=Math.max(0,...t.alunos.map(a=>+a.num||0))+1;return {id:uid(),num:n,processo:'',nome:nome||'',genero:guessGen(nome),nasc:'',frequenta:true,repetente:false,ase:'',eeNome:'',eeContacto:'',email:'',obs:'',medidas:{univ:[],selet:[],adic:[]},acomod:[],autoav:{},obsPer:{}}}
function mkDominios(tpl){return (MODELOS[tpl]||MODELOS.gen).map(([ab,nome,peso],k)=>({id:uid()+k,ab,nome,peso}))}
const discInfo=n=>DISCIPLINAS.find(d=>d.n===n);

/* ---------- ícone do ano de escolaridade (10, 11, 12…) ---------- */
function anoNum(t){const n=parseInt(t&&t.anoEsc);return isNaN(n)?(/pr[eé]/i.test((t&&t.anoEsc)||'')?'PE':'?'):String(n)}
/* v1.029 · ícone do curso no distintivo da turma (profissional/PROFIJ ou turma com curso): escolhido pelo nome do curso */
const CURSO_IC=[[/logist|armazem|transport|aprovision/,'cTruck'],[/informat|programa|redes|multimedia|computad|sistemas|digital|web|jogos/,'cMonitor'],[/turism|viagens|aviac|guia/,'cPlane'],[/cozinha|pastelar|restaura|culinar|padar/,'cChef'],[/mesa|bar\b|barist|bebidas/,'cCoffee'],[/eletric|eletron|eletrot|automac|energ|renovav|instalac/,'cZap'],[/mecan|mecatron|automove|manutenc|serralh|soldad|metalom|maquin/,'cWrench'],[/comerc|vendas|marketing|retalho|loja/,'cCart'],[/contabil|gestao|secretar|administrat|financ|banca|seguros|escritorio/,'cBrief'],[/agric|agro|jardin|florest|ambiente|pecuar|horti|vitivin|pescas|aquacult/,'cLeaf'],[/cabeleir|estetic|barbear|beleza/,'cScissors'],[/constru|civil|carpint|marcen|obras|madeira/,'cHammer'],[/fotograf|audiovis|video|cinema|comunicac/,'cCamera'],[/design|artes|grafic|moda|costura|ceramic/,'palette'],[/saude|enfermag|farmac|geriatr|auxiliar de/,'heart'],[/desport|exercic|fitness/,'run'],[/infancia|apoio|social|animac|psicossoc/,'users'],[/som|music|espetac/,'mic'],[/laborat|quimic|analis/,'flask']];
function cursoIc(t){try{if(!t)return '';if(t.icone!==undefined)return t.icone;const o=ofertaDe(t);const cur=(t.curso||'')+' '+((t.cnq&&t.cnq.nome)||'');if(!cur.trim()&&o!=='profissional'&&o!=='profij')return '';const s=normT(cur+' '+(o==='profissional'||o==='profij'?t.nome||'':''));for(const [r,i] of CURSO_IC)if(r.test(s))return i;return ''}catch(_){return ''}}
const anoBadge=(t,cls)=>{if(!t)return '';const bc=badgeCod(t),ci=bc?'':cursoIc(t);return `<span class="anob c-${ofertaDe(t)==='profij'?'profij':t.ciclo||'sec'} ${cls||''} ${bc?'cod'+(bc.length>3?' l'+Math.min(bc.length,6):''):''} ${ci?'cic':''}" style="--bc:${t.id?corTurma(t.id):''}" title="${esc(bc?'Código '+bc+' · '+(t.anoEsc||''):[t.anoEsc||'',ci?(t.curso||(t.cnq&&t.cnq.nome)||''):''].filter(Boolean).join(' · '))}">${bc?esc(bc):ci?ic(ci,16)+(ofertaDe(t)==='profij'?'':`<i class="anoy">${anoNum(t)}</i>`):anoNum(t)}</span>`};
/* ---------- oferta formativa: Ensino Regular / PROFIJ (separação transversal) ---------- */
const OFERTAS={regular:{nome:'Ensino Regular',cor:'#2f7fd0'},profij:{nome:'PROFIJ',cor:'#1a7f37'}};
const ofertaDe=t=>t&&t.oferta&&OFERTAS[t.oferta]?t.oferta:'regular';
const ofertaTag=t=>ofertaDe(t)==='profij'?' <span class="tag of-p">PROFIJ</span>':'';
const turmasFiltradas=a=>(a?a.turmas:[]).filter(t=>(!S.filtroOferta||ofertaDe(t)===S.filtroOferta)&&escId(escolaDe(t))===escAtiva());
function gruposOferta(L){return ['regular','profij'].map(k=>({k,nome:OFERTAS[k].nome,L:L.filter(t=>ofertaDe(t)===k)})).filter(g=>g.L.length)}
const segOferta=(id,cur,tipo)=>`<div class="seg" id="${id}">${Object.entries(OFERTAS).filter(([k])=>!tipo||TIPOS_ESCOLA[tipo].ofertas.includes(k)).map(([k,o])=>`<button type="button" data-of="${k}" class="${(cur||'regular')===k?'on':''}">${ic(k==='profij'?'award':k==='profissional'?'layers':'school',15)} ${o.nome}</button>`).join('')}</div>`;
function bindSegOferta(id,cb){$$('#'+id+' [data-of]').forEach(b=>b.onclick=()=>{$$('#'+id+' [data-of]').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.of)})}
function renderFiltroOferta(){const el=$('#ofsel');if(!el)return;const TT=(A()||{turmas:[]}).turmas.filter(t=>escId(escolaDe(t))===escAtiva());const ofs=[...new Set(TT.map(ofertaDe))];const has=ofs.length>1;const ES=todasEscolas();const hasE=false;
  if(S.filtroEscola&&!ES.some(e=>escId(e)===S.filtroEscola))S.filtroEscola='';
  el.innerHTML=(hasE?`<select class="escsel" id="fo-esc" aria-label="Escola"><option value="">Todas as escolas</option>${ES.map(e=>`<option value="${escId(e)}" ${S.filtroEscola===escId(e)?'selected':''}>${esc(nomeEscola(e))}</option>`).join('')}</select>`:'')+(has||S.filtroOferta?`<div class="seg mini">${[['','Todas'],...['regular','profij','profissional'].filter(k=>ofs.includes(k)||S.filtroOferta===k).map(k=>[k,k==='regular'?'Regular':k==='profij'?'PROFIJ':'Profissional'])].map(([k,l])=>`<button data-fo="${k}" class="${(S.filtroOferta||'')===k?'on':''}">${l}</button>`).join('')}</div>`:'');
  el.style.display=has||S.filtroOferta||hasE?'':'none';const fe=$('#fo-esc');if(fe)fe.onchange=()=>{S.filtroEscola=fe.value;const t=T();if(t&&S.filtroEscola&&escId(escolaDe(t))!==S.filtroEscola)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)};
  $$('#ofsel [data-fo]').forEach(b=>b.onclick=()=>{S.filtroOferta=b.dataset.fo;const t=T();if(t&&S.filtroOferta&&ofertaDe(t)!==S.filtroOferta)S.turmaAtiva=null;save();go(NEEDS_T.includes(VIEW)&&!T()?'turmas':VIEW)})}

