/* ===================== v1.046 · Perfis de Aprendizagem: impressão completa e organizada =====================
   «Imprimir» mostra TODAS as secções (ignora o que está escondido em «Mostrar»), abre «Ver todos os domínios», troca campos por texto,
   acrescenta cabeçalho (escola, turma, disciplina, período, data) e rodapé, imprime em A4 e repõe o ecrã como estava. */
function perfilImprimir(){const o=document.getElementById('perfilap');if(!o)return;const t=T();const pb=o.querySelector('[data-pap].on');
  const guard=JSON.stringify(S.cfg.perfilOcultos||null);S.cfg.perfilOcultos={normal:[],proj:[]};
  const repor=()=>{S.cfg.perfilOcultos=JSON.parse(guard)||undefined;if(!S.cfg.perfilOcultos)delete S.cfg.perfilOcultos;document.body.classList.remove('perfil-print');const b=document.querySelector('#perfilap [data-pap].on');if(b)b.click()};
  if(pb)pb.click();
  setTimeout(()=>{try{const ab=o.querySelector('.pab');if(!ab){repor();return}
    ab.querySelectorAll('details').forEach(d=>d.open=true);
    ab.querySelectorAll('textarea,input:not([type=checkbox]):not([type=radio])').forEach(e=>{const v=String(e.value||'').trim();const d=document.createElement('div');d.className='pprtv'+(v?'':' vaz');d.textContent=v||'—';e.after(d)});
    const nm=(o.querySelector('.pid h1')||{}).textContent||'';const per=pb?pb.textContent.trim():'';const esc_=(()=>{try{const e=escolaDe(t);const n=typeof e==='string'?e:nomeEscola(e);return /sem nome/.test(n)?'':n}catch(_){return ''}})();
    const hj=new Date().toLocaleDateString('pt-PT',{day:'numeric',month:'long',year:'numeric'});
    ab.insertAdjacentHTML('afterbegin',`<div class="pprth"><div><b>Perfil de Aprendizagem</b><span>${esc(t?t.nome+' · '+t.disciplina:'')}${per?' · '+esc(per.replace('Per.','período')):''}</span></div><div class="pprtr">${esc_?`<span>${esc(esc_)}</span>`:''}<span>${esc(hj)}</span></div></div>`);
    ab.insertAdjacentHTML('beforeend',`<div class="pprtf"><span>${esc(nm)}</span><span>EduSpruce · ${esc(VERSAO||'')}</span></div><div class="pprtas"><div><i></i>O(A) Professor(a)</div><div><i></i>O(A) Aluno(a)</div><div><i></i>O(A) Encarregado(a) de Educação</div></div>`);
    document.body.classList.add('perfil-print');let feito=false;const fim=()=>{if(feito)return;feito=true;window.removeEventListener('afterprint',fim);repor()};window.addEventListener('afterprint',fim);
    setTimeout(()=>{try{window.print()}catch(_){}setTimeout(fim,400)},80)}catch(e){console.warn(e);repor()}},180)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#perfilap #pa-pr');if(!b)return;e.preventDefault();e.stopImmediatePropagation();perfilImprimir()},true);

