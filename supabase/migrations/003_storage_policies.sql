-- ============================================================
-- Storage 버킷 RLS 정책
-- Supabase Dashboard → Storage → Buckets에서
-- 먼저 'avatars', 'review-images' 버킷을 Public으로 생성 후 실행
-- ============================================================

-- 기존 정책 제거 (멱등 실행 보장)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "review_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "review_images_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "review_images_owner_admin_delete" ON storage.objects;

-- ── avatars 버킷 ─────────────────────────────────────────────
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── review-images 버킷 ───────────────────────────────────────
CREATE POLICY "review_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "review_images_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "review_images_owner_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
-- 파일 경로 규칙: {bucket}/{user_id}/{uuid}.webp
