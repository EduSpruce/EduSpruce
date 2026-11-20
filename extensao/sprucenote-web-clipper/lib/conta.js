// Spruce Notes Web Clipper · a conta (Supabase Auth) e os pedidos à base de dados (PostgREST)
// A extensão tem a SUA sessão (independente da da app): entra-se com a mesma conta Google da EduSpruce,
// pelo fluxo OAuth com PKCE (chrome.identity.launchWebAuthFlow), ou com e-mail e palavra-passe de reserva.
import {SB_URL, SB_KEY, ES_VER, TABELA} from './config.js';
import {b64} from './cifra.js';

const K_SES = 'sessao';   // chrome.storage.local: só a sessão (como a app guarda a sua em localStorage)
let _ses = null, _renovar = null;

const erro = (msg, cod, extra) => Object.assign(new Error(msg), {cod}, extra || {});
export const semSessao = () => erro('Entre com a sua conta da EduSpruce para guardar no Spruce Notes.', 'semsessao');

async function lerSes() {
  if (_ses) return _ses;
  _ses = (await chrome.storage.local.get(K_SES))[K_SES] || null;
  return _ses;
}
async function gravarSes(s) {
  _ses = s || null;
  if (s) await chrome.storage.local.set({[K_SES]: s});
  else {
    await chrome.storage.local.remove(K_SES);
    try { await chrome.storage.session.clear(); } catch (_) {}
  }
}

function sesDe(j) {
  const m = (j.user && j.user.user_metadata) || {};
  const agora = Math.floor(Date.now() / 1000);
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: j.expires_at || agora + (j.expires_in || 3600),
    user: {
      id: j.user.id,
      email: String(j.user.email || '').toLowerCase(),
      nome: m.full_name || m.name || '',
      foto: m.avatar_url || m.picture || ''
    }
  };
}

function msgAuth(j, st) {
  const m = String((j && (j.error_description || j.msg || j.message || j.error)) || '');
  if (/invalid login credentials/i.test(m)) return 'E-mail ou palavra-passe errados (ou esta conta ainda não tem palavra-passe de reserva — defina-a na EduSpruce, em Definições).';
  if (/email not confirmed/i.test(m)) return 'O e-mail desta conta ainda não foi confirmado.';
  if (/rate limit|too many/i.test(m)) return 'Demasiadas tentativas. Espere um pouco e tente de novo.';
  if (/email logins are disabled|provider is not enabled/i.test(m)) return 'A entrada por e-mail está desligada na base de dados.';
  if (/code verifier|flow state|auth code/i.test(m)) return 'A autorização expirou. Tente entrar de novo.';
  if (/refresh token/i.test(m)) return 'A sessão terminou. Entre de novo.';
  return 'A entrada falhou (' + (m || 'erro ' + st) + ').';
}

async function auth(caminho, corpo) {
  let r;
  try {
    r = await fetch(SB_URL + '/auth/v1/' + caminho, {
      method: 'POST',
      headers: {apikey: SB_KEY, 'Content-Type': 'application/json'},
      body: JSON.stringify(corpo),
      cache: 'no-store'
    });
  } catch (_) {
    throw erro('Sem ligação à EduSpruce. Verifique a internet.', 'rede');
  }
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (_) {}
  if (!r.ok) throw erro(msgAuth(j, r.status), 'auth', {status: r.status});
  return j;
}

/* ---------------- entrar ---------------- */
const b64u = u => b64(u).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function pkce() {
  const verificador = b64u(crypto.getRandomValues(new Uint8Array(48)));
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador));
  return {verificador, desafio: b64u(new Uint8Array(d))};
}

export const redirecionamento = () => chrome.identity.getRedirectURL();

export async function entrarGoogle() {
  const volta = redirecionamento();
  const {verificador, desafio} = await pkce();
  const u = new URL(SB_URL + '/auth/v1/authorize');
  u.searchParams.set('provider', 'google');
  u.searchParams.set('redirect_to', volta);
  u.searchParams.set('code_challenge', desafio);
  u.searchParams.set('code_challenge_method', 's256');
  u.searchParams.set('prompt', 'select_account');
  let fim;
  try {
    fim = await chrome.identity.launchWebAuthFlow({url: u.href, interactive: true});
  } catch (e) {
    const m = String((e && e.message) || e);
    if (/did not approve|closed|canceled|cancelled/i.test(m))
      throw erro('A janela de entrada foi fechada. Se depois de escolher a conta apareceu a EduSpruce nessa janela, falta autorizar a extensão no Supabase (veja as Opções da extensão).', 'cancelado');
    if (/could not be loaded|Authorization page/i.test(m))
      throw erro('Não foi possível abrir a entrada com Google. Verifique a internet.', 'rede');
    throw erro('A entrada com Google falhou (' + m + ').', 'auth');
  }
  const r = new URL(fim);
  const q = new URLSearchParams(r.search), h = new URLSearchParams(r.hash.slice(1));
  const er = q.get('error_description') || h.get('error_description');
  if (er) throw erro('O Google recusou a entrada (' + er + ').', 'auth');
  const code = q.get('code');
  if (!code) throw erro('O Google não devolveu a autorização. Tente de novo.', 'auth');
  return concluir(await auth('token?grant_type=pkce', {auth_code: code, code_verifier: verificador}));
}

export async function entrarSenha(email, senha) {
  email = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw erro('Escreva o e-mail da conta.', 'dados');
  if (!senha) throw erro('Escreva a palavra-passe.', 'dados');
  return concluir(await auth('token?grant_type=password', {email, password: String(senha)}));
}

async function concluir(j) {
  if (!j || !j.access_token || !j.user) throw erro('Resposta inesperada da base de dados.', 'auth');
  const s = sesDe(j);
  await gravarSes(s);
  let ok = false;
  try { ok = await autorizado(); } catch (e) { await gravarSes(null); throw e; }
  if (!ok) {
    await sair();
    throw erro('A conta ' + s.user.email + ' não tem acesso à EduSpruce. Use a mesma conta com que entra na app.', 'semacesso');
  }
  return s.user;
}

/* sessão válida (renovada se estiver a expirar) ou null */
export async function sessao(forcarRenovar) {
  const s = await lerSes();
  if (!s) return null;
  if (!forcarRenovar && s.expires_at - 90 > Date.now() / 1000) return s;
  if (!_renovar) _renovar = (async () => {
    try {
      const n = sesDe(await auth('token?grant_type=refresh_token', {refresh_token: s.refresh_token}));
      await gravarSes(n);
      return n;
    } catch (e) {
      if (e.cod === 'auth' && e.status >= 400 && e.status < 500) { await gravarSes(null); return null; }
      throw e;
    } finally { _renovar = null; }
  })();
  return _renovar;
}

export async function sair() {
  const s = await lerSes();
  if (s) {
    try {
      await fetch(SB_URL + '/auth/v1/logout?scope=local', {method: 'POST', headers: {apikey: SB_KEY, Authorization: 'Bearer ' + s.access_token}});
    } catch (_) {}
  }
  await gravarSes(null);
  return true;
}

/* ---------------- base de dados ---------------- */
function erroRest(st, j, t) {
  const c = j && j.code, m = String((j && j.message) || t || '');
  if (c === '42501' || /row-level security|permission denied/i.test(m))
    return erro('A base de dados recusou a gravação: a sessão não lhe chegou (um bloqueador como o AdGuard pode estar a tirá-la dos pedidos) ou a conta não é a da EduSpruce.', 'recusa');
  if (c === 'PGRST205' || /does not exist|schema cache/i.test(m))
    return erro('A base de dados da EduSpruce ainda não está preparada.', 'bd');
  if (st === 401 || c === 'PGRST301' || /JWT/i.test(m)) return Object.assign(semSessao(), {status: 401});
  return erro('Base de dados: ' + (m || 'erro ' + st).slice(0, 200), 'bd');
}

async function rest(caminho, {metodo = 'GET', corpo, prefer} = {}, repetida) {
  const s = await sessao();
  if (!s) throw semSessao();
  const h = {apikey: SB_KEY, Authorization: 'Bearer ' + s.access_token, 'x-es-ver': ES_VER, 'x-es-cli': 'clipper'};
  if (corpo !== undefined) h['Content-Type'] = 'application/json';
  if (prefer) h.Prefer = prefer;
  let r;
  try {
    r = await fetch(SB_URL + '/rest/v1/' + caminho, {method: metodo, headers: h, body: corpo === undefined ? undefined : JSON.stringify(corpo), cache: 'no-store'});
  } catch (_) {
    throw erro('Sem ligação à base de dados da EduSpruce. Verifique a internet (ou se a rede bloqueia supabase.co).', 'rede');
  }
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (_) {}
  if (r.status === 401 && !repetida) {           // sessão recusada: renova uma vez e repete
    if (await sessao(true)) return rest(caminho, {metodo, corpo, prefer}, true);
    throw semSessao();
  }
  if (!r.ok) throw erroRest(r.status, j, t);
  return j;
}

/* O AdGuard («Bloquear o cabeçalho Authorization de terceiros», na proteção contra rastreamento) e outros bloqueadores
   tiram a sessão dos pedidos a outros sites: a base de dados recebe-os sem conta e responde «não autorizado». */
export const BLOQUEADOR = 'A sessão não está a chegar à base de dados: um bloqueador neste computador (por exemplo o AdGuard, com «Bloquear o cabeçalho Authorization de terceiros») tira-a dos pedidos. No AdGuard, acrescente supabase.co às exclusões da filtragem HTTPS (ou desligue essa opção) e entre de novo.';
export async function autorizado() {
  if ((await rest('rpc/eduspruce_autorizado', {metodo: 'POST', corpo: {}})) === true) return true;
  /* a base de dados viu a sessão? Sem e-mail nenhum, foi tirada pelo caminho */
  let visto = null;
  try { visto = await rest('rpc/eduspruce_email_atual', {metodo: 'POST', corpo: {}}); } catch (_) {}
  if (visto === '') throw erro(BLOQUEADOR, 'bloqueador');
  return false;
}

export async function ler(nome) {
  const j = await rest(TABELA + '?select=conteudo&nome=eq.' + encodeURIComponent(nome));
  return Array.isArray(j) && j[0] ? j[0].conteudo : null;
}

/* cria uma linha nova (nunca escreve por cima de outra) */
export async function criar(nome, conteudo) {
  const s = await sessao();
  if (!s) throw semSessao();
  await rest(TABELA, {
    metodo: 'POST',
    corpo: {user_id: s.user.id, nome, conteudo, tamanho: conteudo.length, atualizado: new Date().toISOString()},
    prefer: 'return=minimal'
  });
}
