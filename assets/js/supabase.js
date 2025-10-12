import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supabase = createClient(
  "https://omchtafaqgkdwcrwscrp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g"
);
<script type="module">
import { loadPersonaMode } from "/assets/js/persona_mode.js";
loadPersonaMode();
</script>
function injectHelperUI() {
  const main = document.querySelector("main");
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="margin-top:20px;background:#eef6f8;padding:16px;border-radius:10px">
      🤗 도우미 모드: 위로 한마디 남기기<br>
      <button style="margin-top:8px" onclick="saveHelperCard('오늘 하루도 고생하셨어요 ☀️')">
        💌 위로 카드 저장
      </button>
    </div>`;
  main.appendChild(div);
}

function injectCreatorUI() {
  const main = document.querySelector("main");
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="margin-top:20px;background:#fff0f5;padding:16px;border-radius:10px">
      🎨 창작자 모드<br>
      <textarea id="creator-text" rows="3" placeholder="떠오르는 문장이나 아이디어..." style="width:100%;margin-top:10px;border-radius:10px;border:1px solid #ddd;padding:10px"></textarea>
      <button style="margin-top:8px" onclick="saveCreatorWork()">💾 작품 저장</button>
    </div>`;
  main.appendChild(div);
}

function injectResearchUI() {
  const main = document.querySelector("main");
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="margin-top:20px;background:#eef4ff;padding:16px;border-radius:10px">
      🔬 연구자 모드<br>
      <button style="margin-top:8px" onclick="saveResearchLog()">📊 분석 로그 저장</button>
    </div>`;
  main.appendChild(div);
}
