// SpruceNote Web Clipper · serviço de fundo (Manifest V3)
// Menu do botão direito, ícone da barra, entrada na conta e gravação dos recortes (as imagens são lidas e
// reduzidas aqui, como na app: no máximo 1600 px).
import * as conta from './lib/conta.js';
import {quadros, guardarRecorte} from './lib/dados.js';
import {APPS} from './lib/config.js';
import {b64} from './lib/cifra.js';

const OPC = {imagens: true, texto: false, app: 'pt'};
async function opcoes() {
  return {...OPC, ...((await chrome.storage.local.get('opcoes')).opcoes || {})};
}

/* ---------------- menu do botão direito e ícone ---------------- */
function criarMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({id: 'sn-guardar', title: 'Guardar no SpruceNote', contexts: ['selection', 'image', 'link', 'video', 'page']});
  });
}
chrome.runtime.onInstalled.addListener(d => {
  criarMenu();
  if (d.reason === 'install') chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(criarMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let r;
  if (info.selectionText) r = {tipo: 'texto', texto: info.selectionText};
  else if (info.mediaType === 'image' && info.srcUrl) r = {tipo: 'imagem', src: info.srcUrl};
  else if (info.mediaType === 'video') r = {tipo: 'video', src: info.srcUrl || ''};
  else if (info.linkUrl) r = {tipo: 'ligacao', url: info.linkUrl};
  else r = {tipo: 'pagina'};
  r.pagina = info.pageUrl || (tab && tab.url) || '';
  r.titulo = (tab && tab.title) || '';
  r.origem = 'menu';
  entregar(tab, r);
});

chrome.action.onClicked.addListener(tab => entregar(tab, {tipo: 'pagina', pagina: (tab && tab.url) || '', titulo: (tab && tab.title) || '', origem: 'icone'}));

/* entrega o recorte ao painel da página; se a página não deixar (chrome://, loja, PDF…), abre uma janela pequena */
async function entregar(tab, r) {
  if (tab && tab.id != null && tab.id >= 0) {
    const msg = {tipo: 'recorte', r};
    try { await chrome.tabs.sendMessage(tab.id, msg, {frameId: 0}); return; } catch (_) {}
    try {
      await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['painel.js', 'content.js']});
      await chrome.tabs.sendMessage(tab.id, msg, {frameId: 0});
      return;
    } catch (_) {}
  }
  await chrome.storage.session.set({janela: r});
  await chrome.windows.create({url: chrome.runtime.getURL('janela.html'), type: 'popup', width: 400, height: 660});
}

/* ---------------- imagens ---------------- */
async function paraDataURL(blob, tipo) {
  return 'data:' + (tipo || blob.type || 'image/png') + ';base64,' + b64(new Uint8Array(await blob.arrayBuffer()));
}
async function pedirPagina(tabId, src) {
  if (tabId == null) return null;
  try {
    const u = await chrome.tabs.sendMessage(tabId, {tipo: 'lerImagem', src}, {frameId: 0});
    if (u && /^data:image\//.test(u)) return await (await fetch(u)).blob();
  } catch (_) {}
  return null;
}
async function lerImagem(src, tabId) {
  let blob = null;
  if (/^data:image\//i.test(src)) blob = await (await fetch(src)).blob();
  else if (/^https?:/i.test(src)) {
    try {
      const r = await fetch(src, {credentials: 'include', cache: 'force-cache'});
      if (r.ok) blob = await r.blob();
    } catch (_) {}
  }
  if (!blob || !/^image\//.test(blob.type)) {
    const b2 = await pedirPagina(tabId, src);
    if (b2) blob = b2;
    else if (blob && blob.type && !/octet-stream/.test(blob.type)) blob = null;
  }
  if (!blob) throw new Error('Não foi possível ler esta imagem. Experimente guardar a página ou a ligação.');
  return blob;
}
/* reduz como a app (mqReduz): no máximo 1600 px; guarda o original se já for pequeno */
async function reduzir(blob) {
  const tipo = blob.type || '';
  let bm;
  try { bm = await createImageBitmap(blob); }
  catch (_) {
    if (/svg/.test(tipo) && blob.size < 400000) return {u: await paraDataURL(blob, 'image/svg+xml'), w: 600, h: 400};
    throw new Error('Este formato de imagem não pode ser guardado.');
  }
  const M = 1600, s = Math.min(1, M / Math.max(bm.width, bm.height));
  const w = Math.max(1, Math.round(bm.width * s)), h = Math.max(1, Math.round(bm.height * s));
  if (s === 1 && /image\/(png|gif|webp|jpe?g)/.test(tipo) && blob.size < 400000) { bm.close(); return {u: await paraDataURL(blob), w, h}; }
  const c = new OffscreenCanvas(w, h), x = c.getContext('2d');
  const alfa = /png|gif|webp|avif|svg|bmp|ico/.test(tipo);
  if (!alfa) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
  x.drawImage(bm, 0, 0, w, h);
  bm.close();
  const out = await c.convertToBlob(alfa ? {type: 'image/webp', quality: 0.85} : {type: 'image/jpeg', quality: 0.82});
  return {u: await paraDataURL(out), w, h};
}

/* ---------------- recorte → elemento do SpruceNote ---------------- */
const txt = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const http = u => /^https?:\/\/\S+$/i.test(String(u || ''));
const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return ''; } };

/* título e descrição de uma ligação (oEmbed para YouTube e Vimeo; nas outras páginas, as etiquetas <title> e og:) */
const ENT = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', agrave: 'à', acirc: 'â', ecirc: 'ê', ocirc: 'ô', atilde: 'ã', otilde: 'õ', ccedil: 'ç', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Agrave: 'À', Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô', Atilde: 'Ã', Otilde: 'Õ', Ccedil: 'Ç', ndash: '–', mdash: '—', hellip: '…', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“'};
const entidades = s => String(s || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#' ? (() => { try { return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)); } catch (_) { return m; } })() : ENT[e] != null ? ENT[e] : m);
async function meta(url) {
  if (!http(url)) return null;
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
  try {
    const oe = /youtube\.com|youtu\.be/i.test(url) ? 'https://www.youtube.com/oembed?format=json&url=' : /vimeo\.com/i.test(url) ? 'https://vimeo.com/api/oembed.json?url=' : '';
    if (oe) {
      const r = await fetch(oe + encodeURIComponent(url), {signal: ctl.signal, credentials: 'omit'});
      if (r.ok) { const j = await r.json(); return {tit: txt(j.title, 300), desc: j.author_name ? txt(j.author_name, 120) : ''}; }
      return null;
    }
    const r = await fetch(url, {signal: ctl.signal, credentials: 'omit', redirect: 'follow'});
    if (!r.ok || !/html/i.test(r.headers.get('content-type') || '')) return null;
    const rd = r.body.getReader(), partes = [];
    let n = 0;
    while (n < 600000) {
      const {done, value} = await rd.read();
      if (done) break;
      partes.push(value); n += value.length;
      if (/<\/head>/i.test(new TextDecoder('latin1').decode(value))) break;
    }
    try { rd.cancel(); } catch (_) {}
    const bytes = new Uint8Array(n); let o = 0; for (const p of partes) { bytes.set(p, o); o += p.length; }
    let html = new TextDecoder('utf-8').decode(bytes);
    const cs = ((r.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || html.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1];
    if (cs && !/utf-?8/i.test(cs)) { try { html = new TextDecoder(cs).decode(bytes); } catch (_) {} }
    const etiqueta = p => {
      const a = html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + p + '["\'][^>]*content=["\']([^"\']*)', 'i')) || html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']' + p + '["\']', 'i'));
      return a ? txt(entidades(a[1]), 600) : '';
    };
    const t1 = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
    return {tit: txt(etiqueta('og:title') || etiqueta('twitter:title') || entidades(t1), 300), desc: txt(etiqueta('og:description') || etiqueta('description') || etiqueta('twitter:description'), 600)};
  } catch (_) { return null; } finally { clearTimeout(t); }
}

async function montar(r, tabId) {
  if (r.tipo === 'imagem') {
    const im = await reduzir(await lerImagem(r.src, tabId));
    return {it: {t: 'imagem', leg: txt(r.legenda, 300), w: Math.min(320, Math.max(160, Math.round(im.w / 3)))}, img: im.u};
  }
  if (r.tipo === 'texto') {
    const html = String(r.html || '').slice(0, 60000);
    if (!html.replace(/<[^>]*>/g, '').trim()) throw new Error('Não há texto selecionado.');
    return {it: {t: 'nota', txt: html}};
  }
  if (!http(r.url)) throw new Error('Esta página não tem um endereço que se possa guardar.');
  if (r.tipo === 'video') return {it: {t: 'video', url: r.url, tit: txt(r.tit, 300) || dominio(r.url), w: 380}};
  return {it: {t: 'link', url: r.url, tit: txt(r.tit, 300) || dominio(r.url), desc: txt(r.desc, 600)}};
}

async function guardar(m, snd) {
  const tabId = snd && snd.tab ? snd.tab.id : m.tabId;
  const x = await montar(m.r || {}, tabId);
  const fonte = http(m.r && m.r.pagina) ? {url: m.r.pagina, tit: txt(m.r.titulo, 300)} : null;
  await guardarRecorte(x, m.destino, fonte);
  return true;
}

/* ---------------- mensagens do painel e das opções ---------------- */
async function tratar(m, snd) {
  switch (m && m.tipo) {
    case 'estado': {
      let s = null, erroSes = '';
      try { s = await conta.sessao(); } catch (e) { erroSes = e.message; }
      return {entrou: !!s, user: s ? s.user : null, opcoes: await opcoes(), erro: erroSes};
    }
    case 'entrarGoogle': return conta.entrarGoogle();
    case 'entrarSenha': return conta.entrarSenha(m.email, m.senha);
    case 'sair': return conta.sair();
    case 'quadros': return quadros(!!m.forcar);
    case 'guardar': return guardar(m, snd);
    case 'meta': return meta(m.url);
    case 'abrirQuadro': {
      const o = await opcoes();
      const d = m.destino;
      await chrome.tabs.create({url: (APPS[o.app] || APPS.pt) + (d ? '#sn=' + (d.c === 'snj' ? 'snj' : 'sn') + ':' + encodeURIComponent(d.id) : '')});
      return true;
    }
    case 'abrirOpcoes': await chrome.runtime.openOptionsPage(); return true;
    case 'janela': return (await chrome.storage.session.get('janela')).janela || null;
    case 'redirecionamento': return conta.redirecionamento();
    case 'opcoes': {
      const o = {...(await opcoes()), ...(m.mudar || {})};
      if (m.mudar) await chrome.storage.local.set({opcoes: o});
      return o;
    }
  }
  throw new Error('Pedido desconhecido.');
}

chrome.runtime.onMessage.addListener((m, snd, responder) => {
  if (!m || ['lerImagem', 'recorte'].includes(m.tipo)) return false;
  tratar(m, snd).then(v => responder({ok: true, v}), e => responder({ok: false, erro: (e && e.message) || String(e), cod: e && e.cod}));
  return true;
});
