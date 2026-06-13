#!/usr/bin/env python3
"""2단계 보강 — 검색수확(넓고 얕음)으로 부족한 깊은 스펙을 상품 상세에서 채움.

검색결과 spec_list엔 무게만 있고 내수압/설치크기는 상세페이지(meta Description)에만 있음.
→ 가치 있는 후보(예: 경량 상위)만 골라 상세를 fetch해 내수압/바닥면적/수납크기 보강.
이것이 breadth(수확) → depth(보강) 2단계 파이프라인.

사용: python3 pipeline/enrich_details.py --db camping_tents500.db --limit 25
"""
import argparse
import os
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize as N
import danawa as D
import pipeline as P
from harvest_tents import TENT_MAP


def enrich(con, pid, pcode, cid):
    """상세 fetch → 아직 없는 텐트 메트릭 채우기. 채운 개수 반환."""
    have = {r[0] for r in con.execute("""SELECT mt.key FROM product_spec_values psv
        JOIN metrics mt ON mt.id=psv.metric_id WHERE psv.product_id=?""", (pid,))}
    parsed = D.parse(D.fetch(pcode))
    specs = parsed["specs"]
    filled = 0
    for spec in TENT_MAP:
        if spec["metric"] in have:
            continue
        raw = P.find_spec(specs, spec["keys"], spec.get("exclude"))
        if not raw:
            continue
        val = P.derive_floor(raw) if spec.get("derive") == "floor" else P.FN[spec["fn"]](raw)
        if val is None:
            continue
        conf = spec["conf"]
        if conf == "auto":
            conf = "medium" if "~" in raw else "high"
        mid = P.metric_id(con, cid, spec["metric"])
        con.execute("""INSERT INTO product_spec_values
            (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary)
            VALUES(?,?,?,?,?,3,?,1)""", (pid, mid, val, raw, "norm", conf))  # source 3=제조사공식급(상세)
        con.execute("""UPDATE data_quality_flags SET resolved=1
            WHERE product_id=? AND metric_id=? AND flag_type='missing'""", (pid, mid))
        filled += 1
    return filled


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    ap.add_argument("--limit", type=int, default=25)
    ap.add_argument("--all", action="store_true", help="고유 모델(canonical) 대표 전체 보강")
    args = ap.parse_args()
    con = sqlite3.connect(args.db)

    if args.all:
        # 전체 고유 모델 대표만 보강(색상 변형 중복 fetch 방지)
        targets = con.execute("""
            SELECT cm.rep_product_id, p.danawa_pcode, p.category_id, b.name_ko||' '||p.model_name,
                   (SELECT v.value_normalized FROM product_spec_values v
                      JOIN metrics m ON m.id=v.metric_id AND m.key='weight_min'
                     WHERE v.product_id=cm.rep_product_id)
            FROM canonical_models cm
            JOIN products p ON p.id=cm.rep_product_id JOIN brands b ON b.id=p.brand_id
            WHERE p.danawa_pcode IS NOT NULL""").fetchall()
    else:
        # 백패킹텐트 중 무게 가벼운 순(가치 높은 후보)
        targets = con.execute("""
            SELECT p.id, p.danawa_pcode, p.category_id, b.name_ko||' '||p.model_name, psv.value_normalized
            FROM products p JOIN brands b ON b.id=p.brand_id
            JOIN categories c ON c.id=p.category_id AND c.name_ko='백패킹텐트'
            JOIN product_spec_values psv ON psv.product_id=p.id
            JOIN metrics mt ON mt.id=psv.metric_id AND mt.key='weight_min'
            WHERE p.danawa_pcode IS NOT NULL
            ORDER BY psv.value_normalized LIMIT ?""", (args.limit,)).fetchall()

    before = con.execute("SELECT COUNT(*) FROM product_spec_values").fetchone()[0]
    print(f"2단계 보강: 백패킹텐트 경량 상위 {len(targets)}종 상세조회...")
    total = 0
    for pid, pcode, cid, name, w in targets:
        try:
            f = enrich(con, pid, pcode, cid)
        except Exception as e:
            print(f"  ! {name}: {e}")
            continue
        total += f
        wt = f"{w:.0f}g" if w else "무게?"
        print(f"  +{f}스펙  {name[:36]} ({wt})")
        con.commit()
        D.polite_sleep(0.6, 1.0)   # 지터(고정 간격 = 봇 지문)

    P.recompute_ratings(con)
    con.commit()
    after = con.execute("SELECT COUNT(*) FROM product_spec_values").fetchone()[0]
    unresolved = con.execute("SELECT COUNT(*) FROM data_quality_flags WHERE resolved=0").fetchone()[0]
    print(f"\n보강 완료: 스펙값 {before}→{after} (+{after-before}), 메트릭 {total}개 채움")
    print(f"미해결 플래그: {unresolved}")

    print("\n[보강된 경량 백패킹텐트 — 무게/내수압/바닥면적]")
    for name, w, wh, fa in con.execute("""
        SELECT b.name_ko||' '||p.model_name,
          MAX(CASE WHEN mt.key='weight_min' THEN psv.value_normalized END),
          MAX(CASE WHEN mt.key='water_head' THEN psv.value_normalized END),
          MAX(CASE WHEN mt.key='floor_area' THEN psv.value_normalized END)
        FROM products p JOIN brands b ON b.id=p.brand_id
        JOIN categories c ON c.id=p.category_id AND c.name_ko='백패킹텐트'
        JOIN product_spec_values psv ON psv.product_id=p.id
        JOIN metrics mt ON mt.id=psv.metric_id
        WHERE p.danawa_pcode IN (%s)
        GROUP BY p.id ORDER BY 2 LIMIT 12""" % ",".join("?" * len(targets)),
        [t[1] for t in targets]):
        print(f"   {name[:34]:36} {w:>5.0f}g | 내수압 {wh or '-'} | 바닥 {fa or '-'}㎡")
    con.close()


if __name__ == "__main__":
    main()
