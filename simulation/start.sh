#!/bin/bash
# toss-contract-app 전체 플로우 시뮬레이션
# 실행: bash simulation/start.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT=${PORT:-5173}

echo "=== toss-contract-app 플로우 시뮬레이션 ==="
echo ""

# 1. Mock 모드로 Dev server 시작 (placeholder URL로 IS_MOCK=true 유도)
echo "[1/3] Mock 모드로 dev server 시작 (port $PORT)..."
cd "$PROJECT_DIR"

VITE_SUPABASE_URL="https://placeholder.supabase.co" \
VITE_SUPABASE_ANON_KEY="placeholder" \
npx vite dev --port "$PORT" &
DEV_PID=$!

for i in $(seq 1 30); do
  if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo "   서버 준비 완료!"
    break
  fi
  sleep 1
done

# 2. 시뮬레이션 실행
echo ""
echo "[2/3] 시뮬레이션 실행..."
PORT=$PORT npx tsx simulation/run-simulation.ts || true

# 3. 정리
echo ""
echo "[3/3] 정리..."
kill $DEV_PID 2>/dev/null || true

echo ""
echo "=== 완료 ==="
echo "스크린샷: output/simulation/"
ls -la output/simulation/ 2>/dev/null || echo "  (스크린샷 없음)"
