"""다나와 수집 어댑터 — pcode로 상품 페이지를 받아 스펙을 파싱.
발견: 다나와는 <meta name="Description">에 '키: 값 / 키: 값' 형태로 스펙 요약을 넣어둠.
공식몰(이미지 스펙)과 달리 텍스트 추출이 안정적. (feasibility-whitelist-danawa.md 참고)
"""
import re
import gzip
import zlib
import random
import time
import urllib.request
import urllib.error
import urllib.robotparser
import http.cookiejar
import html as htmllib

# 모든 다나와 요청은 이 모듈의 http_get()을 거친다 → 헤더·세션·예의를 한 곳에서 관리.
# 목표: (1) 봇 시그니처 제거(사람 브라우저처럼) (2) 서버에 정중하게(지터·백오프·robots).
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36")

# 실제 크롬이 항상 보내는 헤더 묶음. UA만 보내는 요청이 가장 쉽게 봇으로 걸린다.
BASE_HEADERS = {
    "User-Agent": UA,
    "Accept": ("text/html,application/xhtml+xml,application/xml;q=0.9,"
               "image/avif,image/webp,*/*;q=0.8"),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate",   # br은 표준 라이브러리로 못 풀어 제외
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua": '"Chromium";v="138", "Google Chrome";v="138", "Not?A_Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
}

# 프로세스 1개 = 브라우저 1개처럼: 첫 응답의 세션 쿠키를 이후 요청에 자동 동봉.
_cookies = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cookies))


def polite_sleep(base=0.8, spread=1.2):
    """base ~ base+spread 초 랜덤 대기 — 정확히 N초마다(봇 지문) 대신 사람처럼 분산."""
    time.sleep(base + random.random() * spread)


def _decompress(raw, encoding):
    try:
        if encoding == "gzip":
            return gzip.decompress(raw)
        if encoding == "deflate":
            return zlib.decompress(raw)
    except Exception:
        pass   # 압축 안됐거나 해제 실패 → 원본 그대로(견고)
    return raw


def http_get(url, referer=None, timeout=20, retries=3):
    """공용 HTTP GET — 현실적 헤더 + 세션쿠키 + (선택)Referer + 지수 백오프.
    429/503은 Retry-After를 존중하고 물러섰다 재시도(차단 악화·서버 부하 방지)."""
    headers = dict(BASE_HEADERS)
    if referer:
        headers["Referer"] = referer
        headers["Sec-Fetch-Site"] = "same-origin"   # 사이트 내 이동처럼
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with _opener.open(req, timeout=timeout) as r:
                return _decompress(r.read(), r.headers.get("Content-Encoding")).decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 503):       # 서버가 명시한 대기시간 존중 = 정중함의 핵심
                try:
                    wait = int(e.headers.get("Retry-After", 0))
                except (TypeError, ValueError):
                    wait = 0
                time.sleep((wait or 2 ** attempt * 3) + random.random())
                continue
            if 500 <= e.code < 600:
                time.sleep(2 ** attempt + random.random())
                continue
            raise                          # 404 등은 재시도 무의미
        except urllib.error.URLError:
            time.sleep(2 ** attempt + random.random())
            last = None
            continue
    if last:
        raise last
    raise urllib.error.URLError(f"http_get 실패(재시도 {retries}회 초과): {url}")


# robots.txt — 호스트별 1회 캐시. 합법성·예의 확인용(정보 제공·Crawl-delay 존중).
_robots = {}


def robots_info(url):
    """(allowed, crawl_delay) 반환. 네트워크/파싱 실패 시 (True, None)로 보수적 통과."""
    try:
        from urllib.parse import urlsplit
        parts = urlsplit(url)
        host = f"{parts.scheme}://{parts.netloc}"
        rp = _robots.get(host)
        if rp is None:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(host + "/robots.txt")
            rp.read()
            _robots[host] = rp
        return rp.can_fetch(UA, url), rp.crawl_delay(UA)
    except Exception:
        return True, None


_robots_warned = set()


def robots_advisory(url):
    """크롤 시작 시 1회: robots.txt 허용 여부·Crawl-delay를 출력(정중함·합법성 확인).
    자동 차단하지 않는다 — 자체 데이터 수집을 조용히 멈추기보다, 사람이 판단하도록 표면화."""
    from urllib.parse import urlsplit
    host = urlsplit(url).netloc
    if host in _robots_warned:
        return
    _robots_warned.add(host)
    allowed, delay = robots_info(url)
    if not allowed:
        print(f"  ⚠ robots.txt가 {host}의 해당 경로를 비허용합니다 — 약관 확인 권장(크롤은 계속됨).")
    if delay:
        print(f"  ℹ {host} robots Crawl-delay={delay}s — polite_sleep 간격을 이 이상으로 권장.")


def fetch(pcode, timeout=15):
    """상품 상세 — 검색결과에서 클릭해 들어온 것처럼 Referer 부여."""
    url = f"https://prod.danawa.com/info/?pcode={pcode}"
    return http_get(url, referer="https://search.danawa.com/dsearch.php", timeout=timeout)


def _meta_description(html):
    m = re.search(r'<meta\s+name="Description"\s+content="(.*?)"', html, re.I | re.S)
    return htmllib.unescape(m.group(1)) if m else None


def parse_price(html):
    """다나와 최저가(원). 판매중지/품절이면 None. (네이버쇼핑은 418 차단 → 다나와 사용)"""
    m = re.findall(r"최저가[^0-9]{0,30}([\d,]{4,})\s*원", html)
    return int(m[0].replace(",", "")) if m else None


def parse_spec_string(s):
    """'돔텐트 / 2인용 / 무게: 1.86kg / 설치크기: ...' → (specs{키:값}, tags[토큰])
    상품 상세의 meta Description, 검색결과의 spec_list 둘 다 같은 포맷이라 공용 사용.

    H-57: 필드 구분자는 항상 ' / '(공백 패딩)인데, 값 자체에도 '/'가 들어간다
    (설치크기 '본체 A / 전실 B', 구성품 '이너텐트 / 폴', 색상 '카키/탄' 등).
    bare '/'로 split하면 이런 값이 잘려 설치크기 등 핵심 스펙이 손상됨. 대책:
      ① 필드 경계인 ' / '(공백 패딩)로만 분리 → 값 내부의 공백 없는 '/'(10D/15D)는 보존.
      ② 분리 후 콜론 없는 조각은, 이미 'key:값'을 본 뒤라면(태그 구간 종료) 직전 값의
         연속('/'가 공백과 함께 든 값)으로 직전 값에 다시 합침.
    """
    specs, tags = {}, []
    last_key = None
    seen_kv = False   # 첫 'key:값' 이후엔 콜론 없는 조각 = 값의 연속(태그 아님)
    for part in re.split(r"\s+/\s+", s):
        p = part.strip()
        if not p or p.startswith("["):   # [본체] [크기] 섹션 헤더 무시
            continue
        if ":" in p:
            k, v = p.split(":", 1)
            k = k.strip()
            specs[k] = v.strip()
            last_key, seen_kv = k, True
        elif seen_kv and last_key is not None:
            specs[last_key] = f"{specs[last_key]} / {p}"   # 값 내부 '/'로 잘린 조각 복원
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
