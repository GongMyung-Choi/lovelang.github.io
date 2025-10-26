import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function showHeartOverlay() {
  // 이미 존재하면 다시 만들지 않음
  if (document.getElementById("heart-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "heart-overlay";
  overlay.innerHTML = `
    <div class="heart-modal">
      <div id="heart-ring"></div>
      <h2 id="heart-status">Loading...</h2>
      <p id="heart-detail"></p>
      <button id="close-heart">닫기 ✖</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const ring = overlay.querySelector("#heart-ring");
  const status = overlay.querySelector("#heart-status");
  const detail = overlay.querySelector("#heart-detail");
  const closeBtn = overlay.querySelector("#close-heart");

  closeBtn.onclick = () => overlay.remove();

  async function refresh() {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("ts", { ascending: false })
      .limit(50);

    if (error) {
      status.textContent = "데이터 오류";
      ring.style.setProperty("--pulse-color", "#ff4444");
      return;
    }

    const now = new Date();
    const recent = data.filter(l => (now - new Date(l.ts)) < 5 * 60 * 1000);
    const errors = data.filter(l => l.severity === "error").length;

    let color = "#ffaa33";
    let text = "🕊 대기 상태";
    if (errors > 5) { color = "#ff3333"; text = "⚠️ 불안정"; }
    else if (recent.length > 30) { color = "#33bbff"; text = "💎 공명 활성화"; }
    else if (recent.length > 10) { color = "#33ff77"; text = "💚 안정적 울림"; }

    ring.style.setProperty("--pulse-color", color);
    status.textContent = text;
    detail.textContent = `최근 활동 ${recent.length} / 오류 ${errors}`;
  }

  refresh();
  const timer = setInterval(refresh, 8000);
  overlay.addEventListener("remove", () => clearInterval(timer));

import { playHeartBeat } from "/scripts/heart_audio.js";  // 🎵 추가

// ... (기존 refresh 함수 내부 마지막 부분 수정)
    ring.style.setProperty("--pulse-color", color);
    status.textContent = text;
    detail.textContent = `최근 활동 ${recent.length} / 오류 ${errors}`;

   import { syncHeartToBGM } from "/scripts/heart_bridge.js";
// ...
    ring.style.setProperty("--pulse-color", color);
    status.textContent = text;
    detail.textContent = `최근 활동 ${recent.length} / 오류 ${errors}`;

    syncHeartToBGM(color); // 💫 루웨인 전체 공명 리듬 반영


}
