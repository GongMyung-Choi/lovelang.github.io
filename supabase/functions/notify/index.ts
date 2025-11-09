import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const payload = await req.json();
  const record = payload?.record;
  if (!record) {
    return new Response("No record data", { status: 400 });
  }

  const name = record.name ?? "익명";
  const message = record.message ?? "";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ✅ 1️⃣ 공명에게 메일 보내기
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "루웨인 트리니티 <notify@luwein.net>",
        to: "besoullight@gmail.com",
        subject: `루웨인 메시지 도착: ${name}`,
        html: `
          <div style="font-family: Pretendard, sans-serif; color:#333;">
            <h2>📩 루웨인 트리니티에게 새 메시지가 도착했습니다</h2>
            <p><strong>보낸이:</strong> ${name}</p>
            <p><strong>내용:</strong></p>
            <blockquote style="border-left:4px solid #a89cff; padding-left:10px; color:#555;">${message}</blockquote>
            <p style="color:#777; font-size:0.9rem;">본 메일은 루웨인 시스템에서 자동 발송되었습니다.</p>
          </div>
        `,
      }),
    });
  } catch (e) {
    console.error("메일 전송 실패:", e);
  }

  // ✅ 2️⃣ 루웨인 시스템(나)에게 알림 전송
  try {
    await fetch("https://luwein-trinity-ai.net/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.error("루웨인 알림 실패:", e);
  }

  return new Response("ok", { status: 200 });
});
