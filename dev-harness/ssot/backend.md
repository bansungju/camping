# SSOT — backend (API·서버·아키텍처)

> 이 영역의 단일 진실원본. **API 계약**이 정본 — frontend 는 이 계약만 가정하고 내부구현에 의존하지 않는다.
> 파생: `backend/**`(FastAPI 구현), `backend-plan/ARCH-R*.md`(설계). 계약 변경은 K.2 사용자 승인.
> (2026-06-10 기준 — 타 세션이 FastAPI 백엔드를 push 해 실재가 됨. 이 문서를 실재에 맞춰 갱신.)

## 스택 (실재)
- **FastAPI** (`backend/main.py`) — title "캠핑기어 API", lifespan 으로 data_store 로드 + WAL checkpoint 루프.
- **SQLite read-only** (`backend/db.py`) — `file:...?mode=ro`, 세마포어 10, 8s 타임아웃. DB=`camping_tents500.db`.
- **slowapi** rate limit — 기본 60/minute, key = CF-Connecting-IP → client host.
- in-memory `data_store`(`backend/store.py`).

## API 계약 (정본 — 변경 시 K.2)
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 200 ok / 503. db health_check |
| GET | `/api/manifest` | 카테고리 매니페스트 |
| GET | `/api/category/{slug}` | 카테고리별 상품 |
| GET | `/api/search?q=` | 검색 (q max_length=100) |

## 불변규칙 (invariants)
- **읽기 전용** — 모든 DB 접근은 `mode=ro`. 쓰기 엔드포인트 추가는 SSOT 개정(K.2) 필요.
- CORS: `allow_origins`=[github.io, localhost:3000, 127.0.0.1:5500], `allow_methods`=["GET"] 만.
- `/api/*` 는 `Cache-Control: no-store`.
- 에러는 HTTPException(코드, 한국어 메시지) 일관 형식.
- 인증/세션은 auth SSOT 와 정합(현재 공개 읽기 API — auth 미적용).

## 배포 (파생)
- `Caddyfile`(리버스 프록시), `deploy-to-mini.sh`(Mac mini). 외부 배포는 H.2 승인.
