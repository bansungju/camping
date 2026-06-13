-- 018 — handle_new_user search_path 보정 (H-39 "Database error saving new user" 근본 원인)
--
-- 문제: 002의 handle_new_user 는 SECURITY DEFINER 이지만 SET search_path 가 없다.
--   이 함수는 auth.users 의 AFTER INSERT 트리거로, GoTrue 의 supabase_auth_admin
--   세션 컨텍스트에서 실행된다. 그 세션의 search_path 에는 public 이 없으므로
--   함수 안의 비한정 참조(`profiles`)가 "relation profiles does not exist" 로 실패하고,
--   GoTrue 는 트리거 예외를 전부 "Database error saving new user" 로 래핑한다.
--   → 소셜 신규 가입이 exchangeCodeForSession 단계에서 전면 실패(H-39 잔여).
-- 해결: 016/017 과 동일하게 SET search_path = public 추가 + 테이블 참조를 스키마 한정.
--   (멱등 — CREATE OR REPLACE, 트리거 on_auth_user_created 는 그대로 유지.)

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO existing FROM public.profiles WHERE id = NEW.id;

  -- 정상 활성 계정 중복 호출 방지
  IF FOUND AND existing.deleted_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- soft-delete 계정 재가입: 30일 쿨다운 확인
  IF FOUND AND existing.deleted_at IS NOT NULL THEN
    IF existing.deleted_at > now() - interval '30 days' THEN
      DELETE FROM auth.users WHERE id = NEW.id;
      RAISE EXCEPTION 'account_deleted_cooldown';
    END IF;
    DELETE FROM public.profiles WHERE id = NEW.id;
  END IF;

  -- 닉네임은 NULL 강제 (소셜 실명 유입 차단)
  INSERT INTO public.profiles(id, nickname, avatar_url)
  VALUES (
    NEW.id,
    NULL,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
