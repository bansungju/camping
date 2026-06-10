-- 최근 7일 클릭 TOP-8 장비 집계 (SECURITY DEFINER — 테이블 직접 노출 방지)
CREATE OR REPLACE FUNCTION get_hot_items(days_n int DEFAULT 7, limit_n int DEFAULT 8)
RETURNS TABLE(brand text, model text, cat text, clicks bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT brand, model, cat, COUNT(*) AS clicks
  FROM click_events
  WHERE created_at > NOW() - (days_n || ' days')::interval
    AND brand IS NOT NULL AND model IS NOT NULL
  GROUP BY brand, model, cat
  ORDER BY clicks DESC
  LIMIT limit_n;
$$;
