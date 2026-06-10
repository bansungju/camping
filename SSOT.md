# SSOT — 캠핑기어 서비스 인프라 단일 진실 공급원

> 한 번 확정된 사실은 여기 박아둔다. 추측·재탐색 금지. 바뀌면 이 파일부터 고친다.
> 노트북(개발) ↔ Mac mini(서버) 두 기기에서 같은 repo를 보므로, 양쪽 Claude의 공통 기준.

---

## 1. 기기 / 접속

| 항목 | 값 |
|------|-----|
| 서버 | Mac mini, 호스트명 `bangsui-Macmini`, 사용자 `mimi`, LAN IP `192.168.45.54` |
| 개발 | 노트북 (이 repo `~/camping`) |
| repo | https://github.com/bansungju/camping.git (main 브랜치) |
| 서버 repo 경로 | `/Users/mimi/camping` |
| SSH | 노트북에서 `ssh macmini` (단, **macmini 호스트명은 DNS 해석 안 됨** → IP `192.168.45.54` 직접 사용) |
| 서버 OS | macOS (Darwin), Python **3.14** (homebrew) |

## 2. 서비스 스택 (확정)

```
인터넷 → Cloudflare Edge → cloudflared(터널) → Caddy :8080 (HTTP) → FastAPI :8000 → SQLite
```

| 컴포넌트 | 포트/주소 | 비고 |
|----------|-----------|------|
| FastAPI (uvicorn) | `127.0.0.1:8000` | 외부 비공개. 실행: `.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000` |
| Caddy | `:8080` **HTTP** (HTTPS 아님!) | 정적 + `/api/*` 프록시. config: `/Users/mimi/camping/Caddyfile` |
| cloudflared | 터널 `camping` | ID `808dfc7f-f854-41c5-968e-5b1f97b9abe4` |
| 도메인 | `www.gear-forest.com` | Cloudflare 등록 zone `gear-forest.com` |
| 바이너리 경로 | `/opt/homebrew/bin/caddy`, `/opt/homebrew/bin/cloudflared` | |
| venv | `/Users/mimi/camping/.venv` | |
| DB | `/Users/mimi/camping/camping_tents500.db` | verified 2461개, 16카테고리 |

## 3. Cloudflare Tunnel 라우트 (확정)

- 타입: **Published application**
- Hostname: `www.gear-forest.com`
- **Service URL: `http://localhost:8080`** ← `https://`로 하면 `tls: first record does not look like a TLS handshake` 502 발생. 반드시 `http://`.
- DNS: CNAME `www.gear-forest.com` → `808dfc7f-...cfargotunnel.com` (자동 생성됨)
- 검증 OK: `curl https://www.gear-forest.com/health` → `{"status":"ok","products":2461}`

## 4. 하드 검증된 GOTCHA (다시 헤매지 말 것)

1. **macOS launchctl은 `load` 아님 → `bootstrap`**:
   `launchctl bootstrap gui/$(id -u) <plist>`. 구식 `launchctl load`는 `5: Input/output error`.
   이미 부분 등록돼 충돌 시: `launchctl bootout gui/$(id -u)/<label>` 후 재시도.
2. **Caddy 터널 연결은 HTTP** (위 3번). https 절대 금지.
3. **Python 3.9 호환 코드 흔적 주의** — 실제 서버는 3.14지만, 과거 `asyncio.timeout`(3.11+) 대신 `asyncio.wait_for` 쓰도록 짜둠. db.py 참고. 굳이 되돌리지 말 것.
4. **Caddyfile은 heredoc/SSH로 쓰지 말 것** — 따옴표 이스케이프 깨짐. 노트북에서 파일로 쓰고 git 또는 scp.
5. **SSH로 Keychain 접근 불가** (`security add-generic-password` → "User interaction is not allowed"). Mac mini 직접 터미널에서만.
6. **macmini 호스트명 DNS 해석 안 됨** — `ssh macmini` 대신 IP 직접.
7. **Caddyfile `trusted_proxies cloudflare`** — Caddy v2.11 기본 빌드에 없는 모듈. 제거함. rate limit은 slowapi가 `CF-Connecting-IP` 헤더로 처리.
8. **Caddy `rate_limit` 모듈** 기본 brew 빌드에 없음 → FastAPI(slowapi) 레이어로 옮김.

## 5. 자동시작 (LaunchAgents)

설치 위치: `~/Library/LaunchAgents/com.camping.{api,caddy,cloudflared}.plist`
원본 템플릿: `/Users/mimi/camping/launchdaemons/`
설치:
```bash
cp /Users/mimi/camping/launchdaemons/com.camping.api.plist   ~/Library/LaunchAgents/
cp /Users/mimi/camping/launchdaemons/com.camping.caddy.plist ~/Library/LaunchAgents/
# cloudflared는 토큰 채워서 생성 (아래 6번)
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.camping.api.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.camping.caddy.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.camping.cloudflared.plist
launchctl list | grep camping   # 3줄 나오면 성공
```

## 6. 시크릿 정책 (중요)

- **CF 터널 토큰은 git에 절대 커밋 금지.** `launchdaemons/com.camping.cloudflared.plist`는 `.gitignore`됨. 커밋되는 건 `*.template`(placeholder `__CF_TUNNEL_TOKEN__`)뿐.
- 실제 plist 생성 (Mac mini에서):
  ```bash
  cd /Users/mimi/camping/launchdaemons
  sed 's/__CF_TUNNEL_TOKEN__/<실제토큰>/' com.camping.cloudflared.plist.template \
    > com.camping.cloudflared.plist
  cp com.camping.cloudflared.plist ~/Library/LaunchAgents/
  ```
- 노출 이력: commit `80cc94e`에 토큰 평문 푸시됨(2026-06-10). **rotate 필요** → CF 대시보드 camping 터널 "Rotate token". rotate하면 옛 토큰 무효화되어 history 잔존분 무해.
- 토큰 위험범위: **이 터널 하나에 한정**. 계정/DNS/결제 접근권 아님.

## 7. CORS 허용 origin (main.py)

`https://www.gear-forest.com`, `https://bansungju.github.io`, `http://localhost:3000`, `http://127.0.0.1:5500`

## 8. 현재 미해결 / TODO

- [ ] LaunchAgents 등록 시 `5: Input/output error` — 진단 미완 (plutil -lint / bootout 후 재시도 / 경로 확인)
- [ ] CF 토큰 rotate
- [ ] `sudo pmset -a sleep 0 disksleep 0` (Mac mini 잠자기 방지)
- [ ] 재부팅 후 자동복구 검증
