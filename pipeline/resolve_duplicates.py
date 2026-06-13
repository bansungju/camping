"""
resolve_duplicates.py — 중복 canonical 정리 (A3)

같은 brand_id + canonical_model + capacity로 verified가 2개 이상인 그룹에서
winner 1개를 남기고 나머지를 'pending'으로 demote.

Winner 선정 기준 (우선순위):
  1. canonical_models.min_price IS NOT NULL
  2. product_spec_values valid=1 count 많은 것
  3. id 낮은 것 (더 오래된 레코드)

canonical_models.rep_product_id도 winner로 갱신.
"""
import argparse
import sqlite3
from pathlib import Path

DB_DEFAULT = "camping_tents500.db"


def resolve(db_path: str, dry_run: bool):
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # 중복 그룹 전체
    # H-74: GROUP_CONCAT(... ORDER BY ...) 는 SQLite ≥3.44 전용. CI(ubuntu-latest)의 3.37.x에서
    #       OperationalError로 중복해소 단계가 통째로 죽는다. 정렬은 Python에서 한다(line 41).
    cur.execute("""
        SELECT brand_id, canonical_model, capacity, GROUP_CONCAT(id) as ids
        FROM products
        WHERE curation_status = 'verified'
          AND canonical_model IS NOT NULL
        GROUP BY brand_id, canonical_model, capacity
        HAVING COUNT(*) >= 2
    """)
    groups = cur.fetchall()
    print(f"[resolve_duplicates] 중복 그룹: {len(groups)}개")

    total_demoted = 0
    total_cm_updated = 0

    for brand_id, canon_model, capacity, ids_str in groups:
        pids = sorted(int(x) for x in ids_str.split(","))  # H-74: ORDER BY 대신 Python 정렬

        # H-46: min_price 는 canonical_models 의 그룹(brand_id+canonical_model+capacity) 단위 속성이다.
        #       기존엔 pid별로 rep_product_id=? 조회해 "현 rep인 pid만 가격 보유, 나머지는 None"이 됐고,
        #       None이 sort_key에서 가장 낮게(우선순위 밖) 취급돼 엉뚱한 제품이 winner로 뽑혔다.
        #       그룹키로 1회 조회하면 그룹 내 모든 후보가 동일 가격 보유여부를 공유 → 실제 차별화는
        #       spec_count·id로 결정(의도된 기준). capacity 는 INT(products)/REAL(canonical) 혼재이나
        #       SQLite `IS` 가 4 ↔ 4.0 및 NULL 을 모두 올바로 매칭한다(검증 완료).
        cur.execute(
            "SELECT min_price FROM canonical_models "
            "WHERE brand_id=? AND canonical_model=? AND capacity IS ?",
            (brand_id, canon_model, capacity),
        )
        row = cur.fetchone()
        group_min_price = row[0] if row else None

        # 각 pid의 (min_price, spec_count, id) 수집
        candidates = []
        for pid in pids:
            cur.execute(
                "SELECT COUNT(*) FROM product_spec_values WHERE product_id=? AND valid=1",
                (pid,),
            )
            spec_count = cur.fetchone()[0]

            candidates.append((pid, group_min_price, spec_count))

        # Winner: 1) min_price 있음 2) spec_count 많음 3) id 낮음
        def sort_key(c):
            pid, mp, sc = c
            has_price = 0 if mp is not None else 1  # 0=있음 우선
            return (has_price, -sc, pid)

        candidates.sort(key=sort_key)
        winner_pid = candidates[0][0]
        losers = [c[0] for c in candidates[1:]]

        if dry_run:
            print(
                f"  [DRY] winner={winner_pid} losers={losers} "
                f"| brand={brand_id} model='{canon_model}' cap={capacity}"
            )
            continue

        # losers → pending
        cur.executemany(
            "UPDATE products SET curation_status='pending' WHERE id=?",
            [(pid,) for pid in losers],
        )
        # M-308/L-189: executemany 후 cur.rowcount는 DB-API상 마지막 1회분/-1만 반환해 집계가
        #   부정확하다 → 실제 강등 대상 수(len(losers))를 직접 누산.
        total_demoted += len(losers)

        # canonical_models: rep_product_id가 loser인 행을 winner로 갱신
        for loser_pid in losers:
            cur.execute(
                "UPDATE canonical_models SET rep_product_id=? WHERE rep_product_id=?",
                (winner_pid, loser_pid),
            )
            total_cm_updated += cur.rowcount

    # M-415: 단독 실행(normalize_db 선행 없이) 시 canonical_models.rep_product_id가 이미 비-verified
    #   제품을 가리켜 export가 강등 제품의 이미지·가격을 노출할 수 있다. rowcount==0은 정상(모든 loser가
    #   rep는 아님)이라 오탐이므로, 잔존 stale rep(rep이 비-verified)를 직접 검출해 경고한다.
    stale = con.execute("""SELECT COUNT(*) FROM canonical_models cm
        JOIN products p ON p.id=cm.rep_product_id
        WHERE p.curation_status <> 'verified'""").fetchone()[0]
    if stale:
        print(f"  ⚠️  stale rep_product_id {stale}건 — rep이 비-verified 제품을 가리킴. "
              f"export 전 run_all.py(normalize_db) 선행 필요(강등 제품 노출 위험).")

    if not dry_run:
        con.commit()
        print(f"  demoted → pending: {total_demoted}건")
        print(f"  canonical_models rep 갱신: {total_cm_updated}건")
    con.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DB_DEFAULT)
    ap.add_argument("--dry-run", action="store_true", help="DB 변경 없이 결과만 출력")
    args = ap.parse_args()

    print(f"[resolve_duplicates] DB: {args.db}  dry_run={args.dry_run}")
    resolve(args.db, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
