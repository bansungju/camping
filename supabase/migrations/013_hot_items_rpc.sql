-- 최근 7일 클릭 TOP-8 장비 집계 (SECURITY DEFINER — 테이블 직접 노출 방지)
CREATE OR REPLACE FUNCTION get_hot_items(days_n int DEFAULT 7, limit_n int DEFAULT 8)
RETURNS TABLE(brand text, model text, cat text, clicks bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public  -- SECURITY DEFINER 함수 검색경로 고정(스키마 하이재킹 방지)
AS $$
  SELECT brand, model, cat, COUNT(*) AS clicks
  FROM click_events
  WHERE created_at > NOW() - (days_n || ' days')::interval
    AND brand IS NOT NULL AND model IS NOT NULL
  GROUP BY brand, model, cat
  ORDER BY clicks DESC
  LIMIT limit_n;
$$;

-- PostgREST(anon/authenticated)가 RPC로 호출할 수 있도록 EXECUTE 부여.
-- PUBLIC 기본 EXECUTE에 의존하지 않고 명시 — 적용 후 즉시 호출 가능.
GRANT EXECUTE ON FUNCTION get_hot_items(int, int) TO anon, authenticated;
