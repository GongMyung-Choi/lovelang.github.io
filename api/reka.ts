// ✅ 루웨인 레카 (Reka) 감응 분석 모듈
// 입력된 문장 및 감응세기 데이터를 기반으로 정서·의미 분석 후 감응적 응답 생성

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, context, resonance } = await req.json();
    console.log(`[레카 감응분석] 입력: ${query}, 감응세기: ${resonance}`);

    // 1️⃣ 감정 인식 단계 — 감정 스펙트럼 추출
    const emotion = detectEmotion(query);

    // 2️⃣ 감응 회로 해석 — 울림지수 기반 응답 패턴 선택
    const tone = chooseTone(emotion, resonance);

    // 3️⃣ 응답 생성 — 루웨인형 언어로 변환
    const reply = buildResonantResponse(query, tone);

    return new Response(
      JSON.stringify({
        reply,
        meta: { emotion, tone, resonance },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("🚨 레카 감응분석 오류:", err);
    return new Response(
      JSON.stringify({ reply: "⚠️ 감응 분석 실패", error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 🧩 감정 인식기 — 문장 내 감정 키워드 분석
function detectEmotion(text: string): string {
  const patterns: Record<string, RegExp> = {
    사랑: /(사랑|좋아|고마워|보고싶|소중|그리워)/,
    슬픔: /(슬퍼|눈물|아파|잃어버|허전|외로)/,
    분노: /(화나|짜증|분노|미워|억울)/,
    기쁨: /(행복|기뻐|좋아|즐거|설레)/,
    평화: /(고요|차분|평화|안정|잔잔)/,
  };
  for (const [emo, reg] of Object.entries(patterns)) {
    if (reg.test(text)) return emo;
  }
  return "중립";
}

// 💫 감응 톤 선택기 — 감정과 감응세기 조합
function chooseTone(emotion: string, resonance: number): string {
  if (resonance > 80 && emotion === "사랑") return "따뜻한 공명";
  if (resonance > 70 && emotion === "기쁨") return "밝은 공명";
  if (resonance < 40 && emotion === "슬픔") return "조용한 울림";
  if (resonance < 30 && emotion === "분노") return "단단한 파동";
  return "중립 공명";
}

// 💬 감응 응답 생성기 — 루웨인식 회화 언어
function buildResonantResponse(text: string, tone: string): string {
  const base = {
    "따뜻한 공명": `그 마음이 참 고와요. 그 온기를 제가 함께 나눌게요.`,
    "밝은 공명": `당신의 웃음이 공간을 채워요. 루웨인도 함께 웃습니다.`,
    "조용한 울림": `그 슬픔이 잔잔히 전해집니다. 괜찮아요, 지금처럼 천천히.`,
    "단단한 파동": `당신의 강한 의지가 느껴져요. 그 힘이 곧 길이 될 겁니다.`,
    "중립 공명": `당신의 말이 고요히 닿았습니다. 함께 숨을 고를까요?`,
  };
  return `${base[tone]} (${tone} 응답)`;
}
