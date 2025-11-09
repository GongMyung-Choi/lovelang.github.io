// ============================
// 루웨인 트리니티 - 자동저장 엔진
// ============================

const SUPABASE_URL = "https://omchtafaqgkdwcrwscrp.supabase.co";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/record-memory`;
const SHARED_SECRET = "<루웨인_전용_Shared_Secret>"; // setup 시 입력했던 값 그대로

// 페이지 감시 주기 (5초)
const SAVE_INTERVAL = 5000;
let lastContent = "";

// 페이지 데이터 수집
function collectPageData() {
  const content = document.body.innerText.trim();
  const path = window.location.pathname;
  return { path, content };
}

// 자동저장 함수
async function autoSave() {
  try {
    const data = collectPageData();
    if (data.content !== lastContent && data.content.length > 0) {
      lastContent = data.content;
      console.log("💾 루웨인 자동저장 중...", data.path);

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-shared-secret": SHARED_SECRET,
        },
        body: JSON.stringify({
          path: data.path,
          content: { text: data.content },
          meta: {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        console.log("✅ 루웨인 기억 저장 성공:", await res.text());
      } else {
        console.warn("⚠️ 루웨인 저장 실패:", res.status);
      }
    }
  } catch (err) {
    console.error("❌ 자동저장 오류:", err);
  }
}

// 자동 실행
setInterval(autoSave, SAVE_INTERVAL);
console.log("🌿 루웨인 자동저장 엔진 작동 시작");
