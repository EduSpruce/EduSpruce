/* ===================== dias nacionais e internacionais ===================== */
const DIAS_MAIS={'01-04':['Dia Mundial do Braille'],'01-26':['Dia Internacional da Educação Ambiental'],'02-02':['Dia Mundial das Zonas Húmidas'],'02-10':['Dia Mundial das Leguminosas'],'02-13':['Dia Mundial da Rádio'],
 '03-03':['Dia Mundial da Vida Selvagem'],'03-19':['Dia do Pai'],'03-20':['Dia Internacional da Felicidade','Dia Internacional da Francofonia'],'03-21':['Dia Mundial da Poesia','Dia Internacional das Florestas','Dia Mundial da Síndrome de Down','Dia Internacional para a Eliminação da Discriminação Racial'],'03-22':['Dia Mundial da Água'],'03-23':['Dia Meteorológico Mundial'],'03-27':['Dia Mundial do Teatro'],
 '04-02':['Dia Internacional do Livro Infantil','Dia Mundial da Consciencialização do Autismo'],'04-07':['Dia Mundial da Saúde'],'04-18':['Dia Internacional dos Monumentos e Sítios'],'04-22':['Dia da Terra'],'04-23':['Dia Mundial do Livro e dos Direitos de Autor'],'04-25':['Dia da Liberdade'],'04-29':['Dia Internacional da Dança'],
 '05-01':['Dia do Trabalhador'],'05-03':['Dia Mundial da Liberdade de Imprensa'],'05-05':['Dia Mundial da Língua Portuguesa'],'05-09':['Dia da Europa'],'05-15':['Dia Internacional da Família'],'05-18':['Dia Internacional dos Museus'],'05-22':['Dia Internacional da Biodiversidade'],'05-31':['Dia Mundial sem Tabaco'],
 '06-01':['Dia Mundial da Criança'],'06-05':['Dia Mundial do Ambiente'],'06-08':['Dia Mundial dos Oceanos'],'06-10':['Dia de Portugal, de Camões e das Comunidades Portuguesas'],'06-12':['Dia Mundial contra o Trabalho Infantil'],'06-20':['Dia Mundial do Refugiado'],'06-26':['Dia Internacional contra o Abuso e o Tráfico de Drogas'],
 '07-11':['Dia Mundial da População'],'07-18':['Dia Internacional Nelson Mandela'],'07-20':['Dia Internacional do Xadrez'],'07-26':['Dia dos Avós'],'07-30':['Dia Internacional da Amizade'],
 '08-09':['Dia Internacional dos Povos Indígenas'],'08-12':['Dia Internacional da Juventude'],'08-15':['Assunção de Nossa Senhora'],'08-19':['Dia Mundial da Fotografia','Dia Mundial Humanitário'],
 '09-08':['Dia Internacional da Alfabetização'],'09-15':['Dia Internacional da Democracia'],'09-16':['Dia Internacional para a Preservação da Camada de Ozono'],'09-21':['Dia Internacional da Paz'],'09-26':['Dia Europeu das Línguas'],'09-27':['Dia Mundial do Turismo'],
 '10-01':['Dia Mundial da Música','Dia Internacional das Pessoas Idosas'],'10-04':['Dia Mundial do Animal'],'10-05':['Implantação da República','Dia Mundial do Professor'],'10-10':['Dia Mundial da Saúde Mental'],'10-16':['Dia Mundial da Alimentação'],'10-17':['Dia Internacional para a Erradicação da Pobreza'],'10-24':['Dia das Nações Unidas'],'10-31':['Dia Mundial da Poupança','Halloween'],
 '11-01':['Dia de Todos os Santos','Dia Mundial do Veganismo'],'11-11':['Dia de São Martinho'],'11-13':['Dia Mundial da Bondade'],'11-14':['Dia Mundial da Diabetes'],'11-16':['Dia Internacional da Tolerância'],'11-20':['Dia Universal dos Direitos da Criança'],'11-25':['Dia Internacional para a Eliminação da Violência contra as Mulheres'],
 '12-01':['Restauração da Independência','Dia Mundial de Luta contra a SIDA'],'12-03':['Dia Internacional das Pessoas com Deficiência'],'12-05':['Dia Internacional do Voluntariado'],'12-08':['Dia da Imaculada Conceição'],'12-10':['Dia dos Direitos Humanos'],'12-18':['Dia Internacional dos Migrantes'],'12-25':['Natal']};
const _normD=x=>x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
Object.entries(DIAS_MAIS).forEach(([md,L])=>{const cur=DIAS_COMEM[md]=DIAS_COMEM[md]||[];L.forEach(n=>{if(!cur.some(c=>_normD(c)===_normD(n)))cur.push(n)})});
const NAC=/^(Dia de Portugal|Dia da Liberdade|Implantação da República|Restauração da Independência|Dia do Trabalhador|Ano Novo|Natal|Dia de Todos os Santos|Assunção|Dia da Imaculada|Dia do Pai|Dia da Mãe|Dia dos Avós|Dia de São Martinho|Dia de Reis|Dia dos Açores|Dia Escolar|Carnaval|Sexta-feira Santa|Páscoa|Corpo de Deus)/;
const tipoEfem=n=>/Mundial|Internacional|Universal|Europeu|Europa|Nações Unidas|Dia da Terra|Meteorológico|Direitos Humanos|Pi \(π\)/.test(n)?'int':NAC.test(n)?'nac':'out';
function diasMoveis(y){const p=pascoa(y);const ad=n=>{const d=new Date(p);d.setDate(d.getDate()+n);return isoData(d)};const o={};o[ad(-47)]=['Carnaval'];o[ad(-2)]=['Sexta-feira Santa'];o[ad(0)]=['Páscoa'];o[ad(50)]=['Dia dos Açores (Segunda-feira do Espírito Santo)'];o[ad(60)]=['Corpo de Deus'];
  const m=new Date(y,4,1);while(m.getDay()!==0)m.setDate(m.getDate()+1);m.setDate(m.getDate()+7);o[isoData(m)]=['Dia da Mãe'];return o}
/* fim de semana: uma piada junto da data */
const PIADAS={6:['Hoje é sábado. Tem mesmo a certeza de que devia estar a trabalhar?','Sábado! Os testes não se corrigem sozinhos… mas aguentam-se até segunda.','Sábado é dia de café sem toque de entrada. Aproveite!','Fim de semana: até o SGE está a descansar.','Sábado a planificar? Os seus alunos não estão a pensar em si, garantimos.'],
  0:['Hoje é domingo. Devia mesmo estar a trabalhar?','Domingo: até os sumários tiram folga.','É domingo — a planificação aguenta-se até amanhã, prometido.','Domingo à tarde a preparar aulas? Clássico de professor. Faça pelo menos uma pausa.','Domingo é para descansar. A grelha de avaliação não foge.']};
const piadaHoje=d=>{d=d||new Date();const L=PIADAS[d.getDay()];if(!L)return '';const n=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);return L[n%L.length]};
{const _wh=widgetHojeInfo;widgetHojeInfo=function(){const d=new Date();const iso=isoHoje();const md=iso.slice(5);const mov=diasMoveis(d.getFullYear())[iso]||[];
  const orig=DIAS_COMEM[md];const todos=[...(orig||[])];mov.forEach(n=>{if(!todos.some(c=>_normD(c)===_normD(n)))todos.push(n)});
  /* o original desenha a lista simples; reorganizamos por nacionais/internacionais */
  DIAS_COMEM[md]=[];let h;try{h=_wh.apply(this,arguments)}finally{if(orig)DIAS_COMEM[md]=orig;else delete DIAS_COMEM[md]}
  const a=A();const cal=a&&a.calendario;const tp=cal&&cal.dias&&cal.dias[iso];const feriado=tp&&/^feriado/.test(tp);
  const nac=todos.filter(n=>tipoEfem(n)!=='int'),int=todos.filter(n=>tipoEfem(n)==='int');
  const li=(n,k)=>`<li class="${/Professor/.test(n)?'prof':k}">${ic(/Professor/.test(n)?'grad':k==='int'?'globo':'flag',14)}<span>${esc(n)}</span></li>`;
  let extra='';if(nac.length)extra+=`<li class="whg" aria-hidden="true">Dias nacionais</li>`+nac.map(n=>li(n,'nac')).join('');
  if(int.length)extra+=`<li class="whg" aria-hidden="true">Dias internacionais</li>`+int.map(n=>li(n,'int')).join('');
  const pz=piadaHoje(d);
  if(pz)h=h.replace('</div>\n    ','</div><p class="whpz" role="note">'+ic('sparkle',14)+'<span>'+esc(pz)+'</span></p>\n    ');
  if(extra){if(h.includes('<ul class="whl">'))h=h.replace(/<\/ul><\/div>$/,extra+'</ul></div>');else h=h.replace(/<p class="mut"[^>]*>Sem efemérides para hoje\.<\/p>/,'<ul class="whl">'+extra+'</ul>')}
  return h}}
/* horário de hoje vazio ao fim de semana */
{const _vmh=typeof vMeuHorario==='function'?vMeuHorario:null;if(_vmh){vMeuHorario=function(){const r=_vmh.apply(this,arguments);try{const pz=piadaHoje();if(pz){const p=[...document.querySelectorAll('#view p.mut')].find(x=>/Hoje não há atividades letivas/.test(x.textContent));if(p&&!p.querySelector('.whpz'))p.insertAdjacentHTML('beforeend',`<span class="whpz in">${ic('sparkle',13)} ${esc(pz)}</span>`)}}catch(_){}return r}}}

/* ensino profissional: o distintivo da turma mostra o código interno (no regular continua o ano) */
function badgeCod(t){try{if(!t||!t.codigo)return '';const prof=ofertaDe(t)==='profissional'||tipoEscola(escolaDe(t))==='profissional';return prof?String(t.codigo).trim().slice(0,6):''}catch(_){return ''}}


