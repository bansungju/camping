#!/usr/bin/env python3
"""상품 대표 이미지 점진 수집 — 다나와 og:image만 저장(추측 없음·멱등).

원칙: 실제 상품페이지의 og:image URL만 저장. 없으면 'none'으로 박제(재시도 방지),
네트워크 오류는 NULL 유지(다음 회차 재시도). 카테고리 1개씩 천천히 채운다.

사용:
  python3 pipeline/collect_images.py --next            # 다음 미완성 카테고리 1개 수집(루프용)
  python3 pipeline/collect_images.py --cat 백패킹텐트   # 특정 카테고리
"""
import argparse
import os
import re
import sqlite3
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import danawa  # noqa: E402

ROOT = os.path.dirname(HERE)
OG = re.compile(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', re.I)


def norm(u):
    """캐시버전(_v) 제거 + 썸네일 크기 키워(상세 모달용 ~500px)."""
    u = re.sub(r'[?&]_v=\d+', '', u)
    u = re.sub(r'shrink=\d+:\d+', 'shrink=500:500', u)
    return u


def ensure_col(con):
    cols = [r[1] for r in con.execute("PRAGMA table_info(products)")]
    if "image_url" not in cols:
        con.execute("ALTER TABLE products ADD COLUMN image_url TEXT")
        con.commit()


def pending_count(con, cat):
    return con.execute("""SELECT COUNT(*) FROM products p JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko=? AND p.curation_status='verified' AND p.danawa_pcode IS NOT NULL
          AND p.image_url IS NULL""", (cat,)).fetchone()[0]


def pick_next(con):
    """이미지 미수집(NULL)이 남은 카테고리를 id순으로 1개 선택."""
    for (cat,) in con.execute("SELECT name_ko FROM categories ORDER BY id"):
        if pending_count(con, cat) > 0:
            return cat
    return None


def collect(con, cat, limit, sleep):
    rows = con.execute("""SELECT p.id, p.danawa_pcode FROM products p JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko=? AND p.curation_status='verified' AND p.danawa_pcode IS NOT NULL
          AND p.image_url IS NULL ORDER BY p.id LIMIT ?""", (cat, limit)).fetchall()
    print(f"[{cat}] 수집 대상 {len(rows)}개")
    ok = none = err = 0
    for pid, pcode in rows:
        try:
            html = danawa.fetch(pcode)
            m = OG.search(html)
            if m:
                con.execute("UPDATE products SET image_url=? WHERE id=?", (norm(m.group(1)), pid)); ok += 1
            else:
                con.execute("UPDATE products SET image_url='none' WHERE id=?", (pid,)); none += 1
            con.commit()
        except Exception:
            err += 1  # NULL 유지 → 다음 회차 재시도
        danawa.polite_sleep(sleep, sleep)   # sleep ~ 2*sleep 지터(고정 간격 = 봇 지문)
    print(f"[{cat}] 완료: 이미지 {ok} · 없음 {none} · 오류(재시도) {err}")
    return ok, none, err


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--cat")
    ap.add_argument("--next", action="store_true")
    ap.add_argument("--limit", type=int, default=100000)
    ap.add_argument("--sleep", type=float, default=0.8)
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    ensure_col(con)
    cat = args.cat or (pick_next(con) if args.next else None)
    if not cat:
        print("수집할 카테고리 없음(전부 완료)" if args.next else "--cat 또는 --next 필요")
        return
    collect(con, cat, args.limit, args.sleep)
    # 전체 진행률
    done = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified' AND image_url IS NOT NULL").fetchone()[0]
    tot = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified' AND danawa_pcode IS NOT NULL").fetchone()[0]
    print(f"전체 이미지 진행: {done}/{tot} ({round(100*done/tot)}%)")
    con.close()


if __name__ == "__main__":
    main()
