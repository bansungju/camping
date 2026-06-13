-- ════════════════════════════════════════════════════════════════════
--  APPLY-NOW.sql — 라이브 1회 적용용 통합 스크립트 (의존성 충족·멱등)
--  Supabase 대시보드 → SQL Editor 에 전체 붙여넣고 RUN 한 번이면 끝.
--
--  라이브 실측(2026-06-11): 001~004 만 적용됨. 005~015 미적용.
--    · comments(001)       = 존재  → 015 단독 적용 가능
--    · click_events(008)   = 없음  → 013(get_hot_items)이 참조하므로 008 선행 필요
--    · posts.tags(007)·gear_sets(006) = 없음 → 012(get_top_gear_tags)는 보류(아래 참고)
--
--  포함: 008(클릭이벤트 테이블) + 013(이번주 인기 RPC, H-01) + 015(댓글 카운트, H-34)
--  전체를 한 트랜잭션으로 묶어 부분실패 시 전부 롤백(원자성). 멱등 — 재실행 안전.
--  ⚠️ 009_comments.sql 은 실행 금지(라이브 비호환·중복 카운트 유발).
-- ════════════════════════════════════════════════════════════════════
BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 008 — 클릭 추적 테이블(쿠팡 구매 클릭). 013 RPC의 집계 원본 + 앱 클릭로깅 대상.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.click_events (
  id          bigserial primary key,
  event_type  text not null default 'coupang_buy',
  slug        text not null,
  brand       text,
  model       text,
  coupang_url text,
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,
  created_at  timestamptz not null default now()
);
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- 정책 멱등 처리(재실행 안전)
DROP POLICY IF EXISTS "anyone can insert click events" ON public.click_events;
CREATE POLICY "anyone can insert click events"
  ON public.click_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "users can read own clicks" ON public.click_events;
CREATE POLICY "users can read own clicks"
  ON public.click_events FOR SELECT USING (user_id = auth.uid());

GRANT INSERT ON public.click_events TO anon, authenticated;
GRANT SELECT ON public.click_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.click_events_id_seq TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 013 — 홈 "이번 주 인기" 클릭 TOP 집계 RPC (버그 H-01)
--   click_events 컬럼은 slug — 앱은 cat 키를 기대하므로 slug AS cat 매핑.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_hot_items(days_n int DEFAULT 7, limit_n int DEFAULT 8)
RETURNS TABLE(brand text, model text, cat text, clicks bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand, model, slug AS cat, COUNT(*) AS clicks
  FROM click_events
  WHERE created_at > NOW() - (days_n || ' days')::interval
    AND brand IS NOT NULL AND model IS NOT NULL
  GROUP BY brand, model, slug
  ORDER BY clicks DESC
  LIMIT limit_n;
$$;
GRANT EXECUTE ON FUNCTION get_hot_items(int, int) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 015 — 댓글 소프트삭제 시 comment_count 감소 트리거 (버그 H-34)
-- ─────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_inc_comment_count ON comments;
DROP TRIGGER IF EXISTS trg_dec_comment_count ON comments;
DROP FUNCTION IF EXISTS inc_comment_count();
DROP FUNCTION IF EXISTS dec_comment_count();

CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
DECLARE post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NULL AND NEW.deleted_at IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NULL AND OLD.deleted_at IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
          UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.post_id;
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
          UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comment_count ON comments;
CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

UPDATE posts p SET comment_count = sub.cnt
FROM (
  SELECT po.id, COUNT(c.id) AS cnt
  FROM posts po
  LEFT JOIN comments c
    ON c.post_id = po.id AND c.parent_id IS NULL AND c.deleted_at IS NULL
  GROUP BY po.id
) sub
WHERE p.id = sub.id
  AND p.comment_count <> sub.cnt;

-- 022: click_events item_idx + get_hot_items RPC 업데이트
ALTER TABLE public.click_events ADD COLUMN IF NOT EXISTS item_idx integer;

CREATE OR REPLACE FUNCTION get_hot_items(days_n int DEFAULT 7, limit_n int DEFAULT 8)
RETURNS TABLE(brand text, model text, cat text, clicks bigint, item_idx integer)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand, model, slug AS cat, COUNT(*) AS clicks, MIN(item_idx) AS item_idx
  FROM click_events
  WHERE created_at > NOW() - (days_n || ' days')::interval
    AND brand IS NOT NULL AND model IS NOT NULL
  GROUP BY brand, model, slug
  ORDER BY clicks DESC
  LIMIT limit_n;
$$;

GRANT EXECUTE ON FUNCTION get_hot_items(int, int) TO anon, authenticated;

COMMIT;

-- ════════════════════════════════════════════════════════════════════
--  검증(터미널, anon 키):
--    curl -s -X POST "$URL/rest/v1/rpc/get_hot_items" -H "apikey: $ANON" \
--      -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
--      -d '{"days_n":7,"limit_n":30}' -w '\nHTTP %{http_code}\n'   →  HTTP 200
--    (빈 배열 []는 아직 쿠팡 구매클릭 로그가 없어서 정상 — 홈은 fallback 표시)
--
--  ── 보류: 012 get_top_gear_tags (커뮤니티 인기 태그) ──────────────────
--  posts.tags·is_public(007) + gear_sets(006) 컬럼/테이블이 라이브에 없어
--  지금 적용 불가. 인기태그 기능을 켜려면 006→007 먼저 적용 후 012 실행 필요.
--  (H-01/H-34 와 무관한 부차 기능이라 본 스크립트에서 분리.)
-- ════════════════════════════════════════════════════════════════════
