/* EduSpruce · navigator.onLine engana-se em alguns computadores (VPN, bloqueadores como o AdGuard, filtros de rede):
   diz «sem internet» com internet, e a app deixava de guardar, de procurar versões novas e de entrar.
   Passa a valer o que a rede faz de facto: se o navegador disser «sem rede», confirma-se com um pedido real. */
(()=>{try{const d=Object.getOwnPropertyDescriptor(Navigator.prototype,'onLine');if(!d||!d.get)return;const orig=d.get;let ok=true,quando=0,emCurso=null;
  const marca=v=>{const antes=ok;ok=v;quando=Date.now();if(v&&!antes)try{dispatchEvent(new Event('online'))}catch(_){}};
  const testa=()=>emCurso||(emCurso=fetch('versao.json?_rede='+Date.now().toString(36),{cache:'no-store'}).then(r=>marca(!!r.ok||r.status<500),()=>marca(false)).finally(()=>emCurso=null));
  Object.defineProperty(Navigator.prototype,'onLine',{configurable:true,get(){if(orig.call(this))return true;if(Date.now()-quando>15000)testa();return ok}});
  const f=window.fetch;window.fetch=function(){return f.apply(this,arguments).then(r=>{ok=true;quando=Date.now();return r},e=>{if(!orig.call(navigator)){ok=false;quando=Date.now()}throw e})};
  addEventListener('offline',()=>testa());setInterval(()=>{if(!orig.call(navigator))testa()},30000)}catch(_){}})();
