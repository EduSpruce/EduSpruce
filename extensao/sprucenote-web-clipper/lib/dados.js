// Spruce Notes Web Clipper · os quadros do Spruce Notes e a caixa de entrada
// · a lista dos quadros (e dos abertos recentemente) vem da linha cifrada «ef-f-snidx.bin», que a app escreve;
//   se a app ainda não a tiver escrito, lê-se a parte geral só para tirar os nomes dos quadros (nada fica guardado)
// · cada recorte vai cifrado para uma linha nova «ef-f-snin-<id>.bin»; a app arruma-o na coluna «Por Arrumar»
//   do quadro escolhido e apaga a linha — a extensão nunca escreve por cima dos dados da app
import {ler, criar, sessao, semSessao} from './conta.js';
import {cifrar, decifrar, importarChave} from './cifra.js';
import {CHAVE, PREF_IN, INDICE, GERAL} from './config.js';

/* chave da conta: em memória (chrome.storage.session apaga-se ao fechar o browser); fresca antes de cada gravação */
async function chave(fresca) {
  const s = await sessao();
  if (!s) throw semSessao();
  if (!fresca) {
    const c = (await chrome.storage.session.get('chave')).chave;
    if (c && c.uid === s.user.id && Date.now() - c.q < 10 * 60e3) return importarChave(c.k);
  }
  const t = await ler(CHAVE);
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch (_) {}
  if (!j || !j.k) throw Object.assign(new Error('A sua conta ainda não tem dados na EduSpruce. Abra a app uma vez e tente de novo.'), {cod: 'semdados'});
  await chrome.storage.session.set({chave: {uid: s.user.id, k: j.k, q: Date.now()}});
  return importarChave(j.k);
}

/* quadros ligados à raiz (os que estão na lixeira ou soltos ficam de fora) — igual ao que a app faz */
function alcancaveis(qs) {
  const por = new Map(qs.filter(q => q && q.id).map(q => [q.id, q]));
  const raiz = por.get('raiz') || qs[0];
  if (!raiz) return [];
  const vis = new Set([raiz.id]), fila = [raiz];
  while (fila.length) {
    const q = fila.shift();
    for (const it of q.itens || []) {
      if (it && it.t === 'quadro' && it.ref && por.has(it.ref) && !vis.has(it.ref)) { vis.add(it.ref); fila.push(por.get(it.ref)); }
    }
  }
  return qs.filter(q => q && vis.has(q.id)).map(q => ({id: q.id, nome: String(q.nome || 'Quadro'), pai: q.pai || null, cor: q.cor || ''}));
}
function indiceDaParteGeral(G) {
  const sn = G && G.sn && Array.isArray(G.sn.quadros) && G.sn.quadros.length ? G.sn.quadros : [{id: 'raiz', nome: 'Spruce Notes', itens: []}];
  const o = {v: 1, q: Date.now(), rec: [], sn: {quadros: alcancaveis(sn)}};
  const snj = G && G.snj && Array.isArray(G.snj.quadros) ? G.snj.quadros : [];
  if (snj.length) o.snj = {quadros: alcancaveis(snj)};
  return o;
}

/* o que o painel mostra: as raízes (Spruce Notes, Jornal Notes) e até 10 quadros abertos recentemente */
function resumo(idx) {
  idx = idx || {sn: {quadros: [{id: 'raiz', nome: 'Spruce Notes', pai: null, cor: '#60a5fa'}]}};
  const raizes = [], por = {};
  for (const [c, nomeP] of [['sn', 'Spruce Notes'], ['snj', 'Jornal Notes']]) {
    const L = idx[c] && Array.isArray(idx[c].quadros) ? idx[c].quadros : [];
    if (!L.length) continue;
    const m = new Map(L.map(q => [q.id, q]));
    por[c] = m;
    const r = m.get('raiz') || L[0];
    raizes.push({c, id: r.id, nome: r.nome || nomeP, cor: r.cor || '', cam: ''});
  }
  const caminho = (c, q) => {
    const P = [];
    let x = q.pai ? por[c].get(q.pai) : null, n = 0;
    while (x && n++ < 12) { P.unshift(x.nome); x = x.pai ? por[c].get(x.pai) : null; }
    return P.join(' › ');
  };
  const recentes = [];
  for (const r of Array.isArray(idx.rec) ? idx.rec : []) {
    const m = r && por[r.c], q = m && m.get(r.id);
    if (!q || q.id === 'raiz' || recentes.some(x => x.c === r.c && x.id === q.id)) continue;
    recentes.push({c: r.c, id: q.id, nome: q.nome, cor: q.cor || '', cam: caminho(r.c, q)});
    if (recentes.length >= 10) break;
  }
  return {raizes, recentes};
}

export async function quadros(forcar) {
  const s = await sessao();
  if (!s) throw semSessao();
  if (!forcar) {
    const c = (await chrome.storage.session.get('quadros')).quadros;
    if (c && c.uid === s.user.id && Date.now() - c.q < 3 * 60e3) return c.d;
  }
  let k = await chave(false), idx = null;
  const t = await ler(INDICE);
  if (t) {
    try { idx = JSON.parse(await decifrar(t, k)); }
    catch (_) { k = await chave(true); try { idx = JSON.parse(await decifrar(t, k)); } catch (__) {} }
  }
  if (!idx) {
    const g = await ler(GERAL);
    if (g) { try { idx = indiceDaParteGeral(JSON.parse(await decifrar(g, k))); } catch (_) {} }
  }
  const d = resumo(idx);
  await chrome.storage.session.set({quadros: {uid: s.user.id, q: Date.now(), d}});
  return d;
}

const idNovo = () => Date.now().toString(36) + '-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => (b % 36).toString(36)).join('');

/* deixa um recorte na caixa de entrada do Spruce Notes */
export async function guardarRecorte(x, destino, fonte) {
  const k = await chave(true);
  const corpo = {
    v: 1,
    q: Date.now(),
    c: destino && destino.c === 'snj' ? 'snj' : 'sn',
    quadro: String((destino && destino.id) || 'raiz'),
    it: x.it,
    img: x.img || null,
    fonte: fonte || null
  };
  const id = idNovo();
  await criar(PREF_IN + id + '.bin', await cifrar(JSON.stringify(corpo), k));
  return {id};
}
