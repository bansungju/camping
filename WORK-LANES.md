# 동시 세션 작업 분리 (WORK-LANES)

여러 루프/세션이 동시에 프론트를 고칠 때 **같은 파일을 동시 편집해 작업이 뒤엉키는 것**을 막는다.
세션은 서로의 실시간 컨텍스트를 못 보므로, 조율은 **이 파일 + `.claude/locks/` 잠금**으로만 한다.
모든 세션은 작업 시작 전에 이 파일을 반드시 읽는다.

## 레인(소유 영역)

### 레인 `CORE` — 코어 프론트 (핫파일 단독 소유)
- `site/app.js`, `site/style.css`, `scripts/build-item-pages.js` ← **핫파일(아래 잠금 필수)**
- `site/item/**`, `site/data/**`(소셜 데이터 제외), `site/sitemap*.xml`
- `site/index.html`, `site/category.html`, `site/brand.html`, `site/recommend.html`, `site/404.html`, `site/manifest.webmanifest`
- `pipeline/` 빌드·스탬프 스크립트(`stamp_version.py`, `export_site.py` 등)

### 레인 `SOCIAL` — 소셜·계정·PWA
- `site/account.html`, `site/community.html`, `site/privacy.html`, `site/terms.html`, `site/auth-callback.html`
- `site/supabaseClient.js`, `site/sw.js`
- Supabase 마이그레이션, 소셜 관련 데이터

> 기존 "제외 파일" 목록(account/community/sw/supabaseClient/privacy/terms/auth-callback)은 곧 SOCIAL 레인과 동일하다.

## 규칙
1. 각 세션은 시작 시 자기 레인을 정한다 — cron `args.lane`, 없으면 작업 성격으로 판단(버그수정 기본 = `CORE`).
2. **자기 레인 파일만 수정**한다. 다른 레인 파일이 필요한 버그는 손대지 말고, `bug-report.md`에 `[lane:대상]` 태그로 **요청만** 남긴다.
3. **핫파일(`app.js`/`style.css`/`build-item-pages.js`)은 `CORE` 레인 단독 writer.** `SOCIAL` 루프가 이 파일을 바꿔야 하는 피처(예: 세트확인 카드)는 **직접 수정 금지** → `bug-report.md`에 `[lane:CORE]` 항목으로 큐잉해 CORE 루프가 처리한다.

## 핫파일 잠금 프로토콜 (`.claude/locks/`)
핫파일 편집 **직전**:
1. `.claude/locks/<파일명>.lock` 확인.
   - **없음** → 잠금 생성 후 작업.
   - **있음 & `now − started_at < 45분`(TTL) & 다른 세션** → 이번 루프에서 그 작업 **스킵**(다른 버그 선택), 로그 남김.
   - **있음 & TTL 초과**(크래시 추정) → 덮어쓰고 작업.
2. 잠금 내용(JSON 한 줄): `{"session":"<id>","lane":"CORE","file":"app.js","started_at":"<ISO8601>"}`
3. **커밋·푸시 완료 후 잠금 삭제.**

`*.lock`은 `.gitignore` 대상 — 커밋 금지, 로컬 런타임 상태일 뿐.

## 루프 프롬프트 (레인을 프롬프트에 명시 — 기본값 의존 금지)

> **중요:** `CronCreate`엔 `args` 필드가 없다. 따라서 `args.lane`을 cron에 넘길 수 없고, **레인은 cron 프롬프트 텍스트에 직접 명시**해야 한다.
> 비워두면 preamble 기본값이 `CORE`라 **SOCIAL 루프도 CORE로 잡혀 핫파일(app.js/style.css)을 노린다.** 두 루프는 아래 정규 템플릿으로 명시 분리한다.
>
> - **CORE 루프** → [`.claude/loop-prompts/core-loop.md`](.claude/loop-prompts/core-loop.md) (lane=CORE 명시)
> - **SOCIAL 루프** → [`.claude/loop-prompts/social-loop.md`](.claude/loop-prompts/social-loop.md) (lane=SOCIAL 명시)
>
> cron(세션 인메모리)을 새로 만들거나 교체할 때 해당 세션에서 위 템플릿 블록을 프롬프트로 그대로 사용한다.

요약 preamble:
```
① WORK-LANES.md 읽기   ② 내 레인 = (프롬프트에 명시된 CORE | SOCIAL)
③ bug-report.md 미해결(✅ 없음) 중 "내 레인 파일만 건드리는" 버그 5개 선택. GNB·커뮤니티(아카이브) 제외.
④ 핫파일 필요 시 .claude/locks/ 확인 → 잠겨있으면 그 버그 스킵, 아니면 잠금 쓰고 작업·끝나면 해제. (SOCIAL은 핫파일 수정 자체 금지)
⑤ 레인 밖 파일이 필요한 버그는 손대지 말고 [lane:X] 태그로 bug-report.md에 요청만.
⑥ 커밋: 명시적 git add(파일 나열)·제외목록 확인·stamp_version.py·build-item-pages.js 단계 준수.
```
세션 정책(새 세션·ScheduleWakeup 금지)은 메모리 `feedback_bug_loop_session`, 운영 제약은 `frontend-fix-loop-runbook` 참고.
