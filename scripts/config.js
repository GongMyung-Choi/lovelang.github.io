// /scripts/config.js
// 루웨인 메모리 공용 설정 + Supabase 연결(선택)

export const MEMORY_SETTINGS = {
  ACTIVE_DAYS: 30,    // 30일 이내: 활성
  HOLD_DAYS: 90,      // 30~90일: 보류/쿨다운
  TABLE_NAME: "memories",          // Supabase 테이블명(선택)
  ARCHIVE_TABLE_NAME: "memories_archive", // Supabase 아카이브 테이블명(선택)
  LOCAL_ACTIVE_KEY: "luwain_memory_active",   // 로컬 활성 저장 키
  LOCAL_ARCHIVE_KEY: "luwain_memory_archive", // 로컬 아카이브 저장 키
};

// ↓ 필요 시 값 채우기 (비워두면 로컬 모드로만 동작)
export const SUPABASE_CONFIG = {
  url: "",      // 예: "https://omchtafaqgkdwcrwscrp.supabase.co"
  anonKey: "",  // 예: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2h0YWZhcWdrZHdjcndzY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODIyNjMsImV4cCI6MjA3NDQ1ODI2M30.vGV6Gfgi1V8agiwL03ho2R7BAwv4CrTp6-RGH0S3-4g"
};

// Supabase 클라이언트 획득(설정 없거나 CDN 미로딩이면 null 반환)
export function getSupabaseClient() {
  const hasKeys = SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;
  const hasCDN = typeof window !== "undefined" && window.supabase && window.supabase.createClient;
  if (!hasKeys || !hasCDN) return null;
  return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}
