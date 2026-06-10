"""devagent — camping 개발 에이전트 하네스 (LangGraph).

DESIGN.md 의 토폴로지를 코드로 옮긴 것. orchestrator(=Claude Code)가 그래프를 운전하고,
결정론적 게이트(diff_scope/ssot/lint/typecheck/tests)는 py 노드가, 생성·평가만 Task subagent 가 채운다.
"""
from __future__ import annotations

__version__ = "0.1.0"
