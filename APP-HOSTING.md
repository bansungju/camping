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

현재 웹은 두 경로로 떠 있다:
- `bansungju.github.io/camping/` — **서브패스**. origin 통제 불가, 루트에 `.well-known` 못 올림 → **TWA 부적합**
- `gear-forest.com` (Cloudflare Tunnel → Caddy :8080 → `site/`) — **루트 도메인, 통제 가능** → ✅ TWA origin

→ **결정: 앱은 `https://gear-forest.com` 을 가리킨다.** manifest의 `start_url:"./index.html"`, `scope:"./"` 는 루트에서 서빙되므로 그대로 유효.

선행 확인 2가지:
- [ ] `https://gear-forest.com/` 가 Cloudflare Tunnel로 실제 서빙되는지 (tunnel ingress 매핑 확인)
- [ ] Lighthouse PWA "installable" 통과 (Chrome DevTools > Lighthouse)

---

## 3. 🚨 인프라 선결 과제 — `assetlinks.json` 403 차단

**발견:** `Caddyfile` 의 메인 `handle{}` 블록이 `file_server { hide .* }` 라서
`.well-known` 디렉터리(앞이 `.`)가 **숨겨져 403/404** 가 난다.
→ TWA 도메인 검증이 **영구 실패**한다. 반드시 먼저 고쳐야 한다.

**제안 패치** (적용은 사용자 승인 후 — 여기서는 설계만):

```caddyfile
# handle /data/* 블록 위에 추가
handle /.well-known/* {
    root * /Users/mimi/camping/site
    file_server          # hide .* 없음 → .well-known 노출
    header Content-Type application/json
    header Cache-Control "public, max-age=300"
}
```

배치 위치: `@dbfile` 차단 다음, 일반 `handle{}` 보다 **위**(더 구체적 경로 우선).
검증: `curl -I https://gear-forest.com/.well-known/assetlinks.json` → `200 application/json`.

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
| "minimal functionality(웹뷰 껍데기)" 거부 | TWA는 Google 공식 포맷 + 실제 PWA(오프라인 sw.js·푸시·설치형) → 단순 웹뷰 아님을 충족 |
| 어필리에이트 미고지 | 앱 설명·앱 내 고지 양쪽 명시 |
| 데이터 안전성 누락 | Supabase 수집 항목 정확히 신고 |
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
