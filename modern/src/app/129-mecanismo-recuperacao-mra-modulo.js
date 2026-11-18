/* ===================== Mecanismo de Recuperação (MRA) por módulo — ensino profissional =====================
   A ficha original (folha A4 e PDF) é a mesma da app MRA: corre dentro de uma moldura, já preenchida com a turma,
   o formador, o formando, o módulo, as horas e as faltas. As fichas ficam guardadas na turma (t.mra[módulo][aluno]). */
const MRA_K={cur:'mra.atual.v1',reg:'mra.registos.v1',data:'mra.dados.v1',cfg:'mra.config.v1'};
let _mraHtml=null,_mraDef=null;
async function mraFonte(){if(_mraHtml)return _mraHtml;const h=await gunzipB64('mragz');if(!h)throw new Error('Este browser não consegue abrir a ficha MRA (sem descompressão).');_mraHtml=h;
  try{const i=h.indexOf('const DEFAULT_DATA=');const j=h.indexOf('\n',i);_mraDef=JSON.parse(h.slice(i+19,j).trim().replace(/;$/,''))}catch(_){_mraDef={cursos:[],formadores:[],disciplinas:[],modulos:[]}}return h}
const _nz=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const mraM=t=>t.mra=t.mra||{};
const mraCfgM=t=>t.mraCfg=t.mraCfg||{};
const mraAlLabel=a=>((a.processo||a.numInterno||a.num||'')+'').trim()?((a.processo||a.numInterno||a.num)+' - '+a.nome):a.nome;
const mraModLabel=m=>(m.cod?String(m.cod).padStart(/^\d+$/.test(m.cod)?3:0,'0')+' - ':'')+m.nome;
function mraCursoDef(t){const D=_mraDef||{cursos:[]};const cod=_nz(t.codigo||t.nome).split(' ')[0];return D.cursos.find(c=>_nz(c.nome).split(' ')[0]===cod)||D.cursos.find(c=>t.curso&&_nz(c.nome).includes(_nz(t.curso)))||null}
function mraCursoNome(t){const d=mraCursoDef(t);if(d)return d.nome;return [t.codigo||t.nome,t.curso||(t.cnq&&t.cnq.nome)||''].filter(Boolean).join(' - ')}
function mraFormador(){const D=_mraDef||{formadores:[]};const ps=[S.cfg.professor,profNome(S.cfg.professor)].map(_nz).filter(Boolean);if(!ps.length)return '';for(const p of ps){const L=D.formadores.find(f=>_nz(f).endsWith(p)||_nz(f).includes(p));if(L)return L}
  const w=ps[0].split(' ');const L=D.formadores.find(f=>{const z=_nz(f);return w.length>1&&z.includes(w[0])&&z.endsWith(w[w.length-1])});return L||S.cfg.professor}
function mraDisc(t){const D=_mraDef||{disciplinas:[]};const d=_nz(t.disciplina);return D.disciplinas.find(x=>_nz(x.replace(/^\s*\d+\s+-\s+/,''))===d)||D.disciplinas.find(x=>_nz(x).endsWith(d))||t.disciplina}
/* faltas do aluno nas datas do módulo (tempos registados na ficha do aluno e nas presenças das aulas) */
function mraFaltas(t,a,m){if(!m.ini&&!m.fim)return null;const ini=m.ini||'0000',fim=m.fim||'9999';
  return (a.faltasAl||[]).filter(f=>(f.tipo==='injust'||f.tipo==='just'||!f.tipo)&&f.data>=ini&&f.data<=fim).reduce((s,f)=>s+(+f.tempos||1),0)}
const mraCalc=(h,f)=>{h=parseFloat(h)||0;f=parseFloat(f)||0;const lim=Math.ceil(h/10-1e-9),ex=f-lim;return {lim,ex:ex>0?ex:0}};
function mraFichaNova(t,a,m){const k=mraCalc(m.horas,mraFaltas(t,a,m)||0);const disc=mraDisc(t),mod=mraModLabel(m);const n=Math.max(1,Math.min(k.ex||1,51));
  return {id:uid(),curso:mraCursoNome(t),formador:mraFormador(),formando:mraAlLabel(a),tipo:ofertaDe(t)==='profij'||/^UC/i.test(m.cod||'')?'UFCD/Unidade':'Módulo',horas:+m.horas||25,faltas:mraFaltas(t,a,m)||0,exame:'Não',data:isoHoje(),
    rows:Array.from({length:n},()=>({dt:'',disc,mod,ativ:'',parecer:''})),atualizado:null}}
function mraDados(t,m){const D=_clone(_mraDef||{cursos:[],formadores:[],disciplinas:[],modulos:[]});const c=mraCfgM(t);const d=mraCursoDef(t);const nome=mraCursoNome(t);
  const cur={nome,projeto:projetoDe(t),orientador:c.orientador!=null?c.orientador:(d?d.orientador:''),genero:c.genero||(d?d.genero:'F'),formandos:alunosAval(t).map(mraAlLabel)};
  D.cursos=D.cursos.filter(x=>x.nome!==nome);D.cursos.unshift(cur);const f=mraFormador();if(f&&!D.formadores.includes(f))D.formadores.unshift(f);
  const di=mraDisc(t);if(!D.disciplinas.includes(di))D.disciplinas.unshift(di);(t.modulos||[]).map(mraModLabel).reverse().forEach(x=>{if(!D.modulos.includes(x))D.modulos.unshift(x)});return D}
/* abrir a ficha original numa moldura, por cima da app */
async function mraAbrir(t,m,a){let html;try{html=await mraFonte()}catch(e){return toast(e.message,'erro')}
  const M=mraM(t);M[m.id]=M[m.id]||{};let F=M[m.id][a.id];if(!F){F=mraFichaNova(t,a,m)}else{F=_clone(F);F.formando=mraAlLabel(a);F.curso=mraCursoNome(t)}
  const ant={};Object.values(MRA_K).forEach(k=>{ant[k]=localStorage.getItem(k)});
  const reg=(M[m.id]._reg||[]);try{localStorage.setItem(MRA_K.cur,JSON.stringify(F));localStorage.setItem(MRA_K.data,JSON.stringify(mraDados(t,m)));localStorage.setItem(MRA_K.reg,JSON.stringify(Object.values(M[m.id]).filter(x=>x&&x.id&&x.guardada)));
    localStorage.setItem(MRA_K.cfg,JSON.stringify({anoModo:'manual',anoManual:(A()&&/^\d{4}\/\d{4}$/.test(A().nome)?A().nome:'')||''}))}catch(e){return toast('Sem espaço no browser para abrir a ficha','erro')}
  const css=`<style id="ef-mra">#side{display:none!important}#b-novo{display:none!important}#bar{padding-left:16px}
</style>`;
  const doc=html.replace('</head>',css+'</head>');
  const o=document.createElement('div');o.id='mraov';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Ficha MRA');
  const k=mraCalc(F.horas,F.faltas);
  o.innerHTML=`<div class="mrah"><button class="btn" type="button" id="mra-x">${ic('arrowL',16)} Voltar</button><div class="mrat"><b>${esc(a.nome)}</b><span>${esc(mraModLabel(m))} · ${esc(t.nome)} · ${esc(t.disciplina)}</span></div><span class="sp1"></span><span class="tag ${k.ex?'':'ok'}" id="mra-ex">${k.ex?'Excesso: '+k.ex+' h':'Sem reposição'}</span><span class="mut mras" id="mra-st">guardado automaticamente</span></div>
    <iframe id="mra-if" title="Ficha do Mecanismo de Recuperação" srcdoc=""></iframe>`;
  document.body.appendChild(o);document.body.classList.add('mra-on');const fr=o.querySelector('#mra-if');fr.srcdoc=doc;
  const guardar=()=>{try{const v=JSON.parse(localStorage.getItem(MRA_K.cur)||'null');if(!v)return;const R=JSON.parse(localStorage.getItem(MRA_K.reg)||'[]');v.guardada=R.some(x=>x.id===v.id)||!!(M[m.id][a.id]&&M[m.id][a.id].guardada);
      const vaz=!v.rows||!v.rows.some(r=>r.dt||r.ativ||r.parecer);const mud=JSON.stringify(v)!==JSON.stringify(F);if(!mud&&!M[m.id][a.id])return;M[m.id][a.id]=v;F=_clone(v);save();
      const kk=mraCalc(v.horas,v.faltas);const ex=$('#mra-ex');if(ex){ex.textContent=kk.ex?'Excesso: '+kk.ex+' h':'Sem reposição';ex.classList.toggle('ok',!kk.ex)}const st=$('#mra-st');if(st)st.textContent=v.guardada?'ficha guardada':vaz?'rascunho':'guardado automaticamente'}catch(e){console.warn(e)}};
  const onSt=e=>{if(e.key===MRA_K.cur||e.key===MRA_K.reg)guardar()};addEventListener('storage',onSt);const iv=setInterval(guardar,1500);
  const fechar=()=>{guardar();clearInterval(iv);removeEventListener('storage',onSt);document.removeEventListener('keydown',kb,true);Object.entries(ant).forEach(([k,v])=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(_){}});
    o.remove();document.body.classList.remove('mra-on');try{manterPosicao(()=>go(VIEW))}catch(_){go(VIEW)}};
  const kb=e=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();fechar()}};document.addEventListener('keydown',kb,true);
  o.querySelector('#mra-x').onclick=fechar;setTimeout(()=>o.querySelector('#mra-x').focus(),50)}
/* vista: Turma › Recuperação (MRA) */
function vMra(){const t=T();if(!t)return go('turmas');const U=unidMod(t);const v=$('#view');
  if(ofertaDe(t)==='profij'){go('precup');return}
  if(!ehModular(t)){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Só para turmas do ensino profissional e PROFIJ</b><br><span class="mut">O Mecanismo de Recuperação é feito por ${U.um}.</span></div>`;return}
  const M=t.modulos||[];if(!M.length){v.innerHTML=`<div class="card empty">${ic('layers',30)}<br><b>Esta turma ainda não tem ${U.p.toLowerCase()}</b><br><button class="btn pri" style="margin-top:10px" data-goview="modulos">${ic('plus',15)} Criar ${U.p}</button></div>`;v.querySelector('[data-goview]').onclick=()=>go('modulos');return}
  if(!_mraDef)mraFonte().then(()=>{if(VIEW==='mra')manterPosicao(vMra)}).catch(()=>{});
  const m=modAtivo(t);const al=alunosAval(t);const MM=(mraM(t)[m.id])||{};const c=mraCfgM(t);const d=_mraDef?mraCursoDef(t):null;const lim=mraCalc(m.horas,0).lim;const hj=isoHoje();
  const L=al.map(a=>{const F=MM[a.id];const auto=mraFaltas(t,a,m);const f=F?+F.faltas||0:(auto||0);const k=mraCalc(F?F.horas:m.horas,f);return {a,F,f,auto,k}});
  const nEx=L.filter(x=>x.k.ex).length,nG=L.filter(x=>x.F&&x.F.guardada).length,nR=L.filter(x=>x.F&&!x.F.guardada).length,hRec=L.reduce((s,x)=>s+x.k.ex,0);
  const fl=UI.mraF||'todos';const LL=fl==='ex'?L.filter(x=>x.k.ex):fl==='ficha'?L.filter(x=>x.F):L;
  barBtns([{id:'b-mrm',t:ic('pencil',15)+' Editar '+U.s,f:()=>{try{moduloDlg(t,m)}catch(_){go('modulos')}}},{id:'b-mrc',t:ic('download',15)+' Exportar CSV',f:()=>download('MRA '+t.nome+' '+(m.cod||'')+' '+m.nome+'.csv',csv([['N.º','Formando(a)','Horas','Faltas','Limite','Excesso','Ficha'],...L.map(x=>[x.a.num||'',x.a.nome,m.horas||'',x.f,lim,x.k.ex,x.F?(x.F.guardada?'Guardada':'Rascunho'):''])]),'text/csv')},{id:'b-mrp',t:ic('printer',15)+' Imprimir Lista',f:()=>window.print()}]);
  const dur=m.ini&&m.fim?Math.max(1,diasEntre(m.ini,m.fim)):null;const dec=dur&&hj>=m.ini?Math.min(100,Math.round(diasEntre(m.ini,hj<m.fim?hj:m.fim)/dur*100)):0;
  const ini=n=>{const w=n.split(' ').filter(Boolean);return ((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()};
  v.innerHTML=`${!t.porModulo?`<div class="modbar mramods" role="group" aria-label="${U.s}"><span class="modl">${ic('layers',15)} ${U.s}</span><div class="modch">${M.map((x,i)=>{const n=Object.values((mraM(t)[x.id])||{}).filter(F=>F&&mraCalc(F.horas,F.faltas).ex).length;return `<button type="button" class="modc ${x===m?'on':''}" data-mrasel="${x.id}" aria-pressed="${x===m}"><b>${esc(x.cod||String(i+1))}</b><span>${esc(x.nome)}</span><small>${x.horas?x.horas+' h':'sem horas'}${n?' · '+n+' MRA':''}</small></button>`}).join('')}</div></div>`:''}
    <div class="mralay"><div class="mramain">
    <section class="card mrahero"><div class="mrahl"><span class="mracod">${esc(m.cod||'—')}</span><div><h2>${esc(m.nome)}</h2><p class="mut">${esc(t.nome)} · ${esc(t.disciplina)}${t.curso?' · '+esc(t.curso):''}</p></div></div>
      <div class="mraf3"><label><span>Horas</span><input id="mr-h" inputmode="numeric" value="${esc(m.horas||'')}" placeholder="ex.: 25" class="${m.horas?'':'falta'}"></label><label><span>Início</span><input type="date" id="mr-i" value="${esc(m.ini||'')}"></label><label><span>Fim</span><input type="date" id="mr-f" value="${esc(m.fim||'')}"></label>
        <div class="mralim"><span>Limite de faltas</span><b>${m.horas?lim+' h':'—'}</b><small>10% das horas, arredondado para cima</small></div></div>
      ${dur?`<div class="mraprog"><span class="dprog lg"><i style="width:${dec}%"></i></span><small>${hj<m.ini?'começa a '+fmtIso(m.ini):hj>m.fim?'terminou a '+fmtIso(m.fim):dec+'% do tempo do '+U.um+' decorrido'}</small></div>`:`<p class="mranote">${ic('info',14)} Indique o início e o fim para as faltas registadas nesse intervalo serem contadas automaticamente.</p>`}
      ${!m.horas?`<p class="mranote warn">${ic('alert',14)} Sem horas definidas, não é possível calcular o limite nem o excesso.</p>`:''}</section>
    <div class="dkps mrakp"><div class="dkp"><span class="dkl">${ic('alert',15)} Com excesso</span><b class="dkv ${nEx?'bad':''}">${nEx}<small>/${al.length}</small></b><span class="dks">alunos acima do limite</span></div>
      <div class="dkp"><span class="dkl">${ic('clock',15)} A recuperar</span><b class="dkv">${hRec}<small> h</small></b><span class="dks">soma dos excessos</span></div>
      <div class="dkp"><span class="dkl">${ic('check',15)} Fichas</span><b class="dkv">${nG}<small> guardadas</small></b><span class="dks">${nR} em rascunho</span></div>
      <div class="dkp"><span class="dkl">${ic('file',15)} Por fazer</span><b class="dkv ${L.filter(x=>x.k.ex&&!x.F).length?'bad':''}">${L.filter(x=>x.k.ex&&!x.F).length}</b><span class="dks">alunos com excesso sem ficha</span></div></div>
    <section class="card"><div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:10px"><h2 style="margin:0">${ic('users',18)} Formandos</h2><span class="sp1"></span><div class="dseg" role="radiogroup" aria-label="Filtrar">${[['todos','Todos',L.length],['ex','Com excesso',nEx],['ficha','Com ficha',nG+nR]].map(([k,n,c])=>`<button type="button" role="radio" aria-checked="${fl===k}" class="${fl===k?'on':''}" data-mrafl="${k}">${n} <span class="mrac">${c}</span></button>`).join('')}</div></div>
      ${!al.length?`<div class="empty" style="padding:22px">${ic('users',26)}<br><b>Ainda sem alunos nesta turma</b><br><button class="btn pri" style="margin-top:10px" data-goview="alunos">${ic('plus',14)} Acrescentar Alunos</button></div>`:!LL.length?`<p class="mut" style="padding:10px 4px">Nenhum aluno neste filtro.</p>`:
      `<ul class="mral">${LL.map(({a,F,f,auto,k})=>{const pc=lim?Math.min(100,f/(lim*2)*100):0;const fo=fotoSrc(a);return `<li class="${k.ex?'ex':''}"><span class="mrav">${fo?`<img src="${esc(fo)}" alt="">`:esc(ini(a.nome))}</span><div class="mran"><b>${esc(a.nome)}</b><small>${a.num?'n.º '+esc(numAl(a)):''}${auto!=null&&!F?' · faltas contadas automaticamente':''}</small></div>
        <div class="mrafw"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="-1" aria-label="Menos uma falta">−</button><input class="mraf" data-mraf="${a.id}" value="${esc(f)}" inputmode="numeric" aria-label="Faltas de ${esc(a.nome)}"><button type="button" class="btn sm ico" data-mrad="${a.id}" data-dlt="1" aria-label="Mais uma falta">+</button></div>
        <div class="mram" title="${f} h de faltas · limite ${lim} h"><span class="mrab"><i style="width:${pc}%"></i><b style="left:50%"></b></span><small>${f} / ${lim} h</small></div>
        <span class="mrae">${k.ex?`<span class="tag bad">+${k.ex} h</span>`:'<span class="tag ok">ok</span>'}</span>
        <span class="mras">${F?(F.guardada?`<span class="tag ok">${ic('check',11)} Guardada</span>`:'<span class="tag">Rascunho</span>'):'<span class="mut">—</span>'}</span>
        <span class="mraa"><button class="btn sm ${k.ex&&!F?'pri':''}" data-mraab="${a.id}">${ic('file',13)} ${F?'Abrir':'Ficha'}</button>${F?`<button class="btn sm ico" data-mradel="${a.id}" aria-label="Apagar ficha de ${esc(a.nome)}">${ic('trash',13)}</button>`:''}</span></li>`}).join('')}</ul>`}
    </section></div>
    <aside class="mraside"><section class="card"><div class="row" style="gap:8px;margin-bottom:10px"><h2 style="margin:0">${ic('gear',16)} Dados da Ficha</h2><span class="sp1"></span><button class="btn sm" type="button" id="mra-edt">${ic('pencil',13)} Editar Turma</button></div>
      <dl class="mradl"><dt>Projeto N.º</dt><dd>${projetoDe(t)?esc(projetoDe(t)):'<span class="bad">por definir</span>'} <span class="mut">(${esc(A().nome)})</span></dd>
      <dt>Curso</dt><dd>${esc(_mraDef?mraCursoNome(t):(turmaDado(t,'cursoFicha')||'…'))}</dd>
      <dt>${turmaDado(t,'genero')==='M'?'Orientador':'Orientadora'}</dt><dd>${turmaDado(t,'orientador')?esc(turmaDado(t,'orientador')):'<span class="bad">por definir</span>'}</dd>
      <dt>Formador(a)</dt><dd>${esc(_mraDef?mraFormador():profNome(S.cfg.professor)||'')}</dd><dt>Disciplina</dt><dd>${esc(_mraDef?mraDisc(t):t.disciplina)}</dd></dl>
      <p class="mut" style="font-size:12px;margin:10px 0 0">Estes dados vêm das definições da turma (comuns a todas as disciplinas da turma neste ano letivo).</p></section>
      <section class="card mrahow"><h2 style="margin:0 0 8px">${ic('info',16)} Como Funciona</h2><ol><li>As faltas acima de <b>10% das horas</b> do ${U.um} têm de ser recuperadas.</li><li>O excesso define o número de linhas (sessões) da ficha.</li><li><b>Ficha</b> abre a folha oficial já preenchida; imprima ou exporte em PDF para assinar.</li><li>As fichas ficam guardadas na turma, por ${U.um} e por aluno.</li></ol></section></aside></div>`;
  const re=()=>manterPosicao(vMra);
  v.querySelectorAll('[data-mrasel]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.mrasel);vMra()});
  v.querySelectorAll('[data-mrafl]').forEach(b=>b.onclick=()=>{UI.mraF=b.dataset.mrafl;re()});
  v.querySelectorAll('[data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));
  [['mr-h','horas',x=>+String(x).replace(/\D/g,'')||''],['mr-i','ini',x=>x],['mr-f','fim',x=>x]].forEach(([id,k,f])=>{const e=$('#'+id);if(e)e.onchange=()=>{m[k]=f(e.value);save();re()}});
  const setF=(a,val)=>{const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};val=Math.max(0,val);if(MMm[a.id]){MMm[a.id].faltas=val;const k=mraCalc(MMm[a.id].horas,val);const R=MMm[a.id].rows||[];const r0=R[0]||{};while(R.length<Math.min(k.ex||1,51))R.push({dt:'',disc:r0.disc||'',mod:r0.mod||'',ativ:'',parecer:''})}else{MMm[a.id]=Object.assign(mraFichaNova(t,a,m),{faltas:val});const k=mraCalc(MMm[a.id].horas,val);const r0=MMm[a.id].rows[0];MMm[a.id].rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...r0}))}save();re()};
  v.querySelectorAll('[data-mraf]').forEach(i=>i.onchange=()=>setF(al.find(x=>x.id===i.dataset.mraf),+String(i.value).replace(',','.')||0));
  v.querySelectorAll('[data-mrad]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mrad);const cur=L.find(x=>x.a===a).f;setF(a,cur+(+b.dataset.dlt))});
  v.querySelectorAll('[data-mraab]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mraab);const MMm=mraM(t)[m.id]=mraM(t)[m.id]||{};if(!MMm[a.id]){const f=L.find(x=>x.a===a).f;const F=mraFichaNova(t,a,m);F.faltas=f;const k=mraCalc(F.horas,f);F.rows=Array.from({length:Math.max(1,Math.min(k.ex||1,51))},()=>({...F.rows[0]}));MMm[a.id]=F;save()}mraAbrir(t,m,a)});
  v.querySelectorAll('[data-mradel]').forEach(b=>b.onclick=()=>{const a=al.find(x=>x.id===b.dataset.mradel);if(!confirm('Apagar a ficha MRA de '+a.nome+' neste '+U.um+'?'))return;delete mraM(t)[m.id][a.id];save();re()});
  {const e=$('#mra-edt');if(e)e.onclick=()=>{editarTurmaDlg(t);const obs=new MutationObserver(()=>{if(!$('#drawer.on')){obs.disconnect();if(VIEW==='mra')manterPosicao(vMra)}});obs.observe($('#drawer'),{attributes:true,attributeFilter:['class']})}}}
TITLES.mra='Recuperação (MRA)';NEEDS_T.push('mra');MOD_VISTAS.add('mra');
{const _gR=go;go=function(v){const r=_gR.apply(this,arguments);if(go._f&&!go._f.mra)go._f.mra=vMra;try{navMra()}catch(_){}return r}}
function navMra(){const t=T();const on=!!t&&ehProfT(t);$$('#side [data-v="mra"],#tnavHold [data-v="mra"]').forEach(b=>{b.hidden=!on;b.style.display=on?'':'none'})}
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="modulos"]');if(ref&&!h.querySelector('[data-v="mra"]')){ref.insertAdjacentHTML('afterend',`<button class="nav tnav" data-v="mra" title="Mecanismo de Recuperação (faltas por módulo)" hidden><span data-ico="refresh"></span><span class="lbl">Recuperação (MRA)</span></button>`);const b=h.querySelector('[data-v="mra"] [data-ico]');if(b)b.innerHTML=ic('refresh',18);h.querySelector('[data-v="mra"]').onclick=()=>go('mra')}}
/* atalho na lista de módulos */
{const _vmR=vModulos;vModulos=function(){const r=_vmR.apply(this,arguments);try{const t=T();if(t&&ehProfT(t)&&(t.modulos||[]).length){$$('#view table.modlst tbody tr').forEach((tr,i)=>{const m=t.modulos[i];const cel=tr.lastElementChild;if(m&&cel&&!cel.querySelector('[data-modmra]'))cel.insertAdjacentHTML('afterbegin',`<button class="btn sm ico" data-modmra="${m.id}" title="Mecanismo de Recuperação (MRA)" aria-label="Recuperação de ${esc(m.nome)}">${ic('refresh',14)}</button>`)});
  $$('[data-modmra]').forEach(b=>b.onclick=()=>{modEscolher(t,b.dataset.modmra);go('mra')})}}catch(e){console.warn(e)}return r}}
AJUDA.push({id:'mra',ic:'refresh',t:'Mecanismo de Recuperação (MRA) por módulo',gif:null,txt:`<p>Nas turmas do ensino profissional, Turma › <b>Recuperação (MRA)</b> mostra, para cada módulo, as faltas de cada aluno, o limite (10% das horas, arredondado para cima) e o excesso. <b>Preencher Ficha</b> abre a ficha oficial do Mecanismo de Recuperação (a mesma folha da app MRA, com Imprimir e Exportar PDF), já com o curso, o formador, o formando, a disciplina, o módulo, as horas e as faltas. A ficha guarda-se sozinha na turma.</p>`});


/* botão de bloqueio também na barra de cima */
function bloqBarBtn(){const aj=$('#ajBtn');if(!aj)return;let b=$('#bloqBar');const tem=S.anos.some(a=>a.turmas.length);
  if(!tem){if(b)b.remove();return}if(!b){aj.insertAdjacentHTML('beforebegin','<button class="btn ico" id="bloqBar" type="button"></button>');b=$('#bloqBar');b.onclick=()=>bloqAlternar(!bloqOn())}
  const on=bloqOn();b.classList.toggle('bloqon',on);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Dados de base bloqueados — desbloquear':'Bloquear dados de base');b.title=on?'Dados de base bloqueados — toque para desbloquear':'Bloquear turmas, alunos, critérios, horários e calendário';if(b._bq!==on||!b.firstChild){b._bq=on;b.innerHTML=ic(on?'cadeado':'cadeadoAb',18)}}
{const _bu=bloqUI;bloqUI=function(){const r=_bu.apply(this,arguments);try{bloqBarBtn()}catch(_){}return r}}
setTimeout(()=>{try{bloqBarBtn()}catch(_){}},60);


/* avisos: também o que há de especial hoje (aniversários, feriados, dias nacionais e internacionais, fim de semana) */
function avisosHoje(){const d=new Date(),iso=isoHoje(),md=iso.slice(5);const V=avVistos(),agora=Date.now();const ok=k=>!(V[k]&&V[k]>agora);const out=[];const add=(k,o)=>{k='h:'+iso+':'+k;if(ok(k))out.push({k,...o})};
  try{const p=perfil();if(p.nascimento&&p.nascimento.slice(5)===md)add('anos',{ic:'sparkle',cor:'#d4a20b',t:'Hoje é o seu aniversário! Parabéns 🎂',s:'Um dia para celebrar — o trabalho pode esperar.'})}catch(_){}
  const a=A();if(a){const N=[];a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nasc&&x.nasc.slice(5)===md&&x.frequenta!==false&&!N.some(n=>n.id===x.id))N.push({id:x.id,n:x.nome.split(' ')[0]+' '+(x.nome.split(' ').slice(-1)[0]||''),t:t.nome})}));
    if(N.length)add('alanos',{ic:'users',cor:'#7a4fd0',t:N.length===1?'Aniversário de '+N[0].n:N.length+' aniversários de alunos',s:N.slice(0,5).map(x=>x.n+' ('+x.t+')').join(' · ')+(N.length>5?' …':''),ir:()=>go('alunos')});
    const cal=a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const nota=cal&&cal.notas&&cal.notas[iso];if(tp&&tp!=='letivo'&&TIPOS_DIA[tp])add('cal',{ic:'flag',cor:'#c0392b',t:nomeTipo(tp),s:nota||'Calendário escolar',ir:()=>go('calendario')})}
  const todos=[...(DIAS_COMEM[md]||[])];(diasMoveis(d.getFullYear())[iso]||[]).forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  if(nac.length)add('nac',{ic:'flag',cor:'#0a5aa8',t:nac.length===1?nac[0]:'Dias nacionais',s:nac.length===1?'Dia nacional':nac.join(' · ')});
  if(int.length)add('int',{ic:'globo',cor:'#0f766e',t:int.length===1?int[0]:'Dias internacionais',s:int.length===1?'Dia internacional':int.join(' · ')});
  const pz=piadaHoje(d);if(pz)add('pz',{ic:'sparkle',cor:'#f59e0b',t:pz,s:d.getDay()===0?'É domingo':'É sábado'});
  return out}
{const _auH=avisosUrgentes;avisosUrgentes=function(){const L=_auH.apply(this,arguments)||[];try{L.push(...avisosHoje())}catch(e){console.warn(e)}return L}}


