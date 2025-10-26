// 루웨인 전역 설정 (필수: 값 채워넣기)
export const LUWEIN = {
  SUPABASE_URL: "https://omchtafaqgkdwcrwscrp.supabase.co", // 필수
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g",             // 필수
  OWNER_EMAIL: "besoullight@gmail.com",                  // 선택(표시용)
  WEBHOOK_URL: "",                                   // 선택: 외부 웹훅(있으면 넣기)
  REQUIRED_PATHS: [
    "/assets/avatars/base/",
    "/assets/avatars/hair/",
    "/assets/avatars/outfit/",
    "/assets/avatars/accessory/",
    "/breathing_room/personas/persona_config.json"
  ],
  HEART_PAGES: ["/breathing_room/", "/breathing_room/index.html"],
  EXPECTED_FILES: [
    "/CNAME",
    "/scripts/owner_ping.js",
    "/scripts/heart_monitor.js"
  ],
  PING_ON_LOAD_PERCENT: 100 // 100=모든 페이지 로드 시 점검, 0=비활성
};
