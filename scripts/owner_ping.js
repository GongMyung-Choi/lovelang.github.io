import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { LUWEIN } from './config.js';

const supabase = createClient(LUWEIN.SUPABASE_URL, LUWEIN.SUPABASE_ANON_KEY);

export async function sendAlert(type, detail = {}, severity = "warn") {
  // 1) Supabase alerts 테이블 기록
  try {
    await supabase.from('alerts').insert([{
      type, severity,
      detail: JSON.stringify(detail),
      path: location.pathname,
      ts: new Date().toISOString(),
      uid: getUserIdSafe()
    }]);
  } catch(e){ /* swallow */ }

  // 2) 선택: 외부 웹훅 호출 (있을 때만)
  if (LUWEIN.WEBHOOK_URL) {
    try {
      await fetch(LUWEIN.WEBHOOK_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ type, severity, detail, url: location.href, ts: Date.now() })
      });
    } catch(e){ /* swallow */ }
  }
}

function getUserIdSafe(){
  try {
    const s = JSON.parse(localStorage.getItem('luwein_user'));
    return s?.user?.id || null;
  } catch { return null; }
}

export { supabase };
