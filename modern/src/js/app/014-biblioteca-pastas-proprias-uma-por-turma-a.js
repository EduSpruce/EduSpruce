/* ---------- Biblioteca: pastas (próprias + uma por turma, automáticas) ---------- */
const recPastasM=()=>S.cfg.recPastas=S.cfg.recPastas||[];
const pastaTurma=t=>'Turmas/'+t.nome+(t.disciplina?' · '+t.disciplina:'');
function pastasAuto(){const a=A();return a?a.turmas.filter(t=>escolaDe(t)===EC()).map(t=>({id:pastaTurma(t),nome:t.nome,sub:t.disciplina,t})):[]}
function barraPastas(R){const f=UI.recF=UI.recF||{};const cur=f.pasta||'';const n=id=>R.filter(r=>id==='__sem'?!r.pasta:r.pasta===id||(r.pasta||'').startsWith(id+'/')).length;
  const chip=(id,nome,icn,sub)=>`<button type="button" class="recpf ${cur===id?'on':''}" data-rpf="${esc(id)}" aria-pressed="${cur===id}">${ic(icn,15)}<span class="recpn">${esc(nome)}${sub?`<small>${esc(sub)}</small>`:''}</span><span class="recpc">${id===''?R.length:n(id)}</span></button>`;
  return `<div class="card recpastas"><div class="row" style="gap:8px;margin-bottom:8px"><h2 style="margin:0;font-size:15px">${ic('folder',16)} Pastas</h2><span class="sp1"></span><button type="button" class="btn sm" id="rp-nova">${ic('plus',13)} Nova Pasta</button>${cur&&recPastasM().includes(cur)?`<button type="button" class="btn sm" id="rp-ren">${ic('pencil',13)} Mudar o Nome</button><button type="button" class="btn sm dng" id="rp-del">${ic('trash',13)} Apagar Pasta</button>`:''}</div>
    <div class="recpl" role="group" aria-label="Pastas">${chip('','Todos os Recursos','folder')}${chip('__sem','Sem Pasta','file')}${recPastasM().map(p=>chip(p,p,'folder')).join('')}</div>
    ${pastasAuto().length?`<div class="recpg">Turmas <span class="mut">· criadas automaticamente</span></div><div class="recpl" role="group" aria-label="Pastas das turmas">${pastasAuto().map(p=>chip(p.id,p.nome,'school',p.sub)).join('')}</div>`:''}
    <p class="hint" style="margin:8px 0 0">Arraste um recurso para uma pasta (ou use o botão ${ic('folder',12)} do recurso). Os ficheiros carregados com uma pasta aberta ficam nessa pasta.</p></div>`}
function moverRecursoDlg(id){const r=recursos().find(x=>x.id===id);if(!r)return;const ops=[['','Sem pasta'],...recPastasM().map(p=>[p,p]),...pastasAuto().map(p=>[p.id,'Turma '+p.nome+(p.sub?' · '+p.sub:'')])];
  openDrawer('Mover para Pasta',`<div class="ed"><p class="hint" style="margin-top:0"><b>${esc(r.titulo)}</b></p><div class="recmv" role="radiogroup" aria-label="Pasta">${ops.map(([v,l])=>`<button type="button" role="radio" aria-checked="${(r.pasta||'')===v}" class="btn ${(r.pasta||'')===v?'pri':''}" data-rmv="${esc(v)}">${ic(v.startsWith('Turmas/')?'school':'folder',15)} ${esc(l)}</button>`).join('')}</div></div>`);
  $$('[data-rmv]').forEach(b=>b.onclick=()=>{r.pasta=b.dataset.rmv;r.atual=Date.now();save();closeDrawer();toast('Movido para '+(r.pasta?r.pasta.replace(/^Turmas\//,'turma '):'sem pasta'),'ok');vRecursos()})}
{const _vr=vRecursos;vRecursos=function(){const R=recursos();const f=UI.recF=UI.recF||{};
  if(UI._recAntes){const cur=f.pasta&&f.pasta!=='__sem'?f.pasta:'';if(cur)R.forEach(r=>{if(!UI._recAntes.has(r.id)&&!r.pasta)r.pasta=cur});UI._recAntes=null;save()}
  /* filtro por pasta: esconde temporariamente os recursos de outras pastas */
  const cur=f.pasta||'';let ret;if(cur){const keep=R.slice();const L=R.filter(r=>cur==='__sem'?!r.pasta:r.pasta===cur||(r.pasta||'').startsWith(cur+'/'));R.length=0;R.push(...L);try{ret=_vr.apply(this,arguments)}finally{R.length=0;R.push(...keep)}}else ret=_vr.apply(this,arguments);
  try{const dz=$('#rec-drop');if(dz){dz.insertAdjacentHTML('beforebegin',barraPastas(R));}
    $$('.recc[data-rec]').forEach(c=>{const r=R.find(x=>x.id===c.dataset.rec);c.draggable=true;c.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/x-rec',c.dataset.rec);e.dataTransfer.effectAllowed='move'});
      const ac=c.querySelector('.reca');if(ac&&!ac.querySelector('[data-rmov]'))ac.insertAdjacentHTML('beforeend',`<button class="btn sm ico" data-rmov="${c.dataset.rec}" aria-label="Mover para pasta" title="Mover para pasta">${ic('folder',13)}</button>`);
      if(r&&r.pasta&&!cur){const b=c.querySelector('.recm');if(b)b.insertAdjacentHTML('afterbegin',`<span class="tag">${ic('folder',11)} ${esc(r.pasta.replace(/^Turmas\//,''))}</span>`)}});
    $$('[data-rmov]').forEach(b=>b.onclick=e=>{e.stopPropagation();moverRecursoDlg(b.dataset.rmov)});
    $$('[data-rpf]').forEach(b=>{b.onclick=()=>{f.pasta=b.dataset.rpf;manterPosicao(vRecursos)};
      b.ondragover=e=>{if([...e.dataTransfer.types].includes('text/x-rec')){e.preventDefault();b.classList.add('over')}};b.ondragleave=()=>b.classList.remove('over');
      b.ondrop=e=>{e.preventDefault();b.classList.remove('over');const id=e.dataTransfer.getData('text/x-rec');const r=R.find(x=>x.id===id);if(!r)return;const v=b.dataset.rpf;r.pasta=v==='__sem'?'':v;r.atual=Date.now();save();toast('Movido para '+(r.pasta?r.pasta.replace(/^Turmas\//,'turma '):'sem pasta'),'ok');manterPosicao(vRecursos)}});
    const nv=$('#rp-nova');if(nv)nv.onclick=()=>{const n=(prompt('Nome da nova pasta:')||'').trim().replace(/\//g,'-');if(!n)return;if(recPastasM().includes(n))return toast('Já existe uma pasta com esse nome');recPastasM().push(n);recPastasM().sort((x,y)=>x.localeCompare(y,'pt'));f.pasta=n;save();vRecursos()};
    const rn=$('#rp-ren');if(rn)rn.onclick=()=>{const n=(prompt('Novo nome da pasta:',cur)||'').trim().replace(/\//g,'-');if(!n||n===cur)return;const P=recPastasM();P[P.indexOf(cur)]=n;R.forEach(r=>{if(r.pasta===cur)r.pasta=n});f.pasta=n;save();vRecursos()};
    const dl=$('#rp-del');if(dl)dl.onclick=()=>{const k=R.filter(r=>r.pasta===cur).length;if(!confirm(`Apagar a pasta “${cur}”?${k?' Os '+k+' recursos ficam sem pasta (não são apagados).':''}`))return;const P=recPastasM();P.splice(P.indexOf(cur),1);R.forEach(r=>{if(r.pasta===cur)r.pasta=''});f.pasta='';save();vRecursos()};
    const inp=$('#rec-in');if(inp)inp.addEventListener('change',()=>{UI._recAntes=new Set(R.map(r=>r.id))},true);if(dz)dz.addEventListener('drop',()=>{UI._recAntes=new Set(R.map(r=>r.id))},true);
  }catch(e){console.warn(e)}return ret}}

/* ---------- Aulas e Sumários: janela da aula (sumário + presenças + ocorrências) ---------- */
const PRES=[{k:'P',n:'Presente',ic:'check',c:'#16a34a'},{k:'F',n:'Falta de presença',ic:'x',c:'#dc2626'},{k:'FD',n:'Falta disciplinar',ic:'shield',c:'#9a3412'}];
const PRES_X=[{k:'fm',n:'Falta de material',ic:'book',c:'#b45309',tipo:'material'},{k:'at',n:'Atraso',ic:'clock',c:'#2563eb',tipo:'atraso'}];
const OCOR=[['','Sem ocorrências'],['grave','Grave'],['media','Média'],['leve','Leve'],['positiva','Positiva']];
function sincFaltasAula(t,x,aid,p){const al=t.alunos.find(z=>z.id===aid);if(!al)return;al.faltasAl=al.faltasAl||[];const base='s:'+x.k+':';
  al.faltasAl=al.faltasAl.filter(f=>!String(f.id).startsWith(base));const obs='Aula de '+t.disciplina+' · '+fmtHM(x.ini)+'–'+fmtHM(x.fim);
  if(p.f==='F')al.faltasAl.push({id:base+'F',data:x.data,tempos:1,tipo:'injust',obs});if(p.f==='FD')al.faltasAl.push({id:base+'FD',data:x.data,tempos:1,tipo:'disc',obs});
  if(p.fm)al.faltasAl.push({id:base+'FM',data:x.data,tempos:1,tipo:'material',obs});if(p.at)al.faltasAl.push({id:base+'AT',data:x.data,tempos:1,tipo:'atraso',obs})}
function resumoPres(s){const P=Object.values(s.pres||{});const c=k=>P.filter(p=>p.f===k).length;const fm=P.filter(p=>p.fm).length,at=P.filter(p=>p.at).length,oc=P.filter(p=>p.oc&&p.oc.n).length;
  return [c('F')?c('F')+' F':'',c('FD')?c('FD')+' FD':'',fm?fm+' FM':'',at?at+' At':'',oc?oc+' ocorr.':''].filter(Boolean).join(' · ')}
function aulaDlg(t,k,tabIni){const a=A();const L=listaAulas(t,a);const x=L.find(z=>z.k===k);if(!x)return;const SM=sumariosT(a,t);const s=JSON.parse(JSON.stringify(SM[k]||{}));s.pres=s.pres||{};
  const al=alunosAval(t);let tab=tabIni||'sum';let viuP=tab==='pres';const aberto=new Set();
  const d=document.createElement('dialog');d.className='auladlg';d.setAttribute('aria-labelledby','au-t');document.body.appendChild(d);
  const dataL=x.data.split('-').reverse().join('-');
  const linha=a2=>{const p=s.pres[a2.id]||{};const f=p.f||'P';const ab=aberto.has(a2.id);return `<li class="aupr ${f!=='P'?'aus':''}"><div class="auprh">
      <button type="button" class="btn sm ico auexp" data-auexp="${a2.id}" aria-expanded="${ab}" aria-label="Ocorrências de ${esc(a2.nome)}">${ic('chev',14)}</button>${avatar(a2,34)}<b class="aun">${esc(numAl(a2))}</b><span class="aunm">${esc(a2.nome)}${p.oc&&p.oc.n?` <span class="tag ${p.oc.n==='positiva'?'ok':'bad'}">${esc((OCOR.find(o=>o[0]===p.oc.n)||[])[1]||'')}</span>`:''}</span>
      <span class="aubt" role="radiogroup" aria-label="Presença de ${esc(a2.nome)}">${PRES.map(o=>`<button type="button" role="radio" aria-checked="${f===o.k}" class="aui ${f===o.k?'on':''}" style="--c:${o.c}" data-aup="${a2.id}|${o.k}" title="${o.n}" aria-label="${o.n}">${ic(o.ic,16)}</button>`).join('')}</span>
      <span class="aubt">${PRES_X.map(o=>`<button type="button" aria-pressed="${!!p[o.k]}" class="aui ${p[o.k]?'on':''}" style="--c:${o.c}" data-aux="${a2.id}|${o.k}" title="${o.n}" aria-label="${o.n}">${ic(o.ic,16)}</button>`).join('')}</span></div>
      ${ab?`<div class="auoc"><label for="au-on-${a2.id}">Ocorrências</label><select id="au-on-${a2.id}" data-auon="${a2.id}">${OCOR.map(([v,l])=>`<option value="${v}" ${(p.oc&&p.oc.n||'')===v?'selected':''}>${l}</option>`).join('')}</select><textarea data-auot="${a2.id}" rows="3" aria-label="Descrição da ocorrência de ${esc(a2.nome)}" placeholder="Descreva a ocorrência…">${esc(p.oc&&p.oc.t||'')}</textarea></div>`:''}</li>`};
  const desenha=()=>{const nF=Object.values(s.pres).filter(p=>p.f&&p.f!=='P').length;
    d.innerHTML=`<form method="dialog" class="auf"><header class="auh"><div><h2 id="au-t">${x.licao?'Lição '+x.licao:'Aula'} · ${esc(t.nome)} · ${esc(t.disciplina)}</h2><p class="mut" style="margin:2px 0 0"><b>Dia</b> ${dataL} <b>das</b> ${fmtHM(x.ini)} <b>às</b> ${fmtHM(x.fim)} · <b>Docente</b> ${esc(profNome(S.cfg.professor)||'')}</p></div><button type="button" class="btn ico" data-aux0 aria-label="Fechar">${ic('x',16)}</button></header>
      <div class="tabs" role="tablist" style="margin:12px 0 0"><button type="button" role="tab" aria-selected="${tab==='sum'}" class="${tab==='sum'?'on':''}" data-aut="sum">${ic('pen',14)} Sumário${x.licao?' (n.º '+x.licao+')':''}</button><button type="button" role="tab" aria-selected="${tab==='pres'}" class="${tab==='pres'?'on':''}" data-aut="pres">${ic('users',14)} Presenças${nF?` <span class="tag bad">${nF}</span>`:''}${!s.cham&&!viuP?' <span class="tag w" title="Chamada por confirmar: abra as presenças e guarde">por confirmar</span>':''}</button></div>
      <div class="aub">${tab==='sum'?`<div class="ausum"><div><label for="au-txt">Sumário${x.licao?' n.º '+x.licao:''} <span class="mut">(turma ${esc(t.nome)})</span></label><textarea id="au-txt" rows="10" placeholder="Escreva o sumário da aula…">${esc(s.texto||'')}</textarea></div>
          <div class="ausd"><div><label for="au-obs">Observações <span class="mut">(sala de aula)</span></label><textarea id="au-obs" rows="5">${esc(s.obs||'')}</textarea></div><div><label for="au-oco">Ocorrências <span class="mut">(sala de aula)</span></label><textarea id="au-oco" rows="5">${esc(s.ocor||'')}</textarea></div></div></div>`
        :`<div class="auleg" aria-hidden="true"><span></span>${PRES.map(o=>`<span style="--c:${o.c}">${o.k}</span>`).join('')}<span class="sep"></span>${PRES_X.map(o=>`<span style="--c:${o.c}">${o.k==='fm'?'FM':'At'}</span>`).join('')}</div>
          <div class="row" style="gap:6px;margin:0 0 8px;flex-wrap:wrap"><button type="button" class="btn sm" data-auall>${ic('check',13)} Todos Presentes</button><span class="hint" style="margin:0">P · F · FD = presença, falta, falta disciplinar · FM = falta de material · At = atraso. As faltas passam para a ficha de cada aluno.</span></div>
          <ul class="auprl">${al.map(linha).join('')||'<li class="mut">Sem alunos.</li>'}</ul>`}</div>
      <footer class="auft"><span class="mut" id="au-res">${esc(resumoPres(s))}</span><span class="sp1"></span><button type="button" class="btn" data-aux0>Cancelar</button><button type="button" class="btn pri" data-auok>${ic('check',15)} Submeter</button></footer></form>`;
    const lerTxt=()=>{const tx=d.querySelector('#au-txt');if(tx){s.texto=tx.value;s.obs=d.querySelector('#au-obs').value;s.ocor=d.querySelector('#au-oco').value}d.querySelectorAll('[data-auot]').forEach(ta=>{const p=s.pres[ta.dataset.auot]=s.pres[ta.dataset.auot]||{};p.oc=p.oc||{};p.oc.t=ta.value})};
    d.querySelectorAll('[data-aut]').forEach(b=>b.onclick=()=>{lerTxt();tab=b.dataset.aut;if(tab==='pres')viuP=true;desenha();const f=d.querySelector(`[data-aut="${tab}"]`);if(f)f.focus()});
    d.querySelectorAll('[data-aux0]').forEach(b=>b.onclick=()=>fecha(false));d.querySelector('[data-auok]').onclick=()=>{lerTxt();fecha(true)};
    const foca=sel=>{const n=d.querySelector(sel);if(n)n.focus({preventScroll:true})};
    d.querySelectorAll('[data-aup]').forEach(b=>b.onclick=()=>{lerTxt();const [id,k2]=b.dataset.aup.split('|');const p=s.pres[id]=s.pres[id]||{};p.f=k2==='P'?'':k2;const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(`[data-aup="${b.dataset.aup}"]`)});
    d.querySelectorAll('[data-aux]').forEach(b=>b.onclick=()=>{lerTxt();const [id,k2]=b.dataset.aux.split('|');const p=s.pres[id]=s.pres[id]||{};p[k2]=!p[k2];const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(`[data-aux="${b.dataset.aux}"]`)});
    d.querySelectorAll('[data-auexp]').forEach(b=>b.onclick=()=>{lerTxt();const id=b.dataset.auexp;aberto.has(id)?aberto.delete(id):aberto.add(id);const sc=d.querySelector('.aub').scrollTop;desenha();d.querySelector('.aub').scrollTop=sc;foca(aberto.has(id)?`[data-auon="${id}"]`:`[data-auexp="${id}"]`)});
    d.querySelectorAll('[data-auon]').forEach(sl=>sl.onchange=()=>{lerTxt();const p=s.pres[sl.dataset.auon]=s.pres[sl.dataset.auon]||{};p.oc=p.oc||{};p.oc.n=sl.value;const r=d.querySelector('#au-res');if(r)r.textContent=resumoPres(s)});
    const all=d.querySelector('[data-auall]');if(all)all.onclick=()=>{lerTxt();al.forEach(a2=>{const p=s.pres[a2.id]=s.pres[a2.id]||{};p.f=''});desenha()}};
  const fecha=ok=>{if(ok){const prev=SM[k]||{};SM[k]={...prev,...s};if(viuP||Object.values(s.pres||{}).some(p=>p&&p.f))SM[k].cham=SM[k].cham||Date.now();al.forEach(a2=>sincFaltasAula(t,x,a2.id,s.pres[a2.id]||{}));saveNow();audit('Sumários','Aula registada',t.nome+' · '+x.data+' · '+fmtHM(x.ini));toast('Aula registada'+(resumoPres(s)?' · '+resumoPres(s):''),'ok')}
    try{d.close()}catch(_){}d.remove();if(ok&&VIEW==='sumarios')manterPosicao(vSumarios)};
  d.addEventListener('cancel',e=>{e.preventDefault();fecha(false)});desenha();try{d.showModal()}catch(_){d.setAttribute('open','')}
  setTimeout(()=>{const f=d.querySelector(tab==='sum'?'#au-txt':'[data-aup]');if(f)f.focus()},50)}
{const _vs=vSumarios;vSumarios=function(){const r=_vs.apply(this,arguments);try{const t=T(),a=A();if(!t||!a)return r;const SM=sumariosT(a,t);
  $$('.sumi').forEach(el=>{const ta=el.querySelector('[data-sum]');if(!ta)return;const k=ta.dataset.sum;const h=el.querySelector('.sumh');if(!h||h.querySelector('[data-aula-ab]'))return;const s=SM[k]||{};const res=resumoPres(s);
    const sp=h.querySelector('.sp1');const html=`${res?`<span class="tag ${/F|ocorr/.test(res)?'bad':''}" title="Presenças">${esc(res)}</span>`:''}`;if(sp)sp.insertAdjacentHTML('beforebegin',html);
    h.insertAdjacentHTML('beforeend',`<button class="btn sm" data-aula-ab="${esc(k)}|pres" aria-label="Presenças desta aula">${ic('users',13)} Presenças</button><button class="btn sm pri" data-aula-ab="${esc(k)}|sum">${ic('pen',13)} ${s.texto?'Abrir Aula':'Escrever Sumário'}</button>`)});
  $$('[data-aula-ab]').forEach(b=>b.onclick=()=>{const i=b.dataset.aulaAb.lastIndexOf('|');aulaDlg(t,b.dataset.aulaAb.slice(0,i),b.dataset.aulaAb.slice(i+1))});
  $$('.sumn').forEach(n=>{const el=n.closest('.sumi');const ta=el&&el.querySelector('[data-sum]');if(!ta)return;n.setAttribute('role','button');n.tabIndex=0;n.style.cursor='pointer';n.title='Abrir a aula';n.onclick=()=>aulaDlg(t,ta.dataset.sum,'sum')});
  }catch(e){console.warn(e)}return r}}
if(!ICONS.clock)ICONS.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';

/* ================= v0.36 (B) ================= */
const isoHoje=()=>isoData(new Date());
/* ---- dias nacionais e internacionais ---- */
const DIAS_COMEM={'01-01':['Dia Mundial da Paz','Ano Novo'],'01-06':['Dia de Reis'],'01-24':['Dia Internacional da Educação'],'01-27':['Dia Internacional em Memória das Vítimas do Holocausto'],'01-30':['Dia Escolar da Não-Violência e da Paz'],
'02-04':['Dia Mundial contra o Cancro'],'02-11':['Dia Internacional das Mulheres e Raparigas na Ciência'],'02-14':['Dia de São Valentim'],'02-20':['Dia Mundial da Justiça Social'],'02-21':['Dia Internacional da Língua Materna'],
'03-08':['Dia Internacional da Mulher'],'03-14':['Dia do Pi (π)'],'03-15':['Dia Mundial dos Direitos do Consumidor'],'03-20':['Dia Internacional da Felicidade'],'03-21':['Dia Mundial da Poesia','Dia Internacional das Florestas','Dia da Árvore','Dia Mundial da Síndrome de Down'],'03-22':['Dia Mundial da Água'],'03-27':['Dia Mundial do Teatro'],
'04-02':['Dia Internacional do Livro Infantil','Dia Mundial da Consciencialização do Autismo'],'04-07':['Dia Mundial da Saúde'],'04-22':['Dia da Terra'],'04-23':['Dia Mundial do Livro e dos Direitos de Autor'],'04-25':['Dia da Liberdade'],'04-29':['Dia Internacional da Dança'],
'05-01':['Dia do Trabalhador'],'05-03':['Dia Mundial da Liberdade de Imprensa'],'05-05':['Dia Mundial da Língua Portuguesa'],'05-09':['Dia da Europa'],'05-15':['Dia Internacional da Família'],'05-18':['Dia Internacional dos Museus'],'05-22':['Dia Internacional da Biodiversidade'],'05-31':['Dia Mundial sem Tabaco'],
'06-01':['Dia Mundial da Criança'],'06-05':['Dia Mundial do Ambiente'],'06-08':['Dia Mundial dos Oceanos'],'06-10':['Dia de Portugal, de Camões e das Comunidades Portuguesas'],'06-20':['Dia Mundial do Refugiado'],'06-21':['Dia Europeu da Música'],
'07-11':['Dia Mundial da População'],'07-18':['Dia Internacional de Nelson Mandela'],'07-30':['Dia Internacional da Amizade'],'08-12':['Dia Internacional da Juventude'],'08-19':['Dia Mundial da Fotografia'],
'09-08':['Dia Internacional da Literacia'],'09-21':['Dia Internacional da Paz'],'09-26':['Dia Europeu das Línguas'],'09-27':['Dia Mundial do Turismo'],
'10-01':['Dia Mundial da Música','Dia Internacional do Idoso'],'10-04':['Dia Mundial do Animal'],'10-05':['Dia Mundial do Professor','Implantação da República'],'10-10':['Dia Mundial da Saúde Mental'],'10-16':['Dia Mundial da Alimentação'],'10-24':['Dia das Nações Unidas'],'10-31':['Dia Mundial da Poupança','Halloween'],
'11-01':['Dia de Todos os Santos'],'11-11':['Dia de São Martinho'],'11-16':['Dia Internacional da Tolerância'],'11-20':['Dia Internacional dos Direitos da Criança'],'11-24':['Dia Nacional da Cultura Científica'],'11-25':['Dia Internacional para a Eliminação da Violência contra as Mulheres'],
'12-01':['Restauração da Independência','Dia Mundial de Luta contra a SIDA'],'12-03':['Dia Internacional das Pessoas com Deficiência'],'12-05':['Dia Internacional do Voluntariado'],'12-08':['Imaculada Conceição'],'12-10':['Dia dos Direitos Humanos'],'12-24':['Véspera de Natal'],'12-25':['Natal'],'12-31':['Véspera de Ano Novo']};
/* ---- épocas (temas sazonais) ---- */
const SAZ={natal:{n:'Natal',e:'🎄',ac:['#b91c1c','#f87171'],g:['#c0262d','#14532d']},halloween:{n:'Halloween',e:'🎃',ac:['#c2410c','#fb923c'],g:['#c2410c','#3b0764']},professor:{n:'Dia do Professor',e:'🍎',ac:['#a16207','#facc15'],g:['#b7791f','#1e3a8a']},
  inverno:{n:'Inverno',e:'❄️',ac:['#0369a1','#7dd3fc'],g:['#0284c7','#1e3a8a']},primavera:{n:'Primavera',e:'🌸',ac:['#15803d','#86efac'],g:['#16a34a','#9d174d']},verao:{n:'Verão',e:'☀️',ac:['#0e7490','#67e8f9'],g:['#d97706','#0e7490']},outono:{n:'Outono',e:'🍂',ac:['#b45309','#fbbf24'],g:['#b45309','#7c2d12']}};
function epocaDe(d){d=d||new Date();const m=d.getMonth()+1,dd=d.getDate(),md=m*100+dd;
  if(md===1005)return 'professor';if(md>=1201||md<=106)return 'natal';if(md===1030||md===1031||md===1101)return 'halloween';
  if(md>=1221||md<=319)return 'inverno';if(md<=620)return 'primavera';if(md<=922)return 'verao';return 'outono'}
const epocaAtiva=()=>{const c=S.cfg;if(c.sazonal===false)return null;return c.sazForcar||epocaDe()};
function aplicarEpoca(){const r=document.documentElement;Object.keys(SAZ).forEach(k=>r.classList.remove('saz-'+k));const e=epocaAtiva();
  if(e&&SAZ[e]){r.classList.add('saz-'+e);r.style.setProperty('--accL',SAZ[e].ac[0]);r.style.setProperty('--accD',SAZ[e].ac[1]);r.style.setProperty('--sazA',SAZ[e].g[0]);r.style.setProperty('--sazB',SAZ[e].g[1])}
  const b=$('#brandEsc');const bd=$('.brand .bnm');if(bd){let s=bd.querySelector('.sazb');if(e&&SAZ[e]){if(!s){s=document.createElement('span');s.className='sazb';s.setAttribute('aria-hidden','true');bd.appendChild(s)}s.textContent=SAZ[e].e;bd.title=SAZ[e].n}else if(s)s.remove()}
  neve(e==='natal'&&S.cfg.neve!==false)}
{const _ap=aplicarPrefs;aplicarPrefs=function(){const r=_ap.apply(this,arguments);try{aplicarEpoca()}catch(_){}return r}}
/* neve (só no Natal; desliga com Reduzir Movimento) */
function neve(on){let cv=$('#neve');const rm=document.documentElement.classList.contains('a11y-rm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!on||rm){if(cv){cancelAnimationFrame(neve._r);cv.remove()}return}if(cv)return;cv=document.createElement('canvas');cv.id='neve';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);const ctx=cv.getContext('2d');let W,H,F=[];
  const tam=()=>{const dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.round(Math.min(110,W*H/16000));F=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.6,v:.35+Math.random()*.9,o:Math.random()*6.28,a:.45+Math.random()*.5}))};tam();addEventListener('resize',tam);
  const passo=()=>{if(!document.hidden){ctx.clearRect(0,0,W,H);for(const f of F){f.y+=f.v;f.o+=.012;f.x+=Math.sin(f.o)*.45;if(f.y>H+5){f.y=-5;f.x=Math.random()*W}ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fillStyle=`rgba(255,255,255,${f.a})`;ctx.shadowColor='rgba(120,150,190,.6)';ctx.shadowBlur=2;ctx.fill()}}neve._r=requestAnimationFrame(passo)};passo()}
/* Definições › Aparência: temas sazonais */
{const _da=defAparencia;defAparencia=function(){let h=_da.apply(this,arguments);const c=S.cfg;const e=epocaDe();
  const bloco=`<div class="pref"><b>Temas sazonais</b><div style="display:grid;gap:6px"><label class="chk"><input type="checkbox" id="ap-saz" ${c.sazonal!==false?'checked':''}> Mudar as cores consoante a época (Natal, Halloween, Inverno, Primavera, Verão, Outono e Dia do Professor) — agora: <b>${SAZ[e].e} ${SAZ[e].n}</b></label>
    <label class="chk"><input type="checkbox" id="ap-neve" ${c.neve!==false?'checked':''} ${c.sazonal===false?'disabled':''}> Efeito de neve no Natal</label>
    <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><label for="ap-sazf" class="mut" style="margin:0">Experimentar</label><select id="ap-sazf" style="width:auto" ${c.sazonal===false?'disabled':''}><option value="">Automático (pela data)</option>${Object.entries(SAZ).map(([k,v])=>`<option value="${k}" ${c.sazForcar===k?'selected':''}>${v.e} ${v.n}</option>`).join('')}</select></div></div></div>`;
  return h.replace(/(<div class="pref"><b>Estilo da interface<\/b>[\s\S]*?<\/div><\/div>)/,'$1'+bloco)}}
document.addEventListener('change',e=>{const id=e.target&&e.target.id;if(id==='ap-saz'){S.cfg.sazonal=e.target.checked;save();aplicarEpoca();go('definicoes')}else if(id==='ap-neve'){S.cfg.neve=e.target.checked;save();aplicarEpoca()}else if(id==='ap-sazf'){S.cfg.sazForcar=e.target.value;save();aplicarEpoca();toast(e.target.value?'A experimentar: '+SAZ[e.target.value].n:'Tema pela data','ok')}});
setTimeout(()=>{try{aplicarEpoca()}catch(_){}},0);setInterval(()=>{try{if(!S.cfg.sazForcar){const e=epocaAtiva();if(!document.documentElement.classList.contains('saz-'+e))aplicarEpoca()}}catch(_){}},60*60*1000);
/* ---- Início: widget “Hoje” ---- */
function widgetHojeInfo(){const d=new Date();const iso=isoHoje();const md=iso.slice(5);const a=A();const L=[];
  const cal=a&&a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const nota=cal&&cal.notas&&cal.notas[iso];
  if(tp&&tp!=='letivo'&&TIPOS_DIA[tp])L.push({ic:'flag',t:nomeTipo(tp)+(nota?' — '+nota:''),c:'esc'});else if(nota)L.push({ic:'flag',t:nota,c:'esc'});
  (DIAS_COMEM[md]||[]).forEach(n=>L.push({ic:/Professor/.test(n)?'grad':'sparkle',t:n,c:/Professor/.test(n)?'prof':''}));
  const p=perfil();if(p.nascimento&&p.nascimento.slice(5)===md)L.unshift({ic:'sparkle',t:'Hoje é o seu aniversário! Parabéns 🎂',c:'prof'});
  let an=0;if(a)a.turmas.forEach(t=>t.alunos.forEach(x=>{if(x.nasc&&x.nasc.slice(5)===md)an++}));if(an)L.push({ic:'users',t:an+' aniversário'+(an>1?'s':'')+' de alunos',c:''});
  const e=epocaDe(d);const wd=d.toLocaleDateString('pt-PT',{weekday:'long'});
  return `<div class="card whoje"><div class="whd"><span class="whn">${d.getDate()}</span><span class="whm"><b>${wd[0].toUpperCase()+wd.slice(1)}</b><span>${d.toLocaleDateString('pt-PT',{month:'long',year:'numeric'})}</span></span><span class="whe" title="${SAZ[e].n}" aria-label="Época: ${SAZ[e].n}">${SAZ[e].e}</span></div>
    ${L.length?`<ul class="whl">${L.map(x=>`<li class="${x.c}">${ic(x.ic,14)}<span>${esc(x.t)}</span></li>`).join('')}</ul>`:`<p class="mut" style="margin:6px 0 0;font-size:13px">Sem efemérides para hoje.</p>`}</div>`}
{const _pi=posInicio;posInicio=function(){const r=_pi.apply(this,arguments);try{const f=$('.in-fav');if(f&&!f.querySelector('.whoje'))f.insertAdjacentHTML('afterbegin',widgetHojeInfo());
  if(epocaDe()==='professor'&&S.cfg.sazonal!==false&&!$('.diaprof')){const h=$('.in-hero')||$('.inlay');if(h)h.insertAdjacentHTML('afterbegin',`<div class="card diaprof" role="status"><span class="dpi" aria-hidden="true">🍎</span><div><b>Feliz Dia Mundial do Professor, ${esc(profNome(S.cfg.professor)||'Professor(a)')}!</b><span>Obrigado por tudo o que faz pelos seus alunos — hoje a app veste-se a rigor por si.</span></div></div>`);confetes()}
  const vz=[...document.querySelectorAll('.inlay .empty')].find(e=>/Ainda sem turmas|Sem turmas de/.test(e.textContent));if(vz&&!vz.querySelector('[data-goview]'))vz.insertAdjacentHTML('beforeend',`<div class="row" style="justify-content:center;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn pri" data-nt-excel>${ic('upload',15)} Turma a partir do Excel</button><button class="btn" data-nt-vazia>${ic('plus',15)} Turma Vazia</button><button class="btn" data-goview="turmas">${ic('school',15)} Ano Letivo e Turmas</button></div>`)}catch(e){console.warn(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nt-vazia],[data-nt-excel]');if(!b)return;go('turmas');setTimeout(()=>{const x=$(b.hasAttribute('data-nt-vazia')?'#t-new':'#t-pdf');if(x)x.click()},120)});
function confetes(){if(document.documentElement.classList.contains('a11y-rm')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const w=document.createElement('div');w.className='confw';w.setAttribute('aria-hidden','true');const cs=['#facc15','#2563eb','#dc2626','#16a34a','#a855f7','#f97316'];
  for(let i=0;i<90;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;background:${cs[i%cs.length]};animation-delay:${Math.random()*1.2}s;animation-duration:${2.4+Math.random()*2}s;transform:rotate(${Math.random()*360}deg)`;w.appendChild(s)}document.body.appendChild(w);setTimeout(()=>w.remove(),5200)}
/* ---- aniversário do professor: parabéns em ecrã inteiro (fecha com 3 toques no ×) ---- */
function parabensProf(){const p=perfil();const iso=isoHoje();if(!p.nascimento||p.nascimento.slice(5)!==iso.slice(5)||S.cfg.parabensVisto===iso||document.body.classList.contains('login-on')||$('#parabens'))return;
  const anos=new Date().getFullYear()-(+p.nascimento.slice(0,4));let n=3;const nome=(S.cfg.professor||'').trim().split(/\s+/)[0]||'';
  const d=document.createElement('div');d.id='parabens';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','pb-t');
  d.innerHTML=`<div class="pbb"><div class="pbe" aria-hidden="true">🎂🎉🎈</div><h1 id="pb-t">Parabéns${nome?', '+esc(nome):''}!</h1>${anos>15&&anos<100?`<p class="pba">${anos} anos — e cada vez melhor.</p>`:''}<p class="pbq">Fazes anos hoje… achas mesmo que precisas de trabalhar? 😏</p><p class="pbs">Fecha a app, liga a quem gostas e vai comer bolo. Os sumários esperam por amanhã.</p>
    <button type="button" class="pbx" aria-label="Fechar (toque 3 vezes)">${ic('x',26)}</button><p class="pbc" aria-live="polite">Para fechar, toque 3 vezes no ×</p></div>`;
  document.body.appendChild(d);['#main','#side'].forEach(s=>{const e=$(s);if(e)e.inert=true});confetes();setTimeout(confetes,2500);
  const x=d.querySelector('.pbx');x.focus();x.onclick=()=>{n--;const c=d.querySelector('.pbc');if(n>0){c.textContent=n===2?'Tem a certeza? Mais 2 toques…':'Último aviso: hoje é dia de festa! Mais 1 toque…';x.classList.remove('abana');void x.offsetWidth;x.classList.add('abana');return}
    S.cfg.parabensVisto=iso;save();d.classList.add('sai');setTimeout(()=>{d.remove();const m=$('#main');if(m)m.inert=false;a11ySide()},350);toast('Bom trabalho… e bom aniversário! 🎂','ok')};
  d.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();x.focus()}})}
{const _g3=go;go=function(v){const r=_g3.apply(this,arguments);setTimeout(()=>{try{parabensProf()}catch(_){}},400);return r}}
/* ---- perfil: data de nascimento ---- */
{const _dp=defProf;defProf=function(){const h=_dp.apply(this,arguments);const p=perfil();return h.replace(/(<div><label>Género<\/label><select data-pf="genero"[\s\S]*?<\/select><\/div>)/,`$1<div><label>Data de nascimento 🎂</label><input data-pf="nascimento" type="date" value="${esc(p.nascimento||'')}" title="No dia de anos a app dá-lhe os parabéns" aria-describedby="pf-nasc-h"><small id="pf-nasc-h" class="mut" style="font-size:12px">No dia de anos a app dá-lhe os parabéns.</small></div>`)}}
/* ---- ficha do aluno: separador “Turma” ---- */
try{const T_=FICHA_TABS.find(x=>x[0]==='turma');if(T_)T_[2]='Turma'}catch(_){}
/* ---- Acessibilidade: sem opções repetidas (o tamanho do texto e o alto contraste estão em Aparência) ---- */
{const _ca=cartaoA11y;cartaoA11y=function(){return _ca.apply(this,arguments).replace(/<div><label>Tamanho do Texto<\/label>[\s\S]*?<\/div><\/div>\s*<div><label>Movimento/,'<div><label>Movimento').replace(/<div><label>Contraste<\/label>[\s\S]*?<\/div><\/div>\s*<div><label>Ligações/,'<div><label>Ligações').replace('A app segue também as definições','O tamanho do texto e o alto contraste estão em Aparência. A app segue também as definições')}}
/* ---- ensino profissional: disciplinas e motor de busca do Catálogo ---- */
const DISC_PROF=[['Sociocultural',['Português','Inglês','Francês','Espanhol','Alemão','Área de Integração','Tecnologias da Informação e Comunicação','Educação Física','Cidadania e Desenvolvimento','Educação Moral e Religiosa Católica (EMRC)']],
  ['Científica',['Matemática','Física e Química','Biologia','Química','Física','Geografia','Economia','História da Cultura e das Artes','Psicologia','Sociologia','Direito','Geometria Descritiva','Desenho']],
  ['Tecnológica',['Componente Tecnológica (UFCD)','Componente Tecnológica (UC)']],['Formação em Contexto de Trabalho',['Formação em Contexto de Trabalho (FCT)','Prova de Aptidão Profissional (PAP)']]];
DISC_PROF.forEach(([,L])=>L.forEach(n=>{const d=DISCIPLINAS.find(x=>x.n===n);if(d){if(!d.c.includes('sec'))d.c.push('sec')}else DISCIPLINAS.push({n,c:['sec'],t:'gen',prof:true})}));
const escolaProfissional=()=>{try{return tipoEscola(escolaPorId(escAtiva()))==='profissional'}catch(_){return false}};
{const _cd=cartaoDisciplinas;cartaoDisciplinas=function(){let h=_cd.apply(this,arguments);if(!escolaProfissional())return h;
  const box=document.createElement('div');box.innerHTML=h;const card=box.firstElementChild;
  card.querySelectorAll('h3').forEach(h3=>{if(/1\.º Ciclo|2\.º Ciclo|3\.º Ciclo|Ensino Secundário/.test(h3.textContent)){const g=h3.nextElementSibling;if(g&&g.classList.contains('disc-grid'))g.remove();h3.remove()}});
  const dk=n=>discKey(n,'sec');const html=`${DISC_PROF.map(([g,L])=>`<h3>Ensino Profissional · Componente ${esc(g)}</h3><div class="disc-grid">${L.map(n=>{const k=dk(n);return `<label class="${discAno().includes(k)?'on':''}"><input type="checkbox" data-disc="${esc(k)}" ${discAno().includes(k)?'checked':''}> ${esc(n)}</label>`}).join('')}</div>`).join('')}`;
  const ref=[...card.querySelectorAll('h3')].find(x=>/PROFIJ|Outras disciplinas/i.test(x.textContent));if(ref)ref.insertAdjacentHTML('beforebegin',html);else card.insertAdjacentHTML('beforeend',html);
  const p=card.querySelector('.hint');if(p)p.innerHTML='Escola profissional: escolha as disciplinas e componentes que leciona nos cursos profissionais. Na Componente Tecnológica pode procurar o curso no Catálogo Nacional de Qualificações e marcar as UFCD ou UC. <b>Cada ano letivo tem a sua lista.</b>';
  return box.innerHTML}}
{const _bd2=bindDisciplinas;bindDisciplinas=function(re){const r=_bd2.apply(this,arguments);try{if($('#disc-card .cnqdisc'))return r;const ks=[discKey(UFCD_N,'sec'),discKey(UC_N,'sec')].filter(k=>discAno().includes(k));if(!ks.length)return r;
  const ch=[...$$('[data-disc]')].find(e=>ks.includes(e.dataset.disc));const g=ch&&ch.closest('.disc-grid');if(!g)return r;const box=document.createElement('div');box.className='cnq cnqdisc';g.after(box);
  cnqPainel(box,{tipos:()=>[discAno().includes(discKey(UFCD_N,'sec'))?'UFCD':null,discAno().includes(discKey(UC_N,'sec'))?'UC':null].filter(Boolean),sel:()=>new Set(ufcdAno().map(u=>u.cod)),set:(u,on)=>{const L=ufcdAno();const i=L.findIndex(x=>x.cod===u.cod);if(i>=0)L.splice(i,1);if(on)L.push({cod:u.cod,nome:u.nome,horas:u.horas,tipo:u.tipo,curso:UI.cnqCurso||''});save();try{ufcdSinc(u,on)}catch(e){console.warn(e)}},
    rodape:()=>`<p class="hint" style="margin:8px 0 0">${ufcdAno().length?ufcdAno().length+' unidades escolhidas para '+esc(A().nome)+' — ':''}As unidades marcadas aparecem já selecionadas ao criar uma turma.</p>`})}catch(e){console.warn(e)}return r}}
/* ---- Nova Turma: código interno; um só seletor de curso (as unidades seguem o curso escolhido) ---- */
let NT_CUR=null;
{const _cp=cnqPainel;cnqPainel=function(box,api){if(!api.cursoFixo)return _cp.apply(this,arguments);
  const M=cnqM();let busy=false;const sel=api.sel;
  const des=()=>{const id=api.cursoFixo();const c=id?M.cursos.find(x=>String(x.id)===String(id)):null;if(!c){box.innerHTML=`<p class="mut" style="margin:0">${ic('book',14)} Escolha primeiro o curso acima para ver as UFCD / UC.</p>${typeof api.rodape==='function'?api.rodape():(api.rodape||'')}`;return}
    const U=M.uf[c.id]?M.uf[c.id].L:null;if(!U){box.innerHTML=`<p class="mut" role="status">${ic('refresh',14)} A descarregar as unidades de ${esc(c.nome)}…</p>`;if(!busy){busy=true;cnqCarregarUfcd(c).then(()=>{busy=false;des()}).catch(e=>{busy=false;box.innerHTML=`<p class="hint" style="color:var(--bad)">Não foi possível ler as unidades (${esc(e.message)}).</p>`})}return}
    const K=cnqTipoCurso(c);const S0=sel();const tot=U.filter(u=>S0.has(u.cod)).reduce((s,u)=>s+(+u.horas||0),0);const sc=(box.querySelector('.cnqt')||{}).scrollTop||0;
    box.innerHTML=`<div class="cnqbar"><span class="mut"><b>${esc(c.nome)}</b> · ${U.length} ${K==='UC'?'UC':'UFCD'}</span><span class="sp1"></span><button type="button" class="btn sm" data-fxo>${ic('check',13)} Todas as Obrigatórias</button><button type="button" class="btn sm" data-fxn>Nenhuma</button></div>
      <div class="tblw cnqt"><table class="lst"><thead><tr><th scope="col"><span class="a11y-sr">Selecionar</span></th><th scope="col">Código</th><th scope="col">${K==='UC'?'Unidade de Competência (UC)':'UFCD'}</th><th scope="col">${K==='UC'?'Créditos':'Horas'}</th><th scope="col">Tipo</th></tr></thead><tbody>${U.map((u,i)=>`<tr><td><input type="checkbox" data-fxu="${i}" ${S0.has(u.cod)?'checked':''} aria-label="${esc(u.cod+' '+u.nome)}"></td><td class="nw"><b>${esc(u.cod)}</b></td><td>${esc(u.nome)}</td><td class="nw">${u.k==='UC'?String(u.cred).replace('.',',')+' pts':(u.horas!==''?u.horas+' h':'')}</td><td><span class="tag ${u.tipo==='O'?'':'mut'}">${u.tipo==='O'?'Obrigatória':'Opcional'}</span></td></tr>`).join('')}</tbody></table></div>
      <p class="hint" style="margin:6px 0 0">Selecionadas: <b>${U.filter(u=>S0.has(u.cod)).length}</b>${tot?' · '+(K==='UC'?'≈ ':'')+tot+' h':''}</p>${typeof api.rodape==='function'?api.rodape():(api.rodape||'')}`;
    const t2=box.querySelector('.cnqt');if(t2)t2.scrollTop=sc;
    box.querySelectorAll('[data-fxu]').forEach(ch=>ch.onchange=()=>{const u=U[+ch.dataset.fxu];api.set(u,ch.checked);manterPosicao(des)});
    box.querySelector('[data-fxo]').onclick=()=>{U.filter(u=>u.tipo==='O').forEach(u=>api.set(u,true));des()};box.querySelector('[data-fxn]').onclick=()=>{U.forEach(u=>api.set(u,false));des()}};
  box._des=des;des()}}
{const _mc=montarCNQ;montarCNQ=function(ta){const w=$('#nt-cursow');if(!w||w.hidden)return _mc.apply(this,arguments);if(!ta||ta.dataset.cnq)return;ta.dataset.cnq='1';const box=document.createElement('div');box.className='cnq cnqfx';ta.parentNode.insertBefore(box,ta);ta.rows=3;
  if(!ta.value.trim()&&ufcdAno().length&&ta.id!=='nt-mods'){ta.value=ufcdAno().map(u=>u.cod+';'+u.nome+';'+(u.horas||'')).join('\n');ta.dispatchEvent(new Event('input'))}
  const cod=l=>l.split(/;|\t/)[0].trim().replace(/^UFCD\s*/i,'');const linhas=()=>ta.value.split('\n').map(l=>l.trim()).filter(Boolean);
  cnqPainel(box,{cursoFixo:()=>NT_CUR?NT_CUR.id:null,sel:()=>new Set(linhas().map(cod)),set:(u,on)=>{const L=linhas().filter(l=>cod(l)!==u.cod);if(on)L.push(u.cod+';'+u.nome+';'+(u.horas||''));ta.value=L.join('\n');ta.dispatchEvent(new Event('input'))},rodape:'<label style="margin-top:8px">Unidades desta turma <span class="mut">(também pode escrever à mão: código ; designação ; horas)</span></label>'})}}
{const _nt3=novaTurmaDlg;novaTurmaDlg=function(r){NT_CUR=null;const res=_nt3.apply(this,arguments);try{
  const nm=$('#nt-nome');if(nm&&!$('#nt-cod')){const cell=nm.closest('div');cell.insertAdjacentHTML('afterend',`<div><label for="nt-cod">Código interno <span class="mut">(opcional)</span></label><input id="nt-cod" placeholder="ex.: TTUR2324" autocapitalize="characters"></div>`);const g=cell.parentElement;if(g&&g.classList.contains('g2'))g.classList.replace('g2','g3')}
  const ci=$('#nt-curso');if(ci){const lb=ci.previousElementSibling;if(lb&&lb.tagName==='LABEL')lb.textContent='Nome do curso na escola'}
  /* o seletor de curso alimenta as unidades (UFCD/UC) sem segundo seletor */
  const w=$('#nt-cursow');if(w){const obs=new MutationObserver(()=>{});obs.disconnect()}
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){const a0=A();const ids=new Set(a0?a0.turmas.map(t=>t.id):[]);const cod=(($('#nt-cod')||{}).value||'').trim();const rr=orig.apply(this,arguments);const a=A();if(a&&cod){a.turmas.filter(t=>!ids.has(t.id)).forEach(t=>t.codigo=cod);save()}return rr}}
  }catch(e){console.warn(e)}return res}}
/* captar o curso escolhido no seletor da Nova Turma */
document.addEventListener('change',e=>{const s=e.target;if(!s.matches||!s.matches('#nt-cursow [data-cnqc]'))return;const M=cnqM();NT_CUR=M.cursos.find(x=>String(x.id)===s.value)||null;setTimeout(()=>{$$('#dw-b .cnqfx').forEach(b=>{const bx=b;if(bx._des)bx._des()})},30)},true);
/* código interno visível na lista de turmas e em Editar Turma */
/* ---- produção oral: só quando os critérios têm uma componente oral; lança no instrumento ---- */
const RX_ORAL=/oral|oralidade|\bPO\b|\bCO\b|\bIO\b|intera[cç][aã]o/i;
let domOral=t=>t&&(t.dominios||[]).find(d=>/produ[cç][aã]o.*oral|intera[cç][aã]o.*oral|oral/i.test(d.nome||'')||/^(PO|IO|PIO|O)$/i.test(d.ab||''))||(t&&(t.dominios||[]).find(d=>RX_ORAL.test((d.nome||'')+' '+(d.ab||''))));
function navOral(){const t=T();const tem=!!domOral(t);$$('#side [data-v="oral"],#tnavHold [data-v="oral"]').forEach(b=>{b.hidden=!tem;b.style.display=tem?'':'none'})}
{const _g4=go;go=function(v){if(v==='oral'&&T()&&!domOral(T())){toast('Os critérios desta turma não têm uma componente oral (Critérios › Domínios).');v='criterios'}const r=_g4.call(this,v);try{navOral()}catch(_){}return r}}
function oralSync(t){const o=oralM(t);const dom=domOral(t);if(!dom)return null;const per=o.per||perAtual(t);let i=o.inst&&t.instrumentos.find(x=>x.id===o.inst);
  const al=alunosAval(t);const algum=al.some(a=>{const r=o.regs[a.id];return r&&r.n&&ORAL_P.some(p=>r.n[p.k])});if(!i&&!algum)return null;
  if(!i){i={id:uid(),nome:'Produção Oral',tipo:'Prova Oral',periodo:per,data:o.data||isoHoje(),itens:[],notas:{},oral:true};t.instrumentos.push(i);o.inst=i.id}
  i.periodo=per;if(o.data)i.data=o.data;const c=o.cfg;
  i.itens=ORAL_P.map((p,k)=>{const ex=(i.itens||[]).find(x=>x.oral===p.k);return {id:ex?ex.id:uid()+k,rot:p.n,dom:dom.id,cot:oralMax(c,p.k),oral:p.k}});
  al.forEach(a=>{const r=o.regs[a.id];if(!r||!r.n||!ORAL_P.some(p=>r.n[p.k])){delete i.notas[a.id];return}const n=i.notas[a.id]={};i.itens.forEach(it=>{const nv=r.n[it.oral];if(nv)n[it.id]=oralPts(c,it.oral,nv)})});return i}
{const _vo=vOral;vOral=function(){const t=T();if(t&&!domOral(t)){$('#view').innerHTML=`<div class="card empty">${ic('fala',30)}<br><b>Os critérios desta turma não têm componente oral</b><br><span class="mut">A produção oral aparece quando os domínios incluem a oralidade (ex.: “Produção e Interação Oral”, PO, CO).</span><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" data-goview="criterios">${ic('sliders',15)} Abrir Critérios</button></div></div>`;return}
  const r=_vo.apply(this,arguments);try{const o=oralM(t);const dom=domOral(t);const P=periodos();const i=oralSync(t);save();
    const card=[...document.querySelectorAll('#view .card')].find(c=>/Ficha de Registo/.test(c.textContent));if(card){card.querySelector('.hint').insertAdjacentHTML('afterend',`<div class="orsync"><span>${ic('link',14)} Os totais entram na avaliação no domínio <b>${esc(dom.nome)}</b> (${esc(dom.ab||'')} · ${dom.peso}%) como o instrumento <b>“Produção Oral”</b> do</span><select id="or-per" aria-label="Período do instrumento">${P.map(p=>`<option value="${p}" ${(o.per||perAtual(t))==p?'selected':''}>${perNome(p)}</option>`).join('')}</select>${i?`<button type="button" class="btn sm" data-goview="instrumentos">${ic('clipboard',13)} Ver Instrumento</button>`:'<span class="mut">— criado ao registar o primeiro aluno.</span>'}</div>`);
      const ps=$('#or-per');if(ps)ps.onchange=()=>{o.per=+ps.value;oralSync(t);save();toast('Instrumento no '+perNome(o.per),'ok')}}
    $$('[data-orn]').forEach(b=>b.addEventListener('click',()=>{oralSync(t);save()}));
  }catch(e){console.warn(e)}return r}}
{const _ov=oralValidar;oralValidar=async function(t,depois){return _ov.call(this,t,()=>{try{oralSync(t);save()}catch(_){}depois&&depois()})}}
setTimeout(()=>{try{navOral()}catch(_){}},0);

/* data de nascimento do professor (guardada no perfil) */
document.addEventListener('change',e=>{const el=e.target;if(!el||!el.matches||!el.matches('[data-pf="nascimento"]'))return;const p=perfil();p.nascimento=el.value;S.cfg.perfil=p;if(p.nascimento&&p.nascimento.slice(5)===isoHoje().slice(5))S.cfg.parabensVisto='';save();audit('Professor','Perfil alterado','nascimento');toast(el.value?'Data de nascimento guardada':'Data de nascimento removida','ok')});

/* ---------- Horário da turma: grelha nova (blocos contínuos, turnos lado a lado, cor por disciplina) ---------- */
const corSigla=ab=>{let h=0;for(const c of String(ab||''))h=(h*31+c.charCodeAt(0))%360;return h};
function grelhaTurma(aulas,o){o=o||{};if(!aulas.length)return '<div class="empty">Sem aulas.</div>';
  const ds=[1,2,3,4,5,...(aulas.some(a=>a.dia===6)?[6]:[])];const S_=[];aulas.forEach(a=>{if(!S_.some(s=>s.ini===a.ini))S_.push({ini:a.ini,fim:a.fim})});S_.sort((x,y)=>x.ini-y.ini);
  /* linhas: tempos + intervalos (≥15 min) */
  const R=[];S_.forEach((s,i)=>{if(i&&s.ini-S_[i-1].fim>=15)R.push({pausa:true,ini:S_[i-1].fim,fim:s.ini});R.push(s)});
  const rowDe=ini=>R.findIndex(r=>!r.pausa&&r.ini===ini);
  const hoje=new Date().getDay(),mins=new Date().getHours()*60+new Date().getMinutes();
  const chave=L=>L.map(a=>a.ab+'@'+(a.sala||'')).sort().join('|');
  let blocos='';
  ds.forEach((d,ci)=>{let i=0;while(i<R.length){const r=R[i];if(r.pausa){i++;continue}const L=aulas.filter(a=>a.dia===d&&a.ini===r.ini);if(!L.length){i++;continue}
    /* junta tempos seguidos com as mesmas aulas */
    let j=i,k=chave(L);while(true){let n=j+1;if(n<R.length&&R[n].pausa)break;if(n>=R.length)break;const L2=aulas.filter(a=>a.dia===d&&a.ini===R[n].ini);if(!L2.length||chave(L2)!==k)break;j=n}
    const ini=r.ini,fim=R[j].fim;const now=d===hoje&&ini<=mins&&fim>mins;const n=j-i+1;
    blocos+=`<div class="htb ${now?'agora':''}" style="grid-column:${ci+2};grid-row:${i+2}/${j+3}">${L.map(a=>{const m=o.minha&&o.minha(a);return `<div class="htc ${m?'minha':''}" style="--h:${corSigla(a.ab)}" title="${esc((o.titulo?o.titulo(a):a.ab)+' · '+fmtHM(ini)+'–'+fmtHM(fim)+(a.sala?' · Sala '+a.sala:''))}"><b>${esc(a.ab)}</b>${a.sala?`<span class="hts">${esc(a.sala)}</span>`:''}${n>1?`<span class="htt">${fmtHM(ini)}–${fmtHM(fim)}</span>`:''}</div>`}).join('')}</div>`;i=j+1}});
  const cab=`<div class="hth hhd"></div>${ds.map((d,ci)=>`<div class="hth ${d===hoje?'hj':''}" style="grid-column:${ci+2}">${DIAS[d]}</div>`).join('')}`;
  const tms=R.map((r,i)=>r.pausa?`<div class="htp" style="grid-row:${i+2};grid-column:1/-1"><span>${r.fim-r.ini>=45?'Almoço':'Intervalo'} · ${fmtHM(r.ini)}–${fmtHM(r.fim)}</span></div>`:`<div class="htm" style="grid-row:${i+2}"><b>${fmtHM(r.ini)}</b><span>${fmtHM(r.fim)}</span></div>`).join('');
  const fundos=R.map((r,i)=>r.pausa?'':ds.map((d,ci)=>`<div class="htf ${d===hoje?'hj':''}" style="grid-row:${i+2};grid-column:${ci+2}"></div>`).join('')).join('');
  const rows=R.map(r=>r.pausa?'22px':'minmax(54px,auto)').join(' ');
  return `<div class="htw" role="region" aria-label="Horário semanal" tabindex="0"><div class="htg" style="grid-template-columns:62px repeat(${ds.length},minmax(110px,1fr));grid-template-rows:auto ${rows}">${cab}${fundos}${tms}${blocos}</div></div>`}
{const _vh=vHorario;vHorario=function(){const r=_vh.apply(this,arguments);try{const t=T(),a=A();const h=horarioDe(a,UI.horC);if(!h)return r;
  const old=$('#view .card.wide div[style*="overflow:auto"]:has(> table.hor)')||($('#view table.hor')||{}).parentElement;if(!old)return r;
  const minhas=aulasTurma(t);const sig=t.horAbs&&t.horAbs.length?t.horAbs:siglasDaDisciplina(h,t.disciplina);
  const tit=x=>{const l=h.legenda.find(l=>l.ab===x.ab);return l?l.nome+(l.profs.length?' — '+l.profs.join(', '):''):x.ab};
  const wrap=document.createElement('div');wrap.innerHTML=grelhaTurma(h.aulas,{minha:x=>sig.includes(x.ab)&&(!minhas.some(m=>m.prof)||minhas.some(m=>m.dia===x.dia&&m.ini===x.ini)),titulo:tit});old.replaceWith(wrap.firstElementChild);
  const usadas=[...new Set(h.aulas.map(x=>x.ab))];const leg=h.legenda.filter(l=>usadas.includes(l.ab));
  const g=$('#view .htw');if(g&&leg.length)g.insertAdjacentHTML('afterend',`<div class="htleg">${leg.map(l=>`<span class="htl ${sig.includes(l.ab)?'minha':''}" style="--h:${corSigla(l.ab)}"><b>${esc(l.ab)}</b> ${esc(l.nome)}${l.profs.length?` <span class="mut">· ${esc(l.profs.map(p=>profNome(p)).join(', '))}</span>`:''}</span>`).join('')}</div>`);
  const lg=$('#view .card.wide .leg');if(lg)lg.innerHTML=`<span class="htl minha" style="--h:0;padding:2px 8px"><b>${esc(t.disciplina)}</b></span>`;
  }catch(e){console.warn(e)}return r}}

/* ecrãs muito largos: coluna à esquerda (Horário da turma: Aulas Previstas e Próximas Aulas) */
const LADO_ESQ={horario:[/^Aulas Previstas/,/^Próximas Aulas/]};
{const _ll=layoutLado;layoutLado=function(){const r=_ll.apply(this,arguments);try{const v=$('#view');const lay=v&&v.querySelector(':scope>.vlay');const R=LADO_ESQ[VIEW];
  if(!lay||!R)return r;let esq=lay.querySelector(':scope>.vesq');const larga=v.clientWidth>=1780;
  const cards=[...lay.querySelectorAll(':scope>.vside>.card,:scope>.vmain>.card,:scope>.vesq>.card')].filter(c=>{const h=c.querySelector('h2');return h&&R.some(x=>x.test(h.textContent.trim()))});
  if(larga){if(!esq){esq=document.createElement('div');esq.className='vesq';lay.prepend(esq)}cards.forEach(c=>{if(c.parentElement!==esq)esq.appendChild(c)});lay.classList.add('vlay3')}
  else if(esq){const s=lay.querySelector(':scope>.vside');cards.forEach(c=>s&&s.appendChild(c));esq.remove();lay.classList.remove('vlay3')}}catch(e){console.warn(e)}return r}}
addEventListener('resize',()=>{clearTimeout(layoutLado._e);layoutLado._e=setTimeout(()=>{try{layoutLado()}catch(_){}},120)});

/* Nova Turma (curso profissional): disciplina principal e outras disciplinas do ensino profissional */
function ntProfDisc(){const sd=$('#nt-disc');const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';if(!sd)return;
  if(of==='profissional'){if(!sd.dataset.orig)sd.dataset.orig=sd.innerHTML;const todos=DISC_PROF.flatMap(([g,L])=>L.map(n=>[g,n]));const meus=todos.filter(([,n])=>discAno().includes(discKey(n,'sec')));const L=meus.length?meus:todos;const cur=sd.value;
    sd.innerHTML=DISC_PROF.map(([g])=>{const X=L.filter(x=>x[0]===g);return X.length?`<optgroup label="Componente ${esc(g)}">${X.map(([,n])=>`<option value="${esc(discKey(n,'sec'))}">${esc(n)}</option>`).join('')}</optgroup>`:''}).join('')+'<option value="__outra">Outra…</option>';
    if([...sd.options].some(o=>o.value===cur))sd.value=cur;sd.dispatchEvent(new Event('change'))}
  else if(sd.dataset.orig){sd.innerHTML=sd.dataset.orig;delete sd.dataset.orig;sd.dispatchEvent(new Event('change'))}}
{const _nt4=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt4.apply(this,arguments);try{const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ntProfDisc,20));setTimeout(ntProfDisc,30);
  const lb=$('#nt-modw label');if(lb)lb.innerHTML='Módulos / UFCD / UC desta turma <span class="mut">(da disciplina que leciona — marque no quadro do curso ou escreva: código ; designação ; horas)</span>'}catch(e){console.warn(e)}return res}}

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tvadd]');if(!b)return;e.preventDefault();go('turmas');setTimeout(()=>{const c=[...document.querySelectorAll('#view .card')].find(x=>x.querySelector('#t-pdf,#t-new'));if(c){c.scrollIntoView({behavior:'smooth',block:'start'});const f=c.querySelector('#t-pdf')||c.querySelector('#t-new');if(f)f.focus({preventScroll:true})}},150)});

/* Barra lateral: turmas com várias disciplinas agrupadas (uma linha por turma, disciplinas como sub-escolha) */
navTurmas=function(){const tree=$('#tTree'),hold=$('#tnavHold'),hd=$('#navTurmas');if(!tree||!hold||!hd)return;
  const a=A();const TF=a?turmasFiltradas(a):[];const ab=S.cfg.navTurmas!==false;
  const exp=S.turmaAtiva&&UI.navTFech!==S.turmaAtiva?S.turmaAtiva:null;
  hd.classList.toggle('aberto',ab);hd.setAttribute('aria-expanded',String(ab));hd.querySelector('.chev').innerHTML=ic('chev',13);
  const kids=[...document.querySelectorAll('#side .tnav')];kids.forEach(k=>hold.appendChild(k));
  const gT=$('#grpT');const uma=TF.length===1;hd.style.display=uma?'none':'';if(gT)gT.style.display=uma?'':'none';tree.classList.toggle('uma',uma);
  if(uma){const t=TF[0];if(S.turmaAtiva!==t.id){S.turmaAtiva=t.id}if(gT)gT.innerHTML=anoBadge(t,'sm')+' Turma '+esc(t.nome);tree.innerHTML='';kids.forEach(k=>{tree.appendChild(k);k.disabled=false});navModular();return}
  if(!ab){tree.innerHTML='';return}
  if(!TF.length){tree.innerHTML='<div class="tvazio"><span class="lbl">Sem turmas</span><button type="button" class="btn sm tvadd" data-tvadd title="Adicionar turma">'+ic('plus',14)+'<span class="lbl">Adicionar Turma</span></button></div>';return}
  /* agrupar por turma (nome + escola) mantendo a ordem */
  const G=[];TF.forEach(t=>{const k=t.nome+'|'+escId(escolaDe(t));let g=G.find(x=>x.k===k);if(!g){g={k,nome:t.nome,L:[]};G.push(g)}g.L.push(t)});
  tree.innerHTML=G.map(g=>{const t0=g.L[0];
    if(g.L.length===1){const t=t0;return `<button class="nav tnode ${t.id===exp?'aberto':''} ${t.id===S.turmaAtiva?'cur':''}" data-tt="${t.id}" title="${esc(t.nome+' · '+t.disciplina)}" aria-expanded="${t.id===exp}">${anoBadge(t,'sm')}<span class="lbl"><b>${esc(t.nome)}</b><span class="tdisc">${esc(t.disciplina)}</span></span><span class="chev">${ic('chev',12)}</span></button><div class="tkids" data-tk="${t.id}"></div>`}
    const ativa=g.L.find(t=>t.id===S.turmaAtiva);const aberto=!!(ativa&&exp===ativa.id);
    return `<button class="nav tnode tgrp ${aberto?'aberto':''} ${ativa?'cur':''}" data-tgk="${esc(g.k)}" title="${esc(g.nome+' · '+g.L.map(t=>t.disciplina).join(', '))}" aria-expanded="${aberto}">${anoBadge(t0,'sm')}<span class="lbl"><b>${esc(g.nome)}</b><span class="tdisc">${ativa&&aberto?esc(ativa.disciplina):g.L.length+' disciplinas'}</span></span><span class="tcnt" aria-hidden="true">${g.L.length}</span><span class="chev">${ic('chev',12)}</span></button>
      ${aberto?`<div class="tdsel" role="radiogroup" aria-label="Disciplina em ${esc(g.nome)}">${g.L.map(t=>`<button type="button" role="radio" aria-checked="${t.id===S.turmaAtiva}" class="tdsb ${t.id===S.turmaAtiva?'on':''}" data-tt="${t.id}" title="${esc(t.disciplina)}"><span class="tdd" style="--h:${corSigla(siglaDe(t))}"></span><span class="lbl">${esc(t.disciplina)}</span></button>`).join('')}</div><div class="tkids" data-tk="${ativa.id}"></div>`:''}`}).join('');
  if(exp){const box=tree.querySelector(`[data-tk="${exp}"]`);if(box)kids.forEach(k=>box.appendChild(k))}
  const escolhe=id=>{if(S.turmaAtiva===id&&UI.navTFech!==id){UI.navTFech=id;navTurmas();return}
    UI.navTFech=null;const menu=document.body.classList.contains('menu');
    if(S.turmaAtiva!==id){S.turmaAtiva=id;save();UI.inst=null;go('painel')}else{navTurmas();if(VIEW!=='painel'&&!NEEDS_T.includes(VIEW))go('painel')}
    if(menu)document.body.classList.add('menu');const box=tree.querySelector(`[data-tk="${id}"]`);if(box&&box.animate)box.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'})};
  tree.querySelectorAll('.tnode[data-tt]').forEach(b=>b.onclick=()=>escolhe(b.dataset.tt));
  tree.querySelectorAll('.tdsb[data-tt]').forEach(b=>b.onclick=()=>{const id=b.dataset.tt;if(S.turmaAtiva===id)return;UI.navTFech=null;escolhe(id)});
  tree.querySelectorAll('[data-tgk]').forEach(b=>b.onclick=()=>{const g=G.find(x=>x.k===b.dataset.tgk);const ativa=g.L.find(t=>t.id===S.turmaAtiva);if(ativa)escolhe(ativa.id);else{UI.navTFech=null;escolhe(g.L[0].id)}})};
setTimeout(()=>{try{navTurmas()}catch(_){}},0);

/* Código interno obrigatório nas turmas de curso profissional */
{const _nt5=novaTurmaDlg;novaTurmaDlg=function(r){const res=_nt5.apply(this,arguments);try{const of=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};
  const rot=()=>{const lb=$('label[for="nt-cod"]');const i=$('#nt-cod');if(!lb||!i)return;const pr=of()==='profissional';lb.innerHTML=pr?'Código interno <span class="obr" aria-hidden="true">*</span>':'Código interno <span class="mut">(opcional)</span>';i.required=pr;i.setAttribute('aria-required',pr?'true':'false')};
  rot();const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(rot,30));
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){const i=$('#nt-cod');if(of()==='profissional'&&i&&!i.value.trim()){i.classList.add('erro');i.focus();toast('Indique o código interno da turma (obrigatório nos cursos profissionais).','erro');return}return orig.apply(this,arguments)}}
  const i=$('#nt-cod');if(i)i.addEventListener('input',()=>i.classList.remove('erro'))}catch(e){console.warn(e)}return res}}

/* introdução de códigos: teclado numérico com pontos (substitui as caixas do browser) */
function pinDialog(o){o=o||{};const N=o.n||4;return new Promise(res=>{let v='';let ocup=false;const d=document.createElement('dialog');d.className='pindlg';d.setAttribute('aria-labelledby','pd-t');d.setAttribute('aria-describedby','pd-s');
  const teclas=['1','2','3','4','5','6','7','8','9','x','0','⌫'];
  d.innerHTML=`<div class="pdh"><span class="pdi">${ic('shield',26)}</span><h2 id="pd-t">${esc(o.t||'Código')}</h2><p id="pd-s" class="mut">${esc(o.s||'')}</p></div>
    <div class="pdots" role="status" aria-live="polite" aria-label="0 de ${N} algarismos">${Array.from({length:N},()=>'<i></i>').join('')}</div><p class="pderr" role="alert"></p>
    <div class="pdk">${teclas.map(k=>k==='x'?`<button type="button" class="pdc" data-pk="x" aria-label="Cancelar">Cancelar</button>`:k==='⌫'?`<button type="button" class="pdb" data-pk="b" aria-label="Apagar">${ic('arrowL',22)||'⌫'}</button>`:`<button type="button" data-pk="${k}">${k}</button>`).join('')}</div>`;
  document.body.appendChild(d);const dots=d.querySelector('.pdots'),er=d.querySelector('.pderr');
  const pinta=()=>{dots.querySelectorAll('i').forEach((x,i)=>x.classList.toggle('on',i<v.length));dots.setAttribute('aria-label',v.length+' de '+N+' algarismos')};
  const fim=x=>{try{d.close()}catch(_){}d.remove();document.removeEventListener('keydown',kb,true);res(x)};
  const abana=m=>{er.textContent=m||'';dots.classList.remove('abana');void dots.offsetWidth;dots.classList.add('abana');if(navigator.vibrate)try{navigator.vibrate(120)}catch(_){}};
  const tecla=async k=>{if(ocup)return;if(k==='x')return fim(null);if(k==='b'){v=v.slice(0,-1);pinta();return}if(v.length>=N)return;v+=k;er.textContent='';pinta();
    if(v.length===N){ocup=true;await new Promise(r=>setTimeout(r,140));const ok=o.verifica?await o.verifica(v):true;if(ok){dots.classList.add('ok');setTimeout(()=>fim(v),160)}else{abana(o.erro||'Código incorreto.');setTimeout(()=>{v='';pinta()},380)}ocup=false}};
  const kb=e=>{if(!d.isConnected)return;if(e.target&&e.target.closest&&e.target.closest('dialog')!==d&&(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.target.closest('dialog')))return;if(/^\d$/.test(e.key)){e.preventDefault();tecla(e.key)}else if(e.key==='Backspace'){e.preventDefault();tecla('b')}else if(e.key==='Escape'){e.preventDefault();fim(null)}};document.addEventListener('keydown',kb,true);
  d.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{tecla(b.dataset.pk);b.classList.remove('prem');void b.offsetWidth;b.classList.add('prem')});d.addEventListener('cancel',e=>{e.preventDefault();fim(null)});
  try{d.showModal()}catch(_){d.setAttribute('open','')}const f=d.querySelector('[data-pk="1"]');if(f)f.focus()})}
if(!ICONS.arrowL)ICONS.arrowL='<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9l-6 6M11 9l6 6"/>';


/* =====================================================================
   Sincronização na nuvem — OneDrive (Microsoft 365) e Google Drive
   dados divididos por partes (geral, ano, turma, auditoria, fotografias),
   encriptados no dispositivo (AES-256-GCM), junção por parte entre dispositivos
   ===================================================================== */
const NV_KEY='edugest.nuvem',NV_CONF='edugest.nuvem.conf',NV_PREF='ef-';
const nvL=()=>{try{return JSON.parse(localStorage.getItem(NV_KEY)||'{}')}catch(_){return {}}};
const nvSet=o=>{const x={...nvL(),...o};try{localStorage.setItem(NV_KEY,JSON.stringify(x))}catch(_){}return x};
const nvHash=s=>{let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (h2>>>0).toString(36)+(h1>>>0).toString(36)};
const NV_LOCAIS=['anoAtivo','turmaAtiva','escolaAtiva','filtroOferta','_ts'];const NV_CFG_LOC=['gsync','sazForcar'];
const nvDisp=()=>{let d=nvL().disp;if(!d){d=(/iPad/.test(navigator.userAgent)||navigator.maxTouchPoints>1&&/Mac/.test(navigator.userAgent)?'iPad':/iPhone/.test(navigator.userAgent)?'iPhone':/Mac/.test(navigator.platform)?'Mac':/Win/.test(navigator.platform)?'Windows':'Browser')+' '+Math.random().toString(36).slice(2,6);nvSet({disp:d})}return d};
