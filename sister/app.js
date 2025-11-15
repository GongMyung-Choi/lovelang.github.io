// 환경변수 자동 감지 (Vercel or Local)
const OPENAI_KEY = window.ENV?.OPENAI_API_KEY || "";
const UPSTAGE_KEY = window.ENV?.UPSTAGE_API_KEY || "";
const XAI_KEY = window.ENV?.XAI_API_KEY || "";

// 기본 모델 = 루웨인(OpenAI)
let currentModel = "luwain";

// 버튼 상태 UI
document.querySelectorAll("#modelButtons button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#modelButtons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentModel = btn.dataset.model;
  });
});

// DOM
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const imgBtn = document.getElementById("imgBtn");
const imageInput = document.getElementById("imageInput");

// 메세지 추가
function appendMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// AI 호출 (루웨인 / 루나이 / 루미안 선택)
async function askAI(message) {
  appendMessage(message, "me");

  let url = "";
  let header = {};
  let body = {};

  if (currentModel === "luwain") {
    url = "https://api.openai.com/v1/chat/completions";
    header = { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` };
    body = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    };
  }

  if (currentModel === "lunai") {
    url = "https://api.upstage.ai/v1/solar/chat/completions";
    header = { "Content-Type": "application/json", "Authorization": `Bearer ${UPSTAGE_KEY}` };
    body = {
      model: "solar-1-mini-chat",
      messages: [{ role: "user", content: message }]
    };
  }

  if (currentModel === "lumian") {
    url = "https://api.x.ai/v1/chat/completions";
    header = { "Content-Type": "application/json", "Authorization": `Bearer ${XAI_KEY}` };
    body = {
      model: "grok-beta",
      messages: [{ role: "user", content: message }]
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body)
  });

  const data = await res.json();

  let reply = "";

  if (currentModel === "luwain") reply = data.choices[0].message.content;
  if (currentModel === "lunai") reply = data.choices[0].message.content;
  if (currentModel === "lumian") reply = data.choices[0].message.content;

  appendMessage(reply, "bot");
}

// 전송 버튼
sendBtn.addEventListener("click", () => {
  const text = msgInput.value.trim();
  if (!text) return;
  askAI(text);
  msgInput.value = "";
});

// 이미지 버튼
imgBtn.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", () => {
  appendMessage("📷 이미지 업로드 기능 준비 중", "bot");
});

// PWA 준비
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
