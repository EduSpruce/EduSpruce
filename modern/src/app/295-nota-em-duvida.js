/* ===================== Nota em dúvida: aviso visível quando a nota mostrada e a classificação não coincidem ===================== */
/* turmas 0–20: a nota mostra-se com as casas decimais das Definições, mas a classificação arredonda a nota exata uma só vez
   (exata 9,45 → mostra-se 9,5 → a classificação é 9). Sem dados ou no básico (níveis 1–5) não há dúvida. */
function _ndvTxt(v,d){return (+v).toFixed(d).replace('.',',')}
/* nota exata escrita sem arredondar (corta em 3 casas, para nunca parecer mais alta do que é) */
function _ndvExata(v){const c=Math.floor(+(v*1000).toFixed(6))/1000;const s=String(c).replace('.',',');return Math.abs(v-c)>1e-6?s+'…':s}
function notaDuvidaInfo(t,f){if(f==null||!isFinite(f)||!t||!isSec(t))return null;const d=notaDec();if(!d)return null;
  const v=f*20;const k=Math.pow(10,d);const mos=Math.round(+(v*k).toFixed(6))/k;const fin=Math.round(+(v).toFixed(6));
  if(Math.round(+(mos).toFixed(6))===fin)return null;return {exata:_ndvExata(v),mostra:_ndvTxt(mos,d),fica:fin}}
function notaDuvida(t,f){return !!notaDuvidaInfo(t,f)}
function _ndvHtml(curto,titulo){return `<span class="ndv noprint" role="note" title="${esc(titulo)}" aria-label="${esc(titulo)}">${ic('alert',12)}<span>${esc(curto)}</span></span>`}
/* aviso junto da nota final (Avaliação Final e Avaliação Final da unidade) */
function notaDuvidaHtml(t,f){const o=notaDuvidaInfo(t,f);if(!o)return '';
  return _ndvHtml(o.exata+' → '+o.fica,`A nota exata é ${o.exata}. Mostra-se ${o.mostra} por causa das casas decimais, mas a classificação arredonda uma só vez: fica ${o.fica}. Se quiser outra nota, escreva-a em “Atribuída”.`)}
/* aviso na grelha das notas dos módulos: valor antigo gravado com décimas */
function notaDuvidaGravada(v){if(v==null||v===''||!isFinite(+v))return '';const n=+v;const fin=Math.round(+(n).toFixed(6));if(Math.abs(n-fin)<1e-6)return '';
  const s=_ndvExata(n);return _ndvHtml(s+' → '+fin,`Esta nota foi gravada como ${s}. A nota final é sempre inteira: conta como ${fin}. Se não for essa a nota pretendida, corrija-a.`)}
/* banda da nota pela classificação arredondada (a mesma regra em cores e textos): 0 negativa · 1 suficiente · 2 bom (14 ou 70 %) · 3 muito bom (18 ou 90 %) */
function bandaNota(t,f){if(f==null||!isFinite(f)||negativa(t,f))return 0;const p=pctCanon(t,f);return p<70?1:p<90?2:3}
