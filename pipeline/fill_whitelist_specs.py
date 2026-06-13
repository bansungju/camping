#!/usr/bin/env python3
"""화이트리스트 유명 브랜드 pending 모델의 다나와 스펙 보강 → 승격.

전 카테고리 대상. 다나와 상세를 직접 크롤링(danawa.py)해 결측 별점지표를 채우고,
core 지표가 완비되면 promote_all 기준으로 verified 승격된다.
가격은 이미 보유한 모델만 대상(액세서리·가격결측 제외) → 노출 즉시 가능.

사용:
  python3 pipeline/fill_whitelist_specs.py --db camping_tents500.db --dry-run
  python3 pipeline/fill_whitelist_specs.py --db camping_tents500.db --category 백패킹텐트 --limit 30
  python3 pipeline/fill_whitelist_specs.py --db camping_tents500.db   # 전체 + 승격 + export
"""
import argparse
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import danawa as D
import normalize as N
import pipeline as P
import multicat as M
import run_all as RA
from harvest_tents import TENT_MAP

# 유명 브랜드 화이트리스트 (국내외 프리미엄·인지도 상위)
WHITELIST = [
    "힐레베르그", "헬리녹스", "MSR", "빅아그네스", "니모이큅먼트", "니모", "스노우피크",
    "제로그램", "노르디스크", "콜맨", "DOD", "미니멀웍스", "코베아", "네이처하이크",
    "씨투써밋", "몽벨", "테라노바", "블랙다이아몬드", "써머레스트", "로고스", "카즈미",
]

# 텐트류 — TENT_MAP 사용 + capacity(인원) 파싱
TENT_CIDS = {3, 4, 7, 19, 20}

# 액세서리(스펙 비교 무의미) 제외 패턴
ACC_PAT = ("주머니", "스토퍼", "텐트백", "파우치", "펙", "홀더", "커버", "상판",
           "비브람", "볼핏", "워머", "헤드레스트", "큐브", "스토리지")

# 다나와 FN(전 카테고리) + floor 파생
FN = M.FN


def specs_for(cid, cat_name):
    """(metric, keys, fn, derive, exclude) 목록 반환."""
    if cid in TENT_CIDS:
        out = []
        for s in TENT_MAP:
            out.append((s["metric"], s["keys"], s.get("fn"),
                        s.get("derive"), s.get("exclude")))
        return out
    cfg = M.CONFIG.get(cat_name)
    if not cfg:
        return []
    out = []
    for metric, keys, fn in cfg["spec"]:
        if fn == "derive_floor":
            out.append((metric, keys, None, "floor", ["수납"]))
        else:
            exclude = ["수납"] if metric == "floor_area" else None
            out.append((metric, keys, fn, None, exclude))
    return out


def fill_one(con, pid, pcode, cid, cat_name):
    """다나와 상세 fetch → 결측 메트릭 채움. (filled, capacity_set) 반환."""
    # valid 무관하게 이미 존재하는 메트릭은 건너뜀(과거에 무효화·외형기준 처리한 값 보존).
    have = {r[0] for r in con.execute("""SELECT mt.key FROM product_spec_values psv
        JOIN metrics mt ON mt.id=psv.metric_id
        WHERE psv.product_id=?""", (pid,))}
    parsed = D.parse(D.fetch(pcode))
    specs, tags, title = parsed["specs"], parsed["tags"], parsed.get("title", "")
    filled = 0
    for metric, keys, fn, derive, exclude in specs_for(cid, cat_name):
        if metric in have:
            continue
        raw = P.find_spec(specs, keys, exclude)
        if not raw:
            continue
        # H-96: derive도 fn도 없는 화이트리스트 항목은 설정 오류다. 그대로 두면 FN[None] KeyError가
        #       아래 except Exception에 조용히 삼켜져 무음 실패(설정 버그를 영영 못 본다) → 명시 경고 후 스킵.
        if derive != "floor" and fn is None:
            print(f"   ⚠ 설정오류: metric={metric} 에 fn/derive 미정의 → 건너뜀", flush=True)
            continue
        try:
            val = P.derive_floor(raw) if derive == "floor" else FN[fn](raw)
        except Exception:
            val = None
        if val is None:
            continue
        conf = "medium" if "~" in raw else "high"
        mid = P.metric_id(con, cid, metric)
        # M-332: raw_unit는 '단위 미상'이면 의미 없는 "norm" 플레이스홀더 대신 NULL로 둔다(다른 소비자가
        #   단위 기반 포맷팅 시 잘못된 "norm"을 신뢰하지 않도록). 표시 단위는 metrics.unit이 단일 진실.
        con.execute("""INSERT INTO product_spec_values
            (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,valid,star_eligible)
            VALUES(?,?,?,?,?,3,?,1,1,1)""", (pid, mid, val, raw, None, conf))
        con.execute("""UPDATE data_quality_flags SET resolved=1
            WHERE product_id=? AND metric_id=? AND flag_type='missing'""", (pid, mid))
        filled += 1

    # 텐트 capacity(인원) 보강
    cap_set = False
    if cid in TENT_CIDS:
        cur_cap = con.execute("SELECT capacity FROM products WHERE id=?", (pid,)).fetchone()[0]
        if cur_cap is None:
            m = re.search(r"(\d+)\s*인용", " ".join(tags) + " " + title)
            if m:
                con.execute("UPDATE products SET capacity=? WHERE id=?", (int(m.group(1)), pid))
                cap_set = True
    return filled, cap_set


def candidates(con, only_cat=None, limit=None):
    ph = ",".join("?" * len(WHITELIST))
    acc = " AND ".join(["p.canonical_model NOT LIKE ?" for _ in ACC_PAT])
    sql = f"""
        SELECT p.id, p.danawa_pcode, p.category_id, c.name_ko, b.name_ko, p.canonical_model
        FROM products p
        JOIN brands b ON b.id=p.brand_id
        JOIN categories c ON c.id=p.category_id
        LEFT JOIN canonical_models cm ON cm.brand_id=p.brand_id
            AND cm.canonical_model=p.canonical_model AND IFNULL(cm.capacity,-1)=IFNULL(p.capacity,-1)
        WHERE b.name_ko IN ({ph})
          AND p.curation_status='pending'
          AND p.danawa_pcode IS NOT NULL
          AND cm.min_price IS NOT NULL
          AND {acc}
    """
    args = list(WHITELIST) + [f"%{w}%" for w in ACC_PAT]
    if only_cat:
        sql += " AND c.name_ko=?"
        args.append(only_cat)
    sql += " ORDER BY c.id, b.name_ko, p.canonical_model"
    if limit:
        sql += f" LIMIT {int(limit)}"
    return con.execute(sql, args).fetchall()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(os.path.dirname(HERE), "camping_tents500.db"))
    ap.add_argument("--category", default=None, help="특정 카테고리만(한글명)")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true", help="크롤링 없이 대상만 출력")
    ap.add_argument("--no-export", action="store_true", help="승격·export 생략(스펙만 채움)")
    args = ap.parse_args()

    con = sqlite3.connect(args.db)
    # M-216: promote_all/recompute_ratings 등에서 예외가 나도 커넥션이 닫히도록 전체를 try/finally로 감싼다
    #   (기존엔 분기별 con.close()라 예외 경로에서 커넥션·WAL 잠금 파일이 잔류했다).
    try:
        cands = candidates(con, args.category, args.limit)
        print(f"대상 모델: {len(cands)}개" + (f" (카테고리={args.category})" if args.category else ""))

        if args.dry_run:
            from collections import Counter
            dist = Counter(c[3] for c in cands)
            for cat, n in dist.most_common():
                print(f"  {cat}: {n}")
            return

        total_filled = 0
        done = 0
        for pid, pcode, cid, cat_name, brand, model in cands:
            try:
                filled, cap_set = fill_one(con, pid, pcode, cid, cat_name)
                con.commit()
                total_filled += filled
                done += 1
                tag = f" +cap" if cap_set else ""
                print(f"  [{done}/{len(cands)}] {brand} {model[:28]:28} +{filled}{tag}")
            except Exception as e:
                print(f"  [{done}/{len(cands)}] {brand} {model[:28]:28} 실패: {type(e).__name__}: {e}")
            D.polite_sleep()

        print(f"\n총 {total_filled}개 스펙 보강 / {done}개 모델 처리")

        if args.no_export:
            return

        # 승격 → 별점 재산정 → export → 게이트
        print("\n승격(promote_all)…")
        RA.promote_all(con)
        con.commit()
        print("별점 재산정(recompute_ratings)…")
        P.recompute_ratings(con)
        con.commit()
        nv = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified'").fetchone()[0]
        print(f"  verified 총 {nv}개")
    finally:
        con.close()
    print("\n다음: python3 pipeline/export_site.py && python3 pipeline/check_export.py")


if __name__ == "__main__":
    main()
