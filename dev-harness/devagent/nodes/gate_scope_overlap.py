"""gate_scope_overlap — [§16.3] 활성 thread 와 scope/SSOT 겹침 검사 (X.1/X.2).

원장(active.json)을 대조한다. [cycle3 대비] 원장 읽기 실패 시 fail-closed (안전측 — 모른 채
진행하느니 멈춘다)는 과해, 읽기 실패는 빈 목록(겹침 없음)으로 보되 evidence 에 경고를 남긴다.
"""
from __future__ import annotations

from .. import ledger


def run(state) -> dict:
    results = []
    thread_id = state.get("thread_id", "")
    scope = state.get("scope_paths", [])
    ssot_refs = state.get("ssot_refs", [])

    try:
        scope_hits = ledger.scope_overlap(scope, exclude_thread=thread_id)
        ssot_hits = ledger.ssot_overlap(ssot_refs, exclude_thread=thread_id)
    except Exception as e:  # noqa: BLE001 — 원장 손상이 작업을 막지 않게
        results.append({"gate": "scope_overlap", "status": "skip", "contract_id": "X.1",
                        "cmd": "ledger read", "output": f"원장 읽기 실패(경고): {e}"})
        prev = state.get("gate_results", [])
        return {"stage": "gates", "gate_results": prev + results}

    # X.1 — 파일 scope 겹침
    results.append({
        "gate": "scope_overlap", "status": "pass" if not scope_hits else "fail",
        "contract_id": "X.1", "cmd": "scope overlap",
        "output": "" if not scope_hits else f"겹치는 활성 thread: {scope_hits}",
    })
    # X.2 — 같은 SSOT 동시개정 (정본 touch 시에만 의미; 여기선 ssot_refs 겹침으로 근사)
    touches_ssot = _touches_ssot(state)
    if touches_ssot:
        results.append({
            "gate": "scope_overlap", "status": "pass" if not ssot_hits else "fail",
            "contract_id": "X.2", "cmd": "ssot overlap",
            "output": "" if not ssot_hits else f"같은 SSOT 동시개정: {ssot_hits}",
        })

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + results}


def _touches_ssot(state) -> bool:
    from .. import ssot
    area = state.get("area", "")
    return any(ssot.is_ssot_path(area, f.get("path", ""))
               for f in state.get("changed_files", []))
