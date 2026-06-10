# 소셜 기능 설계서 — 로그인 · 리뷰 · 커뮤니티

> 작성 2026-06-10 · 상태: **설계 단계(구현 전)** · 결정: 백엔드=Supabase / 로그인=카카오+구글
> 참고: camfit "캠핑로그"(캠핑 경험 사진+후기 인스타형 피드)
> 원칙 계승: **측정 데이터(스펙)와 주관 데이터(UGC)를 절대 섞지 않는다.** 카탈로그의 "측정값만·추측금지" 정직성은 그대로.

---

## 0. 핵심 전제 — 정적 → BaaS 전환

현재: `site/`만 GitHub Pages에 올리는 **순수 정적 PWA**(백엔드 0, 정적 JSON을 app.js가 읽음).
세 기능은 전부 "사용자가 쓰고 저장"이라 **인증+DB+이미지 저장**이 필수.

**결정: 프론트는 Pages 정적 유지 + Supabase(BaaS) 추가.**
- 카탈로그(읽기전용): 지금처럼 pipeline → 정적 JSON → Pages. **변경 없음.**
- UGC(쓰기): Supabase(Postgres + Auth + Storage)를 app.js에서 `@supabase/supabase-js`로 호출.
- → 정적 배포 워크플로(pages.yml) 그대로, 백엔드만 외부 BaaS로 분리. 서버 운영 부담 최소.

```
[브라우저]
  ├─ 카탈로그 읽기 ── GitHub Pages 정적 JSON (pipeline 산출, 측정데이터)
  └─ 로그인/리뷰/글 ── Supabase API (Postgres·Auth·Storage, 주관데이터)
```

---

## 1. 데이터 경계 — 두 세계를 잇는 단 하나의 키

- 카탈로그 제품은 SQLite→JSON에 있고, Supabase엔 제품 테이블을 **복제하지 않음**(이중 진실원 금지).
- 리뷰·커뮤니티가 제품을 참조할 땐 **`danawa_pcode`(제품 고유 provenance 키)** 만 외래키처럼 사용.
  - 이유: pcode는 pipeline 전 과정에서 안정적 식별자(이미 products.danawa_pcode). 제품이 재수집돼도 불변.
  - Supabase `reviews.product_pcode` → 프론트가 제품 상세 열 때 `WHERE product_pcode=?`로 조회.
- **[결정 #1] pcode를 정적 JSON에 포함**: `export_site.py`가 각 제품 JSON 객체에 `danawa_pcode` 필드를 반드시 출력해야 함. 현재 미포함 → S2 구현 전 선행 작업. 프론트는 `product.danawa_pcode`를 리뷰 INSERT 시 `product_pcode` 필드로 전달.
- **[결정 #2] 리뷰 UNIQUE 단위는 카드(canonical_model)**: 같은 제품 카드에 묶인 variant들(색상·용량)이 pcode가 여러 개여도 리뷰는 카드 1개당 1개. `reviews.product_pcode`는 카드의 **대표 pcode**(`primary_pcode`) 사용. export 시 카드별 `primary_pcode` 필드 추가.
  - **[결정 #L2-1] primary_pcode 결정 방식**: `export_site.py`의 카드 대표 row는 `MIN(p.id)`로 뽑는다. products 테이블에 별도 `primary_pcode` 컬럼 추가 대신, export_site가 `MIN(id)` 행의 `danawa_pcode`를 `primary_pcode`로 출력하고 이를 JSON에 명시. 향후 product → promote 단계에서 `is_primary=1` 플래그 추가 권장(장기 개선). 지금은 MIN(id) 규칙 문서화로 일관성 확보.
- **[결정 #3] 고아 pcode 처리**: 파이프라인 재실행으로 pcode가 변경/삭제되면 → 프론트는 해당 pcode를 조회할 제품을 못 찾음 → 리뷰 상세에 "단종 또는 재분류된 제품" 라벨 표시 후 내용은 보존. 리뷰 집계 API에서 고아 pcode는 카드 집계에서 제외. 파이프라인 `export_site.py`에 `retired_pcodes[]` 필드 추가 권장.
- **집계 표시 분리**: 제품 카드에 "⭐스펙 별점(측정)"과 "👤사용자 평점(리뷰 평균)"을 **별도 라벨·별도 영역**으로. 추천 정렬·순위는 **지금처럼 스펙 기준만**. 리뷰는 추천 로직에 절대 안 들어감(NEXT-PLAN "취향 기반(측정 아님)" 패턴).
- **[결정 #9] 리뷰 0개 빈 상태 표시 규칙**: 리뷰 0개인 제품 카드에는 사용자 평점 배지를 **표시하지 않음**(빈 공간 ≠ 0점). 리뷰 N≥1이면 "👤4.2(12명)" 형식으로 표본 수 포함 표시. N<3이면 별점 평균 대신 "👤리뷰 N개" 텍스트만(표본 불충분). 이 규칙이 정직성 원칙 수호.

---

## 2. 기능 1 — 로그인 / 회원가입

### 수단
- **카카오 + 구글** (둘 다 Supabase Auth 네이티브 OAuth 지원). 이메일/비번 미채택(비번관리 부담·전환율↓).
- 사전작업: 카카오 개발자센터 앱 + 구글 클라우드 OAuth 클라이언트 등록 → Supabase Auth Provider에 키 입력 → redirect는 Supabase 콜백 URL.

### 흐름
1. "카카오로 시작" 클릭 → Supabase `signInWithOAuth({provider:'kakao'})` → 카카오 동의 → 콜백 → 세션(JWT) 발급.
2. 최초 로그인 시 `profiles` row 자동 생성(트리거: auth.users INSERT → profiles INSERT).
3. **[결정 #5] 최초 로그인 시 닉네임 강제 설정**: `profiles.nickname`이 비어 있거나 카카오 원본값인 경우 → 닉네임 설정 모달 강제 노출 후 UGC 기능 진입 허용. 기본값 제안은 랜덤 캠퍼 핸들(`캠퍼_XXXX` 형식). 카카오 실명이 공개 피드에 노출되는 개인정보 사고 방지(PIPA 준수).
4. **[결정 #L2-5] 닉네임 모달 체크 위치**: `supabaseClient.js`(공통 모듈)의 `initAuth()` 함수에서 처리. index.html, community.html 등 **모든 페이지**가 이 모듈을 로드하므로 어느 URL로 진입해도 닉네임 체크 발동. 페이지별 중복 구현 없이 한 곳에서 관리. 닉네임 NULL 방어선은 RLS(INSERT시 body NULL 방지)도 추가.
4. **[결정 #10] OAuth 계정 연동(Account Linking) 활성화**: Supabase Auth 설정에서 `autolink` 켜기 — 동일 이메일의 카카오/구글 계정을 같은 `auth.users` 행에 연결. 카카오로 쓴 리뷰를 구글로 로그인해도 본인 것으로 인식. 미설정 시 계정 분열 → 리뷰 소유권 버그.
5. 세션은 supabase-js가 로컬에 보관, app.js가 로그인 상태에 따라 UI 분기(로그인/프로필/로그아웃).
6. **[결정 #4] 오프라인 UGC 차단**: `navigator.onLine === false` 또는 Supabase 클라이언트 오류 시 리뷰 작성·커뮤니티 글쓰기 버튼 disabled + "오프라인 상태에서는 작성할 수 없어요" 안내. 카탈로그 탐색은 기존 캐시 전략 그대로. 오프라인 상태에서 저장 실패를 사용자가 모르는 데이터 유실 버그 방지.

### 데이터: `profiles`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id (PK) | uuid | = auth.users.id |
| nickname | text | 최초 소셜 닉네임, 변경 가능. **UNIQUE 인덱스 필수** |
| avatar_url | text | 소셜 프로필 or 업로드 |
| created_at | timestamptz | |
| nickname_changed_at | timestamptz | 마지막 닉네임 변경 시각(쿨다운 판정용) |
| role | text | 'user' / 'admin'(모더레이션) |

```sql
CREATE UNIQUE INDEX idx_profiles_nickname ON profiles(nickname);
```

**[결정 #L3-2] 닉네임 변경 규칙:**
- UNIQUE 제약 필수 — 동일 닉네임 중복 계정 → 사칭 방지
- 변경 횟수: **30일 쿨다운** (nickname_changed_at 기준). 무제한 변경은 신고 이후 닉네임 교체로 모더레이션 추적 회피 가능
- 해제된 닉네임은 30일 후 타인 선점 가능 (별도 reserved 테이블 불필요)
- profiles UPDATE RLS가 nickname_changed_at < now() - interval '30 days' 조건 포함
- 최초 설정(null → 값)은 쿨다운 적용 안 함

### 정직성/프라이버시
- 수집 최소화: 이메일·닉네임·아바타만. 민감정보 안 받음.
- 로그인은 **리뷰/커뮤니티 작성에만 요구**(카탈로그 탐색·비교는 비로그인 그대로 — 진입장벽 낮춤).

---

## 3. 기능 2 — 상품별 리뷰

### 개념
- 제품 상세(모달/페이지)에 사용자 리뷰. **측정 스펙과 분리된 주관 평가.**
- 구매 인증 불가(커머스 아님) → **"실사용 인증 없음"을 정직하게 명시**(가짜리뷰 호도 방지 = 너 철학).

### 데이터: `reviews`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id (PK) | uuid | |
| product_pcode | text | 카드의 primary_pcode(위 결정 #2). 외래키 아님, 논리참조 |
| user_id | uuid | → profiles |
| rating | int (1~5) | 사용자 별점(스펙별점과 무관) |
| body | text | 후기 본문 |
| images | text[] | Storage 경로(선택) |
| created_at / updated_at | timestamptz | |
- 제약: **유저당 카드당 1리뷰**(UNIQUE(product_pcode, user_id)) — primary_pcode 기준이므로 variant 우회 불가.
- **[결정 #8] Storage 버킷 정책**: `review-images` 버킷 **public** 설정, 단 오브젝트 경로는 `{user_id}/{uuid}.{ext}` 형식(추측 불가한 UUID). 삭제된 리뷰의 이미지는 Storage cleanup 함수(또는 Edge Function)로 제거. Signed URL 불필요 → 성능 부담 없음. 업로드 제한: 최대 5MB, jpg/png/webp만 허용, 클라이언트 리사이즈 후 업로드.

### 표시
- 제품 상세: 평균 사용자평점 + 리뷰수 + 리스트(**최신순만 V1**). **스펙 별점과 시각적으로 분리**.
- **[결정 #L2-7] 도움순 정렬 V2로 명시 defer**: V1에서는 최신순만 제공. "도움순"을 위한 `review_helpful(review_id, user_id)` 테이블은 V2에서 추가. V1 구현 시 도움순 UI 버튼 미노출 — 있을 것 같은 기능을 스키마 없이 카운터만 추가하는 실수 방지.
- 카드(목록): "👤4.2(12)" 작게 — 단, **정렬·추천에는 미반영**(배지만).

### 모더레이션/스팸
- 로그인 필수(소셜=봇 억제). 작성 rate-limit(예: 분당 N).
- 신고 버튼 → `reports` 큐 → admin 검토. 욕설 필터(클라 1차).
- RLS: 누구나 읽기 / 본인 것만 수정·삭제 / admin 전체.

---

## 4. 기능 3 — 커뮤니티 (캠핑로그형)

### 개념 (camfit 캠핑로그 참고)
- 캠핑 경험을 **사진+글**로 공유하는 피드. 자유 주제(장비·장소·요리·후기).
- 인스타형: 피드(최신/인기) → 글 상세 → 좋아요·댓글. 태그·프로필.

### 데이터
**`posts`**
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id (PK) | uuid | |
| user_id | uuid | → profiles |
| title | text | |
| body | text | |
| images | text[] | Storage |
| tags | text[] | 자유태그(#백패킹 #차박) |
| product_pcodes | text[] | (선택) 글에 언급된 장비 → 카탈로그 연결(크로스셀) |
| like_count | int | 비정규화 카운트(트리거 갱신) |
| created_at | timestamptz | |

**`comments`**: id, post_id→posts, user_id, body, created_at

**`likes`** — [결정 #7] 완전 스키마 확정:
```sql
CREATE TABLE likes (
  post_id    uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)   -- UNIQUE 좋아요 보장
);
-- 트리거: likes INSERT → posts.like_count +1
--          likes DELETE → posts.like_count -1
```
RLS: SELECT 전체, INSERT/DELETE 로그인+본인. like_count는 트리거로만 갱신(클라 직접 쓰기 불가).

**`reports`** — [결정 #L2-4] 완전 스키마 확정:
```sql
CREATE TABLE reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_type text CHECK (target_type IN ('post','comment','review')),
  target_id   uuid NOT NULL,
  reason      text NOT NULL,
  status      text DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (target_type, target_id, reporter_id)  -- 동일 대상 중복 신고 방지
);
```
RLS: SELECT/UPDATE = admin만, INSERT = 로그인 사용자.

### 피드/UX
- 홈에 "캠핑로그" 탭 신설(또는 별도 페이지 `community.html`).
- 정렬: 최신 / 인기(like_count·기간). 무한스크롤(페이지네이션).
- **[결정 #L2-3] 피드 페이지네이션 방식**:
  - **최신순**: `created_at` keyset cursor. `.lt('created_at', lastCursor).order('created_at', {ascending:false}).limit(20)`. 중복 없음.
  - **인기순**: `like_count DESC + created_at DESC` 복합 cursor → Supabase RPC 함수로 구현. `postgrest .gt()` 체이닝은 OR 조건 표현 불가이므로 `SELECT ... WHERE (like_count, created_at) < ($last_like_count, $last_created_at)` SQL을 RPC로 래핑. offset/limit 금지(like_count 실시간 변동으로 중복·누락 발생).
- 글에 장비 태그 → 그 제품 카드로 점프(**커뮤니티↔카탈로그 선순환**, P1-B 쿠팡 전환에도 기여).
- **[결정 #L3-4] product_pcodes[] 태그 UX:**
  - 글 작성 UI에 **제품 태그 검색창** — `canonical_model` 기준 클라이언트 사이드 검색(이미 로드된 정적 JSON 재사용, 별도 API 불필요).
  - **최대 5개**까지 태그 가능. 배열 길이 초과 시 클라에서 차단.
  - 글 상세 렌더링: `product_pcodes[]` → 정적 JSON에서 `primary_pcode` 매핑 → 제품 카드 미니 위젯 표시.
  - 단종/고아 pcode는 "단종된 제품" 라벨로 표시(리뷰와 동일 처리).
- 프로필 페이지: 그 유저의 글·리뷰 모아보기.

### 이미지
- Supabase Storage 버킷(`post-images`, `review-images`). 업로드 크기·확장자 제한, 용량 관리.
- **[결정 #L3-3] 클라이언트 리사이즈 구현 확정:**
  - 기준: **장변 1280px, WebP 변환**, 품질 0.85. 파일 크기 5MB 초과 시 업로드 거부.
  - 라이브러리: `browser-image-compression` (gzip 5KB). Canvas API 직접 구현 대신 라이브러리로 EXIF 회전 포함 처리.
  - EXIF 회전 처리 포함(`imageCompression({ useWebWorker: true })`) — iOS 세로 사진 눕힘 버그 방지.
  - 업로드 중 실패: Storage.upload() 반환 에러 시 이미 업로드된 파일을 `storage.remove()`로 즉시 정리(클라 책임). INSERT는 업로드 완전 성공 후에만 실행.
- **[결정 #L2-6] posts 이미지 orphan 정리**: posts DELETE 시 → Supabase Database Webhook → Edge Function `cleanup-post-images`가 `images[]` 경로를 `supabase.storage.remove()`로 일괄 삭제. 글 수정(UPDATE) 시 클라이언트가 제거된 이미지를 비교해 직접 `storage.remove()` 호출(클라이언트 책임). ON DELETE CASCADE는 DB 행만 정리, Storage는 별도 처리 필수.

### 모더레이션
- 신고 큐 + admin 역할. RLS: 읽기 공개 / 쓰기·수정 본인만.
- 첫 출시엔 사후신고 방식(사전검수 X) + 명백 스팸 차단 룰.
- **[결정 #L3-5] admin 패널 V1 = Supabase Dashboard SQL 직접 처리.**
  - 솔로 운영에서 admin.html 조건부 렌더링 패널 구현 비용이 크므로 V1은 Supabase Dashboard에서 service_role로 `UPDATE reports SET status='reviewed'` 직접 실행.
  - RLS의 `reports UPDATE = admin` 정책은 프론트용이나 Dashboard는 RLS bypass → 실질적으로 dead code. V2에서 admin.html 패널 추가 시 활성화.
  - V2 admin.html: 로그인 user의 role='admin'이면 신고큐 테이블 표시 + 처리 버튼. 해당 페이지는 GitHub Pages에 포함하되 일반 링크 미노출.

---

## 5. RLS(행수준보안) 정책 요약

| 테이블 | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| profiles | 전체 | 트리거(자동) | 본인(role 컬럼 제외) |
| reviews | 전체 | 로그인+본인 | 본인 / admin |
| posts | 전체 | 로그인+본인 | 본인 / admin |
| comments | 전체 | 로그인+본인 | 본인 / admin |
| likes | 전체 | 로그인+본인 | 본인(DELETE만) |
| reports | admin | 로그인 | admin |

→ Supabase RLS로 "본인 데이터만 쓰기"를 DB레벨에서 강제(클라 우회 불가).

**[결정 #6] profiles.role 컬럼 변경 차단**:
```sql
-- profiles UPDATE 정책: nickname, avatar_url만 허용. role 변경은 막음.
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
-- admin 부여는 서비스롤 키(백엔드/Supabase Dashboard)로만 가능.
```
이 정책 없이 `profiles UPDATE` 허용 시 사용자가 `SET role='admin'`으로 권한 상승 가능.

---

## 6. 프론트 통합 (app.js 변경 범위)

- `@supabase/supabase-js` CDN 추가, `supabaseClient.js`(URL+anon key) 신설. anon key는 공개키라 정적노출 OK(보안은 RLS가 담당).
- **[결정 #L2-5] 공통 `initAuth()` 모듈**: `supabaseClient.js`에 `initAuth()` 함수를 두고 모든 HTML 파일이 `<script type="module">` import. 세션 체크 + 닉네임 모달 트리거를 한 곳에서 처리.
- 신규 화면: 로그인 버튼/모달, 프로필, 리뷰 섹션(제품상세), 커뮤니티 피드/작성/상세.
- 기존 카탈로그 코드는 **그대로**(읽기전용 정적 JSON) — UGC는 별 모듈로 격리.
- **[결정 #L2-2] sw.js↔Supabase 세션 충돌 방지**:
  - sw.js의 `url.origin !== location.origin` 조건에 의해 Supabase API(*.supabase.co)는 서비스워커가 가로채지 않음 → Supabase 요청은 항상 네트워크 직행(설계 의도와 일치).
  - 서비스워커 새 버전 activate + `clients.claim()` 시점에 기존 탭의 Supabase 세션이 유실될 수 있음 → `supabase.auth.onAuthStateChange()` 리스너를 `supabaseClient.js` 초기화 시 등록하여 세션 변화 감지 및 UI 재동기화. SW 업데이트 이벤트(`controllerchange`) 시 `location.reload()` 호출로 완전 재초기화.
  - 카탈로그 JSON은 기존 캐시전략(cache-first) 유지. UGC API는 캐시 안 함.

---

## 7. 단계별 로드맵 (인증이 토대)

| 단계 | 범위 | 선행 |
|---|---|---|
| **S1** | Supabase 프로젝트·스키마·RLS 셋업 + 카카오/구글 로그인 + profiles | — |
| **S2** | 상품 리뷰(작성/표시/신고) + 스펙별점과 분리 표시 | S1 |
| **S3** | 커뮤니티 피드(글·사진·댓글·좋아요·태그) + 프로필 | S1 |
| **S4** | 모더레이션 도구(admin 신고큐) + 장비태그↔카탈로그 연결 | S2·S3 |

→ S1(인증)이 리뷰·커뮤니티 둘 다의 전제. 리뷰가 커뮤니티보다 작아 먼저 권장.

---

## 8. 리스크 / 열린 질문

- **가짜리뷰·스팸**: 커머스 아님 → 구매인증 불가. "실사용 미인증" 명시 + 소셜로그인 + rate-limit + 신고로 완화. (완전 차단은 불가, 정직 표기로 대응)
- **비용**: Supabase 무료티어(50k MAU·500MB DB·1GB Storage) — 초기 충분. 이미지 트래픽이 변수 → 리사이즈·CDN 고려.
- **모더레이션 인력**: 솔로 운영 → admin 신고큐 최소구현, 자동필터 보강.
- **정직성 회귀 감시**: 리뷰 별점이 실수로 추천 로직/스펙별점에 새어들지 않는지 = 기존 적대 루프에 "UGC↔측정데이터 분리" 검증 항목 추가 권장.
- **카탈로그-UGC 일관성**: 제품이 재수집으로 pcode 바뀌거나 단종되면 리뷰 고아화 → pcode 안정성 점검(현재 pcode는 안정적이나 모니터링).
- **쿠팡 수익화(P1-B)와의 시너지**: 커뮤니티 장비태그 → 제품 → 쿠팡 링크 동선. 소셜이 P1-B 전환을 키울 수 있음.
- **[결정 #L3-6] 알림 시스템 — 명시적 결정:**
  - **V1: 알림 없음** (명시적 결정. 묵시적 누락 아님). supabaseClient.js에 channel 구독 없음 → 현재 스키마 영향 없음.
  - V2: Supabase Realtime(Postgres Changes)로 앱 내 알림 배지(탭 포커스 시 조회). comments/likes 테이블 스키마 변경 불필요.
  - V3: Web Push VAPID + Edge Function → PWA 홈 화면 설치 사용자 대상 푸시 알림. VAPID 키 설정 필요.
  - V1→V2 전환 시 supabaseClient.js에 `supabase.channel()` 추가만으로 가능(기존 코드 비파괴).

---

## 9. 다음 액션 (승인 후)

1. **Supabase 프로젝트 생성** + 스키마 SQL 마이그레이션.
2. **카카오 OAuth 셋업** — [결정 #L3-1] 주의 사항:
   - 카카오 개발자센터: 앱 생성 → Redirect URI 등록 → **비즈 앱 전환 심사** (사업자등록증 또는 개인정보처리방침 URL 필요. 미전환 시 테스터 계정만 로그인 가능 — 일반 사용자 전원 차단)
   - 개인정보처리방침 페이지(`/privacy.html`)를 GitHub Pages에 먼저 배포 후 카카오 심사 제출
3. **구글 OAuth 셋업** — OAuth 동의화면을 **"프로덕션 게시"** 상태로 변경(테스트 상태: 100명 한도 + 7일 갱신). Google Cloud Console → OAuth 동의 화면 → 앱 게시.
4. S1 로그인 PoC(버튼→소셜→세션→profiles) 구현.
5. export_site.py에 `danawa_pcode`(primary_pcode) 필드 추가 (S2 선행 작업).

> 본 문서는 설계까지. 구현은 단계 승인 후 진행.

---

## 10. 결정 로그 — 루프1 (2026-06-10)

서브에이전트 적대 질문 10건 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| 1 | schema | `export_site.py`에 `danawa_pcode` 필드 추가 — S2 선행 작업 |
| 2 | schema | 리뷰 UNIQUE 단위 = 카드(primary_pcode). variant 우회 불가 |
| 3 | schema | 고아 pcode → 리뷰 내용 보존, "단종/재분류" 라벨 표시 |
| 4 | auth | 오프라인 상태 UGC 버튼 비활성화(navigator.onLine 체크) |
| 5 | auth | 최초 로그인 시 닉네임 강제 설정 모달. 실명 자동 공개 방지 |
| 6 | security | profiles UPDATE RLS에서 role 컬럼 변경 차단(WITH CHECK) |
| 7 | community | likes 테이블 완전 스키마 확정(PK 복합, 트리거로 like_count) |
| 8 | review | Storage 버킷 public + UUID 경로. Signed URL 불필요 |
| 9 | ux | 리뷰 0개 → 배지 미표시. N≥3부터 평균 별점 표시(표본 수 포함) |
| 10 | auth | OAuth autolink 활성화. 카카오+구글 동일 이메일 = 동일 계정 |

---

## 11. 결정 로그 — 루프2 (2026-06-10) — 서브에이전트 적대 검토 2차

서브에이전트 18개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L2-11 | 보안/인프라 | Rate-limit 3계층: 리뷰=DB UNIQUE, 커뮤니티글=하루 20개 트리거, 댓글=Edge Function+Upstash Redis 분당 10회 |
| L2-12 | 스키마 | `comments`에 `parent_id uuid REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL` 미리 추가(UI 미노출). 중첩 1단계 고정 |
| L2-13 | UX/데이터 | 다중 이미지 업로드: `Promise.allSettled` 롤백 함수 명세 + 주 1회 pg_cron orphan cleanup 배치 |
| L2-14 | 스키마/UX | 닉네임 중복: debounce 300ms 실시간 조회 + `23505` 에러 공통 핸들러를 `supabaseClient.js`에 |
| L2-15 | 정직성 | `review_history(review_id, old_body, old_rating, edited_at)` 테이블 추가. UPDATE 트리거 자동 기록. "수정됨" 라벨 표시 |
| L2-16 | UX | 커뮤니티 글 삭제 = 소프트 삭제(`deleted_at` 컬럼). 30일 후 pg_cron 물리 삭제 + 이미지 cleanup 연동 |
| L2-17 | SEO/UX | 프로필 URL = `/community.html?profile={nickname}`. not found 시 "변경/탈퇴 사용자" 안내 |
| L2-18 | 기능 | `posts` 테이블에 `tsvector` GIN 인덱스 추가(`simple` 사전). 태그는 자동완성 정규화(DISTINCT 조회) |
| L2-19 | 비용/인프라 | Realtime 미사용. 좋아요 = 응답 후 업데이트(낙관적 업데이트 금지). like_count는 집계 쿼리로 보완 |
| L2-20 | 법률/운영 | PIPA 탈퇴: 프로필 즉시 익명화 + `delete-account` Edge Function으로 `auth.users` 삭제. 리뷰·글 내용 보존 + user_id NULL화 |
| L2-21 | 보안 | Storage `review-images`/`post-images` 버킷 LIST 권한 admin 전용. GET만 public |
| L2-22 | 보안 | 모든 UGC = `textContent` 렌더링(innerHTML 금지). 마크다운 시 DOMPurify. `product_pcodes[]` 렌더링 전 정적 JSON whitelist 검증 |
| L2-23 | 데이터 정합성 | `like_count` 트리거 불일치 복구: 주 1회 pg_cron 보정 쿼리(`UPDATE posts SET like_count = (SELECT COUNT(*) FROM likes WHERE post_id = posts.id)`) |
| L2-24 | UX | 좋아요 클릭 시 버튼 즉시 disabled → 응답 후 enabled 복원. 실패 시 토스트. 낙관적 업데이트 미사용 |
| L2-25 | 운영/법률 | 신고 N≥5 누적 시 `posts.hidden = true` 자동 소프트 숨김 트리거. admin 검토 후 복원/삭제 확정 |
| L2-26 | 정직성 | UGC→카탈로그 정렬 역류 금지: 코드리뷰 체크포인트에 명시. 리뷰 N=3 도달 시 툴팁에 "표본 3개 이상 기준" 근거 표시 |
| L2-27 | 스키마 | `posts`에 `updated_at timestamptz DEFAULT now()` 추가 + UPDATE 트리거. `comments`도 동일 |
| L2-28 | 구현 함정 | OAuth 콜백 후 원래 페이지 복원: 로그인 시작 전 `sessionStorage.setItem('redirect_after_login', location.href)`. `onAuthStateChange`에서 꺼내 `location.replace()` |

### 스키마 보완 사항 (루프2 반영)

**`comments` 수정**:
```sql
ALTER TABLE comments ADD COLUMN parent_id uuid REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE comments ADD COLUMN updated_at timestamptz DEFAULT now();
-- 트리거: comments UPDATE → updated_at = now()
```

**`posts` 수정**:
```sql
ALTER TABLE posts ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE posts ADD COLUMN hidden boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE posts ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))) STORED;
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);
-- 트리거: posts UPDATE → updated_at = now()
```

**`review_history` 신설**:
```sql
CREATE TABLE review_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   uuid REFERENCES reviews(id) ON DELETE CASCADE,
  old_body    text,
  old_rating  int,
  edited_at   timestamptz DEFAULT now(),
  editor_id   uuid REFERENCES profiles(id) ON DELETE SET NULL
);
-- RLS: SELECT = 본인 + admin, INSERT = 트리거만
```

**`reports` 수정**:
```sql
-- 자동 숨김 트리거
CREATE OR REPLACE FUNCTION auto_hide_on_reports() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM reports WHERE target_type='post' AND target_id=NEW.target_id AND status='pending') >= 5 THEN
    UPDATE posts SET hidden = true WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_auto_hide AFTER INSERT ON reports FOR EACH ROW EXECUTE FUNCTION auto_hide_on_reports();
```

### S1 착수 전 최우선 처리 항목
1. **L2-28** OAuth 콜백 URL 유실 — 로그인 자체가 깨짐
2. **L2-22** XSS sanitize — 출시 전 필수
3. **L2-20** PIPA 탈퇴 처리 — 법적 의무
4. **L2-21** Storage LIST 노출 — 개인정보 사고 방지

## 11. 결정 로그 — 루프2 (2026-06-10)

서브에이전트 적대 질문 8건 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L2-1 | schema | primary_pcode = MIN(p.id) 행의 danawa_pcode. 문서화로 일관성 확보 |
| L2-2 | arch | sw.js↔Supabase 세션: onAuthStateChange + controllerchange reload |
| L2-3 | perf | 피드 페이지네이션 = keyset cursor. 인기순은 RPC 복합 cursor |
| L2-4 | security | reports 완전 스키마: reporter_id + UNIQUE(type,target_id,reporter_id) |
| L2-5 | auth | 닉네임 모달 = supabaseClient.js initAuth() 공통 모듈 (모든 페이지) |
| L2-6 | community | posts 이미지 orphan = Database Webhook → Edge Function cleanup |
| L2-7 | review | 도움순 정렬 V2 defer. V1은 최신순만 |
| L2-8 | ops | Supabase pause 방지: GitHub Actions scheduled ping (3일 주기) |

---

## 12. 결정 로그 — 루프3 (2026-06-10)

서브에이전트 적대 질문 6건 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L3-1 | auth | 카카오 비즈앱 전환 심사 + 구글 OAuth 프로덕션 게시 — 9절에 명시 |
| L3-2 | ux | 닉네임 UNIQUE 인덱스 + 30일 쿨다운 규칙. profiles에 nickname_changed_at 추가 |
| L3-3 | ux | 클라이언트 리사이즈: 장변1280px/WebP/browser-image-compression/EXIF처리 |
| L3-4 | community | product_pcodes[] 태그 UX: 클라이언트 정적JSON 검색, 최대 5개 |
| L3-5 | arch | admin 패널 V1 = Supabase Dashboard SQL 직접. V2에서 admin.html |
| L3-6 | arch | 알림 V1=없음(명시적). V2=Realtime 배지. V3=Web Push VAPID |

---

## 13. 결정 로그 — 루프4 (2026-06-10) — 서브에이전트 적대 검토 4차

서브에이전트 14개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L4-1 | migration | S2 마이그레이션 = 단일 트랜잭션 SQL 파일(`002_s2_reviews.sql`). BEGIN~COMMIT 원자 적용 |
| L4-2 | security | anon key = GitHub Secrets에만 저장. `pages.yml` build step에서 sed 치환. git 히스토리에 key 미포함 |
| L4-3 | security | `<meta http-equiv="Content-Security-Policy">` 태그 삽입. `unsafe-inline` 금지. 허용 도메인: self + cdn.jsdelivr.net + *.supabase.co |
| L4-4 | schema/ux | V1 댓글 쿼리에 `parent_id` 필터 없음(전체 flat). V2 nested UI = 대댓글 입력 버튼과 동시 배포 |
| L4-5 | seo | 소프트 삭제 글 = JS로 `<meta name="robots" content="noindex">` 동적 삽입 + title "삭제된 게시물"로 교체 |
| L4-6 | infra | Supabase ping = `profiles.select('id').limit(1)` (anon key). `ping.yml` schedule `'0 0 */3 * *'` |
| L4-7 | infra | anon key 빌드 주입 방식 = 플레이스홀더 `__SUPABASE_URL__`, `__SUPABASE_ANON_KEY__` → pages.yml sed 치환 (L4-2와 통합) |
| L4-8 | security | Storage INSERT Policy = `auth.uid()::text = split_part(name, '/', 1)`. 크로스 버킷 경로 덮어쓰기 차단 |
| L4-9 | schema | `profiles.nickname UNIQUE NULL 다중 허용` 명시 — Postgres UNIQUE는 NULL≠NULL. `NOT NULL` 추가 금지 주석 |
| L4-10 | schema | `reviews.hidden boolean DEFAULT false` 추가. `auto_hide_on_reports()` 트리거에 `target_type='review'` 처리 확장. `comments.hidden`도 동일 |
| L4-11 | security | `posts.product_pcodes` DB 레벨 CHECK: `array_length(product_pcodes,1) <= 5`. RLS WITH CHECK에도 포함 |
| L4-12 | ops | pg_cron 실패 감지 = GitHub Actions 주 1회 `cron.job_run_details WHERE status='failed'` 조회 워크플로 추가 |
| L4-13 | legal | 닉네임 강제 모달에 "만 14세 이상" 자기선언 체크박스 추가. `profiles.age_verified boolean DEFAULT false` |
| L4-14 | arch | 댓글 rate-limit V1 = DB 트리거(1분간 댓글 COUNT 체크). Upstash Redis Edge Function은 V2로 defer. 콜드스타트 리스크 회피 |

### 스키마 보완 사항 (루프4 반영)

**`reviews` 수정**:
```sql
ALTER TABLE reviews ADD COLUMN hidden boolean DEFAULT false;
```

**`comments` 수정**:
```sql
ALTER TABLE comments ADD COLUMN hidden boolean DEFAULT false;
```

**`profiles` 수정**:
```sql
ALTER TABLE profiles ADD COLUMN age_verified boolean DEFAULT false;
-- UNIQUE allows multiple NULLs (for withdrawn users — Postgres NULL ≠ NULL in UNIQUE index)
-- DO NOT add NOT NULL constraint to nickname
```

**`posts` CHECK 추가**:
```sql
ALTER TABLE posts ADD CONSTRAINT chk_product_pcodes_len
  CHECK (array_length(product_pcodes, 1) IS NULL OR array_length(product_pcodes, 1) <= 5);
```

**`auto_hide_on_reports()` 트리거 확장**:
```sql
CREATE OR REPLACE FUNCTION auto_hide_on_reports() RETURNS trigger AS $$
DECLARE
  report_count int;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM reports
  WHERE target_type = NEW.target_type AND target_id = NEW.target_id AND status = 'pending';

  IF report_count >= 5 THEN
    IF NEW.target_type = 'post' THEN
      UPDATE posts SET hidden = true WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'review' THEN
      UPDATE reviews SET hidden = true WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE comments SET hidden = true WHERE id = NEW.target_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**댓글 rate-limit V1 DB 트리거**:
```sql
CREATE OR REPLACE FUNCTION check_comment_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM comments
    WHERE user_id = NEW.user_id AND created_at > now() - interval '1 minute'
  ) >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_comment_rate_limit BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_comment_rate_limit();
```

### GitHub Actions 추가 워크플로 (루프4)
- `ping.yml` — schedule `'0 0 */3 * *'`: Supabase 비활성 방지 ping
- `check-cron-health.yml` — schedule `'0 9 * * 1'`: pg_cron 실패 감지

### 최종 스키마 완전 목록 (루프1~4 통합)
| 테이블 | 주요 변경 |
|---|---|
| `profiles` | `nickname_changed_at`, `age_verified` 추가. UNIQUE NULL 주석 |
| `reviews` | `hidden` 추가. `review_history` 트리거 |
| `posts` | `deleted_at`, `hidden`, `updated_at`, `search_vector`, `product_pcodes CHECK` 추가 |
| `comments` | `parent_id`, `updated_at`, `hidden` 추가. rate-limit 트리거 |
| `likes` | 변경 없음(루프1 확정) |
| `reports` | `auto_hide_on_reports()` 트리거 3-way 확장 |
| `review_history` | 신설 |
