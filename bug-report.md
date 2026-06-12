# 장비의 숲 버그 리포트

> 자동 생성 · 매 10분 순회 · 코드 수정 없음  
> 마지막 업데이트: 2026-06-11

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

---

## 🗂️ Medium 묶음 처리 계획 (2026-06-12)

> 아래 클러스터는 동일 파일·동일 패턴이므로 PR 1개로 묶어서 수정 예정.

### [클러스터 A] setItems 필드 누락 — `M-130` + `M-131`
- **공통 원인:** 인라인 객체 수기 생성 시 `s·pcode·coupang_url` 필드 누락
- **공통 수정:** `items.map(m => setItem(m, STATE.slug))` 헬퍼로 교체
- **파일:** `site/app.js` 2곳 (bulkBtn ~line 2776, openCmpModal ~line 2076)

### [클러스터 B] initAuth 이중 발화 → 핸들러 누적 — `M-132` + `M-116`
- **공통 원인:** `initAuth` 합성 `'INITIAL'` 이벤트가 Supabase `INITIAL_SESSION`과 겹쳐 콜백 2회 실행 → `renderProfile` 2회 → `addEventListener` 누적
- **공통 수정:** `supabaseClient.js` line 22 합성 호출 제거 + `renderProfile` 내 `addEventListener` → `onclick` 직접 할당으로 교체
- **파일:** `site/supabaseClient.js`, `site/account.html`

### [클러스터 C] account.html 탭 UI 묶음 — `M-52` + `M-53` + `M-74` + `M-84`
- **공통 위치:** `account.html` 탭바 + `app.js` `renderAccount` 탭 섹션
- M-52: 탭 URL 해시 딥링크 무시 → `history.replaceState` 연동
- M-53: 찜 탭 카드 클릭 → 카테고리 이탈 → 상품 모달로 전환
- M-74: 모바일 375px 탭바 `<nav>` 0×0 → CSS hit area 확보
- M-84: `role="tab"` ARIA 미구현 → `role="tablist"` + `role="tab"` + `aria-selected` 추가
- **파일:** `site/account.html`, `site/app.js`

### [클러스터 D] supabaseClient.js 인증 버그 — `M-118` + `M-125`
- M-118: `import("./supabaseClient.js")` 버전 없음 → GoTrueClient 이중 인스턴스 → `stamp_version.py` 동적 import도 교체 또는 싱글턴 패턴
- M-125: 닉네임 save 시 `clearTimeout(debounce)` 미호출 → 중복 setNickname 가능
- **파일:** `site/app.js` (dynamic import 교체), `pipeline/stamp_version.py`, `site/account.html`

### [클러스터 E] account.html 로그인 후 동기화 — `M-117` + `M-123`
- M-117: 로그아웃 후 재로그인 시 `myLogsList.dataset.loaded` stale → 로그아웃 분기에서 초기화 추가
- M-123: 닉네임 설정 완료 후 `syncGearSetsOnLogin` 미호출 → save 핸들러에 호출 추가
- **파일:** `site/app.js` (~line 2258), `site/account.html` (~line 259)

---

## 🔴 High (즉시 수정 필요)

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

### [M-69] www 서브도메인 직접 접근 시 이미지 403 + JS ReferenceError — 자산 로드 실패
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

### [M-67] www. 서브도메인 DNS 미해석 — cdn-cgi/rum·이미지 요청 ERR_NAME_NOT_RESOLVED
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
- **⚠️ 남은 작업:** 세트 동기화를 켜려면 대시보드에서 `006`(grant 포함) 1회 적용(APPLY.md "7. 세트 동기화"). 적용 후엔 동기화가 실작동하므로 M-71/M-63의 "동기화 안내" 프론트 문구도 사실과 일치하게 됨(프론트 문구 추가는 별도).

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

### [M-32] 내 정보 영역 근처에 불필요한 그래픽/UI 요소 존재
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** '내 정보' 섹션 부근에 의도하지 않은 것으로 보이는 그래픽 요소가 표시됨. 디자인 의도와 맞지 않는 잔여 UI로 추정.
- **제보:** 사용자 직접 제보

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

### [M-28] account.html canonical non-www vs 실제 www 불일치 (SEO)
- **영역:** 계정/로그인 (SEO)
- **URL:** https://www.gear-forest.com/account.html
- **증상:** canonical이 `https://gear-forest.com/account.html`(non-www). [H-12] 전 페이지 공통 이슈.

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

### [M-27] search.html 전용 검색 결과 페이지 없음 — 검색어 URL 공유·북마크 불가 (SEO)
- **영역:** 검색 (SEO)
- **URL:** https://www.gear-forest.com/search.html
- **증상:** `/search.html?q=키워드` 접근 시 index.html로 리다이렉트. 검색 결과를 URL로 공유·북마크 불가. 검색엔진 인덱싱도 불가.

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

### [M-11] login.html 접근 시 '서비스 점검 중' 텍스트만 반환
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/login.html
- **증상:** 별도 로그인 URL로 직접 접근 시 아무런 안내 없이 비어 보이는 점검 페이지 표시. 리다이렉트나 안내 링크 없음.

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

### [M-97] `#post=비UUID` 접근 시 Supabase UUID 파싱 에러 코드 콘솔 노출
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

### [L-76] 세트 공유 URL 열람 시 열람자 본인의 찜·세트 데이터가 모달 뒤에 노출
- **영역:** 계정/로그인 — 세트 공유
- **URL:** https://gear-forest.com/account.html?view-set=...
- **증상:** 세트 공유 URL을 열면 공유 세트 모달과 함께 배경에 열람자 본인의 찜 목록·세트가 모두 노출됨. 수신자에게 자신의 개인 데이터가 공유 URL과 함께 표시되어 혼란 유발. 설계 의도 확인 필요.
- **재현:** 세트 공유 링크 복사 → 브라우저에서 열기 → 공유 모달 + 본인 찜·세트 동시 노출

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

### [L-19] ~~계정 삭제/탈퇴 기능 미존재~~ → [H-23]으로 승격
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** H-23 참조.

### [L-20] 닉네임 설정/변경 UI 미존재
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 커뮤니티 로그에 닉네임이 사용되는 구조임에도 닉네임 설정·변경 입력 필드 없음. 최초 자동 생성 닉네임 변경 불가 상태.

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

### [L-25] www·non-www 리다이렉트 동작이 경로마다 불일치
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

### [L-04] Cloudflare beacon.min.js 503 오류
- **영역:** 상품 상세 (전체 페이지 공통으로 추정)
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 페이지 로드 시 Cloudflare Web Analytics beacon 스크립트가 503 반환. 분석 데이터 수집 불가.

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

### [L-37] 계정 찜 탭 전체 삭제 기능 없음
- **영역:** 계정/로그인 — 찜 탭
- **증상:** 개별 찜 해제 버튼만 있고 "전체 삭제" 기능 없음. 다수 찜 항목을 일일이 해제해야 함.

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

### [L-101] renderDetail — initAuth 완료로 canParticipate 변경 시 #post=ID 상세보기 강제 재렌더
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
- **심각도:** 🟡 Medium
