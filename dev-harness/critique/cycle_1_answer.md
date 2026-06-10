# Cycle 1 Answer — 보완 반영

> DESIGN.md v1 → v2. cycle_1_doubt.md 의 발견을 반영한 변경 요약.

## 반영 완료

| 발견 | 조치 | DESIGN.md 위치 |
|---|---|---|
| **[총평/H5]** apply 단계 부재 | `apply` 노드 신설 — changed_files 를 격리 git 워크트리에 쓰고 거기서 게이트 실행 | §4 토폴로지, §5.1 신설 |
| **[C1]** reducer 누락 | `gate_results`/`evidence` 를 `Annotated[list, operator.add]` 로 선언, `reset_gates` 노드가 매 라운드 비움 | §3, §4 |
| **[C2]** drafter interrupt 리셋 | code_drafter 는 changed_files 빌 때만 interrupt, revise 가 `[]` 로 리셋 | §4 |
| **[C3]** inject 보호 코드화 | `_PROTECTED` set 에 gate_results/evidence/workspace/base_ref 등 추가, 코드 레벨 강제 명시 | §8 |
| **[C4]** 해시 함수 미정의 | `changeset_digest()` 정의 — path 정렬 후 (path,status,new_body) SHA-256 | §3 |
| **[H1]** T.2 auto 불가 | T.2 를 needs_llm 으로 강등 + 휴리스틱 증거 보조, T.1 은 "존재 테스트만" auto | §5, §6 |
| **[H2]** revision_round 증가 누락 | revise 가 `{"revision_round": +1, "changed_files": []}` 반환 명시 | §4 |
| **[H3/L6]** review 가 publish 우회 | review 는 별도 그래프, publish 미경유 → END(리뷰결과만). intake_review 가 브랜치 diff 채움 | §4 |
| **[H4]** 재사용률 과장 | "코드 재사용 vs 패턴 재사용" 분리, 신규 코드가 절반 이상임을 명시 | §10 |
| **[M1]** scope 선언 신뢰 | gate_diff_scope 가 실제 `git diff --name-only base_ref` 로 실측 | §5.1 |
| **[M2]** async/sync 혼용 | ainvoke→AsyncSqliteSaver 규약 확정 | §12 |
| **[M4]** human_review 중복 | human_review 는 pass-through, 승인 검증은 publish 단독 | §12 |
| **[M5]** db 정리 없음 | publish/`--gc` 가 워크트리 remove + checkpoint 정리, thread 상한 | §12 |
| **[L1]** 병렬 충돌 | apply 전 `HEAD==base_ref` 확인, dirty tree 경고 | §5.1 |
| **[L2]** 바이너리/대용량 | is_binary skip, diff 파일당 상한 | §3, §12 |
| **[L3]** 롤백 | 워크트리 격리로 실패 시 버리면 그만, 메인 트리 무영향 | §5.1 |
| **[L4]** scope_paths 빈 경우 | `[]`=미확정 → gate_diff_scope fail(안전측) | §5.1 |
| **[L5]** langgraph 버전 | `>=0.2.40` 하한, Phase 0 검증 | §12 |
| **[L7]** CLAUDE.md 강제력 | §13 에 "추가 권장"으로 격상 (여전히 사용자 결정) | §13 |

## 보류 (사용자 결정 사항, §13)
- CLAUDE.md 실제 추가 여부
- 게이트 도구 실제 설정 vs skip-정책 시작
- review-first Phase 순서

## 다음 사이클(2)에서 볼 것
- apply/워크트리 모델이 도입한 **새로운 결함**(워크트리 동시성, git worktree 와 langgraph thread 의
  수명 불일치, 메인↔워크트리 머지 충돌)
- changeset_digest 가 new_body 만 보는데 deleted 파일/파일모드 변경을 놓치는지
- review 그래프의 intake_review 가 PR diff 를 어떻게 가져오는지(gh CLI 의존)
- 게이트 skip 이 너무 많아 사실상 "통과만 하는" 빈 하네스가 되는지 (camping 현실)
