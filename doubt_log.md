> 최신: 보완3 완료 — 3건수정 · verified 2327 · 수렴(10→8→3)

## 06-08 17:35 보완사이클3
- ✅수정3: 충전량 교차필드검증(≥총무게 격리)·웨건 테이블부속/유아유모차 reject
- 누적 23발견/23처리. 새버그 급감=수렴
- 큐 비움 → 다음 의심사이클(0건이면 1단계 완성신호)
> 최신: 보완2 완료 — 8건 전부 수정 · verified 2328

## 06-08 17:07 보완사이클2 (서브 의심8건)
- ✅수정8: 패킹부피원통·코펠세트무게합산·canonical분리·graph라벨 + 부속/오분류 reject(타프폴/야전침대부속/가로등/의자세트)
- 구조버그 3개(파서2+정규화1) 근본수정
- 큐 비움 → 다음 회차 새 의심
> 최신: 보완1 완료 — 6수정/4기각 · verified 2335 · 배지 정직화(확정=외부소스78)

## 06-08 16:38 보완사이클1 (서브 의심10건 처리)
- ✅수정6: 매트두께상한·밝기단계삭제·인피니티플래그·배지재정의·펫reject·코트텐트재분류
- ❌기각4: 파워뱅크97W(실제PD)·침낭기준혼입(배지처리)·펜타20kg(실제)·랜턴350h(공개값)
- 큐 비움 → 다음 회차 새 서브에이전트 의심

## [보완 사이클 4] 2건 — 둘 다 RESOLVED
1. RESOLVED 코트텐트 메트릭 고아: 2회차 재분류가 category만 옮기고 metric_id 미변경 → cat3 메트릭에 묶여 기타텐트 비교서 누락. → validate_db에 **메트릭 자동복구(remap)** 상설화: product.category≠metric.category면 같은key 새카테고리 메트릭으로 이동. 고아 30개(10종×3) → 0, cat7 별점 참여 확인. 미래 재분류도 자동 안전.
2. RESOLVED id163 '플레어 2p' capacity 1→2 (모델명 '2p' 명시 일치).
재집계: validate(격리474/재분류33) + run_all(verified 2327). 멱등.
※ 4회차 의심 2건 중 #1은 새 데이터버그 아닌 **방어자 수정의 부작용**을 공격자가 추적 → 적대루프 가치 입증.

## [보완 사이클 5] 2건 — 둘 다 RESOLVED
1. RESOLVED 침낭 교차모순: id2087 인피니티1300 comfort +22℃ vs 충전량1300g(겨울급)=상한온도 오스크랩. → validate_db에 교차필드 규칙 상설화(충전량≥1000g & comfort>10℃ → comfort 격리). 추측으로 온도 채우지 않고 valid=0(정직). id2087 격리 확인, id2019(fill800·comfort7=정상 경량3계절)는 미격리=과격리 방지. comfort 격리 8→9.
2. RESOLVED packed_volume 별점 불일치: 5개 카테고리는 참고(0)인데 코펠·의자만 별점(1)=정합성깨짐. → 전 카테고리 is_star_metric=0 통일(다수=참고 관행). 코펠 packed_volume 별점 52→0. 코펠은 capacity_l+weight 별점 유지.
재집계: 격리475 / verified2327. 멱등.
   └ #2 보강: recompute_ratings가 is_star_metric=0 지표는 별점 미생성하게 수정(pipeline.py L177). packed_volume 잠복 별점 194→0 근원차단. 2단계 사이트가 ratings 직접읽어도 오해 없음. (promote_catalog.py 기존 의도와 일치)

## [보완 사이클 6] 2건 — 둘 다 RESOLVED
1. RESOLVED 침낭 capacity 누수: 더블/2인용 침낭 6종+1종이 capacity(인원수)로 파싱돼 scope가 category:5|cap:2/1로 오분할(작은풀 percentile 어긋남). → validate_db에 **capacity 가드 상설화**: products.capacity는 텐트류('%텐트%')만 비교축 → 그 외 카테고리는 NULL. 침낭 504종 전부 cap:-1 단일세그 통합, cap:2 scope 소멸, 텐트외 누수 0. 미래 누수도 자동 차단.
2. RESOLVED id611 '스텔라릿지 텐트2 해외구매' cat7→cat3 재분류(동일모델 id32와 일치). pending이나 정합성 위해 교정. metric remap 자동복구가 spec 정리.
재집계: verified 2327. 멱등.

## [보완 사이클 7] 3건 — 전부 RESOLVED
1. RESOLVED 침낭 한계온도 혼입: 씨투써밋 스파크 3종(1027/1085/1101)이 comfort칸에 극한(생존)온도 저장→별점 부풀림. 형제 7종이 모델명온도==저장값 패턴 입증 → 모델명 공식등급으로 교정(추측아님): 1027 -18→-2, 1085 -36→-15, 1101 -26→-8.
2. RESOLVED 아이스박스 명칭충돌: id2607 모델명 85L vs 스펙 45L, 형제 코로보레이션 없어 확정불가 → capacity_l 격리(valid=0)+conflict 플래그(정직, 추측회피).
3. RESOLVED 가격 오염: 쉘터 GHE 3색 동일SKU에 2,199원(부속)·140만원(오타) 혼입=636배. → normalize_models에 flag_price_outliers 상설화: canonical 그룹(관측≥3) 중앙값 대비 [0.2×,5×] 밖 격리(valid=0), 집계서 제외. 관측<3은 미적용(과격리 방지). GHE min/max 70,840 단일로 정화. 미래 부속/오타단가 자동차단.
재집계: 가격이상치 격리 2건 / verified 2327. 멱등.

## [보완 사이클 8] 2건 — 둘 다 RESOLVED (구조적)
1. RESOLVED 비교풀 분모팽창: 색상변형이 ratings에 각각 들어가 풀크기 과대(cat4|cap:4 121행 vs canonical 107). 별점/percentile 값은 형제동일이라 불변, "N개중 X위" 카운트만 오류. → run_all에 v_model_ratings 뷰 신설(canonical+cap+metric+scope 단위 1대표). 사이트는 이 뷰로 풀크기/순위 카운트. 121→108로 정합.
2. RESOLVED 랜턴 광원형태 혼재: verified 57종 중 26종 손전등/헤드랜턴이 면조명 랜턴과 같은 밝기/runtime 풀서 랭킹=비교축 다름(점광원 4500lm이 면조명 압도). 사용자 "랜턴에 손전등 포함" 지시 존중 → 제외 대신 recompute_ratings에 광원형태 세그먼트(_form_segment) 추가: 헤드/손전등/후레쉬/플래시→seg:handheld 별도풀, 면조명→main. id2434 등 handheld 풀로 분리, 둘다 보존하며 공정비교.
재집계: verified 2327. 멱등.

## [보완 사이클 9] 1건(중대) — RESOLVED, 별점 산출엔진 재설계
1. RESOLVED min-max 선형 정규화 결함: percentile=(v-min)/(max-min)이라 outlier 1개가 범위왜곡→별점 한쪽 쏠림. 방향 비대칭이 증거(weight ★4.1 vs higher_better ★1.5~2.3), 아이스박스 45L(중앙값28.3위)이 ★2.5.
   → recompute_ratings를 **세그먼트내 순위백분위(rank/N, 동점=평균순위)**로 재설계: percentile=(avg_rank-1)/(N-1), 중앙값=0.5=★3. outlier 강건, 분포 균등.
   결과: 전 지표 평균 ★1.5~4.1 → 전부 ★2.98~3.05 수렴. 아이스박스 45L ★2.5→★4.0(pct0.79). 전체 별점분포 종형 균등(★3:1241, 양끝 완만), 전체평균 3.003.
   ※ 별점 값 전체가 재정의됨(min-max→순위)=1단계 별점 신뢰성의 근본 토대. 멱등. verified 2327 불변.

## [의심사이클 10] — 새 의심 없음(수렴 신호 1/2)
순위백분위 엔진 교체 부작용 집중감사: 방향역전(텐트340g→★5/4400g→★1, 랜턴5000lm→★5/16lm→★1, 침낭-45℃→★5/+15℃→★1) 정상, 동점처리 위반0, percentile NULL/범위이탈 0/9801, 핸드헬드세그 완전분리(중복0), 고아ratings0, 단조성위반0, v_model_ratings 중복0, 신규 단위혼입0. → 엔진교체 무부작용 확인. 첫 클린 라운드.

## [보완 사이클 11] 1건 — RESOLVED (가격 채널혼입)
1. RESOLVED 직구 채널가 오염: 같은 canonical에 '해외구매'(직구)+국내 variant가 둘다 verified로 묶여 min_price가 비현실 직구가로 잡힘(35건, 평균29.5%·최대86.4% 낮음). → normalize_models canonical 가격집계를 COALESCE(국내가, 전체)로 변경=국내가 우선, 국내 없을때만 직구 fallback. 컴팩트폴딩체어 min 29,100→214,030, 오염 canonical 35→0, 직구-only(TNF캠프스툴 등)는 fallback 유지. 멱등.
한계 문서화: 매트 r_value 7%·코펠 capacity_l 9% 결측=국내 미표기 가용성 한계(오염아님), 한계지도 명시 예정.

## [의심사이클 12] — 새 의심 없음(재수렴 1/2)
10각도 반증실패=클린: canonical max/min 10x 0건, brand1제품=정상수집, 세트무게혼입 근거없음, 2P텐트<1m² 0건, is_primary중복0, valid=0별점풀진입(floor 4건 공존하나 별점은 valid=1기준 정확산정), 동일pcode중복0, 고아brand_id0, 단위(thickness/water_head)위반0, 소표본극단=N=1가드작동·N=2는 percentile본질한계(오류아님). → 신규 데이터오류 0. 재수렴 1/2.

## [보완 사이클 13] 1건 — RESOLVED (회수가능 결측 백필)
1. RESOLVED 코펠 capacity_l 회수: 모델명에 용량명시인데 파싱누락된 결측을 백필. → validate_db에 backfill_capacity_l 상설화: capacity_l 메트릭 보유 전 카테고리서 model_name 용량토큰 1개일때만 회수(세트 '800+400ml'·'+' 다부품은 합산모호로 skip=추측회피). 코펠 9%→30%(6→19), 아이스박스→100%, verified 2327→2330(+3 완비). '+' 세트 오인 3건(5198/5240/5256)은 가드추가+제거. 멱등.
   ※ 회수 후에도 코펠 70%는 모델명에도 용량없음=진짜 한계 → 한계지도 명시. r_value(미공개)와 구분: 이건 회수가능분만 회수.

## [의심사이클 14] — 새 의심 없음(재수렴 1/2)
백필 부작용+10각도 클린: 모델명백필 21건 트랩숫자(TAKE6의6, S2000X의2000, Trek1400) 전부 회피=실제리터만, 신규verified3건 정상환산(범위0.709~130L), power_output 카테고리별 metric_id분리(kcal/W 혼입불가), fill_weight 침낭外 0, canonical NULL/빈값 verified 0, variant 스펙오병합 0, 진짜중복(brand+name+cap) 0, 중복pcode 0, stars=1+4*pct 100%일치, 브랜드 과대표 0. → 신규오류 0. 재수렴 1/2.

## [보완 사이클 15] 3건 — 전부 RESOLVED (최종게이트 적발)
1. RESOLVED 가격필수·뷰 누수: id705/733이 valid가격 0인데 verified, 뷰는 격리된 2199·140만원 노출. → promote_all 가격조건에 po.valid=1 추가(유효가격 없으면 verified불가), run_all서 v_verified_catalog 재생성하며 가격서브쿼리 valid=1. 705/733→pending강등, valid가격없는verified 0, 뷰 노출차단.
2. RESOLVED floor_area 본체→이너: value_raw에 본체+이너 병기인데 본체로 환산돼 별점과대. → normalize.floor_area_m2에 이너우선 로직(이너구간 절취, 'A(B)'는 바닥레벨 B채택). '이너'병기 69건중 19건 교정(id471 22.4→5.28, id352→6.0). floor>15 verified 257→250.
3. RESOLVED 파워뱅크 핵심지표 부재: 용량(mAh) 메트릭 자체가 없어 출력·무게로만 별점=50000/10000mAh 동급. → validate에 backfill_capacity_mah 상설화: capacity_mah 메트릭 신설+model_name서 mAh회수(트랩 W숫자 회피, 3~7자리 mAh만). 96종 백필·별점96행. HARD_RANGE capacity_mah(1000~600000) 추가.
   ※한계: 파워뱅크 240중 96만 model명 mAh표기, 나머지(파워스테이션 등)는 명에도 없음=회수불가 한계. 한계지도 명시.
재집계: verified 2329. 멱등.

## [보완 사이클 16] 1건 — RESOLVED (15R floor 과교정 보정)
1. RESOLVED 테이퍼 바닥 과소산정: 15R이 'A(B)'서 좁은폭 B만 써 사다리꼴 면적 10~20% 과소. → normalize.floor_area_m2의 'A(B)' 처리를 평균폭 (A+B)/2로 변경(사다리꼴 면적공식). 18건 갱신: id471 5.28→6.27, id196 1.34→1.55, id2 1.89→2.15(서브 계산과 일치). 본체(과대)→좁은폭(과소)→평균폭(정확) 수렴.
재집계: verified 2329. 멱등.

## [의심사이클 17→보완] 1건 — REJECTED (오진, 진짜버그 0)
1. REJECTED canonical min_price '직구 누락' 주장: 서브가 직구가(보통 최저)가 min_price서 빠진걸 stale로 오해. 실제는 11R 수정(국내가 우선집계=직구 lowball 오염차단)의 의도된 동작. 검증: 불일치 39건 전부 직구가 더싸서 국내가 채택된 정상 케이스, 국내채널 기준 진짜 불일치 0건. canonical_models는 매 run_all서 normalize_db가 재생성→stale도 아님. → 기각. (직구 lowball을 다시 min으로 쓰면 11R 회귀라 수정 안함). 데이터 정상 확인=재수렴 1/2.
  ※향후 2단계 enhancement 후보: 사이트서 "국내 X~Y원(직구 최저 Z원)" 병기 표시 — 정보손실 없이 투명. 결함 아님.

## [보완 사이클 18] 1건 — RESOLVED (색상변형 capacity 분산)
1. RESOLVED 색상SKU 인원태그 비일관: 같은 물리텐트(동일 brand+canonical+floor+weight)인데 색상별 capacity 불일치로 ratings가 cap5/cap6 두 풀로 분산. 알베르게 734(차콜) cap6→5, 브이하우스M 746(아이보리) cap6→5. → validate에 harmonize_variant_capacity 상설화: 동일 brand+canonical+floor+weight면 capacity 다수결 통일(weight/floor 다르면 그룹분리=과교정방지, 오스카 15k/32k는 자동제외). 잔존 0, verified 2329. 멱등.

## [의심사이클 19→보완] 1건 — RESOLVED (테이퍼 괄호 1번째치수)
1. RESOLVED 평면포맷서 테이퍼 'A(B)'가 1번째 치수면 파서가 괄호값을 폭으로 오인·실제폭 누락: id164 "290(145)x253x127"→4.21(290×145, 폭253누락). 16R 평균폭보정이 이너포맷에만 적용된 탓. → floor_area_m2를 전 포맷 통일(괄호 먼저 평균치환 후 dims파싱). id164 4.21→5.52(폭253 회수), id1972 7.11→7.24, 일관성위해 id271/437도 사다리꼴 평균 적용(224x178(130)→224x154). 11건 갱신. 멱등.

## [의심사이클 20→보완] 1건(중대) — RESOLVED (파생 footprint floor)
1. RESOLVED 파생 floor_area=본체 footprint(이너 아님): value_raw='다나와상세(파생)' 327종이 외형footprint라 이너기준 텐트와 같은풀서 별점과대(고스트팬텀 카키 22.4㎡★4.5 vs 형제 이너6.27㎡★2.0). 16/19R 이너보정이 dims문자열 보유분만 잡아 파생값에 구멍. → 사용자결정(외형배지+별점제외): star_eligible 컬럼 신설, recompute가 star_eligible=1만 산정. mark_footprint_floor 상설화: 형제 이너측정값 전파 19종(별점복귀), 형제없는 308종 star_eligible=0(값·verified·표시 유지, 별점만 제외). limits_map 충전율도 star_eligible 기준으로(정직). 효과: cap4 floor별점 평균면적 12.04→8.67(측정수준), 오토캠핑텐트 floor 100→28%·기타텐트 35%로 진짜 이너커버리지 노출(A→B 정직강등). verified 2325 유지. 멱등.

## [의심사이클 21→보완] 1건 — RESOLVED (외형배지 뷰 미반영)
1. RESOLVED 20R '외형배지' 절반이 카탈로그뷰 미도달: v_verified_catalog.floor_m2가 star_eligible=0 footprint(45㎡ 등)를 이너와 구분없이 노출. 별점제외는 완벽작동(누수0 양방향)이나 표시단 배지 누락(15R#1과 동일패턴). → 뷰 분리: floor_m2=이너(star_eligible=1)만, floor_outer_m2=외형footprint, floor_basis_note='외형기준·이너미상'. 외형텐트 298종 floor_m2=NULL+outer값+배지, 이너텐트는 floor_m2만. floor_m2>20 잔존 78건은 타프 면적(정상, 이너아님)·대형텐트라 누수아님 확인. 멱등.

## [의심사이클 22→보완] 1건 — RESOLVED (색상변형 weight 혼입)
1. RESOLVED 같은텐트 색상SKU weight_min 모순: 오스카 하우스(470=15kg vs 791/813=32kg, floor·water·치수·cap 전부동일=같은텐트)·리빙쉘롱Pro(18.6k vs 20.2k). 색상은 무게 못바꿈, 32kg은 총중량/배송중량 혼입. 18R harmonize_capacity가 이 무게차를 '실제'로 가정해 격리만 했지 무게값 자체는 미검증=신규. → harmonize_variant_weight 상설화: 같은 물리텐트(brand+canonical+cap+동일floor)면 weight_min을 그룹 최소값으로 통일(weight_min 정의=최소무게, floor동일=같은텐트, floor다르면 분리=과교정방지). 오스카 32→15k(별점★1→★3), 리빙쉘 20.2→18.6k. 멱등(태그중복0). verified 2325.

## [의심사이클 23→보완] water_head 3건 통일·genuine 3건 미수정
변형일관성을 전지표 일반화 스캔: 잔여 불일치 6그룹뿐(나머지 전지표 클린=20~22R정리완료).
1. RESOLVED water_head 색상변형 split(전부 파생·색상불변 물리스펙): 브이하우스M(아이보리2000 vs 블랙/탄3000→다수결3000), 파프리카매그넘(오렌지3000 vs 4종2000→2000). → harmonize_variant_water_head 상설화(텐트/타프 다수결, 동수면 skip). 리빙쉘롱Pro 2:2 동수는 정답불명→미변경(추측회피).
2. 미수정(측정불가, 추측회피): 반타프 weight 1.08 vs 1.3kg·콜맨레이체어 3.7 vs 3.2kg·M400침낭 comfort -4 vs -17℃ — 형제별 genuine 실측원문 존재, 에디션/해외판 실사양차 배제불가 → 통일 안함(genuine raw는 건드리지 않는다).

## [의심사이클 24→보완] 1건 + 구조버그 — RESOLVED
1. RESOLVED 침낭 라인역전(comfort extreme오염): 씨투써밋 알파인 AP2(1.3kg, comfort -42℃ danawa) vs AP3(2.0kg, -30℃ S2S공식). 무거운(충전재多) AP3가 더 따뜻한 등급=물리역전 불가. AP2 -42는 extreme값 comfort칸 오염(S2S APII 실제 comfort≈-20). AP2 ★5.0(504침낭中 2위한랭)으로 과대. → AP2 -42 격리(참값미보유 추측회피). 별점제외, AP2 demote.
2. RESOLVED(구조버그) 지속격리 부활: validate_db의 'UPDATE valid=1' 전체리셋이 range검증으로 못잡는 conflict격리(AP2, id2607 쿨러85/45)를 매번 부활시킴 → id2607이 7R 이후 내내 회귀해있었음. → validate에 지속격리 재적용 상설화: valid=1 리셋 직후 conflict '격리' 플래그(resolved=0, source≠4) 매칭 spec을 다시 valid=0. AP2·id2607 격리 영구화, 멱등 확인. verified 2322.

## [의심사이클 25] — 새 의심 없음(재수렴 1/2)
10신규각도 클린: scope문자열·가격단위(1095~489만원)·brand_id정합·model인코딩·canonical가격·metric direction(48지표)·power_output kcal/W분리 전부정상. 별점공식 24건=round-half-to-even 일관(버그아님). 버너 weight↔power역전=포트시스템 genuine raw(미수정). 카테고리별 verified 16개 전부 LIMITS.md 정확일치(합2322). 진짜 새 측정오류 0. 재수렴 1/2.

## [의심사이클 26→보완] 1건 — RESOLVED (파워뱅크 자릿수누락)
1. RESOLVED id5935 누아트 NAT10000 capacity_mah=1000 자릿수누락: 모델명 "NAT 10000 BATTERY 1000mAh" 자기모순(라인명10000 vs 스펙1000), 무게175g·22.5W PD는 10000급. 백필이 '1000mAh' 토큰 잡아 ★1.0 오산정. 참값 확정불가(이름모순)+1000mAh는 보조배터리 물리적 비현실. → 추측교정 대신 capacity_mah 타당범위 하한 1000→2000(보조배터리 최소)으로 자동격리. id5935 valid=0, 파워뱅크 용량최소 10000 정상화. durable·멱등. verified 2322.

## [의심사이클 27] — 새 의심 없음(재수렴 1/2)
자릿수/단위 정밀 전수: 13개 star지표 최소·최대 차순위대비 재확인, 10배+ 단독이상치 0. 후보(brightness16lm·capacity_l 0.709=709ml·가격12.8배)는 value_raw일치/직구국내채널/타입혼재 genuine. 재수렴 1/2.

## [의심사이클 28→보완] 1건(중대구조) — RESOLVED (별점 모집단 오염)
1. RESOLVED 별점 percentile 분모에 비-verified 혼입: recompute_ratings(pipeline.py L187·191)가 groups·rows 쿼리에 curation_status 필터 없어 pending(790종)·rejected(2170 노네임)가 별점 모집단에 섞임 → verified 브랜드제품이 노네임과 같은풀서 순위(브랜드만 원칙 위반). 의자 내하중 분모 378(rated) vs 194(verified). 27라운드간 색상dedup만 봤지 분모의 curation_status는 한번도 안봄. → 양 쿼리에 curation_status='verified' 추가. ratings 9602→4939행(verified만), 의자분모 194, 1356 pct 0.985→0.997, 전체평균 ★2.998 유지. 모든 별점이 이제 verified-only 풀 기준=진짜 '브랜드 카탈로그 내 순위'. 멱등.

## [의심사이클 29→보완] 1건 — RESOLVED (평행 별점엔진 제거)
1. RESOLVED star_catalog.py 이중엔진: catalog_scores가 9R폐기 min-max공식+star_eligible/handheld 미적용으로 매 run_all 재계산, ratings/LIMITS와 모순. 단 소비처0(노출무오염)+사용자 드롭한 가중종합점수=삼중폐기. → run_all서 star_catalog.py 제거+catalog_scores 드롭. 단일진실원=ratings(순위백분위·star_eligible·세그). 부작용⑨각도(28R verified-only 전파)는 ratings/v_model_ratings/LIMITS 전경로 무결 확인.

## [의심사이클 30→보완] 1건 — RESOLVED (색상변형 capacity NULL 불일치)
1. RESOLVED 같은텐트 색상변형 capacity 결측불일치: id611스텔라릿지2해외구매·id96 A형5.5m블랙·id743폼므·id152맥스터V1카키가 형제는 capacity보유인데 NULL→canonical 2행분리+verified누락. → fill_variant_capacity 상설화: brand+canonical에 비-NULL capacity 정확히1종이면 NULL형제에 전파(2종+는 사이즈변형 모호로 skip). 4종 채움(611→2,96→5,743→2,152→1), 잔존0, verified+2=2324. 멱등.

## [의심사이클 31] — 새 의심 없음(재수렴 1/2)
10각도 클린: capacity채움4종 형제정합, variant_label 색상만, 날짜정상, 가격신선(2일내), 브랜드독점<40%, 고아metric=packed_volume(의도), percentile양끝2.4%정상, floor_outer전용296종 floor별점0(누수無), source4 정합, 극단값 전부 value_raw일치. 유일후보 버너172kg(id3789)은 이미 rejected격리. 진짜오류0. 재수렴 1/2.

## [의심사이클 32→보완] 1건(구조) — RESOLVED (recompute/promote 순서 멱등버그)
1. RESOLVED 단일 run_all 비멱등: 28R서 recompute에 verified필터 넣었는데 recompute(validate내)가 promote_all보다 먼저 실행돼, 이번 run서 새승격된 제품(30R capacity채운 96/152 등)이 recompute시점엔 pending→별점누락, 다음run에야 받음=stale. 에이전트가 멱등테스트(run재실행시 ratings 4941→4947 변동)로 적발. → run_all에 promote_all 직후 P.recompute_ratings 재호출 추가(pipeline import). 검증: run1=run2=4947, 별점전체삭제후 1회run으로 4947 완전복원=단일패스 멱등. verified 2324.

## [의심사이클 33] — 새 의심 없음(재수렴 1/2)
10각도 클린·변경0: 멱등(run2회 4947불변), verified-only일관(v_model_ratings 4589 전부verified), 동점→동stars, source분포(1:4220/3:749/4:70 의도), 가격실재(최고EcoFlow3.98M~최저미니체어6.5k), mAh미백필0(무mAh56종=Wh파워스테이션), 침낭라인역전 AP2외無(크로스라인은 소재차genuine), R값↔두께 소재의존정상, 아이스박스밀도 하드/소프트구조차, 웨건/화로대/테이블 타입혼재genuine. 재수렴 1/2.

## [의심사이클 34→보완] 1건(중대) — RESOLVED (별점 모집단 canonical dedup)
1. RESOLVED 순위백분위 모집단이 product단위(변형중복 포함): 8R v_model_ratings는 표시행만 dedup했으나, 9R서 별점을 순위백분위로 바꾸며 percentile이 N의존→색상/구매처 변형 158개가 분모 부풀려 별점값 자체 왜곡(스텔라릿지2 저장4.0 vs canonical4.5, 60세그·455별점 0.5★ 이동). → recompute_ratings 모집단을 (brand,canonical,capacity) 1표로 dedup후 순위백분위 산출, 대표별점을 전 변형에 전파. 스텔라릿지2 4.0→4.5, 같은모델 변형 동일별점, 평균★3.006, 멱등(4941). 변형중복 분모팽창 근절.

## [의심사이클 35→보완] 1건 — RESOLVED (canonical 대표값 편향)
1. RESOLVED 34R canonical dedup이 변형간 genuine 값차(리빙쉘 water 1800/3000, 반타프·레이체어·M400)서 임의 MIN(id) 변형값을 전체전파→타변형 오별점(531/562 3000mm가 1800mm로 과소). → dedup키에 값 포함((brand,canonical,round(v))): 값같은 색상변형만 합치고 값다른 변형은 각자 독립 모집단entry로 제값채점. 리빙쉘 1800변형★2.0/3000변형★3.5, 스텔라릿지2(동일값)는 ★4.5 유지. 멱등4941·평균3.007.

## [의심사이클 36→보완] 1건 — RESOLVED (모델뷰 값split 미반영)
1. RESOLVED v_model_ratings GROUP BY가 stars 미포함→35R 값split(canonical 2별점) 4건에서 MIN(id) 1행만 남기고 타값그룹 누락(리빙쉘 3000mm변형 3.5가 뷰선 2.0). → GROUP BY에 r.stars,r.percentile 추가. 4건(M400/반타프/레이체어/리빙쉘) 전부 모델뷰 2행으로 ratings와 정합. 멱등4941. 34→35→36 canonical모집단 체인 종결.

## [의심사이클 37→보완] 1건(경미) — RESOLVED (canonical 공백변형 split)
1. RESOLVED 내부공백차로 같은제품 2모델 분리: 카즈미 큐브 '아이스 쿨러'vs'아이스쿨러' 13L(동일스펙·동일별점)이 canonical 분리→모델뷰 중복. → normalize_db에 공백변형 통일패스: (brand+공백제거canonical+capacity) 같으면 최빈표기로 통일. 과병합위험0(딱 2건만 병합:큐브·네이처코펠). 큐브13L 1canonical·모델뷰1행, 잔존0. 별점영향0(표시중복만). verified2324·ratings4941.

## [의심사이클 38] — 새 의심 없음 (DB↔사이트 export 정합 검증)
1단계 완료선언 후 재개. 2단계 site/data/*.json 추가분 포함 10각도 클린: 모델수 16/16=canonical dedup일치, value/stars/badge 6모델 대조일치, verified누출0, 가격 국내우선 일치, footprint 외형배지+stars null 정확, 데이터부족셀↔결측 동치, manifest 등급/충전율 LIMITS일치, 슬러그16개, 별점공식 half-even일치. DB잔여 극단값=genuine(펜타20kg·에코플로우50kg·렉타76.7㎡). export 무손실 확인. 클린 1회.

## [의심사이클 39→보완] 1건 — RESOLVED (모델불명 폴백 노출)
1. RESOLVED 카테고리단어#pcode 폴백 모델명 3건 verified·사이트노출: id1669 노르디스크 '쿨러'→'쿨러#19228169', id2867 쟈칼 '블랙 타프'→'타프#11329539', id4473 코스모스 '아이스박스 블랙'→'아이스박스#10249332'. 모델명이 카테고리단어뿐=모델 식별불가인데 verified로 site/data/cooler·tarp.json에 무의미한 '쿨러#19228169' 노출. 사용자 '모델불명은 리스트서 빼야' 원칙 위반. → promote_all에 가드 추가: canonical_model NOT LIKE ('%#'||danawa_pcode) (폴백은 정확히 #pcode로 끝남, 몽벨 '#0'류는 pcode≠0이라 안걸림). 3건 pending강등·별점제거·JSON노출0, 몽벨11건 유지, verified 2321. 사이트가 모델명을 사용자에게 노출시켜서 드러난 결함(38R까지 DB만 봐선 안보임). durable.

## [의심사이클 40→보완] 2건 — RESOLVED (사용자노출: stutter + 황당가격)
1. RESOLVED 모델명 중복단어: id4151/4152 '콤피 자충매트 자충매트 싱글'(canonicalize 인접중복 dedup 없음). → canonicalize에 인접 동일토큰 제거 추가. canonical '콤피 자충매트 싱글', mat.json stutter 0. (더블 변형 2111은 원래 정상)
2. RESOLVED 황당가격: 카즈미 '미니 릴렉스 체어' 1,661,670원(형제 7종 4~7만원, 27배). 단일관측이라 canonical그룹 이상치필터(≥3) 통과. → flag_price_outliers에 브랜드+카테고리 '고립봉우리' 패스: 브랜드-카테고리 중앙값15배+&50만원+ AND 카테고리 내 다른제품이 그값 절반이상 없을때 격리. 4266 격리→pending. ★오격리방지 핵심: Morui MC600/200(667k 파워스테이션)은 EcoFlow 등 수백만원 존재=정상티어라 미격리 검증. 멱등. verified 2320.

## [의심사이클 41→보완] 1건 — RESOLVED (브랜드-모델 중복 노출)
1. RESOLVED model_name이 브랜드명으로 시작→사이트 brand셀+model셀 브랜드 2번노출: 콜맨 '콜맨 투어링 돔…'(id870), ODC '마크1 R'(189), 모비가든 '알루미늄 폴딩테이블'(4920). → normalize_db에 브랜드접두 제거패스: canonical이 brand명+공백으로 시작하면 제거(남는모델≥2자). canonical '투어링 돔 ST…' 등, 잔존0, 사이트 중복해소. 변형그룹은 brand_id 포함이라 영향없음. verified 2320.

## [의심사이클 42] — 새 의심 없음 (표시품질 전수 소진, 재수렴 1/2)
표시품질 10영역+DB정합 전수: 모델문자열 정규식(깨짐/노이즈/괄호/대괄호/제어문자 0, 몽벨#1·범위~는 정상), 길이분포(최장48자 정상풀네임/최단2자 실모델명), 숫자끝(충전량/인용수/연식 정상), variants≥5(3건 정상색상), price<100(0), badge×stars 매트릭스 완전정합(데이터부족724·외형기준244·참고무별점15 전부 기지), manifest count합=2161 일치, brand명 129개 정상. 신규0. 재수렴 1/2.

## [의심사이클 43→보완] 1건(구조) — RESOLVED (백필 무한증식 비멱등)
1. RESOLVED 백필↔격리 상호작용 무한증식: backfill_capacity_l/mah 가드가 NOT EXISTS(valid=1)만 체크→conflict격리가 값을 valid=0으로 만들면 매 run 재삽입. id2607 capacity_l 85L 34행·id5935 capacity_mah 1000mAh 29행 누적, dqflags도 동반증식. 사용자노출(별점/verified/가격/JSON)은 멱등이라 42R까지 미발견, 내부테이블 단조증가만. → ①백필 가드 'valid무관 어떤행이든 있으면 skip' ②capacity_mah 하한 1000→2000(HARD_RANGES일치) ③stale 63행 청소. run_all 3회 spec10600·dqflags5106·ratings4932·verified2320 완전불변=전테이블 멱등. 재수렴 0/2.

## [의심사이클 44] — 새 의심 없음 (멱등 끝까지 검증, 재수렴 1/2)
멱등5각도+잔여정합5각도 클린: product+metric중복(floor 4건은 danawa valid0+source4 valid1=정상), dqflags중복0, 빈ratings→1회run 완전복원, 순서멱등(promote→recompute), valid0/star_eligible0 유령별점0, 가격valid멱등6018, canonical5774불변, brand충돌분리, 극단값 genuine. 9핑거프린트 3회불변. 재수렴 1/2.

## [의심사이클 45] — 새 의심 없음 ★2회 연속 클린 = 수렴 확정★
최심층 10각도 클린: 실사용top3(니모호넷935g·펜타11500kcal 실제정답상위), 39지표라벨 정확, direction46건 소비자관점정확, 인원세그 상대평가정상, 유명브랜드전원(힐레63·헬리녹스62·MSR25·노르디11·니모72·빅아그네스5), 분해능(★2종 cat4cap8 1건=실측클러스터), 가성비역설0, 텐트3종 지표통일, source4 74건 출처명기 완전추적, manifest↔JSON 무결. 유일후보 floor 이중행은 기지(source1 valid0+source4 valid1). 
→ ★44R+45R 2회 연속 클린: DB+사이트+멱등 3축 수렴 확정.

## [의심사이클 46→보완] 외부 지상검증 — 1수정 + 한계외부확정
방법: WebSearch로 제조사 공식스펙 vs 우리 다나와값 대조(내부감사 불가 각도). 8모델/6카테고리.
- RESOLVED 예티 로디24 capacity_l 24L→22.7L(24 US쿼트×0.9464). fix_quart_capacity 상설화(명시쿼트&미변환만, 멱등). 명시NNQT 쿨러는 이미 변환됨(과교정0).
- 문서화(값수정불가): 백패킹텐트 weight_min=패킹중량 기준 외부확정(NEMO호넷948min/1.14packed·MSR1.07/1.23). 149/150 일관packed라 비교공정, LIMITS.md 외부검증주석 추가. floor footprint도 외부확인=기지 외형배지.
- 외부일치확인(수렴): 매트R값·의자내하중·파워뱅크출력mAh·버너화력·침낭ISO Limit 제조사공식 정확일치. >15% 순수 다나와오류 없음.
→ 외부 지상검증이 내부수렴(45R) 독립확인. 정직배지의 외부증거. verified2320 멱등.

## [의심사이클 47→보완] 외부검증 확대 — 2건 처리
방법: WebSearch 제조사대조 확대(46R 미점검 8카테고리). 10모델.
1. RESOLVED 헬리녹스 V-Tarp 4.0 무게 10.8kg=다나와오류(공식 assembled13.1/packed14.0, 18~23%차, 타프라 packed한계 미적용). 참값기준불명→격리(conflict 지속). verified 2320→2319.
2. RESOLVED(사용자결정) 침낭 내한온도=ISO 하한(limit) 기준(comfort 아님). 몽벨#1 우리-10=공식limit, comfort-3. 311/319 다나와 전량limit 일관. comfort 미공개=회수불가. → 사용자 'limit 정직표기' 선택: 라벨 '내한온도(ISO하한)'(validate 멱등 relabel), LIMITS 명시, 값유지. 사이트전파 확인.
   ※사용자 과거 'comfort기준' 요구와 현실(limit) 간극 — 외부검증으로만 드러남.
표본일치(수렴): 테이블(헬리녹스1.42kg)·웨건(콜맨11kg)·랜턴(골제로150lm/170h)·코트(콜맨)·매트(S2S 100mm) 제조사 정확일치. 멱등 verified2319.

## [의심사이클 48→보완] 2건 — RESOLVED (신규 프론트엔드 코드 결함)
1. RESOLVED 홈검색 q 대문자 미필터: renderCategory가 STATE.q=params.get('q')를 소문자화 안 함→필터는 toLowerCase().includes(q)라 대문자 모델(search.json 2160중 972=45% 대문자포함:MSR·BE400·허바허바LT1) 클릭시 빈결과. → STATE.q=(q||'').toLowerCase(), 검색창표시는 원본 rawQ. 검증: ?q=MSR→11개 표시(전0).
2. RESOLVED 빈결과 colspan=9 과대(실제 4~7열): colspan=STATE.cols.length로 수정.
※방금 추가한 UX코드(필터·검색·g→kg)를 적대감사→실제 버그 1건. g→kg경계·필터AND·정렬null·search정합·네비404·DB↔JSON재대조는 전부 클린. 신규코드도 즉시 감사로 검증.

## [의심사이클 49→보완] 3건 — RESOLVED (프론트엔드 심층)
1. RESOLVED 정렬키 불일치(중요): cellVal이 스펙컬럼을 stars로 정렬→표시는 값(g/kg)인데 정렬은 별점이라 무게 들쭉날쭉(★5에 812~2200g 혼재), 사용자 무게순 오인. → cellVal이 s.value 반환, defaultAsc(방향인지: lower_better=오름차순 '가벼운것먼저'). 검증: 최소무게 클릭→812→999g 단조오름차순, 헤더 sorted표시. footer에 '컬럼클릭=값정렬(좋은것먼저)' 명시.
2. RESOLVED 모바일 반응형 부재: @media 0개, catnav top:59px 하드코딩→모바일 헤더 flex-wrap 2줄시 겹침. → @media(640/420px): .sub숨김·sticky해제(header/catnav/th static)·grid 2→1열·패딩축소. 검증 390px: 겹침0(headerBottom67=catnavTop67).
3. RESOLVED XSS 잠복: export·렌더 escape 부재, DB에 '&' 모델 잠복(현재 rejected). → app.js esc() 추가, brand/model/검색결과/검색어 전부 esc 적용. 방어선 확보.
※기각: fmtVal정수.00없음(단항+), 천단위구분 가독성(버그아님), DB극단값 genuine, 필터AND·리셋 정상.

## [의심사이클 50→보완] 1건 — RESOLVED (49R 값정렬의 null 부작용)
1. RESOLVED null 정렬위치: 49R 값정렬 도입시 va=null?-Infinity라 asc에서 데이터부족 맨위로. lower_better 기본정렬(asc)인 랜턴은 무게 56%(31행) null이 1위부터 깔림, cooler 20행·wagon 3행. → 비교함수에서 null 분리처리(va==null→1, vb==null→-1) 정렬방향무관 항상 맨아래. 검증: 랜턴 asc 상위 100~119g·desc 상위 1.13kg, 양방향 데이터부족 하위31행. 
※부작용: 49R(별점→값정렬)의 엣지케이스를 50R이 잡음(floor진자·canonical모집단과 동일 패턴). 그외 49R수정 부작용(화살표·esc·g/kg·모바일·3중필터)·DB잔여·멱등 전부 수렴.

## [의심사이클 55] — 새 의심 없음(데이터 수렴) + 잠복 파서 하드닝(A1)
데이터: A1 packed_volume·신규 콤마(lumens/power/water)·A2 폴오분류·fill/comfort 전수 → 저장값 전부 정상, 새 데이터오류 0(수렴). packed 저장값(엘릭서2 11576)은 모델숫자누출 이전 클린계산이라 정확.
선제 하드닝(회귀방지): packed_volume_cm3 콤마제거+주석[...]제거(모델숫자'2'누출차단), parse_lumens 콤마제거. 검증: lumens '20,000'→20000, packed '51x17[…(MSR Elixir 2)]'→11576. self-test통과·저장값불변·멱등. REMAINING-WORK A1 closed.
※A2 폴오분류는 오류아님 확인(타프'스킨/메인폴세트'=완제변형, floor 폴길이누출 無, 수납파생 floor 83건중 81 기격리).

## [의심사이클 61→보완] 1건 — RESOLVED (의자 멀티팩 이중등록)
의자 21종 '체어 2개'(멀티팩)가 verified: 가격=2팩가·스펙=단품 → 단품과 이중등록+2배가격 오인. → run_all에 의자/테이블 멀티팩(N개/N팩, '세트N종'·N구/룸/인 제외) rejected 처리 상설화. 코펠 '디투어 세트3종5개'=제품자체라 유지. 의자 멀티팩 verified 0, 멱등.

## [의심사이클 62] 필터 사용성 관점 전환 — 보완 완료
서브(적대적 UX): 데이터 있는데 필터UI 없어 못쓰는 갭 8개(범위컷·2차지표·품질·가성비·멀티브랜드·브랜드가로지르기·활성칩·URL) 우선순위순.
메인 보완(상위 구현): ①가격+전스펙 범위입력(min~max) ②전 ★지표 범위필터 ③품질토글(데이터부족 제외=정렬기준 결측 숨김) ④가성비순 정렬(별점/가격만원) ⑤브랜드 멀티선택+전체드롭다운 ⑦활성필터칩(개별✕)+전체해제 + 정렬셀렉트(전지표/가성비/가격). 검증: 백패킹 2인·1.5kg↓·30만원↓ 135→6개 정확, 가성비top=최저가고별점, 품질토글 135→126. app.js·category.html·style.css.
잔여(중/하): 브랜드 카테고리 가로지르기 뷰, 필터상태 URL직렬화, 모바일 필터바 접기.

## [의심사이클 63] 데이터부족 정직성 감사 (신규 차원) — 회수 4건 + 정직성 교정
사용자 지적(BE400 충전량 구글에 400g인데 데이터부족) → '데이터부족 정직성' 감시 차원 추가.
서브(웹확인): 데이터부족의 정직성이 지표마다 갈림 — 랜턴무게(~70%회수)·코펠용량(~60%)=거짓한계多, 침낭충전량=웹은회수/모델명숫자는함정(1800g=총무게·SP=온도등급), 매트R값·버너화력·파워뱅크mAh=정직한 구조적미공개. mAh는 LFP가 Wh표기라 지표 부적합 경고.
메인 회수(crosssource source4 확정+출처): BE400 충전량400g·NU25 무게45g·알파2.2 용량2.7L·잭커리 278400mAh. NU25 45g가 weight하한100g에 격리→CAT_HARD 랜턴 weight(10~5000) 추가. BE400 사이트 '데이터부족'→'400g 확정'.
LIMITS 정직성 교정: 랜턴무게·코펠용량·침낭충전량을 '회수불가'→'미수집(회수가능·진행중)'으로 분리. 구조적미공개(R값·화력·mAh)와 구분.

## [의심사이클 64] 데이터부족 회수 — 코펠 16건 + 랜턴 무게 정직성
서브(웹확인): 랜턴무게 11개中 1회수(나머지=무명 공구브랜드 진짜한계, 63R가설 이DB엔 부분적), 코펠용량 44개中 16회수(Keith·S2S·Soto·스노우피크·Stanley·KZM·Uniflame 프리미엄=거짓한계, 코베아/캠핑문 보급형=진짜한계).
메인: crosssource 17건 적재. 결과 코펠용량 30→56%, 랜턴무게 44→82%.
★보너스 발견: 랜턴 +38%p는 63R 무게하한(100→10g) 수정이 격리됐던 진짜 경량무게(헤드램프 40~90g) ~20개를 되살린 것 = '데이터부족'이 아니라 과격한 검증으로 멀쩡한 데이터를 버린 것이었음.

## [의심사이클 67-68] 프리미엄 잔여 회수 + 회수광맥 고갈 확인
67R: 프리미엄 집중 6건(SOTO ST-350 2200kcal, MSR 포켓로켓2 2016kcal, S2S 스파크프로/알파인 충전량 4건). 몽벨 22개=다운량 미공표(프리미엄 예외) 진짜한계 확인.
68R: 회수 0건. 매트 R값 후보=코베아(R-5는 마케팅라벨, ASTM 아님→배제). 침낭 잔여 후보 없음.
결론: 6라운드(63~68R)로 거짓한계 회수 완료. 잔여 데이터부족은 전부 '구조적 미공개'(국내 보급형·무명·몽벨이 스펙 미표기)로 확정. LIMITS.md 라벨 '진행중'→'회수완료, 잔여 구조적'으로 정직 교정.
최종 충전율: 코펠용량 30→56%, 랜턴무게 44→82%, 침낭충전량 45→48%, 버너화력 44→46%. source4 확정값 109건.

## [의심사이클 69] 필터 사용성 — URL 상태영속 + 토글 정직성 + 모바일
서브(사용성 공격): 필터연산은 견고, 약점은 '찾은 결과를 붙잡기'. [상]URL상태부재(공유·뒤로가기·새로고침 시 필터 증발), [상]브랜드 가로지르기 부재, [중]데이터부족토글 라벨불일치(정렬컬럼만 필터), [중]모바일 필터바가 첫화면 독점.
메인 수정: (1)serializeState/restoreState — 필터(인원·브랜드·범위·정렬·품질)를 URL에 직렬화, 진입시 복원+syncFilterUI. 브라우저검증: cap/brands/sort/qx 왕복 복원 확인. (2)토글 라벨 '데이터부족 제외'→'정렬지표 데이터부족 행 숨김'(동작과 일치, 정직). (3)모바일(≤640px) 필터바 기본접기+토글버튼. (4)app.js?v=69 캐시버스트. (5)정렬셀렉트 복원동기화.
잔여(다음): 브랜드 전용페이지(brand.html) — 헬리녹스 전 카테고리 보기.

## [의심사이클 70] 브랜드 가로지르기 — brand.html 신설
69R [상]2 갭(헬리녹스 전 카테고리 보기 불가) 해결.
메인: (1)export_site search_index에 price_min('p') 추가. (2)brand.html + renderBrand(): search.json으로 한 브랜드를 전 카테고리 그룹핑(제품수순), 각 카테고리 표(모델·인원·가격), 브랜드전환 칩40개+검색. (3)카테고리 헤더 링크=category.html?cat=X&brands=브랜드 → 69R URL복원과 연결되어 필터된 비교표로 직행. (4)홈검색에 '브랜드 전체 N개 모아보기' 상단링크. (5)app.js?v=70.
브라우저 검증: 헬리녹스 39개/6카테고리 표시→의자 클릭→cat=chair&brands=헬리녹스 21/166 전부 헬리녹스 필터 확인. 전 경로 통합 작동.

## [의심사이클 71] 신기능 재공격 — 회귀 1 + 결함 4 수정
서브(재공격): [회귀]캐시무효화 실패(?v=70 재사용→재방문자 구버전JS, 신기능 전체 무로드), [상]모바일토글 라벨/상태 역전(resize시), [중]잘못된 URL파라미터(price__max=abc→NaN, sort=가짜) STATE오염, [중]0건 원인안내 부재, [하]가성비 의미모호·0브랜드 lead모순.
메인 수정: (1)stamp_version.py 신설 — app.js md5해시를 HTML ?v=에 자동스탬프, run_all에 통합(수동버전 깜빡 방지). (2)모바일토글 라벨을 collapsed상태서 동기화+matchMedia리스너로 폭전환 대응. (3)restoreState에 NaN차단+sort화이트리스트 검증. (4)diagnoseEmpty() — 0건시 필터 하나씩 빼며 '인원 99인 빼면 232개' 식 원인진단. (5)가성비 라벨 주력지표명 표기, 0브랜드 lead 분기.
브라우저 검증: price__max=abc·sort=가짜 거부(range:{}, sortKey기본), 0건진단 '인원99인 빼면232개', 홈검색 헬리녹스→브랜드링크 정상. 콘텐츠해시 v=b262bd20.

## [의심사이클 72] 71R 회귀검증(4/4통과) + style.css 캐시버스팅 + 모바일 식별컬럼
서브: 71R 수정 전부 작동확인. 새결함 [상]style.css 캐시버스팅 누락(app.js만 적용→JS새/CSS헌 깨짐), [중]모바일 와이드테이블 식별컬럼 미고정(가로스크롤시 행식별 불가), [하]무게단위함정·th키보드a11y·별점색의존(전부 완화책 존재).
메인: (1)stamp_version.py를 style.css까지 확장(둘다 콘텐츠해시). (2)모바일 첫두컬럼(브랜드 left:0·모델 left:62px) 가로 sticky→스펙 스크롤시 행식별. (3)th에 tabindex/role/aria-sort + Enter/Space 정렬(키보드 a11y).
브라우저 390px 검증: 필터접힘+라벨일치, brand/model sticky left 0/62px, aria-sort=ascending, style.css?v=ab312bf4. 전부 통과.

## [의심사이클 73] 거의 수렴 — 8각도中 7깨끗, 실결함 1건
서브: 실데이터엣지·정렬안정성·브랜드명정규화·범위경계·검색교집합·성능·brand정렬 모두 수렴(결함0). 유일 실결함 [중] 브랜드→제품 점프 q교차오염(brand.html서 '렉타 타프' 클릭→동명 타브랜드 43행 섞임).
메인: 점프링크에 brands=브랜드 추가(category가 brands URL파라미터 지원). 검증: 제드코리아 렉타타프 클릭→43행→1행(제드코리아만). 강점확인: URL상태견고·브랜드명단일정규형·정렬결정적.

## [의심사이클 74] 수렴 확정 ★
서브: 5개 미탐색 각도(brand칩cap·홈범례·카테고리일관성·구매여정종결·회귀) 전부 정상. 회귀검증 6/6 통과(캐시버전·URL검증·브랜드점프·0건진단·모바일sticky·콘솔에러0). 마이너 1건: brand 검색 0건시 안내없음.
메인: 그 한 줄 수정(일관성). **필터 사용성 차원 수렴 확정** — 69~74R 누적개선 회귀없이 안정화. 남은 건 3단계 수익화뿐.
