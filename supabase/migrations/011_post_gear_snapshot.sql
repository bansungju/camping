-- 로그에 첨부된 세트 스냅샷 (세트 삭제 후에도 로그에 보존)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS gear_set_snapshot jsonb;
