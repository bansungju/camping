-- posts 테이블에 사진 1장 지원 (Supabase Storage public URL)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url text;

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
