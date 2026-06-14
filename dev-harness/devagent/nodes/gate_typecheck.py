"""gate_typecheck — Y.1. [§17.2] frontend=tsc(TS만), backend/data=mypy. 부재 = skip."""
from __future__ import annotations

from ._util import changed_paths, run_tool, workdir


def run(state) -> dict:
    axis = state.get("axis", "data")
    wt = workdir(state)
    changed = changed_paths(state)

    ts = [p for p in changed if p.endswith((".ts", ".tsx"))]
    py = [p for p in changed if p.endswith(".py")]
    # M-462: multi 축은 TS(tsc)+Python(mypy) 양쪽을 검사해야 한다(전엔 else로 빠져 .py만). 단일 엔트리로 합침.
    if axis == "frontend":
        jobs = [(["npx", "--no-install", "tsc", "--noEmit"], ts)]
    elif axis == "multi":
        jobs = [(["mypy"] + py, py), (["npx", "--no-install", "tsc", "--noEmit"], ts)]
    else:
        jobs = [(["mypy"] + py, py)]

    statuses, outs, cmds, codes = [], [], [], []
    for tool, target in jobs:
        if not target:
            continue
        code, out = run_tool(tool, cwd=wt)
        cmds.append(" ".join(tool))
        if out == "__MISSING__":
            statuses.append("skip"); outs.append(f"{tool[0]}: 도구 미설치 — skip")
        else:
            statuses.append("pass" if code == 0 else "fail"); outs.append(out); codes.append(code)

    if not statuses:
        res = {"gate": "typecheck", "status": "skip", "contract_id": "Y.1", "cmd": "(no typecheckable files)"}
    elif "fail" in statuses:
        res = {"gate": "typecheck", "status": "fail", "contract_id": "Y.1", "cmd": " + ".join(cmds),
               "exit_code": max(codes or [1]), "output": "\n".join(outs)}
    elif all(s == "skip" for s in statuses):
        res = {"gate": "typecheck", "status": "skip", "contract_id": "Y.1", "cmd": " + ".join(cmds),
               "output": "\n".join(outs)}
    else:
        res = {"gate": "typecheck", "status": "pass", "contract_id": "Y.1", "cmd": " + ".join(cmds),
               "exit_code": 0, "output": "\n".join(outs)}

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + [res]}
