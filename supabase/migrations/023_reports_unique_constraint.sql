-- reports 중복 신고 방지: 동일 사용자가 동일 대상을 중복 신고 불가
-- reporter_id NULL(계정 삭제 사용자)은 제약 대상 제외(PostgreSQL UNIQUE는 NULL을 별개 취급 → 안전)
ALTER TABLE public.reports
  ADD CONSTRAINT reports_reporter_target_unique
  UNIQUE (reporter_id, target_type, target_id);
