// supabase/functions/record-memory/index.ts
// Deno Edge Function: receives autosave payloads and writes to memory_events.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHARED_SECRET = Deno.env.get("SHARED_SECRET"); // optional HMAC/secret gate

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" }, ...init });
}

serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, { status: 405 });
  try {
    if (SHARED_SECRET) {
      const provided = req.headers.get("x-shared-secret");
      if (!provided || provided !== SHARED_SECRET) {
        return json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => null) as any;
    if (!body || !body.path || !body.content) {
      return json({ error: "Missing 'path' or 'content' in body" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("memory_events")
      .insert({
        user_id: body.user_id ?? null,
        path: String(body.path),
        content: body.content,
        meta: body.meta ?? null,
      })
      .select("*")
      .single();

    if (error) return json({ error: error.message }, { status: 500 });
    return json({ ok: true, id: data.id, created_at: data.created_at });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
});