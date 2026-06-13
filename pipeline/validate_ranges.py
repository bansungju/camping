#!/usr/bin/env python3
"""메트릭 타당범위 검증 — 물리적으로 말이 안 되는 값을 이상치로 격리.

대량 수집에서 발견: 비비/해먹형이 바닥면적 0.02㎡로 파싱되는 등 파싱 이상치 발생.
이런 값이 별점 min-max를 왜곡 → 메트릭별 타당범위를 벗어나면 valid=0 + 'implausible' 플래그.
valid=0 값은 별점 계산에서 자동 제외(recompute_ratings).

사용: python3 pipeline/validate_ranges.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pipeline as P

# 하드 범위: 물리적으로 불가능 = 파싱오류. 벗어나면 값 격리(valid=0).
#   "값이 가볍다/작다"가 아니라 "말이 안 된다"만 잡음.
HARD_RANGES = {
    "weight_min":    (100, 70000),    # g
    "water_head":    (200, 30000),    # mm
    "floor_area":    (0.3, 80),       # m2  (실제 텐트 바닥은 0.3㎡ 미만 불가 → 수납크기 오인 격리)
    "packed_volume": (300, 800000),   # cm3
    "comfort_temp":  (-50, 40),       # C
    "fill_weight":   (20, 5000),      # g
    "thickness":     (3, 500),        # mm (에어매트 포함 결정 → 40cm 에어매트 허용, 500 초과만 오류)
    "r_value":       (0.2, 15),       # R
    "brightness":    (1, 5000),       # lm (5000 초과=중국산 과장표기)
    "runtime":       (0.1, 500),      # h (500 초과=헤드램프 최저모드 등 오인)
    "power_output":  (10, 20000),     # 느슨(버너 kcal/파워뱅크 W 단위 다름 → CAT_HARD가 정밀)
    "capacity_l":    (0.1, 500),      # L
    "capacity_mah":  (2000, 600000),  # mAh (보조배터리 최소 ~2000, 1000은 자릿수누락 오기)
    "max_load":      (1, 600),        # kg
}

# 카테고리별 하드 오버라이드: (카테고리,메트릭)→범위 (단위/스케일 다른 곳)
CAT_HARD = {
    ("의자", "weight_min"): (300, 20000),   # 300g 미만=등산스틱/모노포드(의자 아님)
    ("코펠", "capacity_l"): (0.2, 12),       # 코펠 0.2~12L (ml/L 혼입·음수 격리)
    ("아이스박스", "capacity_l"): (1, 250),   # 쿨러 1~250L
    ("버너", "power_output"): (300, 15000),  # kcal
    ("파워뱅크", "power_output"): (50, 8000), # W (파워스테이션 포함)
    ("의자", "max_load"): (20, 400), ("테이블", "max_load"): (2, 200),
    ("야전침대", "max_load"): (40, 400), ("웨건", "max_load"): (10, 400),
    ("매트", "thickness"): (3, 250),   # 매트/에어매트 ≤25cm. 40cm는 에어베드(가정용)→격리
    ("랜턴", "weight_min"): (10, 5000), # 키체인/펜라이트 ~10g ~ 대형충전랜턴 5kg (전역 100g하한 무시)
}
# 소프트 범위: 카테고리 기대치. 벗어나면 값은 살리고 '재분류 검토' 플래그만.
CAT_SOFT = {
    "백패킹텐트":   {"weight_min": (150, 8000)},
    "오토캠핑텐트": {"weight_min": (2000, 60000)},
}

# capacity별 '이너 바닥' 타당범위(백패킹 한정). 초과=설치크기(외형) 오인 → 격리.
#   백패킹 inner floor는 인원수로 거의 표준화됨. 오토캠핑/기타는 footprint허용→느슨(HARD사용).
FLOOR_CAP_BP = {1: (0.8, 3.2), 2: (1.4, 4.6), 3: (2.4, 6.5), 4: (3.4, 9.0)}


def floor_hard_range(cat, cap):
    """floor_area의 유효 하드범위. 백패킹+인원확정이면 capacity별 좁은 범위."""
    if cat == "백패킹텐트" and cap in FLOOR_CAP_BP:
        return FLOOR_CAP_BP[cap]
    return HARD_RANGES["floor_area"]


def ensure_valid_column(con):
    try:
        con.execute("ALTER TABLE product_spec_values ADD COLUMN valid INTEGER NOT NULL DEFAULT 1")
    except sqlite3.OperationalError:
        pass


def ensure_implausible_flagtype(con):
    """data_quality_flags CHECK에 'implausible' 추가(테이블 재생성 마이그레이션, 멱등)."""
    try:
        con.execute("SAVEPOINT t")
        pid = con.execute("SELECT id FROM products LIMIT 1").fetchone()
        con.execute("INSERT INTO data_quality_flags(product_id,flag_type,note) VALUES(?,?,?)",
                    (pid[0], "implausible", "__probe__"))
        con.execute("ROLLBACK TO t")
        con.execute("RELEASE t")
        return  # 이미 허용됨
    except sqlite3.IntegrityError:
        con.execute("ROLLBACK TO t")
        con.execute("RELEASE t")
    con.executescript("""
        CREATE TABLE dqf_new (
            id INTEGER PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id),
            metric_id INTEGER REFERENCES metrics(id),
            flag_type TEXT NOT NULL CHECK (flag_type IN
                ('missing','conflict','needs_review','category_mismatch','implausible')),
            note TEXT, resolved INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')));
        INSERT INTO dqf_new SELECT * FROM data_quality_flags;
        DROP TABLE data_quality_flags;
        ALTER TABLE dqf_new RENAME TO data_quality_flags;
    """)


def backfill_capacity_l(con):
    """모델명에 용량 명시(예 '코펠 1.7L','2000ml')인데 capacity_l 결측인 제품을 백필.
    회수 가능 결측(파싱 누락)을 메움 — 미공개(r_value)와 구분. 멱등.
    안전장치: 용량토큰이 정확히 1개일 때만(세트 '800+400ml' 등 합산모호는 skip → 추측 회피)."""
    import re
    from normalize import parse_capacity_l
    cats = con.execute("""SELECT DISTINCT m.category_id, m.id FROM metrics m WHERE m.key='capacity_l'""").fetchall()
    n = 0
    for cid, mid in cats:
        rows = con.execute("""SELECT p.id, p.model_name FROM products p
            WHERE p.category_id=? AND p.model_name IS NOT NULL
              AND NOT EXISTS(SELECT 1 FROM product_spec_values v WHERE v.product_id=p.id
                AND v.metric_id=?)""", (cid, mid)).fetchall()
        # 가드: valid 무관 '어떤 행이든 있으면 skip' (격리된 값 위에 재삽입→무한증식 방지)
        for pid, name in rows:
            if "+" in name:           # 다부품 세트(800+400ml 등) → 대표/합산 모호 → skip(추측회피)
                continue
            toks = re.findall(r"\d*\.?\d+\s*(?:ml|l|리터|ℓ)\b", name.lower())
            if len(toks) != 1:        # 0개=용량없음, 2개+=세트 합산모호 → skip(추측회피)
                continue
            cap = parse_capacity_l(name)
            if cap and 0.1 <= cap <= 500:
                con.execute("""INSERT INTO product_spec_values
                    (product_id,metric_id,value_normalized,value_raw,source_id,is_primary,valid)
                    VALUES(?,?,?,?,1,1,1)""", (pid, mid, cap, f"{cap:g}L(모델명)"))
                n += 1
    con.commit()
    return n


def backfill_capacity_mah(con):
    """파워뱅크 용량(mAh) 회수 — 핵심지표인데 spec 미수집, model_name엔 표기됨.
    'mAh' 토큰 바로 앞 숫자만 추출(W·포트수 등 트랩숫자 회피). 메트릭 없으면 생성. 멱등."""
    import re
    cat = con.execute("SELECT id FROM categories WHERE name_ko='파워뱅크'").fetchone()
    if not cat:
        return 0
    cid = cat[0]
    row = con.execute("SELECT id FROM metrics WHERE category_id=? AND key='capacity_mah'", (cid,)).fetchone()
    if row:
        mid = row[0]
    else:
        cur = con.execute("""INSERT INTO metrics(category_id,key,label_ko,unit,direction,is_star_metric)
            VALUES(?,?,?,?,?,1)""", (cid, "capacity_mah", "용량", "mAh", "higher_better"))
        mid = cur.lastrowid
    n = 0
    for pid, name in con.execute("""SELECT p.id,p.model_name FROM products p WHERE p.category_id=?
        AND p.model_name IS NOT NULL AND NOT EXISTS(SELECT 1 FROM product_spec_values v
          WHERE v.product_id=p.id AND v.metric_id=?)""", (cid, mid)).fetchall():
        # 가드: valid 무관 '어떤 행이든 있으면 skip' (격리값 위 재삽입 무한증식 방지)
        m = re.search(r"(\d{3,7})\s*mah", name.lower())   # mAh 직전 숫자만(3~7자리)
        if not m:
            continue
        mah = float(m.group(1))
        if 2000 <= mah <= 600000:   # HARD_RANGES capacity_mah 하한과 일치(1000mAh=자릿수오기)
            # 아래 하한과 어긋나면 validate가 격리→다음 run 재삽입 무한증식 → 경계 일치 필수
            con.execute("""INSERT INTO product_spec_values
                (product_id,metric_id,value_normalized,value_raw,source_id,is_primary,valid)
                VALUES(?,?,?,?,1,1,1)""", (pid, mid, mah, f"{mah:g}mAh(모델명)"))
            n += 1
    con.commit()
    return n


def fill_variant_capacity(con):
    """같은 텐트 색상/구매처 변형인데 한쪽만 capacity(인원) NULL이면 형제값으로 채움.
    (brand+canonical_model 그룹에 비-NULL capacity가 정확히 1종일 때만 = 색상변형 확실.
    2종+이면 사이즈변형 가능성 → skip=추측회피). canonical 분리·verified누락 차단. 멱등."""
    from collections import defaultdict
    rows = con.execute("""SELECT p.id, p.brand_id, p.canonical_model, p.capacity
        FROM products p JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko LIKE '%텐트%'""").fetchall()
    groups = defaultdict(list)
    for pid, bid, cm, cap in rows:
        groups[(bid, cm)].append((pid, cap))
    n = 0
    for key, members in groups.items():
        nonnull = {c for _, c in members if c is not None}
        if len(nonnull) != 1:
            continue                       # 0종(채울값없음) 또는 2종+(사이즈변형 모호) → skip
        val = next(iter(nonnull))
        for pid, cap in members:
            if cap is None:
                con.execute("UPDATE products SET capacity=? WHERE id=?", (val, pid))
                n += 1
    con.commit()
    return n


def harmonize_variant_capacity(con):
    """같은 물리텐트(동일 brand+canonical+floor_area+weight_min)인데 capacity(인원)가
    색상SKU별로 다르게 입력된 것을 다수결로 통일. 색상은 인원을 바꿀 수 없고
    floor·weight 동일이 '같은 텐트' 증거 → 비일관 occupancy 태그 교정. 멱등.
    weight/floor가 다르면(다른 모델) 그룹이 갈려 자동 제외 → 과교정 방지."""
    from collections import Counter, defaultdict
    rows = con.execute("""SELECT p.id, p.brand_id, p.canonical_model, p.capacity,
        (SELECT v.value_normalized FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
           AND m.key='floor_area' WHERE v.product_id=p.id AND v.valid=1) fl,
        (SELECT v.value_normalized FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
           AND m.key='weight_min' WHERE v.product_id=p.id AND v.valid=1) wt
        FROM products p JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko LIKE '%텐트%' AND p.capacity IS NOT NULL""").fetchall()
    groups = defaultdict(list)
    for pid, bid, cm, cap, fl, wt in rows:
        if fl is None or wt is None:
            continue                      # 물리스펙 불완전 → 동일성 판단불가, 건드리지 않음
        groups[(bid, cm, round(fl, 2), round(wt, 1))].append((pid, cap))
    n = 0
    for key, members in groups.items():
        caps = [c for _, c in members]
        if len(set(caps)) <= 1:
            continue                      # 이미 일관 → skip
        mode = Counter(caps).most_common(1)[0][0]   # 다수결(동률이면 임의안정)
        for pid, cap in members:
            if cap != mode:
                con.execute("UPDATE products SET capacity=? WHERE id=?", (mode, pid))
                n += 1
    con.commit()
    return n


def mark_footprint_floor(con):
    """파생 floor_area(value_raw='다나와상세(파생)' = 본체 footprint, 이너 아님) 처리.
    floor 정의=이너 바닥인데 footprint가 섞여 이너기준 텐트와 같은 풀서 별점 과대.
    - 같은 텐트(brand+canonical+capacity) 형제가 dims측정 이너값 보유 → 그 값으로 교체(이너전파, 추측 아님).
    - 형제 없으면 외형기준 참고로 두되 별점 제외(star_eligible=0). 값·verified·표시는 유지.
    멱등: 전파분은 value_raw가 바뀌어 재매칭 안 됨. 사용자 결정(외형배지+별점제외)."""
    try:
        con.execute("ALTER TABLE product_spec_values ADD COLUMN star_eligible INTEGER NOT NULL DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    targets = con.execute("""SELECT v.id, p.id, p.brand_id, p.canonical_model, IFNULL(p.capacity,-1)
        FROM product_spec_values v JOIN products p ON p.id=v.product_id
        JOIN metrics m ON m.id=v.metric_id AND m.key='floor_area'
        WHERE v.valid=1 AND v.value_raw='다나와상세(파생)'""").fetchall()
    propagated = excluded = 0
    for vid, pid, bid, cm, cap in targets:
        sib = con.execute("""SELECT v.value_normalized FROM products p2
            JOIN product_spec_values v ON v.product_id=p2.id
            JOIN metrics m ON m.id=v.metric_id AND m.key='floor_area'
            WHERE p2.brand_id=? AND p2.canonical_model=? AND IFNULL(p2.capacity,-1)=? AND p2.id<>?
              AND v.valid=1 AND v.value_raw GLOB '*[0-9]*x*[0-9]*' ORDER BY v.id LIMIT 1""",
            (bid, cm, cap, pid)).fetchone()
        if sib:   # 형제 이너 측정값 전파 → 별점 복귀
            con.execute("""UPDATE product_spec_values SET value_normalized=?,
                value_raw='이너(형제전파)', star_eligible=1 WHERE id=?""", (sib[0], vid))
            propagated += 1
        else:     # 외형기준 참고 → 별점 제외(값은 유지)
            con.execute("UPDATE product_spec_values SET star_eligible=0 WHERE id=?", (vid,))
            excluded += 1
    con.commit()
    return propagated, excluded


def harmonize_variant_water_head(con):
    """같은 물리텐트/타프(brand+canonical+capacity) 색상변형인데 water_head(내수압)가 다르면
    다수결 통일. 내수압은 원단코팅 스펙=색상불변. 동수(다수없음)면 skip(추측회피). 멱등.
    (값이 전부 파생='다나와상세'인 케이스 — 색상별 split은 파생 아티팩트)."""
    from collections import Counter, defaultdict
    rows = con.execute("""SELECT v.id, p.brand_id, p.canonical_model, IFNULL(p.capacity,-1), v.value_normalized
        FROM product_spec_values v JOIN products p ON p.id=v.product_id
        JOIN metrics m ON m.id=v.metric_id AND m.key='water_head'
        JOIN categories c ON c.id=p.category_id
        WHERE v.valid=1 AND (c.name_ko LIKE '%텐트%' OR c.name_ko='타프')""").fetchall()
    groups = defaultdict(list)
    for vid, bid, cm, cap, wh in rows:
        if wh is not None:
            groups[(bid, cm, cap)].append((vid, wh))
    n = 0
    for key, members in groups.items():
        vals = [round(w) for _, w in members]
        if len(set(vals)) <= 1:
            continue
        cnt = Counter(vals).most_common()
        if len(cnt) >= 2 and cnt[0][1] == cnt[1][1]:
            continue                       # 동수 → 정답불명 → skip
        mode = cnt[0][0]
        for vid, wh in members:
            if round(wh) != mode:
                con.execute("UPDATE product_spec_values SET value_normalized=? WHERE id=?", (mode, vid))
                n += 1
    con.commit()
    return n


def harmonize_variant_weight(con):
    """같은 물리텐트(brand+canonical+capacity+동일 floor_area)인데 weight_min이 색상SKU별로
    다르면(총중량/배송중량 혼입 등) 그룹 최소값으로 통일. weight_min 정의=최소무게이고
    색상은 무게를 못 바꾸며 floor 동일이 같은텐트 증거. floor 다르면 그룹분리=과교정방지. 멱등."""
    from collections import defaultdict
    rows = con.execute("""SELECT v.id, p.brand_id, p.canonical_model, IFNULL(p.capacity,-1),
        v.value_normalized,
        (SELECT round(v2.value_normalized,2) FROM product_spec_values v2
           JOIN metrics m2 ON m2.id=v2.metric_id AND m2.key='floor_area'
           WHERE v2.product_id=p.id AND v2.valid=1) fl
        FROM product_spec_values v JOIN products p ON p.id=v.product_id
        JOIN metrics m ON m.id=v.metric_id AND m.key='weight_min'
        JOIN categories c ON c.id=p.category_id AND c.name_ko LIKE '%텐트%'
        WHERE v.valid=1""").fetchall()
    groups = defaultdict(list)
    for vid, bid, cm, cap, wt, fl in rows:
        if fl is None or wt is None:
            continue                       # floor/무게 불완전 → 동일성 판단불가
        groups[(bid, cm, cap, fl)].append((vid, wt))
    n = 0
    for key, members in groups.items():
        if len({round(w) for _, w in members}) <= 1:
            continue
        mn = min(w for _, w in members)
        for vid, wt in members:
            if wt > mn + 0.5:
                con.execute("""UPDATE product_spec_values SET value_normalized=?,
                    value_raw=value_raw||' [형제최소통일]' WHERE id=?""", (mn, vid))
                n += 1
    con.commit()
    return n


def fix_quart_capacity(con):
    """아이스박스 capacity_l 쿼트 미변환 교정: 모델명 명시 쿼트 Q이고 저장값 V≈Q면
    (쿼트를 리터로 오인) V=Q×0.9464(US quart→L)로 환산. 외부 지상검증(예티 로디24)서 확인.
    멱등: 환산 후 V≠Q라 재트리거 안 함 + [쿼트환산] 마커. (이미 변환된 NNQT는 V≈Q아니라 미적용)."""
    import re
    cat = con.execute("SELECT id FROM categories WHERE name_ko='아이스박스'").fetchone()
    if not cat:
        return 0
    mid = con.execute("SELECT id FROM metrics WHERE key='capacity_l' AND category_id=?", (cat[0],)).fetchone()
    if not mid:
        return 0
    n = 0
    for pid, mn, vid, val in con.execute("""SELECT p.id, p.model_name, v.id, v.value_normalized
            FROM products p JOIN product_spec_values v ON v.product_id=p.id AND v.metric_id=?
            WHERE v.valid=1 AND v.value_raw NOT LIKE '%쿼트환산%'""", (mid[0],)).fetchall():
        m = re.search(r"(\d+)\s*(?:qt|쿼트)", (mn or "").lower()) or re.search(r"로디\s*(\d+)", mn or "")
        if m and val and 0.97 * float(m.group(1)) <= val <= 1.03 * float(m.group(1)):
            con.execute("UPDATE product_spec_values SET value_normalized=?, value_raw=value_raw||' [쿼트환산]' "
                        "WHERE id=?", (round(float(m.group(1)) * 0.9464, 1), vid))
            n += 1
    con.commit()
    return n


def rederive_thickness(con):
    """매트 thickness를 value_raw에서 재도출(고친 파서=콤마제거·mm인식 항상 적용).
    치수형 raw(x포함)·source≠4만. 3번째 치수 없으면(2D raw) None→valid=0 격리. 멱등."""
    from normalize import thickness_mm
    mids = [r[0] for r in con.execute("SELECT id FROM metrics WHERE key='thickness'").fetchall()]
    if not mids:
        return 0
    ph = ",".join("?" * len(mids))
    n = 0
    for vid, val, raw in con.execute(f"""SELECT id, value_normalized, value_raw FROM product_spec_values
        WHERE metric_id IN ({ph}) AND IFNULL(source_id,1)<>4 AND value_raw LIKE '%x%'""", mids).fetchall():
        t = thickness_mm(raw)            # 2D raw(두께치수 없음)면 None
        # value_normalized를 재도출값으로(None 포함). NULL은 recompute서 자동 제외 →
        #   valid 리셋과 무관하게 두께 없는 매트는 별점서 빠짐. 멱등.
        if (t is None) != (val is None) or (t is not None and abs(t - (val or 0)) > 0.5):
            con.execute("UPDATE product_spec_values SET value_normalized=? WHERE id=?", (t, vid))
            n += 1
    con.commit()
    return n


def rederive_floor_literal(con):
    """floor_area value_raw가 ㎡ 리터럴(예 '3.25㎡ [Coleman(...,35sqft)]')인 행을 재도출.
    옛 파서가 괄호주석의 'sqft' 때문에 이미 ㎡인 값을 또 환산(3.25→0.3)한 stale 교정. 멱등."""
    from normalize import floor_area_m2
    mids = [r[0] for r in con.execute("SELECT id FROM metrics WHERE key='floor_area'").fetchall()]
    if not mids:
        return 0
    ph = ",".join("?" * len(mids))
    n = 0
    for vid, val, raw in con.execute(f"""SELECT id, value_normalized, value_raw FROM product_spec_values
        WHERE metric_id IN ({ph}) AND (value_raw LIKE '%㎡%' OR value_raw LIKE '%m²%')""", mids).fetchall():
        t = floor_area_m2(raw=raw)
        if t and abs(t - (val or 0)) > 0.01:
            con.execute("UPDATE product_spec_values SET value_normalized=? WHERE id=?", (t, vid))
            n += 1
    con.commit()
    return n


def validate_db(con):
    """타당범위 검증 적용 + 별점 재계산. 반환 (hard_flagged, soft_flagged)."""
    ensure_valid_column(con)
    ensure_implausible_flagtype(con)
    # 침낭 온도 라벨 정직화: 다나와값=ISO 하한(limit) 기준이고 comfort는 미공개(46·47R 외부확정).
    con.execute("UPDATE metrics SET label_ko='내한온도(ISO하한)' WHERE key='comfort_temp' "
                "AND label_ko<>'내한온도(ISO하한)'")
    backfill_capacity_l(con)   # 모델명 용량 회수(파싱누락 메움) — 검증/별점 전에
    fix_quart_capacity(con)    # 아이스박스 쿼트 미변환(예티 로디24 등) → L 환산
    rederive_thickness(con)    # 매트 두께 재도출(콤마/mm 파서 항상 적용) — 멱등
    rederive_floor_literal(con)  # ㎡ 리터럴 floor 재도출(sqft주석 이중환산 교정) — 멱등
    backfill_capacity_mah(con) # 파워뱅크 mAh 회수(핵심지표 부재 메움)
    fill_variant_capacity(con)       # 같은텐트 색상변형 NULL capacity를 형제값으로 채움
    harmonize_variant_capacity(con)  # 같은 물리텐트 색상SKU 인원태그 통일(세그 분산 방지)
    harmonize_variant_weight(con)    # 같은 물리텐트 색상SKU weight_min 최소값 통일(총중량혼입 차단)
    harmonize_variant_water_head(con)  # 같은 텐트/타프 색상SKU 내수압 다수결 통일(파생 split 차단)
    mark_footprint_floor(con)        # 파생 footprint floor: 형제이너 전파 or 외형기준 별점제외
    # 메트릭 바인딩 자동복구: 재분류로 product 카테고리≠metric 카테고리가 된 고아값을
    # 같은 key의 새 카테고리 메트릭으로 remap (대상 없으면 그대로 둠).
    for vid, pid, key in con.execute("""SELECT psv.id, psv.product_id, m.key
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id
        JOIN products p ON p.id=psv.product_id WHERE m.category_id<>p.category_id""").fetchall():
        tgt = con.execute("""SELECT m2.id FROM metrics m2 JOIN products p ON p.id=?
            WHERE m2.category_id=p.category_id AND m2.key=?""", (pid, key)).fetchone()
        if tgt:
            con.execute("UPDATE product_spec_values SET metric_id=? WHERE id=?", (tgt[0], vid))
    # capacity 가드: products.capacity(인원수)는 텐트류만 비교 세그먼트 축.
    #   침낭 '더블/2인용' 등이 capacity로 파싱돼 누수→작은풀 오분할 → 텐트 외엔 NULL.
    con.execute("""UPDATE products SET capacity=NULL WHERE capacity IS NOT NULL
        AND category_id NOT IN (SELECT id FROM categories WHERE name_ko LIKE '%텐트%')""")
    con.commit()
    con.execute("UPDATE product_spec_values SET valid=1")
    # 지속격리 재적용: range검증으론 못 잡는 기준오염/모순(conflict '격리' 플래그)을
    #   valid=1 리셋 후 다시 valid=0. (수동격리가 매 검증마다 부활하던 버그 차단)
    #   source_id=4(외부확정)는 보호. 멱등.
    con.execute("""UPDATE product_spec_values SET valid=0 WHERE id IN (
        SELECT v.id FROM product_spec_values v
        JOIN data_quality_flags d ON d.product_id=v.product_id AND d.metric_id=v.metric_id
        WHERE d.flag_type='conflict' AND IFNULL(d.resolved,0)=0
          AND d.note LIKE '%격리%' AND IFNULL(v.source_id,1)<>4)""")
    con.execute("DELETE FROM data_quality_flags WHERE flag_type='implausible'")
    con.execute("DELETE FROM data_quality_flags WHERE flag_type='category_mismatch' AND note LIKE '[재분류]%'")

    hard_flagged, soft_flagged = [], []
    rows = con.execute("""
        SELECT psv.id, psv.product_id, psv.metric_id, mt.key, c.name_ko, p.capacity,
               psv.value_normalized, psv.value_raw, b.name_ko||' '||p.model_name
        FROM product_spec_values psv
        JOIN metrics mt ON mt.id=psv.metric_id
        JOIN products p ON p.id=psv.product_id
        JOIN categories c ON c.id=p.category_id
        JOIN brands b ON b.id=p.brand_id
        WHERE psv.value_normalized IS NOT NULL""").fetchall()
    for vid, pid, mid, key, cat, cap, val, raw, name in rows:
        if key == "floor_area":
            hard = floor_hard_range(cat, cap)
        else:
            hard = CAT_HARD.get((cat, key)) or HARD_RANGES.get(key)
        if hard and (val < hard[0] or val > hard[1]):   # 파싱오류/외형오인 → 격리
            con.execute("UPDATE product_spec_values SET valid=0 WHERE id=?", (vid,))
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,?,'implausible',?)""",
                (pid, mid, f"{key}={val:g} 물리범위[{hard[0]}~{hard[1]}] 벗어남=파싱오류 (원문:{raw})"))
            hard_flagged.append((key, name, val, raw))
            continue
        soft = CAT_SOFT.get(cat, {}).get(key)   # 카테고리 기대 밖 → 값 유지+재분류검토
        if soft and (val < soft[0] or val > soft[1]):
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,?,'category_mismatch',?)""",
                (pid, mid, f"[재분류] {key}={val:g}는 '{cat}' 기대[{soft[0]}~{soft[1]}] 밖 → 분류 재확인 (값은 유지)"))
            soft_flagged.append((key, cat, name, val))

    # 교차필드: 충전량 ≥ 총무게 = 물리불가(총중량을 충전량칸 복사) → 격리
    for vid, pid, fv in con.execute("""SELECT psv.id, psv.product_id, psv.value_normalized
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id AND m.key='fill_weight'
        WHERE psv.valid=1""").fetchall():
        w = con.execute("""SELECT v.value_normalized FROM product_spec_values v
            JOIN metrics m ON m.id=v.metric_id AND m.key='weight_min'
            WHERE v.product_id=? AND v.valid=1""", (pid,)).fetchone()
        if w and fv >= w[0]:
            con.execute("UPDATE product_spec_values SET valid=0 WHERE id=?", (vid,))
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,(SELECT id FROM metrics WHERE key='fill_weight' LIMIT 1),'implausible',?)""",
                (pid, f"충전량 {fv:g}g ≥ 총무게 {w[0]:g}g = 물리불가(총중량 복사)"))
            hard_flagged.append(("fill_weight", "", fv, ""))

    # 교차필드: 충전량 다량(겨울급 ≥1000g)인데 comfort_temp 양수(>10℃) = 모순
    #   → 상한온도(쾌적상한)를 내한온도칸에 오스크랩한 것. 추측으로 채우지 않고 comfort 격리.
    for vid, pid, ct in con.execute("""SELECT psv.id, psv.product_id, psv.value_normalized
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id AND m.key='comfort_temp'
        WHERE psv.valid=1 AND psv.value_normalized>10""").fetchall():
        fw = con.execute("""SELECT v.value_normalized FROM product_spec_values v
            JOIN metrics m ON m.id=v.metric_id AND m.key='fill_weight'
            WHERE v.product_id=? AND v.valid=1""", (pid,)).fetchone()
        if fw and fw[0] >= 1000:
            con.execute("UPDATE product_spec_values SET valid=0 WHERE id=?", (vid,))
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,(SELECT id FROM metrics WHERE key='comfort_temp' LIMIT 1),'implausible',?)""",
                (pid, f"내한 {ct:g}℃(양수) vs 충전량 {fw[0]:g}g(겨울급) 모순=상한온도 오스크랩"))
            hard_flagged.append(("comfort_temp", "", ct, ""))

    # 텐트 floor_area capacity 가드: 별점대상(star_eligible=1) 텐트 바닥이 인원×6㎡ 초과면
    #   치수 오기(자릿수중복 등) → 격리. footprint(외형배지)는 제외(이미 별점 미반영).
    #   인원×6은 정상 대형가족텐트(cap5 ~27㎡)도 통과하는 관대한 상한(오기만 포착).
    for vid, pid, val, cap, raw in con.execute("""SELECT v.id, v.product_id, v.value_normalized,
            p.capacity, v.value_raw
        FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key='floor_area'
        JOIN products p ON p.id=v.product_id JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko LIKE '%텐트%' AND v.valid=1 AND IFNULL(v.star_eligible,1)=1
          AND p.capacity IS NOT NULL""").fetchall():
        if val > cap * 6:
            con.execute("UPDATE product_spec_values SET valid=0 WHERE id=?", (vid,))
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,(SELECT id FROM metrics WHERE key='floor_area' AND category_id=
                  (SELECT category_id FROM products WHERE id=?) LIMIT 1),'implausible',?)""",
                (pid, pid, f"floor {val:g}㎡ > 인원{cap}×6 = 치수오기 의심 (원문:{raw})"))
            hard_flagged.append(("floor_area", "", val, raw))

    # floor_area raw 형식 가드: 면적은 '가로×세로' 치수여야 함. value_raw가 치수구분자(x/×/*)
    #   없이 범위(~,-)만 있으면(예 '85~120mm' 높이범위, '180-210cm' 폴길이) 면적 아님 → 격리.
    #   (이너/sq표기·㎡직접값·정상dims는 제외; 외부확정 source4 보호)
    import re as _re
    for vid, pid, val, raw in con.execute("""SELECT v.id, v.product_id, v.value_normalized, v.value_raw
        FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key='floor_area'
        WHERE v.valid=1 AND IFNULL(v.source_id,1)<>4 AND v.value_raw IS NOT NULL""").fetchall():
        r = raw.lower()
        has_sep = ("x" in r or "×" in r or "*" in r)
        has_range = bool(_re.search(r"\d\s*[~\-–]\s*\d", r))
        is_area = ("㎡" in raw or "m2" in r or "sq" in r or "ft" in r)
        if has_range and not has_sep and not is_area:    # 범위형(비치수) → 면적 산출 근거없음
            con.execute("UPDATE product_spec_values SET valid=0 WHERE id=?", (vid,))
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,(SELECT id FROM metrics WHERE key='floor_area' AND category_id=
                  (SELECT category_id FROM products WHERE id=?) LIMIT 1),'implausible',?)""",
                (pid, pid, f"floor raw '{raw}'=치수아닌 범위값 → 면적 근거없음 격리"))
            hard_flagged.append(("floor_area", "", val, raw))

    # is_primary 정합: 같은 (product,metric)에 valid=1 행이 있으면 valid=0 행의 is_primary 강등.
    #   (크로스소스 보정 시 옛 valid=0 행이 is_primary=1로 남아 중복되던 것 정리) 멱등.
    con.execute("""UPDATE product_spec_values SET is_primary=0
        WHERE is_primary=1 AND valid=0 AND EXISTS(
          SELECT 1 FROM product_spec_values v2 WHERE v2.product_id=product_spec_values.product_id
            AND v2.metric_id=product_spec_values.metric_id AND v2.valid=1 AND v2.is_primary=1)""")
    con.commit()
    P.recompute_ratings(con)
    con.commit()
    return hard_flagged, soft_flagged


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    hard_flagged, soft_flagged = validate_db(con)

    print("=" * 64)
    print("메트릭 타당범위 검증 결과")
    print("=" * 64)
    total = con.execute("SELECT COUNT(*) FROM product_spec_values").fetchone()[0]
    bad = con.execute("SELECT COUNT(*) FROM product_spec_values WHERE valid=0").fetchone()[0]
    print(f"  전체 스펙값 {total}개")
    print(f"  ├ 파싱오류 격리(valid=0): {bad}개  → 별점 계산서 제외")
    print(f"  └ 카테고리 재분류 검토  : {len(soft_flagged)}개  → 값은 유지, 분류만 재확인\n")
    from collections import Counter
    print("[① 파싱오류 격리 — 메트릭별]")
    for k, c in Counter(x[0] for x in hard_flagged).most_common():
        print(f"   {k}: {c}건")
    print("\n[② 재분류 검토 예시 — 값은 살아있음]")
    for key, cat, name, val in soft_flagged[:10]:
        print(f"   {name[:32]:34} {key}={val:g}  ('{cat}' 기대 밖)")
    con.close()
    print(f"\nDB: {args.db}")


if __name__ == "__main__":
    main()
