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

## 🔴 베이스라인 실측 정정 (2026-06-11, 실행 1단계)

**A2 전제가 틀렸음.** `curl` 실측 결과:
- gear-forest.com → `Server: GitHub.com`, DNS 185.199.108-111.153 (**GitHub Pages**, Cloudflare 미경유)
- `/api/health` 404, 배포=Actions `upload-pages-artifact: site/`, `site/CNAME=gear-forest.com`
- assetlinks 현재 404(파일없음), http도 301 아닌 404(리다이렉트 없음=검증기 친화)

⇒ **mini Caddy/Cloudflare Tunnel은 gear-forest.com을 서빙 안 함.** A2의 Caddy `.well-known` 패치·admin off·launchctl·CF Bot Fight/Always-HTTPS 분석은 **이 도메인엔 전부 무효**.
⇒ **P0-4 격하**: "Caddy 3중 패치" → "`site/.well-known/assetlinks.json` + `site/.nojekyll` 2파일 커밋". GitHub Pages가 json mime·HTTPS·무리다이렉트·SPOF없음 자동 충족.
⇒ 설계서 §2/§3/§11 정정 완료.

## 상태 (state machine)

- NEXT: **🏁 루프 종료(DONE)** — 더 예약 없음
- 완료: A1~A7 THINK+VERIFY 전부 ✅ · 통합 런치 체크리스트 → APP-HOSTING.md §11
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

## A1 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P1] start_url `/index.html` 고정** → 딥링크 intent-filter가 `/index.html`에 묶여 `/` 진입 링크가 브라우저로 샐 수 있음. A1의 "차이 없다"는 단정 오류. → `"/"` 또는 `"."`로 바꾸고 서버 `/`→index 서빙 확인.
- **[P1] Bubblewrap Issue #883** — manifest `scope`가 AndroidManifest intent-filter에 미반영(도메인 전체로 생성). 현재 루트 서빙이라 무해하나 빌드 후 `startUrl/launchUrl/scopeUrl` 절대URL 수동 확인 필수.
- **[P2] manifest `id` 필드 부재** — 없으면 `id = start_url`이 PWA identity 대리값. 나중에 start_url 바꾸면 "다른 앱"으로 인식돼 설치 깨짐. Bubblewrap이 보완 안 함. → `"id":"https://gear-forest.com/"` 선제 명시.
- **[P2] github.io 포기 결론 철회** — 웹은 github.io 유지(canonical 이미 gear-forest.com 지정됨), **앱만** gear-forest.com 가리키면 됨. SEO 손실 불필요. → 설계서 §2 수정.

**확인됨(타당):**
- (a) sw.js `:37`에 fetch 핸들러 **존재** ✅. Chrome 108/112부터 메뉴설치엔 fetch 불필요해졌으나 install prompt 신호엔 여전히 사용. TWA 검증엔 fetch 유무 무관.
- 주장1(github.io 서브패스 `.well-known` 통제 불가) ✅, 주장2(아이콘/theme/standalone) ✅.

**추가 발견 리스크:**
- (f-2) `orientation:"portrait-primary"` 강제잠금 → Fold/Chromebook 회전 봉쇄. `"portrait"`/`"any"` 완화 검토.
- (f-3) sw.js `skipWaiting()`+`clients.claim()` → 열린 탭이 구버전 캐시 요청 시 404 레이스. Lighthouse 신뢰성 감점.
- (f-4) `auth-callback.html`이 SW SHELL 캐시에 없음 → 오프라인 OAuth 콜백 무음 실패 가능(소셜 로그인 직접 리스크).
- (f-1) manifest `screenshots` 부재 → 설치 bottom-sheet 미리보기 없음(전환율).

**→ 반영 액션:** ① start_url `"/"`+`id` 명시(앱 무수정 원칙 → *제안*만, 적용은 승인 후) ② §2를 'github.io 병행 유지'로 수정 ③ orientation 완화 검토 ④ 빌드 후 twa-manifest 절대URL 수동검증 ⑤ auth-callback SW 캐시·screenshots는 PWA 개선 백로그.

---

## A2 — 인프라 (.well-known / Tunnel) · THINK (2026-06-11)

### 확인된 사실
- 운영 서버 = **Mac mini**(`mimi@192.168.45.54`, 경로 `/Users/mimi/camping`). Caddy는 launchd(`com.camping.caddy`)로 `caddy run --config /Users/mimi/camping/Caddyfile`.
- 배포 = `deploy-to-mini.sh`: **git push → ssh mini git pull**. (정적 파일만 동기화)
- cloudflared = `tunnel run --token`(named tunnel). **ingress 매핑은 CF 대시보드 원격 관리** — repo에 없음.
- `site/.well-known/` **미존재**. 메인 `handle{}`의 `file_server{hide .*}`가 `.well-known`(점 디렉터리) 차단 확정.

### 핵심 주장
1. **assetlinks 배포 경로 = git**: `site/.well-known/assetlinks.json` 커밋 → mini git pull → Caddy 서빙. 별도 인프라 불필요. 단 §3 Caddy 패치 선행.
2. **🚨 배포 스크립트 갭**: `deploy-to-mini.sh`는 git pull만 함 — **Caddy reload 안 함**. Caddyfile(.well-known 블록) 변경은 git만으론 적용 안 됨. mini에서 `caddy reload --config ...` 또는 launchd kickstart 필요. → 배포 절차에 reload 단계 추가해야 함.
3. **Content-Type 과다지정 위험**: §3 제안의 `header Content-Type application/json`을 `/.well-known/*` **전체**에 거는 건 과함. Caddy file_server는 `.json`→`application/json` 자동 설정. 향후 다른 `.well-known` 파일(ACME challenge=text/plain 등)이 들어오면 깨짐. → 헤더 강제 제거하거나 `assetlinks.json`만 스코프.
4. **Cloudflare 경유 함정(검증 필요)**:
   - Tunnel은 CF 엣지에서 TLS 종단(CF 유니버설 SSL) → origin(Caddy:8080)은 평문이나 터널 암호화. assetlinks는 HTTPS 유효 인증서 필요 → CF 인증서로 충족 추정.
   - **리다이렉트 금지**: Google asset links 검증기는 `https://gear-forest.com/.well-known/assetlinks.json`을 직접 200으로 받아야. www↔apex·trailing-slash 리다이렉트가 끼면 실패 가능.
   - **Cloudflare Access(Zero Trust)** 가 도메인 앞에 있으면 Google 검증기 차단. assetlinks 경로는 인증 없이 공개여야.
   - **Bot Fight Mode / Browser Integrity Check** 가 Google 검증 UA 차단 가능성.
5. **가용성(SPOF)**: 가정용 단일 mini + 홈 IP 터널. assetlinks 다운 시 신규 설치/첫 실행 검증 실패. 단 Chrome은 1회 검증 성공 후 캐시·주기 재검증 → 기설치 영향은 제한적(검증 필요).

### → A2/VERIFY로 넘길 질문 (sonnet)
- Google Digital Asset Links 검증기가 **리다이렉트를 따르는가**? Chrome TWA 검증 **캐시 수명·재검증 주기**와 assetlinks 다운타임이 기설치 앱에 주는 영향?
- `Content-Type` 강제가 필요한가(Caddy 자동 vs 명시)? `/.well-known/*` 전체 강제의 부작용?
- Cloudflare **Bot Fight/BIC/Access/캐시·transform** 중 assetlinks fetch를 깨뜨릴 수 있는 것은? 완화책?
- CF 유니버설 SSL 인증서 체인이 Android assetlinks 검증에 충분한가?
- `deploy-to-mini.sh`에 Caddy reload 단계 추가가 맞는 해법인가, launchd watch가 더 나은가?

## A2 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0] `admin off` → `caddy reload` 불가** (Caddyfile L2). reload는 Admin API(:2019) 경유인데 admin off라 안 됨. → deploy에 `ssh mini "launchctl kickstart -k gui/$(id -u mimi)/com.camping.caddy"` (hard restart, 순간 다운). 실패 시 `exit 1` 알림.
- **[P0] handle 블록 순서** — `handle /.well-known/*`를 **마지막 `handle{}`보다 앞**에 둬야. Caddy handle은 first-match. 순서 틀리면 여전히 `hide .*`에 걸림.
- **[P0] "Always Use HTTPS" 리다이렉트** — Google 검증기는 **301/302를 안 따름**. CF의 http→https 301이 끼면 검증 실패. CF 대시보드에서 명시 확인. assetlinks는 직접 200·application/json·HTTPS·무리다이렉트 필수.
- **[P1] Content-Type 정정** — A2의 "헤더 과하다"는 **틀림**. Google이 `application/json` **필수**로 명시. 단 `/.well-known/*` 전체 강제는 금물(향후 AASA 등). → `*.json`에만 스코프해 명시.
- **[P1] Bot Fight Mode/BIC** — free tier Bot Fight Mode는 verified bot도 차단 가능. `/.well-known/assetlinks.json`에 WAF skip rule 또는 비활성화.
- **[P1] 캐시** — assetlinks에 `Cache-Control: no-cache`(키 회전 즉시반영). 현재 `max-age=1800` 상속 차단.
- **[P1] Chrome 검증 캐시 정정** — Android 15+(API35)는 백그라운드 주기 재검증·전파 최대 7일, 14↓는 설치/업뎃 시만. Play Services 경유+기기 직접 fetch 이중경로. 기설치 영향 "제한적"은 버전의존 — 단기 다운도 위험.

**확인됨(타당):** `hide .*`가 `.well-known` 차단(사실) · deploy에 reload 없음(L12 확인) · CF 유니버설 SSL 충분.

**추가 발견:** (F4) 재부팅 시 cloudflared가 Caddy(:8080)보다 먼저 뜨면 502 — launchd `KeepAlive`/기동순서 확인. (F5) `site/.well-known`는 빈 디렉터리=git 미추적, assetlinks.json 파일을 만들어야 배포됨. (F6) CF 대시보드 Redirect/Page Rule이 `/.well-known/*` 건드리는지 확인불가→점검. (F3) mini 절전 시 네트워크 끊김.

**→ 반영 액션:** ① 설계서 §3 패치 정정(순서+`*.json` 스코프+no-cache) ② deploy 스크립트에 `launchctl kickstart` reload+실패알림 ③ CF 대시보드 체크리스트(Always-HTTPS off경로/Bot Fight skip/Redirect rule) ④ launchd KeepAlive·기동순서 점검 ⑤ assetlinks.json 실제 파일 생성·커밋. [§3 설계서 정정 완료 ✅]

---

## A3 — 서명 & Digital Asset Links · THINK (2026-06-11)

### 확인된 사실
- `.gitignore`에 **keystore/jks/aab/apk 패턴 전무** → `android.keystore` 커밋 위험. → `twa/.gitignore` 생성으로 차단 완료 ✅.

### 핵심 주장 (키 3종 모델)
1. **Play App Signing 강제** — 신규 앱은 AAB 필수 → Google이 **App Signing 키 생성·보관**. assetlinks엔 이 키의 SHA-256이 **반드시** 들어가야(첫 AAB 업로드 후 Play Console에서 조회).
2. **키 3종 구분이 핵심 혼동 지점:**
   - **디버그 키** — `bubblewrap build` 로컬 테스트 직접설치용(선택)
   - **업로드 키**(`android.keystore`) — 내가 생성, AAB 서명. 유출/분실해도 Play에서 재설정 가능(복구 가능)
   - **App Signing 키** — Google 보관, 실사용자 배포 서명. 분실 불가(Google이 보유)
   → assetlinks `sha256_cert_fingerprints`에 **App Signing 키 + (로컬검증 시) 업로드/디버그 키 모두** 넣으면 안전.
3. **닭-달걀 시퀀스(A5 연동):** App Signing SHA는 **첫 AAB 업로드 후에만** 조회 가능. 순서 = 빌드 → 내부테스트 업로드 → SHA 조회 → assetlinks 배포 → 검증.
4. **assetlinks 형식 정밀:** SHA-256은 대문자 hex colon-구분, `package_name` = `applicationId`(com.gearforest.app) 정확 일치, `relation`=`delegate_permission/common.handle_all_urls`.
5. **도구:** `bubblewrap fingerprint generateAssetLinks` 로 자동 생성 가능(수동 작성 오타 방지). 단 업로드키만 자동 넣고 App Signing키는 수동 추가해야 할 가능성(검증 필요).
6. **보안:** 업로드 키 유출 시 위장 업로드 위험(단 Play App Signing이 최종 방어). 키스토어 비번은 .env류 아닌 오프라인 백업으로 안전 보관.

### → A3/VERIFY로 넘길 질문 (sonnet)
- `bubblewrap fingerprint`/`generateAssetLinks` 정확한 커맨드·동작? App Signing 키를 자동으로 못 넣는 게 맞나?
- SHA-256 대소문자/콜론 형식 엄격성 — Google API가 normalize하나, 정확 일치 필요한가?
- `bubblewrap build`의 서명 흐름 — 디버그키 vs 업로드키 중 무엇으로 서명? 로컬 "주소창 사라짐" 테스트엔 어느 키 지문이 assetlinks에 필요?
- 업로드 키 분실/유출 시 Play 재설정 절차·소요시간·assetlinks 갱신 필요성?
- assetlinks fingerprint 개수 상한/주의? 키 회전 시 운영?
- 놓친 것: 키 알고리즘(RSA2048/EC), CI 서명, `applicationId`와 manifest `packageId` 일치 보장.

## A3 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0] `generateAssetLinks` 자동생성은 함정** — Bubblewrap이 v1.11.0부터 keystore 자동 fingerprint 추출을 **의도적 제거**(Issue #486, 업로드키만 들어가 검증실패 빈발했기 때문). `twa-manifest.json`의 `fingerprints` 배열이 비면 **빈 assetlinks 조용히 생성**. → 반드시 `bubblewrap fingerprint add <App-Signing-SHA256> --name "..."` 먼저, 그 다음 `generateAssetLinks`.
- **[P0] 로컬 테스트 키 혼동** — `bubblewrap build` 산출 APK는 **업로드키**로 서명. ADB 직접설치로 주소창 검증하려면 assetlinks에 **업로드키 SHA** 필요. Play 배포 앱은 **App Signing키 SHA**. 둘은 다른 키 — README §3가 명확히 대조 안 함.
- **[P1] 업로드키 재설정 후속** — 재설정(24~48h, Play Console 요청) 후 SHA가 바뀜 → assetlinks에 업로드키 SHA 넣었으면 **재배포 필요**(Play 배포 앱은 App Signing 불변이라 무영향).
- **[P1] PEPK 선택지 누락** — App Signing키는 Google자동생성(RSA4096, 신규 기본) vs PEPK(자체키 업로드, 주로 마이그레이션). 신규앱은 자동생성 맞음.
- **[P2] SHA 형식 엄격** — Google은 **대문자 hex+콜론** 명시. 소문자 정규화 보장 없음. Play Console 복사본이 소문자면 대문자 변환. keytool 출력은 대문자.

**확인됨(타당):** Play App Signing 강제(2021.8~ AAB의무) · 닭달걀 시퀀스 · relation 값 · assetlinks 경로 · 업로드키 분실 시 App Signing이 최후방어.

**추가 발견:** 업로드키 알고리즘 RSA2048+ 확인 · keystore 비번 분실=재설정 필요 · CI는 keystore를 Secrets(Base64) 관리, 누출=유출 동일 · Android assetlinks 응답 **5분~1h 캐시**(배포직후 실패해도 만료 후 재시도, `pm clear com.google.android.gms`/재부팅) · 디버깅 = **Statement List Tester API**(`digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://gear-forest.com&relation=delegate_permission/common.handle_all_urls`).

**→ 반영 액션:** ① README에 `fingerprint add → generateAssetLinks` 순서 명시(빈파일 경고) ② README §3에 로컬=업로드키 / Play=App Signing키 2행 대조 ③ Statement List Tester URL + `adb am start` 딥링크 테스트 추가 ④ template에 대문자 SHA 주의 ⑤ 업로드키 재설정 후속 메모. [README/template 정정 완료 ✅]

---

## A4 — TWA 빌드 구성 · THINK (2026-06-11)

### 확인된 사실
- sw.js에 `push`(L70)·`notificationclick`(L82) 핸들러 존재 ✅. 웹푸시는 SW+VAPID(Supabase `send-push-notification`)로 구현.
- `twa/twa-manifest.json` 초안: packageId com.gearforest.app, host gear-forest.com, startUrl `/index.html`, orientation portrait, enableNotifications true, minSdk 23.

### 핵심 주장
1. **Bubblewrap 환경 자체관리** — Bubblewrap은 첫 실행 시 자체 JDK17+Android SDK를 `~/.bubblewrap`에 내려받음. README의 `brew install temurin@17`은 **불필요할 수 있음**(검증). `bubblewrap doctor`로 확인.
2. **푸시 = Notification Delegation** — TWA는 내부적으로 Chrome 엔진 사용 → 기존 웹푸시(VAPID/SW)가 **그대로 동작**. `enableNotifications:true`가 `POST_NOTIFICATIONS` 권한(Android 13+) + 알림 위임을 추가. **FCM 네이티브 불필요**. 단 Android 13+ 런타임 권한 프롬프트 흐름 확인 필요.
3. **🚨 targetSdk Play 게이트** — Play는 2024년 신규앱 **targetSdk 34+**, 2025년 **35+** 요구. Bubblewrap 기본 targetSdk가 현재 Play 기준 충족하는지 = 출시 차단 가능 항목(검증 필수).
4. **쿠팡 외부링크** — coupang.com은 scope 밖 → TWA가 **인앱 Custom Tab**으로 열어 어필리에이트 리다이렉트/추적 유지(수익화 직결). 별도 설정 불필요할 것(검증).
5. **A1 정합성** — startUrl `/index.html`→`/`, manifest `id` 추가, orientation `portrait-primary`→`portrait`를 twa-manifest/원본 manifest와 일치시켜야. 현재 초안 orientation은 portrait로 이미 완화됨, startUrl은 아직 /index.html(정정 대상).
6. **아이콘/스플래시** — Bubblewrap이 512 아이콘에서 적응형 런처+스플래시 자동생성. 스플래시색=backgroundColor #fff. 모노크롬(테마 아이콘, A13+)·알림 아이콘 별도 필요한지 검증.
7. **navigationColor 초안 `#000000`** — 라이트테마(녹/백)와 부조화 가능. 하단 시스템바 색 재검토.

### → A4/VERIFY로 넘길 질문 (sonnet)
- Bubblewrap이 JDK/Android SDK를 자체 프로비저닝하는가(brew 불필요)? `bubblewrap doctor` 동작?
- TWA 웹푸시: enableNotifications+기존 VAPID로 FCM 없이 동작하나? 알림 위임 메커니즘·Android13 POST_NOTIFICATIONS 권한 흐름·iOS와 달리 정말 자동인지?
- **Bubblewrap 기본 targetSdkVersion이 현재 Play 신규앱 요구(34/35)를 충족하나?** 미달 시 수동 상향 방법?
- scope밖 쿠팡 링크가 Custom Tab으로 열릴 때 어필리에이트 추적 유지되나? `orientation`/외부도메인 관련 함정?
- 아이콘 요구: 모노크롬/알림 아이콘 필수? 512 splash 화질?
- 놓친 것: Play 16KB 페이지 정렬(2025), AAB targetSdk, androidx.browser 버전, 화면방향 잠금이 태블릿 심사에 영향.

## A4 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0] targetSdk 35 필수(2025.8~), Bubblewrap 기본 미달 가능** — npm 최신 1.24.x가 targetSdk 33일 수 있음(Issue #860 미배포). 35 미달이면 **업로드 거부**. → `bubblewrap build` 후 `app/build.gradle`의 `targetSdkVersion` 확인, 33이면 35로 패치.
- **[P0] JDK 자동설치 아님** — Bubblewrap은 Android SDK 커맨드라인툴만 `~/.bubblewrap`에 자동 다운, **JDK17은 수동**(Adoptium/temurin). README의 'brew 불필요'는 **틀림** → 필수로 정정.
- **[P1] 알림위임은 자동 아님** — POST_NOTIFICATIONS 권한 다이얼로그는 **TWA 네이티브 앱이** 띄워야(첫 실행 UX 설계 필요). Chrome 부재 기기는 푸시 불가(SW=Chrome 컨텍스트).
- **[P1] notificationclick→Chrome 탭 버그** — Chromium #40118823. 백그라운드 TWA는 `matchAll`에 안 잡혀 `openWindow`로 새 Chrome 탭 열림. sw.js L82 현재 패턴 해당. → `matchAll({type:'window',includeUncontrolled:true})` 후 focus, 없을때만 openWindow. **(앱코드=백로그)**
- **[P1] 모노크롬 알림 아이콘 필요** — 컬러 icon-192를 badge/icon으로 쓰면 알림트레이서 검게 뭉개짐. 흰색-on-투명 별도 제작 → `monochromeIconUrl` + sw.js badge 교체. **(앱코드=백로그)**

**확인됨(타당):** TWA가 Chrome 엔진이라 VAPID/SW 웹푸시 구조 재사용 가능 · 쿠팡 Custom Tab 처리·추적 유지(별도설정 불필요, additionalTrustedOrigins 불요) · orientation portrait/fullScopeUrl 올바름.

**추가 발견:** 16KB 페이지=TWA는 NDK없어 자동준수(차단 아님, 기한 2026.5) · targetSdk 35→edge-to-edge 기본활성(status bar/viewport-fit 확인) · androidbrowserhelper alpha 의존성 경고 가능 · manifest `id:"/"` 추가로 정합.

**→ 반영 액션:** ① README temurin 필수로 정정+targetSdk 35 확인 단계 ② twa-manifest 주석에 targetSdk 확인 경고 ③ 모노크롬 아이콘·notificationclick 수정·Android13 권한 UX = **PWA/앱 개선 백로그**(앱 무수정 원칙) ④ id 필드 = A1 백로그와 통합. [README/twa-manifest 정정 완료 ✅]

---

## A5 — Play Console 출시 절차 · THINK (2026-06-11)

### 핵심 주장
1. **🚨 신규 개인계정 폐쇄테스트 의무(최대 리스크)** — 2023.11.13 이후 생성된 **개인(individual)** 개발자 계정은 프로덕션 출시 전 **폐쇄테스트(closed) 12~20명 테스터가 14일 연속 opt-in** 후 프로덕션 신청 가능. 내부테스트(internal)는 이 의무에서 제외(즉시·100명). → **출시까지 최소 2주+ 지연**, 테스터 12~20명 확보 선결. 조직(organization) 계정은 면제(검증 필요).
2. **계정 등록** — $25 1회. 2023~ **본인확인(정부 신분증) + 연락처 공개** 의무화. 조직은 D-U-N-S 번호 필요.
3. **수익화 설정 불필요** — 어필리에이트는 외부링크·IAP 없음 → 판매자(merchant)/세금/은행 설정 불요. 앱은 무료 배포.
4. **트랙 순서** — internal(즉시·App Signing SHA 확보용) → closed(12~20명·14일) → production(단계적 출시 %). A3 닭달걀: internal 업로드에서 App Signing SHA 받아 assetlinks 먼저 검증.
5. **출시 전 App content 선언 필수** — 개인정보처리방침 URL(privacy.html ✅), 데이터안전성, 광고 포함, 콘텐츠등급(IARC 설문), 타겟연령, 정부앱/금융 여부 등. 미완 시 프로덕션 불가.
6. **🚨 로그인 게이트 — 리뷰어 데모계정** — 소셜기능(로그인 필요 영역)이 있으면 App access에 **테스트 계정/우회법 제공** 필수. 누락 시 "리뷰어가 기능 접근 불가"로 거부.
7. **🚨 UGC 정책** — community.html(게시글·댓글·좋아요)=사용자생성콘텐츠 → Play UGC 정책: **신고 기능·차단·모더레이션·EULA(무관용)** 요구. A6(컴플라이언스)에서 심화.
8. **첫 리뷰 지연** — 신규 계정 첫 앱 리뷰가 수일~1주+로 길어짐(과거 수시간에서 변화).

### → A5/VERIFY로 넘길 질문 (sonnet)
- 2026.6 현재 **신규 개인계정 폐쇄테스트 정확 요건**: 테스터 수(12 vs 20?), 14일 연속, 프로덕션 신청 절차. internal 면제 맞나? 조직계정 면제 맞나?
- 본인확인 요구 디테일(개인=정부ID, 조직=D-U-N-S), 처리시간?
- 어필리에이트 앱에 대한 Play 정책 리스크 — "주로 외부 스토어로 보내는 앱"이 'minimal functionality'나 어필리에이트 정책에 걸리나? 쿠팡 파트너스 고지 요건?
- 로그인 소셜기능 → App access 데모계정 요건, OAuth(소셜로그인)일 때 리뷰어 제공 방법?
- IARC 콘텐츠등급: 쇼핑+UGC 커뮤니티 조합의 등급/설문 포인트?
- 놓친 것: 단계적 출시 운영, 출시국가, 앱 번들 explorer, pre-launch report(자동 테스트), 가족정책, 휴면계정 정책.

## A5 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0] 🔴 Webviews & Affiliate Spam 정책(answer/9899034) — A5 최대 누락** — "주 목적이 외부사이트 어필리에이트 트래픽 유도"인 앱 **명문 금지**. 쇼핑 어필리에이트 앱 거부/정지 사례 다수. 이 앱(스펙DB→쿠팡)은 직격. → 심사 서술에서 **스펙DB·커뮤니티·찜=주 기능**, 쿠팡=조회결과의 부수 CTA로 포지셔닝 필수.
- **[P0] 테스터 수 정정** — "12~20" 부정확. 2023.11=20명 → **2024.12.11부터 12명**(14일 연속 opt-in). 현재=12명 단일 수치.
- **[P1] 조직계정 면제 = 공식 미명문** — 3rd-party는 면제라 하나 Help Center에 명문 없음. "(불확실)" → "전환 전 Play Console 직접 확인".
- **[P1] 본인확인 타임라인** — 전세계 개발자 신원확인 의무화는 2026.09 일부국가 시작, 한국은 2027+. 현재 한국 개인은 미강제(자발 제출 가능).
- **[P1] OAuth 데모계정 구체화** — 리뷰어용 전용 구글계정(이메일+비번) 생성·**2FA 비활성화**·App access 등록. 미제공=자동거부. Supabase 소셜로그인으로 정상동작 사전테스트.

**확인됨(타당):** 14일 연속 opt-in · internal 면제 · 트랙구조 · App content 항목 · UGC 신고/차단/모더레이션/EULA mandatory · 첫리뷰 7일±.

**추가 발견:** (R1) 휴면계정 1년 삭제($25 환불X) (R3) IARC UGC설문 Yes 누락 시 "허위표시"로 앱삭제 (R6) 패키지명 변경불가=초기확정 (R7) 데이터안전성에 쿠팡 AF추적 URL=공유데이터 명기, Google ML이 선언불일치 자동감지 (R5) 단계출시 5~10%부터.

**→ 반영 액션:** ① 설계서 §8에 Affiliate-Spam P0 + 포지셔닝 전략 추가 ② 테스터 12명·14일 정정(§6) ③ UGC 4종 출시전 체크리스트 ④ OAuth 데모계정 절차 ⑤ 데이터안전성에 쿠팡 추적 명기 — ②~⑤는 A6(컴플라이언스)에서 통합 정리. [설계서 §8 반영 완료 ✅]

---

## A6 — 등록정보 & 정책 컴플라이언스 · THINK (2026-06-11)

### 확인된 사실(코드 실태)
- **privacy.html에 쿠팡/어필리에이트 언급 0건** (닉네임·이메일·제3자·Supabase는 있음). → 어필리에이트·추적 고지 누락.
- community: **신고(report)·차단(block)·삭제 UI 실제 존재** ✅. 단 EULA/약관 링크는 grep 0 → 미비 추정.
- **delete-account 엣지함수 존재** ✅ (계정삭제 지원). 이미지 업로드(005_post_images)=UGC 이미지 존재.

### 핵심 주장
1. **🚨 CSAE(아동안전) 표준 정책** — 2024~ UGC+이미지 업로드 앱은 **CSAE 방지 표준 공개 + 인앱 신고 + 공개 연락처** 의무. 누락 시 거부. 자주 놓치는 신규 게이트(검증).
2. **데이터 안전성 폼** — 수집: 이메일·닉네임·UGC(글/댓글/이미지)·푸시토큰 + **쿠팡 AF추적 URL=제3자 공유**. 전송중 암호화·삭제요청 경로 명시.
3. **🚨 privacy.html 보강 필요** — 쿠팡 파트너스 어필리에이트·추적 파라미터·제3자(쿠팡) 데이터 흐름 명시 누락. 한국 PIPA + Play 데이터안전성 정합 필요. (앱코드=수정대상이라 *액션 플래그*, 자동수정 금지)
4. **계정삭제 — 웹 URL 필수** — Play(2024~)는 인앱 삭제 + **앱 밖 웹에서 접근 가능한 삭제 요청 URL**도 요구. delete-account 함수는 있으나 공개 웹 삭제 경로 URL을 Play Console에 제출해야(account.html 경로 확인).
5. **어필리에이트 고지(이중)** — Play 정책 + **한국 표시광고법/추천보증 심사지침**: 어필리에이트는 "광고"·"수수료 받음" 명시 의무. 앱 설명 + 링크 근처 고지.
6. **콘텐츠 등급(IARC)** — 쇼핑+UGC 상호작용 → "사용자 콘텐츠 공유/소통 Yes" → Teen급 가능. 정직히 답해야(허위=삭제).
7. **"광고 포함" 선언** — 어필리에이트 CTA는 광고SDK 아니라 'contains ads'=No일 가능성. 단 데이터안전성/설명 고지는 별개(검증).
8. **스토어 등록물** — 아이콘512·피처그래픽1024×500·폰스크린샷2+·짧은설명80·전체설명·카테고리 Shopping·연락이메일(bangsungju@gmail.com)·privacy URL.
9. **이미지 업로드 권한** — UGC 이미지=사진/저장소 접근 → 권한 선언 + 데이터안전성 반영.

### → A6/VERIFY로 넘길 질문 (sonnet)
- **CSAE 아동안전 표준 정책** 2026 적용범위 — UGC 앱 전부? 공개문서+신고+연락처 정확 요건? 한국앱 해당?
- 계정삭제 **웹 URL 요건** 정확(인앱+웹 둘 다? URL을 어디 제출?).
- 어필리에이트 고지 — Play + 한국 공정위 추천보증지침 구체 문구·위치 요건?
- privacy.html에 반드시 추가해야 할 항목(쿠팡 제3자·추적·푸시)?
- IARC 쇼핑+UGC 등급 결과·설문 함정?
- 'contains ads' 선언: 어필리에이트 링크는 광고인가 아닌가(Play 정의)?
- 놓친 것: 한국어 현지화, 민감권한 선언, 타겟연령(아동 비대상), Families 정책 회피, 데이터안전성 SDK 자동스캔.

## A6 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0 정정] CSAE 선언폼 = Social/Dating 카테고리 한정** — Shopping 등록 시 선언폼 대상 아님. 단 UGC Policy(약관 공개+CSAE 금지조항+신고)는 카테고리 무관 필수. 내가 둘을 뭉뚱그린 오류.
- **[P0] 🔴 계정삭제 UI 실재 안 함** — delete-account 엣지함수·RPC는 있으나 account.html에 **삭제 버튼 없음**. privacy.html은 "계정 삭제 링크" 안내 = 모순. "함수 존재=구현"이라 가정한 내 검증 결함. → 인앱 삭제 버튼 + Play Console 웹 삭제 URL 둘 다 필요.
- **[P0] 🔴 Supabase 국외이전 고지 누락(PIPA 28조의8)** — 미국 이전 국가·항목·목적·기간·거부방법 고지 의무. privacy.html 5조는 "수탁"만 표기. 데이터안전성보다 우선 한국법.
- **[P1] terms.html 부재 + UGC 게시 전 약관동의 플로 없음** — Play UGC Policy 직접 요건. CSAE 금지조항 포함 약관 신설 필요.
- **[P1] privacy.html 카카오 오기재** — 실제 코드는 `signInWithOAuth('google')` 단독. 카카오 버튼 없음 → 데이터안전성 정합 위해 삭제.
- **[P1] 어필리에이트 고지 위치** — 쿠팡 CTA **바로 옆 상시표시**(2024.12 개정: 더보기 안쪽·게시물 끝 부적격). privacy.html 추가만으론 불충분.
- **[P1] TWA 이미지권한 정정** — TWA는 `<input type=file>` 브라우저 picker → 네이티브 READ_MEDIA_IMAGES 선언 불요. 단 데이터안전성 "Photos and videos"는 선언.
- **[P2] 쿠팡 추적 URL = '데이터공유' 경계 불명** — 단순 외부링크 열기는 앱의 제3자 전송 아님. Play 데이터공유 의무는 모호. 핵심은 공정위 고지.
- **[P2] 'contains ads' No 선언 시 misleading 리스크** 언급 필요. / 스토어 설명에 '쿠팡' 상표 삽입 주의.

**확인됨(타당):** 데이터안전성 항목 · 공정위 이중고지(2024.12.01 시행) · IARC Teen 가능 · 스토어 자산.

**→ 반영 액션(대부분 앱코드/법무=플래그):** ① 카테고리 Shopping 등록(CSAE 폼 회피)+UGC 약관/신고 유지 ② **계정삭제 인앱 UI 신설**+웹 삭제 URL ③ **privacy.html 국외이전 고지 추가** ④ terms.html 신설+UGC 동의 ⑤ privacy 카카오 삭제 ⑥ 쿠팡 고지 CTA 옆 상시 — 전부 출시 전 필수. **A7 후 통합 런치 체크리스트로 정리.**

---

## A7 — iOS 2차 & 배포 자동화 · THINK (2026-06-11)

### 핵심 주장
1. **iOS는 TWA 불가 → Capacitor(WKWebView) 래핑** — Bubblewrap은 Android 전용. iOS는 Capacitor가 현실적(네이티브 플러그인 추가로 4.2 회피).
2. **🚨 iOS 웹푸시 단절** — iOS 16.4+ 웹푸시는 **Safari A2HS(홈화면 PWA)에서만** 동작. **WKWebView 래퍼 안에서는 웹푸시(VAPID/SW) 미작동**. → Capacitor iOS는 기존 Supabase VAPID 푸시를 **그대로 못 씀**, 네이티브 APNs(Capacitor Push 플러그인) 별도 구축 필요. Android와 푸시 경로 갈림(중대 작업량).
3. **🚨 Apple 4.8 — Sign in with Apple 강제** — 제3자 소셜로그인(구글)을 제공하면 **Sign in with Apple도 제공 의무**. 현재 구글 단독 → iOS 출시 시 Apple 로그인 추가 필요.
4. **Apple 4.2 minimal functionality** — 단순 웹뷰는 거부 잦음. Capacitor로 네이티브 푸시·공유·햅틱 등 1~2개 얹어 "앱다움" 확보.
5. **비용/환경** — Apple Developer $99/년, Xcode 빌드용 Mac 필요(Mac mini 활용 가능).
6. **배포 자동화(Android) — 유지보수 이중화의 핵심 이점**: TWA는 **콘텐츠 변경 시 앱 재빌드 불필요**(웹이 곧 앱). AAB 재빌드는 ① targetSdk 연례 상향 ② appVersionCode/아이콘/패키지 변경 시에만. → 평상시 유지보수는 기존 web 배포(git→mini)만으로 끝. **이게 TWA 채택의 최대 운영 이점.**
7. **AAB 업로드 자동화** — `fastlane supply` 또는 Play Developer API로 AAB 업로드 자동화 가능(keystore=CI secret). 단 재빌드 빈도 낮아 ROI 낮음 — 수동도 무방.
8. **가용성 모니터링** — 앱이 gear-forest.com만 바라봄 → mini 다운=앱 오프라인(SW 캐시로 부분완화). assetlinks/origin 업타임 모니터(uptimerobot 등) 추가 권장. TWA는 단일 host라 origin failover 어려움(GitHub Pages 폴백 불가, assetlinks 통제 때문).
9. **부가 채널** — 동일 PWA로 삼성 갤럭시 스토어·MS 스토어도 PWABuilder 패키징 가능(저비용 확장).

### → A7/VERIFY로 넘길 질문 (sonnet)
- Capacitor iOS(WKWebView)에서 기존 VAPID/SW 웹푸시가 정말 안 되는가? iOS 16.4+ 웹푸시는 A2HS 한정 맞나? 네이티브 APNs 전환 외 대안?
- Apple 4.8 Sign in with Apple 의무 — 구글 로그인 제공 시 정말 강제? 예외(2024~2025 변화)?
- Apple 4.2 통과 실전 — Capacitor 래퍼가 거부되는 패턴과 통과 요건?
- Android: TWA 재빌드가 정말 콘텐츠 변경엔 불필요한가? 재빌드 트리거 정확 목록? fastlane supply 실태/함정?
- origin SPOF — TWA에 폴백 origin이나 다중 호스트가 가능한가? mini 다운 시 앱 UX?
- 놓친 것: iOS PWA(Safari A2HS, 스토어 없이)를 1차로? Capacitor 유지보수 이중화 비용, Android 15 edge-to-edge, 앱 강제업데이트.

## A7 — VERIFY (sonnet 적대 검증, 2026-06-11)

**반박/수정 (우선순위):**
- **[P0] TWA도 연례 재빌드 강제** — 콘텐츠 변경엔 재빌드 불요 맞으나 **targetSdk 연례 상향(매년 8월말)**은 TWA에도 적용 → 매년 AAB 재빌드/업로드 강제. "유지보수 무비용" 과장.
- **[P0] iOS APNs 공수 명시** — VAPID→APNs 전환 시 Supabase에 **device token 등록 엔드포인트+발송 파이프라인 재설계** 필요. 단순 교체 아님.
- **[P1] Apple 로그인 = 계정삭제 묶음** — 4.8 Sign in with Apple + **5.1.1(v) 계정삭제**(A6와 동일 이슈) 동시 구현.
- **[P1] Cloudflare Tunnel도 SPOF** — mini뿐 아니라 CF Tunnel 장애(2025.6/11 복수)도 앱 오프라인. SW offline fallback `catch` 코드 존재 확인 필요(누락 시 Chrome 에러화면).
- **[P1] iOS A2HS 1차 격하 반박** — A2HS 설치율 <5%, iOS 앱스토어를 2차로 미루는 건 사용자획득상 치명적. Android와 병행 또는 우선순위 재검토.

**확인됨(타당):** iOS TWA불가→Capacitor · WKWebView 웹푸시 미작동 · Apple 4.2 웹뷰거부 패턴 · $99/Mac · fastlane supply(최초1회 수동+서비스계정 JSON) · 삼성 갤럭시스토어 URL 등록.

**추가 발견:** Capacitor `ios/` 네이티브 유지비=하이브리드 수준 · Play Integrity 2025 강화 · Mac mini가 서버+터널+빌드 겸용 시 부하 SPOF(빌드는 GH Actions macOS runner 분리 검토).

**→ 반영:** 통합 런치 체크리스트(APP-HOSTING.md §11)에 전부 흡수.

---

# 🏁 루프 종료 (2026-06-11)
- 7개 영역 × (THINK+VERIFY) = 14 페이즈 완료. 매 영역 sonnet 적대검증.
- 누적 발견: 설계 결함·정책 게이트 다수(P0 중심). 내 초안의 오류도 다수 정정됨(admin off/reload, affiliate-spam 누락, 계정삭제 UI 가정, CSAE 범위 과장, 푸시 단절).
- 산출물 갱신: APP-HOSTING.md(§2/§3/§8/§11), twa/README.md, twa/twa-manifest.json, twa/.gitignore.
