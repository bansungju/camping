# 데이터 파이프라인 버그 클러스터 (세션 단위 작업 묶음)

> 출처: [bug-report.md](bug-report.md) 의 데이터 파이프라인(`pipeline/*.py`) Medium 버그 47건을
> **실패 성격(failure-mode)** 기준으로 묶고, 한 세션에서 처리 가능한 양으로 클러스터화한 작업 계획.
> 각 클러스터는 가능한 한 동일 파일·동일 버그패턴을 함께 묶어 한 번에 같은 멘탈모델로 고치도록 구성.
>
> 작성일: 2026-06-14 · 총 47건 / 8 클러스터 · 전부 🟡 Medium · lane:BACKEND
>
> **세션 진행 규칙:** 한 클러스터 = 한 세션. 끝나면 [bug-report.md](bug-report.md) 에 ✅ 해결완료 갱신 +
> [WORK-LANES.md](WORK-LANES.md) 레인 갱신. 핫파일 잠금·명시적 `git add`·`stamp_version.py` 운영 제약 준수.

---

## DP-1 — 빈 입력 가드: ZeroDivision · 빈 `IN ()` · `None` 인덱싱 (8건) ✅ 2026-06-14 완료

> 결과: 실제 미해결 1건(M-479 value_metric 가드 추가, 단위테스트 검증). 나머지 7건은 이전 루프에서 기해결(M-510/528=L-192, M-511=M-176, M-512/368=M-215, M-509/367=M-183·M-290) 확인 후 ✅ 처리.


**성격:** 빈 DB/빈 결과셋에서 0 나눗셈, 빈 `IN ()` SQL 문법오류, `fetchone()` None 인덱싱. 전부 조기반환·`or 1` 가드 추가의 **사소한 방어 코드**. 가장 빠르게 처리 가능한 묶음.

| ID | 파일 | 한줄 |
|----|------|------|
| M-510 | `collect_images.py` | 검증 0건 시 `100*done/tot` ZeroDivisionError |
| M-528 | `collect_images.py` | `tot=0` 진행률 ZeroDivisionError (M-510과 동일지점, 함께 수정) |
| M-511 | `backfill_capacity.py` | products 빈 테이블 `have*100//total` ZeroDivisionError |
| M-479 | `value_metric.py` | `metric_keys` 빈 리스트 시 `sum([])/0` ZeroDivisionError |
| M-512 | `enrich_details.py` | `targets` 빈 리스트 시 `IN ()` 문법오류 |
| M-368 | `enrich_details.py` | `IN ()` 구문오류 (M-512와 동일, 함께 수정) |
| M-509 | `multicat.py` | `INSERT OR IGNORE` 중복 시 `fetchone()[0]` TypeError (harvest H-79 패턴 미적용) |
| M-367 | `multicat.py` | INSERT OR IGNORE 후 SELECT 불일치 `NoneType` (M-509와 동일, 함께 수정) |

**공통 수정 패턴:** `round(100*done/(tot or 1))` · `if not targets: return` · `cur.lastrowid` + SELECT 폴백.

---

## DP-2 — 트랜잭션 원자성 & DB 커넥션 누수 (7건) ✅ 2026-06-14 완료

> 결과: 6건 수정(M-478 DELETE+CREATE IF NOT EXISTS, M-471 DELETE를 SAVEPOINT 내부로, M-470 dry-run commit 가드, M-556·M-490 예외경로 con.close, M-477 레코드별 SAVEPOINT 격리), M-502는 단일 트랜잭션 구조로 기완화 확인. SAVEPOINT 격리·멱등 재빌드 in-memory 테스트 통과.


**성격:** DDL/DML 비원자 실행, SAVEPOINT 밖 DELETE, 예외경로 `con.close()` 미도달, 레코드별 try/except 부재로 전체 롤백. 크래시 시 **데이터 소실/연결 누수**. 트랜잭션 경계 설계를 한 멘탈모델로 잡고 처리.

| ID | 파일 | 한줄 |
|----|------|------|
| M-478 | `star_catalog.py` | `DROP TABLE`+`CREATE` 비보호 → 크래시 시 `catalog_scores` 소실 |
| M-471 | `validate_ranges.py` | implausible flag DELETE가 SAVEPOINT 외부 → 빈 상태 잔존 |
| M-470 | `refresh.py` | `--dry-run`인데 페이지별 `con.commit()`로 롤백 무력화 |
| M-502 | `normalize_models.py` | `valid=1` 리셋과 A-pass 플래그 재설정 사이 크래시 시 outlier 영구 허용 |
| M-556 | `promote_catalog.py` | SAVEPOINT 예외경로 `con.close()` 미도달 → DB 연결 누수 |
| M-490 | `babysit.py` | `promote_all` 예외 시 DB 커넥션 누수 |
| M-477 | `crosssource.py` | 단일 레코드 파싱 예외 시 전체 RECORDS 롤백 → 정상 데이터 손실 |

**공통 수정 패턴:** `DROP`→`DELETE`+`CREATE IF NOT EXISTS`, DELETE를 SAVEPOINT 내부로, `try/finally con.close()`, 레코드별 try/except 후 계속.

---

## DP-3 — I/O 견고성: 예외 미처리 · 인코딩 · silent 누락 (8건) ✅ 2026-06-14 완료

> 결과: 3건 수정(M-519 ocr_text try/except, M-491 카테고리 파라미터화+명시경보, M-469 NULL 카테고리 제외), 5건 기해결 확인(M-473=M-374, M-492=L-210, M-513/533=M-393, M-521=L-193). M-469/M-491 in-memory 테스트 통과.


**성격:** 네트워크/OCR/파일·CSV 입력에서 예외 uncaught 크래시, 인코딩 미지정, 광범위 except·가드로 인한 silent 데이터 누락. CI/cron 안정성 직결.

| ID | 파일 | 한줄 |
|----|------|------|
| M-473 | `detect_price_drops.py` | `send()` `urlopen` 예외 미처리 → traceback 크래시 |
| M-519 | `ocr_specs.py` | `run()` `ocr_text()` 예외 미처리로 스펙 삽입 롤백 |
| M-492 | `danawa.py` | `http_get` URLError 재시도 시 `last=None` 리셋으로 HTTPError 정보 손실 |
| M-491 | `babysit.py` | 커버리지 검사 카테고리 이름 하드코딩 → 이름 변경 시 silent 무음 |
| M-469 | `refresh.py` | `category_id IS NULL` 첫 그룹 silent 누락 → 이상치 검사 무력화 |
| M-513 | `seed_coupang.py` | `--load` 비정수 `rep_product_id` 행 `int()` ValueError → 이후 행 미처리 |
| M-533 | `seed_coupang.py` | CSV `rep_product_id` 비숫자 행 `int()` 비처리 (M-513과 동일, 함께 수정) |
| M-521 | `seed_coupang.py` | CSV `open()` 인코딩 미지정 → CP949 환경 한글 깨짐 |

**공통 수정 패턴:** `try/except` 후 `sys.exit`/`continue`+경고, `encoding="utf-8"` 명시, 카테고리 상수화, except 범위 좁히기.

---

## DP-4 — normalize 중앙값 공식 일관성 (4건) ✅ 2026-06-14 완료

> 결과: 1건 수정(M-488 테이퍼 평균폭 소수보존), M-501/M-547 기해결 확인(M-359/M-400로 B/C 패스 median 통일), M-548 검증·무해 확인(normalize_db 재롤업해도 수동 가격/스펙 무손실 — in-memory 재생성 SQL 테스트로 입증). floor_area 자가테스트 회귀 없음.


**성격:** A/B/C 패스 간 중앙값·하위인덱스 공식 불일치, 정수 반올림 정밀도 손실, 수동값 덮어쓰기. **알고리즘 일관성** 분석이 필요해 건수는 적어도 신중한 한 세션.

| ID | 파일 | 한줄 |
|----|------|------|
| M-501 | `normalize_models.py` | C-pass가 구 하위인덱스 중앙값 공식 사용 (H-83 B-pass 수정 미적용) |
| M-547 | `normalize_models.py` | `flag_price_outliers` C패스 중앙값이 B패스와 다른 계산식 → 격리 결과 불일치 (M-501 관련) |
| M-488 | `normalize.py` | `floor_area_m2` 테이퍼 평균 정수 반올림으로 소수점 정밀도 손실 |
| M-548 | `add_manual_models.py` | `canonical_models` DELETE+INSERT 후 `normalize_db()`가 수동 값 덮어씌움 |

**주의:** M-501·M-547은 동일 근본원인(B/C 패스 공식 통일)일 가능성 높음 → 함께 수정하며 회귀 검증.

---

## DP-5 — export_site 대표이미지·value 메트릭 정확도 (5건) ✅ 2026-06-14 완료

> 결과: 4건 수정(M-489 fill 실측, M-499 float 방어, M-500 spec_metrics 확장, M-523 파일 미존재 가드), M-463 기해결 확인(M-382 NULL-safe 이미지 쿼리). 컴파일+단위 로직 테스트 통과. 전체 export는 데이터 재생성(DATA 레인) 위험으로 미실행.


**성격:** export 단계의 NULL 비교 연산자 오류, 하드코딩, 타입 크래시, 메트릭 누락. 사용자 노출 데이터 직결. `export_site.py` 한 파일 집중 + 후속 `add_value_star.py`.

| ID | 파일 | 한줄 |
|----|------|------|
| M-463 | `export_site.py` | `canonical_model IS NULL` 대표이미지 조회 실패 (`=?` vs `IS ?`) |
| M-489 | `export_site.py` | value 메트릭 `fill: 100` 하드코딩 → 실제 커버리지 미반영 |
| M-499 | `export_site.py` | `value_normalized` 문자열 저장 시 `round()` TypeError 크래시 |
| M-500 | `export_site.py` | value를 `star_metrics`만으로 계산 → `CATEGORY_CONFIG` 비star 메트릭 silent 누락 |
| M-523 | `add_value_star.py` | `backpacking-bag.json` 미존재 시 FileNotFoundError (export 미실행 환경) |

---

## DP-6 — ocr_specs.py CLI 모드·정확도 정리 (4건) ✅ 2026-06-14 완료

> 결과: 2건 수정(M-475/M-545 verify/fill 필수화로 묵시적 verify·dead code 동시 해소, M-546 detail_images 조기반환), M-518 기해결 확인(M-356/M-417로 무게 max 채택). CLI 검증(플래그 없음=exit2) 통과.


**성격:** 단일 파일 `ocr_specs.py` 의 인자 검증·dead code·주석/코드 불일치·불필요 다운로드. 한 파일 열어 한 번에 정리.

| ID | 파일 | 한줄 |
|----|------|------|
| M-475 | `ocr_specs.py` | `--verify`/`--fill` 미입력 시 묵시적 verify 모드 실행 |
| M-545 | `ocr_specs.py` | 미지정 시 `mode="verify"` 기본동작 + `--verify` 플래그 dead code (M-475와 짝) |
| M-518 | `ocr_specs.py` | 무게 주석 "가장 큰 값" vs 코드 `min()` 불일치 → 유지보수 위험 |
| M-546 | `ocr_specs.py` | `detail_images()` PIL `Image is None` 체크가 루프 안 → 불필요 전체 다운로드 |

---

## DP-7 — 스크래핑 파서 정확도: harvest_tents · danawa (4건) ✅ 2026-06-14 완료

> 결과: 2건 수정(M-541 메타 description 순서무관 정규식, M-514 p_trunc 정의순서 이동), M-534 기해결 확인(M-275/L-241 튜플 dedup), M-535 검증·오탐 확인(split 홀수길이라 마지막 블록 누락 없음 — 제품 1·2·3·5개 테스트). M-541 4케이스 테스트 통과.


**성격:** 크롤링 파싱 단계의 정의순서 NameError, dedup 누락, off-by-one, 정규식 추출 실패. 파서 로직 정밀 수정 묶음.

| ID | 파일 | 한줄 |
|----|------|------|
| M-514 | `harvest_tents.py` | `p_trunc` 정의가 `report()` 뒤 → 코드 추출 시 NameError 위험 |
| M-534 | `harvest_tents.py` | `seen_names` 모델명만 dedup → 다른 브랜드 동명 모델 누락 |
| M-535 | `harvest_tents.py` | `parse_results()` `range(1,len(parts)-1,2)` off-by-one → 마지막 블록 누락 |
| M-541 | `danawa.py` | `_meta_description` 속성순서 고정 정규식으로 Description 추출 실패 |

---

## DP-8 — 분류·필터·링크·쿼리 정확도 (7건) ✅ 2026-06-14 완료

> 결과: 3건 수정(M-532 None 출력방어, M-522 동적 f-string SQL→정적쿼리, M-536 ROW_NUMBER 결정화), 4건 기해결·기처리(M-542=L-196 경고처리, M-520=M-411, M-472=M-385/M-251, M-531=M-365/M-421). 핵심 3건 in-memory 테스트 통과.


**성격:** 분류 로직(weight=None), 필터 타입오류, GROUP BY 비집계 임의선택, f-string SQL 인젝션, `valid=1` 누락, in_stock 미기록, 무조건 실행 루프. 파일은 흩어져 있으나 모두 **출력 정확도/안전성** 단발 수정.

| ID | 파일 | 한줄 |
|----|------|------|
| M-532 | `brand_filter.py` | `name_ko=NULL` 처리 시 `None + str` TypeError |
| M-542 | `reclassify_other_tent.py` | `bucket()` `weight=None` 시 무조건 "auto" → 백패킹 텐트 오분류 |
| M-536 | `affiliate_links.py` | `sample()` `GROUP BY b.name_ko` 비집계 컬럼 임의선택 → 스펙 혼용 |
| M-522 | `promote_catalog.py` | `covpct()` 비따옴표 f-string SQL 삽입 → 인젝션 스캐너 우회 |
| M-520 | `star_catalog.py` | TOP3 리포트 쿼리 `valid=1` 필터 없음 → 무효 가격 표시 |
| M-472 | `detect_price_drops.py` | `in_stock` 미기록으로 재입고 이벤트 항상 미트리거 |
| M-531 | `babysit.py` | `near[:10]` 출력 루프가 `if near:` 없이 항상 실행 |

---

## 요약 매핑 (파일 → 클러스터)

| 파일 | 클러스터 |
|------|----------|
| `normalize.py` / `normalize_models.py` | DP-4 (+ M-502→DP-2) |
| `danawa.py` | DP-3(M-492) · DP-7(M-541) |
| `refresh.py` | DP-2(M-470) · DP-3(M-469) |
| `ocr_specs.py` | DP-3(M-519) · DP-6(M-475·545·518·546) |
| `star_catalog.py` | DP-2(M-478) · DP-8(M-520) |
| `export_site.py` | DP-5 |
| `seed_coupang.py` | DP-3 |
| `harvest_tents.py` | DP-7 |
| `collect_images.py` | DP-1 |
| `multicat.py` / `enrich_details.py` | DP-1 |
| `backfill_capacity.py` / `value_metric.py` | DP-1 |
| `crosssource.py` | DP-2 |
| `promote_catalog.py` | DP-2(M-556) · DP-8(M-522) |
| `add_manual_models.py` | DP-4 |
| `add_value_star.py` | DP-5 |
| `validate_ranges.py` | DP-2 |
| `detect_price_drops.py` | DP-3(M-473) · DP-8(M-472) |
| `babysit.py` | DP-2(M-490) · DP-3(M-491) · DP-8(M-531) |
| `brand_filter.py` / `affiliate_links.py` / `reclassify_other_tent.py` | DP-8 |

**권장 진행 순서:** DP-1 → DP-2 → DP-3 (안정성/크래시 우선) → DP-5 → DP-4 → DP-8 → DP-7 → DP-6 (정확도/정리).
