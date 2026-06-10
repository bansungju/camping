# Cycle 3 Doubt — 구현 코드 적대적 감사 (v3 + 실제 코드)

---

## CRITICAL (런타임 실패 / 안전장치 미작동)

### [C1] `apply.py:54-67` — wt 경계 검사 부재 → 레포 밖 파일 쓰기 가능

**파일:** `nodes/apply.py` 54–67행
```python
target = os.path.join(wt, path)          # path = '../../../etc/passwd'
os.makedirs(os.path.dirname(target) or wt, exist_ok=True)
with open(target, "w", encoding="utf-8", newline="") as fh:
    fh.write(f.get("new_body", ""))
```
`os.path.join("/wt/thread", "../../../etc/passwd")` = `/camping/etc/passwd`. `os.path.realpath` 체크 없음. `gate_diff_scope`(S.1)는 `scope_paths`와 path 문자열을 대조할 뿐 wt 경계를 검증하지 않는다. `scope_paths`가 `["../../etc"]`면 S.1도 통과한다. drafter가 악의적 path를 inject하거나, 외부 오케스트레이터가 `--inject '{"changed_files":[{"path":"../../.env","new_body":"..."}]}'`를 날리면 wt 밖 임의 경로를 덮어쓴다.

**수정:** `apply.py` 파일 반영 루프 진입 전:
```python
abs_target = os.path.realpath(target)
abs_wt = os.path.realpath(wt)
if not abs_target.startswith(abs_wt + os.sep):
    raise ValueError(f"path escape: {path!r} resolves outside worktree")
```

---

### [C2] `nodes/gate_tests.py:44-45` — `has_tool("python3")` fallback이 `pytest` 부재 환경에서 T.1=fail 유발

**파일:** `nodes/gate_tests.py` 44–45행
```python
runner_present = has_tool("pytest") or has_tool("python3")
```
`has_tool("python3")=True`(시스템 python3 존재)이면 `runner_present=True`. 그런데 venv/conda 등 pytest가 모듈로 없는 환경에서 `python3 -m pytest -q`를 실행하면:
- exit_code=1, output=`"No module named pytest"`
- `_no_tests_collected("no module named pytest")` → False (패턴 불일치)
- → `status="fail"` → T.1 계약 fail → revise 루프 진입

환경 사실(py3.9.6, pytest 별도 설치 여부 불확실)에서 camping venv에 pytest가 없으면 프로젝트에 테스트가 한 개도 없어도 **T.1 fail → 무한 revise**에 빠질 수 있다. `has_tool("python3")` fallback은 "pytest를 python3으로 실행할 수 있다"는 의미가 아니다.

**수정:**
```python
runner_present = has_tool("pytest")          # python3 fallback 제거
# OR
runner_present = has_tool("pytest") or (has_tool("python3") and
    __import__("subprocess").run(["python3", "-c", "import pytest"],
                                  capture_output=True).returncode == 0)
```

---

### [C3] `nodes/apply.py:66` + `state.py:153` — surrogatepass 불일치 → UnicodeEncodeError 노드 크래시

**파일:** `state.py:153`, `nodes/apply.py:66`
```python
# state.py:153 — digest: surrogatepass 사용
blob.encode("utf-8", errors="surrogatepass")

# apply.py:66 — 파일 쓰기: surrogatepass 없음
with open(target, "w", encoding="utf-8", newline="") as fh:
    fh.write(f.get("new_body", ""))     # lone surrogates → UnicodeEncodeError
```
`changeset_digest`는 고립 서로게이트가 있는 `new_body`를 surrogatepass로 처리하므로 에러 없이 해시를 만든다. 그러나 apply가 같은 `new_body`를 디스크에 쓸 때 `UnicodeEncodeError` → 노드 크래시 → `evidence`에 fail 항목 기록 후 `workspace=""` 반환. 이후 모든 게이트가 `workdir(state)=paths.REPO_ROOT`로 레포 루트에서 실행된다(격리 실패).

**수정:** `open(target, "w", encoding="utf-8", errors="surrogatepass", newline="")`

---

### [C4] `nodes/publish.py:55-63` — `git add -A` + commit이 wt의 실제 파일 기준 → `validated_changeset_hash`와 wt 내용 불일치 시 안전장치 우회

**파일:** `nodes/publish.py:55-62`
```python
_git(["add", "-A"], cwd=wt)
ccode, cout = _git(["commit", "-m", msg], cwd=wt)
```
`_blocked_reason`은 `changeset_digest(state["changed_files"])` vs `validated_changeset_hash`를 비교해 inject 기반 swap을 탐지한다. 그러나 `git add -A`는 wt 디렉토리의 **실제 파일**을 기준으로 커밋한다. `human_review` interrupt 후 `--resume` 전에 사용자(또는 다른 프로세스)가 wt 파일을 직접 수정하면:
- `state["changed_files"]`의 `new_body` = 검증된 내용
- wt 디스크 파일 = 수정된 내용
- `changeset_digest(state["changed_files"])` == `validated_changeset_hash` → swap 탐지 통과
- 실제 커밋에는 수정된 내용 포함

`validate_changeset_hash`는 state 딕셔너리 일관성만 보장하고, **state ↔ wt 실제 파일 일관성**은 검증하지 않는다.

**수정:** publish가 commit 전 `git diff --cached --name-only HEAD`와 `state["changed_files"]` 경로 목록을 비교, 또는 wt 각 파일의 sha256을 state의 `new_body` 해시와 대조.

---

## HIGH

### [H1] `ledger.py:21-40` — TTL 탈취의 TOCTOU 레이스: 두 프로세스가 lock을 동시에 획득 가능

**파일:** `ledger.py:32-37`
```python
age = time.time() - os.path.getmtime(paths.LEDGER_LOCK)
if age > LOCK_TTL:
    os.unlink(paths.LEDGER_LOCK)     # ← unlink와 O_EXCL 사이에 gap
    continue                          # ← loop top에서 O_EXCL 재시도
```
두 프로세스 A·B가 동시에 `age > LOCK_TTL`을 판단:
1. A: `os.unlink` 성공
2. B: `os.unlink` → `FileNotFoundError` → `except OSError: continue`
3. A: loop top → `O_CREAT|O_EXCL` 시도 전에 B도 `O_CREAT|O_EXCL` 시도
4. OS 레벨 원자성으로 하나만 성공하지만, `unlink` → `continue`의 gap에서 두 번째 프로세스가 먼저 lock을 잡으면 A는 정상 대기하므로 deadlock은 없다.

실질 위험: camping에 현재 backend 세션 + main 세션이 동시 실행 중. `LOCK_TTL=15`초인데 apply 노드가 `heartbeat`만 호출하고(apply.py:75) **나머지 노드는 heartbeat 미호출**. gate 5개 + evidence + contract_checker가 돌면 15초를 쉽게 넘는다 → stale 판단 → 탈취 시도 → 원장 쓰기 경합.

**수정:** lock 파일에 PID를 기록해 "내가 만든 lock인지" 검증 추가, 또는 heartbeat를 각 노드 시작/종료 시 호출.

---

### [H2] `nodes/apply.py:74-75` — `heartbeat` 호출이 apply 노드 하나뿐 → `LEASE_SECONDS=300` 내에 다른 노드 전체가 돌면 lease 만료 → 타 세션이 내 thread를 dead로 판단

**파일:** `nodes/apply.py:74-75`
```python
if thread_id:
    ledger.heartbeat(thread_id, stage="apply")
```
intake, code_drafter(interrupt 후 재진입), gate_diff_scope, gate_scope_overlap, gate_ssot, gate_lint, gate_typecheck, gate_tests, evidence_collector, contract_checker, evaluator(interrupt 후), revise — 이 중 어느 노드도 heartbeat를 호출하지 않는다. `LEASE_SECONDS=300`(5분)이지만 LLM subagent 대기(drafter/evaluator) + 게이트 실행 합산이 5분을 넘으면 `ledger.active_threads()`에서 내 thread가 dead로 분류된다.

gate_scope_overlap이 다른 세션을 dead 판단으로 무시 → X.1/X.2 fail 누락 → 동일 파일 동시 수정 허용. 특히 현재 backend 세션이 동시에 작동 중이어서 즉각적인 실사례.

**수정:** 각 노드 진입 시 `ledger.heartbeat(thread_id, stage=<노드명>)` 호출. 또는 graph에 node entry hook 사용.

---

### [H3] `router.py:63-68` — auth area → axis=backend 강제가 frontend 로그인 UI 작업을 잘못 프로파일링

**파일:** `router.py:63-68`
```python
if area == "auth":
    return "backend"   # 보수적 — 세션/토큰이 핵심
```
요청 `"로그인 화면 버튼 색상 수정"`:
- `_AUTH_RE.search` 매치(로그인) → `area="auth"` (**devagent > auth > 나머지** 우선순위)
- `_FRONTEND_RE`가 "화면", "버튼"을 매치해도 area 결정 후 axis 분류에서 쓰이지 않음
- `classify_axis`: `area="auth"` → `return "backend"`
- 결과: `axis="backend"` → `gate_lint`에서 ruff(py) 실행, eslint/tsc 스킵
- frontend JS/TS 파일은 lint/typecheck 게이트 미적용

auth area가 `scope_paths` 없이 키워드만으로 분류될 때 frontend 로그인 UI가 backend 프로파일로 처리된다. 게이트 자체가 skip(파일 없음)이라 런타임 오류는 없지만 §17 "축별 도구 프로파일"이 실질적으로 무력화된다.

**수정:** `classify_axis`에서 auth area의 keyword fallback도 `classify_area`와 독립적으로 축 신호를 채점:
```python
if area == "auth":
    fe = len(_FRONTEND_RE.findall(request))
    return "frontend" if fe > 0 else "backend"
```

---

### [H4] `nodes/gate_lint.py:12-13`, `gate_typecheck.py:12-14`, `gate_tests.py:40-45` — axis="multi" 처리 누락: frontend 도구 미실행

**파일:** 세 게이트 파일 공통
```python
if axis == "frontend":
    ...
else:          # backend, data, multi 전부 여기
    py = [p for p in changed if p.endswith(".py")]
    tool, target = ["ruff", "check"], py
```
`axis="multi"`(교차축)일 때 `else` 분기에서 Python 도구만 실행된다. JS/TS 파일의 eslint, tsc, npm test는 실행되지 않는다. §17.2에서 multi 축에 대한 별도 프로파일을 언급하지만 코드에 분기가 없다.

**수정:**
```python
if axis in ("frontend", "multi"):
    js = [p for p in changed if p.endswith((".js", ".ts", ".jsx", ".tsx"))]
    # run eslint if js
if axis in ("backend", "data", "multi"):
    py = [p for p in changed if p.endswith(".py")]
    # run ruff if py
```

---

### [H5] `nodes/publish.py:56-58` — wt에서 `git commit` 실패 시 silently continue → PROGRESS.md 갱신 여부 불일치

**파일:** `nodes/publish.py:56-63`
```python
ccode, cout = _git(["commit", "-m", msg], cwd=wt)
scode, sha = _git(["rev-parse", "HEAD"], cwd=wt)
if scode == 0 and sha != "__MISSING__":
    committed_sha = sha.strip()
```
`git commit`이 `exit_code != 0`(nothing to commit, pre-commit hook 실패, 권한 오류 등)이어도 이후 `git rev-parse HEAD`가 성공할 수 있다 — wt에 이미 이전 commit이 있으면 HEAD는 이전 커밋 sha를 반환한다. `committed_sha`가 비어 있지 않은 것처럼 보여 `progress.append_progress`가 호출될 수 있다.

실제: `git commit`이 "nothing to commit" 시 exit_code=1, 하지만 `rev-parse HEAD` = 마지막 wt commit sha. → `committed_sha`가 old sha로 채워짐 → PROGRESS.md에 "publish 완료" 기록되지만 실제 commit은 새 내용이 아님.

**수정:**
```python
ccode, cout = _git(["commit", "-m", msg], cwd=wt)
if ccode != 0:
    # commit 실패 명시
    committed_sha = ""
else:
    scode, sha = _git(["rev-parse", "HEAD"], cwd=wt)
    committed_sha = sha.strip() if scode == 0 and sha != "__MISSING__" else ""
```

---

## MEDIUM

### [M1] `nodes/gate_typecheck.py:19-20` — frontend axis에서 tsconfig.json 없는 wt에서 tsc 실행 → exit_code≠0 → Y.1=fail (skip 의도)

```python
tool = ["npx", "--no-install", "tsc", "--noEmit"]
code, out = run_tool(tool, cwd=wt)
```
wt는 `git reset --hard base_ref` 후 깨끗한 상태. camping `site/` 디렉토리에 `tsconfig.json`이 없으면 `tsc --noEmit`이 `error TS5058: The specified path does not exist` 또는 프로젝트 루트 스캔 오류로 exit_code=2 반환. `__MISSING__`이 아니므로 skip이 아닌 fail. `scope_paths` 밖 TS 파일까지 체크할 수 있다.

**수정:** tsconfig.json 존재 확인 후 없으면 skip:
```python
if not any(os.path.exists(os.path.join(wt, d, "tsconfig.json"))
           for d in ([""] + [os.path.dirname(p) for p in ts])):
    res = {"gate": "typecheck", "status": "skip", ...}
```

---

### [M2] `nodes/evidence_collector.py:32` — validate_ranges.py를 `cwd=wt`에서 상대경로로 실행

```python
code, out = run_tool(["python3", script], cwd=wt, timeout=180)
# script = "pipeline/validate_ranges.py"
```
`os.path.exists(full)`은 `paths.REPO_ROOT`에서 확인하지만, `run_tool`은 `cwd=wt`에서 `python3 pipeline/validate_ranges.py` (상대경로)를 실행. wt가 REPO_ROOT와 동일 `.git`을 공유하더라도, `git reset --hard base_ref` 후 `pipeline/` 에 스크립트가 없으면 `FileNotFoundError` → `__MISSING__` → 결과가 없는 것처럼 처리(skip).

더 심각한 케이스: `validate_ranges.py` 내부에서 `../data/*.db` 등 wt 상대 경로로 DB 파일 접근 시 wt에 해당 파일이 없어 스크립트 자체가 오류. 증거가 수집되지 않고 evaluator는 정합성 검증 없이 PASS 판단 가능.

**수정:** `run_tool(["python3", full], cwd=paths.REPO_ROOT, ...)` — 절대경로, REPO_ROOT cwd.

---

### [M3] `__main__.py:19-22` — `_PROTECTED`에 `changed_files`·`changeset_diff`·`force_publish`·`approved_human` 미포함

```python
_PROTECTED = {
    "gate_results", "evidence", "contract_checks", "revision_round",
    "pending_human_approvals", "validated_changeset_hash",
}
```

- `changed_files` 미보호: `--inject '{"changed_files":[...]}'`로 contract_checker 실행 후 human_review 전에 파일 교체 → `digest != validated_hash` → publish 거부(탐지됨). 하지만 **evaluator interrupt 중** 주입 시: evaluator.run()은 inject된 `evaluator_verdict=PASS`로 interrupt 생략, contract_checker 재실행 없이 human_review → publish에서 digest 불일치로 거부. 탐지되나 불필요한 오류 흐름.
- `changeset_diff` 미보호: evaluator가 보는 diff와 publish가 커밋하는 내용의 불일치를 drafter 없이 만들 수 있다.
- `force_publish` 미보호: `--inject '{"force_publish":true}'`로 게이트 fail 상태에서도 배포 강행 가능. cycle_2_answer [M2]에서 "human_review에서 항상 멈추니 안전"이라 했지만, human_review는 pass-through이므로 사용자가 `--resume`하면 force_publish=true가 활성화된 채로 publish 실행.

**수정:** `_PROTECTED`에 `"changeset_diff", "force_publish"` 추가. `approved_human`은 contract_checker가 항상 리셋하므로 큰 위험은 없으나 주입 차단 명시 권장.

---

### [M4] `nodes/apply.py:66` vs `state.py:106` — `new_body` 전체 본문 보관 미강제

`state.py:30`: `new_body: str` — optional (TypedDict `total=False`). drafter subagent가 partial diff(일부 함수만 수정한 텍스트)를 주입하면:
- apply가 `new_body` 그대로 씀 → 파일 전체가 diff로 교체됨
- wt에 전체 파일 대신 diff 텍스트가 저장됨 → lint/typecheck/테스트 모두 잘못된 입력
- cycle_2_answer에서 "new_body 전체 본문 강제"를 언급했으나 apply 코드에 검증 없음

**수정:** apply 진입 시 `new_body`가 diff-like(시작이 `---`/`+++`/`@@`)면 거부 또는 경고.

---

### [M5] `progress.py:61-66` — `update_state`에서 `ledger.active_threads()` 호출이 lock 내부에서 발생 → lock 점유 시간 연장

```python
def update_state(...):
    if not ledger._acquire_lock():
        return
    try:
        ...
        state["active_threads"] = [t.get("thread_id") for t in ledger.active_threads()]
        # active_threads()는 _read_raw() 호출 — 락 불필요하나 lock 안에서 실행됨
```
`ledger.active_threads()`는 lock 불필요(읽기 전용)라 주석에 명시돼 있으나, `update_state`의 lock 블록 안에서 호출된다. 문제 자체는 없지만, `_read_raw()` → `json.load()` I/O가 lock 점유 중에 발생해 backend 세션의 lock 대기 시간이 길어진다. LOCK_TTL=15초 내에 완료되지 않으면 탈취 시도가 시작된다.

---

## LOW / 누락

### [L1] `router.py:23-25` — `_PATH_FRONTEND` 정규식이 `site/` 하위만 매칭, `frontend/` 등 미매칭

```python
_PATH_FRONTEND = re.compile(r"^(site/|.*\.(html|css)$|.*/sw\.js$|.*manifest)", re.I)
```
camping의 프론트엔드가 `site/` 아닌 다른 디렉토리(예: `web/`, `client/`)에 있거나, 향후 구조 변경 시 `classify_axis`가 항상 fallback keyword로만 판단한다.

### [L2] `nodes/code_drafter.py:13-14` — `stage="draft"` 반환이 비어있지 않은 `changed_files`가 있을 때 early return — revise 후 `changed_files=[]`이 apply에 의해 재구성되기 전 상태에서 의도치 않게 재사용될 수 있음

revise → code_drafter 재진입 시 `changed_files=[]`(revise가 비움) → interrupt 발화. 정상. 그러나 `reset_gates`가 `changed_files`를 비우지 않으므로, 만약 그래프 다른 경로에서 `changed_files`가 있는 상태로 code_drafter에 도달하면 드래프터 없이 스킵된다. 현재 토폴로지에서는 revise만이 code_drafter 진입점이므로 즉각 버그는 아니나, 그래프 확장 시 취약.

### [L3] `nodes/apply.py:64-65` — `is_binary=True` 파일은 skip하지만 wt에 이미 있는 binary 파일을 삭제하지 않음

```python
if f.get("is_binary"):
    continue  # 바이너리는 게이트 skip — 본문 미보관
```
`status="deleted", is_binary=True`인 경우도 continue → 파일 미삭제. deleted + binary 조합에서 파일이 wt에 남아 commit에 포함됨.

### [L4] `__main__.py:148-158` — `_graph_for_thread`가 feature 그래프로 probe 후 state를 읽지만, `get_state` 이전에 전체 graph build (SqliteSaver 연결 포함)를 두 번 실행

```python
probe = build_for("feature", checkpointer=saver)
snap = probe.get_state(config)
kind = explicit_kind or (snap.values or {}).get("request_kind", "feature")
if kind == "review":
    graph = build_for("review", checkpointer=saver)
    return graph, graph.get_state(config)
return probe, snap
```
review kind일 때 `build_for("feature", ...)` + `build_for("review", ...)` = 두 번 build. 성능 문제는 미미하지만 같은 saver로 두 StateGraph를 빌드하면 checkpoint key 충돌 가능성(같은 `thread_id`를 두 그래프에서 `get_state`).

### [L5] `ssot.py:14-23` — `yaml` 미설치 시 `load_registry()` 빈 dict 반환 → 모든 SSOT 함수가 "없음" 처리

```python
try:
    import yaml
except ImportError:
    return {}
```
pyyaml 미설치면 `canonical_for(area)=""` → `is_ssot_path()=False` → K.2 never triggers, K.1 evaluator에 SSOT 본문 전달 안 됨. requirements.txt 누락 시 조용히 SSOT 전체 비활성화됨. 경고 출력 없음.

---

## cycle 2 회귀 점검

| cycle_2_doubt 항목 | 코드 반영 상태 | 잔류 문제 |
|---|---|---|
| **[C1]** reducer 역설 | ✅ 해소 — reducer 없음, `prev + [new]` 패턴, reset_gates 가 `[]` 통째교체 | 없음 |
| **[C2]** evaluator view `f["diff"]` 참조 | ✅ 해소 — `changeset_diff` 필드 사용, ChangedFile 메타만 | 없음 |
| **[C3]** reset_gates hash 미초기화 | ✅ 해소 — `reset_gates.run()` 이 `validated_changeset_hash=""` 반환 | 없음 |
| **[H1]** 워크트리 부재 복구 | ✅ 해소 — `apply`가 매 진입 `_ensure_worktree` 로 재구성 | [C4] wt↔state 파일 불일치는 미해소 |
| **[H5]** git diff 신규파일 누락 | ✅ 해소 — `git add -A` 후 `--cached` diff | 없음 |
| **[H4]** T.2 evaluator 단일 의존 | ✅ 해소 — T.2a 결정론 auto 복원 | [C2] has_tool(python3) 버그 신규 발생 |
| **[M2]** force_publish 우회 | ⚠️ 부분 — human_review interrupt 구조로 방어 | [M3] force_publish _PROTECTED 미포함 |
| **[M4]** approved_human 리셋 | ✅ 해소 — contract_checker 에서 `approved_human=[]` 리셋 | 없음 |
| **워크트리 파일락** (cycle2 다음사이클) | ✅ TTL 락 구현 | [H1] 탈취 레이스, heartbeat 미호출 gap |
| **과설계 ROI** (cycle2 다음사이클) | ❌ 미반영 — 28개 py 그대로 | 아래 참조 |

---

## 과설계 평가 + Phase 0 최소버전 제안

**camping 현실 (2026-06-10):**
- 테스트 0건 (pytest 있지만 `tests/` 없음)
- `ssot/registry.yaml` 존재 여부 미확인 (yaml 없으면 전체 SSOT 비활성)
- backend 세션 막 시작 (동시성 실사례 1건)
- ruff: 설치됨, 실제 가치 즉시

**노드별 즉각 가치 평가:**

| 노드/모듈 | 즉각 가치 | camping 조건 |
|---|---|---|
| `intake` | HIGH | 원장 등록 → scope_overlap 전제 |
| `code_drafter` (interrupt) | HIGH | 핵심 |
| `apply` (wt) | HIGH | 격리 필수 (단 C1 경계 체크 필요) |
| `reset_gates` | HIGH | 라운드 클리어 |
| `gate_diff_scope` (S.1, S.2) | HIGH | scope 강제 + 시크릿 즉시 가치 |
| `gate_scope_overlap` | HIGH | backend 세션 충돌 → 즉각 가치 |
| `gate_ssot` | LOW | registry.yaml 없으면 전부 skip/pass |
| `gate_lint` | MEDIUM | ruff 있음 → .py 변경 시 즉시 가치 |
| `gate_typecheck` | LOW | mypy strict 설정 없으면 노이즈 |
| `gate_tests` | LOW | 테스트 0건 → 항상 skip |
| `evidence_collector` | LOW | validate_ranges 있을 때만 |
| `contract_checker` | HIGH | 계약 집계 → 필수 |
| `evaluator` | HIGH | fresh-context review → 핵심 안전장치 |
| `revise` | HIGH | 루프 필수 |
| `human_review` | HIGH | interrupt → 필수 |
| `publish` | HIGH | 커밋/브랜치 |
| `ledger.py` | MEDIUM | 동시 세션 1건 → 필요하나 현재 heartbeat 미호출로 작동 불완전 |
| `ssot.py` | LOW | registry.yaml 없으면 빈 값 |
| `progress.py` | LOW | 선택적 기록 |

**Phase 0 최소 구성 (즉각 가치, 현재 코드 기준):**

```
필수 노드 (10개):
  intake · code_drafter · apply · reset_gates
  · gate_diff_scope · gate_scope_overlap
  · contract_checker · evaluator · human_review · publish

필수 지원 파일 (5개):
  state.py · paths.py · router.py · _util.py · contract.py (S·X 항목만)

선택 지원:
  ledger.py (scope_overlap 전제 → 실사례 있으므로 포함)
  gate_lint.py (ruff 있으므로 포함)

제거 가능 (Phase 1로 이연):
  gate_ssot.py · gate_typecheck.py · gate_tests.py
  evidence_collector.py · ssot.py · progress.py
  revise.py (단, evaluator NEEDS_WORK 처리가 없어지므로 단순화된 revise 필요)
```

**실질 지표:** 28개 py → Phase 0에서 필요한 것은 약 17개. 나머지 11개(ssot, progress, gate_ssot, gate_typecheck, gate_tests, evidence_collector + 그 의존)는 camping에 테스트·SSOT 문서가 실제로 갖춰질 때까지 가치 없이 복잡성만 추가한다. 특히 `ssot.py`는 `registry.yaml` 없이 모든 함수가 빈 값/fallback을 반환해 코드는 실행되지만 아무 가드도 없는 상태다.

---

## 수렴 판정

| 등급 | 개수 | 내용 요약 |
|---|---|---|
| **CRITICAL** | 4 | wt 경계 미검증(경로 탈출), pytest 탐지 버그(T.1 오작동), surrogatepass 불일치(노드 크래시), publish 실제파일 미검증(swap 우회) |
| **HIGH** | 5 | TTL lock 레이스, heartbeat 미호출(lease 만료), auth→backend 오분류, multi axis 누락, commit 실패 시 PROGRESS 오기록 |
| **MEDIUM** | 5 | tsc tsconfig 미검증, evidence_collector cwd 오류, _PROTECTED 미포함 필드, new_body 전체본문 미강제, lock 내 I/O |
| **LOW** | 5 | 경로 정규식, stage 조건 취약, binary+deleted 미삭제, graph 이중빌드, yaml 조용한 비활성 |

**루프 판정: 계속** — CRITICAL 4개 중 C1(경로 탈출)·C2(T.1 오작동)·C3(크래시)은 현재 코드로 배포 불가. C4는 운영 환경에서 로컬 wt 접근 가능한 캠핑 환경에서 실질 위험. CRITICAL을 모두 수정한 뒤 HIGH 2개(H1 lock, H2 heartbeat)는 동시 세션이 실재(backend 세션)하므로 즉시 수정 필요. cycle 4는 C1~C4 + H1~H2 수정 코드 반영 확인 + Phase 0 최소화 실행에 집중 권고.

---

## 한 줄 총평

`apply`가 wt 경계 없이 `os.path.join(wt, path)` 그대로 쓰는 경로 탈출, `has_tool("python3")` fallback이 pytest 부재를 T.1=fail로 오판하는 게이트 버그, publish가 state의 `new_body`가 아닌 wt 실제 파일을 commit해 hash 검증을 우회하는 swap 허점이 이 사이클의 세 핵심 결함이며, cycle 2 보완이 해소한 문제들 위에 새로 생긴 것들이다.
