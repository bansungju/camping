# .claude/locks/ — 핫파일 동시편집 잠금

동시 세션이 코어 프론트 핫파일(`app.js`/`style.css`/`build-item-pages.js`)을
동시에 편집하지 않도록 하는 **런타임 잠금** 디렉토리.

- 파일명: `<핫파일명>.lock` (예: `app.js.lock`)
- 내용(JSON 한 줄): `{"session":"<id>","lane":"CORE","file":"app.js","started_at":"<ISO8601>"}`
- TTL 45분 — 초과 시 크래시로 간주하고 덮어쓰기 가능
- 편집 직전 생성, 커밋·푸시 후 삭제

규칙 전체는 레포 루트 `WORK-LANES.md` 참조.
`*.lock` 파일은 `.gitignore` 대상(커밋 금지).
