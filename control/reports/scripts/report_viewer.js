import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const report = document.getElementById("report");

async function loadReport() {
  const { data, error } = await supabase
    .from("user_rhythm")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(7);

  if (error) {
    report.innerHTML = `<p>⚠️ 데이터 불러오기 실패: ${error.message}</p>`;
    return;
  }

  report.innerHTML = data.map(r => `
    <div class="report-card" style="border-left: 6px solid ${r.dominant_color};">
      <h3>${r.date}</h3>
      <p><b>평균 활동:</b> ${r.avg_activity.toFixed(2)}</p>
      <p><b>지배적 리듬:</b> <span style="color:${r.dominant_color}">${r.dominant_color}</span></p>
      <p><b>공명 점수:</b> ${r.resonance_score}/100</p>
    </div>
  `).join("");
}

loadReport();
