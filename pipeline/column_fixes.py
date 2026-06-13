#!/usr/bin/env python3
"""컬럼 정의 불일치 교정 — floor에서 검증된 패턴을 나머지 4컬럼에 적용.

1) 가격: 직구(해외구매) vs 국내 channel 분리 → 비교 시 구분
2) 내수압: 플라이 vs 바닥 HH 혼입 → ≥7000mm는 '기준의심'(바닥/마케팅) 플래그(값유지)
3) 무게: 최소 vs 패킹 혼입 → 백패킹 capacity 대비 과중량은 '기준의심'(패킹/오태깅) 플래그
4) 패킹부피: 원통 vs 박스 측정법 일관성 점검(이미 raw모양별 정확 환산 — 확인만)

플래그는 값을 죽이지 않음(measured 유지). 진짜 교정은 크로스소스 교체로(crosssource.py).
사용: python3 pipeline/column_fixes.py --db camping_tents500.db
"""
import argparse
import os
import re
import sqlite3

# 백패킹 capacity별 무게 상한(g): 초과=패킹무게/오태깅 의심(최소무게 기준 통일 관점)
WEIGHT_CAP_BP = {1: 2600, 2: 3300, 3: 4200, 4: 5500}
WATER_SUSPECT = 7000   # mm 이상이면 플라이 아닌 바닥/마케팅 의심


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    # H-71: 무조건 삭제하면 검토자가 resolved=1로 처리한 플래그까지 매 실행마다 날아가 수동 리뷰가
    #       비영속적이 된다. 미해결(resolved=0)만 지우고 재생성 → 검토 완료분은 보존.
    con.execute("DELETE FROM data_quality_flags WHERE note LIKE '[기준의심]%' AND resolved=0")
    # 이미 검토완료(resolved=1)한 (product,metric)은 재플래그하지 않는다. 안 그러면 보존된 resolved=1
    # 옆에 매 실행 새 resolved=0 플래그가 중복 생성돼 검토 결과가 사실상 무력화된다.
    reviewed = {(r[0], r[1]) for r in con.execute(
        "SELECT product_id, metric_id FROM data_quality_flags WHERE note LIKE '[기준의심]%' AND resolved=1")}

    # 1) 가격 channel 분리
    # M-281/M-360: 자동분류는 자동값(NULL·danawa_search·직구·국내)에만 적용한다. 수동 채널
    #   ('수동'·'병행수입'·'B2C' 등)은 매 실행 덮어쓰지 않도록 allowlist로 보호(멱등 재분류는 유지).
    AUTO_CH = "AND IFNULL(channel,'') IN ('', 'danawa_search', '직구', '국내')"
    con.execute(f"""UPDATE price_observations SET channel='직구'
        WHERE product_id IN (SELECT id FROM products WHERE model_name LIKE '%해외구매%') {AUTO_CH}""")
    con.execute(f"""UPDATE price_observations SET channel='국내'
        WHERE product_id IN (SELECT id FROM products WHERE model_name NOT LIKE '%해외구매%') {AUTO_CH}""")
    dom = con.execute("SELECT COUNT(*) FROM price_observations WHERE channel='국내'").fetchone()[0]
    imp = con.execute("SELECT COUNT(*) FROM price_observations WHERE channel='직구'").fetchone()[0]

    # 2) 내수압 기준의심
    w_sus = 0
    for pid, mid, val in con.execute("""SELECT psv.product_id, psv.metric_id, psv.value_normalized
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id AND m.key='water_head'
        WHERE psv.valid=1 AND psv.value_normalized>=?""", (WATER_SUSPECT,)):
        if (pid, mid) in reviewed:
            continue
        con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
            VALUES(?,?,'needs_review',?)""", (pid, mid, f"[기준의심] 내수압 {val:g}≥{WATER_SUSPECT} → 바닥HH/마케팅 가능, 플라이 기준 확인"))
        w_sus += 1

    # 3) 무게 기준의심 (백패킹 capacity 초과)
    g_sus = 0
    for pid, mid, val, cap in con.execute("""SELECT psv.product_id, psv.metric_id, psv.value_normalized, p.capacity
        FROM product_spec_values psv JOIN metrics m ON m.id=psv.metric_id AND m.key='weight_min'
        JOIN products p ON p.id=psv.product_id JOIN categories c ON c.id=p.category_id
        WHERE psv.valid=1 AND c.name_ko='백패킹텐트'"""):
        cap_max = WEIGHT_CAP_BP.get(cap)
        if cap_max and val > cap_max:
            if (pid, mid) in reviewed:
                continue
            con.execute("""INSERT INTO data_quality_flags(product_id,metric_id,flag_type,note)
                VALUES(?,?,'needs_review',?)""", (pid, mid, f"[기준의심] 무게 {val:g}g > {cap}인 상한 {cap_max} → 패킹무게/오태깅 가능"))
            g_sus += 1

    # 4) 패킹부피 측정법 점검
    cyl = box = 0
    for (raw,) in con.execute("""SELECT psv.value_raw FROM product_spec_values psv
        JOIN metrics m ON m.id=psv.metric_id AND m.key='packed_volume' WHERE psv.valid=1"""):
        nums = re.findall(r"\d+\.?\d*", raw or "")
        if "φ" in (raw or "").lower() or len(nums) == 2:
            cyl += 1
        elif len(nums) >= 3:
            box += 1
    con.commit()

    print("=" * 56)
    print("컬럼 정의 불일치 교정 결과")
    print("=" * 56)
    print(f"1) 가격 channel 분리   : 국내 {dom} / 직구 {imp}")
    print(f"2) 내수압 기준의심 플래그: {w_sus}건 (≥{WATER_SUSPECT}mm = 바닥HH 의심)")
    print(f"3) 무게 기준의심 플래그 : {g_sus}건 (백패킹 capacity 초과 = 패킹무게 의심)")
    print(f"4) 패킹부피 측정법      : 원통 {cyl} / 박스 {box} (raw 모양별 정확 환산됨)")

    print("\n[직구 vs 국내 가격차 — 같은 모델 비교]")
    for cm, dp, ip in con.execute("""
        SELECT cm, dp, ip FROM (
          SELECT p.canonical_model cm,
            MIN(CASE WHEN po.channel='국내' THEN po.price_krw END) dp,
            MIN(CASE WHEN po.channel='직구' THEN po.price_krw END) ip
          FROM products p JOIN price_observations po ON po.product_id=p.id
          WHERE p.canonical_model IS NOT NULL GROUP BY p.brand_id, p.canonical_model)
        WHERE dp IS NOT NULL AND ip IS NOT NULL ORDER BY ABS(dp-ip) DESC LIMIT 6"""):
        print(f"   {cm[:30]:32} 국내 {dp:>9,} / 직구 {ip:>9,}  (차 {dp-ip:+,})")
    con.close()
    print("\n→ 플래그는 값 유지(measured). 정확 교정은 크로스소스로 기준 통일값 덮어쓰기.")


if __name__ == "__main__":
    main()
