# 1단계 완료 — 데이터 정합성 & 한계 파악

판정일 2026-06-09 · 적대적 의심-보완 루프 37라운드 · 누적 60건 RESOLVED + 1 REJECTED

## 결과 데이터
- verified 2,324종 / 16 카테고리 (브랜드+핵심지표완비+가격)
- 별점: verified-only 모집단 · canonical(값별)dedup · 순위백분위 · star_eligible · 세그먼트(텐트=인원, 랜턴=광원형태)
- 가격 100% 필수(유효가격) · 국내가 우선(직구 lowball 차단)
- 단일 run_all 멱등(완전 재현)

## 정직성 장치 (해자)
- footprint floor → 외형기준 배지 + 별점제외(이너 측정만 별점)
- 미공개 결측 → 한계로 명시(추측 금지): 매트R값7%·코펠용량30%·버너화력44%·침낭충전량45%·랜턴무게44%·파워뱅크용량
- 기준오염/모순 → 지속격리(AP2 comfort, id2607 등)
- LIMITS.md 자동생성(A 10·B 4·한계 2 카테고리)

## 핵심 수정 이정표(60건 중)
- 별점엔진: min-max→순위백분위(9R), verified-only 모집단(28R), canonical 값별 dedup(34~36R)
- 구조버그: 지속격리 부활(24R), promote후recompute 멱등(32R)
- 파서가드: capacity_l/mah, floor 이너·테이퍼평균폭, 가격이상치·채널혼입
- 변형일관성: capacity/floor/weight/water_head 통일·NULL채움·공백dedup

## 한계(정직 명시, 수정 불가)
- 6개 지표 미공개 결측(위) → 해당 축 '데이터부족' 배지
- genuine raw 변형차 4건(리빙쉘 등) → 각자 제값 채점(통일 안 함)
- 다나와 기준불명 무게/내수압 → source_id로 확정/참고 구분
