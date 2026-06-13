#!/usr/bin/env python3
"""배포/커밋 게이트: git 추적 .py 파일에서 SQL 인젝션(문자열 직접삽입)을 차단.

2026-06-13 H-47(fill_whitelist_specs ACC_PAT를 f-string으로 SQL LIKE에 직접 삽입) 후 추가.
같은 규칙을 .git/hooks/pre-commit(로컬 1차)과 이 스크립트(CI 2차, 우회불가)가 공유한다.

탐지 원리:
- 'SQL 문자열 리터럴 안에 {..} 보간'(예: f"... LIKE '%{w}%'", f"... = '{x}'")이면서  # sql-ok (문서 예시)
- 같은 줄에 SQL 키워드(SELECT/INSERT/.../WHERE/LIKE/VALUES 등)가 있으면 차단.
- 안전한 패턴(IN ({ph})처럼 ? 플레이스홀더 조립)은 값을 따옴표로 감싸지 않으므로 안 걸린다.
- 오탐 시: 해당 줄에 '# sql-ok' 주석.
- 발견 시 exit 1 (CI 배포 중단 / 커밋 차단).
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 작은따옴표 SQL 리터럴 안에 {..} 보간 (값 직접삽입의 전형)
QUOTED_BRACE = re.compile(r"'[^']*\{[^}]*\}[^']*'")
# 같은 줄에 SQL 키워드가 함께 있어야 탐지 → 일반 f-string 오탐 최소화
SQL_KW = re.compile(r"select|insert|update|delete|where|like|values|from |join| set ",
                    re.IGNORECASE)
ALLOW_INLINE = ("# sql-ok",)


def tracked_py_files():
    out = subprocess.check_output(["git", "ls-files", "*.py"], cwd=ROOT, text=True)
    for rel in out.splitlines():
        if rel:
            yield rel


def main():
    hits = []
    for rel in tracked_py_files():
        path = os.path.join(ROOT, rel)
        try:
            with open(path, "r", encoding="utf-8", errors="strict") as f:
                lines = f.readlines()
        except (UnicodeDecodeError, OSError):
            continue
        for i, line in enumerate(lines, 1):
            if any(a in line for a in ALLOW_INLINE):
                continue
            if QUOTED_BRACE.search(line) and SQL_KW.search(line):
                hits.append((rel, i, line.strip()[:120]))

    if hits:
        print("🛡️  SQL 인젝션 게이트: SQL 문자열에 값이 직접 보간된 코드 발견 — 차단.\n")
        for rel, ln, snippet in hits:
            print(f"  {rel}:{ln}")
            print(f"      {snippet}")
        print("\n  → 값은 ? 플레이스홀더로 두고 execute(sql, params)로 바인딩하세요.")
        print("  - 오탐이면: 해당 줄에 '# sql-ok' 주석 추가.")
        sys.exit(1)

    print("✅ SQL 인젝션 게이트 통과 — 추적 .py에 SQL 문자열 직접삽입 없음.")


if __name__ == "__main__":
    main()
