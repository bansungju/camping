"""evaluator — [LLM, read-only] 격리 코드리뷰. fresh-context 3중 잠금 (DESIGN.md §7.2).

orchestrator 가 drafter 와 다른 Task subagent(allowed_tools=[])로 평가해 verdict 를 inject.
[cycle2 C2] view 는 changeset_diff(통합 diff)를 본다 — ChangedFile 에 diff 필드는 없다.
drafter 의 사고·messages·revision_round·evaluator_notes 는 절대 미노출.
"""
from __future__ import annotations

import json

from .. import ssot


def run(state) -> dict:
    if state.get("evaluator_verdict") in ("PASS", "NEEDS_WORK"):
        return {
            "stage": "evaluator",
            "evaluator_verdict": state["evaluator_verdict"],
            "evaluator_notes": state.get("evaluator_notes", []),
        }
    from langgraph.types import interrupt
    interrupt(
        "evaluator 결과 필요 — orchestrator 가 별도 Task subagent(fresh ctx, allowed_tools=[])로 "
        "평가 후 --inject 로 evaluator_verdict 주입. "
        f"(round={state.get('revision_round', 0)})"
    )
    return {}


def _evaluator_view(state) -> dict:
    """[cycle2 C2] diff 는 changeset_diff 에서. drafter 사고 차단."""
    area = state.get("area", "")
    return {
        "request": state.get("request", ""),
        "area": area,
        "axis": state.get("axis", ""),
        "request_kind": state.get("request_kind", ""),
        "changed_files": [{"path": f.get("path"), "status": f.get("status")}
                          for f in state.get("changed_files", [])],
        "changeset_diff": state.get("changeset_diff", "")[:200_000],
        "gate_results": [g for g in state.get("gate_results", []) if g.get("status") != "skip"],
        "contract_checks_needs_llm": [
            {"id": c.get("id"), "label": c.get("label")}
            for c in state.get("contract_checks", []) if c.get("status") == "needs_llm"
        ],
    }


def build_evaluator_prompt(state) -> "dict[str, str]":
    """orchestrator 가 evaluator Task subagent 띄울 때 쓰는 system + user.

    [§17.3] 해당 축의 SSOT 본문을 잣대로 추가한다(다른 축 미노출).
    """
    area = state.get("area", "")
    axis = state.get("axis", "")
    ssot_body = ssot.read_ssot_body(area)
    view = _evaluator_view(state)
    system = (
        f"너는 camping {axis} 축의 독립 코드 리뷰어다. 이 코드를 작성하지 않았고, 작성자의 의도도 모른다.\n"
        "diff·게이트 결과·SSOT 만 보고 평가하라. 평가 기준:\n"
        "- 정확성·엣지케이스(R.1), 보안·입력검증(R.2), 요청 의도 일치(R.3)\n"
        "- 해당 축 SSOT 의 불변규칙과 모순 없음(K.1)\n"
        "- (feature) 동반된 테스트가 신규 동작을 실제로 검증하는가(T.2b)\n"
        "응답 규약: 첫 줄에 `PASS` 또는 `NEEDS_WORK` 만 단독. 이후 발견사항/다음 라운드 지적을 자유텍스트로."
    )
    user = (
        f"## 이 축({area})의 SSOT (잣대)\n{ssot_body[:8000]}\n\n"
        "## 평가 대상 view\n"
        f"```json\n{json.dumps(view, ensure_ascii=False, indent=2)}\n```"
    )
    return {"system": system, "user": user}
