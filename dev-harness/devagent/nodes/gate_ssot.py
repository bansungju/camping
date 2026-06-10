"""gate_ssot — [§14.2] area SSOT 정합성. K.1(needs_llm), K.2(human).

이 게이트는 결정론적으로 "SSOT 정본 파일을 건드렸는가"(K.2 트리거)만 판정하고, 의미 정합성(K.1)은
contract_checker 가 needs_llm 으로 표시 → evaluator 가 SSOT 본문을 보고 판단한다.
"""
from __future__ import annotations

from .. import ssot


def run(state) -> dict:
    area = state.get("area", "")
    touches = [f.get("path", "") for f in state.get("changed_files", [])
               if ssot.is_ssot_path(area, f.get("path", ""))]
    results = []
    # K.2 — 정본 SSOT 자체 수정 여부 (결정론). 수정했으면 needs_human 으로 contract_checker 가 처리.
    results.append({
        "gate": "ssot", "status": "pass", "contract_id": "K.2",
        "cmd": f"ssot touch check (area={area})",
        "output": f"SSOT 정본 수정: {touches}" if touches else "정본 미수정 (derived 만)",
    })
    # K.1 은 evaluator 몫 — 여기선 evidence 로 "검사 대상 SSOT" 만 표기
    results.append({
        "gate": "ssot", "status": "skip", "contract_id": "K.1",
        "cmd": "ssot consistency (→ evaluator)",
        "output": f"정본: {ssot.canonical_for(area) or '(없음)'}",
    })
    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + results}
