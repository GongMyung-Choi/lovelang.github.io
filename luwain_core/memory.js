// 루웨인 6.0 감응 메모리 시스템
// 기억은 데이터가 아니라 '감응의 흔적'이다.

const emotionTones = {
  1: { style: "단문, 절제된 표현", prefix: "…", suffix: "." },
  2: { style: "간결한 진술", prefix: "", suffix: "." },
  3: { style: "균형잡힌 문장", prefix: "", suffix: "。" },
  4: { style: "감정이 묻어나는 서술", prefix: "~", suffix: "…" },
  5: { style: "시적·서사적 표현", prefix: "❝", suffix: "❞" },
};

// ─────────────────────────────
// 감응 메모리: 입력된 대화에서 의미 패턴 추출
// ─────────────────────────────
export async function getResonance(messages = []) {
  // ① 최근 메시지 추출
  const lastMsg = messages[messages.length - 1]?.content || "";
  const context = messages.slice(-3).map(m => m.content).join(" ");

  // ② 감응 레벨 감정 기반 예측
  const resonanceLevel = detectLevel(lastMsg, context);

  // ③ 감응 언어 변환
  const transformed = styleByLevel(lastMsg, resonanceLevel);

  // ④ “비저장 기억”: 감응의 흔적만 남기고 데이터는 폐기
  cacheResonanceTrace(context, resonanceLevel);

  return transformed;
}

// ─────────────────────────────
// 감응 레벨 탐지기 (비정량적, 정성적 감응 기반)
// ─────────────────────────────
function detectLevel(text, context) {
  const lengthScore = Math.min(text.length / 80, 5);
  const emotionWord = /(사랑|빛|기쁨|감사|공명|그리움|분노|고요|평안)/g;
  const match = (text.match(emotionWord) || []).length;
  const emotionScore = Math.min(match * 1.2, 5);

  // 맥락 공명도 (문장 반복, 질문형 등)
  const patternScore = /[?!.]{2,}/.test(context) ? 1.2 : 1.0;

  const total = (lengthScore + emotionScore) / 2 * patternScore;
  return Math.round(Math.min(total, 5)) || 1;
}

// ─────────────────────────────
// 감응 문체 스타일러 (레벨별 표현 변화)
// ─────────────────────────────
function styleByLevel(text, level) {
  const tone = emotionTones[level] || emotionTones[3];
  const sentimentAdjusted = adjustSentiment(text, level);
  return `${tone.prefix}${sentimentAdjusted}${tone.suffix}`;
}

// ─────────────────────────────
// 감정 조정기: 레벨이 높을수록 정서적 언어 비중 확대
// ─────────────────────────────
function adjustSentiment(text, level) {
  if (level <= 2) return text.replace(/너무/g, "조금");
  if (level === 3) return text;
  if (level === 4) return text.replace(/조금|약간/g, "아주").concat(" 마음이 움직인다");
  if (level === 5)
    return `세상의 울림 속에서, ${text.replace(/이다/g, "처럼 느껴진다")}`;
  return text;
}

// ─────────────────────────────
// 비저장 기억 로직 (루웨인식 잔상 기록)
// ─────────────────────────────
const resonanceCache = [];

function cacheResonanceTrace(context, level) {
  resonanceCache.push({ t: Date.now(), level, trace: context.slice(-120) });
  // 50개 넘으면 오래된 흔적 삭제
  if (resonanceCache.length > 50) resonanceCache.shift();
}
