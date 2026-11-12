/* ===================== EduSpruce Arena · código comum (app do professor e página do aluno) =====================
   Pinhas (personagens originais em SVG), modos de jogo, sons sintetizados, filtro de alcunhas e cifra da lista da turma.
   Tudo original: nomes, desenhos, textos e sons. */
(function(){
const AR={};
AR.ALF='23456789ABCDEFGHJKMNPQRSTUVWXYZ';
AR.codigo=()=>{const o=[];while(o.length<6){const b=crypto.getRandomValues(new Uint8Array(12));for(const x of b){if(x<248&&o.length<6)o.push(AR.ALF[x%31])}}return o.join('')};
AR.fmt=c=>String(c||'').replace(/[^0-9A-Z]/gi,'').toUpperCase().replace(/^(.{3})(.+)$/,'$1-$2');
AR.limpaCod=c=>String(c||'').toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,6);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
AR.sha=async t=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)));
AR.salaId=async code=>(await AR.sha('es-arena:'+AR.limpaCod(code))).slice(0,40);
const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function chave(code){const te=new TextEncoder();const base=await crypto.subtle.importKey('raw',te.encode(AR.limpaCod(code)),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:te.encode('es-arena-lista'),iterations:120000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
AR.cifrar=async(o,code)=>{const k=await chave(code);const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(o)));return 'R1.'+b64(iv)+'.'+b64(ct)};
AR.decifrar=async(s,code)=>{const p=String(s).split('.');const k=await chave(code);const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p[1])},k,unb64(p[2]));return JSON.parse(new TextDecoder().decode(pt))};
AR.token=()=>hex(crypto.getRandomValues(new Uint8Array(20)));

/* ---------- alcunhas: filtro de palavras impróprias (o servidor volta a verificar) ---------- */
AR.impropria=t=>{const s=String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/7/g,'t').replace(/@/g,'a').replace(/\$/g,'s');
  return /(merd|caralh|fod[aei]|foder|puta|put[oa]s|cabr[aã]o|cabrona|paneleir|panasc|conas?$|^cona|pica|picha|piroca|rabeta|maric|bich[ao]n|corno|otario|idiota|estupid|burr[oa]|atrasad|mongol|retardad|fuck|shit|bitch|dick|cock|pussy|cunt|nigg|whore|slut|bastard|asshole|porn|sex|nazi|hitler|vagin|penis|anus|cuzao|^cu[sz]?$|bost|^pila|tesao|mamas$|broch|chupa|punhet|siririca)/.test(s)};
AR.alcunhaOk=t=>{const s=String(t||'').trim().replace(/\s+/g,' ');if(s.length<2)return 'A alcunha precisa de pelo menos 2 letras.';if(s.length>24)return 'A alcunha pode ter até 24 carateres.';if(AR.impropria(s))return 'Essa alcunha não pode ser usada. Escolhe outra.';return ''};
AR.SUGESTOES=['Pinha Veloz','Raposa Azul','Coruja Sábia','Lince Atento','Esquilo Rápido','Falcão Calmo','Lontra Feliz','Gaivota Livre','Abelha Curiosa','Texugo Valente','Golfinho Ágil','Mocho Sereno','Melro Cantor','Cometa','Trovão','Nuvem','Faísca','Âncora','Bússola','Farol'];

/* ---------- modos de jogo (cada modo é um «plugin»: novos modos só precisam de uma entrada aqui, no servidor e nos ecrãs) ---------- */
AR.MODOS={
  classico:{nome:'Clássico',ic:'⚡',cor:'#127fa6',ritmo:'sinc',tempo:true,desc:'Todos respondem à mesma pergunta ao mesmo tempo. Quem acerta mais depressa ganha mais pontos.',obj:'',dur:false},
  colheita:{nome:'Colheita',ic:'🌰',cor:'#c2410c',ritmo:'livre',desc:'Cada resposta certa deixa abrir uma de três pinhas: ganhar pontos, duplicar, perder uma parte… ou trocar com outro jogador!',obj:'pontos',dur:true},
  floresta:{nome:'Floresta',ic:'🌲',cor:'#15803d',ritmo:'livre',desc:'Cada resposta certa faz crescer a árvore do aluno (3 seguidas dão um rebento extra). Ganha a maior floresta no fim do tempo.',obj:'árvores',dur:true}
};
AR.EFEITOS={ganha:['Pontos!','#16a34a'],mega:['Super colheita!','#ca8a04'],dobra:['Duplicaste!','#7c3aed'],perde:['Ai! Perdeste uma parte','#dc2626'],troca:['Troca de pontos!','#0891b2'],vazia:['Pinha vazia…','#64748b']};
AR.arvores=u=>({inteiras:Math.floor((u||0)/4),fase:(u||0)%4});

/* ---------- Pinhas: personagens originais ---------- */
AR.RAR={c:['Comum','#64748b'],r:['Rara','#0284c7'],e:['Épica','#7c3aed'],l:['Lendária','#d97706'],m:['Mítica','#db2777']};
AR.PINHAS=[
 ['p01','Pinhó','c','#a0632f','#7a4520','redondo','sorriso','broto'],
 ['p02','Rebento','c','#b7793b','#8a5426','feliz','aberta','folhas'],
 ['p03','Bolotinha','c','#9a6a3c','#6f4825','redondo','o','gorro'],
 ['p04','Musgo','c','#6b8e3d','#4c6a27','sono','sorriso','musgo'],
 ['p05','Caruma','c','#c08a4a','#93652f','redondo','lingua','agulhas'],
 ['p06','Seiva','c','#b5652d','#8a4a1e','feliz','sorriso','gota'],
 ['p07','Orvalho','c','#8f7b5a','#6a5a40','redondo','o','orvalho'],
 ['p08','Gravetinho','c','#a77d4f','#7d5b37','pisca','sorriso','graveto'],
 ['p09','Resina','c','#c9873a','#9c6526','feliz','aberta','broto'],
 ['p10','Pinhinha','c','#b0703c','#83512a','redondo','sorriso','laco'],
 ['p11','Pinhão Sábio','r','#8b5a2b','#5f3c1b','oculos','sorriso','barrete'],
 ['p12','Cogumelina','r','#a0632f','#7a4520','feliz','aberta','cogumelo'],
 ['p13','Brisa','r','#7a8fb0','#55688a','redondo','sorriso','cachecol'],
 ['p14','Ouriço','r','#7c5a3a','#553d26','zangado','o','espinhos'],
 ['p15','Lanterna','r','#d08b2e','#a1661c','feliz','sorriso','lanterna'],
 ['p16','Faísca','r','#e0a42a','#b57c14','estrela','aberta','raio'],
 ['p17','Ventania','r','#6aa3a3','#467a7a','pisca','lingua','helice'],
 ['p18','Astronauta','e','#9aa6b8','#6c7a90','redondo','sorriso','capacete'],
 ['p19','Maestro','e','#3f3f46','#27272a','feliz','sorriso','laco_maestro'],
 ['p20','Corsária','e','#8b4a2b','#5f301b','pala','aberta','tricornio'],
 ['p21','Feiticeira','e','#5b3e8a','#3e2a63','estrela','sorriso','chapeu_magico'],
 ['p22','Surfista','e','#d97a3a','#a85a25','sol','lingua','oculos_sol'],
 ['p23','Rainha do Pinhal','l','#b8862b','#8a6418','feliz','sorriso','coroa'],
 ['p24','Dragãozinho','l','#2f8a5a','#1e6040','zangado','dentes','chifres'],
 ['p25','Guardiã Lunar','l','#3b4f8a','#283766','sono','sorriso','lua'],
 ['p26','Arco-Íris','m','arco','#6b21a8','estrela','aberta','auréola'],
 ['p27','Pinha Dourada','m','ouro','#a16207','feliz','sorriso','coroa_brilho']
].map(([id,nome,rar,cor,cor2,olhos,boca,top])=>({id,nome,rar,cor,cor2,olhos,boca,top}));
AR.pinha=id=>AR.PINHAS.find(p=>p.id===id)||AR.PINHAS[0];
AR.COMUNS=AR.PINHAS.filter(p=>p.rar==='c').map(p=>p.id);
let _gid=0;
AR.svg=(id,sz)=>{const p=AR.pinha(id);sz=sz||64;const g='ap'+(++_gid);
  const corpo=p.cor==='arco'?`url(#${g}a)`:p.cor==='ouro'?`url(#${g}o)`:p.cor;const esc=p.cor2;
  const defs=`<defs><linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f43f5e"/><stop offset=".3" stop-color="#f59e0b"/><stop offset=".55" stop-color="#22c55e"/><stop offset=".8" stop-color="#3b82f6"/><stop offset="1" stop-color="#a855f7"/></linearGradient><linearGradient id="${g}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#b45309"/></linearGradient><radialGradient id="${g}b" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  /* escamas da pinha */
  let esca='';for(let r=0;r<5;r++){const y=44+r*9;const n=r%2?4:5;const w=r===0?9:r===4?7:10;for(let i=0;i<n;i++){const x=50+(i-(n-1)/2)*w*1.05;esca+=`<path d="M${x-w/2} ${y} q${w/2} ${7} ${w} 0" fill="none" stroke="${esc}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`}}
  const corpoP=`<path d="M50 20 C70 22 80 44 78 62 C76 80 63 90 50 90 C37 90 24 80 22 62 C20 44 30 22 50 20 Z" fill="${corpo}" stroke="${esc}" stroke-width="2.4"/>`;
  /* olhos */
  const O={redondo:`<circle cx="40" cy="52" r="5.2" fill="#1f160f"/><circle cx="60" cy="52" r="5.2" fill="#1f160f"/><circle cx="41.8" cy="50.2" r="1.8" fill="#fff"/><circle cx="61.8" cy="50.2" r="1.8" fill="#fff"/>`,
    feliz:`<path d="M34.5 53 q5.5 -6 11 0" stroke="#1f160f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54.5 53 q5.5 -6 11 0" stroke="#1f160f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    sono:`<path d="M34.5 52 q5.5 4 11 0" stroke="#1f160f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54.5 52 q5.5 4 11 0" stroke="#1f160f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    pisca:`<circle cx="40" cy="52" r="5.2" fill="#1f160f"/><circle cx="41.8" cy="50.2" r="1.8" fill="#fff"/><path d="M54.5 53 q5.5 -6 11 0" stroke="#1f160f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    oculos:`<circle cx="40" cy="52" r="8" fill="#fff" fill-opacity=".55" stroke="#1f160f" stroke-width="2.2"/><circle cx="60" cy="52" r="8" fill="#fff" fill-opacity=".55" stroke="#1f160f" stroke-width="2.2"/><path d="M48 52 h4" stroke="#1f160f" stroke-width="2.2"/><circle cx="40" cy="52" r="3.4" fill="#1f160f"/><circle cx="60" cy="52" r="3.4" fill="#1f160f"/>`,
    zangado:`<path d="M33 45 l12 4" stroke="#1f160f" stroke-width="3" stroke-linecap="round"/><path d="M67 45 l-12 4" stroke="#1f160f" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="54" r="4.6" fill="#1f160f"/><circle cx="60" cy="54" r="4.6" fill="#1f160f"/><circle cx="41.4" cy="52.6" r="1.5" fill="#fff"/><circle cx="61.4" cy="52.6" r="1.5" fill="#fff"/>`,
    estrela:`<path d="M40 45 l2 4.6 5 .5 -3.8 3.3 1.2 4.9 -4.4 -2.6 -4.4 2.6 1.2 -4.9 -3.8 -3.3 5 -.5z" fill="#fde047" stroke="#1f160f" stroke-width="1.2"/><path d="M60 45 l2 4.6 5 .5 -3.8 3.3 1.2 4.9 -4.4 -2.6 -4.4 2.6 1.2 -4.9 -3.8 -3.3 5 -.5z" fill="#fde047" stroke="#1f160f" stroke-width="1.2"/>`,
    pala:`<circle cx="40" cy="52" r="5.2" fill="#1f160f"/><circle cx="41.8" cy="50.2" r="1.8" fill="#fff"/><path d="M53 47 h14 v9 q-7 5 -14 0z" fill="#111"/><path d="M28 42 L72 46" stroke="#111" stroke-width="1.6"/>`,
    sol:''}[p.olhos]||'';
  const B={sorriso:`<path d="M43 64 q7 7 14 0" stroke="#1f160f" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
    aberta:`<path d="M42 63 q8 11 16 0 z" fill="#5b1d1d" stroke="#1f160f" stroke-width="2" stroke-linejoin="round"/><path d="M45.5 66.5 q4.5 3 9 0" fill="#f87171"/>`,
    o:`<ellipse cx="50" cy="66" rx="4" ry="5" fill="#5b1d1d" stroke="#1f160f" stroke-width="2"/>`,
    lingua:`<path d="M43 63 q7 7 14 0" stroke="#1f160f" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M50 67 q4 0 3.5 4.5 q-3.5 2.5 -7 0 q-.5 -4.5 3.5 -4.5z" fill="#f87171" stroke="#1f160f" stroke-width="1.4"/>`,
    dentes:`<path d="M41 63 q9 9 18 0 z" fill="#fff" stroke="#1f160f" stroke-width="2"/><path d="M44 63 l1.5 3 1.5 -3 M54 63 l1.5 3 1.5 -3" stroke="#1f160f" stroke-width="1.2" fill="none"/>`}[p.boca]||'';
  const bochechas=`<ellipse cx="32" cy="61" rx="4.5" ry="2.8" fill="#fb7185" opacity=".45"/><ellipse cx="68" cy="61" rx="4.5" ry="2.8" fill="#fb7185" opacity=".45"/>`;
  const folha=(x,y,r,c)=>`<path d="M${x} ${y} q-9 -10 -2 -19 q9 6 2 19z" fill="${c||'#4d7c0f'}" stroke="#365314" stroke-width="1.4" transform="rotate(${r} ${x} ${y})"/>`;
  const T={broto:folha(50,21,-18)+folha(50,21,22,'#65a30d'),folhas:folha(50,21,-35)+folha(50,21,0,'#65a30d')+folha(50,21,35),
    gorro:`<path d="M30 30 q20 -22 40 0 q-20 -6 -40 0z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/><circle cx="50" cy="12" r="4.5" fill="#fff" stroke="#cbd5e1"/><path d="M29 30 q21 -7 42 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    musgo:`<path d="M30 30 q5 -8 10 -2 q4 -8 10 -2 q5 -8 10 -2 q5 -6 10 3 q-20 -6 -40 3z" fill="#65a30d" stroke="#3f6212" stroke-width="1.6"/>`,
    agulhas:`<path d="M50 21 l-10 -14 M50 21 l-4 -16 M50 21 l2 -16 M50 21 l8 -14 M50 21 l13 -10" stroke="#3f6212" stroke-width="2.2" stroke-linecap="round"/>`,
    gota:folha(50,21,0)+`<path d="M70 32 q4 6 0 9 q-4 -3 0 -9z" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>`,
    orvalho:folha(50,21,-10)+`<circle cx="44" cy="10" r="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>`,
    graveto:`<path d="M50 22 l-3 -14 M48 13 l-7 -4" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>`+folha(41,9,-60,'#84cc16'),
    laco:folha(50,21,10)+`<path d="M62 30 l8 -5 v10z M62 30 l-8 -5 v10z" fill="#ec4899" stroke="#9d174d" stroke-width="1.4"/><circle cx="62" cy="30" r="2.4" fill="#be185d"/>`,
    barrete:`<path d="M30 28 h40 l-4 -6 h-32z" fill="#1e293b"/><path d="M36 22 L50 10 L64 22 z" fill="#334155" stroke="#0f172a" stroke-width="1.5"/><path d="M64 22 q6 4 4 12" stroke="#fbbf24" stroke-width="1.8" fill="none"/><circle cx="68" cy="35" r="2.4" fill="#fbbf24"/>`,
    cogumelo:`<path d="M24 30 q26 -30 52 0z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/><circle cx="38" cy="22" r="3.4" fill="#fff"/><circle cx="54" cy="16" r="3" fill="#fff"/><circle cx="64" cy="25" r="2.6" fill="#fff"/>`,
    cachecol:folha(50,21,-15)+`<path d="M27 72 q23 10 46 0 l-1 7 q-22 9 -44 0z" fill="#38bdf8" stroke="#0369a1" stroke-width="1.6"/><path d="M62 78 l3 13 h7 l-4 -15z" fill="#38bdf8" stroke="#0369a1" stroke-width="1.6"/>`,
    espinhos:`<path d="M28 34 l-8 -6 9 0 M36 25 l-4 -10 7 6 M50 20 l0 -11 4 9 M64 25 l4 -10 1 9 M72 34 l8 -6 -6 7" stroke="#44403c" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
    lanterna:folha(50,21,8)+`<path d="M73 40 v-6 h6 v6" fill="none" stroke="#78350f" stroke-width="1.6"/><rect x="71" y="40" width="10" height="13" rx="3" fill="#fde047" stroke="#a16207" stroke-width="1.6"/><circle cx="76" cy="46" r="7" fill="#fde047" opacity=".3"/>`,
    raio:`<path d="M53 3 L42 20 h7 l-5 13 13 -18 h-7z" fill="#facc15" stroke="#a16207" stroke-width="1.6" stroke-linejoin="round"/>`,
    helice:`<path d="M50 20 v-7" stroke="#334155" stroke-width="2.4"/><ellipse cx="41" cy="12" rx="9" ry="3" fill="#ef4444"/><ellipse cx="59" cy="12" rx="9" ry="3" fill="#3b82f6"/><circle cx="50" cy="12" r="2.6" fill="#facc15"/>`,
    capacete:`<path d="M18 60 C16 22 84 22 82 60" fill="#e0f2fe" fill-opacity=".38" stroke="#94a3b8" stroke-width="3"/><path d="M22 60 h56" stroke="#94a3b8" stroke-width="3"/><path d="M50 22 v-10" stroke="#64748b" stroke-width="2"/><circle cx="50" cy="10" r="3.4" fill="#ef4444"/>`,
    laco_maestro:`<path d="M50 74 l-10 -5 v10z M50 74 l10 -5 v10z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.4"/><circle cx="50" cy="74" r="2.6" fill="#991b1b"/><path d="M78 56 l12 -16" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round"/><path d="M50 22 q-6 -12 6 -14" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    tricornio:`<path d="M22 30 q28 -24 56 0 q-10 -4 -14 2 q-14 -10 -28 0 q-4 -6 -14 -2z" fill="#1c1917" stroke="#000" stroke-width="1.6"/><path d="M45 21 l5 -4 5 4 -5 4z" fill="#fef3c7"/>`,
    chapeu_magico:`<path d="M24 31 q26 -9 52 0 q-26 6 -52 0z" fill="#4c1d95" stroke="#2e1065" stroke-width="1.6"/><path d="M33 29 L57 -2 L66 28 z" fill="#6d28d9" stroke="#2e1065" stroke-width="1.6"/><path d="M50 12 l1.4 3 3.2 .4 -2.4 2.2 .7 3.2 -2.9 -1.6 -2.9 1.6 .7 -3.2 -2.4 -2.2 3.2 -.4z" fill="#fde047"/>`,
    oculos_sol:folha(50,21,-25)+folha(50,21,15,'#65a30d')+`<rect x="31" y="46" width="16" height="10" rx="4" fill="#111"/><rect x="53" y="46" width="16" height="10" rx="4" fill="#111"/><path d="M47 50 h6" stroke="#111" stroke-width="2.2"/><path d="M34 48 l4 0" stroke="#fff" stroke-width="1.4" opacity=".7"/>`,
    coroa:`<path d="M32 27 l3 -15 8 9 7 -12 7 12 8 -9 3 15z" fill="#facc15" stroke="#a16207" stroke-width="1.8" stroke-linejoin="round"/><circle cx="50" cy="20" r="2.4" fill="#ef4444"/><circle cx="40" cy="22" r="1.8" fill="#3b82f6"/><circle cx="60" cy="22" r="1.8" fill="#22c55e"/>`,
    chifres:`<path d="M36 26 q-10 -10 -6 -20 q4 10 12 14z M64 26 q10 -10 6 -20 q-4 10 -12 14z" fill="#fef3c7" stroke="#78350f" stroke-width="1.6"/><path d="M20 58 q-14 -10 -10 -26 q8 8 14 10z M80 58 q14 -10 10 -26 q-8 8 -14 10z" fill="#16a34a" stroke="#14532d" stroke-width="1.6"/>`,
    lua:`<path d="M68 6 a13 13 0 1 0 10 20 a10 10 0 1 1 -10 -20z" fill="#fde68a" stroke="#ca8a04" stroke-width="1.4"/><circle cx="26" cy="14" r="1.6" fill="#fde68a"/><circle cx="34" cy="6" r="1.1" fill="#fde68a"/>`,
    'auréola':`<ellipse cx="50" cy="10" rx="16" ry="4.5" fill="none" stroke="#fde047" stroke-width="3.2"/>`+folha(50,21,0,'#a3e635'),
    coroa_brilho:`<path d="M32 27 l3 -15 8 9 7 -12 7 12 8 -9 3 15z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 30 l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2z M84 18 l1.5 -4 1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5z" fill="#fde047"/>`}[p.top]||'';
  const brilho=p.rar==='l'||p.rar==='m'?`<circle cx="50" cy="56" r="44" fill="none" stroke="${p.rar==='m'?'#f0abfc':'#fde68a'}" stroke-width="2" stroke-dasharray="2 6" opacity=".8"/>`:'';
  const solOlhos=p.olhos==='sol'?'':'';
  return `<svg class="pinha r-${p.rar}" viewBox="0 0 100 100" width="${sz}" height="${sz}" role="img" aria-label="${p.nome}">${defs}${brilho}<ellipse cx="50" cy="93" rx="22" ry="4" fill="#000" opacity=".15"/>${corpoP}${esca}<path d="M50 20 C70 22 80 44 78 62 C76 80 63 90 50 90 C37 90 24 80 22 62 C20 44 30 22 50 20 Z" fill="url(#${g}b)"/>${bochechas}${O}${solOlhos}${B}${T}</svg>`};

/* ---------- sons originais (sintetizados no momento; nada é descarregado) ---------- */
let ac=null;AR.som=true;
const tom=(f,t,d,tipo,v)=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=tipo||'sine';o.frequency.setValueAtTime(f,ac.currentTime+t);g.gain.setValueAtTime(0.0001,ac.currentTime+t);g.gain.exponentialRampToValueAtTime(v||.18,ac.currentTime+t+.015);g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+t+d);o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+t);o.stop(ac.currentTime+t+d+.05)}catch(_){}};
AR.tocar=n=>{if(!AR.som)return;({
  certo:()=>{tom(660,0,.12,'triangle');tom(880,.1,.12,'triangle');tom(1320,.2,.2,'triangle',.12)},
  errado:()=>{tom(220,0,.18,'sawtooth',.08);tom(165,.14,.25,'sawtooth',.08)},
  tic:()=>tom(1200,0,.04,'square',.05),
  entra:()=>{tom(520,0,.08,'sine',.12);tom(780,.07,.1,'sine',.12)},
  pinha:()=>{tom(300,0,.06,'square',.06);tom(450,.05,.06,'square',.06);tom(700,.1,.12,'triangle',.12)},
  mau:()=>{tom(400,0,.1,'triangle',.1);tom(260,.1,.25,'triangle',.1)},
  cresce:()=>{[392,494,587,784].forEach((f,i)=>tom(f,i*.06,.12,'sine',.12))},
  fim:()=>{[523,659,784,1047,784,1047].forEach((f,i)=>tom(f,i*.12,.22,'triangle',.14))},
  inicio:()=>{[392,392,392,784].forEach((f,i)=>tom(f,i*.28,i===3?.45:.14,'square',.07))}
}[n]||(()=>{}))()};
AR.vibrar=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(_){}};
AR.confetes=(el,n)=>{try{el=el||document.body;const c=['#f43f5e','#f59e0b','#22c55e','#3b82f6','#a855f7','#facc15'];for(let i=0;i<(n||60);i++){const d=document.createElement('i');d.className='arcf';d.style.cssText=`left:${Math.random()*100}%;background:${c[i%c.length]};animation-delay:${Math.random()*.6}s;animation-duration:${1.6+Math.random()*1.4}s;transform:rotate(${Math.random()*360}deg)`;el.appendChild(d);setTimeout(()=>d.remove(),3600)}}catch(_){}};

/* ---------- floresta: desenho da floresta de cada aluno (4 unidades = 1 árvore) ---------- */
AR.arvore=(u,sz)=>{const n=AR.arvores(u).inteiras,f=AR.arvores(u).fase;const k=Math.min(n,9);let s='';for(let i=0;i<k;i++){const x=12+((i*37)%76),h=26+((i*13)%14);s+=`<g transform="translate(${x} ${92-h})"><rect x="-1.5" y="${h-8}" width="3" height="8" fill="#7c4a1e"/><path d="M0 0 L9 ${h*.55} H-9Z M0 ${h*.25} L11 ${h-6} H-11Z" fill="${['#15803d','#16a34a','#166534','#22c55e'][i%4]}"/></g>`}
  const gh=[0,10,18,28][f];if(f)s+=`<g class="arbro" transform="translate(50 ${92-gh})"><rect x="-2" y="${gh-6}" width="4" height="6" fill="#7c4a1e"/><path d="M0 0 L${gh*.32} ${gh*.6} H-${gh*.32}Z M0 ${gh*.3} L${gh*.4} ${gh-5} H-${gh*.4}Z" fill="#84cc16"/></g>`;
  return `<svg viewBox="0 0 100 100" width="${sz||100}" height="${sz||100}" aria-hidden="true"><ellipse cx="50" cy="93" rx="46" ry="6" fill="#65a30d" opacity=".55"/>${s}</svg>`};
/* pinha fechada da Colheita (três por escolha) */
AR.pinhaFechada=(sz,cor)=>`<svg viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><path d="M50 8 C70 12 82 40 78 62 C74 84 62 94 50 94 C38 94 26 84 22 62 C18 40 30 12 50 8Z" fill="${cor||'#a0632f'}" stroke="#5c3a1c" stroke-width="3"/>${[30,44,58,72].map((y,r)=>[...Array(r%2?3:4)].map((_,i,A)=>{const x=50+(i-(A.length-1)/2)*14;return `<path d="M${x-7} ${y} q7 9 14 0" fill="none" stroke="#5c3a1c" stroke-width="2.4" stroke-linecap="round"/>`}).join('')).join('')}<path d="M50 8 q-4 -6 2 -8 q4 4 -2 8z" fill="#4d7c0f"/><text x="50" y="66" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" opacity=".85">?</text></svg>`;
/* ---------- pontuação por extenso ---------- */
AR.nf=n=>Math.round(+n||0).toLocaleString('pt-PT');
window.ARENA=AR;
})();
