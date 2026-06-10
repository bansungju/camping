"""devagent/contract.py — Default-FAIL 개발 계약 레지스트리 (DESIGN.md §6, §14, §16, §17).

각 항목은 auto(게이트 자동) / needs_llm(evaluator) / human(사용자 승인) 카테고리.
contract_checker 가 게이트 결과를 이 레지스트리에 매핑해 ContractCheck 를 만든다.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ContractItem:
    id: str
    label: str
    category: str                       # "auto" | "needs_llm" | "human"
    gate: str = ""                      # 이 항목을 충족하는 게이트 이름 (auto 만)
    kinds: tuple = ()                   # 빈 튜플 = 전체 kind 적용
    cond: str = ""                      # 조건부 적용 신호: "" | "ssot_touch" | "deploy"


# 순서 = 표시 순서. (DESIGN.md §6 표)
REGISTRY: "list[ContractItem]" = [
    ContractItem("S.1", "diff 가 scope_paths 범위 내", "auto", gate="diff_scope"),
    ContractItem("S.2", "시크릿(.env/key/token) 미포함", "auto", gate="diff_scope"),
    ContractItem("X.1", "활성 thread 와 scope 파일 미겹침", "auto", gate="scope_overlap"),
    ContractItem("X.2", "활성 thread 와 같은 SSOT 동시개정 아님", "auto", gate="scope_overlap", cond="ssot_touch"),
    ContractItem("K.1", "변경이 해당 area SSOT 와 모순 없음", "needs_llm", gate="ssot"),
    ContractItem("K.2", "SSOT 문서 자체를 바꾸면 사용자 승인", "human", gate="ssot", cond="ssot_touch"),
    ContractItem("L.1", "린트 통과 (또는 도구 부재 skip)", "auto", gate="lint"),
    ContractItem("Y.1", "타입체크 통과 (또는 skip)", "auto", gate="typecheck"),
    ContractItem("T.1", "존재하는 테스트 전건 통과 (없으면 skip)", "auto", gate="tests"),
    ContractItem("T.2a", "코드 추가 시 test 파일도 변경됨", "auto", gate="tests", kinds=("feature",)),
    ContractItem("T.2b", "그 테스트가 실제로 신규 동작을 검증", "needs_llm", kinds=("feature",)),
    ContractItem("T.3", "기존 테스트 그대로 통과(동작 보존)", "auto", gate="tests", kinds=("refactor",)),
    ContractItem("R.1", "정확성·엣지케이스 (격리 리뷰)", "needs_llm"),
    ContractItem("R.2", "보안·입력검증 (격리 리뷰)", "needs_llm"),
    ContractItem("R.3", "변경이 요청 의도와 일치", "needs_llm"),
    ContractItem("H.1", "DB 마이그레이션/파괴적 스키마 변경 승인", "human", cond="schema_change"),
    ContractItem("H.2", "외부 배포(site export/push) 승인", "human", cond="deploy"),
]

REGISTRY_BY_ID = {item.id: item for item in REGISTRY}


def applicable(item: ContractItem, kind: str, *, ssot_touch: bool = False,
               schema_change: bool = False, deploy: bool = False) -> bool:
    """이 계약이 현재 요청에 적용되는지."""
    if item.kinds and kind not in item.kinds:
        return False
    if item.cond == "ssot_touch" and not ssot_touch:
        return False
    if item.cond == "schema_change" and not schema_change:
        return False
    if item.cond == "deploy":
        # deploy 는 publish 단계 신호 — 평소엔 미적용(human_review/publish 에서 별도 처리)
        return deploy
    return True


def summary_counts() -> "dict[str, int]":
    """카테고리별 항목 수 — 정본 카운트."""
    out = {"auto": 0, "needs_llm": 0, "human": 0}
    for item in REGISTRY:
        out[item.category] = out.get(item.category, 0) + 1
    return out
