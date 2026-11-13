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
/*ARENA-EXTRA-INI*/
/* ===================== v0.990 · Arena: 8 modos novos (6 «especiais») e 24 Bichos novos — tudo original ===================== */
Object.assign(AR.MODOS,{
  pesca:{nome:'Pesca no Lago',ic:'🎣',cor:'#0284c7',ritmo:'livre',dur:true,obj:'kg',desc:'Cada resposta certa lança a cana: sardinhas, robalos, polvos… e, com sorte, o Atum Gigante ou a Baleia Dourada. Ganha quem pescar mais quilos.'},
  corrida:{nome:'Corrida',ic:'🏁',cor:'#dc2626',ritmo:'livre',dur:true,obj:'casas',desc:'Cada resposta certa avança uma casa; três certas seguidas dão turbo (+2). Quem chegar primeiro à meta ganha.'},
  garra:{nome:'Máquina da Garra',ic:'🕹️',cor:'#db2777',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa dá uma tentativa na máquina da garra: peluches, prémios grandes, o prémio dourado… ou a garra escorrega!'},
  mina:{nome:'Mina Profunda',ic:'⛏️',cor:'#92400e',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa deixa partir uma rocha da mina: pedra, ouro, gemas, diamantes… cuidado com a dinamite!'},
  colmeia:{nome:'Colmeia',ic:'🐝',cor:'#ca8a04',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa faz as abelhas recolher mel. Depois escolhe: mais abelhas, mais flores ou vender o mel em pontos. Ganha quem tiver melhor estratégia!'},
  estrelas:{nome:'Caça-Estrelas',ic:'🌠',cor:'#4f46e5',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa deixa apanhar uma estrela: pontos, cometas que multiplicam, supernovas, meteoros no líder… ou um buraco negro!'},
  pirata:{nome:'Código Pirata',ic:'🏴‍☠️',cor:'#0f766e',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa abre um cofre: cristais, duplicar, piratear pontos a um colega… ou disparar o alarme.'},
  laser:{nome:'Laser',ic:'🎯',cor:'#16a34a',ritmo:'livre',dur:true,obj:'pontos',esp:true,desc:'Cada resposta certa carrega o laser: dispara contra um dos primeiros (rouba pontos), liga um escudo ou recolhe energia.'}
});
AR.ESCOLHA=['colheita','garra','mina','colmeia','estrelas','pirata','laser'];
AR.metrica=(modo,pts,arv)=>modo==='floresta'?AR.arvores(arv).inteiras+' 🌲':modo==='pesca'?((+pts||0)/10).toLocaleString('pt-PT',{minimumFractionDigits:1,maximumFractionDigits:1})+' kg':modo==='corrida'?AR.nf(pts)+(+pts===1?' casa':' casas'):AR.nf(pts);
AR.PEIXES={bota:['Bota velha','🥾','#78716c'],sardinha:['Sardinha','🐟','#64748b'],carapau:['Carapau','🐟','#0ea5e9'],robalo:['Robalo','🐠','#0284c7'],polvo:['Polvo','🐙','#db2777'],atum:['Atum Gigante','🐟','#1d4ed8'],baleia:['Baleia Dourada','🐋','#ca8a04']};
AR.EF2={
  garra:{falha:['A garra escorregou…','#64748b','💨'],peluche:['Peluche!','#db2777','🧸'],grande:['Prémio grande!','#7c3aed','🎁'],dourado:['Prémio dourado!','#ca8a04','🏆']},
  mina:{pedra:['Só pedra','#78716c','🪨'],carvao:['Carvão','#d6d3d1','⚫'],ouro:['Ouro!','#ca8a04','🪙'],gema:['Gema!','#db2777','💎'],diamante:['Diamante!','#0ea5e9','💠'],dinamite:['Dinamite!','#dc2626','🧨']},
  estrelas:{estrela:['Estrela!','#eab308','⭐'],cometa:['Cometa! +50 %','#7c3aed','☄️'],supernova:['Supernova!','#db2777','🌟'],buraco:['Buraco negro…','#111827','🕳️'],meteoro:['Meteoro no líder!','#ea580c','☄️'],nada:['Céu vazio','#64748b','☁️']},
  pirata:{cristais:['Cristais!','#0891b2','💎'],dobra:['Duplicaste!','#7c3aed','✨'],piratear:['Pirateaste!','#0f766e','🏴‍☠️'],alarme:['Alarme!','#dc2626','🚨'],vazio:['Cofre vazio','#64748b','📭']},
  laser:{acerto:['Acertaste!','#16a34a','🎯'],bloqueado:['O escudo bloqueou!','#0284c7','🛡️'],escudo:['Escudo ligado','#0284c7','🛡️'],carga:['Energia!','#ca8a04','🔋'],falha:['Falhaste o alvo','#64748b','💨']},
  colmeia:{abelha:['Mais uma abelha!','#ca8a04','🐝'],flor:['Mais uma flor!','#db2777','🌸'],venda:['Mel vendido!','#16a34a','🍯']}
};
/* ---------- Bichos: personagens originais em forma de cubo arredondado ---------- */
AR.PINHAS.push(...[
 ['p28','Raposa Ruiva','c','raposa','#f97316','#c2410c'],['p29','Sapo Saltitão','c','sapo','#4ade80','#16a34a'],['p30','Urso Mel','c','urso','#a16207','#713f12'],['p31','Coelho Algodão','c','coelho','#f1f5f9','#94a3b8'],
 ['p32','Pinguim Gelado','c','pinguim','#1e293b','#0f172a'],['p33','Abelha Zum','c','abelha','#facc15','#a16207'],['p34','Ouriço Picas','c','ourico','#a8a29e','#57534e'],['p35','Lontra Feliz','c','lontra','#b45309','#78350f'],
 ['p36','Coruja Sábia','r','coruja','#92400e','#5b2a0c'],['p37','Esquilo Rápido','r','esquilo','#ea580c','#9a3412'],['p38','Peixe Palhaço','r','peixe','#fb923c','#c2410c'],['p39','Panda Zen','r','panda','#f8fafc','#334155'],
 ['p40','Tartaruga Calma','r','tartaruga','#65a30d','#3f6212'],['p41','Lince Atento','r','lince','#d6a35c','#8a5a24'],
 ['p42','Polvo Artista','e','polvo','#c084fc','#7e22ce'],['p43','Robô Bip','e','robo','#94a3b8','#475569'],['p44','Fantasma Boo','e','fantasma','#f8fafc','#a5b4fc'],['p45','Cacto Florido','e','cacto','#22c55e','#15803d'],['p46','Cogumelo Mágico','e','cogumelo','#fef3c7','#b45309'],
 ['p47','Leão Rei','l','leao','#fbbf24','#b45309'],['p48','Dragão Faísca','l','dragao','#10b981','#047857'],['p49','Extraterrestre','l','et','#a3e635','#4d7c0f'],
 ['p50','Unicórnio','m','unicornio','#fdf4ff','#c026d3'],['p51','Nuvem Arco-Íris','m','nuvem','arco','#7c3aed']
].map(([id,nome,rar,bicho,cor,cor2])=>({id,nome,rar,bicho,cor,cor2})));
AR.COMUNS=AR.PINHAS.filter(p=>p.rar==='c').map(p=>p.id);
{const _svgP=AR.svg;let gid=0;
AR.svgB=(p,sz)=>{sz=sz||64;const g='ab'+(++gid);const k=p.bicho,C=p.cor==='arco'?`url(#${g}a)`:p.cor,D=p.cor2,ink='#1f2937';
  const defs=`<defs><linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fda4af"/><stop offset=".3" stop-color="#fde68a"/><stop offset=".55" stop-color="#86efac"/><stop offset=".8" stop-color="#93c5fd"/><stop offset="1" stop-color="#d8b4fe"/></linearGradient><radialGradient id="${g}b" cx=".3" cy=".22" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient></defs>`;
  const corpo=(x,y,w,h,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${C}" stroke="${D}" stroke-width="2.6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${g}s)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${g}b)"/>`;
  const olho=(x,y,r,dx)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.12}" fill="#fff" stroke="${ink}" stroke-width="1.6"/><circle cx="${x+(dx||1)}" cy="${y+1.5}" r="${r*.6}" fill="${ink}"/><circle cx="${x+(dx||1)+r*.25}" cy="${y-r*.12}" r="${r*.24}" fill="#fff"/><circle cx="${x+(dx||1)-r*.22}" cy="${y+r*.35}" r="${r*.1}" fill="#fff"/>`;
  const olhos=(y,r,sep)=>olho(50-(sep||12),y||52,r||8.5)+olho(50+(sep||12),y||52,r||8.5);
  const boch=(y)=>`<ellipse cx="29" cy="${y||66}" rx="5" ry="3" fill="#fb7185" opacity=".5"/><ellipse cx="71" cy="${y||66}" rx="5" ry="3" fill="#fb7185" opacity=".5"/>`;
  const sorri=(y,w)=>`<path d="M${50-(w||5)} ${y||67} q${w||5} ${(w||5)*1} ${(w||5)*2} 0" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  const boca3=(y)=>`<path d="M44 ${y||67} q3 3 6 0 q3 3 6 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
  const pes=`<rect x="28" y="84" width="14" height="9" rx="4.5" fill="${D}"/><rect x="58" y="84" width="14" height="9" rx="4.5" fill="${D}"/>`;
  const B=corpo(18,28,64,60,20);let tras='',frente='',base=pes,face=olhos()+boch()+sorri();
  switch(k){
    case 'raposa':tras=`<path d="M22 36 L26 8 L46 30Z M78 36 L74 8 L54 30Z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M27 18 L29 9 L36 22Z M73 18 L71 9 L64 22Z" fill="#1f2937"/>`;frente=`<path d="M30 60 q20 26 40 0 q-4 22 -20 22 q-16 0 -20 -22z" fill="#fff7ed"/><ellipse cx="50" cy="63" rx="4" ry="3" fill="${ink}"/>`;face=olhos(50)+boch(64)+boca3(68);break;
    case 'sapo':tras=`<circle cx="33" cy="30" r="13" fill="${C}" stroke="${D}" stroke-width="2.6"/><circle cx="67" cy="30" r="13" fill="${C}" stroke="${D}" stroke-width="2.6"/>`;frente=`<circle cx="30" cy="74" r="3" fill="${D}" opacity=".5"/><circle cx="70" cy="70" r="2.4" fill="${D}" opacity=".5"/>`;face=olho(33,30,8)+olho(67,30,8)+boch(60)+`<path d="M32 58 q18 14 36 0" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;break;
    case 'urso':tras=`<circle cx="26" cy="30" r="10" fill="${C}" stroke="${D}" stroke-width="2.6"/><circle cx="74" cy="30" r="10" fill="${C}" stroke="${D}" stroke-width="2.6"/><circle cx="26" cy="30" r="5" fill="#fcd34d" opacity=".8"/><circle cx="74" cy="30" r="5" fill="#fcd34d" opacity=".8"/>`;frente=`<ellipse cx="50" cy="66" rx="13" ry="10" fill="#fde68a"/><ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="${ink}"/>`;face=olhos(48,8)+boch(64)+boca3(68);break;
    case 'coelho':tras=`<rect x="26" y="0" width="14" height="36" rx="7" fill="${C}" stroke="${D}" stroke-width="2.6"/><rect x="60" y="0" width="14" height="36" rx="7" fill="${C}" stroke="${D}" stroke-width="2.6"/><rect x="30" y="5" width="6" height="24" rx="3" fill="#f9a8d4"/><rect x="64" y="5" width="6" height="24" rx="3" fill="#f9a8d4"/>`;frente=`<path d="M47 63 h6 l-3 3z" fill="#f472b6"/><rect x="46" y="68" width="4" height="5" rx="1" fill="#fff" stroke="${ink}" stroke-width="1.2"/><rect x="50" y="68" width="4" height="5" rx="1" fill="#fff" stroke="${ink}" stroke-width="1.2"/>`;face=olhos(52)+boch(64)+`<path d="M44 66 q3 3 6 0 q3 3 6 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;break;
    case 'pinguim':frente=`<path d="M28 44 q22 -14 44 0 v30 q-22 16 -44 0z" fill="#f8fafc"/><path d="M44 60 h12 l-6 7z" fill="#f59e0b" stroke="#b45309" stroke-width="1.4" stroke-linejoin="round"/>`;base=`<rect x="28" y="85" width="14" height="8" rx="4" fill="#f59e0b"/><rect x="58" y="85" width="14" height="8" rx="4" fill="#f59e0b"/>`;face=olhos(50,8)+boch(64);break;
    case 'abelha':tras=`<ellipse cx="22" cy="40" rx="12" ry="9" fill="#e0f2fe" fill-opacity=".85" stroke="#7dd3fc" stroke-width="1.6" transform="rotate(-30 22 40)"/><ellipse cx="78" cy="40" rx="12" ry="9" fill="#e0f2fe" fill-opacity=".85" stroke="#7dd3fc" stroke-width="1.6" transform="rotate(30 78 40)"/><path d="M40 28 q-4 -12 -10 -16 M60 28 q4 -12 10 -16" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="30" cy="12" r="3.4" fill="${ink}"/><circle cx="70" cy="12" r="3.4" fill="${ink}"/>`;frente=`<path d="M19 72 h62 v8 h-62z M22 80 h56" fill="${ink}" opacity=".85"/>`;face=olhos(50)+boch(62)+sorri(64);break;
    case 'ourico':tras=[...Array(9)].map((_,i)=>{const a=Math.PI*(1.05+i*0.11);const x=50+Math.cos(a)*40,y=58+Math.sin(a)*40;return `<path d="M${50+Math.cos(a-.12)*28} ${58+Math.sin(a-.12)*28} L${x} ${y} L${50+Math.cos(a+.12)*28} ${58+Math.sin(a+.12)*28}z" fill="#78716c" stroke="#44403c" stroke-width="1.6" stroke-linejoin="round"/>`}).join('');frente=`<ellipse cx="50" cy="68" rx="18" ry="12" fill="#fde68a" opacity=".9"/><circle cx="50" cy="63" r="3.4" fill="${ink}"/>`;face=olhos(52,7.5)+boch(66)+sorri(68,4);break;
    case 'lontra':tras=`<circle cx="25" cy="34" r="7" fill="${C}" stroke="${D}" stroke-width="2.6"/><circle cx="75" cy="34" r="7" fill="${C}" stroke="${D}" stroke-width="2.6"/>`;frente=`<ellipse cx="50" cy="66" rx="16" ry="11" fill="#fde68a"/><ellipse cx="50" cy="61" rx="5" ry="3.4" fill="${ink}"/><path d="M34 64 h-12 M34 68 l-11 3 M66 64 h12 M66 68 l11 3" stroke="${ink}" stroke-width="1.3" stroke-linecap="round"/>`;face=olhos(49,8)+boch(63)+boca3(68);break;
    case 'coruja':tras=`<path d="M22 34 L20 12 L40 28Z M78 34 L80 12 L60 28Z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/>`;frente=`<circle cx="37" cy="50" r="13" fill="#fde68a" stroke="${D}" stroke-width="1.6"/><circle cx="63" cy="50" r="13" fill="#fde68a" stroke="${D}" stroke-width="1.6"/><path d="M45 60 h10 l-5 9z" fill="#f59e0b" stroke="#b45309" stroke-width="1.4" stroke-linejoin="round"/>${[0,1,2].map(i=>`<path d="M${38+i*8} ${76} q4 4 8 0" fill="none" stroke="#fde68a" stroke-width="2" stroke-linecap="round"/>`).join('')}`;face=olho(37,50,9)+olho(63,50,9);break;
    case 'esquilo':tras=`<path d="M70 86 C100 80 98 40 82 24 C76 18 68 22 72 30 C84 46 80 66 66 74z" fill="${C}" stroke="${D}" stroke-width="2.6"/><path d="M78 34 C88 46 86 62 76 70" stroke="#fed7aa" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 34 L26 18 L38 30Z M64 30 L72 16 L74 34Z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/>`;frente=`<ellipse cx="46" cy="70" rx="14" ry="10" fill="#fed7aa"/><ellipse cx="46" cy="63" rx="3.6" ry="2.6" fill="${ink}"/>`;face=olho(36,51,8)+olho(58,51,8)+`<ellipse cx="27" cy="64" rx="4" ry="2.6" fill="#fb7185" opacity=".5"/><path d="M42 67 q2 2.5 4 0 q2 2.5 4 0" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;break;
    case 'peixe':tras=`<path d="M82 58 L98 44 L98 74Z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M44 28 q10 -14 22 0z" fill="${C}" stroke="${D}" stroke-width="2.4"/>`;frente=`<path d="M40 29 q-6 30 0 58 M62 29 q6 30 0 58" stroke="#fff" stroke-width="7" fill="none"/><path d="M40 29 q-6 30 0 58 M62 29 q6 30 0 58" stroke="${ink}" stroke-width="1.2" fill="none" opacity=".4"/>`;base='';face=olhos(52,7.5,10)+`<ellipse cx="50" cy="69" rx="4" ry="3" fill="#7f1d1d"/>`;break;
    case 'panda':tras=`<circle cx="25" cy="31" r="10" fill="#1f2937"/><circle cx="75" cy="31" r="10" fill="#1f2937"/>`;frente=`<ellipse cx="37" cy="53" rx="10" ry="12" fill="#1f2937" transform="rotate(-20 37 53)"/><ellipse cx="63" cy="53" rx="10" ry="12" fill="#1f2937" transform="rotate(20 63 53)"/><ellipse cx="50" cy="65" rx="4" ry="3" fill="#1f2937"/>`;base=`<rect x="28" y="84" width="14" height="9" rx="4.5" fill="#1f2937"/><rect x="58" y="84" width="14" height="9" rx="4.5" fill="#1f2937"/>`;face=olho(37,53,6.5)+olho(63,53,6.5)+boch(66)+boca3(70);break;
    case 'tartaruga':tras=`<circle cx="16" cy="62" r="6" fill="#bef264" stroke="#3f6212" stroke-width="2"/><circle cx="84" cy="62" r="6" fill="#bef264" stroke="#3f6212" stroke-width="2"/>`;frente=`<path d="M14 50 C14 10 86 10 86 50 q-36 8 -72 0z" fill="#a16207" stroke="#713f12" stroke-width="2.6" stroke-linejoin="round"/><path d="M38 22 l12 -6 12 6 v12 l-12 6 -12 -6z" fill="#ca8a04" stroke="#713f12" stroke-width="1.6"/><path d="M22 40 l10 -10 6 8 -4 10z M78 40 l-10 -10 -6 8 4 10z" fill="#ca8a04" stroke="#713f12" stroke-width="1.4"/><path d="M14 50 C14 10 86 10 86 50" fill="url(#${g}b)"/>`;face=olhos(66,7,11)+boch(77)+sorri(79,4);break;
    case 'lince':tras=`<path d="M22 36 L24 8 L42 28Z M78 36 L76 8 L58 28Z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 8 v-6 M76 8 v-6" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;frente=`<ellipse cx="50" cy="66" rx="14" ry="10" fill="#fef3c7"/><path d="M46 61 h8 l-4 4z" fill="#be185d"/><circle cx="30" cy="74" r="2" fill="${D}"/><circle cx="70" cy="74" r="2" fill="${D}"/><path d="M33 64 h-12 M67 64 h12" stroke="${ink}" stroke-width="1.3"/>`;face=olhos(50,8)+boca3(68);break;
    case 'polvo':base=[0,1,2,3,4].map(i=>`<path d="M${24+i*13} 80 q-4 10 2 14 q6 2 6 -6" fill="${C}" stroke="${D}" stroke-width="2.4" stroke-linecap="round"/>`).join('');frente=`<circle cx="30" cy="40" r="3" fill="#f0abfc"/><circle cx="68" cy="36" r="4" fill="#f0abfc"/><path d="M60 22 q8 -14 18 -6" stroke="#facc15" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="79" cy="16" r="3.4" fill="#ef4444"/>`;face=olhos(54)+boch(68)+sorri(70);break;
    case 'robo':tras=`<path d="M50 28 v-14" stroke="#475569" stroke-width="3"/><circle cx="50" cy="12" r="5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.6"/><rect x="10" y="48" width="8" height="18" rx="3" fill="#64748b"/><rect x="82" y="48" width="8" height="18" rx="3" fill="#64748b"/>`;frente=`<rect x="28" y="40" width="44" height="26" rx="8" fill="#0f172a"/><circle cx="24" cy="78" r="2.4" fill="#475569"/><circle cx="76" cy="78" r="2.4" fill="#475569"/>`;face=`<rect x="34" y="47" width="10" height="10" rx="3" fill="#22d3ee"/><rect x="56" y="47" width="10" height="10" rx="3" fill="#22d3ee"/><path d="M42 61 q8 5 16 0" stroke="#22d3ee" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="34" y="72" width="32" height="6" rx="3" fill="#475569"/>`;break;
    case 'fantasma':base='';tras='';face=olhos(48,8)+boch(60)+`<ellipse cx="50" cy="66" rx="5" ry="6" fill="${ink}"/>`;
      return wrap(`<path d="M18 52 C18 18 82 18 82 52 V88 l-8 -6 -8 6 -8 -6 -8 6 -8 -6 -8 6 -8 -6 -8 6z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M18 52 C18 18 82 18 82 52 V88 l-8 -6 -8 6 -8 -6 -8 6 -8 -6 -8 6 -8 -6 -8 6z" fill="url(#${g}b)"/>`+face);
    case 'cacto':tras=`<rect x="4" y="44" width="16" height="10" rx="5" fill="${C}" stroke="${D}" stroke-width="2.4"/><rect x="4" y="30" width="10" height="22" rx="5" fill="${C}" stroke="${D}" stroke-width="2.4"/><rect x="80" y="52" width="16" height="10" rx="5" fill="${C}" stroke="${D}" stroke-width="2.4"/><rect x="86" y="38" width="10" height="22" rx="5" fill="${C}" stroke="${D}" stroke-width="2.4"/><circle cx="50" cy="24" r="7" fill="#f472b6" stroke="#be185d" stroke-width="1.6"/><circle cx="50" cy="24" r="2.6" fill="#fde047"/>`;frente=[[30,40],[70,44],[28,78],[72,76],[50,82]].map(([x,y])=>`<path d="M${x} ${y} l-3 -3 M${x} ${y} l3 -3" stroke="#14532d" stroke-width="1.4" stroke-linecap="round"/>`).join('');base=`<path d="M22 84 h56 l-6 12 h-44z" fill="#c2410c" stroke="#7c2d12" stroke-width="2"/>`;face=olhos(54,8)+boch(68)+sorri(70);break;
    case 'cogumelo':tras=`<path d="M8 50 C8 6 92 6 92 50z" fill="#ef4444" stroke="#991b1b" stroke-width="2.6"/><circle cx="30" cy="30" r="6" fill="#fff"/><circle cx="56" cy="20" r="5" fill="#fff"/><circle cx="74" cy="36" r="4.4" fill="#fff"/>`;face=olhos(62,7.5)+boch(74)+sorri(76,4);return wrap(tras+corpo(24,44,52,46,16)+face+pes);
    case 'leao':tras=[...Array(14)].map((_,i)=>{const a=i/14*Math.PI*2;return `<circle cx="${50+Math.cos(a)*36}" cy="${57+Math.sin(a)*34}" r="11" fill="#b45309" stroke="#78350f" stroke-width="1.6"/>`}).join('');frente=`<ellipse cx="50" cy="67" rx="12" ry="9" fill="#fef3c7"/><path d="M45 62 h10 l-5 5z" fill="#7c2d12"/><path d="M38 24 l4 -10 6 6 2 -8 2 8 6 -6 4 10z" fill="#facc15" stroke="#a16207" stroke-width="1.4" stroke-linejoin="round"/>`;face=olhos(51,8)+boca3(70);break;
    case 'dragao':tras=`<path d="M18 48 C2 30 2 18 8 10 C14 22 20 26 26 30z M82 48 C98 30 98 18 92 10 C86 22 80 26 74 30z" fill="#34d399" stroke="${D}" stroke-width="2.4" stroke-linejoin="round"/><path d="M34 30 l-4 -16 10 12z M66 30 l4 -16 -10 12z" fill="#fef3c7" stroke="#a16207" stroke-width="1.6"/>`;frente=`<path d="M34 70 h32 M36 76 h28 M38 82 h24" stroke="#a7f3d0" stroke-width="3" stroke-linecap="round"/><path d="M41 60 q2 -3 3 0 M56 60 q2 -3 3 0" stroke="${ink}" stroke-width="1.6" fill="none"/>`;face=olhos(48,8)+boch(60)+`<path d="M42 63 q8 7 16 0" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M46 64.5 l1.5 3 1.5 -2.4 M52 64.5 l1.5 2.4 1.5 -3" fill="#fff" stroke="${ink}" stroke-width="1"/>`;break;
    case 'et':tras=`<path d="M38 28 q-6 -14 -14 -18 M62 28 q6 -14 14 -18" stroke="${D}" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="23" cy="9" r="5" fill="#f0abfc" stroke="#a21caf" stroke-width="1.4"/><circle cx="77" cy="9" r="5" fill="#f0abfc" stroke="#a21caf" stroke-width="1.4"/>`;face=`<ellipse cx="50" cy="52" rx="15" ry="13" fill="#fff" stroke="${ink}" stroke-width="1.8"/><circle cx="51" cy="54" r="8" fill="${ink}"/><circle cx="54" cy="50" r="3" fill="#fff"/>`+boch(68)+sorri(72,6);break;
    case 'unicornio':tras=`<path d="M50 30 L46 2 L56 28z" fill="#fde047" stroke="#ca8a04" stroke-width="1.6" stroke-linejoin="round"/><path d="M30 30 C20 30 14 44 18 60 C22 46 30 40 36 38 C34 50 40 56 40 56 C42 44 46 36 54 32z" fill="#f472b6"/><path d="M26 34 C18 44 18 54 22 66" stroke="#60a5fa" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M33 33 C26 42 26 52 30 60" stroke="#a78bfa" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M28 34 L30 22 L40 30Z M72 34 L70 22 L60 30Z" fill="${C}" stroke="${D}" stroke-width="2.4" stroke-linejoin="round"/>`;frente=`<path d="M70 74 l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2z" fill="#fde047"/>`;face=olho(42,52,8)+olho(64,52,8)+boch(64)+`<path d="M46 68 q7 6 14 0" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;break;
    case 'nuvem':base='';face=olhos(54,8)+boch(66)+sorri(68);return wrap(`<path d="M22 86 C6 86 6 62 20 58 C16 38 40 30 48 42 C54 22 84 26 82 50 C98 52 96 86 78 86z" fill="${C}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M22 86 C6 86 6 62 20 58 C16 38 40 30 48 42 C54 22 84 26 82 50 C98 52 96 86 78 86z" fill="url(#${g}b)"/>`+face+`<path d="M18 92 l4 6 M36 92 l-2 6 M60 92 l3 6 M80 92 l-3 6" stroke="#60a5fa" stroke-width="2.4" stroke-linecap="round"/>`);
  }
  function wrap(inner){const brilho=p.rar==='l'||p.rar==='m'?`<circle cx="50" cy="54" r="46" fill="none" stroke="${p.rar==='m'?'#f0abfc':'#fde68a'}" stroke-width="2.2" stroke-dasharray="2 6" opacity=".9"/>`:'';
    return `<svg class="pinha bicho r-${p.rar}" viewBox="0 0 100 100" width="${sz}" height="${sz}" role="img" aria-label="${p.nome}">${defs}${brilho}<ellipse cx="50" cy="95" rx="26" ry="4" fill="#000" opacity=".16"/>${inner}</svg>`}
  return wrap(tras+base+B+frente+face)};
AR.svg=(id,sz)=>{const p=AR.pinha(id);return p&&p.bicho?AR.svgB(p,sz):_svgP(id,sz)}}
/* ---------- sons dos modos novos ---------- */
{const _t=AR.tocar;AR.tocar=n=>{if(!AR.som)return;const x={
  lanca:()=>{tom(900,0,.08,'sine',.08);tom(500,.06,.25,'sine',.06)},
  peixe:()=>{[523,659,784].forEach((f,i)=>tom(f,i*.07,.14,'triangle',.12))},
  passo:()=>{tom(330,0,.06,'square',.06);tom(494,.06,.08,'square',.06)},
  turbo:()=>{[300,400,520,680,900].forEach((f,i)=>tom(f,i*.04,.08,'sawtooth',.05))},
  garra:()=>{[700,620,540,460].forEach((f,i)=>tom(f,i*.08,.08,'square',.05))},
  pedra:()=>{tom(120,0,.12,'sawtooth',.1);tom(90,.05,.15,'square',.06)},
  gema:()=>{[1047,1319,1568,2093].forEach((f,i)=>tom(f,i*.05,.12,'sine',.1))},
  explode:()=>{tom(80,0,.4,'sawtooth',.14);tom(60,.05,.5,'square',.1)},
  zap:()=>{tom(1600,0,.05,'sawtooth',.08);tom(900,.04,.12,'sawtooth',.06)},
  escudo:()=>{tom(440,0,.2,'sine',.1);tom(660,.05,.25,'sine',.08)},
  mel:()=>{[392,523,659].forEach((f,i)=>tom(f,i*.06,.1,'triangle',.1))}
}[n];if(x)return x();return _t(n)}}
/*ARENA-EXTRA-FIM*/
window.ARENA=AR;
})();
