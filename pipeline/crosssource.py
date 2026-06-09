#!/usr/bin/env python3
"""크로스소스 측정값 적재 — 다나와에 없는 스펙을 해외 리테일/제조사(REI/CleverHiker/공식)에서
agent(WebSearch)가 찾아 '측정값'으로 적재. 추정 아님(confidence=high/medium, source=리뷰).

RECORDS에 (pcode, 정규화값/원문)을 넣고 실행. 기존 유효값은 덮지 않음(보강만).
floor_m2=직접 m² / weight,water,packed=원문→정규화 / m={key:val}=일반지표 직접.
사용: python3 pipeline/crosssource.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import normalize as N
import pipeline as P

RECORDS = [
    {"pcode": "77787434", "src": "REI(MSR Elixir 2)", "weight": "2.24kg", "water": "1500mm", "floor_m2": 2.69, "packed": "51x17cm"},
    {"pcode": "48725900", "src": "REI(MSR Elixir 2)", "weight": "2.24kg", "water": "1500mm", "floor_m2": 2.69, "packed": "51x17cm"},
    {"pcode": "71643749", "src": "REI(MSR Elixir 2 V2)", "weight": "2.24kg", "water": "1500mm", "floor_m2": 2.69, "packed": "51x17cm"},
    {"pcode": "4950486", "src": "CleverHiker/REI(MSR Access 2)", "weight": "1.64kg", "floor_m2": 2.69, "packed": "46x15cm"},
    {"pcode": "14802341", "src": "REI(BA Tiger Wall UL2)", "water": "1500mm", "floor_m2": 2.60},
    {"pcode": "10695078", "src": "REI/NEMO(Aurora 2P)", "water": "2000mm", "floor_m2": 3.01},
    {"pcode": "14836163", "src": "REI(NEMO Kunai 2P)", "water": "1200mm", "floor_m2": 2.42},
    {"pcode": "16633427", "src": "REI/NEMO(Chogori 2P)", "water": "3000mm", "floor_m2": 3.73},
    {"pcode": "65193023", "src": "REI/NEMO(Dragonfly Bikepack 2P)", "floor_m2": 2.69},
    {"pcode": "13602371", "src": "REI(S2S Alto TR2)", "floor_m2": 2.51},
    {"pcode": "16525925", "src": "REI(S2S Telos TR2)", "floor_m2": 2.60},
    {"pcode": "10429362", "src": "REI(BA Copper Spur HV UL2)", "floor_m2": 2.69},
    {"pcode": "16730204", "src": "REI/NEMO(Aurora Ridge 2P)", "floor_m2": 3.00},
    {"pcode": "3870302", "src": "REI(MSR FreeLite 3)", "floor_m2": 3.58},
    {"pcode": "19718765", "src": "REI(S2S Ikos TR2)", "floor_m2": 2.90},
    {"pcode": "72300779", "src": "REI(S2S Alto TR2 Plus)", "floor_m2": 2.51},
    {"pcode": "72300746", "src": "REI(S2S Alto TR2)", "floor_m2": 2.51},
    {"pcode": "76072781", "src": "REI(S2S Telos TR2)", "floor_m2": 2.60},
    {"pcode": "14688923", "src": "REI(S2S Alto TR2 Plus)", "floor_m2": 2.51},
    {"pcode": "19718768", "src": "REI(S2S Ikos TR3)", "floor_m2": 4.57},
    {"pcode": "16526036", "src": "REI(S2S Telos TR3)", "floor_m2": 3.72},
    {"pcode": "13601090", "src": "REI(S2S Alto TR1)", "floor_m2": 1.81},
    {"pcode": "76072682", "src": "REI(S2S Telos TR2 Plus)", "floor_m2": 2.60},
    {"pcode": "72300716", "src": "REI(S2S Alto TR1)", "floor_m2": 1.81},
    {"pcode": "14688845", "src": "REI(S2S Alto TR1 Plus)", "floor_m2": 1.81},
    {"pcode": "8188012", "src": "Naturehike(Mongar 2 inner)", "floor_m2": 2.34, "water": "4000mm"},
    {"pcode": "1566328", "src": "Coleman(Sundome 2)", "floor_m2": 3.25},
    {"pcode": "28620254", "src": "Hilleberg(Soulo BL)", "floor_m2": 1.90},
    {"pcode": "5005403", "src": "Hilleberg(Anjan 3)", "floor_m2": 3.30},
    # 매트 R값
    {"pcode": "18755264", "src": "REI(NEMO Tensor Alpine)", "m": {"r_value": 4.8}},
    {"pcode": "9664992", "src": "REI(NEMO Tensor Alpine)", "m": {"r_value": 4.8}},
    {"pcode": "33362189", "src": "REI(NEMO Tensor All-Season)", "m": {"r_value": 5.4}},
    {"pcode": "33362231", "src": "REI(NEMO Tensor All-Season)", "m": {"r_value": 5.4}},
    {"pcode": "33362207", "src": "REI(NEMO Tensor All-Season)", "m": {"r_value": 5.4}},
    {"pcode": "10355958", "src": "NEMO(Switchback)", "m": {"r_value": 2.0}},
    {"pcode": "33362270", "src": "REI(NEMO Tensor All-Season)", "m": {"r_value": 5.4}},
    {"pcode": "90435095", "src": "REI(NEMO Tensor Extreme)", "m": {"r_value": 8.5}},
    # 버너 화력 (BTU→kcal ×0.252)
    {"pcode": "31073360", "src": "REI(MSR PocketRocket 2)", "m": {"power_output": 2066}},
    {"pcode": "2150297", "src": "MSR(Reactor 1.0L)", "m": {"power_output": 2268}},
    {"pcode": "2150280", "src": "MSR(Reactor 2.5L)", "m": {"power_output": 2268}},
    {"pcode": "6432297", "src": "MSR(WindBurner)", "m": {"power_output": 1764}},
    {"pcode": "63559595", "src": "SnowPeak(GigaPower Auto)", "m": {"power_output": 2520}},
    {"pcode": "16912334", "src": "SnowPeak(GS-450R)", "m": {"power_output": 3000}},
    {"pcode": "20311577", "src": "SnowPeak(GS-450R-K)", "m": {"power_output": 3000}},
    # 매트 R값 — 써머레스트 (네오로프트 4.7 / 엑스라이트 NXT 4.5)
    {"pcode": "97225703", "src": "REI(TaR NeoLoft)", "m": {"r_value": 4.7}},
    {"pcode": "97225718", "src": "REI(TaR NeoLoft)", "m": {"r_value": 4.7}},
    {"pcode": "97225730", "src": "REI(TaR NeoLoft)", "m": {"r_value": 4.7}},
    {"pcode": "89730626", "src": "REI(TaR NeoAir XLite NXT)", "m": {"r_value": 4.5}},
    {"pcode": "19935248", "src": "REI(TaR XLite NXT MAX)", "m": {"r_value": 4.5}},
    {"pcode": "19935245", "src": "REI(TaR XLite NXT MAX)", "m": {"r_value": 4.5}},
    {"pcode": "89730698", "src": "REI(TaR NeoAir XLite NXT)", "m": {"r_value": 4.5}},
    {"pcode": "89730554", "src": "REI(TaR NeoAir XLite NXT)", "m": {"r_value": 4.5}},
    # 텐트 바닥 — 네이처하이크 inner (naturehike.com, 가로×세로 cm→m²)
    {"pcode": "4509397", "src": "Naturehike(Star River 2, 215x135)", "floor_m2": 2.90},
    {"pcode": "77018192", "src": "Naturehike(Opalus 2, 210x115)", "floor_m2": 2.42},
    {"pcode": "68575118", "src": "Naturehike(Cloud Up 1, 195x80)", "floor_m2": 1.56},
    {"pcode": "13284419", "src": "Naturehike(Bear UL2, 225x144)", "floor_m2": 3.24},
    # 버너 화력 — 이와타니
    {"pcode": "12744230", "src": "Iwatani(CB-SS-50, 2800kcal)", "m": {"power_output": 2800}},
    {"pcode": "14967596", "src": "Iwatani(CB-ABR-1, 2000kcal)", "m": {"power_output": 2000}},
    # 매트 R값 — 니모 텐서 익스트림(8.5)
    {"pcode": "59826809", "src": "REI(NEMO Tensor Extreme)", "m": {"r_value": 8.5}},
    {"pcode": "59826953", "src": "REI(NEMO Tensor Extreme)", "m": {"r_value": 8.5}},
    # 침낭 내한온도 = comfort(ISO) 기준 — 몽벨 버로우백 #3 = comfort 5℃
    {"pcode": "98484947", "src": "Montbell(Burrow Bag #3, comfort 5C)", "m": {"comfort_temp": 5}},
    {"pcode": "98484917", "src": "Montbell(Burrow Bag #3, comfort 5C)", "m": {"comfort_temp": 5}},
    {"pcode": "98484431", "src": "Montbell(Burrow Bag #3 Long, comfort 5C)", "m": {"comfort_temp": 5}},
    {"pcode": "97226024", "src": "Montbell(Down Hugger 900 #3, comfort 3C)", "m": {"comfort_temp": 3}},
    {"pcode": "29879849", "src": "Montbell(Alpine Burrow #3, comfort 5C)", "m": {"comfort_temp": 5}},
    {"pcode": "98484329", "src": "Montbell(Alpine Burrow #3 Long, comfort 5C)", "m": {"comfort_temp": 5}},
    {"pcode": "7419892", "src": "S2S(Alpine AP III, comfort -30C)", "m": {"comfort_temp": -30}},
    {"pcode": "7419853", "src": "S2S(Alpine AP III, comfort -30C)", "m": {"comfort_temp": -30}},
    # 코펠 용량 — 스노우피크(모델명=ml 명명규칙)
    {"pcode": "92628077", "src": "SnowPeak(Trek 1400=1.4L)", "m": {"capacity_l": 1.4}},
    {"pcode": "92627981", "src": "SnowPeak(Ti Trek 1400=1.4L)", "m": {"capacity_l": 1.4}},
    {"pcode": "3674523", "src": "SnowPeak(Yaen Cooker 1500=1.5L)", "m": {"capacity_l": 1.5}},
    # 기준확정(confirm=덮어쓰기): 무게=최소무게로 통일 (다나와 패킹무게 교체)
    {"pcode": "10429362", "src": "BigAgnes(Copper Spur HV UL2 min 1247g)", "weight": "1247g", "confirm": True},
]


def upsert(con, pid, cid, key, val, raw, conf, src, overwrite=False):
    if val is None:
        return False
    mid = P.metric_id(con, cid, key)
    if mid is None:
        return False
    has = con.execute("SELECT 1 FROM product_spec_values WHERE product_id=? AND metric_id=? AND valid=1",
                      (pid, mid)).fetchone()
    if has and not overwrite:
        return False
    if has and overwrite:   # 기준확정: 다나와 등 기존값을 크로스소스 확정값으로 교체
        con.execute("DELETE FROM product_spec_values WHERE product_id=? AND metric_id=?", (pid, mid))
    con.execute("DELETE FROM product_spec_values WHERE product_id=? AND metric_id=? AND valid=0", (pid, mid))
    con.execute("""INSERT INTO product_spec_values
        (product_id,metric_id,value_normalized,value_raw,raw_unit,source_id,confidence,is_primary,valid)
        VALUES(?,?,?,?,?,4,?,1,1)""", (pid, mid, val, f"{raw} [{src}]", "norm", conf))
    con.execute("UPDATE data_quality_flags SET resolved=1 WHERE product_id=? AND metric_id=? AND flag_type='missing'",
                (pid, mid))
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(P.ROOT, "camping_tents500.db"))
    args = ap.parse_args()
    con = sqlite3.connect(args.db)
    filled = 0
    for r in RECORDS:
        row = con.execute("SELECT id, category_id FROM products WHERE danawa_pcode=?", (r["pcode"],)).fetchone()
        if not row:
            continue
        pid, cid = row
        n = 0
        ow = r.get("confirm", False)   # True면 기존(다나와)값을 확정값으로 덮어씀
        if "weight" in r:
            n += upsert(con, pid, cid, "weight_min", N.parse_weight(r["weight"]), r["weight"], "high", r["src"], ow)
        if "water" in r:
            n += upsert(con, pid, cid, "water_head", N.parse_water_head(r["water"]), r["water"], "high", r["src"], ow)
        if "floor_m2" in r:
            n += upsert(con, pid, cid, "floor_area", r["floor_m2"], f"{r['floor_m2']}㎡", "high", r["src"], ow)
        if "packed" in r:
            n += upsert(con, pid, cid, "packed_volume", N.packed_volume_cm3(r["packed"]), r["packed"], "medium", r["src"], ow)
        for key, val in r.get("m", {}).items():
            n += upsert(con, pid, cid, key, val, str(val), "high", r["src"], ow)
        filled += n
    con.commit()
    P.recompute_ratings(con)
    con.commit()
    print(f"크로스소스 측정값 {filled}개 적재(추정 아님)")
    con.close()


if __name__ == "__main__":
    main()
