#!/usr/bin/env python3
"""가격 하락·재입고 감지 → send-price-alert 호출 (B-1 가격 알림)

price_observations(가격 시계열)에서 상품별 '직전 관측일 vs 최신 관측일'의
최저가를 비교해 하락/재입고 이벤트를 만든다. 이벤트의 key/url은 사이트 찜과
정확히 맞도록 site/data/<slug>.json(=item-N.html 순서·brand|model|cap)에서 도출한다.

매칭 근거:
  · 찜 key = wishKey(b,m,cap) = 'brand|model|capacity'  (app.js)
  · item-N.html 의 N = data/<slug>.json "models" 배열 인덱스  (build-item-pages.js slugify)
  · DB products.gf_code == data model.gf_code  로 조인

사용:
  python3 pipeline/detect_price_drops.py                # dry-run(기본): 이벤트만 출력, 전송 안 함
  SEND_PRICE_ALERT_URL=... ALERT_SECRET=... \
  python3 pipeline/detect_price_drops.py --send         # 실제 전송
설계: APP-PUSH-PRICE-ALERT-PLAN.md §C
"""
import argparse
import glob
import json
import os
import sqlite3
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DB = os.path.join(ROOT, "camping_tents500.db")
DATA_DIR = os.path.join(ROOT, "site", "data")

DROP_PCT = 0.05        # 5% 이상
DROP_ABS = 1000        # 그리고 1,000원 이상
SKIP = {"manifest.json", "search.json"}


def wish_key(brand, model, cap):
    """app.js wishKey(b,m,cap) = [b, m, cap==null?'':cap].join('|') 와 동일."""
    cap_s = "" if cap is None else str(cap)
    return f"{brand}|{model}|{cap_s}"


def load_catalog():
    """gf_code -> {key, url, name, slug, cat, price_min} (사이트 데이터 기준)."""
    cat = {}
    for path in sorted(glob.glob(os.path.join(DATA_DIR, "*.json"))):
        if os.path.basename(path) in SKIP:
            continue
        # H-66: json.load(open(...))는 핸들을 닫지 않아 카탈로그 JSON이 많으면 macOS 256핸들
        #       한도를 넘겨 OSError(Errno 24)로 크래시. with로 즉시 닫는다.
        with open(path, encoding="utf-8") as fh:
            d = json.load(fh)
        slug = d.get("slug")
        cat_name = d.get("name", slug)
        for idx, m in enumerate(d.get("models", [])):
            gf = m.get("gf_code")
            if not gf:
                continue
            cat[gf] = {
                "key": wish_key(m.get("brand"), m.get("model"), m.get("capacity")),
                "url": f"/item/{slug}/item-{idx}.html",
                "name": f"{m.get('brand')} {m.get('model')}".strip(),
                "category": cat_name,
                "price_min": m.get("price_min"),
            }
    return cat


def price_history(con):
    """product_id -> [(date, min_price, any_stock), ...] (날짜 오름차순)."""
    rows = con.execute(
        """SELECT p.gf_code, substr(po.observed_at,1,10) AS d,
                  MIN(po.price_krw) AS minp, MAX(po.in_stock) AS stock
           FROM price_observations po JOIN products p ON p.id = po.product_id
           WHERE po.valid = 1 AND po.price_krw IS NOT NULL AND p.gf_code IS NOT NULL
           GROUP BY p.gf_code, d
           ORDER BY p.gf_code, d"""
    )
    hist = {}
    for gf, d, minp, stock in rows:
        hist.setdefault(gf, []).append((d, minp, stock))
    return hist


def detect():
    catalog = load_catalog()
    con = sqlite3.connect(DB)
    hist = price_history(con)
    con.close()

    events = []
    for gf, series in hist.items():
        if gf not in catalog or len(series) < 2:
            continue
        (_, prev_min, prev_stock) = series[-2]
        (_, cur_min, cur_stock) = series[-1]
        meta = catalog[gf]

        # 재입고: 직전 품절(stock=0) → 최신 판매중(stock=1)
        if prev_stock == 0 and cur_stock == 1:
            events.append({**_evt(meta, prev_min, cur_min, "restock")})
            continue

        # 하락: 5% 이상 AND 1,000원 이상
        if prev_min and cur_min < prev_min:
            drop = prev_min - cur_min
            if drop >= DROP_ABS and drop >= prev_min * DROP_PCT:
                events.append({**_evt(meta, prev_min, cur_min, "drop")})

    # H-124: 같은 canonical 모델(brand|model|cap=meta["key"])의 색상·옵션 변형은 gf_code가 각각 달라
    #   변형마다 별도 이벤트가 생긴다. 찜은 wish_key 단위라 변형 수만큼 동일 제품 중복 푸시가 된다.
    #   → (key, kind)로 묶어 변형 중 new_price가 가장 낮은(최저가) 1건만 남긴다.
    best = {}
    for e in events:
        k = (e["key"], e["kind"])
        if k not in best or e["new_price"] < best[k]["new_price"]:
            best[k] = e
    return list(best.values())


def _evt(meta, old_price, new_price, kind):
    return {
        "key": meta["key"],
        "name": meta["name"],
        "category": meta["category"],
        "old_price": old_price,
        "new_price": new_price,
        "url": meta["url"],
        "kind": kind,
    }


def send(events):
    url = os.environ.get("SEND_PRICE_ALERT_URL")
    secret = os.environ.get("ALERT_SECRET")
    if not url or not secret:
        sys.exit("✋ --send 에는 SEND_PRICE_ALERT_URL · ALERT_SECRET 환경변수가 필요합니다.")
    body = json.dumps({"events": events}).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={"content-type": "application/json", "x-alert-secret": secret},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"  → 응답 {r.status}: {r.read().decode()[:200]}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--send", action="store_true", help="실제 전송(미지정 시 dry-run)")
    args = ap.parse_args()

    events = detect()
    drops = [e for e in events if e["kind"] == "drop"]
    restocks = [e for e in events if e["kind"] == "restock"]
    print(f"감지: 하락 {len(drops)}건 · 재입고 {len(restocks)}건 (임계 ≥{int(DROP_PCT*100)}% AND ≥{DROP_ABS}원)")
    for e in events[:20]:
        tag = "▼" if e["kind"] == "drop" else "↻"
        print(f"  {tag} {e['name']} [{e['category']}] {e['old_price']}→{e['new_price']}  {e['url']}")
    if len(events) > 20:
        print(f"  … 외 {len(events)-20}건")

    if not events:
        return
    if args.send:
        print("전송 중…")
        send(events)
    else:
        print("(dry-run — 전송하려면 --send + SEND_PRICE_ALERT_URL/ALERT_SECRET)")


if __name__ == "__main__":
    main()
