"""devagent/router.py — 요청을 (area, axis, kind) 로 분류 (DESIGN.md §2, §17).

orchestrator 가 명시하면 1순위, 생략 시 이 함수들이 fallback. 모호하면 orchestrator 가 1질문으로 확정.
axis 는 §17.1 에 따라 경로 우선 — scope_paths 가 주어지면 그걸로, 없으면 요청 키워드로.
"""
from __future__ import annotations

import re

# ---- area (5개 SSOT 영역) ----
_AUTH_RE = re.compile(r"로그인|회원|가입|인증|세션|토큰|권한|oauth|login|signup|auth|session", re.I)
_FRONTEND_RE = re.compile(r"화면|ui|ux|컴포넌트|페이지|디자인|반응형|접근성|버튼|폼|레이아웃|css|html|프론트", re.I)
_BACKEND_RE = re.compile(r"api|엔드포인트|라우트|서버|미들웨어|핸들러|backend|서버사이드|rest", re.I)
_DATA_RE = re.compile(r"스키마|마이그레이션|집계|크롤|파이프라인|정합성|쿼리|테이블|db|데이터|schema|pipeline", re.I)
_DEVAGENT_RE = re.compile(r"하네스|게이트|계약|에이전트\s*설계|harness|devagent|dev-harness|contract", re.I)

# ---- kind ----
_REVIEW_RE = re.compile(r"리뷰|검토|review|살펴|점검", re.I)
_FIX_RE = re.compile(r"버그|고쳐|수정|fix|오류|에러|문제", re.I)
_REFACTOR_RE = re.compile(r"리팩터|리팩토링|정리|구조개선|refactor|cleanup", re.I)

# ---- axis 경로 신호 (§17.1) ----
_PATH_FRONTEND = re.compile(r"^(site/|.*\.(html|css)$|.*/sw\.js$|.*manifest)", re.I)
_PATH_BACKEND = re.compile(r"^(backend/|backend-plan/|.*/api/|.*/server/)", re.I)
_PATH_DATA = re.compile(r"^(pipeline/|.*\.sql$|.*\.db$|.*\.csv$|.*/seed_)", re.I)


def classify_area(request: str) -> str:
    """요청 → area. devagent > auth > (frontend/backend/data 는 강도순). 기본 data."""
    if _DEVAGENT_RE.search(request):
        return "devagent"
    if _AUTH_RE.search(request):
        return "auth"
    scores = {
        "frontend": len(_FRONTEND_RE.findall(request)),
        "backend": len(_BACKEND_RE.findall(request)),
        "data": len(_DATA_RE.findall(request)),
    }
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "data"


def classify_axis(request: str, scope_paths: "list[str] | None" = None) -> str:
    """축 판별 — [§17.1] 경로 우선. scope_paths 가 여러 축을 가리키면 'multi'.

    경로가 없으면(신규 작업) 키워드로 추정. auth/devagent 요청은 구현 축으로 환산
    (auth 는 횡단이라 키워드만으로는 backend 로 보수 추정 — orchestrator 가 확정 권장).
    """
    paths = scope_paths or []
    axes = set()
    for p in paths:
        if _PATH_FRONTEND.search(p):
            axes.add("frontend")
        elif _PATH_BACKEND.search(p):
            axes.add("backend")
        elif _PATH_DATA.search(p):
            axes.add("data")
    if len(axes) > 1:
        return "multi"
    if len(axes) == 1:
        return next(iter(axes))
    # 경로 미존재 → 키워드
    area = classify_area(request)
    if area in ("frontend", "backend", "data"):
        return area
    if area == "auth":
        return "backend"   # 보수적 — 세션/토큰이 핵심. orchestrator 가 frontend 면 재지정.
    return "data"


def classify_kind(request: str) -> str:
    """요청 → kind. review > fix > refactor > feature(기본)."""
    if _REVIEW_RE.search(request):
        return "review"
    if _FIX_RE.search(request):
        return "fix"
    if _REFACTOR_RE.search(request):
        return "refactor"
    return "feature"


def classify(request: str, scope_paths: "list[str] | None" = None) -> "dict[str, str]":
    """편의 — (area, axis, kind) 한 번에."""
    return {
        "area": classify_area(request),
        "axis": classify_axis(request, scope_paths),
        "kind": classify_kind(request),
    }
