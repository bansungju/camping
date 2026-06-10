# 배포 상태 (2026-06-10)

## 목표
gear-forest.com 도메인으로 캠핑기어 서비스 외부 공개.
스택: **Cloudflare Tunnel → Caddy(:8080) → FastAPI(:8000) + SQLite**
Mac mini(`mimi@bangsui-Macmini`, 192.168.45.54)에서 24시간 상주.

## ✅ 완료된 것
1. **FastAPI 백엔드** — `/Users/mimi/camping/backend/`, 정상 작동 (uvicorn 127.0.0.1:8000)
2. **Caddy 리버스 프록시** — `/Users/mimi/camping/Caddyfile`, :8080에서 HTTP 서빙
3. **Cloudflare Tunnel** — 터널명 `camping`, ID `808dfc7f-f854-41c5-968e-5b1f97b9abe4`
   - Public Hostname: `www.gear-forest.com` → `http://localhost:8080` (HTTP! https 아님)
   - DNS CNAME 자동 생성됨
4. **end-to-end 검증 성공** — `curl https://www.gear-forest.com/health` → `{"status":"ok","products":2461}` 정상 응답 확인됨
5. **CORS** — main.py에 `https://www.gear-forest.com` origin 추가
6. **LaunchAgents plist 3개** 작성 → git push 완료, Mac mini에 pull 완료
   - `~/Library/LaunchAgents/com.camping.api.plist`
   - `~/Library/LaunchAgents/com.camping.caddy.plist`
   - `~/Library/LaunchAgents/com.camping.cloudflared.plist`
   - 원본: `/Users/mimi/camping/launchdaemons/*.plist`

## 🚨 보안 — 먼저 처리할 것
**CF 터널 토큰이 git history(commit 80cc94e)에 평문으로 노출됨 → GitHub public repo에 푸시됨.**
- [ ] **Cloudflare 대시보드 → camping 터널 → "Rotate token"** 클릭해서 토큰 재발급 (옛 토큰 즉시 무효화 → history에 남은 건 무해해짐)
- cloudflared plist는 이제 git 추적 제외(.gitignore). 커밋된 건 `*.plist.template`(placeholder)뿐.
- Mac mini에서 실제 plist 만드는 법:
  ```bash
  cd /Users/mimi/camping/launchdaemons
  sed 's/__CF_TUNNEL_TOKEN__/<새_rotate된_토큰>/' \
    com.camping.cloudflared.plist.template > com.camping.cloudflared.plist
  cp com.camping.cloudflared.plist ~/Library/LaunchAgents/
  ```

## ❌ 막힌 지점 (해결 필요)
**LaunchAgents 등록이 I/O error로 실패 중.**

실행한 명령:
```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.camping.api.plist
# → Load failed: 5: Input/output error
```
`launchctl load`(구버전 방식)도 동일하게 `5: Input/output error` 발생.

### 다음 진단 명령 (아직 결과 못 받음)
```bash
plutil -lint ~/Library/LaunchAgents/com.camping.api.plist   # plist 문법 검증
launchctl list | grep camping                                # 이미 등록됐는지
ls -la ~/Library/LaunchAgents/com.camping.*                  # 파일 복사 확인
```

### 의심 원인 후보
- plist가 이미 부분 로드돼 충돌 → `launchctl bootout gui/$(id -u)/com.camping.api` 후 재시도
- WorkingDirectory/경로 권한 문제
- `.venv/bin/uvicorn` 경로 또는 caddy/cloudflared 경로 불일치 (`which caddy`, `which cloudflared`로 확인)

## 현재 프로세스 상태
직전에 `pkill uvicorn; pkill caddy; pkill cloudflared` 실행함 → **현재 다 죽어있을 수 있음**.
LaunchAgents 등록 성공하면 자동 재시작되지만, 지금 사이트 접속은 안 될 수 있음.
임시로 살리려면 수동 실행:
```bash
cd /Users/mimi/camping
.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
caddy start --config Caddyfile
# 토큰은 launchdaemons/com.camping.cloudflared.plist 안에 있음 (거기서 복사)
cloudflared tunnel run --token <TOKEN> &
```

## 남은 TODO
- [ ] LaunchAgents 3개 정상 등록 (I/O error 해결)
- [ ] `sudo pmset -a sleep 0 disksleep 0` — Mac mini 잠자기 방지
- [ ] CF Tunnel 토큰을 Keychain에 저장 (plist에 평문 토큰 박혀있음 — 보안 개선)
- [ ] 재부팅 테스트 → 자동 복구 확인
