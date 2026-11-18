/* ===================== cabecalho sem recalculos repetidos ===================== */
/* O cabeçalho (cabecalho/barLayout) é recalculado por vários caminhos depois de cada mudança de vista — a navegação, 350 ms depois,
   os observadores de tamanho, o alinhamento com a página, as cores do módulo… —, e cada cálculo mede a barra muitas vezes (incluindo a passagem
   de botões para «Mais»). Na maioria dessas vezes nada mudou desde o último cálculo. Aqui guarda-se a «impressão» da barra no fim de cada
   cálculo (o conteúdo e os estilos da barra, o tamanho da janela e dos seus elementos, as classes da página, as letras); se, no pedido seguinte,
   a impressão for a mesma, o resultado já está aplicado e não se volta a calcular. Qualquer diferença (outra vista, outro título, outro botão,
   outra largura, uma imagem que acabou de carregar) faz o cálculo completo como antes. */
{const _cabM=cabecalho;let _cabFim=null;
  const impressao=()=>{const b=document.getElementById('bar');if(!b)return null;const de=document.documentElement,bd=document.body;
    let h='';if(VIEW==='inicio'){const e=document.querySelector('#view .in-hero');h=e?Math.round(e.getBoundingClientRect().left):-1}
    return [innerWidth,innerHeight,devicePixelRatio,VIEW,bd.className,de.className,de.getAttribute('style')||'',document.fonts?document.fonts.status:'',document.styleSheets.length,
      b.clientWidth,b.offsetHeight,[...b.children].map(e=>e.offsetWidth+'x'+e.offsetHeight).join(','),h,b.outerHTML].join('\u0001')};
  cabecalho=function(){let s0=null;try{s0=impressao()}catch(_){}if(s0!==null&&s0===_cabFim)return;
    _cabFim=null;let r;try{r=_cabM.apply(this,arguments)}finally{try{_cabFim=impressao()}catch(_){_cabFim=null}}return r};
  try{cabecalho.aperto=_cabM.aperto||0}catch(_){}}
