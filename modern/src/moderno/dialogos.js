/* ===================== 1.228 · avisos e erros com o aspeto da app =====================
   1) alert() nativo → aviso da app (não bloqueia a página nem destoa do tema):
      · frase curta de validação («Indique a data.», «Escolha…», «Escreva…») → toast de erro e foco no primeiro campo vazio do diálogo aberto;
      · resto → janela da app com OK (avisoModal), em fila, uma de cada vez.
      Exceção: antes de recarregar/sair da página (ver _alertNativo) fica o nativo, para a mensagem não se perder.
   2) Mensagens técnicas (SQL, Supabase, rede, erros de JavaScript) num toast → texto simples para o professor;
      o administrador continua a ver o detalhe. O detalhe vai sempre para o registo de erros (esErro).
   confirm() e prompt() ficam nativos: são síncronos e mudar isso exige rever cada chamada. */
(function(){
  const nativo=window.alert.bind(window);window._alertNativo=nativo;
  const VALID=/^(Indique|Escolha|Escreva|Selecione|Preencha|Defina primeiro|Cole primeiro|Use pelo menos)\b/;
  let fila=Promise.resolve();
  const focaVazio=()=>{try{const d=[...document.querySelectorAll('dialog[open],.drawer.open,#dw.open')].pop()||document;
    const c=[...d.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([disabled]),select:not([disabled]),textarea:not([disabled])')].find(x=>x.offsetParent!==null&&!String(x.value||'').trim());
    if(c){c.focus();c.classList.add('es-falta');setTimeout(()=>c.classList.remove('es-falta'),2200)}}catch(_){}};
  window.alert=function(m){try{const s=String(m==null?'':m);
      if(typeof toast!=='function'||typeof avisoModal!=='function')return nativo(s);
      if(s.length<=140&&!/\n/.test(s)&&VALID.test(s)){toast(s,'erro');focaVazio();return}
      const L=s.split(/\n+/).map(x=>x.replace(/^[•·-]\s*/,'').trim()).filter(Boolean);const tit=L.shift()||'Aviso';
      fila=fila.then(()=>avisoModal(tit,L,[{t:'OK',v:1,c:'pri'}])).catch(()=>{})}
    catch(_){return nativo(m)}};
  /* mensagens técnicas → texto simples (só para quem não administra) */
  const TEC=/\b(supabase|postgres|PGRST\d*|sql\b|\.sql\b|relation .* does not exist|violates|permission denied|row-level security|JWT|TypeError|ReferenceError|SyntaxError|undefined is not|is not a function|Cannot read propert|Failed to fetch|NetworkError|Load failed|fetch failed|status \d{3}|HTTP \d{3}|\b(401|403|404|409|500|502|503)\b|JSON|stack|at [\w$.]+ \()/i;
  const adm=()=>{try{return !!(SESSAO&&SESSAO.papel==='admin')}catch(_){return false}};
  const simples=s=>/Failed to fetch|NetworkError|Load failed|fetch failed|ERR_INTERNET|offline/i.test(s)?'Sem ligação à internet. Tente de novo daqui a pouco — o que escreveu não se perdeu.':'Não foi possível concluir esta operação. Tente de novo; se voltar a acontecer, avise o administrador.';
  if(typeof toast==='function'){const _tE=toast;toast=function(m,tipo){try{const s=String(m==null?'':m);
      if(TEC.test(s)&&!adm()){try{esErro('toast',s,VIEW||'')}catch(_){}arguments[0]=simples(s);arguments[1]='erro'}}catch(_){}return _tE.apply(this,arguments)}}
  try{const st=document.createElement('style');st.textContent='html body .es-falta{outline:2px solid var(--bad,#c62828)!important;outline-offset:1px}';document.head.appendChild(st)}catch(_){}
})();
