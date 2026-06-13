-- posts 테이블에 likes 카운터 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;

-- 좋아요 원자적 증감 RPC (중복 방지는 클라이언트 localStorage로)
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET likes = likes + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET likes = GREATEST(0, likes - 1) WHERE id = post_id;
$$;

-- anon도 RPC 호출 가능 (비로그인 좋아요 허용)
GRANT EXECUTE ON FUNCTION increment_post_likes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(uuid) TO anon, authenticated;
