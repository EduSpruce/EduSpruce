/* =====================================================================
   1.121 — Nova turma PROFIJ: sem «Disciplina que leciona nesta turma».
   As disciplinas PROFIJ vêm do referencial do curso: o professor só
   assinala as disciplinas e UFCD que leciona (a 1.ª assinalada é a pauta
   principal; só UFCD → pauta «Componente Tecnológica (UFCD)»).
   ===================================================================== */
{const _nt=novaTurmaDlg;novaTurmaDlg=function(){const r=_nt.apply(this,arguments);const outra=$('#nt-outra');if(!outra)return r;
  const box=outra.closest('div');const of=()=>{const b=$('#nt-ofw [data-of].on');return b?b.dataset.of:'regular'};let antes=null;
  const aplica=()=>{const pj=of()==='profij';const sd=$('#nt-disc');box.style.display=pj?'none':'';
    $$('#dw-b .alert.w').forEach(x=>{if(/Ainda não escolheu as disciplinas/.test(x.textContent))x.style.display=pj?'none':''});
    if(pj){if(sd&&sd.value!=='__outra'){antes=sd.value;sd.value='__outra'}outra.value=''}
    else if(sd&&sd.value==='__outra'&&antes){sd.value=antes;outra.style.display='none'}};
  aplica();const ow=$('#nt-ofw');if(ow)ow.addEventListener('click',()=>setTimeout(()=>{aplica();try{$('#nt-outra').dispatchEvent(new Event('change',{bubbles:true}))}catch(_){}},30));
  const ok=$('#nt-ok');if(ok){const orig=ok.onclick;ok.onclick=function(){if(of()!=='profij')return orig.apply(this,arguments);
    const m=$$('#nt-maisw [data-ntm]:checked').map(c=>c.dataset.ntm);const u=$$('#nt-maisw [data-ntu]:checked').length;
    const p=m.find(n=>!ehComp(n))||(u?UFCD_N:m[0]);if(!p){toast('Assinale as disciplinas ou UFCD que leciona nesta turma','warn');return}
    const sd=$('#nt-disc');if(sd)sd.value='__outra';outra.value=p;return orig.apply(this,arguments)}}
  return r}}
