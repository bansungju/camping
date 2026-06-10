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

## 검증
1. 로그인 → 닉네임 설정 → 커뮤니티 "글쓰기"로 글 작성(사진 포함) → 피드/상세 표시
2. 좋아요 토글 / 댓글 작성 / 신고 동작 확인

---
프론트엔드 연동 지점: `site/supabaseClient.js`(listPosts/createPost/uploadImage 등),
`site/community.html`(피드·작성·상세·댓글·좋아요 UI).
