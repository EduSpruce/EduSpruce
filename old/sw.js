/* EduSpruce · esta cópia antiga da app foi retirada: limpa o que estava guardado e recarrega (passa a abrir eduspruce.pt) */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>{e.waitUntil((async()=>{try{const K=await caches.keys();await Promise.all(K.map(k=>caches.delete(k)))}catch(_){}
  try{await self.registration.unregister()}catch(_){}
  try{const L=await self.clients.matchAll({type:"window",includeUncontrolled:true});for(const c of L){try{await c.navigate(c.url)}catch(_){}}}catch(_){}})())});
self.addEventListener("fetch",()=>{});
