# DEV-REQUIREMENTS — 개발요건 (단일 진실 공급원)

> **이 문서가 '개발요건'의 SSOT다.** 무엇을 만들지/고칠지는 여기서 관리한다.
> 인프라·배포·서버 사실은 [SSOT.md](SSOT.md), 버그 추적은 [bug-report.md](bug-report.md) 참조.
>
> 규칙:
> - 모든 요건은 **프론트엔드 / 백엔드** 범위로 나누어 기재한다. 두 범위에 걸치는 건 양쪽에 각각 쓰고 `↔`로 상대를 가리킨다.
> - 상태: `TODO` · `WIP` · `DONE` · `HOLD`(보류) · `DROP`(폐기)
> - 갱신 시 이 파일부터 고치고, 코드 수정 후 `stamp_version.py` 실행(배포 규칙).

---

## 0. 범위 정의 (Frontend ↔ Backend 경계)

| 범위 | 구성 | 책임 | 비고 |
|------|------|------|------|
| **프론트엔드** | `site/` 정적 자산 (HTML/`app.js`/`style.css`/`sw.js`) | 렌더링, 클라이언트 검색/필터, 위시·세트(localStorage), PWA, 소셜 UI | GitHub Pages 배포, `gear-forest.com` |
| **백엔드 A — 카탈로그 API** | `backend/` FastAPI + SQLite (`camping_tents500.db`) | 제품 검색·카테고리·매니페스트 제공 | Mac mini, `/api/*` (SSOT.md §2) |
| **백엔드 B — 소셜/계정** | `supabase/` (Postgres + Auth + Edge Functions) | 인증, 위시 동기화, 커뮤니티 글/댓글/좋아요, 푸시, 클릭이벤트 | RLS + GRANT (migrations 001~013) |
| **데이터 파이프라인** | `pipeline/` | 크롤→정규화→검증→별점→`site/data` 생성 | 빌드타임. 런타임 아님 |

> 카탈로그 데이터는 **빌드타임에 `site/data/*.json`으로 굳혀** 프론트가 정적으로 읽는 경로와, **백엔드 A FastAPI 실시간 조회** 경로 두 가지가 공존한다. 신규 요건은 어느 경로를 쓰는지 명시할 것.

---

## 1. 프론트엔드 개발요건

### 1-1. 카탈로그 / 탐색 (`index.html`, `category.html`, `app.js`)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| FE-CAT-01 | 허브(카테고리 네비 + 핫아이템) 렌더 | DONE | `renderHub`, `renderCatNav` |
| FE-CAT-02 | 홈 클라이언트 검색 + 자동완성 | DONE | `setupHomeSearch` (클라 인덱스) |
| FE-CAT-03 | 필터 칩(인원/별점/브랜드) + 활성 상태 표시 | DONE | |
| FE-CAT-04 | 필터 상태 **URL 직렬화**(공유·뒤로가기 복원) | TODO | STAGE2-PLAN M2 |
| FE-CAT-05 | 가격대 슬라이더 + 스펙 범위 슬라이더(무게≤X, 내수압≥X) | TODO | M2 |
| FE-CAT-06 | 빈 결과 시 가장 강한 제약 해제 제안 | TODO | M2 |
| FE-CAT-07 | 모바일 필터 바텀시트 | TODO | M3 |
| FE-CAT-08 | 품질 필터 토글(확정값만/데이터부족 제외) | TODO | M3 |
| FE-CAT-09 | **상품 리스트: 검색 입력 풀너비 + 개수표시를 정렬 줄로 이동** | TODO | ↓ 상세 스펙 |
| FE-CAT-10 | **'가성비순' 정렬 시 정의 설명 배너(삭제 가능)** | TODO | ↓ 상세 스펙 |

#### 상세 스펙 — 상품 리스트 검색바 레이아웃 (FE-CAT-09)
> 사용자 요청(2026-06-12). 대상: [category.html:62](site/category.html) `.toolbar` / `.sortchips`.

- **현재**: `.toolbar` 한 줄에 검색 입력(`#q`)과 개수(`#count`, 예 "300/300개")가 **나란히** 있어 검색 입력이 좌우 끝까지 못 감([category.html:63](site/category.html)).
- **목표**:
  1. **검색 입력(`#q`)을 컨테이너 좌우 끝까지 풀너비**로(같은 줄의 `#count` 제거로 확보).
  2. **개수 표시(`#count`)를 정렬 칩 줄(`.sortchips`/`#sortchips`)로 이동** — '정렬' 라벨·칩과 같은 div에 두고 우측 정렬 배치.
- **AC**: ① 검색 placeholder가 줄 좌우 끝까지 채워진다. ② "N/N개"가 정렬('기본/가격 낮은순/가성비순') 칩과 같은 줄에 표시된다. ③ 카운트 갱신 로직(필터/검색 변경 시 숫자 갱신)은 그대로 동작. ④ 모바일/데스크톱·다크모드에서 줄바꿈·겹침 없음.
- **구현 메모**: `#count`를 만드는 코드가 `.sortchips` 렌더([app.js:1332](site/app.js))와 분리돼 있으니, 카운트 갱신 셀렉터(`#count`)는 유지하되 **DOM 위치만 정렬 줄로** 옮기면 됨. `.sortchips` 렌더가 `innerHTML`로 덮어쓰므로 카운트 노드가 지워지지 않도록 주의.
- **비범위**: 백엔드 변경 없음. 순수 프론트(`category.html` + `app.js` + `style.css`).

#### 상세 스펙 — '가성비순' 정의 안내 배너 (FE-CAT-10)
> 사용자 요청(2026-06-12): 상품 목록 정렬에서 **'가성비순'** 선택 시, 이게 어떤 순서인지 알려주는 **삭제(닫기) 가능한 배너**를 노출.

- **배경**: '가성비순'은 내부적으로 **별점 ÷ 가격** 순([app.js:128](site/app.js))인데, 사용자에겐 기준이 불투명함.
- **목표**: '가성비순' 정렬이 활성일 때, 리스트 상단(정렬 줄 또는 활성필터 영역 부근)에 **설명 배너** 노출. 문구 예: "가성비순 = **별점 대비 가격**이 좋은 순으로 정렬돼요". **닫기(✕) 버튼**으로 삭제 가능.
- **닫힘 지속(권장)**: 한 번 닫으면 `localStorage`로 기억해 다시 뜨지 않게(예: `value_banner_dismissed`). PWA 배너·인트로 닫기 패턴과 동일.
- **표시 조건**: 정렬키가 '가성비순(value)'일 때만. 다른 정렬(기본/가격 낮은순/스펙)에서는 숨김.
- **AC**: ① '가성비순' 선택 시 정의 배너가 보인다. ② ✕로 닫으면 사라지고, (권장) 이후 세션에서도 다시 뜨지 않는다. ③ 다른 정렬로 바꾸면 배너가 노출되지 않는다. ④ 모바일/데스크톱·다크모드에서 겹침·잘림 없음.
- **비범위**: 백엔드 변경 없음. 순수 프론트(`category.html`/`app.js`/`style.css`). 정렬 알고리즘 자체는 불변(표시만 추가).

### 1-2. 제품 상세 / 비교 (`item/`, `brand.html`, `recommend.html`)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| FE-ITEM-01 | 제품 상세(전 지표·별점·정직성 배지) | DONE | 2,277 item 페이지 |
| FE-ITEM-02 | 비교 담기(2~4개 나란히) 모달 | DONE | `compare-modal` |
| FE-ITEM-03 | 쿠팡 파트너스 제휴 링크 슬롯 | WIP | ↔ 데이터: `coupang_links.csv`, AF6034597 |
| FE-ITEM-04 | 가격 이력 표시 | TODO | M4, ↔ BE-CAT |
| FE-ITEM-05 | **모든 가격 표기에 '최저가 기준' 명시**(전 화면 일관) | TODO | ↓ 상세 스펙 |

#### 상세 스펙 — '최저가 기준' 가격 표기 일관화 (FE-ITEM-05)
> 사용자 요청(2026-06-12): 모든 상품 **가격 표기 부분에 '최저가 기준'** 이라고 적을 것. 실제 쿠팡 가격이 다른 경우가 많아서.

- **배경**: 표시 가격은 `price_min`(최저가) 기준인데, 클릭해 들어간 쿠팡 실제가와 다를 수 있음. **상품 상세 모달엔 이미 안내 있음**([app.js:1548](site/app.js) `pmprice-note`: "제품은 최저가를 표기… 링크의 가격과 다를 수 있습니다") → **나머지 가격 표기에도 동일 취지 명시**.
- **적용 대상(가격이 노출되는 모든 곳)**:
  - 목록 카드 `.pli-price`([app.js:2015](site/app.js))
  - 비교 모달 가격([app.js:2108](site/app.js))
  - 추천 `.rp`([app.js:2202](site/app.js))
  - 최근 본 `.recard-p`([app.js:2294](site/app.js))
  - 위시/세트 목록 가격([app.js:2599](site/app.js), 2696)
  - 커뮤니티 인기장비 `.comm-gear-price`([app.js:2929](site/app.js))
  - (이미 적용) 상품 상세 모달 — 문구 톤 통일만 확인
- **방식(권장)**: 곳마다 긴 문장을 반복하면 지저분하므로 **짧은 라벨 "최저가 기준"**(예: 가격 옆 작은 회색 캡션/배지)로 통일하고, 상세 모달처럼 공간 여유 있는 곳만 "링크의 가격과 다를 수 있어요" 보조문구. 공통 헬퍼(예: `priceRange`/`won` 출력에 캡션 부착)로 한 곳에서 관리 권장.
- **AC**: ① 가격이 보이는 모든 화면에 '최저가 기준'이 인지된다. ② 카드 레이아웃이 깨지지 않게 짧게. ③ 다크모드·모바일 가독성 유지. ④ 가격 없음(`가격없음`/`—`) 항목엔 라벨 미표시.
- **비범위**: 가격 데이터/정렬 불변(표기만 추가). 백엔드 변경 없음. 순수 프론트(`app.js` + `style.css`).

### 1-3. 위시리스트 / 기어세트 (localStorage ↔ Supabase)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| FE-WISH-01 | 위시 추가/해제(localStorage) | DONE | `toggleWish`, `wishKey` |
| FE-WISH-02 | 로그인 시 위시 **Supabase 동기화** | DONE | ↔ BE-SOC-WISH |
| FE-WISH-03 | 기어세트(=장비 꾸러미) 생성/담기 | DONE | `newSet`, `addToSet` |
| FE-WISH-04 | 최근 본 상품 | DONE | `pushRecent` |
| FE-WISH-05 | **장비 꾸러미 담기 직후 2~3초 자동소멸 확인 모달** | DONE | `showSetConfirm` 카드(2.5s 자동소멸·hover 일시정지). `showSetToast` 대체 |
| FE-WISH-06 | **담은 장비 확인 루트**(모달→꾸러미 내용 이동·열람) | DONE | 카드 '꾸러미 보기'→`openSetDetail`(로그인·페이지 무관 모달 열람) |
| FE-WISH-07 | **내 세트 표: '가격' 제거 + 항목별 '구매 링크 버튼' 도입** | DONE | 세트 담을 때 `coupang_url` 저장(택1=①). `.set-buy` 버튼·클릭집계. ↔ FE-ITEM-03 |
| FE-WISH-08 | **'이 세트로 커뮤니티 로그 작성' 아카이브** | DONE(확인) | 이미 `COMMUNITY_ENABLED=false`로 숨김. ↓ 메모 |

#### 상세 스펙 — 장비 꾸러미 담기 확인 (FE-WISH-05 / FE-WISH-06)
> 사용자 요청(2026-06-12): "장비 꾸러미에 담았으면 **확인을 하는 루트**도 뚫어줘야 한다. 담자마자 **아주 잠깐(2~3초) 유지되는 모달** 형태."

- **트리거**: `addToSet()` 성공 직후(세트 선택/신규 생성 양쪽). 진입점은 `openSetModal`의 `showSetToast` 자리.
- **형태**: 화면 위에 잠깐 뜨는 **확인 모달/토스트형 카드**. **2.5초(2~3초) 후 자동 소멸**. 자동소멸 전 사용자가 닫거나(✕) 클릭하면 즉시 처리.
- **내용**: 담긴 세트명 + "N개 장비" + (선택) 누적 무게/가격 요약. 기존 `showSetToast`의 무게·가격 계산 로직 재사용.
- **확인 루트(핵심)**: 모달 안에 **"꾸러미 보기" 액션**을 둬, 누르면 해당 세트 내용으로 이동/열람. 목적지 후보 — `account.html`의 기어세트 섹션(`gear_set`) 또는 세트 상세 뷰. 자동소멸돼도 확인 경로가 끊기지 않도록 항상 도달 가능해야 함.
- **수용 기준(AC)**:
  1. 담기 직후 모달이 뜨고 사용자 조작 없이 2~3초 내 사라진다.
  2. 모달에서 한 번의 액션으로 방금 담은 꾸러미 내용을 확인할 수 있다.
  3. 모바일/데스크톱 모두에서 겹침·잘림 없이 표시된다(다크모드 포함).
- **비범위**: 백엔드 변경 없음(로그인 시 동기화는 기존 BE-SOC-SET 사용). 순수 프론트(`app.js` + `style.css`).

#### 상세 스펙 — 내 세트 표 개편 + 커뮤니티 로그 작성 아카이브 (FE-WISH-07 / FE-WISH-08)
> 사용자 요청(2026-06-12). 대상: 세트 상세 표 [app.js:2294](site/app.js).

**FE-WISH-07 — '가격' 제거 + 항목별 '구매 링크 버튼'**
- **현재**: 세트 표 컬럼이 **장비 / 무게 / 가격 / 수량**([app.js:2297](site/app.js))이고, 합계행에 총무게+**총가격**(`won(tp)`) 표시.
- **목표**: **'가격' 컬럼 제거**(합계행의 총가격 셀도 함께 제거). 대신 **항목별 '구매 링크 버튼'** 컬럼 신규 — 각 장비를 바로 구매처로 보냄. 무게·수량은 유지.
- **링크 소스(↔ FE-ITEM-03 / BE-CAT-07)**: 버튼은 해당 장비의 **쿠팡 파트너스 링크**로 연결. 단, 현재 세트 항목 객체(`{pcode,b,m,cap,s,p,img,weight_g,qty}`, [app.js:266](site/app.js))는 **`coupang_url`을 보관하지 않음** → ① 세트 담을 때 `coupang_url`(또는 해석용 `pcode`)을 함께 저장하도록 확장하거나, ② 버튼이 상품 상세로 보내 거기서 구매. **구현 전 택1 결정 필요**. 링크 없으면 '준비 중' 비활성 처리(상품 상세 `pmbuy` 패턴 재사용).
- **AC**: ① 세트 표에 '가격' 컬럼·총가격이 보이지 않는다. ② 각 행에 구매 버튼이 있고, 링크 보유 장비는 클릭 시 구매처로 이동(미보유는 비활성). ③ 무게·수량·합계무게는 그대로. ④ 다크모드·모바일에서 표가 깨지지 않는다.
- **비범위**: 가격 데이터 자체는 보존(표시만 제거). 클릭 집계(BE-SOC-CLICK)는 기존 패턴 따름(선택).

**FE-WISH-08 — '이 세트로 커뮤니티 로그 작성' 아카이브**
- **현황(확인됨)**: 해당 버튼(`#set-to-log-btn`, [app.js:2310](site/app.js))은 **이미 `COMMUNITY_ENABLED=false`로 렌더 제외**([app.js:415](site/app.js)). 커뮤니티 전반이 임시 숨김 상태라 별도 작업 없이 요건 충족.
- **유지 조건**: 커뮤니티 복구(`COMMUNITY_ENABLED=true`) 시 이 버튼도 함께 살아나므로, **세트→로그 동선만 따로 계속 숨기려면 별도 플래그가 필요**. 현재는 공통 플래그로 묶여 있음을 기록.
- **AC**: 세트 상세에 '이 세트로 커뮤니티 로그 작성' 버튼이 노출되지 않는다(현 상태 유지).

### 1-4. 소셜 / 계정 UI (`account.html`, `community.html`, `auth-callback.html`)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| FE-SOC-01 | 로그인/콜백/계정 화면 | DONE | ↔ BE-SOC-AUTH, `supabaseClient.js` |
| FE-SOC-02 | 커뮤니티 피드/글쓰기/이미지 첨부 | DONE | ↔ BE-SOC-POST |
| FE-SOC-03 | 댓글·좋아요 | DONE | ↔ BE-SOC migrations 006/009 |
| FE-SOC-04 | 닉네임(profiles 단일 진실) 표시 | DONE | ↔ BE-SOC-AUTH |
| FE-SOC-05 | 회원탈퇴 | DONE | ↔ BE-SOC `delete-account` 함수 |
| FE-SOC-06 | **'내 정보' 프로필 헤더 간소화**(가운데 띄움 → 컴팩트 표기) | TODO | ↓ 상세 스펙 |
| FE-SOC-07 | **'내 정보' 탭 구조 → 영역 나열(섹션) 형태로 변경** | TODO | ↓ 상세 스펙. KREAM식 |
| FE-SOC-08 | **닉네임 변경 기능**(최초 설정 후 재변경 UI) | TODO | ↓ 상세 스펙. 백엔드 `setNickname` 재사용 |
| FE-SOC-09 | **'내 로그'에 내가 남긴 상품 후기 추가** | TODO | ↓ 상세 스펙. ↔ BE-SOC-REVIEW |
| FE-SOC-10 | **'커뮤니티' 로그 아카이브**(일단 비활성, 복구 가능) | TODO | ↓ 상세 스펙. 플래그 방식 |

#### 상세 스펙 — '내 정보' 페이지 레이아웃 개편 (FE-SOC-06 / FE-SOC-07)
> 사용자 요청(2026-06-12, 참고 이미지: KREAM 마이페이지). 대상: [account.html](site/account.html).

**FE-SOC-06 — 프로필 헤더 간소화**
- **현재 문제**: 프로필 블록이 `max-width:360px; margin:0 auto`([account.html:314](site/account.html))로 **화면 가운데에 떠 있어** 아이디/이메일이 과하게 강조됨.
- **목표**: KREAM처럼 **좌측 정렬·컴팩트**하게. 아바타 + 닉네임 + 이메일을 한 줄로 간결히, 가운데 띄움 제거. 닉네임은 여전히 `profiles` 단일 진실(↔ FE-SOC-04).
- **AC**: ① 프로필이 가운데 정렬되지 않고 본문 좌측 기준으로 붙는다. ② 모바일/데스크톱에서 아바타·닉네임·이메일이 한 묶음으로 자연스럽게 보인다(다크모드 포함).

**FE-SOC-07 — 탭 → 영역 나열**
- **현재**: 찜목록/내 세트/내 로그가 **탭 바**(`#acc-tabs`, [account.html:53](site/account.html))로 분리, 한 번에 한 영역만 노출.
- **목표**: KREAM 마이페이지처럼 **각 영역을 한 화면에 나열**(스택/섹션 형태)해 탭 전환 없이 스크롤로 모두 확인. 각 섹션 헤더(❤️ 찜목록 / 🎒 내 세트 / 📝 내 로그)와 개수 배지 유지.
- **AC**: ① 탭 클릭 없이 세 영역이 순서대로 나열된다. ② 각 영역 제목·개수·빈 상태 안내가 유지된다. ③ 기존 렌더 로직(`renderAccount`/세트·로그 카운트) 재사용, 데이터 동작 불변.
- **비범위(공통)**: 백엔드 변경 없음. 순수 프론트(`account.html` + `app.js` + `style.css`).

#### 상세 스펙 — 닉네임 변경 (FE-SOC-08)
> 사용자 요청(2026-06-12). 대상: [account.html](site/account.html) 프로필 영역.

- **현재**: `setNickname`/`isNicknameAvailable`/`NICKNAME_RE`는 이미 존재하나([supabaseClient.js:78](site/supabaseClient.js)), **최초 로그인 시 강제 설정 모달**([account.html:195](site/account.html))로만 쓰임. 설정 이후 **변경 진입점이 없음**.
- **목표**: 프로필 영역에 **"닉네임 변경"** 액션(버튼/연필 아이콘)을 추가, 누르면 입력+중복확인 UI로 닉네임을 다시 정할 수 있게. 최초 설정 모달의 검증 흐름(형식·실시간 중복확인·확정)을 **그대로 재사용**.
- **백엔드(↔ BE-SOC-AUTH)**: 신규 API 불필요 — 기존 `profiles.update({nickname})` 경로 사용. **DB 트리거가 형식·금지어·중복(23505)·쿨다운을 최종 검증**하므로, 프론트는 그 에러를 사용자에게 친절히 표시만 하면 됨(특히 **쿨다운 거부** 메시지 처리 필수).
- **AC**:
  1. 로그인 사용자가 프로필에서 닉네임 변경 진입점을 찾아 변경할 수 있다.
  2. 변경 전 실시간 중복확인(✓/이미 사용 중)이 동작한다.
  3. 형식 위반·중복·**쿨다운**(너무 잦은 변경) 등 DB 거부 시 명확한 안내가 뜨고, 화면 닉네임이 깨지지 않는다.
  4. 변경 성공 시 프로필·이후 작성물 표시 닉네임이 즉시 갱신된다(`profiles` 단일 진실, ↔ FE-SOC-04).
- **비범위**: 아바타 변경은 별건. 신규 마이그레이션 불필요(쿨다운 트리거 미존재 시에만 BE 후속 검토).

#### 상세 스펙 — '내 로그' 재구성: 상품 후기 추가 + 커뮤니티 로그 아카이브 (FE-SOC-09 / FE-SOC-10)
> 사용자 요청(2026-06-12). 대상: [account.html](site/account.html) `#logs-section`.

**FE-SOC-09 — '내 로그'에 내가 남긴 상품 후기 추가**
- **현재**: `#logs-section`은 Supabase **posts(커뮤니티 글)** 만 나열([account.html:74](site/account.html)). 상품 **후기(`reviews` 테이블, [app.js:1604](site/app.js))** 는 상품 상세에서만 보이고 마이페이지에 모이지 않음.
- **목표**: '내 로그'에서 **내가 작성한 상품 후기**를 함께 볼 수 있게. 각 후기 항목은 대상 상품(이동 링크) + 별점 + 본문 + (있으면) 사진 썸네일을 표시.
- **백엔드(↔ BE-SOC-REVIEW)**: **내 후기 조회 쿼리 신규 필요** — `reviews`를 `user_id = 현재 사용자`로 필터(예: `getMyReviews()`). 기존 상품별 조회만 있으므로 함수 1개 추가. `reviews_select_public` RLS로 읽기는 이미 허용, 본인 글 식별만 추가. **신규 마이그레이션은 원칙적으로 불필요**(단, `reviews.user_id` 컬럼·인덱스 부재 시 BE 후속).
- **AC**: ① 내가 쓴 후기가 마이페이지 로그 영역에 최신순으로 나열된다. ② 각 후기에서 대상 상품으로 이동 가능. ③ 별점·사진·본문이 깨지지 않게 표시(다크모드 포함). ④ 후기 없을 때 빈 상태 안내.

**FE-SOC-10 — '커뮤니티' 로그 아카이브**
- **목표**: '내 로그'의 **커뮤니티 글(posts) 표시는 일단 아카이브**(비활성). 단, **삭제가 아니라 복구 가능한 플래그 방식** — GNB와 동일 패턴(`GNB_ENABLED=false`처럼 `COMMUNITY_LOG_ENABLED` 류 토글). 데이터·작성 기능은 유지, **마이페이지 노출만 끔**.
- **AC**: ① 마이페이지 '내 로그'에서 커뮤니티 글 목록이 노출되지 않는다. ② 플래그 한 줄로 즉시 복구 가능하고 기존 렌더 로직은 보존된다. ③ 커뮤니티 페이지 자체(글쓰기·열람)는 영향 없음.
- **순서 메모**: FE-SOC-09 적용 후 '내 로그'는 사실상 **상품 후기 로그**가 되고, 커뮤니티 글은 FE-SOC-10으로 가려진 상태가 된다.
- **비범위(공통)**: 커뮤니티 백엔드(BE-SOC-POST) 변경 없음. 후기 표시는 읽기 전용(작성 흐름은 기존 상품 상세 유지).

### 1-5. 플랫폼 / 비기능 (PWA·SEO·접근성)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| FE-PLT-01 | PWA(manifest, `sw.js`, 오프라인) | DONE | apex SW 고착 주의 (메모리) |
| FE-PLT-02 | SEO(sitemap, JSON-LD, favicon, OG) | DONE | L-13/L-52 등 |
| FE-PLT-03 | 다크모드 | DONE | `initTheme`, `setTheme` |
| FE-PLT-04 | 푸시 알림 구독 UI | WIP | ↔ BE-SOC-PUSH (migration 011) |
| FE-PLT-05 | 디자인 폴리시 · 접근성(a11y) 패스 | TODO | M5 |
| FE-PLT-06 | **홈 우상단 '마이' 아이콘을 GNB 아이콘으로 교체** | TODO | ↓ 상세 스펙 |

#### 상세 스펙 — '마이' 헤더 아이콘 통일 (FE-PLT-06)
> 사용자 요청(2026-06-12): 홈 화면 **우상단 '마이' 메뉴**의 아이콘을, 기존 **GNB에서 쓰던 아이콘**으로 바꿀 것.

- **현재**: [index.html:43](site/index.html) 헤더 `.header-acct`가 이모지 `👤` 사용. (`app.js`가 누락 페이지에 주입하는 동일 아이콘도 `👤`)
- **목표**: GNB(하단 탭바) '마이' 탭과 **동일한 라인 SVG 아이콘**(`SVG.profile` — [app.js:3295](site/app.js) 의 머리 원 + 어깨 곡선)으로 교체. 이모지 → 인라인 SVG.
- **적용 범위(중요)**: 헤더 '마이'가 노출되는 **모든 페이지** 일관 적용. ① `index.html` 등 HTML에 박힌 `.header-acct` 마크업, ② `app.js`가 누락 페이지에 주입하는 헤더 아이콘 코드 — **두 곳 모두** 교체해야 함(둘 중 하나만 바꾸면 페이지별 불일치).
- **수용 기준(AC)**:
  1. 홈 우상단 '마이' 아이콘이 GNB '마이' 아이콘과 시각적으로 동일하다.
  2. 전 페이지(홈/탐색/커뮤니티/계정/약관 등)에서 헤더 '마이' 아이콘이 일관된다.
  3. 다크모드·호버·`aria-label`("내 계정") 유지. 색은 `currentColor` 상속.
- **비범위**: 백엔드 변경 없음. 순수 프론트(`index.html`/공통 헤더 마크업 + `app.js` + `style.css`).

---

## 2. 백엔드 개발요건

### 2-A. 카탈로그 API (FastAPI / SQLite — `backend/`)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| BE-CAT-01 | `/health` 헬스체크 | DONE | `{"status":"ok","products":N}` |
| BE-CAT-02 | `/api/manifest` 카테고리 매니페스트 | DONE | `routers/categories.py` |
| BE-CAT-03 | `/api/category/{slug}` 카테고리 조회 | DONE | |
| BE-CAT-04 | `/api/search` 검색 | DONE | `routers/search.py` |
| BE-CAT-05 | rate limit(slowapi, `CF-Connecting-IP`) | DONE | SSOT.md §4-7 |
| BE-CAT-06 | 가격 이력 API | TODO | ↔ FE-ITEM-04 |
| BE-CAT-07 | 제휴 링크 필드 서빙 | WIP | ↔ FE-ITEM-03 |

### 2-B. 소셜 / 계정 (Supabase — `supabase/`)
| ID | 요건 | 상태 | 비고 / ↔ |
|----|------|------|----------|
| BE-SOC-AUTH | 인증 + `profiles`(닉네임 단일 진실) | DONE | migration 001/002 |
| BE-SOC-WISH | 위시리스트 동기화 테이블 + RLS/GRANT | DONE | migration 004 (GRANT 수동적용 필요) |
| BE-SOC-POST | 글/이미지/스냅샷 | DONE | 005/007/010 |
| BE-SOC-LIKE | 좋아요 | DONE | 006_post_likes |
| BE-SOC-SET | 기어세트 | DONE | 006_gear_sets |
| BE-SOC-CMT | 댓글 | DONE | 009_comments |
| BE-SOC-REVIEW | 상품 후기 + **내 후기 조회**(`user_id` 필터) | WIP | reviews 테이블(마이그 020). 목록·작성 DONE, `getMyReviews` 신규 필요 ↔ FE-SOC-09 |
| BE-SOC-CLICK | 클릭이벤트 수집 | DONE | 008_click_events |
| BE-SOC-RPC | top_gear_tags / hot_items RPC | DONE | 012/013 |
| BE-SOC-PUSH | 푸시 구독 + 발송 Edge Function | WIP | 011 + `send-push-notification`, ↔ FE-PLT-04 |
| BE-SOC-DEL | 회원탈퇴 Edge Function | DONE | `delete-account`, ↔ FE-SOC-05 |

> **운영 주의(메모리):** RLS만으로 부족 → migration 004 GRANT 수동 적용 필요. 상세는 [supabase/APPLY.md](supabase/APPLY.md).

### 2-C. 데이터 파이프라인 (`pipeline/` — 빌드타임)
| ID | 요건 | 상태 | 비고 |
|----|------|------|------|
| BE-PIPE-01 | 정규화→검증→별점→승격→`site/data` 생성(멱등) | DONE | `pipeline/run_all.py` |
| BE-PIPE-02 | packed_volume / lumens 파서 견고화 | DONE | REMAINING-WORK A1 |
| BE-PIPE-03 | 폴/액세서리 오분류 rejected 처리 | TODO | REMAINING-WORK A2 |
| BE-PIPE-04 | 미공개 지표 한계 라벨링 | DONE | LIMITS.md |
| BE-PIPE-05 | pending 1,073종 추가 수집→verified 승격 | HOLD | 재수집 필요 |

---

## 3. 교차 요건 추적 (Frontend ↔ Backend 페어)

| 기능 | 프론트 | 백엔드 | 상태 |
|------|--------|--------|------|
| 위시 동기화 | FE-WISH-02 | BE-SOC-WISH | DONE |
| 제휴 링크 | FE-ITEM-03 | BE-CAT-07 | WIP |
| 가격 이력 | FE-ITEM-04 | BE-CAT-06 | TODO |
| 푸시 알림 | FE-PLT-04 | BE-SOC-PUSH | WIP |
| 회원탈퇴 | FE-SOC-05 | BE-SOC-DEL | DONE |
| 내 후기 로그 | FE-SOC-09 | BE-SOC-REVIEW | TODO |

---

## 4. 갱신 이력
- 2026-06-12 최초 작성 — 현행 코드/마이그레이션 기준으로 FE/BE 요건 정리, SSOT 연결.
- 2026-06-12 FE-WISH-05/06 DONE — `showSetConfirm` 자동소멸 확인 카드 + '꾸러미 보기'→`openSetDetail` 확인 루트 구현(`app.js`/`style.css`). 로컬 프리뷰 AC1·2·3 검증, 콘솔 무에러.
- 2026-06-12 FE-WISH-07 DONE — 세트 상세 표에서 '가격'·총가격 제거, 항목별 쿠팡 구매 버튼(`.set-buy`) 도입. `setItem`에 `coupang_url` 저장(결정=①), 미보유 항목은 '준비 중' 비활성, 클릭 시 `click_events` 집계. 로컬 프리뷰 AC1~4 검증, 콘솔 무에러. (기존/찜일괄 세트 항목은 링크 없어 '준비 중' 폴백)
