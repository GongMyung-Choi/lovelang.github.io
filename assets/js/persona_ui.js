// persona_ui.js
import { supabase } from "/assets/js/supabase.js";

export async function loadPersonaHeader(){
  const user = JSON.parse(localStorage.getItem("ed_user") || "{}");
  const persona = JSON.parse(localStorage.getItem("persona_custom") || "{}");
  const role = localStorage.getItem("persona_role") || "helper";

  // 헤더 영역 동적 생성
  const header = document.createElement("div");
  header.id = "personaHeader";
  header.style.cssText = `
    position:fixed;top:10px;right:14px;display:flex;align-items:center;
    gap:10px;background:#fff4f8;border:1px solid #f1cadb;
    border-radius:14px;padding:6px 10px;z-index:1000;
    box-shadow:0 2px 5px rgba(0,0,0,0.1);
  `;

  // 이미지 기본값
  const img = document.createElement("img");
  img.src = `/avatar/images/${role}.png`;
  img.style.cssText = `
    width:42px;height:42px;border-radius:50%;border:2px solid #af2465;
  `;

  // 닉네임
  const name = document.createElement("span");
  name.textContent = user.name || "익명 사용자";
  name.style.cssText = `font-weight:600;color:#af2465;font-size:0.95rem;`;

  header.appendChild(img);
  header.appendChild(name);

  document.body.appendChild(header);

  // Supabase 최신 데이터 동기화
  const { data } = await supabase
    .from("persona_profiles")
    .select("hair,hair_color,outfit,bg_color")
    .eq("user_name", user.name)
    .eq("role", role)
    .single();

  if(data){
    document.body.style.background = data.bg_color;
    localStorage.setItem("persona_custom", JSON.stringify(data));
  }
}
