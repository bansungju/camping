-- 커뮤니티 로그에서 가장 많이 태그된 장비 TOP-N 집계 RPC
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
