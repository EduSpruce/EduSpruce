/* SpruceNote Web Clipper · na página
   · botão «Guardar» no canto superior esquerdo das imagens, ao passar o rato
   · botão junto ao texto selecionado (opcional, nas Opções)
   · recebe os recortes do menu do botão direito e do ícone da barra e abre o painel à direita */
(() => {
  const vivo = () => { try { return !!(chrome.runtime && chrome.runtime.id); } catch (_) { return false; } };
  if (globalThis.__snClipper && globalThis.__snClipper.vivo()) return;
  if (globalThis.__snClipper) try { globalThis.__snClipper.desligar(); } catch (_) {}

  const {Painel, limparHTML, notaDeTexto, eVideo} = globalThis.SNPainel;
  const NA_APP = /(^|\.)eduspruce\.(pt|app|github\.io)$/i.test(location.hostname);   // na própria EduSpruce não há botões flutuantes
  if (NA_APP) try { document.documentElement.setAttribute('data-sn-clipper', chrome.runtime.getManifest().version); } catch (_) {}   // a app deixa de sugerir a instalação
  const opc = {imagens: true, texto: false};
  const ouvintes = [];
  const ouvir = (alvo, ev, fn, o) => { alvo.addEventListener(ev, fn, o); ouvintes.push([alvo, ev, fn, o]); };

  let host = null, P = null;
  function painel() {
    if (P && host && host.isConnected) return P;
    if (host && !host.isConnected && P) { (document.documentElement || document.body).appendChild(host); return P; }
    host = document.createElement('sprucenote-web-clipper');
    host.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;display:block';
    const raiz = host.attachShadow({mode: 'closed'});
    (document.documentElement || document.body).appendChild(host);
    P = new Painel(raiz);
    return P;
  }

  try {
    chrome.storage.local.get('opcoes').then(o => Object.assign(opc, (o && o.opcoes) || {})).catch(() => {});
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area !== 'local' || !ch.opcoes) return;
      Object.assign(opc, ch.opcoes.newValue || {});
      if (!opc.imagens && P) P.esconderBotaoImagem();
      if (!opc.texto && P) P.esconderPino();
    });
  } catch (_) {}

  const titulo = () => {
    const og = document.querySelector('meta[property="og:title"],meta[name="twitter:title"]');
    return String((og && og.content) || document.title || '').trim();
  };
  const descricao = () => {
    const m = document.querySelector('meta[property="og:description"],meta[name="description"],meta[name="twitter:description"]');
    return String((m && m.content) || '').trim().slice(0, 600);
  };
  const tituloVideo = () => String(document.title || '').replace(/^\(\d+\)\s*/, '').replace(/\s*[-–|]\s*(YouTube|Vimeo)\s*$/i, '').trim();
  const abs = u => { try { return new URL(u, document.baseURI).href; } catch (_) { return ''; } };

  /* ---------------- imagens ---------------- */
  /* a melhor versão da imagem: a do srcset com ≥ 1600 px (ou a maior), ou a que está à vista */
  function melhorSrc(img) {
    const cands = [];
    const juntar = ss => String(ss || '').split(/,\s+(?=\S)/).forEach(p => {
      const [u, d] = p.trim().split(/\s+/);
      if (!u) return;
      const w = /w$/.test(d || '') ? parseFloat(d) : /x$/.test(d || '') ? parseFloat(d) * (img.naturalWidth || img.width || 800) : 0;
      cands.push({u: abs(u), w});
    });
    juntar(img.getAttribute('srcset'));
    const pic = img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : null;
    if (pic) pic.querySelectorAll('source[srcset]').forEach(s => { if (!s.type || /image\/(jpe?g|png|webp|gif|avif)/.test(s.type)) juntar(s.getAttribute('srcset')); });
    const vista = img.currentSrc || img.src || '';
    const preguicoso = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy-src') || '';
    const ok = cands.filter(c => c.w > 0 && /^(https?|data):/.test(c.u));
    if (ok.length) {
      ok.sort((a, b) => a.w - b.w);
      return (ok.find(c => c.w >= 1600) || ok[ok.length - 1]).u;
    }
    if ((!vista || /^data:image\/(gif|svg)/.test(vista)) && preguicoso) return abs(preguicoso);
    return vista;
  }
  const serveImagem = img => {
    if (!img || img.tagName !== 'IMG' || !(img.currentSrc || img.src)) return false;
    const r = img.getBoundingClientRect();
    if (r.width < 100 || r.height < 80) return false;
    if (img.naturalWidth && img.naturalWidth < 60) return false;
    const cs = getComputedStyle(img);
    return cs.visibility !== 'hidden' && +cs.opacity > 0.05;
  };
  let alvoImg = null, raf = 0, mx = 0, my = 0, tEsconder = 0;
  function imagemEm(x, y) {
    /* procura por baixo de camadas transparentes (como no Instagram ou no Pinterest) */
    for (const n of document.elementsFromPoint(x, y)) {
      if (n === host) return alvoImg;               // o rato está em cima do nosso botão
      if (n.tagName === 'IMG' && serveImagem(n)) return n;
      if (n === document.body || n === document.documentElement) break;
    }
    return null;
  }
  /* a parte da imagem que se vê: sites como o Facebook cortam imagens maiores do que a caixa onde estão */
  function parteVisivel(img) {
    const r = img.getBoundingClientRect();
    let t = Math.max(r.top, 0), l = Math.max(r.left, 0), b = Math.min(r.bottom, innerHeight), d = Math.min(r.right, innerWidth);
    for (let e = img.parentElement, n = 0; e && e !== document.body && n < 25; e = e.parentElement, n++) {
      const cs = getComputedStyle(e);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const c = e.getBoundingClientRect();
        t = Math.max(t, c.top); l = Math.max(l, c.left); b = Math.min(b, c.bottom); d = Math.min(d, c.right);
      }
    }
    return b - t > 30 && d - l > 60 ? {top: t, left: l, bottom: b, right: d} : null;
  }
  function posBotao() {
    if (!alvoImg || !alvoImg.isConnected) return esconderImg();
    const r = parteVisivel(alvoImg);
    if (!r || r.bottom < 40 || r.top > innerHeight - 20) return esconderImg();
    painel().botaoImagem(Math.max(6, r.left + 8), Math.max(6, r.top + 8), () => recortarImagem(alvoImg));
  }
  function esconderImg() { alvoImg = null; if (P) P.esconderBotaoImagem(); }
  function verRato() {
    raf = 0;
    const el = imagemEm(mx, my);
    if (el) { clearTimeout(tEsconder); if (el !== alvoImg) { alvoImg = el; } posBotao(); }
    else if (alvoImg) { clearTimeout(tEsconder); tEsconder = setTimeout(esconderImg, 140); }
  }
  ouvir(document, 'mousemove', e => {
    if (!opc.imagens || NA_APP) return;
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(verRato);
  }, {passive: true, capture: true});
  ouvir(window, 'scroll', () => { if (alvoImg) posBotao(); if (P) P.esconderPino(); }, {passive: true, capture: true});
  ouvir(document, 'mouseleave', () => { clearTimeout(tEsconder); tEsconder = setTimeout(esconderImg, 140); });

  function recortarImagem(img) {
    if (!img) return;
    painel().juntar({tipo: 'imagem', src: melhorSrc(img), legenda: '', pagina: location.href, titulo: document.title});
    esconderImg();
  }

  /* ler uma imagem que só a página consegue ler (blob:, imagens protegidas) */
  const paraDataURL = b => new Promise((ok, ko) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = () => ko(f.error); f.readAsDataURL(b); });
  async function lerImagemNaPagina(src) {
    try {
      const r = await fetch(src, {credentials: 'include'});
      if (r.ok) { const b = await r.blob(); if (/^image\//.test(b.type)) return await paraDataURL(b); }
    } catch (_) {}
    const img = Array.from(document.images).find(i => i.currentSrc === src || i.src === src);
    if (img && img.complete && img.naturalWidth) {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        return c.toDataURL('image/png');
      } catch (_) {}
    }
    return null;
  }

  /* ---------------- texto selecionado ---------------- */
  function selecao() {
    const s = getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return null;
    const texto = s.toString();
    if (!texto.trim()) return null;
    const d = document.createElement('div');
    for (let i = 0; i < s.rangeCount; i++) d.appendChild(s.getRangeAt(i).cloneContents());
    return {html: limparHTML(d), texto};
  }
  function recortarSelecao(textoMenu) {
    const s = selecao();
    const html = notaDeTexto(s && s.html, (s && s.texto) || textoMenu, location.href, titulo());
    if (!html.replace(/<[^>]*>/g, '').trim()) return;
    painel().juntar({tipo: 'texto', html, pagina: location.href, titulo: document.title});
    if (P) P.esconderPino();
  }
  function verSelecao() {
    if (!opc.texto || NA_APP) return;
    const s = getSelection();
    if (!s || s.isCollapsed || !s.rangeCount || s.toString().trim().length < 2) { if (P) P.esconderPino(); return; }
    const a = s.anchorNode, el = a && (a.nodeType === 1 ? a : a.parentElement);
    if (!el || el === host || el.closest('input,textarea,[contenteditable=""],[contenteditable="true"]')) return;
    const rg = s.getRangeAt(0), rs = rg.getClientRects(), r0 = rs[0] || rg.getBoundingClientRect();
    if (!r0 || (!r0.width && !r0.height)) return;
    painel().pino(Math.max(4, r0.left - 40), Math.max(4, r0.top + r0.height / 2 - 16), () => recortarSelecao(''));
  }
  ouvir(document, 'mouseup', e => { if (e.button === 0 && !(host && e.composedPath().includes(host))) setTimeout(verSelecao, 10); }, true);
  ouvir(document, 'keyup', e => { if (e.shiftKey || e.key === 'Shift') setTimeout(verSelecao, 10); }, true);
  ouvir(document, 'selectionchange', () => { if (P) { const s = getSelection(); if (!s || s.isCollapsed) P.esconderPino(); } });

  /* ---------------- menu do botão direito e ícone da barra ---------------- */
  let ultimoAlvo = null;
  ouvir(document, 'contextmenu', e => { ultimoAlvo = e.composedPath()[0] || e.target; }, true);

  function receber(r) {
    r.pagina = r.pagina || location.href;
    r.titulo = r.titulo || document.title;
    if (r.tipo === 'texto') return recortarSelecao(r.texto || '');
    if (r.tipo === 'imagem') {
      const img = ultimoAlvo && ultimoAlvo.tagName === 'IMG' ? ultimoAlvo : null;
      const src = img && (img.currentSrc === r.src || img.src === r.src) ? melhorSrc(img) : r.src;
      return painel().juntar({tipo: 'imagem', src, legenda: '', pagina: r.pagina, titulo: r.titulo});
    }
    if (r.tipo === 'ligacao') {
      const a = ultimoAlvo && ultimoAlvo.closest ? ultimoAlvo.closest('a[href]') : null;
      const tit = a ? String(a.textContent || a.title || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
      if (eVideo(r.url)) return painel().juntar({tipo: 'video', url: r.url, tit, pagina: r.pagina, titulo: r.titulo, buscar: true});
      return painel().juntar({tipo: 'ligacao', url: r.url, tit, desc: '', pagina: r.pagina, titulo: r.titulo, buscar: true});
    }
    if (r.tipo === 'video' && !eVideo(location.href) && /^https?:/i.test(r.src || ''))
      return painel().juntar({tipo: 'video', url: r.src, tit: '', pagina: r.pagina, titulo: r.titulo});
    /* a página (ou um vídeo do YouTube/Vimeo aberto) */
    if (eVideo(location.href)) return painel().juntar({tipo: 'video', url: location.href, tit: tituloVideo(), pagina: location.href, titulo: document.title});
    return painel().juntar({tipo: 'ligacao', url: location.href, tit: titulo(), desc: descricao(), pagina: location.href, titulo: document.title});
  }

  const aoMensagem = (m, snd, responder) => {
    if (!m || snd.id !== chrome.runtime.id) return false;
    if (m.tipo === 'recorte') { try { receber(m.r || {}); } catch (e) { console.warn('[SpruceNote]', e); } responder(true); return false; }
    if (m.tipo === 'lerImagem') { lerImagemNaPagina(m.src).then(responder, () => responder(null)); return true; }
    return false;
  };
  chrome.runtime.onMessage.addListener(aoMensagem);

  ouvir(document, 'keydown', e => {
    if (e.key !== 'Escape' || !P || !P.aberto()) return;
    const a = document.activeElement;
    if (a === host || a === document.body || a === document.documentElement || !a) P.fechar();
  }, true);

  globalThis.__snClipper = {
    vivo,
    desligar() {
      ouvintes.forEach(([a, ev, fn, o]) => a.removeEventListener(ev, fn, o));
      try { chrome.runtime.onMessage.removeListener(aoMensagem); } catch (_) {}
      if (host) host.remove();
    }
  };
})();
