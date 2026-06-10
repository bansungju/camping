"""revise — [cycle1 C2/H2] drafter 재진입 전 changed_files 비우고 round+1.

비워야 code_drafter 가 다음 라운드에 interrupt 를 다시 발화한다(이미 결과 있다고 통과 안 함).
evaluator_notes 는 보존 — drafter 프롬프트의 피드백으로 쓰인다.
"""
from __future__ import annotations


def run(state) -> dict:
    return {
        "stage": "revise",
        "changed_files": [],
        "revision_round": state.get("revision_round", 0) + 1,
    }
