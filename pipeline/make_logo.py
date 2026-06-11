#!/usr/bin/env python3
"""장비의 숲 로고/아이콘 생성기 — 별5 + 침엽수(폴드 음영) + 우드 데크.
SVG 래스터라이저가 없어 PIL 4x 슈퍼샘플링으로 직접 렌더한다.
좌표계는 512x512 기준. 콘텐츠는 (256,256) 중심으로 정의."""
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

SITE = os.path.join(os.path.dirname(__file__), "..", "site")
SS = 4  # supersample

# --- palette ---
BG0=(58,140,93); BG1=(21,64,42)          # 배경 그라데이션
FOL_L=(245,242,231); FOL_S=(221,215,193) # 잎 밝은면/그늘면
TRUNK=(122,82,48); GRAIN=(141,96,56)
DECK_T=(200,144,88); DECK_TS=(165,116,63)
DECK_F=(125,82,48); DECK_FS=(95,62,36)
STAR=(255,201,77)

# --- star unit shape (R=1, 5-point) ---
U=[(0,-1),(0.25,-0.35),(0.95,-0.3125),(0.4,0.1375),(0.5875,0.8125),
   (0,0.425),(-0.5875,0.8125),(-0.4,0.1375),(-0.95,-0.3125),(-0.25,-0.35)]
STAR_C=[(157.9,93.9),(206.9,76.8),(256.0,68.3),(305.1,76.8),(354.1,93.9)]
STAR_R=21.33

def grad(w,h):
    """대각선 그라데이션 (좌상→우하)"""
    yy,xx=np.mgrid[0:h,0:w]
    t=((xx+yy)/(w+h-2)).clip(0,1)[...,None]
    arr=(np.array(BG0)*(1-t)+np.array(BG1)*t).astype(np.uint8)
    return Image.fromarray(arr,"RGB").convert("RGBA")

def mark_tile(px, scale=1.0):
    """투명 배경 위에 마크만 그린 RGBA 타일 (px x px)."""
    s = px/512.0
    def T(x,y):
        if scale!=1.0:
            x=256+(x-256)*scale; y=256+(y-256)*scale
        return (x*s, y*s)
    def poly(d,pts,fill): d.polygon([T(x,y) for x,y in pts],fill=fill)
    def line(d,a,b,fill,w):
        d.line([T(*a),T(*b)],fill=fill,width=max(1,round(w*s*scale)))
    tile=Image.new("RGBA",(px,px),(0,0,0,0)); d=ImageDraw.Draw(tile)
    # 별 5개
    for cx,cy in STAR_C:
        pts=[(cx+STAR_R*ux,cy+STAR_R*uy) for ux,uy in U]
        poly(d,pts,STAR)
    # 데크 윗면
    poly(d,[(128.0,401.07),(384.0,401.07),(431.04,439.47),(81.07,439.47)],DECK_T)
    for a,b in [((192.0,401.07),(168.53,439.47)),((256.0,401.07),(256.0,439.47)),((320.0,401.07),(343.47,439.47))]:
        line(d,a,b,DECK_TS,2)
    # 데크 앞면
    poly(d,[(81.07,439.47),(431.04,439.47),(431.04,469.33),(81.07,469.33)],DECK_F)
    for x in (168.53,256.0,343.47):
        line(d,(x,439.47),(x,469.33),DECK_FS,2)
    # 접지 그림자 (반투명) — 별도 레이어 합성
    sh=Image.new("RGBA",(px,px),(0,0,0,0)); ds=ImageDraw.Draw(sh)
    ex,ey=T(256,413.87); rx=72.53*s*scale; ry=10.67*s*scale
    ds.ellipse([ex-rx,ey-ry,ex+rx,ey+ry],fill=(0,0,0,34))
    tile=Image.alpha_composite(tile,sh); d=ImageDraw.Draw(tile)
    # 밑동 + 결
    poly(d,[(236.8,371.2),(275.2,371.2),(279.47,411.73),(232.53,411.73)],TRUNK)
    line(d,(256,371.2),(256,409.6),GRAIN,2)
    # 잎 3단 (좌 밝은면 / 우 그늘면)
    tiers=[((256,132.27),(194.13,230.40),(317.87,230.40)),
           ((256,192.0),(164.27,298.67),(347.73,298.67)),
           ((256,260.27),(136.53,375.47),(375.47,375.47))]
    for apex,bl,br in tiers:
        poly(d,[apex,bl,(256,bl[1])],FOL_L)
        poly(d,[apex,br,(256,br[1])],FOL_S)
    return tile

RADIUS_FRAC=0.2237  # iOS 스퀴어클 비율

def render_icon(size, mark_scale=1.0, rounded=False):
    px=512*SS
    bg=grad(px,px)
    tile=mark_tile(px, scale=mark_scale)
    img=Image.alpha_composite(bg,tile)
    if rounded:
        mask=Image.new("L",(px,px),0)
        ImageDraw.Draw(mask).rounded_rectangle([0,0,px-1,px-1],radius=int(px*RADIUS_FRAC),fill=255)
        img.putalpha(mask)          # 모서리 밖 투명 → 둥근 아이콘
        out=img
    else:
        out=img.convert("RGB")      # 불투명 정사각(애플터치·maskable: OS가 직접 마스킹)
    return out.resize((size,size),Image.LANCZOS)

def save(img,name):
    p=os.path.join(SITE,name); img.save(p); print("written",name,img.size)

def make_og():
    W,H=1200,630; K=2
    bg=grad(W*K,H*K)
    img=bg.copy(); d=ImageDraw.Draw(img)
    FP="/System/Library/Fonts/AppleSDGothicNeo.ttc"
    cy=H*K//2                            # 캔버스 세로 중앙
    full="장비의 숲"; tagline="데이터 기반 캠핑용품 추천"
    # 워드마크 폰트를 목표 폭에 자동 맞춤
    text_target=620*K
    fs=184*K; wf=ImageFont.truetype(FP,fs,index=6)
    while d.textlength(full,font=wf)>text_target and fs>40*K:
        fs-=4*K; wf=ImageFont.truetype(FP,fs,index=6)
    tf=ImageFont.truetype(FP,int(fs*0.28),index=4)
    ww=d.textlength(full,font=wf); tw=d.textlength(tagline,font=tf)
    text_w=max(ww,tw)
    # 마크+텍스트 그룹을 가로 중앙 정렬
    mark_px=360; gap_mt=44*K
    group_w=mark_px*K+gap_mt+text_w
    start_x=(W*K-group_w)//2
    m=mark_tile(512*SS).resize((mark_px*K,mark_px*K),Image.LANCZOS)
    img.alpha_composite(m,(int(start_x),int(cy-mark_px*K//2)))   # 마크 세로 중앙
    tx=int(start_x+mark_px*K+gap_mt)
    # 두 줄 블록을 실제 글리프 bbox 기준 세로 중앙(앵커 lm)
    wb=d.textbbox((0,0),full,font=wf,anchor="lm"); hw=wb[3]-wb[1]
    tb=d.textbbox((0,0),tagline,font=tf,anchor="lm"); ht=tb[3]-tb[1]
    gap_v=int(fs*0.30)
    block=hw+gap_v+ht
    wm_cy=cy-block//2+hw//2
    tg_cy=cy+block//2-ht//2
    w1=d.textlength("장비의 ",font=wf)
    d.text((tx,wm_cy),"장비의 ",font=wf,fill=(245,242,231),anchor="lm")
    d.text((tx+w1,wm_cy),"숲",font=wf,fill=(190,238,210),anchor="lm")
    d.text((tx,tg_cy),tagline,font=tf,fill=(198,228,210),anchor="lm")
    return img.resize((W,H),Image.LANCZOS).convert("RGB")

if __name__=="__main__":
    # 둥근 모서리 + 마크를 보더 근처까지 크게(여백 최소)
    save(render_icon(512,mark_scale=0.95,rounded=True),"icon-512.png")
    save(render_icon(192,mark_scale=0.95,rounded=True),"icon-192.png")
    # 애플터치: iOS가 직접 둥글게 마스킹 → 불투명 정사각 유지
    save(render_icon(180,mark_scale=0.95,rounded=False),"apple-touch-icon.png")
    # maskable: 런처 원형 크롭 안전영역 → 콘텐츠 축소, 불투명 정사각
    save(render_icon(512,mark_scale=0.70,rounded=False),"icon-maskable-512.png")
    save(make_og(),"og-image.png")
    print("done")
