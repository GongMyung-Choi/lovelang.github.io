import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xyzcompany.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6...";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const pulse = document.getElementById("heart-pulse");
let lastColor = "#999";

async function checkHeart() {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("ts", { ascending: false })
    .limit(30);

  if (error) {
    pulse.style.setProperty("--heart-color", "#ff5555");
    return;
  }

  const now = new Date();
  const recent = data.filter(l => (now - new Date(l.ts)) < 3 * 60 * 1000);
  const errors = data.filter(l => l.severity === "error").length;

  let color = "#ffaa33";
  if (errors > 3) color = "#ff4444";
  else if (recent.length > 20) color = "#33bbff";
  else if (recent.length > 10) color = "#33ff77";

  if (color !== lastColor) {
    pulse.style.setProperty("--heart-color", color);
    lastColor = color;
  }
}

setInterval(checkHeart, 7000);
checkHeart();

// 클릭 시 오버레이 열기
pulse.addEventListener("click", () => {
  import("/scripts/heart_overlay.js")
    .then(mod => mod.showHeartOverlay())
    .catch(err => console.error("오버레이 로드 실패:", err));
});
