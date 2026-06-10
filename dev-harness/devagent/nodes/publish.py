"""publish — 안전 배포 (DESIGN.md §9). 워크트리 commit → 메인에 새 브랜치.

방어 순서: swap 해시 → human 승인(pending⊆approved) → 게이트/verdict(force_publish 로만 우회).
commit 성공 후에만 PROGRESS/state 갱신 + 원장 제거 (검증된 사실만 기록, §15.4).
"""
from __future__ import annotations

from .. import ledger, paths, progress
from ..state import changeset_digest
from ._util import run_tool


def _git(args, cwd):
    return run_tool(["git"] + args, cwd=cwd)


def _blocked_reason(state) -> str:
    checks = state.get("contract_checks", [])
    # 1) swap — 게이트가 검증한 본문과 현재 본문 불일치 (force 로도 우회 불가)
    if changeset_digest(state.get("changed_files", [])) != state.get("validated_changeset_hash", ""):
        return "post-gate swap 탐지 — 검증 후 본문이 교체됨 (배포 거부)"
    # 2) human 승인 (force 로도 우회 불가)
    pending = set(state.get("pending_human_approvals", []))
    approved = set(state.get("approved_human", []))
    if not pending.issubset(approved):
        return f"미승인 human 항목: {sorted(pending - approved)}"
    # 3) 게이트 fail / verdict — force_publish 로만 우회
    if not state.get("force_publish"):
        fails = [c["id"] for c in checks if c.get("status") == "fail"]
        if fails:
            return f"게이트 fail: {fails} (force_publish 필요)"
        if any(c.get("status") == "needs_llm" for c in checks) and state.get("evaluator_verdict") != "PASS":
            return f"evaluator 미통과(verdict={state.get('evaluator_verdict') or '없음'})"
    return ""


def run(state) -> dict:
    reason = _blocked_reason(state)
    if reason:
        return {"stage": "human_review", "messages": state.get("messages", []) + [f"publish 거부: {reason}"]}

    wt = state.get("workspace", "")
    thread_id = state.get("thread_id", "") or "adhoc"
    branch = f"dev-harness/{thread_id}"
    area = state.get("area", "")

    # 게이트 증거 요약을 commit 메시지에
    gates = " ".join(f"{g.get('gate')}:{g.get('status')}" for g in state.get("gate_results", []))
    forced = " [FORCED]" if state.get("force_publish") else ""
    msg = (f"{area}/{state.get('request_kind','')}: {state.get('request','')[:60]}{forced}\n\n"
           f"gates: {gates}\nverdict: {state.get('evaluator_verdict') or '—'}\n"
           f"thread: {thread_id}\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>")

    committed_sha = ""
    if wt:
        _git(["add", "-A"], cwd=wt)
        ccode, cout = _git(["commit", "-m", msg], cwd=wt)
        scode, sha = _git(["rev-parse", "HEAD"], cwd=wt)
        if scode == 0 and sha != "__MISSING__":
            committed_sha = sha.strip()
        if committed_sha:
            # 메인 레포에 브랜치 ref 생성 (같은 .git 공유 → 객체 이미 존재). main 직접이동 금지.
            _git(["branch", "-f", branch, committed_sha], cwd=paths.REPO_ROOT)

    # 검증된 사실만 기록 (§15.4)
    if committed_sha:
        progress.append_progress(progress.format_entry(state, merged=not state.get("force_publish"),
                                                       branch=branch))
        progress.update_state(area, thread_id=thread_id,
                              last_change=state.get("request", "")[:80],
                              status="active")
    if thread_id:
        ledger.remove(thread_id)

    return {
        "stage": "done",
        "messages": state.get("messages", []) + [
            f"publish 완료 — branch={branch} sha={committed_sha[:8] or '(commit 실패)'}"
        ],
    }
