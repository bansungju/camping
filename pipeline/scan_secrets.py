#!/usr/bin/env python3
"""배포/커밋 게이트: git 추적 파일에서 토큰·키 유출을 차단.

2026-06-13 CF 터널 토큰이 plist로 커밋돼 public 히스토리에 유출된 사고 후 추가.
같은 패턴을 .git/hooks/pre-commit(로컬 1차)과 이 스크립트(CI 2차, 우회불가)가 공유한다.

- 검사 대상: `git ls-files`로 추적되는 텍스트 파일(바이너리/DB/이미지/락 제외).
- 의도적 비탐지(공개 의도): sb_publishable_(Supabase 공개키)·*.supabase.co URL·
  GitHub Actions ${{ secrets.* }} 참조·__PLACEHOLDER__ 토큰.
- 오탐 시: 해당 줄에 'pragma: allowlist secret' 또는 'gitleaks:allow' 주석.
- 발견 시 exit 1 (CI 배포 중단 / 커밋 차단).
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 고신뢰 시크릿 패턴 (pre-commit 훅과 동기화 유지)
PATTERNS = [
    (r"eyJhIjoi[A-Za-z0-9+/=_-]{60,}", "Cloudflare 터널 토큰"),
    (r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}", "JWT(service_role 등)"),
    (r"sb_secret_[A-Za-z0-9]+", "Supabase secret key"),
    (r"ghp_[A-Za-z0-9]{30,}", "GitHub PAT"),
    (r"gho_[A-Za-z0-9]{30,}", "GitHub OAuth 토큰"),
    (r"github_pat_[A-Za-z0-9_]{30,}", "GitHub fine-grained PAT"),
    (r"glpat-[A-Za-z0-9_-]{20,}", "GitLab PAT"),
    (r"xox[bpoas]-[A-Za-z0-9-]{10,}", "Slack 토큰"),
    (r"AKIA[A-Z0-9]{16}", "AWS access key"),
    (r"AIza[A-Za-z0-9_-]{30,}", "Google API key"),
    (r"sk-[A-Za-z0-9_-]{20,}", "OpenAI/sk- 키"),  # M-314: 신형 sk-proj-/sk-svcacct-(하이픈·언더스코어) 포착
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "개인키(PEM)"),
]
COMPILED = [(re.compile(p), label) for p, label in PATTERNS]

ALLOW_INLINE = ("pragma: allowlist secret", "gitleaks:allow")
SKIP_EXT = {".db", ".db-wal", ".db-shm", ".png", ".jpg", ".jpeg", ".gif",
            ".webp", ".ico", ".woff", ".woff2", ".ttf", ".pdf", ".zip",
            ".lock"}
SKIP_NAMES = {"package-lock.json", "yarn.lock"}


def git_ls_files(*args):
    """git ls-files 실행. 실패 시 traceback 대신 명확한 메시지+exit 1(보안 게이트는 fail-closed).

    H-55: subprocess가 실패하면(git 미설치=FileNotFoundError, 비-git/오류=non-zero)
    check_output이 잡히지 않은 예외로 CI 게이트를 비정상 종료시켰음 → 진단 가능한 차단으로 전환.
    """
    try:
        proc = subprocess.run(["git", "ls-files", *args], cwd=ROOT,
                              capture_output=True, text=True)
    except (FileNotFoundError, OSError) as e:
        print(f"🚨 시크릿 게이트: git 실행 불가({e}) — 스캔 불가, 차단(fail-closed).")
        sys.exit(1)
    if proc.returncode != 0:
        print("🚨 시크릿 게이트: 'git ls-files' 실패 — 스캔 불가, 차단(fail-closed).")
        print(f"      exit={proc.returncode}  stderr={proc.stderr.strip()[:200]}")
        sys.exit(1)
    return proc.stdout.splitlines()


def tracked_files():
    for rel in git_ls_files():
        if not rel:
            continue
        if os.path.splitext(rel)[1].lower() in SKIP_EXT:
            continue
        if os.path.basename(rel) in SKIP_NAMES:
            continue
        yield rel


def main():
    hits = []
    for rel in tracked_files():
        path = os.path.join(ROOT, rel)
        try:
            # L-278: errors="strict"면 비UTF-8 바이트 1개로 파일 전체 스킵 → 시크릿 은닉 우회 가능.
            #   errors="replace"로 깨진 바이트만 U+FFFD 치환하고 나머지 라인은 계속 스캔(우회 차단).
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
        except OSError:
            continue  # 읽기불가 → 건너뜀
        for i, line in enumerate(lines, 1):
            if any(a in line for a in ALLOW_INLINE):
                continue
            for rx, label in COMPILED:
                if rx.search(line):
                    hits.append((rel, i, label, line.strip()[:120]))
                    break

    if hits:
        print("🚨 시크릿 게이트: 추적 파일에서 토큰/키로 보이는 문자열 발견 — 차단.\n")
        for rel, ln, label, snippet in hits:
            print(f"  {rel}:{ln}  [{label}]")
            print(f"      {snippet}")
        print("\n  - 진짜 시크릿이면: 코드에서 제거하고 env/키체인/GitHub Secrets로 옮기세요.")
        print("  - 오탐이면: 해당 줄에 '# pragma: allowlist secret' 주석 추가.")
        sys.exit(1)

    print("✅ 시크릿 게이트 통과 — 추적 파일에 노출된 토큰/키 없음.")


if __name__ == "__main__":
    main()
