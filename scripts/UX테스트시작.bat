@echo off
title UX Flow Test System
chcp 65001 >nul 2>&1

echo ═══════════════════════════════════════
echo   🧪 UX Flow Test System
echo ═══════════════════════════════════════
echo.

set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

echo [1/2] Vite dev server 시작 (port 5173)...
set VITE_SUPABASE_URL=https://placeholder.supabase.co
set VITE_SUPABASE_ANON_KEY=placeholder
start "Vite Dev Server" cmd /c "npx vite dev --port 5173 --host 0.0.0.0"

echo [2/2] UX Test API server 시작 (port 3001)...
set PORT=3001
start "UX Test API" cmd /c "cd /d "%PROJECT_DIR%\server" && npx tsx src/server.ts"

timeout /t 4 /nobreak >nul

echo.
echo ═══════════════════════════════════════
echo   ✅ 서버 실행 중!
echo.
echo   📱 앱:       http://localhost:5173
echo   🧪 UX Test: http://localhost:5173/dev/ux-test
echo   🔧 API:      http://localhost:3001/health
echo.
echo   종료: UX테스트종료.bat 실행
echo ═══════════════════════════════════════

start http://localhost:5173/dev/ux-test

pause