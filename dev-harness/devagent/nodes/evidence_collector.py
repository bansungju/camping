"""evidence_collector — 게이트 외 증거 수집 (DESIGN.md §17.2 축별 증거).

data 축: camping 의 정합성 도구(validate_ranges.py/audit.py)를 호출해 "값이 말이 되는가"를 증거로.
frontend/backend: diff stat 등 기본 증거. 게이트 결과와 별개로 evidence 에 누적.
"""
from __future__ import annotations

import os

from .. import paths
from ._util import run_tool, workdir


def run(state) -> dict:
    axis = state.get("axis", "data")
    wt = workdir(state)
    evidence = []

    # 공통 — diff stat
    base = state.get("base_ref", "")
    if state.get("workspace") and base:
        code, out = run_tool(["git", "diff", "--cached", "--stat", base], cwd=wt)
        if out not in ("__MISSING__", ""):
            evidence.append({"gate": "diffstat", "status": "pass", "cmd": "git diff --stat",
                             "output": out})

    # data 축 — 정합성 도구 (있을 때만)
    if axis in ("data", "multi"):
        for script in ("pipeline/validate_ranges.py", "pipeline/audit.py"):
            full = os.path.join(paths.REPO_ROOT, script)
            if os.path.exists(full):
                code, out = run_tool(["python3", script], cwd=wt, timeout=180)
                if out != "__MISSING__":
                    evidence.append({"gate": f"data:{os.path.basename(script)}",
                                     "status": "pass" if code == 0 else "fail",
                                     "cmd": f"python3 {script}", "exit_code": code, "output": out})

    prev = state.get("evidence", [])
    return {"stage": "evidence", "evidence": prev + evidence}
