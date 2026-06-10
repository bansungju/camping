# Cycle 1 Doubt — 설계 적대적 검토

> 검토자: sonnet 서브에이전트 (2026-06-10). 대상: dev-harness/DESIGN.md v1.

## CRITICAL (설계가 동작 안 하거나 안전장치가 뚫림)

- **[C1] `gate_results` 누적 reducer 선언이 DevState 정의에 없다 — 게이트 결과 유실:** §5 주석은 `Annotated[list[GateResult], operator.add]` 가 필요하다고 했으나 §3 정의는 `gate_results: list[GateResult]` 평범한 list. reducer 없이는 각 게이트 반환이 이전 게이트 결과를 통째로 덮어써서 contract_checker 가 마지막 게이트만 본다. `evidence` 도 동일.

- **[C2] code_drafter interrupt 리셋 메커니즘 부재 — revise 2라운드부터 interrupt 미발화:** evaluator 는 contract_checker 가 `evaluator_verdict=""` 로 리셋해줘서 매 라운드 interrupt 가 발화한다. 그런데 code_drafter 에는 대응 리셋이 없다 — revise 재진입 시 이전 `changed_files` 가 남아있어 drafter 가 "이미 결과 있음"으로 보고 interrupt 없이 통과. revise 가 `changed_files` 를 비워야 함이 명시 안 됨.

- **[C3] `gate_results` 가 `--inject` 보호 필드에 코드로 강제되지 않음:** §8 문서엔 보호 목록에 있으나, 원본 `_PROTECTED` 집합에 `gate_results` 가 없다(원본엔 그 필드 자체가 없음). 문서 명세만 의존하면 `gate_results` 에 가짜 pass 를 직접 주입해 테스트 실패 위장 가능. 보호 집합은 CLI 코드의 경직된 set 이어야 함.

- **[C4] `validated_changeset_hash` 계산 함수 미정의 — 정상 배포 항상 거부 또는 우회:** 파일 순서/정렬/diff vs new_body/삭제파일 처리 미명시. contract_checker 와 publish 가 서로 다른 해시를 계산하면 정상 배포가 거부되거나, 순서만 바꿔 우회 가능.

## HIGH (큰 결함이나 과장)

- **[H1] T.2 "신규 코드 테스트 동반" auto 판정 불가:** "pytest 미설치"와 "테스트 0건"을 subprocess 로 구분 불가. "어떤 함수를 테스트하는가"는 AST+커버리지 매핑 필요 — 결정론적 py auto 로는 불가능. 과대 주장.

- **[H2] `revision_round += 1` 담당 노드 미명시 — 무한루프 위험:** 분기 함수는 읽기만 함. revise 가 `{"revision_round": +1}` 반환한다는 명세 없음. 증가 누락 시 상한 5 영원히 미도달.

- **[H3] `review` kind 가 publish 공유 시 human 승인 우회:** review 경로가 contract_checks 를 안 채우면 pending_human_approvals 도 비어 H.1/H.2 우회. review 는 publish 로 가면 안 됨 (자체 END 필요).

- **[H4] §10 "80~90% 재사용" 과장:** SqlAnalysisState→DevState 는 필드명 변경이 아니라 의미구조 교체(SqlArtifact→changed_files, Violation→GateResult). 실제 재사용은 route 함수 2개·CLI 골격·interrupt 패턴 정도. contract_checker 도 입력구조(violations→gate exit code)가 달라 실질 30% 이하.

- **[H5] (실질 CRITICAL) drafter 가 inject 한 changed_files 를 실제 파일에 쓰는 단계 부재:** 게이트는 `subprocess.run(["ruff", ...])` 로 디스크 파일을 읽는데, changed_files 는 state 메타데이터일 뿐. apply 단계 없으면 게이트가 변경 전 디스크를 검사 → 안전장치 전체 무력화.

## MEDIUM

- **[M1] gate_diff_scope 가 선언된 path 만 믿음:** apply 후 실제 `git diff --name-only` 로 검증 안 하면 형식적. drafter 가 scope 밖 파일을 몰래 쓸 수 있음.
- **[M2] SqliteSaver 동기/비동기 혼용 미명시:** 원본은 ainvoke↔AsyncSqliteSaver 상세 주석 보유. camping CLI async/sync 결정 필요.
- **[M3] evaluator view vs drafter prompt 혼동:** §7.1 "evaluator_notes 를 drafter 피드백에 포함" ↔ §7.2 "view 는 미노출" — 두 경로가 별개임을 명확히 분리해야.
- **[M4] human_review 노드 역할 vs publish 중복:** human 승인 강제가 human_review 인지 publish 인지 중복·모순.
- **[M5] .checkpoints.db 정리 정책 전무:** TTL/thread 만료/최대수 없음 — db 무한 증가.

## LOW / 누락

- [L1] 병렬 변경 충돌(사람 직접 수정 + 하네스 동시) 처리 없음 — dirty tree 감지/stash.
- [L2] 대용량 diff·바이너리(site/ PNG 등) 처리 — diff 크기 상한·바이너리 skip.
- [L3] publish 중간 실패 시 롤백(`git reset`/`checkout`) 없음 — 실파일 수정이라 위험 큼.
- [L4] scope_paths 빈 경우 동작 미정의 (전부 fail? 전부 허용?).
- [L5] pipeline/graph_pipeline.py 와 langgraph 버전 충돌 위험 (0.2 vs 0.3 interrupt API).
- [L6] review kind 의 리뷰 대상(브랜치/PR diff)을 state 에 어떻게 채우는지 미정의.
- [L7] CLAUDE.md 연동이 §12 미해결로 남아 orchestrator 규약 강제력 없음.

## 한 줄 총평

changed_files 를 state 에만 주입하고 실제 파일시스템에 반영하는 단계가 없어, lint·typecheck·test 게이트가 변경 전 디스크 상태를 검사하게 되므로 설계의 핵심 안전장치 전체가 작동하지 않는다.
