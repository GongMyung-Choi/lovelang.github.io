// 👁️ 퍼스나 활동 감시 모듈
// 퍼스나 상태와 사용자 활동 로그를 실시간으로 기록

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { PersonaCore } from '../base/persona_core.js';

const SUPABASE_URL = "https://omchtafaqgkdwcrwscrp.supabase.co";
const SUPABASE_KEY = "공용키";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function logActivity(type, detail = {}) {
  const entry = {
    ts: new Date().toISOString(),
    type,
    severity: "info",
    detail,
    uid: localStorage.getItem("luwein_uid") || null,
  };

  try {
    await supabase.from('alerts').insert([entry]);
    console.log(`[META] Activity logged: ${type}`);
  } catch (err) {
    console.warn('[META] Failed to log activity', err);
  }
}

export function autoMonitor() {
  setInterval(() => {
    logActivity('heartbeat', { traits: PersonaCore.traits });
  }, 60000); // 1분마다 상태 체크
}
