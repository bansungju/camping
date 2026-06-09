-- 레퍼런스(참조) 데이터: 제품과 무관한 뼈대. 파이프라인이 매 실행 시 주입.
INSERT INTO categories (id,parent_id,name_ko,name_en) VALUES
 (1,NULL,'캠핑용품','gear'),
 (2,1,'텐트','tent'),
 (3,2,'백패킹텐트','backpacking_tent'),
 (4,2,'오토캠핑텐트','car_camping_tent'),
 (5,1,'침낭','sleeping_bag'),
 (6,1,'매트','sleeping_pad'),
 (7,2,'기타텐트','other_tent');

INSERT INTO metrics (id,category_id,key,label_ko,unit,direction,normalize_rule) VALUES
 -- 텐트
 (1,3,'weight_min','최소무게','g','lower_better','kg/lb/oz→g, 최소무게 기준'),
 (2,3,'packed_volume','패킹부피','cm3','lower_better','원통=πr²h, 박스=가로×세로×높이'),
 (3,3,'water_head','내수압','mm','higher_better','플라이 기준'),
 (4,3,'floor_area','바닥면적','m2','higher_better','이너 가로×세로 우선'),
 -- 침낭 (내한온도는 낮을수록 따뜻=좋음 → lower_better)
 (7,5,'weight_min','최소무게','g','lower_better','kg/g→g'),
 (8,5,'packed_volume','패킹부피','cm3','lower_better','수납크기 기준'),
 (9,5,'comfort_temp','내한온도','C','lower_better','낮을수록 따뜻. 음수 보존'),
 (10,5,'fill_weight','충전량','g','higher_better','충전재 무게(보온 프록시)'),
 -- 매트
 (11,6,'weight_min','최소무게','g','lower_better','g 기준'),
 (12,6,'packed_volume','패킹부피','cm3','lower_better','수납크기 기준'),
 (13,6,'thickness','두께','mm','higher_better','크기 3번째 치수 cm→mm'),
 (14,6,'r_value','R값','R','higher_better','보온지수(다나와 미표기 잦음)'),
 -- 오토캠핑텐트(cat4)
 (15,4,'weight_min','최소무게','g','lower_better','kg/g→g'),
 (16,4,'water_head','내수압','mm','higher_better','플라이 기준'),
 (17,4,'floor_area','바닥면적','m2','higher_better','본체 가로×세로'),
 (18,4,'packed_volume','패킹부피','cm3','lower_better','수납크기'),
 -- 기타텐트(cat7: 그늘막/팝업 등)
 (19,7,'weight_min','최소무게','g','lower_better','kg/g→g'),
 (20,7,'water_head','내수압','mm','higher_better','플라이 기준'),
 (21,7,'floor_area','바닥면적','m2','higher_better','가로×세로'),
 (22,7,'packed_volume','패킹부피','cm3','lower_better','수납크기');

INSERT INTO sources (id,name,type,base_url,trust_rank) VALUES
 (1,'다나와','aggregator','https://danawa.com',1),
 (2,'무신사','retailer','https://musinsa.com',2),
 (3,'제조사공식','official',NULL,3),
 (4,'리뷰/웹검색','review',NULL,4);

INSERT INTO style_profiles (id,name,description) VALUES
 (1,'백패킹','무게·부피 최우선'),
 (2,'오토캠핑','거주성·편의 우선'),
 (3,'미니멀','초경량 극단'),
 (4,'가성비','가격 대비 성능');

INSERT INTO style_metric_weights (profile_id,metric_id,weight) VALUES
 (1,1,3.0),(1,2,2.0),(1,3,1.5),(1,4,1.0),
 (2,1,0.5),(2,2,0.5),(2,3,2.0),(2,4,3.0),
 (3,1,3.0),(3,2,3.0),(3,3,1.0),(3,4,0.5),
 (4,1,1.5),(4,2,1.0),(4,3,1.5),(4,4,1.5);
