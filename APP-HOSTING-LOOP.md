# 앱호스팅 검증 루프 (Think ↔ Verify)

> 설계서: [APP-HOSTING.md](APP-HOSTING.md) · 루프 시작 2026-06-11
> 리듬: **10분 = 메인이 한 영역 사고** → **다음 10분 = sonnet 서브에이전트가 검증·반박** → 다음 영역으로.
> 앱 코드는 건드리지 않음(설계·검증 전용).

## 영역 분할 (7)

| # | 영역 | 한 줄 정의 |
|---|---|---|
| A1 | **Origin & PWA 준비성** | gear-forest.com 루트 서빙·Lighthouse installable·manifest의 TWA 적합성 |
| A2 | **인프라 (.well-known/Tunnel)** | Caddy `.well-known` 서빙 패치·Cloudflare Tunnel ingress·assetlinks 200 |
| A3 | **서명 & Digital Asset Links** | 업로드키 vs App Signing키, SHA-256 대조, 검증 실패 모드 |
| A4 | **TWA 빌드 구성** | Bubblewrap 환경·twa-manifest·아이콘/스플래시/푸시 채널 |
| A5 | **Play Console 출시 절차** | 계정·트랙·AAB·App Signing 활성화·단계적 출시 |
| A6 | **등록정보 & 정책 컴플라이언스** | 데이터안전성·쿠팡 어필리에이트 고지·개인정보·콘텐츠등급 |
| A7 | **iOS 2차 & 배포 자동화** | Capacitor 경로·유지보수 이중화·릴리스 자동화 |

## 상태 (state machine)

- NEXT: **A1 / VERIFY** (다음 깨어남에 실행)
- 완료: A1/THINK ✅
- 페이즈 규칙: `THINK`(메인 사고) → 10분 후 `VERIFY`(sonnet 반박) → 다음 영역 `THINK`
- 종료조건: A7/VERIFY 완료 또는 사용자 중단

---

## A1 — Origin & PWA 준비성 · THINK (2026-06-11)

### 핵심 주장
1. **앱이 가리킬 origin은 `https://gear-forest.com` 루트 하나로 고정**해야 한다. github.io/camping은 서브패스라 `.well-known` 통제 불가 → TWA 검증 불가. (설계서 §2 재확인)
2. manifest는 루트 서빙 전제 시 TWA 요건을 대체로 충족:
   - `start_url:"./index.html"` + `scope:"./"` → 루트에서 각각 `/index.html`, `/` 로 해석. ✅
   - 아이콘 192/512/maskable-512 존재 ✅, `theme_color #2f7a4e`·`background_color #fff`·`display standalone` ✅
3. **불확실/위험 지점(검증 필요):**
   - (a) gear-forest.com 이 실제로 Cloudflare Tunnel→Caddy:8080→`site/` 로 **루트 서빙되는지** 미확인. tunnel ingress는 `--token` 방식이라 CF 대시보드(원격)에서 관리 → repo로 확인 불가, **curl 실측 필요**.
   - (b) Lighthouse installability 가 **service worker의 fetch 핸들러**를 요구하는지(현재 sw.js에 fetch 핸들러 있는지 미확인).
   - (c) `start_url:"/index.html"` vs `"/"` — TWA 딥링크/검증에 차이가 있는가.
   - (d) manifest에 `id` 필드 부재 — Play/TWA에서 app id 안정성에 영향 있는가.
   - (e) 상대 `scope:"./"` 가 Bubblewrap `init` 에서 절대 scope로 잘 해석되는가.

### 검증 단계로 넘길 질문 (→ A1/VERIFY, sonnet)
- 위 (b)(c)(d)(e)의 사실관계를 2024~2026 기준 Chromium/Bubblewrap 동작으로 반박·확인.
- "루트 origin 하나로 고정" 결정이 **github.io 트래픽/SEO를 버리는** 트레이드오프인지, 둘 다 유지하며 앱만 gear-forest.com 가리켜도 되는지.
- sw.js의 실제 fetch 핸들러 유무를 코드로 확인(설치가능성 직결).
