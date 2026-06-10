"""nodes/_util.py — 노드 공용 헬퍼."""
from __future__ import annotations

import subprocess

from .. import paths


def workdir(state) -> str:
    """게이트가 도구를 실행할 cwd — 워크트리가 있으면 그것, 없으면 레포 루트(단독검증)."""
    return state.get("workspace") or paths.REPO_ROOT


def changed_paths(state, *, include_deleted: bool = False) -> "list[str]":
    out = []
    for f in state.get("changed_files", []):
        if not include_deleted and f.get("status") == "deleted":
            continue
        if f.get("is_binary"):
            continue
        out.append(f.get("path", ""))
    return [p for p in out if p]


def run_tool(cmd: "list[str]", cwd: str, timeout: int = 120) -> "tuple[int, str]":
    """도구 실행 → (exit_code, output). 도구 미설치(FileNotFoundError) → (-1, '__MISSING__')."""
    try:
        proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return proc.returncode, (proc.stdout + proc.stderr)[:4000]
    except FileNotFoundError:
        return -1, "__MISSING__"
    except subprocess.TimeoutExpired:
        return -2, f"timeout after {timeout}s"


def has_tool(name: str) -> bool:
    import shutil
    return shutil.which(name) is not None
