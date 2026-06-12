#!/usr/bin/env python3
"""가성비 별점 코어 엔진.

VALUE-METRIC-DESIGN.md (커밋 79a342d5e) 기반.
공식: 순위기반 정규화 qi [0~1] → Q=mean(qi) → V=Q/price → 별점(순위 환산, 0.5 단위).
단일지표 카테고리(firepit): V = price / weight_min (원/g, 낮을수록 좋음) → 별점.
"""
import argparse, os, sqlite3
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 제공 10개 카테고리 (backpacking-bag은 별도 파이프라인 유지)
CATEGORY_CONFIG = {
    "firepit": {
        "metrics": ["weight_min"],
        "value_key": "value_per_g",
        "label": "가성비",
        "unit": "원/g",
        "single": True,  # 단일지표: price/weight_min
    },
    "chair": {
        "metrics": ["weight_min", "max_load"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "table": {
        "metrics": ["weight_min", "max_load"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "cot": {
        "metrics": ["weight_min", "max_load"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "wagon": {
        "metrics": ["weight_min", "max_load"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "backpacking-tent": {
        "metrics": ["weight_min", "water_head", "floor_area"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "auto-tent": {
        "metrics": ["weight_min", "water_head", "floor_area"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "tarp": {
        "metrics": ["weight_min", "water_head", "floor_area"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "lantern": {
        "metrics": ["weight_min", "brightness", "runtime"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
    "cooler": {
        "metrics": ["capacity_l", "weight_min"],
        "value_key": "value_score",
        "label": "가성비",
        "unit": "",
    },
}

# 제외 5개 (한계지표 결측 多 → 가성비 호도): mat, powerbank, sleeping-bag, burner, cookware
EXCLUDED = {"mat", "powerbank", "sleeping-bag", "burner", "cookware"}


def rank_normalize(values: list, direction: str) -> list:
    """순위 기반 연속 정규화 → qi [0~1].

    best(가장 좋은 값)=1.0, worst=0.0. 동점=average rank.
    lower_better: 낮은 값이 best.
    higher_better: 높은 값이 best.
    None은 None 반환.
    """
    n = len(values)
    indexed = [(v, i) for i, v in enumerate(values) if v is not None]
    if not indexed:
        return [None] * n

    reverse = (direction == "higher_better")
    indexed.sort(key=lambda x: x[0], reverse=reverse)

    # 동점 처리: average rank (0-based)
    rank = [0.0] * n
    i = 0
    while i < len(indexed):
        j = i
        while j < len(indexed) - 1 and indexed[j][0] == indexed[j + 1][0]:
            j += 1
        avg_rank = (i + j) / 2.0
        for k in range(i, j + 1):
            rank[indexed[k][1]] = avg_rank
        i = j + 1

    total = len(indexed) - 1
    result = [None] * n
    for v, orig_idx in indexed:
        r = rank[orig_idx]
        result[orig_idx] = 1.0 - (r / total) if total > 0 else 1.0
    return result


def to_stars(rank_0to1: float) -> float:
    """순위 [0~1] → 별점 5.0~1.0, 0.5 단위. best=5.0."""
    raw = 1.0 + 4.0 * rank_0to1
    return round(raw * 2) / 2


def compute_value_score(models: list, config: dict, metrics_meta: dict) -> list:
    """가성비 계산.

    models: [{"id":..., "price_min":..., "specs":{key:{"value":float|None}}}]
    config: CATEGORY_CONFIG[slug]
    metrics_meta: {key: {"direction": str}}
    반환: [{"id":..., "value_display":float|None, "stars":float|None}]
    정직성: 모든 지표 + price_min 보유 모델만 계산.
    """
    metric_keys = config["metrics"]
    is_single = config.get("single", False)

    # 정직성: 전 지표 + price_min 있는 모델만
    eligible = []
    for m in models:
        if not m.get("price_min"):
            continue
        specs = m.get("specs", {})
        if all(specs.get(k, {}).get("value") is not None for k in metric_keys):
            eligible.append(m)

    if not eligible:
        return [{"id": m["id"], "value_display": None, "stars": None} for m in models]

    if is_single:
        # 단일지표: value_display = price_min / weight_min (원/g)
        raw_vals = [m["price_min"] / m["specs"][metric_keys[0]]["value"] for m in eligible]
        # 낮을수록 좋음 → rank_normalize lower_better
        qi_list = rank_normalize(raw_vals, "lower_better")
        stars_list = [to_stars(q) for q in qi_list]
        display_list = [round(v, 1) for v in raw_vals]
    else:
        # 다지표: qi per metric → Q=mean → V=Q/price → 순위 환산
        qi_per_metric = {}
        for key in metric_keys:
            vals = [m["specs"][key]["value"] for m in eligible]
            direction = metrics_meta.get(key, {}).get("direction", "higher_better")
            qi_per_metric[key] = rank_normalize(vals, direction)

        # Q = mean(qi) per model
        Q_list = []
        for i in range(len(eligible)):
            qs = [qi_per_metric[k][i] for k in metric_keys]
            Q_list.append(sum(qs) / len(qs))

        # V = Q / price (클수록 좋음)
        V_list = [Q / m["price_min"] for Q, m in zip(Q_list, eligible)]

        # V 순위 환산 → 별점 (higher V = better)
        v_qi = rank_normalize(V_list, "higher_better")
        stars_list = [to_stars(q) for q in v_qi]
        # value_display: 지수 0~100
        display_list = [round(q * 100) for q in v_qi]

    eligible_ids = {m["id"] for m in eligible}
    id_to_result = {}
    for i, m in enumerate(eligible):
        id_to_result[m["id"]] = {
            "id": m["id"],
            "value_display": display_list[i],
            "stars": stars_list[i],
        }

    return [
        id_to_result.get(m["id"], {"id": m["id"], "value_display": None, "stars": None})
        for m in models
    ]


SLUG_MAP = {
    "백패킹텐트": "backpacking-tent", "오토캠핑텐트": "auto-tent",
    "타프": "tarp", "침낭": "sleeping-bag", "매트": "mat", "의자": "chair",
    "테이블": "table", "아이스박스": "cooler", "버너": "burner", "코펠": "cookware",
    "랜턴": "lantern", "야전침대": "cot", "웨건": "wagon", "화로대": "firepit",
    "파워뱅크": "powerbank", "백패킹가방": "backpacking-bag", "쉘터": "shelter",
}


def dry_run(db_path: str):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    for cid, cat_ko in cur.execute("SELECT id, name_ko FROM categories ORDER BY id").fetchall():
        slug = SLUG_MAP.get(cat_ko, cat_ko)
        if slug not in CATEGORY_CONFIG:
            if slug in EXCLUDED:
                print(f"[SKIP] {slug} ({cat_ko}) — 제외 카테고리")
            continue

        config = CATEGORY_CONFIG[slug]
        metric_keys = config["metrics"]

        # metrics_meta
        metrics_meta = {}
        for key, direction in cur.execute(
                "SELECT key, direction FROM metrics WHERE category_id=?", (cid,)).fetchall():
            metrics_meta[key] = {"direction": direction}

        # canonical models
        reps = cur.execute("""
            SELECT MIN(p.id) rep, b.name_ko brand, p.canonical_model, p.capacity,
                   cm.min_price
            FROM products p
            JOIN brands b ON b.id=p.brand_id
            LEFT JOIN canonical_models cm ON cm.brand_id=p.brand_id
                AND cm.canonical_model=p.canonical_model
                AND IFNULL(cm.capacity,-1)=IFNULL(p.capacity,-1)
            WHERE p.category_id=? AND p.curation_status='verified'
            GROUP BY p.brand_id, p.canonical_model, IFNULL(p.capacity,-1)
        """, (cid,)).fetchall()

        if not reps:
            print(f"[SKIP] {slug} — verified 모델 없음")
            continue

        models = []
        for rep, brand, cm, cap, price_min in reps:
            specs = {}
            for key in metric_keys:
                row = cur.execute("""
                    SELECT v.value_normalized FROM product_spec_values v
                    JOIN metrics m ON m.id=v.metric_id
                    WHERE v.product_id=? AND m.key=? AND v.valid=1 LIMIT 1
                """, (rep, key)).fetchone()
                specs[key] = {"value": row[0] if row else None}
            models.append({"id": rep, "brand": brand, "model": cm,
                           "price_min": price_min, "specs": specs})

        results = compute_value_score(models, config, metrics_meta)

        # 커버리지
        total = len(models)
        covered = sum(1 for r in results if r["stars"] is not None)
        pct = covered / total * 100 if total else 0

        # 별점 분포
        from collections import Counter
        dist = Counter(r["stars"] for r in results if r["stars"] is not None)

        print(f"\n[{slug}] 전체={total} 커버리지={covered}({pct:.0f}%)")
        print(f"  별점분포: {dict(sorted(dist.items(), reverse=True))}")

        # top3
        id_map = {r["id"]: r for r in results}
        top3 = sorted(
            [(m, id_map[m["id"]]) for m in models if id_map[m["id"]]["stars"] is not None],
            key=lambda x: x[1]["stars"], reverse=True
        )[:3]
        for m, r in top3:
            print(f"  ★{r['stars']} {m['brand']} {m['model'][:30]} "
                  f"display={r['value_display']} price={m['price_min']}")

    con.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--dry-run", action="store_true", default=True)
    args = ap.parse_args()
    dry_run(args.db)


if __name__ == "__main__":
    main()
