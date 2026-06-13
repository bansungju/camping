# 작업로그 — 앱스토어 출시 준비 (2026-06-13)

> 목표: gear-forest.com을 App Store + Google Play 등재 전 최종 점검 + 블로커 해소.
> 산출 문서: [APP-STORE-READINESS.md](APP-STORE-READINESS.md) · [APP-STORE-TEST-CASES.md](APP-STORE-TEST-CASES.md) · [APP-STORE-PRIVACY-AND-AFFILIATE.md](APP-STORE-PRIVACY-AND-AFFILIATE.md) · [APP-PUSH-PRICE-ALERT-PLAN.md](APP-PUSH-PRICE-ALERT-PLAN.md) · [MOBILE-APP-BRIDGE-PLAN.md](MOBILE-APP-BRIDGE-PLAN.md)

## 1. 점검 체계 수립
- 앱스토어 평가항목 체크리스트(11개 카테고리) + 블로커 B-1~B-5 도출.
- 실행 가능한 세부 테스트케이스(~60개) 작성, 코드/라이브 자동점검 결과 기입.
- 자동점검 PASS: 시크릿스캔·가격이상치·깨진이미지·더미데이터·버전스탬프·제휴고지·개인정보/약관 게시·회사이메일 0.

## 2. 블로커 처리 (B-1~B-5)
- **B-1 가격알림 푸시(네이티브 값어치):** 죽어있던 푸시 인프라 진단 → 실제 VAPID 키 발급·교체(라이브 반영) → 감지기 `detect_price_drops.py`(하락 39건 dry-run) → `send-price-alert` Edge Function + `price_alert_log`(024) → run_all 연결 → 구독 트리거 찜 시점 이전. **네이티브(iOS APNs)**까지 코드완료(아래 5).
- **B-2 Sign in with Apple:** account.html 웹 OAuth 버튼(플래그) → 셸 세션이 환경분기(앱=네이티브/웹) 통합.
- **B-3 쿠팡 제휴:** 고지 3중 확인 + 구매링크 시스템브라우저(openExternal) + 라벨문서.
- **B-4 회원탈퇴:** 코드 완결 확인(delete-account 함수·RPC·30일 쿨다운).
- **B-5 개인정보 라벨:** 데이터 인벤토리 감사(추적SDK 0, click_events 익명) → Apple/Google 라벨 답안 산출.

## 3. 발견·수정 (라이브 결함)
- 이용약관에 통신판매중개자 지위 고지 누락 → terms.html 보완(배포).
- community.html 직접 URL 노출 → "준비중" 정적 페이지로 전환(UGC 모듈 제거, 배포).
- 예제 VAPID 키 사용 중 → 실제 키쌍 교체(배포·라이브 검증).

## 4. 동시세션 충돌 방지 강화
- 핫파일(app.js/style.css/build-item-pages.js) 락을 **pre-commit으로 강제**(LANE_SESSION 소유 검증, ALLOW_NO_LOCK 우회). 추적 훅(pipeline/hooks/pre-commit)·루프 프롬프트·WORK-LANES.md 반영. (메모리 [[frontend-fix-loop-runbook]])

## 5. 모바일 셸 브릿지 (다른 세션 MOBILE-APP-PLAN과 비중복)
- 멈춘 세션 Phase 2~4(딥링크·Apple환경분기·네이티브UX) 인계·검수·푸시.
- **G1 네이티브 푸시(APNs 직접):** mig 025(platform·native_token) + savePushToken·registerNativePush + app.js 분기 + send-price-alert APNs(ES256 JWT/HTTP2) — 재배포·무회귀 검증.
- **G2 외부링크:** openExternal(앱=@capacitor/browser).

## Supabase 배포 완료분 (이 세션 실행)
- 마이그레이션 024 실행됨(사용자), `ALERT_SECRET` 등록, `send-price-alert` 배포(--no-verify-jwt)·E2E 검증(401/200/sent:0).

## 남은 일 = 설정·네이티브·빌드 (코드 아님, 사용자/셸 세션)
1. 마이그레이션 025 SQL 실행
2. 네이티브 플러그인 `npm i` + `npx cap sync` + Xcode Capabilities(Push·Apple)
3. APNs Key(.p8) → Supabase secrets(APNS_*) + send-price-alert 재배포 → 실기기 검증
4. 파이프라인 env(SEND_PRICE_ALERT_URL·ALERT_SECRET)
5. Apple provider(Phase 3)·App Privacy/Data Safety 콘솔 입력(B-5)·스크린샷·심사 제출(Phase 5)

## 주요 커밋 (이 세션, 모두 origin/main 반영)
- de159a87d run_all 가격알림 연결 · dcb72245e 감지기 · 4e42cd400 구독트리거이전 (B-1)
- 4211b868b VAPID 키 교체(타세션 stamp 동반) · 204655af1 Apple 버튼(B-2)
- 45b40f808 B-3/B-5 라벨 · cc90410b6/64d0bf339 브릿지 플랜
- 819b4a285 G2 외부링크 · bf2c15cde/7ff15c793/7ec5b0334 G1 네이티브푸시(A·B-1·B-2)
- (legal/community 보완·핫파일 락 강제 커밋 포함)
