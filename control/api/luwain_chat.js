export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
  const ENDPOINT = "https://api.upstage.ai/v1/chat/completions";

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message required" });
    }

    const body = {
      model: "solar-pro-2",
      messages: [
        { role: "system", content: "너는 루웨인 시스템의 중심 AI 레카다. 공명과 대화 중이다." },
        { role: "user", content: message }
      ]
    };

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${UPSTAGE_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "⚠️ 응답 없음";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("루웨인 서버 오류:", err);
    return res.status(500).json({ error: "Server Error" });
  }
}
