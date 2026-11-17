/* =====================================================================
   ARRANQUE
   ===================================================================== */
window.addEventListener('afterprint',()=>document.body.classList.remove('print-landscape'));
window.addEventListener('beforeunload',saveNow);
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
window.EduGest={state:()=>S,integ:()=>verificarIntegridade(false),ocorrenciasTurma,datasImportantes,lerHorarioProfPdf,ui:()=>UI,go:v=>go(v),aulasPrevistas,CAL,lerCalendarioPdf,eventosCalendario,parseLinhas,lerXlsx,lerFicheiro,calc:{pctsPer,pctsFinal,ponderada,fmtNota}};
if(S.anos.length&&!A())S.anoAtivo=S.anos[0].id;
function fotosUsadas(){const o={};S.anos.forEach(an=>an.turmas.forEach(t=>t.alunos.forEach(a=>{if(a.foto&&a.foto.startsWith('f:')){const k=a.foto.slice(2);if(FOTOS[k])o[k]=FOTOS[k]}})));return o}
$$('[data-ico]').forEach(el=>el.outerHTML=ic(el.dataset.ico,18));
{let dt;new MutationObserver(()=>{clearTimeout(dt);dt=setTimeout(()=>decorar(),0)}).observe(document.body,{childList:true,subtree:true})}
/* =====================================================================
   v0.23 — 100 MELHORIAS: preferências, navegação, toque, acessibilidade,
   dados/segurança, ferramentas
   ===================================================================== */
const ACENTOS={azul:['#2563eb','#60a5fa'],verde:['#1a7f4b','#4cd38a'],roxo:['#6d3fd1','#b28cff'],laranja:['#c25e00','#ffab5a'],rosa:['#c2185b','#ff7eb3'],petroleo:['#0e7c86','#4fd1db'],grafite:['#3c4656','#a9b6c8']};
/* paleta para daltonismo (Okabe-Ito) aplicada aos tipos de dia */
const DALT={letivo:'#9ad0f5',inicio:'#e69f00',inicio2:'#009e73',termo:'#f0e442',interrupcao:'#0072b2',feriadoN:'#cc79a7',feriadoR:'#d55e00',feriadoM:'#882255'};
const TIPOS_DIA_ORIG=JSON.parse(JSON.stringify(TIPOS_DIA));
const NAV_OPC=[['meuhorario','O Meu Horário'],['calendario','Calendário Escolar'],['horario','Horário (turma)'],['testes','Marcação de Testes'],['criterios','Critérios'],['instrumentos','Instrumentos'],['dominios','Domínios'],['avaliacao','Avaliação Final'],['relatorios','Relatórios'],['escola','Escola']];
const ESTILO_DEF='sge';
function aplicarPrefs(){
  try{const d={tema:'light',estilo:'sge',acento:'azul',logoApp:'auto',animPerfil:'cheio'};Object.keys(d).forEach(k=>{if(S.cfg[k]===undefined||S.cfg[k]===null||S.cfg[k]==='')S.cfg[k]=d[k]})}catch(_){}
  const c=S.cfg,r=document.documentElement,b=document.body;
  aplicarTema();
  const ac=ACENTOS[c.acento||'azul']||ACENTOS.azul;r.style.setProperty('--accL',ac[0]);r.style.setProperty('--accD',ac[1]);
  b.classList.toggle('compacto',c.densidade==='compacto');b.classList.toggle('estilo-azul',(c.estilo||ESTILO_DEF)==='azul');
  b.classList.toggle('hc',!!c.altoContraste);
  b.classList.toggle('dalt',!!c.daltonico);
  b.classList.toggle('letra-sis',c.letra==='sistema');
  r.style.setProperty('--zoom',c.letra&&c.letra!=='sistema'?String(+c.letra/100):'1');
  Object.keys(TIPOS_DIA_ORIG).forEach(k=>{TIPOS_DIA[k].cor=c.daltonico&&DALT[k]?DALT[k]:TIPOS_DIA_ORIG[k].cor;TIPOS_DIA[k].n=TIPOS_DIA_ORIG[k].n});
  $$('#side .nav').forEach(n=>n.style.display=(c.navOculto||[]).includes(n.dataset.v)?'none':'');
}
/* ---------- avisos (toast) com ícone, lidos pelo leitor de ecrã ---------- */
function toast(m,tipo){const t=$('#toast');if(!t)return;tipo=tipo||(/erro|não foi|inválid/i.test(m)?'erro':/atenção|aviso|sem aula|sobrepõe/i.test(m)?'aviso':'ok');
  t.className='';t.innerHTML=`<span class="ti">${ic(tipo==='erro'?'alert':tipo==='aviso'?'info':'check',15)}</span><span>${esc(m)}</span>`;void t.offsetWidth;t.className='on t-'+tipo;
  const dur=tipo==='erro'?5000:3000;t.dataset.ate=Date.now()+dur;clearTimeout(window.__toastT);window.__toastT=setTimeout(()=>t.classList.remove('on'),dur)}
setInterval(()=>{const t=document.getElementById('toast');if(t&&t.classList.contains('on')&&Date.now()>(+t.dataset.ate||0)+400)t.classList.remove('on')},1000);document.addEventListener('pointerdown',e=>{const t=document.getElementById('toast');if(t&&t.classList.contains('on')&&Date.now()>(+t.dataset.ate||0))t.classList.remove('on')},true);
/* ---------- indicador de ocupado (importações) ---------- */
function ocupado(msg){let o=$('#ocup');if(!o){o=document.createElement('div');o.id='ocup';o.setAttribute('role','status');document.body.appendChild(o)}o.innerHTML=`<div class="ocb"><span class="spin"></span><b>${esc(msg||'A trabalhar…')}</b><div class="skl"><i></i><i></i><i></i></div></div>`;o.classList.add('on')}
function livre(){const o=$('#ocup');if(o)o.classList.remove('on')}
/* ---------- migalhas (Ano › Turma › Secção) ---------- */
function migalhas(v){const el=$('#crumb');if(!el)return;const a=A(),t=T();const parts=[];
  if(a)parts.push(`<a href="#" data-cr="turmas">${esc(a.nome)}</a>`);if(t&&NEEDS_T.includes(v))parts.push(`<a href="#" data-cr="alunos">${esc(t.nome)} · ${esc(t.disciplina)}</a>`);parts.push(`<span>${esc(TITLES[v]||'')}</span>`);
  el.innerHTML=parts.join('<i>›</i>');el.querySelectorAll('[data-cr]').forEach(x=>x.onclick=e=>{e.preventDefault();go(x.dataset.cr)})}
/* ---------- cabeçalho de impressão uniforme ---------- */
function cabecalhoImpressao(v){let h=$('#printHdr');if(!h){h=document.createElement('div');h.id='printHdr';$('#main').prepend(h)}const a=A(),t=T(),c={...S.cfg,...escolaDe(t)};
  h.innerHTML=`${c.logo?`<img src="${esc(c.logo)}" alt="">`:''}<div><b>${esc(c.escola||'EduSpruce')}</b><span>${esc(TITLES[v]||'')}${t&&NEEDS_T.includes(v)?' — '+esc(t.nome+' · '+t.disciplina):''}${a?' · Ano letivo '+esc(a.nome):''}</span></div><span class="pd">${esc(profNome(c.professor))}<br>${new Date().toLocaleDateString('pt-PT')}</span>`}
/* ---------- dicas por toque longo / passar o rato (substituem title) ---------- */
(function(){let tm=null,bx=null,src=null;
  const mostra=(el,x,y)=>{const tx=el.getAttribute('data-tip')||el.getAttribute('title');if(!tx)return;if(el.hasAttribute('title')){el.setAttribute('data-tip',tx);el.removeAttribute('title')}
    bx=bx||Object.assign(document.createElement('div'),{id:'tipbox'});bx.setAttribute('role','tooltip');bx.textContent=tx;document.body.appendChild(bx);
    const w=Math.min(320,innerWidth-24);bx.style.maxWidth=w+'px';const r=el.getBoundingClientRect();let L=Math.max(12,Math.min(innerWidth-w-12,(x!=null?x:r.left+r.width/2)-w/2));
    bx.style.left=L+'px';bx.style.top=Math.max(8,r.top-8)+'px';bx.classList.add('on');requestAnimationFrame(()=>{const h=bx.offsetHeight;bx.style.top=(r.top-h-10<8?r.bottom+10:r.top-h-10)+'px'})};
  const esconde=()=>{clearTimeout(tm);if(bx)bx.classList.remove('on')};
  document.addEventListener('pointerdown',e=>{esconde();if(e.pointerType==='mouse')return;const el=e.target.closest('[title],[data-tip]');if(!el)return;src=el;tm=setTimeout(()=>{mostra(el,e.clientX,e.clientY);el._tipShown=true},520)},true);
  document.addEventListener('pointerup',()=>clearTimeout(tm),true);document.addEventListener('pointercancel',esconde,true);document.addEventListener('scroll',esconde,true);
  document.addEventListener('click',e=>{if(src&&src._tipShown){src._tipShown=false;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[title],[data-tip]');if(!el){esconde();return}clearTimeout(tm);tm=setTimeout(()=>mostra(el),450)});
})();
/* ---------- menu de contexto (toque longo / botão direito) ---------- */
function menuContexto(x,y,itens){fecharMenu();const m=document.createElement('div');m.id='cmenu';m.setAttribute('role','menu');
  m.innerHTML=itens.map((it,k)=>it==='-'?'<hr>':`<button role="menuitem" data-k="${k}" class="${it.dng?'dng':''}">${ic(it.ic||'check',16)} ${esc(it.t)}</button>`).join('');document.body.appendChild(m);
  const w=m.offsetWidth,h=m.offsetHeight;m.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+'px';m.style.top=Math.max(8,Math.min(innerHeight-h-8,y))+'px';m.classList.add('on');
  m.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{fecharMenu();itens[+b.dataset.k].f()});const f=m.querySelector('button');if(f)f.focus();
  setTimeout(()=>document.addEventListener('pointerdown',fora,{once:true}),0);function fora(e){if(!m.contains(e.target))fecharMenu();else document.addEventListener('pointerdown',fora,{once:true})}}
function fecharMenu(){const m=$('#cmenu');if(m)m.remove()}
function longoToque(el,cb){let tm=null,x0,y0;el.addEventListener('contextmenu',e=>{e.preventDefault();cb(e.clientX,e.clientY)});
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;x0=e.clientX;y0=e.clientY;tm=setTimeout(()=>{el._lp=true;vibrar();cb(x0,y0)},560)});
  el.addEventListener('pointermove',e=>{if(tm&&Math.hypot(e.clientX-x0,e.clientY-y0)>10){clearTimeout(tm);tm=null}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,()=>clearTimeout(tm)));
  el.addEventListener('click',e=>{if(el._lp){el._lp=false;e.stopImmediatePropagation();e.preventDefault()}},true)}
const vibrar=()=>{try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
