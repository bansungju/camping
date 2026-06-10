# 맥미니 캠핑 백엔드 아키텍처 v2 (Round 2 방어 반영)

> 마지막 갱신: Round 2 (2026-06-10)
> 상태: 설계 진행 중 (HIGH 5개 발견 → 전부 대응)

---

## 0. 변경 요약 (R1 → R2)

| 변경 | 이유 |
|------|------|
| Shadow DB → `journal_mode=DELETE` 강제 | WAL 3파일 rename 충돌 방지 |
| Caddy `trusted_proxies cloudflare` | Rate limit이 CF Tunnel 뒤에서 무력화되던 것 수정 |
| CORS `allow_origins` 명시적 화이트리스트 | wildcard 허용 금지 |
| `/health` 엔드포인트 + UptimeRobot 연동 | CF Tunnel 장애 무음 방지 |
| SQLite 백업: `sqlite3 .backup()` API | Time Machine WAL 불일치 백업 방지 |
| launchd `ThrottleInterval=10` + `KeepAlive` | FastAPI 크래시 루프 억제 |
| `CAMPING_DB` 환경변수로 dev/prod 분리 | pipeline 실수로 prod DB 덮어쓰기 방지 |

---

## 1. 전체 구조 (업데이트)

```
[인터넷 사용자]
      │ HTTPS (CF 인증서 자동)
      ▼
[Cloudflare Edge]
  - CF-Connecting-IP 헤더 주입 (실제 클라이언트 IP)
  - WAF: 기본 룰셋 (Free 플랜 포함)
      │ cloudflared tunnel (outbound only)
      ▼
[Caddy :8080]
  - trusted_proxies cloudflare   ← NEW: CF IP 대역 신뢰
  - rate_limit {remote_host} 60r/m  ← CF-Connecting-IP 기반(실제 IP)
  - header_down Strict-Transport-Security ...
  - 정적: /          → site/ (Cache-Control: max-age=1800)
  - 프록시: /api/*  → 127.0.0.1:8000
  - 프록시: /health → 127.0.0.1:8000/health
      │
      ▼
[FastAPI :8000, bind=127.0.0.1]
  - CORSMiddleware: allow_origins=["https://bansungju.github.io"]  ← NEW
  - /health → {"status":"ok","db":"ok","ts":...}  ← NEW
  - aiosqlite, read-only URI (mode=ro)
  - 파라미터 slug 정규식 검증
      │
      ▼
[SQLite camping_tents500.db]
  - journal_mode=WAL (API 읽기용)
  - 백업: sqlite3 .backup() API → iCloud Drive (WAL 체크포인트 완료 후)  ← NEW

[파이프라인 DB 갱신 플로우]  ← NEW 수정
  pipeline → camping_shadow.db (journal_mode=DELETE, 단일파일)
           → PRAGMA wal_checkpoint(TRUNCATE) on prod DB
           → os.rename(shadow → prod)  # 단일파일이므로 진짜 atomic
```

---

## 2. Round 2 구멍별 방어

### 🔴 보안 (HIGH → 대응완료)

| ID | 구멍 | 방어 |
|----|------|------|
| R2-S1 | CORS + credentials 혼용으로 세션 하이재킹 | `allow_origins=["https://bansungju.github.io"]` 명시. OPS는 localStorage만 → credentials 불필요 |
| R2-S5 | CF Tunnel 뒤 rate limit IP 수렴(전부 127.0.0.1) | Caddy `trusted_proxies cloudflare` → `{remote_host}` = CF-Connecting-IP로 복원 |

### 🔴 가용성 (HIGH → 대응완료)

| ID | 구멍 | 방어 |
|----|------|------|
| R2-S3 | CF Tunnel silent failure (장애 인지 불가) | `/health` 엔드포인트 + UptimeRobot(무료) 1분 polling + 이메일 알림 |
| R2-S7 | Shadow DB WAL 3파일 rename 충돌 → DB corruption | Shadow DB `PRAGMA journal_mode=DELETE` 강제 (파일 1개) → rename atomic 보장 |

### 🔴 데이터 (HIGH → 대응완료)

| ID | 구멍 | 방어 |
|----|------|------|
| R2-S4 | Time Machine이 WAL 중간 상태 백업 → 복구 시 corruption | `sqlite3.connect(db).backup(dest)` API 사용 (내부적으로 WAL checkpoint 완료 후 스냅샷). iCloud Drive 저장. |

### 🟡 MED (추가 대응)

| ID | 구멍 | 방어 |
|----|------|------|
| R2-O1 | launchd FastAPI 크래시 루프 | plist `ThrottleInterval=10`, `KeepAlive=true`. 연속 5회 실패 시 알림 스크립트 |
| R2-O2 | macOS 자동업데이트 재부팅 후 미기동 | launchd `RunAtLoad=true` + `KeepAlive=true` 조합으로 재부팅 후 자동 복구. plist를 `/Library/LaunchDaemons`(시스템 레벨)에 설치 |
| R2-O3 | dev pipeline이 prod DB 덮어쓰기 | `CAMPING_DB` 환경변수 도입. dev=`camping_dev.db`, prod=`camping_tents500.db`. pipeline 기본값=dev |
| R2-P1 | Cloudflare Free 트래픽 제한 | CF Free: 무제한 대역폭 (Tunnel은 별도 제한 없음). 단, 10초당 1000req 초과 시 CF가 자동 rate limit 가능 → Caddy 60req/분으로 선제 차단 |

---

## 3. 최종 디렉토리 구조

```
~/camping/
├── camping_tents500.db        # API read-only (WAL 모드)
├── camping_shadow.db          # 파이프라인 write (DELETE 저널, 단일파일)
├── camping_backup/            # iCloud Drive 심볼릭링크 권장
│   └── camping_YYYYMMDD.db   # sqlite3 .backup() 결과
├── .venv/                     # Python venv
├── backend/
│   ├── main.py                # FastAPI + CORS + /health
│   ├── routers/
│   │   ├── categories.py
│   │   ├── search.py
│   │   └── recommend.py
│   └── db.py                  # aiosqlite 연결 (read-only URI)
├── site/                      # Caddy 정적 서빙
├── pipeline/                  # 크롤러 (CAMPING_DB=camping_shadow.db)
├── launchd/
│   ├── com.camping.api.plist          # FastAPI, ThrottleInterval=10
│   ├── com.camping.caddy.plist
│   ├── com.camping.cloudflared.plist
│   └── com.camping.backup.plist       # NEW: 일 1회 DB 백업
├── Caddyfile                  # trusted_proxies + rate_limit
├── deploy.sh                  # shadow→prod rename + launchctl kickstart
└── .env                       # CAMPING_DB, CF_TUNNEL_TOKEN (gitignore)
```

---

## 4. Caddyfile (핵심 부분)

```caddyfile
{
  admin off
}

:8080 {
  # CF Tunnel이 앞에 있으므로 CF IP 대역을 신뢰 → remote_host = 실제 클라이언트 IP
  trusted_proxies cloudflare

  # 실제 IP 기반 rate limit
  rate_limit {remote_host} 60r/m

  # 보안 헤더
  header {
    Strict-Transport-Security "max-age=31536000"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    -Server
  }

  # .db 파일 직접 접근 차단
  @dbfile path *.db *.db-wal *.db-shm *.sqlite
  respond @dbfile 403

  # API 프록시
  handle /api/* {
    reverse_proxy 127.0.0.1:8000
  }
  handle /health {
    reverse_proxy 127.0.0.1:8000
  }

  # 정적 파일 (30분 캐시)
  handle {
    root * /Users/사용자명/camping/site
    file_server
    header Cache-Control "max-age=1800"
  }
}
```

---

## 5. FastAPI main.py (핵심 부분)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import aiosqlite, time, os

DB_PATH = os.environ.get("CAMPING_DB", "/Users/사용자명/camping/camping_tents500.db")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bansungju.github.io"],  # 명시적 화이트리스트
    allow_methods=["GET"],
    allow_headers=[],
    max_age=86400,
)

@app.get("/health")
async def health():
    try:
        async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
            await db.execute("SELECT 1")
        return {"status": "ok", "db": "ok", "ts": int(time.time())}
    except Exception as e:
        return {"status": "error", "db": str(e), "ts": int(time.time())}
```

---

## 6. 핵심 결정사항 (R2 업데이트)

| 항목 | 결정 | 이유 |
|------|------|------|
| Shadow DB 저널 | DELETE (단일 파일) | WAL 3파일 rename 충돌 방지 |
| Rate limit 소스 IP | CF-Connecting-IP via trusted_proxies | CF Tunnel 뒤 127.0.0.1 수렴 방지 |
| CORS | `bansungju.github.io` 명시 | wildcard 차단 |
| 백업 | sqlite3.backup() API | WAL checkpoint 후 스냅샷, Time Machine 대신 |
| 모니터링 | UptimeRobot 무료 + /health | 비용 0원, 장애 1분 내 감지 |
| env 분리 | `CAMPING_DB` 환경변수 | dev/prod DB 혼용 방지 |

---

## 7. 미결 사항 (Round 3+ 검토)

- [ ] `/health` DB 연결 실패 시 launchd 자동 재시작 트리거 연동
- [ ] 이미지 프록시 — 다나와 og:image CORS 이슈 해결 방안
- [ ] OPS 모드 API 인증 (토큰 필요 여부)
- [ ] pipeline 크롤러 주기 자동화 (launchd cron)
- [ ] CF Tunnel token `.env` gitignore 확인
- [ ] deploy.sh atomic 교체 순서 (WAL checkpoint → shadow rename → API reload)

---

_Round 3에서 서브에이전트가 이 문서를 공격합니다._
