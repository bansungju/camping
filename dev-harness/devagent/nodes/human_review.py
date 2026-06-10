"""human_review — [cycle2 M4] interrupt_before 멈춤 지점일 뿐 pass-through.

human 승인 강제(pending ⊆ approved, swap 해시, force_publish)는 전부 publish 가 한다.
그래프는 `interrupt_before=["human_review"]` 로 이 노드 직전에 멈춘다.
"""
from __future__ import annotations


def run(state) -> dict:
    return {"stage": "human_review"}
