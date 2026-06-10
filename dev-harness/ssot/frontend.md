# SSOT — frontend (UX/UI·프론트 개발·디자인시스템)

> 이 영역의 단일 진실원본. 디자인시스템·페이지맵·컴포넌트 인벤토리의 정본.
> 상세 설계는 파생 문서 `DESIGN-social.md`·`site/style.css` 가 이 문서를 따른다.

## 불변규칙
- 정적 PWA — `site/` 하위 (`*.html/.js/.css`, `manifest.webmanifest`, `sw.js`).
- 외부 빌드 의존 없이 브라우저에서 바로 동작 (프레임워크 도입은 SSOT 개정 필요).
- 접근성: 인터랙티브 요소는 키보드 접근 가능, 색 대비 준수.

## 페이지맵 (2026-06-10 push 반영)
- index.html(메인) · category.html · brand.html · recommend.html
- community.html(소셜/UGC) · account.html(계정) · privacy.html(개인정보처리방침, OAuth 심사)
- 공통: app.js, style.css, sw.js, manifest.webmanifest

## 백엔드 연동
- API 는 backend SSOT 의 계약만 사용: GET `/api/manifest` `/api/category/{slug}` `/api/search?q=`.
- CORS origin 은 `https://bansungju.github.io`(GitHub Pages 배포).

## 컴포넌트 인벤토리 (TBD)
- 카드/탭/위시리스트/최근 본 상품 등 — 작업하며 채운다.
