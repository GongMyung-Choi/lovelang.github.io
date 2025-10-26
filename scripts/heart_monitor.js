import { LUWEIN } from './config.js';
import { sendAlert, supabase } from './owner_ping.js';

// 페이지 로드시 자동 점검
if (Math.random()*100 < LUWEIN.PING_ON_LOAD_PERCENT) {
  (async () => {
    const findings = [];

    // A) 필수 경로/파일 존재 체크(HEAD로 대충 확인)
    for (const p of [...LUWEIN.REQUIRED_PATHS, ...LUWEIN.EXPECTED_FILES]) {
      const ok = await softHead(p);
      if (!ok) findings.push({kind:"missing", path:p});
    }

    // B) 숨틔움방 접속 시 로그인 상태/퍼스나 설정 체크
    if (isHeartPage(location.pathname)) {
      const user = safeUser();
      if (!user) findings.push({kind:"auth_missing", msg:"로그인 세션 없음"});
      const personaOk = await softHead("/breathing_room/personas/persona_config.json");
      if (!personaOk) findings.push({kind:"persona_missing", path:"/breathing_room/personas/persona_config.json"});
    }

    // C) Supabase 가용성 체크 (짧은 핑)
    try { await supabase.auth.getSession(); }
    catch { findings.push({kind:"supabase_unreachable"}); }

    // D) CNAME 접근 체크(커스텀도메인 운용 시만)
    const cnameOk = await softHead("/CNAME");
    if (!cnameOk) findings.push({kind:"cname_not_found"});

    // 보고
    if (findings.length) {
      await sendAlert("site_self_check", {findings}, "warn");
      console.debug("[LUWEIN] self-check findings:", findings);
    }
  })();
}

function isHeartPage(path) {
  return LUWEIN.HEART_PAGES.some(prefix => path.startsWith(prefix));
}

async function softHead(url) {
  try { 
    const res = await fetch(url, { method:"HEAD", mode:"no-cors" });
    // no-cors에서는 ok 판단 불가 → GET fallback
    if (!res || (res.type === "opaque")) return softGet(url);
    return res.ok;
  } catch { return softGet(url); }
}

async function softGet(url) {
  try {
    const res = await fetch(url, { method:"GET", mode:"no-cors" });
    return !!res;
  } catch { return false; }
}

function safeUser(){
  try { return JSON.parse(localStorage.getItem('luwein_user')); }
  catch { return null; }
}
