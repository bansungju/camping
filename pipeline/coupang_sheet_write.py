#!/usr/bin/env python3
"""쿠팡 자동링크 결과 → gear-forest-list 시트 기록 (gspread).

입력: 브라우저 러너(window.__runner.results)를 저장한 results JSON 파일.
  각 항목: {"sheetRow":int, "status":"ok"|"not_found", "link":str, "price":int|"" }
규칙:
  - link 이 "x" 가 아니면(=실제 단축링크): D{row}=link, E{row}="<가격>원", I{row}=marker
  - link == "x" (미발견): D{row}="x", I{row}=marker
열: D=쿠팡링크, E=쿠팡가격("123,000원" 문자열), I=자동기입 마커.
  ⚠️ F(쿠팡가격 숫자)·G(차이)는 시트 수식(E 파싱)이므로 절대 건드리지 않는다.

시트 ID: env GEAR_FOREST_SHEET_ID (공개 레포 미노출용). GID는 GEAR_FOREST_SHEET_GID(기본 0).
자격증명(서비스계정): env GEAR_FOREST_SA_JSON(경로) 또는 ~/.config/gear-forest/sheets-sa.json
마커 문구: env COUPANG_AUTOFILL_MARKER 또는 기본 "자동"

사용:
  GEAR_FOREST_SHEET_ID=... GEAR_FOREST_SA_JSON=/path/sa.json python3 pipeline/coupang_sheet_write.py results.json
  ... --dry-run   # 시트에 안 쓰고 무엇을 쓸지 출력만
"""
import os
import sys
import json

SHEET_ID = os.environ.get("GEAR_FOREST_SHEET_ID", "")  # 시트 ID는 env로(공개 레포에 미노출)
GID = int(os.environ.get("GEAR_FOREST_SHEET_GID", "0"))
SA_PATH = os.environ.get("GEAR_FOREST_SA_JSON") or os.path.expanduser("~/.config/gear-forest/sheets-sa.json")
MARKER = os.environ.get("COUPANG_AUTOFILL_MARKER") or "자동"


def build_updates(results):
    updates = []
    for r in results:
        row = int(r["sheetRow"])
        link = (r.get("link") or "").strip()
        if not link:
            continue  # 빈 결과는 건너뜀(다음 실행에서 재시도 가능)
        marker = r.get("marker") or MARKER
        if link == "x":
            updates.append({"range": f"D{row}", "values": [["x"]]})
        else:
            updates.append({"range": f"D{row}", "values": [[link]]})
            price = r.get("price")
            if price not in (None, ""):
                try:
                    price_str = f"{int(price):,}원"
                except (ValueError, TypeError):
                    price_str = str(price)
                updates.append({"range": f"E{row}", "values": [[price_str]]})
            else:
                # 안전장치: 링크는 있는데 가격 없음 → 조용히 '자동'으로 넘기지 말고 눈에 띄게 표시 + 경고
                marker = f"{marker}·가격필요"
                print(f"  ⚠️  D{row}: 링크 있는데 가격(E) 없음 → 마커 '{marker}'. 가격 채우거나 재조회 필요.")
        updates.append({"range": f"I{row}", "values": [[marker]]})
    return updates


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args:
        sys.exit("usage: coupang_sheet_write.py results.json [--dry-run]")
    with open(args[0], encoding="utf-8") as f:
        results = json.load(f)
    updates = build_updates(results)
    print(f"marker = {MARKER!r}")
    print(f"대상 {len(results)}행 → 셀 {len(updates)}개 업데이트 예정")
    for u in updates:
        print(f"  {u['range']:>6} = {u['values'][0][0]}")
    if dry:
        print("[dry-run] 시트에 쓰지 않음.")
        return
    if not SHEET_ID:
        sys.exit("env GEAR_FOREST_SHEET_ID 필요 (대상 시트 ID)")
    if not os.path.exists(SA_PATH):
        sys.exit(f"서비스계정 키 없음: {SA_PATH} (env GEAR_FOREST_SA_JSON 로 경로 지정 가능)")
    import gspread
    gc = gspread.service_account(filename=SA_PATH)
    ws = gc.open_by_key(SHEET_ID).get_worksheet_by_id(GID)
    if updates:
        ws.batch_update(updates, value_input_option="USER_ENTERED")
    print(f"✅ 기록 완료: {len(updates)}개 셀")


if __name__ == "__main__":
    main()
