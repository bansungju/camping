# 맥미니 캠핑 백엔드 아키텍처 v1 (Round 1 방어 반영)

> 마지막 갱신: Round 1 (2026-06-10)
> 상태: 설계 진행 중 (적대 루프 수렴 전)

---

## 0. 목표

| 항목 | 값 |
|------|-----|
| 서버 | 집 Mac mini (Homebrew, 24/7) |
| 목적 | 캠핑기어 정직비교 API (16 카테고리, ~2449 제품) |
| 외부 접근 | Cloudflare Tunnel (무료, 집 IP 완전 숨김) |
| 비용 | 0원 (CF Free, macOS launchd 내장) |

---

## 1. 전체 구조

```
[인터넷 사용자]
      │ HTTPS (CF 인증서 자동)
      ▼
[Cloudflare Edge] ←── cloudflared tunnel (집 안 outbound only)
      │
      ▼
[Caddy :2019 admin / :8080 내부]
  - Rate limit (IP당 60req/분)
  - 정적 /site → site/ 디렉토리 서빙
  - /api/* → FastAPI :8000 프록시
      │
      ▼
[FastAPI :8000]
  - uvicorn workers=2 (M2 Mac mini 기준)
  - aiosqlite (async I/O, event loop 비블로킹)
  - 읽기 전용 연결 (uri=true, mode=ro)
      │
      ▼
[SQLite camping_tents500.db]
  - WAL 모드 (reader/writer 비블로킹)
  - DB 경로: ~/camping/camping_tents500.db
  - 파이프라인 write: camping_tents500_shadow.db → atomic RENAME
```

---

## 2. 구멍별 방어 (Round 1 — 20개)

### 🔴 보안 (HIGH)

| # | 구멍 | 방어 |
|---|------|------|
| S1 | DB 파일 직접 노출 | DB를 site/ 외부에 배치, Caddy `/api/` 외 .db 확장자 차단 |
| S2 | path traversal (`/api/../../etc/passwd`) | FastAPI slug/name 파라미터 `re.match(r'^[a-z0-9-]+$')` 검증 |
| S3 | Cloudflare bypass (직접 IP 접근) | cloudflared 쓰면 8000/8080 localhost만 — 외부 포트 미개방 |
| S4 | search SQL injection | SQLite parameterized query만 사용, ORM 없어도 `?` 바인딩 강제 |
| S5 | uvicorn 직접 노출 | 0.0.0.0 금지, 127.0.0.1:8000만 listen |

### 🔴 가용성 (HIGH)

| # | 구멍 | 방어 |
|---|------|------|
| A1 | Mac 재시작 시 서비스 미기동 | launchd plist 3개 (caddy / uvicorn / cloudflared), RunAtLoad=true |
| A2 | 크롤링 중 API 부분 노출 | shadow DB 패턴: `pipeline → camping_shadow.db → mv → camping_tents500.db` |
| A3 | Mac 절전모드로 터널 끊김 | `sudo pmset -a sleep 0 disksleep 0` (서버용 전원 설정) |
| A4 | 디스크 풀 (로그 무한 증가) | Caddy + uvicorn 로그 rotate, 최대 50MB 유지 |

### 🟡 성능 (MED)

| # | 구멍 | 방어 |
|---|------|------|
| P1 | async + sync SQLite 블로킹 | `aiosqlite` 사용, 연결당 `row_factory = sqlite3.Row` |
| P2 | N+1 쿼리 (제품 목록+스펙 개별 조회) | export_site.py가 이미 JSON pre-bake — API는 JSON 서빙만 |
| P3 | 전체 카테고리 JSON 매번 직렬화 | `site/data/*.json` 파일 기반 서빙 → Caddy 정적 캐시 30분 |

### 🟡 운영 (MED)

| # | 구멍 | 방어 |
|---|------|------|
| O1 | Python 패키지 버전 충돌 | `venv` 격리 (`~/camping/.venv`) |
| O2 | cloudflared 버전 오래되면 tunnel 재인증 필요 | `brew upgrade cloudflared` 자동화 (주 1회 launchd) |
| O3 | 배포 시 서비스 재시작 없음 | deploy.sh: `launchctl kickstart` 순서대로 |

### 🟡 데이터 파이프라인 (MED)

| # | 구멍 | 방어 |
|---|------|------|
| D1 | write 중 read 충돌 | WAL 모드 활성화 (`PRAGMA journal_mode=WAL`) |
| D2 | pipeline 실패 시 반쪽 DB | shadow DB로 쓰고, 검증 후 atomic rename |
| D3 | 크롤링 IP 차단 시 사이트도 멈춤 | 파이프라인과 API 완전 분리 (크롤링 실패 = API 무영향) |

---

## 3. 디렉토리 구조

```
~/camping/
├── camping_tents500.db        # API read-only
├── camping_shadow.db          # 파이프라인 write 전용 (배포 전 rename)
├── .venv/                     # Python 격리
├── backend/
│   ├── main.py                # FastAPI app
│   ├── routers/
│   │   ├── categories.py
│   │   ├── search.py
│   │   └── recommend.py
│   └── db.py                  # aiosqlite 연결 풀
├── site/                      # 정적 파일 (Caddy 서빙)
│   ├── data/*.json
│   └── *.html
├── pipeline/                  # 크롤러 (API와 완전 분리)
├── launchd/
│   ├── camping-api.plist
│   ├── camping-caddy.plist
│   └── camping-cloudflared.plist
└── deploy.sh                  # 재시작 순서 스크립트
```

---

## 4. 핵심 결정사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 프레임워크 | FastAPI | 이미 Python 사용, async 지원, 빠름 |
| DB 접근 | aiosqlite + read-only URI | event loop 비블로킹 |
| 정적 파일 | Caddy 직접 서빙 | FastAPI 거치지 않음 (불필요한 오버헤드 제거) |
| 동시 쓰기 | Shadow DB + atomic rename | WAL 보조 |
| 프로세스 관리 | launchd | macOS 내장, Docker 불필요 |
| 터널 | Cloudflare Tunnel | 무료, IP 숨김, HTTPS 자동 |
| 외부 포트 | 미개방 (0개) | cloudflared outbound only |

---

## 5. 미결 사항 (Round 2+ 검토)

- [ ] 헬스체크 엔드포인트 (`/health`) 및 CF Health Check 설정
- [ ] 인증 (OPS 모드 API는 토큰 필요한가?)
- [ ] 이미지 프록시 (다나와 og:image 직접 노출 vs 프록시)
- [ ] CORS 정책 (GitHub Pages → Mac mini API 크로스오리진)
- [ ] 백업 전략 (DB 파일 iCloud/외장 자동 백업)
- [ ] 모니터링 (API 응답시간, tunnel 상태 알림)

---

_Round 2에서 서브에이전트가 이 문서를 공격합니다._
