# 야간 자율 에이전트 — 전 카테고리판 (자는 동안 실행)

마스터 DB: `camping_tents500.db` (이름과 달리 **전 카테고리 통합 DB**: 텐트·침낭·매트·의자·랜턴·아이스박스·버너·타프).
매 실행마다 아래를 수행. 목표: **모든 카테고리의 카탈로그를 넓히고 일관성 유지**. 측정값만·가격필수·날조금지.

## 1. 카탈로그 확장 (breadth) — 모든 카테고리
신규 제품을 더 긁는다(중복 자동 dedup). 매 회차 maxpages를 조금씩 키운다(2→3→4…):
```bash
python3 pipeline/multicat.py --db camping_tents500.db --maxpages 4   # 침낭~타프 7개
python3 pipeline/harvest_tents.py --append --maxpages 4 --db camping_tents500.db \
  --queries "백패킹텐트,텐트,초경량텐트,돔텐트"                        # 텐트
```
- 신규 0건이면 그 카테고리는 포화 → 다음 회차엔 브랜드별 쿼리로 사각지대 보완.

## 2. 유지·검증·승격·별점 (전역)
```bash
python3 pipeline/run_all.py --db camping_tents500.db
```
정규화→검증→컬럼교정→승격(카테고리별 core+가격필수)→별점. verified 증감 확인.

## 3. 건강검진 + 깊이 보강 (텐트 우선, 가능하면 타 카테고리)
```bash
python3 pipeline/babysit.py --db camping_tents500.db
```
- '완비 근접 메이저'가 나오면, 빠진 1스펙을 **WebSearch로 실제 출처(REI/CleverHiker/제조사)에서** 찾아
  `crosssource.py` RECORDS에 추가(sqft→m²×0.0929) → 실행. **없으면 빈칸 유지.**
- 가격 없는 제품(제1규칙 위반) 발견 시: 크로스소스로 가격 확보 시도, 안 되면 pending 유지.

## 4. 로그 (반드시)
`night_log.md` 에 append:
```
## YYYY-MM-DD HH:MM (회차)
- 카테고리별 제품/verified: 텐트 NNN/MMM, 침낭 .., 의자 .., ...
- 신규 수확: <카테고리 +N>
- 크로스소스/교정: <내역>
- 못채움(출처無): <내역>
- 내일 사람이 볼 것: <이상치/판단필요 항목 3개>
```

## 멈춤·안전
- 모든 카테고리 신규 0건 + 보강 0건이면 그대로 대기(다음 주기).
- 측정값만. 확신 없으면 빈칸. 파괴적 작업 금지(스크립트 멱등).
- 새 카테고리의 깊은 스펙(밝기·화력·R값 등) 크로스소스는 신중히 — 모델명 정확 매칭만.

## 아침 보고용 한 줄 요약을 night_log 맨 위에 갱신
`> 최신: 총 N종 / verified M종 / 카테고리 K개 / 어젯밤 +X종`
