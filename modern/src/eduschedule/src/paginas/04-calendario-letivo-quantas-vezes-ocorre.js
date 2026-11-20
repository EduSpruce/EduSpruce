/* ---------- calendário letivo: quantas vezes ocorre cada dia da semana ---------- */
function diasLetivos(ate){
  const cnt=[0,0,0,0,0,0,0];if(!S.inicio||!S.fim)return cnt;
  const end=ate&&ate<S.fim?ate:S.fim;let d=new Date(S.inicio+'T12:00:00');const fim=new Date(end+'T12:00:00');
  for(let i=0;i<400&&d<=fim;i++,d.setDate(d.getDate()+1)){const iso=d.toISOString().slice(0,10),wd=(d.getDay()+6)%7;if(wd<S.days.length&&!feriasEm(iso))cnt[wd]++;}
  return cnt;
}
