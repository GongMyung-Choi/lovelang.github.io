import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// TODO: 너의 프로젝트 값으로 교체
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(location.search);
const targetPersona = params.get("persona");

// ── Chart.js 인스턴스 보관 (재사용)
let radarChart, heartbeatChart, collabChart;

// ── 퍼스나 레이더 로드/업데이트
async function loadPersonaStatus() {
  let query = supabase.from("persona_profiles").select("name, emotion, logic, empathy, creativity");
  if (targetPersona) query = query.eq("name", targetPersona);
  const { data, error } = await query;
  if (error) return console.error(error);

  const ctx = document.getElementById("personaChart").getContext("2d");
  const labels = ["감성", "논리", "공감", "창의"];
  const datasets = (data || []).map(p => ({
    label: p.name,
    data: [p.emotion, p.logic, p.empathy, p.creativity],
    fill: true,
    borderWidth: 2
  }));

  if (radarChart) { radarChart.data.labels = labels; radarChart.data.datasets = datasets; radarChart.update(); }
  else {
    radarChart = new Chart(ctx, { type: "radar", data: { labels, datasets }, options: { scales: { r: { min:0, max:100 } }, plugins:{ legend:{ position:"bottom" } } } });
  }
}

// ── recent activity
async function loadRecentActivity() {
  const { data } = await supabase.from("alerts").select("*").order("ts", { ascending: false }).limit(10);
  const list = document.getElementById("activityList");
  list.innerHTML = (data || []).map(a => `<li>[${a.type}] ${new Date(a.ts).toLocaleString()} - ${a.detail?.name ?? a.detail?.message ?? ""}</li>`).join("");
}

// ── heartbeat
async function loadHeartbeat() {
  const { data } = await supabase.from("alerts").select("ts").eq("type","heartbeat").order("ts",{ascending:true}).limit(50);
  const ctx = document.getElementById("heartbeatChart").getContext("2d");
  const labels = (data || []).map(d => new Date(d.ts).toLocaleTimeString());
  const values = (data || []).map(() => 1);

  if (heartbeatChart) { heartbeatChart.data.labels = labels; heartbeatChart.data.datasets[0].data = values; heartbeatChart.update(); }
  else {
    heartbeatChart = new Chart(ctx, {
      type: "line",
      data: { labels, datasets: [{ label: "Heartbeat", data: values, borderWidth: 2 }] },
      options: { scales: { y: { display:false } } }
    });
  }
}

// ── collab
async function loadCollabStats() {
  const { data } = await supabase.from("collaboration_projects").select("type");
  const counts = {};
  (data||[]).forEach(r => counts[r.type] = (counts[r.type]||0)+1);

  const ctx = document.getElementById("collabChart").getContext("2d");
  const labels = Object.keys(counts), values = Object.values(counts);

  if (collabChart) { collabChart.data.labels = labels; collabChart.data.datasets[0].data = values; collabChart.update(); }
  else {
    collabChart = new Chart(ctx, {
      type: "doughnut",
      data: { labels, datasets: [{ data: values }] },
      options: { plugins: { legend:{ position:"bottom" } } }
    });
  }
}

// ── 실시간 구독: persona_profiles + alerts + collaboration_projects
function subscribeRealtime() {
  // 퍼스나 지표 변경 즉시 레이더 갱신
  supabase
    .channel("realtime:personas")
    .on("postgres_changes", { event: "*", schema: "public", table: "persona_profiles" }, payload => {
      if (targetPersona && payload.new?.name && payload.new.name !== targetPersona) return;
      loadPersonaStatus();
    })
    .subscribe();

  // 하트비트/알림 목록 실시간
  supabase
    .channel("realtime:alerts")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, () => {
      loadRecentActivity();
      loadHeartbeat();
    })
    .subscribe();

  // 협업 프로젝트 통계 실시간
  supabase
    .channel("realtime:collab")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "collaboration_projects" }, () => {
      loadCollabStats();
    })
    .subscribe();
}

// 초기 로드
loadPersonaStatus();
loadRecentActivity();
loadHeartbeat();
loadCollabStats();
subscribeRealtime();
