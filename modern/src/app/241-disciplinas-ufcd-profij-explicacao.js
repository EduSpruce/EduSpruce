/* ===================== v1.026 · Disciplinas e UFCD (PROFIJ): explicação clara, várias por turma, sem pautas repetidas =====================
   Num curso PROFIJ o professor pode lecionar, na mesma turma e no mesmo ano, várias disciplinas (sociocultural/científica) e várias
   UFCD (componente tecnológica). Cada disciplina tem a sua pauta; as UFCD ficam todas numa única pauta «Componente Tecnológica (UFCD)»,
   uma unidade por UFCD (horas, datas e classificação próprias). Se acrescentar mais UFCD a uma turma que já tem essa pauta, juntam-se
   à pauta existente em vez de criar outra igual. No menu, a pauta das UFCD mostra os códigos das UFCD. */
const UFCD_EXPL=`<details class="ntexp" open><summary>${ic('info',14)} <b>Disciplinas e UFCD — como funciona</b></summary>
  <ul><li><b>Disciplina</b> (componentes sociocultural e científica, ex.: Comunicar em Inglês, Matemática Aplicada): cada uma tem a <b>sua pauta</b>, com critérios e instrumentos próprios.</li>
  <li><b>UFCD</b> (Unidade de Formação de Curta Duração, componente tecnológica): todas as UFCD que leciona nesta turma ficam numa <b>única pauta</b> «Componente Tecnológica (UFCD)», <b>uma unidade por UFCD</b> — cada uma com horas, datas, instrumentos e classificação (0–20) próprios.</li>
  <li>Pode lecionar <b>várias disciplinas e várias UFCD na mesma turma e no mesmo ano</b>: assinale todas abaixo (ou acrescente depois com «+ Disciplina»). Os alunos são copiados para cada pauta.</li>
  <li>Se a turma <b>já tiver</b> a pauta das UFCD, as novas UFCD juntam-se a ela — nunca fica com duas pautas iguais.</li>
  <li>As turmas que <b>só coordena</b> (Coord. PROFIJ) não se criam aqui: ficam na Coordenação, separadas da sua docência.</li></ul></details>`;
{const _ntU=novaTurmaDlg;novaTurmaDlg=function(r){const res=_ntU.apply(this,arguments);try{const w=$('#nt-maisw');if(w&&!$('#nt-expl')){w.insertAdjacentHTML('beforebegin',`<div id="nt-expl">${UFCD_EXPL}</div>`);
      const ver=()=>{const b=$('#nt-ofw [data-of].on');const of=b?b.dataset.of:'regular';const e=$('#nt-expl');if(e)e.hidden=of!=='profij'&&of!=='profissional'};ver();
      const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(ver,0))}}catch(e){console.warn(e)}return res}}
/* rótulo da pauta das UFCD no menu: os códigos das UFCD (em vez do nome comprido da componente) */
function ufcdRotulos(){const a=A();if(!a)return;const tree=$('#tTree');if(!tree)return;
  tree.querySelectorAll('[data-tt]').forEach(b=>{const t=(a.turmas||[]).find(x=>x.id===b.dataset.tt);if(!t||!ehComp(t.disciplina))return;const M=(t.modulos||[]).filter(m=>m&&(m.cod||m.nome));if(!M.length)return;
    const cods=M.map(m=>String(m.cod||'').replace(/^UFCD\s*/i,'').trim()||m.nome.slice(0,14));const txt=(t.disciplina===UC_N?'UC ':'UFCD ')+cods.slice(0,3).join(', ')+(cods.length>3?' +'+(cods.length-3):'');
    const el=b.querySelector('.tdisc')||(b.classList.contains('tdsb')?b.querySelector('.lbl'):null);if(el){el.textContent=txt;b.title=t.nome+' · '+t.disciplina+' — '+M.map(m=>(m.cod?m.cod+' ':'')+m.nome).join('; ')}})}
/* pautas das UFCD repetidas na mesma turma (criadas de novo com «+ Disciplina»): as UFCD juntam-se à pauta que já existia */
function ufcdFundir(){const a=A();if(!a)return 0;const L=a.turmas.__real||a.turmas;let n=0;const G={};
  L.forEach(t=>{if(!ehComp(t.disciplina))return;const k=normTurma(t.nome)+'|'+escId(escolaDe(t))+'|'+t.disciplina;(G[k]=G[k]||[]).push(t)});
  Object.values(G).forEach(g=>{if(g.length<2)return;const base=g[0];g.slice(1).forEach(t=>{const comNotas=(t.instrumentos||[]).some(i=>i.notas&&Object.keys(i.notas).length);if(comNotas)return;
      base.modulos=base.modulos||[];(t.modulos||[]).forEach(m=>{const ja=base.modulos.some(x=>(m.cod&&x.cod&&String(x.cod).replace(/\D/g,'')===String(m.cod).replace(/\D/g,''))||normT(x.nome)===normT(m.nome));if(!ja)base.modulos.push(m)});
      try{const H=a.horProf;if(H&&H.mapa)Object.keys(H.mapa).forEach(k=>{if(H.mapa[k]===t.id)H.mapa[k]=base.id})}catch(_){}
      const j=L.indexOf(t);if(j>=0)L.splice(j,1);if(S.turmaAtiva===t.id)S.turmaAtiva=base.id;n++})});
  if(n){save();setTimeout(()=>toast('As UFCD novas juntaram-se à pauta «Componente Tecnológica» que a turma já tinha','ok'),80)}return n}
{const _gU=go;go=function(v){try{if(v==='turmas'||v==='painel'||v==='modulos'||v==='inicio')ufcdFundir()}catch(e){console.warn(e)}return _gU.apply(this,arguments)};if(_gU._f)go._f=_gU._f}

