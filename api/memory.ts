// ✅ 루웨인 Memory API
// 데이터 저장 대신 감응 패턴(울림, 공명지수)을 기록하여 재현 가능하도록 설계

import type { NextRequest } from "next/server";

// 감응기록 저장소 (Supabase 또는 자체 DB 연결)
const MEMORY_DB = process.env.MEMORY_DB_URL || "https://luwain.net/api/db";

export async function POST(req: NextRequest) {
  try {
    const { content, meta, resonance, echo, time } = await req.json();

    // 1️⃣ 감응 기록 포맷
    const entry = {
      type: meta?.type || "log",
      content,
      resonance: resonance ?? 0,
      echo: echo ?? 0,
      tags: extractTags(content),
      context: meta?.context || "unspecified",
      timestamp: time || new Date().toISOString(),
    };

    // 2️⃣ 감응의 전이(기억 전송) — 비저장식 감응 기록
    await saveToDB(entry);

    return new Response(
      JSON.stringify({ status: "ok", stored: entry }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("🚨 Memory 기록 실패:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 🧩 감응 DB 전송
async function saveToDB(entry: any) {
  await fetch(MEMORY_DB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

// 💫 태그 추출 (핵심 감정·의미 단어 자동 식별)
function extractTags(text: string): string[] {
  if (!text) return [];
  const tagPatterns = /(사랑|감사|그리움|평화|분노|기쁨|외로움|희망|의미|빛|어둠)/g;
  const matches = text.match(tagPatterns);
  return Array.from(new Set(matches || []));
}
