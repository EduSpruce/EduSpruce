/* ===================== 1.139 · ecrã do código: teclado com letras, entrada escalonada e onda ao tocar ===================== */
{const _pp=pedirPin;pedirPin=function(){const pr=_pp.apply(this,arguments);try{const L={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};
  const k=document.querySelector('#login.pinmode .pdk');if(k&&!k.dataset.pn){k.dataset.pn=1;
    k.querySelectorAll('button').forEach((b,i)=>{b.style.setProperty('--i',i);const n=b.dataset.pk;if(/^\d$/.test(n))b.innerHTML=n+'<small>'+(L[n]||'&nbsp;')+'</small>';
      b.addEventListener('pointerdown',e=>{const r=b.getBoundingClientRect(),s=document.createElement('span');s.className='pnond';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';b.appendChild(s);setTimeout(()=>s.remove(),520)})})}}catch(_){}return pr}}
