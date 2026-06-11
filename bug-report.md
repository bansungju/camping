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

---

## 🔴 High (즉시 수정 필요)

### [H-01] 이번 주 인기 API (get_hot_items) 404 에러 — 하드코딩 fallback 노출
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** 페이지 로드 시 Supabase RPC `get_hot_items` 호출이 404 반환. '이번 주 인기' 섹션이 실제 데이터 대신 하드코딩된 4개 항목(백패킹텐트, 침낭, 버너, 랜턴)을 표시. 콘솔에 에러 노출.
- **재현:** https://gear-forest.com 접속 → 브라우저 콘솔 확인 → 'Failed to load resource: 404' 확인

### [H-21] https://gear-forest.com 직접 접근 시 ERR_TOO_MANY_REDIRECTS
- **영역:** 홈/메인
- **URL:** https://gear-forest.com
- **증상:** non-www 주소로 직접 진입하면 리다이렉트 루프(gear-forest.com↔www.gear-forest.com)로 페이지 열리지 않음. www로 진입 시에는 정상. SEO canonical·공유 링크가 non-www를 가리키므로 외부 유입 사용자가 진입 불가.

### [H-22] style 필터 URL 공유·직접 진입 시 칩 active 복원 실패 + 필터 미적용
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag&style=backpacking
- **증상:** URL에 `style=backpacking` 파라미터가 있어도 직접 진입·새로고침 시 ① 해당 칩 버튼이 active(.on) 상태가 아니고 ② 필터도 미적용되어 전체 목록이 표시됨. URL 공유 링크가 받는 사람에게 필터링된 결과를 보여주지 못함. `renderStyleChips(d)` 호출이 `restoreState(params)` 이전에 위치하여 STATE에 campStyle이 빈 값임.
- **재현:** `?cat=sleeping-bag`에서 백패킹 칩 클릭 → URL 복사 → 새 탭에서 열기 → 칩 비활성·전체 목록 표시

### [H-03] tent·cooking 카테고리 JSON 503으로 페이지 로드 실패
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** `data/tent.json`, `data/cooking.json`이 503 반환 → 해당 카테고리에서 '카테고리를 찾을 수 없습니다.' 오류 표시. sleeping-bag은 정상.
- **재현:** `/category.html?cat=tent` 또는 `?cat=cooking` 접속

### [H-04] 상품 이미지 대규모 403/503 오류 (sleeping-bag 기준 221개 전부 실패)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `/images/*.jpg` 요청이 403/503 다수 발생. 221개 이미지 전체 로드 실패, 카드에 '이미지 준비중' 대체 텍스트 표시.
- **재현:** `/category.html?cat=sleeping-bag` 접속 후 네트워크 탭 확인

### [H-05] ✅ 해결완료 — 데이터 로드 실패 시 스켈레톤 카드 6개가 화면에 잔존
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** JSON 로드 실패로 에러 메시지가 표시된 상태에서도 `.pli-skel` 스켈레톤 카드 6개가 시각적으로 남아 있음. aria-hidden=true 처리는 되어 있으나 에러 메시지 아래 회색 카드가 보임.
- **원인(2026-06-11):** `renderCategory()`가 시작 시 `renderCategorySkeleton()`으로 #list에 스켈레톤 6개를 채우는데, JSON 로드 실패 catch 블록이 title 텍스트만 바꾸고 #list는 정리하지 않아 스켈레톤이 잔존.
- **해결:** catch 블록에서 #list를 비우고 단일 에러 상태(`.cat-error` — 안내 문구 + '전체 카테고리 보기' 복구 링크, `role="alert"`)로 교체. CSS `.cat-error*` 추가. 로컬 프리뷰 검증 — 실패 카테고리에서 스켈레톤 0개·에러 상태 표시, 정상 카테고리(침낭 244개)는 회귀 없음. [site/app.js](site/app.js), [site/style.css](site/style.css)

### [H-17] 자동완성 드롭다운 키보드 탐색(↑↓) 미구현 — WAI-ARIA Combobox 패턴 미준수
- **영역:** 검색 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** ↑↓ 키로 드롭다운 항목 간 이동 불가. `aria-expanded`, `aria-haspopup`, `aria-autocomplete`, `role="option"`, `aria-selected`, `aria-activedescendant` 등 ARIA 속성 전무. 스크린리더 사용자 자동완성 접근 불가.

### [H-18] ✅ 해결완료 — Esc 키가 드롭다운 닫기와 동시에 검색 입력값 초기화
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 자동완성 표시 중 Esc 누르면 드롭다운 닫힘과 동시에 입력값이 빈 문자열로 지워짐. 기대 동작은 드롭다운만 닫히고 입력값 유지.
- **해결(2026-06-11):** `setupHomeSearch()`의 keydown 핸들러에 Escape 분기 추가. `input[type=search]`의 네이티브 Esc=초기화 동작을 `e.preventDefault()`로 차단하고 드롭다운만 닫도록 처리. 로컬 프리뷰 검증 — Esc 시 드롭다운 display block→none, 입력값 '헬리녹스' 유지 확인. [site/app.js](site/app.js)

### [H-19] Service Worker 오프라인 폴백 — `category.html?cat=...` URL 캐시 miss → 홈 서빙
- **영역:** 검색 (PWA)
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent
- **증상:** SW 캐시에 쿼리스트링 없는 `category.html`만 저장됨. 네트워크 불안정 시 `?cat=backpacking-tent` URL이 캐시 miss → `index.html` 폴백 → 홈 화면 노출. `caches.match(req, { ignoreSearch: true })` 로 해결 가능.

### [H-16] backpacking-tent 카테고리 상품 상세 전체 접근 불가 — 홈 HTML 서빙
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** `/item/backpacking-tent/app.js` 및 `style.css`가 HTTP 504로 실패하여 상품 상세 내용이 없고 홈 페이지 콘텐츠(title: '장비의 숲 — 정량스펙 별점 DB')가 렌더링됨. 해당 카테고리 상품 상세 전체 접근 불가.

### [H-14] 모달 '구매하기' 버튼이 모든 상품에서 항상 disabled — 쿠팡 파트너스 연결 불가 ⚠️ 미연결(의도적)
- **영역:** 카테고리/목록 (모달)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 상품 카드 클릭 시 열리는 모달의 '구매하기' 버튼이 `disabled` 상태 고정, '구매 링크를 준비 중입니다.' 안내만 표시. 침낭 244개 상품 전체 동일. 쿠팡 파트너스 수익화 핵심 기능 미작동. (상세 페이지 [H-08]과 동일 문제)
- **비고:** 사용자 확인 — 쿠팡 파트너스 API 연결 전 의도적 disabled. 연결 시 수정 필요.

### [H-15] ✅ 해결완료 — 데이터 로드 실패 카테고리에서 h1이 오류 메시지·스켈레톤이 동시 노출
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=stove
- **증상:** JSON 503 카테고리에서 h1='카테고리를 찾을 수 없습니다.' 오류 메시지와 스켈레톤 카드 6개가 동시에 DOM에 존재. 이중 오류 상태로 사용자 혼란. ([H-05] 스켈레톤 잔존의 확장 사례)
- **해결(2026-06-11):** [H-05]와 동일 수정으로 해결. catch 블록이 #list의 스켈레톤을 제거하고 단일 에러 상태로 교체하므로 h1 오류 메시지와 스켈레톤이 더 이상 공존하지 않음. [site/app.js](site/app.js)

### [H-12] canonical·og:url이 non-www인데 실제 서빙 URL은 www — SEO 중복 콘텐츠
- **영역:** 홈/메인 (SEO)
- **URL:** https://www.gear-forest.com/
- **증상:** `<link rel="canonical">`과 `og:url`이 `https://gear-forest.com/`(non-www)으로 설정되어 있으나 실제 서빙 URL은 `https://www.gear-forest.com/`. 검색엔진이 두 버전을 별개 문서로 인식해 PageRank 분산 위험. [H-10] OAuth 도메인 불일치와 같은 근본 원인(non-www/www 혼용).

### [H-20] ✅ 해결완료 — 최근 본 상품 카드 클릭 시 상품 상세로 이동하지 않음
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** 홈의 '최근 본 상품' 섹션에서 카드를 클릭해도 상품 상세 페이지로 이동하지 않음. 클릭 이벤트가 연결되지 않았거나 링크 href가 누락된 것으로 추정.
- **제보:** 사용자 직접 제보
- **원인(2026-06-11):** recard 링크는 `category.html?cat=...&brands=...&q=...`(필터된 목록)으로만 이동하고, 카테고리 페이지는 brands+q로 단일 상품을 특정해도 상세 모달을 자동으로 열지 않았음. 사용자에겐 "상세로 안 감"으로 보임. (recent 항목엔 상품 id가 없어 직접 상세 URL 생성 불가)
- **해결:** `renderCategory()`의 `draw()` 직후, 단일 브랜드(brands에 '|' 없음)+q가 모두 있으면 `d.models`에서 정확히 일치하는 모델을 찾아 `openProduct()`로 상세 모달을 자동 오픈. 검색 결과·추천 카드 등 brands+q 링크 전반이 함께 개선됨. 일반 검색(q만)은 제외. 로컬 프리뷰 검증 — brands+q 링크 시 모달 자동 오픈(네이처하이크 BE400…), q만 있는 일반 검색은 미오픈 확인. [site/app.js](site/app.js)

### [H-13] 최근 본 상품 섹션 이미지 403 — 썸네일 전체 깨짐
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** localStorage에 저장된 최근 본 상품(images/105.jpg, images/922.jpg)을 불러올 때 403 반환. '최근 본 상품' 카드에 이미지 없이 '이미지 준비중'만 표시. [H-04] 이미지 서버 오류와 동일 근본 원인.

### [H-10] OAuth redirectTo URL이 www 없는 도메인으로 하드코딩 — 로그인 실패 가능
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `supabaseClient.js`의 `SITE_BASE`가 `https://gear-forest.com`으로 고정. 실제 사이트는 `https://www.gear-forest.com`으로 리다이렉트되므로 Google OAuth 콜백 URL이 불일치할 경우 로그인 실패.

### [H-11] 다크모드 토글이 '정비 중'이라고 표시되면서 클릭 가능 상태로 렌더링
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 설정 섹션에 '정비 중'이라고 안내하지만 토글은 `disabled=false`·`pointerEvents=auto` 상태로 실제 클릭 가능. 초기 `data-theme=dark` 적용으로 `checked=true`까지 표시되어 상태가 모순.

### [H-09] 검색 자동완성 클릭/Enter 시 clean URL로 이동 → CSS·JS MIME 오류, 페이지 완전 파손
- **영역:** 검색
- **URL:** https://www.gear-forest.com/category/backpacking-tent?q=%ED%85%90%ED%8A%B8
- **증상:** 홈 검색창에서 자동완성 클릭 또는 Enter 시 `category/backpacking-tent?q=...` clean URL로 이동. `category/style.css`와 `category/app.js`가 MIME 오류로 로드 실패 → `ReferenceError: renderCategory is not defined` → 페이지가 '불러오는 중…'에서 영구 정지.
- **재현:** 홈 → 검색창에 '텐트' 입력 → 자동완성 클릭 또는 Enter
- **참고:** `category.html?cat=backpacking-tent` 방식은 정상. [H-02]와 동일 근본 원인 — 검색 자동완성 링크 href가 아직 구 clean URL 형식 사용 중

### [H-06] 상세 페이지 탭바 링크 상대경로 오류 — 서비스 점검 페이지로 이동
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 상세 페이지 탭바의 '비교', '커뮤니티', '내 정보' 링크가 상대경로(index.html, community.html, account.html)로 하드코딩되어 `/item/{category}/index.html` 등으로 이동. 해당 URL은 '서비스 점검 중입니다' 오류 페이지 반환.
- **재현:** 상세 페이지 진입 후 탭바 아무 탭 클릭

### [H-07] 상세 페이지에 찜하기(북마크) 버튼 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 카테고리 목록 모달에는 찜하기 버튼이 있으나, 상세 페이지에는 완전히 누락됨.

### [H-08] 상세 페이지에 구매하기(쿠팡 파트너스) 버튼 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 카테고리 모달에는 구매하기 버튼(disabled)이 있으나, 상세 페이지에는 구매 버튼 및 쿠팡 파트너스 링크 자체가 존재하지 않음.

### [H-02] 카테고리 링크 클릭 시 JS·CSS·manifest 404 — 페이지 렌더링 불가
- **영역:** 홈/메인 → 카테고리 링크
- **URL:** https://www.gear-forest.com/category/backpacking-tent
- **증상:** 홈 카테고리 카드가 `category/backpacking-tent` 형식(구 SPA-like URL)을 사용. 해당 URL 직접 접근 시 `category/app.js`, `category/style.css`, `category/manifest.webmanifest` 모두 404 또는 MIME 오류. `renderCategory is not defined` ReferenceError 발생, 카테고리 목록 표시 안 됨.
- **재현:** 홈에서 카테고리 카드 클릭 → 빈 페이지 + 콘솔 에러 확인
- **참고:** `fix(routing)` 커밋에서 `category.html?cat=` 방식으로 전환했으나 홈 카테고리 그리드 링크가 아직 구 경로 형식 사용 중

---

## 🟡 Medium

### [M-31] 로그아웃 버튼 없음 — 로그인한 사용자가 로그아웃 불가
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 계정 페이지 어디에도 로그아웃 버튼이 표시되지 않음. 로그인 상태에서 세션 종료 방법이 없음.
- **제보:** 사용자 직접 제보

### [M-32] 내 정보 영역 근처에 불필요한 그래픽/UI 요소 존재
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** '내 정보' 섹션 부근에 의도하지 않은 것으로 보이는 그래픽 요소가 표시됨. 디자인 의도와 맞지 않는 잔여 UI로 추정.
- **제보:** 사용자 직접 제보

### [M-33] 데스크톱에서 카테고리 필터가 반응형으로 구현되지 않음
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 데스크톱 뷰에서 필터(정렬·스펙 필터 등)가 모바일 기준으로만 구현되어 있어 데스크톱 레이아웃에서도 모바일형 UI가 그대로 표시됨. 넓은 화면에 맞는 사이드바 필터 또는 가로형 레이아웃으로 전환되지 않음.
- **제보:** 사용자 직접 제보

### [M-34] 커뮤니티 글 상세 진입 시 document.title 미갱신
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html#post={id}
- **증상:** `renderDetail()` 실행 시 `document.title`이 '커뮤니티 — 장비의 숲'으로 고정, 글 제목으로 변경 안 됨. 브라우저 탭·히스토리·소셜 공유 미리보기에 글 제목 미반영.

### [M-35] 개별 글 공유 가능한 독립 URL 없음 — hash 라우팅만 사용
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** 글 상세가 `community.html#post={uuid}` 해시로만 접근 가능. og:url·canonical이 글마다 갱신 안 돼 SNS 공유·크롤러가 글 내용 인식 불가. 공유 버튼도 없음.

### [M-28] account.html canonical non-www vs 실제 www 불일치 (SEO)
- **영역:** 계정/로그인 (SEO)
- **URL:** https://www.gear-forest.com/account.html
- **증상:** canonical이 `https://gear-forest.com/account.html`(non-www). [H-12] 전 페이지 공통 이슈.

### [M-29] auth_error=1 파라미터 도달 시 에러 메시지 미표시 — 로그인 실패 원인 안내 없음
- **영역:** 계정/로그인
- **URL:** https://gear-forest.com/account.html?auth_error=1
- **증상:** auth-callback.html 직접 접근 시 `account.html?auth_error=1`로 리다이렉트되지만 `#auth-error` 엘리먼트가 `display:none`이고 텍스트도 비어 있어 사용자에게 로그인 실패 원인이 전혀 표시되지 않음.

### [M-30] 숨겨진 섹션 내 '+ 새 로그' 링크가 키보드/스크린리더로 포커스 가능 — 접근성 포커스 트랩
- **영역:** 계정/로그인 (접근성)
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `display:none` 부모 안의 `#logs-section` 내 '+ 새 로그' 링크가 `tabindex` 없이 DOM에 존재. 키보드 Tab 탐색 및 스크린리더로 접근 가능하며 클릭 시 community.html로 이동.

### [M-24] 자동완성 모델명 검색어 하이라이트 미적용
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 브랜드명은 `<span class='sb'>`로 강조되지만 모델명 내 매칭 키워드는 강조 없음. 예: '알파인 돔' 검색 시 모델명 부분 미강조.

### [M-25] 자동완성 전체 결과 개수 표시 없음
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 30개 이상 결과가 렌더링되어도 총 개수 표시 없음. 더보기 안내도 없어 결과가 잘리는지 알 수 없음.

### [M-26] 검색창 커스텀 초기화(X) 버튼 없음 — iOS Safari 등에서 초기화 불가
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 브라우저 기본 `input[type=search]` X 버튼에만 의존. iOS Safari 등 일부 브라우저에서 기본 X 버튼이 미표시되어 입력 초기화 불가. 클릭 시 앱 상태(드롭다운)와 동기화도 불확실.

### [M-27] search.html 전용 검색 결과 페이지 없음 — 검색어 URL 공유·북마크 불가 (SEO)
- **영역:** 검색 (SEO)
- **URL:** https://www.gear-forest.com/search.html
- **증상:** `/search.html?q=키워드` 접근 시 index.html로 리다이렉트. 검색 결과를 URL로 공유·북마크 불가. 검색엔진 인덱싱도 불가.

### [M-21] 상세 페이지 canonical URL non-www — 실제 서빙 www와 불일치 (SEO)
- **영역:** 상품 상세 (SEO)
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** canonical이 `https://gear-forest.com/item/...`(non-www)이나 실제 서빙은 `https://www.gear-forest.com/`. [H-12]와 동일 근본 원인, 상세 페이지 전체에 영향.

### [M-22] JSON-LD aggregateRating ratingCount에 스펙 항목 수를 사용자 리뷰 수로 오용
- **영역:** 상품 상세 (SEO)
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 구조화 데이터의 `ratingCount: 3`은 실제 측정 스펙 항목 수(최소무게·내한온도·충전량)와 동일. 실제 사용자 리뷰 수가 아닌 값이 Google Rich Results에 리뷰 수로 노출될 수 있음.

### [M-23] 상품 상세에 공유(share) 기능 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** SNS 공유, URL 복사, Web Share API 등 공유 버튼 없음. 특정 상품 스펙을 외부로 공유할 방법 없음.

### [M-18] 데이터 로드 실패 카테고리에서 catnav 탭 활성화 미작동
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=stove
- **증상:** JSON 503 실패 시 catnav에서 현재 카테고리 탭에 `on` 클래스 미적용, '📊비교'(홈 탭)가 잘못 활성화됨.

### [M-19] 카테고리 페이지 meta description 모든 카테고리 동일한 generic 값 (SEO)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 모든 카테고리 페이지 `<meta name="description">`이 동일한 서비스 소개 문구. 카테고리별 고유 description 없어 검색 유입 최적화 불가. ([L-13] JSON-LD 부재와 SEO 문제 연관)

### [M-20] 상품 상세 모달 dialog에 aria-labelledby 없음
- **영역:** 카테고리/목록 (접근성)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `role=dialog` 모달에 `aria-labelledby` 없음. 스크린 리더가 모달 제목을 안내하지 못함. 닫기 버튼에 `tabindex` 없어 키보드 포커스 순서 미보장.

### [M-14] 검색 input에 aria-label·label 요소 없음
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** `#homeq` 검색창에 `<label>`, `aria-label`, `aria-labelledby` 모두 없음. placeholder는 접근성 이름으로 인정 안 됨.

### [M-15] 검색창이 `<form>` 태그로 감싸지지 않아 Enter 키 제출 동작 비표준
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** 검색 input이 `<form>` 안에 없어 표준 HTML 폼 제출 동작 없음. WCAG 2.1 SC 2.1.1 비준수.

### [M-24] 유효하지 않은 카테고리 접근 시 빈 필터바 함께 노출
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=nonexistent
- **증상:** 존재하지 않는 `cat` 값으로 접근 시 '카테고리를 찾을 수 없습니다' 메시지가 표시되지만 빈 필터바(슬라이더, 브랜드 목록 등)가 함께 노출되어 오해를 줌. 에러 상태에서 필터 UI는 숨겨야 함.
- **재현:** `category.html?cat=doesnotexist` 접속 → 에러 메시지 아래 빈 필터 확인

### [M-22] 데스크톱 탭바 '📊비교' 탭 — 비교 UI 미구현
- **영역:** 홈/메인 (데스크톱)
- **URL:** https://www.gear-forest.com/
- **증상:** 데스크톱 상단 탭바의 '📊비교' 탭을 클릭하면 `index.html`로 이동할 뿐 비교 전용 UI(상품 선택·비교표 등)가 전혀 없음. 탭 이름과 기능이 불일치.
- **재현:** 데스크톱(≥768px)에서 상단 탭바 '📊비교' 클릭 → 홈 화면만 로드

### [M-23] 비활성 nav 항목에 `aria-current="false"` 명시 — ARIA 명세 위반
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** 탭바 nav의 비활성 항목이 `aria-current="false"`를 명시적으로 선언. ARIA 명세상 `aria-current`는 현재 항목에만 지정하고 비활성 항목은 속성 자체를 생략해야 함. 스크린리더가 잘못된 상태 정보를 읽어줄 수 있음.
- **재현:** 홈 접속 → DevTools > Elements에서 `.tab-item` 확인 → `aria-current="false"` 속성 존재

### [M-16] 상단 탭바 홈 탭 레이블 '📊비교' — 하단 탭바 '홈'과 불일치
- **영역:** 홈/메인 (UI)
- **URL:** https://www.gear-forest.com/
- **증상:** 상단 탭바에서 `index.html`로 이동하는 탭이 '📊비교'로 표시, 하단 탭바에서는 같은 URL이 '홈'으로 표시. 동일 페이지를 다른 이름으로 노출. [M-10]과 연관.

### [M-17] 상단 탭바 `<nav>`에 aria-label 없음
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** 페이지에 `<nav>` 2개 존재. 하단 탭바는 `aria-label="주 내비게이션"` 있으나 상단 탭바 `<nav>`에는 없어 스크린리더 사용자가 구분 불가.

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

### [M-13] empty state에서 글쓰기 CTA 없음 — 비로그인·로그인 모두 해당
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** '아직 글이 없어요. 첫 이야기를 남겨보세요!' 문구에 클릭 가능한 글쓰기 버튼/링크 없음. 글쓰기 버튼은 `canParticipate()`가 true인 사용자의 `cm-bar`에만 렌더링되어, empty state에서는 로그인 사용자도 글쓰기로 이동 불가. *(구 [M-13]: 비로그인 케이스 → 로그인 포함으로 확장)*
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 글 없을 때 '첫 이야기를 남겨보세요!' 문구가 표시되지만 비로그인 사용자에게는 글쓰기 버튼이 없어 액션 불가. 로그인 유도 없이 단순 권유 문구만 표시.

### [M-09] 로그인 후 프로필 영역에 실제 이메일 주소 노출 — 개인정보
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `renderProfile()`이 `profile.email`을 UI에 직접 렌더링. 코드 주석에 '실명/이메일을 표시명으로 쓰지 않는다'고 명시되어 있음에도 이메일이 노출됨.

### [M-10] 데스크톱·모바일 탭바 메뉴 구성 불일치
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 데스크톱 탭 3개(비교/커뮤니티/내 정보) vs 모바일 탭 4개(홈/탐색/커뮤/마이). 탭명과 개수가 달라 기기 간 경험 불일치.

### [M-11] login.html 접근 시 '서비스 점검 중' 텍스트만 반환
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/login.html
- **증상:** 별도 로그인 URL로 직접 접근 시 아무런 안내 없이 비어 보이는 점검 페이지 표시. 리다이렉트나 안내 링크 없음.

### [M-05] 상세 페이지 커뮤니티 로그 연결 버튼 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** `a95b92a` 커밋('세트 상세 → 커뮤니티 로그 작성 원클릭 연결')이 머지됐으나 실제 상세 페이지에 해당 버튼이 없음.

### [M-07] 모바일(375px)에서 상세 hero 섹션 레이아웃 미반응형
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** `.item-hero`가 모바일에서도 `flex-direction: row` 유지. 이미지(200px 고정폭)와 상품 정보가 가로 배치되어 상품명·가격·순위 텍스트가 극도로 좁은 영역에 압축됨. `column` 전환 필요.

### [M-08] 상세 페이지 이미지 403/503 오류 + fallback 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 메인 이미지 및 '비슷한 상품' 썸네일 다수가 403/503으로 로드 실패. `onerror` fallback 처리 없어 깨진 이미지 아이콘만 노출. (카테고리 목록의 [H-04]와 연관된 서버 측 이슈로 보임)

### [M-02] 모바일(375px)에서 스펙 레이블이 줄바꿈되어 카드 높이 불균일
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** '내한온도(ISO하한)' 같은 긴 스펙 레이블이 모바일에서 줄바꿈되어 카드 높이가 90px까지 늘어남. 셀 너비 제한(113~183px)으로 인한 wrapping.

### [M-03] 모바일에서 카테고리 서브탭(catnav)이 잘려 일부 탭 미표시
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 모바일 375px에서 가로 탭바가 화면 너비를 초과해 뒷 탭들이 잘림. 스크롤 가능 여부가 시각적으로 불분명.

### [M-04] breadcrumb가 '홈 › …'으로 표시됨 (데이터 로드 실패 시)
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** JSON 로드 실패 시 breadcrumb에 카테고리명 대신 '…'가 표시됨.

### [M-01] '오토/맥시멀'과 '4인 가족' 캠핑 스타일 카드가 동일한 URL
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션
- **URL:** https://www.gear-forest.com/
- **증상:** 두 카드 모두 `category.html?cat=auto-tent&sort=spec%3Afloor_area&sa=0&cap=4` 로 연결. 다른 컨셉임에도 URL이 동일하여 4인 가족 전용 필터가 없거나 URL 설정 누락으로 보임.

---

## 🟢 Low

### [L-19] 계정 삭제/탈퇴 기능 미존재 — 법적 의무 가능성
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 계정 삭제·서비스 탈퇴 UI 전혀 없음. 개인정보보호법 및 Google OAuth API 이용 정책상 계정 삭제 기능 요구.

### [L-20] 닉네임 설정/변경 UI 미존재
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 커뮤니티 로그에 닉네임이 사용되는 구조임에도 닉네임 설정·변경 입력 필드 없음. 최초 자동 생성 닉네임 변경 불가 상태.

### [L-21] account.html meta description 8자로 SEO 기준 미달
- **영역:** 계정/로그인 (SEO)
- **URL:** https://www.gear-forest.com/account.html
- **증상:** meta description이 '구글 로그인·찜 목록 동기화'(8자)로 권장 50~160자 기준에 크게 미달.

### [L-22] 비로그인 상태에서 찜 섹션 완전 은닉 — 기능 인지 불가
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** `#wish-section` 전체 `display:none` 처리. 비로그인 사용자가 찜 기능의 존재를 알 수 없으며 로그인 유도 CTA 없음.

### [L-17] 내한온도 스펙 값에 °(도) 기호 누락 — '-3C' 표시
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 스펙 테이블 내한온도 값이 '-3C'로 표시. 올바른 표기는 '-3°C'. 온도 값 있는 다른 상품도 동일 문제 가능성.

### [L-18] h1 태그에 브랜드명 누락 — 제품명만 표시
- **영역:** 상품 상세 (SEO)
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** h1이 '매직 100'만 표시, 브랜드명 '큐물러스'는 별도 `p.item-brand`에만 있음. 페이지 title('큐물러스 매직 100 — 침낭 스펙 비교')과 불일치.

### [L-16] 정렬 chip 버튼에 aria-pressed 속성 없음
- **영역:** 카테고리/목록 (접근성)
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** 활성 정렬 chip에 `on` 클래스는 붙지만 `aria-pressed` 속성 없음. 스크린 리더 사용자가 현재 선택된 정렬 상태 확인 불가.

### [L-23] 커뮤니티 페이지 JSON-LD 구조화 데이터 없음
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** `DiscussionForumPosting`, `BreadcrumbList` 등 schema.org JSON-LD 전무. 검색 결과 리치 스니펫 노출 기회 손실. ([L-13] 홈과 동일 패턴)

### [L-25] www·non-www 리다이렉트 동작이 경로마다 불일치
- **영역:** 커뮤니티/소셜 (SEO)
- **URL:** https://gear-forest.com/community.html
- **증상:** 일부 경로는 www→non-www, 일부는 non-www→www로 리다이렉트 방향이 혼재. canonical은 non-www로 통일되어 있으나 실제 리다이렉트 동작 불일치로 크롤링 일관성 저하. ([H-12] 근본 원인과 연관)

### [L-13] JSON-LD 구조화 데이터 없음 — 리치 스니펫 노출 불가
- **영역:** 홈/메인 (SEO)
- **URL:** https://www.gear-forest.com/
- **증상:** schema.org JSON-LD 전혀 없음. Google 검색 결과에서 사이트링크 검색박스·상품 카드 등 리치 스니펫 노출 불가.

### [L-14] search.json(298KB) 페이지 로드 시 즉시 선제 로딩
- **영역:** 홈/메인 (성능)
- **URL:** https://www.gear-forest.com/
- **증상:** 검색창 포커스 전에 `data/search.json` 298KB가 즉시 로드됨. 검색창 포커스 시점에 lazy load하는 것이 권장됨.

### [L-15] PWA manifest start_url 상대경로 설정 — www·non-www 불일치와 복합
- **영역:** 홈/메인 (PWA)
- **URL:** https://www.gear-forest.com/manifest.webmanifest
- **증상:** `start_url`이 `./index.html`(상대경로). [H-12] canonical non-www 불일치와 결합 시 PWA 설치 후 시작 URL·canonical·실제 서빙 URL이 3개로 분열될 수 있음.

### [L-10] 비로그인 상태에서 `#new` 직접 접근 시 안내 없이 피드로 redirect
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html#new
- **증상:** 비로그인 상태에서 `community.html#new` 직접 접근 시 아무 안내 없이 `location.hash = ''`로 피드로 돌아감. 사용자가 이유를 알 수 없음.

### [L-11] 모바일 탭바 '커뮤니티' 레이블이 '커뮤'로 잘림
- **영역:** 커뮤니티/소셜
- **URL:** https://www.gear-forest.com/community.html
- **증상:** 375px에서 `.bottom-nav` 커뮤니티 탭 레이블이 '커뮤'로 truncate. 다른 탭(홈/탐색/마이)은 정상 표시.

### [L-12] 데스크톱·모바일 nav 두 개가 DOM에 동시 존재 — 유지보수 부담
- **영역:** 커뮤니티/소셜 (전체 공통)
- **URL:** https://www.gear-forest.com/community.html
- **증상:** `.tabbar`(데스크톱)와 `.bottom-nav`(모바일) 두 nav가 DOM에 공존, CSS `display:none`으로 전환. 기능 추가 시 양쪽 모두 수정 필요.

### [L-08] 헤더에 계정/로그인 진입 경로 없음
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 헤더에 로고만 있고 계정 아이콘 없음. 하단 탭바('내 정보')로만 계정 진입 가능. 일반적인 웹 UX 패턴과 다름.

### [L-09] 소셜 로그인이 Google만 제공 (Kakao 없음)
- **영역:** 계정/로그인
- **URL:** https://www.gear-forest.com/account.html
- **증상:** 한국 서비스임에도 카카오 로그인 없음. 미지원 여부가 UI에 명시되지 않아 사용자 혼란 가능.

### [L-06] 빈 문자열로 검색 시 아무 피드백 없음
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 검색창에 아무것도 입력하지 않고 Enter를 눌러도 페이지 이동·오류 메시지·포커스 안내 모두 없음. 버튼이 동작하지 않는다는 오해 유발 가능.

### [L-07] 검색 결과 없음(no-results) 상태에서 대안 탐색 경로 미제공
- **영역:** 검색
- **URL:** https://www.gear-forest.com/
- **증상:** 매칭 없는 검색어(예: 'sleeping bag') 입력 후 Enter 시 결과 없음 메시지만 표시, 카테고리 탐색 유도나 추천 검색어 등 대안 경로 없음.

### [L-04] Cloudflare beacon.min.js 503 오류
- **영역:** 상품 상세 (전체 페이지 공통으로 추정)
- **URL:** https://www.gear-forest.com/item/backpacking-tent/item-52.html
- **증상:** 페이지 로드 시 Cloudflare Web Analytics beacon 스크립트가 503 반환. 분석 데이터 수집 불가.

### [L-05] 스펙 배지가 모두 '참고'로 표시 — 공식/비공식 구분 없음
- **영역:** 상품 상세
- **URL:** https://www.gear-forest.com/item/sleeping-bag/item-232.html
- **증상:** 스펙 테이블의 모든 행에 '참고' 배지만 표시되어 공식 측정값과 참고값 구분 불가. 사용자가 데이터 신뢰도 판단 어려움.

### [L-03] 상품 카드가 `<a>` 링크 없이 role=button으로만 구현 — 접근성 미흡
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=sleeping-bag
- **증상:** `.pli` 카드가 `role="button"`으로만 구현, 내부에 `<a>` 링크 없음. 스크린리더 사용자가 상품 링크로 인식하기 어렵고 새 탭으로 열기 불가.

### [L-01] 데스크톱에서 캠핑 스타일 그리드 5열에 카드 4개 — 빈 셀 발생
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션 (데스크톱)
- **URL:** https://www.gear-forest.com/
- **증상:** 데스크톱(1280px)에서 `.personas` 그리드가 5열로 계산되나 카드는 4개뿐이어서 마지막 열이 빈 공간으로 남아 불균형한 레이아웃.

### [L-02] 모바일에서 캠핑 스타일 카드 1열 세로 나열
- **영역:** 홈/메인 — 내 캠핑 스타일 섹션 (모바일)
- **URL:** https://www.gear-forest.com/
- **증상:** 모바일 375px에서 `.personas` 그리드가 단일 열로 렌더링되어 카드 4개가 세로로 쌓임. 2열 그리드가 더 자연스러운 UX.

### [L-28] 상품 상세 모달에 role="dialog"·aria-modal 없음
- **영역:** 카테고리/목록 — 상품 카드 모달
- **URL:** https://www.gear-forest.com/category.html?cat=backpacking-tent
- **증상:** 상품 카드 클릭 시 열리는 모달(`.pmodal`)에 `role="dialog"`, `aria-modal`, `aria-labelledby` 속성 없음. 스크린리더가 모달 진입을 인식하지 못함.
- **재현:** 카테고리 페이지에서 카드 클릭 → DevTools에서 `.pmodal` 속성 확인

### [L-26] Skip-to-content 링크 미존재 — 키보드/스크린리더 접근성 미흡
- **영역:** 홈/메인 (접근성)
- **URL:** https://www.gear-forest.com/
- **증상:** `<a href="#main" class="skip-to-content">` 등 메인 콘텐츠 바로가기 링크가 없어 키보드 사용자가 Tab으로 탐색할 때 상단 nav 전체를 순회해야 함. WCAG 2.4.1(G1) 준수 미흡.
- **재현:** 홈 접속 → Tab 키 반복 → 콘텐츠 바로가기 링크 없음 확인

### [L-27] 푸터에 법적 링크(개인정보처리방침·이용약관) 미존재
- **영역:** 홈/메인 — 공통 푸터
- **URL:** https://www.gear-forest.com/
- **증상:** 하단 푸터에 '개인정보처리방침', '이용약관' 링크가 없음. 국내 개인정보보호법·정보통신망법상 서비스 운영 시 필수 고지 항목.

---

*다음 회차: 상품 상세 (3순환)*
