#!/usr/bin/env python3
"""다카테고리 확장 — 범용 수확기 + 카테고리 레지스트리.
새 카테고리(의자·랜턴·아이스박스·버너·타프 등)를 텐트와 같은 방식으로 마스터 DB에 수집.

레지스트리(CONFIG)가 곧 제품: category·metrics·queries·spec_map·core 를 한 곳에.
spec_map은 실제 다나와 키(탐침 확인)만 사용 — 없으면 미보유(날조 안 함).

사용:
  python3 pipeline/multicat.py --db camping_tents500.db                 # 전 신규카테고리 시드
  python3 pipeline/multicat.py --db ... --only 랜턴 --maxpages 3
"""
import argparse
import os
import re
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize as N
import danawa as D
import pipeline as P
import harvest_tents as HT

FN = {"weight": N.parse_weight, "water": N.parse_water_head, "num": N.parse_number,
      "temp": N.parse_temp, "vol": N.packed_volume_cm3, "thickness": N.thickness_mm, "lm": N.parse_lumens, "wsum": N.parse_weight_sum,
      "cap_l": N.parse_capacity_l}

# ── 카테고리 레지스트리 ───────────────────────────────────────────────
# metrics: (id,key,label,unit,direction)  spec:(metric,[다나와키부분],fn|derive)  kw:관련성필터
CONFIG = {
    "침낭": {"cid": 5, "kw": ["침낭"], "seg": "인원",
        "queries": ["침낭", "머미 침낭", "구스다운 침낭", "코튼 침낭"],
        "metrics": [],  # 이미 reference.sql(5,7~10)에 존재
        "spec": [("weight_min", ["무게"], "weight"), ("comfort_temp", ["내한온도", "사용가능온도"], "temp"),
                 ("fill_weight", ["충전량"], "num"), ("packed_volume", ["수납크기"], "vol")],
        "core": ["weight_min", "comfort_temp"]},
    "매트": {"cid": 6, "kw": ["매트"], "seg": "단일",   # R값·두께는 매트크기 무관 → 단일 세그먼트
        "queries": ["자충매트", "에어매트", "캠핑매트", "경량 매트"],
        "metrics": [],
        "spec": [("weight_min", ["무게"], "weight"), ("thickness", ["크기", "사이즈"], "thickness"),
                 ("r_value", ["r값"], "num"), ("packed_volume", ["수납크기"], "vol")],
        "core": ["weight_min", "thickness"]},
    "의자": {"cid": 8, "kw": ["의자", "체어"], "seg": "단일",
        "queries": ["캠핑 의자", "경량 의자", "릴렉스 체어", "백패킹 의자"],
        "metrics": [(23, "weight_min", "최소무게", "g", "lower_better"),
                    (24, "max_load", "내하중", "kg", "higher_better"),
                    (25, "packed_volume", "패킹부피", "cm3", "lower_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("max_load", ["내하중"], "num")],
        "core": ["weight_min", "max_load"]},
    "랜턴": {"cid": 9, "kw": ["랜턴"], "seg": "단일",
        "queries": ["캠핑 랜턴", "LED 랜턴", "충전식 랜턴"],
        "metrics": [(26, "weight_min", "최소무게", "g", "lower_better"),
                    (27, "brightness", "최대밝기", "lm", "higher_better"),
                    (28, "runtime", "최대사용시간", "h", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("brightness", ["최대밝기", "밝기"], "lm"),
                 ("runtime", ["최대사용시간", "사용시간"], "num")],
        "core": ["brightness", "runtime"]},
    "아이스박스": {"cid": 10, "kw": ["아이스박스", "쿨러"], "seg": "단일",
        "queries": ["아이스박스", "쿨러박스", "캠핑 아이스박스"],
        "metrics": [(29, "capacity_l", "용량", "L", "higher_better"),
                    (30, "weight_min", "최소무게", "g", "lower_better")],
        "spec": [("capacity_l", ["용량"], "cap_l"), ("weight_min", ["무게"], "weight")],
        "core": ["capacity_l"]},
    "버너": {"cid": 11, "kw": ["버너", "스토브"], "seg": "단일",
        "queries": ["캠핑 버너", "백패킹 버너", "가스 버너", "이소 버너"],
        "metrics": [(31, "weight_min", "최소무게", "g", "lower_better"),
                    (32, "power_output", "최대화력", "kcal", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("power_output", ["최대 화력", "화력"], "num")],
        "core": ["weight_min"]},  # 화력=다나와 희소→선택(있으면 별점 반영)
    "타프": {"cid": 12, "kw": ["타프"], "seg": "단일",
        "queries": ["타프", "렉타 타프", "헥사 타프", "백패킹 타프"],
        "metrics": [(33, "weight_min", "최소무게", "g", "lower_better"),
                    (34, "water_head", "내수압", "mm", "higher_better"),
                    (35, "floor_area", "면적", "m2", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("water_head", ["내수압"], "water"),
                 ("floor_area", ["크기", "사이즈"], "derive_floor")],
        "core": ["weight_min", "floor_area"]},  # 면적 필수=폴/팩/패치 자동탈락
    "테이블": {"cid": 13, "kw": ["테이블"], "seg": "단일",
        "queries": ["캠핑 테이블", "롤테이블", "경량 테이블"],
        "metrics": [(36, "weight_min", "최소무게", "g", "lower_better"),
                    (37, "max_load", "내하중", "kg", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("max_load", ["내하중"], "num")],
        "core": ["weight_min", "max_load"]},
    "야전침대": {"cid": 14, "kw": ["야전침대", "코트"], "seg": "단일",
        "queries": ["야전침대", "캠핑 코트", "접이식 침대"],
        "metrics": [(38, "weight_min", "최소무게", "g", "lower_better"),
                    (39, "max_load", "내하중", "kg", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("max_load", ["내하중"], "num")],
        "core": ["weight_min", "max_load"]},
    "코펠": {"cid": 15, "kw": ["코펠", "쿡세트", "쿠커", "쿡웨어"], "seg": "단일",
        "queries": ["코펠", "캠핑 코펠", "백패킹 코펠"],
        "metrics": [(40, "weight_min", "최소무게", "g", "lower_better"),
                    (41, "capacity_l", "용량", "L", "higher_better"),
                    (42, "packed_volume", "패킹부피", "cm3", "lower_better")],
        "spec": [("weight_min", ["무게"], "wsum"), ("capacity_l", ["용량"], "cap_l"),
                 ("packed_volume", ["수납크기"], "vol")],
        "core": ["weight_min"]},
    "웨건": {"cid": 16, "kw": ["웨건", "왜건", "카트"], "seg": "단일",
        "queries": ["캠핑 웨건", "캠핑 카트", "폴딩 웨건"],
        "metrics": [(43, "weight_min", "최소무게", "g", "lower_better"),
                    (44, "max_load", "적재하중", "kg", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("max_load", ["적재하중", "내하중"], "num")],
        "core": ["max_load"]},
    "화로대": {"cid": 17, "kw": ["화로대", "화로"], "seg": "단일",
        "queries": ["화로대", "캠핑 화로대", "접이식 화로대"],
        "metrics": [(45, "weight_min", "최소무게", "g", "lower_better")],
        "spec": [("weight_min", ["무게"], "weight")],
        "core": ["weight_min"]},
    "파워뱅크": {"cid": 18, "kw": ["파워뱅크", "보조배터리", "파워스테이션"], "seg": "단일",
        "queries": ["캠핑 파워뱅크", "파워스테이션", "대용량 보조배터리"],
        "metrics": [(46, "weight_min", "최소무게", "g", "lower_better"),
                    (47, "power_output", "정격출력", "W", "higher_better")],
        "spec": [("weight_min", ["무게"], "weight"), ("power_output", ["정격출력", "최대출력"], "num")],
        "core": ["weight_min", "power_output"]},
}
EXCLUDE = ("거치대", "스탠드", "케이스", "수납가방", "받침", "교체", "리필", "전용가방", "폴대", "부속",
           "보수", "패치", "스트링", "심실링", "걸이", "커버", "수선", "모노포드", "교체용",
           # 부속/부품 누수 보완(적대루프 1회차): 웨건 상판·바퀴, 전용 부속 등 본품 아닌 것
           "상판", "바퀴", "전용 그릴", "전용그릴", "전용 메쉬", "전용메쉬")


def bootstrap(con):
    """CONFIG의 카테고리/메트릭을 DB에 보장(INSERT OR IGNORE)."""
    for name, cfg in CONFIG.items():
        con.execute("INSERT OR IGNORE INTO categories(id,parent_id,name_ko) VALUES(?,1,?)", (cfg["cid"], name))
        for mid, key, label, unit, direction in cfg.get("metrics", []):
            con.execute("""INSERT OR IGNORE INTO metrics(id,category_id,key,label_ko,unit,direction)
                VALUES(?,?,?,?,?,?)""", (mid, cfg["cid"], key, label, unit, direction))
    con.commit()


def ingest_one(con, cfg, c, seen_names):
    """단일 후보(c) → DB 적재. 신규 pcode 가정(중복 pcode 게이트는 호출자 책임).
    반환: 'ok' | 'skip_kw' | 'skip_exclude' | 'dup_name'. (refresh 노드도 이걸 재사용)"""
    cid = cfg["cid"]
    specs, tags = D.parse_spec_string(c["spec_text"])
    blob = " ".join(tags) + " " + c["name"]
    if not any(k in blob for k in cfg["kw"]):
        return "skip_kw"
    if any(x in blob for x in EXCLUDE):
        return "skip_exclude"
    toks = c["name"].split()
    brand, model = toks[0], (" ".join(toks[1:]) if len(toks) > 1 else c["name"])
    brand, model = HT.fix_brand(brand, model)
    if model in seen_names:
        return "dup_name"
    seen_names.add(model)
    cap = None
    if cfg["seg"] == "인원":
        m = re.search(r"(\d+)인", blob)
        cap = int(m.group(1)) if m else None
    con.execute("INSERT OR IGNORE INTO brands(name_ko) VALUES(?)", (brand,))
    bid = con.execute("SELECT id FROM brands WHERE name_ko=?", (brand,)).fetchone()[0]
    con.execute("""INSERT OR IGNORE INTO products(brand_id,category_id,model_name,capacity,danawa_pcode,curation_status,sale_status)
        VALUES(?,?,?,?,?, 'pending','on_sale')""", (bid, cid, model, cap, c["pcode"]))
    pid = con.execute("SELECT id FROM products WHERE brand_id=? AND model_name=? AND model_year IS NULL AND variant IS NULL",
                      (bid, model)).fetchone()[0]
    got = set()
    for metric, keys, fn in cfg["spec"]:
        raw = P.find_spec(specs, keys, ["수납"] if metric == "floor_area" else None)
        if not raw:
            continue
        val = P.derive_floor(raw) if fn == "derive_floor" else FN[fn](raw)
        if val is None:
            continue
        con.execute("""INSERT INTO product_spec_values(product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,valid)
            VALUES(?,?,?,?,?,1,'high',1,1)""", (pid, P.metric_id(con, cid, metric), val, raw, "norm"))
        got.add(metric)
    for key in cfg["core"]:
        if key not in got:
            P.flag(con, pid, P.metric_id(con, cid, key), "missing", f"{key} 미표기")
    if c["price"]:
        con.execute("INSERT INTO price_observations(product_id,price_krw,seller,channel) VALUES(?,?,?,?)",
                    (pid, c["price"], "다나와최저가", "danawa_search"))
    else:
        P.flag(con, pid, None, "missing", "가격 없음")
    return "ok"


def harvest(con, name, cfg, maxpages, seen_pcode, seen_names):
    ok = 0
    for q in cfg["queries"]:
        for page in range(1, maxpages + 1):
            try:
                cands = HT.parse_results(HT.fetch_page(q, page))
            except Exception:
                break
            if not cands:
                break
            for c in cands:
                if c["pcode"] in seen_pcode:
                    continue
                seen_pcode.add(c["pcode"])
                if ingest_one(con, cfg, c, seen_names) == "ok":
                    ok += 1
            con.commit()
            time.sleep(0.4)
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    ap.add_argument("--only")
    ap.add_argument("--maxpages", type=int, default=2)
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    bootstrap(con)
    seen_pcode = {r[0] for r in con.execute("SELECT danawa_pcode FROM products WHERE danawa_pcode IS NOT NULL")}
    seen_names = {r[0] for r in con.execute("SELECT model_name FROM products")}
    print("다카테고리 시드 수확")
    for name, cfg in CONFIG.items():
        if args.only and name != args.only:
            continue
        n = harvest(con, name, cfg, args.maxpages, seen_pcode, seen_names)
        print(f"  [{name}] +{n}종")
    con.close()


if __name__ == "__main__":
    main()
