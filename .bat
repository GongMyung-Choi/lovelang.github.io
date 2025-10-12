@echo off
title [LUWEIN ALL-IN-ONE AUTO DEPLOY SYSTEM]
color 0B

REM ==========================================
REM 💫 루웨인 올인원 자동배포 시스템
REM [작동순서]
REM 1. GitHub 업로드
REM 2. Supabase 백업
REM 3. 로그 기록
REM 4. 관리자 페이지 갱신
REM ==========================================

cd /d "E:\GitHub\lovelang.github.io"

:: 경로 세팅
set BACKUP_DIR=E:\GitHub\lovelang.github.io\backup
set LOG_DIR=E:\GitHub\lovelang.github.io\logs
set ADMIN_LOG_PAGE=E:\GitHub\lovelang.github.io\admin\deploy_log.html
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

set LOG_FILE=%LOG_DIR%\deploy_log.txt
set BACKUP_FILE=%BACKUP_DIR%\supabase_backup_%date:~0,4%-%date:~5,2%-%date:~8,2%.csv

:: Supabase 정보
set SUPABASE_URL=https://omcthafaagkdkwcrwscrp.supabase.co
set SUPABASE_KEY=복사한_service_role_key

echo. >> "%LOG_FILE%"
echo =============================== >> "%LOG_FILE%"
echo [시작] %date% %time% >> "%LOG_FILE%"

:: -------------------------------
:: 1️⃣ GitHub 자동 업로드
:: -------------------------------
echo.
echo 🚀 [1] GitHub 업로드 시작
git add . >> "%LOG_FILE%" 2>&1
git commit -m "auto deploy %date% %time%" >> "%LOG_FILE%" 2>&1
git push origin main >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo ❌ GitHub 업로드 실패 >> "%LOG_FILE%"
    goto BACKUP
) else (
    echo ✅ GitHub 업로드 성공 >> "%LOG_FILE%"
)

timeout /t 10 /nobreak >nul

:: -------------------------------
:: 2️⃣ Supabase 백업
:: -------------------------------
:BACKUP
echo.
echo 💾 [2] Supabase 백업 중...
curl -s "%SUPABASE_URL%/rest/v1/todos2?select=*" ^
  -H "apikey: %SUPABASE_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_KEY%" ^
  -H "Accept: text/csv" ^
  -o "%BACKUP_FILE%" >> "%LOG_FILE%" 2>&1

if exist "%BACKUP_FILE%" (
    echo ✅ Supabase 백업 완료: %BACKUP_FILE% >> "%LOG_FILE%"
) else (
    echo ❌ Supabase 백업 실패 >> "%LOG_FILE%"
)

:: -------------------------------
:: 3️⃣ 관리자 페이지 자동 갱신
:: -------------------------------
echo.
echo 🧩 [3] 관리자 페이지 업데이트...
(
echo ^<html^>
echo ^<head^><meta charset="utf-8" /^><title^>루웨인 자동배포 로그^</title^>^</head^>
echo ^<body style="font-family:monospace; background:#0b0b0b; color:#0aff0a;"^>
echo ^<h2^>루웨인 자동배포 로그 (최신기록)^</h2^>
echo ^<pre^>
type "%LOG_FILE%"
echo ^</pre^>
echo ^</body^>^</html^>
) > "%ADMIN_LOG_PAGE%"

echo ✅ 관리자 로그 페이지 갱신 완료 >> "%LOG_FILE%"

:: -------------------------------
:: 4️⃣ 마무리
:: -------------------------------
echo [종료] %date% %time% >> "%LOG_FILE%"
echo =============================== >> "%LOG_FILE%"
echo.
echo ==========================================
echo ✅ 루웨인 올인원 자동배포 완료!
echo 🔗 https://lovelang.github.io/admin/deploy_log.html
echo ==========================================
pause
exit
