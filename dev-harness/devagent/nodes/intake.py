"""intake — (area, axis, kind) 확정 + scope/base_ref/SSOT 로드 + 원장 등록 (DESIGN.md §16.3).

orchestrator 가 명시한 값이 1순위, 비면 router 로 분류. base_ref 는 현재 HEAD.
원장에 등록해 다른 세션이 이 작업을 인지하게 한다.
"""
from __future__ import annotations

from .. import ledger, paths, router, ssot
from ._util import run_tool


def _head(cwd: str) -> str:
    code, out = run_tool(["git", "rev-parse", "HEAD"], cwd=cwd)
    return out.strip() if code == 0 and out != "__MISSING__" else ""


def run(state) -> dict:
    request = state.get("request", "")
    scope = state.get("scope_paths", [])

    area = state.get("area") or router.classify_area(request)
    axis = state.get("axis") or router.classify_axis(request, scope)
    kind = state.get("request_kind") or router.classify_kind(request)

    base_ref = state.get("base_ref") or _head(paths.REPO_ROOT)
    ssot_refs = ssot.refs_for(area)

    patch = {
        "stage": "intake",
        "area": area,
        "axis": axis,
        "request_kind": kind,
        "base_ref": base_ref,
        "ssot_refs": ssot_refs,
        "revision_round": state.get("revision_round", 0),
    }

    # 원장 등록 — 다른 세션 인지 (§16.2). 실패해도 작업은 진행.
    thread_id = state.get("thread_id", "")
    if thread_id:
        ledger.register({
            "thread_id": thread_id,
            "session_id": state.get("session_id", ""),
            "area": area, "axis": axis, "kind": kind,
            "request": request[:200],
            "scope_paths": scope,
            "ssot_refs": ssot_refs,
            "stage": "intake",
            "base_ref": base_ref,
        })
    return patch


def concurrent_view(thread_id: str) -> "list[dict]":
    """[§16.3] drafter/orchestrator 에게 줄 '현재 동시 진행 작업' 요약."""
    return [
        {"thread_id": t.get("thread_id"), "area": t.get("area"), "axis": t.get("axis"),
         "kind": t.get("kind"), "stage": t.get("stage"), "scope": t.get("scope_paths"),
         "request": t.get("request")}
        for t in ledger.active_threads(exclude_thread=thread_id)
    ]
