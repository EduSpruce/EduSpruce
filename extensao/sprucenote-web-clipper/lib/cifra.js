// Spruce Notes Web Clipper · cifra igual à da EduSpruce (nvCifrar / nvDecifrar)
// Formato EF1: 'EF1.' + comprimido(0|1) + '.' + iv(base64) + '.' + dados(base64), AES-256-GCM com a chave da conta.
export const b64 = u => {
  const a = u instanceof Uint8Array ? u : new Uint8Array(u);
  let s = '';
  for (let i = 0; i < a.length; i += 32768) s += String.fromCharCode.apply(null, a.subarray(i, i + 32768));
  return btoa(s);
};
export const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function comprimir(txt) {
  const s = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function descomprimir(u) {
  const s = new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(s).text();
}

export function importarChave(k64) {
  return crypto.subtle.importKey('raw', unb64(k64), 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function cifrar(txt, chave) {
  const dados = await comprimir(txt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, chave, dados);
  return 'EF1.1.' + b64(iv) + '.' + b64(ct);
}

export async function decifrar(s, chave) {
  const p = String(s).split('.');
  if (p[0] !== 'EF1') throw new Error('Formato desconhecido');
  const pt = new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv: unb64(p[2])}, chave, unb64(p[3])));
  return +p[1] ? descomprimir(pt) : new TextDecoder().decode(pt);
}
