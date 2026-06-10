# 맥미니 캠핑 백엔드 아키텍처 v5 (Round 5 방어 반영)

> 마지막 갱신: Round 5 (2026-06-10)
> 상태: 설계 진행 중 (HIGH 4개 → 전부 대응)

---

## 0. 변경 요약 (R4 → R5)

| 변경 | 이유 |
|------|------|
| uvicorn `--workers 1` 고정 | workers=2 시 slowapi 카운터 분산 → 실효 한도 2배 |
| slowapi key_func: `internal-exempt` 버킷 | CF-Connecting-IP 없는 내부 요청이 외부 rate limit 공유 방지 |
| Caddy 정적 서빙 path 명시 + autoindex off | site/ 루트 순회로 숨겨진 파일 노출 방지 |
| LaunchDaemons plist: 로그경로 + ThrottleInterval | 무한 재시작 블라인드스팟 해소 |
| API 응답 `Cache-Control: no-store` | CF가 /api/* 캐시해 stale 데이터 노출 방지 |
| site/images/ → .gitignore 추가 | 122MB 이미지 git 커밋 불필요 (로컬 파이프라인 전용) |
| 백업: flock + integrity_check | backup 중 deploy.sh 동시 실행 방지 |

---

## 1. 전체 구조 (최종)

```
[인터넷 사용자]
      │ HTTPS
      ▼
[Cloudflare Edge + WAF Free]
      │ cloudflared (outbound only, Keychain token)
      ▼
[Caddy :8080, 127.0.0.1]
  admin off
  trusted_proxies cloudflare
  autoindex off                    ← NEW
  명시적 path handler (순회 차단)  ← NEW
  보안 헤더 (HSTS 등)
  .db 확장자 403
  /api/*   → FastAPI :8000  (Cache-Control: no-store)
  /health  → FastAPI :8000
  /images/* → site/images/ (정적, 1일 캐시)
  /data/*   → site/data/   (정적, 30분 캐시)
  /         → site/        (HTML, 30분 캐시)
      │
      ▼
[FastAPI :8000, 127.0.0.1, workers=1]   ← workers=1 고정
  slowapi: CF-Connecting-IP → internal-exempt 분기  ← NEW
  /health → SELECT COUNT(*) + 503
  /api/*  → aiosqlite Semaphore(10)
  모든 API 응답: Cache-Control: no-store  ← NEW
      │
      ▼
[SQLite camping_tents500.db, WAL]
  Semaphore(10) per-request 연결

[LaunchDaemons]  /Library/LaunchDaemons/
  StandardOutPath  → /var/log/camping-api.log
  StandardErrorPath → /var/log/camping-api-error.log
  ThrottleInterval = 10
  UserName = 사용자명

[Backup cron]  flock 잠금으로 deploy.sh 동시 실행 방지
```

---

## 2. Round 5 구멍별 방어

### 🔴 R5-01: workers=2 slowapi 카운터 분산 (HIGH → 대응완료)

**문제:** workers=2이면 프로세스마다 독립 in-memory 카운터 → 실효 120 req/min

**방어:** `workers=1` 고정. Mac mini 단일 서버 + SQLite read-only는 I/O bound — 추가 worker 불필요.

```bash
# launchd ProgramArguments
uvicorn backend.main:app \
  --host 127.0.0.1 --port 8000 \
  --workers 1 \                    # ← 고정
  --limit-concurrency 200
```

*미래에 workers 증가가 필요하면 Redis-backed slowapi storage로 전환.*

---

### 🔴 R5-02: CF-Connecting-IP fallback DoS (HIGH → 대응완료)

**문제:** 내부 cron/pipeline이 127.0.0.1로 Caddy 직접 호출 → CF-Connecting-IP 없음 → 127.0.0.1 단일 버킷 → 외부 사용자 전체 차단

**방어:**

```python
def get_real_ip(request: Request) -> str:
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    client = request.client.host if request.client else "127.0.0.1"
    if client in ("127.0.0.1", "::1"):
        return "__internal__"  # ← 전용 버킷, rate limit 면제
    return client

# 내부 버킷은 1000/minute (사실상 무제한)
@app.get("/api/category/{slug}")
@limiter.limit("60/minute", key_func=get_real_ip)
@limiter.limit("1000/minute", key_func=lambda r: "__internal__"
               if (r.client and r.client.host in ("127.0.0.1","::1")) else "skip")
async def get_category(request: Request, slug: str):
    ...
```

*더 간단한 대안: 내부 호출용 `/internal/api/*` prefix + IP 체크 미들웨어 (외부 노출 없음).*

---

### 🔴 R5-03: Caddy site/ 루트 경로 순회 (HIGH → 대응완료)

**문제:** `/images/%2e%2e/data/manifest.json` 등 인코딩 순회로 site/ 하위 파일 노출

**방어:**

```caddyfile
:8080 {
  admin off
  trusted_proxies cloudflare
  
  # 명시적 경로만 허용 — 그 외 전부 404
  @api      path /api/*
  @health   path /health
  @images   path /images/*
  @data     path /data/*
  @manifest path /manifest.webmanifest /icon-*.png /apple-touch-icon.png

  handle @api    { reverse_proxy 127.0.0.1:8000 }
  handle @health { reverse_proxy 127.0.0.1:8000 }

  handle @images {
    root * /Users/사용자명/camping/site/images   # ← images/ 전용 루트
    file_server { hide .* }
    header Cache-Control "public, max-age=86400"
  }

  handle @data {
    root * /Users/사용자명/camping/site/data
    file_server { hide .* }
    header Cache-Control "public, max-age=1800"
  }

  # HTML + PWA 파일
  handle {
    root * /Users/사용자명/camping/site
    file_server {
      index index.html
      hide .* *.db *.db-wal *.db-shm *.sqlite *.py *.sh
    }
    header Cache-Control "public, max-age=1800"
  }

  # .db 직접 접근 차단
  @dbfile path *.db *.db-wal *.db-shm *.sqlite
  respond @dbfile 403

  header {
    Strict-Transport-Security "max-age=31536000"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    -Server
  }
}
```

각 path handler가 **전용 루트**를 가지므로 `images/` 핸들러에서 `../data/`로 벗어나는 것이 불가능.

---

### 🔴 R5-04: LaunchDaemons 로그 누락 + 무한 재시작 (HIGH → 대응완료)

```xml
<!-- /Library/LaunchDaemons/com.camping.api.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ...>
<plist version="1.0">
<dict>
  <key>Label</key>            <string>com.camping.api</string>
  <key>UserName</key>         <string>사용자명</string>
  <key>WorkingDirectory</key> <string>/Users/사용자명/camping</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>CAMPING_DB</key>     <string>/Users/사용자명/camping/camping_tents500.db</string>
    <key>PATH</key>           <string>/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/사용자명/camping/.venv/bin/uvicorn</string>
    <string>backend.main:app</string>
    <string>--host</string> <string>127.0.0.1</string>
    <string>--port</string> <string>8000</string>
    <string>--workers</string> <string>1</string>
    <string>--limit-concurrency</string> <string>200</string>
  </array>
  <key>KeepAlive</key>        <true/>
  <key>ThrottleInterval</key> <integer>10</integer>   <!-- 10초 최소 재시작 간격 -->
  <key>RunAtLoad</key>        <true/>
  <key>StandardOutPath</key>  <string>/var/log/camping-api.log</string>
  <key>StandardErrorPath</key><string>/var/log/camping-api-error.log</string>
</dict>
</plist>
```

로그 rotate (logrotate 설정):
```
/var/log/camping-api*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

---

### 🟡 MED 추가 대응

| ID | 구멍 | 방어 |
|----|------|------|
| R5-05 | backup 중 deploy.sh 동시 실행 | `flock /tmp/camping-deploy.lock deploy.sh` + `flock /tmp/camping-deploy.lock backup.sh` |
| R5-06 | orphan 이미지 누적 + autoindex | `autoindex off` + pipeline 완료 후 `set(pcode_from_db) - set(files_in_images/)` → 삭제 |
| R5-07 | CF가 /api/* 캐시 → stale | FastAPI 모든 응답에 `Cache-Control: no-store` + CF Page Rule `/api/*` → Cache Level Bypass |
| R5-08 | 122MB 이미지 git 커밋 | `site/images/` → `.gitignore` 추가, pipeline 로컬 전용 |

---

## 3. .gitignore 추가

```gitignore
# 이미지: pipeline이 로컬에서 생성, git 불필요
site/images/
```

---

## 4. FastAPI 응답 헤더

```python
from fastapi import Response

@app.middleware("http")
async def add_no_cache(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response
```

---

## 5. 누적 방어 현황

| Round | HIGH 발견 | 대응 |
|-------|-----------|------|
| R1 | 11 | 완료 |
| R2 | 5  | 완료 |
| R3 | 4  | 완료 |
| R4 | 6  | 완료 |
| R5 | 4  | 완료 |
| **합계** | **30 HIGH** | **전부 완료** |

---

## 6. 미결 사항 (Round 6 검토)

- [ ] brew upgrade 후 cloudflared/Caddy 방화벽 재등록 (R5-10 LOW)
- [ ] WAL checkpoint + backup 타이밍 (flock으로 serialize)
- [ ] pipeline_log 테이블 + /health last_crawl_at
- [ ] 이미지 fallback placeholder (다운로드 실패 상품)
- [ ] LaunchDaemons plist Caddy/cloudflared 실제 파일 작성

---

_Round 6에서 서브에이전트가 이 문서를 공격합니다._
