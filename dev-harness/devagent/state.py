"""devagent/state.py — 그래프 공유 상태 (DESIGN.md §3).

모든 노드 시그니처는 `(state: DevState) -> dict` (LangGraph 관례 — 부분 업데이트만 반환).
[cycle2 C1] 누적 리스트(gate_results/evidence)에 reducer 를 쓰지 않는다 — 게이트는 순차 실행이라
각 노드가 `prev + [new]` 를 반환(통째 교체 = append 효과)하고, reset_gates 가 `[]` 로 비운다.
"""
from __future__ import annotations

import hashlib
from typing import Any, Literal, TypedDict


Area = Literal["auth", "frontend", "backend", "devagent", "data"]   # §2.1 5개 SSOT 영역
Axis = Literal["frontend", "backend", "data", "multi"]              # §17 작동 프로파일 선택자
RequestKind = Literal["feature", "fix", "refactor", "review"]       # §2.2 변경 종류

Stage = Literal[
    "intake", "draft", "apply", "gates", "evidence", "contract",
    "evaluator", "revise", "human_review", "done",
]
Verdict = Literal["", "PASS", "NEEDS_WORK"]

REVISION_ROUND_LIMIT = 5
"""revise 무한루프 차단 → 도달 시 어디서든 human_review."""


class ChangedFile(TypedDict, total=False):
    path: str
    status: Literal["added", "modified", "deleted"]
    new_body: str            # added/modified 의 변경 후 전체 본문 — apply 가 바이트 그대로 씀
    is_binary: bool          # True 면 new_body 미보관·게이트 skip
    mode: str                # "100644" / "100755" — digest 가 모드변경 구분


class GateResult(TypedDict, total=False):
    gate: str                # "diff_scope" | "scope_overlap" | "ssot" | "lint" | "typecheck" | "tests"
    status: Literal["pass", "fail", "skip"]
    cmd: str
    exit_code: int
    output: str
    contract_id: str         # 이 게이트가 충족/위반하는 계약 id (있으면)


class ContractCheck(TypedDict, total=False):
    id: str
    label: str
    status: Literal["pass", "fail", "needs_llm", "needs_human"]
    auto: bool
    evidence_ref: str


class DevState(TypedDict, total=False):
    # 입력
    request: str
    area: Area
    axis: Axis
    request_kind: RequestKind
    scope_paths: list[str]               # [] = 미확정 → diff_scope fail
    base_ref: str
    ssot_refs: list[str]

    # 산출물
    changed_files: list[ChangedFile]
    workspace: str
    changeset_diff: str

    # 진행
    stage: Stage
    revision_round: int

    # 검증 (reducer 없음 — 순차 append, reset_gates 가 비움)
    gate_results: list[GateResult]
    evidence: list[GateResult]
    contract_checks: list[ContractCheck]

    # Evaluator
    evaluator_verdict: Verdict
    evaluator_notes: list[str]

    # 사람 명시 승인
    pending_human_approvals: list[str]
    approved_human: list[str]

    # post-gate swap 탐지
    validated_changeset_hash: str

    # 배포 제어
    force_publish: bool

    # 메타
    thread_id: str
    session_id: str
    messages: list[Any]


def initial_state(
    request: str,
    area: str = "data",
    axis: str = "data",
    kind: str = "feature",
    scope_paths: "list[str] | None" = None,
    base_ref: str = "",
    thread_id: str = "",
    session_id: str = "",
) -> DevState:
    """그래프 invoke 시 첫 state. TypedDict 는 런타임 강제가 없어 문자열을 그대로 흘려보낸다."""
    return DevState(
        request=request,
        area=area,                       # type: ignore[typeddict-item]
        axis=axis,                       # type: ignore[typeddict-item]
        request_kind=kind,               # type: ignore[typeddict-item]
        scope_paths=list(scope_paths or []),
        base_ref=base_ref,
        ssot_refs=[],
        changed_files=[],
        workspace="",
        changeset_diff="",
        stage="intake",
        revision_round=0,
        gate_results=[],
        evidence=[],
        contract_checks=[],
        evaluator_verdict="",
        evaluator_notes=[],
        pending_human_approvals=[],
        approved_human=[],
        validated_changeset_hash="",
        force_publish=False,
        thread_id=thread_id,
        session_id=session_id,
        messages=[],
    )


def changeset_digest(changed_files: "list[ChangedFile] | None") -> str:
    """[cycle1 C4 / cycle2 M1] 변경 묶음의 결정론적 해시 — post-gate swap 탐지.

    path 로 정렬 후 (path, status, mode, body) 직렬화. deleted/binary 는 sentinel.
    surrogatepass — 고립 서로게이트 inject 시 UnicodeEncodeError 로 노드가 죽는 것 방지.
    """
    files = changed_files or []
    parts = []
    for f in sorted(files, key=lambda x: x.get("path", "")):
        status = f.get("status", "")
        if status == "deleted":
            body = "\x02DELETED"
        elif f.get("is_binary"):
            body = "\x02BINARY"
        else:
            body = f.get("new_body", "")
        parts.append(f"{f.get('path','')}\x00{status}\x00{f.get('mode','')}\x00{body}")
    blob = "\x01".join(parts)
    return hashlib.sha256(blob.encode("utf-8", errors="surrogatepass")).hexdigest()
