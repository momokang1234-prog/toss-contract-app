#!/bin/bash
# UX Flow Test System — 개발 서버 시작
# 더블클릭으로 실행 가능 (chmod +x 필요)
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
UX_PORT=${UX_PORT:-3001}
VITE_PORT=${VITE_PORT:-5173}

echo "═══════════════════════════════════════"
echo "  🧪 UX Flow Test System"
echo "═══════════════════════════════════════"
echo ""

# 1. Vite dev server
echo "[1/2] Vite dev server 시작 (port $VITE_PORT)..."
cd "$PROJECT_DIR"
VITE_SUPABASE_URL="https://placeholder.supabase.co" \
VITE_SUPABASE_ANON_KEY="placeholder" \
npx vite dev --port "$VITE_PORT" --host 0.0.0.0 &
VITE_PID=$!

# 2. Express backend
echo "[2/2] UX Test API server 시작 (port $UX_PORT)..."
cd "$PROJECT_DIR/server"
PORT=$UX_PORT npx tsx src/server.ts &
UX_PID=$!

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ 서버 실행 중!"
echo ""
echo "  📱 앱:       http://localhost:$VITE_PORT"
echo "  🧪 UX Test: http://localhost:$VITE_PORT/dev/ux-test"
echo "  🔧 API:      http://localhost:$UX_PORT/health"
echo ""
echo "  종료: Ctrl+C"
echo "═══════════════════════════════════════"

# 브라우저 자동 열기 (가능하면)
( command -v xdg-open > /dev/null 2>&1 && xdg-open "http://localhost:$VITE_PORT/dev/ux-test" ) || \
( command -v open > /dev/null 2>&1 && open "http://localhost:$VITE_PORT/dev/ux-test" ) || true

trap "echo ''; echo '서버 종료 중...'; kill $VITE_PID $UX_PID 2>/dev/null; wait $VITE_PID $UX_PID 2>/dev/null; echo '완료.'; exit 0" INT TERM

wait