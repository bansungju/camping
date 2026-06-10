# dev-harness — camping 개발 에이전트 하네스

LangGraph 위에서 camping 의 **코드 변경을 강제**하는 개발 에이전트. 설계 전문은 [DESIGN.md](DESIGN.md).
핵심: LLM 을 그래프 안에 넣지 않는다 — **Claude Code(orchestrator)가 그래프를 운전**하고, 결정론적
게이트(diff_scope/ssot/lint/typecheck/tests)는 py 노드가, 생성·평가만 Task subagent 가 채운다.

## 설치

```bash
cd dev-harness
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

> langgraph 없이도 `--dry/--status/--progress/--ssot/--sessions/--conflicts/--reap` 는 동작한다.
> 그래프 실행(`--request/--inject/--resume`)에만 langgraph 가 필요.

## orchestrator 흐름 (Claude Code 가 수행)

```bash
python -m devagent --request "<요청>" --scope "site/login.html,site/app.js"   # → code_drafter interrupt
python -m devagent --inspect <thread>            # 멈춘 위치·게이트·계약 확인
python -m devagent --get-prompt <thread>         # drafter/evaluator Task subagent 프롬프트 패키지
#   → [Task subagent 로 코드 작성] →
python -m devagent --inject <thread> '{"stage":"draft","changed_files":[{"path":"...","status":"modified","new_body":"..."}]}'
#   → apply(워크트리) → 게이트 → contract → evaluator interrupt
#   → [별도 Task subagent 로 격리 리뷰] →
python -m devagent --inject <thread> '{"evaluator_verdict":"PASS","evaluator_notes":["..."]}'
#   → human_review 멈춤 → 사용자 승인 →
python -m devagent --inject <thread> '{"approved_human":["K.2"]}'   # human 항목 있으면
python -m devagent --resume <thread>             # publish → 브랜치 commit + PROGRESS/state 기록
```

## 맥락·동시성 조회

```bash
python -m devagent --status        # 영역별 현황 (지금 어디까지)
python -m devagent --sessions      # 동시 진행 중인 모든 thread (누가/어느 축/어느 파일)
python -m devagent --progress 5    # 최근 변경 이력
python -m devagent --conflicts "site/app.js"   # 이 파일이 활성 thread 와 겹치나
python -m devagent --reap          # 죽은 세션(lease 만료) 회수
python -m devagent --gc            # 죽은 워크트리 정리
```

## 안전장치 (DESIGN §0)

- **Default-FAIL**: 증거 없는 "완료" 불가 — 게이트/계약이 강제.
- **Fresh-context evaluator**: 작성자가 자기 코드를 리뷰 못 함 — 격리 subagent 가 diff·SSOT 만 보고 평가.
- **Human-review interrupt + post-gate swap 해시**: commit 전 사용자 승인 + 검증 후 본문 교체 거부.
- **워크트리 격리**: 변경은 `.dev-harness-wt/<thread>` 에서 검증, 메인 작업트리 무오염, 통과 시 브랜치로만.
- **다중 세션 원장**(`active.json`): 모든 세션이 동시 작업을 인지, scope/SSOT 겹침 차단(§16).

## 5개 영역 × 3개 축

- area(SSOT 영역): `auth`·`frontend`·`backend`·`devagent`·`data` — 각 정본 1개([ssot/registry.yaml](ssot/registry.yaml)).
- axis(작동 프로파일): `frontend`·`backend`·`data` — 게이트·증거·툴체인이 축마다 다름(§17). `multi`=교차축.

## 상태

구현 완료(Phase 0~4 골격) — `--dry`·게이트 단독검증·전체 그래프 e2e(스모크) 검증됨. ruff/mypy/pytest
미설정 시 해당 게이트는 skip. 쓰면서 보완하는 단계.
