#!/usr/bin/env python3
"""모델 정규화 — 색상/옵션 변형을 하나의 대표 모델로 통합.

대량 수집 시 발견된 문제: MIER 4색, 씨투써밋 그레이/그린, '...해외구매' 등이
서로 다른 제품으로 등록 → 고유 모델 수가 부풀려짐.
이 스크립트는 (브랜드, 색상제거 모델명, 인원)으로 그룹핑해 고유 모델을 산출.

사용: python3 pipeline/normalize_models.py --db camping_tents500.db
"""
import argparse
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pipeline as P

# 색상 토큰 (정확 일치 시에만 변형으로 간주 → 모델명 오삭제 방지)
COLORS = {
    "블랙", "화이트", "그레이", "그레이지", "차콜", "아이보리", "베이지", "브라운", "탄", "샌드",
    "그린", "다크그린", "라이트그린", "카키", "그린카키", "다크카키", "라이트카키", "올리브",
    "레드", "옐로우", "오렌지", "블루", "오션블루", "스카이블루", "네이비", "퍼플", "핑크",
    "민트", "머스타드", "카멜", "버건디", "그레이톤", "샌드모스",
    "black", "white", "gray", "grey", "green", "khaki", "red", "blue", "navy", "olive", "sand",
}
NOISE = {"해외구매", "정품", "국내정품", "당일발송", "당일출고", "신형", "구형"}


def canonicalize(name):
    """반환: (대표모델명, 변형라벨). 괄호색상·색상토큰·노이즈 제거."""
    s = re.sub(r"\(([^)]*)\)", lambda m: " " if _is_variant_paren(m.group(1)) else m.group(0), name)
    kept, variant = [], []
    for tok in s.split():
        t = tok.strip(",./|").lower()
        raw = tok.strip(",./|")
        if raw in COLORS or t in COLORS or raw in NOISE:
            variant.append(raw)
        else:
            kept.append(raw)
    # 인접 중복 토큰 제거: '자충매트 자충매트' → '자충매트' (수집 표기 stutter 정리)
    dedup = []
    for t in kept:
        if not dedup or dedup[-1].lower() != t.lower():
            dedup.append(t)
    canon = re.sub(r"\s+", " ", " ".join(dedup)).strip()
    return canon, " ".join(variant)


def _is_variant_paren(inner):
    """괄호 내용이 색상/노이즈뿐이면 제거 대상."""
    toks = [x.strip().lower() for x in re.split(r"[ ,/]", inner) if x.strip()]
    return bool(toks) and all(t in COLORS or t in NOISE for t in toks)


def flag_price_outliers(con):
    """canonical 그룹(같은 브랜드·모델·인원, 관측≥3) 내 중앙값 대비 [0.2×,5×] 밖 가격을
    valid=0으로 격리. 부속·옵션·오타 단가(예: 2,199원/140만원)가 모델 min/max를 오염하는 것 차단.
    관측<3 그룹은 중앙값 신뢰불가 → 미적용(일반명 2개짜리 과격리 방지). 멱등."""
    try:
        con.execute("ALTER TABLE price_observations ADD COLUMN valid INTEGER NOT NULL DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    con.execute("UPDATE price_observations SET valid=1")
    groups = con.execute("""SELECT p.brand_id, p.canonical_model, IFNULL(p.capacity,-1)
        FROM products p GROUP BY p.brand_id, p.canonical_model, IFNULL(p.capacity,-1)""").fetchall()
    for bid, cm, cap in groups:
        rows = con.execute("""SELECT po.id, po.price_krw FROM price_observations po
            JOIN products p ON p.id=po.product_id
            WHERE p.brand_id=? AND p.canonical_model=? AND IFNULL(p.capacity,-1)=?
              AND po.price_krw IS NOT NULL ORDER BY po.price_krw""", (bid, cm, cap)).fetchall()
        if len(rows) < 3:
            continue
        prices = [r[1] for r in rows]
        med = prices[len(prices) // 2]
        if med <= 0:
            continue
        for oid, pr in rows:
            if pr < med * 0.2 or pr > med * 5:
                con.execute("UPDATE price_observations SET valid=0 WHERE id=?", (oid,))
    # 브랜드+카테고리 패스: 단일관측이라 canonical그룹(≥3)에 안 걸리는 '고립 봉우리' 고가 격리.
    #   조건: 같은 브랜드·카테고리 중앙값 15배 초과 & 50만원 초과(그룹≥3)
    #     AND 카테고리 내 다른 제품 중 그 가격의 절반 이상이 하나도 없을 때(=정상 고가티어 아님).
    #   → 카즈미 의자 1.66M(다른 의자 max 357k)은 격리, Morui 파워스테이션 667k(EcoFlow 등 수백만원
    #     존재)는 정상티어라 미격리. 도메인 고가티어를 오격리하지 않는 안전장치.
    for bid, cid in con.execute("SELECT p.brand_id, p.category_id FROM products p "
                                "GROUP BY p.brand_id, p.category_id").fetchall():
        rows = con.execute("""SELECT po.id, po.price_krw, po.product_id FROM price_observations po
            JOIN products p ON p.id=po.product_id
            WHERE p.brand_id=? AND p.category_id=? AND po.price_krw IS NOT NULL AND po.valid=1
            ORDER BY po.price_krw""", (bid, cid)).fetchall()
        if len(rows) < 3:
            continue
        prices = [r[1] for r in rows]
        med = prices[len(prices) // 2]
        if med <= 0:
            continue
        for oid, pr, pid in rows:
            if pr > med * 15 and pr > 500000:
                peer = con.execute("""SELECT 1 FROM price_observations po JOIN products p ON p.id=po.product_id
                    WHERE p.category_id=? AND po.product_id<>? AND po.valid=1 AND po.price_krw>=?
                    LIMIT 1""", (cid, pid, pr / 2)).fetchone()
                if not peer:                       # 카테고리 내 고립 봉우리 → 비현실 오기
                    con.execute("UPDATE price_observations SET valid=0 WHERE id=?", (oid,))
    con.commit()


def normalize_db(con):
    """모델 정규화 적용 + canonical_models 롤업 재생성. 반환 (raw, uniq, collapsed)."""
    for col in ("canonical_model TEXT", "variant_label TEXT"):
        try:
            con.execute(f"ALTER TABLE products ADD COLUMN {col}")
        except sqlite3.OperationalError:
            pass
    GENERIC = {"아이스박스", "테이블", "코펠", "웨건", "화로대", "랜턴", "의자", "텐트", "타프",
               "침낭", "매트", "버너", "파워뱅크", "야전침대", "쿨러", "체어", ""}
    for pid, name, pc in con.execute("SELECT id, model_name, danawa_pcode FROM products").fetchall():
        canon, var = canonicalize(name or "")
        if canon in GENERIC or len(canon) < 2:   # 모델명 사실상 없음 → pcode로 분리(오병합 방지)
            canon = f"{canon or name}#{pc}"
        con.execute("UPDATE products SET canonical_model=?, variant_label=? WHERE id=?",
                    (canon, var or None, pid))
    con.commit()
    # 공백변형 통일: '아이스 쿨러' vs '아이스쿨러'처럼 내부 공백차로 같은 제품이
    #   다른 canonical로 갈리는 것 방지. (brand+capacity+공백제거형) 같으면 최빈 표기로 통일.
    from collections import Counter, defaultdict
    sp = defaultdict(list)
    for pid, bid, cm, cap in con.execute(
            "SELECT id, brand_id, canonical_model, IFNULL(capacity,-1) FROM products").fetchall():
        sp[(bid, cm and re.sub(r"\s+", "", cm), cap)].append((pid, cm))  # key: 브랜드+공백제거형+인원
    for key, members in sp.items():
        forms = [cm for _, cm in members]
        if len(set(forms)) <= 1:
            continue
        rep = Counter(forms).most_common(1)[0][0]   # 최빈 표기 채택
        for pid, cm in members:
            if cm != rep:
                con.execute("UPDATE products SET canonical_model=? WHERE id=?", (rep, pid))
    con.commit()
    # 브랜드 접두 제거: model이 브랜드명으로 시작하면 제거(사이트 brand셀+model셀 중복노출 방지).
    #   예 콜맨 "콜맨 투어링 돔…" → "투어링 돔…". 남는 모델명 ≥2자일 때만.
    bmap = dict(con.execute("SELECT id, name_ko FROM brands").fetchall())
    for pid, bid, cm in con.execute("SELECT id, brand_id, canonical_model FROM products").fetchall():
        bn = bmap.get(bid)
        if not bn or not cm:
            continue
        if cm.lower().startswith(bn.lower() + " "):
            stripped = cm[len(bn):].strip()
            if len(stripped) >= 2:
                con.execute("UPDATE products SET canonical_model=? WHERE id=?", (stripped, pid))
    con.commit()
    flag_price_outliers(con)   # 부속·오타 단가 격리(valid=0) → 아래 집계서 제외
    con.execute("DROP TABLE IF EXISTS canonical_models")
    con.execute("""CREATE TABLE canonical_models AS
        SELECT MIN(p.id) AS rep_product_id, p.brand_id, p.category_id,
               b.name_ko AS brand, p.canonical_model, p.capacity,
               COUNT(*) AS variant_count,
               GROUP_CONCAT(DISTINCT p.variant_label) AS variants,
               GROUP_CONCAT(p.danawa_pcode) AS pcodes,
               -- 채널혼입 차단: 국내가 우선, 국내가 없을 때만 직구 fallback(직구 lowball 오염 방지)
               COALESCE(
                 (SELECT MIN(po.price_krw) FROM price_observations po JOIN products p2 ON p2.id=po.product_id
                   WHERE p2.brand_id=p.brand_id AND p2.canonical_model=p.canonical_model
                     AND IFNULL(p2.capacity,-1)=IFNULL(p.capacity,-1) AND po.valid=1 AND po.channel='국내'),
                 (SELECT MIN(po.price_krw) FROM price_observations po JOIN products p2 ON p2.id=po.product_id
                   WHERE p2.brand_id=p.brand_id AND p2.canonical_model=p.canonical_model
                     AND IFNULL(p2.capacity,-1)=IFNULL(p.capacity,-1) AND po.valid=1)) AS min_price,
               COALESCE(
                 (SELECT MAX(po.price_krw) FROM price_observations po JOIN products p2 ON p2.id=po.product_id
                   WHERE p2.brand_id=p.brand_id AND p2.canonical_model=p.canonical_model
                     AND IFNULL(p2.capacity,-1)=IFNULL(p.capacity,-1) AND po.valid=1 AND po.channel='국내'),
                 (SELECT MAX(po.price_krw) FROM price_observations po JOIN products p2 ON p2.id=po.product_id
                   WHERE p2.brand_id=p.brand_id AND p2.canonical_model=p.canonical_model
                     AND IFNULL(p2.capacity,-1)=IFNULL(p.capacity,-1) AND po.valid=1)) AS max_price
        FROM products p JOIN brands b ON b.id=p.brand_id
        GROUP BY p.brand_id, p.canonical_model, p.capacity""")
    con.commit()
    raw = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    uniq = con.execute("SELECT COUNT(*) FROM canonical_models").fetchone()[0]
    collapsed = con.execute("SELECT COUNT(*) FROM canonical_models WHERE variant_count>1").fetchone()[0]
    return raw, uniq, collapsed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    normalize_db(con)

    raw = con.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    uniq = con.execute("SELECT COUNT(*) FROM canonical_models").fetchone()[0]
    collapsed = con.execute("SELECT COUNT(*) FROM canonical_models WHERE variant_count>1").fetchone()[0]
    merged_rows = con.execute("SELECT SUM(variant_count) FROM canonical_models WHERE variant_count>1").fetchone()[0] or 0

    print("=" * 64)
    print("모델 정규화 결과")
    print("=" * 64)
    print(f"  원본 등록 제품: {raw}개")
    print(f"  고유 모델     : {uniq}개   (← {raw-uniq}개 변형 통합)")
    print(f"  변형 보유 모델: {collapsed}개 (이 안에 {merged_rows}개 행이 뭉쳐짐)")

    print("\n[가장 많이 통합된 모델 TOP 15]")
    for brand, cm, cap, vc, variants, mn, mx in con.execute("""
        SELECT brand, canonical_model, capacity, variant_count, variants, min_price, max_price
        FROM canonical_models WHERE variant_count>1 ORDER BY variant_count DESC, brand LIMIT 15"""):
        cap_s = f"{cap}인" if cap else "-"
        price_s = f"{mn:,}~{mx:,}원" if mn and mx and mn != mx else (f"{mn:,}원" if mn else "가격?")
        vs = (variants or "").replace(",", "/")[:30]
        print(f"   ×{vc}  [{cap_s}] {brand} {cm[:26]:28} 색상:{vs:14} {price_s}")

    print("\n[정규화 예시 — 변형이 라벨로 분리됨]")
    for name, cm, var in con.execute("""
        SELECT model_name, canonical_model, variant_label FROM products
        WHERE variant_label IS NOT NULL ORDER BY id LIMIT 8"""):
        print(f"   '{name[:34]}'  →  모델:'{cm[:26]}' + 변형:'{var}'")

    print(f"\ncanonical_models 테이블 생성됨 ({uniq} rows). DB: {args.db}")
    con.close()


if __name__ == "__main__":
    main()
