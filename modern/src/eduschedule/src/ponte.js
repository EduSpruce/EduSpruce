/* ---------- EduSpruce: o EduSchedule abre dentro da EduSpruce e guarda os dados na conta (base de dados), nunca no aparelho ---------- */
const PONTE=(()=>{try{return window.parent!==window&&window.parent.__esched||null}catch(e){return null}})();
/* substitui o localStorage no código do EduSchedule: o horário e as cópias vão para a conta; só as preferências do ecrã (tema, letra) ficam no aparelho */
const ESTORE={
  _dados(k){return k==='planeador-horarios-v3'||k==='planeador-horarios-v2'},
  getItem(k){k=String(k);if(this._dados(k))return PONTE&&!PONTE.equipa&&k==='planeador-horarios-v3'?PONTE.ler():null;if(k.startsWith('ph-bk-'))return PONTE?(PONTE.copias()[k]||null):null;try{return localStorage.getItem(k)}catch(e){return null}},
  setItem(k,v){k=String(k);if(this._dados(k)){if(PONTE&&!PONTE.equipa)PONTE.gravar(String(v));return}if(k.startsWith('ph-bk-')){if(PONTE)PONTE.copia(k,String(v));return}localStorage.setItem(k,v)},
  removeItem(k){k=String(k);if(k.startsWith('ph-bk-')){if(PONTE)PONTE.copia(k,null);return}if(this._dados(k))return;try{localStorage.removeItem(k)}catch(e){}},
  _chaves(){const a=[];try{for(let i=0;i<localStorage.length;i++)a.push(localStorage.key(i))}catch(e){}return a.filter(k=>k&&!k.startsWith('ph-bk-')&&!this._dados(k)).concat(PONTE?Object.keys(PONTE.copias()):[])},
  get length(){return this._chaves().length},
  key(i){const c=this._chaves();return i<c.length?c[i]:null}
};
