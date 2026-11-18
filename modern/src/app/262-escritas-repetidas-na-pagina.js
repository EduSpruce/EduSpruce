/* ===================== escritas repetidas na pagina ===================== */
/* Escrever num elemento o valor que ele já tem não muda nada no ecrã, mas o navegador avisava na mesma todos os observadores
   da página (acessibilidade, permissões, glossário, ilustrações, cabeçalho…), que voltavam a percorrê-la — com a app parada,
   várias vezes por segundo. Aqui essas escritas repetidas deixam de contar como alterações: só as verdadeiras acordam os observadores.
   (só elementos HTML; ficam de fora os atributos em que repetir o valor tem efeito: src, href, srcdoc, data, value) */
(()=>{try{
  if(window.__esEscr)return;window.__esEscr=1;const XH='http://www.w3.org/1999/xhtml';
  const EP=Element.prototype,sa=EP.setAttribute;const FORA={src:1,href:1,srcdoc:1,data:1,value:1,action:1,poster:1};
  EP.setAttribute=function(n,v){if(typeof n==='string'&&!FORA[n]&&this.namespaceURI===XH&&this.getAttribute(n)===String(v))return;return sa.call(this,n,v)};
  const TP=DOMTokenList.prototype,ad=TP.add,tg=TP.toggle;
  TP.add=function(){for(let i=0;i<arguments.length;i++)if(!this.contains(arguments[i]))return ad.apply(this,arguments)};
  TP.toggle=function(t,f){if(f===true&&this.contains(t))return true;return tg.apply(this,arguments)};
  const igual=(P,nome,ler)=>{const d=Object.getOwnPropertyDescriptor(P,nome);if(!d||!d.set||!d.get||!d.configurable)return;const g=d.get,s=d.set;
    Object.defineProperty(P,nome,{configurable:true,enumerable:d.enumerable,get:g,set(v){if(ler(this,v,g))return;s.call(this,v)}})};
  igual(HTMLElement.prototype,'title',(e,v,g)=>e.hasAttribute('title')&&g.call(e)===String(v));
  igual(EP,'className',(e,v,g)=>e.namespaceURI===XH&&e.hasAttribute('class')&&g.call(e)===String(v));
  /* o mesmo texto no mesmo sítio (contagens, relógios, estados): não se volta a escrever */
  igual(Node.prototype,'textContent',(e,v)=>{if(e.nodeType!==1||v==null)return false;const c=e.firstChild;return !!c&&c===e.lastChild&&c.nodeType===3&&c.data===String(v)});
}catch(e){console.warn(e)}})();
