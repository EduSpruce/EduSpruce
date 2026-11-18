/* =====================================================================
   1.123 — Fechar Ano Letivo
   O botão «+ Ano Letivo» passa a «Fechar Ano Letivo»: fechar bloqueia e
   protege toda a informação do ano (só consulta e exportação) e abre logo
   a construção do ano letivo seguinte. Um ano fechado nunca é alterado:
   qualquer alteração é desfeita antes de gravar.
   ===================================================================== */
const anoFechado=a=>!!(a&&a.fechado);
let _anoRef={},_anoAviso=false,_anoRend=0,_anoToque=0,_anoLimpo=true;
/* ao primeiro toque depois de abrir uma vista, o que a vista preparou sozinha fica aceite; a partir daí qualquer alteração a um ano fechado é desfeita */
['pointerdown','keydown','drop','paste'].forEach(ev=>addEventListener(ev,()=>{_anoToque=Date.now();if(_anoLimpo){_anoLimpo=false;try{if((S.anos||[]).some(a=>a&&a.fechado))anoProteger(true)}catch(_){}}},true));
function fecharAnoDlg(){const a=A();if(!a)return;
  if(anoFechado(a)){const em=a.fechado.em?new Date(a.fechado.em).toLocaleDateString('pt-PT'):'';
    return avisoModal('Ano Letivo '+a.nome+' Fechado',['Fechado'+(em?' em '+em:'')+': toda a informação está bloqueada e protegida.','Pode consultar e exportar tudo, mas nada pode ser alterado.'],[{t:'Ok',v:0},{t:ic('plus',15)+' Novo Ano Letivo',v:1,c:'pri'},{t:ic('cadeadoAb',15)+' Reabrir',v:2}]).then(r=>{
      if(r===1)anoNovoDlg();if(r===2&&confirm('Reabrir o ano letivo '+a.nome+'? A informação volta a poder ser alterada.')){delete a.fechado;delete _anoRef[a.id];audit('Ano letivo','Reaberto',a.nome);saveNow();go(VIEW);toast('Ano letivo '+a.nome+' reaberto','ok')}})}
  const nT=a.turmas.length,nA=a.turmas.reduce((n,t)=>n+(t.alunos||[]).length,0);
  openDrawer('Fechar Ano Letivo '+a.nome,`<div class="ed">
    <div class="alert w">${ic('cadeado',16)} Ao fechar, <b>toda a informação de ${esc(a.nome)}</b> fica bloqueada e protegida: ${nT} turma${nT===1?'':'s'}, ${nA} aluno${nA===1?'':'s'}, avaliações, sumários, horários e calendário.</div>
    <ul class="hint" style="margin:10px 0 14px;padding-left:18px"><li>Continua a poder <b>consultar e exportar</b> tudo (pautas, relatórios, PDF).</li><li>Nada pode ser alterado nem apagado — qualquer alteração é desfeita.</li><li>A seguir começa a construção do novo ano letivo.</li></ul>
    <label for="fa-novo">Novo ano letivo</label><input id="fa-novo" value="${esc(sugAno())}" placeholder="2027/2028" inputmode="numeric">
    <label class="chk" style="margin-top:12px"><input type="checkbox" id="fa-ok"> <span>Confirmo que quero fechar o ano letivo <b>${esc(a.nome)}</b></span></label>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="fa-go" disabled>${ic('cadeado',15)} Fechar e Criar o Novo Ano</button><button class="btn" id="fa-x">Cancelar</button></div></div>`);
  const ok=$('#fa-ok'),go_=$('#fa-go');ok.onchange=()=>{go_.disabled=!ok.checked};$('#fa-x').onclick=closeDrawer;
  go_.onclick=()=>{const n=$('#fa-novo').value.trim();if(!/^\d{4}\/\d{4}$/.test(n))return toast('Use o formato 2027/2028','warn');if(n===a.nome)return toast('O novo ano tem de ser diferente do que vai fechar','warn');
    a.fechado={em:new Date().toISOString()};delete _anoRef[a.id];audit('Ano letivo','Fechado',a.nome);closeDrawer();novoAno(n);saveNow();go('turmas');toast('Ano letivo '+a.nome+' fechado e protegido. Construa agora '+n+'.','ok')}}
function anoNovoDlg(){const n=prompt('Novo ano letivo (ex.: '+anoAuto()+')',sugAno());if(!n)return;if(!/^\d{4}\/\d{4}$/.test(n.trim()))return alert('Use o formato 2026/2027.');novoAno(n.trim());go('turmas')}
/* proteção: um ano fechado volta sempre ao que estava gravado */
/* ao abrir uma vista, o que a própria vista prepara (sem o utilizador tocar em nada) é aceite; tudo o resto é desfeito */
function anoProteger(aceitar){let desfez=false;(S.anos||[]).forEach((a,i)=>{if(!a||!a.fechado){if(a)delete _anoRef[a.id];return}const r=_anoRef[a.id];let j;try{j=JSON.stringify(a)}catch(_){return}
    if(!r||r.em!==a.fechado.em){_anoRef[a.id]={em:a.fechado.em,j};return}if(j!==r.j){if(aceitar){r.j=j;return}try{S.anos[i]=JSON.parse(r.j);desfez=true;anoProteger.n=(anoProteger.n||0)+1;anoProteger.v=VIEW}catch(_){}}});return desfez}
function anoAvisar(){if(!anoFechado(A())||Date.now()-_anoToque>4000)return;
    if(!_anoAviso){_anoAviso=true;avisoModal('Ano Letivo Fechado',['O ano letivo '+A().nome+' está fechado: a informação está protegida e a alteração foi desfeita.','Pode consultar e exportar tudo. Para trabalhar, escolha o ano letivo atual.'],[{t:'Ok',v:0,c:'pri'}]).then(()=>{_anoAviso=false})}}
{const _svF=saveNow;saveNow=function(){let d=false;try{d=anoProteger(_anoLimpo)}catch(e){console.warn(e)}
  if(d&&Date.now()-_anoRend>1500){_anoRend=Date.now();try{if($('#drawer.on'))closeDrawer()}catch(_){}try{manterPosicao(()=>go(VIEW))}catch(_){try{go(VIEW)}catch(_){}}anoAvisar()}
  return _svF.apply(this,arguments)}}
/* aviso no cimo de cada vista de um ano fechado */
{const _gF=go;go=function(){try{if(anoProteger(_anoLimpo))anoAvisar()}catch(e){console.warn(e)}const r=_gF.apply(this,arguments);_anoLimpo=true;try{const a=A(),f=anoFechado(a);document.body.classList.toggle('ano-fechado',f);const v=$('#view');const ex=$('#anofx');if(ex)ex.remove();
    if(f&&v&&!(typeof EDUAPPS!=='undefined'&&EDUAPPS[VIEW])){v.insertAdjacentHTML('afterbegin',`<div id="anofx" class="anofx" role="status">${ic('cadeado',16)} <span>Ano letivo <b>${esc(a.nome)}</b> fechado — informação protegida, só para consulta e exportação.</span></div>`)}}catch(e){console.warn(e)}return r};try{Object.assign(go,_gF)}catch(_){}}
/* o botão fica encostado ao «Ano Letivo» do cabeçalho (sem mexer nas contas do cabeçalho: só desloca o que já coube na linha) */
function anoBotaoJunto(){const x=$('#barx'),b=$('#bar'),c=$('#ctxAno');if(!x)return;x.style.transform='';if(!b||!c||!$('#b-na')||!b.classList.contains('hx1')||!c.offsetWidth)return;
  const rx=x.getBoundingClientRect(),rc=c.getBoundingClientRect();if(Math.abs(rx.top-rc.top)>30)return;const dx=Math.round(rc.left-12-rx.right);if(dx>4)x.style.transform='translateX('+dx+'px)'}
{const _cb=cabecalho;cabecalho=function(){const r=_cb.apply(this,arguments);try{anoBotaoJunto()}catch(_){}return r};const _gB=go;go=function(){const r=_gB.apply(this,arguments);try{anoBotaoJunto();setTimeout(anoBotaoJunto,120);setTimeout(anoBotaoJunto,500)}catch(_){}return r};try{Object.assign(go,_gB)}catch(_){}}
