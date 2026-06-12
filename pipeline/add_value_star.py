#!/usr/bin/env python3
"""백패킹 가방에 '가성비' 별점 메트릭 추가 (재크롤 없이 기존 JSON 패치).

가성비 = 용량대비 가격(원/L), 낮을수록 좋음 → 별점 높음.
분포 꼬리가 커서 min-max 대신 '랭크 기반'(균등 분포)으로 별점 산출.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "site", "data", "backpacking-bag.json")
MANIFEST = os.path.join(ROOT, "site", "data", "manifest.json")


def value_stars(models):
    """원/L 오름차순 랭크 → 별점 5.0(최저원/L)~1.0(최고). 0.5 단위."""
    rated = [(m, m["price_min"] / m["specs"]["capacity_l"]["value"])
             for m in models if m.get("price_min") and m["specs"]["capacity_l"]["value"]]
    rated.sort(key=lambda x: x[1])  # 싼 원/L 먼저 = 가성비 good
    n = len(rated)
    out = {}
    for i, (m, wpl) in enumerate(rated):
        frac = i / (n - 1) if n > 1 else 0
        star = round((5 - 4 * frac) * 2) / 2
        out[id(m)] = (round(wpl), star)
    return out


def main():
    d = json.load(open(PATH))
    models = d["models"]
    stars = value_stars(models)

    for m in models:
        if id(m) in stars:
            wpl, st = stars[id(m)]
            m["specs"]["value_per_l"] = {"value": float(wpl), "stars": st, "badge": "참고"}

    # 메트릭 추가 — 용량 다음(2번째). 용량을 first로 유지해야 '가성비순' 정렬 로직(첫 별점=용량) 보존.
    if not any(mt["key"] == "value_per_l" for mt in d["metrics"]):
        d["metrics"].append({
            "key": "value_per_l", "label": "가성비", "unit": "원/L",
            "direction": "lower_better", "is_star": True, "fill": 100, "limit": False,
        })
    json.dump(d, open(PATH, "w"), ensure_ascii=False, separators=(",", ":"))

    # manifest star_metrics 갱신
    man = json.load(open(MANIFEST))
    for c in man["categories"]:
        if c["slug"] == "backpacking-bag":
            c["star_metrics"] = ["용량", "가성비"]
    json.dump(man, open(MANIFEST, "w"), ensure_ascii=False, indent=2)

    covered = sum(1 for m in models if "value_per_l" in m["specs"])
    print(f"가성비 별점 추가: {covered}/{len(models)}개")
    # 분포 확인
    from collections import Counter
    dist = Counter(m["specs"]["value_per_l"]["stars"] for m in models if "value_per_l" in m["specs"])
    print("별점 분포:", dict(sorted(dist.items(), reverse=True)))
    print("샘플(가성비 best 3):")
    best = sorted([m for m in models if "value_per_l" in m["specs"]],
                  key=lambda m: m["specs"]["value_per_l"]["value"])[:3]
    for m in best:
        s = m["specs"]
        print(f"  {m['brand']} {m['model'][:26]:26} {int(s['capacity_l']['value'])}L {m['price_min']}원 "
              f"= {int(s['value_per_l']['value'])}원/L ★{s['value_per_l']['stars']}")


if __name__ == "__main__":
    main()
