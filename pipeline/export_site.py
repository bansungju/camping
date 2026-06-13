#!/usr/bin/env python3
"""정적 사이트용 데이터 익스포트 — DB → site/data/*.json.

설계: 비교 단위 = canonical 모델(색상/구매처 변형 dedup). verified만.
각 모델·지표에 value/stars/badge(확정·참고·외형기준·데이터부족) 부착.
별점·한계등급은 1단계 산출물(ratings, LIMITS 로직) 그대로 사용 = 정직성 일관.

사용: python3 pipeline/export_site.py --db camping_tents500.db
"""
import argparse
import json
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import limits_map as LM
import value_metric as VM

# 카테고리 한글명 → URL 슬러그
SLUG = {
    "백패킹텐트": "backpacking-tent", "백패킹가방": "backpacking-bag", "오토캠핑텐트": "auto-tent",
    "쉘터": "shelter", "기타용품": "misc",
    "타프": "tarp", "침낭": "sleeping-bag", "매트": "mat", "의자": "chair", "테이블": "table",
    "아이스박스": "cooler", "버너": "burner", "코펠": "cookware", "랜턴": "lantern",
    "야전침대": "cot", "웨건": "wagon", "화로대": "firepit", "파워뱅크": "powerbank",
}


def metric_badge(key, source_id, star_eligible, has_value, confidence=None):
    if not has_value:
        return "데이터부족"
    if key == "floor_area" and star_eligible == 0:
        return "외형기준"           # footprint(이너 미상) — 별점 제외분
    # source_id 1-3(다나와 계열)은 확정; source_id 4+(외부/OCR)는 confidence로 판단
    if source_id is not None and source_id >= 4 and confidence in ("medium", "low"):
        return "참고"
    return "확정"


def export(con, outdir):
    os.makedirs(outdir, exist_ok=True)
    # 쿠팡 파트너스 링크: seed_coupang.py --load 로 products.coupang_url 에 적재됨(수동 SSOT=coupang_links.csv).
    # 컬럼이 있을 때만 방출(미적용 DB에서도 export가 깨지지 않게).
    has_coupang = "coupang_url" in [r[1] for r in con.execute("PRAGMA table_info(products)")]
    rows = LM.build(con)            # 1단계 한계등급 로직 재사용
    grade_by_cat = {r["cat"]: r["grade"] for r in rows}
    cat_meta = []
    search_index = []               # 전역 검색용(홈): {b,m,c,s,cap}

    for cid, cat in con.execute("SELECT id, name_ko FROM categories ORDER BY id").fetchall():
        nv = con.execute("SELECT COUNT(*) FROM products WHERE category_id=? AND curation_status='verified'",
                         (cid,)).fetchone()[0]
        if nv == 0:
            continue
        slug = SLUG.get(cat, f"cat{cid}")
        # 지표 메타(★별점지표 + 가격) — 충전율/한계 포함
        metrics = []
        for mid, key, lab, unit, direction, star in con.execute(
                """SELECT id,key,label_ko,unit,direction,is_star_metric FROM metrics
                   WHERE category_id=? ORDER BY is_star_metric DESC, id""", (cid,)):
            pct, _, _ = LM.fill_rate(con, mid)
            metrics.append({"key": key, "label": lab, "unit": unit or "", "direction": direction,
                            "is_star": bool(star), "fill": pct, "limit": star and pct < LM.GOOD})
        star_metrics = [m for m in metrics if m["is_star"]]

        # 모델(canonical dedup) 행
        models = []
        reps = con.execute("""SELECT MIN(p.id) rep, b.name_ko brand, p.canonical_model,
                   p.capacity, COUNT(*) variants,
                   (SELECT p2.gf_code FROM products p2
                    WHERE p2.brand_id=p.brand_id AND p2.canonical_model=p.canonical_model
                    AND IFNULL(p2.capacity,-1)=IFNULL(p.capacity,-1)
                    AND p2.curation_status='verified' ORDER BY p2.id LIMIT 1) gf_code,
                   p.brand_id
            FROM products p JOIN brands b ON b.id=p.brand_id
            WHERE p.category_id=? AND p.curation_status='verified'
            GROUP BY p.brand_id, p.canonical_model, IFNULL(p.capacity,-1)
            ORDER BY b.name_ko, p.canonical_model""", (cid,)).fetchall()
        for rep, brand, cm, cap, variants, gf_code, brand_id in reps:
            specs = {}
            for m in star_metrics:
                row = con.execute("""SELECT v.value_normalized, v.source_id, v.star_eligible, v.confidence
                    FROM product_spec_values v JOIN metrics mt ON mt.id=v.metric_id
                    WHERE v.product_id=? AND mt.key=? AND v.valid=1 LIMIT 1""",
                    (rep, m["key"])).fetchone()
                val = row[0] if row else None
                src = row[1] if row else None
                se = row[2] if row else 1
                conf = row[3] if row else None
                stars = con.execute("""SELECT r.stars FROM ratings r JOIN metrics mt ON mt.id=r.metric_id
                    WHERE r.product_id=? AND mt.key=?""", (rep, m["key"])).fetchone()
                specs[m["key"]] = {
                    "value": round(val, 2) if val is not None else None,
                    "stars": stars[0] if stars else None,
                    "badge": metric_badge(m["key"], src, se, val is not None, conf),
                }
            # H-52: JOIN 제거 → brand_id/canonical_model/capacity 직접 조회.
            # 기존 JOIN은 canonical_models 중복 시 엉뚱한 행 리턴 위험 + NULL canonical_model 비교 오류.
            pr = con.execute("""SELECT min_price, max_price FROM canonical_models
                WHERE brand_id=? AND canonical_model IS ? AND IFNULL(capacity,-1)=IFNULL(?,-1)
                LIMIT 1""", (brand_id, cm, cap)).fetchone()
            # 대표 이미지 — image_local(로컬파일) 우선, 없으면 image_url(CDN) fallback
            imgr = con.execute("""SELECT COALESCE(p2.image_local, p2.image_url)
                FROM products p2
                WHERE p2.brand_id=(SELECT brand_id FROM products WHERE id=?)
                  AND p2.canonical_model=? AND IFNULL(p2.capacity,-1)=IFNULL(?,-1)
                  AND p2.image_url IS NOT NULL AND p2.image_url<>'none'
                ORDER BY p2.image_local IS NULL ASC
                LIMIT 1""", (rep, cm, cap)).fetchone()
            mdict = {
                "gf_code": gf_code,
                "brand": brand, "model": cm, "capacity": cap, "variants": variants,
                "price_min": pr[0] if pr else None, "price_max": pr[1] if pr else None,
                "img": imgr[0] if imgr else None,
                "specs": specs,
            }
            if has_coupang:
                # 링크는 coupang_links.csv(rep_product_id=canonical_models.rep_product_id)로 적재됨.
                # 가격과 '동일한' canonical_models 조인으로 그 rep의 coupang_url을 읽는다 →
                # rep가 'pending' 변형이라 export rep(MIN verified id)과 달라도 정확히 매칭(이전 그룹조회는 capacity 변형서 3건 누락).
                cu = con.execute("""SELECT pr2.coupang_url
                    FROM canonical_models cm2
                    JOIN products p ON p.id=?
                    JOIN products pr2 ON pr2.id=cm2.rep_product_id
                    WHERE cm2.brand_id=p.brand_id AND cm2.canonical_model=p.canonical_model
                    AND IFNULL(cm2.capacity,-1)=IFNULL(p.capacity,-1)
                    AND pr2.coupang_url IS NOT NULL""", (rep,)).fetchone()
                if cu and cu[0]:
                    mdict["coupang_url"] = cu[0]   # 쿠팡 딥링크(있을 때만 키 추가 — 기존 JSON 형태 유지)
            mdict["_rep_id"] = rep  # 가성비 패스용 임시 키
            models.append(mdict)
            search_index.append({"b": brand, "m": cm, "c": cat, "s": slug, "cap": cap,
                                 "p": pr[0] if pr else None,
                                 "img": imgr[0] if imgr else None,
                                 "g": gf_code})

        # 가성비 후처리 패스 — value_metric.CATEGORY_CONFIG에 있는 카테고리만
        if slug in VM.CATEGORY_CONFIG:
            cfg = VM.CATEGORY_CONFIG[slug]
            metrics_meta = {m["key"]: {"direction": m["direction"]} for m in metrics}
            # models에 id 필드 채워서 compute 호출
            vm_models = [{"id": m["_rep_id"], "price_min": m["price_min"], "specs": m["specs"]}
                         for m in models]
            vm_results = VM.compute_value_score(vm_models, cfg, metrics_meta)
            id_to_vm = {r["id"]: r for r in vm_results}
            for m in models:
                r = id_to_vm.get(m["_rep_id"])
                if r and r["stars"] is not None:
                    m["specs"][cfg["value_key"]] = {
                        "value": r["value_display"],
                        "stars": r["stars"],
                        "badge": "참고",
                    }
            # metrics 목록에 가성비 추가 (중복 방지)
            vkey = cfg["value_key"]
            if not any(mt["key"] == vkey for mt in metrics):
                metrics.append({
                    "key": vkey,
                    "label": cfg["label"],
                    "unit": cfg.get("unit", ""),
                    "direction": "lower_better" if vkey == "value_per_g" else "higher_better",
                    "is_star": True,
                    "fill": 100,
                    "limit": False,
                })

        # _rep_id 임시 키 제거 후 직렬화
        for m in models:
            m.pop("_rep_id", None)

        data = {"name": cat, "slug": slug, "grade": grade_by_cat.get(cat, "—"),
                "count": len(models), "verified": nv, "metrics": metrics, "models": models}
        with open(os.path.join(outdir, f"{slug}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        cat_meta.append({"slug": slug, "name": cat, "grade": grade_by_cat.get(cat, "—"),
                         "count": len(models), "verified": nv,
                         "star_metrics": [m["label"] for m in star_metrics],
                         "limits": [m["label"] for m in star_metrics if m["limit"]]})

    today = con.execute("SELECT date('now')").fetchone()[0]
    total = con.execute("SELECT COUNT(*) FROM products WHERE curation_status='verified'").fetchone()[0]
    manifest = {"generated": today, "total_verified": total, "categories": cat_meta}
    with open(os.path.join(outdir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(outdir, "search.json"), "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False, separators=(",", ":"))
    return cat_meta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--out", default=os.path.join(ROOT, "site", "data"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    meta = export(con, args.out)
    con.close()
    print(f"익스포트 완료: {args.out}")
    print(f"  카테고리 {len(meta)} / 모델 {sum(m['count'] for m in meta)}종")
    for m in meta:
        lim = f" · 한계지표 {','.join(m['limits'])}" if m["limits"] else ""
        print(f"  {m['grade']:6} {m['name']:8} {m['count']:>4}모델{lim}")


if __name__ == "__main__":
    main()
