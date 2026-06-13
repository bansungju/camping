-- 007_posts_alter.sql
-- posts 테이블에 이미지·태그·공개여부·gear_set 연동 컬럼 추가

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS images      text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags        text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_public   boolean     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS gear_set_id uuid        REFERENCES gear_sets(id) ON DELETE SET NULL;

-- 태그 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_tags_gin   ON posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_posts_images_gin ON posts USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_posts_public     ON posts (is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_gear_set   ON posts (gear_set_id) WHERE gear_set_id IS NOT NULL;
