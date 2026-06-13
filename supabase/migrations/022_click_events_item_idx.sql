-- click_events에 item_idx 추가 — 핫섹션 직접 링크(/item/${slug}/item-N.html) 지원
ALTER TABLE public.click_events ADD COLUMN IF NOT EXISTS item_idx integer;

-- get_hot_items RPC: item_idx(MIN) 반환 추가
-- 동일 brand+model+slug는 item_idx가 항상 동일하므로 MIN 집계는 무해
DROP FUNCTION IF EXISTS get_hot_items(integer, integer);

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
