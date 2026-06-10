#!/usr/bin/env python3
"""변화 감지 + 가격 갱신 노드 (= 별도 크롤링 노드).

기존 harvest/multicat 은 '신규 pcode 만' 적재하고 기존 제품 가격은 갱신하지 않는다.
이 노드는 그 빈칸을 채운다 — 단일 크롤 패스로:
  1) 신규 발견  : DB에 없던 pcode → 기존 인제스트 로직(HT.ingest / multicat.ingest_one) 재사용해 적재
  2) 가격 갱신  : DB에 있던 pcode → 검색가격이 바뀌었으면 새 관측치 추가(observed_at 자동 갱신)
                  값이 같아도 STALE_DAYS+ 경과면 '재확인' 관측치로 신선도 갱신
  3) 단종 후보  : on_sale 인데 이번 검색에 안 잡힌 pcode → **참고용으로만 리포트**(자동 단종처리 안 함)
  4) diff 리포트: stdout + refresh_log.md 에 날짜 섹션 누적

원칙(프로젝트 철학 그대로): 측정값만 · 추측금지 · 멱등 · 빈칸은 빈칸.
이 노드는 수확/갱신만 한다. 정규화·검증·승격·별점·export 재빌드는 run_all.py(별도)가 담당.

사용:
  python3 pipeline/refresh.py --db camping_tents500.db                 # 실제 갱신
  python3 pipeline/refresh.py --db ... --dry-run                       # 크롤+리포트만(DB 미변경)
  python3 pipeline/refresh.py --db ... --maxpages 5 --stale-days 7
  python3 pipeline/refresh.py --db ... --rebuild                       # 끝나고 run_all.py 자동 실행
"""
import argparse
import os
import sqlite3
import subprocess
import sys
import time
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import harvest_tents as HT
import multicat as M
import pipeline as P
import danawa as D

TENT_QUERIES = ["백패킹텐트", "텐트", "초경량텐트", "돔텐트"]
DTFMT = "%Y-%m-%d %H:%M:%S"


def build_tasks():
    """크롤 작업 목록 = 텐트(자가분류) + multicat 카테고리들."""
    tasks = [{"label": "텐트", "queries": TENT_QUERIES, "cfg": None}]
    for name, cfg in M.CONFIG.items():
        tasks.append({"label": name, "queries": cfg["queries"], "cfg": cfg})
    return tasks


def snapshot(con):
    """현재 DB 상태 스냅샷: pcode→pid, pid→(최신가격,관측일), on_sale pcode, rejected pid, 기존 모델명."""
    pcode2pid, on_sale, rejected = {}, set(), set()
    for pcode, pid, sale, cur in con.execute(
            "SELECT danawa_pcode, id, sale_status, curation_status FROM products WHERE danawa_pcode IS NOT NULL"):
        pcode2pid[pcode] = pid
        if cur == "rejected":
            rejected.add(pid)
        elif sale == "on_sale":
            on_sale.add(pcode)
    # SQLite: MAX(observed_at) 와 함께 쓴 bare 컬럼은 해당 행 값 → 최신 가격
    latest = {}
    for pid, price, obs in con.execute(
            "SELECT product_id, price_krw, MAX(observed_at) FROM price_observations WHERE valid=1 GROUP BY product_id"):
        latest[pid] = (price, obs)
    # 카테고리별 유효가격 중앙값 — 기준선 없는 신규확보 건의 '오등록 최저가' 판정용
    cat_median = {}
    for cid, prices in _group_prices_by_cat(con):
        cat_median[cid] = _median(prices)
    names = {r[0] for r in con.execute("SELECT model_name FROM products")}
    return pcode2pid, latest, on_sale, rejected, cat_median, names


def _group_prices_by_cat(con):
    rows = con.execute("""SELECT p.category_id, po.price_krw
        FROM price_observations po JOIN products p ON p.id=po.product_id
        WHERE po.valid=1 ORDER BY p.category_id""").fetchall()
    cur_cid, bucket = None, []
    for cid, price in rows:
        if cid != cur_cid and cur_cid is not None:
            yield cur_cid, bucket
            bucket = []
        cur_cid, _ = cid, bucket.append(price)
    if cur_cid is not None:
        yield cur_cid, bucket


def _median(xs):
    s = sorted(xs)
    n = len(s)
    if n == 0:
        return None
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


# 신규/갱신가가 기준선(직전 유효가 또는 카테고리 중앙값)의 이 비율 미만이면
# = 다나와 오등록 최저가(placeholder 셀러) 의심 → valid=0 격리 + 플래그(검토요). 추측 아님: 격리·표기만.
OUTLIER_FLOOR_RATIO = 0.30


def prod_label(con, pid):
    row = con.execute("""SELECT b.name_ko, p.model_name, c.name_ko
        FROM products p JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        WHERE p.id=?""", (pid,)).fetchone()
    return (row[0], row[1], row[2]) if row else ("?", f"pid{pid}", "?")


def age_days(now, obs):
    try:
        return (now - datetime.strptime(obs, DTFMT)).total_seconds() / 86400.0
    except (ValueError, TypeError):
        return 9e9   # 파싱불가 → 무조건 오래된 것으로(재확인 유도)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--maxpages", type=int, default=3, help="쿼리당 크롤 페이지(검색 한계=단종 후보 신뢰도)")
    ap.add_argument("--stale-days", type=int, default=7, help="값 동일해도 이 일수 경과면 신선도 재확인")
    ap.add_argument("--dry-run", action="store_true", help="크롤+리포트만, DB 미변경(롤백)")
    ap.add_argument("--rebuild", action="store_true", help="끝나고 run_all.py 자동 실행")
    args = ap.parse_args()

    if not os.path.exists(args.db):
        print(f"DB 없음: {args.db}"); return

    con = sqlite3.connect(args.db)
    M.bootstrap(con)   # 카테고리/메트릭 보장(멱등)
    now = datetime.strptime(con.execute("SELECT datetime('now')").fetchone()[0], DTFMT)
    pcode2pid, latest, on_sale, rejected, cat_median, seen_names = snapshot(con)
    pid2cat = {pid: cid for cid, pid in con.execute(
        "SELECT category_id, id FROM products WHERE danawa_pcode IS NOT NULL")}

    R = {"scanned": 0, "new": [], "changed": [], "freshened": 0, "price_new": [],
         "unchanged": 0, "no_price": 0, "skipped": 0, "quarantined": []}
    seen_run = set()   # 이번 검색에 등장한 pcode(단종 후보 판정용)
    done = set()       # 이번 run 에서 이미 처리한 pcode(중복 방지)

    print(f"■ refresh 노드 시작 — {args.db}{' [DRY-RUN]' if args.dry_run else ''}")
    for task in build_tasks():
        label, cfg = task["label"], task["cfg"]
        for q in task["queries"]:
            for page in range(1, args.maxpages + 1):
                try:
                    cands = HT.parse_results(HT.fetch_page(q, page))
                except Exception as e:
                    print(f"  ! fetch 실패 q={q} p={page}: {e}")
                    break
                if not cands:
                    break
                for c in cands:
                    R["scanned"] += 1
                    pc = c["pcode"]
                    seen_run.add(pc)
                    if pc in done:
                        continue
                    done.add(pc)
                    if pc in pcode2pid:
                        refresh_price(con, c, pcode2pid[pc], latest, now, args.stale_days,
                                      rejected, cat_median, pid2cat, R)
                    else:
                        status = (HT.ingest(con, c, seen_names) if cfg is None
                                  else M.ingest_one(con, cfg, c, seen_names))
                        if status == "ok":
                            R["new"].append((label, c["name"], c["price"]))
                        else:
                            R["skipped"] += 1
                con.commit()
                D.polite_sleep(0.8, 1.2)   # 지터(고정 간격 = 봇 지문)
            print(f"  [{label} · {q}] 누적 신규 {len(R['new'])} / 변동 {len(R['changed'])} / 스캔 {R['scanned']}")

    # 단종 후보 = on_sale 인데 이번 검색에 한 번도 안 잡힌 pcode (참고용)
    missing = sorted(on_sale - seen_run)

    if args.dry_run:
        con.rollback()
    else:
        con.commit()
    report(con, R, missing, args, now)
    con.close()

    if args.rebuild and not args.dry_run:
        print("\n■ --rebuild: run_all.py 실행")
        subprocess.run([sys.executable, os.path.join(HERE, "run_all.py"), "--db", args.db], check=True)


def refresh_price(con, c, pid, latest, now, stale_days, rejected, cat_median, pid2cat, R):
    """기존 제품 가격 갱신. 검색가가 바뀌었으면 관측치 추가, 같아도 stale 면 재확인.
    rejected(멀티팩·노네임 등)는 비교축이 오염되므로 가격 갱신/리포트에서 제외."""
    if pid in rejected:                   # 멀티팩/부적격 제품 → 가격 갱신 안 함(변동리포트 오염 방지)
        R["skipped"] += 1
        return
    price = c["price"]
    if price is None:
        R["no_price"] += 1
        return
    prev = latest.get(pid)
    # 이상치 가드: 기준선(직전 유효가 또는 카테고리 중앙값) 대비 OUTLIER_FLOOR_RATIO 미만이면
    #   = 다나와 오등록 최저가 의심 → valid=0 격리 + 플래그(추측 아님: 사실 보존+검토표기)
    ref = prev[0] if prev else cat_median.get(pid2cat.get(pid))
    is_outlier = ref is not None and price < ref * OUTLIER_FLOOR_RATIO
    if is_outlier:
        _insert_price(con, pid, price, valid=0)
        P.flag(con, pid, None, "implausible",
               f"가격 급락 이상치(다나와 오등록 의심): {price:,} vs 기준 {int(ref):,} — 검토요")
        R["quarantined"].append((pid, price, int(ref)))
    elif prev is None:                    # 기존에 가격이 아예 없던 제품 → 신규 확보
        _insert_price(con, pid, price)
        R["price_new"].append((pid, price))
    else:
        old_price, old_obs = prev
        if price != old_price:            # 가격 변동 → 새 관측치
            _insert_price(con, pid, price)
            R["changed"].append((pid, old_price, price))
        elif age_days(now, old_obs) >= stale_days:   # 값 동일하나 오래됨 → 신선도 재확인
            _insert_price(con, pid, price)
            R["freshened"] += 1
        else:
            R["unchanged"] += 1           # 최근에 확인됨 → 관측치 추가 안 함(불필요한 누적 방지)
    if not is_outlier:
        latest[pid] = (price, now.strftime(DTFMT))   # run 내 재등장 시 이중기록 방지


def _insert_price(con, pid, price, valid=1):
    con.execute("INSERT INTO price_observations(product_id,price_krw,seller,channel,valid) VALUES(?,?,?,?,?)",
                (pid, price, "다나와최저가", "danawa_search", valid))


def report(con, R, missing, args, now):
    ts = now.strftime(DTFMT)
    L = []
    L.append(f"## refresh 노드 실행 — {ts}{' (DRY-RUN)' if args.dry_run else ''}")
    L.append(f"- 크롤: 페이지당 {args.maxpages} / 후보 {R['scanned']}건 스캔 / stale {args.stale_days}일")
    L.append(f"- 요약: 신규 {len(R['new'])} · 가격변동 {len(R['changed'])} · 신선도재확인 {R['freshened']} "
             f"· 가격신규확보 {len(R['price_new'])} · 변동없음 {R['unchanged']} · 무가격 {R['no_price']} "
             f"· 이상치격리 {len(R.get('quarantined', []))} · 인제스트/rejected제외 {R['skipped']} · 단종후보 {len(missing)}")

    if R.get("quarantined"):
        L.append(f"\n### 🚧 가격 이상치 격리 {len(R['quarantined'])}건 (valid=0 + implausible 플래그 · 검토요)")
        L.append("| 카테고리 | 제품 | 격리가 | 기준 |")
        L.append("|---|---|---|---|")
        for pid, price, ref in R["quarantined"][:30]:
            b, m, cat = prod_label(con, pid)
            L.append(f"| {cat} | {b} {m} | {price:,} | {ref:,} |")

    if R["new"]:
        L.append(f"\n### 🆕 신규 제품 {len(R['new'])}건")
        L.append("| 카테고리 | 제품 | 가격 |")
        L.append("|---|---|---|")
        for cat, name, price in R["new"][:50]:
            L.append(f"| {cat} | {name} | {f'{price:,}원' if price else '—'} |")
        if len(R["new"]) > 50:
            L.append(f"| … | (외 {len(R['new'])-50}건) | |")

    if R["changed"]:
        L.append(f"\n### 💰 가격 변동 {len(R['changed'])}건")
        L.append("| 카테고리 | 제품 | 이전 | 현재 | Δ |")
        L.append("|---|---|---|---|---|")
        for pid, old, new in sorted(R["changed"], key=lambda x: abs(x[2]-x[1]), reverse=True)[:50]:
            b, m, cat = prod_label(con, pid)
            d = new - old
            pct = f"{d/old*100:+.0f}%" if old else "—"
            L.append(f"| {cat} | {b} {m} | {old:,} | {new:,} | {d:+,} ({pct}) |")
        if len(R["changed"]) > 50:
            L.append(f"| … | (외 {len(R['changed'])-50}건) | | | |")

    if R["price_new"]:
        L.append(f"\n### 🏷️ 가격 신규확보 {len(R['price_new'])}건 (기존 무가격 → 확보)")
        for pid, price in R["price_new"][:30]:
            b, m, cat = prod_label(con, pid)
            L.append(f"- [{cat}] {b} {m} — {price:,}원")

    if missing:
        L.append(f"\n### ⚠️ 단종 후보 {len(missing)}건 (참고용 · 자동 단종처리 안 함)")
        L.append(f"- 주의: 검색 {args.maxpages}페이지 한계 → 페이지 밖일 수 있음. 사람 확인 후 수동 판단.")
        L.append(f"- pcode: {', '.join(missing[:40])}{' …' if len(missing) > 40 else ''}")

    L.append("\n### 다음 단계")
    L.append("- `python3 pipeline/run_all.py` — 정규화·검증·승격·별점·export 재빌드 (신규/갱신 반영)")
    L.append("\n---\n")

    text = "\n".join(L)
    print("\n" + text)
    if not args.dry_run:
        logpath = os.path.join(ROOT, "refresh_log.md")
        header = "" if os.path.exists(logpath) else "# refresh 노드 로그 (변화 감지 + 가격 갱신)\n\n"
        with open(logpath, "a", encoding="utf-8") as f:
            f.write(header + text + "\n")
        print(f"\n→ refresh_log.md 에 기록")


if __name__ == "__main__":
    main()
