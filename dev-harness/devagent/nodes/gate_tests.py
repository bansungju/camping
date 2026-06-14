"""gate_tests — T.1(존재 테스트 통과) + T.2a(feature: 코드추가 시 test 동반, 결정론) + T.3(refactor 보존).

[cycle2 H1] "pytest 미설치"와 "테스트 0건"을 구분: 도구 부재 → skip. 도구 있고 테스트 0건 → skip.
T.2a 는 diff 수준 결정론 — 비-test .py 가 추가/수정됐는데 test 파일은 하나도 안 건드렸으면 fail.
"""
from __future__ import annotations

import re

from ._util import changed_paths, has_tool, run_tool, workdir

# M-460: 파이썬(pytest) 네이밍에 더해 프론트(JS/TS) 테스트 패턴(*.test/*.spec.[jt]sx, __tests__/)도 인식.
_TEST_RE = re.compile(
    r"(^|/)(test_[^/]+\.py|[^/]+_test\.py)$"
    r"|(^|/)tests?/"
    r"|[^/]+\.(?:test|spec)\.[jt]sx?$"
    r"|(^|/)__tests__/")


def _is_test_file(p: str) -> bool:
    return bool(_TEST_RE.search(p))


def run(state) -> dict:
    axis = state.get("axis", "data")
    kind = state.get("request_kind", "feature")
    wt = workdir(state)
    changed = changed_paths(state)
    results = []

    # ---- T.2a: feature 결정론 — 코드 추가 ↔ 테스트 동반 ----
    if kind == "feature":
        # M-459: frontend feature는 코드가 .js/.ts라 `.py` 고정 필터로는 코드변경을 못 잡아 T.2a가
        #   무조건 통과했다 → 축별로 코드 확장자를 분기.
        code_exts = (".js", ".ts", ".jsx", ".tsx") if axis == "frontend" else (".py",)
        code_files = [p for p in changed if p.endswith(code_exts) and not _is_test_file(p)]
        test_files = [p for p in changed if _is_test_file(p)]
        if code_files and not test_files:
            results.append({"gate": "tests", "status": "fail", "contract_id": "T.2a",
                            "cmd": "test-accompaniment check",
                            "output": f"신규/수정 코드 {code_files} 에 대한 test 파일 변경 없음"})
        else:
            results.append({"gate": "tests", "status": "pass", "contract_id": "T.2a",
                            "cmd": "test-accompaniment check",
                            "output": "" if not code_files else f"test 동반: {test_files}"})

    # ---- T.1 / T.3: 실제 테스트 실행 ----
    if axis == "frontend":
        tool = ["npm", "test", "--silent"]
        runner_present = has_tool("npm")
    else:
        tool = ["python3", "-m", "pytest", "-q"]
        # [cycle3 C2] python3 만 있고 pytest 모듈이 없으면 "No module named pytest" → fail 로 오판되어
        # 모든 작업이 revise 루프에 갇힌다. pytest 모듈 임포트 가능 여부로 판정.
        runner_present = _pytest_importable()

    cid = "T.3" if kind == "refactor" else "T.1"
    if not runner_present:
        results.append({"gate": "tests", "status": "skip", "contract_id": cid,
                        "cmd": " ".join(tool), "output": "테스트 러너 미설치 — skip"})
    else:
        code, out = run_tool(tool, cwd=wt, timeout=300)
        if out == "__MISSING__":
            results.append({"gate": "tests", "status": "skip", "contract_id": cid,
                            "cmd": " ".join(tool), "output": "러너 미설치 — skip"})
        elif _no_tests_collected(out):
            results.append({"gate": "tests", "status": "skip", "contract_id": cid,
                            "cmd": " ".join(tool), "output": "수집된 테스트 0건 — skip"})
        else:
            results.append({"gate": "tests", "status": "pass" if code == 0 else "fail",
                            "contract_id": cid, "cmd": " ".join(tool),
                            "exit_code": code, "output": out})

    prev = state.get("gate_results", [])
    return {"stage": "gates", "gate_results": prev + results}


def _no_tests_collected(out: str) -> bool:
    o = out.lower()
    return "no tests ran" in o or "collected 0 items" in o


def _pytest_importable() -> bool:
    """pytest 모듈이 실제로 임포트 가능한지 (has_tool 만으로는 python3 존재로 오판)."""
    import importlib.util
    return importlib.util.find_spec("pytest") is not None
