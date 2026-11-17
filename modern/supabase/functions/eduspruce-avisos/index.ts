// EduSpruce · função «eduspruce-avisos» (Supabase Edge Function) — avisos com a app fechada
// Criar em: Supabase › Edge Functions › Deploy a new function › Via Editor › nome «eduspruce-avisos» › colar este ficheiro › Deploy.
// Depois, nos detalhes da função, DESLIGAR «Verify JWT» (o agendamento chama-a sem sessão).
// Não precisa de segredos: usa a chave de serviço que o Supabase já dá às funções e cria as chaves VAPID sozinha na primeira vez.
//
//   GET  ?chave=1  → chave pública VAPID (a app precisa dela para ativar os avisos no aparelho)
//   POST (agendamento pg_cron, de minuto a minuto) → envia os avisos que chegaram à hora e apaga-os
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { ...CORS, "Content-Type": "application/json" } });

type Vapid = { pub: string; priv: string };
let VAPID: Vapid | null = null;
async function vapid(): Promise<Vapid> {
  if (VAPID) return VAPID;
  const r = await db.from("eduspruce_push_vapid").select("pub,priv").eq("id", 1).maybeSingle();
  if (r.error) throw new Error("tabela eduspruce_push_vapid: " + r.error.message + " (correu o 0016_avisos_push.sql?)");
  if (r.data) return (VAPID = r.data as Vapid);
  const k = webpush.generateVAPIDKeys();
  await db.from("eduspruce_push_vapid").upsert({ id: 1, pub: k.publicKey, priv: k.privateKey }, { onConflict: "id", ignoreDuplicates: true });
  const r2 = await db.from("eduspruce_push_vapid").select("pub,priv").eq("id", 1).single(); // se duas chamadas criaram ao mesmo tempo, fica a primeira
  if (r2.error) throw new Error(r2.error.message);
  return (VAPID = r2.data as Vapid);
}

type Sub = { endpoint: string; p256dh: string; auth: string; user_id: string };
// envia um aviso para um aparelho; devolve o estado HTTP do serviço de avisos (201 = entregue; 404/410 = subscrição já não existe)
async function enviar(v: Vapid, s: Sub, dados: Record<string, string>, ttl: number): Promise<number> {
  const det = webpush.generateRequestDetails(
    { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
    JSON.stringify(dados),
    { vapidDetails: { subject: "https://eduspruce.pt", publicKey: v.pub, privateKey: v.priv }, TTL: ttl, urgency: "high" },
  );
  const r = await fetch(det.endpoint, { method: "POST", headers: det.headers as Record<string, string>, body: new Uint8Array(det.body as unknown as ArrayLike<number>) });
  try { await r.arrayBuffer(); } catch (_) { /* nada */ }
  return r.status;
}

async function processar() {
  const v = await vapid();
  const { data: av, error } = await db.rpc("eduspruce_avisos_tirar", { p_lim: 300 });
  if (error) throw new Error(error.message);
  const L = (av ?? []) as { user_id: string; chave: string; quando: string; titulo: string; corpo: string; v: string; t: string }[];
  if (!L.length) return { enviados: 0 };
  const users = [...new Set(L.map((x) => x.user_id))];
  const { data: subs } = await db.from("eduspruce_push_subs").select("endpoint,p256dh,auth,user_id").in("user_id", users);
  const porU = new Map<string, Sub[]>();
  for (const s of (subs ?? []) as Sub[]) { if (!porU.has(s.user_id)) porU.set(s.user_id, []); porU.get(s.user_id)!.push(s); }
  const mortas = new Set<string>(); let ok = 0, falhas = 0, atrasados = 0;
  const agora = Date.now();
  await Promise.all(L.map(async (a) => {
    const atraso = agora - new Date(a.quando).getTime();
    if (atraso > 3 * 3600e3) { atrasados++; return; } // muito atrasado: já não interessa
    const ttl = Math.max(300, Math.min(4 * 3600, Math.round((4 * 3600e3 - atraso) / 1000)));
    for (const s of porU.get(a.user_id) ?? []) {
      if (mortas.has(s.endpoint)) continue;
      try {
        const st = await enviar(v, s, { titulo: a.titulo, corpo: a.corpo, v: a.v, t: a.t, tag: a.chave }, ttl);
        if (st === 404 || st === 410) mortas.add(s.endpoint); else if (st >= 200 && st < 300) ok++; else falhas++;
      } catch (_) { falhas++; }
    }
  }));
  if (mortas.size) await db.from("eduspruce_push_subs").delete().in("endpoint", [...mortas]);
  return { avisos: L.length, enviados: ok, falhas, atrasados, removidas: mortas.size };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  try {
    const u = new URL(req.url);
    if (req.method === "GET" && u.searchParams.has("chave")) return json({ pub: (await vapid()).pub });
    if (req.method === "POST") return json(await processar());
    return json({ ok: true, servico: "eduspruce-avisos" });
  } catch (e) {
    console.error(e);
    return json({ erro: String((e as Error).message || e) }, 500);
  }
});
