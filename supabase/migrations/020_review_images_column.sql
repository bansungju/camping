-- 020 — 유저 후기 사진 첨부 (reviews.image_urls)
--
-- 후기를 '사진 중심' 메이슨리 그리드로 보여주기 위해 reviews 테이블에 사진 URL 배열을 추가한다.
-- 프론트(supabaseClient uploadImage)는 이미 `review-images` 버킷(019에서 Public+정책 적용)에
-- `{user_id}/{uuid}.{ext}` 로 업로드하므로 스토리지 쪽은 추가 작업이 필요 없다.
-- 본 마이그는 reviews 테이블에 컬럼 + 최대 4장 제약만 멱등 추가한다(005가 posts에 한 것과 동일 패턴).
-- GRANT는 004에서 reviews INSERT/UPDATE 가 이미 부여돼 있어 컬럼 추가만으로 충분하다.
-- Supabase SQL Editor에서 전체 선택 후 실행. (멱등 — 재실행 안전)

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}'::text[];

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_review_images_len') THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT chk_review_images_len
      CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 4);
  END IF;
END $$;

-- PostgREST 스키마 캐시 리로드 (새 컬럼이 REST에 즉시 노출되도록)
NOTIFY pgrst, 'reload schema';
