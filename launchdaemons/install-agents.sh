#!/usr/bin/env bash
# Mac mini에서 직접 실행 (SSH 아님 — GOTCHA #5/#6).
# LaunchAgents 멱등 설치: 이미 등록된 label은 bootout 후 재bootstrap.
# `5: Input/output error`의 주범인 "이미 로드됨" 충돌을 정면 해결.
set -uo pipefail

UID_NUM="$(id -u)"
DOMAIN="gui/${UID_NUM}"
SRC="/Users/mimi/camping/launchdaemons"
DST="${HOME}/Library/LaunchAgents"
LABELS=(com.camping.api com.camping.caddy com.camping.cloudflared)

mkdir -p "$DST"

# cloudflared 실제 plist는 토큰을 채워서 생성되어 있어야 함 (SSOT §6).
if [[ ! -f "${SRC}/com.camping.cloudflared.plist" ]]; then
  echo "⚠️  ${SRC}/com.camping.cloudflared.plist 없음."
  echo "    먼저 토큰 채워서 생성:"
  echo "    sed 's/__CF_TUNNEL_TOKEN__/<실제토큰>/' ${SRC}/com.camping.cloudflared.plist.template > ${SRC}/com.camping.cloudflared.plist"
  echo "    cloudflared 건너뛰고 api/caddy만 진행하려면 Enter, 중단하려면 Ctrl-C"
  read -r _
  LABELS=(com.camping.api com.camping.caddy)
fi

for label in "${LABELS[@]}"; do
  echo "=== ${label} ==="
  plist="${SRC}/${label}.plist"

  # 1) 문법 검증
  if ! plutil -lint "$plist" >/dev/null; then
    echo "❌ plist 문법 오류: $plist — 건너뜀"
    plutil -lint "$plist"
    continue
  fi

  # 2) 최신 plist를 LaunchAgents로 복사
  cp "$plist" "${DST}/${label}.plist"

  # 3) 이미 등록돼 있으면 먼저 내림 (5: I/O error 방지)
  if launchctl print "${DOMAIN}/${label}" >/dev/null 2>&1; then
    echo "  이미 등록됨 → bootout"
    launchctl bootout "${DOMAIN}/${label}" 2>/dev/null
  fi

  # 4) 등록
  if launchctl bootstrap "$DOMAIN" "${DST}/${label}.plist"; then
    echo "  ✅ bootstrap OK"
    launchctl kickstart -k "${DOMAIN}/${label}" 2>/dev/null
  else
    echo "  ❌ bootstrap 실패 — print 진단:"
    launchctl print "${DOMAIN}/${label}" 2>&1 | head -30
  fi
done

echo
echo "=== 최종 상태 ==="
launchctl list | grep -i camping || echo "(camping 항목 없음)"
echo
echo "로그 확인: tail -f /tmp/camping-*.err /tmp/camping-*.log"
echo "헬스체크:  curl -s http://127.0.0.1:8000/health; echo; curl -s https://www.gear-forest.com/health"
