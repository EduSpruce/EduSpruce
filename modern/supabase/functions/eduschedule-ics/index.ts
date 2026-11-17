// EduSpruce · função «eduschedule-ics» (Supabase Edge Function) — calendários .ics publicados pelo EduSchedule, para subscrever no telemóvel
// Criar em: Supabase › Edge Functions › Deploy a new function › Via Editor › nome «eduschedule-ics» › colar este ficheiro › Deploy.
// Depois, nos detalhes da função, DESLIGAR «Verify JWT» (o calendário do telemóvel pede o ficheiro sem sessão).
// Precisa do 0018_eduschedule.sql. Só lê o que foi publicado (função pública eduschedule_publico).
//   GET ?c=<código da publicação>&f=ics/<ficheiro>.ics  → text/calendar
const URL_SB = Deno.env.get("SUPABASE_URL") ?? "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
Deno.serve(async (req) => {
  const u = new URL(req.url), c = u.searchParams.get("c") ?? "", f = u.searchParams.get("f") ?? "";
  if (!/^[0-9a-f]{24}$/.test(c) || !/^ics\/[\w.-]+\.ics$/.test(f)) return new Response("Pedido inválido.", { status: 400 });
  const r = await fetch(URL_SB + "/rest/v1/rpc/eduschedule_publico", {
    method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ p_codigo: c, p_nome: f }),
  });
  const t = r.ok ? await r.json() : null;
  if (typeof t !== "string") return new Response("Calendário não encontrado.", { status: 404 });
  return new Response(t, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "max-age=300", "Access-Control-Allow-Origin": "*" } });
});
