"""devagent/ledger.py — 다중 세션 작업 원장 active.json (DESIGN.md §16).

진행 중 thread 의 단일 권위 레지스트리. 모든 쓰기는 TTL 디렉토리 락 아래 원자적 read-modify-write.
[cycle2 stale 락 답] PID/heartbeat 가 아니라 시간 리스(TTL) — 비정상 종료해도 영구 잠김 없음.
"""
from __future__ import annotations

import json
import os
import time

from . import paths

LEASE_SECONDS = 300       # thread lease TTL — heartbeat 갱신 안 되면 죽은 것으로 간주
LOCK_TTL = 15             # 원장 락 자체의 TTL (죽은 세션이 락 잡고 죽어도 회수)


# ---------------------------------------------------------------------------
# 디렉토리 락 (TTL) — active.json/state.json/PROGRESS.md 공유 쓰기 보호
# ---------------------------------------------------------------------------
def _acquire_lock(timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while True:
        try:
            fd = os.open(paths.LEDGER_LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(time.time()).encode())
            os.close(fd)
            return True
        except FileExistsError:
            # 기존 락이 TTL 지났으면 탈취
            try:
                age = time.time() - os.path.getmtime(paths.LEDGER_LOCK)
                if age > LOCK_TTL:
                    os.unlink(paths.LEDGER_LOCK)
                    continue
            except OSError:
                continue
            if time.time() > deadline:
                return False
            time.sleep(0.1)


def _release_lock() -> None:
    try:
        os.unlink(paths.LEDGER_LOCK)
    except OSError:
        pass


def _read_raw() -> dict:
    if not os.path.exists(paths.ACTIVE_JSON):
        return {"updated": "", "threads": []}
    try:
        with open(paths.ACTIVE_JSON, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {"updated": "", "threads": []}


def _write_atomic(data: dict) -> None:
    data["updated"] = _now()
    tmp = paths.ACTIVE_JSON + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, paths.ACTIVE_JSON)


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _alive(t: dict, now: float) -> bool:
    return t.get("lease_epoch", 0) + LEASE_SECONDS > now


# ---------------------------------------------------------------------------
# 공개 API
# ---------------------------------------------------------------------------
def active_threads(exclude_thread: str = "", include_dead: bool = False) -> "list[dict]":
    """살아있는(lease 유효) thread 목록. 락 불필요(읽기)."""
    now = time.time()
    out = []
    for t in _read_raw().get("threads", []):
        if t.get("thread_id") == exclude_thread:
            continue
        if include_dead or _alive(t, now):
            out.append(t)
    return out


def register(entry: dict) -> bool:
    """thread 시작 등록 (lease 부여). 동일 thread_id 있으면 갱신."""
    if not _acquire_lock():
        return False
    try:
        data = _read_raw()
        threads = [t for t in data.get("threads", []) if t.get("thread_id") != entry.get("thread_id")]
        entry["lease_epoch"] = time.time()
        entry.setdefault("started", _now())
        threads.append(entry)
        data["threads"] = threads
        _write_atomic(data)
        return True
    finally:
        _release_lock()


def heartbeat(thread_id: str, stage: str = "") -> bool:
    """lease 갱신 + stage 업데이트. 노드 전이/orchestrator 호출마다."""
    if not _acquire_lock():
        return False
    try:
        data = _read_raw()
        found = False
        for t in data.get("threads", []):
            if t.get("thread_id") == thread_id:
                t["lease_epoch"] = time.time()
                if stage:
                    t["stage"] = stage
                found = True
        if found:
            _write_atomic(data)
        return found
    finally:
        _release_lock()


def remove(thread_id: str) -> None:
    """thread 종료 — 엔트리 제거."""
    if not _acquire_lock():
        return
    try:
        data = _read_raw()
        data["threads"] = [t for t in data.get("threads", []) if t.get("thread_id") != thread_id]
        _write_atomic(data)
    finally:
        _release_lock()


def reap() -> "list[str]":
    """lease 만료된 죽은 thread 회수. 회수된 thread_id 목록 반환."""
    if not _acquire_lock():
        return []
    try:
        data = _read_raw()
        now = time.time()
        dead = [t["thread_id"] for t in data.get("threads", []) if not _alive(t, now)]
        if dead:
            data["threads"] = [t for t in data.get("threads", []) if _alive(t, now)]
            _write_atomic(data)
        return dead
    finally:
        _release_lock()


def scope_overlap(scope_paths: "list[str]", exclude_thread: str = "") -> "list[dict]":
    """내 scope 와 겹치는 활성 thread 목록 (각: {thread_id, area, axis, shared:[paths]})."""
    mine = set(os.path.normpath(p) for p in scope_paths)
    hits = []
    for t in active_threads(exclude_thread=exclude_thread):
        theirs = set(os.path.normpath(p) for p in t.get("scope_paths", []))
        shared = sorted(mine & theirs)
        if shared:
            hits.append({"thread_id": t.get("thread_id"), "area": t.get("area"),
                         "axis": t.get("axis"), "shared": shared})
    return hits


def ssot_overlap(ssot_refs: "list[str]", exclude_thread: str = "") -> "list[dict]":
    """같은 SSOT 정본을 동시 개정하려는 활성 thread (X.2 하드블록 근거)."""
    mine = set(os.path.normpath(p) for p in ssot_refs)
    hits = []
    for t in active_threads(exclude_thread=exclude_thread):
        theirs = set(os.path.normpath(p) for p in t.get("ssot_refs", []))
        shared = sorted(mine & theirs)
        if shared:
            hits.append({"thread_id": t.get("thread_id"), "area": t.get("area"), "shared": shared})
    return hits
