/* =====================================================================
   ESCOLA — dados e logotipo
   ===================================================================== */
const CAMPOS_ESCOLA=[['escola','Nome da Escola','Escola Básica e Secundária…'],['agrupamento','Agrupamento / Unidade Orgânica','(opcional)'],['codigo','Código da Escola','ex.: 1234567'],['morada','Morada',''],['localidade','Código Postal e Localidade','9500-000 Ponta Delgada'],['telefone','Telefone',''],['emailEscola','Endereço Eletrónico',''],['site','Sítio na Internet','https://']];
function logoDeFicheiro(file){return new Promise((ok,ko)=>{
  if(!/^image\//.test(file.type)&&!/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name))return ko(new Error('Escolha uma imagem (PNG, JPG, SVG…).'));
  const fr=new FileReader();fr.onerror=()=>ko(new Error('Não foi possível ler a imagem.'));
  fr.onload=()=>{const url=fr.result;
    if(/svg/i.test(file.type)&&url.length<300000)return ok(url);
    const img=new Image();img.onload=()=>{const M=480,k=Math.min(1,M/Math.max(img.naturalWidth||M,img.naturalHeight||M));
      const c=document.createElement('canvas');c.width=Math.round((img.naturalWidth||M)*k);c.height=Math.round((img.naturalHeight||M)*k);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);ok(c.toDataURL('image/png'))};
    img.onerror=()=>ko(new Error('Imagem inválida.'));img.src=url};
  fr.readAsDataURL(file)})}
const logoHtml=(cls,e)=>{e=e||EC();return e.logo?`<span class="logo-esc ${cls||''} ${e.logoFundo===false?'sf':''}"><img src="${esc(e.logo)}" alt="Logotipo"></span>`:''};
function moradaEscola(e){const c=e||S.cfg;return [c.morada,c.localidade].filter(Boolean).join(' · ')}
