/* SpruceNote Web Clipper · painel (à direita da página) e botões flutuantes
   Usado na página (dentro de um Shadow DOM fechado, que não mexe no site) e na janela pequena (janela.html).
   Os recortes juntam-se no painel; «Guardar em …» envia-os para o quadro escolhido do SpruceNote
   (a raiz ou um dos 10 quadros abertos mais recentemente). */
(() => {
  if (globalThis.SNPainel) return;

  const LOGO = 'data:image/png;base64,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';

  /* ---------- utilitários ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const dominio = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return ''; } };
  const ytId = u => { const m = String(u || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i); return m ? m[1] : ''; };
  const eVideo = u => !!ytId(u) || /vimeo\.com\/(?:video\/)?\d+/i.test(String(u || ''));

  async function enviar(m) {
    let r;
    try { r = await chrome.runtime.sendMessage(m); }
    catch (_) { throw Object.assign(new Error('A extensão foi atualizada. Recarregue esta página e tente de novo.'), {cod: 'contexto'}); }
    if (!r) throw new Error('A extensão não respondeu. Tente de novo.');
    if (!r.ok) throw Object.assign(new Error(r.erro || 'Erro'), {cod: r.cod});
    return r.v;
  }

  /* HTML seguro para as notas do SpruceNote (a mesma lista de etiquetas que a app aceita) */
  const MANTER = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BR', 'DIV', 'P', 'UL', 'OL', 'LI', 'H3', 'A', 'SPAN', 'BLOCKQUOTE', 'CODE']);
  const TIRAR = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'IFRAME', 'OBJECT', 'EMBED', 'CANVAS', 'VIDEO', 'AUDIO', 'IMG', 'PICTURE', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'FORM', 'LINK', 'META', 'HEAD', 'TITLE', 'HR']);
  const EM_H3 = new Set(['H1', 'H2', 'H4', 'H5', 'H6']);
  const EM_DIV = new Set(['SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE', 'NAV', 'FIGURE', 'FIGCAPTION', 'TR', 'DL', 'DT', 'DD', 'ADDRESS', 'PRE', 'TABLE', 'TBODY', 'THEAD', 'TFOOT', 'CAPTION', 'DETAILS', 'SUMMARY', 'CENTER']);
  const desembrulhar = el => { const f = document.createDocumentFragment(); while (el.firstChild) f.appendChild(el.firstChild); el.replaceWith(f); };
  function limparHTML(origem) {
    const raiz = document.createElement('div');
    if (typeof origem === 'string') raiz.innerHTML = origem; else raiz.appendChild(origem);
    /* primeiro os descendentes, depois o próprio elemento: nada é visitado duas vezes */
    const anda = n => {
      for (const c of Array.from(n.childNodes)) {
        if (c.nodeType === 3) continue;
        if (c.nodeType !== 1) { c.remove(); continue; }
        const t0 = c.tagName.toUpperCase();
        if (TIRAR.has(t0)) { c.remove(); continue; }
        anda(c);
        let el = c;
        if (EM_H3.has(t0) || EM_DIV.has(t0) || t0 === 'TD' || t0 === 'TH') {
          el = document.createElement(EM_H3.has(t0) ? 'h3' : t0 === 'TD' || t0 === 'TH' ? 'span' : 'div');
          while (c.firstChild) el.appendChild(c.firstChild);
          if (t0 === 'TD' || t0 === 'TH') el.appendChild(document.createTextNode(' '));
          c.replaceWith(el);
        }
        const t = el.tagName.toUpperCase();
        if (!MANTER.has(t)) { desembrulhar(el); continue; }
        const href = t === 'A' ? el.href : '';
        for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
        if (t === 'A') {
          if (/^(https?:|mailto:)/i.test(href)) { el.setAttribute('href', href); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
          else { desembrulhar(el); continue; }
        }
        if (t === 'SPAN' && !el.textContent.trim()) el.replaceWith(document.createTextNode(' '));
        else if ((t === 'DIV' || t === 'P') && !el.textContent.trim() && !el.querySelector('br')) el.remove();
      }
    };
    anda(raiz);
    return raiz.innerHTML.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>').trim().slice(0, 50000);
  }
  /* a nota completa: o texto + a ligação para a fonte (como no Milanote) */
  function notaDeTexto(html, texto, pagina, titulo) {
    let corpo = html && html.replace(/<[^>]*>/g, '').trim() ? html : esc(String(texto || '').trim()).replace(/\n/g, '<br>');
    if (!/^\s*<(p|div|ul|ol|h3|blockquote)\b/i.test(corpo)) corpo = '<p>' + corpo + '</p>';
    const d = dominio(pagina);
    if (/^https?:/i.test(pagina || '')) corpo += '<p><a href="' + esc(pagina) + '" target="_blank" rel="noopener">' + esc(String(titulo || d).trim().slice(0, 160) || d) + '</a></p>';
    return corpo;
  }

  /* ---------- ícones (traço, como os da EduSpruce) ---------- */
  const I = {
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    v: '<path d="m6 9 6 6 6-6"/>',
    ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    news: '<path d="M5 5h11v14H7a2 2 0 0 1-2-2z"/><path d="M16 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 12h5M8 15h3"/>',
    abrir: '<path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
    rec: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    alerta: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    pessoa: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.2-3.4 4-5 7-5s5.8 1.6 7 5"/>'
  };
  const ic = (n, t = 16, w = 2) => '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="currentColor" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>';
  const GOOGLE = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

  const CSS = `
  :host{all:initial}
  *{box-sizing:border-box;margin:0;padding:0;font:inherit;color:inherit;letter-spacing:normal;text-transform:none}
  .r{--acc:#0a5aa8;--acc-h:#084a8b;--btn:#0a5aa8;--btn-h:#084a8b;--acc2:#e8f1fb;--bg:#f2f2f7;--card:#fff;--ink:#1d1d1f;--mut:#6e6e73;--sep:rgba(60,60,67,.15);--fill:rgba(118,118,128,.12);--ok:#1a7f37;--bad:#c0392b;
     --sh:0 28px 70px -22px rgba(0,0,0,.42),0 2px 10px rgba(0,0,0,.08),0 0 0 .5px rgba(0,0,0,.08);
     font:14px/1.42 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;text-align:left}
  @media (prefers-color-scheme:dark){.r{--acc:#4da3ff;--acc-h:#7ab9ff;--btn:#0a6fd6;--btn-h:#1a7fe6;--acc2:#1f3550;--bg:#000;--card:#1c1c1e;--ink:#f2f2f7;--mut:#98989f;--sep:rgba(84,84,88,.55);--fill:rgba(118,118,128,.24);--ok:#4cd964;--bad:#ff6b5e;--sh:0 28px 70px -22px rgba(0,0,0,.95),0 0 0 .5px rgba(255,255,255,.14)}}
  button{appearance:none;border:0;background:none;cursor:pointer;color:inherit}
  button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
  [hidden]{display:none!important}

  .painel{position:fixed;top:16px;right:16px;width:350px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:var(--card);border-radius:18px;box-shadow:var(--sh);overflow:hidden;z-index:2147483647;animation:sn-entra .24s cubic-bezier(.2,.9,.25,1.15)}
  .janela .painel{position:static;width:auto;max-width:none;height:100vh;max-height:none;border-radius:0;box-shadow:none;animation:none}
  .painel.sai{animation:sn-sai .18s ease-in forwards}
  @keyframes sn-entra{from{opacity:0;transform:translateY(-10px) scale(.97)}}
  @keyframes sn-sai{to{opacity:0;transform:translateY(-6px) scale(.98)}}

  .cab{display:flex;align-items:center;gap:10px;padding:12px 10px 11px 14px;border-bottom:.5px solid var(--sep)}
  .cab>img{width:30px;height:30px;border-radius:8px;flex:none}
  .cab .t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}
  .cab .t b{font-weight:650;font-size:15px}
  .cab .t span{font-size:12px;color:var(--mut)}
  .ib{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:var(--mut);flex:none}
  .ib:hover{background:var(--fill);color:var(--ink)}
  .conta{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--acc2);color:var(--acc);font-weight:650;font-size:12.5px;overflow:hidden;flex:none}
  .conta img{width:100%;height:100%;object-fit:cover}

  .lista{flex:1;min-height:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--bg);overscroll-behavior:contain}
  .cartao{background:var(--card);border-radius:14px;border:.5px solid var(--sep);box-shadow:0 1px 2px rgba(0,0,0,.05);overflow:hidden;position:relative;flex:none;animation:sn-c .22s ease-out}
  @keyframes sn-c{from{opacity:0;transform:translateY(-6px)}}
  .cartao .tira{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.45);color:#fff;opacity:0;transition:opacity .15s;z-index:2}
  .cartao:hover .tira,.cartao .tira:focus-visible{opacity:1}
  .fig{position:relative;background:var(--fill);display:grid;place-items:center;max-height:230px;overflow:hidden}
  .fig img{display:block;width:100%;max-height:230px;object-fit:contain}
  .fig .play{position:absolute;width:46px;height:46px;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:grid;place-items:center}
  .cartao input.leg,.cartao input.tit{display:block;width:100%;border:0;background:transparent;outline:none;padding:10px 12px;font-size:13.5px}
  .cartao input.tit{padding:0;font-weight:600;font-size:14px;text-overflow:ellipsis}
  .cartao input.leg::placeholder{color:var(--mut)}
  .cartao input.leg{border-top:.5px solid var(--sep)}
  .txt{padding:12px 12px 4px;max-height:220px;overflow:auto;font-size:13.5px;line-height:1.5}
  .txt p,.txt div,.txt ul,.txt ol,.txt blockquote,.txt h3{margin:0 0 8px}
  .txt ul,.txt ol{padding-left:20px}
  .txt h3{font-weight:650;font-size:14.5px}
  .txt b,.txt strong{font-weight:650}.txt i,.txt em{font-style:italic}.txt u{text-decoration:underline}
  .txt blockquote{border-left:3px solid var(--sep);padding-left:10px;color:var(--mut)}
  .txt code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;background:var(--fill);border-radius:4px;padding:0 3px}
  .txt a{color:var(--acc);text-decoration:none}
  .lk{display:flex;gap:10px;align-items:center;padding:12px}
  .av{width:36px;height:36px;border-radius:9px;background:var(--acc2);color:var(--acc);display:grid;place-items:center;font-weight:700;font-size:15px;flex:none}
  .lk .n{flex:1;min-width:0}
  .lk small,.fonte{display:block;color:var(--mut);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .desc{padding:0 12px 10px;color:var(--mut);font-size:12.5px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .fonte{padding:0 12px 10px}
  .est{display:flex;align-items:center;gap:8px;min-height:36px;padding:7px 12px;border-top:.5px solid var(--sep);font-size:12.5px;color:var(--mut)}
  .est .s{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .est.ok{color:var(--ok)}.est.ok .s{color:var(--ink)}
  .est.erro{color:var(--bad);white-space:normal}.est.erro .s{white-space:normal}
  .lnk{color:var(--acc);font-weight:600;display:inline-flex;align-items:center;gap:4px;flex:none;font-size:12.5px}
  .lnk:hover{text-decoration:underline}
  .rodar{width:14px;height:14px;border-radius:50%;border:2px solid var(--fill);border-top-color:var(--acc);animation:sn-r .7s linear infinite;flex:none}
  @keyframes sn-r{to{transform:rotate(360deg)}}

  .vazio{padding:28px 18px;text-align:center;color:var(--mut);font-size:13px}
  .vazio b{display:block;color:var(--ink);font-size:14px;margin-bottom:4px}

  .rod{position:relative;padding:12px;border-top:.5px solid var(--sep);background:var(--card)}
  .rod .msg{font-size:12.5px;color:var(--mut);margin:0 2px 10px}
  .rod .msg.erro{color:var(--bad)}
  .div{display:flex;border-radius:12px;overflow:hidden;background:var(--btn);color:#fff;box-shadow:0 1px 0 rgba(0,0,0,.04)}
  .div button{color:#fff;font-weight:600;height:42px;transition:background .12s}
  .div button:hover{background:rgba(255,255,255,.13)}
  .div button:disabled{opacity:.55;cursor:default;background:none}
  .div .gu{flex:1;min-width:0;padding:0 14px;display:flex;align-items:center;gap:9px;text-align:left}
  .div .gu span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .div .gu i{font-style:normal;font-weight:700}
  .div .es{width:44px;display:grid;place-items:center;border-left:1px solid rgba(255,255,255,.3)}
  .btg{width:100%;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;background:var(--card);border:1px solid var(--sep);box-shadow:0 1px 2px rgba(0,0,0,.06)}
  .btg:hover{background:var(--fill)}
  .btp{width:100%;height:40px;border-radius:11px;background:var(--btn);color:#fff;font-weight:600}
  .btp:hover{background:var(--btn-h)}
  .outra{display:block;margin:10px auto 0;color:var(--acc);font-size:12.5px;font-weight:600}
  .form{display:flex;flex-direction:column;gap:8px;margin-top:10px}
  .form input{height:38px;border-radius:10px;border:1px solid var(--sep);background:var(--bg);padding:0 11px;font-size:13.5px;outline:none;width:100%}
  .form input:focus{border-color:var(--acc)}

  .menu{position:absolute;left:12px;right:12px;bottom:64px;background:var(--card);border-radius:14px;box-shadow:var(--sh);max-height:min(430px,62vh);overflow:auto;padding:6px;z-index:3;animation:sn-m .16s ease-out}
  .janela .menu{max-height:min(430px,calc(100vh - 150px))}
  @keyframes sn-m{from{opacity:0;transform:translateY(6px)}}
  .menu .tt{font-size:11px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);padding:9px 10px 5px}
  .menu hr{border:0;border-top:.5px solid var(--sep);margin:6px 4px}
  .op{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:7px 10px;border-radius:9px}
  .op:hover,.op:focus-visible{background:var(--fill);outline:none}
  .op .q{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#fff;flex:none;background:#60a5fa}
  .op .n{flex:1;min-width:0}
  .op .n b{display:block;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .op .n small{display:block;color:var(--mut);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .op .v{color:var(--acc);flex:none}
  .op.mut{color:var(--mut);font-size:12.5px}
  .menu .dica{padding:6px 10px 8px;color:var(--mut);font-size:12px}
  .menu .carr{display:flex;align-items:center;gap:8px;padding:12px 10px;color:var(--mut);font-size:12.5px}

  .bimg{position:fixed;z-index:2147483647;display:flex;align-items:center;gap:6px;height:32px;padding:0 13px 0 5px;border-radius:16px;background:var(--btn);color:#fff;font-weight:650;font-size:13px;box-shadow:0 6px 18px -4px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.18);animation:sn-p .14s ease-out}
  .bimg:hover{background:var(--btn-h)}
  .bimg img{width:22px;height:22px;border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.5)}
  .pino{position:fixed;z-index:2147483647;width:32px;height:32px;border-radius:50%;background:var(--card);box-shadow:0 4px 14px -2px rgba(0,0,0,.38),0 0 0 .5px rgba(0,0,0,.12);display:grid;place-items:center;animation:sn-p .14s ease-out}
  .pino img{width:22px;height:22px;border-radius:6px}
  @keyframes sn-p{from{opacity:0;transform:scale(.85)}}
  .aviso{position:fixed;top:16px;right:16px;z-index:2147483647;max-width:330px;display:flex;gap:10px;align-items:flex-start;background:var(--card);border-radius:14px;box-shadow:var(--sh);padding:12px 14px;font-size:13px;animation:sn-entra .2s ease-out}
  .aviso svg{color:var(--bad);flex:none;margin-top:1px}
  `;

  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const POR_ARRUMAR = 'Por Arrumar';

  class Painel {
    constructor(raiz, {janela = false} = {}) {
      this.janela = janela;
      this.raiz = raiz;
      const st = document.createElement('style'); st.textContent = CSS; raiz.appendChild(st);
      this.r = h('<div class="r' + (janela ? ' janela' : '') + '"></div>');
      raiz.appendChild(this.r);
      this.cartoes = [];
      this.destino = null;          // {c, id, nome, cor}
      this.estado = null;           // {entrou, user, opcoes}
      this.dentro = false;
    }

    /* ---------- botões flutuantes ---------- */
    botaoImagem(x, y, aoClicar) {
      if (!this.bimg) {
        this.bimg = h('<button type="button" class="bimg" title="Guardar esta imagem no SpruceNote"><img alt="" src="' + LOGO + '"><span>Guardar</span></button>');
        this.bimg.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
        this.bimg.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.bimg._cb && this.bimg._cb(); });
        this.r.appendChild(this.bimg);
      }
      this.bimg._cb = aoClicar;
      this.bimg.style.left = Math.round(x) + 'px';
      this.bimg.style.top = Math.round(y) + 'px';
      this.bimg.hidden = false;
    }
    esconderBotaoImagem() { if (this.bimg) this.bimg.hidden = true; }
    pino(x, y, aoClicar) {
      if (!this.bpino) {
        this.bpino = h('<button type="button" class="pino" title="Guardar a seleção no SpruceNote" aria-label="Guardar a seleção no SpruceNote"><img alt="" src="' + LOGO + '"></button>');
        this.bpino.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
        this.bpino.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.bpino._cb && this.bpino._cb(); });
        this.r.appendChild(this.bpino);
      }
      this.bpino._cb = aoClicar;
      this.bpino.style.left = Math.round(x) + 'px';
      this.bpino.style.top = Math.round(y) + 'px';
      this.bpino.hidden = false;
    }
    esconderPino() { if (this.bpino) this.bpino.hidden = true; }
    aviso(msg) {
      if (this.av) this.av.remove();
      this.av = h('<div class="aviso" role="alert">' + ic('alerta', 18) + '<span>' + esc(msg) + '</span></div>');
      this.r.appendChild(this.av);
      clearTimeout(this._avT);
      this._avT = setTimeout(() => { if (this.av) { this.av.remove(); this.av = null; } }, 5000);
    }

    /* ---------- painel ---------- */
    aberto() { return !!(this.p && !this.p.hidden); }
    montar() {
      if (this.p) return;
      this.p = h(`<section class="painel" role="dialog" aria-label="SpruceNote Web Clipper">
        <header class="cab"><img alt="" src="${LOGO}"><div class="t"><b>SpruceNote</b><span>Web Clipper</span></div>
          <button type="button" class="conta" data-conta title="Conta e opções" aria-label="Conta e opções">${ic('pessoa', 16)}</button>
          ${this.janela ? '' : `<button type="button" class="ib" data-fechar title="Fechar (Esc)" aria-label="Fechar">${ic('x', 17)}</button>`}</header>
        <div class="lista" data-lista></div>
        <footer class="rod" data-rod></footer></section>`);
      this.r.appendChild(this.p);
      this.lista = this.p.querySelector('[data-lista]');
      this.rod = this.p.querySelector('[data-rod]');
      const fx = this.p.querySelector('[data-fechar]');
      if (fx) fx.onclick = () => this.fechar();
      this.p.querySelector('[data-conta]').onclick = () => enviar({tipo: 'abrirOpcoes'}).catch(e => this.aviso(e.message));
      this.p.addEventListener('mouseenter', () => { this.dentro = true; clearTimeout(this._fT); });
      this.p.addEventListener('mouseleave', () => { this.dentro = false; if (this._fechaQuandoSair) this._agendarFecho(1400); });
      this.p.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.stopPropagation(); if (this.menu && !this.menu.hidden) this.fecharMenu(); else this.fechar(); }
      });
      /* o menu dos quadros fecha ao carregar fora dele (dentro do painel ou na própria página) */
      const menuAberto = () => this.menu && !this.menu.hidden;
      this.raiz.addEventListener('mousedown', e => { if (menuAberto() && !e.composedPath().includes(this.rod)) this.fecharMenu(); }, true);
      const host = this.raiz.host;
      if (host) document.addEventListener('mousedown', e => { if (menuAberto() && !e.composedPath().includes(host)) this.fecharMenu(); }, true);
    }
    abrir() {
      this.montar();
      this.p.hidden = false;
      this.p.classList.remove('sai');
      this._fechaQuandoSair = false;
      clearTimeout(this._fT);
    }
    fechar() {
      if (!this.p || this.p.hidden) return;
      if (this.janela) { window.close(); return; }
      this.fecharMenu();
      this.p.classList.add('sai');
      setTimeout(() => {
        if (!this.p.classList.contains('sai')) return;
        this.p.hidden = true;
        this.p.classList.remove('sai');
        this.cartoes = this.cartoes.filter(c => c.estado !== 'ok');   // os guardados saem; os por guardar ficam
        this.lista.querySelectorAll('.cartao[data-ok]').forEach(x => x.remove());
      }, 170);
    }
    _agendarFecho(ms) {
      clearTimeout(this._fT);
      this._fT = setTimeout(() => { if (!this.dentro && !(this.menu && !this.menu.hidden)) this.fechar(); }, ms);
    }

    /* um recorte novo entra no painel */
    async juntar(r) {
      this.abrir();
      const c = {id: Math.random().toString(36).slice(2), r, estado: 'novo'};
      this.cartoes.unshift(c);
      c.el = this._cartao(c);
      this.lista.prepend(c.el);
      this.lista.scrollTop = 0;
      const vz = this.lista.querySelector('.vazio'); if (vz) vz.remove();
      await this._estado();
      this._rodape();
      const f = this.p.querySelector(this.estado && this.estado.entrou ? '[data-gu]' : '[data-google]');
      if (f) try { f.focus({preventScroll: true}); } catch (_) {}
    }
    vazio(msg) {
      this.abrir();
      if (!this.cartoes.length) this.lista.innerHTML = '<div class="vazio"><b>Nada para guardar</b>' + esc(msg || 'Use o botão «Guardar» nas imagens ou o botão direito do rato.') + '</div>';
      this._estado().then(() => this._rodape());
    }

    _cartao(c) {
      const r = c.r, d = dominio(r.pagina || r.url);
      let el;
      if (r.tipo === 'imagem') {
        el = h(`<article class="cartao"><div class="fig"><img alt=""></div><input class="leg" placeholder="Legenda (opcional)" aria-label="Legenda" maxlength="300"><div class="est"></div></article>`);
        el.querySelector('img').src = r.src;
        const leg = el.querySelector('.leg'); leg.value = r.legenda || '';
        leg.oninput = () => { r.legenda = leg.value; };
        leg.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.guardar(); } };
      } else if (r.tipo === 'texto') {
        el = h(`<article class="cartao"><div class="txt"></div><div class="est"></div></article>`);
        el.querySelector('.txt').innerHTML = r.html;          // já limpo (limparHTML), com a ligação para a página
      } else if (r.tipo === 'video') {
        const id = ytId(r.url);
        el = h(`<article class="cartao">${id ? `<div class="fig"><img alt=""><span class="play">${ic('play', 22)}</span></div>` : ''}
          <div class="lk"><span class="av">${ic('play', 16)}</span><div class="n"><input class="tit" aria-label="Título do vídeo" maxlength="300"><small></small></div></div><div class="est"></div></article>`);
        if (id) el.querySelector('.fig img').src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
        el.querySelector('small').textContent = dominio(r.url);
      } else {
        el = h(`<article class="cartao"><div class="lk"><span class="av"></span><div class="n"><input class="tit" aria-label="Título da ligação" maxlength="300"><small></small></div></div><p class="desc"></p><div class="est"></div></article>`);
        const du = dominio(r.url);
        el.querySelector('.av').textContent = (du || '?').charAt(0).toUpperCase();
        el.querySelector('small').textContent = du;
        const ds = el.querySelector('.desc');
        if (r.desc) ds.textContent = r.desc; else ds.remove();
      }
      const ti = el.querySelector('input.tit');
      if (ti) { ti.value = r.tit || ''; ti.placeholder = dominio(r.url) || 'Título'; ti.oninput = () => { r.tit = ti.value; r._ed = 1; }; ti.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); this.guardar(); } }; }
      const tira = h(`<button type="button" class="tira" title="Tirar" aria-label="Tirar este recorte">${ic('x', 14, 2.4)}</button>`);
      tira.onclick = () => {
        this.cartoes = this.cartoes.filter(x => x !== c);
        el.remove();
        if (!this.cartoes.length) this.fechar(); else this._rodape();
      };
      el.prepend(tira);
      c.el = el;
      this._est(c);
      if (r.buscar && (r.tipo === 'ligacao' || r.tipo === 'video')) this._meta(c);
      return el;
    }
    /* título e descrição verdadeiros da página ligada (como os cartões de ligação do Milanote) */
    async _meta(c) {
      const r = c.r;
      let m = null;
      try { m = await enviar({tipo: 'meta', url: r.url}); } catch (_) {}
      if (!m || c.estado === 'ok') return;
      if (m.tit && !r._ed) { r.tit = m.tit; const i = c.el.querySelector('input.tit'); if (i) i.value = m.tit; }
      if (r.tipo === 'ligacao' && m.desc && !r.desc) {
        r.desc = m.desc;
        let p = c.el.querySelector('.desc');
        if (!p) { p = document.createElement('p'); p.className = 'desc'; c.el.querySelector('.lk').after(p); }
        p.textContent = m.desc;
      }
    }
    _est(c) {
      const e = c.el.querySelector('.est'), tira = c.el.querySelector('.tira');
      e.className = 'est' + (c.estado === 'ok' ? ' ok' : c.estado === 'erro' ? ' erro' : '');
      tira.hidden = c.estado === 'ok' || c.estado === 'aguardar';
      c.el.toggleAttribute('data-ok', c.estado === 'ok');
      c.el.querySelectorAll('input').forEach(i => { i.disabled = c.estado === 'ok' || c.estado === 'aguardar'; });
      if (c.estado === 'aguardar') e.innerHTML = '<span class="rodar"></span><span class="s">A guardar…</span>';
      else if (c.estado === 'ok') {
        e.innerHTML = ic('ok', 16, 2.6) + '<span class="s">Guardado em <b></b></span><button type="button" class="lnk">Abrir ' + ic('abrir', 13) + '</button>';
        e.querySelector('b').textContent = c.destino.nome;
        e.querySelector('.s').title = 'Guardado em ' + c.destino.nome + ' › ' + POR_ARRUMAR;
        e.querySelector('.lnk').onclick = () => enviar({tipo: 'abrirQuadro', destino: c.destino}).catch(x => this.aviso(x.message));
      } else if (c.estado === 'erro') {
        e.innerHTML = ic('alerta', 16) + '<span class="s"></span>';
        e.querySelector('.s').textContent = c.erro;
      } else {
        e.innerHTML = '<span class="s">' + ({imagem: 'Imagem', texto: 'Texto', video: 'Vídeo', ligacao: 'Ligação', pagina: 'Página'}[c.r.tipo] || 'Recorte') + ' por guardar</span>';
      }
    }

    async _estado(forcar) {
      if (this.estado && !forcar) return this.estado;
      try { this.estado = await enviar({tipo: 'estado'}); }
      catch (e) { this.estado = {entrou: false, erro: e.message}; }
      const u = this.estado.user, b = this.p && this.p.querySelector('[data-conta]');
      if (b) {
        if (u && u.foto) { b.innerHTML = ''; const im = document.createElement('img'); im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = u.foto; im.onerror = () => { b.textContent = (u.nome || u.email || '?').charAt(0).toUpperCase(); }; b.appendChild(im); }
        else if (u) b.textContent = (u.nome || u.email || '?').charAt(0).toUpperCase();
        else b.innerHTML = ic('pessoa', 16);
        b.title = u ? u.email + ' · Opções' : 'Opções';
      }
      return this.estado;
    }

    /* ---------- rodapé: entrar ou «Guardar em …» ---------- */
    _rodape(msg, erro) {
      const st = this.estado || {};
      const porGuardar = this.cartoes.filter(c => c.estado !== 'ok').length;
      if (!st.entrou) {
        this.rod.innerHTML = `<p class="msg${erro ? ' erro' : ''}"></p>
          <button type="button" class="btg" data-google>${GOOGLE}<span>Entrar com Google</span></button>
          <button type="button" class="outra" data-outra>Outra forma de entrar</button>
          <form class="form" data-form hidden><input type="email" name="email" placeholder="E-mail da conta" autocomplete="username" required>
            <input type="password" name="senha" placeholder="Palavra-passe de reserva" autocomplete="current-password" required><button type="submit" class="btp">Entrar</button></form>`;
        this.rod.querySelector('.msg').textContent = msg || st.erro || 'Entre com a sua conta da EduSpruce para guardar no SpruceNote.';
        this.rod.querySelector('[data-google]').onclick = () => this._entrar({tipo: 'entrarGoogle'});
        const fm = this.rod.querySelector('[data-form]');
        this.rod.querySelector('[data-outra]').onclick = () => { fm.hidden = !fm.hidden; if (!fm.hidden) fm.email.focus(); };
        fm.onsubmit = e => { e.preventDefault(); this._entrar({tipo: 'entrarSenha', email: fm.email.value, senha: fm.senha.value}); };
        return;
      }
      if (!this.destino) this.destino = {c: 'sn', id: 'raiz', nome: 'SpruceNote', cor: '#60a5fa'};
      this.rod.innerHTML = `${msg ? '<p class="msg' + (erro ? ' erro' : '') + '"></p>' : ''}
        <div class="div"><button type="button" class="gu" data-gu><span>Guardar em <i></i></span></button>
        <button type="button" class="es" data-es aria-haspopup="menu" aria-expanded="false" title="Escolher outro quadro" aria-label="Escolher outro quadro">${ic('v', 18, 2.4)}</button></div>
        <div class="menu" data-menu role="menu" hidden></div>`;
      if (msg) this.rod.querySelector('.msg').textContent = msg;
      this.rod.querySelector('.gu i').textContent = this.destino.nome;
      const gu = this.rod.querySelector('[data-gu]');
      gu.disabled = !porGuardar;
      gu.onclick = () => this.guardar();
      this.menu = this.rod.querySelector('[data-menu]');
      const es = this.rod.querySelector('[data-es]');
      es.onclick = () => (this.menu.hidden ? this.abrirMenu() : this.fecharMenu());
    }
    async _entrar(m) {
      const b = this.rod.querySelector(m.tipo === 'entrarGoogle' ? '[data-google]' : '.btp');
      if (b) { b.disabled = true; b.style.opacity = '.6'; }
      try {
        await enviar(m);
        await this._estado(true);
        this._rodape();
        const gu = this.rod.querySelector('[data-gu]'); if (gu) gu.focus();
      } catch (e) {
        this._rodape(e.message, true);
      }
    }

    /* ---------- escolher o quadro ---------- */
    async abrirMenu(forcar) {
      const m = this.menu; if (!m) return;
      m.hidden = false;
      this.rod.querySelector('[data-es]').setAttribute('aria-expanded', 'true');
      m.innerHTML = '<div class="carr"><span class="rodar"></span>A carregar os quadros…</div>';
      let d;
      try { d = await enviar({tipo: 'quadros', forcar: !!forcar}); }
      catch (e) {
        m.innerHTML = '<div class="dica"></div><button type="button" class="op mut" data-de-novo>' + ic('rec', 15) + '<span>Tentar de novo</span></button>';
        m.querySelector('.dica').textContent = e.message;
        m.querySelector('[data-de-novo]').onclick = () => this.abrirMenu(true);
        if (e.cod === 'semsessao') { await this._estado(true); this._rodape(e.message, true); }
        return;
      }
      if (m.hidden) return;
      const op = (q, raiz) => {
        const sel = this.destino && this.destino.c === q.c && this.destino.id === q.id;
        const b = h(`<button type="button" class="op" role="menuitemradio" aria-checked="${sel}"><span class="q">${ic(q.c === 'snj' && raiz ? 'news' : 'grid', 15)}</span><span class="n"><b></b><small></small></span>${sel ? '<span class="v">' + ic('ok', 16, 2.6) + '</span>' : ''}</button>`);
        b.querySelector('.q').style.background = q.cor || (q.c === 'snj' ? '#f59e0b' : '#60a5fa');
        b.querySelector('b').textContent = q.nome;
        const sm = b.querySelector('small');
        if (raiz) sm.textContent = q.c === 'snj' ? 'Quadros do Jornal Escolar' : 'O quadro principal';
        else if (q.cam || q.c === 'snj') sm.textContent = (q.c === 'snj' ? 'JornalNote' + (q.cam ? ' › ' : '') : '') + (q.cam || ''); else sm.remove();
        b.onclick = () => { this.destino = {c: q.c, id: q.id, nome: q.nome, cor: q.cor}; this.fecharMenu(); this._rodape(); this.rod.querySelector('[data-gu]').focus(); };
        return b;
      };
      m.innerHTML = '<div class="tt">Guardar em</div>';
      d.raizes.forEach(q => m.appendChild(op(q, true)));
      m.appendChild(h('<hr>'));
      m.appendChild(h('<div class="tt">Abertos recentemente</div>'));
      if (d.recentes.length) d.recentes.forEach(q => m.appendChild(op(q, false)));
      else m.appendChild(h('<div class="dica">Os quadros que abrir no SpruceNote aparecem aqui. Abra o quadro na EduSpruce e atualize a lista.</div>'));
      const at = h('<button type="button" class="op mut">' + ic('rec', 15) + '<span>Atualizar a lista</span></button>');
      at.onclick = () => this.abrirMenu(true);
      m.appendChild(h('<hr>'));
      m.appendChild(at);
      const pri = m.querySelector('.op[aria-checked="true"]') || m.querySelector('.op');
      if (pri) try { pri.focus({preventScroll: true}); } catch (_) {}
    }
    fecharMenu() {
      if (!this.menu || this.menu.hidden) return;
      this.menu.hidden = true;
      const es = this.rod.querySelector('[data-es]'); if (es) es.setAttribute('aria-expanded', 'false');
    }

    /* ---------- guardar ---------- */
    async guardar() {
      const st = await this._estado();
      if (!st.entrou) { this._rodape(); return; }
      const L = this.cartoes.filter(c => c.estado === 'novo' || c.estado === 'erro');
      if (!L.length) return;
      this.fecharMenu();
      const gu = this.rod.querySelector('[data-gu]'); if (gu) gu.disabled = true;
      const destino = {...this.destino};
      let falhou = null;
      for (const c of L.slice().reverse()) {          // pela ordem em que foram recortados
        c.estado = 'aguardar'; this._est(c);
        try {
          await enviar({tipo: 'guardar', r: c.r, destino, tabId: c.r.tabId});
          c.estado = 'ok'; c.destino = destino;
        } catch (e) {
          c.estado = 'erro'; c.erro = e.message; falhou = e;
          if (e.cod === 'semsessao') { for (const x of L) if (x.estado === 'aguardar') x.estado = 'novo'; }
        }
        this._est(c);
        if (falhou && falhou.cod === 'semsessao') break;
      }
      if (falhou && falhou.cod === 'semsessao') { await this._estado(true); this._rodape(falhou.message, true); return; }
      this._rodape(falhou ? '' : 'Ficou na coluna «' + POR_ARRUMAR + '» de ' + destino.nome + '.');
      if (!this.cartoes.some(c => c.estado !== 'ok')) { this._fechaQuandoSair = true; this._agendarFecho(this.janela ? 4000 : 2600); }
    }
  }

  globalThis.SNPainel = {Painel, limparHTML, notaDeTexto, eVideo, ytId, dominio};
})();
