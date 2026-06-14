"""gate_lint — L.1. [§17.2] 축별 도구: frontend=eslint, backend/data=ruff. 도구 부재 = skip."""
from __future__ import annotations

from ._util import changed_paths, run_tool, workdir


def run(state) -> dict:
    axis = state.get("axis", "data")
    wt = workdir(state)
    changed = changed_paths(state)

    js = [p for p in changed if p.endswith((".js", ".ts", ".jsx", ".tsx"))]
    py = [p for p in changed if p.endswith(".py")]
    # M-462: multi 축은 Python(ruff)+JS(eslint) 양쪽을 모두 검사해야 한다(전엔 else로 빠져 .py만 검사,
    #   JS 변경이 무검사 통과). 결과는 단일 lint 엔트리로 합쳐 어느 한쪽이라도 fail이면 fail.
    if axis == "frontend":
        jobs = [(["npx", "--no-install", "eslint"], js)]
    elif axis == "multi":
        jobs = [(["ruff", "check"], py), (["npx", "--no-install", "eslint"], js)]
    else:
        jobs = [(["ruff", "check"], py)]

    statuses, outs, cmds, codes = [], [], [], []
    for tool, target in jobs:
        if not target:
            continue
        code, out = run_tool(tool + target, cwd=wt)
        cmds.append(" ".join(tool + target))
        if out == "__MISSING__":
            statuses.append("skip"); outs.append(f"{' '.join(tool)}: 도구 미설치 — skip")
        else:
            statuses.append("pass" if code == 0 else "fail"); outs.append(out); codes.append(code)

    if not statuses:
        res = {"gate": "lint", "status": "skip", "contract_id": "L.1", "cmd": "(no lintable files)"}
    elif "fail" in statuses:
        res = {"gate": "lint", "status": "fail", "contract_id": "L.1", "cmd": " + ".join(cmds),
               "exit_code": max(codes or [1]), "output": "\n".join(outs)}
    elif all(s == "skip" for s in statuses):
        res = {"gate": "lint", "status": "skip", "contract_id": "L.1", "cmd": " + ".join(cmds),
               "output": "\n".join(outs)}
    else:
        res = {"gate": "lint", "status": "pass", "contract_id": "L.1", "cmd": " + ".join(cmds),
               "exit_code": 0, "output": "\n".join(outs)}

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + [res]}
