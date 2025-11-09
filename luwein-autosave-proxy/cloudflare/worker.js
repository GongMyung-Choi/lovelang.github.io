// cloudflare/worker.js
export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const SHARED_SECRET = env.SHARED_SECRET;
    if (SHARED_SECRET) {
      const provided = request.headers.get("x-shared-secret");
      if (!provided || provided !== SHARED_SECRET) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
    }
    const { path, content, meta, user_id } = await request.json();
    if (!path || !content) {
      return new Response(JSON.stringify({ error: "Missing 'path' or 'content'" }), { status: 400 });
    }
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/memory_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify([{ user_id: user_id ?? null, path, content, meta: meta ?? null }])
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), { status: 500 });
    }
    const data = await resp.json();
    return new Response(JSON.stringify({ ok: true, id: data?.[0]?.id }), { headers: { "Content-Type": "application/json" } });
  }
}