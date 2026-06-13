# 모바일 앱 — 브릿지/백엔드 보완 계획 (companion to MOBILE-APP-PLAN.md)

> 작성: 2026-06-13 / **계획만 — 구현은 셸 단계에서**
> 관계: [MOBILE-APP-PLAN.md](MOBILE-APP-PLAN.md)(Xcode 세션 소유, Phase 0~5)를 **중복 없이 보완**.
> 경계: 그 문서 = 네이티브 셸·Xcode·딥링크·빌드·제출. **이 문서 = 그 phase들이 의존하지만 빠진 백엔드/웹 글루 + 스토어 콘텐츠 + 미해결 설계결정.**
> 진행: Xcode 세션 Phase 2 완료(인증 딥링크), Phase 3(Apple) 다음.

---

## 소유 경계 (충돌 방지)

| 영역 | 소유 | 비고 |
|---|---|---|
| Capacitor 셸·ios/·android·capacitor.config | **MOBILE-APP-PLAN(그 세션)** | 손대지 않음 |
| 딥링크/OAuth 콜백·AppDelegate·Manifest | **그 세션** (Phase 2 ✅) | 손대지 않음 |
| 상태바·스플래시·빌드·심사 제출 | **그 세션** (Phase 4·5) | 손대지 않음 |
| 백엔드(Supabase 함수·테이블)·가격알림 파이프라인 | **이 문서/기존 작업** | 이미 배포됨 |
| 스토어 개인정보 라벨/제휴 적합성 콘텐츠 | **이 문서** | 산출 완료 |
| `account.html`·`supabaseClient.js` (Apple 버튼/푸시 배선) | **공유 — 락·조율 필요** | 아래 C1·C2 |

---

## 발견된 공백 (그 계획에 없음) — 우선순위순

### G1. 🔴 네이티브 푸시 — Web Push가 iOS 앱에서 안 됨 (B-1 직결)
- **문제:** 내가 만든 B-1 가격알림은 **Web Push(VAPID/Service Worker)** 기반. iOS WKWebView(Capacitor)는 **Web Push API·SW push 미지원** → 앱 안에서 푸시가 안 온다. (게다가 MOBILE-APP-PLAN Phase 4-4가 앱 내 SW를 끈다 → Web Push 경로 완전 차단.)
- **결정 필요:** 네이티브 푸시 전송 경로.
  - (a) **FCM 단일화** — `@capacitor/push-notifications` + Firebase. iOS=APNs, Android=FCM 토큰을 FCM이 통합. `push_subscriptions`에 native 토큰 타입 칼럼 추가 + `send-price-alert`에 FCM 전송 분기. 웹은 기존 Web Push 유지(이중 경로).
  - (b) **OneSignal 등 서드파티** — 빠르지만 의존성·개인정보 라벨 영향.
- **백엔드 영향(내 몫):** `send-price-alert`/`push_subscriptions` 확장(웹 endpoint vs native token 구분). detect_price_drops는 그대로.
- **매핑:** 그 계획 Phase 4 옆에 "Phase 4-5 네이티브 푸시" 신설 권장.

### G2. 🟠 외부(쿠팡) 링크 = 시스템 브라우저 (B-3)
- 그 계획은 OAuth용 `@capacitor/browser`만 다룸. **상품 구매 링크**(`window.open(url,"_blank")`, app.js)는 미언급.
- 앱 WebView에서 `_blank`가 인앱으로 열리면 Apple 지적 소지 → 외부 도메인은 시스템 브라우저로.
- **할 일:** Capacitor 환경 감지 후 구매 링크를 `@capacitor/browser` 또는 OS 핸들러로 오픈. (코드 위치: app.js의 buy 핸들러 — 그 세션의 Phase 2 supabaseClient 분기와 같은 "Capacitor 분기" 패턴 재사용.)

### G3. 🟢 스토어 개인정보 라벨/제휴 — 콘텐츠 제공 (B-5·B-3)
- 그 계획 Phase 5는 "개인정보 URL·연령등급"만. **App Privacy(Apple)·Data Safety(Google) 답안**은 내가 이미 산출 → [APP-STORE-PRIVACY-AND-AFFILIATE.md](APP-STORE-PRIVACY-AND-AFFILIATE.md). Phase 5에서 그대로 콘솔 입력.

### G4. 🟠 Apple 버튼 이원화 — 중복 추가 금지 (B-2, 공유파일 C1)
- 그 계획 Phase 3: account/login에 "Apple 버튼(iOS 전용)" 추가 예정.
- **내가 이미 추가함**: `account.html`에 웹 OAuth Apple 버튼(`APPLE_LOGIN_ENABLED=false` 플래그). → **두 번 만들지 말 것.**
- **합의안:** 버튼은 1개 유지하되 **환경 분기**: `Capacitor.isNativePlatform()`이면 네이티브 `@capacitor-community/apple-sign-in`, 아니면 기존 웹 `signInWithOAuth('apple')`. 플래그는 "Apple provider 설정 완료" 게이트로 계속 활용.

### G5. 🟢 SW 비활성 ↔ 오프라인 값어치 충돌 (Apple 4.3)
- Phase 4-4가 앱 내 SW를 끔 → **오프라인 탐색**(B-1에서 들었던 4.3 방어 자산)이 앱에선 사라짐.
- → 앱의 4.3 "네이티브 값어치"는 **네이티브 푸시(G1)로 단일화**해야 함. 셸 안에선 오프라인이 아니라 푸시가 값어치. (인지만 하면 됨, 별도 작업 X.)

### G6. 🟢 재방문자 캐시버스트 (웹 한정)
- B-1 CORE 커밋(찜→구독 트리거)이 app.js 단독 커밋이라 웹 재방문자는 다음 stamp_version 사이클에 반영. 앱은 SW 꺼서 무관. **웹만 해당 — 다음 run_all에서 자가치유.**

---

## 공유 파일 조율 (collision 방지)

| 파일 | 누가 언제 | 규칙 |
|---|---|---|
| C1 `site/account.html` | 그 세션 Phase 3(Apple) ↔ 내 B-2 버튼 | G4 합의안으로 **1개 버튼 환경분기**. 편집 전 서로 알림. (SOCIAL 레인) |
| C2 `site/supabaseClient.js` | 그 세션 Phase 2/3 ↔ 내 푸시(G1) | signInWith*는 그 세션, push 토큰 저장은 나. 함수 단위로 분리. (SOCIAL 레인) |
| C3 `capacitor.config.*`·`ios/`·`android/` | 그 세션 전담 | **나는 안 건드림.** |

> `site/app.js`는 CORE 핫파일 — G2(구매링크 분기) 구현 시 `.claude/locks/app.js.lock` + `LANE_SESSION` 필수(pre-commit 강제됨).

---

## 구현 상태 (2026-06-13 — 세션 단독 인계 후 코드 전부 완료)
1. ✅ **G1 네이티브 푸시** — APNs 직접 방식 채택(iOS 우선, Firebase 불요). 코드 완료:
   - migration 025: `push_subscriptions`에 platform·native_token (배포는 사용자가 SQL 실행)
   - `supabaseClient.js`: savePushToken·registerNativePush(@capacitor/push-notifications)
   - `app.js`: 찜 시 앱=registerNativePush / 웹=Web Push 분기
   - `send-price-alert`: platform 분기(web=Web Push, ios=APNs ES256 JWT/HTTP2) — **재배포 완료**, env 미설정이라 네이티브 분기 무동작(웹 무회귀 스모크 확인)
2. ✅ **G2 외부링크** — `openExternal()` 앱=@capacitor/browser / 웹=window.open. 구매링크 2곳 교체.
3. ✅ **G4 Apple 버튼** — 그 세션 Phase 3이 내 플래그버튼을 환경분기로 통합(중복 없음, 확인).
4. ✅ **G3 라벨** — APP-STORE-PRIVACY-AND-AFFILIATE.md 완료.

## 사용자/네이티브 세션이 해야 (물리적으로 내 환경 밖)
- **네이티브 플러그인 설치+동기화**: `npm i @capacitor/push-notifications @capacitor/browser @capacitor-community/apple-sign-in` → `npx cap sync` → Xcode Capabilities(Push Notifications·Sign in with Apple) 체크. (안 하면 위 JS 네이티브 호출이 no-op)
- **APNs 설정(G1 활성화)**: Apple Developer에서 APNs Auth Key(.p8) 발급 → Supabase secrets `APNS_KEY_ID·APNS_TEAM_ID·APNS_P8·APNS_BUNDLE_ID(com.gearforest.app)·APNS_PRODUCTION` → `supabase functions deploy send-price-alert` 재배포 → 실기기 검증.
- **파이프라인 발송 env**: run_all 환경에 `SEND_PRICE_ALERT_URL`+`ALERT_SECRET`(B-1).
- **Apple provider(Phase 3)·빌드·심사(Phase 5)** = MOBILE-APP-PLAN 그 세션.
