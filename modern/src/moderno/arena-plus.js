/* ===================== 1.178 · Spruce It! completo (professor) =====================
   · 13 tipos de pergunta: escolha múltipla (até 6 opções, com imagens), verdadeiro/falso, várias certas, resposta escrita,
     deslizante, ordenar, pino na imagem, sondagem, escala de opinião (concordância, 0–10, estrelas), nuvem de palavras,
     resposta aberta, ideias com votação e diapositivo; vídeo na pergunta, pontos a dobrar / sem pontos, notas do orador
   · importar diapositivos (PDF e PowerPoint) e extrair perguntas de um texto, PDF ou Word, sem IA
   · ecrã projetado: resultados de cada tipo, modo aula, modo precisão, modo confiança, reações, perguntas do público com
     votos e moderação, vista do orador, música do átrio, marca própria (logótipo e cores), limite de jogadores até 2000
   · modo Estudo (cartões, aprender, pares, teste), relatórios com o conteúdo das respostas, Excel, torneio e certificados
   Tudo criado de raiz: nomes, desenhos, música e textos. Servidor: supabase/migrations/0021_spruceit_completo.sql. */

arTempos.push(180,240);
arFormas.push('E','F');arCores.push('#7c3aed','#65a30d');
const SP3_COR=['var(--a1)','var(--a2)','var(--a3)','var(--a4)','var(--a5,#7c3aed)','var(--a6,#65a30d)'];
const sp3Txt=x=>String(x==null?'':x).trim();
const sp3Dec=v=>(+v).toLocaleString('pt-PT',{maximumFractionDigits:2});
const sp3Foto=k=>k&&FOTOS[k]?FOTOS[k]:'';
function sp3PorFoto(u){const k='ar-'+uid();FOTOS[k]=u;try{idbPor(k,u)}catch(_){}return k}
function sp3Ok(p){const tp=p.tp||'mc';const ops=()=>(p.o||[]).map((x,i)=>sp3Txt(x)||sp3Foto((p.oi||[])[i]));
  if(tp!=='slide'&&!sp3Txt(p.t))return false;
  switch(tp){
    case 'mc':{const o=ops();return o.filter(Boolean).length>=2&&!!o[p.c|0]}
    case 'vf':return true;
    case 'multi':{const o=ops();return o.filter(Boolean).length>=2&&(p.cs||[]).length>=1&&(p.cs||[]).every(k=>o[k])}
    case 'sond':return ops().filter(Boolean).length>=2;
    case 'rc':return (p.a||[]).some(x=>sp3Txt(x));
    case 'slider':{const a=+p.min,b=+p.max,v=+p.v;return isFinite(a)&&isFinite(b)&&b>a&&isFinite(v)&&v>=a&&v<=b}
    case 'ordem':return (p.it||[]).filter(x=>sp3Txt(x)).length>=2;
    case 'pino':return !!sp3Foto(p.img)&&!!p.zona;
    case 'slide':return !!(sp3Txt(p.t)||sp3Txt(p.tx)||sp3Foto(p.img));
    default:return true}}
function sp3Init(p,tp){const was=p.tp||'mc';p.tp=tp;const quatro=()=>{if(!Array.isArray(p.o)||p.o.length<2||was==='vf')p.o=Array.isArray(p._o)?p._o:['','','',''];delete p._o};
  if(tp==='vf'){if(was!=='vf')p._o=p.o;p.o=['Verdadeiro','Falso'];if((p.c|0)>1)p.c=0;delete p.oi}
  else if(['mc','multi','sond'].includes(tp)){quatro();if(tp==='multi')p.cs=Array.isArray(p.cs)?p.cs:[p.c|0]}
  else if(tp==='rc'){p.a=Array.isArray(p.a)&&p.a.length?p.a:[(p.o||[])[p.c|0]||'']}
  else if(tp==='slider'){if(p.min==null)Object.assign(p,{min:0,max:100,step:1,v:50,tol:0,un:''})}
  else if(tp==='ordem'){p.it=Array.isArray(p.it)&&p.it.length?p.it:((p.o||[]).filter(x=>sp3Txt(x)).length>=2?p.o.slice():['','','',''])}
  else if(tp==='pino'){p.zona=p.zona||{x:.5,y:.5,r:.1}}
  else if(tp==='escala'){p.esc=p.esc||'likert'}
  else if(tp==='slide'){p.lay=p.lay||'classico';p.tx=p.tx||'';p.s=p.s||20}
  if(!Array.isArray(p.o))p.o=['','','',''];if(p.c==null)p.c=0}

/* ---------- editor ---------- */
function sp3OpsHtml(p,i){const tp=p.tp||'mc';const vf=tp==='vf';const o=vf?['Verdadeiro','Falso']:p.o;const multi=tp==='multi',sond=tp==='sond';
  return `<div class="sp3ops">${o.map((x,k)=>{const im=sp3Foto((p.oi||[])[k]);const on=multi?(p.cs||[]).includes(k):p.c===k;
    return `<label class="arop sp3op" style="--oc:${arCores[k]}">${sond?'':`<input type="${multi?'checkbox':'radio'}" name="sq${i}" data-sc="${k}" ${on?'checked':''} aria-label="Resposta certa">`}<span class="arof">${arFormas[k]}</span>${vf?`<b>${esc(x)}</b>`:`<input data-so="${k}" value="${esc(x)}" placeholder="Opção ${k+1}${k>1?' (opcional)':''}">`}
      ${vf?'':im?`<span class="sp3oth"><img src="${esc(im)}" alt=""><button type="button" class="btn sm ico dng" data-soix="${k}" aria-label="Tirar imagem">${ic('x',11)}</button></span>`:`<button type="button" class="btn sm ico" data-soi="${k}" aria-label="Imagem na opção ${k+1}" title="Imagem como resposta">${ic('image',13)}</button>`}</label>`}).join('')}</div>
    ${vf?'':`<div class="row sp3mini">${o.length<6?`<button type="button" class="btn sm" data-sadd>${ic('plus',12)} Opção</button>`:''}${o.length>2?`<button type="button" class="btn sm" data-srem>− Opção</button>`:''}</div>`}`}
function sp3CorpoEd(p,i){const tp=p.tp||'mc';
  if(AR.tpOps(tp))return sp3OpsHtml(p,i);
  if(tp==='rc')return `<div class="sp3lst">${p.a.map((x,k)=>`<div class="row"><span class="sp3tag">${k?'Também aceite':'Resposta certa'}</span><input data-sa="${k}" value="${esc(x)}" maxlength="40" placeholder="ex.: Lisboa">${k?`<button type="button" class="btn sm ico" data-sax="${k}" aria-label="Tirar">${ic('x',12)}</button>`:''}</div>`).join('')}
    ${p.a.length<6?`<button type="button" class="btn sm" data-saadd>${ic('plus',12)} Outra forma aceite</button>`:''}</div>`;
  if(tp==='slider')return `<div class="sp3grid"><label>Mínimo<input type="number" data-sn="min" value="${esc(p.min)}"></label><label>Máximo<input type="number" data-sn="max" value="${esc(p.max)}"></label><label>Passo<input type="number" data-sn="step" min="0" value="${esc(p.step)}"></label><label>Resposta certa<input type="number" data-sn="v" value="${esc(p.v)}"></label><label>Margem (±)<input type="number" data-sn="tol" min="0" value="${esc(p.tol)}"></label><label>Unidade<input data-sn="un" value="${esc(p.un||'')}" maxlength="12" placeholder="ex.: km"></label></div>`;
  if(tp==='ordem')return `<div class="sp3lst">${p.it.map((x,k)=>`<div class="row"><b class="sp3n">${k+1}</b><input data-si="${k}" value="${esc(x)}" maxlength="60" placeholder="Elemento ${k+1}">${p.it.length>2?`<button type="button" class="btn sm ico" data-six="${k}" aria-label="Tirar">${ic('x',12)}</button>`:''}</div>`).join('')}${p.it.length<6?`<button type="button" class="btn sm" data-siadd>${ic('plus',12)} Elemento</button>`:''}<p class="hint">Escreva pela ordem certa — os alunos recebem-nos baralhados.</p></div>`;
  if(tp==='pino'){const im=sp3Foto(p.img);const z=p.zona||{x:.5,y:.5,r:.1};return im?`<div class="sp3pino" data-spino><img src="${esc(im)}" alt=""><i style="left:${z.x*100}%;top:${z.y*100}%;width:${z.r*200}%;"></i></div><label class="row" style="gap:8px">Tamanho da zona certa<input type="range" min="0.02" max="0.4" step="0.01" data-szr value="${z.r}"></label><p class="hint">Toque na imagem para marcar o centro da zona certa.</p>`:`<p class="hint">Junte a imagem da pergunta (botão «Imagem») e depois marque onde fica a zona certa.</p>`}
  if(tp==='escala')return `<label>Tipo de escala<select data-sesc><option value="likert" ${p.esc==='likert'?'selected':''}>Concordância (5 níveis)</option><option value="nps" ${p.esc==='nps'?'selected':''}>0 a 10 (recomendação)</option><option value="estrelas" ${p.esc==='estrelas'?'selected':''}>Estrelas (1 a 5)</option></select></label><p class="hint">Sem resposta certa: o ecrã mostra a distribuição e a média.</p>`;
  if(tp==='slide')return `<label>Esquema<select data-slay>${[['classico','Título, texto e imagem'],['titulo','Só título (abertura)'],['imagem','Imagem em ecrã inteiro']].map(([k,n])=>`<option value="${k}" ${p.lay===k?'selected':''}>${n}</option>`).join('')}</select></label><textarea data-stx rows="4" maxlength="1500" placeholder="Texto do diapositivo (opcional)">${esc(p.tx||'')}</textarea>`;
  return `<p class="hint">${{nuvem:'Cada aluno escreve uma palavra ou expressão curta; o ecrã junta as respostas numa nuvem — as mais repetidas ficam maiores.',aberta:'Cada aluno escreve uma resposta (até 250 carateres); o ecrã mostra-as em mural.',ideias:'Cada aluno propõe até 3 ideias; depois pode abrir a votação e cada um vota em 3 ideias dos colegas.'}[tp]||''}</p>`}
function sp3ExtrasEd(p){const tp=p.tp||'mc';const g=AR.tpGrad(tp);
  return `<div class="row sp3ext">${g?`<label class="sp3inl">Pontos <select data-spm><option value="1" ${p.pm==null||+p.pm===1?'selected':''}>Normais</option><option value="2" ${+p.pm===2?'selected':''}>A dobrar</option><option value="0" ${p.pm!=null&&+p.pm===0?'selected':''}>Sem pontos</option></select></label>`:''}
    <button type="button" class="btn sm" data-svid>${ic('cMonitor',13)} ${p.vid&&p.vid.id?'Vídeo ✓':'Vídeo'}</button>${p.vid&&p.vid.id?`<button type="button" class="btn sm ico dng" data-svidx aria-label="Tirar vídeo">${ic('x',12)}</button>`:''}
    <details class="sp3notas" ${sp3Txt(p.notas)?'open':''}><summary>Notas do orador</summary><textarea data-snt rows="2" maxlength="2000" placeholder="Só aparecem na vista do orador">${esc(p.notas||'')}</textarea></details></div>`}

const _sp3Ed=arEditor;
arEditor=function(c){const r=_sp3Ed.apply(this,arguments);try{sp3Editor(c)}catch(e){console.warn(e)}return r};
function sp3Editor(c){const toque=()=>{c.mod=Date.now();save()};const re=()=>{const y=window.scrollY,v=$('#view').scrollTop;arEditor(c);window.scrollTo(0,y);$('#view').scrollTop=v};
  let fi=$('#sp3-f');if(!fi){fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.hidden=true;fi.id='sp3-f';$('#view .arednv').appendChild(fi)}
  let alvo=null;fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f||!alvo)return;try{const u=await arReduzir(f);alvo(sp3PorFoto(u));toque();re()}catch(e){toast('Não foi possível usar a imagem: '+e.message,'erro')}};
  $$('#view [data-q]').forEach(sec=>{const i=+sec.dataset.q;const p=c.perg[i];if(!p)return;if(!p.tp)p.tp='mc';
    const sel=sec.querySelector('[data-qtp]');sel.innerHTML=Object.entries(AR.TIPOS).map(([k,t])=>`<option value="${k}" ${p.tp===k?'selected':''}>${t.ic} ${t.n}</option>`).join('');
    sel.onchange=e=>{sp3Init(p,e.target.value);toque();re()};
    const q=sec.querySelector('[data-qs]');if(q&&p.tp==='slide'&&!q.querySelector('option[value="0"]')){q.insertAdjacentHTML('afterbegin',`<option value="0" ${+p.s===0?'selected':''}>Sem tempo</option>`)}
    const box=sec.querySelector('.arqo');box.classList.add('sp3qo');box.innerHTML=sp3CorpoEd(p,i);
    const hint=sec.querySelector('.arqhint');if(hint)hint.textContent=({mc:'Marque a bolinha da resposta certa. Pode usar imagens como respostas.',vf:'Marque a resposta certa.',multi:'Marque todas as respostas certas — só conta se o aluno escolher exatamente essas.',sond:'Sem resposta certa: o ecrã mostra quantos escolheram cada opção.'})[p.tp]||'';
    sec.querySelector('.arqb').insertAdjacentHTML('afterend',sp3ExtrasEd(p));
    const val=()=>sec.classList.toggle('arq-inc',!sp3Ok(p));val();
    const on=(s,ev,f)=>sec.querySelectorAll(s).forEach(x=>x[ev]=e=>f(x,e));
    on('[data-so]','oninput',x=>{p.o[+x.dataset.so]=x.value;toque();val()});
    on('[data-sc]','onchange',x=>{const k=+x.dataset.sc;if(p.tp==='multi'){p.cs=[...sec.querySelectorAll('[data-sc]')].filter(z=>z.checked).map(z=>+z.dataset.sc)}else p.c=k;toque();val()});
    on('[data-soi]','onclick',x=>{const k=+x.dataset.soi;alvo=key=>{p.oi=p.oi||[];if(p.oi[k])delete FOTOS[p.oi[k]];p.oi[k]=key};fi.click()});
    on('[data-soix]','onclick',x=>{const k=+x.dataset.soix;if(p.oi&&p.oi[k]){delete FOTOS[p.oi[k]];p.oi[k]=null}toque();re()});
    on('[data-sadd]','onclick',()=>{p.o.push('');toque();re()});
    on('[data-srem]','onclick',()=>{const n=p.o.length-1;p.o.length=n;if(p.oi)p.oi.length=Math.min(p.oi.length,n);if((p.c|0)>=n)p.c=0;if(p.cs)p.cs=p.cs.filter(k=>k<n);toque();re()});
    on('[data-sa]','oninput',x=>{p.a[+x.dataset.sa]=x.value;toque();val()});
    on('[data-sax]','onclick',x=>{p.a.splice(+x.dataset.sax,1);toque();re()});on('[data-saadd]','onclick',()=>{p.a.push('');toque();re()});
    on('[data-sn]','oninput',x=>{const k=x.dataset.sn;p[k]=k==='un'?x.value:x.value===''?'':+x.value;toque();val()});
    on('[data-si]','oninput',x=>{p.it[+x.dataset.si]=x.value;toque();val()});
    on('[data-six]','onclick',x=>{p.it.splice(+x.dataset.six,1);toque();re()});on('[data-siadd]','onclick',()=>{p.it.push('');toque();re()});
    on('[data-spino]','onclick',(x,e)=>{const r=x.getBoundingClientRect();p.zona=Object.assign({},p.zona||{r:.1},{x:Math.round(1000*(e.clientX-r.left)/r.width)/1000,y:Math.round(1000*(e.clientY-r.top)/r.height)/1000});toque();re()});
    on('[data-szr]','oninput',x=>{p.zona=Object.assign({x:.5,y:.5},p.zona||{},{r:+x.value});const z=sec.querySelector('[data-spino] i');if(z)z.style.width=(p.zona.r*200)+'%';toque()});
    on('[data-sesc]','onchange',x=>{p.esc=x.value;toque()});on('[data-slay]','onchange',x=>{p.lay=x.value;toque()});on('[data-stx]','oninput',x=>{p.tx=x.value;toque();val()});
    on('[data-spm]','onchange',x=>{p.pm=+x.value;toque()});on('[data-snt]','oninput',x=>{p.notas=x.value;toque()});
    on('[data-svid]','onclick',()=>{const u=prompt('Ligação do vídeo do YouTube (pode indicar o início e o fim em segundos a seguir, separados por espaços):',p.vid&&p.vid.id?'https://youtu.be/'+p.vid.id+' '+(p.vid.ini||0)+' '+(p.vid.fim||''):'');if(u==null)return;const [l,a,b]=u.trim().split(/\s+/);const id=AR.yt(l);if(!id)return toast('Não reconheci a ligação do vídeo.','aviso');p.vid={id,ini:+a||0,fim:+b||0};toque();re()});
    on('[data-svidx]','onclick',()=>{delete p.vid;toque();re()})});
  /* botões no fim: mais tipos, importar diapositivos, extrair perguntas */
  const bar=$('#are-add')&&$('#are-add').parentElement;if(bar&&!bar.querySelector('#sp3-mais')){
    bar.querySelector('#are-add').insertAdjacentHTML('afterend',`<div class="sp3menu"><button class="btn" id="sp3-mais" aria-haspopup="true">${ic('plus',15)} Outro tipo ▾</button><div class="sp3pop" hidden>${Object.entries(AR.TIPOS).map(([k,t])=>`<button type="button" data-snovo="${k}">${t.ic} ${t.n}</button>`).join('')}</div></div>
      <button class="btn" id="sp3-imp">${ic('upload',15)} Diapositivos</button><button class="btn" id="sp3-ext">${ic('list',15)} Extrair perguntas</button>`);
    const pop=bar.querySelector('.sp3pop');bar.querySelector('#sp3-mais').onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;if(!pop.hidden)setTimeout(()=>document.addEventListener('click',()=>pop.hidden=true,{once:true}),0)};
    pop.querySelectorAll('[data-snovo]').forEach(b=>b.onclick=()=>{const p={id:uid(),t:'',o:['','','',''],c:0,s:20,tp:'mc'};sp3Init(p,b.dataset.snovo);c.perg.push(p);toque();re();setTimeout(()=>{const s=$$('#view [data-q]').pop();if(s){s.scrollIntoView({block:'center'});const t=s.querySelector('[data-qt]');if(t)t.focus()}},50)});
    bar.querySelector('#sp3-imp').onclick=()=>sp3ImportarDiap(c,re);bar.querySelector('#sp3-ext').onclick=()=>sp3ExtrairDlg(c,re)}}

/* ---------- lançar: todos os tipos passam o filtro antigo; o modo Estudo é sempre ao ritmo de cada aluno ---------- */
const _sp3Lan=arLancarDlg;
arLancarDlg=function(c,tipo0){if(!c)return;const cc=Object.assign({},c,{perg:c.perg.map(p=>sp3Ok(p)?{id:p.id,t:sp3Txt(p.t)||'·',o:['✓','✓'],c:0,tp:p.tp,s:p.s,_src:p}:{id:p.id,t:'',o:[],c:0,_src:p})});
  if(tipo0==null&&UI.arL&&UI.arL.modo==='estudo')UI.arL.tipo='tpc';return _sp3Lan.call(this,cc,tipo0)};
function sp3Publica(p){const tp=p.tp||'mc';const o={t:sp3Txt(p.t),s:+p.s||20,tp};let ci=0,k=null;
  if(sp3Foto(p.img))o.img=sp3Foto(p.img);if(p.pm!=null&&+p.pm!==1&&AR.tpGrad(tp))o.pm=+p.pm;if(p.vid&&p.vid.id)o.vid={id:p.vid.id,ini:+p.vid.ini||0,fim:+p.vid.fim||0};
  if(AR.tpOps(tp)){const ops=tp==='vf'?['Verdadeiro','Falso']:(p.o||[]).map(sp3Txt);const ims=(p.oi||[]).map(sp3Foto);const keep=[];ops.forEach((x,i)=>{if(x||ims[i])keep.push(i)});while(keep.length<2)keep.push(keep.length);
    o.o=keep.map(i=>ops[i]||'');if(keep.some(i=>ims[i]))o.oi=keep.map(i=>ims[i]||'');const mp=i=>keep.indexOf(i);
    if(tp==='multi')k={c:(p.cs||[]).map(mp).filter(i=>i>=0).sort((a,b)=>a-b)};else if(tp!=='sond')ci=Math.max(0,mp(p.c|0))}
  else if(tp==='rc'){k={a:(p.a||[]).map(sp3Txt).filter(Boolean)};o.max=40}
  else if(tp==='slider'){Object.assign(o,{min:+p.min,max:+p.max,step:+p.step||1,un:sp3Txt(p.un)});k={v:+p.v,tol:Math.abs(+p.tol||0)}}
  else if(tp==='ordem'){const it=(p.it||[]).map(sp3Txt).filter(Boolean);const perm=it.map((_,i)=>i);for(let n=0;n<20&&(perm.length<2||perm.every((v,i)=>v===i)||n===0);n++)perm.sort(()=>Math.random()-.5);o.o=perm.map(i=>it[i]);k={ord:it.map((_,x)=>perm.indexOf(x))}}
  else if(tp==='pino'){const z=p.zona||{x:.5,y:.5,r:.1};k={x:+z.x,y:+z.y,r:+z.r}}
  else if(tp==='escala')o.esc=p.esc||'likert';
  else if(tp==='slide'){o.lay=p.lay||'classico';o.tx=String(p.tx||'').slice(0,1500);o.s=+p.s||0}
  else if(tp==='nuvem')o.max=20;else if(tp==='aberta')o.max=250;else if(tp==='ideias'){o.max=80;o.n=3}
  return {pub:o,ci,k}}
arCriar=async function(c,P,L){const code=AR.codigo();const id=await AR.salaId(code);const estudo=L.modo==='estudo';if(estudo)L.tipo='tpc';const M=AR.MODOS[L.modo];
  let src=P.map(p=>p._src||p);const n0=src.length;
  if(L.modo!=='classico'){src=src.filter(p=>AR.tpGrad(p.tp));if(!src.length)throw new Error('Este modo só usa perguntas com resposta certa. Para sondagens, escalas, nuvens, respostas abertas, ideias e diapositivos use o modo Clássico.');if(src.length<n0)toast((n0-src.length)+' pergunta'+(n0-src.length>1?'s':'')+' sem resposta certa fica'+(n0-src.length>1?'m':'')+' de fora neste modo.','aviso')}
  S.cfg.arenaSal=S.cfg.arenaSal||AR.token();let lista=null,refs={};
  if(L.nomes==='lista'){const t=arTurmas().find(x=>x.id===L.turma);if(!t)throw new Error('Escolha a turma.');const al=alunosAval(t);lista=[];
    for(const a of al){const r=(await AR.sha('es-arena-ref:'+S.cfg.arenaSal+':'+(a.cid||a.id))).slice(0,32);refs[r]=a.id;const pn=String(a.nome||'').trim().split(/\s+/);lista.push({r,n:(numAl(a)?numAl(a)+'. ':'')+pn[0]+(pn.length>1?' '+pn[pn.length-1]:'')})}}
  const PB=src.map(sp3Publica);const perguntas=PB.map(x=>x.pub),certas=PB.map(x=>x.ci),extra=PB.map(x=>x.k);
  const porObj=M.dur&&M.obj&&L.fim==='obj';
  const cfg={titulo:c.nome,nomes:L.nomes,tardias:L.tipo==='vivo'?!!L.tardias:true,aleatoria:L.ordem!=='seq',dominar:!!M.v2&&L.ordem==='dom',moedas:arMoedasOn()&&!!L.moedas,duracao:M.dur?(porObj?1200:L.dur):0,objetivo:porObj?(L.obj||0)*(L.modo==='floresta'?4:1):0,
    tema:AR.temaOk(L.tema),mostrar:L.mostrar!==false,silencio:!!L.silencio};if(M.eq)cfg.equipas=L.equipas;if(L.alcAleat&&L.nomes==='livre')cfg.alcunhas='aleat';if(estudo)cfg.estudo=true;
  const op=S.cfg.sp3Opc||{};if(L.tipo==='vivo'){['reacoes','qa','aula'].forEach(k=>{if(op[k]!=null)cfg[k]=op[k]});if(op.maxjog)cfg.maxjog=op.maxjog}if(S.cfg.sp3Marca&&S.cfg.sp3Marca.on!==false)cfg.marca=sp3MarcaPub(S.cfg.sp3Marca);
  if(lista)cfg.lista_c=await AR.cifrar(lista,code);
  const limite=L.tipo==='tpc'?new Date(L.limite||Date.now()+7*864e5).toISOString():null;
  if(L.tipo==='tpc'&&new Date(limite)<=new Date())throw new Error('A data-limite tem de ser no futuro.');
  try{await arRpc('arena_criar3',{p_id:id,p_tipo:L.tipo,p_modo:L.modo,p_cfg:cfg,p_perguntas:perguntas,p_certas:certas,p_extra:extra,p_limite:limite})}
  catch(e){if(!e.semSql)throw e;const simples=!estudo&&src.every(p=>(!p.tp||p.tp==='mc'||p.tp==='vf')&&!(p.oi||[]).some(Boolean)&&!(p.vid&&p.vid.id)&&(p.pm==null||+p.pm===1));
    if(!simples)throw new Error('Para os tipos de pergunta novos falta correr o ficheiro 0021_spruceit_completo.sql no Supabase.');
    await arRpc('arena_criar',{p_id:id,p_tipo:L.tipo,p_modo:L.modo,p_cfg:cfg,p_perguntas:perguntas,p_certas:certas,p_limite:limite})}
  const j={id,codigo:code,conj:c.id,nome:c.nome,modo:L.modo,tipo:L.tipo,tema:cfg.tema,turma:L.nomes==='lista'?L.turma:'',refs,criado:Date.now(),limite,v3:true,
    perg:src.map((p,k)=>({t:p.t,tp:p.tp||'mc',o:perguntas[k].o||(p.tp==='vf'?['Verdadeiro','Falso']:null),c:certas[k],k:extra[k],notas:p.notas||'',img:p.img||null,un:p.un||'',min:p.min,max:p.max,esc:p.esc}))};
  arD().jogos.unshift(j);if(arD().jogos.length>200)arD().jogos.length=200;save();audit('Spruce It!','Jogo lançado',c.nome+' · '+M.nome+' · '+(L.tipo==='tpc'?'trabalho de casa':'ao vivo'));
  closeDrawer();arAnfitriao(j)};

/* ---------- ecrã projetado ---------- */
function sp3MarcaPub(m){return m?{logo:m.logo||'',nome:sp3Txt(m.nome).slice(0,40),cor:m.cor||'',fundo:m.fundo||''}:null}
const sp3Norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9%,.+\-/ ]/g,'').replace(/\s+/g,' ').trim();
const sp3NResp=h=>Object.values((h.d&&h.d.atual)||{}).reduce((a,b)=>a+b,0);
const sp3Meu=h=>{if(!h||!h.d)return false;const s=h.d.sala;return h.j.modo==='classico'&&h.j.tipo==='vivo'&&!!(s.cfg&&s.cfg.v3)&&(s.estado==='jogo'||s.estado==='pausa')&&s.atual>=0};

const _sp3Anf=arAnfitriao;
arAnfitriao=async function(j){const r=await _sp3Anf.apply(this,arguments);try{sp3Host()}catch(e){console.warn(e)}return r};
const _sp3Fecha=arFecharHost;
arFecharHost=function(){try{if(arH){clearInterval(arH.sp3t);if(arH.sp3w&&!arH.sp3w.closed)arH.sp3w.close()}AR.musica.desliga()}catch(_){}return _sp3Fecha.apply(this,arguments)};
const _sp3Des=arDesenhar;
arDesenhar=function(){const h=arH;if(sp3Meu(h)){try{sp3Topo(h);sp3Classico();sp3Pos()}catch(e){console.warn(e)}return}const r=_sp3Des.apply(this,arguments);try{sp3Pos()}catch(e){console.warn(e)}return r};
const _sp3Rel=arRelogio;
arRelogio=function(){const h=arH;if(h&&h.d){const s=h.d.sala;const p=s.pergunta||{};if(h.j.modo==='classico'&&p.tp==='slide'&&!s.revelada){h.revPedida=true;const el=$('#arh-rel');if(el)el.textContent='';return}}return _sp3Rel.apply(this,arguments)};

function sp3Host(){const h=arH;if(!h)return;const o=h.o;const op=S.cfg.sp3Opc||{};h.sp3={x3:[],x3i:-1,qa:[],rxDesde:null,musica:op.musica!==false&&h.j.tipo==='vivo',ultX:'',fase:'',ocultas:new Set()};
  o.querySelector('#arh-som').insertAdjacentHTML('beforebegin',`<button type="button" class="arhb" id="sp3-opt" title="Opções do jogo" aria-label="Opções do jogo">${ic('gear',16)}</button>${h.j.tipo==='vivo'?`<button type="button" class="arhb" id="sp3-qa" title="Perguntas do público" hidden>${ic('chat',16)}<b class="sp3bd" hidden></b></button><button type="button" class="arhb" id="sp3-or" title="Vista do orador (abre noutra janela)" aria-label="Vista do orador">${ic('cMonitor',16)}</button><button type="button" class="arhb" id="sp3-mus" title="Música do átrio" aria-pressed="${h.sp3.musica}">${ic('headphones',16)}</button>`:''}`);
  o.querySelector('#sp3-opt').onclick=()=>sp3Opcoes();
  if(h.j.tipo==='vivo'){o.querySelector('#sp3-qa').onclick=()=>sp3QaPainel();o.querySelector('#sp3-or').onclick=()=>sp3Orador();
    o.querySelector('#sp3-mus').onclick=e=>{h.sp3.musica=!h.sp3.musica;e.currentTarget.setAttribute('aria-pressed',h.sp3.musica);S.cfg.sp3Opc=Object.assign({},S.cfg.sp3Opc||{},{musica:h.sp3.musica});save();sp3Pos()}}
  clearInterval(h.sp3t);h.sp3t=setInterval(sp3Poll,2000);sp3Poll()}
async function sp3Poll(){const h=arH;if(!h||!h.d||!h.sp3||h.sp3.ocupado)return;const s=h.d.sala;h.sp3.ocupado=true;
  try{if(h.j.tipo==='vivo'&&s.cfg.reacoes&&s.estado!=='fim'){const r=await arRpc('arena_reacoes',{p_id:h.j.id,p_desde:h.sp3.rxDesde});if(arH!==h)return;const novas=h.sp3.rxDesde?(r.r||[]):[];h.sp3.rxDesde=r.agora;novas.slice(-30).forEach((x,k)=>setTimeout(()=>sp3Rx(x),k*110))}
    if(s.cfg.qa==='livre'||s.cfg.qa==='moderada'){h.sp3.qa=(await arRpc('arena_qa_prof',{p_id:h.j.id}))||[];if(arH!==h)return;sp3QaAtual()}
    if(sp3Meu(h)){const x=(await arRpc('arena_atual3',{p_id:h.j.id}))||[];if(arH!==h)return;const sig=s.atual+':'+s.revelada+':'+JSON.stringify(x);if(sig!==h.sp3.ultX){h.sp3.ultX=sig;h.sp3.x3=x;h.sp3.x3i=s.atual;sp3Classico()}}
    sp3OradorAtual()}catch(e){}finally{h.sp3.ocupado=false}}
function sp3Topo(h){const s=h.d.sala;const pau=$('#arh-pau'),fim=$('#arh-fim');if(pau){pau.hidden=false;pau.innerHTML=s.estado==='pausa'?'▶ Retomar':ic('clock',16)+' Pausar'}if(fim){fim.hidden=false;fim.textContent='Terminar'}clearInterval(h.relogio);h.relogio=setInterval(arRelogio,250)}
function sp3Pos(){const h=arH;if(!h||!h.d||!h.sp3)return;const s=h.d.sala,c=s.cfg||{},o=h.o;
  o.style.cssText=AR.temaCss(h.j.tema)+AR.marcaCss(c.marca);o.classList.toggle('sp3marca',!!(c.marca&&(c.marca.cor||c.marca.fundo)));
  const lg=o.querySelector('.arhlogo');if(lg){const mk=c.marca&&(c.marca.logo||c.marca.nome);const want=mk?`${c.marca.logo?`<img src="${esc(c.marca.logo)}" alt="">`:''}${c.marca.nome?`<span>${esc(c.marca.nome)}</span>`:''}`:'Spruce <em>It</em>';if(lg.dataset.sp3!==want){lg.dataset.sp3=want;lg.innerHTML=want;lg.classList.toggle('sp3lg',!!mk)}}
  const qa=o.querySelector('#sp3-qa');if(qa)qa.hidden=!(c.qa==='livre'||c.qa==='moderada');
  if(h.sp3.musica&&s.estado==='espera'&&h.j.tipo==='vivo')AR.musica.liga();else AR.musica.desliga();
  const m=$('#arh-m');
  if(s.estado==='espera'){const lb=m.querySelector('.arhlobb');if(lb&&!lb.querySelector('.sp3chips')){const on=[c.aula&&'Modo aula',c.precisao&&'Precisão',c.confianca&&'Confiança',c.reacoes&&'Reações',c.qa==='livre'&&'Perguntas do público',c.qa==='moderada'&&'Perguntas do público (moderadas)',c.maxjog&&('Até '+c.maxjog+' jogadores')].filter(Boolean);
    lb.insertAdjacentHTML('beforeend',`<div class="sp3chips">${on.map(x=>`<span>${esc(x)}</span>`).join('')}<button type="button" class="btn arhbtn" data-sp3o>${ic('gear',15)} Opções do jogo</button></div>`);lb.querySelector('[data-sp3o]').onclick=()=>sp3Opcoes()}}
  if(s.estado==='fim'){const r=m.querySelector('.arhfim .row');if(r&&!r.querySelector('#sp3-cert')){r.insertAdjacentHTML('beforeend',`<button class="btn arhbtn" id="sp3-cert">${ic('award',16)} Certificados</button>`);r.querySelector('#sp3-cert').onclick=()=>sp3Certificados(h.j.nome,h.d.jogadores.filter(x=>!x.expulso).sort((a,b)=>b.pontos-a.pontos).map(x=>({a:x.alcunha,pts:x.pontos})),h.j.modo)}}
  const sh=o.querySelector('#sp3-opts');if(sh&&!sh.hidden&&!sh.contains(document.activeElement))sp3Opcoes(true);
  sp3QaAtual();sp3OradorAtual()}

/* pergunta e resultados no ecrã projetado (modo Clássico ao vivo) */
function sp3Media(p,tp){if(p.vid&&p.vid.id)return `<div class="sp3vid"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.vid.id)}?autoplay=1&rel=0&start=${p.vid.ini|0}${p.vid.fim?'&end='+(p.vid.fim|0):''}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Vídeo da pergunta"></iframe></div>`;return p.img&&tp!=='pino'?`<img class="arhqi" src="${esc(p.img)}" alt="">`:''}
function sp3Tiles(p,cont,certas,tot){const ops=p.o||[];return `<div class="arhops n${Math.min(ops.length,4)} sp3tiles">${ops.map((x,k)=>{const im=(p.oi||[])[k];const ce=certas&&certas.includes(k);const rev=!!certas;const n=cont?(cont[k]||0):null;
  return `<div class="arhop ${rev?(ce?'certa':certas.length?'errada':''):''}" style="--oc:${SP3_COR[k]}"><span>${rev&&ce?'✓':arFormas[k]}</span>${im?`<img class="sp3opi" src="${esc(im)}" alt="">`:''}<b>${esc(x)}</b>${n!=null?`<em>${n}</em><i style="width:${100*n/(tot||1)}%"></i>`:''}</div>`}).join('')}</div>`}
function sp3Corpo(p,tp){if(AR.tpOps(tp))return sp3Tiles(p);
  if(tp==='slider')return `<div class="sp3eixo"><span>${esc(String(p.min))}${esc(p.un?' '+p.un:'')}</span><i></i><span>${esc(String(p.max))}${esc(p.un?' '+p.un:'')}</span></div>`;
  if(tp==='ordem')return `<ol class="sp3ord">${(p.o||[]).map((x,k)=>`<li style="--oc:${SP3_COR[k]}">${esc(x)}</li>`).join('')}</ol>`;
  if(tp==='pino')return `<div class="sp3pinoh"><img src="${esc(p.img||'')}" alt=""></div>`;
  if(tp==='escala')return `<div class="sp3esc">${AR.escala(p).map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  if(tp==='slide')return p.tx?`<div class="sp3sltx">${esc(p.tx).replace(/\n/g,'<br>')}</div>`:'';
  return `<div class="sp3escreve">${ic('pen',28)} ${tp==='ideias'?'Escreve até 3 ideias no teu aparelho':tp==='nuvem'?'Escreve uma palavra no teu aparelho':'Escreve a tua resposta no teu aparelho'}</div>`}
function sp3Res(h,p,tp,X){const s=h.d.sala,i=s.atual,k3=s.certa3||{},ci=(h.d.certas||[])[i];const tot=X.length;
  if(AR.tpOps(tp)){let cont=h.d.atual||{};if(tp==='multi'){cont={};X.forEach(x=>(Array.isArray(x.r)?x.r:[]).forEach(k=>cont[k]=(cont[k]||0)+1))}const n=tp==='multi'?tot:Object.values(cont).reduce((a,b)=>a+b,0);
    return sp3Tiles(p,cont,tp==='sond'?[]:tp==='multi'?(k3.c||[]):[ci],n)}
  if(tp==='rc'){const g=new Map();X.forEach(x=>{const t=typeof x.r==='string'?x.r:'';const k=sp3Norm(t);if(!k)return;const e=g.get(k)||{t:t.trim(),n:0,ok:false};e.n++;e.ok=e.ok||!!x.c;g.set(k,e)});const L=[...g.values()].sort((a,b)=>b.n-a.n).slice(0,12);const mx=Math.max(1,...L.map(x=>x.n));
    return `<p class="sp3sol">Certa: <b>${(k3.a||[]).map(esc).join(' · ')||'—'}</b> · ${X.filter(x=>x.c).length}/${tot} acertaram</p><div class="sp3bars">${L.map(x=>`<div class="${x.ok?'ok':''}"><span>${x.ok?'✓ ':''}${esc(x.t)}</span><i style="width:${100*x.n/mx}%"></i><em>${x.n}</em></div>`).join('')||'<p class="arhsub">Sem respostas.</p>'}</div>`}
  if(tp==='slider'){const a=+p.min,b=+p.max,V=X.map(x=>+x.r).filter(isFinite);const pos=v=>Math.max(0,Math.min(100,100*(v-a)/((b-a)||1)));const v=+k3.v,t=+k3.tol||0;const med=V.length?V.reduce((x,y)=>x+y,0)/V.length:null;
    return `<p class="sp3sol">Certa: <b>${AR.nf(v)}${esc(p.un?' '+p.un:'')}</b>${t?' (± '+AR.nf(t)+')':''} · média ${med==null?'—':sp3Dec(med)} · ${X.filter(x=>x.c).length}/${tot} acertaram</p>
      <div class="sp3reg"><b style="left:${pos(v-t)}%;width:${Math.max(.8,pos(v+t)-pos(v-t))}%"></b>${V.map(x=>`<i style="left:${pos(x)}%"></i>`).join('')}<u style="left:${pos(v)}%"></u></div><div class="sp3eixo"><span>${esc(String(a))}</span><i></i><span>${esc(String(b))}</span></div>`}
  if(tp==='ordem'){const ord=k3.ord||[];return `<p class="sp3sol">${X.filter(x=>x.c).length}/${tot} acertaram a ordem</p><ol class="sp3ord ok">${ord.map((x,k)=>`<li style="--oc:${SP3_COR[k]}">${esc((p.o||[])[x]||'')}</li>`).join('')}</ol>`}
  if(tp==='pino'){const z=k3;return `<p class="sp3sol">${X.filter(x=>x.c).length}/${tot} acertaram</p><div class="sp3pinoh"><img src="${esc(p.img||'')}" alt="">${z.x!=null?`<b style="left:${z.x*100}%;top:${z.y*100}%;width:${z.r*200}%"></b>`:''}${X.filter(x=>x.r&&x.r.x!=null).map(x=>`<i class="${x.c?'ok':''}" style="left:${x.r.x*100}%;top:${x.r.y*100}%"></i>`).join('')}</div>`}
  if(tp==='escala'){const E=AR.escala(p);const cnt=E.map((_,k)=>X.filter(x=>+x.r===k).length);const mx=Math.max(1,...cnt);const V=X.map(x=>+x.r).filter(isFinite);const med=V.length?V.reduce((a,b)=>a+b,0)/V.length:null;
    return `<p class="sp3sol">${tot} resposta${tot===1?'':'s'}${med==null?'':' · média '+sp3Dec(Math.round((med+(p.esc==='nps'?0:1))*10)/10)+(p.esc==='nps'?' em 10':' em 5')}</p><div class="sp3cols">${E.map((x,k)=>`<div><em>${cnt[k]}</em><i style="height:${100*cnt[k]/mx}%"></i><span>${esc(x)}</span></div>`).join('')}</div>`}
  if(tp==='nuvem'){const g=new Map();X.forEach(x=>{const t=typeof x.r==='string'?x.r.trim():'';const k=sp3Norm(t);if(!k||h.sp3.ocultas.has(k))return;const e=g.get(k)||{t,n:0};e.n++;g.set(k,e)});const L=[...g.values()].sort((a,b)=>b.n-a.n).slice(0,60);const mx=Math.max(1,...L.map(x=>x.n));
    return `<div class="sp3nuvem">${L.map((x,k)=>`<span style="font-size:${1+2.4*x.n/mx}em;--oc:${SP3_COR[k%6]}" data-sp3ocu="${esc(sp3Norm(x.t))}" title="Toque para esconder">${esc(x.t)}${x.n>1?`<sup>${x.n}</sup>`:''}</span>`).join('')||'<p class="arhsub">Sem respostas.</p>'}</div>`}
  if(tp==='aberta')return `<div class="sp3mural">${X.filter(x=>typeof x.r==='string'&&!h.sp3.ocultas.has('#'+x.id)).map((x,k)=>`<div style="--oc:${SP3_COR[k%6]}" data-sp3ocu="#${x.id}" title="Toque para esconder">${esc(x.r)}</div>`).join('')||'<p class="arhsub">Sem respostas.</p>'}</div>`;
  if(tp==='ideias'){const L=[];X.forEach(x=>(Array.isArray(x.r)?x.r:[]).forEach((t,k)=>{if(!h.sp3.ocultas.has(x.id+':'+k))L.push({t,v:+((x.v||{})[k]||0),id:x.id+':'+k})}));const vot=s.cfg.fase==='votar'||s.cfg.fase==='resultados';if(vot)L.sort((a,b)=>b.v-a.v);
    return `<p class="sp3sol">${L.length} ideia${L.length===1?'':'s'}${s.cfg.fase==='votar'?' · votação aberta (3 votos cada)':s.cfg.fase==='resultados'?' · votação fechada':''}</p><div class="sp3mural">${L.map((x,k)=>`<div style="--oc:${SP3_COR[k%6]}" data-sp3ocu="${x.id}">${vot?`<b class="sp3v">${x.v}</b>`:''}${esc(x.t)}</div>`).join('')}</div>`}
  return ''}
function sp3Classico(){const h=arH;if(!sp3Meu(h))return;const s=h.d.sala,c=s.cfg||{};const m=$('#arh-m');const p=s.pergunta||{};const i=s.atual;const tp=p.tp||'mc';const T=AR.TIPOS[tp]||AR.TIPOS.mc;
  const ativos=h.d.jogadores.filter(x=>!x.expulso);const X=h.sp3.x3i===i?h.sp3.x3:[];const ult=i>=s.n_perg-1;const rev=s.revelada&&tp!=='slide';
  const key='q'+i+(rev?'r':'');
  if(h.sp3.fase!==key||!m.querySelector('#sp3-q')){if(h.sp3.fase!==key){if(rev)AR.tocar('certo');else{h.revPedida=false;AR.tocar('tic')}setTimeout(sp3Poll,60)}h.sp3.fase=key;
    const tags=[p.pm===2&&'Pontos a dobrar',p.pm===0&&'Sem pontos',c.precisao&&AR.tpGrad(tp)&&'Precisão',c.confianca&&AR.tpGrad(tp)&&'Confiança'].filter(Boolean);
    const titulo=tp==='slide'&&p.lay==='imagem'?'':`<h2 class="arhqt ${tp==='slide'&&p.lay==='titulo'?'sp3tit':''}">${esc(p.t||'')}</h2>`;
    m.innerHTML=`<div class="arhq sp3q ${rev?'rev':''} ${tp==='slide'?'sp3slide sp3l-'+(p.lay||'classico'):''}" id="sp3-q"><div class="arhqtop"><span class="arhqn">${tp==='slide'?'Diapositivo':'Pergunta'} ${i+1} de ${s.n_perg} · ${T.ic} ${esc(T.n)}${tags.map(x=>` <span class="sp3tg">${esc(x)}</span>`).join('')}</span><span class="arhrel" id="arh-rel"></span><span class="arhqn" id="sp3-n"></span></div>${!rev&&tp!=='slide'?'<div class="arhbarw"><i id="arh-bar"></i></div>':''}
      ${titulo}${rev&&!['pino','escala'].includes(tp)?'':sp3Media(p,tp)}${rev?'':`<div id="sp3-corpo">${sp3Corpo(p,tp)}</div>`}<div id="sp3-dyn" aria-live="polite"></div>
      <div class="row sp3acts">${tp==='slide'||rev?`<button class="btn pri arhbtn" id="sp3-seg">${ult?'Ver Pódio':'Seguinte'} ›</button>`:`<button class="btn arhbtn" id="sp3-rev">Mostrar resultados</button>`}${rev&&tp==='ideias'?`<button class="btn arhbtn" id="sp3-vot"></button>`:''}</div></div>`;
    const seg=m.querySelector('#sp3-seg');if(seg)seg.onclick=async()=>{seg.disabled=true;if(c.fase){try{await arRpc('arena_fase',{p_id:h.j.id,p_fase:null})}catch(_){}}if(ult)arCtl('terminar');else arCtl('perg',{i:i+1})};
    const rv=m.querySelector('#sp3-rev');if(rv)rv.onclick=()=>{h.revPedida=true;arCtl('revelar')}}
  const n=m.querySelector('#sp3-n');if(n)n.textContent=tp==='slide'?ativos.length+' a ver':sp3NResp(h)+'/'+ativos.length+' responderam';
  const vb=m.querySelector('#sp3-vot');if(vb){vb.textContent=c.fase==='votar'?'Fechar votação':'Abrir votação';vb.onclick=async()=>{vb.disabled=true;try{const d=await arRpc('arena_fase',{p_id:h.j.id,p_fase:c.fase==='votar'?'resultados':'votar'});if(d&&d.sala&&arH===h){h.d=d;arDesenhar()}}catch(e){toast(e.message,'erro')}vb.disabled=false}}
  const dyn=m.querySelector('#sp3-dyn');let html='';
  if(rev){html=sp3Res(h,p,tp,X);if(!c.aula&&AR.tpGrad(tp)){const top=ativos.slice().sort((a,b)=>b.pontos-a.pontos).slice(0,5);html+=`<div class="arhtop"><h3>Classificação</h3>${top.map((x,k)=>`<div class="arhr"><b>${k+1}</b>${AR.svg(x.avatar,34)}<span>${esc(x.alcunha)}</span><em>${AR.nf(x.pontos)}</em></div>`).join('')}</div>`}}
  if(s.estado==='pausa')html+='<div class="arhpausa">Em pausa</div>';
  if(dyn.dataset.h!==html){dyn.dataset.h=html;dyn.innerHTML=html;dyn.querySelectorAll('[data-sp3ocu]').forEach(e=>e.onclick=()=>{h.sp3.ocultas.add(e.dataset.sp3ocu);dyn.dataset.h='';sp3Classico()})}
  arRelogio()}

/* reações, perguntas do público, vista do orador */
function sp3Rx(r){const h=arH;if(!h)return;if(h.o.querySelectorAll('.sp3rx').length>40)return;const e=document.createElement('span');e.className='sp3rx';e.setAttribute('aria-hidden','true');e.textContent=AR.REACOES[r]||'👍';e.style.left=(6+Math.random()*88)+'%';e.style.animationDuration=(2.6+Math.random()*1.6)+'s';h.o.appendChild(e);setTimeout(()=>e.remove(),4500)}
function sp3QaAtual(){const h=arH;if(!h||!h.sp3)return;const c=h.d.sala.cfg||{};const Q=h.sp3.qa||[];const on=c.qa==='livre'||c.qa==='moderada';
  const bd=h.o.querySelector('#sp3-qa .sp3bd');const pend=Q.filter(q=>q.e==='pendente').length,vis=Q.filter(q=>q.e==='visivel'||q.e==='destaque').length;if(bd){const n=c.qa==='moderada'?pend:vis;bd.hidden=!on||!n;bd.textContent=n}
  let b=h.o.querySelector('#sp3-qab');const d=on&&Q.find(q=>q.e==='destaque');if(d){if(!b){b=document.createElement('div');b.id='sp3-qab';b.className='sp3qab';h.o.appendChild(b)}const t=`<small>Pergunta do público${d.a?' · '+esc(d.a):''} · ${d.v} ▲</small><b>${esc(d.t)}</b>`;if(b.innerHTML!==t)b.innerHTML=t}else if(b)b.remove();
  const pn=h.o.querySelector('#sp3-qap');if(pn&&!pn.hidden)sp3QaPainel(true)}
function sp3QaPainel(manter){const h=arH;if(!h)return;let pn=h.o.querySelector('#sp3-qap');if(pn&&!manter){pn.hidden=!pn.hidden;if(pn.hidden)return}
  if(!pn){pn=document.createElement('aside');pn.id='sp3-qap';pn.className='sp3sheet';pn.setAttribute('aria-label','Perguntas do público');h.o.appendChild(pn)}pn.hidden=false;
  const c=h.d.sala.cfg||{};const Q=(h.sp3.qa||[]).filter(q=>q.e!=='oculta').slice().sort((a,b)=>(a.e==='pendente'?-1:0)-(b.e==='pendente'?-1:0)||b.v-a.v||a.id-b.id);const ocult=(h.sp3.qa||[]).filter(q=>q.e==='oculta').length;
  const nome={pendente:'Por aprovar',visivel:'Visível',destaque:'No ecrã',respondida:'Respondida'};
  pn.innerHTML=`<header><b>${ic('chat',16)} Perguntas do público</b><span class="sp1"></span><button type="button" class="arhb" data-qx aria-label="Fechar">${ic('x',16)}</button></header>
    <p class="sp3h">${c.qa==='moderada'?'Moderadas: só aparecem aos alunos depois de aprovadas.':'Livres: aparecem logo a todos.'} Os alunos votam nas que querem ver respondidas.${ocult?' · '+ocult+' escondida'+(ocult>1?'s':'')+' (linguagem imprópria ou por si)':''}</p>
    <div class="sp3qal">${Q.map(q=>`<div class="sp3qai ${q.e}"><div><b>${esc(q.t)}</b><small>${q.a?esc(q.a)+' · ':''}${q.v} ▲ · ${nome[q.e]||q.e}</small></div><div class="row">${q.e==='pendente'?`<button class="btn sm pri" data-qm="${q.id}:visivel">Aprovar</button>`:''}${q.e!=='destaque'?`<button class="btn sm" data-qm="${q.id}:destaque">Mostrar no ecrã</button>`:`<button class="btn sm" data-qm="${q.id}:visivel">Tirar do ecrã</button>`}${q.e!=='respondida'?`<button class="btn sm" data-qm="${q.id}:respondida">✓ Respondida</button>`:''}<button class="btn sm" data-qm="${q.id}:oculta">Esconder</button></div></div>`).join('')||'<p class="sp3h">Ainda não há perguntas.</p>'}</div>`;
  pn.querySelector('[data-qx]').onclick=()=>{pn.hidden=true};
  pn.querySelectorAll('[data-qm]').forEach(b=>b.onclick=async()=>{const [id,e]=b.dataset.qm.split(':');b.disabled=true;try{h.sp3.qa=await arRpc('arena_qa_moderar',{p_id:h.j.id,p_q:+id,p_estado:e})||[];sp3QaAtual()}catch(x){toast(x.message,'erro')}})}
const SP3_OR_CSS=`body{margin:0;font:16px/1.4 system-ui,sans-serif;background:#0f172a;color:#e2e8f0}header{display:flex;gap:16px;align-items:center;padding:12px 18px;background:#1e293b}header span{color:#94a3b8}header .t{margin-left:auto;font-size:28px;font-weight:800;color:#facc15}main{display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:auto 1fr;gap:14px;padding:16px}section{background:#1e293b;padding:14px 16px}small{text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;font-size:12px}h1{font-size:26px;margin:6px 0}.notas{grid-row:span 2;font-size:20px;line-height:1.5}.notas div{margin-top:8px;white-space:normal}`;
function sp3Orador(){const h=arH;if(!h)return;let w=h.sp3w;if(!w||w.closed){w=window.open('','sp3orador','width=1000,height=640');if(!w)return toast('O navegador bloqueou a janela. Permita janelas deste site e tente de novo.','aviso');h.sp3w=w;try{w.document.title='Vista do orador · Spruce It!';const st=w.document.createElement('style');st.textContent=SP3_OR_CSS;w.document.head.appendChild(st);w.document.body.innerHTML='<div id="or"></div>'}catch(_){}}sp3OradorAtual();try{w.focus()}catch(_){}}
function sp3OradorAtual(){const h=arH;const w=h&&h.sp3w;if(!w||w.closed||!h.d)return;const el=w.document.getElementById('or');if(!el)return;const s=h.d.sala;const i=s.atual;const P=h.j.perg||[];const p=P[i]||{};const nx=P[i+1];const ativos=h.d.jogadores.filter(x=>!x.expulso).length;const rel=($('#arh-rel')||{}).textContent||'';
  const html=`<header><b>${esc(h.j.nome)}</b><span>${s.estado==='espera'?'Átrio · '+ativos+' jogador'+(ativos===1?'':'es'):s.estado==='fim'?'Terminado':(i+1)+' de '+s.n_perg+(s.revelada?' · resultados':'')}</span><span class="t">${esc(rel)}</span></header>
    <main><section><small>${s.estado==='jogo'||s.estado==='pausa'?esc((AR.TIPOS[p.tp||'mc']||{}).n||''):'Agora'}</small><h1>${esc(s.estado==='espera'?'À espera dos jogadores':s.estado==='fim'?'Pódio':p.t||'')}</h1>${s.estado==='jogo'?`<p>${sp3NResp(h)}/${ativos} responderam</p>`:''}</section>
    <section class="notas"><small>Notas do orador</small><div>${esc(p.notas||'—').replace(/\n/g,'<br>')}</div></section><section><small>A seguir</small><p>${s.estado==='espera'?esc((P[0]||{}).t||''):nx?esc(nx.t||(AR.TIPOS[nx.tp||'mc']||{}).n||''):'Pódio'}</p></section></main>`;
  if(el.dataset.h!==html){el.dataset.h=html;el.innerHTML=html}}

/* opções do jogo (no átrio e durante o jogo) e marca própria */
async function sp3Cfg(o){const h=arH;if(!h)return;try{const d=await arRpc('arena_cfg3',{p_id:h.j.id,p_cfg:o});if(d&&d.sala&&arH===h){h.d=d;arDesenhar()}
  const keep={};['reacoes','qa','aula','maxjog'].forEach(k=>{if(k in o)keep[k]=o[k]});if(Object.keys(keep).length){S.cfg.sp3Opc=Object.assign({},S.cfg.sp3Opc||{},keep);save()}}
  catch(e){toast(/arena_cfg3|does not exist|PGRST202/i.test(e.message)||e.semSql?'Falta correr o ficheiro 0021_spruceit_completo.sql no Supabase.':e.message,'erro')}}
function sp3Logo(f){return new Promise((ok,ko)=>{const r=new FileReader();r.onerror=()=>ko(new Error('ficheiro ilegível'));r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,240/im.width,96/im.height);const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);let u=cv.toDataURL('image/png');if(u.length>60000)u=cv.toDataURL('image/jpeg',.82);ok(u)};im.onerror=()=>ko(new Error('imagem inválida'));im.src=r.result};r.readAsDataURL(f)})}
function sp3Opcoes(manter){const h=arH;if(!h||!h.d)return;let sh=h.o.querySelector('#sp3-opts');if(sh&&!manter){sh.hidden=!sh.hidden;if(sh.hidden)return}
  if(!sh){sh=document.createElement('aside');sh.id='sp3-opts';sh.className='sp3sheet';sh.setAttribute('aria-label','Opções do jogo');h.o.appendChild(sh)}sh.hidden=false;
  const s=h.d.sala,c=s.cfg||{};const esp=s.estado==='espera',viv=h.j.tipo==='vivo',cls=h.j.modo==='classico';const mk=S.cfg.sp3Marca||{};
  const sw=(k,on,t,sub,vis,dis)=>vis===false?'':`<button type="button" role="switch" class="arsw sp3sw" aria-checked="${!!on}" data-sk="${k}" ${dis?'disabled':''}><span><b>${t}</b><small>${sub}${dis?' (só antes de começar)':''}</small></span><i aria-hidden="true"></i></button>`;
  sh.innerHTML=`<header><b>${ic('gear',16)} Opções do jogo</b><span class="sp1"></span><button type="button" class="arhb" data-ox aria-label="Fechar">${ic('x',16)}</button></header><div class="sp3opb">
    ${sw('aula',c.aula,'Modo aula','O professor conduz ao seu ritmo e não aparece classificação entre perguntas',cls&&viv)}
    ${sw('precisao',c.precisao,'Modo precisão','Conta acertar, não a rapidez: 1000 pontos por resposta certa',cls,!esp)}
    ${sw('confianca',c.confianca,'Modo confiança','Cada aluno diz quão seguro está: ganha mais se acertar, perde pontos se errar',cls,!esp)}
    ${sw('reacoes',c.reacoes,'Reações','Os alunos enviam emojis que flutuam no ecrã projetado',viv)}
    ${viv?`<div><label>Perguntas do público</label><div class="seg arseg">${[['nao','Desligadas'],['livre','Livres'],['moderada','Moderadas']].map(([k,n])=>`<button type="button" data-sqa="${k}" class="${(c.qa||'nao')===k?'on':''}">${n}</button>`).join('')}</div></div>`:''}
    ${sw('mostrar',c.mostrar!==false,'Perguntas nos aparelhos','A pergunta e as respostas aparecem também no ecrã de cada aluno',cls)}
    ${sw('tardias',c.tardias!==false,'Entrar depois do início','Deixa entrar quem chega atrasado',viv)}
    ${viv?`<div><label>Máximo de jogadores</label><input type="number" min="2" max="2000" step="1" data-smax value="${esc(c.maxjog||80)}" ${esp?'':'disabled'}><p class="hint" style="margin:4px 0 0">Até 2000. Por omissão, 80.</p></div>`:''}
    <fieldset class="sp3marcaf"><legend>Marca própria</legend><p class="hint" style="margin:0 0 6px">Logótipo, nome e cores no ecrã projetado e nos aparelhos dos alunos. Fica guardada para os próximos jogos.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap">${mk.logo?`<img class="sp3mlg" src="${esc(mk.logo)}" alt="Logótipo">`:''}<button type="button" class="btn sm" data-mlogo>${ic('image',13)} ${mk.logo?'Trocar':'Logótipo'}</button>${mk.logo?`<button type="button" class="btn sm" data-mlx>Tirar</button>`:''}</div>
      <label>Nome<input data-mnome maxlength="40" value="${esc(mk.nome||'')}" placeholder="ex.: Clube de Ciências"></label>
      <div class="row" style="gap:12px"><label>Cor principal <input type="color" data-mcor value="${esc(mk.cor||'#6d28d9')}"></label><label>Fundo <input type="color" data-mfundo value="${esc(mk.fundo||'#1e1b4b')}"></label></div>
      <div class="row" style="gap:8px;margin-top:6px"><button type="button" class="btn sm pri" data-mapl>Aplicar a este jogo</button><button type="button" class="btn sm" data-mdes>Sem marca</button></div><input type="file" accept="image/*" data-mf hidden></fieldset></div>`;
  sh.querySelector('[data-ox]').onclick=()=>{sh.hidden=true};
  sh.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{const k=b.dataset.sk;const v=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',v);sp3Cfg({[k]:v})});
  sh.querySelectorAll('[data-sqa]').forEach(b=>b.onclick=()=>sp3Cfg({qa:b.dataset.sqa==='nao'?null:b.dataset.sqa}));
  const mx=sh.querySelector('[data-smax]');if(mx)mx.onchange=()=>sp3Cfg({maxjog:Math.max(2,Math.min(2000,+mx.value||80))});
  const guarda=o=>{S.cfg.sp3Marca=Object.assign({},S.cfg.sp3Marca||{},o,{on:true});save()};const fi=sh.querySelector('[data-mf]');
  sh.querySelector('[data-mlogo]').onclick=()=>fi.click();fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f)return;try{guarda({logo:await sp3Logo(f)});sp3Opcoes(true)}catch(e){toast('Não foi possível usar a imagem: '+e.message,'erro')}};
  const lx=sh.querySelector('[data-mlx]');if(lx)lx.onclick=()=>{guarda({logo:''});sp3Opcoes(true)};
  sh.querySelector('[data-mnome]').oninput=e=>guarda({nome:e.target.value});sh.querySelector('[data-mcor]').oninput=e=>guarda({cor:e.target.value});sh.querySelector('[data-mfundo]').oninput=e=>guarda({fundo:e.target.value});
  sh.querySelector('[data-mapl]').onclick=()=>sp3Cfg({marca:sp3MarcaPub(S.cfg.sp3Marca||{})});
  sh.querySelector('[data-mdes]').onclick=()=>{S.cfg.sp3Marca=Object.assign({},S.cfg.sp3Marca||{},{on:false});save();sp3Cfg({marca:null})}}

/* ---------- relatórios: conteúdo das respostas, perguntas do público, Excel, torneio e certificados ---------- */
const _sp3Guar=arGuardarRes;
arGuardarRes=async function(j){const res=await _sp3Guar.apply(this,arguments);if(j&&j.v3&&j.res){(j.res.perg||[]).forEach((x,k)=>{const jp=(j.perg||[])[k];if(jp&&jp.tp&&!['mc','vf'].includes(jp.tp)&&AR.tpGrad(jp.tp)){x.o=[sp3SolTxt(jp)];x.c=0}});j.res.resp=j.res.resp.filter(z=>AR.tpGrad(((j.perg||[])[z[1]]||{}).tp));try{const r=await arRpc('arena_resultados3',{p_id:j.id});j.res.r3={resp3:(r.resp3||[]).map(z=>[z[0],z[1],z[2],z[3]]),extra:r.extra||[],qa:r.qa||[]};save()}catch(_){}}return res};
function sp3SolTxt(p){const k=p.k||{},o=p.o||[];switch(p.tp){case 'multi':return (k.c||[]).map(i=>o[i]).join(', ');case 'rc':return (k.a||[]).join(' / ');case 'slider':return (k.v!=null?k.v:'')+(k.tol?' ± '+k.tol:'')+(p.un?' '+p.un:'');case 'ordem':return (k.ord||[]).map(i=>o[i]).join(' → ');case 'pino':return 'zona marcada na imagem';default:return ''}}
function sp3RespTxt(p,r){if(r==null)return '';const tp=(p&&p.tp)||'mc';if(Array.isArray(r))return tp==='ordem'?r.map(k=>((p.o||[])[k]||'?')).join(' → '):tp==='multi'?r.map(k=>arFormas[k]||k).join(', '):r.join(' · ');
  if(typeof r==='object')return r.x!=null?'('+Math.round(r.x*100)+'%, '+Math.round(r.y*100)+'%)':JSON.stringify(r);if(tp==='escala'&&p)return (AR.escala(p)[+r]||r)+'';if(AR.tpOps(tp)&&p&&p.o)return arFormas[+r]+' · '+(p.o[+r]||'');return String(r)}
const _sp3Rel2=arRelatorio;
arRelatorio=function(j){const r=_sp3Rel2.apply(this,arguments);try{sp3RelExtra(j)}catch(e){console.warn(e)}return r};
function sp3RelExtra(j){const R=j&&j.res;if(!R)return;const v=$('#view .arrel');if(!v)return;const P=j.perg||[];const r3=R.r3||{};const R3=r3.resp3||[];const nome=new Map(R.jog.map(x=>[x.id,x.a]));
  const acc=document.createElement('div');acc.className='card sp3rel';acc.innerHTML=`<div class="row" style="gap:8px;flex-wrap:wrap"><b style="flex:1">${ic('sparkle',16)} Mais</b><button class="btn sm" data-sxl>${ic('download',14)} Excel</button><button class="btn sm" data-sce>${ic('award',14)} Certificados</button><button class="btn sm" data-sto>${ic('crown',14)} Torneio</button></div>`;v.insertBefore(acc,v.children[1]||null);
  acc.querySelector('[data-sxl]').onclick=()=>sp3Excel(j);acc.querySelector('[data-sce]').onclick=()=>sp3Certificados(j.nome,R.jog.slice().sort((a,b)=>b.pts-a.pts).map(x=>({a:x.a,pts:x.pts})),j.modo);acc.querySelector('[data-sto]').onclick=()=>sp3Torneio(j);
  const blocos=P.map((p,k)=>{const tp=p.tp||'mc';if(['mc','vf'].includes(tp))return '';const L=R3.filter(z=>z[1]===k);if(!L.length&&tp!=='slide')return '';if(tp==='slide')return '';
    let corpo='';if(tp==='nuvem'||tp==='rc'||tp==='aberta'){const g=new Map();L.forEach(z=>{const t=typeof z[2]==='string'?z[2].trim():'';if(!t)return;const kk=tp==='aberta'?t:sp3Norm(t);const e=g.get(kk)||{t,n:0};e.n++;g.set(kk,e)});corpo=[...g.values()].sort((a,b)=>b.n-a.n).slice(0,40).map(x=>`<span class="sp3chip">${esc(x.t)}${x.n>1?' <b>×'+x.n+'</b>':''}</span>`).join('')}
    else if(tp==='ideias'){corpo=L.flatMap(z=>(Array.isArray(z[2])?z[2]:[]).map(t=>`<span class="sp3chip">${esc(t)}</span>`)).join('')}
    else if(tp==='slider'){const V=L.map(z=>+z[2]).filter(isFinite);corpo=`Média ${V.length?sp3Dec(V.reduce((a,b)=>a+b,0)/V.length):'—'} · mínimo ${V.length?Math.min(...V):'—'} · máximo ${V.length?Math.max(...V):'—'}${p.k&&p.k.v!=null?' · certa '+p.k.v+(p.k.tol?' ± '+p.k.tol:''):''}`}
    else if(tp==='escala'){const E=AR.escala(p);corpo=E.map((x,i)=>`<span class="sp3chip">${esc(x)} <b>${L.filter(z=>+z[2]===i).length}</b></span>`).join('')}
    else corpo=L.slice(0,60).map(z=>`<span class="sp3chip">${esc(nome.get(z[0])||'?')}: ${esc(sp3RespTxt(p,z[2]))}</span>`).join('');
    const conf=L.filter(z=>z[3]!=null);return `<div class="sp3rq"><b>${k+1}. ${(AR.TIPOS[tp]||{}).ic||''} ${esc(p.t||'')}</b><small class="mut">${esc((AR.TIPOS[tp]||{}).n||'')} · ${L.length} resposta${L.length===1?'':'s'}${conf.length?' · confiança média '+sp3Dec(conf.reduce((a,z)=>a+z[3],0)/conf.length)+' em 2':''}</small><div class="sp3chips2">${corpo}</div></div>`}).filter(Boolean);
  if(blocos.length){const c=document.createElement('div');c.className='card sp3rel';c.innerHTML=`<h2>${ic('chat',18)} Respostas escritas, escalas e ideias</h2>${blocos.join('')}`;v.appendChild(c)}
  if((r3.qa||[]).length){const c=document.createElement('div');c.className='card sp3rel';c.innerHTML=`<h2>${ic('chat',18)} Perguntas do público</h2>${r3.qa.filter(q=>q.e!=='oculta').sort((a,b)=>b.v-a.v).map(q=>`<div class="sp3rq"><b>${esc(q.t)}</b><small class="mut">${q.v} voto${q.v===1?'':'s'}${q.e==='respondida'?' · respondida':''}</small></div>`).join('')}`;v.appendChild(c)}}
function sp3Baixar(b,nome){const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download=nome.replace(/[\/\\:*?"<>|]/g,'-');document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(l.href),4000)}
function sp3Excel(j){const R=j.res;const P=j.perg||R.perg||[];const r3=(R.r3||{}).resp3||[];const al=id=>{const x=R.jog.find(z=>z.id===id);return x?x.a:''};
  const A1=[['Jogador','Pontos','Certas','Erradas','Acerto']].concat(R.jog.slice().sort((a,b)=>b.pts-a.pts).map(x=>[x.a,x.pts,x.c,x.e,(x.c+x.e)?Math.round(100*x.c/(x.c+x.e))+'%':'']));
  const A2=[['N.º','Tipo','Pergunta','Respostas','Certas','Acerto']].concat(P.map((p,k)=>{const L=R.resp.filter(z=>z[1]===k);const ok=L.filter(z=>z[3]).length;const g=AR.tpGrad(p.tp);return [k+1,(AR.TIPOS[p.tp||'mc']||{}).n||'',p.t||'',L.length,g?ok:'',g&&L.length?Math.round(100*ok/L.length)+'%':'']}));
  const A3=[['Jogador','Pergunta','Resposta','Certa','Tempo (s)','Pontos']].concat(R.resp.map(z=>{const p=P[z[1]]||{};const x=r3.find(y=>y[0]===z[0]&&y[1]===z[1]);return [al(z[0]),z[1]+1,x?sp3RespTxt(p,x[2]):AR.tpOps(p.tp)&&z[2]>=0?sp3RespTxt(p,z[2]):'',AR.tpGrad(p.tp)?(z[3]?'sim':'não'):'',Math.round(z[4]/100)/10,'']})).concat(r3.filter(x=>!AR.tpGrad((P[x[1]]||{}).tp)).map(x=>[al(x[0]),x[1]+1,sp3RespTxt(P[x[1]],x[2]),'','','']));
  sp3Baixar(puXlsx([{nome:'Jogadores',rows:A1},{nome:'Perguntas',rows:A2},{nome:'Respostas',rows:A3}]),'Spruce It - '+j.nome+'.xlsx');audit('Spruce It!','Relatório exportado (Excel)',j.nome)}
function sp3Torneio(j0){const J=arD().jogos.filter(x=>x.res&&x.res.jog&&x.res.jog.length);UI.sp3Tor=UI.sp3Tor||new Set(j0?[j0.id]:[]);const sel=UI.sp3Tor;
  const calc=()=>{const M=new Map();J.filter(x=>sel.has(x.id)).forEach(g=>g.res.jog.forEach(p=>{const k=p.al?'al:'+p.al:'a:'+String(p.a||'').toLowerCase();const e=M.get(k)||{a:p.a,pts:0,c:0,e:0,n:0};e.pts+=+p.pts||0;e.c+=+p.c||0;e.e+=+p.e||0;e.n++;M.set(k,e)}));return [...M.values()].sort((a,b)=>b.pts-a.pts)};
  const des=()=>{const T=calc();openDrawer('Torneio · juntar jogos',`<div class="ed sp3tor"><p class="mut">Escolha os jogos a juntar. Os jogadores juntam-se pelo nome da lista da turma ou, sem lista, pela alcunha.</p>
    <div class="sp3torl">${J.map(g=>`<label class="row"><input type="checkbox" data-tj="${g.id}" ${sel.has(g.id)?'checked':''}><span>${esc(g.nome)} <small class="mut">· ${new Date(g.criado).toLocaleDateString('pt-PT')} · ${g.res.jog.length} jogadores</small></span></label>`).join('')||'<p class="mut">Ainda não há jogos com resultados.</p>'}</div>
    <h3>Classificação do torneio (${sel.size} jogo${sel.size===1?'':'s'})</h3><table class="tbl"><thead><tr><th>#</th><th>Jogador</th><th>Jogos</th><th>Pontos</th><th>Acerto</th></tr></thead><tbody>${T.map((x,k)=>`<tr><td>${k+1}</td><td>${esc(x.a)}</td><td>${x.n}</td><td>${AR.nf(x.pts)}</td><td>${(x.c+x.e)?Math.round(100*x.c/(x.c+x.e))+'%':'—'}</td></tr>`).join('')}</tbody></table>
    <div class="row" style="gap:8px;margin-top:12px"><button class="btn" id="sp3-txl">${ic('download',14)} Excel</button><button class="btn" id="sp3-tce">${ic('award',14)} Certificados</button></div></div>`);
    $$('#dw-b [data-tj]').forEach(x=>x.onchange=()=>{x.checked?sel.add(x.dataset.tj):sel.delete(x.dataset.tj);des()});
    $('#sp3-txl').onclick=()=>sp3Baixar(puXlsx([{nome:'Torneio',rows:[['#','Jogador','Jogos','Pontos','Certas','Erradas']].concat(T.map((x,k)=>[k+1,x.a,x.n,x.pts,x.c,x.e]))}]),'Spruce It - torneio.xlsx');
    $('#sp3-tce').onclick=()=>sp3Certificados('Torneio Spruce It!',T.map(x=>({a:x.a,pts:x.pts})),'torneio')};des()}
function sp3Certificados(titulo,L,modo){if(!L||!L.length)return toast('Sem jogadores para certificar.','aviso');const n=prompt('Quantos certificados? (os primeiros da classificação; 0 = todos)','3');if(n==null)return;const k=+n>0?Math.min(+n,L.length):L.length;
  const w=window.open('','_blank');if(!w)return toast('O navegador bloqueou a janela. Permita janelas deste site.','aviso');const mk=S.cfg.sp3Marca&&S.cfg.sp3Marca.on!==false?S.cfg.sp3Marca:{};const cor=/^#[0-9a-f]{6}$/i.test(mk.cor||'')?mk.cor:'#6d28d9';const hoje=new Date().toLocaleDateString('pt-PT',{day:'numeric',month:'long',year:'numeric'});
  const lugar=i=>i===0?'1.º lugar':i===1?'2.º lugar':i===2?'3.º lugar':'Participação';
  w.document.title='Certificados · '+titulo;const st=w.document.createElement('style');st.textContent=`@page{size:A4 landscape;margin:0}body{margin:0;font-family:Georgia,'Times New Roman',serif;color:#1f2937}.c{width:297mm;height:210mm;box-sizing:border-box;padding:18mm;page-break-after:always;display:flex}.c>div{flex:1;border:3mm solid ${cor};outline:1mm solid ${cor};outline-offset:-7mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12mm;gap:5mm}.e{font:600 14pt system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:${cor}}h1{font-size:40pt;margin:0}h2{font-size:34pt;margin:0;border-bottom:1px solid #9ca3af;padding:0 14mm 3mm}p{font-size:15pt;margin:0;max-width:200mm}img{max-height:22mm}.r{font:700 18pt system-ui,sans-serif;color:${cor}}.b{margin-top:8mm;display:flex;gap:40mm;font-size:11pt;color:#6b7280}.b span{border-top:1px solid #9ca3af;padding-top:2mm;min-width:60mm}@media screen{body{background:#e5e7eb}.c{margin:10px auto;background:#fff;transform-origin:top center}}`;w.document.head.appendChild(st);
  w.document.body.innerHTML=L.slice(0,k).map((x,i)=>`<section class="c"><div>${mk.logo?`<img src="${esc(mk.logo)}" alt="">`:''}<span class="e">${esc(mk.nome||'Spruce It!')}</span><h1>Certificado</h1><p>atribuído a</p><h2>${esc(x.a)}</h2><span class="r">${lugar(i)}${modo!=='torneio'||i<3?'':''}</span><p>no ${modo==='torneio'?'torneio':'jogo'} «${esc(titulo)}»${x.pts!=null?' com '+AR.nf(x.pts)+' pontos':''}.</p><div class="b"><span>${esc(hoje)}</span><span>O professor</span></div></div></section>`).join('');
  setTimeout(()=>{try{w.focus();w.print()}catch(_){}},400)}

/* ---------- importar diapositivos (PDF ou PowerPoint) e extrair perguntas de um texto ---------- */
function sp3Escolher(accept){return new Promise(ok=>{const f=document.createElement('input');f.type='file';f.accept=accept;f.onchange=()=>ok(f.files[0]||null);f.click()})}
function sp3Canvas(img,max){const k=Math.min(1,max/img.width,max/img.height);const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(img.width*k));cv.height=Math.max(1,Math.round(img.height*k));cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);return cv.toDataURL('image/jpeg',.8)}
async function sp3ImgDe(bytes,mime){const u=URL.createObjectURL(new Blob([bytes],{type:mime||'image/png'}));try{const im=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=u});return sp3Canvas(im,1280)}catch(_){return ''}finally{URL.revokeObjectURL(u)}}
async function sp3ImportarDiap(c,re){const f=await sp3Escolher('.pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation');if(!f)return;const novos=[];
  toast('A importar «'+f.name+'»…','info');
  try{if(/\.pdf$/i.test(f.name)||f.type==='application/pdf'){const lib=await getPdfLib();const doc=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const n=Math.min(doc.numPages,80);
      for(let i=1;i<=n;i++){const pg=await doc.getPage(i);const vp0=pg.getViewport({scale:1});const vp=pg.getViewport({scale:Math.min(2.2,1280/vp0.width)});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
        let txt='';try{txt=(await pg.getTextContent()).items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim()}catch(_){}
        novos.push({id:uid(),tp:'slide',lay:'imagem',t:txt.slice(0,90),tx:'',img:sp3PorFoto(cv.toDataURL('image/jpeg',.8)),notas:txt.slice(0,2000),s:0,o:['','','',''],c:0})}}
    else{const z=await unzip(await f.arrayBuffer());const dp=new DOMParser();const textos=x=>{const d=dp.parseFromString(x,'application/xml');return [...d.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).map(s=>s.trim()).filter(Boolean)};
      for(let i=1;i<=200&&z.has('ppt/slides/slide'+i+'.xml');i++){const T=textos(await z.text('ppt/slides/slide'+i+'.xml'));let img='';
        const rel=await z.text('ppt/slides/_rels/slide'+i+'.xml.rels');if(rel){const m=rel.match(/Target="([^"]*media\/[^"]+\.(png|jpe?g|gif|bmp))"/i);if(m){const p=resolvePath('ppt/slides/slide'+i+'.xml',m[1]);const b=await z.bytes(p);if(b)img=await sp3ImgDe(b,'image/'+(m[2].toLowerCase()==='jpg'?'jpeg':m[2].toLowerCase()))}}
        let notas='';if(z.has('ppt/notesSlides/notesSlide'+i+'.xml'))notas=textos(await z.text('ppt/notesSlides/notesSlide'+i+'.xml')).filter(x=>!/^\d+$/.test(x)).join('\n');
        novos.push({id:uid(),tp:'slide',lay:img&&!T.length?'imagem':T.length<=1&&!img?'titulo':'classico',t:(T[0]||'').slice(0,200),tx:T.slice(1).join('\n').slice(0,1500),img:img?sp3PorFoto(img):null,notas:notas.slice(0,2000),s:0,o:['','','',''],c:0})}}}
  catch(e){return toast('Não foi possível ler o ficheiro: '+e.message,'erro')}
  if(!novos.length)return toast('Não encontrei diapositivos neste ficheiro.','aviso');
  if(c.perg.length===1&&!sp3Txt(c.perg[0].t))c.perg.length=0;c.perg.push(...novos);c.mod=Date.now();save();re();toast(novos.length+' diapositivo'+(novos.length>1?'s':'')+' importado'+(novos.length>1?'s':'')+'. Junte perguntas entre eles para os tornar interativos.','ok')}
/* formato: «1. Pergunta» seguida de opções «a) …»; a certa marca-se com * no início ou com «Resposta: b»; sem opções e com «Resposta: …» fica resposta escrita */
function sp3Extrair(txt){const L=String(txt||'').replace(/\r/g,'').split('\n').map(x=>x.trim());const Q=[];let q=null;
  const fecha=()=>{if(!q)return;if(q.o.length>=2){const p={id:uid(),t:q.t,s:20,tp:'mc',o:q.o.map(x=>x.t).slice(0,6),c:Math.max(0,q.o.findIndex(x=>x.ok))};const okN=q.o.filter(x=>x.ok).length;
      if(q.r){const k=/^[a-f]$/i.test(q.r)?q.r.toLowerCase().charCodeAt(0)-97:q.o.findIndex(x=>sp3Norm(x.t)===sp3Norm(q.r));if(k>=0)p.c=k}
      if(okN>1){p.tp='multi';p.cs=q.o.map((x,k)=>x.ok?k:-1).filter(k=>k>=0)}
      if(p.o.length===2&&/^(v|verdadeir[oa])$/i.test(p.o[0].trim())&&/^(f|fals[oa])$/i.test(p.o[1].trim())){p.tp='vf';p.o=['Verdadeiro','Falso']}
      while(p.o.length<4&&p.tp==='mc')p.o.push('');Q.push(p)}
    else if(q.r){Q.push({id:uid(),t:q.t,s:30,tp:'rc',a:q.r.split(/\s*[;|]\s*/).filter(Boolean).slice(0,6),o:['','','',''],c:0})}
    else if(/(verdadeiro|falso)\s*\??$/i.test(q.t)||/^v\/f/i.test(q.t)){Q.push({id:uid(),t:q.t.replace(/^v\/f[:.\s]*/i,''),s:20,tp:'vf',o:['Verdadeiro','Falso'],c:0})}
    q=null};
  for(const l of L){if(!l)continue;let m;
    if((m=l.match(/^(?:pergunta\s*)?(\d{1,3})\s*[.)\-–:]\s*(.+)$/i))&&!(q&&!q.o.length&&/^\d/.test(l)&&q.t.length<3)){fecha();q={t:m[2].trim(),o:[],r:''};continue}
    if(!q)continue;
    if((m=l.match(/^(?:resposta|solução|certa|correta)\s*[:=]\s*(.+)$/i))){q.r=m[1].trim().replace(/[.)]$/,'');continue}
    if((m=l.match(/^(\*|✓|✔)?\s*(?:\(?([a-fA-F])\s*[.)\-–]|[-•▪●])\s*(\*|✓|✔)?\s*(.+?)\s*(\*|✓|✔|\((?:certa|correta)\))?$/))){q.o.push({t:m[4].trim(),ok:!!(m[1]||m[3]||m[5])});continue}
    if(!q.o.length)q.t+=' '+l}
  fecha();return Q.filter(p=>sp3Txt(p.t))}
async function sp3TextoDe(f){if(/\.pdf$/i.test(f.name)){const lib=await getPdfLib();const doc=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;let out=[];
    for(let i=1;i<=Math.min(doc.numPages,60);i++){const tc=await (await doc.getPage(i)).getTextContent();let y=null,lin='';tc.items.forEach(it=>{const yy=Math.round(it.transform[5]);if(y!==null&&Math.abs(yy-y)>3){out.push(lin);lin=''}y=yy;lin+=(lin&&!lin.endsWith(' ')?' ':'')+it.str});out.push(lin)}return out.join('\n')}
  if(/\.docx$/i.test(f.name)){const z=await unzip(await f.arrayBuffer());const x=await z.text('word/document.xml');const d=new DOMParser().parseFromString(x,'application/xml');return [...d.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).join('\n')}
  return await f.text()}
function sp3ExtrairDlg(c,re){openDrawer('Extrair perguntas',`<div class="ed sp3ext2"><p class="mut">Cole um texto ou escolha um ficheiro (PDF, Word ou texto). Formato: <b>1. Pergunta</b> com as opções em linhas <b>a)</b>, <b>b)</b>…; marque a certa com <b>*</b> no início ou junte uma linha <b>Resposta: b</b>. Sem opções e com «Resposta: …» fica resposta escrita.</p>
  <textarea id="sp3-et" rows="12" placeholder="1. Qual é a capital de Portugal?&#10;a) Porto&#10;*b) Lisboa&#10;c) Braga&#10;&#10;2. Quanto é 7 × 6?&#10;Resposta: 42"></textarea><div class="row" style="gap:8px;margin-top:8px"><button class="btn" id="sp3-ef">${ic('upload',14)} Ficheiro</button><span class="sp1"></span><span class="mut" id="sp3-en">0 perguntas</span><button class="btn pri" id="sp3-eok" disabled>Juntar ao conjunto</button></div><div id="sp3-ep" class="sp3prev"></div></div>`);
  const ta=$('#sp3-et');let Q=[];const ver=()=>{Q=sp3Extrair(ta.value);$('#sp3-en').textContent=Q.length+' pergunta'+(Q.length===1?'':'s');$('#sp3-eok').disabled=!Q.length;$('#sp3-ep').innerHTML=Q.slice(0,30).map((p,k)=>`<div><b>${k+1}.</b> ${(AR.TIPOS[p.tp]||{}).ic||''} ${esc(p.t)} <small class="mut">${p.tp==='rc'?'→ '+esc(p.a.join(' / ')):AR.tpOps(p.tp)?'→ '+esc(p.tp==='multi'?p.cs.map(k=>p.o[k]).join(', '):p.o[p.c]||''):''}</small></div>`).join('')};
  ta.oninput=ver;$('#sp3-ef').onclick=async()=>{const f=await sp3Escolher('.pdf,.docx,.txt,.md,.csv,text/plain,application/pdf');if(!f)return;try{ta.value=await sp3TextoDe(f);ver()}catch(e){toast('Não foi possível ler: '+e.message,'erro')}};
  $('#sp3-eok').onclick=()=>{if(c.perg.length===1&&!sp3Txt(c.perg[0].t))c.perg.length=0;c.perg.push(...Q);c.mod=Date.now();save();closeDrawer();re();toast(Q.length+' pergunta'+(Q.length>1?'s':'')+' juntada'+(Q.length>1?'s':''),'ok')}}

/* ---------- estilos ---------- */
(()=>{if(document.getElementById('sp3-css'))return;const st=document.createElement('style');st.id='sp3-css';st.textContent=`
html body .sp3qo{display:block}
html body .sp3ops{display:grid;grid-template-columns:1fr 1fr;gap:8px}
html body .sp3op{display:flex;align-items:center;gap:6px}
html body .sp3op input[data-so]{flex:1;min-width:0}
html body .sp3oth{position:relative;display:inline-flex}html body .sp3oth img{width:42px;height:42px;object-fit:cover;border-radius:6px}html body .sp3oth button{position:absolute;top:-6px;right:-6px;padding:1px}
html body .sp3mini{gap:6px;margin-top:6px}
html body .sp3lst{display:flex;flex-direction:column;gap:6px}html body .sp3lst .row{gap:6px;align-items:center}html body .sp3lst input{flex:1}
html body .sp3tag{font-size:12px;color:var(--mut,#64748b);min-width:110px}html body .sp3n{width:22px;text-align:center}
html body .sp3grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}html body .sp3grid label{display:flex;flex-direction:column;font-size:12px;gap:3px}
html body .sp3pino{position:relative;display:inline-block;max-width:100%;cursor:crosshair;line-height:0}html body .sp3pino img{max-width:100%;max-height:300px;border-radius:8px}
html body .sp3pino i{position:absolute;aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid #16a34a;background:rgba(22,163,74,.25);border-radius:50%;pointer-events:none}
html body .sp3ext{gap:8px;flex-wrap:wrap;align-items:center;padding:6px 0 2px}html body .sp3inl{display:flex;align-items:center;gap:6px;font-size:13px}
html body .sp3notas{flex:1 1 100%}html body .sp3notas summary{cursor:pointer;font-size:13px;color:var(--mut,#64748b)}html body .sp3notas textarea{width:100%;margin-top:4px}
html body .sp3menu{position:relative}html body .sp3pop{position:absolute;bottom:100%;left:0;z-index:30;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);box-shadow:0 10px 30px rgba(0,0,0,.18);border-radius:10px;padding:6px;display:grid;min-width:230px;margin-bottom:6px}
html body .sp3pop button{text-align:left;background:none;border:0;padding:7px 10px;border-radius:6px;cursor:pointer;color:inherit;font:inherit}html body .sp3pop button:hover{background:var(--hover,#f1f5f9)}
html body .sp3prev{margin-top:10px;display:flex;flex-direction:column;gap:4px;max-height:260px;overflow:auto;font-size:14px}
html body .sp3rel .sp3rq{padding:8px 0;border-top:1px solid var(--line,#e2e8f0)}html body .sp3rel .sp3rq small{display:block}
html body .sp3chips2{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}html body .sp3chip{background:var(--hover,#f1f5f9);padding:3px 9px;border-radius:999px;font-size:13px}
html body .sp3torl{display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto;margin:8px 0 12px}html body .sp3torl .row{gap:8px;align-items:center}
/* ecrã projetado */
#arhost .sp3bd{background:#dc2626;color:#fff;border-radius:999px;font-size:11px;padding:0 6px;margin-left:4px}
#arhost .arhb[aria-pressed="false"]{opacity:.55}
#arhost.sp3marca{background:var(--es-fundo,inherit)}#arhost.sp3marca .arhh{background:var(--es-marca,inherit)}
#arhost .arhlogo.sp3lg{display:flex;align-items:center;gap:8px}#arhost .arhlogo.sp3lg img{max-height:34px;max-width:140px;object-fit:contain}
#arhost .sp3chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;align-items:center}#arhost .sp3chips span{background:rgba(255,255,255,.16);padding:3px 10px;border-radius:999px;font-size:13px}
#arhost .sp3tg{background:#facc15;color:#1f2937;padding:1px 8px;border-radius:999px;font-size:12px;margin-left:6px}
#arhost .sp3acts{justify-content:center;gap:10px;margin-top:14px;flex-wrap:wrap}
#arhost .sp3vid{position:relative;width:min(760px,92%);aspect-ratio:16/9;margin:8px auto}#arhost .sp3vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:10px}
#arhost .sp3tiles .arhop{position:relative;overflow:hidden}#arhost .sp3opi{max-height:110px;max-width:100%;object-fit:contain;border-radius:6px;display:block;margin:4px auto}
#arhost .sp3eixo{display:flex;align-items:center;gap:10px;width:min(760px,92%);margin:10px auto;font-weight:700}#arhost .sp3eixo i{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.35)}
#arhost .sp3ord{width:min(640px,92%);margin:10px auto;display:flex;flex-direction:column;gap:8px;padding:0;list-style:none;counter-reset:o}
#arhost .sp3ord li{background:var(--oc);color:#fff;padding:10px 14px;border-radius:10px;font-weight:700;font-size:1.15em;counter-increment:o}#arhost .sp3ord.ok li::before{content:counter(o) '. '}
#arhost .sp3pinoh{position:relative;display:block;width:fit-content;max-width:min(860px,94%);margin:8px auto;line-height:0}#arhost .sp3pinoh img{max-width:100%;max-height:52vh;border-radius:10px}
#arhost .sp3pinoh b{position:absolute;aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid #22c55e;background:rgba(34,197,94,.22);border-radius:50%}
#arhost .sp3pinoh i{position:absolute;width:14px;height:14px;transform:translate(-50%,-50%);border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)}#arhost .sp3pinoh i.ok{background:#22c55e}
#arhost .sp3esc{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px}#arhost .sp3esc span{background:rgba(255,255,255,.16);padding:8px 12px;border-radius:8px;font-weight:600}
#arhost .sp3escreve{display:flex;align-items:center;gap:12px;justify-content:center;font-size:1.4em;opacity:.85;margin:18px 0}
#arhost .sp3sol{text-align:center;font-size:1.1em;margin:6px 0 10px}
#arhost .sp3bars{width:min(760px,94%);margin:0 auto;display:flex;flex-direction:column;gap:6px}#arhost .sp3bars div{position:relative;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;overflow:hidden}
#arhost .sp3bars span{position:relative;z-index:1;flex:1;font-weight:600}#arhost .sp3bars em{position:relative;z-index:1;font-style:normal;font-weight:800}#arhost .sp3bars i{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.18)}#arhost .sp3bars .ok i{background:rgba(34,197,94,.45)}
#arhost .sp3reg{position:relative;height:56px;width:min(760px,92%);margin:12px auto 0;background:rgba(255,255,255,.08);border-radius:10px}#arhost .sp3reg b{position:absolute;top:0;bottom:0;background:rgba(34,197,94,.35)}
#arhost .sp3reg i{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:#facc15;transform:translate(-50%,-50%);opacity:.85}#arhost .sp3reg u{position:absolute;top:-6px;bottom:-6px;width:4px;background:#22c55e;transform:translateX(-50%)}
#arhost .sp3cols{display:flex;gap:10px;justify-content:center;align-items:flex-end;height:240px;width:min(860px,94%);margin:0 auto}#arhost .sp3cols div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px}
#arhost .sp3cols i{width:100%;background:var(--a2,#0284c7);border-radius:8px 8px 0 0;min-height:4px}#arhost .sp3cols span{font-size:12px;text-align:center}#arhost .sp3cols em{font-style:normal;font-weight:800}
#arhost .sp3nuvem{display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;align-items:center;width:min(980px,96%);margin:6px auto;line-height:1.1}#arhost .sp3nuvem span{color:var(--oc);font-weight:800;cursor:pointer;filter:brightness(1.25)}#arhost .sp3nuvem sup{font-size:.4em;opacity:.8}
#arhost .sp3mural{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;width:min(1100px,96%);margin:6px auto;max-height:52vh;overflow:auto}
#arhost .sp3mural div{background:var(--oc);color:#fff;padding:12px;border-radius:10px;font-weight:600;cursor:pointer;position:relative;word-break:break-word}#arhost .sp3v{position:absolute;top:-8px;right:-6px;background:#facc15;color:#1f2937;border-radius:999px;padding:0 8px;font-size:14px}
#arhost .sp3slide .arhqt.sp3tit{font-size:3em;margin-top:12vh}#arhost .sp3sltx{font-size:1.35em;max-width:900px;margin:10px auto;text-align:center;line-height:1.5;white-space:normal}#arhost .sp3q.rev #arh-rel,#arhost .sp3slide #arh-rel{visibility:hidden}#arhost .sp3l-imagem .arhqi{max-height:70vh;width:auto}
#arhost .sp3rx{position:fixed;bottom:-40px;font-size:42px;z-index:60;pointer-events:none;animation:sp3sobe 3s ease-out forwards}
@keyframes sp3sobe{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-80vh) scale(1.2);opacity:0}}
#arhost .sp3qab{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:55;background:#fff;color:#1f2937;padding:12px 18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:min(900px,92%);display:flex;flex-direction:column;gap:2px;font-size:1.25em}#arhost .sp3qab small{font-size:.6em;color:#6b7280}
#arhost .sp3sheet{position:absolute;top:60px;right:12px;bottom:12px;width:min(420px,94vw);z-index:70;background:#fff;color:#1f2937;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}
#arhost .sp3sheet header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #e5e7eb}#arhost .sp3sheet .arhb{color:#1f2937}
#arhost .sp3opb,#arhost .sp3qal{padding:12px 14px;overflow:auto;display:flex;flex-direction:column;gap:10px}#arhost .sp3h{padding:8px 14px 0;margin:0;font-size:13px;color:#6b7280}
#arhost .sp3qai{border:1px solid #e5e7eb;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}#arhost .sp3qai.pendente{border-color:#f59e0b;background:#fffbeb}#arhost .sp3qai.destaque{border-color:#6d28d9;background:#f5f3ff}#arhost .sp3qai.respondida{opacity:.6}
#arhost .sp3qai small{display:block;color:#6b7280}#arhost .sp3qai .row{gap:6px;flex-wrap:wrap}
#arhost .sp3marcaf{border:1px solid #e5e7eb;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}#arhost .sp3marcaf label{display:flex;flex-direction:column;gap:2px;font-size:13px}#arhost .sp3mlg{max-height:40px;max-width:120px}
html body.est-sge .sp3pop,html body.est-sge .sp3pop button,html body.est-sge .sp3chip,html body.est-sge .sp3pino img,html body.est-sge .sp3oth img,html body.est-sge #arhost [class^="sp3"],html body.est-sge #arhost [class^="sp3"] *{border-radius:0!important}
`;document.head.appendChild(st)})();
