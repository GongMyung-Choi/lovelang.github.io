import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_URL, SUPABASE_KEY } from "../assets/js/config.js";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(location.search);
const collabId = urlParams.get("id");

const chatBox = document.getElementById("chat");
const input = document.getElementById("messageInput");
const personaInput = document.getElementById("personaInput");
const sendBtn = document.getElementById("sendBtn");

async function sendMessage() {
  const msg = input.value.trim();
  const persona = personaInput.value.trim() || "익명";
  if (!msg) return;
  await supabase.from("alerts").insert({
    type: "collab_live",
    severity: "info",
    detail: { collabId, persona, msg }
  });
  input.value = "";
}

function subscribeLive() {
  supabase.channel("live_chat")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, payload => {
      const d = payload.new.detail;
      if (d?.collabId !== collabId || payload.new.type !== "collab_live") return;
      appendMessage(d.persona, d.msg);
    })
    .subscribe();
}

function appendMessage(persona, msg) {
  const el = document.createElement("div");
  el.classList.add("comment");
  el.innerHTML = `<b>${persona}</b>: ${msg}`;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadHistory() {
  const { data } = await supabase
    .from("alerts")
    .select("ts, detail")
    .eq("type", "collab_live")
    .contains("detail", { collabId })
    .order("ts", { ascending: true });
  (data || []).forEach(r => appendMessage(r.detail.persona, r.detail.msg));
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

loadHistory();
subscribeLive();
