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
    "쉘터": {"floor_area": 2, "water_head": 1.5, "weight_min": 0.5, "price": 1.5},
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
    # M-260: valid=1만 집계(flag_price_outliers 격리분 제외). M-169: MIN이 NULL이거나 0/음수면
    #   아래 min-max 루프에서 None과 비교해 TypeError → 양수 가격만 채택.
    # H-131: MIN()에 price_krw=0이 섞이면 그 상품 MIN=0 → 아래 `pr>0` 가드로 드롭돼 가격 누락된다.
    #   WHERE에서 0/음수를 먼저 제외해 0 관측치가 있어도 실제 양수 최소가가 채택되게 한다.
    for pid, pr in con.execute("SELECT product_id, MIN(price_krw) FROM price_observations WHERE valid=1 AND price_krw > 0 GROUP BY product_id"):
        if pid in prods and pr is not None and pr > 0:
            prods[pid]["v"]["price"] = pr

    # 세그먼트별 min-max
    mm = defaultdict(lambda: defaultdict(lambda: [1e18, -1e18]))
    for p in prods.values():
        for k, val in p["v"].items():
            d = mm[p["seg"]][k]
            d[0] = min(d[0], val); d[1] = max(d[1], val)

    # M-478: DROP+CREATE는 commit 실패(디스크 풀 등) 시 catalog_scores가 빈 상태로 소실돼 복구 불가.
    #        CREATE IF NOT EXISTS로 테이블은 항상 보존하고, 기존 행은 DELETE로 비운다(아래 INSERT·
    #        commit과 한 트랜잭션 → 실패 시 롤백으로 이전 데이터 유지).
    con.execute("CREATE TABLE IF NOT EXISTS catalog_scores (product_id INT, profile TEXT, score REAL, PRIMARY KEY(product_id,profile))")
    con.execute("DELETE FROM catalog_scores")
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
              (SELECT MIN(price_krw) FROM price_observations po WHERE po.product_id=pr.id AND po.valid=1)  -- M-411: 격리(valid=0) 제외
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
