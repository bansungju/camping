"""apply — [cycle1 H5] changed_files 를 격리 git 워크트리에 반영 + changeset_diff 생성 (DESIGN.md §5.1/§5.2).

state(SSOT)의 changed_files+base_ref 로 매 진입마다 워크트리를 결정론적으로 재구성한다 → resume 시
워크트리가 사라져도 복구된다([cycle2 H1]). new_body 는 바이트 그대로 쓴다(정규화 금지, [cycle2 M1]).
"""
from __future__ import annotations

import os

from .. import ledger, paths
from ._util import run_tool


def _git(args, cwd):
    return run_tool(["git"] + args, cwd=cwd)


def _ensure_worktree(wt: str, base_ref: str) -> "tuple[bool, str]":
    """워크트리 보장 + base_ref 로 clean reset. (ok, message)."""
    os.makedirs(paths.WORKTREE_DIR, exist_ok=True)
    git_dir = os.path.join(wt, ".git")
    if not os.path.exists(git_dir):
        # 기존 등록 잔재 정리 후 새로 추가
        _git(["worktree", "prune"], cwd=paths.REPO_ROOT)
        code, out = _git(["worktree", "add", "--force", "--detach", wt, base_ref or "HEAD"],
                         cwd=paths.REPO_ROOT)
        if code != 0:
            return False, f"worktree add 실패: {out}"
    # 매 라운드 clean 상태에서 시작 (이전 라운드 잔여 제거)
    _git(["reset", "--hard", base_ref or "HEAD"], cwd=wt)
    _git(["clean", "-fd"], cwd=wt)
    return True, "ok"


def run(state) -> dict:
    thread_id = state.get("thread_id", "") or "adhoc"
    base_ref = state.get("base_ref", "")
    wt = os.path.join(paths.WORKTREE_DIR, thread_id)

    # [cycle1 L1] 병렬 충돌 감지 — main HEAD 가 base_ref 에서 움직였나
    drift = ""
    code, head = _git(["rev-parse", "HEAD"], cwd=paths.REPO_ROOT)
    if code == 0 and base_ref and head.strip() != base_ref:
        drift = f"base_ref({base_ref[:8]}) != HEAD({head.strip()[:8]}) — rebase 필요 가능"

    ok, msg = _ensure_worktree(wt, base_ref)
    if not ok:
        # git 워크트리 불가 — 안전하게 멈추도록 evidence 에 fail 남기고 workspace 비움
        ev = state.get("evidence", [])
        return {"stage": "apply", "workspace": "",
                "evidence": ev + [{"gate": "apply", "status": "fail", "cmd": "worktree", "output": msg}]}

    # 파일 반영 — new_body 바이트 그대로
    wt_real = os.path.realpath(wt)
    escaped = []
    for f in state.get("changed_files", []):
        path = f.get("path", "")
        if not path:
            continue
        target = os.path.join(wt, path)
        # [cycle3 C1] 경로 탈출 방어 — 워크트리 밖을 가리키면 거부
        if os.path.realpath(target) != wt_real and not os.path.realpath(target).startswith(wt_real + os.sep):
            escaped.append(path)
            continue
        if f.get("status") == "deleted":
            if os.path.exists(target):
                os.remove(target)
            continue
        if f.get("is_binary"):
            continue  # 바이너리는 게이트 skip — 본문 미보관
        os.makedirs(os.path.dirname(target) or wt, exist_ok=True)
        # [cycle3 C3] surrogatepass — state.changeset_digest 와 동일 인코딩이라야 swap 해시 일치
        with open(target, "w", encoding="utf-8", errors="surrogatepass", newline="") as fh:
            fh.write(f.get("new_body", ""))
    if escaped:
        ev = state.get("evidence", [])
        return {"stage": "apply", "workspace": "",
                "evidence": ev + [{"gate": "apply", "status": "fail", "cmd": "path escape",
                                   "output": f"워크트리 밖 경로 거부: {escaped}"}]}

    # [cycle2 H5] 신규 파일까지 인덱스에 — git add -A → --cached diff
    _git(["add", "-A"], cwd=wt)
    dcode, diff = _git(["diff", "--cached", base_ref or "HEAD"], cwd=wt)
    changeset_diff = "" if diff == "__MISSING__" else diff[:200_000]

    if thread_id:
        ledger.heartbeat(thread_id, stage="apply")

    patch = {"stage": "apply", "workspace": wt, "changeset_diff": changeset_diff}
    if drift:
        ev = state.get("evidence", [])
        patch["evidence"] = ev + [{"gate": "apply", "status": "pass",
                                   "cmd": "drift check", "output": drift}]
    return patch
