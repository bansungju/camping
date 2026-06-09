#!/usr/bin/env python3
"""데이터 정합성 감사 + 한계 진단. 사이트/수익화 전 토대 검증.
사용: python3 pipeline/audit.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import run_all as RA


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(RA.ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    g = lambda q, p=(): con.execute(q, p).fetchone()[0]

    print("=" * 70)
    print("데이터 정합성 감사")
    print("=" * 70)
    tot = g("SELECT COUNT(*) FROM products")
    ver = g("SELECT COUNT(*) FROM products WHERE curation_status='verified'")
    print(f"수집 {tot} / verified {ver}\n")

    # ── A. 무결성 ──────────────────────────────────
    print("[A. 무결성]")
    # A1. core 미충족 verified (있으면 승격버그)
    bad = 0
    for cfg in RA.CATEGORIES.values():
        core = cfg["core"]; ph = ",".join("?" * len(core))
        for sub in cfg["subcats"]:
            bad += g(f"""SELECT COUNT(*) FROM products p WHERE p.curation_status='verified'
                AND p.category_id=(SELECT id FROM categories WHERE name_ko=?)
                AND (SELECT COUNT(DISTINCT m.key) FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
                     AND m.key IN ({ph}) WHERE v.product_id=p.id AND v.valid=1)<{len(core)}""", [sub] + core)
    print(f"  core 미충족 verified: {bad}건 {'✅' if bad==0 else '⚠️ 승격버그'}")
    # A2. 가격 없는 verified (제1규칙)
    npx = g("""SELECT COUNT(*) FROM products p WHERE curation_status='verified'
        AND NOT EXISTS(SELECT 1 FROM price_observations po WHERE po.product_id=p.id)""")
    print(f"  가격없는 verified(제1규칙): {npx}건 {'✅' if npx==0 else '⚠️'}")
    # A3. rejected인데 verified? (불가능해야)
    print(f"  중복 pcode: {g('SELECT COUNT(*)-COUNT(DISTINCT danawa_pcode) FROM products WHERE danawa_pcode IS NOT NULL')}건")
    # A4. 이상치 격리(valid=0) — 파싱오류
    print(f"  이상치 격리(valid=0): {g('SELECT COUNT(*) FROM product_spec_values WHERE valid=0')}개 (별점서 제외됨)")

    # ── B. 정의 기준 일관성 (가장 중요) ─────────────
    print("\n[B. 정의 기준 일관성 — 신뢰도의 핵심]")
    for key, lab in [("comfort_temp", "내한온도(comfort기준)"), ("weight_min", "무게(최소기준)"),
                     ("water_head", "내수압(플라이기준)"), ("floor_area", "바닥(이너기준)")]:
        d = g(f"SELECT COUNT(*) FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key=? WHERE v.valid=1 AND v.source_id=1", (key,))
        x = g(f"SELECT COUNT(*) FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key=? WHERE v.valid=1 AND v.source_id IN(3,4)", (key,))
        print(f"  {lab}: 다나와(기준불명) {d} / 크로스소스(기준확정) {x}")
    sus = g("SELECT COUNT(*) FROM data_quality_flags WHERE note LIKE '[기준의심]%'")
    print(f"  기준의심 플래그(무게패킹/내수압바닥 혼입 의심): {sus}건")
    print("  ⇒ 다나와값은 기준이 섞였을 수 있음(best-effort). 크로스소스값만 기준 확정.")

    # ── C. 카테고리×지표 한계 지도 ──────────────────
    print("\n[C. 한계 지도 — 카테고리별 지표 신뢰 커버리지(verified 내, %)]")
    cats = con.execute("""SELECT c.id,c.name_ko FROM categories c JOIN products p ON p.category_id=c.id
        WHERE p.curation_status='verified' GROUP BY c.id ORDER BY c.id""").fetchall()
    for cid, cat in cats:
        v = g("SELECT COUNT(*) FROM products WHERE category_id=? AND curation_status='verified'", (cid,))
        mets = con.execute("SELECT key,label_ko FROM metrics WHERE category_id=? AND is_star_metric=1 ORDER BY id", (cid,)).fetchall()
        cells = [f"가격100"]
        for k, l in mets:
            c = g("""SELECT COUNT(DISTINCT v.product_id) FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key=?
                JOIN products p ON p.id=v.product_id AND p.category_id=? AND p.curation_status='verified' WHERE v.valid=1""", (k, cid))
            cells.append(f"{l}{c*100//max(v,1)}")
        print(f"  {cat:8}(v{v:>3}) " + " ".join(cells))

    print("\n[D. 막다른길(구조적 미공개)]")
    print("  [데이터없음] 확정:", g("SELECT COUNT(*) FROM data_quality_flags WHERE note LIKE '[데이터없음]%'"), "건")
    con.close()


if __name__ == "__main__":
    main()
