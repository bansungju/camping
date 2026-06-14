-- 024_gear_sets_type — H-143: 기어세트 type(오토캠핑/백패킹/차박) 원격 영속화
--
-- 배경: 앱의 세트 type(auto/backpacking/carcamp)은 슬롯 캡·완성도 계산의 기준인데,
--   gear_sets에 컬럼이 없어 동기화 시 항상 undefined→DEFAULT('auto')로 떨어졌다(H-143).
--   별개 컬럼 `style`(backpacking/car-camping/glamping…)과는 다른 의미축이므로 신규 컬럼을 추가한다.
--
-- 적용: Supabase 대시보드 → SQL Editor에 붙여넣고 실행. 멱등(IF NOT EXISTS).
--   기존 행은 DEFAULT 'auto'로 채워진다(과거 세트는 type 미기록이었으므로 합리적 기본값).

ALTER TABLE gear_sets
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'auto'
    CHECK (type IN ('auto', 'backpacking', 'carcamp'));

-- 참고: completeness(smallint, 0~100 CHECK)는 기존 컬럼 그대로 사용한다(H-146 코드측 수정).
