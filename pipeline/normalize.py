"""단위 정규화 모듈 — 출처에 적힌 제각각 표기를 표준 단위로 변환.
설계 원칙: 원본(raw)은 보존, 정규화값만 비교/별점에 사용.
표준 단위: 무게=g, 길이=cm, 부피=cm3, 내수압=mm, 면적=m2
"""
import re

LB_G = 453.59237
OZ_G = 28.349523
INCH_CM = 2.54
SQFT_M2 = 0.09290304


def _num(s):
    m = re.search(r"[-+]?\d*\.?\d+", s.replace(",", ""))
    return float(m.group()) if m else None


def parse_weight(raw):
    """'1.86kg', '948g', '2 lbs 14 oz', '약 6.8 lb' -> grams"""
    if not raw:
        return None
    s = raw.lower().replace(",", "")
    if "mg" in s:        # M-288: 'mg'(밀리그램)은 캠핑장비 무게 단위 아님 → 'g' 매칭 오인 차단
        return None
    lbs = re.search(r"(\d*\.?\d+)\s*(?:lbs?|파운드)", s)
    oz = re.search(r"(\d*\.?\d+)\s*oz", s)
    if lbs or oz:
        g = 0.0
        if lbs:
            g += float(lbs.group(1)) * LB_G
        if oz:
            g += float(oz.group(1)) * OZ_G
        return round(g, 1)
    kg = re.search(r"(\d*\.?\d+)\s*kg", s)
    if kg:
        return round(float(kg.group(1)) * 1000, 1)
    g = re.search(r"(\d*\.?\d+)\s*g", s)
    if g:
        return round(float(g.group(1)), 1)
    return None


def parse_dims_cm(raw):
    """'220x130x107cm', '210×130×105' -> (w,d,h) in cm (inch면 환산)"""
    if not raw:
        return None
    # M-362: 한/중 페이지의 곡선 따옴표(U+201C/U+201D)·더블프라임(U+2033)을 ASCII "로 정규화해야
    #   아래 인치 감지('"' in s)가 동작한다. 미정규화 시 인치가 cm로 오인돼 2.54× 작게 저장됐다.
    s = raw.lower().replace("“", '"').replace("”", '"').replace("″", '"')
    s = s.replace("×", "x").replace("*", "x").replace(",", "")  # 천단위 콤마 제거(1,800→1800)
    nums = re.findall(r"\d*\.?\d+", s)
    if len(nums) < 2:
        return None
    vals = [float(n) for n in nums[:3]]
    if "inch" in s or '"' in s or "in)" in s:
        vals = [round(v * INCH_CM, 1) for v in vals]
    while len(vals) < 3:
        vals.append(None)
    return tuple(vals[:3])


def parse_water_head(raw):
    """'2,000mm', '~3000mm', '1200mm DuraShield' -> mm"""
    if not raw:
        return None
    v = _num(raw)
    # M-276/M-339: 음수(OCR '-1500')·범위 밖(cm/m 오인 등) 값을 검증 없이 저장하지 않는다.
    #   내수압은 양수 mm, 물리 상한 30000(=HARD_RANGES). 벗어나면 파싱 신뢰불가 → None.
    if v is None or v <= 0 or v > 30000:
        return None
    return v


def floor_area_m2(raw=None, dims_cm=None):
    """면적 m2. 설계정의: floor_area=이너 바닥(설치 외형 아님).
    - '본체+이너텐트' 병기 → 이너 구간만 사용.
    - 테이퍼 'A(B)'(슬로프로 폭이 A→B로 좁아짐)는 어느 치수에 붙든 평균폭 (A+B)/2
      (사다리꼴 면적=길이×평균폭). 괄호를 먼저 평균치환해야 폭이 누락되지 않음.
    - 'sq ft' 표기는 환산. raw 없으면 dims_cm fallback."""
    section = None
    if raw and "이너" in raw:
        m = re.search(r"이너[^,]*", raw)          # 이너 구간만 절취
        section = m.group() if m else raw
    elif raw:
        section = raw
    if section is not None:
        # ㎡/m2 리터럴 먼저 인식(주석에 'sqft'가 있어도 값이 이미 ㎡면 그대로) — 이중환산 방지.
        if "㎡" in section or "m²" in section or re.search(r"\bm2\b", section.lower()):
            n = _num(section)
            return round(n, 2) if n else None
        if "sq" in section.lower() or "ft" in section.lower():
            n = _num(section)
            return round(n * SQFT_M2, 2) if n else None
        # 테이퍼 'A(B)' → 평균폭. 괄호가 1번째 치수에 붙어도 폭 누락 없이 처리.
        # H-89: `(\d+)`는 정수만 매칭해 '210.5(185)'에서 '5'만 잡아 평균폭을 95로 오산(면적 최대 6.7% 과대).
        #       소수점 치수를 포함하도록 `\d*\.?\d+` + float 캐스트.
        # M-488: 평균폭을 정수로 반올림하면(예: (210.5+185)/2=197.75→198) 0.1cm 단위 정밀도가 손실돼
        #        면적에 누적 오차를 남긴다 → 1자리 소수로 보존(parse_dims_cm는 소수 치수 처리 가능).
        section = re.sub(r"(\d*\.?\d+)\s*\((\d*\.?\d+)\)",
                         lambda mm: str(round((float(mm.group(1)) + float(mm.group(2))) / 2, 1)), section)
        d = parse_dims_cm(section)
        if d and d[0] and d[1]:
            return round((d[0] / 100.0) * (d[1] / 100.0), 2)
    if dims_cm and dims_cm[0] and dims_cm[1]:
        return round((dims_cm[0] / 100.0) * (dims_cm[1] / 100.0), 2)
    return None


def parse_capacity_l(raw):
    """용량 → L. 'ml'면 ÷1000, 음수(대시 구분자 오인) 방지. '2700ml'→2.7, '-36L'→36."""
    if not raw:
        return None
    s = raw.lower().replace(",", "")
    m = re.search(r"(\d*\.?\d+)\s*ml", s)          # ml 우선
    if m:
        return round(float(m.group(1)) / 1000, 3)
    m = re.search(r"(\d*\.?\d+)\s*(?:l|리터|ℓ)", s)  # L
    if m:
        return float(m.group(1))
    # L-263: 단위 없는 bare-number 폴백 제거. 모델명 속 숫자(예 '코펠 24')가 리터로 오인돼
    #   잘못된 용량이 저장되던 것 차단 — 명시 단위(ml/l/리터/ℓ)가 있을 때만 파싱.
    return None


def parse_lumens(raw):
    """밝기 → lm. '단계/모드/레벨'(밝기단계)·'lux/cp'(다른단위)면 None(루멘 아님)."""
    if not raw:
        return None
    s = raw.lower().replace(",", "")   # 천단위 콤마 제거(20,000→20000)
    if any(x in s for x in ("단계", "모드", "레벨", "lux", "럭스", "cp", "촉광")):
        return None
    # H-90: 단위 그룹이 optional이면 '사용시간 300시간'·'충전횟수 500회' 같은 비루멘 숫자도
    #       300lm/500lm으로 오파싱돼 랜턴 스펙을 오염시켰다 → 단위(lm/루멘/lumen) 필수 매칭.
    m = re.search(r"(\d*\.?\d+)\s*(?:lm|루멘|lumen)", s)
    return float(m.group(1)) if m else None


def parse_temp(raw):
    """'-4℃', '-18℃' -> °C (음수 보존). 침낭 내한온도."""
    if not raw:
        return None
    # M-319: 내한온도는 범위('5℃ ~ -10℃') 중 '최저값'(한계). 첫 숫자만 취하면 안락온도(+5)를
    #   잡아 한계 성능을 과대평가한다 → 전체 숫자 추출 후 min().
    nums = re.findall(r"-?\d+\.?\d*", raw.replace(",", ""))
    vals = [float(n) for n in nums if n not in ("", "-", ".", "-.")]
    return min(vals) if vals else None


def parse_number(raw):
    """충전량(400g), R값(4.5) 등 일반 숫자."""
    return _num(raw) if raw else None


def thickness_mm(raw):
    """매트 크기의 3번째 치수(두께)를 mm로. '132x200x6cm' -> 60mm.
    raw가 mm단위(예 '1800x1300x50mm')면 3번째는 이미 mm(×10 안 함). cm면 ×10."""
    dims = parse_dims_cm(raw)
    if dims and dims[2]:
        s = (raw or "").lower()
        if "mm" in s and "cm" not in s:    # mm표기 → 이미 mm
            return round(dims[2], 0)
        return round(dims[2] * 10, 0)      # cm → mm
    return None


def packed_volume_cm3(raw):
    """수납크기 -> 부피. 'Φ12 x 45'(원통) 또는 '32x19x8.5'(박스)."""
    if not raw:
        return None
    s = raw.lower().replace("×", "x").replace("*", "x").replace(",", "")  # 콤마 제거
    s = re.sub(r"\[[^\]]*\]", "", s)            # provenance 주석([REI/…(모델 2)]) 제거 → 모델숫자 누출 차단
    nums = [float(n) for n in re.findall(r"\d*\.?\d+", s)]
    if "φ" in s or "지름" in s or "diam" in s:  # 원통
        if len(nums) >= 2:
            d, h = nums[0], nums[1]
            return round(3.14159 * (d / 2) ** 2 * h, 0)
    if len(nums) >= 3:  # 박스
        return round(nums[0] * nums[1] * nums[2], 0)
    if len(nums) == 2:  # 원통: 작은쪽=지름, 큰쪽=길이 (스터프색은 지름<길이)
        d, h = min(nums), max(nums)
        return round(3.14159 * (d / 2) ** 2 * h, 0)
    return None


def parse_weight_sum(raw):
    """다부품 세트 무게 합산 — '냄비-135g, 뚜껑-94g' -> 229g. 코펠 등 세트용."""
    if not raw:
        return None
    parts = re.findall(r"(\d*\.?\d+)\s*(kg|g)", raw.lower())
    if not parts:
        return parse_weight(raw)
    total = sum(float(v) * (1000 if u == "kg" else 1) for v, u in parts)
    return round(total, 1)


if __name__ == "__main__":  # 셀프 테스트
    assert parse_weight("1.86kg") == 1860.0
    assert parse_weight("948g") == 948.0
    assert parse_weight("2 lbs 14 oz") == round(2 * LB_G + 14 * OZ_G, 1)
    assert parse_dims_cm("220x130x107cm") == (220.0, 130.0, 107.0)
    assert parse_water_head("2,000mm") == 2000.0
    assert floor_area_m2(raw="33 sq ft") == 3.07
    assert floor_area_m2(dims_cm=(210, 130, 105)) == 2.73
    assert parse_temp("-18℃") == -18.0
    assert parse_number("400g") == 400.0
    assert thickness_mm("132x200x6cm") == 60.0
    print("normalize.py self-test OK")
