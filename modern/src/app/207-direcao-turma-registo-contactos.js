/* ---------- Direção de Turma: Registo de Contactos (chamadas, e-mails, reuniões e contactos presenciais) ---------- */
if(!MEIOS_EE.includes('Reunião'))MEIOS_EE.splice(2,0,'Reunião');
const RC_IC={'Telefone':'phone','E-mail':'mail','Reunião':'meet','Presencial':'user','Videochamada':'meet','Mensagem / caderneta':'chat','Carta':'file'};
{const k=DT_TABS.findIndex(x=>x[0]==='contactos');if(!DT_TABS.some(x=>x[0]==='regc'))DT_TABS.splice(k>=0?k+1:2,0,['regc','phone','Registo de Contactos'])}
function rcLista(a,n,AL){const D=dtDados(a,n);D.contGerais=D.contGerais||[];const L=[];
  AL.forEach(o=>{try{ligarClasse(a)}catch(_){}contactosEE(a,o.x.cid).forEach(c=>L.push({c,o,src:'ee'}))});
  D.contGerais.forEach(c=>L.push({c,o:null,src:'ger'}));
  D.atend.forEach(z=>L.push({c:{id:z.id,data:z.data,hora:z.hora,meio:/telef/i.test(z.modo||'')?'Telefone':z.modo==='Presencial'?'Presencial':z.modo||'Presencial',quem:z.quem,assunto:z.assunto,sintese:z.resumo,compromisso:z.enc},o:AL.find(q=>normT(q.x.nome)===normT(z.aluno||''))||null,src:'at',nomeAl:z.aluno}));
  return L.sort((p,q)=>String(q.c.data||'').localeCompare(String(p.c.data||''))||String(q.c.hora||'').localeCompare(String(p.c.hora||'')))}
function rcDlg(a,n,AL,ed,depois){const hj=isoHoje();const c=ed?ed.c:{};const o0=ed?ed.o:null;const D=dtDados(a,n);D.contGerais=D.contGerais||[];
  openDrawer((ed?'Editar':'Registar')+' Contacto — '+n,`<div class="ed rcdlg">
    <div class="g2"><div style="grid-column:1/-1"><label>Aluno</label><select id="rc-al" ${ed?'disabled':''}><option value="">— Contacto geral da turma (sem aluno) —</option>${AL.map(o=>`<option value="${esc(o.x.cid)}" ${o0&&o0.x.cid===o.x.cid?'selected':''}>${esc(numAl(o.x))}. ${esc(o.x.nome)}</option>`).join('')}</select></div>
    <div><label>Data</label><input type="date" id="rc-d" value="${esc(c.data||hj)}"></div><div><label>Hora</label><input type="time" id="rc-h" value="${esc(c.hora||'')}"></div>
    <div style="grid-column:1/-1"><label>Meio</label><div class="seg rcmeio">${MEIOS_EE.map(m=>`<button type="button" data-rcm="${esc(m)}" class="${(c.meio||'Telefone')===m?'on':''}">${ic(RC_IC[m]||'chat',14)} ${esc(m)}</button>`).join('')}</div></div>
    <div><label>Sentido</label><select id="rc-s"><option value="ef" ${c.sentido!=='rec'?'selected':''}>Efetuado por mim</option><option value="rec" ${c.sentido==='rec'?'selected':''}>Recebido</option></select></div>
    <div><label>Com quem</label><input id="rc-q" list="rc-ql" value="${esc(c.quem||'')}" placeholder="Encarregado(a) de educação"><datalist id="rc-ql">${['Encarregado(a) de educação','Mãe','Pai','Aluno(a)','Professor(a)','Psicólogo(a) / SPO','Direção','Outro'].map(z=>`<option>${z}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Assunto</label><input id="rc-a" list="ce-al2" value="${esc(c.assunto||'')}" placeholder="ex.: Assiduidade, aproveitamento, comportamento…"><datalist id="ce-al2">${['Assiduidade','Aproveitamento','Comportamento','Medidas de apoio','Informação intercalar','Convocatória','Pedido do encarregado de educação','Justificação de faltas','Saúde'].map(z=>`<option>${z}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Síntese</label><textarea id="rc-t" rows="4" placeholder="O que foi falado…">${esc(c.sintese||'')}</textarea></div>
    <div style="grid-column:1/-1"><label>Compromisso / encaminhamento</label><textarea id="rc-c" rows="2">${esc(c.compromisso||'')}</textarea></div>
    <div><label>Acompanhar em</label><input type="date" id="rc-f" value="${esc(c.acomp||'')}"></div><div><label class="chk" style="margin-top:26px"><input type="checkbox" id="rc-tk" ${c.tarefa||!ed?'checked':''}> Criar tarefa para essa data</label></div></div>
    <div class="row" style="margin-top:14px;gap:8px">${ed?`<button class="btn dng" id="rc-x">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn" id="rc-can">Cancelar</button><button class="btn pri" id="rc-ok">${ic('check',14)} Guardar</button></div></div>`);
  let meio=c.meio||'Telefone';$$('#dw-b [data-rcm]').forEach(b=>b.onclick=()=>{meio=b.dataset.rcm;$$('#dw-b [data-rcm]').forEach(z=>z.classList.toggle('on',z===b))});
  const alSel=$('#rc-al');const prefQ=()=>{const o=AL.find(z=>z.x.cid===alSel.value);const q=$('#rc-q');if(o&&!q.value&&o.x.eeNome)q.placeholder=o.x.eeNome+(o.x.eeParent?' ('+o.x.eeParent+')':'')};alSel.onchange=prefQ;prefQ();
  const lista=()=>{const cid=alSel.value;return cid?contactosEE(a,cid):D.contGerais};
  $('#rc-can').onclick=()=>{closeDrawer();depois&&depois()};
  const ex=$('#rc-x');if(ex)ex.onclick=()=>{if(!confirm('Apagar este registo de contacto?'))return;const L=lista();const k=L.indexOf(c);if(k>=0)L.splice(k,1);if(c.tarefa){const T_=tarefas();const j=T_.findIndex(z=>z.id===c.tarefa);if(j>=0&&!T_[j].feito)T_.splice(j,1)}save();closeDrawer();toast('Contacto apagado');depois&&depois()};
  $('#rc-ok').onclick=()=>{const o=ed?c:{id:uid(),criado:Date.now()};const q=$('#rc-q');Object.assign(o,{data:$('#rc-d').value||hj,hora:$('#rc-h').value||'',meio,sentido:$('#rc-s').value,quem:q.value.trim()||q.placeholder||'',assunto:$('#rc-a').value.trim(),sintese:$('#rc-t').value.trim(),compromisso:$('#rc-c').value.trim(),acomp:$('#rc-f').value||'',disc:o.disc||'Direção de Turma',turma:n,autor:o.autor||S.cfg.professor||''});
    if(!o.assunto&&!o.sintese){toast('Indique pelo menos o assunto ou a síntese','aviso');return}
    const al=AL.find(z=>z.x.cid===alSel.value);const nm=al?al.x.nome.split(' ')[0]:'a turma '+n;const T_=tarefas();let tk=o.tarefa&&T_.find(z=>z.id===o.tarefa);const querT=$('#rc-tk').checked&&o.acomp;
    if(querT){const txt='Acompanhar contacto ('+o.meio.toLowerCase()+') sobre '+nm+(o.assunto?': '+o.assunto:'')+(o.compromisso?' — '+o.compromisso:'');if(tk){tk.t=txt;tk.prazo=o.acomp}else{tk={id:uid(),t:txt,prazo:o.acomp,feito:false,criada:Date.now(),orig:al?{tipo:'contactoEE',cid:al.x.cid,cont:o.id}:{tipo:'contactoDT',turma:n,cont:o.id}};T_.push(tk)}o.tarefa=tk.id}
    else if(tk&&!tk.feito){T_.splice(T_.indexOf(tk),1);delete o.tarefa}
    const L=lista();if(!ed)L.push(o);L.sort((p,r)=>(r.data||'').localeCompare(p.data||''));save();audit('Direção de Turma',ed?'Contacto editado':'Contacto registado',(al?al.x.nome:'Turma '+n)+' · '+o.meio+' · '+o.data);closeDrawer();toast('Contacto registado'+(querT?' · tarefa para '+fmtIso(o.acomp):''),'ok');depois&&depois()}}
function rcCorpo(a,n,AL){const L=rcLista(a,n,AL);const F=UI.rcF=UI.rcF||{m:'',al:'',q:''};const q=normT(F.q||'');
  const LL=L.filter(z=>(!F.m||z.c.meio===F.m)&&(!F.al||(F.al==='_g'?!z.o:z.o&&z.o.x.cid===F.al))&&(!q||normT([z.c.assunto,z.c.sintese,z.c.quem,z.o&&z.o.x.nome,z.nomeAl].join(' ')).includes(q)));
  const cnt=m=>L.filter(z=>z.c.meio===m).length;const desde=isoData(new Date(Date.now()-60*864e5));const sem=AL.filter(o=>!L.some(z=>z.o===o&&(z.c.data||'')>=desde));
  return `<div class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('phone',18)} Registo de Contactos</h2><span class="sp1"></span><button class="btn" id="rc-csv">${ic('download',15)} Exportar (CSV)</button><button class="btn pri" id="rc-novo">${ic('plus',15)} Registar Contacto</button></div>
    <p class="hint">Chamadas, e-mails, reuniões e contactos presenciais com os encarregados de educação e outros intervenientes. Os contactos de cada aluno aparecem também no Dossiê e na Ficha Integral; os atendimentos registados continuam a contar.</p>
    <div class="rckp"><button type="button" data-rcfm="" class="${!F.m?'on':''}"><b>${L.length}</b><span>Todos</span></button>${MEIOS_EE.filter(m=>cnt(m)||['Telefone','E-mail','Reunião','Presencial'].includes(m)).map(m=>`<button type="button" data-rcfm="${esc(m)}" class="${F.m===m?'on':''}">${ic(RC_IC[m]||'chat',15)}<b>${cnt(m)}</b><span>${esc(m)}</span></button>`).join('')}</div>
    <div class="row rcfl"><select id="rc-fal" aria-label="Filtrar por aluno"><option value="">Todos os alunos</option><option value="_g" ${F.al==='_g'?'selected':''}>Contactos gerais da turma</option>${AL.map(o=>`<option value="${esc(o.x.cid)}" ${F.al===o.x.cid?'selected':''}>${esc(numAl(o.x))}. ${esc(o.x.nome)}</option>`).join('')}</select><input id="rc-fq" type="search" placeholder="Procurar assunto, síntese…" value="${esc(F.q||'')}"></div></div>
    ${sem.length?`<div class="card rcsem"><b>${ic('clock',15)} Sem contactos nos últimos 60 dias (${sem.length})</b><div>${sem.map(o=>`<button type="button" class="tag" data-rcna="${esc(o.x.cid)}" title="Registar contacto">${esc(numAl(o.x))}. ${esc(o.x.nome.split(' ')[0])} ${esc(o.x.nome.split(' ').slice(-1)[0]===o.x.nome.split(' ')[0]?'':o.x.nome.split(' ').slice(-1)[0])}</button>`).join('')}</div></div>`:''}
    <div class="card rcl">${LL.map((z,k)=>{const c=z.c;const al=z.o?z.o.x:null;return `<article class="rci"><span class="rcic" title="${esc(c.meio||'')}">${ic(RC_IC[c.meio]||'chat',18)}</span><div class="rcb"><header><b>${esc(fmtIsoL(c.data))}${c.hora?' · '+esc(c.hora):''}</b><span class="tag">${esc(c.meio||'')}</span>${c.sentido==='rec'?'<span class="tag">recebido</span>':''}${z.src==='at'?'<span class="tag">atendimento</span>':''}<span class="sp1"></span>${z.src!=='at'?`<button class="btn sm ico" data-rced="${k}" aria-label="Editar">${ic('pencil',13)}</button>`:''}</header>
      <div class="rcw"><b>${al?esc(numAl(al))+'. '+esc(al.nome):esc(z.nomeAl||'Turma '+n)}</b>${c.quem?` <span class="mut">com ${esc(c.quem)}</span>`:''}${c.assunto?` · <b>${esc(c.assunto)}</b>`:''}</div>${c.sintese?`<p>${esc(c.sintese)}</p>`:''}${c.compromisso?`<p class="dscm">${ic('check',12)} ${esc(c.compromisso)}</p>`:''}${c.acomp?`<p class="mut">${ic('clock',12)} Acompanhar em ${esc(fmtIso(c.acomp))}</p>`:''}${c.autor&&c.autor!==S.cfg.professor?`<small class="mut">${esc(profNome(c.autor))}${c.disc&&c.disc!=='Direção de Turma'?' · '+esc(c.disc):''}</small>`:''}</div></article>`}).join('')||'<p class="mut" style="margin:0">Sem contactos registados'+(F.m||F.al||F.q?' com este filtro':'')+'.</p>'}</div>`}
{const _vDrc=vDirecao;vDirecao=function(){const r=_vDrc.apply(this,arguments);try{if((UI.dtTab||'painel')==='regc'){const a=A();const L=minhasDT(a);const n=UI.dtT;if(!a||!L.includes(n))return r;const AL=alunosDaClasse(a,n);const v=$('#view');const hd=v.querySelector('.dthead');if(!hd)return r;while(hd.nextSibling)hd.nextSibling.remove();hd.insertAdjacentHTML('afterend',rcCorpo(a,n,AL));
    const re=()=>vDirecao();const LL=()=>{const F=UI.rcF;const q=normT(F.q||'');return rcLista(a,n,AL).filter(z=>(!F.m||z.c.meio===F.m)&&(!F.al||(F.al==='_g'?!z.o:z.o&&z.o.x.cid===F.al))&&(!q||normT([z.c.assunto,z.c.sintese,z.c.quem,z.o&&z.o.x.nome,z.nomeAl].join(' ')).includes(q)))};
    $('#rc-novo').onclick=()=>rcDlg(a,n,AL,null,re);
    $$('#view [data-rcfm]').forEach(b=>b.onclick=()=>{UI.rcF.m=b.dataset.rcfm;re()});
    $('#rc-fal').onchange=e=>{UI.rcF.al=e.target.value;re()};
    const fq=$('#rc-fq');fq.oninput=()=>{UI.rcF.q=fq.value;clearTimeout(rcCorpo._t);rcCorpo._t=setTimeout(()=>{re();const z=$('#rc-fq');if(z){z.focus();z.setSelectionRange(z.value.length,z.value.length)}},250)};
    $$('#view [data-rced]').forEach(b=>b.onclick=()=>{const z=LL()[+b.dataset.rced];if(z)rcDlg(a,n,AL,z,re)});
    $$('#view [data-rcna]').forEach(b=>b.onclick=()=>{rcDlg(a,n,AL,null,re);const s=$('#rc-al');if(s){s.value=b.dataset.rcna;s.onchange&&s.onchange()}});
    $('#rc-csv').onclick=()=>{const q_=v_=>'"'+String(v_==null?'':v_).replace(/"/g,'""')+'"';const rows=[['Data','Hora','Meio','Sentido','Aluno','Com quem','Assunto','Síntese','Compromisso','Acompanhar em'],...LL().map(z=>[z.c.data,z.c.hora||'',z.c.meio||'',z.c.sentido==='rec'?'Recebido':'Efetuado',z.o?z.o.x.nome:(z.nomeAl||'Turma '+n),z.c.quem||'',z.c.assunto||'',z.c.sintese||'',z.c.compromisso||'',z.c.acomp||''])];
      const b_=new Blob(['﻿'+rows.map(r_=>r_.map(q_).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(b_);const l=document.createElement('a');l.href=u;l.download='Registo de contactos '+n.replace(/[\\/:*?"<>|]/g,'')+'.csv';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);audit('Direção de Turma','Exportação do registo de contactos',n)}}}catch(e){console.warn(e)}return r};if(go._f)go._f.direcao=vDirecao}
{const _hRc=historicoDT;historicoDT=function(a,n,AL){const H=_hRc.apply(this,arguments)||[];try{const D=dtDados(a,n);(D.contGerais||[]).forEach(c=>H.push({data:c.data,tipo:'Contacto ('+(c.meio||'')+')',desc:'Turma · '+(c.assunto||c.sintese||'')}));H.sort((x,y)=>String(y.data).localeCompare(String(x.data)))}catch(_){}return H}}
/*V0996-INI*/
/* v0.996 · Coord. PROFIJ › Distribuição e Horários
   Simulação tempo a tempo (45 min) do ano da turma, com:
   · contagem global por professor (um professor com várias disciplinas/UFCD: quando uma acaba, os tempos dela passam para as outras dele);
   · cedência de tempos (ex.: quando TIC acaba, os tempos de TIC passam para Inglês), com data ou «quando acabar»;
   · tempos livres (de quem já acabou) entregues a quem está atrasado;
   · substituição de professor a partir de uma data; data de fim manual ou automática;
   · horários semanais com datas (alterações só nessa semana) e contagem do que falta;
   · exportação: cronogramas por professor, horários semanais, matriz com distribuição de serviço e horário original. */
const CPD_DS=[1,2,3,4,5];
const cpdSeg=iso=>{const d=dataDeIso(iso);const w=d.getDay();d.setDate(d.getDate()-((w+6)%7));return isoData(d)};
const cpdMais=(iso,n)=>{const d=dataDeIso(iso);d.setDate(d.getDate()+n);return isoData(d)};
const cpdHm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const cpdDM=iso=>{const p=iso.split('-');return p[2]+'/'+p[1]};
const cpdSk=x=>x.dia+'|'+x.ini;
function cpdProfEm(d,iso){let p=d.prof||'';(d.subs||[]).slice().sort((x,y)=>x.desde.localeCompare(y.desde)).forEach(s=>{if(s.desde&&s.desde<=iso&&s.prof)p=s.prof});return (p||'Sem professor').trim()}
const cpdProfs=d=>{const L=[(d.prof||'Sem professor').trim()];(d.subs||[]).forEach(s=>{if(s.prof&&!L.includes(s.prof.trim()))L.push(s.prof.trim())});return L};
const cpdCurto=d=>{const s=(d.sig||[])[0];return d.comp==='tecnologica'&&d.det?d.det:(s&&normSig(s)!=='ufcd'?s:d.nome.replace(/^UFCD\s*/i,'').slice(0,18))};
/* opt.ini: simular desde o início do ano sem pontos de situação (planeamento inicial) */
function cpdSim(a,nome,opt){opt=opt||{};const M=cpmM(nome),L=cpmLimites(a,M),c=CAL(),h=horarioDe(a,nome);const hoje=isoHoje();
  const D=M.disc.filter(d=>cpmAulas(d.horas)>0);const need={},done={},fim={},log=[],livres=[];D.forEach(d=>{need[d.id]=cpmAulas(d.horas);done[d.id]=0});
  const P0=opt.ini?null:(M.pontos||[]).filter(p=>p.data<=hoje).sort((x,y)=>x.data.localeCompare(y.data)).pop()||null;
  let desde=L.ini;if(P0){desde=cpdMais(P0.data,1);D.forEach(d=>{const v=P0.dadas&&P0.dadas[d.id];if(v!=null&&v!=='')done[d.id]=+v})}
  if(!opt.ini)D.forEach(d=>{done[d.id]+=+d.aj||0});
  D.forEach(d=>{if(done[d.id]>=need[d.id])fim[d.id]='feito'});
  const aulas=h?h.aulas.slice().sort((x,y)=>x.dia-y.dia||x.ini-y.ini):[];
  const base=x=>{const k=normSig(x.ab);return D.filter(d=>(d.sig||[]).some(s=>normSig(s)===k))};
  const R=opt.ini?[]:(M.reat||[]).filter(r=>r.destino);const SEM=opt.ini?{}:M.sem||{};const pool=M.pool!==false;
  const aberta=id=>id&&need[id]!=null&&done[id]<need[id];
  let manAplic=!!opt.ini;
  for(let iso=L.ini;iso<=L.fim;iso=cpdMais(iso,1)){
    if(!manAplic&&iso>=hoje){D.forEach(d=>{if(d.dadas!=null&&d.dadas!==''){done[d.id]=+d.dadas;if(done[d.id]>=need[d.id]&&!fim[d.id])fim[d.id]='feito'}});manAplic=true}
    if(iso<desde)continue;
    const t=cpmTipo(iso,M,L,c);if(t!=='let')continue;const w=dataDeIso(iso).getDay();const wk=SEM[cpdSeg(iso)]||{};
    aulas.filter(x=>x.dia===w).forEach(x=>{const sk=cpdSk(x);const B=base(x);if(!B.length&&wk[sk]==null)return;
      let id=null,via='horario';
      if(wk[sk]!=null&&wk[sk]!==''){id=wk[sk]==='livre'?null:wk[sk];via='semana';if(id&&!aberta(id))id=null}
      else{const B0=B.find(d=>aberta(d.id))||null;const dono=B[B.length-1];
        for(const r of R){if(r.desde&&iso<r.desde)continue;if(r.ate&&iso>r.ate)continue;if(!aberta(r.destino))continue;
          if(r.origem==='*'){continue}
          if(!B.some(d=>d.id===r.origem))continue;if(r.quando==='fim'&&aberta(r.origem))continue;id=r.destino;via='cedido';break}
        if(!id&&B0)id=B0.id;
        if(!id&&pool){const pr=cpdProfEm(dono,iso);const o=D.find(d=>aberta(d.id)&&cpdProfEm(d,iso)===pr);if(o){id=o.id;via='professor'}}
        if(!id){for(const r of R){if(r.origem!=='*')continue;if(r.desde&&iso<r.desde)continue;if(r.ate&&iso>r.ate)continue;if(aberta(r.destino)){id=r.destino;via='livre';break}}}}
      if(!id){livres.push({iso,sk,x});log.push({iso,sk,id:null,via:'livre'});return}
      done[id]++;const d=D.find(z=>z.id===id);log.push({iso,sk,id,n:done[id],via,prof:cpdProfEm(d,iso)});if(done[id]>=need[id]&&!fim[id])fim[id]=iso})}
  /* antes do último ponto de situação: as aulas já contadas nesse ponto também aparecem no horário semanal
     (numeradas para trás a partir dos tempos dados que o ponto registou) */
  if(P0&&desde>L.ini){const cnt={};D.forEach(d=>{const v=P0.dadas&&P0.dadas[d.id];cnt[d.id]=v!=null&&v!==''?+v:0});const H=[];
    for(let iso=cpdMais(desde,-1);iso>=L.ini;iso=cpdMais(iso,-1)){const t=cpmTipo(iso,M,L,c);if(t!=='let')continue;const w=dataDeIso(iso).getDay();const wk=SEM[cpdSeg(iso)]||{};
      aulas.filter(x=>x.dia===w).slice().reverse().forEach(x=>{const sk=cpdSk(x);const B=base(x);let id=null;
        if(wk[sk]!=null&&wk[sk]!==''){id=wk[sk]==='livre'?null:wk[sk];if(id&&!(cnt[id]>0))id=null}
        else{const d=B.slice().reverse().find(d=>cnt[d.id]>0);if(d)id=d.id}
        if(!B.length&&!id&&wk[sk]==null)return;
        if(!id){H.push({iso,sk,id:null,via:'livre',hist:1});return}
        const d=D.find(z=>z.id===id);H.push({iso,sk,id,n:cnt[id],via:'hist',hist:1,prof:cpdProfEm(d,iso)});cnt[id]--})}
    log.unshift(...H.reverse())}
  /* por professor: total global de tempos (todas as disciplinas e UFCD dele) */
  const P={};D.forEach(d=>{const pr=cpdProfEm(d,L.fim);const p=P[pr]=P[pr]||{nome:pr,disc:[],need:0,done:0,fim:'',falta:0};p.disc.push(d);p.need+=need[d.id];p.done+=Math.min(done[d.id],need[d.id]);p.falta+=Math.max(0,need[d.id]-done[d.id])});
  Object.values(P).forEach(p=>{p.fim=p.falta?'':p.disc.map(d=>fim[d.id]).filter(f=>f&&f!=='feito').sort().pop()||'feito'});
  const tot=D.reduce((s,d)=>s+Math.max(0,need[d.id]-done[d.id]),0);const fins=D.map(d=>fim[d.id]).filter(f=>f&&f!=='feito').sort();
  /* tempos que ainda faltam a cada um, semana a semana (para os horários semanais) */
  const dh={};D.forEach(d=>dh[d.id]=done[d.id]);log.forEach(e=>{if(e.id&&e.iso>hoje)dh[e.id]--});Object.values(P).forEach(p=>{p.dh=p.disc.reduce((s,d)=>s+Math.min(Math.max(0,dh[d.id]),need[d.id]),0)});
  return {M,L,c,h,D,need,done,dh,fim,log,livres,P,P0,aulas,turmaFim:tot?'':(fins.pop()||'feito'),falta:tot,hoje}}
/* contagem no fim de cada dia (para os horários semanais: «faltam X» no fim da semana) */
function cpdAte(S_,iso){const n={};S_.D.forEach(d=>n[d.id]=0);let ini={};S_.D.forEach(d=>ini[d.id]=S_.done[d.id]);
  /* parte do total final e desconta o que foi dado depois de iso */
  S_.log.forEach(e=>{if(e.id&&e.iso>iso)ini[e.id]--});return ini}
function cpdSemanasFalta(S_,iso){const n=S_.L.fim>iso?Math.max(1,Math.ceil((dataDeIso(S_.L.fim)-dataDeIso(iso))/(7*864e5))):1;return n}
