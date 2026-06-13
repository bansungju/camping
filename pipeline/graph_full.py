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
from concurrent.futures import ThreadPoolExecutor, as_completed
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
    errors: list
    log: list


def harvest_node(s: FullState) -> dict:
    if not s.get("queries"):
        return {"log": s["log"] + ["harvest: queries 없음 → 스킵(기존 DB 사용)"]}
    # append 수확 (간이): 기존 pcode dedup
    con = sqlite3.connect(s["db"])
    seen = {r[0] for r in con.execute("SELECT danawa_pcode FROM products WHERE danawa_pcode IS NOT NULL")}
    seen_names = {r[0] for r in con.execute("SELECT model_name FROM products")}
    added, errors = 0, []
    for q in s["queries"].split(","):
        for page in range(1, 4):
            try:
                cands = HT.parse_results(HT.fetch_page(q.strip(), page))
            except Exception as e:
                # H-48: 수확 실패를 조용히 break하지 않는다. 그냥 break하면 부분 데이터만 커밋되고
                #       실패가 로그/상태로 전파되지 않아 사후 감지가 불가능했다. 오류를 state errors에
                #       적재해 report_node가 요약·표면화하게 하고, 콘솔에도 경고를 남긴다.
                #       (해당 쿼리의 후속 페이지는 의미 없어 break하되, 다른 쿼리는 계속 진행 —
                #        전체 파이프라인을 raise로 중단시키는 것보다 데이터 손실 가시성이 높다.)
                errors.append({"pid": "-", "node": "harvest",
                               "err": f"query='{q.strip()}' page={page}: {e}"})
                print(f"   ⚠ harvest 실패 query='{q.strip()}' page={page}: {e}", flush=True)
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
    msg = f"harvest: 신규 {added}종 추가" + (f", 실패 {len(errors)}건(요약은 report 참조)" if errors else "")
    return {"errors": s.get("errors", []) + errors, "log": s["log"] + [msg]}


def normalize_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    raw, uniq, collapsed = NM.normalize_db(con)
    con.commit()   # M-184: normalize_db가 내부 commit하더라도 close 전 명시 commit으로 변경 보존 보장.
    con.close()
    return {"log": s["log"] + [f"normalize: {raw}종 → 고유 {uniq}종(변형 {collapsed}그룹 통합)"]}


# 카테고리별 채울 메트릭. 비면 graph_pipeline.FILL(텐트 기본)로 폴백.
FILL_BY_CATEGORY = {
    "텐트": ["weight_min", "water_head", "floor_area", "packed_volume"],
    "타프": ["weight_min", "water_head", "packed_volume"],
    "침낭": ["weight_min", "packed_volume"],
}
ENRICH_WORKERS = 4


def enrich_node(s: FullState) -> dict:
    if s["enrich_limit"] == 0:
        return {"log": s["log"] + ["enrich_batch: 생략(--enrich-limit 0)"]}
    sub = GP.build_graph()
    con = sqlite3.connect(s["db"])
    try:
        # M-269: 병렬 enrich(ENRICH_WORKERS 스레드)가 각자 커넥션으로 동시 쓰기 → journal_mode=delete면
        #   쓰기 락 경합이 심하다. WAL로 전환(다중 reader + 단일 writer 직렬화, 영속 설정)해 경합 완화.
        #   (persist의 timeout=30 + run_one의 예외 캡처가 잔여 경합을 흡수.)
        con.execute("PRAGMA journal_mode=WAL")
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
    finally:
        con.close()   # M-235: 쿼리 중 예외가 나도 커넥션 누수 없이 닫는다.

    def run_one(row):
        pid, pcode, name, cat, cap = row
        try:
            st = sub.invoke({"db": s["db"], "pid": pid, "pcode": pcode, "name": name,
                             "category": cat, "capacity": cap, "cap_source": None,
                             "specs": {}, "detail": {}, "missing": [],
                             # H-86: DB의 name_ko는 "백패킹텐트"/"오토캠핑텐트" 전체 명칭이라
                             #       FILL_BY_CATEGORY.get(cat)는 항상 미스 → 빈 배열로 폴백돼
                             #       모든 텐트가 기본 FILL만 적용됐다. 키 부분매칭으로 해결.
                             "fill_metrics": next((v for k, v in FILL_BY_CATEGORY.items() if k in cat), []),
                             "errors": [], "log": []})
            return st.get("errors", [])
        except Exception as e:
            return [{"pid": pid, "node": "enrich", "err": str(e)}]

    done, errors = 0, []
    with ThreadPoolExecutor(max_workers=ENRICH_WORKERS) as ex:
        futs = [ex.submit(run_one, row) for row in targets]
        for f in as_completed(futs):
            errors.extend(f.result() or [])
            done += 1
            if done % 50 == 0:
                print(f"   enrich {done}/{len(targets)}...", flush=True)
    fail = len({e["pid"] for e in errors})
    return {"errors": s.get("errors", []) + errors,
            "log": s["log"] + [f"enrich_batch: {done}종 처리(병렬 {ENRICH_WORKERS}), 오류 {len(errors)}건/{fail}종"]}


def validate_node(s: FullState) -> dict:
    con = sqlite3.connect(s["db"])
    hard, soft = VR.validate_db(con)
    con.commit()   # M-184: validate_db 내부 commit이 있어도 close 전 명시 commit으로 변경 보존 보장.
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
    pct = lambda c: (c * 100 // n) if n else 0  # H-68: 빈 DB/신규 카테고리 n=0 시 ZeroDivision 방지
    lines = [f"\n{'='*56}", f"전체 그래프 완료 — 제품 {n}종 커버리지", "=" * 56,
             f"  가격 {price} ({pct(price)}%) | 인원 {cap} ({pct(cap)}%)"]
    for k, c in cov.items():
        lines.append(f"  {k:<14} {c:>4} ({pct(c)}%)")
    errs = s.get("errors", [])
    if errs:
        lines.append(f"\n  ⚠ enrich 오류 {len(errs)}건 (상위 5):")
        for e in errs[:5]:
            lines.append(f"    · pid={e['pid']} [{e['node']}] {e['err'][:60]}")
    print("\n".join(lines))
    return {"log": s["log"] + [f"report: 출력 완료(오류 {len(errs)}건)"]}


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
    ap.add_argument("--enrich-limit", type=int, default=-1, help="-1=전체, 0=생략, N(>0)=상위N")
    args = ap.parse_args()
    # L-270: enrich_limit 유효값은 -1(전체)/0(생략)/양수(상위N)뿐. -2 이하는 우연히 '전체'로
    #   동작하던 함정이라 명시적으로 거부한다.
    if args.enrich_limit < -1:
        ap.error("--enrich-limit must be -1(전체), 0(생략), or a positive integer")
    graph = build_full_graph()
    st = graph.invoke({"db": args.db, "queries": args.queries, "enrich_limit": args.enrich_limit,
                       "stats": {}, "errors": [], "log": []})
    print("\n[그래프 실행 경로]")
    for line in st["log"]:
        print("   · " + line)


if __name__ == "__main__":
    main()
