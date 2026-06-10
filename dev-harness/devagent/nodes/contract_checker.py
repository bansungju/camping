"""contract_checker — 게이트 결과를 ContractCheck 리스트로 환산 (DESIGN.md §6).

auto 항목은 gate_results(contract_id 매칭)의 status 로 pass/fail, needs_llm/human 은 카테고리대로.
[cycle2] evaluator_verdict / approved_human 을 리셋해 fresh-context 평가·human 게이트 우회를 막고,
validated_changeset_hash 를 기록해 publish 의 post-gate swap 탐지에 쓴다.
"""
from __future__ import annotations

import re

from .. import ssot
from ..contract import REGISTRY, applicable
from ..state import changeset_digest

_DESTRUCTIVE = re.compile(r"(?i)\b(drop\s+table|drop\s+column|alter\s+table\s+\w+\s+drop|truncate)\b")


def _ssot_touch(state) -> bool:
    area = state.get("area", "")
    return any(ssot.is_ssot_path(area, f.get("path", ""))
               for f in state.get("changed_files", []))


def _schema_change(state) -> bool:
    for f in state.get("changed_files", []):
        p = f.get("path", "")
        if p.endswith("schema.sql") or p.endswith(".sql"):
            if _DESTRUCTIVE.search(f.get("new_body", "")) or f.get("status") == "deleted":
                return True
    return False


def _auto_status(gate_results, contract_id: str) -> str:
    """해당 contract_id 의 게이트 결과 종합 — fail 우선, 없으면 pass(skip 포함 비차단)."""
    matches = [g for g in gate_results if g.get("contract_id") == contract_id]
    if any(g.get("status") == "fail" for g in matches):
        return "fail"
    return "pass"


def run(state) -> dict:
    kind = state.get("request_kind", "feature")
    gate_results = state.get("gate_results", [])
    ssot_touch = _ssot_touch(state)
    schema_change = _schema_change(state)

    checks = []
    for item in REGISTRY:
        if not applicable(item, kind, ssot_touch=ssot_touch, schema_change=schema_change, deploy=False):
            continue
        if item.category == "auto":
            status = _auto_status(gate_results, item.id)
        elif item.category == "needs_llm":
            status = "needs_llm"
        else:  # human
            status = "needs_human"
        checks.append({
            "id": item.id, "label": item.label, "status": status,
            "auto": item.category == "auto", "evidence_ref": item.gate,
        })

    pending_human = [c["id"] for c in checks if c["status"] == "needs_human"]
    return {
        "stage": "contract",
        "contract_checks": checks,
        "evaluator_verdict": "",       # [cycle2] fresh-context 강제
        "evaluator_notes": [],
        "approved_human": [],          # [cycle2 M4] 사전승인 우회 차단
        "pending_human_approvals": pending_human,
        "validated_changeset_hash": changeset_digest(state.get("changed_files", [])),
    }
