-- ⚠️ DEPRECATED / 적용 금지 — 라이브 comments 테이블은 001_initial_schema(body·parent_id·hidden)
--    스키마이며, 이 파일은 비호환 재정의(content 컬럼·parent_id 없음)라 적용된 적 없음.
--    comment_count 소프트삭제 정합성은 015_comment_count_softdelete.sql 가 단일 진실(SSOT).
--    이 파일을 실행하면 trg_inc/dec_comment_count 가 002 트리거와 중복가산을 일으킴 → 절대 적용 X.
-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 삭제되지 않은 댓글은 누구나 읽기 가능
CREATE POLICY "comments: public read" ON comments
  FOR SELECT USING (deleted_at IS NULL);

-- 로그인 사용자만 작성
CREATE POLICY "comments: auth insert" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 소프트 삭제 (UPDATE deleted_at)
CREATE POLICY "comments: auth update own" ON comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON comments TO anon;
GRANT SELECT, INSERT, UPDATE ON comments TO authenticated;

-- profiles JOIN을 위한 뷰 (RPC 대신 select join 사용)
-- 피드 카드용 댓글 수 캐시 컬럼
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;

-- 댓글 삽입 시 카운터 증가
CREATE OR REPLACE FUNCTION inc_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_inc_comment_count
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION inc_comment_count();

-- 소프트 삭제 시 카운터 감소
CREATE OR REPLACE FUNCTION dec_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_dec_comment_count
  AFTER UPDATE OF deleted_at ON comments
  FOR EACH ROW EXECUTE FUNCTION dec_comment_count();
