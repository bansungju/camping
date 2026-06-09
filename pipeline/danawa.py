"""다나와 수집 어댑터 — pcode로 상품 페이지를 받아 스펙을 파싱.
발견: 다나와는 <meta name="Description">에 '키: 값 / 키: 값' 형태로 스펙 요약을 넣어둠.
공식몰(이미지 스펙)과 달리 텍스트 추출이 안정적. (feasibility-whitelist-danawa.md 참고)
"""
import re
import urllib.request
import html as htmllib

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def fetch(pcode, timeout=15):
    url = f"https://prod.danawa.com/info/?pcode={pcode}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="ignore")


def _meta_description(html):
    m = re.search(r'<meta\s+name="Description"\s+content="(.*?)"', html, re.I | re.S)
    return htmllib.unescape(m.group(1)) if m else None


def parse_price(html):
    """다나와 최저가(원). 판매중지/품절이면 None. (네이버쇼핑은 418 차단 → 다나와 사용)"""
    m = re.findall(r"최저가[^0-9]{0,30}([\d,]{4,})\s*원", html)
    return int(m[0].replace(",", "")) if m else None


def parse_spec_string(s):
    """'돔텐트 / 2인용 / 무게: 1.86kg / 설치크기: ...' → (specs{키:값}, tags[토큰])
    상품 상세의 meta Description, 검색결과의 spec_list 둘 다 같은 포맷이라 공용 사용."""
    specs, tags = {}, []
    for part in s.split("/"):
        p = part.strip()
        if not p or p.startswith("["):   # [본체] [크기] 섹션 헤더 무시
            continue
        if ":" in p:
            k, v = p.split(":", 1)
            specs[k.strip()] = v.strip()
        else:
            tags.append(p)
    return specs, tags


def parse(html):
    """반환: {'specs': {키:값}, 'tags': [범주토큰...], 'title': str}"""
    desc = _meta_description(html)
    title_m = re.search(r'<meta\s+name="Title"\s+content="(.*?)"', html, re.I | re.S)
    title = htmllib.unescape(title_m.group(1)) if title_m else None
    if not desc:
        return {"specs": {}, "tags": [], "title": title, "raw_desc": None}
    body = desc.split("요약정보", 1)[-1].lstrip(" :")
    specs, tags = parse_spec_string(body)
    return {"specs": specs, "tags": tags, "title": title, "raw_desc": desc}


if __name__ == "__main__":
    import sys
    pcode = sys.argv[1] if len(sys.argv) > 1 else "16247885"
    res = parse(fetch(pcode))
    print("TITLE:", res["title"])
    print("TAGS :", res["tags"])
    for k, v in res["specs"].items():
        print(f"  {k} = {v}")
