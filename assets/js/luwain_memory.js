(async () => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, FUNCTION_URL } = window.LuwainConfig;

  // 사용자 세션 ID (브라우저마다 고유하게)
  const userKey = localStorage.getItem("luwain_user_id") || crypto.randomUUID();
  localStorage.setItem("luwain_user_id", userKey);

  // 자동 저장 함수
  async function recordMemory(path, content, meta = {}) {
    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content, meta })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`📀 저장 완료: ${path}`);
    } catch (e) {
      console.error("❌ 자동저장 오류:", e);
    }
  }

  // 🔄 자동 감지 루틴
  const memoryQueue = [];
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      memoryQueue.push({
        path: location.pathname,
        content: { change: m.target.textContent.slice(0, 200) },
        meta: { note: "DOM 변화 감지" }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  // 🔁 주기적 저장
  setInterval(() => {
    if (memoryQueue.length > 0) {
      const batch = [...memoryQueue.splice(0, memoryQueue.length)];
      recordMemory('auto/dom', batch, { user: userKey });
    }
  }, 60000); // 1분마다 저장

  // 최초 접속 기록
  recordMemory('user/session_start', { userKey, url: location.href }, { agent: navigator.userAgent });
})();
