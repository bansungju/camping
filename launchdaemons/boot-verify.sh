#!/usr/bin/env bash
# 재부팅 후 자동복구 검증 one-shot. com.camping.bootverify LaunchAgent가 부팅 시 실행.
# 결과를 /tmp/camping-boot-verify.log에 남기고, 자기 자신을 bootout + plist 삭제.
LOG=/tmp/camping-boot-verify.log
sleep 45   # launchd가 api/caddy/cloudflared 기동할 시간 확보
{
  echo "===================================================="
  echo "boot verify @ $(date)"
  echo "uptime: $(uptime)"
  echo "--- launchctl camping (3줄이어야 정상) ---"
  launchctl list | grep -i camping || echo "(camping 에이전트 없음 — 자동기동 실패!)"
  echo "--- 헬스체크 ---"
  echo -n "API    (127.0.0.1:8000): "; curl -s --max-time 8  http://127.0.0.1:8000/health  || echo "❌ 응답없음"; echo
  echo -n "Caddy  (127.0.0.1:8080): "; curl -s --max-time 8  http://127.0.0.1:8080/health  || echo "❌ 응답없음"; echo
  echo -n "Public (gear-forest):    "; curl -s --max-time 12 https://www.gear-forest.com/health || echo "❌ 응답없음"; echo
  echo "===================================================="
} >> "$LOG" 2>&1
# self-cleanup 없음: RunAtLoad는 bootstrap 즉시에도 실행되므로, 자기삭제하면
# 재부팅 전에 사라짐. 재부팅까지 생존시키고 검증 후 수동 제거:
#   launchctl bootout gui/$(id -u)/com.camping.bootverify
#   rm ~/Library/LaunchAgents/com.camping.bootverify.plist
# (uptime으로 재부팅 전/후 로그 구분 가능)
