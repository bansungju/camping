"""devagent/__main__.py — orchestrator CLI (DESIGN.md §8/§15.5/§16.5).

흐름: --request → (drafter interrupt) → --inspect/--get-prompt → [Task subagent] → --inject
→ (evaluator interrupt) → --inject → human_review 멈춤 → --resume.
langgraph 없이도 --dry/--status/--progress/--ssot/--sessions/--conflicts/--reap/--validate 동작.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time

from . import ledger, paths, progress, router, ssot
from .state import initial_state

_PROTECTED = {
    "gate_results", "evidence", "contract_checks", "revision_round",
    "pending_human_approvals", "validated_changeset_hash",
}


def _now_slug() -> str:
    return time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())


def _thread_id(request: str) -> str:
    slug = re.sub(r"[^a-z0-9_]+", "_", request.lower())[:32].strip("_") or "session"
    return f"{_now_slug()}_{slug}"


def _session_id() -> str:
    return os.environ.get("DEVAGENT_SESSION") or f"s_{os.getpid():x}"


# ---------------------------------------------------------------------------
# langgraph 불요 명령
# ---------------------------------------------------------------------------
def cmd_dry() -> int:
    from .graph import dry_describe
    print(dry_describe())
    return 0


def cmd_status() -> int:
    st = progress.read_state()
    print(f"# dev-harness 현황 (updated {st.get('updated','')})\n")
    print(f"{'area':10} {'status':12} {'ssot_rev':10} last_change")
    print("-" * 70)
    for area, a in st.get("areas", {}).items():
        print(f"{area:10} {a.get('status',''):12} {a.get('ssot_rev','—'):10} {a.get('last_change','')}")
    active = ledger.active_threads()
    print(f"\n활성 thread: {len(active)}")
    for t in active:
        print(f"  · {t.get('thread_id')} [{t.get('area')}/{t.get('axis')}] {t.get('stage')}")
    return 0


def cmd_sessions() -> int:
    active = ledger.active_threads()
    if not active:
        print("활성 thread 없음")
        return 0
    print(f"{'thread':40} {'session':8} {'area':9} {'axis':9} {'stage':12} scope")
    print("-" * 100)
    for t in active:
        print(f"{t.get('thread_id',''):40} {t.get('session_id',''):8} {t.get('area',''):9} "
              f"{t.get('axis',''):9} {t.get('stage',''):12} {t.get('scope_paths', [])}")
    return 0


def cmd_conflicts(scope_csv: str) -> int:
    scope = [s.strip() for s in scope_csv.split(",") if s.strip()]
    hits = ledger.scope_overlap(scope)
    if not hits:
        print(f"겹침 없음 — scope={scope}")
        return 0
    print("⚠️ 겹치는 활성 thread:")
    for h in hits:
        print(f"  · {h['thread_id']} [{h['area']}/{h['axis']}] shared={h['shared']}")
    return 1


def cmd_reap() -> int:
    dead = ledger.reap()
    print(f"회수된 죽은 thread: {dead or '(없음)'}")
    return 0


def cmd_progress(n: int) -> int:
    if not os.path.exists(paths.PROGRESS_MD):
        print("(PROGRESS.md 없음)")
        return 0
    with open(paths.PROGRESS_MD, encoding="utf-8") as f:
        text = f.read()
    entries = text.split("\n## ")
    head = entries[0]
    items = ["## " + e for e in entries[1:]][:n]
    print(head.strip() + "\n\n" + "\n\n".join(items))
    return 0


def cmd_ssot(area: str) -> int:
    canon = ssot.canonical_for(area)
    print(f"area={area}  정본={canon or '(없음)'}  rev={ssot.ssot_rev(area)}")
    if canon:
        print("\n--- 본문 미리보기 ---")
        print(ssot.read_ssot_body(area)[:1500])
    return 0


def cmd_gc() -> int:
    """[§5.2/§12] 죽은 thread 워크트리 정리."""
    dead = ledger.reap()
    from .nodes._util import run_tool
    for tid in dead:
        wt = os.path.join(paths.WORKTREE_DIR, tid)
        if os.path.isdir(wt):
            run_tool(["git", "worktree", "remove", "--force", wt], cwd=paths.REPO_ROOT)
    run_tool(["git", "worktree", "prune"], cwd=paths.REPO_ROOT)
    print(f"gc 완료 — 정리된 thread: {dead or '(없음)'}")
    return 0


# ---------------------------------------------------------------------------
# langgraph 필요 명령 (async)
# ---------------------------------------------------------------------------
def _require_langgraph() -> bool:
    try:
        import langgraph  # noqa: F401
        return True
    except ImportError:
        print("langgraph 미설치 — `pip install 'langgraph>=0.2.40' langgraph-checkpoint-sqlite`",
              file=sys.stderr)
        return False


def _saver():
    """[env] aiosqlite 0.22.1 이 py3.9 에서 is_alive 버그 → sync SqliteSaver 사용."""
    import sqlite3
    from langgraph.checkpoint.sqlite import SqliteSaver
    conn = sqlite3.connect(paths.CHECKPOINTS_DB, check_same_thread=False)
    return SqliteSaver(conn)


def _graph_for_thread(saver, thread_id: str, explicit_kind: "str | None" = None):
    """thread 의 저장된 kind 를 읽어 올바른 그래프 선택."""
    from .graph import build_for
    config = {"configurable": {"thread_id": thread_id}}
    probe = build_for("feature", checkpointer=saver)
    snap = probe.get_state(config)
    kind = explicit_kind or (snap.values or {}).get("request_kind", "feature")
    if kind == "review":
        graph = build_for("review", checkpointer=saver)
        return graph, graph.get_state(config)
    return probe, snap


def cmd_request(request, area, axis, kind, scope) -> int:
    if not _require_langgraph():
        return 2
    from .graph import build_for
    from .nodes.intake import _head
    area = area or router.classify_area(request)
    axis = axis or router.classify_axis(request, scope)
    kind = kind or router.classify_kind(request)
    tid = _thread_id(request)
    print(f"[domain] area={area} axis={axis} kind={kind}", file=sys.stderr)
    config = {"configurable": {"thread_id": tid}}
    base_ref = _head(paths.REPO_ROOT)
    state = initial_state(request, area=area, axis=axis, kind=kind, scope_paths=scope,
                          base_ref=base_ref, thread_id=tid, session_id=_session_id())
    saver = _saver()
    graph = build_for(kind, checkpointer=saver)
    try:
        result = graph.invoke(state, config=config)
    except Exception as e:  # noqa: BLE001
        print(f"graph 실행 실패: {e}", file=sys.stderr)
        return 1
    snap = graph.get_state(config)
    print(f"[thread_id] {tid}")
    print(f"[stage] {result.get('stage','?')}  [next] {list(snap.next)}")
    return 0


def cmd_inspect(thread_id) -> int:
    if not _require_langgraph():
        return 2
    _g, snap = _graph_for_thread(_saver(), thread_id)
    v = snap.values or {}
    payload = {
        "thread_id": thread_id, "next": list(snap.next),
        "stage": v.get("stage"), "area": v.get("area"), "axis": v.get("axis"),
        "request_kind": v.get("request_kind"), "revision_round": v.get("revision_round", 0),
        "request": v.get("request", ""), "scope_paths": v.get("scope_paths", []),
        "changed_files": [{"path": f.get("path"), "status": f.get("status")}
                          for f in v.get("changed_files", [])],
        "gate_results": v.get("gate_results", []),
        "contract_checks": v.get("contract_checks", []),
        "evaluator_verdict": v.get("evaluator_verdict", ""),
        "pending_human_approvals": v.get("pending_human_approvals", []),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


def cmd_get_prompt(thread_id) -> int:
    if not _require_langgraph():
        return 2
    from .nodes.code_drafter import build_drafter_prompt
    from .nodes.evaluator import build_evaluator_prompt
    _g, snap = _graph_for_thread(_saver(), thread_id)
    v = snap.values or {}
    nxt = list(snap.next)
    out = {"thread_id": thread_id, "next": nxt, "revision_round": v.get("revision_round", 0)}
    if nxt == ["code_drafter"]:
        out.update({
            "node": "code_drafter", "subagent_type": "general-purpose", "allowed_tools": [],
            "inject_keys": ["stage", "changed_files"],
            "inject_template": {"stage": "draft", "changed_files": [
                {"path": "<상대경로>", "status": "modified", "new_body": "<전체 본문>"}]},
            **build_drafter_prompt(v),
        })
    elif nxt == ["evaluator"]:
        out.update({
            "node": "evaluator", "subagent_type": "general-purpose", "allowed_tools": [],
            "fresh_context_required": True,
            "inject_keys": ["evaluator_verdict", "evaluator_notes"],
            "inject_template": {"evaluator_verdict": "PASS", "evaluator_notes": ["<요약>"]},
            **build_evaluator_prompt(v),
        })
    elif nxt == ["human_review"]:
        out["note"] = "human_review 대기 — diff·게이트 보여주고 승인 후 --resume (필요시 approved_human inject)"
    elif not nxt:
        out["note"] = "그래프 종료"
    else:
        out["note"] = f"prompt 불필요 노드: {nxt}"
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


def _run_to_next(thread_id, patch=None) -> int:
    """patch 적용(있으면) 후 그래프를 다음 interrupt 까지 진행 — inject/resume 공용."""
    config = {"configurable": {"thread_id": thread_id}}
    saver = _saver()
    graph, _snap = _graph_for_thread(saver, thread_id)
    if patch is not None:
        graph.update_state(config, patch)
    try:
        result = graph.invoke(None, config=config)
    except Exception as e:  # noqa: BLE001
        print(f"resume 실패: {e}", file=sys.stderr)
        return 1
    snap = graph.get_state(config)
    stage = result.get("stage", "?") if isinstance(result, dict) else "?"
    print(f"[stage] {stage}  [next] {list(snap.next)}")
    for m in (result.get("messages", []) if isinstance(result, dict) else []):
        if isinstance(m, str) and ("publish" in m or "거부" in m):
            print(f"  · {m}")
    return 0


def cmd_inject(thread_id, patch_json) -> int:
    if not _require_langgraph():
        return 2
    try:
        patch = json.loads(patch_json)
    except json.JSONDecodeError as e:
        print(f"--inject JSON 파싱 실패: {e}", file=sys.stderr)
        return 2
    if not isinstance(patch, dict):
        print("--inject 는 JSON 오브젝트여야 함", file=sys.stderr)
        return 2
    bad = _PROTECTED & set(patch)
    if bad:
        print(f"--inject 거부: 그래프 계산 전용 필드 → {sorted(bad)}", file=sys.stderr)
        return 2
    return _run_to_next(thread_id, patch)


def cmd_resume(thread_id) -> int:
    if not _require_langgraph():
        return 2
    return _run_to_next(thread_id, None)


# ---------------------------------------------------------------------------
def main() -> int:
    p = argparse.ArgumentParser(prog="devagent", description="camping dev-harness orchestrator")
    p.add_argument("--dry", action="store_true")
    p.add_argument("--request")
    p.add_argument("--area", choices=["auth", "frontend", "backend", "devagent", "data"])
    p.add_argument("--axis", choices=["frontend", "backend", "data", "multi"])
    p.add_argument("--kind", choices=["feature", "fix", "refactor", "review"])
    p.add_argument("--scope", help="쉼표구분 scope 경로(glob)")
    p.add_argument("--inspect", metavar="THREAD")
    p.add_argument("--get-prompt", dest="get_prompt", metavar="THREAD")
    p.add_argument("--inject", nargs=2, metavar=("THREAD", "PATCH_JSON"))
    p.add_argument("--resume", metavar="THREAD")
    p.add_argument("--status", action="store_true")
    p.add_argument("--progress", nargs="?", const=5, type=int, metavar="N")
    p.add_argument("--ssot", metavar="AREA")
    p.add_argument("--sessions", action="store_true")
    p.add_argument("--conflicts", metavar="SCOPE_CSV")
    p.add_argument("--reap", action="store_true")
    p.add_argument("--gc", action="store_true")
    args = p.parse_args()

    scope = [s.strip() for s in args.scope.split(",")] if args.scope else []

    if args.dry:            return cmd_dry()
    if args.status:         return cmd_status()
    if args.sessions:       return cmd_sessions()
    if args.conflicts:      return cmd_conflicts(args.conflicts)
    if args.reap:           return cmd_reap()
    if args.gc:             return cmd_gc()
    if args.progress is not None:  return cmd_progress(args.progress)
    if args.ssot:           return cmd_ssot(args.ssot)
    if args.inspect:        return cmd_inspect(args.inspect)
    if args.get_prompt:     return cmd_get_prompt(args.get_prompt)
    if args.inject:         return cmd_inject(args.inject[0], args.inject[1])
    if args.resume:         return cmd_resume(args.resume)
    if args.request:        return cmd_request(args.request, args.area, args.axis, args.kind, scope)

    p.error("명령 필요 (--dry/--request/--status/--sessions/...)")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
