#!/usr/bin/env python3
"""백패킹 가방 카테고리 스캐폴드 시드 빌더.

다나와 검색결과(인기순)에서 백패킹/등산 배낭을 긁어
용량(L) 단일 메트릭으로 site/data/backpacking-bag.json 생성 + manifest 갱신.

- 무게(g)는 다나와에 없음 → 별점은 용량(L) 단일 (정직: 측정값만).
- 스캐폴드/소량 시드 (~30개). 이미지는 후속 단계.
"""
import os, re, sys, json, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import danawa as D

ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "site", "data")
SLUG = "backpacking-bag"
LABEL = "백패킹 가방"

# 알려진 정식 브랜드 (이름 앞부분 매칭 → 브랜드/모델 분리). 추측 금지: 매칭 안 되면 첫 토큰.
# 확실한 정식 브랜드만 (오매칭 유발 토큰 제거). 이름 '앞부분'에서만 매칭.
BRANDS = [
    "오스프리", "그레고리", "도이터", "데우터", "밀레", "블랙야크", "네이처하이크",
    "노스페이스", "아크테릭스", "살로몬", "컬럼비아", "피엘라벤", "코오롱스포츠", "코오롱",
    "마무트", "라푸마", "카리모어", "버그하우스", "몬테인", "디스커버리", "머렐",
    "바우데", "켈티", "미스터리랜치", "그래니트기어", "K2", "몽벨", "써미트",
    "마운틴하드웨어", "하이퍼라이트", "엑스페드", "씨투써밋", "씨투서밋", "제로그램",
    "네파", "잭울프스킨", "이스트팩", "프로스펙스", "퀘차", "포클라즈", "마운틴이큅먼트",
    "오르트립", "오르틀립", "랩",
]
BRANDS = list(dict.fromkeys(BRANDS))
MIN_L = 20  # 백패킹 가방 용량 하한 (데이팩 제외)
# 제외: 비(非)백패킹/잡상품/해외직구 중복/유통상
EXCLUDE = ("해외", "오너클랜", "캐리어", "여행가방", "보조가방", "파우치", "정리함",
           "커버", "레인커버", "방수커버", "스트랩", "버클", "교체", "부품", "악세사리",
           "악세서리", "노트북", "서류", "비즈니스", "크로스백", "슬링", "힙색", "메신저",
           "밀리터리", "전술", "군용", "생존", "벌키", "더플", "수납", "방수백", "드라이백")


def fetch(query, page):
    url = ("https://search.danawa.com/dsearch.php?query=" + urllib.parse.quote(query) +
           f"&page={page}&limit=40&sort=saveDESC")
    return D.http_get(url, referer="https://www.danawa.com/", timeout=25)


def fetch_bytes(url, timeout=20):
    """이미지 등 바이너리 GET — http_get은 utf-8 디코딩이라 부적합."""
    import urllib.request
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Referer": "https://search.danawa.com/",
        "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def parse_results(html):
    out = []
    parts = re.split(r'id="productItem(\d+)"', html)
    for i in range(1, len(parts) - 1, 2):
        pcode, block = parts[i], parts[i + 1]
        nm = re.search(r'class="prod_name"[^>]*>\s*<a[^>]*>(.*?)</a>', block, re.S)
        name = re.sub(r'<[^>]*>', '', nm.group(1)).strip() if nm else None
        sp = re.search(r'class="spec_list"[^>]*>(.*?)</div>', block, re.S)
        spec_text = re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', sp.group(1))).strip() if sp else ""
        pr = re.search(r'class="price_sect[^"]*"[^>]*>.*?<strong[^>]*>([\d,]{4,})', block, re.S)
        price = int(pr.group(1).replace(",", "")) if pr else None
        im = re.search(r'class="thumb_image"[^>]*>\s*<a[^>]*>\s*<img[^>]+(?:data-original|src)="([^"]+)"', block, re.I)
        if not im:
            im = re.search(r'<img[^>]+(?:data-original|src)="(https://img\.danuri\.io/[^"]+\.(?:jpg|png)[^"]*)"', block, re.I)
        img_url = im.group(1) if im else None
        if img_url and img_url.startswith("//"):
            img_url = "https:" + img_url
        if name:
            out.append({"pcode": pcode, "name": name, "spec": spec_text, "price": price, "img_url": img_url})
    return out


def capacity_of(name, spec):
    """용량(L) 추출. '60L+5L'→60, 검색결과 spec/이름 둘 다 확인. 5~120L만 유효."""
    for s in (spec, name):
        m = re.search(r'(\d{1,3})\s*L\b', s)
        if m:
            v = int(m.group(1))
            if MIN_L <= v <= 120:
                return v
    return None


def split_brand(name):
    # 브랜드는 이름 '앞부분(<=10자)'에서만 매칭 — 중간 우연매칭(키즈/ME 등) 방지.
    for b in BRANDS:
        idx = name.find(b)
        if 0 <= idx <= 10:
            model = name.replace(b, "", 1)
            model = re.sub(r'^\s*\([^)]*\)\s*', '', model).strip(" -·/")
            model = re.sub(r'\s+', ' ', model).strip()
            return b, (model or name)
    toks = name.split()
    return toks[0], " ".join(toks[1:]) if len(toks) > 1 else name


def stars_from(v, lo, hi):
    if hi <= lo:
        return 3.0
    s = 1 + 4 * (v - lo) / (hi - lo)
    return round(s * 2) / 2  # 0.5 단위


def main():
    # 일반 쿼리 + 브랜드별 쿼리로 커버리지 대폭 확대
    generic = ["백패킹 배낭", "등산 배낭", "대용량 배낭", "백패킹 백팩", "등산 백팩",
               "트레킹 배낭", "하이킹 배낭", "초경량 배낭", "산행 배낭"]
    brand_q = [f"{b} 배낭" for b in
               ["오스프리", "그레고리", "도이터", "밀레", "블랙야크", "네이처하이크",
                "노스페이스", "아크테릭스", "살로몬", "컬럼비아", "피엘라벤", "마무트",
                "라푸마", "코오롱", "버그하우스", "써미트"]]
    queries = generic + brand_q
    MAXPAGES = 5
    raw, seen_pcode = [], set()
    for q in queries:
        for p in range(1, MAXPAGES + 1):
            try:
                rows = parse_results(fetch(q, p))
            except Exception as e:
                print(f"  ! {q} p{p}: {e}")
                break
            if not rows:
                break
            # pcode 기준 전역 dedup (쿼리 간 중복 제거)
            fresh = [r for r in rows if r["pcode"] not in seen_pcode]
            for r in fresh:
                seen_pcode.add(r["pcode"])
            raw += fresh
            D.polite_sleep(0.6, 1.0)
        print(f"  [{q}] 누적 raw {len(raw)}")
    print(f"수집 raw {len(raw)}개 (고유 pcode)")

    seen, models = set(), []
    for r in raw:
        nm = r["name"]
        if any(x in nm for x in EXCLUDE):
            continue
        cap = capacity_of(nm, r["spec"])
        if cap is None:
            continue
        brand, model = split_brand(nm)
        known = brand in BRANDS
        # 무명(브랜드가 숫자/용량 토큰) 제외 — 정식 브랜드만 (정직 큐레이션)
        if not known:
            continue
        # 가격 가드: 정식 백패킹 배낭이 1.5만원 미만은 부속/오파싱 → 제외(가성비 오염 방지)
        if r["price"] is not None and r["price"] < 15000:
            continue
        key = (brand, model[:20], cap)
        if key in seen:
            continue
        seen.add(key)
        models.append({"brand": brand, "model": model, "cap_l": cap,
                       "price": r["price"], "pcode": r["pcode"], "img_url": r.get("img_url")})

    # 정식 브랜드만 남김 → 용량 큰 순 (상한 없음, 전량)
    models.sort(key=lambda m: -m["cap_l"])
    caps = [m["cap_l"] for m in models]
    lo, hi = min(caps), max(caps)
    print(f"필터 후 {len(models)}개 (용량 {lo}~{hi}L)")

    # 이미지 다운로드 — site/images/<pcode>.jpg (멱등: 있으면 스킵)
    imgdir = os.path.join(ROOT, "site", "images")
    os.makedirs(imgdir, exist_ok=True)
    got = skip = fail = 0
    for m in models:
        dest = os.path.join(imgdir, f"{m['pcode']}.jpg")
        if os.path.exists(dest):
            m["img"] = f"images/{m['pcode']}.jpg"; skip += 1; continue
        if not m.get("img_url"):
            m["img"] = ""; fail += 1; continue
        try:
            data_bytes = fetch_bytes(m["img_url"])
            if not data_bytes or len(data_bytes) < 800:
                m["img"] = ""; fail += 1; continue
            with open(dest, "wb") as f:
                f.write(data_bytes)
            m["img"] = f"images/{m['pcode']}.jpg"; got += 1
            D.polite_sleep(0.2, 0.4)
        except Exception:
            m["img"] = ""; fail += 1
    print(f"이미지: 신규 {got} / 기존 {skip} / 실패 {fail}")

    out_models = []
    for m in models:
        out_models.append({
            "brand": m["brand"], "model": m["model"],
            "capacity": None, "variants": 1,
            "price_min": m["price"], "price_max": m["price"],
            "img": m.get("img", ""),
            "specs": {
                "capacity_l": {"value": float(m["cap_l"]),
                                "stars": stars_from(m["cap_l"], lo, hi), "badge": "참고"}
            },
        })

    metrics = [{
        "key": "capacity_l", "label": "용량", "unit": "L",
        "direction": "higher_better", "is_star": True, "fill": 100, "limit": False,
    }]
    data = {
        "name": LABEL, "slug": SLUG, "grade": "🔴 C",
        "count": len(out_models), "verified": len(out_models),
        "metrics": metrics, "models": out_models,
    }
    path = os.path.join(DATA, f"{SLUG}.json")
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"저장: {path}")

    # manifest 갱신
    mpath = os.path.join(DATA, "manifest.json")
    man = json.load(open(mpath))
    man["categories"] = [c for c in man["categories"] if c["slug"] != SLUG]
    man["categories"].append({
        "slug": SLUG, "name": LABEL, "grade": "🔴 C",
        "count": len(out_models), "verified": len(out_models),
        "star_metrics": ["용량"], "limits": ["용량"],
    })
    json.dump(man, open(mpath, "w"), ensure_ascii=False, indent=2)
    print(f"manifest 갱신: +{SLUG}")
    print("\n샘플 5:")
    for m in out_models[:5]:
        print(f"  {m['brand']} {m['model'][:30]} | {int(m['specs']['capacity_l']['value'])}L ★{m['specs']['capacity_l']['stars']} | {m['price_min']}원")


if __name__ == "__main__":
    main()
