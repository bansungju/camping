#!/usr/bin/env python3
"""상품 이미지 로컬 다운로드 — site/images/<product_id>.jpg 에 저장.

image_url (원본 CDN URL) 는 건드리지 않고, image_local 컬럼에 상대경로 저장.
export_site.py 가 image_local 우선, 없으면 image_url fallback으로 쓸 수 있게.

사용:
  python3 pipeline/download_images.py              # 전체 미완료 다운로드
  python3 pipeline/download_images.py --workers 8  # 병렬 수 조정 (기본 6)
  python3 pipeline/download_images.py --cat 침낭   # 특정 카테고리만
"""
import argparse
import os
import random
import re
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMG_DIR = os.path.join(ROOT, "site", "images")
DB_PATH = os.path.join(ROOT, "camping_tents500.db")

HEADERS = {
    # UA를 다른 크롤 모듈(danawa.py)과 동일 버전으로 통일 — 한 프로젝트가 서로 다른 UA를
    # 쓰면 패턴이 어색해 봇 신호가 된다.
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.danawa.com/",
    "Sec-Fetch-Dest": "image",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "cross-site",
}
EXT_RE = re.compile(r'\.(jpe?g|webp|png|avif)', re.I)


def ensure_col(con):
    cols = [r[1] for r in con.execute("PRAGMA table_info(products)")]
    if "image_local" not in cols:
        con.execute("ALTER TABLE products ADD COLUMN image_local TEXT")
        con.commit()


def local_path(pid: int, url: str) -> str:
    """site/images/<pid>.jpg — 항상 .jpg 로 통일 (danuri는 실제로 jpeg)."""
    m = EXT_RE.search(url.split("?")[0])
    ext = m.group(1).lower() if m else "jpg"
    ext = "jpg" if ext == "jpeg" else ext
    return os.path.join(IMG_DIR, f"{pid}.{ext}")


def rel_path(abs_path: str) -> str:
    """site/ 기준 상대경로."""
    return os.path.relpath(abs_path, os.path.join(ROOT, "site"))


def download_one(pid: int, url: str, sleep: float) -> tuple:
    """(pid, 'ok'|'skip'|'err', detail)"""
    dest = local_path(pid, url)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return pid, "skip", dest

    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=10) as resp:
            data = resp.read()
        if len(data) < 500:
            return pid, "err", f"too small ({len(data)}B)"
        with open(dest, "wb") as f:
            f.write(data)
        time.sleep(sleep + random.random() * sleep)   # sleep~2*sleep 지터(고정 간격 회피)
        return pid, "ok", dest
    except (HTTPError, URLError, OSError) as e:
        return pid, "err", str(e)


def run(db_path, cat, workers, sleep):
    con = sqlite3.connect(db_path)
    ensure_col(con)

    where = ""
    params: list = []
    if cat:
        where = "AND c.name_ko=?"
        params.append(cat)

    rows = con.execute(f"""
        SELECT p.id, p.image_url FROM products p
        JOIN categories c ON c.id=p.category_id
        WHERE p.image_url IS NOT NULL AND p.image_url!='none'
          AND (p.image_local IS NULL
               OR NOT EXISTS (SELECT 1 FROM (SELECT 1) WHERE
                 length(p.image_local)>0))
          {where}
        ORDER BY p.id
    """, params).fetchall()

    # already-downloaded (image_local set, file exists) 는 제외했지만
    # image_local 은 있어도 파일 없을 수 있으니 download_one 에서 skip 처리
    total = len(rows)
    print(f"다운로드 대상: {total}개 (workers={workers}, sleep={sleep}s/req)")

    ok = skip = err = 0
    done = 0

    def update_db(pid, abs_path):
        con.execute("UPDATE products SET image_local=? WHERE id=?",
                    (rel_path(abs_path), pid))
        con.commit()

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futs = {pool.submit(download_one, pid, url, sleep): pid
                for pid, url in rows}
        for fut in as_completed(futs):
            pid, status, detail = fut.result()
            done += 1
            if status == "ok":
                ok += 1
                update_db(pid, detail)
            elif status == "skip":
                skip += 1
                update_db(pid, detail)  # image_local 이 없었던 경우 채워주기
            else:
                err += 1
            if done % 100 == 0 or done == total:
                print(f"  [{done}/{total}] ok={ok} skip={skip} err={err}")

    con.close()
    print(f"\n완료 — 저장={ok} 스킵={skip} 오류={err}  /  총 {total}개")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DB_PATH)
    ap.add_argument("--cat", default=None)
    ap.add_argument("--workers", type=int, default=3)   # 6→3: 동일 호스트에 덜 공격적(정중)
    ap.add_argument("--sleep", type=float, default=0.6)  # 0.3→0.6 + 지터
    args = ap.parse_args()
    os.makedirs(IMG_DIR, exist_ok=True)
    run(args.db, args.cat, args.workers, args.sleep)


if __name__ == "__main__":
    main()
