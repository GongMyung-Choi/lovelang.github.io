# ============================================
# Luwein Trinity - Docker & Supabase Setup
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Luwein Trinity  Docker Auto Installer " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1️⃣ Check admin rights
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "⚠️  Please run PowerShell as Administrator." -ForegroundColor Red
    Pause
    Exit
}

# 2️⃣ Check WSL
Write-Host "[Step 1] Checking WSL status..." -ForegroundColor Yellow
$wslCheck = wsl --list --verbose 2>$null
if ($LASTEXITCODE -ne 0 -or $wslCheck -eq $null) {
    Write-Host "Installing WSL..." -ForegroundColor Cyan
    wsl --install
    Write-Host "✅  WSL installed. Reboot required." -ForegroundColor Green
    Pause
    Exit
} else {
    Write-Host "✅  WSL2 detected" -ForegroundColor Green
}

# 3️⃣ Check Docker
Write-Host "[Step 2] Checking Docker installation..." -ForegroundColor Yellow
$dockPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (-Not (Test-Path $dockPath)) {
    Write-Host "🐳  Downloading Docker Desktop..." -ForegroundColor Cyan
    $installer = "$env:TEMP\DockerDesktopInstaller.exe"
    Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile $installer
    Write-Host "Installing Docker Desktop..."
    Start-Process -FilePath $installer -ArgumentList "install", "--quiet" -Wait
    Write-Host "✅  Docker installed. Please reboot." -ForegroundColor Green
    Pause
    Exit
} else {
    Write-Host "✅  Docker Desktop found" -ForegroundColor Green
}

# 4️⃣ Start Docker
Write-Host "[Step 3] Starting Docker..." -ForegroundColor Yellow
Start-Process -FilePath $dockPath
Start-Sleep -Seconds 10

$dockerStatus = (docker info 2>$null)
if ($LASTEXITCODE -ne 0) {
    Write-Host "Waiting for Docker to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

$dockerStatus = (docker info 2>$null)
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌  Docker still not running. Please start Docker Desktop manually." -ForegroundColor Red
    Pause
    Exit
}
Write-Host "✅  Docker is running!" -ForegroundColor Green

# 5️⃣ Deploy Supabase function
Write-Host "[Step 4] Deploying Supabase function..." -ForegroundColor Yellow
cd "E:\GitHub\lovelang.github.io"
npx supabase functions deploy record-memory
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌  Supabase deploy failed. Check CLI or path." -ForegroundColor Red
    Pause
    Exit
}
Write-Host "✅  Deployment complete." -ForegroundColor Green
Write-Host "All setup finished."
Pause
