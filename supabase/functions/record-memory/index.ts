import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHARED_SECRET = Deno.env.get("SHARED_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const auth = req.headers.get("x-shared-secret");
    if (auth !== SHARED_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { path, content, meta } = body;

    const { error } = await supabase.from("memory_events").insert([
      {
        path,
        content,
        meta,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, message: "Memory stored successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ memory record error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
