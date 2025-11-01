export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Only POST requests allowed", { status: 405 });
    }

    try {
      const { message, user } = await request.json();

      // 1️⃣ OpenAI 호출
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: "당신은 루웨인 시스템 어시스턴트입니다. 사용자 공명과 협업 중입니다." },
            { role: "user", content: message }
          ]
        })
      });

      const aiData = await aiRes.json();
      const reply = aiData.choices?.[0]?.message?.content ?? "(응답 없음)";

      // 2️⃣ Supabase로 로그 저장
      await fetch(`${env.SUPABASE_URL}/rest/v1/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g,
          "Authorization": `Bearer ${env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          type: "chat",
          severity: "info",
          path: "admin/chat.html",
          detail: {
            user_message: message,
            ai_reply: reply,
            user: user || "공명"
          }
        })
      });

      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
