#!/usr/bin/env python3
"""텐트 대량 수확기 — 다나와 검색결과(dsearch)에서 pcode+스펙+가격을 인라인 수집.

발견: dsearch 페이지는 서버렌더 → 한 페이지(40개)에 pcode/이름/spec_list/가격이 모두 있음.
→ 개별 상품 500회 요청 불필요. ~13페이지로 500종 수확 (차단위험·시간 대폭 절감).

화이트리스트(사람 큐레이션)와 다른 '대량 후보 수집' 모드.
수집된 제품은 curation_status='pending' (=미검증 후보). 사람이 나중에 verified 승격.

사용: python3 pipeline/harvest_tents.py [--target 500] [--db camping_tents500.db]
"""
import argparse
import os
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize as N
import danawa as D
import pipeline as P

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

# 텐트 카테고리 공용 스펙 매핑 (다나와 키 → 메트릭)
TENT_MAP = [
    {"metric": "weight_min", "keys": ["무게"], "fn": "weight", "conf": "high"},
    {"metric": "water_head", "keys": ["내수압"], "fn": "water", "conf": "auto"},
    {"metric": "floor_area", "keys": ["설치크기", "크기", "사이즈"], "exclude": ["수납"], "derive": "floor", "conf": "medium"},
    {"metric": "packed_volume", "keys": ["수납크기"], "fn": "vol", "conf": "medium"},
]
REQ = ["weight_min", "water_head", "floor_area"]


def fetch_page(query, page):
    url = ("https://search.danawa.com/dsearch.php?query=" + urllib.parse.quote(query) +
           f"&page={page}&limit=40&sort=saveDESC")
    D.robots_advisory(url)   # 호스트당 1회 robots 허용여부·Crawl-delay 출력
    # 공용 HTTP 계층(헤더·세션쿠키·백오프) 사용. 메인에서 검색 들어온 것처럼 Referer 부여.
    return D.http_get(url, referer="https://www.danawa.com/", timeout=25)


def parse_results(html):
    """검색결과 HTML → [{pcode,name,spec_text,price}] (광고/부속 제외)."""
    out = []
    parts = re.split(r'id="productItem(\d+)"', html)
    # parts = [pre, pcode, block, pcode, block, ...]
    for i in range(1, len(parts) - 1, 2):
        pcode, block = parts[i], parts[i + 1]
        nm = re.search(r'class="prod_name"[^>]*>\s*<a[^>]*>(.*?)</a>', block, re.S)
        name = re.sub(r'<[^>]*>', '', nm.group(1)).strip() if nm else None
        sp = re.search(r'class="spec_list"[^>]*>(.*?)</div>', block, re.S)
        # <[^>]*> : 여러 줄에 걸친 태그까지 안전하게 제거 (<.*?> 는 멀티라인 누락)
        spec_text = re.sub(r'<[^>]*>', ' ', sp.group(1)) if sp else ""
        spec_text = re.sub(r'\s+', ' ', spec_text).strip()
        pr = re.search(r'class="price_sect[^"]*"[^>]*>.*?<strong[^>]*>([\d,]{4,})', block, re.S)
        price = int(pr.group(1).replace(",", "")) if pr else None
        if not name:
            continue
        out.append({"pcode": pcode, "name": name, "spec_text": spec_text, "price": price})
    return out


def classify(tags, name):
    t = " ".join(tags) + " " + name
    if any(x in t for x in ("TPU창", "샤워", "윈드 스크린", "윈드스크린")):
        return "기타용품"        # 텐트 아닌 부속
    if any(x in t for x in ("그늘막", "쉐이드", "선쉐", "어반쉐")):
        return "쉘터"            # 그늘막/선쉐이드
    if "백패킹" in t:
        return "백패킹텐트"
    return "오토캠핑텐트"   # 오토캠핑/편의형/대형 등 미분류 기본값


PART_WORDS = ("이너용", "루프플라이", "야전침대용품", "풋프린트", "그라운드시트",
              "폴대", "타프", "플라이시트", "부속", "전용가방", "스키드")


def is_tent(tags, name):
    t = " ".join(tags) + " " + name
    if any(x in t for x in PART_WORDS):   # 부속/이너/플라이 제외
        return False
    if "텐트" in t:
        return True
    return any(x in t for x in ("쉘터", "타프쉘", "돔", "터널"))


def fix_brand(brand, model):
    """복합 브랜드명 오분리 교정. toks[0]=브랜드 휴리스틱이 다어절 브랜드를 깨는 케이스만 정확매칭.
    예: '레드렌서(LED LENSER) → brand=LED' 오분리 → 레드렌서로 교정(적대루프9: 화이트리스트 우연배제 해소).
    refresh/harvest/multicat 공용. 확실한 케이스만(추측 금지)."""
    toks = model.split()
    # 'LED LENSER 레드렌서 X' : brand='LED', model='LENSER 레드렌서 X' → brand='레드렌서', model='X'
    if brand == "LED" and toks and toks[0] == "LENSER":
        rest = toks[1:]
        if rest and rest[0] == "레드렌서":
            rest = rest[1:]
        return "레드렌서", (" ".join(rest) if rest else model)
    return brand, model


def ingest(con, cand, seen_names):
    specs, tags = D.parse_spec_string(cand["spec_text"])
    if not is_tent(tags, cand["name"]):
        return "skip_nontent"
    cat = classify(tags, cand["name"])
    cid = P.category_id(con, cat)
    cap_m = re.search(r"(\d+)인용", " ".join(tags))
    cap = int(cap_m.group(1)) if cap_m else None
    toks = cand["name"].split()
    brand = toks[0]
    model = " ".join(toks[1:]) if len(toks) > 1 else cand["name"]  # 모델명서 브랜드 중복 제거
    brand, model = fix_brand(brand, model)
    if model in seen_names:
        return "dup_name"
    seen_names.add(model)

    con.execute("INSERT OR IGNORE INTO brands(name_ko) VALUES(?)", (brand,))
    bid = con.execute("SELECT id FROM brands WHERE name_ko=?", (brand,)).fetchone()[0]
    # H-79: 신규 INSERT된 행의 pid를 IS NULL SELECT 매칭에만 의존하면, INSERT가 model_year/variant를
    #       세팅하지 않는 것과 WHERE의 `model_year IS NULL AND variant IS NULL` 사이의 취약한 결합으로
    #       pid 회수에 실패할 수 있다(이후 specs/price 연결 INSERT가 통째로 누락 → 고아 행).
    #       실제로 삽입됐으면 lastrowid로 직접 회수(항상 유효), IGNORE(이미 존재)된 경우에만 SELECT 폴백.
    cur = con.execute("""INSERT OR IGNORE INTO products
        (brand_id,category_id,model_name,capacity,danawa_pcode,curation_status,sale_status)
        VALUES(?,?,?,?,?, 'pending','on_sale')""", (bid, cid, model, cap, cand["pcode"]))
    if cur.rowcount:
        pid = cur.lastrowid
    else:
        row = con.execute("SELECT id FROM products WHERE brand_id=? AND model_name=? "
                          "AND model_year IS NULL AND variant IS NULL", (bid, model)).fetchone()
        if row is None:
            return "dup_variant"
        pid = row[0]

    got = set()
    for spec in TENT_MAP:
        raw = P.find_spec(specs, spec["keys"], spec.get("exclude"))
        if not raw:
            continue
        if spec.get("derive") == "floor":
            val = P.derive_floor(raw)
        else:
            val = P.FN[spec["fn"]](raw)
        if val is None:
            continue
        conf = spec["conf"]
        if conf == "auto":
            conf = "medium" if "~" in raw else "high"
        con.execute("""INSERT INTO product_spec_values
            (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary)
            VALUES(?,?,?,?,?,1,?,1)""", (pid, P.metric_id(con, cid, spec["metric"]), val, raw, "norm", conf))
        got.add(spec["metric"])

    for key in REQ:
        if key not in got:
            P.flag(con, pid, P.metric_id(con, cid, key), "missing", f"{key} 미표기(검색수확)")
    if cand["price"]:
        con.execute("INSERT INTO price_observations(product_id,price_krw,seller,channel) VALUES(?,?,?,?)",
                    (pid, cand["price"], "다나와최저가", "danawa_search"))
    else:
        P.flag(con, pid, None, "missing", "가격 없음")
    return "ok"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", type=int, default=500)
    ap.add_argument("--queries", default="백패킹텐트,텐트,초경량텐트,돔텐트")
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    ap.add_argument("--maxpages", type=int, default=20)
    ap.add_argument("--append", action="store_true",
                    help="기존 DB에 누적(재생성 안 함). 기존 pcode/모델 자동 dedup")
    args = ap.parse_args()

    if args.append:
        con = sqlite3.connect(args.db)
        seen_pcode = {r[0] for r in con.execute(
            "SELECT danawa_pcode FROM products WHERE danawa_pcode IS NOT NULL")}
        seen_names = {r[0] for r in con.execute("SELECT model_name FROM products")}
        target = 10 ** 9   # append는 카운트 목표 대신 모든 쿼리 소진
        print(f"[append] 기존 {len(seen_pcode)} pcode 로드 → 신규만 추가")
    else:
        con = P.build_db(args.db)
        seen_pcode, seen_names = set(), set()
        target = args.target
    stats = {"ok": 0, "dup_name": 0, "skip_nontent": 0, "dup_pcode": 0}

    for q in args.queries.split(","):
        if stats["ok"] >= target:
            break
        for page in range(1, args.maxpages + 1):
            if stats["ok"] >= target:
                break
            try:
                cands = parse_results(fetch_page(q.strip(), page))
            except Exception as e:
                print(f"  ! fetch fail q={q} p={page}: {e}")
                break
            if not cands:
                break
            new = 0
            for c in cands:
                if c["pcode"] in seen_pcode:
                    stats["dup_pcode"] += 1
                    continue
                seen_pcode.add(c["pcode"])
                r = ingest(con, c, seen_names)
                stats[r] = stats.get(r, 0) + 1
                if r == "ok":
                    new += 1
            con.commit()
            print(f"  [{q.strip()} p{page}] +{new}  (누적 ok={stats['ok']})")
            D.polite_sleep(0.8, 1.2)   # 고정 간격 대신 지터(봇 지문 제거 + 서버 정중)

    P.recompute_ratings(con)
    con.commit()
    print(f"\n수확 완료: {stats}")
    report(con)
    con.close()
    print(f"\nDB 저장: {args.db}")


def report(con):
    print("\n" + "=" * 60)
    print("텐트 대량 수확 리포트")
    print("=" * 60)
    print("\n[카테고리 × 데이터 충실도]")
    for cat, n, sp, pr in con.execute("""
        SELECT c.name_ko, COUNT(DISTINCT p.id),
               ROUND(COUNT(psv.id)*1.0/COUNT(DISTINCT p.id),2),
               (SELECT COUNT(DISTINCT product_id) FROM price_observations po
                JOIN products p2 ON p2.id=po.product_id WHERE p2.category_id=c.id)
        FROM products p JOIN categories c ON c.id=p.category_id
        LEFT JOIN product_spec_values psv ON psv.product_id=p.id
        WHERE c.name_ko LIKE '%텐트%' GROUP BY c.id ORDER BY 2 DESC"""):
        print(f"   {cat:<10} 제품 {n:>3}개 / 평균스펙 {sp} / 가격 {pr}개")

    print("\n[백패킹텐트 무게 TOP10 경량 (인원 무관, 참고용)]")
    for b, m, w, s in con.execute("""
        SELECT br.name_ko, p.model_name, psv.value_normalized, r.stars
        FROM ratings r JOIN metrics mt ON mt.id=r.metric_id AND mt.key='weight_min'
        JOIN categories c ON c.id=mt.category_id AND c.name_ko='백패킹텐트'
        JOIN products p ON p.id=r.product_id JOIN brands br ON br.id=p.brand_id
        JOIN product_spec_values psv ON psv.product_id=p.id AND psv.metric_id=r.metric_id
        ORDER BY psv.value_normalized LIMIT 10"""):
        print(f"   {w:>5.0f}g  ★{s}  {p_trunc(b+' '+m)}")

    tot = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    sv = con.execute("SELECT COUNT(*) FROM product_spec_values").fetchone()[0]
    fl = con.execute("SELECT COUNT(*) FROM data_quality_flags").fetchone()[0]
    pc = con.execute("SELECT COUNT(*) FROM price_observations").fetchone()[0]
    print(f"\n총 제품 {tot} / 스펙값 {sv} / 가격 {pc} / 품질플래그 {fl}")
    print("\n[플래그 유형]")
    for ft, c in con.execute("SELECT flag_type,COUNT(*) FROM data_quality_flags GROUP BY flag_type ORDER BY 2 DESC"):
        print(f"   {ft}: {c}")


def p_trunc(s, n=34):
    return s if len(s) <= n else s[:n - 1] + "…"


if __name__ == "__main__":
    main()
