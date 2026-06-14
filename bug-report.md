# 장비의 숲 버그 리포트

> 자동 생성 · 매 10분 순회  
> 마지막 업데이트: 2026-06-14 (L-bundle 연속처리)

## 현황 요약 (2026-06-14 기준)

| 상태 | 건수 | 비고 |
|---|---|---|
| ✅ 해결완료 | 935 | 수정 + 기해결확인 + 검토·현행유지 포함 |
| ⏸ 보류 | 12 | 멀티탭(M-496·527)·아카이브(커뮤니티/비교)·재현필요 — 전부 사유 명시 |
| ⬜ 미처리 | 153 | **전원 L(저위험)** — 별도 세션 예정 |

> **고위험(H)·중위험(M) 미처리 0건.** 2026-06-14 세션: DP 파이프라인 스윕 + P0(H 21) + P1(M 40) + SYNC(H-143/146) + H-136 CI 가드 + 데이터 회귀군 검토 완료.
> **✅ 2026-06-14 수동 SQL 전량 적용(사용자):** 006(gear_sets)·024_gear_sets_type(H-143/146)·023(reports unique)·024_price_alert_log(B-1)·012(push_subscriptions)·025(push_native_tokens) 대시보드 RUN 완료. APPLY-NOW.sql(008/013/015/022)는 2026-06-11 기적용. → 수동 운영 SQL 잔여 0건.
> 각 ✅ 항목 헤더에 수정/확인 요약 1줄 동봉. 마킹 규칙: ✅ 해결완료 · ✅ 검토완료·현행유지(변경 시 회귀) · ⏸ 보류(사유).

---

## 탐색 현황

| 회차 | 영역 | 탐색일시 | 발견 건수 |
|------|------|----------|-----------|
| 1 | 홈/메인 | 2026-06-11 | 5건 |
| 2 | 카테고리/목록 | 2026-06-11 | 7건 |
| 3 | 상품 상세 | 2026-06-11 | 9건 |
| 4 | 검색 | 2026-06-11 | 3건 (중복 2건 제외) |
| 5 | 계정/로그인 | 2026-06-11 | 6건 (중복 1건 제외) |
| 6 | 커뮤니티/소셜 | 2026-06-11 | 5건 (중복 1건 제외) |
| 7 | 홈/메인 (2순환) | 2026-06-11 | 9건 |
| 8 | 카테고리/목록 (2순환) | 2026-06-11 | 6건 |
| 9 | 상품 상세 (2순환) | 2026-06-11 | 6건 (중복 1건 제외) |
| 10 | 검색 (2순환) | 2026-06-11 | 7건 |
| 11 | 계정/로그인 (2순환) | 2026-06-11 | 7건 |
| + | 사용자 직접 제보 | 2026-06-11 | 4건 |
| 12 | 커뮤니티/소셜 (2순환) | 2026-06-11 | 5건 |
| 13 | 홈/메인 (3순환) | 2026-06-11 | 5건 (중복 3건 제외) |
| 14 | 카테고리/목록 (3순환) | 2026-06-11 | 3건 (중복 2건 제외) |
| 15 | 상품 상세 (3순환) | 2026-06-11 | 5건 (중복 1건 보완) |
| 16 | 검색 (3순환) | 2026-06-11 | 3건 (중복 1건 보완) |
| 17 | 계정/로그인 (3순환) | 2026-06-11 | 1건 (코드버그 2건 즉시수정, 중복 1건) |
| 18 | 커뮤니티/소셜 (3순환) | 2026-06-11 | 4건 (중복 2건 제외) |
| 19 | 홈/메인 (4순환) | 2026-06-11 | 2건 (중복·저영향 제외, L-27 보완) |
| + | 컴플라이언스 감사 | 2026-06-11 | 5건 (H-23~H-27, L-19 승격 포함) |
| 20 | 카테고리/목록 (4순환) | 2026-06-11 | 3건 (중복 2건 제외) |
| 21 | 상품상세 (4순환) | 2026-06-11 | 5건 (중복 2건 제외) |
| 22 | 검색 (4순환) | 2026-06-11 | 3건 (Low 3건 중복·파생 제외) |
| 23 | 계정/로그인 (4순환) | 2026-06-11 | 2건 (Low 3건 별도 기록) |
| 24 | 커뮤니티/소셜 (4순환) | 2026-06-11 | 4건 (Low 2건 제외) |
| 25 | 홈/메인 (5순환) | 2026-06-11 | 3건 (중복·낮은영향 제외) |
| 26 | 카테고리/목록 (5순환) | 2026-06-11 | 2건 (Low 2건 제외) |
| 27 | 상품상세 (5순환) | 2026-06-11 | 2건 (Low 3건 제외) |
| 28 | 검색 (5순환) | 2026-06-11 | 2건 (Low 4건 제외) |
| 29 | 계정/로그인 (5순환) | 2026-06-11 | 2건 (Medium 1건·Low 2건 별도) |
| 30 | 커뮤니티/소셜 (5순환) | 2026-06-11 | 4건 (Low 1건 종속 제외) |
| 31 | 홈/메인 (6순환) | 2026-06-11 | 4건 |
| + | 사용자 직접 제보 | 2026-06-11 | 1건 |
| 32 | 카테고리/목록 (6순환) | 2026-06-11 | 1건 (사용자 제보 포함, 추가 탐색 병행) |
| 33 | 상품상세 (6순환) | 2026-06-11 | 3건 (H-01 중복 제외) |
| 34 | 검색 (6순환) | 2026-06-11 | 4건 (M-25 근접 중복 제외) |
| 35 | 계정/로그인 (6순환) | 2026-06-11 | 5건 (M-52·L-39 중복·설계의도 제외) |
| 36 | 커뮤니티/소셜 (6순환) | 2026-06-11 | 1건 (M-10/M-13/L-10/L-11 중복 제외) |
| 37 | 홈/메인 (7순환) | 2026-06-11 | 4건 (L-14 중복·인프라·설계 제외) |
| 38 | 카테고리/목록 (7순환) | 2026-06-11 | 3건 + M-68 보완 (H-01·M-69 중복 제외) |
| 39 | 상품상세 (7순환) | 2026-06-11 | 8건 (중복 제외) |
| 40 | 검색 (7순환) | 2026-06-11 | 6건 (L-31 재확인, M-25 해소 확인) |
| 41 | 계정/로그인 (7순환) | 2026-06-11 | 6건 (H-23·L-39 중복 제외) |
| 42 | 커뮤니티/소셜 (7순환) | 2026-06-11 | 4건 (L-32·L-10 중복 제외, H-35 엣지케이스 재현) |
| 43 | 홈/메인 (8순환) | 2026-06-11 | 3건 (H-01 해소 확인, 기존 L-01·L-02·L-27·L-34·L-40·L-41·L-50 재확인·중복 제외) |
| 44 | 카테고리/목록 (8순환) | 2026-06-11 | 5건 + M-68 보완 (M-08·L-35 재확인) |
| 45 | 상품상세 (8순환) | 2026-06-11 | 6건 (L-52·L-54 중복 제외) |
| 46 | 검색 (8순환) | 2026-06-11 | 2건 (L-60·L-61 중복 제외) |
| 47 | 계정/로그인 (8순환) | 2026-06-11 | 5건 |
| 48 | 커뮤니티/소셜 (8순환) | 2026-06-11 | 7건 (L-32 계열 별도 기록) |
| 49 | 홈/메인 (9순환) | 2026-06-11 | 2건 |
| 50 | 카테고리/목록 (9순환) | 2026-06-11 | 4건 |
| 51 | 상품상세 (9순환) | 2026-06-11 | 4건 (LCP 중복 제외) |
| 52 | 검색 (9순환) | 2026-06-11 | 3건 |
| 53 | 계정/로그인 (9순환) | 2026-06-11 | 3건 |
| 54 | 커뮤니티/소셜 (9순환) | 2026-06-11 | 4건 |
| 55 | 홈/메인 (10순환) | 2026-06-11 | 2건 |
| 56 | 카테고리/목록 (10순환) | 2026-06-11 | 2건 |
| 57 | 상품상세 (10순환) | 2026-06-11 | 2건 (GoTrueClient 경고=양성·LCP/aggregateRating 중복 제외) |
| 58 | 검색 (10순환) | 2026-06-11 | 1건 (대부분 기존 중복, 신규 M-111) |
| 59 | 계정/로그인 (10순환) | 2026-06-12 | 5건 (M-116·M-117·L-97~L-99) |
| 60 | 커뮤니티/소셜 (10순환) | 2026-06-12 | 2건 (L-100·L-101, H-31·M-98·M-99 재확인) |
| 61 | 홈/메인 (11순환) | 2026-06-12 | 2건 (M-118 GoTrueClient 이중화·L-102 search.json 버전 하드코딩) |
| 62 | 코드 정밀 탐색 | 2026-06-13 | 4건 (M-136~M-137·L-160~L-161) |
| 63 | 찜동기화·카테고리정렬·export·아이템페이지·CI | 2026-06-13 | 4건 (M-140·L-165~L-167) |
| 64 | recently-viewed·flag_price_outliers·account·view-set | 2026-06-13 | 2건 (M-141·L-168) |
| 65 | 가격슬라이더·XSS·DB스키마·딥링크·SW | 2026-06-13 | 4건 (M-143·M-144·L-172·L-173) |
| 66 | 모달접근성·세션처리·파이프라인·무한스크롤·리뷰렌더 | 2026-06-13 | 3건 (M-145·L-174·L-175) |
| 67 | recommend렌더·별점계산·stamp_version·세트무게·터치슬라이더 | 2026-06-13 | 3건 (M-148·L-178·L-179) |
| 68 | 자동완성키보드·필터URL직렬화·크롤링파싱·세트localStorage·리뷰모달 | 2026-06-13 | 4건 (M-149·M-150·L-180·L-181) |
| 69 | initApp·모달상태·draw인덱스·auth게이트·툴팁·푸시 | 2026-06-13 | 6건 (M-257~M-259·L-224~L-226) |
| 70 | (xcode) iOS 시뮬레이터 — 상품 상세·카테고리 탭·스펙 단위 | 2026-06-13 | 5건 (H-104·M-367·M-368·L-284·L-285) |
| 71 | (xcode) iOS 시뮬레이터 — 홈·헤더·검색 | 2026-06-13 | 4건 (H-118·M-389·M-390·L-310) |
| 72 | (xcode) iOS 시뮬레이터 — 필터 모달·침낭 카테고리 | 2026-06-13 | 2건 (L-311·L-312) |
| 73 | BE(파이프라인)·FE(SW/오프라인) 자동루프 | 2026-06-14 | 3건 (BE-001·BE-002·FE-001) |
| 74 | BE(coupang_runner)·FE(logFeed·bestGear) 자동루프 | 2026-06-14 | 3건 (BE-003·FE-002·FE-003) |
| 75 | FE(logModal ESC누적·세션만료·파일업로드) 자동루프 | 2026-06-14 | 3건 (FE-004·FE-005·FE-006) |

---

## 🗂️ Medium 묶음 처리 계획 (2026-06-12)

> 아래 클러스터는 동일 파일·동일 패턴이므로 PR 1개로 묶어서 수정 예정.

### [클러스터 A] ✅ 해결완료(2026-06-12~13) setItems 필드 누락 — `M-130` + `M-131`
- **공통 원인:** 인라인 객체 수기 생성 시 `s·pcode·coupang_url` 필드 누락
- **공통 수정:** `items.map(m => setItem(m, STATE.slug))` 헬퍼로 교체
- **파일:** `site/app.js` 2곳 (bulkBtn ~line 2776, openCmpModal ~line 2076)

### [클러스터 B] ✅ 해결완료(2026-06-12~13) initAuth 이중 발화 → 핸들러 누적 — `M-132` + `M-116`
- **공통 원인:** `initAuth` 합성 `'INITIAL'` 이벤트가 Supabase `INITIAL_SESSION`과 겹쳐 콜백 2회 실행 → `renderProfile` 2회 → `addEventListener` 누적
- **공통 수정:** `supabaseClient.js` line 22 합성 호출 제거 + `renderProfile` 내 `addEventListener` → `onclick` 직접 할당으로 교체
- **파일:** `site/supabaseClient.js`, `site/account.html`

### [클러스터 C] ✅ 해결완료(2026-06-12~13) account.html 탭 UI 묶음 — `M-52` + `M-53` + `M-74` + `M-84`
- **공통 위치:** `account.html` 탭바 + `app.js` `renderAccount` 탭 섹션
- M-52: 탭 URL 해시 딥링크 무시 → `history.replaceState` 연동
- M-53: 찜 탭 카드 클릭 → 카테고리 이탈 → 상품 모달로 전환
- M-74: 모바일 375px 탭바 `<nav>` 0×0 → CSS hit area 확보
- M-84: `role="tab"` ARIA 미구현 → `role="tablist"` + `role="tab"` + `aria-selected` 추가
- **파일:** `site/account.html`, `site/app.js`

### [클러스터 D] ✅ 해결완료(2026-06-12~13) supabaseClient.js 인증 버그 — `M-118` + `M-125`
- M-118: `import("./supabaseClient.js")` 버전 없음 → GoTrueClient 이중 인스턴스 → `stamp_version.py` 동적 import도 교체 또는 싱글턴 패턴
- M-125: 닉네임 save 시 `clearTimeout(debounce)` 미호출 → 중복 setNickname 가능
- **파일:** `site/app.js` (dynamic import 교체), `pipeline/stamp_version.py`, `site/account.html`

### [클러스터 E] ✅ 해결완료(2026-06-12~13) account.html 로그인 후 동기화 — `M-117` + `M-123`
- M-117: 로그아웃 후 재로그인 시 `myLogsList.dataset.loaded` stale → 로그아웃 분기에서 초기화 추가
- M-123: 닉네임 설정 완료 후 `syncGearSetsOnLogin` 미호출 → save 핸들러에 호출 추가
- **파일:** `site/app.js` (~line 2258), `site/account.html` (~line 259)

---

## 🔴 High (즉시 수정 필요)

### [H-41] ✅ 해결완료(2026-06-13, CORE) — `renderHub` — '내 캠핑 스타일' 백패커·미니멀리스트·오토/맥시멀 클릭 시 스타일 추천 페이지 미이동 — 4인가족만 정상
- **해결:** `PERSONA_CAT` 객체를 빈 객체로 변경, 모든 스타일이 `recommend.html?p=KEY` fallback으로 연결됨.
- **영역:** 프론트엔드 — 홈/메인 (내 캠핑 스타일 섹션)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 홈화면 '내 캠핑 스타일'에서 `family`(4인가족)는 `recommend.html?p=family`로 이동하여 스타일별 추천 장비 전체(picks)를 보여주는 반면, `backpacker`·`minimal`·`auto` 3개는 `PERSONA_CAT` 객체에 단일 카테고리 URL이 하드코딩되어(`site/app.js` line 634–638) 각각 `category.html?cat=backpacking-tent`, `category.html?cat=tarp`, `category.html?cat=auto-tent`로 이동한다. 홈→스타일추천→각 스타일 페이지 내비게이션이 3/4 케이스에서 깨져 있어 핵심 UX 플로우 불일치.
- **재현조건:** 홈화면 → '내 캠핑 스타일' → 백패커/미니멀리스트/오토·맥시멀 중 하나 클릭 → 스타일 추천 페이지(`recommend.html?p=...`) 대신 단일 카테고리 페이지로 이동.
- **원인:** `site/app.js` line 634–638 `PERSONA_CAT` 객체에 `backpacker`, `minimal`, `auto` 키가 정의되어 line 648 fallback(`url = recommend.html?p=${p.key}`)이 동작하지 않음. `family`는 `PERSONA_CAT`에 없어 fallback이 적용됨.
- **제안 수정:** `PERSONA_CAT` 객체에서 `backpacker`, `minimal`, `auto` 3개 키를 제거 → 기존 fallback 로직으로 `recommend.html?p=backpacker`, `recommend.html?p=minimal`, `recommend.html?p=auto` 자동 연결.
- **파일:** [site/app.js](site/app.js) line 634–649 [lane:CORE]

### [H-39] ✅ 해결완료(백엔드+코드, 2026-06-11) — Google 로그인 후 비로그인 복귀
- **해결적용(2026-06-11):** ① (백엔드) `site_url` `http://localhost:3000` → `https://gear-forest.com`, `uri_allow_list`에 `https://gear-forest.com/**` 추가. authorize REST 검증 — `redirect_to=gear-forest.com/auth-callback.html` 정상 통과 확인. ② (코드) `supabaseClient.js`에 `flowType: 'pkce'` 명시적 설정. `auth-callback.html` else 분기 `INITIAL_SESSION(null)` 즉시 이탈 버그 수정(supabase-js v2 첫 이벤트가 INITIAL_SESSION+null인데 바로 unsubscribe → auth_error 이동했음). ③ (코드) M-96 동시 수정: `initAuth(user=null)` 콜백이 에러 메시지를 덮어쓰는 버그 수정.
- **영역:** 계정/로그인 (Supabase Auth 설정)
- **URL:** https://gear-forest.com/account.html
- **증상:** "Google로 로그인" → 구글 인증까지는 정상 진행되나, 사이트로 돌아오면 **여전히 비로그인 상태**. 세션이 생성되지 않음.
- **원인(2026-06-11, 라이브 진단):** Supabase Auth의 **Site URL이 기본값 `http://localhost:3000`으로 방치**됨 — `/auth/v1/callback`을 잘못된 code로 호출 시 `Location: http://localhost:3000?error=...`로 폴백되는 것으로 확인. OAuth 콜백이 최종 목적지를 Redirect URLs 허용목록과 대조하는데 apex `auth-callback.html`이 목록에 없으면 Site URL(localhost)로 폴백 → 코드 교환 페이지에 도달 못 해 세션 미생성. 코드(`SITE_BASE`=apex, redirectTo, handle_new_user 트리거)는 모두 정상 검증됨 — 순수 대시보드 설정 문제. (provider google=true, authorize→Google 302 정상, redirect_uri=supabase/callback 정상도 확인)
- **⚠️ 해결(대시보드, 코드변경 불필요):** Supabase → **Authentication → URL Configuration** — ① **Site URL** = `https://gear-forest.com` ② **Redirect URLs**에 `https://gear-forest.com/**` 추가. 저장 후 재로그인 시 해소 예상. Google Cloud 측 redirect URI(`…supabase.co/auth/v1/callback`)는 authorize 정상 302로 보아 이미 정상.

### [H-38] ✅ 해결완료(라이브 적용·검증) — 커뮤니티 쓰기(글/댓글/좋아요/리뷰) 전면 차단 — rate-limit 트리거 42501
- **해결적용(2026-06-11, Management API):** `017` 라이브 실행 완료. pg_proc 검증 — `check_{post,comment,like,review}_rate_limit` 4개 모두 `prosecdef=true`(SECURITY DEFINER) 확인. rate_limit_log 기록이 소유자 권한으로 처리되어 글/댓글/좋아요/리뷰 작성 차단 해소.
- **영역:** 커뮤니티/소셜 — 작성 (백엔드)
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 로그인 사용자가 글·댓글·좋아요·리뷰를 작성하면 DB에서 **42501 permission denied**로 실패. 라이브에 공개 게시글이 0건인 것과 정합(사실상 아무도 쓸 수 없는 상태).
- **원인(2026-06-11, 코드감사):** `reviews/comments/likes/posts` INSERT 시 BEFORE INSERT 트리거 `check_{review,comment,like,post}_rate_limit`(002)가 `INSERT INTO rate_limit_log`를 실행하는데, ① 004가 rate_limit_log에 **의도적으로 GRANT를 주지 않음**(주석: "트리거/service_role 전용, 우회 방지") → authenticated는 직접 INSERT 불가, ② 그런데 트리거 함수가 **SECURITY DEFINER가 아님** → 호출자 권한으로 실행되어 42501 → 작성 트랜잭션 전체 abort. 설계 의도(트리거 전용 기록)와 구현(비-DEFINER)의 모순. [016]과 동일 부류의 누락이나 영향이 훨씬 큼(쓰기 전면 차단).
- **수정:** 신규 `017_rate_limit_security_definer.sql` — 4개 rate-limit 트리거 함수를 `SECURITY DEFINER + SET search_path=public`으로 재정의(트리거 유지·멱등). 소유자 권한으로 rate_limit_log 기록 → 사용자 직접 GRANT 없이 동작, 우회 방지 의도 유지. [supabase/migrations/017_rate_limit_security_definer.sql](supabase/migrations/017_rate_limit_security_definer.sql)
- **라이브 적용(2026-06-11):** SQL Editor에서 `017` 실행 완료. 커뮤니티 글/댓글/좋아요/리뷰 작성 정상화.

### [H-36] ✅ 해결완료 — Supabase `posts` API 401 — 비로그인 커뮤니티 피드 완전 불능
- **영역:** 커뮤니티/소셜
- **URL:** https://gear-forest.com/community.html
- **증상:** 비로그인 상태에서 `/rest/v1/posts?select=*%2Cauthor:profiles...` 요청이 401 Unauthorized 반환. 공개 피드(누구나 읽어야 하는 콘텐츠)가 완전히 로드되지 않음. Supabase anon key RLS 설정 불비 또는 GRANT 미적용이 원인(소셜 백엔드 state: migration 004 GRANT 수동적용 필요).
- **재현:** 비로그인 → community.html → 콘솔 확인 → 401 @ supabase.co/rest/v1/posts
- **해결(2026-06-11, 백엔드 GRANT/RLS 적용으로 해소):** anon GRANT(migration 004)가 적용되어 401이 사라짐. 라이브 익명 검증 — `GET /rest/v1/posts`(단순 select)·`profiles`·앱 임베드 쿼리(`*,author:profiles!posts_user_id_fkey(...)`) 모두 **HTTP 200**(curl), 실브라우저 익명 community.html에서 동일 임베드 쿼리 `order=created_at.desc&limit=30` → **[200] OK**·콘솔 에러 0. RLS는 `posts_select_public`(anon, authenticated)로 공개 글 읽기 허용. 현재 `[]`는 401이 아니라 공개 게시글이 아직 없는 정상 빈 상태. (코드 변경 없음 — 백엔드 적용 후 재현 불가 확인) [supabase/migrations/004_grants_and_wishlist.sql](supabase/migrations/004_grants_and_wishlist.sql)

### [H-37] ✅ 해결완료 — 데스크톱 nav에 카테고리 탐색 탭 없음 — 데스크톱 사용자 탐색 진입 경로 부재
- **영역:** 네비게이션 (전체 페이지)
- **URL:** https://gear-forest.com/ (데스크톱 768px 이상)
- **증상:** 데스크톱 `.tabbar`는 "📊비교 / 💬커뮤니티 / 👤내 정보" 3개 탭만 존재. 모바일 `.bottom-nav`에는 "탐색" 탭이 있어 카테고리로 직접 이동 가능하지만, 데스크톱에서는 해당 탭이 없어 상단 nav에서 카테고리 탐색으로 바로 진입할 방법이 없음. "📊비교" 탭은 index.html(홈)로 이동하며 비교 UI도 없음 (M-22). M-10과 연관이나, 데스크톱에서 핵심 탐색 기능이 nav에서 완전 누락이라는 점에서 High.
- **해결(2026-06-11):** `app.js`의 데스크톱 탭바 `TABS` 배열에 "🧭 탐색"(`category.html`) 탭 추가 — 모바일 `.bottom-nav`와 일치하는 4탭 구성. 카테고리/브랜드/추천 페이지 매칭을 "비교"에서 "탐색"으로 이동(홈에선 비교, 탐색 페이지에선 탐색 강조). 로컬 프리뷰 검증 — index.html에서 비교 active·탐색 표시, category.html에서 탐색 active(`aria-current="page"`)·비교 비활성, 4탭 정상 렌더(스크린샷), 콘솔 에러 없음. [site/app.js](site/app.js)
- **재현:** 데스크톱(≥768px) → 임의 페이지 → 상단 tabbar 확인 → "탐색/카테고리" 탭 없음

### [H-38] ✅ 해결완료 — 상세 페이지 하단 탭바 링크 4개 모두 404
- **영역:** 상품 상세
- **URL:** https://gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 상세 페이지에서 탭바(홈·탐색·비교·커뮤니티·내 정보) 링크가 `/item/sleeping-bag/index.html`, `/item/sleeping-bag/category.html` 등 서브디렉터리 기준 상대경로로 생성되어 모두 404. 실제 경로는 루트 기준 `/index.html`, `/category.html` 등이어야 함. 상세 페이지 진입 후 다른 영역으로 이동 불가.
- **재현:** item/*.html 직접 접근 → 탭바 링크 클릭 → 404
- **원인:** 데스크톱 `.tabbar`(`TABS`)가 상대경로 href(`index.html` 등) 사용. app.js는 item 페이지에도 로드되어 탭바가 생성되는데, 상세는 `/item/{cat}/item-N.html`(2단계 하위)이므로 상대경로가 `/item/{cat}/index.html`로 해석돼 404. (모바일 `.bottom-nav`는 item에서 skip되고 이미 절대경로 사용)
- **해결(2026-06-11):** `app.js`의 `TABS` href를 루트 절대경로(`/index.html`·`/category.html`·`/community.html`·`/account.html`)로 변경 — 어느 깊이에서나 정확히 해석, 모바일 nav와 동일 규칙. 매칭 로직(파일명 기준)은 불변이라 페이지별 active 강조 유지. 로컬 프리뷰 검증 — item-232 페이지에서 4탭 모두 루트 경로로 해석(`/item/` 잔존 0), 탐색 탭 클릭 시 `/category.html` 정상 이동·탐색 active, 일반 페이지 회귀 없음, 콘솔 에러 0. [site/app.js](site/app.js)

### [H-42] ✅ 해결완료 — 모바일 상품상세 페이지 네비게이션 완전 소실
- **영역:** 상품상세 (모바일)
- **URL:** https://gear-forest.com/item/sleeping-bag/item-232.html (390px 뷰포트)
- **증상:** 모바일(≤640px)에서 상세 페이지에 탭바가 전혀 없음. CSS가 `.tabbar`를 `display:none`으로 숨기고, `insertBottomNav()`는 `/item/` 경로 감지 시 `return` 조기 종료하여 `.bottom-nav`도 삽입하지 않음. 브레드크럼 링크만 남아 모바일 사용자의 다른 섹션 이동 경로 전무.
- **원인:** `app.js`의 `insertBottomNav()`에서 `if (isItem) return;`로 상세 페이지를 제외 처리. 데스크톱은 `.tabbar`(이미 H-38에서 절대경로 수정됨)를 사용하지만, 모바일은 `.bottom-nav`가 item 페이지에 삽입되지 않아 데스크톱 tabbar의 모바일 대체 수단도 없음.
- **해결(2026-06-11):** `insertBottomNav()`의 `if (isItem) return;` 조기 종료 제거 — item 페이지에도 `.bottom-nav` 삽입. 탭 href는 이미 절대경로(`/index.html` 등)라 2단계 하위 경로에서도 정확히 동작. 탐색 탭 match 목록에 `/item` 추가 → item 페이지에서 탐색 탭 active 표시. 로컬 프리뷰 검증 — `/item/sleeping-bag/item-232.html`에서 `.bottom-nav` 존재, 탐색 탭 `on`, 4개 탭 절대경로 링크 정상, 콘솔 에러 0. [site/app.js](site/app.js)
- **재현:** 모바일 390px 뷰포트 → `/item/*.html` 직접 접근 → 페이지 어디에도 탭바 없음

### [H-41] ✅ 해결완료 — 경량 우선 프리셋 kg/g 단위 불일치 — 결과 항상 0건 + URL 공유 시에도 재현
- **영역:** 카테고리/목록 — 필터 프리셋
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 🪶 경량 우선 프리셋 클릭 시 결과가 항상 0건. 무게 슬라이더도 0.0kg 극소값으로 표시. URL 공유(`weight_min__max=1.1`) 후 새 탭 접근해도 동일 0건.
- **원인:** `buildFilters` 프리셋 fn()이 `STATE.range[weightMeta.key] = { max: +(p33 / 1000).toFixed(1) }`로 kg 단위(예: 1.1) 저장. 그러나 `passRange`는 `m.specs[key].value`(g 단위, 예: 800)와 직접 비교 → `800 > 1.1` → 모든 제품 탈락. 슬라이더 이벤트의 `toStateVal`(kg→g 변환)을 프리셋 코드가 우회함. `serializeState`도 단위 변환 없이 직렬화하여 URL에도 kg값(`weight_min__max=1.1`)이 기록됨. `restoreState`에 isWeight 판별 없어 복원 시에도 동일.
- **해결(2026-06-11):** 프리셋 fn()에서 `{ max: +(p33 / 1000).toFixed(1) }` → `{ max: p33 }`으로 수정 — `weightVals`는 이미 g 단위(`m.specs[key].value`)이므로 p33도 g 단위. `passRange`·`syncFilterUI`(toDisplay=v/1000)·`serializeState`가 모두 g 단위를 기대하여 변환 없이 직접 저장하면 전 경로 일치. 로컬 프리뷰 검증 — 경량 우선 클릭 시 `STATE.range.weight_min.max=1130`(g), 결과 81건(기존 0건), 슬라이더 1.1kg 표시 정상·URL `weight_min__max=1130`, 콘솔 에러 0. [site/app.js](site/app.js)
- **재현:** `category.html?cat=backpacking-tent` → 빠른 설정 🪶 경량 우선 클릭 → 결과 0건, 슬라이더 0.0kg

### [H-40] ✅ 해결완료(H-28·M-59 복합 해소) — `sort` 파라미터 단독 URL 직접 접근 시 간헐적 리다이렉트 루프
- **영역:** 카테고리/목록
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag&sort=price_min
- **증상:** `sa` 파라미터 없이 `sort`만 포함된 URL로 직접 접근 시 일부 환경에서 `ERR_TOO_MANY_REDIRECTS` 발생. 외부에서 공유된 정렬 URL이 사용자를 완전 차단할 수 있음. 재현은 타이밍 의존적(간헐적)이며 `sa=0`이 자동 추가될 때는 정상 로드됨.
- **해결(2026-06-11):** ① H-28 — SW가 www→apex 301 응답을 캐싱하던 버그 수정(`!net.redirected` 가드 추가) + CACHE 키 변경으로 오염 캐시 폐기. ② M-59 — `sa` 부재 시 정렬키 기본방향 적용(`defaultAsc(srt)`)으로 URL 안정화. 두 수정의 복합 효과로 리다이렉트 루프 재현 불가. `replaceState`는 페이지 리로드 없이 URL만 갱신하므로 코드 경로 자체에 루프 없음. 라이브 확인 재현 안 됨.
- **재현:** `category.html?cat=sleeping-bag&sort=price_min` 직접 접근 → 일부 환경에서 리다이렉트 루프

### [H-39] ✅ 해결완료 — 홈 검색 Enter — 브랜드명 입력 시 브랜드 페이지 대신 단일 카테고리로 오이동
- **영역:** 홈/메인 — 전역 검색 (`#homeq`)
- **URL:** https://gear-forest.com/
- **증상:** "헬리녹스" 같은 브랜드명 단독 입력 후 Enter 시 `brand.html?b=헬리녹스`가 아닌 `category.html?cat=backpacking-tent&q=헬리녹스`로 이동. 브랜드가 여러 카테고리에 걸쳐 있을 때 인덱스에서 가장 먼저 매칭된 모델의 카테고리만 표시되어 나머지 카테고리(침낭·의자 등) 제품이 누락됨.
- **원인:** `app.js` — `idx.find()`로 모델 매치가 먼저 걸리면 브랜드 분기에 도달하지 않음. 브랜드명이 모델 인덱스에 포함된 항목이 있을 경우 카테고리 이동이 우선됨.
- **해결(2026-06-11):** Enter 핸들러에 **브랜드명 정확 일치 체크를 모델 매치보다 앞에 추가** — `idx.find(x => x.b.toLowerCase() === ql)`로 정확 일치 브랜드를 먼저 탐색, 있으면 `brand.html?b=...`로 즉시 이동. 기존 모델 매치·부분 브랜드 매치는 폴백으로 유지. 로컬 프리뷰 검증 — "헬리녹스" Enter 시 exactBrand 히트 → `brand.html?b=헬리녹스` 이동 확인; 일반 모델 검색("체어원")은 category 이동 회귀 없음. [site/app.js](site/app.js)
- **재현:** 홈 검색창에 "헬리녹스" 입력 → Enter → `brand.html` 대신 `category.html?cat=backpacking-tent` 이동 확인

### [H-01] ✅ 해결완료(라이브 검증) — 이번 주 인기 API (get_hot_items) 404 에러 — 하드코딩 fallback 노출
- **해결확인(2026-06-11):** 사용자가 `APPLY-NOW.sql`(008→013→015) 대시보드 1회 적용. 라이브 익명 검증 — `POST /rest/v1/rpc/get_hot_items` → **HTTP 200**(현재 `[]`는 구매클릭 로그 부재로 정상, 홈은 fallback 유지). click_events 테이블 생성됨(익명 select 401은 RLS "본인 클릭만" 의도된 차단). 한 트랜잭션 COMMIT 성공 = 013·008·015 동시 반영 확정.
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** 페이지 로드 시 Supabase RPC `get_hot_items` 호출이 404 반환. '이번 주 인기' 섹션이 실제 데이터 대신 하드코딩된 4개 항목(백패킹텐트, 침낭, 버너, 랜턴)을 표시. 콘솔에 에러 노출.
- **재현:** https://gear-forest.com 접속 → 브라우저 콘솔 확인 → 'Failed to load resource: 404' 확인
- **원인(2026-06-11, 라이브 검증):** anon 키로 `POST /rest/v1/rpc/get_hot_items` 호출 시 **404 PGRST202** — "함수가 스키마 캐시에 없음". 즉 `migrations/013_hot_items_rpc.sql`이 **라이브 DB에 적용된 적 없음**(같은 이유로 `012_top_gear_tags_rpc`도 404 동일 확인). 마이그레이션은 CI가 아니라 **Supabase 대시보드 SQL Editor에서 수동 적용**하는 구조인데, `supabase/APPLY.md` 체크리스트에 RPC 마이그레이션(012/013) 적용 단계가 누락되어 라이브 반영이 빠짐. 더해 013에는 anon 호출용 `GRANT EXECUTE`도 부재(PUBLIC 기본 grant 의존).
- **추가 원인 2건(적용 시도 중 발견, 2026-06-11):** ① **선행 테이블 미적용** — `click_events`(008)가 라이브에 없음(REST 404 PGRST205). 013은 이 테이블을 집계하므로 008 없이는 함수 생성 자체가 실패. 앱의 클릭 로깅(app.js:1277 `insert click_events`)도 같은 이유로 무효였음. ② **컬럼명 버그** — click_events 컬럼은 `slug`인데 013이 존재하지 않는 `cat`을 SELECT/GROUP BY → 008 적용해도 함수 생성이 `42703 column "cat" does not exist`로 실패. (앱 렌더 renderHotSection은 `h.cat` 키를 기대하므로 `slug AS cat` 매핑이 정답.)
- **수정(코드):** ① `013_hot_items_rpc.sql` — `slug AS cat` 매핑으로 컬럼버그 수정 + `GRANT EXECUTE` + SECURITY DEFINER `search_path` 고정. ② 통합 적용본 `supabase/APPLY-NOW.sql` 재작성 — **008(click_events 테이블·RLS·grant) → 013(수정본) → 015** 의존성 순서, 한 트랜잭션·멱등. ③ 012(get_top_gear_tags)는 `posts.tags`/`is_public`(007)·`gear_sets`(006) 미적용으로 분리·보류(통합본에서 제외, 의존성 안내). [supabase/migrations/013_hot_items_rpc.sql](supabase/migrations/013_hot_items_rpc.sql), [supabase/APPLY-NOW.sql](supabase/APPLY-NOW.sql)
- **⚠️ 남은 작업(대시보드 1회 적용):** Supabase SQL Editor에서 **`supabase/APPLY-NOW.sql` 전체 RUN**(008+013+015). 적용 후 `get_hot_items` curl이 **HTTP 200**이면 H-01 해소(빈 배열은 클릭로그 부재로 정상, fallback 유지). 이전 통합본은 012의 `posts.tags` 참조로 트랜잭션 전체 롤백됐던 문제를 본 수정으로 해결.

### [H-21] ✅ 해결완료 — https://gear-forest.com 직접 접근 시 ERR_TOO_MANY_REDIRECTS
- **영역:** 홈/메인
- **URL:** https://gear-forest.com
- **증상:** non-www 주소로 직접 진입하면 리다이렉트 루프(gear-forest.com↔www.gear-forest.com)로 페이지 열리지 않음. www로 진입 시에는 정상. SEO canonical·공유 링크가 non-www를 가리키므로 외부 유입 사용자가 진입 불가.
- **해결(2026-06-11, 환경 변화로 해소):** apex 직접 접근 시 200·리다이렉트 0(루프 없음), www→apex 단일 301로 정상화. CT/GitHub Pages 인증서도 approved. 재현 안 됨.

### [H-28] ✅ 해결완료 — Service Worker 캐시로 인한 `cat=cooking` ERR_TOO_MANY_REDIRECTS
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=cooking
- **증상:** SW가 활성화된 상태에서 `cat=cooking` URL 진입 시 브라우저가 리다이렉트 루프(ERR_TOO_MANY_REDIRECTS)에 빠져 페이지 완전 불능. `data/cooking.json`이 존재하지 않는 슬러그임에도 SW 캐시에 `category.html?cat=cooking` URL이 `camping-0ea071e5` 캐시 내 저장되어 있어 캐시 히트→리다이렉트→캐시 히트 루프 발생. SW 언레지스터 후 접근 시 정상 오류 메시지 표시.
- **재현:** SW 활성화 상태에서 https://www.gear-forest.com/category.html?cat=cooking 직접 접근
- **영향:** `cat=cooking` 슬러그 접근 시 모든 사용자 완전 차단
- **원인(2026-06-11):** `sw.js` fetch 핸들러(네비게이션·자산 모두)가 `fetch(req)` 응답을 무조건 `cache.put` 했는데, www→apex 301을 따라간 응답은 `net.redirected=true`. 리다이렉트된 Response를 캐시에 넣으면 이후 캐시 히트 시 redirect 꼬리표가 남아 ERR_TOO_MANY_REDIRECTS 루프 발생(잘 알려진 SW 함정).
- **해결:** ① 네비게이션·자산 핸들러 모두 `net.ok && !net.redirected`일 때만 캐싱하도록 가드 추가. ② `pipeline/stamp_version.py`가 CACHE 빌드 해시에 **sw.js 로직 해시까지 포함**하도록 수정(기존엔 app.js+css+supabase만 반영 → SW 전략만 바뀌면 캐시명 불변 = 오염 캐시 잔류 latent 버그). 이번 배포로 CACHE `camping-0ea071e5`→`camping-11b6a30a`로 바뀌어 activate 시 오염된 옛 캐시 폐기. 로컬 프리뷰 검증 — SW 재등록 후 캐시 `camping-11b6a30a` 단일, 옛 캐시 폐기·콘솔 에러 없음. [site/sw.js](site/sw.js), [pipeline/stamp_version.py](pipeline/stamp_version.py)
- **비고:** apex 기기는 이번 배포로 자동 복구. 과거 www-origin SW 고착 기기는 [H-19] 비고대로 데이터 삭제/apex 직접접속 필요.

### [H-22] ✅ 해결완료 — style 필터 URL 공유·직접 진입 시 칩 active 복원 실패 + 정렬 미적용
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag&style=backpacking
- **증상:** URL에 `style=backpacking` 파라미터가 있어도 직접 진입·새로고침 시 ① 해당 칩 버튼이 active(.on) 상태가 아니고 ② 필터도 미적용되어 전체 목록이 표시됨. URL 공유 링크가 받는 사람에게 필터링된 결과를 보여주지 못함. `renderStyleChips(d)` 호출이 `restoreState(params)` 이전에 위치하여 STATE에 campStyle이 빈 값임.
- **재현:** `?cat=sleeping-bag`에서 백패킹 칩 클릭 → URL 복사 → 새 탭에서 열기 → 칩 비활성·전체 목록 표시
- **원인(2026-06-11):** ① `renderStyleChips(d)`가 `restoreState(params)` 이전에 호출되어 칩의 `.on`이 빈 campStyle로 그려짐. `syncFilterUI()`는 style 칩을 갱신하지 않아 복원 안 됨. ② `applyStyleSort(d)`가 칩 onclick 핸들러에서만 호출되고 초기 로드 경로엔 없어, sort 명시 없는 공유 URL은 스타일 정렬이 적용되지 않음. (style은 행을 거르는 필터가 아니라 핵심 스펙 기준 정렬을 바꾸는 동작)
- **해결:** `renderCategory()` 초기화 순서 재정렬 — `renderStyleChips(d)`를 `restoreState(params)` **이후**로 이동(칩 .on 복원). restoreState 직후 `STATE.campStyle && !params.get("sort")`이면 `applyStyleSort(d)` 호출(스타일 기본 정렬 적용). 명시적 sort가 URL에 있으면 그것을 존중. 로컬 프리뷰 검증 — `?style=backpacking` 진입 시 칩 active + 최소무게 오름차순(215g→363g→…)·tip 표시 / `&sort=spec:comfort_temp` 동반 시 명시 정렬(13C→11C→…) 존중·칩 active 유지. [site/app.js](site/app.js)

### [H-03] ✅ 해결완료 — tent·cooking 카테고리 JSON 503으로 페이지 로드 실패
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** `data/tent.json`, `data/cooking.json`이 503 반환 → 해당 카테고리에서 '카테고리를 찾을 수 없습니다.' 오류 표시. sleeping-bag은 정상.
- **재현:** `/category.html?cat=tent` 또는 `?cat=cooking` 접속
- **해결(2026-06-11, 환경 변화로 해소):** `tent`·`cooking`은 실제 존재하는 슬러그가 아님(실제: backpacking-tent·auto-tent·other-tent·burner·cookware 등). 코드 어디서도 해당 슬러그로 링크하지 않음(grep 확인). 정적 apex에서 존재 슬러그는 200(sleeping-bag), 없는 슬러그는 404 — 예전 503은 구 동적 호스팅 아티팩트. 재현 안 됨.

### [H-04] ✅ 해결완료 — 상품 이미지 대규모 403/503 오류 (sleeping-bag 기준 221개 전부 실패)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `/images/*.jpg` 요청이 403/503 다수 발생. 221개 이미지 전체 로드 실패, 카드에 '이미지 준비중' 대체 텍스트 표시.
- **재현:** `/category.html?cat=sleeping-bag` 접속 후 네트워크 탭 확인
- **해결(2026-06-11, 환경 변화로 해소):** apex 정적 호스팅 이전 + '상품 이미지 git 추적' 커밋 이후 이미지 정상 서빙 — 라이브 apex 샘플 5개(10·1003·1005·1008·1009.jpg) 전부 200. 재현 안 됨.

### [H-05] ✅ 해결완료 — 데이터 로드 실패 시 스켈레톤 카드 6개가 화면에 잔존
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** JSON 로드 실패로 에러 메시지가 표시된 상태에서도 `.pli-skel` 스켈레톤 카드 6개가 시각적으로 남아 있음. aria-hidden=true 처리는 되어 있으나 에러 메시지 아래 회색 카드가 보임.
- **원인(2026-06-11):** `renderCategory()`가 시작 시 `renderCategorySkeleton()`으로 #list에 스켈레톤 6개를 채우는데, JSON 로드 실패 catch 블록이 title 텍스트만 바꾸고 #list는 정리하지 않아 스켈레톤이 잔존.
- **해결:** catch 블록에서 #list를 비우고 단일 에러 상태(`.cat-error` — 안내 문구 + '전체 카테고리 보기' 복구 링크, `role="alert"`)로 교체. CSS `.cat-error*` 추가. 로컬 프리뷰 검증 — 실패 카테고리에서 스켈레톤 0개·에러 상태 표시, 정상 카테고리(침낭 244개)는 회귀 없음. [site/app.js](site/app.js), [site/style.css](site/style.css)

### [H-17] ✅ 해결완료 — 자동완성 드롭다운 키보드 탐색(↑↓) 미구현 — WAI-ARIA Combobox 패턴 미준수
- **영역:** 검색 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** ↑↓ 키로 드롭다운 항목 간 이동 불가. `aria-expanded`, `aria-haspopup`, `aria-autocomplete`, `role="option"`, `aria-selected`, `aria-activedescendant` 등 ARIA 속성 전무. 스크린리더 사용자 자동완성 접근 불가. Tab 키 입력 시에도 포커스가 BODY로 탈출하며 드롭다운이 즉시 닫혀 결과 선택 불가 — Tab 탐색도 미지원.
- **해결(2026-06-11):** `setupHomeSearch()`에 WAI-ARIA combobox 패턴 구현. 입력창에 `role=combobox`·`aria-autocomplete=list`·`aria-haspopup=listbox`·`aria-controls`·`aria-expanded`(목록 표시에 따라 갱신)·`aria-activedescendant`, 목록 컨테이너에 `role=listbox`, 각 브랜드/상품 링크에 `role=option`·고유 id·`aria-selected` 부여. ↓/↑ 키로 옵션 간 순환 이동(시각 강조 `.sres-active` + `aria-selected=true` + activedescendant 갱신 + scrollIntoView), 활성 옵션에서 Enter 시 해당 링크로 이동. 입력 변경 시 활성 인덱스 리셋. CSS `.sres-active`(accent outline) 추가. 로컬 프리뷰 검증 — '헬리녹스' 입력 시 옵션 31개에 role/id 부여, ↓ 2회·↑ 1회로 activedescendant opt-0→opt-1→opt-0 이동, 활성 옵션 aria-selected=true·outline 2px·activedescendant 일치 확인. [site/app.js](site/app.js), [site/style.css](site/style.css)

### [H-18] ✅ 해결완료 — Esc 키가 드롭다운 닫기와 동시에 검색 입력값 초기화
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 자동완성 표시 중 Esc 누르면 드롭다운 닫힘과 동시에 입력값이 빈 문자열로 지워짐. 기대 동작은 드롭다운만 닫히고 입력값 유지.
- **해결(2026-06-11):** `setupHomeSearch()`의 keydown 핸들러에 Escape 분기 추가. `input[type=search]`의 네이티브 Esc=초기화 동작을 `e.preventDefault()`로 차단하고 드롭다운만 닫도록 처리. 로컬 프리뷰 검증 — Esc 시 드롭다운 display block→none, 입력값 '헬리녹스' 유지 확인. [site/app.js](site/app.js)

### [H-19] ✅ 해결완료 — Service Worker 오프라인 폴백 — `category.html?cat=...` URL 캐시 miss → 홈 서빙
- **영역:** 검색 (PWA)
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent
- **증상:** SW 캐시에 쿼리스트링 없는 `category.html`만 저장됨. 네트워크 불안정 시 `?cat=backpacking-tent` URL이 캐시 miss → `index.html` 폴백 → 홈 화면 노출. `caches.match(req, { ignoreSearch: true })` 로 해결 가능.
- **해결(2026-06-11):** `sw.js` 네비게이션 핸들러의 캐시 폴백을 `caches.match(req, { ignoreSearch: true })`로 변경 — `category.html?cat=X`가 캐시된 `category.html`에 매치되어 엉뚱한 홈 폴백을 방지. apex 클라이언트는 SW 스크립트 변경분을 정상 업데이트(network-first·skipWaiting·clients.claim 기존 구현 유지). [site/sw.js](site/sw.js)
- **⚠️ 관련 인프라 이슈(별도):** `www.gear-forest.com/sw.js`가 301 리다이렉트되어, 과거 www 도메인에서 SW를 등록한 기기(특히 모바일)는 SW 자가 업데이트 불가 → 구버전 캐시 셸 서빙으로 화면 깨짐. 코드 배포(apex 서빙)로는 해결 불가 — 기기에서 사이트 데이터 삭제/PWA 재설치 또는 www의 sw.js 리다이렉트 제거(인프라) 필요. [H-21]과 동일 www↔apex 이전 근본원인.

### [H-16] ✅ 해결완료 — backpacking-tent 카테고리 상품 상세 전체 접근 불가 — 홈 HTML 서빙
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** `/item/backpacking-tent/app.js` 및 `style.css`가 HTTP 504로 실패하여 상품 상세 내용이 없고 홈 페이지 콘텐츠(title: '장비의 숲 — 정량스펙 별점 DB')가 렌더링됨. 해당 카테고리 상품 상세 전체 접근 불가.
- **해결(2026-06-11, 환경 변화로 해소):** 라이브 apex에서 `item/backpacking-tent/item-52.html` 200·정상 상세 렌더(title '니모이큅먼트 호넷 엘리트 오스모 1P …'). 504/홈 서빙 재현 안 됨. ([H-30]과 동일 정적 호스팅 이전으로 해소)

### [H-14] ✅ 해결중 — 모달 '구매하기' 버튼이 모든 상품에서 항상 disabled — 쿠팡 파트너스 연결 중
- **영역:** 카테고리/목록 (모달)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 상품 카드 클릭 시 열리는 모달의 '구매하기' 버튼이 `disabled` 상태 고정, '구매 링크를 준비 중입니다.' 안내만 표시. 침낭 244개 상품 전체 동일. 쿠팡 파트너스 수익화 핵심 기능 미작동. (상세 페이지 [H-08]과 동일 문제)
- **비고:** 사용자 확인 — 쿠팡 파트너스 API 연결 전 의도적 disabled. 연결 시 수정 필요.

### [H-15] ✅ 해결완료 — 데이터 로드 실패 카테고리에서 h1이 오류 메시지·스켈레톤이 동시 노출
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=stove
- **증상:** JSON 503 카테고리에서 h1='카테고리를 찾을 수 없습니다.' 오류 메시지와 스켈레톤 카드 6개가 동시에 DOM에 존재. 이중 오류 상태로 사용자 혼란. ([H-05] 스켈레톤 잔존의 확장 사례)
- **해결(2026-06-11):** [H-05]와 동일 수정으로 해결. catch 블록이 #list의 스켈레톤을 제거하고 단일 에러 상태로 교체하므로 h1 오류 메시지와 스켈레톤이 더 이상 공존하지 않음. [site/app.js](site/app.js)

### [H-12] ✅ 해결완료 — canonical·og:url이 non-www인데 실제 서빙 URL은 www — SEO 중복 콘텐츠
- **영역:** 홈/메인 (SEO)
- **URL:** https://www.gear-forest.com/
- **증상:** `<link rel="canonical">`과 `og:url`이 `https://gear-forest.com/`(non-www)으로 설정되어 있으나 실제 서빙 URL은 `https://www.gear-forest.com/`. 검색엔진이 두 버전을 별개 문서로 인식해 PageRank 분산 위험. [H-10] OAuth 도메인 불일치와 같은 근본 원인(non-www/www 혼용).
- **해결(2026-06-11, 환경 변화로 해소):** canonical·og:url=`https://gear-forest.com/`가 **실제 서빙 도메인(apex)과 일치**. 도메인 이전으로 apex가 정식이 되어 중복 콘텐츠 문제 해소.

### [H-20] ✅ 해결완료 — 최근 본 상품 카드 클릭 시 상품 상세로 이동하지 않음
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** 홈의 '최근 본 상품' 섹션에서 카드를 클릭해도 상품 상세 페이지로 이동하지 않음. 클릭 이벤트가 연결되지 않았거나 링크 href가 누락된 것으로 추정.
- **제보:** 사용자 직접 제보
- **원인(2026-06-11):** recard 링크는 `category.html?cat=...&brands=...&q=...`(필터된 목록)으로만 이동하고, 카테고리 페이지는 brands+q로 단일 상품을 특정해도 상세 모달을 자동으로 열지 않았음. 사용자에겐 "상세로 안 감"으로 보임. (recent 항목엔 상품 id가 없어 직접 상세 URL 생성 불가)
- **해결:** `renderCategory()`의 `draw()` 직후, 단일 브랜드(brands에 '|' 없음)+q가 모두 있으면 `d.models`에서 정확히 일치하는 모델을 찾아 `openProduct()`로 상세 모달을 자동 오픈. 검색 결과·추천 카드 등 brands+q 링크 전반이 함께 개선됨. 일반 검색(q만)은 제외. 로컬 프리뷰 검증 — brands+q 링크 시 모달 자동 오픈(네이처하이크 BE400…), q만 있는 일반 검색은 미오픈 확인. [site/app.js](site/app.js)

### [H-13] ✅ 해결완료 — 최근 본 상품 섹션 이미지 403 — 썸네일 전체 깨짐
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** localStorage에 저장된 최근 본 상품(images/105.jpg, images/922.jpg)을 불러올 때 403 반환. '최근 본 상품' 카드에 이미지 없이 '이미지 준비중'만 표시. [H-04] 이미지 서버 오류와 동일 근본 원인.
- **해결(2026-06-11, 환경 변화로 해소):** 이미지 서버 정상화([H-04]와 동일 근본). 라이브 apex 이미지 200 확인. '최근 본 상품' 썸네일도 정상. 재현 안 됨.

### [H-10] ✅ 해결완료 — OAuth redirectTo URL이 www 없는 도메인으로 하드코딩 — 로그인 실패 가능
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `supabaseClient.js`의 `SITE_BASE`가 `https://gear-forest.com`으로 고정. 실제 사이트는 `https://www.gear-forest.com`으로 리다이렉트되므로 Google OAuth 콜백 URL이 불일치할 경우 로그인 실패.
- **해결(2026-06-11, 환경 변화로 해소):** 도메인 이전으로 **apex(gear-forest.com)가 정식 서빙 도메인**이 됨(www→apex 301). 따라서 `SITE_BASE='https://gear-forest.com'`는 이제 정확한 값 — 더 이상 불일치 아님. [[domain-apex-canonical]]

### [H-11] ✅ 해결완료 — 다크모드 토글이 '정비 중'이라고 표시되면서 클릭 가능 상태로 렌더링
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 설정 섹션에 '정비 중'이라고 안내하지만 토글은 `disabled=false`·`pointerEvents=auto` 상태로 실제 클릭 가능. 초기 `data-theme=dark` 적용으로 `checked=true`까지 표시되어 상태가 모순.
- **원인(2026-06-11):** 다크 모드는 실제로 완전히 구현·동작함 — `app.js`의 `initTheme()`이 모든 페이지에서 localStorage 테마를 적용하고, `window.setTheme()`이 적용+영속화, `#theme-switch`가 이를 호출하며 `.switch[aria-checked=true]` CSS로 시각 상태(초록·knob 이동)도 정상. 즉 '(정비 중)' 라벨만 잘못된 표기였음(라벨↔동작 모순).
- **해결:** account.html 설정의 다크 모드 설명에서 '(정비 중)' 문구 제거 → 라벨과 실제 동작 일치. 로컬 프리뷰 검증(스크린샷) — 토글 시 페이지 다크 적용, 스위치 초록·knob 우측(ON), localStorage `theme=dark` 영속, 라벨 '어두운 테마로 전환합니다'. [site/account.html](site/account.html)

### [H-09] ✅ 해결완료 — 검색 자동완성 클릭/Enter 시 clean URL로 이동 → CSS·JS MIME 오류, 페이지 완전 파손
- **영역:** 검색
- **URL:** https://www.gear-forest.com/category/backpacking-tent?q=%ED%85%90%ED%8A%B8
- **증상:** 홈 검색창에서 자동완성 클릭 또는 Enter 시 `category/backpacking-tent?q=...` clean URL로 이동. `category/style.css`와 `category/app.js`가 MIME 오류로 로드 실패 → `ReferenceError: renderCategory is not defined` → 페이지가 '불러오는 중…'에서 영구 정지.
- **재현:** 홈 → 검색창에 '텐트' 입력 → 자동완성 클릭 또는 Enter
- **참고:** `category.html?cat=backpacking-tent` 방식은 정상. [H-02]와 동일 근본 원인 — 검색 자동완성 링크 href가 아직 구 clean URL 형식 사용 중
- **해결(2026-06-11, 환경/라우팅 변화로 해소):** 자동완성 클릭·Enter 모두 `category.html?cat=` 사용, 코드에 clean URL 링크 없음(grep 확인). [H-02]와 동일 근본. 재현 안 됨.

### [H-06] ✅ 해결완료 — 상세 페이지 네비 링크가 구 clean URL `category/{slug}/`로 이동 → 404
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 상세 페이지 탭바의 '비교', '커뮤니티', '내 정보' 링크가 상대경로(index.html, community.html, account.html)로 하드코딩되어 `/item/{category}/index.html` 등으로 이동. 해당 URL은 '서비스 점검 중입니다' 오류 페이지 반환.
- **재현:** 상세 페이지 진입 후 탭바 아무 탭 클릭
- **원인(2026-06-11):** 현재 item 상세 페이지엔 옛 탭바가 없고, 대신 breadcrumb·back-link가 구 clean URL `../../category/{slug}/`로 걸려 있었음. 클린 URL이 제거된 뒤라 라이브에서 `/category/{slug}/` → **404**(반면 `category.html?cat={slug}` → 200). [H-02]와 동일 근본. 생성기 `scripts/build-item-pages.js`가 해당 링크를 만들고 2277개 파일 전부 영향.
- **해결:** `scripts/build-item-pages.js`의 breadcrumb·back-link·catUrl을 `../../category.html?cat=${catSlug}` 형식으로 수정 후 **2277개 상세 페이지 전체 재생성**(+sitemap 갱신). 로컬 프리뷰 검증 — item-52 breadcrumb·back-link href가 `category.html?cat=backpacking-tent`, 구 clean URL 잔존 0, back-link 클릭 시 카테고리 페이지(백패킹텐트·상품 137개) 정상 이동·콘솔 에러 없음. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [H-07] ✅ 해결완료 — 상세 페이지에 찜하기(북마크) 버튼 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 카테고리 목록 모달에는 찜하기 버튼이 있으나, 상세 페이지에는 완전히 누락됨.
- **해결(2026-06-11):** 생성기 `scripts/build-item-pages.js`의 item-hero에 찜 버튼(`#item-wish`) + 인라인 와이어링 스크립트 추가. item 페이지가 이미 로드하는 `app.js`의 전역 찜 API(`wishKey`·`inWish`·`toggleWish`)를 재사용 — localStorage `wish`에 모달·카드와 **동일 포맷**으로 저장되어 account.html 찜 목록과 자동 연동. CSS `.item-wish`(.on=accent) 추가, 2277개 상세 페이지 전체 재생성. 로컬 프리뷰 검증 — 클릭 시 찜하기↔찜함 토글·aria-pressed 동기화·localStorage 저장/해제, account 포맷 일치(key·b·m·cap·s·p·img), 스크린샷으로 초록 활성 버튼 확인·콘솔 에러 없음. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [H-08] ✅ 해결완료 — 상세 페이지에 구매하기(쿠팡 파트너스) 버튼 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 카테고리 모달에는 구매하기 버튼(disabled)이 있으나, 상세 페이지에는 구매 버튼 및 쿠팡 파트너스 링크 자체가 존재하지 않음.
- **해결(2026-06-11):** 생성기 `scripts/build-item-pages.js` hero(찜 버튼 아래)에 구매 버튼 추가 — 모달과 동일 미러링: `model.coupang_url`이 있으면 활성 링크(`<a rel="nofollow sponsored noopener">🛒 쿠팡에서 구매하기` + 파트너스 고지), 없으면 disabled `🛒 구매하기` + '구매 링크를 준비 중입니다.'. 현재 데이터엔 coupang_url 필드가 없어 모달과 동일하게 disabled 상태(H-14 의도, API 연결 시 자동 활성화). CSS `.item-buy`(.item-buy[disabled] opacity .4) 추가, 2277개 상세 페이지 전체 재생성. 로컬 프리뷰 검증 — disabled 버튼·안내 문구·opacity 0.4·not-allowed, 찜+구매 버튼 공존, 스크린샷 확인·콘솔 에러 없음. (href escape는 `esc` 미정의 대비 `String().replace`로 안전 처리) [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [H-02] ✅ 해결완료 — 카테고리 링크 클릭 시 JS·CSS·manifest 404 — 페이지 렌더링 불가
- **영역:** 홈/메인 → 카테고리 링크
- **URL:** https://www.gear-forest.com/category/backpacking-tent
- **증상:** 홈 카테고리 카드가 `category/backpacking-tent` 형식(구 SPA-like URL)을 사용. 해당 URL 직접 접근 시 `category/app.js`, `category/style.css`, `category/manifest.webmanifest` 모두 404 또는 MIME 오류. `renderCategory is not defined` ReferenceError 발생, 카테고리 목록 표시 안 됨.
- **재현:** 홈에서 카테고리 카드 클릭 → 빈 페이지 + 콘솔 에러 확인
- **참고:** `fix(routing)` 커밋에서 `category.html?cat=` 방식으로 전환했으나 홈 카테고리 그리드 링크가 아직 구 경로 형식 사용 중

---

## 🟡 Medium


### [M-146] ✅ 해결완료(2026-06-13, moot) — `renderHotSection` — '이번 주 인기' 랭킹 행에 직접 상품 링크 없음 → 일부 제품 링크 미노출
- **영역:** 프론트엔드 — 홈/메인 (이번 주 인기 섹션)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `renderHotSection()` (`site/app.js` line 2620)에서 `get_hot_items` RPC 결과(`brand`, `model`, `cat`, `clicks`)로 랭킹 행을 렌더링할 때 `href="category.html?cat=${cat}&brands=...&q=..."` 카테고리 필터 URL로 연결한다. RPC가 `pcode`나 아이템 인덱스를 반환하지 않아 직접 상품 상세 페이지(`/item/{cat}/item-N.html`) 링크 생성이 불가능하다. 브랜드·모델명이 카테고리 필터 검색과 정확히 일치하지 않으면 클릭 시 빈 결과 페이지로 이동하여 사용자 입장에서 "링크 없음"처럼 보인다 (스크린샷: 헬리녹스 코타2 1회 — 클릭 후 필터 불일치로 빈 페이지 이동 가능).
- **재현조건:** 홈 화면 '이번 주 인기' 랭킹 항목 클릭 → `category.html?cat=mat&brands=헬리녹스&q=코타2` 로 이동 → 검색 결과 0건 또는 해당 상품 미표시.
- **원인:** `supabase/migrations/014_hot_items_rpc.sql` — `RETURNS TABLE(brand text, model text, cat text, clicks bigint)` 에 `pcode` 미포함. `click_events` 테이블에 `pcode` 컬럼이 있다면 RPC에 추가해 직접 링크 생성 가능.
- **제안 수정:** ① `get_hot_items` RPC에 `pcode` 컬럼 추가 (click_events에 pcode 저장 전제) → `href="/item/${cat}/item-${pcode}.html"` 직접 링크 생성. ② 단기 대안: `q` 파라미터 대신 `search.html?q=${encodeURIComponent(h.model)}` 검색 페이지로 연결해 히트율 향상.
- **파일:** [site/app.js](site/app.js) line 2620, [supabase/migrations/014_hot_items_rpc.sql](supabase/migrations/014_hot_items_rpc.sql) [lane:CORE]

- **해결(2026-06-11, 환경/라우팅 변화로 해소):** 코드가 이미 `category.html?cat=` 방식으로 전환 완료 — `site/app.js`·HTML 어디에도 구 clean URL(`category/{슬러그}`) 링크 잔존 없음(grep 확인). 더 이상 재현되지 않음.

### [M-68] ✅ 해결완료 — "빠른 설정" 프리셋 전환 시 이전 필터 미초기화 — 필터 누적 AND 적용
- **영역:** 카테고리/목록 — 필터바 빠른 설정
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag 등
- **증상:** "빠른 설정"의 🪶경량 우선 클릭 후 💰저가 우선으로 전환 시, 경량 우선이 설정한 `STATE.range[weightKey]`가 초기화되지 않은 채 가격 필터(`STATE.range.price`)가 추가됨. 두 필터가 AND 누적 적용되어 결과가 비정상적으로 적어짐. 반대 방향(저가→경량)도 동일.
- **제보:** 사용자 직접 제보
- **원인:** 각 프리셋 `fn()`이 자신의 `STATE.range` 항목만 설정하고 다른 프리셋 항목을 리셋하지 않음 (app.js:959~970)
- **재현:** 카테고리 페이지 → "경량 우선" 클릭 → "저가 우선" 클릭 → 결과가 훨씬 적거나 빈 목록
- **7순환 추가 확인:** 실제 재현 — 경량→저가 전환 시 결과 0/244개. 또한 동일 프리셋 재클릭 시 ON 상태에서 OFF 토글이 안 됨(URL에 누적된 파라미터 제거 불가).
- **해결(2026-06-11):** ① `clearPresetFilters()`(무게range·가격range·cap 삭제)를 각 프리셋 적용 전에 호출 → 상호배타(누적 제거). ② 각 프리셋에 `isOn()` 판정 추가, `fn()`을 토글식으로(켜져 있으면 끄기) 변경 → 동일 프리셋 재클릭 시 OFF + URL 파라미터 제거. ③ 클릭 핸들러가 `isOn()` 상태 기반으로 `.on` 표시 동기화(초기 URL 복원 시 활성 강조 포함). 로컬 프리뷰 검증 — 경량ON(weight_min__max=1.1)→저가 전환 시 무게 제거·가격만(price__max), 경량 재클릭 시 필터·URL 모두 제거, `.on` 표시 정확, 콘솔 에러 0. [site/app.js](site/app.js)
- **8순환 추가 확인:** `clearPresetFilters()`가 무게·가격·cap만 삭제하고 `comfort_temp__max`·`brands` URL 파라미터는 삭제하지 않음. 다른 필터를 함께 설정한 상태에서 프리셋 전환 시 temperature/brand 필터가 잔존하여 여전히 누적됨. → M-89 참조.

### [M-77] ✅ 해결완료 — 카드 `role="button"`에 `aria-label` 없음 — 스크린리더 상품명 미읽기
- **영역:** 카테고리/목록 — 상품 카드
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 상품 카드 div에 `role="button"` + `tabindex="0"`이 있으나 `aria-label` 없음. 스크린리더가 카드 포커스 시 "버튼"만 읽고 상품명을 읽지 못함. L-03(a 링크 없음)과 연관된 별개 접근성 문제.
- **재현:** 카드 요소 → `aria-label` 속성 확인 → null
- **해결(2026-06-11):** `.pli` 카드 div에 `aria-label="${브랜드} ${모델} 상세 보기"` 추가. 로컬 프리뷰 검증 — 카드 aria-label="큐물러스 매직 100 상세 보기" 확인, 콘솔 에러 0. [site/app.js](site/app.js)

### [M-78] ✅ 해결완료 — 카드 키보드 Enter 활성화 미동작 — `role="button"` ARIA 명세 위반
- **영역:** 카테고리/목록 — 상품 카드
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `role="button"` + `tabindex="0"` 카드에 포커스 후 Enter/Space 키를 눌러도 상품 모달이 열리지 않음. ARIA 명세상 `role="button"` 요소는 Enter/Space로 활성화되어야 하나 keydown 핸들러 없음. WCAG 2.1 SC 4.1.2 위반.
- **재현:** 카드에 Tab 포커스 → Enter → 모달 미열림
- **해결(2026-06-11):** 리포트 시점 이후 `draw()`의 카드 키보드 핸들러가 이미 구현된 상태(`el.onkeydown`에서 `Enter`/`Space` → `e.preventDefault()` + `openProduct()`). 라이브 코드 재검증 — 카드 포커스 후 Enter·Space 모두 상품 상세 모달 정상 오픈(큐물러스 매직 100), 콘솔 에러 0. (별도 코드 추가 불필요, 동작 확인으로 해결 표기) [site/app.js](site/app.js)

### [M-69] ✅ 해결완료(2026-06-12, Cloudflare) — www 서브도메인 직접 접근 시 이미지 403 + JS ReferenceError — 자산 로드 실패
- **영역:** 상품상세 / 전체
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** www.gear-forest.com으로 직접 접근 시 HTML은 301 리다이렉트 없이 서빙되나 이미지(`/images/*.jpg`)가 403, JS가 `ReferenceError: renderHub is not defined`로 실패해 페이지 렌더링 불가. H-21 해결 이후에도 www 직접 접근 경로에서 자산 서빙이 차단됨.
- **재현:** www.gear-forest.com/item/backpacking-tent/item-52.html 직접 접근 → 콘솔 403·ReferenceError 확인

### [M-66] ✅ 해결완료(재현불가) — 페르소나 카드 `sort`/`sa` URL 파라미터 소실 — 공유 URL 정렬 상태 미복원
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션
- **URL:** https://gear-forest.com/
- **증상:** 홈 페르소나 카드(백패커·미니멀리스트 등) 클릭 시 `sort`·`sa` 파라미터가 URL에 포함되어야 하나, `serializeState()`가 해당 sort가 해당 카테고리의 기본 정렬값과 동일하면 URL에서 제외함(app.js). 결과: `?cat=backpacking-tent&cap=2`처럼 sort 없는 URL로 이동 → 공유 링크나 북마크 시 정렬 상태 미복원.
- **재현:** 홈 → '🎒 백패커' 카드 클릭 → 주소창 URL에서 sort/sa 파라미터 없음 확인
- **검증/판정(2026-06-11, 재현불가·실질 손실 없음):** 로컬 프리뷰로 페르소나별 실제 동작 확인 — **정렬 상태는 항상 올바르게 복원됨.**
  - 백패커(backpacking-tent, weight_min asc): weight_min이 이 카테고리의 **기본 정렬**이라 `serializeState()`가 중복 파라미터를 생략 → URL은 `?cat=backpacking-tent&cap=2`. 하지만 공유 링크를 열면 기본 정렬(weight_min asc)로 **동일하게 복원**됨(첫 행 935g→1.13kg 오름차순, sortSelect="기본").
  - 오토/맥시멀(auto-tent, floor_area desc): floor_area는 기본 정렬이 **아니므로** URL에 **명시 유지**됨(`...&sort=spec:floor_area&sa=0`, sortSelect="spec:floor_area").
  - 즉 sort가 생략되는 경우는 "그 값이 곧 기본값"일 때뿐이라 공유 시 동일 결과로 복원되고, 비기본 sort는 URL에 보존됨 → 정렬 미복원 증상은 발생하지 않음. 리포트는 "파라미터가 URL에 없다"는 점만 보고 기본값이 복원한다는 사실을 누락한 false positive. (코드 변경 불필요)

### [M-67] ✅ 해결완료(2026-06-12, Cloudflare) — www. 서브도메인 DNS 미해석 — cdn-cgi/rum·이미지 요청 ERR_NAME_NOT_RESOLVED
- **영역:** 홈/메인 (네트워크/런타임)
- **URL:** https://gear-forest.com/
- **증상:** 페이지 로드 시 `https://www.gear-forest.com/cdn-cgi/rum?` 및 `www.gear-forest.com/images/*.jpg` 요청이 `net::ERR_NAME_NOT_RESOLVED`로 반복 실패. 현재 정식 도메인은 apex(gear-forest.com)이며 www는 301 리다이렉트인데, 어떤 JS 또는 잔류 SW가 www. URL로 요청을 생성 중. Cloudflare Analytics 데이터 수집 불가, 이미지 로드 실패.
- **재현:** 홈 접속 → 콘솔 → `ERR_NAME_NOT_RESOLVED @ www.gear-forest.com/...` 다수 확인

### [M-46] ✅ 해결완료 — `role="dialog"`에 `aria-labelledby`/`aria-label` 없음 — 스크린리더 이름 불명
- **영역:** 상품상세 모달 (접근성)
- **URL:** category.html 내 상품 상세 모달
- **증상:** `.pmbox[role="dialog"][aria-modal="true"]`에 `aria-labelledby`, `aria-label` 모두 없음. 스크린리더가 모달 진입 시 "이름 없는 대화상자"로 읽음. WCAG 4.1.2 위반.
- **재현:** 상품 모달 열기 → 접근성 트리 확인 — dialog 요소의 accessibleName = ""
- **해결(2026-06-11):** 상품 모달(`openProduct`)의 제목(`.pmname`)에 `id="pm-title"` 부여하고 `.pmbox[role="dialog"]`에 `aria-labelledby="pm-title"` 연결. 로컬 프리뷰 검증 — dialog accessibleName = "매직 100"(상품 모델명)으로 해석, 콘솔 에러 0. (M-20과 동일 수정으로 함께 해결) [site/app.js](site/app.js)

### [M-47] ✅ 해결완료(재현불가) — 비로그인 상태에서 "장비 꾸러미에 담기" 클릭 시 아무 피드백 없음
- **영역:** 상품상세 모달
- **URL:** category.html → 상품 카드 클릭 → `.pmset` 버튼
- **증상:** 비로그인 상태에서 "＋ 장비 꾸러미에 담기" 클릭 시 toast·안내 메시지·버튼 변화 전혀 없음. M-11(세트에 추가) 과 동일 패턴이나 별도 버튼.
- **재현:** 로그아웃 상태 → 상품 모달 → .pmset 클릭 → 무반응
- **검증/판정(2026-06-11, 재현불가):** 비로그인 상태(프리뷰 = Supabase 세션 없음)에서 실제 동작 확인 — `.pmset` 클릭 시 `openSetModal()`이 **정상적으로 세트 선택 모달을 띄움**(display:flex·on, "장비 꾸러미에 담기 / 큐물러스 매직 100 / 저장된 세트 / 새 세트 만들기" 표시). 세트 기능은 localStorage 기반이라 로그인 불필요하며 클릭 시 모달 오픈이 곧 피드백. '무반응'은 재현되지 않음(stale 리포트). (코드 변경 불필요) — 단, 비로그인 시 "로컬 저장·로그인하면 동기화" 안내 부재는 별도 [M-71] 범주.

### [M-48] ✅ 해결완료 — `.stars .e`(빈 별 스팬)에 `aria-hidden` 없음 — 스크린리더가 별점 오독
- **영역:** 전체 (상품 카드·모달 별점)
- **증상:** 별점 렌더링 시 채워진 별(★) + 빈 별 스팬(`.e` class, 흐린 ★) 구조인데 `.e` 스팬에 `aria-hidden="true"` 없음. 텍스트 콘텐츠가 항상 ★×5개로 읽혀 1점짜리 상품도 스크린리더에서 "별 5개"로 오독.
- **재현:** 별점 요소 접근성 트리 확인 — `textContent` = "★★★★★" 고정
- **해결(2026-06-11):** `stars()`가 만드는 `.stars` 컨테이너에 `role="img"` + `aria-label="별점 N / 5"` 부여 — 개별 별(빈 별 포함)이 AT에서 presentational로 숨겨지고 실제 점수만 읽힘(별도 `.e` aria-hidden보다 견고). 로컬 프리뷰 검증 — 카드별 aria-label이 "별점 5 / 5"·"별점 2 / 5"·"별점 1 / 5" 등 실제값 반영(시각 ★★★★★ 유지), 페이지 내 606개 모두 role=img 적용, 콘솔 에러 0. [site/app.js](site/app.js)

### [M-45] ✅ 해결완료 — 카테고리 필터 `<select>` 접근성 레이블 없음 — 스크린리더 목적 불명
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag 등
- **증상:** 정렬 드롭다운 및 브랜드 필터 `<select class="fsel">` 2개에 `id`, `aria-label`, `<label for>`, `title` 중 어느 것도 없음. WCAG 4.1.2 위반 — 스크린리더 사용자가 드롭다운 목적을 알 수 없음.
- **재현:** 카테고리 페이지 접근 → 접근성 트리 확인: `select` 요소 accessibleName = "" (공백)
- **해결(2026-06-11):** `buildFilters`의 정렬 select에 `aria-label="정렬 기준 선택"`, 브랜드 select에 `aria-label="브랜드 필터 선택"` 추가. 로컬 프리뷰 검증 — 두 select accessibleName이 각 레이블로 해석, 레이블 없는 `.fsel` 0개, 콘솔 에러 0. [site/app.js](site/app.js)

### [M-44] ✅ 해결완료 — LCP 이미지에 `loading="lazy"` + `fetchpriority` 없음 — LCP 점수 저해
- **해결(2026-06-11):** `build-item-pages.js` 히어로 이미지에서 `loading="lazy"` 제거 + `fetchpriority="high"` 추가. 2277개 상세 페이지 재빌드. 카테고리 카드는 뷰포트 외 이미지이므로 lazy 유지. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **영역:** 홈/메인 (성능)
- **URL:** https://www.gear-forest.com/
- **증상:** 최근 본 상품 등 뷰포트 내 LCP 대상 이미지(`/images/922.jpg` 등)에 `loading="lazy"` 설정 및 `fetchpriority="high"` 누락. lazy 이미지는 브라우저가 뷰포트 진입 전까지 로드를 지연하여 LCP 점수를 직접 악화시킴. 또한 LCP 이미지에 대한 `<link rel="preload" as="image">` 힌트도 없어 JS 실행 후 늦게 요청됨.
- **재현:** DevTools → Performance 탭 LCP 확인 또는 `document.querySelector('img[src*="922.jpg"]').loading` → `"lazy"`

### [M-42] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글쓰기 폼 `<label>` — `for` 속성 없어 스크린리더 필드 인식 불가
- **영역:** 커뮤니티/소셜 — 글쓰기 폼
- **URL:** https://www.gear-forest.com/community.html#new
- **증상:** `renderCompose()`가 생성하는 폼의 제목·내용·사진 `<label>` 3개 모두 `for` 속성 없음. 대응 input/textarea에 `id="cm-t"`, `id="cm-b"`가 있지만 label과 프로그래밍적으로 연결되지 않아 스크린리더가 필드를 올바르게 읽지 못함.
- **재현:** 로그인 + 닉네임 설정 → 글쓰기 폼 열기 → DevTools Accessibility 탭에서 label 연결 미확인

### [M-43] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 게시글 카드 `<a>`에 `href` 없음 — 키보드/스크린리더 탐색 불가
- **영역:** 커뮤니티/소셜 — 피드 목록
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 피드 게시글 카드가 `<a class="cm-post" data-id="…">` (href 없음)으로 렌더링됨. href 없는 `<a>`는 Tab 포커스 순서에 포함되지 않아 키보드만으로 진입 불가. onclick 핸들러만 동작.
- **재현:** 커뮤니티 피드 → Tab 키 탐색 → 게시글 카드 포커스 불가

### [M-41] ✅ 해결완료(M-95 동시 수정) — 세트 섹션 — 0개일 때 완전 숨김, 빈 상태 안내 없음
- **해결(2026-06-11):** M-95 수정으로 동시 해결. sets.length 조건 제거 + 빈 상태 안내 HTML 추가. [site/app.js](site/app.js)
- **영역:** 계정/세트 섹션
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 세트가 0개이면 `#sets-section`이 완전히 숨겨지고 빈 상태 안내("세트가 없어요")나 CTA도 없음. 찜 섹션과 달리 기능 존재 자체를 알 수 없음.
- **재현:** 세트 없는 상태에서 account.html 접속 → 세트 섹션 미표시

### [M-39] ✅ 해결완료(H-39 동시) — 홈 검색 Enter 시 첫 번째 자동완성 결과의 단일 카테고리로 강제 이동
- **해결(2026-06-11):** H-39 수정으로 정확 브랜드명 Enter 시 brand.html로 이동 — 단일 카테고리 강제 진입 해소. [site/app.js](site/app.js)
- **영역:** 검색 (홈)
- **URL:** https://www.gear-forest.com/
- **증상:** 홈 검색창에서 브랜드명(예: "헬리녹스") 입력 후 Enter 시 첫 번째 자동완성 결과의 카테고리(`category.html?cat=backpacking-tent&q=헬리녹스`)로 강제 이동. 해당 브랜드의 의자·타프 등 다른 카테고리 제품은 누락됨. 사용자 의도와 다른 범위로 검색됨.
- **재현:** 홈 → "헬리녹스" 입력 → Enter → backpacking-tent 카테고리로만 이동

### [M-49] ✅ 해결완료 — 홈 검색창 한글 IME 조합 중 자동완성 연속 트리거 — `isComposing` 미처리
- **영역:** 검색 (홈)
- **URL:** https://www.gear-forest.com/
- **증상:** `oninput` 핸들러에 `e.isComposing` 체크가 없어 한글 자모 입력 단계마다 검색이 실행됨. "ㅎ"→"헤"→"헬"→"헬리" 각 단계에서 `run()` 호출 → 검색창 깜빡임 + 불완전 자모로 매치 시도.
- **재현:** 홈 검색창에서 한글 검색어 천천히 입력 → DevTools 콘솔에서 `run()` 연속 호출 확인
- **해결(2026-06-11):** `setupHomeSearch()`의 `oninput`을 `e => { if (e.isComposing) return; run(); }`으로 변경하고 `compositionend` 이벤트에 `run` 연결 → 조합 중엔 자동완성 미발동, 조합 완료 시 1회 실행. 로컬 프리뷰 검증 — `isComposing:true` input 시 드롭다운 미오픈, `compositionend` 후 드롭다운 오픈(옵션 31개). [site/app.js](site/app.js)

### [M-50] ✅ 해결완료 — 홈 검색창 한글 Enter 조합완료 + 검색실행 동시 발생 — `isComposing` 미처리
- **영역:** 검색 (홈)
- **URL:** https://www.gear-forest.com/
- **증상:** `keydown` Enter 핸들러에 `e.isComposing` 체크가 없어, 한글 IME에서 마지막 글자 조합 완료(Enter) 시 즉시 `location.href` 이동이 실행됨. 조합이 완료된 글자가 검색어에 반영되기 전에 페이지 이동 발생.
- **재현:** 홈 검색창에서 한글 마지막 글자 입력 → Enter 1회 → 의도치 않게 바로 페이지 이동
- **해결(2026-06-11):** `setupHomeSearch()`의 keydown 핸들러 최상단에 `if (e.isComposing || e.keyCode === 229) return;` 추가 → 조합완료 Enter·화살표·Esc 등 IME 처리 키가 검색/탐색을 발동시키지 않음. 로컬 프리뷰 검증 — `isComposing:true` Enter·keyCode 229 Enter 모두 미이동, 일반 Enter(조합 아님)는 `category.html?cat=...&q=` 정상 이동(회귀 없음). [site/app.js](site/app.js)

### [M-52] ✅ 해결완료(2026-06-13) — 계정 탭 URL 해시 딥링크 무시 — Back/Forward 탭 전환 불가
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html#sets 등
- **증상:** `account.html#sets`, `#logs`, `#settings` 등 해시로 직접 접근 시 해시 무시, 항상 wish 탭 표시. `_accSetTab()`이 `sessionStorage("acc-tab")`만 읽고 `location.hash` 미참조, `hashchange` 핸들러도 없음. 딥링크 공유·브라우저 Back/Forward 탭 전환 모두 불가.
- **재현:** `account.html#logs` 직접 접근 → wish 탭 표시됨

### [M-54] 커뮤니티 게시글 수정 기능 없음 — 삭제만 존재 〔✅ 백엔드 차단요인 라이브 해소(016 적용)·UI/클라 대기〕
- **영역:** 커뮤니티/소셜 — 게시글 상세
- **URL:** https://www.gear-forest.com/community.html
- **증상:** `renderDetail()` toolbar에 삭제 버튼만 있고 수정 버튼 없음. 오타·내용 수정을 위해서는 삭제 후 재작성 필요.
- **재현:** 내 게시글 클릭 → 상세 모달 → toolbar 확인
- **백엔드 근본 차단요인 발견·수정(2026-06-11):** 게시글 수정을 붙여도 **DB 레이어에서 하드 실패**하는 잠재 결함이 있었음 — `posts` UPDATE 시 `AFTER UPDATE` 트리거 `save_post_history()`가 `post_history`에 INSERT하는데, ① post_history 정책이 `WITH CHECK(false)`로 직접 insert 전면 차단 + INSERT GRANT 없음, ② 함수가 **SECURITY DEFINER가 아님** → 호출자 권한 INSERT가 `42501`로 실패 → 수정 UPDATE 트랜잭션 전체 abort. 동일 결함이 `save_review_history`(리뷰 수정), `update_comment_count`/`update_like_count`(타인 글 카운트 UPDATE가 posts RLS에 막혀 누락), `auto_hide_on_reports`(신고 자동숨김 미작동)에도 존재. → 신규 `016_trigger_security_definer.sql`로 6개 트리거 함수를 `SECURITY DEFINER + SET search_path=public`으로 재정의(트리거 유지·멱등). 이로써 카운트 정합성([H-34]의 cross-user 보강 포함)·이력 저장·자동숨김이 정상화되고, 게시글/리뷰 수정의 DB 차단요인이 제거됨. [supabase/migrations/016_trigger_security_definer.sql](supabase/migrations/016_trigger_security_definer.sql)
- **⚠️ 남은 작업:** ① 대시보드에서 `016` 1회 적용(아래 APPLY.md 6단계). ② 프론트(본 백엔드 세션 범위 밖) — supabaseClient `editPost(id,{title,body})` + renderDetail 수정 버튼/폼 와이어링.

### [M-55] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 카테고리 필터 없음 — 게시글 증가 시 탐색 불가
- **영역:** 커뮤니티/소셜 — 피드
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 피드에 카테고리(팁/후기/질문 등) 또는 태그 필터 UI 전혀 없음. 게시글 수 증가 시 원하는 글을 찾을 수 없음.

### [M-58] ✅ 해결완료 — `?cat=` 대소문자 미정규화 — 대문자 진입 시 카테고리 로드 실패
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=Backpacking-Tent
- **증상:** `cat` 파라미터가 대문자이면 `data/Backpacking-Tent.json` 요청이 실패해 "카테고리를 불러오지 못했습니다." 표시. 소문자 `backpacking-tent`는 정상. 외부 링크나 직접 입력 URL이 대문자인 경우 빈 화면.
- **재현:** `?cat=Backpacking-Tent` URL 직접 접근
- **해결(2026-06-11):** `renderCategory`에서 slug를 `.toLowerCase()`로 정규화(클린 URL 정규식도 `i` 플래그) → 대문자 cat도 `data/{소문자}.json` 로드. 로컬 프리뷰 검증 — `?cat=Backpacking-Tent` 접근 시 백패킹텐트 정상 로드(상품 137개·에러 없음), URL은 `?cat=backpacking-tent`로 정규화, 콘솔 에러 0. [site/app.js](site/app.js)

### [M-59] ✅ 해결완료 — `?sort=price_min` URL에 `sa` 파라미터 없을 때 정렬 방향 역전
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent&sort=price_min
- **증상:** UI에서 "가격 낮은순" 선택 시 `sa=1`(오름차순)이 함께 붙어 정상 동작. 그러나 `sa` 없이 `sort=price_min`만 포함된 공유 URL로 진입하면 `sa=0`(내림차순)이 기본값으로 적용되어 비싼 것부터 표시. 공유 URL 재현 시 결과가 다름.
- **재현:** `?cat=backpacking-tent&sort=price_min` URL 직접 접근 → 정렬 방향 확인
- **원인:** `restoreState`가 `STATE.sortAsc = params.get("sa") === "1"`로만 처리 → `sa` 부재 시 무조건 false(내림차순).
- **해결(2026-06-11):** `sa` 부재 시 정렬키의 자연 기본방향 적용 — `params.has("sa") ? sa==="1" : (srt==="value" ? false : defaultAsc(srt))`. UI의 `applySort`와 동일 규칙(value=내림, price_min·spec=defaultAsc). 로컬 프리뷰 검증 — `?sort=price_min`(sa없음) → 오름차순(23,370→57,600→95,750원, 싼것부터)·URL `sa=1`로 정규화 / `?sort=value`(sa없음) → `sa=0`(가성비 높은순)·콘솔 에러 0. [site/app.js](site/app.js)

### [M-61] ✅ 해결완료 — brand.html `bq` 검색창 입력·Enter 모두 무반응 — input 이벤트 핸들러 미동작
- **영역:** 검색 — brand.html
- **URL:** https://gear-forest.com/brand.html?b=헬리녹스
- **증상:** 브랜드 검색창(`input#bq`)에 텍스트를 입력해도 브랜드 칩 필터링·자동완성·하이라이트 등 실시간 피드백 전혀 없음. Enter를 눌러도 무반응. 결과적으로 검색창 자체가 완전히 비동작 상태. 6순환 탐색에서 oninput 이벤트 핸들러도 동작하지 않는 것으로 추가 확인됨.
- **검증/해결(2026-06-11):** ① **입력(oninput) 필터는 정상 동작** — 라이브 코드에 `renderBrand`의 `#bq` oninput 핸들러(`renderChips`)가 이미 존재. 프리뷰 재현 — "코베아" 입력 시 브랜드 칩이 1개로 실시간 필터, 없는 단어는 "브랜드 없음" 표시. (리포트의 'oninput 미동작'은 stale, 캐시된 구버전 관찰로 추정) ② **Enter 핸들러는 실제 부재** → `#bq`에 keydown 추가: Enter 시 현재 필터된 첫 브랜드 칩으로 이동(IME 조합 가드 포함). 프리뷰 검증 — "코베아"+Enter → 브랜드 페이지가 코베아로 전환(title "코베아 전 카테고리", URL `?b=코베아`), 콘솔 에러 0. [site/app.js](site/app.js)
- **재현:** brand.html?b=헬리녹스 → bq 검색창에 "코베아" 입력 → 브랜드 칩 변화 없음 → Enter → 무반응

### [M-75] ✅ 해결완료 — 다크모드 FOUC — `initTheme()`이 `<body>` 끝 app.js에서 실행
- **해결(2026-06-11):** index.html·category.html·brand.html·recommend.html `<head>` 내 `<link rel="stylesheet">` 직전에 `<script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')</script>` 인라인 1줄 추가. 아이템 상세 페이지 템플릿(build-item-pages.js)에도 동일 적용 후 2277개 재빌드. [site/index.html](site/index.html), [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **영역:** 홈/메인 (전체 페이지)
- **URL:** https://gear-forest.com/
- **증상:** 다크모드 저장 사용자가 페이지 로드 시 순간적으로 라이트 테마가 렌더링됐다가 다크로 전환되는 FOUC(Flash of Unstyled Content) 발생. `initTheme()` IIFE가 `app.js`(body 끝 위치) 내부에 있어 HTML·CSS 파싱·렌더링 후에야 `data-theme="dark"`가 적용됨.
- **수정 방향:** `<head>` 안에 `<script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')</script>` 인라인 1줄 추가

### [M-76] ✅ 해결완료 — `search.json` 캐시 버스팅 파라미터 없음 — 배포 후 최대 10분간 구 데이터 서빙
- **해결(2026-06-11):** `stamp_version.py`에 `data/search.json` 내용 해시 계산 추가. app.js 내 `"data/search.json?v=..."` 패턴을 해시로 교체한 뒤 app.js 해시를 계산하므로 HTML 스탬프까지 올바르게 연쇄. 데이터 업데이트 시 search.json 해시·app.js 해시·HTML 스탬프 3단 연쇄 무효화. [pipeline/stamp_version.py](pipeline/stamp_version.py), [site/app.js](site/app.js)
- **영역:** 홈/메인 (검색 DB)
- **URL:** https://gear-forest.com/data/search.json
- **증상:** `app.js?v=hash`, `style.css?v=hash`는 버전 파라미터로 캐시 무효화되나 `search.json`은 `max-age=600`(10분)만 설정되고 버전 파라미터 없음. 상품 데이터 업데이트 후 최대 10분간 구 데이터가 노출됨.

### [M-71] 비로그인 세트 섹션 — 로그인 안내·동기화 힌트 없음 (찜 섹션과 불일치) 〔✅ 백엔드 라이브 적용(006: gear_sets 생성+grant)·프론트 힌트만 대기〕
- **백엔드 적용(2026-06-11):** `006`을 라이브 적용 — gear_sets 테이블 생성 + grant 확인(anon SELECT / authenticated CRUD). 적용 중 발견한 버그(생성열 `total_price`/`total_weight_g`가 서브쿼리 사용 → `0A000`으로 적용 불가, 앱 미사용)도 제거 수정. 이제 로그인 시 세트 원격 동기화 실작동.
- **영역:** 계정/세트
- **URL:** https://gear-forest.com/account.html
- **증상:** 비로그인 상태에서 `#sets-section`이 표시되지만 찜 섹션(`#wish-synchint`)과 달리 "로그인하면 세트가 동기화됩니다" 류의 안내 문구가 없음. 세트가 로컬스토리지에만 저장되고 로그인 후 동기화되지 않음을 사용자가 모름.
- **재현:** 비로그인 → account.html → 세트 섹션 확인 → 동기화 힌트 없음 확인
- **백엔드 근본 차단요인 발견·수정(2026-06-11):** 로그인해도 **세트 원격 동기화가 실제로 동작 불가** 상태였음 — 앱은 `upsertGearSet`/`deleteRemoteGearSet`/fetchGearSets로 `gear_sets` 테이블에 동기화하는데, ① `gear_sets` 테이블이 **라이브 미적용**(REST 404 PGRST205), ② 게다가 `006_gear_sets.sql`이 테이블·RLS 정책만 있고 **GRANT 문이 전무** = 적용해도 004와 동일한 함정으로 모든 작업이 `42501`로 막힘. → `006`에 `GRANT SELECT TO anon,authenticated` + `GRANT INSERT,UPDATE,DELETE TO authenticated` 추가(grant 누락 보정). [supabase/migrations/006_gear_sets.sql](supabase/migrations/006_gear_sets.sql)
- **✅ 적용완료(2026-06-14, 사용자 대시보드 RUN):** `006`(grant 포함) + `024_gear_sets_type` 적용 → 세트 동기화 실작동. M-71/M-63 "동기화 안내" 문구도 사실과 일치(프론트 문구 추가는 별도).

### [M-72] ✅ 해결완료 — 세트 자동 생성 이름에 날짜만 포함 — 같은 날 복수 저장 시 이름 중복
- **해결(2026-06-11):** 찜→세트 저장 시 동일 날짜 기존 세트 수 카운트 후 ` (2)`, ` (3)` 접미사 자동 부여. [site/app.js](site/app.js)
- **영역:** 계정/세트
- **URL:** https://gear-forest.com/account.html
- **증상:** "찜 목록 세트 6. 11." 형식으로 날짜만 포함. 같은 날 여러 세트 저장 시 이름이 동일해지고 구별 불가. 세트 이름 편집 UI도 없음.
- **재현:** 같은 날 세트 2개 저장 → 세트 목록에서 이름 구별 불가

### [M-73] ✅ 해결완료(기존 구현 확인) — 세트 카드 클릭 시 구성 장비 목록 확인 불가
- **해결(2026-06-11):** 라이브 코드 확인 — `setsEl.querySelectorAll(".acc-set")` click 핸들러가 이미 존재, 클릭 시 장비 목록(무게·가격 표) + "로그 작성" 버튼 포함 `set-detail-modal` 팝업. (리포트의 '반응 없음'은 stale 관찰로 추정) [site/app.js](site/app.js)
- **영역:** 계정/세트
- **URL:** https://gear-forest.com/account.html
- **증상:** `.acc-set` 카드에 `role="button"` 및 `tabindex="0"`이 있어 클릭 가능해 보이지만, 클릭 시 세트 상세(구성 장비 목록) 진입 동작이 없음. 저장한 세트의 내용을 확인하는 방법이 없음.
- **재현:** account.html → 세트 탭 → 세트 카드 클릭 → 아무 반응 없음

### [M-74] ✅ 아카이브(FE-SOC-07 nav 제거로 moot) — 모바일 375px에서 account.html `<nav>` 렌더 크기 0×0 — 탭바 hit area 없음
- **영역:** 계정/로그인 (반응형)
- **URL:** https://gear-forest.com/account.html (375px)
- **증상:** 모바일 뷰포트(375px)에서 `<nav>` 요소 `getBoundingClientRect()` 결과 `width:0, height:0`. 탭바가 시각적으로 보여도 클릭 영역이 없어 탭 전환 불가 가능성. `position:sticky`이지만 실제 점유 면적 없음.
- **재현:** 375px 뷰포트 → account.html → nav.getBoundingClientRect() 확인

### [M-70] ✅ 부분해결(브랜드)·데이터한계(모델) (2026-06-12) — 영문 원어 모델명으로 검색 불가 — 한국어 표기만 인덱싱됨
- **해결(브랜드):** app.js에 `BRAND_ALIAS` 맵(~110개 유명 브랜드 한글→영문)+`_brandAlias()` 추가, 홈 검색 drop다운·Enter에서 브랜드 한글명에 영문별칭 합쳐 매칭. 검증: helinox→헬리녹스, naturehike, sea to summit, kovea/coleman/snowpeak 등 정상.
- **미해결(모델):** 모델명 영문검색은 원본 영문 데이터가 없어(`variants`는 개수 필드) 불가 — 영문 모델명 소스 데이터 필요.
- **별도 발견·✅해결(2026-06-12):** search.json이 라이브 `backpacking-bag`(596개) 미포함 → 배낭 브랜드 0건이던 stale 이슈. 데이터 파일에서 export_site.py 동일포맷으로 안전 재생성(2245→2870, DB 재빌드 미사용). 검증: osprey/gregory/deuter 정상. [site/data/search.json] [site/app.js](site/app.js)
- **영역:** 검색 — 홈 전역 검색
- **URL:** https://gear-forest.com/
- **증상:** "PocketRocket", "Elixir", "Reactor" 등 영문 원어 모델명으로 검색 시 결과 없음. 동일 제품을 "포켓로켓", "엘릭서"로 검색하면 정상 히트. search.json 인덱스가 한국어 표기만 포함하고 영문 원어명을 포함하지 않음. 외국 브랜드 제품을 영문으로 기억하는 사용자 유입 차단.
- **재현:** 홈 검색창 → "PocketRocket" 입력 → 결과 없음 / "포켓로켓" 입력 → 정상 히트

### [M-64] ✅ 해결완료(재현 불가·stale) — 비로그인 게시글 좋아요 — UI(♥)와 DB 카운트 불일치
- **영역:** 커뮤니티/소셜 — 좋아요
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 비로그인 상태에서 좋아요 클릭 시 localStorage를 먼저 업데이트해 UI는 ♥로 변하나, Supabase RPC 호출은 RLS 권한 오류로 실패. 오류 핸들링 없어 UI와 DB 카운트가 불일치. 새로고침 시 ♡로 복귀.
- **재현:** 비로그인 → 게시글 좋아요 클릭 → ♥ 표시 → 새로고침 → ♡로 복귀
- **검증(2026-06-11, 백엔드+프론트 전수):** 증상이 현재 코드와 불일치 — ① community.html에 좋아요용 **localStorage 낙관적 업데이트 경로 없음**(localStorage는 gear_sets 전용, grep 확인). ② 피드 카드의 ❤️는 **표시 전용 `<span>`**이고 카드 클릭은 상세 모달만 오픈(`location.hash`). 좋아요 버튼(`#cm-like`)은 상세 모달에만 존재하며 **`canParticipate()` 가드**(비로그인 시 alert·DB 호출 안 함) + `r.error` 처리까지 완비(community.html:316~326). ③ 백엔드도 올바르게 제한적 — likes는 `likes_insert_own`(authenticated 전용) + GRANT INSERT가 anon에 없음. **라이브 익명 insert 검증: `POST /rest/v1/likes` → HTTP 401, 42501 permission denied**. 즉 비로그인은 UI상 누를 수 없고 DB도 차단되어 불일치가 발생하지 않음. (이전 구현 기준 리포트로, 현재 가드형 구현에서 해소) [site/community.html](site/community.html), [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)

### [M-65] ✅ 아카이브(커뮤니티/GNB 비활성화) — 게시글 상세 딥링크(공유 URL) 없음
- **영역:** 커뮤니티/소셜 — 게시글 상세
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 게시글 클릭 시 모달이 열리나 `history.pushState` 없어 URL이 변하지 않음. 특정 게시글 URL 공유 불가, 공유 버튼도 없음. M-59(계정 탭 해시)와 동일 패턴의 별도 영역 버그.
- **재현:** 게시글 클릭 → 모달 오픈 → 주소창 확인 → URL 그대로

### [M-63] ✅ 해결완료(M-108 동시 수정) — 세트 저장 후 안내 메시지 — 비로그인 시 "세트 탭" 존재하지 않아 오도
- **해결(2026-06-11):** M-108로 비로그인 시 wish-section 자체가 숨겨짐 → "찜한 N개 → 새 세트로 저장" 버튼 진입 경로 차단됨. 비로그인 사용자는 해당 버튼 미노출. [site/app.js](site/app.js), [site/account.html](site/account.html)

### [M-62] ✅ 해결완료 — 홈 검색 `?q=` URL 직접 진입 시 검색창 pre-fill 없음
- **해결(2026-06-11):** `setupHomeSearch()` 함수 끝에 `new URLSearchParams(location.search).get("q")` 읽기 추가 — 값 있으면 `inp.value` 설정 후 `run()` 호출하여 자동완성 드롭다운 표시. [site/app.js](site/app.js)
- **영역:** 검색 — 홈
- **URL:** https://www.gear-forest.com/?q=헬리녹스
- **증상:** `input#homeq` 초기값을 URL params에서 읽는 코드 없음. `?q=검색어` URL로 공유받아도 검색창이 항상 빈 칸. M-40(타이핑 시 URL 미반영)의 반대 방향 케이스.
- **재현:** `/?q=헬리녹스` 직접 접근 → homeq 입력창 빈 칸 확인

### [M-60] ✅ 해결완료 — 비교 모달 `role="dialog"` / `aria-modal` 완전 누락
- **해결(2026-06-11):** `#cmp-modal` 생성 시 `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cmp-modal-title"` 추가. 내부 `<h2>`에 `id="cmp-modal-title"` 추가. [site/app.js](site/app.js)
- **영역:** 상품상세 — 비교 기능
- **URL:** category.html → ⚖ 버튼 2개 선택 → 비교하기
- **증상:** `#cmp-modal` 및 내부 `.pmbox`에 `role="dialog"`, `aria-modal`, `aria-labelledby` 모두 없음. 주 상품 모달과 달리 비교 모달은 접근성 속성 전무.
- **재현:** ⚖ 버튼 2개 클릭 → 비교 모달 열기 → 접근성 트리 확인

### [M-57] ✅ 아카이브(커뮤니티/GNB 비활성화) — 탭바 JS 동적 삽입으로 CLS 발생 — 초기 HTML 미포함
- **영역:** 홈/메인 (성능)
- **URL:** https://www.gear-forest.com/
- **증상:** `.tabbar`가 초기 HTML에 없고 `DOMContentLoaded` 시점에 JS로 삽입됨. 헤더 렌더 → `<main>` 콘텐츠 렌더 → 탭바(약 44px) 삽입되면서 콘텐츠 전체가 아래로 밀리는 CLS 발생. Lighthouse CLS 점수 영향.
- **재현:** 홈 첫 로드 → DevTools Performance → Layout Shift 이벤트 확인

### [M-56] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 피드 30개 하드코딩 — 이후 게시글 접근 불가
- **영역:** 커뮤니티/소셜 — 피드
- **URL:** https://www.gear-forest.com/community.html
- **증상:** `listPosts`에 `limit: 30` 하드코딩. 31번째 이후 게시글은 표시되지 않고, 더 불러오기 버튼이나 무한스크롤도 없음. 끝 도달 안내도 없어 사용자가 게시글이 30개뿐인지 더 있는지 알 수 없음.

### [M-53] ✅ 해결완료(2026-06-13) — 계정 찜 탭에서 상품 카드 클릭 시 카테고리 페이지로 이탈
- **영역:** 계정/로그인 — 찜 탭
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 찜 탭의 상품 카드 클릭 시 계정 페이지 위에서 모달이 열리지 않고 `category.html?cat=...&q=상품명`으로 페이지 이동. 계정 컨텍스트 완전 이탈, 돌아오려면 Back 필요.
- **재현:** 로그인 또는 찜 있는 비로그인 상태 → account.html → 찜 탭 → 상품 카드 클릭

### [M-51] ✅ 해결완료(H-39 동시) — 홈 검색 Enter 시 브랜드 정확 매칭 우선순위 역전 — 카테고리로 잘못 이동
- **해결(2026-06-11):** H-39 수정으로 Enter 핸들러가 정확 브랜드 일치를 모델 매치보다 먼저 확인. [site/app.js](site/app.js)
- **영역:** 검색 (홈)
- **URL:** https://www.gear-forest.com/
- **증상:** 브랜드명(예: "헬리녹스") 정확 입력 후 Enter 시 `brand.html?b=헬리녹스` 대신 해당 브랜드 임의 첫 번째 상품의 카테고리(`category.html?cat=...`)로 이동. 검색 결과 코드에서 모델·브랜드 복합 매칭이 브랜드 전용 페이지보다 우선 실행됨.
- **재현:** 홈 검색창 "헬리녹스" 입력 → Enter → 브랜드 전체 페이지 아닌 카테고리 진입

### [M-40] ✅ 해결완료(2026-06-11) — 홈 검색 URL 미반영
- **해결(2026-06-11):** `run()` 내 `history.replaceState`로 `?q=검색어` URL 갱신. 드롭다운 닫히면 pathname으로 복귀. [site/app.js](site/app.js)

### [M-36] ✅ 해결완료 — 모달 열림 상태에서 body 스크롤 잠금 없음
- **해결(2026-06-11):** `style.css`에 `body:has(.pmodal.on){overflow:hidden}` 1줄 추가. CSS `:has()` 셀렉터로 JS 수정 없이 모달 열림 시 자동 스크롤 잠금. [site/style.css](site/style.css)
- **영역:** 카테고리/목록 — 상품 모달
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 상품 카드 클릭 시 `.pmodal.on`이 열려도 `body` overflow가 유지되어 모달 뒤 배경 리스트가 함께 스크롤됨. 모달 조작 중 의도치 않은 배경 스크롤 발생.
- **재현:** 카테고리 페이지 → 카드 클릭 → 모달 열린 상태에서 뒤 배경 스크롤 시도

### [M-37] ✅ 해결완료 — 존재하지 않는 상품 URL 접근 시 404 없이 홈으로 무음 리다이렉트
- **해결(2026-06-11):** `404.html` `/item/` 경로 감지 — 리다이렉트 대신 "상품을 찾을 수 없습니다" 안내 + 홈/뒤로가기 링크 노출. 레거시 category 경로 리다이렉트는 유지. [site/404.html](site/404.html)
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-99999.html
- **증상:** 잘못된 상품 번호로 직접 접근하면 404나 안내 없이 `index.html`로 리다이렉트. 공유 링크가 깨졌을 때 사용자가 이유를 알 수 없음.
- **재현:** 존재하지 않는 item URL 직접 입력 → 홈 화면 이동

### [M-38] ✅ 해결완료 — 상세 페이지에 찜/세트 추가 버튼 없음 — 카드와 기능 불일치
- **해결(2026-06-11):** `build-item-pages.js`에 "＋ 장비 꾸러미에 담기" 버튼 추가 + JS에서 `openSetModal()` 연결. 찜하기 버튼은 H-07에서 이미 추가됨. 2277개 재빌드. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 카테고리 카드에는 찜·비교 버튼이 있으나 상세 페이지에는 찜·세트 버튼이 전혀 없음. 상세 URL을 공유받은 사용자가 상세 페이지에서 찜 불가. (H-08 구매 버튼 미구현과 별도 이슈)
- **재현:** item-*.html 직접 접속 → 찜/세트 버튼 존재 확인 → 없음

### [M-31] ✅ 해결완료(사용자 확인) — 로그아웃 버튼 없음
- **해결(2026-06-11):** account.html에 로그아웃 버튼 존재 확인(사용자 직접 확인). 코드 변경 불필요.

### [M-32] ✅ 아카이브(stale·재현불가·2026-06-13) — 내 정보 영역 근처에 불필요한 그래픽/UI 요소 존재
- **처리:** 현재 account.html 코드 검토 결과 의도하지 않은 잔여 UI 요소 미발견. 탭 UI 제거(FE-SOC-07) 이후 클린업된 것으로 추정. 재현 불가.

### [M-33] ✅ 해결완료 — 데스크톱에서 카테고리 필터가 반응형으로 구현되지 않음
- **해결(2026-06-11):** `category.html`에 `#cat-layout`(flex) > `#cat-aside`(220px sticky 사이드바) + `#cat-body`(flex:1) 2단 레이아웃 추가. `style.css`에 `#cat-layout{display:flex}`, `#cat-aside{flex:0 0 220px;position:sticky;top:110px}`, `#cat-body{flex:1;min-width:0}` 추가; `@media(max-width:640px)`에서 `#cat-layout{display:block}`으로 모바일 세로 스택 복원. 로컬 프리뷰 검증 — 1200px에서 필터 사이드바·목록 2단 확인, 390px에서 세로 스택·필터 토글 버튼 정상 동작 스크린샷 확인. [site/category.html](site/category.html), [site/style.css](site/style.css)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 데스크톱 뷰에서 필터(정렬·스펙 필터 등)가 모바일 기준으로만 구현되어 있어 데스크톱 레이아웃에서도 모바일형 UI가 그대로 표시됨. 넓은 화면에 맞는 사이드바 필터 또는 가로형 레이아웃으로 전환되지 않음.
- **제보:** 사용자 직접 제보

### [M-34] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 글 상세 진입 시 document.title 미갱신
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html#post={id}
- **증상:** `renderDetail()` 실행 시 `document.title`이 '커뮤니티 — 장비의 숲'으로 고정, 글 제목으로 변경 안 됨. 브라우저 탭·히스토리·소셜 공유 미리보기에 글 제목 미반영.

### [M-35] ✅ 아카이브(커뮤니티/GNB 비활성화) — 개별 글 공유 가능한 독립 URL 없음 — hash 라우팅만 사용
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** 글 상세가 `community.html#post={uuid}` 해시로만 접근 가능. og:url·canonical이 글마다 갱신 안 돼 SNS 공유·크롤러가 글 내용 인식 불가. 공유 버튼도 없음.

### [M-28] ✅ 해결완료(기구현·2026-06-13 검증) — account.html canonical non-www vs 실제 www 불일치 (SEO)
- **처리:** 현재 canonical은 `https://gear-forest.com/account.html`(apex non-www). 사이트 서빙도 apex gear-forest.com 정규화(www→apex 301, 2026-06-11 정식화). canonical과 서빙 일치. 코드 변경 불필요.

### [M-29] ✅ 해결완료(기구현·2026-06-13 검증) — auth_error=1 파라미터 도달 시 에러 메시지 미표시 — 로그인 실패 원인 안내 없음
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html?auth_error=1
- **증상:** auth-callback.html 직접 접근 시 `account.html?auth_error=1`로 리다이렉트되지만 `#auth-error` 엘리먼트가 `display:none`이고 텍스트도 비어 있어 사용자에게 로그인 실패 원인이 전혀 표시되지 않음.

### [M-30] ✅ 해결완료(2026-06-13, SOCIAL) — 숨겨진 섹션 내 '+ 새 로그' 링크가 키보드/스크린리더로 포커스 가능 — 접근성 포커스 트랩
- **해결:** L-98 수정으로 `showLoggedInSections(false)` 호출 시 `logs-section`도 즉시 `display:none`으로 숨겨짐 → 내부 링크 포커스 불가. [site/account.html](site/account.html)

### [M-24] ✅ 해결완료(2026-06-11) — 자동완성 검색어 하이라이트 미적용
- **해결(2026-06-11):** `hlText()` 함수로 매칭 키워드를 `.shl`(accent color+bold)로 강조. 브랜드·모델명 모두 적용. [site/app.js](site/app.js), [site/style.css](site/style.css)

### [M-25] ✅ 해결완료(2026-06-11) — 자동완성 결과 개수 표시 없음
- **해결(2026-06-11):** 드롭다운 하단 `.sres-footer`에 "N개 결과 · 상위 30개" 표시 추가. [site/app.js](site/app.js), [site/style.css](site/style.css)

### [M-26] ✅ 해결완료(2026-06-11) — 검색창 커스텀 X 버튼 없음
- **해결(2026-06-11):** JS로 커스텀 X 버튼 동적 삽입. 입력값 있을 때만 표시, 클릭 시 input 초기화+드롭다운 닫기. [site/app.js](site/app.js)

### [M-27] ✅ 해결완료(2026-06-13, CORE) — search.html 전용 검색 결과 페이지 없음 — 검색어 URL 공유·북마크 불가 (SEO)
- **영역:** 검색 (SEO)
- **URL:** https://www.gear-forest.com/search.html
- **증상:** `/search.html?q=키워드` 접근 시 index.html로 리다이렉트. 검색 결과를 URL로 공유·북마크 불가. 검색엔진 인덱싱도 불가.
- **해결:** `site/search.html` 신규 생성. `setupHomeSearch()` 재사용 — `?q=` URL 복원·결과 표시 모두 기존 로직으로 처리. 인라인 스크립트에서 `?q` 감지 시 `<title>`·`<h1>` 동적 업데이트. app.js 변경 없음. [site/search.html](site/search.html)

### [M-21] ✅ 해결완료(SITE_URL 확인) — 상세 페이지 canonical URL non-www
- **해결(2026-06-11):** `build-item-pages.js` `SITE_URL = "https://gear-forest.com"` 확인. 실제 서빙도 apex 정규화됨(www→apex 301). canonical과 서빙 일치. 코드 변경 불필요.

### [M-22] ✅ 해결완료(2026-06-11) — JSON-LD aggregateRating ratingCount 오용
- **해결(2026-06-11):** `build-item-pages.js` ratingCount를 스펙 개수→1(편집 리뷰)로, reviewCount:1 추가. 2277개 상세 페이지 재생성. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-23] ✅ 해결완료(기존 코드 확인) — 상품 상세 공유 기능 없음
- **해결(2026-06-11):** openProduct() 모달에 `.pmshare` 버튼·SHARE_SVG 이미 존재. Web Share API → 클립보드 폴백 핸들러 구현됨. 코드 변경 불필요.

### [M-18] ✅ 해결완료(H-37 동시 수정) — catnav 탭 활성화 미작동
- **해결(2026-06-11):** 데스크톱 tabbar가 category.html에서 "탐색" 탭을 활성화하도록 H-37에서 수정됨. "📊비교" 오활성화 원인 해소. catnav 자체는 manifest 로드 성공 시 정상 활성화.

### [M-19] ✅ 해결완료 — 카테고리 페이지 meta description 모든 카테고리 동일한 generic 값 (SEO)
- **해결(2026-06-11):** `renderCategory()` 내 OG 메타 업데이트 블록에 `<meta name="description">` 동적 교체 1줄 추가. `"${d.count}개 모델을 정량 스펙으로 별점 비교. 실측값만 사용합니다."` 형식의 카테고리별 고유 description 설정. [site/app.js](site/app.js)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 모든 카테고리 페이지 `<meta name="description">`이 동일한 서비스 소개 문구. 카테고리별 고유 description 없어 검색 유입 최적화 불가. ([L-13] JSON-LD 부재와 SEO 문제 연관)

### [M-20] ✅ 해결완료 — 상품 상세 모달 dialog에 aria-labelledby 없음
- **영역:** 카테고리/목록 (접근성)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `role=dialog` 모달에 `aria-labelledby` 없음. 스크린 리더가 모달 제목을 안내하지 못함. 닫기 버튼에 `tabindex` 없어 키보드 포커스 순서 미보장.
- **해결(2026-06-11):** [M-46]과 동일 수정 — `.pmname`에 `id="pm-title"`, dialog에 `aria-labelledby="pm-title"` 연결로 모달 제목(상품명) 안내. 닫기 버튼(`.pmx`)은 네이티브 `<button>`이라 기본 포커스 가능하며 [H-29] 포커스 트랩으로 모달 내 순환 보장됨. [site/app.js](site/app.js)

### [M-14] ✅ 해결완료(2026-06-11) — 검색 input aria-label 없음
- **해결(2026-06-11):** `inp.setAttribute("aria-label", "장비 검색")` 추가. [site/app.js](site/app.js)

### [M-15] ✅ 해결완료(2026-06-11) — 검색창이 `<form>` 태그로 감싸지지 않아 Enter 키 제출 동작 비표준
- **해결(2026-06-11):** `index.html`의 `.homesearch` `<div>` → `<form role="search" onsubmit="return false">` 로 교체. [site/index.html](site/index.html)

### [M-24] ✅ 해결완료(2026-06-11) — 유효하지 않은 카테고리 접근 시 빈 필터바 함께 노출
- **해결(2026-06-11):** `renderCategory()` 에러 catch 블록에 `.toolbar` hide + `#sortchips` 초기화 추가. [site/app.js](site/app.js)

### [M-22] ✅ 해결완료(H-37 동시 수정) — 데스크톱 탭바 '📊비교' 탭 레이블 불일치
- **해결(2026-06-11):** H-37에서 TABS 재편 시 TABS[0]이 `label: "홈"`으로 변경되어 "📊비교" 레이블 불일치 해소. [site/app.js](site/app.js)

### [M-23] ✅ 해결완료(2026-06-11) — 비활성 nav aria-current="false" 위반
- **해결(2026-06-11):** bottom-nav `aria-current="${active ? "page" : "false"}"` → `${active ? 'aria-current="page"' : ""}` 로 수정. 비활성 항목은 속성 생략. [site/app.js](site/app.js)

### [M-16] ✅ 해결완료(H-37 동시 수정) — 상단 탭바 홈 탭 레이블 불일치
- **해결(2026-06-11):** H-37에서 TABS[0] label="홈"으로 수정됨. 데스크톱 TABS와 모바일 탭 모두 "홈"으로 일치. [site/app.js](site/app.js)

### [M-17] ✅ 해결완료(2026-06-11) — 상단 탭바 nav aria-label 없음
- **해결(2026-06-11):** `nav.setAttribute("aria-label", "주 내비게이션")` 추가. [site/app.js](site/app.js)

### [M-12] 커뮤니티 페이지 '불러오는 중' 지연 — 피드 렌더가 인증에 묶임 + posts 중복 호출 ✅ 수정됨(2026-06-11)
- **관련 제보:** '커뮤니티 누르면 불러오는 중만 뜸' → 미개발 아님. 피드(공개 데이터)가 인증 완료를 기다리느라 로딩이 길게 보였던 구조 문제.
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **근본 원인 (2가지):**
  1. `community.html` 부팅이 `await initAuth(...)` 콜백 안에서만 `route()`→`renderFeed()`를 호출. 즉 jsdelivr CDN의 supabase-js 다운로드·파싱 → `getSession()` 완료까지 끝나야 비로소 `listPosts()`가 실행됨. 그 전 구간 내내 "불러오는 중" 표시. (supabase-js를 안 쓰는 다른 페이지가 빠른 이유 = 커뮤니티만 느린 이유.)
  2. `initAuth()`가 수동 `'INITIAL'` 콜백 + `onAuthStateChange INITIAL_SESSION` 이벤트로 콜백을 2회 호출 → `/rest/v1/posts`가 페이지 로드마다 2회 발생.
- **수정:**
  - 부팅 시 `route()`를 먼저 1회 호출해 공개 피드를 즉시 렌더(인증 대기 제거).
  - 인증은 병렬 확인하되 `canParticipate()`가 실제로 바뀐 경우에만 재렌더 → 콜백 2회·토큰 갱신에도 중복 fetch 없음.
  - `<head>`에 supabase·jsdelivr `preconnect` + `supabaseClient.js` `modulepreload` 추가로 연결 설정 지연 단축.
- **검증:** 프리뷰 재현 — `/rest/v1/posts` 요청 **2회 → 1회**, 콘솔 에러 0, 피드 즉시 렌더(빈 상태 정상 표시).

### [M-13] ✅ 아카이브(커뮤니티/GNB 비활성화) — empty state에서 글쓰기 CTA 없음 — 비로그인·로그인 모두 해당
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** '아직 글이 없어요. 첫 이야기를 남겨보세요!' 문구에 클릭 가능한 글쓰기 버튼/링크 없음. 글쓰기 버튼은 `canParticipate()`가 true인 사용자의 `cm-bar`에만 렌더링되어, empty state에서는 로그인 사용자도 글쓰기로 이동 불가. *(구 [M-13]: 비로그인 케이스 → 로그인 포함으로 확장)*
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 글 없을 때 '첫 이야기를 남겨보세요!' 문구가 표시되지만 비로그인 사용자에게는 글쓰기 버튼이 없어 액션 불가. 로그인 유도 없이 단순 권유 문구만 표시.

### [M-09] ✅ 해결완료(2026-06-13) — 로그인 후 프로필 영역에 실제 이메일 주소 노출 — 개인정보
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `renderProfile()`이 `profile.email`을 UI에 직접 렌더링. 코드 주석에 '실명/이메일을 표시명으로 쓰지 않는다'고 명시되어 있음에도 이메일이 노출됨.

### [M-10] ✅ 해결완료(H-37 동시 수정) — 탭바 메뉴 구성 불일치
- **해결(2026-06-11):** H-37에서 데스크톱 TABS에 "탐색" 탭 추가. 데스크톱 4개(홈/탐색/커뮤니티/내 정보), 모바일 4개(홈/탐색/커뮤/마이) 구성 일치. [site/app.js](site/app.js)

### [M-11] ✅ 해결완료(2026-06-13) — login.html 접근 시 '서비스 점검 중' 텍스트만 반환
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/login.html
- **증상:** 별도 로그인 URL로 직접 접근 시 아무런 안내 없이 비어 보이는 점검 페이지 표시. 리다이렉트나 안내 링크 없음.
- **해결:** `site/login.html` 신규 생성 — `<meta http-equiv="refresh" content="0;url=account.html">` + canonical 태그로 account.html 즉시 리다이렉트. [site/login.html](site/login.html)

### [M-05] ✅ 해결완료(2026-06-11) — 상세 페이지 커뮤니티 로그 연결 버튼 없음
- **해결(2026-06-11):** `build-item-pages.js`에 `.item-log-btn` 링크 추가됨. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-07] ✅ 해결완료(2026-06-11) — 모바일(375px)에서 상세 hero 섹션 레이아웃 미반응형
- **해결(2026-06-11):** `@media(max-width:480px){.item-hero{flex-direction:column}...}` 추가됨. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-08] ✅ 해결완료(2026-06-11) — 상세 페이지 이미지 403/503 오류 + fallback 없음
- **해결(2026-06-11):** `.item-img` 태그에 `onerror="this.onerror=null;this.style.display='none'"` 추가. 이미지 로드 실패 시 깨진 아이콘 대신 요소 숨김 처리. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-02] ✅ 해결완료(2026-06-12) — 모바일(375px)에서 스펙 레이블이 줄바꿈되어 카드 높이 불균일
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** '내한온도(ISO하한)' 같은 긴 스펙 레이블이 모바일에서 줄바꿈되어 카드 높이가 90px까지 늘어남. 셀 너비 제한(113~183px)으로 인한 wrapping.
- **해결:** `.pli-spec i`에 `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:10em` 추가. [site/style.css](site/style.css)

### [M-03] ✅ 해결완료(2026-06-12) — 모바일에서 카테고리 서브탭(catnav)이 잘려 일부 탭 미표시
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 모바일 375px에서 가로 탭바가 화면 너비를 초과해 뒷 탭들이 잘림. 스크롤 가능 여부가 시각적으로 불분명.
- **해결:** `.catnav-wrap::after` 그라디언트 페이드(오른쪽) 추가로 스크롤 가능 시각 힌트 제공. [site/style.css](site/style.css)

### [M-04] ✅ 해결완료(2026-06-11) — breadcrumb가 '홈 › …'으로 표시됨 (데이터 로드 실패 시)
- **해결(2026-06-11):** `renderCategory()` 에러 catch 블록에 `crumbName.textContent = slug` 추가. [site/app.js](site/app.js)

### [M-01] ✅ 해결완료(M-100 동시) — '오토/맥시멀'과 '4인 가족' 캠핑 스타일 카드가 동일한 URL
- **해결(2026-06-11):** M-100 수정으로 family → recommend.html?p=family 분리. [site/app.js](site/app.js)
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션
- **URL:** https://www.gear-forest.com/
- **증상:** 두 카드 모두 `category.html?cat=auto-tent&sort=spec%3Afloor_area&sa=0&cap=4` 로 연결. 다른 컨셉임에도 URL이 동일하여 4인 가족 전용 필터가 없거나 URL 설정 누락으로 보임.

### [M-79] ✅ 해결완료(2026-06-11) — 비교 모달 상세 페이지 링크 없음
- **해결(2026-06-11):** 비교 모달 각 상품 컬럼에 `STATE.data.models.indexOf(m)` 인덱스 기반 `/item/{cat}/item-N.html` "상세 페이지 →" 링크 추가. [site/app.js](site/app.js)

### [M-80] ✅ 해결완료(2026-06-11) — 홈 검색 aria-live 누락
- **해결(2026-06-11):** `aria-live="polite" aria-atomic="true"` SR 전용 hidden span 삽입, 결과 변화 시 "N개 결과" / "결과 없음" 텍스트 업데이트. [site/app.js](site/app.js)

### [M-81] ✅ 해결완료(2026-06-11) — 카테고리 #q 접근성 누락
- **해결(2026-06-11):** `#q` 초기화 시 `aria-label`, `role="searchbox"`, `aria-autocomplete="list"` 추가. [site/app.js](site/app.js)

### [M-82] ✅ 해결완료(기존 코드 확인) — 홈 검색 ?q= 파라미터 복원
- **해결(2026-06-11):** `setupHomeSearch()` 말미 `const initQ = new URLSearchParams(location.search).get("q"); if (initQ) { inp.value = initQ; run(); }` 이미 구현됨. 코드 변경 불필요.

### [M-83] ✅ 해결완료(M-108 동시 수정) — 비로그인 시 찜·세트 섹션이 가림 없이 로그인 CTA와 동시 노출
- **해결(2026-06-11):** M-108 수정으로 `account.html` 초기 `display:none` + `renderAccount()` 비로그인 분기 강화 + `showLoggedInSections(false)` 추가. 비로그인 시 `wish-section`·`sets-section`·`acc-tabs` 모두 숨김. [site/account.html](site/account.html), [site/app.js](site/app.js)
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html
- **증상:** 비로그인 상태에서 `auth-section`(로그인 CTA)과 `wish-section`·`sets-section`이 모두 `display:block`으로 동시 표시됨. 사용자는 로그인 없이 찜·세트 관리가 가능한 것으로 오인할 수 있으며, 로그인 전후 UI 구분이 없음.
- **재현:** 비로그인 → `account.html` → 로그인 CTA + 찜/세트 목록 동시 노출 확인

### [M-84] ✅ 아카이브(FE-SOC-07 탭→섹션 전환으로 moot) — 계정 페이지 섹션 전환에 탭 ARIA 구조 미구현 — `role="tab"` 전혀 없음
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html
- **증상:** 찜/세트/로그/설정은 탭 구조로 설계됐으나 DOM에 `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` 속성이 전혀 없음. 섹션이 탭으로 전환되지 않고 수직 나열. 스크린리더 사용자는 탭 구조를 인식하지 못함.
- **재현:** `account.html` DOM 검사 → `[role="tab"]` 0개 확인

### [M-85] ✅ 해결완료(2026-06-13, SOCIAL) — 설정 탭에 PWA 설치 버튼 없음 — `beforeinstallprompt` 억제 후 진입점 부재
- **해결:** settings-section에 `#pwa-install-row` 추가(`display:none` 기본). account.html에서 독립적으로 `beforeinstallprompt` 캡처 → 버튼 표시 → 클릭 시 `prompt()` 호출. `appinstalled` 이벤트 시 버튼 숨김. [site/account.html](site/account.html)

### [M-86] ✅ 아카이브(커뮤니티/GNB 비활성화) — `?open-log=1` 비로그인→로그인 경유 시 원클릭 흐름 단절 — H-35 엣지케이스
- **영역:** 커뮤니티/소셜 — open-log 원클릭 연결
- **URL:** https://gear-forest.com/community.html?open-log=1&set=0
- **증상:** 비로그인 상태에서 `open-log=1` 진입 후 `account.html`로 이동해 로그인하면, 커뮤니티 JS 컨텍스트가 소멸되고 복귀 시 파라미터가 없어 글쓰기 폼이 열리지 않음. H-35는 "해결완료"로 기록되어 있으나, 비로그인→로그인 경유 경로는 여전히 단절됨. 로그인 후 리다이렉트 URL에 `?open-log=1` 파라미터를 포함해야 복원 가능.
- **재현:** 비로그인 → `community.html?open-log=1` → 로그인 클릭 → `account.html` → 로그인 완료 → 커뮤니티 복귀 → 글쓰기 폼 미열림

### [M-87] ✅ 해결완료(2026-06-11) — "이번 주 인기" API 200 응답임에도 항상 fallback
- **해결(2026-06-11):** `data.length >= 3` → `>= 1`, 카테고리 필터 `items.length >= 2` → `>= 1`로 완화. 저트래픽 단계에서도 실제 클릭 데이터 노출. [site/app.js](site/app.js)

### [M-88] ✅ 해결완료 — 쿠팡 파트너스 파트너 공시 미표시 — 제휴 의무 미이행
- **해결(2026-06-11):** 홈·카테고리·브랜드·추천 페이지 푸터에 `.disc` 클래스로 "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다." 추가. 상세 모달(`pmbuynote`)은 기존 적용. [site/app.js](site/app.js), [site/style.css](site/style.css)
- **영역:** 홈/메인 — 푸터 (전체 페이지)
- **URL:** https://gear-forest.com/
- **증상:** 쿠팡 파트너스(AF6034597) 제휴 링크를 포함한 서비스에서 "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다" 문구 또는 동등 공시가 전혀 없음. 쿠팡 파트너스 운영정책·공정거래위원회 추천·보증 고시상 의무 사항.
- **재현:** 사이트 전체 푸터·상품 카드·상세 모달 어디에도 파트너스 공시 문구 없음

### [M-89] ✅ 해결완료 — 프리셋 전환 시 `comfort_temp`·`brands` URL 파라미터 미초기화 — M-68 미해결 잔여
- **해결(2026-06-11):** `clearPresetFilters()`를 `STATE.range = {}; STATE.brands.clear(); STATE.campStyle = ""; STATE.cap = "";`으로 확장. 모든 range 필터(comfort_temp 포함)·brands·campStyle까지 초기화하여 프리셋 전환 시 이전 필터 누적 방지. M-101(campStyle 잔존)도 동시 해결. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 필터바 빠른 설정
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag
- **증상:** M-68 수정으로 무게·가격·cap은 `clearPresetFilters()`로 초기화되지만, `comfort_temp__max`·`brands` URL 파라미터는 삭제 대상에 포함되지 않아 해당 필터를 설정한 채 프리셋 전환 시 여전히 누적됨. 또한 프리셋 버튼 클릭 후 `.on` 클래스가 부여되지 않아 어떤 프리셋이 활성화됐는지 시각적으로 알 수 없음.
- **재현:** 내한온도·브랜드 필터 설정 후 프리셋 클릭 → URL에 `comfort_temp__max`·`brands` 잔존, 버튼에 `.on` 없음

### [M-90] ✅ 해결완료 — 상세 페이지 JSON-LD `availability: InStock`이지만 구매 버튼은 disabled — SEO 오신호
- **해결(2026-06-11):** `build-item-pages.js` JSON-LD offers.availability를 `coupang_url` 존재 여부에 따라 InStock / PreOrder로 분기. 쿠팡 링크 없는 상품은 `PreOrder`로 표시. 2277개 재빌드. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **영역:** 상품 상세
- **URL:** https://gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 구조화 데이터(`application/ld+json`) `Product.offers.availability`가 `https://schema.org/InStock`으로 선언되어 있으나 실제 구매 버튼은 `disabled aria-disabled="true"` 상태에 "구매 링크를 준비 중입니다." 문구. Google 리치 결과에서 "재고 있음"으로 표시되어 Search Console 경고 및 사용자 오인 유발.
- **재현:** 상세 페이지 소스의 `ld+json` 블록 확인 → `"availability":"InStock"` + 구매 버튼 `disabled` 상태 동시 확인

### [M-91] ✅ 해결완료(M-38 동시 수정) — 상세 페이지 장비 꾸러미 담기 버튼 없음
- **해결(2026-06-11):** M-38 수정에서 `build-item-pages.js`에 `<button id="item-set-add" class="item-set-btn">＋ 장비 꾸러미에 담기</button>` 추가. 2277개 상세 페이지에 버튼 생성됨. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-92] ✅ 아카이브(stale·H-19/H-28 해소 후 재현불가) — SW 스크립트 404 에러 — 매 페이지 로드 시 콘솔에 반복 발생
- **영역:** 상품 상세 (전체 페이지 공통)
- **URL:** https://gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 페이지 로드 시 "A bad HTTP response code (404) was received when fetching the script." 에러가 콘솔에 발생. SW(`sw.js`)가 이미 삭제된 경로의 스크립트를 프리캐시 시도하는 것으로 추정. H-19/H-28 관련 잔여 이슈.
- **재현:** 상세 페이지 접속 → DevTools 콘솔 → SW 스크립트 404 에러 확인

### [M-93] ✅ 해결완료 — 홈 검색에서 `#` 포함 검색어 입력 시 결과 없음 — 토크나이저 `#` 미처리
- **해결(2026-06-11):** `setupHomeSearch()` `run()` 함수에서 단일 `includes(q)` → 공백 분리 토큰 AND 매칭으로 변경. `q.split(/\s+/).filter(Boolean)` 후 `terms.every(t => text.includes(t))` 적용. "몽벨 #7" → terms=["몽벨","#7"] → 브랜드+모델명 모두 포함 시 히트. [site/app.js](site/app.js)
- **영역:** 검색 — 홈 전역 검색
- **URL:** https://gear-forest.com/
- **증상:** "다운허거 #7", "몽벨 #7" 등 `#` 기호 포함 검색어 입력 시 결과 없음. `#` 제외 검색어("다운허거 800")로는 동일 모델이 정상 표시됨. 검색 토크나이저가 `#` 문자를 처리하지 못해 실제 존재하는 모델을 찾지 못함.
- **재현:** 홈 검색창 → "다운허거 #7" 입력 → 결과 없음 / "다운허거 800" 입력 → 결과 정상

### [M-94] ✅ 해결완료(2026-06-11) — 카테고리명 Enter 시 오이동
- **해결(2026-06-11):** Enter 핸들러에 카테고리명 정규화 일치 체크 추가. 브랜드 정확 일치 → 카테고리명 일치(M-94) → 모델 매치 순으로 라우팅. "침낭" → `category.html?cat=sleeping-bag`. [site/app.js](site/app.js)

### [M-95] ✅ 해결완료 — 세트 없을 때 `#sets-section` 완전 숨김 — 빈 상태 안내 없음
- **해결(2026-06-11):** `sets.length &&` 조건 제거하여 로그인 + activeTab==="sets"이면 섹션 항상 표시. `sets.length === 0`일 때 "아직 만든 세트가 없어요" 빈 상태 HTML 렌더링 추가. [site/app.js](site/app.js)
- **영역:** 계정/로그인 — 세트 탭
- **URL:** https://gear-forest.com/account.html
- **증상:** `gear_sets`가 비어있으면 `#sets-section` 전체가 `display:none`으로 숨겨짐. 찜 섹션에는 "아직 찜한 상품이 없어요" 빈 상태 안내가 있으나 세트 섹션은 섹션 자체가 사라져 사용자가 세트 기능 존재를 알 수 없음.
- **원인:** `app.js` — `setsSec.style.display = (sets.length && ...) ? "block" : "none"`
- **재현:** `localStorage.removeItem('gear_sets')` 후 `account.html` 새로고침 → 세트 섹션 완전 사라짐

### [M-96] ✅ 해결완료(H-39 동시 수정) — `auth_error=1` 에러 메시지가 `initAuth` 콜백에 즉시 덮어써져 표시 안 됨
- **해결(2026-06-11):** `account.html` — `authErrorParam` 플래그 도입, `initAuth(user=null)` 분기에서 `authErrorParam` 참이면 `renderLogin()` 호출 건너뜀. 2초 setTimeout이 에러 메시지 유지 후 renderLogin 처리.
- **영역:** 계정/로그인 — OAuth 오류 처리
- **URL:** https://gear-forest.com/account.html?auth_error=1
- **증상:** `auth-callback.html` 실패 후 `auth_error=1` 파라미터로 리다이렉트 시 에러 메시지 삽입 직후 `initAuth` 콜백이 `user=null`로 `renderLogin()`을 즉시 호출해 덮어씀. 오류 메시지가 표시되지 않고 일반 로그인 화면만 나타남.
- **원인:** `account.html` 에러 삽입 직후 `initAuth` 콜백이 선행 실행 순서 없이 덮어씀
- **재현:** `account.html?auth_error=1` 접근 → 오류 메시지 없이 일반 로그인 UI만 표시

### [M-97] ✅ 아카이브(커뮤니티/GNB 비활성화) — `#post=비UUID` 접근 시 Supabase UUID 파싱 에러 코드 콘솔 노출
- **영역:** 커뮤니티/소셜 — 글 상세
- **URL:** https://gear-forest.com/community.html#post=99999
- **증상:** UUID 형식 검증 없이 raw 문자열을 Supabase에 전달. 400 응답과 함께 콘솔에 `{code: 22P02, message: invalid input syntax for type uuid: "99999"}` DB 내부 에러가 노출됨. UI는 "글을 찾을 수 없어요"를 표시하나 내부 오류 코드/타입 정보가 노출됨.
- **재현:** `community.html#post=99999` 접속 → 콘솔 확인 → Supabase 22P02 에러 확인

### [M-98] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 피드 최신 30건 이후 페이지네이션·무한스크롤 없음
- **영역:** 커뮤니티/소셜 — 피드
- **URL:** https://gear-forest.com/community.html
- **증상:** `renderFeed()`가 `listPosts({ limit: 30 })`을 1회만 호출. "더 보기" 버튼이나 무한스크롤 없어 글이 30개를 초과하면 초과분이 영구적으로 보이지 않음. `listPosts`에는 `before` 커서 파라미터가 이미 구현되어 있으나 UI에서 미활용.
- **재현:** DB에 글 31개 이상 존재 → 피드 최하단까지 스크롤 → 추가 로드 없음

### [M-99] ✅ 아카이브(커뮤니티/GNB 비활성화) — 댓글 수 헤더(상세)와 피드 카드 `💬` 카운트 값 불일치 가능
- **영역:** 커뮤니티/소셜 — 글 상세 + 피드
- **URL:** https://gear-forest.com/community.html#post=<id>
- **증상:** 피드 카드 `💬 N`은 DB `comment_count`(트리거 관리)를 사용하나, 상세 페이지 "댓글 N" 헤더는 JS 배열 `.length`(현재 쿼리 결과)로 렌더링. 소프트 삭제 댓글 존재 등 상황에서 두 숫자가 다르게 표시됨. H-34(소프트삭제 count 불감소)와 연관.
- **재현:** 소프트 삭제 댓글 있는 글 → 피드 카드 `💬` 수 vs 상세 "댓글 N" 비교

---

## 🟢 Low

### [H-23] ✅ 해결완료(UI·코드, 백엔드 배포 검증 권장) — 계정삭제 UI 부재
- **영역:** 계정/로그인 (법적 컴플라이언스)
- **URL:** https://gear-forest.com/account.html
- **증상:** `delete-account` Supabase 엣지함수와 RPC는 구현되어 있으나 account.html에 삭제 버튼·UI가 전혀 없음. privacy.html은 "계정 삭제 링크"를 안내하는데 실제 UI 없어 모순. Google OAuth API 정책·개인정보보호법상 계정 삭제 기능 UI 노출 의무.
- **이전:** L-19에서 승격
- **해결(검증 2026-06-11):** account.html 로그인 영역에 `#btn-delete-account` 존재 — 2단계 `confirm`(파괴적·30일 쿨다운 경고) 후 `deleteAccount()`(supabaseClient) → `supabase.functions.invoke('delete-account')` 호출, 성공 시 `signOut()`+localStorage(wish·gear_sets) 정리·홈 이동. privacy.html §6도 "내 정보 → 계정 삭제"로 일치(모순 해소). Edge 함수 `supabase/functions/delete-account/index.ts`는 JWT 검증 → `delete_account_atomic` RPC(프로필 익명화+게시글 소프트삭제) → `auth.admin.deleteUser` 물리삭제로 구현됨. ⚠️ **남은 확인:** Edge 함수의 라이브 배포(`supabase functions deploy delete-account`)와 `delete_account_atomic` RPC의 라이브 적용 여부는 파괴적이라 미검증 — 실제 탈퇴 1건으로 e2e 확인 필요. [site/account.html](site/account.html) · [supabase/functions/delete-account/index.ts](supabase/functions/delete-account/index.ts)

### [H-24] ✅ 해결완료(라이브 검증) — Supabase 국외 개인정보 이전 고지 누락
- **영역:** privacy.html (법적 컴플라이언스)
- **URL:** https://gear-forest.com/privacy.html
- **증상:** Supabase(미국 서버)로 이메일·닉네임·찜목록·게시글이 이전됨에도 privacy.html에 국외이전 고지(이전 국가·항목·기간·거부방법)가 없음. 개인정보보호법 제28조의8에 따라 국외이전 시 정보주체 고지 또는 동의 의무.
- **해결(라이브 검증 2026-06-11):** privacy.html §5 "개인정보 처리 위탁 및 국외 이전"에 제28조의8 근거·이전받는 자(Supabase Inc.)·이전 국가(미국)·이전 항목·목적·보유기간·**거부 방법**까지 표로 완비. 라이브 `curl https://gear-forest.com/privacy.html`에서 "개인정보 처리 위탁 및 국외 이전"·"제28조의8"·"Supabase Inc" 확인. [site/privacy.html](site/privacy.html)

### [H-25] ✅ 부분해결(제휴 고지 존재) — 쿠팡 어필리에이트 고지
- **영역:** privacy.html / terms.html (법적 컴플라이언스)
- **URL:** https://gear-forest.com/terms.html
- **증상:** 쿠팡 파트너스(어필리에이트) 링크 클릭 시 추적 쿠키·파라미터가 수집됨에도 privacy.html에 제3자 어필리에이트 추적에 대한 언급이 0건. 한국 개인정보보호법(제3자 제공·위탁) 및 공정위 추천보증지침상 고지 필요. 또한 어필리에이트 관계는 링크 바로 옆에 상시 표시해야 함('더보기' 내부 고지는 부적격).
- **해결(라이브 검증 2026-06-11):** terms.html §1·§5 "제휴(어필리에이트) 고지"에 "쿠팡 파트너스 등 제휴 활동…수수료를 제공받을 수 있으며…추천 순위·객관성에 영향 없음" 명시(라이브 curl 확인). 공정위 추천보증지침의 핵심(제휴 관계·대가성 고지)은 충족. ⚠️ **남은 권장(현재 비차단):** 쿠팡 구매 링크는 H-14로 **현재 비활성(disabled)**이라 활성 추적이 없음 — 추후 구매 링크 활성화 시 ① 링크 바로 옆 상시 "쿠팡 파트너스 활동의 일환…" 문구, ② privacy.html에 어필리에이트 쿠키 수집 고지 추가 필요. [site/terms.html](site/terms.html)

### [H-26] ✅ 해결완료(라이브 검증) — terms.html(이용약관) 미존재 + UGC 약관 동의
- **영역:** 전체 서비스 (법적 컴플라이언스)
- **URL:** https://gear-forest.com/terms.html
- **증상:** 서비스 이용약관 페이지(`terms.html`) 자체가 없음. 커뮤니티에 UGC(글·사진)를 게시하는 플로에서 약관 동의 UI 없이 바로 제출 가능. 정보통신망법 제23조 및 콘텐츠산업진흥법상 이용약관 명시 의무.
- **해결(라이브 검증 2026-06-11):** terms.html 존재·라이브 서빙(curl 200). 내용: §1 서비스 성격, §2 금지 콘텐츠(아동 성착취물 무관용·삭제·신고 포함 — Google Play/앱 정책 대응), §3 신고·차단·제재, §4 UGC 권리·책임, §5 제휴 고지, §6 면책, §7 문의, §8 변경. **약관 동의 간주 문구** 명시("회원가입 또는 콘텐츠 작성 시 본 약관에 동의한 것으로 봅니다"). 푸터(전 페이지)·privacy.html에서 상호 링크. ⚠️ 잔여(저영향): 글쓰기 폼에 명시적 동의 체크박스는 없음(동의 간주 방식) — 필요 시 후속. [site/terms.html](site/terms.html)

### [H-29] ✅ 해결완료 — 상품 상세 모달 포커스 트랩 미구현 — Tab 키로 모달 밖 탈출
- **영역:** 상품상세 (접근성)
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent → 상품 카드 클릭
- **증상:** 모달 내 마지막 포커스 가능 요소(상세 페이지 링크)에서 Tab 누르면 포커스가 BODY로 탈출. `aria-modal="true"` 선언은 있으나 JS 포커스 트랩 미구현. 스크린리더 사용자가 모달 뒤 배경 콘텐츠로 이탈하는 문제.
- **재현:** 상품 모달 열기 → Tab 6회 연속 → `document.activeElement`가 `BODY`
- **관련:** WCAG 2.1 SC 2.1.2 (No Keyboard Trap)
- **해결(2026-06-11):** `openProduct()`의 `onKey` 핸들러에 Tab 포커스 트랩 추가. 모달(`.pmbox`) 내 포커스 가능 요소를 수집해, 마지막 요소에서 Tab → 첫 요소로, 첫 요소에서 Shift+Tab → 마지막 요소로 순환(`e.preventDefault()`). 기존 Escape·열 때 첫 버튼 포커스·닫을 때 복귀는 유지. 로컬 프리뷰 검증 — 모달 포커스 5개, 마지막('🔗 상세 페이지')에서 Tab→'닫기'로, 첫('닫기')에서 Shift+Tab→마지막으로 순환 확인. [site/app.js](site/app.js)

### [H-30] ✅ 해결완료 — `item/` 경로 직접 접근 시 ERR_TOO_MANY_REDIRECTS
- **영역:** 상품상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 모달 내 "🔗 상세 페이지(공유·즐겨찾기용)" 링크를 직접 URL로 접근하면 리다이렉트 루프 발생. 공유/즐겨찾기 기능으로 명시적으로 노출된 링크가 완전 불능.
- **재현:** 상품 모달 → 상세 페이지 링크 복사 → 새 탭에서 직접 접근
- **해결(2026-06-11):** [H-28]과 동일 근본원인(SW가 www→apex 301 리다이렉트 응답을 캐싱 → 캐시 히트 시 redirect 루프). [H-28] 수정(리다이렉트 응답 캐싱 금지 + CACHE 무효화 `camping-11b6a30a`)으로 해소. 검증 — 라이브 apex `item/backpacking-tent/item-52.html` 직접 접근 시 200·정상 제목('니모이큅먼트 호넷 엘리트 오스모 1P …') 렌더, 리다이렉트 루프 없음(curl·실브라우저 확인). [site/sw.js](site/sw.js)

### [H-32] ✅ 해결완료 — 상품 모달 `.pmbox` `max-height` 없어 뷰포트 초과 — 하단 버튼 잘림
- **영역:** 상품상세 모달
- **URL:** category.html → 상품 카드 클릭
- **증상:** `.pmbox`에 `overflow-y:auto`는 있으나 `max-height`가 `none`이어서 내용이 많은 상품의 모달이 뷰포트를 초과해도 스크롤 영역이 생기지 않음. 844px 뷰포트 기기에서 모달 height 856px → 하단 제보 버튼 등이 화면 밖으로 밀림. iOS Safari에서 하단 버튼 완전히 접근 불가.
- **재현:** 모바일 뷰포트(390px×844px)에서 스펙 항목 많은 상품 모달 열기 → 하단 버튼 잘림 확인
- **원인(2026-06-11):** 모바일 미디어쿼리에서 `.pmbox{max-height:none}`가 base의 `max-height:90vh`를 덮어씀. `.pmodal`이 `position:fixed`라 모달이 뷰포트를 넘쳐도 내부 스크롤이 안 생겨 하단 버튼이 화면 밖으로 잘림.
- **해결:** 모바일 `.pmbox`의 `max-height:none`을 `calc(100dvh - 88px - env(safe-area-inset-bottom))`로 교체(상14+하72 패딩 제외, vh 폴백 동반). `overflow-y:auto`와 결합해 모달이 뷰포트 안에 갇히고 내부 스크롤로 하단 버튼 도달 가능. 로컬 프리뷰 검증(375×812) — 모달 height 724px·뷰포트 내 fit, 내부 스크롤(scrollHeight 841>client 724), 스크롤 시 하단 '오류 신고' 버튼 완전 노출·콘솔 에러 없음. [site/style.css](site/style.css)

### [H-34] ✅ 해결완료(라이브 적용) — 커뮤니티 댓글 소프트삭제 → `comment_count` 불감소 (DB 트리거 미스매치)
- **해결확인(2026-06-11):** `APPLY-NOW.sql` 한 트랜잭션에 015 포함, COMMIT 성공(동일 txn의 get_hot_items가 라이브 200) = 트리거 `trg_comment_count`가 `UPDATE OF deleted_at`까지 반영하도록 교체됨 + 기존 드리프트 재집계 완료. 이후 댓글 소프트삭제 시 💬 카운트 정상 감소.
- **영역:** 커뮤니티/소셜 — 댓글
- **증상:** `trg_comment_count` 트리거는 `AFTER INSERT OR DELETE`에만 반응하나, 앱이 댓글 삭제를 `deleted_at = now()`로 UPDATE 처리. UPDATE는 트리거가 감지 못해 `comment_count`가 감소하지 않고 누적 증가. DB 정합성 오류.
- **재현:** 로그인 → 댓글 작성 → ✕로 삭제 → 게시글 카드 💬 카운트 확인 — 감소 없음
- **원인(2026-06-11, 라이브 검증):** anon 키로 `comments?select=id,parent_id,deleted_at` → **HTTP 200**(컬럼 존재) = 라이브 comments는 **001/002 스키마**(`body`·`parent_id`·`hidden`). 따라서 활성 트리거는 002 `update_comment_count`(root만, INSERT/DELETE)이고 소프트삭제 UPDATE는 미처리 → 증상 그대로. `009_comments.sql`은 `content` 컬럼의 **비호환 재정의**라 적용된 적 없는 dead migration(`CREATE TABLE IF NOT EXISTS` no-op).
- **수정(코드):** 신규 `015_comment_count_softdelete.sql` — ① `update_comment_count()`를 `UPDATE OF deleted_at`까지 처리하도록 확장(root 한정·삭제글 제외, 소프트삭제 −1·복원 +1 대칭). ② 트리거를 `AFTER INSERT OR DELETE OR UPDATE OF deleted_at`로 재생성. ③ 기존 누적 드리프트 1회 재집계(살아있는 root 댓글 수로 동기화). ④ 혹시 적용됐을 009의 중복 트리거(`trg_inc/dec_comment_count`) 안전 제거. + 009 상단에 적용금지 경고, APPLY.md에 5단계·검증 추가. [supabase/migrations/015_comment_count_softdelete.sql](supabase/migrations/015_comment_count_softdelete.sql), [supabase/migrations/009_comments.sql](supabase/migrations/009_comments.sql), [supabase/APPLY.md](supabase/APPLY.md)
- **라이브 적용(2026-06-11):** SQL Editor에서 `015` 실행 완료. 댓글 소프트삭제 시 💬 카운트 정상 감소 + 기존 드리프트 재집계 완료.

### [H-35] ✅ 해결완료 — `community.html?open-log=1&set=N` 파라미터 처리 누락 — 원클릭 연결 기능 미동작
- **영역:** 커뮤니티/소셜 — 글쓰기 연동
- **URL:** https://www.gear-forest.com/community.html?open-log=1&set=0
- **증상:** account.html 세트 상세 → "커뮤니티에 공유" 버튼이 `community.html?open-log=1&set=N`으로 이동시키지만, community.html DOMContentLoaded에서 `open-log` 파라미터를 읽는 코드가 전혀 없어 글쓰기 모달이 자동으로 열리지 않음. 의도된 원클릭 연결 기능(커밋 a95b92a)이 절반만 구현된 상태.
- **재현:** account.html → 세트 상세 → "커뮤니티에 공유" 클릭 → 글쓰기 모달 미오픈
- **원인(2026-06-11):** community.html `route()`는 해시(`#new`)만 처리하고 `open-log`/`set` 쿼리는 미처리. 인증이 비동기 확정(초기 `canParticipate()=false`)이라 단순 init 처리로는 비로그인 분기(renderCompose가 해시 클리어)에 막힘.
- **해결:** community.html에 `open-log` 처리 추가 — 진입 시 파라미터 캡처+URL 정리(replaceState로 새로고침 중복 방지), `tryOpenLog()`를 **initAuth 콜백(인증 확정 후)** 에서 호출해 `canParticipate()` 시 `renderCompose()` 자동 오픈. `set=N`이면 localStorage `gear_sets[N]`의 장비를 제목·본문에 미리 채움(글자수 카운터 갱신). 로컬 프리뷰 검증 — `?open-log=1&set=0` 진입 시 URL 정리·무크래시, 비로그인 시 컴포즈 미오픈(가드 정상), prefill 포맷 정확("백패킹 1박 공유" / "· 헬리녹스 체어원 / · 니모 호넷 1P ×2"), 콘솔 에러 없음. [site/community.html](site/community.html)

### [H-33] ✅ 해결완료 — 세트 공유 링크 수신 모달 완전 미동작 — dead code
- **영역:** 계정/로그인 — 세트 공유
- **URL:** https://www.gear-forest.com/account.html?view-set=<BASE64>
- **증상:** 세트 공유 링크를 받아 직접 접근해도 "공유된 세트" 모달이 열리지 않음. `app.js`의 view-set 처리 코드가 `document.getElementById("acc-section")` 존재 여부를 가드로 사용하는데, `account.html`에는 해당 ID가 없어(`auth-section`은 존재) 처리 분기 자체에 진입 못 함. 세트 공유 수신 기능 전체가 dead code.
- **재현:** account.html에서 세트 공유 링크 복사 → 새 탭에서 해당 URL 직접 접근 → 모달 미표시
- **원인(2026-06-11):** view-set 핸들러 가드가 존재하지 않는 ID `acc-section`을 검사 → 항상 false → 분기 미진입. account.html의 실제 섹션 ID는 `auth-section`(account 전용, 타 페이지엔 없음).
- **해결:** 가드를 `getElementById("auth-section")`으로 변경(account.html 전용 정확 스코프). 로컬 프리뷰 검증 — `?view-set=BASE64` 접근 시 공유세트 모달 오픈(이름·항목·총무게 1.3kg 표시), '내 세트에 추가' 클릭 시 localStorage gear_sets에 저장·모달 닫힘, index.html 등 비-account 페이지에선 미발동(가드 정상)·콘솔 에러 없음. [site/app.js](site/app.js)

### [H-31] ✅ 해결완료(커뮤니티 아카이브로 이슈 해소) — 커뮤니티 댓글 수정·삭제 기능 완전 없음
- **영역:** 커뮤니티/소셜 — 댓글
- **URL:** https://www.gear-forest.com/community.html
- **증상:** `renderComments()`에서 댓글 행이 텍스트만 렌더링되고 수정·삭제 버튼이 없음. 게시글에는 삭제 버튼이 있으나 댓글은 작성 후 수정·삭제 불가. account.html 내 로그 섹션(my-log-edit/del)과 기능 불일치.
- **재현:** 로그인 → 댓글 작성 → 댓글 행 확인 — 수정·삭제 버튼 없음
- **백엔드 점검(2026-06-11):** DB 레이어는 **이미 완비** — 본인 댓글 수정·소프트삭제용 RLS `comments_update_own`(001, USING `user_id=auth.uid() AND deleted_at IS NULL` / WITH CHECK `user_id=auth.uid()`) + `GRANT UPDATE ON comments TO authenticated`(004, 적용 확인됨) + body 길이검증 트리거(002, INSERT/UPDATE) + 소프트삭제 카운트 트리거([H-34] 015). 추가 DB 작업 불필요.
- **수정(클라이언트 데이터 레이어):** `supabaseClient.js`에 `editComment(id, body)`(본인 댓글 body UPDATE)·`deleteComment(id)`(deleted_at 소프트삭제) 추가 — createComment와 동일 패턴, user_id 가드 + RLS 이중 방어. [site/supabaseClient.js](site/supabaseClient.js)
- **⚠️ 남은 작업(프론트엔드, 본 백엔드 세션 범위 밖):** `community.html`의 `renderComments()`에 본인 댓글 한정 수정·삭제 버튼 + 핸들러(editComment/deleteComment 호출) 와이어링 필요. DB·클라이언트 함수는 준비 완료라 UI만 붙이면 동작.

### [H-27] ✅ 해결완료(라이브 검증) — privacy.html 카카오 로그인 오기재
- **영역:** privacy.html (정보 정확성)
- **URL:** https://gear-forest.com/privacy.html
- **증상:** privacy.html에 카카오 로그인 관련 개인정보 처리 항목이 기재되어 있으나 실제 코드는 Google OAuth만 구현됨. 개인정보 처리방침이 실제 처리 현황과 불일치.
- **해결(라이브 검증 2026-06-11):** 현재 privacy.html은 §1 수집항목·§4 제3자 제공 모두 "구글 소셜 로그인(OAuth 2.0)" 단독 기재이며 카카오 언급이 0건. 라이브 `curl https://gear-forest.com/privacy.html | grep 카카오` 결과 없음 → 실제 구현(Google 단독)과 일치. [site/privacy.html](site/privacy.html)

### [L-44] ✅ 해결완료(2026-06-12) — 상세 페이지 스펙 단위 "m2" 텍스트 표기 — "m²" 상첨자 아님
- **영역:** 상품상세 — 스펙 테이블
- **URL:** https://gear-forest.com/item/backpacking-tent/item-52.html 등 바닥면적 있는 텐트 상세
- **증상:** 스펙 테이블 바닥면적 셀이 "2.25m2"로 표시됨. 올바른 기호는 "m²"(유니코드 상첨자). 생성 스크립트(`scripts/build-item-pages.js`)가 JSON 원본 "m2" 값을 변환 없이 출력한 결과.
- **재현:** 텐트 상세 페이지 → 스펙 테이블 바닥면적 행 확인
- **해결:** `UNIT_DISPLAY` 맵(`m2`→`m²`, `cm3`→`cm³`, `C`→`°C`) 추가, `specTableRows`에서 적용 후 item 페이지 2277개 재생성. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-45] ✅ 아카이브(stale·재현불가) — SW 스크립트 404 콘솔 에러 — 매 페이지 로드마다 발생
- **영역:** 전체 (PWA/서비스워커)
- **URL:** 모든 페이지
- **증상:** 모든 페이지 로드 시 콘솔에 "A bad HTTP response code (404) was received when fetching the script." 에러 발생. 현재 SW가 캐시한 이전 버전 리소스 중 일부가 더 이상 존재하지 않아 404 발생하는 것으로 추정. 기능 동작에는 영향 없으나 콘솔에 에러 지속 노출.
- **재현:** 아무 페이지 접속 → DevTools Console → SW 404 에러 확인

### [L-53] ✅ 해결완료(2026-06-12) — 비교 모달 스펙 테이블 `<thead>/<th scope>` 없음
- **영역:** 카테고리/목록 — 비교 모달 스펙 테이블
- **증상:** 비교 모달(`.pmbox`) 스펙 테이블에 `<thead>` 및 `<th scope="col/row">` 속성 없음. 스크린리더가 헤더-셀 관계를 파악하지 못해 WCAG 1.3.1 위반.
- **해결:** 비교 모달 행 레이블 `<td>` → `<th scope="row">` 변환, visually-hidden `<caption>` 추가. [site/app.js](site/app.js)

### [L-54] ✅ 해결완료(2026-06-12) — 상세 페이지 스펙 테이블 `<thead>/<th scope>` 없음
- **영역:** 상품 상세
- **URL:** https://gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 상세 페이지 스펙 테이블에도 `<thead>` 및 `<th scope>` 없음. L-53과 동일 패턴.
- **해결:** `specTableRows()`에서 `<th>` → `<th scope="row">` 변환. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-55] ✅ 해결완료(2026-06-12) — 스펙 테이블 `<caption>` 없음
- **영역:** 상품 상세 / 비교 모달
- **증상:** 스펙 테이블에 `<caption>` 요소 없음. 스크린리더 사용자가 테이블 목적을 사전 파악 불가.
- **해결:** item 페이지에 visually-hidden `<caption>` 추가 (build-item-pages.js), 비교 모달도 동일. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-56] ✅ 해결완료(2026-06-12) — 모달 닫기(✕) 버튼 `type="submit"` — 의도치 않은 폼 제출 위험
- **영역:** 카테고리/목록 — 비교 모달 · 상품 상세 모달
- **증상:** 모달 내 ✕ 닫기 버튼에 `type="button"` 대신 기본값(`type="submit"`)이 적용되어 있음. 폼 컨텍스트 내 포함될 경우 폼 제출 트리거 가능. 모든 닫기·UI 전용 버튼은 명시적 `type="button"` 필요.
- **해결:** app.js 내 모든 `<button class="pmx" aria-label="닫기">` → `<button type="button" class="pmx" aria-label="닫기">` 일괄 변경(replace_all). [site/app.js](site/app.js)

### [L-57] ✅ 해결완료(2026-06-12) — 오류 신고 버튼이 상세 페이지(`item/*.html`)에 없음
- **영역:** 상품 상세
- **해결:** 상세 페이지 템플릿 back-link 옆에 `⚠️ 제품 정보 오류 신고` mailto 링크 추가 — subject·body에 제품명·페이지 URL prefill. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-58] ✅ 해결완료(2026-06-12) — 비교 바(`#cmp-bar`) `aria-live` 없음
- **해결(2026-06-12):** `updateCmpBar()` 내 bar 생성 시 `aria-live="polite"` + `role="status"` 추가. [site/app.js](site/app.js)

### [L-59] ✅ 해결완료(2026-06-12) — 카테고리 검색창 IME `isComposing` 가드 없음
- **해결(2026-06-12):** `qInp.oninput` 핸들러에 `if (e.isComposing) return` 가드 추가. [site/app.js](site/app.js)

### [L-60] ✅ 해결완료(2026-06-12) — 홈 검색 "결과 없음" div에 `role="option"` 없음 — listbox 내 메시지 스크린리더 미인식
- **영역:** 검색 — 홈 전역 검색
- **URL:** https://gear-forest.com/
- **증상:** 결과 0건일 때 `#homeres`(role=listbox) 안에 삽입되는 "결과 없음" div에 `role="option"`이 없어 listbox 컨텍스트에서 스크린리더가 이를 항목으로 인식하지 않음. aria-live도 없어 외부 고지도 불가.
- **재현:** 검색창에 "zzzznotexist" 입력 → `#homeres` 내부 div role 확인 → null
- **해결:** "결과 없음" div에 `role="option"` + `aria-disabled="true"` 추가. [site/app.js](site/app.js)

### [L-61] ✅ 해결완료(2026-06-12) — 홈 검색 Enter 키 결과 없을 때 피드백 없음
- **영역:** 검색 — 홈 전역 검색
- **해결:** Enter 핸들러의 "아무 매치 없음" 분기에 "결과 없음" div 박스 표시 + `aria-expanded="true"` + srStatus 갱신 추가. [site/app.js](site/app.js)

### [L-62] ✅ 해결완료(2026-06-12) — 찜·세트 카드 `div[role="button"]`에 `aria-label` 없음
- **영역:** 계정/로그인 — 찜·세트 탭
- **URL:** https://gear-forest.com/account.html
- **증상:** 찜/세트 아이템 카드가 `<div role="button" tabindex="0">` 구조이나 `aria-label`이 없음. 스크린리더가 카드 전체 텍스트를 낱낱이 읽어야 하며 상품명을 간결하게 고지하지 못함.
- **재현:** 찜 카드 DOM 검사 → `aria-label` null 확인
- **해결:** 찜 카드에 `aria-label="${brand} ${model} 상세 보기"`, 세트 카드에 `aria-label="${title} 세트 상세 보기"` 추가. [site/app.js](site/app.js)

### [L-63] ✅ 해결완료(2026-06-13, SOCIAL) — 계정 페이지 전체에 `aria-live` 영역 전무 — 찜 해제·삭제 후 결과 알림 없음
- **해결:** `account.html`에 `#acc-sr-live` (`role=status aria-live=polite`) 추가 + `window.accAnnounce(msg)` 노출(SOCIAL). app.js `renderAccount()` 내 찜 해제(`'찜 해제됐어요'`)·세트 삭제(`'세트가 삭제됐어요'`)·링크 복사(`'링크가 복사됐어요'`) 시 `window.accAnnounce?.()` 추가(CORE, 2026-06-13). [site/account.html](site/account.html), [site/app.js](site/app.js)

### [L-64] ✅ 해결완료(2026-06-13) — Google OAuth 로그인 후 진입 hash(`#logs` 등) 유실
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html#logs
- **증상:** `account.html#logs`에서 Google 로그인 버튼 클릭 시 OAuth `redirect_uri`에 원래 hash 정보가 없음. 로그인 완료 후 콜백이 `account.html`로 돌아오지만 `#logs` 위치로 복원되지 않음. M-52와 연관되나 OAuth 흐름 내 hash 보존 별도 문제.
- **재현:** `account.html#logs` → Google 로그인 클릭 → OAuth URL state 파라미터 확인 → hash 없음 → 로그인 후 hash 복원 안 됨

### [L-65] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 글 카드 `<a>`에 `href` 없음 — Tab 키 포커스 불가
- **영역:** 커뮤니티/소셜 — 피드
- **URL:** https://gear-forest.com/community.html
- **증상:** 글 카드가 `<a class="cm-post">` 태그이나 `href` 속성이 없고 클릭은 `onclick`으로만 처리됨. `href` 없는 `<a>`는 탭 포커스 순서에서 제외되어 키보드 사용자가 접근 불가. L-10(aria-label 없음)과 연관되나 `href` 자체 누락은 별도 접근성 문제.
- **재현:** 커뮤니티 피드 → Tab 키 탐색 → 글 카드에 포커스 안 됨

### [L-66] ✅ 아카이브(커뮤니티/GNB 비활성화) — 비로그인 `community.html#new` 진입 시 로그인 안내 없이 피드로 조용히 이동
- **영역:** 커뮤니티/소셜 — 글쓰기
- **URL:** https://gear-forest.com/community.html#new
- **증상:** 비로그인에서 `#new` 직접 접근 시 `canParticipate() === false`이면 `location.hash = ''` 실행 후 즉시 반환. "로그인이 필요합니다" 같은 안내 없이 피드 화면으로 조용히 전환됨. URL도 `community.html#`으로 trailing `#` 잔존(L-33 연동).
- **재현:** 비로그인 → `community.html#new` 직접 접근 → 아무 안내 없이 피드로 이동, URL에 `#` 잔존

### [L-67] ✅ 아카이브(커뮤니티/GNB 비활성화) — 게시글·댓글 날짜가 `<time datetime="">` 아닌 `<span>`으로 렌더링 — 시맨틱 마크업 누락
- **영역:** 커뮤니티/소셜 — 피드·글 상세·댓글
- **URL:** https://gear-forest.com/community.html
- **증상:** `authorBlock()` 함수가 날짜를 `<span>${timeAgo(iso)}</span>` 형태로 렌더링. `<time datetime="ISO-8601">` 요소가 아니어서 스크린리더의 기계가독 날짜 파악 불가, 검색엔진의 날짜 메타데이터 인식 불가. M-10(날짜 포맷 불일치)과 연관되나 시맨틱 마크업 누락은 별도 문제.
- **재현:** 커뮤니티 피드 HTML 소스 확인 → `<span>3일 전</span>` 형태, `<time>` 요소 없음

### [L-68] ✅ 해결완료(2026-06-12) — 무게 슬라이더 URL 파라미터 부동소수점 오류 — `2015.0000000000002` 등 삽입
- **영역:** 카테고리/목록 — 무게 필터 슬라이더
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag&weight_min__max=2015.0000000000002
- **증상:** 무게 슬라이더를 2.0kg로 설정하면 URL에 `weight_min__max=2015.0000000000002` 같은 부동소수점 오류값이 삽입됨. kg→g 변환(×1000) 시 JavaScript 부동소수점 연산 오류. 가격(정수)·온도(raw float)는 정상.
- **재현:** 카테고리 페이지 → 최소무게 슬라이더 이동 → URL 파라미터 확인
- **해결:** `toStateVal`에서 `Math.round(parseFloat(v) * 1000)` 적용 → 정수 g값 보장. [site/app.js](site/app.js)

### [L-69] ✅ 해결완료(2026-06-12) — 정렬·브랜드 `<select>` 요소에 `aria-label` 없음
- **영역:** 카테고리/목록 — 필터바
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `[data-sort]` 정렬 선택과 `[data-brandsel]` 브랜드 추가 select 모두 `aria-label`·`aria-labelledby`·`id` 없음. 스크린리더가 "콤보박스" 이상의 컨텍스트를 읽지 못함.
- **재현:** DOM 검사 → `select[data-sort]`, `select[data-brandsel]` aria-label null 확인
- **해결:** 코드 확인 시 이미 `aria-label="브랜드 필터 선택"` / `aria-label="정렬 기준 선택"` 존재 — 사전 적용됨. [site/app.js](site/app.js)

### [L-70] ✅ 해결완료(2026-06-12) — 범위 슬라이더 `<input type="range">` `aria-label`·`aria-valuetext` 없음
- **영역:** 카테고리/목록 — 필터 슬라이더
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `.dsl-input` range input 전체(가격·무게·온도·충전량 min/max 8개)에 `aria-label`과 `aria-valuetext` 없음. 스크린리더가 어떤 필터의 min/max인지 알 수 없고 단위 없는 숫자만 읽힘.
- **재현:** DOM 검사 → `input[type="range"].dsl-input` 8개 모두 aria-label null
- **해결:** 가격/스펙/추가스펙 슬라이더 3종 템플릿에 `aria-label="XXX 최솟값/최댓값"` 추가. oninput에서 `aria-valuetext` 포맷팅 값으로 동기화. [site/app.js](site/app.js)

### [L-71] ✅ 해결완료(2026-06-12) — 상세 페이지 별점 셀(`.spec-stars`)에 `aria-label` 없음 — 원시 유니코드 문자 읽힘
- **영역:** 상품 상세 — 스펙 테이블
- **URL:** https://gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** `.spec-stars` 셀에 `aria-label`이 없어 스크린리더가 "★★★★☆ (4)" 원시 유니코드를 읽음. ◐(반별)도 접근 가능한 텍스트 없음. "4점 만점에 3.5점" 같은 `aria-label` 필요.
- **재현:** DOM 검사 → `document.querySelectorAll('.spec-stars')` → ariaLabel null
- **해결:** `specTableRows()`에서 `s.stars != null` 시 `aria-label="${s.stars}점"` 추가. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-72] ✅ 해결완료(2026-06-12) — 상세 페이지 — 같은 카테고리 이전/다음 상품 내비게이션 없음
- **영역:** 상품 상세
- **해결:** 관련제품 섹션 아래에 `.item-pager` 추가 — allModels 인덱스 기준 `← 이전 상품`/`다음 상품 →` 링크(인접 상품 브랜드·모델명 표시). 양 끝은 빈 슬롯. 검증: item-1에서 prev=JEEP 캡락, next=MSR Elixir2 확인. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-73] ✅ 해결완료(2026-06-13) — 헤더 슬로건 텍스트가 필터 버튼으로 오인 유발 — 클릭 불가 정적 텍스트
- **영역:** 상품 상세 — 헤더
- **해결:** `header.top .wrap .sub`에 `cursor:default;pointer-events:none` 추가 → 마우스 호버 시 텍스트/포인터 커서 없이 기본 커서 유지, 클릭 이벤트 차단으로 비인터랙티브 명확화. [site/style.css](site/style.css)

### [L-74] ✅ 해결완료(2026-06-13) — `account.html#settings` URL hash가 실제 DOM ID `settings-section`과 불일치 — 스크롤 이동 불가
- **영역:** 계정/로그인 — 설정 탭
- **URL:** https://gear-forest.com/account.html#settings
- **증상:** URL hash가 `#settings`이지만 DOM ID는 `settings-section`. 브라우저 기본 anchor 동작이 작동하지 않아 직접 접근·링크 공유 시 설정 섹션으로 자동 스크롤되지 않음. `#wish`, `#sets`, `#logs`도 동일 패턴 확인 필요.
- **재현:** `account.html#settings` 직접 접근 → 최상단에 머무름, 설정 섹션 미스크롤

### [L-75] ✅ 해결완료(2026-06-13) — 찜 카드 `div[role="button"]` 내부에 `<button>` 중첩 — HTML 명세 위반
- **영역:** 계정/로그인 — 찜 탭
- **URL:** https://gear-forest.com/account.html
- **증상:** 찜 카드 `<div role="button" tabindex="0">` 안에 `<button class="pli-wish">` 찜 해제 버튼이 중첩. Interactive content 안에 interactive content 포함이 HTML 명세 위반이며 보조기술에서 예측 불가한 동작 유발.
- **재현:** 찜 목록 DOM 확인 → `.pli[role="button"] button.pli-wish` 중첩 구조

### [L-76] ✅ 해결완료(2026-06-13, SOCIAL) — 세트 공유 URL 열람 시 열람자 본인의 찜·세트 데이터가 모달 뒤에 노출
- **영역:** 계정/로그인 — 세트 공유
- **URL:** https://gear-forest.com/account.html?view-set=...
- **증상:** 세트 공유 URL을 열면 공유 세트 모달과 함께 배경에 열람자 본인의 찜 목록·세트가 모두 노출됨. 수신자에게 자신의 개인 데이터가 공유 URL과 함께 표시되어 혼란 유발. 설계 의도 확인 필요.
- **재현:** 세트 공유 링크 복사 → 브라우저에서 열기 → 공유 모달 + 본인 찜·세트 동시 노출
- **해결:** `account.html` 모듈 스크립트에 `_isViewSet` 상수 추가. `?view-set=` 감지 시 ① `renderAccount()` 호출 억제(개인 섹션 초기 렌더 방지), ② `showLoggedInSections(true)` 조기 반환(로그인 후 섹션 표시 억제). 배경에 개인 데이터 미노출. [site/account.html](site/account.html)

### [L-77] ✅ 아카이브(커뮤니티/GNB 비활성화) — 비로그인 빈 피드 — "첫 이야기를 남겨보세요!" CTA가 클릭 불가 텍스트
- **영역:** 커뮤니티/소셜 — 피드
- **URL:** https://gear-forest.com/community.html
- **증상:** 빈 피드에서 "첫 이야기를 남겨보세요!" 문구가 표시되나 로그인·글쓰기로 연결되는 링크·버튼이 없어 행동 유도 문구가 실제 행동 유도로 이어지지 않음.
- **재현:** 비로그인 빈 피드 → "첫 이야기를 남겨보세요!" 텍스트 클릭 불가 확인

### [L-78] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글 상세 본문 이미지 `alt` 빈 값 — 이미지 실패 시 대체 텍스트 없음
- **영역:** 커뮤니티/소셜 — 글 상세
- **URL:** https://gear-forest.com/community.html#post=<id>
- **증상:** `renderDetail()`이 생성하는 `<img src="..." alt="">` 에 빈 `alt`. 피드 카드 썸네일(장식용)과 달리 본문 이미지는 콘텐츠 이미지이므로 설명이 필요. 이미지 오류 시 대체 텍스트 없어 스크린리더 사용자가 이미지 존재를 인지 불가.

### [L-79] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글쓰기 폼 `<label>` 요소에 `for` 속성 없음 — 입력 필드와 미연결
- **영역:** 커뮤니티/소셜 — 글쓰기 폼
- **URL:** https://gear-forest.com/community.html#new
- **증상:** `renderCompose()`가 생성하는 `<label>제목</label>`, `<label>내용</label>`에 `for` 속성 없음. 레이블 클릭 시 대응 입력 필드로 포커스 미이동, 스크린리더 연결 불가. L-32(댓글 textarea label 없음)와 동일 계열.
- **재현:** 로그인 후 `#new` 진입 → "제목" 레이블 클릭 → 입력 필드 포커스 안 됨

### [L-80] ✅ 아카이브(커뮤니티/GNB 비활성화) — 좋아요 버튼에 `aria-label`·`aria-pressed` 없음 — 상태 변화 접근성 트리 미반영
- **영역:** 커뮤니티/소셜 — 글 상세
- **URL:** https://gear-forest.com/community.html#post=<id>
- **증상:** 좋아요 버튼 `<button class="cm-like">🤍 <span>0</span></button>`에 `aria-label`과 `aria-pressed`가 없어 스크린리더가 "하트 0"으로만 읽음. 클릭 후 ❤️로 바뀌어도 상태 변화가 접근성 트리에 반영되지 않음.
- **재현:** 글 상세 → 좋아요 버튼 DOM 검사 → aria-label·aria-pressed null

### [L-52] ✅ 해결완료(기구현 확인) — `favicon.ico` 404 — 브라우저 탭 기본 아이콘 표시
- **처리:** site/favicon.ico 파일 존재 확인. 재현 불가.
- **영역:** 전체 (정적 리소스)
- **URL:** https://gear-forest.com/favicon.ico
- **증상:** favicon.ico 파일 없어 404 반환. `<link rel="icon" type="image/png" href="icon-192.png">`는 있으나 브라우저 기본 favicon.ico 자동 요청에 대한 응답 없음. 콘솔에 매 페이지마다 404 에러 노출.

### [L-50] ✅ 해결완료(2026-06-12) — 동적 생성 이미지 `width`/`height` 누락 — CLS
- **영역:** 홈/메인 (전체 상품 카드)
- **해결:** `thumbCell()` 에 `_THUMB_SZ` 맵 추가 (`pli-thumb:74`, `sres-thumb:34`, `cmp-thumb:70`). 해당 클래스 이미지에 `width`/`height` HTML 속성 자동 주입 → 브라우저 early layout reservation 가능. [site/app.js](site/app.js)

### [L-51] ✅ 해결완료(2026-06-12) — `sitemap.xml` 클린 URL — 실제 서빙 경로(`category.html?cat=`)와 불일치 (SEO)
- **영역:** SEO
- **해결:** sitemap.xml 18개 카테고리 URL을 `category/{slug}` → `category.html?cat={slug}`로 변경 — 실제 서빙 경로·canonical과 일치, 301 리다이렉트 제거. [site/sitemap.xml](site/sitemap.xml)

### [L-49] ✅ 해결완료(2026-06-13) — 구글 로그인 버튼 `type="submit"` — `<form>` 없이 submit 타입 설정
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html
- **증상:** `#btn-google` 버튼의 `type="submit"`으로 설정되어 있으나 감싸는 `<form>` 요소가 없음. 의도치 않은 폼 제출 동작 유발 가능성. `type="button"`이어야 함.
- **재현:** account.html → `#btn-google` 요소 → `type` 속성 확인

### [L-46] ✅ 해결완료(2026-06-12) — 자동완성 정확 일치 모델 후순위
- **영역:** 검색 — 홈 자동완성
- **해결:** `hits` 필터 후 정렬 추가 — 모델명 정확 일치 → 접두어 → 부분 포함 순. [site/app.js](site/app.js)

### [L-47] ✅ 해결완료(M-62 기처리·검증) — 검색 결과 클릭 후 뒤로가기 시 홈 검색창 내용 미복원
- **영역:** 검색 — 홈 내비게이션
- **해결완료(M-62에서 기처리, 2026-06-12 검증):** 타이핑 시 `history.replaceState`로 `?q=` URL 반영 → 자동완성 클릭 후 뒤로가기 착지 URL이 `/?q=검색어`가 되고, `setupHomeSearch`의 M-62 분기가 이를 읽어 input 복원+검색 실행. 검증: `/?q=헬리녹스` 진입 시 input 값 "헬리녹스" 복원 확인. ✅

### [L-48] ✅ 해결완료(2026-06-12) — 오타 입력 시 유사어 제안 없음 — "헬리넉스" 검색 시 결과 없음만 표시
- **영역:** 검색 — 홈 자동완성
- **해결:** Levenshtein 편집거리(`_lev`)로 결과 0건+브랜드 0건 시 가장 가까운 브랜드 1개 제안 — `혹시 OOO 찾으셨나요?` 링크(brand.html). 허용오차: 3자 이하 1, 그 이상 2. 부분일치는 오타 아님으로 제외. 드롭다운·Enter 분기 모두 적용. 검증: "헬리넉스"→"혹시 헬리녹스 찾으셨나요?" 확인. [site/app.js](site/app.js)
- **재현:** 홈 검색창 → "헬리넉스" 입력 → 결과 없음 확인

### [L-43] ✅ 해결완료(2026-06-12) — 데스크톱 footer 불필요한 `padding-bottom: 64px` 잔류
- **해결(2026-06-12):** `insertBottomNav()`에서 `matchMedia("(max-width:767px)")` 조건 추가 → 모바일에서만 padding 주입. [site/app.js](site/app.js)

### [L-19] ✅ 중복(H-23 ✅ 해결완료) — ~~계정 삭제/탈퇴 기능 미존재~~ → [H-23]으로 승격
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** H-23 참조.

### [L-20] ✅ 해결완료(2026-06-13) — 닉네임 설정/변경 UI 미존재
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 커뮤니티 로그에 닉네임이 사용되는 구조임에도 닉네임 설정·변경 입력 필드 없음. 최초 자동 생성 닉네임 변경 불가 상태.
- **해결:** 설정 탭에 `#nick-settings-row` + `#nick-change-form` 추가. `initNickChange()` IIFE로 디바운스 중복검사(isNicknameAvailable)·저장(setNickname)·SR 알림(accAnnounce) 처리. [site/account.html](site/account.html)

### [L-21] ✅ 해결완료(2026-06-13) — account.html meta description 8자로 SEO 기준 미달
- **영역:** 계정/로그인 (SEO)
- **URL:** https://www.gear-forest.com/account.html
- **증상:** meta description이 '구글 로그인·찜 목록 동기화'(8자)로 권장 50~160자 기준에 크게 미달.

### [L-22] ✅ 해결완료(2026-06-13) — 비로그인 상태에서 찜 섹션 완전 은닉 — 기능 인지 불가
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `#wish-section` 전체 `display:none` 처리. 비로그인 사용자가 찜 기능의 존재를 알 수 없으며 로그인 유도 CTA 없음.

### [L-17] ✅ 해결완료(2026-06-12) — 내한온도 스펙 값 '-3C' → '-3°C'
- **영역:** 상품 상세, 카테고리 카드, 모달 전체
- **해결:** `fmtVal()` 에 `_UNIT_DISPLAY = { C: "°C", m2: "m²" }` 매핑 추가. JSON 데이터 `unit:"C"` → 표시 `"°C"`로 변환. [site/app.js](site/app.js)

### [L-18] ✅ 해결완료(2026-06-12) — h1 태그에 브랜드명 누락
- **영역:** 상품 상세 (SEO)
- **해결:** `<h1>${modelName}</h1>` + `<p class="item-brand">` 분리 구조 → `<h1>${brand} ${modelName}</h1>` 통합. page title과 일치. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-16] ✅ 해결완료(2026-06-12) — 정렬 chip 버튼에 aria-pressed 속성 없음
- **영역:** 카테고리/목록 (접근성)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 활성 정렬 chip에 `on` 클래스는 붙지만 `aria-pressed` 속성 없음. 스크린 리더 사용자가 현재 선택된 정렬 상태 확인 불가.
- **해결:** `.schip` 초기 생성 시 `aria-pressed="false"` 부여, `draw()`에서 `.classList.toggle("on")` 병행으로 `setAttribute("aria-pressed", String(active))` 갱신. [site/app.js](site/app.js)

### [L-23] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 페이지 JSON-LD 구조화 데이터 없음
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** `DiscussionForumPosting`, `BreadcrumbList` 등 schema.org JSON-LD 전무. 검색 결과 리치 스니펫 노출 기회 손실. ([L-13] 홈과 동일 패턴)

### [L-25] ✅ 해결완료(2026-06-12, Cloudflare) — www·non-www 리다이렉트 동작이 경로마다 불일치
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** 일부 경로는 www→non-www, 일부는 non-www→www로 리다이렉트 방향이 혼재. canonical은 non-www로 통일되어 있으나 실제 리다이렉트 동작 불일치로 크롤링 일관성 저하. ([H-12] 근본 원인과 연관)

### [L-13] ✅ 해결완료(2026-06-12) — JSON-LD 구조화 데이터 없음 — 리치 스니펫 노출 불가
- **해결:** Batch 4에서 index.html `<head>`에 WebSite+SearchAction JSON-LD 추가됨. 검증: index.html에 application/ld+json WebSite 존재. [site/index.html](site/index.html)
- **영역:** 홈/메인 (SEO)
- **URL:** https://www.gear-forest.com/
- **증상:** schema.org JSON-LD 전혀 없음. Google 검색 결과에서 사이트링크 검색박스·상품 카드 등 리치 스니펫 노출 불가.

### [L-14] ✅ 해결완료(2026-06-12) — search.json(298KB) 페이지 로드 시 즉시 선제 로딩
- **영역:** 홈/메인 (성능)
- **해결:** `setupHomeSearch`에서 즉시 `await getJSON` 제거 → `ensureIdx()` 지연 로더 도입. 검색창 focus/input 첫 상호작용 시 로드. run()·Enter 핸들러에 미로드 가드 추가. 검증: 페이지 로드 시 search.json 미요청(0), focus 후 1회 요청 확인. [site/app.js](site/app.js)

### [L-15] ✅ 해결완료(기적용·2026-06-12 검증) — PWA manifest start_url 상대경로 설정 — www·non-www 불일치와 복합
- **영역:** 홈/메인 (PWA)
- **해결:** `manifest.webmanifest` 현재 `start_url:"/"`, `scope:"/"` 절대경로로 이미 설정됨(`./index.html` 아님). apex 정식화([[domain-apex-canonical]])와도 일치. 추가 조치 불필요.

### [L-10] ✅ 아카이브(커뮤니티/GNB 비활성화) — 비로그인 상태에서 `#new` 직접 접근 시 안내 없이 피드로 redirect
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html#new
- **증상:** 비로그인 상태에서 `community.html#new` 직접 접근 시 아무 안내 없이 `location.hash = ''`로 피드로 돌아감. 사용자가 이유를 알 수 없음.

### [L-11] ✅ 아카이브(커뮤니티/GNB 비활성화) — 모바일 탭바 '커뮤니티' 레이블이 '커뮤'로 잘림
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 375px에서 `.bottom-nav` 커뮤니티 탭 레이블이 '커뮤'로 truncate. 다른 탭(홈/탐색/마이)은 정상 표시.

### [L-12] ✅ 아카이브(커뮤니티/GNB 비활성화) — 데스크톱·모바일 nav 두 개가 DOM에 동시 존재 — 유지보수 부담
- **영역:** 커뮤니티/소셜 (전체 공통)
- **URL:** https://www.gear-forest.com/community.html
- **증상:** `.tabbar`(데스크톱)와 `.bottom-nav`(모바일) 두 nav가 DOM에 공존, CSS `display:none`으로 전환. 기능 추가 시 양쪽 모두 수정 필요.

### [L-08] ✅ 해결완료(기구현·2026-06-13 검증) — 헤더에 계정/로그인 진입 경로 없음
- **영역:** 계정/로그인
- **처리:** app.js lines 465-472의 `.header-acct` 아이콘(👤)이 모든 페이지 헤더 우상단에 account.html 링크로 삽입됨. GNB 아카이브 이후 대체 경로로 상시 노출. 코드 변경 불필요.


### [L-06] ✅ 해결완료(2026-06-12) — 빈 문자열로 검색 시 아무 피드백 없음
- **영역:** 검색
- **해결:** 홈 검색 Enter 핸들러 빈 입력 분기에서 `"검색어를 입력해 주세요"` 안내 박스 표시 + `aria-expanded=true` + SR 고지 + 포커스 유지. 검증 완료. [site/app.js](site/app.js)

### [L-07] ✅ 해결완료(2026-06-12) — 검색 결과 없음 시 대안 탐색 경로 미제공
- **영역:** 검색
- **해결:** 결과 없음 상태 footer에 "📂 카테고리 탐색하기" 링크 추가 (`category.html`). L-61 Enter 핸들러 분기에서도 동일 메시지 표시. [site/app.js](site/app.js)

### [L-04] ✅ 아카이브(Cloudflare 인프라 문제·코드 외부) — Cloudflare beacon.min.js 503 오류
- **영역:** 상품 상세 (전체 페이지 공통으로 추정)
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 페이지 로드 시 Cloudflare Web Analytics beacon 스크립트가 503 반환. 분석 데이터 수집 불가.
- **처리:** Cloudflare 측 Analytics 서비스 문제로 코드 수정으로 해결 불가. Cloudflare 대시보드에서 Analytics 활성화 상태 확인 필요.

### [L-05] ✅ 해결완료(2026-06-12) — 스펙 배지가 모두 '참고'로 표시 — 공식/비공식 구분 없음
- **영역:** 상품 상세
- **해결:** 데이터엔 4종 배지(참고 4777·데이터부족 729·확정 96·외형기준 242)가 있으나 동일 회색으로 렌더돼 구분 불가였음. 유형별 색상 부여(`확정`=accent 굵게/`외형기준`=outer/`참고`=muted/`데이터부족`=faint) + `title` 설명 + 해당 상품에 등장하는 배지만 표 아래 범례(`.spec-legend`) 표시. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-03] ✅ 해결완료(기구현·2026-06-13 검증) — 상품 카드가 `<a>` 링크 없이 role=button으로만 구현 — 접근성 미흡
- **영역:** 카테고리/목록
- **처리:** app.js line 2170 `<a class="pli" href="/item/${STATE.slug}/item-${d.models.indexOf(m)}.html" aria-label="...">` 로 구현됨. 찜/비교 버튼은 `e.preventDefault()`로 기본 네비게이션 차단(L-03 회귀 수정 포함). 코드 변경 불필요.

### [L-01] ✅ 해결완료(2026-06-12) — 데스크톱에서 캠핑 스타일 그리드 5열에 카드 4개 — 빈 셀 발생
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션 (데스크톱)
- **해결:** `@media(min-width:641px){.personas{grid-template-columns:repeat(4,1fr)}}` — 페르소나 4개를 4열 균등 배치. 모바일은 기존 auto-fill 유지. 검증: 1280px에서 281px×4 균등 확인. [site/style.css](site/style.css)

### [L-02] ✅ 해결완료(2026-06-12) — 모바일에서 캠핑 스타일 카드 1열 세로 나열
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션 (모바일)
- **해결:** `.personas` `minmax(200px,1fr)` → `minmax(150px,1fr)` — 375px에서 2열 허용(375÷150≈2.5). [site/style.css](site/style.css)

### [L-29] ✅ 해결완료(2026-06-12) — 모바일 상세 페이지 스펙 테이블 레이블 중간 줄바꿈
- **영역:** 상품 상세
- **해결:** `.spec-table th` 인라인 스타일에 `word-break:keep-all` 추가 — 한글 어절 단위로 줄바꿈, 중간 분리 방지. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-32] ✅ 아카이브(커뮤니티/GNB 비활성화) — 댓글 textarea — 연결된 `<label>` 없음
- **영역:** 커뮤니티/소셜 — 댓글 폼
- **URL:** https://www.gear-forest.com/community.html#post={id}
- **증상:** 댓글 작성 textarea(`id="cm-ct"`, `placeholder="댓글 달기…"`)에 연결된 `<label>` 없음. placeholder만으로는 WCAG 2.1 SC 1.3.1 미충족.

### [L-34] ✅ 해결완료(2026-06-12) — `<meta name="theme-color">` 다크모드 변형 없음
- **영역:** 홈/메인 (PWA/다크모드)
- **URL:** https://www.gear-forest.com/
- **증상:** `theme-color` 메타태그가 라이트모드 색상(`#2f7a4e`) 하나만 존재. `media="(prefers-color-scheme: dark)"` 변형이 없어 다크모드 기기에서 브라우저 주소창·상태바가 라이트 그린으로 고정됨.
- **해결:** 모든 HTML(index/category/brand/recommend + item 2277개)에 `media="light"` 분리 + `media="dark" content="#121212"` 추가. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **재현:** 다크모드 기기에서 접속 → 브라우저 UI 색상 확인

### [L-33] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 뒤로가기 시 URL에 trailing `#` 잔존
- **영역:** 커뮤니티/소셜 — 라우팅
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 글 상세·작성 폼에서 "← 목록으로" 클릭 시 `location.hash = ''` 실행으로 URL이 `community.html#`으로 변경됨. 주소창에 `#`이 잔존하고 URL 공유 시 `community.html#` 형태로 전달됨. `history.pushState('','',location.pathname)` 사용이 올바른 처리.
- **재현:** 글 클릭 → "← 목록으로" → 주소창 `community.html#` 확인

### [L-31] ✅ 해결완료(2026-06-12) — 카테고리 내 검색 0건 시 전체검색 CTA 없음
- **영역:** 검색 (카테고리 페이지)
- **해결:** `draw()` 빈 결과 표시 시 `STATE.q`가 있으면 `/?q=...` 전체 카테고리 검색 링크를 `.pli-empty` 안에 추가. [site/app.js](site/app.js)

### [L-30] ✅ 해결완료(2026-06-12) — category.html `<title>` 초기값 개선
- **영역:** 카테고리/목록 (SEO)
- **해결:** `<title>카테고리 비교 — 장비의 숲</title>` → `<title>캠핑 장비 비교 — 장비의 숲</title>`. JS 실행 전에도 의미있는 제목 유지. JS 후 카테고리명으로 동적 교체는 그대로. [site/category.html](site/category.html)

### [L-28] ✅ 해결완료(2026-06-12) — 상품 상세 모달에 role="dialog"·aria-modal 없음
- **영역:** 카테고리/목록 — 상품 카드 모달
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 상품 카드 클릭 시 열리는 모달(`.pmodal`)에 `role="dialog"`, `aria-modal`, `aria-labelledby` 속성 없음. 스크린리더가 모달 진입을 인식하지 못함.
- **재현:** 카테고리 페이지에서 카드 클릭 → DevTools에서 `.pmodal` 속성 확인
- **해결:** #set-modal, #pmodal, #pmrv-detail, #set-detail-modal 생성 코드에 `role="dialog"` · `aria-modal="true"` 추가. [site/app.js](site/app.js)

### [L-26] ✅ 해결완료(2026-06-12) — Skip-to-content 링크 미존재 — 키보드/스크린리더 접근성 미흡
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** `<a href="#main" class="skip-to-content">` 등 메인 콘텐츠 바로가기 링크가 없어 키보드 사용자가 Tab으로 탐색할 때 상단 nav 전체를 순회해야 함. WCAG 2.4.1(G1) 준수 미흡.
- **재현:** 홈 접속 → Tab 키 반복 → 콘텐츠 바로가기 링크 없음 확인
- **해결:** index/category/brand/recommend.html + item 페이지에 `<a class="skip-link" href="#main">` 추가. `<main id="main">` 추가. style.css에 `.skip-link` 포커스 시 visible 스타일. [site/style.css](site/style.css)

### [L-37] ✅ 해결완료(2026-06-13) — 계정 찜 탭 전체 삭제 기능 없음
- **영역:** 계정/로그인 — 찜 탭
- **증상:** 개별 찜 해제 버튼만 있고 "전체 삭제" 기능 없음. 다수 찜 항목을 일일이 해제해야 함.
- **해결:** 찜 섹션 헤더에 `#wish-clear-all` 버튼 추가. 클릭 시 confirm 후 `setWish([])` → `renderAccount()` → SR 알림. [site/account.html](site/account.html)

### [L-38] ✅ 해결완료(기구현·2026-06-13 검증) — 다크모드 설정 설명에 "(정비 중)" 텍스트 잔존
- **영역:** 계정/로그인 — 설정 탭
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 다크모드 토글 설명에 "어두운 테마로 전환합니다 (정비 중)" 문구가 사용자에게 그대로 노출됨. 기능 자체는 정상 동작(localStorage 저장, 새로고침 후 유지)하므로 "(정비 중)" 제거 필요.

### [L-40] ✅ 해결완료(2026-06-12) — `manifest.webmanifest` `start_url`이 `./index.html` — canonical `/`과 불일치
- **영역:** 홈/메인 (PWA)
- **증상:** PWA로 실행 시 URL이 `gear-forest.com/index.html`로 집계되어 canonical(`gear-forest.com/`)과 달라 GA/분석에서 PWA 세션이 별도 경로로 기록됨. Lighthouse start_url ≠ canonical 경고 발생.
- **해결:** `start_url: "./"` → `"/"`, `scope: "./"` → `"/"` 변경. [site/manifest.webmanifest](site/manifest.webmanifest)
- **재현:** manifest.webmanifest 확인 → `start_url: "./index.html"`

### [L-42] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글쓰기 모달 — 첨부 이미지 선택 취소 버튼 없음
- **영역:** 커뮤니티/소셜 — 글쓰기
- **증상:** 사진 선택 후 미리보기 표시되나 이미지 선택을 취소할 × 버튼 없음. 모달을 닫거나 다른 파일을 다시 선택하는 방법뿐.
- **재현:** 글쓰기 → 사진 선택 → 미리보기 → 취소 버튼 없음 확인

### [L-41] ✅ 해결완료(2026-06-12) — `og:image:alt` / `twitter:image:alt` 메타태그 누락
- **영역:** 홈/메인 (SEO·접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** SNS 공유 시 og:image, twitter:image 존재하나 `og:image:alt`, `twitter:image:alt` 없음. 스크린리더 사용자가 SNS 공유 링크 접근 시 이미지 설명 없음.
- **해결:** 모든 HTML(index/category/brand/recommend + item 2277개)에 `og:image:alt` / `twitter:image:alt` 추가. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-39] ✅ 해결완료(2026-06-13) — 비로그인 상태 `account.html#logs` 직접 접근 시 안내 없는 빈 화면
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html#logs
- **증상:** 비로그인 상태로 직접 접근 시 해시 무시(M-52)로 wish 섹션만 표시, 왜 로그가 안 보이는지 안내 없음.

### [L-36] ✅ 해결완료(2026-06-12) — 상품 상세 모달 `@media print` 스타일 없음
- **영역:** 상품상세 모달 (인쇄)
- **해결:** `style.css` 말미에 `@media print` 규칙 추가 — 헤더·탭바·필터·버튼 등 UI 크롬 숨김, 스펙 테이블·상품 정보만 출력. [site/style.css](site/style.css)

### [L-35] ✅ 해결완료(2026-06-12) — 카테고리 목록 스크롤 끝 "모두 표시됨" 안내 없음
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag 등
- **증상:** 무한스크롤 마지막 아이템 이후 종료 인디케이터가 없어 로딩 중인지 목록의 끝인지 구분 불가. sleeping-bag(244개), table(52개) 등 모두 해당.
- **재현:** 카테고리 페이지에서 맨 아래까지 스크롤 → 마지막 카드 아래 빈 공간만 있음
- **해결:** `draw()`에서 카드 있을 때 `─ 총 N개 모두 표시됨 ─` `.list-end` div 추가. style.css 스타일 추가. [site/app.js](site/app.js)

### [M-106] ✅ 해결완료 — 데스크톱 탭바 홈 탭 레이블이 '비교'로 오표기
- **해결(2026-06-11):** `app.js` `TABS` 배열 첫 탭 `label: "비교"` → `label: "홈"` 수정. 데스크톱 `.tabbar`와 모바일 `.bottom-nav` 레이블 일치. [site/app.js](site/app.js)
- **영역:** 홈/메인 — 데스크톱 탭바
- **URL:** https://gear-forest.com/
- **증상:** 데스크톱(≥769px) 상단 `.tabbar`의 첫 번째 탭(홈/index.html)이 '📊비교'로 표시됨. 모바일 `.bottom-nav`는 '홈'으로 올바르게 표시되어 플랫폼 간 레이블 불일치.
- **원인:** `app.js` line 341의 레거시 `TABS` 상수에 `label: '비교'`로 정의. 반면 `.bottom-nav` 탭 배열은 `label: '홈'`으로 정의 — 두 탭바 시스템이 서로 다른 레이블 사용.
- **재현:** 데스크톱(≥769px) → `https://gear-forest.com/` → 상단 탭바 첫 번째 탭 레이블 '📊비교' 확인

### [M-105] ✅ 해결완료 — 로그 작성 모달 세트 드롭다운 — `s.name` 참조로 항상 '이름 없는 세트' 표시
- **해결(2026-06-11):** 로그 작성 모달 세트 드롭다운(line 2678)·`gear_set_snapshot` 저장(line 2781) 모두 `s.name` → `s.title`로 수정. `getSets()`가 반환하는 세트 객체의 실제 필드명(`title`)과 일치. [site/app.js](site/app.js)
- **영역:** 계정/로그인 — 커뮤니티 로그 작성 모달
- **URL:** https://gear-forest.com/account.html (세트 → 커뮤니티 로그 작성 버튼)
- **증상:** 로그 작성 모달의 '내 세트 첨부' 드롭다운에 세트 이름 대신 '이름 없는 세트'가 표시됨. 저장된 `gear_set_snapshot.name`도 '이름 없는 세트'로 기록됨.
- **원인:** `app.js` line 2665/2768에서 세트 이름을 `s.name`으로 참조하나, `getSets()`가 반환하는 세트 객체는 `title` 필드를 사용(saveSets/getSets line 243~244). `s.name`은 항상 undefined → fallback '이름 없는 세트' 노출.
- **재현:** localStorage에 세트 1개 이상 저장 → account.html 세트 탭 → '이 세트로 커뮤니티 로그 작성' 버튼 → 드롭다운에 '이름 없는 세트' 표시

### [M-104] ✅ 해결완료(M-61 동시 수정) — `brand.html` 다른 브랜드 검색창 — 자동완성·Enter 이동 미구현
- **해결(2026-06-11):** M-61(Enter 핸들러 추가)로 이미 수정됨. `renderBrand()`에 `bqInput.oninput`(칩 필터링)·`bqInput.onkeydown`(Enter → 첫 브랜드 이동) 모두 존재. 드롭다운 대신 실시간 칩 필터 방식. [site/app.js](site/app.js)
- **영역:** 검색 — 브랜드 페이지
- **URL:** https://gear-forest.com/brand.html?b=헬리녹스
- **증상:** '다른 브랜드 검색' 입력창에 브랜드명을 타이핑해도 자동완성 드롭다운이 열리지 않으며, Enter 를 눌러도 해당 브랜드 페이지로 이동하지 않음. 브랜드 목록 버튼 클릭만 가능.
- **원인:** `brand.html` 검색창에 debounce 입력 이벤트 핸들러·Enter keydown 핸들러·자동완성 로직이 미구현된 것으로 추정.
- **재현:** `brand.html?b=헬리녹스` → 검색창에 '코베아' 입력 → 드롭다운 없음, Enter 무반응

### [M-103] ✅ 해결완료 — JSON-LD Product `name`에 브랜드명 중복 포함
- **해결(2026-06-11):** `build-item-pages.js` JSON-LD `"name": \`${brand} ${modelName}\`` → `"name": modelName`으로 수정. `brand.name`에 브랜드 분리 유지. 2277개 상세 페이지 재빌드. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **영역:** 상품상세 — 구조화 데이터
- **URL:** https://gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** JSON-LD `name` 필드가 `"니모이큅먼트 호넷 엘리트 오스모 1P"`(브랜드+모델명)이고 `brand.name`도 `"니모이큅먼트"`로 별도 존재. Schema.org 권장은 `name`=모델명, `brand`=브랜드 분리. 구글 리치 결과에서 브랜드명 중복 노출 가능.
- **원인:** 상세 HTML 생성기(`build-item-pages.js`)가 JSON-LD `name`에 `브랜드명 + 모델명` 조합으로 삽입.
- **재현:** 상세 페이지 → DevTools 콘솔 → `document.querySelector('script[type="application/ld+json"]').textContent` → name에 브랜드명 포함 확인

### [M-101] ✅ 해결완료(M-89와 동시) — 캠핑 스타일 칩 ON 상태에서 경량 우선 프리셋 적용 후 스타일 리드 텍스트 불일치
- **해결(2026-06-11):** M-89 수정으로 `clearPresetFilters()`가 `STATE.campStyle = ""`까지 초기화하여 스타일 칩·리드 텍스트 동시 해소. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 스타일 칩·프리셋 상호작용
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent&style=backpacking
- **증상:** 백패킹 스타일 칩 ON → 경량 우선 프리셋 클릭 시, `clearPresetFilters()`가 `STATE.campStyle`을 초기화하지 않아 상단 리드 텍스트가 '🏕 백패킹 기준'으로 남음. 프리셋 버튼은 ON 표시인데 스타일 칩도 ON인 모순 상태. (0건의 근본원인은 H-41 kg/g 불일치)
- **원인:** `clearPresetFilters(line 968-972)`가 weightMeta.key·price·cap만 초기화하고 `STATE.campStyle`은 건드리지 않음. M-89와 동일 계열이나 campStyle 대상.
- **재현:** 백패킹 칩 클릭 → 경량 우선 클릭 → 리드 텍스트 '백패킹 기준' 유지, 경량우선 ON 표시 동시 공존

### [M-102] ✅ 해결완료 — 스타일 칩 적용 후 정렬 드롭다운이 '기본'으로 표시 — 실제 정렬(weight_min) 미반영
- **해결(2026-06-11):** 스타일 칩 onclick 핸들러에 `applyStyleSort(d)` 직후 `syncFilterUI()` 추가 — 정렬 드롭다운 `<select>` UI가 변경된 `STATE.sortKey`(예: `spec:weight_min`)와 동기화됨. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 스타일 칩·정렬 UI
- **URL:** https://gear-forest.com/category.html?cat=sleeping-bag&style=backpacking
- **증상:** 백패킹 스타일 칩 클릭 시 실제 정렬은 weight_min(가벼운순)으로 바뀌지만, 정렬 드롭다운은 '기본(주력지표)'으로 표시. 사용자가 정렬 기준이 변경됐음을 인지할 수 없음.
- **원인:** `applyStyleSort`가 `STATE.sortKey = 'spec:weight_min'`으로 세팅하지만 `syncFilterUI`가 스타일 정렬 반영 후 호출되지 않아 셀렉트 UI 미갱신. 정렬 value가 option에 없으면 드롭다운이 '기본'처럼 보임.
- **재현:** `?cat=sleeping-bag` 접속(기본 정렬≠weight_min) → 백패킹 칩 클릭 → 목록 재정렬됨, 드롭다운은 '기본' 유지

### [M-100] ✅ 해결완료 — 페르소나 카드 '4인 가족'과 '오토/맥시멀' 동일 URL로 연결
- **해결(2026-06-11):** `PERSONA_CAT`에서 `family` 항목 제거 → fallback 경로인 `recommend.html?p=family`로 연결. 오토/맥시멀은 기존 category URL 유지. [site/app.js](site/app.js)
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션
- **URL:** https://gear-forest.com/
- **증상:** '🚙 오토 / 맥시멀'과 '👨‍👩‍👧‍👦 4인 가족' 카드가 동일한 URL(`category.html?cat=auto-tent&sort=spec%3Afloor_area&sa=0&cap=4`)로 연결됨. 두 페르소나는 tagline과 추천 의도가 다름에도 클릭 결과가 구분되지 않음.
- **원인:** `app.js` PERSONA_CAT 맵에서 `family` 키가 `auto` 키와 동일한 `{cat, sort, sa, cap}` 값으로 설정되어 있음. `family`는 별도 `recommend.html?p=family` 페이지를 갖고 있으나 카테고리 URL로만 링크됨.
- **재현:** 홈 → '오토/맥시멀' 우클릭 링크 주소 복사 → '4인 가족' 우클릭 링크 주소 복사 → 두 URL 동일 확인

### [M-107] ✅ 해결완료 — 찜 탭 '로그인하고 기기 간 동기화' 버튼이 로그인 후에도 표시됨
- **해결(2026-06-11):** `renderWish()`에서 `wish-empty` div가 최초 생성 시 로그인 상태를 innerHTML에 굳혀 이후 재렌더 시 갱신하지 않던 문제 수정. 항상 현재 `isLoggedIn` 상태 기반으로 innerHTML을 재생성하도록 변경 — 로그인 상태면 동기화 버튼 미출력, 비로그인 상태에서만 출력. [site/app.js](site/app.js)
- **영역:** 계정/로그인 — 찜 탭
- **URL:** https://gear-forest.com/account.html
- **증상:** 로그인 상태에서 account.html 찜 탭에 "로그인하고 기기 간 동기화" 버튼이 사라지지 않고 계속 표시됨.
- **원인:** `wish-empty` div가 최초 1회 생성 시 innerHTML을 굳혀서, 이후 로그인 상태가 바뀌어도 동기화 버튼 표시 여부가 업데이트되지 않음.
- **제보:** 사용자 직접 제보

### [M-108] ✅ 해결완료 — '내 정보' 탭 비로그인 시 찜·설정 섹션 표시됨
- **해결(2026-06-11):** `account.html`의 `#wish-section`, `#settings-section` 초기값을 `display:none`으로 변경. `app.js`의 `renderAccount()`에서 비로그인 시 `wish-section`·`sets-section` 강제 표시 로직 제거(`!isLoggedIn` 조건 삭제). `account.html`에 `showLoggedInSections(show)` 헬퍼 추가 — `renderLogin()` 시 hide, `renderProfile()`·`renderNicknameModal()` 시 show. [site/account.html](site/account.html), [site/app.js](site/app.js)
- **영역:** 계정/로그인 — 내 정보 페이지
- **URL:** https://gear-forest.com/account.html
- **증상:** 비로그인 상태에서 account.html 접근 시 로그인 폼 아래에 '🔖 찜한 상품' 섹션과 '⚙️ 설정' 섹션이 그대로 표시됨. 로그인 이후에만 보여야 할 콘텐츠가 비로그인 상태에서 노출됨.
- **제보:** 사용자 직접 제보

### [M-109] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 사진 업로드 불가 — Supabase Storage 버킷 미설정
- **영역:** 커뮤니티/소셜 — 글쓰기 사진 첨부
- **URL:** https://gear-forest.com/community.html
- **증상:** 글쓰기에서 사진 첨부 시 업로드 실패. 프론트엔드 코드(`uploadImage`, `review-images` 버킷 경로)는 정상이나 Supabase Storage 버킷이 미생성 상태.
- **원인:** Supabase Dashboard에서 `review-images` 버킷(Public)을 생성하지 않았고, `003_storage_policies.sql` 미적용 상태. `005_post_images.sql`(`posts.image_urls` 컬럼 추가)도 필요.
- **해결방법(백엔드 수동 적용):** [supabase/APPLY.md](supabase/APPLY.md) §2(005_post_images.sql)·§3(review-images 버킷 생성 + 003_storage_policies.sql) 참고. 프론트엔드 코드 변경 불필요.
- **제보:** 사용자 직접 제보

### [L-93] ✅ 해결완료(2026-06-12, L-40과 동시) — `manifest.webmanifest` `start_url`이 `./index.html`로 apex URL과 불일치
- **영역:** 홈/메인 — PWA
- **URL:** https://gear-forest.com/manifest.webmanifest
- **증상:** PWA 매니페스트 `start_url`이 `"./index.html"`로 설정되어 PWA 실행 시 `/index.html`로 시작. 표준 URL `https://gear-forest.com/`과 분리 집계. Lighthouse PWA 감사 경고 발생 가능.
- **원인:** `manifest.webmanifest`의 `start_url: "./index.html"` — `"/"` 또는 `"./"` 로 수정 필요.
- **재현:** `https://gear-forest.com/manifest.webmanifest` 접근 → `start_url` 값 `"./index.html"` 확인

### [L-92] ✅ 아카이브(커뮤니티/GNB 비활성화) — 커뮤니티 피드 카드 썸네일 이미지 `alt=""` 빈 값
- **영역:** 커뮤니티/소셜 — 피드 카드
- **URL:** https://gear-forest.com/community.html
- **증상:** 피드 카드 썸네일 `<img>` 태그가 `alt=""`로 렌더링됨. 콘텐츠 이미지임에도 스크린리더가 설명을 읽지 못함. (L-78은 글 상세 모달 이미지이며 피드 카드 썸네일은 별도)
- **원인:** `community.html` line 180: `imgs.map(u => \`<img src="${esc(u)}" loading="lazy" alt="">\`)` — alt 하드코딩 빈 값
- **재현:** 이미지 포함 게시글 피드 → 카드 img 요소 검사 → `alt=""` 확인

### [L-91] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글쓰기 폼(`renderCompose`) `<label>` `for` 속성 누락
- **영역:** 커뮤니티/소셜 — 글쓰기 폼
- **URL:** https://gear-forest.com/community.html#new
- **증상:** 글쓰기 폼의 제목·내용·사진 `<label>`에 `for` 속성이 없어 스크린리더가 레이블과 입력 필드를 연결하지 못함. (L-79는 app.js log-modal의 lf-label이 대상, community.html `renderCompose()`는 별도)
- **원인:** `community.html` line 201~206에서 `<label>제목</label>` 등 for 속성 없이 생성. 입력 필드 id(cm-t, cm-b, cm-file)는 존재하나 레이블 연결 누락.
- **재현:** 로그인 후 `community.html#new` → 폼 label 요소 검사 → `for` 속성 없음

### [L-90] ✅ 아카이브(커뮤니티/GNB 비활성화) — 글 상세 좋아요 버튼(`cm-like`) `aria-label`·`aria-pressed` 누락
- **영역:** 커뮤니티/소셜 — 글 상세
- **URL:** https://gear-forest.com/community.html#post=\<uuid\>
- **증상:** 글 상세의 `<button class="cm-like">` 에 `aria-label`·`aria-pressed` 없어 스크린리더가 버튼 용도·상태를 읽지 못함. (L-80은 app.js `log-like-btn`이 대상, `community.html`의 `cm-like`는 별도 요소)
- **원인:** `community.html` `renderDetail()` line 304에서 버튼 생성 시 aria 속성 미포함.
- **재현:** 글 상세 URL 접속 → 좋아요 버튼 요소 검사 → `aria-label`, `aria-pressed` 없음

### [L-89] ✅ 아카이브(커뮤니티 비활성화) — `← 목록으로` `<span>` 요소 키보드 접근 불가
- **영역:** 커뮤니티/소셜
- **URL:** https://gear-forest.com/community.html#post=00000000-0000-0000-0000-000000000000
- **증상:** 글 상세·존재하지 않는 글·글쓰기 폼의 '← 목록으로' 버튼이 `<span>` 으로 구현되어 `role="button"`, `tabindex` 없음 → 키보드 포커스 불가, 스크린리더 인터랙티브 미인식.
- **원인:** `community.html`의 `renderDetail()`/`renderCompose()`/404 분기 모두 `<span class="cm-back">← 목록으로</span>` 사용. role·tabindex 미부여.
- **재현:** 글 상세 → Tab 키 순환 시 '← 목록으로' 건너뜀 → 요소에 role/tabindex 없음 확인

### [L-88] ✅ 해결완료(기구현·2026-06-13 검증) — `account.html` 비로그인 앵커 링크 `href="#sec-wish"` id 불일치
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html
- **증상:** acc-nav의 '찜 N' 링크가 `href="#sec-wish"`를 가리키지만 실제 DOM에는 `id="wish-section"`만 존재. 앵커 클릭 시 해당 섹션으로 스크롤되지 않음. (acc-nav 자체 L-87 이슈와 동반)
- **원인:** `app.js` line 1826에서 `href='#sec-wish'` 생성, account.html에는 `id='sec-wish'`가 없음.
- **재현:** acc-nav 임시 추가 후 → '찜 N' 링크 클릭 → 스크롤 미동작

### [L-87] ✅ 아카이브(커뮤니티/GNB 비활성화) — `account.html` — `acc-nav`, `acc-empty`, `acc-tabs` 요소 미존재로 비로그인 내비·로그인 탭 UI 무효
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html
- **증상:** 비로그인 시 섹션 앵커 내비게이션, 로그인 후 탭 UI(찜/세트/로그)가 전혀 표시되지 않음.
- **원인:** `app.js renderAccount()`에서 `getElementById('acc-nav')`, `getElementById('acc-empty')`, `getElementById('acc-tabs')`를 참조하나 `account.html`에 해당 id 요소가 없어 모두 null 반환 → 관련 로직 전부 스킵.
- **재현:** account.html 접속 → 찜/세트 데이터 있어도 앵커 링크 없음, 구글 로그인 후 탭 UI 미표시

### [L-86] ✅ 해결완료(2026-06-12) — 홈 검색창 숫자만 입력 시 '검색 결과 없음' 피드백 미표시
- **영역:** 검색 — 홈 자동완성
- **해결:** `run()` 완료 후 `aria-expanded`를 `opts.length` 기준으로 설정하던 로직을 항상 `"true"`로 변경. 결과 없음 div(`sres.nd`)만 있어도 박스가 expanded 상태 유지. [site/app.js](site/app.js)

### [L-85] ✅ 해결완료(2026-06-12) — item 상세 페이지 Service Worker 상대경로 등록 → 404
- **영역:** 검색 / 전체 (PWA)
- **해결:** `navigator.serviceWorker.register('sw.js')` → `register('/sw.js')` 절대경로로 수정. `/item/{cat}/` 하위에서도 루트 SW를 정확히 등록. [site/app.js](site/app.js)

### [L-84] ✅ 해결완료(2026-06-12) — 상품상세 페이지 `twitter:site` 메타태그 누락
- **영역:** 상품상세 — SNS 메타
- **URL:** https://gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** `twitter:card`·`twitter:title`·`twitter:image`는 있으나 `twitter:site`(@계정) 없음. Twitter/X 공유 카드에 사이트 계정이 표시되지 않음.
- **재현:** 상세 페이지 → `document.querySelector('meta[name="twitter:site"]')` → null
- **해결:** 아이템 페이지 템플릿에 `twitter:site` content="@gear_forest" 추가. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-83] ✅ 해결완료(2026-06-12) — 상품상세 페이지 스크롤-투-탑 버튼 없음
- **영역:** 상품상세
- **URL:** https://gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 긴 스펙 테이블·관련 상품 섹션까지 스크롤 후 상단 복귀 수단이 없음. fixed position 스크롤-투-탑 버튼 미구현.
- **재현:** 상세 페이지 → 맨 아래 스크롤 → 상단 이동 버튼 없음
- **해결:** `<button class="scroll-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">` 추가. style.css 스타일. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [L-82] ✅ 해결완료(2026-06-12) — 비교 모달 '세트로 저장' 버튼 더블클릭 시 동일 세트 중복 저장
- **영역:** 카테고리/목록 — 비교 모달
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 비교 모달의 '세트로 저장' 버튼을 빠르게 더블클릭하면 동일 세트가 2개 저장됨.
- **해결:** onclick 핸들러 시작에 `if (btn.disabled) return;` + 즉시 `btn.disabled = true` 설정. [site/app.js](site/app.js)
- **원인:** onclick 핸들러 진입 시 on-entry guard(플래그)가 없어 브라우저가 두 클릭 이벤트를 큐에 넣어 연속 실행 가능.
- **재현:** 2~3개 제품 비교 선택 → 비교하기 → '세트로 저장' 빠른 더블클릭 → 마이페이지에 동일 세트 2개

### [L-81] ✅ 해결완료(2026-06-12, 사전 적용 확인) — 홈 검색 combobox `aria-label` 누락
- **영역:** 홈/메인 — 전역 검색
- **해결:** `app.js` line 482에 `inp.setAttribute("aria-label", "장비 검색")` 이미 적용됨(M-14 처리 시 함께 추가). 코드 확인으로 해소 확인.

### [L-27] ✅ 해결완료(2026-06-12) — 푸터에 법적 링크(개인정보처리방침·이용약관) 미존재
- **영역:** 홈/메인 — 공통 푸터
- **URL:** https://www.gear-forest.com/
- **증상:** 하단 푸터에 '개인정보처리방침', '이용약관' 링크가 없음. 국내 개인정보보호법·정보통신망법상 서비스 운영 시 필수 고지 항목. 저작권 표시(`© 2024 장비의 숲`)와 연락처 정보도 전무.
- **해결:** `LEGAL_LINKS` const로 개인정보처리방침·이용약관 링크 생성, 모든 페이지 푸터에 추가(홈/카테고리/브랜드/추천). [site/app.js](site/app.js)

### [M-110] ✅ 해결완료 — 비교 세트가 위치 인덱스를 저장해 정렬·필터 후 엉뚱한 상품 비교
- **영역:** 카테고리/목록 — 비교(⚖) 기능
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 상품을 비교에 추가한 뒤 정렬을 바꾸거나 필터를 적용하면, 비교 바의 선택 강조와 '비교하기' 모달이 처음 고른 제품이 아닌 다른 제품을 가리킨다. 앱의 핵심 가치(정직 비교)를 직접 훼손.
- **원인:** `_cmpSet`(app.js)이 모델 식별자가 아니라 필터·정렬로 매번 재계산되는 `rows` 배열의 **위치 인덱스**를 저장. `draw()`의 선택 강조(`_cmpSet.includes(i)`)와 `openCmpModal`의 항목 해석(`_cmpSet.map(i => rows[i])`)이 모두 이 휘발성 인덱스에 의존 → 정렬·필터로 순서가 바뀌면 같은 인덱스가 다른 모델을 가리킴. (카테고리 전환은 catnav가 full `<a href>`라 전체 리로드 → 모듈 재초기화로 자연 초기화되므로 무관)
- **재현:** 카테고리 → 제품 2개 ⚖ 비교 추가 → 정렬을 '가격 낮은순'으로 변경 → '비교하기' → 처음 고른 제품과 다른 제품이 비교됨.
- **해결(2026-06-11):** `_cmpSet`이 위치 인덱스가 아니라 **모델 객체 참조**를 저장하도록 변경(`toggleCmp(m, rows)`, `draw()` `includes(m)`, `openCmpModal` `items=_cmpSet.filter(Boolean)`). `rows`는 `d.models.filter()`라 객체 참조가 정렬·필터에도 동일 → 항상 같은 제품을 가리킴. `renderCategory` 진입 시 `_cmpSet=[]`+비교바 숨김(방어적). 프리뷰 검증 — 2개 선택 후 정렬을 '가격 낮은순'으로 바꿔 목록 상위가 전부 교체된 상태에서 '비교하기' 모달이 **처음 고른 두 제품 그대로** 표시(match=true), 콘솔 에러 0. [site/app.js](site/app.js)

### [L-94] ✅ 해결완료(2026-06-12) — 브랜드 드롭다운 상위 브랜드 선택 시 칩 `.on` 미반영
- **해결(2026-06-12):** `bsel.onchange` 핸들러에 `syncFilterUI()` 추가 → `[data-brand]` 칩 활성 상태 동기화. [site/app.js](site/app.js)

### [L-95] ✅ 해결완료(2026-06-12) — item 상세 페이지 app.js 캐시버스트 버전 고착
- **해결(2026-06-12):** `stamp_version.py`에 `site/item/` 하위 재귀 순회 추가 — `../../app.js?v=` 및 `../../style.css?v=` 패턴도 동기화. [pipeline/stamp_version.py](pipeline/stamp_version.py)
- **재현:** app.js 수정 → `stamp_version.py` 실행 → `grep -o 'app.js?v=[a-f0-9]*' site/item/mat/item-24.html` → 최상위 `category.html`의 버전과 불일치
- **권장:** stamp 파이프라인에 `build-item-pages.js` 재실행 포함, 또는 stamp_version.py가 `item/**`도 순회하고 `(\.\./)*app\.js` 패턴을 매치하도록 확장.

### [L-96] ✅ 해결완료(2026-06-12) — item 상세 페이지 BreadcrumbList 구조화 데이터 누락
- **영역:** 상품상세 (정적 `item/*.html`)
- **해결:** `build-item-pages.js`에 `BreadcrumbList` JSON-LD 생성 추가 — 홈(1)→카테고리(2)→현재상품(3) 3단계. Product JSON-LD와 별도 `<script type="application/ld+json">` 태그로 삽입. 2277개 재빌드. [scripts/build-item-pages.js](scripts/build-item-pages.js)

### [M-112] ✅ 해결완료(2026-06-12) — '이 세트로 커뮤니티 로그 작성' 클릭 시 앱 팅김
- **해결(2026-06-12):** `openLogModal()` 내 `body` null 가드 추가 — `#log-modal-body` 미존재 시 TypeError 방지. [site/app.js](site/app.js)

### [M-111] ✅ 해결완료(2026-06-11) — 홈 검색 Enter 무반응 (토큰 매칭 불일치)
- **해결(2026-06-11):** Enter 핸들러 폴백을 통문자열 includes 대신 토큰 AND 매칭(`terms2.every(tok => t.includes(tok))`)으로 교체. `run()`과 동일한 로직으로 `백패킹 mier` 입력 시에도 정상 이동. [site/app.js](site/app.js)

---

### [M-113] ✅ 해결완료(2026-06-11) — '구매하기' 버튼 외부 "구매 링크를 준비 중입니다" 텍스트 노출
- **해결(2026-06-11):** 쿠팡 링크 없는 경우 disabled 버튼 텍스트를 "🛒 구매 링크 준비 중"으로 변경하고 `<p class="item-buynote">` 제거. [scripts/build-item-pages.js](scripts/build-item-pages.js)

---

### [M-114] ✅ 기구현(2026-06-13 검증) — 상품 찜 버튼 — 비로그인 상태에서 찜 누를 시 로그인 유도 없이 로컬 저장만 처리됨

- **영역:** 상품 상세 / 목록 페이지
- **재현:** 비로그인 상태에서 찜(♡) 버튼 클릭
- **현재:** 로컬스토리지에만 저장되고 로그인 유도 없음
- **기대:** 로그인 프로세스로 강제 전환 (로그인 후 찜 동작 완료)
- **보고자:** 사용자 직접 제보 (2026-06-11)
- **심각도:** 🟡 Medium

---

### [M-115] ✅ 해결완료(2026-06-12) — 데스크톱 '탐색' 탭 클릭 시 좌측 빈 공간
- **해결(2026-06-12):** `renderBrowse()`에 `#cat-aside` 숨김 추가 — 카테고리 사이드바(220px)가 탐색 랜딩에서도 노출돼 생기던 빈 공간 제거. [site/app.js](site/app.js)
- **심각도:** 🟡 Medium

---

### [M-116] ✅ 해결완료(2026-06-13) — renderProfile() 매 인증 이벤트마다 재호출 → btnSignout·btnDelete addEventListener 누적
- **영역:** 계정/로그인 — account.html
- **URL:** https://gear-forest.com/account.html
- **증상:** 장시간 로그인 상태 유지 시(토큰 갱신·`TOKEN_REFRESHED` 이벤트 발화 시마다) 로그아웃/계정삭제 버튼에 클릭 이벤트 핸들러가 누적. 다음 로그아웃 클릭 시 `signOut()` 2회 이상 연속 호출, 계정삭제 시 `confirm()` 다이얼로그 2개 이상 중첩.
- **원인:** `initAuth` 콜백 내에서 매번 `renderProfile(profile)` 호출(account.html:389). `renderProfile` 내부가 `btnSignout.onclick = null; btnSignout.addEventListener(...)` 패턴으로 구현되어 있어 `onclick = null`은 인라인 핸들러만 제거하고 `addEventListener` 중첩을 막지 못함. 토큰 갱신마다 반복 등록.
- **재현:** 로그인 후 1시간 이상 탭 유지 → `TOKEN_REFRESHED` 이벤트 발화 → 로그아웃 클릭 → 2회 `signOut()` 호출 (콘솔에서 확인 가능)
- **수정 방향:** `renderProfile` 내 버튼 핸들러를 `onclick` 직접 할당(`btn.onclick = async () => {...}`)으로 교체하거나, 첫 호출 여부 플래그 추가. [site/account.html:327-352](site/account.html)
- **심각도:** 🟡 Medium

### [M-117] ✅ 해결완료(2026-06-13) — 로그아웃 후 재로그인 시 내 로그 섹션 stale — dataset.loaded 미초기화
- **영역:** 계정/로그인 — 내 로그 탭
- **URL:** https://gear-forest.com/account.html (로그 탭)
- **증상:** 로그아웃 후 동일 탭에서 재로그인(또는 다른 계정으로 전환)하면 내 로그 섹션이 이전 세션 데이터를 그대로 표시. 새 사용자의 로그를 fetch하지 않음.
- **원인:** app.js에서 `myLogsList.dataset.loaded = "1"` 설정 후 `if (!myLogsList.dataset.loaded)` 로 재fetch를 막음(app.js:2258). 로그아웃 시 DOM 엘리먼트가 재생성되지 않아 `dataset.loaded`가 잔류 → 신규 로그인 시에도 fetch 건너뜀.
- **재현:** 로그인 → 내 로그 탭 → 로그아웃 → 재로그인 → 내 로그 탭 → 이전 세션 로그 표시 (또는 빈 로딩 상태)
- **수정 방향:** 로그아웃 시(`user=null` 분기) `myLogsList.dataset.loaded = ""` 초기화 추가. [site/app.js:2258](site/app.js)
- **심각도:** 🟡 Medium

---

### [L-97] ✅ 해결완료(2026-06-13) — account.html 로그인 확정 분기에서 renderAccount() 2회 연속 호출
- **영역:** 계정/로그인 — account.html
- **증상:** 로그인 확정 시(profile.nickname 존재) renderAccount()가 line 388과 390 두 번 연속 호출되어 탭 상태가 한 프레임 내에서 두 번 계산됨. 체감 상 탭 active 상태 플래시 및 불필요한 DOM 조작.
- **원인:** account.html initAuth 콜백 내 renderAccount() (388행), renderProfile(profile) (389행), renderAccount() (390행) 순서 — 390행 renderAccount()가 388행의 것을 덮어씀.
- **수정 방향:** 388행 `renderAccount()` 제거(390행이 renderProfile 이후에 실행돼야 탭 상태가 정확하므로 390행만 유지). [site/account.html:388](site/account.html)
- **심각도:** 🟢 Low

### [L-98] ✅ 해결완료(2026-06-13, SOCIAL) — showLoggedInSections()가 sets-section·logs-section을 직접 관리하지 않음
- **해결:** `showLoggedInSections(false)` 분기에 `sets-section`·`logs-section` `display:none` 추가. show=true 시에는 renderAccount()가 담당하므로 show 방향은 변경 없음. `acc-tabs`는 FE-SOC-07에서 제거됨. [site/account.html](site/account.html)

### [L-99] ✅ 해결완료(2026-06-13) — syncGearSetsOnLogin — 원격 세트 로컬 ID를 r.id.toString(36)으로 생성
- **영역:** 계정/로그인 — 기어 세트 동기화
- **증상:** 원격 세트를 로컬로 병합 시 로컬 ID가 `r.id.toString(36)` (DB integer를 base36 변환: `1`→`"1"`, `36`→`"10"` 등)으로 설정됨. 기존 로컬 세트 ID는 `Date.now().toString(36)`("lp4xxxx" 16자리 형식)이라 포맷 불일치. 충돌 확률은 낮으나 세트 ID가 짧은 숫자 문자열("1","2")로 설정되어 세트 목록 순서·중복 판별 로직 혼선 가능.
- **원인:** account.html syncGearSetsOnLogin(176행) `id: r.id.toString(36) || Date.now().toString(36)`. DB `id`는 integer(예: 42), `.toString(36)`="16" — 빈 문자열이 아니므로 fallback이 발동하지 않음.
- **수정 방향:** `id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` 형식으로 일관성 확보. [site/account.html:176](site/account.html)
- **심각도:** 🟢 Low

---

### [L-100] ✅ 아카이브(커뮤니티/GNB 비활성화) — community.html — modulepreload 버전 vs import 버전 불일치
- **영역:** 커뮤니티/소셜 — 성능
- **URL:** https://gear-forest.com/community.html
- **증상:** `<link rel="modulepreload" href="supabaseClient.js?v=e6966f82">` (32행)와 실제 `import ... from './supabaseClient.js?v=8ae38532'` (119행)의 버전 해시가 다름. 브라우저가 `e6966f82`를 미리 받아두지만 실제 import는 `8ae38532`를 요청 → 프리로드 캐시 미적중, 추가 네트워크 왕복.
- **원인:** `stamp_version.py`가 `<script>` 내 import 버전은 업데이트했으나 `<link rel="modulepreload">` href는 패턴 미포함 (L-95와 동일 계열).
- **수정 방향:** `stamp_version.py`에 `modulepreload` href 버전 업데이트 패턴 추가. 또는 community.html 32행을 `v=8ae38532`로 직접 수정. [site/community.html:32](site/community.html)
- **심각도:** 🟢 Low

### [L-101] ✅ 아카이브(커뮤니티/GNB 비활성화) — renderDetail — initAuth 완료로 canParticipate 변경 시 #post=ID 상세보기 강제 재렌더
- **영역:** 커뮤니티/소셜 — 상세보기
- **URL:** https://gear-forest.com/community.html#post=<id>
- **증상:** `#post=ID` 로딩 중 `initAuth` 완료 → `canParticipate()` 변경 → `route()` 재호출 → `renderDetail(id)` 재실행 → 스피너 재표시·API 재요청·스크롤 초기화. 로그인 사용자가 직접 링크 접근 시 글이 두 번 깜빡임.
- **원인:** community.html `initAuth` 콜백(434행) `if (before !== canParticipate()) route()` 가 현재 해시 무관하게 전체 재렌더. `renderFeed`는 무해하나 `renderDetail`은 API 재요청을 수반.
- **수정 방향:** 상세 뷰에서는 `canParticipate()` 변경 시 좋아요·댓글폼·삭제버튼 등 인증 의존 UI만 패치. 또는 현재 해시가 `#post=`면 재렌더 생략. [site/community.html:434](site/community.html)
- **심각도:** 🟢 Low

---

### [M-118] ✅ 해결완료(2026-06-13) — app.js 동적 import가 버전 없는 `./supabaseClient.js` 사용 — GoTrueClient 이중 인스턴스화
- **영역:** 전체 (계정·커뮤니티·찜·세트 등 supabase 연동 기능)
- **URL:** https://gear-forest.com/ (account.html·index.html·category.html 등 app.js 로드 페이지 전체)
- **증상:** account.html·community.html 등은 `<script type="module">` 에서 `./supabaseClient.js?v=8ae38532` (버전 포함)으로 import. 그런데 app.js 내부의 17개 동적 import는 모두 `import("./supabaseClient.js")` (버전 없음). 브라우저가 두 개를 다른 모듈로 취급 → 두 번 모듈 평가 → `createClient()` 두 번 호출 → "Multiple GoTrueClient instances detected" 콘솔 경고 + auth 상태가 두 인스턴스 사이에서 분리될 수 있음.
- **재현:** account.html 접속 → 콘솔 확인 → "Multiple GoTrueClient instances" 경고. 또는 찜·세트·핫섹션 등 동적 import 경로 실행 후 로그인 상태가 두 인스턴스 중 하나에만 반영될 수 있음.
- **원인:** app.js의 동적 import 17곳(line 1422, 1551, 1590, 1659, 2071, 2271, 2336, 2352, 2664, 2698, 2794, 2862, 2869, 2932, 2938, 2948, 3135)이 `"./supabaseClient.js"` — 버전 파라미터 미포함. HTML 정적 import와 모듈 스펙터 불일치 → ES module 캐시 미적중 → 이중 로드.
- **수정 방향:** app.js 내 동적 import를 `"./supabaseClient.js?v=CURRENT_HASH"` 로 통일하거나, supabase singleton을 app.js 상단에서 한 번만 전역 임포트해 재사용. stamp_version.py가 동적 import URL도 버전 교체하도록 확장 필요. [site/app.js:1422,1551… (17곳)](site/app.js)
- **심각도:** 🟡 Medium

### [L-102] ✅ 해결완료(기구현·2026-06-12 검증) — `data/search.json?v=ad0b6b03` — app.js 하드코딩 버전, stamp_version.py 미관리
- **확인:** `stamp_version.py` line 28-41(M-76)이 이미 `app.js`의 `"data/search.json?v=..."` 리터럴을 search.json 내용해시로 자동 치환함. 검증: app.js 리터럴 `ad0b6b03` == 현재 search.json md5 `ad0b6b03` 일치. 추가 조치 불필요. (L-128 중복)
- **영역:** 홈/메인 — 검색 인덱스
- **URL:** https://gear-forest.com/ (검색 기능)
- **증상:** `setupHomeSearch`(app.js:473)에서 `data/search.json?v=ad0b6b03`로 검색 인덱스를 fetch. 이 버전 문자열은 하드코딩이라 stamp_version.py가 갱신하지 않음. search.json 내용이 변경돼도 브라우저는 이전 캐시를 재사용 → 신규 상품이 홈 검색에 미반영.
- **원인:** stamp_version.py 패턴이 `<link href>`, `<script src>`, `<link rel="modulepreload">`, `from '...'` 형태만 처리하고 JS 문자열 리터럴 내 URL은 미처리.
- **수정 방향:** stamp_version.py에 `data/search.json` 버전 갱신 패턴 추가. 또는 search.json을 버전 없이 fetch하고 서버 cache-control로 관리. [site/app.js:473](site/app.js)
- **심각도:** 🟢 Low

---

## 회차 62 — 카테고리/목록 (11순환) 2026-06-12

### [M-119] ✅ 해결완료(2026-06-12) — JSON-LD ItemList 개별 상품 url이 카테고리 URL로 고정
- **영역:** 카테고리/목록 — SEO
- **해결:** `draw()` ItemList의 각 `ListItem.item.url`을 `catUrl` → `https://gear-forest.com/item/${STATE.slug}/item-${d.models.indexOf(m)}.html` 개별 상세 URL로 교체. ItemList 최상위 `url`은 카테고리 URL 유지. [site/app.js](site/app.js)
- **심각도:** 🟡 Medium

### [L-103] ✅ 해결완료(M-62에서 기처리, 2026-06-12 검증) — 0건 empty state "전체 카테고리에서 검색" 링크 — 홈이 ?q= 파라미터를 처리하지 않음
- **영역:** 카테고리/목록 — UX
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent&q=헬리녹스 (0건 유도 시)
- **증상:** 필터+검색 결과 0건일 때 표시되는 "전체 카테고리에서 '헬리녹스' 검색 →" 링크가 `/?q=헬리녹스`로 이동. 그러나 홈(`renderHub`)은 URL의 `?q=` 파라미터를 읽지 않아 `homeq` 입력란이 비어있는 상태로 홈 화면만 표시됨. 사용자가 검색어를 다시 입력해야 함.
- **원인:** `app.js:1878` — 링크 href `/?q=${encodeURIComponent(STATE.q)}`. `setupHomeSearch(app.js:471)`는 URL params를 읽는 로직이 없음.
- **수정 방향:** `setupHomeSearch`에서 `new URLSearchParams(location.search).get("q")`로 초기 쿼리를 읽어 `homeq` 입력에 자동 설정 + 검색 실행. 또는 링크를 `category.html?q=${...}` (cat 없이)로 변경해 renderBrowse 전역 검색 활용. [site/app.js:1878](site/app.js)
- **심각도:** 🟢 Low

---

## 회차 63 — 상품상세 (11순환) 2026-06-12

### [M-120] ✅ 해결완료(2026-06-12) — openReviewDetail ESC 키 시 후기 상세와 상품 모달 동시 닫힘
- **해결:** onKey를 capture+stopImmediatePropagation로 등록 → ESC가 하위 상품모달 핸들러까지 전파되지 않게. 검증: ESC→후기만 닫힘·상품모달 open 유지. [site/app.js](site/app.js)
- **영역:** 상품상세 — 유저 후기 상세 오버레이
- **URL:** https://gear-forest.com/category.html?cat=backpacking-tent (상품 클릭 → 후기 카드 클릭 → ESC)
- **증상:** 상품 상세 모달에서 후기 카드 클릭 → `openReviewDetail` 오버레이 오픈 → ESC 키 입력 시 후기 상세 오버레이가 닫히고 동시에 상품 상세 모달도 닫힘. 사용자는 후기만 닫고 상품 상세로 돌아가려 했으나 모든 모달이 닫혀 목록으로 복귀됨.
- **원인:** `openProduct`(app.js:1495)와 `openReviewDetail`(app.js:1562) 각각 `document.addEventListener("keydown", onKey)` 등록. ESC 이벤트가 두 핸들러 모두에 전파됨. `openProduct`의 핸들러가 먼저 등록돼 있어 상품 모달 `close()` 실행 후, `openReviewDetail`의 핸들러까지 실행. 두 `close()` 모두 동작.
- **수정 방향:** `openReviewDetail`의 `onKey` 핸들러에서 `e.stopImmediatePropagation()` 추가 → 후기 상세 닫힘 후 상품 모달 ESC 전파 차단. 추가로 `openReviewDetail` 오픈 시 `.pmx` 버튼에 `focus()` 및 간단한 포커스 트랩 추가 권장. [site/app.js:1561](site/app.js)
- **재현:** 카테고리 → 상품 클릭 → 후기 있는 경우 후기 카드 클릭 → ESC → 두 모달 동시 닫힘
- **심각도:** 🟡 Medium

### [L-105] ✅ 해결완료(2026-06-12) — renderThumbs() 후기 사진 리렌더 시 이전 Blob URL 미해제
- **해결:** renderThumbs 재렌더 전 기존 img의 blob: URL `revokeObjectURL` 호출 — 누수 방지. [site/app.js](site/app.js)
- **영역:** 상품상세 — 후기 작성 폼 사진 업로드
- **증상:** 후기 작성 폼에서 사진 추가/삭제 시 `renderThumbs()`가 매번 `URL.createObjectURL(f)`로 새 Blob URL을 생성. 이전 렌더에서 생성한 Blob URL은 `URL.revokeObjectURL()` 미호출로 해제되지 않음. 사진 변경이 잦으면 Blob URL이 누적돼 메모리 사용량 증가 (사진 최대 4장이라 실제 영향은 미미).
- **원인:** `app.js:1653` `thumbsEl.innerHTML = photos.map((f, i) => \`...<img src="${URL.createObjectURL(f)}"...\`).join("")` — 이전 URL 해제 없이 매번 신규 URL 생성.
- **수정 방향:** `renderThumbs()` 상단에 기존 URL 해제 로직 추가: `thumbsEl.querySelectorAll("img").forEach(img => URL.revokeObjectURL(img.src));` 또는 URL 배열을 별도 관리해 교체 시 해제. [site/app.js:1651](site/app.js)
- **심각도:** 🟢 Low

### [L-106] ✅ 해결완료(2026-06-12) — openSetModal·openCmpModal — ESC 키 닫기 미지원
- **해결:** 두 모달에 `onKey`(ESC→close)+removeEventListener 추가(openProduct 패턴). 비교모달엔 포커스트랩·초기포커스도(M-127 동시). 검증: 비교모달 ESC 닫힘. [site/app.js](site/app.js)
- **영역:** 상품상세 — 세트 추가 모달, 스펙 비교 모달
- **증상:** `openSetModal`(set-modal)과 `openCmpModal`(cmp-modal) 모두 X 버튼 클릭과 바깥 클릭으로만 닫히며, ESC 키가 동작하지 않음. `openProduct` 모달은 ESC 지원됨 — 불일치.
- **원인:** `app.js:324`(openSetModal), `app.js:1801`(openCmpModal) 모두 `document.addEventListener("keydown", ...)` 미등록.
- **수정 방향:** 각 `open*Modal` 함수에 `openProduct`와 동일하게 `const onKey = e => { if (e.key === "Escape") close(); }; document.addEventListener("keydown", onKey);` 추가 + `close` 시 `removeEventListener`. [site/app.js:324](site/app.js)
- **심각도:** 🟢 Low

### [M-121] ✅ 기구현(기수정) — 상품 상세(정적 item 페이지) 히어로 액션 버튼 너비 불일치 — 레이아웃 깨짐
- **영역:** 상품상세 — 정적 item 페이지(`/item/{cat}/item-{idx}.html`) 히어로 영역
- **해결:** `.item-wish`를 `display:inline-flex`(자동폭) → `display:flex;justify-content:center;width:100%;max-width:320px;margin-top:14px;padding:11px 16px`로 변경해 나머지 3개 버튼(`.item-buy`/`.item-set-btn`/`.item-log-btn`, 320px)과 너비·정렬 통일. 검증: 찜하기·꾸러미 버튼 모두 320px(widthsMatch=true) 확인. item 2277+ 재생성. [scripts/build-item-pages.js](scripts/build-item-pages.js)
- **심각도:** 🟡 Medium

---

---

## R-64 커뮤니티/소셜 (12순환) — 2026-06-12

### [M-121] ✅ 아카이브(커뮤니티/GNB 비활성화) — listComments — 소프트 삭제 댓글 미필터 (deleted_at IS NULL 누락)
- **영역:** 커뮤니티/소셜 — 댓글 목록
- **증상:** `deleteComment()`는 `deleted_at` 설정 방식의 소프트 삭제이며 DB 트리거(migration 015)도 이를 기반으로 `comment_count`를 감소시킴. 그러나 `listComments()` 쿼리에 `deleted_at IS NULL` 필터가 없어 삭제된 댓글이 게시글 상세 페이지에 그대로 노출됨.
- **원인:** `supabaseClient.js:147` — `.select('*,...').eq('post_id', postId).order(...)` — `.is('deleted_at', null)` 조건 미포함.
- **수정 방향:** `supabaseClient.js:150` `.order('created_at', ...)` 앞에 `.is('deleted_at', null)` 추가. [site/supabaseClient.js:150](site/supabaseClient.js)
- **심각도:** 🟡 Medium

### [M-122] ✅ 아카이브(커뮤니티/GNB 비활성화) — getPost — 소프트 삭제 게시글 상세 직접 접근 가능 (deleted_at IS NULL 누락)
- **영역:** 커뮤니티/소셜 — 게시글 상세
- **증상:** `deletePost()`는 `deleted_at` 소프트 삭제이지만 `getPost(id)` 쿼리에 `deleted_at IS NULL` 필터가 없어 삭제된 게시글 URL(`#post=<id>`)을 통해 내용 전체가 노출됨. 피드 목록에서는 보이지 않지만 URL 직접 접근 시 삭제 전 내용 조회 가능.
- **원인:** `supabaseClient.js:125` — `.select(POST_SELECT).eq('id', id).maybeSingle()` — `.is('deleted_at', null)` 미포함.
- **수정 방향:** `supabaseClient.js:126` `.eq('id', id)` 뒤에 `.is('deleted_at', null)` 추가. [site/supabaseClient.js:126](site/supabaseClient.js)
- **심각도:** 🟡 Medium

### [L-107] ✅ 아카이브(커뮤니티/GNB 비활성화) — community.html 피드 카드 `<a>` href 없음 — 키보드 접근 불가
- **영역:** 커뮤니티/소셜 — 피드 목록
- **증상:** 게시글 카드가 `<a class="cm-post" data-id="...">` 로 렌더링되는데 `href` 속성이 없음. HTML spec상 href 없는 `<a>`는 interactive element가 아니므로 Tab 키 포커스가 안 되고 스크린리더에서 링크로 인식되지 않음. 마우스 클릭만 동작.
- **원인:** `community.html:181` — `<a class="cm-post" data-id="${esc(p.id)}">` — `href` 미포함. `onclick`을 `location.hash` 변경으로 처리하면서 href 생략.
- **수정 방향:** `href="#post=${p.id}"` 추가로 키보드 접근성 및 스크린리더 인식 개선. [site/community.html:181](site/community.html)
- **심각도:** 🟢 Low

### [L-108] ✅ 아카이브(커뮤니티/GNB 비활성화) — renderCompose — 업로드 이미지 작성 취소·이탈 시 orphan Storage 파일
- **영역:** 커뮤니티/소셜 — 게시글 작성 폼
- **증상:** 사진 선택 시 `uploadImage(f)` 호출로 즉시 Supabase Storage에 업로드됨. "취소" 클릭 또는 페이지 이탈 시 `pending` URL은 버려지지만 `review-images/{user_id}/{uuid}.ext` 파일은 Storage에 orphan으로 남음.
- **원인:** `community.html:254` — 파일 선택 즉시 업로드 후 `pending.push(r.url)`. 취소 시 Storage 파일 삭제 로직 없음.
- **수정 방향:** 취소 핸들러에서 `pending` URL들의 Storage path를 역산해 `supabase.storage.from(IMG_BUCKET).remove([path])` 호출. [site/community.html:231](site/community.html)
- **심각도:** 🟢 Low

---

### [L-109] ✅ 해결완료(2026-06-12) — 모바일 — 슬라이드 필터 트랙이 화면 우측 끝까지 닿지 않음
- **해결:** `.dslider{max-width:280px}`가 전체폭 모바일 필터바에서 우측 여백을 남김 → `@media(max-width:640px){.dslider{max-width:none}}`로 컨테이너 100% 채움. 검증: 390px서 슬라이더 358px==컨테이너폭. [site/style.css](site/style.css)

- **영역:** 카테고리/목록 페이지 — 가격·최소무게·내수압·바닥면적 슬라이더
- **재현:** 모바일(핸드폰) 화면 크기에서 필터 슬라이더 확인
- **현재:** 슬라이더 트랙이 화면 우측 여백까지 채워지지 않고 중간에서 끊김
- **기대:** 슬라이더가 컨테이너 너비에 맞게 100% 렌더링
- **보고자:** 사용자 직접 제보 (2026-06-12)
- **심각도:** 🟢 Low

---

*다음 회차: 계정/로그인 (12순환)*

---

## R-65 계정/로그인 (12순환) — 2026-06-12

### [M-123] ✅ 해결완료(2026-06-13) — 첫 로그인 닉네임 설정 완료 후 syncGearSetsOnLogin 미호출 — 세트 동기화 누락
- **영역:** 계정/로그인 — 닉네임 설정 모달
- **증상:** 처음 로그인한 사용자가 닉네임 설정을 완료하면 `syncWishlistOnLogin()`만 호출되고 `syncGearSetsOnLogin(user.id)`는 호출되지 않음. 이로 인해 로컬 세트가 서버에 업로드되지 않고 서버 세트가 로컬에 병합되지 않음. `initAuth`의 `SIGNED_IN` 분기에서 `syncGearSetsOnLogin`을 호출하지만 닉네임 미설정 사용자는 early return으로 해당 분기에 진입하지 않음.
- **원인:** `account.html:247-260` — `setNickname` 성공 후 `syncWishlistOnLogin()` 만 호출. `syncGearSetsOnLogin(user.id)` 미포함.
- **수정 방향:** `account.html:259` `syncWishlistOnLogin()` 다음 줄에 `const u = await getUser(); if (u) syncGearSetsOnLogin(u.id)` 추가. [site/account.html:259](site/account.html)
- **심각도:** 🟡 Medium

### [L-109] ✅ 해결완료(기구현·2026-06-13 검증) — initAuth 콜백에서 renderAccount() 중복 호출 — 찜·세트·로그 이중 렌더
- **영역:** 계정/로그인 — account.html initAuth 콜백
- **증상:** 로그인 상태 콜백 line 388에서 `renderAccount()`가 1회 호출되고 line 390에서 `if (typeof renderAccount === 'function') renderAccount()`로 또 1회 호출됨. 찜 목록·세트·로그가 두 번 렌더링되어 불필요한 DOM 조작 발생.
- **원인:** `account.html:388` + `account.html:390` — 동일 함수 연속 두 번 호출.
- **수정 방향:** `account.html:390`의 두 번째 `renderAccount()` 호출 제거. [site/account.html:390](site/account.html)
- **심각도:** 🟢 Low

---

*다음 회차: 홈/메인 (13순환)*

---

## R-66 홈/메인 (13순환) — 2026-06-12

### [L-110] ✅ 해결완료(2026-06-13) — renderHub — account_deleted=1 URL param 미처리 → 계정 삭제 완료 메시지 없음
- **영역:** 홈/메인 — 홈 진입 처리
- **증상:** `account.html`에서 계정 삭제 성공 시 `location.href = 'index.html?account_deleted=1'`로 홈으로 리디렉션되지만, `renderHub()`는 `?account_deleted=1` 파라미터를 읽지 않아 성공 안내 메시지를 표시하지 않음. 사용자 입장에서 계정이 정말 삭제된 건지 피드백이 없음.
- **원인:** `app.js renderHub()` 내에 `new URLSearchParams(location.search).get("account_deleted")` 처리 코드가 없음.
- **수정 방향:** `renderHub()` 진입부에서 `account_deleted=1` 감지 시 토스트 또는 인트로바 형태로 "계정이 삭제되었습니다" 안내를 1회 표시하고 URL에서 파라미터 제거 (`history.replaceState`). [site/app.js:435](site/app.js)
- **심각도:** 🟢 Low

---

*다음 회차: 카테고리/목록 (13순환)*

---

## R-67 카테고리/목록 (13순환) — 2026-06-12

### [M-124] ✅ 해결완료(2026-06-12) — draw() 카드 href — 필터/정렬 인덱스 사용으로 잘못된 상품 정적 페이지 링크
- **영역:** 카테고리/목록 — 상품 카드 링크
- **해결:** `.pli` 카드 href를 `item-${i}`(rows 인덱스) → `item-${d.models.indexOf(m)}`(원본 인덱스)로 변경. L-03(카드 a태그화)에서 유입된 회귀. 검증: 정렬된 목록 2번째 카드 → item-50.html, 해당 페이지 H1="니모이큅먼트 아폴로 3P"로 카드 라벨과 일치 확인. [site/app.js](site/app.js)
- **심각도:** 🟡 Medium

---

*다음 회차: 상품상세 (13순환)*

---

### [M-116] ✅ 해결완료(2026-06-13, CORE) — 상품 카드 — ⚠️ 신고 버튼 아이콘 의미 불명확, UX 개선 필요
- **처리:** app.js `.pmreport` 버튼 제거 → 모달 하단 `.pm-report-link` "상품의 정보가 달라요" 텍스트 버튼으로 교체. style.css pm-report-row/link 스타일(muted·underline). build-item-pages.js 정적 페이지 링크 텍스트 동일 문구로 통일, 2875개 재생성. 프리뷰 검증: ⚠️ 버튼 없음·하단 링크 렌더 확인.

- **영역:** 카테고리/목록 — 상품 카드 우상단 ⚠️ 버튼
- **현재:** 경고 아이콘(⚠️) 버튼으로 노출 → 사용자가 기능을 인지 못함
- **기대:**
  - 아이콘 버튼 제거
  - 상품 상세 페이지 **최하단**에 텍스트 하이퍼링크 "상품의 정보가 달라요" 배치
  - 스타일: 옅은 회색(`color: var(--muted)` 또는 유사), 작은 폰트, 밑줄
- **보고자:** 사용자 직접 제보 (2026-06-12)
- **심각도:** 🟡 Medium

---

## R-68 상품상세 (13순환) — 2026-06-12

### [L-111] ✅ 해결완료(2026-06-13) — 후기 작성 — 부분 사진 업로드 실패 시 이미 업로드된 이미지 orphan
- **영역:** 상품상세 — 후기 작성 폼 제출
- **증상:** 후기 작성 시 복수 사진 업로드 중 중간 실패(두 번째 사진 오류 등)가 발생하면 앞서 성공한 사진은 `review-images` Storage에 남아 orphan이 됨. L-108(community.html)과 동일 패턴으로 review 제출 흐름에도 동일하게 존재.
- **원인:** `app.js:1781-1785` — 사진 순차 업로드 루프에서 실패 시 `return`하지만 이미 `urls`에 들어간 업로드 완료 파일은 Storage에서 삭제하지 않음.
- **수정 방향:** 업로드 실패 시 `urls` 배열에 이미 쌓인 경로들을 `supabase.storage.from(IMG_BUCKET).remove([paths])` 로 정리 후 return. [site/app.js:1783](site/app.js)
- **심각도:** 🟢 Low

### [L-112] ✅ 해결완료(2026-06-12) — openProduct — #pmodal 외부 div와 내부 .pmbox 모두 role="dialog" 중첩
- **해결:** `#pmodal`·`#set-modal` 외부 div 생성 시 `role="dialog"`·`aria-modal` 제거 — 내부 `.pmbox`에만 유지. 검증: 외부 role none, 내부 dialog. [site/app.js](site/app.js)
- **영역:** 상품상세 — 상품 상세 모달 접근성
- **증상:** `#pmodal` 외부 컨테이너(backdrop)와 내부 `.pmbox` 모두 `role="dialog" aria-modal="true"`가 설정돼 스크린리더가 dialog 진입을 두 번 고지하거나 예기치 않은 동작 가능. WAI-ARIA spec상 nested `role="dialog"`는 anti-pattern.
- **원인:** `app.js:1480` — modal 생성 시 `modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true")` 설정. `app.js:1493` — innerHTML로 `<div class="pmbox" role="dialog" aria-modal="true" ...>` 삽입으로 중첩.
- **수정 방향:** 외부 `#pmodal`의 `role`·`aria-modal` 속성 제거 (내부 `.pmbox`에만 유지). [site/app.js:1480](site/app.js)
- **심각도:** 🟢 Low

---

*다음 회차: 계정/로그인 (13순환)*

---

## R-69 계정/로그인 (13순환) — 2026-06-12

### [M-125] ✅ 해결완료(2026-06-12) — 닉네임 설정 모달 — save 클릭 시 `clearTimeout(debounce)` 미호출 → `enable(true)` 경쟁 조건으로 중복 setNickname 가능
- **영역:** 계정/로그인 — 닉네임 설정 모달
- **심각도:** 🟡 Medium
- **증상:** 닉네임 입력 중(마지막 키 입력 후 320ms 이내) 바로 "시작하기" 클릭 시, `save.addEventListener` 핸들러가 `clearTimeout(debounce)` 없이 `setNickname(v)` await을 시작함. 320ms 뒤 debounce 타이머가 발화해 `isNicknameAvailable` 결과에 따라 `enable(true)`(`save.disabled = false`) 호출 가능 → `setNickname` 완료 전 버튼 재활성화 → 사용자가 한 번 더 클릭하면 `setNickname(v)` 두 번 호출.
- **원인:** `account.html` `renderNicknameModal` save 클릭 핸들러(line ~247)에 `clearTimeout(debounce)` 누락.
- **수정:** save 클릭 핸들러 첫 줄에 `clearTimeout(debounce)` 추가.
- **파일:** [site/account.html](site/account.html) line ~247

### [L-113] ✅ 해결완료(2026-06-13) — `wish-bulk-add` 버튼 — `renderAccount()` 재호출 시 `disabled` 상태 미초기화, 찜 0개 시 DOM 잔존
- **영역:** 계정/로그인 — 찜 탭
- **심각도:** 🟢 Low
- **증상:** ①"찜한 N개 전체 → 새 세트로 저장" 버튼 클릭 후 `disabled=true` 세팅. 이후 `renderAccount()` 재호출 시 `bulkBtn.textContent`·`onclick`은 갱신되나 `bulkBtn.disabled = false` 재설정 없어 버튼이 영구 비활성화됨. ②찜을 모두 제거하면 `wishEl.innerHTML = ""`로 목록은 초기화되나 `bulkBtn`(`#wish-bulk-add`)은 `wishEl.after()` 위치에 잔존 — 찜 0개 상태에서도 버튼이 DOM에 남음.
- **원인:** `app.js` 내 `renderAccount()` 찜 섹션 렌더링 로직(line ~2613)에서 `bulkBtn.disabled = false` 초기화 및 `wishes.length === 0` 시 `bulkBtn` 숨김/제거 코드 누락.
- **수정:** `if (wishEl && wishes.length)` 블록 내 `bulkBtn.disabled = false` 추가; `else` 블록에 `bulkBtn = document.getElementById("wish-bulk-add"); if (bulkBtn) bulkBtn.style.display = "none"` 추가.
- **파일:** [site/app.js](site/app.js) line ~2613

### [L-114] ✅ 해결완료(2026-06-13) — 공유 세트(`?view-set`) import — 로그인 상태에서 `upsertGearSet` 미호출 → 현재 세션 내 Supabase 동기화 없음
- **영역:** 계정/로그인 — 내 세트 (세트 공유 수신)
- **심각도:** 🟢 Low
- **증상:** `?view-set=BASE64`로 공유 세트를 열고 "내 세트에 추가" 클릭 시, 로그인 여부와 무관하게 localStorage에만 저장(`getSets()`→`saveSets()`). 로그인 상태에서도 `upsertGearSet(newSet, userId)` 미호출로 Supabase `gear_sets` 테이블에는 즉시 반영되지 않음. 로그아웃 후 재로그인 시 `syncGearSetsOnLogin`의 `toUpsert`(remoteId 없는 세트) 경로를 통해 뒤늦게 동기화됨 — 그 전에 다른 기기로 로그인하면 해당 세트 유실.
- **원인:** `app.js` `?view-set` 처리 블록(line ~3381) 내 import 핸들러에 `upsertGearSet` 호출 누락.
- **수정:** `saveSets(arr)` 후 `if (window._accUser) { import("./supabaseClient.js").then(({ upsertGearSet }) => upsertGearSet(newSet, window._accUser.id).then(id => { if (id) { newSet.remoteId = id; saveSets(getSets()); }})) }` 추가.
- **파일:** [site/app.js](site/app.js) line ~3381

### [L-115] ✅ 해결완료(기구현·2026-06-13 검증) — `acc-tabs` 내 로그 탭 레이블에 카운트 배지 없음 — 찜·세트와 불일치
- **영역:** 계정/로그인 — 탭 바
- **심각도:** 🟢 Low
- **증상:** `renderAccount()` 내 탭 레이블 갱신 로직(line ~2760)에서 찜(`❤️ 찜목록 3`)·세트(`🎒 내 세트 2`)는 localStorage 기반 카운트 배지를 표시하지만, 내 로그 탭(`📝 내 로그`)은 Supabase 비동기 로드 후에도 배지 없음. 로그 수가 로드된 후 `logscount` 스팬은 갱신되나 탭 레이블 자체는 변경 안 됨.
- **원인:** `app.js:2762` `logs: \`📝 내 로그\`` — 카운트 배지 템플릿 미적용. `logscount.textContent` 갱신 시 탭 레이블도 함께 업데이트하는 로직 없음.
- **수정:** 로그 로드 성공 후(`logsCnt.textContent = ...` 설정 시점) 탭 레이블도 `b.innerHTML = \`📝 내 로그 <span>...\`` 갱신 로직 추가 (단, 비동기 특성상 초기 렌더 후 반영).
- **파일:** [site/app.js](site/app.js) line ~2762

*다음 회차: 홈/메인 (14순환)*

---

## R-70 홈/메인 (14순환) — 2026-06-12

### [M-126] ✅ 해결완료(2026-06-12) — `renderHotSection` 비동기 완료 시 `#hot-section` display:none→block 전환으로 하단 콘텐츠 CLS 발생
- **해결:** `index.html` `#hot-section`에서 `display:none` 제거 + `#hot-list`에 스켈레톤(`.hot-skel`) 삽입, `style.css`에 `#hot-section{min-height:92px}`로 공간 예약. 비동기 fill이 display 토글 없이 제자리 교체 → CLS 제거. 검증: 로드 직후 display=block·minHeight=92px. [site/index.html](site/index.html) · [site/style.css](site/style.css)
- **영역:** 홈/메인 — 이번 주 인기 섹션
- **심각도:** 🟡 Medium
- **증상:** `#hot-section`은 초기 HTML에서 `display:none`으로 숨겨져 있으며 `renderHub()`에서 `renderHotSection()` 호출은 await 없이 fire-and-forget. Supabase RPC(`get_hot_items`) 응답 후 `sec.style.display = "block"`으로 전환될 때 아래 위치한 `#personas`·`#grid`·footer가 아래로 밀리며 Cumulative Layout Shift(CLS) 발생. Lighthouse CLS 지표 영향.
- **원인:** `app.js:510` `renderHotSection(m.categories)` — await 없이 비동기 실행. `#hot-section`이 초기 HTML에서 공간을 예약하지 않아 삽입 시 레이아웃 이동.
- **수정 방향:** `#hot-section`에 `min-height` 또는 skeleton 높이를 CSS로 예약(예: `min-height:80px`)하거나, `#personas·#grid` 위가 아닌 아래로 위치 이동.
- **파일:** [site/app.js](site/app.js) line ~510, [site/index.html](site/index.html) line ~61

### [L-116] ✅ 해결완료(2026-06-12) — `renderHub()` 데이터 로드 실패 시 개발용 "(로컬서버 필요)" 메시지 사용자에게 노출
- **해결:** catch 메시지 `"데이터를 불러오지 못했습니다. (로컬서버 필요)"` → `"데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요."` [site/app.js](site/app.js)
- **영역:** 홈/메인 — 카테고리 그리드
- **심각도:** 🟢 Low
- **증상:** `data/manifest.json` fetch 실패 시 `#lead`에 `"데이터를 불러오지 못했습니다. (로컬서버 필요)"` 출력. 프로덕션 네트워크 장애 시 일반 사용자에게 개발 환경용 안내("로컬서버 필요")가 노출되어 혼란 유발.
- **원인:** `app.js:487` catch 블록 메시지 하드코딩.
- **수정:** `"잠시 후 다시 시도해주세요."` 등 사용자 친화적 메시지로 교체.
- **파일:** [site/app.js](site/app.js) line ~487

### [L-117] ✅ 해결완료(2026-06-12) — 홈 검색결과 listbox(`#homeres`) 내 `sres-footer` div — `role` 없어 ARIA `listbox` 규격 위반
- **해결:** `.sres-footer` div 2곳(결과수·카테고리탐색)에 `role="presentation"` 추가 → listbox 자식 ARIA 규격 준수. 검증: footer role=presentation. [site/app.js](site/app.js)
- **영역:** 홈/메인 — 전역 검색
- **심각도:** 🟢 Low
- **증상:** `#homeres`에 `role="listbox"` 적용됨. 내부 검색결과 항목들은 `role="option"` 부여되나, 하단 `<div class="sres-footer">` 및 `<div class="sres nd" role="option" aria-disabled="true">`(결과 없음)는 비표준 구조. `listbox` 자식은 `option` 또는 `group`/`presentation`이어야 하는데 `sres-footer`에 role 없어 ARIA 트리 오염.
- **원인:** `app.js:693` `sres-footer` div 생성 시 `role="presentation"` 미부여.
- **수정:** `sres-footer`에 `role="presentation"` 추가.
- **파일:** [site/app.js](site/app.js) line ~693

### [L-118] ✅ 해결완료(2026-06-12) — `#pwa-banner` 동적 삽입 시 `role="alert"` 또는 `aria-live` 미적용 — 스크린리더 미고지
- **해결:** `beforeinstallprompt` 핸들러에서 banner에 `role="alert"` + `aria-live="polite"` 부여 후 innerHTML 삽입. [site/app.js](site/app.js)
- **영역:** 홈/메인 — PWA 설치 배너
- **심각도:** 🟢 Low
- **증상:** `beforeinstallprompt` 이벤트 후 `#pwa-banner`에 innerHTML 삽입되어 배너가 동적으로 나타나지만, 배너 요소에 `role="alert"` 또는 `aria-live="polite"` 없어 스크린리더 사용자에게 배너 출현이 고지되지 않음.
- **원인:** `app.js:25-51` `beforeinstallprompt` 핸들러 내 banner 요소에 role/aria-live 미설정.
- **수정:** `banner` 요소에 `role="alert"` 또는 `aria-live="polite"` 추가.
- **파일:** [site/app.js](site/app.js) line ~25

*다음 회차: 카테고리/목록 (14순환)*

---

## R-71 카테고리/목록 (14순환) — 2026-06-12

### [M-127] ✅ 해결완료(2026-06-12) — `openCmpModal()` ESC 키 핸들러 및 포커스 트랩 없음
- **해결:** 비교모달에 `onKey`(ESC 닫기 + Tab 순환 포커스트랩) + 초기 포커스(`.pmx`) 추가. 검증: 모달 열림 시 X버튼 포커스, ESC 닫힘. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 스펙 비교 모달
- **심각도:** 🟡 Medium
- **증상:** `openCmpModal()`(line ~1919)로 열리는 비교 모달에 ESC 키 닫기 핸들러와 포커스 트랩이 없음. 비교 모달 열린 상태에서 ESC 키를 눌러도 닫히지 않으며, Tab 키가 모달 밖으로 빠져나감. `openProduct()`(line ~1550)는 동일 구조에 ESC 핸들러(`onKey`)·포커스 트랩·초기 포커스(`xbtn.focus()`)가 모두 구현돼 있으나 비교 모달은 누락.
- **원인:** `app.js:1967` 닫기 버튼 `.onclick`만 설정하고 `document.addEventListener("keydown", onKey)` 미등록. 포커스 관리 코드도 없음.
- **수정:** `openProduct()`의 `onKey`·포커스 트랩 패턴과 동일하게 비교 모달에도 적용(ESC 감지 후 `modal.classList.remove("on")`·`removeEventListener` 호출, Tab 순환).
- **파일:** [site/app.js](site/app.js) line ~1967

### [L-119] ✅ 해결완료(2026-06-12) — `buildFilters()` 내 인원·브랜드·프리셋 토글 버튼 `aria-pressed` 누락
- **해결:** 인원(`data-cap`)·브랜드(`data-brand`)·프리셋(`.fpre`) 버튼에 `aria-pressed` 초기값 + `syncFilterUI`·`syncPresetOn`에서 `.on` 토글과 함께 동기화. 검증: cap=2 활성 시 해당 버튼 aria-pressed=true. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 필터바
- **심각도:** 🟢 Low
- **증상:** `buildFilters()`(line ~1105)에서 생성되는 인원 버튼(`data-cap`, line ~1115), 브랜드 칩(`data-brand`, line ~1205), 빠른설정 프리셋 칩(`.fpre`, line ~1272)에 `aria-pressed` 속성이 없음. 활성 상태는 `.on` CSS 클래스로만 표현되어 스크린리더가 선택 여부를 감지 불가. 정렬 칩(`.schip`)은 L-16 수정으로 `aria-pressed` 적용됨 — 필터 토글 버튼만 미적용으로 일관성도 깨짐.
- **원인:** `buildFilters()` 내 filter chip 생성 HTML에 `aria-pressed` 속성 미포함. `syncFilterUI()` 내에서도 `setAttribute("aria-pressed", ...)` 호출 없음.
- **수정:** 인원·브랜드·프리셋 버튼 생성 시 `aria-pressed="false"` 초기값 설정; `syncFilterUI()` 및 클릭 핸들러에서 `setAttribute("aria-pressed", ...)` 갱신.
- **파일:** [site/app.js](site/app.js) line ~1115, ~1205, ~1272, ~1454

### [L-120] ✅ 해결완료(2026-06-12) — `renderStyleChips()` 스타일 칩 버튼 `aria-pressed` 누락
- **해결:** `.sc-chip` 생성 시 `aria-pressed` 초기값 + 클릭 핸들러서 전 칩 `setAttribute("aria-pressed", ...)` 갱신. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 캠핑 스타일 칩
- **심각도:** 🟢 Low
- **증상:** `renderStyleChips()`(line ~903)에서 생성되는 `.sc-chip` 버튼에 `aria-pressed` 속성 없음. 활성 스타일은 `.on` CSS 클래스만으로 표현. 클릭 핸들러(line ~920)에서 `STATE.campStyle`에 따라 `.on` 클래스를 토글하지만 `aria-pressed` 갱신은 없음. 스크린리더 사용자가 선택된 캠핑 스타일을 인지 불가.
- **원인:** 스타일 칩 `<button>` 생성 HTML 및 클릭 핸들러에 `aria-pressed` 속성 처리 미포함.
- **수정:** 칩 생성 시 `aria-pressed="${STATE.campStyle === s.key}"` 추가; 클릭 핸들러 내 모든 칩 `setAttribute("aria-pressed", b.dataset.style === STATE.campStyle)` 갱신.
- **파일:** [site/app.js](site/app.js) line ~916, ~923

### [L-121] ✅ 해결완료(2026-06-12) — `filtoggle` 버튼 `aria-expanded`·`aria-controls` 누락 — 필터 열림/닫힘 상태 미고지
- **해결:** `#filtoggle`에 `aria-controls="filters"` + `syncLabel()`서 `aria-expanded` 갱신. 검증: expanded=true, controls=filters. [site/app.js](site/app.js)
- **추가발견:** L-03(카드 a태그화) 회귀 — `.pli-wish`/`.pli-cmp` 버튼이 `<a class=pli>` 내부라 클릭 시 stopPropagation만으론 카드 기본 네비게이션 발생 → 두 핸들러에 `e.preventDefault()` 추가. 검증: 비교/찜 버튼 클릭 시 페이지 이탈 없음. [site/app.js](site/app.js)
- **영역:** 카테고리/목록 — 필터 토글 버튼
- **심각도:** 🟢 Low
- **증상:** `buildFilters()`(line ~1291)에서 생성되는 `#filtoggle` 버튼이 `#filters` 영역의 펼침/접힘을 제어하지만 `aria-expanded` 및 `aria-controls` 속성이 없음. `syncLabel()` 함수가 텍스트를 "필터 펼치기 ▾"/"필터 접기 ▴"로 변경하여 시각적 힌트는 있으나, `aria-expanded` 없이 보조기술이 영역의 열림 상태를 프로그래밍적으로 파악 불가.
- **원인:** 버튼 생성 HTML에 `aria-expanded` 미설정, `aria-controls="filters"` 미설정. `syncLabel()` 내 `setAttribute("aria-expanded", ...)` 갱신 코드 없음.
- **수정:** 버튼 생성 시 `aria-expanded="true" aria-controls="filters"` 추가; `syncLabel()` 내 `tg.setAttribute("aria-expanded", !bar.classList.contains("collapsed"))` 호출 추가.
- **파일:** [site/app.js](site/app.js) line ~1292, ~1295

*다음 회차: 상품상세 (14순환)*

---

## R-72 상품상세 (14순환) — 2026-06-12

### [M-128] ✅ 해결완료(2026-06-12) — `openProduct()` · `openReviewDetail()` — 외부 오버레이와 내부 `.pmbox` 양쪽에 `role="dialog"` 중복 설정
- **해결:** `openProduct`는 Batch 8 L-112서 외부 role 제거 완료. 이번에 `openReviewDetail` 외부 `#pmrv-detail` role/aria-modal 제거(내부 `.pmbox`만 dialog). 검증: 외부 none·내부 dialog.
- **영역:** 상품상세 — 제품 상세 모달 / 후기 상세 모달
- **심각도:** 🟡 Medium
- **증상:** `openProduct()`(line ~1550)에서 외부 컨테이너 `#pmodal`에 `modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true")` 설정 후, `modal.innerHTML`로 삽입하는 내부 `.pmbox`에도 `role="dialog" aria-modal="true" aria-labelledby="pm-title"` 중복 부여. `openReviewDetail()`(line ~1713)도 동일하게 외부 `#pmrv-detail`과 내부 `.pmbox pmrvd-box` 양쪽에 `role="dialog"`. ARIA 기준상 `role="dialog"`는 단일 요소에만 지정해야 하며, 외부 오버레이(backdrop)가 아닌 내부 콘텐츠 박스에만 위치해야 한다. 외부 오버레이에 role이 있어 `aria-labelledby`도 내부 요소와 연결이 끊김.
- **원인:** `openProduct()` 초기화 블록(line ~1550)에서 외부 컨테이너에 role 설정 후, `innerHTML` 재생성 시 내부 `.pmbox`에도 동일 속성 반복. `openReviewDetail()`(line ~1713)도 동일 패턴.
- **수정:** 외부 컨테이너(`#pmodal`, `#pmrv-detail`)에서 `role="dialog"`·`aria-modal="true"` 제거. `aria-labelledby`는 외부 컨테이너에 추가(내부 pmbox에서는 유지). 내부 `.pmbox`의 `role="dialog" aria-modal="true"`는 유지.
- **파일:** [site/app.js](site/app.js) line ~1550, ~1563, ~1713, ~1716

### [L-122] ✅ 해결완료(2026-06-12) — `openReviewDetail()` 포커스 관리 완전 누락 — 초기 포커스·복귀·트랩 모두 없음
- **해결:** openReviewDetail에 초기포커스(.pmx)·prevFocus 복귀·Tab 포커스트랩 추가(openProduct 패턴). 검증: 열림 시 X버튼 포커스. [site/app.js](site/app.js)
- **영역:** 상품상세 — 후기 상세 라이트박스 모달
- **심각도:** 🟢 Low
- **증상:** `openReviewDetail()`(line ~1711) 모달 open 시 ① 닫기 버튼에 초기 포커스 미설정 ② 모달 닫힐 때 이전 포커스 복귀 코드 없음 ③ Tab 키가 모달 밖으로 탈출하는 포커스 트랩 없음. `openProduct()`는 `prevFocus` 캡처 → `xbtn.focus()` → 포커스 트랩(H-29 수정) 모두 구현됨. 두 모달이 함께 사용되는 상황(후기 카드 클릭)에서 후기 상세만 접근성 수준이 떨어짐.
- **원인:** `openReviewDetail()` 구현 시 `openProduct()`의 포커스 관리 패턴 미적용.
- **수정:** `openProduct()` 패턴 동일 적용: `const prevFocus = document.activeElement`, `ov.querySelector(".pmx").focus()`, Tab/Shift+Tab 순환 포커스 트랩 추가. `close()` 내 `if (prevFocus) prevFocus.focus()` 추가.
- **파일:** [site/app.js](site/app.js) line ~1711

### [L-123] ✅ 해결완료(기구현·2026-06-12 검증) — `site/item/**` 정적 페이지 `style.css?v=` 해시가 `stamp_version.py` 갱신 대상 제외 — CSS 변경 후 구버전 CSS 캐시 가능
- **확인:** `stamp_version.py` line 44-58(L-95)이 이미 item 페이지의 `../../app.js?v=`·`../../style.css?v=`를 매 스탬프마다 재기록함. 검증: style.css md5 `5c1374d1` == item-0 참조 `style.css?v=5c1374d1` 일치. 추가 조치 불필요.
- **영역:** 상품상세 — 정적 상품 상세 페이지 (2277개)
- **심각도:** 🟢 Low
- **증상:** `stamp_version.py` 실행 시 `site/item/**` 페이지는 업데이트 대상 제외. CSS 변경 후 stamp가 실행돼도 item 페이지들의 `style.css?v=...` 해시는 갱신되지 않아 구버전 CSS를 캐시할 수 있음. stamp_version.py 갱신 대상은 `community.html, index.html, category.html, recommend.html, account.html, brand.html` 만이며 `site/item/**` 제외. 향후 CSS 변경 후 코어 HTML만 갱신되면 item 페이지와 버전 불일치 발생 가능.
- **원인:** `stamp_version.py`의 업데이트 대상 파일 목록에 `site/item/**/*.html` 미포함. Item 페이지는 `build-item-pages.js` 재실행 시에만 최신 해시 반영.
- **수정:** CSS/JS 변경 시 item 페이지 재빌드(`node scripts/build-item-pages.js`) 필수 단계 추가. 또는 `stamp_version.py`가 item 페이지도 포함하도록 확장.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py), `site/item/**/*.html`

*다음 회차: 계정/로그인 (14순환)*

---

## R-73 계정/로그인 (14순환) — 2026-06-12

### [M-129] ✅ 해결완료(Batch 8 기처리·2026-06-12 검증) — `openSetModal()` — 외부·내부 이중 `role="dialog"` + ESC 닫기 핸들러 없음
- **해결:** Batch 8에서 L-112(외부 `#set-modal` role/aria-modal 제거 — 내부 `.pmbox.sm-box`에만 dialog 유지)·L-106(onKey ESC 닫기 + removeEventListener)로 동시 해결됨. 검증: set-modal 외부 role 없음(line 312)·내부 dialog 단일·ESC 핸들러 존재. (수정 방향은 내부 제거였으나 외부 제거+내부 유지가 WAI-ARIA상 올바른 선택 — 결과는 동일하게 단일 dialog)
- **영역:** 계정/로그인 — 세트 담기 모달
- **심각도:** 🟡 Medium
- **증상:** `openSetModal()`(line ~309)에서 외부 컨테이너 `#set-modal`에 `modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true")` 설정 후(line ~312), `modal.innerHTML`로 삽입하는 내부 `.pmbox.sm-box`에도 `role="dialog" aria-modal="true"` 중복 부여(line ~321). M-128과 동일한 이중 dialog 패턴. 또한 `close()` 함수는 있으나 `document.addEventListener("keydown", onKey)` 미등록으로 ESC 닫기 불가 — M-127 패턴. `modal.querySelector(".pmx").focus()` 초기 포커스는 구현됨.
- **원인:** `openSetModal()` 구현 시 M-127·M-128에서 확인된 두 패턴이 모두 적용되지 않음.
- **수정:** 내부 `.pmbox.sm-box`의 `role="dialog" aria-modal="true"` 제거(외부 컨테이너에만 유지); ESC 핸들러(`document.addEventListener("keydown", onKey)`) 추가 및 `close()` 내 `removeEventListener` 호출.
- **파일:** [site/app.js](site/app.js) line ~312, ~321, ~333

### [L-124] ✅ 아카이브(FE-SOC-07 탭→섹션 전환으로 moot) — `#acc-tabs` 탭 버튼 ARIA 탭 시멘틱 미적용 — 선택 상태 스크린리더 미전달
- **영역:** 계정/로그인 — 찜목록·세트·로그 탭 바
- **심각도:** 🟢 Low
- **증상:** `account.html` `#acc-tabs` 컨테이너에 `role="tablist"` 없음. 내부 `.acc-tab` 버튼들에 `role="tab"` 및 `aria-selected` 없음. `_accSetTab()`(line ~2430)에서 `.active` CSS 클래스만 토글하며 `setAttribute("aria-selected", ...)` 호출 없음. 스크린리더가 어느 탭이 선택됐는지 파악 불가.
- **원인:** `account.html:53-57` 탭 구조 마크업과 `_accSetTab()` 내 ARIA 상태 갱신 코드 모두 미구현.
- **수정:** `#acc-tabs`에 `role="tablist"` 추가. 각 `.acc-tab` 버튼에 `role="tab" aria-selected="false"` 초기값 추가. `_accSetTab()` 내 `b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false")` 갱신 추가.
- **파일:** [site/account.html](site/account.html) line ~53, [site/app.js](site/app.js) line ~2430 [lane:SOCIAL]

### [L-125] ✅ 아카이브(커뮤니티/GNB 비활성화) — `account.html` 로그 섹션 상단 정적 `+ 새 로그` 링크가 `COMMUNITY_ENABLED` 플래그 무시
- **영역:** 계정/로그인 — 내 로그 섹션
- **심각도:** 🟢 Low
- **증상:** `account.html:78`에 `<a class="achip clear" href="community.html">+ 새 로그</a>` 정적 링크가 항상 노출. `renderAccount()`(app.js line ~2503)에서 동일 섹션 내 JS 생성 링크들은 `COMMUNITY_ENABLED ? ... : ""` 조건으로 숨겨지나, HTML에 하드코딩된 이 링크는 조건 없이 노출. 커뮤니티가 임시 숨김(`COMMUNITY_ENABLED=false`) 상태에서도 클릭 시 community.html로 이동.
- **원인:** `account.html:78` 정적 HTML 링크에 `style="display:none"` 또는 JS 조건 제어 미적용.
- **수정:** `account.html:78` 링크에 `id` 부여 후 `renderAccount()` 초기화 시 `COMMUNITY_ENABLED` 플래그에 따라 `display` 제어. 또는 `renderAccount()` 내 `#logs-section` 헤더 영역도 동적 렌더링으로 교체.
- **파일:** [site/account.html](site/account.html) line ~78 [lane:SOCIAL]

### [L-126] ✅ 해결완료(2026-06-12, CORE) — 무게 목표 설정 다이얼로그 `role="dialog"` · `aria-modal` · ESC 핸들러 모두 없음
- **처리:** `renderAccount()` 무게목표 다이얼로그(app.js ~line 2858)에 `role="dialog"`·`aria-modal="true"`·`aria-labelledby="goal-title"` + h2 `id="goal-title"` 추가. `closeGoal()`로 통합(ESC 핸들러·prevFocus 복귀·초기 포커스 `.pmx`). 라이브검증은 배포 후.
- **영역:** 계정/로그인 — 내 세트 무게 목표 설정
- **심각도:** 🟢 Low
- **증상:** `renderAccount()` 내 무게 목표 설정 다이얼로그(line ~2738) 생성 시 `dialog.className = "pmodal on"` 만 설정. `dialog.setAttribute("role","dialog")`·`aria-modal="true"`·`aria-labelledby` 모두 없음. 시각적으로는 동일한 `pmodal` 모달 오버레이로 나타나지만 스크린리더가 모달 진입을 감지 불가. ESC 닫기 핸들러도 없음(backdrop 클릭 또는 ✕ 버튼만 가능).
- **원인:** 임시 팝업 다이얼로그 생성 시 ARIA 마크업 및 ESC 핸들러 미적용.
- **수정:** `dialog.setAttribute("role","dialog"); dialog.setAttribute("aria-modal","true"); dialog.setAttribute("aria-labelledby","goal-title")` 추가; h2에 `id="goal-title"` 추가; ESC 키 핸들러 추가.
- **파일:** [site/app.js](site/app.js) line ~2738

*다음 회차: 홈/메인 (15순환)*

---

## R-74 홈/메인 (15순환) — 2026-06-12

### [L-127] ✅ 해결완료(2026-06-12) — `renderHub()` introbar 닫기 버튼 — `ib.remove()` 후 포커스 body 이탈
- **해결:** 닫기 핸들러서 `ib.remove()` 전 `main h1`(없으면 `#homeq`) 참조 저장, 제거 후 `tabindex=-1` 부여+`.focus()`. 검증: 닫기 후 activeElement=H1(body 아님). [site/app.js](site/app.js)
- **영역:** 홈/메인 — 첫 진입 안내 배너
- **심각도:** 🟢 Low
- **증상:** `renderHub()`(line ~514)에서 introbar 닫기(.ix) 버튼 클릭 시 `ib.remove()`만 호출. 닫기 버튼 자체가 DOM에서 삭제되므로 포커스가 `<body>`로 떨어짐. 키보드 사용자가 포커스를 잃고 페이지 상단부터 다시 탐색해야 함.
- **원인:** `ib.remove()` 후 명시적 포커스 이동 코드 없음. 모달 닫기 `prevFocus.focus()` 패턴과 달리, introbar는 prevFocus 캡처 없이 DOM 제거.
- **수정:** `ib.remove()` 전 다음 포커스 대상(`main h1` 또는 `#homeq`) 참조 저장 후, 제거 후 `.focus()` 호출. `const nextFocus = document.querySelector("main h1") || document.querySelector("#homeq");` → `ib.remove();` → `nextFocus?.focus();`
- **파일:** [site/app.js](site/app.js) line ~514

### [L-128] ✅ 해결완료(기구현·2026-06-12 검증, L-102 중복) — `setupHomeSearch()` `data/search.json?v=ad0b6b03` — app.js 하드코딩, stamp_version.py 갱신 범위 밖
- **확인:** L-102와 동일 — `stamp_version.py`(M-76)가 이미 app.js의 search.json 버전을 내용해시로 자동 치환. 리터럴 `ad0b6b03` == search.json md5 일치 확인. 추가 조치 불필요.
- **영역:** 홈/메인 — 전역 검색
- **심각도:** 🟢 Low
- **증상:** `setupHomeSearch()`(line ~601)에서 `getJSON("data/search.json?v=ad0b6b03")` 호출 시 버전 쿼리 `?v=ad0b6b03`이 app.js 소스에 직접 리터럴로 박혀 있음. `stamp_version.py`는 `app.js`·`style.css` 해시를 HTML 파일에 주입하나, app.js 내부의 data 파일 버전은 갱신하지 않음. search.json 재생성 후 이 버전을 수동으로 업데이트하지 않으면 SW stale-while-revalidate 캐시에서 구버전 검색 인덱스가 서빙될 수 있음(L-123 패턴 변형).
- **원인:** data 파일 버전 관리를 stamp_version.py가 아닌 수동으로 관리. build-item-pages.js가 search.json 재생성 시 app.js의 해당 버전도 자동 갱신하는 파이프라인 없음.
- **수정:** `export_site.py`(`build-item-pages.js`) 내 search.json 생성 단계에서 파일 MD5 앞 8자리를 계산 후 `app.js` 내 `search.json?v=` 값을 자동 치환하거나, stamp_version.py에 data 파일 버전 갱신 로직 추가.
- **파일:** [site/app.js](site/app.js) line ~601

### [L-129] ✅ 해결완료(2026-06-12) — PWA 설치 배너 `role="alert"` + `aria-live="polite"` ARIA 의미 충돌
- **해결:** L-118서 넣은 `role="alert"`(assertive 내포) → `role="status"` 변경(+`aria-atomic="true"`). 비긴급 배너에 맞는 polite 시맨틱. 검증: role=status·aria-live=polite. [site/app.js](site/app.js)
- **영역:** 홈/메인 — PWA 설치 유도 배너
- **심각도:** 🟢 Low
- **증상:** `app.js` lines ~27-28에서 `banner.setAttribute("role", "alert")` + `banner.setAttribute("aria-live", "polite")` 조합 사용. WAI-ARIA 명세상 `role="alert"`는 `aria-live="assertive"`를 내포하며, 명시적 `aria-live` 설정이 우선이므로 "polite"로 재정의됨. 그러나 일부 AT(JAWS·NVDA)는 role=alert을 감지하면 aria-live 값과 무관하게 즉시 인터럽트 방식으로 고지할 수 있어, AT마다 동작이 달라짐. 비긴급 설치 유도 배너에 alert role 사용은 의미론적으로 부적절.
- **원인:** L-118 수정 시 비긴급 배너에 `role="alert"` 선택. 비긴급 동적 메시지에는 `role="status"` + `aria-live="polite"`가 올바른 패턴.
- **수정:** `banner.setAttribute("role", "alert")` → `banner.setAttribute("role", "status")` 변경. `aria-live="polite"`·`aria-atomic="true"` 유지.
- **파일:** [site/app.js](site/app.js) line ~27

### [L-130] ✅ 아카이브(커뮤니티/GNB 비활성화) — `sw.js` push/notificationclick 기본 URL이 `/community.html` 하드코딩 (`COMMUNITY_ENABLED=false` 무시)
- **영역:** 홈/메인 — PWA 푸시 알림
- **심각도:** 🟢 Low
- **증상:** `sw.js` line 82의 push 수신 핸들러 기본 data에 `data: { url: "/community.html" }`; line 95의 notificationclick 핸들러에 `const url = e.notification.data?.url \|\| "/community.html"`. 서버에서 URL을 지정하지 않은 알림 수신·클릭 시 항상 community.html로 라우팅. `COMMUNITY_ENABLED=false`로 커뮤니티 임시 숨김 상태에서 알림 클릭 시 사용자가 숨겨진 페이지로 이동.
- **원인:** sw.js에 COMMUNITY_ENABLED 플래그를 런타임에 확인할 방법 없음. 기본 URL을 홈(`/`)으로 변경해야 함.
- **수정:** `sw.js` line 82: `data: { url: "/" }` 변경. line 95: `\|\| "/community.html"` → `\|\| "/"` 변경.
- **파일:** [site/sw.js](site/sw.js) line ~82, ~95 [lane:SOCIAL]

### [L-131] ✅ 해결완료(2026-06-13) — `sw.js` notificationclick — 기존 탭 포커스 시 알림 URL로 미이동
- **영역:** 홈/메인 — PWA 푸시 알림 클릭
- **심각도:** 🟢 Low
- **증상:** `sw.js` lines 96-99: `clients.matchAll()`로 기존 열린 탭을 찾으면 `existing.focus()`만 호출하고 알림의 `url`로 이동하지 않음. 예를 들어 사용자가 카테고리 페이지를 보는 중 새 인기 상품 알림을 클릭하면 현재 탭에 포커스만 주어질 뿐 해당 상품 페이지로 이동되지 않음. `clients.openWindow(url)`은 새 탭이 없을 때만 호출됨.
- **원인:** `existing.focus()` 후 `existing.navigate?.(url)` 미호출 (또는 `postMessage` 미전송).
- **수정:** `existing.focus()` 후 `existing.postMessage({ type: "sw-navigate", url })` 전송; `app.js`에서 `navigator.serviceWorker.addEventListener("message", e => { if (e.data?.type === "sw-navigate") location.href = e.data.url; })` 수신 처리 추가. 또는 `clients.openWindow(url)` 항상 호출로 단순화.
- **파일:** [site/sw.js](site/sw.js) line ~96 [lane:SOCIAL]

*다음 회차: 카테고리/목록 (15순환)*

---

## R-75 카테고리/목록 (15순환) — 2026-06-12

### [L-132] ✅ 해결완료(2026-06-12) — `buildFilters()` 인원·브랜드 버튼 onclick에서 `aria-pressed` 미갱신 — L-119 부분 수정 누락
- **해결:** 인원·브랜드 onclick에서 `.on` 토글과 함께 `aria-pressed` 직접 갱신. 검증: cap=2 클릭→true·전체→false, 브랜드 클릭→true.
- **영역:** 카테고리/목록 — 인원·브랜드 필터 버튼
- **심각도:** 🟢 Low
- **증상:** `buildFilters()`(line ~1310-1320)의 인원 버튼과 브랜드 칩 onclick 핸들러에서 CSS `.on` 클래스만 수동 토글하고 `syncFilterUI()`를 호출하지 않음. 결과적으로 `aria-pressed`가 클릭 후에도 초기값 그대로 남음. L-119 수정은 HTML 생성 시 `aria-pressed` 초기값을 추가했고, `syncFilterUI()`(line ~1463)는 올바르게 갱신하나, cap/brand onclick 경로에서는 `syncFilterUI()`가 호출되지 않아 두 경로 간 불일치 발생.
- **원인:** 인원 onclick(line ~1311): `btn.classList.add("on"); STATE.cap = ...; draw();` — `syncFilterUI()` 미호출. 브랜드 onclick(line ~1316): `btn.classList.toggle("on"); draw();` — 동일 누락.
- **수정:** 인원 onclick에 `bar.querySelectorAll("[data-cap]").forEach(b => b.setAttribute("aria-pressed", String(b.classList.contains("on"))))` 추가, 또는 `draw()` 대신 `syncFilterUI(); draw();` 호출. 브랜드 onclick도 동일 패턴 적용.
- **파일:** [site/app.js](site/app.js) line ~1313, ~1319

### [L-133] ✅ 해결완료(2026-06-12) — `renderValueBanner()` `role="note"` + `aria-live` 없음 — 동적 배너 AT 미고지
- **해결:** 배너에 `aria-live="polite"` 추가(role=note 유지). 검증: role=note·aria-live=polite.
- **영역:** 카테고리/목록 — 가성비순 정렬 안내 배너
- **심각도:** 🟢 Low
- **증상:** `renderValueBanner()`(line ~1408)에서 동적 생성 배너에 `banner.setAttribute("role", "note")` 적용. `role="note"`는 라이브 영역이 아니므로, 정렬을 "가성비순"으로 변경할 때 배너가 동적으로 삽입되어도 AT 사용자에게 고지 안 됨. `role="alert"` 적용 사례(L-129)와 반대 방향이지만 같은 root cause — 동적 콘텐츠에 라이브 영역 미설정.
- **원인:** `role="note"` 자체는 의미론 맞으나 라이브 영역 특성 없음. 동적 삽입 후 AT가 읽어주려면 `aria-live="polite"` 필요.
- **수정:** `banner.setAttribute("role", "note")` 유지 + `banner.setAttribute("aria-live", "polite")` 추가. 또는 `role="status"`로 교체(`aria-live="polite"` + `aria-atomic="true"` 포함).
- **파일:** [site/app.js](site/app.js) line ~1408

### [L-134] ✅ 해결완료(2026-06-12) — `renderCatNav()` 활성 카테고리 링크에 `aria-current="page"` 없음
- **해결:** 활성 카테고리 `.navchip`에 `aria-current="page"` 추가. 검증: .navchip.on aria-current=page.
- **영역:** 카테고리/목록 — 카테고리 네비게이션 바
- **심각도:** 🟢 Low
- **증상:** `renderCatNav()`(line ~486-488)에서 현재 카테고리 링크에 CSS 클래스 `.on`만 적용. `aria-current="page"` 미설정. 스크린리더가 어느 카테고리가 현재 페이지인지 파악 불가 — WCAG 2.1 SC 1.3.1(정보와 관계) + 탐색 네비게이션 WAI-ARIA 패턴.
- **원인:** `renderCatNav()` 내 링크 생성 시 `${c.slug === activeSlug ? ' aria-current="page"' : ""}` 미포함.
- **수정:** `<a class="navchip${c.slug === activeSlug ? " on" : ""}" ${c.slug === activeSlug ? 'aria-current="page"' : ''} href="...">` — 활성 링크에 `aria-current="page"` 추가.
- **파일:** [site/app.js](site/app.js) line ~487

### [L-135] ✅ 해결완료(2026-06-12) — `updateCmpBar()` 비교 취소 ✕ 버튼 `aria-label` 없음
- **해결:** ✕ 버튼에 `aria-label="비교 선택 해제"` 추가. 검증 완료.
- **영역:** 카테고리/목록 — 비교 선택 바
- **심각도:** 🟢 Low
- **증상:** `updateCmpBar()`(line ~1935)에서 비교 취소 버튼 `<button class="cmp-bar-clear" id="cmp-clear">✕</button>` — 텍스트 내용이 "✕"(U+2715) 단독. AT가 "곱하기" 또는 "times" 등으로 읽을 수 있으며, 버튼 목적(비교 선택 해제) 미전달.
- **원인:** 비교 바 렌더링 시 ✕ 버튼에 `aria-label` 미지정. 같은 패턴의 다른 닫기 버튼(`.pmx`, `.pwa-dismiss-btn`)은 `aria-label="닫기"` 지정됨.
- **수정:** `<button type="button" class="cmp-bar-clear" id="cmp-clear" aria-label="비교 선택 해제">✕</button>` — `aria-label` 추가.
- **파일:** [site/app.js](site/app.js) line ~1935

*다음 회차: 상품상세 (15순환)*

---

## R-76 상품상세 (15순환·SOCIAL 레인) — 2026-06-12

### [L-136] ✅ 해결완료(기구현·2026-06-13 검증) — `loadRemoteGearSets()` — `getUser()` 가드·명시적 `user_id` 필터 없음 (RLS 단독 의존)
- **처리:** supabaseClient.js line 281 `loadRemoteGearSets()`에 이미 `getUser()` 가드 + `.eq('user_id', user.id)` 적용됨. 코드 변경 불필요.

### [L-137] ✅ 해결완료(2026-06-13) — `auth-callback.html` — `background:#fff` 하드코딩, `data-theme` 초기화 스크립트 없음
- **영역:** 인증 콜백 페이지
- **심각도:** 🟢 Low
- **증상:** `auth-callback.html:8`에 `body { background: #fff }` 하드코딩. 다크 모드 설정한 사용자가 OAuth 로그인 시 auth-callback.html에서 흰 화면이 잠깐 표시됨. `index.html`/`account.html`은 인라인 스크립트로 `localStorage.getItem('theme')`을 읽어 `data-theme=dark` 즉시 복원하지만, auth-callback.html에는 이 스크립트가 없음.
- **원인:** auth-callback.html 생성 시 다크 테마 초기화 패턴 미적용.
- **수정:** `<head>` 내 `<style>` 앞에 `<script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')</script>` 추가; CSS에서 `background: #fff` → `background: var(--bg, #fff)` 또는 미디어쿼리 `prefers-color-scheme:dark` 대응.
- **파일:** [site/auth-callback.html](site/auth-callback.html) line ~8

### [L-138] ✅ 해결완료(2026-06-13) — `auth-callback.html` — `getSession()` 경로에 `settled` 가드 없어 이중 `location.replace` 가능
- **영역:** 인증 콜백 — implicit flow 처리
- **심각도:** 🟢 Low
- **증상:** `auth-callback.html` lines 47-57: `onAuthStateChange` 리스너는 `settled` 플래그로 중복 실행을 막지만, 이후 `await supabase.auth.getSession()`(line 56) 결과 처리 블록(line 57)은 `settled` 를 확인하지 않음. 리스너가 먼저 발화해 `settled=true` + `location.replace('./account.html')` 호출 후, `getSession()`도 유효 세션 반환 시 `location.replace('./account.html')`를 다시 호출함. `subscription.unsubscribe()`도 이미 해제된 구독에 재호출. 현재는 동일 URL 이중 replace로 무해하나, 향후 이동 대상이 달라질 경우 레이스 조건 발생.
- **원인:** `getSession()` 블록에 `if (!settled)` 가드 누락.
- **수정:** `if (session) { settled = true; subscription.unsubscribe(); location.replace('./account.html'); }` → `if (session && !settled) { settled = true; subscription.unsubscribe(); location.replace('./account.html'); }` 로 변경.
- **파일:** [site/auth-callback.html](site/auth-callback.html) line ~57

### [L-139] ✅ 해결완료(2026-06-12) — `account.html` — 계정 삭제 후 `location.href` 사용으로 히스토리 잔존
- **영역:** 계정/인증 — 계정 삭제
- **심각도:** 🟢 Low
- **증상:** `account.html:350`에서 계정 삭제 완료 후 `location.href = 'index.html?account_deleted=1'` 사용. `location.href` 는 히스토리에 항목을 추가하므로, 사용자가 홈으로 이동 후 뒤로가기 버튼을 누르면 계정이 삭제된 상태의 account.html로 돌아와 혼란 유발. 삭제 완료 후에는 뒤로가기 진입을 차단하는 `location.replace()`가 적절.
- **원인:** 삭제 흐름 구현 시 `location.href` vs `location.replace()` 구분 미적용.
- **수정:** `location.href = 'index.html?account_deleted=1'` → `location.replace('index.html?account_deleted=1')`.
- **파일:** [site/account.html](site/account.html) line ~350

*다음 회차: 계정/로그인 (15순환)*

---

## R-77 계정/로그인 (15순환) — 2026-06-12

### [M-130] ✅ 해결완료(2026-06-12) — `bulkBtn` setItems 생성 시 `s`·`pcode`·`coupang_url` 필드 누락 — qtyMax fallback + 클릭 추적 불가
- **영역:** 계정 — 찜목록 "전체 세트 담기" 기능
- **심각도:** 🟡 Medium
- **증상:** `renderAccount()` line ~2697의 `bulkBtn` 핸들러에서 `setItems`를 `wishes.map(x => ({ b, m, cap, weight_g, qty, img, p }))` 로 생성. `s`(카테고리 슬러그), `pcode`, `coupang_url` 세 필드가 누락됨. `openSetDetail()` 내 `qtyMax(item.s)` 호출 시 `item.s === undefined` → fallback `4` 사용(실제 재고 한도 무시). `click_events` 집계 시 `item.s` 없어 카테고리별 클릭 추적 불가.
- **원인:** bulkBtn 구현 시 `wishes.map()` 에 `s: x.s`, `pcode: x.pcode ?? null`, `coupang_url: x.coupang_url ?? null` 미포함.
- **수정:** `wishes.map(x => ({ b: x.b, m: x.m, s: x.s, cap: x.cap ?? null, weight_g: x.weight_g ?? null, qty: 1, img: x.img ?? null, p: x.p ?? null, pcode: x.pcode ?? null, coupang_url: x.coupang_url ?? null }))` 로 교체.
- **파일:** [site/app.js](site/app.js) line ~2697 [lane:CORE]

### [L-140] ✅ 해결완료(2026-06-13) — `renderProfile()` — `onclick = null` + `addEventListener` 혼합 패턴으로 재호출 시 리스너 누적
- **영역:** 계정 — 프로필 렌더링 / 로그아웃·계정삭제 버튼
- **심각도:** 🟢 Low
- **증상:** `account.html` lines 307-350의 `renderProfile()`에서 `btnSignout.onclick = null; btnSignout.addEventListener('click', ...)` 혼합 사용. `onclick = null`은 `.onclick` 프로퍼티만 초기화하고 `addEventListener`로 등록된 리스너는 제거하지 않음. `renderProfile()`이 재호출될 때마다(M-116 초기화 시나리오) signOut·deleteAccount 리스너가 누적돼 버튼 클릭 1회에 중복 실행 가능.
- **원인:** `removeEventListener` 없이 `addEventListener`만 쌓음. 올바른 패턴은 `onclick = handler` 단일 방식이거나, `removeEventListener`로 이전 리스너 명시 제거.
- **수정:** `btnSignout.onclick = null; btnSignout.addEventListener(...)` → `btnSignout.onclick = async () => { await signOut(); ... }` 로 단일 `.onclick` 방식으로 통일. `btnDelete`도 동일 패턴 적용.
- **파일:** [site/account.html](site/account.html) line ~331 [lane:SOCIAL]

### [L-141] ✅ 해결완료(2026-06-13) — `supabaseClient.js` — `unhandledrejection` 전역 리스너 라이브러리 모듈 최상위에 등록
- **영역:** 공통 — supabaseClient.js 사이드이펙트
- **심각도:** 🟢 Low
- **증상:** `supabaseClient.js` lines 305-307에 `window.addEventListener('unhandledrejection', e => console.error(...))` 등록. 라이브러리 모듈 최상위에서 전역 이벤트 핸들러를 등록하면 Supabase 외 모든 페이지 rejection을 가로챔. `e.preventDefault()` 없어 브라우저 콘솔 경고 억제도 안 되며 단순 duplicate `console.error` 추가 효과뿐. 앱 코드의 에러 처리 로직과 충돌 가능.
- **원인:** 디버깅용 핸들러를 라이브러리 파일에 남긴 것으로 추정. 앱 진입점(app.js/index.html)이나 별도 error-boundary 모듈에 두어야 함.
- **수정:** `supabaseClient.js`의 `unhandledrejection` 핸들러 제거. 필요하면 `app.js` 초기화 블록에 이동.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line ~305 [lane:SOCIAL]

*다음 회차: 홈/메인 (16순환)*

---

## R-78 홈/메인 (16순환) — 2026-06-12

### [L-142] ✅ 해결완료(2026-06-12, CORE) — `openSetDetail` — ESC 핸들러·초기 포커스·`prevFocus` 복귀·`aria-labelledby` 모두 없음
- **처리:** app.js `openSetDetail`(~line 2484)에 `aria-labelledby="set-detail-title"` + h2 `id` 추가. `close()` 함수로 통합(ESC keydown·prevFocus 복귀·초기 포커스 `.pmx`). 재진입(수량 ±) 시 prevFocus 1회만 저장(`modal._prevFocus`)·이전 keydown 리스너 정리. `set-to-log-btn`도 `close()` 경유. 프리뷰 검증: 모달 open·role/aria-modal/aria-labelledby·초기포커스·ESC 닫기 모두 확인.
- **영역:** 홈/계정 — 장비 세트 상세 모달
- **심각도:** 🟢 Low
- **증상:** `openSetDetail()`(lines 2407-2432)에서 ① ESC 키 닫기 핸들러 없음(backdrop 클릭·X버튼만), ② `modal.classList.add("on")` 후 `.pmx.focus()` 미호출 → 포커스가 모달로 이동 안 됨, ③ `prevFocus` 저장·복귀 없어 닫을 때 포커스 소실, ④ `role="dialog"`가 있으나 `aria-labelledby`가 없어 AT가 다이얼로그 이름 미인식. `openSetModal()`(line 353: `.pmx.focus()`, line 335: ESC handler)·상품상세 `openProduct()`(line 1682: prevFocus)는 각각 일부 구현됨 — 일관성 부재.
- **원인:** openSetDetail 구현 시 다른 모달에 적용된 포커스·키보드 패턴 미적용.
- **수정:** ① `modal.classList.add("on")` 후 `const _prev = document.activeElement; modal.querySelector(".pmx").focus()` 추가. ② 닫기 함수에 `if (_prev?.focus) _prev.focus()` 추가. ③ `document.addEventListener("keydown", onEsc)` 등록(ESC 시 닫기). ④ 모달 내 `<h2>`에 id 추가 후 `modal.setAttribute("aria-labelledby", "...")`.
- **파일:** [site/app.js](site/app.js) line ~2430 [lane:CORE]

### [L-143] ✅ 해결완료(기구현·2026-06-12 검증) — `openSetModal` 닫기 시 `prevFocus` 미복귀 — 포커스 소실
- **영역:** 홈/카테고리/상품상세 — 장비 꾸러미에 담기 모달
- **심각도:** 🟢 Low
- **증상:** `openSetModal()`의 `close()` 함수(line ~334)에서 `modal.classList.remove("on")` 후 `prevFocus` 복귀 없음. ESC 닫기(L-106 ✅)와 이중 dialog role(M-129 ✅)은 수정됐으나 focus 복귀는 미처리. 닫힌 뒤 포커스가 `<body>`로 이동해 키보드 사용자가 모달 트리거 전 위치를 잃음. `openProduct()` line 1682의 `prevFocus` 패턴이 정석이나 `openSetModal()`에 미적용.
- **원인:** L-106·M-129 수정 시 prevFocus 복귀 로직 미포함.
- **수정:** `openSetModal()` 첫 줄에 `const prevFocus = document.activeElement;` 추가 후, `close()` 함수에 `if (prevFocus?.focus) prevFocus.focus();` 추가.
- **파일:** [site/app.js](site/app.js) line ~334 [lane:CORE]

### [L-144] ✅ 해결완료(기구현 확인) — `renderHub` — `#lead` 비동기 갱신에 `aria-live` 없음
- **처리:** index.html line 47 `aria-live="polite"` 이미 적용됨. 재현 불가.
- **영역:** 홈 — 메인 소개 문구
- **심각도:** 🟢 Low
- **증상:** `index.html:47`의 `<p class="lead" id="lead">불러오는 중…</p>`는 `renderHub()`에서 manifest.json 비동기 로드 후 `document.getElementById("lead").innerHTML = ...` (line ~500)으로 교체됨. `#lead`에 `aria-live` 없어, AT가 "불러오는 중…"을 먼저 읽은 뒤 실제 모델 수 업데이트를 고지받지 못함.
- **원인:** `#lead` 생성 시 `aria-live="polite"` 미설정.
- **수정:** `index.html:47` → `<p class="lead" id="lead" aria-live="polite" aria-atomic="true">불러오는 중…</p>` 로 변경. 또는 `renderHub()` 초기에 `lead.setAttribute("aria-live", "polite")` 추가.
- **파일:** [site/index.html](site/index.html) line 47 [lane:CORE]

*다음 회차: 카테고리/목록 (16순환)*

---

## R-79 카테고리/목록 (16순환·SOCIAL 레인) — 2026-06-12

### [L-145] ✅ 해결완료(2026-06-13) — `sw.js` install — `data/search.json` 버전 없이 프리캐시, 앱은 `?v=` URL로 요청 → 캐시 키 불일치로 프리캐시 미사용
- **영역:** 서비스워커 — 오프라인 캐시 / 홈 검색
- **심각도:** 🟢 Low
- **증상:** `sw.js` install 핸들러(line ~22)에서 `"data/search.json"` (버전 없음)을 `c.addAll()`에 포함. 그러나 앱은 `setupHomeSearch()`에서 `getJSON("data/search.json?v=ad0b6b03")` (L-128 추적 중)으로 요청. 서비스워커 캐시 키는 전체 URL이므로 `search.json`과 `search.json?v=...`는 별개 항목. 앱 요청 시 캐시 미스 → 네트워크 페치 후 `search.json?v=...`로 저장. 프리캐시된 `search.json` (298KB)는 영구 미사용 상태로 스토리지만 낭비.
- **원인:** install 프리캐시 목록에는 버전 없는 URL을 사용하나, 앱 코드는 버전 쿼리를 붙여 fetch — 두 경로가 불일치.
- **수정:** ① sw.js install 목록에서 `"data/search.json"` 제거(앱이 명시적 `?v=` URL을 쓰므로 프리캐시 불필요). 또는 ② L-128 수정 시 `search.json` 버전 쿼리를 stamp_version.py가 자동 관리하는 형태로 바꾸면서 sw.js URL도 동기화.
- **파일:** [site/sw.js](site/sw.js) line ~22 [lane:SOCIAL]

### [L-146] ✅ 해결완료(2026-06-12) — `syncGearSetsOnLogin()` — `remoteIds` 변수 선언 후 미사용 (데드 코드)
- **영역:** 계정 — 기어세트 로그인 동기화
- **심각도:** 🟢 Low
- **증상:** `account.html` `syncGearSetsOnLogin()` line 165: `const remoteIds = new Set(remote.map(r => r.id))` 선언 후 함수 내 어디에서도 `remoteIds`를 참조하지 않음. 실제 필터링은 `localLinked` (line 166)와 `.remoteId` 직접 비교(line 168)로 처리. `remoteIds`는 이전 구현의 잔여물로 추정.
- **원인:** 리팩터링 과정에서 `remoteIds`를 사용하던 로직을 다른 방식으로 대체했으나 선언문을 제거하지 않음.
- **수정:** `const remoteIds = new Set(remote.map(r => r.id))` 라인 삭제.
- **파일:** [site/account.html](site/account.html) line ~165 [lane:SOCIAL]

### [L-147] ✅ 해결완료(2026-06-12) — `syncWishlistOnLogin()` — `window.onWishChange` 할당이 비동기 완료 후 → 로그인 직후 위시리스트 변경 원격 저장 누락
- **영역:** 계정 — 위시리스트 로그인 동기화
- **심각도:** 🟢 Low
- **증상:** `syncWishlistOnLogin()`(line 185)에서 `window.onWishChange` 핸들러 등록(line 191)이 `await loadRemoteWishlist()` + `await saveRemoteWishlist()` 완료 후에 이루어짐. `SIGNED_IN` 이벤트 후 사용자가 200~500ms 이내에 카테고리 페이지에서 찜 버튼을 클릭하면, `app.js`의 `setWish()`가 `window.onWishChange`를 호출하지만 아직 null → 원격 저장 건너뜀. 로컬에는 저장되지만 원격 반영이 지연/누락됨.
- **원인:** 비동기 처리 순서상 `window.onWishChange`가 네트워크 I/O 완료 전에 활성화되지 않음.
- **수정:** `window.onWishChange = (items) => { saveRemoteWishlist(items) }` 할당을 `await loadRemoteWishlist()` 호출 전으로 이동. 동기 중 원격 저장이 중복 발생할 수 있으나 `upsert` 특성상 멱등.
- **파일:** [site/account.html](site/account.html) line ~191 [lane:SOCIAL]

---

## R-80 — 상품상세 (16순환) [2026-06-12]

### [M-131] ✅ moot(2026-06-12) — `openCmpModal` 세트저장 시 `s`·`pcode`·`coupang_url` 누락 — M-130 동일 패턴
- **처리:** 비교 모달이 `COMPARE_ENABLED=false`로 아카이브돼 도달 불가 → 세트저장 필드누락도 비활성. 복구 시 `setItem()` 헬퍼 사용 권장(M-130과 동일).
- **영역:** 상품상세 — 비교 모달 세트 저장
- **심각도:** 🟡 Medium
- **증상:** `openCmpModal()`(line 2024)에서 "세트로 저장" 버튼이 생성하는 `setItems`에 `s`(카테고리 슬러그), `pcode`, `coupang_url`이 빠져 있음. 저장된 세트를 `openSetDetail()`에서 열면 `qtyMax(item.s)`가 `undefined` → 폴백 4로 처리되고, 구매 버튼 클릭 시 `click_events` 카테고리 집계가 null로 들어가며, 세트 상세에서 상품별 쿠팡 링크를 생성할 수 없음.
- **원인:** `setItem()` 헬퍼 함수를 재사용하지 않고 인라인으로 객체를 수기 생성하면서 필드 누락. M-130(account.html bulkBtn)과 동일한 패턴.
- **수정:** 인라인 map을 `items.map(m => setItem(m, STATE.slug))` 로 교체. `setItem()`(app.js line ~303)은 `pcode`, `b`, `m`, `cap`, `s`, `p`, `img`, `weight_g`, `coupang_url`을 모두 포함.
- **파일:** [site/app.js](site/app.js) line ~2024 [lane:CORE]

### [L-148] ✅ 해결완료(기구현·2026-06-12 검증) — `openReviewDetail()` — 초기 포커스(`.pmx.focus()`) 없음, `prevFocus` 미복귀
- **영역:** 상품상세 — 리뷰 상세 오버레이
- **심각도:** 🟢 Low
- **증상:** `openReviewDetail()`(line 1744)은 ESC 핸들러는 있으나 (line 1761) 오버레이 열릴 때 닫기 버튼(`.pmx`)으로 포커스를 이동하지 않음. 닫을 때도 `prevFocus`를 복귀하지 않아 키보드/AT 사용자의 포커스가 모달 밖 임의 위치로 이동. `aria-labelledby`도 없어 대화상자 제목을 AT가 읽지 못함.
- **원인:** `openProduct()`(line 1684)의 `prevFocus` 패턴이 `openReviewDetail`에 미적용됨.
- **수정:** (1) 열기 전 `const prevFocus = document.activeElement` 저장, (2) `ov.classList.add("on")` 후 `ov.querySelector(".pmx").focus()` 추가, (3) `close()` 내 `prevFocus?.focus()` 복귀 — (1)~(3)은 L-122에서 기구현. (4) 다이얼로그 네이밍 보완: 후기 모달엔 제목 h2가 없어 `.pmrvd-box`에 `aria-label="{nick}님의 후기"` 추가(2026-06-12, CORE).
- **파일:** [site/app.js](site/app.js) line ~1744 [lane:CORE]

### [L-149] ✅ 해결완료(기구현·2026-06-12 검증) — `openCmpModal()` — `prevFocus` 미저장·미복귀
- **영역:** 상품상세 — 비교 모달
- **심각도:** 🟢 Low
- **증상:** `openCmpModal()`(line 1953)은 ESC, 포커스 트랩, `cmpX.focus()` 초기 포커스는 올바르게 구현되어 있으나, 모달 열기 전 `prevFocus = document.activeElement`를 저장하지 않고 `close()` 시 복귀도 없음. 비교 모달 닫은 후 키보드/AT 포커스가 DOM 최상단으로 이동.
- **원인:** `openProduct()`(line 1684) 패턴과 달리 `prevFocus` 변수가 선언되지 않음.
- **수정:** 모달 호출 시작부에 `const prevFocus = document.activeElement` 추가, `close()` 내 `prevFocus?.focus()` 복귀.
- **파일:** [site/app.js](site/app.js) line ~1953 [lane:CORE]

---

## R-81 — 계정/로그인 (16순환) [2026-06-12]

### [M-132] ✅ 해결완료(2026-06-12) — `initAuth()` — 합성 `'INITIAL'` + `INITIAL_SESSION` 이중 발화 → 콜백 2회 실행·getProfile 2회 호출
- **영역:** 계정 — 인증 초기화
- **심각도:** 🟡 Medium
- **증상:** `supabaseClient.js` `initAuth()`(line 19)는 `getSession()` 직후 `onStateChange(user, 'INITIAL')`를 동기 호출(line 22)한 뒤, `onAuthStateChange` 구독을 등록한다(line 23). Supabase SDK는 `onAuthStateChange` 등록 즉시 `INITIAL_SESSION` 이벤트를 발화하므로, 로그인 세션이 있는 상태에서 account.html 로드 시 콜백이 (`'INITIAL'`)→(`'INITIAL_SESSION'`) 2회 연속 실행된다. 각 실행이 `getProfile()`(서버 호출)을 시작하고 `renderAccount()`, `renderProfile()`까지 병렬 진행하므로 서버 네트워크 요청 2배 · 렌더링 중첩이 발생한다.
- **원인:** `initAuth` 내 합성 `'INITIAL'` 이벤트 패턴이 Supabase의 `INITIAL_SESSION` 자동 발화와 겹침. 콜백 내에 중복 실행 방어 로직 없음.
- **수정:** `initAuth`에서 line 22(`onStateChange(session?.user ?? null, 'INITIAL')`) 합성 호출 제거. `onAuthStateChange`의 `INITIAL_SESSION` 이벤트만으로 초기 상태 처리. 콜백 내 `event === 'INITIAL'` 분기가 있다면 함께 정리.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line ~22, [site/account.html](site/account.html) line ~367 [lane:SOCIAL]

### [L-150] ✅ 해결완료(2026-06-13) — 닉네임 설정 완료 후 `syncGearSetsOnLogin` 미호출 — 신규 사용자 로컬 기어세트 원격 미업로드
- **영역:** 계정 — 최초 로그인 닉네임 설정
- **심각도:** 🟢 Low
- **증상:** 최초 로그인(닉네임 미설정) 시 `initAuth` 콜백은 `renderNicknameModal()` 후 `return`하므로 line 393의 `syncGearSetsOnLogin(user.id)` 경로에 도달하지 않는다. 닉네임 저장 성공 후 `save` 클릭 핸들러(line 247)에서 `syncWishlistOnLogin()`은 호출하지만 `syncGearSetsOnLogin`은 호출하지 않는다. 닉네임 설정 전에 로컬 기어세트를 보유한 신규 사용자는 원격 동기화 기회를 영구적으로 놓친다(`SIGNED_IN` 이벤트는 이미 지나감).
- **원인:** `renderNicknameModal` 내 `save` 핸들러에 `syncGearSetsOnLogin` 호출 누락.
- **수정:** line 259(`syncWishlistOnLogin()`) 아래에 `syncGearSetsOnLogin(profile.id)` 추가. `profile`은 바로 위 `getProfile()` 반환값에서 획득 가능.
- **파일:** [site/account.html](site/account.html) line ~259 [lane:SOCIAL]

### [L-151] ✅ 해결완료(2026-06-13) — 닉네임 설정 모달 `#nick-hint` — `aria-live` 없음 → AT 사용자 유효성 피드백 미청취
- **영역:** 계정 — 닉네임 설정 모달 접근성
- **심각도:** 🟢 Low
- **증상:** `renderNicknameModal()`(line 196) 내 `#nick-hint` `<p>` 요소에 `aria-live` 속성이 없다. `setHint()` 함수가 텍스트를 동적으로 변경해도("사용 가능한 닉네임이에요 ✓", "이미 사용 중인 닉네임이에요", "확인 중…") AT가 자동으로 읽어주지 않는다. 스크린 리더 사용자는 포커스를 hint 요소로 직접 이동하지 않는 한 닉네임 검사 결과를 인지할 수 없어 저장 버튼 활성화 여부를 파악하기 어렵다.
- **원인:** `renderNicknameModal` 내 `#nick-hint` 요소 생성 시 `aria-live="polite"` 누락.
- **수정:** `renderNicknameModal` 템플릿 내 `<p id="nick-hint" ...>` 에 `aria-live="polite"` 추가.
- **파일:** [site/account.html](site/account.html) line ~206 [lane:SOCIAL]

---

## R-82 — 홈/메인 (17순환) [2026-06-12] [lane:SOCIAL]

### [M-133] ✅ 아카이브(커뮤니티/GNB 비활성화) — `community.html` `renderFeed` — `.cm-post` `<a>` href 없음 → 피드 전체 키보드/AT 접근 불가
- **영역:** 커뮤니티 — 피드 목록
- **심각도:** 🟡 Medium
- **증상:** `renderFeed()`(line 177)에서 게시글 카드를 `<a class="cm-post" data-id="...">` 로 렌더링하지만 `href` 속성이 없다. `href` 없는 `<a>` 요소는 브라우저 기본 탭 순서에 포함되지 않으므로, 키보드 사용자는 Tab으로 어떤 게시글에도 접근할 수 없다. 스크린 리더도 이를 링크가 아닌 일반 텍스트로 처리해 클릭 가능 여부를 안내하지 않는다. 마우스 `onclick` 핸들러(line 191)는 정상 동작하지만 키보드·AT 경로는 완전 차단.
- **원인:** `<a href="#post={id}">` 대신 `data-id`를 쓰고 JS onclick만 연결. `href` 없는 `<a>` = 포커스 불가.
- **수정:** `<a class="cm-post" href="#post=${esc(p.id)}" data-id="${esc(p.id)}">` 로 변경. href 추가 시 hashchange 리스너(line 386)가 자동으로 `renderDetail`을 호출하므로 별도 `onclick` 불필요.
- **파일:** [site/community.html](site/community.html) line ~181 [lane:SOCIAL]

### [L-152] ✅ 해결완료(2026-06-13) — `sw.js` `notificationclick` — URL 일치 탭 우선 탐색 없음 → 알림 대상 URL 대신 임의 탭 포커스
- **영역:** PWA — 푸시 알림 클릭
- **심각도:** 🟢 Low
- **증상:** `notificationclick` 핸들러(sw.js line 96)에서 `list.find((c) => c.url.includes(location.origin))`로 기존 탭을 탐색한다. 알림 대상 URL이 `/community.html`이어도 `account.html` 탭이 이미 열려있으면 account.html을 포커스하고 종료 — 사용자는 커뮤니티가 아닌 다른 화면을 보게 된다. `clients.openWindow(url)` 경로(새 탭)는 URL이 올바르지만, 기존 탭이 있을 때는 항상 URL 무시.
- **원인:** 탭 탐색 조건이 `origin` 포함 여부만 확인하며 `url`과의 일치 여부를 검사하지 않음.
- **수정:** `list.find((c) => c.url === url || c.url === new URL(url, location.origin).href)` 로 URL-일치 탭을 우선 탐색. 없으면 임의 탭에 `navigate(url)` 또는 새 탭 오픈.
- **파일:** [site/sw.js](site/sw.js) line ~96 [lane:SOCIAL]

### [L-153] ✅ 아카이브(커뮤니티/GNB 비활성화) — `community.html` `.cm-back` `<span onclick>` — 키보드/AT 뒤로가기 불가
- **영역:** 커뮤니티 — 네비게이션
- **심각도:** 🟢 Low
- **증상:** `renderCompose()`(line 199)와 `renderDetail()`(lines 280, 286, 297)의 "← 목록으로" 버튼이 `<span class="cm-back" onclick>` 로 구현되어 있다. `<span>` 은 기본적으로 키보드 포커스를 받지 않으므로 키보드/AT 사용자가 Tab으로 뒤로가기를 실행할 수 없다. 글쓰기 폼·상세 화면 진입 후 Esc·Tab으로는 목록 복귀 방법이 없음.
- **원인:** 클릭 전용 `<span>` 사용. `<button type="button">` 또는 `<a href="#">` 패턴 미적용.
- **수정:** `<span class="cm-back" ...>` → `<button type="button" class="cm-back" ...>` 로 교체 (CSS는 그대로 적용됨).
- **파일:** [site/community.html](site/community.html) line ~199, ~280, ~286, ~297 [lane:SOCIAL]

### [L-154] ✅ 아카이브(커뮤니티/GNB 비활성화) — `community.html` `renderDetail` `cm-like` 버튼 `aria-pressed` 없음 → AT 좋아요 상태 미공지
- **영역:** 커뮤니티 — 게시글 상세 좋아요
- **심각도:** 🟢 Low
- **증상:** `cm-like` 버튼(line 304)은 좋아요 상태를 `.on` CSS 클래스로만 표현한다(`aria-pressed` 없음). 스크린 리더 사용자는 현재 좋아요 상태를 알 수 없으며, 클릭 후 상태 변화도 청취하지 못한다. 토글 후 `likedState` 갱신 시 `aria-pressed`도 동기 업데이트 필요.
- **원인:** 토글 버튼 패턴에 필수인 `aria-pressed` 속성 누락.
- **수정:** 초기 렌더 시 `aria-pressed="${liked}"` 추가. `likeBtn.onclick` 핸들러 내 `likeBtn.setAttribute('aria-pressed', String(likedState))` 추가.
- **파일:** [site/community.html](site/community.html) line ~304, ~322 [lane:SOCIAL]

---

## R-83 — 카테고리/목록 (17순환) [2026-06-12]

### [L-155] ✅ 해결완료(기구현 확인) — `buildFilters` `syncPresetOn` — URL 복원 후 재호출 없음 → 공유·복원 URL에서 프리셋 버튼 `.on` 표시 누락
- **처리:** app.js `_syncPresetOn` 모듈 스코프 노출 + `syncFilterUI` 내 호출 확인(line 1559). 재현 불가.
- **영역:** 카테고리 — 필터 프리셋 UI
- **심각도:** 🟢 Low
- **증상:** `buildFilters()`(line 1149) 마지막에 `syncPresetOn()`(line 1332)을 호출하여 프리셋 버튼의 `.on` 클래스와 `aria-pressed`를 갱신한다. 그러나 이 호출은 `restoreState(params)`(line 1123) 실행 *전*에 이루어진다. `restoreState`가 `STATE.range`·`STATE.cap`를 복원해도 `syncPresetOn`은 재호출되지 않으며, 이후 `syncFilterUI()`(line 1128)도 프리셋 버튼을 포함하지 않는다. 결과: 공유 URL(예: `?weight_g__max=1000`)이나 뒤로가기로 진입 시 필터는 정상 적용되지만 "🪶 경량 우선" 등 프리셋 버튼이 비활성으로 표시된다.
- **원인:** `buildFilters` 내 `syncPresetOn` 로컬 함수가 반환 후 접근 불가. `syncFilterUI`에 프리셋 동기화 미포함.
- **수정:** `buildFilters`가 `syncPresetOn`을 반환하거나, 프리셋 동기화 로직을 `syncFilterUI`로 이관. `renderCategory`에서 `restoreState` 이후 해당 함수 호출.
- **파일:** [site/app.js](site/app.js) line ~1332, ~1128 [lane:CORE]

### [L-156] ✅ 해결완료(기구현 확인) — `renderActiveFilters` / `diagnoseEmpty` — EXTRA_SPECS 키 한국어 레이블 없음 → 활성 필터 칩·0건 힌트에 영문 raw key 노출
- **처리:** app.js `EXTRA_SPECS` 모듈 스코프 + `metricLabel()` fallback 구현 확인(line 1169, 1174). 재현 불가.
- **영역:** 카테고리 — 활성 필터 칩 / 0건 진단
- **심각도:** 🟢 Low
- **증상:** `renderActiveFilters()`(line 1482)와 `diagnoseEmpty()`(line 1598)에서 레이블 조회 시 `STATE.data.metrics.find(m => m.key === k).label`만 참조한다. `EXTRA_SPECS`(water_head, floor_area, comfort_temp, fill_weight, r_value, brightness 등)는 `d.metrics`에 없으므로 label 조회 실패 → 영문 raw key 표시. 내수압 슬라이더 활성 후 활성 필터 칩에 "water_head 범위 ✕"가, 0건 힌트에 "water_head 범위 조건을 빼면 N개"가 노출된다.
- **원인:** EXTRA_SPECS 메타데이터가 `buildFilters` 내에서만 정의되고 STATE에 저장되지 않음. label lookup이 `d.metrics`만 참조.
- **수정:** `buildFilters`의 EXTRA_SPECS 정보를 `STATE.extraSpecMeta = { [key]: { label, unit } }` 형태로 저장. `renderActiveFilters`·`diagnoseEmpty`의 레이블 조회 시 `STATE.extraSpecMeta[k]?.label`을 fallback으로 추가.
- **파일:** [site/app.js](site/app.js) line ~1482, ~1598 [lane:CORE]

---

## R-84 — 상품상세 (17순환) [2026-06-12]

### [M-134] ✅ 해결완료(2026-06-13) — `wireReviews` — 사진 업로드 성공 후 `reviews.insert` 실패 시 Storage 파일 고아(orphan)
- **영역:** 상품상세 — 후기 등록 폼
- **심각도:** 🟡 Medium
- **증상:** `form.onsubmit`(app.js line ~1946)에서 `photos` 배열의 파일을 `uploadImage(f)` 로 순차 업로드한 뒤 `supabase.from("reviews").insert(row)` 를 호출한다. INSERT가 실패(rate limit, RLS, 네트워크 오류 등)하면 이미 Storage에 업로드된 파일들이 `review-images` 버킷에 그대로 남는다. 사용자가 다시 "등록"을 누르면 기존 URL과 관계없이 새 UUID로 같은 파일을 재업로드 → 고아 파일 누적. 리뷰 삭제 기능이 없어 Storage 파일도 회수 불가.
- **원인:** 업로드 후 INSERT 실패 시 올라간 파일들을 `supabase.storage.from(IMG_BUCKET).remove(paths)` 로 롤백하는 코드 없음.
- **수정:** INSERT 실패 블록에서 `urls` 배열로 Storage 파일 삭제 시도 추가(실패해도 무시). 또는 처음부터 Pending 파일을 별도 폴더에 올리고 INSERT 성공 후 이동(copy-and-delete).
- **파일:** [site/app.js](site/app.js) line ~1946 [lane:CORE]

### [L-157] ✅ 기구현(2026-06-13 검증, aria-label 적용됨) — `openReviewDetail` — `role="dialog"` 요소에 `aria-labelledby` 없음
- **영역:** 상품상세 — 리뷰 상세 오버레이
- **심각도:** 🟢 Low
- **증상:** `openReviewDetail()`(line 1782)의 `<div class="pmbox pmrvd-box" role="dialog" aria-modal="true">` 에 `aria-labelledby` 속성이 없다. 스크린 리더는 대화상자를 열 때 `aria-label` 또는 `aria-labelledby`가 없으면 "대화상자"만 읽고 제목을 안내하지 못한다. 사용자는 어떤 후기를 열었는지 컨텍스트 없이 닫기 버튼("✕")으로 포커스가 이동된다.
- **원인:** `openProduct()`의 `aria-labelledby="pmodal-title"` 패턴이 `openReviewDetail`에 미적용.
- **수정:** `ov.innerHTML` 내 `.pmbox.pmrvd-box`에 `aria-labelledby="pmrvd-title"` 추가. 내부에 `<span id="pmrvd-title" class="sr-only">리뷰 상세</span>` 또는 작성자 닉네임 요소에 id를 부여해 연결.
- **파일:** [site/app.js](site/app.js) line ~1782 [lane:CORE]

### [L-158] ✅ 해결완료(2026-06-13, CORE) — `openProduct` focus trap 셀렉터에 `textarea` 누락 — submit disabled 시 포커스 탈출
- **처리:** app.js line 1745 포커스 트랩 셀렉터에 `select, textarea` 추가.
- **영역:** 상품상세 — 상품 모달 포커스 트랩
- **심각도:** 🟢 Low
- **증상:** `openProduct()`의 `onKey` 핸들러(line 1731) 포커스 트랩 셀렉터 `'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'`에 `textarea`가 없다. 후기 폼이 열린 상태에서 사진 업로드 중 `submitBtn.disabled = true`이고 아직 리뷰 카드가 없을 때, Tab을 `.pmrv-ta`(textarea) → 비활성 submit(브라우저가 건너뜀) → .pmbox 밖으로 순서로 누르면 포커스가 모달 외부로 탈출한다.
- **원인:** 셀렉터 설계 시 `textarea`·`select` 미포함.
- **수정:** 셀렉터를 `'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'` 로 확장.
- **파일:** [site/app.js](site/app.js) line ~1731 [lane:CORE]

### [L-159] ✅ 해결완료(2026-06-13, CORE) — `wireReviews` `reset()` — 마지막 `renderThumbs` Blob URL 미해제 → 메모리 누수
- **처리:** reset() 내 `formbox.innerHTML=""` 전에 `querySelectorAll("img")` blob URL revoke 추가.
- **영역:** 상품상세 — 후기 사진 썸네일
- **심각도:** 🟢 Low
- **증상:** `renderThumbs()`(line 1902) 재호출 시 이전 Blob URL을 `URL.revokeObjectURL`로 해제하지만, `reset()`(line 1854)은 `formbox.innerHTML = ""` 만 실행하고 마지막 `renderThumbs` 호출로 생성된 Blob URL을 해제하지 않는다. 후기 폼을 열고 사진을 추가했다가 닫거나 등록 완료 후 reset 할 때마다 Blob URL이 해제되지 않고 페이지 lifetime 동안 누적된다.
- **원인:** `reset()` 내에서 `thumbsEl.querySelectorAll("img")` 에 대한 revoke 미수행.
- **수정:** `reset()` 내 `formbox.innerHTML = ""` 전에 현재 썸네일 img src Blob URL을 revoke하는 로직 추가. 또는 `photos = []` 후 `renderThumbs()` 한 번 호출(내부에서 이전 URL revoke 후 빈 state 렌더).
- **파일:** [site/app.js](site/app.js) line ~1854 [lane:CORE]

> SOCIAL lane (supabaseClient.js · account.html · sw.js): 이번 순환에서 신규 버그 없음. 기존 미수정: M-132(initAuth 이중 발화), L-147(onWishChange 경쟁), L-150(닉네임 모달 syncGearSets 누락).

*다음 회차: 계정/로그인 (17순환)*

---

### [M-135] ✅ 해결완료(2026-06-12) — 상품 카드 — 가격 옆 ⚖ 비교 버튼 아이콘 의미 불명확, 제거 요청
- **처리:** 사용자 결정으로 비교 기능 전체 아카이브 — `COMPARE_ENABLED=false`(app.js). 카드 ⚖ 버튼 미렌더 + toggleCmp/updateCmpBar/openCmpModal 비활성. 코드는 복구 대비 보존. [site/app.js](site/app.js)

- **영역:** 카테고리/목록 — 상품 카드 우측 ⚖ 버튼 (`pli-cmp`)
- **현재:** 저울 아이콘(⚖)만 표시 → 사용자가 기능(비교에 추가) 인지 못함
- **기대:** 아이콘 버튼 완전 제거 (`app.js:2160` `pli-cmp` 버튼 삭제)
- **보고자:** 사용자 직접 제보 (2026-06-12)

---

## R-85 — 코드 정밀 탐색 (2026-06-13)

### [M-136] ✅ 해결완료(2026-06-13) — `renderLogFeed` — `p.content` null 시 TypeError → 커뮤니티 피드 전체 렌더 실패
- **영역:** 커뮤니티 — 로그 피드 렌더링
- **심각도:** 🟡 Medium
- **증상:** `renderLogFeed`(app.js line 3234)에서 `p.content.length > 80` 비교 시 `p.content`를 null 가드 없이 직접 참조한다. DB의 `content` 컬럼이 null인 게시글이 존재하면 `TypeError: Cannot read properties of null (reading 'length')` 예외가 발생하고, 그 게시글이 포함된 배치 전체 `posts.map(...)` 실행이 중단돼 피드가 빈 오류 상태(`el.innerHTML = ...로그를 불러오지 못했어요...`)로 떨어진다. 바로 위 `preview` 계산(line 3221)은 `(p.content || "")` 로 보호돼 있으나 length 체크만 누락됨.
- **원인:** 일관성 없는 null 가드 — preview 변수엔 적용하면서 length 비교엔 미적용.
- **재현:** `posts` 중 `content: null`인 행이 DB에 있을 때 커뮤니티 피드 진입.
- **제안 수정:** `p.content.length > 80` → `(p.content || "").length > 80` (또는 `preview.length > 80`)
- **파일:** [site/app.js](site/app.js) line 3234 [lane:CORE]

### [M-137] ⏸ 보류(COMPARE_ENABLED=false, 복구 시 재처리) — 비교 세트저장 시 `s`(카테고리 슬러그)·`pcode`·`coupang_url` 필드 누락 (M-131 재확인, COMPARE_ENABLED=true 복구 시 재발)
- **영역:** 스펙 비교 — 세트 저장 (아카이브 상태, 복구 시 발현)
- **심각도:** 🟡 Medium
- **증상:** `openCmpModal`(app.js line 2113) `setItems` 생성 시 `s`, `pcode`, `coupang_url` 필드가 누락된다. `s` 없으면 세트 상세 모달의 구매 버튼이 모두 "준비 중"으로 표시되고, click_events 집계에서 slug가 null이 된다. M-131은 COMPARE_ENABLED=false로 moot 처리됐으나 복구 플래그를 켜면 즉시 재발하는 잠재 버그로 별도 기록.
- **원인:** `setItem()` 헬퍼를 재사용하지 않고 인라인 객체 수기 생성(M-130·M-131과 동일 패턴).
- **재현:** `COMPARE_ENABLED=true` 후 카테고리에서 2개 비교 선택 → "비교하기" → "세트로 저장" → 세트 상세에서 구매 버튼 확인.
- **제안 수정:** `items.map(m => ({ b:m.brand, m:m.model, cap:m.capacity??null, weight_g:m.specs.weight_min?.value??null, qty:1, img:m.img??null, p:m.price_min??null }))` → `items.map(m => setItem(m, STATE.slug))`
- **파일:** [site/app.js](site/app.js) line ~2113 [lane:CORE]

### [L-160] — `renderLogFeed` — 비로그인 사용자도 좋아요(like) RPC 호출 가능 — 인증 없는 집계 조작
- **영역:** 커뮤니티 — 로그 피드 좋아요 버튼
- **심각도:** 🟢 Low
- **증상:** 피드의 좋아요 버튼(`.log-like-btn`, line 3265)은 로그인 여부를 확인하지 않고 즉시 `increment_post_likes` / `decrement_post_likes` RPC를 호출한다. 비로그인 사용자도 좋아요를 누르면 카운트가 즉시 UI에서 변경되고 RPC도 호출된다. DB 측 RLS가 막으면 조용히 실패하지만, 사용자 입장에선 성공한 것처럼 보인다(localStorage만 변경됨). 오해를 유발하고 잘못된 사용자 경험을 제공.
- **원인:** 로그인 게이트 미삽입 — 리뷰 폼(line 1887 `if (!user)` 체크)·댓글(line 3407 `if (!window._commUser)`)과 달리 피드 좋아요만 빠짐.
- **재현:** 비로그인 상태에서 커뮤니티 피드 접근(COMMUNITY_ENABLED=true 필요) → 좋아요 버튼 클릭.
- **제안 수정:** 좋아요 핸들러 진입 시 `if (!window._commUser) { showToast('로그인 후 좋아요를 누를 수 있어요'); return; }` 추가.
- **파일:** [site/app.js](site/app.js) line ~3265 [lane:CORE]

### [L-161] ✅ 해결완료(2026-06-13, SOCIAL) — `syncGearSetsOnLogin` — `Date.now().toString(36) + Math.random()...` ID 충돌 가능성 — 원격→로컬 병합 시 동시 로그인 환경에서 id 중복
- **영역:** 기어 세트 — 원격↔로컬 동기화
- **심각도:** 🟢 Low
- **증상:** `syncGearSetsOnLogin`(account.html line 243)에서 원격 세트를 로컬에 추가할 때 `id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` 형태로 로컬 id를 생성한다. `Date.now()`는 ms 단위로 원격 세트가 여러 개일 때 동일 밀리초 내에 여러 id가 만들어질 경우 Math.random() 4자리 suffix만으로 구분해야 한다. 충돌 확률은 낮지만 0이 아니며, 충돌 시 `getSets().find(x => x.id === setId)` 가 잘못된 세트를 반환해 수량 편집·삭제 등이 엉뚱한 세트에 적용된다.
- **원인:** 로컬 id 생성 시 `crypto.randomUUID()` 대신 `Date.now()+random` 단축 패턴 사용.
- **재현:** 원격 세트가 동시에 복수(2개+) 존재하는 계정으로 로그인.
- **제안 수정:** `id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` → `id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)` (길이 증가 및 UUID 활용)
- **파일:** [site/account.html](site/account.html) line ~243 [lane:SOCIAL]
- **심각도:** 🟡 Medium
- **해결:** `crypto.randomUUID()` 우선 사용, 미지원 환경은 `Date.now()+random(slice(2))` 폴백. 충돌 가능성 제거.

---

## R-86 — 빌드 파이프라인·검색·AppScript·Supabase 탐색 (2026-06-13)

### [M-138] ✅ 기구현(2026-06-13 검증) — `run_all.py` — 기본 DB 경로가 실제 파일과 불일치 → 인수 없이 실행 즉시 실패
- **영역:** 백엔드 — 빌드 파이프라인 오케스트레이터
- **심각도:** 🔴 High
- **증상:** `run_all.py` argparse 기본값이 `camping_all.db`(line 137)이나 실제 DB 파일은 `camping_tents500.db`다. `python3 pipeline/run_all.py` 를 인수 없이 실행하면 `DB 없음: .../camping_all.db` 메시지와 함께 즉시 종료된다. CI나 새 개발자가 문서 없이 실행할 경우 파이프라인 전체가 동작하지 않는다.
- **원인:** DB 파일명이 `camping_tents500.db`로 변경됐지만 `run_all.py`의 `--db` 기본값이 업데이트되지 않음.
- **재현:** `python3 pipeline/run_all.py` (인수 없이 실행)
- **제안 수정:** `ap.add_argument("--db", default=os.path.join(ROOT, "camping_all.db"))` → `os.path.join(ROOT, "camping_tents500.db")`
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 137 [lane:BACKEND]

### [M-139] ✅ 기구현(2026-06-13 검증) — `check_export.py` — `load_models`에서 파일을 `with` 없이 열어 파일 핸들 누수
- **영역:** 백엔드 — 배포 게이트 스크립트
- **심각도:** 🟡 Medium
- **증상:** `load_models(path)`(line 41)에서 `json.load(open(path, encoding="utf-8"))` 형태로 파일을 열고 닫지 않는다. 파이썬 GC에 닫힘을 의존하므로 카테고리 수가 많아질수록(현재 ~18개) 동시 열린 파일 핸들이 쌓이며, 시스템 `ulimit`이 낮은 CI 환경(기본 1024)에서 `OSError: [Errno 24] Too many open files` 가 발생할 수 있다.
- **원인:** `with open(...) as f:` 패턴 미사용.
- **재현:** CI ubuntu-latest에서 카테고리 파일이 많을 때 간헐 재현 가능. 로컬에서는 드물게 발생.
- **제안 수정:** `d = json.load(open(path, encoding="utf-8"))` → `with open(path, encoding="utf-8") as f: d = json.load(f)`
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 41 [lane:BACKEND]

### [L-162] ✅ 해결완료(2026-06-13, CORE) — `supabase/migrations/` — 마이그레이션 순번 006 중복 → 적용 순서 모호
- **영역:** 백엔드 — Supabase 마이그레이션
- **심각도:** 🟢 Low
- **증상:** `006_gear_sets.sql` 과 `006_post_likes.sql` 이 동일 순번 006 을 공유한다. Supabase CLI나 수동 적용 시 어느 파일을 먼저 실행해야 하는지 불명확하고, `post_likes` 가 `gear_sets` 테이블을 참조하지 않더라도 향후 의존 관계가 생기면 잘못된 순서로 적용될 수 있다. 현재도 파일 목록 정렬 시 OS에 따라 순서가 달라진다(`gear_sets` < `post_likes` 알파벳순이나 보장되지 않음).
- **원인:** 마이그레이션 추가 시 순번 충돌 검토 누락.
- **재현:** `ls supabase/migrations/ | grep ^006` → 2개 파일 확인.
- **제안 수정:** `006_post_likes.sql` → `006b_post_likes.sql` 또는 `007` 이후 재번호화하고 이후 파일 번호를 순차 조정.
- **파일:** [supabase/migrations/](supabase/migrations/) [lane:BACKEND]

### [L-163] ✅ 해결완료(2026-06-13, CORE) — `search.html` — `autofocus` 속성과 URL `?q=` pre-fill이 경쟁 — 모바일에서 키보드 팝업 오작동
- **영역:** 프론트엔드 — 검색 페이지
- **심각도:** 🟢 Low
- **증상:** `search.html`의 `<input id="homeq" ... autofocus>`(line 38)는 페이지 로드 즉시 키보드를 팝업한다. 이후 인라인 스크립트(line 51–55)가 URL `?q=` 파라미터를 읽어 `inp.value = initQ; run()` 로 검색창을 채운다. 모바일 iOS/Android에서 `autofocus`가 소프트 키보드를 열면서 뷰포트가 위로 밀리고, 그 상태에서 `run()`이 dropdown을 열어 레이아웃이 겹쳐 보이는 현상이 발생한다. 또한 `?q=` 없는 단순 `/search.html` 진입 시에도 불필요하게 키보드가 열려 UX가 나쁘다.
- **원인:** `autofocus`를 조건 없이 전체 환경에 적용; `?q=` 파라미터 유무에 따른 분기 없음.
- **재현:** 모바일 브라우저에서 `https://gear-forest.com/search.html?q=헬리녹스` 진입.
- **제안 수정:** `autofocus` 제거 후 인라인 스크립트에서 `initQ` 없을 때만 `inp.focus()` 호출; `initQ` 있으면 focus 생략하고 드롭다운만 표시.
- **파일:** [site/search.html](site/search.html) line 38 [lane:CORE]

### [L-164] ✅ 해결완료(2026-06-13, BACKEND 기구현) — `gear-list-appscript.gs` — `markApplied` — H열에 `''` 기록이 기존 수동 입력값을 덮어씀
- **영역:** 백엔드(Google Apps Script) — 완료 표기 유틸리티
- **심각도:** 🟢 Low
- **증상:** `markApplied()`(line 116–132)는 D열에 쿠팡 링크가 없는 모든 행의 H열을 `''`(빈 문자열)로 덮어쓴다. 운영자가 H열에 "작업중", "확인필요" 등 수동 메모를 적어두면 `markApplied` 재실행 시 모두 삭제된다. `doGet()` webhook으로 자동 호출될 경우 사이드이펙트가 더 커진다.
- **원인:** `links.map(...)` 결과를 H열 전체 범위에 무조건 `setValues` 하는 구조; 빈 문자열 처리 시 기존값 보존 로직 없음.
- **재현:** H열에 임의 텍스트 입력 후 `markApplied()` 실행 → 해당 행 D열에 쿠팡 링크 없으면 H열 값 사라짐.
- **제안 수정:** `return [ok ? '✅' : '']` → `return [ok ? '✅' : row[7] || '']` 식으로 H열 기존값을 읽어 보존하거나, `✅` 기록만 하고 비어있는 경우 기존값 유지.
- **파일:** [gear-list-appscript.gs](gear-list-appscript.gs) line 127 [lane:BACKEND]

---

## R-87 — 찜동기화·카테고리·export·아이템페이지·CI 탐색 (2026-06-13)

### [M-140] ✅ 해결완료(2026-06-13, CORE) — `build-item-pages.js` — `coupang_url` 없는 상품의 `availability`가 `PreOrder`(예약판매)로 잘못 설정
- **영역:** 프론트엔드 — 빌드 스크립트 / Schema.org JSON-LD
- **심각도:** 🟡 Medium
- **증상:** `scripts/build-item-pages.js` line 132에서 `coupang_url`이 없을 때 `"availability": "https://schema.org/PreOrder"` 로 출력한다. 쿠팡 링크 미등록 상품은 단순히 링크가 없는 것이지 예약판매 상품이 아니다. Google 리치결과 검색에 "예약가능" 뱃지가 붙어 사용자를 오도하고, 품질 가이드라인 위반으로 Search Console 페널티 대상이 될 수 있다.
- **원인:** `coupang_url` 유무를 재고 여부가 아닌 구매 가능 여부로 잘못 매핑.
- **재현:** `site/item/` 내 `coupang_url`이 없는 페이지 HTML에서 `"PreOrder"` 검색 → 다수 확인.
- **제안 수정:** `coupang_url ? "https://schema.org/InStock" : "https://schema.org/PreOrder"` → `coupang_url ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"`. 또는 쿠팡 링크 없는 경우 `offers` 블록 자체를 생략.
- **파일:** [scripts/build-item-pages.js](scripts/build-item-pages.js) line 132 [lane:CORE]

### [L-165] ✅ 해결완료(2026-06-13, CORE) — `build-item-pages.js` — `aggregateRating.ratingCount` / `reviewCount` 항상 `1` 하드코딩
- **영역:** 프론트엔드 — 빌드 스크립트 / Schema.org JSON-LD
- **심각도:** 🟢 Low
- **증상:** `scripts/build-item-pages.js` line 139에서 `"ratingCount": 1, "reviewCount": 1` 이 모든 상품 페이지에 고정값으로 출력된다. Google의 `aggregateRating` 가이드라인은 실제 리뷰 수를 요구하며, 허위 리뷰 카운트는 구조화 데이터 정책 위반으로 리치결과 자격 박탈 원인이 된다.
- **원인:** 실제 Supabase `reviews` 테이블 집계 없이 빌드 시점 정적 값으로 대체.
- **재현:** 임의 `item-*.html` 소스의 `aggregateRating` 확인 → `"ratingCount":1,"reviewCount":1`.
- **제안 수정:** 단기: `aggregateRating` 블록을 star 평균값만 있을 경우 조건부 생략(리뷰 실데이터 없으면 아예 출력 안 함). 장기: 빌드 시 DB에서 상품별 리뷰 수 집계 후 주입.
- **파일:** [scripts/build-item-pages.js](scripts/build-item-pages.js) line 135-139 [lane:CORE]

### [L-166] ✅ 해결완료(2026-06-13, SOCIAL) — `renderNicknameModal()` — 진입 시 `window.onWishChange = null` 로 재로그인 세션의 찜 동기화 핸들러를 강제 삭제
- **영역:** 프론트엔드 — account.html 찜 동기화
- **심각도:** 🟢 Low
- **증상:** `renderNicknameModal()`(account.html line 262)의 첫 줄이 `window.onWishChange = null` 이다. 기존 사용자가 로그아웃 후 재로그인 → `syncWishlistOnLogin`이 `onWishChange` 핸들러를 설정한 뒤, 어떤 이유로 닉네임 모달 경로로 진입하면 핸들러가 삭제된다. 이후 찜 추가/제거 시 원격 저장이 호출되지 않아 변경사항이 소실된다.
- **원인:** 닉네임 미설정 상태 초기화 목적으로 `onWishChange`를 무조건 null 처리. 재로그인 경로에서 핸들러가 이미 설정된 상황을 고려하지 않음.
- **재현:** 닉네임 있는 계정에서 `profile.nickname`을 임시로 null 처리(또는 트리거로 초기화) → 재로그인 → 닉네임 모달 진입 → 모달 도중 찜 추가 → 원격 DB 미반영.
- **제안 수정:** `renderNicknameModal` 진입 시 기존 `onWishChange` 핸들러를 보존하거나, 닉네임 저장 완료 후 `syncWishlistOnLogin()`에서 핸들러를 재설정하는 현재 로직(line 325)으로 충분하므로 `window.onWishChange = null` 라인 제거 검토.
- **파일:** [site/account.html](site/account.html) line 262 [lane:SOCIAL]

### [L-167] ✅ 해결완료(2026-06-13, CORE) — `pages.yml` — CI에서 `python3` 버전 명시 없음 → ubuntu-latest Python 버전 변경 시 스크립트 호환성 미보장
- **영역:** 백엔드 — CI/CD
- **심각도:** 🟢 Low
- **증상:** `.github/workflows/pages.yml`에서 `python3 pipeline/check_export.py`를 실행하지만 `actions/setup-python` 없이 `ubuntu-latest`의 기본 Python을 사용한다. `ubuntu-latest` 이미지가 `ubuntu-24.04`로 업그레이드되거나 Python 버전이 변경될 경우(현재 3.12) `check_export.py` 또는 그 의존 모듈(`limits_map.py`, `value_metric.py`)이 버전별 문법 차이로 실패할 수 있다. 특히 `match-case`, `typing` 변경 사항 등이 영향을 줄 수 있다.
- **원인:** CI 파이프라인에 `actions/setup-python@v5`로 버전을 고정하지 않음.
- **재현:** 현재는 재현 안 됨. `ubuntu-latest` 이미지 변경 시 잠재 실패.
- **제안 수정:** `pages.yml`에 `- uses: actions/setup-python@v5` + `with: python-version: "3.11"` (또는 `"3.x"`) 단계 추가.
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) [lane:BACKEND]

### [M-141] ✅ 해결완료(2026-06-13, CORE) — `app.js` — `?view-set=` 공유 URL import 시 아이템에 `pcode`·`s`·`coupang_url` 누락 → 구매 버튼 항상 비활성
- **영역:** 프론트엔드 — 계정/세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `?view-set=BASE64`로 공유된 세트를 "내 세트에 추가" 버튼으로 import하면, 저장되는 아이템 구조가 `{ b, m, qty, weight_g }` 만 포함한다. 이후 `openSetDetail`에서 `x.coupang_url`을 참조하면 항상 `undefined` → 모든 아이템의 🛒 구매 버튼이 "준비 중"(disabled) 으로 표시된다. 또한 `qtyMax(x.s)` 호출 시 `x.s`가 undefined → `qtyMax`가 기본값 반환해 수량 상한이 항상 1로 고정된다.
- **원인:** `vs-import-btn` onclick(line 3630)에서 `setItem()` 헬퍼를 거치지 않고 직접 객체를 생성하며 `pcode`(= `wishKey`), `s`(카테고리 슬러그), `coupang_url`을 포함하지 않음. M-130·M-131과 동일 패턴이나 view-set import 경로는 수정 누락.
- **재현:** 세트를 공유 링크로 복사 → 다른 브라우저/비로그인 상태에서 URL 열기 → "내 세트에 추가" → 추가된 세트에서 🛒 버튼 확인 → "준비 중" 표시.
- **제안 수정:** line 3630의 `items` 매핑에서 `setItem(x, x.s || "")` 헬퍼 사용 또는 `pcode: wishKey(x.b, x.m, x.cap ?? null), s: x.s || "", coupang_url: x.coupang_url || ""` 필드 추가.
- **파일:** [site/app.js](site/app.js) line 3630 [lane:CORE]

### [L-168] ✅ 해결완료(2026-06-13, SOCIAL) — `account.html` — 프로필 카드 로그인 방식 "Google 로그인" 하드코딩 — OAuth 프로바이더 동적 조회 없음
- **영역:** 프론트엔드 — 계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `renderProfile()`(account.html line 424)에서 로그인 방식을 항상 "Google 로그인"으로 출력한다. 현재는 Google OAuth만 지원하므로 실질 오표시는 없지만, 향후 GitHub·카카오 등 추가 프로바이더를 지원할 경우 오표시된다. 또한 `profile` 객체에서 실제 프로바이더 정보를 읽을 수 있음에도 하드코딩됨.
- **원인:** `renderProfile` 구현 시 프로바이더 동적 조회 로직 미구현. `supabase.auth.getUser()`의 `user.app_metadata.provider` 또는 `user.identities[0].provider`로 동적 처리 가능.
- **재현:** 현재 Google 외 프로바이더 추가 시 재현. 코드 리뷰 수준 이슈.
- **제안 수정:** `renderProfile`에 `window._accUser?.app_metadata?.provider` 참조하여 "Google 로그인", "GitHub 로그인" 등 동적 표시. 또는 현재 단계에서는 "소셜 로그인"으로 중립 표현 변경.
- **파일:** [site/account.html](site/account.html) line 424 [lane:SOCIAL]

---

## R-88 — 정렬·PWA·파이프라인·아이템상세 탐색 (2026-06-13)

### [M-142] ✅ 해결완료(2026-06-13, CORE) — `build-item-pages.js` — `ITEM` 객체·`openSetModal` 호출에 `coupang_url` 누락 → 아이템 상세에서 꾸러미 담기 시 구매 링크 소실
- **영역:** 프론트엔드 — 아이템 상세 / 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `/item/{cat}/item-N.html`의 "＋ 장비 꾸러미에 담기" 버튼으로 세트에 담으면 저장되는 아이템 객체에 `coupang_url` 필드가 없다. 이후 세트 상세(`openSetDetail`)에서 해당 아이템의 🛒 구매 버튼이 항상 비활성("준비 중")으로 표시된다. 실제 쿠팡 링크가 있는 제품도 동일하게 비활성화됨.
- **원인:** `scripts/build-item-pages.js` line 319에서 `ITEM` 객체를 생성할 때 `coupang_url`을 포함하지 않는다. line 331의 `openSetModal(...)` 호출에도 `coupang_url` 미전달. `model.coupang_url`은 line 107에서 이미 비구조화하여 사용 가능함에도 ITEM 직렬화 시 누락.
- **재현:** 쿠팡 링크가 있는 제품의 아이템 상세 페이지(`/item/auto-tent/item-0.html` 등) → "꾸러미에 담기" → 계정 > 내 꾸러미 → 해당 아이템 🛒 클릭 → "준비 중" 비활성 표시.
- **제안 수정:** `scripts/build-item-pages.js` line 319를 `JSON.stringify({ b: brand, m: modelName, cap: ..., s: catSlug, p: price_min, img: img || null, cu: coupang_url || null })`로 수정하고 ITEM에 `cu` 키 추가; line 331 `openSetModal` 호출에 `coupang_url: ITEM.cu || null` 추가.
- **파일:** [scripts/build-item-pages.js](scripts/build-item-pages.js) line 319, 331 [lane:CORE]

### [L-169] ✅ 해결완료(2026-06-13, CORE) — `app.js` — PWA 배너 `showBanner()` — `display:block` 직후 `offsetHeight` 측정 → layout flush 전이면 0 → `--banner-h: 0px` 세팅
- **영역:** 프론트엔드 — PWA
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `beforeinstallprompt` 이벤트 핸들러의 `showBanner()`(line 36–39)에서 `banner.style.display = "block"` 직후 `banner.offsetHeight`를 읽는다. 브라우저가 layout을 아직 flush하지 않은 경우 `offsetHeight`가 0을 반환해 `--banner-h: 0px`로 설정된다. 이로 인해 콘텐츠 상단이 배너에 가려지거나 배너 여백이 사라지는 레이아웃 깨짐이 간헐적으로 발생.
- **원인:** DOM style 변경 직후 layout 강제 reflow 없이 offsetHeight 접근. CSS transition 또는 비동기 렌더링 타이밍에서 재현.
- **재현:** PWA 지원 브라우저 + 미설치 상태에서 홈 진입 → 개발자도구에서 `--banner-h` CSS 변수 확인 → 0px로 설정되는 경우 있음.
- **제안 수정:** `showBanner()`에서 `requestAnimationFrame` 사용: `banner.style.display = "block"; requestAnimationFrame(() => { document.documentElement.style.setProperty("--banner-h", banner.offsetHeight + "px"); });`
- **파일:** [site/app.js](site/app.js) line 36–39 [lane:CORE]

### [L-170] ✅ 해결완료(2026-06-13, CORE) — `export_site.py` — `open(..., "w")` 에 `encoding="utf-8"` 미지정 → non-UTF-8 로케일 환경에서 JSON 파일 인코딩 오류
- **영역:** 백엔드 — 빌드 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `export_site.py` line 165, 175, 177의 `open(..., "w")`가 `encoding` 인수를 명시하지 않는다. `ensure_ascii=False`로 한국어를 직접 쓰기 때문에 Windows나 `LANG=C` 설정 환경에서 실행하면 `UnicodeEncodeError` 또는 CP949 인코딩으로 저장되어 브라우저가 JSON 파싱에 실패한다.
- **원인:** Python `open()` 기본 인코딩은 `locale.getpreferredencoding()`에 따라 결정되며 UTF-8이 아닐 수 있다. GitHub Actions ubuntu-latest는 기본 UTF-8이지만 로컬 개발(Windows) 환경에서 재현.
- **재현:** Windows 개발환경 또는 `PYTHONIOENCODING=cp949 python3 pipeline/export_site.py` 실행 시 재현.
- **제안 수정:** 3곳 모두 `open(..., "w", encoding="utf-8")` 로 수정.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 165, 175, 177 [lane:BACKEND]

### [M-143] ✅ 해결완료(2026-06-13, CORE) — `openLogDetail` — `p.content` XSS — `esc()` 없이 innerHTML 삽입
- **영역:** 프론트엔드 — 커뮤니티/소셜 (COMMUNITY_ENABLED=false이나 코드 잔존·복구 시 즉시 재발)
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()` (line 3401)에서 `const body = (p.content || "").replace(/\n/g, "<br>")` 로 처리한 뒤 `${body}` 를 innerHTML 템플릿에 직접 삽입한다. `p.content`를 `esc()` 없이 사용하므로, 악의적인 사용자가 포스트 본문에 `<script>` 또는 `<img src=x onerror=...>` 를 삽입할 경우 XSS가 실행된다.
- **재현조건:** COMMUNITY_ENABLED=true 환경에서 `<script>alert(1)</script>` 를 포함한 글 작성 후 상세 열기.
- **원인:** line 3401 — `p.content`에 `esc()` 적용 누락. 동일 파일 내 리뷰 본문(`esc(r.body)`)이나 닉네임(`esc(nick)`)은 이스케이프하나, 포스트 content만 빠져 있음.
- **제안 수정:** `const body = esc(p.content || "").replace(/\n/g, "<br>");` 로 수정(`esc` 먼저 적용 후 개행 치환).
- **파일:** [site/app.js](site/app.js) line 3401 [lane:CORE]

### [M-144] ✅ 해결완료(2026-06-13, CORE) — `buildFilters` 가격 슬라이더 — `totalHi === totalLo`이면 `pct()` division by zero → fill NaN/Infinity
- **영역:** 프론트엔드 — 카테고리/목록 — 가격 필터 슬라이더
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-13
- **증상:** 한 카테고리에서 모든 제품의 `price_min` 값이 동일할 경우(또는 슬라이더 범위 `lo === hi`), `updateFill()` 내 `pct = v => ((v - totalLo) / (totalHi - totalLo)) * 100` 에서 `totalHi - totalLo === 0` → division by zero 발생 → fill `left/width`에 `NaN%`/`Infinity%` 세팅 → 슬라이더 UI 깨짐. `syncFilterUI()` 내 line 1652 동일 패턴도 해당.
- **재현조건:** 특정 소규모 카테고리(e.g. 신규 등록 직후 모델 1개)에서 `category.html?cat=...` 접속 후 가격 슬라이더 렌더 확인.
- **원인:** line 1507, 1652 — `totalHi > totalLo` 방어 없음. 가격 슬라이더는 `prices.length > 0`이면 생성하므로 단일 가격값일 때도 생성됨.
- **제안 수정:** `const pct = v => totalHi === totalLo ? 0 : ((v - totalLo) / (totalHi - totalLo)) * 100;` 으로 zero-division 방어 추가(line 1507, 1652 두 곳).
- **파일:** [site/app.js](site/app.js) line 1507, 1652 [lane:CORE]

### [L-172] ✅ 해결완료(2026-06-13, CORE) — `canonical_models` 테이블 — 핵심 컬럼 타입 선언 없음 → SQLite untyped, 정수/실수 강제 없음
- **영역:** 백엔드 — DB 스키마 (`pipeline/reference.sql` 아닌 런타임 생성)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `canonical_models` 테이블 DDL에서 `rep_product_id`, `variant_count`, `variants`, `pcodes`, `min_price`, `max_price` 컬럼에 타입 선언이 없다. SQLite는 타입 없는 컬럼에 어떤 값도 저장 가능하므로, 파이프라인 스크립트가 문자열을 `min_price`에 삽입해도 오류가 발생하지 않아 `export_site.py`에서 `pr[0]`(price_min) 값이 문자열로 읽혀 프론트 렌더링 및 정렬 이상을 유발할 수 있다.
- **재현조건:** `INSERT INTO canonical_models VALUES("abc", 1, 3, "브랜드", "모델", NULL, NULL, NULL, NULL, "not_a_number", NULL)` 후 `export_site.py` 실행 시 `price_min="not_a_number"` 가 JSON에 방출됨.
- **제안 수정:** `canonical_models` 생성 스크립트에서 `rep_product_id INTEGER`, `variant_count INTEGER`, `min_price INTEGER`, `max_price INTEGER` 타입 선언 추가. 또는 `export_site.py`에서 `int(pr[0]) if pr and pr[0] is not None else None` 으로 명시적 캐스팅.
- **파일:** DB 스키마 (캐노니컬 생성 쿼리), [pipeline/export_site.py](pipeline/export_site.py) line 106 [lane:BACKEND]

### [L-173] ✅ 해결완료(2026-06-13, CORE) — `openLogDetail` — ESC 키 핸들러 `removeEventListener` 미호출 → 이벤트 누적
- **영역:** 프론트엔드 — 커뮤니티/소셜
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()` (line 3454) — `const onKey = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); } }; document.addEventListener("keydown", onKey);` 에서 ESC를 누르지 않고 배경 클릭으로 모달을 닫을 경우 `removeEventListener`가 호출되지 않는다. 모달을 여닫기를 반복할수록 `keydown` 핸들러가 누적되어 ESC 1회 키 입력에 여러 close() 호출이 발생한다.
- **재현조건:** `openLogDetail()` 모달을 배경 클릭 또는 ✕ 버튼으로 닫기 → 다시 열기 → 반복 10회 → ESC 입력 시 콘솔에 close() 복수 실행 확인.
- **원인:** line 3428 `const close = () => modal.classList.remove("on");` 에 `document.removeEventListener("keydown", onKey)` 없음.
- **제안 수정:** `close` 함수에 `document.removeEventListener("keydown", onKey);` 추가. 또는 `modal.onclick` / `pmx.onclick` 핸들러에서 각각 `close()`를 부르는 대신 단일 `closeModal()` 함수로 통합.
- **파일:** [site/app.js](site/app.js) line 3428, 3454 [lane:CORE]

### [M-145] ✅ 해결완료(2026-06-13) — `openLogDetail` — `comments` 조회·삽입에 `content` 컬럼 사용 — DB 스키마는 `body` → 댓글 항상 공백 + 작성 실패
- **영역:** 프론트엔드 — 커뮤니티/소셜 (COMMUNITY_ENABLED=false이나 코드 잔존·복구 시 즉시 재발)
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()` 안의 `loadComments()` (line 3468)에서 `.select("id, content, created_at, user_id, profiles(nickname)")` 으로 `content` 컬럼을 조회한다. 그러나 DB 스키마(`001_initial_schema.sql` line 141)와 `supabaseClient.js`의 `createComment`/`editComment`(line 160, 169)은 모두 `body` 컬럼을 사용한다. 결과적으로 SELECT 응답의 `c.content`는 항상 `undefined` → 댓글 본문이 빈 문자열로 렌더링된다. INSERT (line 3507)도 `{ post_id, user_id, content }` 로 `content` 필드를 사용하여 DB 제약 `body NOT NULL` 위반 → 삽입 실패(에러 무시됨).
- **재현조건:** 댓글이 있는 게시글 상세(`openLogDetail`) 열기 → 댓글 본문 공백 확인. 댓글 작성 → 등록 버튼 클릭 → 댓글 미등록 (에러 표시 없음).
- **원인:** line 3468 `.select("id, content, ...")` 및 line 3484 `c.content` → `body`로 교체 필요. line 3507 `insert({ ..., content })` → `insert({ ..., body: content })` 로 교체 필요.
- **제안 수정:** line 3468: `"id, body, created_at, user_id, profiles(nickname)"` / line 3484: `${esc(c.body)}` / line 3507: `insert({ post_id: p.id, user_id: window._commUser.id, body: content })`.
- **파일:** [site/app.js](site/app.js) line 3468, 3484, 3507 [lane:CORE]

### [L-174] ✅ 해결완료(2026-06-13, CORE) — `openSetModal` — Tab 포커스 트랩 없음 → 키보드 사용자 모달 탈출 (WCAG 2.1.2)
- **영역:** 프론트엔드 — 장비 꾸러미 모달 (접근성)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openSetModal()` (line 313)에는 ESC 닫기 핸들러(`onKey`)만 등록되어 있고 Tab/Shift+Tab 포커스 트랩이 없다. 키보드 사용자가 Tab을 누르면 포커스가 모달 외부(배경 페이지)로 탈출하여 WCAG 2.1.2(키보드 트랩) 달성 기준 위반 및 모달이 열린 상태에서 배경 요소 조작이 가능해진다. `openProduct` (line 1853)·`openReviewDetail` (line 1929)은 포커스 트랩이 구현되어 있으나 `openSetModal`만 누락되어 있다.
- **재현조건:** 장비 꾸러미 담기 버튼 클릭 → 모달 열림 → Tab 반복 입력 → 포커스가 배경으로 이동 확인.
- **원인:** line 339 `const onKey = e => { if (e.key === "Escape") close(); };` — Tab 처리 분기 없음.
- **제안 수정:** `onKey` 내에 `if (e.key === "Tab") { ... first/last 포커스 순환 ... }` 분기 추가 (openProduct line 1856–1862 패턴 동일 적용).
- **파일:** [site/app.js](site/app.js) line 339 [lane:CORE]

### [L-175] ✅ 해결완료(2026-06-13, CORE) — `openLogDetail` — `close()` 시 `prevFocus` 복귀 누락 → 접근성 포커스 유실
- **영역:** 프론트엔드 — 커뮤니티/소셜 (접근성)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()` (line 3428)의 `close` 함수는 `modal.classList.remove("on")`만 수행하며, 모달 오픈 전 포커스 요소로 복귀시키지 않는다. `openProduct`(line 1836–1840), `openReviewDetail`(line 1917–1921)는 `prevFocus.focus()` 복귀를 구현하고 있으나 `openLogDetail`만 누락. 키보드·스크린리더 사용자는 모달 닫힌 후 포커스가 `<body>`로 이동하여 탐색 위치를 잃는다.
- **재현조건:** 커뮤니티 카드 Tab 탐색 → Enter로 `openLogDetail` 열기 → ESC 또는 ✕ 버튼으로 닫기 → 포커스가 카드로 복귀하지 않고 body 또는 다른 요소로 이동.
- **원인:** line 3428 `const close = () => modal.classList.remove("on");` — `prevFocus` 저장 및 복귀 로직 없음.
- **제안 수정:** `const prevFocus = document.activeElement;` 를 모달 열기 직전에 저장하고, `close` 함수를 `const close = () => { modal.classList.remove("on"); document.removeEventListener("keydown", onKey); if (prevFocus?.focus) prevFocus.focus(); };` 로 교체.
- **파일:** [site/app.js](site/app.js) line 3428 [lane:CORE]

## R-89 — 찜UI·가격게이트·닉네임·리뷰이미지 탐색 (2026-06-13)

### [M-146] ✅ 해결완료(2026-06-13, CORE) — `wishItem()` — `pcode`/`weight_g`/`coupang_url` 누락 → 찜 항목을 세트에 담을 때 구매 링크 소실
- **영역:** 프론트엔드 — 찜(wishlist) / 세트 빌더
- **심각도:** 🟠 High
- **발견일시:** 2026-06-13
- **증상:** `wishItem(m, slug)` (line 301)이 반환하는 객체에는 `pcode`, `weight_g`, `coupang_url` 필드가 없다. 상품 목록/모달에서 찜 추가 시 `toggleWishWithHint(wishItem(...))` 로 저장되므로, 해당 찜 항목을 나중에 세트에 담으면 `pcode`가 `undefined`·`coupang_url`이 없어 세트 모달의 구매 버튼이 비활성 상태가 된다(`openSetModal` 구매 셀 line 2693에서 `x.coupang_url` 참조). 반면 `setItem()` (line 347)은 동일 모델을 `pcode`·`weight_g`·`coupang_url` 포함으로 올바르게 구성한다.
- **원인:** `wishItem`과 `setItem`이 중복 구현되어 있으며 `wishItem`만 필드가 부족.
- **재현:** 상품 카드 찜 → account.html 찜 목록 → "세트에 담기" → 세트 모달 구매 버튼 비활성 확인.
- **제안 수정:** `wishItem` 에 `pcode: wishKey(m.brand, m.model, m.capacity)`, `weight_g: m.specs?.weight?.value ?? null`, `coupang_url: m.coupang_url ?? null` 추가, 또는 `setItem`을 재사용하도록 리팩토링.
- **파일:** [site/app.js](site/app.js) line 301 [lane:CORE]

### [M-147] ✅ 해결완료(2026-06-13, BACKEND) — `check_export.py` — `price_min=0` falsy 처리로 0원 모델이 배포 게이트 완전 우회
- **영역:** 백엔드 — 파이프라인 / 가격 sanity check
- **심각도:** 🟠 High
- **발견일시:** 2026-06-13
- **증상:** line 56 `[m["price_min"] for m in models if m.get("price_min")]` 에서 `price_min=0`인 모델은 falsy로 중앙값 계산 목록에서 제외된다. 이어서 line 67 `if pmin and pmin < med * FLOOR_RATIO` 에서도 `pmin=0`은 `and` 조건 실패로 위반 탐지 자체를 건너뛴다. 결과적으로 0원짜리 모델이 JSON에 있어도 CI 배포 게이트가 통과돼 라이브에 0원 가격이 노출된다. 음수 가격도 동일 패턴.
- **원인:** `if m.get("price_min")` 이 0을 falsy로 처리하는 Python 특성 미반영.
- **재현:** site/data 임의 카테고리 JSON에 `"price_min": 0` 모델 삽입 → `python3 pipeline/check_export.py` 실행 → 위반 미탐지 + 배포 허용 확인.
- **제안 수정:** `if m.get("price_min")` → `if m.get("price_min") is not None and m["price_min"] > 0` / `if pmin and …` → `if pmin is not None and pmin > 0 and …` 로 교체. 0원·음수는 별도 `"0원/음수가격"` 위반 종류로 즉시 추가.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 56, 67 [lane:BACKEND]

### [L-176] ✅ 해결완료(2026-06-13, SOCIAL) — `account.html` — 닉네임 변경 후 헤더 갱신을 `[style*="font-weight:700"]` 취약 선택자로 수행
- **영역:** 프론트엔드 — 계정 / 닉네임
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 인라인 닉네임 변경 성공 후 (line 514) `document.querySelector('#auth-section [style*="font-weight:700"]')` 로 프로필 헤더의 닉네임 요소를 찾아 `textContent`를 갱신한다. `renderProfile()`이 `section.innerHTML`을 전면 재작성하므로 헤더 DOM이 교체되거나 스타일 문자열이 조금이라도 달라지면 선택자가 null을 반환해 닉네임이 갱신되지 않고 구 닉네임이 잔류한다.
- **원인:** 프로필 헤더 닉네임 요소에 전용 ID/클래스가 없어 스타일 속성으로 우회 탐색.
- **재현:** 로그인 → 닉네임 변경 저장 → 프로필 헤더 닉네임 확인 (스타일 변경 환경에서 구 닉네임 잔류).
- **제안 수정:** `renderProfile` 내 닉네임 `<div>`에 `id="profile-nickname"` 추가, line 514를 `document.getElementById('profile-nickname')` 로 교체.
- **파일:** [site/account.html](site/account.html) line 424, 514 [lane:SOCIAL]

### [L-177] ✅ 해결완료(2026-06-13, CORE) — `app.js` — 리뷰 사진 `<img>`에 `onerror` fallback 없음 → 깨진 이미지 그대로 노출
- **영역:** 프론트엔드 — 상품 상세 / 리뷰
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 리뷰 썸네일(`pmrv-photo`, line 1998)과 리뷰 상세 이미지(`pmrvd-img`, line 2010) 모두 `onerror` 핸들러가 없다. Supabase Storage URL 만료·삭제·네트워크 오류 시 브라우저 기본 깨진 이미지 아이콘이 그대로 노출된다. 상품 카드 썸네일은 `thumbFallback`으로 처리되어 있어 불일치.
- **원인:** 리뷰 이미지 렌더링 시 `thumbCell` 유틸을 사용하지 않고 직접 `<img>` 태그 생성.
- **재현:** 리뷰에 첨부된 이미지 URL을 Supabase Storage에서 삭제 → 상품 상세 리뷰 탭 확인 → 깨진 이미지 아이콘 노출.
- **제안 수정:** line 1998·2010의 `<img>` 태그에 `onerror="this.style.display='none'"` 또는 공통 fallback 핸들러 추가. 또는 `thumbCell` 유틸을 리뷰 이미지까지 확장.
- **파일:** [site/app.js](site/app.js) line 1998, 2010 [lane:CORE]

### [L-171] ✅ 해결완료(2026-06-13, CORE) — `app.js` — `openProduct()` 모달 하단 상세 링크 — `d.models.indexOf(m) === -1`일 때 `item--1.html` 링크 렌더링
- **영역:** 프론트엔드 — 상품 상세
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openProduct(m)` 모달 하단 "🔗 상세 페이지" 링크(line 1691)에서 `d.models.indexOf(m)`을 사용한다. `renderRecent()`로 복원된 최근 본 상품 객체는 `d.models`의 참조와 다른 새 객체일 수 있어 `indexOf` 결과가 -1이 되면 `href="/item/auto-tent/item--1.html"` 등 깨진 링크가 렌더링된다. 공유 버튼(line 1735)은 `idx >= 0` 조건으로 보호되어 있으나 line 1691은 조건 없이 항상 출력.
- **원인:** line 1691에서 `STATE.slug` 유무만 체크하고 `idx >= 0` 유효성 검사 없음.
- **재현:** `renderRecent()`에서 최근 본 상품 클릭 → `openProduct` 모달 하단 "🔗 상세 페이지" href 확인 → `item--1.html` 형태 URL 노출.
- **제안 수정:** line 1691을 `${STATE.slug && d.models.indexOf(m) >= 0 ? \`<a class="pmlink" href="/item/${STATE.slug}/item-${d.models.indexOf(m)}.html"...>\` : ""}` 로 수정.
- **파일:** [site/app.js](site/app.js) line 1691 [lane:CORE]


---

## 🟠 Medium (회차 67)

### [M-148] ✅ 해결완료(2026-06-13, CORE) — `setItem()` — `weight_g: m.specs?.weight?.value` 잘못된 스펙 키 → 세트 무게 합계 항상 0
- **영역:** 프론트엔드 — 세트 빌더 / 무게 계산
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-13
- **증상:** `setItem(m, slug)` (site/app.js line 374–379)에서 `weight_g: m.specs?.weight?.value ?? null`로 무게를 참조한다. 그러나 전 카테고리(auto-tent, backpacking-tent, sleeping-bag, mat, cookware, burner, chair, table 등 16개 카테고리 전수 확인) 스펙 키는 `weight`가 아닌 `weight_min`이며 `weight` 키는 DB에 존재하지 않는다. 결과적으로 `setItem`으로 생성되는 모든 세트 아이템의 `weight_g`가 `null`로 저장되고, `openSetDetail`·`showSetConfirm`의 `tw = s.items.reduce((sum, x) => x.weight_g != null ? sum + ... : sum, 0)` 합산이 항상 0이 된다. 세트 무게 합계(`"⚖️ 0g"` 또는 `"—"`)가 잘못 표시.
- **재현조건:** 임의 카테고리 → 상품 카드 꾸러미 담기 → 세트 확인 카드 또는 세트 상세 모달 → 무게 합계 `"—"` 또는 0 표시.
- **원인:** `site/app.js` line 377 `m.specs?.weight?.value` → 올바른 키는 `m.specs?.weight_min?.value`.
- **제안 수정:** `setItem` line 377 `weight_g: m.specs?.weight?.value ?? null` → `weight_g: m.specs?.weight_min?.value ?? null` 로 교체. `M-146`의 `wishItem` 동일 패턴도 동시 수정 필요.
- **파일:** [site/app.js](site/app.js) line 377 [lane:CORE]

## 🟢 Low (회차 67)

### [L-178] ✅ 해결완료(기구현·2026-06-13 검증) — `stamp_version.py` — `hj`(app.js 해시) 계산 후 app.js 재수정 → HTML 스탬프 해시 stale
- **영역:** 백엔드 — 파이프라인 / 캐시 버스팅
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `stamp_version.py` line 43에서 `hj = _hash("app.js")`로 해시를 계산한다. 이후 line 62–69에서 app.js에 `supabaseClient.js?v=` 버전 문자열을 다시 쓴다(내용 변경). 그런데 HTML `src="app.js?v=..."` 스탬프(line 77)는 재계산 없이 line 43의 구 `hj`를 사용한다. 결과적으로 HTML에 박힌 해시가 실제 app.js 내용 해시와 다를 수 있어, 서비스워커 캐시가 이 불일치를 기반으로 잘못된 캐시 키를 유지할 수 있다.
- **재현조건:** supabaseClient.js를 처음으로 버전 스탬프하는 상황(기존 `?v=` 없음)에서 `stamp_version.py` 실행 → HTML의 `app.js?v=` 해시와 `md5sum site/app.js` 비교 → 불일치.
- **원인:** line 43 `hj = _hash("app.js")` 계산 시점이 supabaseClient stamp(line 62–69) 이전.
- **제안 수정:** line 43의 `hj, hc` 계산을 supabaseClient stamp(line 62–69) 이후로 이동, 또는 supabaseClient stamp 후 `hj = _hash("app.js")`로 재계산 추가.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 43, 62–69 [lane:BACKEND]

### [L-179] ✅ 해결완료(2026-06-13, CORE) — `stars(n)` — n > 5 입력 시 aria-label "별점 N / 5" 잘못된 접근성 텍스트
- **영역:** 프론트엔드 — 공통 유틸 / 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `stars(n)` (site/app.js line 239–249)에서 n > 5인 경우 별 5개가 모두 채워져 시각적으로는 최고점처럼 보이나, aria-label은 `"별점 6 / 5"` 같은 5 초과 숫자를 그대로 노출한다. 스크린리더 사용자에게 5점 만점 척도를 벗어난 값으로 읽힌다. 현재 DB 데이터에서는 stars>5 실데이터가 없지만, `cellVal` 가성비(value) 계산(`s.stars / (m.price_min / 10000)`)이 이론적으로 5를 초과할 수 있다.
- **재현조건:** `stars(6)` 직접 호출 또는 price_min이 매우 낮은 상품의 가성비 정렬 → aria-label 확인.
- **원인:** `stars(n)` 렌더링 로직에 n > 5 클리핑 없음.
- **제안 수정:** 함수 진입부에 `n = Math.min(5, n)` 또는 aria-label을 `Math.min(n, 5).toFixed(1)` 로 교체.
- **파일:** [site/app.js](site/app.js) line 239–249 [lane:CORE]

### [M-149] ✅ 해결완료(2026-06-13, CORE) — `setupSearchPage` 찜 추가 시 `pcode`·`weight_g`·`coupang_url` 누락 → 세트 담기 시 구매 링크 소실
- **영역:** 프론트엔드 — search 페이지 / 찜 직렬화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `search.html`의 검색 결과에서 찜 버튼을 누르면 `{ key, b, m, cap, s, p, img }` 만 저장되고 `pcode`·`weight_g`·`coupang_url`이 누락된다. 이후 이 찜 항목을 세트에 담을 때 `addToSet`에서 `item.pcode` 기반 중복 체크가 동작하지 않고, 세트 상세의 구매 버튼이 `coupang_url`이 없어 비활성 상태가 된다. M-146(`wishItem()`)과 같은 패턴이지만 search 페이지 전용 코드 경로라 별도 수정이 필요하다.
- **재현조건:** search.html에서 상품 검색 → 찜 버튼 클릭 → `localStorage.wish` 확인 → `pcode`/`coupang_url` 필드 없음 → 해당 항목을 세트에 담기 → 구매 버튼 비활성.
- **원인:** `setupSearchPage` 내 찜 push 로직(line 1040)이 `setItem()` 헬퍼를 사용하지 않고 인라인 객체를 직접 구성.
- **제안 수정:** `arr.push({ key, b: x.b, m: x.m, cap: x.cap, s: x.s, p: x.p, img: x.img })` → `arr.push({ key, b: x.b, m: x.m, cap: x.cap, s: x.s, p: x.p, img: x.img, pcode: x.pcode, weight_g: x.weight_g ?? null, coupang_url: x.coupang_url ?? null })` 로 교체.
- **파일:** [site/app.js](site/app.js) line 1040 [lane:CORE]

### [M-150] ✅ 해결완료(2026-06-13, CORE) — `openReviewDetail` 이미지 `loading="lazy"` — `display:none` 모달에서 주입 시 이미지 미로딩
- **영역:** 프론트엔드 — 리뷰 상세 모달 / 이미지 로딩
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openReviewDetail`에서 이미지를 `loading="lazy"`로 렌더링한 뒤 `.pmodal.on` 클래스를 추가해 모달을 열 때, 이미지가 `display:none` 상태의 DOM에 이미 삽입된 상태다. 이 경우 브라우저(특히 Chromium)는 `display:none` 요소 내 `loading=lazy` 이미지를 즉시 로드하지 않으므로, 클래스가 바뀌어 `display:flex`가 되더라도 IntersectionObserver 재평가 타이밍에 따라 이미지가 지연 또는 미로딩된다. 후기 사진이 있음에도 빈 영역만 보이는 증상이 발생한다.
- **재현조건:** 후기 사진이 있는 상품에서 후기 카드 클릭 → `openReviewDetail` 모달 열림 → 이미지 영역 확인 → 일부 환경(느린 네트워크·lazy 평가 타이밍)에서 이미지 미표시.
- **원인:** `openReviewDetail` line 2036에서 `loading="lazy"` 사용. 모달이 `display:none`에서 바뀌는 순간 lazy 이미지를 즉시 로드하지 않는 브라우저 동작.
- **제안 수정:** `loading="lazy"` → `loading="eager"`로 교체. 리뷰 모달 이미지는 최대 5장이며 사용자가 명시적으로 열었으므로 eager 로딩이 적합하다.
- **파일:** [site/app.js](site/app.js) line 2036 [lane:CORE]

### [L-180] ✅ 해결완료(2026-06-13, CORE) — `setupHomeSearch` `onblur` — `closeBox()` 미호출로 `opts`·`active` stale 상태 잔존
- **영역:** 프론트엔드 — 홈 검색 자동완성 / 키보드 내비게이션
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `inp.onblur` 핸들러(line 910)가 `box.style.display = "none"` 만 수행하고 `closeBox()`를 호출하지 않아 `opts` 배열과 `active` 인덱스가 초기화되지 않는다. 이후 포커스가 다시 돌아와 `run()`이 재실행되기 전에 ArrowDown/ArrowUp 키를 누르면 `box.style.display !== "none"` 조건이 방어하지만, 외부에서 `box`를 보이도록 하는 엣지케이스(예: 동일 페이지에서 프로그래밍 방식으로 `display:block` 복원)에서 stale `opts`가 잘못된 요소에 aria-activedescendant를 세팅한다.
- **재현조건:** 홈 검색창 포커스 → 키 입력으로 드롭다운 열기 → blur 발생 → 150ms 내에 포커스 복귀 + ArrowDown → stale active 상태 확인.
- **원인:** `inp.onblur`(line 910)에서 `closeBox()` 대신 `box.style.display = "none"`만 직접 호출.
- **제안 수정:** `inp.onblur = () => { setTimeout(() => closeBox(), 150); }` 로 교체.
- **파일:** [site/app.js](site/app.js) line 910 [lane:CORE]

### [L-181] ✅ 해결완료(기구현·2026-06-13 검증) — `harvest_tents.py` `ingest()` — `SELECT ... model_year IS NULL AND variant IS NULL` fetchone None → TypeError
- **영역:** 백엔드 — harvest_tents 크롤링 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `ingest()` line 127–128에서 `INSERT OR IGNORE` 후 `SELECT id FROM products WHERE brand_id=? AND model_name=? AND model_year IS NULL AND variant IS NULL`을 `fetchone()[0]`으로 조회한다. `INSERT OR IGNORE`가 유니크 제약 충돌로 무시된 경우, 실제 row가 `model_year IS NOT NULL` 또는 `variant IS NOT NULL`인 경우(수동 입력 또는 multicat에서 같은 브랜드·모델명을 별도 variant로 삽입한 경우) SELECT 결과가 None이 되어 `TypeError: 'NoneType' object is not subscriptable`이 발생한다. `seen_names` 중복 체크 이전에 데이터가 변경된 상태이면 런타임 크래시로 수확이 중단된다.
- **재현조건:** 같은 브랜드+모델명의 row가 이미 `variant='2인용'` 등으로 존재하는 DB에서 `harvest_tents.py --append` 실행 → `ingest()` 진입 → line 128 TypeError.
- **원인:** `AND model_year IS NULL AND variant IS NULL` 조건이 너무 구체적이어서 기존 row가 있어도 None을 반환.
- **제안 수정:** `SELECT id FROM products WHERE brand_id=? AND model_name=? ORDER BY id LIMIT 1`로 완화하거나, fetchone 결과에 `if pid is None: return "dup_variant"` guard 추가.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 127–128 [lane:BACKEND]

### [H-42] ✅ 해결완료(기구현·2026-06-13 검증) — `account.html` — 비로그인 상태에서 찜 목록·로그 목록 노출 — 로그인 후에만 표시해야 함
- **영역:** 프론트엔드 — account.html (찜/로그 섹션)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `account.html` line 202 주석 `"찜 목록은 로그인 여부와 무관하게 즉시 표시(localStorage 기준)"`에 따라 비로그인 상태에서도 `renderAccount()`가 즉시 호출되어 찜 목록과 로그 목록이 노출된다. 로그인 없이 찜한 상품과 내 로그가 보여야 하지 않으며, 로그인을 하지 않은 상태에서는 해당 섹션이 아예 표시되지 않아야 한다.
- **재현조건:** 로그아웃 상태(또는 최초 방문) → `account.html` 접속 → 찜 목록·로그 목록 섹션이 노출됨(빈 상태 또는 localStorage 데이터 표시).
- **원인:** ① `account.html` line 204: `if (!_isViewSet && typeof renderAccount === 'function') renderAccount()` — `initAuth` 콜백 이전에 즉시 실행. ② `showLoggedInSections(show)` 함수가 있으나 비로그인 시 `renderAccount()` 자체를 막지 않음. ③ 의도적 설계(`L-22`: 비로그인 찜 CTA 노출)이나 정책 변경 필요.
- **제안 수정:** `account.html` line 204의 즉시 `renderAccount()` 호출 제거. `initAuth` 콜백에서 `user`가 확인된 후에만 `renderAccount()` 호출. 비로그인 시 찜/로그/세트 섹션 `display:none` 유지하고 로그인 CTA만 표시.
- **파일:** [site/account.html](site/account.html) line 202–204, line 355–370 [lane:CORE]

### [M-151] ✅ 해결완료(기구현·2026-06-13 검증) — `signOut()` — 로그아웃 후 localStorage `wish` 미삭제 → 비로그인 상태에서 이전 사용자 찜 목록 잔존
- **영역:** 프론트엔드 — 찜(wishlist) / 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `supabaseClient.js:37` `signOut()`이 `supabase.auth.signOut()`만 호출하고 `localStorage.removeItem("wish")`를 호출하지 않는다. 로그아웃 후 다른 사람이 같은 기기를 사용하면 이전 사용자의 찜 목록이 그대로 노출된다. `account.html` 찜 섹션은 비로그인에도 `display:block`(L-22 의도)으로 표시하도록 설계되어 있어 로그아웃해도 찜이 사라지지 않는다.
- **재현조건:** ① 로그인 후 찜 추가 → ② 로그아웃 → ③ account.html 접속 → 찜 목록 그대로 표시됨.
- **원인:** `site/supabaseClient.js:37–38` `signOut()`에 localStorage 정리 로직 없음.
- **제안 수정:** `signOut()` 함수에 `localStorage.removeItem("wish"); localStorage.removeItem("sets");` 추가. 또는 `account.html`의 로그아웃 핸들러(line 284, 444, 458)에서 각각 `setWish([])` 호출.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 37–38, [site/account.html](site/account.html) line 284 [lane:CORE]

---

## R-90 — 필터초기화·가격·공유URL·export 탐색 (2026-06-13)

### [M-152] ✅ 해결완료(기구현·2026-06-13 검증) — `clearAllFilters()` — `serializeState()` 미호출 → URL에 이전 필터 파라미터 잔존
- **영역:** 프론트엔드 — category.html 필터 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `clearAllFilters()`(line 1753)는 STATE를 초기화하고 `syncFilterUI(); draw();`만 호출한다. `serializeState()`를 호출하지 않아 URL에 이전 필터 파라미터(`cap=`, `brands=`, `__min/__max`, `sort=` 등)가 그대로 남는다. 필터를 초기화한 후 URL을 복사해 공유하면 수신자는 초기화 전 필터 상태로 페이지를 열게 된다. 또한 브라우저 뒤로가기 후 재진입 시 stale URL 파라미터로 필터가 복원된다.
- **재현조건:** ① category.html에서 브랜드·가격 필터 적용 → URL에 `brands=XXX&price__min=YYY` 반영 확인 → ② "전체 해제" 버튼 클릭(`clearAllFilters`) → ③ URL 확인 — 파라미터가 그대로 남아있음.
- **원인:** `clearAllFilters()` line 1753–1758에 `serializeState()` 호출 없음. 비교: 일반 필터 변경 시에는 `buildFilters()` 콜백(line 1206)과 `draw()` 호출부(line 2448)에서 `serializeState()`가 호출됨.
- **제안 수정:** `clearAllFilters()` 함수 말미에 `serializeState();` 추가.
- **파일:** [site/app.js](site/app.js) line 1753–1758 [lane:CORE]

### [M-153] ✅ 해결완료(2026-06-13) — `priceRange` / `priceLabeled` — `price_min=0` 을 유효 가격으로 렌더링 → "0원" 노출
- **영역:** 프론트엔드 — 상품 카드·모달 가격 표시 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `priceRange(a, b)`(line 223)와 `priceLabeled(n)`(line 227)은 `null` 체크만 하고 `0` 체크를 하지 않는다. `price_min=0`인 모델이 DB에 존재하면(M-147 배포게이트 우회 또는 수동 0원 입력) 카드·모달에 "0원" 또는 "0원 최저가 기준"이 표시된다. 또한 가성비 계산(line 1803 `if (!s || !m.price_min)`)은 `price_min=0`을 falsy로 처리해 계산을 건너뛰지만 렌더링은 "0원"으로 그대로 표시되어 불일치가 발생한다.
- **재현조건:** `price_min=0`인 모델이 DB에 존재할 때 category.html 진입 → 카드 가격란에 "0원 최저가 기준" 표시.
- **원인:** `priceRange`/`priceLabeled`가 `n == null`만 체크하고 `n === 0` falsy 케이스를 무처리.
- **제안 수정:** `priceRange`/`priceLabeled`를 `n == null || n === 0 ? nullHtml : won(n)` 로 수정하거나, `won(n)`에서 `n === 0` 시 `"—"` 반환.
- **파일:** [site/app.js](site/app.js) line 223, 227 [lane:CORE]

### [L-182] ✅ 해결완료(기구현·2026-06-13 검증) — `view-set` 공유 URL — `btoa` 결과 URL-safe 처리 없음 → `+`, `/` 포함 시 파싱 실패
- **영역:** 프론트엔드 — account.html 세트 공유 URL (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 세트 공유 URL 생성 시(line 3250–3251) `btoa(unescape(encodeURIComponent(JSON.stringify(payload))))` 결과를 URL-safe 인코딩 없이 `?view-set=${encoded}` 형태로 그대로 사용한다. Base64 표준 출력에는 `+`, `/`, `=` 문자가 포함될 수 있다. 이 URL이 SNS·메신저를 거치거나 `encodeURIComponent` 없이 복사되면 `+`가 스페이스로 변환되거나 `=` 패딩이 탈락해, 수신자 측 `atob(vsParam)` 또는 `JSON.parse` 단계에서 오류가 발생한다. `catch {}` 블록이 있어 silently 실패하지만 모달이 열리지 않는다.
- **재현조건:** 세트 이름·아이템명에 한글이 포함되거나 payload 길이가 3의 배수가 아닐 때 `btoa` 결과에 `+` 또는 `=` 포함 가능 → 해당 URL을 카카오톡 등 메신저로 전송 후 수신자가 열면 세트 모달 미노출.
- **원인:** line 3250에서 `btoa()` 결과를 `encodeURIComponent()`로 감싸지 않음. URL-safe Base64(`+→-`, `/→_`, `=` 제거) 변환 없음.
- **제안 수정:** `const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');` 및 복호화 측에서도 역변환 적용.
- **파일:** [site/app.js](site/app.js) line 3250–3251, 3872 [lane:CORE]

---

## R-91 — 프론트/백엔드 종합 버그 탐색 (2026-06-13)

### [H-43] ✅ 해결완료(기구현·2026-06-13 검증) — `openLogDetail` — `p.content` null 직접 `.length` 접근 → TypeError

- **영역:** 프론트엔드 — 커뮤니티/소셜 로그 상세 (app.js)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()` 내부에서 `p.content.length > 80` 비교 시 `p.content`가 null/undefined이면 TypeError 발생. 바로 위 줄의 preview 추출은 `p.content || ""` 로 보호되어 있지만 length 비교는 raw 접근이다. 삭제된 글·body=null 데이터 진입 시 로그 상세 모달 전체가 크래시된다.
- **재현조건:** `content`(또는 `body`)가 null인 게시글 → 로그 상세 클릭 → 모달 오픈 실패.
- **원인:** `app.js` 로그 상세 렌더 부분에서 `p.content || ""`로 감싸지 않고 직접 `.length` 호출.
- **제안 수정:** `p.content.length > 80` → `(p.content || "").length > 80`
- **파일:** [site/app.js](site/app.js) (openLogDetail 내부) [lane:CORE]

---

### [M-154] ✅ 해결완료(2026-06-13) — `posts` 테이블 컬럼 혼용 — `renderAccount`는 `body`, `renderLogFeed`는 `content` select → 한쪽 항상 null

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일한 `posts` 테이블을 `renderAccount`는 `.select("id, title, body, created_at")`로, `renderLogFeed`는 `.select("id, title, content, tags, ...")`로 조회한다. 실제 스키마의 컬럼명이 `body`든 `content`든 한쪽은 항상 null을 반환하여 글 목록 또는 피드가 공백으로 표시된다. 또한 `renderLogFeed`에는 `deleted_at IS NULL` 필터가 없어 삭제된 글이 피드에 노출될 수 있다.
- **재현조건:** account.html의 내 게시글 목록과 커뮤니티 피드 중 한 곳이 항상 공백.
- **원인:** app.js 두 Supabase 쿼리에서 컬럼명 불일치. 개발 중 스키마 rename이 한쪽에만 반영된 것으로 추정.
- **제안 수정:** 실제 Supabase posts 테이블 스키마 확인 후 두 쿼리를 동일 컬럼명으로 통일. `renderLogFeed` 쿼리에 `.is("deleted_at", null)` 필터 추가.
- **파일:** [site/app.js](site/app.js) (renderAccount posts select, renderLogFeed posts select) [lane:CORE]

---

### [M-155] — `syncFilterUI` — `document.getElementById("filters")` null 체크 없이 `querySelectorAll` 직접 호출 → TypeError — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — category.html 필터 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `syncFilterUI()`에서 `const bar = document.getElementById("filters")`를 한 뒤 null 체크 없이 `bar.querySelectorAll(...)`을 호출한다. `clearAllFilters()`가 `syncFilterUI()`를 호출하므로, filters 엘리먼트가 없는 페이지(category.html 외)에서 `clearAllFilters()`가 실수로 호출되면 TypeError로 크래시된다.
- **재현조건:** category.html이 아닌 페이지에서 `clearAllFilters()` 호출 시 `Cannot read properties of null (reading 'querySelectorAll')`.
- **원인:** `syncFilterUI()` 최상단에 `if (!bar) return;` 가드 누락.
- **제안 수정:** `const bar = document.getElementById("filters"); if (!bar) return;`
- **파일:** [site/app.js](site/app.js) (syncFilterUI) [lane:CORE]

---

### [M-156] — `renderNicknameModal` / `initNickChange` — 닉네임 중복 확인 결과(`lastChecked`) 미검증으로 미완료 닉네임 저장 가능 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — account.html 닉네임
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 닉네임 저장 버튼 클릭 시 NICKNAME_RE 정규식 통과 여부만 확인하고 `lastChecked` 변수(비동기 중복확인 결과)를 검증하지 않는다. debounce 중 빠르게 저장을 클릭하면 중복 확인이 완료되지 않은 닉네임으로 `setNickname()` 요청이 나간다. 신규 가입 모달(`renderNicknameModal`)과 닉네임 변경 폼(`initNickChange`) 모두 동일한 결함.
- **재현조건:** 닉네임 입력창에 타이핑 직후(debounce 대기 중) 즉시 저장 버튼 클릭 → 중복 확인 없이 저장 시도.
- **원인:** `account.html` 저장 버튼 핸들러에서 `if (!lastChecked || !lastChecked.ok) return;` 가드 누락.
- **제안 수정:** 저장 핸들러 시작부에 `if (!lastChecked?.ok) { err.textContent="중복 확인 중입니다"; return; }` 추가.
- **파일:** [site/account.html](site/account.html) (renderNicknameModal save handler, initNickChange save handler) [lane:CORE]

---

### [L-183] — `showLoggedInSections` — `?view-set` URL 파라미터 존재 시 신규 로그인 유저 닉네임 모달 억제

- **영역:** 프론트엔드 — account.html 닉네임 / 세트공유
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `?view-set=...` 파라미터가 있는 URL로 처음 로그인하는 신규 사용자는 `_isViewSet=true` 분기로 `showLoggedInSections()`가 조기 return 되어 닉네임 설정 모달이 표시되지 않는다. 닉네임 미설정 상태로 계정에 진입하게 된다.
- **재현조건:** 공유 세트 URL(`?view-set=...`)을 처음 받은 신규 유저가 OAuth 로그인 → account.html 리다이렉트 → 닉네임 모달 미노출.
- **원인:** `account.html` `showLoggedInSections()`의 `_isViewSet` 조기 return이 닉네임 체크보다 앞에 위치.
- **제안 수정:** `_isViewSet` 분기 전에 닉네임 미설정 유저를 먼저 확인하거나, 닉네임 모달을 `_isViewSet`과 독립적으로 처리.
- **파일:** [site/account.html](site/account.html) (showLoggedInSections) [lane:CORE]

---

### [L-184] — `openLogModal` — 이미지 교체·폼 닫기 시 Blob URL `revokeObjectURL` 미호출 → 메모리 누수

- **영역:** 프론트엔드 — 커뮤니티/소셜 로그 작성 모달 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openLogModal()`의 이미지 선택 핸들러에서 `imgThumb.src = URL.createObjectURL(file)` 호출 후 폼 닫기·이미지 재선택 시 이전 Blob URL을 `URL.revokeObjectURL()`로 해제하지 않아 메모리 누수가 발생한다. 리뷰 폼(`wireReviews`)은 `renderThumbs`에서 명시적으로 revoke 처리하지만 로그 폼은 누락.
- **재현조건:** 로그 작성 모달 열기 → 이미지 선택 → 다른 이미지로 교체 또는 모달 닫기 → 반복 시 메모리 점진적 증가.
- **원인:** 로그 모달 이미지 핸들러에 revoke 로직 없음.
- **제안 수정:** 새 파일 선택 전 `if (imgThumb.src?.startsWith('blob:')) URL.revokeObjectURL(imgThumb.src);` 추가. 모달 닫기 핸들러에서도 동일 처리.
- **파일:** [site/app.js](site/app.js) (openLogModal 이미지 선택 핸들러) [lane:CORE]

---

### [M-157] ✅ 분석완료(moot: L-268으로 SHELL 실패 시 shellOk=false·skipWaiting 차단, DATA 실패는 설계상 무음) — `sw.js` install handler — `SHELL` addAll 실패를 `.catch(()=>{})` 무음 처리 → 오프라인 셸 불완전 설치 후 SW activate

- **영역:** 프론트엔드 — PWA / Service Worker
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `install` 이벤트 핸들러에서 `c.addAll(SHELL).catch(() => {})` 로 SHELL 목록 캐싱 실패를 무음 처리한다. SHELL 목록 중 하나라도 404이거나 네트워크 오류이면 `addAll` 전체가 실패하지만 catch에서 삼켜져 `skipWaiting()`으로 진행한다. 결과적으로 index.html·account.html 등 핵심 셸이 캐시되지 않은 채 SW가 activate되어 오프라인 시 빈 화면이 표시된다.
- **재현조건:** SHELL 목록 중 하나의 URL이 일시적으로 오류 응답 시 → 오프라인 진입 → 셸 전체 미캐시로 빈 화면.
- **원인:** `site/sw.js` line 17 `c.addAll(SHELL).catch(() => {})` — 에러를 무시하고 SW 설치를 강행.
- **제안 수정:** 실패 시 `console.warn` 최소 로깅 추가. SHELL 목록을 개별 `cache.put()`으로 분리해 부분 실패를 허용하거나, 실패한 URL만 제외하고 설치 계속 진행.
- **파일:** [site/sw.js](site/sw.js) line 17 [lane:CORE]

---

### [M-158] ✅ 해결완료(2026-06-13) — `normalize_models.py` `normalize_db()` — `canonical_models` INSERT GROUP BY에 `p.capacity` 직접 사용 — NULL 그룹화 오류

- **영역:** 백엔드 — 파이프라인 / 데이터 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canonical_models` INSERT 쿼리의 GROUP BY가 `IFNULL(p.capacity, -1)` 대신 `p.capacity`를 그대로 사용한다. SQLite는 NULL 값들을 각각 별개의 그룹으로 처리하므로 capacity=NULL인 여러 행이 하나의 canonical 모델로 묶이지 않고 개별 canonical로 생성된다. `export_site.py` 및 `flag_price_outliers`는 `IFNULL(p.capacity,-1)`로 그룹화하여 불일치 발생.
- **재현조건:** capacity=NULL인 제품이 여러 variant로 존재할 때 `normalize_db()` 실행 → canonical 중복 생성.
- **원인:** `pipeline/normalize_models.py` canonical INSERT GROUP BY 절에서 NULL-safe 처리 누락.
- **제안 수정:** GROUP BY `p.capacity` → GROUP BY `IFNULL(p.capacity, -1)`.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) (normalize_db canonical INSERT) [lane:BACKEND]

---

### [M-159] ✅ 해결완료(2026-06-13) — `normalize_models.py` `flag_price_outliers()` — 짝수 개 가격 목록 중앙값 인덱스 오류

- **영역:** 백엔드 — 파이프라인 / 가격 이상치 탐지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `med = prices[len(prices) // 2]` 공식은 리스트 길이가 짝수일 때(예: 4개) `prices[2]`(상위 절반 첫 값)를 중앙값으로 택한다. 보수적 기준을 원한다면 `prices[(n-1)//2]`(하위 중앙값)이 적절하다. 현재 공식은 이상치 판단 기준을 실제보다 높게 잡아 일부 저가 오기 데이터가 이상치 필터를 통과할 수 있다.
- **재현조건:** 동일 canonical에 4개 가격이 있을 때 이상치 탐지 기준이 의도보다 높게 설정됨.
- **원인:** `pipeline/normalize_models.py` `flag_price_outliers()` 중앙값 계산식.
- **제안 수정:** `med = prices[len(prices) // 2]` → `med = prices[(len(prices) - 1) // 2]`
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) (flag_price_outliers) [lane:BACKEND]

---

### [M-160] ✅ 해결완료(2026-06-13) — `validate_ranges.py` `HARD_RANGES` dict — `brightness`·`runtime` 키 중복 정의로 첫 번째 값 무음 덮어쓰기

- **영역:** 백엔드 — 파이프라인 / 스펙 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `HARD_RANGES` dict 리터럴에서 `"brightness"`와 `"runtime"` 키가 두 번 정의된다. Python은 마지막 값을 사용하므로 첫 번째 정의가 무음 무시된다. 현재는 두 정의값이 우연히 동일해 기능 이상은 없지만, 향후 앞 정의만 수정하면 두 번째가 덮어 수정이 미반영되는 잠재 버그.
- **원인:** `pipeline/validate_ranges.py` `HARD_RANGES` 딕셔너리 중복 키.
- **제안 수정:** 중복 키 제거.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) (HARD_RANGES) [lane:BACKEND]

---

### [L-185] ✅ 해결완료(2026-06-13) — `ocr_specs.py` `parse_specs()` — `max(kgs) * 1000`을 `weight_min`으로 저장 — 의미적 역전

- **영역:** 백엔드 — 파이프라인 / OCR 스펙 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** OCR로 추출한 kg 값 중 최댓값(`max(kgs)`)을 1000 곱해 `weight_min`(최소 중량)으로 저장한다. 상품 상세 이미지에는 패키지 총중량(본체보다 큼)이 표기되는 경우가 많아, 최댓값이 배송 무게로 추정되므로 `min(kgs)`가 본체 무게로 더 적절하다. 현재 코드는 실제 최소 무게보다 높은 값을 `weight_min`으로 저장할 수 있다.
- **원인:** `pipeline/ocr_specs.py` `parse_specs()` 내 `max(kgs) * 1000` 사용.
- **제안 수정:** `max(kgs)` → `min(kgs)` (또는 별도 로직으로 패키지/본체 무게 구분).
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) (parse_specs) [lane:BACKEND]

---

### [L-186] ✅ 해결완료(2026-06-13) — `ocr_specs.py` — `open()` without `with` → 예외 시 파일 핸들 누수

- **영역:** 백엔드 — 파이프라인 / OCR 스펙 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `json.load(open(path, encoding="utf-8"))` 패턴으로 파일을 열고 닫지 않는다. 정상 동작 시 GC가 처리하지만 예외 발생 시 파일 핸들이 누수된다. `run()` 함수에서도 동일 패턴 반복.
- **원인:** `pipeline/ocr_specs.py` 여러 곳에서 `with open(...)` 대신 `open()` 직접 사용.
- **제안 수정:** `with open(path, encoding="utf-8") as f: data = json.load(f)` 패턴으로 변경.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) [lane:BACKEND]


---

## R-92 — 프론트/백엔드 종합 버그 탐색 2차 (2026-06-13)

### ✅ 해결완료(2026-06-13) [H-44] — `add_value_star.py` — `capacity_l["value"]` ZeroDivisionError + KeyError → 가성비 계산 전체 크래시

- **영역:** 백엔드 — 파이프라인 / 가성비 계산
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `m["price_min"] / m["specs"]["capacity_l"]["value"]` 에서 (1) `capacity_l` 키가 없는 모델에서 KeyError, (2) `value`가 0인 경우 ZeroDivisionError 발생. 어느 쪽이든 스크립트 전체가 traceback으로 종료되어 가성비 별점이 전체 모델에 반영되지 않는다.
- **재현조건:** capacity_l 스펙이 없는 모델 또는 value=0인 모델이 DB에 존재할 때 `add_value_star.py` 실행 시.
- **원인:** `pipeline/add_value_star.py` line 17에 `capacity_l` 존재 여부 및 0 체크 없음.
- **제안 수정:** `cap = m.get("specs", {}).get("capacity_l", {}).get("value") or 0; if not cap: continue` 추가.
- **파일:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 17 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-45] — `enrich_details.py` — `danawa_pcode` 문자열 포맷팅 SQL 직접 삽입 → SQL Injection 위험

- **영역:** 백엔드 — 파이프라인 / 상품 상세 수집
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `",".join("'%s'" % t[1] for t in targets)` 형태로 pcode를 SQL 쿼리에 직접 문자열 삽입한다. pcode에 `'` 또는 `--`가 포함되면 쿼리가 파괴된다. 현재 pcode는 주로 숫자이나 타입 보장이 없어 잠재적 SQL Injection.
- **원인:** `pipeline/enrich_details.py` line 114–115, 파라미터 바인딩(`?`) 대신 `%s` 문자열 포맷팅 사용.
- **제안 수정:** placeholders = ",".join("?" * len(targets)) → `cur.execute(f"... IN ({placeholders})", [t[1] for t in targets])`
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 114–115 [lane:BACKEND]

---

### [M-161] — `auth-callback.html` — top-level `await` in ES module → iOS 14 이하 Safari 인증 콜백 전체 실패 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 인증 / OAuth 콜백
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `<script type="module">` 최상위에서 `await supabase.auth.exchangeCodeForSession(code)`를 직접 사용한다. iOS 14 이하 Safari는 ES module top-level await를 지원하지 않아 인증 콜백 스크립트 전체가 실행되지 않는다. 해당 기기에서 OAuth 로그인 시 무한 스피너 또는 에러 없는 콜백 실패가 발생한다.
- **원인:** `site/auth-callback.html` top-level await — async IIFE로 감싸지 않음.
- **제안 수정:** `(async () => { await supabase.auth.exchangeCodeForSession(code); ... })();` 형태로 변경.
- **파일:** [site/auth-callback.html](site/auth-callback.html) line 60 [lane:CORE]

---

### [M-162] — `auth-callback.html` — code/hash 없이 직접 접근 시 15초 무한 스피너 (에러 메시지 없음) — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 인증 / OAuth 콜백
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** URL에 `code`나 hash가 없는 직접 접근 시(URL 직접 입력, 잘못된 리다이렉트 등) `onAuthStateChange` 구독만 등록되고 15초가 지나야 에러 처리 경로에 진입한다. 사용자에게는 15초간 스피너만 보이며 아무 안내 없음.
- **원인:** `site/auth-callback.html` — 즉시 fallback redirect 또는 짧은 timeout 없음.
- **제안 수정:** code/hash 파라미터 없으면 즉시 `window.location.replace("account.html")` 또는 2~3초 후 리다이렉트.
- **파일:** [site/auth-callback.html](site/auth-callback.html) line 67–87 [lane:CORE]

---

### [M-163] — `openSetModal` — 400ms 닫힘 딜레이 중 다른 세트 버튼 클릭 가능 → 동일 아이템 중복 담기 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 빌더 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `.sm-set-btn` 클릭 후 `addToSet()` 호출 시 클릭한 버튼만 disabled 처리하고 모달은 `setTimeout(..., 400)` 후 닫힌다. 이 400ms 사이에 다른 세트 버튼을 클릭하면 동일 아이템이 두 개의 세트에 각각 담긴다.
- **재현조건:** 세트 담기 모달에서 버튼 클릭 직후 400ms 이내 다른 세트 버튼 클릭.
- **원인:** `site/app.js` `openSetModal` — 첫 클릭 시 모달 내 모든 버튼을 disabled 처리하지 않음.
- **제안 수정:** 첫 세트 버튼 클릭 즉시 `modal.querySelectorAll(".sm-set-btn").forEach(b => b.disabled = true)` 적용.
- **파일:** [site/app.js](site/app.js) (openSetModal .sm-set-btn onclick) [lane:CORE]

---

### [M-164] ✅ 분석완료(무효, esc+HTML파서 이중디코드 정상동작) — `renderBrand` — 브랜드명에 `&` 포함 시 `esc()` 이중 인코딩 → 칩 레이블 `&amp;amp;` 표시

- **영역:** 프론트엔드 — 브랜드 페이지 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `data-b="${esc(b)}"` 로 어트리뷰트에 HTML 인코딩 후 저장하고, 클릭 핸들러에서 `btn.dataset.b`로 꺼낼 때 브라우저가 자동 디코딩한다. 그런데 이후 `renderChips()` 등에서 다시 `esc(nb)`를 적용하면 이미 디코딩된 `&`가 `&amp;`로 재인코딩되어 화면에 `&amp;`가 그대로 표시된다. 브랜드명에 `&`가 포함된 경우(예: "Black & Decker") 칩·헤더 레이블이 깨진다.
- **원인:** `site/app.js` `renderBrand` — `data-b` 저장 시와 표시 시 이중 인코딩.
- **제안 수정:** `data-b`에 raw 값 저장 후 innerHTML 삽입 시에만 `esc()` 적용.
- **파일:** [site/app.js](site/app.js) (renderBrand) [lane:CORE]

---

### [M-165] ✅ 해결완료(2026-06-13) — `promote_catalog.py` — `CORE` 리스트가 비어있을 때 `IN ()` SQL 문법 오류

- **영역:** 백엔드 — 파이프라인 / 카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `CORE` 리스트 길이가 0이면 `WHERE ... IN ()` 형태의 SQL이 생성되어 SQLite에서 문법 오류 발생. `CORE`는 하드코딩 리스트지만 향후 외부 파일 또는 빈 쿼리 결과로 교체될 경우 파이프라인 전체 실패.
- **원인:** `pipeline/promote_catalog.py` line 32–40 — `len(CORE) == 0` 가드 없음.
- **제안 수정:** `if not CORE: return` early exit 추가.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 32–40 [lane:BACKEND]

---

### [L-187] — `login.html` — `<meta http-equiv="refresh" content="0;...">` — 일부 브라우저 히스토리 백버튼 루프 유발

- **영역:** 프론트엔드 — 로그인 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `content="0;url=account.html"` 의 즉시(0초) redirect는 일부 브라우저(특히 모바일)에서 히스토리 스택에 login.html을 남겨 뒤로가기 시 login→account→login 무한 루프가 발생할 수 있다.
- **원인:** `site/login.html` meta refresh delay=0.
- **제안 수정:** JS `window.location.replace("account.html")`로 교체 (히스토리 미기록).
- **파일:** [site/login.html](site/login.html) [lane:CORE]

---

### [L-188] ✅ 해결완료(2026-06-13, C14) — `affiliate_links.py` `sample()` — `naver_fallback` 키 없는 결과에서 KeyError

- **영역:** 백엔드 — 파이프라인 / 제휴링크
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `resolve_buy_link()`가 `coupang_url` 있는 경우 `naver_fallback` 키를 포함하지 않고 반환하는데, `sample()` 함수에서 `link["naver_fallback"]`를 직접 접근해 KeyError가 발생한다.
- **원인:** `pipeline/affiliate_links.py` line 74 — `.get("naver_fallback", "없음")` 형태 미사용.
- **제안 수정:** `link.get("naver_fallback", "—")` 로 변경.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 [lane:BACKEND]


---

## R-93 — 프론트/백엔드 종합 버그 탐색 3차 (2026-06-13)

### [H-46] ✅ 해결완료(2026-06-13, BACKEND) — `resolve_duplicates.py` — loser가 `rep_product_id`가 아닐 때 `min_price=None` 오평가 → winner 선정 오류
> min_price를 그룹키(brand_id+canonical_model+capacity)로 1회 조회 → 그룹 내 후보가 가격보유여부 공유, 차별화는 spec_count·id로. capacity INT/REAL·NULL은 SQLite `IS`로 매칭(4 IS 4.0=1 검증). 합성DB E2E: 현 rep(pid10,스펙1)이 아닌 스펙많은 pid20이 winner로 정상 선정.

- **영역:** 백엔드 — 파이프라인 / 중복 해소
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `resolve()` 내부에서 `SELECT min_price FROM canonical_models WHERE rep_product_id=?`로 각 pid의 min_price를 조회하는데, pid가 canonical_models의 rep가 아닌 일반 products.id인 경우 row=None → min_price=None으로 평가된다. min_price가 낮을수록 winner가 되어야 하는데 None이 가장 낮게 취급되어 잘못된 제품이 canonical rep로 선정될 수 있다.
- **원인:** `pipeline/resolve_duplicates.py` line 46–49 — rep 여부와 무관하게 pid를 rep로 가정.
- **제안 수정:** `brand_id + canonical_model + capacity` 그룹 키로 canonical_models를 JOIN해 min_price 조회.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 46–49 [lane:BACKEND]

---

### [M-166] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `compute_value_score()` — `weight_min=0` 또는 `value=0` 시 ZeroDivisionError

- **영역:** 백엔드 — 파이프라인 / 가성비 지표
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `m["price_min"] / m["specs"][metric_keys[0]]["value"]` 에서 `value`가 0이면 ZeroDivisionError. `eligible` 필터가 `value is not None`만 체크하고 0 체크가 없어 value=0인 모델 진입 시 스크립트 크래시.
- **원인:** `pipeline/value_metric.py` line 150 — 0 체크 누락.
- **제안 수정:** eligible 조건에 `and m["specs"][...]["value"] != 0` 추가 또는 try/except ZeroDivisionError.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 150 [lane:BACKEND]

---

### [M-167] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `rank_normalize()` — 모델 1개 카테고리에서 항상 ★5.0 반환

- **영역:** 백엔드 — 파이프라인 / 가성비 지표
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `total=0`(eligible 모델 1개)일 때 `result[orig_idx] = 1.0`으로 최고점을 반환한다. 비교 대상이 없는 단일 모델 카테고리에서 무조건 ★5.0이 표시되어 가성비 지표로서 의미를 잃는다.
- **원인:** `pipeline/value_metric.py` line 114 — `else 1.0` 폴백.
- **제안 수정:** `else None` 처리해 단일 모델 카테고리에서 가성비 별점 미표시.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 114 [lane:BACKEND]

---

### [M-168] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` — `not price_min` falsy 체크로 `price_min=0` 모델 eligible에서 제외

- **영역:** 백엔드 — 파이프라인 / 가성비 지표
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `if not m.get("price_min"): continue` 조건이 `price_min=0`을 None과 동일하게 처리해 0원 모델을 가성비 계산 대상에서 제외한다. `is None` 체크여야 의도에 맞다.
- **원인:** `pipeline/value_metric.py` line 139(dry_run) — falsy 체크 vs None 체크 혼용.
- **제안 수정:** `if m.get("price_min") is None: continue`
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 139 [lane:BACKEND]

---

### [M-169] ✅ 해결완료(2026-06-13, C15) — `star_catalog.py` — `price_observations` 쿼리에서 `pr=None` 체크 없이 `prods[pid]["price"]`에 삽입 → 별점 계산 TypeError

- **영역:** 백엔드 — 파이프라인 / 별점 계산
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `SELECT product_id, MIN(price_krw) FROM price_observations GROUP BY product_id`에서 `price_krw`가 전부 NULL인 그룹의 `MIN()`은 NULL을 반환한다. `pr=None`을 `prods[pid]["v"]["price"]`에 그대로 삽입하면 이후 min-max 계산에서 TypeError가 발생한다.
- **원인:** `pipeline/star_catalog.py` line 61–63 — `if pr is None: continue` 가드 없음.
- **제안 수정:** `if pr is None or pr <= 0: continue` 추가.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 61–63 [lane:BACKEND]

---

### [M-170] — `_savePushSub` — Supabase `upsert()` 에러 미처리 → 푸시 구독 저장 실패 무음 처리 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 푸시 알림 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `supabase.from("push_subscriptions").upsert(...)` 결과의 `error`를 확인하지 않아 저장 실패 시 사용자에게 아무 피드백 없이 푸시 구독이 등록되지 않는다.
- **원인:** `site/app.js` `_savePushSub` — `const { error } = await ...` destructuring 및 error 처리 없음.
- **제안 수정:** `const { error } = await supabase...upsert(...); if (error) console.warn("push sub save failed", error);`
- **파일:** [site/app.js](site/app.js) (_savePushSub) [lane:CORE]

---

### [M-171] — `openLogDetail` 댓글 삭제 — Supabase `update()` 에러 미처리 → 삭제 실패 시 목록 재로드로 삭제된 척 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 댓글 삭제 시 `await supabase...update({ deleted_at })` 결과를 검사하지 않고 바로 `loadComments()`를 호출한다. 삭제 실패 시 UI가 재로드되어 삭제된 척 보이지만 DB에는 댓글이 남아있다.
- **원인:** `site/app.js` `openLogDetail` 댓글 삭제 핸들러 — error 미확인.
- **파일:** [site/app.js](site/app.js) (openLogDetail 댓글 삭제) [lane:CORE]

---

### [M-172] ✅ 해결완료(2026-06-13) — `openLogModal` — posts INSERT 컬럼명 `content` 사용 — 실제 스키마가 `body`이면 로그 등록 전체 실패

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openLogModal()`의 posts INSERT에서 `{ title, content, tags, ... }` 객체를 사용하는데, 실제 posts 테이블 스키마 컬럼명이 `body`이면 PGRST 오류로 로그 작성이 전체 실패한다. M-154(select 불일치)와 동일 근본 원인 — INSERT/SELECT 컬럼명 모두 불일치 상태.
- **원인:** `site/app.js` `openLogModal` INSERT — `content` vs `body` 컬럼명 혼용.
- **파일:** [site/app.js](site/app.js) (openLogModal posts INSERT) [lane:CORE]

---

### [L-189] ✅ 해결완료(2026-06-13, C6) — `resolve_duplicates.py` `executemany` 후 `rowcount` 누적 — SQLite에서 항상 부정확

- **영역:** 백엔드 — 파이프라인 / 중복 해소
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `cur.executemany(...)` 후 `cur.rowcount`를 `total_demoted`에 누적하는데, SQLite의 `executemany` 후 `rowcount`는 -1 또는 마지막 단일 실행값을 반환한다. demoted 카운트 집계가 부정확하여 로그 출력이 신뢰 불가.
- **원인:** `pipeline/resolve_duplicates.py` line 82 — `executemany` rowcount SQLite 동작 특성.
- **제안 수정:** executemany 전후 `SELECT count(*)` 차이로 실제 변경 수 측정.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 82 [lane:BACKEND]

---

### [L-190] — `supabaseClient.js` `signOut()` — `sessionStorage` 폴백 데이터 미삭제

- **영역:** 프론트엔드 — 인증 (supabaseClient.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `signOut()`에서 `localStorage.removeItem("wish")` 등을 호출하지만, incognito 모드에서 `safeLocalStorage`가 `sessionStorage`로 폴백된 경우 해당 키가 삭제되지 않아 찜/세트 데이터가 로그아웃 후에도 잔류한다.
- **원인:** `site/supabaseClient.js` — `localStorage` 직접 호출로 `sessionStorage` 폴백 케이스 미처리.
- **제안 수정:** `removeItem`도 `safeLocalStorage.removeItem()` 래퍼 사용.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) (signOut) [lane:CORE]


---

## R-94 — 프론트/백엔드 종합 버그 탐색 4차 (2026-06-13)

### ✅ 해결완료(2026-06-13) [H-47] — `fill_whitelist_specs.py` `candidates()` — ACC_PAT 단어 SQL 직접 삽입 → SQL Injection 위험

- **영역:** 백엔드 — 파이프라인 / 스펙 수집
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `NOT LIKE '%{w}%'` 형태로 ACC_PAT 단어를 f-string으로 SQL에 직접 삽입한다. ACC_PAT 값에 `'`가 포함되면 쿼리 파싱 오류 발생. 파라미터 바인딩 없이 리터럴 삽입.
- **원인:** `pipeline/fill_whitelist_specs.py` line 111 — `%s` 포맷팅 대신 파라미터 바인딩 미사용.
- **제안 수정:** SQLite `?` 바인딩으로 변경.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 111 [lane:BACKEND]

---

### [M-173] — `saveSets` — `localStorage.setItem` try/catch 없음 → QuotaExceededError 시 세트 기능 전체 중단 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 빌더 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `saveSets()`에서 `localStorage.setItem`을 try/catch 없이 호출한다. 저장 공간 부족 시 `QuotaExceededError`가 uncaught exception으로 발생하여 이후 세트 관련 모든 동작이 중단된다. `setWish()`는 try/catch가 있는데 `saveSets()`만 누락.
- **원인:** `site/app.js` `saveSets` line 450 — 예외 처리 없음.
- **제안 수정:** `try { localStorage.setItem("sets", JSON.stringify(arr)); } catch(e) { console.warn("sets 저장 실패", e); }`
- **파일:** [site/app.js](site/app.js) line 450 [lane:CORE]

---

### [M-174] — `toggleWishWithHint` — `_gAuthReady` 확인 없이 `isLoggedIn()` 직접 호출 → 인증 초기화 중 false 반환으로 오게이팅 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 찜 / 인증 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `toggleWishWithHint()`는 `window._gAuthReady` 완료 여부를 확인하지 않고 `isLoggedIn()`을 바로 호출한다. auth 초기화 완료 전 찜 버튼 클릭 시 실제로는 로그인된 상태임에도 false를 반환해 로그인 게이트 모달이 오표시된다. `toggleWish()`는 `_gAuthReady` 분기를 처리하는데 `toggleWishWithHint()`만 누락.
- **원인:** `site/app.js` line 428–436 — `_gAuthReady` 가드 누락.
- **제안 수정:** `toggleWish()`와 동일하게 `_gAuthReady` Promise 완료 후 호출 패턴 적용.
- **파일:** [site/app.js](site/app.js) line 428–436 [lane:CORE]

---

### [M-175] — `openSetModal` 새 세트 만들기 — `addToSet()` 반환값 미검사 → cap 초과 시 "담겼어요" 오표시 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 빌더 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `newSet()` 직후 `addToSet(s.id, item)` 결과를 확인하지 않고 바로 `showSetConfirm()`을 호출한다. `addToSet()`이 `{ status:"cap" }`을 반환해 실제로 담기지 않은 경우에도 "담겼어요" 확인 카드가 잘못 표시된다.
- **원인:** `site/app.js` line 565–568 — `addToSet` 반환값 미검사.
- **제안 수정:** `const r = addToSet(s.id, item); if (r.status !== "ok") { /* 오류 처리 */ return; } showSetConfirm(...)`
- **파일:** [site/app.js](site/app.js) line 565–568 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-176] — `backfill_capacity.py` `main()` — `total=0`일 때 `have*100//total` ZeroDivisionError

- **영역:** 백엔드 — 파이프라인 / 용량 백필
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `have*100//total` 계산에서 DB가 비어있거나 대상 제품이 없을 때 `total=0`으로 ZeroDivisionError 발생. 스크립트 전체 크래시.
- **원인:** `pipeline/backfill_capacity.py` line 53 — `total=0` 가드 없음.
- **제안 수정:** `pct = (have*100//total) if total else 0`
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 53 [lane:BACKEND]

---

### [M-177] ✅ 해결완료(기존확인, C9) — `fill_whitelist_specs.py` `fill_one()` — `fn=None` 케이스 미처리 → KeyError

- **영역:** 백엔드 — 파이프라인 / 스펙 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `FN[fn](raw)` 호출 시 `fn`이 `None`이면 `FN[None]`으로 KeyError 발생. `specs_for()`가 `fn=None`을 반환하는 케이스를 `derive=="floor"` 분기만 처리하고 `fn is None` 경우를 누락.
- **원인:** `pipeline/fill_whitelist_specs.py` line 83 — `fn is None` early return 없음.
- **제안 수정:** `if fn is None: continue` 또는 `if fn not in FN: continue` 가드 추가.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 83 [lane:BACKEND]

---

### [M-178] ✅ 분석완료(무효, C16) — `brand_filter.py` `--apply` — 카테고리 필터 없는 `price_observations` 무효화로 타 카테고리 가격 관측치 의도치 않게 삭제

- **영역:** 백엔드 — 파이프라인 / 브랜드 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--apply` 실행 시 동일 서브쿼리를 두 번 실행해 `price_observations.valid=0` 처리하는데, WHERE 조건에 카테고리 필터가 `price_observations` 쪽에 없어 이전에 다른 카테고리에서 이미 `rejected`된 제품의 가격 관측치까지 무효화될 수 있다.
- **원인:** `pipeline/brand_filter.py` line 96, 99 — price_observations UPDATE 쿼리에 카테고리 범위 제한 없음.
- **파일:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 96–99 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-179] — `column_fixes.py` — DELETE 후 `commit()` 없이 INSERT 진행 → 중간 예외 시 플래그 유실

- **영역:** 백엔드 — 파이프라인 / 컬럼 수정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `DELETE FROM data_quality_flags WHERE note LIKE '[기준의심]%'` 실행 후 commit 없이 다음 INSERT로 진행한다. commit은 line 67에만 있어 INSERT 도중 예외 발생 시 DELETE만 적용된(플래그가 사라진) 상태로 롤백되지 않고 남을 수 있다.
- **원인:** `pipeline/column_fixes.py` line 27 — DELETE 직후 중간 commit 없음.
- **제안 수정:** DELETE 후 `con.commit()` 추가하거나 트랜잭션 단위 재설계.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 27 [lane:BACKEND]

---

### [L-191] ✅ 해결완료(기존확인, C38) — `download_images.py` — WHERE 절 `OR NOT EXISTS (SELECT 1 FROM (SELECT 1) ...)` 항상 참 → 이미지 있는 행도 재다운로드

- **영역:** 백엔드 — 파이프라인 / 이미지 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `OR NOT EXISTS (SELECT 1 FROM (SELECT 1) WHERE length(p.image_local)>0)` 의 `FROM (SELECT 1)` 서브쿼리는 항상 1행을 반환하므로, `image_local`이 이미 설정된 행도 재다운로드 대상에 포함될 수 있다. 의도는 `image_local IS NULL OR image_local=''`이었을 것으로 추정.
- **원인:** `pipeline/download_images.py` line 93–102 — 잘못된 NOT EXISTS 패턴.
- **제안 수정:** `WHERE p.image_local IS NULL OR p.image_local = ''`
- **파일:** [pipeline/download_images.py](pipeline/download_images.py) line 93–102 [lane:BACKEND]

---

### [L-192] ✅ 해결완료(2026-06-13, C27) — `collect_images.py` `collect()` — `tot=0` 시 `100*done/tot` ZeroDivisionError

- **영역:** 백엔드 — 파이프라인 / 이미지 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** verified 제품이 없을 때 `tot=0`이고 `round(100*done/tot)` 에서 ZeroDivisionError 발생.
- **원인:** `pipeline/collect_images.py` line 94 — `tot=0` 가드 없음.
- **제안 수정:** `pct = round(100*done/tot) if tot else 0`
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 94 [lane:BACKEND]

---

### [L-193] ✅ 해결완료(2026-06-13, C23) — `seed_coupang.py` CSV 읽기 — `encoding` 미지정 → 한글 브랜드명·모델명 깨짐

- **영역:** 백엔드 — 파이프라인 / 쿠팡 씨드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `open(csv_path, newline="")` 에 `encoding` 미지정으로 시스템 로캘에 따라 한글이 깨질 수 있다. Windows 환경에서 특히 위험(cp949 기본값).
- **원인:** `pipeline/seed_coupang.py` line 53–57, 59 — `encoding="utf-8"` 누락.
- **제안 수정:** `open(csv_path, newline="", encoding="utf-8")`
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 53 [lane:BACKEND]

---

### [L-194] — `search.html` — `#homeq` null 체크 없이 `addEventListener` 호출 → DOM 변경 시 TypeError

- **영역:** 프론트엔드 — 검색 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 인라인 스크립트에서 `document.getElementById("homeq")`에 null 체크 없이 `.addEventListener`를 호출한다. DOM 구조 변경으로 `#homeq`가 없어지면 `TypeError: Cannot read properties of null`.
- **원인:** `site/search.html` line 54 — null guard 누락.
- **제안 수정:** `const inp = document.getElementById("homeq"); if (inp) inp.addEventListener(...)`
- **파일:** [site/search.html](site/search.html) line 54 [lane:CORE]


---

## R-95 — 프론트/백엔드 종합 버그 탐색 5차 (2026-06-13)

### [H-48] ✅ 해결완료(2026-06-13, BACKEND) — `graph_full.py` `harvest_node()` — 수확 실패 시 `break`로 조용히 누락, 부분 커밋 + 오류 미전파
> 실패를 state `errors`에 적재(`{node:"harvest"}`) + 콘솔 ⚠ 출력 → report_node가 요약·표면화. 리포트의 `raise` 제안 대신 errors 전파 채택: raise는 normalize/enrich/rate까지 중단시켜 데이터 파이프라인엔 과함(해당 쿼리 후속페이지만 break, 타 쿼리 계속).

- **영역:** 백엔드 — 파이프라인 / 그래프 수확
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `harvest_node()`에서 `ingest` 실패 시 예외를 silently `break`하여 이미 적재된 부분 데이터는 커밋되고, 실패 이후 데이터는 조용히 누락된다. 오류가 로그/에러 상태로 전파되지 않아 데이터 손실을 사후에 감지할 수 없다.
- **원인:** `pipeline/graph_full.py` line 69 — 예외 catch 후 `break`만 하고 logging/reraise 없음.
- **제안 수정:** `except Exception as e: logging.error("harvest_node 실패: %s", e); raise` 로 변경.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 69 [lane:BACKEND]

---

### [M-180] ✅ 해결완료(2026-06-13) — `coupang_url` 프로토콜 미검증 — `window.open(url)` XSS 위험 (buyBtn + 세트 구매 버튼)

- **영역:** 프론트엔드 — 상품 상세 / 세트 빌더 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `buyBtn.onclick`(line 2043)과 세트 구매 버튼(line 3001)이 `window.open(url, "_blank")`에 `coupang_url`을 직접 전달한다. `esc()`는 HTML 특수문자만 이스케이프하므로 `javascript:alert(1)` 같은 프로토콜은 그대로 통과한다. 특히 세트 구매 버튼은 `localStorage`에서 파싱한 값을 사용하므로 클라이언트 조작이 더 쉽다.
- **원인:** `site/app.js` line 2043–2044, 3001–3003 — URL 프로토콜(`https:` 여부) 검증 없음.
- **제안 수정:** `if (!url.startsWith("https://")) return;` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 2043–2044, 3001–3003 [lane:CORE]

---

### [M-181] ✅ 해결완료(2026-06-13) — `openProduct` — `keydown` 리스너 중복 등록 → ESC 키 중복 처리 / `close()` 이중 호출

- **영역:** 프론트엔드 — 상품 상세 모달 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openProduct()` 호출 시마다 `document.addEventListener("keydown", onKey)`를 추가하지만 기존 리스너를 먼저 제거하지 않는다. 모달이 열린 상태에서 재호출되면 이전 `onKey`가 남아 ESC 키 입력 시 `close()`가 두 번 호출된다.
- **원인:** `site/app.js` line 2141 — `removeEventListener` 없이 `addEventListener` 추가.
- **제안 수정:** `document.removeEventListener("keydown", onKey)` 후 재등록, 또는 abort signal 패턴 사용.
- **파일:** [site/app.js](site/app.js) line 2141 [lane:CORE]

---

### [M-182] ✅ 해결완료(2026-06-14) — `wireReviews` 폼 submit — `removeUploadedImages()` `await` 누락 → Storage 롤백 미보장, orphan 파일 누적

- **영역:** 프론트엔드 — 리뷰 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 사진 업로드 실패(line 2367) 및 INSERT 실패(line 2379) 시 `removeUploadedImages()`를 `await` 없이 호출한다. Storage 정리가 완료되기 전에 함수가 리턴되어 orphan 파일이 Supabase Storage에 누적된다.
- **원인:** `site/app.js` line 2367, 2379 — async 함수 호출에 `await` 누락.
- **제안 수정:** `await removeUploadedImages(uploadedPaths)`
- **파일:** [site/app.js](site/app.js) line 2367, 2379 [lane:CORE]

- **처리:** wireReviews 폼 submit의 `removeUploadedImages()`에 `await` 추가 — Storage 롤백 보장. (2026-06-14)

---

### [M-183] ✅ 해결완료(2026-06-13, C17) — `multicat.py` `ingest_one()` — `fetchone()` None 반환 시 `[0]` 인덱스 TypeError

- **영역:** 백엔드 — 파이프라인 / 멀티카테고리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `INSERT OR IGNORE` 후 SELECT로 `bid`/`pid`를 조회하는데, 브랜드명 대소문자 차이나 조건 불일치로 `fetchone()`이 None을 반환하면 `fetchone()[0]`에서 TypeError 크래시. 해당 제품 스펙 전체 누락.
- **원인:** `pipeline/multicat.py` line 166–170 — `fetchone()` None 체크 없음.
- **제안 수정:** `row = cur.fetchone(); if not row: continue; bid = row[0]`
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 166–170 [lane:BACKEND]

---

### [M-184] ✅ 해결완료(2026-06-13, C7) — `graph_full.py` `normalize_node`/`validate_node` — `con.commit()` 없이 `con.close()` → 변경사항 롤백 위험

- **영역:** 백엔드 — 파이프라인 / 그래프 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `normalize_node()`와 `validate_node()`에서 `NM.normalize_db(con)`, `VR.validate_db(con)` 호출 후 `graph_full.py`에서 직접 `commit()`하지 않고 `con.close()`한다. 해당 함수들이 내부에서 commit하지 않으면 normalize/validate 변경사항이 롤백된다.
- **원인:** `pipeline/graph_full.py` line 76–79, 135–138 — close 전 명시적 commit 누락.
- **제안 수정:** `con.close()` 직전 `con.commit()` 추가.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 76–79, 135–138 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-185] — `graph_pipeline.py` `validate()` — `d["value"]`가 문자열일 때 부등호 비교 → TypeError

- **영역:** 백엔드 — 파이프라인 / 그래프 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `hard[0] <= d["value"] <= hard[1]` 비교에서 `d["value"]`가 파싱 실패로 문자열인 경우 TypeError 발생. `value_normalized`가 항상 float임을 보장하는 검사가 없다.
- **원인:** `pipeline/graph_pipeline.py` line 150 — 타입 검증 없이 숫자 비교.
- **제안 수정:** `if not isinstance(d["value"], (int, float)): continue` 가드 추가.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 150 [lane:BACKEND]

---

### [L-195] ✅ 해결완료(2026-06-13, C8) — `verify_internal.py` `write_queue()` — `CHECK_PRIORITY` 미등록 키 → KeyError

- **영역:** 백엔드 — 파이프라인 / 내부 검증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `CHECK_PRIORITY[check_key]`에서 등록되지 않은 검사 키가 들어오면 KeyError 발생. 향후 새 검사 추가 시 누락 위험.
- **원인:** `pipeline/verify_internal.py` line 221–222 — `.get(check_key, 99)` 미사용.
- **제안 수정:** `CHECK_PRIORITY.get(check_key, 99)`
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 221–222 [lane:BACKEND]

---

### [L-196] ✅ 해결완료(2026-06-13, C28) — `reclassify_other_tent.py` `bucket()` — 무게 None 시 경고 없이 `"auto"` 반환 → 백패킹 텐트 오분류

- **영역:** 백엔드 — 파이프라인 / 텐트 재분류
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `w`(무게)가 None이면 무조건 `"auto"`로 분류한다. 백패킹 텐트가 오토캠핑으로 잘못 배정될 수 있으나 경고 로그 없어 사후 감지 불가.
- **원인:** `pipeline/reclassify_other_tent.py` line 31–41 — None 경우 logging 없음.
- **제안 수정:** `logging.warning("무게 없음: pid=%s, auto로 분류", pid)` 추가.
- **파일:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 31–41 [lane:BACKEND]


---

## R-96 — 프론트/백엔드 종합 버그 탐색 6차 (2026-06-13)

### [M-186] ✅ 해결완료(2026-06-13) — `style.css` — `#spec-tip-bubble` z-index:9999가 `.pmodal`(z-index:50) 위에 떠 모달 오버레이 관통

- **영역:** 프론트엔드 — CSS / 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `#spec-tip-bubble`이 z-index:9999로 설정되어 있어, 상품 상세 모달(`.pmodal`, z-index:50)이 열린 상태에서도 버블이 오버레이를 뚫고 표시된다. 모달 뒤에 있는 인터랙션 요소가 버블로 인해 노출된다.
- **원인:** `site/style.css` line 154 — 버블 z-index가 모달보다 비정상적으로 높음.
- **제안 수정:** 모달 오픈 시 `#spec-tip-bubble` 숨김 처리 또는 z-index 체계 정비.
- **파일:** [site/style.css](site/style.css) line 154 [lane:CORE]

---

### [M-187] ✅ 해결완료(2026-06-13) — `style.css` — 포커스 시 `outline:none`만 지정, 고대비 모드에서 포커스 표시 완전 소실 (WCAG 2.4.7 위반)

- **영역:** 프론트엔드 — CSS / 접근성
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 홈 검색 input의 `:focus`에서 `outline:none`만 지정하고 `border-color`로 대체한다. Windows 고대비 모드(forced-colors)에서는 커스텀 border 색상이 무시되어 포커스 표시가 완전히 사라진다. WCAG 2.1 SC 2.4.7 위반.
- **원인:** `site/style.css` line 286 — `outline:none` 후 forced-colors 대응 없음.
- **제안 수정:** `:focus-visible { outline: 2px solid var(--accent); }` 추가 또는 `@media (forced-colors: active)` 블록에서 outline 복원.
- **파일:** [site/style.css](site/style.css) line 286 [lane:CORE]

---

### [M-188] ⏸ 보류(COMMUNITY_ENABLED=false) — 낙관적 UI 업데이트 후 RPC 결과 미확인 → 실패 시 UI·DB 불일치

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 좋아요 클릭 시 UI를 먼저 업데이트하고 `supabase.rpc()` 반환값을 무시한다. RPC 실패(rate limit, 네트워크 오류) 시 UI는 변경된 채로 남아 DB와 불일치한다. 피드와 상세 모달 두 곳(line 3735, 3742, 3807, 3813) 모두 동일 패턴.
- **원인:** `site/app.js` `toggleLike` — `await rpc()` 결과 destructuring 없음.
- **제안 수정:** RPC 실패 시 낙관적 업데이트 롤백 처리 추가.
- **파일:** [site/app.js](site/app.js) line 3735, 3742, 3807, 3813 [lane:CORE]

---

### [M-189] ⏸ 보류(COMMUNITY_ENABLED=false) — 빠른 연속 클릭 시 `wasLiked` 플래그 오염 → increment/decrement RPC 교차 호출로 카운트 오염

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 좋아요 버튼에 디바운스나 비활성화 처리가 없다. 빠른 연속 클릭 시 낙관적으로 뒤집힌 DOM 값을 `wasLiked`로 읽어 increment/decrement RPC가 교차 호출되어 DB 카운트가 오염된다.
- **원인:** `site/app.js` line 3721 — 클릭 핸들러에 debounce/disabled 처리 없음.
- **제안 수정:** 클릭 즉시 버튼 `disabled = true` → RPC 완료 후 `disabled = false`.
- **파일:** [site/app.js](site/app.js) line 3721 [lane:CORE]

---

### [M-190] ✅ 해결완료(2026-06-13) — `loadRemoteGearSets` — 에러 시 `console.error` 없이 `null` 반환 → 에러 원인 추적 불가

- **영역:** 프론트엔드 — 인증/세트 (supabaseClient.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 에러 발생 시 `return null`만 하고 `console.error` 로깅이 없다. 다른 함수들(`loadRemoteWishlist`, `getProfile`)은 `console.error(name, error)` 후 반환하는데 이 함수만 누락.
- **원인:** `site/supabaseClient.js` line 312 — 에러 로깅 누락.
- **제안 수정:** `console.error("loadRemoteGearSets", error); return null;`
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 312 [lane:CORE]

---

### [M-191] ⏸ 보류(maskable 아이콘 에셋 생성 필요) — 192px maskable 아이콘 없음 → Android 런처에서 safe-zone 없이 크롭

- **영역:** 프론트엔드 — PWA
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** maskable 아이콘이 512px 하나뿐이고 192px maskable 버전이 없다. Android PWA 설치 시 192px maskable 아이콘을 우선 사용하므로, 192px은 `purpose:"any"`만 제공되어 일부 런처에서 safe-zone 없이 크롭된다.
- **원인:** `site/manifest.webmanifest` line 14–17 — 192px maskable 아이콘 미등록.
- **제안 수정:** `icon-192-maskable.png` 생성 후 manifest에 추가.
- **파일:** [site/manifest.webmanifest](site/manifest.webmanifest) [lane:CORE]

---

### [M-192] ✅ 해결완료(기존확인, C4) — `normalize.py` `parse_lumens()` — 단위 없는 숫자 문자열에서 루멘 오탐

- **영역:** 백엔드 — 파이프라인 / 스펙 파싱
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `parse_lumens()`의 정규식이 단위(`lm|루멘|lumen`)를 선택적(`?`)으로 처리하여, 단위 없이 숫자만 있는 raw 값(예: 무게 "400"이 잘못 전달된 경우)에서도 루멘으로 파싱한다. 잘못된 루멘 값이 DB에 삽입될 수 있다.
- **원인:** `pipeline/normalize.py` line 117 — 단위 패턴이 optional.
- **제안 수정:** 단위 필수 매칭으로 변경 또는 단위 없는 경우 None 반환.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 117 [lane:BACKEND]

---

### [L-197] — `renderRecommend` — `m.specs.floor_area` undefined 시 `.badge` 접근 → TypeError

- **영역:** 프론트엔드 — 추천 페이지 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `filter: m => m.specs.floor_area.badge !== "외형기준"` 형태의 filter 함수에서 `m.specs.floor_area`가 undefined인 모델이 있으면 TypeError 발생. `m.specs[pick.metric]` null 가드가 filter 실행보다 먼저 처리되지 않는 경로 존재.
- **원인:** `site/app.js` `renderRecommend` — `m.specs?.floor_area?.badge` 옵셔널 체이닝 미사용.
- **제안 수정:** `m.specs?.floor_area?.badge !== "외형기준"` 로 변경.
- **파일:** [site/app.js](site/app.js) (renderRecommend filter) [lane:CORE]

---

### [L-198] — `deleteRemoteGearSet` — fire-and-forget 패턴 → 원격 삭제 실패 시 사용자 피드백 없음

- **영역:** 프론트엔드 — 세트 빌더 (supabaseClient.js / account.html)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `deleteRemoteGearSet()`이 raw Promise를 반환하고 `account.html`에서 `await` 없이 fire-and-forget으로 호출한다. 원격 삭제 실패 시 사용자에게 오류 표시 없이 로컬 삭제만 진행되어 원격 세트가 남는다.
- **원인:** `site/supabaseClient.js` line 332–334, `site/account.html` line 608 — await 및 에러 처리 누락.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 332–334 [lane:CORE]


---

## R-97 — 프론트/백엔드 종합 버그 탐색 7차 (2026-06-13)

### [H-49] ✅ 해결완료(2026-06-13) — `openFromSearch` — STATE 즉시 복원으로 비동기 후속 로직이 잘못된 slug 참조

- **영역:** 프론트엔드 — 검색 / 상품 모달 (app.js)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `openFromSearch()`에서 `STATE.slug/STATE.data`를 임시 교체 후 `openProduct(prod)` 직후 즉시 원복한다. `openProduct` 반환 후에 실행되는 비동기 로직(리뷰 등록 slug, 공유 URL, 클릭 이벤트 slug)이 모두 잘못된 카테고리 slug로 기록된다.
- **원인:** `site/app.js` line 1131–1134 — `openProduct` 반환 즉시 STATE 복원, 비동기 후속 참조 미고려.
- **제안 수정:** 모달 닫힘 이후 STATE를 복원하거나, openProduct에 slug를 파라미터로 전달.
- **파일:** [site/app.js](site/app.js) line 1131–1134 [lane:CORE]

---

### [H-50] ✅ 해결완료(2026-06-13) — `openFromSearch` — `catData.items` 오참조 (`catData.models` 가 정확) → 인라인 모달 절대 미동작

- **영역:** 프론트엔드 — 검색 / 상품 모달 (app.js)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `(catData.items || []).find(...)` 에서 카테고리 JSON의 제품 배열 키가 `models`인데 `items`로 잘못 참조한다. `catData.items`는 항상 `undefined`이므로 `prod`가 항상 `undefined`가 되어 검색 결과 클릭 시 인라인 모달이 절대 뜨지 않고 항상 `category.html?cat=...`으로 페이지 이동한다.
- **원인:** `site/app.js` line 1129 — `catData.items` → `catData.models` 오타.
- **제안 수정:** `catData.items` → `catData.models`
- **파일:** [site/app.js](site/app.js) line 1129 [lane:CORE]

---

### [H-51] ✅ 해결완료(2026-06-13) — `beforeinstallprompt` — `prompt()` 재호출 시 `InvalidStateError`, `_pwaPrompt` 미초기화

- **영역:** 프론트엔드 — PWA 설치 (app.js)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 설치 버튼 클릭 후 `_pwaPrompt.prompt()` 호출하는 동안 배너를 다시 클릭하면 이미 소진된 `prompt` 객체를 재호출해 `InvalidStateError` 발생. `BeforeInstallPromptEvent.prompt()`는 한 번만 호출 가능하며, 호출 후 `_pwaPrompt = null` 초기화 없음.
- **원인:** `site/app.js` line 47–51 — prompt 호출 후 null 초기화 및 appinstalled 이벤트 처리 누락.
- **제안 수정:** `_pwaPrompt.prompt()` 호출 직후 `_pwaPrompt = null; hideBanner();` 처리.
- **파일:** [site/app.js](site/app.js) line 47–51 [lane:CORE]

---

### [M-193] ✅ 해결완료(2026-06-13) — `openLogDetail` — 재오픈 시 `keydown` onKey 리스너 누적 → ESC 중복 처리

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openLogDetail()`이 `log-detail-modal` 엘리먼트를 재사용하면서 `document.addEventListener("keydown", onKey)`를 매번 추가하지만 이전 리스너를 제거하지 않는다. 다른 로그를 연속으로 클릭하면 ESC 키 입력 시 `close()`가 누적된 횟수만큼 호출된다.
- **원인:** `site/app.js` line 3817–3818 — `removeEventListener` 없이 `addEventListener` 추가.
- **파일:** [site/app.js](site/app.js) line 3817–3818 [lane:CORE]

---

### [M-194] ⏸ 보류(COMMUNITY_ENABLED=false) — `alert()` 사용 → PWA 모드 블로킹 UI

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 댓글 작성 시 미로그인이면 `alert("로그인 후 댓글을 작성할 수 있어요.")` 를 사용한다. 앱 전체가 `showToast()`를 사용하는 것과 불일치하며 iOS Safari PWA 모드에서 블로킹 UI가 발생한다.
- **원인:** `site/app.js` line 3867 — `showToast()` 대신 `alert()` 사용.
- **제안 수정:** `showToast("로그인 후 댓글을 작성할 수 있어요.")` 로 교체.
- **파일:** [site/app.js](site/app.js) line 3867 [lane:CORE]

---

### [M-195] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` — `models` 빈 리스트 시 `min(caps)` / `max(caps)` `ValueError`

- **영역:** 백엔드 — 파이프라인 / 백패킹 가방 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 필터 후 `models`가 0개이면 `min(caps)` / `max(caps)` 에서 `ValueError: min() arg is an empty sequence` 발생.
- **원인:** `pipeline/build_backpacking_bag.py` line 167 — 빈 리스트 가드 없음.
- **제안 수정:** `if not models: print("결과 없음"); return`
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 167 [lane:BACKEND]

---

### [M-196] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` — `manifest.json` 쓰기 중 예외 시 파일 손상

- **영역:** 백엔드 — 파이프라인 / 백패킹 가방 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `json.dump(man, open(mpath, "w"), ...)` — context manager 없이 쓰기. 직렬화 도중 예외 발생 시 파일이 빈 채로 닫혀 `manifest.json`이 손상된다.
- **원인:** `pipeline/build_backpacking_bag.py` line 228 — `with open(...)` 미사용.
- **제안 수정:** `with open(mpath, "w", encoding="utf-8") as f: json.dump(man, f, ...)`
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 228 [lane:BACKEND]

---

### [M-197] ✅ 해결완료(기존확인, C18) — `add_manual_models.py` — `prices` 빈 리스트 시 `min([])` `ValueError`

- **영역:** 백엔드 — 파이프라인 / 수동 모델 추가
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `m["prices"]`가 빈 리스트이면 `min([])` / `max([])` 에서 `ValueError`. JSON에 `"prices": []` 항목이 들어오면 크래시.
- **원인:** `pipeline/add_manual_models.py` line 70 — 빈 리스트 가드 없음.
- **제안 수정:** `if not prices: raise ValueError(f"prices 비어있음: {m['model']}")`
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 70 [lane:BACKEND]

---

### [L-199] ✅ 검토완료·현행유지(2026-06-14, N·코드 실대조) — _font가 macOS→Linux nanum/dejavu→PIL기본 순차 폴백(H-140/M-568, make_logo.py:16-24). Linux CI 크래시 없음. — `make_logo.py` — 폰트 경로 macOS 하드코딩 → Linux CI 환경 `OSError`

- **영역:** 백엔드 — 파이프라인 / 로고 생성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `/System/Library/Fonts/AppleSDGothicNeo.ttc` 경로가 하드코딩되어 Linux CI/배포 환경에서 `OSError`로 크래시.
- **원인:** `pipeline/make_logo.py` line 96 — 플랫폼별 폰트 경로 분기 없음.
- **제안 수정:** `if sys.platform == "darwin"` 분기 후 fallback 폰트 지정.
- **파일:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 [lane:BACKEND]

---

### [L-200] ✅ 검토완료·현행유지(2026-06-14, N·코드 실대조) — store-assets 저장 전 os.makedirs(exist_ok=True)(H-140, make_logo.py:153). — `make_logo.py` — `store-assets/` 디렉터리 없을 시 `FileNotFoundError`

- **영역:** 백엔드 — 파이프라인 / 로고 생성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** iOS 아이콘 저장 경로 `store-assets/` 디렉터리가 없으면 `FileNotFoundError`.
- **원인:** `pipeline/make_logo.py` line 139 — `os.makedirs(..., exist_ok=True)` 미호출.
- **제안 수정:** 저장 전 `os.makedirs(os.path.dirname(ios_path), exist_ok=True)` 추가.
- **파일:** [pipeline/make_logo.py](pipeline/make_logo.py) line 139 [lane:BACKEND]


---

## R-98 — 프론트/백엔드 종합 버그 탐색 8차 (2026-06-13)

### ✅ 해결완료(2026-06-13) [H-52] — `export_site.py` `export()` — canonical_models JOIN 버그로 price_min/max 잘못된 행 반환 가능

- **영역:** 백엔드 — 파이프라인 / 사이트 빌드
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `canonical_models cm JOIN products p ON p.id=?` 패턴에서 ON 절의 조건이 잘못 작성되어 capacity별로 분리되어야 할 canonical 행이 아닌 첫 번째 canonical_models 행이 반환될 수 있다. 결과적으로 `price_min/max`가 엉뚱한 capacity 그룹 값으로 채워진다.
- **원인:** `pipeline/export_site.py` line 100–103 — JOIN ON 조건 오작성.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 100–103 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-53] — `crosssource.py` `upsert()` — `overwrite=False` 경로에서도 `valid=0` 구 데이터 무조건 삭제

- **영역:** 백엔드 — 파이프라인 / 크로스소스
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `upsert()` 내부에서 `confirm=True` 오버라이트 여부와 관계없이 `DELETE ... valid=0` 쿼리가 실행된다. `overwrite=False` + `has=None`(신규) 경우에도 구 `valid=0` 데이터가 삭제되어 히스토리/이력이 유실된다.
- **원인:** `pipeline/crosssource.py` line 150–152 — 조건 분기 없이 두 번째 DELETE 무조건 실행.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 150–152 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-54] — `crosssource.py` `main()` — 트랜잭션 롤백 없음 → 부분 적재 후 오염된 상태 커밋

- **영역:** 백엔드 — 파이프라인 / 크로스소스
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `upsert` 중 DB 오류 발생 시 `con.commit()` 없이 부분 적재 상태가 메모리에 남고, `recompute_ratings` 실패 후 두 번째 `commit()`에서 오염된 상태가 커밋된다. try/except + rollback 없음.
- **원인:** `pipeline/crosssource.py` line 185–188 — 에러 시 `con.rollback()` 누락.
- **제안 수정:** `try/except` 블록으로 감싸고 예외 시 `con.rollback(); raise` 처리.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 185–188 [lane:BACKEND]

---

### [M-198] ✅ 해결완료(2026-06-13) — `serializeState` — category.html 외 페이지에서 호출 시 URL을 `category.html`로 덮어씀

- **영역:** 프론트엔드 — 카테고리 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `serializeState()`에서 `location.pathname`이 `category.html`로 끝나지 않으면 `"category.html"`을 상대경로로 `replaceState`해 현재 페이지 URL을 덮어쓴다. 아이템 페이지 등 다른 경로에서 잘못 호출되면 URL이 엉뚱하게 바뀐다.
- **원인:** `site/app.js` line 1254 — 페이지 체크 없이 무조건 `replaceState`.
- **제안 수정:** `if (!location.pathname.endsWith("category.html")) return;` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 1254 [lane:CORE]

---

### [M-199] — `buildFilters` — "경량 우선" 프리셋 토글 시 사용자의 브랜드 필터 의도치 않게 초기화 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 카테고리 필터 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "경량 우선" 프리셋 활성 후 재클릭(off) 시 `clearPresetFilters()`가 `STATE.brands`, `STATE.campStyle`까지 초기화한다. 브랜드 필터를 켠 상태에서 프리셋을 토글하면 브랜드 필터가 의도치 않게 삭제된다.
- **원인:** `site/app.js` line 1653–1671 — `clearPresetFilters()`가 프리셋 무관한 필터까지 리셋.
- **파일:** [site/app.js](site/app.js) line 1653–1671 [lane:CORE]

---

### [M-200] ✅ 해결완료(기존확인, C3) — `export_site.py` — `bool(star)` 에서 `star=None` 시 `False`로 무음 처리 → ★ 지표 오분류

- **영역:** 백엔드 — 파이프라인 / 사이트 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `bool(star)` 에서 DB 결과가 `None`이면 `False`로 처리되어 별점 지표가 있는 모델이 ★ 없음으로 잘못 분류된다. None 체크 없음.
- **원인:** `pipeline/export_site.py` line 67 — `star is not None and bool(star)` 체크 필요.
- **제안 수정:** `bool(star) if star is not None else False`
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 67 [lane:BACKEND]

---

### [M-201] ✅ 해결완료(기존확인, C11) — `crosssource.py` `upsert()` — `raw_unit="norm"` 하드코딩으로 단위 메타 정보 손실

- **영역:** 백엔드 — 파이프라인 / 크로스소스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `INSERT` 시 `raw_unit="norm"` 고정으로 적재하여 floor_m2(㎡), weight(kg), water_head(mm) 등 다른 단위가 모두 "norm"으로 기록된다. downstream에서 단위를 역추적 불가.
- **원인:** `pipeline/crosssource.py` line 155 — 단위 동적 지정 없음.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 155 [lane:BACKEND]

---

### [L-201] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — M-117이 SIGNED_IN 시 my-logs-list dataset.loaded/logLoginShown 삭제(account.html:652-654). 기수정. — `renderAccount` 로그 섹션 — `dataset.loaded` 재로그인 후 미갱신으로 구 데이터 표시

- **영역:** 프론트엔드 — account.html 로그 섹션 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `myLogsList.dataset.loaded`를 한 번 세팅하면 로그아웃 → 재로그인해도 로그 목록을 다시 불러오지 않는다. 다른 사용자가 같은 기기에서 로그인하면 이전 사용자의 로그가 표시될 수 있다.
- **원인:** `site/app.js` line 3090 — 로그아웃 시 `dataset.loaded` 초기화 없음.
- **파일:** [site/app.js](site/app.js) line 3090 [lane:CORE]

---

### [L-202] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — 인원 칩 핸들러(app.js:1857-58)가 draw() 호출, draw()가 serializeState()로 URL 반영(2794). 오탐. — `buildFilters` 인원 칩 — `serializeState()` 미호출로 인원 필터 URL 미반영

- **영역:** 프론트엔드 — 카테고리 필터 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 인원 칩 클릭 시 `draw()`만 호출하고 `serializeState()`를 호출하지 않아 URL에 인원 필터가 반영되지 않는다. 새로고침·공유 시 인원 필터가 복원되지 않는다.
- **원인:** `site/app.js` line 1748 — 인원 칩 핸들러에 `serializeState()` 누락.
- **파일:** [site/app.js](site/app.js) line 1748 [lane:CORE]

---

### [L-203] — `view-set importSet` — 로그인 상태와 무관하게 버튼 레이블 "로그인 필요" 고정

- **영역:** 프론트엔드 — 세트 공유 / 가져오기 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** "내 세트에 추가" 버튼 레이블이 항상 "로그인 필요"로 고정되어 이미 로그인한 사용자에게도 동일한 텍스트가 표시된다.
- **원인:** `site/app.js` line 4119 — 로그인 상태 체크 및 버튼 문구 분기 없음.
- **파일:** [site/app.js](site/app.js) line 4119 [lane:CORE]


---

## R-99 — 프론트/백엔드 종합 버그 탐색 9차 (2026-06-13)

### ✅ 해결완료(2026-06-13) [H-55] — `scan_secrets.py` — `git ls-files` subprocess 실패 시 `CalledProcessError` 미처리 → CI 게이트 비정상 종료

- **영역:** 백엔드 — 파이프라인 / 시크릿 스캔
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `subprocess.check_output(["git","ls-files"], ...)` 실패 시 `CalledProcessError`가 `main()`으로 전파되어 catch 없이 크래시. CI 게이트 스크립트이므로 traceback만 출력되고 exit code가 불명확하게 종료될 수 있어 시크릿 스캔을 통과한 것처럼 보일 수 있다.
- **원인:** `pipeline/scan_secrets.py` line 45 — subprocess 에러 처리 없음.
- **제안 수정:** `try/except subprocess.CalledProcessError as e: sys.exit(f"git 오류: {e}")` 추가.
- **파일:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 45 [lane:BACKEND]

---

### [M-202] ✅ 해결완료(2026-06-13) — `openFromSearch` / 찜카드 `go()` — ESC 닫기 시 `restore()` 미호출 → STATE.slug 미복원

- **영역:** 프론트엔드 — 검색 / 찜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openFromSearch`와 찜카드 `go()`에서 STATE를 임시 변경 후 `restore()`를 xbtn.onclick과 modal.onclick에만 주입한다. `openProduct` 내부의 `onKey → close()` 경로(ESC 키)는 `restore()`를 거치지 않으므로 ESC로 닫으면 `STATE.slug`가 복원되지 않아 이후 찜 버튼·세트 담기가 잘못된 slug로 기록된다.
- **원인:** `site/app.js` line 1140–1144, 3286–3290 — ESC 경로에 `restore()` 미주입.
- **제안 수정:** `onKey`의 close 호출 전 `restore()` 실행 또는 close 콜백에 restore 통합.
- **파일:** [site/app.js](site/app.js) line 1140–1144 [lane:CORE]

---

### [M-203] ✅ 해결완료(2026-06-13) — `openLogModal` — ESC 키 닫기 없음 → 접근성 불일치

- **영역:** 프론트엔드 — 커뮤니티/소셜 로그 작성 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openLogModal()`은 ESC 키 `keydown` 리스너가 없다. 다른 모달(openProduct, openSetModal, openSetDetail 등)은 모두 ESC 닫기를 지원하는데 이 모달만 누락되어 접근성 불일치 및 사용성 버그.
- **원인:** `site/app.js` — `openLogModal` 내 `document.addEventListener("keydown", ...)` 없음.
- **파일:** [site/app.js](site/app.js) (openLogModal) [lane:CORE]

---

### [M-204] — `ensureIdx()` — fetch 실패 시 `idx=[]` 캐시 → 재시도 불가, 검색 영구 비동작 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 홈 검색 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `ensureIdx()`에서 fetch 실패 시 `.catch(() => (idx = []))` 후 `idxLoading`에 resolved Promise가 캐시된다. 이후 사용자가 검색창을 다시 클릭해도 `idx=[]`(빈 배열)로 캐시되어 재시도가 불가능하다. 일시적 네트워크 오류로 인덱스 로드 실패 시 페이지 새로고침 없이는 검색을 복구할 수 없다.
- **원인:** `site/app.js` line 909–912 — 실패 시 `idxLoading = null` 초기화 없음.
- **제안 수정:** `.catch(e => { idx = []; idxLoading = null; })` 로 변경해 재시도 허용.
- **파일:** [site/app.js](site/app.js) line 909–912 [lane:CORE]

---

### [M-205] ✅ 해결완료(2026-06-13, C35) — `pipeline.py` `build_db()` — DB 삭제 후 `schema.sql`/`whitelist.csv` 부재 시 복구 불가 크래시

- **영역:** 백엔드 — 파이프라인 / DB 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `build_db()`에서 기존 DB를 `os.remove()`로 삭제한 뒤 `schema.sql`, `reference.sql`, `whitelist.csv`를 `open()`으로 읽는데 파일 존재 여부를 사전 확인하지 않는다. 파일 부재 시 DB가 이미 삭제된 상태에서 `FileNotFoundError`로 크래시되어 빈 DB만 남는다.
- **원인:** `pipeline/pipeline.py` line 58–59, 319 — 파일 존재 체크 없이 `os.remove()` 후 `open()`.
- **제안 수정:** DB 삭제 전 필수 파일들 존재 확인 또는 실패 시 백업 DB 복원 로직.
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 58–59, 319 [lane:BACKEND]

---

### [M-206] ✅ 해결완료(2026-06-13, C29) — `refresh.py` `_group_prices_by_cat()` — 그룹 경계에서 첫 항목이 이전 그룹 bucket에 append 후 초기화 → 중앙값 오계산

- **영역:** 백엔드 — 파이프라인 / 가격 갱신
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `cur_cid, _ = cid, bucket.append(price)` 구문에서 `bucket.append(price)`가 먼저 실행된 후 `bucket = []`로 초기화된다. 카테고리 경계에서 새 카테고리의 첫 번째 price가 이전 그룹 bucket에 들어간 뒤 bucket이 리셋되므로, 이전 카테고리 중앙값 계산에 잘못된 가격이 포함된다.
- **원인:** `pipeline/refresh.py` line 81 — Python tuple 평가 순서로 인한 의도치 않은 선 append.
- **제안 수정:** 그룹 전환 시 `yield cur_cid, bucket` 후 `bucket = [price]`로 명시적 분리.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 79–82 [lane:BACKEND]

---

### [M-207] ✅ 해결완료(2026-06-13, C29) — `refresh.py` `main()` — SQLite `datetime('now')` 소수점 초 포함 시 `strptime` 파싱 실패

- **영역:** 백엔드 — 파이프라인 / 가격 갱신
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `datetime.strptime(con.execute("SELECT datetime('now')").fetchone()[0], DTFMT)` 에서 SQLite `datetime('now')`가 소수점 초(`.123456`)를 포함할 수 있는데 `DTFMT = "%Y-%m-%d %H:%M:%S"` 패턴은 소수점 초를 처리하지 못해 `ValueError` 발생.
- **원인:** `pipeline/refresh.py` line 127 — `DTFMT`에 `%f` 미포함.
- **제안 수정:** `.split(".")[0]` 로 소수점 제거 후 파싱 또는 `DTFMT = "%Y-%m-%d %H:%M:%S"` + `[:19]` 슬라이싱.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 127 [lane:BACKEND]

---

### [L-204] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — 칩 제거 핸들러(2007)가 draw()→serializeState() 호출. 오탐. — `renderActiveFilters` — 개별 필터 칩 제거 시 `serializeState()` 미호출 → URL 미갱신

- **영역:** 프론트엔드 — 카테고리 필터 칩 (app.js)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 활성 필터 칩 클릭(개별 제거) 시 `syncFilterUI()` → `draw()` 호출하지만 `serializeState()`를 호출하지 않는다. 브랜드 칩을 제거해도 URL `?brands=` 파라미터가 남아 새로고침·뒤로가기 시 제거한 필터가 재적용된다.
- **원인:** `site/app.js` line 1886 — 칩 제거 핸들러에 `serializeState()` 누락.
- **파일:** [site/app.js](site/app.js) line 1886 [lane:CORE]

---

### [L-205] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` — `--dry-run` `default=True` + `action="store_true"` 조합 → 항상 dry-run 고착

- **영역:** 백엔드 — 파이프라인 / 가성비 지표
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `argparse`에서 `action="store_true"` + `default=True` 조합 시 플래그를 전달해도 이미 True이므로 `--no-dry-run` 없이는 실제 쓰기 모드로 전환 불가. 향후 write 경로 추가 시 항상 dry-run만 실행될 위험.
- **원인:** `pipeline/value_metric.py` line 282 — default=True 부적절.
- **제안 수정:** `default=False` 로 변경 또는 `action="store_false"` + `dest="dry_run"` 패턴 사용.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 282 [lane:BACKEND]


---

## R-100 — 프론트/백엔드 종합 버그 탐색 10차 (2026-06-13)

### [H-56] ✅ 해결완료(2026-06-13) — `openLogModal` `form.onsubmit` — `{ content }` 단축 표기로 DB `body` 컬럼 항상 null → 로그 본문 미저장

- **영역:** 프론트엔드 — 커뮤니티/소셜 로그 작성 (app.js)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `posts` INSERT 시 `{ title, content, tags, ... }` 단축 표기를 사용하는데, 실제 DB 컬럼명이 `body`이면 `content` 키는 무시되고 `body` 컬럼이 항상 `null`로 저장된다. 로그를 작성해도 본문이 저장되지 않는다. M-172(INSERT 컬럼 불일치)와 동일 근본 원인이나 경로가 다름.
- **원인:** `site/app.js` line 4051 — `content` 변수명과 DB 컬럼명 `body` 불일치.
- **파일:** [site/app.js](site/app.js) line 4051 [lane:CORE]

---

### [M-208] ✅ 해결완료(2026-06-13) — `showToast` isHtml 모드 — `pointerEvents="auto"` 복구 없음 → 숨겨진 토스트가 클릭 이벤트 가로채기

- **영역:** 프론트엔드 — 공통 UI (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `isHtml=true` 토스트에 `style.pointerEvents="auto"` 설정 후 `_tid` 타임아웃에서 opacity만 0으로 만들고 `pointerEvents`를 복구하지 않아, 사라진(투명한) 토스트가 계속 클릭 이벤트를 가로챈다.
- **원인:** `site/app.js` line 469 — 타임아웃 핸들러에 `pointerEvents=""` 복구 누락.
- **제안 수정:** 타임아웃 콜백 내 `t.style.pointerEvents = ""` 추가.
- **파일:** [site/app.js](site/app.js) line 469 [lane:CORE]

---

### [M-209] ✅ 해결완료(2026-06-13) — `sitemap-items.xml` — `sitemap.xml`·`robots.txt` 미연결 → 아이템 2,927개 크롤 불가

- **영역:** 프론트엔드 — SEO / 사이트맵
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `sitemap-items.xml`(아이템 URL 2,927개 포함)이 `sitemap.xml`의 `<sitemapindex>`에도, `robots.txt`의 `Sitemap:` 지시자에도 등록되어 있지 않다. 검색엔진이 해당 파일을 발견하지 못해 개별 아이템 페이지 전체가 인덱싱되지 않는다.
- **원인:** `site/sitemap.xml`, `site/robots.txt` — sitemap-items.xml 참조 누락.
- **제안 수정:** `robots.txt`에 `Sitemap: https://gear-forest.com/sitemap-items.xml` 추가.
- **파일:** [site/sitemap.xml](site/sitemap.xml), [site/robots.txt](site/robots.txt) [lane:CORE]

---

### [M-210] ✅ 해결완료(2026-06-13, C12) — `promote_catalog.py` 출력 포맷 — `weight_g`/`water_mm`/`floor_m2` None 시 `:.0f` TypeError

- **영역:** 백엔드 — 파이프라인 / 카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `print(f"... {w:.0f}g | {wh:.0f}mm | ...")` 에서 LEFT JOIN으로 가져온 `weight_g`, `water_mm`, `floor_m2`가 `None`이면 `:.0f` 포맷 적용 시 `TypeError` 크래시.
- **원인:** `pipeline/promote_catalog.py` line 81 — None 방어 없이 포맷 적용.
- **제안 수정:** `w or 0`, `wh or 0` 등 None-safe 처리.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 81 [lane:BACKEND]

---

### [M-211] ✅ 해결완료(2026-06-13) — `openLogDetail` async IIFE — `.catch()` 없음 → 댓글 로드 실패 시 UnhandledPromiseRejection

- **영역:** 프론트엔드 — 커뮤니티/소셜 (app.js)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `(async () => { ... })()` IIFE에 `.catch()` 없음. Supabase import 실패 또는 `loadComments()` 내 예외 발생 시 UnhandledPromiseRejection으로 콘솔에만 오류가 남고 사용자에게 피드백 없음.
- **원인:** `site/app.js` line 3840 — async IIFE `.catch()` 누락.
- **제안 수정:** `(async () => { ... })().catch(e => showToast("댓글을 불러올 수 없어요"))`
- **파일:** [site/app.js](site/app.js) line 3840 [lane:CORE]

---

### [L-206] ✅ 해결완료(2026-06-13) — `sitemap.xml` — `community.html` 비활성 페이지 priority 0.9로 등재

- **영역:** 프론트엔드 — SEO / 사이트맵
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `COMMUNITY_ENABLED=false`로 비활성화된 `community.html`이 `sitemap.xml`에 `priority=0.9`로 등재되어 있다. Googlebot이 크롤링하면 동작하지 않는 페이지가 인덱싱된다.
- **파일:** [site/sitemap.xml](site/sitemap.xml) [lane:CORE]

---

### [L-207] — `item HTML` JSON-LD — `availability=OutOfStock` 하드코딩 → 가격 있는 상품도 품절로 표시

- **영역:** 프론트엔드 — 상품 상세 / SEO
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 개별 아이템 HTML의 JSON-LD 구조화 데이터에 `"availability":"https://schema.org/OutOfStock"`이 하드코딩되어 있다. 실제 가격 데이터가 있는 상품도 재고 없음으로 표시되어 Google 쇼핑 리치결과에서 상품이 누락될 수 있다.
- **원인:** `site/item/**/*.html` — 빌드 시 `price_observations` 유무로 `InStock`/`OutOfStock` 동적 결정 미구현.
- **파일:** [site/item/](site/item/) (모든 아이템 HTML) [lane:BACKEND]

---

### [L-208] ✅ 해결완료(2026-06-13) — `sitemap.xml` — `backpacking-bag` 카테고리 진입점 누락 + 전체 `<lastmod>` 없음

- **영역:** 프론트엔드 — SEO / 사이트맵
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `site/item/backpacking-bag/` 디렉터리와 HTML이 존재하나 `sitemap.xml`에 `category.html?cat=backpacking-bag` 항목이 없다. 또한 두 사이트맵 파일 모두 `<lastmod>` 태그가 전혀 없어 재크롤 우선순위 최적화가 불가하다.
- **파일:** [site/sitemap.xml](site/sitemap.xml) [lane:CORE]


---

## R-101 — 프론트/백엔드 종합 버그 탐색 11차 (2026-06-13)

### ✅ 해결완료(2026-06-13) [H-57] — `danawa.py` `parse_spec_string()` — `/` 포함 스펙값 잘못 분리 → 핵심 스펙 파싱 손상

- **영역:** 백엔드 — 파이프라인 / 다나와 크롤링
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `설치크기: 240/150/125cm` 같이 `/` 구분자가 포함된 스펙값이 `/` 기준으로 먼저 분리되어 `"240"` 만 파싱된다. 텐트 설치 크기·부피 등 핵심 스펙 무결성이 손상된다.
- **원인:** `pipeline/danawa.py` line 153 — 스펙값 내 `/` 구분자와 다나와 스펙 목록 구분자 혼용.
- **제안 수정:** 스펙 단위 패턴 포함 여부로 구분자 우선순위를 정하거나 값 파싱 전에 단위가 붙은 전체 문자열을 먼저 추출.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 153 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-58] — `enrich_details.py` `enrich()` — `spec["fn"]` KeyError → `derive` 전용 항목 진입 시 크래시

- **영역:** 백엔드 — 파이프라인 / 상품 상세 수집
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** TENT_MAP 항목 중 `floor_area` 등 `derive` 전용 항목이 `derive != "floor"` 분기로 잘못 진입하면 `spec["fn"]` 접근 시 KeyError 발생. `spec.get("fn")` 미사용.
- **원인:** `pipeline/enrich_details.py` line 37 — `"fn"` 키 존재 여부 사전 확인 없음.
- **제안 수정:** `fn = spec.get("fn"); if not fn: continue`
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 37 [lane:BACKEND]

---

### [M-212] ✅ 분석완료(무효, 정상동작) — `syncGearSetsOnLogin` — `toUpsert` 필터 복사본에 `remoteId` mutate → 원본 미반영, 매 로그인마다 세트 중복 upsert

- **영역:** 프론트엔드 — account.html 세트 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `toUpsert` 배열은 `local` 배열의 필터 복사본이다. `for...of` 루프에서 `s.remoteId = id`를 mutate해도 원본 `local` 배열 객체에 반영되지 않아 병합 후 저장되는 `merged` 배열에 `remoteId`가 누락된다. 다음 로그인 시 동일 세트가 다시 upsert된다.
- **원인:** `site/account.html` line 239–252 — 필터 복사본 참조 문제.
- **제안 수정:** `toUpsert`를 `local` 배열의 실제 객체 참조로 구성하거나, `merged` 빌드 시 `remoteId`를 별도 Map으로 추적.
- **파일:** [site/account.html](site/account.html) line 239–252 [lane:CORE]

---

### [M-213] ✅ 해결완료(2026-06-13) — `wish-clear-all` 핸들러 — `setWish([])` 후 `window.onWishChange` 트리거 미보장 → Supabase 원격 찜 미삭제

- **영역:** 프론트엔드 — account.html 찜 초기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그인 상태에서 찜 전체 삭제 시 `setWish([])`로 localStorage만 비운다. `window.onWishChange`가 트리거되지 않으면 Supabase 원격에 이전 찜 목록이 남아, 다음 로그인 시 삭제된 찜이 원격에서 복원된다.
- **원인:** `site/account.html` line 148–155 — `setWish` 이후 `window.onWishChange([])` 명시 호출 없음.
- **제안 수정:** `setWish([]); if (window.onWishChange) window.onWishChange([]);`
- **파일:** [site/account.html](site/account.html) line 148–155 [lane:CORE]

---

### [M-214] ✅ 해결완료(2026-06-13) — 계정 삭제 핸들러 — `signOut()` 비동기 콜백 지연 중 localStorage 삭제 → `onWishChange` 살아있는 상태에서 빈 배열 원격 저장 시도

- **영역:** 프론트엔드 — account.html 계정 삭제
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `await signOut()` 직후 `localStorage.removeItem('wish')` 삭제 시, `signOut` 내부의 auth 상태 변경 콜백이 비동기로 늦게 오면 `onWishChange`가 아직 살아있는 상태에서 storage 이벤트가 발생해 빈 배열로 `saveRemoteWishlist` 시도가 발생할 수 있다.
- **원인:** `site/account.html` line 516–518 — signOut 완료 전 localStorage 클리어.
- **파일:** [site/account.html](site/account.html) line 516–518 [lane:CORE]

- **처리:** 계정 삭제 핸들러에서 `signOut()` 전에 `window.onWishChange = null` 설정 — 빈 배열 원격 저장 방지. (2026-06-14)

---

### [M-215] ✅ 해결완료(2026-06-13, C19) — `enrich_details.py` `main()` — `targets` 빈 리스트 시 `IN ()` SQL 문법 오류

- **영역:** 백엔드 — 파이프라인 / 상품 상세 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `targets`가 빈 리스트일 때 `WHERE danawa_pcode IN ()` 형태의 SQL이 생성되어 SQLite `OperationalError` 발생. `--all` 플래그 + 빈 DB 조합에서 재현.
- **원인:** `pipeline/enrich_details.py` line 114–115 — `len(targets) == 0` 가드 없음.
- **제안 수정:** `if not targets: return` early exit 추가.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 114–115 [lane:BACKEND]

---

### [M-216] ✅ 해결완료(2026-06-13, C9) — `fill_whitelist_specs.py` `main()` — 승격 단계 예외 시 `con.close()` 미호출 → 커넥션 누수·WAL 잠금 잔류

- **영역:** 백엔드 — 파이프라인 / 스펙 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `RA.promote_all()`, `P.recompute_ratings()` 단계에서 예외 발생 시 `con.close()`가 호출되지 않아 SQLite 커넥션 누수와 WAL 잠금 파일이 잔류한다.
- **원인:** `pipeline/fill_whitelist_specs.py` line 144–184 — try/finally 없이 분기별 close 처리.
- **제안 수정:** `try/finally: con.close()` 패턴으로 변경.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 144–184 [lane:BACKEND]

---

### [M-217] ✅ 해결완료(2026-06-13, C27) — `collect_images.py` `collect()` — 이미지 수집 예외를 `err += 1`로만 처리, 로그 없음 → 원인 추적 불가

- **영역:** 백엔드 — 파이프라인 / 이미지 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `except Exception: err += 1` — 모든 오류(네트워크 차단, DB 오류 등)를 완전히 무시하고 카운트만 증가한다. 어떤 이미지가, 왜 실패했는지 추적할 방법이 없다.
- **원인:** `pipeline/collect_images.py` line 69 — 예외 로깅 없음.
- **제안 수정:** `except Exception as e: logging.warning("이미지 수집 실패 pid=%s: %s", pid, e); err += 1`
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 69 [lane:BACKEND]

---

### [L-209] ✅ 해결완료(2026-06-13) — account.html PWA install — 설치 거절(`dismissed`) 시에도 버튼 숨김 → 세션 내 재시도 불가

- **영역:** 프론트엔드 — account.html PWA 설치
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `deferredPrompt.userChoice` outcome이 `'dismissed'`(거절)인 경우에도 `row.style.display = 'none'`으로 숨긴다. 세션 내에서 설치 버튼이 영구 사라지고 `appinstalled` 이벤트도 발생하지 않아 복원 경로가 없다.
- **원인:** `site/account.html` line 175–178 — dismissed/accepted 분기 없이 무조건 숨김.
- **제안 수정:** `if (outcome === 'accepted') row.style.display = 'none';`
- **파일:** [site/account.html](site/account.html) line 175–178 [lane:CORE]

---

### [L-210] ✅ 해결완료(2026-06-13, C30) — `danawa.py` `http_get()` — `URLError` 발생 시 `last` 초기화로 이전 `HTTPError` 정보 소실

- **영역:** 백엔드 — 파이프라인 / 다나와 크롤링
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `HTTPError`로 `last`가 설정된 후 `URLError`가 발생하면 `last = None`으로 초기화되어 최종 `raise last` 경로에서 HTTP 상태 코드 정보가 소실된다.
- **원인:** `pipeline/danawa.py` line 85–87 — URLError catch에서 `last = None` 덮어쓰기.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 85–87 [lane:BACKEND]

---

## R-102 — 2026-06-13

### [H-59] ✅ 해결완료(2026-06-13) — `saveRemoteWishlist` — 동시 호출 시 race condition으로 찜 목록 덮어쓰기

- **영역:** 프론트엔드 — Supabase 연동
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 두 탭/빠른 연속 클릭으로 `saveRemoteWishlist`가 동시에 호출되면 두 호출 모두 같은 원본 배열을 읽고 각자 덮어써서 하나의 변경사항이 완전히 유실된다.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 111–116 — read-modify-write 패턴에 락/직렬화 없음. 두 호출이 동시에 현재 DB 값을 읽으면 마지막 write가 이긴다.
- **제안 수정:** DB 레벨 upsert + Supabase의 RPC 또는 단일 직렬화된 큐를 사용하거나, `LOCK` 또는 optimistic concurrency check (etag/version) 도입.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 111–116 [lane:CORE]

---

### [H-60] ✅ 해결완료(2026-06-13) — `getJSON` — GitHub Pages 404 HTML fallback을 빈 배열로 무시

- **영역:** 프론트엔드 — 데이터 로딩
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `fetch`가 성공(200)하지만 JSON이 아닌 HTML(GitHub Pages 커스텀 404 페이지)을 반환할 때, `.json()` 파싱 실패가 `.catch(() => [])` 로 삼켜져 빈 배열을 반환한다. 카테고리 데이터 로드 실패가 무증상으로 진행되어 빈 상품 목록이 표시된다.
- **원인:** [site/app.js](site/app.js) line 353 — `response.ok` 체크 없이 `.json()` 실패를 무시.
- **제안 수정:** `if (!response.ok) throw new Error(response.status)` 를 `.json()` 전에 추가하고, catch에서 사용자에게 오류 토스트 표시.
- **파일:** [site/app.js](site/app.js) line 353 [lane:CORE]

---

### [M-218] — `getProfile` — `data` null 시 TypeError crash — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 네트워크 타임아웃 등으로 `supabase.auth.getUser()`가 `{ data: null, error: ... }` 를 반환하면 `const { data: { user } }` 구조분해에서 `TypeError: Cannot destructure property 'user' of null` 발생.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 70 — null guard 없음.
- **제안 수정:** `const { data, error } = await supabase.auth.getUser(); if (!data) return null;` 패턴으로 변경.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 70 [lane:CORE]

---

### [M-219] — `renderAccount` 공유 URL — `location.origin` 사용으로 localhost URL 노출 가능 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 공유 기능
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 개발 환경에서 공유 URL 생성 시 `https://gear-forest.com/...` 대신 `http://localhost:5500/...` 가 클립보드에 복사된다. 사용자가 해당 링크를 다른 사람에게 공유하면 접근 불가.
- **원인:** [site/app.js](site/app.js) line 3455 — `location.origin` 동적 사용; 프로덕션 origin 하드코딩 없음.
- **제안 수정:** `const ORIGIN = 'https://gear-forest.com'` 상수 사용 또는 `location.hostname === 'localhost'` 분기.
- **파일:** [site/app.js](site/app.js) line 3455 [lane:CORE]

---

### [M-220] ✅ 해결완료(2026-06-14, MP) — `_meta_description` — `re.S` DOTALL 플래그로 다중 태그 걸침
> 확인: _meta_description를 M-541에서 순서무관 2단계 매칭으로 재작성하며 단일라인 re.S 의존 해소(danawa.py L141).

- **영역:** 백엔드 — 다나와 크롤링
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `re.S` 플래그로 인해 `content="..."` 정규식이 여러 줄/태그를 가로질러 매칭되어 meta description 대신 다음 속성들까지 포함한 긴 문자열이 추출될 수 있다.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 140 — `re.search(r'<meta name="description"\s+content="([^"]*)"', html, re.S)` — `[^"]*` 가 `"` 에서 멈추므로 완전히 잘못되진 않지만, `re.S` 필요 없는 단일 라인 패턴에 DOTALL 적용.
- **제안 수정:** `re.S` 제거 또는 BeautifulSoup으로 파싱.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 140 [lane:BACKEND]

---

### [M-221] ✅ 검토완료·현행유지(2026-06-14, D) — `packed_volume_cm3` — 2-숫자 스펙을 무조건 원통으로 계산
> 검토결과 현행유지: 2-숫자 수납크기는 캠핑 도메인상 대부분 스터프색(원통)이라 d=min·h=max 원통식이 적절. 평면 파우치(소수)는 오차 있으나 박스/skip 변경 시 다수 스터프색 부피가 회귀 → 휴리스틱 유지가 안전.

- **영역:** 백엔드 — 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "30×50cm" 형태의 스펙에서 Φ/지름/diam 키워드 없이도 원통 부피 `π×(d/2)²×h`로 계산하여 실제 직육면체 부피(30×50×30 추정)와 큰 오차 발생.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 159 — 숫자 2개 추출 후 keyword 검사 없이 cylinder 공식 적용.
- **제안 수정:** Φ/지름/diam/cylinder 키워드가 없을 때는 부피 계산을 skip하거나 직육면체(정방형 단면 가정) 공식 사용.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 159 [lane:BACKEND]

---

### [L-211] — `grade` — 단일 ★-metric 카테고리는 B 등급 수학적 불가능

- **영역:** 백엔드 — 가치 평가
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `strong_count >= 2` 조건의 B 등급이 ★-metric이 1개뿐인 카테고리에서는 수학적으로 달성 불가능. 해당 카테고리 상품은 A 또는 C/D만 가능하여 등급 분포가 왜곡된다.
- **원인:** [pipeline/limits_map.py](pipeline/limits_map.py) line 48 — `grade` 로직이 카테고리별 metric 개수를 고려하지 않음.
- **제안 수정:** `strong_threshold = min(2, total_metrics)` 로 동적 조정.
- **파일:** [pipeline/limits_map.py](pipeline/limits_map.py) line 48 [lane:BACKEND]

---

## R-103 — 2026-06-13

### [H-61] ✅ 해결완료(2026-06-13, BACKEND) — `run_all.py` `promote_all()` — `capclause` alias fragile string replace
> `capclause = "AND capacity IS NOT NULL"`(처음부터 alias 없이) + `{capclause}`(`.replace('p.','')` 제거). DB복사본 promote_all 실행 SQL 에러 없음(verified 2326→2480).

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `capclause = "AND p.capacity IS NOT NULL"` 을 `.replace('p.','')` 로 제거하는 fragile 설계. 미래에 `capclause`에 다른 `p.` 참조 추가 시 의도치 않은 치환 발생. 또한 outer `UPDATE products` 컨텍스트에 `p` alias가 없어 원본 그대로 삽입 시 SQL 오류.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 84–89 — alias 없이 정의해야 할 `capclause`에 `p.` prefix를 쓴 뒤 string replace로 제거하는 구조.
- **제안 수정:** `capclause = "AND capacity IS NOT NULL"` 으로 처음부터 alias 없이 정의하여 string replace 제거.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 84–89 [lane:BACKEND]

---

### [H-62] ✅ 해결완료(2026-06-13, BACKEND) — `run_all.py` `main()` — `--harvest` 시 `queries` 키 없는 카테고리 KeyError
> `cfg.get("queries")` + 빈 값이면 스킵. 검증: queries 없는 11개 카테고리(의자·랜턴·아이스박스·버너·타프·테이블·야전침대·코펠·웨건·화로대·파워뱅크) 확인.

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `--harvest` 플래그 사용 시 `cfg["queries"]` 접근에서 의자/랜턴/아이스박스 등 multicat 기반 9개 카테고리가 `queries` 키를 갖지 않아 `KeyError` 크래시.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 152 — `q = ",".join(cfg["queries"])` — `queries` 키 존재 여부 미검사.
- **제안 수정:** `q = ",".join(cfg.get("queries", []))` 또는 `if not cfg.get("queries"): continue` 조건 추가.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 152 [lane:BACKEND]

---

### [M-222] ✅ 해결완료(2026-06-13, C20) — `check_export.py` `check_file()` — `price_max=0` 이상치를 `or pmin` 치환으로 누락

- **영역:** 백엔드 — 배포 게이트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `pmax = m.get("price_max") or pmin` — `price_max=0` 이 falsy라 `pmin`으로 치환되어 실제 0원 이상치를 탐지 못함. `price_max=None` 도 동일하게 처리되어 두 케이스의 구분 불가.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — `or` 연산자가 0과 None을 동일 처리.
- **제안 수정:** `pmax = m.get("price_max") if m.get("price_max") is not None else pmin`
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### [M-223] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` `main()` — 빈 모델 리스트에서 `min()`/`max()` ValueError

- **영역:** 백엔드 — 데이터 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 브랜드 필터 후 모델이 0개가 되면 `lo, hi = min(caps), max(caps)` 에서 `ValueError: min() arg is an empty sequence` 크래시.
- **원인:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 167 — 빈 리스트 가드 없음.
- **제안 수정:** `if not models: print("필터 후 모델 없음 — 종료"); return` 추가.
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 167 [lane:BACKEND]

---

### [M-224] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` `main()` — `manifest.json` 열기 encoding 누락 + 파일핸들 누수

- **영역:** 백엔드 — 데이터 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `json.load(open(mpath))` — encoding 미지정으로 비-UTF-8 환경에서 `UnicodeDecodeError`. `with` 미사용으로 파일 핸들 누수. 쓰기(229번째 줄)도 동일 문제.
- **원인:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 221 — context manager 미사용, encoding 누락.
- **제안 수정:** `with open(mpath, encoding="utf-8") as f: man = json.load(f)` 패턴 사용.
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 221 [lane:BACKEND]

---

### [M-225] ✅ 해결완료(2026-06-13, C18) — `add_manual_models.py` `main()` — JSON 파일 열기 `with`/예외처리 누락

- **영역:** 백엔드 — 수동 데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `json.load(open(args.json, encoding="utf-8"))` — 파일 미존재 시 `FileNotFoundError`, JSON 파싱 오류 시 `json.JSONDecodeError` 모두 무처리로 전파. 파일 핸들 누수.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 — context manager 미사용, 예외 처리 누락.
- **제안 수정:** `with open(...) as f: models = json.load(f)` + try/except.
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 [lane:BACKEND]

---

### [L-212] ✅ 해결완료(2026-06-13, C24) — `limits_map.py` `_star_rate_pairs()` — `import re` 함수 내부 반복 실행

- **영역:** 백엔드 — 가치 평가
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `_star_rate_pairs()` 가 호출될 때마다 `import re` 를 재실행. Python 캐시로 실제 로드는 1회지만 조회 오버헤드 발생 + 모듈 상단 import 원칙 위반.
- **원인:** [pipeline/limits_map.py](pipeline/limits_map.py) line 171 — 함수 내부 import.
- **제안 수정:** 파일 상단으로 `import re` 이동.
- **파일:** [pipeline/limits_map.py](pipeline/limits_map.py) line 171 [lane:BACKEND]

---

### [L-213] ✅ 해결완료(2026-06-13, C21) — `stamp_version.py` `main()` — `supabaseClient.js` 해시 print 출력 누락

- **영역:** 백엔드 — 빌드 도구
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 버전 스탬프 완료 print에 `supabaseClient.js` 해시(`hs`)가 포함되지 않아 캐시버스팅 확인 시 정보 부재.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 108 — print 포매팅에 `hs` 누락.
- **제안 수정:** `f"... supabaseClient.js={hs} → ..."` 포함.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 108 [lane:BACKEND]

### [H-63] ✅ 해결완료(2026-06-13) — `clearAllFilters` — `STATE.campStyle` 미초기화로 스타일 칩 하이라이트 잔류

- **영역:** 프론트엔드 — 필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** "전체 해제" 버튼 클릭 후에도 스타일 칩(예: 백패킹)이 `.on` 상태로 유지되고 URL에 `&style=backpacking` 파라미터가 잔류한다.
- **원인:** [site/app.js](site/app.js) line 1892–1895 — `clearAllFilters`가 `STATE.campStyle`을 초기화하지 않음. `clearPresetFilters`(line 1653)는 올바르게 초기화함.
- **제안 수정:** `clearAllFilters` 내에 `STATE.campStyle = ""; renderStyleChips(STATE.data);` 추가.
- **파일:** [site/app.js](site/app.js) line 1892 [lane:CORE]

---

### [H-64] ✅ 해결완료(2026-06-13) — `buildFilters` — 필터 바텀시트 ESC 핸들러 익명 함수로 누수 누적

- **영역:** 프론트엔드 — 필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 카테고리 이동 시마다 `buildFilters`가 호출되어 새 keydown 리스너가 추가되지만 이전 것은 제거되지 않아 N회 이동 후 N개의 리스너가 누적된다.
- **원인:** [site/app.js](site/app.js) line 1742 — 익명 함수로 `addEventListener`하여 참조 없이 `removeEventListener` 불가.
- **제안 수정:** 모듈 레벨 변수 `let _filterSheetKeyHandler = null`에 저장 후 재등록 전 제거.
- **파일:** [site/app.js](site/app.js) line 1742 [lane:CORE]

---

### [H-65] ✅ 해결완료(2026-06-13) — `hlText` — `esc()` 이후 정규식 적용으로 HTML 엔티티 내부 매칭 → 깨진 HTML

- **영역:** 프론트엔드 — 검색
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 검색어가 `&amp;`, `amp`, `lt` 등 HTML 엔티티 구성 문자와 겹치면 `<mark>` 태그가 엔티티 내부에 삽입되어 `&<mark>a</mark>mp;` 같은 깨진 HTML 생성.
- **원인:** [site/app.js](site/app.js) line 989–992 — `esc(text)` 먼저 적용 후 정규식으로 하이라이트 삽입. 올바른 순서: 원본 텍스트에서 매칭 span 계산 → 각 세그먼트 개별 escape.
- **제안 수정:** `text.replace(re, '\x00$1\x01').split(...)` 패턴으로 raw 텍스트에서 치환 후 각 조각을 `esc()` 적용.
- **파일:** [site/app.js](site/app.js) line 989 [lane:CORE]

---

### [M-226] ✅ 해결완료(2026-06-13) — `openSetDetail` — 수량 변경 시 `renderAccount()` 후 `si` 배열 인덱스가 다른 세트 가리킬 수 있음

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 수량/타입 변경 시 `renderAccount()` 후 `openSetDetail(si)` 재호출하는데, `si`는 배열 인덱스로 `renderAccount` 실행 중 세트 삭제/추가가 있으면 다른 세트를 가리킴.
- **원인:** [site/app.js](site/app.js) line 2888 — 안정적인 세트 ID 대신 배열 인덱스 `si` 사용.
- **제안 수정:** 세트 고유 `id`를 `openSetDetail`의 파라미터로 사용하고 `sets.find(s => s.id === setId)` 로 조회.
- **파일:** [site/app.js](site/app.js) line 2888 [lane:CORE]

---

### [M-227] ⏸ 보류(COMMUNITY_ENABLED=false) — 로그 제출 후 태그 필터 `_logFeedTag` 유지로 신규 포스트 숨김

- **영역:** 프론트엔드 — 커뮤니티 (비활성 영역 — 참고용)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 태그 필터 활성 중 로그 제출 후 `renderLogFeed()` 무인자 호출로 기존 `_logFeedTag` 유지 → 신규 제출 포스트가 해당 태그 없으면 피드에서 숨겨짐.
- **원인:** [site/app.js](site/app.js) line 4056 — `renderLogFeed()` 인자 없이 호출, 모듈 레벨 `_logFeedTag` 재사용.
- **제안 수정:** 제출 후 `renderLogFeed("latest", "")` 로 태그 필터 초기화.
- **파일:** [site/app.js](site/app.js) line 4056 [lane:CORE]

---

### [M-228] ✅ 해결완료(2026-06-13) — `applySort` — 수동 정렬 선택 시 `STATE.campStyle` 미초기화로 스타일 칩·URL 이중 활성

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스타일 칩(백패킹) 선택 후 정렬 칩을 수동 클릭 시 스타일 칩이 `.on` 유지, URL에 `&sort=...&style=backpacking` 이중 직렬화로 필터 상태 모호.
- **원인:** [site/app.js](site/app.js) line 1811 — `applySort` 함수가 `STATE.campStyle` 초기화 안 함.
- **제안 수정:** `applySort` 진입 시 `STATE.campStyle = ""; renderStyleChips(STATE.data);` 추가.
- **파일:** [site/app.js](site/app.js) line 1811 [lane:CORE]

---

### [L-214] — `addToSet` — `pcode === undefined` 비교로 구 찜 항목 중복 오탐

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `pcode` 필드 없는 구 버전 찜 항목을 세트에 일괄 추가 시 `undefined === undefined` 매칭으로 다른 `pcode` 없는 항목이 중복으로 판정되어 잘못 차단됨.
- **원인:** [site/app.js](site/app.js) line 486 — `a.findIndex(x => x.pcode === item.pcode)` — `pcode` null 가드 없음.
- **제안 수정:** `a.findIndex(x => x.pcode && x.pcode === item.pcode)` 로 변경.
- **파일:** [site/app.js](site/app.js) line 486 [lane:CORE]

---

## R-104 — 2026-06-13

### [H-66] ✅ 해결완료(2026-06-13, BACKEND) — `detect_price_drops.py` `load_catalog()` — 파일핸들 누수로 macOS 256핸들 한도 초과 가능
> `with open(...) as fh: d = json.load(fh)`. 검증: 2326개 로드 후 열린 핸들 ~33개(누수 없음).

- **영역:** 백엔드 — 가격 추적
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 대형 카탈로그(JSON 파일 다수) 처리 시 파일 핸들을 닫지 않아 macOS 기본 한도(256) 초과 → `OSError: [Errno 24] Too many open files` 크래시.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 49 — `json.load(open(path, ...))` 패턴, `with` 없이 파일 오픈.
- **제안 수정:** `with open(path, encoding="utf-8") as fh: d = json.load(fh)` 패턴 사용.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 49 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-229] — `run_all.py` `main()` — generic 하베스터 카테고리 `--harvest` 시 무음 no-op

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--harvest --only 침낭` 등 generic 하베스터 카테고리 지정 시 스킵 메시지만 출력하고 데이터 수집 없이 성공 종료. 운영자가 수집됐다고 오해할 수 있음.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 149–157 — generic 하베스터 구현 없이 else 분기에서 출력만 하고 `sys.exit` / 경고 없음.
- **제안 수정:** `warnings.warn` 또는 `sys.exit(1)`로 no-op 명시적 처리.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 149 [lane:BACKEND]

---

### [M-230] ✅ 해결완료(기존확인, C6) — `resolve_duplicates.py` `resolve()` — `rep_product_id` 미매칭 시 가격 `None` 처리로 잘못된 위너 선택

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 중복 그룹의 모든 pid가 `canonical_models.rep_product_id`에 없으면 `min_price=None`으로 처리되어 가격 있는 정상 제품이 불이익을 받고 잘못된 위너가 선택됨.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 46–48 — `canonical_models`는 그룹당 1개 대표만 저장하지만 모든 pid에 1:1 매핑 가정.
- **제안 수정:** `rep_product_id=pid` 대신 `brand_id + canonical_model + capacity` 그룹 키로 가격 조회.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 46 [lane:BACKEND]

---

### [M-231] ✅ 해결완료(2026-06-13, C3) — `export_site.py` `export()` — ratings 쿼리에 `comparison_scope` 필터 없어 임의 scope 별점 선택

- **영역:** 백엔드 — 데이터 내보내기
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 `(product_id, metric_key)` 에 여러 `comparison_scope` 별점이 있을 때 `LIMIT 1`이 임의 scope 값을 반환하여 사용자에게 잘못된 scope의 별점 표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 98 — `AND r.comparison_scope = ?` 필터 누락.
- **제안 수정:** `ORDER BY r.comparison_scope` 또는 특정 scope 필터 추가, 혹은 `MAX(r.stars)` 집계 사용.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 98 [lane:BACKEND]

---

### [L-215] ✅ 해결완료(2026-06-13, C23) — `seed_coupang.py` `build()` — CSV `rep_product_id` 공백으로 기존 쿠팡 URL 유실

- **영역:** 백엔드 — 쿠팡 파트너스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** CSV 수동 편집으로 `rep_product_id` 필드에 공백이 추가되면 `existing` dict 키 불일치로 이전에 입력한 쿠팡 URL이 `--build` 실행마다 무음으로 유실됨.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 57 — `r["rep_product_id"]` 읽기 시 `.strip()` 없음.
- **제안 수정:** `existing[r["rep_product_id"].strip()] = r["coupang_url"]`
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 57 [lane:BACKEND]

### [H-67] ✅ 해결완료(2026-06-13) — `restoreState` — `STATE.data` null 시 `.metrics` 접근 TypeError 크래시

- **영역:** 프론트엔드 — 상태 복원
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 카테고리 JSON fetch 실패 후 URL 파라미터로 `sort=spec:weight_min` 등이 있을 때 `STATE.data.metrics.some(...)` 에서 `TypeError: Cannot read properties of undefined` 발생, 페이지 전체 크래시.
- **원인:** [site/app.js](site/app.js) line 1272 — `STATE.data` null 가드 없음.
- **제안 수정:** `STATE.data?.metrics?.some(m => ...)` 옵셔널 체이닝 적용.
- **파일:** [site/app.js](site/app.js) line 1272 [lane:CORE]

---

### [M-232] ✅ 해결완료(2026-06-13) — `fmtVal` — 스펙 값이 string 타입일 때 `.toFixed()` TypeError 크래시

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 파이프라인 버그로 스펙 값이 `12.5` 대신 `"12.5"` (string)로 유입되면 `v.toFixed(2)` 호출에서 `TypeError: v.toFixed is not a function` — 상품 모달 크래시.
- **원인:** [site/app.js](site/app.js) line 322 — number 타입 강제 변환 없이 `.toFixed()` 직접 호출.
- **제안 수정:** `return (+(+v).toFixed(2)) + (...)` 패턴으로 먼저 숫자 변환.
- **파일:** [site/app.js](site/app.js) line 322 [lane:CORE]

---

### [M-233] ✅ 해결완료(2026-06-13) — `openLogDetail` — `p.image_url` scheme 검증 없어 `data:` SVG XSS 가능

- **영역:** 프론트엔드 — 커뮤니티
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `image_url`에 `data:image/svg+xml,<svg onload='alert(1)'/>` 삽입 시 SVG 스크립트 실행 가능. `esc()`는 HTML 엔티티 이스케이프만 수행하고 URL scheme은 검증하지 않음.
- **원인:** [site/app.js](site/app.js) line 3789 — `p.image_url` scheme 검증 없이 `<img src>` 삽입.
- **제안 수정:** `p.image_url && /^https:\/\//.test(p.image_url)` 조건 추가.
- **파일:** [site/app.js](site/app.js) line 3789 [lane:CORE]

---

### [L-216] ✅ 해결완료(2026-06-14, E) — push-denied 영구차단을 Notification.permission==='granted' 재확인으로 해제 후 진행. — `requestPushSubscription` — `push-denied` 플래그 영구화로 권한 재허용 후에도 구독 차단

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 알림 거부 후 `push-denied` localStorage 설정됨. 이후 브라우저 설정에서 권한을 재허용해도 플래그가 남아 Push 구독 영구 차단.
- **원인:** [site/app.js](site/app.js) line 3532 — `push-denied` 플래그에 `Notification.permission` 상태 기반 무효화 로직 없음.
- **제안 수정:** `Notification.permission === "granted"` 시 `localStorage.removeItem("push-denied")` 실행.
- **파일:** [site/app.js](site/app.js) line 3532 [lane:CORE]

---

### [L-217] — `won()` — `won(0)` 이 `"—"` 대신 `"0원"` 반환

- **영역:** 프론트엔드 — 가격 표시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `price_min: 0` 데이터 입력 오류 시 슬라이더 레이블에 `"0원최저가 기준"` 표시. `priceRange`는 `a === 0` 가드가 있지만 raw `won()` 함수는 없음.
- **원인:** [site/app.js](site/app.js) line 308 — `n == null` 만 검사, `n === 0` 미처리.
- **제안 수정:** `(n == null || n === 0) ? "—" : ...` 조건 추가.
- **파일:** [site/app.js](site/app.js) line 308 [lane:CORE]

---

## R-105 — 2026-06-13

### [H-68] ✅ 해결완료(2026-06-13, BACKEND) — `graph_full.py` `report_node()` — `n=0` 시 ZeroDivisionError 크래시
> `pct = lambda c: (c*100//n) if n else 0` 로 분모 가드. 검증: n=0→0%(무크래시), n=10→정상.

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** DB가 비어있거나 신규 카테고리에서 `n == 0` 일 때 `price*100//n` 정수 나눗셈에서 `ZeroDivisionError` — 전체 그래프 실행 마지막 단계 크래시.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 160–163 — 분모 `n` 0 체크 없음.
- **제안 수정:** `price*100//n if n else 0` 패턴으로 변경.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 160 [lane:BACKEND]

---

### [M-234] ✅ 해결완료(2026-06-13, C28) — `reclassify_other_tent.py` `bucket()` — `cap or 0` 로 `None`과 `0` 구분 불가

- **영역:** 백엔드 — 텐트 분류
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `{1:2500, 2:3000, 3:3600}.get(cap or 0)` — `cap=None`과 `cap=0` 모두 key `0`으로 매핑되어 `None` 반환. `cap=None` 텐트가 band 비교 없이 `"auto"`로 분류될 수 있음.
- **원인:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 40 — `cap or 0` falsy 패턴으로 None/0 구분 소실.
- **제안 수정:** `.get(cap)` 으로 변경 (None은 이미 None 반환).
- **파일:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 40 [lane:BACKEND]

---

### [M-235] ✅ 해결완료(2026-06-13, C7) — `graph_full.py` `enrich_node()` — 예외 발생 시 SQLite 커넥션 누수

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `con = sqlite3.connect(s["db"])` 이후 예외 발생 시 `try/finally` 없어 커넥션이 닫히지 않고 누수. 장기 실행 파이프라인에서 DB 파일 잠금 문제 유발 가능.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 95–106 — context manager 없이 커넥션 오픈.
- **제안 수정:** `try/finally: con.close()` 또는 `with sqlite3.connect(s["db"]) as con:` 패턴 사용.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 95 [lane:BACKEND]

---

### [M-236] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `validate_db()` — 전체 `valid=1` 리셋이 `source_id=4` 수동 보정값 덮어씀

- **영역:** 백엔드 — 데이터 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `validate_db()` 호출마다 `UPDATE product_spec_values SET valid=1` 로 전체 리셋 → 수동으로 `valid=0` 설정한 `source_id=4` 외부확정 보호값이 매번 복원됨. 이후 재격리 블록은 `conflict` 플래그 기반으로만 재무효화하여 직접 SQL 수정값은 영구 복원.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 — bulk reset이 `source_id=4` 제외하지 않음.
- **제안 수정:** `UPDATE product_spec_values SET valid=1 WHERE IFNULL(source_id,1)<>4`
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 [lane:BACKEND]

### [H-69] ✅ 해결완료(2026-06-13) — `renderAccount` — `window._accUser` 동기 읽기로 auth 초기화 전 로그아웃 상태 오표시

- **영역:** 프론트엔드 — 인증
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `account.html` 로드 직후 `renderAccount` 호출 시 async auth 완료 전 `_accUser`가 `undefined`라 `isLoggedIn=false`로 판단. 로그인 사용자에게 찜/세트 섹션이 로그인 CTA로 표시됨.
- **원인:** [site/app.js](site/app.js) line 3071 — `const isLoggedIn = !!window._accUser` 동기 읽기, `window.isLoggedIn()` 또는 `authReady()` await 미사용.
- **제안 수정:** `const isLoggedIn = window.isLoggedIn ? window.isLoggedIn() : !!window._accUser` 또는 `account.html`에서 `await window.authReady()` 후 `renderAccount` 호출.
- **파일:** [site/app.js](site/app.js) line 3071 [lane:CORE]

---

### [H-70] ✅ 해결완료(2026-06-13) — `setupSearchPage` 찜 버튼 — `requireLogin` 게이트 누락으로 비로그인 찜 서버 미동기화

- **영역:** 프론트엔드 — 검색 / 인증
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `search.html` 찜 버튼이 `toggleWishWithHint` 대신 `setWish()` 직접 호출 → 비로그인 사용자에게 로그인 게이트 미표시, 찜이 localStorage에만 저장되고 서버 동기화 안 됨. FE-AUTH-01 §C 위반.
- **원인:** [site/app.js](site/app.js) line 1176–1186 — auth 게이트 없이 직접 `setWish` 호출. `setupHomeSearch`의 동일 버튼은 `toggleWishWithHint` 사용.
- **제안 수정:** `setWish` 직접 호출을 `toggleWishWithHint(item, btn)` 으로 교체.
- **파일:** [site/app.js](site/app.js) line 1176 [lane:CORE]

---

### [M-237] ✅ 해결완료(2026-06-13) — `openReplaceModal` — 슬롯 인덱스 `btn.dataset.ii` 가 splice 후 다른 아이템 가리킬 수 있음

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 빠른 더블탭 또는 모달 오픈 이후 아이템 삭제 시 `btn.dataset.ii` 인덱스가 현재 배열과 불일치 → 잘못된 아이템 삭제.
- **원인:** [site/app.js](site/app.js) line 613–620 — `inSlot` 렌더링 시점의 인덱스를 splice에 사용, 배열 변경 후 유효성 검증 없음.
- **제안 수정:** `pcode` 매칭으로 아이템 찾아 `indexOf` 후 splice.
- **파일:** [site/app.js](site/app.js) line 613 [lane:CORE]

---

### [M-238] ✅ 해결완료(2026-06-13) — `showToast` `isHtml=true` — 미래 호출자 사용자 데이터 직접 전달 시 XSS 위험

- **영역:** 프론트엔드 — UI
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `showToast(msg, dur, true)` 경로에서 `t.innerHTML = msg` 직접 삽입. 현재 호출 지점은 안전하지만 `isHtml` 파라미터 미문서화로 미래 호출자가 사용자 데이터 전달 시 XSS 발생 가능.
- **원인:** [site/app.js](site/app.js) line 469 — `isHtml=true` 경로에 sanitization 없음.
- **제안 수정:** `isHtml` 사용 시 항상 `esc()` 후 전달하도록 JSDoc 주석 추가 또는 내부 DOMPurify 처리.
- **파일:** [site/app.js](site/app.js) line 469 [lane:CORE]

---

### [M-239] — `openSetDetail` — qty ± 후 `renderAccount()` DOM 재생성으로 `_prevFocus` 참조 무효화 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 수량 변경 시 `renderAccount()` → `openSetDetail(si)` 재호출하는데, `_prevFocus`는 초기 오픈 시 저장한 DOM 요소를 가리킴. `renderAccount()`가 카드 DOM을 재생성하므로 저장된 참조가 무효화 → `close()` 시 `focus()` 실패, 키보드 포커스 유실.
- **원인:** [site/app.js](site/app.js) line 2972 — `_prevFocus`를 최초 오픈 시에만 저장, re-render 후 참조 갱신 없음.
- **제안 수정:** `renderAccount()` 호출 전 `prevFocus`를 로컬 변수로 저장 후 `openSetDetail`에 전달하거나, 재오픈 시 `_prevFocus` 업데이트.
- **파일:** [site/app.js](site/app.js) line 2972 [lane:CORE]

---

### [M-240] — `renderAccount` 세트 섹션 — `loginShown` 플래그 미제거로 로그아웃 후 로그인 CTA 재표시 안 됨 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그아웃 → `renderAccount` 재호출 시 `setsEl.dataset.loginShown="1"` 잔류로 로그인 CTA 블록 미실행, 세트 목록(또는 빈 상태)이 로그아웃 사용자에게 그대로 표시됨.
- **원인:** [site/app.js](site/app.js) line 3343–3359 — 로그인 전환 시 `loginShown` 플래그 미초기화.
- **제안 수정:** 로그인 시 `delete setsEl.dataset.loginShown` 또는 매 렌더링마다 현재 `isLoggedIn` 기반으로 무조건 재렌더.
- **파일:** [site/app.js](site/app.js) line 3343 [lane:CORE]

---

## R-106 (백엔드) — 2026-06-13

### [H-71] ✅ 해결완료(2026-06-13, BACKEND) — `column_fixes.py` `main()` — `[기준의심]` 플래그 무조건 DELETE로 수동 검토 결과 소실
> (1) DELETE에 `AND resolved=0` (검토완료분 보존) (2) 재INSERT 전 `reviewed` 집합으로 resolved=1인 (pid,mid) 재플래그 스킵 — 안 그러면 보존분 옆에 새 resolved=0 중복 생성돼 검토가 무력화됨. E2E: resolved=1 보존+중복 미생성(내수압 78→77) 확인.

- **영역:** 백엔드 — 데이터 품질
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 매 실행마다 `DELETE FROM data_quality_flags WHERE note LIKE '[기준의심]%'` 무조건 실행 → 검토자가 `resolved=1`로 처리하거나 주석을 달아둔 플래그도 삭제됨. 수동 리뷰 작업이 비영속적.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 27 — `resolved` 상태 무관하게 전체 삭제.
- **제안 수정:** `DELETE FROM data_quality_flags WHERE note LIKE '[기준의심]%' AND resolved=0`
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 27 [lane:BACKEND]

---

### [M-241] ✅ 해결완료(2026-06-13, C8) — `verify_internal.py` `main()` — `resolved=1` 전체를 억제 집합으로 사용해 재발 탐지 누락

- **영역:** 백엔드 — 내부 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `resolved_set`이 `resolved=1` 전체 행을 포함하므로 "수정 완료"로 표시된 항목이 재발해도 탐지 안 됨. false_positive 억제와 실제 수정 완료를 구분하지 않음.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 260–261 — `resolved` 단일 컬럼으로 false_positive/수정완료 구분 없음.
- **제안 수정:** `resolution_type` 컬럼 추가 또는 `note LIKE '%false_positive%'` 기반으로 억제 집합 필터링.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 260 [lane:BACKEND]

---

### [M-242] ✅ 해결완료(2026-06-13, C3) — `export_site.py` `export()` — 스펙 쿼리 `ORDER BY` 없어 복수 valid 행 시 비결정적 반환

- **영역:** 백엔드 — 데이터 내보내기
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 metric key에 valid 행이 2개 이상(crosssource 보정 등)일 때 `LIMIT 1`이 임의 행 반환 → 사용자에게 잘못된 스펙값 표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 89–93 — `LIMIT 1` 전 `ORDER BY` 없음.
- **제안 수정:** `ORDER BY v.is_primary DESC, v.source_id DESC LIMIT 1` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 89 [lane:BACKEND]

---

## R-106 (프론트엔드) — 2026-06-13

### [M-243] ✅ 해결완료(2026-06-13) — `renderActiveFilters` — `STATE.campStyle` 활성 필터 칩 미표시로 개별 해제 불가

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 캠핑 스타일(백패킹 등) 활성화 시 활성 필터 칩 바에 해당 칩이 없어 사용자가 개별 해제 불가. "전체 해제"만 가능.
- **원인:** [site/app.js](site/app.js) line 1859 — `renderActiveFilters()`가 `STATE.campStyle` 케이스를 처리하지 않음.
- **제안 수정:** `if (STATE.campStyle)` 칩 추가 + 클릭 시 `STATE.campStyle = ""; applyStyleSort(STATE.data)`.
- **파일:** [site/app.js](site/app.js) line 1859 [lane:CORE]

---

### [M-244] ✅ 기구현(2026-06-13 검증) — `renderAccount` 장비 세트 카드 — 키보드 핸들러 누락으로 접근성 위반

- **영역:** 프론트엔드 — 접근성
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `role="button" tabindex="0"` 세트 카드에 `onkeydown` 없어 키보드 전용 사용자가 Enter/Space로 세트 상세 열기 불가. WCAG 2.1.1 위반.
- **원인:** [site/app.js](site/app.js) line 3474 — `card.onclick`만 설정, `onkeydown` 없음. 찜/로그 카드는 `onkeydown` 구현됨.
- **제안 수정:** `card.onkeydown = e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); openSetDetail(+card.dataset.si); } };` 추가.
- **파일:** [site/app.js](site/app.js) line 3474 [lane:CORE]

---

### [M-245] ✅ 해결완료(2026-06-13) — `openProduct` 스펙 툴팁 — 모달 재오픈 시 이전 툴팁 텍스트 잔류

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 툴팁이 표시된 상태에서 다른 상품 모달 오픈 시 이전 상품의 툴팁 텍스트가 새 모달에 표시됨.
- **원인:** [site/app.js](site/app.js) line 2124 — `openProduct`가 `_tipBubble` 재사용 시 `hideTip()` 호출 없음.
- **제안 수정:** 이벤트 리스너 재부착 전 `if (_tipBubble) _tipBubble.style.display = "none"` 추가.
- **파일:** [site/app.js](site/app.js) line 2124 [lane:CORE]

---

### [M-246] — `renderAccount` 로그 섹션 — `dataset.loaded` 가드로 재로그인 후 로그 목록 갱신 안 됨 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 최초 로드 후 `dataset.loaded="1"` 설정 → `renderAccount` 재호출(찜 변경, 리뷰 제출 등)에도 로그 목록 미갱신, 오래된 내용 표시.
- **원인:** [site/app.js](site/app.js) line 3090–3093 — `!myLogsList.dataset.loaded` 가드가 영구적으로 재로드 차단.
- **제안 수정:** `onAuthStateChange`에서 `delete myLogsList.dataset.loaded` 또는 리뷰 제출 후 플래그 초기화.
- **파일:** [site/app.js](site/app.js) line 3090 [lane:CORE]

---

### [L-218] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조) — loginHref 변수는 현재 app.js에 부재(이미 제거됨). — `_showAuthGateModal` — `loginHref` 사용되지 않는 데드 변수

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `const loginHref = ...` 계산 후 어디에도 사용되지 않음. 이후 `prefix` 변수가 실제 href 구성에 사용됨.
- **원인:** [site/app.js](site/app.js) line 121 — 이전 구현 잔재 데드 코드.
- **제안 수정:** line 121 제거.
- **파일:** [site/app.js](site/app.js) line 121 [lane:CORE]

---

## R-107 (프론트엔드) — 2026-06-13

### [H-72] ✅ 해결완료(2026-06-13) — `openLogModal` — `window._commUser` (커뮤니티 전용) 사용으로 비커뮤니티 페이지에서 항상 "로그인 필요" 표시

- **영역:** 프론트엔드 — 로그 모달
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `openLogModal`이 `window._commUser` (community.html 로컬 변수)로 인증 확인 → community.html이 아닌 페이지에서 호출 시 `_commUser`가 `undefined`라 항상 로그인 게이트 표시.
- **원인:** [site/app.js](site/app.js) line 3902 — 페이지 로컬 `_commUser` 대신 전역 `currentUser()` / `window.isLoggedIn()` 미사용.
- **제안 수정:** `window._commUser` → `window.isLoggedIn?.()` 또는 `window.currentUser?.()` 교체.
- **파일:** [site/app.js](site/app.js) line 3902 [lane:CORE]

---

### [M-247] ✅ 해결완료(2026-06-13) — `_showAuthGateModal` — 백드롭 클릭 닫기 시 `keydown` 리스너 미제거 누수

- **영역:** 프론트엔드 — 인증 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 백드롭 클릭으로 인증 게이트 모달 닫을 때 ESC `keydown` 리스너가 제거되지 않아 이후에도 ESC 키 이벤트 처리 계속 발생. 모달을 여러 번 열었다 닫으면 리스너 누적.
- **원인:** [site/app.js](site/app.js) line 131–137 — 백드롭 클릭 닫기 경로에서 `removeEventListener` 없음.
- **제안 수정:** 백드롭 클릭 핸들러에도 `document.removeEventListener("keydown", onKey)` 추가.
- **파일:** [site/app.js](site/app.js) line 131 [lane:CORE]

---

## R-107 (백엔드) — 2026-06-13

### [H-73] ✅ 해결완료(2026-06-13, BACKEND) — `.github/workflows/pages.yml` — 존재하지 않는 GitHub Actions 버전으로 CI 배포 실패
> checkout@v4·setup-python@v5·configure-pages@v5·upload-pages-artifact@v3·deploy-pages@v4 로 실재 안정버전 교정. YAML 유효성 확인.

- **영역:** 백엔드 — CI/CD
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `actions/checkout@v6`, `actions/setup-python@v6`, `actions/configure-pages@v6` 등 존재하지 않는 버전 태그 사용 → Actions 실행 즉시 `uses:` 해석 실패, GitHub Pages 배포 불가.
- **원인:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 24–45 — 실제 최신 버전(v4, v5 등) 초과 태그 사용.
- **제안 수정:** `checkout@v4`, `setup-python@v5`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4` 으로 수정.
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 24 [lane:BACKEND]

---

### [H-74] ✅ 해결완료(2026-06-13, BACKEND) — `resolve_duplicates.py` `resolve()` — `GROUP_CONCAT ORDER BY` SQLite <3.44 미지원으로 CI 크래시
> `GROUP_CONCAT(id)`(ORDER BY 제거) 후 `sorted(int(x) for x in ids_str.split(","))`로 Python 정렬. CI ubuntu 3.37.x 호환.

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** GitHub Actions `ubuntu-latest`의 SQLite 3.37.2에서 `GROUP_CONCAT(id ORDER BY id)` 실행 시 `OperationalError` — 중복 해소 단계 전체 중단.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 27 — `ORDER BY` inside `GROUP_CONCAT`은 SQLite ≥3.44 전용 기능.
- **제안 수정:** `GROUP_CONCAT(id)` 사용 후 Python에서 `sorted(ids_str.split(","))` 정렬.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 27 [lane:BACKEND]

---

### [M-248] ✅ 해결완료(기존확인, C21) — `stamp_version.py` `main()` — `supabaseClient.js` 존재 여부 미확인으로 FileNotFoundError 시 전체 스탬프 중단

- **영역:** 백엔드 — 빌드 도구
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `site/supabaseClient.js` 부재 시 `_hash()` 에서 `FileNotFoundError` → `app.js`, `style.css`, `sw.js` 버전 스탬프 전혀 안 됨 → 스텔스 스탈 캐시 리그레션.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 44 — `search_json_path`/`swp`는 존재 여부 가드 있지만 `supabaseClient.js`는 없음.
- **제안 수정:** `if os.path.exists(...)` 가드 추가, 없을 때 `hs = ""` 폴백.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 44 [lane:BACKEND]

---

### [M-249] ✅ 해결완료(2026-06-13, C13) — `normalize_models.py` `normalize_db()` — 브랜드 prefix 제거 후 GENERIC 재검사 누락으로 오류 병합

- **영역:** 백엔드 — 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 브랜드명 prefix 제거 후 결과값이 GENERIC 단어(의자, 테이블 등)와 일치해도 DB에 그대로 저장 → 해당 브랜드 동일 카테고리 제품 전체가 하나의 canonical_model로 잘못 병합.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 198–205 — 제거 후 결과를 `GENERIC` 집합으로 재검사하지 않음.
- **제안 수정:** `if stripped in GENERIC or len(stripped) < 2: continue` 추가.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 198 [lane:BACKEND]

---

### [L-219] ✅ 해결완료(2026-06-13, C31) — `run_all.py` `promote_all()` — 사용되지 않는 `total = 0` 초기화 잔재 코드

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `total = 0` 초기화 후 루프 내에서 누적 없이 최종 SELECT로 덮어쓰여 데드 코드. 디버깅 시 혼란 유발.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 80 — 리팩터링 후 잔존 초기화.
- **제안 수정:** `total = 0` 라인 제거.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 80 [lane:BACKEND]

---

## R-108 (백엔드) — 2026-06-13

### [M-250] ✅ 해결완료(2026-06-13, C19) — `enrich_details.py` `main()` — `recompute_ratings` 예외 시 DB 커넥션 누수 + rollback 없음

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `P.recompute_ratings(con)` 예외 발생 시 `con.close()` 미실행 → 커넥션 누수. 루프 내 `con.commit()`으로 부분 커밋된 상태에서 rollback 경로 없음.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 85–118 — `try/finally` 없음. `crosssource.py`와 달리 에러 핸들링 부재.
- **제안 수정:** `con = sqlite3.connect(...)` 이후 전체를 `try/finally: con.close()` 로 감쌈.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 85 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-251] — `detect_price_drops.py` `detect()` — 재입고+가격하락 동시 발생 시 가격하락 이벤트 누락

- **영역:** 백엔드 — 가격 추적
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 재입고 감지 후 `continue`로 가격하락 체크 건너뜀 → 재입고+가격하락 동시 발생 시 가격하락 알림 누락. 또한 `if prev_min`이 `prev_min=0` (무료 상품)을 falsy로 처리해 0으로의 가격하락도 억제.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 97–105 — 재입고 분기에서 `continue` 사용, `prev_min` 0 가드.
- **제안 수정:** 재입고/가격하락을 독립 분기로 분리. `if prev_min is not None and cur_min < prev_min:` 패턴 사용.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 99 [lane:BACKEND]

---

### [M-252] ✅ 해결완료(2026-06-13, C36) — `add_value_star.py` `value_stars()` — 단일 모델 비교 시 항상 ★5 배정

- **영역:** 백엔드 — 가치 평가
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리에 유효 모델이 1개뿐일 때 `frac=0` (최고점) → 실제 원/L 가성비와 무관하게 무조건 ★5 표시. M-167(단일 모델 항상 ★5)의 `value_metric.py` 버전과 동일 패턴.
- **원인:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 24–26 — `n > 1 else 0` 시 frac=0 (최고점) 할당.
- **제안 수정:** `frac = i / (n - 1) if n > 1 else 0.5` (중립 3점) 또는 단일 모델은 평가 생략.
- **파일:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 24 [lane:BACKEND]

---

### [L-220] ✅ 분석완료(무효, C6) — `resolve_duplicates.py` `resolve()` — 복수 loser가 동일 canonical_models 행 공유 시 두 번째 winner 업데이트 no-op

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 두 loser가 동일 `canonical_models` 행의 `rep_product_id`를 가리킬 때, 첫 winner 업데이트 성공 후 두 번째는 0행 매칭 → `total_cm_updated` 과소 계산, 모델 그룹에 대한 `canonical_models` 행 부재 가능.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 88 — per-loser 반복 UPDATE, 중복 공유 canonical_models 행 미처리.
- **제안 수정:** loser 강등 후 winner로 단일 UPDATE 실행 (`brand_id + canonical_model + capacity` 기준).
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 88 [lane:BACKEND]

---

## R-108 (프론트엔드) — 2026-06-13

### [H-75] ✅ 해결완료(2026-06-13) — `setupSearchPage` `ensureIdx()` — 동시 호출 시 in-flight 가드 없어 중복 JSON fetch

- **영역:** 프론트엔드 — 검색
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 검색 페이지 초기화 중 두 곳에서 `ensureIdx()`를 동시 호출 시 `if (!idx)` 체크가 둘 다 통과 → `search.json`을 두 번 fetch. 홈 검색의 `ensureIdx`(line 909)는 `idxLoading` promise 가드가 있지만 검색 페이지 버전은 없음.
- **원인:** [site/app.js](site/app.js) line 1122–1125 — `idxLoading` in-flight promise 가드 없음.
- **제안 수정:** `let idxLoading = null; if (!idxLoading) idxLoading = getJSON(...).then(d => idx = d); return idxLoading;` 패턴 적용.
- **파일:** [site/app.js](site/app.js) line 1122 [lane:CORE]

---

### [M-253] ✅ 해결완료(2026-06-13) — `openSetDetail` qty 버튼 — 더블탭 시 re-render 중 두 번째 클릭으로 잘못된 아이템 제거

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** qty-dec → splice → renderAccount → openSetDetail 사이클 중 두 번째 빠른 클릭이 같은 `ii` 인덱스로 실행되어 이미 제거된 위치의 다른 아이템을 잘못 제거.
- **원인:** [site/app.js](site/app.js) line 2996–3015 — re-render 사이클 동안 `.qty-dec`/`.qty-inc` 버튼 비활성화 없음.
- **제안 수정:** 클릭 즉시 버튼 `disabled` 설정, re-render 완료 후 새 버튼으로 교체.
- **파일:** [site/app.js](site/app.js) line 2996 [lane:CORE]

---

### [L-221] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — active 비교는 raw b vs 디코드 params.get('b')(2884)로 일치, esc()는 data-b 속성 이스케이프 전용. 오탐. — `renderChips` 브랜드 칩 — `esc()`로 인코딩된 `data-b`와 `params.get("b")` 비교 불일치

- **영역:** 프론트엔드 — 브랜드 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브랜드명에 `&`, `<`, `"` 등 HTML 특수문자 포함 시 `data-b="${esc(b)}"` 인코딩된 값과 `params.get("b")` raw 값 비교 실패 → 활성 브랜드 칩 하이라이트 안 됨.
- **원인:** [site/app.js](site/app.js) line 2710 — `data-b`에 `esc()` 적용(불필요), 비교 시 양쪽 일관성 없음.
- **제안 수정:** `data-b`에 raw `b` 사용(속성 내 `"` 이스케이프만 필요).
- **파일:** [site/app.js](site/app.js) line 2710 [lane:CORE]

---

### [L-222] — `setupHomeSearch` `run()` — 인덱스 로딩 중 타이핑 시 중복 `run()` 호출 큐잉

- **영역:** 프론트엔드 — 홈 검색
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 검색 인덱스 로딩 중 5자 타이핑 시 `idxLoading` promise에 5개 `run()` 콜백 큐잉 → 인덱스 로드 완료 후 5번 연속 불필요한 검색 re-render 발생.
- **원인:** [site/app.js](site/app.js) line 965–970 — `ensureIdx().then(run)` 매 호출마다 추가, last-write-wins 가드 없음.
- **제안 수정:** `let _pendingRun = 0; const token = ++_pendingRun;` 패턴으로 최신 호출만 실행.
- **파일:** [site/app.js](site/app.js) line 965 [lane:CORE]

---

## R-109 (백엔드) — 2026-06-13

### [H-76] ✅ 해결완료(2026-06-13, BACKEND) — `crosssource.py` `main()` — 첫 `commit()` 후 `recompute_ratings` 예외 시 spec 변경사항 롤백 불가
> recompute 전 중간 commit 제거 → spec upsert+ratings 재계산 단일 트랜잭션, 마지막 1회 commit. recompute_ratings는 같은 con·내부 commit 없음 확인(기존 H-54 주석의 "별도 commit 필요" 전제는 오류였음). 검증: recompute 예외 시뮬레이션에서 spec INSERT도 함께 롤백(before=after=10850).

- **영역:** 백엔드 — 크로스소스
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `con.commit()`(line 192) 후 `P.recompute_ratings(con)` 예외 시 `con.rollback()` 호출되지만 이미 커밋된 spec 변경사항은 롤백 불가 → spec 커밋+ratings 미커밋 반쪽 상태 잔류.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 192 — spec commit이 recompute 전에 실행되어 rollback 경계 밖에 위치.
- **제안 수정:** `recompute_ratings` 완료 후 단일 commit 또는 recompute만 별도 try/except로 분리.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 192 [lane:BACKEND]

---

### [H-77] ✅ 해결완료(2026-06-13, BACKEND) — `promote_catalog.py` `main()` — `capacity IS NOT NULL` 하드코딩으로 CORE 지표 완비 제품도 승격 탈락
> 근본원인(하드코딩·CORE 불일치)을 명시 상수 `NEED_CAPACITY`로 해소 + run_all.promote_all의 need_capacity 정책과 일관화. **판단:** promote_catalog는 미참조 레거시(활성 경로는 run_all.promote_all), 정규 정책상 텐트는 인원이 완비기준이라 capacity 게이트는 의도된 품질바(검증 카탈로그 인원 100% 유지) → 게이트 유지하되 토글 가능하게 명시화. 검증: True→verified 543(인원100%)/False→896(인원60.6%) 양쪽 SQL 정상.

- **영역:** 백엔드 — 카탈로그 승격
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** CORE = `[weight_min, water_head, floor_area]` 세 지표를 모두 보유해도 `capacity IS NULL`이면 verified 승격 불가. capacity 보강이 안 된 제품이 불필요하게 탈락.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 36 — 승격 SQL에 capacity 조건 하드코딩, CORE 리스트와 불일치.
- **제안 수정:** capacity를 CORE에 추가하거나 SQL에서 capacity 조건 제거.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 36 [lane:BACKEND]

---

### [M-254] ✅ 해결완료(2026-06-13, C22) — `harvest_tents.py` `ingest()` — `product_spec_values` INSERT에 `valid` 컬럼 누락

- **영역:** 백엔드 — 텐트 수확
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `valid` 없이 INSERT → DB DEFAULT 미설정 시 `valid=NULL` → `WHERE valid=1` 필터 미통과 → 수확한 스펙 전체 무효화.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 147 — INSERT 컬럼 목록에서 `valid` 생략. `multicat.py`, `crosssource.py` 등은 `valid=1` 명시.
- **제안 수정:** `...is_primary,valid) VALUES(...,1,1)` 으로 `valid=1` 추가.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 147 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-255] — `graph_pipeline.py` `persist()` — `source_id IN (3,4)` 일괄 삭제로 crosssource 확정값 소실

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `graph_pipeline`이 `crosssource.py` 이후 실행되면 `DELETE WHERE source_id IN (3,4)` 로 crosssource 확정값(source_id=4)도 삭제 → 수작업 보정값 유실.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 163 — 멱등성 확보를 위한 전체 삭제가 source_id=4 보호 없음.
- **제안 수정:** `source_id=3`만 삭제하거나 `AND (source_id != 4 OR confirm IS NULL)` 조건 추가.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 163 [lane:BACKEND]

---

### [M-256] ✅ 해결완료(2026-06-13, C39) — `multicat.py` `ingest_one()` — `seen_names` 전 카테고리 공유로 다른 카테고리 동명 모델 오탐 차단

- **영역:** 백엔드 — 멀티카테고리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "Solo" 등 흔한 모델명이 의자 카테고리에 등록되면 랜턴/버너의 전혀 다른 "Solo" 제품이 `dup_name`으로 거부됨.
- **원인:** `seen_names`가 평면 `{model_name}` 문자열 집합. `harvest_tents.ingest`·`multicat.ingest_one`·`refresh.snapshot`가 **동일 set 객체를 공유**(refresh가 양쪽 ingest에 같은 set 전달)해 한 파일만 튜플 키로 못 바꿈.
- **해결(M-275/L-241과 동시):** 3파일 동시변경 — 키를 `(category_id, brand=brands.name_ko, model)` 튜플로. `ingest_one` 체크/add + 빌더 SQL 3곳을 `SELECT p.category_id, b.name_ko, p.model_name FROM products p JOIN brands b ON b.id=p.brand_id`로 통일. 합성테스트로 (a)크로스카테고리 동명 각각 수집 (b)동일(cat,brand,model) dedup 유지 확인.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py), [pipeline/harvest_tents.py](pipeline/harvest_tents.py), [pipeline/refresh.py](pipeline/refresh.py) [lane:C39]

---

### [L-223] ✅ 분석완료(무효, C9) — `fill_whitelist_specs.py` `fill_one()` — `valid` 필터 없어 invalid 스펙 존재 시 재보강 영구 차단

- **영역:** 백엔드 — 스펙 보강
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `have` 집합 조회 시 `valid=0` 레코드도 포함 → 해당 metric key를 `have`에 추가 → 더 나은 값으로 교체 기회 영구 상실.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 70 — `WHERE psv.product_id=?` 에 `AND psv.valid=1` 미추가.
- **제안 수정:** `AND psv.valid=1` 추가하여 무효 레코드만 있는 metric은 재시도 허용.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 70 [lane:BACKEND]

---

## R-110 (프론트엔드) — 2026-06-13

### [M-257] — `draw()` — `data-mi` 인덱스가 `rows[]` 기준이지만 `d.models.indexOf(m)` 링크는 원본 배열 기준 혼용 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 카테고리 목록
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 필터/정렬 적용 시 카드의 `href="/item/{slug}/item-{d.models.indexOf(m)}.html"` 링크(원본 인덱스 기준)와 `data-mi="${i}"` onclick 인덱스(rows[] 기준)가 서로 다른 기준을 사용. `href` 공유/즐겨찾기는 원본 인덱스로 정적 상세페이지에 정확히 도달하나, `.pli-wish` 버튼의 `rows[+btn.dataset.mi]` 참조는 `rows`가 필터에 의해 subset이므로 실제로는 올바른 item을 가리킴. 그러나 `draw()`를 연속 두 번 호출하면(예: 필터 해제 직후 정렬 변경) 이전 이벤트 핸들러의 클로저가 이전 `rows`를 참조하는 문제가 잠재적으로 남음(이전 `innerHTML` 교체 후 새 querySelectorAll로 핸들러를 재등록하므로 실제론 대부분 안전하나, `pli.onclick`은 `rows` 클로저를 공유함).
- **원인:** [site/app.js](site/app.js) line 2586 — `data-mi="${i}"`(rows 인덱스) vs line 2586 `d.models.indexOf(m)` (원본 인덱스) 두 체계를 HTML 한 요소 안에 혼용. 명시적 문서화 없음.
- **제안 수정:** 주석으로 두 인덱스 체계를 명확히 분리 표기하거나, `data-oi="${d.models.indexOf(m)}"` 별도 attribute로 구분.
- **파일:** [site/app.js](site/app.js) line 2586 [lane:CORE]

---

### [M-258] — `draw()` — `star[0]`이 undefined일 때 `STATE.sortKey = "spec:undefined"` 문자열 저장 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 카테고리 초기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `d.metrics`에 `is_star=true` 항목이 하나도 없는 카테고리(신규 카테고리·데이터 누락)에서 `STATE.sortKey = "spec:" + (star[0] && star[0].key)` 표현식이 `"spec:undefined"` 문자열을 저장. 이후 `defaultSortKey()`도 동일 값 반환 → URL 직렬화에 `sort=spec:undefined` 등장하고, `draw()` 내 `cellVal(m, "spec:undefined")`는 항상 null 반환 → 데이터부족 제외 모드(`qExclude=true`) 시 전체 목록이 빈 화면으로 렌더됨.
- **원인:** [site/app.js](site/app.js) line 1493 — `"spec:" + (star[0] && star[0].key)` 에서 `star[0]` falsy일 때 `"spec:false"` 아닌 `"spec:undefined"`. `&&` 단락 평가가 `undefined`를 반환.
- **제안 수정:** `star.length ? "spec:" + star[0].key : "price"` 등 명시적 폴백 추가.
- **파일:** [site/app.js](site/app.js) line 1493 [lane:CORE]

---

### [M-259] ✅ 해결완료(2026-06-13) — `_showAuthGateModal()` — ESC 키 리스너 모달 닫힌 후 미제거 (다중 등록 누적)

- **영역:** 프론트엔드 — 인증 게이트 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `requireLogin()` → `_showAuthGateModal()` 호출 시마다 `document.addEventListener('keydown', onKey)` 추가. 모달 배경 클릭 또는 취소 버튼으로 닫으면 `onKey` 제거되지 않음. `m.onclick`(배경 클릭)과 `.agm-cancel.onclick`은 `close()`만 호출하고 `document.removeEventListener`를 부르지 않아 ESC 리스너가 누적됨. 로그인 게이트를 10회 열고 닫으면 10개의 orphan keydown 핸들러가 남음.
- **원인:** [site/app.js](site/app.js) line 131-133 — `close = () => m.remove()` 에 `document.removeEventListener('keydown', onKey)` 미포함. line 137에서 `.agm-btn` 클릭 시만 제거.
- **제안 수정:** `close` 함수에 `document.removeEventListener('keydown', onKey)` 추가.
- **파일:** [site/app.js](site/app.js) line 131 [lane:CORE]

---

### [L-224] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — openProduct는 매 호출 modal.innerHTML 재생성(2156)으로 구 .spec-tip-btn 리스너 폐기, 버블은 싱글톤 hide(M-186). 누적 없음. — `openProduct()` — 동일 모달 재사용 시 이전 `spec-tip-bubble` 이벤트 핸들러 미정리

- **영역:** 프론트엔드 — 상품 상세 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `openProduct()` 첫 호출 시 `#spec-tip-bubble` div 생성 후 이벤트 핸들러(`mouseenter/mouseleave/focus/blur/onclick`)를 `.spec-tip-btn`마다 등록. 모달 닫기는 `modal.classList.remove("on")`으로만 처리하고 `innerHTML`은 다음 `openProduct()` 호출 시 덮어쓰기. `_tipBubble` 자체는 DOM에 잔존. 두 번째 상품 열기 시 첫 번째의 `.spec-tip-btn` 참조를 가진 핸들러는 이미 사라졌으나, `_tipBubble.style.display` 상태가 `"block"`인 채 남아 다음 모달 오픈 시 이전 상품 툴팁이 잠시 보임.
- **원인:** [site/app.js](site/app.js) line 2137 — `hideTip()` 호출이 `close()` 내부에 없어 모달 닫힐 때 툴팁 숨김 미보장.
- **제안 수정:** `close()` 함수에 `hideTip()` 추가.
- **파일:** [site/app.js](site/app.js) line 2110 [lane:CORE]

---

### [L-225] ✅ 검토완료·현행유지(2026-06-14, E·코드 실대조) — push-denied는 코드상 '1'만 기록(3769), getItem truthy 체크 정확. 타 truthy 값 미발생. 오탐. — `requestPushSubscription()` — `push-denied` localStorage 값이 "1" 이외 truthy 값이어도 조기 반환

- **영역:** 프론트엔드 — 푸시 구독
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `localStorage.getItem("push-denied")` 는 문자열 `"1"` 외에 임의 truthy 문자열이 들어가도 즉시 반환. 현재 코드는 `localStorage.setItem("push-denied", "1")`로 항상 `"1"`을 저장하므로 실제 문제는 없으나, 외부 확장/개발자 도구로 `"true"` 등 값이 들어가면 `getItem` truthy 판정이 그대로 통과해 정상 구독 불가 상태가 영속됨. 더 큰 문제는 `requestPushSubscription` 실패 시 예외가 `console.warn`만 출력하고 `push-denied` 플래그를 세우지 않아 다음 찜 토글마다 권한 요청 팝업이 반복됨.
- **원인:** [site/app.js](site/app.js) line 3547 — `catch(err)` 블록에서 `localStorage.setItem("push-denied", "1")` 없음. 권한 거부 시(line 3540)만 플래그 설정.
- **제안 수정:** `catch` 블록에도 `localStorage.setItem("push-denied", "1")` 추가하거나 재시도 횟수 제한.
- **파일:** [site/app.js](site/app.js) line 3547 [lane:CORE]

---

### [L-226] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조) — loginHref 부재. — `_showAuthGateModal()` — `loginHref` 변수 계산 후 미사용 (dead code)

- **영역:** 프론트엔드 — 인증 게이트 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** line 121에서 `const loginHref = location.pathname.split('/').slice(0, -1).map(() => '..').join('/') || '.'` 로 상대경로를 계산하지만, 실제 `<a href="...">` 는 line 127의 `prefix` 변수를 사용. `loginHref`는 선언만 하고 이후 어디서도 참조되지 않아 dead code.
- **원인:** [site/app.js](site/app.js) line 121 — 리팩토링 과정에서 `loginHref`를 `prefix`로 교체했으나 이전 변수 선언 제거 누락.
- **제안 수정:** line 121의 `const loginHref = ...` 선언 제거.
- **파일:** [site/app.js](site/app.js) line 121 [lane:CORE]



---

## R-110 (백엔드) — 2026-06-13

### [M-260] ✅ 해결완료(2026-06-13, C15) — `star_catalog.py` `main()` — `price_observations` 쿼리에 `valid=1` 필터 없어 이상치 가격으로 별점 왜곡

- **영역:** 백엔드 — 별점 카탈로그
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `flag_price_outliers`로 무효화된 이상 가격(`valid=0`)이 `price_observations` 집계에 포함 → 잘못된 최저가로 별점 산정.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 57–63 — `SELECT MIN(price_krw) FROM price_observations`에 `WHERE valid=1` 없음.
- **제안 수정:** `WHERE valid=1` 추가.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 57 [lane:BACKEND]

---

### [L-227] — `backfill_capacity.py` `main()` — 전 카테고리 대상으로 capacity 추정하여 비텐트 제품에 오기재

- **영역:** 백엔드 — 용량 보강
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 침낭/의자/아이스박스 등 "2인용", "2P" 모델명을 가진 비텐트 제품에 occupancy capacity 값이 삽입됨 → 이후 `validate_ranges.py`가 다시 NULL로 복구하는 쓸모없는 write-erase 사이클.
- **원인:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 38 — 카테고리 필터 없이 `WHERE capacity IS NULL` 전체 조회.
- **제안 수정:** 텐트 카테고리만 대상으로 `JOIN categories c ON c.id=p.category_id WHERE c.name_ko LIKE '%텐트%'` 추가.
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 38 [lane:BACKEND]


---

## R-110 (프론트엔드) — 2026-06-13

### [M-261] ✅ 해결완료(2026-06-13) — `openFromSearch` — ESC 키 닫기 시 `restore()` 미호출로 STATE.slug/data 오염 잔류

- **영역:** 프론트엔드 — 검색 연동
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 검색 결과 상품 모달을 ESC로 닫으면 `restore()`가 호출되지 않아 `STATE.slug`와 `STATE.data`가 검색 상품의 카테고리로 유지됨 → 이후 홈 페이지 상품 렌더링 오작동.
- **원인:** [site/app.js](site/app.js) line 1138–1145 — `openFromSearch`의 restore 래퍼가 `xbtn.onclick`/`modal.onclick`만 감싸고 `onKey` ESC 경로는 미처리.
- **제안 수정:** ESC `onKey` 리스너도 교체하여 `restore()` → 원래 `close()` 순서로 호출.
- **파일:** [site/app.js](site/app.js) line 1138 [lane:CORE]

---

### [M-262] ✅ 해결완료(2026-06-13) — `openFromSearch` — 모달 중첩 열기 시 첫 번째 restore가 원본 대신 중간 STATE 복원

- **영역:** 프론트엔드 — 검색 연동
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 첫 검색 결과 모달 열린 상태에서 다른 결과 클릭 시 `openFromSearch`가 현재(이미 교체된) STATE를 `prev`로 저장 → 첫 모달 닫기 시 원본이 아닌 첫 검색 결과 STATE로 복원.
- **원인:** [site/app.js](site/app.js) line 1128 — `prev` 캐시가 스택 방식이 아닌 단순 덮어쓰기.
- **제안 수정:** 원본 STATE를 최초 1회 캐시하거나, 모달 열린 동안 검색 목록 클릭 비활성화.
- **파일:** [site/app.js](site/app.js) line 1128 [lane:CORE]

---

### [L-228] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — 가격 슬라이더는 M-570 가드(1669)로 lo>=hi 시 스킵. 오탐. — 가격 슬라이더 — `lo === hi` 시 `STATE.range[key] = {}` 빈 객체로 "가격 ~" 칩 표시

- **영역:** 프론트엔드 — 필터 슬라이더
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 최소/최대 슬라이더를 같은 값으로 맞추면 `STATE.range[key]`가 `{}` 빈 객체가 되어 활성 필터 칩에 "가격 ~" 표시 (min/max 모두 undefined).
- **원인:** [site/app.js](site/app.js) line 1783–1793 — `lo === hi` 엣지케이스 미처리, min/max 둘 다 경계조건에 걸려 기록 안 됨.
- **제안 수정:** `lo === hi` 시 min/max 모두 `toStateVal(lo)` 저장 또는 슬라이더 크로스 방지.
- **파일:** [site/app.js](site/app.js) line 1783 [lane:CORE]

---

### [L-229] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — renderActiveFilters가 min/max 모두 null인 range 칩 스킵(M-303, 1983). 오탐. — `renderActiveFilters` — `STATE.range[k]`에 min/max 모두 없을 때 칩 표시 생략 없음

- **영역:** 프론트엔드 — 활성 필터 칩
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `STATE.range[k]`가 `{}` (min/max 모두 undefined)이면 칩 텍스트가 "가격 ~"으로 표시되어 사용자 혼란.
- **원인:** [site/app.js](site/app.js) line 1876 — `r.min == null && r.max == null` 케이스 칩 렌더링 건너뛰기 없음.
- **제안 수정:** 칩 생성 전 `if (r.min == null && r.max == null) continue` 추가.
- **파일:** [site/app.js](site/app.js) line 1876 [lane:CORE]


---

## R-111 (백엔드) — 2026-06-13

### [M-263] ✅ 해결완료(2026-06-13, C13) — `normalize_models.py` `flag_price_outliers()` — `valid=1` 일괄 리셋으로 외부 무효화 행 복원

- **영역:** 백엔드 — 가격 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `UPDATE price_observations SET valid=1` (무조건) 실행 → 외부에서 `valid=0`으로 수동 플래그한 가격 관측값이 복원됨. 이후 단계가 이 행을 재평가해도 step B/C 범위 내 이상치만 재무효화, 그 외 수동 처리값은 영구 복원.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 105 — `WHERE` 없는 전체 리셋.
- **제안 수정:** `manual_invalid` 컬럼 추가 또는 외부 무효화 보호 메커니즘 문서화.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 105 [lane:BACKEND]

---

### [M-264] ✅ 해결완료(2026-06-13, C13) — `normalize_models.py` `normalize_db()` — `canon`/`name` 모두 빈 문자열 시 `"#pcode"` 비정상 모델명

- **영역:** 백엔드 — 모델 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canon=""`이고 `name`도 None/빈값이면 폴백이 `f"#{pc}"`가 되어 DB에 `"#16247885"` 같은 비정상 모델명 삽입.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 174–175 — `f"{canon or name}#{pc}"` 에서 양쪽 모두 falsy 시 `f"#{pc}"` 생성.
- **제안 수정:** `f"{name or 'unknown'}#{pc}"` 으로 의미있는 폴백 보장.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 174 [lane:BACKEND]

---

### [M-265] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `validate_db()` — 리셋+재검증 비원자적 실행으로 예외 시 전체 `valid=1` 상태 잔류

- **영역:** 백엔드 — 데이터 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** line 416 리셋 후 line 420 conflict 재적용 전 예외 발생 시 DB 전체 `product_spec_values.valid=1` 상태로 커밋됨 (rollback 없음).
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416–424 — 리셋+재검증 블록을 `SAVEPOINT`/명시적 트랜잭션으로 감싸지 않음.
- **제안 수정:** `SAVEPOINT validate_reset` / `RELEASE validate_reset` 또는 예외 시 `ROLLBACK TO validate_reset` 적용.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 [lane:BACKEND]

---

### [M-266] ✅ 분석완료(무효, C6) — `resolve_duplicates.py` `resolve()` — `GROUP BY capacity` (NULL ≠ NULL)로 NULL-capacity 중복 미탐지

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `capacity=NULL`인 의자/랜턴 등 카테고리에서 동일 모델 중복 제품이 `HAVING COUNT(*) >= 2` 미통과 → 중복 해소 안 됨.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 29–33 — `GROUP BY brand_id, canonical_model, capacity` — SQLite에서 NULL은 각각 별도 그룹.
- **제안 수정:** `GROUP BY brand_id, canonical_model, IFNULL(capacity, -1)` 로 변경.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 29 [lane:BACKEND]


---

## R-111 (프론트엔드) — 2026-06-13

### [H-78] ✅ 해결완료(2026-06-13) — 공유 세트 URL — `decodeURIComponent(escape(atob(...)))` 한글 멀티바이트 처리 오류

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 세트 제목에 한글 포함 시 `escape(atob(vsFixed))` 에서 멀티바이트 UTF-8 시퀀스가 손상 → `URIError` 또는 깨진 텍스트로 공유 세트 복원 실패.
- **원인:** [site/app.js](site/app.js) line 4104 — `escape()`은 Latin-1만 처리, UTF-8 한글 바이너리 문자열에 부적합.
- **제안 수정:** `new TextDecoder().decode(Uint8Array.from(atob(vsFixed), c => c.charCodeAt(0)))` 으로 교체. 인코딩 측도 `btoa(String.fromCharCode(...new TextEncoder().encode(...)))` 으로 통일.
- **파일:** [site/app.js](site/app.js) line 4104 [lane:CORE]

---

### [M-267] ✅ 해결완료(2026-06-13) — `openProduct` — `STATE.data` null 시 `d.metrics` 접근 TypeError 크래시

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 JSON fetch 실패 또는 계정 페이지에서 찜 카드 클릭 후 fetch 중 `openProduct` 재호출 시 `STATE.data`가 null → `d.metrics` 에서 `TypeError` 크래시, 모달 열리지 않음.
- **원인:** [site/app.js](site/app.js) line 2002 — `const d = STATE.data` 후 null guard 없이 `d.metrics.filter(...)` 접근.
- **제안 수정:** `if (!d || !d.metrics) return;` 추가.
- **파일:** [site/app.js](site/app.js) line 2002 [lane:CORE]

---

### [L-230] — `passRange` — 가격 미등록 상품이 가격 필터 적용 시 조용히 제외됨

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `price_min=null` 상품이 가격 슬라이더 조작 시 `v == null → return false` 로 결과에서 제외됨. 사용자가 최저 0원 필터를 설정해도 가격 미등록 상품은 숨겨지며 안내 없음.
- **원인:** [site/app.js](site/app.js) line 1953–1954 — null 스펙을 무조건 range 실패로 처리.
- **제안 수정:** `v == null` 시 양방향 제약(min+max 모두)이 있을 때만 제외, 또는 "N개 가격 정보 없음" 안내 칩 추가.
- **파일:** [site/app.js](site/app.js) line 1953 [lane:CORE]


---

## R-112 (백엔드) — 2026-06-13

### ✅ 해결완료(2026-06-13) [M-268] — `graph_pipeline.py` `fetch_detail()` — `spec["fn"]` KeyError (enrich_details.py 미수정 버전)

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `TENT_MAP` 항목에 `derive`도 `fn`도 없을 때 `P.FN[spec["fn"]](raw)` 에서 `KeyError`. `enrich_details.py`(H-58)는 수정됐지만 `graph_pipeline.py`는 동일 패턴이 미수정.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 97 — 3-way branch(derive/fn/continue) 없이 `spec["fn"]` 직접 접근.
- **제안 수정:** `enrich_details.py`의 `derive`/`fn` 가드 패턴 동일 적용.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 97 [lane:BACKEND]

---

### [M-269] ✅ 해결완료(2026-06-13, C7) — `graph_full.py` `enrich_node()` — 4개 스레드 동시 SQLite 쓰기로 `OperationalError: database is locked` 무음 실패

- **영역:** 백엔드 — 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `ENRICH_WORKERS=4` 병렬 스레드가 각자 SQLite 커넥션으로 동시 쓰기 → WAL 락 타임아웃(30s) 초과 시 `OperationalError` → 해당 제품 보강 데이터 무음 유실.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 109–119 — 다중 스레드 동시 DB 쓰기, 재시도 로직 없음.
- **제안 수정:** `ENRICH_WORKERS=1` 또는 결과를 메모리에 수집 후 단일 직렬 커밋.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 109 [lane:BACKEND]

---

### [M-270] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `rank_normalize()` — 동점 다수 시 모두 `qi=0.5` 배정 (최적 1.0 미달)

- **영역:** 백엔드 — 가치 평가
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 내 모든 제품의 스펙이 동일할 때(예: 전부 1000g) `qi=0.5` 중간값 배정 → ★3 이하 평점. 실제로 모두 동등하게 최적이므로 ★5가 적절.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 109–114 — 동점 감지 없이 avg_rank/total로 qi 계산.
- **제안 수정:** 모든 rank가 같으면 `qi = 1.0` 일괄 배정.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 109 [lane:BACKEND]

---

### [M-271] ✅ 해결완료(2026-06-13, C8) — `verify_internal.py` `check_duplicate_canonical()` — `GROUP_CONCAT(id ORDER BY id)` SQLite <3.44 미지원

- **영역:** 백엔드 — 내부 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** SQLite <3.44 환경(GitHub Actions ubuntu-latest = 3.37~3.42)에서 `OperationalError` 또는 정의되지 않은 순서로 반환.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 127–133 — `GROUP_CONCAT` 내 `ORDER BY`는 SQLite 3.44+ 전용.
- **제안 수정:** `GROUP_CONCAT(id)` 후 Python에서 `sorted(ids_str.split(","))` 처리.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 127 [lane:BACKEND]

---

### [L-231] ✅ 해결완료(2026-06-13, C20) — `check_export.py` `main()` — JSON 파싱 실패 시 무음 스킵으로 CI 게이트 0 반환

- **영역:** 백엔드 — 배포 게이트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 카테고리 JSON 파일이 손상되어 파싱 실패해도 경고 출력 후 `[]` 반환 → CI 게이트 exit 0으로 통과, 빈 데이터 배포.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 82 — 파싱 실패를 `violations`에 반영하지 않아 exit code에 영향 없음.
- **제안 수정:** 파싱 실패 파일 별도 추적 후 1개라도 있으면 exit 1.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 82 [lane:BACKEND]


---

## R-112 (프론트엔드) — 2026-06-13

### [M-272] ✅ 해결완료(2026-06-13) — `renderAccount` 세트 삭제 버튼 — 빠른 연속 클릭 시 `data-si` 스탈 인덱스로 잘못된 세트 삭제

- **영역:** 프론트엔드 — 장비 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 세트 삭제 후 `renderAccount()` 재렌더 중 두 번째 빠른 클릭이 이전 렌더의 `data-si`(배열 인덱스)를 사용 → 의도한 세트 대신 다른 세트 삭제.
- **원인:** [site/app.js](site/app.js) line 3465 — 삭제 버튼 `data-si`가 위치 인덱스, 안정적 ID 아님.
- **제안 수정:** `data-si`에 `s.id` 저장 후 `arr.findIndex(x => x.id === b.dataset.si)` 로 조회.
- **파일:** [site/app.js](site/app.js) line 3465 [lane:CORE]

---

### [M-273] ✅ 해결완료(2026-06-13) — auth-intent 복원 — `pathname` 비교로 다른 카테고리 SPA URL 동일 판정 오인식

- **영역:** 프론트엔드 — 인증 인텐트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `category.html?cat=tent`에서 찜 클릭 → 로그인 → `category.html?cat=sleeping-bag`으로 이동 시 pathname만 비교하므로 인텐트 복원 → 현재 보는 카테고리가 아닌 텐트 상품을 찜하는 오동작.
- **원인:** [site/app.js](site/app.js) line 4083 — `new URL(...).pathname` 비교, `?cat=` 쿼리 파라미터 무시.
- **제안 수정:** `pathname + search` 또는 `href` 전체 비교.
- **파일:** [site/app.js](site/app.js) line 4083 [lane:CORE]

---

### [M-274] ✅ 해결완료(2026-06-13) — 세트 공유 URL 생성 — `unescape()` 사용 deprecated + URL 길이 미검사

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** (1) `unescape()` deprecated — strict mode 일부 환경에서 제거됨. (2) 20개 아이템 세트는 공유 URL이 2000자 초과 → 일부 브라우저/링크 단축기 파손.
- **원인:** [site/app.js](site/app.js) line 3454 — `btoa(unescape(encodeURIComponent(...)))` — deprecated API 사용, 길이 가드 없음.
- **제안 수정:** `btoa(String.fromCharCode(...new TextEncoder().encode(...)))` 교체. URL 2000자 초과 시 경고 토스트.
- **파일:** [site/app.js](site/app.js) line 3454 [lane:CORE]


---

## R-113 (백엔드) — 2026-06-13

### [M-275] ✅ 해결완료(2026-06-13, C39) — `harvest_tents.py` `ingest()` — `seen_names` 모델명만으로 중복 체크해 다른 브랜드 동명 모델 오탐 차단

- **영역:** 백엔드 — 텐트 수확
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "코베아 텐트X"와 "힐레베르그 텐트X"처럼 서로 다른 브랜드의 동명 모델이 있을 때 두 번째 제품이 `dup_name`으로 잘못 차단됨.
- **원인:** `seen_names`가 평면 `{model}` 키. `harvest_tents.ingest`·`multicat.ingest_one`·`refresh.snapshot`가 **동일 set 공유**라 한 파일만 못 바꿈(M-256과 동일 근본원인).
- **해결(M-256/L-241과 동시):** 3파일 동시변경 — 키를 `(category_id, brand, model)` 튜플로. `ingest` 체크/add를 `(cid, brand, model)`로, 빌더 SQL 3곳을 `brands.name_ko` 조인으로 통일. 합성테스트로 (c)크로스브랜드 동명 각각 수집 + 동일 브랜드 동명 재수확 dedup 유지 확인.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py), [pipeline/multicat.py](pipeline/multicat.py), [pipeline/refresh.py](pipeline/refresh.py) [lane:C39]

---

### [M-276] ✅ 해결완료(2026-06-13, C4) — `normalize.py` `parse_water_head()` — OCR/오타로 음수값 입력 시 음수 내수압 그대로 저장

- **영역:** 백엔드 — 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `-1500mm` 같은 OCR 오류/오타 포함 raw 값이 음수 내수압으로 DB에 저장 → 검증 없이 사용자에게 표시.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 61 — `parse_water_head`가 `_num(raw)` 결과를 부호 검사 없이 반환.
- **제안 수정:** `return abs(val) if val is not None else None` 또는 `if val < 0: return None`.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 61 [lane:BACKEND]

---

### [M-277] ✅ 해결완료(2026-06-13, C12) — `promote_catalog.py` `main()` — `UPDATE SET curation_status='pending'` 전체 리셋으로 `rejected` 상품 복원

- **영역:** 백엔드 — 카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `promote_catalog.py` 실행마다 수동으로 `rejected` 처리한 상품이 `pending`으로 초기화 → 다음 검수 사이클에서 노출 위험.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31 — `WHERE curation_status != 'rejected'` 조건 없는 전체 리셋.
- **제안 수정:** `UPDATE products SET curation_status='pending' WHERE curation_status != 'rejected'` 로 변경.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31 [lane:BACKEND]

---

### [L-232] ✅ 해결완료(2026-06-13, C16) — `brand_filter.py` `main()` — `drop_n` 출력값이 UPDATE 이전 SELECT 카운트로 실제 변경 행수와 상이

- **영역:** 백엔드 — 브랜드 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** "N개 제품 rejected" 메시지가 실제 UPDATE 영향 행이 아닌 사전 SELECT 카운트를 출력 → 이미 rejected 상태인 행 포함 시 숫자 과대 표시.
- **원인:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 102 — `drop_n`을 UPDATE rowcount 대신 사전 SELECT에서 계산.
- **제안 수정:** `cur = con.execute(UPDATE ...); drop_n = cur.rowcount` 로 실제 영향 행수 사용.
- **파일:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 96 [lane:BACKEND]


---

## R-113 (프론트엔드) — 2026-06-13

### [M-278] ✅ 해결완료(2026-06-13) — `openFromSearch` — 백드롭 클릭 시 `origM` 재호출로 `onKey` 이중 제거, 이후 ESC 작동 불가

- **영역:** 프론트엔드 — 검색 연동
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 검색 결과 모달을 백드롭 클릭으로 닫은 후 키보드 ESC가 동작하지 않음. 래핑된 `onclick`이 `restore()` + `origM()` 순서로 `close()` 두 번 호출 → `keydown` 리스너 두 번 제거 시도, 이후 ESC 이벤트 무반응.
- **원인:** [site/app.js](site/app.js) line 1143–1165 — `openFromSearch`가 백드롭 onclick을 이중 래핑하고 `origM` 내부 `close()` 호출을 미고려.
- **제안 수정:** `close()` 호출을 단일 경로로 일원화, `restore()` 후 `origM` 재호출 방지.
- **파일:** [site/app.js](site/app.js) line 1143 [lane:CORE]

---

### [L-233] — `showToast` — 토스트 표시 중 재호출 시 fade-in 애니메이션 스킵

- **영역:** 프론트엔드 — UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 토스트가 이미 표시 중일 때 `showToast` 재호출 시 이전 `opacity`/`transform` 상태가 초기화되지 않아 fade-in 없이 즉시 표시.
- **원인:** [site/app.js](site/app.js) line 476–488 — CSS 전환 재시작 전 reflow 강제 없음, 스타일 리셋 없음.
- **제안 수정:** `t.style.transition = "none"` → 스타일 리셋 → `t.offsetHeight` (강제 reflow) → 전환 복원.
- **파일:** [site/app.js](site/app.js) line 476 [lane:CORE]

---

### [L-234] — `draw()` 상품 카드 — Ctrl+클릭/가운데 클릭 시 새 탭 열기 차단

- **영역:** 프론트엔드 — 상품 목록
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 상품 카드(`<a class="pli">`)의 onclick이 `e.preventDefault()` 무조건 호출 → Ctrl+클릭/⌘+클릭/가운데 클릭으로 새 탭에서 상세 페이지 열기 불가, 모달만 열림.
- **원인:** [site/app.js](site/app.js) line 2624 — 수정자 키 체크 없음.
- **제안 수정:** `if (e.ctrlKey || e.metaKey || e.shiftKey) return;` 추가 후 `e.preventDefault()`.
- **파일:** [site/app.js](site/app.js) line 2624 [lane:CORE]


---

## R-114 (백엔드) — 2026-06-13

### [H-79] ✅ 해결완료(2026-06-13, BACKEND) — `harvest_tents.py` `ingest()` — INSERT OR IGNORE 후 SELECT 불일치로 pid 미회수 → 고아 행
> 신규 삽입 시 `cur.rowcount`로 판정 후 `cur.lastrowid`로 pid 직접 회수(IS NULL SELECT 의존 제거), IGNORE(중복)된 경우에만 SELECT 폴백. 검증: 신규삽입 lastrowid 유효, year세팅 기존행 옆 신규NULL행도 정상 회수.

- **영역:** 백엔드 — 크롤링
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 신규 product가 DB에 INSERT 되지만 pid를 가져오지 못해 이후 specs/images 등 연결 INSERT가 모두 실패, 데이터 공백 발생.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 127–130 — INSERT 구문에 `model_year`, `variant` 컬럼이 없으나 SELECT WHERE절에 `model_year IS NULL AND variant IS NULL` 조건이 있어 갓 삽입된 행을 못 찾음.
- **제안 수정:** SELECT 조건을 INSERT 기준 컬럼(고유 식별자)으로만 제한하거나 `RETURNING id`를 사용.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 127 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-80] — `harvest_tents.py` `main()` — `stats["ok"] >= target` 체크가 쿼리 루프 상단에만 → 조기 종료 불가

- **영역:** 백엔드 — 크롤링
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 목표치에 도달해도 현재 쿼리의 모든 페이지를 끝까지 긁고 나서야 다음 쿼리 시작 시점에 체크 → 불필요한 크롤링 지속, 과도한 요청 발생.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 210 — break 조건이 inner 페이지 루프 밖 outer 쿼리 루프 상단에만 위치.
- **제안 수정:** inner 페이지 루프 내부에도 `if stats["ok"] >= target: break` 추가.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 210 [lane:BACKEND]

---

### [M-279] ✅ 해결완료(기존확인, C3) — `export_site.py` `export()` — gf_code 서브쿼리가 `curation_status='verified'` 필터 누락

- **영역:** 백엔드 — 사이트 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** pending/rejected 상태 product의 gf_code가 대표 코드로 선택될 수 있음 → 미검수 데이터 노출 위험.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 139–142 — gf_code 서브쿼리 WHERE절에 `curation_status='verified'` 조건 없음.
- **제안 수정:** 서브쿼리에 `AND curation_status='verified'` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 139 [lane:BACKEND]

---

### [M-280] ✅ 분석완료(by-design, C18) — `add_manual_models.py` `upsert_model()` — `rep_product_id` 무조건 덮어쓰기로 외부 canonical 지정 소실

- **영역:** 백엔드 — 수동 데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DELETE+INSERT 방식으로 upsert 시 기존에 외부에서 지정된 `rep_product_id`가 항상 초기값으로 리셋됨.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 73–78 — DELETE 후 INSERT로 모든 컬럼 재기입, `rep_product_id` 보존 로직 없음.
- **제안 수정:** INSERT OR REPLACE 대신 UPDATE ... WHERE 후 INSERT OR IGNORE, 또는 `rep_product_id` 기존값 보존 조건 추가.
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 73 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-281] — `column_fixes.py` `main()` — channel UPDATE에 `AND channel IS NULL` 가드 없어 기존 채널 덮어씀

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `danawa_search`, `수동` 등 이미 올바른 채널이 지정된 행도 패턴 매칭 시 잘못 덮어써짐.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 30–33 — UPDATE WHERE절에 `AND channel IS NULL` 없음.
- **제안 수정:** UPDATE 조건에 `AND channel IS NULL` 추가.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 30 [lane:BACKEND]

---

### [M-282] ✅ 분석완료(by-design, C11) — `crosssource.py` `upsert()` — `overwrite=True` 시 DELETE 범위가 전체 source_id → 연관 데이터 과삭제

- **영역:** 백엔드 — 크로스소스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** overwrite 모드에서 특정 source만 재삽입해야 하는데 해당 product의 모든 source_id 데이터를 삭제, 다른 소스 데이터 소실.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 156 — DELETE WHERE에 `AND source_id=?` 조건 없음.
- **제안 수정:** `DELETE ... WHERE product_id=? AND source_id=?` 로 범위 한정.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 156 [lane:BACKEND]

---

### [L-235] ✅ 분석완료(by-design, C15) — `star_catalog.py` `main()` — `star_of` 딕셔너리 계산 후 DB 미저장, 결과 무시

- **영역:** 백엔드 — 별점 집계
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 지표별 star 점수를 계산하지만 DB에 저장하지 않아 모든 계산이 유실.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 76 — `star_of` 계산 후 INSERT/UPDATE 구문 없음.
- **제안 수정:** `star_of` 딕셔너리를 순회하며 해당 테이블에 upsert.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 76 [lane:BACKEND]

---

## R-114 (프론트엔드) — 2026-06-13

### [M-283] ✅ 해결완료(2026-06-13) — `_showAuthGateModal` — `loginHref` 계산 후 미사용, 깊은 경로에서 `./account.html` 오해석

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `/brand/`, `/recommend/` 등 하위 경로에서 로그인 링크가 `./account.html`로 생성되어 잘못된 경로로 이동 가능.
- **원인:** [site/app.js](site/app.js) line 136 — `loginHref` 변수를 계산하지만 실제 href에는 `prefix` 로직만 사용, 경로 깊이 미반영.
- **제안 수정:** href에 `loginHref` 사용 또는 절대경로 `/account.html` 사용.
- **파일:** [site/app.js](site/app.js) line 136 [lane:CORE]

---

### [M-284] ✅ 해결완료(2026-06-13) — `openProduct` — wish 버튼 `innerHTML` 선 리셋으로 미로그인 시 `on` 클래스 소실

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 상품 모달에서 로그인하지 않은 상태로 찜 버튼 클릭 시 `innerHTML` 리셋으로 `on` 클래스가 제거되어 이미 찜한 상품임에도 미찜 상태로 표시.
- **원인:** [site/app.js](site/app.js) line 2092–2094 — `toggleWishWithHint`의 auth 체크 이전에 `innerHTML` 무조건 재설정, 조기 반환 후 상태 복구 없음.
- **제안 수정:** auth 체크 후 리셋하거나 조기 반환 경로에서 원래 상태 복원.
- **파일:** [site/app.js](site/app.js) line 2092 [lane:CORE]

---

### [M-285] — `saveSets` — `localStorage.setItem` try/catch 없어 QuotaExceededError 미처리 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 저장
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** localStorage 용량 초과 시(특히 Safari private 모드) 비잡힌 예외 발생, `addToSet`/`newSet` 등 호출부 크래시.
- **원인:** [site/app.js](site/app.js) line 475 — `setWish`(line 399) 등 타 저장 함수는 try/catch 존재하나 `saveSets`만 누락.
- **제안 수정:** `localStorage.setItem` 호출을 try/catch로 감싸고 실패 시 토스트 표시.
- **파일:** [site/app.js](site/app.js) line 475 [lane:CORE]

---

### [M-286] ✅ 해결완료(2026-06-13) — 공유 세트 import 핸들러 — `_accUser` 사용으로 `authReady` 이전 클릭 시 로그인 상태 오판

- **영역:** 프론트엔드 — 공유 세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 페이지 로드 직후(getSession 미완료 시점) import 버튼 클릭 시 로그인된 사용자도 "로그인 후 확인" 알림 표시, Supabase 동기화 건너뜀.
- **원인:** [site/app.js](site/app.js) line 4152–4159 — 동기 `window._accUser` 체크, `authReady()` await 없음.
- **제안 수정:** 핸들러를 async로 변경, `await window.authReady()` 후 `window.currentUser()` 사용.
- **파일:** [site/app.js](site/app.js) line 4152 [lane:CORE]

---

### [L-236] — `renderAccount` — 지역 `isLoggedIn` 변수가 전역 함수 섀도잉, 일관성 저하

- **영역:** 프론트엔드 — 계정 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `const isLoggedIn = !!window._accUser`가 전역 `window.isLoggedIn` 함수를 가림, 향후 auth 리팩터링 시 조용히 불일치 발생 위험.
- **원인:** [site/app.js](site/app.js) line 3086 — compat alias 직접 사용 + 동명 변수 선언.
- **제안 수정:** `const isLoggedIn = window.isLoggedIn()` 로 교체, 지역 변수 바인딩 제거.
- **파일:** [site/app.js](site/app.js) line 3086 [lane:CORE]

---

### [L-237] ✅ 해결완료(2026-06-14, A) — openProduct에서 d.models.indexOf(m) 1회 계산(mIdx) 후 재사용. — `openProduct` — `d.models.indexOf(m)` 이중 호출로 불필요한 선형 탐색 중복

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 템플릿 리터럴 내 동일 표현식 두 번 평가, 배열이 클 경우 미세 성능 저하.
- **원인:** [site/app.js](site/app.js) line 2062 — `d.models.indexOf(m)` 결과를 변수에 저장하지 않고 인라인 반복.
- **제안 수정:** `const modelIdx = d.models.indexOf(m)` 로 사전 추출 후 재사용.
- **파일:** [site/app.js](site/app.js) line 2062 [lane:CORE]


---

## R-115 (백엔드) — 2026-06-13

### [M-287] ✅ 해결완료(2026-06-13, C14) — `affiliate_links.py` `sample()` — `naver_fallback` KeyError: 쿠팡 직접링크 시 키 미존재

- **영역:** 백엔드 — 제휴 링크
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `coupang_url`이 있는 상품의 샘플 루프에서 `link['naver_fallback']` KeyError 발생, 제휴 링크 생성 전체 실패.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 — `naver_fallback` 키는 네이버 검색 폴백 분기에서만 설정, 쿠팡 직접링크 분기(line 48)에서는 미설정.
- **제안 수정:** `link.get('naver_fallback', '(직접링크)')` 로 변경.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 [lane:BACKEND]

---

### [M-288] ✅ 해결완료(2026-06-13, C4) — `normalize.py` `parse_weight()` — `g` 정규식이 `mg`(밀리그램) 매칭, 중량 1000배 오계산

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `"1500mg"` 같은 문자열이 1500g으로 파싱되어 중량 이상치 발생.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 35–37 — `mg` 단위 제외 조건 없음.
- **제안 수정:** `if "mg" in s: return None` 을 line 35 이전에 추가.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 35 [lane:BACKEND]

---

### [M-289] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `rank_normalize()` — 단일 모델 카테고리에서 자동 5점 부여

- **영역:** 백엔드 — 가치 지표
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 비교 대상이 1개뿐인 카테고리에서 해당 모델이 무조건 5점 별점을 받아 신뢰도 없는 최고점 노출.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 110–114 — `total=0` 시 `1.0` 반환, 비교 풀 크기 체크 없음.
- **제안 수정:** `compute_value_score()` 에서 `len(eligible) < 2` 인 경우 stars=None 반환.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 110 [lane:BACKEND]

---

### [M-290] ✅ 해결완료(2026-06-13, C17) — `multicat.py` `ingest_one()` — INSERT OR IGNORE 충돌 시 SELECT가 다른 상품 pid 반환, 스펙 덮어씀

- **영역:** 백엔드 — 다중 카테고리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 `(brand_id, model_name)` 충돌 시 두 번째 pcode의 스펙이 첫 번째 상품 레코드에 덮어써짐, 데이터 오염.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 169–170 — INSERT OR IGNORE 충돌 후 SELECT가 충돌 상품 id를 반환, 경고 없음.
- **제안 수정:** `rowcount==0`(충돌) 시 경고 로그 출력, `RETURNING id` 또는 `lastrowid` 활용.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 169 [lane:BACKEND]

---

### [L-238] ✅ 검토완료·현행유지(2026-06-14, D) — `normalize.py` `packed_volume_cm3()` — 2개 숫자 입력 시 평면 파우치도 원통으로 계산, ~6배 오차
> 검토결과 현행유지: M-221과 동일 이슈(packed_volume 2-숫자 원통가정). 도메인 적합 → 유지.

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"38 x 8"` 같은 평면형 수납 사이즈를 원통으로 오해석, 부피 최대 6배 과대 계산.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 159–161 — `φ`/`지름` 마커 없는 2-숫자 입력을 무조건 원통으로 처리.
- **제안 수정:** 명시적 원통 마커 없을 경우 `None` 반환.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 159 [lane:BACKEND]

---

### [L-239] ✅ 해결완료(2026-06-13, C23) — `seed_coupang.py` `build()` — `existing` dict 키 타입 불일치(str vs int) 잠재적 미스

- **영역:** 백엔드 — 쿠팡 시드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** CSV에서 읽은 `rep_product_id`(str)와 DB에서 온 `rid`(int)를 혼용, 향후 `existing.get(rid)` 직접 참조 시 항상 miss.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 57–68 — 타입 정규화 없음.
- **제안 수정:** CSV 읽기 시 `int(r["rep_product_id"])` 로 정규화, `existing.get(rid, "")` 사용.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 68 [lane:BACKEND]


---

## R-115 (프론트엔드) — 2026-06-13

### [H-81] ✅ 해결완료(2026-06-13) — `requestPushSubscription` — 알림 권한 `"default"` 거절을 `"denied"`와 동일 처리, 이후 프롬프트 영구 차단

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 사용자가 알림 권한 다이얼로그를 단순 닫기(default)해도 `push-denied=1` localStorage 기록, 이후 어떤 경우에도 알림 재요청 불가.
- **원인:** [site/app.js](site/app.js) line 3555 — `if (perm !== "granted")` 조건이 `"default"` 와 `"denied"` 모두 포착.
- **제안 수정:** `perm === "denied"` 일 때만 `push-denied` 설정, `"default"` 는 조용히 반환.
- **파일:** [site/app.js](site/app.js) line 3555 [lane:CORE]

---

### [M-291] ✅ 기구현(2026-06-13 검증) — `setupHomeSearch` `render()` — 검색 결과 패널 찜 버튼이 로그인 게이트 우회

- **영역:** 프론트엔드 — 홈 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 미로그인 사용자가 홈 검색 결과 패널에서 찜 버튼 클릭 시 로그인 요구 없이 localStorage에 바로 저장.
- **원인:** [site/app.js](site/app.js) line 1191–1199 — `.pli-wish` 핸들러가 `toggleWishWithHint` 대신 `getWish`/`setWish` 직접 호출, 1034번줄 자동완성은 게이트 정상 사용.
- **제안 수정:** line 1197–1198 의 인라인 wish 블록을 `toggleWishWithHint(item, btn)` 호출로 교체.
- **파일:** [site/app.js](site/app.js) line 1192 [lane:CORE]

---

### [M-292] ✅ 해결완료(2026-06-13) — `fmtVal` — 비숫자 값 입력 시 `v.toFixed is not a function` TypeError 크래시

- **영역:** 프론트엔드 — 데이터 포맷팅
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `"N/A"`, `"측정불가"` 등 문자열 값이 `fmtVal` 진입 시 `v.toFixed(2)` TypeError 발생, 상품 스펙 카드 렌더링 크래시.
- **원인:** [site/app.js](site/app.js) line 337 — `v == null` 체크만 있고 `isNaN` / `typeof` 가드 없음.
- **제안 수정:** 함수 상단 `if (v == null || isNaN(+v)) return "—";` 추가.
- **파일:** [site/app.js](site/app.js) line 337 [lane:CORE]

---

### [M-293] — `renderChips` — 활성 브랜드 칩 CSS 클래스 로직 반전, 선택된 칩 강조 표시 안 됨 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터 칩
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 현재 필터로 선택된 브랜드 칩에 활성 표시 클래스가 없고, 미선택 칩에 `" clear"` 클래스 부여 → 선택 상태 구분 불가.
- **원인:** [site/app.js](site/app.js) line 2725 — ternary 결과가 반전: `b === param` 이면 `""`, 아니면 `" clear"`.
- **제안 수정:** 활성 칩에 `" on"` 클래스 부여: `b === (params.get("b") || "") ? " on" : " clear"`.
- **파일:** [site/app.js](site/app.js) line 2725 [lane:CORE]

---

### [L-240] — `fmtVal` — g 단위 정수 중량에 `.toFixed(2)` 적용으로 `500.00g` 표시

- **영역:** 프론트엔드 — 데이터 포맷팅
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 중량 500g이 `500.00g` 으로 표시되는 등 불필요한 소수점 노출.
- **원인:** [site/app.js](site/app.js) line 337 — 단위 무관 일괄 `.toFixed(2)` 적용.
- **제안 수정:** `unit === "g"` 인 경우 `Math.round(v) + "g"` 사용 또는 소수부 0이면 생략.
- **파일:** [site/app.js](site/app.js) line 337 [lane:CORE]


---

## R-116 (백엔드) — 2026-06-13

### [H-82] ✅ 해결완료(2026-06-13, BACKEND) — `graph_pipeline.py` `persist()` — 무조건 DELETE로 이전 source_id=3/4 스펙 소실
> H-93과 함께 해결: assess가 기존 3/4 스펙을 실제 source_id로 specs에 적재 → persist DELETE→재INSERT 루프가 보존. DB복사본 E2E 검증(before=2,after=2).

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 반복 실행 시 이전 런에서 보강된 source_id=3/4 스펙이 삭제 후 재삽입 대상 미포함으로 영구 소실.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 163 — DELETE가 source_id=3/4 전체를 삭제하지만 `s["specs"]`는 이번 런에서 새로 작성된 항목만 포함.
- **제안 수정:** DELETE 범위를 재기입 대상 metric_id로 한정하거나, `assess()`에서 기존 source_id=3/4 스펙을 미리 로드.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 163 [lane:BACKEND]

---

### [H-83] ✅ 해결완료(2026-06-13, BACKEND) — `normalize_models.py` `flag_price_outliers()` — 수동 중앙값과 `statistics.median` 불일치로 시스템 간 이상가격 판정 불일치
> `med = statistics.median(prices)`로 verify_internal.py와 통일(하위중앙값 `prices[(n-1)//2]` 폐기). M-329 부수 해소. DB복사본 실행 정상(valid=0: 19→18, 오플래그 감소).

- **영역:** 백엔드 — 가격 정규화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `normalize_models.py`와 `verify_internal.py`가 동일 데이터셋에서 서로 다른 이상가격 경계를 산출, 한쪽 통과·다른쪽 실패 발생.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 127 — `prices[(len(prices)-1)//2]` 수동 하위 중앙값 vs `verify_internal.py` line 20 `statistics.median()` 평균 중앙값.
- **제안 수정:** `statistics.median(prices)` 로 통일.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 127 [lane:BACKEND]

---

### [H-84] ✅ 해결완료(2026-06-13, BACKEND) — `backfill_capacity.py` `main()` — 범위 외 파싱값 무음 폐기, 감사 불가
> `elif c is not None:` 분기로 범위 밖 값을 NULL 유지하되 `out_of_range`에 모아 요검토 로그 출력. 실DB 검증: 15건 표면화 — 다수가 cap_from_name 오파싱('코펠 20p'=조각수, 'G1500P'=모델코드, '86P'=SKU를 인원으로 오인) 드러남 → 별도 후속(L-신규: cap_from_name 'Np=조각수' 오탐).

- **영역:** 백엔드 — 용량 백필
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `"0P"`, `"0인용"` 등 범위 외 파싱값이 로그 없이 NULL 유지, 어떤 상품이 누락됐는지 알 수 없음.
- **원인:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 43 — `if c and 1 <= c <= 12:` 조건 외 경우 처리 없음.
- **제안 수정:** `elif c is not None:` 분기 추가하여 범위 외 값 로그 출력.
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 43 [lane:BACKEND]

---

### [M-294] ✅ 해결완료(2026-06-13, C20) — `check_export.py` `check_file()` — `price_max=0` falsy 처리로 상한 체크 우회

- **영역:** 백엔드 — 배포 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `price_max=0` 인 모델이 `0 or pmin` 평가로 `pmin`을 상한으로 사용, 영가격 이상이 게이트 통과.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — `m.get("price_max") or pmin` : 0은 falsy.
- **제안 수정:** `m.get("price_max") if m.get("price_max") is not None else pmin` 으로 변경, `price_max==0` 별도 위반 항목 추가.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### [M-295] ✅ 해결완료(2026-06-13, C8) — `verify_internal.py` `main()` — `resolved=1` 전체 억제로 재발 버그 재탐지 불가

- **영역:** 백엔드 — 내부 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 수정된 실제 버그가 재발해도 `resolved=1` 플래그가 남아있어 스캐너가 재보고 안 함.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 260 — `WHERE resolved=1` 전체 제외, `false_positive` vs `fixed` 구분 없음.
- **제안 수정:** `resolution_type` 컬럼 추가, `false_positive` 만 제외하고 `fixed`는 재탐지 허용.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 260 [lane:BACKEND]

---

### [M-296] ✅ 해결완료(2026-06-13, C21) — `stamp_version.py` `main()` — `search.json` 부재 시 앱 내 구버전 `?v=` 스텁 무음 유지

- **영역:** 백엔드 — 빌드 도구
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `search.json` 삭제/미생성 상태에서 `stamp_version.py` 실행 시 `app.js` 내 이전 `?v=OLD` 스텁이 경고 없이 유지됨.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 32 — `os.path.exists` 분기에 else 경고 없음.
- **제안 수정:** `else: print("[WARN] search.json not found — app.js search version not updated")` 추가.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 32 [lane:BACKEND]

---

### [L-241] ✅ 해결완료(2026-06-13, C39) — `harvest_tents.py` `ingest()` — `seen_names` 브랜드 미분리로 타 브랜드 동명 모델 중복 오판

- **영역:** 백엔드 — 크롤링
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 서로 다른 브랜드의 동일 모델명(예: "돔텐트 3P") 중 두 번째 브랜드 상품이 중복으로 오인식돼 수집 제외.
- **원인:** `seen_names`가 `{model}` 단순 집합, `(brand, model)` 미사용 (M-275와 동일 사안).
- **해결:** M-275/M-256과 함께 C39에서 일괄 해결 — `(category_id, brand, model)` 튜플 키로 3파일 동시변경.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py), [pipeline/multicat.py](pipeline/multicat.py), [pipeline/refresh.py](pipeline/refresh.py) [lane:C39]


---

## R-116 (프론트엔드) — 2026-06-13

### [M-297] ✅ 해결완료(2026-06-13) — `openReplaceModal` — `data-ii` 스테일 인덱스로 세트 아이템 오삭제

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 교체 모달 열린 뒤 다른 탭에서 세트가 변경되면 클릭 시 엉뚱한 아이템이 splice 제거됨.
- **원인:** [site/app.js](site/app.js) line 620–643 — 모달 생성 시점의 인덱스를 클릭 시 새로 로드된 배열에 그대로 적용.
- **제안 수정:** 인덱스 대신 `pcode` 등 고유값으로 아이템 식별 후 제거.
- **파일:** [site/app.js](site/app.js) line 642 [lane:CORE]

---

### [M-298] — `buildFilters` / `syncFilterUI` — 드롭다운 선택 브랜드(top-12 외)가 활성 상태 UI에 미반영 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 상위 12개 외 브랜드를 드롭다운으로 선택해도 시각적 활성 표시 없음, 해제 방법도 없음.
- **원인:** [site/app.js](site/app.js) line 1788 — `syncFilterUI`가 top-12 칩만 업데이트, 드롭다운 선택 브랜드 태그 UI 없음.
- **제안 수정:** 드롭다운 선택 브랜드용 활성 태그 영역 추가 (×버튼 포함).
- **파일:** [site/app.js](site/app.js) line 1927 [lane:CORE]

---

### [L-242] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조) — loginHref 부재. — `_showAuthGateModal` — `loginHref` 변수 계산 후 미사용 (데드 코드)

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `loginHref` 변수가 선언되지만 실제 href는 `prefix` 사용, 혼란 유발.
- **원인:** [site/app.js](site/app.js) line 149 — 리팩터링 후 구 변수 미제거.
- **제안 수정:** line 149 `const loginHref = ...` 제거.
- **파일:** [site/app.js](site/app.js) line 149 [lane:CORE]

---

### [L-243] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — line 693 onKey 재등록 가드 존재(주석 L-243). 기수정. — `openReplaceModal` — 재호출 시 이전 ESC keydown 리스너 누적

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 같은 페이지에서 `openReplaceModal` 반복 호출 시 이전 `onKey` 핸들러가 document에 누적, ESC가 여러 번 처리됨.
- **원인:** [site/app.js](site/app.js) line 635–640 — 모달 재사용 시 이전 `addEventListener("keydown", onKey)` 미제거.
- **제안 수정:** 모듈 변수에 현재 `onKey` 저장, 재호출 시 먼저 `removeEventListener`.
- **파일:** [site/app.js](site/app.js) line 635 [lane:CORE]


---

## R-117 (백엔드) — 2026-06-13

### ✅ 해결완료(2026-06-13) [M-299] — `ocr_specs.py` `run()` — `dv==0` falsy 처리로 스펙 0값이 항상 충돌 플래그

- **영역:** 백엔드 — OCR 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB에 `value_normalized=0` 인 스펙(중량 오파싱 등)이 있으면, OCR 값이 0이어도 diff=1로 판정돼 항상 불일치 플래그 발생.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 — `if dv` 로 0과 None을 동일 처리.
- **제안 수정:** `diff = abs(val - dv) / dv if dv else (0 if val == 0 else 1)`.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-300] — `ocr_specs.py` `verify_price()` — INSERT + UPDATE 비원자적, 예외 시 부분 쓰기

- **영역:** 백엔드 — OCR 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `verify_price` 내 INSERT 성공 후 UPDATE 전 예외 발생 시 quality_flag 삽입만 되고 price_observations 무효화가 누락, DB 불일치.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 157–163 — INSERT + 조건부 UPDATE가 트랜잭션 경계 없음.
- **제안 수정:** SAVEPOINT로 감싸거나 두 쓰기를 단일 try/finally 블록으로 묶기.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 157 [lane:BACKEND]

---

### [L-244] ✅ 검토완료·현행유지(2026-06-14, D) — `danawa.py` `parse_spec_string()` — `seen_kv` 플래그로 key:value 이후 독립 태그가 값 연속으로 오분류
> 검토결과 현행유지: danawa 포맷이 '태그 먼저 → key:value 스펙 나중' 구조라 kv 이후 콜론없는 조각=값 연속(H-57 설치크기 손상 수정)이 맞다. seen_kv 변경 시 H-57 회귀 → 유지.

- **영역:** 백엔드 — 다나와 파싱
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 스펙 문자열에서 첫 `key:value` 확인 후 등장하는 독립 태그 토큰이 이전 스펙 값의 연속으로 잘못 붙어서 스펙 값 오염.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 163–176 — `seen_kv=True` 후 모든 bare 토큰을 값 연속으로 처리.
- **제안 수정:** bare 토큰을 값 연속으로 분류하는 조건에 위치 기반 또는 형태 기반 휴리스틱 추가.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 163 [lane:BACKEND]


---

## R-117 (프론트엔드) — 2026-06-13

### [M-301] ✅ 해결완료(2026-06-13) — `applySort` — 정렬 변경 후 `serializeState()` 미호출로 URL 미반영

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 정렬 변경 후 새로고침하거나 URL 공유 시 정렬 상태 소실.
- **원인:** [site/app.js](site/app.js) line 1845–1851 — `STATE.sortKey`/`STATE.sortAsc` 업데이트 후 `serializeState()` 호출 없음. 다른 필터 경로는 전부 호출.
- **제안 수정:** `applySort` 내 `draw()` 호출 전후에 `serializeState()` 추가.
- **파일:** [site/app.js](site/app.js) line 1845 [lane:CORE]

---

### [M-302] — `openSetModal` 신규 세트 생성 시 `addToSet` 반환값 무시로 슬롯 오버플로우 무음 처리 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 신규 세트 생성 + 아이템 추가 시 용량 초과 여부 무시, `openReplaceModal` 미호출.
- **원인:** [site/app.js](site/app.js) line 612 — `addToSet(s.id, item)` 반환값 미검사. 기존 세트 경로(line 603)는 `res.status === "cap"` 체크 있음.
- **제안 수정:** `const res = addToSet(s.id, item); if (res?.status === "cap") openReplaceModal(...)` 추가.
- **파일:** [site/app.js](site/app.js) line 612 [lane:CORE]

---

### [M-303] — `renderActiveFilters` — min/max 모두 null인 range 엔트리도 의미없는 칩 표시 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 활성 필터 표시
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `STATE.range[k]` 가 `{}` 이거나 min/max 둘 다 null이면 "무게 ~" 같은 빈 칩이 노출돼 혼란 유발.
- **원인:** [site/app.js](site/app.js) line 1899–1910 — 칩 렌더 전 min/max 유효성 검사 없음.
- **제안 수정:** `if (r.min == null && r.max == null) continue` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 1899 [lane:CORE]

---

### [L-245] ✅ 해결완료(2026-06-14, D) — _trapTab 공유 헬퍼로 openReplaceModal·openLogModal onKey에 Tab 트랩 추가. — `openReplaceModal` — Tab 포커스 트랩 없어 키보드 사용자가 모달 밖으로 포커스 이탈

- **영역:** 프론트엔드 — 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 교체 모달에서 Tab 키로 모달 외부 요소에 포커스 가능.
- **원인:** [site/app.js](site/app.js) line 641–642 — `openReplaceModal`이 ESC만 처리, 탭 포커스 트랩 없음. 세트 모달(line 579–588)과 상품 모달(line 1184–1192)은 트랩 구현됨.
- **제안 수정:** 교체 모달에도 포커스 가능 요소 순환 Tab 핸들러 추가.
- **파일:** [site/app.js](site/app.js) line 641 [lane:CORE]

---

### [L-246] ✅ 해결완료(2026-06-13) — `shareSet` / `importSharedSet` — 비표준 `escape`/`unescape` 사용으로 한국어 인코딩 위험

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `escape()`/`unescape()` deprecated API — 엄격 모드 환경·일부 브라우저에서 한국어 모델명 포함 세트 URL이 깨질 수 있음.
- **원인:** [site/app.js](site/app.js) line 3488, 4138 — `btoa(unescape(encodeURIComponent(...)))` / `decodeURIComponent(escape(atob(...)))` 패턴.
- **제안 수정:** `TextEncoder`/`TextDecoder` + `btoa`/`atob` 표준 패턴으로 교체.
- **파일:** [site/app.js](site/app.js) line 3488 [lane:CORE]

---

### [L-247] ✅ 해결완료(2026-06-13) — `importSharedSet` — 중복 import 방지 없어 동일 세트 반복 추가 가능

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 같은 공유 URL에서 버튼 여러 번 클릭 시 동일 세트가 localStorage에 중복 저장.
- **원인:** [site/app.js](site/app.js) line 4166–4178 — 버튼 disabled 처리 없음, 중복 검사 없음.
- **제안 수정:** 클릭 후 버튼 disabled 처리, 또는 title+items 조합으로 중복 체크 후 건너뜀.
- **파일:** [site/app.js](site/app.js) line 4166 [lane:CORE]

---

### [M-304] — `draw()` — `d.models.indexOf(m)` O(n²) 및 필터 후 인덱스 불일치로 상세 URL 오링크 — ✅ 해결완료(2026-06-13)

- **발견일시:** 2026-06-13
- **증상:** 카테고리 목록에서 필터·정렬 적용 후 상품 카드의 `href="/item/{cat}/item-{N}.html"` URL이 실제 item 파일 번호와 달라져 404 발생 가능. 예: 100개 모델 중 필터로 30개만 남았을 때, `rows` 배열의 인덱스 `i`를 카드 링크에 쓰지 않고 `d.models.indexOf(m)`을 재탐색하는데, 이 값은 원본 전체 배열 기준 인덱스이므로 item 파일명과 대응이 맞지 않는다. 즉 링크 자체는 올바른 파일을 가리키지만 `data-mi` 속성(`i`, 필터된 배열 인덱스)과 href의 인덱스가 다른 값을 사용해 코드 일관성이 깨진다. 또한 대규모 카테고리에서 모든 카드마다 `indexOf`를 반복 호출하면 O(n²) 탐색이 발생한다.
- **원인:** [site/app.js](site/app.js) line 2620 — `href="/item/${STATE.slug}/item-${d.models.indexOf(m)}.html"`에서 `rows` 순회 변수 `i` 대신 전체 배열 `d.models.indexOf(m)`을 매번 탐색. `data-mi="${i}"`(필터된 인덱스)는 이벤트 핸들러에서 `rows[+el.dataset.mi]`로 모델을 꺼내므로 두 인덱스 체계가 혼재.
- **제안 수정:** 빌드 단계에서 각 모델에 고정 `item_idx` 필드를 부여하고 href에 `m.item_idx`를 사용. 또는 `d.models` → `Map<model, idx>`를 미리 구성해 O(1) 조회로 교체.
- **파일:** [site/app.js](site/app.js) line 2620 [lane:CORE]

---

### [M-305] — `toggleWishWithHint` — auth 초기화 전 호출 시 비로그인 판정 오동작 — ✅ 해결완료(2026-06-13)

- **발견일시:** 2026-06-13
- **증상:** 페이지 로드 직후 `_gAuthReady`가 아직 `false`인 상태에서 사용자가 찜 버튼을 빠르게 클릭하면, `window.isLoggedIn()`이 `false`를 반환(`_ready=false` → `!!_user`=false)하므로 실제로 로그인된 사용자도 인증 게이트 모달이 뜬다. `toggleWish`(app.js line 443~458)는 `_gAuthReady` 여부를 분기해 `authReady()` 대기 로직을 갖고 있으나, `toggleWishWithHint`(line 472~480)는 이 분기 없이 단순히 `isLoggedIn()`만 확인하므로 초기화 중 클릭을 처리하지 못한다.
- **원인:** [site/app.js](site/app.js) line 472~480 — `toggleWishWithHint`에 `window._gAuthReady` 미확인 및 `authReady()` 대기 경로 없음.
- **제안 수정:** `toggleWishWithHint`도 `!window._gAuthReady` 시 `window.authReady().then(...)` 로 연기 처리, 또는 `toggleWish`와 통합.
- **파일:** [site/app.js](site/app.js) line 472 [lane:CORE]

---

### [H-85] ✅ 해결완료(2026-06-13) — `sw.js` stale-while-revalidate — 백그라운드 갱신 실패 시 오류 무음 폐기로 오래된 캐시 영구 고착

- **발견일시:** 2026-06-13
- **증상:** 자산·데이터 파일(JS/CSS/JSON)을 캐시 우선으로 제공한 뒤 백그라운드에서 갱신하는 stale-while-revalidate 패턴을 사용하는데, 갱신 fetch가 실패할 때 `.catch(() => null)`로 조용히 버려진다(line 76). 실패가 반복되면 캐시 항목이 영원히 갱신되지 않아 배포 후 변경 사항이 반영되지 않는다. 특히 `CACHE` 이름이 바뀌지 않는 한(stamp 미실행 등) 구버전 파일이 오프라인 기기에 무기한 잔류한다.
- **원인:** [site/sw.js](site/sw.js) line 69~76 — `fetch(req).then(net => { if (net.ok && !net.redirected) caches.open(...).then(c => c.put(...)); return net; }).catch(() => null)` — catch가 null 반환으로 끝나 실패가 투명하게 무시됨. 또한 `caches.open(...).then(c => c.put(...))` 반환 Promise를 awaiting하지 않아 쓰기 완료 전 SW가 종료될 수 있다.
- **제안 수정:** `e.waitUntil`로 백그라운드 갱신 Promise를 잡아두거나, 실패 시 console.warn 기록 + 오류 카운터로 반복 실패 감지.
- **파일:** [site/sw.js](site/sw.js) line 69 [lane:SW]

---

### [L-248] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — renderAccount는 app.js(일반스크립트)에서 먼저 로드, await initAuth 콜백은 비동기로 그 이후 발화. 초기 경로(637·647)는 typeof 가드. — `account.html` `initAuth` 콜백 — `renderAccount` 정의 전 호출 가능성

- **발견일시:** 2026-06-13
- **증상:** `initAuth` 콜백(account.html line 604)에서 `typeof renderAccount === 'function'`을 체크한 뒤 호출하는데, `renderAccount`는 같은 `<script type="module">` 블록 안에 있으므로 호이스팅이 안 되는 `function` 선언이 아닌 경우 TDZ(일시적 사각지대) 오류가 날 수 있다. 실제로 `renderAccount`가 `function` 선언이면 무해하지만, 콜백이 동기적으로 실행되는 엣지 케이스(Supabase 내부에서 즉시 resolve)에서 `typeof` 체크 타이밍이 모듈 평가 순서에 의존한다.
- **원인:** [site/account.html](site/account.html) line 612, 622 — `if (typeof renderAccount === 'function') renderAccount()` — `renderAccount`가 모듈 내 나중에 선언된 경우 초기화 경쟁 조건.
- **제안 수정:** `renderAccount`를 콜백 등록 전에 선언하거나, 콜백 내에서 `window.renderAccount?.()`처럼 명시적 전방 참조를 사용.
- **파일:** [site/account.html](site/account.html) line 612 [lane:ACCT]

---

### [M-306] ✅ 해결완료(2026-06-13) — `serializeState` — `cat` 파라미터가 `&` 뒤에 오는 URL에서 `?cat=` 중복 생성

- **발견일시:** 2026-06-13
- **증상:** `serializeState`(app.js line 1288~1289)는 `URLSearchParams`로 필터 상태를 직렬화한 뒤, 항상 `?cat=${STATE.slug}` 앞에 붙여 URL을 수동 조합한다. `qs`에 이미 `cat` 파라미터가 포함되어 있을 경우(예: 외부에서 `?cat=X&cat=Y` 형식으로 진입) `cat`이 두 번 나타나며, `location.pathname`이 `category.html` 이외 경로일 때(`base="category.html"`) 상대경로 URL에 이전 경로 컨텍스트가 혼입된다. 또한 `sort`와 `sa`가 기본값과 같으면 생략하는 로직(line 1281)은 `defaultSortKey()`·`defaultAsc(dk)` 두 함수를 매 `draw()` 호출마다 재실행하므로 카테고리 전환 시 타이밍에 따라 이전 카테고리의 기본 정렬 기준이 쓰인다.
- **원인:** [site/app.js](site/app.js) line 1287~1289 — URLSearchParams에 `cat`을 넣지 않고 문자열 접합으로 추가하여 `p`가 이미 `cat`을 담은 경우 중복 발생.
- **제안 수정:** `p.set("cat", STATE.slug)`로 URLSearchParams에 포함시킨 뒤 `base + "?" + p.toString()`으로 단순화.
- **파일:** [site/app.js](site/app.js) line 1289 [lane:CORE]

---

### [L-249] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — close()가 onKey 제거(160) + 재오픈 가드(159, 주석 L-249). 기수정. — `_showAuthGateModal` — ESC 리스너가 모달 `remove()` 후에도 document에 잔류

- **발견일시:** 2026-06-13
- **증상:** `_showAuthGateModal`(app.js line 163~165)에서 ESC 키 리스너는 ESC를 눌렀을 때 `close()`를 호출하고 자신을 제거한다. 그런데 "로그인하기" 링크를 클릭해 페이지를 이동하면 line 165의 `agm-btn` click 핸들러만 `removeEventListener`를 호출하는데, 이 시점에 SPA 탐색 없이 실제 `<a>` 클릭이면 페이지 언로드로 자동 정리되므로 무해하다. 그러나 `requireLogin`이 여러 번 연속 호출되면(`_showAuthGateModal` 반복 호출) 직전 모달 인스턴스의 `onKey` 참조는 `document.getElementById('auth-gate-modal')?.remove()`로 DOM은 지워지지만 `document`의 keydown에서는 제거되지 않은 채로 남아 ESC를 누를 때마다 이미 제거된 모달의 `close()`가 no-op로 계속 실행된다(리스너 누적).
- **원인:** [site/app.js](site/app.js) line 143~166 — 이전 `_showAuthGateModal` 호출의 `onKey` 리스너를 새 호출 시작 전에 제거하지 않음.
- **제안 수정:** 모듈 스코프에 `_authGateOnKey` 변수를 두고, 새 모달 생성 전에 이전 리스너를 `removeEventListener`로 정리.
- **파일:** [site/app.js](site/app.js) line 143 [lane:CORE]


---

## R-118 (백엔드) — 2026-06-13

### [H-86] ✅ 해결완료(2026-06-13, BACKEND) — `graph_full.py` `enrich_node()` — `FILL_BY_CATEGORY` 키가 실제 `name_ko` 미매칭으로 텐트 커스텀 지표 항상 무시
> `next((v for k,v in FILL_BY_CATEGORY.items() if k in cat), [])` 부분매칭. 검증: 백패킹텐트/오토캠핑텐트→텐트4종, 침낭→[weight_min,packed_volume], 타프→3종, 미매칭→[]. (텐트는 기존 `or FILL` 폴백과 동일값이라 무변화, 실질 개선은 침낭·타프의 부적절 텐트메트릭 fetch 제거.)

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 백패킹텐트·오토캠핑텐트의 카테고리별 fill_metrics 설정이 항상 빈 배열로 넘어가 텐트 전 종류가 동일 기본 FILL 적용.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 115 — `FILL_BY_CATEGORY.get("텐트")` 호출이지만 DB `name_ko`는 `"백패킹텐트"`, `"오토캠핑텐트"` 전체 명칭.
- **제안 수정:** 키를 실제 카테고리명으로 변경하거나 부분 매칭 `next((v for k,v in ... if k in cat), [])` 사용.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 115 [lane:BACKEND]

---

### [M-308] ✅ 해결완료(2026-06-13, C6) — `resolve_duplicates.py` `resolve()` — `executemany` 후 `rowcount`가 마지막 항목 1건만 반환, 합산 오류

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "demoted → pending: N건" 요약이 실제 처리 건수가 아닌 마지막 UPDATE 결과(항상 1) 출력.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 78–82 — DB-API 2.0 spec: `executemany` 후 `rowcount`는 마지막 반복 결과.
- **제안 수정:** 루프 순차 실행하며 `rowcount` 누산하거나 `len(losers)` 직접 사용.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 82 [lane:BACKEND]

---

### [M-309] ✅ 해결완료(2026-06-13, C3) — `export_site.py` `export()` — 쿠팡 URL 조회 WHERE에 NULL-safe 비교 미사용, canonical_model=NULL 상품 제외

- **영역:** 백엔드 — 사이트 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canonical_model`이 NULL인 상품에 쿠팡 URL이 있어도 JOIN 조건 `NULL=NULL` → NULL 평가로 링크 미반영.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 132 — `cm2.canonical_model=p.canonical_model` SQL 등호, NULL 안전 비교 미사용.
- **제안 수정:** `cm2.canonical_model IS p.canonical_model` (SQLite NULL-safe) 로 변경.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 132 [lane:BACKEND]

---

### [M-310] ✅ 해결완료(2026-06-13, C3) — `export_site.py` `export()` — gf_code 서브쿼리도 canonical_model NULL 비교 오류

- **영역:** 백엔드 — 사이트 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** gf_code 서브쿼리의 `p2.canonical_model=p.canonical_model` 조건이 NULL 상품 매칭 실패, gf_code NULL 노출.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 78 — M-309와 동일한 NULL 비교 패턴.
- **제안 수정:** `p2.canonical_model IS p.canonical_model` 로 변경.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 78 [lane:BACKEND]

---

### [M-311] ✅ 해결완료(2026-06-13, C12) — `promote_catalog.py` `main()` — `v_verified_catalog` 뷰가 전 카테고리 포함, 텐트 전용 커버리지 지표 오도

- **영역:** 백엔드 — 카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `weight_g`/`water_mm`/`floor_m2` 미관련 카테고리도 뷰에 포함되어 커버리지 %가 과소 계산, 텐트 데이터 품질 모니터링 왜곡.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 81 — 뷰에 카테고리 필터 없음.
- **제안 수정:** 뷰 또는 쿼리에 `WHERE category IN ('백패킹텐트','오토캠핑텐트')` 추가.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 81 [lane:BACKEND]


---

## R-119 (프론트엔드) — 2026-06-13

### [M-312] ✅ 분석완료(무효, 단위 레이블 미표시 디자인) — `openProduct` `specRows` — 단위 레이블 `(g)` 표시 중 값은 `kg`으로 변환, 단위 불일치

- **영역:** 프론트엔드 — 상품 스펙
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스펙 테이블 헤더에 `(g)` 레이블이 표시되지만 `fmtVal()`이 1000g 이상을 `kg`으로 변환해 값은 `1.50kg`으로 나타나 단위 혼란.
- **원인:** [site/app.js](site/app.js) line 2050 — `mt.unit` 원본 단위 표시, `fmtVal()` 변환 로직과 미연동.
- **제안 수정:** `fmtVal`과 동일한 단위 변환 로직으로 레이블도 `(kg)` / `(L)` 등으로 동적 표시.
- **파일:** [site/app.js](site/app.js) line 2050 [lane:CORE]

---

### [M-313] — `renderActiveFilters` — 단방향 범위 필터 칩에 고아 `~` 기호 표시 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 활성 필터 표시
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 프리셋이 `max` 만 설정한 경우 칩이 `"무게 ~1.5kg"`, `min` 만 설정 시 `"무게 1.5kg~"` 으로 표시돼 틸드가 고아로 남음.
- **원인:** [site/app.js](site/app.js) line 1910 — `\`${lab} ${fmt(r.min)}~${fmt(r.max)}\`` 무조건 틸드 포함.
- **제안 수정:** 한쪽만 존재하면 `≤ 1.5kg` / `≥ 1.5kg` 형식으로 표시, 틸드 제거.
- **파일:** [site/app.js](site/app.js) line 1910 [lane:CORE]

---

### [L-250] — `won()` — `NaN` 입력 시 `"NaN원"` 출력, isNaN 가드 없음

- **영역:** 프론트엔드 — 데이터 포맷팅
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 가격 필드가 `NaN`이면 UI에 `"NaN원"` 표시.
- **원인:** [site/app.js](site/app.js) line 336 — `n == null` 체크만 있고 `isNaN(n)` 가드 없음.
- **제안 수정:** `n == null || isNaN(n) ? "—" : n.toLocaleString(...)`.
- **파일:** [site/app.js](site/app.js) line 336 [lane:CORE]


---

## R-119 (백엔드) — 2026-06-13

### [M-314] ✅ 해결완료(2026-06-13, C37) — `scan_secrets.py` — OpenAI 신형 키 패턴(`sk-proj-*`, `sk-svcacct-*`) 미탐지

- **영역:** 백엔드 — 시크릿 스캐너
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 2024년 이후 OpenAI 신형 키(`sk-proj-...`, `sk-svcacct-...`)가 스캐너를 통과, 유출 미탐지.
- **원인:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 32 — `r"sk-[A-Za-z0-9]{20,}"` 패턴이 하이픈 포함 새 형식 미매칭.
- **제안 수정:** `r"sk-[A-Za-z0-9_-]{20,}"` 또는 `r"sk-(?:proj|svcacct|[A-Za-z0-9])[A-Za-z0-9_-]{18,}"` 으로 변경.
- **파일:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 32 [lane:BACKEND]

---

### [M-315] ✅ 해결완료(2026-06-13, C14) — `affiliate_links.py` `coupang_search()` — `&channel=` 파라미터가 쿠팡 파트너스 미인식, 수익 미추적

- **영역:** 백엔드 — 제휴 링크
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 검색 폴백 클릭이 쿠팡 파트너스에 추적되지 않아 커미션 미발생.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 34–36 — `&channel=AF6034597` 은 쿠팡 공식 추적 파라미터가 아님. 실제 추적은 `link.coupang.com/a/...` URL 또는 `subId` 필요.
- **제안 수정:** 쿠팡 파트너스 API로 링크 생성하거나 API 미확보 시 `&channel=` 효과 없음을 코드 주석에 명시.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 34 [lane:BACKEND]

---

### [L-251] ✅ 해결완료(2026-06-13, C24) — `limits_map.py` `render()` — 등급 정렬이 이모지 코드포인트 순으로 `🔴 한계` 최상단 표시

- **영역:** 백엔드 — 한계 지도
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 리포트 상세 테이블이 최악 등급(한계)부터 표시돼 가독성 역전.
- **원인:** [pipeline/limits_map.py](pipeline/limits_map.py) line 103 — `sorted(...key=lambda x: (x["grade"], -x["nv"]))` 이모지 Unicode 오름차순 `🔴<🟡<🟢`.
- **제안 수정:** 명시적 grade rank dict 사용 또는 `reverse=True` + key 재정의.
- **파일:** [pipeline/limits_map.py](pipeline/limits_map.py) line 103 [lane:BACKEND]

---

### [L-252] ✅ 해결완료(2026-06-13, C24) — `limits_map.py` `render()` / `main()` — `"—"` 등급 카테고리(스타 지표 없음)가 집계 버킷에서 제외

- **영역:** 백엔드 — 한계 지도
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 스타 지표 없는 카테고리가 합산에는 포함되나 A/B/한계 버킷 어디에도 미포함, 요약 숫자 불일치.
- **원인:** [pipeline/limits_map.py](pipeline/limits_map.py) line 85–87, 191–193 — `"—"` 등급 처리 분기 없음.
- **제안 수정:** 네 번째 `"—"` 버킷 추가, 요약 및 printout에 포함.
- **파일:** [pipeline/limits_map.py](pipeline/limits_map.py) line 85 [lane:BACKEND]

---

### [L-253] ✅ 검토완료·현행유지(2026-06-14, D) — `crosssource.py` `RECORDS` — `pcode "10429362"` 중복 등재, 향후 오버라이트 위험
> 검토결과 현행유지: pcode 10429362의 두 RECORDS는 중복이 아니라 floor_area(REI)·weight(BigAgnes)를 다른 출처에서 보강하는 상보적 항목. 서로 다른 metric이라 오버라이트 없음 → 유지.

- **영역:** 백엔드 — 크로스소스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** BigAgnes Copper Spur HV UL2가 line 31(floor_m2)과 line 100(weight, confirm=True)에 각각 등재, 향후 필드 추가 시 선행 확정 스펙 오버라이트 위험.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 31, 100 — RECORDS 확장 시 중복 체크 누락.
- **제안 수정:** 두 항목을 `{"pcode":"10429362", "floor_m2":2.69, "weight":"1247g", "confirm":True}` 단일 항목으로 병합.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 31 [lane:BACKEND]


---

## R-120 (프론트엔드) — 2026-06-13

### [H-87] ✅ 해결완료(2026-06-13) — `openSetDetail` — 타입 변경/수량 조절 후 `renderAccount()` 재렌더로 `prevFocus`가 분리된 DOM 노드 참조

- **영역:** 프론트엔드 — 세트 상세
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 세트 타입 변경 또는 수량 조절 시 `renderAccount()` 가 세트 목록을 재렌더, 모달 닫기 후 `modal._prevFocus.focus()` 가 분리된 노드에 포커스 시도 — 키보드 포커스 복귀 불가.
- **원인:** [site/app.js](site/app.js) line 3026–3028 — `saveSets → renderAccount → openSetDetail(si)` 호출 순서에서 renderAccount가 기존 DOM을 파괴, reopening 경로에서 prevFocus 미갱신.
- **제안 수정:** `renderAccount()` 호출 전 현재 포커스 요소 저장, 재렌더 후 복원하거나 세트 목록 전체 재렌더 대신 해당 세트 카드만 부분 업데이트.
- **파일:** [site/app.js](site/app.js) line 3028 [lane:CORE]

---

### [H-88] ✅ 해결완료(2026-06-13) — `renderAccount` — 찜 목록 빠른 연속 삭제 시 `data-i` 스테일 인덱스로 엉뚱한 상품 제거

- **영역:** 프론트엔드 — 찜 목록
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 찜 카드 제거 버튼 빠르게 연속 클릭 시 첫 클릭 후 재렌더 전 두 번째 클릭의 `data-i`가 단축된 배열에 부적용 → 잘못된 찜 항목 삭제.
- **원인:** [site/app.js](site/app.js) line 3334–3338 — `data-i` 는 렌더 시점 인덱스, 클릭 시 `getWish()` 재로드 배열에 스테일 인덱스 적용.
- **제안 수정:** 인덱스 대신 `pcode` 등 고유값으로 찜 아이템 식별 후 splice.
- **파일:** [site/app.js](site/app.js) line 3334 [lane:CORE]

---

### [M-316] — `draw()` — `qExclude` 필터가 검색어 명시 상품도 스펙 없으면 무음 숨김 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터/검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "스펙값 있는 것만" 체크 상태에서 특정 브랜드/모델명 검색 시, 검색에 매칭되지만 스펙 데이터 없는 상품이 결과에서 완전히 제외돼 사용자 혼란.
- **원인:** [site/app.js](site/app.js) line 2585 — `qExclude` 필터가 검색 필터 이후에도 스펙 없는 상품을 제거, 검색 의도 무시.
- **제안 수정:** `STATE.q` 가 있을 때 검색 매칭 상품은 `qExclude` 예외 처리.
- **파일:** [site/app.js](site/app.js) line 2585 [lane:CORE]

---

### [M-317] — `renderAccount` — `myLogsList.dataset.loaded` 미초기화로 다른 사용자 로그인 시 이전 사용자 로그 노출 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정 페이지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 세션 내 사용자 전환(로그아웃→재로그인) 시 B 사용자가 A 사용자의 로그 데이터를 보게 됨.
- **원인:** [site/app.js](site/app.js) line 3124 — `dataset.loaded="1"` 이 인증 상태 변경 시 미초기화.
- **제안 수정:** 로그아웃 또는 사용자 전환 이벤트에서 `myLogsList.dataset.loaded = ""` 초기화, 또는 로드한 userId를 dataset에 저장해 비교.
- **파일:** [site/app.js](site/app.js) line 3124 [lane:CORE]

---

### [M-318] ✅ 해결완료(2026-06-13) — `openSetDetail` — 타입 선택 핸들러가 `renderAccount()` 호출로 계정 섹션 전체 DOM 재생성, 수량 조작 동시 입력 시 덮어씀

- **영역:** 프론트엔드 — 세트 상세
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 타입 변경과 수량 조절을 빠르게 연속 수행 시 `saveSets` 호출이 서로 덮어써 한 쪽 변경 소실 가능.
- **원인:** [site/app.js](site/app.js) line 3028 — `renderAccount()` 가 모달 열린 상태에서 전체 계정 섹션 재렌더.
- **제안 수정:** 모달 열린 상태에서는 해당 세트 데이터만 갱신하고 전체 renderAccount는 모달 닫힌 후 실행.
- **파일:** [site/app.js](site/app.js) line 3028 [lane:CORE]

---

### [L-254] ✅ 해결완료(2026-06-14, CORE) — `renderChips` — 선택된 브랜드가 상위 40개 밖이면 활성 칩이 목록에 미표시
> [site/app.js](site/app.js) `renderChips`에서 `.slice(0, 40)` 후, 선택된 브랜드(`params.get("b")`)가 show에 없으면 `sortedBrands`에서 찾아 맨 앞에 `unshift`. 이제 인기 41위 이하 브랜드 선택 시에도 활성(`on`) 칩이 항상 표시됨. node --check 통과.

- **영역:** 프론트엔드 — 브랜드 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 정렬 기준 40위 이후 브랜드 선택 시 칩 목록에 활성 표시 없어 현재 필터 상태 미인지.
- **원인:** [site/app.js](site/app.js) line 2741 — `.slice(0, 40)` 후 활성 칩 검색, 40위 이후 브랜드 칩 미생성.
- **제안 수정:** 활성 선택 브랜드가 40위 밖이면 칩 목록에 강제 추가하거나 드롭다운에 활성 태그 표시.
- **파일:** [site/app.js](site/app.js) line 2741 [lane:CORE]

---

### [L-255] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — capture onKey 재등록 가드(2414, 주석 L-255). 기수정. — `openReviewDetail` — 반복 호출 시 capture keydown 리스너 누적

- **영역:** 프론트엔드 — 리뷰 상세
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 같은 리뷰를 여러 번 열면 `close()` 미호출로 이전 `onKey` capture 리스너가 누적, ESC 처리가 중복 실행.
- **원인:** [site/app.js](site/app.js) line 2236, 2293 — `#pmrv-detail` DOM 재사용 시 이전 리스너 미제거.
- **제안 수정:** `openReviewDetail` 시작 시 모듈 변수에 저장된 이전 `onKey` 리스너 제거.
- **파일:** [site/app.js](site/app.js) line 2293 [lane:CORE]


---

## R-120 (백엔드) — 2026-06-13

### [H-89] ✅ 해결완료(2026-06-13, BACKEND) — `normalize.py` `floor_area_m2()` — 테이퍼 정규식 `\d+`가 소수점 치수 잘라내어 면적 오계산
> `(\d*\.?\d+)\s*\((\d*\.?\d+)\)` + float 캐스트. 검증: '210.5(185)x300'이 정수케이스 '210(185)x300'과 동일 5.94㎡로 교정(기존 width=95 오산).

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `210.5(185)` 같은 소수점 테이퍼 치수에서 `5`만 매칭 → 평균폭 `95` 로 오계산, 실제 면적 대비 최대 6.7% 과대 추정.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 85 — `r"(\d+)\s*\((\d+)\)"` 가 정수만 매칭, 소수 앞 부분 유실.
- **제안 수정:** `r"(\d*\.?\d+)\s*\((\d*\.?\d+)\)"` 로 변경, 캐스트를 `float()` 로.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 85 [lane:BACKEND]

---

### [H-90] ✅ 해결완료(2026-06-13, BACKEND) — `normalize.py` `parse_lumens()` — 단위 선택적 정규식으로 임의 숫자를 루멘으로 오파싱
> 단위 필수: `(\d*\.?\d+)\s*(?:lm|루멘|lumen)`. 검증: '사용시간 300시간'·'충전횟수 500회'→None, '1200lm'·'800 루멘'·'300lumen'→정상.

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `"사용시간 300시간"`, `"충전횟수 500회"` 같은 비루멘 숫자가 300lm/500lm으로 분류돼 랜턴 스펙 오염.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 117 — `(?:lm|루멘|lumen)?` 단위 그룹이 optional, 단위 없는 숫자도 매칭.
- **제안 수정:** 단위 필수 매칭으로 변경: `r"(\d*\.?\d+)\s*(?:lm|루멘|lumen)"`.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 117 [lane:BACKEND]

---

### [M-319] ✅ 해결완료(2026-06-13, C4) — `normalize.py` `parse_temp()` — 범위 온도에서 최저온도 대신 첫 번째(따뜻한) 값 반환

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `"5℃ ~ -10℃"` 파싱 시 극한 온도 `-10` 대신 안락 온도 `+5` 반환 → 침낭 한계 성능 과대 평가.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 125 — `re.search` 가 첫 번째 숫자만 반환, 최소값 탐색 없음.
- **제안 수정:** `re.findall` 로 전체 숫자 추출 후 `min()` 반환.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 125 [lane:BACKEND]

---

### [M-320] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` `main()` — 필터 후 모델 없으면 `min()/max()` ValueError 크래시

- **영역:** 백엔드 — 배낭 빌더
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 브랜드/가격 필터 후 모델 0건이면 `min(caps)` `ValueError: min() arg is an empty sequence` 발생.
- **원인:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 167 — 빈 목록 가드 없음.
- **제안 수정:** `if not models: print("필터 후 제품 없음"); return` 추가.
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 167 [lane:BACKEND]

---

### [M-321] ✅ 해결완료(2026-06-13, C5) — `build_backpacking_bag.py` `main()` — manifest 파일 핸들 미닫힘 + 한국어 인코딩 누락

- **영역:** 백엔드 — 배낭 빌더
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 파일 핸들 미반환으로 Windows 등에서 쓰기 버퍼 미플러시 가능, 한국어 문자 포함 시 인코딩 오류.
- **원인:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 221, 228 — `open()` 을 `with` 블록 없이 사용, `encoding="utf-8"` 미지정.
- **제안 수정:** `with open(mpath, encoding="utf-8") as f:` 패턴으로 교체.
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 221 [lane:BACKEND]

---

### [M-322] ✅ 분석완료(무효, C19) — `enrich_details.py` `main()` — `"?" * N` 이 `"???"` 생성, N>1 시 IN() 쿼리 malformed

- **영역:** 백엔드 — 상세 보강
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `targets` 2건 이상 시 SQL `IN(???)` 구문 오류 발생, 보강 스크립트 전체 실패.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122 — `"?" * len(targets)` 가 콤마 없는 `"???"` 생성.
- **제안 수정:** `",".join(["?"] * len(targets))` 로 변경.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122 [lane:BACKEND]


---

## R-121 (백엔드) — 2026-06-13

### [H-91] ✅ 해결완료(2026-06-13, BACKEND) — `graph_pipeline.py` `fetch_detail()` — `spec["fn"]` KeyError: enrich_details.py 패치 미반영
> enrich_details(H-58) 가드 패턴 미러링: `derive, fn = spec.get(...); if derive=="floor" elif fn else continue`.

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `fn` 키 없는 TENT_MAP 항목이 `derive != "floor"` 분기에 도달 시 KeyError — `enrich_details.py` 에 동일 수정이 적용됐지만 `graph_pipeline.py`에는 미포팅.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 97 — `spec["fn"]` 비방어적 접근. `errors` 딕셔너리가 예외를 삼켜 조용히 실패.
- **제안 수정:** `enrich_details.py` 의 guard 패턴 동일 적용: `fn = spec.get("fn"); if not fn: continue`.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 97 [lane:BACKEND]

---

### [M-323] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `rederive_thickness()` — `value_normalized=None` 설정 후 `valid=0` 미설정, 불일치 행 잔류

- **영역:** 백엔드 — 범위 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `value_normalized=NULL` + `valid=1` 인 두께 행이 범위 체크에서 NULL 필터로 제외되나, `valid=1` 직접 조회 쿼리에서는 유효 데이터로 오인될 수 있음.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 345–363 — `rederive_thickness`가 `value_normalized=None` 만 설정, `valid=0` 누락.
- **제안 수정:** NULL로 설정 시 `valid=0` 도 함께 설정.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 358 [lane:BACKEND]

---

### [M-324] ✅ 검토완료·현행유지(2026-06-14, D) — `graph_full.py` `enrich_node()` — SQL이 `water_head`/`floor_area` 고정 체크로 침낭·매트 보강 대상 누락
> 검토결과 현행유지: 카테고리별 동적 WHERE는 비텐트 과다 fetch 위험으로 WORK-LANES B2에서 이미 보류 결정. 현 고정 메트릭(water_head/floor_area) 기준은 텐트 중심 enrich에 적합 → 유지.

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `FILL_BY_CATEGORY` 에 침낭(`weight_min`, `packed_volume`) 등 비텐트 카테고리가 정의돼도 `enrich_node` SQL이 `water_head`/`floor_area` 없는 상품만 대상으로 해 침낭·매트 보강 미실행.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 96–103 — WHERE절이 카테고리별 fill_metrics가 아닌 텐트 고정 메트릭 기준.
- **제안 수정:** `fill_metrics` 리스트를 기반으로 동적 WHERE절 생성.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 96 [lane:BACKEND]

---

### [L-256] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `backfill_capacity_l()` — `\b` 가 한국어/유니코드 단위 뒤에서 오동작

- **영역:** 백엔드 — 범위 검증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"2리터짜리"` 같은 문자열에서 `\b`가 한국어 문자 뒤 불규칙 매칭, 단위 인식 오류 가능.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 120 — Python `re` 는 한국어를 word character로 미처리, `\b` 경계 판단 오류.
- **제안 수정:** `\b` 를 `(?!\w)` 부정 전방탐색 또는 제거.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 120 [lane:BACKEND]


---

## R-121 (프론트엔드) — 2026-06-13

### [H-92] ✅ 해결완료(2026-06-13) — `renderAccount` 찜 목록 — ESC로 상품 모달 닫으면 `restore()` 미호출로 `STATE` 카테고리 오염

- **영역:** 프론트엔드 — 찜 목록
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 찜 목록에서 상품 모달 열고 ESC 종료 시 `STATE.slug`/`STATE.data`가 찜 아이템 카테고리로 남아, 이후 메인 페이지 필터/드로 결과 오염.
- **원인:** [site/app.js](site/app.js) line 3314–3325 — `xbtn.onclick`/`modal.onclick` 만 `restore()` 패치, ESC `onKey` 핸들러(line 2144–2148)는 원본 `close()` 직접 호출로 restore 건너뜀.
- **제안 수정:** 찜 아이템 모달용 `close` 오버라이드 시 ESC `onKey` 도 `restore()` 포함 버전으로 교체.
- **파일:** [site/app.js](site/app.js) line 3318 [lane:CORE]

---

### [M-325] — `passRange` — 빈 range 객체 `STATE.range[key]={}` 가 스펙 없는 전 상품 제외 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 잘못된 URL 파라미터(`weight_min__min=abc` 등) 복원 시 `STATE.range["weight_min"]={}` 설정 → `passRange` 가 스펙 null 상품을 전부 제외, 실제 범위 제약 없음에도 상품 목록 공백.
- **원인:** [site/app.js](site/app.js) line 1987–1988 — `r.min`/`r.max` 모두 undefined 이어도 `v == null` 이면 `return false`.
- **제안 수정:** range 오브젝트의 min/max 모두 nullish일 때 해당 key 건너뜀 처리.
- **파일:** [site/app.js](site/app.js) line 1987 [lane:CORE]

---

### [M-326] — `restoreState` — `STATE.q` 소문자 저장으로 활성 필터 칩과 빈 상태 링크가 원본 대소문자 미반영 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 검색 상태
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `?q=Big+Agnes` URL 진입 시 활성 필터 칩이 `"big agnes"` 표시, 빈 상태 검색 링크도 소문자 URL 사용.
- **원인:** [site/app.js](site/app.js) line 1292 — `STATE.q = (params.get("q") || "").toLowerCase()` 로 원본 케이스 유실.
- **제안 수정:** 원본 케이스를 별도 변수로 보존, 비교는 소문자, 표시는 원본 케이스 사용.
- **파일:** [site/app.js](site/app.js) line 1292 [lane:CORE]

---

### [M-327] ✅ 해결완료(2026-06-13) — `showToast` — `isHtml` 토스트 페이드아웃 후 `pointerEvents` 미복원으로 클릭 데드존 잔류

- **영역:** 프론트엔드 — UI
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** HTML 토스트 사라진 후 화면 하단 중앙 영역에 투명 클릭 차단 레이어 잔류, 다음 비HTML 토스트 표시 전까지 해당 영역 클릭 불가.
- **원인:** [site/app.js](site/app.js) line 506 — `setTimeout` 콜백에서 `pointerEvents:"none"` 복원 없음.
- **제안 수정:** 페이드아웃 setTimeout 콜백에 `t.style.pointerEvents = "none"` 추가.
- **파일:** [site/app.js](site/app.js) line 506 [lane:CORE]


---

## R-122 (백엔드) — 2026-06-13

### [H-93] ✅ 해결완료(2026-06-13, BACKEND) — `graph_pipeline.py` `assess()` — 기존 스펙 source_id를 항상 1로 하드코딩, 범위 검증 우회
> SELECT에 `psv.source_id` 추가·`have[key]`에 실제값 저장·`ORDER BY psv.source_id`. 실DB 검증: source_id {1,3} 정상 로드.

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** source_id=3/4 로 저장된 이상 스펙값이 재로드 시 source_id=1로 처리돼 `validate()` 에서 검증 제외, 이상값 영구 잔류.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 63 — `assess()` 가 DB에서 실제 source_id 미조회, 항상 1 부여.
- **제안 수정:** SELECT에 `psv.source_id` 추가, 실제 값을 `have[key]` 딕셔너리에 저장.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 63 [lane:BACKEND]

---

### [H-94] ✅ 해결완료(2026-06-13, BACKEND) — `graph_pipeline.py` `persist()` — 추론값(`inferred:floor`) 용량이 `products.capacity` 에 영구 기록
> `cap_source=="name"`(확정)만 영구 기록, `inferred:*`는 요검토 로그만. DB복사본 검증: inferred→미기록·name→기록.

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 이중 추론(floor_area → capacity)으로 신뢰도 낮은 용량값이 검증 없이 영구 저장, 이후 수정 불가.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 174 — `cap_source` 가 truthy이면 모두 기록, `"name"`(확정) vs `"inferred:*"` 구분 없음.
- **제안 수정:** `cap_source == "name"` 인 경우만 영구 저장, 추론값은 로그 후 요검토 처리.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 174 [lane:BACKEND]

---

### [M-328] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `validate_db()` — 전역 `valid=1` 리셋이 `mark_footprint_floor()` 의 `valid=0` 마크 덮어씀

- **영역:** 백엔드 — 범위 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `mark_footprint_floor()` 가 설정한 `valid=0` 행이 line 416 전역 리셋에 의해 `valid=1` 로 복원, 풋프린트 이상 행 재유효화.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 — `UPDATE product_spec_values SET valid=1` 가 `star_eligible=0` 행도 포함.
- **제안 수정:** `WHERE IFNULL(star_eligible,1)=1` 조건 추가.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 [lane:BACKEND]

---

### [M-329] ✅ 해결완료(2026-06-13, BACKEND) — `normalize_models.py` `flag_price_outliers()` — 2개 상품 그룹에서 하위 중앙값이 저가를 기준으로 고가 정상 상품 오플래그
> H-83(statistics.median 통일)으로 함께 해소: [100,100000] 평균중앙값=50050 → 100000이 상한(250250) 안에 들어와 오플래그 안 됨. 짝수 길이 두 중앙값 평균 사용(M-329 제안과 동일).

- **영역:** 백엔드 — 가격 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `[100, 100000]` 2개 그룹에서 중앙값=100, 상한=500 으로 `100000` 정상 상품이 이상가 플래그.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 124–127 — 하위 중앙값 공식이 2개 항목에서 가장 저렴한 가격을 기준으로 편향.
- **제안 수정:** 최소 그룹 크기를 3으로 높이거나 짝수 길이 시 두 중간값 평균 사용.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 124 [lane:BACKEND]

---

### [M-330] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `ensure_implausible_flagtype()` — 빈 products 테이블에서 `pid[0]` TypeError 크래시

- **영역:** 백엔드 — 범위 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 신규 DB 또는 테스트 환경에서 `products` 테이블 비어있으면 `pid[0]` TypeError, 전체 validate_db() 실패.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 79–87 — `fetchone()` None 반환 시 가드 없음.
- **제안 수정:** `if not pid: return` 추가.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 79 [lane:BACKEND]

---

### [M-331] ✅ 해결완료(2026-06-13, C3) — `export_site.py` `export()` — 스펙값 조회 `LIMIT 1` 에 `ORDER BY` 없어 비결정적 반환

- **영역:** 백엔드 — 사이트 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 메트릭에 source_id=1/4 행이 공존 시 `LIMIT 1` 이 임의 행 반환, 낮은 신뢰도 값이 대표값으로 선택될 수 있음.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 89–91 — `LIMIT 1` 에 `ORDER BY` 누락.
- **제안 수정:** `ORDER BY v.is_primary DESC, v.source_id DESC LIMIT 1` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 89 [lane:BACKEND]

---

### [L-257] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `harmonize_variant_water_head()` — `round()` 정수 변환 후 REAL 컬럼에 정밀도 손실

- **영역:** 백엔드 — 범위 검증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 2999.5, 3000.5 등 소수점 방수 수치가 round() 후 정수로 저장돼 원래 측정 정밀도 소실.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 277 — `round(wh)` 정수 반환, REAL 컬럼 의미 손상.
- **제안 수정:** `float(round(wh, 0))` 으로 명시적 float 유지.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 277 [lane:BACKEND]

---

### [L-258] ✅ 해결완료(2026-06-13, BACKEND) — `graph_pipeline.py` `build_graph()` — `"enough"` 경로도 `persist()` 호출로 source_id=3/4 스펙 삭제
> H-93 수정으로 연동 해결: assess가 실제 source_id로 3/4 스펙을 specs에 적재 → "enough" 경로 persist도 재INSERT로 보존.

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 모든 스펙이 충족된 상품이 "enough" 경로를 타도 `persist()` DELETE가 실행돼 이전에 저장된 source_id=3/4 데이터 삭제.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 188 — "enough" 경로가 `persist()` 를 호출하지만 `assess()` 가 모든 스펙을 source_id=1로 마킹해 재삽입 대상 없음.
- **제안 수정:** H-93(assess source_id) 수정 후 연동 해결; 단기로 `persist()` 에 source_id=3/4 항목 없으면 DELETE 건너뜀 가드 추가.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 188 [lane:BACKEND]


---

## R-122 (프론트엔드) — 2026-06-13

### [H-95] ✅ 해결완료(2026-06-13) — `draw()` — `sortKey === "value"` 시 가성비 없는 상품 무음 제외, 활성 필터 칩 미표시

- **영역:** 프론트엔드 — 정렬/필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** "가성비순" 정렬 시 `cellVal(m, "value") == null` 상품이 조용히 제외되지만 활성 필터 칩·카운트에 반영 안 됨 → 사용자가 왜 상품 수가 적은지 알 수 없음.
- **원인:** [site/app.js](site/app.js) line 2585 — `k === "value"` 조건이 `qExclude` 없이도 rows 필터링하지만 `renderActiveFilters` 는 `STATE.qExclude` 참일 때만 칩 추가.
- **제안 수정:** 가성비순 정렬 시 "가성비 데이터 없는 상품 제외됨" 안내 칩 별도 표시.
- **파일:** [site/app.js](site/app.js) line 2585 [lane:CORE]

---

### [L-259] ✅ 해결완료(2026-06-13) — `sw.js` — 푸시 알림에 `tag` 미설정으로 가격 알림 중복 노티피케이션 누적

- **영역:** 프론트엔드 — 서비스 워커
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 여러 상품 가격 하락 알림이 동시에 오면 `tag` 없이 각각 별도 노티피케이션 생성, 알림함 가득 참.
- **원인:** [site/sw.js](site/sw.js) line 85–91 — `showNotification` 옵션에 `tag` 필드 없음.
- **제안 수정:** `tag: data.tag || 'gear-forest-push'` 추가로 동종 알림 교체.
- **파일:** [site/sw.js](site/sw.js) line 85 [lane:CORE]

---

### [L-260] ✅ 검토완료·현행유지(2026-06-14, F·추측성) — #auth-section은 실제 내비 타깃 아님(로그인 영역=페이지 상단). HASH_SEC 부재 시 무동작(무해). — `account.html` — `#auth-section` 해시가 `HASH_SEC` 맵에 없어 링크 진입 시 섹션 스크롤 미동작

- **영역:** 프론트엔드 — 계정 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 찜 목록 빈 상태 링크 `account.html#auth-section` 클릭 시 페이지 상단에 머물며 로그인 섹션으로 스크롤되지 않음.
- **원인:** [site/account.html](site/account.html) line 360–368 — `HASH_SEC` 에 `#auth-section` 매핑 없음.
- **제안 수정:** `'#auth-section': 'auth-section'` 항목 추가.
- **파일:** [site/account.html](site/account.html) line 360 [lane:CORE]


---

## R-123 (백엔드) — 2026-06-13

### [H-96] ✅ 해결완료(2026-06-13, BACKEND) — `fill_whitelist_specs.py` `fill_one()` — `fn=None` 시 `FN[None]` KeyError 조용히 삼킴
> `if derive != "floor" and fn is None: 경고출력 + continue` 가드를 try 앞에 추가 → except Exception에 삼켜지던 설정오류 무음실패 표면화.

- **영역:** 백엔드 — 화이트리스트 스펙 채우기
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 추출 함수가 없는 메트릭 항목에서 `KeyError` 발생, `except Exception` 이 조용히 삼켜 설정 오류 무음 실패.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 83 — `derive != "floor"` 이고 `fn=None` 일 때 `FN[None]` 접근.
- **제안 수정:** `if fn is None: continue` 가드 추가 후 설정 오류 경고 출력.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 83 [lane:BACKEND]

---

### [M-332] ✅ 해결완료(2026-06-13, C9) — `fill_whitelist_specs.py` `fill_one()` — `raw_unit` 하드코딩 `"norm"` 으로 실제 단위 미저장

- **영역:** 백엔드 — 화이트리스트 스펙 채우기
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `product_spec_values.raw_unit` 에 항상 `"norm"` 기록, 단위 기반 포맷팅 불가.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 92 — 단위 파싱 미구현, 플레이스홀더 문자열 잔류.
- **제안 수정:** raw 문자열에서 단위 추출 또는 미지 단위는 `NULL`/`""` 사용.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 92 [lane:BACKEND]

---

### [M-333] ✅ 해결완료(2026-06-13, C16) — `brand_filter.py` `main()` — BRANDS 수 급증 시 SQLite `SQLITE_LIMIT_VARIABLE_NUMBER` 초과 위험

- **영역:** 백엔드 — 브랜드 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** BRANDS 목록이 ~998개 초과 시 `NOT IN (?,?,?...)` 플레이스홀더 한계 초과, OperationalError 발생.
- **원인:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 96–100 — `len(BRANDS)` 상한 체크 없음.
- **제안 수정:** `assert len(BRANDS) < 990` 모듈 로드 시 추가, 또는 임시 테이블로 브랜드 집합 관리.
- **파일:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 98 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-334] — `detect_price_drops.py` `detect()` — `cur_min=None` 시 비교 연산 `TypeError` 크래시

- **영역:** 백엔드 — 가격 하락 감지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 현재 가격이 None인 상품에 대해 `None < prev_min` 비교 시 TypeError, 탐지 전체 실패.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 102 — `cur_min` None 가드 없음.
- **제안 수정:** `if prev_min and cur_min is not None and cur_min < prev_min:` 로 변경.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 102 [lane:BACKEND]

---

### [M-335] ✅ 분석완료(무효, C12) — `promote_catalog.py` `main()` — 전체 `pending` 리셋과 재승격이 비원자적, 동시 export 시 `verified` 빈 상태 노출

- **영역:** 백엔드 — 카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** export 동시 실행 시 line 31 리셋 후 line 43 커밋 전 순간 `curation_status='verified'` 상품 0건 상태로 export 가능.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31–42 — 명시적 `BEGIN`/트랜잭션 없이 리셋 후 재승격.
- **제안 수정:** `with con:` 블록으로 두 UPDATE를 원자적 트랜잭션으로 묶기.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31 [lane:BACKEND]


---

## R-123 (프론트엔드) — 2026-06-13

### [H-97] ✅ 해결완료(2026-06-13) — `renderActiveFilters` — 검색어 칩 클릭 시 `#q` 엘리먼트 null 체크 없어 TypeError 크래시

- **영역:** 프론트엔드 — 활성 필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `#q` 입력 요소가 없는 컨텍스트에서 검색어 활성 칩 클릭 시 `document.getElementById("q").value = ""` TypeError.
- **원인:** [site/app.js](site/app.js) line 1914 — null 가드 없음, `clearAllFilters`(line 1928)는 `if (q) q.value = ""` 가드 있음.
- **제안 수정:** `const q = document.getElementById("q"); if (q) q.value = "";` 패턴 적용.
- **파일:** [site/app.js](site/app.js) line 1914 [lane:CORE]

---

### [M-336] — `STATE.unit` — EXTRA_SPECS 키 누락으로 내수압/바닥면적 활성 필터 칩 단위 미표시 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터 단위
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `"내수압 1500~3000"` 처럼 단위 없이 표시, `water_head`/`floor_area` 등 EXTRA_SPECS 키가 `STATE.unit` 에 없음.
- **원인:** [site/app.js](site/app.js) line 1471–1472 — `STATE.unit`이 `d.metrics` 키만 포함, EXTRA_SPECS 슬라이더 키 미포함.
- **제안 수정:** `STATE.unit` 초기화 시 EXTRA_SPECS 단위 정보도 병합.
- **파일:** [site/app.js](site/app.js) line 1471 [lane:CORE]

---

### [M-337] ⏸ 보류(COMPARE_ENABLED=false, 복구 시 재처리) — 비교 세트 저장 시 Supabase 미동기화, 로그인 사용자 크로스 디바이스 손실

- **영역:** 프론트엔드 — 비교 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그인 상태에서 비교 세트 저장 시 localStorage만 기록, 다음 원격 동기화에서 덮어씌워짐.
- **원인:** [site/app.js](site/app.js) line 2566–2568 — `saveSets()` 만 호출, `upsertGearSet()` 미호출. 공유 세트 import(line 4171)는 정상 동기화.
- **제안 수정:** `saveSets` 후 `window._accUser?.id` 확인, 로그인 시 `upsertGearSet` 호출.
- **파일:** [site/app.js](site/app.js) line 2568 [lane:CORE]

---

### [M-338] ✅ 해결완료(2026-06-13) — `openReplaceModal` — 교체 후 `renderAccount()` 가 카테고리 페이지에서 no-op, 세트 상세 모달 미갱신

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 페이지에서 교체 완료 후 세트 상세 모달이 닫히고 갱신되지 않아 사용자가 결과 확인 불가.
- **원인:** [site/app.js](site/app.js) line 652–654 — `renderAccount()` 가 `#wishlist` 없는 페이지에서 조기 반환, `openSetDetail(si)` 재호출 없음.
- **제안 수정:** `openReplaceModal` 호출 시 `si` 인덱스를 받아 교체 후 `openSetDetail(si)` 재호출.
- **파일:** [site/app.js](site/app.js) line 652 [lane:CORE]

---

### [L-261] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — syncGearSetsOnLogin renderAccount 호출은 typeof 가드(267). — `account.html` `syncGearSetsOnLogin()` — `renderAccount` 미정의 시점 호출 가능성

- **영역:** 프론트엔드 — 계정 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `syncGearSetsOnLogin` async 완료 시점에 `renderAccount` 가 아직 전역으로 등록되지 않으면 TypeError.
- **원인:** [site/account.html](site/account.html) line 252 — `renderAccount()` 호출 전 정의 여부 체크 없음, try-catch 없음.
- **제안 수정:** `if (typeof renderAccount === 'function') renderAccount();` 가드 추가.
- **파일:** [site/account.html](site/account.html) line 252 [lane:CORE]

---

### [L-262] ✅ 검토완료·현행유지(2026-06-14, D·설계) — _filterSheetKeyHandler 재등록 가드(1850), 핸들러가 aside.open 체크라 detached 시 no-op, 전면 페이지 네비로 리스너 폐기. — `buildFilters` — 필터 시트 ESC 리스너 전역 등록 후 미제거, SPA 전환 시 detached DOM 참조

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** DOM 재구성 시 분리된 `aside` 를 참조하는 ESC 핸들러 잔류, 이후 ESC 작동 무반응.
- **원인:** [site/app.js](site/app.js) line 1776 — `document.addEventListener("keydown", ...)` 등록 후 `removeEventListener` 없음.
- **제안 수정:** 모듈 스코프 변수에 핸들러 저장, 재빌드 시 제거 후 재등록.
- **파일:** [site/app.js](site/app.js) line 1776 [lane:CORE]


### [M-339] ✅ 해결완료(2026-06-13, C4) — `normalize.py` `parse_water_head()` — 음수·비mm 단위 미검증 통과

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `parse_water_head()`가 음수 값이나 cm·m 단위를 `_num()`으로 그대로 반환, 비정상 내수압 값이 DB에 저장됨.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 57–61 — `_num()` 호출 후 범위 검증(0~30000mm) 없음.
- **제안 수정:** `v = _num(...)` 이후 `if v is None or v <= 0 or v > 30000: return None` 가드 추가.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 57 [lane:BACKEND]

---

### [M-341] ✅ 분석완료(무효, C1) — `validate_ranges.py` `backfill_capacity_l` — `valid=0` 행이 재충전 차단

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `valid=0`인 행이 UPDATE WHERE 조건에 포함돼 올바른 값으로 다시 채워지지 않고 무결성 오류 상태 유지.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 113–128 — `WHERE valid=1 AND capacity_l IS NULL` 조건이 valid=0 행을 제외.
- **제안 수정:** `valid` 컬럼 조건 제거 또는 `WHERE capacity_l IS NULL` 단독으로 변경.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 113 [lane:BACKEND]

---

### [M-343] ✅ 해결완료(2026-06-13, C1) — `validate_ranges.py` `fill_variant_capacity` — NULL `canonical_model` 텐트 잘못 묶임

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canonical_model IS NULL`인 텐트들이 한 그룹으로 집계돼 서로 다른 텐트의 capacity_l 값이 혼입.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 172–189 — GROUP BY canonical_model 시 NULL 행이 단일 그룹 처리.
- **제안 수정:** `WHERE canonical_model IS NOT NULL` 조건 추가 또는 NULL 행 별도 처리.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 172 [lane:BACKEND]

---

### [L-263] ✅ 해결완료(2026-06-13, C4) — `normalize.py` `parse_capacity_l` — 임의 숫자를 리터로 반환

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 단위 없는 숫자(예: 모델명 내 숫자)가 `_num()`에서 리터 값으로 반환돼 잘못된 용량 데이터 저장.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 106–107 — bare-number fallback이 단위 검증 없이 반환.
- **제안 수정:** bare-number fallback 제거 또는 합리적 범위(0.1~200L) 벗어나면 None 반환.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 106 [lane:BACKEND]

---

### [L-265] ✅ 해결완료(2026-06-13, C8) — `verify_internal.py` `write_queue` — `CHECK_PRIORITY` KeyError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 새 검증 항목 추가 시 `CHECK_PRIORITY` 딕셔너리에 누락되면 KeyError로 전체 검증 큐 생성 실패.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 208–228 — `CHECK_PRIORITY[check_key]` 직접 접근, `.get()` 미사용.
- **제안 수정:** `CHECK_PRIORITY.get(check_key, 99)` 로 변경해 누락 키에 기본 우선순위 부여.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 208 [lane:BACKEND]

---

### [L-266] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `rank_normalize` — 동점 풀에서 0.5 고정(★3) 반환

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 전체 상품이 동점인 카테고리에서 모든 상품이 ★3 로 표시, 상위 상품과 구분 불가.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 110–114 — all-tie 분기 시 `return 0.5` 하드코딩.
- **제안 수정:** 동점 풀은 만점(1.0)을 반환하거나 별도 배지(예: "동률 최고")로 표시.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 110 [lane:BACKEND]

---

### [M-344] ✅ 해결완료(2026-06-13) — `diagnoseEmpty` — `campStyle` 필터 진단 누락

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스타일 칩(백패킹 등) 활성화 후 0 결과 시 "스타일 필터를 해제하세요" 메시지가 표시되지 않고 엉뚱한 필터 제안.
- **원인:** [site/app.js](site/app.js) line 2013–2029 — `diagnoseEmpty()`의 `filters` 목록에 `STATE.campStyle` 누락, `passExcept`도 campStyle 처리 없음.
- **제안 수정:** `filters`에 `{ name: "스타일", clear: () => { STATE.campStyle = null; draw(); } }` 추가.
- **파일:** [site/app.js](site/app.js) line 2013 [lane:CORE]

---

### [M-345] ✅ 해결완료(2026-06-13) — `draw()` — `campStyle` 활성 시 `hasFilter` false → "전체 해제" 버튼 미노출

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스타일 칩만 활성화한 상태에서 0 결과 시 "필터 전체 해제" 버튼이 나타나지 않아 사용자가 복구 불가.
- **원인:** [site/app.js](site/app.js) line 2635 — `hasFilter` 계산에 `STATE.campStyle` 미포함.
- **제안 수정:** `const hasFilter = ... || STATE.campStyle;` 추가.
- **파일:** [site/app.js](site/app.js) line 2635 [lane:CORE]

---

### [M-346] ✅ 해결완료(2026-06-13) — `shareSet` import — 중복 세트 방지 미구현

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 공유 URL을 두 번 열거나 버튼을 빠르게 연속 클릭하면 동일 세트가 중복 저장됨.
- **원인:** [site/app.js](site/app.js) line 4166–4178 — import 핸들러에 버튼 disabled 처리 및 지문 비교 중복 체크 없음.
- **제안 수정:** 클릭 즉시 `btn.disabled = true`, 저장 전 제목+아이템 지문으로 기존 세트와 비교.
- **파일:** [site/app.js](site/app.js) line 4166 [lane:CORE]

---

### [M-347] ✅ 해결완료(2026-06-13) — `serializeState` — 중첩 경로에서 상대 URL `category.html?cat=...` 생성 → 404

- **영역:** 프론트엔드 — URL/라우팅
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `/category/backpacking-tent` 같은 클린 경로에서 `replaceState` 후 주소창이 `/category/category.html?cat=...`(404)로 변경, 공유 링크 깨짐.
- **원인:** [site/app.js](site/app.js) line 1287–1289 — pathname이 `/category.html`로 끝나지 않으면 상대 경로 `"category.html"` 사용.
- **제안 수정:** `base = "/category.html"` 절대 경로로 고정.
- **파일:** [site/app.js](site/app.js) line 1287 [lane:CORE]

---

### [L-267] ⏸ 보류(2026-06-14, E·백엔드 필요) — onConflict 'user_id,endpoint'라 기기 소유자 변경 시 이전 사용자 행 잔존→알림 누출. 클라이언트는 RLS상 타 사용자 행 삭제 불가. 수정책: push_subscriptions에 UNIQUE(endpoint) + onConflict='endpoint' 마이그레이션 또는 SECURITY DEFINER 정리함수. [lane:BACKEND/SOCIAL] — `requestPushSubscription` — 기존 구독이 다른 사용자 ID로 재덮어쓰기

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 공유 기기에서 다른 계정 로그인 시 이전 사용자의 푸시 구독이 새 userId로 upsert되어 알림 수신자 오염.
- **원인:** [site/app.js](site/app.js) line 3570 — `if (sub) { await _savePushSub(sub, userId); return; }` — 구독 소유자 확인 없이 바로 저장.
- **제안 수정:** 구독 엔드포인트와 DB의 userId 매칭 확인 후 일치하지 않으면 기존 구독 삭제 후 재구독.
- **파일:** [site/app.js](site/app.js) line 3570 [lane:CORE]

---

### [L-268] ✅ 해결완료(2026-06-13) — `sw.js` — 프리캐시 실패 후 `skipWaiting()` 강행 → 빈 캐시로 활성화

- **영역:** 프론트엔드 — 서비스워커
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** SHELL 파일 프리캐시 실패(네트워크 오류) 후에도 `.catch()` 스왈로우로 `skipWaiting()`이 실행, 빈 캐시 SW가 즉시 활성화되어 오프라인 시 앱 흰 화면.
- **원인:** [site/sw.js](site/sw.js) line 14–27 — `c.addAll(SHELL).catch(err => console.warn(...))` 후 `skipWaiting()` 무조건 호출.
- **제안 수정:** shell 캐시 성공 시에만 `skipWaiting()` 호출, 또는 catch 블록에서 throw하여 install 실패 처리.
- **파일:** [site/sw.js](site/sw.js) line 26 [lane:CORE]

---

### [L-269] ✅ 해결완료(2026-06-13) — `passExcept` — campStyle 기인 value 정렬 필터링 미반영 → `diagnoseEmpty` 수치 오류

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `diagnoseEmpty`가 `passExcept`로 계산한 "N개 남음" 수치가 실제 `draw()`의 value-null 제외 로직을 반영 못해 과대 표시.
- **원인:** [site/app.js](site/app.js) line 2001–2011 — `passExcept`에 `k === "value"` 시 null 제외 분기 없음.
- **제안 수정:** `passExcept`에 campStyle 활성 여부 파라미터 추가 후 value-null 행 동일하게 제외.
- **파일:** [site/app.js](site/app.js) line 2001 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-98] — `promote_catalog.py` `main()` — None 스펙 float 포맷 TypeError 크래시

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** crosssource 덮어쓰기 직후 promote 실행 시 weight_g/water_mm 등이 NULL인 행에서 `f"{w:.0f}"` → TypeError로 promote 전체 실패.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 81 — `{w:.0f}` f-string에 None 방어 없음.
- **제안 수정:** `{w or 0:.0f}` 또는 `{w if w is not None else 0:.0f}` 패턴 적용.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 81 [lane:BACKEND]

---

### [M-348] ✅ 분석완료(무효, C11) — `crosssource.py` upsert — `star_eligible` 컬럼 누락 → 별점 산정 제외

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** crosssource로 보강된 `floor_area` 스펙이 `star_eligible=0`(DEFAULT)으로 저장돼 별점 산정에서 제외, 텐트 메트릭 배지 오분류.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 159–160 — INSERT 컬럼 목록에 `star_eligible` 누락 (fill_whitelist_specs.py는 명시적으로 `star_eligible=1` 삽입).
- **제안 수정:** crosssource upsert INSERT에 `star_eligible=1` 추가.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 159 [lane:BACKEND]

---

### [M-349] ✅ 해결완료(기존확인, C3) — `export_site.py` — 쿠팡 URL 서브쿼리에 capacity 조건 누락 → 다른 용량 링크 오연결

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 2인용 텐트에 3인용 쿠팡 구매 링크가 붙는 오연결 발생.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 128–134 — 쿠팡 URL 서브쿼리 WHERE에 `IFNULL(cm2.capacity,-1)=IFNULL(p.capacity,-1)` 조건 없음, brand+model 매칭만으로 잘못된 용량 variant 선택 가능.
- **제안 수정:** `WHERE cm2.brand_id=p.brand_id AND cm2.canonical_model=p.canonical_model AND IFNULL(cm2.capacity,-1)=IFNULL(p.capacity,-1)` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 128 [lane:BACKEND]

---

### [M-350] ✅ 해결완료(2026-06-13, C2) — `value_metric.py` `compute_value_score` — `weight_min=0` 행 ZeroDivisionError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 잘못된 데이터로 weight_min=0이 들어온 경우 `price_min / 0.0` → ZeroDivisionError로 가치 점수 계산 전체 실패.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 150 — eligible 필터가 `price_min=0`은 제외하지만 스펙 값 0-안전성 미체크.
- **제안 수정:** eligible 조건에 `and all(s.get(k,{}).get("value") not in (None,0) for k in metric_keys)` 추가.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 150 [lane:BACKEND]

---

### [L-270] ✅ 해결완료(2026-06-13, C7) — `graph_full.py` `enrich_node` — `enrich_limit` 음수값 미검증

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `enrich_limit=-5` 등 잘못된 음수 전달 시 LIMIT 미삽입으로 전체 처리 — 의도와 우연히 일치하나 문서화·검증 부재로 유지보수 함정.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 104 — `if s["enrich_limit"] > 0:` 분기만 있고 음수 유효성 검사 없음.
- **제안 수정:** main()에서 `enrich_limit < -1`이면 ValueError, TypedDict 주석에 `-1=전체` 명시.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 104 [lane:BACKEND]

---

### [H-99] ✅ 해결완료(2026-06-13) — `openProduct` (위시리스트 카드) — ESC 키 닫기 시 `STATE.slug/STATE.data` 미복원

- **영역:** 프론트엔드 — 위시리스트
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 위시 카드에서 상품 모달 열고 ESC 키로 닫으면 `STATE.slug`/`STATE.data`가 임시 카테고리 데이터로 유지, 이후 draw()/필터 동작이 잘못된 카테고리에서 실행.
- **원인:** [site/app.js](site/app.js) line 3322–3324 — `restore()` 콜백이 `.pmx` X버튼·배경 클릭에만 연결, `onKey` ESC 핸들러(line 2185)는 `restore()` 호출 없이 `close()` 직접 실행.
- **제안 수정:** `openProduct` 내 `close()` 함수 상단에 `restore()` 호출 또는 모달에 prevSlug/prevData 저장 후 항상 복원.
- **파일:** [site/app.js](site/app.js) line 3322 [lane:CORE]

---

### [M-351] ✅ 해결완료(2026-06-13) — `renderBrowse` — `#list` 요소 null 체크 누락 TypeError

- **영역:** 프론트엔드 — 브라우즈 페이지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `#list` 요소가 없는 페이지에서 `list.className = "grid"` → TypeError 크래시, 브라우즈 렌더 전체 실패.
- **원인:** [site/app.js](site/app.js) line 1431 — `getElementById("list")` 반환값에 null 체크 없음 (같은 함수 내 다른 요소들은 null 가드 존재).
- **제안 수정:** `if (!list) return;` 추가 (line 1430 직후).
- **파일:** [site/app.js](site/app.js) line 1431 [lane:CORE]

---

### [M-352] ✅ 해결완료(2026-06-13) — `renderCategory` — `#crumbName` 성공 경로 null 체크 누락

- **영역:** 프론트엔드 — 카테고리 페이지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `#crumbName`이 없는 페이지에서 데이터 fetch 완료 후 `.textContent =` 접근 → TypeError, 렌더 중단.
- **원인:** [site/app.js](site/app.js) line 1479 — 에러 경로는 null 가드 있지만 성공 경로에 없음.
- **제안 수정:** `const crumbEl2 = document.getElementById("crumbName"); if (crumbEl2) crumbEl2.textContent = d.name;`
- **파일:** [site/app.js](site/app.js) line 1479 [lane:CORE]

---

### [L-271] — `bulkBtn.onclick` — 위시 일괄 저장 토스트 중량 `qty` 미반영

- **영역:** 프론트엔드 — 위시리스트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 일괄 저장 토스트 총 중량이 `qty` 미적용으로 계산돼 `openSetDetail`과 수치 불일치.
- **원인:** [site/app.js](site/app.js) line 3361 — `sum + x.weight_g` 사용, `openSetDetail`(line 2929)은 `x.weight_g * (x.qty || 1)` 사용.
- **제안 수정:** `sum + x.weight_g * (x.qty || 1)` 으로 통일.
- **파일:** [site/app.js](site/app.js) line 3361 [lane:CORE]

---

### [L-272] — `saveSets` — `localStorage.setItem` QuotaExceededError 미처리

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 스토리지 가득 찰 때 모든 세트 변경 작업(추가·수량 조절·openSetDetail)에서 unhandled exception, UI 불일치.
- **원인:** [site/app.js](site/app.js) line 494 — `saveSets`에 try/catch 없음 (`setWish`·recent 쓰기는 모두 try/catch 보유).
- **제안 수정:** `try { localStorage.setItem(...) } catch(e) { /* 스토리지 초과 무시 또는 사용자 알림 */ }` 추가.
- **파일:** [site/app.js](site/app.js) line 494 [lane:CORE]

---

### [L-273] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조) — loginHref 부재. — `_showAuthGateModal` — `loginHref` 미사용 데드코드

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `loginHref` 변수가 계산되지만 참조되지 않아 데드코드 혼란 유발, 실제 링크는 별도 `prefix` 변수 사용.
- **원인:** [site/app.js](site/app.js) line 149 — `loginHref` 선언 후 미사용.
- **제안 수정:** `loginHref` 제거, `prefix` 로직의 중첩 경로 처리 범위 확인.
- **파일:** [site/app.js](site/app.js) line 149 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-100] — `normalize_models.py` `flag_price_outliers` — 매 실행마다 `valid=1` 전체 초기화로 수동 무효화 덮어쓰기

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** OCR 검증 또는 수동으로 `valid=0` 처리한 관측치가 다음 빌드에서 `UPDATE price_observations SET valid=1`로 복구돼 나쁜 가격 재노출.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 105 — 멱등 재계산 목적으로 전체 valid를 1로 초기화, 외부 설정 valid=0도 덮어씀.
- **제안 수정:** `WHERE source != 'manual'` 조건 추가 또는 `ocr_verified_invalid` 별도 플래그 사용.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 105 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-353] — `ocr_specs.py` `run` — OCR·다나와 단위 불일치로 가격 검증 false positive/negative

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** OCR weight_min은 그램(×1000) 저장, 다나와 경로가 kg 저장 시 1000배 차이로 검증 오판 — 유효 데이터 무효화 또는 이상 데이터 통과.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 — `diff = abs(val - dv) / dv` 계산 전 단위 통일 보장 없음.
- **제안 수정:** metric 정의에 단위 메타데이터 추가, 비교 전 동일 단위로 변환.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-354] — `check_export.py` `check_file` — `price_max=0` falsy로 `pmin` 폴백 → 이중 보고

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `price_max`가 없는 데이터에서 `pmin` 기준으로 고가이상 체크 실행 → 이미 저가이상으로 보고된 항목이 이중 플래그.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — `pmax = m.get("price_max") or pmin` — None과 0 미구분.
- **제안 수정:** `pmax = m.get("price_max") if m.get("price_max") is not None else pmin`
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-355] — `danawa.py` `http_get` — URLError 원인 체인 소실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 마지막 재시도 실패 시 원본 OS 오류(DNS 미해석·연결거부)가 generic 메시지로 교체돼 디버깅 불가.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 87 — `last = None` 초기화 후 `if last: raise last` 가 None이면 스킵, 새 URLError만 raise.
- **제안 수정:** `last = None` 제거 또는 `last = e` 로 실제 예외 저장.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 87 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-356] — `ocr_specs.py` `parse_specs` — `weight_min` `min(kgs)` vs `max(kgs)` 주석·코드 불일치

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 주석은 "가장 큰 값=본체" 의도이나 실제 코드는 `min(kgs)` 사용 — 페그·폴 낱개 무게가 OCR되면 잘못된 낮은 값이 `weight_min`으로 저장.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 101 — `min(kgs)` 반환, 주석과 반대.
- **제안 수정:** 의도 명확화 후 코드·주석 통일 (weight_min=최소구성이면 주석 수정, 본체무게라면 `max`로 변경).
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 101 [lane:BACKEND]

---

### [L-274] — `fill_whitelist_specs.py` `fill_one` — `raw_unit="norm"` 하드코딩 단위 불일치

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 다른 source 삽입(실제 단위 kg·mm·m²)과 불일치, 단위 기반 변환 로직 추가 시 오동작.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 92 — `raw_unit="norm"` 상수 하드코딩.
- **제안 수정:** specs_for에서 unit 정보 함께 반환해 삽입 시 실제 단위 사용.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 92 [lane:BACKEND]

---

### [M-357] ✅ 해결완료(2026-06-13) — 위시 카드 클릭 핸들러 — `fetch()` `response.ok` 체크 누락

- **영역:** 프론트엔드 — 위시리스트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 404/5xx 응답 시 HTML 에러 바디를 JSON 파싱 시도 → silent catch로 삼켜져 디버깅 불가.
- **원인:** [site/app.js](site/app.js) line 3311 — `fetch(...).then(r => r.json())` — `r.ok` 체크 없음.
- **제안 수정:** `if (!r.ok) throw new Error(r.status);` 추가 후 `.json()` 호출.
- **파일:** [site/app.js](site/app.js) line 3311 [lane:CORE]

---

### [M-358] — `defaultSortKey` — star 메트릭 없는 카테고리에서 `"spec:undefined"` 반환 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `is_star` 메트릭이 없는 카테고리에서 sort key가 `"spec:undefined"`가 돼 전체 정렬·필터 무력화.
- **원인:** [site/app.js](site/app.js) line 1267–1270 — `s0 && s0.key` 가 undefined일 때 `"spec:undefined"` 문자열 생성.
- **제안 수정:** `return s0 ? "spec:" + s0.key : "price_min";`
- **파일:** [site/app.js](site/app.js) line 1267 [lane:CORE]

---

### [L-275] ✅ 해결완료(2026-06-14, A) — mIdx 단일 계산으로 레이스·중복 제거. — `openProduct` — `d.models.indexOf(m)` 두 번 계산 → 레이스 시 인덱스 불일치

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `renderCategory` 레이스 시 두 번째 indexOf가 첫 번째와 다른 인덱스 반환 → 클릭 이벤트에 잘못된 `item_idx` 기록.
- **원인:** [site/app.js](site/app.js) line 2081, 2104 — 동일 값을 두 곳에서 독립 계산.
- **제안 수정:** `const itemIdx = d.models.indexOf(m)` 한 번만 계산 후 재사용.
- **파일:** [site/app.js](site/app.js) line 2081 [lane:CORE]

---

### [L-276] — `pushRecent` — `undefined` key 중복 체크 통과로 최근 본 목록 오염

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브랜드·모델이 undefined인 항목이 `"undefined|undefined|"` 키로 중복 저장, 최근 본 목록 오염.
- **원인:** [site/app.js](site/app.js) line 719–721 — key 구성 요소 유효성 검사 없이 localStorage 쓰기.
- **제안 수정:** `if (!item.key || !item.b || !item.m) return;` early return 추가.
- **파일:** [site/app.js](site/app.js) line 719 [lane:CORE]

---

### [L-277] — `buildFilters` 정렬 칩 — spec 정렬 시 활성 칩 없음

- **영역:** 프론트엔드 — 정렬 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 스펙 기준 정렬(`"spec:*"`) 시 모든 정렬 칩이 미선택 상태로 표시 — 사용자가 현재 정렬 기준 확인 불가.
- **원인:** [site/app.js](site/app.js) line 1853–1861 — CHIPS 배열에 `"spec:*"` 대응 칩 없음.
- **제안 수정:** spec 정렬 활성 시 fallback "스펙정렬" 칩 추가 또는 활성 칩 CSS 클래스 별도 처리.
- **파일:** [site/app.js](site/app.js) line 1853 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-101] — `validate_ranges.py` `validate_db` — `valid=1` 리셋 후 재격리 전 크래시 시 DB 불일치

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `valid=1` 전체 리셋 후 범위 재스캔 전 예외 발생 시 이미 커밋된 `implausible` valid=0 데이터가 valid=1로 복구된 채 남음.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 — 리셋과 재격리 사이에 중간 커밋 없음, 예외 발생 시 리셋 상태로 DB 잔류.
- **제안 수정:** 리셋+재격리 블록을 단일 트랜잭션으로 묶거나, 리셋을 범위 재스캔 직전으로 이동.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-359] — `normalize_models.py` `flag_price_outliers` — 하위 중앙값 인덱스 오류로 중간값 과소 추정

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 짝수 개 가격 목록에서 `(len-1)//2` 하위 중앙값이 실제 중앙값보다 낮아 상한선(`med*5`)이 과소 책정, 유효 고가 상품이 이상치로 잘못 격리.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 127 — `prices[(len(prices)-1)//2]` 사용, `statistics.median` 미사용.
- **제안 수정:** `statistics.median(prices)` 로 교체.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 127 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-360] — `column_fixes.py` `main` — 채널 UPDATE 가드 없어 수동 태깅 덮어씌움

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 매 실행마다 `'병행수입'`·`'B2C'` 등 수동 설정 채널이 `'직구'`/`'국내'`로 초기화됨.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 30–33 — `UPDATE price_observations SET channel=...` 에 `WHERE channel IS NULL` 가드 없음.
- **제안 수정:** `AND (channel IS NULL OR channel IN ('직구','국내'))` 조건 추가.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 30 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-361] — `verify_internal.py` `main` — 40자 note 접두사 resolved 중복 제거 오탐

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 서로 다른 check_type의 note가 첫 40자 일치 시 한쪽 이슈가 silently 드롭.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 260–261 — `resolved_set`에 `flag_type` 차원 미포함, `(product_id, note[:40])` 만으로 중복 판정.
- **제안 수정:** `(product_id, flag_type, note[:40])` 3-튜플로 변경.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 261 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-362] — `normalize.py` `parse_dims_cm` — 유니코드 타이포그래픽 따옴표 인치 미감지

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 한국/중국 상품 페이지의 `10"×12"` (U+201D) 표기가 인치로 인식 안 돼 값이 2.54× 작게 저장.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 50 — `'"' in s` 는 ASCII 0x22만 체크, U+201C/U+201D 미포함.
- **제안 수정:** `s = s.replace("“", '"').replace("”", '"')` 정규화 후 검사.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 50 [lane:BACKEND]

---

### [L-278] ✅ 해결완료(2026-06-14, K·보안) — scan_secrets errors=strict→replace: 비UTF-8 바이트로 파일 전체 스킵되던 우회 차단(라인 계속 스캔). 게이트 통과 유지 확인. — `scan_secrets.py` `main` — `errors="strict"` 파일 전체 스킵으로 시크릿 스캔 우회 가능

- **영역:** 백엔드 — 보안
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** non-UTF-8 바이트가 포함된 파일이 통째로 스킵, 시크릿이 인코딩 오류로 스캔 우회 가능.
- **원인:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 79 — `errors="strict"` + `except UnicodeDecodeError: continue`.
- **제안 수정:** `errors="replace"` 또는 `errors="ignore"` 로 변경해 디코딩 가능 부분 스캔.
- **파일:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 79 [lane:BACKEND]

---

### [L-279] — `resolve_duplicates.py` `resolve` — winner 선정 시 `rep_product_id` 기준 가격 조회로 비-rep 멤버 price=None

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 중복 그룹 내 canonical rep가 아닌 상품은 min_price=None으로 조회돼 winner 선정이 기존 rep 쪽으로 편향.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 47–48 — `WHERE rep_product_id=?` 조회, 비-rep 멤버 누락.
- **제안 수정:** `WHERE brand_id=? AND canonical_model=? AND IFNULL(capacity,-1)=?` 로 그룹 키 기준 조회.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 47 [lane:BACKEND]

---

### [M-363] ✅ 해결완료(2026-06-13) — `vs-import-btn` onclick — 로그인 없이 세트 저장, 버튼 레이블 불일치

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "내 세트에 추가 (로그인 필요)" 레이블과 달리 비로그인 상태에서도 localStorage에 세트 저장, 사용자 혼란.
- **원인:** [site/app.js](site/app.js) line 4166–4178 — auth 체크가 Supabase 동기화에만 적용, `saveSets()` 는 무조건 실행.
- **제안 수정:** 레이블을 "내 세트에 추가"로 수정하거나, 로컬 저장도 auth 게이트 안으로 이동.
- **파일:** [site/app.js](site/app.js) line 4166 [lane:CORE]

---

### [M-364] — `openReplaceModal` srp-item onclick — 렌더 시점 인덱스(`data-ii`) 재사용으로 다른 아이템 splice 위험 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 모달 열린 후 다른 탭/Supabase 동기화로 items 배열 순서 변경 시 엉뚱한 아이템이 제거됨.
- **원인:** [site/app.js](site/app.js) line 648–649 — `btn.dataset.ii`(렌더 시점 인덱스)를 재조회한 배열에 바로 사용.
- **제안 수정:** `findIndex(x => x.pcode === targetPcode)` 로 pcode 기준 재탐색 후 splice.
- **파일:** [site/app.js](site/app.js) line 649 [lane:CORE]

---

### [L-280] — `goalBar` / set list — `data-si` 속성이 배열 인덱스·세트 ID 두 가지 의미로 혼용

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 핸들러가 `data-si`를 배열 인덱스로 읽어야 할 때 세트 ID 문자열이 오면 `getSets()[NaN]` → undefined 반환.
- **원인:** [site/app.js](site/app.js) line 3415, 3444 — 동일 속성명을 두 다른 의미로 사용.
- **제안 수정:** `data-set-id`(세트 ID)와 `data-set-idx`(배열 인덱스)로 분리.
- **파일:** [site/app.js](site/app.js) line 3444 [lane:CORE]

---

### [L-281] — `openLogDetail` — `p.created_at` null 시 `new Date(null)` → 1970-01-01 묵시적 반환

- **영역:** 프론트엔드 — 로그
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** Supabase `created_at` null 반환 시 날짜가 1970-01-01로 표시, 오류 없이 오데이터 노출.
- **원인:** [site/app.js](site/app.js) line 3813 — `new Date(p.created_at)` null 가드 없음.
- **제안 수정:** `p.created_at ? new Date(p.created_at) : null` 후 null 체크해서 날짜 표시 처리.
- **파일:** [site/app.js](site/app.js) line 3813 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-102] — `add_manual_models.py` `upsert_model` — 빈 prices 리스트 시 `min()`/`max()` ValueError 크래시

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** JSON에서 가격 배열 누락 시 `min()` 빈 시퀀스 오류로 `add_manual_models.py` 전체 실행 중단.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 70 — `prices` 리스트 길이 검증 없음.
- **제안 수정:** `if not prices: raise ValueError(f"가격 없음: {m['brand']} {m['model']}")` 조기 검출 추가.
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 70 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-103] — `refresh.py` `_group_prices_by_cat` — `pid2cat` 딕셔너리 키/값 순서 반전 → 이상치 가드 무력화

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `pid2cat.get(pid)`가 항상 None 반환 → 카테고리 중앙값 기준선이 절대 사용되지 않아 신규 가격 이상치 가드 완전 무력화.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 129 — `SELECT category_id, id` 순서인데 `{pid: cid for cid, pid in ...}` 언패킹으로 `{category_id: id}` 역방향 매핑 생성.
- **제안 수정:** `for pid, cid in con.execute("SELECT id, category_id FROM products ...")` 로 컬럼 순서 수정.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 129 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-365] — `babysit.py` `main` — `near` 제품 목록이 todos 루프 외부 출력으로 리포트 구조 깨짐

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `[할 일]` 출력 블록 종료 후 `near` 제품 라인이 이어붙여져 리포트 파싱/가독성 오류.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 113 — `near` 출력이 `for x in todos` 루프 외부.
- **제안 수정:** `near` 출력을 todos 루프 내부 또는 `if near:` 블록으로 이동.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 113 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-366] — `multicat.py` `ingest_one` — `danawa_pcode` 중복 시 동명 타 브랜드 제품의 pid 오취득

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `INSERT OR IGNORE` 후 `brand_id+model_name`으로만 pid 조회 → 동명 타 브랜드 제품 pid 반환, 스펙/가격이 다른 제품에 기록.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 169 — SELECT 조건에 `danawa_pcode` 미포함.
- **제안 수정:** `SELECT id FROM products WHERE danawa_pcode=?` 로 변경.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 169 [lane:BACKEND]

---

### [L-282] — `affiliate_links.py` `sample` — `kind='product'` 시 `naver_fallback` KeyError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `--sample` 실행 시 쿠팡 URL 있는 제품에서 `KeyError: 'naver_fallback'` 크래시.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 — product 분기 반환값에 `naver_fallback` 키 누락.
- **제안 수정:** `link.get('naver_fallback', '—')` 방어적 접근 또는 product 분기에도 키 추가.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 [lane:BACKEND]

---

### [L-283] — `enrich_details.py` `main` — `--all` 모드 결과 출력에서 비-rep 제품 보강 내역 누락

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `--all` 모드로 보강한 비-rep 제품이 결과 출력 쿼리에서 표시 안 됨.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122–123 — 출력 쿼리가 `--all`/기본 모드 구분 없이 동일 `danawa_pcode IN (...)` 필터 적용.
- **제안 수정:** `--all` 모드에서는 `WHERE p.id IN (...)` with pid 목록으로 변경.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122 [lane:BACKEND]

---

### ✅(xcode) [H-104] — `.pmodal` safe area 미반영 — 상품 상세 모달 닫기·찜 버튼 iOS 상태바에 가려져 탭 불가

- **영역:** 프론트엔드 — 상품 상세 모달 (iOS 네이티브 앱)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13 (xcode 시뮬레이터 iPhone 17 iOS 26.5)
- **증상:** 상품 카드 탭 후 열리는 상세 모달에서 닫기 버튼(`.pmx`)과 찜 버튼(`.pmwish`)이 iOS 상태바 아래에 위치해 탭이 되지 않음. 유저가 상세 모달을 닫을 수 없어 앱이 사실상 멈춘 것처럼 보임.
- **원인:** [site/style.css](site/style.css) line 425 — `.pmodal{padding:18px}` 이 `env(safe-area-inset-top)` 미반영. Capacitor WKWebView는 `viewport-fit=cover` 설정으로 상태바 영역(~54px)도 웹뷰가 차지하는데, 모달 상단 패딩이 18px에 불과해 `.pmx`(top:10px)·`.pmwish`(top:10px)가 상태바 뒤에 숨음.
- **제안 수정:** `padding-top: max(18px, env(safe-area-inset-top))` 으로 변경. 또는 `.pmodal { padding: env(safe-area-inset-top) 18px 18px; }`.
- **파일:** [site/style.css](site/style.css) line 425 [lane:STYLE]

---

### ✅(xcode) [M-367] — `.pmodal` safe area 미반영 — 상품 상세 모달 이미지 상단 상태바에 가려짐

- **영역:** 프론트엔드 — 상품 상세 모달 (iOS 네이티브 앱)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13 (xcode 시뮬레이터 iPhone 17 iOS 26.5)
- **증상:** 상품 이미지 상단 약 36px(상태바 54px - padding 18px)가 iOS 상태바에 가려져 이미지가 잘려 보임. 브랜드명·모델명도 위에서부터 렌더되어 일부 텍스트 숨김.
- **원인:** H-104와 동일 root cause — safe area inset 미적용.
- **제안 수정:** H-104 수정으로 함께 해결됨.
- **파일:** [site/style.css](site/style.css) line 425 [lane:STYLE]

---

### ✅(xcode) [M-368] — `.pmbox` 내부 스크롤 불가 — 상품 상세 모달 하단 구매·세트 버튼 접근 불가

- **영역:** 프론트엔드 — 상품 상세 모달 (iOS 네이티브 앱)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13 (xcode 시뮬레이터 iPhone 17 iOS 26.5)
- **증상:** 상품 상세 모달에서 스펙 목록 아래 "쿠팡에서 구매하기" 버튼, "장비 꾸러미에 담기" 버튼이 보이지 않음. `.pmbox{max-height:90vh;overflow-y:auto}` 이지만 Capacitor 내 WKWebView에서 모달 내부 스크롤이 동작하지 않음.
- **원인:** Capacitor WKWebView에서 `position:fixed` 모달 내부 스크롤이 iOS에서 막히는 known issue. `-webkit-overflow-scrolling:touch` 누락 또는 iOS 16+ `overscroll-behavior` 필요.
- **제안 수정:** `.pmbox { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }` 추가. 또는 `overflow-y: scroll` 강제 지정.
- **파일:** [site/style.css](site/style.css) line 128 [lane:STYLE]

---

### ✅(xcode) [L-284] — `최소무게 (g)` 레이블인데 값은 `kg` 단위로 표시 — 단위 불일치

- **영역:** 프론트엔드 — 상품 상세 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13 (xcode 시뮬레이터)
- **증상:** 상품 상세 모달 스펙 행에서 `최소무게 (g)` 레이블이지만 표시 값은 `3kg` — 단위가 g와 kg으로 불일치, 혼란 유발.
- **원인:** [site/app.js](site/app.js) line 2062 — `fmtVal(s.value, mt.unit)` 함수가 1000g 이상을 자동으로 kg 변환해 표기하지만 레이블의 `mt.unit`은 여전히 `g` 그대로 출력.
- **제안 수정:** `fmtVal`이 단위를 변환할 경우 반환값에 새 단위 포함, 레이블에도 반영. 또는 레이블을 `최소무게` (단위 미표기)로 통일하고 값에만 단위 표기.
- **파일:** [site/app.js](site/app.js) line 2062 [lane:CORE]

---

### ✅(xcode) [L-285] — 카테고리 탭 우측 페이드 그라디언트로 마지막 탭 레이블이 잘린 것처럼 보임

- **영역:** 프론트엔드 — 카테고리 네비게이션 탭
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13 (xcode 시뮬레이터)
- **증상:** `.catnav-wrap::after` 32px 흰색 그라디언트가 마지막 visible 탭 위에 겹쳐 "매..." 처럼 보임. 스크롤 가능한 탭 바임을 알 수 없어 UX 혼란.
- **원인:** [site/style.css](site/style.css) line 113 — `::after` 그라디언트 너비(32px)가 탭 텍스트를 가려, 탭이 truncate된 것처럼 보임. 스크롤 화살표 등 명시적 인디케이터 없음.
- **제안 수정:** 그라디언트 너비를 48px로 늘려 부분 노출 유도, 또는 우측에 스크롤 가능 화살표 아이콘 추가.
- **파일:** [site/style.css](site/style.css) line 113 [lane:STYLE]

---

### [L-284] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조·오탐) — priceRange의 b(price_max)는 M-480 폴백으로 실제 사용 중(app.js:339). — `priceRange` — `b`(price_max) 파라미터 미사용 데드 인자

- **영역:** 프론트엔드 — 가격 표시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `priceRange(a, b)` 호출 시 `b`(price_max) 무시, 가격 범위 표시 미구현.
- **원인:** [site/app.js](site/app.js) line 337 — `b` 파라미터 선언 후 미참조.
- **제안 수정:** `won(a) + (b && b !== a ? "~" + won(b) : "")` 로 범위 표시 구현하거나 파라미터 제거.
- **파일:** [site/app.js](site/app.js) line 337 [lane:CORE]

---

### [L-285] — DOMContentLoaded — 하단 네비 패딩 최초 1회만 적용, 뷰포트 회전/리사이즈 미대응

- **영역:** 프론트엔드 — 레이아웃
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 데스크탑에서 모바일로 화면 전환 시 하단 네비가 콘텐츠를 가리고 패딩 미적용.
- **원인:** [site/app.js](site/app.js) line 4234 — `matchMedia.matches` DOMContentLoaded 1회 체크, `change` 이벤트 리스너 없음.
- **제안 수정:** `mq.addEventListener("change", handler)` 추가해 반응형 대응.
- **파일:** [site/app.js](site/app.js) line 4234 [lane:CORE]

---

### [L-286] — `fmtVal` — `cm3` 단위 1000 미만 값 `_UNIT_DISPLAY` 미매핑 → 원시 `"cm3"` 표시

- **영역:** 프론트엔드 — 스펙 표시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 300cm³ 스펙이 `"300cm3"`으로 표시(표준 단위 기호 아님).
- **원인:** [site/app.js](site/app.js) line 349–350 — `_UNIT_DISPLAY` 에 `"cm3"` 항목 없음, 1000 미만은 변환 미적용.
- **제안 수정:** `_UNIT_DISPLAY`에 `"cm3": "cm³"` 추가.
- **파일:** [site/app.js](site/app.js) line 349 [lane:CORE]

---

### [L-287] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — 백드롭 클릭(163)→close()→onKey 제거(160). 기수정. — `_showAuthGateModal` — 배경 클릭 `close()` 시 `keydown` 리스너 미제거

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 모달 배경 클릭 후 ESC 키마다 잔류 핸들러 실행, 메모리 누수.
- **원인:** [site/app.js](site/app.js) line 159 — `close = () => m.remove()` — `removeEventListener` 없음, 버튼 클릭 경로만 리스너 제거.
- **제안 수정:** `close = () => { m.remove(); document.removeEventListener('keydown', onKey); }` 로 통합.
- **파일:** [site/app.js](site/app.js) line 159 [lane:CORE]

---

### [L-288] — 검색 결과 가격 표시 — `"원~"` 고정 접미사로 range 없는 가격에 혼란 야기

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 검색 결과에서 `"10,000원~"` 표시 — max 가격 없어도 tilde 노출, 앱 다른 곳과 불일치.
- **원인:** [site/app.js](site/app.js) line 1213 — 하드코딩 `"원~"` 접미사, `priceLabeled()` 헬퍼 미사용.
- **제안 수정:** `priceLabeled(x.p)` 로 교체.
- **파일:** [site/app.js](site/app.js) line 1213 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-104] — `refresh.py` `main` — `strptime` 마이크로초 포맷 불일치 → 관측치를 항상 "오래된 것"으로 처리

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `observed_at`에 마이크로초가 포함된 경우 `strptime` ValueError → `age_days=9e9` 반환 → 신규 가격을 직전 기록 무관하게 항상 삽입, 중복 가격 레코드 누적.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 108 — `DTFMT="%Y-%m-%d %H:%M:%S"` 포맷이 마이크로초 포함 ISO 타임스탬프와 불일치.
- **제안 수정:** `datetime.fromisoformat(obs)` 로 교체 (Python 3.7+ 가변 정밀도 지원).
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 108 [lane:BACKEND]

---

### [M-367] ✅ 해결완료(M-509와 동일, DP-1) — `multicat.py` `ingest_one` — INSERT OR IGNORE 후 SELECT 조건 불일치 → `NoneType` TypeError
> 확인: M-509와 동일 버그. lastrowid 패턴으로 해소됨.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** variant/model_year가 다른 기존 행으로 INSERT가 무시될 때 `SELECT ... WHERE model_year IS NULL AND variant IS NULL` 이 기존 행을 찾지 못해 `fetchone()[0]` TypeError 크래시.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 167–170 — INSERT 유니크 키와 SELECT WHERE 조건 불일치.
- **제안 수정:** `INSERT OR IGNORE ... RETURNING id` (SQLite≥3.35) 또는 삽입 유니크 키와 동일 조건으로 SELECT.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 169 [lane:BACKEND]

---

### [M-368] ✅ 해결완료(M-512와 동일, DP-1) — `enrich_details.py` `main` — `targets` 빈 리스트 시 `IN ()` 구문 오류
> 확인: M-512와 동일 버그. `if not targets:` 가드로 해소됨.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 매칭 제품 없는 경우 `WHERE p.danawa_pcode IN ()` SQLite 구문 오류로 크래시.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122–124 — `targets` 빈 리스트 가드 없음.
- **제안 수정:** `if targets:` 가드 추가 후 SELECT 실행.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122 [lane:BACKEND]

---

### [L-289] — `refresh.py` `_group_prices_by_cat` — 튜플 언패킹 사이드이펙트 의존 패턴

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `cur_cid, _ = cid, bucket.append(price)` 리팩토링 시 append 누락으로 가격 데이터 드롭 위험.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 81 — append 반환값(None)을 `_`로 받는 사이드이펙트 패턴.
- **제안 수정:** `cur_cid = cid; bucket.append(price)` 두 문장으로 분리.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 81 [lane:BACKEND]

---

### [L-290] — `babysit.py` `main` — `near` 쿼리 예외 미처리로 워치독 전체 중단

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `near` 쿼리에서 스키마 불일치 등 예외 발생 시 `babysit.py` 전체 종료, 다른 모니터링 항목도 실행 불가.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 77 — `near` 쿼리 try/except 없음.
- **제안 수정:** `try/except Exception as e: print(f"near 쿼리 오류: {e}"); near = []` 추가.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 77 [lane:BACKEND]

---

### [L-291] — `buildSortChips` — `aria-pressed` 정적 `"false"` 고정, 정렬 변경 후 미갱신

- **영역:** 프론트엔드 — 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 스크린 리더 사용자가 현재 활성 정렬 기준 확인 불가, 모든 칩이 `aria-pressed="false"` 유지.
- **원인:** [site/app.js](site/app.js) line 1863 — 칩 렌더 시 `aria-pressed="false"` 하드코딩, `applySort` 이후 미갱신.
- **제안 수정:** `applySort` 후 `.schip` 버튼 순회해 `aria-pressed` 토글.
- **파일:** [site/app.js](site/app.js) line 1863 [lane:CORE]

---

### [L-292] — PWA 설치 배너 — `_pwaPrompt` null 시 `prompt.prompt()` TypeError

- **영역:** 프론트엔드 — PWA
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `beforeinstallprompt` 미발생 상태에서 설치 버튼 클릭 시 `null.prompt()` TypeError.
- **원인:** [site/app.js](site/app.js) line 78 — `const prompt = _pwaPrompt` 후 null 체크 없음.
- **제안 수정:** `if (!prompt) return;` 추가 (line 76 직후).
- **파일:** [site/app.js](site/app.js) line 76 [lane:CORE]

---

### [H-105] ✅ 해결완료(2026-06-13) — `defaultSortKey` — 데이터 로딩 전 호출 시 `STATE.data.metrics` undefined TypeError

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `clearAllFilters → draw()` 가 `renderCategory` 완료 전 호출될 때 `STATE.data.metrics`가 undefined → TypeError, 전체 렌더 크래시.
- **원인:** [site/app.js](site/app.js) line 1275–1277 — `STATE.data.metrics.filter(...)` null 가드 없음.
- **제안 수정:** `if (!STATE.data?.metrics) return "price_min";` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 1275 [lane:CORE]

---

### [M-369] — `setupHomeSearch` `ensureIdx` — 로딩 중 빠른 타이핑 시 중복 `run()` 큐 실행 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 인덱스 로딩 중 키 입력마다 `.then(run)` 이 쌓여 로딩 완료 후 N번의 DOM 재작성 발생.
- **원인:** [site/app.js](site/app.js) line 1016 — 이미 대기 중인 run이 있어도 `.then(run)` 반복 추가.
- **제안 수정:** post-load run 대기 플래그 추가 또는 `.then(() => { if (inp === document.activeElement) run(); })` 로 단일 실행 보장.
- **파일:** [site/app.js](site/app.js) line 1016 [lane:CORE]

---

### [M-370] ✅ 해결완료(2026-06-13) — `draw` — 빠른 카테고리 전환 시 첫 번째 draw가 두 번째 카테고리 DOM에 첫 번째 데이터 기록

- **영역:** 프론트엔드 — 카테고리 페이지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 전환 레이스 시 카드 클릭하면 현재 카테고리가 아닌 이전 카테고리 상품이 열림.
- **원인:** [site/app.js](site/app.js) line 2590–2682 — `STATE` 전역 뮤테이션에 generation 토큰 없음, 비동기 draw들이 서로의 상태를 덮어씀.
- **제안 수정:** `const gen = ++_renderGen;` + 각 draw 진입 시 `if (gen !== _renderGen) return;` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 2590 [lane:CORE]

---

### [M-371] — `ensureIdx` — 네트워크 오류 후 `idxLoading` 미초기화 → 페이지 수명 동안 영구 빈 인덱스 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 일시적 네트워크 오류 후 검색이 결과 0건으로 고착, 새로고침 없이 복구 불가.
- **원인:** [site/app.js](site/app.js) line 955–958 — `.catch()`에서 `idxLoading = null` 미설정, 이후 호출이 빈 배열 promise를 재사용.
- **제안 수정:** catch 블록에 `idxLoading = null;` 추가해 재시도 허용.
- **파일:** [site/app.js](site/app.js) line 958 [lane:CORE]

---

### [M-372] — `toggleWishWithHint` — `authReady()` 대기 없이 `isLoggedIn()` 체크 → 초기화 레이스 시 false 반환 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 찜/인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 콜드 스타트 직후 찜 버튼 클릭 시 로그인 상태여도 인증 게이트 모달 표시.
- **원인:** [site/app.js](site/app.js) line 484–491 — 동기 함수에서 `authReady()` 대기 없이 `isLoggedIn()` 호출 (`toggleWish`는 `_gAuthReady` 체크 존재).
- **제안 수정:** `async` 함수로 변경 후 `await window.authReady()` 후 체크.
- **파일:** [site/app.js](site/app.js) line 484 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-373] — `run_all.py` `promote_all` — 트랜잭션 없는 demote→promote 루프, 중단 시 DB 부분 부패

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 루프 중 예외 발생 시 일부 카테고리만 promoted 상태로 남고 나머지는 pending으로 강등된 채 방치.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 79 — 전체 demote 후 per-category promote 루프에 `BEGIN/ROLLBACK` 없음.
- **제안 수정:** `with con:` 또는 명시적 `BEGIN/ROLLBACK`으로 전체 블록 래핑.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 79 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-374] — `detect_price_drops.py` `send` — `urlopen` HTTPError/URLError 미처리 → 푸시 알림 크래시

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 4xx/5xx 응답 또는 네트워크 오류 시 traceback으로 크래시, 이후 알림 발송 불가.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 131 — `urlopen` 예외 미처리.
- **제안 수정:** `try/except (urllib.error.URLError, urllib.error.HTTPError) as e:` 래핑 후 명확한 에러 출력.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 131 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-375] — `stamp_version.py` `_hash` — 파일 미존재 시 FileNotFoundError → 전체 파이프라인 중단

- **영역:** 백엔드 — 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `site/style.css` 등 누락 시 `run_all.py` `check=True` 호출에서 파이프라인 전체 중단.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 19 — `open()` 파일 존재 확인 없음.
- **제안 수정:** `if not os.path.exists(path): raise SystemExit(f"누락: {path}")` 명확한 오류 메시지 추가.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 19 [lane:BACKEND]

---

### [L-293] ✅ 검토완료·현행유지(2026-06-14, M·코드 실대조) — DELETE(29)~INSERT(53/67)~commit(80)이 단일 트랜잭션, 중간 커밋 없음 → INSERT 실패 시 DELETE 포함 롤백. 소실 없음. 오탐. — `column_fixes.py` `main` — DELETE 즉시 커밋 후 INSERT 실패 시 플래그 전체 소실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `DELETE FROM data_quality_flags` 자동 커밋 후 INSERT 도중 예외 시 품질 플래그 테이블이 빈 채로 남음.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 27 — sqlite3 기본 isolation_level이 각 DML 자동 커밋, DELETE→INSERT가 단일 트랜잭션 아님.
- **제안 수정:** `isolation_level=None` + 명시적 `BEGIN/COMMIT/ROLLBACK` 또는 INSERT-then-DELETE 순서로 변경.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 27 [lane:BACKEND]

---

### [L-294] ✅ 검토완료·현행유지(2026-06-14, L·설계) — DB_DEFAULT/QUEUE_OUT 상대경로이나 --db 인자 override(239) 제공, 파이프라인 cwd 실행 전제. — `verify_internal.py` — 모듈 레벨 경로(`QUEUE_OUT`, `DB_DEFAULT`)가 상대 경로 → cwd 의존

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 서브디렉토리에서 실행 또는 다른 스크립트에서 import 시 `verify_queue.json`이 엉뚱한 경로에 생성.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 12–13 — `QUEUE_OUT = "verify_queue.json"` 절대 경로 없음.
- **제안 수정:** `os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "verify_queue.json")` 사용.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 13 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-106] — `add_value_star.py` `main` — 파일 핸들 미닫힘 + 쓰기 실패 시 JSON 파일 절단

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `json.dump(d, open(PATH, "w"), ...)` 중 예외 시 파일이 부분 쓰기 상태로 절단, 파일 핸들 누수.
- **원인:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 30, 45, 48, 52 — `with` 문 없이 `open()` 직접 사용.
- **제안 수정:** 모든 파일 I/O를 `with open(...) as f:` 로 변경.
- **파일:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 30 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-376] — `add_value_star.py` `main` — `encoding` 미지정 `open()` → 비UTF 로케일에서 한국어 파싱 오류

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** Windows/비UTF 로케일 환경에서 한국어 포함 JSON 읽기 시 UnicodeDecodeError.
- **원인:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 30 — `open(PATH)` encoding 파라미터 없음.
- **제안 수정:** `open(PATH, encoding="utf-8")` 명시.
- **파일:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 30 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-377] — `export_site.py` `export` — `canonical_models` 누락 모델 `price=null` 무경고 출력

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canonical_models` 동기화 누락 모델이 `search.json`에서 `"p": null`로 출력, 검색 결과 가격 미표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 139–142 — `pr is None` 시 경고/스킵 없음.
- **제안 수정:** `if pr is None: logging.warning(f"가격 없음: {model}")` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 140 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-378] — `babysit.py` `main` — `promote_all` 중 예외 후 `con.commit()` → 검증 목록 전체 소실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `promote_all` 예외 발생 후 line 38의 `con.commit()`이 마스 pending 리셋 상태를 커밋, 전체 verified 상품이 pending으로 남음.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 35–38 — `promote_all(con)` + `con.commit()` 쌍에 try/except 없음.
- **제안 수정:** `try/except` 래핑 후 실패 시 `con.rollback()` 또는 SAVEPOINT 사용.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 37 [lane:BACKEND]

---

### [L-295] — `normalize.py` `parse_lumens` — 단위 없는 임의 숫자를 루멘으로 반환

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"20 단계 조명"` 같은 비루멘 문자열에서 `20.0lm` 반환 가능.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 117 — 루멘 단위 토큰이 optional `?`, 숫자만 있어도 매칭.
- **제안 수정:** `re.search(r"(\d[\d,.]*)\s*(?:lm|루멘|lumen)", s)` — 단위 필수화.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 117 [lane:BACKEND]

---

### [H-107] ✅ 해결완료(2026-06-13) — `applyStyleSort` — star 메트릭 없는 카테고리에서 `"spec:undefined"` sort key 설정

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** is_star 메트릭 없는 카테고리에서 스타일 칩 토글 시 `STATE.sortKey = "spec:undefined"` → 전체 목록 blank.
- **원인:** [site/app.js](site/app.js) line 1340 — `star[0] && star[0].key` 에서 `star` 빈 배열 시 undefined 생성.
- **제안 수정:** `STATE.sortKey = star.length ? "spec:" + star[0].key : "price_min";`
- **파일:** [site/app.js](site/app.js) line 1340 [lane:CORE]

---

### [H-108] ✅ 해결완료(2026-06-13) — `shareSet` 인코딩 — 대형 세트 `String.fromCharCode(...Uint8Array)` 스택 오버플로

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 10개 이상 아이템 세트 공유 시 `RangeError: Maximum call stack size exceeded` → "링크 생성에 실패했어요." 알림.
- **원인:** [site/app.js](site/app.js) line 3515 — `String.fromCharCode(...new Uint8Array(_utf8))` spread가 엔진 인수 개수 한계 초과.
- **제안 수정:** `let s = ''; for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);` 청크 루프로 교체.
- **파일:** [site/app.js](site/app.js) line 3515 [lane:CORE]

---

### [M-380] ✅ 해결완료(2026-06-13) — `view-set` 핸들러 — JSON 파싱 실패 시 `hiddenSections` 복원 누락 → 섹션 영구 숨김

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 잘못된 `?view-set=` 파라미터 처리 중 예외 시 wish/sets/logs/settings 섹션이 세션 동안 숨김 상태 유지.
- **원인:** [site/app.js](site/app.js) line 4189–4190 — `hiddenSections.forEach(el => el.style.display="none")` 이후 예외 발생 시 catch 블록에서 `close()` 미호출.
- **제안 수정:** catch 블록에서 `hiddenSections.forEach(el => el.style.display = "")` 복원 추가.
- **파일:** [site/app.js](site/app.js) line 4189 [lane:CORE]

---

### [L-297] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — L-254 수정으로 선택 브랜드를 show 선두 강제 추가(2876-81), 필터 후에도 active 칩 표시. 오탐. — `renderBrand` `renderChips` — 필터 입력 후 URL 기반 브랜드 active 칩 미표시

- **영역:** 프론트엔드 — 브랜드 페이지
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브랜드 칩 필터 입력 시 URL에서 pre-selected된 브랜드가 현재 표시 슬라이스에 없으면 active 칩 없음.
- **원인:** [site/app.js](site/app.js) line 2765 — `params.get("b")` 기준 active 비교, 필터 후 보이지 않는 브랜드는 매칭 실패.
- **제안 수정:** 선택된 브랜드를 클로저 변수 `currentBrand`에 저장, 항상 active 칩으로 표시.
- **파일:** [site/app.js](site/app.js) line 2765 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-109] — `run_all.py` `sh()` — `DB` 전역 변수 `main()` 호출 전 미설정 시 NameError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 테스트 import 또는 `main()` 미호출 경로에서 `sh()` 실행 시 `NameError: name 'DB' is not defined`.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 74 — `DB`가 `global` 선언으로만 존재, `main()` 호출 전 미초기화.
- **제안 수정:** `sh()`에 `db` 파라미터를 명시적으로 전달하거나 기본값 설정.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 74 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-381] — `run_all.py` `promote_all` — `capclause` f-string 직접 삽입으로 향후 SQL 인젝션 벡터

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `capclause`에 동적 값이 포함될 경우 SQL 인젝션 가능, 현재는 하드코딩이나 확장 시 취약점.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 89 — `capclause`가 f-string에 직접 삽입, 파라미터 바인딩 미사용.
- **제안 수정:** `capclause`를 정적 상수로 유지하거나 Python 분기로 처리.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 89 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-382] — `export_site.py` `export` — 이미지 서브쿼리 brand_id가 삭제된 rep 기준 → 다른 브랜드 이미지 오연결

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** canonical rep가 변경된 경우 이미지 서브쿼리가 잘못된 brand_id로 타 브랜드 이미지를 반환.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 112–116 — `SELECT brand_id FROM products WHERE id=?` 가 export rep 기준, canonical_models rep와 불일치 가능.
- **제안 수정:** outer `reps` 행에서 직접 `brand_id` 사용.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 112 [lane:BACKEND]

---

### [L-298] ✅ 검토완료·현행유지(2026-06-14, H·코드 실대조) — add_manual_models.py는 이미 with open(args.json)(116). 기수정. — `add_manual_models.py` `main` — 파일 핸들 미닫힘

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `json.load(open(args.json, encoding="utf-8"))` 파일 핸들 누수.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 — `with` 문 없음.
- **제안 수정:** `with open(args.json, encoding="utf-8") as fh: models = json.load(fh)`
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 [lane:BACKEND]

---

### [L-299] — `pipeline.py` `build_db` — 기존 DB 백업 없이 삭제

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 잘못된 경로로 실행 시 라이브 DB가 백업 없이 영구 삭제.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 55 — `os.remove(db_path)` 에 확인·백업 없음.
- **제안 수정:** 삭제 전 `<db_path>.bak.<timestamp>` 로 rename 또는 `--rebuild` 플래그 필수화.
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 55 [lane:BACKEND]

---

### [L-300] — `ocr_specs.py` `ocr_text` — tesseract 실패 시 stderr 무시로 데이터 손실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** tesseract 바이너리 미설치 또는 언어팩 오류 시 빈 텍스트 반환, 에러 로그 없음.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 88 — `r.returncode`·`r.stderr` 미검사.
- **제안 수정:** `if r.returncode != 0: logging.warning(r.stderr.decode())` 추가.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 88 [lane:BACKEND]

---

### [L-301] ✅ 해결완료(2026-06-14, A) — draw JSON-LD 빌드를 _modelIdx Map(O(1)) 조회로 교체. — `draw` 카드 렌더링 — `d.models.indexOf(m)` O(n²) 반복

- **영역:** 프론트엔드 — 성능
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 300개 모델 카테고리에서 필터/정렬 변경마다 90,000회 비교로 렌더 지연.
- **원인:** [site/app.js](site/app.js) line 2641, 2697 — `indexOf(m)` `.map()` 내부 반복 호출.
- **제안 수정:** `const modelIdx = new Map(d.models.map((m,i) => [m,i]))` 사전 계산 후 재사용.
- **파일:** [site/app.js](site/app.js) line 2641 [lane:CORE]

---

### [L-302] — `serializeState` — `brands` `|` 구분자 미인코딩으로 파이프 포함 브랜드명 파싱 오류

- **영역:** 프론트엔드 — URL 상태
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브랜드명에 `|` 포함 시 `restoreState`에서 잘못 분할.
- **원인:** [site/app.js](site/app.js) line 1283 — `[...STATE.brands].join("|")` 인코딩 없음.
- **제안 수정:** 각 브랜드 `encodeURIComponent` 후 join, 복원 시 `decodeURIComponent`.
- **파일:** [site/app.js](site/app.js) line 1283 [lane:CORE]

---

### [L-303] — `renderHotSection` — Supabase RPC `error` 미체크로 백엔드 오류 묵살

- **영역:** 프론트엔드 — 홈
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** Supabase RPC 오류 시 빈 데이터로 fallback 표시, 백엔드 스키마 오류 등 숨김.
- **원인:** [site/app.js](site/app.js) line 2868 — `{ data }` 만 구조분해, `error` 필드 폐기.
- **제안 수정:** `const { data, error } = ...; if (error) throw error;`
- **파일:** [site/app.js](site/app.js) line 2868 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-383] — `refresh.py` `_group_prices_by_cat` — category_id 비연속 정렬 시 동일 카테고리 가격 분할 집계

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** rowid 정렬 불안정으로 동일 category_id 행이 비인접 시 부분 집합만으로 중앙값 계산 → 이상치 판정 오류.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 78 — 스트리밍 방식으로 그룹 변경 감지, 비연속 행 처리 불가.
- **제안 수정:** SQL `GROUP BY category_id` 집계 또는 dict 누산기로 변경.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 78 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-384] — `refresh.py` `main` — `datetime('now')` UTC vs `observed_at` 로컬타임 불일치로 staleness 판정 오류

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** KST 환경에서 `age_days`가 9시간 과소 계산 → 신선하지 않은 상품이 재수집 대상에서 누락.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 127 — `datetime('now')` (UTC)와 Python `datetime.now()` (로컬) 혼용.
- **제안 수정:** `SELECT datetime('now','localtime')` 또는 `datetime.utcnow()` 일관 사용.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 127 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-385] — `detect_price_drops.py` `detect` — `in_stock` 컬럼 미기록으로 재입고 알림 불가

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `refresh.py`의 `_insert_price`가 `in_stock` 미설정 → 항상 NULL/0 → `prev_stock==0 and cur_stock==1` 불가 → 재입고 알림 전혀 발송 안 됨.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 97–98 — in_stock 의존 로직인데 [pipeline/refresh.py](pipeline/refresh.py) line 223 에서 in_stock 컬럼 INSERT 없음.
- **제안 수정:** `_insert_price`에 `in_stock` 컬럼 추가 또는 재입고 분기 비활성화.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 97 [lane:BACKEND]

---

### [L-304] — `affiliate_links.py` `sample` — `GROUP BY b.name_ko` 비집계 컬럼 비결정적 선택

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 같은 브랜드 내 어느 모델이 샘플로 선택될지 SQLite 스캔 순서에 따라 비결정적.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 63–64 — `GROUP BY b.name_ko`에서 `p.canonical_model` 비집계 컬럼 선택.
- **제안 수정:** `MIN(p.canonical_model)` 또는 `ORDER BY RANDOM()` 서브쿼리 사용.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 63 [lane:BACKEND]

---

### [M-386] ✅ 아카이브(빌드단계 필요, 우선순위 낮음) — `setupSearchPage` `openFromSearch` — 카테고리 JSON 캐시버스팅 `?v=` 미적용

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** CDN/브라우저 캐시가 구버전 카테고리 JSON 반환 시 모달 아이템 탐색 실패 → 전체 페이지 이동 fallback.
- **원인:** [site/app.js](site/app.js) line 1180 — `getJSON("data/${x.s}.json")` — 다른 getJSON 호출과 달리 `?v=<hash>` 없음.
- **제안 수정:** 빌드 시 카테고리 JSON URL에도 `?v=` 버전 해시 삽입.
- **파일:** [site/app.js](site/app.js) line 1180 [lane:CORE]

---

### [L-305] — `showToast` — `isHtml=true` 경로 `innerHTML` XSS 잠재 취약점

- **영역:** 프론트엔드 — UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 향후 사용자 콘텐츠가 `isHtml=true`로 토스트에 전달될 경우 임의 HTML 삽입 가능.
- **원인:** [site/app.js](site/app.js) line 515 — `t.innerHTML = msg` 에 sanitisation 없음.
- **제안 수정:** DOM API로 링크 구성 또는 `isHtml` 경로 제거, 필요 시 DOMPurify 적용.
- **파일:** [site/app.js](site/app.js) line 515 [lane:CORE]

---

### [L-306] — `newSet` — `Date.now().toString(36)` ID 동일 밀리초 내 중복 가능

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 모바일 더블탭 등으로 동일 ms 내 세트 생성 시 ID 충돌, `addToSet`이 첫 번째 세트에만 아이템 추가.
- **원인:** [site/app.js](site/app.js) line 521 — `Date.now().toString(36)` 1ms 해상도, 유니크 보장 없음.
- **제안 수정:** `` `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}` `` 랜덤 접미사 추가.
- **파일:** [site/app.js](site/app.js) line 521 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-110] — `normalize_models.py` `normalize_db` — `canonical_models` DROP+재생성 트랜잭션 없음 → 크래시 시 테이블 소실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** DROP TABLE 후 CREATE/INSERT 전 프로세스 중단 시 `canonical_models` 테이블 없어져 export·verify 등 하위 스크립트 전체 실패.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 209 — DROP + CREATE + INSERT 블록에 SAVEPOINT/ROLLBACK 없음.
- **제안 수정:** `BEGIN`/`COMMIT` 또는 `SAVEPOINT nm` + `ROLLBACK TO nm`으로 전체 블록 래핑.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 209 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-387] — `validate_ranges.py` `validate_db` — `rederive_thickness`로 `value_normalized=NULL`된 행이 `valid=1` 재설정

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `rederive_thickness` 후 `value_normalized=NULL`이지만 `valid=1`인 행이 export에서 "데이터부족" 배지로 출력, 슬롯 낭비.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 416 — 전체 `valid=1` 리셋이 rederive_thickness 결과도 덮어씀.
- **제안 수정:** rederive_thickness 후 `value_normalized IS NULL`인 행에 `valid=0` 설정.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 395 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-388] — `export_site.py` `export` — rep 제품만 스펙 조회 → 비-rep variant에만 있는 스펙 누락

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** canonical 그룹의 rep와 canonical_models.rep_product_id 불일치 시 존재하는 스펙이 "데이터부족"으로 표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 91 — `v.product_id=rep` 단일 제품만 조회.
- **제안 수정:** 그룹 내 전체 제품 JOIN 후 `MAX(v.value_normalized)` 또는 non-NULL 우선 선택.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 91 [lane:BACKEND]

---

### [L-307] ✅ 해결완료(2026-06-14, H) — graph_full.harvest_node를 try/finally로 감싸 ingest/commit 예외 시에도 con.close()(M-235 동일 패턴). — `graph_full.py` `harvest_node` — 예외 발생 시 SQLite 커넥션 미닫힘

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `HT.ingest()` 예외 시 `con.close()` 미실행으로 SQLite 커넥션 누수.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 77 — `con.close()`가 예외 경로에서 미호출.
- **제안 수정:** `try/finally: con.close()` 추가.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 79 [lane:BACKEND]

---

### [L-308] — `pipeline.py` `_assign_gf_code` — 동시 실행 시 `COUNT(*)` 기반 seq 중복 가능

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 병렬 `enrich_node` 스레드에서 동일 seq 계산 후 둘 다 gf_code 할당 시도 → 중복 코드.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 109 — `COUNT(*)` 읽기와 INSERT 사이 다른 스레드 진입 가능.
- **제안 수정:** `gf_code`에 UNIQUE 제약 + `IntegrityError` 재시도 또는 sequence 테이블 사용.
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 109 [lane:BACKEND]

---

### [L-309] ✅ 검토완료·현행유지(2026-06-14, L·코드 실대조) — resolved_set 40자(false-positive 스킵)와 insert_flags 80자(열린 중복 방지)는 목적이 다른 두 메커니즘, 각자 내부 일관. 최종 INSERT는 insert_flags 80자 dedup가 게이트 → 실제 이중삽입 없음. — `verify_internal.py` `main` — resolved_set 40자 vs insert_flags 80자 prefix 불일치

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 40자 resolved 필터가 80자 기준 insert와 불일치 → 잘못 억제된 플래그가 verify_queue.json에 잔류 가능.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 267 — `note[:40]` 기준 필터, `insert_flags`는 `note[:80]` 사용.
- **제안 수정:** 두 곳 모두 동일 prefix 길이(80자) 적용.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 267 [lane:BACKEND]

---

### [H-118] ✅ 해결완료(2026-06-14, HF) (xcode) — `header.top` — iOS 상태바 safe area 미적용: 앱 아이콘·타이틀 시간 표시와 겹침 + 계정 아이콘 탭 불가
> 수정: style.css header.top에 `padding-top:max(18px,env(safe-area-inset-top))` 적용(L33). iOS 상태바/Dynamic Island 겹침·계정 아이콘 탭 차단 해소.

- **영역:** 프론트엔드 — iOS Capacitor
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상 1 (시각):** iPhone 17 Dynamic Island 모델에서 iOS 상태바 좌측 시간/날짜 표시가 앱 로고 아이콘·"장비의 숲" 타이틀 텍스트와 겹쳐 양쪽 모두 가독성 저하.
- **증상 2 (기능):** 헤더 우상단 계정 아이콘(👤)을 여러 번 탭해도 account.html로 이동하지 않음. 상태바 터치 인터셉트 영역(~54pt) 안에 아이콘이 위치해 탭 이벤트가 앱에 전달되지 않음. 결과적으로 마이페이지 접근 경로가 완전히 막힘.
- **원인:** [site/style.css](site/style.css) `header.top{padding:18px 0}` — `env(safe-area-inset-top)` 미적용. `.pmodal`은 동일 이유로 이미 수정됐으나 헤더 누락.
- **제안 수정:** `header.top{padding-top:max(18px, env(safe-area-inset-top))}` 추가.
- **파일:** [site/style.css](site/style.css) line 33 [lane:FRONTEND]

### [M-389] ✅ 해결완료(2026-06-14, C) — 카테고리→홈 페이지 이동 후 별점 설명 툴팁 잔류
> 확인: 모달 close()가 spec-tip-bubble을 숨김(M-425, app.js L2246) + MPA라 실제 페이지 이동 시 툴팁 파괴 → 잔류 미발생(기해결).

- **영역:** 프론트엔드 — UI 상태 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 목록에서 가성비 `(?)` 툴팁을 열고 홈(브레드크럼 "홈" 클릭)으로 이동하면 홈 화면 상단에 툴팁("별점은 같은 그룹 안에서의 순위를 환산한 값이에요.")이 계속 표시됨. 수동으로 × 버튼을 눌러야 사라짐.
- **원인:** 툴팁 상태가 페이지 전환 시 자동 정리되지 않음. `renderCatList` 또는 라우팅 진입 시 `closeTooltip()` 미호출.
- **제안 수정:** 페이지 전환(popstate·navigate) 이벤트에서 활성 툴팁 닫기 처리 추가.
- **파일:** [site/app.js](site/app.js) tooltip 관련 함수 [lane:FRONTEND]

### [M-390] ⏸ 보류(xcode iOS 키보드 뷰포트 이슈, 기기 재현 필요) — 검색 포커스 후 헤더 계정 아이콘 사라짐

- **영역:** 프론트엔드 — UI 레이아웃
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 홈 화면 검색창을 탭해 포커스를 주면 헤더 우상단 계정 아이콘(👤)이 사라짐. 검색 닫기 후에도 복구되지 않음.
- **원인:** 검색 포커스 시 헤더 레이아웃이 변경되거나 `.header-acct` 요소가 `display:none`/`visibility:hidden` 처리될 가능성. iOS 키보드 표시 시 뷰포트 축소로 flex 아이템이 밀려날 수도 있음.
- **제안 수정:** 검색 활성/비활성 토글 시 `.header-acct` 표시 상태 보존 확인.
- **파일:** [site/app.js](site/app.js) 검색 초기화 로직, [site/style.css](site/style.css) [lane:FRONTEND]

### [L-310] (xcode) — `homeSearch` — 검색 닫기 후 검색창에 미완성 입력 텍스트 잔류

- **영역:** 프론트엔드 — 검색 UX
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 홈 화면 검색창에서 텍스트를 입력하다 키보드를 닫으면(완료/외부 탭) 입력 중이던 미완성 한글 자모(예: `ㄷ`)가 검색창에 남아있음. 검색 결과는 사라지지만 입력값은 초기화되지 않음.
- **원인:** 검색 blur 이벤트 시 검색 input 값 clear 미처리.
- **제안 수정:** 검색 `blur` 또는 `focusout` 시 결과가 없으면 input.value 초기화.
- **파일:** [site/app.js](site/app.js) home search 로직 [lane:FRONTEND]

---

### [M-389] ✅ 해결완료(2026-06-13) — `setupSearchPage` — 한글 IME 조합 중 `isComposing` 가드 없어 미완성 음절로 검색

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 한글 입력 조합 중 매 키스트로크마다 "ㅎㄹ" 같은 미완성 음절로 검색 실행.
- **원인:** [site/app.js](site/app.js) line 1243 — `input` 이벤트 핸들러에 `if (e.isComposing) return;` 없음 (홈/카테고리 검색은 처리됨).
- **제안 수정:** `if (e.isComposing) return;` 추가 + `compositionend` 리스너 보완.
- **파일:** [site/app.js](site/app.js) line 1243 [lane:CORE]

---

### [M-390] ✅ 해결완료(2026-06-13) — `draw` 필터 — 카테고리 내 브랜드 영문명 검색 0건

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 뷰에서 "helinox", "naturehike" 등 영문 브랜드명 입력 시 항상 0건.
- **원인:** [site/app.js](site/app.js) line 2596 — 필터 조건이 `m.brand + " " + m.model` 만 검사, `_brandAlias` 미포함 (홈 자동완성은 포함).
- **제안 수정:** `|| _brandAlias(m.brand).toLowerCase().includes(STATE.q)` 추가.
- **파일:** [site/app.js](site/app.js) line 2596 [lane:CORE]

---

### [M-391] — `clearAllFilters` — 스타일칩 해제 후 `STATE.sortKey` 미복원 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "필터 전체 해제" 클릭 후 정렬이 캠핑 스타일 기준(`spec:weight_min` 등)으로 유지, 공유 URL에 비맥락 정렬 포함.
- **원인:** [site/app.js](site/app.js) line 1937 — `STATE.campStyle = ""` 하지만 `STATE.sortKey` 미복원.
- **제안 수정:** `clearAllFilters` 내 `applyStyleSort(STATE.data)` 호출 추가(campStyle="" 상태에서 기본 정렬로 복귀).
- **파일:** [site/app.js](site/app.js) line 1937 [lane:CORE]

---

### [L-310] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — STATE.unit가 EXTRA_SPECS 단위 포함(M-336, 1541), 칩에 단위 표시됨(라이브 검증 'm²'). 오탐. — `renderActiveFilters` — EXTRA_SPECS 필터 활성 칩에 단위 누락

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 내수압 슬라이더 조정 시 활성 칩에 "내수압 500~3000" — 단위(mm) 미표시.
- **원인:** [site/app.js](site/app.js) line 1912 — `STATE.unit[k]`가 star 지표만 포함, EXTRA_SPECS 키 없음.
- **제안 수정:** `(EXTRA_SPECS[STATE.slug]||[]).find(e=>e.key===k)?.unit || ""` fallback 추가.
- **파일:** [site/app.js](site/app.js) line 1912 [lane:CORE]

---

### [L-311] — `diagnoseEmpty` / `passExcept` — 가성비순 정렬 암묵적 제외 진단 미지원

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 가성비 정렬+필터 조합으로 0건 시 "가성비 데이터 없는 모델 제외"가 원인으로 제시 안 됨.
- **원인:** [site/app.js](site/app.js) line 2014 — `passExcept`가 `k==="value"` 암묵 제외 미처리.
- **제안 수정:** `passExcept`에 value 정렬 null 제외 조건 추가, diagnoseEmpty에 해당 설명 항목 추가.
- **파일:** [site/app.js](site/app.js) line 2014 [lane:CORE]

---

### [L-312] ✅ 해결완료(2026-06-14, D) — openSetDetail _onKey에 _trapTab Tab 트랩 추가. — `openSetDetail` — Tab 포커스 트랩 미구현 (WCAG 2.1.2 위반)

- **영역:** 프론트엔드 — 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 세트 상세 모달에서 Tab 연속 입력 시 포커스가 모달 밖으로 이탈.
- **원인:** [site/app.js](site/app.js) line 3040 — `modal._onKey`가 ESC만 처리, Tab 순환 없음 (`openProduct`는 완전 구현됨).
- **제안 수정:** `openProduct`의 Tab 순환 로직을 `openSetDetail`에도 동일 적용.
- **파일:** [site/app.js](site/app.js) line 3040 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-392] — `promote_catalog.py` `main` — `UPDATE products SET curation_status='pending'` WHERE 절 없어 트랜잭션 미보호

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 전체 demote 후 re-promote 쿼리 크래시 시 모든 상품이 pending으로 남음.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31 — 두 UPDATE 쌍에 savepoint/rollback 없음.
- **제안 수정:** SAVEPOINT로 demote→promote 블록 래핑, 예외 시 ROLLBACK.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 31 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-393] — `seed_coupang.py` `load` — `rep_product_id` 비정수 CSV 행에서 ValueError 크래시

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 빈 행·공백 포함 시 `int(r["rep_product_id"])` ValueError로 전체 로드 중단, 이전 적용 행도 커밋 안 됨.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 87 — strip/검증 없이 직접 `int()` 캐스팅.
- **제안 수정:** `if not r.get("rep_product_id","").strip(): continue` 및 try/except ValueError 추가.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 87 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-394] — `refresh.py` `main` — 크롤 루프 내 `con.commit()` → 중단 시 dedup 상태 불일치

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** SIGINT/네트워크 오류로 중단 시 일부 candidate만 커밋, 다음 실행에서 `pcode2pid` dedup이 미커밋 상품을 건너뛰거나 중복 삽입.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 166 — candidate 루프 내부 `con.commit()`, 트랜잭션 범위가 너무 좁음.
- **제안 수정:** `con.commit()`을 루프 외부(페이지 단위 또는 태스크 단위)로 이동.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 166 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-395] — `check_export.py` `load_models` — JSON 파싱 실패 silent 스왈로우로 배포 게이트 무력화

- **영역:** 백엔드 — 빌드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 손상된 데이터 파일이 `except Exception` 로 빈 리스트 반환 → 위반 없음으로 처리, 잘못된 배포 통과.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 44–45 — 광범위 except로 게이트가 항상 통과.
- **제안 수정:** 예외 재raise 또는 main()에서 파일 파싱 실패 시 exit code 1 반환.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 44 [lane:BACKEND]

---

### [L-313] ✅ 검토완료·현행유지(2026-06-14, H·코드 실대조) — pipeline.build_db는 schema.sql/reference.sql 모두 with open(65-68). 기수정. — `pipeline.py` `build_db` — schema 파일 핸들 미닫힘

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `open(...).read()` 패턴으로 schema.sql/reference.sql 핸들 누수, 반복 호출 시 FD 소진.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 58–59 — `with` 문 없음.
- **제안 수정:** `with open(...) as f: con.executescript(f.read())`
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 58 [lane:BACKEND]

---

### [L-314] ✅ 해결완료(2026-06-14, H) — pipeline.py whitelist.csv를 with open()으로 감싸 핸들 확정 닫기(341). — `pipeline.py` `main` — `whitelist.csv` 파일 핸들 미닫힘

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `csv.DictReader(open(...))` 핸들이 GC까지 미닫힘, 반복 실행 시 FD 소진.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 319 — context manager 없음.
- **제안 수정:** `with open(...) as f: rows = list(csv.DictReader(f))`
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 319 [lane:BACKEND]

---

### [M-396] — `buildFilters` cap 클릭 핸들러 — 이미 활성화된 인원 버튼 재클릭 시 해제 불가 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 인원 필터 칩 재클릭 시 동일 값으로 재설정, 해제 불가 — 브랜드 칩은 동일 패턴 없음(re-click on delete).
- **원인:** [site/app.js](site/app.js) line 1791–1793 — `STATE.cap = btn.dataset.cap` 무조건 설정, toggle 없음.
- **제안 수정:** `if (STATE.cap === btn.dataset.cap) { STATE.cap = ""; ... } else { STATE.cap = ...; }` 토글 추가.
- **파일:** [site/app.js](site/app.js) line 1791 [lane:CORE]

---

### [M-397] — `restoreState` — `STATE.brands` 재호출 시 누산 (clear 없음) — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — URL 상태
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `restoreState` 두 번째 호출(popstate 등) 시 브랜드 Set이 누적, 잘못된 필터 복원.
- **원인:** [site/app.js](site/app.js) line 1302 — `STATE.brands.add(b)` 전 `STATE.brands.clear()` 없음.
- **제안 수정:** `if (br)` 블록 전에 `STATE.brands.clear()` 추가.
- **파일:** [site/app.js](site/app.js) line 1302 [lane:CORE]

---

### [L-315] — `passRange` — null 스펙 값 가진 모델이 슬라이더 기본 범위에서도 제외

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 부동소수점 오차로 `{min: undefined}` 객체가 STATE.range에 잔류 시 해당 스펙 없는 모델 전체 제외.
- **원인:** [site/app.js](site/app.js) line 2001 — `if (v == null) return false` 범위 미확인 무조건 제외.
- **제안 수정:** `if (v == null) return !(r.min != null || r.max != null)` — 범위가 실제 제한될 때만 제외.
- **파일:** [site/app.js](site/app.js) line 2001 [lane:CORE]

---

### [L-316] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — 단방향 범위는 ≤/≥로 처리(M-313, 1995-97), fmt(null)='' 반환으로 undefined 미노출. 오탐. — `renderActiveFilters` — 범위 필터 칩에 최솟값 미설정 시 `undefined` 텍스트 노출

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** max-only 필터 활성 시 "가격 undefined~150000원" 형태로 표시.
- **원인:** [site/app.js](site/app.js) line 1910–1921 — `fmt(r.min)` 이 undefined 반환 시 템플릿 리터럴에 그대로 삽입.
- **제안 수정:** `fmt(r.min ?? "")` 또는 `r.min != null ? fmt(r.min) : ""` 처리.
- **파일:** [site/app.js](site/app.js) line 1910 [lane:CORE]

---

### [L-317] — `openProduct` wish 버튼 — 클릭 즉시 `innerHTML` 리셋으로 로그인 게이트 시 라벨 소실

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 비로그인 상태에서 찜 버튼 클릭 시 토글 미실행에도 버튼 내 라벨 텍스트 사라짐.
- **원인:** [site/app.js](site/app.js) line 2126 — `wbtn.innerHTML = BOOKMARK_SVG` 가 toggle 결과 확인 전 실행.
- **제안 수정:** innerHTML 리셋을 toggle 콜백 내 confirmed 이후로 이동.
- **파일:** [site/app.js](site/app.js) line 2126 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-398] — `verify_internal.py` `flag_issue` — `data_quality_flags` 인덱스 없어 플래그 쓰기마다 풀 스캔

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 제품/플래그 수 증가 시 스캐너 전체 실행이 O(n²)으로 느려짐.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 183–193 — `data_quality_flags(product_id, flag_type, resolved)` 복합 인덱스 없음.
- **제안 수정:** `CREATE INDEX idx_dqf_lookup ON data_quality_flags(product_id, flag_type, resolved);`
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 183 [lane:BACKEND]

---

### [L-318] ✅ 검토완료·현행유지(2026-06-14, H·코드 실대조) — build_backpacking_bag.py JSON 입출력 모두 with open(219·226·235). 기수정. — `build_backpacking_bag.py` `main` — JSON 파일 핸들 미닫힘

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 쓰기 중 예외 시 파일 반쓰기 상태로 핸들 누수.
- **원인:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 215, 221, 228 — `open()` 직접 사용, `with` 없음.
- **제안 수정:** 모든 파일 I/O를 `with open(...) as f:` 로 변경.
- **파일:** [pipeline/build_backpacking_bag.py](pipeline/build_backpacking_bag.py) line 215 [lane:BACKEND]

---

### [L-319] — `limits_map.py` `main` — `encoding="utf-8"` 없이 한국어 Markdown 쓰기

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 비UTF 로케일에서 카테고리명·이모지가 포함된 LIMITS.md 쓰기 오류.
- **원인:** [pipeline/limits_map.py](pipeline/limits_map.py) line 187 — `open(args.out, "w")` encoding 없음.
- **제안 수정:** `open(args.out, "w", encoding="utf-8")`
- **파일:** [pipeline/limits_map.py](pipeline/limits_map.py) line 187 [lane:BACKEND]

---

### [L-320] — `normalize.py` `__main__` — `-O` 최적화 모드에서 `assert` 자동 제거

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `python -O normalize.py` 실행 시 자가 테스트 전체 무음 스킵, exit 0 반환.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 181–190 — `assert` 구문으로 검증, `-O` 모드에서 제거됨.
- **제안 수정:** `if actual != expected: raise AssertionError(...)` 명시적 체크 또는 unittest 이동.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 181 [lane:BACKEND]

---

### [M-399] ✅ 해결완료(2026-06-13) — recommend `picks` 필터 — `m.specs.X` 미존재 시 `TypeError` 크래시

- **영역:** 프론트엔드 — 추천
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `floor_area`·`capacity_mah` 스펙 없는 모델이 picks 필터에 포함되면 TypeError로 추천 섹션 전체 렌더 실패.
- **원인:** [site/app.js](site/app.js) line 315, 321, 326 — `m.specs.floor_area.badge` 등 옵셔널 체이닝 없음.
- **제안 수정:** `m.specs.floor_area?.badge !== "외형기준"`, `(m.specs.capacity_mah?.value ?? Infinity) <= 100000`
- **파일:** [site/app.js](site/app.js) line 315 [lane:CORE]

---

### [L-321] — `buildFilters` 스펙 슬라이더 — `Math.min/max(...vals)` 대형 배열 스택 오버플로 위험

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 수천 개 모델 카테고리에서 `Math.min(...vals)` spread가 엔진 인수 한계 초과 시 RangeError.
- **원인:** [site/app.js](site/app.js) line 1624 — `Math.min(...vals)` spread, line 1607·1652 동일 패턴.
- **제안 수정:** `vals.reduce((a, b) => Math.min(a, b), Infinity)` 로 교체.
- **파일:** [site/app.js](site/app.js) line 1624 [lane:CORE]

---

### [L-322] — `buildFilters` — `fsheet-head`/`fsheet-foot` DOM 잔류 시 카테고리 재진입에서 중복 삽입

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `catBody` 재렌더 후 `filtoggle` 사라지면 가드 통과 → `fsheet-head`/`fsheet-foot` 중복 생성.
- **원인:** [site/app.js](site/app.js) line 1764 — 삽입 가드가 `filtoggle` 존재만 체크, `fsheet-head` 미체크.
- **제안 수정:** `aside.querySelector('.fsheet-head')` 존재 확인 가드 추가.
- **파일:** [site/app.js](site/app.js) line 1764 [lane:CORE]

### [L-311] (xcode) ✅ 해결완료(2026-06-14, C) — star 슬라이더 displayUnit를 _UNIT_DISPLAY로 매핑(m2→m²), 정적·드래그 라벨 모두 적용. — 필터 모달 바닥면적 단위 `m2` — `m²` 미적용

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 필터 슬라이더 "바닥면적" 범위 레이블이 `1.3m2`, `6.4m2`로 표시됨. 상품 목록 카드에서는 동일 스펙이 `1.42m²` (유니코드 위첨자)로 정상 표시되어 불일치.
- **원인:** 필터 슬라이더 레이블 렌더링 시 단위를 plain text로 출력, `²` 유니코드 또는 `<sup>2</sup>` 미적용.
- **제안 수정:** 필터 슬라이더 레이블에서 `m2` → `m²` 치환 또는 단위 렌더링 함수 통일.
- **파일:** [site/app.js](site/app.js) 필터 슬라이더 렌더 로직 [lane:FRONTEND]

### [L-312] (xcode) ✅ 해결완료(2026-06-14, C) — 슬라이더 라벨 +(+v).toFixed(1)로 정수 .0 제거(정적 1697·드래그 1886/2044). — 필터 슬라이더 레이블 정수값에 불필요한 `.0` 소수점 표시

- **영역:** 프론트엔드 — 필터 UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 필터 슬라이더 최솟값/최댓값 레이블이 `450.0mm`, `20000.0mm`, `0.0`, `100.0` 등 정수에 `.0`을 붙여 표시. 사용자 가독성 저하.
- **원인:** 슬라이더 값이 `Number.toFixed(1)` 또는 유사 방식으로 포맷팅되어 정수에도 소수점 한 자리 강제 출력.
- **제안 수정:** 정수 여부 판별 후(`v % 1 === 0`) 소수점 생략, 또는 유효 소수점만 표시하는 포맷 함수 적용.
- **파일:** [site/app.js](site/app.js) 필터 슬라이더 레이블 포맷 함수 [lane:FRONTEND]

---

### ✅ 해결완료(2026-06-13) [H-111] — `validate_ranges.py` `ensure_implausible_flagtype` — `products` 빈 테이블 시 `TypeError` + SAVEPOINT 미해제

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `products` 테이블이 비어있을 때 `fetchone()` → `None`, `pid[0]` → `TypeError`. `except sqlite3.IntegrityError`가 TypeError를 잡지 못해 `SAVEPOINT t` 미해제 → 이후 `executescript()` 트랜잭션 충돌.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 79–87 — None 체크 없이 `pid[0]` 직접 접근, catch 범위가 `IntegrityError`만.
- **제안 수정:** `pid = con.execute("SELECT id FROM products LIMIT 1").fetchone()` 직후 `if pid is None: con.execute("RELEASE t"); return` 추가.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 79 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-112] — `promote_catalog.py` vs `run_all.py` — 텐트 `CORE` 기준 불일치로 단독 실행 시 강등 오작동

- **영역:** 백엔드 — 카탈로그 프로모션
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `promote_catalog.py`의 `CORE = ["weight_min", "water_head", "floor_area"]`(water_head 필수)와 `run_all.py`의 텐트 core `["weight_min", "floor_area"]`(water_head 제외)가 달라, 단독 실행 시 내수압 미공개 브랜드(힐레베르그·콜맨 등) 제품이 pending으로 강등됨.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 18 — `run_all.py` 의도(내수압=선택)가 반영 안 됨.
- **제안 수정:** `promote_catalog.py`의 `CORE`를 `run_all.py` `CATEGORIES` 레지스트리에서 import해 일치시킴.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 18 [lane:BACKEND]

---

### [H-113] ✅ 해결완료(2026-06-13) — `openReplaceModal` — 스플라이스 인덱스 stale로 잘못된 아이템 삭제

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** "빼고 담기" 클릭 시 `set.items.splice(+btn.dataset.ii, 1)` — `data-ii`는 렌더 시점 인덱스. 배열이 중간에 변경되면 다른 아이템이 삭제됨.
- **원인:** [site/app.js](site/app.js) line 661 — 위치 인덱스로 splice, pcode 기반 lookup 없음.
- **제안 수정:** `const ii = set.items.findIndex(x => x.pcode === item.pcode); if (ii >= 0) set.items.splice(ii, 1);`
- **파일:** [site/app.js](site/app.js) line 661 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-400] — `normalize_models.py` C 패스 — B 패스와 중앙값 계산 불일치로 이상치 경계 달라짐

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** C 패스는 `prices[(len(prices)-1)//2]`(하위 중앙값), B 패스는 `statistics.median`(짝수=평균) → 동일 데이터에서 이상치 경계 불일치, 한 패스 통과·다른 패스 격리 불일치.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 155 — H-83 수정이 B 패스만 적용, C 패스 누락.
- **제안 수정:** line 155를 `import statistics; med = statistics.median(prices)` 로 교체.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 155 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-401] — `pipeline.py` `build_db` — `executescript` 인자 `open()` 파일 핸들 누출

- **영역:** 백엔드 — DB 초기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `con.executescript(open(...).read())` 패턴 2곳 — `with` 없이 오픈, `executescript` 예외 시 핸들 영구 누출.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 58–59 — `with open()` 미사용.
- **제안 수정:** `with open(...) as f: con.executescript(f.read())` 로 교체.
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 58 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-402] — `detect_price_drops.py` 재입고 이벤트 — `old_price=None` 시 Supabase 타입 오류

- **영역:** 백엔드 — 가격 감지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 재입고 이벤트의 `old_price`에 `prev_min=None`이 그대로 전달되면 `{"old_price": null}` JSON이 Edge Function으로 전송되어 서버 측 타입 오류.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 95–102 — None 가드 없음.
- **제안 수정:** 재입고 이벤트 생성 전 `if prev_min is None: continue` 가드 추가.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 95 [lane:BACKEND]

---

### [M-403] — `renderAccount` — `myLogsList.dataset.loaded` 미초기화로 재로그인 시 이전 사용자 로그 표시 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그아웃 후 다른 계정으로 재로그인해도 `dataset.loaded === "1"` 유지 → 로그 재요청 없이 이전 사용자 데이터 표시.
- **원인:** [site/app.js](site/app.js) line 3152–3156 — `dataset.loaded` 플래그가 account.html의 `SIGNED_IN` 이벤트에서만 초기화, app.js 경로에서는 미초기화.
- **제안 수정:** `initAuth` 콜백에서 사용자 변경 이벤트 시 `myLogsList.dataset.loaded = ""` 초기화.
- **파일:** [site/app.js](site/app.js) line 3152 [lane:CORE]

---

### [M-404] ✅ 해결완료(2026-06-13) — account.html 찜 카드 — 동시 클릭 시 `STATE.slug`/`STATE.data` 경합으로 잘못된 스펙 표시

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 찜 카드를 빠르게 연속 클릭하면 두 비동기 콜백이 `STATE.slug`·`STATE.data`를 동시 변경, 두 번째 카드 모달에 첫 번째 카드의 카테고리 스펙이 표시됨.
- **원인:** [site/app.js](site/app.js) line 3343–3344 — 비행 중 fetch에 대한 가드 없음, `_onCloseOnce`는 마지막 오프너만 추적.
- **제안 수정:** 카드 클릭 시 in-flight 여부 체크 후 disable 또는 fetch 전 로컬 캡처.
- **파일:** [site/app.js](site/app.js) line 3343 [lane:CORE]

---

### [M-405] ✅ 해결완료(2026-06-13) — `openFromSearch` — `_onCloseOnce`가 `STATE.slug`/`STATE.data`를 `undefined`로 복원

- **영역:** 프론트엔드 — 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** search.html에서 상품 모달 닫기 시 `_onCloseOnce`가 `prev.slug`(=`undefined`)·`prev.data`(=`undefined`)로 STATE 복원 → 이후 `STATE.data` 참조 코드 TypeError.
- **원인:** [site/app.js](site/app.js) line 1183–1184 — `prev = { slug: STATE.slug, data: STATE.data }` 캡처 시 search.html에서 STATE가 `{}` 초기값이라 undefined.
- **제안 수정:** 복원 시 `STATE.slug = prev.slug ?? null; STATE.data = prev.data ?? null` 사용.
- **파일:** [site/app.js](site/app.js) line 1183 [lane:CORE]

---

### [L-323] — `normalize_models.py` C 패스 — B 패스 격리 결과에 의존하여 멱등성 위반 가능

- **영역:** 백엔드 — 데이터 정규화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** C 패스가 B 패스 이후 실행되므로 B 패스 격리 관측치가 C 패스 분포에서 빠짐 → 실행 순서에 따라 C 패스 결과 상이.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 148–164 — A/B 패스 이후 C 패스 실행으로 기준선이 이전 패스에 의존.
- **제안 수정:** C 패스를 독립 실행하거나 A 패스 경계 조건을 명시적으로 포함.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 148 [lane:BACKEND]

---

### [L-324] ✅ 검토완료·현행유지(2026-06-14, H·코드 실대조) — L-298과 동일, with open 사용 중. — `add_manual_models.py` — `open()` `with` 미사용으로 파일 핸들 누출

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 예외 발생 시 JSON 파일 핸들 영구 누출.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 — `json.load(open(args.json, encoding="utf-8"))` with 미사용.
- **제안 수정:** `with open(args.json, encoding="utf-8") as f: models = json.load(f)` 로 교체.
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 105 [lane:BACKEND]

---

### [L-325] ✅ 해결완료(2026-06-14, L) — insert_flags note_prefix 주석 50자→80자로 코드와 일치(verify_internal.py:183). — `verify_internal.py` — `note_prefix` 길이 주석과 실제 코드(80자) 불일치

- **영역:** 백엔드 — 검증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 변수명 주석은 "50자"인데 실제는 `note[:80]` — 유지보수 혼란, 중복 탐지 의도 모호.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 182 — 주석 미업데이트.
- **제안 수정:** 주석을 "note prefix 80자"로 수정 또는 상수 `NOTE_PREFIX_LEN = 80` 추출.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 182 [lane:BACKEND]

---

### [L-326] — `_reviewCard` — 전체 리뷰 본문(최대 2000자) DOM 삽입으로 레이아웃 오버플로 위험

- **영역:** 프론트엔드 — 리뷰
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 텍스트 전용 카드에서 `esc(r.body)` 전체 삽입 — CSS 클리핑되더라도 DOM에 2000자 유지, 레이아웃 시프트 가능.
- **원인:** [site/app.js](site/app.js) line 2246 — `.slice()` 트런케이션 없음.
- **제안 수정:** `esc((r.body||'').slice(0,80)) + ((r.body||'').length > 80 ? '…' : '')`
- **파일:** [site/app.js](site/app.js) line 2246 [lane:CORE]

---

### [L-327] — `acc-set-del` — 더블클릭 시 재렌더 후 stale `data-si` 인덱스로 엉뚱한 세트 삭제

- **영역:** 프론트엔드 — 계정/세트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 세트 삭제 버튼 더블클릭 시 첫 클릭이 splice+재렌더 후 인덱스 시프트 → 두 번째 클릭이 다른 세트 삭제.
- **원인:** [site/app.js](site/app.js) line 3526 — `arr.splice(+b.dataset.si, 1)` 위치 인덱스 사용, 클릭 후 버튼 disable 없음.
- **제안 수정:** 클릭 직후 버튼 disable 또는 세트 ID로 검색 후 splice.
- **파일:** [site/app.js](site/app.js) line 3526 [lane:CORE]

---

### [H-114] ✅ 해결완료(2026-06-13) — `openLogModal` — ESC 키 리스너 미등록으로 키보드로 모달 닫기 불가

- **영역:** 프론트엔드 — 로그 작성
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 다른 모달과 달리 `openLogModal`은 `document.addEventListener("keydown", onKey)` 없음 → Escape 키로 닫기 불가, 사용자 트랩.
- **원인:** [site/app.js](site/app.js) line 4130–4136 — ESC 키다운 핸들러 누락.
- **제안 수정:** `const onKey = e => { if (e.key === "Escape") close(); }; document.addEventListener("keydown", onKey);` 추가, close 시 `document.removeEventListener("keydown", onKey)`.
- **파일:** [site/app.js](site/app.js) line 4130 [lane:CORE]

---

### [H-115] ✅ 해결완료(2026-06-13) — `saveSets` — `localStorage.setItem` 예외 미처리로 QuotaExceededError 전파

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 스토리지 꽉 찼을 때 `QuotaExceededError`가 `addToSet`, `newSet`, `openSetDetail` 등 모든 호출 스택으로 전파, 세트 기능 전체 중단. `setWish`·`pushRecent`는 try/catch 있음.
- **원인:** [site/app.js](site/app.js) line 506 — `localStorage.setItem("gear_sets", JSON.stringify(a))` try/catch 없음.
- **제안 수정:** `try { localStorage.setItem(...) } catch(e) { /* 저장 실패 알림 */ }` 래핑.
- **파일:** [site/app.js](site/app.js) line 506 [lane:CORE]

---

### [M-406] — `backfillGfCodes` — `data/search.json` 버전 쿼리 없이 fetch → SW 구 캐시 서빙 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `fetch('data/search.json')` (버전 없음) — SW stale-while-revalidate가 구 캐시 반환 → 잘못된 gf_code 백필. 코드베이스 다른 곳은 모두 `?v=...` 사용.
- **원인:** [site/account.html](site/account.html) line 263 — 버전 쿼리 파라미터 누락.
- **제안 수정:** `fetch('data/search.json?v=f063da06')` (또는 동적 manifest 버전 참조).
- **파일:** [site/account.html](site/account.html) line 263 [lane:CORE]

---

### [M-407] ✅ 해결완료(2026-06-14) — `openLogModal` — 이전 Blob URL 미해제로 메모리 누출

- **영역:** 프론트엔드 — 로그 작성
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 이미지 선택 후 모달 재오픈 시 이전 세션의 `imgThumb.src` Blob URL이 revoke되지 않아 페이지 언로드까지 메모리 점유.
- **원인:** [site/app.js](site/app.js) line 4130–4136 — `body.innerHTML` 교체 전 이전 Blob URL revoke 없음.
- **제안 수정:** `openLogModal` 진입 시 `if (imgThumb?.src?.startsWith('blob:')) URL.revokeObjectURL(imgThumb.src)` 선행 처리.
- **파일:** [site/app.js](site/app.js) line 4130 [lane:CORE]

- **처리:** openLogModal 진입 시 body.innerHTML 교체 전 이전 `#lf-img-thumb` Blob URL revoke 추가. (2026-06-14)

---

### [M-408] ✅ 해결완료(M-357 포함, 2026-06-13) — account.html 찜 카드 fetch — `r.ok` 체크 없어 오류 페이지 JSON 파싱 실패 무음 처리

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 404·네트워크 오류 시 `r.json()` 실패, `catch (_) {}` 무음 스왑 → `location.href` 리다이렉트만 남음. `getJSON()`은 `r.ok` 체크 있음.
- **원인:** [site/app.js](site/app.js) line 3338–3351 — `fetch(...).then(r => r.json())` `r.ok` 미체크.
- **제안 수정:** `.then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })` 추가.
- **파일:** [site/app.js](site/app.js) line 3338 [lane:CORE]

---

### [M-409] — `renderAccount` — `setsEl.dataset.loginShown` 미초기화로 로그인 후에도 로그인 안내 잔류 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 계정/세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 비로그인 시 `loginShown="1"` 설정 후 로그인해도 플래그가 클리어되지 않아, `renderAccount` 재호출 시 로그인 안내 HTML이 실제 세트 콘텐츠로 교체되지 않음.
- **원인:** [site/app.js](site/app.js) line 3402–3409 — 로그인 전환 이벤트에서 `setsEl.dataset.loginShown` 클리어 없음.
- **제안 수정:** `SIGNED_IN` 이벤트 핸들러에서 `setsEl.dataset.loginShown = ""` 초기화.
- **파일:** [site/app.js](site/app.js) line 3402 [lane:CORE]

---

### [L-328] — `openSetDetail` `qty-dec` 핸들러 — stale `data-ii` 인덱스로 잘못된 아이템 수량 변경

- **영역:** 프론트엔드 — 세트 상세
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `qty-dec` 클릭 후 재렌더 전 두 번째 빠른 클릭이 stale `ii`로 엉뚱한 아이템 수량 감소. L-327 패턴 동일, 다른 핸들러.
- **원인:** [site/app.js](site/app.js) line 3056–3063 — 위치 인덱스 기반 접근, 클릭 후 disable 없음.
- **제안 수정:** 클릭 직후 버튼 disable 또는 pcode 기반 탐색.
- **파일:** [site/app.js](site/app.js) line 3056 [lane:CORE]

---

### [L-329] ✅ 해결완료(2026-06-14, G) — SHELL 프리캐시에서 community.html 제거(아카이브 페이지). — `sw.js` SHELL 프리캐시 — 비활성 `community.html` 불필요 캐시

- **영역:** 프론트엔드 — 서비스 워커
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `COMMUNITY_ENABLED=false`이지만 `community.html`이 SHELL 목록에 포함되어 모든 설치 시 프리캐시, 불필요한 캐시 용량 및 stale 비활성 페이지 서빙.
- **원인:** [site/sw.js](site/sw.js) line 9 — 비활성 페이지 미제거.
- **제안 수정:** `community.html`을 SHELL 배열에서 제거.
- **파일:** [site/sw.js](site/sw.js) line 9 [lane:CORE]

---

### [L-330] — `renderNicknameModal` — 닉네임 저장 버튼 더블클릭 경합으로 `setNickname` 중복 호출 가능

- **영역:** 프론트엔드 — 계정/닉네임
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `save.disabled = true` 설정 전 빠른 연속 클릭 시 두 `setNickname(v)` 호출 가능 → 닉네임 중복 업데이트.
- **원인:** [site/account.html](site/account.html) line 337–356 — `NICKNAME_RE.test(v)` 가드 이전에 버튼 disable 처리 없음.
- **제안 수정:** 핸들러 진입 즉시 `save.disabled = true` 설정, async 완료 후 상황에 따라 재활성화.
- **파일:** [site/account.html](site/account.html) line 337 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-116] — `ocr_specs.py` — `dv=0` 스펙 값 시 `else 1` 분기로 항상 "불일치" 오분류

- **영역:** 백엔드 — OCR 스펙 검증
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** comfort_temp=0°C 등 스펙 0인 제품이 매 OCR 실행마다 "불일치" 플래그 → `data_quality_flags` 오염.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 — `diff = abs(val - dv) / dv if dv else 1` — 0은 falsy라 `else 1`(100% diff) 반환.
- **제안 수정:** `diff = abs(val - dv) / dv if dv != 0 else (0 if val == 0 else 1)` 로 교체.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 214 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-410] — `check_export.py` — `price_max=0` 시 `영/음수가격` 미탐지

- **영역:** 백엔드 — 배포 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `pmax = m.get("price_max") or pmin` — `price_max=0`이면 pmin으로 대체, 이후 `영/음수가격` 체크가 pmin만 검사 → price_max=0 항목 미탐지.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — `or` 단락 평가로 0 무시, price_max 별도 검증 없음.
- **제안 수정:** `pmax = m.get("price_max") if m.get("price_max") is not None else pmin`, price_max 독립 양수 체크 추가.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-411] — `star_catalog.py` — `valid=0` 가격 관측치 포함으로 부정확한 별점 부여

- **영역:** 백엔드 — 별점 산출
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `flag_price_outliers`가 무효화한 관측치의 최저가가 별점 계산에 포함 → 이상치 가격 기반 별점 부정확.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 61–63 — `SELECT MIN(price_krw) FROM price_observations` WHERE valid=1 필터 없음.
- **제안 수정:** `WHERE valid=1` 조건 추가.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 61 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13·by-design) [M-412] — `fill_whitelist_specs.py` — `valid=0` 스펙도 "있음"으로 처리해 무효화 스펙 재수집 불가

- **영역:** 백엔드 — 스펙 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스펙이 `valid=0`으로 무효화되어도 `have` 집합에 포함 → 재수집 스킵, 제품이 영구 pending 상태 유지.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 70–72 — `AND psv.valid=1` 필터 없음.
- **제안 수정:** 쿼리에 `AND psv.valid=1` 추가 (의도적 설계라면 주석으로 명시).
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 70 [lane:BACKEND]

---

### [L-331] ✅ 검토완료·현행유지(2026-06-14, H·설계) — enrich 워커는 run_one try/except(129-140)로 lock 오류 캡처+persist timeout=30(109 주석), 잠금 비치명적 처리. 문서화된 설계. — `graph_full.py` — ThreadPoolExecutor 동시 SQLite 쓰기 잠금 오류 미처리

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `ENRICH_WORKERS=4` 스레드가 동일 SQLite 파일에 동시 쓰기 시 `OperationalError: database is locked` 발생, 재시도 없이 스펙 쓰기 유실.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 134–138 — 동시 쓰기에 대한 재시도 로직 없음.
- **제안 수정:** `PRAGMA journal_mode=WAL` 설정 또는 쓰기 큐를 단일 스레드로 제한.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 134 [lane:BACKEND]

---

### [L-332] — `resolve_duplicates.py` — `executemany` 후 `rowcount` 부정확으로 demote 카운트 오보고

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `executemany` 후 `cur.rowcount`는 마지막 반복 행 수만 반환 → `total_demoted` 출력이 실제보다 적게 표시.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 92–93 — Python sqlite3 rowcount는 executemany에서 미신뢰.
- **제안 수정:** 루프로 개별 `execute` 후 합산하거나 `len(losers)`를 직접 사용.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 92 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-117] — `export_site.py` — `star_eligible` NULL 행 시 외형기준 뱃지 "확정"으로 오표시

- **영역:** 백엔드 — 사이트 내보내기
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 컬럼 추가 이전 구 행에서 `star_eligible=NULL` → `row[2]=None` → `metric_badge(se=None)` → `None==0` False → 외형기준 값이 "확정"으로 잘못 표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 95 — `se = row[2] if row else 1` NULL 미처리.
- **제안 수정:** `se = row[2] if row and row[2] is not None else 1`
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 95 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-413] — `export_site.py` `canonical_models` — `canonical_model=NULL` 시 `LIMIT 1` 비결정적 행 반환

- **영역:** 백엔드 — 사이트 내보내기
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 브랜드에 `canonical_model=NULL` 제품이 여럿이면 `LIMIT 1` 결과가 비결정적 → 잘못된 가격·이미지 반환.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 106–108 — `ORDER BY` 없이 `LIMIT 1`.
- **제안 수정:** `ORDER BY id` 추가하거나 canonical_model=NULL 제품 별도 처리.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 106 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-414] — `value_metric.py` — `price_min=0` 또는 None 시 ZeroDivisionError / TypeError 크래시

- **영역:** 백엔드 — 가치 지표 산출
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `if not m.get("price_min"): continue` 가드가 0을 제외하지만 실제 재계산 타이밍에 따라 `price_min=0` 또는 None이 통과되면 `V = Q / m["price_min"]` → ZeroDivisionError 또는 TypeError.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 139, 170 — 가드 조건 불충분.
- **제안 수정:** `if not m.get("price_min") or m["price_min"] <= 0: continue`
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 139 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-415] — `resolve_duplicates.py` — 단독 실행 시 stale `rep_product_id`로 강등 제품 이미지·가격 노출

- **영역:** 백엔드 — 중복 해소
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `normalize_db()` 없이 단독 실행 시 `canonical_models.rep_product_id`가 이미 pending인 제품을 가리킬 수 있어 내보내기에서 강등 제품의 이미지·가격 표시.
- **원인:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 100 — stale rep 참조 무검증, UPDATE 0건을 에러로 처리하지 않음.
- **제안 수정:** UPDATE 후 `rowcount==0`이면 경고 또는 예외 처리. 또는 단독 실행 시 `normalize_db()` 선행 필수화.
- **파일:** [pipeline/resolve_duplicates.py](pipeline/resolve_duplicates.py) line 100 [lane:BACKEND]

---

### [L-333] — `graph_full.py` — 보강 대상 쿼리가 `water_head`·`floor_area`만 체크, `weight_min`·`packed_volume` 누락 제품 미선정

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `FILL_BY_CATEGORY`에 `weight_min`·`packed_volume`도 포함되지만 보강 대상 WHERE 절이 `water_head`/`floor_area` 부재만 확인 → 다른 필수 스펙 누락 제품이 선정 안 됨.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 105–114 — 하드코딩된 메트릭 체크.
- **제안 수정:** FILL_BY_CATEGORY 전체 메트릭에 대한 "임의 하나라도 누락" 조건으로 교체.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 105 [lane:BACKEND]

---

### [L-334] ✅ 검토완료·현행유지(2026-06-14, L·코드 실대조) — L-309와 동일. insert_flags가 동일 (pid,metric,flag_type,note80%) 미해결 flag 존재 시 skip(197). — `verify_internal.py` — `resolved_set` 40자 vs `insert_flags` 80자 prefix 불일치로 이중 삽입

- **영역:** 백엔드 — 내부 검증
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `resolved_set`은 note 40자 prefix로 빌드, `insert_flags` 중복 체크는 80자 → note 41~80자가 다른 플래그가 40자 prefix 일치로 resolved 처리되어 재삽입 누락 또는 반대로 과도 재삽입.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 261, 183 — 불일치 prefix 길이.
- **제안 수정:** 두 곳 모두 80자로 통일 또는 `(product_id, metric_id, check_key)` 튜플 기반 dedup.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 261 [lane:BACKEND]

---

### [L-335] — `normalize_models.py` — 순수 숫자 문자열 모델명 canonical 통과로 중복 미감지

- **영역:** 백엔드 — 모델 정규화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 색상 제거 후 `"32"` 같은 순수 숫자 2자 문자열이 GENERIC 집합·길이 가드를 통과 → 잘못된 canonical 모델 생성, 중복 미통합.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 176 — `len(canon) < 2` 가드, 숫자 전용 체크 없음.
- **제안 수정:** `len(canon) < 3` 또는 `canon.isdigit()` 조건 추가.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 176 [lane:BACKEND]

---

### [L-336] — `fill_whitelist_specs.py` — `collected_at` INSERT 누락으로 스펙 수집 타임스탬프 NULL

- **영역:** 백엔드 — 스펙 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `collected_at` 컬럼 미삽입 → DEFAULT 없으면 NULL, 감사 불가. `ocr_specs.py`는 명시적으로 삽입.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 95–97 — INSERT 컬럼 목록에 `collected_at` 없음.
- **제안 수정:** `collected_at=datetime('now')` 명시적 삽입 또는 스키마 DEFAULT 확인 후 주석.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 95 [lane:BACKEND]

---

### [L-337] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — 찜카드 go()가 fetch ok체크(3490)+실패 시 href 폴백(3503)으로 graceful 복구. 빈 슬러그는 드문 데이터이상, 낭비요청 1회뿐. — `renderAccount` 찜 카드 — `wx.s=""` 빈 문자열 시 `data/.json` 불필요 요청 후 무음 실패

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `wx.s`가 빈 문자열(`""`)이면 `!wx.s` 가드 통과, `fetch("data/.json")` 404 요청 발생 후 `catch (_) {}` 무음 처리.
- **원인:** [site/app.js](site/app.js) line 3337–3339 — `if (!wx.s)` 대신 falsy 검사만으로 빈 문자열 미처리.
- **제안 수정:** `if (!wx || !wx.s || typeof wx.s !== 'string' || wx.s.trim() === '')` 가드 강화.
- **파일:** [site/app.js](site/app.js) line 3337 [lane:CORE]

---

### [L-338] — `setupHomeSearch` `setActive` — ArrowUp 첫 입력 시 마지막-1 항목으로 이동 (off-by-one)

- **영역:** 프론트엔드 — 홈 검색
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 선택 없는 상태(`active=-1`)에서 ArrowUp 시 `setActive(-2)` → `(-2 + N) % N = N-2` → 마지막 항목 건너뜀.
- **원인:** [site/app.js](site/app.js) line 1002–1009 — 음수 모듈로 처리 미고려.
- **제안 수정:** `setActive(active < 0 ? opts.length - 1 : active - 1)` 또는 `((active - 1) % N + N) % N`.
- **파일:** [site/app.js](site/app.js) line 1002 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-416] — `value_metric.py` `rank_normalize` — 단일 모델 카테고리에 자동으로 별점 5.0 부여

- **영역:** 백엔드 — 가치 지표 산출
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스펙/가격 필터 후 적격 모델이 1개인 카테고리에서 해당 모델이 품질 무관 가치별점 5.0을 받음, 사용자 오해 유발.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 114 — `total==0` 시 `1.0` 반환 → `to_stars(1.0) = 5.0`.
- **제안 수정:** `len(eligible) < 2`이면 value score 계산 스킵.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 114 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-417] — `ocr_specs.py` `parse_specs` — `weight_min` OCR 추출 시 `min()` 사용으로 서브 부품 중량 반환

- **영역:** 백엔드 — OCR 스펙 파싱
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 코멘트는 "가장 큰 값=본체 추정"이나 실제 코드는 `min(kgs)` → 이너텐트·수납백 라벨 등 서브 부품 최저 중량이 `weight_min`으로 저장.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 103 — 주석과 코드 반전 (`min` vs `max`).
- **제안 수정:** `max(kgs)` 로 교체하고 주석 정확화. (또는 최솟값이 의도라면 주석 수정.)
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 103 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-418] — `detect_price_drops.py` — 같은 날 파이프라인 2회 실행 시 동일 날짜 관측치 비교로 오경보 가능

- **영역:** 백엔드 — 가격 감지
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동일 날 파이프라인이 2회 실행되면 `series[-2]`·`series[-1]`이 같은 날짜의 서로 다른 값이 되어 실제 변동이 없는 허위 가격 하락 알림 발생.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 94–96 — `series` 그루핑이 날짜 기준이나 중복 실행 시 같은 날 2행 가능.
- **제안 수정:** 날짜 기준 dedup 후 비교, 또는 `series[-2][0] == series[-1][0]` (날짜 동일) 가드 추가.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 94 [lane:BACKEND]

---

### [L-339] — `star_catalog.py` `stars()` — 전 제품 동일 값 시 5.0 반환으로 오해 유발

- **영역:** 백엔드 — 별점 산출
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 세그먼트 내 모든 제품 메트릭 값이 동일하면 `mx==mn` → 전원 5.0 별점. 중립 3.0이 더 적절.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 38–39 — `if mx == mn: return 5.0`.
- **제안 수정:** `return 3.0` 로 교체하거나 해당 메트릭 별점 생략.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 38 [lane:BACKEND]

---

### [L-340] — `normalize.py` `parse_dims_cm` — 혼합 단위 문자열("cm ... inch")에서 cm 값을 인치로 이중 변환

- **영역:** 백엔드 — 치수 파싱
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"210x130cm (83x51 inch inner)"` 같은 이중 언어 스펙에서 `"inch" in s` True → 이미 cm인 값도 인치→cm 재변환, `floor_area` 과대 계산.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 47–51 — 문자열 전체에서 inch 여부 판단, 각 숫자의 단위 귀속 미구분.
- **제안 수정:** 숫자 추출 시 각 숫자와 인접 단위를 함께 파싱, 또는 괄호 안 표현 우선 제거.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 47 [lane:BACKEND]

---

### [L-341] — `validate_ranges.py` `backfill_capacity_l` — 한국어 단위 후 `\b` 경계가 ASCII 기준으로 항상 매치

- **영역:** 백엔드 — 용량 추출
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `r"\d*\.?\d+\s*(?:ml|l|리터|ℓ)\b"` 에서 `\b` 뒤 한국어는 비단어문자라 경계 항상 성립 → `리터`, `ℓ` 뒤 의도한 부분 매칭 방지 효과 없음.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 120 — Python `re` ASCII word-boundary가 한국어 미지원.
- **제안 수정:** `re.UNICODE` 플래그 또는 `\b` 제거 후 숫자 범위 로직으로 검증.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 120 [lane:BACKEND]

---

### [H-118] ✅ 해결완료(2026-06-13) — `openProduct` — 모달 열린 상태에서 재호출 시 ESC 핸들러 중복 등록으로 포커스 이중 복원

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** pmodal이 열린 상태에서 `openProduct` 재호출 시 `onKey` 두 개가 `document`에 등록 → ESC 시 `close()` 두 번 실행, `prevFocus` 이중 복원, `_onCloseOnce` 첫 호출만 실행.
- **원인:** [site/app.js](site/app.js) line 2210 — `addEventListener("keydown", onKey)` 전 기존 리스너 제거 없음.
- **제안 수정:** `openProduct` 진입 시 `if (modal._onKey) document.removeEventListener("keydown", modal._onKey)` 선행 제거.
- **파일:** [site/app.js](site/app.js) line 2210 [lane:CORE]

---

### [M-419] ✅ 해결완료(2026-06-13) — `openProduct` `close()` — `onKey` TDZ 의존 취약 순서

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `close()` 내부에서 `removeEventListener(onKey)` 참조, `onKey`는 `close` 정의 이후(line 2200)에 선언 → 미래 리팩터링에서 `close()` 조기 호출 시 TDZ ReferenceError.
- **원인:** [site/app.js](site/app.js) line 2158–2210 — `close` → `onKey` 선언 역순, 암묵적 실행 순서 의존.
- **제안 수정:** `onKey`를 `close` 이전에 선언하거나 `modal._onKey` 프로퍼티로 참조.
- **파일:** [site/app.js](site/app.js) line 2158 [lane:CORE]

---

### [L-342] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조·오탐) — b는 price_min null시 폴백 사용. — `priceRange` — `b`(price_max) 파라미터 선언 후 미사용 (dead parameter)

- **영역:** 프론트엔드 — 가격 표시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `priceRange(a, b)` — `b`는 선언만 되고 함수 본문에서 미사용. 함수명이 범위를 암시하나 실제로는 min만 표시.
- **원인:** [site/app.js](site/app.js) line 337 — dead parameter.
- **제안 수정:** `b` 제거 후 `priceDisplay` 등으로 리네임, 또는 min~max 범위 표시 구현.
- **파일:** [site/app.js](site/app.js) line 337 [lane:CORE]

---

### [L-343] — `openFromSearch` — ESC로 상품 모달 닫을 때 검색 드롭다운도 함께 닫히는 UX 충돌

- **영역:** 프론트엔드 — 검색/상품 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 검색 드롭다운 열린 상태에서 상품 모달 ESC 종료 시 검색 `onKey`도 동시 발화 → 드롭다운 함께 닫힘, 재검색 필요.
- **원인:** [site/app.js](site/app.js) line 1095, 2200 — 두 `keydown` 핸들러가 모두 `document`에 등록, `stopPropagation` 없음.
- **제안 수정:** 모달 `onKey`에서 `e.stopPropagation()` 또는 검색 ESC 핸들러를 modal 열린 상태에서 비활성화.
- **파일:** [site/app.js](site/app.js) line 2200 [lane:CORE]

---

### [L-344] ✅ 검토완료·현행유지(2026-06-14, D·설계) — 재오픈 가드(159)+SPA 라우터 부재(account.html 전면 이동), close 미경유 누수 경로 없음. — `_showAuthGateModal` ESC 리스너 — SPA 라우팅 전환 시 cleanup 미실행

- **영역:** 프론트엔드 — 인증 게이트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `.agm-btn` 클릭 시 `removeEventListener` 실행되나, 미래 SPA 라우팅 도입 시 페이지 이동 후에도 `document` ESC 핸들러 잔류.
- **원인:** [site/app.js](site/app.js) line 163–165 — 현 full-reload 구조에서는 무해, SPA 전환 시 누출.
- **제안 수정:** `onKey` 정리를 `modal.classList.remove("on")` 시점에 항상 실행.
- **파일:** [site/app.js](site/app.js) line 163 [lane:CORE]

---

### [L-345] — `openSetModal` — Unicode 비공백(NBSP·ZWS) 세트명 유효성 검사 미통과

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `inp.value.trim()` 은 ASCII 공백만 제거 → ` `(NBSP)·`​`(ZWS) 등 유니코드 공백만으로 이루어진 세트명 생성 가능.
- **원인:** [site/app.js](site/app.js) line 622 — `String.prototype.trim()` 유니코드 공백 미처리.
- **제안 수정:** `/^\s*$/u.test(inp.value)` 또는 `.replace(/\s/gu, '').length === 0` 체크 추가.
- **파일:** [site/app.js](site/app.js) line 622 [lane:CORE]

---

### [L-346] ✅ 검토완료·현행유지(2026-06-14, D·설계) — L-262와 동일(필터시트 핸들러 재등록 가드+페이지 네비 폐기). — `_filterSheetKeyHandler` — 카테고리 페이지 이탈 후 ESC 핸들러 미제거로 CPU 낭비

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `buildFilters` 재호출 시만 교체, 다른 페이지로 이동 후 `document`에 잔류 → 매 ESC 키다운마다 이미 DOM에 없는 `aside` 참조 실행.
- **원인:** [site/app.js](site/app.js) line 1785–1787 — 페이지 이탈 cleanup 없음.
- **제안 수정:** 카테고리 페이지 언마운트 시 `document.removeEventListener("keydown", document._filterSheetKeyHandler)`.
- **파일:** [site/app.js](site/app.js) line 1785 [lane:CORE]

---

### [L-347] — `openProduct` `wbtn.onclick` — 찜 토글 전 불필요한 innerHTML 재설정으로 아이콘 순간 깜빡임

- **영역:** 프론트엔드 — 상품 모달/찜
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 찜 해제 클릭 시 `wbtn.innerHTML = BOOKMARK_SVG` → 잠깐 비채움 → `toggleWishWithHint`로 최종 상태 설정 → 아이콘 순간 깜빡임.
- **원인:** [site/app.js](site/app.js) line 2126 — `innerHTML` 무조건 초기화, 현재 상태 반영 없음.
- **제안 수정:** `innerHTML` 재설정 제거, `toggleWishWithHint`가 버튼 클래스·아이콘 직접 관리하도록 위임.
- **파일:** [site/app.js](site/app.js) line 2126 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-119] — `stamp_version.py` — `_hash()` 파일 부재 시 `FileNotFoundError` 미처리로 HTML 버전 스탬핑 중단

- **영역:** 백엔드 — 빌드/배포
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `style.css` 또는 `supabaseClient.js` 부재 시 `_hash()` FileNotFoundError → `app.js` search.json 패치는 완료되었으나 HTML `?v=` 미갱신, 불일치 배포.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 43–44 — 파일 존재 확인 없이 `_hash()` 호출.
- **제안 수정:** `try/except FileNotFoundError` 래핑 또는 진입 시 필수 파일 존재 검증.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 43 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-120] — `download_images.py` — 상수 서브쿼리로 `image_local=""` 행 재다운로드 대상 누락

- **영역:** 백엔드 — 이미지 다운로드
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `NOT EXISTS (SELECT 1 FROM (SELECT 1) WHERE ...)` — 내부 서브쿼리가 항상 1행 반환 → `NOT EXISTS`가 항상 False → 빈 `image_local` 행이 영구 누락.
- **원인:** [pipeline/download_images.py](pipeline/download_images.py) line 97–100 — 잘못된 서브쿼리 구조.
- **제안 수정:** `WHERE p.image_local IS NULL OR p.image_local = ''` 로 교체.
- **파일:** [pipeline/download_images.py](pipeline/download_images.py) line 97 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-420] — `crosssource.py` — `upsert()` 반환 False 시 무음 스킵, 잘못된 메트릭 키 데이터 유실

- **영역:** 백엔드 — 교차 소스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `mid is None`(메트릭 키 오타 등) 시 `upsert` False 반환 → `n` 미증가, 경고 없음 → 유효 데이터 무음 유실.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 190 — False 반환 시 진단 없음.
- **제안 수정:** `upsert()` False 반환 시 `print(f"[WARN] 미매핑 메트릭: {key}")` 추가.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 190 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-421] — `babysit.py` — `near` 목록 출력에 헤더 없어 보고서 구조 혼란

- **영역:** 백엔드 — 모니터링
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `near[:10]` 항목이 `[할 일]` 섹션 뒤 헤더 없이 출력 → 자동화 파서·사람 모두 혼란.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 112–114 — `near` 출력 라벨 없음.
- **제안 수정:** `print("--- 완비 근접 ---")` 헤더 추가 후 near 항목 출력.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 112 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-422] — `collect_images.py` — `polite_sleep(sleep, sleep)` 고정 간격으로 봇 탐지 위험

- **영역:** 백엔드 — 이미지 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** min=max=sleep → 지터 없는 고정 간격 요청 → 봇 탐지 신호.
- **원인:** [pipeline/collect_images.py](pipeline/collect_images.py) line 71 — `polite_sleep(sleep, sleep)`, 다운로드 모듈은 `polite_sleep(sleep, 2*sleep)` 사용.
- **제안 수정:** `polite_sleep(sleep, 2 * sleep)` 로 교체.
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 71 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-423] — `multicat.py` — `seen_names` 전 카테고리 공유로 다른 카테고리 동명 제품 중복 스킵

- **영역:** 백엔드 — 멀티 카테고리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 침낭·매트 등 다른 카테고리에 동일 모델명 토큰이 있으면 후행 카테고리 제품이 "dup_name"으로 무음 스킵.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 159, 222–228 — `seen_names`가 카테고리 경계 리셋 없이 전역 사용.
- **제안 수정:** 카테고리 루프 진입 시 `seen_names = set()` 리셋.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 159 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-424] — `enrich_details.py` — `danawa_pcode=NULL` 제품이 `IN (NULL, ...)` 절에서 미매칭으로 요약 누락

- **영역:** 백엔드 — 상세 보강
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--all` 경로에서 `danawa_pcode IS NOT NULL` 필터 없음 → NULL pcode 제품이 `IN` 절에서 SQL NULL 비교 실패 → 처리됐지만 요약 테이블 미등장.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 71–78 — `NOT NULL` 가드 없음.
- **제안 수정:** `--all` 쿼리에 `AND p.danawa_pcode IS NOT NULL` 추가.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 71 [lane:BACKEND]

---

### [L-348] — `normalize.py` — `parse_temp` 온도 추출 로직 `_num()` 미사용으로 중복 패턴 유지보수 위험

- **영역:** 백엔드 — 정규화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `parse_temp`이 `_num()` 대신 자체 regex 사용 → `_num()` 변경 시 `parse_temp` 미반영.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 129 vs line 13–15 — 패턴 중복.
- **제안 수정:** `parse_temp`에서 `_num()` 호출로 통일.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 129 [lane:BACKEND]

---

### [L-349] — `backfill_capacity.py` — `1.5P` 텐트 용량 `int(float(...))` 절단으로 1인용으로 오분류

- **영역:** 백엔드 — 용량 백필
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `1.5P` → `int(float("1.5"))` = 1 → 1.5인용 텐트가 1인용으로 저장, 필터/비교 오류.
- **원인:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 40 — `int()` 변환으로 소수 절단.
- **제안 수정:** `round()` 또는 `math.ceil()` 사용, 또는 `1.5P→2` 명시적 매핑.
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 40 [lane:BACKEND]

---

### [L-350] — `stamp_version.py` — 단일 따옴표 `src='app.js?v=...'` HTML 속성 버전 스탬프 미매칭

- **영역:** 백엔드 — 빌드/배포
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `app.js`, `style.css` 버전 regex가 큰따옴표만 처리 → 단일 따옴표 HTML 속성에서 스탬핑 무음 스킵.
- **원인:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 79–80 — `supabaseClient.js` regex(양쪽 따옴표 처리)와 불일치.
- **제안 수정:** `(['"])..(app\.js(\?v=[^'"]*)?)\1` 패턴으로 양쪽 따옴표 지원.
- **파일:** [pipeline/stamp_version.py](pipeline/stamp_version.py) line 79 [lane:BACKEND]

---

### [L-351] — `affiliate_links.py` `sample()` — 쿠팡 제품 링크 행에서 `naver_fallback` 키 없어 `KeyError`

- **영역:** 백엔드 — 제휴 링크
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `kind="product"` 반환 dict에 `naver_fallback` 없음 → `sample()` 출력 루프에서 KeyError.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 — 조건 없이 `link['naver_fallback']` 접근.
- **제안 수정:** `link.get('naver_fallback', '-')` 로 교체.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 74 [lane:BACKEND]

---

### [L-352] ✅ 검토완료·현행유지(2026-06-14, K·코드 실대조) — 공개키가 sb_publishable_ 신형식(JWT 아님, supabaseClient.js:5)이라 JWT 패턴 미매치. 오탐 없음. — `scan_secrets.py` — JWT 패턴이 공개 Supabase anon key를 오탐지할 수 있음

- **영역:** 백엔드 — 시크릿 스캔
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `r"eyJ..."` JWT 패턴이 의도적으로 코드베이스에 있는 Supabase anon key와 일치 → CI 허위 차단 가능.
- **원인:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 22–24 — anon key 컨텍스트 예외 처리 없음.
- **제안 수정:** `SUPABASE_ANON_KEY` 변수명 또는 `sb_publishable_` 접두사 허용 목록 추가.
- **파일:** [pipeline/scan_secrets.py](pipeline/scan_secrets.py) line 22 [lane:BACKEND]

---

### [H-121] ✅ 해결완료(2026-06-13) — `view-set` 공유 세트 모달 — ESC 키 핸들러 미등록으로 키보드 닫기 불가

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 공유 세트 모달이 backdrop·X 버튼 닫기만 지원, ESC 키 미작동 → 키보드 사용자 트랩.
- **원인:** [site/app.js](site/app.js) line 4197–4203 — `keydown` 리스너 미등록.
- **제안 수정:** `openProduct`·`openSetDetail` 패턴과 동일하게 ESC 핸들러 등록.
- **파일:** [site/app.js](site/app.js) line 4197 [lane:CORE]

---

### [M-425] ✅ 해결완료(2026-06-13) — `openProduct` `close()` — `#spec-tip-bubble` 툴팁 미숨김으로 모달 닫힌 후 잔류

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 스펙 `?` 툴팁 열린 상태에서 ESC/backdrop으로 모달 닫으면 툴팁이 `position:fixed`로 페이지 위에 남음.
- **원인:** [site/app.js](site/app.js) line 2164 — `close()` 함수에 `hideTip()` 호출 없음.
- **제안 수정:** `close()` 내 `hideTip()` 호출 추가.
- **파일:** [site/app.js](site/app.js) line 2164 [lane:CORE]

---

### [M-426] ✅ 해결완료(2026-06-13) — `serializeState` — `/` 경로 진입 시 `"category.html"` 상대 URL로 PWA 캐시 미스

- **영역:** 프론트엔드 — 라우팅
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `location.pathname = "/"` 일 때 `base = "category.html"` (상대 경로) → `replaceState("category.html?cat=...")` → SW가 `/category.html?cat=...`과 다른 키로 캐시, 직접 로드 시 오류 가능.
- **원인:** [site/app.js](site/app.js) line 1301–1303 — 루트 경로 미처리.
- **제안 수정:** `base = location.pathname.includes("category.html") ? location.pathname : "/category.html"`.
- **파일:** [site/app.js](site/app.js) line 1302 [lane:CORE]

---

### [L-353] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — 상품모달 close가 spec-tip 버블 hide(2259, M-425), 버블 싱글톤이라 잔류 없음. — `openReviewDetail` `close()` — 부모 모달 스펙 툴팁 잔류

- **영역:** 프론트엔드 — 리뷰 상세
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 리뷰 상세 닫힌 후 부모 상품 모달에서 열려있던 스펙 툴팁이 계속 표시.
- **원인:** [site/app.js](site/app.js) line 2274–2276 — `close()` 내 `hideTip()` 미호출.
- **제안 수정:** `openReviewDetail` `close()` 에서 `hideTip()` 글로벌 호출 또는 parent modal cleanup hook 추가.
- **파일:** [site/app.js](site/app.js) line 2274 [lane:CORE]

---

### [L-354] — `pushRecent` — `wishKey` 결과 `"||"` 등 퇴화 키로 정상 항목 잘못 제거

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `m.brand`·`m.model` undefined 시 `wishKey` → `"||"` → 같은 퇴화 키를 가진 다른 정상 항목도 dedup 시 제거.
- **원인:** [site/app.js](site/app.js) line 736 — `item.s` null 체크만 있고 `item.key` 유효성 미체크.
- **제안 수정:** `if (!item.s || !item.key || item.key === '||')` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 736 [lane:CORE]

---

### [L-355] — `renderRecent`·`renderAccount` — `x.s` 카테고리 슬러그 `encodeURIComponent` 없이 href 삽입

- **영역:** 프론트엔드 — 최근 본 상품/계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** localStorage의 `x.s`가 무결하지 않을 경우 href에 무인코딩 삽입 → 잠재적 URL 조작.
- **원인:** [site/app.js](site/app.js) line 2938, 3325 — `encodeURIComponent(x.s)` 미사용.
- **제안 수정:** `href="category.html?cat=${encodeURIComponent(x.s)}&brands=..."` 로 교체.
- **파일:** [site/app.js](site/app.js) line 2938 [lane:CORE]

---

### [L-356] ✅ 해결완료(2026-06-14, D) — view-set 모달 _vsEsc에 _trapTab 적용. — `view-set` 공유 세트 모달 — Tab 포커스 트랩 미구현

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** Tab 키가 모달 밖 배경 콘텐츠로 이동 → 다른 모달과 달리 포커스 트랩 없음 (WCAG 2.1.2).
- **원인:** [site/app.js](site/app.js) line 4185 — `keydown` Tab 트랩 미등록.
- **제안 수정:** `openSetDetail` 포커스 트랩 패턴 적용.
- **파일:** [site/app.js](site/app.js) line 4185 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-122] — `export_site.py` `product_spec_values` — `ORDER BY` 없는 `LIMIT 1`로 비결정적 `source_id`·`confidence` 선택

- **영역:** 백엔드 — 사이트 내보내기
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 같은 제품·메트릭에 복수 행 존재 시 임의 행의 source_id/confidence가 사용 → `metric_badge()` 결과("확정"/"참고") 비결정적.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 91 — `LIMIT 1` without `ORDER BY confidence DESC, id DESC`.
- **제안 수정:** `ORDER BY confidence DESC, id DESC LIMIT 1` 추가.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 91 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-123] — `pipeline.py` `_assign_gf_code` — COUNT 기반 시퀀스로 동시 실행 시 gf_code 중복 발급

- **영역:** 백엔드 — DB 초기화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 두 프로세스가 동시에 COUNT를 읽어 동일 후보 gf_code 생성, UNIQUE 제약 없어 중복 커밋 성공 → 동일 gf_code가 두 제품에 부여.
- **원인:** [pipeline/pipeline.py](pipeline/pipeline.py) line 108–115 — COUNT 기반 시퀀스, gf_code 컬럼 UNIQUE 인덱스 없음.
- **제안 수정:** `gf_code` 컬럼에 UNIQUE 제약 추가, 충돌 시 ROLLBACK 후 재시도.
- **파일:** [pipeline/pipeline.py](pipeline/pipeline.py) line 108 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [H-124] — `detect_price_drops.py` — 색상 변형 제품이 각각 별도 가격 하락 알림 발송으로 중복 푸시

- **영역:** 백엔드 — 가격 감지
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 동일 canonical 모델의 색상·옵션 변형이 각각 고유 gf_code → 독립적으로 드롭 이벤트 생성 → 동일 제품에 중복 푸시 알림.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 71–81 — gf_code 수준 그루핑, canonical 모델 수준 dedup 없음.
- **제안 수정:** `brand|model|cap` 기준 dedup 후 최저가 변형만 알림 발송.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 71 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-427] — `run_all.py` `promote_all` — `total_demoted` 카운터 항상 0 출력으로 강등 건수 미보고

- **영역:** 백엔드 — 파이프라인 실행
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `total_demoted` 변수가 루프 내 미증가 → 로그에 항상 `0건` 표시, 실제 강등 발생 여부 파악 불가.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 88–92 — `total` 변수로 대체됐으나 로그 참조는 `total_demoted`.
- **제안 수정:** 카운터 통일 또는 `total_demoted += con.execute(...).rowcount`.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 88 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-428] — `harvest_tents.py` `seen_names` — 브랜드 구분 없는 모델명 dedup으로 다른 브랜드 동명 제품 누락

- **영역:** 백엔드 — 텐트 수확
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "콜맨 에어텐트 2"·"제로그램 에어텐트 2" 중 후자가 `"에어텐트 2"` 중복으로 무음 스킵.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 118–120 — `seen_names`에 브랜드 미포함.
- **제안 수정:** `seen_names.add(f"{brand}|{model}")` 로 브랜드 포함 키 사용.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 118 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-429] — `refresh.py` `_group_prices_by_cat` — 카테고리 경계 첫 항목 무음 유실

- **영역:** 백엔드 — 가격 갱신
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 새 카테고리 첫 번째 price row가 `bucket.append()` 없이 `cur_cid` 재할당만 되어 유실 → 카테고리 첫 관측치 누락.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 79–81 — `cur_cid, _ = cid, bucket.append(price)` 패턴에서 그룹 전환 시 새 bucket에 현재 price 미추가.
- **제안 수정:** 전환 후 `bucket = [price]`로 초기화.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 79 [lane:BACKEND]

---

### [L-357] — `danawa.py` `parse_price` — `{4,}` 최소 길이 제약으로 1,000원 미만 가격 미매칭

- **영역:** 백엔드 — 다나와 크롤링
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `[\d,]{4,}` 패턴이 3자 이하(999원 이하) 가격 미매칭 → 할인 아이템 가격 None 반환.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 147 — 최소 4자 제약, 3자 가격 불가.
- **제안 수정:** `[\d,]{3,}` 으로 완화 후 MIN_PRICE 별도 검증.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 147 [lane:BACKEND]

---

### [L-358] — `seed_coupang.py` — CSV `rep_product_id` 후행 공백 시 기존 쿠팡 URL 무음 유실

- **영역:** 백엔드 — 제휴 링크 시딩
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 수동 편집된 CSV의 `rep_product_id`에 공백 포함 시 `existing.get(str(rid))` 미매칭 → 이전 입력 쿠팡 URL 덮어쓰기.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 57, 68 — `strip()` 없이 키 비교.
- **제안 수정:** `r["rep_product_id"].strip()` 으로 공백 제거.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 57 [lane:BACKEND]

---

### [L-359] ✅ 검토완료·현행유지(2026-06-14, K·설계) — 신선도 체크는 H-136이 의도적 continue-on-error(비차단): site/data를 DB-export 외 경로로 손보는 워크플로 보호. 경고로 누락 신호 제공. — `pages.yml` — CI가 JSON 재생성 없이 검증만 수행, DB·JSON 불일치 배포 가능

- **영역:** 백엔드 — CI/CD
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** DB만 커밋 후 JSON 미재생성 시 stale 데이터 배포. 반대로 JSON만 커밋 시 DB와 불일치.
- **원인:** [.github/workflows/pages.yml](.github/workflows/pages.yml) — `check_export.py` 검증만, `export_site.py` 재생성 스텝 없음.
- **제안 수정:** CI에서 `export_site.py` 실행 후 `check_export.py` 검증 순서 적용 (또는 DB 커밋 정책 문서화).
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) [lane:BACKEND]

---

### [M-430] — `supabaseClient.js` `signOut()` — `"sets"` 키 삭제로 `"gear_sets"` 미정리, 다음 사용자에게 노출 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그아웃 후 이전 사용자의 gear_sets가 localStorage에 잔류 → 같은 기기 다음 로그인 사용자가 이전 사용자의 세트를 봄.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 99 — `removeItem("sets")`, 앱 실제 키는 `"gear_sets"`.
- **제안 수정:** `localStorage.removeItem("gear_sets")` 로 키 수정.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 99 [lane:CORE]

---

### [L-360] — `stars(n)` — 음수 별점 시 `aria-label="별점 -X / 5"` 스크린리더 노출

- **영역:** 프론트엔드 — 별점 렌더링
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 내보내기 이상치로 `stars` 음수 시 시각적으로는 빈 별 5개지만 `aria-label`에 음수값 노출.
- **원인:** [site/app.js](site/app.js) line 362 — `Math.min(5, n)` 상한 클램프만, 하한 0 클램프 없음.
- **제안 수정:** `n = Math.max(0, Math.min(5, n));`
- **파일:** [site/app.js](site/app.js) line 362 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-431] — `reclassify_other_tent.py` `bucket()` — `cap=4` 백패킹 텐트 항상 오토캠핑 오분류

- **영역:** 백엔드 — 텐트 재분류
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 4인용 경량 텐트(1,000g 미만)도 `band=None` → 무조건 `"auto"` 반환. `column_fixes.py`는 `WEIGHT_CAP_BP={4: 5500}` 지원.
- **원인:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 40 — `{1:2500, 2:3000, 3:3600}` 딕셔너리에 cap=4 없음.
- **제안 수정:** `{1: 2500, 2: 3000, 3: 3600, 4: 5500}` 추가.
- **파일:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 40 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-432] — `backend/store.py` `load()` — `manifest.json` 부재 시 서버 기동 전체 중단

- **영역:** 백엔드 — 서버
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `manifest.json` 없거나 JSON 파싱 실패 시 FastAPI lifespan 핸들러까지 예외 전파 → 서버 기동 실패.
- **원인:** [backend/store.py](backend/store.py) line 15 — `open(manifest.json)` try/except 없음, `search.json`은 `os.path.exists()` 가드 있어 불일치.
- **제안 수정:** `try/except (FileNotFoundError, json.JSONDecodeError)` 래핑, 실패 시 빈 상태로 기동.
- **파일:** [backend/store.py](backend/store.py) line 15 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-433] — `backend/main.py` CORS — apex 도메인 `gear-forest.com` 누락으로 API 차단

- **영역:** 백엔드 — CORS
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 실 서빙 apex `https://gear-forest.com`에서 백엔드 API 호출 시 브라우저 CORS 오류.
- **원인:** [backend/main.py](backend/main.py) line 39 — `allow_origins`에 `www.gear-forest.com`만 있고 `gear-forest.com` 누락.
- **제안 수정:** `"https://gear-forest.com"` 추가.
- **파일:** [backend/main.py](backend/main.py) line 39 [lane:BACKEND]

---

### [L-361] — `graph_pipeline.py` `fetch_detail` — 예외가 `errors[]`에 적재되나 로그 미출력

- **영역:** 백엔드 — 그래프 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 다나와 파싱 실패가 `errors` 리스트에 쌓이지만 `main()` 출력에서 누락 → 운영자 인지 불가.
- **원인:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 242 — `st["log"]`만 출력, `st["errors"]` 미출력.
- **제안 수정:** `for e in st.get("errors", []): print(f"[ERROR] {e}")` 추가.
- **파일:** [pipeline/graph_pipeline.py](pipeline/graph_pipeline.py) line 242 [lane:BACKEND]

---

### [L-362] ✅ 검토완료·현행유지(2026-06-14, M·코드 실대조) — AUTO_CH allowlist(38, M-281/M-360)가 자동값(NULL·danawa_search·직구·국내)만 UPDATE, 수동 채널 보호. 기수정. — `column_fixes.py` — `channel` 재할당 시 수동 태그 무조건 덮어씀

- **영역:** 백엔드 — 데이터 컬럼 수정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 재실행 시 수동으로 설정한 `channel='Coupang'` 등이 `'직구'`/`'국내'`로 덮어쓰여 복구 불가.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36–39 — `WHERE channel IS NULL` 가드 없음.
- **제안 수정:** `UPDATE ... SET channel=? WHERE channel IS NULL AND ...` 로 한정.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36 [lane:BACKEND]

---

### [L-363] — `audit.py` — `categories WHERE name_ko=?` 서브쿼리 중복 시 런타임 에러

- **영역:** 백엔드 — 감사 도구
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `name_ko` 중복 카테고리 존재 시 서브쿼리 복수 행 반환 → SQLite `"sub-select returns multiple values"` → 감사 전체 중단.
- **원인:** [pipeline/audit.py](pipeline/audit.py) line 37 — `categories.name_ko` UNIQUE 미보장, 서브쿼리 `LIMIT 1` 없음.
- **제안 수정:** `(SELECT id FROM categories WHERE name_ko=? LIMIT 1)` 또는 categories UNIQUE 제약 추가.
- **파일:** [pipeline/audit.py](pipeline/audit.py) line 37 [lane:BACKEND]

---

### [M-435] — `setupHomeSearch` `ensureIdx` — fetch 실패 시 빈 배열 캐시로 세션 내 검색 영구 불능 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 홈 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `getJSON` 실패 → `idx = []` → 이후 `if (idx)` 가드가 truthy 통과 → 빈 결과 반환, 페이지 새로고침 없이는 복구 불가.
- **원인:** [site/app.js](site/app.js) line 976–979 — `.catch(() => idx = [])` 후 null 대신 빈 배열로 초기화.
- **제안 수정:** 실패 시 `idx = null` 유지 또는 재시도 로직 추가.
- **파일:** [site/app.js](site/app.js) line 977 [lane:CORE]

---

### [M-436] ✅ 분석완료(M-336 포함, 기구현) — `renderActiveFilters` — `EXTRA_SPECS` 슬라이더 활성 필터 칩에 단위 미표시

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** "내수압 500~1500" 대신 "내수압 500mm~1500mm" 로 표시돼야 하는데 단위 누락 — `STATE.unit`이 `d.metrics` 기반이라 `EXTRA_SPECS` 키 누락.
- **원인:** [site/app.js](site/app.js) line 1503–1504, 1943–1950 — `EXTRA_SPECS` 키에 대한 `STATE.unit` 미포함.
- **제안 수정:** `STATE.unit` 구성 시 `EXTRA_SPECS` 단위 fallback 추가.
- **파일:** [site/app.js](site/app.js) line 1943 [lane:CORE]

---

### [L-364] — `openSetModal` — set-btn `setTimeout` ID 미저장으로 모달 조기 닫기 시 이중 close·confirm 오작동

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 사용자가 400ms 내 모달 수동 닫으면 타이머 만료 후 `close()` 재호출 + `showSetConfirm` 재실행 → 이중 포커스 복원·이미 제거된 리스너 삭제 시도.
- **원인:** [site/app.js](site/app.js) line 637 — `setTimeout(...)` 반환값 미저장으로 취소 불가.
- **제안 수정:** `const tid = setTimeout(...); close = () => { clearTimeout(tid); ... }`.
- **파일:** [site/app.js](site/app.js) line 637 [lane:CORE]

---

### [L-365] ✅ 검토완료·현행유지(2026-06-14, B·설계) — 브랜드 전환은 history.replaceState(2888)라 페이지 내 history 항목 미생성 → 뒤로가기 시 stale 도달 불가. — `renderBrand` — 브라우저 뒤로가기/앞으로가기 후 칩 활성 상태 stale `params` 기반으로 불일치

- **영역:** 프론트엔드 — 브랜드 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브라우저 history 탐색 후 `params` 객체가 갱신되지 않아 칩 활성 표시가 실제 URL과 다를 수 있음.
- **원인:** [site/app.js](site/app.js) line 2806–2811 — `params`를 사이드이펙트 변이로 관리, `popstate` 이벤트 미처리.
- **제안 수정:** `renderChips` 호출 시 `new URLSearchParams(location.search)` 재생성.
- **파일:** [site/app.js](site/app.js) line 2806 [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [H-125] — `backend/db.py` WAL 체크포인트 — read-write 모드 오픈으로 파이프라인 동시 쓰기 시 WAL 손상 위험

- **영역:** 백엔드 — 서버 DB
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `wal_checkpoint_loop()`이 `?mode=ro` 없이 DB 오픈 → 파이프라인 동시 쓰기 시 SHARED 락 충돌, WAL 손상 가능.
- **원인:** [backend/db.py](backend/db.py) line 43 — 다른 모든 쿼리는 `mode=ro` 사용, 체크포인트만 read-write.
- **제안 수정:** `mode=ro` URI 사용 또는 백엔드 측 체크포인트 제거(파이프라인이 담당).
- **파일:** [backend/db.py](backend/db.py) line 43 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-437] — `backend/db.py` `health_check()` — 모든 예외 무음 처리, DB 손상 시 HTTP 200 반환

- **영역:** 백엔드 — 서버 헬스체크
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB 손상·누락 시 `{"status": "error"}` HTTP 200 반환 → 헬스체커가 정상으로 오인, 알림 없음.
- **원인:** [backend/db.py](backend/db.py) line 33–36 — `except Exception` 후 200 반환, 503 미발신.
- **제안 수정:** 오류 시 `raise HTTPException(status_code=503)` 또는 `Response(status_code=503)`.
- **파일:** [backend/db.py](backend/db.py) line 33 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-438] — `backend/routers/search.py` — 속도 제한 없는 검색 엔드포인트로 단문 쿼리 CPU DoS 가능

- **영역:** 백엔드 — 검색 API
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 1자 쿼리 반복 전송으로 전체 인덱스 선형 스캔 반복 → asyncio 이벤트 루프 포화.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 9–21 — rate limiting, min query length, 결과 캐싱 없음.
- **제안 수정:** `slowapi` rate limiter 적용 또는 최소 쿼리 길이(2자 이상) 검증 + LRU 캐시.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 9 [lane:BACKEND]

---

### [L-366] — `brand_filter.py` — 동일 서브쿼리 두 번 실행, `BRANDS` set 순서 비결정적

- **영역:** 백엔드 — 브랜드 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `filter_args`에 `list(BRANDS)` 사용 — set 순서 비결정적, 두 번 실행 시 파라미터 순서 잠재적 불일치. 첫 UPDATE 예외 시 롤백 없음.
- **원인:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 91–101 — 트랜잭션 없이 두 UPDATE 분리 실행.
- **제안 수정:** `BRANDS`를 `sorted(BRANDS)`로 고정, 두 UPDATE를 하나의 트랜잭션으로 묶음.
- **파일:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 91 [lane:BACKEND]

---

### [L-367] ✅ 검토완료·현행유지(2026-06-14, K·위협모델) — 게이트는 우발적 SQLi 차단용, # sql-ok는 의도된 이스케이프. 문자열에 텍스트 넣을 수 있는 자는 실제 주석도 추가 가능 → 동일. — `scan_sql_injection.py` — `# sql-ok` 허용 주석을 문자열 리터럴 내 포함으로 우회 가능

- **영역:** 백엔드 — 시크릿/보안 스캔
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `any(a in line for a in ALLOW_INLINE)` — `print("# sql-ok")` 처럼 문자열 내 포함으로 게이트 우회.
- **원인:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 60 — 서브스트링 매칭, 주석 위치 미확인.
- **제안 수정:** `re.search(r'#\s*sql-ok', line)` 로 실제 주석인지 확인.
- **파일:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 60 [lane:BACKEND]

---

### [L-368] ✅ 검토완료·현행유지(2026-06-14, N·코드 실대조) — L-199와 동일, 폰트 폴백 체인 구현됨. — `make_logo.py` — macOS 전용 폰트 경로 하드코딩으로 Linux CI에서 OG 이미지 생성 실패

- **영역:** 백엔드 — 빌드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** GitHub Actions(Linux)에서 `AppleSDGothicNeo.ttc` 없음 → `OSError`, OG 이미지 미생성.
- **원인:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 — `/System/Library/Fonts/AppleSDGothicNeo.ttc` macOS 전용.
- **제안 수정:** 폰트 경로 `try/except` 후 fallback 폰트 지정, 또는 repo에 폰트 포함.
- **파일:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 [lane:BACKEND]

---

### [H-126] ✅ 해결완료(2026-06-13) — `acc-set` 카드 — `role="button" tabindex="0"` 인데 `keydown` 핸들러 없어 키보드 접근 불가

- **영역:** 프론트엔드 — 계정/세트
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 포커스된 세트 카드에서 Enter/Space 입력 무반응, `.log-card`는 `onkeydown` 있음. WCAG 2.1.1 위반.
- **원인:** [site/app.js](site/app.js) line 3578–3580 — `card.onclick`만 등록, `card.onkeydown` 누락.
- **제안 수정:** `card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSetDetail(si); } }` 추가.
- **파일:** [site/app.js](site/app.js) line 3578 [lane:CORE]

---

### [M-440] — `_savePushSub` — Supabase upsert 오류 무음 처리로 푸시 구독 서버 미저장 — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** upsert 실패 시 브라우저 구독은 존재하나 서버 미저장 → 푸시 알림 미발송. 외부 try/catch가 rethrow 없어 오류 무음.
- **원인:** [site/app.js](site/app.js) line 3659–3668 — `{ error }` 미체크, rethrow 없음.
- **제안 수정:** `const { error } = await supabase.from(...).upsert(...); if (error) throw error;`
- **파일:** [site/app.js](site/app.js) line 3659 [lane:CORE]

---

### [L-369] ✅ 검토완료·현행유지(2026-06-14, B·설계) — 필터/정렬은 replaceState로만 URL 갱신(중간 history 미적재) → popstate 불요, 새로고침 시 URL 파라미터 재적용. — app.js — `popstate` 리스너 없어 브라우저 뒤로가기 시 렌더 stale

- **영역:** 프론트엔드 — 라우팅
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브랜드 칩·필터 변경 후 브라우저 Back 시 URL 복구되나 `renderBrand`·`draw` 미재호출 → 목록 stale.
- **원인:** [site/app.js](site/app.js) — `window.addEventListener("popstate", ...)` 없음 (파일 전체 grep 확인).
- **제안 수정:** `window.addEventListener("popstate", e => restoreAndDraw(e.state))` 추가.
- **파일:** [site/app.js](site/app.js) [lane:CORE]

---

### ✅ 해결완료(2026-06-13) [M-441] — `check_export.py` — 데이터 디렉토리 비어있을 때 가격 게이트 무조건 통과

- **영역:** 백엔드 — 배포 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `export_site.py` 실패 후 `site/data/`가 비어있으면 `files=[]` → `all_violations=[]` → exit 0 ("이상 가격 없음") → CI 배포 게이트 통과.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 82–86 — 최소 파일 수 검증 없음.
- **제안 수정:** `assert len(files) > 0, "데이터 파일 없음"` 또는 최소 카운트 체크.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 82 [lane:BACKEND]

---

### [M-442] ✅ 해결완료(2026-06-14, MP) — `check_export.py` `load_models` — 손상된 JSON 무음 스킵으로 배포 게이트 오통과
> 확인: load_models가 파싱 실패 시 `(None,[],False)` 반환으로 게이트 실패 신호(L-231, check_export.py L43).

- **영역:** 백엔드 — 배포 검증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 절단·손상된 JSON 파일이 `load_models`에서 경고 후 `(None, [])` 반환 → 위반 없음으로 CI 통과 → 손상 데이터 배포.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 39–45 — 예외 시 빈 반환, 파싱 오류 누적·종료 없음.
- **제안 수정:** 파싱 오류 누적 후 게이트 실패 처리.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 39 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-443] — `backend/store.py` — `site/data/*.json` 전체 로드로 임시·debug 파일 API 노출

- **영역:** 백엔드 — 서버
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `glob("*.json")`이 임시·OCR 아티팩트 파일도 카테고리로 로드 → `/api/category/<name>`으로 접근 가능.
- **원인:** [backend/store.py](backend/store.py) line 19–24 — manifest·search 제외 외 필터 없음.
- **제안 수정:** 허용 목록(`ALLOWED_CATS`) 기반 로드 또는 파일명 패턴 검증.
- **파일:** [backend/store.py](backend/store.py) line 19 [lane:BACKEND]

---

### [L-370] — `backend/routers/categories.py` `/api/manifest` — 인증·속도 제한 없이 전체 manifest 공개

- **영역:** 백엔드 — API
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** manifest 내 내부 메타데이터(미공개 카테고리 등)가 인증 없이 공개.
- **원인:** [backend/routers/categories.py](backend/routers/categories.py) line 9–11 — 접근 제어 없음.
- **제안 수정:** 공개 필드만 노출하는 필터링 또는 API key 인증 추가.
- **파일:** [backend/routers/categories.py](backend/routers/categories.py) line 9 [lane:BACKEND]

---

### [L-371] — `backend/store.py` — 서버 기동 후 JSON 갱신 시 재로드 불가, stale 데이터 서빙

- **영역:** 백엔드 — 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 파이프라인 재실행 후 JSON 갱신되어도 프로세스 재시작 전까지 구 데이터 서빙.
- **원인:** [backend/store.py](backend/store.py) line 13–24 — `load()` 기동 시 1회 호출, 파일 감시·TTL·재로드 엔드포인트 없음.
- **제안 수정:** `/api/reload` 내부 엔드포인트 또는 `watchdog` 파일 감시 추가.
- **파일:** [backend/store.py](backend/store.py) line 13 [lane:BACKEND]

---

### [L-372] ✅ 검토완료·현행유지(2026-06-14, K·코드 실대조) — 게이트(scan_*·check_export·export_site) 전부 stdlib+로컬모듈만 import. pip install 불요. — `pages.yml` — CI에 `pip install` 단계 없어 gate 스크립트 의존성 추가 시 묵음 실패

- **영역:** 백엔드 — CI/CD
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** gate 스크립트에 서드파티 패키지 추가 시 import 에러로 무음 실패, 게이트 효과 없음.
- **원인:** [.github/workflows/pages.yml](.github/workflows/pages.yml) — `pip install -r requirements.txt` 스텝 없음.
- **제안 수정:** `pip install -r pipeline/requirements.txt` 스텝 추가.
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) [lane:BACKEND]

---

### [L-373] ✅ 검토완료·현행유지(2026-06-14, N·코드 실대조) — runpy.run_path는 make_logo.py 부재 시 경로를 명시한 FileNotFoundError 발생(충분히 명확), deprecated 위임 셰임. — `make_icons.py` — `make_logo.py` 부재 시 `runpy.run_path()` 불명확 에러

- **영역:** 백엔드 — 빌드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `make_logo.py` 삭제·리네임 시 `FileNotFoundError` 메시지에 호출자 미표시 → 디버깅 혼란.
- **원인:** [pipeline/make_icons.py](pipeline/make_icons.py) line 10 — 파일 존재 확인 없이 `runpy.run_path()` 호출.
- **제안 수정:** `if not os.path.exists(logo_path): raise FileNotFoundError(f"make_logo.py 없음: {logo_path}")`.
- **파일:** [pipeline/make_icons.py](pipeline/make_icons.py) line 10 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-444] — `dev-harness/devagent/ledger.py` — TTL 락 탈취 TOCTOU 경쟁 조건

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 두 프로세스가 동시에 만료된 락 탐지 시 `os.unlink` 후 `O_CREAT|O_EXCL` 경쟁 → 한쪽이 FileExistsError 반복, 최악의 경우 다른 프로세스의 유효 락 삭제.
- **원인:** [dev-harness/devagent/ledger.py](dev-harness/devagent/ledger.py) line 30–35 — `getmtime`→`unlink` 비원자적.
- **제안 수정:** `os.unlink` 실패를 `FileNotFoundError`만 무시 후 루프 재진입, `O_CREAT|O_EXCL`이 하나만 성공하도록.
- **파일:** [dev-harness/devagent/ledger.py](dev-harness/devagent/ledger.py) line 30 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-445] — `dev-harness/devagent/progress.py` `append_progress` — 헤더 파싱 실패 시 기존 이력 전체 소실

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `PROGRESS.md`에 두 번째 이중개행 없으면 `idx=-1` → `body=""` → 기존 전체 이력 삭제.
- **원인:** [dev-harness/devagent/progress.py](dev-harness/devagent/progress.py) line 83–90 — `find("\n\n")` 반환 -1 미처리.
- **제안 수정:** 첫 `find("\n\n")`가 -1이면 `body = existing` (레거시 파일) 처리.
- **파일:** [dev-harness/devagent/progress.py](dev-harness/devagent/progress.py) line 83 [lane:BACKEND]

---

### ✅ 해결완료(2026-06-13) [M-446] — `dev-harness/devagent/contract_checker.py` — `.sql` 파일 단순 삭제도 schema-change로 오판

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 임시 쿼리 `.sql` 삭제 시에도 `schema_change=True` → 불필요한 human 승인 블록.
- **원인:** [dev-harness/devagent/contract_checker.py](dev-harness/devagent/contract_checker.py) line 24–29 — `status=="deleted"` 단독 조건이 파괴 패턴 검사와 OR 연결.
- **제안 수정:** migration 관련 파일명(`migration_*.sql`)만 삭제=파괴로 처리하는 조건 추가.
- **파일:** [dev-harness/devagent/contract_checker.py](dev-harness/devagent/contract_checker.py) line 24 [lane:BACKEND]

---

### [L-374] — `dev-harness/devagent/nodes/apply.py` — 경로 탈출 검사 전 정상 파일 쓰기 완료 (부분 적용 상태)

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 탈출 경로가 리스트 중간에 있으면 앞 파일들이 이미 워크트리에 쓰인 후 실패 반환.
- **원인:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 56–79 — 쓰기 루프와 검증이 분리 안 됨.
- **제안 수정:** 쓰기 전 전체 경로 validation 패스 수행, 탈출 경로 있으면 즉시 반환.
- **파일:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 56 [lane:BACKEND]

---

### [L-375] — `dev-harness/devagent/__main__.py` — docstring에 `--validate` 옵션 언급되나 argparse에 미정의

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `devagent --validate` 실행 시 `unrecognized argument` 오류.
- **원인:** [dev-harness/devagent/__main__.py](dev-harness/devagent/__main__.py) line 5 vs 292–327 — 문서·구현 불일치.
- **제안 수정:** `--validate` argparse 인수 추가 또는 docstring에서 제거.
- **파일:** [dev-harness/devagent/__main__.py](dev-harness/devagent/__main__.py) line 5 [lane:BACKEND]

---

### [L-376] — `dev-harness/devagent/nodes/evidence_collector.py` — 워크트리 cwd와 스크립트 경로 기준 불일치

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 존재 확인은 REPO_ROOT 기준, 실행은 워크트리 cwd → 내부 상대경로 DB_PATH 등 레포 루트 기준 파일 미탐지.
- **원인:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 29–36 — `os.path.join(REPO_ROOT, script)` 확인 후 `cwd=wt`로 실행.
- **제안 수정:** 실행도 `cwd=REPO_ROOT`로 통일하거나 워크트리 내 경로 명시.
- **파일:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 29 [lane:BACKEND]

---

### [H-127] ✅ 해결완료(2026-06-13) — `draw()` — `STATE.data` stale 시 `metrics.filter()` TypeError 미보호

- **영역:** 프론트엔드 — 카테고리 렌더링
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `STATE.data`가 `{}` 또는 미로드 상태에서 `draw()` 호출 시 `STATE.data.metrics.filter(...)` → TypeError 크래시, try/catch 없음.
- **원인:** [site/app.js](site/app.js) line 2638 — null guard 없이 `STATE.data.metrics` 직접 접근.
- **제안 수정:** `if (!STATE.data?.metrics) return;` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 2638 [lane:CORE]

---

### [M-450] — 브랜드 검색 페이지 `ensureIdx` — 동시 호출 시 `search.json` 중복 fetch — ✅ 해결완료(2026-06-13)

- **영역:** 프론트엔드 — 브랜드 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** keydown 이벤트 동시 발생 시 두 병렬 `getJSON` 요청, 마지막 완료 값이 idx에 저장.
- **원인:** [site/app.js](site/app.js) line 1199–1203 — `idxLoading` 프로미스 가드 없음 (홈 검색 `ensureIdx`와 달리).
- **제안 수정:** `setupHomeSearch`의 `idxLoading` 패턴 동일하게 적용.
- **파일:** [site/app.js](site/app.js) line 1200 [lane:CORE]

---

### [M-451] ✅ 해결완료(2026-06-14, C) — `STATE.slug`/`STATE.data` 복원 시 stale `prev` 스냅샷
> 수정: openFromSearch에 `_ofsLoading` in-flight 가드 추가(app.js L1219~) — 이중 클릭 시 모달 이중오픈·STATE 경합 방지(correctness는 M-262/M-405 기보호).

- **영역:** 프론트엔드 — 브랜드/검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `renderCategory()` 동시 실행 중 `openFromSearch` 호출 시 `prev` 스냅샷이 stale → 모달 닫힌 후 잘못된 STATE로 `draw()` 호출.
- **원인:** [site/app.js](site/app.js) line 1207–1224 — 비동기 `renderCategory` 경합 시 prev 보호 없음.
- **제안 수정:** `openFromSearch` 진입 시 진행 중인 카테고리 fetch 완료 대기 또는 STATE 스냅샷 deep copy.
- **파일:** [site/app.js](site/app.js) line 1207 [lane:CORE]

---

### [M-452] ✅ 해결완료(2026-06-13) — `importSet` — `close()` 후 `alert()` 호출로 iOS Safari에서 성공 확인 무음 처리

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** iOS Safari에서 `history.replaceState` 후 `alert()` 차단 → 가져오기 성공 알림 미표시.
- **원인:** [site/app.js](site/app.js) line 4274–4275 — `close()` (replaceState 포함) 이후 `alert()`.
- **제안 수정:** `alert()` 대신 `showToast()` 또는 모달 내 인라인 확인 메시지 사용.
- **파일:** [site/app.js](site/app.js) line 4274 [lane:CORE]

---

### [M-453] ✅ 해결완료(2026-06-13) — `renderRecommend` — `pick.filter`가 함수 아닐 때 `pick.filter is not a function` TypeError

- **영역:** 프론트엔드 — 추천
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** PERSONAS 설정 오류로 `filter`가 객체/문자열이면 `pick.filter(m)` TypeError → 전체 추천 섹션 렌더 실패.
- **원인:** [site/app.js](site/app.js) line 2861 — `pick.filter ? pick.filter(m) : true` 에서 함수 여부 미확인.
- **제안 수정:** `typeof pick.filter === 'function' ? pick.filter(m) : true`.
- **파일:** [site/app.js](site/app.js) line 2861 [lane:CORE]

---

### [L-377] — `showToast` — GNB 비활성인데 `bottom:80px` 하드코딩으로 불필요한 여백

- **영역:** 프론트엔드 — UI
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `GNB_ENABLED=false`이지만 토스트가 여전히 하단 80px에 표시 → 불필요한 여백.
- **원인:** [site/app.js](site/app.js) line 531 — `bottom:80px` 하드코딩, GNB 상태 미반영.
- **제안 수정:** `GNB_ENABLED ? 80 : 16` 또는 CSS 변수 기반 동적 offset.
- **파일:** [site/app.js](site/app.js) line 531 [lane:CORE]

---

### [H-128] ✅ 해결완료(2026-06-14, HF) — `syncWishlistOnLogin` — `onWishChange` 콜백이 merge 완료 전 설정되어 stale 덮어쓰기
> 수정: onWishChange 등록을 merge+save 완료 후로 이동(account.html L292~). merge 전 등록 시 setWish 발화가 병합전 로컬로 원격을 덮어쓰던 stale overwrite 차단.

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 로그인 직후 merge 미완료 시점에 `onWishChange`가 활성화 → 이전 로컬 찜 목록으로 원격 덮어쓰기.
- **원인:** [site/account.html](site/account.html) line 278 — `onWishChange = ...` 설정이 비동기 merge await 앞에 위치.
- **제안 수정:** merge 완료 이후 `onWishChange` 등록하도록 순서 변경.
- **파일:** [site/account.html](site/account.html) line 278 [lane:CORE]

---

### [H-129] ✅ 해결완료(2026-06-14, HF) — `renderAccount` — `myLogsList.dataset.loaded` 비동기 완료 전 설정 → 오류 시 영구 로딩 스피너
> 수정: getMyReviews 실패 `.catch`에 `delete dataset.loaded` 추가(app.js L3388) → 영구 미로드 대신 다음 렌더서 재시도.

- **영역:** 프론트엔드 — 계정
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `getMyReviews()` 실패 시 `dataset.loaded = "1"`이 이미 설정되어 스피너가 영구 표시됨.
- **원인:** [site/app.js](site/app.js) line 3209 — `await getMyReviews()` 이전에 `loaded = "1"` 설정.
- **제안 수정:** `getMyReviews()` 완료(성공·실패 모두) 이후 `loaded` 플래그 설정.
- **파일:** [site/app.js](site/app.js) line 3209 [lane:CORE]

---

### [M-454] ✅ 해결완료(2026-06-13) — `syncWishlistOnLogin` — null 반환 후 `onWishChange` 잔존 → 다음 토글 시 원격 찜 목록 훼손

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 조기 반환 후 `onWishChange`가 해제되지 않아 다음 찜 토글이 stale 로컬 목록으로 원격 덮어씀.
- **원인:** [site/account.html](site/account.html) line 278–280 — 조기 반환 경로에서 `onWishChange = null` 미처리.
- **제안 수정:** 모든 조기 반환 전 `onWishChange = null` 초기화.
- **파일:** [site/account.html](site/account.html) line 278 [lane:CORE]

---

### [M-455] ✅ 해결완료(2026-06-13) — `getJSON` — 동시 호출 dedup 없음 → search.json 중복 fetch

- **영역:** 프론트엔드 — 데이터 로딩
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 동시 다발적 `getJSON` 호출 시 동일 URL 병렬 fetch → 불필요한 네트워크 중복 요청.
- **원인:** [site/app.js](site/app.js) line 388–400 — in-flight 요청 dedup 캐시 없음.
- **제안 수정:** URL별 Promise 캐시(Map) 관리, 진행 중 요청 동일 Promise 반환.
- **파일:** [site/app.js](site/app.js) line 388 [lane:CORE]

- **처리:** getJSON에 URL별 in-flight Promise 캐시(Map) 추가 — 동시 동일 URL fetch 중복 제거. (2026-06-14)

---

### [M-456] ✅ 분석완료(M-181 포함, 기구현) — `openProduct` — 재진입 시 keydown 리스너 중복 등록

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 상품 모달 재오픈 시 이전 keydown 핸들러가 정리되지 않아 이벤트 중복 처리.
- **원인:** [site/app.js](site/app.js) line 2253–2255 — `addEventListener` 호출 전 `removeEventListener` 없음.
- **제안 수정:** 등록 전 동일 핸들러 `removeEventListener` 또는 `{ once: true }` 옵션 사용.
- **파일:** [site/app.js](site/app.js) line 2253 [lane:CORE]

---

### [M-457] ✅ 분석완료(moot: M-482 _wishSyncedUser 가드가 재진입 차단) — `renderNicknameModal` — auth 상태 갱신 중 이중 동기화 위험

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 닉네임 입력 중 auth 상태 재갱신 시 `renderNicknameModal` 중복 호출 → 폼 리셋 또는 저장 경합.
- **원인:** [site/account.html](site/account.html) line 352–354 — auth 리스너에 debounce/guard 없음.
- **제안 수정:** 모달 열린 동안 auth 갱신 핸들러 일시 중단 또는 이미 열린 경우 재진입 차단.
- **파일:** [site/account.html](site/account.html) line 352 [lane:CORE]

---

### [L-378] ✅ 해결완료(2026-06-14, E) — serviceWorker.ready를 Promise.race 10s 타임아웃으로 감싸 무한대기 방지(timeout은 외부 try/catch가 흡수). — `requestPushSubscription` — `serviceWorker.ready` 무한 대기 가드 없음

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** SW 등록 실패 시 `navigator.serviceWorker.ready` Promise가 영원히 pending → 구독 UI 무응답.
- **원인:** [site/app.js](site/app.js) line 3653 — `await navigator.serviceWorker.ready` 타임아웃 없음.
- **제안 수정:** `Promise.race([navigator.serviceWorker.ready, timeout(10000)])` 적용.
- **파일:** [site/app.js](site/app.js) line 3653 [lane:CORE]

---

### [L-379] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — wish-clear-all은 typeof getWish/setWish 가드(149-152), app.js 미로드 시 방어적 no-op. — `account.html` `wish-clear-all` — app.js 전역 미정의 시 silent no-op

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `window.clearWishlist` 등 전역이 없으면 버튼 클릭 시 아무 일도 일어나지 않고 오류도 없음.
- **원인:** [site/account.html](site/account.html) line 149–153 — 전역 존재 여부 미확인.
- **제안 수정:** `window.clearWishlist?.()` 대신 `if (!window.clearWishlist) { showToast('오류'); return; }` 명시적 처리.
- **파일:** [site/account.html](site/account.html) line 149 [lane:CORE]

---

### [M-458] ✅ 해결완료(2026-06-14, MD) — `publish.py` — `git commit` 종료코드 미검사 → 빈 커밋에도 ledger 완료 처리
> 수정: `ccode==0`(commit 성공) 확인 추가(publish.py L64) — 빈 커밋 등 실패 시 rev-parse가 직전 SHA를 줘 '커밋됨' 오인하던 것 차단.

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `git commit` 종료코드 1 (nothing to commit)이어도 `rev-parse HEAD` 성공 → 스레드가 실제 변경 없이 ledger에서 제거됨.
- **원인:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 57–73 — `ccode` 값 미확인.
- **제안 수정:** `if ccode == 0 and scode == 0 and sha != "__MISSING__": committed_sha = sha.strip()` 조건 추가.
- **파일:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 57 [lane:BACKEND]

---

### [M-459] ✅ 해결완료(2026-06-14, MD) — `gate_tests.py` T.2a — frontend feature 시 `.py` 파일만 검사 → JS/TS 추가는 항상 pass
> 수정: gate_tests T.2a 코드 확장자를 축별 분기 — frontend는 .js/.ts/.jsx/.tsx로 검사(전엔 .py 고정이라 프론트 코드변경이 무조건 통과).

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `axis == "frontend"` feature 변경 시 `code_files`에 `.js`/`.ts` 파일이 포함되지 않아 T.2a 테스트 동반 검사가 무력화됨.
- **원인:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 28–37 — `p.endswith(".py")` 고정 필터.
- **제안 수정:** `axis == "frontend"`이면 `.js/.ts/.jsx/.tsx` 확장자로 필터 분기.
- **파일:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 28 [lane:BACKEND]

---

### [M-460] ✅ 해결완료(2026-06-14, MD) — `gate_tests.py` `_TEST_RE` — frontend 테스트 파일 패턴 미매칭 → T.2a 항상 실패
> 수정: `_TEST_RE`에 프론트 테스트 패턴(*.test/*.spec.[jt]sx, __tests__/) 추가 → 프론트 테스트 동반 인식. 8케이스 검증.

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `*.test.tsx`, `*.spec.ts`, `__tests__/` 경로가 `_TEST_RE`에 불매칭 → M-459 수정 후에도 T.2a 오탐 실패.
- **원인:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 12 — pytest 네이밍 규칙만 반영.
- **제안 수정:** `_TEST_RE`에 `|[^/]+\.(?:test|spec)\.[jt]sx?$|__tests__/` 패턴 추가.
- **파일:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 12 [lane:BACKEND]

---

### [L-380] — `publish.py` — `thread_id` 비검증 git ref 이름 사용 → 특수문자 시 silent 실패

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `thread_id`에 `~`, `^`, `..` 등 git 금지 문자 포함 시 `git branch -f` 실패, 반환값 미확인으로 무음 처리.
- **원인:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 43–44, 63 — 이름 검증 없이 ref 직접 삽입.
- **제안 수정:** `thread_id`를 `[a-zA-Z0-9_\-]`만 허용 sanitize 후 사용, `branch -f` 반환값 검사.
- **파일:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 43 [lane:BACKEND]

---

### [L-381] — `contract.py` `summary_counts` — 미등록 category 키 silent 누락

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 새 `ContractItem.category` 값이 기존 3개 키 외로 추가되면 개수가 조용히 사라짐 — 호출자가 고정 키만 읽어 미집계.
- **원인:** [dev-harness/devagent/contract.py](dev-harness/devagent/contract.py) line 60–64 — `.get(..., 0)` + 재할당으로 미지의 카테고리 무음 허용.
- **제안 수정:** `item.category not in out` 시 `raise ValueError` 또는 `out[item.category] += 1` (KeyError 발생).
- **파일:** [dev-harness/devagent/contract.py](dev-harness/devagent/contract.py) line 60 [lane:BACKEND]

---

### [M-461] ✅ 해결완료(2026-06-14, MD) — `apply.py` 조기 반환 경로 — `changeset_diff` stale 상태 잔존
> 수정: apply.py 두 조기반환 dict에 `"changeset_diff": ""` 추가 → 이전 라운드 stale changeset_diff 잔존 방지.

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 워크트리 생성 실패 또는 경로 탈출 감지 시 조기 반환하면서 `changeset_diff` 미초기화 → evaluator가 이전 라운드 stale diff 기준으로 판단.
- **원인:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 49–51, 75–79 — 조기 반환 딕셔너리에 `changeset_diff` 키 없음.
- **제안 수정:** 두 조기 반환 딕셔너리에 `"changeset_diff": ""` 추가.
- **파일:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 50 [lane:BACKEND]

---

### [M-462] ✅ 해결완료(2026-06-14, MD) — `gate_lint.py` / `gate_typecheck.py` — `axis == "multi"` 케이스 미처리 → JS/TS 파일 lint/type 검사 누락
> 수정: gate_lint/gate_typecheck에 `multi` 축 분기 추가 — Python(ruff/mypy)+JS(eslint/tsc) 양쪽 검사 후 단일 엔트리로 합침(어느 한쪽 fail이면 fail). 전엔 .py만 검사돼 JS 무검사 통과.

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `axis == "multi"` 크로스-축 변경 시 `else` 분기로 Python 도구만 실행, JS/TS 파일 검사 생략 → 프론트 회귀 게이트 통과.
- **원인:** [dev-harness/devagent/nodes/gate_lint.py](dev-harness/devagent/nodes/gate_lint.py) line 8–12 / [gate_typecheck.py](dev-harness/devagent/nodes/gate_typecheck.py) line 8–11 — `"multi"` 분기 없음.
- **제안 수정:** `"multi"` 분기 추가하여 Python + JS/TS 도구 순차 실행, 결과 통합.
- **파일:** [dev-harness/devagent/nodes/gate_lint.py](dev-harness/devagent/nodes/gate_lint.py) line 8 [lane:BACKEND]

---

### [M-463] ✅ 해결완료(기해결 M-382 확인, DP-5) — `export_site.py` — `canonical_model IS NULL` 대표 이미지 조회 실패 (`=?` vs `IS ?`)
> 확인: 이미지 쿼리가 `p2.canonical_model IS ?`(NULL-safe)로 이미 교정됨(M-382, export_site.py L137). brand_id outer값 직접사용으로 타브랜드 위험도 해소.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `canonical_model`이 NULL인 상품은 대표 이미지가 항상 None → 이미지 없이 export됨.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 120 — `AND p2.canonical_model=?` (SQLite에서 NULL=NULL은 false). 가격 조회(line 114)는 `IS ?`로 올바르게 처리.
- **제안 수정:** line 120을 `AND p2.canonical_model IS ?`로 변경.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 120 [lane:BACKEND]

---

### [M-464] ✅ 해결완료(2026-06-14, MA) — `backend/db.py` `query_db` — TimeoutError 외 DB 예외 미처리 → 원시 500 traceback 노출
> 수정: db.py query_db에 `except (aiosqlite.Error, OSError)` 추가 → DB 손상·락·I/O 오류를 503으로 변환(스택 노출 차단). M-561과 동일 수정.

- **영역:** 백엔드 — FastAPI 서버
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `OperationalError: database is locked` 등 aiosqlite 예외가 uncaught → 클라이언트에 Python traceback 포함 500 응답.
- **원인:** [backend/db.py](backend/db.py) line 10–22 — `asyncio.TimeoutError`만 catch.
- **제안 수정:** broad `except Exception` 추가, `HTTPException(500, "데이터베이스 오류")` 반환.
- **파일:** [backend/db.py](backend/db.py) line 10 [lane:BACKEND]

---

### [L-382] — `graph.py` `contract_checker` — `approved_human` 매 pass 초기화 → LLM 평가 루프 시 사전 주입 승인 소실

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `needs_llm`+`needs_human` 동시 존재 시 evaluator 루프 후 re-check에서 `approved_human: []` 초기화 → 사전 주입된 human 승인 소실, `publish` 무한 대기.
- **원인:** [dev-harness/devagent/graph.py](dev-harness/devagent/graph.py) line 22–31 및 `contract_checker.run` line 68 — 매 pass 무조건 초기화.
- **제안 수정:** `revision_round` 증가 시에만 `approved_human` 초기화.
- **파일:** [dev-harness/devagent/graph.py](dev-harness/devagent/graph.py) line 22 [lane:BACKEND]

---

### [L-383] — `normalize.py` `packed_volume_cm3` — 2개 숫자 직사각형 치수를 실린더로 오해석 → 부피 과대 계산

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"22x35"` 같은 2숫자 비원통 표기가 실린더(d=22, h=35)로 계산 → 부피 ~13,200 cm³로 과대 산출.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 161–176 — cylinder 마커(`φ`, `지름`, `diam`) 없어도 2숫자면 실린더 가정.
- **제안 수정:** cylinder 마커 없는 2숫자 문자열은 `None` 반환.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 161 [lane:BACKEND]

---

### [L-384] — `publish.py` — 커밋 메시지 Co-Author 모델명 오기재 (`Opus 4.8` 미존재)

- **영역:** 백엔드 — 개발 하네스
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** git 커밋 이력에 `Claude Opus 4.8`이라는 존재하지 않는 모델명 기재 → 잘못된 출처 정보.
- **원인:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 52 — 하드코딩된 잘못된 버전 문자열.
- **제안 수정:** 유효한 모델 식별자(예: `Claude Sonnet 4.6`)로 수정.
- **파일:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 52 [lane:BACKEND]

---

### [M-465] ✅ 분석완료(M-569 수정으로 체인 내 user 재확인 추가됨) — `supabaseClient.js` `saveRemoteWishlist` — 체인 지연 중 세션 변경 시 구 user.id로 upsert

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그아웃 후 다른 사용자 로그인 사이에 대기 중인 `saveRemoteWishlist` 체인이 실행되면 이전 사용자 ID로 upsert → 데이터 혼선.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 163, 171 — `getUser()` 결과를 체인 클로저 외부에서 캡처, 지연 실행 시 stale.
- **제안 수정:** 체인 클로저 내부에서 `supabase.auth.getUser()` 재호출, user.id 불일치 시 abort.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 163 [lane:CORE]

---

### [M-466] ✅ 해결완료(2026-06-13) — `_savePushSub` — `j.keys` null 접근 → TypeError 미처리

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 일부 브라우저에서 `PushSubscription.toJSON()`의 `keys`가 null → `j.keys.p256dh` TypeError 크래시, 구독 저장 실패.
- **원인:** [site/app.js](site/app.js) line 3683–3684 — `j.keys` null 가드 없음.
- **제안 수정:** `if (!j || !j.keys) { console.warn('no keys'); return; }` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 3683 [lane:CORE]

---

### [M-467] ✅ 분석완료(H-115 기구현) — `saveSets` — localStorage QuotaExceededError 미처리 → 세트 조작 시 크래시

- **영역:** 프론트엔드 — 세트 관리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** localStorage 용량 초과 시 `saveSets` uncaught 예외 → 세트 추가/수정/삭제 UI 크래시.
- **원인:** [site/app.js](site/app.js) line 525 — try-catch 없음. `setWish`(line 431), `setRecent`(line 760)은 try-catch 있음.
- **제안 수정:** `try { localStorage.setItem(...) } catch(e) {}` 래핑.
- **파일:** [site/app.js](site/app.js) line 525 [lane:CORE]

---

### [M-468] ✅ 해결완료(2026-06-13) — `account.html` `localSets.set` — localStorage QuotaExceededError 미처리

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `syncGearSetsOnLogin` 중 용량 초과 시 예외가 `.catch()` 없이 상위로 전파 → 로그인 동기화 크래시.
- **원인:** [site/account.html](site/account.html) line 229 — `localStorage.setItem` try-catch 없음.
- **제안 수정:** `localSets.set` 내부 try-catch 추가.
- **파일:** [site/account.html](site/account.html) line 229 [lane:CORE]

---

### [L-385] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — M-570 가드로 처리됨. 오탐. — `buildFilters` 가격 슬라이더 — `lo === hi` 퇴화 케이스 미제거 → 이동 불가 슬라이더 렌더

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 카테고리 내 모든 상품 가격이 동일하면 `min === max` 슬라이더 렌더 → 사용자가 이동 불가, 비기능 UI 노출.
- **원인:** [site/app.js](site/app.js) line 1638–1650 — `prices.length === 0`만 스킵, `lo === hi` 퇴화 케이스 미처리.
- **제안 수정:** `if (lo >= hi) { /* skip */ }` 또는 조건을 `prices.length && lo < hi`로 변경.
- **파일:** [site/app.js](site/app.js) line 1640 [lane:CORE]

---

### [H-130] ✅ 해결완료(2026-06-14, HB) — `refresh.py` `ingest`/`ingest_one` — 예외 발생 시 refresh 중단 + 부분 커밋 불일치
> 수정: ingest 호출을 레코드별 `SAVEPOINT ingest_one`으로 격리 — 예외 시 ROLLBACK TO+로그+skip 후 continue(refresh.py L177~). 전체 refresh 중단·부분삽입 방지. sqlite 격리 테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `HT.ingest()` / `M.ingest_one()` 예외(IntegrityError, KeyError 등) 시 전체 refresh 루프 중단, 이전 페이지 커밋은 남고 현재 페이지는 롤백 없어 DB 불일치.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 160–165 — ingest 호출 주위 try/except 없음. line 166의 `con.commit()`은 이미 완료.
- **제안 수정:** `try/except Exception as e: print(f"! ingest 실패: {e}"); R["skipped"] += 1` 래핑.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 160 [lane:BACKEND]

---

### [M-469] ✅ 해결완료(2026-06-14, DP-3) — `refresh.py` `_group_prices_by_cat` — `category_id IS NULL` 첫 그룹 silent 누락
> 수정: 쿼리에 `AND p.category_id IS NOT NULL` 추가(refresh.py L78). NULL 카테고리 가격이 ORDER BY로 맨앞에 모였다 첫 실제 카테고리 bucket에 흡수돼 중앙값을 오염시키던 것을 차단. in-memory 테스트로 NULL 누수 미발생 검증.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `category_id`가 NULL인 상품이 존재하면 `cur_cid=None` 첫 그룹이 가드 조건(`cur_cid is not None`)에 의해 건너뛰어 cat_median에서 제외 → 해당 상품 이상치 검사 무력화.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 73–81 — 쿼리에 `WHERE category_id IS NOT NULL` 없음.
- **제안 수정:** 쿼리에 `AND p.category_id IS NOT NULL` 조건 추가.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 73 [lane:BACKEND]

---

### [M-470] ✅ 해결완료(2026-06-14, DP-2) — `refresh.py` `--dry-run` — 페이지별 `con.commit()` 으로 롤백 무력화
> 수정: 페이지별 commit을 `if not args.dry_run:`로 가드(refresh.py L178). dry-run은 끝에서 일괄 rollback만 수행해 DB 미변경 보장.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--dry-run` 실행 시 페이지마다 `con.commit()`이 먼저 실행되어 최종 `con.rollback()`이 no-op → dry-run임에도 DB에 실제 데이터 기록됨.
- **원인:** [pipeline/refresh.py](pipeline/refresh.py) line 166 — `args.dry_run` 여부 무관하게 commit 호출.
- **제안 수정:** `if not args.dry_run: con.commit()` 조건 추가, 또는 SAVEPOINT 방식으로 단일 트랜잭션 관리.
- **파일:** [pipeline/refresh.py](pipeline/refresh.py) line 166 [lane:BACKEND]

---

### [M-471] ✅ 해결완료(2026-06-14, DP-2) — `validate_ranges.py` — implausible flag DELETE가 SAVEPOINT 외부 → 예외 시 플래그 테이블 빈 상태 잔존
> 수정: implausible/재분류 플래그 두 DELETE를 `validate_reset` SAVEPOINT try 내부로 이동(L443~). valid 리셋과 동일 롤백 단위로 보호.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `DELETE FROM data_quality_flags WHERE flag_type='implausible'` 실행 후 INSERT 루프 예외 발생 시 테이블에 implausible 플래그가 0건, 롤백 불가.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 449–450 — DELETE가 SAVEPOINT 블록(line 426–448) 외부.
- **제안 수정:** DELETE를 SAVEPOINT 내부로 이동하거나 전체를 단일 트랜잭션으로 묶음.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 449 [lane:BACKEND]

---

### [M-472] ✅ 해결완료(기해결 M-385 확인, DP-8) — `detect_price_drops.py` — `in_stock` 미기록으로 재입고 이벤트 항상 미트리거
> 확인: refresh `_insert_price`가 in_stock 기록(크롤=1, 품절=0)하고(M-385, refresh.py L255~259), detect_price_drops가 `MAX(in_stock)`로 집계해 `prev_stock==0 and cur_stock==1` 재입고 분기 동작(M-251, L107).

- **영역:** 백엔드 — 가격 알림
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `refresh.py._insert_price`가 `in_stock` 컬럼을 저장하지 않아 항상 NULL → `MAX(NULL)=NULL`, `prev_stock==0` 조건 항상 False → 재입고 알림 무음 비작동.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 74, 85–109 — `price_observations.in_stock`이 populate되지 않음.
- **제안 수정:** `_insert_price`에 `in_stock` 컬럼 저장 추가하거나 재입고 조건을 `if prev_stock is not None and prev_stock == 0`.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 74 [lane:BACKEND]

---

### [M-473] ✅ 해결완료(기해결 M-374 확인, DP-3) — `detect_price_drops.py` `send()` — `urlopen` 예외 미처리 → traceback 크래시
> 확인: send()에 HTTPError/URLError try/except가 이미 적용됨(M-374, detect_price_drops.py L150~157). 4xx/5xx·네트워크 오류 시 sys.exit로 처리.

- **영역:** 백엔드 — 가격 알림
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 네트워크 오류나 HTTP 비-2xx 응답 시 `URLError`/`HTTPException`이 uncaught → CI/cron 환경에서 traceback 출력 후 비정상 종료.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 124–135 — `urlopen` try/except 없음.
- **제안 수정:** `try/except (urllib.error.URLError, Exception) as e: sys.exit(f"전송 실패: {e}")` 추가.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 124 [lane:BACKEND]

---

### [L-386] — `promote_catalog.py` — `fa`(floor_area) float 포맷 미지정 → 부동소수점 노이즈 출력

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `fa=3.2500001` 등 SQLite REAL 아티팩트가 그대로 출력 → 운영자 혼란.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 91 — `f"{fa}㎡"` 포맷 없음.
- **제안 수정:** `f"{fa:.2f}㎡"` 적용.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 91 [lane:BACKEND]

---

### [L-387] — `promote_catalog.py` `covpct()` — 검증 상품 0건 시 `None%` 출력

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `v_verified_catalog` 뷰가 비어 있으면 SQL `ROUND(.../0...)` → NULL → `covpct()=None` → `"None%"` 출력.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 74 — NULL 가드 없음.
- **제안 수정:** `MAX(COUNT(*),1)` 분모 또는 Python `pct or 0` 처리.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 74 [lane:BACKEND]

---

### [L-388] ✅ 검토완료·현행유지(2026-06-14, K·코드 실대조) — cap=0이면 floor_hard_range가 좁은 FLOOR_CAP_BP 대신 느슨한 HARD_RANGES['floor_area'](0.3~80)로 폴백(63-65). 대량 outlier 오탐 없음. 오탐. — `validate_ranges.py` — `capacity=0` 데이터 오염 시 모든 텐트 면적 outlier 오탐

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `capacity=0` 상품 존재 시 `val > cap*6` → `val > 0`이 되어 유효한 floor_area 전체가 outlier 처리됨.
- **원인:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 518 — `AND p.capacity > 0` 가드 없음.
- **제안 수정:** WHERE 절에 `AND p.capacity > 0` 추가.
- **파일:** [pipeline/validate_ranges.py](pipeline/validate_ranges.py) line 518 [lane:BACKEND]

---

### [L-389] — `backend/routers/search.py` — 검색 인덱스 미로드 시 0건 응답이 정상과 구분 불가

- **영역:** 백엔드 — API
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `search.json` 없으면 모든 검색 쿼리가 `[]` 반환 — 결과 없음과 인덱스 미로드를 구분할 수 없음.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 15–20 및 [backend/store.py](backend/store.py) — 파일 없으면 경고 없이 빈 리스트 사용.
- **제안 수정:** `store.load()`에서 경고 로그 추가, 또는 헤더 `X-Index-Missing: true` 반환.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 15 [lane:BACKEND]

---

### [L-390] — `backend/routers/categories.py` `manifest()` — manifest 비어있어도 HTTP 200 `{}` 반환

- **영역:** 백엔드 — API
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `manifest.json`이 빈 파일이면 `{}` + HTTP 200 반환 → 클라이언트가 정상 응답으로 오인.
- **원인:** [backend/routers/categories.py](backend/routers/categories.py) line 9–11 — 빈 manifest 체크 없음.
- **제안 수정:** `if not data_store.manifest: raise HTTPException(503, "manifest 미로드")` 추가.
- **파일:** [backend/routers/categories.py](backend/routers/categories.py) line 9 [lane:BACKEND]

---

### [M-474] ✅ 해결완료(2026-06-13) — `openSetModal` — keydown ESC 핸들러 중복 누적 (modal._onKey 가드 없음)

- **영역:** 프론트엔드 — 세트 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `openSetModal` 반복 호출 시 `document`에 keydown 핸들러 누적 → ESC 시 이전 클로저들 모두 실행, stale 핸들러 잔존.
- **원인:** [site/app.js](site/app.js) line 620 — `modal._onKey` 패턴 미적용. `openReplaceModal`(line 675), `openProduct`(line 2256)은 적용됨.
- **제안 수정:** 등록 전 `if (modal._onKey) document.removeEventListener('keydown', modal._onKey);` 추가, `modal._onKey = onKey` 저장.
- **파일:** [site/app.js](site/app.js) line 620 [lane:CORE]

---

### [L-391] — `supabaseClient.js` `_wishWriteChain` `.catch()` — `undefined` 반환으로 호출자 오류 감지 불가

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `.catch()` 블록이 예외를 삼키고 암묵적으로 `undefined` 반환 → `await saveRemoteWishlist()` 호출자가 `{ error }` 대신 `undefined` 수신, 오류 감지 불가.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 174 — `.catch(e => { console.error(...) })` 반환값 없음.
- **제안 수정:** `.catch(e => { console.error('saveRemoteWishlist', e); return { error: e }; })` 로 변경.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 174 [lane:CORE]

---

### [L-392] ✅ 검토완료·현행유지(2026-06-14, G·코드 실대조) — getJSON이 !r.ok 시 .json() 전에 throw(app.js:401), 504 빈응답은 깨끗한 에러로 처리. 파싱오류 미발생. — `sw.js` 비-navigate 요청 오프라인 폴백 — 빈 본문 504 → `r.json()` 파싱 오류

- **영역:** 프론트엔드 — 서비스 워커
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 캐시 미스 + 네트워크 실패 시 빈 본문 504 응답 → JSON 데이터 파일 요청에서 `r.json()` throw → 카테고리 페이지 로딩 실패, 의미 없는 에러 메시지 표시.
- **원인:** [site/sw.js](site/sw.js) line 84 — `new Response("", { status: 504 })` 빈 본문 반환. navigate 핸들러(line 62)는 텍스트 응답 사용.
- **제안 수정:** `new Response('{"error":"오프라인"}', { status: 503, headers: { "Content-Type": "application/json" } })` 또는 콘텐츠 타입별 분기.
- **파일:** [site/sw.js](site/sw.js) line 84 [lane:CORE]

---

### [H-131] ✅ 해결완료(2026-06-14, HB) — `star_catalog.py` — `price_observations`에 `price_krw=0` 미필터 → 가격-star
> 수정: MIN 집계 WHERE에 `AND price_krw > 0` 추가(star_catalog.py L63). (왜곡 자체는 L64 `pr>0` 가드로 기차단됐으나) 0 관측치 섞인 상품이 드롭되지 않고 실제 양수 최소가를 채택하도록 개선. 정규화 왜곡

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `price_krw=0` 데이터가 MIN()에 포함되면 min-max 정규화에서 모든 정상 가격이 최악(high) 방향으로 압축 → 전 상품 가격-star 왜곡.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 61 — `WHERE price_krw > 0` 조건 없음.
- **제안 수정:** `WHERE price_krw > 0 GROUP BY product_id` 추가.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 61 [lane:BACKEND]

---

### [M-475] ✅ 해결완료(2026-06-14, DP-6) — `ocr_specs.py` — `--verify`/`--fill` 미입력 시 묵시적 verify 모드 실행
> 수정: main()에서 둘 다 미지정 시 `ap.error("--verify 또는 --fill 중 하나를 지정해주세요.")`로 종료(ocr_specs.py L256~). 묵시적 verify 실행·의도치 않은 conflict flag 삽입 차단. 플래그 없음=exit2, --verify=정상진행 검증.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 플래그 없이 실행 시 `mode="verify"`로 기본 설정 → 의도치 않은 전체 verify 실행, conflict 플래그 삽입 가능.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 239 — 인수 유효성 검사 없음.
- **제안 수정:** `if not args.verify and not args.fill: ap.error("--verify 또는 --fill 중 하나를 지정해주세요.")` 추가.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 239 [lane:BACKEND]

---

### [M-476] ✅ 해결완료(2026-06-14, MP) — `fill_whitelist_specs.py` — `FN[fn]` KeyError 포함 모든 예외 silent 무시
> 수정: 예외 범위를 `(ValueError,TypeError)`로 좁혀 KeyError(미등록 fn=설정오류) 전파(fill_whitelist_specs.py L89).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 미등록 `fn` 키 또는 파싱 실패 시 `except Exception: val = None`으로 무음 처리 → 잘못된 multicat 설정이 프로덕션에서 감지되지 않음.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 89 — 예외 범위 너무 광범위.
- **제안 수정:** `KeyError`는 재발생, `ValueError`/`TypeError`만 무음 처리.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 89 [lane:BACKEND]

---

### [M-477] ✅ 해결완료(2026-06-14, DP-2) — `crosssource.py` — 단일 레코드 파싱 예외 시 전체 RECORDS 롤백
> 수정: RECORDS 루프를 레코드별 `SAVEPOINT rec`로 격리 — 실패행만 ROLLBACK TO+경고 후 continue, 정상행 보존. H-76(spec+recompute_ratings 단일 커밋)은 외부 트랜잭션으로 유지. SAVEPOINT 격리 테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** RECORDS 루프 중 `packed_volume_cm3()` 등 예외 발생 시 전체 이전 레코드 롤백 → 정상 데이터도 손실.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 181–190 — 레코드별 try/except 없음.
- **제안 수정:** 개별 레코드 처리를 try/except로 감싸고 경고 로그 후 계속 진행.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 181 [lane:BACKEND]

---

### [M-478] ✅ 해결완료(2026-06-14, DP-2) — `star_catalog.py` — `DROP TABLE` + `CREATE TABLE` 트랜잭션 미보호 → 크래시 시 테이블 소실
> 수정: `DROP`→`CREATE TABLE IF NOT EXISTS`+`DELETE FROM catalog_scores`로 변경(star_catalog.py L73). 테이블 항상 보존·INSERT/commit과 단일 트랜잭션이라 크래시 시 이전 데이터 롤백 유지. in-memory sqlite 멱등성 테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `con.commit()` 실패(디스크 풀 등) 시 `catalog_scores` 테이블이 DROP 후 빈 상태로 남아 복구 불가.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 72–73 — DDL+DML이 단일 트랜잭션으로 묶이지 않음.
- **제안 수정:** `DROP` 대신 `DELETE FROM catalog_scores` + `CREATE TABLE IF NOT EXISTS`, 전체를 transaction으로 보호.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 72 [lane:BACKEND]

---

### [M-479] ✅ 해결완료(2026-06-14, DP-1) — `value_metric.py` `compute_value_score` — `metric_keys` 빈 리스트 시 ZeroDivisionError
> 수정: 함수 초반 `if not metric_keys: return [전 모델 미표시]` 가드 추가(value_metric.py L141). 빈 metrics 단위테스트로 ZeroDivision 미발생 검증.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `config["metrics"]`가 빈 리스트이면 `sum([]) / 0` ZeroDivisionError 크래시.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 177 — `len(qs) == 0` 미가드.
- **제안 수정:** 함수 초반 `if not metric_keys: return [{"id": m["id"], "value_display": None, "stars": None} for m in models]` 추가.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 177 [lane:BACKEND]

---

### [L-393] — `backend/store.py` `load()` — JSON 파일 오류 시 예외 전파로 FastAPI 시작 실패

- **영역:** 백엔드 — API 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `manifest.json` 등이 손상되거나 없으면 `lifespan()` 예외 전파 → FastAPI 서버 시작 불가. `search.json`은 존재 확인 있으나 manifest는 없음.
- **원인:** [backend/store.py](backend/store.py) line 13–30 — 파일 로드 try/except 없음, manifest 존재 확인 없음.
- **제안 수정:** 각 `json.load()` try/except로 개별 감싸기, 실패 시 경고 로그 후 빈값 유지.
- **파일:** [backend/store.py](backend/store.py) line 13 [lane:BACKEND]

---

### [L-394] — `backend/main.py` `get_real_ip` — 내부 프로브 공유 rate-limit 키 → 모니터링 429 위험

- **영역:** 백엔드 — API 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 로컬루프백 클라이언트 전체가 `"__internal__"` 단일 키로 rate-limit 버킷 공유 → 잦은 health 프로브가 내부 도구 429 유발 가능.
- **원인:** [backend/main.py](backend/main.py) line 18 — 내부 트래픽 rate-limit 면제 없음.
- **제안 수정:** `/health` 엔드포인트에 `@limiter.exempt` 적용.
- **파일:** [backend/main.py](backend/main.py) line 18 [lane:BACKEND]

---

### [L-395] — `backend/routers/search.py` — 검색 인덱스 미정규화로 요청마다 O(n) lower() 호출

- **영역:** 백엔드 — API 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 동시 요청 부하 시 2000+ 항목×필드 `.lower()` 매 요청마다 실행 → 응답 지연.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 15–20 — 로드 시 소문자 정규화 없음.
- **제안 수정:** `store.py`에서 로드 시 인덱스 소문자 정규화 또는 역인덱스 구축.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 15 [lane:BACKEND]

---

### [L-396] — `ocr_specs.py` — PIL 미설치 시 이미지별 내부 체크로 불필요한 네트워크 다운로드 낭비

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `Image is None` 체크가 루프 내부에 있어 PIL 없어도 모든 이미지 다운로드 후 버림 → 대역폭 낭비.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 68–69 — 루프 진입 전 PIL 유효성 검사 없음.
- **제안 수정:** `detail_images()` 또는 `ocr_text()` 첫 줄에 `if Image is None: return []` 추가.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 68 [lane:BACKEND]

---

### [L-397] — `fill_whitelist_specs.py` — `fetchone()[0]` — 상품 삭제 경합 시 TypeError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `candidates()` 조회 후 `pid` 삭제 경합 시 `fetchone()=None` → `[0]` TypeError, 진단 메시지 없음.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 107 — `fetchone()` None 미처리.
- **제안 수정:** `row = ..fetchone(); cur_cap = row[0] if row else None` 패턴 적용.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 107 [lane:BACKEND]

---

### [H-132] ✅ 해결완료(2026-06-14, HF) — `updateLeadText` — `STYLE_META.find()` undefined 시 `sm.icon` TypeError
> 수정: updateLeadText에 `if(!sm){...;return}` 가드(app.js L1444) → STYLE_META 미존재 키에서 sm.icon TypeError 방지.

- **영역:** 프론트엔드 — 카테고리 렌더링
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** URL `?style=X` 등으로 `STATE.campStyle`이 `STYLE_META`에 없는 키로 설정되면 `sm = undefined` → `sm.icon` TypeError 크래시.
- **원인:** [site/app.js](site/app.js) line 1432 — `find()` 결과 null 가드 없음.
- **제안 수정:** `if (!sm) { leadEl.innerHTML = ''; return; }` 가드 추가.
- **파일:** [site/app.js](site/app.js) line 1432 [lane:CORE]

---

### [H-133] ✅ 해결완료(2026-06-14, HF) — `renderAccount` 찜 카드 `go()` — `wx.b`/`wx.m` undefined 시 `"?brands=undefined"` 브로큰 URL
> 수정: 찜카드 href를 `(x.b&&x.m)?...:category.html?cat=`로 null-safe화(app.js L3438) → `?brands=undefined` 브로큰 URL 방지.

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 저장된 찜 아이템의 `b` 또는 `m` 필드 누락 시 `encodeURIComponent(undefined)` → `"?brands=undefined&q=undefined"` 브로큰 URL, 0건 검색 결과.
- **원인:** [site/app.js](site/app.js) line 3399 — `!wx.b`/`!wx.m` 가드 없음.
- **제안 수정:** `if (!wx || !wx.s || !wx.b || !wx.m) { location.href = card.dataset.href; return; }` 추가.
- **파일:** [site/app.js](site/app.js) line 3399 [lane:CORE]

---

### [M-480] ✅ 해결완료(2026-06-13) — `priceRange` — `price_min=null`이지만 `price_max` 유효 시 "가격없음" 오표시

- **영역:** 프론트엔드 — 가격 표시
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `price_min=null`, `price_max` 유효값인 상품이 "가격없음"으로 표시됨.
- **원인:** [site/app.js](site/app.js) line 341 — `priceRange(a, b)`에서 `b` 파라미터 미사용.
- **제안 수정:** `(a == null || a === 0) ? ((b == null || b === 0) ? '가격없음' : won(b)) : won(a)` 로 변경.
- **파일:** [site/app.js](site/app.js) line 341 [lane:CORE]

---

### [M-481] ✅ 해결완료(2026-06-13) — `renderRecent` — `x.b`/`x.m` undefined 시 `"?brands=undefined"` 브로큰 URL

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 오래된 스키마 또는 데이터 오염으로 `b`/`m` 누락된 recent 아이템이 브로큰 카테고리 URL 생성.
- **원인:** [site/app.js](site/app.js) line 2985 — `encodeURIComponent(x.b)` 전 null 가드 없음.
- **제안 수정:** `.map()` 내부에 `if (!x || !x.b || !x.m || !x.s) return '';` 추가.
- **파일:** [site/app.js](site/app.js) line 2985 [lane:CORE]

---

### [M-482] ✅ 해결완료(2026-06-13) — `account.html` `initAuth` + `app.js` `_setupGlobalAuth` — 이중 `onAuthStateChange` 구독으로 이중 동기화

- **영역:** 프론트엔드 — 인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `TOKEN_REFRESHED` 등 이벤트가 두 구독에 동시 전달 → `syncWishlistOnLogin` 중복 실행, 두 번째 호출이 첫 번째 merge 결과 덮어씀.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 19 및 [site/app.js](site/app.js) line 109–125 — 동일 세션에 두 개의 독립 `onAuthStateChange` 리스너.
- **제안 수정:** `initAuth` 콜백에 `_syncedOnLogin` 플래그로 동일 사용자 ID 재동기 차단.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 19 [lane:CORE]

---

### [M-483] ✅ 해결완료(2026-06-13) — `draw()` — `STATE.q` 다중 단어 검색 토큰화 미적용 (홈 검색과 불일치)

- **영역:** 프론트엔드 — 카테고리 검색
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 홈 검색은 `q.split(/\s+/)` 토큰화로 다중 단어 검색 지원, 카테고리 내 검색은 `.includes()` 단순 비교 → `"big agnes"` 등 이중 공백/토큰 쿼리 불일치.
- **원인:** [site/app.js](site/app.js) line 2648 — 홈 검색(line 1041)의 토큰화 패턴 미적용.
- **제안 수정:** `draw()` 내 검색 필터도 `STATE.q.split(/\s+/).filter(Boolean)` 토큰화 적용.
- **파일:** [site/app.js](site/app.js) line 2648 [lane:CORE]

---

### [M-484] ✅ 해결완료(M-357 포함, 2026-06-13) — 찜 카드 `go()` — `r.ok` 미확인으로 404 응답도 `r.json()` 파싱 시도

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 삭제된 카테고리 JSON 요청 시 404 응답도 `r.json()` 파싱 → 에러 객체 또는 파싱 실패, 상품 모달 미표시.
- **원인:** [site/account.html](site/account.html) line 3399 부근 — `r.ok` 확인 없이 `r.json()` 호출.
- **제안 수정:** `if (!r.ok) throw new Error(r.status);` 추가 후 `r.json()` 호출.
- **파일:** [site/account.html](site/account.html) line 3399 [lane:CORE]

---

### [M-485] ✅ 해결완료(2026-06-13) — `pushRecent` — `item.key`가 undefined이면 dedup 실패로 recent 목록 오염

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `m.brand`/`m.model` 누락 상품 open 시 `key="undefined|undefined|"` 아이템이 dedup 없이 중복 추가 → recent 목록 오염.
- **원인:** [site/app.js](site/app.js) line 756–760 — `!item.b`/`!item.m` 가드 없음.
- **제안 수정:** line 757에 `if (!item.s || !item.b || !item.m) return;` 추가.
- **파일:** [site/app.js](site/app.js) line 757 [lane:CORE]

---

### [L-398] ✅ 검토완료·현행유지(2026-06-14, 코드 실대조·오탐) — b 사용 중(app.js:339). — `priceRange` `b` 파라미터 dead code — 유지보수 혼란

- **영역:** 프론트엔드 — 가격 표시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `priceRange(a, b)` 함수 시그니처에 `b`가 있으나 미사용 — 정적 분석 도구 경고 및 유지보수 혼란.
- **원인:** [site/app.js](site/app.js) line 341 — M-480 수정 전까지 `b` 미사용 상태.
- **제안 수정:** M-480 수정으로 함께 해소.
- **파일:** [site/app.js](site/app.js) line 341 [lane:CORE]

---

### [L-399] ✅ 해결완료(2026-06-14, A) — mIdx 재사용. — `openProduct` — `d.models.indexOf(m)` O(n) 중복 호출

- **영역:** 프론트엔드 — 상품 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 모달 오픈 시 `d.models.indexOf(m)` O(n) 탐색 2회(href 생성 + share URL) → 대형 카테고리에서 불필요한 중복 연산.
- **원인:** [site/app.js](site/app.js) line 2141, 2186 — indexOf 결과 미캐시.
- **제안 수정:** `const idx = d.models.indexOf(m)` 한 번 캐시 후 재사용.
- **파일:** [site/app.js](site/app.js) line 2141 [lane:CORE]

---

### [L-400] ✅ 검토완료·현행유지(2026-06-14, E·설계) — subscribe 실패는 대개 일시적(네트워크) → 재시도가 옳음. 일시오류에 push-denied 영구기록 시 정상 권한도 영구차단되는 더 큰 버그. — `requestPushSubscription` — `pushManager.subscribe` 실패 시 `push-denied` 미설정으로 재시도 반복

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 권한 허용 후 `pushManager.subscribe()` 네트워크 오류 시 toast 없고 `push-denied` 미설정 → 다음 페이지 로드 시 또다시 구독 시도 반복.
- **원인:** [site/app.js](site/app.js) line 3670 — subscribe 실패 경로에 backoff/flag 없음.
- **제안 수정:** subscribe 실패 시 toast 표시하고 재시도 flag 설정.
- **파일:** [site/app.js](site/app.js) line 3670 [lane:CORE]

---

### [L-401] — `toggleWish` 지연 실행 경로 — `.pli-wish` 카드 버튼 시각 갱신 누락

- **영역:** 프론트엔드 — 찜
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** auth 초기화 중 찜 토글 시 `authReady().then()` 지연 실행 후 `_paintWishBtn`이 `data-key` 버튼만 업데이트, `data-mi` 기반 `.pli-wish` 카드 버튼은 갱신 안 됨.
- **원인:** [site/app.js](site/app.js) line 472–476 — `_paintWishBtn`이 `data-mi` 속성 카드 버튼 미포함.
- **제안 수정:** 지연 실행 완료 후 `draw()` 호출 또는 `.pli-wish[data-mi]` 버튼도 `_paintWishBtn`에 포함.
- **파일:** [site/app.js](site/app.js) line 472 [lane:CORE]

---

### [L-402] ✅ 검토완료·현행유지(2026-06-14, F·설계) — localStorage는 origin 범위라 gear-forest.com에 타 Supabase 앱 토큰 공존 불가. 오탐. — `account.html` 세션 감지 휴리스틱 — 다른 Supabase 앱 토큰 오탐으로 로딩 스피너 flash

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 다른 Supabase 프로젝트 토큰이 localStorage에 있으면 로딩 스피너 표시 후 즉시 로그인 화면 전환 → 미세한 UX 깜빡임.
- **원인:** [site/account.html](site/account.html) line 596 — `sb-*-auth-token` 정규식이 프로젝트 ref 미검증.
- **제안 수정:** 알려진 Supabase 프로젝트 ref를 키 패턴에 포함하거나 flash를 허용 가능 범위로 수용.
- **파일:** [site/account.html](site/account.html) line 596 [lane:CORE]

---

### [L-403] — `pushRecent` — `QuotaExceededError` 무음 처리로 recent 목록 갱신 중단

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** localStorage 용량 초과 시 최근 본 목록 갱신 중단, 사용자 알림 없음. `saveSets`(M-467)와 달리 toast도 없음.
- **원인:** [site/app.js](site/app.js) line 760 — `catch (e) { /* 무시 */ }` 처리.
- **제안 수정:** 오래된 항목 절반 trim 후 재시도하거나 허용 가능한 silent fail로 수용.
- **파일:** [site/app.js](site/app.js) line 760 [lane:CORE]

---

### [H-134] ✅ 해결완료(2026-06-14, HB) — `run_all.py` — 예외 시 DB 커넥션 누수 (try/finally 없음)
> 수정: normalize_db/validate_db를 try/finally로 감싸 예외 시에도 `con.close()` 보장(run_all.py L177~). WAL 쓰기 락 점유로 다음 실행 차단되던 것 방지.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `normalize_db`/`validate_db` 예외 시 `con.close()` 미호출 → WAL 쓰기 락 점유, 다음 파이프라인 실행 차단.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 169–176 — try/finally 없음, 두 번째 `con` 열기 전 첫 번째 미닫힘.
- **제안 수정:** `try/finally: con.close()` 또는 컨텍스트 매니저 사용.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 169 [lane:BACKEND]

---

### [M-486] ✅ 해결완료(2026-06-14, MP) — `run_all.py` — `check_export.py` 호출 시 `--data` 미전달 → 잘못된 경로 검사
> 확인: check_export `--data` 기본값=site/data, export_site도 site/data 출력 → 경로 일치(비이슈). run_all 미전달은 기본값으로 정상.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--out` 커스텀 옵션 사용 시 `check_export.py`가 기본 `site/data`를 검사 → 실제 export 디렉터리 미검증, 이상 데이터 배포 통과.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 217 — `subprocess.run`에 `--data` 인수 없음.
- **제안 수정:** `sh("check_export.py", "--data", os.path.join(ROOT, "site", "data"))` 또는 export 출력 경로 전달.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 217 [lane:BACKEND]

---

### [M-487] ✅ 해결완료(2026-06-14, MP) — `run_all.py` 다중 포장 거부 정규식 — `N개세트`(공백 없음) 정상 번들 오거부
> 수정: 다중팩 거부 정규식 ` ?세트`→`\\s*세트`(run_all.py L199) — 'N개  세트' 다중공백 정상번들 오거부 방지. 6케이스 테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `N개세트` (공백 없이) 표기된 정상 번들 상품이 다중 포장 거부 정규식에 걸려 오거부됨.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 185–191 — 부정형 lookahead `(?!월| ?세트)`에서 공백 선택이 `\s*`가 아닌 ` ?`(공백 1개 옵션).
- **제안 수정:** `(?!월| ?세트)` → `(?!월|\s*세트)`로 변경.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 187 [lane:BACKEND]

---

### [M-488] ✅ 해결완료(2026-06-14, DP-4) — `normalize.py` `floor_area_m2` — 테이퍼 평균 정수 반올림으로 소수점 정밀도 손실
> 수정: 테이퍼 'A(B)' 평균폭을 `round((A+B)/2)`(정수) → `round((A+B)/2, 1)`(1자리 소수)로 변경(normalize.py L98). 0.1cm 정밀도 보존. sqft/dims 경로 회귀 없음(자가테스트 통과).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `210.5(185.3)` 같은 소수 테이퍼 치수가 `round()` 후 정수(`198`)로 치환 → floor_area 계산 정밀도 최대 ~0.5% 손실.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 94–95 — `round()` 인수 없이 호출, 정수 반환.
- **제안 수정:** `round(..., 1)` 로 변경, 소수점 1자리 유지.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 94 [lane:BACKEND]

---

### [M-489] ✅ 해결완료(2026-06-14, DP-5) — `export_site.py` — value 메트릭 `fill: 100` 하드코딩 → 실제 커버리지 미반영
> 수정: 합성 가성비 지표 fill을 `value가 부여된 모델 비율`로 산출(export_site.py L191). 비교풀<2·스펙결측으로 value 미부여된 모델이 가려지던 것 해소. 단위테스트로 fill≠100 검증.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** value_score가 없는 상품이 많아도 `fill: 100`이 hardcoded → UI에서 커버리지 100%로 잘못 표시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 175–178 — `fill` 값 계산 없이 100 고정.
- **제안 수정:** `fill = round(sum(1 for m in models if "value_score" in m.get("specs", {})) * 100 / max(len(models), 1))` 계산 후 사용.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 175 [lane:BACKEND]

---

### [M-490] ✅ 해결완료(2026-06-14, DP-2) — `babysit.py` — `promote_all` 예외 시 DB 커넥션 누수
> 수정: promote_all except(rollback+raise)에 `con.close()` 추가(babysit.py L43). 재raise로 말미 close 미도달하던 누수 차단.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `promote_all(con)` 예외(DB 잠금 등) 발생 시 `con.close()` 미호출 → 커넥션 누수.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 31–100 — try/finally 없음.
- **제안 수정:** `try/finally: con.close()` 래핑.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 31 [lane:BACKEND]

---

### [M-491] ✅ 해결완료(2026-06-14, DP-3) — `babysit.py` — 커버리지 검사 카테고리 이름 하드코딩 → 이름 변경 시 silent 무음
> 수정: '백패킹텐트' id를 루프 전 1회 해소·파라미터화(babysit.py L96~). 미존재 시 분모0→SQL NULL로 무음 통과하던 것을 명시적 경보(`커버리지 검사 불가: 카테고리 미존재`)로 전환.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 카테고리 이름 `'백패킹텐트'` 변경 시 서브쿼리 결과 0 → NULL 전파 → `c is None` 가드로 커버리지 알림 완전 무음.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 91–98 — 카테고리 이름 하드코딩, 존재 여부 미확인.
- **제안 수정:** 카테고리 존재 여부 사전 확인 후 쿼리 실행.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 91 [lane:BACKEND]

---

### [M-492] ✅ 해결완료(기해결 L-210 확인, DP-3) — `danawa.py` `http_get` — URLError 재시도 시 `last=None` 리셋으로 이전 HTTPError 정보 손실
> 확인: URLError 분기에서 `last = e`로 실제 에러 보존(L-210, danawa.py L89). 끝에서 `if last: raise last`로 정보 유지.

- **영역:** 백엔드 — 데이터 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 시도1 HTTPError(403) → 시도2 URLError → `last=None` 리셋 → 최종 raise에서 403 정보 소실, 일반 오류 메시지만 출력.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 85–88 — URLError 브랜치에서 `last = None` 재설정.
- **제안 수정:** URLError에서도 `last = e` 유지, 덮어쓰지 않음.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 85 [lane:BACKEND]

---

### [M-493] ✅ 해결완료(2026-06-14, MA) — `backend/main.py` `get_real_ip` — `CF-Connecting-IP` 헤더 무조건 신뢰 → rate-limit 우회 가능
> 수정: get_real_ip가 소켓 IP가 Cloudflare 공식 대역일 때만 CF-Connecting-IP 신뢰(main.py L14~). 헤더 스푸핑 rate-limit 회피 차단. CF 뒤 아니면 소켓IP. 4케이스 검증.

- **영역:** 백엔드 — API 서버
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** Cloudflare 우회 직접 접근 시 `CF-Connecting-IP` 헤더 위조로 임의 IP를 rate-limit 키로 주입 가능.
- **원인:** [backend/main.py](backend/main.py) line 14–19 — 소켓 IP가 Cloudflare IP 범위인지 검증 없이 헤더 신뢰.
- **제안 수정:** 소켓 IP(request.client.host)가 Cloudflare IP 범위 내일 때만 `CF-Connecting-IP` 신뢰.
- **파일:** [backend/main.py](backend/main.py) line 14 [lane:BACKEND]

---

### [L-404] — `normalize.py` `parse_dims_cm` — 유럽식 소수 쉼표 문자열 오처리

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `"2,5x3,0"` 같은 유럽식 소수 표기에서 쉼표 제거 → `"25x30"`, 10배 오차.
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 47 — `replace(",", "")` 천 단위 구분자와 소수점 구분자를 구별하지 않음.
- **제안 수정:** `re.sub(r"(\d),(\d{3})", r"\1\2", s)` 패턴으로 천 단위만 제거.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 47 [lane:BACKEND]

---

### [L-405] — `normalize.py` `parse_capacity_l` — 용량 정규식 `l` 단어 경계 없음

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 용량 정규식 `l` 대안이 단어 경계 없이 서브스트링 매칭 가능 (이론적 오탐 위험).
- **원인:** [pipeline/normalize.py](pipeline/normalize.py) line 110–113 — `(?:l|리터|ℓ)` 에 `\b` 없음.
- **제안 수정:** `(?:l\b|리터|ℓ)` 로 변경.
- **파일:** [pipeline/normalize.py](pipeline/normalize.py) line 112 [lane:BACKEND]

---

### [L-406] — `danawa.py` `parse_spec_string` — 빈 키 silent 삽입

- **영역:** 백엔드 — 데이터 수집
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 콜론으로 시작하는 스펙 문자열 파싱 시 `k=""` 빈 키로 `specs[""] = v` 삽입 → 다운스트림 키 조회 오류.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 169 — `split(":", 1)` 후 빈 key 가드 없음.
- **제안 수정:** `if not k: continue` 추가.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 169 [lane:BACKEND]

---

### [L-407] — `backend/store.py` — `site/data/*.json` glob이 임시/백업 파일 로드

- **영역:** 백엔드 — API 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `.json` 확장자를 가진 임시 파일이 카테고리 데이터로 로드 → `categories` 오염.
- **원인:** [backend/store.py](backend/store.py) line 19 — glob에 slug 유효성 검사 없음.
- **제안 수정:** 로드된 딕셔너리에 `"slug"` 키 존재·파일명 일치 여부 검증.
- **파일:** [backend/store.py](backend/store.py) line 19 [lane:BACKEND]

---

### [L-408] — `value_metric.py` `dry_run()` — 스펙 쿼리 `ORDER BY` 없어 export와 다른 값 반환

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `dry_run()`이 `export_site.py`와 다른 스펙 값을 반환 → dry-run 검증 결과가 실제 export와 불일치.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 253–257 — `ORDER BY v.is_primary DESC, IFNULL(v.source_id,1) DESC` 없음.
- **제안 수정:** `export_site.py`와 동일한 ORDER BY 추가.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 253 [lane:BACKEND]

---

### [H-135] ✅ 해결완료(2026-06-14, HF) — `buildFilters` 스펙 슬라이더 — `NaN` 값 통과 + 대형 배열 spread RangeError
> 수정: 슬라이더 num()을 `Number.isFinite` 필터로(app.js L1648) → NaN이 Math.min/max로 전파돼 슬라이더 비기능 되던 것 차단.

- **영역:** 프론트엔드 — 필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 스펙 값에 `NaN` 포함 시 `Math.min/max` 반환값 NaN → 슬라이더 `min=NaN max=NaN` 비기능. 수백 건 대형 카테고리에서 `Math.min(...vals)` spread → 콜스택 초과 RangeError.
- **원인:** [site/app.js](site/app.js) line 1661, 1687 — `num()` 필터가 `NaN != null` 통과, spread 방식 사용.
- **제안 수정:** `num = arr => arr.filter(v => v != null && Number.isFinite(v))`, spread 대신 `vals.reduce((a,b) => Math.min(a,b), Infinity)`.
- **파일:** [site/app.js](site/app.js) line 1661 [lane:CORE]

---

### [M-494] ✅ 분석완료(M-336 포함, 기구현) — `renderActiveFilters` — EXTRA_SPECS 범위 필터 unit `STATE.unit`에 없어 단위 빈 문자열

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `water_head`, `r_value` 등 EXTRA_SPEC 슬라이더 필터 활성 칩에 단위 표시 안 됨 (`300~2000` → `300~2000mm` 이어야 함).
- **원인:** [site/app.js](site/app.js) line 1954 — `STATE.unit`은 `d.metrics` 키만 포함, EXTRA_SPECS 키 없음.
- **제안 수정:** `STATE.unit[k]` 미존재 시 `(EXTRA_SPECS[STATE.slug]||[]).find(e=>e.key===k)?.unit || ""` 폴백 추가.
- **파일:** [site/app.js](site/app.js) line 1954 [lane:CORE]

---

### [M-495] ✅ 분석완료(moot: 호출자가 반환값 미사용, 코얼리싱은 설계상 의도) — `saveRemoteWishlist` 병합 경로 — 코얼리싱으로 첫 번째 호출자가 `undefined` 수신

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 빠른 연속 `saveRemoteWishlist` 호출 시 첫 번째 호출이 코얼리싱으로 early-return → Promise 반환값 `undefined`, 호출자가 성공/실패 판단 불가.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 162–176 — 공유 체인 Promise 반환, 코얼리싱된 호출은 `return undefined`.
- **제안 수정:** 호출별 Promise 반환 또는 "코얼리싱될 수 있음" 명시 문서화 + 호출자 방어 코드.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 162 [lane:CORE]

---

### [M-496] ⏸ 보류(멀티탭 TOCTOU, storage event 대응 필요) — `toggleWish` read-modify-write TOCTOU 경합

- **영역:** 프론트엔드 — 찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 두 탭에서 거의 동시에 찜 토글 시 두 번째 `setWish`가 첫 번째 덮어씀 → 한 탭의 토글 조작 소실.
- **원인:** [site/app.js](site/app.js) line 441–445 — `getWish()` stale read 후 `setWish()` 덮어쓰기, localStorage 원자적 조작 없음.
- **제안 수정:** `storage` 이벤트 수신 후 외부 변경 반영, 또는 쓰기 직전 재read.
- **파일:** [site/app.js](site/app.js) line 441 [lane:CORE]

---

### [M-497] ✅ 해결완료(2026-06-13) — `view-set` import — `atob` 실패 시 숨겨진 섹션 미복원 → 빈 화면 잔존

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 링크 단축 등으로 `view-set` 파라미터가 잘려 `atob()` 실패 시 `catch {}` 무음 처리, 이전에 숨긴 섹션이 복원 안 됨 → 빈 계정 페이지 표시.
- **원인:** [site/app.js](site/app.js) line 4247, 4297 — 섹션 숨기기가 try 블록 앞에서 실행, catch에서 복원 없음.
- **제안 수정:** `finally { hiddenSections.forEach(el => el.style.display = ''); }` 추가, toast("유효하지 않은 공유 링크예요") 표시.
- **파일:** [site/app.js](site/app.js) line 4247 [lane:CORE]

---

### [M-498] ✅ 기구현(M-258 포함, 2026-06-13 검증) — `renderStyleChips` 빈 모델 카테고리 — `STATE.sortKey = "spec:undefined"` 두 번째 경로

- **영역:** 프론트엔드 — 카테고리 렌더링
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `models: []` 카테고리에서 `star[0]=undefined` → line 1570 `"spec:undefined"` 설정. H-107의 `applyStyleSort` 가드는 해당 line을 커버하지 않음.
- **원인:** [site/app.js](site/app.js) line 1570 — `"spec:" + (star[0] && star[0].key)` 에서 `star[0]=undefined` 시 `"spec:undefined"` 생성.
- **제안 수정:** `STATE.sortKey = star[0] ? "spec:" + star[0].key : null;` 로 변경, null sortKey 처리.
- **파일:** [site/app.js](site/app.js) line 1570 [lane:CORE]

---

### [L-409] ✅ 해결완료(2026-06-14, C) — star·EXTRA_SPEC 슬라이더에 lo>=hi 가드 추가(가격 M-570과 동일), 전 모델 동일값 시 퇴화 슬라이더 스킵. — `buildFilters` EXTRA_SPEC 슬라이더 — `lo === hi` 퇴화 케이스 미스킵

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 모든 모델의 EXTRA_SPEC 값이 동일하면 `min=X max=X` 슬라이더 렌더 → 이동 불가 UX. (가격 슬라이더 L-385와 동일 패턴, EXTRA_SPEC 버전)
- **원인:** [site/app.js](site/app.js) line 1685–1699 — `lo === hi` 체크 없음 (star 슬라이더는 `vals.length < 2` 가드 있음).
- **제안 수정:** `if (lo === hi) return;` 추가 (line 1687 이후).
- **파일:** [site/app.js](site/app.js) line 1687 [lane:CORE]

---

### [L-410] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — applySort의 star는 buildFilters 지역 클로저로 카테고리 렌더마다 재생성(1921 내부), 핸들러도 새 DOM에 재바인딩. 재현불가. — `applySort` — stale `star` 클로저로 이전 카테고리 star 메트릭 키 사용

- **영역:** 프론트엔드 — 정렬
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 카테고리 이동 후 `buildFilters` 재호출 없이 sort chip 클릭 시 이전 카테고리 `star[0].key`로 `STATE.sortKey` 설정 → 현재 카테고리에 없는 메트릭으로 정렬 시도.
- **원인:** [site/app.js](site/app.js) line 1891–1894 — `applySort` 클로저가 `buildFilters` 시점의 `star` 캡처.
- **제안 수정:** `applySort` 내부에서 `STATE.data?.metrics?.filter(m => m.is_star)[0]` 신선 조회로 대체.
- **파일:** [site/app.js](site/app.js) line 1891 [lane:CORE]

---

### [H-136] ✅ 해결완료(2026-06-14, CI) — `.github/workflows/pages.yml` — CI가 stale `site/data` JSON 검증 (export
> 수정: pages.yml에 비차단 freshness 가드 추가 — DB(repo)→temp 재익스포트 후 site/data와 diff, 다르면 ::warning(배포물 불변). ⚠️ 비차단 사유: 최근 데이터 직접교정 커밋 등 site/data가 순수 DB-export와 다를 수 있어 차단 시 정상배포 차단 위험 → 경고로 stale 신호만. 순수 export 확정 시 continue-on-error 제거로 차단 강화 가능.
> 보류 사유: 수정(export 단계 추가)이 라이브 배포 워크플로우를 바꿔 자율 처리 위험. DB(camping_tents500.db)는 repo에 커밋돼 있어 CI export는 기술적으로 가능 → export를 temp로 돌려 site/data와 diff하는 '게이트' 방식이 안전하나 export_site outdir 지원·CI 테스트 필요. 사용자 검토 후 처리 권장. 단계 없음)

- **영역:** 백엔드 — CI/CD
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `export_site.py` 미실행 상태에서 `check_export.py`가 이전 커밋 JSON만 검증 → 로컬 DB 변경 후 `site/data/` 미커밋 시 CI 통과, 구버전 데이터 배포.
- **원인:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 39 — export 단계 없이 검증만 실행.
- **제안 수정:** `export_site.py` 단계 추가 또는 `site/data/` 파일이 현재 커밋에서 변경됐는지 확인 단계 추가. 임시로 `git add site/data/` 필수 문서화.
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 39 [lane:BACKEND]

---

### [M-499] ✅ 해결완료(2026-06-14, DP-5) — `export_site.py` — `value_normalized` 문자열 저장 시 `round()` TypeError 크래시
> 수정: `round(float(val),2)` + `(TypeError,ValueError)` 방어로 변경(export_site.py L116). 문자열('12.5')·비수치 모두 안전. 단위테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** OCR·수동 입력 등 텍스트 경로로 `"1500"` 같이 문자열로 저장된 `value_normalized`에 `round(val, 2)` 호출 → TypeError, export 크래시.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 110 — `round()` 전 타입 변환 없음.
- **제안 수정:** `round(float(val), 2) if val is not None else None` 적용.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 110 [lane:BACKEND]

---

### [M-500] ✅ 해결완료(2026-06-14, DP-5) — `export_site.py` — value metric을 `star_metrics` 스펙만으로 계산 → `CATEGORY_CONFIG` 비star 메트릭 silent 누락
> 수정: specs 빌드를 `star_metrics ∪ VM.CATEGORY_CONFIG[slug].metrics`(=spec_metrics)로 확장(export_site.py L72~). config가 지정한 비★ 지표가 compute_value_score eligibility에서 누락되던 잠재버그 차단(현재 데이터에선 모든 config 지표가 ★라 미발현이나 방어).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `vm_models`가 star 메트릭 스펙만 포함 → `CATEGORY_CONFIG`의 `water_head` 등 non-star 메트릭이 없는 상품은 `eligible`에서 제외 → value_score 전체 미계산.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 154–182 — `star_metrics` 필터링으로 vm_models 구성.
- **제안 수정:** vm_models를 전체 `metrics`로 구성하거나 CATEGORY_CONFIG 메트릭이 모두 star 메트릭임을 assert.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 154 [lane:BACKEND]

---

### [M-501] ✅ 해결완료(기해결 M-359/M-400 확인, DP-4) — `normalize_models.py` C-pass — 구 하위 인덱스 중앙값 공식 사용 (H-83 B-pass 수정 미적용)
> 확인: C 패스(브랜드+카테고리 고립봉우리)도 `statistics.median(prices)`로 통일됨(M-359/M-400, normalize_models.py L163). B 패스(L138)와 동일 공식. 잔여 하위인덱스 코드 없음.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** C-pass가 `prices[(len(prices)-1)//2]` (하위 인덱스) 사용 → 짝수 목록에서 B-pass보다 낮은 중앙값 → 15× 임계값이 더 낮게 적용, 고가 정품 오탐 가능.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 161 — H-83 B-pass `statistics.median` 수정이 C-pass에 미적용.
- **제안 수정:** line 161을 `statistics.median(prices)` 로 변경.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 161 [lane:BACKEND]

---

### [M-502] ✅ 해결완료(기완화 확인, DP-2) — `normalize_models.py` — `valid=1` 일괄 리셋과 A-pass 플래그 재설정 사이 크래시 시 outlier 영구 허용
> 확인: `flag_price_outliers`의 valid=1 리셋(L112)→A/B/C 재격리→commit(L173) 사이에 중간 commit이 없어 단일 트랜잭션. 크래시 시 미커밋분 자동 롤백 → outlier 영구 허용 미발생. B15/M-263(manual_invalid 보호)와 동일 영역으로 기완화. 코드변경 불필요.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** line 112 `valid=1` 리셋 후 A/B/C 플래그 재설정 전 크래시 시 이전에 플래그된 이상 가격이 `valid=1` 상태로 DB에 남아 다음 완전 실행까지 노출.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 112 — 리셋+플래그가 비원자적.
- **제안 수정:** 전체 reset+flagging 블록을 단일 트랜잭션으로 묶거나 flag-epoch 컬럼으로 stale 행 구분.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 112 [lane:BACKEND]

---

### [M-503] ✅ 해결완료(2026-06-14, MP) — `check_export.py` — `price_max=0` 시 `or pmin` 폴백으로 제로 최대가 마스킹
> 확인: `pmax = raw_pmax if raw_pmax is not None else pmin` 명시 None 비교 이미 적용(M-222, check_export.py L70).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB 이상으로 `price_max=0` 수출 시 `or pmin`이 0을 None처럼 처리 → 실제 비정상 최대가 마스킹, 검증 통과.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — truthiness 체크(`or`)로 0 처리 오류.
- **제안 수정:** `m.get("price_max") if m.get("price_max") is not None else pmin` 명시적 None 비교.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### [M-504] ✅ 해결완료(2026-06-14, MA) — `backend/routers/search.py` — 동시 `data_store` 재로드 시 `search_index` 반복 중 경합
> 확인: search_index는 재로드 시 새 리스트로 교체(M-553 후에도 `self.search_index=json.load`)되고 반복은 지역 참조라 thread-safe → 비이슈(오탐). lru_cache staleness는 load 재호출 시에만 관여.

- **영역:** 백엔드 — API 서버
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 백그라운드 인덱스 재로드 중 검색 요청이 반복 중인 리스트가 교체되면 부분 결과 반환 가능.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 15–20 — 스레드 안전 가드 없음.
- **제안 수정:** 로컬 참조 스냅샷 `idx = data_store.search_index` 후 반복, 또는 재로드 시 새 리스트 객체 교체(기존 참조는 안전).
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 15 [lane:BACKEND]

---

### [L-411] — `export_site.py` value metric `direction` — magic string 비교로 미래 카테고리 오적용

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `vkey == "value_per_g"` 하드코딩 → 새 `lower_better` value key 카테고리 추가 시 `higher_better` 오적용.
- **원인:** [pipeline/export_site.py](pipeline/export_site.py) line 178 — `CATEGORY_CONFIG`에서 direction 미읽음.
- **제안 수정:** `CATEGORY_CONFIG` 항목에 `"direction"` 필드 추가 후 읽기.
- **파일:** [pipeline/export_site.py](pipeline/export_site.py) line 178 [lane:BACKEND]

---

### [L-412] — `normalize_models.py` GENERIC 폴백 — 카테고리 단어가 상품명인 정상 제품도 `#pcode` 캐노니컬 배정

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** "의자", "텐트" 등 GENERIC 단어가 실제 모델명인 제품이 `#pcode` 캐노니컬을 받아 카탈로그에 해시 ID로 표시.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 183–187 — 이름 없음 vs 이름이 카테고리 단어인 경우 동일 처리.
- **제안 수정:** 이름 없음 → `unknown#pc`, GENERIC 단어 이름 → `name#pc` (상품명 유지).
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 183 [lane:BACKEND]

---

### [L-413] — `check_export.py` — `MIN_MODELS` 가격 있는 상품만 집계, 희소 가격 카테고리 중앙값 불안정

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `len(mins)` (가격 있는 상품) < 전체 상품 수 → 소수 샘플 중앙값으로 가격 이상 탐지 불안정.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 56–59 — `MIN_MODELS`이 전체 모델 수 아닌 가격 보유 수 기준.
- **제안 수정:** `len(models)` 기준으로 변경하거나 주석으로 의도 명시.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 56 [lane:BACKEND]

---

### [L-414] — `graph_full.py` — WAL PRAGMA를 닫히는 읽기 커넥션에 설정, 최초 실행 영속화 불확실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** WAL PRAGMA가 즉시 닫히는 커넥션에 설정 → 신규 DB 최초 실행 시 워커 커넥션이 DELETE 모드로 열릴 수 있어 동시성 충돌 위험.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 110–121 — PRAGMA용 전용 커넥션 미분리.
- **제안 수정:** PRAGMA 전용 커넥션 열고 정상 닫은 후 진행.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 110 [lane:BACKEND]

---

### [L-415] — `graph_full.py` `normalize_db` — 암묵적 트랜잭션 열린 커넥션에서 `BEGIN` 실패 가능

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 호출자 커넥션에 암묵적 트랜잭션이 열려 있으면 `normalize_db`의 `BEGIN` 실행 시 "cannot start a transaction within a transaction" 오류.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 87 — `normalize_db` 호출 시 커넥션 트랜잭션 상태 미확인.
- **제안 수정:** `normalize_db` 진입 시 `if con.in_transaction: con.execute("COMMIT")` 추가.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 87 [lane:BACKEND]

---

### [L-416] ✅ 검토완료·현행유지(2026-06-14, K·설계) — cancel-in-progress:true는 고빈도 커밋 레포에서 최신만 배포(중간 커밋 낭비 방지), deploy-pages는 원자적이라 반쪽배포 없음. — `.github/workflows/pages.yml` — `cancel-in-progress: true`로 정상 배포 취소 위험

- **영역:** 백엔드 — CI/CD
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 빠른 연속 push 시 첫 번째 정상 배포가 두 번째 push로 취소 → 버그 버전이 게이트 없이 배포될 수 있음.
- **원인:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 14–15 — 프로덕션 환경 취소 위험.
- **제안 수정:** 프로덕션 배포는 `cancel-in-progress: false` 고려 또는 main 브랜치 보호.
- **파일:** [.github/workflows/pages.yml](.github/workflows/pages.yml) line 14 [lane:BACKEND]

---

### [L-417] — `backend/routers/categories.py` `SLUG_RE` — 언더스코어 미허용으로 미래 slug 변경 시 400 오탐

- **영역:** 백엔드 — API 서버
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 새 카테고리 slug에 언더스코어(`_`) 포함 시 400 반환, store 조회 전 거부 → 설정 오류 진단 어려움.
- **원인:** [backend/routers/categories.py](backend/routers/categories.py) line 6 — `SLUG_RE = r"^[a-z0-9-]+$"` 언더스코어 제외.
- **제안 수정:** `r"^[a-z0-9_-]+$"` 로 변경하거나 제약 이유 주석 추가.
- **파일:** [backend/routers/categories.py](backend/routers/categories.py) line 6 [lane:BACKEND]

---

### [H-137] ✅ 해결완료(2026-06-14, HF) — `renderActiveFilters` — 카테고리 로드 전 호출 시 `STATE.unit` 미정의 TypeError
> 수정: renderActiveFilters의 `STATE.unit[k]`를 `(STATE.unit&&STATE.unit[k])||''`로(app.js L1979) → STATE 미초기화 시 TypeError 방지.

- **영역:** 프론트엔드 — 필터
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `STATE.unit`이 초기화되기 전 `renderActiveFilters()` 호출(또는 `clearAllFilters`) 시 `STATE.unit[k]` → TypeError 크래시.
- **원인:** [site/app.js](site/app.js) line 1956 — `let STATE = {}` 초기화 시 `unit` 프로퍼티 없음.
- **제안 수정:** `(STATE.unit && STATE.unit[k]) || ""` 가드 추가 또는 `STATE = { unit: {}, range: {}, brands: new Set(), ... }` 초기화.
- **파일:** [site/app.js](site/app.js) line 1956 [lane:CORE]

---

### [M-505] ✅ 분석완료(moot: M-482 _wishSyncedUser 가드가 이중 실행 차단) — `syncWishlistOnLogin` 최초 로그인+닉네임 설정 플로 — 이중 원격 쓰기 경합

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 닉네임 저장 후 line 352와 `initAuth` 콜백 line 636에서 `syncWishlistOnLogin` 두 번 호출 → 두 merge+upsert 경합으로 한 쪽 결과 덮어씀.
- **원인:** [site/account.html](site/account.html) line 352, 636 — 재진입 방지 플래그 없음.
- **제안 수정:** `let _wishSynced = false` 플래그로 첫 번째 완료 후 재호출 차단.
- **파일:** [site/account.html](site/account.html) line 352 [lane:CORE]

---

### [M-506] ✅ 해결완료(2026-06-13) — `restoreState` `?brands=|||...` URL — 빈 문자열 브랜드 Set 대량 추가 → 전체 모델 필터 제거

- **영역:** 프론트엔드 — URL 상태
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `?brands=|||||...` URL 조작으로 수천 개 빈 문자열 브랜드가 `STATE.brands` Set에 추가 → 어떤 모델도 brand 매칭 실패 → 빈 카테고리 렌더.
- **원인:** [site/app.js](site/app.js) line 1338 — `br.split("|")` 후 빈 문자열 필터 없음.
- **제안 수정:** `.filter(Boolean)` 추가: `br.split("|").filter(Boolean).forEach(...)`.
- **파일:** [site/app.js](site/app.js) line 1338 [lane:CORE]

---

### [M-507] ✅ 분석완료(M-482 포함, 기해결) — `syncWishlistOnLogin` 재진입 시 `window.onWishChange` 비행 중 덮어씀

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 재호출 시 기존 `onWishChange` 클로저가 진행 중 저장 완료 전 덮어씌워져 이전 저장과 새 병합 쓰기 경합.
- **원인:** [site/account.html](site/account.html) line 278 — 핸들러 재등록 전 진행 중 저장 대기 없음.
- **제안 수정:** `if (!window.onWishChange) window.onWishChange = ...` 조건부 등록.
- **파일:** [site/account.html](site/account.html) line 278 [lane:CORE]

---

### [M-508] ✅ 해결완료(2026-06-13) — `importSet` `?view-set=` — `JSON.parse` 실패 시 섹션 숨김 미복원 → 계정 페이지 빈 화면

- **영역:** 프론트엔드 — 세트 공유
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `atob` 성공 but `JSON.parse` 실패 시 `catch {}` 무음 처리, 이미 숨겨진 섹션 미복원 → 계정 페이지 빈 화면. (M-497은 atob 실패 케이스)
- **원인:** [site/app.js](site/app.js) line 4254–4307 — 섹션 숨기기가 JSON.parse 전에 실행.
- **제안 수정:** `finally { hiddenSections.forEach(el => el.style.display = ''); }` 또는 섹션 숨기기를 parse 성공 이후로 이동.
- **파일:** [site/app.js](site/app.js) line 4277 [lane:CORE]

---

### [L-418] ✅ 검토완료·현행유지(2026-06-14, C·코드 실대조) — 상품1개 시 prices.length 1, lo===hi → M-570 스킵. updateFill도 totalHi===totalLo 가드(1890). 오탐. — `buildFilters` 가격 슬라이더 — 상품 1개 카테고리에서 `step=0` + NaN fill bar

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 가격 있는 상품이 1개인 카테고리에서 `lo===hi` → `step=Math.round(0/100/1000)*1000=0` → `step="0"` 유효하지 않은 range input, fill bar `NaN%`.
- **원인:** [site/app.js](site/app.js) line 1644–1655 — `prices.length < 2` 조기 반환 없음.
- **제안 수정:** `if (prices.length < 2) return;` 추가.
- **파일:** [site/app.js](site/app.js) line 1644 [lane:CORE]

---

### [L-419] ✅ 해결완료(2026-06-14, C) — renderActiveFilters 범위칩 fmt를 +(+v).toFixed(2)로 반올림, 부동소수점 노이즈 제거. — `renderActiveFilters` 범위 필터 칩 — 부동소수점 미반올림 표시 (`"1.5000000000000002m²"`)

- **영역:** 프론트엔드 — 필터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 슬라이더 step 연산 부동소수점 누적 오차가 활성 필터 칩 텍스트에 그대로 노출.
- **원인:** [site/app.js](site/app.js) line 1963 — `v + rawUnit` 에서 `v` 반올림 없음.
- **제안 수정:** `Number(v).toFixed(1) + rawUnit` 로 변경.
- **파일:** [site/app.js](site/app.js) line 1963 [lane:CORE]

---

### [H-138] ✅ 해결완료(기해결 H-120 확인, HB) — `download_images.py` — `image_local=''` 빈 문자열 재다운로드 미실행 (WHERE 절 논리 오류
> 확인: 상수 서브쿼리를 `(p.image_local IS NULL OR p.image_local='')` 명시 조건으로 이미 교체됨(H-120, download_images.py L98). 빈 문자열도 재다운로드 대상 포함.)

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `image_local`이 빈 문자열(`''`)인 상품이 재다운로드 대상에서 제외 → 이미지 없는 상품이 영구적으로 이미지 없는 상태 유지.
- **원인:** [pipeline/download_images.py](pipeline/download_images.py) line 93–101 — `NOT EXISTS(SELECT 1 FROM (SELECT 1))` 상수 서브쿼리, 항상 FALSE 반환. `image_local IS NULL`만 재다운로드 대상.
- **제안 수정:** `AND (p.image_local IS NULL OR length(p.image_local) = 0)` 직접 조건으로 교체.
- **파일:** [pipeline/download_images.py](pipeline/download_images.py) line 93 [lane:BACKEND]

---

### [M-509] ✅ 해결완료(기해결 M-183/M-290 확인, DP-1) — `multicat.py` `ingest_one` — `INSERT OR IGNORE` 중복 시 `fetchone()[0]` TypeError
> 확인: multicat.py L177 `if cur.rowcount: pid=cur.lastrowid else: 스킵` + 브랜드 `if not brow` 가드 이미 적용됨(M-183/M-290). fetchone()[0] 의존 제거됨.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 중복 INSERT가 무시된 후 SELECT 결과가 None → `None[0]` TypeError. `harvest_tents.py`의 H-79 수정과 동일한 버그, `multicat.py`에 미적용.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 167–170 — `cur.lastrowid` 패턴 미사용.
- **제안 수정:** `harvest_tents.py`의 `cur.lastrowid` + SELECT 폴백 패턴 동일 적용.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 167 [lane:BACKEND]

---

### [M-510] ✅ 해결완료(기해결 L-192 확인, DP-1) — `collect_images.py` — 검증 상품 0건 시 `100*done/tot` ZeroDivisionError
> 확인: collect_images.py L95 `pct = round(100*done/tot) if tot else 0` 가드 이미 적용됨(L-192).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 신규 DB에서 `curation_status='verified'` 상품 없으면 `tot=0` → ZeroDivisionError 크래시.
- **원인:** [pipeline/collect_images.py](pipeline/collect_images.py) line 94 — 0 나눔 가드 없음.
- **제안 수정:** `round(100*done/(tot or 1))` 또는 `if tot else 0`.
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 94 [lane:BACKEND]

---

### [M-511] ✅ 해결완료(기해결 M-176 확인, DP-1) — `backfill_capacity.py` — products 테이블 비어있을 때 `have*100//total` ZeroDivisionError
> 확인: backfill_capacity.py L79 `pct = (have*100//total) if total else 0` 가드 이미 적용됨(M-176).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 빈 DB에서 `total=0` → 요약 출력 시 ZeroDivisionError.
- **원인:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 78 — 0 나눔 가드 없음.
- **제안 수정:** `(have*100//total if total else 0)`.
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 78 [lane:BACKEND]

---

### [M-512] ✅ 해결완료(기해결 M-215 확인, DP-1) — `enrich_details.py` — `targets` 빈 리스트 시 `IN ()` SQL 문법 오류
> 확인: enrich_details.py L91 `if not targets:` 조기 종료 가드 이미 적용됨(M-215).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `danawa_pcode` 없는 신규 DB에서 `IN ()` SQLite 문법 오류 → OperationalError 크래시.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122–124 — `",".join("?" * 0)` = `""`.
- **제안 수정:** `if not targets: return` 조기 반환 또는 `if targets:` 조건부 실행.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 122 [lane:BACKEND]

---

### [M-513] ✅ 해결완료(기해결 M-393 확인, DP-3) — `seed_coupang.py` `--load` — 비정수 `rep_product_id` CSV 행에서 `int()` ValueError
> 확인: load()에서 `rid` 비정수 검사 후 경고+continue 가드가 이미 적용됨(M-393, seed_coupang.py L90~93).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 수동 편집 CSV의 오타/빈 `rep_product_id` 행에서 `int(r["rep_product_id"])` ValueError 크래시, 이후 행 전체 미처리.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 87 — try/except 없음.
- **제안 수정:** `try/except ValueError: print(f"건너뜀: {r}"); continue` 래핑.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 87 [lane:BACKEND]

---

### [M-514] ✅ 해결완료(2026-06-14, DP-7) — `harvest_tents.py` — `p_trunc` 정의 순서가 `report()` 호출 뒤 → 코드 추출 시 NameError 위험
> 수정: `p_trunc` 정의를 `report()` 앞으로 이동(harvest_tents.py L239 직전). 부분 import/REPL에서 report만 먼저 평가될 때의 NameError 위험 제거. 단일 정의 확인.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `report()` 함수(line 251)가 `p_trunc`(line 263)보다 앞에 위치 → REPL 혹은 부분 import 시 NameError.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 251 — 파일 내 정의 순서 역전.
- **제안 수정:** `p_trunc` 정의를 `report()` 앞으로 이동.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 251 [lane:BACKEND]

---

### [L-420] — `seed_coupang.py` — 쿠팡 URL 유효성 검사 없음 → 임의 URL DB 기록 위험

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 수동 편집 CSV의 오타나 비쿠팡 URL이 검증 없이 DB에 기록, 사용자에게 제공 가능.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 84–87 — URL 도메인 검증 없음.
- **제안 수정:** `url.startswith(("https://www.coupang.com/", "https://coupa.ng/"))` 검증 추가.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 84 [lane:BACKEND]

---

### [L-421] — `collect_images.py` — fetch 예외 silent 누적 (어떤 상품·오류인지 미기록)

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** HTTP 429, SSL 오류 등 체계적 실패 시 `err += 1`만 집계, 원인 진단 불가.
- **원인:** [pipeline/collect_images.py](pipeline/collect_images.py) line 69–70 — `except Exception: err += 1` 로그 없음.
- **제안 수정:** `print(f"! pid={pid} pcode={pcode}: {e}", file=sys.stderr)` 추가.
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 69 [lane:BACKEND]

---

### [L-422] — `multicat.py` `harvest()` — fetch 예외 silent break → 조기 종료 원인 불명

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 네트워크/파싱 오류 시 `except Exception: break` 무음 처리 → harvest 조기 종료와 "더 이상 페이지 없음" 구분 불가.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 196–209 — 예외 로그 없음.
- **제안 수정:** `print(f"! fetch error q={q} p={page}: {e}")` 추가 후 break.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 200 [lane:BACKEND]

---

### [L-423] — `reclassify_other_tent.py` — cat7 비어있을 때 조기 반환 없어 불필요한 `recompute_ratings` 실행

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 이미 재배정 완료된 상태에서 재실행 시 빈 rows로 `recompute_ratings` 불필요하게 실행.
- **원인:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 86 — 빈 rows 조기 반환 없음.
- **제안 수정:** `if not rows: print("이미 완료"); return` 추가.
- **파일:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 86 [lane:BACKEND]

---

### [L-424] — `enrich_details.py` — `filled` 카운터가 flag 해소 수 아닌 스펙 삽입 수 집계 → 출력 오해

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 최종 "메트릭 N개 채움" 메시지가 실제 해소된 flag 수보다 높게 표시될 수 있음.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 54–56 — `filled`가 spec 삽입 수 집계, flag 해소 확인 없음.
- **제안 수정:** 주석으로 의도 명시하거나 flag 해소 수 별도 추적.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 54 [lane:BACKEND]

---

### [M-515] ✅ 해결완료(2026-06-13) — `renderAccount` 찜 카드 `go()` — stale 클로저 인덱스 `ci`로 찜 아이템 오참조

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 빠른 찜 삭제 후 카드 클릭 시 렌더 시점 스냅샷 `wishes[ci]`가 잘못된 아이템 참조 가능.
- **원인:** [site/app.js](site/app.js) line 3407–3408 — `forEach` 클로저가 렌더 시점 `wishes` 캡처.
- **제안 수정:** `go()` 내부에서 `getWish().find(w => w.key === card.dataset.key)` 재조회, 카드에 `data-key` 추가.
- **파일:** [site/app.js](site/app.js) line 3407 [lane:CORE]

---

### [M-516] ✅ 해결완료(2026-06-13) — 찜 카드 `go()` — `wx.s === ""` 빈 문자열 시 falsy로 내비게이션 오작동

- **영역:** 프론트엔드 — 계정/찜
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `s: ""` 빈 문자열로 저장된 찜 아이템 클릭 시 `!wx.s` true → 빈 카테고리 URL로 내비게이션.
- **원인:** [site/app.js](site/app.js) line 3410 — `!wx.s` falsy 체크가 빈 문자열도 null/undefined와 동일 처리.
- **제안 수정:** `wx.s == null` 명시적 null 비교로 변경.
- **파일:** [site/app.js](site/app.js) line 3410 [lane:CORE]

---

### [M-517] ✅ 해결완료(2026-06-14) — `syncGearSetsOnLogin` — `remoteId` 기반만 dedup, 콘텐츠 동일 세트 신규 기기에서 중복 생성

- **영역:** 프론트엔드 — 세트 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 신규 기기 로그인 시 오프라인 생성 로컬 세트와 내용 동일한 원격 세트가 별개로 추가 → 중복 세트 노출.
- **원인:** [site/account.html](site/account.html) line 238–253 — `remoteId` 링크로만 dedup, 콘텐츠 동일성 미확인.
- **제안 수정:** 동기화 전 제목+아이템 수+아이템명 지문으로 기존 세트와 대조, 일치 시 병합.
- **파일:** [site/account.html](site/account.html) line 238 [lane:CORE]

- **처리:** syncGearSetsOnLogin에 제목+아이템수+아이템명 지문 기반 dedup 추가 — 신규 기기에서 동일 내용 세트 중복 생성 방지. (2026-06-14)

---

### [L-425] ✅ 검토완료·현행유지(2026-06-14, F·UX) — 미로그인 CTA는 account.html 로그인 뷰로 안착(렌더login OAuth 노출). 깨짐 없음. — `renderAccount` 미로그인 CTA — `account.html`에서 `href="account.html"` 자기 자신 리로드

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 계정 페이지 미로그인 상태에서 "로그인" CTA 클릭 시 동일 페이지 새로고침, 인증 동작 없음.
- **원인:** [site/app.js](site/app.js) line 3488 — `href="account.html"`이 다른 페이지 용도로 작성됨.
- **제안 수정:** `href="account.html#auth-section"` 앵커 또는 현재 페이지 컨텍스트 감지 후 인라인 로그인 트리거.
- **파일:** [site/app.js](site/app.js) line 3488 [lane:CORE]

---

### [L-426] ✅ 검토완료·현행유지(2026-06-14, E·코드 실대조) — _savePushSub가 upsert error 체크+showToast 경고(3792-3, M-170/M-440). 무음 아님. — `_savePushSub` — Supabase upsert 결과 미확인 → 실패 시 push 등록된 것으로 오인

- **영역:** 프론트엔드 — 푸시 알림
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** RLS 거부, 네트워크 오류 등 upsert 실패 시 오류 무음 처리 → 사용자는 push 활성화 상태로 오인, 가격 알림 미전달.
- **원인:** [site/app.js](site/app.js) line 3702–3711 — upsert 반환값 미확인.
- **제안 수정:** `const { error } = await supabase.from(...).upsert(...); if (error) console.error('_savePushSub failed:', error);` 추가.
- **파일:** [site/app.js](site/app.js) line 3702 [lane:CORE]

---

### [L-427] ✅ 검토완료·현행유지(2026-06-14, F·설계) — localWish.set 우회는 onWishChange 등록(303) 전 초기병합 한정으로 의도적(H-128), 변경분은 300행서 명시 저장. — `account.html` `localWish.set()` — `setWish()` 우회로 `onWishChange` 미트리거

- **영역:** 프론트엔드 — 찜 동기화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `syncWishlistOnLogin`의 `localWish.set(merged)`가 `app.js`의 `setWish()`를 거치지 않아 `onWishChange` 콜백 미실행 — 향후 onWishChange 의존 코드 추가 시 누락 버그 유발.
- **원인:** [site/account.html](site/account.html) line 223, 281 — 병렬 localStorage 쓰기 경로.
- **제안 수정:** `localWish.set()`이 `setWish()` 우회임을 주석 명시, 또는 `setWish()` 호출로 통일.
- **파일:** [site/account.html](site/account.html) line 223 [lane:CORE]

---

### [L-428] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — display:none 시 무동작은 인증완료 후 658행 scrollToHashSection 재호출로 재시도됨. — `scrollToHashSection` — 섹션 `display:none` 시 silent 종료, 인증 완료 후 재시도 없음

- **영역:** 프론트엔드 — 계정
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 인증 지연 중 `account.html#sets` 접속 시 섹션이 아직 `display:none` → `scrollToHashSection` 조기 종료, 인증 완료 후 재스크롤 없음.
- **원인:** [site/account.html](site/account.html) line 364–369 — `display:none` 가드 후 재시도 없음.
- **제안 수정:** `renderAccount()` 내부 또는 `requestAnimationFrame` 후에 `scrollToHashSection()` 호출.
- **파일:** [site/account.html](site/account.html) line 364 [lane:CORE]

---

### [H-139] ✅ 해결완료(2026-06-14, HB) — `run_all.py` → `detect_price_drops.py` — `--db` 인수 미전달로 기본 DB 고정 가격 알림
> 수정: detect_price_drops에 `--db` argparse 추가 + `detect(db)` 인자화(L86·160~), run_all이 호출 시 `--db DB` 전달(run_all.py L234). 커스텀 DB 실행 시 엉뚱한 기본 DB 알림 방지. --help 노출·배선 확인.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `--db` 커스텀 옵션으로 run_all 실행 시 price-drop 감지기가 항상 기본 DB(`camping_tents500.db`) 읽어 엉뚱한 데이터 기반 알림 발송.
- **원인:** [pipeline/run_all.py](pipeline/run_all.py) line 232 — `detect_price_drops.py` 호출 시 `--db` 미전달. `detect_price_drops.py` 자체에도 `--db` 인수 없음.
- **제안 수정:** `detect_price_drops.py`에 `--db` argparse 추가, `run_all.py`에서 전달.
- **파일:** [pipeline/run_all.py](pipeline/run_all.py) line 232 [lane:BACKEND]

---

### [H-140] ✅ 해결완료(2026-06-14, HB) — `make_logo.py` — macOS 전용 폰트 경로 하드코딩 + `store-assets/` 디렉터리 미생성
> 수정: `_font(size,index)` 폴백 로더 추가(AppleSDGothicNeo→Nanum→DejaVu→load_default)로 Linux/CI 크래시 방지(make_logo.py L13~). store-assets 저장 전 `os.makedirs(exist_ok=True)` 추가. M-568(동일 폰트 이슈) 동반 해소. 폴백 동작 검증.

- **영역:** 백엔드 — 빌드 스크립트
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** Linux/CI에서 `/System/Library/Fonts/AppleSDGothicNeo.ttc` OSError, 또는 `store-assets/` 없으면 FileNotFoundError → 아이콘 전체 미생성.
- **원인:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 — macOS 전용 경로. line 139, 144 — `os.makedirs` 없음.
- **제안 수정:** `ImageFont.load_default()` 폴백 추가, `os.makedirs(dir, exist_ok=True)` 추가.
- **파일:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 [lane:BACKEND]

---

### [M-518] ✅ 해결완료(기해결 M-356/M-417 확인, DP-6) — `ocr_specs.py` — 무게 주석 "가장 큰 값" vs 코드 `min()` 불일치 → 유지보수 위험
> 확인: 무게 채택이 `max(kgs)`로 주석 의도(가장 큰 값=본체/패키지)와 일치하도록 이미 교정됨(M-356/M-417, ocr_specs.py L104). 부속 과소평가 방지.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 주석("가장 큰 값 = 본체 추정")이 코드 `min(kgs)`와 반대 → 유지보수자가 주석 기준으로 `max()`로 수정하면 전체 무게 데이터 과대 계산.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 100–103 — 주석과 코드 의미 역전.
- **제안 수정:** 주석을 "가장 작은 값 = 본체 최소무게(weight_min 정의)"로 수정.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 100 [lane:BACKEND]

---

### [M-519] ✅ 해결완료(2026-06-14, DP-3) — `ocr_specs.py` `run()` — `ocr_text()` 예외 미처리로 스펙 삽입 롤백
> 수정: `parse_specs(ocr_text(url))`를 try/except로 감싸 단일 URL OCR 실패 시 con.rollback()+로그 후 다음 pid로 continue(ocr_specs.py L211~). run() 전체 크래시·잔여 타깃 유실 방지.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 네트워크 오류, tesseract 미설치, PIL 이미지 오류 등 `ocr_text()` 예외 발생 시 같은 PID의 현재 루프 스펙 삽입 무음 롤백, 로그 없음.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 201 — `ocr_text()` 호출 try/except 없음.
- **제안 수정:** `try: parsed = parse_specs(ocr_text(url)) except Exception as e: print(f"! {pid}: {e}"); continue` 래핑.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 201 [lane:BACKEND]

---

### [M-520] ✅ 해결완료(기해결 M-411 확인, DP-8) — `star_catalog.py` TOP3 리포트 쿼리 — `valid=1` 필터 없어 무효 가격 표시
> 확인: TOP3 price 서브쿼리에 `po.valid=1`(격리 제외) 이미 적용됨(M-411, star_catalog.py L95).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** TOP3 리포트에 무효화된 이상 가격(예: 2,167원)이 표시 → 실제 star 점수와 불일치, 운영자 혼란.
- **원인:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 92 — 리포트 서브쿼리에 `AND po.valid=1` 없음.
- **제안 수정:** `AND po.valid=1` 추가.
- **파일:** [pipeline/star_catalog.py](pipeline/star_catalog.py) line 92 [lane:BACKEND]

---

### [M-521] ✅ 해결완료(기해결 L-193 확인, DP-3) — `seed_coupang.py` CSV `open()` — 인코딩 미지정으로 Windows/CP949 환경 한글 문자 깨짐
> 확인: build/load의 CSV open 3곳 모두 `encoding="utf-8"` 명시됨(L-193, seed_coupang.py L54·60·83).

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 비UTF-8 기본 인코딩 환경에서 브랜드·모델명 mojibake → `existing` 딕셔너리 매칭 실패, 기존 쿠팡 URL 전체 초기화.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 54, 82 — `open()` 인코딩 미지정.
- **제안 수정:** 두 `open()` 호출에 `encoding="utf-8"` 추가.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 54 [lane:BACKEND]

---

### [M-522] ✅ 해결완료(2026-06-14, DP-8) — `promote_catalog.py` `covpct()` — 비따옴표 f-string SQL 삽입으로 인젝션 스캐너 우회
> 수정: expr을 f-string으로 SQL에 삽입하던 covpct() 동적쿼리를 제거하고, 고정 컬럼 5개 보유율을 단일 정적 쿼리(`SUM(col IS NOT NULL)*100.0/COUNT(*)`)로 일괄 산출(promote_catalog.py L92~). 동적 SQL 제거로 스캐너-클린. 단위테스트 통과.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `covpct(expr)`가 `{expr}` 그대로 SQL에 삽입 → `scan_sql_injection.py`가 따옴표 없는 삽입 탐지 불가, 미래 신뢰할 수 없는 호출자 추가 시 SQL 인젝션 무방비.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 82 — 비매개변수화 f-string SQL. 스캐너가 `QUOTED_BRACE`만 탐지.
- **제안 수정:** 헬퍼 함수 인라인화 또는 `# sql-ok` 주석으로 안전성 근거 명시.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 82 [lane:BACKEND]

---

### [M-523] ✅ 해결완료(2026-06-14, DP-5) — `add_value_star.py` — `backpacking-bag.json` 미존재 시 FileNotFoundError (export 미실행 환경)
> 수정: main 초반 `if not os.path.exists(PATH): 안내 후 return` 가드 추가(add_value_star.py L48~). export 선행 안내 후 정상 종료.

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 신규 클론 또는 export 미실행 환경에서 스크립트 실행 시 비설명적 FileNotFoundError 크래시.
- **원인:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 44 — 파일 존재 확인 없음.
- **제안 수정:** `if not os.path.exists(PATH): sys.exit("backpacking-bag.json 없음 — export_site.py 먼저 실행")`.
- **파일:** [pipeline/add_value_star.py](pipeline/add_value_star.py) line 44 [lane:BACKEND]

---

### [L-429] ✅ 검토완료·현행유지(2026-06-14, M·코드 실대조) — L-362와 동일, AUTO_CH로 수동값 무차별 덮어쓰기 방지. — `column_fixes.py` — channel 무조건 덮어쓰기로 수동 배정값 유실

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 재실행 시 수동으로 배정된 `channel` 값이 '직구'/'국내'로 리셋.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36–39 — WHERE 절에 `channel IS NULL` 조건 없음.
- **제안 수정:** `AND (channel IS NULL OR channel='')` 추가.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36 [lane:BACKEND]

---

### [L-430] ✅ 검토완료·현행유지(2026-06-14, K·설계) — 비따옴표 {expr} 탐지는 안전한 IN ({ph}) 플레이스홀더 조립을 대량 오탐(line 10 문서화). 작은따옴표 값삽입만 보는 게 균형상 정답. — `scan_sql_injection.py` — 비따옴표 SQL 삽입(`{expr}` 키워드 위치) 탐지 불가

- **영역:** 백엔드 — 보안 도구
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `QUOTED_BRACE` 패턴이 따옴표 내 삽입만 탐지 → M-522 같은 SQL 키워드 위치 f-string 삽입 완전 누락, false-safe 인상.
- **원인:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 22–25 — 탐지 범위 협소.
- **제안 수정:** SQL 키워드(SELECT/WHERE/FROM/UPDATE/DELETE) 뒤 비따옴표 `{…}` 패턴 추가 탐지.
- **파일:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 22 [lane:BACKEND]

---

### [L-431] — `detect_price_drops.py` — `--db` CLI 인수 없어 스테이징 DB 테스트 불가

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 개발자가 다른 DB로 price-drop 감지 테스트 시 소스 파일 직접 수정 필요, H-139의 근본 원인.
- **원인:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 139–141 — argparse에 `--db` 없음.
- **제안 수정:** `ap.add_argument("--db", default=DB)` 추가.
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py) line 139 [lane:BACKEND]

---

### [H-141] ✅ 해결완료(2026-06-14, 보안) — `sw.js` 푸시 알림 핸들러 — `data.url`에 `javascript:` 스킴 허용 → XSS
> 수정: notificationclick에서 `new URL(raw,origin)` 후 `u.origin===location.origin && protocol∈{http,https}`만 허용, 그 외(javascript:/data:/타출처/protocol-relative)는 루트 폴백(sw.js L105~). node로 7개 케이스 검증.

- **영역:** 프론트엔드 — 서비스 워커 (보안)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 악의적 푸시 서버가 `{ "url": "javascript:..." }` 전송 시 `clients.openWindow("javascript:...")` 실행 → XSS.
- **원인:** [site/sw.js](site/sw.js) line 105–112 — `new URL(url, location.origin)` 이후 스킴 화이트리스트 검사 없음.
- **제안 수정:** `if (!absUrl.startsWith(location.origin + "/")) { clients.openWindow("/"); return; }` 가드 추가.
- **파일:** [site/sw.js](site/sw.js) line 105 [lane:CORE]

---

### [M-524] ✅ 해결완료(2026-06-13) — `account.html` `avatar_url` — `esc()`만 적용, `javascript:` URL 스킴 미차단

- **영역:** 프론트엔드 — 계정 (보안)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `profiles`에서 온 `avatar_url`이 `<img src="${esc(avatar)}">` 로 삽입 → `javascript:alert(1)` src 허용. `app.js`의 `safeHttps()` 패턴 미적용.
- **원인:** [site/account.html](site/account.html) line 473, 482 — `esc()` HTML 엔티티 이스케이프만, URL 스킴 미검증.
- **제안 수정:** `avatar` 사용 전 `/^https:\/\//i.test(avatar)` 검사, 실패 시 기본 아이콘 사용.
- **파일:** [site/account.html](site/account.html) line 473 [lane:CORE]

---

### [L-432] — `importSet` — `coupang_url` localStorage 저장 전 `safeHttps()` 검증 누락 → 잠재적 저장 XSS

- **영역:** 프론트엔드 — 세트 공유 (보안)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** base64 디코딩된 공유 세트의 `coupang_url`이 검증 없이 localStorage에 저장 → 추후 `openExternal()` 가드 완화 시 저장 XSS 벡터.
- **원인:** [site/app.js](site/app.js) line 4298 — `coupang_url: x.coupang_url || ""` `safeHttps()` 미통과.
- **제안 수정:** `/^https:\/\//i.test(x.coupang_url) ? x.coupang_url : ""` 로 변경.
- **파일:** [site/app.js](site/app.js) line 4298 [lane:CORE]

---

### [H-142] ✅ 해결완료(2026-06-14, 보안) — `signInWithApple` — Apple nonce SHA-256 해싱 없이 랜덤 UUID 두 번 생성 → 인증 항상 실패
> 수정: rawNonce 1개 생성 → `_sha256Hex(rawNonce)` 해시를 Apple `authorize({nonce})`에, 원본 rawNonce를 `signInWithIdToken({nonce})`에 전달(supabaseClient.js L53~). SHA-256 known vector(abc)로 헬퍼 검증.

- **영역:** 프론트엔드 — Auth/OAuth (보안)
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** Apple 로그인 시 "nonce mismatch" / "invalid id_token" 오류로 항상 실패.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 59–66 — `crypto.randomUUID()`를 `authorize()`와 `signInWithIdToken()` 두 곳에서 각각 독립 호출해 pair가 전혀 매칭되지 않음. Apple 표준은 SHA-256 해시값을 Apple에, 원본을 Supabase에 전달해야 함.
- **제안 수정:** nonce를 한 번만 생성 후 `crypto.subtle.digest('SHA-256', ...)` 해시를 `authorize()`에, 원본 rawNonce를 `signInWithIdToken()`에 전달.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 59 [lane:AUTH]

---

### [H-143] ✅ 해결완료(2026-06-14, SYNC) — `syncGearSetsOnLogin` — 원격 세트 `type` 필드 SELECT 누락 → 세트 타입 항상 undefined
> 수정: 마이그레이션 024_gear_sets_type.sql(type 컬럼 추가) + loadRemoteGearSets select에 type + upsertGearSet payload에 type + account.html newFromRemote 매핑에 `type: r.type||'auto'`. ✅ 라이브 적용완료(2026-06-14, 사용자 대시보드 RUN).

- **영역:** 프론트엔드 — 기어세트 동기화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 로그인 후 동기화된 원격 기어세트의 `type`(auto/backpacking/carcamp)이 undefined가 되어 슬롯·도장판이 항상 DEFAULT_SET_TYPE("auto")로 표시됨.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 385 — `loadRemoteGearSets()`의 `.select()`에 `type` 컬럼 누락. [site/account.html](site/account.html) line 248 — `newFromRemote` 매핑에도 `type` 필드 복사 없음.
- **제안 수정:** select에 `type` 추가: `.select('id, title, type, style, items, completeness, created_at, updated_at')`. 매핑에 `type: r.type || DEFAULT_SET_TYPE` 추가.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 385 [lane:SYNC]

---

### [M-525] ✅ 해결완료(2026-06-13) — `_showAuthGateModal` — `loginHref` 변수 선언 후 미사용 (dead code), 경로 깊이 변경 시 링크 깨짐

- **영역:** 프론트엔드 — Auth Gate Modal
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `loginHref` 변수를 계산하지만 anchor href로 사용하지 않고 방치. 현재는 `/item/` 경로 하드코딩으로 작동하지만 경로 깊이 변경 시 즉시 깨짐.
- **원인:** [site/app.js](site/app.js) line 150–156 — `loginHref` 선언 후 미참조. prefix는 `/item/` 포함 여부로만 판단해 `../../` 붙임.
- **제안 수정:** `loginHref` 제거 후 항상 `/account.html` 절대경로 사용.
- **파일:** [site/app.js](site/app.js) line 150 [lane:CORE]

---

### [M-526] ✅ 해결완료(2026-06-13) — `renderAccount` — 비로그인+로컬세트 있음 조건에서 CTA와 세트 카드 이중 렌더링 → 레이아웃 시프트

- **영역:** 프론트엔드 — 계정 렌더링
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 비로그인 상태에서 로컬 세트가 1개 이상 있으면 첫 `renderAccount()` 호출 시 CTA를 렌더한 직후 세트 카드로 덮어써 CTA가 순간 깜빡임(레이아웃 시프트).
- **원인:** [site/app.js](site/app.js) line 3494 — `!isLoggedIn && !setsEl.dataset.loginShown` 블록에 `sets.length === 0` 조건 없어 세트가 있어도 CTA 렌더 후 즉시 덮어씀.
- **제안 수정:** 조건에 `&& sets.length === 0` 추가.
- **파일:** [site/app.js](site/app.js) line 3494 [lane:ACCOUNT]

- **처리:** renderAccount 세트 empty 메시지에 `&& isLoggedIn` 조건 추가 — 비로그인 시 CTA가 이미 표시되므로 중복 방지. (2026-06-14)

---

### [M-527] ⏸ 보류(멀티탭 wishWriteChain 공유 불가, BroadcastChannel 대응 필요) — 멀티탭 환경에서 `_wishWriteChain` 탭 간 공유 안 됨 → 찜 항목 유실

- **영역:** 프론트엔드 — 위시리스트 동기화
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 두 탭에서 동시에 찜 추가/삭제 시 나중 저장이 먼저 저장을 덮어써 항목이 유실됨.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 160–175 — `_wishWriteChain`·`_wishPending`은 단일 탭 스코프 변수로 멀티탭 간 직렬화가 안 됨. 각 탭이 독립 upsert를 실행해 마지막 탭 상태가 덮어씀.
- **제안 수정:** `BroadcastChannel` 또는 `localStorage` 이벤트로 탭 간 변경 공지, 수신 탭은 최신 상태 pull. 단기적으로 upsert 전 `loadRemoteWishlist()`로 서버 상태 merge 후 저장.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 160 [lane:SYNC]

---

### [M-528] ✅ 해결완료(M-510과 동일지점, DP-1) — `collect_images.py` — `tot=0` 시 진행률 계산 ZeroDivisionError
> 확인: M-510과 동일 라인. `if tot else 0` 가드로 해소됨.

- **영역:** 백엔드 — 파이프라인/이미지 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** verified 제품이 없는 신규 DB에서 실행 시 `round(100*done/tot)`에서 ZeroDivisionError로 크래시.
- **원인:** [pipeline/collect_images.py](pipeline/collect_images.py) line 94 — `tot` 0 가드 없음.
- **제안 수정:** `round(100*done/tot) if tot else 0`으로 변경.
- **파일:** [pipeline/collect_images.py](pipeline/collect_images.py) line 94 [lane:BACKEND]

---

### [M-529] ✅ 해결완료(2026-06-14, MA) — `backend/main.py` — CORS `allow_origins`에 apex `gear-forest.com` 누락 → API 전체 CORS 오류
> 확인: allow_origins에 apex `https://gear-forest.com` 이미 추가됨(M-433, main.py L40).

- **영역:** 백엔드 — CORS 설정
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 실제 서빙 도메인인 `https://gear-forest.com`(apex)에서 `/api/*` 요청 시 CORS 오류로 API 전체 차단. `www`는 301 리다이렉트이므로 apex가 실사용 도메인.
- **원인:** [backend/main.py](backend/main.py) line 39 — `allow_origins`에 `https://www.gear-forest.com`만 있고 `https://gear-forest.com` 누락.
- **제안 수정:** `allow_origins` 리스트에 `"https://gear-forest.com"` 추가.
- **파일:** [backend/main.py](backend/main.py) line 39 [lane:BACKEND]

---

### [M-530] ✅ 해결완료(2026-06-14, MP) — `graph_full.py` — `enrich_node` 쿼리에 `curation_status` 필터 없어 rejected 제품 보강 시도
> 수정: enrich 쿼리에 `AND p.curation_status IN ('pending','verified')`(graph_full.py L113) — rejected 제품 불필요 다나와 호출 차단.

- **영역:** 백엔드 — 파이프라인/그래프
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `rejected`·`pending` 상태 제품에도 상세 페이지 fetch 및 스펙 보강 실행 → 불필요한 네트워크 요청 및 rejected 제품에 유효 스펙 삽입.
- **원인:** [pipeline/graph_full.py](pipeline/graph_full.py) line 111–118 — WHERE 절에 `curation_status` 필터 없음.
- **제안 수정:** `AND p.curation_status IN ('pending','verified')` 조건 추가.
- **파일:** [pipeline/graph_full.py](pipeline/graph_full.py) line 111 [lane:BACKEND]

---

### [L-433] — `app.js` — `supabaseClient.js`를 두 가지 버전 쿼리스트링으로 import → 모듈 인스턴스 분리 위험

- **영역:** 프론트엔드 — 모듈 로딩
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 브라우저가 `?v=d33ddd9b`와 `?v=08466c5f` 두 개를 별개 모듈로 처리해 `authSubscription` 등 내부 상태가 분리될 위험.
- **원인:** [site/app.js](site/app.js) line 111 vs line 2173, 2382, 2490, 2938 — 서로 다른 버전 쿼리스트링 사용.
- **제안 수정:** `stamp_version.py`로 모든 import를 동일 버전으로 통일.
- **파일:** [site/app.js](site/app.js) line 111 [lane:CORE]

---

### [L-434] ✅ 해결완료(2026-06-14, G) — L-329와 동일, SHELL에서 community.html 제외. — `sw.js` — SHELL 프리캐시에 `community.html` 포함 → 비활성 페이지 오프라인 캐시 낭비

- **영역:** 프론트엔드 — 서비스 워커
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `COMMUNITY_ENABLED=false`로 노출되지 않는 `community.html`이 매 배포마다 프리캐시됨.
- **원인:** [site/sw.js](site/sw.js) line 9 — `community.html`이 SHELL 배열에 포함.
- **제안 수정:** SHELL에서 제거하거나 `stamp_version.py`에서 `COMMUNITY_ENABLED` 값을 읽어 조건부 생성.
- **파일:** [site/sw.js](site/sw.js) line 9 [lane:SW]

---

### [L-435] — `enrich_details.py` — `have` 집합에 `valid=1` 필터 없어 무효화된 스펙이 재보강 차단

- **영역:** 백엔드 — 파이프라인/enrich
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `valid=0`(검증 실패) 스펙이 있는 제품의 해당 메트릭을 유효 소스에서 다시 채울 수 없게 됨.
- **원인:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 26–27 — `WHERE psv.product_id=?`에 `AND psv.valid=1` 없음.
- **제안 수정:** `WHERE psv.product_id=? AND psv.valid=1`로 수정.
- **파일:** [pipeline/enrich_details.py](pipeline/enrich_details.py) line 27 [lane:BACKEND]

---

### [L-436] — `multicat.py` — `seen_names`가 카테고리 전역 공유 → 다른 카테고리 동명 모델 오차단

- **영역:** 백엔드 — 파이프라인/multicat
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** "랜턴/Pro 500" 등록 후 "버너/Pro 500"이 dup_name으로 스킵됨. 카테고리가 다르면 동명 모델은 별개 제품.
- **원인:** [pipeline/multicat.py](pipeline/multicat.py) line 158 — `seen_names` 체크가 카테고리 스코프 없이 전역 모델명으로 비교.
- **제안 수정:** `seen_names`를 `(cid, model)` 튜플로 관리하거나 카테고리별 별도 set으로 분리.
- **파일:** [pipeline/multicat.py](pipeline/multicat.py) line 158 [lane:BACKEND]

---

### [L-437] — `backend/store.py` — `load()` 예외 처리 없어 JSON 누락/손상 시 FastAPI 기동 크래시

- **영역:** 백엔드 — store
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `site/data` 미생성 상태에서 서버 기동 시 `FileNotFoundError` / `json.JSONDecodeError`가 lifespan으로 전파되어 FastAPI 기동 실패.
- **원인:** [backend/store.py](backend/store.py) line 13–30 — `open()` 호출에 try/except 없음.
- **제안 수정:** `load()` 전체를 try/except로 감싸고 파일 미존재 시 빈 상태로 기동 + 경고 로그 출력.
- **파일:** [backend/store.py](backend/store.py) line 13 [lane:BACKEND]

---

### [L-438] — `value_metric.py` — 루프 내부에서 반복 `from collections import Counter` (dead import 위치)

- **영역:** 백엔드 — 파이프라인/value_metric
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 카테고리 반복 루프 안에서 매 이터레이션마다 `from collections import Counter` 실행. 스타일/린트 위반, 향후 외부 의존 전환 시 실제 오버헤드.
- **원인:** [pipeline/value_metric.py](pipeline/value_metric.py) line 270 — 루프 내부 import.
- **제안 수정:** 파일 상단 `from collections import defaultdict, Counter`로 통합.
- **파일:** [pipeline/value_metric.py](pipeline/value_metric.py) line 270 [lane:BACKEND]

---

### [H-144] ✅ 해결완료(2026-06-14, 보안) — `publish.py` — `git add -A`로 워크트리 전체 스테이징 → scope 외 파일 커밋 위험 (TOCTOU)
> 수정: `git add -A` → `git add -A -- <state.changed_files paths>`로 한정(publish.py L55~). 검증된 scope 파일(추가/수정/삭제)만 스테이징, `.env`·임시파일 제외. 임시 git repo로 스코프 격리 검증.

- **영역:** 백엔드 — dev-harness/devagent
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** `changed_files`로 scope 게이트를 통과한 후 `add -A`로 워크트리 전체를 스테이징하면 `.env`, 임시 파일 등 scope 외 파일이 커밋에 포함될 수 있음.
- **원인:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 56 — `_git(["add", "-A"], cwd=wt)` — `changed_files`에 선언된 경로만 스테이징해야 함.
- **제안 수정:** `git add -A` → `git add -- <changed_files 경로 목록>`으로 교체. 삭제 파일은 `git rm` 별도 처리.
- **파일:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 56 [lane:BACKEND]

---

### [M-531] ✅ 해결완료(기해결 M-365/M-421 확인, DP-8) — `babysit.py` — `near[:10]` 출력 루프가 `if near:` 조건 없이 항상 실행
> 확인: `if near:` 가드 + 별도 헤더 블록으로 분리됨(M-365/M-421, babysit.py L131). 항목 있을 때만 출력.

- **영역:** 백엔드 — 파이프라인/watchdog
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `near`가 비어 있어도 `for name, pc in near[:10]:` 루프가 실행되어 불필요한 pass 반복. `near` 항목이 `todos` 조건과 독립적으로 출력될 수 있음.
- **원인:** [pipeline/babysit.py](pipeline/babysit.py) line 113 — `for name, pc in near[:10]:` 블록이 `if near:` 조건 없이 최상위 루프에 위치.
- **제안 수정:** `for name, pc in near[:10]:` 블록을 `if near:` 조건 안으로 이동.
- **파일:** [pipeline/babysit.py](pipeline/babysit.py) line 113 [lane:BACKEND]

---

### [M-532] ✅ 해결완료(2026-06-14, DP-8) — `brand_filter.py` — `name_ko=NULL` 브랜드 처리 시 `None + str` TypeError
> 수정: 제외 브랜드 예시 출력을 `n+'('+str(c)+')'` → f-string `{n or '?'}({c})`로 변경(brand_filter.py L88~). NULL 브랜드도 '?'로 안전 표기. 단위테스트 통과.

- **영역:** 백엔드 — 파이프라인/brand_filter
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB에 `name_ko=NULL`인 브랜드가 있으면 `n+'('+str(c)+')'` 에서 `TypeError: can only concatenate str (not "NoneType") to str` 발생.
- **원인:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 80–81 — `n`이 `None`인 경우 방어 처리 없음.
- **제안 수정:** `n = n or ""` 방어 추가 또는 SQL에 `WHERE b.name_ko IS NOT NULL` 조건 추가.
- **파일:** [pipeline/brand_filter.py](pipeline/brand_filter.py) line 80 [lane:BACKEND]

---

### [M-533] ✅ 해결완료(M-513과 동일, DP-3) — `seed_coupang.py` — CSV `rep_product_id` 비숫자 행에서 `int()` ValueError 비처리
> 확인: M-513과 동일 버그. M-393 가드로 해소됨.

- **영역:** 백엔드 — 파이프라인/seed_coupang
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 수동 편집 CSV에 공백 행·주석 행이 혼입되면 `int(r["rep_product_id"])` 에서 `ValueError`로 크래시.
- **원인:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 86 — `int()` 변환에 try/except 없음.
- **제안 수정:** `rid_str = (r.get("rep_product_id") or "").strip(); if not rid_str.isdigit(): continue` 방어 추가.
- **파일:** [pipeline/seed_coupang.py](pipeline/seed_coupang.py) line 86 [lane:BACKEND]

---

### [L-439] — `crosssource.py` — `upsert()` INSERT 성공 경로에 `return True` 누락 → `None` 반환 후 `n += None` TypeError

- **영역:** 백엔드 — 파이프라인/crosssource
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** INSERT 성공 후 함수 말단에 `return True`가 없어 암묵적으로 `None` 반환. `n += upsert(...)` 에서 `TypeError: unsupported operand type(s) for +=: 'int' and 'NoneType'` 크래시.
- **원인:** [pipeline/crosssource.py](pipeline/crosssource.py) line 159–164 — INSERT 이후 명시적 `return True` 누락.
- **제안 수정:** INSERT 블록 마지막에 `return True` 추가.
- **파일:** [pipeline/crosssource.py](pipeline/crosssource.py) line 163 [lane:BACKEND]

---

### [L-440] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — openSetDetail에 modal._onKey=null 설정 경로 없음(3157 remove-only), close 후 재오픈도 remove 무해. 오탐. — `openSetDetail` — `modal._onKey = null` 상태에서 `classList.add("on")` 실행 → 빠른 ESC 시 이전 리스너 제거 실패

- **영역:** 프론트엔드 — 세트 상세 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 세트 상세 모달을 빠르게 열고 ESC를 누르면 `removeEventListener(null)` 호출로 이전 keydown 핸들러가 제거되지 않아 누적될 수 있음.
- **원인:** [site/app.js](site/app.js) line 3110–3118 — `removeEventListener(modal._onKey)` 직후 `modal._onKey`를 새 함수로 교체하기 전에 `classList.add("on")`이 실행되는 순서 문제.
- **제안 수정:** `modal.classList.add("on")`을 `modal._onKey = onKey; addEventListener(...)` 이후로 이동.
- **파일:** [site/app.js](site/app.js) line 3110 [lane:CORE]

---

### [L-441] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — syncFilterUI가 qx 체크박스 복원(2052) + renderActiveFilters가 '스펙값 있는 것만' 칩 표시(2000). 오탐. — `syncFilterUI` — `STATE.qExclude` UI 복원 누락 → 공유 링크로 들어온 사용자에게 필터 적용 이유 미표시

- **영역:** 프론트엔드 — 필터 상태 복원
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** URL `?qx=1`로 접속 시 `STATE.qExclude=true`가 복원되어 필터 로직은 작동하지만, qExclude 토글 버튼의 `.on` 클래스·`aria-pressed` 상태가 복원되지 않아 사용자가 모델이 숨겨진 이유를 알 수 없음.
- **원인:** [site/app.js](site/app.js) `syncFilterUI` 함수 — `STATE.qExclude`에 대응하는 버튼 동기화 코드 누락.
- **제안 수정:** `syncFilterUI` 내 qExclude 버튼에 `STATE.qExclude`에 따른 `.on` 클래스 및 `aria-pressed` 업데이트 추가.
- **파일:** [site/app.js](site/app.js) `syncFilterUI` 함수 [lane:CORE]

---

### [M-534] ✅ 해결완료(기해결 M-275/L-241 확인, DP-7) — `harvest_tents.py` — `seen_names` 모델명만으로 dedup → 다른 브랜드 동명 모델 누락
> 확인: ingest의 dedup 키가 `(cid, brand, model)` 튜플로 이미 교정됨(M-275/L-241, harvest_tents.py L121). 다른 브랜드/카테고리 동명 모델 오차단 없음. refresh/multicat과 키 형태 일치.

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 브랜드 A의 "프로 2" 등록 후 브랜드 B의 "프로 2"가 `dup_name`으로 스킵되어 누락됨.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 118 — `if model in seen_names` 체크가 brand 구분 없이 모델명만 비교.
- **제안 수정:** `seen_names`를 `(brand, model)` 튜플 또는 `f"{brand}::{model}"` 형태로 변경.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 118 [lane:BACKEND]

---

### [M-535] ✅ 해결완료(검증·무결함 확인, DP-7) — `harvest_tents.py` `parse_results()` — `range(1, len(parts)-1, 2)` 오프-바이-원 → 마지막 상품 블록 누락
> 검증: `re.split`이 캡처그룹 1개라 parts 길이는 항상 1+2N(홀수). `range(1,len-1,2)`는 i=len-2까지 도달해 마지막 (pcode,block) 쌍을 모두 처리하며(제품 1·2·3·5개 테스트로 누락 0 확인), `-1`은 오히려 i+1 인덱스 유효를 보장하는 방어적 상한이다. off-by-one 미발생 → 오탐. 향후 오인 방지 주석 추가.

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** trailing 텍스트 없이 pcode-block이 짝수 개일 때 마지막 상품이 파싱되지 않음.
- **원인:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 52 — `range(1, len(parts) - 1, 2)` — trailing html 없는 경우 마지막 블록 순회 누락.
- **제안 수정:** `for i in range(1, len(parts), 2): if i+1 >= len(parts): break` 패턴으로 교체.
- **파일:** [pipeline/harvest_tents.py](pipeline/harvest_tents.py) line 52 [lane:BACKEND]

---

### [M-536] ✅ 해결완료(2026-06-14, DP-8) — `affiliate_links.py` `sample()` — `GROUP BY b.name_ko` 비집계 컬럼 임의 선택 → 스펙 혼용
> 수정: `GROUP BY b.name_ko`(비결정·이식 시 혼용 위험)를 `ROW_NUMBER() OVER (PARTITION BY b.name_ko ORDER BY p.id)` rn=1로 교체(affiliate_links.py L63~). 브랜드당 가장 낮은 p.id 1행으로 model/cat/cap을 결정화. 단위테스트 통과.

- **영역:** 백엔드 — 파이프라인/제휴링크
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** SQLite non-deterministic GROUP BY로 `canonical_model`, `cap` 등이 해당 브랜드의 다른 제품 행에서 혼용될 수 있음.
- **원인:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 63–70 — `GROUP BY b.name_ko`만 있고 비집계 컬럼에 집계 함수 없음.
- **제안 수정:** `GROUP BY` 제거 후 `ORDER BY b.name_ko, RANDOM()`으로 변경하거나 서브쿼리로 ROW_NUMBER() 필터 적용.
- **파일:** [pipeline/affiliate_links.py](pipeline/affiliate_links.py) line 63 [lane:BACKEND]

---

### [M-537] ✅ 해결완료(2026-06-14, MD) — `devagent/nodes/apply.py` — `base_ref=""` 시 `HEAD` 폴백으로 cross-round 변화 추적 불가
> 확인: intake.py L25 `base_ref = state.get('base_ref') or _head(REPO_ROOT)`로 HEAD SHA를 이미 명시 기록 → apply의 `or 'HEAD'`는 belt-and-suspenders. 기해결.

- **영역:** 백엔드 — dev-harness
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `base_ref`가 빈 문자열로 전달되면 매번 HEAD 기준 diff만 반환되어 라운드 간 누적 변화 추적 불가.
- **원인:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 83 — `base_ref or "HEAD"` 폴백 — intake에서 base_ref를 현재 HEAD SHA로 명시 기록하지 않음.
- **제안 수정:** `intake.py`에서 `base_ref = git rev-parse HEAD` 결과를 state에 명시적으로 기록.
- **파일:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 83 [lane:BACKEND]

---

### [M-538] ✅ 분석완료(moot: close() 클로저가 onKey 정확히 캡처, ov._onKey 참조 불일치 없음) — `openReviewDetail` — `close()` 내 `ov._onKey` 참조 불일치 → keydown 리스너 누수

- **영역:** 프론트엔드 — 상품 상세 모달 / 리뷰
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 리뷰 상세 모달을 재오픈 시 이전 keydown 핸들러가 남아 중복 실행될 수 있음.
- **원인:** [site/app.js](site/app.js) line 2334–2377 — `close()`와 `ov._onKey` 할당 순서가 뒤바뀌어 참조 일관성이 없음. `close()` 내에서 지역 `onKey` 변수 대신 `ov._onKey`로 일관 참조해야 함.
- **제안 수정:** `close()` 내 `document.removeEventListener("keydown", onKey, true)` → `document.removeEventListener("keydown", ov._onKey, true)` 로 교체.
- **파일:** [site/app.js](site/app.js) line 2334 [lane:CORE]

---

### [M-539] ✅ 해결완료(2026-06-13) — `공유 세트 임포트` — `requireLogin` 게이트 없고 중복 확인에 `alert()` 사용 → iOS Safari 차단

- **영역:** 프론트엔드 — account.html 공유세트
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 비로그인 사용자가 "내 세트에 추가" 클릭 시 로그인 검증 없이 localStorage에 저장. 중복 확인 `alert()` 가 iOS Safari에서 history.replaceState 후 차단됨.
- **원인:** [site/app.js](site/app.js) line 4311–4317 — `requireLogin` 게이트 없음 + `alert()` 사용.
- **제안 수정:** 임포트 전 `await requireLogin(...)` 게이트 추가. `alert()` → `showToast()`로 교체.
- **파일:** [site/app.js](site/app.js) line 4311 [lane:CORE]

- **처리:** 공유 세트 임포트 중복 확인 `alert()` → `showToast()` 교체 (iOS Safari PWA 차단 방지). (2026-06-14)

---

### [M-540] ✅ 해결완료(2026-06-13) — `stars()` — 음수 별점 하한 미적용 → `aria-label="별점 -1 / 5"` 출력 + 빈 별 5개 렌더링

- **영역:** 프론트엔드 — 공통 유틸 / 접근성
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB에서 rating이 음수로 들어오면 `aria-label="별점 -1 / 5"` 출력 및 별 5개가 모두 빈 별로 렌더링됨. 시각 버그 + 스크린리더 오독.
- **원인:** [site/app.js](site/app.js) line 362 — `Math.min(5, n)` 상한만 적용, `Math.max(0, n)` 하한 없음.
- **제안 수정:** `n = Math.min(5, Math.max(0, n));` 으로 변경.
- **파일:** [site/app.js](site/app.js) line 362 [lane:CORE]

- **처리:** `stars()`에 `Math.max(0, ...)` 하한 적용 — 음수 별점 시 빈 별 5개·잘못된 aria-label 방지. (2026-06-14)

---

### [L-442] — `devagent/graph.py` `route_after_contract()` — `needs_human` 항목 미완료 시 publish 블록 여부 불명확

- **영역:** 백엔드 — dev-harness
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `needs_human` 항목이 있고 `needs_llm=0`이면 evaluator 없이 바로 `human_review`로 진입. `pending_human_approvals` 미비 시 publish 블록 여부가 불명확.
- **원인:** [dev-harness/devagent/graph.py](dev-harness/devagent/graph.py) line 22–32 — `route_after_contract`에서 `needs_human` 미처리 확인 없음.
- **제안 수정:** `pending_human_approvals`가 비어있지 않으면 무조건 `human_review` 라우팅 전 명시 체크 또는 의도 주석 추가.
- **파일:** [dev-harness/devagent/graph.py](dev-harness/devagent/graph.py) line 22 [lane:BACKEND]

---

### [L-443] — `devagent/nodes/_util.py` `run_tool()` — timeout `-2` 반환을 게이트에서 실패와 구분 불가

- **영역:** 백엔드 — dev-harness
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** timeout 시 `(-2, "timeout after Ns")` 반환하지만 게이트(`gate_tests`, `gate_lint`)는 `code != 0`으로 일반 실패와 동일 처리. timeout인지 실패인지 구분 불가하고 evaluator LLM이 오인 가능.
- **원인:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 33 — timeout 반환값 처리 없음.
- **제안 수정:** `code == -2` 조건으로 게이트에서 `"timeout"` status 별도 반환.
- **파일:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 33 [lane:BACKEND]

---

### [L-444] ✅ 검토완료·현행유지(2026-06-14, M·코드 실대조) — danawa_search는 자동 기본값이라 의도적 재분류 대상, 비-allowlist 수동값은 보존(38). 오탐. — `column_fixes.py` — `channel` 업데이트 시 기존 유효값(`danawa_search` 등) 무차별 overwrite

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `UPDATE price_observations SET channel='국내'`가 `channel`이 이미 `'danawa_search'`, `'쿠팡'` 등으로 설정된 행도 덮어써 채널 정보 소실.
- **원인:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36 — WHERE 절에 `channel IS NULL` 조건 없음.
- **제안 수정:** `WHERE ... AND (channel IS NULL OR channel NOT IN ('국내', '직구'))` 조건 추가.
- **파일:** [pipeline/column_fixes.py](pipeline/column_fixes.py) line 36 [lane:BACKEND]

---

### [L-445] — `_reviewCard` — `r.body=null`이고 이미지도 없을 때 `esc(null)` 호출 → `"null"` 문자 표시

- **영역:** 프론트엔드 — 상품 상세 모달 / 후기
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** body 없고 이미지도 없는 후기 레코드에서 `esc(null)` 호출 시 `"null"` 문자열이 화면에 그대로 표시됨.
- **원인:** [site/app.js](site/app.js) line 2312 — `esc(r.body)` null 가드 없음.
- **제안 수정:** `esc(r.body || "")` 으로 변경.
- **파일:** [site/app.js](site/app.js) line 2312 [lane:CORE]

---

### [L-446] ✅ 검토완료·현행유지(2026-06-14, D·코드 실대조) — openSetModal close()는 removeEventListener(modal._onKey) 후 null 설정(615), 순서 정확. 오탐. — `openSetModal` `close()` — `removeEventListener` 전에 `modal._onKey = null` 설정 → 핸들러 해제 실패 가능

- **영역:** 프론트엔드 — 장비 꾸러미 모달
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `close()` 내에서 `modal._onKey = null` 설정 후 `null`로 `removeEventListener` 호출 시 실제 핸들러가 해제되지 않는 패턴 위험.
- **원인:** [site/app.js](site/app.js) line 609–610 — `close()` 내 `modal._onKey` null 초기화와 `removeEventListener` 호출 순서 문제.
- **제안 수정:** `const h = modal._onKey; modal._onKey = null; if (h) document.removeEventListener("keydown", h);` 패턴으로 교체.
- **파일:** [site/app.js](site/app.js) line 609 [lane:CORE]

---

### [L-447] — `openProduct` — `data-url="${esc(coupang_url)}"` innerHTML 이중 인코딩 → `click_events` 저장 URL 불일치 가능

- **영역:** 프론트엔드 — 상품 상세 모달 / 구매 버튼
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `esc()`로 인코딩된 URL이 `data-url` 속성에 저장되고 `dataset.url`로 읽을 때 브라우저가 디코드하나, 패턴 불일치로 향후 `click_events` insert 시 원본/esc 처리 URL 혼용 가능성.
- **원인:** [site/app.js](site/app.js) line 2152 — `data-url="${esc(m.coupang_url)}"` innerHTML 내 속성에 esc 적용.
- **제안 수정:** innerHTML 외부에서 `buyBtn.dataset.url = m.coupang_url` 로 raw URL 직접 설정.
- **파일:** [site/app.js](site/app.js) line 2152 [lane:CORE]

---

### [L-448] ✅ 해결완료(2026-06-14, F) — app.js:3406 로그삭제 에러 alert()→showToast()(iOS Safari PWA 차단 방지, M-452/539 일관). — `account.html` 캠핑 로그 삭제 오류 — `alert()` 사용으로 iOS Safari history 조작 후 차단

- **영역:** 프론트엔드 — account.html / 캠핑 로그
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 캠핑 로그 삭제 오류 시 `alert("삭제 중 오류가 발생했어요.")` 사용. iOS Safari에서 history.replaceState 후 alert() 차단(M-452와 동일 근본 원인).
- **원인:** [site/app.js](site/app.js) line 3349 — 일관성 없는 `alert()` 사용.
- **제안 수정:** `alert(...)` → `showToast(...)` 로 교체.
- **파일:** [site/app.js](site/app.js) line 3349 [lane:CORE]

---

### [M-541] ✅ 해결완료(2026-06-14, DP-7) — `danawa.py` `_meta_description` — 속성 순서 고정 정규식으로 Description 추출 실패
> 수정: `name 바로 뒤 content` 고정 정규식 → 메타태그를 먼저 매칭하고 그 안에서 content를 순서 무관 추출(danawa.py L141~). 속성순서(content 먼저)·중간 속성·작은/큰따옴표·대소문자 4케이스 단위테스트 통과.

- **영역:** 백엔드 — 데이터 수집 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** HTML에서 `content` 속성이 `name` 앞에 오거나 사이에 다른 속성이 끼면 Description 추출 실패.
- **원인:** [pipeline/danawa.py](pipeline/danawa.py) line 142 — `r'<meta\s+name="Description"\s+content="(.*?)"'` 속성 순서 고정 패턴.
- **제안 수정:** `re.search(r'<meta\b[^>]*\bname="Description"[^>]*\bcontent="(.*?)"', html, re.I | re.S)` 또는 html.parser 사용.
- **파일:** [pipeline/danawa.py](pipeline/danawa.py) line 142 [lane:BACKEND]

---

### [M-542] ✅ 해결완료(기처리 L-196 확인, DP-8) — `reclassify_other_tent.py` `bucket()` — `weight=None` 시 무조건 "auto" 분류 → 백패킹 텐트 오분류
> 확인: L-196이 weight=None을 `auto 분류 + 경고 출력`으로 처리 중(reclassify_other_tent.py L38~41). 무게 없으면 백패킹/오토 판정이 물리적으로 불가하므로 경고로 사후 감지 유도하는 의도된 결정. 이름기반 추정 추가는 오탐 위험으로 보류.

- **영역:** 백엔드 — 데이터 분류 파이프라인
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 무게 정보 미입력 백패킹 텐트가 오토캠핑 카테고리로 분류되어 검색/별점 왜곡.
- **원인:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 38–39 — `if w is None: return "auto"` — `cap`(적정인원) 기반 보조 판별 없음.
- **제안 수정:** `w is None`이면 `cap` 기준 보조 판별 추가 (1~2인 → "back" 후보) 또는 별도 감사 카테고리 분리.
- **파일:** [pipeline/reclassify_other_tent.py](pipeline/reclassify_other_tent.py) line 38 [lane:BACKEND]

---

### [M-543] ✅ 해결완료(2026-06-13) — `openReplaceModal` — 교체 성공 후 `close()`만 호출, `openSetDetail()` 미재호출 → 세트 상세 UI stale

- **영역:** 프론트엔드 — 세트 슬롯 교체 모달
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 세트 상세 모달에서 장비 교체 후 세트 테이블 내용(미니 도장판, 항목 수)이 갱신되지 않아 stale 상태로 남음.
- **원인:** [site/app.js](site/app.js) line 695–698 — 교체 성공 시 `close()` 후 `renderAccount()`만 호출, `openSetDetail(setId)` 재호출 없음.
- **제안 수정:** 교체 성공 핸들러에서 `renderAccount(); openSetDetail(setId);` 순서로 호출.
- **파일:** [site/app.js](site/app.js) line 695 [lane:CORE]

- **처리:** openReplaceModal 교체 성공 후 `openSetDetail(setId)` 재호출 추가 — 세트 상세 UI stale 해소. (2026-06-14)

---

### [M-544] ✅ 해결완료(2026-06-14) — 후기 신고 사유 입력에 `prompt()` 사용 → iOS Safari PWA에서 차단

- **영역:** 프론트엔드 — 상품 상세 모달 / 후기 신고
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 후기 신고 사유 입력에 native `prompt()`를 사용. iOS Safari PWA/fullscreen 모드 또는 `history.replaceState` 직후 `prompt()` 차단으로 신고 불가. UI 디자인 일관성도 없음.
- **원인:** [site/app.js](site/app.js) line 2351 — `const reason = prompt("신고 사유를 적어주세요 (5자 이상)");`
- **제안 수정:** 커스텀 인라인 textarea 신고 사유 모달로 교체.
- **파일:** [site/app.js](site/app.js) line 2351 [lane:CORE]

- **처리:** 후기 신고 사유 입력 `prompt()` → 인라인 폼(input+신고/취소 버튼) 교체 — iOS Safari PWA 차단 방지. (2026-06-14)

---

### [L-449] — `ledger.py` `_acquire_lock()` — 만료 락 삭제와 재생성 사이 TOCTOU 레이스 컨디션

- **영역:** 백엔드 — devagent 원장
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 만료 락 `os.unlink()` 직전에 다른 프로세스가 먼저 unlink+create를 완료한 경우 유효한 락을 삭제하는 미세한 레이스 윈도우 존재.
- **원인:** [dev-harness/devagent/ledger.py](dev-harness/devagent/ledger.py) line 31–36 — `age > LOCK_TTL` 체크 → `os.unlink()` 사이 원자성 없음.
- **제안 수정:** unlink 후 `FileNotFoundError` 포착하거나 rename 기반 원자적 교체 사용.
- **파일:** [dev-harness/devagent/ledger.py](dev-harness/devagent/ledger.py) line 33 [lane:BACKEND]

---

### [L-450] — `progress.py` `append_progress()` — 첫 번째 `find("\n\n")`가 -1이면 두 번째 find가 0부터 탐색 → 헤더 경계 오계산

- **영역:** 백엔드 — devagent 진행상황 기록
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 첫 번째 `find("\n\n")`가 -1 반환 시 두 번째 find는 `find("\n\n", 0)`이 되어 헤더-본문 경계를 잘못 계산, 기존 헤더 일부가 body에 포함되어 중복 삽입.
- **원인:** [dev-harness/devagent/progress.py](dev-harness/devagent/progress.py) line 85 — `existing.find("\n\n", existing.find("\n\n") + 1)` — 첫 번째 find 결과 -1 미체크.
- **제안 수정:** 첫 번째 find 결과를 변수로 캐싱하고 -1 체크 후 조건부로 두 번째 find 수행.
- **파일:** [dev-harness/devagent/progress.py](dev-harness/devagent/progress.py) line 84 [lane:BACKEND]

---

### [L-451] ✅ 검토완료·현행유지(2026-06-14, K·검증) — 큰따옴표 패턴 추가 시도→기존 코드 42건 오탐(큰따옴표는 Python 기본 구분자). SQL 리터럴은 작은따옴표 사용이라 현행 설계 정답. errors=replace는 함께 적용. — `scan_sql_injection.py` — 큰따옴표 SQL 보간 미탐지 → SQL 인젝션 게이트 우회 가능

- **영역:** 백엔드 — 배포 게이트 / 보안
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `QUOTED_BRACE` 패턴이 작은따옴표 안의 보간만 탐지. `f"SELECT * FROM t WHERE col = \"{var}\""` 형태의 큰따옴표 보간은 동일한 SQL 인젝션 취약점임에도 게이트를 통과.
- **원인:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 22 — `QUOTED_BRACE = re.compile(r"'[^']*\{[^}]*\}[^']*'")` 작은따옴표만 커버.
- **제안 수정:** 큰따옴표 패턴 별도 추가: `re.compile(r'"[^"]*\{[^}]*\}[^"]*"')`.
- **파일:** [pipeline/scan_sql_injection.py](pipeline/scan_sql_injection.py) line 22 [lane:BACKEND]

---

### [L-452] — `backfill_capacity.py` — `total=0` 시 `have*100//total` ZeroDivisionError

- **영역:** 백엔드 — 데이터 파이프라인
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 빈 DB 또는 새 DB 초기화 후 실행 시 ZeroDivisionError 크래시.
- **원인:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 78 — `have*100//total` — `total=0` 가드 없음.
- **제안 수정:** `f"{have*100//total if total else 0}%"` 로 변경.
- **파일:** [pipeline/backfill_capacity.py](pipeline/backfill_capacity.py) line 78 [lane:BACKEND]

---

### [L-453] ✅ 검토완료·현행유지(2026-06-14, G·코드 실대조) — L-392와 동일, 504 폴백을 getJSON ok체크가 정상 처리. — `sw.js` — stale-while-revalidate fetch 실패 시 `null` 반환 → 오프라인 504 빈 응답

- **영역:** 프론트엔드 — 서비스 워커 캐싱
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 오프라인 상태에서 캐시에 없는 자산/데이터 URL 접근 시 빈 504 응답 반환. 사용자에게 오프라인 메시지 없음.
- **원인:** [site/sw.js](site/sw.js) line 79–84 — 자산 fetch catch가 `null` 반환, 최종 fallback이 빈 504.
- **제안 수정:** 오프라인 fallback 페이지를 SHELL에 캐시하고, 네트워크 실패+캐시 miss 시 fallback 반환.
- **파일:** [site/sw.js](site/sw.js) line 79 [lane:SW]

---

### [L-454] — `showSetConfirm` — `weight_g` 비숫자 문자열 시 NaN 전파 → `"NaNg"` 표시

- **영역:** 프론트엔드 — 세트 확인 카드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `weight_g`가 비숫자 문자열이면 `x.weight_g * (x.qty || 1)` 에서 NaN이 되어 합산 무게가 `"NaNg"`로 표시됨.
- **원인:** [site/app.js](site/app.js) line 709, 3031 — `weight_g` 타입 검증 없이 곱셈.
- **제안 수정:** `const wg = Number(x.weight_g); wg > 0 ? sum + wg * (x.qty || 1) : sum` 으로 `Number()` 래핑 추가.
- **파일:** [site/app.js](site/app.js) line 709 [lane:CORE]

---

### [L-455] ✅ 해결완료(2026-06-14, D) — _showAuthGateModal onKey에 _trapTab 적용(라이브 검증: Tab/Shift+Tab 순환·ESC). — `_showAuthGateModal` — Tab 키 focus trap 미구현 → 모달 열린 상태에서 포커스 배경 요소로 이탈

- **영역:** 프론트엔드 — 인증 게이트 모달 / 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 인증 게이트 모달 열린 상태에서 Tab 키 반복 시 포커스가 배경 페이지 요소로 빠져나감. `openSetModal`에는 Tab trap이 구현돼 있으나 authGate 모달 누락.
- **원인:** [site/app.js](site/app.js) line 163 — `onKey`에서 Escape만 처리, Tab trap 없음.
- **제안 수정:** `openSetModal`의 Tab trap 패턴(line 611–620)을 authGate onKey 핸들러에도 동일 적용.
- **파일:** [site/app.js](site/app.js) line 163 [lane:CORE]

---

### [M-545] ✅ 해결완료(M-475와 동일 수정, DP-6) — `ocr_specs.py` — `--verify`/`--fill` 미지정 시 `mode="verify"` 기본 동작, `--verify` 플래그는 dead code
> 확인: M-475 수정으로 동시 해소 — 이제 `--verify` 없이(그리고 --fill도 없이) 실행하면 에러이므로 `--verify`가 의미를 가진다(dead code 해소).

- **영역:** 백엔드 — 파이프라인/OCR
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `--verify`를 주거나 주지 않거나 동일하게 verify 모드 실행. 사용자가 fill 의도로 플래그 없이 실행해도 verify만 동작.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 251 — `mode = "fill" if args.fill else "verify"` — `args.verify`를 분기에 반영하지 않음. `--verify` 플래그는 argparse에만 존재하고 실제 분기 없음.
- **제안 수정:** `add_mutually_exclusive_group` 사용하거나 양쪽 다 미지정 시 에러 출력. `--verify`가 dead 파라미터임을 docstring에 명시.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 248 [lane:BACKEND]

---

### [M-546] ✅ 해결완료(2026-06-14, DP-6) — `ocr_specs.py` `detail_images()` — PIL 미설치 시 `Image is None` 체크가 루프 안에 있어 불필요한 전체 이미지 다운로드
> 수정: `detail_images()` 초반 `if Image is None: return []` 조기반환 추가(ocr_specs.py L51~). PIL 없으면 페이지 fetch·이미지 다운로드 자체를 안 함. 루프 내 중복 체크 제거.

- **영역:** 백엔드 — 파이프라인/OCR
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** PIL 미설치 환경에서 모든 이미지 URL을 HTTP 다운로드 후 전부 skip하여 불필요한 네트워크 비용 발생.
- **원인:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 51, 69 — `Image is None` 체크가 데이터 다운로드 루프 안에 위치.
- **제안 수정:** `detail_images()` 함수 첫 줄에 `if Image is None: return []` 조기 반환 추가.
- **파일:** [pipeline/ocr_specs.py](pipeline/ocr_specs.py) line 51 [lane:BACKEND]

---

### [M-547] ✅ 해결완료(M-501과 동일, DP-4) — `normalize_models.py` `flag_price_outliers` — C 패스 중앙값이 B 패스와 다른 계산식 사용 → 동일 데이터에 격리 결과 불일치
> 확인: M-501과 동일 영역. B/C 패스 모두 statistics.median 사용으로 일관(M-359/M-400).

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** B 패스는 `statistics.median()`, C 패스(라인 161)는 `prices[(len(prices)-1)//2]` 하위 중앙값 사용. 짝수 개 가격에서 두 시스템이 다른 기준점으로 격리 결과가 달라짐.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 161 — `med = prices[(len(prices) - 1) // 2]`.
- **제안 수정:** `med = statistics.median(prices)` 로 B 패스와 동일하게 통일.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) line 161 [lane:BACKEND]

---

### [M-548] ✅ 해결완료(검증·무해 확인, DP-4) — `add_manual_models.py` — `canonical_models` DELETE+INSERT 후 `normalize_db()` 실행 시 수동 값 덮어씌워짐
> 검증: normalize_db가 canonical_models를 재롤업해도 수동 데이터 무손실 — ①가격은 price_observations(channel='수동',valid=1)에서 국내 폴백으로 복원(in-memory 재생성 SQL로 890k~950k 보존 확인), ②스펙은 source_id=4로 정규화/검증 패스 보호, ③solo 수동모델은 그룹<2라 이상치 격리 비대상. add_manual의 canonical write는 단독실행용 사전시드로, 두 경로가 동일 결과 수렴. 상호작용 설명 주석 추가(동작 무변경).

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `add_manual_models.py`가 canonical_models를 직접 수정해도 이후 `normalize_db()` 실행 시 `DROP TABLE` → 재생성으로 수동 데이터 소실 가능.
- **원인:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 77–82 vs [pipeline/normalize_models.py](pipeline/normalize_models.py) line 228–256 — 두 경로가 canonical_models를 각자 관리, 실행 순서에 따라 결과 달라짐.
- **제안 수정:** 수동 canonical을 별도 플래그(`manual=1`)로 보호하거나 `add_manual_models` 실행 순서를 `run_all.py`에 명문화.
- **파일:** [pipeline/add_manual_models.py](pipeline/add_manual_models.py) line 77 [lane:BACKEND]

---

### [M-549] ✅ 해결완료(2026-06-13) — `account.html` — `decodeURIComponent(errDetail)` 예외 미처리 → URI malformed 시 페이지 로딩 중단

- **영역:** 프론트엔드 — 계정/인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `?err=` 파라미터가 잘못 인코딩된 경우 `URIError: URI malformed`로 스크립트 중단 → `initAuth` 미실행 → 페이지 로딩 중 상태로 멈춤.
- **원인:** [site/account.html](site/account.html) line 593 — `try/catch` 없이 `decodeURIComponent(errDetail)` 직접 호출.
- **제안 수정:** `try { decodeURIComponent(errDetail) } catch(_) { errDetail }` 래핑 또는 `new URL(location.href).searchParams.get('err')` 사용.
- **파일:** [site/account.html](site/account.html) line 593 [lane:CORE]

- **처리:** account.html `decodeURIComponent(errDetail)`를 try/catch로 감싸 malformed URI 시 페이지 로딩 중단 방지. (2026-06-14)

---

### [M-550] ✅ 분석완료(moot: esc() 적용됨) — `diagnoseEmpty` — `STATE.brands` 값이 `esc()` 없이 label 문자열에 삽입 → XSS 잠재 경로

- **영역:** 프론트엔드 — 필터/URL 직렬화 (보안)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** URL `?brands=<img src=x onerror=alert(1)>` 형태로 접근 시 `STATE.brands` 값이 `esc()` 없이 brands label로 구성. 최종 출력이 `esc(sug[0][0])`를 거치긴 하나 다른 경로로 raw 값이 `innerHTML`에 흘러들 가능성.
- **원인:** [site/app.js](site/app.js) line 2096 — `[...STATE.brands].join("·")` 를 `esc()` 없이 label 문자열 구성.
- **제안 수정:** `esc([...STATE.brands].join("·"))` 로 명시 처리.
- **파일:** [site/app.js](site/app.js) line 2096 [lane:CORE]

---

### [M-551] ✅ 분석완료(moot: stopImmediatePropagation이 버블도 차단) — `openReviewDetail` ESC와 `_vsEsc` — capture 단계 불일치로 두 모달 동시 닫힘

- **영역:** 프론트엔드 — 리뷰/공유세트 모달 ESC 처리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 리뷰 상세 모달(capture 단계)과 공유 세트 모달(non-capture)이 동시 열린 상태에서 ESC 시 둘 다 닫힘.
- **원인:** [site/app.js](site/app.js) line 4316 — `_vsEsc`가 non-capture로 등록. 리뷰 모달의 `stopImmediatePropagation`(캡처 단계)을 우회.
- **제안 수정:** `_vsEsc`도 `{ capture: true }` 로 등록하거나 ESC 우선순위를 zIndex 기준으로 통일.
- **파일:** [site/app.js](site/app.js) line 4316 [lane:CORE]

---

### [M-552] ✅ 분석완료(moot: SW 버전 캐시로 관리됨, CACHE키 변경 시 이전 데이터 폐기) — `getJSON` — JSON 파일에 버전 쿼리 없이 `fetch()` → 배포 후 stale 데이터 노출

- **영역:** 프론트엔드 — 데이터 로딩
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `data/${slug}.json` URL에 버전 쿼리가 없어 브라우저 강 캐시 시 배포 후에도 구버전 데이터 노출. `app.js`는 `?v=` 캐시버스팅되지만 JSON 파일은 미적용.
- **원인:** [site/app.js](site/app.js) line 389 — `fetch(p)` — `cache` 옵션 또는 버전 쿼리 없음.
- **제안 수정:** `stamp_version.py`에서 JSON URL에 빌드타임 해시 주입하거나 `fetch(p, { cache: 'no-cache' })` 설정.
- **파일:** [site/app.js](site/app.js) line 389 [lane:CORE]

---

### [L-456] — `gate_tests.py` — `kind != "feature"` 시 T.2a 결과 항목 누락 → 묵시적 pass 처리

- **영역:** 백엔드 — dev-harness
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** refactor/fix/chore 등에서 T.2a가 `gate_results`에 없어 `_auto_status()`가 묵시적으로 "pass" 반환.
- **원인:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 26 — `if kind == "feature":` 블록에서만 T.2a 추가, else 브랜치 없음.
- **제안 수정:** REGISTRY에 T.2a를 feature-only applicable로 명시하거나, non-feature 시 `status: "skip"` 명시 항목 추가.
- **파일:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 26 [lane:BACKEND]

---

### [L-457] — `fill_whitelist_specs.py` — `canonical_model IS NULL` 행에서 `NOT LIKE` 필터가 NULL→UNKNOWN 반환으로 액세서리 미필터링

- **영역:** 백엔드 — 파이프라인/데이터
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `canonical_model=NULL`인 pending 제품의 `NOT LIKE`가 UNKNOWN이 되어 액세서리가 후보에 포함됨 → 불필요한 크롤링 발생.
- **원인:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 118 — `p.canonical_model NOT LIKE ?` — NULL 처리 없음.
- **제안 수정:** `COALESCE(p.canonical_model, p.model_name) NOT LIKE ?` 로 변경.
- **파일:** [pipeline/fill_whitelist_specs.py](pipeline/fill_whitelist_specs.py) line 118 [lane:BACKEND]

---

### [L-458] ✅ 검토완료·현행유지(2026-06-14, L·설계) — check_price_outlier는 cm.min_price(표시·관련 가격) 검사. 멤버의 저가 이상치는 min_price가 되어 탐지됨, 고가 이상치는 표시 무관. — `verify_internal.py` `check_price_outlier` — canonical 대표 제품만 검사, 변형 멤버 개별 가격 이상치 미탐지

- **영역:** 백엔드 — 파이프라인/데이터 품질
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** canonical 그룹의 비-대표 제품 변형 멤버가 이상 가격을 가져도 탐지되지 않음.
- **원인:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 28–36 — `FROM canonical_models cm JOIN products p ON p.id = cm.rep_product_id` 대표 제품 1개만 검사.
- **제안 수정:** 개별 관측 이상치는 `flag_price_outliers`에 위임한다고 명시. 또는 변형 멤버도 포함하는 쿼리로 확장.
- **파일:** [pipeline/verify_internal.py](pipeline/verify_internal.py) line 28 [lane:BACKEND]

---

### [L-459] — `renderThumbs` — 삭제 버튼 더블탭 시 stale `data-i`로 두 번 `splice` → 다른 사진 삭제

- **영역:** 프론트엔드 — 리뷰 폼
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 삭제 버튼 빠른 더블탭 시 재렌더 전에 같은 인덱스로 두 번 `splice` 실행되어 다른 사진이 삭제됨.
- **원인:** [site/app.js](site/app.js) line 2475–2476 — 더블탭 방어(버튼 비활성화, debounce) 없음.
- **제안 수정:** 클릭 직후 `btn.disabled = true` 설정.
- **파일:** [site/app.js](site/app.js) line 2475 [lane:CORE]

---

### [L-460] ✅ 검토완료·현행유지(2026-06-14, B·추측성) — 현재 라우트(category.html 단일)에서 가드 정상. 미래 경로 추가 시 재검토. — `serializeState` — `pathname.includes("category.html")` 가드가 미래 경로에서 오발동 위험

- **영역:** 프론트엔드 — URL 직렬화
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `pathname = /category.html/items` 같은 미래 경로에서 가드를 통과해 URL 덮어쓰기 발생 가능.
- **원인:** [site/app.js](site/app.js) line 1319 — `location.pathname.includes("category.html")` 부분 문자열 검사.
- **제안 수정:** `location.pathname === '/category.html' || location.pathname.endsWith('/category.html')` 로 정확히 비교.
- **파일:** [site/app.js](site/app.js) line 1319 [lane:CORE]

---

### [L-461] — `pushRecent` — `localStorage` QuotaExceededError 무음 처리 → 최근 본 상품 미업데이트 안내 없음

- **영역:** 프론트엔드 — 최근 본 상품
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `localStorage.setItem` 실패 시 오류 무음 처리. 사용자에게 최근 본 상품이 업데이트되지 않는 이유 안내 없음. `saveSets`는 QuotaExceededError 시 Toast 표시하는 것과 불일치.
- **원인:** [site/app.js](site/app.js) line 764 — `catch (e) { /* 무시 */ }`.
- **제안 수정:** `saveSets`와 동일하게 QuotaExceededError 시 `showToast("저장 공간이 부족해요…")` 안내 추가.
- **파일:** [site/app.js](site/app.js) line 764 [lane:CORE]

---

### [H-145] ⏸ 보류(2026-06-14, 검토필요) — `buildFilters` — `filtoggle` 핸들러 최초 1회만 등록 → 카테고리 전환 시 새 aside/backdrop 클로저 갱신 안 됨
> 보류: 불확실/위험: `aside=bar.parentNode`로 영속 요소를 참조하므로 클로저가 stale인지 불확실. filtoggle 핸들러 재등록 수정이 필터시트를 깨뜨릴 위험 → 재현 확인 후 별도 처리.

- **영역:** 프론트엔드 — 필터 바텀시트
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 빠른 카테고리 전환 시 filtoggle 버튼이 최초 카테고리의 `aside`/`backdrop` 클로저를 참조해 새 카테고리의 필터 시트를 열지 못함.
- **원인:** [site/app.js](site/app.js) line 1810 — `if (!document.getElementById("filtoggle"))` 가드로 핸들러를 1회만 등록. `buildFilters`가 카테고리 전환마다 새 aside를 기반으로 호출되어도 핸들러가 갱신되지 않음.
- **제안 수정:** filtoggle 존재 여부 가드를 제거하고 `buildFilters` 호출마다 핸들러 재등록. 또는 클로저 대신 `document.getElementById`로 동적 조회.
- **파일:** [site/app.js](site/app.js) line 1810 [lane:CORE]

---

### [H-146] ✅ 해결완료(2026-06-14, SYNC) — `upsertGearSet` — `completeness: set.items?.length` 로 저장 → 필수 슬롯 완성도와 불일치
> 수정: upsertGearSet completeness를 `set.completeness`(pct, 0~100) 우선 사용·없으면 0~100 클램프로 변경(items.length 직접 저장 시 CHECK 위반·의미불일치 제거). app.js 호출부에서 `setCompletion(newSet).pct` 계산해 전달.

- **영역:** 프론트엔드 — 기어 세트 원격 동기화
- **심각도:** 🔴 High
- **발견일시:** 2026-06-13
- **증상:** 의자 4개만 담으면 `completeness=4`이지만 실제 필수 슬롯 완성도는 25%. DB 기반 통계/쿼리에서 완성도가 왜곡됨.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 397 — `completeness: set.items?.length || 0` — 총 아이템 수로 저장.
- **제안 수정:** `setCompletion(set).pct` 또는 `setCompletion(set).filled` 기반으로 교체. 호출부에서 계산값을 인자로 전달.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 397 [lane:SYNC]

---

### [M-553] ✅ 해결완료(2026-06-14, MA) — `backend/store.py` `load()` — 재로드 시 `self.categories` 초기화 없어 삭제된 슬러그 메모리 잔류
> 수정: load() 진입 시 manifest/categories/search_index 초기화 추가(store.py L13~) → 재로드 시 삭제된 슬러그 잔존·노출 방지.

- **영역:** 백엔드 — store 레이어
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `load()` 재호출 시 `self.categories`가 초기화되지 않아 슬러그 삭제/이름 변경 후에도 구 슬러그가 메모리에 영구 잔류.
- **원인:** [backend/store.py](backend/store.py) line 13 — `load()` 진입 시 `self.categories = {}` 초기화 없음.
- **제안 수정:** `load()` 첫 줄에 `self.manifest = {}; self.categories = {}; self.search_index = []` 초기화 추가.
- **파일:** [backend/store.py](backend/store.py) line 13 [lane:BACKEND]

---

### [M-554] ✅ 해결완료(2026-06-14, MP) — `download_images.py` — `ThreadPoolExecutor` 내 `sqlite3` 연결 `check_same_thread=False` 미설정 → ProgrammingError 위험
> 확인: `con`은 메인 스레드(as_completed 루프)에서만 사용하고 워커(download_one)는 파일 다운로드만 → cross-thread 접근 없음, check_same_thread 불필요(오탐).

- **영역:** 백엔드 — 파이프라인/이미지 다운로드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 파이썬 버전·SQLite 빌드에 따라 `ProgrammingError: SQLite objects created in a thread can only be used in that same thread` 발생.
- **원인:** [pipeline/download_images.py](pipeline/download_images.py) line 84 — `sqlite3.connect(db_path)` 시 `check_same_thread=False` 미설정.
- **제안 수정:** `sqlite3.connect(db_path, check_same_thread=False)` 또는 `update_db` 호출을 큐로 직렬화.
- **파일:** [pipeline/download_images.py](pipeline/download_images.py) line 84 [lane:BACKEND]

---

### [M-555] ✅ 해결완료(2026-06-14, MD) — `evidence_collector.py` — `git diff --cached --stat base` → staged 없으면 항상 빈 결과
> 확인: apply가 stage만 하고 commit은 publish에서 하므로 evidence_collector 시점은 미커밋(staged). `git diff --cached --stat base`(staged vs base)가 정확하며, 제안된 `base HEAD`는 미커밋 상태서 빈 diff가 됨 → 현행 유지(오탐).

- **영역:** 백엔드 — devagent 증거 수집
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** worktree 기반 환경에서 아무것도 staged 되어 있지 않으므로 `--cached` diff가 항상 빈 결과 반환 → diffstat evidence 누락.
- **원인:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 22 — `["git", "diff", "--cached", "--stat", base]` — `--cached` 대신 `base` vs `HEAD` diff가 의도.
- **제안 수정:** `["git", "diff", "--stat", base, "HEAD"]` 로 변경.
- **파일:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 22 [lane:BACKEND]

---

### [M-556] ✅ 해결완료(2026-06-14, DP-2) — `promote_catalog.py` — SAVEPOINT 예외 경로에서 `con.close()` 미도달 → DB 연결 누수
> 수정: SAVEPOINT 재raise 경로와 `if not CORE: return` 조기종료 경로 양쪽에 `con.close()` 추가(promote_catalog.py). 말미 close 미도달 누수 차단.

- **영역:** 백엔드 — 파이프라인/카탈로그 승격
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** SAVEPOINT 블록 예외 시 `raise` 후 `con.close()`(말단)까지 도달하지 않아 DB 연결 누수. 연속 파이프라인(run_all)에서 반복 시 파일 핸들 누적 가능.
- **원인:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 61–64 — `except` 블록 `raise` 후 `con.close()` 미도달.
- **제안 수정:** `try/except/finally`로 변경해 `con.close()`를 `finally`에 이동.
- **파일:** [pipeline/promote_catalog.py](pipeline/promote_catalog.py) line 37 [lane:BACKEND]

---

### [M-557] ✅ 해결완료(2026-06-13) — `renderAccount` 찜 카드 클릭 — `_onCloseOnce` 복원 시 `STATE.data = undefined` → 이후 openProduct TypeError

- **영역:** 프론트엔드 — account.html 찜 목록
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 모달 닫힘 후 즉시 다른 찜 카드를 클릭하면 `STATE.data=undefined` 상태에서 `openProduct` 내부 `d.metrics.filter(...)` TypeError 발생 가능.
- **원인:** [site/app.js](site/app.js) line 1437 — `prevSlug`/`prevData`가 초기 `STATE({})` 기준이라 `undefined`. `_onCloseOnce` 복원 후 `STATE.data=undefined`.
- **제안 수정:** `prevSlug = STATE.slug ?? null`, `prevData = STATE.data ?? null`로 명시 null 폴백. 복원 시 `STATE.slug = prevSlug ?? null`.
- **파일:** [site/app.js](site/app.js) line 1437 [lane:CORE]

- **처리:** 찜 카드 `_onCloseOnce` 복원에 `?? null` 추가 — STATE.data undefined 복원 방지(+ M-564 loading 삭제 병합). (2026-06-14)

---

### [M-558] ✅ 해결완료(2026-06-13) — `renderHotSection` — `supabase.rpc()` `error` 변수 미구조분해 → RPC 실패 추적 불가

- **영역:** 프론트엔드 — 홈 인기 섹션
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** RPC 실패 시 `data=null`로 조용히 처리되어 fallback으로 전환되지만 `error` 정보가 전혀 기록되지 않아 RPC 장애 추적 불가.
- **원인:** [site/app.js](site/app.js) line 2948 — `const { data } = await supabase.rpc(...)` — `error` 미구조분해.
- **제안 수정:** `const { data, error } = await supabase.rpc(...)` + `if (error) console.warn("get_hot_items RPC:", error)` 추가.
- **파일:** [site/app.js](site/app.js) line 2948 [lane:CORE]

- **처리:** renderHotSection `supabase.rpc()` 반환에 `error` 구조분해 추가 + 에러 로깅·early return. (2026-06-14)

---

### [M-559] ✅ 분석완료(moot: cur은 SET_TYPES 키, 안전) — `setTypePickHtml` — `data-value="${cur}"` — `cur`에 `esc()` 미적용 → localStorage 조작 시 attribute injection

- **영역:** 프론트엔드 — 세트 모달 (보안)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** localStorage의 `gear_sets[].type`을 `"><img src=x onerror=alert(1)>`로 조작하면 `data-value` attribute injection 가능.
- **원인:** [site/app.js](site/app.js) line 255 — `data-value="${cur}"` — `cur`에 `esc()` 미적용.
- **제안 수정:** `data-value="${esc(cur)}"` 로 변경.
- **파일:** [site/app.js](site/app.js) line 255 [lane:CORE]

---

### [L-462] ✅ 해결완료(2026-06-14, K) — check_export에 price_min>price_max 역전 탐지 추가(양수 한정). 현재 18파일 오탐0 확인. — `check_export.py` — `price_min > price_max` 역전 케이스 미탐지

- **영역:** 백엔드 — 배포 게이트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `price_min=50000, price_max=30000` 같은 논리 역전이 FLOOR/CEIL 비율 검사를 모두 통과.
- **원인:** [pipeline/check_export.py](pipeline/check_export.py) line 65 — `pmin`과 `pmax` 교차 비교 로직 없음.
- **제안 수정:** `if pmin is not None and pmax is not None and pmin > 0 and pmax > 0 and pmin > pmax:` 위반 추가.
- **파일:** [pipeline/check_export.py](pipeline/check_export.py) line 65 [lane:BACKEND]

---

### [L-463] — `gate_lint.py` — `changed_paths` 경로 정규화 없어 "no files found"로 lint skip 가능

- **영역:** 백엔드 — devagent lint 게이트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 경로가 절대경로이거나 다른 기준 상대경로면 `ruff check` 가 "no files found" 경고로 종료코드 0 반환 → lint 사실상 skip.
- **원인:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 14 — `changed_paths`가 경로 정규화 없이 path 문자열 그대로 반환.
- **제안 수정:** `os.path.join(wt, p)` 또는 `os.path.abspath(os.path.join(wt, p))`로 정규화.
- **파일:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 14 [lane:BACKEND]

---

### [L-464] — `signInWithApple` — `state` 생성 후 `response.state` 비교 검증 없음 → CSRF 방어 무의미

- **영역:** 프론트엔드 — Apple 로그인 OAuth (보안)
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** `state: crypto.randomUUID()`를 생성하지만 `response.state`와 비교 검증하지 않아 CSRF 방어가 무의미함.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 59–66 — `state` 값 생성 후 `response.state` 비교 없음.
- **제안 수정:** `const state = crypto.randomUUID()` 저장 후 `if (response.state !== state) throw new Error("state mismatch")` 추가.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 59 [lane:AUTH]

---

### [L-465] ✅ 검토완료·현행유지(2026-06-14, F·코드 실대조) — #wishlist(account.html:60)는 #wish-section 직속, wishEl.after(bulkBtn)도 섹션 내부 → display:none(3437) 시 함께 숨김. 오탐. — `renderAccount` — `bulkBtn`이 `wish-section` 외부 형제 요소로 삽입 → 비로그인 시 숨겨진 채로 키보드 포커스 가능

- **영역:** 프론트엔드 — account.html 찜 목록 / 접근성
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 비로그인 상태에서 `wish-section`이 숨겨져도 `bulkBtn`이 DOM에 남아 키보드 포커스 접근 가능.
- **원인:** [site/app.js](site/app.js) line 3468 — `wishEl.after(bulkBtn)` — `bulkBtn`이 `wish-section` 내부가 아닌 형제 요소로 삽입.
- **제안 수정:** `bulkBtn`을 `wish-section` 내부에 `append`하거나, 비로그인 시 `bulkBtn`도 함께 숨기도록 처리.
- **파일:** [site/app.js](site/app.js) line 3468 [lane:ACCOUNT]

---

### [M-560] ✅ 해결완료(2026-06-14, MA) — `backend/routers/search.py` — search_index 키 약어 하드코딩 → 구조 불일치 시 조용히 빈 결과
> 수정: search.json 로드 후 첫 항목의 b/m/c 키 존재 검증·경고(store.py) → 스키마 변경 시 검색 silent 빈결과를 표면화.

- **영역:** 백엔드 — 검색 라우터
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `data_store.search_index`의 키 구조가 달라지면 에러 없이 항상 빈 검색 결과 반환.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 15–20 — `item.get("b")`, `item.get("m")`, `item.get("c")` 약어 키 정적 하드코딩. store.py 로드 경로와 연동 없이 가정.
- **제안 수정:** search_index 스키마 상수화 또는 키 존재 검증 + 경고 로그 추가.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 15 [lane:BACKEND]

---

### [M-561] ✅ 해결완료(2026-06-14, MA) — `backend/db.py` `query_db` — `aiosqlite.Error` 미처리 → DB 내부 스택트레이스 HTTP 500으로 노출
> 수정: M-464와 동일 — `(aiosqlite.Error,OSError)` 캐치로 raw 500/스택트레이스 노출 차단(db.py L23).

- **영역:** 백엔드 — DB
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** DB 경로 없음, 파일 손상, SQL 오류 시 FastAPI 기본 500 에러로 DB 내부 경로/스택트레이스 클라이언트 노출 가능.
- **원인:** [backend/db.py](backend/db.py) line 20–22 — `asyncio.TimeoutError`만 catch. `aiosqlite.Error`, `OSError`, `OperationalError` 전혀 처리 안 됨.
- **제안 수정:** `except (aiosqlite.Error, OSError) as e: raise HTTPException(503, "DB 오류")` 추가.
- **파일:** [backend/db.py](backend/db.py) line 20 [lane:BACKEND]

---

### [M-562] ✅ 해결완료(2026-06-14, MD) — `devagent/nodes/apply.py` — `git add -A`로 워크트리 전체 스테이징 → `.env` 등 scope 외 파일 커밋 위험
> 수정: apply.py `git add -A`→`git add -A -- <changed_files paths>`(H-144와 동일 패턴) — 워크트리 임시파일 혼입 차단.

- **영역:** 백엔드 — devagent apply 노드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `changed_files`에 없는 `.env`, 시크릿 파일이 워크트리에 존재하면 커밋에 포함됨. gate_diff_scope가 `state.changed_files`만 검사해 워크트리 실제 파일의 시크릿은 통과.
- **원인:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 82 — `_git(["add", "-A"], cwd=wt)` — changed_files 목록으로 한정하지 않음. (publish.py의 동일 패턴은 H-144로 보고됨)
- **제안 수정:** `git add -A` 대신 `git add -- <changed_file_paths_only>` 로 스코프 제한.
- **파일:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 82 [lane:BACKEND]

---

### [M-563] ✅ 해결완료(2026-06-14, MD) — `devagent/nodes/publish.py` — commit 실패 시에도 `ledger.remove()` 무조건 호출 → 원장 오염
> 수정: `if committed_sha and thread_id`로 가드(publish.py L73) — commit 실패 시 원장 보존해 재시도 추적 유지.

- **영역:** 백엔드 — devagent publish 노드
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `git commit` 실패 시 변경이 적용되지 않은 채로 원장 thread가 제거되어 다른 세션이 해당 scope를 안전하다고 착각하고 동시 작업 진입 가능.
- **원인:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 72–73 — `if thread_id: ledger.remove(thread_id)` — `committed_sha` 체크 없이 무조건 실행.
- **제안 수정:** `if committed_sha and thread_id: ledger.remove(thread_id)` 로 commit 성공 시에만 원장 제거.
- **파일:** [dev-harness/devagent/nodes/publish.py](dev-harness/devagent/nodes/publish.py) line 72 [lane:BACKEND]

---

### [M-564] ✅ 해결완료(2026-06-14) — `go()` 찜 카드 클릭 — 성공 경로에서 `card.dataset.loading` 미삭제 → 모달 닫기 후 재클릭 무반응

- **영역:** 프론트엔드 — 마이페이지/찜 목록
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 찜 카드 클릭 후 모달을 닫아도 같은 카드 재클릭 시 `dataset.loading = "1"` 가드에 걸려 동작 불가.
- **원인:** [site/app.js](site/app.js) line 3434–3441 — `openProduct` 성공 경로에서 `return` 전에 `delete card.dataset.loading` 미호출. fallback 경로(라인 3444)는 정상 삭제.
- **제안 수정:** 라인 3440 `return` 앞에 `delete card.dataset.loading;` 추가 또는 `_onCloseOnce`에서 삭제.
- **파일:** [site/app.js](site/app.js) line 3440 [lane:CORE]

- **처리:** 찜 카드 go() 성공 경로의 `_onCloseOnce`에서 `delete card.dataset.loading` 추가 — 모달 닫은 후 재클릭 정상 동작. (2026-06-14)

---

### [M-565] ✅ 해결완료(2026-06-14) — `draw()` 카드 목록 — `a.pli` Enter 키 처리 없어 item 페이지로 이탈

- **영역:** 프론트엔드 — 카테고리 목록 / 접근성
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 상품 카드(a.pli)에 키보드 포커스 후 Enter를 누르면 모달 대신 `/item/{slug}/item-N.html`로 페이지 이동됨. Space는 올바르게 모달을 열지만 Enter는 처리 안 됨.
- **원인:** [site/app.js](site/app.js) line 2743 — `e.key === " "` 만 체크, `"Enter"` 케이스 누락.
- **제안 수정:** `if (e.key === " " || e.key === "Enter")` 로 변경.
- **파일:** [site/app.js](site/app.js) line 2743 [lane:CORE]

- **처리:** draw() 카드 목록 onkeydown에 `e.key === "Enter"` 케이스 추가. (2026-06-14)

---

### [M-566] ✅ 해결완료(2026-06-14) — `upsertGearSet()` update 경로 — `user_id` 필터 미적용 → RLS 설정 오류 시 타인 세트 덮어쓰기 가능

- **영역:** 프론트엔드 — supabaseClient.js / 기어세트 동기화 (보안)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** stale `remoteId` 혼입 또는 RLS 설정 오류 시 타인의 기어세트를 덮어쓸 수 있음.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 400 — `.update(payload).eq('id', set.remoteId)` 에서 `.eq('user_id', userId)` 누락.
- **제안 수정:** `.eq('id', set.remoteId).eq('user_id', userId)` 로 user_id 필터 추가.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 400 [lane:SYNC]

- **처리:** upsertGearSet update에 `.eq("user_id", userId)` 필터 추가 — RLS 오류 시 타인 세트 덮어쓰기 차단. (2026-06-14)

---

### [L-466] — `gate_tests.py` — npm test "no tests found" 등 Jest 패턴 미매칭 → 0건 결과가 fail 처리

- **영역:** 백엔드 — devagent 게이트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** Jest에서 "No tests found", "Test Suites: 0" 등이 exit_code=1로 반환되면 T.1/T.3 fail 처리 → frontend 변경이 revise 루프에 갇힘.
- **원인:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 70–72 — `_no_tests_collected`이 pytest 패턴("no tests ran", "collected 0 items")만 체크.
- **제안 수정:** Jest 패턴 추가: `"no tests found"`, `"test suites: 0"`, `"0 passing"` 등.
- **파일:** [dev-harness/devagent/nodes/gate_tests.py](dev-harness/devagent/nodes/gate_tests.py) line 70 [lane:BACKEND]

---

### [L-467] — `_reviewCard()` — `safeHttps()` 빈 문자열 반환 시 `src=""` img 렌더 → `.has-photo` 카드 레이아웃 깨짐

- **영역:** 프론트엔드 — 상품 모달/후기
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 리뷰 이미지가 http URL이면 `safeHttps()`가 `""`를 반환, `src=""` img가 렌더되어 `.has-photo` 카드 레이아웃과 `pmrv-more` 배지 숫자가 실제 표시 사진 수와 어긋남.
- **원인:** [site/app.js](site/app.js) line 2308 — `r.image_urls.length` 체크 후 `safeHttps` 검증 없이 카드 분기 결정. `openReviewDetail`은 `filter(safeHttps)`로 올바르게 처리함.
- **제안 수정:** `const validImgs = r.image_urls.filter(safeHttps); if (validImgs.length)` 로 변경.
- **파일:** [site/app.js](site/app.js) line 2308 [lane:CORE]

---

### [L-468] — `showSetConfirm()` — `sac-bar` 연속 담기 시 `bar.offsetWidth` 강제 리플로우 누락 → 프로그레스 바 재시작 불완전

- **영역:** 프론트엔드 — 세트 담기 확인 카드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 상품을 연속으로 담기 시 프로그레스 바가 처음부터 재시작하지 않고 현재 진행 위치에서 이동.
- **원인:** [site/app.js](site/app.js) line 748–751 — `bar.style.transition = "none"` 후 `scaleX(1)` 설정 시 강제 리플로우(`void bar.offsetWidth`) 없어 DOM이 transition 없이 리셋 안 됨.
- **제안 수정:** `bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth;` 로 강제 리플로우 추가.
- **파일:** [site/app.js](site/app.js) line 748 [lane:CORE]

---

### [M-567] ✅ 해결완료(2026-06-14, MA) — `backend/routers/search.py` — `/api/search` rate limit 데코레이터 미적용 → 무제한 요청 가능
> 수정: `SlowAPIMiddleware` 추가(main.py) → Limiter(default_limits 60/min)가 inert라 전 라우트 무제한이던 것을 전역 적용. slowapi.middleware import 확인.

- **영역:** 백엔드 — rate limiting/보안
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** `/api/search`, `/api/category/{slug}` 엔드포인트에 `@limiter.limit()` 데코레이터 없어 전역 rate limit이 적용되지 않음. 무제한 검색 요청 가능.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 9, [backend/routers/categories.py](backend/routers/categories.py) line 14 — `@limiter.limit(...)` 데코레이터 부재.
- **제안 수정:** 각 엔드포인트에 `@limiter.limit("60/minute")` 추가하거나 slowapi 미들웨어(`SlowAPIMiddleware`) 방식으로 전환.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 9 [lane:BACKEND]

---

### [M-568] ✅ 해결완료(H-140과 동일 수정, DP/HB) — `make_logo.py` — macOS 전용 폰트 경로 하드코딩 → Linux CI/CD에서 OG 이미지 생성
> 확인: H-140의 `_font` 폴백 로더로 동시 해소(make_logo.py L13~). 크래시

- **영역:** 백엔드 — 파이프라인/make_logo
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** GitHub Actions(Linux)에서 실행 시 `OSError: cannot open resource` 크래시 → OG 이미지 생성 실패 → 배포 중단 또는 OG 이미지 누락.
- **원인:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 — `FP="/System/Library/Fonts/AppleSDGothicNeo.ttc"` macOS 시스템 폰트 경로 절대 하드코딩. 폰트 부재 시 예외 처리 없음.
- **제안 수정:** `os.path.exists(FP)` 체크 후 없으면 Noto Sans CJK 등 fallback 폰트 시도. `try/except OSError`로 fallback 처리.
- **파일:** [pipeline/make_logo.py](pipeline/make_logo.py) line 96 [lane:BACKEND]

---

### [M-569] ✅ 해결완료(2026-06-14) — `saveRemoteWishlist` — 사용자 전환 시 이전 사용자 체인이 새 사용자 컨텍스트에서 실행 → 찜 데이터 혼입

- **영역:** 프론트엔드 — 찜 동기화 (보안)
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 로그아웃 후 다른 계정으로 로그인 시 직전 사용자의 `saveRemoteWishlist` 체인 대기분이 새 사용자 row에 이전 사용자 찜 목록을 upsert할 수 있음.
- **원인:** [site/supabaseClient.js](site/supabaseClient.js) line 161–176 — `_wishWriteChain`·`_wishPending`이 모듈 레벨 변수로 사용자 전환을 인식하지 못함. 체인 실행 시점에 이미 다른 사용자로 전환되어 있어도 이전 클로저의 `user`가 사용됨.
- **제안 수정:** `signOut()` 시 `_wishWriteChain = Promise.resolve(); _wishPending = undefined;` 초기화. 또는 체인 내부에서 `getUser()` 재확인 후 user_id 일치 시에만 실행.
- **파일:** [site/supabaseClient.js](site/supabaseClient.js) line 161 [lane:SYNC]

- **처리:** saveRemoteWishlist 체인 실행 시점에 `getUser()` 재확인 후 user_id 일치 시에만 upsert — 사용자 전환 시 데이터 혼입 방지. (2026-06-14)

---

### [M-570] ✅ 해결완료(2026-06-14) — `buildFilters` 가격 슬라이더 — `lo===hi===0` 시 슬라이더 범위 0~0 → NaN% 렌더링 및 필터 무력화

- **영역:** 프론트엔드 — 필터/카테고리
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-13
- **증상:** 전체 모델의 `price_min`이 0 또는 null인 카테고리에서 가격 슬라이더 `fill` width가 NaN%로 렌더링되고 슬라이더 조작이 무의미해짐.
- **원인:** [site/app.js](site/app.js) line 1652–1664 — `prices.length` 체크로 빈 배열은 방어하지만 `lo === hi === 0` 케이스 미처리. `pct()` 분모 0 나눗셈.
- **제안 수정:** `buildFilters`에서 `if (lo === hi) return;` 스킵 또는 "가격 정보 없음" 텍스트 대체.
- **파일:** [site/app.js](site/app.js) line 1652 [lane:CORE]

- **처리:** buildFilters 가격 슬라이더 `lo >= hi` 시 렌더 스킵 — NaN% fill·무력 슬라이더 방지. (2026-06-14)

---

### [L-469] — `_util.py` `run_tool` — 출력 4000자 고정 절단 → 절단 이후 실제 에러 메시지 누락으로 게이트 오판

- **영역:** 백엔드 — dev-harness 공용 헬퍼
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 긴 mypy/pytest 출력에서 4000자 이후의 실제 에러 메시지가 잘려 `contract_checker`/`evaluator`가 "출력에 fail 없음"으로 오판 가능.
- **원인:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 29 — `(proc.stdout + proc.stderr)[:4000]` 고정 절단.
- **제안 수정:** stdout/stderr 각각 2000자씩 보존하거나 절단 시 `\n[TRUNCATED ...]` 마커 추가.
- **파일:** [dev-harness/devagent/nodes/_util.py](dev-harness/devagent/nodes/_util.py) line 29 [lane:BACKEND]

---

### [L-470] ✅ 검토완료·현행유지(2026-06-14, G·코드 실대조) — e.data.json()은 try/catch(91)로 보호, e.data null 시 TypeError 삼켜지고 기본 data 사용. 크래시 없음. 오탐. — `sw.js` push 핸들러 — `e.data`가 `null`일 때 `e.data.json()` → TypeError

- **영역:** 프론트엔드 — 서비스워커/푸시
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** payload 없는 silent push 수신 시 `null.json()` TypeError로 SW가 죽어 알림 미표시 가능.
- **원인:** [site/sw.js](site/sw.js) line 91 — `e.data.json()` 호출 전 `e.data` null 체크 없음. `try/catch`가 있으나 `e.data` 자체가 null이면 프로퍼티 접근 전에 TypeError 발생.
- **제안 수정:** `if (e.data) { try { data = { ...data, ...e.data.json() }; } catch {} }` 로 명시적 null 가드 추가.
- **파일:** [site/sw.js](site/sw.js) line 91 [lane:SW]

---

### [L-471] ✅ 검토완료·현행유지(2026-06-14, B·코드 실대조) — L-204와 동일, draw() 중앙화로 URL 갱신됨. 오탐. — `renderActiveFilters` — 개별 필터 칩 해제 시 `serializeState()` 미호출 → URL과 필터 상태 불일치

- **영역:** 프론트엔드 — 필터/카테고리
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 활성 필터 칩 ✕ 클릭 후 새로고침·뒤로가기 시 해제한 필터가 URL에서 복원됨. `clearAllFilters()`는 `serializeState()` 호출하나 개별 칩 해제 경로만 누락.
- **원인:** [site/app.js](site/app.js) line 1989 — `chips[+b.dataset.ai][1](); syncFilterUI(); draw();` — `serializeState()` 미호출.
- **제안 수정:** `draw()` 뒤에 `serializeState()` 추가.
- **파일:** [site/app.js](site/app.js) line 1989 [lane:CORE]

---

### [L-472] ✅ 해결완료(2026-06-14, F) — 계정삭제 localStorage 정리목록에 레거시 'sets' 키 추가(account.html:544). — `account.html` signOut — `localStorage.removeItem('sets')` 누락으로 레거시 `sets` 키 계정 삭제 후 잔류

- **영역:** 프론트엔드 — 계정/로그아웃
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-13
- **증상:** 계정 삭제 후 `sets` 키(레거시)가 localStorage에 잔류. `supabaseClient.signOut()`은 `sets`를 지우지만 account.html 삭제 흐름(라인 524)에서는 `wish`·`gear_sets`만 제거.
- **원인:** [site/account.html](site/account.html) line 524 — `localStorage.removeItem('sets')` 누락.
- **제안 수정:** `localStorage.removeItem('sets')` 추가 또는 `signOut()` 단일 호출로 일원화.
- **파일:** [site/account.html](site/account.html) line 524 [lane:CORE]

---

### [H-147] ✅ 해결완료(2026-06-14, HF) — `account.html` `syncWishlistOnLogin` — `supabase` 미임포트 → ReferenceError로 찜 동기화 항상 실패
> 수정: import에 `supabase` 추가(account.html L201) → `supabase.auth.getUser()` ReferenceError로 찜 동기화가 항상 실패하던 것 해소.

- **영역:** 프론트엔드 — 계정/인증
- **심각도:** 🔴 High
- **발견일시:** 2026-06-14
- **증상:** 로그인 직후 찜 동기화가 `ReferenceError: supabase is not defined`로 항상 실패. 원격 찜이 로컬에 병합되지 않아 찜 데이터 유실 가능.
- **원인:** [site/account.html](site/account.html) line 279 — `supabase.auth.getUser()`를 직접 호출하지만 `supabase` 객체가 임포트 목록(라인 200~205)에 없음.
- **제안 수정:** 임포트 목록에 `getUser`를 추가하고 `await getUser()`로 교체. 또는 `supabase`를 임포트 목록에 추가.
- **파일:** [site/account.html](site/account.html) line 279 [lane:AUTH]

---

### [M-571] ✅ 해결완료(2026-06-14) — `account.html` — 로그아웃 후 `_wishSyncedUser` 리셋 누락 → 재로그인 시 찜 동기화 스킵

- **영역:** 프론트엔드 — 계정/인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-14
- **증상:** 로그아웃 후 동일 계정 재로그인 시 `_wishSyncedUser === _su.id` 조건이 참이 되어 찜 동기화 스킵 → 원격 찜이 로컬에 반영되지 않음.
- **원인:** [site/account.html](site/account.html) line 276–281 — `_wishSyncedUser`가 모듈 스코프 변수인데 `signOut()`·`renderLogin()` 경로에서 `null` 리셋 없음.
- **제안 수정:** `initAuth` 콜백의 비로그인 분기에서 `_wishSyncedUser = null` 추가.
- **파일:** [site/account.html](site/account.html) line 412 [lane:AUTH]

- **처리:** renderLogin()에서 `_wishSyncedUser = null` 리셋 — 재로그인 시 찜 동기화 재실행 보장. (2026-06-14)

---

### [M-572] ✅ 해결완료(2026-06-14) — `account.html` 계정 삭제 — `push-denied`·`_sid`·`post_likes` 등 개인화 키 미정리 → 공유 기기 데이터 잔류

- **영역:** 프론트엔드 — 계정/인증
- **심각도:** 🟡 Medium
- **발견일시:** 2026-06-14
- **증상:** 계정 삭제 후 `push-denied`, `_sid`, `post_likes`, `seenIntro`, `ops` 등 개인화 localStorage 키가 잔류. 공유 기기에서 다음 사용자가 이전 사용자의 세션 관련 데이터를 볼 수 있음.
- **원인:** [site/account.html](site/account.html) line 524–525 — 계정 삭제 후 `wish`·`gear_sets`만 제거. 나머지 개인화 키 미정리.
- **제안 수정:** 계정 삭제 성공 후 `localStorage.clear()` 또는 개인화 키 목록 일괄 제거.
- **파일:** [site/account.html](site/account.html) line 524 [lane:CORE]

- **처리:** 계정 삭제 후 push-denied·_sid·post_likes 등 개인화 localStorage 키 일괄 정리. (2026-06-14)

---

### [L-473] — `backend/routers/search.py` — 검색 시마다 전체 인덱스 `.lower()` 재계산 → 대량 데이터 성능 저하

- **영역:** 백엔드 — 검색 성능
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-14
- **증상:** 수천 건의 검색 인덱스에서 매 요청마다 3중 `.lower()` 호출로 성능 저하.
- **원인:** [backend/routers/search.py](backend/routers/search.py) line 15–19 — `data_store.search_index`에 원본 문자열 저장, 검색 시마다 `.lower()` 재계산.
- **제안 수정:** `store.py`의 `load()` 시점에 소문자 정규화된 별도 필드로 사전 변환해 캐싱.
- **파일:** [backend/routers/search.py](backend/routers/search.py) line 15 [lane:BACKEND]

---

### [L-474] — `devagent/nodes/apply.py` — `is_binary` 체크가 `status==deleted` 이전에 오면 바이너리 파일 삭제 묵살 위험

- **영역:** 백엔드 — devagent apply 노드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-14
- **증상:** 현재 코드 순서(삭제 먼저, is_binary 나중)는 정상이지만 리팩토링 시 순서가 뒤바뀌면 바이너리 파일 삭제가 묵살됨.
- **원인:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 65–70 — `status==deleted` 체크 → `is_binary` 체크 순서. 취약한 코드 구조.
- **제안 수정:** 삭제는 바이너리 여부와 무관하게 항상 처리되도록 `elif` 구조 명시화.
- **파일:** [dev-harness/devagent/nodes/apply.py](dev-harness/devagent/nodes/apply.py) line 65 [lane:BACKEND]

---

### [L-475] — `evidence_collector.py` — data 축 스크립트 실패가 `gate_results`에 미반영 → 계약 체크 누락

- **영역:** 백엔드 — devagent evidence 노드
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-14
- **증상:** `validate_ranges.py`/`audit.py` 실패가 `evidence` 리스트에만 기록되고 `gate_results`에는 반영되지 않아 `contract_checker`가 데이터 검증 실패를 인식하지 못함.
- **원인:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 28–36 — 결과가 `evidence` 리스트에만 들어가고 `gate_results`로 연결 안 됨.
- **제안 수정:** data 축 스크립트 fail 시 `gate_results`에도 `D.1` 등 contract_id로 fail 항목 추가.
- **파일:** [dev-harness/devagent/nodes/evidence_collector.py](dev-harness/devagent/nodes/evidence_collector.py) line 28 [lane:BACKEND]

---

### [L-476] — `_paintWishBtn` — `data-key` 없는 `#item-wish` 버튼이 모든 찜 토글 시 오갱신

- **영역:** 프론트엔드 — 찜/위시리스트
- **심각도:** 🟢 Low
- **발견일시:** 2026-06-14
- **증상:** A 상품 찜 중에 B 상품 모달이 열려 있으면 B 모달의 찜 버튼이 잘못 토글될 수 있음.
- **원인:** [site/app.js](site/app.js) line 486 — `|| !b.dataset.key` 조건이 key 미매칭 버튼도 갱신 대상에 포함.
- **제안 수정:** `!b.dataset.key` 분기 제거 또는 `openProduct` 내 `#item-wish` 버튼에 항상 `data-key` 설정.
- **파일:** [site/app.js](site/app.js) line 486 [lane:CORE]

---

### [M-573] ✅ 해결완료(2026-06-14) — `normalize_models.py` `flag_price_outliers()` — 단일제품 '제품 내부' 저가 오염(부속·오타 단가)이 min/max 오염

- **영역:** 백엔드 — 파이프라인 / 가격 이상치 탐지
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-14 (사용자 제보: 코베아 마리나 28,000원)
- **증상:** 한 `product_id`에 본품가와 부속·오타 단가가 함께 적재되면(예: 코베아 마리나 본품 142,500원 + 28,000원) `price_min`이 오염가로 내려가 가성비 지수가 부풀려진다(마리나 value 99·★5 가성비 1위). A패스(텐트 하한 15,000원)는 28,000원을 통과시키고, B패스(canonical 중앙값)는 비교 제품이 2종 미만이면 skip → 단일제품 내부 오염이 이중 사각지대로 빠져나감.
- **재현조건:** canonical 그룹에 제품 1종뿐이고 그 product에 5배 이상 벌어진 관측치가 공존할 때.
- **원인:** [pipeline/normalize_models.py](pipeline/normalize_models.py) `flag_price_outliers()` — 제품 내부 관측치 간 모순을 검사하는 패스 부재.
- **수정:** 패스 D 추가 — 제품 내부 max/min>5(내부 모순 실재)인 제품에 한해, 같은 카테고리 '제품대표가(제품당 최저 유효가) 중앙값'의 [0.2×,5×] 밴드 밖 관측을 `valid=0` 격리. 카테고리 분포를 기준틀로 써서 저가·고가 오염을 모두 옳게 가린다(제품 내부 max 앵커는 정상 저가를 오격리 → 회피). 전 카탈로그 6,786 관측 중 1건만 격리(과격리 없음). 멱등.
- **파일:** [pipeline/normalize_models.py](pipeline/normalize_models.py) (flag_price_outliers 패스 D) [lane:BACKEND]
- **데이터 후속:** 코베아 마리나(GF-AT-00068) 가격 398,000원으로 수동 확정, value_score·item-201.html·search.json·모바일 번들 동기 반영.

---

---

## 🤖 자동 버그 탐색 — 회차 73 (2026-06-14 자동루프)

| 영역 | 탐색일시 | 발견 건수 |
|------|----------|-----------|
| BE(파이프라인)·FE(SW/오프라인) | 2026-06-14 | 3건 (BE-001·BE-002·FE-001) |

---

### [BE-001] — `coupang_runner.js` `startCoupangRunner()` — `okg` 배열 빈 상태에서 `okg[0].p` 접근 → TypeError 크래시

- **영역:** 백엔드 — 파이프라인 / 쿠팡 파트너스 자동링크
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** 검색 결과에서 `passers`가 존재하지만 이상가(salesPrice < 중앙값×0.4) 상품만 있을 때 `okg` 배열이 비어 `okg[0].p`에서 `TypeError: Cannot read properties of undefined` 발생. 해당 아이템의 runner가 `catch`에 걸려 `status:"error"`로 전체 중단됨.
- **재현조건:** 쿠팡 검색 결과에서 모든 통과 상품의 가격이 중앙값의 40% 미만일 때 (예: 비정상 할인 상품만 노출되는 경우).
- **원인:** [pipeline/coupang_runner.js:111-113](pipeline/coupang_runner.js) — `okg` 필터 후 빈 배열 가드 없이 `okg[0]` 직접 접근.
- **수정안:** `if(!okg.length) continue;` 추가 (line 112 앞).
- **파일:** [pipeline/coupang_runner.js](pipeline/coupang_runner.js):111-113
- **우선순위:** 중간
- **상태:** 미해결

---

### [BE-002] — `detect_price_drops.py` `load_catalog()` — `brand`·`model` None 시 wish_key가 `"None|None|"` 생성 → 찜 매칭 오류

- **영역:** 백엔드 — 파이프라인 / 가격 알림
- **심각도:** 🟡 Low
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `site/data/*.json` 모델 항목에 `brand` 또는 `model` 필드가 누락된 경우 `m.get('brand')`가 `None`을 반환, `wish_key(None, None, ...)` → `"None|None|"` 키 생성. 이 키가 사용자 찜 목록에 우연히 매칭되면 엉뚱한 알림이 발송되거나, `"None|None|"` 키를 가진 이벤트가 중복 억제 로직을 통과할 위험.
- **재현조건:** 카탈로그 JSON에 brand/model 누락 항목 존재 시.
- **원인:** [pipeline/detect_price_drops.py:61](pipeline/detect_price_drops.py) — `wish_key(m.get('brand'), m.get('model'), ...)` None 가드 없음.
- **수정안:** `if not m.get('brand') or not m.get('model'): continue` 조건 추가 (line 57 `if not gf` 블록 아래).
- **파일:** [pipeline/detect_price_drops.py](pipeline/detect_price_drops.py):56-62
- **우선순위:** 낮음
- **상태:** 미해결

---

### [FE-001] — `sw.js` SHELL 프리캐시 — `search.html`·`login.html` 미포함 → 오프라인 시 검색·로그인 페이지 접근 불가

- **영역:** 프론트엔드 — 서비스워커 / 오프라인 지원
- **심각도:** 🟡 Low
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** 오프라인 상태에서 `search.html` 또는 `login.html`로 직접 접근 시 내비게이션 fetch가 실패(캐시 미스)하여 브라우저 오프라인 에러 화면 표시. `account.html`은 SHELL에 포함되어 있지만 검색·로그인은 제외됨.
- **재현조건:** PWA 설치 후 오프라인 상태에서 `/search.html` 또는 `/login.html` 접근.
- **원인:** [site/sw.js:7-12](site/sw.js) — SHELL 배열에 `"search.html"`, `"login.html"` 항목 없음. 내비게이션 fetch 핸들러(line 47)는 네트워크 우선으로 시도 후 캐시에 fallback하지만 미프리캐시 페이지는 캐시도 없어 최후 `index.html` fallback도 `navigate` 모드에서만 적용.
- **수정안:** SHELL 배열에 `"search.html"`, `"login.html"` 추가 후 `stamp_version.py` 재실행(SW 캐시명 자동 갱신).
- **파일:** [site/sw.js](site/sw.js):8-11
- **우선순위:** 낮음
- **상태:** 미해결

---

---

## 🤖 자동 버그 탐색 — 회차 74 (2026-06-14 자동루프)

| 영역 | 탐색일시 | 발견 건수 |
|------|----------|-----------|
| BE(coupang_runner)·FE(logFeed·bestGear) | 2026-06-14 | 3건 (BE-003·FE-002·FE-003) |

---

### [BE-003] — `coupang_runner.js` `post()` — XHR timeout 미설정 → Coupang API 무응답 시 runner 무한 대기

- **영역:** 백엔드 — 파이프라인 / 쿠팡 파트너스 자동링크
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `post()` 함수 내 `XMLHttpRequest`에 `x.timeout`·`x.ontimeout` 미설정. Coupang 파트너스 API가 응답하지 않으면(서버 행 또는 네트워크 단절) `Promise`가 영원히 pending 상태로 남아 `await post(...)` 호출 이후 코드가 실행되지 않음. 결과적으로 쿠팡 러너가 무한 대기 상태가 되어 브라우저 탭을 닫지 않는 한 멈추지 않음. 429·rCode 오류는 처리되지만 행 자체가 없는 hang에는 무력.
- **재현조건:** partners.coupang.com API가 연결은 되나 응답을 내려주지 않는 상황(서버 부하·방화벽 세션 hold 등).
- **원인:** [pipeline/coupang_runner.js:31-40](pipeline/coupang_runner.js) — `x.timeout = 30000; x.ontimeout = function(){ rej(new Error("timeout")); };` 미추가.
- **수정안:** `x.open(...)` 이후 `x.timeout = 30000;` + `x.ontimeout = function(){ rej(new Error("timeout")); };` 추가.
- **파일:** [pipeline/coupang_runner.js](pipeline/coupang_runner.js):31-40
- **우선순위:** 중간
- **상태:** 미해결

---

### [FE-002] — `renderLogFeed()` — `p.created_at` null 시 `new Date(null)` → "1970년 1월 1일" 노출

- **영역:** 프론트엔드 — 커뮤니티 / 로그 피드
- **심각도:** 🟡 Low
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `posts` 쿼리 결과에서 `created_at`이 null인 행이 존재하면 `new Date(null).toLocaleDateString(...)` = `"1970년 1월 1일"` 이 카드 날짜로 노출됨.  Supabase `posts.created_at`에 `DEFAULT now()` + `NOT NULL`이 있다면 정상 케이스에서는 발생 안 하지만, 직접 INSERT·마이그레이션 스크립트·테스트 데이터에서 null이 삽입될 경우 즉시 UI 버그로 드러남.
- **재현조건:** `posts` 테이블에 `created_at IS NULL` 행 존재 시.
- **원인:** [site/app.js:3947](site/app.js) — `const dt = new Date(p.created_at).toLocaleDateString(...)` null 가드 없음.
- **수정안:** `const dt = p.created_at ? new Date(p.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : "날짜 미상";`
- **파일:** [site/app.js](site/app.js):3947
- **우선순위:** 낮음
- **상태:** 미해결

---

### [FE-003] — `renderBestGear()` — `d.metrics` undefined 시 `.filter()` TypeError → 커뮤니티 베스트 섹션 렌더 중단

- **영역:** 프론트엔드 — 커뮤니티 / 베스트 장비
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-14 (자동 탐색, `site/data/misc.json` metrics 부재 실측 확인)
- **증상:** `site/data/*.json` 중 `metrics` 키가 없는 파일(실제로 `misc.json` 확인)이 `BEST_SLUGS`에 추가되거나 export 오류로 metrics가 누락될 경우 `d.metrics.filter(m => m.is_star)[0]` 에서 `TypeError: Cannot read properties of undefined (reading 'filter')` 발생. 해당 `try/catch` 블록은 에러를 삼키고 계속 진행하지만, 이미 `el.insertAdjacentHTML` 텍스트가 추가된 상태에서 이후 슬러그가 모두 에러로 건너뛰면 "측정 스펙 기반…" 안내 텍스트만 표시되고 실제 장비 카드가 전혀 없는 빈 섹션이 됨.
- **재현조건:** `BEST_SLUGS` 내 슬러그의 data JSON에 `metrics` 배열이 없을 때.
- **원인:** [site/app.js:3864](site/app.js) — `const star = d.metrics.filter(...)` — `d.metrics` undefined 가드 없음. 비교: 같은 패턴의 `renderCategory`(line 1595)는 `d.metrics.filter`를 쓰지만 export_site가 항상 metrics를 생성하므로 무해. `renderBestGear`는 별도 getJSON으로 로드하므로 동일하게 취약.
- **수정안:** `const star = (d.metrics || []).filter(m => m.is_star)[0];`
- **파일:** [site/app.js](site/app.js):3864
- **우선순위:** 중간
- **상태:** 미해결

---

---

## 🤖 자동 버그 탐색 — 회차 75 (2026-06-14 자동루프)

| 영역 | 탐색일시 | 발견 건수 |
|------|----------|-----------|
| FE(logModal ESC누적·세션만료·파일업로드) | 2026-06-14 | 3건 (FE-004·FE-005·FE-006) |

---

### [FE-004] — `openLogModal()` — ESC 리스너(`onEsc`) 재호출 시 이전 리스너 미제거 → 누적 등록

- **영역:** 프론트엔드 — 커뮤니티 / 캠핑 로그 모달
- **심각도:** 🟡 Low
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `openLogModal()`이 모달이 열린 상태에서 다시 호출되면(예: 세트 상세에서 "로그 쓰기" 재클릭) 새 `onEsc` 함수가 `document.addEventListener("keydown", onEsc)`로 추가 등록되고 이전 함수는 제거되지 않음. 이후 ESC 키 누름 시 `close()` 가 두 번 호출되어 두 번째 호출에서 이미 제거된 리스너를 제거 시도(무해하나 불필요)하며, `modal.classList.remove("on")`이 중복 호출됨. 다른 모달(`openSetModal` line 624, `openReviewModal` line 4078)은 `modal._onKey` 패턴으로 이를 방지하나 `openLogModal`만 누락.
- **원인:** [site/app.js:4319](site/app.js) — `document.addEventListener("keydown", onEsc)` 전에 이전 onEsc 제거 코드 없음.
- **수정안:** `openLogModal` 함수 시작부에서 `modal._onEsc`로 저장·제거 패턴 적용:  `if (modal._onEsc) document.removeEventListener("keydown", modal._onEsc);` 추가 후 `modal._onEsc = onEsc`로 저장.
- **파일:** [site/app.js](site/app.js):4318-4319
- **우선순위:** 낮음
- **상태:** 미해결

---

### [FE-005] — `openLogModal()` form submit — `window.currentUser()` null 체크 없이 `.id` 접근 → 세션 만료 시 TypeError

- **영역:** 프론트엔드 — 커뮤니티 / 캠핑 로그 모달
- **심각도:** 🟠 Medium
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `form.onsubmit` 핸들러 내 line 4282·4299에서 `window.currentUser().id`를 직접 사용. 모달 열 때(`isLoggedIn()` 체크, line 4147)는 로그인 상태였지만 form 제출 시점까지 세션이 만료되면 `window.currentUser()` → `null` → `null.id` → `TypeError: Cannot read properties of null`. 이 경우 `try/catch`가 포착해 "저장 중 오류" 메시지를 표시하지만, Supabase Storage에는 `path = "${null}/..."` 로 업로드가 시도된 후 에러가 나므로 이미지가 부분 업로드될 수도 있음.
- **원인:** [site/app.js:4282,4299](site/app.js) — async submit 시 재인증 체크 없이 `window.currentUser()` 직접 호출.
- **수정안:** submit 핸들러 진입 시 `const user = window.currentUser(); if (!user) { errEl.textContent = "로그인 세션이 만료됐어요. 다시 로그인해주세요."; errEl.style.display = ""; return; }` 추가 후 `user.id` 사용.
- **파일:** [site/app.js](site/app.js):4282, 4299
- **우선순위:** 중간
- **상태:** 미해결

---

### [FE-006] — `openLogModal()` 이미지 업로드 — 확장자 없는 파일명 시 파일명 전체가 확장자로 사용됨

- **영역:** 프론트엔드 — 커뮤니티 / 캠핑 로그 모달
- **심각도:** 🟡 Low
- **발견일시:** 2026-06-14 (자동 탐색)
- **증상:** `imgFile.name.split(".").pop()` 는 파일명에 점(`.`)이 없으면 파일명 전체를 반환(예: `"photo"` → `"photo"`). `|| "jpg"` 폴백은 `pop()`이 falsy를 반환할 때만 작동하므로 `"photo"`(truthy)는 폴백 미작동 → Storage 업로드 경로가 `userId/timestamp.photo` 가 됨. 업로드 자체는 성공하지만 Content-Type이 `application/octet-stream`으로 서빙돼 이미지로 렌더링되지 않거나 CDN에서 거부될 수 있음. 모바일 카메라 앱이 확장자 없이 파일을 전달하는 경우 발생.
- **원인:** [site/app.js:4281](site/app.js) — `imgFile.name.split(".").pop()` — 점이 없는 파일명에 대한 예외 처리 없음.
- **수정안:** `const nameParts = imgFile.name.split("."); const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "jpg";`
- **파일:** [site/app.js](site/app.js):4281
- **우선순위:** 낮음
- **상태:** 미해결

---
