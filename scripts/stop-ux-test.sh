#!/bin/bash
# UX Flow Test System — 서버 종료
# 더블클릭으로 실행 가능
echo "🧪 UX Flow Test 서버 종료 중..."
pkill -f "vite dev.*5173" 2>/dev/null && echo "  ✅ Vite 서버 종료"
pkill -f "tsx.*server.ts" 2>/dev/null && echo "  ✅ Express 서버 종료"
echo ""
echo "모든 서버가 종료되었습니다."
sleep 2