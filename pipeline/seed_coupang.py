#!/usr/bin/env python3
"""쿠팡 수동 링크 SSOT — coupang_links.csv 가 단일 진실원천.

수동 입력 데이터(쿠팡 단축링크)는 바이너리 DB가 아니라 사람이 읽는 CSV에 둔다.
  --build : 인기 모델 시드 CSV 생성(coupang_url 칸은 비워둠 → 사람이 채움)
  --load  : CSV → DB products.coupang_url 적용(멱등, DB 재생성돼도 재적용 가능)

인기도 프록시 = variant_count(등록 상품 수). 카테고리당 상한으로 다양성 확보.
"""
import argparse
import csv
import os
import sqlite3
from urllib.parse import quote_plus

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "camping_tents500.db")
CSV_PATH = os.path.join(ROOT, "coupang_links.csv")
FIELDS = ["rep_product_id", "brand", "model", "category", "capacity",
          "variants", "min_price", "coupang_search_url", "coupang_url"]


def search_url(brand, model):
    q = model if model.lower().startswith(brand.lower()) else f"{brand} {model}"
    return f"https://www.coupang.com/np/search?q={quote_plus(' '.join(q.split()))}"


def build(db_path, csv_path, n, per_cat):
    con = sqlite3.connect(db_path)
    # 카테고리당 variant 상위 per_cat개 → 전체에서 variants 내림차순 n개.
    # rep 상품에 로컬이미지 있는 깔끔한 모델만(모델명 30자 이하).
    rows = con.execute("""
        WITH ranked AS (
            SELECT cm.rep_product_id, cm.brand, cm.canonical_model AS model,
                   c.name_ko AS category, cm.capacity, cm.variant_count AS variants,
                   cm.min_price,
                   ROW_NUMBER() OVER (PARTITION BY cm.category_id
                                      ORDER BY cm.variant_count DESC, cm.min_price DESC) AS rk
            FROM canonical_models cm
            JOIN categories c ON c.id=cm.category_id
            JOIN products p ON p.id=cm.rep_product_id
            WHERE p.curation_status='verified' AND p.image_local IS NOT NULL
              AND length(cm.canonical_model) <= 30
        )
        SELECT rep_product_id, brand, model, category, capacity, variants, min_price
        FROM ranked WHERE rk <= ?
        ORDER BY variants DESC, min_price DESC
        LIMIT ?""", (per_cat, n)).fetchall()
    con.close()

    # 기존 CSV에 채워둔 coupang_url 보존(머지)
    existing = {}
    if os.path.exists(csv_path):
        with open(csv_path, newline="", encoding="utf-8") as f:   # L-193: 한글 깨짐(cp949) 방지
            for r in csv.DictReader(f):
                if r.get("coupang_url"):
                    # L-215/L-239: 수동편집 공백 제거 + str 키로 정규화(아래 str(rid)와 정합 — miss 방지).
                    existing[r["rep_product_id"].strip()] = r["coupang_url"]

    with open(csv_path, "w", newline="", encoding="utf-8") as f:   # L-193
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for rid, brand, model, cat, cap, var, price in rows:
            w.writerow({
                "rep_product_id": rid, "brand": brand, "model": model,
                "category": cat, "capacity": cap or "", "variants": var,
                "min_price": price or "",
                "coupang_search_url": search_url(brand, model),
                "coupang_url": existing.get(str(rid), ""),
            })
    print(f"시드 생성: {csv_path} ({len(rows)}개, 카테고리당 최대 {per_cat})")
    print(f"이미 채워진 링크 보존: {len(existing)}개")


def load(db_path, csv_path):
    if not os.path.exists(csv_path):
        print(f"CSV 없음: {csv_path} — 먼저 --build"); return
    con = sqlite3.connect(db_path)
    cols = [r[1] for r in con.execute("PRAGMA table_info(products)")]
    if "coupang_url" not in cols:
        con.execute("ALTER TABLE products ADD COLUMN coupang_url TEXT"); con.commit()
    applied = 0
    with open(csv_path, newline="", encoding="utf-8") as f:   # L-193: load도 UTF-8 명시
        for r in csv.DictReader(f):
            url = (r.get("coupang_url") or "").strip()
            if url:
                con.execute("UPDATE products SET coupang_url=? WHERE id=?",
                            (url, int(r["rep_product_id"])))
                applied += 1
    con.commit()
    total = con.execute("SELECT COUNT(*) FROM products WHERE coupang_url IS NOT NULL").fetchone()[0]
    con.close()
    print(f"적용: CSV {applied}건 → DB coupang_url 총 {total}건")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DB_PATH)
    ap.add_argument("--csv", default=CSV_PATH)
    ap.add_argument("--build", action="store_true")
    ap.add_argument("--load", action="store_true")
    ap.add_argument("--n", type=int, default=30)
    ap.add_argument("--per-cat", type=int, default=3)
    args = ap.parse_args()
    if args.build:
        build(args.db, args.csv, args.n, args.per_cat)
    elif args.load:
        load(args.db, args.csv)
    else:
        ap.error("--build 또는 --load 필요")


if __name__ == "__main__":
    main()
