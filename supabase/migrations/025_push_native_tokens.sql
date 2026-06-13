-- 025 — 네이티브 푸시 토큰 지원 (B-1/G1: iOS APNs · 추후 Android FCM)
--
-- 왜 필요한가:
--   iOS WKWebView(Capacitor 앱)는 Web Push API/Service Worker push 미지원 →
--   웹 Web Push(endpoint/p256dh/auth_key)로는 앱에서 알림이 안 온다.
--   네이티브 앱은 APNs(또는 FCM) '디바이스 토큰'을 받는다. 이를 같은
--   push_subscriptions 테이블에 platform 구분으로 저장한다(발송 함수가 분기).
--
-- Supabase SQL Editor에서 실행. (멱등)
-- 설계: MOBILE-APP-BRIDGE-PLAN.md G1
-- ============================================================

-- 웹 컬럼은 네이티브 행에선 비므로 NOT NULL 해제
ALTER TABLE public.push_subscriptions ALTER COLUMN endpoint DROP NOT NULL;
ALTER TABLE public.push_subscriptions ALTER COLUMN p256dh   DROP NOT NULL;
ALTER TABLE public.push_subscriptions ALTER COLUMN auth_key DROP NOT NULL;

-- 플랫폼 + 네이티브 토큰
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS platform     text NOT NULL DEFAULT 'web';  -- 'web' | 'ios' | 'android'
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS native_token text;

-- 네이티브 토큰은 1기기 1행 (web 행은 native_token NULL → 영향 없음)
CREATE UNIQUE INDEX IF NOT EXISTS uq_push_native
  ON public.push_subscriptions(user_id, native_token) WHERE native_token IS NOT NULL;

-- RLS는 012의 own_push(FOR ALL USING auth.uid()=user_id) 그대로 — 본인 행만 read/write.
