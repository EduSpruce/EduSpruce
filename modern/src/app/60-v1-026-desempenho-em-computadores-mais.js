/* ===================== v1.026 · Desempenho em computadores mais antigos =====================
   1) As regras de estilo com :has() sobre o atributo style obrigavam a recalcular o estilo da página inteira a cada medição do
      cabeçalho (até 10 s a abrir «Aulas e sumários» num PC antigo) — foram retiradas.
   2) Modo leve (Definições › Aparência › Desempenho): sem desfoques de vidro, sombras e animações. Liga-se sozinho em computadores
      com poucos recursos ou quando o ecrã fica lento; pode forçar-se «Leve» ou «Normal» neste dispositivo. */
const LEVE_K='es.leve';const leveCfg=()=>{try{return localStorage.getItem(LEVE_K)||'auto'}catch(_){return 'auto'}};
let LEVE_AUTO=false;try{const c=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;if(c<=2||m<=2)LEVE_AUTO=true}catch(_){}
try{if(localStorage.getItem('es.leveAuto')==='1')LEVE_AUTO=true}catch(_){}
const leveAtivo=()=>{const v=leveCfg();return v==='on'||(v==='auto'&&LEVE_AUTO)};
function leveAplicar(){const on=leveAtivo();const r=document.documentElement;r.classList.toggle('leve',on);if(on)r.classList.add('a11y-rm')}
{const _aaL=animAplicar;animAplicar=function(){const r=_aaL.apply(this,arguments);try{leveAplicar()}catch(_){}return r}}
leveAplicar();
/* medição automática: 120 imagens do ecrã depois de a app sossegar; se mais de metade forem lentas, liga o modo leve */
setTimeout(function leveMedir(){if(leveCfg()!=='auto'||LEVE_AUTO||document.hidden)return;let n=0,lentos=0,prev=0;const f=t=>{if(document.hidden)return;if(prev&&t-prev>40)lentos++;prev=t;if(++n<120)requestAnimationFrame(f);else if(lentos>60){LEVE_AUTO=true;try{localStorage.setItem('es.leveAuto','1')}catch(_){}leveAplicar();toast('Modo leve ligado: este computador estava lento. Pode mudar em Definições › Aparência.','ok')}};requestAnimationFrame(f)},9000);
function cartaoLeve(){const v=leveCfg();const o=(k,n,d)=>`<button type="button" role="radio" aria-checked="${v===k}" class="anopt ${v===k?'on':''}" data-lv="${k}"><b>${n}</b><small>${d}</small></button>`;
  return `<div class="card" id="lv-cfg"><div class="row" style="gap:10px;flex-wrap:wrap"><h2 style="margin:0">${ic('sliders',18)} Desempenho</h2><span class="sp1"></span><span class="mut" style="font-size:13px">Só neste dispositivo${v==='auto'?' · agora: '+(LEVE_AUTO?'leve':'normal'):''}</span></div>
  <div class="angrid" role="radiogroup" aria-label="Desempenho">${o('auto','Automático','Liga o modo leve sozinho em computadores mais antigos ou lentos.')}${o('on','Leve','Sem desfoques de vidro, sombras nem animações — mais rápido em PCs antigos e quadros interativos.')}${o('off','Normal','Aspeto completo, com todos os efeitos.')}</div></div>`}
{const _vdL=vDefinicoes;vDefinicoes=function(){const r=_vdL.apply(this,arguments);try{if((UI.defTab||'geral')==='aparencia'&&!$('#lv-cfg')){const c=$('#an-cfg')||$('#view .card');if(c){c.insertAdjacentHTML($('#an-cfg')?'afterend':'beforebegin',cartaoLeve());$$('#lv-cfg [data-lv]').forEach(b=>b.onclick=()=>{try{localStorage.setItem(LEVE_K,b.dataset.lv);if(b.dataset.lv!=='auto')localStorage.removeItem('es.leveAuto')}catch(_){}if(b.dataset.lv==='auto'){LEVE_AUTO=false;try{const c2=navigator.hardwareConcurrency||8,m2=navigator.deviceMemory||8;if(c2<=2||m2<=2)LEVE_AUTO=true}catch(_){}}try{animAplicar()}catch(_){leveAplicar()}go('definicoes');toast('Desempenho: '+({auto:'automático',on:'leve',off:'normal'})[b.dataset.lv],'ok')})}}}catch(e){console.warn(e)}return r}}

/* ===================== v1.026 · Disciplinas e UFCD (PROFIJ): explicação clara, várias por turma, sem pautas repetidas =====================
   Num curso PROFIJ o professor pode lecionar, na mesma turma e no mesmo ano, várias disciplinas (sociocultural/científica) e várias
   UFCD (componente tecnológica). Cada disciplina tem a sua pauta; as UFCD ficam todas numa única pauta «Componente Tecnológica (UFCD)»,
   uma unidade por UFCD (horas, datas e classificação próprias). Se acrescentar mais UFCD a uma turma que já tem essa pauta, juntam-se
   à pauta existente em vez de criar outra igual. No menu, a pauta das UFCD mostra os códigos das UFCD. */
const UFCD_EXPL=`<details class="ntexp" open><summary>${ic('info',14)} <b>Disciplinas e UFCD — como funciona</b></summary>
  <ul><li><b>Disciplina</b> (componentes sociocultural e científica, ex.: Comunicar em Inglês, Matemática Aplicada): cada uma tem a <b>sua pauta</b>, com critérios e instrumentos próprios.</li>
  <li><b>UFCD</b> (Unidade de Formação de Curta Duração, componente tecnológica): todas as UFCD que leciona nesta turma ficam numa <b>única pauta</b> «Componente Tecnológica (UFCD)», <b>uma unidade por UFCD</b> — cada uma com horas, datas, instrumentos e classificação (0–20) próprios.</li>
  <li>Pode lecionar <b>várias disciplinas e várias UFCD na mesma turma e no mesmo ano</b>: assinale todas abaixo (ou acrescente depois com «+ Disciplina»). Os alunos são copiados para cada pauta.</li>
  <li>Se a turma <b>já tiver</b> a pauta das UFCD, as novas UFCD juntam-se a ela — nunca fica com duas pautas iguais.</li>
  <li>As turmas que <b>só coordena</b> (Coord. PROFIJ) não se criam aqui: ficam na Coordenação, separadas da sua docência.</li></ul></details>`;
{const _ntU=novaTurmaDlg;novaTurmaDlg=function(r){const res=_ntU.apply(this,arguments);try{const w=$('#nt-maisw');if(w&&!$('#nt-expl')){w.insertAdjacentHTML('beforebegin',`<div id="nt-expl">${UFCD_EXPL}</div>`);
      const ver=()=>{const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';const e=$('#nt-expl');if(e)e.hidden=of!=='profij'&&of!=='profissional'};ver();
      const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ver,0))}}catch(e){console.warn(e)}return res}}
/* rótulo da pauta das UFCD no menu: os códigos das UFCD (em vez do nome comprido da componente) */
function ufcdRotulos(){const a=A();if(!a)return;const tree=$('#tTree');if(!tree)return;
  tree.querySelectorAll('[data-tt]').forEach(b=>{const t=(a.turmas||[]).find(x=>x.id===b.dataset.tt);if(!t||!ehComp(t.disciplina))return;const M=(t.modulos||[]).filter(m=>m&&(m.cod||m.nome));if(!M.length)return;
    const cods=M.map(m=>String(m.cod||'').replace(/^UFCD\s*/i,'').trim()||m.nome.slice(0,14));const txt=(t.disciplina===UC_N?'UC ':'UFCD ')+cods.slice(0,3).join(', ')+(cods.length>3?' +'+(cods.length-3):'');
    const el=b.querySelector('.tdisc')||(b.classList.contains('tdsb')?b.querySelector('.lbl'):null);if(el){el.textContent=txt;b.title=t.nome+' · '+t.disciplina+' — '+M.map(m=>(m.cod?m.cod+' ':'')+m.nome).join('; ')}})}
/* pautas das UFCD repetidas na mesma turma (criadas de novo com «+ Disciplina»): as UFCD juntam-se à pauta que já existia */
function ufcdFundir(){const a=A();if(!a)return 0;const L=a.turmas.__real||a.turmas;let n=0;const G={};
  L.forEach(t=>{if(!ehComp(t.disciplina))return;const k=normTurma(t.nome)+'|'+escId(escolaDe(t))+'|'+t.disciplina;(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(g=>{if(g.length<2)return;const base=g[0];g.slice(1).forEach(t=>{const comNotas=(t.instrumentos||[]).some(i=>i.notas&&Object.keys(i.notas).length);if(comNotas)return;
      base.modulos=base.modulos||[];(t.modulos||[]).forEach(m=>{const ja=base.modulos.some(x=>(m.cod&&x.cod&&String(x.cod).replace(/\D/g,'')===String(m.cod).replace(/\D/g,''))||normT(x.nome)===normT(m.nome));if(!ja)base.modulos.push(m)});
      try{const H=a.horProf;if(H&&H.mapa)Object.keys(H.mapa).forEach(k=>{if(H.mapa[k]===t.id)H.mapa[k]=base.id})}catch(_){}
      const j=L.indexOf(t);if(j>=0)L.splice(j,1);if(S.turmaAtiva===t.id)S.turmaAtiva=base.id;n++})});
  if(n){save();setTimeout(()=>toast('As UFCD novas juntaram-se à pauta «Componente Tecnológica» que a turma já tinha','ok'),80)}return n}
{const _gU=go;go=function(v){try{if(v==='turmas'||v==='painel'||v==='modulos'||v==='inicio')ufcdFundir()}catch(e){console.warn(e)}return _gU.apply(this,arguments)};if(_gU._f)go._f=_gU._f}

/* ===================== v1.026 · Coordenação ≠ docência (Coord. PROFIJ) =====================
   As turmas que o professor só coordena (sem lecionar) ficam na Coordenação — não aparecem nas suas turmas, horário, sumários,
   avaliação nem no Início. As turmas onde leciona continuam a ser a sua docência; na Coordenação mostram de onde vêm. */
const cpCoordT=()=>{const {y}=CP();return y.coordT=Array.isArray(y.coordT)?y.coordT:[]};
{const _cpCl=cpClasses;cpClasses=function(a){const R=_cpCl.apply(this,arguments);try{const L=cpCoordT();R.forEach(c=>{c.doc=true});
    L.forEach(ct=>{const ex=R.find(c=>normTurma(c.nome)===normTurma(ct.nome));if(ex){ex.coordT=ct.id;return}const al={};(ct.alunos||[]).forEach(x=>{const k=cpAlKey(x);al[k]={k,nome:x.nome,num:x.num,ref:x,t:null}});
      R.push({nome:ct.nome,disc:[],al,curso:ct.curso||'',anoEsc:ct.anoEsc||'',formandos:Object.values(al).sort((p,q)=>(+p.num||0)-(+q.num||0)||p.nome.localeCompare(q.nome,'pt')),soCoord:true,coordT:ct.id})});
    R.sort((p,q)=>p.nome.localeCompare(q.nome,'pt',{numeric:true}))}catch(e){console.warn(e)}return R}}
function cpCoordDlg(id){const L=cpCoordT();const ct=L.find(x=>x.id===id)||{id:'',nome:'',curso:'',anoEsc:'',alunos:[]};const novo=!ct.id;
  openDrawer(novo?'Turma Só de Coordenação':'Editar Turma de Coordenação',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('info',13)} Para turmas que <b>coordena mas onde não leciona</b>. Ficam só na Coordenação PROFIJ — não entram nas suas turmas, horário, sumários, avaliação nem no Início. As médias das disciplinas dos colegas escrevem-se nas células da tabela (Turmas e Formandos).</p>
    <div class="row" style="gap:10px"><div style="flex:1"><label>Turma</label><input id="cc-n" value="${esc(ct.nome)}" placeholder="ex.: PROFIJ II B"></div><div style="flex:1"><label>Ano de escolaridade</label><input id="cc-a" value="${esc(ct.anoEsc||'')}" placeholder="ex.: 9.º"></div></div>
    <label>Curso</label><input id="cc-c" value="${esc(ct.curso||'')}" placeholder="ex.: Técnico de Informática">
    <label>Formandos <span class="mut">(um por linha: n.º ; nome ; n.º de processo — ou cole do Excel)</span></label>
    <textarea id="cc-f" rows="9" placeholder="1 ; Nome do formando ; 1234">${esc((ct.alunos||[]).map(x=>[x.num||'',x.nome,x.processo||''].join(' ; ')).join('\n'))}</textarea>
    <div class="row" style="margin-top:12px">${novo?'':`<button class="btn" id="cc-del">${ic('trash',14)} Apagar</button>`}<span class="sp1"></span><button class="btn pri" id="cc-ok">${ic('check',15)} Guardar</button></div></div>`);
  $('#cc-ok').onclick=()=>{const nome=$('#cc-n').value.trim();if(!nome)return toast('Indique o nome da turma','erro');
    const al=$('#cc-f').value.split('\n').map(l=>l.trim()).filter(Boolean).map((l,k)=>{const p=l.split(/\t|;/).map(x=>x.trim());let num='',nm='',pr='';if(p.length>=2){num=/^\d+$/.test(p[0])?p[0]:'';nm=num?p[1]:p[0];pr=(num?p[2]:p[1])||''}else{const m=l.match(/^(\d+)\s+(.+)$/);num=m?m[1]:String(k+1);nm=m?m[2]:l}
      const ex=(ct.alunos||[]).find(x=>normT(x.nome)===normT(nm));return {id:ex?ex.id:uid()+k,num:num||String(k+1),nome:nm,processo:pr}}).filter(x=>x.nome);
    Object.assign(ct,{nome,curso:$('#cc-c').value.trim(),anoEsc:$('#cc-a').value.trim(),alunos:al});if(novo){ct.id=uid();L.push(ct)}save();try{audit('Coord. PROFIJ',novo?'Turma de coordenação criada':'Turma de coordenação editada',nome)}catch(_){}closeDrawer();vCProfij();toast('Guardado · '+al.length+' formando(s)','ok')};
  const d=$('#cc-del');if(d)d.onclick=()=>{if(!confirm('Apagar a turma de coordenação «'+ct.nome+'»? (não mexe nas suas turmas de docência)'))return;L.splice(L.indexOf(ct),1);save();closeDrawer();vCProfij()}}
{const _vcp=vCProfij;vCProfij=function(){const r=_vcp.apply(this,arguments);try{if((UI.cpTab||'painel')==='turmas'){const v=$('#view');const alvo=v&&v.querySelector('p.hint');const C=cpClasses(A());const L=cpCoordT();
      const box=`<section class="card cpsep"><div class="row" style="gap:10px;flex-wrap:wrap"><h3 style="margin:0">${ic('layers',16)} Docência e coordenação, separadas</h3><span class="sp1"></span><button class="btn sm" id="cc-add">${ic('plus',14)} Turma Só de Coordenação</button></div>
        <div class="cpsepg"><div><b>${ic('book',14)} Turmas onde leciona</b><p class="mut">${C.filter(c=>c.doc).map(c=>esc(c.nome)+' <span class="tag">'+c.disc.map(t=>esc(ehComp(t.disciplina)?'UFCD':t.disciplina)).join(', ')+'</span>').join(' · ')||'nenhuma'}</p><small class="mut">Vêm das suas turmas (Ano letivo e turmas). As médias das suas disciplinas entram sozinhas.</small></div>
        <div><b>${ic('crown',14)} Turmas que só coordena</b><p class="mut">${L.map(ct=>`<button type="button" class="linkb" data-cced="${ct.id}">${esc(ct.nome)}</button> <span class="tag">${(ct.alunos||[]).length} formandos</span>`).join(' · ')||'nenhuma'}</p><small class="mut">Não aparecem nas suas turmas, horário, sumários nem avaliação.</small></div></div></section>`;
      if(alvo)alvo.insertAdjacentHTML('afterend',box);else{const c=v&&v.querySelector('.cpgs');if(c)c.insertAdjacentHTML('afterend',box)}
      const ad=$('#cc-add');if(ad)ad.onclick=()=>cpCoordDlg('');$$('[data-cced]').forEach(b=>b.onclick=()=>cpCoordDlg(b.dataset.cced));
      v.querySelectorAll('.card h3, .card .cph, .card b').forEach(h=>{const tx=h.textContent.trim();const c=C.find(x=>x.soCoord&&tx===x.nome);if(c&&!h.querySelector('.tag.cpso'))h.insertAdjacentHTML('beforeend',' <span class="tag cpso">só coordenação</span>')})}}catch(e){console.warn(e)}return r}}

/* ===================== v1.026 · Dados de demonstração: tudo o que há na app, em 3 anos letivos =====================
   Além do ano atual (com todas as turmas, PROFIJ, escola profissional, jornal, reuniões…), cria os dois anos letivos anteriores com os
   mesmos alunos um ano mais novos (turmas do ano anterior), os três períodos completos com classificações e sumários, e ainda
   exemplos na Biblioteca, Contactos e SpruceNote. Tudo inventado — nenhum dado real. */
function demoAnoAnterior(a0,k){const DIA=864e5,SH=364*k;
  const desl=iso=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-SH);return d.toISOString().slice(0,10)};
  let j=JSON.stringify(a0);
  /* ids novos (ano a ano não se misturam) */
  const ids=new Set();(function walk(o){if(Array.isArray(o))o.forEach(walk);else if(o&&typeof o==='object')Object.entries(o).forEach(([kk,v])=>{if((kk==='id'||kk==='cid')&&typeof v==='string'&&v.length>=8)ids.add(v);walk(v)})})(JSON.parse(j));
  [...ids].sort((x,y)=>y.length-x.length).forEach(id=>{if(id.startsWith('doc:'))return;j=j.split(id).join(uid()+Math.random().toString(36).slice(2,5))});
  j=j.replace(/\b(20\d\d)-(\d\d)-(\d\d)\b/g,m=>desl(m)).replace(/\b(20\d\d)\/(20\d\d)\b/g,(m,x,y)=>(+x-k)+'/'+(+y-k)).replace(/\b1[6-9]\d{11}\b/g,m=>String(+m-SH*DIA));
  /* turmas do ano anterior: os mesmos alunos, um ano mais novos */
  const REN=k===1?[['11.º B/C','10.º B/C'],['11.º B','10.º B'],['11.º C','10.º C'],['10.º A','9.º A'],['9.º B','8.º B'],['7.º A','6.º A'],['TT 2','TT 1']]:[['11.º B/C','9.º B/C'],['11.º B','9.º B'],['11.º C','9.º C'],['10.º A','8.º A'],['9.º B','7.º B'],['7.º A','5.º A']];
  REN.forEach(([x],q)=>{j=j.split(x).join('\u0001'+q+'\u0001')});REN.forEach(([,y],q)=>{j=j.split('\u0001'+q+'\u0001').join(y)});
  const b=JSON.parse(j);
  /* chaves com o nome normalizado da turma (horário: «7a|ing», n.º de projeto…) */
  const RN=REN.map(([o,n])=>[normTurma(o),normTurma(n)]);const rk=kk=>{const p=String(kk).split('|');const e=RN.find(([o])=>o===p[0]);return e?[e[1],...p.slice(1)].join('|'):kk};
  (function walk(o){if(Array.isArray(o))o.forEach(walk);else if(o&&typeof o==='object')Object.keys(o).forEach(kk=>{const v=o[kk];const n2=rk(kk);if(n2!==kk){o[n2]=v;delete o[kk]}walk(v)})})(b);
  b.id=uid();b.demo=true;b.passado=true;const y0=new Date().getMonth()>=8?new Date().getFullYear():new Date().getFullYear()-1;b.nome='Demonstração '+(y0-k)+'/'+(y0-k+1);
  const anoDe=n=>{const m=String(n).match(/^(\d+)\.º/);return m?+m[1]:null};
  b.turmas=(b.turmas||[]).filter(t=>!(k===2&&(t.oferta==='profij'||t.oferta==='profissional')));
  b.turmas.forEach(t=>{const n=anoDe(t.nome);if(n){t.anoEsc=n+'.º';t.ciclo=n<=4?'1c':n<=6?'2c':n<=9?'3c':'sec'}if(t.oferta==='profij'){t.anoEsc=(+String(t.anoEsc).replace(/\D/g,'')-k)+'.º'}if(t.nome==='TT 1'){t.anoForm='1.º';t.anoEsc='10.º'}
    (t.alunos||[]).forEach(x=>{delete x.movs;if(x.nasc)x.nasc=x.nasc})});
  b.dt=(b.dt||[]).map(()=>normTurma(k===1?'6.º A':'5.º A'));
  return b}
function demoCompletarAno(b){const rnd=(()=>{let x=20241109+b.turmas.length;return ()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648}})();
  const add=(iso,d)=>{const z=new Date(iso+'T12:00:00Z');z.setUTCDate(z.getUTCDate()+d);return z.toISOString().slice(0,10)};
  const per=(()=>{try{const pe=b.porEscola&&b.porEscola.principal;return (pe&&pe.calendario&&pe.calendario.periodos)||[]}catch(_){return []}})();
  b.turmas.forEach(t=>{if(Array.isArray(t.modulos)&&t.modulos.length&&t.oferta==='profissional')return;const AL=(t.alunos||[]).filter(x=>x.frequenta!==false);
    const base={};AL.forEach(x=>{let s=0,m=0;(t.instrumentos||[]).forEach(i=>{const n=i.notas&&i.notas[x.id];if(!n)return;i.itens.forEach(it=>{const v=parseFloat(n[it.id]);if(!isNaN(v)){s+=v;m+=+it.cot||0}})});base[x.id]=m?s/m:.45+rnd()*.45});
    const notas=(i,dif)=>{const N={};AL.forEach((x,q)=>{const o={};i.itens.forEach(it=>{const v=Math.max(0,Math.min(1,base[x.id]+(dif||0)+(rnd()-.5)*.22));o[it.id]=Math.round(v*(+it.cot||0)*2)/2});N[x.id]=o});return N};
    (t.instrumentos||[]).forEach(i=>{delete i.naoReal;if(!i.notas||!Object.keys(i.notas).length)i.notas=notas(i,0)});
    const P1=(t.instrumentos||[]).filter(i=>(i.periodo||1)===1&&!/diagn/i.test(i.tipo||''));
    [2,3].forEach(p=>{P1.forEach(i=>{const c=JSON.parse(JSON.stringify(i));c.id=uid()+p;const mp={};c.itens.forEach(it=>{const nid=uid()+Math.random().toString(36).slice(2,5);mp[it.id]=nid;it.id=nid});
      c.periodo=p;c.data=add(i.data||((per[0]||{}).ini)||'2025-10-15',91*(p-1));c.nome=String(i.nome).replace(/(\d+)\s*$/,(m,n)=>String(+n+2*(p-1)));if(c.nome===i.nome)c.nome=i.nome+' ('+p+'.º P)';delete c.anexos;delete c.modulo;
      c.notas=notas(c,(p===2?.02:.04));t.instrumentos.push(c)})});
    /* sumários e chamadas dos 2.º e 3.º períodos (as mesmas aulas da semana) */
    try{const SM=(b.sumarios||{})[t.id];if(SM){const fimP=p=>(per[p-1]||{}).fim||'9999';Object.entries({...SM}).forEach(([kk,s])=>{const m=kk.match(/^(\d{4}-\d{2}-\d{2})(.*)$/);if(!m)return;[2,3].forEach(p=>{const d=add(m[1],91*(p-1));if(d>fimP(p))return;if(!SM[d+m[2]])SM[d+m[2]]={...s,texto:s.texto||'Atividades de consolidação.'}})})}}catch(_){}});
  return b}
function demoExtras(a){try{const R=recursos();if(!R.length){const pr=profNome(S.cfg.professor)||'';const doc=t=>guardarDoc('data:text/plain;base64,'+btoa(unescape(encodeURIComponent(t))));
      const fic=(titulo,tipo,txt,et)=>({id:uid(),titulo,tipo,disciplina:'Inglês',anoEsc:'7.º',etiquetas:et,colecao:'Pessoal',acesso:'privado',anoLetivo:a.nome,autor:pr,criado:Date.now(),atual:Date.now(),versoes:[{v:1,doc:doc(txt),nome:titulo+'.txt',mime:'text/plain',tam:txt.length,q:Date.now(),nota:'Demonstração'}]});
      R.push(fic('Ficha — vocabulário da escola','ficha','Ficha de trabalho (demonstração)\n\n1. Liga as palavras às imagens.\n2. Completa as frases.','vocabulário|7.º ano'.split('|')),
        fic('Teste 1 — matriz','teste','Matriz do Teste 1 (demonstração)\n\nGrupo I — Compreensão (40 %)\nGrupo II — Gramática (30 %)\nGrupo III — Escrita (30 %)',['matriz','teste']),
        {...fic('Modelo — grelha de observação da oralidade','modelo','Grelha de observação (demonstração)\n\nFluência · Correção · Vocabulário · Interação',['oralidade']),colecao:'Modelos'},
        {id:uid(),titulo:'Aprendizagens Essenciais',tipo:'link',link:'https://www.dge.mec.pt/',disciplina:'Inglês',anoEsc:'',etiquetas:['currículo'],colecao:'Pessoal',acesso:'privado',anoLetivo:a.nome,autor:pr,criado:Date.now(),atual:Date.now(),versoes:[]})}}catch(e){console.warn('demo biblioteca',e)}
  try{const L=contL();if(!L.length){[['Helena Costa','Diretora','Direção'],['Rui Medeiros','Coordenador de Departamento','Línguas'],['Sónia Furtado','Professora de Português','Línguas'],['Paulo Rocha','Professor de Matemática','Ciências Exatas'],['Inês Tavares','Psicóloga','SPO'],['Marco Pacheco','Coordenador PROFIJ','Coordenação']].forEach(([n,c,g],q)=>{const e=normT(n).replace(/\s+/g,'.')+'@escola-exemplo.pt';L.push({id:uid()+q,nome:n,cargo:c,org:'Escola (demonstração)',grupo:g,ano:a.nome,morada:'',aniv:'',notas:'Contacto de demonstração',foto:'',tel:'29'+String(1000000+q*12345).slice(0,7),telR:'Escola',tels:[],email:e,emailR:'Institucional',emails:[],listas:[]})});L.sort((x,y)=>x.nome.localeCompare(y.nome,'pt'))}}catch(e){console.warn('demo contactos',e)}
  try{const ctx0=UI.mqCtx;UI.mqCtx='sn';try{MQ()}catch(_){}UI.mqCtx=ctx0;const q=(S.sn&&S.sn.quadros||[]).find(x=>x.id==='raiz');if(q&&!q.itens.length){const N=(t,x,y,o)=>q.itens.push({id:uid()+Math.random().toString(36).slice(2,4),t,x,y,w:{nota:220,tarefa:240,titulo:320}[t]||220,cor:'',pai:null,...o});
      N('titulo',40,30,{txt:'Planeamento do período (demonstração)'});N('nota',40,110,{txt:'Rever os critérios de avaliação com as turmas do 7.º ano.'});N('nota',290,110,{txt:'Ideia: projeto «A minha escola» com apresentação oral em grupo.',cor:'#fde68a'});
      N('tarefa',540,110,{tit:'Para esta semana',l:[{t:'Corrigir as fichas do 7.º A',f:true},{t:'Preparar o Teste 2',f:false},{t:'Atualizar sumários',f:false}]})}}catch(e){console.warn('demo spruce',e)}}
{const _cD3=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cD3.apply(this,arguments);try{if(S.anos.length>n0){const a0=S.anos.find(x=>x.id===S.anoAtivo)||S.anos[S.anos.length-1];
      const b1=demoCompletarAno(demoAnoAnterior(a0,1)),b2=demoCompletarAno(demoAnoAnterior(a0,2));const i=S.anos.indexOf(a0);S.anos.splice(i,0,b2,b1);demoExtras(a0);saveNow();
      setTimeout(()=>toast('Demonstração criada: 3 anos letivos ('+b2.nome.replace('Demonstração ','')+', '+b1.nome.replace('Demonstração ','')+' e o atual) com exemplos de tudo','ok'),400)}}catch(e){console.warn('demo 3 anos',e)}return r}}

/* ===================== v1.026 · Ajuda: privacidade, Em teste, desempenho, disciplinas/UFCD e coordenação ===================== */
try{const h=AJUDA.find(x=>x.id==='apresentacao');if(h)h.txt+=`<p><b>Memória por turma:</b> cada turma guarda as suas definições. Com <b>Ligar sempre ao abrir esta turma</b>, o modo liga-se sozinho nessa turma (para alunos que nunca querem a sua informação projetada) — e nunca se desliga sozinho ao mudar de turma.</p>
  <p><b>Sempre protegido:</b> os alunos ocultos ficam escondidos em todos os menus, janelas, avisos, listas e dicas, e na roda do sorteio, no instante em que aparecem. Tocar no <b>olho</b> com o modo ligado abre as definições (sem mostrar nada); só <b>Mostrar Tudo</b> sai do modo.</p>`;
  AJUDA.push({id:'emteste',ic:'clock',t:'Modo «Em teste»',gif:null,txt:`<p>No dia de um teste (instrumento do tipo teste, prova escrita ou questão-aula com a data de hoje) aparece no menu, por baixo da turma, a entrada <b>Em teste</b> — só nesse dia e, se tiver horário, só perto das aulas dessa turma.</p><ul><li>Abre um ecrã para projetar com a <b>hora certa</b>, o <b>nome do teste</b>, a turma e um <b>temporizador</b> (começar, pausa, ±5 min, duração).</li><li>A duração sugerida é o tempo até ao fim do bloco de aulas. Aos 5 minutos e no fim ouve-se um sinal; o ecrã muda de cor.</li><li><b>Tempo adicional</b>: se houver alunos com essa acomodação, mostra até que horas (sem nomes).</li><li><b>Regras</b> editáveis (telemóveis, folhas, dúvidas…). O temporizador continua a contar se fechar o ecrã.</li></ul>`},
  {id:'disc-ufcd',ic:'layers',t:'Disciplinas e UFCD (PROFIJ)',gif:null,txt:`<p><b>Disciplina</b>: cada disciplina das componentes sociocultural e científica tem a sua pauta. <b>UFCD</b> (componente tecnológica): todas as UFCD que leciona numa turma ficam numa única pauta «Componente Tecnológica (UFCD)», uma unidade por UFCD, cada uma com horas, datas e classificação próprias.</p><ul><li>Pode lecionar várias disciplinas e várias UFCD na mesma turma e no mesmo ano: assinale-as ao criar a turma ou acrescente com <b>+ Disciplina</b>.</li><li>Se a turma já tiver a pauta das UFCD, as novas juntam-se a ela (nunca há duas pautas iguais).</li><li>No menu, a pauta das UFCD mostra os códigos (ex.: «UFCD 6652, 0349»).</li></ul>`},
  {id:'coord-doc',ic:'crown',t:'Coordenação e docência',gif:null,txt:`<p>Na <b>Coord. PROFIJ › Turmas e Formandos</b> as turmas dividem-se em <b>Turmas onde leciona</b> (vêm da sua docência; as médias das suas disciplinas entram sozinhas) e <b>Turmas que só coordena</b> (crie-as com «Turma Só de Coordenação»: nome, curso e formandos).</p><p>As turmas que só coordena <b>não aparecem</b> nas suas turmas, horário, sumários, avaliação nem no Início — a coordenação não se mistura com a docência.</p>`},
  {id:'desempenho',ic:'sliders',t:'Desempenho em computadores antigos',gif:null,txt:`<p>Em <b>Definições › Aparência › Desempenho</b>: <b>Automático</b> (liga o modo leve sozinho em PCs lentos), <b>Leve</b> (sem desfoques, sombras nem animações) ou <b>Normal</b>. A escolha é só para o dispositivo onde a faz.</p>`})}catch(e){console.warn(e)}


})();
