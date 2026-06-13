#!/usr/bin/env python3
"""캠핑용품 DB 수집 파이프라인 (다나와 → 정규화 → SQLite)

카테고리 무관 확장형: SPEC_MAP에 카테고리별 매핑만 추가하면 새 품목 지원.
가격: 네이버쇼핑은 봇차단(418) → 다나와 최저가 사용(절반은 '없음' → 플래그).

사용: python3 pipeline/pipeline.py
의존성: 표준 라이브러리만
"""
import argparse
import csv
import os
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import normalize as N
import danawa as D

FN = {"weight": N.parse_weight, "water": N.parse_water_head, "vol": N.packed_volume_cm3,
      "temp": N.parse_temp, "num": N.parse_number}

# 카테고리별 매핑: 다나와 키(부분일치) → 메트릭. derive=특수파생.
SPEC_MAP = {
    "백패킹텐트": [
        {"metric": "weight_min", "keys": ["무게"], "fn": "weight", "conf": "high"},
        {"metric": "water_head", "keys": ["내수압"], "fn": "water", "conf": "auto"},
        {"metric": "floor_area", "keys": ["설치크기", "크기", "사이즈"], "exclude": ["수납"], "derive": "floor", "conf": "medium"},
        {"metric": "packed_volume", "keys": ["수납크기"], "fn": "vol", "conf": "medium"},
    ],
    "침낭": [
        {"metric": "weight_min", "keys": ["무게"], "fn": "weight", "conf": "high"},
        {"metric": "comfort_temp", "keys": ["내한온도", "사용가능온도", "사용온도", "최저온도", "한계온도"], "fn": "temp", "conf": "high"},
        {"metric": "fill_weight", "keys": ["충전량"], "fn": "num", "conf": "high"},
        {"metric": "packed_volume", "keys": ["수납크기"], "fn": "vol", "conf": "medium"},
    ],
    "매트": [
        {"metric": "weight_min", "keys": ["무게"], "fn": "weight", "conf": "high"},
        {"metric": "thickness", "keys": ["크기", "사이즈"], "derive": "thickness", "conf": "medium"},
        {"metric": "r_value", "keys": ["r값", "r-value", "r 값"], "fn": "num", "conf": "high"},
        {"metric": "packed_volume", "keys": ["수납크기"], "fn": "vol", "conf": "medium"},
    ],
}
REQUIRED = {
    "백패킹텐트": ["weight_min", "water_head", "floor_area"],
    "침낭": ["weight_min", "comfort_temp"],
    "매트": ["weight_min", "thickness", "r_value"],
}


def build_db(db_path):
    # M-205: 기존 DB를 os.remove로 지운 뒤 schema/reference를 여는데, 그 파일이 없으면 DB는 이미
    #   삭제된 채 FileNotFoundError로 죽어 '빈 DB만 남는' 데이터 소실이 된다 → 삭제 전에 먼저 검증.
    required = [os.path.join(ROOT, "schema.sql"), os.path.join(HERE, "reference.sql")]
    missing = [p for p in required if not os.path.exists(p)]
    if missing:
        raise FileNotFoundError(f"build_db 필수 파일 없음 → {missing} (기존 DB 보존, 재생성 중단)")
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    # M-401: with로 핸들 확실히 닫음(executescript 예외 시 핸들 누출 방지).
    with open(os.path.join(ROOT, "schema.sql"), encoding="utf-8") as f:
        con.executescript(f.read())
    with open(os.path.join(HERE, "reference.sql"), encoding="utf-8") as f:
        con.executescript(f.read())
    con.commit()
    return con


def metric_id(con, cid, key):
    r = con.execute("SELECT id FROM metrics WHERE category_id=? AND key=?", (cid, key)).fetchone()
    return r[0] if r else None


def category_id(con, name):
    r = con.execute("SELECT id FROM categories WHERE name_ko=?", (name,)).fetchone()
    return r[0] if r else None


def find_spec(specs, keys, exclude=None):
    """specs 의 키 중 keys 부분문자열과 매칭되는 첫 값. exclude 포함 키는 건너뜀.
    예: floor_area는 '설치크기'를 원하지만 '수납크기'도 '크기'를 포함하므로 exclude=['수납']."""
    exclude = exclude or []
    for k, v in specs.items():
        kl = k.lower()
        if any(x in k for x in exclude):
            continue
        if any(s.lower() in kl for s in keys):
            return v
    return None


def derive_floor(raw):
    if "이너" in raw:
        import re
        m = re.search(r"이너[^0-9]*([\d.]+\s*[x×*]\s*[\d.]+)", raw)
        if m:
            raw = m.group(1)
    return N.floor_area_m2(dims_cm=N.parse_dims_cm(raw))


_CAT_CODE = {
    3: "BT", 4: "AT", 5: "SB", 6: "MT", 8: "CH", 9: "LT",
    10: "CL", 11: "BN", 12: "TP", 13: "TB", 14: "CT",
    15: "CW", 16: "WG", 17: "FP", 18: "PB", 19: "SH", 20: "MS",
}


def _assign_gf_code(con, pid, cid):
    """신규 상품에 gf_code 부여 (이미 있으면 skip).

    H-123: COUNT 기반 seq + 사전 SELECT 체크만으론, 두 프로세스가 같은 COUNT를 읽고 서로의
      미커밋 행을 못 본 채 동일 gf_code를 커밋하면 중복이 성립한다(UNIQUE 제약 없음, TOCTOU).
      → (1) gf_code에 UNIQUE 인덱스를 보장(NULL은 SQLite에서 서로 distinct라 pending 다수 허용),
        (2) UPDATE가 UNIQUE 위반이면 seq를 올려 재시도 → 동시 실행에도 중복 발급 불가."""
    if con.execute("SELECT gf_code FROM products WHERE id=?", (pid,)).fetchone()[0]:
        return
    try:
        con.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_gf_code ON products(gf_code)")
    except (sqlite3.IntegrityError, sqlite3.OperationalError):
        pass  # 기존 데이터에 중복 gf_code가 있으면 인덱스 생성 불가 — 재시도 로직으로 best-effort
    code = _CAT_CODE.get(cid, "XX")
    seq = con.execute(
        "SELECT COUNT(*) FROM products WHERE category_id=? AND gf_code IS NOT NULL", (cid,)
    ).fetchone()[0] + 1
    while True:
        gf = f"GF-{code}-{seq:05d}"
        if con.execute("SELECT 1 FROM products WHERE gf_code=?", (gf,)).fetchone():
            seq += 1
            continue
        try:
            con.execute("UPDATE products SET gf_code=? WHERE id=?", (gf, pid))
            break
        except sqlite3.IntegrityError:   # 동시 프로세스가 같은 gf를 선점 → 다음 seq로 재시도
            seq += 1


def flag(con, pid, mid, ftype, note):
    con.execute("INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note) VALUES(?,?,?,?)",
                (pid, mid, ftype, note))


def ingest_row(con, row):
    con.execute("INSERT OR IGNORE INTO brands(name_ko,name_en,country,tier) VALUES(?,?,?,?)",
                (row["brand_ko"], row["brand_en"], row["country"], row["tier"]))
    bid = con.execute("SELECT id FROM brands WHERE name_ko=?", (row["brand_ko"],)).fetchone()[0]
    cid = category_id(con, row["category"])
    cap = int(row["capacity"]) if row["capacity"] else None
    yr = int(row["model_year"]) if row["model_year"] else None
    con.execute("""INSERT OR IGNORE INTO products
        (brand_id,category_id,model_name,model_year,variant,capacity,danawa_pcode,curation_status,sale_status)
        VALUES(?,?,?,?,?,?,?, 'verified','on_sale')""",
        (bid, cid, row["model_name"], yr, row["variant"], cap, row["danawa_pcode"]))
    pid = con.execute("""SELECT id FROM products WHERE brand_id=? AND model_name=?
        AND IFNULL(model_year,-1)=IFNULL(?,-1) AND IFNULL(variant,'')=IFNULL(?,'')""",
        (bid, row["model_name"], yr, row["variant"])).fetchone()[0]
    _assign_gf_code(con, pid, cid)

    try:
        html = D.fetch(row["danawa_pcode"])
        parsed = D.parse(html)
        price = D.parse_price(html)
    except Exception as e:
        flag(con, pid, None, "needs_review", f"다나와 수집 실패: {e}")
        return {"error": str(e)}
    specs, tags = parsed["specs"], parsed["tags"]
    clean = [t for t in tags if len(t) <= 12]

    # 카테고리/인원 불일치
    import re
    bad = [t for t in clean if any(x in t for x in ("그늘막", "쉘터", "비치", "피크닉"))]
    if bad and row["category"] == "백패킹텐트":
        flag(con, pid, None, "category_mismatch", f"다나와 태그 {bad} ↔ '백패킹텐트' (수동분류)")
    captag = next((re.search(r"(\d+)인용", t).group(1) for t in clean if re.search(r"\d+인용", t)), None)
    if captag and cap and int(captag) != cap:
        flag(con, pid, None, "needs_review", f"다나와 {captag}인용 ↔ 화이트 {cap}인용 불일치")

    # 스펙 매핑
    got = set()
    for spec in SPEC_MAP.get(row["category"], []):
        raw = find_spec(specs, spec["keys"], spec.get("exclude"))
        if not raw:
            continue
        if spec.get("derive") == "floor":
            val = derive_floor(raw)
        elif spec.get("derive") == "thickness":
            val = N.thickness_mm(raw)
        else:
            val = FN[spec["fn"]](raw)
        if val is None:
            continue
        conf = spec["conf"]
        if conf == "auto":
            conf = "medium" if "~" in raw else "high"
        con.execute("""INSERT INTO product_spec_values
            (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary)
            VALUES(?,?,?,?,?,1,?,1)""", (pid, metric_id(con, cid, spec["metric"]), val, raw, "norm", conf))
        got.add(spec["metric"])

    for key in REQUIRED.get(row["category"], []):
        if key not in got:
            flag(con, pid, metric_id(con, cid, key), "missing", f"다나와에 {key} 미표기")

    # 가격 (시계열)
    if price:
        con.execute("INSERT INTO price_observations(product_id,price_krw,seller,channel) VALUES(?,?,?,?)",
                    (pid, price, "다나와최저가", "danawa"))
    else:
        flag(con, pid, None, "missing", "다나와 최저가 없음(판매중지/품절) → 가격 보강 필요")

    return {"got": sorted(got), "price": price}


# 핸드헬드(점광원) 키워드 — 소문자 비교. EDC/펜/키체인 손전등 포함.
_HANDHELD_KW = ("헤드", "손전등", "후레쉬", "플래시", "플래쉬", "헤드램프", "헤드랜턴",
                "키체인", "edc", "pen", "펜라이트", "zoom")


def _form_segment(con, cid, name):
    """랜턴 광원형태 세그먼트: 면조명 랜턴 vs 핸드헬드(손전등/헤드랜턴/EDC/펜/키체인).
    점광원 밝기는 면조명과 비교축이 달라 같은 풀서 랭킹하면 불공정 → 분리(제외 아님).
    랜턴 외 카테고리는 항상 'main'(스코프 불변)."""
    cat = con.execute("SELECT name_ko FROM categories WHERE id=?", (cid,)).fetchone()
    if cat and cat[0] == "랜턴" and name and any(k in name.lower() for k in _HANDHELD_KW):
        return "handheld"
    return "main"


def recompute_ratings(con):
    """카테고리 × 인원 × (랜턴은 광원형태) 세그먼트 안에서 min-max → 별점(1~5, 0.5단위)."""
    con.execute("DELETE FROM ratings")
    # 비교 모집단 = verified(브랜드+완비) 카탈로그만. pending(미완)·rejected(노네임)는
    #   percentile 분모서 제외 — '브랜드만 비교' 원칙. (분모에 노네임 섞이면 순위 오염)
    groups = con.execute("""SELECT DISTINCT category_id, IFNULL(capacity,-1)
        FROM products WHERE curation_status='verified'""").fetchall()
    for cid, cap in groups:
        base = f"category:{cid}|cap:{cap}"
        for mid, direction in con.execute("SELECT id,direction FROM metrics WHERE category_id=? AND is_star_metric=1", (cid,)):
            rows = con.execute("""SELECT psv.product_id, psv.value_normalized, p.model_name,
                       p.brand_id, p.canonical_model
                FROM product_spec_values psv JOIN products p ON p.id=psv.product_id
                WHERE psv.metric_id=? AND p.category_id=? AND IFNULL(p.capacity,-1)=?
                  AND p.curation_status='verified'
                  AND psv.is_primary=1 AND IFNULL(psv.valid,1)=1
                  AND IFNULL(psv.star_eligible,1)=1
                  AND psv.value_normalized IS NOT NULL""", (mid, cid, cap)).fetchall()
            # 광원형태 세그먼트로 분할(랜턴만 실효, 그 외 전부 'main')
            segs = {}
            for pid, v, name, bid, canon in rows:
                segs.setdefault(_form_segment(con, cid, name), []).append((pid, v, bid, canon))
            for seg, srows in segs.items():
                scope = base if seg == "main" else f"{base}|seg:{seg}"
                # 모집단 = canonical 단위(색상/구매처 변형 중복 제거). 순위백분위가 N에
                #   의존하므로 변형중복이 분모를 부풀리면 별점이 왜곡됨 → 모델 1표로 집계 후
                #   대표 별점을 그 모델의 전 변형에 전파.
                #   키에 값 포함: 값이 같은 변형만 합치고, 변형간 값이 genuine하게 다르면
                #   각 값이 독립 모집단 entry가 되어 제값으로 채점(임의 대표값 편향 방지).
                cgroups = {}
                for pid, v, bid, canon in srows:
                    cgroups.setdefault((bid, canon, round(v, 6)), []).append((pid, v))
                keys = list(cgroups.keys())
                N = len(keys)
                if N < 2:
                    continue
                # 순위백분위: outlier에 강건. 동점은 평균순위로 동일 percentile. 중앙값=0.5=★3.
                repval = [cgroups[k][0][1] for k in keys]
                good = [(repval[i] if direction == "higher_better" else -repval[i]) for i in range(N)]
                order = sorted(range(N), key=lambda i: good[i])
                ranks = [0.0] * N
                i = 0
                while i < N:
                    j = i
                    while j + 1 < N and good[order[j + 1]] == good[order[i]]:
                        j += 1
                    avg_rank = (i + 1 + j + 1) / 2.0   # 1-based 평균순위(동점 묶음)
                    for k in range(i, j + 1):
                        ranks[order[k]] = avg_rank
                    i = j + 1
                for idx, key in enumerate(keys):
                    pct = (ranks[idx] - 1) / (N - 1) if N > 1 else 0.5
                    stars = round((1 + 4 * pct) * 2) / 2.0
                    for pid, v in cgroups[key]:   # 모델의 전 변형에 대표 별점 전파
                        con.execute("""INSERT OR REPLACE INTO ratings
                            (product_id,metric_id,stars,percentile,comparison_scope) VALUES(?,?,?,?,?)""",
                            (pid, mid, stars, pct, scope))


def print_metric(con, title, category_name, metric_key):
    rows = con.execute("""
        SELECT br.name_ko, p.model_name, p.capacity, mt.unit, psv.value_normalized, r.stars
        FROM ratings r
        JOIN metrics mt ON mt.id=r.metric_id AND mt.key=?
        JOIN categories c ON c.id=mt.category_id AND c.name_ko=?
        JOIN products p ON p.id=r.product_id JOIN brands br ON br.id=p.brand_id
        JOIN product_spec_values psv ON psv.product_id=p.id AND psv.metric_id=r.metric_id
        ORDER BY p.capacity, r.stars DESC, psv.value_normalized""", (metric_key, category_name)).fetchall()
    if not rows:
        return
    print(f"\n[{title}]")
    for b, mn, cap, unit, val, s in rows:
        bar = "★" * int(s) + ("½" if s % 1 else "")
        seg = f"{cap}인 " if cap else ""
        print(f"   {bar:<6} {s:>3}  {seg}{b} {mn}  ({val:g}{unit})")


def report(con):
    print("\n" + "=" * 66)
    print("수집 결과 리포트")
    print("=" * 66)
    for label, q in [("제품", "SELECT COUNT(*) FROM products"),
                     ("스펙값", "SELECT COUNT(*) FROM product_spec_values"),
                     ("가격관측", "SELECT COUNT(*) FROM price_observations"),
                     ("품질플래그", "SELECT COUNT(*) FROM data_quality_flags")]:
        print(f"  {label}: {con.execute(q).fetchone()[0]}", end="   ")
    print()
    print_metric(con, "백패킹텐트 · 무게(가벼울수록 ★)", "백패킹텐트", "weight_min")
    print_metric(con, "침낭 · 내한온도(따뜻할수록 ★)", "침낭", "comfort_temp")
    print_metric(con, "매트 · 두께(두꺼울수록 ★, 인원별)", "매트", "thickness")

    print("\n[가격] 다나와 최저가 수집 현황 (최약 데이터)")
    for b, mn, cat, pr in con.execute("""
        SELECT br.name_ko, p.model_name, c.name_ko,
          (SELECT price_krw FROM price_observations po WHERE po.product_id=p.id ORDER BY observed_at DESC LIMIT 1)
        FROM products p JOIN brands br ON br.id=p.brand_id JOIN categories c ON c.id=p.category_id
        ORDER BY c.id, p.id"""):
        print(f"   {('%9s원' % format(pr, ',')) if pr else '     없음':>11}  [{cat}] {b} {mn}")

    print("\n[품질 플래그 요약]")
    for ft, c in con.execute("SELECT flag_type,COUNT(*) FROM data_quality_flags GROUP BY flag_type ORDER BY 2 DESC"):
        print(f"   {ft}: {c}건")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_auto.db"))
    args = ap.parse_args()
    con = build_db(args.db)
    rows = list(csv.DictReader(open(os.path.join(HERE, "whitelist.csv"), encoding="utf-8")))
    print(f"화이트리스트 {len(rows)}개 수집 시작...")
    for row in rows:
        info = ingest_row(con, row)
        tag = "✓" if "error" not in info else "✗"
        print(f"  {tag} [{row['category']}] {row['brand_ko']} {row['model_name']} → {info}")
        time.sleep(0.4)  # 다나와 rate-limit 회피
    con.commit()
    recompute_ratings(con)
    con.commit()
    report(con)
    con.close()
    print(f"\nDB 저장: {args.db}")


if __name__ == "__main__":
    main()
