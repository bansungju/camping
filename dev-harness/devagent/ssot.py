"""devagent/ssot.py — SSOT 레지스트리 로드 + ssot_rev (DESIGN.md §14).

registry.yaml 이 영역별 정본(canonical) 1개 + 파생(derived) 을 매핑한다.
정본이 SSOT, 나머지는 그것을 따른다. devagent 영역의 정본은 DESIGN.md 자신.
"""
from __future__ import annotations

import hashlib
import os

from . import paths


def load_registry() -> dict:
    """registry.yaml 로드. 없으면 빈 dict."""
    try:
        import yaml
    except ImportError:
        return {}
    if not os.path.exists(paths.SSOT_REGISTRY):
        return {}
    with open(paths.SSOT_REGISTRY, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def canonical_for(area: str) -> str:
    """area 의 정본 SSOT 경로(레포 상대). 없으면 빈 문자열."""
    reg = load_registry()
    entry = reg.get(area) or {}
    return entry.get("canonical", "")


def refs_for(area: str) -> "list[str]":
    """area 의 정본 경로를 리스트로 (intake 가 ssot_refs 에 채움). 정본 1개만."""
    canon = canonical_for(area)
    return [canon] if canon else []


def read_ssot_body(area: str) -> str:
    """area 정본 SSOT 의 본문 (drafter 컨텍스트 / evaluator view 용). 없으면 안내문."""
    canon = canonical_for(area)
    if not canon:
        return f"(area '{area}' 의 SSOT 정본이 아직 비어 있음 — 첫 변경이 정본을 만든다)"
    full = os.path.join(paths.REPO_ROOT, canon)
    if not os.path.exists(full):
        return f"(SSOT 경로 '{canon}' 파일 없음 — registry.yaml 확인 필요)"
    with open(full, encoding="utf-8") as f:
        return f.read()


def ssot_rev(area: str) -> str:
    """정본 SSOT 의 짧은 콘텐츠 해시 — state.json 의 버전 추적용. 빈 정본은 '—'."""
    canon = canonical_for(area)
    if not canon:
        return "—"
    full = os.path.join(paths.REPO_ROOT, canon)
    if not os.path.exists(full):
        return "—"
    with open(full, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()[:8]


def is_ssot_path(area: str, path: str) -> bool:
    """주어진 변경 경로가 이 area 의 정본 SSOT 자체인지 (K.2 트리거)."""
    canon = canonical_for(area)
    return bool(canon) and os.path.normpath(path) == os.path.normpath(canon)
