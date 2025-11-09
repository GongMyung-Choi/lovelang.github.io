# ============================================
# 루웨인 트리니티 - Docker & Supabase Setup 자동화
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " 루웨인 트리니티 Docker 자동 설치기 " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1️⃣ 관리자 권한 확인
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "⚠️ 관리자 권한이 필요합니다. PowerShell을 관리자 권한으로 다시 실행하세요." -ForegroundColor Red
    Pause
    Exit
}

# 2️⃣ WSL2 설치 여부 확인
Write-Host "[1단계] WSL 상태 확인 중..." -ForegroundColor Yellow
$wslCheck = wsl --list --verbose 2>$null

if ($LASTEXITCODE -ne 0 -or $wslCheck -eq $null) {
    Write-Host "🧱 WSL이 설치되어 있지 않습니다. 설치를 시작합니다..." -ForegroundColor Cyan
    wsl --install
    Write-Host "✅ WSL 설치 완료. 재부팅 후 다시 실행하세요." -ForegroundColor Green
    Pause
    Exit
} else {
    Write-Host "✅ WSL2 감지됨" -ForegroundColor Green
}

# 3️⃣ Docker 설치 여부 확인
Write-Host "[2단계] Docker 설치 확인 중..." -ForegroundColor Yellow
$dockPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (-Not (Test-Path $dockPath)) {
    Write-Host "🐳 Docker Desktop 설치 파일 다운로드 중..." -ForegroundColor Cyan
    $installer = "$env:TEMP\DockerDesktopInstaller.exe"
    Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile $installer
    Write-Host "📦 설치 시작..."
    Start-Process -FilePath $installer -ArgumentList "install", "--quiet" -Wait
    Write-Host "✅ Docker 설치 완료. 재부팅 후 실행됩니다." -ForegroundColor Green
    Pause
    Exit
} else {
    Write-Host "✅ Docker Desktop 이미 설치됨" -ForegroundColor Green
}

# 4️⃣ Docker 실행 상태 확인
Write-Host "[3단계] Docker 실행 중인지 확인..." -ForegroundColor Yellow
Start-Process -FilePath $dockPath
Start-Sleep -Seconds 10

$dockerStatus = (docker info 2>$null)
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Docker 데몬이 아직 시작되지 않았습니다. 잠시 기다립니다..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

$dockerStatus = (docker info 2>$null)
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 실행 실패. 수동으로 Docker Desktop을 켜주세요." -ForegroundColor Red
    Pause
    Exit
}

Write-Host "✅ Docker 실행 중!" -ForegroundColor Green

# 5️⃣ Supabase 함수 배포
Write-Host "[4단계] record-memory 함수 배포 시작..." -ForegroundColor Yellow
cd "E:\GitHub\lovelang.github.io"
npx supabase functions deploy record-memory
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase 함수 배포 실패 (CLI 또는 경로 확인 필요)" -ForegroundColor Red
    Pause
    Exit
}
Write-Host "✅ 함수 배포 완료. 루웨인 저장 시스템 작동 준비됨." -ForegroundColor Green
Write-Host ""

Write-Host "🌿 모든 설정 완료!" -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Cyan
Write-Host " Supabase Dashboard → Edge Functions → record-memory 확인 "
Write-Host "------------------------------------" -ForegroundColor Cyan
Pause
