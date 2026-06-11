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


def _hash(fname):
    with open(os.path.join(SITE, fname), "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:8]


def main():
    # 72R: app.js뿐 아니라 style.css도 콘텐츠해시 스탬프(둘 중 하나만 하면 JS새/CSS헌 깨짐)
    # +supabaseClient.js: 모듈 import도 콘텐츠해시 스탬프(버전쿼리 없으면 SW가 구버전 모듈을
    #  stale 캐싱 → 새 함수 미정의로 페이지 깨짐). HTML의 './supabaseClient.js' import에 ?v= 박음.
    hj, hc = _hash("app.js"), _hash("style.css")
    hs = _hash("supabaseClient.js")
    changed = []
    for name in os.listdir(SITE):
        if not name.endswith(".html"):
            continue
        p = os.path.join(SITE, name)
        with open(p, encoding="utf-8") as f:
            html = f.read()
        new = re.sub(r'src="app\.js(\?v=[^"]*)?"', f'src="app.js?v={hj}"', html)
        new = re.sub(r'href="style\.css(\?v=[^"]*)?"', f'href="style.css?v={hc}"', new)
        # './supabaseClient.js' 또는 './supabaseClient.js?v=...' (작은/큰따옴표 모두)
        new = re.sub(r"(['\"])\./supabaseClient\.js(\?v=[^'\"]*)?\1",
                     lambda mm: f"{mm.group(1)}./supabaseClient.js?v={hs}{mm.group(1)}", new)
        if new != html:
            with open(p, "w", encoding="utf-8") as f:
                f.write(new)
            changed.append(name)
    # PWA: 서비스워커 CACHE 버전 스탬프(내용 바뀌면 옛 캐시 폐기).
    # app.js+style.css+supabaseClient.js 해시 + sw.js 자체 로직 해시를 결합.
    # → SW fetch/캐시 전략만 바뀌어도 CACHE명이 바뀌어 옛(오염될 수 있는) 캐시가 폐기된다.
    swp = os.path.join(SITE, "sw.js")
    if os.path.exists(swp):
        with open(swp, encoding="utf-8") as f:
            sw = f.read()
        # sw.js 로직 해시 — CACHE 줄은 제외(순환 방지: CACHE명이 해시에 영향주면 안 됨)
        sw_logic = re.sub(r'const CACHE = "camping-[^"]*";', "", sw)
        sw_hash = hashlib.md5(sw_logic.encode()).hexdigest()[:8]
        build = hashlib.md5((hj + hc + hs + sw_hash).encode()).hexdigest()[:8]
        sw2 = re.sub(r'const CACHE = "camping-[^"]*";', f'const CACHE = "camping-{build}";', sw)
        if sw2 != sw:
            with open(swp, "w", encoding="utf-8") as f:
                f.write(sw2)
            changed.append(f"sw.js(build={build})")
    print(f"버전 스탬프 app.js={hj} style.css={hc} → {', '.join(changed) if changed else '변경없음'}")


if __name__ == "__main__":
    main()
