/* =====================================================================
   IMPORTAÇÃO DE ALUNOS — Excel exportado do programa da escola
   (Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel)
   ===================================================================== */
const CAMINHO_EXCEL='Área do docente > Turma > Fotos > Gerar Relatório > Exportação Excel';
function dicaExcel(){return `<span class="dica" tabindex="0" role="button" aria-label="Onde obter o Excel">${ic('info',16)}<span class="dica-t"><b>Onde obter o Excel com as fotos</b><br>${CAMINHO_EXCEL.split(' > ').map(x=>'<span class="cam">'+esc(x)+'</span>').join(' › ')}</span></span>`}
function pickPdf(cb){const f=$('#pdfIn');f.value='';f.onchange=()=>{if(f.files[0])lerFicheiro(f.files[0]).then(cb)};f.click()}
function dropZone(el,cb){
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over')});
  el.addEventListener('dragleave',()=>el.classList.remove('over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');const f=e.dataTransfer.files[0];if(f)lerFicheiro(f).then(cb)});
}
const RE_DATA=/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b|\b(\d{4})-(\d{2})-(\d{2})\b/;
const RE_NOME=/^[\p{L}][\p{L}'’.\-]*(\s+[\p{L}][\p{L}'’.\-]*)+$/u;
const PALAVRAS_CAB=/^(n\.?º|nº|número|numero|nome|aluno|alunos|processo|sexo|género|genero|data|turma|ano|escola|idade|ee|encarregado|lista|página|pagina)\b/i;
const RE_SEXO=/^(M|F|Masc\.?|Fem\.?|Masculino|Feminino|Sim|Não|Nao)$/i;
function detTurma(s){
  const tm=s.match(/turma[ \t]*[:\-]?[ \t]*(\d{1,2})[ \t]*\.?[ \t]*[º°o]?[ \t]*(?:ano[ \t]*)?[ \t\-]*([A-Z]{1,2}\d?)\b/i)||s.match(/\b(\d{1,2})[ \t]*\.?[ \t]*[º°][ \t]*(?:ano[ \t]*)?[ \t\-–]*(?:turma[ \t]*)?([A-Z])\b/i);
  return tm?tm[1]+'.º '+tm[2].toUpperCase():'';
}
const limpaNome=s=>{const n=s.replace(/\s+/g,' ').trim();return n===n.toUpperCase()?titleCase(n):n};
/* ---------- método TABELA ---------- */
function parseLinhas(linhas){
  linhas=linhas.map(l=>Array.isArray(l)?{cells:l}:l);
  const txt=linhas.map(l=>l.cells.join(' ')).join('\n');
  const turma=detTurma(txt);
  const ano=(txt.match(/(\d{4})\s*\/\s*(\d{4})/)||[]).slice(1,3).join('/');
  const alunos=[];const vistos=new Set();
  linhas.forEach(l=>{
    const full=l.cells.join(' ').replace(/\s+/g,' ').trim();if(!full||PALAVRAS_CAB.test(full))return;
    let processo='',genero='',nasc='';
    const m=full.match(/^(\d{1,2})\s*[.)\-]?\s+(.*)$/);if(!m)return;
    const num=+m[1];if(num<1||num>60)return;let rest=m[2];
    const pm=rest.match(/^\(?(\d{3,})\)?\s+(.*)$/);if(pm){processo=pm[1];rest=pm[2]}
    const dm=rest.match(RE_DATA);if(dm)nasc=dm[4]?`${dm[4]}-${dm[5]}-${dm[6]}`:`${dm[3]}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`;
    const nt=[];for(const w of rest.split(/\s+/)){if(/^\p{L}[\p{L}'’.\-]*$/u.test(w)&&!RE_SEXO.test(w))nt.push(w);else break}
    if(!processo){const p2=rest.match(/\s\(?(\d{4,})\)?(\s|$)/);if(p2)processo=p2[1]}
    const g=rest.match(/(?:^|\s)(M|F|Masculino|Feminino|Masc\.?|Fem\.?)(?=\s|$)/i);if(g)genero=/^f/i.test(g[1])?'F':'M';
    let nome=nt.join(' ');if(nt.length<2||!RE_NOME.test(nome))return;nome=limpaNome(nome);
    const k=num+'|'+nome;if(vistos.has(k))return;vistos.add(k);
    alunos.push({num,processo,nome,genero:genero||guessGen(nome),generoManual:!!genero,nasc,frequenta:true,turma,p:l.p,bx:l.y!=null?{x1:l.x1,x2:l.x2,y1:l.y-l.h*.3,y2:l.y+l.h}:null});
  });
  return {alunos,turma,ano};
}
function cortaFoto(src,x,y,w,h){const Q={alta:[320,.9],media:[240,.85],baixa:[160,.78]}[(S.cfg&&S.cfg.fotoQ)||'media'];const W=Math.round(Math.min(Q[0],Math.max(120,w))),H=Math.round(W*h/w);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(src,x,y,w,h,0,0,W,H);return c.toDataURL('image/jpeg',Q[1])}
function fotoDeFicheiro(file){return new Promise((ok,ko)=>{const img=new Image();img.onload=()=>{const s=Math.min(img.width,img.height*0.8);const w=s,h=s*1.25>img.height?img.height:s*1.25;ok(cortaFoto(img,(img.width-w)/2,(img.height-h)/2,w,h));URL.revokeObjectURL(img.src)};img.onerror=()=>ko(new Error('Imagem inválida'));img.src=URL.createObjectURL(file)})}
