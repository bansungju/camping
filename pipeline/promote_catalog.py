#!/usr/bin/env python3
"""길 A: 완비 제품을 '검증 카탈로그'로 한정.

핵심지표 = {가격, 무게, 내수압, 바닥면적, 인원}. 패킹부피 = 보조축(세상에 데이터 희소).
무게·내수압·바닥이 모두 있는(valid) 제품 → curation_status='verified' 승격.
나머지 → 'pending'(후보) 유지. verified 안에서 핵심지표 ~99% 성립.

사용: python3 pipeline/promote_catalog.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
P_ROOT = os.path.dirname(HERE)

CORE = ["weight_min", "water_head", "floor_area"]   # 완비 판정 기준(가격·인원은 별도 집계)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P_ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)

    # 1) 패킹부피 → 보조축 강등 (별점/완비 기준서 제외)
    con.execute("UPDATE metrics SET is_star_metric=0 WHERE key='packed_volume'")

    # 2) 완비 제품 판정 → verified, 나머지 pending
    con.execute("UPDATE products SET curation_status='pending'")
    if not CORE:
        con.commit(); return
    con.execute(f"""
        UPDATE products SET curation_status='verified'
        WHERE capacity IS NOT NULL          -- 인원도 핵심지표 → 완비 기준 포함
          AND EXISTS(SELECT 1 FROM price_observations po WHERE po.product_id=products.id)  -- 가격 필수
          AND id IN (
            SELECT p.id FROM products p
            JOIN product_spec_values v ON v.product_id=p.id AND v.valid=1
            JOIN metrics m ON m.id=v.metric_id AND m.key IN ({','.join('?'*len(CORE))})
            GROUP BY p.id HAVING COUNT(DISTINCT m.key)={len(CORE)})""", CORE)
    con.commit()

    # 3) 검증 카탈로그 뷰
    con.execute("DROP VIEW IF EXISTS v_verified_catalog")
    con.execute("""CREATE VIEW v_verified_catalog AS
        SELECT p.id, b.name_ko AS brand, p.model_name, c.name_ko AS category, p.capacity,
          MAX(CASE WHEN m.key='weight_min' THEN v.value_normalized END) AS weight_g,
          MAX(CASE WHEN m.key='water_head' THEN v.value_normalized END) AS water_mm,
          MAX(CASE WHEN m.key='floor_area' THEN v.value_normalized END) AS floor_m2,
          (SELECT MIN(price_krw) FROM price_observations po WHERE po.product_id=p.id) AS price_krw
        FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        LEFT JOIN product_spec_values v ON v.product_id=p.id AND v.valid=1
        LEFT JOIN metrics m ON m.id=v.metric_id
        WHERE p.curation_status='verified'
        GROUP BY p.id""")
    con.commit()

    ver = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified'").fetchone()[0]
    pen = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='pending'").fetchone()[0]
    print("=" * 56)
    print(f"검증 카탈로그 승격: verified {ver}종 / pending {pen}종")
    print("=" * 56)

    print("\n[검증 카탈로그 내 핵심지표 보유율]")
    def covpct(expr):
        return con.execute(f"SELECT ROUND(SUM(CASE WHEN {expr} THEN 1 ELSE 0 END)*100.0/COUNT(*),1) FROM v_verified_catalog").fetchone()[0]
    print(f"   가격     : {covpct('price_krw IS NOT NULL')}%")
    print(f"   무게     : {covpct('weight_g IS NOT NULL')}%")
    print(f"   내수압   : {covpct('water_mm IS NOT NULL')}%")
    print(f"   바닥면적 : {covpct('floor_m2 IS NOT NULL')}%")
    print(f"   인원     : {covpct('capacity IS NOT NULL')}%")

    print("\n[검증 카탈로그 예시 — 백패킹 2인, 경량순]")
    for b, mn, w, wh, fa, pr in con.execute("""
        SELECT brand, model_name, weight_g, water_mm, floor_m2, price_krw
        FROM v_verified_catalog WHERE category='백패킹텐트' AND capacity=2
        ORDER BY weight_g LIMIT 8"""):
        ps = f"{pr:,}원" if pr else "-"
        print(f"   {b} {mn[:22]:24} {w:.0f}g | {wh:.0f}mm | {fa}㎡ | {ps}")
    con.close()


if __name__ == "__main__":
    main()
