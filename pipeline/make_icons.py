#!/usr/bin/env python3
"""[DEPRECATED] 구 아이콘 생성기(평면 침엽수 3그루).
→ 신 디자인(별5 + 폴드 침엽수 + 우드 데크)은 make_logo.py가 SSOT.
이 파일은 옛 로고로 덮어쓰는 사고를 막기 위해 make_logo.py로 위임만 한다."""
import runpy
import os

if __name__ == "__main__":
    print("make_icons.py는 make_logo.py로 대체됨 — make_logo 실행")
    runpy.run_path(os.path.join(os.path.dirname(__file__), "make_logo.py"), run_name="__main__")
