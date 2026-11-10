/* ---- Pauta do módulo ---- */
function profPautaDlg(t,mid){const m=profMod(t,mid);if(!m)return;if(!profTem(m)){profModeloDlg(t,mid,true);return}const al=alunosAval(t);const D=m.av.dominios;const SE=D.filter(d=>d.grupo==='Saber Estar'),SF=D.filter(d=>d.grupo==='Saber Fazer');
  const U=unidMod(t);const f1=v=>v==null?'—':String(Math.round(v*10)/10).replace('.',',');
  const linhas=al.map(a=>{const nd=profNotaDec(t,m,a.id);const fin=notaMod(t,a.id,m.id);const s=profSit(t,m,a.id);return {a,nd,fin,s}});
  const fins=linhas.map(x=>x.fin).filter(v=>v!=null);const esc4=[[0,9],[10,13],[14,16],[17,20]].map(([a,b])=>fins.filter(v=>v>=a&&v<=b).length);
  openDrawer('Pauta — '+(m.cod?m.cod+' · ':'')+m.nome,`<div class="ed ppauta">
    <div class="pphd"><span><b>${esc(t.nome)}</b> · ${esc(t.disciplina)}</span><span class="mut">${esc(U.s)} ${esc(m.cod||'')}${m.horas?' · '+esc(m.horas)+' h':''}</span><span class="sp1"></span>
      <button type="button" class="btn sm" id="pp-cfg">${ic('sliders',14)} Elementos e Pesos</button><button type="button" class="btn sm" id="pp-pdf">${ic('file',14)} Exportar PDF</button><button type="button" class="btn sm" id="pp-ins">${ic('clipboard',14)} Instrumentos</button></div>
    <p class="hint" style="margin:6px 0 10px">Saber Estar <b>30 %</b> (${SE.map(d=>esc(d.nome)+' '+d.peso+'%').join(' · ')}) + Saber Fazer <b>${SF.reduce((s,d)=>s+(+d.peso||0),0)} %</b> (${SF.map(d=>esc(d.nome)+' '+d.peso+'%').join(' · ')}). Nota final arredondada às unidades; abaixo de 10 → <b>Exame</b>.</p>
    <div class="tblw"><table class="lst pptb"><thead><tr><th>N.º</th><th style="text-align:left">Formando</th>${SE.map(d=>`<th title="${esc(d.nome)}">${esc(d.ab)}<br><small>${d.peso}%</small></th>`).join('')}${SF.map(d=>`<th title="${esc(d.nome)}">${esc(d.ab)}<br><small>${d.peso}%</small></th>`).join('')}<th>Nota</th><th>Final</th><th>Situação</th><th title="Mecanismo de Recuperação (faltas acima de 10 % das horas)">MRA</th><th>Medidas</th><th></th></tr></thead><tbody>
    ${linhas.map(({a,nd,fin,s})=>`<tr data-a="${a.id}"><td>${esc(numAl(a))}</td><td style="text-align:left"><b>${esc(a.nome)}</b></td>${SE.map(d=>`<td>${f1(profAreaVal(t,m,a.id,d.id))}</td>`).join('')}${SF.map(d=>`<td>${f1(profAreaVal(t,m,a.id,d.id))}</td>`).join('')}
      <td>${f1(nd)}</td><td><b class="${fin!=null&&fin<10?'neg':''}">${fin==null?'—':fin}</b></td><td><span class="tag ${s.k==='ok'?'ok':s.k==='exame'?'bad':s.k==='pend'?'w':''}">${s.t}</span></td>
      <td>${(()=>{const r=profMra(t,m,a);return r.ex||r.F?`<button type="button" class="btn sm ${r.ex&&!(r.F&&r.F.guardada)?'pri':''}" data-ppmra="${a.id}" title="${r.f} h de faltas · limite ${r.lim} h">${r.ex?'+'+r.ex+' h':'ok'} · ${r.F?(r.F.guardada?'ficha ✓':'rascunho'):'sem ficha'}</button>`:'<span class="mut">—</span>'})()}</td>
      <td>${(()=>{const v=profMed(t,a.id,m.id);const ef=profMedEf(t,m,a);const au=ef.src==='mra'?(ef.v==='exame'?'MRA: Sim — Exame':'MRA: Sim — Pendente'):'Não';return `<select data-ppm="${a.id}" aria-label="Medidas compensatórias de ${esc(a.nome)}"><option value="" ${!v?'selected':''}>${au}</option>${ef.src==='mra'?`<option value="nao" ${v==='nao'?'selected':''}>Não</option>`:''}<option value="exame" ${v==='exame'?'selected':''}>Sim — Exame</option><option value="pendente" ${v==='pendente'?'selected':''}>Sim — Pendente</option></select>`})()}</td>
      <td><button type="button" class="btn sm" data-ppf="${a.id}">${ic('user',13)} Atitudes</button></td></tr>`).join('')}</tbody></table></div>
    <div class="ppst"><span>Formandos: <b>${al.length}</b></span><span>Média: <b>${fins.length?f1(fins.reduce((x,y)=>x+y,0)/fins.length):'—'}</b></span><span>0–9: <b>${esc4[0]}</b></span><span>10–13: <b>${esc4[1]}</b></span><span>14–16: <b>${esc4[2]}</b></span><span>17–20: <b>${esc4[3]}</b></span><span>Exames: <b>${linhas.filter(x=>x.s.k==='exame').length}</b></span></div></div>`);
  $$('#dw-b [data-ppm]').forEach(s=>s.onchange=()=>{t.medComp=t.medComp||{};const o=t.medComp[s.dataset.ppm]=t.medComp[s.dataset.ppm]||{};if(s.value)o[m.id]=s.value;else delete o[m.id];const F=((mraM(t)[m.id])||{})[s.dataset.ppm];if(F&&(s.value==='exame'||s.value==='nao'||s.value==='pendente'))F.exame=s.value==='exame'?'Sim':'Não';save();profPautaDlg(t,mid)});
  $$('#dw-b [data-ppmra]').forEach(b=>b.onclick=()=>{const a=t.alunos.find(x=>x.id===b.dataset.ppmra);if(!a)return;closeDrawer();modEscolher(t,m.id);mraAbrir(t,m,a)});
  $$('#dw-b [data-ppf]').forEach(b=>b.onclick=()=>profAtitDlg(t,mid,b.dataset.ppf));
  $('#pp-cfg').onclick=()=>profModeloDlg(t,mid);$('#pp-pdf').onclick=()=>profPautaPdf(t,mid);
  $('#pp-ins').onclick=()=>{closeDrawer();modEscolher(t,m.id);UI.inst=null;go('instrumentos')}}
/* ---- Elementos e pesos ---- */
function profModeloDlg(t,mid,novo){const m=profMod(t,mid);if(!m)return;const E=((m.av&&m.av.prof&&m.av.prof.elems)||[{tipo:'Trabalho Prático',peso:40},{tipo:'Teste Escrito',peso:30}]).map(e=>({...e}));
  const draw=()=>{const s=E.reduce((a,e)=>a+(+e.peso||0),0);
    openDrawer('Avaliação do Módulo — Elementos e Pesos',`<div class="ed">
      <p class="hint" style="margin-top:0">${novo?'Este módulo ainda não tem o modelo de avaliação do ensino profissional. ':''}<b>Saber Estar 30 %</b> é fixo (Empenho e Responsabilidade 10 %, Autonomia 7 %, Atitudes e Comportamento 8 %, Relações Interpessoais 5 %, avaliados por 18 indicadores de 0 a 20). Defina os elementos do <b>Saber Fazer</b>: a soma tem de dar <b>70 %</b>.</p>
      <table class="lst"><thead><tr><th>#</th><th>Elemento</th><th style="width:110px">Peso (%)</th><th></th></tr></thead><tbody>${E.map((e,k)=>`<tr><td>${k+1}</td><td><select data-pet="${k}">${PROF_ELEM_TIPOS.map(x=>`<option ${x===e.tipo?'selected':''}>${x}</option>`).join('')}</select></td><td><input type="number" min="0" max="70" step="1" data-pep="${k}" value="${e.peso}"></td><td>${E.length>1?`<button type="button" class="btn sm ico dng" data-pex="${k}" aria-label="Retirar">${ic('trash',13)}</button>`:''}</td></tr>`).join('')}</tbody></table>
      <div class="row" style="gap:8px;margin-top:8px"><button type="button" class="btn sm" id="pe-add" ${E.length>=10?'disabled':''}>${ic('plus',13)} Elemento</button><span class="sp1"></span><span class="tag ${s===70?'ok':'bad'}" id="pe-sum">Saber Fazer: ${s} %${s===70?'':' (tem de ser 70 %)'}</span></div>
      <label class="chk" style="margin-top:12px"><input type="checkbox" id="pe-all"> Aplicar a todos os ${esc(unidMod(t).p.toLowerCase())} desta disciplina</label>
      <div class="row" style="margin-top:14px;gap:8px"><span class="sp1"></span><button type="button" class="btn" id="pe-can">Cancelar</button><button type="button" class="btn pri" id="pe-ok" ${s===70?'':'disabled'}>${ic('check',14)} Guardar</button></div></div>`);
    $$('#dw-b [data-pet]').forEach(x=>x.onchange=()=>{E[+x.dataset.pet].tipo=x.value});
    $$('#dw-b [data-pep]').forEach(x=>x.onchange=()=>{const v=Math.max(0,Math.min(70,Math.round(+x.value||0)));E[+x.dataset.pep].peso=v;x.value=v;const s2=E.reduce((a,e)=>a+(+e.peso||0),0);const sm=$('#pe-sum');sm.className='tag '+(s2===70?'ok':'bad');sm.textContent='Saber Fazer: '+s2+' %'+(s2===70?'':' (tem de ser 70 %)');$('#pe-ok').disabled=s2!==70});
    $$('#dw-b [data-pex]').forEach(x=>x.onclick=()=>{E.splice(+x.dataset.pex,1);draw()});
    $('#pe-add').onclick=()=>{E.push({tipo:'Teste Escrito',peso:0});draw()};$('#pe-can').onclick=()=>closeDrawer();
    $('#pe-ok').onclick=()=>{const todos=$('#pe-all').checked;(todos?t.modulos:[m]).forEach(mm=>profAplicar(t,mm,E.map(e=>({...e,id:mm===m?e.id:null}))));audit('Avaliação','Modelo do ensino profissional',(todos?'todos os módulos':m.nome)+' · '+E.map(e=>e.tipo+' '+e.peso+'%').join(', '));closeDrawer();toast('Modelo guardado','ok');go(VIEW);setTimeout(()=>profPautaDlg(t,mid),60)}};
  draw()}
/* ---- Ficha de atitudes + síntese ---- */
function profGenAl(a){return a&&(a.genero==='F'||a.genero==='M')?a.genero:guessGen(a&&a.nome)}
function profGenProf(){try{const p=perfil();if(p&&(p.genero==='F'||p.genero==='M'))return p.genero}catch(_){}return guessGen(String(S.cfg.professor||'').replace(/^prof\S*\s+/i,''))}
function profBanda(v){return v<=5?0:v<=9?1:v<=14?2:v<=17?3:4}
function profSintese(a,vals){const B=PROF_SINT[profGenAl(a)+profGenProf()]||PROF_SINT.MM;const nm=String(a.nome||'').trim().split(/\s+/)[0]||'';const art=profGenAl(a)==='F'?'A':'O';
  const P=vals.map((v,k)=>v==null||v===''?'':(B[k]||[])[profBanda(+v)]||'').filter(Boolean);if(!P.length)return '';
  let s=art+' '+nm+' '+P.join(' ');s=s.replace(/\s+/g,' ').replace(/\s+([,.;])/g,'$1').replace(/,\s*\./g,'.').replace(/([.!?])\s+([a-zà-ú])/g,(m,p,c)=>p+' '+c.toUpperCase()).trim();if(!/[.!?]$/.test(s))s=s.replace(/,$/,'')+'.';return s}
function profAtitDlg(t,mid,aid){const m=profMod(t,mid);const a=t.alunos.find(x=>x.id===aid);if(!m||!a)return;const ia=m.av.instrumentos.find(i=>i.profAtt);if(!ia)return;ia.notas=ia.notas||{};const n=ia.notas[aid]=ia.notas[aid]||{};const L=profIndList();
  const draw=()=>{const vals=ia.itens.map(it=>num(n[it.id]));const area=g=>{const vv=ia.itens.map(it=>num(n[it.id]));const v=ia.itens.map((it,q)=>({it,q})).filter(x=>x.it.dom==='pa_'+g.k).map(x=>vv[x.q]).filter(v=>v!=null);return v.length?Math.round(v.reduce((p,q)=>p+q,0)/v.length):null};
    const falta=vals.filter((v,q)=>v==null&&!/pessoal não docente/i.test(L[q].n)).length;const sx=profSintese(a,vals);
    openDrawer('Atitudes e Valores — '+a.nome,`<div class="ed patt">
      <p class="hint" style="margin-top:0">${esc(m.cod?m.cod+' · ':'')}${esc(m.nome)} · indicadores de <b>0 a 20</b>. Cada área = média arredondada dos seus indicadores.</p>
      ${PROF_ATIT.map(g=>`<div class="pag"><div class="pagh"><b>${esc(g.nome)}</b><span class="mut">${g.peso} %</span><span class="sp1"></span><span class="tag" id="pa-ar-${g.k}">${area(g)??'—'}</span></div>
        ${ia.itens.map((it,q)=>({it,q})).filter(x=>x.it.dom==='pa_'+g.k).map(({it,q})=>`<label class="pai"><span>${esc(it.rot)}</span><input type="number" min="0" max="20" step="1" inputmode="numeric" data-pai="${it.id}" value="${vals[q]??''}" aria-label="${esc(it.rot)}"></label>`).join('')}</div>`).join('')}
      <h3 style="margin-top:14px">${ic('pen',15)} Síntese Descritiva</h3>
      <p class="hint" id="pa-fl" ${falta?'':'hidden'}>Faltam <b>${falta}</b> indicadores para a síntese ficar completa.</p>
      <textarea id="pa-sx" rows="6" readonly>${esc(sx)}</textarea>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button type="button" class="btn sm" id="pa-cp">${ic('copy',13)} Copiar</button><button type="button" class="btn sm" id="pa-obs">${ic('plus',13)} Guardar nas Observações do Aluno</button><span class="sp1"></span><button type="button" class="btn sm" id="pa-prev">‹ Anterior</button><button type="button" class="btn sm" id="pa-next">Seguinte ›</button><button type="button" class="btn pri" id="pa-ok">${ic('check',14)} Concluir</button></div></div>`);
    $$('#dw-b [data-pai]').forEach(i=>i.onchange=()=>{let v=i.value.trim();if(v===''){delete n[i.dataset.pai]}else{v=Math.max(0,Math.min(20,Math.round(+v.replace(',','.'))));if(isNaN(v))return;n[i.dataset.pai]=v;i.value=v}save();const vs=ia.itens.map(it=>num(n[it.id]));PROF_ATIT.forEach(g=>{const e=$('#pa-ar-'+g.k);if(e)e.textContent=area(g)??'—'});const fl=vs.filter((v,q)=>v==null&&!/pessoal não docente/i.test(L[q].n)).length;const fe=$('#pa-fl');if(fe){fe.hidden=!fl;fe.innerHTML='Faltam <b>'+fl+'</b> indicadores para a síntese ficar completa.'}$('#pa-sx').value=profSintese(a,vs)});
    $('#pa-cp').onclick=()=>{try{navigator.clipboard.writeText($('#pa-sx').value);toast('Síntese copiada','ok')}catch(_){}};
    $('#pa-obs').onclick=()=>{const sx2=$('#pa-sx').value;if(!sx2)return;a.obs=(a.obs?a.obs+'\n\n':'')+(m.cod?m.cod+' — ':'')+sx2;save();toast('Síntese acrescentada às observações','ok')};
    const al=alunosAval(t);const k=al.findIndex(x=>x.id===aid);
    $('#pa-prev').disabled=k<=0;$('#pa-next').disabled=k>=al.length-1;$('#pa-prev').onclick=()=>profAtitDlg(t,mid,al[k-1].id);$('#pa-next').onclick=()=>profAtitDlg(t,mid,al[k+1].id);
    $('#pa-ok').onclick=()=>profPautaDlg(t,mid)};
  draw()}
/* ---- PDF da pauta ---- */
function profPautaPdf(t,mid){const m=profMod(t,mid);const al=alunosAval(t);const D=m.av.dominios;const f1=v=>v==null?'—':String(Math.round(v*10)/10).replace('.',',');const e=escolaDe(t);
  const linhas=al.map(a=>{const fin=notaMod(t,a.id,m.id);const s=profSit(t,m,a.id);return [numAl(a),a.nome,...D.map(d=>f1(profAreaVal(t,m,a.id,d.id))),f1(profNotaDec(t,m,a.id)),fin==null?'—':String(fin),s.t,(({exame:'Sim — Exame',pendente:'Sim — Pendente'})[profMedEf(t,m,a).v]||'Não')+(profMedEf(t,m,a).src==='mra'?' (MRA)':'')]});
  const fins=al.map(a=>notaMod(t,a.id,m.id)).filter(v=>v!=null);const n=D.length;const w=.5/(n+2);
  pdfDocumento({titulo:'Grelha de Avaliação Final '+(unidMod(t).art==='a'?'da':'do')+' '+(unidMod(t).s),subtitulo:(m.cod?m.cod+' — ':'')+m.nome,escola:e,turma:t,paisagem:true,
    blocos:[{kv:[['Formador(a)',profNome(S.cfg.professor)||'—'],['Curso',t.curso||t.nome],['Disciplina',t.disciplina],[unidMod(t).s,(m.cod?m.cod+' — ':'')+m.nome+(m.horas?' ('+m.horas+' h)':'')],['Ano letivo',(A()||{}).nome||''],...(projetoDe(t)?[['Projeto n.º',projetoDe(t)]]:[])]},
      {p:'Saber Estar 30 % ('+D.filter(d=>d.grupo==='Saber Estar').map(d=>d.nome+' '+d.peso+'%').join(', ')+') · Saber Fazer 70 % ('+D.filter(d=>d.grupo==='Saber Fazer').map(d=>d.nome+' '+d.peso+'%').join(', ')+')',sz:8.5},
      {tabela:{cab:['N.º','Formando',...D.map(d=>d.ab+' '+d.peso+'%'),'Nota','Final','Situação','Medidas'],larg:[.05,.25,...D.map(()=>w),w,w,.1,.1].map(x=>x),linhas}},
      {kv:[['N.º de formandos',String(al.length)],['Média',fins.length?f1(fins.reduce((x,y)=>x+y,0)/fins.length):'—'],['0–9 / 10–13 / 14–16 / 17–20',[[0,9],[10,13],[14,16],[17,20]].map(([a,b])=>fins.filter(v=>v>=a&&v<=b).length).join(' / ')],['Exames',String(al.filter(a=>profSit(t,m,a.id).k==='exame').length)]]}],
    assinaturas:[profAssin(profGenProfX()==='F'?'A Formadora':profGenProfX()==='M'?'O Formador':'O(A) Formador(a)'),'A Direção Pedagógica']},'Grelha de Avaliação - '+(m.cod||'')+' '+m.nome);audit('Avaliação','Pauta do módulo (PDF)',m.nome)}
/* ---- entrada na vista de módulos ---- */
{const _vMp=vModulos;vModulos=function(){const r=_vMp.apply(this,arguments);try{const t=T();if(ehProfT(t))profModulosUI(t)}catch(e){console.warn(e)}return r}}
function profModulosUI(t){if(t.porModulo){let n=0;(t.modulos||[]).forEach(m=>{if(!profTem(m)&&!(m.av&&(m.av.instrumentos||[]).some(i=>Object.values(i.notas||{}).some(o=>Object.keys(o||{}).length)))){profAplicar(t,m);n++}});if(n)save()}document.querySelectorAll('#view [data-med]').forEach(b=>{const mid=b.dataset.med;if(b.parentElement.querySelector('[data-mpauta]'))return;const m=profMod(t,mid);b.insertAdjacentHTML('beforebegin',`<button class="btn sm ${profTem(m)?'pri':''}" data-mpauta="${mid}" title="Avaliação do módulo: Saber Estar 30 % + Saber Fazer 70 %">${ic('grid',14)} Avaliação</button>`)});
  document.querySelectorAll('#view [data-mpauta]').forEach(b=>b.onclick=()=>profPautaDlg(t,b.dataset.mpauta));
  const bx=$('#barx');if(bx&&!bx.querySelector('#b-pimp')){bx.insertAdjacentHTML('beforeend',`<button type="button" class="btn" id="b-pimp">${ic('upload',15)} Importar Grelha (Excel)…</button>`);$('#b-pimp').onclick=()=>profImportarEscolher()}}
function profImportarEscolher(){const f=document.createElement('input');f.type='file';f.accept='.xlsm,.xlsx';f.onchange=()=>{if(f.files[0])profImportarGrelha(f.files[0])};f.click()}
/* ---- leitura em bruto de um .xlsx/.xlsm (valores calculados guardados no ficheiro) ---- */
async function lerXlsxCru(file){const z=await unzip(await file.arrayBuffer());const wbPath='xl/workbook.xml';const wb=xmlDoc(await z.text(wbPath)||'<x/>');const wbRels=await relsDe(z,wbPath);
  let sst=[];const ss=await z.text('xl/sharedStrings.xml');if(ss)sst=tagsNS(xmlDoc(ss),'si').map(si=>tagsNS(si,'t').map(t=>t.textContent).join(''));const F={};
  for(const sh of tagsNS(wb,'sheet')){const rid=sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sh.getAttribute('r:id');const rel=wbRels[rid];if(!rel)continue;const sx=await z.text(rel.target);if(!sx)continue;const doc=xmlDoc(sx);const C={};
    tagsNS(doc,'c').forEach(c=>{const ref=c.getAttribute('r');if(!ref)return;const t=c.getAttribute('t');let v;if(t==='inlineStr')v=tagsNS(c,'t').map(x=>x.textContent).join('');else{const ve=tagsNS(c,'v')[0];if(!ve)return;v=ve.textContent;if(t==='s')v=sst[+v]||'';else if(t==='b')v=v==='1';else if(t!=='str'&&t!=='e'&&v!==''&&!isNaN(+v))v=+v}C[ref]=v});
    F[sh.getAttribute('name')]=C}return F}
/* ---- importação da «Grelha de Avaliação» (Excel com VBA) ---- */
async function profImportarGrelha(file){ocupado&&ocupado('A ler '+file.name+'…');let F;try{F=await lerXlsxCru(file)}catch(e){try{livre&&livre()}catch(_){}return toast('Não foi possível ler o ficheiro: '+e.message,'erro')}try{livre&&livre()}catch(_){}
  const P=F['Avaliação Final Modular'];if(!P)return toast('Este Excel não é uma Grelha de Avaliação (falta a folha «Avaliação Final Modular»).','aviso');
  const g=k=>{const v=P[k];return v==null?'':typeof v==='string'?v.trim():v};const txt=k=>String(g(k)||'').trim();
  const nE=Math.max(2,Math.min(10,+g('E49')||2));const COLS=['Q','R','P','O','N','M','L','K','J','I'];
  const elems=[];for(let k=1;k<=nE;k++){const tipo=k===1?txt('C38'):k===2?txt('C39'):txt('D'+(37+k));const peso=Math.round((+g('E'+(37+k))||0)*100);elems.push({id:'e'+uid(),tipo:PROF_ELEM_TIPOS.find(x=>normT(x)===normT(tipo))||tipo||'Outros',peso,col:COLS[k-1]})}
  const fichas={};Object.entries(F).forEach(([n,C])=>{if(typeof C.D26==='number'&&typeof C.D39==='number'&&n!=='Quadro - Atitudes e Valores'&&C.K11!=null&&String(C.K11).trim()){const k=String(C.K11||'').trim();if(k)fichas['p'+k]=C;if(C.D11)fichas['n'+normT(String(C.D11))]=C}});
  const IND=[18,19,20,21,22,23,24,25,27,28,29,31,32,33,34,36,37,38];
  const TE=F['Avaliação - Teste Escrito'],TP=F['Trabalho Prático'];const colL=n=>{let s='';n++;while(n>0){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s};
  const nTE=Math.max(1,Math.min(30,+((TE||{}).E370)||0));
  const linhas=[];for(let r=9;r<=33;r++){const nome=txt('D'+r);if(!nome||nome==='#N/A')continue;const inc=g('A'+r);if(inc===false)continue;const proc=txt('C'+r);
    const ficha=fichas['p'+proc]||fichas['n'+normT(nome)];const temFicha=!!ficha;const ind=ficha?IND.map(q=>{const v=ficha['D'+q];return v===''||v==null||isNaN(+v)?null:+v}):null;
    const ate=['E','F','G','H'].map(c=>{const v=g(c+r);return v===''||isNaN(+v)?null:+v});
    const el=elems.map(e=>{const v=g(e.col+r);return v===''||v==null||isNaN(+v)?null:+v});
    const te=TE?Array.from({length:nTE},(_,q)=>{const v=TE[colL(4+q)+r];return v===''||v==null||isNaN(+v)?null:+v}):null;
    const tp=TP?Array.from({length:10},(_,q)=>{const v=TP[colL(4+q)+r];return v===''||v==null||isNaN(+v)?null:+v}):null;
    const med=txt('V'+r);linhas.push({r,temFicha,nome,proc,ind,ate,el,te,tp,med:/exame/i.test(med)?'exame':/pendente/i.test(med)?'pendente':''})}
  const temTE=TE&&/^sim/i.test(txt('E50'))&&linhas.some(x=>x.te&&x.te.some(v=>v!=null)),temTP=TP&&/^sim/i.test(txt('E457'))&&linhas.some(x=>x.tp&&x.tp.some(v=>v!=null));
  const info={escola:txt('C3'),formador:txt('F3'),curso:txt('F4'),disciplina:txt('F5'),modulo:txt('R5'),tipologia:txt('E51'),projeto:txt('R4'),elems,linhas,temTE,temTP,TE,TP,nTE,colL,ficheiro:file.name};
  profImportarDlg(info)}
function profImportarDlg(I){const a=A()||novoAno(anoAuto());const discN=I.disciplina.replace(/^\d+\s*[-–]\s*/,'').trim();const cursoCod=(I.curso.match(/^([A-Z]?\d+)\s*[-–]/)||[])[1]||'';const cursoN=I.curso.replace(/^[A-Z]?\d+\s*[-–]\s*/,'').trim();
  const modCod=(I.modulo.match(/^([0-9A-Z]+)\s*[-–]/)||[])[1]||'';const modN=I.modulo.replace(/^[0-9A-Z]+\s*[-–]\s*/,'').trim();
  const cand=a.turmas.filter(t=>ehProfT(t)&&normT(t.disciplina).includes(normT(discN).slice(0,12)));
  const nI=I.linhas.length,nF=I.linhas.filter(x=>x.ind&&x.ind.some(v=>v!=null)).length;
  openDrawer('Importar Grelha de Avaliação',`<div class="ed">
    <p class="hint" style="margin-top:0">${ic('upload',14)} ${esc(I.ficheiro)}</p>
    <div class="kvs"><div><span class="mut">Escola</span><b>${esc(I.escola||'—')}</b></div><div><span class="mut">Curso</span><b>${esc(I.curso||'—')}</b></div><div><span class="mut">Disciplina</span><b>${esc(I.disciplina||'—')}</b></div><div><span class="mut">${esc(I.tipologia==='Por UFCD'?'UFCD':'Módulo')}</span><b>${esc(I.modulo||'—')}</b></div><div><span class="mut">Formandos</span><b>${nI}</b> <span class="mut">(${nF} com fichas de atitudes)</span></div><div><span class="mut">Saber Fazer</span><b>${I.elems.map(e=>esc(e.tipo)+' '+e.peso+'%').join(' · ')}</b></div></div>
    ${nF<nI?`<div class="alert w">${ic('alert',14)} ${nI-nF} formando(s) sem indicadores de atitudes preenchidos no Excel. Enquanto o Saber Estar não for preenchido, a nota mostrada no EduSpruce conta só com o Saber Fazer (no Excel contava 0).</div>`:''}${I.temTE?`<p class="hint">${ic('check',13)} Grelha do Teste Escrito com ${I.nTE} itens — importada item a item e convertida para 0–20.</p>`:''}${I.temTP?`<p class="hint">${ic('check',13)} Grelha do Trabalho Prático (10 pontos) — importada ponto a ponto.</p>`:''}
    ${I.elems.reduce((s,e)=>s+e.peso,0)!==70?`<div class="alert w">${ic('alert',14)} Os pesos do Saber Fazer somam ${I.elems.reduce((s,e)=>s+e.peso,0)} % (deviam ser 70 %). Pode corrigir depois em «Elementos e Pesos».</div>`:''}
    <label for="im-t">Turma de destino</label><select id="im-t">${cand.map(t=>`<option value="${t.id}">${esc(t.nome+' · '+t.disciplina)}</option>`).join('')}<option value="">Criar nova turma: ${esc((cursoCod||cursoN)+' · '+discN)}</option></select>
    <p class="hint">Os formandos são encontrados pelo n.º de processo ou pelo nome; os que faltarem são acrescentados. ${esc(I.tipologia==='Por UFCD'?'A UFCD':'O módulo')} ${esc(modCod)} é criad${I.tipologia==='Por UFCD'?'a':'o'} se ainda não existir. Classificações já lançadas nesse módulo são substituídas pelas do Excel.</p>
    <div class="row" style="margin-top:12px;gap:8px"><span class="sp1"></span><button type="button" class="btn" id="im-can">Cancelar</button><button type="button" class="btn pri" id="im-ok">${ic('check',14)} Importar</button></div></div>`);
  $('#im-can').onclick=()=>closeDrawer();
  $('#im-ok').onclick=()=>{try{const tid=$('#im-t').value;let t=a.turmas.find(x=>x.id===tid);
      if(!t){let e=escolas().find(x=>normT(x.escola||'')===normT(I.escola||''))||(normT(nomeEscola(S.cfg))===normT(I.escola||'')?S.cfg:null)||escolas().find(x=>tipoEscola(x)==='profissional');if(!e&&I.escola){e={id:uid(),escola:I.escola,tipoEscola:'profissional'};escolas().push(e)}
        const nomeT=cursoCod||cursoN||'Turma';const base=a.turmas.find(x=>ehProfT(x)&&normTurma(x.nome)===normTurma(nomeT)&&escolaDe(x)===(e||S.cfg));
        const af=(()=>{const m=I.curso.match(/\((\d{2})\s*-\s*\d{2}\)/);const y=+((a.nome||'').match(/^(\d{4})/)||[])[1];if(!m||!y)return '';const k=y-(2000+ +m[1])+1;return k>=1&&k<=3?k+'.º':''})();
        t={id:uid(),nome:nomeT,codigo:cursoCod,anoEsc:base?base.anoEsc:'',ciclo:'sec',oferta:'profissional',curso:base&&base.curso||cursoN,anoForm:base&&base.anoForm||af,disciplina:discN||I.disciplina,codDisc:(I.disciplina.match(/^(\d+)/)||[])[1]||'',escola:e&&e!==S.cfg?e.id:undefined,dominios:[],mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[],modulos:[]};if(!t.escola)delete t.escola;
        if(base){if(base.origens)t.origens=base.origens.slice();t.alunos=JSON.parse(JSON.stringify(base.alunos)).map(x=>Object.assign(x,{id:uid()+Math.random().toString(36).slice(2,5),autoav:{},obsPer:{},sintese:{}}))}
        a.turmas.push(t)}
      {const d=t.disciplina;if(!minhasDisc().includes(d)){if(DISCIPLINAS.some(x=>x.n===d))discAno().push(discKey(d,'sec'));else discExtraAno().push(d)}}
      if(I.projeto&&!projetoDe(t))projM(a)[normTurma(t.nome)]=I.projeto;
      /* formandos: na turma e nas outras disciplinas da mesma turma */
      const irm=a.turmas.filter(x=>x!==t&&ehProfT(x)&&grpT(x)===grpT(t));
      const ids=I.linhas.map(L=>{const ach=T2=>T2.alunos.find(y=>L.proc&&String(y.processo||'')===L.proc)||T2.alunos.find(y=>normT(y.nome)===normT(L.nome));let x=ach(t);if(!x){x=novoAluno(t,L.nome);x.processo=L.proc||'';t.alunos.push(x)}else if(L.proc&&!x.processo)x.processo=L.proc;x.frequenta=true;
        irm.forEach(T2=>{if(!ach(T2)){const y=novoAluno(T2,L.nome);y.processo=L.proc||'';T2.alunos.push(y)}});return x.id});
      t.modulos=t.modulos||[];let m=t.modulos.find(x=>modCod&&String(x.cod||'')===modCod)||t.modulos.find(x=>normT(x.nome)===normT(modN));if(!m){m={id:uid(),cod:modCod,nome:modN||I.modulo,horas:'',ini:'',fim:''};t.modulos.push(m)}
      if(!t.porModulo)modAtivar(t);m.av=m.av||null;profAplicar(t,m,I.elems.map(e=>({id:e.id,tipo:e.tipo,peso:e.peso})));modEscolher(t,m.id);
      const av=m.av;const ia=av.instrumentos.find(i=>i.profAtt);ia.notas={};
      I.linhas.forEach((L,q)=>{const aid=ids[q];const n=ia.notas[aid]={};
        if(L.ind&&L.ind.some(v=>v!=null))ia.itens.forEach((it,k)=>{if(L.ind[k]!=null)n[it.id]=L.ind[k]});
        else if(!L.temFicha&&L.ate.some(v=>v>0))PROF_ATIT.forEach((gp,gi)=>{const v=L.ate[gi];if(v!=null)ia.itens.filter(it=>it.dom==='pa_'+gp.k).forEach(it=>n[it.id]=v)});
        if(L.med){t.medComp=t.medComp||{};(t.medComp[aid]=t.medComp[aid]||{})[m.id]=L.med}});
      I.elems.forEach((e,k)=>{const dom='pf_'+e.id;const ins=av.instrumentos.find(i=>i.profElem===e.id);if(!ins)return;ins.notas={};
        const isTE=e.tipo==='Teste Escrito'&&I.temTE&&!I._teUsado,isTP=e.tipo==='Trabalho Prático'&&I.temTP&&!I._tpUsado;
        if(isTE){I._teUsado=1;ins.itens=Array.from({length:I.nTE},(_,q)=>({id:'te'+q+uid().slice(0,5),rot:String(I.TE[I.colL(4+q)+7]||(q+1)),dom,cot:+I.TE[I.colL(4+q)+8]||0})).filter(x=>x.cot>0)}
        if(isTP){I._tpUsado=1;ins.itens=PROF_TP.map(([n0,c],q)=>({id:'tp'+q+uid().slice(0,5),rot:'Ponto '+(q+1)+' — '+(String(I.TP[I.colL(4+q)+6]||'').replace(/^Ponto \d+\s*-\s*/,'')||n0),dom,cot:+I.TP[I.colL(4+q)+8]||c}))}
        I.linhas.forEach((L,q)=>{const aid=ids[q];const n={};
          if(isTE){ins.itens.forEach((it,j)=>{const v=L.te[j];if(v!=null)n[it.id]=Math.min(v,it.cot)})}
          else if(isTP){ins.itens.forEach((it,j)=>{const v=L.tp[j];if(v!=null)n[it.id]=Math.min(v,it.cot)})}
          else{const v=L.el[k];if(v!=null){const v2=Math.max(0,Math.min(20,v));if(ins.itens.length===1)n[ins.itens[0].id]=v2;else ins.itens.forEach(it=>n[it.id]=Math.round(v2/20*it.cot*10)/10)}}
          if(Object.keys(n).length)ins.notas[aid]=n})});
      saveNow();audit('Avaliação','Grelha importada do Excel',I.ficheiro+' · '+t.nome+' · '+(m.cod||'')+' '+m.nome);closeDrawer();
      S.turmaAtiva=t.id;save();go('modulos');setTimeout(()=>profPautaDlg(t,m.id),120);toast('Grelha importada: '+I.linhas.length+' formandos','ok')}catch(e){console.error(e);toast('Erro ao importar: '+e.message,'erro')}}}
/* .xlsm/.xlsx arrastado para a app */
{const _iQp=importarQualquer;importarQualquer=async function(f){if(f&&/\.xls[xm]$/i.test(f.name)){try{const F=await lerXlsxCru(f);if(F['Avaliação Final Modular']){return profImportarGrelha(f)}}catch(_){}}return _iQp.apply(this,arguments)}}
/* enunciado nas turmas profissionais: os itens vão para o domínio do próprio elemento */
{const _eDp=enunDlg;enunDlg=function(t,i,R){if(i&&i.profElem&&(i.itens||[])[0]){const d=i.itens[0].dom;R.itens.forEach(x=>{x._dom=d});const r=_eDp.apply(this,arguments);try{$$('#dw-b [data-edom]').forEach(s=>{s.value=d;s.dispatchEvent(new Event('change'))})}catch(_){}return r}return _eDp.apply(this,arguments)}}


/* v0.61 · MRA ligado às medidas compensatórias, na vista Recuperação (MRA) */
{const _vMr=vMra;vMra=function(){const r=_vMr.apply(this,arguments);try{const t=T();if(ehProfT(t)&&t.porModulo){const m=modAtivo(t);if(m&&profTem(m))document.querySelectorAll('#view .mral [data-mraab]').forEach(b=>{const a=t.alunos.find(x=>x.id===b.dataset.mraab);const li=b.closest('li');if(!a||!li||li.querySelector('.mrapp'))return;const f=notaMod(t,a.id,m.id);const sx=profSit(t,m,a.id);const ef=profMedEf(t,m,a);
  const e=li.querySelector('.mrae');if(e)e.insertAdjacentHTML('beforeend',` <span class="tag mrapp ${sx.k==='ok'?'ok':sx.k==='exame'?'bad':sx.k==='pend'?'w':''}" title="Nota do ${esc(unidMod(t).um)}${ef.v?' · medida: '+(ef.v==='exame'?'Sim — Exame':'Sim — Pendente')+(ef.src==='mra'?' (pelo MRA)':''):''}">${f==null?'':f+' · '}${sx.t}</span>`)})}}catch(e){console.warn(e)}return r}}
/* ---- Demonstração: escola profissional extra com todas as vertentes ---- */
function criarDemoProf(a){a=a||A();if(!a)return;const hoje=new Date();const dd=n=>{const d=new Date(hoje);d.setDate(d.getDate()+n);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+(n<0?-1:1));return isoData(d)};
  let sd=20261104;const rnd=()=>{sd=(sd*1103515245+12345)%2147483648;return sd/2147483648};
  const e={id:uid(),escola:'Escola Profissional do Atlântico (demonstração)',tipoEscola:'profissional',concelho:'Horta',demo:true};escolas().push(e);
  const NOMES=[['Alice Furtado Medeiros','F'],['Bruno Silveira Costa','M'],['Carla Ávila Rosa','F'],['Dinis Goulart Leite','M'],['Érica Brum Toste','F'],['Fábio Dutra Moniz','M'],['Graça Pimentel Faria','F'],['Hélio Machado Ponte','M'],['Isabel Resendes Melo','F'],['Jorge Amaral Vieira','M'],['Kátia Botelho Sousa','F'],['Leandro Câmara Raposo','M'],['Mónica Arruda Cabral','F'],['Nelson Tavares Freitas','M']];
  const caps=[.86,.72,.64,.9,.55,.38,.78,.6,.94,.68,.47,.81,.7,.58];
  const base=NOMES.map(([n,g],k)=>({n,g,proc:String(2603100+k*3),cap:caps[k]}));
  const disc=[{d:'Inglês',sig:'ING',mods:[['5','Inglês aplicado ao Turismo — acolhimento',22,-75,-30],['6','Inglês aplicado ao Turismo — informação turística',22,-29,18],['7','Inglês aplicado ao Turismo — reclamações e serviço',24,19,60]],el:[{tipo:'Trabalho Prático',peso:20},{tipo:'Teste Escrito',peso:30},{tipo:'Teste Oral',peso:20}]},
    {d:'Português',sig:'PORT',mods:[['8','Textos dos media e do quotidiano',27,-70,-20],['9','Textos argumentativos',27,-19,30]],el:[{tipo:'Teste Escrito',peso:40},{tipo:'Teste Oral',peso:30}]},
    {d:UFCD_N,sig:'UFCD',mods:[['UFCD 3485','Acolhimento e animação turística',50,-80,-25],['UFCD 3486','Produtos e circuitos turísticos',50,-24,25]],el:[{tipo:'Trabalho Prático',peso:30},{tipo:'Trabalho de Grupo',peso:20},{tipo:'Teste Escrito',peso:20}]}];
  const TT=[];
  disc.forEach((D,di)=>{const t={id:uid(),nome:'TT 2',codigo:'TT2',anoEsc:'11.º',ciclo:'sec',oferta:'profissional',curso:'Técnico de Turismo',anoForm:'2.º',disciplina:D.d,escola:e.id,dominios:[],mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[],instrumentos:[],delegados:{},demo:true};
    base.forEach((b,k)=>{const al=novoAluno(t,b.n);al.genero=b.g;al.generoManual=true;al.num=k+1;al.processo=b.proc;al.contactoAutorizado=true;al.eeNome='Enc. Educação '+(k+1);al.eeContacto='96'+String(1000000+k*7919).slice(0,7);al.email='ee'+(k+1)+'@exemplo.pt';al._cap=b.cap;t.alunos.push(al)});
    t.modulos=D.mods.map(([cod,nome,horas,i0,f0])=>({id:uid(),cod,nome,horas,ini:dd(i0),fim:dd(f0)}));
    a.turmas.push(t);TT.push(t);modAtivar(t);
    t.modulos.forEach((m,mi)=>{profAplicar(t,m,D.el.map(x=>({...x})));try{(m.av.instrumentos||[]).forEach(i=>{const e=m.av.prof.elems.find(x=>x.id===i.profElem);if(e&&e.tipo==='Teste Escrito'&&profTEPlace(i))profEstruturaTE(i,D.d==='Português'?[3,3,1]:[4,2,1],200)})}catch(err){console.warn(err)}const passado=m.fim<isoData(hoje),atual=!passado&&m.ini<=isoData(hoje);if(!passado&&!atual)return;
      const I=m.av.instrumentos;const ia=I.find(i=>i.profAtt);ia.data=m.ini;
      t.alunos.forEach((al,q)=>{const c=al._cap;
        if(passado||q%3)ia.notas[al.id]=Object.fromEntries(ia.itens.map((it,k)=>[it.id,Math.max(4,Math.min(20,Math.round((c+(rnd()-.5)*.25+(k===0&&q===5?-.3:0))*20)))]));
        I.filter(i=>i.profElem).forEach((ins,ei)=>{if(atual&&ei>0)return;ins.data=dd(Math.round(-(passado?40:10)+ei*4+mi*2));const n={};ins.itens.forEach(it=>{const v=Math.max(0,Math.min(1,c+(rnd()-.5)*.3-(ei===1?.05:0)));n[it.id]=Math.round(v*it.cot*2)/2});if(!(atual&&q===7))ins.notas[al.id]=n})});
      I.forEach(i=>{if(i.data<m.ini||i.data>m.fim)i.data=m.ini});
      /* Teste de Produção Oral (Inglês): níveis da grelha da Parte D */
      try{const io=I.find(i=>i.itens.some(it=>it.oralLig));if(io&&profLingua(t)){modEscolher(t,m.id);const o=oralM(t);const R={};const NV=['0','N1','N2','N3','N4'];t.alunos.forEach((al,q)=>{if(atual&&q%2)return;const nv=()=>NV[Math.max(1,Math.min(4,Math.round(al._cap*4+(rnd()-.5)*1.2)))];R[al.id]={n:Object.fromEntries(ORAL_P.map(p=>[p.k,nv()])),g:'Guião '+(1+q%3)}});o.regsI=o.regsI||{};o.regsI[io.id]=R;
        io.notas={};const it=io.itens.find(x=>x.oralLig);const c=oralCfgDe(o,io.id);Object.entries(R).forEach(([aid,r])=>{const pts=ORAL_P.reduce((s,p)=>s+oralPts(c,p.k,r.n[p.k]),0);io.notas[aid]={[it.id]:Math.round(pts/c.total*it.cot*100)/100}})}}catch(err){console.warn(err)}});
    t.modulos.forEach((m,mi)=>{const M1=(mraM(t)[m.id]=mraM(t)[m.id]||{});if(mi!==0)return;
      /* faltas acima de 10 % das horas → MRA */
      [[5,6],[10,5],[2,2]].forEach(([q,h])=>{const al=t.alunos[q];al.faltasAl=al.faltasAl||[];for(let z=0;z<h;z++)al.faltasAl.push({id:uid(),data:dd(-70+z*5+di),tipo:z%3?'injust':'just',tempos:1,obs:'Demonstração',turma:t.id})});
      try{const al=t.alunos[10];const F=mraFichaNova(t,al,m);F.rows=F.rows.map((r,k)=>({...r,dt:dd(-28+k*2),ativ:'Ficha de recuperação '+(k+1)+' — conteúdos das aulas em falta',parecer:'Realizou com empenho'}));F.guardada=true;F.exame='Não';M1[al.id]=F}catch(err){console.warn(err)}});
    /* medidas compensatórias: uma manual, as do MRA vêm automaticamente */
    t.medComp={[t.alunos[13].id]:{[t.modulos[0].id]:'pendente'}}});
  /* formando transferido a meio do ano (fica a cinzento) */
  TT.forEach(t=>{const al=t.alunos[12];al.movs=[{id:uid(),tipo:'saida',data:dd(-8),escola:'Escola Secundária de Exemplo',concelho:'Ponta Delgada',codigo:'',motivo:'Mudança de residência',q:Date.now()}]});
  projM(a)[normTurma('TT 2')]='DEMO-2030-FSE+-000123';
  ['Inglês','Português'].forEach(d=>{if(!minhasDisc().includes(d))discAno().push(discKey(d,'sec'))});if(!minhasDisc().includes(UFCD_N))discExtraAno().push(UFCD_N);
  /* horário: aulas na escola profissional */
  try{const SL=[495,540,600,645,705,810,855,915];const tm=x=>({ini:x,fim:x+45});a.horProf=a.horProf||{aulas:[],linhas:SL.map(tm),obs:[],obsMap:{},mapa:{}};a.horProf.mapa=a.horProf.mapa||{};
    [[TT[0],'ING',[[3,0],[3,1]],'P1'],[TT[1],'PORT',[[3,3]],'P2'],[TT[2],'UFCD',[[5,5],[5,6]],'Lab. Turismo']].forEach(([t,sig,L,sala])=>L.forEach(([dia,k])=>{const x={dia,...tm(SL[k]),turma:t.nome,sig,sala};a.horProf.aulas.push(x);a.horProf.mapa[chaveAula(x)]=t.id}))}catch(err){console.warn(err)}
  return TT}
{const _cDp=criarDemo;criarDemo=function(){const n0=S.anos.length;const r=_cDp.apply(this,arguments);try{if(S.anos.length>n0){criarDemoProf(S.anos[S.anos.length-1]);saveNow()}}catch(err){console.warn(err)}return r}}

/* v0.62 · Ensino profissional: ficha de correção do Teste Escrito e Teste de Produção Oral (línguas) */
const PROF_LING=/ingl|franc|alem[aã]|espanh|l[ií]ngua estrangeira|comunicar em/i;
const profLingua=t=>!!t&&PROF_LING.test(t.disciplina||'');
const profTEPlace=i=>!!i&&i.profElem&&(i.itens||[]).length===1&&/^Classifica[çc][ãa]o \(0/.test(i.itens[0].rot||'');
/* domínio oral: nas turmas profissionais, só o elemento «Teste Oral» de uma língua (grelha da Parte D) */
{const _dO=domOral;domOral=function(t){if(ehProfT(t)){if(!profLingua(t))return null;return (t.dominios||[]).find(d=>d.grupo==='Saber Fazer'&&/oral/i.test(d.nome||''))||null}return _dO.apply(this,arguments)}}
/* o instrumento do Teste Oral nas línguas fica ligado à grelha da Produção Oral */
{const _pA=profAplicar;profAplicar=function(t,m,elems){const r=_pA.apply(this,arguments);try{if(profLingua(t))(m.av.instrumentos||[]).forEach(i=>{if(!i.profElem)return;const e=(m.av.prof.elems||[]).find(x=>x.id===i.profElem);if(!e||e.tipo!=='Teste Oral')return;if(i.nome==='Teste Oral')i.nome='Teste de Produção Oral';i.tipo='Prova Oral';if(i.itens.length===1&&!Object.keys(i.notas||{}).length){i.itens[0].rot='Produção Oral (grelha da Parte D)';i.itens[0].oralLig=true}})}catch(e){console.warn(e)}return r}}
/* estrutura rápida do teste: grupos × itens, cotação total */
function profEstruturaTE(i,grupos,total){const G=grupos.map(n=>Math.max(1,Math.min(15,Math.round(n)))).slice(0,8);const N=G.reduce((s,n)=>s+n,0);if(!N||N>30)return false;const dom=i.itens[0].dom;const base=Math.floor(total/N*2)/2;let resto=Math.round((total-base*N)*2)/2;const R=['I','II','III','IV','V','VI','VII','VIII'];const L=[];
  G.forEach((n,g)=>{for(let k=0;k<n;k++){let c=base;if(g===G.length-1&&k===n-1)c=Math.round((c+resto)*2)/2;L.push({id:'te'+uid(),rot:(g+1)+'.'+(k+1),niv:[G.length>1?'Grupo '+R[g]:'',(g+1)+'.'+(k+1)].filter(Boolean),dom,cot:c})}});i.itens=L;i.notas={};return true}
function profTEDlg(t,i){openDrawer('Preparar a Ficha de Correção',`<div class="ed">
  <p class="hint" style="margin-top:0">Com os itens e as cotações do teste, cada formando é corrigido pergunta a pergunta, a nota é convertida para <b>0–20</b> e a <b>Análise</b> mostra a ficha de correção (taxa de sucesso por pergunta, negativas, melhor e pior resultado). Pode imprimir as <b>fichas individuais</b> para entregar aos formandos.</p>
  <div class="ptegrid"><button type="button" class="ptec" id="pte-en">${ic('sparkle',22)}<b>Carregar o enunciado</b><small>O EduSpruce lê a tabela de cotações do PDF e cria os itens.</small></button>
  <div class="ptec"><b>${ic('grid',18)} Estrutura rápida</b><label for="pte-g">Itens por grupo <span class="mut">(ex.: 4, 2, 1)</span></label><input id="pte-g" value="4, 3, 1"><label for="pte-c">Cotação total</label><input id="pte-c" type="number" min="10" step="1" value="200"><button type="button" class="btn pri sm" id="pte-ok" style="margin-top:8px">${ic('check',13)} Criar Itens</button><small id="pte-msg"></small></div>
  <button type="button" class="ptec" id="pte-it">${ic('pencil',22)}<b>Escrever os itens à mão</b><small>Abre o editor de Itens e Cotações (até 4 níveis).</small></button>
  <button type="button" class="ptec" id="pte-so">${ic('check',22)}<b>Só a nota final (0–20)</b><small>Sem correção por pergunta. Pode mudar depois.</small></button></div>
  ${Object.keys(i.notas||{}).length?`<div class="alert w">${ic('alert',14)} Já há ${Object.keys(i.notas).length} classificações finais lançadas neste teste. Ao criar itens, terá de as lançar de novo por pergunta.</div>`:''}</div>`);
  $('#pte-en').onclick=()=>{closeDrawer();const z=document.querySelector('#view [data-anxdrop="enunciado"],#view [data-anxu="enunciado"]');if(z)z.click();else toast('Carregue o enunciado no cartão «Enunciado».')};
  $('#pte-ok').onclick=()=>{const G=$('#pte-g').value.split(/[^\d]+/).filter(Boolean).map(Number);const c=+$('#pte-c').value||200;if(Object.keys(i.notas||{}).length&&!confirm('Substituir as classificações finais já lançadas?'))return;if(!profEstruturaTE(i,G,c)){$('#pte-msg').textContent='Indique de 1 a 30 itens no total.';return}delete i.soFinal;saveNow();closeDrawer();UI.instTab='notas';vInstrumento(i.id);toast(i.itens.length+' itens · '+c+' pontos','ok')};
  $('#pte-it').onclick=()=>{closeDrawer();delete i.soFinal;UI.instTab='itens';vInstrumento(i.id)};
  $('#pte-so').onclick=()=>{i.soFinal=true;save();closeDrawer();vInstrumento(i.id)}}
/* fichas individuais de correção (PDF, uma página por formando) */
function profFichasPdf(t,i,soId){const m=modAtivo(t);const max=instMax(i);const al=alunosAval(t).filter(a=>!soId||a.id===soId);const e=escolaDe(t);const f1=v=>String(Math.round(v*10)/10).replace('.',',');const oral=domOral(t);const o=oral?oralM(t):null;
  const B=[];al.forEach((a,k)=>{const est=instAlunoEstado(t,i,a.id);const tot=instTotal(i,a.id);if(k)B.push({pb:1});
    B.push({h:a.nome},{kv:[['N.º',numAl(a)],['Turma',t.nome+' · '+t.disciplina],[unidMod(t).s,(m&&m.cod?m.cod+' — ':'')+(m?m.nome:'')],['Instrumento',i.nome+(i.data?' · '+fmtIso(i.data):'')]]});
    if(est==='faltou'||tot==null){B.push({p:est==='faltou'?'Não realizou.':'Ainda sem classificação.'});return}
    const n=i.notas[a.id]||{};B.push({tabela:{cab:['Item','Cotação','Obtido'],larg:[.6,.2,.2],linhas:[...i.itens.filter(it=>+it.cot).map(it=>[itPath(it).filter(Boolean).join(' › ')||it.rot,nf(it.cot,2),n[it.id]==null||n[it.id]===''?'—':nf(num(n[it.id]),2)]),['Total',nf(max,2),nf(tot,2)]]}});
    if(o&&i.itens.some(it=>it.oralLig)){const r=(oralRegsDe(o,i.id)||{})[a.id];if(r&&r.n)B.push({tabela:{cab:['Produção Oral — parâmetro','Nível','Pontos'],larg:[.6,.2,.2],linhas:ORAL_P.map(p=>[p.n+' ('+p.s+')',r.n[p.k]||'—',r.n[p.k]?fmtP(oralPts(oralCfgDe(o,i.id),p.k,r.n[p.k])):'—'])}})}
    const v20=tot/max*20;B.push({kv:[['Classificação',f1(v20)+' valores ('+Math.round(v20)+')'],['Resultado',v20>=9.5?'Positiva':'Negativa — a recuperar']]},{p:'Observações: ______________________________________________________________',sz:9})});
  pdfDocumento({titulo:'Ficha de Correção',subtitulo:i.nome+(m?' · '+(m.cod?m.cod+' ':'')+m.nome:''),escola:e,turma:t,blocos:B,assinaturas:[profAssin(profGenProfX()==='F'?'A Formadora':profGenProfX()==='M'?'O Formador':'O(A) Formador(a)'),'O(A) Formando(a)']},'Fichas de correcao - '+i.nome+(soId&&al[0]?' - '+al[0].nome:''));audit('Avaliação','Fichas de correção (PDF)',i.nome)}
/* no instrumento: cartão para preparar a ficha de correção + fichas individuais */
{const _vIp=vInstrumento;vInstrumento=function(id){if(!['notas','itens','stats','oral'].includes(UI.instTab))UI.instTab='notas';const r=_vIp.apply(this,arguments);try{const t=T();if(ehUnid(t)){const ip=$('#i-per');if(ip){const w=ip.closest('div');w.style.display='none';const g=w.parentElement;if(g&&g.style.gridTemplateColumns)g.style.gridTemplateColumns='2fr 1.3fr 1fr'}}if(!ehProfT(t))return r;const i=t.instrumentos.find(x=>x.id===id);if(!i||!i.profElem)return r;const el=((modAtivo(t)||{}).av||{}).prof;const e=el&&el.elems.find(x=>x.id===i.profElem);const tb=$('#view .tabs.noprint');if(!tb)return r;
    const ehTE=e&&e.tipo==='Teste Escrito',ehTO=e&&e.tipo==='Teste Oral'&&profLingua(t);let h='';
    if(ehTE&&profTEPlace(i)&&!i.soFinal)h=`<div class="card pteban"><span class="pteic">${ic('clipboard',20)}</span><div><b>Ficha de correção por pergunta</b><small>Este teste tem só a nota final. Defina os itens e as cotações (ou carregue o enunciado) para corrigir pergunta a pergunta e ter a análise do teste.</small></div><span class="sp1"></span><button type="button" class="btn pri" id="pte-go">${ic('sparkle',14)} Preparar</button></div>`;
    else if(ehTE&&!profTEPlace(i))h=`<div class="pteinfo">${ic('info',13)} ${i.itens.length} itens · ${nf(instMax(i),2)} pontos — a nota do elemento é convertida para 0–20. <button type="button" class="btn sm" id="pte-pdf">${ic('printer',13)} Fichas Individuais (PDF)</button></div>`;
    if(ehTO)h=`<div class="pteinfo">${ic('mic',13)} Teste de Produção Oral — classifique na grelha da <b>Produção Oral</b> (5 parâmetros, níveis N1–N4); os pontos são convertidos para 0–20. <button type="button" class="btn sm pri" id="pte-or">${ic('mic',13)} Abrir a Grelha</button> <button type="button" class="btn sm" id="pte-pdf">${ic('printer',13)} Fichas Individuais (PDF)</button></div>`;
    if(h){tb.insertAdjacentHTML('beforebegin',h);const g=$('#pte-go');if(g)g.onclick=()=>profTEDlg(t,i);const p=$('#pte-pdf');if(p)p.onclick=()=>profFichasPdf(t,i);const o=$('#pte-or');if(o)o.onclick=()=>{UI.instTab='oral';vInstrumento(i.id)}}
    if(UI.instTab==='stats'&&(ehTE||ehTO)){const b=$('#i-body');if(b&&!b.querySelector('#pte-pdf2'))b.insertAdjacentHTML('afterbegin',`<div class="row" style="justify-content:flex-end;margin-bottom:8px"><button type="button" class="btn sm" id="pte-pdf2">${ic('printer',13)} Imprimir Fichas Individuais</button></div>`);const p2=$('#pte-pdf2');if(p2)p2.onclick=()=>profFichasPdf(t,i)}}catch(err){console.warn(err)}return r}}
/* Elementos e Pesos: atalho para o Teste de Produção Oral nas línguas */
{const _pMD=profModeloDlg;profModeloDlg=function(t,mid,novo){const r=_pMD.apply(this,arguments);try{if(profLingua(t)){const ad=$('#pe-add');if(ad&&!$('#pe-oral')){const sel=[...document.querySelectorAll('#dw-b [data-pet]')];if(!sel.some(s=>s.value==='Teste Oral')){ad.insertAdjacentHTML('afterend',`<button type="button" class="btn sm" id="pe-oral" title="Acrescenta um elemento Teste Oral, avaliado com a grelha da Produção Oral (Parte D)">${ic('mic',13)} Teste de Produção Oral</button>`);$('#pe-oral').onclick=()=>{ad.click();setTimeout(()=>{const L=[...document.querySelectorAll('#dw-b [data-pet]')];const s=L[L.length-1];if(s){s.value='Teste Oral';s.dispatchEvent(new Event('change'))}const o=$('#pe-oral');if(o)o.remove()},30)}}}}}catch(e){console.warn(e)}return r}}


/* v0.62 · folhas A4 (relatórios, fichas) cabem no ecrã em telemóveis/tablets */
function ajustarFolhas(){document.querySelectorAll('#view .sheetwrap').forEach(w=>{const W=w.clientWidth;if(!W)return;w.querySelectorAll('.sheet').forEach(sh=>{sh.style.zoom='';const sw=sh.offsetWidth;sh.style.zoom=sw>W+1?String(Math.max(.3,W/sw)):''})})}
{const _gF=go;go=function(){const r=_gF.apply(this,arguments);try{setTimeout(ajustarFolhas,30)}catch(_){}return r}}
{const _vRf=vRelatorios;vRelatorios=function(){const r=_vRf.apply(this,arguments);setTimeout(ajustarFolhas,30);return r}}
addEventListener('resize',()=>{clearTimeout(ajustarFolhas._t);ajustarFolhas._t=setTimeout(ajustarFolhas,120)});

/* ===================== v0.62 · Módulo Jornal Escolar — PAA, pauta, edições, calendário e avisos ===================== */
ICONS.news='<path d="M4 5h12v13a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M16 9h4v9a2 2 0 0 1-2 2"/><path d="M7 9h6M7 12.5h6M7 16h4"/>';
TITLES.jornal='Jornal Escolar';
const JN_MESES=['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const JN_MN=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const JN_MC=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const JN_EST=[['ideia','Ideia','#6e6e73'],['atribuida','Atribuída','#7a4fd0'],['escrita','Em escrita','#d98b00'],['revisao','Em revisão','#2f7fd0'],['pronta','Pronta','#1a7f37'],['publicada','Publicada','#0f8b8d']];
const JN_TIPOS=['Notícia','Reportagem','Entrevista','Fotorreportagem','Crónica','Opinião','Agenda','Passatempo','Outro'];
const JN_FUNC=['Repórter','Fotógrafo/a','Revisor/a','Paginador/a','Editor/a','Colaborador/a'];
const JN_CHECK=['Peças recolhidas','Revisão de texto','Fotografias escolhidas (autorizações de imagem verificadas)','Paginação','Aprovação da direção','Impressão / PDF final','Divulgação (site, redes sociais, encarregados de educação)'];
const JN_PREC={dia:'Data exata',mes:'Só o mês',periodo:'Só o período',anual:'Ao longo do ano',indef:'A definir'};
/* o módulo aparece sozinho quando o professor tem um cargo ligado ao jornal (Definições › Professor › Cargos e Funções); o interruptor em Definições sobrepõe-se */
const jnCargo=()=>{try{const pf=perfil();return Object.values(pf.porEscola||{}).concat([pf]).some(o=>((o&&o.cargos)||[]).some(c=>/jornal/i.test(c)))}catch(_){return false}};
const jnOn=()=>{const m=S.cfg.modulos&&S.cfg.modulos.jornal;if(m===false)return false;if(m===true)return true;return jnCargo()||!!(A()&&A().demo)};
const jnAnoNome=()=>{const a=A();return (a&&a.nome)||anoAuto()};
const jnAnoIni=()=>{const m=String(jnAnoNome()).match(/(\d{4})/);return m?+m[1]:new Date().getFullYear()};
function JN(){const j=S.jornal=S.jornal||{};j.cfg=Object.assign({nome:'Jornal da Escola',dias:7,diasMat:2,diasEntrega:3},j.cfg||{});j.equipa=j.equipa||[];j.anos=j.anos||{};
  const y0=jnAnoIni(),k=y0+'/'+(y0+1);const y=j.anos[k]=j.anos[k]||{};y.ativ=y.ativ||[];y.pecas=y.pecas||[];y.edicoes=y.edicoes||[];return {j,y,cfg:j.cfg}}
const jnPad=n=>String(n).padStart(2,'0');
const jnIso=(y,m,d)=>y+'-'+jnPad(m)+'-'+jnPad(d);
const jnUlt=(y,m)=>new Date(y,m,0).getDate();
const jnAnoDe=(m,y0)=>m>=8?y0:y0+1;
const jnAdd=(iso,n)=>{const d=dataDeIso(iso);d.setDate(d.getDate()+n);return isoData(d)};
const jnDif=(a,b)=>Math.round((dataDeIso(b)-dataDeIso(a))/864e5);
const jnHoje=()=>isoData(new Date());
function jnPeriodos(y0){const a=A();const P=a&&a.calendario&&a.calendario.periodos;
  if(P&&P.length&&P.every(p=>p.ini&&p.fim))return P.map(p=>({n:+p.n,ini:p.ini,fim:p.fim}));
  return [{n:1,ini:jnIso(y0,9,8),fim:jnIso(y0,12,18)},{n:2,ini:jnIso(y0+1,1,4),fim:jnIso(y0+1,3,26)},{n:3,ini:jnIso(y0+1,4,6),fim:jnIso(y0+1,6,18)}]}

/* ---------- leitura das datas escritas no PAA ("12 a 16 de outubro", "Março/Abril", "2.º período", "Ao longo do ano letivo"…) ---------- */
const JN_M='\\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\\b\\.?';
const jnMes=s=>{s=(s||'').replace('.','');const i=JN_MESES.indexOf(s);return i>=0?i+1:(JN_MC.indexOf(s.slice(0,3))+1)};
function jnParse(txt,y0){
  let s=' '+normT(txt).replace(/[–—]/g,'-')+' ';
  const R={prec:'indef',datas:[],hora:'',horaFim:'',aprox:/a definir|aguarda|a designar|previs|a confirmar|datas? especific/.test(s)};
  const ok=(y,m,d)=>m>=1&&m<=12&&d>=1&&d<=jnUlt(y,m);
  const add=(i,f)=>{if(i&&f&&f<i)[i,f]=[f,i];if(i&&!R.datas.some(x=>x.ini===i&&x.fim===(f||i)))R.datas.push({ini:i,fim:f||i})};
  const H=[...s.matchAll(/\b([01]?\d|2[0-3])(?:h(\d{2})?|:(\d{2}))(?![\d\/])/g)];
  if(H.length){const f=h=>jnPad(+h[1])+':'+(h[2]||h[3]||'00');R.hora=f(H[0]);if(H[1])R.horaFim=f(H[1]);s=s.replace(/\b([01]?\d|2[0-3])(?:h(\d{2})?|:(\d{2}))(?![\d\/])\s*(?:horas)?/g,' ')}
  s=s.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,(m0,d,m,y)=>{y=+y<100?2000+ +y:+y;if(ok(y,+m,+d))add(jnIso(y,+m,+d));return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})(?:\\s*de)?(?:\\s*'+JN_M+')?\\s*(?:a|ate|-)\\s*(\\d{1,2})\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d1,m1,d2,m2,y)=>{
    const M2=jnMes(m2),M1=m1?jnMes(m1):M2;const Y2=y?+y:jnAnoDe(M2,y0),Y1=y&&M1<=M2?+y:jnAnoDe(M1,y0);
    if(ok(Y1,M1,+d1)&&ok(Y2,M2,+d2))add(jnIso(Y1,M1,+d1),jnIso(Y2,M2,+d2));return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})((?:\\s*(?:,|e)\\s*\\d{1,2})+)\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d1,rest,m,y)=>{
    const M=jnMes(m),Y=y?+y:jnAnoDe(M,y0);[d1,...rest.match(/\d{1,2}/g)].forEach(d=>{if(ok(Y,M,+d))add(jnIso(Y,M,+d))});return ' '});
  s=s.replace(new RegExp('\\b(\\d{1,2})\\s*(?:de\\s*)?'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,d,m,y)=>{const M=jnMes(m),Y=y?+y:jnAnoDe(M,y0);if(ok(Y,M,+d))add(jnIso(Y,M,+d));return ' '});
  if(R.datas.length){R.prec='dia';R.datas.sort((a,b)=>a.ini.localeCompare(b.ini));return R}
  R.hora='';R.horaFim='';
  const spanM=(m1,m2,y)=>{const Y1=y&&m1<=m2?+y:jnAnoDe(m1,y0),Y2=y?+y:jnAnoDe(m2,y0);add(jnIso(Y1,m1,1),jnIso(Y2,m2,jnUlt(Y2,m2)))};
  s=s.replace(new RegExp(JN_M+'(?:\\s*de\\s*\\d{4})?\\s*(?:a|ate|-|\\/|e)\\s*'+JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,m1,m2,y)=>{spanM(jnMes(m1),jnMes(m2),y);return ' '});
  s=s.replace(new RegExp(JN_M+'(?:\\s*(?:de\\s*)?(\\d{4}))?','g'),(m0,m,y)=>{const M=jnMes(m);spanM(M,M,y);return ' '});
  if(R.datas.length){R.prec='mes';R.datas.sort((a,b)=>a.ini.localeCompare(b.ini));return R}
  const P=jnPeriodos(y0);const per=n=>P.find(p=>p.n===n);
  const PM=[...s.matchAll(/((?:\b[123]\s*\.?\s*[ºo]?\s*\.?\s*(?:e|ou|\/|,|a)?\s*)+)(?:periodos?|p)\b/g)];
  PM.forEach(m=>{const ns=(m[1].match(/[123]/g)||[]).map(Number).filter(n=>per(n));if(!ns.length)return;const a=per(Math.min(...ns)),b=per(Math.max(...ns));
    if(/ultima semana/.test(s)&&ns.length===1)add(jnAdd(a.fim,-6),a.fim);else if(/(final|fim) do/.test(s)&&ns.length===1)add(jnAdd(a.fim,-13),a.fim);else add(a.ini,b.fim)});
  if(R.datas.length){R.prec='periodo';if(PM.some(m=>/ou/.test(m[1])))R.aprox=true;return R}
  if(/(final|fim) do ano/.test(s)){const p=P[P.length-1];add(jnAdd(p.fim,-13),p.fim);R.prec='periodo';return R}
  if(/ano letivo|anual|ao longo|x mes|mensal|semanal|todo o ano/.test(s)){add(P[0].ini,P[P.length-1].fim);R.prec='anual';return R}
  return R}

/* ---------- importação do PAA (.docx) ---------- */
async function jnLerDocx(file){
  const z=await unzip(await file.arrayBuffer());const xml=await z.text('word/document.xml');if(!xml)throw new Error('O ficheiro não é um documento Word (.docx) válido.');
  const doc=xmlDoc(xml);const body=tagsNS(doc,'body')[0];if(!body)throw new Error('Documento vazio.');
  const kids=(el,n)=>Array.from(el.childNodes).filter(c=>c.nodeType===1&&c.localName===n);
  const pTxt=p=>{let o='';const w=n=>{for(const c of n.childNodes){if(c.nodeType!==1)continue;const l=c.localName;if(l==='del'||l==='instrText'||l==='delText')continue;if(l==='t')o+=c.textContent;else if(l==='tab')o+=' ';else if(l==='br'||l==='cr')o+='\n';else w(c)}};w(p);return o};
  const cTxt=tc=>kids(tc,'p').map(pTxt).join('\n').replace(/ /g,' ').trim();
  const at=(el,path,attr)=>{let x=el;for(const n of path){x=x&&kids(x,n)[0];if(!x)return null}return x.getAttribute('w:'+attr)??x.getAttributeNS('*',attr)??x.getAttribute(attr)};
  const out=[];let sec='',map=null;
  for(const el of body.childNodes){if(el.nodeType!==1)continue;
    if(el.localName==='p'){const t=pTxt(el).replace(/[​ ]/g,' ').replace(/\s+/g,' ').trim();if(t&&t.length<120&&!/^(indice|anexo)$/i.test(normT(t))){if(t===t.toUpperCase()||/^(departamento|clube|equipa|servi[cç]o|projeto|programa)/i.test(t))sec=t.replace(/\s*\(a integrar posteriormente\)\s*/i,'').trim()}continue}
    if(el.localName!=='tbl')continue;
    let acima=[];
    for(const tr of kids(el,'tr')){const g=[];let col=+(at(tr,['trPr','gridBefore'],'val')||0);
      for(const tc of kids(tr,'tc')){const sp=+(at(tc,['tcPr','gridSpan'],'val')||1);const vmEl=(()=>{const pr=kids(tc,'tcPr')[0];return pr&&kids(pr,'vMerge')[0]})();
        const cont=vmEl&&(vmEl.getAttribute('w:val')||'continue')!=='restart';const t=cont?(acima[col]||''):cTxt(tc);for(let i=0;i<sp;i++)g[col+i]=t;col+=sp}
      acima=g;const N=g.map(x=>normT(x||''));
      const iA=N.findIndex(x=>x==='atividade'||x==='atividades'||x==='acao/atividade');
      if(iA>=0){const f=(re,from)=>{for(let i=from;i<N.length;i++)if(re.test(N[i]))return i;return -1};
        map={a:iA,r:f(/^responsave/,iA+1),c:f(/^calendariza/,iA+1),rec:f(/^recurso/,iA+1),ind:f(/^indicador/,iA+1),obj:f(/^objetivo/,0),pri:f(/^(prioridade|eixo)/,0),meta:f(/^meta/,0)};continue}
      if(!map||N.some(x=>/^acoes\/ ?atividades$/.test(x)))continue;
      const v=k=>map[k]>=0?(g[map[k]]||'').trim():'';const raw=v('a');
      if(!raw||/^nota\b/i.test(normT(raw))||normT(raw)==='atividade')continue;
      const T=jnTitulo(raw);if(!T.t)continue;
      out.push({sec:sec||'Geral',titulo:T.t,det:T.d,resp:v('r').replace(/\n+/g,' · ').replace(/\s+/g,' ').replace(/ · $/,''),cal:v('c').replace(/\n+/g,' / ').replace(/\s+/g,' ').replace(/( \/ )+/g,' / ').replace(/^ \/ | \/ $/g,''),rec:v('rec').replace(/\s*\n+\s*/g,' · '),ind:v('ind').replace(/\s*\n+\s*/g,' · '),obj:v('obj').replace(/\s+/g,' ')})}}
  return out}
function jnTitulo(raw){let L=String(raw).split('\n').map(x=>x.replace(/\s+/g,' ').trim());
  while(L.length&&(!L[0]||/^\d+\s*[ªº.]?\s*$/.test(L[0])))L.shift();if(!L.length)return {t:'',d:''};
  L[0]=L[0].replace(/^\d+\s*[ªº]?\s*[:.)\-]\s*/,'').replace(/^[.\-•]\s*/,'');
  const T=[];let i=0;const dest=/^(\d+\s*[ºª.]|ct\b|alunos|comunidade|turma|pais|ee\b)/i;
  for(;i<L.length;i++){if(!L[i]||(i>0&&dest.test(L[i])))break;T.push(L[i])}
  let t='';T.forEach(p=>{t=/-$/.test(t)&&/^[a-zà-ú]/.test(p)?t.slice(0,-1)+p:(t?t+' ':'')+p});
  t=t.replace(/\s+/g,' ').trim();let d=L.slice(i).filter(Boolean).join(' · ');
  if(t.length>90){const m=t.match(/^(.{12,90}?[.!?:])\s+(.+)$/);if(m){t=m[1].replace(/[.:]$/,'');d=m[2]+(d?' · '+d:'')}}
  return {t,d}}
function jnImportar(lista,ficheiro){const {y}=JN();const y0=jnAnoIni();const idx=new Map(y.ativ.filter(a=>a.orig==='paa').map(a=>[a.key,a]));const vistos=new Set();let novas=0,alt=0;
  lista.forEach(r=>{const base=normT(r.sec)+'|'+normT(r.titulo);let k=base,n=2;while(vistos.has(k))k=base+'#'+(n++);vistos.add(k);const p=jnParse(r.cal,y0);let a=idx.get(k);
    if(!a){a={id:uid(),key:k,orig:'paa',dec:null,criada:Date.now()};y.ativ.push(a);novas++}
    else if(a.cal!==r.cal){a.calAnt=a.cal;a.alterada=Date.now();a.altVista=false;alt++}
    Object.assign(a,{sec:r.sec,tit0:r.titulo,det:r.det,resp:r.resp,cal:r.cal,rec:r.rec,ind:r.ind,obj:r.obj,prec:p.prec,datas:p.datas,hora:p.hora,horaFim:p.horaFim,aprox:p.aprox,foraPAA:false});if(!a.titEd)a.titulo=r.titulo});
  let rem=0;y.ativ.forEach(a=>{if(a.orig==='paa'&&!vistos.has(a.key)&&!a.foraPAA){a.foraPAA=true;rem++}});
  y.paa={ficheiro,em:Date.now(),n:lista.length};saveNow();audit('Jornal','PAA importado',ficheiro+' · '+lista.length+' atividades');return {novas,alt,rem}}
function jnPickPAA(){let f=$('#jnIn');if(!f){f=document.createElement('input');f.type='file';f.id='jnIn';f.accept='.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';f.hidden=true;document.body.appendChild(f)}
  f.value='';f.onchange=async()=>{const file=f.files[0];if(!file)return;try{toast('A ler o PAA…');const L=await jnLerDocx(file);if(!L.length)return alert('Não foram encontradas atividades neste documento.\n\nO PAA deve ter tabelas com as colunas «Atividade», «Responsáveis» e «Calendarização».');jnPreImport(L,file.name)}catch(e){console.error(e);alert('Não foi possível ler o ficheiro: '+e.message)}};f.click()}
function jnPreImport(L,nome){const y0=jnAnoIni();const P=L.map(r=>({r,p:jnParse(r.cal,y0)}));const cnt=k=>P.filter(x=>x.p.prec===k).length;const secs=[...new Set(L.map(r=>r.sec))];const {y}=JN();const ja=y.ativ.some(a=>a.orig==='paa');
  openDrawer('Importar Plano Anual de Atividades',`<div class="ed"><p style="margin-top:0"><b>${esc(nome)}</b><br><span class="mut">Ano letivo ${esc(jnAnoNome())} · ${L.length} atividades em ${secs.length} secções</span></p>
   <div class="jn-pv">${Object.keys(JN_PREC).map(k=>`<div><b>${cnt(k)}</b><span>${JN_PREC[k]}</span></div>`).join('')}</div>
   ${ja?`<p class="hint">${ic('info',14)} Já existe um PAA importado. As decisões, peças e datas confirmadas mantêm-se; as atividades novas são juntadas e as que mudaram de data ficam assinaladas.</p>`:''}
   <div class="jn-pvl">${P.map(({r,p})=>`<div class="jn-pvi"><span class="jn-dc ${p.prec}">${esc(jnLblD(p.datas,p.prec))}</span><span><b>${esc(r.titulo)}</b><br><span class="mut">${esc(r.sec)} · «${esc(r.cal||'—')}»</span></span></div>`).join('')}</div>
   <div class="row" style="margin-top:12px"><span class="sp1"></span><button class="btn" id="jp-x">Cancelar</button><button class="btn pri" id="jp-ok">${ic('check',15)} Importar ${L.length} Atividades</button></div></div>`);
  $('#jp-x').onclick=closeDrawer;$('#jp-ok').onclick=()=>{const R=jnImportar(L,nome);closeDrawer();UI.jnTab='paa';go('jornal');toast(`PAA importado: ${R.novas} nova(s)`+(R.alt?`, ${R.alt} com data alterada`:'')+(R.rem?`, ${R.rem} já não constam`:''),'ok')}}

/* ---------- datas efetivas e etiquetas ---------- */
const jnDatasEf=a=>a.conf?[{ini:a.conf,fim:a.confFim&&a.confFim>=a.conf?a.confFim:a.conf}]:(a.datas||[]);
const jnPrecEf=a=>a.conf?'dia':(a.prec||'indef');
const jnIni=a=>{const d=jnDatasEf(a)[0];return d?d.ini:''};
const jnHora=a=>a.conf?(a.confHora||''):(a.hora||'');
function jnLblD(D,prec){if(!D||!D.length)return 'A definir';const d=D[0],a=dataDeIso(d.ini),b=dataDeIso(d.fim);
  if(prec==='anual')return 'Todo o ano';
  if(prec==='periodo'){const P=jnPeriodos(jnAnoIni());const i=P.find(p=>p.ini===d.ini),f=P.find(p=>p.fim===d.fim);if(i&&f)return (i.n===f.n?i.n+'.º período':i.n+'.º–'+f.n+'.º per.')+(D.length>1?' +'+(D.length-1):'');const q=P.find(p=>d.fim===p.fim);return q?'Fim do '+q.n+'.º P':'Período'}
  if(prec==='mes')return a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear()?JN_MN[a.getMonth()]:JN_MC[a.getMonth()]+'–'+JN_MC[b.getMonth()];
  let s=d.ini===d.fim?a.getDate()+' '+JN_MC[a.getMonth()]:a.getMonth()===b.getMonth()?a.getDate()+'–'+b.getDate()+' '+JN_MC[a.getMonth()]:a.getDate()+' '+JN_MC[a.getMonth()]+'–'+b.getDate()+' '+JN_MC[b.getMonth()];
  if(D.length>1)s+=' +'+(D.length-1);return s}
const jnLbl=a=>jnLblD(jnDatasEf(a),jnPrecEf(a));
const jnPecaDe=a=>JN().y.pecas.find(p=>p.ativ===a.id);
const jnEst=k=>JN_EST.find(e=>e[0]===k)||JN_EST[0];
const jnMembro=id=>JN().j.equipa.find(m=>m.id===id);
const jnNomeM=id=>{const m=jnMembro(id);return m?m.nome:(id||'')};
const jnFeita=p=>p.estado==='pronta'||p.estado==='publicada';
function jnCobrir(a,dec){const {y,cfg}=JN();a.dec=a.dec===dec?null:dec;
  if(a.dec==='cobrir'&&!jnPecaDe(a)){const D=jnDatasEf(a);const fim=D.length?D[D.length-1].fim:'';
    y.pecas.push({id:uid(),titulo:a.titulo,tipo:'Notícia',estado:'ideia',ativ:a.id,prazo:fim&&jnPrecEf(a)==='dia'?jnAdd(fim,cfg.diasEntrega):'',autor:'',foto:'',edicao:jnEdicaoPara(fim),notas:'',criada:Date.now()})}
  save();audit('Jornal',a.dec==='cobrir'?'Atividade a cobrir':a.dec==='ignorar'?'Atividade ignorada':'Decisão anulada',a.titulo)}
function jnEdicaoPara(iso){const {y}=JN();return ((iso?y.edicoes.filter(e=>e.estado!=='publicada'&&e.fecho&&e.fecho>=iso):y.edicoes.filter(e=>e.estado!=='publicada')).sort((a,b)=>(a.fecho||'9').localeCompare(b.fecho||'9'))[0]||{}).id||''}

