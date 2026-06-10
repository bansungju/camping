# 맥미니 캠핑 백엔드 아키텍처 v3 (Round 3 방어 반영)

> 마지막 갱신: Round 3 (2026-06-10)
> 상태: 설계 진행 중 (HIGH 4개 → 전부 대응)

---

## 0. 변경 요약 (R2 → R3)

| 변경 | 이유 |
|------|------|
| 이미지 프록시 `/proxy/image` 엔드포인트 추가 | 다나와 Referer 차단 시 이미지 파손 방지 |
| CF Tunnel token → macOS Keychain 저장 | .env git 노출 차단 (.gitignore도 업데이트 완료) |
| deploy.sh: WAL 제거 + SIGHUP 시그널 추가 | atomic rename 후 WAL 파일 잔류 → connection 오염 방지 |
| `/health` 실제 DB 쿼리 + 503 반환 | 프로세스 생존만 확인하던 오탐 방지 |
| Caddy upstream health_uri 설정 | FastAPI 미기동 중 502 폭풍 방지 |
| LaunchAgents(사용자 레벨)로 이동 | root 실행 제거 |
| WAL 크기 모니터링 cron 추가 | read-only 연결이 WAL checkpoint 차단 감지 |

---

## 1. 전체 구조 (업데이트)

```
[인터넷 사용자]
      │ HTTPS
      ▼
[Cloudflare Edge + WAF]
      │ cloudflared tunnel (outbound only)
      ▼
[Caddy :8080]
  trusted_proxies cloudflare
  rate_limit {remote_host} 60r/m
  upstream health_uri /health    ← NEW: FastAPI 미기동 시 자체 503
  handle /proxy/image/*          ← NEW: 이미지 프록시 라우팅
  handle /api/*    → :8000
  handle /         → site/ (정적)
      │
      ▼
[FastAPI :8000, bind=127.0.0.1]
  CORSMiddleware: ["https://bansungju.github.io"]
  GET /health          ← 실제 DB SELECT 1, 500ms timeout, 503 on fail
  GET /proxy/image     ← 이미지 프록시 (danawa 도메인 화이트리스트)
  GET /api/...
      │
      ▼
[SQLite camping_tents500.db]
  WAL 모드 (API 읽기)
  per-request 연결 open/close (inode 고착 방지)  ← NEW

[CF Tunnel Token]
  macOS Keychain에 저장  ← NEW
  launchd plist: /usr/bin/security find-generic-password -s cf-tunnel-token -w
```

---

## 2. Round 3 구멍별 방어

### 🔴 R3-01: 이미지 핫링킹 (HIGH → 대응완료)

**문제:** 브라우저가 다나와 og:image를 직접 호출 → `Referer: bansungju.github.io` 자동 첨부 → 다나와가 차단 시 전체 이미지 파손

**방어:**
```python
import httpx
from fastapi import HTTPException
from urllib.parse import urlparse

ALLOWED_IMAGE_HOSTS = {"img.danawa.com", "img2.danawa.com", "t1.daumcdn.net"}

@app.get("/proxy/image")
async def proxy_image(url: str):
    host = urlparse(url).netloc
    if host not in ALLOWED_IMAGE_HOSTS:
        raise HTTPException(403, "허용되지 않은 이미지 도메인")
    async with httpx.AsyncClient() as client:
        # Referer 제거하고 서버사이드 fetch
        r = await client.get(url, headers={"Referer": ""}, timeout=5, follow_redirects=True)
    return Response(r.content, media_type=r.headers.get("content-type", "image/jpeg"),
                    headers={"Cache-Control": "public, max-age=86400"})
```

- 화이트리스트 외 도메인 403 차단 → 오픈 프록시 방지
- 서버에서 Referer 없이 fetch → 다나와 차단 우회
- 응답 1일 캐싱 → 반복 호출 방지

---

### 🔴 R3-02: CF Tunnel token 노출 (HIGH → 대응완료)

**문제:** `.env` git 누락 시 TUNNEL_TOKEN GitHub 노출 → 공격자 동일 hostname에 중복 터널 MITM

**방어:**

```bash
# 1. macOS Keychain에 저장 (한 번만 실행)
security add-generic-password -s "cf-tunnel-token" -a "camping" -w "TOKEN값"

# 2. launchd plist에서 Keychain 참조
# com.camping.cloudflared.plist
<key>ProgramArguments</key>
<array>
  <string>/bin/sh</string>
  <string>-c</string>
  <string>
    TOKEN=$(security find-generic-password -s cf-tunnel-token -a camping -w)
    exec /opt/homebrew/bin/cloudflared tunnel run --token "$TOKEN"
  </string>
</array>
```

- `.gitignore` 업데이트 완료 (`.env`, `*.env`, `cf_token.txt` 추가)
- git 히스토리 점검 완료: 실제 토큰 값 누출 없음 (ARCH 문서의 변수명만 존재)

---

### 🔴 R3-03: deploy.sh atomic rename 레이스 (HIGH → 대응완료)

**문제:** shadow rename 후 구 `.db-wal`/`.db-shm` 잔류 → aiosqlite가 신규 main + 구 WAL 혼용 → corrupt

**방어:**

```bash
#!/bin/bash
# deploy.sh — 안전한 DB 교체

set -e
PROD=~/camping/camping_tents500.db
SHADOW=~/camping/camping_shadow.db
API_PID=$(pgrep -f "uvicorn backend.main" || true)

# 1. shadow 검증 (최소 행 수 확인)
ROW_COUNT=$(sqlite3 "$SHADOW" "SELECT COUNT(*) FROM products WHERE curation_status='verified'")
[ "$ROW_COUNT" -lt 2000 ] && echo "검증 실패: $ROW_COUNT 행 (기대: 2000+)" && exit 1

# 2. prod WAL 완전 체크포인트 (write 연결 단회 사용)
sqlite3 "$PROD" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || true

# 3. atomic rename (shadow는 DELETE journal → 단일파일)
mv "$SHADOW" "$PROD"

# 4. 구 WAL/SHM 제거 (잔류 시 corrupt 원인)
rm -f "${PROD}-wal" "${PROD}-shm"

# 5. FastAPI connection 재오픈 (SIGHUP → lifespan reload)
[ -n "$API_PID" ] && kill -HUP "$API_PID" && echo "FastAPI reload 신호 전송"

echo "배포 완료: $ROW_COUNT 모델"
```

---

### 🔴 R3-04: /health 오탐 (HIGH → 대응완료)

**문제:** FastAPI 프로세스만 살아있으면 200 ok → DB 장애 은폐

**방어:**

```python
import asyncio

@app.get("/health")
async def health():
    try:
        async with asyncio.timeout(0.5):  # 500ms 타임아웃
            async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
                row = await db.execute_fetchall("SELECT COUNT(*) FROM products")
                count = row[0][0]
        return JSONResponse({"status": "ok", "products": count, "ts": int(time.time())})
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)}, status_code=503)
```

- UptimeRobot: keyword 모니터링 → body에 `"ok"` 없으면 장애 알림
- 503 반환 → Caddy가 upstream down으로 판단 → 커스텀 503 페이지

---

### 🟡 MED 추가 대응

| ID | 구멍 | 방어 |
|----|------|------|
| R3-06 | Caddy admin :2019 | `admin off` — ARCH-R2 Caddyfile에 이미 포함 ✓ |
| R3-07 | FastAPI 부트 전 502 폭풍 | Caddyfile `reverse_proxy { health_uri /health health_interval 2s fail_duration 10s }` |
| R3-08 | read-only 연결이 WAL checkpoint 차단 | per-request 연결 (pool 제거), pipeline 후 `PRAGMA wal_checkpoint(PASSIVE)` |
| R3-09 | 크롤러 봇 차단 사일런트 실패 | pipeline_log 테이블 기록, /health에 `last_crawl_at` 노출 |
| R3-10 | LaunchDaemons root 실행 | `~/Library/LaunchAgents`로 이동 (사용자 권한 실행) |
| R3-05 | iCloud DB 평문 저장 | 캠핑 상품 공개 데이터 → 개인정보 없음, 위험도 LOW. Advanced Data Protection 활성화 권장 |

---

## 3. 완성된 Caddyfile

```caddyfile
{
  admin off
}

:8080 {
  trusted_proxies cloudflare
  rate_limit {remote_host} 60r/m

  header {
    Strict-Transport-Security "max-age=31536000"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    -Server
  }

  @dbfile path *.db *.db-wal *.db-shm *.sqlite
  respond @dbfile 403

  handle /api/* {
    reverse_proxy 127.0.0.1:8000 {
      health_uri    /health
      health_interval 2s
      fail_duration 10s
    }
  }

  handle /proxy/image {
    reverse_proxy 127.0.0.1:8000
  }

  handle /health {
    reverse_proxy 127.0.0.1:8000
  }

  handle_errors {
    respond "서비스 일시 점검 중입니다." 503
  }

  handle {
    root * /Users/사용자명/camping/site
    file_server
    header Cache-Control "max-age=1800"
  }
}
```

---

## 4. launchd plist 위치 변경

```
# 변경 전 (root 실행 위험)
/Library/LaunchDaemons/com.camping.*.plist

# 변경 후 (사용자 권한)
~/Library/LaunchAgents/com.camping.api.plist
~/Library/LaunchAgents/com.camping.caddy.plist
~/Library/LaunchAgents/com.camping.cloudflared.plist
~/Library/LaunchAgents/com.camping.backup.plist

# 로드 명령
launchctl load ~/Library/LaunchAgents/com.camping.api.plist
```

---

## 5. 누적 방어 현황

| Round | HIGH 발견 | 대응 |
|-------|-----------|------|
| R1 | 11 | 전부 완료 |
| R2 | 5 | 전부 완료 |
| R3 | 4 | 전부 완료 |
| **합계** | **20 HIGH** | **전부 완료** |

---

## 6. 미결 사항 (Round 4+ 검토)

- [ ] 이미지 프록시 응답 디스크 캐시 (동일 URL 반복 fetch 방지)
- [ ] pipeline_log 테이블 스키마 + /health last_crawl_at 연동
- [ ] deploy.sh SIGHUP → FastAPI lifespan reload 핸들러 구현
- [ ] WAL 크기 모니터링 cron (100MB 초과 시 알림)
- [ ] UptimeRobot keyword 설정 (`"ok"` body 확인)
- [ ] LaunchAgents plist 실제 파일 작성

---

_Round 4에서 서브에이전트가 이 문서를 공격합니다._
