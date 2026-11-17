/* ===================== v0.54 · Correções e ficha de correção dos testes ===================== */
/* verificação dos cálculos: casos de teste alargados (menções numa turma do básico, 0–20, arredondamento, em branco, não realizou) */
autoTestes=function(){const err=[];let ok=0;const chk=(n,v,e)=>{try{window.__regT&&window.__regT(n,v,e)}catch(_){}if(v===e||(typeof v==='number'&&typeof e==='number'&&Math.abs(v-e)<1e-6))ok++;else err.push(n+': obtido '+v+', esperado '+e)};
  const doms=[{id:'d1',ab:'A',nome:'A',peso:50},{id:'d2',ab:'B',nome:'B',peso:50}];
  const base={id:'tt',nome:'T',disciplina:'X',dominios:doms,mencoes:MENCOES_DEF.map(m=>({...m})),regra:{2:'media',3:'media'},alunos:[{id:'a1',frequenta:true},{id:'a2',frequenta:true}],
    instrumentos:[{id:'i1',periodo:1,itens:[{id:'x1',dom:'d1',cot:10},{id:'x2',dom:'d2',cot:10}],notas:{a1:{x1:8,x2:6}}},{id:'i2',periodo:2,itens:[{id:'y1',dom:'d1',cot:20}],notas:{a1:{y1:10}}}]};
  const tS={...base,ciclo:'sec',anoEsc:'10.º'},tB={...base,id:'tb',ciclo:'3c',anoEsc:'7.º'};
  try{const p1=pctsPer(tS,'a1',1);chk('% domínio A (1.º)',p1.d1,0.8);chk('% domínio B (1.º)',p1.d2,0.6);chk('nota 1.º',ponderada(tS,p1),0.7);
    const f2=pctsFinal(tS,'a1',2);chk('média acumulada A (2.º)',f2.d1,0.65);chk('B mantém 1.º',f2.d2,0.6);chk('nota final 2.º',ponderada(tS,f2),0.625);
    chk('regra «só o período»',pctsFinal({...tS,regra:{2:'periodo',3:'media'}},'a1',2).d1,0.5);
    chk('secundário: 0,625 → 12,5 valores',fmtNota(tS,0.625),notaDec()===0?'13':notaDec()===2?'12,50':'12,5');
    chk('secundário sem menções',temMencoes(tS),false);chk('secundário: 9,4 é negativa',negativa(tS,0.47),true);
    chk('básico: menção 49,4 % = Insuficiente',(mencao(tB,0.494)||{}).nome,'Insuficiente');chk('básico: menção 69,5 % = Bom',(mencao(tB,0.695)||{}).nome,'Bom');
    chk('básico: 49 % → nível 2',nivel(tB,0.49),2);chk('básico: 50 % → nível 3',nivel(tB,0.5),3);chk('básico: 90 % → nível 5',nivel(tB,0.9),5);
    const iB={id:'ib',periodo:1,itens:[{id:'z1',dom:'d1',cot:10},{id:'z2',dom:'d1',cot:10}],notas:{a1:{z1:8,z2:''}}};chk('em branco não conta como zero',instDom(iB,'a1','d1').pct,0.8);chk('em branco conta como zero (opção)',instDom({...iB,branco:'zero'},'a1','d1').pct,0.4);
    const iN={...iB,nr:{a2:1}};chk('aluno que não realizou não fica pendente',instAlunoEstado(tB,iN,'a2'),'faltou');
  }catch(e){err.push('erro: '+e.message)}
  return {ok,f:err.length,err}};

/* depois de criar uma turma: botão temporário «Criar Outra» */
{const _nT=novaTurmaDlg;novaTurmaDlg=function(){const n0=(A()||{turmas:[]}).turmas.length;const r=_nT.apply(this,arguments);
  const obs=setInterval(()=>{const a=A();if(!$('#drawer.on')){clearInterval(obs);if(a&&a.turmas.length>n0){UI.criarOutra=Date.now();if(VIEW==='alunos')go('alunos')}}},400);return r}}
{const _bbO=barBtns;barBtns=function(arr){if(UI.criarOutra&&VIEW==='alunos'&&Array.isArray(arr)&&!arr.some(b=>b.id==='b-outra')){arr=[{id:'b-outra',t:ic('plus',15)+' Criar Outra Turma',c:'pri pulso',f:()=>{UI.criarOutra=null;novaTurmaDlg(null)}},...arr]}return _bbO.call(this,arr)}}
{const _gO=go;go=function(v){if(v!=='alunos')UI.criarOutra=null;return _gO.apply(this,arguments)}}

/* horário: o fantasma do arrasto nunca fica preso */
{const limpa=()=>setTimeout(()=>{if(document.querySelector('.arrastar')&&!document.querySelector('.drag-src'))return;$$('body>.ghost').forEach(g=>g.remove());$$('.drag-src').forEach(x=>x.classList.remove('drag-src'));$$('.arrastar').forEach(x=>x.classList.remove('arrastar'));$$('td.drop').forEach(x=>x.classList.remove('drop'))},60);
  ['pointerup','pointercancel','blur','visibilitychange'].forEach(ev=>(ev==='blur'||ev==='visibilitychange'?window:document).addEventListener(ev,limpa,true));
  const _aA2=ativarArrastoAulas;ativarArrastoAulas=function(tab){$$('body>.ghost').forEach(g=>g.remove());return _aA2.apply(this,arguments)}}

/* importação de horários: avisa quando falta um dia */
{const _iH=importarHorariosDlg;importarHorariosDlg=function(res){const r=_iH.apply(this,arguments);try{const D_=['','Segunda','Terça','Quarta','Quinta','Sexta'];const av=(res||[]).filter(h=>!h.erro).map(h=>({h,f:[1,2,3,4,5].filter(d=>!h.aulas.some(x=>x.dia===d))})).filter(o=>o.f.length);
  if(av.length){const b=$('#dw-b .ed');if(b)b.insertAdjacentHTML('afterbegin',av.map(o=>`<div class="alert w">${ic('alert',15)} <b>${esc(o.h.turma||o.h.ficheiro)}</b>: o ficheiro não tem ${o.f.map(d=>D_[d]).join(', ')}. Confirme se a turma não tem aulas nesse dia — por vezes o programa da escola exporta o horário sem esse dia. As aulas do seu horário pessoal (PDF) continuam a contar.</div>`).join(''))}}catch(e){console.warn(e)}return r}}

/* título da vista: sem contorno quando recebe o foco por programa */
/* (CSS) */

/* Modo Aula: atualiza o ecrã depois de registar uma aula; O Meu Dia e Painel também */
{const _aD=aulaDlg;aulaDlg=function(){const r=_aD.apply(this,arguments);try{const d=$$('dialog.auladlg').pop();if(d&&!d._ref){d._ref=1;d.addEventListener('close',()=>setTimeout(()=>{try{if(['inicio','painel','aula','sumarios','direcao'].includes(VIEW))manterPosicao(()=>go(VIEW))}catch(_){}},60))}}catch(_){}return r}}

/* enunciado: pré-visualização num modal */
function verFicheiro(id,nome,tipo){const u=FOTOS[id];if(!u){toast('O ficheiro não está disponível neste dispositivo','erro');return}
  const [h,b64]=u.split(',');const mime=tipo||(h.match(/data:([^;]+)/)||[])[1]||'';let url=u;try{const bin=atob(b64);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);url=URL.createObjectURL(new Blob([arr],{type:mimeSeguro(mime)}))}catch(_){}
  const ext=/pdf/.test(mime)?'pdf':/image/.test(mime)?'img':/text/.test(mime)?'txt':'outro';
  const d=document.createElement('dialog');d.className='fichdlg';d.innerHTML=`<header><b>${ic('file',16)} ${esc(nome)}</b><span class="sp1"></span><a class="btn sm" href="${url}" download="${esc(nome)}">${ic('download',13)} Descarregar</a><button class="btn sm" data-fx="tab">${ic('access',13)} Abrir à Parte</button><button class="btn sm ico" data-fx="x" aria-label="Fechar">${ic('x',14)}</button></header>
    <div class="fichb">${ext==='pdf'?`<iframe src="${esc(url)}" title="${esc(nome)}"></iframe>`:ext==='img'?`<img src="${esc(u)}" alt="${esc(nome)}">`:ext==='txt'?`<pre>${esc((()=>{try{return decodeURIComponent(escape(atob(b64)))}catch(_){return ''}})())}</pre>`:`<div class="empty">${ic('file',30)}<br>Pré-visualização não disponível para este tipo de ficheiro.<br><span class="mut">Use «Descarregar» ou «Abrir à Parte».</span></div>`}</div>`;
  document.body.appendChild(d);d.querySelector('[data-fx="x"]').onclick=()=>d.close();d.querySelector('[data-fx="tab"]').onclick=()=>window.open(url,'_blank');d.addEventListener('close',()=>{d.remove();setTimeout(()=>{try{URL.revokeObjectURL(url)}catch(_){}},2000)});d.addEventListener('click',e=>{if(e.target===d)d.close()});d.showModal()}
{const _vIF=vInstrumento;vInstrumento=function(id){const r=_vIF.apply(this,arguments);try{const t=T();const i=t&&t.instrumentos.find(x=>x.id===id);if(!i)return r;
  $$('#view [data-anxo]').forEach(b=>{b.onclick=()=>{const x=i.anexos[b.dataset.anxo];verFicheiro(x.id,x.nome,x.tipo)}});
  $$('#view .anx.tem .anxt b').forEach(el=>{el.style.cursor='pointer';el.onclick=()=>{const k=el.closest('.anx').querySelector('[data-anxo]');if(k)k.click()}});
  /* separadores: mais destaque; Produção Oral antes da Análise */
  const tb=$('#view .card.wide > .tabs.noprint, #view .tabs.noprint');if(tb){tb.classList.add('itabs');const or=tb.querySelector('[data-itoral]'),st=tb.querySelector('[data-it="stats"]');if(or&&st)tb.insertBefore(or,st)}}catch(e){console.warn(e)}return r}}

/* ficha de correção (Análise) */
function fichaCorrecao(t,i){const al=alunosAval(t);const max=instMax(i);const sec=isSec(t);const ev=al.filter(a=>instAlunoEstado(t,i,a.id)!=='faltou');
  const res=ev.map(a=>({a,tot:instTotal(i,a.id)})).filter(x=>x.tot!=null).sort((x,y)=>y.tot-x.tot);if(!res.length||!max)return '';
  const F=x=>fmtNota(t,x);const med=avg(res.map(x=>x.tot))/max;const top=res[0],low=res[res.length-1];
  const its=i.itens.filter(it=>+it.cot);const st=its.map(it=>{const v=res.map(x=>{const n=(i.notas[x.a.id]||{})[it.id];return n==null||n===''?null:num(n)});const resp=v.filter(x=>x!=null);
    return {it,med:resp.length?avg(resp):null,suc:resp.length?avg(resp)/it.cot:null,brk:(v.length-resp.length)/v.length,zero:resp.filter(x=>x===0).length/v.length,neg:resp.filter(x=>x/it.cot<.495).length/v.length,d:domById(t,it.dom)}});
  const heat=p=>{if(p==null)return 'transparent';p=Math.max(0,Math.min(1,p));const esc_=document.body.classList.contains('escurox');if(p>=.7)return esc_?`hsl(150 30% ${18+(p-.7)*20}%)`:`hsl(150 45% ${96-(p-.7)*18}%)`;if(p>=.5)return esc_?'hsl(45 35% 22%)':'hsl(45 90% 93%)';return esc_?`hsl(8 40% ${26-p*8}%)`:`hsl(8 85% ${88+p*10}%)`};
  const heatInv=p=>p==null||p<=0?'transparent':heat(1-p);
  const bands=sec?[[0,.495,'Negativa (<10)','#dc2626'],[.495,.695,'10 a 13','#d97706'],[.695,.895,'14 a 17','#2563eb'],[.895,1.01,'18 a 20','#16a34a']]:[[0,.495,'Insuficiente','#dc2626'],[.495,.695,'Suficiente','#d97706'],[.695,.895,'Bom','#2563eb'],[.895,1.01,'Muito Bom','#16a34a']];
  const distG=bands.map(([lo,hi,n,c])=>({n,c,k:res.filter(x=>x.tot/max>=lo&&x.tot/max<hi).length}));
  const doms=t.dominios.filter(d=>its.some(x=>x.dom===d.id)).map(d=>{const v=res.map(x=>(instDom(i,x.a.id,d.id)||{}).pct).filter(x=>x!=null);return {d,v,med:v.length?avg(v):null,min:v.length?Math.min(...v):null,max:v.length?Math.max(...v):null,dist:bands.map(([lo,hi,n,c])=>({n,c,k:v.filter(x=>x>=lo&&x<hi).length}))}});
  const oralIts=its.filter(it=>it.oralLig);const oralSt=st.filter(x=>x.it.oralLig);
  const pc=x=>x==null?'—':Math.round(x*100)+'%';
  return `<section class="fcor" aria-label="Ficha de correção">
   <div class="fcg">
    <div class="fck best"><small>${ic('award',13)} Melhor ${top.a.genero==='F'?'aluna':'aluno'}</small><b>${esc(top.a.nome)}</b><span>${F(top.tot/max)}</span></div>
    <div class="fck low"><small>${ic('target',13)} Mais dificuldades</small><b>${esc(low.a.nome)}</b><span>${F(low.tot/max)}</span></div>
    <div class="fck"><small>Média</small><b class="fcbig">${F(med)}</b><span>${res.length} avaliados${ev.length-res.length?' · '+(ev.length-res.length)+' por classificar':''}${al.length-ev.length?' · '+(al.length-ev.length)+' não realizou':''}</span></div>
    <div class="fck"><small>Máximo · Média · Mínimo</small><div class="fcmmm"><span class="ok">${F(top.tot/max)}</span><span>${F(med)}</span><span class="bad">${F(low.tot/max)}</span></div><span>escala ${sec?'0 a 20 valores':'0 a 100%'}</span></div>
   </div>
   <h3>${ic('grid',14)} Por pergunta</h3>
   <div class="fcwrap"><table class="fct"><thead><tr><th></th>${st.map(x=>`<th style="--dc:${x.d?domCor(t,x.d):'var(--mut)'}" title="${esc(x.it.rot)}"><i></i>${esc(x.it.rot)}${x.it.oralLig?' 🎤':''}<small>${nf(x.it.cot,2)}</small></th>`).join('')}</tr></thead><tbody>
     <tr><th>Média por pergunta</th>${st.map((x,k)=>`<td style="--hc:${heat(x.suc)};--k:${k}">${x.med==null?'—':nf(x.med,1)}</td>`).join('')}</tr>
     <tr><th>Taxa de sucesso</th>${st.map((x,k)=>`<td style="--hc:${heat(x.suc)};--k:${k}"><b>${pc(x.suc)}</b></td>`).join('')}</tr>
     <tr><th>% por responder</th>${st.map((x,k)=>`<td style="--hc:${heatInv(x.brk*3)};--k:${k}">${pc(x.brk)}</td>`).join('')}</tr>
     <tr><th>% alunos com zero</th>${st.map((x,k)=>`<td style="--hc:${heatInv(x.zero*2)};--k:${k}">${pc(x.zero)}</td>`).join('')}</tr>
     <tr><th>% alunos com negativa</th>${st.map((x,k)=>`<td style="--hc:${heatInv(x.neg*1.5)};--k:${k}">${pc(x.neg)}</td>`).join('')}</tr></tbody></table></div>
   <div class="fcdg">
    <div class="fcd"><h3>${ic('chart',14)} ${sec?'Classificações':'Menções'} — global</h3>${distG.map((x,k)=>`<div class="fcb"><span>${x.n}</span><div class="fcbt"><i style="--w:${res.length?x.k/res.length*100:0}%;--c:${x.c};--k:${k}"></i></div><b>${x.k} <small>(${res.length?Math.round(x.k/res.length*100):0}%)</small></b></div>`).join('')}</div>
    ${doms.map((o,j)=>`<div class="fcd" style="--dc:${domCor(t,o.d)}"><h3><i class="fcdot"></i>${esc(o.d.nome)}</h3><div class="fcmmm sm"><span title="Mínimo">mín. ${pctD(t,o.min)}</span><span title="Média"><b>${pctD(t,o.med)}</b></span><span title="Máximo">máx. ${pctD(t,o.max)}</span></div>${o.dist.map((x,k)=>`<div class="fcb"><span>${x.n}</span><div class="fcbt"><i style="--w:${o.v.length?x.k/o.v.length*100:0}%;--c:${x.c};--k:${k+j}"></i></div><b>${x.k}</b></div>`).join('')}</div>`).join('')}
   </div>
   ${oralIts.length?`<div class="fco"><h3>${ic('mic',14)} Produção Oral neste instrumento</h3><div class="fcog">${oralSt.map(x=>`<div><b>${esc(x.it.rot)}</b><span>média ${x.med==null?'—':nf(x.med,1)} / ${nf(x.it.cot,2)} · sucesso ${pc(x.suc)} · ${pc(x.brk)} por avaliar</span></div>`).join('')}</div><button class="btn sm" type="button" id="fc-oral">${ic('mic',13)} Abrir Produção Oral</button></div>`:''}
  </section>`}
{const _iSF=instStats;instStats=function(t,i){const r=_iSF.apply(this,arguments);try{const b=$('#i-body');if(b){const h=fichaCorrecao(t,i);if(h){b.insertAdjacentHTML('afterbegin',h);const o=$('#fc-oral');if(o)o.onclick=()=>{try{irOral(t,i.id)}catch(_){go('oral')}}}}}catch(e){console.warn(e)}return r}}

