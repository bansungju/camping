-- 014_posts_select_own.sql
-- 본인 게시글(비공개 포함, deleted_at IS NULL)을 마이페이지에서 조회 가능하도록 RLS policy 추가
-- 기존 posts_select_public 은 hidden=false AND deleted_at IS NULL 만 허용 → 비공개 글 본인 조회 불가
CREATE POLICY "posts_select_own" ON posts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);
