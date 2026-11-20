/* Spruce Notes Web Clipper · janela pequena, para páginas onde o painel não pode aparecer
   (páginas internas do Chrome, a loja de extensões, o leitor de PDF…) */
(async () => {
  const {Painel, notaDeTexto, eVideo} = globalThis.SNPainel;
  const P = new Painel(document.getElementById('sn').attachShadow({mode: 'open'}), {janela: true});
  let r = null;
  try { const x = await chrome.runtime.sendMessage({tipo: 'janela'}); r = x && x.ok ? x.v : null; } catch (_) {}
  if (!r) { P.vazio('Abra uma página e use o botão «Guardar» ou o botão direito do rato.'); return; }
  const pag = r.pagina || '';
  if (r.tipo === 'texto') return P.juntar({tipo: 'texto', html: notaDeTexto('', r.texto, pag, r.titulo), pagina: pag, titulo: r.titulo});
  if (r.tipo === 'imagem' && r.src) return P.juntar({tipo: 'imagem', src: r.src, legenda: '', pagina: pag, titulo: r.titulo});
  const url = r.tipo === 'ligacao' ? r.url : r.tipo === 'video' && /^https?:/i.test(r.src || '') ? r.src : pag;
  if (!/^https?:/i.test(url || '')) { P.vazio('Esta página não tem um endereço que se possa guardar.'); return; }
  const tit = url === pag ? r.titulo || '' : '';
  if (eVideo(url) || r.tipo === 'video') return P.juntar({tipo: 'video', url, tit, pagina: pag, titulo: r.titulo, buscar: !tit || eVideo(url)});
  P.juntar({tipo: 'ligacao', url, tit, desc: '', pagina: pag, titulo: r.titulo, buscar: true});
})();
