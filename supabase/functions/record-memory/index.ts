// supabase/functions/record-memory/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const body = await req.json();
  console.log("📥 Memory Record Received:", body);

  const supabaseUrl = Deno.env.get("https://omchtafaqgkdwcrwscrp.supabase.co");
 
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { path, content, meta } = body;

  const { error } = await supabase
    .from("memory_events")
    .insert([{ path, content, meta }]);

  if (error) {
    console.error("❌ DB insert error:", error);
    return new Response(JSON.stringify({ ok: false, error }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
