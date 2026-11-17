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

