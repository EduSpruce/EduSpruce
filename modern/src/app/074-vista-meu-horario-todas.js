/* ---------- vista: o meu horário (todas as turmas + tempos não letivos) ---------- */
function vMeuHorario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  barBtns([{id:'b-hp',t:ic('upload',15)+' Importar o Meu Horário (PDF ou Excel)…',f:pickHorProf},{id:'b-nl',t:ic('plus',15)+' Tempo Não Letivo',f:()=>nlDlg(null)},{id:'b-hi',t:'Horários das Turmas…',f:()=>pickHorarios(importarHorariosDlg)},{id:'b-hx',t:ic('calx',15)+' Apagar Horário…',c:'dng',f:apagarMeuHorarioDlg},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const TT=turmasFiltradas(a);const H=a.horProf;
  const aulas=[];TT.forEach(t=>aulasTurma(t,a).forEach(x=>aulas.push({...x,t})));
  // aulas do horário do professor sem turma na app (ex.: turmas que não acompanha aqui)
  const outras=H&&!S.filtroOferta?H.aulas.filter(x=>!H.mapa[chaveAula(x)]&&!aulas.some(y=>y.dia===x.dia&&y.ini<x.fim&&x.ini<y.fim)).map(x=>({dia:x.dia,ini:x.ini,fim:x.fim,ab:x.sig,sala:x.sala,turma:x.turma,outra:true})):[];
  const NL=(a.naoLetivos||[]).map(x=>({...x,ab:x.sig,nl:true}));
  const semH=TT.filter(t=>!aulasTurma(t,a).length);
  const hojeL=proximasAulas(aulas,40).filter(p=>p.k===0);
  const dow=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes(),hjIso=isoData(new Date());const diaLet=!CAL()||letivoPara(null,hjIso);
  const extraHoje=diaLet?blocos([...outras,...NL.filter(x=>nlAtivoHoje(x,hjIso))].filter(x=>x.dia===dow)).filter(b=>b.fim>mins).map(b=>({...b,agora:b.ini<=mins})):[];
  const hoje=[...hojeL,...extraHoje].sort((x,y)=>x.ini-y.ini);
  const prox=proximasAulas(aulas,1)[0];
  const cores=['#2f7fd0','#d98b00','#7a4fd0','#c0392b','#0f8b8d','#b0457b','#5b6b7f','#1a7f37'];
  const corT=t=>(t.oferta==='profij'?['#1a7f37','#0f8b8d','#4f8a2b','#2e7d5b']:cores)[TT.filter(x=>x.oferta===t.oferta).indexOf(t)%4];
  const todos=[...aulas,...outras,...NL];
  const nTL=aulas.length+outras.length,nNL=NL.length;
  const gNL=[];NL.forEach(x=>{const d=gNL.find(d=>normSig(d.sig)===normSig(x.sig));if(d){d.n++;if(!d.gs.includes(x.g))d.gs.push(x.g)}else gNL.push({sig:x.sig,nome:x.nome,n:1,gs:[x.g]})});
  const linhaHoje=p=>p.nl?`<button class="lin hjl nl ${p.agora?'now':''}" data-nl="${p.g}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="nlb" style="--nc:${corNL(p.sig)}">${esc(p.sig)}</span><b>${esc(p.nome)}</b>${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}</button>`
    :p.outra?`<div class="lin hjl ${p.agora?'now':''}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="dot" style="background:#8e8e93"></span><b>${esc(p.turma)}</b> ${esc(p.ab)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}</div>`
    :`<button class="lin hjl ${p.agora?'now':''}" data-tt="${p.t.id}"><span class="hh">${fmtHM(p.ini)}–${fmtHM(p.fim)}</span><span class="dot" style="background:${corT(p.t)}"></span>${anoBadge(p.t,'sm')}<b>${esc(p.t.nome)}</b> ${esc(p.t.disciplina)}${p.sala?`<span class="mut">Sala ${esc(p.sala)}</span>`:''}${ofertaTag(p.t)}</button>`;
  $('#view').innerHTML=`
  <div class="kpis">
    <div class="kpi"><div class="l">${ic('clipboard',14)} Tempos Letivos</div><div class="v">${nTL}</div><div class="mut">por semana</div></div>
    <div class="kpi"><div class="l">${ic('layers',14)} Tempos Não Letivos</div><div class="v">${nNL}</div><div class="mut">${gNL.map(g=>esc(g.sig)+' '+g.n).join(' · ')||'—'}</div></div>
    <div class="kpi"><div class="l">${ic('clock',14)} Total Semanal</div><div class="v">${nTL+nNL}</div><div class="mut">tempos no horário</div></div>
  </div>
  <div class="card"><div class="row" style="margin-bottom:6px"><h2 style="margin:0">Hoje · ${esc(DIAS[dow])}</h2><span class="sp1"></span>${prox?`<span class="prox ${prox.agora?'now':''}">${ic('calendar',13)} ${prox.agora?'A decorrer':'Próxima'}: <b>${esc(prox.t.nome)} · ${esc(prox.t.disciplina)} — ${esc(quando(prox))}</b></span>`:''}</div>
    ${hoje.length?hoje.map(linhaHoje).join(''):`<p class="mut" style="margin:4px 0">${diaLet?'Sem mais tempos hoje.':'Hoje não há atividades letivas.'}</p>`}</div>
  <div class="card wide"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">O Meu Horário Semanal</h2>${a.horProf||NL.length||Object.keys(a.horarios||{}).length?`<button class="btn sm dng hdel" id="mh-del">${ic('calx',15)} Apagar Horário</button>`:''}${NL.length?'<span class="hint noprint" style="margin:0 0 0 6px">Arraste um tempo não letivo para outro dia ou hora.</span>':''}<span class="sp1"></span>
    <span class="hleg">${TT.filter(t=>aulasTurma(t,a).length).map(t=>`<span class="leg"><span class="dot" style="background:${corT(t)}"></span>${esc(t.nome)} · ${esc(t.disciplina)}</span>`).join('')}${outras.length?'<span class="leg"><span class="dot" style="background:#8e8e93"></span>Outras turmas</span>':''}${NL.length?'<span class="leg"><span class="aula nl mini"></span>Não letivo</span>':''}</span></div>
    ${todos.length?grelhaSemanal(todos,{semVazias:true,minha:x=>!x.nl&&!x.outra,cor:x=>x.nl?corNL(x.sig):x.outra?'':corT(x.t),slots:slotsConhecidos(a),cls:x=>x.nl?'nl':x.outra?'outra':'',attr:x=>x.nl?`data-nl="${x.g}" data-nid="${x.id}"`:'',rotulo:x=>x.nl?x.sig:x.outra?x.turma+' · '+x.ab:x.t.nome,titulo:x=>x.nl?x.nome:x.outra?x.turma+' · '+x.ab:x.t.nome+' · '+x.t.disciplina})
      :`<div class="empty">${ic('calendar',26)}<br>Importe o PDF do seu horário (programa da escola → Horário do professor) para ver as aulas e os tempos não letivos, ou importe os horários das turmas.<br><br><button class="btn pri" id="hp-imp">${ic('upload',15)} Importar o Meu Horário (PDF ou Excel)</button></div>`}
  </div>
  <div class="card"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">Tempos Não Letivos</h2><span class="sp1"></span><button class="btn sm" id="nl-tipos">${ic('sliders',14)} Tipos</button><button class="btn sm" id="nl-add">${ic('plus',14)} Acrescentar</button></div>
    ${NL.length?`<div class="nlg">${[...new Set(NL.map(x=>x.g))].map(gid=>{const L=NL.filter(x=>x.g===gid).sort((x,y)=>x.ini-y.ini);const x=L[0];
      return `<button class="nlr clk" data-nl="${gid}"><span class="nlb" style="--nc:${corNL(x.sig)}">${esc(x.sig)}</span><span><b>${esc(x.nome)}</b>${x.obs?`<span class="mut"> · ${esc(x.obs)}</span>`:''}</span><span class="mut">${DIAS_C[x.dia]} ${fmtHM(L[0].ini)}–${fmtHM(L[L.length-1].fim)}${x.sala?' · '+esc(x.sala):''}${x.freq?' · quinzenal ('+(x.freq==='par'?'semanas pares':'semanas ímpares')+')':''}</span><span class="tag">${L.length} t.</span></button>`}).join('')}</div>`
      :'<p class="mut" style="margin:0">Ainda sem tempos não letivos. Importe o PDF do seu horário ou acrescente-os à mão (DT, CNL-E, Biblioteca, Tutoria, Clube…).</p>'}
    ${H&&H.obs&&H.obs.length?`<details class="hobs"><summary>Observações do Horário</summary><div class="hint">${H.obs.map(esc).join('<br>')}</div></details>`:''}
    ${H?`<p class="hint">Importado de ${esc(H.ficheiro)}${H.docente?' · '+esc(H.docente):''}. <a href="#" id="hp-map">Associar aulas às turmas…</a></p>`:''}</div>
  ${(()=>{const C=sobreposicoes(a);return C.length?`<div class="card"><div class="alert w" style="margin:0">${ic('alert',15)} <b>Sobreposições no horário:</b> ${C.map(c=>esc(DIAS_C[c.n.dia]+' '+fmtHM(c.n.ini)+': '+c.n.sig+' com '+c.o)).join(' · ')}</div></div>`:''})()}
  ${semH.length?`<div class="card"><h2>Turmas sem Horário</h2><p class="hint" style="margin-top:0">${semH.map(t=>esc(t.nome+' · '+t.disciplina)).join(' · ')}</p></div>`:''}`;
  $$('[data-tt]').forEach(b=>b.onclick=()=>{S.turmaAtiva=b.dataset.tt;save();go('horario')});
  $$('[data-nl]').forEach(b=>b.onclick=()=>{if(b._arrastou){b._arrastou=false;return}nlDlg(b.dataset.nl)});
  $$('.nlr.clk[data-nl]').forEach(r=>deslizarApagar(r,()=>{const g=r.dataset.nl;a.naoLetivos=a.naoLetivos.filter(x=>x.g!==g);saveNow();go('meuhorario');toast('Tempo não letivo apagado (⌘Z para anular)','aviso')}));
  ativarArrastoNL($('.card.wide table.hor'));
  const mhd=$('#mh-del');if(mhd)mhd.onclick=apagarMeuHorarioDlg;
  $('#nl-add').onclick=()=>nlDlg(null);$('#nl-tipos').onclick=()=>gerirTiposNL(null);const hi=$('#hp-imp');if(hi)hi.onclick=pickHorProf;
  const hm=$('#hp-map');if(hm)hm.onclick=e=>{e.preventDefault();importarHorProfDlg({...H,naoLetivos:[],ficheiro:H.ficheiro,obs:H.obs||[]})};
}

/* ---------- pré-visualização ---------- */
let PREV=[],PREVT='';
function avatar(a,sz){sz=sz||34;const src=fotoSrc(a);return src?`<img class="foto-al" src="${esc(src)}" alt="" style="width:${sz}px;height:${Math.round(sz*1.25)}px;object-fit:cover;object-position:50% 0;border-radius:6px;display:block;max-width:none;flex-shrink:0">`:`<span class="ava" style="width:${sz}px;min-width:${sz}px;height:${Math.round(sz*1.25)}px;font-size:${Math.round(sz*.38)}px">${esc((a.nome||'?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span>`}
function infoLeitura(r){
  if(!r||!r.ficheiro)return '';
  if(r.falhou)return `<div class="alert w">Não consegui identificar alunos neste ficheiro. Confirme que é o Excel exportado em <b>${esc(CAMINHO_EXCEL)}</b>.</div>`;
  return `<div class="alert">${ic('check',15)} Lidos <b>${r.alunos.length} alunos</b>${r.nImgs?` e <b>${r.nFotos} fotos</b>`:' (o ficheiro não tem fotos)'}${r.turmas&&r.turmas.length>1?' · <b>'+r.turmas.length+' turmas</b> no mesmo ficheiro':''}</div>`;
}
function tabelaPreview(al,turmas){
  PREV=al.map(x=>({...x,inc:true}));turmas=turmas||[];PREVT='';
  if(!al.length)return '';
  return `${turmas.length>1?`<div class="row" style="margin:6px 0"><label class="mut" style="margin:0">Importar alunos da turma</label><select id="prev-t" class="fld" style="width:auto"><option value="">Todas (${turmas.join(' + ')})</option>${turmas.map(t=>`<option>${esc(t)}</option>`).join('')}</select></div>`:''}
  <p class="hint">Verifique e corrija os nomes. Desmarque “Frequenta” para quem não tem a sua disciplina.${turmas.length>1?' Ao importar todas juntas, cada aluno mantém o número e a indicação da sua turma.':''}</p>
  <div style="max-height:46vh;overflow:auto;border:1px solid var(--line);border-radius:8px"><table class="lst" id="prev"><thead><tr><th>Incluir</th><th></th><th>N.º</th><th>Processo</th><th>Nome</th><th>Sexo</th>${turmas.length>1?'<th>Turma</th>':''}<th>Frequenta</th></tr></thead><tbody>
  ${PREV.map((a,k)=>`<tr data-k="${k}" data-t="${esc(a.turma||'')}"><td><input type="checkbox" data-p="inc" checked></td><td style="width:70px">${avatar(a,56)}</td><td style="width:56px"><input data-p="num" value="${esc(a.num)}"></td><td style="width:76px"><input data-p="processo" value="${esc(a.processo)}"></td><td><input data-p="nome" value="${esc(a.nome)}"></td><td style="width:66px"><select data-p="genero"><option ${a.genero==='M'?'selected':''}>M</option><option ${a.genero==='F'?'selected':''}>F</option></select></td>${turmas.length>1?`<td class="mut" style="white-space:nowrap">${esc(a.turma)}</td>`:''}<td><input type="checkbox" data-p="frequenta" ${a.frequenta?'checked':''}></td></tr>`).join('')}
  </tbody></table></div>`;
}
function bindPreview(onTurma){
  $$('#prev [data-p]').forEach(el=>el.addEventListener('change',()=>{const a=PREV[+el.closest('tr').dataset.k];const f=el.dataset.p;a[f]=el.type==='checkbox'?el.checked:el.value;if(f==='genero')a.generoManual=true;if(f==='nome'&&!a.generoManual){a.genero=guessGen(a.nome);const sg=el.closest('tr').querySelector('[data-p=genero]');if(sg)sg.value=a.genero}if(f==='inc')el.closest('tr').classList.toggle('off',!el.checked)}));
  const st=$('#prev-t');if(st)st.onchange=()=>{PREVT=st.value;$$('#prev tbody tr').forEach(tr=>{tr.style.display=!PREVT||tr.dataset.t===PREVT?'':'none'});if(onTurma)onTurma(PREVT)};
}
function textoLido(r){return r.falhou&&r.linhas&&r.linhas.length?`<h3>Conteúdo lido</h3><textarea readonly style="min-height:160px;font-size:11px;width:100%">${esc(r.linhas.map(c=>c.join(' | ')).join('\n'))}</textarea>`:''}
function previewRows(){return PREV.filter(a=>a.inc!==false&&(!PREVT||a.turma===PREVT)).map(a=>({...a,num:+a.num||a.num}))}

