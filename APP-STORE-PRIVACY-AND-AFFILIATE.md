# 앱스토어 개인정보 라벨 + 제휴 적합성 (B-3 · B-5)

> 코드/라이브 감사(2026-06-13) 기반. 스토어 콘솔에 **그대로 입력**할 답안.
> 상위: [APP-STORE-TEST-CASES.md](APP-STORE-TEST-CASES.md) B-3·B-5

---

## B-3 — 쿠팡 파트너스 제휴 링크 적합성

| 항목 | 결과 | 근거 |
|---|---|---|
| 제휴 수익 고지 | ✅ | ① 전 페이지 푸터(app.js 전역) ② 구매 버튼 위 `pmbuynote`("이 링크는 쿠팡 파트너스…수수료") ③ terms §5 |
| 외부 링크 오픈 방식 | ✅(웹) / ⚠️(네이티브) | `window.open(url, "_blank", "noopener")` — 웹은 새 탭(시스템 브라우저 맥락). **Capacitor에선 외부 URL을 시스템 브라우저로 열도록 설정 필요**(아래) |
| 기만적 링크 없음 | ✅ | 표시가=`price_min`(최저가) + "최저가 기준" 캡션, 도달지=쿠팡 정식 링크 |
| 죽은 링크 | 🟡 | 링크는 데이터 파이프라인이 공식 생성기/API로 관리(메모리 [[coupang-partners-monetization]]). 주기적 유효성 점검 권장(범위 외) |

**네이티브(Capacitor) 보완 — 셸 만들 때:**
- 외부 도메인(쿠팡 등) 링크는 인앱 WebView가 아니라 **시스템 브라우저/SafariViewController**로 열기. Capacitor 기본 `allowNavigation`에 외부 도메인 미포함 + `_blank`는 OS가 처리하거나 `@capacitor/browser`로 명시 오픈.
- 이유: 인앱 WebView 안에서 결제 페이지를 띄우면 Apple이 결제/UX 문제로 지적할 수 있음.

---

## B-5 — 개인정보 라벨 / 데이터 안전 신고

### 사실관계 (감사 결과)
- **3rd-party 추적/광고 SDK: 0개** (GA·gtag·픽셀·Sentry 등 없음).
- 백엔드: Supabase(처리자), 인증: Google OAuth, CDN: jsdelivr, 외부 이동: 쿠팡(제휴 링크 — 우리 사용자 데이터 전송 없음, 단순 내비게이션).
- 전송 암호화: HTTPS 전수. 계정·데이터 삭제: 앱 내 회원탈퇴 경로 있음(B-4, `delete-account`).

### 수집 데이터 인벤토리

| 데이터 | 어디서 | 신원 연결 | 용도 |
|---|---|---|---|
| 이메일 | Supabase 인증(Google) | 연결됨 | 계정/로그인 |
| 이름·아바타 | Google 프로필 → `profiles`(닉네임·avatar_url) | 연결됨 | 프로필 표시 |
| 사용자 ID | Supabase uid | 연결됨 | 계정 |
| 리뷰·사진 | `reviews`(rating·body·image_urls) | 연결됨 | 사용자 콘텐츠 |
| 찜·기어세트 | `wishlists`·`gear_sets` | 연결됨 | 앱 기능(동기화) |
| 커뮤니티 글·댓글 | `posts`·`comments`(현재 비활성) | 연결됨 | 사용자 콘텐츠 |
| 푸시 토큰 | `push_subscriptions`(endpoint) | 연결됨 | 알림 |
| 상품/구매 클릭 | `click_events`(slug·brand·model·coupang_url·**session_id**) | **미연결**(익명 랜덤 sid) | 분석 |

> 수집 안 함: 위치, 금융정보, 연락처, 검색기록(검색은 클라 로컬), 건강, 정밀 진단/크래시.

### Apple — App Privacy (Nutrition Label) 입력값
**Tracking 사용: 아니오** (제3자 광고 데이터와 결합 없음 → ATT 프롬프트 불필요. 제휴 링크는 사용자 식별정보를 전송하지 않음.)

| 데이터 타입 | 수집 | 연결 | 추적 | 목적 |
|---|---|---|---|---|
| Contact Info → Email | 예 | 예 | 아니오 | App Functionality |
| User Content (사진·리뷰·글·세트) | 예 | 예 | 아니오 | App Functionality |
| Identifiers → User ID | 예 | 예 | 아니오 | App Functionality |
| Identifiers → Device ID(푸시 endpoint) | 예 | 예 | 아니오 | App Functionality(알림) |
| Usage Data → Product Interaction | 예 | **아니오** | 아니오 | Analytics |

### Google — Data Safety 입력값
- **수집함 / 제3자 공유: 아니오**(Supabase는 처리자, 광고주 공유 없음).
- 전송 중 암호화: **예**. 삭제 요청 가능: **예**(앱 내 탈퇴).

| 카테고리 | 데이터 | 목적 | 필수? |
|---|---|---|---|
| Personal info | 이메일·이름 | 계정 관리 | 필수(로그인 시) |
| Photos | 리뷰/커뮤니티 이미지 | 앱 기능 | 선택 |
| Messages | 리뷰·글·댓글(UGC) | 앱 기능 | 선택 |
| App activity | 상품 상호작용(클릭) | 분석 | 자동·익명 |
| Device/other IDs | 푸시 endpoint | 알림 | 선택(권한 시) |

### 라이브 게시물 (확인됨)
- 개인정보처리방침: `gear-forest.com/privacy.html` — 수집항목·보유기간(탈퇴시)·제3자(Google·Supabase 美이전)·연락처 ✅
- 이용약관: `gear-forest.com/terms.html` ✅
- 스토어 콘솔 입력: 두 URL을 개인정보/지원 URL로.

---

## 남은 작업
- **Apple/Google 콘솔에 위 표 입력** (사용자 — 콘솔 접근).
- 〔네이티브〕 Capacitor 외부링크 시스템 브라우저 오픈 설정(B-3).
- 〔선택〕 쿠팡 링크 주기적 유효성 점검 잡.
