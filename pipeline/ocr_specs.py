#!/usr/bin/env python3
"""쇼핑몰 상세 이미지 OCR 스펙 추출 — 보강(fill) + 다나와 교차검증(verify).

다나와가 표기 안 하는 스펙(예: 대형텐트 floor_area)을 ocamp/campinglist 상세
이미지에서 로컬 tesseract OCR로 추출. 토큰 소모 0(이미지를 LLM에 안 넘김).
다나와값이 있으면 비교해 불일치를 data_quality_flags(conflict)로 기록 = 검증 지표.

전제: tesseract(kor+eng) 설치. URL은 ocr_targets.json(SSOT)에서 product_id↔쇼핑몰URL 매핑.

사용:
  python3 pipeline/ocr_specs.py --verify         # 다나와값 vs OCR 비교 리포트 + conflict flag
  python3 pipeline/ocr_specs.py --fill           # 결측 스펙만 OCR 보강(source_id=5)
"""
import argparse
import io
import json
import os
import re
import subprocess
import sqlite3
import sys
import urllib.request
from urllib.parse import urlsplit, quote, urlunsplit

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import danawa as D
import pipeline as P

try:
    from PIL import Image
except ImportError:
    Image = None

SOURCE_OCR = 5
# 무게/내수압은 OCR 신뢰 높음, 크기는 이너 판별 휴리스틱(medium). 내수압은 노이즈로 verify만.
UA = {"User-Agent": "Mozilla/5.0"}


def _enc(url):
    p = urlsplit(url)
    return urlunsplit((p.scheme, p.netloc, quote(p.path), p.query, p.fragment))


def _dl(url, timeout=20):
    req = urllib.request.Request(_enc(url), headers=UA)
    return urllib.request.urlopen(req, timeout=timeout).read()


def detail_images(page_url):
    """상세 페이지에서 세로로 긴 큰 이미지(스펙/설명표) URL→bytes 추출."""
    host = urlsplit(page_url).netloc
    html = D.http_get(_enc(page_url))
    urls = re.findall(r'(?:src|data-src|ec-data-src|data-original)=["\']([^"\']+\.(?:jpg|jpeg|png))["\']',
                      html, re.I)
    norm = []
    for u in urls:
        if u.startswith("http"):
            norm.append(u)
        elif u.startswith("//"):
            norm.append("https:" + u)
        else:
            norm.append(f"https://{host}{u}")
    out = []
    for u in dict.fromkeys(norm):
        try:
            data = _dl(u, 15)
            if len(data) < 8000 or Image is None:
                continue
            im = Image.open(io.BytesIO(data))
            w, h = im.size
            if h >= w * 1.8 and w >= 500:   # 세로 긴 큰 이미지
                out.append((im, w, h))
        except Exception:
            pass
    return out


def ocr_text(page_url):
    """상세 이미지를 1400px 세로 분할 OCR → 전체 텍스트."""
    text = []
    for im, w, h in detail_images(page_url):
        for y in range(0, h, 1400):
            crop = im.crop((0, y, w, min(y + 1400, h)))
            buf = io.BytesIO()
            crop.save(buf, "PNG")
            r = subprocess.run(["tesseract", "stdin", "stdout", "-l", "kor+eng", "--psm", "6"],
                               input=buf.getvalue(), capture_output=True)
            text.append(r.stdout.decode("utf-8", "ignore"))
    return "\n".join(text)


def parse_specs(text):
    """OCR 텍스트 → {metric: (value_normalized, raw, confidence)}.

    무게(kg)·크기(이너추정)만 채택. 내수압은 노이즈로 미채택(verify 참고만).
    """
    out = {}
    # 무게: N.Nkg. M-356/M-417: 페그·폴·수납백 등 부속 무게가 함께 OCR되면 가장 작은 값이 부속일 수
    #   있어 min은 본체 무게를 과소평가한다. 주석 의도(가장 큰 값=본체/패키지)대로 max를 채택한다.
    kgs = [float(x) for x in re.findall(r'(\d+\.?\d*)\s*kg', text) if 0.3 < float(x) < 50]
    if kgs:
        out["weight_min"] = (round(max(kgs) * 1000), f"{max(kgs)}kg", "medium")

    # 크기: NxN(xN) 후보 추출, '이너'에 가장 가까운 것 = 바닥면적 근거
    sizes = []  # (시작위치, 가로, 세로)
    for m in re.finditer(r'(\d{2,3})\s*[xX×]\s*(\d{2,3})(?:\s*[xX×]\s*\d{2,3})?', text):
        a, b = int(m.group(1)), int(m.group(2))
        if 50 <= a <= 800 and 50 <= b <= 800:
            sizes.append((m.start(), a, b))
    if sizes:
        inner_pos = [m.start() for m in re.finditer(r'이너|인너|바닥', text)]
        if inner_pos:
            # '이너' 키워드에 가장 가까운 크기 후보
            best = min(sizes, key=lambda s: min(abs(s[0] - p) for p in inner_pos))
        else:
            # 키워드 없으면 가장 작은 면적(이너는 설치보다 작음)
            best = min(sizes, key=lambda s: s[1] * s[2])
        a, b = best[1], best[2]
        floor = round(a * b / 10000, 2)
        if 1.0 <= floor <= 30.0:
            out["floor_area"] = (floor, f"{a}x{b}cm(이너추정·OCR)", "low")
    return out


def shop_price(page_url):
    """상세 페이지에서 대표 판매가(최빈값) 추출. 가격은 텍스트라 OCR 불필요."""
    from collections import Counter
    html = D.http_get(_enc(page_url))
    cands = []
    for m in re.findall(r'(?:price|sale_price|product_price|판매가)["\']?\s*[:=]\s*["\']?(\d{4,8})', html, re.I):
        v = int(m)
        if 5000 <= v <= 20000000:
            cands.append(v)
    for m in re.findall(r'(\d{1,3}(?:,\d{3})+)\s*원', html):
        v = int(m.replace(",", ""))
        if 5000 <= v <= 20000000:
            cands.append(v)
    if not cands:
        return None
    return Counter(cands).most_common(1)[0][0]


def verify_price(con, pid, url, mode):
    """DB 가격 vs 쇼핑몰 가격 비교. 불일치 conflict flag, 2배+ 차이는 가격관측 무효화."""
    sp = shop_price(url)
    dn = con.execute("SELECT min_price FROM canonical_models WHERE rep_product_id=?", (pid,)).fetchone()
    if not sp or not dn or not dn[0]:
        return
    dv = dn[0]
    ratio = max(sp, dv) / min(sp, dv)
    if ratio < 1.3:
        print(f"  [price] DB={dv:,} 쇼핑몰={sp:,} → 일치({ratio:.2f}x)")
        return
    severe = ratio >= 2.0
    print(f"  [price] DB={dv:,} 쇼핑몰={sp:,} → {'심각불일치' if severe else '불일치'}({ratio:.1f}x)")
    # M-300: conflict flag INSERT와 가격관측 무효화 UPDATE를 SAVEPOINT로 원자화한다. 둘 사이에서
    #   예외가 나면 'conflict 기록은 됐는데 무효화는 누락'된 불일치 상태가 커밋될 수 있다.
    con.execute("SAVEPOINT vp")
    try:
        con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note,resolved,created_at)
            VALUES(?,NULL,'conflict',?,0,datetime('now'))""",
            (pid, f"가격: DB={dv:,} vs 쇼핑몰OCR={sp:,} ({ratio:.1f}x)"))
        if severe and mode == "fill":
            # 명백 오류 → 가격관측 무효화(노출 차단), 정정 전까지 보류
            con.execute("UPDATE price_observations SET valid=0 WHERE product_id=?", (pid,))
            print(f"    → 가격관측 무효화(노출 보류, 정정 필요)")
        con.execute("RELEASE vp")
    except Exception:
        con.execute("ROLLBACK TO vp")
        con.execute("RELEASE vp")
        raise


def get_target_url(con, pid):
    """ocr_targets.json에서 product_id→쇼핑몰 URL."""
    path = os.path.join(ROOT, "ocr_targets.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        targets = json.load(f)
    return targets.get(str(pid))


def run(con, mode):
    path = os.path.join(ROOT, "ocr_targets.json")
    if not os.path.exists(path):
        targets = {}
    else:
        with open(path, encoding="utf-8") as f:
            targets = json.load(f)
    if not targets:
        print("ocr_targets.json 없음/비어있음 — {product_id: 쇼핑몰URL} 매핑 필요")
        return

    for pid_s, url in targets.items():
        pid = int(pid_s)
        row = con.execute("SELECT canonical_model, category_id FROM products WHERE id=?", (pid,)).fetchone()
        if not row:
            print(f"  pid={pid} 없음"); continue
        model, cid = row
        print(f"\n[{model}] pid={pid}")
        # 가격 교차검증 (텍스트 추출, 스펙과 함께)
        try:
            verify_price(con, pid, url, mode)
            con.commit()
        except Exception as e:
            print(f"  [price] 검증 실패: {e}")

        parsed = parse_specs(ocr_text(url))
        if not parsed:
            print("  OCR 스펙 추출 실패"); continue

        for key, (val, raw, conf) in parsed.items():
            mid = P.metric_id(con, cid, key)
            if mid is None:
                continue
            dn = con.execute("""SELECT value_normalized, source_id FROM product_spec_values
                WHERE product_id=? AND metric_id=? AND valid=1 LIMIT 1""", (pid, mid)).fetchone()

            if dn:  # 다나와값 존재 → verify
                dv, dsrc = dn
                # H-116: dv가 0(예: comfort_temp=0°C)일 때 `if dv`는 falsy라 무조건 diff=1(불일치)로
                #   매 실행 conflict 플래그가 쌓인다. dv==0이면 OCR값도 0일 때만 일치(diff=0)로 본다.
                diff = abs(val - dv) / dv if dv != 0 else (0 if val == 0 else 1)
                status = "일치" if diff <= 0.15 else "불일치"
                print(f"  [verify] {key}: 기존={dv} OCR={val} 차이={diff*100:.0f}% → {status}")
                if status == "불일치" and mode in ("verify", "fill"):
                    con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note,resolved,created_at)
                        VALUES(?,?,'conflict',?,0,datetime('now'))""",
                        (pid, mid, f"다나와={dv} vs OCR={val}({raw}) 차이{diff*100:.0f}%"))
            else:  # 결측 → fill 후보
                print(f"  [fill] {key}: OCR={val} ({raw}) conf={conf}")
                if mode == "fill":
                    con.execute("""INSERT INTO product_spec_values
                        (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,collected_at,valid,star_eligible)
                        VALUES(?,?,?,?,'ocr',?,?,1,datetime('now'),1,1)""",
                        (pid, mid, val, raw, SOURCE_OCR, conf))
                    con.execute("""UPDATE data_quality_flags SET resolved=1
                        WHERE product_id=? AND metric_id=? AND flag_type='missing'""", (pid, mid))
        con.commit()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--verify", action="store_true", help="다나와값과 비교만(불일치 flag)")
    ap.add_argument("--fill", action="store_true", help="결측 스펙 OCR 보강 + 불일치 flag")
    args = ap.parse_args()
    mode = "fill" if args.fill else "verify"
    con = sqlite3.connect(args.db)
    run(con, mode)
    con.close()
    print(f"\n완료(mode={mode}).")


if __name__ == "__main__":
    main()
