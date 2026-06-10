"""gate_diff_scope — S.1(scope 범위) + S.2(시크릿) 검사 (DESIGN.md §5.1).

[cycle2 H5] 실제 변경은 워크트리에서 `git diff --cached --name-only base_ref` 로 실측해야 신규
파일까지 잡힌다. 워크트리가 없으면(단독검증) state.changed_files 의 선언 경로로 fallback.
"""
from __future__ import annotations

import fnmatch
import os
import re

from .. import paths
from ._util import run_tool, workdir

# 시크릿 패턴 — 본문에 들어가면 안 되는 것들
_SECRET_RES = [
    re.compile(r"(?i)(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['\"][^'\"]{8,}"),
    re.compile(r"(?i)aws_secret_access_key"),
    re.compile(r"-----BEGIN (RSA |EC )?PRIVATE KEY-----"),
    re.compile(r"(?i)bearer\s+[a-z0-9._\-]{20,}"),
]
# 시크릿 파일 자체
_SECRET_FILES = re.compile(r"(^|/)\.env($|\.)|(^|/)id_rsa$|\.pem$|\.p12$|credentials\.json$")


def _real_changed(state) -> "list[str]":
    """워크트리 실측 우선, 없으면 선언된 경로."""
    wt = state.get("workspace")
    base = state.get("base_ref", "")
    if wt and base and os.path.isdir(wt):
        code, out = run_tool(["git", "diff", "--cached", "--name-only", base], cwd=wt)
        if code == 0 and out != "__MISSING__":
            return [p for p in out.splitlines() if p.strip()]
    return [f.get("path", "") for f in state.get("changed_files", []) if f.get("path")]


def _matches_scope(path: str, scope_paths: "list[str]") -> bool:
    npath = os.path.normpath(path)
    for s in scope_paths:
        s = os.path.normpath(s)
        if npath == s or fnmatch.fnmatch(npath, s) or npath.startswith(s + os.sep):
            return True
    return False


def run(state) -> dict:
    results = []
    scope = state.get("scope_paths", [])
    changed = _real_changed(state)

    # S.1 — scope. [cycle1 L4] scope 비면 fail(미확정).
    if not scope:
        s1 = {"gate": "diff_scope", "status": "fail", "contract_id": "S.1",
              "cmd": "scope check", "output": "scope_paths 미확정 — intake 가 확정해야 진행"}
    else:
        out_of = [p for p in changed if not _matches_scope(p, scope)]
        s1 = {"gate": "diff_scope", "status": "pass" if not out_of else "fail",
              "contract_id": "S.1", "cmd": "scope check",
              "output": "" if not out_of else f"scope 밖 변경: {out_of}"}
    results.append(s1)

    # S.2 — 시크릿
    leaks = []
    for f in state.get("changed_files", []):
        p = f.get("path", "")
        if _SECRET_FILES.search(p):
            leaks.append(f"시크릿 파일: {p}")
        body = f.get("new_body", "")
        for rx in _SECRET_RES:
            if rx.search(body):
                leaks.append(f"시크릿 패턴 in {p}")
                break
    results.append({"gate": "diff_scope", "status": "pass" if not leaks else "fail",
                    "contract_id": "S.2", "cmd": "secret scan",
                    "output": "" if not leaks else "; ".join(leaks)})

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + results}
