# 앱호스팅 설계서 — PWA → Play 스토어 (TWA)

> 기준일 2026-06-11 · 전제: 웹호스팅 라이브 완료 · 목표: **기존 PWA를 건드리지 않고** Android 앱으로 래핑해 Play 스토어 출시
> 1차 타겟: **Android (TWA)**. iOS는 별도 단계(후술).

---

## 0. 한 줄 요약

이미 완성된 PWA(`manifest` + `sw.js` + 웹푸시)를 **Trusted Web Activity(TWA)** 로 감싼다.
TWA는 "주소창 없는 전체화면으로 내 웹사이트를 띄우는 Android 앱 껍데기"다. 앱 코드는 0줄, **웹을 그대로 재사용**한다.
성공 조건은 단 하나 — **도메인 소유 검증(Digital Asset Links)** 이 통과하면 주소창이 사라지고 "진짜 앱"이 된다.

```
[Play 스토어 앱(.aab)]  --연다-->  gear-forest.com (기존 PWA, 그대로)
        │                                  ▲
        └── assetlinks.json 으로 도메인 소유 증명 ─┘  (이게 핵심)
```

---

## 1. 왜 TWA인가 (대안 비교)

| 방식 | 작업량 | 심사 리스크 | 추천 |
|---|---|---|---|
| **TWA (Bubblewrap)** | 소 | **낮음** (Google 공식 지원) | ✅ 채택 |
| 단순 WebView 래퍼 | 소 | 높음 (정책 4.x "minimal functionality" 거부) | ✗ |
| Capacitor/Cordova | 중 | 중 | iOS 갈 때 재검토 |
| Flutter/RN 네이티브 재작성 | 대 | — | 보류(현 단계 오버스펙) |

TWA는 웹이 곧 앱이라 **유지보수 이중화가 없다**(웹 배포하면 앱도 자동 최신). 쿠팡 수익화·소셜 기능 전부 웹 그대로 동작.

---

## 2. 정식 origin 결정 — **gear-forest.com 루트** (중요)

> ⚠️ **2026-06-11 베이스라인 실측 정정**: 설계 초안은 gear-forest.com이 Cloudflare Tunnel→Caddy(mini)로 서빙된다고 가정했으나 **틀렸다.** 실측:
> - `curl https://gear-forest.com/` → `Server: GitHub.com`, DNS `185.199.108-111.153`(GitHub Pages IP, Cloudflare 미경유)
> - `/api/health` → 404 (FastAPI 백엔드는 이 도메인에 없음 — 앱은 Supabase 직결)
> - 배포: GitHub Actions(`upload-pages-artifact: site/`), `site/CNAME = gear-forest.com`
> ⇒ **gear-forest.com = GitHub Pages.** mini의 Caddy/Cloudflare는 이 도메인을 서빙하지 않음(별도/레거시). A2의 Caddy·CF 인프라 분석은 이 도메인엔 **무효** — 아래 §3은 GitHub Pages 기준으로 정정됨.

현재 웹:
- `bansungju.github.io/camping/` — **서브패스**. origin 통제 불가 → TWA 부적합(웹용으로만 유지)
- `gear-forest.com` (**GitHub Pages**, 루트 도메인, `site/CNAME`로 통제) → ✅ **TWA origin**

→ **결정: 앱은 `https://gear-forest.com` 을 가리킨다.** manifest의 `start_url`·`scope:"./"` 는 루트 서빙이라 유효(✅ 실측 200).

선행 확인:
- [x] `https://gear-forest.com/` 루트 200, `manifest.webmanifest` 200 — **확인됨**
- [ ] Lighthouse PWA "installable" 통과 (Chrome DevTools > Lighthouse)

---

## 3. assetlinks.json 배포 — GitHub Pages 기준 (실측 정정본)

**실측 결과 origin이 GitHub Pages이므로 §2 초안의 Caddy 패치는 폐기.** 훨씬 단순하다.

**현재 상태:** `curl https://gear-forest.com/.well-known/assetlinks.json` → **404**(파일 미존재). 리다이렉트 없음(`http`도 404, 301 아님 — 검증기 친화적). robots.txt·sitemap.xml은 200이라 Pages 정적서빙 정상.

**할 일 (단 2개 파일 커밋):**
1. `site/.well-known/assetlinks.json` 생성(§4의 SHA-256 채워) → Actions 배포 → Pages가 서빙.
2. `site/.nojekyll` 추가 — **안전장치**. Actions 아티팩트 배포는 Jekyll을 안 돌리지만, `.well-known`(점 디렉터리) 서빙을 확실히 하려면 `.nojekyll` 권장(무해).

**GitHub Pages가 자동 충족하는 것(=Caddy/CF 작업 전부 불필요):**
- ✅ `.json` → `application/json` 자동 / ✅ 유효 HTTPS(GitHub 인증서) / ✅ 리다이렉트 없음
- ✅ Cloudflare 미경유 → Bot Fight/Always-HTTPS/Access 이슈 **해당 없음**
- ✅ Fastly CDN → mini·Cloudflare Tunnel **SPOF 없음**

**검증:** 커밋·배포 후 `curl -I https://gear-forest.com/.well-known/assetlinks.json` → `200`, `application/json`. 안 되면(Jekyll이 점디렉터리 누락) `.nojekyll` 확인 + `upload-pages-artifact`가 `.well-known`을 아티팩트에 포함하는지 확인.

> ⚠️ 캐시: Pages는 `Cache-Control: max-age=600`(10분)을 줌. 키 회전 시 최대 10분 반영 지연(Caddy no-cache 대비 차이, 실무상 무시 가능).
> 📌 mini의 Caddyfile/Cloudflare 패치는 gear-forest.com엔 불필요. (그 인프라가 다른 호스트를 서빙한다면 별도 사안)

---

## 4. 서명 & Digital Asset Links — 가장 흔한 실패 지점

TWA 검증은 **"앱을 서명한 키의 SHA-256 지문"** 과 도메인의 `assetlinks.json` 을 대조한다.

```
[필수 이해] Play App Signing 사용 시 키가 2개다:
  ① 업로드 키(Upload key)   — 내가 만들어 AAB 서명. 분실해도 재발급 가능
  ② 앱 서명 키(App Signing)  — Google이 보관. 실제 사용자에게 배포되는 서명
  ⇒ assetlinks.json 에는 반드시 ②(App Signing key)의 SHA-256 을 넣는다.
     ①(업로드 키) 지문을 넣으면 설치 후에도 주소창이 안 사라짐 = 검증 실패
```

①의 지문은 로컬 keystore에서, ②의 지문은 **Play Console > 앱 무결성 > 앱 서명** 페이지에서 복사한다.
두 지문을 **모두** `assetlinks.json` 의 `sha256_cert_fingerprints` 배열에 넣어두면 로컬 디버그/배포 양쪽 다 검증된다(권장).

템플릿: `twa/assetlinks.json.template` 참고.

---

## 5. TWA 빌드 구성 — `twa-manifest.json` 초안

도구: **Bubblewrap CLI** (Google 공식). 요건: JDK 17 + Android SDK(cmdline-tools).
빠른 PoC만 원하면 web UI인 **PWABuilder** 로도 동일 산출물 생성 가능(키 관리 자동).

핵심 값(초안 `twa/twa-manifest.json`):

| 키 | 값 | 근거 |
|---|---|---|
| `packageId` | `com.gearforest.app` | 도메인 역순(하이픈 불가 → gearforest) |
| `host` | `gear-forest.com` | §2 |
| `startUrl` | `/index.html` | manifest start_url |
| `name` / `launcherName` | `장비의 숲` | manifest |
| `themeColor` | `#2f7a4e` | manifest theme_color |
| `backgroundColor` | `#ffffff` | manifest background_color |
| `display` | `standalone` | manifest |
| `iconUrl` | `https://gear-forest.com/icon-512.png` | 기존 아이콘 재사용 |
| `maskableIconUrl` | `https://gear-forest.com/icon-maskable-512.png` | 있음 ✅ |
| `enableNotifications` | `true` | 웹푸시 이미 구현됨 |
| `fallbackType` | `customtabs` | 검증 실패 시 graceful |

스플래시/알림 아이콘은 기존 512 아이콘에서 Bubblewrap이 자동 생성.

---

## 6. Play Console 출시 절차 (내부테스트 우선)

1. **개발자 계정** 등록 — $25 1회(영구)
2. 앱 생성 → **내부 테스트(Internal testing)** 트랙부터 (심사 빠름, 본인 기기로 확인)
3. `bubblewrap build` → `app-release-bundle.aab` 업로드
4. **App Signing 자동 활성화** → 거기서 **App Signing key SHA-256 복사**
5. → `assetlinks.json` 에 ④의 지문 채워 `gear-forest.com/.well-known/` 에 배포(§3 선결)
6. **검증**: [Google Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator) 또는 내부테스트 설치 후 **주소창이 사라지면 성공**
7. 스토어 등록정보 작성(§7) → 프로덕션 트랙으로 단계적 출시

---

## 7. 스토어 등록정보 체크리스트

- [ ] 앱 아이콘 512×512, 피처 그래픽 1024×500
- [ ] 스크린샷(폰 2장 이상) — PWA 화면 캡처
- [ ] **개인정보처리방침 URL** — `gear-forest.com/privacy.html` 이미 존재 ✅
- [ ] **데이터 안전성(Data safety)** 섹션 — Supabase 계정/이메일·푸시토큰 수집 명시
- [ ] **쿠팡 어필리에이트 고지** — 앱 설명에 "이 앱은 쿠팡 파트너스 활동의 일환으로 수수료를 받습니다" 명시(정책+법적 의무)
- [ ] 콘텐츠 등급 설문, 타겟 연령, 광고 포함 여부
- [ ] 카테고리: Shopping

---

## 8. 정책 리스크 & 완화

| 리스크 | 완화 |
|---|---|
| **🔴 Webviews & Affiliate Spam(answer/9899034)** — "주 목적=외부 어필리에이트 트래픽 유도" 앱 거부. 쇼핑 어필리에이트 앱 정지 사례 多. **이 앱 최대 리스크.** | 심사 서술·앱 설명에서 **스펙 측정 DB·커뮤니티·찜을 주 기능**으로 전면화, 쿠팡 링크는 조회결과의 부수 CTA로 위치. 측정값 기반 별점 비교라는 고유 가치 강조 |
| **신규 개인계정 폐쇄테스트 의무** — 프로덕션 전 **테스터 12명·14일 연속** opt-in(2024.12.11~) | 출시 2주+ 일정 확보, 테스터 12명 사전 모집(지인·커뮤니티). internal은 면제 |
| **UGC(게시글·댓글)** — 신고·차단·모더레이션·EULA 미비 시 거부 | 출시 전 4종 완비(아래 §7) |
| 로그인 게이트 | 리뷰어용 데모계정(2FA off) App access 등록 |
| "minimal functionality(웹뷰 껍데기)" 거부 | TWA는 Google 공식 포맷 + 실제 PWA(오프라인 sw.js·푸시·설치형) → 단순 웹뷰 아님 |
| 어필리에이트 미고지 | 앱 설명·앱 내 고지 양쪽 명시 + **데이터안전성에 쿠팡 AF추적 URL=공유데이터** 신고(Google ML 자동감지) |
| 데이터 안전성 누락 | Supabase 수집 항목(이메일·푸시토큰·UGC) 정확 신고 |
| targetSdk 미달 | 빌드 후 build.gradle `targetSdkVersion 35` 확인(§5 README) |
| 도메인 검증 실패 | §3 Caddy 패치 + §4 올바른 SHA-256(App Signing key) |

---

## 9. 실행 순서 (의존성 정렬)

```
1. gear-forest.com 루트 서빙·Lighthouse PWA 통과 확인        [선행]
2. Caddy .well-known 서빙 패치 적용 + curl 200 검증            [선행, §3]
3. Bubblewrap 환경(JDK17+AndroidSDK) 구성
4. twa-manifest.json 확정 → bubblewrap init/build → 업로드키 생성
5. Play 개발자 등록 → 내부테스트 앱 생성 → AAB 업로드
6. App Signing SHA-256 확보 → assetlinks.json 배포 → 검증
7. 내부테스트 설치 → 주소창 사라짐 확인(=성공 신호)
8. 스토어 등록정보·데이터안전성·어필리에이트 고지 → 심사 제출
```

병렬 가능: 1~2(인프라)와 7(등록정보 작성)은 독립.

---

## 10. 지금 준비된 산출물 (앱 코드 무수정)

- `APP-HOSTING.md` — 본 설계서
- `twa/twa-manifest.json` — Bubblewrap 입력 초안 (지문/패키지 확정 후 사용)
- `twa/assetlinks.json.template` — 도메인에 올릴 검증 파일 (SHA-256 채우면 완성)
- `twa/README.md` — 빌드 명령 순서 치트시트

> Caddyfile 패치(§3)는 인프라 변경이라 **자동 적용하지 않음** — 승인 시 적용.

---

## 부록 — iOS(2차)

- WebView 래핑은 App Store **4.2(minimal functionality)** 심사가 Android보다 빡빡 → 단순 래퍼는 거부 잦음.
- 권장: 1차 Android 안착 후 **Capacitor** 로 iOS 별도 빌드(네이티브 기능 1~2개 추가해 "앱다움" 확보).
- Apple Developer $99/년 + 빌드용 Mac 필요. 현재 Mac mini 활용 가능.
- ⚠️ **iOS 웹푸시 단절**: WKWebView 래퍼는 기존 VAPID/SW 푸시 미작동 → 네이티브 APNs + Supabase device-token 파이프라인 재설계 필요.
- ⚠️ **Apple 4.8**: 구글 로그인 제공 시 **Sign in with Apple 의무** + **5.1.1(v) 계정삭제** 동시 구현.

---

## 11. 통합 런치 체크리스트 (Think↔Verify 검증 루프 산출, 7영역 × 14페이즈)

> 출처: `APP-HOSTING-LOOP.md`. 각 항목 뒤 [A#]=영역.

### ▶ 실행 진행상황 (2026-06-11, 자동 수행분)
- ✅ 베이스라인 실측 → **origin=GitHub Pages** 확정(P0-4 대폭 단순화)
- ✅ `site/.nojekyll` 생성(`.well-known` 서빙 보장)
- ✅ 툴체인: JDK17 + Bubblewrap CLI 설치(sudo 없이 사용자 로컬)
- ✅ **업로드 keystore + SHA-256 생성**, twa-manifest `fingerprints` 등록, `assetlinks.staged.json` 선조립
- ✅ **P0-2 계정삭제 UI**: account.html 버튼+2단계확인, supabaseClient `deleteAccount()`, edge func **apex CORS 버그 수정**
- ✅ **P0-3 privacy.html 국외이전 고지**(PIPA §28-8, Supabase 미국) + 카카오 오기재 삭제(P1-3) + 허위 "데이터 내보내기" 주장 정정
- ✅ **P1-1 terms.html 신설**(CSAE 무관용·신고/차단·어필리에이트 조항) + community 게시폼 UGC 동의 고지 + 푸터 링크
- ✅ **P1-2 쿠팡 어필리에이트 고지** CTA(구매 버튼) 바로 아래 상시표시(공정위)
- 프리뷰 검증: 전부 통과(콘솔 에러 0), terms.html 렌더 확인
- ⏸️ AAB 빌드 보류(Play 계정 후 1회) · ⏳ 남은 건 PWA 품질 백로그(승인 비차단)
- ⚠️ **배포·재배포는 당신 손**(맨 뒤): `git push`(Pages 자동배포) · `supabase functions deploy delete-account`(CORS 수정 반영) · Play 계정·테스터·제출

### 🔴 P0 — 출시 자체를 막는 항목 (반드시 선결)

| # | 항목 | 비고 |
|---|---|---|
| P0-1 | **Affiliate-Spam 정책 포지셔닝** [A5] | 앱 설명·심사 서술에서 **측정 스펙 DB·커뮤니티·찜=주 기능**, 쿠팡=부수 CTA. "주 목적=어필리에이트 유도" 인상 회피 |
| P0-2 | ✅ **계정삭제 인앱 UI** [A6] | **완료**: account.html 버튼+2단계확인, `deleteAccount()`, edge func apex CORS 수정. 남은 것: 웹 삭제 URL = `gear-forest.com/account.html`(로그인 후 삭제 가능) Play Console 제출 + `supabase functions deploy`(당신) |
| P0-3 | ✅ **privacy.html 국외이전 고지** [A6] | **완료**: Supabase 미국 이전 국가·항목·목적·기간·거부방법(PIPA §28-8). + 허위 '데이터 내보내기' 주장 정정 |
| P0-4 | **assetlinks 경로 200 확보** [A2/A3, 실측정정] | ✅ **origin=GitHub Pages 확정** → Caddy/CF 패치 전부 불필요. `site/.well-known/assetlinks.json` + `site/.nojekyll` 커밋 → 배포 → `curl 200 application/json` 확인. (현재 404 실측) |
| P0-5 | **fingerprint add → generateAssetLinks 순서** [A3] | App Signing SHA를 먼저 등록 안 하면 **빈 assetlinks** 생성(검증 무한실패) |
| P0-6 | **targetSdk 35 확인/패치** [A4] | 빌드 후 `build.gradle` 확인. Bubblewrap 기본 33 가능 → 미달 시 업로드 거부 |
| P0-7 | **신규 개인계정 폐쇄테스트** [A5] | 프로덕션 전 **테스터 12명·14일 연속** opt-in. 일정 2주+·테스터 모집 선결 |

### 🟡 P1 — 거부/하자 위험 (출시 전 권장)

| # | 항목 | 비고 |
|---|---|---|
| P1-1 | ✅ **terms.html + UGC 동의** [A6] | **완료**: CSAE 무관용·신고/차단/어필리에이트 조항, community 게시폼 동의 고지, 푸터 링크 |
| P1-2 | ✅ **쿠팡 고지 CTA 옆 상시** [A6] | **완료**: 구매 버튼 바로 아래 "쿠팡 파트너스…수수료" 상시표시(app.js 모달) |
| P1-3 | ✅ **privacy.html 카카오 삭제** [A6] | **완료**: 구글 단독으로 정정(§1·§4) |
| P1-4 | **OAuth 데모계정** [A5] | 리뷰어용 전용 구글계정(2FA off) App access 등록 |
| P1-5 | **JDK17 수동설치** [A4] | Bubblewrap은 SDK만 자동, JDK 수동(temurin) |
| P1-6 | **assetlinks.json 실제 파일 생성·커밋** [A2/실측] | GitHub Pages라 Caddy reload 불필요. `git push` → Actions 자동배포. (mini deploy 스크립트 reload는 gear-forest.com엔 무관) |
| P1-7 | **데이터안전성 폼 정확 신고** [A6] | 이메일·닉네임·UGC·이미지·푸시토큰 + 쿠팡 AF추적. 전송중 암호화·삭제경로 |
| P1-8 | **콘텐츠등급 IARC** [A6] | 쇼핑+UGC=Teen 가능. 정직 답변(허위=삭제). 카테고리 **Shopping**(CSAE 폼 회피) |

### 🟢 PWA 개선 백로그 (앱 코드 — 출시 후/별도)

- start_url `"/"` + manifest `"id":"/"` [A1] · orientation `portrait` 완화 [A1]
- 모노크롬 알림 아이콘 + sw.js `notificationclick`을 `matchAll(includeUncontrolled)` 후 focus [A4]
- sw.js offline `catch` 폴백 페이지 확인(CF Tunnel/mini 다운 대비) [A7]
- auth-callback.html SW SHELL 캐시 추가 [A1] · screenshots manifest 필드 [A1]

### 🔵 인프라/운영

- github.io는 웹용 유지, **앱만 gear-forest.com** [A1] (SEO 손실 방지)
- launchd `KeepAlive`·기동순서(cloudflared가 Caddy보다 먼저 뜨면 502) [A2]
- **origin SPOF 이중**: mini + Cloudflare Tunnel 둘 다 단일점 [A7] → 업타임 모니터(uptimerobot 등), CF Pages 정적 폴백 검토
- TWA 재빌드는 **연례 targetSdk 상향 + 버전/아이콘/패키지 변경 시에만** [A6/A7] (콘텐츠는 web 배포로 무재빌드 — 최대 운영이점이나 "무비용" 아님)
- AAB 업로드 자동화: `fastlane supply`(최초1회 수동+서비스계정 JSON) [A7]

### 🟣 2차 — iOS & 확장

- Capacitor(WKWebView) + 네이티브 APNs + Sign in with Apple + 계정삭제 [A7]
- 빌드는 GH Actions macOS runner 분리 검토(mini 부하 회피) [A7]
- 삼성 갤럭시스토어 URL 등록(동일 PWA 저비용 확장) [A7]

### 권장 실행 순서 (의존성)
```
선결:  P0-1 포지셔닝 · github.io 병행
인프라: P0-4(Caddy/CF/launchctl) → assetlinks 파일 → curl 200·무리다이렉트
앱(승인): P0-2 계정삭제UI · P0-3 국외이전 · P1-1 terms · P1-2 쿠팡고지 · P1-3 카카오정리
빌드:  JDK17 → bubblewrap init/build → P0-6 targetSdk35 → fingerprint add(P0-5)
Play:  내부테스트 업로드 → App Signing SHA → assetlinks 배포 → 주소창 검증
       → P0-7 폐쇄테스트 12명·14일 → 등록정보/데이터안전성/IARC → 프로덕션
```
