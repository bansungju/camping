#!/usr/bin/env python3
"""야간 watchdog — 스스로 문제를 감지하고, 결정적인 건 자동수리, 나머진 '할 일'로 에스컬레이션.

/schedule(cron) 또는 /loop 에 물려 자는 동안 주기 실행하는 용도.
  [자동수리] 멱등 유지작업: 정규화→검증→승격 (데이터 일관성 회복)
  [감지]     커버리지/플래그/완비근접/무결성 점검
  [에스컬레이션] 사람·AI 추론이 필요한 것(크로스소스 대상 등)을 리포트로 출력
                → 다음 에이전트가 이 리포트를 읽고 처리

사용: python3 pipeline/babysit.py --db camping_tents500.db
종료코드: 0=문제없음 / 2=에스컬레이션 있음(에이전트가 작업할 것)
"""
import argparse
import os
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize_models as NM
import validate_ranges as VR
import run_all as RA

COVERAGE_MIN = {"weight_min": 90, "water_head": 70, "floor_area": 70}  # verified 내 경보 임계


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(RA.ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    issues, todos = [], []

    # ── 1) 자동수리(멱등) ──────────────────────────────
    NM.normalize_db(con)
    VR.validate_db(con)
    # M-378: promote_all(전체 pending 리셋→재승격) 도중 예외 시 demote만 남은 상태가 커밋되지 않도록
    #   rollback 후 재raise. (promote_all 자체도 D7서 SAVEPOINT 원자화 — 이중 안전.)
    try:
        RA.promote_all(con)
        con.commit()
    except Exception:
        con.rollback()
        raise

    # ── 2) 감지 ────────────────────────────────────────
    n = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    ver = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified'").fetchone()[0]

    # (a0) 가격 필수 규칙: verified인데 가격 없으면 위반(pending-무가격은 정상=이미 카탈로그 제외)
    noprice = con.execute("""SELECT COUNT(*) FROM products p WHERE p.curation_status='verified'
        AND NOT EXISTS(SELECT 1 FROM price_observations po WHERE po.product_id=p.id)""").fetchone()[0]
    if noprice:
        issues.append(f"제1규칙 위반: verified인데 가격 없는 제품 {noprice}건")

    # (a) 무결성: verified인데 '그 카테고리의 core' 가 빠졌나 (카테고리별 — 무게는 전역필수 아님)
    core_bad = 0
    for cfg in RA.CATEGORIES.values():
        core = cfg["core"]
        ph = ",".join("?" * len(core))
        for sub in cfg["subcats"]:
            core_bad += con.execute(f"""SELECT COUNT(*) FROM products p
                WHERE p.curation_status='verified'
                  AND p.category_id=(SELECT id FROM categories WHERE name_ko=?)
                  AND (SELECT COUNT(DISTINCT m.key) FROM product_spec_values v
                       JOIN metrics m ON m.id=v.metric_id AND m.key IN ({ph})
                       WHERE v.product_id=p.id AND v.valid=1) < {len(core)}""",
                [sub] + core).fetchone()[0]
    if core_bad:
        issues.append(f"무결성 위반: verified인데 카테고리 core 미충족 {core_bad}건 (승격로직 점검)")

    # (b) 미해결 이상치(implausible) 추세
    impl = con.execute("SELECT COUNT(*) FROM data_quality_flags WHERE flag_type='implausible' AND resolved=0").fetchone()[0]
    if impl:
        todos.append(f"이상치(implausible) {impl}건 — 원본 재확인 또는 크로스소스 교체 필요")

    # (c) 기준의심(무게/내수압) — 크로스소스로 기준 통일 교체 대상
    sus = con.execute("SELECT COUNT(*) FROM data_quality_flags WHERE note LIKE '[기준의심]%'").fetchone()[0]
    if sus:
        todos.append(f"기준의심 {sus}건 — 메이저는 REI 등에서 min무게/플라이HH로 교체")

    # (d) '완비 근접' pending: core 중 딱 1개만 빠진 메이저 → 크로스소스 1방이면 verified
    near = con.execute("""
        SELECT b.name_ko||' '||p.canonical_model, p.danawa_pcode
        FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        WHERE p.curation_status='pending' AND c.name_ko='백패킹텐트' AND p.capacity IS NOT NULL
          AND (SELECT COUNT(DISTINCT m.key) FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id
               AND m.key IN ('weight_min','water_head','floor_area')
               WHERE v.product_id=p.id AND v.valid=1) = 2
          AND b.name_ko IN ('니모이큅먼트','MSR','빅아그네스','씨투써밋','헬리녹스','테라노바','몽벨','제로그램')
        GROUP BY b.name_ko, p.canonical_model LIMIT 20""").fetchall()
    if near:
        todos.append(f"완비 근접 메이저 {len(near)}종 — 크로스소스 1스펙이면 verified 승격:")

    # (e) 커버리지 경보 — 백패킹텐트의 core만(전역 합산은 멀티카테고리서 오경보; water/floor는 텐트·타프 전용)
    for key, thr in COVERAGE_MIN.items():
        c = con.execute(f"""SELECT COUNT(DISTINCT v.product_id)*100/
            (SELECT COUNT(*) FROM products WHERE curation_status='verified'
             AND category_id=(SELECT id FROM categories WHERE name_ko='백패킹텐트'))
            FROM product_spec_values v JOIN metrics m ON m.id=v.metric_id AND m.key=?
            JOIN products p ON p.id=v.product_id AND p.curation_status='verified'
            AND p.category_id=(SELECT id FROM categories WHERE name_ko='백패킹텐트') WHERE v.valid=1""", (key,)).fetchone()[0]
        if c is not None and c < thr:
            issues.append(f"커버리지 경보(백패킹텐트): {key} {c}% < {thr}%")

    con.close()

    # ── 3) 리포트 ──────────────────────────────────────
    print("=" * 56)
    print(f"🌙 야간 watchdog 리포트 — 제품 {n} / verified {ver}")
    print("=" * 56)
    print(f"\n[자동수리 완료] 정규화·검증·승격 멱등 실행")
    print(f"\n[감지된 이슈] {len(issues)}건")
    for x in issues:
        print(f"   ⚠ {x}")
    print(f"\n[할 일(에이전트 처리 대상)] {len(todos)}건")
    for x in todos:
        print(f"   • {x}")
    # M-365/M-421: near(완비 근접) 목록을 [할 일] 루프 뒤에 헤더 없이 이어붙이면 리포트 파싱·가독성이
    #   깨진다 → 별도 헤더 블록으로 분리하고 항목 있을 때만 출력.
    if near:
        print(f"\n[완비 근접(크로스소스 1스펙이면 승격)] {len(near)}종")
        for name, pc in near[:10]:
            print(f"   - {name}  (pcode {pc})")

    has_work = bool(issues or todos)
    print(f"\n→ {'처리할 작업 있음(exit 2)' if has_work else '이상 없음(exit 0)'}")
    sys.exit(2 if has_work else 0)


if __name__ == "__main__":
    main()
