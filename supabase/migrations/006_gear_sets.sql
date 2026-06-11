-- 006_gear_sets.sql
-- 캠핑 장비 세트 빌더: 세트 저장, 공유, 커뮤니티 연동

CREATE TABLE IF NOT EXISTS gear_sets (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text          NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description   text          CHECK (char_length(description) <= 500),
  style         text          CHECK (style IN (
                                'backpacking','car-camping','glamping',
                                'bikepacking','winter','beach','family'
                              )),
  items         jsonb         NOT NULL DEFAULT '[]'::jsonb,
  -- items 구조: [{pcode, name, brand, price, weight_g, category, qty}]
  -- 주: total_price/total_weight_g 는 PostgreSQL 생성열에 서브쿼리 불가(0A000)라 제거.
  --     앱은 이 컬럼을 쓰지 않으며(동기화는 id/title/style/items/completeness만 select),
  --     합계가 필요하면 쿼리/뷰에서 jsonb_array_elements로 계산할 것.
  budget_goal   bigint        CHECK (budget_goal >= 0),
  completeness  smallint      NOT NULL DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
  is_public     boolean       NOT NULL DEFAULT true,
  like_count    int           NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count int           NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  deleted_at    timestamptz,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 (002의 set_updated_at 재사용)
CREATE TRIGGER gear_sets_updated_at
  BEFORE UPDATE ON gear_sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 인덱스
CREATE INDEX idx_gear_sets_user_id   ON gear_sets (user_id)             WHERE deleted_at IS NULL;
CREATE INDEX idx_gear_sets_public    ON gear_sets (is_public, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_gear_sets_items_gin ON gear_sets USING GIN (items);

-- RLS
ALTER TABLE gear_sets ENABLE ROW LEVEL SECURITY;

-- 공개 세트는 누구나 조회
CREATE POLICY gear_sets_select_public ON gear_sets
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

-- 본인 세트는 비공개 포함 조회 (deleted 제외)
CREATE POLICY gear_sets_select_own ON gear_sets
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);

-- 본인만 생성
CREATE POLICY gear_sets_insert_own ON gear_sets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 본인만 수정
CREATE POLICY gear_sets_update_own ON gear_sets
  FOR UPDATE USING (user_id = auth.uid() AND deleted_at IS NULL);

-- 본인만 삭제 (soft delete: deleted_at 세팅)
CREATE POLICY gear_sets_delete_own ON gear_sets
  FOR DELETE USING (user_id = auth.uid());

-- 테이블 GRANT (필수) — PostgreSQL은 RLS 평가 전에 테이블수준 GRANT를 먼저 본다.
--   GRANT가 없으면 정책이 아무리 맞아도 42501(permission denied)로 막힌다(004와 동일 함정).
--   공개 세트 공유를 위해 SELECT는 anon 포함, 쓰기는 authenticated 한정.
GRANT SELECT ON public.gear_sets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gear_sets TO authenticated;
