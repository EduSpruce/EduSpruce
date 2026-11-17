/* ===================== v0.46: relatórios individuais — PDF único, um por aluno ou ZIP ===================== */
function relAutoBlocos(t,x,per){const AV=((x.autoavD||{})[per])||{};const dom=AV.dom||{};const nota=AV.nota||((x.autoav||{})[per])||'';const L=(t.dominios||[]).filter(d=>dom[d.id]);
  if(!L.length&&!nota&&!AV.forte&&!AV.melhorar)return [];const lab=k=>{const z=AUTO_N.find(q=>String(q[0])===String(k));return z?z[1]:String(k)};
  const R=[{h:'Autoavaliação'}];if(L.length)R.push({tabela:{cab:['Domínio','Autoavaliação'],linhas:L.map(d=>[d.nome,lab(dom[d.id])])}});
  const tx=[nota?'Classificação que propõe: '+nota+'.':'',AV.forte?'O que fiz bem: '+AV.forte:'',AV.melhorar?'O que posso melhorar: '+AV.melhorar:''].filter(Boolean);tx.forEach(z=>R.push({p:z}));return R}
function relBlocos(t,x,per){const P=periodos().filter(p=>p<=per);const nfin=ponderada(t,pctsFinal(t,x.id,per));const men=temMencoes(t);
  return [{h:'Relatório Individual — '+x.nome},{kv:[['Nome',x.nome],['N.º',x.num],['Turma',x.origem||t.nome],['Disciplina',t.disciplina]],foto:fotoSrc(x)},
    {tabela:{cab:['Domínio','Ponderação',...P.map(perNome),...(men?['Menção']:[])],linhas:[...t.dominios.map(d=>[d.nome,d.peso+'%',...P.map(p=>pctD(t,domPer(t,x.id,d.id,p))||'—'),...(men?[(mencao(t,pctsFinal(t,x.id,per)[d.id])||{}).nome||'—']:[])]),
      ['Classificação','',...P.map(p=>fmtNota(t,ponderada(t,pctsPer(t,x.id,p)))||'—'),...(men?[nfin!=null?'Nível '+nivel(t,nfin):'']:[])]]}},
    ...relAutoBlocos(t,x,per),{h:'Síntese Descritiva'},{p:(x.sintese&&x.sintese[per])||sintese(t,x,per),just:1,ind:1},...((x.obsPer||{})[per]?[{h:'Observações'},{p:x.obsPer[per],just:1}]:[])]}
function relSpec(t,L,per){const spec={titulo:'Relatórios Individuais',subtitulo:t.nome+' · '+t.disciplina+' · '+perNome(per),escola:escolaDe(t),turma:t,blocos:[],assinaturas:[profAssin(),'O(A) Encarregado(a) de Educação']};
  L.forEach((x,i)=>{if(i)spec.blocos.push({pb:true});spec.blocos.push(...relBlocos(t,x,per))});if(L.length===1){spec.titulo='Relatório Individual';spec.subtitulo=L[0].nome+' · '+t.nome+' · '+t.disciplina+' · '+perNome(per)}return spec}
const nomeFich=x=>String(x).replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim();
/* ZIP mínimo (sem compressão) */
const CRCT=(()=>{const T_=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T_[n]=c>>>0}return T_})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRCT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zipCriar(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;const d=new Date();const dt=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF,dd=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
  files.forEach(f=>{const nm=enc.encode(f.nome);const data=f.dados instanceof Uint8Array?f.dados:new Uint8Array(f.dados);const crc=crc32(data);const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,data);const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+data.length});
  const csz=cen.reduce((s,x)=>s+x.length,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csz,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
async function relExportar(){const t=T();if(!t)return;const per=UI.relPer||perAtual(t);const todos=alunosAval(t);const sel=UI.relAluno&&UI.relAluno!=='all'?todos.filter(x=>x.id===UI.relAluno):todos;if(!sel.length)return toast('Sem alunos para exportar','aviso');
  const v=sel.length===1?'um':await avisoModal('Exportar relatórios ('+sel.length+' alunos)',['PDF único: todos os relatórios num só ficheiro, um por página.','Um PDF por aluno: descarrega cada relatório num ficheiro separado.','ZIP: um único ficheiro .zip com um PDF por aluno (recomendado para enviar ou arquivar).'],[{t:ic('file',15)+' PDF Único',v:'um'},{t:ic('download',15)+' Um PDF por Aluno',v:'cada'},{t:ic('folder',15)+' ZIP por Aluno',c:'pri',v:'zip'},{t:'Cancelar',v:null}]);
  if(!v)return;const base=nomeFich(t.nome+' '+t.disciplina+' '+per+'.º '+perW());
  if(v==='um')return pdfDocumento(relSpec(t,sel,per),sel.length===1?nomeFich('Relatório '+String(sel[0].num).padStart(2,'0')+' '+sel[0].nome+' - '+base):'Relatórios '+base);
  const out=[];for(let k=0;k<sel.length;k++){const x=sel[k];try{ocupado&&ocupado('A criar '+(k+1)+' de '+sel.length+'…')}catch(_){}const bytes=await pdfDocumento(relSpec(t,[x],per),'',{blob:true});if(bytes)out.push({nome:nomeFich(String(x.num).padStart(2,'0')+' - '+x.nome)+'.pdf',dados:bytes})}
  try{livre&&livre()}catch(_){}if(!out.length)return toast('Não foi possível criar os PDF','erro');
  if(v==='zip'){download('Relatórios '+base+'.zip',zipCriar(out.map(f=>({nome:'Relatórios '+base+'/'+f.nome,dados:f.dados}))),'application/zip');toast(out.length+' relatórios num ZIP','ok');return}
  for(const f of out){download('Relatório '+f.nome.replace(/\.pdf$/,'')+' - '+base+'.pdf',f.dados,'application/pdf');await new Promise(r=>setTimeout(r,350))}toast(out.length+' PDF exportados','ok')}
{const _vR=vRelatorios;vRelatorios=function(){const r=_vR.apply(this,arguments);try{const bx=$('#barx');if(bx&&!$('#b-relexp')){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-relexp">${ic('folder',15)} Exportar Todos…</button>`);$('#b-relexp').onclick=relExportar}}catch(_){}return r};if(go._f)go._f.relatorios=vRelatorios}

/* ===================== v0.47: em branco ≠ zero · confirmação de gravação ===================== */
function gridMarcar(t,i){const g=$('#grid');if(!g)return;$$('#grid tbody tr[data-a]').forEach(tr=>{const n=i.notas[tr.dataset.a];const av=!!n&&i.itens.some(it=>n[it.id]!=null&&n[it.id]!=='');
  tr.querySelectorAll('input[data-i]').forEach(x=>{const v=x.value.trim();x.classList.toggle('gvz',av&&v==='');x.classList.toggle('gzero',v!==''&&num(v)===0);x.placeholder=av&&v===''?(i.branco==='zero'?'0':'—'):'';x.title=v===''?(av?(i.branco==='zero'?'Em branco — conta como 0':'Em branco — por classificar (não conta)'):'Sem classificação'):num(v)===0?'Zero (classificado com 0)':''})
  const pend=av?i.itens.filter(it=>!it.oralLig&&itPend(n,it,i)).length:0;const nm=tr.querySelector('.stk');if(nm){let b=nm.querySelector('.gpend');if(pend){if(!b){nm.insertAdjacentHTML('beforeend','<span class="gpend"></span>');b=nm.querySelector('.gpend')}b.textContent='⌀ '+pend;b.title=i.branco==='zero'?'Itens em branco contam como 0':'Itens em branco ainda não contam para a nota'}else if(b)b.remove()}})}
function gravConf(el){const tm=new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});let sv=$('#gr-sv');if(!sv){const h=$('#i-body .hint');if(h){h.insertAdjacentHTML('beforebegin','<div id="gr-sv" class="grsv" role="status" aria-live="polite"></div>');sv=$('#gr-sv')}}
  if(sv){sv.innerHTML=`${ic('check',14)} Guardado às ${tm}`;sv.classList.remove('pulse');void sv.offsetWidth;sv.classList.add('pulse')}if(el){el.classList.remove('gok');void el.offsetWidth;el.classList.add('gok')}}
{const _iN2=instNotas;instNotas=function(t,i){const r=_iN2.apply(this,arguments);try{const h=$('#i-body .hint');if(h&&!$('#gr-br')){h.insertAdjacentHTML('afterend',`<div class="grbr" id="gr-br"><span>${ic('info',14)} Células em branco num aluno já classificado:</span><div class="seg" role="group" aria-label="Células em branco"><button type="button" data-br="pend" class="${i.branco!=='zero'?'on':''}">Por classificar (não contam)</button><button type="button" data-br="zero" class="${i.branco==='zero'?'on':''}">Contam como 0</button></div><span class="mut">Para dar zero, escreva <b>0</b>. Linha toda em branco = não avaliado.</span></div>`);
    $$('#gr-br [data-br]').forEach(b=>b.onclick=()=>{i.branco=b.dataset.br;save();manterPosicao(()=>instNotas(t,i));toast(i.branco==='zero'?'Células em branco contam como 0':'Células em branco ficam por classificar','ok')})}
  gridMarcar(t,i);$$('#grid input[data-i]').forEach(x=>{x.addEventListener('input',()=>gridMarcar(t,i));x.addEventListener('change',()=>{setTimeout(()=>gravConf(x),30)})})}catch(e){console.warn(e)}return r}}

/* ===================== v0.47: Avaliação Intercalar (por momento definido no calendário) ===================== */
TITLES.intercalar='Avaliação intercalar';NEEDS_T.push('intercalar');
{const h=$('#tnavHold');const ref=h&&h.querySelector('[data-v="avaliacao"]');if(ref&&!h.querySelector('[data-v="intercalar"]')){ref.insertAdjacentHTML('beforebegin',`<button class="nav tnav" data-v="intercalar" title="Avaliação Intercalar"><span data-ico="flag"></span><span class="lbl">Avaliação Intercalar</span></button>`);const b=h.querySelector('[data-v="intercalar"]');b.querySelector('[data-ico]').innerHTML=ic('flag',18);b.onclick=()=>go('intercalar')}}
{const _gI2=go;go=function(v){const r=_gI2.apply(this,arguments);if(go._f&&go._f.intercalar!==vIntercalar)go._f.intercalar=vIntercalar;return r}}
const INT_M=['Apenas Descritiva','Insuficiente','Suficiente','Bom','Muito Bom'];
function intMomentos(t,a){const P=intercalarPeriodos(a);return P.map(p=>{const d=intercalarDe(a,p);const per=(a.calendario&&a.calendario.periodos||[]).find(x=>x.n===p);return {p,id:'p'+p,data:d&&d.data,fim:d&&(d.fim||d.data),per}})}
function intRegs(t,mid){t.interc=t.interc||{};return t.interc[mid]=t.interc[mid]||{}}
function intAssid(t,a,aid,ate){let L=[];try{L=listaAulas(t,a)}catch(_){}const ini=(L[0]||{}).data;const X=L.filter(x=>x.data<=ate);const prev=X.length;const dadas=X.filter(x=>x.licao&&!(x.falta&&!x.falta.subst));const conf=dadas.filter(aulaConf);let FI=0,FJ=0,FD=0;
  conf.forEach(x=>{const p=(x.s&&x.s.pres||{})[aid];if(!p||!p.f)return;if(p.f==='FD')FD++;else if(p.j||p.just)FJ++;else FI++});const D=dadas.length;return {P:prev,D,A:conf.length-FI-FJ-FD,FI,FJ,FD,PC:D-conf.length}}
function intSugestao(t,aid,p){const f=ponderada(t,pctsPer(t,aid,p));if(f==null)return '';const q=pctCanon(t,f);return q<50?'Insuficiente':q<70?'Suficiente':q<90?'Bom':'Muito Bom'}
function vIntercalar(){const t=T();if(!t)return go('turmas');const a=A();const M=intMomentos(t,a);
  if(!M.length){$('#view').innerHTML=`<div class="card empty">${ic('flag',30)}<br><b>Sem momentos de avaliação intercalar</b><br><span class="mut">Defina os períodos com avaliação intercalar e as datas no Calendário Escolar.</span><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" data-goview="calendario">${ic('calendar',15)} Calendário Escolar</button></div></div>`;$$('#view [data-goview]').forEach(b=>b.onclick=()=>go(b.dataset.goview));return}
  const hj=isoHoje();if(UI.intM==null||!M.some(m=>m.id===UI.intM)){const atual=M.find(m=>m.data&&m.data<=hj&&(m.fim||m.data)>=hj)||M.find(m=>m.data&&m.data>=hj)||M.slice().reverse().find(m=>m.data)||M[0];UI.intM=atual.id}
  const k=M.findIndex(m=>m.id===UI.intM);const m=M[k];const R=intRegs(t,m.id);const al=alunosFiltro(t).filter(x=>x.frequenta!==false);const ate=m.fim||m.data||hj;UI.intEd=UI.intEd||{};
  const feitos=al.filter(x=>R[x.id]&&(R[x.id].sem||R[x.id].m)).length;
  barBtns([{id:'b-intcsv',t:ic('download',15)+' Exportar CSV',f:()=>download('Intercalar '+m.p+'.º '+t.nome+' '+t.disciplina+'.csv',csv([['N.º','Nome','Previstas','Dadas','Assistidas','FI','FJ','FD','Avaliação','Observação'],...al.map(x=>{const r=R[x.id]||{};const s=intAssid(t,a,x.id,ate);return [x.num,x.nome,s.P,s.D,s.A,s.FI,s.FJ,s.FD,r.sem?'Sem avaliação':r.m||'',r.obs||'']})]),'text/csv')},{id:'b-intpr',t:ic('printer',15)+' Imprimir',f:()=>window.print()}]);
  const cell=x=>{const r=R[x.id]||{};const ed=UI.intEd[x.id];const sug=intSugestao(t,x.id,m.p);
    if(ed)return `<div class="ited" data-ited="${x.id}"><label class="itck"><input type="checkbox" data-isem ${r.sem?'checked':''}> Sem avaliação</label>
      <div class="itmen" ${r.sem?'hidden':''}><label>Menção</label><div class="itmw"><select data-imen><option value="">(selecione)</option>${INT_M.map(o=>`<option ${r.m===o?'selected':''}>${o}</option>`).join('')}</select>${sug?`<button type="button" class="btn sm" data-isug="${esc(sug)}" title="Com base nas classificações do ${m.p}.º ${perW().toLowerCase()} até agora">${ic('sparkle',12)} Sugerir: ${esc(sug)}</button>`:''}</div></div>
      <label class="itck"><input type="checkbox" data-iobsck ${r.obs?'checked':''}> Observação</label><textarea data-iobs ${r.obs?'':'hidden'} rows="3" placeholder="Observação para o encarregado de educação e o conselho de turma…">${esc(r.obs||'')}</textarea>
      <div class="itacts"><button type="button" class="btn" data-icanc>Cancelar</button><button type="button" class="btn pri" data-isub>${ic('check',14)} Submeter</button></div></div>`;
    return `<div class="itview"><div>${r.sem?'<span class="tag">Sem avaliação</span>':r.m?`<span class="itm m${INT_M.indexOf(r.m)}">${esc(r.m)}</span>`:'<i class="mut">Por avaliar</i>'}${r.obs?`<p class="itobs">${esc(r.obs)}</p>`:''}${r.q?`<small class="mut itq">${ic('check',11)} guardado ${new Date(r.q).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small>`:''}</div><button type="button" class="btn sm" data-iedit="${x.id}">${ic('pencil',12)} Editar</button></div>`};
  $('#view').innerHTML=`<div class="card intc"><div class="inth"><button type="button" class="btn ico" data-imov="-1" ${k?'':'disabled'} aria-label="Momento anterior">‹</button>
      <div class="intt"><b>${m.p}.º ${perW()} · Intercalar</b><small class="mut">${m.data?fmtIso(m.data)+(m.fim&&m.fim!==m.data?' a '+fmtIso(m.fim):''):'data por definir'} · assiduidade contada até ${fmtIso(ate)}</small></div>
      <span class="tag ${feitos===al.length?'ok':''}">${feitos}/${al.length} avaliados</span><button type="button" class="btn ico" data-imov="1" ${k<M.length-1?'':'disabled'} aria-label="Momento seguinte">›</button></div>
    <div class="intbar"><span class="mut">Aval.</span>${selOrigem(t)}<span class="sp1"></span><button type="button" class="btn sm" data-iall>${ic('pencil',13)} Editar Todos</button>${Object.keys(UI.intEd).length?`<button type="button" class="btn sm pri" data-isuball>${ic('check',13)} Submeter Todos</button>`:''}</div>
    <div class="intl">${al.map(x=>{const s=intAssid(t,a,x.id,ate);return `<div class="intr ${UI.intEd[x.id]?'ed':''}"><div class="intal"><div class="intan">${avatar(x,48)}<div><b>${esc(x.nome)}</b><small class="mut">${idade(x.nasc)?'Idade: '+idade(x.nasc)+' anos':'n.º '+esc(numAl(x))}</small></div></div>
        <div class="intas" role="table" aria-label="Assiduidade"><div role="row">${['P','D','A','FI','FJ','FD',...(s.PC?['PC']:[])].map(h=>`<span role="columnheader" title="${{P:'Aulas previstas',D:'Aulas dadas',A:'Aulas assistidas (só aulas com chamada confirmada)',FI:'Faltas injustificadas',FJ:'Faltas justificadas',FD:'Faltas disciplinares',PC:'Aulas com chamada por confirmar'}[h]}">${h}</span>`).join('')}</div><div role="row">${['P','D','A','FI','FJ','FD',...(s.PC?['PC']:[])].map(h=>`<b role="cell" class="${h.startsWith('F')&&s[h]?'f':''}${h==='PC'?' pc':''}">${s[h]}</b>`).join('')}</div></div></div>
      <div class="intv">${cell(x)}</div></div>`}).join('')}</div>
    <div class="intbar"><span class="sp1"></span><button type="button" class="btn sm" data-iall>${ic('pencil',13)} Editar Todos</button>${Object.keys(UI.intEd).length?`<button type="button" class="btn sm pri" data-isuball>${ic('check',13)} Submeter Todos</button>`:''}</div>
    <p class="hint">P: aulas previstas · D: dadas · A: assistidas (contadas só nas aulas com chamada confirmada) · FI/FJ/FD: faltas injustificadas, justificadas e disciplinares · PC: aulas com chamada por confirmar. A sugestão de menção usa as classificações do ${m.p}.º ${perW().toLowerCase()} até agora.</p></div>`;
  const re=()=>manterPosicao(vIntercalar);
  $$('[data-imov]').forEach(b=>b.onclick=()=>{UI.intM=M[k+(+b.dataset.imov)].id;UI.intEd={};re()});
  $$('[data-iedit]').forEach(b=>b.onclick=()=>{UI.intEd[b.dataset.iedit]=1;re();setTimeout(()=>{const s_=$(`[data-ited="${b.dataset.iedit}"] select`);if(s_)s_.focus()},50)});
  $$('[data-iall]').forEach(b=>b.onclick=()=>{al.forEach(x=>UI.intEd[x.id]=1);re()});
  const ler=box=>{const aid=box.dataset.ited;return {aid,sem:box.querySelector('[data-isem]').checked,m:box.querySelector('[data-imen]').value,obs:box.querySelector('[data-iobsck]').checked?box.querySelector('[data-iobs]').value.trim():''}};
  const gravar=v=>{if(!v.sem&&!v.m&&!v.obs){delete R[v.aid];return true}if(!v.sem&&!v.m){toast('Escolha a menção ou assinale «Sem avaliação»','aviso');return false}R[v.aid]={sem:v.sem,m:v.sem?'':v.m,obs:v.obs,q:Date.now()};return true};
  $$('[data-ited]').forEach(box=>{const aid=box.dataset.ited;
    box.querySelector('[data-isem]').onchange=e=>{box.querySelector('.itmen').hidden=e.target.checked};
    box.querySelector('[data-iobsck]').onchange=e=>{const ta=box.querySelector('[data-iobs]');ta.hidden=!e.target.checked;if(e.target.checked)ta.focus()};
    const sg=box.querySelector('[data-isug]');if(sg)sg.onclick=()=>{box.querySelector('[data-imen]').value=sg.dataset.isug};
    box.querySelector('[data-icanc]').onclick=()=>{delete UI.intEd[aid];re()};
    box.querySelector('[data-isub]').onclick=()=>{if(!gravar(ler(box)))return;delete UI.intEd[aid];saveNow();const nm=(al.find(x=>x.id===aid)||{}).nome||'';toast('Guardado: '+nm.split(' ')[0]+' — '+(R[aid]?R[aid].sem?'sem avaliação':R[aid].m:'por avaliar'),'ok');re();
      setTimeout(()=>{const v=$(`[data-iedit="${aid}"]`);const row=v&&v.closest('.intr');if(row){row.classList.add('gok');row.scrollIntoView({block:'nearest'})}},40)}});
  $$('[data-isuball]').forEach(b=>b.onclick=()=>{let n=0,err=0;$$('[data-ited]').forEach(box=>{const v=ler(box);if(gravar(v)){delete UI.intEd[v.aid];n++}else err++});saveNow();toast(err?`${n} guardados · ${err} por completar`:`${n} avaliações intercalares guardadas`,err?'aviso':'ok');re()})}

/* ===================== v0.47: Painel — mais dados sobre o resultado da avaliação ===================== */
{const _vP2=vPainel;vPainel=function(){const r=_vP2.apply(this,arguments);try{const t=T();if(!t)return r;const C=PNL();const P=periodos();const per=C.per==='ano'?null:(C.per?+C.per:perAtual(t));const pRef=per||perAtual(t);const tb=$('#view table.pntb');if(!tb)return r;
  const al=alunosAval(t);const nota=aid=>per==null?ponderada(t,pctsFinal(t,aid,pRef)):ponderada(t,pctsPer(t,aid,per));const N=al.map(a=>({a,f:nota(a.id)}));const ok=N.filter(x=>x.f!=null).sort((x,y)=>y.f-x.f);const med=avg(ok.map(x=>x.f));
  const ant=aid=>{if(pRef<=1){const I=t.instrumentos.filter(i=>+i.periodo===pRef&&instAvaliado(i,aid)&&instMax(i)).sort((a,b)=>(a.data||'').localeCompare(b.data||''));if(I.length<2)return null;const v=I.map(i=>instTotal(i,aid)/instMax(i));return {d:v[v.length-1]-v[0],tx:'do 1.º ao último instrumento'}}const f0=ponderada(t,pctsPer(t,aid,pRef-1)),f1=ponderada(t,pctsPer(t,aid,pRef));return f0==null||f1==null?null:{d:f1-f0,tx:'face ao '+(pRef-1)+'.º '+perW().toLowerCase()}};
  const hdr=[...tb.tHead.rows[0].cells].findIndex(th=>/Avalia/.test(th.textContent));if(hdr<0)return r;
  tb.tHead.rows[0].cells[hdr].insertAdjacentHTML('afterend','<th scope="col">Por Domínio</th><th scope="col">Evolução</th><th scope="col">Posição</th><th scope="col">vs. Turma</th>');
  [...tb.tBodies[0].rows].forEach(tr=>{const aid=tr.dataset.pna;if(!aid)return;const cell=tr.cells[hdr];if(!cell)return;const f=(N.find(x=>x.a.id===aid)||{}).f;
    const pc=per==null?pctsFinal(t,aid,pRef):pctsPer(t,aid,per);const doms=t.dominios.map(d=>({d,v:pc[d.id]})).filter(x=>x.v!=null);const best=doms.slice().sort((a,b)=>b.v-a.v)[0],worst=doms.slice().sort((a,b)=>a.v-b.v)[0];
    if(f!=null){cell.insertAdjacentHTML('beforeend',`<div class="pnbar"><i style="width:${Math.round(f*100)}%;background:${negativa(t,f)?'#dc2626':'var(--acc)'}"></i></div>`)}
    const ev=ant(aid);const pos=ok.findIndex(x=>x.a.id===aid);const dv=f!=null&&med!=null?f-med:null;const U=x=>isSec(t)?(Math.abs(x)*20).toFixed(1).replace('.',','):Math.round(Math.abs(x)*100)+' pp';const Z=x=>isSec(t)?Math.abs(x)*20<0.05:Math.abs(x)*100<0.5;
    cell.insertAdjacentHTML('afterend',`<td><div class="pndm">${doms.map(x=>`<span class="pndc ${x===best&&doms.length>1?'best':''} ${x===worst&&doms.length>1?'worst':''}" style="--dc:${domCor(t,x.d)}" title="${esc(x.d.nome)}: ${pctD(t,x.v)}${x===best?' · ponto forte':x===worst?' · a reforçar':''}"><b>${esc(x.d.ab)}</b><i><u style="height:${Math.round(x.v*100)}%"></u></i><small>${pctD(t,x.v)}</small></span>`).join('')||'<span class="mut">—</span>'}</div></td>
      <td>${ev?`<span class="pnev2 ${ev.d>0.004?'up':ev.d<-0.004?'dn':'eq'}" title="${esc(ev.tx)}">${ev.d>0.004?'▲':ev.d<-0.004?'▼':'='} ${U(ev.d)}</span>`:'<span class="mut">—</span>'}</td>
      <td>${pos>=0?`<b>${pos+1}.º</b><small class="mut">/${ok.length}</small>${pos===0?' 🏆':''}`:'<span class="mut">—</span>'}</td>
      <td>${dv!=null?Z(dv)?'<span class="mut">= média</span>':`<span class="${dv>=0?'sthi':'stlo'}">${dv>=0?'+':'−'}${U(dv)}</span>`:'<span class="mut">—</span>'}</td>`)});
  /* resumo por cima da tabela */
  if(ok.length){const dist=ok.map(x=>x.f);const top=ok[0],low=ok[ok.length-1];const amp=top.f-low.f;const sobe=N.map(x=>({x,e:ant(x.a.id)})).filter(y=>y.e).sort((a,b)=>b.e.d-a.e.d);
    const tw=tb.closest('.tblw,.lst,.scr')||tb;const U=x=>isSec(t)?(Math.abs(x)*20).toFixed(1).replace('.',','):Math.round(Math.abs(x)*100)+' pp';tw.insertAdjacentHTML('beforebegin',`<div class="pnrs"><span>${ic('chart',13)} Média <b>${fmtNota(t,med)}</b></span><span>Mediana <b>${fmtNota(t,stMed(dist))}</b></span><span>Amplitude <b>${U(amp)}</b></span><span>🏆 <b>${esc(top.a.nome.split(' ')[0])}</b> ${fmtNota(t,top.f)}</span><span>🎯 <b>${esc(low.a.nome.split(' ')[0])}</b> ${fmtNota(t,low.f)}</span>${sobe.length&&sobe[0].e.d>0?`<span class="sthi">▲ maior subida: <b>${esc(sobe[0].x.a.nome.split(' ')[0])}</b> +${U(sobe[0].e.d)}</span>`:''}${sobe.length&&sobe[sobe.length-1].e.d<0?`<span class="stlo">▼ maior descida: <b>${esc(sobe[sobe.length-1].x.a.nome.split(' ')[0])}</b> −${U(sobe[sobe.length-1].e.d)}</span>`:''}</div>`)}
  }catch(e){console.warn(e)}return r};if(go._f)go._f.painel=vPainel}

/* ===================== v0.48: editor de tipos de instrumento (chips) ===================== */
const TP_PAL=['#c0392b','#d98b00','#7a4fd0','#2f7fd0','#1a7f37','#0891b2','#db2777','#65a30d','#b45309','#4f46e5','#0d9488','#9333ea','#e11d48','#15803d','#0369a1','#a16207','#7c3aed','#be185d','#047857','#475569'];
function tpCor(x,k){return TP_PAL[k%TP_PAL.length]}
function tpUso(){const u={};(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.tipo)u[i.tipo]=(u[i.tipo]||0)+1})));return u}
function tpEditor(){const box=$('#tpEd'),ta=$('#tp');if(!box||!ta)return;const L=()=>ta.value.split('\n').map(x=>x.trim()).filter(Boolean);
  const set=arr=>{ta.value=arr.join('\n');ta.dispatchEvent(new Event('change'));draw()};
  const draw=()=>{const l=L(),u=tpUso();box.innerHTML=`<div class="tpl">${l.map((x,k)=>`<div class="tpc" draggable="true" data-k="${k}" style="--pc:${tpCor(x,k)}"><span class="tpg" aria-hidden="true">⋮⋮</span><i></i><span class="tpn" contenteditable="plaintext-only" spellcheck="false" data-ren="${k}" title="Clique para mudar o nome">${esc(x)}</span>${u[x]?`<small title="${u[x]} instrumento${u[x]>1?'s':''} com este tipo">${u[x]}</small>`:''}<button type="button" data-rm="${k}" ${u[x]?'disabled title="Em uso"':'title="Remover"'} aria-label="Remover ${esc(x)}">×</button></div>`).join('')}
    <form class="tpadd"><input id="tp-nv" placeholder="Novo tipo…" maxlength="40"><button class="btn sm pri">${ic('plus',13)} Adicionar</button></form></div>`;
    box.querySelector('form').onsubmit=e=>{e.preventDefault();const v=$('#tp-nv').value.trim();if(!v)return;if(L().some(x=>x.toLowerCase()===v.toLowerCase())){toast('Esse tipo já existe','aviso');return}set([...L(),v]);setTimeout(()=>{const n=$('#tp-nv');if(n)n.focus()},30)};
    box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const l=L();l.splice(+b.dataset.rm,1);set(l)});
    box.querySelectorAll('[data-ren]').forEach(el=>{el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();el.blur()}if(e.key==='Escape'){el.textContent=L()[+el.dataset.ren];el.blur()}};
      el.onblur=()=>{const l=L(),k=+el.dataset.ren,v=el.textContent.trim(),o=l[k];if(!v||v===o){el.textContent=o;return}if(l.some((x,j)=>j!==k&&x.toLowerCase()===v.toLowerCase())){toast('Esse tipo já existe','aviso');el.textContent=o;return}
        l[k]=v;let n=0;(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>(t.instrumentos||[]).forEach(i=>{if(i.tipo===o){i.tipo=v;n++}})));set(l);if(n)toast(`Tipo renomeado em ${n} instrumento${n>1?'s':''}`,'ok')}});
    let dk=null;box.querySelectorAll('.tpc').forEach(c=>{c.ondragstart=e=>{dk=+c.dataset.k;c.classList.add('drg');e.dataTransfer.effectAllowed='move'};c.ondragend=()=>c.classList.remove('drg');
      c.ondragover=e=>{e.preventDefault();c.classList.add('ovr')};c.ondragleave=()=>c.classList.remove('ovr');
      c.ondrop=e=>{e.preventDefault();c.classList.remove('ovr');const to=+c.dataset.k;if(dk==null||dk===to)return;const l=L();const [x]=l.splice(dk,1);l.splice(to,0,x);dk=null;set(l)}})};
  draw();const rp=$('#tp-rep');if(rp)rp.onclick=()=>{const u=tpUso();const l=[...TIPOS_INST,...L().filter(x=>!TIPOS_INST.includes(x)&&u[x])];set(l);toast('Tipos predefinidos repostos','ok')}}
new MutationObserver(()=>{const b=$('#tpEd');if(b&&!b.childElementCount)tpEditor()}).observe(document.getElementById('view')||document.body,{childList:true,subtree:true});

/* ===================== v0.48: Avaliação Final mostra a intercalar do período ===================== */
{const _vAvI=vAvaliacao;vAvaliacao=function(){const r=_vAvI.apply(this,arguments);try{const t=T(),a=A();if(!t||!a)return r;const p=UI.per;const M=intMomentos(t,a).find(m=>m.p===+p);if(!M)return r;
  const tb=[...$$('#view table')].find(x=>/Atribu/.test(x.tHead&&x.tHead.textContent||''));if(!tb)return r;const R=(t.interc||{})[M.id]||{};
  const th=tb.tHead.rows[0].querySelector('th.stk');if(!th)return r;th.insertAdjacentHTML('afterend',`<th rowspan="2" class="afint"><button type="button" class="lnk" data-goint title="Abrir a Avaliação Intercalar">Intercalar</button><div class="dh">${M.data?fmtIso(M.data).slice(0,5):''}</div></th>`);
  [...tb.tBodies[0].rows].forEach(tr=>{const aid=tr.dataset.a;const c=tr.querySelector('td.stk');if(!aid||!c)return;const x=R[aid]||{};const k=INT_M.indexOf(x.m);
    c.insertAdjacentHTML('afterend',`<td class="afint">${x.sem?'<span class="mut" title="Sem avaliação intercalar">s/ aval.</span>':x.m?`<span class="itm m${k}" ${x.obs?`title="${esc(x.obs)}"`:''}>${esc(x.m==='Apenas Descritiva'?'Descritiva':x.m)}${x.obs?' ✎':''}</span>`:'<span class="mut">—</span>'}</td>`)});
  const tf=tb.tFoot&&tb.tFoot.rows[0];if(tf){const c=tf.cells[1];if(c){const n=Object.values(R).filter(x=>x.m&&!x.sem);const neg=n.filter(x=>x.m==='Insuficiente').length;c.insertAdjacentHTML('afterend',`<td class="afint"><small class="mut">${n.length?neg+' Ins.':''}</small></td>`)}}
  [...tb.tBodies[0].rows].forEach(tr=>{if(!tr.dataset.a&&tr.cells.length>2){const c=tr.cells[1];if(c)c.insertAdjacentHTML('afterend','<td class="afint"></td>')}});
  const b=$('#view [data-goint]');if(b)b.onclick=()=>{UI.intM=M.id;go('intercalar')}}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}

/* ===================== v0.49 · Esquema dos dados e migrações controladas ===================== */
/* Cada migração tem número, descrição e função. Antes de migrar guarda-se uma cópia (localStorage KEY+'.premig').
   S.esquema regista a versão; S.cfg.migracoes o histórico. Novas alterações de formato: acrescentar aqui. */
const MIGRACOES=[
  {v:2,n:'Chamada confirmada nas aulas que já tinham presenças registadas',f:st=>{(st.anos||[]).forEach(a=>Object.values(a.sumarios||{}).forEach(SM=>Object.values(SM||{}).forEach(x=>{if(x&&x.pres&&Object.keys(x.pres).length&&!x.cham)x.cham=1})))}}
];
const ESQUEMA=()=>Math.max(1,...MIGRACOES.map(m=>m.v));
function migrarDados(semGuardar){const v0=+S.esquema||1;const P=MIGRACOES.filter(m=>m.v>v0).sort((a,b)=>a.v-b.v);if(!P.length){if(!S.esquema)S.esquema=v0;return []}
  if(!semGuardar&&S.anos&&S.anos.length){try{localStorage.setItem(KEY+'.premig',JSON.stringify(S));localStorage.setItem(KEY+'.premigd',new Date().toLocaleString('pt-PT')+' · esquema '+v0)}catch(_){}}
  const feitas=[];P.forEach(m=>{try{m.f(S);S.esquema=m.v;feitas.push(m);(S.cfg=S.cfg||{},S.cfg.migracoes=S.cfg.migracoes||[]).push({v:m.v,n:m.n,em:Date.now()})}catch(e){console.error('Migração '+m.v+' falhou',e)}});
  if(feitas.length&&!semGuardar){try{saveNow();audit('Dados','Formato atualizado para o esquema '+S.esquema,feitas.map(m=>m.n).join(' · '))}catch(_){}}return feitas}
try{migrarDados()}catch(e){console.error(e)}
/* cópias importadas ou recebidas da nuvem também passam pelas migrações */
{const _ap0=aplicarPrefs;aplicarPrefs=function(){try{if((+S.esquema||1)<ESQUEMA())migrarDados()}catch(_){}return _ap0.apply(this,arguments)}}

/* ===================== v0.49 · Estados de avaliação, chamada confirmada, carimbo de dados ===================== */
/* Chamada: uma aula dada só conta para a assiduidade depois de a chamada ser confirmada (aba Presenças aberta e guardada, ou faltas marcadas). */
const aulaConf=x=>!!(x&&x.s&&x.s.cham);
/* Estados de um instrumento:
   agendado   — data futura, sem classificações
   semdata    — sem data e sem classificações
   naoreal    — assinalado como não realizado (adiado/cancelado)
   porclass   — realizado e ainda sem classificações
   parcial    — há alunos por classificar
   incompleta — todos lançados mas com itens em branco/pendentes
   completo   — tudo classificado
   Por aluno: 'faltou' quando o aluno não realizou (i.nr[aid]); não conta como pendência. */
const EST_INST={agendado:['Agendado','calendar','#2563eb'],semdata:['Sem data','calendar','#64748b'],naoreal:['Não realizado','x','#64748b'],porclass:['Por classificar','clipboard','#d97706'],parcial:['Classificação parcial','clipboard','#d97706'],incompleta:['Classificação incompleta','alert','#b45309'],completo:['Classificado','check','#15803d']};
function instAlunoEstado(t,i,aid){if(i.naoReal)return 'naoreal';if(i.nr&&i.nr[aid])return 'faltou';const hj=isoHoje();const av=instAvaliado(i,aid);
  if(!av){if(!i.data)return 'semdata';if(i.data>hj)return 'agendado';return 'porclass'}
  return instPendentes(i,aid).length?'incompleta':'completo'}
function instEstado(t,i){const al=alunosAval(t);const hj=isoHoje();const E={e:'completo',porClass:0,inc:0,faltou:0,feitos:0,tot:al.length};
  if(i.naoReal){E.e='naoreal';return E}
  al.forEach(x=>{const k=instAlunoEstado(t,i,x.id);if(k==='faltou')E.faltou++;else if(k==='porclass'||k==='agendado'||k==='semdata')E.porClass++;else{E.feitos++;if(k==='incompleta')E.inc++}});
  if(!E.feitos){E.e=!i.data?'semdata':i.data>hj?'agendado':'porclass';return E}
  E.e=E.porClass?'parcial':E.inc?'incompleta':'completo';return E}
function chipEstado(E){const [l,icn,c]=EST_INST[E.e]||EST_INST.completo;const extra=E.e==='parcial'?` · ${E.porClass} por classificar`:E.e==='incompleta'?` · ${E.inc} aluno${E.inc>1?'s':''} com itens em branco`:'';return `<span class="ests" style="--ec:${c}" title="${esc(l+extra+(E.faltou?' · '+E.faltou+' não realizou':''))}">${ic(icn,12)} ${l}${E.e==='parcial'?' ('+E.porClass+')':''}</span>`}
/* carimbo: última alteração real dos dados e última sincronização confirmada */
function quandoTs(ts){if(!ts)return '';const d=new Date(ts),h=new Date();const hm=d.toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'});const dd=Math.round((new Date(h.toDateString())-new Date(d.toDateString()))/864e5);return dd===0?'hoje às '+hm:dd===1?'ontem às '+hm:d.toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit'})+' às '+hm}
function ultimaSinc(){let a=0;try{a=Math.max(+(nvL().ultimo||0),+((gsCfg()||{}).ultimo||0))}catch(_){}return a}
function pnlCarimbo(){const m=S._mod||S._ts;const sy=ultimaSinc();return `<span title="Hora da última alteração real dos dados (não da abertura do ecrã)">${ic('pen',12)} Última alteração ${m?quandoTs(m):'—'}</span> · <span title="Última sincronização concluída com a nuvem">${ic('refresh',12)} ${sy?'Sincronizado '+quandoTs(sy):'Sem sincronização'}</span>`}

/* lista de instrumentos: coluna Estado */
{const _vIE=vInstrumentos;vInstrumentos=function(){const r=_vIE.apply(this,arguments);try{const t=T();if(!t||UI.inst)return r;$$('#view table.lst').forEach(tb=>{const h=tb.tHead&&tb.tHead.rows[0];if(!h||h.querySelector('.thest'))return;const k=[...h.cells].findIndex(c=>/Avaliados/.test(c.textContent));if(k<0)return;h.cells[k].insertAdjacentHTML('beforebegin','<th class="thest">Estado</th>');
  [...tb.tBodies[0].rows].forEach(tr=>{const i=t.instrumentos.find(x=>x.id===tr.dataset.irow);if(!i||!tr.cells[k])return;tr.cells[k].insertAdjacentHTML('beforebegin',`<td>${chipEstado(instEstado(t,i))}</td>`)})})}catch(e){console.warn(e)}return r};if(go._f)go._f.instrumentos=vInstrumentos}

/* grelha: instrumento não realizado / aluno não realizou */
{const _iN3=instNotas;instNotas=function(t,i){const r=_iN3.apply(this,arguments);try{const body=$('#i-body');if(!body||!$('#grid'))return r;i.nr=i.nr||{};
  const bar=`<div class="estbar noprint">${chipEstado(instEstado(t,i))}<span class="sp1"></span><label class="chk" title="O instrumento não chegou a realizar-se (adiado, cancelado). Deixa de contar nas pendências."><input type="checkbox" id="gr-nreal" ${i.naoReal?'checked':''}> Não realizado</label></div>`;
  const g=body.querySelector('.gwrap');if(g)g.insertAdjacentHTML('beforebegin',bar);
  $$('#grid tbody tr[data-a]').forEach(tr=>{const aid=tr.dataset.a;const c=tr.querySelector('td.stk');if(!c)return;c.insertAdjacentHTML('beforeend',`<button type="button" class="nrbt ${i.nr[aid]?'on':''}" data-nr="${aid}" title="${i.nr[aid]?'Não realizou — clique para anular':'Assinalar que o aluno não realizou (faltou)'}">${i.nr[aid]?'não realizou':'F'}</button>`);if(i.nr[aid])tr.classList.add('nrrow')});
  $$('#grid [data-nr]').forEach(b=>b.onclick=e=>{e.stopPropagation();const aid=b.dataset.nr;if(i.nr[aid])delete i.nr[aid];else{if(instAvaliado(i,aid)&&!confirm('Este aluno já tem classificações neste instrumento. Assinalar que não realizou mantém-nas mas deixa de as considerar pendentes. Continuar?'))return;i.nr[aid]=1}save();manterPosicao(()=>vInstrumento(i.id))});
  const nr=$('#gr-nreal');if(nr)nr.onchange=()=>{i.naoReal=nr.checked||undefined;save();toast(nr.checked?'Assinalado como não realizado':'Instrumento de novo ativo','ok');manterPosicao(()=>vInstrumento(i.id))}}catch(e){console.warn(e)}return r}}

/* sumários: assinala aulas dadas com chamada por confirmar */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-scham]');if(!b)return;const t=T();if(t)aulaDlg(t,b.dataset.scham,'pres')});

/* v0.49: estilo SGE */
ESTILOS_X.unshift(['sge','SGE (predefinido)','grid','Igual ao SGE: cabeçalho azul-ciano, menus cinzentos, separadores em caixa e tabelas em faixas azuis']);
try{aplicarPrefs()}catch(_){}
/* demonstração: chamada confirmada nas aulas dadas, exceto as duas últimas */
{const _cD=criarDemo;criarDemo=function(){const r=_cD.apply(this,arguments);try{(S.anos||[]).forEach(a=>(a.turmas||[]).forEach(t=>{const L=listaAulas(t,a).filter(x=>x.licao);const SM=sumariosT(a,t);L.slice(0,-2).forEach(x=>{SM[x.k]={...(SM[x.k]||{}),cham:Date.now()}})}));S.esquema=ESQUEMA();save()}catch(e){console.warn(e)}return r}}

/* v0.49: turmas conjuntas — numeração seguida, com o n.º original entre parênteses */
function renumerarConjunta(t){const L=t.alunos.slice().sort((a,b)=>(a.nome||'').localeCompare(b.nome||'','pt',{sensitivity:'base'}));L.forEach((x,k)=>{if(x.numOrig==null)x.numOrig=x.num;x.num=k+1});return L.length}
{const _aDO=atualizarDeOrigens;atualizarDeOrigens=function(t){const antes=new Set(t.alunos.map(x=>x.id));const r=_aDO.apply(this,arguments);try{if(t.alunos.some(x=>x.numOrig!=null)){let mx=Math.max(0,...t.alunos.filter(x=>antes.has(x.id)).map(x=>+x.num||0));t.alunos.filter(x=>!antes.has(x.id)).forEach(x=>{x.numOrig=x.num;x.num=++mx});save()}}catch(e){console.warn(e)}return r}}
{const _vAlR=vAlunos;vAlunos=function(){const r=_vAlR.apply(this,arguments);try{const t=T();if(t&&t.origens&&!$('#b-renum')){const bx=$('#barx');if(bx){bx.insertAdjacentHTML('beforeend',`<button class="btn" id="b-renum" title="Numera 1, 2, 3… por ordem alfabética e guarda o n.º da turma de origem entre parênteses">${ic('list',15)} Numerar Seguido</button>`);$('#b-renum').onclick=()=>{const ja=t.alunos.some(x=>x.numOrig!=null);if(!confirm((ja?'Voltar a numerar':'Numerar')+' os '+t.alunos.length+' alunos de '+t.nome+' por ordem alfabética?\nO número original fica entre parênteses, ex.: n.º 1 (3).'))return;renumerarConjunta(t);save();vAlunos();toast('Alunos numerados de 1 a '+t.alunos.length,'ok')}}}}catch(e){console.warn(e)}return r};if(go._f)go._f.alunos=vAlunos}
{const _gNO=go;go=function(){try{const t=T();document.body.classList.toggle('numorig',!!(t&&t.alunos&&t.alunos.some(x=>x.numOrig!=null)))}catch(_){}return _gNO.apply(this,arguments)}}

/* ===================== v0.50 · Turma comum às disciplinas (aluno único) ===================== */
/* Cada «turma» da app é turma + disciplina. As turmas com o mesmo nome e escola no mesmo ano formam uma classe.
   Os alunos da mesma classe partilham um identificador comum (aluno.cid). Os dados pessoais (CAMPOS_COMUNS)
   são mantidos iguais em todas as disciplinas: uma alteração numa cópia propaga-se às outras ao guardar.
   Registos que pertencem ao aluno e não à disciplina (contactos com o EE) ficam em ano.alunosC[cid]. */
const CAMPOS_COMUNS=['nome','num','processo','numInterno','genero','generoManual','nasc','foto','eeNome','eeParent','eeContacto','email','morada','contactos','contactoAutorizado','ase','repetente','medidas','acomod'];
const classeKey=t=>t&&!t.origens?escId(escolaDe(t))+'|'+normTurma(t.nome):null;
function turmasIrmas(t,a){a=a||A();const k=classeKey(t);if(!a||!k)return [t];return a.turmas.filter(x=>classeKey(x)===k)}
function alC(a,cid){a.alunosC=a.alunosC||{};return a.alunosC[cid]=a.alunosC[cid]||{}}
const _hs=v=>{let j=typeof v==='string'&&v.length>4000?v.length+'|'+v.slice(0,200)+v.slice(-200):JSON.stringify(v==null?null:v);let h=5381;for(let i=0;i<j.length;i++)h=((h<<5)+h+j.charCodeAt(i))|0;return h};
function ligarClasse(a){if(!a)return;const G={};(a.turmas||[]).forEach(t=>{const k=classeKey(t);if(k)(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(L=>{const vistos=[];L.forEach(t=>{const usados=new Set();t.alunos.forEach(x=>{if(x.cid){usados.add(x.cid);vistos.push(x)}});
    t.alunos.forEach(x=>{if(x.cid)return;const m=vistos.find(y=>y.cid&&!usados.has(y.cid)&&((x.processo&&y.processo&&String(y.processo)===String(x.processo))||normT(y.nome||'')===normT(x.nome||'')));x.cid=m?m.cid:uid();usados.add(x.cid);vistos.push(x)})})});
  (a.turmas||[]).filter(t=>t.origens).forEach(t=>t.alunos.forEach(x=>{if(x.cid)return;const src=x.origemId&&(a.turmas||[]).find(z=>z!==t&&z.alunos.some(y=>y.id===x.origemId));const y=src&&src.alunos.find(y=>y.id===x.origemId);x.cid=y&&y.cid||uid()}))}
function copiasDe(a,cid){const L=[];(a.turmas||[]).forEach(t=>t.alunos.forEach(x=>{if(x.cid===cid)L.push([t,x])}));return L}
function sincComuns(a){if(!a||!a.turmas)return 0;ligarClasse(a);const by={};a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.cid)(by[x.cid]=by[x.cid]||[]).push([t,x])}));let n=0;
  Object.entries(by).forEach(([cid,L])=>{if(L.length<2)return;const c=alC(a,cid);c.h=c.h||{};
    CAMPOS_COMUNS.forEach(f=>{const P=L.filter(([t])=>!(f==='num'&&t.origens));if(P.length<2&&!(P.length===1&&c.h[f]==null))return;const hs=P.map(([,x])=>_hs(x[f]));
      let fonte=null;if(c.h[f]==null){/* primeira ligação: o valor mais completo */let best=-1;P.forEach(([,x],k)=>{const v=x[f];const sz=v==null||v===''?-1:JSON.stringify(v).length;if(sz>best){best=sz;fonte=k}})}
      else{const k=hs.findIndex(h=>h!==c.h[f]);if(k>=0)fonte=k}
      if(fonte==null||fonte<0)return;const v=P[fonte][1][f];const vj=v==null?undefined:JSON.stringify(v);P.forEach(([,x],k)=>{if(k!==fonte&&hs[k]!==hs[fonte]){if(vj===undefined)delete x[f];else x[f]=JSON.parse(vj);n++}});c.h[f]=hs[fonte]})});
  return n}
MIGRACOES.push({v:3,n:'Alunos ligados entre as disciplinas da mesma turma (dados pessoais comuns)',f:st=>{(st.anos||[]).forEach(a=>{try{sincComuns(a)}catch(e){console.warn(e)}})}});
try{migrarDados()}catch(e){console.error(e)}
{const _svC=saveNow;saveNow=function(){try{const a=A();if(a)sincComuns(a)}catch(e){console.warn('sincComuns',e)}return _svC.apply(this,arguments)}}

/* ===================== v0.50 · Contactos com o encarregado de educação ===================== */
const MEIOS_EE=['Telefone','Presencial','E-mail','Mensagem / caderneta','Videochamada','Carta'];
function contactosEE(a,cid){const c=alC(a,cid);return c.contactosEE=c.contactosEE||[]}
function contactoDlg(t,x,ed,depois){const a=A();ligarClasse(a);const cid=x.cid;const L=contactosEE(a,cid);const c=ed||{};const hj=isoHoje();
  openDrawer((ed?'Editar':'Novo')+' Contacto com o EE — '+x.nome.split(' ')[0],`<div class="ed cee">
    <p class="hint" style="margin-top:0">${esc(x.nome)} · ${esc(t.nome)}${x.eeNome?' · EE: '+esc(x.eeNome)+(x.eeParent?' ('+esc(x.eeParent)+')':''):''}${x.eeContacto?' · '+esc(x.eeContacto):''}</p>
    <div class="g2"><div><label>Data</label><input type="date" id="ce-d" value="${esc(c.data||hj)}"></div><div><label>Meio</label><select id="ce-m">${MEIOS_EE.map(m=>`<option ${c.meio===m?'selected':''}>${m}</option>`).join('')}</select></div>
    <div style="grid-column:1/-1"><label>Assunto</label><input id="ce-a" value="${esc(c.assunto||'')}" placeholder="ex.: Faltas a Inglês, resultado do teste, comportamento…" list="ce-al"><datalist id="ce-al">${['Assiduidade','Aproveitamento','Comportamento','Medidas de apoio','Informação intercalar','Convocatória','Pedido do encarregado de educação'].map(o=>`<option>${o}</option>`).join('')}</datalist></div>
    <div style="grid-column:1/-1"><label>Síntese</label><textarea id="ce-s" rows="4" placeholder="O que foi falado…">${esc(c.sintese||'')}</textarea></div>
    <div style="grid-column:1/-1"><label>Compromisso assumido</label><textarea id="ce-c" rows="2" placeholder="ex.: O EE vai acompanhar o estudo diário; o aluno vai ao apoio às quartas.">${esc(c.compromisso||'')}</textarea></div>
    <div><label>Data de acompanhamento</label><input type="date" id="ce-f" value="${esc(c.acomp||'')}"></div><div><label class="chk" style="margin-top:26px"><input type="checkbox" id="ce-t" ${c.tarefa||!ed?'checked':''}> Criar tarefa para essa data</label></div></div>
    <div class="row" style="margin-top:14px;gap:8px">${ed?`<button class="btn dng" id="ce-x">${ic('trash',14)} Apagar</button>`:''}<span class="sp1"></span><button class="btn" id="ce-can">Cancelar</button><button class="btn pri" id="ce-ok">${ic('check',14)} Guardar</button></div></div>`);
  $('#ce-can').onclick=()=>{closeDrawer();depois&&depois()};
  const ex=$('#ce-x');if(ex)ex.onclick=()=>{if(!confirm('Apagar este registo de contacto?'))return;const k=L.indexOf(ed);if(k>=0)L.splice(k,1);if(ed.tarefa){const T_=tarefas();const j=T_.findIndex(z=>z.id===ed.tarefa);if(j>=0&&!T_[j].feito)T_.splice(j,1)}save();closeDrawer();toast('Contacto apagado');depois&&depois()};
  $('#ce-ok').onclick=()=>{const o=ed||{id:uid(),criado:Date.now()};Object.assign(o,{data:$('#ce-d').value||hj,meio:$('#ce-m').value,assunto:$('#ce-a').value.trim(),sintese:$('#ce-s').value.trim(),compromisso:$('#ce-c').value.trim(),acomp:$('#ce-f').value||'',disc:t.disciplina,turma:t.nome,autor:(S.cfg.professor||'')});
    if(!o.assunto&&!o.sintese){toast('Indique pelo menos o assunto ou a síntese','aviso');return}
    const querT=$('#ce-t').checked&&o.acomp;const T_=tarefas();let tk=o.tarefa&&T_.find(z=>z.id===o.tarefa);
    if(querT){const txt='Acompanhar contacto com o EE de '+x.nome.split(' ')[0]+' ('+t.nome+')'+(o.assunto?': '+o.assunto:'')+(o.compromisso?' — '+o.compromisso:'');if(tk){tk.t=txt;tk.prazo=o.acomp}else{tk={id:uid(),t:txt,prazo:o.acomp,feito:false,criada:Date.now(),orig:{tipo:'contactoEE',cid:x.cid,cont:o.id}};T_.push(tk)}o.tarefa=tk.id}
    else if(tk&&!tk.feito){T_.splice(T_.indexOf(tk),1);delete o.tarefa}
    if(!ed)L.push(o);L.sort((p,q)=>(q.data||'').localeCompare(p.data||''));save();audit('Contactos com o EE',ed?'Contacto editado':'Contacto registado',x.nome+' · '+o.data);closeDrawer();toast('Contacto registado'+(querT?' · tarefa criada para '+fmtIso(o.acomp):''),'ok');depois&&depois()}}

/* ===================== v0.50 · Dossiê único do aluno ===================== */
function dossieDados(a,cid){const C=copiasDe(a,cid);const dados=C.map(([t,x])=>{let D=null;try{D=pnlDados(t,a,null)}catch(_){}const l=D&&D.linhas.find(l=>l.a.id===x.id);const p=perAtual(t);
    return {t,x,freq:x.frequenta!==false,nota:l?l.nota:null,neg:l?l.neg:false,f:l?l.f:{F:0,FD:0,J:0,tot:0},ass:l?l.ass:null,porConf:D?D.porConf:0,pend:l?l.pend:0,inc:l?l.oralP:0,p,conj:!!t.origens,
      inter:(()=>{try{const M=intMomentos(t,a).filter(m=>(t.interc||{})[m.id]&&(t.interc[m.id][x.id]));const m=M[M.length-1];return m?{p:m.p,...t.interc[m.id][x.id]}:null}catch(_){return null}})()}});
  return dados}
function dossieAluno(cid,tab){const a=A();if(!a)return;ligarClasse(a);const C=copiasDe(a,cid);if(!C.length)return;const base=(C.find(([t])=>t.id===S.turmaAtiva)||C.find(([t])=>!t.origens)||C[0]);const [t0,x]=base;
  const D=dossieDados(a,cid).filter(d=>d.freq);const CE=contactosEE(a,cid);const hj=isoHoje();tab=tab||UI.dosTab||'resumo';UI.dosTab=tab;
  const TK=tarefas().filter(z=>z.orig&&z.orig.cid===cid);const decs=(()=>{try{return reunioes(a).flatMap(r=>(r.decisoes||[]).filter(d=>!d.ok&&normT(d.t||'').includes(normT((x.nome||'').split(' ')[0]))).map(d=>({d,r})))}catch(_){return []}})();
  const med=x.medidas||{};const nMed=['univ','selet','adic'].reduce((s_,k)=>s_+((med[k]||[]).length),0);
  const fT=D.reduce((s_,d)=>s_+d.f.tot,0),fI=D.reduce((s_,d)=>s_+(d.f.tot-d.f.J),0),negs=D.filter(d=>d.neg);
  const orig=(txt,go_,extra)=>`<button type="button" class="dsor" data-dsgo="${go_}" ${extra||''} title="Abrir a origem">${ic('arrowUp',11)} ${esc(txt)}</button>`;
  const tabs=[['resumo','chart','Resumo'],['aval','grad','Avaliação'],['assid','calcheck','Assiduidade'],['ee','chat','Contactos com o EE'+(CE.length?' ('+CE.length+')':'')],['med','shield','Medidas'],['tar','checks','Tarefas'+(TK.filter(z=>!z.feito).length?' ('+TK.filter(z=>!z.feito).length+')':'')]];
  let body='';
  if(tab==='resumo')body=`<div class="dskp"><div class="${negs.length?'bad':''}"><b>${negs.length}</b><span>negativa${negs.length===1?'':'s'}</span></div><div class="${fI?'w':''}"><b>${fT}</b><span>faltas${fI?' · '+fI+' injust.':''}</span></div><div><b>${CE.length}</b><span>contacto${CE.length===1?'':'s'} com o EE</span></div><div class="${nMed?'pri':''}"><b>${nMed}</b><span>medida${nMed===1?'':'s'}</span></div><div class="${TK.filter(z=>!z.feito).length?'w':''}"><b>${TK.filter(z=>!z.feito).length}</b><span>tarefas abertas</span></div></div>
    <table class="lst dstb"><thead><tr><th>Disciplina</th><th>Classificação</th><th>Assiduidade</th><th>Pendências</th><th>Intercalar</th></tr></thead><tbody>${D.map(d=>`<tr><td><b>${esc(d.t.disciplina)}</b>${d.conj?' <span class="tag">'+esc(d.t.nome)+'</span>':''}</td><td>${d.nota==null?'<span class="mut">—</span>':`<b class="${d.neg?'stlo':''}">${fmtNota(d.t,d.nota)}</b> <small class="mut">${d.p}.º ${perW().toLowerCase().slice(0,3)}.</small>`}</td><td>${d.ass==null?'<span class="mut">—</span>':d.ass+'%'} <small class="mut">${d.f.tot} f.</small>${d.porConf?` <small class="pnpc" title="Aulas com chamada por confirmar">${d.porConf} p/conf.</small>`:''}</td><td>${d.pend||d.inc?`<span class="tag w">${d.pend?d.pend+' por classificar':''}${d.pend&&d.inc?' · ':''}${d.inc?d.inc+' incompleta'+(d.inc>1?'s':''):''}</span>`:'<span class="mut">—</span>'}</td><td>${d.inter?(d.inter.sem?'<span class="mut">s/ aval.</span>':`<span class="itm m${INT_M.indexOf(d.inter.m)}">${esc(d.inter.m)}</span>`):'<span class="mut">—</span>'}</td></tr>`).join('')}</tbody></table>
    <h3>Últimos registos</h3>${[...CE.slice(0,3).map(c=>({d:c.data,h:`${ic('chat',13)} <b>Contacto com o EE</b> · ${esc(c.meio)} · ${esc(c.assunto||'')}`,o:orig('Contactos','ee')})),...TK.filter(z=>!z.feito).slice(0,3).map(z=>({d:z.prazo,h:`${ic('checks',13)} <b>Tarefa</b> · ${esc(z.t)}`,o:orig('Tarefas','tar')})),...decs.slice(0,3).map(({d,r})=>({d:r.data,h:`${ic('meet',13)} <b>Deliberação</b> · ${esc(d.t)}`,o:orig(reunTipo(r).ab+' '+fmtIso(r.data),'reunioes')}))].sort((p,q)=>(q.d||'').localeCompare(p.d||'')).map(r=>`<div class="dsln"><small class="mut">${r.d?fmtIso(r.d):''}</small><span>${r.h}</span>${r.o}</div>`).join('')||'<p class="mut">Sem registos.</p>'}`;
  if(tab==='aval')body=D.map(d=>{const t=d.t;let pc={};try{pc=pctsFinal(t,d.x.id,d.p)}catch(_){}return `<section class="dsav"><div class="row"><h3 style="margin:0">${esc(t.disciplina)}</h3><span class="sp1"></span>${d.nota!=null?`<b class="${d.neg?'stlo':''}" style="font-size:18px">${fmtNota(t,d.nota)}</b>`:''}${orig('Avaliação Final','avaliacao',`data-dst="${t.id}"`)}</div>
      <div class="dsdm">${t.dominios.map(dm=>`<span style="--dc:${domCor(t,dm)}"><b>${esc(dm.ab)}</b> ${pc[dm.id]!=null?pctD(t,pc[dm.id]):'—'} <small class="mut">${dm.peso}%</small></span>`).join('')}</div>
      <div class="dsil">${t.instrumentos.filter(i=>instMax(i)).map(i=>{const k=instAlunoEstado(t,i,d.x.id);const v=instTotal(i,d.x.id);return `<span class="dsi ${k}" title="${esc(i.nome)} · ${esc((EST_INST[k]||['Não realizou'])[0])}"><small>${esc(fmtIso(i.data||''))}</small> ${esc(i.nome)} <b>${v!=null?fmtNota(t,v/instMax(i)):k==='faltou'?'F':'—'}</b></span>`}).join('')||'<span class="mut">Sem instrumentos.</span>'}</div></section>`}).join('');
  if(tab==='assid')body=D.map(d=>`<div class="dsln"><b>${esc(d.t.disciplina)}</b><span>${d.ass==null?'—':d.ass+'%'} · ${d.f.F} injust./just. · ${d.f.J} justificadas · ${d.f.FD} disciplinares${d.porConf?` · <span class="pnpc">${d.porConf} aulas por confirmar</span>`:''}</span>${orig('Sumários','sumarios',`data-dst="${d.t.id}"`)}</div>`).join('')+`<p class="hint">A assiduidade conta apenas as aulas com chamada confirmada.</p>`;
  if(tab==='ee')body=`<div class="row" style="gap:8px"><button class="btn pri" id="ds-nc">${ic('plus',14)} Registar Contacto</button><span class="mut">${x.eeNome?'EE: '+esc(x.eeNome)+(x.eeParent?' ('+esc(x.eeParent)+')':''):'Sem encarregado de educação registado'}${x.eeContacto?' · '+esc(x.eeContacto):''}</span></div>
    <div class="dscl">${CE.map(c=>{const tk=c.tarefa&&tarefas().find(z=>z.id===c.tarefa);const atras=c.acomp&&c.acomp<hj&&tk&&!tk.feito;return `<article class="dsc"><header><b>${esc(fmtIsoL(c.data))}</b><span class="tag">${esc(c.meio)}</span>${c.assunto?`<b>${esc(c.assunto)}</b>`:''}<span class="sp1"></span><small class="mut">${esc([c.disc,c.autor].filter(Boolean).join(' · '))}</small><button class="btn sm ico" data-dsce="${c.id}" aria-label="Editar">${ic('pencil',12)}</button></header>${c.sintese?`<p>${esc(c.sintese)}</p>`:''}${c.compromisso?`<p class="dscm">${ic('check',12)} <b>Compromisso:</b> ${esc(c.compromisso)}</p>`:''}${c.acomp?`<p class="mut ${atras?'stlo':''}">${ic('clock',12)} Acompanhamento ${fmtIsoL(c.acomp)}${tk?(tk.feito?' · feito':atras?' · em atraso':' · tarefa aberta'):''}</p>`:''}</article>`}).join('')||'<p class="mut">Sem contactos registados.</p>'}</div>`;
  if(tab==='med')body=`${['univ','selet','adic'].map(k=>`<div class="dsln"><b>${{univ:'Universais',selet:'Seletivas',adic:'Adicionais'}[k]}</b><span>${(med[k]||[]).map(i=>esc(typeof i==='number'?((MEDIDAS[k]||{}).l||[])[i]||'':i)).join(' · ')||'<span class="mut">—</span>'}</span></div>`).join('')}${(x.acomod||[]).length?`<div class="dsln"><b>Adaptações</b><span>${x.acomod.map(esc).join(' · ')}</span></div>`:''}<p class="hint">As medidas são comuns a todas as disciplinas da turma. ${orig('Editar na ficha do aluno','ficha')}</p>`;
  if(tab==='tar')body=`${TK.map(z=>`<label class="dsln chk"><input type="checkbox" data-dstk="${z.id}" ${z.feito?'checked':''}><span>${esc(z.t)}</span><small class="mut">${z.prazo?fmtIso(z.prazo):''}</small></label>`).join('')||'<p class="mut">Sem tarefas ligadas a este aluno.</p>'}${decs.length?`<h3>Deliberações em aberto que referem o aluno</h3>${decs.map(({d,r})=>`<div class="dsln"><span>${esc(d.t)}</span><small class="mut">${esc(reunTipo(r).n)} · ${fmtIso(r.data)}${d.prazo?' · prazo '+fmtIso(d.prazo):''}</small></div>`).join('')}`:''}`;
  openDrawer('Dossiê do Aluno',`<div class="dos"><header class="dsh">${avatar(x,58)}<div><b>${esc(x.nome)}</b><small class="mut">${esc(t0.origens?(x.origem||t0.nome):t0.nome)} · n.º ${esc(numAl(x))}${x.processo?' · proc. '+esc(x.processo):''}${idade(x.nasc)?' · '+idade(x.nasc)+' anos':''}</small><small class="mut">${D.length} disciplina${D.length===1?'':'s'} nesta app: ${D.map(d=>esc(d.t.disciplina)).join(', ')}</small></div></header>
    <div class="tabs dstabs">${tabs.map(([k,i,l])=>`<button data-dstab="${k}" class="${tab===k?'on':''}">${ic(i,13)} ${l}</button>`).join('')}</div><div class="dsb">${body}</div></div>`);
  const re=k=>dossieAluno(cid,k||tab);
  $$('#dw-b [data-dstab]').forEach(b=>b.onclick=()=>re(b.dataset.dstab));
  const nc=$('#ds-nc');if(nc)nc.onclick=()=>contactoDlg(t0,x,null,()=>re('ee'));
  $$('#dw-b [data-dsce]').forEach(b=>b.onclick=()=>contactoDlg(t0,x,CE.find(c=>c.id===b.dataset.dsce),()=>re('ee')));
  $$('#dw-b [data-dstk]').forEach(c=>c.onchange=()=>{const z=tarefas().find(y=>y.id===c.dataset.dstk);if(z){z.feito=c.checked;save()}});
  $$('#dw-b [data-dsgo]').forEach(b=>b.onclick=()=>{const g=b.dataset.dsgo;if(['ee','tar'].includes(g))return re(g);if(b.dataset.dst){S.turmaAtiva=b.dataset.dst}closeDrawer();if(g==='ficha'){go('alunos');setTimeout(()=>fichaAluno(x.id,'msai'),80);return}go(g)})}

