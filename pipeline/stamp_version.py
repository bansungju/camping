#!/usr/bin/env python3
"""정적 자산 캐시버스팅 — app.js 내용 해시를 HTML script태그에 자동 스탬프.

71R 회귀교훈: ?v= 쿼리를 수동 관리하면 내용이 바뀌어도 깜빡 안 올려서
재방문자가 구버전 JS를 캐시로 받는다(신기능 전체 무로드, 에러 없음).
→ app.js 내용 md5 앞 8자리를 ?v=로 박아, 내용이 바뀌면 자동으로 캐시키가 바뀐다.

사용: python3 pipeline/stamp_version.py   (run_all.py 끝에서 자동 호출)
"""
import hashlib
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(os.path.dirname(HERE), "site")


def main():
    appjs = os.path.join(SITE, "app.js")
    with open(appjs, "rb") as f:
        h = hashlib.md5(f.read()).hexdigest()[:8]
    changed = []
    for name in os.listdir(SITE):
        if not name.endswith(".html"):
            continue
        p = os.path.join(SITE, name)
        with open(p, encoding="utf-8") as f:
            html = f.read()
        new = re.sub(r'src="app\.js(\?v=[^"]*)?"', f'src="app.js?v={h}"', html)
        if new != html:
            with open(p, "w", encoding="utf-8") as f:
                f.write(new)
            changed.append(name)
    print(f"app.js 버전 스탬프 v={h} → {', '.join(changed) if changed else '변경없음(이미 최신)'}")


if __name__ == "__main__":
    main()
