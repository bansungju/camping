#!/usr/bin/env python3
"""전체 단일 LangGraph 파이프라인 — 수집부터 별점까지 하나의 그래프.

  START → harvest? → normalize → enrich_batch → validate → rate → report → END
  - harvest      : (옵션) 브랜드/범용 쿼리로 신규 수확. queries 없으면 스킵
  - normalize    : 색상/옵션 변형 통합 → canonical_models
  - enrich_batch : 채울게 남은 제품마다 per-product 서브그래프 실행(2차추출·추정·검증 포함)
  - validate     : 전체 타당범위 검증(하드 격리/소프트 재분류)
  - rate         : 카테고리×인원 별점 재계산
  - report       : 메트릭 커버리지 요약

per-product 서브그래프(graph_pipeline)를 enrich_batch 노드가 호출 = 그래프 안의 그래프.

사용:
  python3 pipeline/graph_full.py --db camping_tents500.db            # 정규화+채우기+검증+별점
  python3 pipeline/graph_full.py --db ... --queries "헬리녹스 텐트"   # 수확까지
  python3 pipeline/graph_full.py --db ... --enrich-limit 0           # 채우기 생략
"""
import argparse
import os
import sqlite3
import sys
import time
from typing import Optional, TypedDict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pipeline as P
import normalize_models as NM
import validate_ranges as VR
import graph_pipeline as GP
import harvest_tents as HT

from langgraph.graph import StateGraph, START, END


class FullState(TypedDict):
    db: str
    queries: Optional[str]
    enrich_limit: int
    stats: dict
    log: list


def harvest_node(s: FullState) -> dict:
    if not s.get("queries"):
        return {"log": s["log"] + ["harvest: queries 없음 → 스킵(기존 DB 사용)"]}
    # append 수확 (간이): 기존 pcode dedup
    con = sqlite3.connect(s["db"])
    seen = {r[0] for r in con.execute("SELECT danawa_pcode FROM products WHERE danawa_pcode IS NOT NULL")}
    seen_names = {r[0] for r in con.execute("SELECT model_name FROM products")}
    added = 0
    for q in s["queries"].split(","):
        for page in range(1, 4):
            try:
                cands = HT.parse_results(HT.fetch_page(q.strip(), page))
            except Exception:
                break
            if not cands:
                break
            for c in cands:
                if c["pcode"] in seen:
                    continue
                seen.add(c["pcode"])
                if HT.ingest(con, c, seen_names) == "ok":
                    added += 1
            con.commit()
            time.sleep(0.4)
    con.close()
    return {"log": s["log"] + [f"harvest: 신규 {added}종 추가"]}


def normalize_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    raw, uniq, collapsed = NM.normalize_db(con)
    con.close()
    return {"log": s["log"] + [f"normalize: {raw}종 → 고유 {uniq}종(변형 {collapsed}그룹 통합)"]}


def enrich_node(s: FullState) -> dict:
    if s["enrich_limit"] == 0:
        return {"log": s["log"] + ["enrich_batch: 생략(--enrich-limit 0)"]}
    GP.DB = s["db"]
    sub = GP.build_graph()
    con = sqlite3.connect(s["db"])
    q = """SELECT p.id, p.danawa_pcode, b.name_ko||' '||p.model_name, c.name_ko, p.capacity
           FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
           WHERE p.danawa_pcode IS NOT NULL
             AND ( NOT EXISTS (SELECT 1 FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
                               AND m.key='water_head' WHERE v.product_id=p.id)
                OR NOT EXISTS (SELECT 1 FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
                               AND m.key='floor_area' WHERE v.product_id=p.id) )
           ORDER BY p.id"""
    if s["enrich_limit"] > 0:
        q += f" LIMIT {s['enrich_limit']}"
    targets = con.execute(q).fetchall()
    con.close()
    done = 0
    for pid, pcode, name, cat, cap in targets:
        try:
            sub.invoke({"pid": pid, "pcode": pcode, "name": name, "category": cat,
                        "capacity": cap, "cap_source": None, "specs": {}, "detail": {},
                        "missing": [], "log": []})
            done += 1
        except Exception:
            pass
        if done % 50 == 0 and done:
            print(f"   enrich {done}/{len(targets)}...", flush=True)
        time.sleep(0.3)
    return {"log": s["log"] + [f"enrich_batch: {done}종 서브그래프 처리"]}


def validate_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    hard, soft = VR.validate_db(con)
    con.close()
    return {"log": s["log"] + [f"validate: 파싱오류 격리 {len(hard)} / 재분류 검토 {len(soft)}"]}


def rate_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    P.recompute_ratings(con)
    con.commit(); con.close()
    return {"log": s["log"] + ["rate: 별점 재계산 완료"]}


def report_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    n = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    cov = {}
    for key in ["weight_min", "water_head", "floor_area", "packed_volume"]:
        c = con.execute("""SELECT COUNT(DISTINCT psv.product_id) FROM product_spec_values psv
            JOIN metrics mt ON mt.id=psv.metric_id AND mt.key=? WHERE psv.valid=1""", (key,)).fetchone()[0]
        cov[key] = c
    price = con.execute("SELECT COUNT(DISTINCT product_id) FROM price_observations").fetchone()[0]
    cap = con.execute("SELECT COUNT(*) FROM products WHERE capacity IS NOT NULL").fetchone()[0]
    con.close()
    lines = [f"\n{'='*56}", f"전체 그래프 완료 — 제품 {n}종 커버리지", "=" * 56,
             f"  가격 {price} ({price*100//n}%) | 인원 {cap} ({cap*100//n}%)"]
    for k, c in cov.items():
        lines.append(f"  {k:<14} {c:>4} ({c*100//n}%)")
    print("\n".join(lines))
    return {"log": s["log"] + ["report: 출력 완료"]}


def build_full_graph():
    g = StateGraph(FullState)
    g.add_node("harvest", harvest_node)
    g.add_node("normalize", normalize_node)
    g.add_node("enrich_batch", enrich_node)
    g.add_node("validate", validate_node)
    g.add_node("rate", rate_node)
    g.add_node("report", report_node)
    g.add_edge(START, "harvest")
    g.add_edge("harvest", "normalize")
    g.add_edge("normalize", "enrich_batch")
    g.add_edge("enrich_batch", "validate")
    g.add_edge("validate", "rate")
    g.add_edge("rate", "report")
    g.add_edge("report", END)
    return g.compile()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    ap.add_argument("--queries", default=None)
    ap.add_argument("--enrich-limit", type=int, default=-1, help="-1=전체, 0=생략, N=상위N")
    args = ap.parse_args()
    graph = build_full_graph()
    st = graph.invoke({"db": args.db, "queries": args.queries, "enrich_limit": args.enrich_limit,
                       "stats": {}, "log": []})
    print("\n[그래프 실행 경로]")
    for line in st["log"]:
        print("   · " + line)


if __name__ == "__main__":
    main()
