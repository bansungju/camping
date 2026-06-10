# Cycle 3 Answer — 구현 코드 감사 반영 + 루프 종료

> cycle 3 는 설계가 아니라 **실제 코드**를 감사했다(구현이 생겼으므로). 진짜 런타임 버그를 잡았다.

## 즉시 반영 (CRITICAL)

| 발견 | 조치 | 위치 |
|---|---|---|
| **[C1]** apply 경로 탈출(`../../../`) | realpath 경계 검사 — 워크트리 밖 경로 거부 후 fail | `nodes/apply.py` |
| **[C2]** python3 있고 pytest 없으면 T.1 **fail** → 모든 작업 revise 루프 갇힘 | `_pytest_importable()`(importlib.find_spec)로 판정 → 미설치 시 skip | `nodes/gate_tests.py` |
| **[C3]** apply 가 surrogatepass 없이 write → 고립 서로게이트 시 크래시 + 해시 불일치 | write 에 `errors="surrogatepass"` (digest 와 동일 인코딩) | `nodes/apply.py` |

→ C2 는 camping 현실(pytest 미설치)에서 하네스를 **완전히 망가뜨리는** 버그였다. 검증: pytest 미임포트 시
T.1 skip 확인, 경로 탈출 거부 확인.

## 알려진 follow-up (다음에 쓰면서 수정)

- **[C4] swap 방어 한계:** `validated_changeset_hash = digest(changed_files)`(state 기준)라 publish 가
  같은 state 로 재계산하면 항상 일치 → human_review 이후 **워크트리 디스크를 직접 수정**한 경우는 못 잡는다.
  수정안: publish 가 commit 직전 changed_files 를 워크트리에 재적용(clean reset + write)해 "검증된 묶음"만
  커밋. (HIGH, 공격 벡터 좁아 즉시성 낮음.)
- **[HIGH] heartbeat 호출 부족:** 현재 apply 만 lease 갱신 → 긴 drafter/evaluator 단계(>5분)에서 lease
  만료 가능. orchestrator 의 `--inspect`/`--inject` 가 heartbeat 를 부르도록 추가 필요.
- **[HIGH] auth→axis=backend 강제:** 로그인 UI(frontend)가 backend 프로파일로 오라우팅. router 가
  auth 일 때 경로 신호로 axis 를 더 신뢰하거나 orchestrator 확정 강제.
- **[HIGH] `axis="multi"` 게이트 분기 없음:** gate_lint/typecheck/tests 가 multi 일 때 frontend 도구를
  안 돌린다(else 로 빠져 ruff/mypy/pytest 만). multi 는 축별로 도구를 모두 실행하도록 분기 필요.

## 과설계 평가 (사용자 핵심 질문)

28개 .py 중 camping 현 시점 즉효 가치는 ~17개. **Phase 0 최소버전 권고:**
`intake → code_drafter → apply → gate_diff_scope → gate_scope_overlap → gate_lint → contract_checker
→ evaluator → human_review → publish` (9~10 노드). gate_ssot/typecheck/tests, evidence_collector,
progress 는 registry·테스트·도구가 정비된 뒤 켠다. 핵심 가치(격리 변경 + scope/시크릿 가드 + 격리 리뷰
+ 안전 commit + 다중세션 인지)는 이 최소셋으로 이미 작동한다.

## 수렴 판정 + 루프 종료

cycle 1(설계 4C/5H) → cycle 2(설계 4C/5H, cycle1 회귀 수정) → cycle 3(**코드** 4C/4H). 비평이 설계
→ 구현으로 옮겨가며 계속 가치를 냈다. 그러나 이제 **구현이 존재하고 e2e 가 돌며**, 사용자가 "쓰면서
바꿔가게"로 전환했다. 남은 것은 실사용 중 발견·수정할 점진 항목(위 follow-up). **10분 주기 자동 비평
루프는 여기서 종료**한다(다음 사이클 미예약). 추가 감사가 필요하면 수동으로 cycle 4 를 호출.
