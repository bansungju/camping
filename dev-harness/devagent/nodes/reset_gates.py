"""reset_gates — [cycle2 C1/C3] 매 라운드 게이트 누적/해시를 비운다.

reducer 를 안 쓰므로 `[]`/`""` 반환이 통째 교체로 깨끗이 비운다.
"""
from __future__ import annotations


def run(state) -> dict:
    return {
        "stage": "gates",
        "gate_results": [],
        "evidence": [],
        "validated_changeset_hash": "",
    }
