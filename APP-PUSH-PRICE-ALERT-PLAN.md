# 가격 알림 푸시 재배선 설계 (B-1 네이티브 값어치)

> 목적: Web Push 인프라를 **커뮤니티 댓글 알림 → 찜한 상품 가격하락·재입고 알림**으로 재배선.
> 효과: 쇼핑 앱의 진짜 값어치 = Apple 4.3(웹래핑) 방어용 네이티브 기능 + 재방문 유도.
> 상위: [APP-STORE-TEST-CASES.md](APP-STORE-TEST-CASES.md) B-1
> 작성일: 2026-06-13

## 이미 있는 자산 (재사용)

| 자산 | 위치 | 역할 |
|---|---|---|
| 가격 시계열 | `price_observations`(SQLite DB) | 하락/재입고 감지 소스 |
| 워치리스트 | `wishlists`(Supabase, user_id·items jsonb) | "누가 무엇을 원하나" = 알림 대상 |
| 디바이스 구독 | `push_subscriptions`(Supabase) | 전송 엔드포인트 |
| VAPID 키 | env(서버) + app.js(공개키) | ✅ 2026-06-13 정상화 |
| SW 수신/클릭 | `sw.js` push·notificationclick | 알림 표시·이동 |

## 핵심 설계 결정 (기본값 — 변경 가능)

1. **워치리스트 = 찜.** 별도 구독 UI 없이 "찜 = 가격 추적 대상". 찜 항목 `key`로 상품 매칭.
2. **전송 옵트인 = 푸시 권한.** 로그인 사용자가 **처음 찜할 때** 1회 알림 권한 요청("가격 내려가면 알려드릴까요?"). 거부 시 `push-denied` 저장(현행 유지).
3. **하락 임계:** 직전 유효관측가 대비 **≥5% AND ≥1,000원** 하락 (반올림 노이즈 차단). **재입고:** 품절→판매중 전환.
4. **중복 차단:** 동일 상품·동일 사용자에 대해 **하루 1회**, 그리고 가격이 다시 임계 위로 올라갔다 재하락할 때만 재알림(`price_alert_log`).

## 변경 항목 (레인별)

### A. 백엔드 — 신규 Edge Function `send-price-alert` 〔SOCIAL/backend〕
- 입력(서비스롤 또는 공유시크릿 헤더로 호출):
  ```json
  { "events": [ { "key": "<wish item key>", "name": "...", "category": "...",
                  "old_price": 129000, "new_price": 109000, "url": "/item/<cat>/item-N.html",
                  "kind": "drop" } ] }
  ```
- 로직: 각 event의 `key`를 `wishlists.items`에 포함한 user 조회 → 각 user의 `push_subscriptions` 조회 → web push 전송. payload `data.url`=상품 상세.
- 멱등/제한: `price_alert_log`(user_id,key,kind,sent_at) 조회로 하루내 재전송 스킵.

### B. 신규 마이그레이션 `0XX_price_alert_log.sql` 〔SOCIAL/backend〕
```sql
CREATE TABLE IF NOT EXISTS price_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  kind text NOT NULL,                 -- 'drop' | 'restock'
  price_krw int,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pal_user_key ON price_alert_log(user_id, item_key, sent_at);
ALTER TABLE price_alert_log ENABLE ROW LEVEL SECURITY;
-- 서비스롤만 기록·조회(클라이언트 접근 불필요)
```
※ "찜한 상품만 추적"이므로 워치 대상 키 목록은 `wishlists`에서 직접 도출 — 별도 watch 테이블 불필요.

### C. 파이프라인 — 가격 하락 감지 훅 〔DATA〕
- `pipeline/refresh.py`(또는 신규 `pipeline/detect_price_drops.py`): price_observations에서 product별 **직전 vs 최신 유효가** 비교 → 임계 충족 event 수집.
- Supabase REST로 `wishlists`의 **활성 워치 키 집합**을 받아 교집합만 전송(불필요 호출 절감). 키 매핑: 파이프라인 product → 사이트 item key 변환표 필요(아래 미해결 참조).
- 충족 event를 `send-price-alert`에 POST. (run_all 또는 refresh 사이클 끝에서 호출)

### D. 클라이언트 — 구독 트리거 이전 〔CORE: app.js — 핫파일, 잠금 필수〕
- 현행 [app.js:3494](site/app.js:3494) `if (window._commUser …) requestPushSubscription(...)` (커뮤니티 한정) 제거/대체.
- 신규: 로그인 사용자가 **찜 추가 성공 시** 최초 1회 `requestPushSubscription(userId)` 호출 (`_execToggleWish` added 분기). 또는 계정 페이지에 "가격 알림" 토글.

### E. SW — 알림 URL 기본값 수정 〔SOCIAL: sw.js〕
- [sw.js:96](site/sw.js:96) `data?.url || "/community.html"` 폴백을 `"/"`로 변경(커뮤니티 준비중). 실제 URL은 price-alert payload의 `data.url`(상품 상세)이 채움.
- [sw.js:83](site/sw.js:83) 기본 data.url도 `/community.html` → `/`.

## 미해결 / 확인 필요

1. ~~product ↔ item key 매핑~~ **✅ 해결**: 찜 `key` = `wishKey(b,m,cap)` = **`브랜드|모델|인원`** 문자열([app.js:387](site/app.js:387), 예 `"JEEP|코멘드 포스트 L|"`). 사이트·파이프라인이 동일 DB/export 출처라 브랜드·모델 문자열 정확 일치. 파이프라인이 product행에서 동일 규칙으로 `key` 생성 + 해당 `item-N.html` URL을 알고 있으므로 매칭·링크 모두 가능. 찜 item 필드: `{key,b,m,cap,s(슬러그),p(최저가),img}`.
2. **호출 인증 (권장: 공유 시크릿 헤더)**: 파이프라인→`send-price-alert` 호출 시 `X-Alert-Secret`(Edge Function env var와 대조). 서비스롤 키를 파이프라인 환경에 직접 두는 것보다 노출면 작음.
3. **댓글 알림 webhook**: 커뮤니티 준비중 → 기존 comments webhook는 비활성/보존. `send-price-alert`는 **별도 함수로 신설**(기존 `send-push-notification` 보존, 혼선 방지).

## 단계별 실행 (의존순) — 진행 상태 (2026-06-13)

1. ✅ 〔SOCIAL〕 마이그레이션 B(`024_price_alert_log.sql`) + Edge Function A(`send-price-alert`) 작성·커밋·푸시. **사용자 배포 대기**: 마이그레이션 실행 + `functions deploy send-price-alert` + `ALERT_SECRET` 설정.
2. ✅ 〔DATA〕 감지기 `pipeline/detect_price_drops.py` 작성·커밋. key/url 매핑 확정·dry-run 검증(하락 39건). **남음**: refresh/run_all 사이클에 `--send` 연결 + `SEND_PRICE_ALERT_URL`·`ALERT_SECRET` env.
3. ✅ 〔CORE〕 app.js 구독 트리거를 찜 추가 시점으로 이전(락 잡고 단독 커밋). ⚠️ **캐시버스트 미적용** — DATA item churn 때문에 stamp 보류. 다음 CORE 빌드 사이클의 stamp_version에서 ?v= 전파돼야 재방문자 반영.
4. ✅ 〔SOCIAL〕 sw.js 알림 URL `/community.html`→`/` 수정·배포.
5. ⬜ E2E 검증: 찜 → 권한허용 → 가격하락 → 기기 알림 → 클릭 시 상품상세 (Supabase 배포 + 실기기 필요).

## 사용자 배포 체크리스트 (코드는 다 나감)
```bash
# Supabase
#  1) SQL Editor에 supabase/migrations/024_price_alert_log.sql 실행
#  2) openssl rand -hex 24  →  supabase secrets set ALERT_SECRET="<값>"
#  3) supabase functions deploy send-price-alert   (VAPID 키는 이미 등록됨)
# 파이프라인 (DATA 세션/cron)
#  4) SEND_PRICE_ALERT_URL=https://<ref>.supabase.co/functions/v1/send-price-alert
#     ALERT_SECRET=<위 값>  python3 pipeline/detect_price_drops.py --send
# CORE 빌드
#  5) item churn 가라앉으면 stamp_version 포함 빌드로 app.js ?v= 전파(재방문자 반영)
```
