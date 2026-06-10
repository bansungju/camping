-- ============================================================
-- 004 — 테이블 GRANT 누락 수정 + 찜 동기화(wishlists) 테이블
--
-- 왜 필요한가:
--   001~003의 RLS 정책은 `FOR SELECT TO anon` 등으로 "행 수준" 접근만 정의한다.
--   PostgreSQL은 그 전에 "테이블 수준" GRANT(SELECT/INSERT/...)가 있어야 한다.
--   GRANT가 없으면 RLS 평가 전에 42501(permission denied)로 막힌다.
--   → 현재 anon이 reviews/profiles를 한 줄도 못 읽고, authenticated도 못 쓴다.
--   이 파일이 그 잠금을 푼다. (GRANT는 멱등)
--
-- Supabase SQL Editor에서 전체 선택 후 실행.
-- ============================================================

-- ── A. 공개 읽기 (anon + authenticated) — RLS가 행을 추가 필터 ──
GRANT SELECT ON public.profiles  TO anon, authenticated;
GRANT SELECT ON public.reviews   TO anon, authenticated;
GRANT SELECT ON public.posts     TO anon, authenticated;
GRANT SELECT ON public.comments  TO anon, authenticated;

-- ── B. 로그인 사용자 쓰기 — RLS WITH CHECK가 본인 행으로 제한 ──
GRANT INSERT, UPDATE ON public.profiles TO authenticated;  -- 닉네임/아바타 본인 수정
GRANT INSERT, UPDATE ON public.reviews  TO authenticated;  -- 작성/수정(소프트삭제=UPDATE)
GRANT INSERT, UPDATE ON public.posts    TO authenticated;
GRANT INSERT, UPDATE ON public.comments TO authenticated;

-- 좋아요: 본인 행 조회/추가/해제
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;

-- 신고: 본인 작성(INSERT). SELECT는 RLS에서 admin만 통과.
GRANT INSERT, SELECT ON public.reports TO authenticated;

-- 수정 이력: 본인/admin 조회(RLS). 직접 INSERT는 정책상 차단(WITH CHECK false).
GRANT SELECT ON public.review_history TO authenticated;
GRANT SELECT ON public.post_history   TO authenticated;

-- ⚠ rate_limit_log 는 의도적으로 GRANT 안 함 (트리거/service_role 전용, 우회 방지)

-- ── C. 공개 RPC ──
GRANT EXECUTE ON FUNCTION public.get_review_stats(text[]) TO anon, authenticated;

-- ============================================================
-- ── D. 찜(위시리스트) 동기화 테이블 ──
--   계정당 1행(items jsonb). 로그인 시 로컬↔원격 병합 후 저장.
--   항목 형태는 프론트 localStorage "wish"와 동일: {key,b,m,cap,s,p,img}
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  user_id    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  items      jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_wishlist_is_array CHECK (jsonb_typeof(items) = 'array'),
  CONSTRAINT chk_wishlist_len      CHECK (jsonb_array_length(items) <= 500)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_select_own" ON public.wishlists;
CREATE POLICY "wishlists_select_own" ON public.wishlists
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wishlists_insert_own" ON public.wishlists;
CREATE POLICY "wishlists_insert_own" ON public.wishlists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wishlists_update_own" ON public.wishlists;
CREATE POLICY "wishlists_update_own" ON public.wishlists
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- updated_at 자동 갱신 (002의 set_updated_at 재사용)
DROP TRIGGER IF EXISTS trg_wishlists_updated_at ON public.wishlists;
CREATE TRIGGER trg_wishlists_updated_at BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.wishlists TO authenticated;
