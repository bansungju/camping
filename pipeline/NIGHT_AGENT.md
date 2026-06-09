# 야간 자율 에이전트 플레이북 (자는 동안 실행)

매 실행마다 이 절차를 따른다. 목표: **데이터 품질을 스스로 올리고, 못 고치면 기록**.

## 0. 작업 디렉토리
`~/idea/camping-gear-app`, DB=`camping_tents500.db`

## 1. 건강검진 (watchdog)
```bash
python3 pipeline/babysit.py --db camping_tents500.db
```
- 자동수리(정규화·검증·승격)는 여기서 이미 됨.
- 출력의 `[할 일]` 목록을 읽는다. exit 2면 처리할 게 있다는 뜻.

## 2. '완비 근접 메이저' 처리 (가장 가치 높음)
watchdog가 뽑은 `완비 근접` 목록(브랜드+pcode)에 대해, **빠진 1개 스펙을 크로스소스로 채운다**:
1. 모델명으로 WebSearch (예: "NEMO Aurora Ridge 2P floor area sq ft" / "fly hydrostatic head mm")
2. **실제 출처(REI/CleverHiker/제조사)에 값이 있을 때만** `crosssource.py`의 RECORDS에 추가
   - 단위 환산: sqft→m²(×0.0929), 무게 kg→g
   - **없으면 건너뛴다(절대 추정/날조 금지).** OSMO처럼 수치 없는 건 그대로 둠.
3. `python3 pipeline/crosssource.py` 실행
4. 모델명이 검색결과와 다른 제품이면 **오매핑 방지 위해 제외**

## 3. '기준의심' 교체 (무게/내수압)
`data_quality_flags` 의 `[기준의심]` 메이저 건을 REI 기준값으로 교체:
- 무게 → **최소무게(min/trail weight)** 로 통일
- 내수압 → **플라이 HH** 로 통일
- crosssource.py로 덮어쓰기(기존 valid값 없을 때만; 격리값은 교체됨)

## 4. 재집계 + 검증
```bash
python3 pipeline/run_all.py --db camping_tents500.db
```
정규화→검증→교정→승격→별점 일괄. verified 수가 늘었는지 확인.

## 5. 야간 로그 남기기
처리 내역을 `night_log.md`에 append:
```
## YYYY-MM-DD HH:MM
- verified NNN → MMM (+K)
- 크로스소스 추가: <모델들>
- 못 채움(출처없음): <모델들>
- 다음 실행 우선순위: <남은 완비근접>
```

## 멈춤 조건
- 완비근접 목록이 비거나, 이번 실행에서 신규 채움이 0건이면 종료(다음 주기 대기).
- **확신 없으면 채우지 말 것.** 빈칸 유지가 잘못된 값보다 낫다(이 프로젝트의 제1원칙).

## 안전 규칙
- 추정/날조 금지. 측정값(출처 명시)만.
- 모델명↔검색결과 불일치 시 적재 금지.
- 파괴적 작업(대량 DELETE) 금지. 스크립트는 멱등.
