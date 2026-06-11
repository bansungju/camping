# Supabase 적용 체크리스트 (커뮤니티 + 사진 업로드)

커뮤니티(#4)·사진 업로드(#3) 프론트엔드는 배포되어 있으나, 아래 백엔드 단계를
**Supabase 대시보드에서 한 번 적용**해야 실제로 동작합니다. (모두 멱등 — 재실행 안전)

## 1. 테이블 GRANT (필수 — 안 하면 "목록을 불러오지 못했어요")
현재 라이브 DB에서 `anon`이 `posts`/`comments`를 못 읽습니다(42501).
SQL Editor에서 **`migrations/004_grants_and_wishlist.sql` 전체**를 실행하세요.
(posts/comments SELECT, likes/reports/comments INSERT 등 잠금 해제)

## 2. 글 사진 컬럼 (사진 첨부용)
SQL Editor에서 **`migrations/005_post_images.sql`** 실행 → `posts.image_urls` 추가.
(미적용 시 텍스트 글은 정상, 사진 첨부 시도만 실패)

## 3. Storage 버킷 (사진 업로드용)
Dashboard → Storage → Buckets에서 **`review-images`** 버킷을 **Public**으로 생성.
그다음 **`migrations/003_storage_policies.sql`** 실행(소유자 폴더 업로드 정책).
사진 경로 규칙: `review-images/{user_id}/{uuid}.{ext}`

## 4. 홈 "이번 주 인기" RPC (버그 H-01) — ⭐ APPLY-NOW.sql 권장
미적용 시 RPC가 PostgREST 스키마 캐시에 없어 **404** → 홈 "이번 주 인기"가
하드코딩 fallback 노출. **단, 013은 `click_events`(008) 테이블에 의존**하는데
라이브에 008이 미적용이라 013만 단독 실행하면 함수 생성이 실패함.

→ **`supabase/APPLY-NOW.sql` 전체를 SQL Editor에 붙여넣고 RUN** 하세요(한 트랜잭션·멱등).
   008(click_events 테이블·RLS·grant) → 013(get_hot_items) → 015(댓글 카운트)를 의존성
   순서로 한 번에 적용합니다.

> 적용 검증(익명 anon 키로):
> ```
> curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_hot_items" \
>   -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
>   -H "Content-Type: application/json" -d '{"days_n":7,"limit_n":30}'
> ```
> 200 + JSON 배열이면 성공(빈 배열 `[]`은 클릭 데이터 부재 — 정상). 404면 미적용.

> 🔶 **보류: 012 `get_top_gear_tags`(커뮤니티 인기 태그)** — `posts.tags`/`is_public`(007)
> + `gear_sets`(006) 컬럼/테이블이 라이브에 없어 지금 적용 불가(`42703 column "tags"`).
> 인기태그 기능을 켜려면 006 → 007 먼저 적용 후 012 실행. H-01/H-34와 무관한 부차 기능.

## 5. 댓글 소프트삭제 카운트 정합성 (버그 H-34)
라이브 `trg_comment_count`(002)는 INSERT/DELETE만 반응하나 앱은 댓글을
`deleted_at` UPDATE로 소프트삭제 → 카운트가 안 줄고 누적 증가.
SQL Editor에서 **`migrations/015_comment_count_softdelete.sql`** 실행(멱등):
트리거를 `UPDATE OF deleted_at`까지 확장 + 기존 드리프트 1회 재집계.

> ⚠️ **`migrations/009_comments.sql`은 적용 금지** — 라이브와 비호환(content 컬럼)이며
> 적용 시 중복 카운트 트리거 유발. 댓글 카운트 SSOT는 015.

## 검증
1. 로그인 → 닉네임 설정 → 커뮤니티 "글쓰기"로 글 작성(사진 포함) → 피드/상세 표시
2. 좋아요 토글 / 댓글 작성 / 신고 동작 확인

---
프론트엔드 연동 지점: `site/supabaseClient.js`(listPosts/createPost/uploadImage 등),
`site/community.html`(피드·작성·상세·댓글·좋아요 UI).
