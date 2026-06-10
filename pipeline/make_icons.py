#!/usr/bin/env python3
"""'장비의 숲' 앱 아이콘 생성 — 포레스트 그린 배경 + 숲(소나무) 모티프.
SVG 래스터라이저가 없어 PIL로 직접 드로잉(4x 슈퍼샘플 후 LANCZOS 축소 → 안티앨리어싱).
출력: site/icon-512.png, icon-192.png, apple-touch-icon.png(180), icon-maskable-512.png
사용: python3 pipeline/make_icons.py [--preview]  (--preview면 /tmp에 512 한 장만)
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(os.path.dirname(HERE), "site")

GREEN_TOP = (0x35, 0x88, 0x58)   # 밝은 포레스트 그린(상단)
GREEN_BOT = (0x1e, 0x57, 0x38)   # 깊은 그린(하단)
CREAM = (0xf5, 0xf2, 0xe8)       # 따뜻한 크림(나무)
TRUNK = (0x6b, 0x4a, 0x2e)       # 줄기 갈색


def _lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _pine(d, cx, base_y, h, w, color):
    """소나무 한 그루 — 3단 삼각형 + 짧은 줄기. cx=중심, base_y=맨아래(줄기끝)."""
    trh = h * 0.12
    tw = max(2, w * 0.16)
    d.rectangle([cx - tw / 2, base_y - trh, cx + tw / 2, base_y], fill=TRUNK)
    top_y = base_y - trh - h          # 잎 영역 맨위(꼭대기)
    for i in range(3):                # 0=위 작은 단, 2=아래 넓은 단
        a_y = top_y + i * (h * 0.22)
        b_y = a_y + h * 0.46
        hw = w * (0.34 + 0.16 * i)
        d.polygon([(cx, a_y), (cx - hw, b_y), (cx + hw, b_y)], fill=color)


def render(size, tree_scale=1.0, ground_frac=0.80, spread=0.20):
    S = 4
    W = size * S
    img = Image.new("RGB", (W, W))
    d = ImageDraw.Draw(img)
    for y in range(W):                # 세로 그라데이션 배경
        d.line([(0, y), (W, y)], fill=_lerp(GREEN_TOP, GREEN_BOT, y / W))
    cx = W // 2
    ground = int(W * ground_frac)
    h = W * 0.52 * tree_scale         # 가운데 큰 나무 높이
    # 뒤쪽(작은) 나무 → 앞쪽(큰) 나무 순서로 그려 겹침 자연스럽게
    _pine(d, int(cx - W * spread), ground - int(W * 0.02), h * 0.70, W * 0.13 * tree_scale, CREAM)
    _pine(d, int(cx + W * spread), ground - int(W * 0.04), h * 0.62, W * 0.115 * tree_scale, CREAM)
    _pine(d, cx, ground, h, W * 0.16 * tree_scale, CREAM)
    return img.resize((size, size), Image.LANCZOS)


def _font(size):
    for p in ["/System/Library/Fonts/AppleSDGothicNeo.ttc",
              "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
              "/Library/Fonts/AppleSDGothicNeo.ttc"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def render_og(path):
    """링크 공유용 OG 이미지 1200x630 — 숲 + '장비의 숲' 워드마크."""
    S = 2
    W, H = 1200 * S, 630 * S
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        d.line([(0, y), (W, y)], fill=_lerp(GREEN_TOP, GREEN_BOT, y / H))
    ground = int(H * 0.80)
    th = H * 0.46
    _pine(d, int(W * 0.16), ground - int(H * 0.02), th * 0.70, W * 0.05, CREAM)
    _pine(d, int(W * 0.30), ground - int(H * 0.04), th * 0.60, W * 0.045, CREAM)
    _pine(d, int(W * 0.23), ground, th, W * 0.062, CREAM)
    tx = int(W * 0.42)
    f_title = _font(int(H * 0.20))
    f_tag = _font(int(H * 0.058))
    d.text((tx, int(H * 0.30)), "장비의 숲", font=f_title, fill=CREAM)
    d.text((tx, int(H * 0.56)), "캠핑 장비, 측정값으로 정직하게 비교", font=f_tag, fill=(0xcf, 0xe3, 0xd6))
    d.text((tx, int(H * 0.66)), "gear-forest.com", font=f_tag, fill=(0xa9, 0xcc, 0xb8))
    img.resize((1200, 630), Image.LANCZOS).save(path)


def main():
    if "--og" in sys.argv:
        render_og("/tmp/gearforest_og_preview.png")
        print("og preview → /tmp/gearforest_og_preview.png")
        return
    if "--preview" in sys.argv:
        render(512).save("/tmp/gearforest_icon_preview.png")
        render(512, tree_scale=0.74, ground_frac=0.74, spread=0.16).save("/tmp/gearforest_maskable_preview.png")
        print("preview → /tmp/gearforest_icon_preview.png, /tmp/gearforest_maskable_preview.png")
        return
    render(512).save(os.path.join(SITE, "icon-512.png"))
    render(192).save(os.path.join(SITE, "icon-192.png"))
    render(180).save(os.path.join(SITE, "apple-touch-icon.png"))
    # maskable: 런처가 원형 크롭 → 콘텐츠를 중앙 안전영역으로 축소
    render(512, tree_scale=0.74, ground_frac=0.74, spread=0.16).save(os.path.join(SITE, "icon-maskable-512.png"))
    render_og(os.path.join(SITE, "og-image.png"))   # 링크 공유 미리보기 1200x630
    print("아이콘 4종 + og-image 생성 완료 →", SITE)


if __name__ == "__main__":
    main()
