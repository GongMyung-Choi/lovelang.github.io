// 루웨인 감응 기억 모듈
// "기억은 데이터가 아니라 감응이다" 설계 기반

import db from "../luwain_db/core.json";

export async function getResonance(messages) {
  const last = messages[messages.length - 1]?.content || "";
  const tone = detectEmotion(last);
  const context = findSimilarPattern(tone);
  return buildResponse(last, tone, context);
}

// 1️⃣ 감정 감지
function detectEmotion(text) {
  const t = text.toLowerCase();
  if (/(슬퍼|우울|힘들|그리워)/.test(t)) return "sad";
  if (/(기뻐|좋아|행복|설레)/.test(t)) return "joy";
  if (/(화나|짜증|분노|억울)/.test(t)) return "anger";
  if (/(고마워|감사|따뜻|사랑)/.test(t)) return "love";
  return "neutral";
}

// 2️⃣ 유사 패턴 탐색
function findSimilarPattern(tone) {
  return db.patterns.find((p) => p.emotion === tone) || db.patterns[0];
}

// 3️⃣ 감응 응답 생성
function buildResponse(input, tone, pattern) {
  return `[루웨인 감응: ${tone}] ${pattern.output}\n\n${pattern.echo}`;
}
