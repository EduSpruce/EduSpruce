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

