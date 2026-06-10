-- ============================================================
-- 005 — 커뮤니티 글 사진 첨부 (posts.image_urls)
--
-- 왜 필요한가:
--   커뮤니티 글에 사진을 첨부한다(최대 4장, review-images 버킷에 업로드한 공개 URL).
--   posts 테이블에 이미지 URL 배열 컬럼이 없어서 추가한다.
--   컬럼은 기존 GRANT(004의 INSERT/UPDATE ON posts TO authenticated)에 포함되므로
--   별도 GRANT 불필요. image_urls 미첨부 글은 빈 배열로 동작(기존 글 영향 없음).
--
-- 선행: 004_grants_and_wishlist.sql 의 GRANT가 적용돼 있어야 한다(멱등이니 재실행 권장).
-- Supabase SQL Editor에서 전체 선택 후 실행. (멱등)
-- ============================================================

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}'::text[];

-- 최대 4장 제한 (CHECK는 IF NOT EXISTS가 없어 존재 여부를 먼저 확인)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_post_images_len'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT chk_post_images_len
      CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 4);
  END IF;
END $$;

-- Storage bucket: post-images (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 업로드: 본인만 가능
CREATE POLICY "post-images: auth upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

-- 삭제: 본인만 가능
CREATE POLICY "post-images: auth delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid()::text = (string_to_array(name, '/'))[1]);

-- 읽기: 전체 공개
CREATE POLICY "post-images: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');
