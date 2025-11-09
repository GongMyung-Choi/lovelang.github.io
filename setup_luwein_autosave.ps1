# ================================
# 루웨인 트리니티 - 수퍼베이스 자동저장 설치기
# ================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " 루웨인 트리니티  Supabase Autosave Setup " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1️⃣ 경로 이동
Set-Location "E:\GitHub\lovelang.github.io"

# 2️⃣ SQL 테이블 생성
Write-Host "[1단계] memory_events 테이블 생성 중..." -ForegroundColor Yellow
$sql_create = @"
create extension if not exists pgcrypto;

create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  path text not null,
  content jsonb not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.memory_events enable row level security;
"@
npx supabase db query "$sql_create"
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ SQL 실행 실패 (Supabase 로그인 필요)" -ForegroundColor Red
  Pause
  Exit
}
Write-Host "✅ memory_events 테이블 생성 완료" -ForegroundColor Green
Write-Host ""

# 3️⃣ 정책 초기화
Write-Host "[2단계] RLS 정책 초기화 중..." -ForegroundColor Yellow
$sql_policies = @"
drop policy if exists "allow_anon_select_memory_events" on public.memory_events;
drop policy if exists "allow_anon_insert_memory_events" on public.memory_events;
"@
npx supabase db query "$sql_policies"
Write-Host "✅ 정책 초기화 완료" -ForegroundColor Green
Write-Host ""

# 4️⃣ Edge Function 배포
Write-Host "[3단계] record-memory Edge Function 배포 중..." -ForegroundColor Yellow
npx supabase functions deploy record-memory
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Edge Function 배포 실패 (Docker 확인 필요)" -ForegroundColor Red
  Pause
  Exit
}
Write-Host "✅ Edge Function 배포 완료" -ForegroundColor Green
Write-Host ""

# 5️⃣ 환경 변수 등록
Write-Host "[4단계] Supabase 환경 변수 등록..." -ForegroundColor Yellow
$SUPA_URL = Read-Host "🔗 Supabase URL (예: https://omchtafaqgkdwcrwscrp.supabase.co)"
$SUPA_ROLE = Read-Host "🔑 SERVICE_ROLE_KEY"
$SUPA_SECRET = Read-Host "🧿 루웨인 전용 SHARED_SECRET (임의의 긴 문자열)"

npx supabase secrets set SUPABASE_URL=$SUPA_URL
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$SUPA_ROLE
npx supabase secrets set SHARED_SECRET=$SUPA_SECRET

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ 시크릿 설정 실패 (입력값 확인 필요)" -ForegroundColor Red
  Pause
  Exit
}
Write-Host "✅ 시크릿 등록 완료" -ForegroundColor Green
Write-Host ""

# 6️⃣ 테스트 안내
Write-Host ('-' * 38) -ForegroundColor Cyan
Write-Host "🌿 모든 설정 완료!" -ForegroundColor Green
Write-Host "테스트하려면 아래 명령을 PowerShell에서 실행하세요:" -ForegroundColor White
Write-Host ""
Write-Host "curl -X POST -H `"Content-Type: application/json`" `"
Write-Host " -H `"x-shared-secret: $SUPA_SECRET`" `"
Write-Host " -d '{\"path\":\"test/page\",\"content\":{\"ok\":true},\"meta\":{\"note\":\"hello\"}}' `"
Write-Host " $SUPA_URL/functions/v1/record-memory"
Write-Host ""
Write-Host ('-' * 38) -ForegroundColor Cyan
Pause
