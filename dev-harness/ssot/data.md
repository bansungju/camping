# SSOT — data (DB 스키마·파이프라인·데이터사전)

> 이 영역의 단일 진실원본. 스키마·데이터사전·파이프라인 계약의 정본.
> 파생: `DATABASE-DESIGN.md`·`schema.sql`·`pipeline/README.md`.

## 불변규칙
- 스키마 변경은 이 문서가 정본. 파괴적 변경(DROP/ALTER DROP/TRUNCATE)은 H.1 사용자 승인.
- 파이프라인은 멱등(idempotent) — 재실행해도 같은 결과.
- 정합성 도구(`pipeline/validate_ranges.py`·`audit.py`)를 통과해야 한다.

## 핵심 테이블 (현재)
- camping_tents500.db — 텐트 카탈로그. 상세는 `schema.sql`/`DATABASE-DESIGN.md`.

## 데이터사전 (TBD)
- 컬럼 정의·범위·출처 — 작업하며 수렴.
