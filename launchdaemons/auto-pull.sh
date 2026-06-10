#!/usr/bin/env bash
# Mac mini 서버용 auto git pull. com.camping.autopull LaunchAgent가 5분마다 실행.
# - origin/main을 ff-only로만 당김 (서버에 로컬 커밋 생기면 멈추고 로깅 → 수동 개입)
# - 변경된 파일에 따라 해당 서비스만 재시작 (backend/→api, Caddyfile→caddy)
# - requirements.txt 변경 시 pip install 후 api 재시작
set -uo pipefail
REPO=/Users/mimi/camping
LOG=/tmp/camping-autopull.log
DOMAIN="gui/$(id -u)"
PIP="$REPO/.venv/bin/pip"

cd "$REPO" || exit 1
exec >> "$LOG" 2>&1

before=$(git rev-parse HEAD 2>/dev/null) || { echo "$(date '+%F %T') git repo 아님"; exit 0; }

if ! git fetch --quiet origin main 2>/dev/null; then
  echo "$(date '+%F %T') fetch 실패 (네트워크?) — skip"; exit 0
fi

# ff-only: 서버는 받기만 함. 로컬 분기 생겼으면 강제하지 않고 경보만.
if ! git merge --ff-only --quiet origin/main 2>/dev/null; then
  echo "$(date '+%F %T') ⚠️ ff-only 불가 (로컬 변경/분기). 수동 확인 필요: git status"; exit 0
fi

after=$(git rev-parse HEAD)
[ "$before" = "$after" ] && exit 0   # 변경 없음 → 조용히 종료

echo "$(date '+%F %T') pull ${before:0:7} → ${after:0:7}"
changed=$(git diff --name-only "$before" "$after")
echo "$changed" | sed 's/^/  changed: /'

restart_api=0
echo "$changed" | grep -q '^backend/'      && restart_api=1
echo "$changed" | grep -q '^requirements\.txt$' && {
  echo "  requirements.txt 변경 → pip install"
  "$PIP" install -q -r requirements.txt && echo "  pip OK" || echo "  ❌ pip 실패"
  restart_api=1
}
[ "$restart_api" = 1 ] && { echo "  → api 재시작"; launchctl kickstart -k "$DOMAIN/com.camping.api"; }

echo "$changed" | grep -q '^Caddyfile$' && {
  echo "  Caddyfile 변경 → caddy 재시작"; launchctl kickstart -k "$DOMAIN/com.camping.caddy";
}
