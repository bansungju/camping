"""code_drafter — [LLM] 코드 변경 작성. orchestrator 가 Task subagent 로 채워 inject (DESIGN.md §7.1).

[cycle1 C2] changed_files 가 비어 있을 때만 interrupt — revise 가 매 라운드 비워주므로 재발화 보장.
"""
from __future__ import annotations

import json

from .. import ssot
from .intake import concurrent_view


def run(state) -> dict:
    if state.get("changed_files"):
        return {"stage": "draft"}
    from langgraph.types import interrupt
    interrupt(
        "code_drafter 결과 필요 — orchestrator 가 Task subagent 로 코드 변경을 만들어 "
        "`--inject` 로 changed_files 주입. "
        f"(area={state.get('area')}, axis={state.get('axis')}, round={state.get('revision_round', 0)})"
    )
    return {}


def build_drafter_prompt(state) -> "dict[str, str]":
    """orchestrator 가 drafter Task subagent 띄울 때 쓰는 system + user.

    [§17.3] 해당 축의 SSOT 만 싣는다(다른 축 미노출). 동시 작업 뷰로 다른 세션 인지.
    """
    area = state.get("area", "data")
    axis = state.get("axis", "data")
    kind = state.get("request_kind", "feature")
    ssot_body = ssot.read_ssot_body(area)
    concurrent = concurrent_view(state.get("thread_id", ""))
    notes = state.get("evaluator_notes", [])

    system = (
        f"너는 camping 프로젝트의 {axis} 축 전문 개발 에이전트다. 요청을 충족하는 코드 변경만 만든다.\n"
        f"- 작업 축: {axis} (이 축의 런타임·컨벤션만 따른다. 다른 축 내부구현 가정 금지 — SSOT 계약만 의존)\n"
        f"- 변경 종류: {kind}\n"
        f"- 게이트/리뷰는 그래프가 강제하니, 너는 '요청 충족'에만 집중하라.\n"
        f"- scope_paths 밖 파일은 건드리지 마라: {state.get('scope_paths', [])}\n"
        f"- 시크릿(.env/key/token)을 본문에 넣지 마라.\n"
        "- 반환: 변경할 파일들의 전체 본문(new_body)을 changed_files 형식으로."
    )
    user = (
        f"## 요청\n{state.get('request','')}\n\n"
        f"## 이 축({area})의 SSOT (정합해야 함)\n{ssot_body[:8000]}\n\n"
        f"## 현재 동시 진행 작업 (인지만 — 이들의 미완성 구현에 의존 금지)\n"
        f"```json\n{json.dumps(concurrent, ensure_ascii=False, indent=2)}\n```\n"
    )
    if notes:
        user += f"\n## 직전 라운드 리뷰 피드백 (반영하라)\n" + "\n".join(f"- {n}" for n in notes)
    return {"system": system, "user": user}
