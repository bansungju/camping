#!/usr/bin/env python3
"""다나와 미등재 유명 모델 수동 큐레이션 적재.

SSOT = manual_models.json (버전관리). 다나와 의존 없이 신규 product를 DB에 upsert.
가격은 정식 판매처 복수 교차, 스펙은 source_id=4(외부 크로스소스). 멱등(재실행 안전).

사용: python3 pipeline/add_manual_models.py --db camping_tents500.db [--json manual_models.json]
"""
import argparse
import json
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import pipeline as P

CAT_ID = {
    "백패킹텐트": 3, "오토캠핑텐트": 4, "기타텐트": 7, "쉘터": 19,
    "침낭": 5, "매트": 6, "의자": 8, "랜턴": 9, "아이스박스": 10, "버너": 11,
    "타프": 12, "테이블": 13, "야전침대": 14, "코펠": 15, "웨건": 16,
    "화로대": 17, "파워뱅크": 18,
}

TENT_CIDS = {3, 4, 7, 19}


def slugify(s):
    return re.sub(r"[^0-9A-Za-z가-힣]+", "-", s).strip("-")


def upsert_model(con, m):
    cur = con.cursor()
    brand, cat = m["brand"], m["category"]
    cid = CAT_ID[cat]
    model = m["model"]
    cap = m.get("capacity")

    # 브랜드
    cur.execute("INSERT OR IGNORE INTO brands(name_ko) VALUES(?)", (brand,))
    bid = cur.execute("SELECT id FROM brands WHERE name_ko=?", (brand,)).fetchone()[0]

    # 수동 모델 식별용 가짜 pcode (promote_all의 canonical NOT LIKE '%#'||pcode 조건 통과 + 재크롤 비충돌)
    pcode = "M-" + slugify(f"{brand}-{model}")

    # product upsert (canonical_model + capacity 기준)
    row = cur.execute("""SELECT id FROM products WHERE brand_id=? AND category_id=?
        AND canonical_model=? AND IFNULL(capacity,-1)=IFNULL(?,-1)""",
        (bid, cid, model, cap)).fetchone()
    if row:
        pid = row[0]
    else:
        cur.execute("""INSERT INTO products
            (brand_id,category_id,model_name,capacity,curation_status,sale_status,danawa_pcode,canonical_model,image_url)
            VALUES(?,?,?,?,'pending','on_sale',?,?,?)""",
            (bid, cid, model, cap, pcode, model, m.get("image_url")))
        pid = cur.lastrowid

    # 가격 — 기존 수동 관측 정리 후 재적재(멱등)
    cur.execute("DELETE FROM price_observations WHERE product_id=? AND channel='수동'", (pid,))
    prices = []
    for pr in m["prices"]:
        cur.execute("""INSERT INTO price_observations(product_id,price_krw,seller,channel,url,in_stock,observed_at,valid)
            VALUES(?,?,?,'수동',?,1,datetime('now'),1)""",
            (pid, pr["price"], pr.get("seller"), pr.get("url")))
        prices.append(pr["price"])
    pmin, pmax = min(prices), max(prices)

    # canonical_models upsert
    cur.execute("""DELETE FROM canonical_models WHERE brand_id=? AND canonical_model=? AND IFNULL(capacity,-1)=IFNULL(?,-1)""",
        (bid, model, cap))
    cur.execute("""INSERT INTO canonical_models
        (rep_product_id,brand_id,category_id,brand,canonical_model,capacity,variant_count,variants,pcodes,min_price,max_price)
        VALUES(?,?,?,?,?,?,1,NULL,?,?,?)""",
        (pid, bid, cid, brand, model, cap, pcode, pmin, pmax))

    # 스펙 (source_id=4) — 멱등: 같은 metric 있으면 갱신
    filled = 0
    for key, (val, raw) in m["specs"].items():
        mid = P.metric_id(con, cid, key)
        if mid is None:
            continue
        ex = cur.execute("""SELECT id FROM product_spec_values WHERE product_id=? AND metric_id=?""",
                         (pid, mid)).fetchone()
        if ex:
            cur.execute("""UPDATE product_spec_values SET value_normalized=?,value_raw=?,source_id=4,valid=1,star_eligible=1
                WHERE id=?""", (val, raw, ex[0]))
        else:
            cur.execute("""INSERT INTO product_spec_values
                (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,collected_at,valid,star_eligible)
                VALUES(?,?,?,?,'manual',4,'medium',1,datetime('now'),1,1)""", (pid, mid, val, raw))
        filled += 1
    return pid, filled, pmin, pmax


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--json", default=os.path.join(ROOT, "manual_models.json"))
    args = ap.parse_args()

    models = json.load(open(args.json, encoding="utf-8"))
    con = sqlite3.connect(args.db)
    for m in models:
        pid, filled, pmin, pmax = upsert_model(con, m)
        con.commit()
        print(f"  [{m['brand']} {m['model']}] pid={pid} 스펙{filled}개 가격 {pmin:,}~{pmax:,}원")
    con.close()
    print(f"\n{len(models)}개 수동 모델 적재 완료.")
    print("다음: promote_all → recompute_ratings → export_site → check_export")


if __name__ == "__main__":
    main()
