@echo off
title BharatSeva AI Backend Server
color 0B
cls

echo ===================================================
echo     Starting BharatSeva AI Backend Server
echo     Directory: %~dp0
echo     Port: 5000 | Health: http://localhost:5000/api/health
echo ===================================================
echo.

echo Ensuring port 5000 is available...
powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($c) { $c | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"

cd /d "%~dp0"
npm run dev
pause
