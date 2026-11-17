/* ===== interface (parte 4: substituições, reuniões, vigilâncias, listagens, impressão, ficheiro, arranque) ===== */
const feriasEm=d=>S.ferias.find(f=>f.de&&d>=f.de&&d<=(f.ate||f.de));
const popc=x=>{let n=0;while(x){n+=x&1;x>>>=1;}return n;};

