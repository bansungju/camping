#!/usr/bin/env python3
"""마스터 오케스트레이터 — 전 카테고리 파이프라인을 한 명령으로.

핵심: 카테고리마다 비교축이 달라서, '카테고리 레지스트리(CATEGORIES)' 설정 위에서 돈다.
새 카테고리 추가 = CATEGORIES에 블록 하나 + reference.sql에 메트릭 추가. 그게 전부.

전체 흐름 (각 단계는 카테고리 무관/또는 config 기반):
  [수확] 카테고리별 검색쿼리로 후보 수집(--harvest)
  [정규화] 색상/옵션 변형 통합 (전역)
  [검증]  타당범위/이상치 격리 (전역; 텐트 floor는 capacity별)
  [컬럼교정] 가격 channel분리·무게/내수압 기준의심 플래그 (전역)
  [채우기] 부족 스펙 상세보강(LangGraph) — 카테고리별 spec_map
  [승격]  카테고리별 '핵심지표 완비' → verified
  [별점]  세그먼트별 별점 + 스타일 종합점수 (전역)

사용:
  python3 pipeline/run_all.py                      # 기존 DB 전체 새로고침(정규화~별점)
  python3 pipeline/run_all.py --harvest            # 카테고리별 신규 수확까지
  python3 pipeline/run_all.py --only 침낭          # 특정 카테고리만 수확
"""
import argparse
import os
import sqlite3
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import normalize_models as NM
import validate_ranges as VR
import pipeline as P

# ── 카테고리 레지스트리 = "전 카테고리 자동화"의 핵심 ──────────────────────
# 각 블록: 수확 검색어 / 완비 핵심지표(core) / 인원 필요여부
CATEGORIES = {
    "텐트": {
        "subcats": ["백패킹텐트", "오토캠핑텐트", "기타텐트"],
        "queries": ["백패킹텐트", "텐트", "초경량텐트", "돔텐트"],
        "harvester": "harvest_tents.py",          # 텐트 전용(하위분류 자동)
        "core": ["weight_min", "floor_area"],     # 내수압=일부 브랜드 미공개(힐레베르그/콜맨)→선택, 별점엔 반영
        "need_capacity": True,
    },
    "침낭": {
        "subcats": ["침낭"],
        "queries": ["침낭", "머미 침낭", "구스다운 침낭", "코튼 침낭"],
        "harvester": "generic",                    # 단일 카테고리 일반 수확(향후)
        "core": ["weight_min", "comfort_temp"],
        "need_capacity": False,
    },
    "매트": {
        "subcats": ["매트"],
        "queries": ["자충매트", "에어매트", "캠핑매트", "경량 매트"],
        "harvester": "generic",
        "core": ["weight_min", "thickness"],
        "need_capacity": False,
    },
    # 신규 (multicat.py 가 수확) — core는 multicat.CONFIG와 일치
    "의자":     {"subcats": ["의자"],     "core": ["weight_min", "max_load"],         "need_capacity": False},
    "랜턴":     {"subcats": ["랜턴"],     "core": ["brightness", "runtime"],          "need_capacity": False},
    "아이스박스": {"subcats": ["아이스박스"], "core": ["capacity_l"],                     "need_capacity": False},
    "버너":     {"subcats": ["버너"],     "core": ["weight_min"],                     "need_capacity": False},  # 화력=희소→선택(별점엔 반영)
    "타프":     {"subcats": ["타프"],     "core": ["weight_min", "floor_area"],       "need_capacity": False},  # 면적 필수=폴/팩/패치 자동탈락
    "테이블":   {"subcats": ["테이블"],   "core": ["weight_min", "max_load"],         "need_capacity": False},
    "야전침대": {"subcats": ["야전침대"], "core": ["weight_min", "max_load"],         "need_capacity": False},
    "코펠":     {"subcats": ["코펠"],     "core": ["weight_min"],                     "need_capacity": False},
    "웨건":     {"subcats": ["웨건"],     "core": ["max_load"],                       "need_capacity": False},
    "화로대":   {"subcats": ["화로대"],   "core": ["weight_min"],                     "need_capacity": False},
    "파워뱅크": {"subcats": ["파워뱅크"], "core": ["weight_min", "power_output"],      "need_capacity": False},
}


def sh(script, *args):
    subprocess.run([sys.executable, os.path.join(HERE, script), "--db", DB, *args], check=True)


def promote_all(con):
    """카테고리별 core 지표 완비 → verified. (텐트는 인원도 요구)"""
    con.execute("UPDATE products SET curation_status='pending' WHERE curation_status='verified'")  # rejected 보존
    total = 0
    for cfg in CATEGORIES.values():
        for sub in cfg["subcats"]:
            core = cfg["core"]
            capclause = "AND p.capacity IS NOT NULL" if cfg["need_capacity"] else ""
            placeholders = ",".join("?" * len(core))
            con.execute(f"""
                UPDATE products SET curation_status='verified'
                WHERE curation_status='pending'   -- rejected(노네임)는 절대 승격 안 함
                  AND category_id=(SELECT id FROM categories WHERE name_ko=?) {capclause.replace('p.','')}
                  -- 모델 불명(카테고리단어#pcode 폴백) 제외: 모델 식별 불가 → 카탈로그 부적격
                  AND canonical_model NOT LIKE ('%#' || danawa_pcode)
                  AND EXISTS(SELECT 1 FROM price_observations po WHERE po.product_id=products.id AND po.valid=1)  -- 유효가격 필수(이상치 격리분 제외)
                  AND id IN (
                    SELECT p.id FROM products p
                    JOIN product_spec_values v ON v.product_id=p.id AND v.valid=1
                    JOIN metrics m ON m.id=v.metric_id AND m.key IN ({placeholders})
                    GROUP BY p.id HAVING COUNT(DISTINCT m.key)={len(core)})""",
                [sub] + core)
    total = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified'").fetchone()[0]
    # 비교풀 분모 정합: 색상/옵션 변형이 ratings에 각각 들어가 풀크기를 부풀림(별점값은 불변).
    #   canonical 단위로 1대표만 남긴 뷰 → 사이트의 "N개 중 X위" 카운트는 이걸 써야 정확.
    # 검증 카탈로그 뷰 재생성 — 가격은 valid=1만(이상치 격리분이 노출되지 않게)
    con.execute("DROP VIEW IF EXISTS v_verified_catalog")
    con.execute("""CREATE VIEW v_verified_catalog AS
        SELECT p.id, b.name_ko AS brand, p.model_name, c.name_ko AS category, p.capacity,
          MAX(CASE WHEN m.key='weight_min' THEN v.value_normalized END) AS weight_g,
          MAX(CASE WHEN m.key='water_head' THEN v.value_normalized END) AS water_mm,
          -- floor_m2 = 이너 바닥(별점대상)만. 외형footprint는 별도 컬럼+배지로 분리 노출.
          MAX(CASE WHEN m.key='floor_area' AND IFNULL(v.star_eligible,1)=1
                   THEN v.value_normalized END) AS floor_m2,
          MAX(CASE WHEN m.key='floor_area' AND IFNULL(v.star_eligible,1)=0
                   THEN v.value_normalized END) AS floor_outer_m2,
          MAX(CASE WHEN m.key='floor_area' AND IFNULL(v.star_eligible,1)=0
                   THEN '외형기준·이너미상' END) AS floor_basis_note,
          (SELECT MIN(price_krw) FROM price_observations po
             WHERE po.product_id=p.id AND po.valid=1) AS price_krw
        FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        LEFT JOIN product_spec_values v ON v.product_id=p.id AND v.valid=1
        LEFT JOIN metrics m ON m.id=v.metric_id
        WHERE p.curation_status='verified'
        GROUP BY p.id""")
    con.execute("DROP VIEW IF EXISTS v_model_ratings")
    con.execute("""CREATE VIEW v_model_ratings AS
        SELECT MIN(r.product_id) AS rep_product_id, p.brand_id, p.canonical_model,
               p.category_id, IFNULL(p.capacity,-1) AS cap, r.metric_id,
               r.comparison_scope, r.stars, r.percentile
        FROM ratings r JOIN products p ON p.id=r.product_id
        GROUP BY p.brand_id, p.canonical_model, IFNULL(p.capacity,-1),
                 r.metric_id, r.comparison_scope, r.stars, r.percentile""")
    con.commit()
    return total


def main():
    global DB
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_all.db"))
    ap.add_argument("--harvest", action="store_true", help="카테고리별 신규 수확 포함")
    ap.add_argument("--only", help="특정 카테고리만(수확 대상)")
    args = ap.parse_args()
    DB = args.db
    if not os.path.exists(DB):
        print(f"DB 없음: {DB} (먼저 harvest 또는 기존 DB 지정)"); return

    print(f"■ 마스터 파이프라인 시작 — {DB}\n")

    # 1) 수확 (옵션)
    if args.harvest:
        for name, cfg in CATEGORIES.items():
            if args.only and name != args.only:
                continue
            q = ",".join(cfg["queries"])
            if cfg["harvester"] == "harvest_tents.py":
                print(f"[수확] {name} (텐트 전용)")
                sh("harvest_tents.py", "--append", "--maxpages", "3", "--queries", q)
            else:
                print(f"[수확] {name} — generic 수확기 미구현(향후): 쿼리={q}")
        print()

    con = sqlite3.connect(DB)
    print("[정규화] 변형 통합")
    raw, uniq, _ = NM.normalize_db(con)
    print(f"   {raw} → 고유 {uniq}")
    print("[검증] 타당범위/이상치")
    hard, soft = VR.validate_db(con)
    print(f"   격리 {len(hard)} / 재분류 {len(soft)}")
    con.close()

    print("[컬럼교정] 가격channel·무게/내수압 기준의심")
    sh("column_fixes.py")

    con = sqlite3.connect(DB)
    # 의자/테이블 멀티팩(N개/N팩=동일품 묶음) 제외: 가격이 N배라 단품과 비교 시 오인 + 이중등록.
    #   ('세트 N종'·N구·N룸·N인은 스펙/제품이라 제외 안 함) 멱등.
    import re as _re
    for pid, mn in con.execute("""SELECT p.id, p.model_name FROM products p JOIN categories c ON c.id=p.category_id
            WHERE c.name_ko IN ('의자','테이블') AND p.curation_status<>'rejected'""").fetchall():
        if _re.search(r"(?<!\d)[2-9]\s*개(?!월| ?세트)", mn or "") or _re.search(r"(?<!\d)[2-9]\s*팩", mn or ""):
            con.execute("UPDATE products SET curation_status='rejected' WHERE id=?", (pid,))
    con.commit()
    print("[승격] 카테고리별 완비 → verified")
    v = promote_all(con)
    print(f"   verified {v}종")
    # 별점 재산정 — 반드시 promote 후. (별점=verified-only 모집단이므로, 이번 run서
    #   새로 승격된 제품도 같은 run 안에서 별점을 받게 함 = 단일 run_all 멱등 보장)
    #   별점은 recompute_ratings(순위백분위·star_eligible·세그)가 단일 진실원.
    P.recompute_ratings(con)
    con.execute("DROP TABLE IF EXISTS catalog_scores")  # 구 평행엔진 잔재 제거
    con.execute("DROP VIEW IF EXISTS v_verified_specs")  # 구 스키마(model_year/confidence) stale 뷰 제거
    con.execute("DROP VIEW IF EXISTS v_value_badge")     # 코드 미사용 orphan 뷰(옛 source라벨) 제거
    # sources 라벨을 실제 source_id 사용과 일치(옛 시드 교정): src3=다나와상세파생, src4=외부크로스소스
    con.execute("UPDATE sources SET name='다나와상세(파생)' WHERE id=3 AND name<>'다나와상세(파생)'")
    con.execute("UPDATE sources SET name='외부 크로스소스(REI/제조사)' WHERE id=4 AND name<>'외부 크로스소스(REI/제조사)'")
    con.commit()
    con.close()

    print("[한계지도] 카테고리·지표 신뢰등급 → LIMITS.md")
    sh("limits_map.py")

    print("[사이트] verified 모델 → site/data/*.json")
    sh("export_site.py")

    print("\n■ 완료. (채우기=graph_full.py / 크로스소스=crosssource.py 는 별도 단계)")


if __name__ == "__main__":
    main()
