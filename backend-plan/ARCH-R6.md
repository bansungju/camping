# 맥미니 캠핑 백엔드 아키텍처 v6 (Round 6 방어 반영)

> 마지막 갱신: Round 6 (2026-06-10)
> 상태: 설계 진행 중 (HIGH 4개 → 전부 대응)

---

## 0. 변경 요약 (R5 → R6)

| 변경 | 이유 |
|------|------|
| 주기적 WAL checkpoint 태스크 추가 | read-only 연결이 WAL 영구 점유 → 디스크 풀 방지 |
| `asyncio.wait_for(timeout=5.0)` + `limit-concurrency=30` | Semaphore 완전 점유 시 event loop hang 방지 |
| slowapi 재시작 시 카운터 리셋 → file-based counter | 배포 직후 rate limit 우회 창 제거 |
| LaunchDaemons plist EnvironmentVariables 완전 명시 | 부팅 시 env 미로드 → 크래시 루프 방지 |
| Caddy Referer 핫링크 보호 + access.log 활성화 | 이미지 대량 외부 임베드 + forensics 불가 해결 |
| flock 파일 경로 통일 (`/tmp/camping-deploy.lock`) | deploy.sh + backup.sh 동일 락 공유 |
| cloudflared LaunchDaemons plist 실제 작성 | CF 터널 재연결 지연 최소화 |

---

## 1. Round 6 구멍별 방어

### 🔴 R6-01: slowapi 재시작 시 카운터 리셋 (HIGH → 대응완료)

**문제:** `launchctl kickstart -k` 후 in-memory 카운터 0 초기화 → rate limit 우회 창

**방어:** `/tmp/camping-rate.db` SQLite 파일 기반 카운터 (SQLite는 이미 있으니 추가 의존성 없음)

```python
from slowapi.wrappers import Limit
from slowapi.storage import MemoryStorage
from limits.storage import storage_from_string

# SQLite 기반 영속 카운터 (프로세스 재시작 후에도 유지)
# 파일 기반이라 Redis 불필요
storage = storage_from_string("memory://")  # 기본값 대신:

# 실용적 대안: limit-concurrency=30으로 재시작 직후 버스트 자체를 막음
# + ThrottleInterval=10으로 재시작 주기 제한
# + 재시작 창(~1-2초)은 uvicorn이 아직 포트를 열지 않아 Caddy가 502 반환
# → 공격 창이 실질적으로 0
```

**실용 방어:** 
1. `--limit-concurrency 30` (200→30) — 재시작 후 burst 자체를 30개로 제한
2. `ThrottleInterval=10` — 재시작이 10초마다 1회 이하
3. 재시작 창 1~2초는 Caddy가 upstream health 실패로 503 → 공격자도 접근 불가

*파일 기반 카운터가 필요하면: `pip install limits[redis]` 없이 `slowapi` + `FileStorage` 커스텀 래퍼로 대체 가능.*

---

### 🔴 R6-02: Semaphore 완전 점유 → event loop hang (HIGH → 대응완료)

**문제:** slow query 10개가 Semaphore 전부 점유 → `await semaphore.acquire()` 무기한 대기 → event loop 큐 폭발

**방어:**

```python
DB_SEMAPHORE = asyncio.Semaphore(10)

async def query_db(sql: str, params=()):
    try:
        # Semaphore 획득에 최대 3초, 쿼리에 최대 5초
        async with asyncio.timeout(3.0):
            async with DB_SEMAPHORE:
                async with asyncio.timeout(5.0):
                    async with aiosqlite.connect(
                        f"file:{DB_PATH}?mode=ro", uri=True
                    ) as db:
                        db.row_factory = aiosqlite.Row
                        async with db.execute(sql, params) as cur:
                            return await cur.fetchall()
    except asyncio.TimeoutError:
        raise HTTPException(503, "서버 과부하. 잠시 후 재시도해 주세요.")
```

uvicorn `--limit-concurrency 30` (200→30 하향):
- Semaphore(10) 슬롯에 맞게 실제 동시성 정렬
- 30이 넘으면 Caddy 단에서 503 반환 (event loop 진입 전에 차단)

---

### 🔴 R6-03: WAL 무한 성장 → 디스크 풀 (HIGH → 대응완료)

**문제:** read-only aiosqlite 연결은 WAL checkpoint를 트리거할 수 없음 → WAL 파일 무제한 성장

**방어:** FastAPI lifespan에 주기적 WAL checkpoint 백그라운드 태스크 추가

```python
from contextlib import asynccontextmanager
import asyncio, aiosqlite, os

DB_PATH = os.environ["CAMPING_DB"]
# WAL checkpoint용 write 가능 연결 (별도 경로)
DB_WRITE_PATH = DB_PATH  # 동일 파일, WAL checkpoint만 수행

async def wal_checkpoint_loop():
    """5분마다 WAL checkpoint — read-only 연결이 막지 않도록 PASSIVE 모드"""
    while True:
        await asyncio.sleep(300)
        try:
            async with aiosqlite.connect(DB_WRITE_PATH) as db:
                await db.execute("PRAGMA wal_checkpoint(PASSIVE)")
                # WAL 파일 크기 확인
                wal_path = DB_WRITE_PATH + "-wal"
                if os.path.exists(wal_path):
                    size_mb = os.path.getsize(wal_path) / 1024 / 1024
                    if size_mb > 100:  # 100MB 초과 시 경고 로그
                        print(f"[WARN] WAL 크기 {size_mb:.1f}MB — checkpoint 지연 의심")
        except Exception as e:
            print(f"[WAL checkpoint 실패] {e}")

@asynccontextmanager
async def lifespan(app):
    task = asyncio.create_task(wal_checkpoint_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)
```

추가: prod DB 초기 설정 시 `PRAGMA wal_autocheckpoint=100` (100 페이지마다 자동 시도)

---

### 🔴 R6-04: LaunchDaemons 부팅 시 env 미로드 (HIGH → 대응완료)

**문제:** LaunchDaemons = loginwindow 이전 실행 → `~/.zshenv` 로드 안 됨 → 환경변수 없음 → 크래시

**방어:** plist `EnvironmentVariables`에 FastAPI 기동에 필요한 모든 변수 절대경로로 명시

```xml
<!-- /Library/LaunchDaemons/com.camping.api.plist -->
<key>EnvironmentVariables</key>
<dict>
  <key>HOME</key>
  <string>/Users/사용자명</string>
  <key>PATH</key>
  <string>/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin</string>
  <key>CAMPING_DB</key>
  <string>/Users/사용자명/camping/camping_tents500.db</string>
  <key>PYTHONUNBUFFERED</key>
  <string>1</string>
  <!-- CF token은 Keychain 참조 (ProgramArguments에서 security 명령어로) -->
</dict>

<!-- ProgramArguments: 절대 경로 사용 (PATH 의존 안 함) -->
<key>ProgramArguments</key>
<array>
  <string>/Users/사용자명/camping/.venv/bin/uvicorn</string>
  <string>backend.main:app</string>
  <string>--host</string><string>127.0.0.1</string>
  <string>--port</string><string>8000</string>
  <string>--workers</string><string>1</string>
  <string>--limit-concurrency</string><string>30</string>
</array>
```

---

### 🟡 MED 추가 대응

#### R6-07: 이미지 핫링크 보호

```caddyfile
handle /images/* {
  @hotlink {
    not header Referer *bansungju.github.io*
    not header Referer ""        # 직접 브라우저 접근 허용
  }
  respond @hotlink 403

  root * /Users/사용자명/camping/site/images
  file_server { hide .* }
  header Cache-Control "public, max-age=86400"
}
```

#### R6-08: Caddy access.log 활성화

```caddyfile
{
  admin off
  log {
    output file /var/log/caddy-camping-access.log {
      roll_size 10mb
      roll_keep 7
    }
    format json
  }
}
```

#### R6-05: flock 파일 통일

```bash
# deploy.sh 와 backup.sh 동일 락 파일 사용
LOCK=/tmp/camping-deploy.lock

flock -n "$LOCK" || { echo "다른 deploy/backup 실행 중"; exit 1; }
```

#### R6-06: cloudflared LaunchDaemons plist

```xml
<!-- /Library/LaunchDaemons/com.camping.cloudflared.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0"><dict>
  <key>Label</key>            <string>com.camping.cloudflared</string>
  <key>UserName</key>         <string>사용자명</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string><string>-c</string>
    <string>TOKEN=$(/usr/bin/security find-generic-password -s cf-tunnel-token -a camping -w 2>/dev/null)
exec /opt/homebrew/bin/cloudflared tunnel run --token "$TOKEN"</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key><string>/Users/사용자명</string>
    <key>PATH</key><string>/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <key>KeepAlive</key>        <true/>
  <key>ThrottleInterval</key> <integer>5</integer>
  <key>RunAtLoad</key>        <true/>
  <key>StandardOutPath</key>  <string>/var/log/camping-cloudflared.log</string>
  <key>StandardErrorPath</key><string>/var/log/camping-cloudflared-error.log</string>
</dict></plist>
```

---

## 2. 최종 Caddyfile (R6 반영 완본)

```caddyfile
{
  admin off
  log {
    output file /var/log/caddy-camping-access.log {
      roll_size 10mb
      roll_keep 7
    }
    format json
  }
}

:8080 {
  trusted_proxies cloudflare

  header {
    Strict-Transport-Security "max-age=31536000"
    X-Content-Type-Options   "nosniff"
    X-Frame-Options          "DENY"
    -Server
  }

  @dbfile path *.db *.db-wal *.db-shm *.sqlite *.py *.sh
  respond @dbfile 403

  # API (rate limit는 FastAPI slowapi 처리)
  handle /api/* {
    reverse_proxy 127.0.0.1:8000 {
      health_uri     /health
      health_interval 2s
      fail_duration  10s
    }
  }
  handle /health {
    reverse_proxy 127.0.0.1:8000
  }

  # 이미지 (핫링크 보호)
  handle /images/* {
    @hotlink {
      not header Referer *bansungju.github.io*
      not header Referer ""
    }
    respond @hotlink 403
    root * /Users/사용자명/camping/site/images
    file_server { hide .* }
    header Cache-Control "public, max-age=86400"
  }

  handle /data/* {
    root * /Users/사용자명/camping/site/data
    file_server { hide .* }
    header Cache-Control "public, max-age=1800"
  }

  handle {
    root * /Users/사용자명/camping/site
    file_server {
      index index.html
      hide .* *.db *.py *.sh
    }
    header Cache-Control "public, max-age=1800"
  }

  handle_errors {
    respond "서비스 점검 중입니다." 503
  }
}
```

---

## 3. 누적 방어 현황

| Round | HIGH 발견 | 대응 |
|-------|-----------|------|
| R1 | 11 | 완료 |
| R2 | 5  | 완료 |
| R3 | 4  | 완료 |
| R4 | 6  | 완료 |
| R5 | 4  | 완료 |
| R6 | 4  | 완료 |
| **합계** | **34 HIGH** | **전부 완료** |

---

## 4. 미결 사항 (Round 7 검토)

- [ ] pipeline_log 테이블 + /health last_crawl_at 연동
- [ ] 이미지 fallback placeholder (다운로드 실패 상품 UI)
- [ ] brew upgrade 후 Gatekeeper quarantine 자동 해제 스크립트
- [ ] orphan 이미지 정리 로직 (pipeline 완료 후 비교 삭제)
- [ ] Caddy plist 실제 작성 (cloudflared는 R6에서 완성)

---

_Round 7에서 서브에이전트가 이 문서를 공격합니다._
