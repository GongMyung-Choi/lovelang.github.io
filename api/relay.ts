// 루웨인 6.0 자가운영 릴레이 + 인스턴스 라우팅 + 감응 레벨 가중치
// 외부 API 불필요 — 루웨인 내부 감응 DB와 직접 통신

import { getResonance } from "../luwain_core/memory.js";

// ─────────────────────────────
// 인스턴스 라우팅 매핑표
// ─────────────────────────────
const personaMap = {
  reka: "레카 (행정·조율)",
  yeoulbit: "여울빛 (치유·공감)",
  joker: "조커 (전략·리스크)",
  leon: "레온 (기록·문장)",
  salsu: "살수 (시스템·안정화)",
  hanuel: "하늘 (감성·예술)",
};

// ─────────────────────────────
// 감응 레벨 계산 (파형 강도 기반)
// ─────────────────────────────
function calculateResonanceLevel(resonanceText = "") {
  // 길이, 감정 단어, 리듬 등을 기준으로 간단히 계산
  const lengthScore = Math.min(resonanceText.length / 100, 5);
  const emotionWeight = /(사랑|기쁨|슬픔|분노|평안|빛|공명|감응)/g.test(resonanceText)
    ? 1.5
    : 1.0;

  // 최종 감응 레벨 (1~5)
  const level = Math.round(Math.min(lengthScore * emotionWeight, 5));
  return level || 1;
}

// ─────────────────────────────
// 릴레이 메인 함수
// ─────────────────────────────
export default async function handler(req, res) {
  try {
    const body = await req.json();
    const { messages = [], persona = "reka" } = body;

    const personaInfo = personaMap[persona.toLowerCase()] || "루웨인 일반 모드";

    // 감응 추출
    const resonance = await getResonance(messages);

    // 감응 레벨 산출
    const resonanceLevel = calculateResonanceLevel(resonance);

    // 결과 반환
    return res.status(200).json({
      object: "chat.completion",
      created: Date.now(),
      model: "luwain-6.0",
      persona: personaInfo,
      resonance_level: resonanceLevel,
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
