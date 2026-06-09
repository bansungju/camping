# 스펙 채우기 자율 에이전트 플레이북 (15분 루프)

목표: **검증된 브랜드 제품의 빠진 defining 지표를 크로스소스로 채운다.** 측정값만, 날조 금지.
작업폴더 ~/idea/camping-gear-app, DB=camping_tents500.db.

## 매 회차 절차

### 1. 채울 지표 선택 (로테이션)
우선순위 (커버리지 낮은 defining 지표):
1. **버너 화력**(power_output) — 소토/MSR/코베아/이와타니/스노우피크 등 BTU·kcal 공개
2. **매트 R값**(r_value) — 써머레스트/엑스페드/씨투써밋/니모 공개
3. **침낭 충전량**(fill_weight) 또는 내한온도 — 제조사 공개
4. **텐트 바닥/내수압**(floor_area/water_head) — REI/제조사

직전 회차에서 한 지표가 소진(신규 0)이면 다음 지표로.

### 2. 대상 추출 (해당 지표 빠진 브랜드 제품)
```sql
SELECT p.danawa_pcode, b.name_ko||' '||p.model_name
FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
WHERE c.name_ko='<카테고리>' AND p.curation_status!='rejected' AND p.danawa_pcode IS NOT NULL
  AND b.name_ko IN (<지표 공개 브랜드>)
  AND NOT EXISTS(SELECT 1 FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key='<지표>' WHERE v.product_id=p.id AND v.valid=1)
GROUP BY b.name_ko, p.canonical_model LIMIT 8;
```

### 3. WebSearch로 실측 찾기 (8개 내외 배치)
- 영문 모델명으로 검색 (예: "SOTO Windmaster output BTU", "Exped Dura 5R R-value", "Hilleberg fill weight")
- **출처(REI/제조사/리뷰)에 명시된 값만.** 모델명↔검색결과 일치 확인.
- 단위 변환: BTU→kcal(×0.252), oz→g(×28.35), sqft→m²(×0.0929)
- **없거나 불확실하면 스킵**(빈칸 유지). 모델불명·음차애매 제외.

### 4. 적재 + 재집계
- crosssource.py RECORDS 에 추가: `{"pcode":"...","src":"...","m":{"<지표>": 값}}` (또는 floor_m2/water/weight 기존필드)
- `python3 pipeline/crosssource.py --db camping_tents500.db`
- `python3 pipeline/run_all.py --db camping_tents500.db`

### 5. 로그 (fill_log.md 맨 위에 한줄요약 + 회차기록)
```
> 최신: <지표> 커버리지 X%→Y% / 누적 채움 N
## 날짜시각 — <카테고리/지표>
- 채움: <모델들 (값)>
- 못채움(출처無/불명): <모델들>
- 다음 회차: <지표/카테고리>
```

## 안전 규칙
- **측정값만**(추정/날조 금지). 확신 없으면 빈칸.
- 모델명 불일치 시 적재 금지(테라노바 포엔=Voyager 같은 오매핑 주의).
- 스크립트 멱등. 신규+보강 0이면 다음 지표 로테이션, 모든 지표 소진 시 대기.
- 한 회차 8개 내외만(과도한 검색 자제).
```
```

## 막다른길 제외 (중요)
대상 추출 SQL에 반드시 추가: `AND NOT EXISTS(SELECT 1 FROM data_quality_flags f WHERE f.product_id=p.id AND f.note LIKE '[데이터없음]%')`
검색 후 '미공개/모델불명'으로 확인되면 그 자리에서 플래그:
`INSERT INTO data_quality_flags(product_id,flag_type,note) SELECT id,'needs_review','[데이터없음] <사유>' FROM products WHERE danawa_pcode='<pcode>';`
→ 다음 회차부터 재검색 안 함. (미검색은 플래그 금지, 미공개/불명만)

## 침낭 내한온도 = comfort(ISO 쾌적) 기준 [확정]
크로스소스 시 ISO comfort 온도 사용(limit/한계 아님). 예: 몽벨 #3 comfort 5℃, 다운허거900 #3 comfort 3℃.
기존 다나와 값은 best-effort 유지. 신규는 반드시 comfort.

## 기준확정 (confirm) — 무게/내한온도 우선
무게·내한온도는 다나와값 기준불명(min/packed, comfort/limit). 메이저 브랜드부터 크로스소스로 확정:
- 무게 → 최소무게(min trail weight) 검색 → `{"pcode":..,"weight":"1247g","confirm":True}` (덮어쓰기)
- 내한온도 → ISO comfort → `{"pcode":..,"m":{"comfort_temp":3},"confirm":True}`
- confirm=True면 기존 다나와값을 확정값으로 교체. 진행률: `SELECT * FROM v_value_badge`
- 롱테일(노네임~중소)은 확정 불가 → '참고' 배지로 둠(정직).
