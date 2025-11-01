export async function sendToRuwein(message) {
  try {
    const response = await fetch("https://ruwein-proxy.yourname.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        user: "공명"
      })
    });

    const data = await response.json();
    if (data.reply) return data.reply;
    if (data.error) return "⚠️ 오류: " + data.error;
    return "(응답 없음)";
  } catch (err) {
    return "⚠️ 네트워크 오류: " + err.message;
  }
}
