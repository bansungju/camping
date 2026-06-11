# 장비의 숲 버그 리포트

> 자동 생성 · 매 10분 순회 · 코드 수정 없음  
> 마지막 업데이트: 2026-06-11

---

## 탐색 현황

| 회차 | 영역 | 탐색일시 | 발견 건수 |
|------|------|----------|-----------|
| 1 | 홈/메인 | 2026-06-11 | 5건 |
| 2 | 카테고리/목록 | 2026-06-11 | 7건 |

---

## 🔴 High (즉시 수정 필요)

### [H-01] 이번 주 인기 API (get_hot_items) 404 에러 — 하드코딩 fallback 노출
- **영역:** 홈/메인
- **URL:** https://www.gear-forest.com/
- **증상:** 페이지 로드 시 Supabase RPC `get_hot_items` 호출이 404 반환. '이번 주 인기' 섹션이 실제 데이터 대신 하드코딩된 4개 항목(백패킹텐트, 침낭, 버너, 랜턴)을 표시. 콘솔에 에러 노출.
- **재현:** https://gear-forest.com 접속 → 브라우저 콘솔 확인 → 'Failed to load resource: 404' 확인

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

### [H-05] 데이터 로드 실패 시 스켈레톤 카드 6개가 화면에 잔존
- **영역:** 카테고리/목록
- **URL:** https://www.gear-forest.com/category.html?cat=tent
- **증상:** JSON 로드 실패로 에러 메시지가 표시된 상태에서도 `.pli-skel` 스켈레톤 카드 6개가 시각적으로 남아 있음. aria-hidden=true 처리는 되어 있으나 에러 메시지 아래 회색 카드가 보임.

### [H-02] 카테고리 링크 클릭 시 JS·CSS·manifest 404 — 페이지 렌더링 불가
- **영역:** 홈/메인 → 카테고리 링크
- **URL:** https://www.gear-forest.com/category/backpacking-tent
- **증상:** 홈 카테고리 카드가 `category/backpacking-tent` 형식(구 SPA-like URL)을 사용. 해당 URL 직접 접근 시 `category/app.js`, `category/style.css`, `category/manifest.webmanifest` 모두 404 또는 MIME 오류. `renderCategory is not defined` ReferenceError 발생, 카테고리 목록 표시 안 됨.
- **재현:** 홈에서 카테고리 카드 클릭 → 빈 페이지 + 콘솔 에러 확인
- **참고:** `fix(routing)` 커밋에서 `category.html?cat=` 방식으로 전환했으나 홈 카테고리 그리드 링크가 아직 구 경로 형식 사용 중

---

## 🟡 Medium

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

---

*다음 회차: 카테고리/목록 페이지*
