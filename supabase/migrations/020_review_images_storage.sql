-- 019 — 커뮤니티 사진 업로드 활성화 (M-109)
--
-- 프론트(supabaseClient.js uploadImage)는 `review-images` 버킷에
-- `{user_id}/{uuid}.{ext}` 경로로 업로드하고, posts.image_urls 에 공개 URL을 저장한다.
-- 그런데 005_post_images.sql 은 프론트가 쓰지 않는 `post-images` 버킷을 만든다(혼동 주의).
-- 본 마이그가 실제로 필요한 3가지를 한 번에 멱등 적용한다:
--   1) review-images 버킷(Public) 생성
--   2) posts.image_urls 컬럼(+최대 4장 제약)  ← 005의 핵심 부분
--   3) review-images storage 정책(공개읽기 / 본인업로드 / 본인·관리자삭제) ← 003의 핵심 부분
-- Supabase SQL Editor에서 전체 선택 후 실행. (멱등)

-- 1) 버킷 (이미 있으면 public 강제)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) posts.image_urls 컬럼 + 최대 4장 제약
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}'::text[];

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_post_images_len') THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT chk_post_images_len
      CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 4);
  END IF;
END $$;

-- 3) review-images 정책 (DROP 먼저라 재실행 안전)
DROP POLICY IF EXISTS "review_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "review_images_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "review_images_owner_admin_delete" ON storage.objects;

CREATE POLICY "review_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "review_images_owner_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "review_images_owner_admin_delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'review-images' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
