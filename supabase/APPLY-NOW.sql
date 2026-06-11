-- ════════════════════════════════════════════════════════════════════
--  APPLY-NOW.sql — 라이브 1회 적용용 통합 스크립트
--  Supabase 대시보드 → SQL Editor 에 전체 붙여넣고 RUN 한 번이면 끝.
--  포함: 012(인기태그 RPC) + 013(이번주 인기 RPC, H-01) + 015(댓글 카운트, H-34)
--  모두 멱등(재실행 안전). 전체를 한 트랜잭션으로 묶어 부분실패를 방지.
--  ⚠️ 009_comments.sql 은 실행 금지(라이브 비호환·중복 카운트 유발).
-- ════════════════════════════════════════════════════════════════════
BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 012 — 커뮤니티 인기 태그 TOP-N RPC
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_top_gear_tags(limit_n int DEFAULT 10)
RETURNS TABLE(tag text, cnt bigint)
LANGUAGE sql STABLE
AS $$
  SELECT t.tag, COUNT(*) AS cnt
  FROM posts, unnest(tags) AS t(tag)
  WHERE is_public = true
    AND deleted_at IS NULL
    AND t.tag <> ''
  GROUP BY t.tag
  ORDER BY cnt DESC
  LIMIT limit_n;
$$;
GRANT EXECUTE ON FUNCTION get_top_gear_tags(int) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 013 — 홈 "이번 주 인기" 클릭 TOP 집계 RPC (버그 H-01)
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_hot_items(days_n int DEFAULT 7, limit_n int DEFAULT 8)
RETURNS TABLE(brand text, model text, cat text, clicks bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT brand, model, cat, COUNT(*) AS clicks
  FROM click_events
  WHERE created_at > NOW() - (days_n || ' days')::interval
    AND brand IS NOT NULL AND model IS NOT NULL
  GROUP BY brand, model, cat
  ORDER BY clicks DESC
  LIMIT limit_n;
$$;
GRANT EXECUTE ON FUNCTION get_hot_items(int, int) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 015 — 댓글 소프트삭제 시 comment_count 감소 트리거 (버그 H-34)
-- ─────────────────────────────────────────────────────────────────────
-- 009의 중복 카운트 트리거가 혹시 적용됐으면 제거(015가 단일 진실)
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

-- 기존 드리프트 1회 보정
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

COMMIT;

-- ════════════════════════════════════════════════════════════════════
--  적용 후 검증(선택): 아래 SELECT 로 함수 등록 확인
--    SELECT proname FROM pg_proc WHERE proname IN ('get_hot_items','get_top_gear_tags');
--  또는 터미널에서:
--    curl -s -X POST "$URL/rest/v1/rpc/get_hot_items" -H "apikey: $ANON" \
--      -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
--      -d '{"days_n":7,"limit_n":30}' -w '\nHTTP %{http_code}\n'   →  HTTP 200
-- ════════════════════════════════════════════════════════════════════
