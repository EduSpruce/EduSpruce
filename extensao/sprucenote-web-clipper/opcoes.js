/* SpruceNote Web Clipper · página de opções */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const GOOGLE = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

async function enviar(m) {
  const r = await chrome.runtime.sendMessage(m);
  if (!r) throw new Error('A extensão não respondeu.');
  if (!r.ok) throw new Error(r.erro || 'Erro');
  return r.v;
}

async function desenharConta(erro) {
  const c = $('#conta');
  let st;
  try { st = await enviar({tipo: 'estado'}); } catch (e) { st = {entrou: false, erro: e.message}; }
  if (st.entrou && st.user) {
    const u = st.user;
    c.innerHTML = `<div class="l"><span class="av" id="av"></span><span class="n"><b>${esc(u.nome || u.email)}</b><small>${esc(u.email)} · <span class="ok">ligada à EduSpruce</span></small></span><button type="button" id="sair">Terminar Sessão</button></div>`;
    const av = $('#av');
    if (u.foto) { const im = document.createElement('img'); im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = u.foto; im.onerror = () => { av.textContent = (u.nome || u.email).charAt(0).toUpperCase(); }; av.appendChild(im); }
    else av.textContent = (u.nome || u.email).charAt(0).toUpperCase();
    $('#sair').onclick = async () => { $('#sair').disabled = true; try { await enviar({tipo: 'sair'}); } catch (_) {} desenharConta(); };
    return;
  }
  c.innerHTML = `<div class="l"><span class="n">Entre com a mesma conta Google com que entra na EduSpruce.</span></div>
    <div class="l"><button type="button" class="gg" id="google">${GOOGLE}<span>Entrar com Google</span></button></div>
    <div class="l"><button type="button" class="lnk" id="outra">Outra forma de entrar (e-mail e palavra-passe de reserva)</button></div>
    <form class="form" id="form" hidden><input type="email" name="email" placeholder="E-mail da conta" autocomplete="username" required>
      <input type="password" name="senha" placeholder="Palavra-passe de reserva" autocomplete="current-password" required><button type="submit" class="pri">Entrar</button></form>
    <p class="erro" id="erro" ${erro || st.erro ? '' : 'hidden'}></p>`;
  $('#erro').textContent = erro || st.erro || '';
  const entrar = async (m, b) => {
    b.disabled = true; $('#erro').hidden = true;
    try { await enviar(m); await desenharConta(); }
    catch (e) { await desenharConta(e.message); }
  };
  $('#google').onclick = () => entrar({tipo: 'entrarGoogle'}, $('#google'));
  $('#outra').onclick = () => { $('#form').hidden = !$('#form').hidden; if (!$('#form').hidden) $('#form').email.focus(); };
  $('#form').onsubmit = e => { e.preventDefault(); const f = $('#form'); entrar({tipo: 'entrarSenha', email: f.email.value, senha: f.senha.value}, f.querySelector('button')); };
}

async function desenharOpcoes() {
  const o = await enviar({tipo: 'opcoes'});
  $('#o-imagens').checked = !!o.imagens;
  $('#o-texto').checked = !!o.texto;
  document.querySelectorAll('input[name=app]').forEach(i => { i.checked = i.value === o.app; });
  const mudar = m => enviar({tipo: 'opcoes', mudar: m});
  $('#o-imagens').onchange = e => mudar({imagens: e.target.checked});
  $('#o-texto').onchange = e => mudar({texto: e.target.checked});
  document.querySelectorAll('input[name=app]').forEach(i => { i.onchange = () => mudar({app: i.value}); });
}

(async () => {
  try { $('#redir').textContent = await enviar({tipo: 'redirecionamento'}); } catch (_) {}
  $('#copiar').onclick = async () => {
    try { await navigator.clipboard.writeText($('#redir').textContent); $('#copiar').textContent = 'Copiado'; setTimeout(() => { $('#copiar').textContent = 'Copiar'; }, 1600); } catch (_) {}
  };
  desenharConta();
  desenharOpcoes();
})();
