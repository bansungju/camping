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

---

## 14. 결정 로그 — 루프5 (2026-06-10) — 서브에이전트 적대 검토 5차

서브에이전트 14개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L5-1 | sw/infra | `sw.js` CACHE_NAME = `camfit-v{run_number}`. activate에서 구 캐시 전부 삭제. `pages.yml`에서 sed로 버전 자동 주입(L4-7과 통합) |
| L5-2 | auth/ux | 401 응답 시 세션 재확인 → null이면 토스트 + 로그인 모달 + draft sessionStorage 보존. `onAuthStateChange SIGNED_OUT`에도 동일 처리 |
| L5-3 | privacy | 탈퇴 시 posts/comments `deleted_at = now()` 즉시 소프트삭제 동시 적용. "알 수 없음" 노출 기간 0일. `delete-account` Edge Function 명세에 추가 |
| L5-4 | ops | 각 마이그레이션 파일에 대응 롤백 파일(`_rollback.sql`) 함께 작성. 스테이징 DB(무료 프로젝트 1개)에서 사전 검증 |
| L5-5 | storage | V1: 아바타 = 소셜 provider URL만. `profile-images` 버킷 미생성. 커스텀 아바타 V2로 defer. §2 스키마 비고에 명시 |
| L5-6 | infra | `pages.yml` 단일 job 스텝 순서 고정: pip → export_site.py → sed(anon key) → sed(CACHE_VERSION) → deploy. 별도 job 분리 금지 |
| L5-7 | search | `tsvector simple` 인덱스 삭제. 한국어 검색 = `ILIKE '%검색어%'`. 태그 검색 = `tags @> ARRAY[?]` GIN 인덱스. `search_vector` 컬럼 제거 |
| L5-8 | ux | 이미지 미리보기 = `URL.createObjectURL()`. 렌더 후 즉시 `revokeObjectURL()`. `FileReader.readAsDataURL()` 사용 금지 |
| L5-9 | perf | Partial index 추가(소프트삭제/hidden 행 제외): posts(created_at DESC), posts(like_count DESC, created_at DESC), posts(user_id), comments(post_id), reviews(product_pcode) |
| L5-10 | storage | V1: Storage public + CDN 최대 1시간 잔존 허용으로 명시. 긴급 삭제 = Supabase Dashboard 수동. V2에서 중요 이미지 Signed URL 전환 고려 |
| L5-11 | perf | `posts.comment_count int DEFAULT 0` 추가. comments INSERT/DELETE 트리거로 갱신. pg_cron 주 1회 보정 쿼리에 포함 |
| L5-12 | perf | `idx_reviews_product_pcode` 인덱스를 S2 마이그레이션 파일에 포함 |
| L5-13 | security | `@supabase/supabase-js` CDN URL에 고정 버전 명시(예: `@2.x.x`). `supabaseClient.js` 주석에 버전 기록. 자동 업그레이드 방지 |
| L5-14 | auth | 탈퇴 재가입 시 이전 닉네임 보장 불가 명시. V1: 즉시 해제 유지. 닉네임 모달에 "이전 닉네임은 보장되지 않을 수 있습니다" 안내 문구 추가 |

### 스키마 보완 사항 (루프5 반영)

**`posts` 수정** — search_vector 제거, comment_count 추가:
```sql
-- search_vector 컬럼 및 GIN 인덱스 삭제 (L5-7)
ALTER TABLE posts DROP COLUMN IF EXISTS search_vector;
DROP INDEX IF EXISTS idx_posts_search;

-- comment_count 추가 (L5-11)
ALTER TABLE posts ADD COLUMN comment_count int DEFAULT 0;
```

**`tags` 배열 GIN 인덱스 추가** (L5-7):
```sql
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
```

**Partial 인덱스 추가** (L5-9):
```sql
CREATE INDEX idx_posts_feed_latest ON posts(created_at DESC)
  WHERE deleted_at IS NULL AND hidden = false;
CREATE INDEX idx_posts_feed_popular ON posts(like_count DESC, created_at DESC)
  WHERE deleted_at IS NULL AND hidden = false;
CREATE INDEX idx_posts_user ON posts(user_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_post ON comments(post_id)
  WHERE hidden = false;
CREATE INDEX idx_reviews_pcode ON reviews(product_pcode);
```

**`comment_count` 트리거** (L5-11):
```sql
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();
```

### 루프5 반영 후 최종 스키마 완전 목록 (루프1~5 통합)
| 테이블 | 주요 컬럼 요약 |
|---|---|
| `profiles` | id, nickname(UNIQUE/NULL가능), avatar_url, created_at, nickname_changed_at, role, age_verified |
| `reviews` | id, product_pcode, user_id, rating, body, images[], created_at, updated_at, hidden |
| `review_history` | id, review_id, old_body, old_rating, edited_at, editor_id |
| `posts` | id, user_id, title, body, images[], tags[], product_pcodes[≤5], like_count, comment_count, created_at, updated_at, deleted_at, hidden |
| `comments` | id, post_id, user_id, body, parent_id, created_at, updated_at, hidden |
| `likes` | (post_id, user_id) PK, created_at |
| `reports` | id, reporter_id, target_type, target_id, reason, status, created_at |

---

## 15. 결정 로그 — 루프6 (2026-06-10) — 서브에이전트 적대 검토 6차

서브에이전트 5개 구멍 발굴(직전 루프4 이월 + 신규) → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L6-1 | security | `posts` INSERT rate-limit = DB BEFORE 트리거(24시간 10개). `comments` 트리거(L4-14)와 동일 패턴 |
| L6-2 | moderation | 이미지 모더레이션 V1 = **사후 신고 전용** (명시적 결정. 미결이 아님). V2 = Storage webhook → Edge Function → Google Vision SafeSearch. V1 업로드 화면에 콘텐츠 정책 동의 체크박스 추가 |
| L6-3 | security | 욕설 필터 = DB BEFORE INSERT 트리거 `check_text_content()` 필수. 클라이언트 필터는 UX 보조만. `blocked_terms` 배열은 Edge Function secret 또는 별도 테이블로 관리 |
| L6-4 | perf | 리뷰 배지 N+1 방지 = `get_review_stats(pcodes text[]) RETURNS TABLE(pcode text, avg_rating numeric, review_count int)` RPC. 카테고리 페이지 로드 1회 호출로 전 카드 통계 일괄 취득 |
| L6-5 | data-integrity | `normalize_models.py` 재실행 시 pcode 이동 방지: `export_site.py`에 카드별 `all_pcodes text[]` 필드 추가. 리뷰 lookup = `ANY(all_pcodes)`. pipeline 정책: 기존 UGC가 존재할 경우 normalize_models.py 전체 재실행 금지(신규 카드 추가는 허용) |

### 스키마 보완 사항 (루프6 반영)

**`posts` rate-limit 트리거 신설** (L6-1):
```sql
CREATE OR REPLACE FUNCTION check_post_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM posts
    WHERE user_id = NEW.user_id
      AND created_at > now() - interval '24 hours'
      AND deleted_at IS NULL
  ) >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: max 10 posts per 24h';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_post_rate_limit BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION check_post_rate_limit();
```

**욕설 필터 트리거 신설** (L6-3):
```sql
-- blocked_terms 테이블 (admin이 관리, RLS: SELECT=all, INSERT/DELETE=admin only)
CREATE TABLE blocked_terms (
  id   serial PRIMARY KEY,
  term text NOT NULL UNIQUE
);

CREATE OR REPLACE FUNCTION check_text_content() RETURNS trigger AS $$
DECLARE
  combined text;
BEGIN
  combined := coalesce(NEW.title,'') || ' ' || coalesce(NEW.body,'');
  IF EXISTS (SELECT 1 FROM blocked_terms WHERE combined ILIKE '%' || term || '%') THEN
    RAISE EXCEPTION 'content_policy_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- reviews, posts, comments 각각에 BEFORE INSERT OR UPDATE 트리거 적용
CREATE TRIGGER trg_review_content BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_text_content();
CREATE TRIGGER trg_post_content BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION check_text_content();
CREATE TRIGGER trg_comment_content BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION check_text_content();
```

**`get_review_stats` RPC 신설** (L6-4):
```sql
CREATE OR REPLACE FUNCTION get_review_stats(pcodes text[])
RETURNS TABLE(pcode text, avg_rating numeric, review_count int)
LANGUAGE sql STABLE AS $$
  SELECT
    product_pcode AS pcode,
    ROUND(AVG(rating)::numeric, 1) AS avg_rating,
    COUNT(*)::int AS review_count
  FROM reviews
  WHERE product_pcode = ANY(pcodes)
    AND hidden = false
  GROUP BY product_pcode
  HAVING COUNT(*) >= 3;  -- 표본 3개 미만은 반환 안 함(결정 #9)
$$;
-- RLS: 함수는 SECURITY DEFINER 불필요. STABLE이므로 RLS 적용됨
```

> **클라이언트 사용 예시**:
> ```js
> const { data } = await supabase.rpc('get_review_stats', {
>   pcodes: visibleCards.map(c => c.danawa_pcode)
> });
> // data: [{ pcode, avg_rating, review_count }, ...]
> ```

**`export_site.py` 수정 지침** (L6-5):
```python
# 각 카드 JSON에 all_pcodes 필드 추가
# primary_pcode = MIN(p.id) 행의 pcode (기존 결정 유지)
# all_pcodes = 해당 카드에 속한 모든 product의 danawa_pcode 목록
"all_pcodes": [row["pcode"] for row in card_products]
```

**pipeline 정책 주석 추가 (`normalize_models.py` 파일 상단)**:
```python
# POLICY: 프로덕션 UGC(리뷰/게시글)가 존재하는 상태에서 전체 재실행 금지.
# 재실행 시 primary_pcode가 교체될 수 있어 기존 리뷰가 다른 카드에 집계됨.
# 허용: 신규 카드 추가(--only 특정 카테고리). 금지: 전체 카탈로그 재구성.
```

### 루프6 반영 후 최종 스키마 완전 목록 (루프1~6 통합)
| 테이블 | 주요 컬럼 요약 |
|---|---|
| `profiles` | id, nickname(UNIQUE/NULL가능), avatar_url, created_at, nickname_changed_at, role, age_verified |
| `reviews` | id, product_pcode, user_id, rating, body, images[], created_at, updated_at, hidden |
| `review_history` | id, review_id, old_body, old_rating, edited_at, editor_id |
| `posts` | id, user_id, title, body, images[], tags[], product_pcodes[≤5], like_count, comment_count, created_at, updated_at, deleted_at, hidden |
| `comments` | id, post_id, user_id, body, parent_id, created_at, updated_at, hidden |
| `likes` | (post_id, user_id) PK, created_at |
| `reports` | id, reporter_id, target_type, target_id, reason, status, created_at |
| `blocked_terms` | id, term(UNIQUE) |

### 이미지 모더레이션 V1 vs V2 명시
| 단계 | 내용 |
|---|---|
| **V1 (명시적 결정)** | 업로드 전 "서비스 이용약관 및 콘텐츠 정책에 동의합니다" 체크박스 필수. 신고 5회 → 자동 hidden. admin 수동 검토. |
| **V2** | Storage trigger → Edge Function → Google Cloud Vision SafeSearch API. `VERY_LIKELY` 카테고리(성인/폭력) = 즉시 삭제 + 신고자 알림 |

> V1 결정 근거: 런치 초기 UGC 볼륨이 작으므로 API 비용 대비 효과 낮음. 신고 시스템으로 충분히 커버. 방통위 조치 의무는 신고 접수 후 24시간 내 처리로 충족 가능.

---

## 16. 결정 로그 — 루프7 (2026-06-10) — 서브에이전트 적대 검토 7차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L7-1 | security/perf | `blocked_terms` DB 스캔 폭탄 → V1 인라인 배열 방식으로 교체. V2 = `pg_trgm` GIN + 유니코드 정규화 전처리 |
| L7-2 | auth/ux | iOS Safari OAuth 팝업 차단 → `redirectTo` 전체 페이지 리다이렉트 방식 강제. sessionStorage → `localStorage`로 redirect 저장 |
| L7-3 | security | `autolink` 비활성화. 동일 이메일 타 프로바이더 시 에러 + "XX로 로그인하세요" 안내로 전환. 수동 계정 연동은 V2 |
| L7-4 | legal/ux | `age_verified` 체크 조건 = `!profile.age_verified` 독립 처리(닉네임과 분리). 만 14세 미만 이용 금지 선언 방식으로 법적 책임 위치 |
| L7-5 | data-integrity | 소프트삭제·복원 시 `comment_count`/`like_count` 음수 언더플로 방지: 트리거에 삭제된 게시글 건너뜀 조건 추가 + `restore_post(post_id)` RPC로 카운터 재계산 원자 처리 |

### 스키마·코드 보완 사항 (루프7 반영)

#### L7-1: `check_text_content()` 인라인 배열 방식으로 교체

```sql
-- blocked_terms 테이블 방식(L6-3) 폐기 → 인라인 배열로 교체
-- V1: DB 쓰기 레이턴시 0 추가. 차단어 변경은 트리거 교체(admin 작업)
CREATE OR REPLACE FUNCTION check_text_content() RETURNS trigger AS $$
DECLARE
  combined text;
  term text;
  -- V1 인라인 배열: 명백한 욕설만. 유니코드 변형 우회는 V2(pg_trgm)에서 대응
  blocked text[] := ARRAY['씨발','개새끼','병신','미친놈','존나','ㅅㅂ','ㅂㅅ'];
BEGIN
  combined := lower(coalesce(NEW.title,'') || ' ' || coalesce(NEW.body,''));
  FOREACH term IN ARRAY blocked LOOP
    IF combined LIKE '%' || term || '%' THEN
      RAISE EXCEPTION 'content_policy_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- blocked_terms 테이블 생성 취소 (L6-3 결정 수정)
-- DROP TABLE IF EXISTS blocked_terms; -- 미생성이면 불필요
```

> **V2 전환 조건**: blocked_terms 관리 수요가 생기면 `pg_trgm` 확장 + `word_similarity()` + 유니코드 정규화(`unaccent` + 전각→반각 변환) Edge Function 전처리로 전환.

#### L7-2: OAuth 리다이렉트 방식 + localStorage

```js
// supabaseClient.js — signIn() 함수
export async function signIn(provider) {
  // redirectTo: full-page redirect (iOS Safari 팝업 차단 방지)
  // sessionStorage는 새 탭에서 공유 안 됨 → localStorage 사용
  localStorage.setItem('redirect_after_login', location.href);
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${location.origin}/site/auth-callback.html`,
    },
  });
  // signInWithOAuth with redirectTo = 현재 탭을 OAuth 제공자로 전환 (팝업 없음)
}

// auth-callback.html 또는 onAuthStateChange 핸들러
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    const redirect = localStorage.getItem('redirect_after_login');
    localStorage.removeItem('redirect_after_login');
    if (redirect) location.replace(redirect);
  }
});
```

> `auth-callback.html` 신규 파일 필요 (`site/` 폴더). Supabase Dashboard의 Redirect URL 허용 목록에 추가 필수.

#### L7-3: autolink 비활성화 + 동일 이메일 처리

```
Supabase Dashboard → Authentication → Settings:
  ✗ Enable automatic linking (비활성화)
```

```js
// 동일 이메일 타 프로바이더 감지 처리 (signIn 에러 핸들링)
const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
if (error?.message?.includes('already registered')) {
  showToast('이미 다른 방법으로 가입된 이메일입니다. 기존 방식으로 로그인해주세요.');
}
// 또는 onAuthStateChange에서 error 감지 후 처리
```

> 수동 계정 연동(`supabase.auth.linkIdentity()`)은 V2. V1에서는 프로바이더 분리 정책: 카카오 가입자는 카카오만, 구글 가입자는 구글만.

#### L7-4: `age_verified` 독립 처리

```js
// initAuth() 수정 — 닉네임과 age_verified를 각각 독립 체크
export async function initAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  // age_verified는 닉네임과 독립적으로 체크 (순서: 연령 → 닉네임)
  if (!profile?.age_verified) {
    showAgeVerificationModal(); // 별도 모달: "만 14세 이상임을 확인합니다" + 동의 체크
    return; // 닉네임 모달은 age_verified 완료 후 표시
  }
  if (!profile?.nickname) {
    showNicknameModal();
  }
}
```

> 연령 모달 문구: "본 서비스는 만 14세 이상 이용 가능합니다. 14세 미만인 경우 이용을 중단해주세요." — PIPA §22①단서: 14세 미만은 법정대리인 동의가 필요하므로 V1에서는 이용 자체를 금지하는 방식으로 회피. 법정대리인 동의 시스템은 V3.

#### L7-5: 소프트삭제·복원 시 카운터 보호

```sql
-- comment_count 트리거 보강: 삭제된/숨겨진 게시글의 댓글 카운트 변경 무시
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
DECLARE
  post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
    IF NOT post_deleted THEN
      UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
    IF NOT post_deleted THEN
      UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 게시글 복원 RPC (like_count + comment_count 원자 재계산)
CREATE OR REPLACE FUNCTION restore_post(p_post_id uuid) RETURNS void
LANGUAGE sql AS $$
  UPDATE posts SET
    deleted_at = NULL,
    like_count = (SELECT COUNT(*) FROM likes WHERE post_id = p_post_id),
    comment_count = (SELECT COUNT(*) FROM comments WHERE post_id = p_post_id AND hidden = false)
  WHERE id = p_post_id;
$$;
-- RLS: admin만 호출 가능 (SECURITY DEFINER + role 체크)
```

**pg_cron 보정 쿼리 수정** (L2-23 업데이트):
```sql
-- 소프트삭제 게시글 제외, GREATEST(0,...) 언더플로 방지
UPDATE posts SET
  like_count = GREATEST(0, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id)),
  comment_count = GREATEST(0, (SELECT COUNT(*) FROM comments WHERE post_id = posts.id AND hidden = false))
WHERE deleted_at IS NULL;
```

### 루프7 반영 후 최종 스키마 완전 목록 (루프1~7 통합)
| 테이블 | 주요 컬럼 요약 |
|---|---|
| `profiles` | id, nickname(UNIQUE/NULL가능), avatar_url, created_at, nickname_changed_at, role, age_verified |
| `reviews` | id, product_pcode, user_id, rating, body, images[], created_at, updated_at, hidden |
| `review_history` | id, review_id, old_body, old_rating, edited_at, editor_id |
| `posts` | id, user_id, title, body, images[], tags[], product_pcodes[≤5], like_count, comment_count, created_at, updated_at, deleted_at, hidden |
| `comments` | id, post_id, user_id, body, parent_id, created_at, updated_at, hidden |
| `likes` | (post_id, user_id) PK, created_at |
| `reports` | id, reporter_id, target_type, target_id, reason, status, created_at |

> `blocked_terms` 테이블 생성 취소 (L7-1: 인라인 배열로 교체).

---

## 17. 결정 로그 — 루프8 (2026-06-10) — 서브에이전트 적대 검토 8차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L8-1 | security | `auth-callback.html`은 `supabase.auth.getSession()` 호출만으로 구현(수동 code exchange 금지). redirect 전 `new URL(redirect).origin === location.origin` 검증 |
| L8-2 | perf/ux | comments V1 = 게시글당 전체 조회(볼륨 적음). 50개 초과 시 keyset (`created_at ASC, id ASC`) "더보기" 버튼 방식. offset 방식 금지(삽입 시 순서 밀림) |
| L8-3 | security | `reviews` SELECT RLS에 `hidden = false` 조건 추가(defense in depth). RPC 내부 필터와 이중 방어 |
| L8-4 | infra | sw.js `install` 핸들러에서 `addAll()` catch 제거 — 실패 시 구 SW 유지. `skipWaiting()`은 `install` 완료 후에만 호출 |
| L8-5 | security | 탈퇴 후 JWT 유효기간 내 INSERT 차단: 모든 INSERT RLS에 `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())` 추가. JWT 만료 시간 = 15분(Supabase 기본 1시간 → 단축) |

### 코드·설정 보완 사항 (루프8 반영)

#### L8-1: `auth-callback.html` 구현 명세

```html
<!-- site/auth-callback.html -->
<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.x.x/+esm';
const supabase = createClient('__SUPABASE_URL__', '__SUPABASE_ANON_KEY__');

// Supabase SDK가 내부적으로 state/PKCE 검증 포함
const { data: { session }, error } = await supabase.auth.getSession();

if (error || !session) {
  location.replace('/site/index.html?login_error=1');
} else {
  // open redirector 방지: 반드시 동일 origin만 허용
  const raw = localStorage.getItem('redirect_after_login') || '/site/index.html';
  localStorage.removeItem('redirect_after_login');
  try {
    const target = new URL(raw, location.origin);
    if (target.origin !== location.origin) throw new Error('invalid');
    location.replace(target.href);
  } catch {
    location.replace('/site/index.html');
  }
}
</script>
```

> 주의: `supabase.auth.getSession()`은 URL hash/query의 code를 내부적으로 파싱하고 state 검증(PKCE verifier)을 수행하므로 수동 `exchangeCodeForSession()` 호출 불필요.

#### L8-2: comments 페이지네이션 명세

```js
// V1: 전체 조회 (댓글 ≤ 50개 예상)
const { data: comments } = await supabase
  .from('comments')
  .select('id, user_id, body, created_at, parent_id, profiles(nickname)')
  .eq('post_id', postId)
  .is('hidden', false)
  .order('created_at', { ascending: true })
  .order('id', { ascending: true }); // keyset tie-breaker

// 50개 초과 시 keyset "더보기" 방식
const { data: moreComments } = await supabase
  .from('comments')
  .select('...')
  .eq('post_id', postId)
  .is('hidden', false)
  .gt('created_at', lastCreatedAt)   // cursor
  .order('created_at', { ascending: true })
  .order('id', { ascending: true })
  .limit(20);
// ❌ OFFSET 방식 금지 — 삽입 시 순서 밀림으로 중복/누락 발생
```

#### L8-3: `reviews` SELECT RLS 업데이트

```sql
-- 기존: SELECT 전체 허용
-- 수정: hidden=false 만 노출 (RPC 내부 필터와 이중 방어)
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (hidden = false);
-- anon + authenticated 모두 적용 (비로그인 사용자도 리뷰 배지 조회 가능)
```

#### L8-4: sw.js install 핸들러 수정

```js
// ❌ 기존 (잘못된 패턴 — addAll 실패 시 빈 캐시로 activate)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting(); // install과 동시에 호출 — 빈 캐시 activate 위험
});

// ✅ 수정 (addAll 실패 시 install 실패 → 구 SW 유지)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // addAll 성공 후에만 skipWaiting
    // catch 없음 — 실패하면 browser가 install을 취소하고 구 SW 계속 사용
  );
});
```

#### L8-5: INSERT RLS profiles 존재 확인 + JWT 만료 단축

```sql
-- 모든 INSERT RLS 정책에 아래 조건 추가 (탈퇴 후 JWT zombie 차단)
-- 예: reviews INSERT
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
  );

-- posts, comments, likes, reports에 동일하게 EXISTS 조건 추가
```

```
Supabase Dashboard → Authentication → Settings:
  JWT Expiry: 900 (seconds) — 기본 3600(1시간) → 15분으로 단축
  (세션 만료 후 refresh token으로 자동 갱신 — 일반 사용자에게 체감 없음)
```

> **근거**: `delete-account` Edge Function이 `auth.admin.deleteUser()`를 호출하면 refresh token은 즉시 무효화된다. 탈퇴 후 남은 access token의 유효 창을 15분으로 최소화하고, `profiles` 존재 확인으로 DB 레벨에서 zombie INSERT를 차단한다.

---

## 18. 결정 로그 — 루프9 (2026-06-10) — 서브에이전트 적대 검토 9차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L9-1 | seo/ux | OG 태그 V1 = 정적 기본값. 카카오 공유 = JS SDK 동적 주입. 외부 링크 크롤러(iMessage·Slack) = V1 한계로 명시 포기. V2 = Cloudflare Worker 또는 Netlify Edge Functions |
| L9-2 | ux/data | `images text[]` 순서 = 클라이언트 책임. 업로드 완료 후 원하는 순서로 배열 구성. 수정 시 전체 배열 교체(PATCH). 대표이미지 = 배열[0] 명시 |
| L9-3 | ux/auth | 비회원 리뷰 작성 의도 보존: `localStorage.pending_review_intent = {pcode, body, rating}`. 로그인 완료 후 `auth-callback.html`이 해당 페이지로 복귀 → `initAuth()` 완료 시 폼 자동 복원 |
| L9-4 | infra/security | 카카오 SDK 로드 실패 폴백: `typeof Kakao === 'undefined'` → Web Share API → URL 클립보드 복사. SRI = 카카오 고정 버전 URL 확인 후 `crossorigin="anonymous"` 추가 |
| L9-5 | moderation | 평점 조작 방어 V1: 리뷰 INSERT 트리거에 가입 후 24시간 쿨다운 추가. V2 = 신규 계정(7일 미만) 리뷰 `pending` 상태 → admin 검토 후 반영 |

### 코드·설정 보완 사항 (루프9 반영)

#### L9-1: OG 태그 전략

```html
<!-- site/index.html 정적 기본 OG (사이트 레벨) -->
<meta property="og:title" content="CamFit — 캠핑 기어 비교">
<meta property="og:description" content="스펙 기반 캠핑 장비 비교 + 실사용 리뷰">
<meta property="og:image" content="https://[GITHUB_PAGES_DOMAIN]/site/og-default.png">
<meta property="og:type" content="website">
```

```js
// 카카오 소셜 공유 — JS SDK로 동적 주입 (크롤러는 정적 기본값)
function shareKakao({ title, desc, imageUrl, webUrl }) {
  if (typeof Kakao === 'undefined') { fallbackShare(webUrl); return; }
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: { title, description: desc, imageUrl,
                link: { mobileWebUrl: webUrl, webUrl } }
  });
}

function fallbackShare(url) {
  if (navigator.share) {
    navigator.share({ url });           // Web Share API (모바일)
  } else {
    navigator.clipboard.writeText(url)
      .then(() => showToast('링크가 복사됐습니다'));
  }
}
```

> V1 명시적 한계: iMessage·Slack·카카오톡 외부 링크 미리보기는 정적 기본 OG만 표시됨. 개별 게시글/리뷰 URL은 SPA 특성상 크롤러가 JS 실행 불가. **V2 해결책**: Cloudflare Workers로 `User-Agent: facebookexternalhit` 등 크롤러 요청 감지 → Supabase에서 메타데이터 조회 → HTML 응답 주입.

#### L9-2: 이미지 배열 순서 보장

```js
// 업로드: 순서 보장을 위해 sequential Promise 체인 (Promise.all → 병렬 순서 미보장)
async function uploadImages(files) {
  const paths = [];
  for (const file of files) {          // 사용자가 선택한 순서대로 직렬 업로드
    const compressed = await compressImage(file);
    const { data } = await supabase.storage
      .from('review-images')
      .upload(`${uid}/${crypto.randomUUID()}.webp`, compressed);
    paths.push(data.path);
  }
  return paths;                        // 배열[0] = 대표이미지 (썸네일·OG)
}

// 수정: 전체 배열 교체 (append 방식 금지)
async function updateReview(reviewId, newImages, body, rating) {
  await supabase.from('reviews').update({
    images: newImages,                 // 클라이언트가 정렬한 최종 배열 전체 교체
    body, rating, updated_at: new Date().toISOString()
  }).eq('id', reviewId);
}
```

#### L9-3: 비회원 리뷰 작성 의도 보존

```js
// 리뷰 버튼 클릭 시 (비로그인)
function onReviewButtonClick(pcode) {
  if (!currentUser) {
    // 의도 보존: 폼 초안을 localStorage에 저장
    localStorage.setItem('pending_review_intent',
      JSON.stringify({ pcode, body: '', rating: 0 }));
    // redirect_after_login에 pcode 파라미터 포함
    localStorage.setItem('redirect_after_login',
      `${location.origin}/site/product.html?pcode=${pcode}&open_review=1`);
    signIn('kakao'); // 또는 로그인 모달
    return;
  }
  openReviewModal(pcode);
}

// initAuth() 완료 후 의도 복원
export async function initAuth() {
  // ... age_verified, nickname 체크 ...
  const intent = localStorage.getItem('pending_review_intent');
  if (intent) {
    const { pcode } = JSON.parse(intent);
    localStorage.removeItem('pending_review_intent');
    const params = new URLSearchParams(location.search);
    if (params.get('open_review') && params.get('pcode') === pcode) {
      openReviewModal(pcode); // 폼 자동 열기
    }
  }
}
```

#### L9-4: 카카오 SDK 폴백 + `crossorigin`

```html
<!-- 카카오 SDK: 고정 버전 + crossorigin -->
<script
  src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
  crossorigin="anonymous"
  integrity="sha384-[HASH]">  <!-- 카카오 공식 문서에서 버전별 SRI 해시 확인 후 기입 -->
</script>
```

> SRI 해시: 카카오 SDK 공식 문서에서 버전별 해시 제공. V1 배포 전 `sha384-$(curl -s URL | openssl dgst -sha384 -binary | base64)` 로 직접 생성 후 기입. 해시 없이 배포하면 공급망 공격 위험.

#### L9-5: 리뷰 24시간 가입 쿨다운 트리거

```sql
CREATE OR REPLACE FUNCTION check_review_account_age() RETURNS trigger AS $$
BEGIN
  -- 가입 후 24시간 이내 계정의 리뷰 차단 (자동화 계정 평점 조작 방어)
  IF (SELECT created_at FROM profiles WHERE id = NEW.user_id) > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'account_too_new: review requires 24h account age';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_review_account_age BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_account_age();
```

> V2 = 가입 7일 미만 리뷰를 `status='pending'` 컬럼으로 저장 후 admin 검토. `get_review_stats()` RPC는 `status='approved'` 또는 `status IS NULL`(기존 리뷰 하위호환) 조건 추가.
> 기존 `get_review_stats()` RPC의 `hidden = false` 필터에 V2 조건 추가 예약:
> ```sql
> WHERE product_pcode = ANY(pcodes) AND hidden = false
> -- V2: AND (status IS NULL OR status = 'approved')
> ```

---

## 19. 결정 로그 — 루프10 (2026-06-10) — 서브에이전트 적대 검토 10차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L10-1 | infra | Storage 1GB 한도: L3-3 WebP 1280px 압축(~200KB) 유지. 업로드 전 `≤300KB` 클라이언트 검증 추가. 모니터링 = check-cron-health.yml에 Storage 사용량 조회 추가 |
| L10-2 | security/privacy | `profiles` 테이블에 `email` 컬럼 없음(auth.users에만). SELECT RLS = 전체 공개(email 없으므로 안전). `public_profiles` VIEW 불필요 — 이 결정을 §2 스키마에 명시 |
| L10-3 | security | `reviews` UPDATE RLS 명시: `USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND hidden=false)`. product_pcode·user_id 변경 금지 트리거 추가 |
| L10-4 | data-integrity | 단종 pcode = products 물리 삭제 금지 정책. `curation_status='rejected'` + `export_site.py`에 `discontinued_pcodes.json` 생성. 프론트는 해당 파일로 "단종" 배지 표시 |
| L10-5 | ops/legal | 신고 알림: reports INSERT → Supabase Database Webhook → Edge Function `notify-admin` → Slack incoming webhook. 24시간 내 처리 SLA 달성(정보통신망법 §44-2) |

### 코드·설정 보완 사항 (루프10 반영)

#### L10-1: 이미지 업로드 전 크기 검증

```js
// uploadImages() 에 추가 — L9-2 직렬 업로드 코드 보강
const MAX_SIZE_BYTES = 300 * 1024; // 300 KB (WebP 1280px 압축 후 기대값)
const MAX_COUNT = 5;

async function uploadImages(files) {
  if (files.length > MAX_COUNT) throw new Error(`이미지는 최대 ${MAX_COUNT}장`);
  const paths = [];
  for (const file of files) {
    const compressed = await compressImage(file); // L3-3: 장변 1280px, WebP
    if (compressed.size > MAX_SIZE_BYTES) {
      // 압축 후에도 초과 시 quality 낮춰 재시도 또는 거부
      throw new Error('이미지 파일이 너무 큽니다 (최대 300KB)');
    }
    // ... 업로드 이하 동일
  }
  return paths;
}
```

> `check-cron-health.yml`에 Storage 모니터링 추가:
> ```yaml
> - name: Check Storage usage
>   run: |
>     USAGE=$(curl -s -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
>       "$SUPABASE_URL/storage/v1/bucket" | jq '[.[].size] | add')
>     echo "Storage used: ${USAGE} bytes"
>     if [ "$USAGE" -gt 800000000 ]; then echo "::warning::Storage > 800MB"; fi
> ```

#### L10-2: `profiles` 스키마 명확화 (§2 반영)

```sql
-- profiles 테이블 최종 컬럼 목록 (email 없음 — auth.users에서 분리)
CREATE TABLE profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname          text UNIQUE,        -- NULL 가능 (UNIQUE NULL ≠ NULL)
  avatar_url        text,               -- 소셜 provider URL (V1). 커스텀 아바타 V2
  role              text DEFAULT 'user' CHECK (role IN ('user','admin')),
  age_verified      boolean DEFAULT false,
  nickname_changed_at timestamptz,      -- 30일 쿨다운용
  created_at        timestamptz DEFAULT now()
  -- ❌ email 컬럼 없음: 이메일은 auth.users.email에서만 조회 (admin 전용)
  -- SELECT RLS: 전체 공개 (email 없으므로 민감 정보 없음)
);
```

#### L10-3: `reviews` UPDATE RLS + 불변 컬럼 보호

```sql
-- UPDATE 정책 명시
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()   -- user_id 변경 불가
    AND hidden = false     -- 숨겨진 리뷰는 본인도 수정 불가 (admin 복원 후 가능)
  );

-- product_pcode, user_id 불변 보호 트리거
CREATE OR REPLACE FUNCTION protect_review_immutable() RETURNS trigger AS $$
BEGIN
  IF NEW.product_pcode <> OLD.product_pcode THEN
    RAISE EXCEPTION 'product_pcode is immutable';
  END IF;
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_review_immutable BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION protect_review_immutable();
```

#### L10-4: 단종 pcode 처리 — pipeline 정책

```python
# export_site.py 수정: discontinued_pcodes.json 별도 생성
discontinued = con.execute("""
  SELECT DISTINCT danawa_pcode FROM products
  WHERE curation_status = 'rejected' AND danawa_pcode IS NOT NULL
""").fetchall()
with open('site/data/discontinued_pcodes.json', 'w') as f:
    json.dump([r[0] for r in discontinued], f)
```

```js
// 프론트엔드: 리뷰 표시 시 단종 여부 확인
const discontinuedPcodes = await fetch('/site/data/discontinued_pcodes.json').then(r => r.json());
const isDiscontinued = discontinuedPcodes.includes(review.product_pcode);
// isDiscontinued = true → "⚠️ 단종/재분류 상품의 리뷰입니다" 배너 표시
```

> pipeline 정책: `products` 테이블 물리 DELETE 금지. 단종·오분류 = `curation_status='rejected'`로 표기. 이 정책은 `normalize_models.py` 주석(L6-5)에 함께 명시.

#### L10-5: 신고 알림 Edge Function

```
Supabase Dashboard → Database → Webhooks:
  테이블: reports
  이벤트: INSERT
  URL: https://[PROJECT].supabase.co/functions/v1/notify-admin
```

```ts
// supabase/functions/notify-admin/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
serve(async (req) => {
  const report = await req.json()
  const text = `🚨 신고 접수\n유형: ${report.record.target_type}\n사유: ${report.record.reason}`
  await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
  return new Response('ok')
})
```

> `SLACK_WEBHOOK_URL` = Supabase Edge Function secrets에 저장 (GitHub Secrets와 무관).
> 신고 5회 → auto_hide 트리거(L2-25)와 함께 운영자는 Slack 알림 → 24시간 내 검토 → `reports.status` 업데이트 + `hidden` 복원/유지.
> Edge Function 무료 한도 50만 회 → 신고 건수 기준 문제없음.

---

## 20. 결정 로그 — 루프11 (2026-06-10) — 서브에이전트 적대 검토 11차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L11-1 | security/rls | `reviews` SELECT 정책에 `TO anon, authenticated` 명시. `review_history` SELECT = `TO authenticated` + `user_id = auth.uid()` OR `role='admin'` |
| L11-2 | data-integrity | `comment_count` 트리거 DELETE 분기에 `parent_id IS NULL` 조건 추가 — 루트 댓글만 카운트. 대댓글 CASCADE 삭제 시 이중 차감 방지 |
| L11-3 | security | `nickname_changed_at` 클라이언트 직접 조작 차단: BEFORE UPDATE 트리거로 자동 갱신(`now()` 강제 덮어쓰기). RLS WITH CHECK에서 제거 |
| L11-4 | ux/data | `product_pcodes DEFAULT '{}'::text[]` — NULL 미발생 보장. 프론트 `(pcodes ?? [])` 방어 코드 명시. 복원 시 단종 pcode 태그 잔존 = 의도된 동작(배너 표시) |
| L11-5 | security | `notify-admin` Edge Function에 `x-webhook-signature` HMAC-SHA256 검증 추가. `WEBHOOK_SECRET` Supabase secrets 등록 |

### 코드·설정 보완 사항 (루프11 반영)

#### L11-1: `reviews` SELECT RLS 롤 명시 + `review_history` RLS 신설

```sql
-- reviews: anon + authenticated 모두 비숨김 리뷰 조회 허용 (명시적 롤 지정)
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT TO anon, authenticated
  USING (hidden = false);

-- review_history: 본인 또는 admin만 조회
CREATE POLICY "review_history_select_own" ON review_history
  FOR SELECT TO authenticated
  USING (
    review_id IN (SELECT id FROM reviews WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
-- anon은 review_history 조회 불가 (RLS 기본 deny)
```

#### L11-2: `update_comment_count()` 루트 댓글만 카운트

```sql
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
DECLARE
  post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 루트 댓글(parent_id IS NULL)만 comment_count 증가
    IF NEW.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- 루트 댓글 삭제만 카운트 차감 — CASCADE로 삭제되는 대댓글은 무시
    IF OLD.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- comment_count 의미 = 루트 댓글 수 (대댓글 미포함). V1 UI와 일치.
```

#### L11-3: `nickname_changed_at` 트리거 강제 갱신

```sql
-- profiles BEFORE UPDATE 트리거: nickname 변경 시 nickname_changed_at 자동 덮어쓰기
-- 클라이언트가 nickname_changed_at에 어떤 값을 보내도 트리거가 now()로 교체
CREATE OR REPLACE FUNCTION set_nickname_changed_at() RETURNS trigger AS $$
BEGIN
  IF NEW.nickname IS DISTINCT FROM OLD.nickname AND OLD.nickname IS NOT NULL THEN
    -- 최초 설정(null→값)은 쿨다운 미적용. 이후 변경부터 now() 강제 기록
    NEW.nickname_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_nickname_changed_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_nickname_changed_at();

-- profiles UPDATE RLS — nickname_changed_at 검증은 트리거에 위임, WITH CHECK에서 제거
-- USING: (auth.uid() = id) AND (nickname IS NULL OR nickname_changed_at < now() - interval '30 days')
-- WITH CHECK: (auth.uid() = id) AND (role = OLD.role)  ← nickname_changed_at 조작 방어 불필요(트리거가 덮어씀)
```

#### L11-4: `product_pcodes` NULL 방지 + 프론트 방어

```sql
-- posts 테이블 DEFAULT 보강
ALTER TABLE posts ALTER COLUMN product_pcodes SET DEFAULT '{}'::text[];
-- 기존 NULL 행 보정
UPDATE posts SET product_pcodes = '{}' WHERE product_pcodes IS NULL;
```

```js
// 프론트엔드: product_pcodes null 안전 처리
const pcodes = post.product_pcodes ?? [];   // null·undefined 모두 빈 배열로
pcodes.forEach(pcode => {
  const isDiscontinued = discontinuedPcodes.includes(pcode);
  // isDiscontinued = true → 태그 클릭 비활성화 + "단종" 라벨
});
```

#### L11-5: `notify-admin` 서명 검증 추가

```ts
// supabase/functions/notify-admin/index.ts (L10-5 코드 보강)
import { serve } from 'https://deno.land/std/http/server.ts'

const encoder = new TextEncoder()

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (!secret) return false
  const sig = req.headers.get('x-webhook-signature') ?? ''
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedHex = Array.from(new Uint8Array(expected))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return sig === expectedHex
}

serve(async (req) => {
  const body = await req.text()
  if (!(await verifySignature(req, body))) {
    return new Response('Unauthorized', { status: 401 })
  }
  const { record } = JSON.parse(body)
  const text = `🚨 신고 접수\n유형: ${record.target_type}\n사유: ${record.reason}`
  await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
    method: 'POST', body: JSON.stringify({ text })
  })
  return new Response('ok')
})
```

```
Supabase Dashboard → Edge Functions → notify-admin → Secrets:
  SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...
  WEBHOOK_SECRET    = [임의 랜덤 32바이트 hex — Supabase Webhook 설정에서 동일값 입력]
```

---

## 21. 결정 로그 — 루프12 (2026-06-10) — 서브에이전트 적대 검토 12차 (구현 함정)

서브에이전트 5개 구현 단계 함정 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L12-1 | impl | `initAuth()`는 반드시 `await`로 호출. `<script type="module">`에서 top-level await 사용. UGC 버튼 렌더링은 initAuth 완료 후 |
| L12-2 | impl | 모든 마이그레이션 파일에 `ALTER TABLE t ENABLE ROW LEVEL SECURITY` 필수 포함. 빠지면 RLS 비활성화(=완전 공개 쓰기) |
| L12-3 | impl | `pages.yml` sed 치환 대상에 `auth-callback.html` 명시적 포함. 빌드 후 `grep -r '__SUPABASE' site/` 검증 스텝 추가 |
| L12-4 | ops | `ping.yml`에 최대 3회 retry 로직 추가(30초 간격). pause resume cold start ≈ 30~60초 — 첫 번째 실패는 재시도, 3회 연속 실패만 경보 |
| L12-5 | impl | `supabaseClient.js` 싱글톤 패턴 강제: HTML에서 `createClient()` 직접 호출 금지. 모든 파일은 `supabaseClient.js`만 import |

### 구현 체크리스트 및 코드 패턴 (루프12 반영)

#### L12-1: `initAuth()` top-level await 패턴

```html
<!-- site/index.html — 올바른 패턴 -->
<script type="module">
  import { initAuth } from './supabaseClient.js';
  import { renderCatalog } from './catalog.js';

  // ✅ initAuth가 완료된 후에만 UI 렌더링
  await initAuth();       // top-level await: module이 defer이므로 DOM은 이미 ready
  renderCatalog();        // 세션 상태 확정 후 렌더링
</script>

<!-- ❌ 금지 패턴 -->
<script type="module">
  import { initAuth } from './supabaseClient.js';
  initAuth();             // await 없음 — 모달 우회, FOUC, UGC 버튼 타이밍 오류
  renderCatalog();
</script>
```

> `<script type="module">`은 기본적으로 `defer`로 동작하여 DOM 파싱 완료 후 실행된다. top-level `await`는 모듈 내 허용이므로 `DOMContentLoaded` 리스너 불필요.

#### L12-2: 마이그레이션 파일 RLS 활성화 필수 패턴

```sql
-- 001_initial.sql 필수 구조 (테이블 생성 직후 반드시 포함)
CREATE TABLE profiles ( ... );
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;   -- ← 이 줄 없으면 RLS 비활성화!

CREATE TABLE reviews ( ... );
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE posts ( ... );
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE comments ( ... );
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE likes ( ... );
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE TABLE reports ( ... );
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE review_history ( ... );
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY 구문은 ENABLE 이후에만 의미 있음
```

> **S1 착수 검증**: Supabase Dashboard → Table Editor → 각 테이블 → "RLS Enabled" 배지 확인. 또는:
> ```sql
> SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
> -- rowsecurity = true 인지 전 테이블 확인
> ```

#### L12-3: `pages.yml` sed 치환 + 검증 스텝

```yaml
# .github/workflows/pages.yml — sed 치환 스텝
- name: Inject secrets into HTML files
  run: |
    # auth-callback.html을 명시적으로 포함 (glob 패턴 실수 방지)
    for f in site/index.html site/product.html site/community.html site/auth-callback.html; do
      sed -i "s|__SUPABASE_URL__|${{ secrets.SUPABASE_URL }}|g" "$f"
      sed -i "s|__SUPABASE_ANON_KEY__|${{ secrets.SUPABASE_ANON_KEY }}|g" "$f"
      sed -i "s|__CACHE_VERSION__|${{ github.run_number }}|g" "$f"
    done

- name: Verify no placeholders remain
  run: |
    # 플레이스홀더가 남아있으면 빌드 실패
    if grep -r '__SUPABASE\|__CACHE_VERSION' site/; then
      echo "ERROR: unreplaced placeholder found"
      exit 1
    fi
```

#### L12-4: `ping.yml` retry 로직

```yaml
# .github/workflows/ping.yml
- name: Ping Supabase (with retry for cold start)
  run: |
    for i in 1 2 3; do
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
        -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
        "${{ secrets.SUPABASE_URL }}/rest/v1/profiles?select=id&limit=1")
      if [ "$STATUS" = "200" ]; then
        echo "Ping OK (attempt $i)"
        exit 0
      fi
      echo "Attempt $i failed (HTTP $STATUS), retrying in 30s..."
      sleep 30
    done
    echo "ERROR: Supabase ping failed after 3 attempts"
    exit 1
  # pause resume cold start = 30~60초. 3회 재시도면 충분.
```

#### L12-5: `supabaseClient.js` 싱글톤 강제 패턴

```js
// site/supabaseClient.js — 싱글톤 (유일한 createClient 호출 지점)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.x.x/+esm'

// 모듈 최상위에서 한 번만 생성 — 브라우저가 같은 URL의 모듈을 캐싱하므로 싱글톤 보장
export const supabase = createClient('__SUPABASE_URL__', '__SUPABASE_ANON_KEY__')

export async function initAuth() { /* ... */ }
export async function signIn(provider) { /* ... */ }
export async function signOut() { /* ... */ }
```

```js
// ✅ 모든 HTML에서 이 패턴만 허용
import { supabase, initAuth } from './supabaseClient.js'

// ❌ 절대 금지 — 인스턴스 분리로 onAuthStateChange 작동 안 함
import { createClient } from 'https://cdn.jsdelivr.net/.../+esm'
const supabase = createClient(URL, KEY)
```

> **코드 리뷰 체크포인트**: PR 시 `grep -r 'createClient' site/*.js site/*.html`으로 `supabaseClient.js` 외 다른 파일에서 `createClient` 호출이 없는지 확인.

---

## 22. 결정 로그 — 루프13 (2026-06-10) — 서브에이전트 적대 검토 13차

서브에이전트 5개 구멍 발굴 → 전부 결정 완료.

| # | 카테고리 | 결정 |
|---|---|---|
| L13-1 | impl | `onAuthStateChange` 구독 모듈 스코프 변수로 저장. `initAuth()` 재진입 시 이전 구독 해제(guard) |
| L13-2 | impl | `localStorage` 접근 전 try-catch. 실패 시 `sessionStorage`로 무음 폴백. `safeLocalStorage` 래퍼 |
| L13-3 | security | `reviews.updated_at` BEFORE UPDATE 트리거 추가(`posts`와 동일). 클라이언트 전달값 `now()`로 강제 덮어씀. `updateReview()`에서 `updated_at` 파라미터 제거 |
| L13-4 | security | `supabaseClient.js` CDN import에 SRI 해시 필수. 버전 업그레이드 절차 명문화(CVE 후 24h 목표) |
| L13-5 | ops | `reviews` DELETE → Database Webhook → Edge Function `cleanup-review-images`. UPDATE 시 클라이언트에서 이전/새 이미지 diff → `storage.remove()` |

### 코드 보완 사항 (루프13 반영)

#### L13-1: `onAuthStateChange` 구독 guard

```js
// supabaseClient.js — 모듈 스코프에 단일 구독 변수
let authSubscription = null

export async function initAuth() {
  // 재진입 guard: 이전 구독 해제
  if (authSubscription) {
    authSubscription.unsubscribe()
    authSubscription = null
  }
  const { data: { user } } = await supabase.auth.getUser()
  // ... age_verified, nickname 체크 ...
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      const redirect = safeLocalStorage.getItem('redirect_after_login')
      safeLocalStorage.removeItem('redirect_after_login')
      if (redirect) location.replace(redirect)
    }
  })
  authSubscription = subscription
}
```

#### L13-2: `safeLocalStorage` 래퍼

```js
// supabaseClient.js — localStorage/sessionStorage 폴백 래퍼
export const safeLocalStorage = {
  getItem(key) {
    try { return localStorage.getItem(key) }
    catch { try { return sessionStorage.getItem(key) } catch { return null } }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value) }
    catch { try { sessionStorage.setItem(key, value) } catch { /* 시크릿+예외 무음 처리 */ } }
  },
  removeItem(key) {
    try { localStorage.removeItem(key) } catch {}
    try { sessionStorage.removeItem(key) } catch {}
  }
}
// 기존 localStorage 직접 호출 → 전부 safeLocalStorage로 교체
```

#### L13-3: `reviews.updated_at` 트리거

```sql
-- set_updated_at() 함수는 posts·comments 트리거에서 이미 생성됨 — 재사용
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

```js
// ❌ 수정 전: updated_at 직접 전달
await supabase.from('reviews').update({ body, rating, updated_at: new Date().toISOString() })
// ✅ 수정 후: updated_at 제거 — 트리거가 강제 갱신
await supabase.from('reviews').update({ body, rating })
```

#### L13-4: `supabase-js` SRI + 업그레이드 절차

```html
<!-- site/index.html — supabaseClient.js SRI 적용 -->
<script type="module"
  src="./supabaseClient.js"
  crossorigin="anonymous"
  integrity="sha384-[pages.yml 빌드 단계에서 자동 계산]">
</script>
```

```yaml
# pages.yml 추가 스텝 — supabaseClient.js SRI 해시 자동 주입
- name: Compute SRI for supabaseClient.js
  run: |
    HASH=$(openssl dgst -sha384 -binary site/supabaseClient.js | openssl base64 -A)
    sed -i "s|__SUPABASE_CLIENT_SRI__|sha384-${HASH}|g" site/index.html site/product.html site/community.html
```

> **업그레이드 절차**: CVE 공개 → 24시간 내 (1) CDN URL 버전 번호 변경 (2) 새 SRI 해시 계산 (3) `supabaseClient.js` 수정 → PR → 배포.

#### L13-5: `reviews` 이미지 Storage cleanup

```
Supabase Dashboard → Database → Webhooks:
  테이블: reviews, 이벤트: DELETE
  URL: .../functions/v1/cleanup-review-images
  Secret: WEBHOOK_SECRET (L11-5와 동일 패턴)
```

```ts
// supabase/functions/cleanup-review-images/index.ts
serve(async (req) => {
  const body = await req.text()
  if (!(await verifySignature(req, body))) return new Response('Unauthorized', { status: 401 })
  const { old_record } = JSON.parse(body)
  const paths: string[] = old_record.images ?? []
  if (paths.length > 0) {
    await supabase.storage.from('review-images').remove(paths)
  }
  return new Response('ok')
})
```

```js
// updateReview() — 이미지 diff cleanup
async function updateReview(reviewId, oldImages, newImages, body, rating) {
  const removed = (oldImages ?? []).filter(p => !(newImages ?? []).includes(p))
  if (removed.length > 0) {
    await supabase.storage.from('review-images').remove(removed)
  }
  await supabase.from('reviews').update({ images: newImages ?? [], body, rating })
    .eq('id', reviewId)
}
```

---

## 23. 결정 로그 — 루프14 (2026-06-10) — 서브에이전트 적대 검토 14차

서브에이전트 11개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L14-1 | infra | Edge Function 코드를 `supabase/functions/` 디렉터리에 git 추적 포함. `pages.yml`에 `deploy-edge-functions` job 추가 (`supabase functions deploy --project-ref`) |
| L14-2 | storage | 버킷을 Private으로 유지하고 Storage Policy에서 GET은 전체 허용, LIST 차단. 공개 버킷 + LIST 차단 불가(Supabase 제약) → Private + 경로 UUID로 열거 불가 보장 |
| L14-3 | infra | `review_history` / `post_history` 최대 20건 트리밍 BEFORE INSERT 트리거 추가. DB 크기 모니터링 `check-cron-health.yml`에 추가 |
| L14-4 | security | Supabase Redirect URL 등록: 프로덕션 1개 + localhost:5500 1개 명시. 와일드카드(`*.github.io/*`) 사용 금지. 카카오 개발자센터 Redirect URI도 동일하게 등록 — 9절 체크리스트 업데이트 |
| L14-5 | schema | `product_pcodes` 요소 정규식 CHECK 추가: `'^[0-9]{5,12}$'` 패턴. V1 DB 외래키 불가(정적 JSON 기반)이므로 format 검증만 |
| L14-6 | schema | 리뷰 수정 24시간 내 최대 5회 BEFORE UPDATE 트리거 추가. `review_history` 팽창 방지 |
| L14-7 | schema | `posts.tags` 요소 수 ≤10, 요소당 길이 ≤30자 CHECK 추가 |
| L14-8 | security | GitHub Secrets를 `production` Environment로 격리. `SERVICE_ROLE_KEY`는 Environment secrets만 접근 가능하도록 설정. anon key 유출 시 Supabase JWT secret 재생성 절차 9절에 추가 |
| L14-9 | security/rls | `likes` INSERT RLS WITH CHECK에 게시글 공개 여부 조건 추가: `EXISTS(SELECT 1 FROM posts WHERE id=post_id AND deleted_at IS NULL AND hidden=false)` |
| L14-10 | security | 모든 RPC에 SECURITY 속성 명시 규칙 확립: 공개 조회용 = `SECURITY INVOKER`(명시), admin/write용 = `SECURITY DEFINER`+role 체크. 코드 리뷰 체크포인트 추가 |
| L14-11 | data-integrity | `review_history` 90일 pg_cron 물리 삭제 추가. `post_history`는 posts CASCADE로 자동 처리이므로 별도 불필요 |

### 스키마/코드 보완 사항 (루프14 반영)

**`tags` CHECK + `product_pcodes` 형식 검증** (L14-5, L14-7):
```sql
ALTER TABLE posts ADD CONSTRAINT chk_tags_format
  CHECK (
    tags IS NULL OR (
      array_length(tags, 1) <= 10
      AND (SELECT bool_and(length(tag) BETWEEN 1 AND 30)
           FROM unnest(tags) AS tag)
    )
  );

ALTER TABLE posts ADD CONSTRAINT chk_product_pcodes_format
  CHECK (
    product_pcodes IS NULL OR
    (SELECT bool_and(pcode ~ '^[0-9]{5,12}$')
     FROM unnest(product_pcodes) AS pcode)
  );
```

**`review_history` 보관 트리밍 트리거** (L14-3, L14-6):
```sql
-- 이력 20건 초과 트리밍
CREATE OR REPLACE FUNCTION trim_review_history() RETURNS trigger AS $$
BEGIN
  DELETE FROM review_history
  WHERE id IN (
    SELECT id FROM review_history
    WHERE review_id = NEW.review_id
    ORDER BY edited_at DESC
    OFFSET 20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_trim_review_history AFTER INSERT ON review_history
  FOR EACH ROW EXECUTE FUNCTION trim_review_history();

-- 리뷰 수정 rate limit: 24h 내 최대 5회
CREATE OR REPLACE FUNCTION check_review_edit_rate() RETURNS trigger AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM review_history
    WHERE review_id = NEW.id
      AND edited_at > now() - interval '24 hours'
  ) >= 5 THEN
    RAISE EXCEPTION 'review_edit_limit_exceeded: max 5 edits per 24h';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_review_edit_rate BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_edit_rate();
```

**`likes` INSERT RLS 강화** (L14-9):
```sql
DROP POLICY IF EXISTS "likes_insert_auth" ON likes;
CREATE POLICY "likes_insert_auth" ON likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id
        AND deleted_at IS NULL
        AND hidden = false
    )
  );
```

**`review_history` 90일 pg_cron 삭제** (L14-11):
```sql
-- 001_s1_init.sql 섹션9에 추가
SELECT cron.schedule('cleanup-review-history', '0 3 * * 0',
  $$DELETE FROM review_history WHERE edited_at < now() - interval '90 days'$$
);
```

**Edge Function 배포 workflow** (L14-1):
```yaml
# .github/workflows/pages.yml — 추가 job
deploy-edge-functions:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: supabase/setup-cli@v1
      with: { version: latest }
    - name: Deploy Edge Functions
      run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Supabase Redirect URL 등록 명세 (L14-4)
```
프로덕션: https://bansungju.github.io/camping/site/auth-callback.html
개발:     http://localhost:5500/site/auth-callback.html
와일드카드 사용 금지 (*.github.io/* → subdomain takeover 벡터)
카카오 개발자센터 Redirect URI: 동일 2개 URL 등록 필수
```

---

## 24. 결정 로그 — 루프15 (2026-06-10) — 서브에이전트 적대 검토 15차

서브에이전트 11개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L15-1 | data-integrity | `post_history` 트리밍: posts 소프트삭제 30일 후 CASCADE 삭제로 자동 처리. 생존 중인 게시글의 post_history는 최대 20건 트리밍 AFTER INSERT 트리거 추가 |
| L15-2 | security | `get_review_stats()`, `get_posts_popular()` 정의에 `SECURITY INVOKER` 명시 추가 (L14-10 규칙 준수) |
| L15-3 | schema | 댓글 조회 WHERE 조건을 `deleted_at IS NULL AND hidden = false`(AND)로 명문화. auto_hide 트리거는 이미 소프트삭제된 댓글(`deleted_at IS NOT NULL`)에 대해 hidden 업데이트 시도 스킵 |
| L15-4 | migration | `post_history` INSERT RLS 최종 단일 정의: `WITH CHECK (false)`. 섹션8 Policies에 명시 |
| L15-5 | ux | NULL 제목 게시글: `post_feed_item` SELECT에서 `COALESCE(title, '(제목 없음)')` 처리. 프론트 폴백과 DB 폴백 중 DB 폴백 채택 |
| L15-6 | security/storage | Storage INSERT Policy에 `lower(storage.extension(name)) IN ('webp','jpg','jpeg','png')` 조건 추가. MIME sniffing은 V2 Edge Function webhook으로 처리 |
| L15-7 | impl | `delete_account_atomic`: Postgres RPC로 DB 원자성 처리(profiles 익명화 + posts/comments 소프트삭제 + likes 삭제), `auth.users` 삭제는 Edge Function에서 service_role로 RPC 호출 후 처리. `001_s1_init.sql` 섹션7에 RPC 정의 유지 |
| L15-8 | infra | V1 로컬 개발 = 원격 staging 프로젝트 직접 사용(`SUPABASE_URL=staging`). `supabase start` 미사용(pg_cron 비활성화 한계). `.env.local` 파일에 staging 값 저장, git ignore 처리 |
| L15-9 | privacy/rls | `profiles` SELECT를 `id, nickname, avatar_url`만 노출하는 `public_profile` VIEW로 제한하거나, SELECT RLS를 인증 사용자로 제한. V1 결정: "의도적 전체 공개" 명문화 + `age_verified`/`nickname_changed_at` 노출 허용 (이메일/전화 없으므로 PIPA 비적용 판단) |
| L15-10 | data-integrity | `comments` BEFORE INSERT 트리거에 대댓글 2단계 중첩 차단 추가 (L2-12 결정 DB 레벨 강제) |
| L15-11 | ops | 신고 기각(`reports.status='dismissed'`) 시 `hidden` 자동 복원: V1 = Dashboard SQL 수동 처리(admin 운영 절차서에 명시). V2 = `reports` AFTER UPDATE 트리거로 자동화 |

### 스키마/코드 보완 사항 (루프15 반영)

**`post_history` 트리밍 트리거** (L15-1):
```sql
CREATE OR REPLACE FUNCTION trim_post_history() RETURNS trigger AS $$
BEGIN
  DELETE FROM post_history
  WHERE id IN (
    SELECT id FROM post_history
    WHERE post_id = NEW.post_id
    ORDER BY edited_at DESC
    OFFSET 20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_trim_post_history AFTER INSERT ON post_history
  FOR EACH ROW EXECUTE FUNCTION trim_post_history();
```

**`get_posts_popular()` SECURITY INVOKER 명시 + COALESCE 제목** (L15-2, L15-5):
```sql
CREATE OR REPLACE FUNCTION get_posts_popular(
  p_period          text DEFAULT 'all',
  p_last_like_count int DEFAULT NULL,
  p_last_created_at timestamptz DEFAULT NULL,
  p_limit           int DEFAULT 20
) RETURNS SETOF post_feed_item LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT id, user_id,
         COALESCE(title, '(제목 없음)') AS title,
         images[1] AS thumbnail,
         like_count, comment_count, created_at, tags
  FROM posts
  WHERE deleted_at IS NULL AND hidden = false
    AND CASE p_period
          WHEN 'week'  THEN created_at > now() - interval '7 days'
          WHEN 'month' THEN created_at > now() - interval '30 days'
          ELSE true END
    AND (p_last_like_count IS NULL OR
         (like_count, created_at) < (p_last_like_count, p_last_created_at))
  ORDER BY like_count DESC, created_at DESC
  LIMIT p_limit;
$$;
```

**`get_review_stats()` SECURITY INVOKER 명시** (L15-2):
```sql
CREATE OR REPLACE FUNCTION get_review_stats(primary_pcodes text[])
RETURNS TABLE(pcode text, avg_rating numeric, review_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT product_pcode, ROUND(AVG(rating)::numeric, 1), COUNT(*)
  FROM reviews
  WHERE product_pcode = ANY(primary_pcodes)
    AND hidden = false
  GROUP BY product_pcode;
$$;
```

**`comments` 대댓글 깊이 차단 트리거** (L15-10):
```sql
CREATE OR REPLACE FUNCTION check_comment_depth() RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF (SELECT parent_id FROM comments WHERE id = NEW.parent_id) IS NOT NULL THEN
      RAISE EXCEPTION 'max_depth_exceeded: 대댓글은 1단계까지만 허용';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_comment_depth BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_comment_depth();
```

**Storage MIME 타입 검증 Policy** (L15-6):
```sql
-- post-images / review-images 공통 INSERT Policy 추가
CREATE POLICY "images_insert_mime" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('post-images', 'review-images')
    AND lower(storage.extension(name)) IN ('webp', 'jpg', 'jpeg', 'png')
  );
```

**신고 기각 시 hidden 복원 — V1 admin 운영 절차** (L15-11):
```sql
-- V1: Dashboard에서 신고 기각 시 아래 두 쿼리를 순서대로 실행
UPDATE reports SET status = 'dismissed' WHERE id = '<report_id>';
UPDATE posts SET hidden = false WHERE id = '<target_id>';  -- 또는 reviews/comments
-- V2: reports AFTER UPDATE 트리거로 자동화 예정
```

---

## 25. 결정 로그 — 루프16 (2026-06-10) — 서브에이전트 적대 검토 16차

서브에이전트 10개 구멍 발굴 → 결정 반영.

| # | 카테고리 | 결정 |
|---|---|---|
| L16-1 | security/rls | `reviews` DELETE RLS 추가: `USING (user_id = auth.uid())`. admin 삭제는 service_role(RLS bypass) |
| L16-2 | data-integrity/legal | `reviews`에 `deleted_at timestamptz DEFAULT NULL` 추가. 탈퇴 시 `deleted_at=now()` + pg_cron 30일 후 물리삭제. PIPA §21 파기 의무 대응 |
| L16-3 | perf | `get_posts_popular()` cursor에 `p_last_id uuid` 추가. 3중 `(like_count, created_at, id)` DESC cursor로 중복·누락 방지 |
| L16-4 | security | `delete_account_atomic()` 내부에 `user_id <> auth.uid()` 검증 추가 (admin 예외). Edge Function은 JWT 검증 후 RPC 호출 |
| L16-5 | ops | pg_cron `cron.schedule()` 동일 job 이름 = upsert 동작 (에러 없이 교체). `001_s1_init.sql` 섹션9 주석에 명시 |
| L16-6 | security/rls | `comments` DELETE + UPDATE(소프트삭제) RLS 명시: `USING (user_id = auth.uid())` |
| L16-7 | security/rls | `reviews` admin hidden 복원은 Dashboard(service_role)로 명시. admin UPDATE 정책 별도 추가 |
| L16-8 | impl | `handle_new_user()` 트리거 함수 본문 `001_s1_init.sql` 섹션4에 명시. `role='user'` DEFAULT 보장 |
| L16-9 | impl | `check_text_content()`를 posts용과 reviews/comments용으로 분리. reviews/comments 함수에서 `NEW.title` 참조 제거 |
| L16-10 | security/rls | `posts` UPDATE RLS WITH CHECK 명시: `hidden`, `like_count`, `comment_count` 직접 변경 차단 |

### 스키마/코드 보완 사항 (루프16 반영)

**`reviews` `deleted_at` 추가 + 탈퇴 처리** (L16-2):
```sql
ALTER TABLE reviews ADD COLUMN deleted_at timestamptz DEFAULT NULL;
CREATE INDEX idx_reviews_deleted ON reviews(deleted_at) WHERE deleted_at IS NULL;

-- pg_cron: 30일 후 물리삭제 (섹션9에 추가)
SELECT cron.schedule('cleanup-deleted-reviews', '0 4 * * *',
  $$DELETE FROM reviews WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 days'$$
);
-- delete_account_atomic()에서 추가
UPDATE reviews SET deleted_at = now() WHERE user_id = p_user_id AND deleted_at IS NULL;
```

**`reviews` DELETE RLS + admin UPDATE 정책** (L16-1, L16-7):
```sql
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reviews_update_admin" ON reviews
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

**`comments` DELETE/UPDATE RLS** (L16-6):
```sql
CREATE POLICY "comments_delete_own" ON comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());
```

**`get_posts_popular()` 3중 cursor** (L16-3):
```sql
CREATE OR REPLACE FUNCTION get_posts_popular(
  p_period          text DEFAULT 'all',
  p_last_like_count int DEFAULT NULL,
  p_last_created_at timestamptz DEFAULT NULL,
  p_last_id         uuid DEFAULT NULL,
  p_limit           int DEFAULT 20
) RETURNS SETOF post_feed_item LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT id, user_id,
         COALESCE(title, '(제목 없음)') AS title,
         images[1] AS thumbnail,
         like_count, comment_count, created_at, tags
  FROM posts
  WHERE deleted_at IS NULL AND hidden = false
    AND CASE p_period
          WHEN 'week'  THEN created_at > now() - interval '7 days'
          WHEN 'month' THEN created_at > now() - interval '30 days'
          ELSE true END
    AND (p_last_like_count IS NULL OR
         (like_count, created_at, id) < (p_last_like_count, p_last_created_at, p_last_id))
  ORDER BY like_count DESC, created_at DESC, id DESC
  LIMIT p_limit;
$$;
```

**`posts` UPDATE RLS WITH CHECK** (L16-10):
```sql
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (
    user_id = auth.uid()
    AND hidden = (SELECT hidden FROM posts WHERE id = NEW.id)
    AND like_count = (SELECT like_count FROM posts WHERE id = NEW.id)
    AND comment_count = (SELECT comment_count FROM posts WHERE id = NEW.id)
    AND deleted_at IS NULL
  );

CREATE POLICY "posts_update_admin" ON posts
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

**`handle_new_user()` 트리거 함수** (L16-8):
```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles(id, nickname, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**`check_text_content()` posts용 / reviews·comments용 분리** (L16-9):
```sql
-- reviews, comments 전용 (title 컬럼 없음)
CREATE OR REPLACE FUNCTION check_body_content() RETURNS trigger AS $$
DECLARE
  term text;
  blocked text[] := ARRAY['씨발','개새끼','병신','미친놈','존나','ㅅㅂ','ㅂㅅ'];
BEGIN
  FOREACH term IN ARRAY blocked LOOP
    IF lower(coalesce(NEW.body,'')) LIKE '%' || term || '%' THEN
      RAISE EXCEPTION 'content_policy_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 check_text_content()는 posts 전용 유지 (title + body 검사)
-- reviews/comments 트리거를 check_body_content()로 교체
DROP TRIGGER IF EXISTS trg_review_content ON reviews;
CREATE TRIGGER trg_review_content BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_body_content();

DROP TRIGGER IF EXISTS trg_comment_content ON comments;
CREATE TRIGGER trg_comment_content BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION check_body_content();
```
