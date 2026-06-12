# SOCIAL 루프 프롬프트 (lane=SOCIAL, 붙여넣기용)

> 이 블록을 **SOCIAL 세션의 cron 프롬프트로 그대로 사용**한다. `CronCreate`엔 `args` 필드가 없으므로
> 레인은 **프롬프트 텍스트에 명시**한다(아래 ②). 비워두면 preamble 기본값 `CORE`로 떨어져 핫파일을 노리게 되므로 반드시 명시.
> 권장 스케줄: `*/10 * * * *` (CORE와 동일 주기). 세션 정책: 매 회차 **새 세션**, ScheduleWakeup 금지.

```
[버그 수정 루프 — 레인 SOCIAL]
① /Users/1110765/camping/WORK-LANES.md 먼저 읽기.
② 내 레인 = SOCIAL  (이 프롬프트로 고정 — 기본값 CORE 아님).
③ bug-report.md 미해결(✅ 없음) 중 "SOCIAL 레인 파일만 건드리는" 버그 최대 5개 선택.
   SOCIAL 소유 파일: site/account.html, site/community.html, site/privacy.html, site/terms.html,
   site/auth-callback.html, site/supabaseClient.js, site/sw.js, Supabase 마이그레이션·소셜 데이터.
   GNB·커뮤니티(아카이브 상태)는 신규 처리 제외.
④ 핫파일(site/app.js · site/style.css · scripts/build-item-pages.js)은 CORE 단독 writer →
   SOCIAL은 절대 수정 금지. 이 파일이 필요한 버그는 손대지 말고 bug-report.md에 [lane:CORE] 태그로 요청만 남긴다.
   (반대로 CORE 레인 파일도 건드리지 않는다 — account/community/sw/supabaseClient/privacy/terms/auth-callback은 SOCIAL 전용.)
⑤ 수정 → preview 서버(.claude/launch.json "site", :8080)로 검증.
   sw.js 변경 또는 캐시 ?v= 영향 시 python3 pipeline/stamp_version.py 실행.
⑥ 커밋: 항상 명시적 git add(SOCIAL 파일만 나열). 절대 git add . / -A 금지.
   커밋 전 git diff --cached --name-only로 app.js/style.css/item/** 등 CORE 파일이 안 섞였는지 확인.
⑦ bug-report.md 해당 항목 ✅ 해결완료(날짜)+요약 갱신. (타 세션도 편집하므로 Read 직후 즉시 Edit.)
```
