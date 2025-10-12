<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>숨틔움방 | Breathing Room</title>
<style>
:root{--accent:#af2465;}
body{
  margin:0;font-family:'Noto Sans KR',sans-serif;background:#fafafa;color:#333;
}
header{
  background:var(--accent);color:#fff;padding:16px;font-size:1.5rem;text-align:center;
}
button{
  background:var(--accent);color:#fff;border:none;border-radius:10px;
  padding:10px 14px;margin:6px;cursor:pointer;
}
</style>
</head>

<body>
<header>🌬️ 숨틔움방 <span id="persona-role" style="font-size:.9rem;opacity:.9"></span></header>

<main style="text-align:center;padding:30px;">
  <p>오늘의 기분을 나누거나, 가벼운 대화를 시작해보세요.</p>
  <button onclick="location.href='/chat/index.html'">수다방으로 가기</button>
</main>

<script type="module">
import { applyPersonaTheme } from "/assets/js/persona_load.js";
applyPersonaTheme();
</script>
</body>
</html>
// 🧠 persona_mode.js
export function detectPersona(){
  const role = localStorage.getItem("persona_role");
  if(!role) return "none";
  return role;
}

export function autoRedirectVault(){
  const role = detectPersona();
  if(role==="helper") location.href="/persona/helper_vault.html";
  else if(role==="creator") location.href="/persona/creator_vault.html";
  else if(role==="research") location.href="/persona/research_vault.html";
}
