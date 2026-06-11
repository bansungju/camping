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

## 6. 트리거 함수 SECURITY DEFINER 보정 (M-54·카운트정합·신고숨김)
001/002의 일부 트리거 함수가 `SECURITY DEFINER` 없이 호출자 권한으로 실행되어
RLS·GRANT에 막힘 → **게시글/리뷰 수정이 42501로 하드 실패**(post_history `WITH CHECK(false)`),
**타인 글의 댓글/좋아요 카운트 미반영**(posts RLS), **신고 5회 자동숨김 미작동**.
SQL Editor에서 **`migrations/016_trigger_security_definer.sql`** 실행(멱등, CREATE OR REPLACE):
`update_comment_count`/`update_like_count`/`save_post_history`/`save_review_history`/
`trim_post_history`/`auto_hide_on_reports` 6개를 `SECURITY DEFINER + search_path=public`으로 교체.

> 015를 먼저 적용했어도 016이 `update_comment_count`를 DEFINER 버전으로 최종 대체하므로 무방.

## 8. 🔴 커뮤니티 쓰기 차단 해소 — rate-limit 트리거 DEFINER (H-38, 우선순위 높음)
글/댓글/좋아요/리뷰 작성 시 BEFORE 트리거가 `rate_limit_log`에 기록하는데, 004가
그 테이블에 GRANT를 의도적으로 안 주는 반면 트리거 함수는 SECURITY DEFINER가 아니라
**42501로 작성이 전면 실패**(라이브 공개글 0건의 원인). SQL Editor에서
**`migrations/017_rate_limit_security_definer.sql`** 실행(멱등): 4개 rate-limit 트리거를
`SECURITY DEFINER`로 교체 → 소유자 권한으로 기록, 사용자 직접 grant 없이 동작.

> 016(이력/카운트/숨김)과 017(쓰기 차단)은 같은 부류(트리거 SECURITY DEFINER 누락).
> **둘 다 적용 권장.** 둘 다 CREATE OR REPLACE라 재실행 안전.

## 7. (선택) 세트 원격 동기화 활성화 (M-71/M-63)
앱은 `gear_sets` 테이블로 세트를 기기간 동기화하려 하지만 **테이블이 라이브 미적용**이라
조용히 실패함(로컬스토리지에만 저장). 또 `006`은 테이블·RLS만 있고 **GRANT가 없어**
적용해도 42501로 막혔음 → grant 추가 보정함. 동기화를 켜려면 SQL Editor에서
**`migrations/006_gear_sets.sql`**(grant 포함) 실행.

> 부차 기능이라 H-01/H-34처럼 필수는 아님. 켜면 로그인 시 세트가 동기화됨.
> (`007`의 `posts.gear_set_id` FK도 `gear_sets`를 참조하므로, 007/012를 쓸 거면 006이 선행.)

## 검증
1. 로그인 → 닉네임 설정 → 커뮤니티 "글쓰기"로 글 작성(사진 포함) → 피드/상세 표시
2. 좋아요 토글 / 댓글 작성 / 신고 동작 확인

---
프론트엔드 연동 지점: `site/supabaseClient.js`(listPosts/createPost/uploadImage 등),
`site/community.html`(피드·작성·상세·댓글·좋아요 UI).
