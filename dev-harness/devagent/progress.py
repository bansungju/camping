"""devagent/progress.py — project state(state.json) + PROGRESS.md (DESIGN.md §15).

publish 노드만 쓴다 — 검증·승인된 변경만 맥락에 남는다(자기보고 금지의 연장).
원장 락(ledger._acquire_lock)을 공유해 다중 세션 동시쓰기를 막는다.
"""
from __future__ import annotations

import json
import os
import time

from . import ledger, paths, ssot

_AREAS = ["auth", "frontend", "backend", "devagent", "data"]


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _now_human() -> str:
    return time.strftime("%Y-%m-%d %H:%M", time.gmtime())


# ---------------------------------------------------------------------------
# state.json — 영역별 현황 (§15.2)
# ---------------------------------------------------------------------------
def _default_state() -> dict:
    return {
        "updated": _now_iso(),
        "areas": {a: {"ssot_rev": ssot.ssot_rev(a), "last_thread": None,
                      "open_threads": [], "status": "not_started", "last_change": ""}
                  for a in _AREAS},
        "active_threads": [],
    }


def read_state() -> dict:
    if not os.path.exists(paths.STATE_JSON):
        return _default_state()
    try:
        with open(paths.STATE_JSON, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return _default_state()


def update_state(area: str, *, thread_id: str, last_change: str, status: str = "active") -> None:
    """publish 가 commit 성공 후 호출. 락 아래 원자적."""
    if not ledger._acquire_lock():
        return
    try:
        state = read_state()
        state.setdefault("areas", {})
        a = state["areas"].setdefault(area, {})
        a["ssot_rev"] = ssot.ssot_rev(area)
        a["last_thread"] = thread_id
        a["last_change"] = last_change
        a["status"] = status
        state["updated"] = _now_iso()
        state["active_threads"] = [t.get("thread_id") for t in ledger.active_threads()]
        tmp = paths.STATE_JSON + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        os.replace(tmp, paths.STATE_JSON)
    finally:
        ledger._release_lock()


# ---------------------------------------------------------------------------
# PROGRESS.md — 사람용 타임라인 (§15.3)
# ---------------------------------------------------------------------------
def append_progress(entry_md: str) -> None:
    """PROGRESS.md 맨 위에 한 항목 prepend (역시간순). 락 아래."""
    if not ledger._acquire_lock():
        return
    try:
        header = "# PROGRESS — dev-harness 변경 이력\n\n> publish 노드가 검증·승인된 변경만 기록한다.\n\n"
        existing = ""
        if os.path.exists(paths.PROGRESS_MD):
            with open(paths.PROGRESS_MD, encoding="utf-8") as f:
                existing = f.read()
            if existing.startswith("# PROGRESS"):
                # 헤더 다음부터가 본문
                idx = existing.find("\n\n", existing.find("\n\n") + 1)
                body = existing[idx + 2:] if idx != -1 else ""
            else:
                body = existing
        else:
            body = ""
        new = header + entry_md.rstrip() + "\n\n" + body
        tmp = paths.PROGRESS_MD + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(new)
        os.replace(tmp, paths.PROGRESS_MD)
    finally:
        ledger._release_lock()


def format_entry(state: dict, *, merged: bool = True, branch: str = "") -> str:
    """DevState → PROGRESS 항목 마크다운 (§15.3 형식)."""
    area = state.get("area", "?")
    kind = state.get("request_kind", "?")
    status = "✅ merged" if merged else "⚠️ forced"
    files = ", ".join(f.get("path", "") for f in state.get("changed_files", [])) or "(없음)"
    gates = " · ".join(
        f"{g.get('gate')} {'✅' if g.get('status')=='pass' else ('skip' if g.get('status')=='skip' else '❌')}"
        for g in state.get("gate_results", [])
    )
    verdict = state.get("evaluator_verdict", "") or "—"
    notes = (state.get("evaluator_notes", []) or [""])[0]
    ssot_touch = any(ssot.is_ssot_path(area, f.get("path", "")) for f in state.get("changed_files", []))
    return (
        f"## {_now_human()} · {area} · {kind} · {status}\n"
        f"**요청:** {state.get('request','')}\n"
        f"**변경:** {files}  ·  scope: {', '.join(state.get('scope_paths', []))}\n"
        f"**게이트:** {gates or '(없음)'}\n"
        f"**리뷰(evaluator):** {verdict} — {notes}\n"
        f"**브랜치:** {branch or '—'}  ·  thread: {state.get('thread_id','')}\n"
        f"**SSOT 영향:** {'정본 수정' if ssot_touch else '없음 (derived 만 변경)'}"
    )
