#!/usr/bin/env python3
"""LangGraph 채우기(enrichment) 서브그래프 — 제품 1건 처리. "넘겨짚기 방지"를 구조로 강제.

그래프:
  START → assess ─(부족)→ fetch_detail → fetch_fallback → infer → validate → persist → END
                 └(충분)──────────────────────────────────┘
  - assess        : DB 현재 스펙 로드, 부족한 채울수있는 메트릭 판정
  - fetch_detail  : 다나와 상세 → 있는 값만(넘겨짚기 X). 원본 specs는 state에 보관
  - fetch_fallback: 2차 추출(상세의 '크기'값 안에 박힌 수납크기→패킹부피). 없으면 missing 유지
  - infer         : 인원 파생추정. 근거 있을 때만, confidence='inferred' 명시
  - validate      : 하드범위=파싱오류 격리 / 소프트=재분류 플래그
  - persist       : DB 기록. 빈칸은 빈칸으로(날조 금지), 멱등
"""
import os
import re
import sqlite3
import sys
from typing import Optional, TypedDict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize as N
import danawa as D
import pipeline as P
import validate_ranges as V
from harvest_tents import TENT_MAP

from langgraph.graph import StateGraph, START, END

DB = None  # main() CLI 기본값 전용. 노드는 s["db"]를 단일 진실로 사용.
FILL = ["weight_min", "water_head", "floor_area", "packed_volume"]  # 기본 채움 메트릭(텐트)


class State(TypedDict):
    db: str
    pid: int
    pcode: Optional[str]
    name: str
    category: str
    capacity: Optional[int]
    cap_source: Optional[str]
    specs: dict
    detail: dict
    missing: list
    fill_metrics: list  # 카테고리별 채울 메트릭. 비면 FILL로 폴백.
    errors: list
    log: list


def _fill(s: State) -> list:
    return s.get("fill_metrics") or FILL


def assess(s: State) -> dict:
    con = sqlite3.connect(s["db"])
    cid = P.category_id(con, s["category"])
    have = {}
    for key, val, conf in con.execute("""
        SELECT mt.key, psv.value_normalized, psv.confidence
        FROM product_spec_values psv JOIN metrics mt ON mt.id=psv.metric_id
        WHERE psv.product_id=? AND mt.category_id=? AND psv.value_normalized IS NOT NULL""",
        (s["pid"], cid)):
        have[key] = {"value": val, "source_id": 1, "confidence": conf, "valid": 1, "flag": None}
    con.close()
    missing = [k for k in _fill(s) if k not in have]
    return {"specs": have, "missing": missing,
            "log": s["log"] + [f"assess: 보유={sorted(have)} 부족={missing}"]}


def route_assess(s: State) -> str:
    return "fetch" if s["missing"] else "enough"


def route_after_detail(s: State) -> str:
    """packed_volume이 아직 부족할 때만 2차추출. 그 외엔 바로 infer."""
    return "fallback" if "packed_volume" in s["missing"] else "infer"


def fetch_detail(s: State) -> dict:
    specs = dict(s["specs"])
    log = s["log"]
    if not s["pcode"]:
        return {"log": log + ["fetch_detail: pcode 없음 → 건너뜀"]}
    try:
        parsed = D.parse(D.fetch(s["pcode"]))
    except Exception as e:
        return {"errors": s["errors"] + [{"pid": s["pid"], "node": "fetch_detail", "err": str(e)}],
                "log": log + [f"fetch_detail: 실패 {e}"]}
    dspec = parsed["specs"]
    filled = []
    for spec in TENT_MAP:
        if spec["metric"] in specs:
            continue
        raw = P.find_spec(dspec, spec["keys"], spec.get("exclude"))
        if not raw:
            continue   # ★ 출처에 없으면 안 채움
        val = P.derive_floor(raw) if spec.get("derive") == "floor" else P.FN[spec["fn"]](raw)
        if val is None:
            continue
        specs[spec["metric"]] = {"value": val, "source_id": 3, "confidence": "high", "valid": 1, "flag": None}
        filled.append(spec["metric"])
    missing = [k for k in _fill(s) if k not in specs]
    return {"specs": specs, "detail": dspec, "missing": missing,
            "log": log + [f"fetch_detail: 상세에서 채움={filled or '없음'}"]}


def fetch_fallback(s: State) -> dict:
    """2차 추출: 상세 '크기/설치크기' 값 안에 박힌 '수납크기'를 패킹부피로. (날조 아님—실재 데이터)"""
    specs = dict(s["specs"])
    detail = s.get("detail") or {}
    filled = []
    if "packed_volume" not in specs and detail:
        for v in detail.values():
            m = re.search(r"수납[^0-9]{0,4}([\d.]+\s*[xX×*]\s*[\d.]+(?:\s*[xX×*]\s*[\d.]+)?)", v)
            if m:
                vol = N.packed_volume_cm3(m.group(1))
                if vol:
                    specs["packed_volume"] = {"value": vol, "source_id": 3, "confidence": "medium",
                                              "valid": 1, "flag": None}
                    filled.append("packed_volume(박힌수납크기)")
                    break
    missing = [k for k in _fill(s) if k not in specs]
    return {"specs": specs, "missing": missing,
            "log": s["log"] + [f"fetch_fallback: 2차추출={filled or '없음'}; 미보유={missing}(출처에 없음→유지)"]}


def infer(s: State) -> dict:
    if s["capacity"] is not None:
        return {"log": s["log"] + ["infer: 인원 이미 있음"]}
    from backfill_capacity import cap_from_name
    cap = cap_from_name(s["name"])
    if cap and 1 <= cap <= 12:
        return {"capacity": cap, "cap_source": "name",
                "log": s["log"] + [f"infer: 모델명→인원 {cap} (확정)"]}
    fa = s["specs"].get("floor_area", {}).get("value")
    if fa:
        cap = 1 if fa < 2.2 else 2 if fa < 3.2 else 3 if fa < 4.5 else 4 if fa < 6 else 5
        return {"capacity": cap, "cap_source": "inferred:floor",
                "log": s["log"] + [f"infer: 바닥 {fa}㎡→인원≈{cap} (inferred)"]}
    return {"log": s["log"] + ["infer: 추정근거 없음→미상 유지"]}


def validate(s: State) -> dict:
    specs = dict(s["specs"])
    notes = []
    for key, d in specs.items():
        if d.get("source_id") == 1:
            continue
        hard = V.HARD_RANGES.get(key)
        if hard and not (hard[0] <= d["value"] <= hard[1]):
            d["valid"], d["flag"] = 0, f"implausible:{key}={d['value']:g}"
            notes.append(d["flag"]); continue
        soft = V.CAT_SOFT.get(s["category"], {}).get(key)
        if soft and not (soft[0] <= d["value"] <= soft[1]):
            d["flag"] = f"category_mismatch:{key}={d['value']:g}"
            notes.append(d["flag"])
    return {"specs": specs, "log": s["log"] + [f"validate: {notes or '이상없음'}"]}


def persist(s: State) -> dict:
    con = sqlite3.connect(s["db"], timeout=30)  # 병렬 enrich 시 쓰기 락 대기
    cid = P.category_id(con, s["category"])
    con.execute("DELETE FROM product_spec_values WHERE product_id=? AND source_id IN (3,4)", (s["pid"],))
    for key, d in s["specs"].items():
        if d.get("source_id") in (3, 4):
            mid = P.metric_id(con, cid, key)
            con.execute("""INSERT INTO product_spec_values
                (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,valid)
                VALUES(?,?,?,?,?,?,?,1,?)""",
                (s["pid"], mid, d["value"], "graph", "norm", d["source_id"], d["confidence"], d["valid"]))
            if d.get("flag"):
                ft = "implausible" if d["flag"].startswith("implausible") else "category_mismatch"
                P.flag(con, s["pid"], mid, ft, "[graph] " + d["flag"])
    if s["capacity"] is not None and s["cap_source"]:
        con.execute("UPDATE products SET capacity=? WHERE id=? AND capacity IS NULL",
                    (s["capacity"], s["pid"]))
    con.commit(); con.close()
    return {"log": s["log"] + ["persist: 기록 완료"]}


def build_graph():
    g = StateGraph(State)
    for name, fn in [("assess", assess), ("fetch_detail", fetch_detail),
                     ("fetch_fallback", fetch_fallback), ("infer", infer),
                     ("validate", validate), ("persist", persist)]:
        g.add_node(name, fn)
    g.add_edge(START, "assess")
    g.add_conditional_edges("assess", route_assess, {"fetch": "fetch_detail", "enough": "infer"})
    g.add_conditional_edges("fetch_detail", route_after_detail,
                            {"fallback": "fetch_fallback", "infer": "infer"})
    g.add_edge("fetch_fallback", "infer")
    g.add_edge("infer", "validate")
    g.add_edge("validate", "persist")
    g.add_edge("persist", END)
    return g.compile()


def main():
    import argparse
    global DB
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    ap.add_argument("--limit", type=int, default=6)
    args = ap.parse_args()
    DB = args.db
    graph = build_graph()
    con = sqlite3.connect(DB)
    targets = con.execute("""
        SELECT p.id, p.danawa_pcode, b.name_ko||' '||p.model_name, c.name_ko, p.capacity
        FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        WHERE p.danawa_pcode IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
                          AND m.key='water_head' WHERE v.product_id=p.id)
        ORDER BY p.id LIMIT ?""", (args.limit,)).fetchall()
    con.close()
    print(f"LangGraph 채우기: {len(targets)}종\n" + "=" * 56)
    for pid, pcode, name, cat, cap in targets:
        st = graph.invoke({"db": DB, "pid": pid, "pcode": pcode, "name": name, "category": cat,
                           "capacity": cap, "cap_source": None, "specs": {}, "detail": {},
                           "missing": [], "fill_metrics": [], "errors": [], "log": []})
        print(f"\n▶ {name[:38]} [{cat}]")
        for line in st["log"]:
            print("   · " + line)


if __name__ == "__main__":
    main()
