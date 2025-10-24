// 🤝 루웨인 협업하기 실시간 등록 모듈
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * createCollabProject
 * @param {Object} param0 - {type, title, persona, detail}
 */
export async function createCollabProject({ type, title, persona, detail = {} }) {
  const entry = {
    type, title,
    persona_name: persona || "익명 퍼스나",
    ts: new Date().toISOString(),
    detail
  };

  const { error } = await supabase.from("collaboration_projects").insert(entry);
  if (error) {
    console.error("[Collaboration] insert failed:", error);
  } else {
    console.log(`[Collaboration] ${type} '${title}' created`);
  }

  // 로그 기록도 남김
  try {
    await supabase.from("alerts").insert({
      type: "collaboration_create",
      severity: "info",
      detail: entry
    });
  } catch (err) {
    console.warn("[Collaboration] alert failed:", err);
  }
}

/**
 * attachCollabButton
 * 페이지 내 협업하기 버튼 자동 연결
 * - 버튼에 data-type / data-persona / data-title 속성 필요
 */
export function attachCollabButton() {
  document.querySelectorAll("[data-collab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type || "general";
      const title = btn.dataset.title || document.title;
      const persona = btn.dataset.persona || "루웨인 사용자";
      createCollabProject({ type, title, persona });
      btn.textContent = "✅ 협업 등록 완료";
      btn.disabled = true;
      setTimeout(() => { btn.textContent = "🤝 협업하기"; btn.disabled = false; }, 3000);
    });
  });
}
