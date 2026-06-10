"""devagent/graph.py — LangGraph StateGraph 빌더 (DESIGN.md §4).

토폴로지: intake → code_drafter → apply → reset_gates → 게이트 5종 → evidence → contract_checker
→ [route] → evaluator/revise/human_review → publish. langgraph 미설치면 build 시 ImportError,
`--dry` 는 그래도 동작.
"""
from __future__ import annotations

import sys

from .state import DevState, REVISION_ROUND_LIMIT
from .nodes import (
    apply, code_drafter, contract_checker, evaluator, evidence_collector,
    gate_diff_scope, gate_lint, gate_scope_overlap, gate_ssot, gate_tests,
    gate_typecheck, human_review, intake, publish, reset_gates, revise,
)


# ---------------------------------------------------------------------------
# Conditional edge 분기
# ---------------------------------------------------------------------------
def route_after_contract(state: DevState) -> str:
    if state.get("revision_round", 0) >= REVISION_ROUND_LIMIT:
        return "human_review"
    checks = state.get("contract_checks", [])
    if any(c.get("status") == "fail" for c in checks):
        return "revise"
    if any(c.get("status") == "needs_llm" for c in checks):
        return "evaluator"
    return "human_review"


def route_after_evaluator(state: DevState) -> str:
    if state.get("revision_round", 0) >= REVISION_ROUND_LIMIT:
        return "human_review"
    return "human_review" if state.get("evaluator_verdict") == "PASS" else "revise"


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def build_graph(checkpoint_path: "str | None" = None, checkpointer=None):
    try:
        from langgraph.graph import END, START, StateGraph
    except ImportError as e:
        raise ImportError("langgraph 미설치. `pip install 'langgraph>=0.2.40' langgraph-checkpoint-sqlite` 후 재시도.") from e

    g = StateGraph(DevState)

    g.add_node("intake", intake.run)
    g.add_node("code_drafter", code_drafter.run)
    g.add_node("apply", apply.run)
    g.add_node("reset_gates", reset_gates.run)
    g.add_node("gate_diff_scope", gate_diff_scope.run)
    g.add_node("gate_scope_overlap", gate_scope_overlap.run)
    g.add_node("gate_ssot", gate_ssot.run)
    g.add_node("gate_lint", gate_lint.run)
    g.add_node("gate_typecheck", gate_typecheck.run)
    g.add_node("gate_tests", gate_tests.run)
    g.add_node("evidence_collector", evidence_collector.run)
    g.add_node("contract_checker", contract_checker.run)
    g.add_node("evaluator", evaluator.run)
    g.add_node("revise", revise.run)
    g.add_node("human_review", human_review.run)
    g.add_node("publish", publish.run)

    g.add_edge(START, "intake")
    g.add_edge("intake", "code_drafter")
    g.add_edge("code_drafter", "apply")
    g.add_edge("apply", "reset_gates")
    g.add_edge("reset_gates", "gate_diff_scope")
    g.add_edge("gate_diff_scope", "gate_scope_overlap")
    g.add_edge("gate_scope_overlap", "gate_ssot")
    g.add_edge("gate_ssot", "gate_lint")
    g.add_edge("gate_lint", "gate_typecheck")
    g.add_edge("gate_typecheck", "gate_tests")
    g.add_edge("gate_tests", "evidence_collector")
    g.add_edge("evidence_collector", "contract_checker")

    g.add_conditional_edges("contract_checker", route_after_contract,
                            {"revise": "revise", "evaluator": "evaluator", "human_review": "human_review"})
    g.add_conditional_edges("evaluator", route_after_evaluator,
                            {"revise": "revise", "human_review": "human_review"})
    g.add_edge("revise", "code_drafter")
    g.add_edge("human_review", "publish")
    g.add_edge("publish", END)

    return g.compile(
        checkpointer=_resolve_checkpointer(checkpoint_path, checkpointer),
        interrupt_before=["human_review"],
    )


def build_review_graph(checkpoint_path: "str | None" = None, checkpointer=None):
    """[§4] review kind 축소 경로 — publish 미경유. orchestrator 가 리뷰 대상 diff 를
    changed_files/changeset_diff 로 inject 한 뒤 evaluator 가 평가, human_review 에서 멈춤 → END."""
    try:
        from langgraph.graph import END, START, StateGraph
    except ImportError as e:
        raise ImportError("langgraph 미설치.") from e

    g = StateGraph(DevState)
    g.add_node("intake", intake.run)
    g.add_node("evaluator", evaluator.run)
    g.add_node("human_review", human_review.run)
    g.add_edge(START, "intake")
    g.add_edge("intake", "evaluator")
    g.add_edge("evaluator", "human_review")
    g.add_edge("human_review", END)
    return g.compile(
        checkpointer=_resolve_checkpointer(checkpoint_path, checkpointer),
        interrupt_before=["human_review"],
    )


def build_for(kind: str, checkpoint_path=None, checkpointer=None):
    if kind == "review":
        return build_review_graph(checkpoint_path, checkpointer)
    return build_graph(checkpoint_path, checkpointer)


def _resolve_checkpointer(checkpoint_path, checkpointer):
    if checkpointer is not None or not checkpoint_path:
        return checkpointer
    try:
        import sqlite3
        from langgraph.checkpoint.sqlite import SqliteSaver
        conn = sqlite3.connect(checkpoint_path, check_same_thread=False)
        return SqliteSaver(conn)
    except ImportError:
        try:
            from langgraph.checkpoint.memory import MemorySaver
            print("warn: langgraph-checkpoint-sqlite 미설치 — MemorySaver fallback", file=sys.stderr)
            return MemorySaver()
        except ImportError:
            return None


# ---------------------------------------------------------------------------
# Dry-run — langgraph 미설치라도 토폴로지 확인
# ---------------------------------------------------------------------------
def dry_describe() -> str:
    from .contract import summary_counts
    c = summary_counts()
    return f"""\
Graph: camping dev-harness / dev domain

Nodes (16):
  intake → code_drafter [LLM]
  → apply (격리 워크트리 + changeset_diff)
  → reset_gates
  → gate_diff_scope → gate_scope_overlap → gate_ssot → gate_lint → gate_typecheck → gate_tests
  → evidence_collector → contract_checker
  → [conditional: route_after_contract]
      게이트 fail        → revise [LLM]
      needs_llm 남음     → evaluator [LLM, read-only]
      모두 pass          → human_review
  evaluator → [conditional: route_after_evaluator]
      PASS               → human_review
      NEEDS_WORK         → revise
  revise → code_drafter (loop: changed_files=[], round+1, 상한 {REVISION_ROUND_LIMIT})
  human_review [interrupt_before] → publish → END

Review kind: intake → evaluator → human_review → END (publish 미경유)

Contract: auto={c['auto']} needs_llm={c['needs_llm']} human={c['human']}
Axis: frontend/backend/data 별 게이트·증거 프로파일 분기 (§17)
SSOT: area 별 정본 1개 (§14), 동시성 원장 active.json (§16)
Checkpoint: AsyncSqliteSaver(ainvoke) / SqliteSaver(sync) → MemorySaver fallback
"""


if __name__ == "__main__":
    if "--dry" in sys.argv:
        print(dry_describe())
        sys.exit(0)
    try:
        build_graph()
        print("graph compiled OK")
    except ImportError as e:
        print(f"build failed: {e}", file=sys.stderr)
        sys.exit(2)
