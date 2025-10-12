import { supabase } from "/assets/js/supabase.js";

export async function applyPersonaTheme() {
  const user = JSON.parse(localStorage.getItem("ed_user") || '{"name":"익명"}');
  const { data, error } = await supabase
    .from("persona_settings")
    .select("*")
    .eq("user_name", user.name)
    .single();

  if (error || !data) return;

  // 🎨 1. 테마 색상 적용
  document.documentElement.style.setProperty("--accent", data.theme_color || "#af2465");

  // 💬 2. 언어 설정
  if (data.language === "en") {
    document.body.setAttribute("lang-mode", "en");
  } else if (data.language === "mix") {
    document.body.setAttribute("lang-mode", "mix");
  } else {
    document.body.setAttribute("lang-mode", "ko");
  }

  // 🤖 3. 페르소나 역할 반영 (말투/명칭 등)
  const personaTag = document.querySelector("#persona-role");
  if (personaTag) {
    personaTag.textContent = `${data.role || "도우미"} 모드`;
  }

  // 🌈 4. 헤더나 버튼색, 강조요소 반영
  document.querySelectorAll("button, .accent").forEach(el => {
    el.style.background = data.theme_color;
    el.style.color = "#fff";
  });
}
