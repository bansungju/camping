-- 시드 데이터: feasibility 테스트에서 "검증된" 텐트 데이터로 채움
-- 실행: sqlite3 camping.db < schema.sql && sqlite3 camping.db < seed_sample.sql

-- 브랜드 ----------------------------------------------------------------
INSERT INTO brands (id,name_ko,name_en,country,tier) VALUES
 (1,'네이처하이크','Naturehike','중국','budget'),
 (2,'제로그램','Zerogram','대한민국','premium'),
 (3,'헬리녹스','Helinox','대한민국','premium'),
 (4,'니모','Nemo','미국','premium'),
 (5,'엠에스알','MSR','미국','premium'),
 (6,'빅아그네스','Big Agnes','미국','premium'),
 (7,'콜맨','Coleman','미국','budget');

-- 카테고리 (대>소분류) --------------------------------------------------
INSERT INTO categories (id,parent_id,name_ko,name_en) VALUES
 (1,NULL,'캠핑용품','gear'),
 (2,1,'텐트','tent'),
 (3,2,'백패킹텐트','backpacking_tent'),
 (4,2,'오토캠핑텐트','car_camping_tent');

-- 메트릭 (백패킹텐트=cat3) ----------------------------------------------
INSERT INTO metrics (id,category_id,key,label_ko,unit,direction,normalize_rule) VALUES
 (1,3,'weight_min','최소무게','g','lower_better','kg→g, 최소무게(min) 기준 통일'),
 (2,3,'packed_volume','패킹부피','cm3','lower_better','원통=π r²h, 박스=가로×세로×높이'),
 (3,3,'water_head','내수압','mm','higher_better','플라이 기준'),
 (4,3,'floor_area','바닥면적','m2','higher_better','이너 가로×세로');
-- 메트릭 (오토캠핑텐트=cat4) — 카테고리별로 별도 정의
INSERT INTO metrics (id,category_id,key,label_ko,unit,direction,normalize_rule) VALUES
 (5,4,'weight_min','최소무게','g','lower_better','kg→g'),
 (6,4,'floor_area','바닥면적','m2','higher_better','본체 기준');

-- 출처 (신뢰순위) -------------------------------------------------------
INSERT INTO sources (id,name,type,base_url,trust_rank) VALUES
 (1,'다나와','aggregator','https://danawa.com',1),
 (2,'무신사','retailer','https://musinsa.com',2),
 (3,'제조사공식','official',NULL,3),
 (4,'리뷰/웹검색','review',NULL,4);

-- 스타일 프로파일 -------------------------------------------------------
INSERT INTO style_profiles (id,name,description) VALUES
 (1,'백패킹','무게·부피 최우선, 짊어지고 걷는다'),
 (2,'오토캠핑','거주성·편의 우선, 차로 싣는다'),
 (3,'미니멀','초경량 극단, 무게가 전부'),
 (4,'가성비','가격 대비 성능');

-- 스타일별 가중치 (cat3 메트릭) ----------------------------------------
INSERT INTO style_metric_weights (profile_id,metric_id,weight) VALUES
 (1,1,3.0),(1,2,2.0),(1,3,1.5),(1,4,1.0),     -- 백패킹: 무게>부피>내수압>거주성
 (2,1,0.5),(2,2,0.5),(2,3,2.0),(2,4,3.0),     -- 오토캠핑: 거주성>내수압
 (3,1,3.0),(3,2,3.0),(3,3,1.0),(3,4,0.5),     -- 미니멀: 무게·부피 극단
 (4,1,1.5),(4,2,1.0),(4,3,1.5),(4,4,1.5);     -- 가성비 (가격은 price 기반 별도 합산)

-- 제품 (화이트리스트, 전부 검증완료) -----------------------------------
INSERT INTO products (id,brand_id,category_id,model_name,model_year,variant,capacity,curation_status,sale_status) VALUES
 (1,1,3,'클라우드업2 플러스',2023,'20D',2,'verified','on_sale'),
 (2,2,3,'엘찰텐 프로',2022,'2P',2,'verified','on_sale'),
 (3,3,3,'알파인돔',NULL,'2P',2,'verified','on_sale'),
 (4,4,3,'호넷 OSMO',NULL,'2P',2,'verified','on_sale'),
 (5,5,3,'허바허바 LT',NULL,'2',2,'verified','on_sale'),
 (6,6,3,'코퍼스퍼 HV UL',NULL,'2',2,'verified','on_sale'),
 (7,7,4,'선돔',NULL,'2',2,'verified','on_sale');

-- 스펙 값 (정규화 + 원문 + 출처 + 신뢰도) ------------------------------
-- 무게
INSERT INTO product_spec_values (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence) VALUES
 (1,1,1360,'1.36kg','kg',1,'high'),
 (2,1,1860,'1.86kg','kg',1,'high'),
 (3,1,2550,'2.55kg(케이스포함)','kg',3,'high'),
 (4,1,948,'948g(최소)','g',4,'high'),
 (5,1,1304,'2 lbs 14 oz(min trail)','oz',4,'high'),
 (6,1,1360,'3 lb 2 oz(listed)','oz',4,'medium'),
 (7,5,3100,'약 6.8 lb','lb',4,'medium');
-- 내수압
INSERT INTO product_spec_values (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence) VALUES
 (1,3,2000,'2,000mm','mm',1,'high'),
 (3,3,1500,'1,500mm','mm',3,'high'),
 (5,3,1200,'1200mm DuraShield','mm',4,'high');
-- 바닥면적
INSERT INTO product_spec_values (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence) VALUES
 (1,4,2.73,'이너 210×130','cm',1,'medium'),
 (5,4,2.70,'29 sq ft','sqft',4,'medium'),
 (6,4,2.70,'29 sq ft','sqft',4,'medium'),
 (7,6,3.06,'33 sq ft','sqft',4,'medium');

-- 가격 시계열 (실판매가 = 최약 신뢰. approx 표시) -----------------------
INSERT INTO price_observations (product_id,price_krw,seller,channel) VALUES
 (1,150000,'다나와최저가','approx'),
 (2,450000,'공식몰','approx'),
 (3,600000,'공식몰','approx'),
 (4,620000,'직구','approx'),
 (5,600000,'직구','approx'),
 (7,90000,'오픈마켓','approx');

-- 데이터 품질 플래그 (검증에서 드러난 약점 기록) ----------------------
INSERT INTO data_quality_flags (product_id,metric_id,flag_type,note) VALUES
 (2,3,'missing','엘찰텐 프로 2P 내수압 미표기 → 공식 스펙시트 보강 필요'),
 (4,3,'missing','Nemo Hornet OSMO 내수압 미확인'),
 (2,NULL,'category_mismatch','다나와가 "원터치 그늘막"으로 오태깅 → 수동으로 백패킹텐트 분류함'),
 (6,1,'needs_review','무게 listed값(2출처 미교차) → 실측 리뷰로 재확인 권장');

-- 확인 쿼리 예시 ------------------------------------------------------
-- 백패킹텐트 무게순:
--   SELECT brand, model_name, value_normalized AS weight_g
--   FROM v_verified_specs WHERE category='백패킹텐트' AND metric='weight_min'
--   ORDER BY weight_g;
