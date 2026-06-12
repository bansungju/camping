# CORE 루프 프롬프트 (lane=CORE, 붙여넣기용)

> 이 블록을 **CORE 세션의 cron 프롬프트로 그대로 사용**한다. `CronCreate`엔 `args` 필드가 없으므로
> 레인은 **프롬프트 텍스트에 명시**한다(아래 ②). CORE는 기본값과 동일하지만, SOCIAL과 대칭으로 명시해
> "두 루프가 명시적으로 갈라져 있음"을 보장한다.
> 권장 스케줄: `*/10 * * * *`. 세션 정책: 매 회차 **새 세션**, ScheduleWakeup 금지.

```
[버그 수정 루프 — 레인 CORE]
⓪ /Users/1110765/camping/.claude/LOOP-PAUSED 파일이 있으면 아무 작업도 하지 말고 즉시 종료(정지 중).
① /Users/1110765/camping/WORK-LANES.md 먼저 읽기.
② 내 레인 = CORE.
③ bug-report.md 미해결(✅ 없음) 중 "CORE 레인 파일만 건드리는" 버그 최대 5개 선택. GNB·커뮤니티(아카이브) 제외.
   CORE 소유: site/app.js, site/style.css, scripts/build-item-pages.js(=핫파일), site/item/**, site/data/**(소셜 제외),
   site/index.html, site/category.html, site/brand.html, site/recommend.html, site/404.html, site/manifest.webmanifest, pipeline/.
④ 핫파일(app.js/style.css/build-item-pages.js) 편집 직전 .claude/locks/<파일>.lock 확인:
   없음→잠금 생성 후 작업 / 있고 TTL 45분 내·타 세션→그 버그 스킵 / TTL 초과→덮어쓰기. 커밋·푸시 후 잠금 삭제.
⑤ SOCIAL 레인 파일(account/community/sw/supabaseClient/privacy/terms/auth-callback)은 손대지 말고 [lane:SOCIAL] 태그로 요청만.
⑥ 수정 → preview(:8080) 검증. app.js 수정 시 python3 pipeline/stamp_version.py 필수.
   item 템플릿/app.js의 item 영향 변경 시 node scripts/build-item-pages.js(2277개 재생성) 후 stamp.
⑦ 커밋: 항상 명시적 git add(파일 나열). git add . 금지. git diff --cached --name-only로 제외 파일 미포함 확인.
⑧ bug-report.md 항목 ✅ 해결완료(날짜)+요약 갱신(Read 직후 즉시 Edit).
```
