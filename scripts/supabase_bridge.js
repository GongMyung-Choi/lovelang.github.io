<!-- 경로: /scripts/supabase_bridge.js (type="module") -->
<script type="module">
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL = window?.SUPABASE?.URL;
const KEY = window?.SUPABASE?.ANON_KEY;

if (URL && KEY) {
  const client = createClient(URL, KEY, { auth: { persistSession: false }});
  window.SUPABASE = { ...(window.SUPABASE||{}), client };
  console.log("[SUPABASE] ready");
} else {
  console.warn("[SUPABASE] config.js 누락 또는 값 없음 — 로컬 버퍼만 사용합니다.");
}
</script>
