"""
verify_internal.py — 내부 정합성 스캐너 (A2)
전체 verified 상품 대상으로 5종 검사를 실행하고
data_quality_flags(needs_review) + verify_queue.json을 생성한다.
"""
import argparse
import json
import sqlite3
import statistics
from pathlib import Path

DB_DEFAULT = "camping_tents500.db"
QUEUE_OUT = "verify_queue.json"


def get_median(vals):
    clean = [v for v in vals if v is not None]
    if not clean:
        return None
    return statistics.median(clean)


# ── 검사 1: 가격 이상치 ─────────────────────────────────────────────────────
def check_price_outlier(cur):
    """카테고리 중앙값 대비 <1.5% or >3000%인 verified 상품"""
    # 초경량/프리미엄 예외: 최저가 ≥100원 이고 ≤10_000_000원 범위만 검사
    cur.execute("""
        SELECT cm.rep_product_id, p.brand_id, p.category_id, cm.min_price,
               p.model_name, b.name_ko as brand
        FROM canonical_models cm
        JOIN products p ON p.id = cm.rep_product_id
        JOIN brands b ON b.id = p.brand_id
        WHERE p.curation_status = 'verified'
          AND cm.min_price IS NOT NULL
          AND cm.min_price >= 100
    """)
    rows = cur.fetchall()

    # 카테고리별 중앙값 계산
    cat_prices = {}
    for pid, brand_id, cat_id, price, model, brand in rows:
        cat_prices.setdefault(cat_id, []).append(price)
    cat_median = {cat: get_median(prices) for cat, prices in cat_prices.items()}

    flags = []
    for pid, brand_id, cat_id, price, model, brand in rows:
        med = cat_median.get(cat_id)
        if not med:
            continue
        ratio = price / med * 100  # %
        if ratio < 1.5:
            note = f"가격 이상치(너무 낮음): {price:,}원 (카테고리 중앙값 {med:,.0f}원의 {ratio:.1f}%) — [{brand}] {model}"
            flags.append((pid, None, "needs_review", note))
        elif ratio > 3000:
            note = f"가격 이상치(너무 높음): {price:,}원 (카테고리 중앙값 {med:,.0f}원의 {ratio:.0f}%) — [{brand}] {model}"
            flags.append((pid, None, "needs_review", note))
    return flags


# ── 검사 2: 무게 단위 의심 ────────────────────────────────────────────────
def check_weight_unit(cur):
    """카테고리 중앙값 대비 100배 이상 or 1/100 이하인 weight_min 값"""
    cur.execute("""
        SELECT psv.product_id, psv.value_normalized, psv.value_raw, m.id as metric_id,
               p.category_id, p.model_name, b.name_ko as brand
        FROM product_spec_values psv
        JOIN metrics m ON m.id = psv.metric_id AND m.key = 'weight_min'
        JOIN products p ON p.id = psv.product_id
        JOIN brands b ON b.id = p.brand_id
        WHERE p.curation_status = 'verified'
          AND psv.is_primary = 1 AND psv.valid = 1
          AND psv.value_normalized IS NOT NULL
    """)
    rows = cur.fetchall()

    cat_weights = {}
    for pid, val, raw, metric_id, cat_id, model, brand in rows:
        cat_weights.setdefault(cat_id, []).append(val)
    cat_median = {cat: get_median(vals) for cat, vals in cat_weights.items()}

    flags = []
    for pid, val, raw, metric_id, cat_id, model, brand in rows:
        med = cat_median.get(cat_id)
        if not med or med == 0:
            continue
        ratio = val / med
        if ratio >= 100:
            note = f"무게 단위 의심(너무 큼): {val:,.0f}g (카테고리 중앙값 {med:,.0f}g의 {ratio:.0f}배) raw='{raw}' — [{brand}] {model}"
            flags.append((pid, metric_id, "needs_review", note))
        elif ratio <= 0.01:
            note = f"무게 단위 의심(너무 작음): {val:,.1f}g (카테고리 중앙값 {med:,.0f}g의 1/{1/ratio:.0f}) raw='{raw}' — [{brand}] {model}"
            flags.append((pid, metric_id, "needs_review", note))
    return flags


# ── 검사 3: 논리 모순 — capacity vs floor_area ─────────────────────────────
def check_logic_contradiction(cur):
    """1인당 floor_area < 0.5㎡ or > 5㎡ (capacity가 있는 텐트류만)"""
    cur.execute("""
        SELECT p.id, p.capacity, fa.value_normalized as floor_area,
               fa.metric_id, p.model_name, b.name_ko as brand
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        JOIN product_spec_values fa ON fa.product_id = p.id
        JOIN metrics m ON m.id = fa.metric_id AND m.key = 'floor_area'
        WHERE p.curation_status = 'verified'
          AND p.capacity IS NOT NULL AND p.capacity > 0
          AND fa.is_primary = 1 AND fa.valid = 1
          AND fa.value_normalized IS NOT NULL
    """)
    rows = cur.fetchall()

    flags = []
    for pid, cap, floor_area, metric_id, model, brand in rows:
        per_person = floor_area / cap
        if per_person < 0.5:
            note = f"논리 모순: floor_area {floor_area:.2f}㎡ / {cap}인 = 1인당 {per_person:.2f}㎡ (< 0.5㎡) — [{brand}] {model}"
            flags.append((pid, metric_id, "needs_review", note))
        elif per_person > 8.0:
            # 상한 5→8㎡: 대형 리빙쉘터·거실형 텐트 오탐 제거 (2026-06-13 실측확인 기반)
            note = f"논리 모순: floor_area {floor_area:.2f}㎡ / {cap}인 = 1인당 {per_person:.2f}㎡ (> 8㎡) — [{brand}] {model}"
            flags.append((pid, metric_id, "needs_review", note))
    return flags


# ── 검사 4: 중복 canonical ─────────────────────────────────────────────────
def check_duplicate_canonical(cur):
    """동일 brand_id + canonical_model + capacity로 verified가 2개 이상"""
    cur.execute("""
        SELECT brand_id, canonical_model, capacity, COUNT(*) as cnt,
               GROUP_CONCAT(id) as ids
        FROM products
        WHERE curation_status = 'verified'
          AND canonical_model IS NOT NULL
        GROUP BY brand_id, canonical_model, capacity
        HAVING cnt >= 2
    """)
    rows = cur.fetchall()

    flags = []
    for brand_id, canon_model, cap, cnt, ids_str in rows:
        # M-271: GROUP_CONCAT(id)는 순서 미보장(SQLite<3.44는 ORDER BY in GROUP_CONCAT도 미지원)이므로
        #   Python에서 정렬해 노트(ids:)를 결정적으로 — 재실행 시 동일 노트로 resolved 매칭 안정.
        pid_list = sorted(int(x) for x in ids_str.split(","))
        ids_sorted = ",".join(str(p) for p in pid_list)
        for pid in pid_list:
            note = f"중복 canonical: brand_id={brand_id} model='{canon_model}' capacity={cap} — {cnt}개 verified 존재 (ids: {ids_sorted})"
            flags.append((pid, None, "needs_review", note))
    return flags


# ── 검사 5: 가격 없음 ─────────────────────────────────────────────────────
def check_price_missing(cur):
    """verified 상품 중 소속 canonical 그룹의 min_price IS NULL.

    canonical_models는 (brand_id, canonical_model, capacity) 그룹 단위라
    rep_product_id가 아닌 그룹 키로 조인해야 변형 멤버 오탐을 막는다.
    """
    cur.execute("""
        SELECT p.id, p.model_name, b.name_ko as brand
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        LEFT JOIN canonical_models cm
          ON cm.brand_id = p.brand_id
         AND cm.canonical_model = p.canonical_model
         AND IFNULL(cm.capacity, -1) = IFNULL(p.capacity, -1)
        WHERE p.curation_status = 'verified'
          AND (cm.min_price IS NULL OR cm.rep_product_id IS NULL)
    """)
    rows = cur.fetchall()
    flags = []
    for pid, model, brand in rows:
        note = f"가격 없음: canonical_models.min_price IS NULL — [{brand}] {model}"
        flags.append((pid, None, "needs_review", note))
    return flags


# ── DB 저장 ────────────────────────────────────────────────────────────────
def insert_flags(con, cur, all_flags):
    inserted = 0
    skipped = 0
    for product_id, metric_id, flag_type, note in all_flags:
        # 동일 (product_id, metric_id, flag_type, note prefix 50자) 기존 미해결 flag 있으면 skip
        note_prefix = note[:80]
        if metric_id is not None:
            cur.execute("""
                SELECT id FROM data_quality_flags
                WHERE product_id=? AND metric_id=? AND flag_type=? AND resolved=0
                  AND note LIKE ?
            """, (product_id, metric_id, flag_type, note_prefix + "%"))
        else:
            cur.execute("""
                SELECT id FROM data_quality_flags
                WHERE product_id=? AND metric_id IS NULL AND flag_type=? AND resolved=0
                  AND note LIKE ?
            """, (product_id, flag_type, note_prefix + "%"))
        if cur.fetchone():
            skipped += 1
            continue
        cur.execute("""
            INSERT INTO data_quality_flags (product_id, metric_id, flag_type, note, resolved)
            VALUES (?, ?, ?, ?, 0)
        """, (product_id, metric_id, flag_type, note))
        inserted += 1
    con.commit()
    return inserted, skipped


# ── verify_queue.json 출력 ─────────────────────────────────────────────────
# 우선순위: 오탐률 낮은 순 (price_missing > duplicate > logic > price_outlier > weight_unit)
CHECK_PRIORITY = {
    "price_missing": 1,
    "duplicate": 2,
    "logic_contradiction": 3,
    "price_outlier": 4,
    "weight_unit": 5,
}


def write_queue(all_flags_labeled, out_path):
    queue = []
    for check_key, flags in all_flags_labeled:
        for product_id, metric_id, flag_type, note in flags:
            queue.append({
                "check": check_key,
                "priority": CHECK_PRIORITY.get(check_key, 99),  # L-195/L-265: 미등록 키도 KeyError 없이 기본순위
                "product_id": product_id,
                "metric_id": metric_id,
                "note": note,
            })
    queue.sort(key=lambda x: (x["priority"], x["product_id"]))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)
    return len(queue)


def main():
    parser = argparse.ArgumentParser(description="내부 정합성 스캐너")
    parser.add_argument("--db", default=DB_DEFAULT)
    parser.add_argument("--dry-run", action="store_true", help="DB에 쓰지 않고 결과만 출력")
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"[ERROR] DB 파일 없음: {db_path}")
        return 1

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    print(f"[verify_internal] DB: {db_path}")

    checks = [
        ("price_missing",       check_price_missing),
        ("duplicate",           check_duplicate_canonical),
        ("logic_contradiction", check_logic_contradiction),
        ("price_outlier",       check_price_outlier),
        ("weight_unit",         check_weight_unit),
    ]

    # M-241/M-295: false_positive로 resolved된 건만 영구 억제하고, '수정완료(fixed)'로 resolved된 건은
    #   재발 시 다시 탐지되게 한다. resolution_type 컬럼으로 구분(없으면 추가, 기본='false_positive'=하위호환:
    #   기존 resolved 행은 그대로 억제돼 재스팸 없음). 향후 reviewer가 resolution_type='fixed'로 표시하면 재탐지.
    try:
        cur.execute("ALTER TABLE data_quality_flags ADD COLUMN resolution_type TEXT DEFAULT 'false_positive'")
        con.commit()
    except sqlite3.OperationalError:
        pass  # 이미 존재
    # (product_id, note 앞 40자)로 매칭 — 검사 종류+상품을 충분히 식별한다.
    cur.execute("SELECT product_id, substr(note, 1, 40) FROM data_quality_flags "
                "WHERE resolved = 1 AND IFNULL(resolution_type,'false_positive')='false_positive'")
    resolved_set = {(r[0], r[1]) for r in cur.fetchall()}

    all_flags_labeled = []
    total = 0
    for check_key, fn in checks:
        raw = fn(cur)
        flags = [f for f in raw if (f[0], f[3][:40]) not in resolved_set]
        dropped = len(raw) - len(flags)
        drop_note = f" (resolved 제외 {dropped}건)" if dropped else ""
        print(f"  [{check_key}] {len(flags)}건 발견{drop_note}")
        all_flags_labeled.append((check_key, flags))
        total += len(flags)

    print(f"\n  합계: {total}건")

    if not args.dry_run:
        flat_flags = [f for _, flags in all_flags_labeled for f in flags]
        ins, skp = insert_flags(con, cur, flat_flags)
        print(f"  DB 저장: {ins}건 신규 INSERT, {skp}건 skip(기존 flag)")

    queue_path = Path(QUEUE_OUT)
    count = write_queue(all_flags_labeled, queue_path)
    print(f"  verify_queue.json: {count}건 → {queue_path}")

    con.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
