#!/usr/bin/env python3
"""배포 게이트 — 익스포트된 site/data/*.json 의 '말이 안 되는 가격'을 잡아 배포를 막는다.

왜 존재하나 (lesson learned):
  미니멀웍스 쉘터 GHE(140만원)가 부속 단가 2,167원으로 잘못 스크랩 + 같은 값이 10번
  중복 삽입돼 canonical 중앙값을 오염 → 이상치 가드가 역작동, 오류값이 라이브까지 노출됐다.
  파이프라인 내부 수정(normalize_models.flag_price_outliers)으로 그 메커니즘은 막았지만,
  '어떤 경로로든(파이프라인 버그·수동편집·미래 스크래퍼 변경) 이상 가격이 site/data 에
  들어가면 그대로 배포되는' 구조적 빈틈은 그대로였다. 이 스크립트가 그 빈틈을 닫는다.

성질:
  - 최종 산출물(JSON)만 검사 → 내부 구현과 독립. 원인이 무엇이든 결과가 이상하면 막는다.
  - 자기보정형: 하드코딩 임계 대신 '카테고리 중앙값 대비 비율'로 판정 → 시세 변동에 강건.
  - 임계는 실데이터로 캘리브레이션: 정상 최저비율 ≈0.035(파워뱅크), 최고 ≈10.1×(프리미엄 버너).
    → 하한 0.015(정상최저의 ~1/2, GHE 0.0044는 통과못함), 상한 30×(정상최고의 ~3배 마진).
  - stdlib만 사용 → CI(ubuntu-latest 기본 python)에서 의존성 없이 실행.

사용: python3 pipeline/check_export.py [--data site/data]
종료코드: 위반 0건=0, 1건이상=1 (CI에서 배포 차단).
"""
import argparse
import glob
import json
import os
import statistics
import sys

# 카테고리 중앙값 대비 허용 비율. 이 밖이면 '본품 가격일 수 없음'으로 보고 배포 차단.
#   FLOOR: 실데이터 정상 최저비율(파워뱅크 0.035, 텐트 0.057)보다 낮게 → 정상 저가품은 통과.
#          GHE 버그(0.0044)는 한참 아래라 확실히 포착. (2.3× 안전마진)
#   CEIL : 실데이터 정상 최고비율(프리미엄 버너 10.1×)보다 높게 → 정상 고가티어는 통과.
#          자릿수 추가류 오기(보통 ≥100×)는 포착.
FLOOR_RATIO = 0.015
CEIL_RATIO = 30.0
MIN_MODELS = 5          # 중앙값 신뢰 최소 모델수. 미만이면 통계 불안정 → skip(과탐 방지).
SKIP_FILES = {"manifest.json", "search.json"}


def load_models(path):
    try:
        with open(path, encoding="utf-8") as fh:
            d = json.load(fh)
    except Exception as e:
        print(f"  ⚠️  {os.path.basename(path)} 읽기 실패: {e}")
        return None, [], False     # L-231: 파싱 실패는 ok=False로 신호(게이트 통과 금지)
    if not isinstance(d, dict):
        print(f"  ⚠️  {os.path.basename(path)} 형식 오류(dict 아님)")
        return None, [], False
    return d.get("name", os.path.basename(path)), d.get("models") or [], True


def check_file(path):
    """반환: (위반 리스트). 각 위반=(종류, 카테고리, 브랜드, 모델, 가격, 중앙값, 비율)."""
    cat, models, ok = load_models(path)
    if not ok:
        return [], False        # L-231: 파싱 실패 → 게이트 차단 신호
    if not models:
        return [], True
    mins = [m["price_min"] for m in models if m.get("price_min") is not None and m["price_min"] > 0]
    if len(mins) < MIN_MODELS:
        return [], True
    med = statistics.median(mins)
    if med <= 0:
        return [], True
    violations = []
    for m in models:
        pmin = m.get("price_min")
        raw_pmax = m.get("price_max")
        # M-222: None일 때만 pmin으로 폴백(0/음수는 보존해 별도 탐지). `or`는 0을 None처럼 삼킨다.
        pmax = raw_pmax if raw_pmax is not None else pmin
        b, mo = m.get("brand", "?"), m.get("model", "?")
        if pmin is not None and pmin <= 0:
            violations.append(("영/음수가격", cat, b, mo, pmin, int(med), 0.0))
        if pmin is not None and pmin > 0 and pmin < med * FLOOR_RATIO:
            violations.append(("저가이상", cat, b, mo, pmin, int(med), pmin / med))
        if raw_pmax is not None and raw_pmax <= 0:   # M-294: price_max=0/음수 자체가 이상
            violations.append(("영/음수상한가", cat, b, mo, raw_pmax, int(med), 0.0))
        elif pmax is not None and pmax > med * CEIL_RATIO:
            violations.append(("고가이상", cat, b, mo, pmax, int(med), pmax / med))
    return violations, True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "data"))
    args = ap.parse_args()

    files = sorted(f for f in glob.glob(os.path.join(args.data, "*.json"))
                   if os.path.basename(f) not in SKIP_FILES)
    all_violations = []
    parse_failures = []           # L-231: 파싱 실패 파일을 추적해 게이트에서 차단
    for f in files:
        v, ok = check_file(f)
        if not ok:
            parse_failures.append(os.path.basename(f))
        all_violations.extend(v)

    print("=" * 70)
    print("배포 게이트 — 익스포트 가격 타당성 검사")
    print("=" * 70)
    print(f"  검사 카테고리 파일 {len(files)}개 / 임계 [중앙값×{FLOOR_RATIO} ~ ×{CEIL_RATIO}]\n")

    if not all_violations and not parse_failures:
        print("  ✅ 이상 가격 없음 — 배포 허용")
        return 0

    if parse_failures:   # L-231: 파싱 실패는 빈 데이터 배포 위험 → exit 1
        print(f"  ❌ 파싱 실패 {len(parse_failures)}건 — 배포 차단: {', '.join(parse_failures)}\n")
    if not all_violations:
        return 1
    print(f"  ❌ 이상 가격 {len(all_violations)}건 — 배포 차단\n")
    for kind, cat, b, mo, price, med, ratio in all_violations:
        print(f"   [{kind}] {cat} · {b} {mo}: {price:,}원 "
              f"(카테고리 중앙값 {med:,} 대비 {ratio:.4f}배)")
    print("\n  → 원인(스크랩 오기·중복관측·수동편집 등) 교정 후 재익스포트 필요.")
    print("    파이프라인: python3 pipeline/run_all.py --db camping_tents500.db")
    return 1


if __name__ == "__main__":
    sys.exit(main())
