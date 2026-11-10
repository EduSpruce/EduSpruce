/* v0.923 · Ajuda com capturas do tema em uso (mudam quando muda o tema) */
const AJ_VISTA={comecar:'inicio',turmas:'alunos',msai:'msai',horarios:'horario',naoletivos:'meuhorario',calendario:'calendario',previstas:'sumarios',reunioes:'reunioes',reunimp:'reunioes',testes:'testes',avaliacao:'avaliacao',inicio:'inicio',inicio2:'inicio',aparencia:'aparencia',
  sessao:'conta',seguranca:'conta',contasg:'conta',direcao:'direcao',documentos:'documentos',recursos:'recursos',planta:'planta',sumarios:'sumarios',auditoria:'auditoria',tarefas:'tarefas',avisos:'tarefas',horedit:'meuhorario',arrastar:'meuhorario',oral:'oral',jornal:'jornal',cprofij:'cprofij',mra:'instrumentos',
  professor:'prof',gsync:'sync',nuvem:'sync',nuvem2:'sync',gentrar:'sync',problemas:'sync',multidisc:'alunos',arvore:'inicio',importados:'documentos'};
const AJ_TEMAS={sge:'SGE',institucional:'Institucional',ios27:'iOS',coral:'Coral',social:'Social',gradiente:'Gradiente',academico:'Académico'};
{const _vAj=vAjuda;vAjuda=function(){const r=_vAj.apply(this,arguments);try{const t=AJ_TEMAS[S.cfg.estilo]?S.cfg.estilo:'sge';
  $$('#view .ajs').forEach(c=>{const id=c.id.replace(/^aj-/,'');const v=AJ_VISTA[id];if(!v||c.querySelector('.ajcap'))return;const g=c.querySelector('.ajg');if(!g)return;const old=g.querySelector('.ajf');if(old)old.remove();g.classList.remove('sem');
    g.insertAdjacentHTML('beforeend',`<figure class="ajf ajcap"><img src="ajuda/${t}/${v}.webp" alt="Ecrã: ${esc(c.querySelector('h2').textContent.trim())} (tema ${AJ_TEMAS[t]})" loading="lazy"><figcaption>Ecrã no tema <b>${AJ_TEMAS[t]}</b> — muda quando muda o tema</figcaption></figure>`);
    const im=g.querySelector('.ajcap img');im.onerror=()=>{const f=im.closest('figure');if(f)f.remove();g.classList.add('sem')};im.onclick=()=>{const w=document.createElement('div');w.className='ajzoom';w.innerHTML=`<img src="${im.src}" alt="${esc(im.alt)}">`;w.onclick=()=>w.remove();document.body.appendChild(w)}});
  const h=$('#view .ajhd p');if(h&&!h.dataset.t){h.dataset.t=1;h.innerHTML='Tudo o que a app faz, passo a passo, com animações e capturas do ecrã no tema que está a usar (<b>'+AJ_TEMAS[t]+'</b>).'}}catch(e){console.warn(e)}return r};if(go._f)go._f.ajuda=vAjuda}

addEventListener('pageshow',e=>{if(e.persisted)go('inicio')});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-org2]');if(b)mudarOrg(A(),b.dataset.org2);const mz=e.target.closest&&e.target.closest('[data-mzok]');if(mz){const [tid,iid]=mz.dataset.mzok.split('|');const t=A().turmas.find(x=>x.id===tid);const i=t&&t.instrumentos.find(x=>x.id===iid);if(i){i.matrizEnviada=Date.now();saveNow();toast('Matriz de '+i.nome+' marcada como enviada','ok');go(VIEW)}}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cal-prop,#cal-prop-imp');if(!b)return;const a=A();if(b.id==='cal-prop'){a.calendario=JSON.parse(JSON.stringify(a.calendario));saveNow();toast('Calendário próprio criado (cópia) para '+nomeEscola(EC()),'ok');go('calendario')}else pickCalendario()});
document.addEventListener('change',e=>{if(e.target.id==='org-f1'){const a=A();a.calendario.fimS1=e.target.value;a.calendario.periodos=semestresDe(a.calendario);saveNow();go(VIEW);toast('Semestres recalculados','ok')}});
document.addEventListener('input',e=>{const t=e.target;if(t.matches&&t.matches('.nmw textarea'))t.parentElement.dataset.v=t.value});
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t.matches&&t.matches('.nmw textarea')){e.preventDefault();t.blur()}});
})();
