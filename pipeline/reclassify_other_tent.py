#!/usr/bin/env python3
"""기타텐트(other-tent) 해체 → 백패킹/오토캠핑 재배정 + 쉘터/기타용품 신설.

- categories: 쉘터(19)·기타용품(20) 추가
- metrics: 쉘터에 텐트 동일 ★지표 복제(49~52)
- products: cat7 전 제품을 규칙으로 재배정(category_id)
- product_spec_values: metric_id를 새 카테고리의 같은 key metric으로 remap
  (스펙 metric_id가 카테고리별로 달라, 안 하면 별점 재계산이 스펙을 못 찾음)
- 별점: recompute_ratings로 세그먼트 재계산

멱등: cat7가 비면 재실행 no-op. 별점만 다시 돌리려면 recompute 단독 호출.
사용: python3 pipeline/reclassify_other_tent.py [--db camping_tents500.db]
"""
import argparse
import os
import sqlite3
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import pipeline as P

CONV = ["원터치", "자동", "팝업", "퀵오픈", "인스턴트"]          # 편의형 → 오토
MISC_KW = ["TPU창", "샤워", "윈드 스크린", "윈드스크린"]          # 텐트 아님 → 기타용품
SHELTER_KW = ["그늘막", "쉐이드", "선 쉐", "선쉐", "쉐쉐", "스크린 IG",
              "빅 쉐", "팝 쉐", "비틀쉐", "지엔 그늘", "어반쉐"]   # 그늘막/선쉐이드 → 쉘터


def bucket(name, cap, w):
    if any(k in name for k in MISC_KW):
        return "misc"
    if any(k in name for k in SHELTER_KW):
        return "shelter"
    if any(k in name for k in CONV):
        return "auto"
    if w is None:
        # L-196: 무게 없으면 백패킹 판정 불가 → auto로 두되, 오토캠핑 오배정 가능성을 사후 감지하도록 경고.
        print(f"  ⚠ reclassify: 무게 없음 '{name[:30]}' → auto 분류(백패킹 오배정 가능)", flush=True)
        return "auto"
    # M-234: `.get(cap or 0)`은 cap=None과 cap=0을 모두 key 0으로 합쳐 구분을 잃는다 → `.get(cap)`로 명시
    #   (None/0/미등록 cap 모두 band=None → auto, 동작 동일하나 의도 명확).
    band = {1: 2500, 2: 3000, 3: 3600}.get(cap)
    return "back" if (band and w <= band) else "auto"


TGT = {"back": 3, "auto": 4, "shelter": 19, "misc": 20}
# 기타텐트(7) metric → 대상 카테고리 같은 key metric 매핑
REMAP = {
    "back":    {19: 1,  20: 3,  21: 4,  22: 2},    # 백패킹텐트(3)
    "auto":    {19: 15, 20: 16, 21: 17, 22: 18},   # 오토캠핑텐트(4)
    "shelter": {19: 49, 20: 50, 21: 51, 22: 52},   # 쉘터(19)
    # misc(20): ★지표 없음 → 스펙 metric_id 그대로 둠(미조회·무해)
}
SHELTER_METRICS = [
    (49, "weight_min", "최소무게", "g", "lower_better", "kg/g→g", 1),
    (50, "water_head", "내수압", "mm", "higher_better", "플라이 기준", 1),
    (51, "floor_area", "바닥면적", "m2", "higher_better", "가로×세로", 1),
    (52, "packed_volume", "패킹부피", "cm3", "lower_better", "수납크기", 0),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)

    con.execute("INSERT OR IGNORE INTO categories(id,parent_id,name_ko,name_en) VALUES(19,1,'쉘터','shelter')")
    con.execute("INSERT OR IGNORE INTO categories(id,parent_id,name_ko,name_en) VALUES(20,1,'기타용품','misc_gear')")
    for mid, key, lab, unit, direc, nr, star in SHELTER_METRICS:
        con.execute("""INSERT OR IGNORE INTO metrics
            (id,category_id,key,label_ko,unit,direction,normalize_rule,is_star_metric)
            VALUES(?,19,?,?,?,?,?,?)""", (mid, key, lab, unit, direc, nr, star))

    rows = con.execute("""SELECT p.id, p.model_name, p.capacity,
        (SELECT value_normalized FROM product_spec_values
         WHERE product_id=p.id AND metric_id=19 AND is_primary=1 LIMIT 1)
        FROM products p WHERE p.category_id=7""").fetchall()
    cnt = Counter()
    for pid, name, cap, w in rows:
        b = bucket(name or "", cap, w)
        cnt[b] += 1
        con.execute("UPDATE products SET category_id=? WHERE id=?", (TGT[b], pid))
        for old, new in REMAP.get(b, {}).items():
            con.execute("UPDATE product_spec_values SET metric_id=? WHERE product_id=? AND metric_id=?",
                        (new, pid, old))
    con.commit()
    print(f"재배정(전 상태): {dict(cnt)}  (총 {sum(cnt.values())})")

    print("별점 재계산(recompute_ratings)…")
    P.recompute_ratings(con)
    con.commit()
    con.close()
    print("완료")


if __name__ == "__main__":
    main()
