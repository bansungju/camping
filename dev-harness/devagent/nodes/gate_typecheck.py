"""gate_typecheck — Y.1. [§17.2] frontend=tsc(TS만), backend/data=mypy. 부재 = skip."""
from __future__ import annotations

from ._util import changed_paths, run_tool, workdir


def run(state) -> dict:
    axis = state.get("axis", "data")
    wt = workdir(state)
    changed = changed_paths(state)

    if axis == "frontend":
        ts = [p for p in changed if p.endswith((".ts", ".tsx"))]
        if not ts:
            res = {"gate": "typecheck", "status": "skip", "contract_id": "Y.1",
                   "cmd": "(no TS files)"}
            prev = state.get("gate_results", [])
            return {"stage": "gates", "gate_results": prev + [res]}
        tool = ["npx", "--no-install", "tsc", "--noEmit"]
        code, out = run_tool(tool, cwd=wt)
    else:
        py = [p for p in changed if p.endswith(".py")]
        if not py:
            res = {"gate": "typecheck", "status": "skip", "contract_id": "Y.1",
                   "cmd": "(no .py)"}
            prev = state.get("gate_results", [])
            return {"stage": "gates", "gate_results": prev + [res]}
        tool = ["mypy"] + py
        code, out = run_tool(tool, cwd=wt)

    if out == "__MISSING__":
        res = {"gate": "typecheck", "status": "skip", "contract_id": "Y.1",
               "cmd": " ".join(tool), "output": "도구 미설치 — skip"}
    else:
        res = {"gate": "typecheck", "status": "pass" if code == 0 else "fail",
               "contract_id": "Y.1", "cmd": " ".join(tool), "exit_code": code, "output": out}

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + [res]}
