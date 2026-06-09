# 캠핑용품 비교 데이터베이스 설계 (v1)

> **핵심 자산은 앱이 아니라 DB다.** 블로그·앱·추천엔진·어필리에이트는 전부 이 DB 위에 얹는 "뷰".
> DB가 정확하고 거대하면 → 어떤 형태로도 변형 가능. DB가 부실하면 → 무엇도 안 됨.

작성일: 2026-06-07 / 근거: feasibility 3개 문서의 실패·성공 패턴

---

## 0. 설계를 지배하는 4가지 원칙 (검증에서 도출)

| 검증에서 배운 것 | DB 설계 반영 |
|---|---|
| ⛔ 모델명 환각 | **화이트리스트 게이트**: `product.curation_status`. 사람이 verified 한 모델만 데이터 입력 허용 |
| 🔴 카테고리/연식 혼동 | **category + model_year + variant**를 키로. 비교는 같은 카테고리 안에서만 |
| ⚙️ 표기 기준 제각각 (무게 min vs packed, 원통 vs 박스) | **원본값(raw)과 정규화값(normalized)을 둘 다 저장**. 정규화 규칙은 메트릭에 명시 |
| 🟡 출처마다 값 다름·가격 변동 | **값마다 출처·신뢰도 기록**, 가격은 **시계열 별도 테이블** |

### 가장 중요한 결정: ⭐별점은 저장하지 않는다 (파생값)
별점은 **"같은 카테고리 안에서의 상대 위치(백분위)"**라서, 새 제품이 들어오면 바뀜.
→ 별점은 원본 수치로부터 **계산되는 뷰/배치 결과**로 둔다. DB에는 **정규화된 숫자(원천)**만 진실로 저장.
→ 사용자 스타일별 종합점수(백패킹/오토캠핑/가성비)는 **조회 시점에 가중치로 계산**.

---

## 1. 엔터티 개요 (ERD 텍스트)

```
brands ──< products >── categories ──< metrics
                │                         │
                ├──< product_spec_values >┘   (제품 × 메트릭 = 값, 출처/신뢰도 포함)
                │        │
                │        └── sources         (다나와/무신사/공식몰/리뷰: 신뢰순위)
                │
                ├──< price_observations      (가격 시계열: 가장 변동 큼)
                ├──< data_quality_flags      (누락/충돌/확인필요)
                └──< affiliate_links         (수익화: 나중)

style_profiles ──< style_metric_weights >── metrics   (스타일별 가중치)
ratings  ← (파생) product_spec_values 로부터 배치 계산
```

## 2. 왜 EAV(메트릭 테이블) 구조인가
캠핑용품은 종류마다 비교 축이 다름:
- 텐트: 무게·수납·내수압·바닥면적·인원
- 침낭: 무게·내한온도(comfort/limit)·패킹부피·필파워
- 매트: 무게·R값(보온)·두께·패킹부피

→ 카테고리마다 컬럼을 박으면 테이블이 수십 개로 폭발.
→ **메트릭을 데이터로 정의**(metrics 테이블)하고, 값은 product_spec_values에 (제품,메트릭,값)으로 저장.
→ 카테고리 추가 = 메트릭 몇 줄 INSERT. **무한 확장 가능.**

## 3. 핵심 테이블 정의 (요약, 전체는 schema.sql)

- **brands**: 브랜드(국문/영문/원산지/등급)
- **categories**: 대/소분류 self-reference (캠핑용품 > 텐트 > 백패킹텐트)
- **metrics**: 비교 축 정의. `key, unit, direction(lower/higher_better), normalize_rule`
- **products**: 화이트리스트. `brand, category, model_name, model_year, variant, capacity, curation_status, sale_status`
- **sources**: 출처 + `trust_rank`(다나와/판매처/공식/리뷰)
- **product_spec_values**: (제품×메트릭) 값. `value_normalized, value_raw, raw_unit, source, confidence, is_primary`
- **price_observations**: 가격 시계열. `price_krw, seller, channel, observed_at, in_stock`
- **ratings**: 파생 별점. `metric, stars, percentile, comparison_scope, computed_at`
- **style_profiles / style_metric_weights**: 스타일별 가중치
- **data_quality_flags**: `flag_type(missing/conflict/needs_review)`

## 4. 데이터 적재 파이프라인 (검증된 v1)
```
1. [사람] 카테고리 정의 + 정확 모델명 화이트리스트  → products(curation_status='pending')
2. [자동] 다나와 스펙표 파싱 → product_spec_values (무게/크기/재질/내수압)  ※텍스트 추출 잘 됨
3. [자동] 누락분(수납크기/실판매가)은 판매처·리뷰로 보강
4. [자동] 정규화(무게→g, 크기→cm, 부피→cm³) + raw 보존
5. [자동] 2출처 교차검증, 불일치 → data_quality_flags
6. [사람] 플래그 검토 후 curation_status='verified'  ← 이때부터 별점/노출 대상
7. [배치] ratings 재계산(카테고리 백분위) + 스타일 점수
```
**자동 80% / 사람 20%.** 사람이 하는 화이트리스트+최종검증이 곧 **해자(moat)**.

## 5. 별점 계산식 (파생, 배치)
카테고리 C 안의 메트릭 m에 대해:
```
방향 보정: x' = (direction=higher_better) ? x : -x
백분위:   p = percentile_rank(x', within category C, 같은 capacity 세그먼트)
별점:     stars = round( 1 + 4*p , 0.5 )   # 1.0 ~ 5.0, 0.5 단위
```
스타일 종합점수(조회 시):
```
score(profile) = Σ(stars_m × weight[profile,m]) / Σ(weight[profile,m])
```
→ 같은 제품도 '백패킹' 프로파일에선 무게 가중치↑, '오토캠핑'에선 거주성·가격 가중치↑ 로 순위가 달라짐.

## 6. 확장 로드맵
- v1: 텐트(백패킹/오토캠핑) — 검증 완료된 영역부터
- v2: 침낭·매트·체어·테이블·버너 (메트릭만 추가)
- v3: 어필리에이트 링크 매칭, 가격 알림, 사용자 위시리스트
- v4: 리뷰 텍스트 → 정성지표(편의성/내구성) 정량화(LLM 스코어링)

## 파일
- `schema.sql` — 실제 DDL (SQLite, 그대로 실행 가능)
- `seed_sample.sql` — 검증된 데이터로 시드 (백패킹 2P 등)
