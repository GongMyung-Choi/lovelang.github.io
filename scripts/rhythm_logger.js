// 🌙 루웨인 공명 리듬 기록기
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let colorSamples = [];
let activitySamples = [];
let lastLog = 0;

// 공명 루프에 통합 (heart_bridge.js → 여기 호출)
export function recordResonance(color, activity) {
  const now = Date.now();
  if (now - lastLog < 5000) return; // 5초마다 1회 기록

  colorSamples.push(color);
  activitySamples.push(activity);
  lastLog = now;
}

// 자정에 요약 데이터 저장
async function saveDailySummary() {
  if (colorSamples.length === 0) return;

  const avgAct = activitySamples.reduce((a, b) => a + b, 0) / activitySamples.length;
  const dominant = findDominantColor();
  const resonance = calcResonanceScore(avgAct, dominant);

  await supabase.from("user_rhythm").insert({
    uid: "루웨인_공명_기본",
    avg_activity: avgAct,
    dominant_color: dominant,
    resonance_score: resonance
  });

  console.log("💾 하루 공명 데이터 저장 완료:", dominant, resonance);
  colorSamples = [];
  activitySamples = [];
}

function findDominantColor() {
  const count = {};
  colorSamples.forEach(c => count[c] = (count[c] || 0) + 1);
  return Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);
}

function calcResonanceScore(act, color) {
  const colorWeight = color.includes("33bbff") ? 1.3 : color.includes("33ff77") ? 1.1 : color.includes("ff") ? 0.8 : 1.0;
  return Math.min(100, Math.round(act * 10 * colorWeight));
}

// 매일 00:00 실행
function scheduleMidnightSave() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const delay = next - now;
  setTimeout(() => {
    saveDailySummary();
    scheduleMidnightSave();
  }, delay);
}
scheduleMidnightSave();
