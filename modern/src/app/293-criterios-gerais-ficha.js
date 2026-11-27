/* ===================== Critérios gerais com ficha de indicadores =====================
   Um critério «Geral» (ex.: Empenho e Responsabilidade) pode ter indicadores (Assiduidade, Pontualidade…).
   Não usa elementos de avaliação: classifica-se na Avaliação Final, numa ficha por aluno (como a grelha
   «Atitudes e Valores»): cada indicador de 0 a 20; o critério vale a média dos seus indicadores.
   Indicadores em d.ind (sem d.ind: os predefinidos do Saber Ser, se o nome coincidir).
   Valores em t.critGI[chave][aid][domId][índice] = 0..20 · síntese em t.critGI[chave][aid]._obs · chave = critGChave */
function cgIndDef(d){const n=normT(d&&d.nome),ab=normT(d&&d.ab);
  const g=PROF_ATIT.find(g=>normT(g.nome)===n)||PROF_ATIT.find(g=>n&&n.indexOf(normT(g.nome))===0)||PROF_ATIT.find(g=>normT(g.ab)===ab)||(ab==='a'&&/autonom/.test(n||'autonomia')?PROF_ATIT.find(g=>g.k==='aut'):null);
  return g?g.ind.slice():[]}
function cgInd(d){return !d?[]:Array.isArray(d.ind)?d.ind:cgIndDef(d)}
function cgReg(t,per,aid){const k=critGChave(t,per);t.critGI=t.critGI||{};const K=t.critGI[k]=t.critGI[k]||{};return K[aid]=K[aid]||{}}
function cgFichaVal(t,aid,d,per){const I=cgInd(d);if(!I.length)return null;const R=(((((t.critGI||{})[critGChave(t,per)])||{})[aid])||{})[d.id]||{};
  const v=I.map((_,i)=>R[i]).filter(x=>x!=null&&x!=='').map(Number).filter(x=>isFinite(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
/* o valor do critério geral vem da ficha quando há indicadores classificados; senão, da classificação direta */
{const _cgV=critGVal;critGVal=function(t,aid,dom,per){const d=(t.dominios||[]).find(x=>x.id===dom);if(d&&d.ger&&cgInd(d).length){const v=cgFichaVal(t,aid,d,per);if(v!=null)return v/20}return _cgV.apply(this,arguments)}}
const cgF1=v=>v==null?'—':String(Math.round(v*10)/10).replace('.',',');

/* ---- ficha do aluno ---- */
function cgFicha(t,per,aid){const G=domGer(t);if(!G.length)return toast('Não há critérios gerais nesta turma (Critérios › tipo «Geral»).','aviso');
  const unid=tUnid(t);per=+per||perAtual(t);const al=alunosAval(t);if(!al.length)return toast('Não há alunos.','aviso');let i=Math.max(0,al.findIndex(a=>a.id===aid));
  const sec=isSec(t)||unid;
  const total=a=>{let s=0,w=0;G.forEach(d=>{const v=critGVal(t,a.id,d.id,per);if(v!=null&&+d.peso>0){s+=v*20*d.peso;w+=+d.peso}});return w?s/w:null};
  const draw=()=>{const a=al[i];const R=cgReg(t,per,a.id);
    const sub=unid?(unidNomeComp(t)||'Unidade'):perNome(per);
    openDrawer('Critérios Gerais — Ficha do Aluno',`<div class="ed cgf">
      <div class="cgfh"><button type="button" class="btn sm ico" id="cgf-ant" aria-label="Aluno anterior" ${i?'':'disabled'}>‹</button>
        <div class="cgfn"><b>${esc(a.nome)}</b><small class="mut">N.º ${esc(numAl(a))} · ${esc(t.nome)} · ${esc(sub)}</small></div>
        <button type="button" class="btn sm ico" id="cgf-seg" aria-label="Aluno seguinte" ${i<al.length-1?'':'disabled'}>›</button></div>
      <p class="hint">Classifique cada indicador de <b>0 a 20</b>. Cada critério vale a média dos seus indicadores; vazio = ainda sem classificação.</p>
      ${G.map(d=>{const I=cgInd(d);const V=R[d.id]||{};
        return `<section class="cgfs"><div class="cgfsh"><b>${esc(d.nome)}</b><span class="mut">${String(d.peso).replace('.',',')}%</span><span class="sp1"></span><span class="cgft">Total <b data-cgt="${d.id}">${cgF1(critGVal(t,a.id,d.id,per)==null?null:critGVal(t,a.id,d.id,per)*20)}</b></span></div>
          ${I.length?I.map((n,k)=>`<label class="cgfr"><span>${esc(n)}</span><input class="cgfi" data-cgd="${d.id}" data-cgk="${k}" value="${V[k]==null?'':String(V[k]).replace('.',',')}" inputmode="decimal" placeholder="0–20" aria-label="${esc(n)}"></label>`).join('')
            :`<label class="cgfr"><span class="mut">Sem indicadores — classificação direta</span><input class="cgfi" data-cgd="${d.id}" data-cgdir="1" value="${(v=>v==null?'':String(Math.round(v*200)/10).replace('.',','))((((t.critG||{})[critGChave(t,per)]||{})[a.id]||{})[d.id])}" inputmode="decimal" placeholder="0–20" aria-label="${esc(d.nome)}"></label>`}</section>`}).join('')}
      <div class="cgfg"><span>Total global dos critérios gerais</span><b id="cgf-tg">${cgF1(total(a))}</b><small class="mut">média ponderada (0–20)</small></div>
      <label style="margin-top:10px">Síntese descritiva</label><textarea id="cgf-obs" rows="3">${esc(R._obs||'')}</textarea>
      <p class="hint">${sec?'A nota de cada critério entra na Avaliação Final com o seu peso.':'Na Avaliação Final a média de 0–20 é convertida para percentagem.'}</p></div>`);
    const upd=()=>{G.forEach(d=>{const e=$('#dw-b [data-cgt="'+d.id+'"]');if(e){const v=critGVal(t,a.id,d.id,per);e.textContent=cgF1(v==null?null:v*20)}});const g=$('#cgf-tg');if(g)g.textContent=cgF1(total(a))};
    $$('#dw-b .cgfi').forEach(inp=>inp.onchange=()=>{const s=inp.value.trim().replace(',','.');const d=inp.dataset.cgd;
      if(s!==''){const n=+s;if(!isFinite(n)||n<0||n>20){toast('Valor entre 0 e 20.','erro');inp.focus();return}}
      if(inp.dataset.cgdir){const k=critGChave(t,per);t.critG=t.critG||{};const K=t.critG[k]=t.critG[k]||{};const r=K[a.id]=K[a.id]||{};if(s==='')delete r[d];else r[d]=+s/20}
      else{const r=R[d]=R[d]||{};if(s==='')delete r[inp.dataset.cgk];else r[inp.dataset.cgk]=+s}
      save();upd();inp.classList.add('ok');setTimeout(()=>inp.classList.remove('ok'),600)});
    $$('#dw-b .cgfi').forEach((inp,k,L)=>inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const n=L[k+1];if(n)n.focus();else{const b=$('#cgf-seg');if(b&&!b.disabled)b.click()}}}));
    $('#cgf-obs').oninput=e=>{R._obs=e.target.value;save()};
    $('#cgf-ant').onclick=()=>{if(i>0){i--;draw()}};$('#cgf-seg').onclick=()=>{if(i<al.length-1){i++;draw();setTimeout(()=>{const f=$('#dw-b .cgfi');if(f)f.focus()},30)}};
    const f=$('#dw-b .cgfi');if(f)setTimeout(()=>f.focus(),30)};
  draw();
  const re=()=>{try{if(VIEW==='avaliacao')vAvaliacao();else if(VIEW==='modulos')vModulos()}catch(_){}};
  const x=$('#dw-x');if(x)x.addEventListener('click',re,{once:true})}

/* ---- tabela de todos os alunos (critGDlg): critérios com indicadores mostram a média da ficha e abrem a ficha ---- */
{const _cgD=critGDlg;critGDlg=function(t,per){const r=_cgD.apply(this,arguments);const unid=tUnid(t);let p=+per||perAtual(t);
  const fix=()=>{$$('#dw-b .cgin').forEach(i=>{const d=(t.dominios||[]).find(x=>x.id===i.dataset.cgd);if(!d||!cgInd(d).length)return;const v=critGVal(t,i.dataset.cga,d.id,p);
      i.readOnly=true;i.value=v==null?'':(isSec(t)||unid?String(Math.round(v*200)/10).replace('.',','):String(Math.round(v*100)));i.title='Média dos indicadores — toque para abrir a ficha';i.classList.add('cgro');i.onclick=()=>cgFicha(t,p,i.dataset.cga)})};
  fix();$$('#dw-b [data-cgp]').forEach(b=>b.addEventListener('click',()=>{p=+b.dataset.cgp;setTimeout(fix,0)}));return r}}

/* ---- barra dos critérios gerais: botão «Ficha por aluno» ---- */
{const _cgB=critGBarra;critGBarra=function(){const r=_cgB.apply(this,arguments);try{const t=T();const bar=$('#view .cgbar');if(!t||!bar||bar.querySelector('#cg-ficha'))return r;
    const b=document.createElement('button');b.type='button';b.className='btn sm';b.id='cg-ficha';b.innerHTML=ic('user',14)+' Ficha por aluno';b.onclick=()=>cgFicha(t,typeof UI!=='undefined'&&UI.per?UI.per:null);
    const c=bar.querySelector('#cg-abrir');if(c){c.before(b);c.innerHTML=ic('pencil',14)+' Todos os alunos';c.classList.remove('pri');b.classList.add('pri')}else bar.appendChild(b)}catch(e){console.warn(e)}return r}}

/* ---- Avaliação Final: as células dos critérios gerais abrem a ficha do aluno ---- */
{const _vAG=vAvaliacao;vAvaliacao=function(){const r=_vAG.apply(this,arguments);try{const t=T();if(!t||!domGer(t).length)return r;const p=UI.per;
    const D=t.dominios||[];const idx=D.map((d,k)=>d.ger?k:-1).filter(k=>k>=0);
    $$('#view tr[data-a]').forEach(tr=>{idx.forEach(k=>{const td=tr.cells[2+k];if(!td)return;td.classList.add('cgcel');td.title='Critério geral — toque para abrir a ficha de '+((t.alunos.find(a=>a.id===tr.dataset.a)||{}).nome||'');td.onclick=()=>cgFicha(t,p,tr.dataset.a)})})}catch(e){console.warn(e)}return r};if(go._f)go._f.avaliacao=vAvaliacao}

/* ---- Critérios: indicadores do critério geral, indentados por baixo ---- */
function cgIndDlg(t,k){const d=(t.dominios||[])[k];if(!d)return;
  openDrawer('Indicadores — '+d.nome,`<div class="ed"><p class="hint" style="margin-top:0">Um indicador por linha. Na Avaliação Final cada um é classificado de 0 a 20 na ficha do aluno e <b>${esc(d.nome)}</b> vale a média deles. Sem indicadores, o critério classifica-se diretamente.</p>
    <textarea id="cgi-t" rows="10">${esc(cgInd(d).join('\n'))}</textarea>
    <div class="row" style="margin-top:10px;gap:8px">${cgIndDef(d).length?'<button type="button" class="btn sm" id="cgi-def">Repor os predefinidos</button>':''}<span class="sp1"></span><button type="button" class="btn pri" id="cgi-ok">Guardar</button></div></div>`);
  const d0=$('#cgi-def');if(d0)d0.onclick=()=>{$('#cgi-t').value=cgIndDef(d).join('\n')};
  $('#cgi-ok').onclick=()=>{const L=$('#cgi-t').value.split('\n').map(x=>x.trim()).filter(Boolean);
    const ant=cgInd(d);if(ant.length&&L.join('\n')!==ant.join('\n')&&JSON.stringify(t.critGI||{}).indexOf('"'+d.id+'"')>=0&&!confirm('Já há classificações nesta ficha. As classificações ficam ligadas à posição de cada indicador (1.º, 2.º…). Continuar?'))return;
    d.ind=L;save();closeDrawer();vCriterios()}}
{const _vCG=vCriterios;vCriterios=function(){const r=_vCG.apply(this,arguments);try{const t=T();if(!t)return r;const D=t.dominios||[];
    $$('#view tr[data-k]').forEach(tr=>{const k=+tr.dataset.k;const d=D[k];if(!d||!d.ger)return;const I=cgInd(d);const n=tr.cells.length;
      const h=I.map(x=>`<tr class="cgir"><td></td><td colspan="${Math.max(1,n-1)}"><span class="cgii">${esc(x)}</span></td></tr>`).join('')+
        `<tr class="cgir cgirb"><td></td><td colspan="${Math.max(1,n-1)}"><span class="mut">${I.length?I.length+' indicadores · classificados de 0 a 20 na ficha do aluno (Avaliação Final)':'Sem indicadores — classificado diretamente na Avaliação Final'}</span> <button type="button" class="btn sm" data-cgind="${k}">${ic('pencil',13)} ${I.length?'Editar indicadores':'Adicionar indicadores'}</button></td></tr>`;
      tr.insertAdjacentHTML('afterend',h)});
    $$('#view [data-cgind]').forEach(b=>b.onclick=()=>cgIndDlg(t,+b.dataset.cgind))}catch(e){console.warn(e)}return r};if(go._f)go._f.criterios=vCriterios}
