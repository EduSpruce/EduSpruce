/* ===================== v0.50 · Conselhos de Turma: fotografias, «O que mudou?» e preparação ===================== */
/* ano.ctFotos = [{id, classe, data, reuniao, em, al:{cid:{n:{disc:nota0a1},f:{disc:faltas},neg,ce,med}}, dec:[ids em aberto], inst:n}] */
const ctFotos=a=>a.ctFotos=a.ctFotos||[];
function ctReunioes(t,a){const L=turmasIrmas(t,a);const ids=new Set(L.map(x=>x.id));const k=normTurma(t.nome);
  return reunioes(a).filter(r=>['ct','avl'].includes(r.tipo)&&(reunTurmas(r,a).some(x=>ids.has(x.id)||normTurma(x.nome)===k)||(r.turmaNome&&normTurma(r.turmaNome)===k))).sort((p,q)=>(p.data||'').localeCompare(q.data||''))}
function ctEstado(t,a){const L=turmasIrmas(t,a);ligarClasse(a);const al={};let inst=0;
  L.forEach(x=>{let D=null;try{D=pnlDados(x,a,null)}catch(_){}inst+=x.instrumentos.length;alunosAval(x).forEach(y=>{const o=al[y.cid]=al[y.cid]||{n:{},f:{},neg:0,ce:0,med:0,nome:y.nome};const l=D&&D.linhas.find(l=>l.a.id===y.id);if(l){if(l.nota!=null)o.n[x.disciplina]=+l.nota.toFixed(4);o.f[x.disciplina]=l.f.tot;if(l.neg)o.neg++}
    const m=y.medidas||{};o.med=['univ','selet','adic'].reduce((s_,k2)=>s_+((m[k2]||[]).length),0);o.ce=contactosEE(a,y.cid).length})});
  return {al,inst}}
function ctFotografar(t,a,r){const E=ctEstado(t,a);const f={id:uid(),classe:classeKey(t),turma:t.nome,data:r?r.data:isoHoje(),reuniao:r?r.id:null,tipo:r?r.tipo:'manual',em:Date.now(),al:E.al,inst:E.inst,
  dec:r?(r.decisoes||[]).map(d=>d.id):[]};ctFotos(a).push(f);save();audit('Conselho de Turma','Fotografia registada',t.nome+' · '+f.data);return f}
function ctAuto(t,a){const hj=isoHoje();const F=ctFotos(a);let n=0;ctReunioes(t,a).filter(r=>r.data&&r.data<=hj).forEach(r=>{if(!F.some(f=>f.reuniao===r.id)){ctFotografar(t,a,r);n++}});return n}
function ctUltima(t,a){const k=classeKey(t);return ctFotos(a).filter(f=>f.classe===k).sort((p,q)=>(p.data||'').localeCompare(q.data||'')||p.em-q.em).pop()}
function ctMudou(t,a,f){const E=ctEstado(t,a);const L=turmasIrmas(t,a);const sec=x=>x&&isSec(x);const td=d=>L.find(x=>x.disciplina===d)||t;
  const sobe=[],desce=[],novNeg=[],recup=[],faltas=[];let novCont=0;
  Object.entries(E.al).forEach(([cid,o])=>{const p=f.al[cid];if(!p)return;Object.keys(o.n).forEach(d=>{const a0=p.n[d],a1=o.n[d];if(a0==null||a1==null)return;const dt=a1-a0;const lim=sec(td(d))?0.025:0.03;if(dt>=lim)sobe.push({o,d,a0,a1});else if(dt<=-lim)desce.push({o,d,a0,a1});
      const n0=negativa(td(d),a0),n1=negativa(td(d),a1);if(!n0&&n1)novNeg.push({o,d,a1});if(n0&&!n1)recup.push({o,d,a1})});
    const f0=Object.values(p.f).reduce((s_,v)=>s_+v,0),f1=Object.values(o.f).reduce((s_,v)=>s_+v,0);if(f1>f0)faltas.push({o,df:f1-f0,f1});novCont+=Math.max(0,o.ce-p.ce)});
  const r=f.reuniao&&reunioes(a).find(x=>x.id===f.reuniao);const decs=r?(r.decisoes||[]):[];const decAb=decs.filter(d=>!d.ok),decOk=decs.filter(d=>d.ok);
  const novos=Object.keys(E.al).filter(c=>!f.al[c]).map(c=>E.al[c]);const sairam=Object.keys(f.al).filter(c=>!E.al[c]).map(c=>f.al[c]);
  return {sobe,desce,novNeg,recup,faltas:faltas.sort((p,q)=>q.df-p.df),novCont,decAb,decOk,r,instNov:Math.max(0,E.inst-(f.inst||0)),novos,sairam}}
function ctPreparacao(t,a){const L=turmasIrmas(t,a);const hj=isoHoje();const f=ctUltima(t,a);const IT=[];
  L.forEach(x=>{const p=perAtual(x);const al=alunosAval(x);const sem=al.filter(y=>ponderada(x,pctsPer(x,y.id,p))==null).length;
    IT.push({ok:!sem,t:`${x.disciplina}: classificação do ${p}.º ${perW().toLowerCase()} para todos os alunos`,m:sem?sem+' aluno'+(sem>1?'s':'')+' sem classificação':'',go:'avaliacao',tid:x.id});
    const E=x.instrumentos.filter(i=>instMax(i)).map(i=>instEstado(x,i));const pend=E.filter(e=>['porclass','parcial','incompleta'].includes(e.e)).length;
    IT.push({ok:!pend,t:`${x.disciplina}: avaliações classificadas`,m:pend?pend+' por classificar ou incompleta'+(pend>1?'s':''):'',go:'instrumentos',tid:x.id});
    let D=null;try{D=pnlDados(x,a,null)}catch(_){}if(D&&D.dadas.length)IT.push({ok:!D.porConf,t:`${x.disciplina}: chamada confirmada em todas as aulas dadas`,m:D.porConf?D.porConf+' aula'+(D.porConf>1?'s':'')+' por confirmar':'',go:'sumarios',tid:x.id});
    try{const M=intMomentos(x,a).find(m=>m.p===p&&m.data&&m.data<=hj);if(M){const R=(x.interc||{})[M.id]||{};const fal=al.filter(y=>!R[y.id]).length;IT.push({ok:!fal,t:`${x.disciplina}: avaliação intercalar do ${p}.º ${perW().toLowerCase()}`,m:fal?fal+' por avaliar':'',go:'intercalar',tid:x.id})}}catch(_){}});
  const E=ctEstado(t,a);const desde=f?f.data:'0000';const prec=Object.entries(E.al).filter(([cid,o])=>o.neg||Object.values(o.f).reduce((s_,v)=>s_+v,0)>=4);
  const semC=prec.filter(([cid])=>!contactosEE(a,cid).some(c=>(c.data||'')>=desde));
  IT.push({ok:!semC.length,t:'Contacto com o EE dos alunos com negativas ou muitas faltas'+(f?' desde o último CT':''),m:semC.length?semC.map(([,o])=>o.nome.split(' ')[0]).slice(0,6).join(', ')+(semC.length>6?'…':''):'',go:'turma'});
  const tres=Object.values(E.al).filter(o=>o.neg>=3&&!o.med);IT.push({ok:!tres.length,t:'Medidas de apoio para alunos com 3 ou mais negativas',m:tres.length?tres.map(o=>o.nome.split(' ')[0]).join(', '):'',go:'alunos'});
  if(f&&f.reuniao){const r=reunioes(a).find(x=>x.id===f.reuniao);const ab=r?(r.decisoes||[]).filter(d=>!d.ok):[];IT.push({ok:!ab.length,t:'Deliberações do último CT executadas',m:ab.length?ab.length+' em aberto':'',go:'reunioes'})}
  return IT}
function ctPainel(t,a){const novas=ctAuto(t,a);const f=(UI.ctRef&&ctFotos(a).find(x=>x.id===UI.ctRef&&x.classe===classeKey(t)))||ctUltima(t,a);const hj=isoHoje();const prox=ctReunioes(t,a).find(r=>r.data>=hj);const IT=ctPreparacao(t,a);const nok=IT.filter(i=>i.ok).length;
  const nm=o=>esc(o.nome.split(' ').slice(0,2).join(' '));const vv=(d,v)=>{const x=turmasIrmas(t,a).find(z=>z.disciplina===d)||t;return fmtNota(x,v)};
  let mud='';if(f){const M=ctMudou(t,a,f);const blk=(tit,cls,L,fn)=>L.length?`<div class="ctm ${cls}"><b>${tit} <span class="tag">${L.length}</span></b><ul>${L.slice(0,8).map(x=>`<li>${fn(x)}</li>`).join('')}${L.length>8?`<li class="mut">… e mais ${L.length-8}</li>`:''}</ul></div>`:'';
    mud=`<div class="ctmg">${blk('Novas negativas','bad',M.novNeg,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a1)}`)}${blk('Recuperações concluídas','ok',M.recup,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a1)}`)}${blk('Subidas','ok',M.sobe,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a0)} → <b>${vv(x.d,x.a1)}</b>`)}${blk('Descidas','w',M.desce,x=>`${nm(x.o)} · ${esc(x.d)} ${vv(x.d,x.a0)} → <b>${vv(x.d,x.a1)}</b>`)}${blk('Mais faltas','w',M.faltas,x=>`${nm(x.o)} · +${x.df} (total ${x.f1})`)}${blk('Deliberações ainda por executar','bad',M.decAb,d=>`${esc(d.t)}${d.resp?' <span class="mut">· '+esc(d.resp)+'</span>':''}${d.prazo?' <span class="mut">· '+fmtIso(d.prazo)+'</span>':''}`)}${blk('Deliberações concluídas','ok',M.decOk,d=>esc(d.t))}
      ${M.novos.length?blk('Alunos novos','',M.novos,o=>nm(o)):''}${M.sairam.length?blk('Deixaram de frequentar','',M.sairam,o=>nm(o)):''}</div>
      <p class="mut" style="margin:8px 0 0">${M.instNov} instrumento${M.instNov===1?'':'s'} novo${M.instNov===1?'':'s'} · ${M.novCont} contacto${M.novCont===1?'':'s'} com o EE registado${M.novCont===1?'':'s'} desde ${fmtIsoL(f.data)}.${!M.novNeg.length&&!M.recup.length&&!M.sobe.length&&!M.desce.length&&!M.faltas.length?' Sem alterações relevantes nas classificações e faltas.':''}</p>`}
  return `<div class="png2 ctwrap"><section class="card"><div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">${ic('meet',18)} O Que Mudou Desde o Último CT?</h2><span class="sp1"></span><button class="btn sm" id="ct-foto" title="Guardar agora o estado da turma para comparar mais tarde">${ic('image',13)} Registar Fotografia</button></div>
      ${f?`<p class="hint" style="margin:4px 0 10px">Comparação com ${f.tipo==='manual'?'a fotografia de':esc((REUN_T[f.tipo]||{}).n||'CT')+' de'} <b>${fmtIsoL(f.data)}</b>${novas?' (registada agora)':''}.</p>${mud}`:`<p class="mut" style="margin:10px 0">Ainda não há fotografia de um Conselho de Turma. É registada automaticamente quando passa a data de um CT marcado em Reuniões, ou agora com «Registar Fotografia».</p>`}
      ${ctFotos(a).filter(x=>x.classe===classeKey(t)).length>1?`<details class="cthist"><summary>Fotografias anteriores</summary>${ctFotos(a).filter(x=>x.classe===classeKey(t)).slice().reverse().map(x=>`<div class="dsln"><span>${fmtIsoL(x.data)} · ${esc(x.tipo==='manual'?'manual':(REUN_T[x.tipo]||{}).ab||'')}</span><button class="btn sm" data-ctcmp="${x.id}">Comparar</button></div>`).join('')}</details>`:''}</section>
    <section class="card"><div class="row" style="gap:8px"><h2 style="margin:0">${ic('checks',18)} Preparação do ${prox?esc((REUN_T[prox.tipo]||{}).ab||'CT')+' de '+fmtIso(prox.data):'Próximo CT'}</h2><span class="sp1"></span><span class="tag ${nok===IT.length?'ok':'w'}">${nok}/${IT.length}</span></div>
      <div class="ctpb"><i style="width:${Math.round(nok/Math.max(1,IT.length)*100)}%"></i></div>
      <ul class="ctck">${IT.map((i,k)=>`<li class="${i.ok?'ok':''}"><span class="ctci">${ic(i.ok?'check':'alert',13)}</span><span><b>${esc(i.t)}</b>${i.m?`<small>${esc(i.m)}</small>`:''}</span>${i.ok?'':`<button class="btn sm" data-ctgo="${k}">Resolver</button>`}</li>`).join('')}</ul></section></div>`}
function bindCT(t,a){const IT=ctPreparacao(t,a);
  const fb=$('#ct-foto');if(fb)fb.onclick=()=>{ctFotografar(t,a,null);UI.ctRef=null;toast('Fotografia da turma registada','ok');vPainel()};
  $$('#view [data-ctgo]').forEach(b=>b.onclick=()=>{const i=IT[+b.dataset.ctgo];if(!i)return;if(i.go==='turma'){const el=$('#view .tctb');if(el)el.scrollIntoView({behavior:'smooth'});return}if(i.tid)S.turmaAtiva=i.tid;PNL().vista='disc';go(i.go)});
  $$('#view [data-ctcmp]').forEach(b=>b.onclick=()=>{const f=ctFotos(a).find(x=>x.id===b.dataset.ctcmp);if(!f)return;UI.ctRef=f.id;vPainel();toast('A comparar com '+fmtIsoL(f.data))})}
{const _vtc=vTurmaCompleta;vTurmaCompleta=function(t,a){return ctPainel(t,a)+_vtc.apply(this,arguments)}}
{const _btc=bindTC;bindTC=function(t,a){_btc.apply(this,arguments);bindCT(t,a)}}

