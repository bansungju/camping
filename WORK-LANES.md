# 동시 세션 작업 분리 (WORK-LANES)

여러 루프/세션이 동시에 프론트를 고칠 때 **같은 파일을 동시 편집해 작업이 뒤엉키는 것**을 막는다.
세션은 서로의 실시간 컨텍스트를 못 보므로, 조율은 **이 파일 + `.claude/locks/` 잠금**으로만 한다.
모든 세션은 작업 시작 전에 이 파일을 반드시 읽는다.

## 레인(소유 영역)

### 레인 `CORE` — 코어 프론트 (핫파일 단독 소유)
- `site/app.js`, `site/style.css`, `scripts/build-item-pages.js` ← **핫파일(아래 잠금 필수)**
- `site/item/**`, `site/sitemap*.xml`
- `site/index.html`, `site/category.html`, `site/brand.html`, `site/recommend.html`, `site/404.html`, `site/manifest.webmanifest`

### 레인 `DATA` — 데이터/파이프라인 (재생성은 파이프라인 실행 세션 단독)
- `site/data/*.json`(카테고리 데이터·`search.json`·`manifest.json`), `pipeline/*.py`(`run_all.py`·`export_site.py`·`normalize_models.py`·`stamp_version.py`·`check_export.py`), `.github/workflows/`, `LIMITS.md`
- **`search.json`·`manifest.json`은 파이프라인 산출물** — CORE 버그수정 세션은 **독립적으로 재생성 금지**. 검색 인덱스가 라이브 카테고리와 어긋나도(예: backpacking-bag) 직접 search.json만 만들지 말고, 파이프라인 실행 세션에 맡기거나 manifest와 **반드시 정합** 맞춰 커밋. (단 `stamp_version.py`는 어느 세션이든 빌드 직후 실행 OK — ?v= 갱신용)

### 레인 `SOCIAL` — 소셜·계정·PWA
- `site/account.html`, `site/community.html`, `site/privacy.html`, `site/terms.html`, `site/auth-callback.html`
- `site/supabaseClient.js`, `site/sw.js`
- Supabase 마이그레이션, 소셜 관련 데이터

> 기존 "제외 파일" 목록(account/community/sw/supabaseClient/privacy/terms/auth-callback)은 곧 SOCIAL 레인과 동일하다.

## 백엔드 파이프라인 버그 — 파일별 세션 묶음 (DATA 레인 하위, `[lane:BACKEND]`)

`pipeline/*.py` 백엔드 버그는 모두 DATA 레인이다. 단, **같은 `.py` 파일을 두 세션이 동시에 고치면 충돌**하므로,
세션 경계는 **파일 단위**로 묶는다(성격은 분류 라벨, 세션 경계는 파일). **한 세션 = 한 묶음**으로 처리한다.
파일이 서로 다른 묶음끼리는 병렬 진행 가능. 묶음 점유 시 `.claude/locks/<파일명>.lock` 관례 동일 적용.

| 세션 | 파일 | 묶음 항목 | 상태 |
|---|---|---|---|
| **B1** | `graph_pipeline.py` | H-93·H-82·L-258(연동)·H-91·H-94 | ✅ 2026-06-13 완료 (commit) |
| **B2** | `graph_full.py` | H-48·H-68·H-86 | ✅ 2026-06-13 완료. M-324는 보류(대상 5111→6037 확대+`_fill`의 `or FILL` 폴백 상호작용으로 비텐트 부적절 fetch 위험 → 별도 처리) |
| **B3** | `resolve_duplicates.py` | H-46·H-74 | ✅ 2026-06-13 완료 (현재 중복그룹 0건이라 합성DB로 검증) |
| **B4** | `run_all.py` | H-61·H-62 | ✅ 2026-06-13 완료 |
| **B5** | `normalize.py` | H-89·H-90 | ✅ 2026-06-13 완료 |
| **B6** | `fill_whitelist_specs.py` | H-96 (H-47은 완료) | ✅ 2026-06-13 완료 |
| **B7** | `crosssource.py` | H-76 (H-53·H-54는 완료) | ✅ 2026-06-13 완료 |
| **B8** | `detect_price_drops.py` | H-66 | ✅ 2026-06-13 완료 |
| **B9** | `column_fixes.py` | H-71 | ✅ 2026-06-13 완료 |
| **B10** | `.github/workflows/pages.yml` | H-73 | ✅ 2026-06-13 완료 |
| **B11** | `promote_catalog.py` | H-77 | ✅ 2026-06-13 완료 (NEED_CAPACITY 명시화; capacity 게이트는 정규 정책상 유지) |
| **B12** | `harvest_tents.py` | H-79 | ✅ 2026-06-13 완료 |
| **B13** | `normalize_models.py` | H-83 (+M-329 함께 해소) | ✅ 2026-06-13 완료 |
| **B14** | `backfill_capacity.py` | H-84 | ✅ 2026-06-13 완료 (감사로그가 cap_from_name 'Np=조각수' 오탐 노출 → 후속과제) |

> 이미 완료(별도 커밋): H-44·H-45(add_value_star/enrich)·H-47(fill_whitelist SQLi)·H-52(export JOIN)·H-53·H-54(crosssource)·H-55(scan_secrets)·H-57(danawa)·H-58(enrich fn).
> **의존성:** B1의 `enrich_details(H-58)` 가드 패턴이 B1 H-91에 미러링됨. B11(promote_catalog)은 B1 source_id 수정 이후 검증 권장.

### 백엔드 Medium/Low 139건 — 파일별 묶음 (C-시리즈, DATA 레인)

요청된 백엔드 M/L 139건을 파일 단위로 묶음. **한 세션=한 파일.** 파일 다르면 병렬 가능.
> ⚠ `site/app.js`·`site/supabaseClient.js` 항목은 실제 프론트 파일(CORE/SOCIAL 레인) — DATA 세션에서 직접 수정 금지, `[lane:CORE/SOCIAL]`로 큐잉. ('body vs content' M-145/154/172는 Supabase 마이그레이션+app.js 양쪽.)

| 세션 | 파일 | 묶음 항목 | 상태 |
|---|---|---|---|
| **C1** | `validate_ranges.py` | M-236·M-265·M-323·M-328·M-330·M-343·L-256·L-257 (M-341 무효) | ✅ 2026-06-13. M-341은 현재 NOT EXISTS 가드로 대체돼 무효(되돌리면 무한증식 회귀). bug-report 마킹은 동시세션 레이스로 보류 |
| **C2** | `value_metric.py` | M-166·M-167·M-168·M-270·M-289·M-350·L-205·L-266 | ⬜ |
| **C3** | `export_site.py` | M-200·M-231·M-242·M-279·M-309·M-310·M-331·M-349 | ⬜ |
| **C4** | `normalize.py` | M-192·M-276·M-288·M-319·M-339·L-238·L-263 | ⬜ |
| **C5** | `build_backpacking_bag.py` | M-195·M-196·M-223·M-224·M-320·M-321 | ⬜ |
| **C6** | `resolve_duplicates.py` | M-230·M-266·M-308·L-189·L-220 | ⬜ |
| **C7** | `graph_full.py` | M-184·M-235·M-269·M-324·L-270 | ⬜ |
| **C8** | `verify_internal.py` | M-241·M-271·M-295·L-195·L-265 | ⬜ |
| **C9** | `fill_whitelist_specs.py` | M-177·M-216·M-332·L-223 | ⬜ |
| **C10** | `graph_pipeline.py` | M-185·M-255·M-268·L-258 | ⬜ |
| **C11** | `crosssource.py` | M-201·M-282·M-348·L-253 | ⬜ |
| **C12** | `promote_catalog.py` | M-210·M-277·M-311·M-335 | ⬜ |
| **C13** | `normalize_models.py` | M-249·M-263·M-264 | ⬜ |
| **C14** | `affiliate_links.py` | M-287·M-315·L-188 | ⬜ |
| **C15** | `star_catalog.py` | M-169·M-260·L-235 | ⬜ |
| **C16** | `brand_filter.py` | M-178·M-333·L-232 | ⬜ |
| **C17** | `multicat.py` | M-183·M-256·M-290 | ⬜ |
| **C18** | `add_manual_models.py` | M-197·M-225·M-280 | ⬜ |
| **C19** | `enrich_details.py` | M-215·M-250·M-322 | ⬜ |
| **C20** | `check_export.py` | M-222·M-294·L-231 | ⬜ |
| **C21** | `stamp_version.py` | M-248·M-296·L-213 | ⬜ |
| **C22** | `harvest_tents.py` | M-254·M-275·L-241 | ⬜ |
| **C23** | `seed_coupang.py` | L-193·L-215·L-239 | ⬜ |
| **C24** | `limits_map.py` | L-212·L-251·L-252 | ⬜ |
| **C25** | `backfill_capacity.py` | M-176·L-227 | ⬜ |
| **C26** | `column_fixes.py` | M-179·M-281 | ⬜ |
| **C27** | `collect_images.py` | M-217·L-192 | ⬜ |
| **C28** | `reclassify_other_tent.py` | M-234·L-196 | ⬜ |
| **C29** | `refresh.py` | M-206·M-207 | ⬜ |
| **C30** | `danawa.py` | L-210·L-244 | ⬜ |
| **C31** | `run_all.py` | M-229·L-219 | ⬜ |
| **C32** | `detect_price_drops.py` | M-251·M-334 | ⬜ |
| **C33** | `ocr_specs.py` | M-299·M-300 | ⬜ |
| **C34** | `make_logo.py` | L-199·L-200 | ⬜ |
| **C35** | `pipeline.py` | M-205 | ⬜ |
| **C36** | `add_value_star.py` | M-252 | ⬜ |
| **C37** | `scan_secrets.py` | M-314 | ⬜ |
| **C38** | `download_images.py` | L-191 | ⬜ |
| **C-FE** | `site/app.js`·`supabaseClient.js` | L-160·M-145·M-154·M-170·M-171·M-172·M-188·M-189·L-190 | ⬜ **CORE/SOCIAL 레인** (DATA 세션 제외, 큐잉) |

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

## 커밋 위생 (필수 — 양 세션 모두)
⚠️ **반드시 `git commit -m "..." -- <파일1> <파일2> …` (pathspec)로 내 파일만 커밋한다. bare `git commit` 금지.**
- **이유:** `git`의 인덱스(staging)는 **두 세션이 공유**한다. 한 세션이 `git add`로 파일을 staged 상태로 두면, 다른 세션의 bare `git commit`이 **그 파일까지 전부 커밋**한다. (2026-06-12 bare commit이 동시세션 staged 2,875개 파일을 통째로 쓸어담아 manifest↔search.json 불일치를 유발한 사고.)
- `git add`도 명시적 파일만(`.`/`-A` 금지). 커밋 후 `git show --name-only HEAD`로 **내가 의도한 파일만** 들어갔는지 확인.
- pathspec 커밋은 다른 세션의 staged 파일을 건드리지 않는다(인덱스에 그대로 남김) — 안전.
- 제외 레인 파일(SOCIAL: account/community/sw/supabaseClient/privacy/terms/auth-callback, DATA: 독립 재생성한 search.json/manifest)이 섞이지 않았는지 확인.
- **기계적 백스톱:** `.git/hooks/pre-commit`이 코어코드(app.js/style.css)+CI/데이터-파이프라인 파일이 한 커밋에 섞이면 **차단**한다(쓸어담기 시그니처). 재클론 시 `cp pipeline/hooks/pre-commit .git/hooks/ && chmod +x .git/hooks/pre-commit`로 재설치. 의도된 교차레인 커밋이면 `ALLOW_CROSS_LANE=1 git commit …`.
- **핫파일 락 강제(2026-06-13 추가):** 같은 훅이 핫파일(app.js/style.css/build-item-pages.js) 커밋 시 **신선한(<45분) 락을 내 세션이 소유**하는지 검사한다. 락 없음/타 세션 소유/만료면 **차단**. 워크플로: `echo '{"session":"<SID>","lane":"CORE","file":"app.js"}' > .claude/locks/app.js.lock` → `LANE_SESSION=<SID> git commit … -- site/app.js` → 커밋 후 락 삭제. 순수 stamp_version/build-item-pages 산출만이면 `ALLOW_NO_LOCK=1`로 우회. (commit만 게이트 — working-tree 동시 편집 자체는 못 막으므로 락 관례는 여전히 필요.)

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
⑤ 레인 밖 파일이 필요한 버그는 손대지 말고 [lane:X] 태그로 bug-report.md에 요청만. (search.json/manifest 독립 재생성 금지 — DATA 레인)
⑥ 커밋: **`git commit -m "..." -- <내 파일들>` (pathspec 필수, bare commit 금지)**·제외목록 확인·stamp_version.py·build-item-pages.js 단계 준수. 커밋 후 `git show --name-only`로 검증.
```
세션 정책(새 세션·ScheduleWakeup 금지)은 메모리 `feedback_bug_loop_session`, 운영 제약은 `frontend-fix-loop-runbook` 참고.
