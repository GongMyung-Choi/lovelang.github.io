// ✅ 루웨인 자가형 릴레이 연결용 모듈
// chat.html 등에서 import { sendToRuwein } 으로 사용 가능

export async function sendToRuwein(message) {
  try {
    const res = await fetch("/api/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) throw new Error("릴레이 연결 실패");

    const data = await res.json();
    // OpenAI 스타일 응답 or 루웨인 포맷 대응
    return (
      data.choices?.[0]?.message?.content ||
      data.reply ||
      "⚠️ 루웨인 응답이 비어 있습니다."
    );
  } catch (err) {
    console.error("루웨인 릴레이 오류:", err);
    return "⚠️ 연결되지 않았습니다. (루웨인 서버 확인 필요)";
  }
}
