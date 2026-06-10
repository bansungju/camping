"""gate_lint — L.1. [§17.2] 축별 도구: frontend=eslint, backend/data=ruff. 도구 부재 = skip."""
from __future__ import annotations

from ._util import changed_paths, run_tool, workdir


def run(state) -> dict:
    axis = state.get("axis", "data")
    wt = workdir(state)
    changed = changed_paths(state)

    if axis == "frontend":
        js = [p for p in changed if p.endswith((".js", ".ts", ".jsx", ".tsx"))]
        tool, target = ["npx", "--no-install", "eslint"], js
    else:
        py = [p for p in changed if p.endswith(".py")]
        tool, target = ["ruff", "check"], py

    if not target:
        res = {"gate": "lint", "status": "skip", "contract_id": "L.1",
               "cmd": "(no lintable files)"}
    else:
        code, out = run_tool(tool + target, cwd=wt)
        if out == "__MISSING__":
            res = {"gate": "lint", "status": "skip", "contract_id": "L.1",
                   "cmd": " ".join(tool), "output": "도구 미설치 — skip"}
        else:
            res = {"gate": "lint", "status": "pass" if code == 0 else "fail",
                   "contract_id": "L.1", "cmd": " ".join(tool + target),
                   "exit_code": code, "output": out}

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + [res]}
