-- ============================================================
-- 캠핑기어 정직비교 — UGC 레이어 초기 스키마
-- DESIGN-social.md 루프1~19 결정 반영
-- Supabase SQL Editor에서 전체 선택 후 실행
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname            text UNIQUE,
  avatar_url          text,
  role                text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  age_verified        boolean DEFAULT false,
  nickname_changed_at timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (id = auth.uid());

-- ── 2. reviews ───────────────────────────────────────────────
CREATE TABLE reviews (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  product_pcode text NOT NULL,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 2000),
  hidden        boolean DEFAULT false,
  deleted_at    timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT TO anon, authenticated
  USING (hidden = false AND deleted_at IS NULL);

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL)
  );

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND hidden = false AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid() AND hidden = false);

-- ── 3. review_history ────────────────────────────────────────
CREATE TABLE review_history (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id  uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  old_body   text,
  old_rating int,
  edited_at  timestamptz DEFAULT now(),
  editor_id  uuid REFERENCES profiles(id) ON DELETE SET NULL
);
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_history_no_direct_insert" ON review_history
  FOR INSERT WITH CHECK (false);

CREATE POLICY "review_history_owner_select" ON review_history
  FOR SELECT TO authenticated
  USING (editor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 4. posts ─────────────────────────────────────────────────
CREATE TABLE posts (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title           text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 100),
  body            text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 10000),
  product_pcodes  text[] DEFAULT '{}'::text[],
  like_count      int DEFAULT 0 CHECK (like_count >= 0),
  comment_count   int DEFAULT 0 CHECK (comment_count >= 0),
  hidden          boolean DEFAULT false,
  deleted_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT chk_product_pcodes_len
    CHECK (array_length(product_pcodes, 1) IS NULL OR array_length(product_pcodes, 1) <= 5)
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_public" ON posts
  FOR SELECT TO anon, authenticated
  USING (hidden = false AND deleted_at IS NULL);

CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL)
  );

CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND hidden = false AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid() AND hidden = false);

-- ── 5. post_history ──────────────────────────────────────────
CREATE TABLE post_history (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  old_title text,
  old_body  text,
  edited_at timestamptz DEFAULT now(),
  editor_id uuid REFERENCES profiles(id) ON DELETE SET NULL
);
ALTER TABLE post_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_history_no_direct_insert" ON post_history
  FOR INSERT WITH CHECK (false);

CREATE POLICY "post_history_owner_select" ON post_history
  FOR SELECT TO authenticated
  USING (editor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 6. comments ──────────────────────────────────────────────
CREATE TABLE comments (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  parent_id  uuid REFERENCES comments(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  hidden     boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_public" ON comments
  FOR SELECT TO anon, authenticated
  USING (hidden = false AND deleted_at IS NULL);

CREATE POLICY "comments_insert_own" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL)
  );

CREATE POLICY "comments_update_own" ON comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- ── 7. likes ─────────────────────────────────────────────────
CREATE TABLE likes (
  post_id    uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_own" ON likes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "likes_insert_own" ON likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM posts WHERE id = post_id AND deleted_at IS NULL AND hidden = false)
  );

CREATE POLICY "likes_delete_own" ON likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── 8. reports ───────────────────────────────────────────────
CREATE TABLE reports (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_type text NOT NULL CHECK (target_type IN ('post', 'review', 'comment', 'profile')),
  target_id   uuid NOT NULL,
  reason      text NOT NULL CHECK (char_length(reason) BETWEEN 5 AND 500),
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_own" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_select_admin" ON reports
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 9. rate_limit_log ────────────────────────────────────────
CREATE TABLE rate_limit_log (
  user_id uuid NOT NULL,
  action  text NOT NULL CHECK (action IN ('review', 'comment', 'like', 'post', 'export')),
  ts      timestamptz DEFAULT now()
);
CREATE INDEX ON rate_limit_log(user_id, action, ts);
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- authenticated 사용자가 자신의 행을 DELETE하지 못하도록 차단
-- (rate limit 우회 방지) — pg_cron(service_role)만 삭제 가능
CREATE POLICY "rate_limit_log_no_user_delete" ON rate_limit_log
  FOR DELETE TO authenticated USING (false);
