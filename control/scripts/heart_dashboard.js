import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ring = document.getElementById("pulse-ring");
const statusText = document.getElementById("status-text");
const msgCount = document.getElementById("recent-msgs");
const errRate = document.getElementById("error-rate");
const avgLatency = document.getElementById("avg-latency");

let pulse = 0;
let logs = [];

async function loadData() {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("ts", { ascending: false })
    .limit(50);

  if (error) {
    console.error(error);
    statusText.textContent = "데이터 오류";
    ring.style.background = "#ff4444";
    return;
  }

  logs = data;
  updateStats();
}

function updateStats() {
  const now = new Date();
  const recent = logs.filter(l => (now - new Date(l.ts)) < 5 * 60 * 1000);
  const errorCount = logs.filter(l => l.severity === "error").length;
  const avg = Math.round(Math.random() * 800 + 200); // 예시: 응답속도

  msgCount.textContent = recent.length;
  errRate.textContent = ((errorCount / logs.length) * 100).toFixed(1) + "%";
  avgLatency.textContent = avg;

  // 상태 판단
  let color, text;
  if (errorCount > 5) {
    color = "#ff3333"; text = "⚠️ 불안정 (에러 다수)";
  } else if (recent.length > 30) {
    color = "#33bbff"; text = "💎 공명 활성화";
  } else if (recent.length > 10) {
    color = "#33ff77"; text = "💚 안정적 울림";
  } else {
    color = "#ffaa33"; text = "🕊 대기 상태";
  }

  ring.style.setProperty("--pulse-color", color);
  statusText.textContent = text;
}

// 실시간 갱신
supabase
  .channel("realtime:alerts")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, payload => {
    logs.unshift(payload.new);
    if (logs.length > 50) logs.pop();
    updateStats();
  })
  .subscribe();

loadData();
setInterval(loadData, 10000);
