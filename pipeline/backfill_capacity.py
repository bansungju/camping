#!/usr/bin/env python3
"""적정인원 백필 — 다나와 태그에 '인용'이 없어 미상인 제품을, 모델명에서 추출.
예: '호넷 오스모 2P' → 2, '엘찰텐 1.5P' → 1, '돔텐트 3-4인용' → 3. 네트워크 불필요.

사용: python3 pipeline/backfill_capacity.py --db camping_tents500.db
"""
import argparse
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
P_ROOT = os.path.dirname(HERE)


def _is_tent_category(category):
    """텐트류(텐트·백패킹텐트·오토캠핑텐트·기타텐트·쉘터)에서만 'P'='인원'."""
    if not category:
        return False
    c = str(category).lower()
    return ("텐트" in category or "쉘터" in category
            or "tent" in c or "shelter" in c)


def cap_from_name(name, category=None):
    """모델명에서 적정인원 추출. category가 텐트류일 때만 단독 'P'/'p'를 인원으로 본다.

    H-84: 코펠 '20p'(조각수)·랜턴 'SFL1000P'(모델코드)·의자 '체어볼2 4P' 등에서
    'P'를 인원으로 오인하던 버그 수정. '인'/'인용'(한국어 인원 표기)은 카테고리 무관 신뢰.
    """
    if not name:
        return None
    s = name.lower()
    # L-227: '인' 뒤 '치'(인치/inch)는 인원이 아님 — '10인치 팬'·'7인치 접시' 등 비텐트 제품이
    #   capacity=10/7로 오기재(1~12 필터 통과)되던 문제 → (?!치) 부정전방탐색으로 차단. '인용'은 보존.
    m = re.search(r"(\d+)\s*[-~]\s*\d+\s*인(?!치)", s)     # '3-4인용' → 3
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+(?:\.\d+)?)\s*인(?!치)", s)        # '2인용'
    if m:
        return int(float(m.group(1)))
    # 'P'/'p' 접미사: 텐트류에서만 인원. 또한 모델코드·SKU(G1500P, Z-M812P, BR-FC1100P,
    # WFFL2P9 등 영문/하이픈에 붙은 숫자)는 lookbehind로 제외 — 숫자가 토큰 선두여야 함.
    if _is_tent_category(category):
        m = re.search(r"(?<![\w.\-])(\d+(?:\.\d+)?)\s*p\b", s)  # '2P', '1.5p'
        if m:
            return int(float(m.group(1)))
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P_ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    rows = con.execute("""
        SELECT p.id, p.model_name, c.name_ko
        FROM products p JOIN categories c ON c.id = p.category_id
        WHERE p.capacity IS NULL""").fetchall()
    filled = 0
    examples = []
    out_of_range = []   # H-84: 범위 밖 파싱값 감사용
    for pid, name, cat in rows:
        c = cap_from_name(name, cat)
        if c and 1 <= c <= 12:
            con.execute("UPDATE products SET capacity=? WHERE id=?", (c, pid))
            filled += 1
            if len(examples) < 10:
                examples.append((name, c))
        elif c is not None:
            # H-84: '0P'·'0인용'·13인 이상 등 범위 밖 값을 로그 없이 NULL 유지하면 어떤 상품이
            #       왜 누락됐는지 감사할 수 없다 → NULL은 유지하되 요검토 항목으로 기록·출력.
            out_of_range.append((pid, name, c))
    con.commit()
    before = len(rows)
    total = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    have = con.execute("SELECT COUNT(*) FROM products WHERE capacity IS NOT NULL").fetchone()[0]
    print(f"미상 {before}종 중 {filled}종 모델명에서 인원 추출")
    # M-176: 빈 DB·대상 없음으로 total=0이면 have*100//total가 ZeroDivisionError로 전체 크래시 → 가드.
    pct = (have * 100 // total) if total else 0
    print(f"적정인원 보유: {have}/{total} ({pct}%)\n")
    for n, c in examples:
        print(f"   {c}인 ← {n[:44]}")
    if out_of_range:
        print(f"\n⚠ 범위 밖 인원 파싱 {len(out_of_range)}건 (NULL 유지·요검토):")
        for pid, n, c in out_of_range[:20]:
            print(f"   · pid={pid} {c}인?? ← {n[:40]}")
        if len(out_of_range) > 20:
            print(f"   … 외 {len(out_of_range) - 20}건")
    con.close()


if __name__ == "__main__":
    main()
