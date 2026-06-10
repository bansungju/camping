# 맥미니 캠핑 백엔드 아키텍처 — 최종 설계안

> 버전: FINAL (R1~R6 적대 루프 34 HIGH 수렴)
> 작성: 2026-06-10

---

## 1. 한눈에 보기

```
[인터넷 사용자]
      │ HTTPS (CF 인증서 자동)
      ▼
[Cloudflare Edge + WAF Free]
      │ cloudflared outbound tunnel (집 IP 완전 숨김, 외부 포트 0개)
      ▼
[Caddy :8080  ─ 127.0.0.1 바인딩]
  trusted_proxies cloudflare      # CF-Connecting-IP → 실제 클라이언트 IP
  admin off                       # admin API 완전 비활성
  Referer 핫링크 보호 (/images/*)
  명시적 path handler + 전용 root  # 경로 순회 차단
  access.log JSON (roll 10MB×7)
      │
      ├─ /api/*    → FastAPI :8000 (upstream health_uri /health)
      ├─ /health   → FastAPI :8000
      ├─ /images/* → site/images/  (Cache 1일, 핫링크 보호)
      ├─ /data/*   → site/data/    (Cache 30분)
      └─ /        → site/          (Cache 30분)
      │
      ▼
[FastAPI :8000  ─ 127.0.0.1, workers=1, limit-concurrency=30]
  slowapi 60/min  (CF-Connecting-IP 기준, internal-exempt 버킷)
  CORSMiddleware  allow_origins=["https://bansungju.github.io"]
  Cache-Control: no-store  (API 응답 전체)
  asyncio.wait_for(3s semaphore + 5s query)
  WAL checkpoint 백그라운드 태스크 (5분 주기, PASSIVE)
  GET /health  → SELECT COUNT(*) + timeout 0.5s + 503 on fail
  GET /api/...  → aiosqlite Semaphore(10), read-only URI
      │
      ▼
[SQLite camping_tents500.db]
  WAL 모드 (reader/writer 비블로킹)
  PRAGMA wal_autocheckpoint=100
  read-only URI (mode=ro) — API에서 절대 쓰기 없음
```

---

## 2. 보안 결정 요약

| 항목 | 결정 | 근거 |
|------|------|------|
| 외부 포트 | **0개** — cloudflared outbound only | 집 IP 완전 숨김 |
| CORS | `bansungju.github.io` 명시 | wildcard 차단 |
| DB 접근 | read-only URI `?mode=ro` | API에서 write 불가 |
| slug 입력 | `re.match(r'^[a-z0-9-]+$')` | path traversal 차단 |
| SQL 쿼리 | `?` 바인딩 강제 | SQL injection 차단 |
| 이미지 | pipeline 다운로드 → 정적 서빙 | CF ToS 위반 + SSRF + XSS 동시 방지 |
| rate limit | slowapi + CF-Connecting-IP | CF Tunnel 뒤 127.0.0.1 수렴 방지 |
| CF token | macOS Keychain | .env git 노출 차단 |
| Caddy admin | `admin off` | 로컬 무인증 admin API 차단 |

---

## 3. 파일 구조

```
~/camping/
├── camping_tents500.db        # API read-only (WAL, wal_autocheckpoint=100)
├── camping_shadow.db          # 파이프라인 write 전용 (journal_mode=DELETE)
├── .venv/                     # Python venv
├── .env                       # gitignore — CAMPING_DB 등 (선택, plist EnvironmentVariables 우선)
│
├── backend/
│   ├── main.py                # FastAPI + CORS + slowapi + lifespan + /health
│   ├── db.py                  # aiosqlite, Semaphore(10), query_db()
│   └── routers/
│       ├── categories.py
│       ├── search.py
│       └── recommend.py
│
├── site/                      # Caddy 정적 서빙
│   ├── data/*.json            # export_site.py 출력
│   ├── images/*.jpg           # collect_images.py 출력 (gitignore)
│   └── *.html
│
├── pipeline/                  # 크롤러 (API와 완전 분리)
│   ├── collect_images.py      # site/images/{pcode}.jpg 다운로드
│   └── export_site.py         # DB → site/data/*.json
│
├── Caddyfile                  # 완성본 (섹션 5 참조)
├── deploy.sh                  # shadow→prod atomic 교체 (섹션 6 참조)
├── backup.sh                  # sqlite3.backup() + integrity_check
│
├── launchd/                   # 설치 전 편집 후 /Library/LaunchDaemons/로 복사
│   ├── com.camping.api.plist
│   ├── com.camping.caddy.plist
│   └── com.camping.cloudflared.plist
│
└── backend-plan/              # 설계 문서 (이 파일 포함)
```

---

## 4. FastAPI main.py

```python
import asyncio, os, time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import aiosqlite

DB_PATH = os.environ["CAMPING_DB"]
DB_SEMAPHORE = asyncio.Semaphore(10)

# ── rate limit ──────────────────────────────────────────
def get_real_ip(request: Request) -> str:
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    client = request.client.host if request.client else "127.0.0.1"
    return "__internal__" if client in ("127.0.0.1", "::1") else client

limiter = Limiter(key_func=get_real_ip, default_limits=["60/minute"])

# ── WAL checkpoint 백그라운드 태스크 ────────────────────
async def wal_checkpoint_loop():
    while True:
        await asyncio.sleep(300)
        try:
            async with aiosqlite.connect(DB_PATH) as db:
                await db.execute("PRAGMA wal_checkpoint(PASSIVE)")
            wal = DB_PATH + "-wal"
            if os.path.exists(wal) and os.path.getsize(wal) > 100 * 1024 * 1024:
                print(f"[WARN] WAL {os.path.getsize(wal)//1024//1024}MB — checkpoint 지연")
        except Exception as e:
            print(f"[WAL] checkpoint 실패: {e}")

@asynccontextmanager
async def lifespan(app):
    task = asyncio.create_task(wal_checkpoint_loop())
    yield
    task.cancel()

# ── 앱 ─────────────────────────────────────────────────
app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bansungju.github.io"],
    allow_methods=["GET"],
    allow_headers=[],
    max_age=86400,
)

@app.middleware("http")
async def no_cache(request: Request, call_next):
    res = await call_next(request)
    if request.url.path.startswith("/api/"):
        res.headers["Cache-Control"] = "no-store"
    return res

# ── DB 헬퍼 ─────────────────────────────────────────────
async def query_db(sql: str, params=()):
    from fastapi import HTTPException
    try:
        async with asyncio.timeout(3.0):           # semaphore 대기 최대 3초
            async with DB_SEMAPHORE:
                async with asyncio.timeout(5.0):   # 쿼리 최대 5초
                    async with aiosqlite.connect(
                        f"file:{DB_PATH}?mode=ro", uri=True
                    ) as db:
                        db.row_factory = aiosqlite.Row
                        async with db.execute(sql, params) as cur:
                            return await cur.fetchall()
    except asyncio.TimeoutError:
        raise HTTPException(503, "서버 과부하. 잠시 후 재시도해 주세요.")

# ── 헬스체크 ─────────────────────────────────────────────
@app.get("/health")
async def health():
    try:
        async with asyncio.timeout(0.5):
            async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
                row = await db.execute_fetchall("SELECT COUNT(*) FROM products")
        return {"status": "ok", "products": row[0][0], "ts": int(time.time())}
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)}, status_code=503)
```

---

## 5. Caddyfile

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

  handle /api/* {
    reverse_proxy 127.0.0.1:8000 {
      health_uri      /health
      health_interval 2s
      fail_duration   10s
    }
  }
  handle /health {
    reverse_proxy 127.0.0.1:8000
  }

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
    file_server { index index.html; hide .* *.db *.py *.sh }
    header Cache-Control "public, max-age=1800"
  }

  handle_errors {
    respond "서비스 점검 중입니다." 503
  }
}
```

---

## 6. deploy.sh

```bash
#!/bin/bash
set -e
PROD=~/camping/camping_tents500.db
SHADOW=~/camping/camping_shadow.db
LOCK=/tmp/camping-deploy.lock   # backup.sh와 동일 락 파일

exec 9>"$LOCK"
flock -n 9 || { echo "다른 deploy/backup 실행 중"; exit 1; }

# 검증
ROW_COUNT=$(sqlite3 "$SHADOW" "SELECT COUNT(*) FROM products WHERE curation_status='verified'")
[ "$ROW_COUNT" -lt 2000 ] && echo "검증 실패: $ROW_COUNT 행" && exit 1

# WAL 완전 정리 후 atomic 교체
sqlite3 "$PROD" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || true
mv "$SHADOW" "$PROD"
rm -f "${PROD}-wal" "${PROD}-shm"

# FastAPI graceful 재시작
launchctl kickstart -k "gui/$(id -u)/com.camping.api" 2>/dev/null || \
  launchctl kickstart -k "system/com.camping.api"

echo "배포 완료: $ROW_COUNT 모델"
```

---

## 7. backup.sh

```bash
#!/bin/bash
set -e
DB=~/camping/camping_tents500.db
DEST=~/camping/camping_backup/camping_$(date +%Y%m%d_%H%M%S).db
LOCK=/tmp/camping-deploy.lock   # deploy.sh와 동일 락

exec 9>"$LOCK"
flock -n 9 || { echo "deploy 중 — 백업 건너뜀"; exit 0; }

mkdir -p ~/camping/camping_backup
sqlite3 "$DB" ".backup '$DEST'"
sqlite3 "$DEST" "PRAGMA integrity_check" | grep -q "^ok$" || \
  { echo "백업 integrity_check 실패"; rm -f "$DEST"; exit 1; }

# 7일 초과 백업 삭제
find ~/camping/camping_backup -name "*.db" -mtime +7 -delete
echo "백업 완료: $DEST"
```

---

## 8. LaunchDaemons plist 3종

### com.camping.api.plist
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key>            <string>com.camping.api</string>
  <key>UserName</key>         <string>사용자명</string>
  <key>WorkingDirectory</key> <string>/Users/사용자명/camping</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>           <string>/Users/사용자명</string>
    <key>PATH</key>           <string>/opt/homebrew/bin:/usr/bin:/bin</string>
    <key>CAMPING_DB</key>     <string>/Users/사용자명/camping/camping_tents500.db</string>
    <key>PYTHONUNBUFFERED</key><string>1</string>
  </dict>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/사용자명/camping/.venv/bin/uvicorn</string>
    <string>backend.main:app</string>
    <string>--host</string>           <string>127.0.0.1</string>
    <string>--port</string>           <string>8000</string>
    <string>--workers</string>        <string>1</string>
    <string>--limit-concurrency</string><string>30</string>
  </array>
  <key>KeepAlive</key>        <true/>
  <key>ThrottleInterval</key> <integer>10</integer>
  <key>RunAtLoad</key>        <true/>
  <key>StandardOutPath</key>  <string>/var/log/camping-api.log</string>
  <key>StandardErrorPath</key><string>/var/log/camping-api-error.log</string>
</dict></plist>
```

### com.camping.caddy.plist
```xml
<plist version="1.0"><dict>
  <key>Label</key>            <string>com.camping.caddy</string>
  <key>UserName</key>         <string>사용자명</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>           <string>/Users/사용자명</string>
    <key>PATH</key>           <string>/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/caddy</string>
    <string>run</string>
    <string>--config</string>
    <string>/Users/사용자명/camping/Caddyfile</string>
  </array>
  <key>KeepAlive</key>        <true/>
  <key>ThrottleInterval</key> <integer>5</integer>
  <key>RunAtLoad</key>        <true/>
  <key>StandardOutPath</key>  <string>/var/log/camping-caddy.log</string>
  <key>StandardErrorPath</key><string>/var/log/camping-caddy-error.log</string>
</dict></plist>
```

### com.camping.cloudflared.plist
```xml
<plist version="1.0"><dict>
  <key>Label</key>            <string>com.camping.cloudflared</string>
  <key>UserName</key>         <string>사용자명</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>           <string>/Users/사용자명</string>
    <key>PATH</key>           <string>/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string><string>-c</string>
    <string>TOKEN=$(/usr/bin/security find-generic-password -s cf-tunnel-token -a camping -w 2>/dev/null)
exec /opt/homebrew/bin/cloudflared tunnel run --token "$TOKEN"</string>
  </array>
  <key>KeepAlive</key>        <true/>
  <key>ThrottleInterval</key> <integer>5</integer>
  <key>RunAtLoad</key>        <true/>
  <key>StandardOutPath</key>  <string>/var/log/camping-cloudflared.log</string>
  <key>StandardErrorPath</key><string>/var/log/camping-cloudflared-error.log</string>
</dict></plist>
```

---

## 9. 설치 체크리스트

```bash
# 1. 의존성
brew install caddy cloudflared
pip install fastapi uvicorn aiosqlite slowapi httpx

# 2. CF Tunnel 생성 (최초 1회)
cloudflared tunnel login
cloudflared tunnel create camping
# → 터널 ID 확인 후 Cloudflare DNS CNAME 설정

# 3. token Keychain 저장
security add-generic-password -s "cf-tunnel-token" -a "camping" -w "<TOKEN>"

# 4. 전원 설정 (절전 비활성)
sudo pmset -a sleep 0 disksleep 0 hibernatemode 0

# 5. SQLite 초기 설정
sqlite3 ~/camping/camping_tents500.db "PRAGMA wal_autocheckpoint=100;"

# 6. plist 설치 (사용자명 치환 후)
sudo cp launchd/com.camping.*.plist /Library/LaunchDaemons/
sudo launchctl load /Library/LaunchDaemons/com.camping.api.plist
sudo launchctl load /Library/LaunchDaemons/com.camping.caddy.plist
sudo launchctl load /Library/LaunchDaemons/com.camping.cloudflared.plist

# 7. 모니터링 등록
# UptimeRobot: https://당신도메인/health  keyword="ok"  1분 interval
# Freshping:   동일 URL, 2차 모니터

# 8. 백업 cron (launchd com.camping.backup.plist, 매일 새벽 3시)
# StartCalendarInterval: <dict><key>Hour</key><integer>3</integer>...</dict>
```

---

## 10. 보안 계층 요약

```
레이어 1 — Cloudflare Edge
  · 집 IP 완전 은닉 (outbound tunnel)
  · WAF 기본 룰셋 (Free)
  · DDoS 자동 완화

레이어 2 — Caddy
  · .db/.py/.sh 확장자 403
  · 명시적 path handler (순회 불가)
  · 이미지 핫링크 Referer 보호
  · 보안 헤더 (HSTS, nosniff, DENY)
  · access.log (forensics)

레이어 3 — FastAPI
  · CORS 단일 도메인 화이트리스트
  · slowapi 60req/min (실 IP 기반)
  · slug 정규식 검증
  · SQL parameterized query 강제
  · Semaphore(10) + timeout

레이어 4 — SQLite
  · read-only URI (API에서 write 불가)
  · WAL 모드 (concurrent read 지원)
  · shadow DB → atomic rename 패턴

레이어 5 — 운영
  · LaunchDaemons (부팅 즉시, 자동 재시작)
  · 이중 모니터링 (UptimeRobot + Freshping)
  · 일 1회 백업 + integrity_check
  · flock 직렬화 (deploy ↔ backup 충돌 방지)
```

---

## 11. 적대 루프 이력

| Round | 공격 | HIGH 발견 | 결과 |
|-------|------|-----------|------|
| R1 | 초기 아키텍처 전반 | 11 | DB노출·SQL injection·launchd 등 기초 방어 |
| R2 | R1 방어안 | 5 | rate limit IP수렴·WAL rename·CORS·헬스체크 |
| R3 | R2 방어안 | 4 | 이미지핫링킹·CF token·rename레이스·/health오탐 |
| R4 | R3 방어안 | 6 | 이미지프록시→정적서빙·slowapi·SIGHUP·Semaphore |
| R5 | R4 방어안 | 4 | workers분산·경로순회·plist로그·Cache-Control |
| R6 | R5 방어안 | 4 | WAL무한성장·Semaphore hang·env미로드·핫링크 |
| **합계** | | **34 HIGH** | **전부 대응** |
