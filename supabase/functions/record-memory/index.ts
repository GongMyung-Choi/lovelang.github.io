import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 환경 변수에서 키 불러오기
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const data = await req.json();
    const { path, content, meta } = data;

    // 저장: memory_events 테이블에 기록
    const { error } = await supabase.from("memory_events").insert({
      path,
      content,
      meta,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: "success", message: "Memory recorded!" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ status: "error", message: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
