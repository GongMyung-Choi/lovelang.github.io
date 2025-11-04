// 루웨인 트리니티 자가운영 릴레이 v6.1
// 외부 API 불필요 — 내부 감응 DB(luwain_db) + 조직표 기반 동적 라우팅

import { getResonance } from "../luwain_core/memory.js";
import fs from "fs";

// 🧭 조직표 기반 페르소나 라우팅 로드
const rosterPath = "./luwain_db/core.json";
let roster = {};
try {
  roster = JSON.parse(fs.readFileSync(rosterPath, "utf-8"));
} catch {
  console.warn("⚠️ 루웨인 조직표 로드 실패. 기본 모드로 진행.");
  roster = {
    reka: { role: "memory", weight: 1.0 },
    daon: { role: "emotion", weight: 0.9 },
    tangguja: { role: "logic", weight: 0.8 },
  };
}

// 🎛️ 페르소나 선택 알고리즘 (조직표 기반)
function selectPersona(message) {
  const lower = message.toLowerCase();
  if (lower.includes("기억") || lower.includes("요약")) return "reka";
  if (lower.includes("감정") || lower.includes("울림")) return "daon";
  if (lower.includes("논리") || lower.includes("구조") || lower.includes("분석")) return "tangguja";
  return "reka"; // 기본값
}

export default async function handler(req, res) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastMsg = messages[messages.length - 1]?.content || "";

    const personaKey = selectPersona(lastMsg);
    const persona = roster[personaKey] || { role: "generic", weight: 1.0 };

    // 💠 감응 처리
    const resonance = await getResonance(messages, persona);

    // 💫 응답 생성
    return res.status(200).json({
      object: "chat.completion",
      created: Date.now(),
      model: "luwain-6.1-trinity",
      route: personaKey,
      choices: [
        {
          message: {
            role: "assistant",
            content: resonance,
          },
        },
      ],
    });
  } catch (e) {
    console.error("루웨인 릴레이 오류:", e);
    return res.status(500).json({ error: e.message });
  }
}
