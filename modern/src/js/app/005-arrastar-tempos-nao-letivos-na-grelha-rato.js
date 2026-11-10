/* ---------- arrastar tempos não letivos na grelha (rato ou dedo) ---------- */
function ativarArrastoNL(tab){
  if(!tab)return;let st=null;
  const alvo=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('td[data-cel]'):null};
  tab.querySelectorAll('.aula.nl[data-nid]').forEach(el=>{
    el.addEventListener('pointerdown',e=>{if(e.button>0)return;st={el,id:el.dataset.nid,x:e.clientX,y:e.clientY,on:false,td:null};try{el.setPointerCapture(e.pointerId)}catch(_){}});
    el.addEventListener('pointermove',e=>{if(!st||st.el!==el)return;
      if(!st.on){if(Math.hypot(e.clientX-st.x,e.clientY-st.y)<8)return;st.on=true;const r=el.getBoundingClientRect();
        st.gh=el.cloneNode(true);st.gh.classList.add('ghost');Object.assign(st.gh.style,{width:r.width+'px',left:r.left+'px',top:r.top+'px'});st.dx=e.clientX-r.left;st.dy=e.clientY-r.top;document.body.appendChild(st.gh);
        el.classList.add('drag-src');tab.classList.add('arrastar')}
      e.preventDefault();st.gh.style.left=(e.clientX-st.dx)+'px';st.gh.style.top=(e.clientY-st.dy)+'px';
      const td=alvo(e.clientX,e.clientY);if(td!==st.td){if(st.td)st.td.classList.remove('drop');st.td=td;if(td)td.classList.add('drop')}});
    const fim=e=>{if(!st||st.el!==el)return;const s_=st;st=null;if(!s_.on)return;
      s_.gh.remove();el.classList.remove('drag-src');tab.classList.remove('arrastar');if(s_.td)s_.td.classList.remove('drop');el._arrastou=true;setTimeout(()=>el._arrastou=false,400);
      const td=s_.td||alvo(e.clientX,e.clientY);if(!td)return;const [d,ini]=td.dataset.cel.split('|').map(Number);moverNL(s_.id,d,ini)};
    el.addEventListener('pointerup',fim);el.addEventListener('pointercancel',fim);
  });
}
function moverNL(id,dia,ini){
  const a=A();const x=(a.naoLetivos||[]).find(n=>n.id===id);if(!x)return;if(x.dia===dia&&x.ini===ini)return;
  const slots=slotsConhecidos(a);const ix=k=>slots.findIndex(s=>s.ini===k);const G=a.naoLetivos.filter(n=>n.g===x.g);
  const delta=ix(ini)-ix(x.ini);if(ix(ini)<0||ix(x.ini)<0)return;
  const novos=G.map(n=>{const k=ix(n.ini)+delta;return k>=0&&k<slots.length?{n,s:slots[k]}:null});
  if(novos.some(v=>!v))return toast('Não cabe nesse horário (passa do fim do dia).');
  const outrosNL=a.naoLetivos.filter(n=>n.g!==x.g);
  const aulasDia=[];turmasFiltradas(a).forEach(t=>aulasTurma(t,a).forEach(l=>aulasDia.push(l)));if(a.horProf)a.horProf.aulas.forEach(l=>aulasDia.push(l));
  const choque=novos.some(v=>outrosNL.some(o=>o.dia===dia&&o.ini===v.s.ini)||aulasDia.some(l=>l.dia===dia&&l.ini===v.s.ini));
  novos.forEach(v=>{v.n.dia=dia;v.n.ini=v.s.ini;v.n.fim=v.s.fim});
  saveNow();go('meuhorario');
  toast(x.sig+' → '+DIAS_C[dia]+' '+fmtHM(novos[0].s.ini)+'–'+fmtHM(novos[novos.length-1].s.fim)+(choque?' · atenção: sobrepõe-se a outro tempo':''));
}
/* ---------- tipos de tempo não letivo: acrescentar, editar, apagar ---------- */
function gerirTiposNL(depois){
  S.cfg.nlTipos=(S.cfg.nlTipos||NL_CAT).map(x=>({...x}));const L=S.cfg.nlTipos;const a=A();
  const usos=sig=>((a&&a.naoLetivos)||[]).filter(n=>normSig(n.sig)===normSig(sig)).length;
  const desenha=()=>{openDrawer('Tipos de Tempo Não Letivo',`<div class="ed">
    <p class="hint" style="margin-top:0">Estes tipos aparecem ao acrescentar tempos não letivos. Mudar a sigla aqui também a muda nos tempos já marcados.</p>
    <div class="tnl">${L.map((x,k)=>`<div class="tnlr" data-k="${k}"><input type="color" data-f="cor" value="${esc(x.cor)}" aria-label="Cor"><input data-f="sig" value="${esc(x.sig)}" placeholder="Sigla" class="tsig"><input data-f="n" value="${esc(x.n)}" placeholder="Designação"><span class="mut tu">${usos(x.sig)?usos(x.sig)+' t.':''}</span><button type="button" class="btn sm ico dng" data-del="${k}" aria-label="Apagar tipo">${ic('trash',15)}</button></div>`).join('')}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="tn-add">${ic('plus',15)} Novo Tipo</button><span class="sp1"></span><button class="btn sm" id="tn-rep">Repor predefinidos</button></div>
    ${depois?`<div class="row" style="margin-top:16px"><button class="btn pri" id="tn-ok">${ic('check',15)} Concluído</button></div>`:''}</div>`);
    $$('.tnlr [data-f]').forEach(el=>el.onchange=()=>{const k=+el.closest('.tnlr').dataset.k;const f=el.dataset.f;const old=L[k].sig;L[k][f]=el.value.trim()||L[k][f];
      if(f==='sig'&&a&&old!==L[k].sig)(a.naoLetivos||[]).forEach(n=>{if(normSig(n.sig)===normSig(old))n.sig=L[k].sig});save();if(f!=='cor')desenha()});
    $$('[data-del]').forEach(b=>b.onclick=()=>{const k=+b.dataset.del;const u=usos(L[k].sig);if(!confirm('Apagar o tipo '+L[k].sig+'?'+(u?'\nOs '+u+' tempos já marcados com esta sigla mantêm-se.':'')))return;L.splice(k,1);save();desenha()});
    $('#tn-add').onclick=()=>{L.push({sig:'Novo',n:'Novo tipo',cor:NL_PAL[L.length%NL_PAL.length]});save();desenha();const r=$$('.tnlr').pop();if(r){r.querySelector('.tsig').select()}};
    $('#tn-rep').onclick=()=>{if(confirm('Repor os tipos predefinidos?')){S.cfg.nlTipos=NL_CAT.map(x=>({...x}));L.length=0;L.push(...S.cfg.nlTipos);save();desenha()}};
    const ok=$('#tn-ok');if(ok)ok.onclick=()=>{depois()};
  };desenha();
}
function nlDlg(g){
  const a=A();a.naoLetivos=a.naoLetivos||[];const L=g?a.naoLetivos.filter(x=>x.g===g):[];const b=L[0]||{dia:1,sig:'',nome:'',sala:'',obs:''};
  const slots=slotsConhecidos(a);let dia=b.dia;let sel=new Set(L.map(x=>x.ini));const om=(a.horProf||{}).obsMap||{};
  openDrawer(g?'Editar Tempo Não Letivo':'Novo Tempo Não Letivo',`<div class="ed">
    <div class="row" style="margin-bottom:4px"><label style="margin:0">Tipo</label><span class="sp1"></span><a href="#" class="lnk" id="nl-gt">${ic('sliders',13)} Gerir tipos</a></div><div class="nlcat">${nlTipos().map(c=>`<button type="button" data-nc="${esc(c.sig)}" class="${normSig(c.sig)===normSig(b.sig)?'on':''}"><span class="nlb" style="--nc:${c.cor}">${esc(c.sig)}</span></button>`).join('')}</div>
    <div class="g2" style="margin-top:10px"><div><label>Sigla</label><input id="nl-sig" value="${esc(b.sig)}" placeholder="ex.: DT"></div><div><label>Designação</label><input id="nl-nome" value="${esc(b.nome)}" placeholder="ex.: Direção de Turma"></div></div>
    <label style="margin-top:10px">Dia</label><div class="seg" id="nl-dia">${[1,2,3,4,5].map(d=>`<button type="button" data-d="${d}" class="${d===dia?'on':''}">${DIAS_C[d]}</button>`).join('')}</div>
    <label style="margin-top:10px">Tempos</label><div class="nlslots">${slots.map(s=>`<button type="button" data-sl="${s.ini}" class="${sel.has(s.ini)?'on':''}">${fmtHM(s.ini)}–${fmtHM(s.fim)}</button>`).join('')}</div>
    <label style="margin-top:10px">Frequência</label><div class="seg" id="nl-freq">${[['','Todas as semanas'],['par','Semanas pares'],['impar','Semanas ímpares']].map(([k,l])=>`<button type="button" data-fq="${k}" class="${(b.freq||'')===k?'on':''}">${l}</button>`).join('')}</div><p class="hint" style="margin:4px 0 0">Esta semana é ${semanaISO(isoData(new Date()))%2===0?'par':'ímpar'} (semana ${semanaISO(isoData(new Date()))}).</p>
    <div class="g2" style="margin-top:10px"><div><label>Sala</label><input id="nl-sala" value="${esc(b.sala)}"></div><div><label>Observações</label><input id="nl-obs" value="${esc(b.obs||'')}" placeholder="ex.: 6.º A (Gonçalo e Ismael)"></div></div>
    <div class="row" style="margin-top:16px"><button class="btn pri" id="nl-ok">${ic('check',15)} Guardar</button>${g?`<button class="btn dng" id="nl-del">${ic('trash',15)} Apagar</button>`:''}</div></div>`);
  $('#nl-gt').onclick=e=>{e.preventDefault();gerirTiposNL(()=>nlDlg(g))};
  $$('[data-nc]').forEach(x=>x.onclick=()=>{$$('[data-nc]').forEach(y=>y.classList.toggle('on',y===x));$('#nl-sig').value=x.dataset.nc;$('#nl-nome').value=nomeNL(x.dataset.nc,om)});
  $$('#nl-dia [data-d]').forEach(x=>x.onclick=()=>{dia=+x.dataset.d;$$('#nl-dia [data-d]').forEach(y=>y.classList.toggle('on',y===x))});
  let freq=b.freq||'';$$('#nl-freq [data-fq]').forEach(x=>x.onclick=()=>{freq=x.dataset.fq;$$('#nl-freq [data-fq]').forEach(y=>y.classList.toggle('on',y===x))});
  $$('[data-sl]').forEach(x=>x.onclick=()=>{const v=+x.dataset.sl;if(sel.has(v))sel.delete(v);else sel.add(v);x.classList.toggle('on',sel.has(v))});
  $('#nl-ok').onclick=()=>{const sig=$('#nl-sig').value.trim();if(!sig)return alert('Indique a sigla (ex.: DT).');if(!sel.size)return alert('Escolha pelo menos um tempo.');
    const gid=g||uid();const orig=L.length?L[0].origem:'manual';a.naoLetivos=a.naoLetivos.filter(x=>x.g!==gid);
    [...sel].sort((x,y)=>x-y).forEach(ini=>{const s=slots.find(s=>s.ini===ini);a.naoLetivos.push({id:uid(),g:gid,dia,ini,fim:s.fim,sig,nome:$('#nl-nome').value.trim()||nomeNL(sig,om),sala:$('#nl-sala').value.trim(),obs:$('#nl-obs').value.trim(),freq,origem:orig})});
    saveNow();closeDrawer();go('meuhorario')};
  const d=$('#nl-del');if(d)d.onclick=()=>{if(confirm('Apagar este tempo não letivo?')){a.naoLetivos=a.naoLetivos.filter(x=>x.g!==g);saveNow();closeDrawer();go('meuhorario')}};
}

/* ---------- vista: o meu horário (todas as turmas + tempos não letivos) ---------- */
function vMeuHorario(){
  const a=A();if(!a){$('#view').innerHTML='<div class="card empty">Crie primeiro o ano letivo.</div>';return}
  barBtns([{id:'b-hp',t:ic('upload',15)+' Importar o Meu Horário (PDF ou Excel)…',f:pickHorProf},{id:'b-nl',t:ic('plus',15)+' Tempo Não Letivo',f:()=>nlDlg(null)},{id:'b-hi',t:'Horários das Turmas…',f:()=>pickHorarios(importarHorariosDlg)},{id:'b-hx',t:ic('calx',15)+' Apagar Horário…',c:'dng',f:apagarMeuHorarioDlg},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const TT=turmasFiltradas(a);const H=a.horProf;
  const aulas=[];TT.forEach(t=>aulasTurma(t,a).forEach(x=>aulas.push({...x,t})));
  // aulas do horário do professor sem turma na app (ex.: turmas que não acompanha aqui)
  const outras=H&&!S.filtroOferta?H.aulas.filter(x=>!H.mapa[chaveAula(x)]).map(x=>({dia:x.dia,ini:x.ini,fim:x.fim,ab:x.sig,sala:x.sala,turma:x.turma,outra:true})):[];
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
    ${todos.length?grelhaSemanal(todos,{minha:x=>!x.nl&&!x.outra,cor:x=>x.nl?corNL(x.sig):x.outra?'':corT(x.t),slots:slotsConhecidos(a),cls:x=>x.nl?'nl':x.outra?'outra':'',attr:x=>x.nl?`data-nl="${x.g}" data-nid="${x.id}"`:'',rotulo:x=>x.nl?x.sig:x.outra?x.turma+' · '+x.ab:x.t.nome,titulo:x=>x.nl?x.nome:x.outra?x.turma+' · '+x.ab:x.t.nome+' · '+x.t.disciplina})
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
function avatar(a,sz){sz=sz||34;const src=fotoSrc(a);return src?`<img class="foto-al" src="${src}" alt="" style="width:${sz}px;height:${Math.round(sz*1.25)}px;object-fit:cover;border-radius:6px;display:block;max-width:none;flex-shrink:0">`:`<span class="ava" style="width:${sz}px;min-width:${sz}px;height:${Math.round(sz*1.25)}px;font-size:${Math.round(sz*.38)}px">${esc((a.nome||'?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span>`}
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

/* =====================================================================
   ALUNOS
   ===================================================================== */
function vAlunos(){
  const t=T();const al=alunosTodos(t);const nf_=alunosAval(t).length;UI.alView=UI.alView||'lista';
  if(UI.alView==='fotos'&&al.length)return vFotos(t,al,nf_);
  if(UI.alView==='msai'&&al.length)return vMsai(t,al);
  setTimeout(()=>{if(VIEW==='alunos'&&$('#b-pdf')&&!$('#barx .dica'))$('#b-pdf').insertAdjacentHTML('afterend',dicaExcel())});
  barBtns([{id:'b-edt',t:ic('pencil',15)+' Editar Turma',f:()=>editarTurmaDlg(t)},{id:'b-pdf',t:'Importar Excel…',f:()=>pickPdf(r=>importDlg(r))},{id:'b-add',t:'+ Aluno',f:()=>{t.alunos.push(novoAluno(t));save();vAlunos()}},
    {id:'b-csv',t:'Exportar CSV',f:()=>download('Alunos '+t.nome+' '+t.disciplina+'.csv',csv([[...(t.origens?['Turma']:[]),'N.º','Processo','Nome','Sexo','Nascimento','Frequenta '+t.disciplina,'Repetente','ASE','EE','Contacto EE','Email','Observações'],...al.map(a=>[...(t.origens?[a.origem||'']:[]),a.num,a.processo,a.nome,a.genero,fmtD(a.nasc),a.frequenta?'Sim':'Não',a.repetente?'Sim':'',a.ase,a.eeNome,a.eeContacto,a.email,a.obs])]),'text/csv')}]);
  $('#view').innerHTML=`<div class="card wide">
    <div class="row" style="margin-bottom:8px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} <span class="nt" style="font-weight:400;font-size:14px;color:var(--mut)">${al.length} alunos · <span style="color:var(--acc);font-weight:600">${nf_} frequentam</span></span></h2>${t.origens?`<span class="tag">conjunta: ${esc(t.origens.join(' + '))}</span>${fontesTurmas(A()).some(x=>t.origens.includes(x.nome))?`<button class="btn sm" id="b-orig" title="Acrescenta alunos novos e atualiza fotos e fichas a partir das turmas originais">↻ Atualizar das turmas de origem</button>`:''}`:''}<span class="sp1"></span>
      ${al.length?alTabs('lista'):''}</div>
    ${al.length?`<div class="deleg">${proxAulaHtml(t)}${proxAulaHtml(t)?'<span style="margin:0 10px;color:var(--line)">|</span>':''}${turmasDaClasse(t).filter(n=>dtDe(A(),n)||souDT(A(),n)).map(n=>'<span class="mut">'+tituloDT(souDT(A(),n)&&!dtDe(A(),n)?S.cfg.professor:dtDe(A(),n))+(turmasDaClasse(t).length>1?' do '+esc(n):'')+':</span> <b>'+(souDT(A(),n)?'Você'+(dtDe(A(),n)?' ('+esc(profNome(dtDe(A(),n)))+')':''):esc(profNome(dtDe(A(),n))))+'</b>').join(' <span style="margin:0 6px;color:var(--line)">|</span> ')}</div><div class="deleg">${delegadosResumo(t)}</div><p class="hint" style="margin:0 0 8px">Só os alunos assinalados em “Frequenta” aparecem nos instrumentos, na avaliação e nos relatórios desta disciplina.</p>
    <div style="overflow:auto"><table class="lst alst"><thead><tr><th class="c-fq"><label class="selall" title="Assinalar/desmarcar todos — frequenta esta disciplina"><input type="checkbox" id="f-allcb" ${al.every(a=>a.frequenta)?"checked":""}> <span>Freq.</span></label></th><th class="c-ft"><span class="sr">Fotografia</span></th>${t.origens?'<th>Turma</th>':''}<th class="c-n">N.º</th><th class="sens">Processo</th><th class="c-nm">Nome</th><th>Sexo</th><th class="sens">Nascimento</th><th class="sens c-id">Idade</th><th class="sens">Repet.</th><th class="sens">ASE</th><th class="sens">MSAI</th><th><span class="sr">Ações</span></th></tr></thead><tbody>
    ${al.map(a=>`<tr data-a="${a.id}" class="${a.frequenta?'':'off'}"><td class="keep c-fq"><input type="checkbox" data-k="frequenta" aria-label="Frequenta" ${a.frequenta?'checked':''}></td><td class="c-ft" style="cursor:pointer" data-fi="${a.id}">${avatar(a,46)}</td>${t.origens?`<td><span class="tag">${esc(a.origem||'—')}</span></td>`:''}<td class="c-n"><input data-k="num" value="${esc(a.num)}" inputmode="numeric" aria-label="Número"></td><td class="sens"><input data-k="processo" value="${esc(a.processo)}"></td><td class="tdnome"><div class="nmcell"><span class="nmw" data-v="${esc(a.nome)}"><textarea data-k="nome" rows="1" spellcheck="false" aria-label="Nome">${esc(a.nome)}</textarea></span>${cargoTag(a,1)}</div></td>
      <td><select data-k="genero" style="min-width:64px"><option value="M" ${a.genero!=='F'?'selected':''}>M</option><option value="F" ${a.genero==='F'?'selected':''}>F</option></select></td>
      <td class="sens"><input type="date" data-k="nasc" style="min-width:118px" value="${esc(a.nasc)}"></td><td class="mut sens c-id">${idade(a.nasc)}</td>
      <td class="sens"><select data-k="repetente" style="min-width:72px"><option value="">Não</option><option value="1" ${a.repetente?'selected':''}>Sim</option></select></td>
      <td class="sens"><select data-k="ase" style="min-width:58px"><option value="">—</option>${['A','B','C'].map(x=>`<option ${a.ase===x?'selected':''}>${x}</option>`).join('')}</select></td>
      <td class="sens" style="font-size:12px">${msaiBadges(a)||'<span class="mut">—</span>'}</td>
      <td class="act keep"><div class="acts"><button class="btn sm" data-fi="${a.id}" aria-label="Ficha do aluno">${ic('idcard',14)}<span class="lb">Ficha</span></button><button class="btn sm ico dng" data-rm="${a.id}" title="Remover da turma" aria-label="Remover da turma">${ic('trash',14)}</button></div></td></tr>`).join('')}
    </tbody></table></div>`:`<div class="drop" id="al-drop">${ic('upload',22)}<br>Toque para escolher (ou arraste para aqui) o <b>Excel com as fotografias da turma</b>.<br><span class="cam-l">${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span><br><span class="hint">Também pode usar “Colar lista…” (copiar do Excel) ou “+ Aluno”.</span></div>`}
  </div>`;
  const dr=$('#al-drop');if(dr){dr.onclick=()=>pickPdf(r=>importDlg(r));dropZone(dr,r=>importDlg(r))}
  const bo=$('#b-orig');if(bo)bo.onclick=()=>atualizarDeOrigens(t);
  bindAlTabs();
  const fa=$('#f-allcb');if(fa){fa.indeterminate=al.some(a=>a.frequenta)&&!al.every(a=>a.frequenta);fa.onchange=()=>{t.alunos.forEach(a=>a.frequenta=fa.checked);save();vAlunos()}}
  $$('#view tr[data-a] [data-k]').forEach(el=>el.addEventListener('change',()=>{
    const a=t.alunos.find(x=>x.id===el.closest('tr').dataset.a);const k=el.dataset.k;
    if(k==='genero'){if(el.value==='auto'){a.generoManual=false;a.genero=guessGen(a.nome)}else{a.generoManual=true;a.genero=el.value}}
    else if(k==='nome')setNome(a,el.value);
    else a[k]=k==='repetente'?!!el.value:k==='frequenta'?el.checked:el.value;
    save();if(['num','nasc','nome','frequenta','genero'].includes(k))vAlunos();
  }));
  $$('#view tr[data-a]').forEach(tr=>longoToque(tr,(x,y)=>{const al=t.alunos.find(q=>q.id===tr.dataset.a);if(!al)return;const outras=A().turmas.filter(q=>q!==t);
    const mv=(dest,copiar)=>()=>{if(dest.alunos.some(q=>normT(q.nome)===normT(al.nome)))return toast(al.nome+' já está em '+dest.nome,'aviso');const c=JSON.parse(JSON.stringify(al));c.id=copiar?uid():al.id;dest.alunos.push(c);if(!copiar)t.alunos=t.alunos.filter(q=>q!==al);save();vAlunos();toast(al.nome+(copiar?' copiado para ':' movido para ')+dest.nome+' · '+dest.disciplina,'ok')};
    menuContexto(x,y,[{t:'Ficha do aluno',ic:'idcard',f:()=>fichaAluno(al.id)},'-',...outras.slice(0,6).map(d=>({t:'Mover para '+d.nome+' · '+d.disciplina,ic:'merge',f:mv(d,false)})),...outras.slice(0,6).map(d=>({t:'Copiar para '+d.nome+' · '+d.disciplina,ic:'copy',f:mv(d,true)})),'-',{t:'Remover da turma',ic:'trash',dng:true,f:()=>{const b=tr.querySelector('[data-rm]');if(b)b.click()}}])}));
  $$('[data-rm]').forEach(b=>b.onclick=()=>{const a=t.alunos.find(x=>x.id===b.dataset.rm);if(confirm('Remover '+a.nome+' da turma? As classificações deste aluno também são apagadas.\n\n(Se o aluno apenas não frequenta a disciplina, desmarque “Frequenta”.)')){t.alunos=t.alunos.filter(x=>x!==a);t.instrumentos.forEach(i=>delete i.notas[a.id]);save();vAlunos()}});
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
function vFotos(t,al,nf_){
  barBtns([{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}}]);
  const semFoto=al.filter(a=>!a.foto).length;
  $('#view').innerHTML=`<div class="card wide">
    <div class="row noprint" style="margin-bottom:12px"><h2 style="margin:0">${esc(t.nome)} · ${esc(t.disciplina)} — fotografias</h2><span class="sp1"></span>
      ${alTabs('fotos')}</div>
    <div style="text-align:center;margin-bottom:12px"><b style="font-size:16px">${esc(escolaDe(t).escola||'')}</b><br>Turma ${esc(t.nome)} · Ano letivo ${esc((A()||{}).nome||'')}</div>
    <div class="deleg" style="justify-content:center">${delegadosResumo(t)}</div>
    ${semFoto?`<p class="hint noprint">${semFoto} aluno${semFoto>1?'s':''} sem foto — clique num aluno para adicionar a fotografia. Alunos esbatidos não frequentam ${esc(t.disciplina)}.</p>`:''}
    <div class="fotos fotosr">${al.map(a=>`<div class="fcard ${a.frequenta?'':'off'}" data-fi="${a.id}"><div class="ph">${avatar(a,200)}</div><small>${t.origens&&a.origem?esc(a.origem)+' · ':''}${esc(numAl(a))}${a.processo?' ('+esc(a.processo)+')':''}</small><b>${esc(a.nome)}</b>${cargoTag(a)}</div>`).join('')}</div></div>`;
  bindAlTabs();
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi));
}
function alTabs(cur){return `<div class="tabs noprint" style="margin:0">${[['lista','list','Lista'],['fotos','image','Fotografias'],['msai','access','Quadro MSAI']].map(([k,i,l])=>`<button data-alv="${k}" class="${k===cur?'on':''}">${ic(i,14)} ${l}</button>`).join('')}</div>`}
function bindAlTabs(){$$('[data-alv]').forEach(b=>b.onclick=()=>{UI.alView=b.dataset.alv;vAlunos()})}
/* quadro MSAI da turma: alunos × medidas (quadro em ecrãs largos, cartões em ecrãs estreitos) */
/* ===================== PDF simples (sem bibliotecas): texto, linhas, retângulos e logotipo JPEG ===================== */
const WIN={0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};
function pdfStr(s){let o='';for(const ch of String(s).replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/[✓✔]/g,'v').replace(/[★☆]/g,'*').replace(/[←]/g,'<-')){let c=ch.codePointAt(0);if(c===0x200B)continue;if(c>255)c=WIN[c]||(c===0x2192?0x3E:0x3F);const x=String.fromCharCode(c);o+=x==='('||x===')'||x==='\\'?'\\'+x:x}return '('+o+')'}
const _pdfCtx=(()=>{let c=null;return ()=>c||(c=document.createElement('canvas').getContext('2d'))})();
function pdfW(s,sz,b){const c=_pdfCtx();c.font=(b?'bold ':'')+'100px Helvetica, Arial, sans-serif';return c.measureText(String(s)).width/100*sz}
function pdfWrap(s,w,sz,b){const out=[];String(s||'').split('\n').forEach(par=>{let l='';par.split(/\s+/).filter(Boolean).forEach(word=>{const t=l?l+' '+word:word;if(pdfW(t,sz,b)<=w||!l)l=t;else{out.push(l);l=word}});out.push(l)});return out}
function corPdf(hex){let h=hex.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>(parseInt(h.substr(i,2),16)/255).toFixed(3)).join(' ')}
class MiniPDF{constructor(w,h){this.W=w;this.H=h;this.pages=[];this.img=null;this.nova()}
  nova(){this.cur=[];this.pages.push(this.cur)}
  txt(x,y,s,sz,o){o=o||{};this.cur.push(`BT /${o.b?'F2':'F1'} ${sz} Tf ${o.cor?corPdf(o.cor)+' rg ':'0.1 0.1 0.12 rg '}${x.toFixed(2)} ${(this.H-y).toFixed(2)} Td ${o.tw?o.tw.toFixed(3)+' Tw ':''}${pdfStr(s)} Tj ${o.tw?'0 Tw ':''}ET`)}
  rect(x,y,w,h,cor,stroke){this.cur.push(`${stroke?corPdf(stroke)+' RG 0.6 w ':''}${cor?corPdf(cor)+' rg ':''}${x.toFixed(2)} ${(this.H-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${cor&&stroke?'B':cor?'f':'S'}`)}
  linha(x1,y1,x2,y2,cor,lw){this.cur.push(`${corPdf(cor||'#c8ccd2')} RG ${lw||0.5} w ${x1.toFixed(2)} ${(this.H-y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.H-y2).toFixed(2)} l S`)}
  imagem(x,y,w,h){if(this.img)this.cur.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${(this.H-y-h).toFixed(2)} cm /Im1 Do Q`)}
  bytes(){const enc=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b};const parts=[];let off=0;const offs=[];
    const push=s=>{const b=typeof s==='string'?enc(s):s;parts.push(b);off+=b.length};
    const objs=[];const add=o=>{objs.push(o);return objs.length};
    const cat=add(null),pgs=add(null),f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    let im=0;if(this.img)im=add({img:this.img});
    const kids=this.pages.map(p=>{const st=p.join('\n');const c=add({stream:st});return add(`<< /Type /Page /Parent ${pgs} 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >>${im?` /XObject << /Im1 ${im} 0 R >>`:''} >> /Contents ${c} 0 R >>`)});
    objs[cat-1]=`<< /Type /Catalog /Pages ${pgs} 0 R >>`;objs[pgs-1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    objs.forEach((o,i)=>{offs.push(off);push(`${i+1} 0 obj\n`);
      if(o&&o.stream!=null){const b=enc(o.stream);push(`<< /Length ${b.length} >>\nstream\n`);push(b);push('\nendstream')}
      else if(o&&o.img){push(`<< /Type /XObject /Subtype /Image /Width ${o.img.w} /Height ${o.img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${o.img.data.length} >>\nstream\n`);push(o.img.data);push('\nendstream')}
      else push(o);push('\nendobj\n')});
    const x=off;push(`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF`);
    const out=new Uint8Array(off);let p=0;parts.forEach(b=>{out.set(b,p);p+=b.length});return out}}
function logoJpeg(src){return new Promise(ok=>{if(!src)return ok(null);const im=new Image();im.onload=()=>{try{const k=Math.min(1,240/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);
  const b=atob(c.toDataURL('image/jpeg',.9).split(',')[1]);const d=new Uint8Array(b.length);for(let i=0;i<b.length;i++)d[i]=b.charCodeAt(i);ok({w:c.width,h:c.height,data:d})}catch(_){ok(null)}};im.onerror=()=>ok(null);im.src=src})}
/* ---------- PDF das MSAI (turma ou um aluno) ---------- */
async function exportarMsaiPdf(t,alunos,opts){opts=opts||{};const a=A();const c={...S.cfg,...escolaDe(t)};ocupado&&ocupado('A preparar o PDF…');
  try{const pdf=new MiniPDF(842,595);pdf.img=await logoJpeg(c.logo);const M=36,LW=842-2*M;let y=M;
    const temM=x=>Object.keys(MEDIDAS).some(k=>(x.medidas&&x.medidas[k]||[]).length)||(x.acomod||[]).length||Object.values(x.docs||{}).some(d=>d&&d.on);
    const L=alunos.filter(x=>opts.todos||temM(x));const sem=alunos.filter(x=>!temM(x));
    const cab=()=>{y=M;if(pdf.img){const h=34,w=h*pdf.img.w/pdf.img.h;pdf.imagem(M,y,Math.min(w,90),h)}const xo=pdf.img?M+Math.min(34*pdf.img.w/pdf.img.h,90)+10:M;
      pdf.txt(xo,y+12,c.escola||'',11,{b:true});pdf.txt(xo,y+26,[c.agrupamento,'Ano letivo '+((a||{}).nome||'')].filter(Boolean).join(' · '),8.5,{cor:'#555b66'});
      const dir=t.disciplina+' · Turma '+(t.origens?t.origens.join(' + '):t.nome);pdf.txt(842-M-pdfW(dir,9,true),y+12,dir,9,{b:true});const pr=c.professor?profNome(c.professor):'';pdf.txt(842-M-pdfW(pr,8.5),y+26,pr,8.5,{cor:'#555b66'});
      y+=44;pdf.linha(M,y,842-M,y,'#1b5fbf',1.2);y+=8};
    cab();
    const tit=opts.titulo||('Medidas de Suporte à Aprendizagem e à Inclusão');pdf.txt(M,y+16,tit,15,{b:true});
    pdf.txt(M,y+30,'Decreto-Lei n.º 54/2018 · '+(alunos.length===1?alunos[0].nome:alunos.length+' alunos, '+L.filter(temM).length+' com medidas')+' · emitido a '+new Date().toLocaleDateString('pt-PT'),8.5,{cor:'#555b66'});y+=42;
    // resumo por tipo de medida
    if(alunos.length>1){const G=Object.entries(MEDIDAS);const bw=(LW-(G.length-1)*8)/G.length;G.forEach(([k,g],i)=>{const n=alunos.filter(x=>(x.medidas&&x.medidas[k]||[]).length).length;const x=M+i*(bw+8);
      pdf.rect(x,y,bw,34,'#f4f6f9','#dde1e7');pdf.rect(x,y,4,34,g.cor);pdf.txt(x+12,y+14,g.t.replace('Adaptações ao processo de avaliação','Adaptações à avaliação').replace('Recursos específicos de apoio','Recursos específicos'),8,{cor:'#555b66'});pdf.txt(x+12,y+28,String(n)+(n===1?' aluno':' alunos'),11,{b:true})});y+=46}
    // tabela
    const cols=[{k:'n',t:'N.º',w:26},{k:'nome',t:'Aluno',w:118}];const rest=LW-26-118;const grupos=['univ','selet','adic','aval','rec'];
    const ws=[0.2,0.19,0.19,0.22,0.2];grupos.forEach((k,i)=>cols.push({k,t:MEDIDAS[k].t.replace('Adaptações ao processo de avaliação','Adaptações à avaliação').replace('Recursos específicos de apoio','Recursos e documentos'),w:rest*ws[i],cor:MEDIDAS[k].cor}));
    const FS=7.6,LH=9.6,PAD=5;
    const cabTab=()=>{let x=M;pdf.rect(M,y,LW,20,'#1f2937');cols.forEach(cl=>{if(cl.cor)pdf.rect(x,y,cl.w,3,cl.cor);pdfWrap(cl.t,cl.w-2*PAD,7.5,true).slice(0,2).forEach((l,i)=>pdf.txt(x+PAD,y+(cl.t.length>24?10:13)+i*8,l,7.5,{b:true,cor:'#ffffff'}));x+=cl.w});y+=20};
    const rodape=()=>{};
    cabTab();
    L.forEach((al,ri)=>{const m=al.medidas||{},ob=al.medObs||{};
      const cel={n:[String(al.num||'')],nome:pdfWrap(al.nome+(al.origem&&t.origens?' ('+al.origem+')':''),118-2*PAD,FS+.4,true)};
      grupos.forEach(k=>{const g=MEDIDAS[k];let it=(m[k]||[]).slice().sort((p,q)=>p-q).map(i=>'• '+g.l[i]);
        if(k==='univ'&&(al.acomod||[]).length)it.push('Acomodações: '+al.acomod.slice().sort((p,q)=>p-q).map(i=>ACOMOD[i]).join('; '));
        if(k==='rec'){DOCS.forEach((d,i)=>{if(al.docs&&al.docs[i]&&al.docs[i].on)it.push('› '+d)})}
        const o=ob[k]&&Object.values(ob[k]).filter(Boolean).join('; ');if(o)it.push('Obs.: '+o);
        const cw=cols.find(c=>c.k===k).w-2*PAD;cel[k]=it.length?it.flatMap(s=>pdfWrap(s,cw,FS).map((l,i)=>s.startsWith('Obs.:')&&i?'\u200b'+l:l)):['—']});
      const nl=Math.max(...Object.values(cel).map(v=>v.length));const h=nl*LH+2*PAD;
      if(y+h>595-M-16){pdf.nova();cab();cabTab()}
      if(ri%2)pdf.rect(M,y,LW,h,'#f7f8fa');let x=M;
      cols.forEach(cl=>{(cel[cl.k]||[]).forEach((l,i)=>pdf.txt(x+PAD,y+PAD+FS+i*LH,l,cl.k==='nome'?FS+.4:FS,{b:cl.k==='nome'||cl.k==='n',cor:l==='—'?'#9aa1ab':l.startsWith('Obs.:')||l.startsWith('\u200b')?'#5b6b7f':null}));x+=cl.w;if(x<M+LW-1)pdf.linha(x,y,x,y+h,'#e3e6ea')});
      y+=h;pdf.linha(M,y,M+LW,y,'#d5d9df')});
    if(!L.length){pdf.txt(M,y+18,'Nenhum aluno com medidas registadas.',10,{cor:'#555b66'});y+=28}
    if(alunos.length>1&&sem.length&&!opts.todos){const s='Sem medidas registadas: '+sem.map(x=>x.num?x.num+'.':'').filter(Boolean).join(' ')+(sem.length?' ('+sem.length+' alunos)':'');const ls=pdfWrap(s,LW,8);if(y+ls.length*10+20>595-M-16){pdf.nova();cab()}y+=14;ls.forEach(l=>{pdf.txt(M,y,l,8,{cor:'#555b66'});y+=10})}
    // assinaturas e rodapé
    if(y+60>595-M-16){pdf.nova();cab()}y=Math.max(y+40,595-M-56);pdf.linha(M,y,M+220,y,'#888');pdf.linha(842-M-220,y,842-M,y,'#888');
    pdf.txt(M,y+12,profRotulo()+(c.professor?' — '+profNome(c.professor):''),8,{cor:'#555b66'});pdf.txt(842-M-220,y+12,(t=>{const d=dtDe(a,turmasDaClasse(t)[0]);return (d?(guessGen(d)==='F'?'A ':'O '):'O(A) ')+tituloDT(d)+(d?' — '+d:'')})(t),8,{cor:'#555b66'});
    const N=pdf.pages.length;pdf.pages.forEach((p,i)=>{pdf.cur=p;pdf.linha(M,595-24,842-M,595-24,'#e3e6ea');pdf.txt(M,595-14,'Documento confidencial — contém dados pessoais e de saúde/educação especial (RGPD). Não divulgar.',7,{cor:'#8a909a'});const pg='Página '+(i+1)+' de '+N;pdf.txt(842-M-pdfW(pg,7),595-14,pg,7,{cor:'#8a909a'})});
    const nome=(opts.ficheiro||('MSAI '+t.nome+' '+t.disciplina)).replace(/[\\/:*?"<>|]/g,'-')+'.pdf';
    download(nome,pdf.bytes(),'application/pdf');regista('Exportação','MSAI (PDF)',nome);toast('PDF das MSAI exportado','ok')}
  catch(e){console.error(e);alert('Não foi possível criar o PDF: '+e.message)}finally{livre&&livre()}}

function vMsai(t,al){
  UI.msaiSo=UI.msaiSo!==false;UI.msaiUso=UI.msaiUso!==false;
  barBtns([{id:'b-mpdf',t:ic('file',15)+' Exportar PDF',c:'pri',f:()=>exportarMsaiPdf(t,al)},{id:'b-pr',t:'Imprimir',f:()=>{document.body.classList.add('print-landscape');window.print()}},
    {id:'b-csv',t:'Exportar CSV',f:()=>download('MSAI '+t.nome+'.csv',csv([[...(t.origens?['Turma']:[]),'N.º','Nome',...Object.values(MEDIDAS).flatMap(g=>g.l.map((x,i)=>g.ab+' '+String.fromCharCode(97+i)+') '+x)),'Acomodações',...DOCS],...al.map(a=>[...(t.origens?[a.origem||'']:[]),a.num,a.nome,...Object.entries(MEDIDAS).flatMap(([k,g])=>g.l.map((x,i)=>(a.medidas&&a.medidas[k]||[]).includes(i)?'X':'')),(a.acomod||[]).map(i=>i+1).join(', '),...DOCS.map((d,i)=>(a.docs&&a.docs[i]&&a.docs[i].on)?'X':'')])]),'text/csv')}]);
  const has=(a,k,i)=>(a.medidas&&a.medidas[k]||[]).includes(i);
  const temM=a=>Object.keys(MEDIDAS).some(k=>(a.medidas&&a.medidas[k]||[]).length)||(a.acomod||[]).length||Object.values(a.docs||{}).some(d=>d&&d.on);
  const L=UI.msaiSo?al.filter(temM):al;const nCom=al.filter(temM).length;
  const largura=($('#view').clientWidth||1000);const modo=UI.msaiModo||(largura<900?'cartoes':'quadro');
  // colunas: só medidas em uso (por algum aluno da lista) ou todas
  const G=Object.entries(MEDIDAS).map(([k,g])=>({k,g,cols:g.l.map((x,i)=>({i,x})).filter(c=>!UI.msaiUso||L.some(a=>has(a,k,c.i)))})).filter(x=>x.cols.length);
  const DC=DOCS.map((d,i)=>({i,ab:(d.match(/\((\w+)\)/)||[])[1]||d})).filter(d=>!UI.msaiUso||L.some(a=>a.docs&&a.docs[d.i]&&a.docs[d.i].on));
  const usaAc=!UI.msaiUso||L.some(a=>(a.acomod||[]).length);
  const numA=a=>(t.origens&&a.origem?esc(a.origem.split(' ').pop())+' ':'')+esc(numAl(a));
  const quadro=()=>`<div class="mxw"><table class="mx"><thead>
      <tr><th rowspan="2" class="stc0">N.º</th><th rowspan="2" class="stc1" style="text-align:left">Nome</th>${G.map(({k,g,cols})=>`<th colspan="${cols.length}" class="gh" style="background:${g.cor}" title="${esc(tcap(g.t))}">${esc(cols.length<=2?({univ:'Universais',selet:'Seletivas',adic:'Adicionais',aval:'Avaliação',rec:'Recursos'})[k]||tcap(g.t):tcap(g.t))}<div>${esc(g.art.replace(/^art/,'Art'))}</div></th>`).join('')}${usaAc?'<th rowspan="2" class="v acc"><div>Acomodações</div></th>':''}${DC.map(d=>`<th rowspan="2" class="v dc"><div>${esc(d.ab)}</div></th>`).join('')}</tr>
      <tr>${G.map(({g,cols})=>cols.map(c=>`<th class="v" style="--gc:${g.cor}"><div><b>${String.fromCharCode(97+c.i)})</b> ${esc(c.x)}</div></th>`).join('')).join('')}</tr></thead><tbody>
      ${L.map(a=>`<tr data-fi="${a.id}"><td class="stc0">${numA(a)}</td><td class="nm stc1">${esc(a.nome)}${cargoTag(a)}</td>
        ${G.map(({k,g,cols})=>cols.map(c=>{const on=has(a,k,c.i);return `<td class="${on?'x':''}" style="${on?'background:'+g.cor:''}">${on?'✓':''}</td>`}).join('')).join('')}
        ${usaAc?`<td class="ac">${esc((a.acomod||[]).map(i=>i+1).join(', '))}</td>`:''}${DC.map(d=>`<td>${a.docs&&a.docs[d.i]&&a.docs[d.i].on?'✓':''}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  const cartoes=()=>`<div class="mscards">${L.map(a=>{const sec=Object.entries(MEDIDAS).map(([k,g])=>({g,l:g.l.map((x,i)=>({x,i})).filter(c=>has(a,k,c.i))})).filter(s=>s.l.length);
      const docs=DOCS.filter((d,i)=>a.docs&&a.docs[i]&&a.docs[i].on).map(d=>(d.match(/\((\w+)\)/)||[])[1]||d);
      return `<button class="mscard" data-fi="${a.id}"><div class="msh"><span class="n">${numA(a)}</span><b>${esc(a.nome)}</b>${cargoTag(a)}<span class="sp1"></span>${docs.map(d=>`<span class="tag">${esc(d)}</span>`).join(' ')}</div>
        ${sec.map(s=>`<div class="mss" style="--gc:${s.g.cor}"><div class="mst">${esc(tcap(s.g.t))} <span>${esc(s.g.art.replace(/^art/,'Art'))}</span></div><ul>${s.l.map(c=>`<li><b>${String.fromCharCode(97+c.i)})</b> ${esc(c.x)}</li>`).join('')}</ul></div>`).join('')}
        ${(a.acomod||[]).length?`<div class="mss" style="--gc:#5b6b7f"><div class="mst">Acomodações Curriculares</div><ul>${a.acomod.map(i=>`<li><b>${i+1}.</b> ${esc(ACOMOD[i])}</li>`).join('')}</ul></div>`:''}
        ${!sec.length&&!(a.acomod||[]).length&&!docs.length?'<div class="mut">Sem medidas assinaladas.</div>':''}</button>`}).join('')}</div>`;
  $('#view').innerHTML=`<div class="card wide">
    <div class="row" style="margin-bottom:10px"><h2 style="margin:0">${ic('access')} Quadro MSAI — ${esc(t.nome)}</h2><span class="mut">${nCom} aluno${nCom===1?'':'s'} com medidas</span><span class="sp1"></span>${alTabs('msai')}</div>
    <div class="row msopt noprint">
      <div class="seg" id="ms-modo"><button type="button" data-mm="quadro" class="${modo==='quadro'?'on':''}">${ic('grid',15)} Quadro</button><button type="button" data-mm="cartoes" class="${modo==='cartoes'?'on':''}">${ic('list',15)} Por Aluno</button></div>
      <label class="chk"><input type="checkbox" id="ms-so" ${UI.msaiSo?'checked':''}> Só alunos com medidas</label>
      ${modo==='quadro'?`<label class="chk"><input type="checkbox" id="ms-uso" ${UI.msaiUso?'checked':''}> Só medidas em uso</label>`:''}</div>
    ${L.length?(modo==='quadro'?(G.length||usaAc||DC.length?quadro():'<div class="empty">Nenhuma medida assinalada nestes alunos.</div>'):cartoes()):'<div class="empty">Nenhum aluno com medidas assinaladas. Abra a ficha de um aluno → separador MSAI.</div>'}
    <p class="hint">Toque num aluno para abrir a ficha.${modo==='quadro'&&usaAc?' Acomodações: '+ACOMOD.map((x,i)=>(i+1)+'. '+esc(x)).join(' · '):''}</p></div>`;
  const tr1=$('.mxw thead tr');if(tr1)$('.mxw').style.setProperty('--h1',tr1.offsetHeight+'px');
  bindAlTabs();$('#ms-so').onchange=e=>{UI.msaiSo=e.target.checked;vAlunos()};
  const u=$('#ms-uso');if(u)u.onchange=e=>{UI.msaiUso=e.target.checked;vAlunos()};
  $$('[data-mm]').forEach(b=>b.onclick=()=>{UI.msaiModo=b.dataset.mm;vAlunos()});
  $$('[data-fi]').forEach(b=>b.onclick=()=>fichaAluno(b.dataset.fi,'msai'));
}
function medidasTxt(a){const m=a.medidas||{};return Object.entries(MEDIDAS).filter(([k])=>(m[k]||[]).length).map(([k,g])=>g.ab+'('+m[k].length+')').join(' ')}
function msaiBadges(a){const m=a.medidas||{};const b=Object.entries(MEDIDAS).filter(([k])=>(m[k]||[]).length).map(([k,g])=>`<span class="mb" style="background:${g.cor}" title="${esc(g.t)}: ${esc(m[k].map(i=>String.fromCharCode(97+i)+') '+g.l[i]).join('; '))}">${g.ab} ${m[k].map(i=>String.fromCharCode(97+i)).join('')}</span>`);
  if((a.acomod||[]).length)b.push(`<span class="mb" style="background:#5b6b7f" title="Acomodações: ${esc(a.acomod.map(i=>(i+1)+'. '+ACOMOD[i]).join('; '))}">Ac ${a.acomod.length}</span>`);
  return b.join(' ')}
function importDlg(r){
  const t=T();
  openDrawer('Importar alunos — '+(r.ficheiro||'Excel'),`<div class="ed">
    ${infoLeitura(r)}
    ${r.turma&&(r.turmas||[]).length<2&&r.turma!==t.nome?`<div class="alert w">O ficheiro parece ser da turma <b>${esc(r.turma)}</b> e está a importar para <b>${esc(t.nome)}</b>.</div>`:''}
    ${diffAlunos(t,r)}${tabelaPreview(r.alunos,r.turmas)}${textoLido(r)}
    ${r.alunos.length?`<label class="chk" style="margin-top:10px"><input type="radio" name="md" value="juntar" checked> Juntar aos alunos atuais (os que já existem com o mesmo nome são atualizados)</label>
    <label class="chk"><input type="radio" name="md" value="subst"> Substituir a lista atual (apaga as classificações dos alunos removidos)</label>
    <div class="row" style="margin-top:10px"><button class="btn pri" id="im-ok">Importar</button></div>`:''}</div>`);
  bindPreview();
  const st=$('#prev-t');if(st&&(r.turmas||[]).includes(t.nome)){st.value=t.nome;st.dispatchEvent(new Event('change'))}
  const ok=$('#im-ok');if(ok)ok.onclick=()=>{
    const rows=previewRows();const subst=document.querySelector('input[name=md]:checked').value==='subst';
    const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
    let novos=0,atual=0;const keep=new Set();
    rows.forEach(p=>{const ex=t.alunos.find(a=>norm(a.nome)===norm(p.nome)||(p.processo&&a.processo===p.processo));
      if(ex){if(p.generoManual||!ex.generoManual){ex.genero=p.genero;ex.generoManual=!!p.generoManual}Object.assign(ex,{num:p.num,processo:p.processo||ex.processo,nasc:p.nasc||ex.nasc,foto:p.foto||ex.foto||''});keep.add(ex.id);atual++}
      else{const a=Object.assign(novoAluno(t,p.nome),{num:p.num,processo:p.processo,genero:p.genero,generoManual:!!p.generoManual,nasc:p.nasc,frequenta:p.frequenta,foto:p.foto||''});t.alunos.push(a);keep.add(a.id);novos++}});
    if(subst){const rm=t.alunos.filter(a=>!keep.has(a.id));if(rm.length&&!confirm('Vão ser removidos '+rm.length+' alunos que não estão no ficheiro. Continuar?'))return;t.alunos=t.alunos.filter(a=>keep.has(a.id));rm.forEach(a=>t.instrumentos.forEach(i=>delete i.notas[a.id]))}
    regista('Alunos (Excel)',r.ficheiro,t.nome+': '+novos+' novos, '+atual+' atualizados');save();closeDrawer();vAlunos();toast(novos+' novos, '+atual+' atualizados','ok');
  };
}
function fichaAluno0(id,tab){
  const t=T(),a=t.alunos.find(x=>x.id===id);a.medidas=a.medidas||{};a.medObs=a.medObs||{};a.acomod=a.acomod||[];a.docs=a.docs||{};
  UI.fichaTab=tab||UI.fichaTab||'geral';const turmaA=a.origem||t.nome;
  const nMed=Object.keys(MEDIDAS).reduce((n,k)=>n+(a.medidas[k]||[]).length,0)+a.acomod.length;
  const linhaM=(k,g,x,i)=>{const on=(a.medidas[k]||[]).includes(i);return `<tr class="${on?'on':''}"><td class="ck"><input type="checkbox" data-m="${k}" value="${i}" ${on?'checked':''}></td><td class="al">${String.fromCharCode(97+i)})</td><td>${esc(x)}</td><td class="ob"><input data-mo="${k}:${i}" value="${esc((a.medObs[k]||{})[i]||'')}" placeholder="disciplinas, horário, observações…"></td></tr>`};
  const sec=(g,extra)=>`<tr class="sec" style="--c:${g.cor}"><td colspan="4"><span class="mb" style="background:${g.cor}">${g.ab}</span> ${esc(g.t)}<span class="art">${esc(g.art)}</span>${extra||''}</td></tr>`;
  openDrawer(a.num+'. '+a.nome,`<div class="ed">
    <div class="row" style="align-items:flex-start;margin-bottom:10px"><div id="fa-ph">${avatar(a,150)}</div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
      <b style="font-size:16px">${esc(a.nome)}</b><span class="mut">Turma ${esc(turmaA)} · N.º ${esc(numAl(a))}${a.processo?' · processo '+esc(a.processo):''}</span>
      <div class="row" style="gap:6px"><button class="btn sm" id="fa-up">${a.foto?'Alterar fotografia':'Adicionar fotografia'}</button>${a.foto?'<button class="btn sm dng" id="fa-rm">Remover fotografia</button>':''}<input type="file" id="fa-f" accept="image/*" hidden></div>
      <div id="fa-bd">${msaiBadges(a)}</div></div></div>
    <div class="tabs"><button data-ft="geral" class="${UI.fichaTab==='geral'?'on':''}">Dados</button><button data-ft="msai" class="${UI.fichaTab==='msai'?'on':''}">MSAI${nMed?' ('+nMed+')':''}</button></div>
    ${UI.fichaTab==='geral'?`
    <div class="g2"><div><label>Sexo</label><select id="fa-gen"><option value="M" ${a.genero!=='F'?'selected':''}>Masculino</option><option value="F" ${a.genero==='F'?'selected':''}>Feminino</option></select></div>
      <div><label>Cargo na turma ${esc(turmaA)}</label><select id="fa-cargo"><option value="">—</option><option value="D" ${a.cargo==='D'?'selected':''}>${a.genero==='F'?'Delegada':'Delegado'} de turma</option><option value="SD" ${a.cargo==='SD'?'selected':''}>${a.genero==='F'?'Subdelegada':'Subdelegado'} de turma</option></select></div></div>
    <label class="chk" style="font-size:14px"><input type="checkbox" data-fq ${a.frequenta?'checked':''}> Frequenta ${esc(t.disciplina)}</label>
    <h3>Encarregado de educação</h3>
    <div class="g2"><div><label>Nome</label><input data-f="eeNome" value="${esc(a.eeNome)}"></div><div><label>Contacto</label><input data-f="eeContacto" value="${esc(a.eeContacto)}"></div></div>
    <div class="g2"><div><label>Endereço eletrónico</label><input data-f="email" value="${esc(a.email)}"></div></div>
    <h3>Observações</h3><textarea data-f="obs">${esc(a.obs)}</textarea>`
    :`<p class="hint" style="margin-top:0">Medidas de Suporte à Aprendizagem e à Inclusão (DL n.º 54/2018). Assinale as medidas aplicadas e, se quiser, indique as disciplinas ou observações.</p>
    <table class="msai"><tbody>
      <tr class="sec" style="--c:#0a5aa8"><td colspan="4">${ic('file')} Documentos</td></tr>
      ${DOCS.map((d,i)=>{const o=a.docs[i]||{};return `<tr class="${o.on?'on':''}"><td class="ck"><input type="checkbox" data-doc="${i}" ${o.on?'checked':''}></td><td class="al"></td><td>${esc(d)}</td><td class="ob"><input data-docd="${i}" value="${esc(o.obs||'')}" placeholder="data / observações"></td></tr>`}).join('')}
      ${Object.entries(MEDIDAS).map(([k,g])=>sec(g)+g.l.map((x,i)=>linhaM(k,g,x,i)).join('')+(k==='univ'?`<tr class="sec" style="--c:#5b6b7f"><td colspan="4"><span class="mb" style="background:#5b6b7f">Ac</span> Acomodações curriculares<span class="art">art. 8.º, n.º 2, b)</span></td></tr>
        ${ACOMOD.map((x,i)=>{const on=a.acomod.includes(i);return `<tr class="${on?'on':''}"><td class="ck"><input type="checkbox" data-ac value="${i}" ${on?'checked':''}></td><td class="al">${i+1}</td><td colspan="2">${esc(x)}</td></tr>`}).join('')}`:'')).join('')}
    </tbody></table>`}
  </div>`);
  const refr=()=>{save();fichaAluno(id);if(VIEW==='alunos')vAlunos()};
  $$('#dw-b table.msai tbody tr:not(.sec)').forEach(tr=>tr.addEventListener('click',e=>{if(e.target.closest('input'))return;const cb=tr.querySelector('input[type=checkbox]');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'))}}));
  const marca=el=>{el.closest('tr').classList.toggle('on',el.checked);const bd=$('#fa-bd');if(bd)bd.innerHTML=msaiBadges(a);save();if(VIEW==='alunos')vAlunos()};
  $$('[data-ft]').forEach(b=>b.onclick=()=>fichaAluno(id,b.dataset.ft));
  $('#fa-up').onclick=()=>$('#fa-f').click();
  $('#fa-f').onchange=e=>{const f=e.target.files[0];if(f)fotoDeFicheiro(f).then(u=>{a.foto=u;refr()}).catch(er=>alert(er.message))};
  const rmf=$('#fa-rm');if(rmf)rmf.onclick=()=>{a.foto='';refr()};
  const fg=$('#fa-gen');if(fg)fg.onchange=()=>{if(fg.value==='auto'){a.generoManual=false;a.genero=guessGen(a.nome)}else{a.generoManual=true;a.genero=fg.value}refr()};
  const fc=$('#fa-cargo');if(fc)fc.onchange=()=>{definirCargo(t,a,fc.value);refr()};
  const fq=$('#dw-b [data-fq]');if(fq)fq.onchange=e=>{a.frequenta=e.target.checked;save();if(VIEW==='alunos')vAlunos()};
  $$('#dw-b [data-f]').forEach(el=>el.oninput=()=>{a[el.dataset.f]=el.value;save()});
  $$('#dw-b [data-m]').forEach(el=>el.onchange=()=>{const k=el.dataset.m,i=+el.value;a.medidas[k]=(a.medidas[k]||[]).filter(x=>x!==i);if(el.checked)a.medidas[k].push(i);a.medidas[k].sort();propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-mo]').forEach(el=>el.oninput=()=>{const [k,i]=el.dataset.mo.split(':');a.medObs[k]=a.medObs[k]||{};a.medObs[k][i]=el.value;propagarFicha(t,a);save()});
  $$('#dw-b [data-ac]').forEach(el=>el.onchange=()=>{const i=+el.value;a.acomod=a.acomod.filter(x=>x!==i);if(el.checked)a.acomod.push(i);a.acomod.sort((x,y)=>x-y);propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-doc]').forEach(el=>el.onchange=()=>{const i=el.dataset.doc;a.docs[i]=a.docs[i]||{};a.docs[i].on=el.checked;propagarFicha(t,a);marca(el)});
  $$('#dw-b [data-docd]').forEach(el=>el.oninput=()=>{const i=el.dataset.docd;a.docs[i]=a.docs[i]||{};a.docs[i].obs=el.value;propagarFicha(t,a);save()});
}
/* o mesmo aluno noutras turmas/disciplinas do mesmo ano (mesma turma de origem; mesmo processo ou nome) */
function mesmosAlunos(t,a){
  const cls=a.origem||t.nome;const norm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();const out=[];
  (A()||{turmas:[]}).turmas.forEach(r=>{if(r===t)return;r.alunos.forEach(x=>{const xc=x.origem||r.nome;if(xc!==cls)return;
    if((a.processo&&x.processo===a.processo)||norm(x.nome)===norm(a.nome))out.push({r,x})})});
  return out;
}
function propagarFicha(t,a){mesmosAlunos(t,a).forEach(({x})=>{['medidas','medObs','acomod','docs'].forEach(f=>x[f]=JSON.parse(JSON.stringify(a[f]||{})));if(Array.isArray(a.acomod))x.acomod=a.acomod.slice()})}
/* delegado / subdelegado: um de cada por turma (de origem) */
function definirCargo(t,a,cargo){
  const cls=a.origem||t.nome;
  const limpa=(r,lista)=>lista.forEach(x=>{if(cargo&&x.cargo===cargo&&(x.origem||r.nome)===cls)x.cargo=''});
  limpa(t,t.alunos);(A()||{turmas:[]}).turmas.forEach(r=>{if(r!==t)limpa(r,r.alunos)});
  a.cargo=cargo;mesmosAlunos(t,a).forEach(({x})=>x.cargo=cargo);
}
const cargoNome=a=>(a.cargo==='D'?'Delegad':'Subdelegad')+(a.genero==='F'?'a':'o');
const cargoTag=(a,curto)=>!a.cargo?'':`<span class="cargo ${a.cargo==='SD'?'sd':''}" title="${cargoNome(a)} de turma">${a.cargo==='D'?ic('crown',11)+' ':''}${curto?a.cargo:cargoNome(a)}</span>`;
function delegadosResumo(t){
  const cls=t.origens||[t.nome];
  const parte=(a,cargo)=>a?`${cargo==='D'?ic('crown',14)+' ':''}<span class="mut">${cargoNome(a)}:</span> <b>${esc(a.nome)}</b>`:`<span class="mut">${cargo==='D'?ic('crown',14)+' Delegado(a)':'Subdelegado(a)'} por definir</span>`;
  return cls.map(c=>{const L=t.alunos.filter(x=>(x.origem||t.nome)===c);
    return `${t.origens?'<span class="tag">'+esc(c)+'</span> ':''}${parte(L.find(x=>x.cargo==='D'),'D')} <span style="color:var(--line)">·</span> ${parte(L.find(x=>x.cargo==='SD'),'SD')}`}).join('<span style="margin:0 12px;color:var(--line)">|</span>');
}

/* =====================================================================
   CRITÉRIOS (domínios, ponderações, menções, regra)
   ===================================================================== */
function vCriterios(){
  const t=T();const ws=t.dominios.reduce((s,d)=>s+(+d.peso||0),0);const disc=minhasDisc();
  $('#view').innerHTML=`
  <div class="card ed"><h2>Turma</h2>
    <div style="margin-bottom:10px"><label>Oferta formativa</label>${segOferta('cr-of',ofertaDe(t))}</div>
    <div class="g2"><div><label>Turma</label><input data-t="nome" value="${esc(t.nome)}"></div>
    <div><label>Ano de escolaridade</label><select data-t="anoEsc">${Object.entries(ANOS_ESC).map(([c,l])=>`<optgroup label="${CICLOS[c]}">${l.map(x=>`<option ${x===t.anoEsc?'selected':''}>${x}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <div><label>Disciplina</label><select data-t="disciplina">${[...new Set([t.disciplina,...disc])].map(d=>`<option ${d===t.disciplina?'selected':''}>${esc(d)}</option>`).join('')}</select></div></div>
    <p class="hint">Escala: ${isSec(t)?'0 a 20 valores (Ensino Secundário)':'percentagem e níveis 1 a 5 (Ensino Básico)'} — definida pelo ano de escolaridade.</p></div>
  <div class="card ed"><div class="row"><h2 style="margin:0">Domínios e ponderações</h2><span class="sp1"></span><label style="margin:0">Aplicar modelo</label>
    <select id="tpl" style="width:auto;max-width:280px"><option value="">—</option>${(m=>m?`<option value="${m.id}">Sugerido: ${esc(m.nome)}</option>`:'')(modeloPara(t.disciplina,ofertaDe(t)==='profij'?'profij':t.ciclo,ofertaDe(t)))}<optgroup label="Todos os modelos">${modelosTodos().map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</optgroup></select><button class="btn sm" data-dt2go="modelos" title="Gerir modelos">${ic('gear',14)}</button></div>
    <table class="lst" style="margin-top:8px"><thead><tr><th style="width:190px">Abreviatura</th><th>Designação</th><th style="width:130px">Ponderação %</th><th style="width:60px"></th></tr></thead><tbody>
    ${t.dominios.map((d,k)=>`<tr data-k="${k}"><td><div class="domab"><span class="domic" style="--dc:${domCor(t,d)}">${icDom(d,18)}</span><input type="color" class="domcor" data-dcor="${k}" value="${corHex(domCor(t,d))}" title="Cor do critério" aria-label="Cor de ${esc(d.nome)}"><input data-d="ab" value="${esc(d.ab)}"></div></td><td><input data-d="nome" value="${esc(d.nome)}"></td><td><input data-d="peso" value="${esc(d.peso)}" inputmode="decimal"></td><td class="act"><button class="btn sm dng" data-dd="${k}">×</button></td></tr>`).join('')}
    </tbody><tfoot><tr><td></td><td style="text-align:right"><b>Total</b></td><td><b class="${ws===100?'':'neg'}">${ws}%</b>${ws!==100?` <button class="btn sm" id="cr-norm">Corrigir para 100%</button>`:''}</td><td></td></tr></tfoot></table>
    <div class="row" style="margin-top:10px;flex-wrap:wrap;gap:8px"><button class="btn sm" id="d-add">${ic('plus',14)} Domínio</button><button class="btn sm" id="cr-exp">${ic('download',14)} Exportar Critérios</button><button class="btn sm" id="cr-imp">${ic('upload',14)} Importar Critérios (do departamento)…</button><span class="sp1"></span>${S.anos.flatMap(a=>a.turmas).filter(x=>x!==t&&x.disciplina===t.disciplina).length?'<button class="btn" id="d-copy">Copiar critérios de outra turma…</button>':''}</div></div>
  <div class="card ed"><h2>Classificação final por ${perW().toLowerCase()}</h2>
    ${periodos().slice(1).map(p=>`<div class="g2"><div><label>${perNome(p)}</label><select data-rg="${p}"><option value="media" ${t.regra[p]!=='periodo'?'selected':''}>Média dos ${perW().toLowerCase()}s 1.º a ${p}.º (por domínio)</option><option value="periodo" ${t.regra[p]==='periodo'?'selected':''}>Apenas o ${p}.º ${perW().toLowerCase()} (100%)</option></select></div></div>`).join('')}</div>
  <div class="card ed"><h2>Menções qualitativas</h2>
    <table class="lst"><thead><tr><th>Menção</th><th style="width:200px">Até (% inclusive)</th></tr></thead><tbody>
    ${t.mencoes.map((m,k)=>`<tr data-k="${k}"><td><input data-m="nome" value="${esc(m.nome)}"></td><td><input data-m="max" value="${esc(m.max)}" inputmode="decimal"></td></tr>`).join('')}</tbody></table></div>`;
  bindSegOferta('cr-of',v=>{t.oferta=v;save();go('criterios')});
  const crn=$('#cr-norm');if(crn)crn.onclick=()=>{normalizarPesos(t);go('criterios')};$('#cr-exp').onclick=()=>exportarCriterios(t);$('#cr-imp').onclick=()=>importarCriterios(t);
  $$('[data-t]').forEach(el=>el.addEventListener('change',()=>{t[el.dataset.t]=el.value;if(el.dataset.t==='anoEsc')t.ciclo=cicloDoAno(el.value);save();go('criterios')}));
  $('#tpl').onchange=e=>{if(!e.target.value)return;aplicarModeloTurma(t,e.target.value);vCriterios()};$$('[data-dt2go]').forEach(b=>b.onclick=()=>{UI.defTab=b.dataset.dt2go;go('definicoes')});
  $$('[data-d]').forEach(el=>el.addEventListener('change',()=>{const d=t.dominios[+el.closest('tr').dataset.k];const f=el.dataset.d;d[f]=f==='peso'?(num(el.value)||0):el.value;save();vCriterios()}));
  $$('[data-dd]').forEach(b=>b.onclick=()=>{const d=t.dominios[+b.dataset.dd];if(t.instrumentos.some(i=>i.itens.some(x=>x.dom===d.id))&&!confirm('Há itens neste domínio. Remover mesmo assim?'))return;t.dominios.splice(+b.dataset.dd,1);save();vCriterios()});
  $('#d-add').onclick=()=>{t.dominios.push({id:uid(),ab:'D'+(t.dominios.length+1),nome:'Novo domínio',peso:0});save();vCriterios()};
  const dc=$('#d-copy');if(dc)dc.onclick=()=>{const L=S.anos.flatMap(a=>a.turmas.map(x=>({a,x}))).filter(o=>o.x!==t&&o.x.disciplina===t.disciplina);
    openDrawer('Copiar critérios',L.map((o,k)=>`<button class="btn" style="display:block;margin:0 0 8px;width:100%;text-align:left" data-cp="${k}">${esc(o.x.nome)} · ${esc(o.a.nome)} — ${o.x.dominios.map(d=>esc(d.ab)+' '+d.peso+'%').join(', ')}</button>`).join(''));
    $$('[data-cp]').forEach(b=>b.onclick=()=>{const s=L[+b.dataset.cp].x;t.dominios=JSON.parse(JSON.stringify(s.dominios));t.mencoes=JSON.parse(JSON.stringify(s.mencoes));t.regra={...s.regra};save();closeDrawer();vCriterios();toast('Critérios copiados')})};
  $$('[data-rg]').forEach(el=>el.onchange=()=>{t.regra[el.dataset.rg]=el.value;save()});
  $$('[data-m]').forEach(el=>el.addEventListener('change',()=>{const m=t.mencoes[+el.closest('tr').dataset.k];const f=el.dataset.m;m[f]=f==='max'?(num(el.value)||0):el.value;save()}));
}

