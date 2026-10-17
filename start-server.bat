@echo off
title BharatSeva AI - Server Launcher
color 0A
cls

echo ===================================================
echo           BharatSeva AI Server Launcher
echo ===================================================
echo.
echo Select an option:
echo   [1] Start Backend Server only (Port 5000)
echo   [2] Start Both Backend + Frontend (Full App)
echo   [3] Start Frontend only (Port 3000)
echo   [4] Free/Kill any stale process on Port 5000
echo.
set /p choice="Enter your choice (1, 2, 3, or 4) [Default: 1]: "

if "%choice%"=="" set choice=1

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_all
if "%choice%"=="3" goto start_frontend
if "%choice%"=="4" goto free_port

:free_port
cls
echo Freeing port 5000...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Host 'Port 5000 is now free!' -ForegroundColor Green } else { Write-Host 'Port 5000 was already free.' -ForegroundColor Yellow }"
pause
goto end

:start_backend
cls
echo ===================================================
echo  Checking port 5000 and starting Backend Server...
echo  API Endpoint: http://localhost:5000/api
echo ===================================================
echo.
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"
cd /d "%~dp0backend"
npm run dev
goto end

:start_all
cls
echo ===================================================
echo  Starting BharatSeva Full Stack (Backend + Frontend)
echo ===================================================
echo.
echo Ensuring port 5000 is free...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"

echo Launching Backend in a new window (Port 5000)...
start "BharatSeva Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

echo Launching Frontend in this window (Port 3000)...
timeout /t 2 /nobreak >nul
cd /d "%~dp0frontend"
npm run dev
goto end

:start_frontend
cls
echo ===================================================
echo  Starting BharatSeva Frontend Dev Server...
echo  URL: http://localhost:3000
echo ===================================================
echo.
cd /d "%~dp0frontend"
npm run dev
goto end

:end
pause
