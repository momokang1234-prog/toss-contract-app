@echo off
title UX Flow Test System - 종료
chcp 65001 >nul 2>&1

echo 🧪 UX Flow Test 서버 종료 중...
taskkill /fi "WINDOWTITLE eq Vite Dev Server*" /f >nul 2>&1 && echo   ✅ Vite 서버 종료
taskkill /fi "WINDOWTITLE eq UX Test API*" /f >nul 2>&1 && echo   ✅ Express 서버 종료
echo.
echo 모든 서버가 종료되었습니다.
timeout /t 2 /nobreak >nul