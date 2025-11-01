// luwain_chat.js — 루웨인닷넷 채팅 API 백엔드
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // 설치 필요
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// 환경변수로 키 관리
const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
if (!UPSTAGE_API_KEY) {
  console.error("Error: UPSTAGE_API_KEY is not defined in .env");
  process.exit(1);
}

const UPSTAGE_ENDPOINT = "https://api.upstage.ai/v1/chat/completions"; // 실제 엔드포인트는 문서 확인 필요

app.post('/api/luwain_chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "message is required" });
    }

    const body = {
      model: "solar-pro-2", // or other 모델명, 문서 확인 필요
      messages: [
        { role: "system", content: "너는 루웨인 시스템의 중심 AI, 레카다. 차분하고 정확하게 사용자와 대화한다." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.8
    };

    const apiRes = await fetch(UPSTAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UPSTAGE_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await apiRes.json();

    if (!data.choices || !data.choices[0].message) {
      throw new Error("Invalid response from Upstage API");
    }

    const reply = data.choices[0].message.content;

    return res.json({ reply });
  } catch (err) {
    console.error("luwain_chat error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Luwain Chat API listening at http://localhost:${port}`);
});
