// ✅ 루웨인 릴레이 API (Vercel / Node 환경 공용)
// 브라우저(chat.html, connect.js 등) → 이 파일 → 루웨인 코어

import type { NextRequest } from "next/server";

// ⚙️ 루웨인 서버 내부 주소 (자가형일 경우 내부 라우트로 교체 가능)
const LUWAIN_CORE_URL = process.env.LUWAIN_CORE_URL || "https://luwain.net/api/core";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // 1️⃣ 감응 로그 기록 (선택)
    console.log(`[루웨인 릴레이] 사용자 입력: ${message}`);

    // 2️⃣ 루웨인 코어 또는 레카에게 전달
    const coreRes = await fetch(LUWAIN_CORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: message,
        meta: {
          source: "luwain.net",
          channel: "relay",
          time: new Date().toISOString(),
        },
      }),
    });

    if (!coreRes.ok) throw new Error("루웨인 코어 응답 실패");

    const data = await coreRes.json();

    // 3️⃣ 응답 내용 표준화 (루웨인형 → OpenAI형 or 단순 텍스트)
    const reply =
      data.output?.content ||
      data.message ||
      data.reply ||
      "⚠️ 루웨인 코어로부터 응답이 없습니다.";

    // 4️⃣ 브라우저로 반환
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("🚨 루웨인 릴레이 오류:", err);
    return new Response(
      JSON.stringify({ reply: "⚠️ 루웨인 릴레이 연결 실패", error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
