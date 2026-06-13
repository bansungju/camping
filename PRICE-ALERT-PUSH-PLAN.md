# 푸시 재배선 → 가격 알림 설계서

> 작성: 2026-06-13 / 작성자: 기획
> 미션: **푸시 용도를 가격알림으로 재배선하는 설계부터 잡기**
> 성격: **아키텍처 설계(design-first)**. 코드 미수정. 현 푸시 인프라 재활용 + 빠진 조각 식별.
> 관련: `sw.js`, `app.js`(push 모듈), `supabase/functions/send-push-notification`, `push_subscriptions` 테이블, 찜(wishlist)

---

## 1. 한 줄 요약
이미 **완성돼 있으나 비활성 커뮤니티에만 묶여 죽어 있는** Web Push 인프라(VAPID·구독·SW·Edge Function)를, **찜한 상품의 가격 하락 알림**으로 재배선한다. 단, 재배선만으로는 부족하고 **"가격 변화를 감지할 기준선(price snapshot)"이 빠져 있어 이 조각을 새로 설계**해야 한다.

---

## 2. 현황 진단 — 가진 것 / 빠진 것 (코드 근거)

### 2-1. 푸시 인프라는 이미 풀세트로 존재한다 ✅
| 구성요소 | 위치 | 현재 용도 |
|----------|------|-----------|
| VAPID 키쌍 | `app.js:3501` + Edge Function env | 공유 |
| 구독 요청/저장 | `requestPushSubscription()` [app.js:3503](site/app.js) → `push_subscriptions` upsert | 클라 |
| SW 수신·클릭 | `sw.js:82` push / `sw.js:94` notificationclick | 공유 |
| 발송 | Edge Function `send-push-notification` | 서버 |

### 2-2. 그런데 전부 **커뮤니티 댓글**에만 묶여 있다 — 그리고 커뮤니티는 비활성
- 구독 트리거: `if (window._commUser ...) requestPushSubscription()` — **커뮤니티 렌더 안에서만** 호출([app.js:3495](site/app.js)). 커뮤니티 비활성([nav-gnb-archived] 플래그) → **구독 자체가 영영 실행 안 됨.**
- 발송 트리거: Edge Function은 `comments` INSERT **DB Webhook**으로만 깨어남(`index.ts` 주석). 포스트 작성자에게만 발송.
- 딥링크: `sw.js:83`·`sw.js:96` 기본 URL이 **하드코딩 `/community.html`**.
- **결론: 배관은 완벽한데 수도꼭지가 잠긴 빈 방에 연결돼 있다.** 가격 알림으로 "재배선"한다는 미션의 정확한 의미 = 이 3개 접점(구독 시점·발송 트리거·딥링크)을 가격 도메인으로 옮기는 것.

### 2-3. 진짜 빠진 조각 — 가격 변화 감지 기준선 ❌ (설계 핵심)
- 상품 가격은 `price_min`/`price_max`로 **JSON에 정적 저장**([auto-tent.json] models), 파이프라인 재생성 시에만 갱신. **시계열·이력 테이블 없음.**
- 찜 항목은 담을 때 가격 `p`를 한 번 스냅샷([app.js:1162](site/app.js)) — 이게 **유일하게 존재하는 per-user 가격 기준선**.
- 쿠팡 API는 매출 15만원 후 개방([coupang-partners-monetization]) → **실시간 가격 폴링 불가**. 가격은 파이프라인 재export·배포 시점에만 바뀐다.
- ⟹ "가격이 내렸다"를 판정하려면 **[이전 가격]과 [새 가격]을 비교할 스냅샷 저장소**가 필요한데 지금은 없다. **이걸 만드는 게 이번 설계의 본체.**

---

## 3. 목표 아키텍처 (TO-BE)

```
[배포 파이프라인 export]
      │ 새 price_min 산출
      ▼
(1) price_snapshots 갱신 ──비교──> 직전 스냅샷
      │ Δ가격 하락 감지
      ▼
(2) 가격하락 이벤트 ──> 찜한 사용자 매칭(gf_code 기준)
      │
      ▼
(3) Edge Function send-price-alert ──Web Push──> 구독 기기
      │
      ▼
(4) SW 알림 표시 → 클릭 → 해당 상품 상세로 딥링크
```

### 3-1. 데이터 모델 (신규)
- **`price_snapshots`** — `gf_code`(PK 후보), `price_min`, `captured_at`. export마다 upsert. "직전값"은 별도 `last_price` 컬럼 또는 이력 row 비교.
- **`price_watches`** — 사용자가 가격을 추적할 항목. **찜을 그대로 감시 목록으로 쓰면 신규 테이블 불필요**(찜=watch). 단 찜은 현재 localStorage/원격 혼재 → 서버측 매칭하려면 **원격 찜(remote wishlist)에 `gf_code` 포함**이 전제. (확인 필요: 원격 찜이 gf_code를 저장하는가)
- **`push_subscriptions`** — 재사용. 변경 없음.

### 3-2. 재배선 3접점 (커뮤니티 → 가격)
| 접점 | AS-IS | TO-BE |
|------|-------|-------|
| **구독 시점** | 커뮤니티 진입 시 1회 | **찜 추가 시** 또는 **계정 설정 '가격 알림 받기' 토글** 켤 때 권한 요청 |
| **발송 트리거** | `comments` INSERT Webhook | export 후 **가격하락 이벤트**(배치) → 새 Edge Function |
| **딥링크** | `/community.html` 고정 | 알림 payload `data.url = 해당 상품 상세 URL`(gf_code/slug 기반) |

### 3-3. 발송 흐름 (배치형, 폴링 아님)
1. 배포 export 단계에서 `flag_price_drops`: 신 `price_min` < 직전 스냅샷 → 하락 목록 산출(임계치 예: **≥3% 또는 ≥3,000원** 하락만, 노이즈 차단).
2. 하락 항목 `gf_code`로 **해당 상품을 찜한 사용자** 조회.
3. 사용자별 `push_subscriptions` 발송: `{title:"💸 찜한 장비 가격↓", body:"${brand} ${model} ₩${old}→₩${new}", data:{url: 상세}}`.
4. 발송 로그(중복 발송·재알림 쿨다운 관리).

---

## 4. 단계별 구현 로드맵 (설계 후 분리 작업)

- **P0 (이번 설계 산출물):** 본 문서 + 아래 "열린 결정" 합의.
- **P1 데이터 토대:** `price_snapshots` 테이블 + export 시 스냅샷 기록(파이프라인 `check_export`/run_all 연계). 아직 발송 없음, 기준선만 축적.
- **P2 감지:** `flag_price_drops`(임계치) — 하락 이벤트 산출·로깅. 발송 없이 검증.
- **P3 재배선:** 구독 시점 이동(찜/설정 토글) + sw.js 딥링크 일반화 + 새 Edge Function `send-price-alert`.
- **P4 매칭·발송:** gf_code↔찜 사용자 매칭 + 쿨다운·중복차단 + 실발송.
- **P5 옵트인 UI:** 계정 설정 '가격 알림' 토글, 알림 받은 항목 표시.

> P1·P2는 **발송 없이도 단독 가치**(가격 이력 = 향후 "가격 그래프"·정직비교 자산). 푸시가 막혀도 헛수고 아님.

---

## 5. 열린 결정 (합의 필요)

1. **감시 대상 = 찜으로 단일화?** vs 별도 '가격 추적' 버튼 신설? (찜 재사용이 단순하나, "찜≠가격추적" 의도 분리 원하면 별도)
2. **하락 임계치** — 3%? 5%? 절대액 하한? (노이즈·알림 피로 직결)
3. **가격 갱신 주기** — export가 비정기면 알림도 비정기. 정기 가격 리프레시(쿠팡 API 전까지 수동/OCR) 운영 가능?
4. **원격 찜에 gf_code 저장 여부** — 서버 매칭의 전제. 현재 찜 항목 키는 `pcode`(brand+model 해시)인데 gf_code 매핑이 서버에 있나?
5. **옵트인 모델** — 찜하면 자동 구독 권유 vs 설정에서 명시적 on. (권한 피로 vs 도달률)

---

## 6. 검증 관점 (구현 시, 라이브 gear-forest.com 기준)
- P1: export 2회 후 `price_snapshots`에 직전/현재값 2점 존재
- P2: 의도적 가격 하향 시드 → `flag_price_drops`가 정확히 잡고 임계치 미만은 무시
- P3~4: 테스트 구독 기기로 실제 푸시 수신 + 클릭 시 **해당 상품 상세**로 이동(커뮤니티 아님)
- 수정 후 `stamp_version.py` 필수
