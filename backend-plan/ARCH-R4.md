# 맥미니 캠핑 백엔드 아키텍처 v4 (Round 4 방어 반영)

> 마지막 갱신: Round 4 (2026-06-10)
> 상태: 설계 진행 중 (HIGH 6개 → 전부 대응)

---

## 0. 변경 요약 (R3 → R4)

| 변경 | 이유 |
|------|------|
| **이미지 프록시 제거** → pipeline 다운로드 + 정적 서빙 | CF ToS 위반 + SSRF + 메모리폭탄 + SVG XSS 4개 동시 해결 |
| **slowapi** 로 rate limit 이동 (Caddy에서 FastAPI로) | brew Caddy에 rate_limit 모듈 없음 |
| deploy.sh: SIGHUP → `launchctl kickstart -k` | uvicorn SIGHUP = 종료 (graceful reload 아님) |
| aiosqlite: `asyncio.Semaphore(10)` 동시 연결 제한 | per-request 연결 FD 고갈 방지 |
| LaunchDaemons + UserName 키 | LaunchAgents = 로그인 세션 종속, 24/7 서버에 부적합 |
| 백업: 타임스탬프 파일명 + 로컬 7일 보관 | iCloud torn write → 덮어쓰기 방지 |
| 2차 모니터링 추가 (Freshping) | UptimeRobot 단일 장애점 |

---

## 1. 이미지 전략 전환 (핵심 변경)

```
[R3] 클라이언트 → /proxy/image?url=... → FastAPI → 다나와 (CF Tunnel 경유)
                                                     ↑ CF ToS 위반 + SSRF + XSS

[R4] pipeline/collect_images.py
     → site/images/{danawa_pcode}.jpg 직접 다운로드 (로컬 저장)
     → Caddy 정적 서빙: GET /images/{pcode}.jpg
     → CF Tunnel은 정적 이미지 바이트만 전달 (ToS 허용)
```

**용량:** ~2449 이미지 × 평균 50KB ≈ **122MB** (site/ 폴더 내 관리 가능)

**장점:**
- CF ToS 위반 없음 (정적 파일 서빙 = 허용)
- Referer 차단 영구 해결 (다나와 직접 접근 불필요)
- SSRF, 메모리 폭탄, SVG XSS 경로 자체 소멸
- FastAPI 엔드포인트 1개 제거 → 공격 면적 축소

---

## 2. 전체 구조 (최종 업데이트)

```
[인터넷 사용자]
      │ HTTPS
      ▼
[Cloudflare Edge + WAF (Free)]
      │ cloudflared tunnel
      ▼
[Caddy :8080]
  trusted_proxies cloudflare          # CF-Connecting-IP 복원
  admin off
  보안 헤더 (HSTS, X-Content-Type-Options, X-Frame-Options)
  .db 확장자 차단 (403)
  /api/*   → 127.0.0.1:8000           # FastAPI 프록시
  /health  → 127.0.0.1:8000           # 헬스체크 프록시
  /        → site/ 정적 서빙          # HTML + JSON + 이미지
    ├── site/data/*.json
    ├── site/images/*.jpg              # ← NEW: 다운로드된 상품 이미지
    └── site/*.html
      │
      ▼
[FastAPI :8000, bind=127.0.0.1]
  slowapi RateLimiter("60/minute", key_func=get_real_ip)  ← NEW
  CORSMiddleware: ["https://bansungju.github.io"]
  GET /health   → SELECT COUNT(*), timeout=0.5s, 503 on fail
  GET /api/...  → aiosqlite (Semaphore(10) 동시 연결 제한)  ← NEW
      │
      ▼
[SQLite camping_tents500.db + WAL]
  per-request 연결, Semaphore(10)

[pipeline (크롤러)]
  collect_images.py → site/images/{pcode}.jpg 다운로드  ← NEW
  camping_shadow.db (DELETE journal) → deploy.sh → prod
```

---

## 3. Round 4 구멍별 방어

### 🔴 R4-01~03,05: 이미지 프록시 4종 (HIGH → 한 번에 대응)

| 구멍 | 원인 | 해결 |
|------|------|------|
| R4-01 SSRF DNS Rebinding | /proxy/image 도메인→IP rebind | 프록시 엔드포인트 **제거** |
| R4-02 메모리 폭탄 | 무제한 스트리밍 버퍼 | 프록시 엔드포인트 **제거** |
| R4-03 SVG/HTML XSS | Content-Type 세탁 | 프록시 엔드포인트 **제거** |
| R4-05 CF ToS 위반 | 이미지 바이트를 CF가 중계 | pipeline 다운로드 → 정적 서빙 |

`collect_images.py` 추가 기능:
```python
import httpx, os

IMG_DIR = os.path.join(ROOT, "site", "images")
os.makedirs(IMG_DIR, exist_ok=True)

async def download_image(pcode: str, url: str) -> bool:
    dest = os.path.join(IMG_DIR, f"{pcode}.jpg")
    if os.path.exists(dest):
        return True  # 이미 있으면 스킵
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, follow_redirects=True)
        # MIME 화이트리스트 검증
        ct = r.headers.get("content-type", "")
        if not any(ct.startswith(m) for m in ("image/jpeg","image/png","image/webp","image/gif")):
            return False
        # 크기 제한 10MB
        if len(r.content) > 10 * 1024 * 1024:
            return False
        with open(dest, "wb") as f:
            f.write(r.content)
        return True
    except Exception:
        return False
```

---

### 🔴 R4-04: aiosqlite 연결 고갈 (HIGH → 대응완료)

```python
import asyncio

DB_SEMAPHORE = asyncio.Semaphore(10)  # 동시 DB 연결 최대 10개

async def query_db(sql, params=()):
    async with DB_SEMAPHORE:
        async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(sql, params) as cur:
                return await cur.fetchall()
```

uvicorn 기동 시 `--limit-concurrency 200` 추가:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 \
  --workers 2 --limit-concurrency 200
```

---

### 🔴 R4-06: SIGHUP = uvicorn 종료 (HIGH → 대응완료)

uvicorn 공식 동작: SIGHUP → `should_exit=True` (종료, reload 아님)

```bash
# deploy.sh 변경: SIGHUP 제거 → launchctl kickstart
# 기존: kill -HUP "$API_PID"
# 신규: graceful stop + LaunchAgents 재시작

launchctl kickstart -k gui/$(id -u)/com.camping.api
# -k: kill 후 재시작 (graceful), LaunchDaemons KeepAlive가 DB reload 보장
```

---

### 🔴 R4-08: Caddy rate_limit 모듈 없음 (HIGH → 대응완료)

`brew install caddy` 기본 바이너리에 rate_limit 없음 → **slowapi(FastAPI)**로 이동

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

def get_real_ip(request: Request) -> str:
    # trusted_proxies는 Caddy가 처리 → CF-Connecting-IP가 실제 IP
    return request.headers.get("CF-Connecting-IP") or get_remote_address(request)

limiter = Limiter(key_func=get_real_ip)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/category/{slug}")
@limiter.limit("60/minute")
async def get_category(request: Request, slug: str):
    ...
```

Caddyfile에서 `rate_limit` 지시어 **제거** (slowapi가 담당).

---

### 🟡 MED 추가 대응

| ID | 구멍 | 방어 |
|----|------|------|
| R4-07 | UptimeRobot 단일 장애점 | **Freshping** (무료, 1분 interval) 2차 모니터 추가 |
| R4-09 | iCloud 백업 torn write | `camping_backup_{YYYYMMDD_HHMMSS}.db` 타임스탬프 + 로컬 7일 보관 + `sqlite3 dest 'PRAGMA integrity_check'` 검증 |
| R4-10 | LaunchAgents 로그인 세션 종속 | `/Library/LaunchDaemons/` + plist에 `<key>UserName</key><string>사용자명</string>` |

---

## 4. 업데이트된 deploy.sh

```bash
#!/bin/bash
set -e
PROD=~/camping/camping_tents500.db
SHADOW=~/camping/camping_shadow.db

# 검증
ROW_COUNT=$(sqlite3 "$SHADOW" "SELECT COUNT(*) FROM products WHERE curation_status='verified'")
[ "$ROW_COUNT" -lt 2000 ] && echo "검증 실패: $ROW_COUNT" && exit 1

# WAL checkpoint + atomic rename
sqlite3 "$PROD" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || true
mv "$SHADOW" "$PROD"
rm -f "${PROD}-wal" "${PROD}-shm"

# FastAPI graceful restart (SIGHUP → launchctl kickstart)
launchctl kickstart -k "gui/$(id -u)/com.camping.api"

echo "배포 완료: $ROW_COUNT 모델"
```

---

## 5. 누적 방어 현황

| Round | HIGH 발견 | 대응 |
|-------|-----------|------|
| R1 | 11 | 전부 완료 |
| R2 | 5 | 전부 완료 |
| R3 | 4 | 전부 완료 |
| R4 | 6 | 전부 완료 |
| **합계** | **26 HIGH** | **전부 완료** |

---

## 6. 미결 사항 (Round 5 검토)

- [ ] slowapi가 CF-Connecting-IP 헤더를 신뢰하는데, CF를 우회한 요청이 직접 Caddy에 닿으면? (cloudflared outbound only라 원칙적 불가, 하지만 검증 필요)
- [ ] `site/images/` 디렉토리 용량 관리 (삭제된 제품 이미지 orphan 파일)
- [ ] pipeline_log 테이블 + /health last_crawl_at 연동
- [ ] LaunchDaemons plist 실제 파일 작성
- [ ] 이미지 다운로드 실패 시 fallback UI (placeholder 이미지)
- [ ] slowapi 상태 저장 방식 (in-memory → 프로세스 재시작 시 카운터 리셋 문제)

---

_Round 5에서 서브에이전트가 이 문서를 공격합니다._
