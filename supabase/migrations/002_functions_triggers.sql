-- ============================================================
-- 트리거 함수 및 RPC
-- ============================================================

-- ── updated_at 자동 갱신 ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── handle_new_user: 소셜 로그인 시 profiles 자동 생성 ────────
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
DECLARE
  existing profiles%ROWTYPE;
BEGIN
  SELECT * INTO existing FROM profiles WHERE id = NEW.id;

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
    DELETE FROM profiles WHERE id = NEW.id;
  END IF;

  -- 닉네임은 NULL 강제 (소셜 실명 유입 차단)
  INSERT INTO profiles(id, nickname, avatar_url)
  VALUES (
    NEW.id,
    NULL,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── nickname_changed_at 트리거 (클라이언트 스푸핑 차단) ────────
CREATE OR REPLACE FUNCTION set_nickname_changed_at() RETURNS trigger AS $$
BEGIN
  IF NEW.nickname IS DISTINCT FROM OLD.nickname AND OLD.nickname IS NOT NULL THEN
    IF OLD.nickname_changed_at IS NOT NULL
       AND OLD.nickname_changed_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'nickname_cooldown: 30일 이내 재변경 불가';
    END IF;
    NEW.nickname_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nickname_changed_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_nickname_changed_at();

-- ── 닉네임 형식 + 금지어 검사 ────────────────────────────────
CREATE OR REPLACE FUNCTION check_nickname_content() RETURNS trigger AS $$
DECLARE
  term text;
  blocked text[] := ARRAY['씨발','개새끼','병신','fuck','shit','admin','운영자','관리자'];
BEGIN
  IF NEW.nickname IS NULL THEN RETURN NEW; END IF;
  FOREACH term IN ARRAY blocked LOOP
    IF lower(NEW.nickname) LIKE '%' || term || '%' THEN
      RAISE EXCEPTION 'nickname_policy_violation';
    END IF;
  END LOOP;
  IF NEW.nickname !~ '^[가-힣a-zA-Z0-9_]{2,20}$' THEN
    RAISE EXCEPTION 'nickname_format_invalid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nickname_content BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_nickname_content();

-- ── 리뷰 24h 계정 쿨다운 ─────────────────────────────────────
CREATE OR REPLACE FUNCTION check_review_account_age() RETURNS trigger AS $$
BEGIN
  IF (SELECT created_at FROM profiles WHERE id = NEW.user_id)
      > now() - interval '24 hours' THEN
    RAISE EXCEPTION 'account_too_new: review requires 24h account age';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_account_age BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_account_age();

-- ── 금지어 검사: posts (title + body) ────────────────────────
CREATE OR REPLACE FUNCTION check_text_content() RETURNS trigger AS $$
DECLARE
  term text;
  blocked text[] := ARRAY['씨발','개새끼','병신','미친놈','존나','ㅅㅂ','ㅂㅅ'];
BEGIN
  FOREACH term IN ARRAY blocked LOOP
    IF lower(coalesce(NEW.title,'')) LIKE '%' || term || '%'
    OR lower(coalesce(NEW.body,'')) LIKE '%' || term || '%' THEN
      RAISE EXCEPTION 'content_policy_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_content BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION check_text_content();

-- ── 금지어 검사: reviews, comments (body만) ──────────────────
CREATE OR REPLACE FUNCTION check_body_content() RETURNS trigger AS $$
DECLARE
  term text;
  blocked text[] := ARRAY['씨발','개새끼','병신','미친놈','존나','ㅅㅂ','ㅂㅅ'];
BEGIN
  FOREACH term IN ARRAY blocked LOOP
    IF lower(coalesce(NEW.body,'')) LIKE '%' || term || '%' THEN
      RAISE EXCEPTION 'content_policy_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_content BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_body_content();
CREATE TRIGGER trg_comment_content BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION check_body_content();

-- ── comment_count: root 댓글만, 소프트삭제 게시글 제외 ─────────
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
DECLARE post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_count AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ── like_count: 소프트삭제 게시글 제외 ──────────────────────────
CREATE OR REPLACE FUNCTION update_like_count() RETURNS trigger AS $$
DECLARE post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
    IF NOT post_deleted THEN
      UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
    IF NOT post_deleted THEN
      UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_like_count AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- ── rate limit 트리거들 ───────────────────────────────────────
CREATE OR REPLACE FUNCTION check_review_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'review'
        AND ts > now() - interval '60 seconds') >= 3 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: review';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'review');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_review_rate_limit BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION check_review_rate_limit();

CREATE OR REPLACE FUNCTION check_comment_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'comment'
        AND ts > now() - interval '60 seconds') >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: comment';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'comment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_comment_rate_limit BEFORE INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION check_comment_rate_limit();

CREATE OR REPLACE FUNCTION check_like_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'like'
        AND ts > now() - interval '60 seconds') >= 20 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: like';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'like');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_like_rate_limit BEFORE INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION check_like_rate_limit();

CREATE OR REPLACE FUNCTION check_post_rate_limit() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'post'
        AND ts > now() - interval '3600 seconds') >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: post';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'post');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_post_rate_limit BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION check_post_rate_limit();

-- ── review_history 저장 트리거 ────────────────────────────────
CREATE OR REPLACE FUNCTION save_review_history() RETURNS trigger AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body OR NEW.rating IS DISTINCT FROM OLD.rating THEN
    INSERT INTO review_history(review_id, old_body, old_rating, editor_id)
    VALUES (OLD.id, OLD.body, OLD.rating, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_review_history AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION save_review_history();

-- ── post_history 저장 + trim 트리거 ──────────────────────────
CREATE OR REPLACE FUNCTION save_post_history() RETURNS trigger AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body OR NEW.title IS DISTINCT FROM OLD.title THEN
    INSERT INTO post_history(post_id, old_title, old_body, editor_id)
    VALUES (OLD.id, OLD.title, OLD.body, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_post_history AFTER UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION save_post_history();

CREATE OR REPLACE FUNCTION trim_post_history() RETURNS trigger AS $$
BEGIN
  DELETE FROM post_history WHERE id IN (
    SELECT id FROM post_history WHERE post_id = NEW.post_id
    ORDER BY edited_at DESC OFFSET 10
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_trim_post_history AFTER INSERT ON post_history
  FOR EACH ROW EXECUTE FUNCTION trim_post_history();

-- ── 신고 대상 소프트삭제 확인 ────────────────────────────────
CREATE OR REPLACE FUNCTION check_report_target_alive() RETURNS trigger AS $$
BEGIN
  IF NEW.target_type = 'post' AND
     (SELECT deleted_at FROM posts WHERE id = NEW.target_id) IS NOT NULL THEN
    RAISE EXCEPTION 'report_target_deleted';
  END IF;
  IF NEW.target_type = 'comment' AND
     (SELECT deleted_at FROM comments WHERE id = NEW.target_id) IS NOT NULL THEN
    RAISE EXCEPTION 'report_target_deleted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_report_target_alive BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION check_report_target_alive();

-- ── auto_hide: 신고 5회 시 숨김 (소프트삭제 대상 제외) ────────
CREATE OR REPLACE FUNCTION auto_hide_on_reports() RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM reports
      WHERE target_type = NEW.target_type AND target_id = NEW.target_id
        AND status = 'pending') >= 5 THEN
    CASE NEW.target_type
      WHEN 'post' THEN
        UPDATE posts SET hidden = true WHERE id = NEW.target_id AND deleted_at IS NULL;
      WHEN 'review' THEN
        UPDATE reviews SET hidden = true WHERE id = NEW.target_id AND deleted_at IS NULL;
      WHEN 'comment' THEN
        UPDATE comments SET hidden = true WHERE id = NEW.target_id AND deleted_at IS NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_auto_hide AFTER INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION auto_hide_on_reports();

-- ── restore_post RPC ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION restore_post(p_post_id uuid) RETURNS void AS $$
BEGIN
  UPDATE posts SET
    deleted_at    = NULL,
    like_count    = (SELECT COUNT(*) FROM likes WHERE post_id = p_post_id),
    comment_count = (SELECT COUNT(*) FROM comments
                     WHERE post_id = p_post_id AND parent_id IS NULL AND deleted_at IS NULL)
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION restore_post(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION restore_post(uuid) TO service_role;

-- ── get_review_stats: N+1 방지 batch RPC ─────────────────────
CREATE OR REPLACE FUNCTION get_review_stats(pcodes text[])
RETURNS TABLE(pcode text, avg_rating numeric, review_count int) AS $$
  SELECT product_pcode, ROUND(AVG(rating)::numeric, 1), COUNT(*)::int
  FROM reviews
  WHERE product_pcode = ANY(pcodes) AND hidden = false AND deleted_at IS NULL
  GROUP BY product_pcode;
$$ LANGUAGE sql STABLE;

-- ── delete_account_atomic RPC ─────────────────────────────────
CREATE OR REPLACE FUNCTION delete_account_atomic(p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE profiles SET deleted_at = now() WHERE id = p_user_id;
  UPDATE posts SET deleted_at = now() WHERE user_id = p_user_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION delete_account_atomic(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_account_atomic(uuid) TO service_role;

-- ── check_export_rate_limit ──────────────────────────────────
CREATE OR REPLACE FUNCTION check_export_rate_limit(p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = p_user_id AND action = 'export'
        AND ts > now() - interval '24 hours') >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: export';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (p_user_id, 'export');
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ── pg_cron 정리 작업 ─────────────────────────────────────────
-- (pg_cron 익스텐션 활성화 후 실행)
-- SELECT cron.schedule('cleanup-rate-limit', '0 * * * *',
--   $$ DELETE FROM rate_limit_log WHERE ts < now() - interval '1 hour'; $$);
-- SELECT cron.schedule('cleanup-orphan-profiles', '0 3 * * 0',
--   $$ DELETE FROM profiles WHERE deleted_at < now() - interval '30 days'; $$);
