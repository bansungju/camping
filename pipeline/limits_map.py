#!/usr/bin/env python3
"""한계지도 생성 — DB 현황에서 LIMITS.md를 자동 산출(수동작성 stale 방지).

각 카테고리·지표의 verified 충전율을 집계해 신뢰등급(A/B/한계)으로 분류.
2단계 사이트의 '정직 배지'(이 별점은 N종 기준 / R값 데이터부족) 근거가 됨.

신뢰등급 규칙(★별점지표 기준):
  A : 모든 ★핵심지표 충전율 ≥ 80%  → 사이트 비교 신뢰 가능
  B : 일부 ★지표 50~80% 또는 1개만 부실 → 비교 성립하나 약축 존재
  한계 : ★지표 < 50%  → 해당 축은 별점 대신 '데이터부족' 배지, 한계 명시

사용: python3 pipeline/limits_map.py --db camping_tents500.db [--out LIMITS.md]
"""
import argparse
import os
import re
import sqlite3
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

GOOD, WEAK = 80, 50   # 충전율 임계(%)


def fill_rate(con, mid):
    """metric의 verified 충전율(%)과 보유수. 별점 산정에 실제 쓰이는 값만 카운트
    (valid=1 AND star_eligible=1) → footprint 등 별점제외분은 충전율서 빠짐(정직)."""
    row = con.execute("""SELECT
        (SELECT COUNT(DISTINCT v.product_id) FROM product_spec_values v JOIN products p ON p.id=v.product_id
           WHERE v.metric_id=? AND p.curation_status='verified' AND v.valid=1
             AND IFNULL(v.star_eligible,1)=1) AS have,
        (SELECT COUNT(*) FROM products p JOIN metrics m ON m.id=? WHERE p.category_id=m.category_id
           AND p.curation_status='verified') AS total""", (mid, mid)).fetchone()
    have, total = row[0], row[1]
    return (round(100 * have / total) if total else 0), have, total


def grade(star_rates):
    """★지표 충전율 리스트 → 등급. '신뢰축(≥GOOD)' 개수로 비교 가능성 판정.
    (id순서상 '무게'가 항상 앞이라 주력판정이 왜곡 → 충전율 자체로 본다)
      A   : 모든 ★지표 ≥GOOD (전 축 신뢰)
      B   : 신뢰축 ≥2개 (다축 비교 성립, 일부 축은 약함)
      한계 : 신뢰축 ≤1개 (비교축이 부족 — 핵심스펙 미공개)"""
    if not star_rates:
        return "—"
    if all(r >= GOOD for r in star_rates):
        return "🟢 A"
    strong = sum(r >= GOOD for r in star_rates)
    return "🟡 B" if strong >= 2 else "🔴 한계"


def build(con):
    cats = con.execute("SELECT id, name_ko FROM categories ORDER BY id").fetchall()
    rows = []
    for cid, nm in cats:
        nv = con.execute("SELECT COUNT(*) FROM products WHERE category_id=? AND curation_status='verified'",
                         (cid,)).fetchone()[0]
        if nv == 0:
            continue
        mets = con.execute("""SELECT id, key, label_ko, unit, is_star_metric FROM metrics
            WHERE category_id=? ORDER BY is_star_metric DESC, id""", (cid,)).fetchall()
        star_cells, ref_cells, star_rates = [], [], []
        for mid, key, lab, unit, star in mets:
            pct, have, _ = fill_rate(con, mid)
            cell = f"{lab}({unit or '-'}) **{pct}%**"
            if star:
                star_cells.append(cell)
                star_rates.append(pct)
            else:
                ref_cells.append(f"{lab} {pct}%")
        capn = con.execute("""SELECT COUNT(*) FROM products WHERE category_id=? AND curation_status='verified'
            AND capacity IS NOT NULL""", (cid,)).fetchone()[0]
        rows.append({
            "cat": nm, "nv": nv, "grade": grade(star_rates),
            "stars": star_cells, "refs": ref_cells,
            "cap_pct": (round(100 * capn / nv) if nv else 0),
            "min_star": min(star_rates) if star_rates else 0,
        })
    return rows


def render(con, rows):
    today = con.execute("SELECT date('now')").fetchone()[0]
    nv_tot = sum(r["nv"] for r in rows)
    A = [r for r in rows if r["grade"].endswith("A")]
    B = [r for r in rows if r["grade"].endswith("B")]
    L = [r for r in rows if "한계" in r["grade"]]
    O = [r for r in rows if r["grade"] == "—"]   # L-252: ★지표 미정의 카테고리(어느 버킷에도 안 들던 누락분)
    out = []
    out.append("# 캠핑기어 DB — 한계지도 (Limits Map)")
    out.append(f"\n> **자동생성** `python3 pipeline/limits_map.py` · 기준일 {today} · "
               "수동수정 금지(DB에서 재생성됨)")
    out.append(f"> verified {nv_tot:,}종 / {len(rows)}개 카테고리. 충전율 = valid값 보유 verified ÷ 전체 verified.\n")
    out.append("## 신뢰등급 요약\n")
    out.append("| 등급 | 의미 | 카테고리 |")
    out.append("|---|---|---|")
    out.append(f"| 🟢 A | 모든 ★지표 ≥{GOOD}% — 전 비교축 신뢰 | {', '.join(r['cat'] for r in A) or '—'} |")
    out.append(f"| 🟡 B | 신뢰축(≥{GOOD}%) 2개+ — 다축 비교성립, 일부축 약함 | {', '.join(r['cat'] for r in B) or '—'} |")
    out.append(f"| 🔴 한계 | 신뢰축 ≤1개 — 핵심스펙 미공개로 비교축 부족 | {', '.join(r['cat'] for r in L) or '—'} |")
    if O:   # L-252: ★지표 미정의 카테고리도 요약에 명시(합산 ≠ 버킷합 불일치 해소)
        out.append(f"| — | ★지표 미정의 — 비교축 없음 | {', '.join(r['cat'] for r in O)} |")

    out.append("\n## 카테고리별 상세\n")
    out.append("| 등급 | 카테고리 | verified | ★별점지표(충전율) | 참고지표 |")
    out.append("|---|---|---:|---|---|")
    # L-251: 이모지 유니코드 정렬(🔴<🟡<🟢)은 최악등급이 먼저 와 가독성 역전 → 명시 랭크로 A→B→한계→미정의.
    def _grank(g):
        if g.endswith("A"): return 0
        if g.endswith("B"): return 1
        if "한계" in g: return 2
        return 3
    for r in sorted(rows, key=lambda x: (_grank(x["grade"]), -x["nv"])):
        cap = f" · 인원 {r['cap_pct']}%" if r["cap_pct"] else ""
        stars = "<br>".join(r["stars"])
        refs = ", ".join(r["refs"]) or "—"
        out.append(f"| {r['grade']} | **{r['cat']}** | {r['nv']}{cap} | {stars} | {refs} |")

    out.append("\n## 회수 불가 한계 (정직 명시)\n")
    out.append("아래 지표는 **국내 판매처가 스펙 자체를 표기하지 않아** 회수 불가능한 결측이다. "
               "추측으로 채우지 않고 한계로 남긴다(원칙: \"데이터 없는 건 괜찮다\"). "
               "사이트에서 해당 축은 별점 대신 **'데이터부족'** 배지로 표시한다.\n")
    out.append("| 카테고리 | 지표 | 충전율 | 성격 |")
    out.append("|---|---|---:|---|")
    weak = []
    for r in rows:
        for cell, rate in _star_rate_pairs(r):
            if rate < GOOD:
                weak.append((r["cat"], cell, rate))
    # 63~68R 데이터부족 정직성 감사 결론: 6라운드 웹회수로 '거짓 한계'(프리미엄/수입
    #   브랜드가 공표하는데 안 모은 값)는 회수 완료. 잔여 결측은 국내 보급형·무명 브랜드가
    #   스펙 자체를 미표기하는 '구조적 미공개'(회수불가)임을 교차검증으로 확정.
    #   회수내역: 코펠 용량 30→56%(Keith/S2S/SnowPeak 등), 랜턴 무게 44→82%(경량 헤드램프
    #   복구), 침낭 충전량 45→48%(S2S Spark/Alpine만, 몽벨·코튼 미공개), 버너 화력 44→46%
    #   (이와타니·SOTO·MSR만, 국내 부탄버너 g/h만 표기).
    RECOVERED = {  # 6R 웹회수 완료 — 잔여는 보급형 미공개(구조적)
        ("랜턴", "최소무게"): "프리미엄 회수완료, 잔여=무명 공구브랜드 무게 미표기",
        ("코펠", "용량"): "수입 회수완료, 잔여=코베아/캠핑문 보급형 용량 미표기",
        ("침낭", "충전량"): "S2S 다운 회수완료, 잔여=몽벨/코튼/국내 다운량 미공개",
        ("버너", "화력"): "이와타니/SOTO/MSR 회수완료, 잔여=국내 부탄 kcal 미표기",
    }
    for cat, cell, rate in sorted(weak, key=lambda x: x[2]):
        metric_lab = cell.split("(")[0]
        if (cat, metric_lab) in RECOVERED:
            kind = "구조적 미공개(회수불가) — " + RECOVERED[(cat, metric_lab)]
        elif rate < WEAK:
            kind = "구조적 미공개(회수불가)"
        else:
            kind = "부분결측"
        out.append(f"| {cat} | {cell} | {rate}% | {kind} |")

    out.append("\n## 구조적 신뢰장치 (적대루프 18R 산물)\n")
    out.append("- **가격 100% 필수**: 유효가격(valid=1) 없으면 verified 불가 → 모든 비교대상에 가격존재.")
    out.append("- **별점=순위백분위**: outlier에 강건, 세그먼트 중앙값=★3 (min-max 선형 아님).")
    out.append("- **세그먼트**: 텐트=인원별, 랜턴=광원형태(면조명/핸드헬드), 그 외 단일풀.")
    out.append("- **국내가 우선**: 직구 lowball 가격오염 차단(직구는 국내가 없을 때만 fallback).")
    out.append("- **참고지표**: 패킹부피는 전 카테고리 별점 제외(참고용), 결측 무관.")
    out.append("- **비교풀 분모**: 색상변형 중복은 v_model_ratings로 canonical 단위 집계(\"N종 중 X위\" 정확).")
    out.append("")
    out.append("## 기준 주석 (외부 지상검증 46R 확정)\n")
    out.append("- **텐트 무게 = 패킹중량 기준**: 다나와 백패킹텐트 무게는 제조사 '최소무게'가 아니라 "
               "'패킹/패키지 중량'임이 외부확인됨(NEMO 호넷 948g(min)/1.14kg(packed)·MSR 허바허바 "
               "1.07kg/1.23kg). 거의 전량 동일 기준(packed)이라 상대비교는 공정하나, '최소무게' 라벨은 "
               "패킹기준으로 이해할 것. (참고 배지)")
    out.append("- **침낭 내한온도 = ISO 하한(Lower Limit) 기준**: 다나와값은 comfort(쾌적)가 아니라 "
               "ISO Lower Limit임이 외부확인됨(몽벨 다운허거 #1 우리 -10℃=공식 limit -10, comfort는 -3). "
               "comfort는 국내 미공개라 회수 불가. 전 침낭 동일 기준(limit)이라 비교 공정, 라벨 '내한온도(ISO하한)'.")
    out.append("- **쿨러 용량 단위**: US 쿼트 표기 모델은 ×0.9464로 L 환산(예티 로디24=24qt=22.7L). "
               "대부분 수집단계서 변환됨, 미변환분은 fix_quart_capacity가 교정.")
    out.append("- **외부 표본 일치**: 매트(써마레스트 R값)·의자(헬리녹스 내하중)·파워뱅크(Anker 출력/mAh)·"
               "버너(소토 화력)·침낭(S2S ISO Limit) 등은 제조사 공식과 정확 일치 확인.")
    out.append("")
    return "\n".join(out)


def _star_rate_pairs(r):
    """행의 ★지표 셀과 충전율 추출(렌더 보조)."""
    pairs = []
    for cell in r["stars"]:
        # 'label(unit) **NN%**' 형태에서 NN 추출 (re는 모듈 상단 import — L-212)
        m = re.search(r"\*\*(\d+)%\*\*", cell)
        if m:
            pairs.append((cell.replace("**", ""), int(m.group(1))))
    return pairs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(ROOT, "camping_tents500.db"))
    ap.add_argument("--out", default=os.path.join(ROOT, "LIMITS.md"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    rows = build(con)
    md = render(con, rows)
    con.close()
    with open(args.out, "w") as f:
        f.write(md)
    print(f"한계지도 생성: {args.out}")
    print(f"  카테고리 {len(rows)} / verified {sum(r['nv'] for r in rows):,}종")
    for g in ("🟢 A", "🟡 B", "🔴 한계"):
        cs = [r["cat"] for r in rows if r["grade"] == g]
        print(f"  {g}: {len(cs)}개 — {', '.join(cs)}")


if __name__ == "__main__":
    main()
