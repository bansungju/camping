-- 015 — 댓글 소프트삭제 시 comment_count 감소 (버그 H-34)
--
-- 문제: 라이브 트리거 trg_comment_count(002)는 AFTER INSERT OR DELETE 에만 반응.
--   앱은 댓글 삭제를 물리 DELETE가 아니라 deleted_at = now() UPDATE 로 처리하므로
--   삭제해도 카운트가 줄지 않고 누적 증가함(DB 정합성 오류).
-- 해결: 002의 update_comment_count() 를 UPDATE OF deleted_at 까지 처리하도록 확장.
--   기존 의미 유지 — root 댓글(parent_id IS NULL)만 집계, 소프트삭제 게시글 제외.
--   복원(deleted_at NULL 로 되돌림) 시 재증가까지 대칭 처리.
-- (멱등 — CREATE OR REPLACE / DROP IF EXISTS / 재집계 모두 재실행 안전)

-- 1) 충돌 방지: 009(content 컬럼의 비호환 재정의)에서 만든 중복 카운트 트리거가
--    혹시 적용돼 있으면 제거. (root 무시·INSERT 중복가산 유발) 015가 단일 진실.
DROP TRIGGER IF EXISTS trg_inc_comment_count ON comments;
DROP TRIGGER IF EXISTS trg_dec_comment_count ON comments;
DROP FUNCTION IF EXISTS inc_comment_count();
DROP FUNCTION IF EXISTS dec_comment_count();

-- 2) 카운트 함수: INSERT / DELETE / 소프트삭제·복원 UPDATE 모두 반영
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger AS $$
DECLARE post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 새 root 댓글은 작성 시점에 deleted_at IS NULL 일 때만 가산
    IF NEW.parent_id IS NULL AND NEW.deleted_at IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NULL AND OLD.deleted_at IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = OLD.post_id;
      IF NOT post_deleted THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- deleted_at 전이가 있을 때만, root 댓글 한정으로 ±1
    IF NEW.parent_id IS NULL THEN
      SELECT (deleted_at IS NOT NULL) INTO post_deleted FROM posts WHERE id = NEW.post_id;
      IF NOT post_deleted THEN
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
          UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.post_id;
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
          UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3) 트리거 재생성: 소프트삭제 UPDATE(deleted_at) 까지 발동
DROP TRIGGER IF EXISTS trg_comment_count ON comments;
CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- 4) 기존 드리프트 1회 보정: comment_count = 살아있는 root 댓글 수 (삭제된 글 제외)
UPDATE posts p SET comment_count = sub.cnt
FROM (
  SELECT po.id, COUNT(c.id) AS cnt
  FROM posts po
  LEFT JOIN comments c
    ON c.post_id = po.id AND c.parent_id IS NULL AND c.deleted_at IS NULL
  GROUP BY po.id
) sub
WHERE p.id = sub.id
  AND p.comment_count <> sub.cnt;
