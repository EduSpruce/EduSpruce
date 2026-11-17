/* ===================== v0.39: apagar tudo a 100% · contexto só quando existe ===================== */
async function apagarTudo100(){
  const r=await avisoModal('Apagar TODOS os dados deste dispositivo?',['Anos letivos, turmas, alunos, fotografias, classificações, sumários, horários, documentos e evidências.','Escola, logótipo, professor, utilizadores e perfis, definições, temas e notas.','Cópias de segurança internas e o caixote do lixo. Esta ação não pode ser anulada.','A cópia na nuvem (OneDrive/Google Drive), se existir, não é apagada — apenas se desliga deste dispositivo.'],[{t:ic('download',15)+' Exportar Cópia Primeiro',v:'exp'},{t:ic('trash',15)+' Continuar',c:'dng',v:'sim'},{t:'Cancelar',v:null}]);
  if(r==='exp'){try{$('#bk-exp')?$('#bk-exp').click():toast('Use Definições › Segurança › Exportar','aviso')}catch(_){}return}
  if(r!=='sim')return;const w=prompt('Escreva APAGAR TUDO para confirmar:');if((w||'').trim().toUpperCase()!=='APAGAR TUDO')return toast('Nada foi apagado','aviso');
  window.__efApagar=true;const PG=apagProg();await PG.p(0);try{save=function(){};saveNow=function(){}}catch(_){}try{Storage.prototype.setItem=function(){};const _tx=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(n,m){if(m==='readwrite')throw new Error('apagado');return _tx.apply(this,arguments)};IDBFactory.prototype.open=function(){return {set onsuccess(f){},set onerror(f){},set onupgradeneeded(f){},addEventListener(){}}}}catch(_){}
  await PG.p(1);try{localStorage.clear()}catch(_){}try{sessionStorage.clear()}catch(_){}
  await PG.p(2);try{const L=indexedDB.databases?await indexedDB.databases():[{name:'edugest'}];await Promise.all([...L.map(d=>d.name),'edugest','eduflow-ev'].filter((x,k,a)=>x&&a.indexOf(x)===k).map(n=>new Promise(ok=>{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>ok()})))}catch(_){}
  await PG.p(3);try{if(window.caches){const K=await caches.keys();await Promise.all(K.map(k=>caches.delete(k)))}}catch(_){}
  await PG.p(4);try{if(navigator.serviceWorker){const R=await navigator.serviceWorker.getRegistrations();await Promise.all(R.map(x=>x.unregister()))}}catch(_){}
  await PG.p(5);try{document.cookie.split(';').forEach(c=>{const n=c.split('=')[0].trim();if(n)document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'})}catch(_){}
  await PG.fim();location.reload()}
addEventListener('beforeunload',e=>{if(window.__efApagar)e.stopImmediatePropagation()},true);
{const _vd=vDefinicoes;vDefinicoes=function(){const r=_vd.apply(this,arguments);try{const b=$('#bk-zero');if(b){const n=b.cloneNode(true);n.innerHTML=ic('trash',14)+' Apagar Tudo (100%)';b.replaceWith(n);n.onclick=apagarTudo100}}catch(e){console.warn(e)}return r};if(go._f)go._f.definicoes=vDefinicoes}
/* barra: ano letivo e turma só aparecem quando existem */
{const _fc2=fillCtx;fillCtx=function(){const r=_fc2.apply(this,arguments);try{const temAno=!!(S.anos&&S.anos.length);const a=temAno&&A();const temT=!!(a&&a.turmas&&a.turmas.length);
  const ca=$('#ctxAno');if(ca)ca.style.display=temAno?'':'none';const st=$('#selTurma');const ct=st&&st.closest('.ctx');if(ct)ct.style.display=temT?'':'none';
  const be=$('#ctxEsc');if(be&&!temAno&&!(EC()||{}).escola)be.style.display='none';document.body.classList.toggle('semdados',!temAno);document.body.classList.toggle('semctx',!temT)}catch(_){}return r}}

