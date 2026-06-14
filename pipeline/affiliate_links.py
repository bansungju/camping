#!/usr/bin/env python3
"""제휴 링크 생성 — 하이브리드 fallback 레이어.

원칙(이미지 fallback과 동일 패턴):
  상품 딥링크(정확, 쿠팡 파트너스 API로 매칭 시 채움) → 검색 딥링크(fallback, 항상 생성).

키 없이 지금 테스트 가능한 부분 = 검색 딥링크 생성.
상품 딥링크/어필리에이트 태깅은 파트너스 Open API 키 발급 후 채운다(coupang_url 컬럼).

사용:
  python3 pipeline/affiliate_links.py --sample 15      # 다양한 브랜드 샘플 링크 미리보기
  python3 pipeline/affiliate_links.py --partners-tag AF1234567  # 어필리에이트 태그 포함(있으면)
"""
import argparse
import os
import sqlite3
from urllib.parse import quote_plus

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "camping_tents500.db")


def build_query(brand: str, model: str) -> str:
    """검색 쿼리 = 브랜드 + 모델명. 중복 토큰 제거(모델명에 브랜드 포함된 경우)."""
    q = f"{brand} {model}".strip()
    # 모델명이 이미 브랜드로 시작하면 중복 제거
    if model.lower().startswith(brand.lower()):
        q = model
    return " ".join(q.split())


def coupang_search(query: str, tag=None) -> str:
    """쿠팡 검색 딥링크. tag가 있으면 &channel= 부착.

    M-315 주의: `&channel=`은 쿠팡 파트너스 '공식 추적 파라미터가 아니다'(커미션 추적 효과 없음).
    실제 추적은 파트너스 API로 생성한 `link.coupang.com/a/...` 단축링크 또는 subId가 필요하며,
    API는 누적매출 15만원 이후 발급된다(메모리 coupang-partners-monetization). API 확보 전까지
    이 링크는 '사용자 편의용 검색 진입'일 뿐 수익 추적은 되지 않는다.
    """
    url = f"https://www.coupang.com/np/search?q={quote_plus(query)}"
    if tag:
        url += f"&channel={quote_plus(tag)}"  # 추적 아님(위 주석) — 채널 메모용
    return url


def naver_search(query: str) -> str:
    """네이버 쇼핑 검색 딥링크(fallback의 fallback — 쿠팡 미스 시 대안 채널)."""
    return f"https://search.shopping.naver.com/search/all?query={quote_plus(query)}"


def resolve_buy_link(row: dict, tag=None) -> dict:
    """상품 딥링크(coupang_url) 우선 → 검색 딥링크 fallback. 이미지 fallback과 동형."""
    if row.get("coupang_url"):
        return {"href": row["coupang_url"], "kind": "product", "channel": "coupang"}
    q = build_query(row["brand"], row["model"])
    return {"href": coupang_search(q, tag), "kind": "search", "channel": "coupang",
            "naver_fallback": naver_search(q)}


def sample(db_path: str, n: int, tag):
    con = sqlite3.connect(db_path)
    # 브랜드 다양성: 브랜드당 1개씩 라운드로빈
    # M-536: `GROUP BY b.name_ko`로 model/cat/cap을 비집계 선택하면 브랜드 대표행이 비결정적이고
    #   (SQLite는 같은 행에서 뽑지만 어느 행인지 불특정), 타 DB 이식 시 컬럼이 서로 다른 행에서 뽑혀
    #   스펙이 혼용될 수 있다 → 브랜드당 1행(rep=가장 낮은 p.id)을 명시적으로 골라 결정화.
    rows = con.execute("""
        SELECT brand, model, cat, cap FROM (
            SELECT b.name_ko brand, p.canonical_model model, c.name_ko cat, p.capacity cap,
                   ROW_NUMBER() OVER (PARTITION BY b.name_ko ORDER BY p.id) rn
            FROM products p
            JOIN brands b ON b.id=p.brand_id
            JOIN categories c ON c.id=p.category_id
            WHERE p.curation_status='verified' AND p.canonical_model IS NOT NULL
        ) WHERE rn=1
        ORDER BY RANDOM() LIMIT ?""", (n,)).fetchall()
    con.close()

    print(f"\n{'브랜드':12} {'모델':24} {'카테고리':10} 쿠팡 검색 딥링크 / 네이버 fallback")
    print("─" * 100)
    for brand, model, cat, cap in rows:
        link = resolve_buy_link({"brand": brand, "model": model}, tag)
        m = (model[:22] + "…") if len(model) > 23 else model
        print(f"{brand:12} {m:24} {cat:10}")
        print(f"   쿠팡: {link['href']}")
        # M-287/L-188: coupang_url 직접링크 분기는 naver_fallback 키가 없다 → KeyError 방지.
        print(f"   네이버: {link.get('naver_fallback', '(직접링크)')}")
        print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DB_PATH)
    ap.add_argument("--sample", type=int, default=12)
    ap.add_argument("--partners-tag", default=None, help="쿠팡 파트너스 채널 ID(있으면)")
    args = ap.parse_args()
    sample(args.db, args.sample, args.partners_tag)


if __name__ == "__main__":
    main()
