# Cycle 2 Answer — 보완 반영

> DESIGN.md v2 → v3. cycle_2_doubt.md 의 발견 반영. **cycle 1 수정이 만든 신규 결함**을 되돌린 것이 핵심.

## 반영 완료

| 발견 | 조치 | 위치 |
|---|---|---|
| **[C1]** reducer 역설(`add(기존,[])=기존`) | **reducer 철회** — 게이트가 `prev + [new]` read-append-return(순차라 안전), reset_gates 가 `[]`/`""` 반환으로 비움 | §3, §5, §5.1 |
| **[C2]** evaluator view 가 삭제된 `f["diff"]` 참조 | apply 가 `changeset_diff`(통합 diff 텍스트) 생성, view 는 그걸 봄. ChangedFile 은 메타만 | §3, §5.1, §7.2 |
| **[C3]** reset 이 swap 해시 미초기화 | reset_gates 가 `validated_changeset_hash=""` 도 비움 | §4, §5.1 |
| **[C4]** `_PROTECTED` 가 복구를 막음 | workspace/base_ref 보호 해제(복구 위해), 검증결과 필드만 보호. apply 가 base_ref 재검증으로 위조 차단 | §8 |
| **[H1]** 워크트리 부재 복구 없음 | state(SSOT) 의 changed_files+base_ref 로 워크트리 재구성, apply 가 매 진입 검증 | §5.2 |
| **[H2]** 동시 resume 레이스 | thread 당 파일락(`.lock`), 2번째 resume 즉시 종료 | §5.2 |
| **[H3]** intake_review diff 수집 미명세 | `gh pr diff` / `git diff base...HEAD`, gh 부재 시 명확 에러(위장 금지), 200KB 상한 | §4 |
| **[H4]** T.2 evaluator 단일 의존 | **T.2a(결정론 auto)**: 코드 추가 시 test 파일 미변경=fail + **T.2b(needs_llm)**: 테스트 적절성. approved_human 으로만 우회 | §6 |
| **[H5]** `git diff base_ref` 가 신규 파일 누락 | apply 가 `git add -A` 후 `git diff --cached --name-only base_ref` 로 실측 | §5.1 |
| **[M1]** digest 모드변경 미구분/정규화 | digest 에 `mode` 포함, deleted/binary sentinel, apply 는 바이트 그대로 쓰기(정규화 금지) | §3 |
| **[M2]** force_publish 우회 우려 | 그래프가 항상 human_review 에서 멈추고 publish 가 pending⊆approved 별도 강제 → force 단독 우회 불가 명시 | §8 |
| **[M3]** 워크트리→메인 머지 절차 | 같은 .git 공유 → commit 객체 이미 존재, 메인에서 `git branch` 로 ref 생성, main 직접이동 금지, push/PR 은 H.2 | §5.2, §7.1 |
| **[M4]** approved_human 리셋 누락 | contract_checker 가 verdict 와 대칭으로 approved_human=[] 리셋(원본 79행) | §6 |
| **[M5]** 상한 도달 시 게이트 재실행 | 의도된 동작(마지막 산출물도 증거 갖춰 human_review)으로 명시, 선택적 최적화 언급 | §12 |
| **[L1]** ruff zero-config 미활용 | Phase 0 부터 lint 1개는 실제 강제 권장(빈 하네스 방지) | §13 |
| **[L2]** evidence reducid 문제 | C1 과 함께 reducer 철회로 동시 해결 | §3 |
| **[L3]** revision_round KeyError | 항상 `.get("revision_round", 0)` | §12 |
| **[L4]** checkpoints.db thread_id 충돌 | dev-harness 전용 `.checkpoints.db`(graph_pipeline 과 분리) | §12 |
| **[L5]** Phase 5 부트스트랩 역설 | 하네스 자체 테스트는 하네스 우회해 직접 작성 | §11 |

## cycle 2 가 cycle 1 회귀에 답한 것
- 워크트리 신규 결함(미해소였던 것) → §5.2 신설로 수명/동시성/머지 전부 규정
- changeset_digest(부분해소) → mode/sentinel/정규화금지로 완결
- intake_review(미해소) → 수집 방법 구체화
- skip 과다(악화) → T.2a 결정론 복원 + ruff Phase0 강제로 방어선 회복

## 다음 사이클(3)에서 볼 것
- §5.2 워크트리 재구성이 "state 가 SSOT" 라는데, drafter 가 **부분 diff**(전체 new_body 아님)를 inject 하면 재구성이 깨지지 않나 — new_body 전체 보관 강제가 일관적인지
- T.2a 의 "test 파일" 판별 기준(`test_*.py`/`*_test.py`/`tests/`)이 camping 에 맞는지, site/ JS 는?
- 파일락(`.lock`)이 비정상 종료 시 stale lock 으로 영구 잠김 — TTL/PID 검사 필요
- `gh pr diff` 가 review 그래프에만 있는데, feature/fix 도 "기존 PR 이어받기" 시나리오가 필요한지
- 이쯤에서 **과설계 여부 재점검** — camping 현실(테스트 0)에서 이 정교함이 ROI 가 있나, Phase 0 최소 버전(lint+diff_scope+evaluator 만)으로 먼저 가치 검증하는 게 맞지 않나
