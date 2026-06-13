-- 024 — 가격 알림 전송 로그 (B-1 가격하락·재입고 푸시)
--
-- 왜 필요한가:
--   send-price-alert Edge Function이 동일 사용자·상품에 대해 하루 1회만 보내도록
--   중복 차단하기 위한 기록 테이블. "찜한 상품"이 곧 워치리스트이므로 별도 watch
--   테이블은 두지 않는다(wishlists.items에서 직접 도출).
--   서비스롤(Edge Function)만 기록·조회하며, 클라이언트 접근은 불필요.
--
-- Supabase SQL Editor에서 전체 선택 후 실행. (멱등)
-- 설계: APP-PUSH-PRICE-ALERT-PLAN.md §B
-- ============================================================

CREATE TABLE IF NOT EXISTS public.price_alert_log (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key  text NOT NULL,                 -- 찜 key = '브랜드|모델|인원'
  kind      text NOT NULL,                 -- 'drop' | 'restock'
  price_krw int,
  sent_at   timestamptz NOT NULL DEFAULT now()
);

-- 중복 차단 조회용: 특정 사용자·상품의 최근 전송 시각 빠르게 확인
CREATE INDEX IF NOT EXISTS idx_pal_user_key_sent
  ON public.price_alert_log (user_id, item_key, sent_at DESC);

ALTER TABLE public.price_alert_log ENABLE ROW LEVEL SECURITY;

-- 클라이언트(anon/authenticated)에는 어떤 정책도 부여하지 않는다.
-- service_role은 RLS를 우회하므로 Edge Function은 정상 동작하고,
-- 일반 사용자는 한 줄도 읽거나 쓸 수 없다(전송 로그는 내부 데이터).
REVOKE ALL ON public.price_alert_log FROM anon, authenticated;
