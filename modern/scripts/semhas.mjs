// EduSpruce · tira o «:has()» das folhas de estilos da versão publicada.
// Porquê: uma regra «A:has(B)» com A no topo da página (#view, body, .card…) obriga o navegador a recalcular o estilo de tudo o que
// está dentro de A sempre que algo lá dentro muda. A app mexe na página dezenas de vezes em cada navegação, por isso num telemóvel
// modesto abrir os Alunos gastava ~0,9 s só nisso (medido: 32 recálculos; sem estas regras, ~0,2 s).
// Como: cada «A:has(B)» passa a «A.eh-N» e um pequeno programa no cabeçalho da página põe e tira a classe eh-N nos elementos que
// cumprem a condição (uma consulta por regra, sempre que a página muda — custa décimos de milissegundo). A especificidade da regra
// fica exatamente igual: «:where(.eh-N)» vale zero e «:not(falso)» repõe a de B.
// Ficam como estavam as condições que dependem de estados que não se conseguem observar (:checked, :hover, :focus…) e as do cabeçalho.
// O código-fonte não muda: nas peças continua a escrever-se :has() normalmente.
const ESTADO=/:(checked|hover|focus|focus-within|focus-visible|active|target|valid|invalid|placeholder-shown|disabled|enabled|indeterminate)\b/;
function fecho(s,i){let d=0;for(let k=i;k<s.length;k++){const c=s[k];if(c==='(')d++;else if(c===')'){d--;if(!d)return k}else if(c==='"'||c==="'"){const f=s.indexOf(c,k+1);if(f<0)return -1;k=f}}return -1}
function partes(s){const L=[];let d=0,a=0;for(let k=0;k<s.length;k++){const c=s[k];if(c==='('||c==='[')d++;else if(c===')'||c===']')d--;else if(c===','&&!d){L.push(s.slice(a,k));a=k+1}}L.push(s.slice(a));return L}
/* especificidade (ids, classes/atributos/pseudo-classes, tipos) de uma lista de seletores: a maior das alternativas */
export function espec(lista){let M=[0,0,0];for(const sel of partes(lista)){const e=[0,0,0];let k=0;const s=sel.trim();
    while(k<s.length){const c=s[k];
      if(c==='#'){e[0]++;k++;while(k<s.length&&/[\w\\-]/.test(s[k]))k++}
      else if(c==='.'){e[1]++;k++;while(k<s.length&&/[\w\\-]/.test(s[k]))k++}
      else if(c==='['){e[1]++;const f=s.indexOf(']',k);k=f<0?s.length:f+1}
      else if(c===':'){if(s[k+1]===':'){e[2]++;k+=2;while(k<s.length&&/[\w-]/.test(s[k]))k++;continue}
        let j=k+1;while(j<s.length&&/[\w-]/.test(s[j]))j++;const nome=s.slice(k+1,j);
        if(s[j]==='('){const f=fecho(s,j);const arg=s.slice(j+1,f<0?s.length:f);
          if(nome==='where'){}else if(nome==='is'||nome==='not'||nome==='has'){const x=espec(arg);e[0]+=x[0];e[1]+=x[1];e[2]+=x[2]}
          else{e[1]++;const m=/\bof\s+(.+)$/.exec(arg);if(m){const x=espec(m[1]);e[0]+=x[0];e[1]+=x[1];e[2]+=x[2]}}
          k=f<0?s.length:f+1}else{e[1]++;k=j}}
      else if(/[a-zA-Z]/.test(c)){e[2]++;while(k<s.length&&/[\w-]/.test(s[k]))k++}
      else k++}
    if(e[0]>M[0]||(e[0]===M[0]&&(e[1]>M[1]||(e[1]===M[1]&&e[2]>M[2]))))M=e}
  return M}
function falso([a,b,c]){if(!a&&!b&&!c)return '';const comp='#_h'.repeat(a)+'._h'.repeat(b);if(!c)return comp;return 'x-h '.repeat(c-1)+'x-h'+comp}
export function semHas(html){const tab=new Map(),pre=new Map();let n=0;
  const troca=(txt,soCss)=>{let out='',pos=0;
    for(;;){const i=txt.indexOf(':has(',pos);if(i<0)break;const f=fecho(txt,i+4);if(f<0){out+=txt.slice(pos,i+5);pos=i+5;continue}
      const arg=txt.slice(i+5,f).trim();let ok=!!arg&&!ESTADO.test(arg)&&!/[`$\n]/.test(arg);
      /* é mesmo uma regra de estilos? a seguir ao seletor tem de vir «{» (fora das folhas de estilos há :has() em consultas do código) */
      if(ok){let k=f+1,lim=Math.min(txt.length,f+500);for(;k<lim;k++){const c=txt[k];if(c==='{')break;if(c==="'"||c==='"'||c==='`'||c===';'||c==='$'||c==='}'||(c==='*'&&txt[k+1]==='/')){ok=false;break}}if(k>=lim)ok=false}
      /* composto à esquerda (o elemento que tem de cumprir a condição) */
      let a=i,d=0;if(ok){for(a=i-1;a>=0;a--){const c=txt[a];if(c===')'){d++;continue}if(c==='('){if(!d){break}d--;continue}if(d)continue;if(/[\s>+~,{}'"`;\/]/.test(c))break}a++}
      const comp=ok?txt.slice(a,i):'';if(ok&&ESTADO.test(comp))ok=false;
      /* o cabeçalho (#bar, #ttl) fica com :has() verdadeiro: o código que o ajusta muda classes e mede no mesmo instante, e precisa do
         estilo certo logo; como a condição só olha para dentro do cabeçalho, não obriga a recalcular a vista */
      if(ok&&/^#(bar|ttl)\b/.test(comp))ok=false;
      if(!ok){out+=txt.slice(pos,f+1);pos=f+1;continue}
      const q=(comp||'*')+':has('+arg+')';let cl=tab.get(q);if(!cl){cl='eh-'+(n++).toString(36);tab.set(q,cl);pre.set(q,partes(arg).map(x=>x.trim().replace(/^[>+~]\s*/,'')).join(','))}
      const fk=falso(espec(arg));out+=txt.slice(pos,i)+':where(.'+cl+')'+(fk?':not('+fk+')':'');pos=f+1}
    return out+txt.slice(pos)};
  const fimHead=html.indexOf('</head>');if(fimHead<0)throw new Error('semHas: </head> em falta');
  /* folhas de estilos do cabeçalho */
  let cab=html.slice(0,fimHead).replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,css,z)=>a+troca(css)+z);
  /* estilos que as peças juntam à página a partir do código */
  let resto=html.slice(fimHead).replace(/(<script>)([\s\S]*?)(<\/script>)/g,(m,a,js,z)=>js.length<1e5?m:a+troca(js)+z);
  if(tab.size<20)throw new Error('semHas: só '+tab.size+' regras encontradas — a página mudou de forma?');
  /* cada entrada: [consulta completa, classe, consulta rápida «existe alguma coisa que possa cumprir a condição?»] */
  const E=JSON.stringify([...tab].map(([q,c])=>[q,c,pre.get(q)]));
  /* atributos de que as condições dependem (além das classes): mudá-los também obriga a rever */
  const atr=new Set(['class','open','hidden']);for(const q of tab.keys())for(const m of q.matchAll(/\[\s*([\w-]+)/g))if(m[1]!=='style')atr.add(m[1]);const ATR=JSON.stringify([...atr]);
  /* corre logo à primeira mudança da página e, enquanto as mudanças continuam, uma vez por imagem (antes de o ecrã ser pintado);
     o temporizador de 50 ms é para quando o separador está escondido e o navegador não desenha imagens */
  const prog=`<script>/* condições :has() das folhas de estilos, mantidas por classes (ver modern/scripts/semhas.mjs) */(()=>{const E=${E},P=E.map(()=>[]);let u=0,ag=0;function s(){ag=0;u=performance.now();for(let i=0;i<E.length;i++){const a=P[i];let L=[];try{if(document.querySelector(E[i][2]))L=document.querySelectorAll(E[i][0])}catch(_){continue}if(!L.length&&!a.length)continue;const c=E[i][1],N=new Set(L);for(const e of a)if(!N.has(e))e.classList.remove(c);for(const e of L)if(!e.classList.contains(c))e.classList.add(c);P[i]=[...L]}}function r(){if(ag)s()}function m(){if(ag)return;if(performance.now()-u>120)s();else{ag=1;requestAnimationFrame(r);setTimeout(r,50)}}window.__ehS=s;new MutationObserver(m).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:${ATR}});s();document.addEventListener('DOMContentLoaded',s)})()</script>\n`;
  return cab+prog+resto}
