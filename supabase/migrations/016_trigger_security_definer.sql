-- 016 — 감사/카운트 트리거 함수 SECURITY DEFINER 보정 (M-54 게시글 수정 차단의 근본 백엔드 원인 외)
--
-- 문제: 아래 트리거 함수들이 SECURITY DEFINER 없이 호출자(authenticated) 권한으로 실행되어,
--   호출자가 직접 쓸 수 없는 보호 테이블/타인 행을 건드리다 RLS·GRANT에 막힘.
--   ① save_post_history / save_review_history
--       → post_history·review_history 정책이 WITH CHECK(false)(직접 insert 전면 차단)
--         + INSERT GRANT 없음. 게시글/리뷰 "수정" 시 트리거 INSERT가 42501로 실패 →
--         UPDATE 트랜잭션 전체 abort = 수정 기능 자체가 하드 실패(M-54 백엔드 차단).
--   ② update_comment_count / update_like_count
--       → 타인 게시글의 posts.comment_count/like_count UPDATE가 posts_update_own RLS
--         (USING user_id=auth.uid())에 막혀 0행 갱신(무에러) = 카운트 누락.
--         (009의 inc/dec_comment_count가 SECURITY DEFINER였던 것이 의도 증거)
--   ③ auto_hide_on_reports
--       → 신고자=비소유자라 UPDATE posts/comments SET hidden 이 RLS에 막혀 자동숨김 미작동.
-- 해결: 해당 함수들을 SECURITY DEFINER + SET search_path=public 로 재정의(트리거는 그대로 유지).
--   감사 트리거가 소유자(postgres) 권한으로 실행되어 RLS·GRANT를 정당하게 우회.
-- (멱등 — CREATE OR REPLACE. 015의 update_comment_count 비-DEFINER 버전을 본 파일이 대체.)

-- ① 댓글 카운트 (015 로직 유지 + SECURITY DEFINER 확정)
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE post_deleted bool;
BEGIN
  IF TG_OP = 'INSERT' THEN
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
$$;

-- ② 좋아요 카운트
CREATE OR REPLACE FUNCTION update_like_count() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- ③ 리뷰 수정 이력
CREATE OR REPLACE FUNCTION save_review_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body OR NEW.rating IS DISTINCT FROM OLD.rating THEN
    INSERT INTO review_history(review_id, old_body, old_rating, editor_id)
    VALUES (OLD.id, OLD.body, OLD.rating, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- ④ 게시글 수정 이력
CREATE OR REPLACE FUNCTION save_post_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body OR NEW.title IS DISTINCT FROM OLD.title THEN
    INSERT INTO post_history(post_id, old_title, old_body, editor_id)
    VALUES (OLD.id, OLD.title, OLD.body, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- ⑤ 게시글 이력 trim(최근 10개 유지) — save_post_history와 동일 컨텍스트에서 보호 테이블 DELETE
CREATE OR REPLACE FUNCTION trim_post_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM post_history WHERE id IN (
    SELECT id FROM post_history WHERE post_id = NEW.post_id
    ORDER BY edited_at DESC OFFSET 10
  );
  RETURN NULL;
END;
$$;

-- ⑥ 신고 누적 자동숨김 — 비소유자 신고로 인한 posts/reviews/comments hidden UPDATE
CREATE OR REPLACE FUNCTION auto_hide_on_reports() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;
