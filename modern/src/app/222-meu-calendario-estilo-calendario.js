/* ---------- O Meu Calendário (1.031): ao estilo do calendário do Outlook ----------
   Vistas Dia, 3 dias, Semana de trabalho, Semana, Mês, Agenda e Ano letivo; minicalendário; calendários com cores (mostrar/esconder);
   eventos com repetição e exceções, dia inteiro e vários dias, local, ligação online, lembretes, estado, privado, categorias;
   criar arrastando na grelha, mover e alterar a duração arrastando; criação rápida em linguagem natural; pesquisa; .ics; imprimir.
   Junta (só para ver) as aulas do horário, reuniões, testes e momentos de avaliação, tarefas, Provas agendadas e o calendário escolar.
   Os eventos pessoais guardam a escola (cada escola com o seu calendário; «Todas as escolas» nas definições). */
const OCAL=()=>{let c=S.cal;if(!c||typeof c!=='object')c=S.cal={};if(!Array.isArray(c.ev))c.ev=[];
  if(!Array.isArray(c.cals)||!c.cals.length)c.cals=[{id:'pessoal',nome:'Pessoal',cor:'#7c3aed',on:true},{id:'escola',nome:'Trabalho',cor:'#0e7490',on:true},{id:'familia',nome:'Família',cor:'#db2777',on:true}];
  if(!Array.isArray(c.cat))c.cat=[{id:'c1',nome:'Importante',cor:'#dc2626'},{id:'c2',nome:'Preparar',cor:'#ea580c'},{id:'c3',nome:'Pendente',cor:'#ca8a04'},{id:'c4',nome:'Concluído',cor:'#16a34a'},{id:'c5',nome:'Formação',cor:'#2563eb'},{id:'c6',nome:'Pessoal',cor:'#9333ea'}];
  c.src=Object.assign({aula:true,reun:true,tes:true,tar:true,prova:true,esc:true},c.src||{});
  c.cfg=Object.assign({vista:'mes',h0:8,h1:19,slot:30,semN:true,todas:false,lembR:15,resumo:true,carga:true},c.cfg||{});return c};
const OC_SRC=[['aula','Aulas (horário)','#0369a1'],['reun','Reuniões','#0f8b8d'],['tes','Testes e avaliações','#c0392b'],['tar','Tarefas','#2f7fd0'],['prova','Provas agendadas','#7c3aed'],['esc','Calendário escolar','#e0a030']];
const OC_EST=[['ocupado','Ocupado'],['provisorio','Provisório'],['fora','Fora do escritório'],['livre','Livre'],['outro','A trabalhar noutro local']];
const OC_MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const OC_DS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const ocD=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d)};
const ocI=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ocAdd=(iso,n)=>{const d=ocD(iso);d.setDate(d.getDate()+n);return ocI(d)};
const ocDif=(a,b)=>Math.round((ocD(b)-ocD(a))/86400000);
const ocHM=m=>m==null?'':String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const ocMin=s=>{const m=String(s||'').match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
const ocSegunda=iso=>{const d=ocD(iso);return ocAdd(iso,-((d.getDay()+6)%7))};
const ocSemN=iso=>{const d=ocD(iso);d.setDate(d.getDate()+3-(d.getDay()+6)%7);const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7)};
const ocCal=id=>OCAL().cals.find(c=>c.id===id)||OCAL().cals[0];
const ocCat=id=>OCAL().cat.find(c=>c.id===id);
/* repetição: a ocorrência cai neste dia? */
function ocBate(e,iso){const r=e.rep;if(!r||r.f==='nao'||!r.f)return iso===e.d0;if(iso<e.d0)return false;if(r.ate&&iso>r.ate)return false;const n=ocDif(e.d0,iso),I=Math.max(1,+r.int||1);const d=ocD(iso),s=ocD(e.d0);
  if(r.f==='dia')return n%I===0;if(r.f==='uteis')return d.getDay()>0&&d.getDay()<6;
  if(r.f==='sem'){const ds=(r.dias&&r.dias.length)?r.dias:[s.getDay()];return ds.includes(d.getDay())&&Math.floor(ocDif(ocSegunda(e.d0),ocSegunda(iso))/7)%I===0}
  const mm=(d.getFullYear()-s.getFullYear())*12+d.getMonth()-s.getMonth();
  if(r.f==='mes')return d.getDate()===s.getDate()&&mm%I===0;
  if(r.f==='mesd')return d.getDay()===s.getDay()&&Math.ceil(d.getDate()/7)===Math.ceil(s.getDate()/7)&&mm%I===0;
  if(r.f==='ano')return d.getDate()===s.getDate()&&d.getMonth()===s.getMonth()&&(d.getFullYear()-s.getFullYear())%I===0;return false}
/* ocorrências dos eventos pessoais entre A e B (inclusive) */
function ocOcorr(A,B){const C=OCAL(),esc=escAtiva(),out=[];
  C.ev.forEach(e=>{if(!C.cfg.todas&&e.esc&&e.esc!==esc)return;const cal=ocCal(e.cal);if(cal&&cal.on===false)return;const dur=ocDif(e.d0,e.d1||e.d0);
    const push=d=>{if((e.exc||[]).includes(d))return;const o=Object.assign({},e,(e.ov||{})[d]||{});out.push({k:'ev',e,occ:d,d,dE:ocAdd(d,dur),h0:o.dia?null:o.h0,h1:o.dia?null:o.h1,dia:!!o.dia,t:o.t||'(sem título)',loc:o.loc,cor:(ocCat(o.cat)||{}).cor||(cal||{}).cor||'#7c3aed',est:o.est,priv:o.priv,rep:!!(e.rep&&e.rep.f&&e.rep.f!=='nao')})};
    if(!e.rep||!e.rep.f||e.rep.f==='nao'){if(e.d0<=B&&(e.d1||e.d0)>=A)push(e.d0);return}
    let cnt=0;const fim=e.rep.ate&&e.rep.ate<B?e.rep.ate:B;for(let d=e.d0;d<=fim;d=ocAdd(d,1)){if(ocBate(e,d)){cnt++;if(+e.rep.n&&cnt>+e.rep.n)break;if(ocAdd(d,dur)>=A)push(d)}if(ocDif(e.d0,d)>2200)break}});return out}
/* tudo o que aparece no calendário entre A e B */
function ocColetar(A,B){const C=OCAL(),a=ocA(),L=ocOcorr(A,B);if(!a)return L;
  if(C.src.aula){try{turmasFiltradas(a).forEach(t=>{let X=[];try{X=listaAulas(t,a)}catch(_){}X.forEach(x=>{if(x.data<A||x.data>B)return;const falta=!!x.falta&&!x.falta.subst;const sum=!!((x.s&&x.s.texto)||'').trim();
    L.push({k:'aula',d:x.data,dE:x.data,h0:x.ini,h1:x.fim,t:t.nome+' · '+t.disciplina,loc:x.sala?'Sala '+x.sala:'',cor:corTurma(t.id)||'#0369a1',falta,semSum:x.passada&&!falta&&!sum,f:()=>{S.turmaAtiva=t.id;save();try{aulaDlg(t,x.k,'sum')}catch(_){go('painel')}}})})})}catch(e){console.warn(e)}}
  if(C.src.reun){try{todasReunioes(a).forEach(r=>{if(r.estado==='cancelada'||!r.data||r.data<A||r.data>B)return;L.push({k:'reun',d:r.data,dE:r.data,h0:r.semHora?null:(r.ini!=null?r.ini:null),h1:r.semHora?null:(r.fim||(r.ini!=null?r.ini+60:null)),dia:r.semHora||r.ini==null,t:reunTitulo(r,a),loc:r.local||r.sala||'',cor:'#0f8b8d',f:()=>go('reunioes')})})}catch(_){}}
  if(C.src.tes){try{turmasFiltradas(a).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(!i.data||i.data<A||i.data>B)return;const te=(()=>{try{return ehTeste(i)}catch(_){return true}})();L.push({k:'tes',d:i.data,dE:i.data,dia:true,t:(i.nome||'Avaliação')+' · '+t.nome,cor:te?'#c0392b':'#b45309',f:()=>{S.turmaAtiva=t.id;UI.inst=i.id;save();go('instrumentos')}})}))}catch(_){}}
  if(C.src.tar){try{tarefas().forEach(x=>{if(!x.prazo||x.prazo<A||x.prazo>B)return;L.push({k:'tar',d:x.prazo,dE:x.prazo,dia:true,t:x.t,feito:!!x.feito,x,cor:'#2f7fd0',f:()=>go('tarefas')})})}catch(_){}}
  if(C.src.prova&&S.pv&&Array.isArray(S.pv.av)){S.pv.av.forEach(p=>Object.values(p.ag||{}).forEach(g=>{const i=new Date(g.ini),f=new Date(g.fim);if(isNaN(i))return;const d=ocI(i);if(d<A||d>B)return;const df=ocI(f);
    L.push({k:'prova',d,dE:df<d?d:df,h0:i.getHours()*60+i.getMinutes(),h1:df===d?f.getHours()*60+f.getMinutes():24*60-1,t:'Prova: '+p.titulo,cor:'#7c3aed',f:()=>{UI.pvEd={k:'av',id:p.id};UI.pvAt='ativ';go('provas')}})}))}
  if(C.src.esc){for(let d=A;d<=B;d=ocAdd(d,1)){const tp=(()=>{try{return tipoDia(d)}catch(_){return ''}})();if(tp&&/^feriado|interrupcao/.test(tp)){const nota=(((a||{}).calendario||{}).notas||{})[d]||'';L.push({k:'esc',d,dE:d,dia:true,t:(/^feriado/.test(tp)?'Feriado':'Interrupção letiva')+(nota?' · '+nota:''),cor:/^feriado/.test(tp)?'#e04848':'#e0a030',fundo:/^feriado/.test(tp)?'fer':'int'})}}}
  return L}
const ocA=()=>{try{return A()}catch(_){return null}};
/* ---------- estrutura ---------- */
function ocIntervalo(){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();
  if(v==='dia')return [d,d];if(v==='3d')return [d,ocAdd(d,2)];if(v==='trab'){const s=ocSegunda(d);return [s,ocAdd(s,4)]}if(v==='sem'){const s=ocSegunda(d);return [s,ocAdd(s,6)]}
  if(v==='mes'){const p=d.slice(0,8)+'01';const s=ocSegunda(p);return [s,ocAdd(s,41)]}if(v==='agenda')return [d,ocAdd(d,59)];
  const dd=ocD(d);const y=dd.getMonth()>=8?dd.getFullYear():dd.getFullYear()-1;return [`${y}-09-01`,`${y+1}-08-31`]}
function ocTitulo(){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();const [A,B]=ocIntervalo();const dd=ocD(d);
  if(v==='mes')return OC_MES[dd.getMonth()]+' '+dd.getFullYear();if(v==='ano')return 'Ano letivo '+A.slice(0,4)+'/'+B.slice(0,4);if(v==='dia')return OC_DS[dd.getDay()]+', '+dd.getDate()+' de '+OC_MES[dd.getMonth()]+' '+dd.getFullYear();
  const a=ocD(A),b=ocD(B);return a.getMonth()===b.getMonth()?`${a.getDate()}–${b.getDate()} de ${OC_MES[a.getMonth()]} ${a.getFullYear()}`:`${a.getDate()} ${OC_MES[a.getMonth()].slice(0,3)} – ${b.getDate()} ${OC_MES[b.getMonth()].slice(0,3)} ${b.getFullYear()}`}
function ocNav(k){const C=OCAL(),v=C.cfg.vista,d=UI.ocDia||isoHoje();const st={dia:1,'3d':3,trab:7,sem:7,agenda:30}[v];if(st)UI.ocDia=ocAdd(d,k*st);else if(v==='mes'){const x=ocD(d);x.setDate(1);x.setMonth(x.getMonth()+k);UI.ocDia=ocI(x)}else{const x=ocD(d);x.setFullYear(x.getFullYear()+k);UI.ocDia=ocI(x)}vMeuCal()}
vMeuCal=function(){const C=OCAL(),v=C.cfg.vista;const hj=isoHoje();UI.ocDia=UI.ocDia||hj;barBtns([]);const q=UI.ocQ||'';
  const V=[['dia','Dia'],['3d','3 dias'],['trab','Semana de trabalho'],['sem','Semana'],['mes','Mês'],['agenda','Agenda'],['ano','Ano letivo']];
  $('#view').innerHTML=`<div class="oc"><aside class="ocside"><button class="btn pri ocnovo" id="oc-novo">${ic('plus',16)} Novo evento</button><div id="oc-mini"></div>
    <div class="ocsec"><b>Os meus calendários</b>${C.cals.map(c=>`<label class="occk"><input type="checkbox" data-occ="${c.id}" ${c.on!==false?'checked':''}><i style="background:${c.cor}"></i><span>${esc(c.nome)}</span><button type="button" class="ocmini" data-oce="${c.id}" aria-label="Editar calendário">${ic('pen',12)}</button></label>`).join('')}<button type="button" class="ocadd" id="oc-ncal">${ic('plus',13)} Adicionar calendário</button></div>
    <div class="ocsec"><b>Da EduSpruce</b>${OC_SRC.map(([k,l,c])=>`<label class="occk"><input type="checkbox" data-ocs="${k}" ${C.src[k]?'checked':''}><i style="background:${c}"></i><span>${l}</span></label>`).join('')}</div>
    <div class="ocsec"><b>Categorias</b><div class="occats">${C.cat.map(c=>`<span class="occat"><i style="background:${c.cor}"></i>${esc(c.nome)}</span>`).join('')}<button type="button" class="ocadd" id="oc-cats">${ic('pen',13)} Editar</button></div></div>
    <div class="ocsec" id="oc-prox"></div></aside>
    <section class="ocmain"><div class="octb"><button class="btn sm" id="oc-hoje">Hoje</button><button class="btn sm ico" id="oc-ant" aria-label="Anterior">‹</button><button class="btn sm ico" id="oc-seg" aria-label="Seguinte">›</button><h2 class="octit">${esc(ocTitulo())}</h2><span class="sp1"></span>
      <div class="ocvis" role="tablist">${V.map(([k,l])=>`<button type="button" data-ocv="${k}" class="${v===k?'on':''}">${l}</button>`).join('')}</div></div>
      <div class="octb2"><form id="oc-qf" class="ocq"><input id="oc-qa" placeholder="Adicionar rapidamente: ex. «Reunião de pais amanhã às 18h30» ou «Natação todas as quartas às 19h»" aria-label="Adicionar evento rapidamente"><button class="btn sm pri" aria-label="Adicionar">${ic('plus',14)}</button></form>
        <input type="search" id="oc-q" placeholder="Pesquisar no calendário…" value="${esc(q)}" aria-label="Pesquisar"><button class="btn sm" id="oc-ics" title="Importar ou exportar .ics">${ic('download',14)} .ics</button><button class="btn sm" id="oc-imp" title="Imprimir">${ic('printer',14)}</button><button class="btn sm" id="oc-def" title="Definições do calendário">${ic('gear',14)}</button></div>
      <div id="oc-c"></div></section></div>`;
  ocMini();ocProx();const c=$('#oc-c');if(q.trim())ocPesquisa(c,q);else if(v==='mes')ocMes(c);else if(v==='agenda')ocAgenda(c);else if(v==='ano')ocAno(c);else ocGrelha(c);
  $('#oc-novo').onclick=()=>ocEditar(null,{d0:UI.ocDia});$('#oc-hoje').onclick=()=>{UI.ocDia=hj;vMeuCal()};$('#oc-ant').onclick=()=>ocNav(-1);$('#oc-seg').onclick=()=>ocNav(1);
  $$('[data-ocv]').forEach(b=>b.onclick=()=>{C.cfg.vista=b.dataset.ocv;save();vMeuCal()});
  $$('[data-occ]').forEach(i=>i.onchange=()=>{ocCal(i.dataset.occ).on=i.checked;save();vMeuCal()});$$('[data-ocs]').forEach(i=>i.onchange=()=>{C.src[i.dataset.ocs]=i.checked;save();vMeuCal()});
  $$('[data-oce]').forEach(b=>b.onclick=e=>{e.preventDefault();ocCalDlg(ocCal(b.dataset.oce))});$('#oc-ncal').onclick=()=>ocCalDlg(null);$('#oc-cats').onclick=()=>ocCatsDlg();
  $('#oc-qf').onsubmit=e=>{e.preventDefault();const t=$('#oc-qa').value.trim();if(!t)return;const o=ocParse(t);ocEditar(null,o)};
  const qi=$('#oc-q');qi.oninput=()=>{UI.ocQ=qi.value;clearTimeout(vMeuCal._t);vMeuCal._t=setTimeout(()=>{vMeuCal();const z=$('#oc-q');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},300)};
  $('#oc-ics').onclick=()=>ocIcsDlg();$('#oc-imp').onclick=()=>ocImprimir();$('#oc-def').onclick=()=>ocDefsDlg()};
if(go._f)go._f.meucal=vMeuCal;
function ocMini(){const el=$('#oc-mini');if(!el)return;const hj=isoHoje();const m=UI.ocMini||(UI.ocDia||hj).slice(0,7);const [Y,M]=m.split('-').map(Number);const p=`${m}-01`;const s=ocSegunda(p);const [A,B]=ocIntervalo();
  const E=new Set(ocColetar(s,ocAdd(s,41)).filter(x=>x.k!=='aula'&&x.k!=='esc').map(x=>x.d));
  let h=`<div class="ocmh"><button type="button" data-mm="-1" aria-label="Mês anterior">‹</button><b>${OC_MES[M-1]} ${Y}</b><button type="button" data-mm="1" aria-label="Mês seguinte">›</button></div><div class="ocmg">${['S','T','Q','Q','S','S','D'].map(x=>`<span>${x}</span>`).join('')}`;
  for(let i=0;i<42;i++){const d=ocAdd(s,i);h+=`<button type="button" data-md="${d}" class="${d.slice(0,7)!==m?'fo':''} ${d===hj?'hj':''} ${d>=A&&d<=B&&OCAL().cfg.vista!=='ano'?'in':''} ${E.has(d)?'ev':''}">${+d.slice(8)}</button>`}
  el.innerHTML=h+'</div>';el.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{const d=new Date(Y,M-1+(+b.dataset.mm),1);UI.ocMini=ocI(d).slice(0,7);ocMini()});
  el.querySelectorAll('[data-md]').forEach(b=>b.onclick=()=>{UI.ocDia=b.dataset.md;UI.ocMini=null;vMeuCal()})}
function ocProx(){const el=$('#oc-prox');if(!el)return;const hj=isoHoje();const L=ocColetar(hj,ocAdd(hj,7)).filter(x=>x.k!=='aula'&&x.k!=='esc'&&!x.feito).sort((a,b)=>(a.d+ocHM(a.h0||0)).localeCompare(b.d+ocHM(b.h0||0))).slice(0,6);
  el.innerHTML=`<b>A minha agenda</b>${L.length?L.map((x,i)=>`<button type="button" class="ocpx" data-px="${i}"><i style="background:${x.cor}"></i><span>${esc(x.t)}<small>${x.d===hj?'Hoje':x.d===ocAdd(hj,1)?'Amanhã':ocD(x.d).toLocaleDateString('pt-PT',{weekday:'short',day:'numeric',month:'short'})}${x.h0!=null?' · '+ocHM(x.h0):''}</small></span></button>`).join(''):'<p class="mut peq">Nada nos próximos 7 dias.</p>'}`;
  el.querySelectorAll('[data-px]').forEach(b=>b.onclick=()=>ocAbrir(L[+b.dataset.px]))}
function ocAbrir(x){if(x.k==='ev')return ocVer(x);if(x.f)x.f()}
