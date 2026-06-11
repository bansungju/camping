#!/bin/bash
# 라이브 스모크 테스트 — 앱호스팅 P0/P1 변경이 gear-forest.com에 살아있는지 + 회귀 감시.
# 사용: bash scripts/verify-live.sh  (exit 0=전부통과, 1=회귀발견)
set -u
BASE="https://gear-forest.com"
fail=0

code(){ # 라벨 URL 기대코드
  local c; c=$(curl -s -o /dev/null -w "%{http_code}" "$2")
  if [ "$c" = "$3" ]; then printf "✅ %-26s [%s]\n" "$1" "$c"
  else printf "❌ %-26s [%s≠%s]\n" "$1" "$c" "$3"; fail=1; fi
}
has(){ # 라벨 URL 있어야할문자열
  if curl -s "$2" | grep -qF "$3"; then printf "✅ %-26s\n" "$1"
  else printf "❌ %-26s (문자열 없음=회귀)\n" "$1"; fail=1; fi
}
absent(){ # 라벨 URL 없어야할문자열
  if curl -s "$2" | grep -qF "$3"; then printf "❌ %-26s (있으면 안 됨=회귀)\n" "$1"; fail=1
  else printf "✅ %-26s\n" "$1"; fi
}

echo "===== $(date '+%H:%M:%S') 라이브 스모크 ($BASE) ====="
code "홈 200"            "$BASE/"                       200
code "manifest 200"     "$BASE/manifest.webmanifest"   200
code "terms.html 200"   "$BASE/terms.html"             200
code ".nojekyll 200"    "$BASE/.nojekyll"              200
has  "terms CSAE 무관용"  "$BASE/terms.html"            "CSAE"
has  "privacy 국외이전"   "$BASE/privacy.html"          "제28조의8"
absent "privacy 카카오제거" "$BASE/privacy.html"        "카카오"
has  "app.js 쿠팡고지"    "$BASE/app.js"                "쿠팡 파트너스 활동의 일환으로, 일정액"
has  "community UGC동의"  "$BASE/community.html"        "무관용으로 삭제"
has  "account 삭제UI"     "$BASE/account.html"          "btn-delete-account"

# 로컬 생성기 가드 — 상세페이지 구매버튼(H-08)이 활성화될 때 어필리에이트 고지가 빠지지 않도록.
GEN="$(dirname "$0")/build-item-pages.js"
if [ -f "$GEN" ]; then
  if grep -qF "쿠팡 파트너스 활동의 일환" "$GEN" && grep -qF "sponsored" "$GEN"; then
    printf "✅ %-26s\n" "생성기 쿠팡고지+sponsored"
  else printf "❌ %-26s (생성기에서 고지/rel 누락=공정위 위반 재유입)\n" "생성기 쿠팡고지"; fail=1; fi
fi

if [ "$fail" = 0 ]; then echo "── 전부 통과 ✅"; else echo "── 회귀 발견 ❌ (위 ❌ 확인)"; fi
exit $fail
