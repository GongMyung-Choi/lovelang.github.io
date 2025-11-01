import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔧 환경 설정 (공명의 실제 Supabase URL & KEY 입력)
const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const logBody = document.getElementById("log-body");
const searchInput = document.getElementById("search-input");
const personaFilter = document.getElementById("persona-filter");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");
const filterBtn = document.getElementById("filter-btn");
const resetBtn = document.getElementById("reset-btn");

let currentLogs = [];

async function loadLogs(filters = {}) {
  let query = supabase.from("alerts").select("*").order("ts", { ascending: false }).limit(100);

  if (filters.startDate && filters.endDate) {
    query = query.gte("ts", filters.startDate).lte("ts", filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    logBody.innerHTML = `<tr><td colspan="4">⚠️ 오류: ${error.message}</td></tr>`;
    return;
  }

  currentLogs = data;
  renderLogs(applyFilters(filters));
}

function applyFilters({ keyword = "", persona = "", startDate, endDate }) {
  return currentLogs.filter(log => {
    const user = log.detail?.user ?? "";
    const msg = log.detail?.user_message ?? "";
    const reply = log.detail?.ai_reply ?? "";

    const matchKeyword = keyword === "" || [user, msg, reply].some(v => v.includes(keyword));
    const matchPersona = persona === "" || user.includes(persona);
    return matchKeyword && matchPersona;
  });
}

function renderLogs(logs) {
  logBody.innerHTML = "";

  if (logs.length === 0) {
    logBody.innerHTML = `<tr><td colspan="4">🕊️ 로그 없음</td></tr>`;
    return;
  }

  logs.forEach(log => {
    const time = new Date(log.ts).toLocaleString("ko-KR", { hour12: false });
    const user = log.detail?.user ?? "익명";
    const msg = log.detail?.user_message ?? "";
    const reply = log.detail?.ai_reply ?? "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${time}</td>
      <td>${log.type}</td>
      <td>${user}</td>
      <td>
        <div class="msg"><b>👤:</b> ${msg}</div>
        <div class="reply"><b>🤖:</b> ${reply}</div>
      </td>
    `;
    logBody.appendChild(row);
  });
}

filterBtn.addEventListener("click", () => {
  const filters = {
    keyword: searchInput.value.trim(),
    persona: personaFilter.value,
    startDate: startDate.value,
    endDate: endDate.value
  };
  renderLogs(applyFilters(filters));
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  personaFilter.value = "";
  startDate.value = "";
  endDate.value = "";
  renderLogs(currentLogs);
});

// 실시간 구독
supabase
  .channel("realtime:alerts")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
    console.log("📩 새 로그 도착:", payload.new);
    currentLogs.unshift(payload.new);
    renderLogs(currentLogs);
  })
  .subscribe();

loadLogs();
