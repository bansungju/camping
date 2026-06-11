-- 017 — rate-limit 트리거 함수 SECURITY DEFINER 보정 (커뮤니티 쓰기 전면 차단 해소)
--
-- 🔴 심각: 글/댓글/좋아요/리뷰 작성이 라이브에서 42501로 전면 실패하던 근본 원인.
--
-- 모순 구조:
--   · 004는 rate_limit_log 에 GRANT를 "의도적으로" 주지 않음(주석: 트리거/service_role 전용,
--     사용자가 직접 레이트리밋 로그를 조작/우회하지 못하게).  → authenticated 는 INSERT 불가.
--   · 그런데 BEFORE INSERT 트리거 check_{review,comment,like,post}_rate_limit (002) 가
--     SECURITY DEFINER 없이 호출자(authenticated) 권한으로 실행되며 `INSERT INTO rate_limit_log`.
--   · 결과: reviews/comments/likes/posts INSERT 시 트리거가 42501 → 작성 트랜잭션 전체 실패.
--     (라이브 공개 게시글이 0건인 것과 정합 — 사실상 아무도 글을 쓸 수 없었음)
--
-- 해결: 설계 의도(rate_limit_log는 트리거 전용 기록)대로 이 트리거 함수들을
--   SECURITY DEFINER + SET search_path=public 으로 재정의. 트리거 바인딩은 유지(CREATE OR REPLACE).
--   소유자(postgres) 권한으로 rate_limit_log에 기록 → 사용자 직접 GRANT 없이도 동작, 우회 방지 유지.
-- (멱등 — 재실행 안전)

CREATE OR REPLACE FUNCTION check_review_rate_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'review'
        AND ts > now() - interval '60 seconds') >= 3 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: review';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'review');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_comment_rate_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'comment'
        AND ts > now() - interval '60 seconds') >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: comment';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'comment');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_like_rate_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'like'
        AND ts > now() - interval '60 seconds') >= 20 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: like';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'like');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_post_rate_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COUNT(*) FROM rate_limit_log
      WHERE user_id = NEW.user_id AND action = 'post'
        AND ts > now() - interval '3600 seconds') >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: post';
  END IF;
  INSERT INTO rate_limit_log(user_id, action) VALUES (NEW.user_id, 'post');
  RETURN NEW;
END;
$$;
