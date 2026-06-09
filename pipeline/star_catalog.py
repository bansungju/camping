#!/usr/bin/env python3
"""별점 카탈로그 (전 카테고리) — 지표별 ★ + 카테고리별 종합점수.

세그먼트(카테고리×인원) 안에서 min-max로 지표별 1~5★.
카테고리마다 가중치(WEIGHTS)로 가중평균 → '종합' 점수. → catalog_scores 테이블.
보유 지표만으로 가중평균(없는 지표는 가중치서 제외) → 결측에 강건.

사용: python3 pipeline/star_catalog.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3
from collections import defaultdict

# 지표 방향 (전 카테고리)
DIRECTION = {
    "weight_min": "low", "packed_volume": "low", "price": "low", "comfort_temp": "low",
    "water_head": "high", "floor_area": "high", "fill_weight": "high", "thickness": "high",
    "r_value": "high", "max_load": "high", "brightness": "high", "runtime": "high",
    "capacity_l": "high", "power_output": "high",
}
# 카테고리별 종합점수 가중치 (정의지표 강조 + 가격)
WEIGHTS = {
    "백패킹텐트": {"weight_min": 2, "water_head": 1.5, "floor_area": 1.5, "price": 1.5},
    "오토캠핑텐트": {"floor_area": 2, "water_head": 1.5, "weight_min": 0.5, "price": 1.5},
    "기타텐트": {"weight_min": 1.5, "water_head": 1.5, "floor_area": 1.5, "price": 1.5},
    "침낭": {"comfort_temp": 2, "weight_min": 1.5, "fill_weight": 1, "price": 1.5},
    "매트": {"r_value": 2, "thickness": 1, "weight_min": 1.5, "price": 1.5},
    "의자": {"weight_min": 2, "max_load": 1.5, "price": 1.5},
    "랜턴": {"brightness": 2, "runtime": 1.5, "weight_min": 1, "price": 1.5},
    "아이스박스": {"capacity_l": 2, "weight_min": 1, "price": 1.5},
    "버너": {"power_output": 2, "weight_min": 1.5, "price": 1.5},
    "타프": {"floor_area": 2, "water_head": 1.5, "weight_min": 1, "price": 1.5},
}


def stars(val, mn, mx, direction):
    if mx == mn:
        return 5.0
    f = (val - mn) / (mx - mn)
    if direction == "low":
        f = 1 - f
    return round((1 + 4 * f) * 2) / 2.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)

    # verified 제품 + 값 로드
    prods = {}
    for pid, cat, cap in con.execute("""SELECT p.id, c.name_ko, p.capacity
        FROM products p JOIN categories c ON c.id=p.category_id WHERE p.curation_status='verified'"""):
        prods[pid] = {"cat": cat, "seg": (cat, cap), "v": {}}
    for pid, key, val in con.execute("""SELECT psv.product_id, m.key, psv.value_normalized
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id WHERE psv.valid=1"""):
        if pid in prods and key in DIRECTION:
            prods[pid]["v"][key] = val
    for pid, pr in con.execute("SELECT product_id, MIN(price_krw) FROM price_observations GROUP BY product_id"):
        if pid in prods:
            prods[pid]["v"]["price"] = pr

    # 세그먼트별 min-max
    mm = defaultdict(lambda: defaultdict(lambda: [1e18, -1e18]))
    for p in prods.values():
        for k, val in p["v"].items():
            d = mm[p["seg"]][k]
            d[0] = min(d[0], val); d[1] = max(d[1], val)

    con.execute("DROP TABLE IF EXISTS catalog_scores")
    con.execute("CREATE TABLE catalog_scores (product_id INT, profile TEXT, score REAL, PRIMARY KEY(product_id,profile))")
    star_of = {}
    for pid, p in prods.items():
        st = {k: stars(v, mm[p["seg"]][k][0], mm[p["seg"]][k][1], DIRECTION[k]) for k, v in p["v"].items()}
        star_of[pid] = st
        w = WEIGHTS.get(p["cat"], {})
        num = sum(st[k] * w[k] for k in st if k in w)
        den = sum(w[k] for k in st if k in w)
        if den:
            con.execute("INSERT INTO catalog_scores VALUES(?,?,?)", (pid, "종합", round(num / den, 2)))
    con.commit()

    print("=" * 60)
    print("별점 카탈로그 (전 카테고리) — 카테고리별 종합점수 TOP3")
    print("=" * 60)
    for cat in WEIGHTS:
        rows = con.execute("""SELECT b.name_ko||' '||pr.model_name, cs.score,
              (SELECT MIN(price_krw) FROM price_observations po WHERE po.product_id=pr.id)
            FROM catalog_scores cs JOIN products pr ON pr.id=cs.product_id
            JOIN categories c ON c.id=pr.category_id AND c.name_ko=?
            JOIN brands b ON b.id=pr.brand_id
            WHERE cs.profile='종합' ORDER BY cs.score DESC LIMIT 3""", (cat,)).fetchall()
        if not rows:
            continue
        print(f"\n[{cat}]  (가중치: {', '.join(WEIGHTS[cat])})")
        for nm, sc, pr in rows:
            ps = f"{pr:,}원" if pr else "-"
            print(f"   ★{sc:<4} {nm[:34]:36} {ps}")
    tot = con.execute("SELECT COUNT(*) FROM catalog_scores").fetchone()[0]
    con.close()
    print(f"\n→ catalog_scores: {tot}종 종합점수 산출 (전 10개 카테고리)")


if __name__ == "__main__":
    main()
