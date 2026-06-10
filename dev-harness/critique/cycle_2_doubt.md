# Cycle 2 Doubt — 설계 적대적 검토 (v2)

## CRITICAL

- [C1] **`reset_gates` 의 `[]` 반환은 LangGraph reducer 구조상 **절대 비워지지 않는다**:**  
  §3은 `gate_results`를 `Annotated[list[GateResult], operator.add]`로 선언했다. LangGraph는 reducer가 걸린 필드에 노드 반환값을 `operator.add(기존, 새값)`으로 병합하므로, `reset_gates`가 `{"gate_results": []}`를 반환하면 `기존 + [] = 기존`이 되어 기존 항목이 그대로 남는다. 즉 §4의 "매 라운드 apply 직후 reset_gates가 [] 로 비움" 기술은 reducer와 모순이다. 원본 `SqlAnalysisState`에는 `gate_results` 같은 누적 reducer 필드가 없으므로 원본에서 이 패턴을 학습할 수도 없다. 비우려면 `Annotated` 없는 일반 list로 선언하고 게이트 노드들이 매번 append가 아닌 단일 항목 반환 후 `contract_checker`가 state 전체를 읽는 방식으로 바꾸거나, 또는 LangGraph의 `Command(update={...})` API에서 `Annotated` 필드를 직접 교체하는 별도 방법을 써야 한다. 이 결함이 있는 한 revision 2라운드부터 `gate_results`에는 모든 라운드 결과가 누적되어 `contract_checker`가 "이미 통과한 구버전 게이트 결과"를 1라운드 것으로 착각하고 pass 판정을 내릴 수 있다.  
  제안: `gate_results`를 reducer 없는 일반 list로 선언하고, `apply` 노드가 `{"gate_results": [], "evidence": []}` 로 통째 초기화하도록 변경. 게이트 노드는 단일 `GateResult`가 아닌 완전한 list를 반환.

- [C2] **`_evaluator_view` 가 존재하지 않는 `f["diff"]` 필드를 참조한다:**  
  §7.2의 코드 스니펫에서 `_evaluator_view`가 `f["diff"]`를 직렬화한다. 그런데 §3의 `ChangedFile` TypedDict에는 `diff` 필드가 없다 — `new_body` 만 있다. cycle 1에서 "diff 필드는 보관하지 않는다 — new_body + git diff (apply 후 디스크 기준)로 충분"이라고 명시적으로 삭제했는데, evaluator view 코드는 그대로 `diff`를 쓴다. 결과: evaluator가 받는 뷰에 모든 파일이 `"diff": None`(또는 KeyError)으로 보여 코드 내용을 전혀 못 본다. fresh-context 코드리뷰가 빈 데이터로 동작하는 셈 — 안전장치 2번이 무력화된다.  
  제안: `_evaluator_view` 코드를 `new_body`(또는 `apply` 후 `git diff base_ref -- path` 실행 결과)로 교체.

- [C3] **`reset_gates`는 `gate_results`/`evidence` 이외에 `validated_changeset_hash`도 비워야 하는데 명세 없음 — post-gate swap 방어가 라운드 간 오염된다:**  
  revise → code_drafter 루프 후 2라운드 apply가 실행되면 새 `changed_files`가 들어온다. 그런데 1라운드 `contract_checker`가 기록한 `validated_changeset_hash`는 1라운드 스냅샷이다. 2라운드 게이트가 시작되기 전 이 해시가 남아있는 상태에서 만약 무언가 오류로 `contract_checker`가 실행되지 않거나 중간에 interrupt가 걸리면, publish는 2라운드 `changed_files`와 1라운드 해시를 대조해 항상 "swap 탐지" 오류를 낸다. 반대로 `contract_checker`가 정상 실행된다면 덮어쓰므로 정상이지만, apply/reset_gates가 hash를 초기화하지 않는다는 것은 reset 단계가 불완전함을 의미한다. §12 `reset_gates` 노드 설계에 명시가 없다.

- [C4] **`_PROTECTED` 집합이 원본 실제 코드와 v2 설계 사이에서 불일치하며, `gate_results`/`evidence`가 원본에 없어 보호 필드로 등록하는 구현 근거가 없다:**  
  원본 `__main__.py` 447행 `_PROTECTED`를 확인하면: `{"violations", "contract_checks", "revision_round", "contract_status", "pending_human_approvals", "validated_artifact_hash"}`. `gate_results`/`evidence`/`workspace`/`base_ref`는 없다 — 원본에 해당 필드 자체가 없기 때문이다. v2 §8은 "원본 `__main__.py` 447행 패턴"이라고 근거를 댔는데, 원본 패턴에는 `gate_results` 보호가 없다. 즉 "원본을 그대로 이식"하면 `gate_results`/`workspace`/`base_ref`는 보호되지 않는다. 신규 추가임을 명시하지 않고 원본 근거를 댄 것이 오해를 유발한다. 또한 `workspace` 필드는 `_PROTECTED`에 넣으면 `apply` 노드가 최초로 워크트리를 생성하고 state에 기록할 때도 주입이 막혀 resume 재사용이 불가해진다 — apply 노드 반환은 괜찮지만, orchestrator가 수동으로 워크트리 경로를 교정하는 복구 흐름이 원천 차단된다.

## HIGH

- [H1] **워크트리 수명과 LangGraph checkpoint(thread) 수명이 불일치한다 — resume 시 워크트리 부재:**  
  LangGraph checkpoint는 state 딕셔너리를 SQLite에 저장하지만, `.dev-harness-wt/<thread>` 디렉토리(디스크 git worktree)는 checkpoint와 무관하게 존재한다. §12 `--gc`가 "publish 또는 명시적 --gc" 시 워크트리를 제거한다고 했는데: (a) publish 전에 시스템 재시작, (b) 사용자가 수동으로 디렉토리 삭제, (c) OS가 `/tmp` 아래 배치했을 때 재부팅 후 소멸 — 이 경우 `--resume`으로 thread를 재개하면 `apply`가 "있으면 재사용"을 시도하는데 `git worktree add` 실패(동일 경로 이미 등록 또는 경로 없음), 또는 워크트리가 전혀 없어 게이트가 빈 디렉토리를 검사한다. state의 `workspace` 경로는 있으나 디스크엔 없는 상태에서 어느 노드가 복구 책임을 지는지 명세 없음. `apply`가 "있으면 재사용" 분기에서 실제로 내용이 있는지 검증하는 단계가 없다.  
  제안: apply 노드가 워크트리 재사용 전 `git diff --stat` 등으로 내용 검증. 불일치 시 워크트리를 재구성(remove + re-add + changed_files 재적용). 이 복구 로직이 없으면 resume 경로는 신뢰 불가.

- [H2] **두 thread가 동시에 같은 `base_ref` 워크트리 경로를 생성하려 할 때 충돌 처리 없음:**  
  `.dev-harness-wt/<thread>` 경로는 thread_id 기반이라 서로 다르다 — 이건 맞다. 그런데 `git worktree add`는 동일 commit(base_ref)에 여러 워크트리를 만들 수 있지만, **동일 경로**에 두 번 add하면 실패한다. 문제는 thread_id 생성 방식이 `_make_thread_id` 기반으로 "타임스탬프_슬러그"인데, 짧은 시간 간격에 같은 요청을 두 번 날리면 충돌 가능성이 있다. 더 심각한 건: 캠핑은 single-user 환경이더라도, 동일 thread를 두 터미널 탭에서 동시에 `--resume`하면 두 프로세스가 같은 워크트리에서 동시에 파일을 쓰고 게이트를 실행한다. LangGraph checkpoint의 낙관적 동시성 제어가 state 레벨에서는 작동하지만, 디스크 워크트리에는 그 보호가 없다.

- [H3] **`review` 그래프의 `intake_review`가 diff를 가져오는 방법이 미정의 — gh CLI 의존 + 대용량 PR 처리 없음:**  
  §4에서 "intake_review(현재 브랜치/PR diff를 `changed_files`에 read-only로 채움)"이라고 했으나, 구체적인 구현이 없다. `git diff origin/main...HEAD`인지 `gh pr diff`인지, gh CLI 미설치/미인증 시 처리, PR 번호가 없으면(로컬 브랜치 비교) 어떻게 되는지 미명세. 특히 대용량 PR에서 수천 줄 diff를 `changed_files[*].new_body`에 담으면 state 비대화 문제(§12 `is_binary` 상한 도입 이유와 동일)가 review 그래프에서 재발한다. `changed_files`의 파일당 200KB 상한이 review 그래프에서도 동일하게 적용되는지 명세 없음.

- [H4] **T.2 `needs_llm` 강등이 "신규 기능 테스트 없음" 유일 방어선을 evaluator 하나로 축소시켰는데, camping 현실에서 evaluator가 PASS를 주면 무조건 통과한다:**  
  cycle 1 보완으로 T.2를 결정론적 auto에서 needs_llm(evaluator 판정)으로 낮췄다. 그런데 R.1/R.2/R.3 역시 전부 needs_llm이다. 즉 camping의 pytest가 없는 상태에서 feature kind 변경이 오면: T.1=skip, T.2=needs_llm, R.1/R.2/R.3=needs_llm — 모든 실질적 검증이 evaluator 단일 LLM으로 수렴한다. 이 evaluator는 `allowed_tools=[]`인 read-only subagent이며, drafter와 **다른 Task subagent**라는 점만 보장한다. orchestrator(= Claude Code) 세션 자신이 evaluator에게 "잘 짜진 코드니까 PASS"를 유도하는 프롬프트를 `--get-prompt` 빌드 과정에서 심을 수 있다. §7.2는 view 셸로 drafter 사고를 차단한다고 했으나, evaluator_prompt는 orchestrator가 빌드해서 Task에 전달하는 구조라 orchestrator가 system prompt를 조작하면 잠금이 무의미해진다. 결정론적 강제(auto T.2)가 사라지면서 신뢰 체인이 얇아졌다.

- [H5] **`gate_diff_scope`가 `git diff --name-only base_ref`를 워크트리 cwd에서 실행할 때, apply가 아직 commit을 만들지 않았으면 diff가 빈 결과를 낸다:**  
  §5.1에서 apply는 워크트리에 파일을 **쓰기**만 하고 `git add`/`git commit`은 publish 단계에서 한다. `gate_diff_scope`가 `git diff --name-only base_ref`를 실행하면, 워크트리에 파일이 쓰여져도 staging/commit이 없으면 untracked 파일은 diff에 안 나온다(added 파일이 untracked이면 `git diff` 대상이 아님). 실제로 `added` 상태 파일은 `git diff` 아닌 `git status --porcelain`이나 `git diff --cached`를 써야 잡힌다. scope 검사가 added 파일을 통째로 놓치면 S.1(scope 범위 내) 계약이 무력화된다.

## MEDIUM

- [M1] **`changeset_digest`가 `deleted` 파일의 new_body를 빈 문자열(`""`)로 처리하여, 내용이 빈 신규 파일과 삭제 파일이 같은 해시를 낼 수 있다:**  
  §3 코드에서 `f.get('new_body','')` — deleted 파일은 `new_body`가 없으므로 `""`. `path="foo.py"`, `status="deleted"`, `new_body=""` 와 `path="foo.py"`, `status="added"`, `new_body=""` (빈 파일 추가)는 `(path, status, new_body)` 직렬화에서 status를 포함하므로 구분된다. 그러나 파일 모드 변경(+x 등)은 `status="modified"`, `new_body=(내용 동일)`로 기록되므로 모드 변경이 없는 수정과 구분 불가 — post-gate swap 탐지가 모드 변경 후 재적용을 허용하게 된다. 또한 `new_body`가 apply에 의해 정규화(CRLF→LF, BOM 제거 등)되면 drafter inject 시점과 publish 시점에서 동일 state의 `new_body`가 달라지지 않으므로 해시는 일치하지만, 디스크 파일과 state의 `new_body`가 다른 상태가 된다 — 실제 커밋 내용이 검증한 내용과 다를 수 있다.

- [M2] **`force_publish` 가 `_PROTECTED`에 없어 evaluator PASS 없이도 직접 주입 가능하다 — cycle 1 C3 수정의 허점:**  
  §8 `_PROTECTED` 집합: `{"gate_results", "evidence", "contract_checks", "revision_round", "pending_human_approvals", "validated_changeset_hash", "workspace", "base_ref"}`. `force_publish`는 포함되지 않는다. orchestrator가 `--inject <thread> '{"force_publish": true}'`를 실행하면 evaluator 없이, 게이트 fail 상태에서도 publish가 강행된다. 원본 publish.py는 `force_publish`를 사용자가 **명시 승인**하는 것으로 설계됐는데(사용자가 의도적으로 미통과본 배포를 원하는 경우), orchestrator가 자동으로 주입할 수 있으면 안전 의도가 퇴색된다. 설계 문서가 이 주입을 허용한다는 명시가 없다.

- [M3] **publish 가 워크트리에서 `git add` → commit한 뒤 메인 브랜치에 어떻게 반영하는지 플로우가 미정의다:**  
  §5.1은 "publish의 commit은 워크트리 안에서 일어나고, 최종 머지만 메인에 반영"이라고 했고, §9는 "새 브랜치를 만들고 commit"이라고 했다. 워크트리 안에서 commit 후 메인으로 merge/rebase하는 단계가 누가, 언제, 어떻게 하는지 명세 없다. `git worktree add -b <new-branch> .dev-harness-wt/<thread> <base_ref>`로 새 브랜치를 워크트리에 만들면 worktree 안에서 commit → `git push origin <branch>` → PR이지만, 이 시퀀스가 publish 노드에서 자동인지 H.2 승인 후 수동인지, worktree 안에서 `git push`가 동작하는지(원격 인증 환경 미지정) 불명확. camping이 "main 직접 작업 중"이라는 맥락과 "새 브랜치 기본값" 정책이 충돌할 때 처리도 없다.

- [M4] **`approved_human` 이 `_PROTECTED`에 없어 contract_checker가 이미 비웠어도 orchestrator가 다시 주입 가능하다:**  
  원본 contract_checker.py 71~73행: `"approved_human": []` 반환으로 사전 주입을 비운다. 그런데 v2 §8 `_PROTECTED`에 `approved_human`이 없으면, orchestrator가 `--inject <thread> '{"approved_human": ["H.1","H.2"]}'`를 contract_checker 실행 후 human_review 전에 주입 가능하다. 원본에서는 이 문제를 인식해 contract_checker가 `approved_human=[]`로 리셋하는 방식으로 방어했는데, v2에서 `approved_human`의 리셋이 §6/§12에서 명시됐는지 불분명하다(원본은 명시적으로 reset했음 — 원본 contract_checker.py 79행).

- [M5] **revision_round 상한 도달 시 human_review로 분기하는 조건이 `route_after_contract`/`route_after_evaluator` 두 곳에만 있고, apply/reset_gates/게이트 노드 실행 중에는 체크가 없다:**  
  revise 루프에서 revision_round가 5가 되면 code_drafter가 다시 interrupt된다 — orchestrator가 `--inject`로 다시 drafter 결과를 주입하고, apply→reset_gates→게이트 4개→evidence_collector→contract_checker 전체를 돌고 나서야 `route_after_contract`가 상한을 체크한다. 즉 "5라운드 한도 도달 시 즉시 human_review"가 아니라, 한도 도달 후에도 apply+게이트 전체가 한 번 더 실행된 뒤 분기된다. 이것이 의도인지(5라운드 결과까지 보고 사람이 판단) 아닌지(즉시 멈춤) 명세 없음. 원본 graph.py에서는 revise → sql_drafter 바로 루프라 게이트 없이 drafter interrupt만 한 번 더 발화한다.

## LOW / 누락

- [L1] **§13 "게이트 도구 도입 범위" 미결정이 §5 전체를 공허하게 만든다 — 결정 미루기의 누적 비용이 설계 부채로 고착된다:**  
  현재 camping에 ruff/mypy/pytest 설정이 없고 §5 정책은 "없으면 skip"이다. §13이 이 결정을 사용자에게 넘겼는데, 하네스 구현이 완료된 뒤에도 게이트가 전부 skip이면 L.1/Y.1/T.1 계약이 영구적으로 "skip pass"가 된다. §0의 "Default-FAIL Contract" 정신과 충돌한다. 최소 요건(예: ruff는 최소 설정 없이도 동작 — `ruff check`는 zero-config 지원)을 Phase 0에서 강제 설정하는 방안을 문서가 제안하지 않는다.

- [L2] **`evidence` 필드도 `gate_results`와 동일한 reducer 문제([C1])를 갖는다 — 언급 누락:**  
  C1에서 `gate_results`를 다뤘으나, `evidence: Annotated[list[GateResult], operator.add]`도 동일 reducer로 선언되어 동일한 비우기 불가 결함을 갖는다. `reset_gates`가 `{"evidence": []}`를 반환해도 기존값이 남는다.

- [L3] **`code_drafter` interrupt 조건("changed_files가 비어있을 때만")이 revise 노드와 intake 두 경로만 처리한다 — evaluator NEEDS_WORK → revise → drafter 루프에서 revise가 changed_files를 비우는 구체적 타이밍이 `revision_round += 1`과 원자적으로 이뤄진다는 보장이 없다:**  
  §4에서 "revise가 `{"changed_files": [], "revision_round": +1}` 반환"이라고 명시했으나, revision_round는 `_PROTECTED`에 없다. 원본 state에는 `revision_round` 증가 담당 노드 명세가 없고(원본에선 revise 노드가 담당), v2도 revise 노드가 담당한다고 했는데 `revision_round`가 보호 필드에 있으므로 inject로 건드릴 수 없다. 이건 의도대로 동작하지만, revise 노드가 state를 반환할 때 `revision_round`를 얼마로 설정할지 — `state["revision_round"] + 1`을 읽어서 +1 해야 하는데, LangGraph TypedDict `total=False` 환경에서 처음 실행 시 `revision_round`가 없으면 KeyError 가능성이 있다. `state.get("revision_round", 0) + 1`로 써야 하는데 이것이 명세에 없다.

- [L4] **`.checkpoints.db` 가 camping 프로젝트 루트에 생기는지, `dev-harness/` 아래에 생기는지, `pipeline/graph_pipeline.py`와 같은 db를 공유하는지 미명세:**  
  `pipeline/graph_pipeline.py`가 별도 langgraph 파이프라인이라 하네스와 "무관"하다고 §1에 명시했으나, 같은 Python 환경과 같은 cwd에서 실행되면 `.checkpoints.db`를 공유할 수 있다. thread_id 충돌 가능성과 pipeline이 dev-harness thread를 overwrite하는 위험이 있다. 각 파이프라인이 별도 db를 써야 한다는 명세 없음.

- [L5] **§11 Phase 5 "하네스 자체 회귀 테스트"가 이 하네스를 **통과해서** 작성되어야 한다는 재귀 부트스트랩 문제 미인식:**  
  Phase 5에서 `dev-harness/tests/`를 작성할 때, 하네스가 아직 완전히 동작하지 않으면(Phase 0~4 버그) 하네스를 통해 테스트를 작성하는 것이 불가능하거나 의미없다. "역설적이지만"이라는 한 줄로 넘어가지 않고, Phase 5 이전에 하네스를 **우회하는** 최소 단위 테스트(노드 함수 직접 호출)로 Phase 1~4를 검증하는 계획이 필요하다.

## cycle 1 회귀 점검

**"다음 사이클에서 볼 것" 4개:**

1. **apply/워크트리 모델이 도입한 새로운 결함(워크트리 동시성, git worktree와 langgraph thread의 수명 불일치, 메인↔워크트리 머지 충돌):**  
   **미해소** — §5.1에서 기본 apply 흐름을 명세했으나, (a) thread 수명 불일치 시 resume 복구 로직 없음(H1), (b) 동시 접근 충돌 처리 없음(H2), (c) 워크트리 → 메인 머지 절차 불명확(M3). 이 세 하위 결함이 모두 미해소 상태로 cycle 2로 이월됨.

2. **changeset_digest가 new_body만 보는데 deleted 파일/파일모드 변경을 놓치는지:**  
   **부분 해소** — `status` 필드를 포함해 직렬화(`(path, status, new_body)`)하므로 deleted vs added 구분은 됨. 그러나 파일 모드 변경은 `status="modified"`로 동일하게 표현되어 구분 불가. new_body 정규화 문제도 미해소(M1에서 재발견).

3. **review 그래프의 intake_review가 PR diff를 어떻게 가져오는지(gh CLI 의존):**  
   **미해소** — §4에 "intake_review(현재 브랜치/PR diff를 `changed_files`에 read-only로 채움)"이라고 한 줄 언급만 있고, 실제 구현 방법, gh CLI 의존 여부, 미설치 처리, 대용량 diff 처리가 전혀 명세 안 됨(H3에서 재발견). cycle 1 L6 원래 지적이 그대로 열려있음.

4. **게이트 skip이 너무 많아 사실상 "통과만 하는" 빈 하네스가 되는지(camping 현실):**  
   **악화** — cycle 1 수정으로 T.2가 auto에서 needs_llm으로 강등됐다. camping에서 pytest 없으면 T.1=skip, T.2=needs_llm(evaluator에게 위임), L.1/Y.1=skip(ruff/mypy 미설정). R.1/R.2/R.3도 전부 needs_llm. 결국 auto로 결정론적으로 fail 가능한 항목이 S.1(scope), S.2(시크릿), T.3(refactor 한정) 정도만 남는다. 나머지는 evaluator 단일 LLM 판정으로 수렴(H4에서 재발견). §13에서 이 결정을 사용자에게 미루었으나 설계 자체가 이 방향을 방치하고 있다.

## 한 줄 총평

`reset_gates`가 `[]`를 반환해도 LangGraph reducer가 기존 게이트 결과를 지우지 않는 구조적 모순이 cycle 1 핵심 보완(C1 reducer 도입)이 만든 신규 결함이며, 동시에 evaluator view가 존재하지 않는 `diff` 필드를 참조해 코드리뷰 안전장치가 빈 데이터로 동작하는 두 결함이 v2의 가장 치명적인 약점이다.
