// 퍼스나 조정실에서 값이 바뀌면 DB 업데이트 + 알림 전송
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// TODO: 너의 프로젝트 값으로 교체
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * upsertPersona
 * - name: 필수(고유 식별용)
 * - traits: {emotion, logic, empathy, creativity}
 */
export async function upsertPersona(name, traits = {}, role = null) {
  const payload = {
    name,
    role,
    emotion: traits.emotion ?? 50,
    logic: traits.logic ?? 50,
    empathy: traits.empathy ?? 50,
    creativity: traits.creativity ?? 50,
    updated_at: new Date().toISOString()
  };

  // upsert by (name)
  const { error } = await supabase
    .from("persona_profiles")
    .upsert(payload, { onConflict: "name" });

  if (error) console.error("[persona_live] upsert error:", error);
  else sendAlert("persona_update", { name, ...payload }, "info");
}

export async function sendAlert(type, detail = {}, severity = "info") {
  try {
    await supabase.from("alerts").insert({
      type, severity, detail, path: location.pathname
    });
  } catch (e) {
    console.warn("[persona_live] alert failed:", e);
  }
}
