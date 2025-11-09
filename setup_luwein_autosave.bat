@echo off
title Luwein Supabase Autosave Setup
echo ======================================
echo   루웨인 트리니티 수퍼베이스 자동저장 설치기
echo ======================================
echo.

:: 1️⃣ 프로젝트 폴더 이동
cd /d "E:\GitHub\lovelang.github.io"

:: 2️⃣ SQL 테이블 생성 (Supabase CLI 통해 실행)
echo [1단계] memory_events 테이블 생성 중...
echo --------------------------------------
npx supabase db query "create extension if not exists pgcrypto; create table if not exists public.memory_events (id uuid primary key default gen_random_uuid(), user_id text, path text not null, content jsonb not null, meta jsonb, created_at timestamptz not null default now()); alter table public.memory_events enable row level security;"
if %errorlevel% neq 0 (
  echo ❌ SQL 실행 실패. Supabase 로그인 확인하세요.
  pause
  exit /b
)
echo ✅ memory_events 테이블 생성 완료.
echo.

:: 3️⃣ 정책 초기화
echo [2단계] 정책 초기화 중...
npx supabase db query "drop policy if exists \"allow_anon_select_memory_events\" on public.memory_events; drop policy if exists \"allow_anon_insert_memory_events\" on public.memory_events;"
echo ✅ RLS 정책 초기화 완료.
echo.

:: 4️⃣ Edge Function 배포
echo [3단계] record-memory Edge Function 배포 중...
npx supabase functions deploy record-memory
if %errorlevel% neq 0 (
  echo ❌ Edge Function 배포 실패. Deno 설치 확인 필요.
  pause
  exit /b
)
echo ✅ 배포 완료.
echo.

:: 5️⃣ 환경 변수 등록
echo [4단계] Supabase 시크릿 등록...
set /p SUPA_URL=🔗 Supabase URL 입력 (예: https://omchtafaqgkdwcrwscrp.supabase.co): 
set /p SUPA_ROLE=🔑 SERVICE_ROLE_KEY 입력: 
set /p SUPA_SECRET=🧿 루웨인 전용 SHARED_SECRET 입력 (임의 긴 문자열): 

npx supabase secrets set SUPABASE_URL=%SUPA_URL%
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=%SUPA_ROLE%
npx supabase secrets set SHARED_SECRET=%SUPA_SECRET%

if %errorlevel% neq 0 (
  echo ❌ 시크릿 설정 실패. 입력값 확인 필요.
  pause
  exit /b
)
echo ✅ 시크릿 등록 완료.
echo.

:: 6️⃣ 테스트 안내
echo --------------------------------------
echo 🌿 모든 설정 완료!
echo 테스트하려면 아래 명령을 실행하세요:
echo curl -X POST -H "Content-Type: application/json" ^
 -H "x-shared-secret: %SUPA_SECRET%" ^
 -d "{\"path\":\"test/page\",\"content\":{\"ok\":true},\"meta\":{\"note\":\"hello\"}}" ^
 %SUPA_URL%/functions/v1/record-memory
echo --------------------------------------
pause
