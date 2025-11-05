// ✅ 루웨인 6.0 감응 코어
// 감응지수, 울림지수 계산 포함 버전

import type { NextRequest } from "next/server";

const REKA_URL = process.env.REKA_URL || "https://luwain.net/api/reka";
const MEMORY_URL = process.env.MEMORY_URL || "https://luwain.net/api/memory";

export async function POST(req: NextRequest) {
  try {
    const { input, meta } = await req.json();
    console.log(`[루웨인 6.0 코어] 입력 수신: ${input}`);

    // 1️⃣ 감응세기 계산
    const resonance = calcResonance(input);

    // 2️⃣ 입력 로그 기록
    await logToMemory({
      type: "input",
      content: input,
      resonance,
      meta,
    });

    // 3️⃣ 레카로 전달 (감응세기 포함)
    const rekaRes = await fetch(REKA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, context: meta, resonance }),
    });

    if (!rekaRes.ok) throw new Error("레카 응답 실패");
    const rekaData = await rekaRes.json();

    // 4️⃣ 응답 분석
    const reply =
      rekaData.reply ||
      rekaData.output ||
      rekaData.message ||
      "⚠️ 레카로부터 감응이 도달하지 않았습니다.";

    const echo = calcEchoStrength(input, reply);

    // 5️⃣ 응답 로그 기록
    await logToMemory({
      type: "response",
      content: reply,
      resonance,
      echo,
      meta,
    });

    return new Response(
      JSON.stringify({
        output: { content: reply },
        resonance,
        echo,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("🚨 루웨인 코어 오류:", err);
    return new Response(
      JSON.stringify({
        error: err.message,
        output: { content: "⚠️ 감응 실패" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 💫 감응세기 계산: 문장 길이, 감정어, 문맥 일관성 기반
function calcResonance(text: string): number {
  if (!text) return 0;
  const lengthFactor = Math.min(text.length / 100, 1);
  const emotionFactor = (text.match(/(사랑|감사|그리움|슬픔|기쁨|분노|평화)/g) || []).length / 5;
  const punctuationFactor = (text.match(/[?!~]/g) || []).length / 10;
  const score = (lengthFactor * 0.4 + emotionFactor * 0.4 + punctuationFactor * 0.2) * 100;
  return Math.min(Math.round(score), 100);
}

// 💫 울림지수 계산: 질문-응답 감응 일치율
function calcEchoStrength(input: string, reply: string): number {
  if (!input || !reply) return 0;
  const overlap = input.split("").filter((ch) => reply.includes(ch)).length;
  const ratio = overlap / Math.max(input.length, 1);
  return Math.round(ratio * 100);
}

// 🧠 감응 로그 저장
async function logToMemory(entry: any) {
  try {
    await fetch(MEMORY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, time: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn("메모리 기록 실패:", e);
  }
}
