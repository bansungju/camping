# DESIGN — camping 개발 에이전트 하네스 (dev-harness)

> camping 프로젝트의 **코드 변경**을 LangGraph 위에서 강제하는 1도메인(=`dev`) 하네스.
> `pass_agent_harness` 의 검증된 아키텍처(orchestrator + 게이트 그래프 + fresh-context evaluator)를
> 그대로 이식하되, 도메인 부품을 **SQL/HTML → 소프트웨어 개발**로 갈아끼운다.
>
> 핵심 발상은 동일하다: **LLM 을 그래프 안에 넣지 않는다.** Claude Code(=orchestrator)가 그래프를
> 운전하고, 결정론적 게이트(린트·타입·테스트)는 py 노드가, 생성·평가만 Task subagent 가 채운다.

---

## 0. 왜 이 구조인가 — 3대 안전장치

`pass_agent_harness` 에서 그대로 가져오는, 이 하네스의 존재 이유:

1. **Default-FAIL Contract** — "고쳤어요/통과했어요" 자기보고를 금지한다. 모든 완료 주장은
   `contract_checker` 노드가 **증거(테스트 출력·게이트 결과)** 와 대조해 `fail` 로 강제 down 시킨다.
2. **Fresh-Context Evaluator** — 코드를 짠 주체가 자기 코드를 리뷰하지 못한다. 별도 Task subagent 가
   `allowed_tools=[]` 로 격리되어, **drafter 의 사고 과정은 절대 안 보고** diff·테스트 결과만 보고 리뷰한다.
3. **Human-review interrupt** — commit/PR 직전에 그래프가 멈춘다(`interrupt_before=["human_review"]`).
   사용자 승인 없이는 `publish` 불가. 게이트 통과 후 본문이 바뀌는 post-gate swap 은 해시로 탐지·거부.

이 3개가 "그럴듯하지만 틀린" 코드 변경이 commit 까지 새어나가는 것을 토폴로지로 막는다.

---

## 1. 위치 / 형태

camping 내장. 엔진은 `pass_agent_harness/harness/` 에서 이식하되 camping 전용으로 슬림화한다.

```
camping/
  dev-harness/
    DESIGN.md              ← 이 문서
    devagent/
      __init__.py
      __main__.py          ← orchestrator CLI (--request/--inspect/--get-prompt/--inject/--resume
                              + --status/--progress/--ssot/--gc + --sessions/--conflicts/--reap)
      state.py             ← DevState (공유 TypedDict) + changeset_digest
      router.py            ← 요청 → (area, axis, kind) 분류. axis 는 경로 우선 판별(§17.1)
      graph.py             ← StateGraph 빌더 + dry_describe
      contract.py          ← Default-FAIL 개발 계약 레지스트리
      ssot.py              ← SSOT 레지스트리 로드 + ssot_rev 해시 (§14)
      progress.py          ← state.json / PROGRESS.md 갱신·조회 (§15)
      ledger.py            ← active.json 원장 read/append/heartbeat/reap + 디렉토리 락 (§16)
      nodes/
        __init__.py
        intake.py          ← (area,kind) 분류 + scope 확정 + SSOT/state 로드 + 원장 등록·동시작업뷰
        apply.py           ← [cycle1] changed_files → 격리 워크트리, changeset_diff 생성
        reset_gates.py     ← [cycle2] gate_results/evidence/hash 비움
        code_drafter.py    ← [LLM] 코드 변경 작성 (Task subagent 위임)
        gate_diff_scope.py ← diff 범위·시크릿 검사 (py)
        gate_scope_overlap.py ← [§16] 활성 thread 와 scope/SSOT 겹침 검사 (원장 대조)
        gate_ssot.py       ← [§14] area SSOT 정합성 (K.1 needs_llm / K.2 human)
        gate_lint.py       ← ruff / eslint 실행 (py, subprocess)
        gate_typecheck.py  ← mypy / tsc 실행 (py, subprocess)
        gate_tests.py      ← pytest / jest 실행 (py, subprocess)
        evidence_collector.py ← 테스트 출력·diff stat·커버리지 캡처
        contract_checker.py   ← 게이트 결과 → ContractCheck 리스트
        evaluator.py       ← [LLM, read-only] 격리 코드리뷰 (Task subagent 위임)
        revise.py          ← 피드백 정리 + changed_files=[] + round+1 후 재진입
        human_review.py    ← interrupt 게이트 (pass-through)
        publish.py         ← git commit/브랜치 + state.json/PROGRESS.md 갱신
      prompts/
        code_drafter.md
        evaluator.md
    ssot/
      registry.yaml        ← 영역별 정본 SSOT 매핑 (§14.1)
      auth.md  frontend.md  backend.md  data.md   ← 영역 정본(devagent 는 DESIGN.md 자신)
    state.json             ← 영역별 현황 (project state, §15.2)
    active.json            ← 진행 중 thread 원장 (다중 세션 동시성, §16, gitignore)
    PROGRESS.md            ← 변경 이력 타임라인 (§15.3)
    .checkpoints.db        ← SqliteSaver (gitignore)
    .ledger.lock           ← 공유 원장 디렉토리 락 (§16.4, gitignore)
    .dev-harness-wt/       ← thread 별 격리 워크트리 (gitignore, §5.2)
    tests/                 ← 하네스 자체 회귀 테스트
```

> 주의: camping 에는 이미 `pipeline/graph_pipeline.py` 라는 별도 langgraph 파이프라인(상품 채우기)이
> 있다. dev-harness 는 그것과 **무관**하다 — 채우기 파이프라인은 "데이터를 만드는" 그래프, dev-harness 는
> "그 코드를 개발하는 과정을 강제하는" 그래프다. 충돌 없음.

---

## 2. 분류 모델 — 2축(area × kind)

요청은 **두 축**으로 분류된다. 토폴로지는 1개로 동일하고, 분류는 (1) **어느 SSOT 영역**을 건드리는지,
(2) **무슨 종류**의 변경인지를 정한다.

### 2.1 area — 5개 SSOT 영역 (사용자 정의)

각 영역은 **단일 진실원본(SSOT) 문서**를 갖고, 그 영역의 모든 변경은 해당 SSOT 와 정합해야 한다(§14).

| area | 범위 | SSOT 문서(camping 현황) |
|---|---|---|
| `auth` | 로그인·회원관리·세션·권한 | (신규) `dev-harness/ssot/auth.md` |
| `frontend` | UX/UI 설계·프론트 개발·디자인시스템 | `DESIGN-social.md` + `site/` 컴포넌트맵 → `ssot/frontend.md` |
| `backend` | API·서버·아키텍처 | `backend-plan/ARCH-R*.md` → `ssot/backend.md` |
| `devagent` | 이 하네스 자신(설계·계약·게이트) | `dev-harness/DESIGN.md` (이 문서) |
| `data` | DB 스키마·파이프라인·데이터사전 | `DATABASE-DESIGN.md`·`schema.sql`·`pipeline/` → `ssot/data.md` |

> SSOT 는 **복제가 아니라 지정**이다 — 이미 camping 에 있는 권위 문서를 SSOT 레지스트리(§14.1)가
> 가리킨다. 영역마다 SSOT 가 흩어져 여러 개면 안 된다(그게 SSOT 의 정의). 여러 문서가 후보면 §14.1
> 레지스트리에서 "이 영역의 정본 1개"를 명시하고 나머지는 파생/참고로 강등한다.

> **5 area 중 3개(`frontend`·`backend`·`data`)는 "제품 개발의 핵심 축"**으로, 런타임·툴체인·증거·실패
> 양식이 서로 달라 **축별로 구분된 작동 프로파일**을 갖는다(§17). `auth` 는 독립 축이 아니라 세 축에
> 걸쳐 구현되는 **횡단 관심사**(frontend 로그인 UI + backend 세션/토큰 + data 사용자 스키마)이고,
> `devagent` 는 하네스 자신을 다루는 메타 영역이다. 에이전트는 요청을 받으면 **먼저 어느 축인지 명확히
> 판별**하고 그 축의 프로파일로 작동해야 한다.

### 2.2 request_kind — 변경 종류

| request_kind | 의미 | 적용 게이트 |
|---|---|---|
| `feature` | 신규 기능·파일 추가 | 전 게이트 + T.2a 테스트동반(결정론) + T.2b(LLM) |
| `fix` | 버그 수정 | 전 게이트 + 회귀 테스트 권장 |
| `refactor` | 동작 불변 리팩터 | 전 게이트 + T.3 기존 테스트 보존 |
| `review` | 코드/PR 리뷰만 (산출물=리뷰 결과) | drafter 없이 evaluator 만 — read-only |

`router.py` 가 요청 문자열로 (area, kind) 를 자동 분류하고, 모호하면 orchestrator 가 1질문으로 확정.
area 가 결정되면 intake 가 해당 SSOT 를 drafter 컨텍스트에 싣고, `gate_ssot` 가 정합성을 검사한다.

---

## 3. 공유 상태 — `DevState`

`pass_agent_harness` 의 `SqlAnalysisState` 를 개발용으로 환산. (TypedDict, total=False — 노드는 부분
업데이트만 반환하면 LangGraph 가 머지)

```python
class ChangedFile(TypedDict, total=False):
    path: str
    status: Literal["added", "modified", "deleted"]
    new_body: str            # 변경 후 전체 본문 (added/modified) — apply 가 디스크에 씀
    is_binary: bool          # [cycle1 L2] True 면 new_body 미보관, 게이트 skip
    mode: str                # [cycle2 M1] 파일 모드("100644"/"100755") — digest 가 모드변경 구분

class GateResult(TypedDict, total=False):
    gate: str                # "diff_scope" | "lint" | "typecheck" | "tests"
    status: Literal["pass", "fail", "skip"]
    cmd: str                 # 실제 실행한 명령
    exit_code: int
    output: str              # stdout/stderr 캡처 (truncate)

class ContractCheck(TypedDict, total=False):
    id: str                  # "T.1" (테스트 통과) 등
    label: str
    status: Literal["pass", "fail", "needs_llm", "needs_human"]
    auto: bool
    evidence_ref: str

Area = Literal["auth", "frontend", "backend", "devagent", "data"]  # 5개 SSOT 영역
Axis = Literal["frontend", "backend", "data", "multi"]            # [§17] 작동 프로파일 선택자

class DevState(TypedDict, total=False):
    # 입력
    request: str
    area: Area                           # router 가 분류한 SSOT 영역 — intake 가 SSOT 로드/gate_ssot 가 검사
    axis: Axis                           # [§17] 게이트/도구/증거 프로파일 — 경로 우선 판별. multi=교차축
    request_kind: RequestKind            # feature | fix | refactor | review
    scope_paths: list[str]               # intake 가 확정한 "건드려도 되는" 경로 (glob). [] = 미확정 → diff_scope fail
    base_ref: str                        # [cycle1 L1] intake 시점 HEAD sha — 병렬변경 충돌 감지 기준
    ssot_refs: list[str]                 # 이 area 의 SSOT 문서 경로(들) — intake 가 레지스트리에서 채움

    # 산출물
    changed_files: list[ChangedFile]     # drafter 가 inject, revise 가 [] 로 리셋 (통째 교체)
    workspace: str                       # [cycle1 H5] apply 가 변경을 쓴 격리 워크트리 경로
    changeset_diff: str                  # [cycle2 C2] apply 후 `git diff base_ref` 텍스트 — evaluator view 가 봄

    # 진행
    stage: Stage
    revision_round: int

    # 검증 — [cycle2 C1] reducer 를 쓰지 않는다. 게이트는 순차 실행이므로 각 노드가
    # `state["gate_results"] + [new]` 를 반환(통째 교체 = append 효과). reset_gates 가 `[]` 를
    # 반환하면 깨끗이 비워진다. (operator.add reducer 를 걸면 `add(기존,[])=기존` 이라 리셋 불가 —
    # cycle1 의 reducer 도입이 reset 과 모순됐던 것을 철회.)
    gate_results: list[GateResult]        # 순차 append, reset_gates 가 [] 로 비움
    evidence: list[GateResult]            # 〃
    contract_checks: list[ContractCheck]  # contract_checker 가 통째 재계산

    # Evaluator (격리 코드리뷰)
    evaluator_verdict: Verdict           # "" | "PASS" | "NEEDS_WORK"
    evaluator_notes: list[str]

    # 사람 명시 승인 (위험 작업 — 마이그레이션/외부배포/시크릿 파일 touch 등)
    pending_human_approvals: list[str]
    approved_human: list[str]

    # post-gate swap 탐지 — 게이트가 검증한 변경 묶음의 해시
    validated_changeset_hash: str

    # 배포 제어 — 미통과본 강제 commit 승인
    force_publish: bool

    messages: list[Any]

REVISION_ROUND_LIMIT = 5   # revise 무한루프 차단 → 도달 시 어디서든 human_review


def changeset_digest(changed_files: list[ChangedFile]) -> str:
    """[cycle1 C4 / cycle2 M1] 변경 묶음의 결정론적 해시 — post-gate swap 탐지용.

    contract_checker 와 publish 가 동일 값을 계산해야 하므로 path 로 정렬 후
    (path, status, mode, new_body) 를 직렬화. deleted 파일은 new_body 가 없으니 sentinel(`\x02`)로
    표기해 "빈 파일 modified"와 구분한다. is_binary 파일은 new_body 대신 path|status|mode 만 포함.
    apply 는 new_body 를 **바이트 그대로** 쓴다(CRLF→LF 등 정규화 금지) — 안 그러면 digest 와 디스크가
    어긋난다.
    """
    import hashlib
    parts = []
    for f in sorted(changed_files, key=lambda x: x.get("path", "")):
        if f.get("status") == "deleted":
            body = "\x02DELETED"
        elif f.get("is_binary"):
            body = "\x02BINARY"
        else:
            body = f.get("new_body", "")
        parts.append(f"{f.get('path','')}\x00{f.get('status','')}\x00{f.get('mode','')}\x00{body}")
    blob = "\x01".join(parts)
    return hashlib.sha256(blob.encode("utf-8", errors="surrogatepass")).hexdigest()
```

`pass_agent_harness` 대비 변화:
- `artifact(SqlArtifact)` → `changed_files(list[ChangedFile])` — 단일 산출물이 아니라 변경 묶음
- `violations(정규식 위반)` → `gate_results(도구 실행 결과)` — 증거가 정규식이 아니라 **exit code + 출력**
- `validated_artifact_hash` → `validated_changeset_hash` (+ `changeset_digest` 함수 명시)
- **[cycle2 C1] 누적 리스트에 reducer 를 쓰지 않는다.** 게이트는 순차 실행이라 각 노드가
  `state["gate_results"] + [new]` 를 반환하면 통째 교체로 append 효과가 나고, `reset_gates` 의 `[]`
  반환이 깨끗이 비운다. `operator.add` reducer 는 `add(기존,[])=기존` 이라 리셋 자체가 불가능 →
  cycle1 의 reducer 도입을 철회.
- diff 텍스트는 `ChangedFile` 에 보관하지 않고, evaluator 가 볼 통합 diff 만 `changeset_diff`(단일
  문자열)로 apply/evidence 단계에서 `git diff` 로 생성([cycle2 C2]). 바이너리/대용량은 truncate.

---

## 4. 그래프 토폴로지

`pass_agent_harness` 의 data 그래프와 동형이되, **[cycle1 H5] `apply` 노드가 추가**된다 — drafter 가
inject 한 `changed_files` 를 게이트 실행 전에 실제 디스크(격리 워크트리)에 써야 lint/type/test 가
"변경 후" 상태를 검사한다. 이게 빠지면 안전장치 전체가 변경 전 코드를 검사하게 된다.

```
START → intake → code_drafter [LLM]
  → apply            (changed_files → 격리 워크트리에 쓰기, base_ref 충돌 검사, changeset_diff 생성)
  → reset_gates      (gate_results/evidence/validated_changeset_hash 를 비움 — [cycle2 C1/C3])
  → gate_diff_scope → gate_scope_overlap → gate_ssot → gate_lint → gate_typecheck → gate_tests
  → evidence_collector → contract_checker
  → [conditional: route_after_contract]
      게이트 fail (scope/lint/type/test 실패) → revise [LLM]
      needs_llm 만 남음 (코드리뷰 필요)        → evaluator [LLM, read-only]
      모두 pass                               → human_review
  evaluator → [conditional: route_after_evaluator]
      PASS        → human_review
      NEEDS_WORK  → revise
  revise → code_drafter   (loop: changed_files=[], revision_round += 1)
  human_review [interrupt_before] → publish → END

상한: revision_round >= 5 → 어디서든 human_review (한도 도달, 사람이 판단)
Checkpoint: AsyncSqliteSaver(.checkpoints.db, ainvoke) / SqliteSaver(sync) → MemorySaver fallback
```

**[cycle1 C2] interrupt 리셋:** `code_drafter` 는 `changed_files` 가 비어 있을 때만 `interrupt()`.
revise 노드가 재진입 전 `{"changed_files": [], "revision_round": +1}` 을 반환해 비워주므로([cycle1 H2]
revision_round 증가도 여기서) 매 라운드 drafter interrupt 가 반드시 발화한다. 첫 진입은 intake 가
`changed_files=[]` 로 시작하므로 동일하게 보장.

**[cycle1 H3/L6 · cycle2 H3] `review` kind 는 publish 를 공유하지 않는 별도 그래프**(`build_review_graph`):
`intake_review` → `evaluator` → `human_review[interrupt]` → **END(리뷰 결과만, publish 없음)**.
publish 를 안 타므로 H.1/H.2 우회가 원천 차단. `intake_review` 의 diff 수집:
- PR 번호 주어짐 → `gh pr diff <n>` (gh 미설치/미인증이면 명확히 에러 후 종료, fallback 으로 위장 안 함)
- 아니면 브랜치 → `git diff <base>...HEAD` (base 는 머지 대상, 기본 main)
- 결과를 `changeset_diff` 단일 문자열로 담고, 파일 상한(예: 200KB) 초과 시 truncate +
  "N파일 생략" 표기. `changed_files` 는 path/status 메타만 채움(new_body 없음 — read-only).

**[cycle2 H1/H2] 워크트리 수명·동시성** → §5.2 에서 별도 규정.

### 분기 함수 (pass_agent_harness 에서 그대로 재사용 가능)

```python
def route_after_contract(state) -> str:
    if state.get("revision_round", 0) >= REVISION_ROUND_LIMIT:
        return "human_review"
    checks = state.get("contract_checks", [])
    if any(c["status"] == "fail" for c in checks):     return "revise"
    if any(c["status"] == "needs_llm" for c in checks): return "evaluator"
    return "human_review"

def route_after_evaluator(state) -> str:
    if state.get("revision_round", 0) >= REVISION_ROUND_LIMIT: return "human_review"
    return "human_review" if state.get("evaluator_verdict") == "PASS" else "revise"
```

→ 이 두 함수와 `state.py` 의 루프 상한, `graph.py` 의 빌더 골격, `__main__.py` 의 CLI 골격은
**도메인 무관**이라 거의 무수정 이식된다. 갈아끼우는 건 노드 내용물과 contract 레지스트리뿐.

---

## 5. 게이트 — camping 스택 기준 구체화

camping = Python(stdlib + langgraph, 24개 .py, 테스트·린트 설정 없음) + 정적 JS 사이트.
게이트는 **정규식이 아니라 도구 subprocess 실행**이다. exit code 0 = pass.

| 게이트 노드 | Python 변경 시 | site/ JS 변경 시 | 비고 |
|---|---|---|---|
| `gate_diff_scope` | `git diff --name-only` ⊆ `scope_paths` 검사 + 시크릿 패턴(`.env`, API key 정규식) 차단 | 동일 | py 순수 검사 — 외부도구 불필요 |
| `gate_lint` | `ruff check <changed>` | `npx eslint <changed>` (설정 있을 때만) | 설정/도구 부재 시 `skip` (fail 아님) |
| `gate_typecheck` | `mypy <changed>` | `tsc --noEmit` (TS일 때만) | 〃 |
| `gate_tests` | `pytest -q` (영향 테스트만 선별 가능) | `npm test` | 테스트 0건이면 `feature` 는 fail, 그 외 skip |

**도구 부재 정책 (중요):** camping 은 현재 lint/mypy/test 설정이 없다. 게이트는
도구 미설치/미설정 시 **`skip`** 으로 처리하되, `evidence` 에 "skip 사유"를 남긴다.

**[cycle1 H1] "신규 코드 테스트 동반"은 auto 가 아니라 needs_llm + 휴리스틱 보조:** "어떤 함수를
테스트하는가"는 AST·커버리지 매핑이 필요해 결정론적 py 로 정확 판정 불가하고, "pytest 미설치"와
"테스트 0건"도 subprocess exit code 로 구분 어렵다. 따라서:
- `gate_tests` 는 **존재하는 테스트의 통과/실패만** auto 로 판정한다(T.1). 도구·테스트 부재 = skip.
- "신규 기능에 테스트가 동반됐는가"(T.2)는 **휴리스틱 신호**(diff 에 `def `/`class ` 추가 ↔ `test_*`
  파일 변경 동반 여부)를 `evidence` 로 남기고, 최종 판정은 **evaluator(needs_llm)** 에게 맡긴다.
  → 거짓 자동 fail/pass 를 피하면서도 "테스트 없는 신규 기능"을 리뷰 단계에서 잡는다.
이 정책은 camping 에 테스트 인프라를 점진 도입하도록 압력을 주되, 인프라 0인 현실에서 첫 사용을
막지 않는다(과도한 마찰 회피).

각 게이트 노드 구현 패턴 ([cycle2 C1] reducer 없이 read-append-return):

```python
def run(state: DevState) -> dict:
    wt = state["workspace"]                       # 게이트는 워크트리 cwd 에서 실행
    changed = [f["path"] for f in state["changed_files"] if f["status"] != "deleted"]
    py = [p for p in changed if p.endswith(".py")]
    prev = state.get("gate_results", [])          # 이전 게이트 결과 읽어서
    if not py:
        new = GateResult(gate="lint", status="skip", cmd="(no .py)")
    else:
        proc = subprocess.run(["ruff", "check", *py], cwd=wt, capture_output=True, text=True)
        new = GateResult(
            gate="lint", status="pass" if proc.returncode == 0 else "fail",
            cmd=f"ruff check {' '.join(py)}", exit_code=proc.returncode,
            output=(proc.stdout + proc.stderr)[:4000],
        )
    return {"gate_results": prev + [new]}         # 통째 교체 = append 효과 (reducer 불필요)
```

> 게이트는 순차 실행이므로 reducer 없이 `prev + [new]` 반환이 안전하다. `reset_gates` 가
> `{"gate_results": [], "evidence": [], "validated_changeset_hash": ""}` 를 반환하면 깨끗이 비워진다.

### 5.1 apply — 변경을 실제 파일에 쓰는 단계 (cycle1 H5 — 가장 중요)

게이트는 디스크 파일을 읽는 도구다. 따라서 `code_drafter` 가 inject 한 `changed_files[*].new_body` 를
게이트 전에 **격리 git 워크트리**에 반영한다.

- `intake` 가 `base_ref = git rev-parse HEAD` 를 기록하고, `apply` 가 워크트리를 보장한다(§5.2).
- `changed_files` 의 added/modified → `new_body` 를 **바이트 그대로** 기록(정규화 금지), deleted → 삭제.
  쓰기 후 워크트리에서 `git add -A` 로 **신규 파일까지 인덱스에 올린다**([cycle2 H5]).
- 모든 게이트·`evidence_collector`·`publish` 는 **워크트리 cwd 에서** 도구를 실행한다(메인 작업트리 미오염).
- apply 끝에 `git diff --cached base_ref` 로 `changeset_diff`(통합 diff)를 생성해 state 에 담는다
  ([cycle2 C2] — evaluator view 가 이걸 본다).
- **[cycle1 L1] 병렬 충돌 감지:** apply 전 `git rev-parse HEAD == base_ref` 확인. 사람이 그 사이
  main 을 진행했으면 멈추고 orchestrator 에 보고(rebase 필요). 메인 작업트리가 dirty 면 경고.
- **[cycle1 M1 · cycle2 H5] scope 는 선언이 아니라 실측으로:** `gate_diff_scope` 는 워크트리에서
  `git diff --cached --name-only base_ref` 의 **실제 변경 파일**(신규 파일 포함)을 scope_paths(glob)와
  대조한다. `--cached` 가 핵심 — untracked `added` 파일은 `git add -A` 후 인덱스에서만 보인다.
- **[cycle1 L4] scope_paths 빈 경우:** `[]` = "미확정"으로 해석해 `gate_diff_scope` 를 **fail**(안전측).
  intake 가 요청에서 scope 를 못 뽑으면 orchestrator 가 1질문으로 확정해야 진행된다.

### 5.2 워크트리 수명·동시성·머지 (cycle2 H1/H2/M3)

LangGraph checkpoint 는 **state 만** 저장하고 디스크 워크트리는 저장하지 않는다. 이 불일치를 명시 처리:

- **결정론적 경로·재구성:** 워크트리는 `tmp` 가 아니라 레포 내 `.dev-harness-wt/<thread>`(gitignore).
  `apply` 는 매 진입 시 **워크트리가 존재하고 `base_ref` 와 일치하는지 검증**한다. 없거나(재시작/삭제)
  변질됐으면 **state 의 `changed_files` + `base_ref` 로 처음부터 재구성**한다 — state 가 단일 진실원본
  (SSOT)이고 워크트리는 파생물이므로, resume 시 디스크가 사라져도 복구된다([cycle2 H1]).
- **단일 writer 락:** thread 당 `.dev-harness-wt/<thread>.lock` 파일락. 두 번째 `--resume` 이 같은
  thread 를 잡으면 락 획득 실패로 즉시 종료([cycle2 H2]). (checkpoint 의 낙관적 동시성은 state 만 보호.)
- **메인 반영(publish):** 워크트리 안에서 `git commit` → **메인 레포에 새 브랜치로 머지**
  (`git -C <main> fetch <worktree>` 또는 워크트리가 같은 .git 을 공유하므로 commit 이 이미 객체DB에
  들어감 → 메인에서 `git branch dev-harness/<thread> <sha>`). main 직접 이동은 안 함 — 항상 브랜치.
  `git push`/PR 은 **H.2 승인** 시에만. 원격 인증 부재면 로컬 브랜치까지만 만들고 보고.
- **[cycle1 L3] 롤백:** 어느 단계든 실패하면 워크트리는 버리면 그만(객체DB만 남고 메인 ref 무영향).
- **정리:** §12 의 `--gc` 가 종료 thread 의 워크트리를 `git worktree remove --force` + 락 해제.

---

## 6. Default-FAIL 개발 계약 (contract 레지스트리)

`pass_agent_harness` 의 data_contract(47개 체크박스)에 대응. 각 항목은 `auto`(게이트 자동) /
`needs_llm`(evaluator) / `human`(사용자 승인) 카테고리를 가진다. `contract_checker` 가 게이트 결과를
이 레지스트리에 매핑해 ContractCheck 를 만든다.

| id | label | 카테고리 | 적용 kind |
|---|---|---|---|
| **S.1** | diff 가 scope_paths 범위 내 | auto | 전체 |
| **S.2** | 시크릿(.env/key/token) 미포함 | auto | 전체 |
| **K.1** | 변경이 해당 area SSOT 와 모순 없음 | needs_llm | 전체 |
| **K.2** | SSOT 문서 자체를 바꾸면 사용자 승인 | human | SSOT 파일 touch 시 |
| **X.1** | 활성 thread 와 scope 파일 미겹침 | auto | 전체 |
| **X.2** | 활성 thread 와 같은 SSOT 동시개정 아님 | auto | SSOT 파일 touch 시 |
| **L.1** | 린트 통과 (또는 도구 부재 skip) | auto | 전체 |
| **Y.1** | 타입체크 통과 (또는 skip) | auto | 전체 |
| **T.1** | 존재하는 테스트 전건 통과 (없으면 skip) | auto | 전체 |
| **T.2a** | 코드 추가 시 test 파일도 변경됨 (거친 결정론) | auto | feature |
| **T.2b** | 그 테스트가 실제로 신규 동작을 검증 (뉘앙스) | needs_llm | feature |
| **T.3** | 기존 테스트 그대로 통과(동작 보존) | auto | refactor |
| **R.1** | 정확성·엣지케이스 (격리 리뷰) | needs_llm | 전체 |
| **R.2** | 보안·입력검증 (격리 리뷰) | needs_llm | 전체 |
| **R.3** | 변경이 요청 의도와 일치 | needs_llm | 전체 |
| **H.1** | DB 마이그레이션/스키마 변경 | human | schema.sql touch 시 |
| **H.2** | 외부 배포(site export, git push) | human | publish 단계 |

> **[cycle2 H4] T.2 의 결정론 복원:** "어떤 함수를 테스트하나"는 LLM 몫(T.2b)이지만, "feature 가 비-test
> .py 를 추가/수정했는데 test 파일은 하나도 안 건드림"은 **결정론적으로 판정 가능**하다(T.2a, auto).
> T.2a 를 `fail` 로 강제하면 evaluator 단일 의존이 아니라 게이트가 1차 방어선을 친다. T.2a 는
> `approved_human`(의도적 무테스트 변경 승인)으로만 우회 — force 단독 우회 금지.

`contract_checker` 정책 (pass_agent_harness 에서 그대로):
- auto + 게이트 fail → `fail` / auto + 게이트 pass → `pass`
- needs_llm → `needs_llm` (evaluator 가 결정)
- human → `needs_human` (human_review 전용 승인, evaluator 로 충족 불가)
- 적용 안 되는 kind 의 항목은 skip
- **evaluator_verdict 리셋** — contract_checker 가 매번 verdict 를 비워, evaluator 노드가 반드시
  fresh-context 평가를 거치게 강제 (drafter inject 단계에 심어둔 가짜 PASS 차단)
- **[cycle2 M4] approved_human 리셋** — verdict 와 대칭으로 `approved_human=[]` 도 비운다(원본
  contract_checker 79행). drafter inject 단계의 사전승인이 human 게이트를 우회하는 것 차단. 정당 승인은
  human_review interrupt 이후 주입되어 contract_checker 재실행이 없으므로 보존.
- **validated_changeset_hash 기록** — publish 가 post-gate swap 탐지에 사용

---

## 7. LLM 책임 노드 — Task subagent 위임

`pass_agent_harness` 와 동일하게, drafter/evaluator 는 그래프 안에서 `interrupt()` 로 멈추고
**orchestrator(=Claude Code)가 Task subagent 로 채운 뒤 `--inject`** 한다.

### 7.1 code_drafter (코드 작성)
- `subagent_type`: `general-purpose` (또는 코드 특화 agent)
- `--get-prompt` 가 빌드: 요청 + scope_paths + 관련 파일 본문 + camping 컨벤션(CLAUDE.md/CONCEPT.md)
- 직전 라운드 NEEDS_WORK 시 `evaluator_notes` 를 피드백으로 포함
- 반환 → `changed_files` 로 inject (path/status/new_body).
- **drafter 는 게이트/리뷰를 신경 쓰지 않고 "요청 충족"에만 집중** — 검증은 그래프가 한다.

> **[cycle2 M3 주의] drafter 프롬프트 ≠ evaluator view.** drafter 는 `evaluator_notes`(이전 라운드
> 지적)를 받아도 되지만(§7.1), evaluator 는 §7.2 view 에 그게 절대 안 들어간다. 두 경로는 별개다.

### 7.2 evaluator (격리 코드리뷰) — fresh-context 3중 잠금
`pass_agent_harness` evaluator.py 의 잠금을 그대로:
1. **drafter 와 다른 Task subagent** — 컨텍스트 자동 분리
2. **state view 셸** — `_evaluator_view` 가 `request / changeset_diff / gate_results /
   contract_checks_needs_llm` 만 직렬화. **drafter 의 사고·messages·revision_round·evaluator_notes 는
   절대 미노출**
3. **`allowed_tools=[]`** — orchestrator 가 Task 호출 시 도구 봉쇄 (read-only)
- 응답 규약: 첫 줄 `PASS` 또는 `NEEDS_WORK` 단독, 이후 발견사항 자유텍스트
- 첫 줄로 `evaluator_verdict` 결정 → `route_after_evaluator`

```python
def _evaluator_view(state):
    # [cycle2 C2] diff 는 ChangedFile 에 없다 — apply 가 만든 changeset_diff(통합 텍스트)를 본다.
    return {
        "request": state["request"],
        "request_kind": state["request_kind"],
        "changed_files": [{"path": f["path"], "status": f["status"]}   # 메타만
                          for f in state.get("changed_files", [])],
        "changeset_diff": state.get("changeset_diff", "")[:200_000],   # 통합 diff (대용량 truncate)
        "gate_results": [g for g in state.get("gate_results", []) if g.get("status") != "skip"],
        "contract_checks_needs_llm": [
            {"id": c["id"], "label": c["label"]}
            for c in state.get("contract_checks", []) if c.get("status") == "needs_llm"
        ],
    }
```

---

## 8. Orchestrator CLI — Claude Code 운전 규약

`pass_agent_harness/__main__.py` 의 명령군을 그대로 이식. 각 인터럽트마다 Claude Code 가 호출한다.

```
1. python -m devagent --request "<요청>"            그래프 시작 → code_drafter interrupt 멈춤
2. python -m devagent --inspect <thread>            멈춘 위치 + kind + scope + 양식 상태 확인
3. [Task subagent: code_drafter]                    --get-prompt 가 빌드, fresh ctx
4. python -m devagent --inject <thread> '{"stage":"draft","changed_files":[...]}'
                                                     게이트 자동 실행 → 다음 interrupt
5. (게이트 fail 시) --inspect 로 gate_results 확인 → revise 가 자동으로 drafter 재호출 유도
6. [Task subagent: evaluator]  (needs_llm 남으면)    fresh ctx, allowed_tools=[]
7. python -m devagent --inject <thread> '{"evaluator_verdict":"PASS|NEEDS_WORK","evaluator_notes":[...]}'
8. (revise → drafter 루프, 상한 5)
9. human_review 직전 멈춤 → 사용자에게 diff·게이트 결과 보여주고 승인
10. python -m devagent --resume <thread>            publish(commit/PR) → END
```

**[cycle1 C3 · cycle2 C4] `--inject` 보호 필드는 CLI 코드의 경직된 `_PROTECTED` set 으로 강제**한다.
보호 대상은 **그래프가 스스로 계산하는 "검증 결과" 필드**뿐 — 손주입하면 안전장치가 뚫리는 것들:
```python
_PROTECTED = {
    "gate_results", "evidence", "contract_checks", "revision_round",
    "pending_human_approvals", "validated_changeset_hash",
}
```
→ `gate_results` 가짜 pass 주입(테스트 실패 위장)·라운드 우회·swap 해시 위조·human 승인 우회를 차단.

**보호하지 않는 것 (의도적):**
- `workspace`/`base_ref` — 노드가 계산하지만, [cycle2 H1] resume 복구 흐름에서 orchestrator 가
  교정해야 할 수 있으므로 보호 제외. apply 가 매 진입 시 base_ref 일치를 재검증하므로 위조해도 잡힌다.
- `approved_human`/`force_publish` — 이게 **human 승인 채널 자체**다(보호하면 승인 불가). 단
  [cycle2 M2] `force_publish` 단독으로는 게이트 fail 을 못 뚫는다 — 그래프는 항상 `human_review`
  에서 멈추고(`interrupt_before`), publish 가 `pending ⊆ approved` 를 별도 강제한다. force_publish 는
  "미통과본을 사람이 눈으로 보고 강행"하는 마지막 단계 플래그일 뿐, 게이트/리뷰 자동 우회가 아니다.

위임별 주입 키: drafter→`changed_files`/`stage`, evaluator→`evaluator_verdict`/`evaluator_notes`,
human→`approved_human`/`force_publish`.

`--inspect` 의 `next` 로 위임 결정:
- `['code_drafter']` → drafter subagent / `['evaluator']` → evaluator subagent
- `['human_review']` → 사용자 승인 / `[]` → 종료(publish 완료)

---

## 9. publish — 안전 배포

`pass_agent_harness` publish 의 post-gate swap 방어를 그대로:
1. `force_publish` 없으면 미통과본(`fail`/`NEEDS_WORK`) commit 거부
2. **현재 changed_files 해시 ≠ validated_changeset_hash → 거부** (게이트 후 본문 교체 탐지)
3. `pending_human_approvals ⊆ approved_human` 아니면 거부 (H.1/H.2 미승인 차단)
4. 통과 시: 워크트리에서 commit → 메인 레포에 **새 브랜치**(`dev-harness/<thread>`)로 ref 생성
   (§5.2). 메시지에 게이트 증거 요약. PR 은 H.2 승인 시에만 `gh pr create`.
5. **[§15] 맥락 기록 — commit 성공 후에만:**
   - `progress.append(...)` → `PROGRESS.md` 맨 위에 area·kind·게이트증거·리뷰·SSOT영향 1항목 추가
   - `state.update(area, ...)` → `state.json` 의 해당 area 의 last_thread/last_change/ssot_rev/status 갱신
   - 이 둘은 **publish 만** 호출 → 검증·승인된 변경만 맥락에 남는다(자기보고 금지의 연장, §15.4).

> camping 은 main 브랜치 직접 작업 중 — publish 는 항상 **새 브랜치**를 만든다(Claude Code 규약: default
> 브랜치면 먼저 브랜치). main 직접 이동·push/PR 은 H.2 승인 필수. PROGRESS/state 갱신 자체도 그 브랜치
> 커밋에 포함(메인 트리 직접 수정 안 함).

---

## 10. 이식 매핑 — 무엇을 복사하고 무엇을 새로 쓰나

**[cycle1 H4] 재사용은 "코드 줄"이 아니라 "구조·패턴" 단위로 본다.** SqlAnalysisState→DevState 는
필드명 변경이 아니라 의미구조 교체(SqlArtifact→changed_files, Violation→GateResult)다. 아래 비율은
**파일을 베껴 쓰는 비율이 아니라, 토폴로지·분기·CLI 골격·잠금 패턴을 그대로 따른다는 뜻**이다.

| pass_agent_harness 파일 | 코드 재사용 | 패턴 재사용 |
|---|---|---|
| `harness/state.py` | ~25% (route 상한·digest 함수꼴) | 높음 — TypedDict+부분업데이트 관례 |
| `harness/graph.py` | ~60% (빌더·엣지·route 함수·checkpointer 골격) | 높음 — 토폴로지 동형(+apply/reset 추가) |
| `harness/router.py` | 신규 | 중간 — 정규식 분류 방식 차용 |
| `harness/__main__.py` | ~70% (CLI 명령군·inject 보호·thread·async 패턴) | 높음 — orchestrator 규약 동일 |
| `harness/nodes/evaluator.py` | ~60% (interrupt+verdict 판정 골격) | 높음 — fresh-context 3중 잠금 그대로, view 셸만 diff 기준 |
| `harness/nodes/contract_checker.py` | ~30% (구조만; 입력이 violations→gate exit code 로 교체) | 중간 |
| `harness/nodes/gate_*.py` | 신규 (정규식 룰 → subprocess 전면 교체) | 낮음 |
| `harness/nodes/sql_drafter.py` | → `code_drafter.py` 신규 (prompt 빌더 구조 참고) | 중간 |
| `harness/nodes/publish.py` | ~40% (swap 방어·승인 검사 패턴; git/워크트리는 신규) | 중간 |
| `harness/nodes/apply.py`, `reset_gates.py` | 신규 (원본에 없음) | — |
| `harness/rules/*.py` | 폐기 (게이트가 대체) | — |

→ **그대로 가져오는 것:** 토폴로지 동형 구조, route 함수 2개, CLI 명령군(--inspect/--get-prompt/
--inject/--resume)+보호 패턴, fresh-context evaluator 잠금, swap 해시 방어, 루프 상한.
**새로 쓰는 것(작업의 대부분):** 게이트 4종, apply/reset_gates, code_drafter, dev 계약 레지스트리,
changeset_digest, 워크트리·git 로직. 솔직한 추정으로 **신규 코드가 전체의 절반 이상**이다.

---

## 11. 구현 단계 (제안)

- **Phase 0** — 골격 + `--dry`: state/graph/router/main 이식, 노드는 stub. `python -m devagent --dry` 로
  토폴로지 검증 (langgraph 미설치라도 동작).
- **Phase 1** — 게이트 4종 + apply/reset_gates(워크트리·read-append). `--validate <diff>` 로 게이트 단독 회귀.
- **Phase 2** — contract_checker + 계약 레지스트리 + route 함수 연결. 전 그래프 컴파일·dry-run.
- **Phase 3** — code_drafter / evaluator prompt 빌더 + `--get-prompt`. orchestrator end-to-end.
- **Phase 4** — publish(브랜치+commit, swap 방어) + human_review 승인 흐름.
- **Phase 5** — 하네스 자체 회귀 테스트(`dev-harness/tests/`). [cycle2 L5] **부트스트랩 역설 처리:** 이
  테스트들은 하네스를 거치지 않고 직접 작성한다(하네스로 하네스를 검증하면 순환). 이후부터 하네스 자체
  변경은 하네스가 강제.

---

## 12. 확정된 세부 규약 (cycle1~2 보완)

- **[c1 M2 · 구현정정] Checkpoint 동기:** 설계는 async(`ainvoke`+`AsyncSqliteSaver`)였으나, camping 의
  Python 3.9.6 + aiosqlite 0.22.1 조합에 `Connection.is_alive` 버그가 있어 **sync `SqliteSaver` +
  `graph.invoke()`** 로 구현했다(검증 완료). 기능 동일, 더 단순. async 가 필요해지면(동시 다수 thread
  처리) 환경 업그레이드 후 전환.
- **[c1 M4] human_review vs publish 역할 분리:** `human_review` 는 `interrupt_before` 멈춤 지점일 뿐
  pass-through. human 승인 강제(`pending ⊆ approved`, swap 해시, force_publish)는 **전부 `publish`**
  한 곳에서만 — 중복·모순 제거.
- **[c1 M5] 정리:** publish/`--gc` 가 thread 워크트리 `git worktree remove --force` + 락 해제, 종료
  thread checkpoint 비움, 보존 thread 상한(예: 20).
- **[c1 L5] langgraph 버전 고정:** `interrupt()`·`AsyncSqliteSaver` 사용. `pipeline/graph_pipeline.py`
  와 환경 공유하므로 `requirements.txt` 에 `langgraph>=0.2.40` 하한, Phase 0 에서 실제 버전 검증.
- **[c1 L2] 바이너리·대용량:** `is_binary=True` 면 `new_body` 미보관·게이트 skip. `changeset_diff` 는
  200KB 상한 truncate.
- **[cycle2 L4] checkpoint 격리:** dev-harness 의 SqliteSaver 는 `dev-harness/.checkpoints.db` 에 둔다
  (`pipeline/graph_pipeline.py` 와 **다른 파일** — thread_id 네임스페이스 충돌 차단).
- **[cycle2 M5] 상한 도달 시 동작:** `route_after_contract` 가 상한을 보지만, 그 시점엔 이미 apply+게이트가
  한 번 더 돈 뒤다(즉시 멈춤 아님). 이는 **의도된 동작** — 마지막 라운드 산출물도 게이트 증거를 갖춘 채
  human_review 에 올려야 사용자가 "현 상태"를 보고 판단할 수 있다. 낭비를 줄이려면 revise 가 round==LIMIT
  를 미리 보고 drafter 재호출을 건너뛰는 최적화는 선택사항.
- **[cycle2 L3] `revision_round` 접근:** 항상 `state.get("revision_round", 0)` — `total=False` 라
  키 부재 시 KeyError 방지(첫 진입엔 intake 가 0 으로 세팅하지만 방어적으로).

## 13. 여전히 열린 결정 (사용자 확인 필요)

1. **CLAUDE.md 연동** — camping 루트에 dev-harness orchestrator 절차(§8)를 명문화한 CLAUDE.md 를
   추가할지. ([cycle1 L7] 없으면 orchestrator 규약이 사람 실수에 의존 — 안전장치의 강제력이 약해진다.
   추가 권장.)
2. **게이트 도구 도입 범위** — [cycle2 L1] **ruff 는 zero-config 로 즉시 동작**하므로 Phase 0 부터
   최소 1개 게이트(lint)를 실제 강제하길 권장(전부 skip 인 "빈 하네스" 방지). mypy/pytest 는 camping 에
   타입힌트·테스트가 없어 당장은 skip 이 현실적 — `pyproject.toml` 설정 시점을 언제로 할지.
3. **review kind 우선순위** — 코드 작성보다 "기존 코드/PR 리뷰" 부터 쓸모가 클 수 있다(축소 경로라
   구현 빠름, 워크트리/apply 불필요). Phase 순서를 review-first 로 바꿀지.

---

## 14. SSOT 레이어 — 5개 영역의 단일 진실원본 (사용자 요구)

> "여러 측면에서 SSOT 가 있어야 한다" — area 마다 권위 문서 1개를 정하고, 그 영역의 모든 변경이 그것과
> 정합하도록 강제한다. SSOT 가 없으면 에이전트가 영역마다 모순된 가정으로 코드를 짠다.

### 14.1 SSOT 레지스트리 — `dev-harness/ssot/registry.yaml`

각 영역의 **정본(canonical) 1개**와 파생/참고를 명시한다. 정본이 SSOT, 나머지는 SSOT 를 따른다.

```yaml
auth:
  canonical: dev-harness/ssot/auth.md        # 신규 — 로그인/회원/세션/권한 모델
  derived: []
frontend:
  canonical: dev-harness/ssot/frontend.md     # 디자인시스템·페이지맵·컴포넌트 인벤토리
  derived: [DESIGN-social.md, site/style.css] # 정본을 따르는 산출물
backend:
  canonical: dev-harness/ssot/backend.md      # API 계약·아키텍처
  derived: [backend-plan/ARCH-R1.md, backend-plan/ARCH-R2.md, backend-plan/ARCH-R3.md]
devagent:
  canonical: dev-harness/DESIGN.md            # 이 문서
  derived: [dev-harness/critique/]
data:
  canonical: dev-harness/ssot/data.md         # DB 스키마·데이터사전·파이프라인 계약
  derived: [DATABASE-DESIGN.md, schema.sql, pipeline/README.md]
```

> camping 은 이미 `DATABASE-DESIGN.md`, `backend-plan/ARCH-R*.md`, `DESIGN-social.md` 등 권위 문서가
> 흩어져 있다(다중 진실 = SSOT 위반). 레지스트리는 이들을 **영역별 정본 1개로 수렴**시키는 장치다.
> 정본 ssot/*.md 는 흩어진 derived 문서의 핵심을 한 곳으로 끌어올린 요약+불변규칙(invariants)이다.

### 14.2 `gate_ssot` — 정합성 검사 (계약 K.1/K.2)

- **K.1 (needs_llm):** 변경(`changeset_diff`)이 해당 area SSOT 의 불변규칙과 모순되는지 evaluator 가
  검사한다. 결정론적으로 잡기 어려운 의미 정합성(예: "auth 는 세션 토큰을 쿠키 httpOnly 로만" 규칙을
  변경이 어기는지)이라 LLM 몫. evaluator view 에 **해당 area SSOT 본문이 추가**된다(다른 영역 SSOT 는
  미노출 — 컨텍스트 오염·범위 혼동 방지).
- **K.2 (human):** 변경이 **SSOT 정본 파일 자체**(`registry.canonical`)를 수정하면 `needs_human` —
  SSOT 변경은 영역의 헌법을 바꾸는 일이라 사용자 명시 승인 필수. 일반 코드 변경(derived/구현)은 K.1 만.
- intake 가 `area` 로 `ssot_refs`(정본 경로)를 레지스트리에서 채우고, drafter 컨텍스트와 evaluator
  view 에 그 본문을 싣는다.

### 14.3 SSOT ↔ devagent 영역의 자기참조

`devagent` 영역의 SSOT 는 이 `DESIGN.md` 자신이다. 즉 **하네스 설계 변경도 하네스가 강제**한다
(현재 critique 루프가 수동으로 하는 일을, 향후 area=devagent 요청으로 그래프가 강제). [cycle2 L5]
부트스트랩 역설과 정합: 최초 구현만 수동, 이후 자기 영역 변경은 K.1/K.2 로 셀프 거버넌스.

---

## 15. PROGRESS & state — 개발 맥락의 영속화 (사용자 요구)

세션이 끊겨도 "지금 어디까지 됐고, 무엇이 열려 있고, 각 영역 SSOT 가 어느 버전인지"를 항상 알 수 있어야
한다. **state(기계용) + PROGRESS(사람용)** 두 층으로 나눈다.

### 15.1 두 층의 분리

| 층 | 파일 | 성격 | 누가 쓰나 |
|---|---|---|---|
| **runtime state** | `.checkpoints.db` (thread 별) | LangGraph DevState 스냅샷 — 진행 중 1건의 실행 상태 | 그래프(자동) |
| **project state** | `dev-harness/state.json` | 영역별 현황 요약 — 세션 간 영속 | publish / `--status` |
| **PROGRESS** | `dev-harness/PROGRESS.md` | 사람이 읽는 변경 이력 타임라인 | publish(append) |

runtime state 는 "한 작업의 실행 위치"(어느 노드, 몇 라운드), project state 는 "프로젝트 전체의 현재
모습"(영역별 마지막 변경·열린 thread·SSOT 버전), PROGRESS 는 "무슨 일이 있었나"의 내러티브다.

### 15.2 `dev-harness/state.json` — 영역별 현황 (project state)

```json
{
  "updated": "2026-06-10T21:00:00Z",
  "areas": {
    "auth":     {"ssot_rev": "—", "last_thread": null, "open_threads": [], "status": "not_started"},
    "frontend": {"ssot_rev": "a1b2", "last_thread": "20260610T2100Z_login_ui",
                 "open_threads": [], "status": "active", "last_change": "로그인 화면 컴포넌트 추가"},
    "backend":  {"ssot_rev": "c3d4", "last_thread": null, "open_threads": ["20260610T..._api"], "status": "in_progress"},
    "devagent": {"ssot_rev": "e5f6", "last_thread": "...", "status": "active"},
    "data":     {"ssot_rev": "0789", "last_thread": null, "status": "stable"}
  },
  "active_threads": ["20260610T..._api"]
}
```

- `ssot_rev` = 해당 영역 정본 SSOT 의 git blob 해시(짧게) — SSOT 가 언제 바뀌었는지 추적.
- `publish` 가 commit 직후 이 파일을 갱신(해당 area 의 last_thread/last_change/ssot_rev/status).
- `intake` 는 시작 시 이 파일을 읽어 drafter 에게 "이 영역의 현재 상태"를 컨텍스트로 준다 →
  개발 맥락 연속성. `--status` CLI 가 이걸 표로 출력.

### 15.3 `dev-harness/PROGRESS.md` — 사람용 타임라인

`publish` 가 commit 성공 시 **맨 위에 한 항목 append**(역시간순). 형식:

```markdown
## 2026-06-10 21:05 · frontend · feature · ✅ merged
**요청:** 로그인 화면 UI 추가
**변경:** site/login.html, site/app.js (+124 −3)  ·  scope: site/
**게이트:** diff_scope ✅ · ssot K.1 ✅ · lint ✅ · type skip · tests skip
**리뷰(evaluator):** PASS — "폼 검증 누락 없음, httpOnly 쿠키 규칙 준수"
**브랜치:** dev-harness/20260610T2100Z_login_ui  ·  thread: …
**SSOT 영향:** 없음 (derived 만 변경)
```

→ 이 한 항목에 "맥락"의 전부가 있다: 무엇을·왜·어느 영역·어떤 증거로 통과했고·SSOT 를 건드렸나.
camping 의 기존 `PROGRESS.md`(pass_agent_harness)와 같은 역할이되, **게이트 증거가 박힌다**는 점이
다르다(자기보고가 아니라 그래프가 검증한 사실의 기록).

### 15.4 PROGRESS/state 의 신뢰성 — 자기보고 금지 원칙 연장

PROGRESS 와 state 는 **publish 노드만** 쓴다(drafter/evaluator 가 직접 못 씀). publish 는 게이트·리뷰를
통과하고 human 승인을 받은 변경에 대해서만 도달하므로, 기록은 "그래프가 강제한 사실"이지 LLM 의 주장이
아니다. Default-FAIL 정신의 연장 — **검증되지 않은 진전은 PROGRESS 에 올라가지 않는다.**

### 15.5 CLI

```
python -m devagent --status              # state.json 을 영역별 표로 출력 (지금 어디까지)
python -m devagent --progress [N]        # PROGRESS.md 최근 N 항목
python -m devagent --ssot <area>         # 해당 영역 정본 SSOT 경로/요약 출력
```

---

## 16. 다중 세션 동시성 — 작업 원장(ledger)과 상호 인지 (사용자 요구)

> 여러 Claude Code 세션이 동시에 dev-harness 를 돌릴 수 있다. 각 세션의 에이전트는 **지금 다른 세션들이
> 무엇을, 어느 영역에서, 어떤 파일에 대해 작업 중인지** 항상 파악하고 있어야 한다. 그래야 충돌을 피하고,
> 같은 SSOT/파일을 두 곳에서 동시에 건드리는 사고를 막는다.

### 16.1 세션 vs thread

- **세션(session)** = 하나의 Claude Code 채팅(orchestrator). 고유 `session_id`(예: 시작 시각+pid 해시).
- **thread** = 하나의 LangGraph 실행 단위(작업 1건). 한 세션이 여러 thread 를 순차로 돌릴 수 있다.
- 동시성은 두 결: **세션 간**(서로 다른 채팅) + **같은 세션 내 thread 간**. 원장은 둘 다 추적한다.

### 16.2 작업 원장 — `dev-harness/active.json`

진행 중(미종료) thread 의 **단일 권위 레지스트리**. `state.json`(완료 누적 현황)과 분리 — 이건 "지금
살아있는 작업"만 담는다. 모든 쓰기는 §16.4 락 아래에서 원자적으로.

```json
{
  "updated": "2026-06-10T21:30:05Z",
  "threads": [
    {
      "thread_id": "20260610T2100Z_login_ui",
      "session_id": "s_2af3",
      "area": "frontend",
      "kind": "feature",
      "request": "로그인 화면 UI 추가",
      "scope_paths": ["site/login.html", "site/app.js"],
      "ssot_refs": ["dev-harness/ssot/frontend.md"],
      "stage": "evaluator",
      "base_ref": "a1b2c3",
      "lease_until": "2026-06-10T21:35:05Z",
      "started": "2026-06-10T21:00:11Z"
    },
    {
      "thread_id": "20260610T2118Z_api_session",
      "session_id": "s_9e1d",
      "area": "backend",
      "kind": "feature",
      "scope_paths": ["backend/api/session.py"],
      "ssot_refs": ["dev-harness/ssot/backend.md"],
      "stage": "code_drafter",
      "lease_until": "2026-06-10T21:34:40Z"
    }
  ]
}
```

원장 엔트리 수명:
- `intake` 가 thread 시작 시 엔트리 **append**(lease 부여).
- 매 노드 전이마다(또는 orchestrator 의 `--inspect`/`--inject` 마다) **lease 갱신(heartbeat)**.
- `publish`(또는 abort/`--gc`)가 엔트리 **제거**.
- [cycle2 미해결 stale 락 답] `lease_until` 경과 = 죽은 세션 → 다른 세션이 회수(reap) 가능.
  PID/heartbeat 가 아니라 **시간 리스(TTL)** 라 비정상 종료해도 영구 잠김이 없다.

### 16.3 상호 인지 — intake 가 "동시 작업 뷰"를 만든다

새 thread 의 `intake` 는 원장을 읽어 두 가지를 한다:

1. **에이전트 컨텍스트 주입:** drafter/orchestrator 에게 "현재 동시 진행 작업" 요약을 전달 →
   에이전트가 다른 세션의 작업을 *이해한 상태로* 코드를 짠다. (예: "backend 세션이 session.py 를
   만드는 중 → 나는 그 API 시그니처를 가정하지 말고 SSOT 계약만 의존.")
2. **충돌 사전 탐지(`gate_scope_overlap` / intake 단계):**
   - **scope 겹침:** 내 `scope_paths` ∩ 다른 활성 thread 의 `scope_paths` ≠ ∅ → **충돌 경고**.
     orchestrator 가 사용자에게 보고하고 (a) 직렬화(상대 완료 대기) (b) scope 좁히기 (c) 명시적 강행
     중 택1. 자동 진행 금지(두 워크트리가 같은 파일을 따로 수정하면 머지 충돌).
   - **같은 area SSOT 동시 수정:** 두 thread 가 같은 정본 SSOT(K.2)를 건드리면 **하드 블록** — SSOT 는
     영역의 헌법이라 동시 개정 불가. 먼저 시작한 쪽 완료까지 직렬화.
   - **base_ref 드리프트:** 다른 thread 가 이미 publish 해서 HEAD 가 움직였으면, 내 base_ref 가 낡음 →
     rebase 안내(이미 §5.1 병렬충돌 감지와 연결).

### 16.4 원장 쓰기 원자성

`active.json`/`state.json`/`PROGRESS.md` 갱신은 **단일 디렉토리 락**(`dev-harness/.ledger.lock`,
TTL 리스) 아래 read-modify-write. 다중 세션의 동시 append 레이스를 막는다. 락 자체도 TTL 이라 죽은
세션이 잡고 죽어도 회수된다. (§5.2 의 thread-별 워크트리 락과 별개 — 이건 공유 원장 전용.)

### 16.5 CLI

```
python -m devagent --sessions            # active.json 을 표로: 누가/어느 area/어느 파일/어느 stage
python -m devagent --conflicts <scope>   # 주어진 scope 가 활성 thread 와 겹치는지 사전 점검
python -m devagent --reap                 # lease 만료된 죽은 thread 엔트리 회수(+워크트리 정리)
```

### 16.6 왜 원장이 SSOT 인가

"동시 작업 현황"도 하나의 SSOT 여야 한다 — 세션마다 제 기억에 의존하면 서로 모순된 그림을 본다.
`active.json` 이 **그 단일 진실원본**이고, 모든 세션은 시작·전이 때 이걸 읽어 동일한 동시성 그림을
공유한다. devagent 영역의 자기 거버넌스(§14.3)가 이 원장 규약 자체에도 적용된다.

---

## 17. 3대 개발 축 — 인지·구분·축별 작동 (사용자 요구)

> 에이전트는 backend·frontend·data **세 축을 명확히 인지하고 구분해서** 작동해야 한다. 세 축은 런타임
> (브라우저 vs 서버 vs 배치)·툴체인·증거 방식·실패 양식이 근본적으로 다르다. 한 drafter 가 세 축을
> 뭉뚱그려 짜면 어느 축의 규칙도 제대로 못 지킨다. 따라서 **축 판별 → 축별 프로파일 적용**이 강제된다.

### 17.1 축 판별 — 경로 우선, 키워드 보조

축은 **건드리는 파일 경로**로 1차 판별한다(가장 신뢰도 높은 신호). 키워드는 경로가 모호할 때 보조.

| 축 | 경로 신호 (camping) | 키워드 신호 | 런타임 |
|---|---|---|---|
| `frontend` | `site/**` (`*.html/.js/.css`, `manifest`, `sw.js`) | UI·화면·컴포넌트·디자인·반응형·접근성 | 브라우저(PWA) |
| `backend` | `backend/**`, `backend-plan/**`, API 서버 코드 | API·엔드포인트·라우트·서버·인증·미들웨어 | 서버 프로세스 |
| `data` | `pipeline/**`, `schema.sql`, `*.db`, `seed_*.sql`, `*.csv` | 스키마·마이그레이션·집계·크롤·파이프라인·정합성 | 배치/SQLite |

- 경로 신호가 **두 축 이상**을 가리키면 → **교차 축 변경**(§17.4)으로 분기, 자동 진행 금지.
- 경로가 아직 없는 신규 작업(예: backend 최초 생성)은 키워드 + 사용자 1질문으로 축 확정.
- `router.classify_axis()` 가 (area 와 함께) 축을 정하고, 모호하면 orchestrator 가 확정.

### 17.2 축별 작동 프로파일 — 게이트·증거·SSOT 가 다르다

각 축은 **서로 다른 게이트 프로파일**로 작동한다. 같은 `gate_lint`/`gate_tests` 노드라도 축에 따라
실행 도구·증거가 달라진다(노드는 `state["axis"]` 를 보고 프로파일 분기).

| 항목 | frontend | backend | data |
|---|---|---|---|
| lint | eslint/prettier (설정 시) | ruff | ruff |
| typecheck | tsc (TS 일 때) | mypy | mypy |
| tests | jest/playwright | pytest (API 계약·단위) | pytest + **데이터 정합성**(camping `validate_ranges.py`·`audit.py`) |
| 고유 증거 | 렌더 스냅샷·콘솔에러·번들크기 | 엔드포인트 응답·상태코드·계약 | **행수·스키마 diff·범위검사·중복검사** |
| 고유 게이트 | (선택) a11y/lighthouse | API 계약 일치 | **스키마 마이그레이션 안전성**(파괴적 변경 차단) |
| SSOT | `ssot/frontend.md` (디자인시스템·페이지맵) | `ssot/backend.md` (API 계약·아키텍처) | `ssot/data.md` (스키마·데이터사전) |
| 위험 승인(human) | 외부 배포(site export/push) H.2 | — | **DB 마이그레이션/파괴적 스키마 변경 H.1** |

> data 축은 camping 에 이미 `validate_ranges.py`·`audit.py`·`crosssource.py` 같은 **데이터 정합성
> 도구가 존재**한다 — data 축 `gate_tests`/evidence 는 이들을 호출해 "값이 말이 되는가"를 증거로 남긴다.
> 이건 frontend/backend 에 없는 data 고유 검증이다. 반대로 frontend 의 "렌더 결과·콘솔 에러"는 data
> 에 없다. **축마다 증거의 종류 자체가 다르다**는 게 구분 작동의 핵심.

### 17.3 축별 drafter/evaluator 컨텍스트 분리

- `intake` 가 축을 정하면, drafter 프롬프트에 **그 축의 SSOT + 컨벤션만** 싣는다(다른 축 SSOT 미노출
  → 컨텍스트 오염·축 혼동 방지). 예: frontend drafter 는 backend API 내부구현을 모르고, SSOT 의 API
  **계약**만 가정한다.
- evaluator view(§7.2)도 축별 SSOT 만 추가 — frontend 리뷰어는 디자인시스템 규칙으로, data 리뷰어는
  스키마 불변규칙으로 본다. 같은 evaluator 노드지만 보는 잣대가 축마다 다르다.

### 17.4 교차 축 변경 — 절대 뭉개지 않는다

한 요청이 두 축 이상을 건드리면(예: "로그인 기능" = frontend 화면 + backend 세션 + data 사용자 테이블):

- **기본: 축별 thread 로 분해.** orchestrator 가 요청을 축 단위로 쪼개 **각각 독립 thread**(제 scope·
  게이트·SSOT)로 돌린다. 각 thread 는 §16 원장에 따로 등록되어 서로의 진행을 인지한다.
- **축 간 계약 의존:** frontend thread 는 backend 가 아직 안 만든 API 를 **SSOT 계약으로만** 가정하고
  진행(구현 세부 의존 금지). 그래서 세 thread 가 병렬 진행 가능.
- **단일 thread 강행 시:** 사용자가 명시적으로 "한 번에" 요청하면 `axis="multi"` 로 표시하고 **세 축
  게이트를 모두** 적용(가장 엄격). 단 이때도 drafter 에게 "이건 교차 축이다 — 각 축 규칙을 모두 지켜라"를
  명시. 암묵적 뭉개기는 금지.
- 교차 축은 PROGRESS/state 에 **축별로** 기록되어 "이 변경이 어느 축들에 걸쳤나"가 남는다.

### 17.5 왜 축 구분이 안전장치인가

축을 안 가르면 "frontend 인 줄 알고 짠 코드가 실은 data 스키마를 건드려" 파괴적 마이그레이션을
무검증 통과시키는 사고가 난다. 축 판별이 **어느 게이트·어느 SSOT·어느 위험승인이 적용되는지**를
결정하므로, 축 구분은 단순 분류가 아니라 **올바른 안전장치를 거는 스위치**다. 그래서 축이 모호하면
진행 자체를 멈추고 확정부터 한다(`scope_paths` 빈 경우를 fail 시키는 §5.1 L4 와 같은 보수 정책).
