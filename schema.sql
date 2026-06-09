-- 캠핑용품 비교 데이터베이스 스키마 v1 (SQLite)
-- 설계 근거: DATABASE-DESIGN.md
-- 핵심: 원본수치만 진실로 저장 / 별점은 파생 / 출처·신뢰도·시계열 분리 / 화이트리스트 게이트

PRAGMA foreign_keys = ON;

-- 1) 브랜드 ---------------------------------------------------------------
CREATE TABLE brands (
    id          INTEGER PRIMARY KEY,
    name_ko     TEXT NOT NULL,
    name_en     TEXT,
    country     TEXT,                       -- 원산지/본사국
    tier        TEXT CHECK (tier IN ('premium','mid','budget')),
    UNIQUE (name_ko)
);

-- 2) 카테고리 (자기참조: 대분류 > 소분류) --------------------------------
CREATE TABLE categories (
    id          INTEGER PRIMARY KEY,
    parent_id   INTEGER REFERENCES categories(id),
    name_ko     TEXT NOT NULL,
    name_en     TEXT,
    UNIQUE (parent_id, name_ko)
);

-- 3) 메트릭 (카테고리별 비교 축 정의) -----------------------------------
--    값은 product_spec_values 에. 여기는 "어떤 축을, 어떤 단위로, 어느 방향이 좋은가" 정의.
CREATE TABLE metrics (
    id             INTEGER PRIMARY KEY,
    category_id    INTEGER NOT NULL REFERENCES categories(id),
    key            TEXT NOT NULL,           -- weight_min, packed_volume, water_head ...
    label_ko       TEXT NOT NULL,
    unit           TEXT NOT NULL,           -- g, cm, cm3, mm, m2, KRW, point
    direction      TEXT NOT NULL CHECK (direction IN ('lower_better','higher_better')),
    normalize_rule TEXT,                     -- 정규화 메모 (예: '무게는 최소무게 기준, kg→g')
    is_star_metric INTEGER NOT NULL DEFAULT 1,  -- 별점 산정 대상인가
    UNIQUE (category_id, key)
);

-- 4) 제품 (= 화이트리스트). curation_status 가 게이트 -------------------
CREATE TABLE products (
    id              INTEGER PRIMARY KEY,
    brand_id        INTEGER NOT NULL REFERENCES brands(id),
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    model_name      TEXT NOT NULL,
    model_year      INTEGER,                 -- 연식 (버전 혼동 방지)
    variant         TEXT,                    -- 'Pro 2P', '플러스 20D' 등
    capacity        INTEGER,                 -- 인원(비교 세그먼트). 없으면 NULL
    curation_status TEXT NOT NULL DEFAULT 'pending'
                       CHECK (curation_status IN ('pending','verified','rejected')),
    sale_status     TEXT NOT NULL DEFAULT 'on_sale'
                       CHECK (sale_status IN ('on_sale','discontinued','unknown')),
    danawa_pcode    TEXT,                    -- 출처 식별자(2단계 상세 보강용 provenance)
    canonical_model TEXT,                    -- 색상/옵션 제거한 대표 모델명 (모델 정규화)
    variant_label   TEXT,                    -- 제거된 변형 토큰(색상 등)
    created_at      TEXT DEFAULT (datetime('now')),
    UNIQUE (brand_id, model_name, model_year, variant)
);

-- 5) 출처 (신뢰순위) ----------------------------------------------------
CREATE TABLE sources (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,        -- 다나와, 무신사, 공식몰, 리뷰사이트명
    type        TEXT CHECK (type IN ('aggregator','retailer','official','review')),
    base_url    TEXT,
    trust_rank  INTEGER NOT NULL DEFAULT 5   -- 1=최상
);

-- 6) 스펙 값 (제품 × 메트릭). 원본+정규화+출처+신뢰도 -------------------
CREATE TABLE product_spec_values (
    id               INTEGER PRIMARY KEY,
    product_id       INTEGER NOT NULL REFERENCES products(id),
    metric_id        INTEGER NOT NULL REFERENCES metrics(id),
    value_normalized REAL,                   -- metric.unit 기준 정규화 숫자 (별점/비교용)
    value_raw        TEXT,                   -- 출처에 적힌 원문 (감사/추적용)
    raw_unit         TEXT,
    source_id        INTEGER REFERENCES sources(id),
    confidence       TEXT NOT NULL DEFAULT 'medium'
                        CHECK (confidence IN ('high','medium','low')),
    is_primary       INTEGER NOT NULL DEFAULT 1,  -- 여러 출처 중 채택값
    valid            INTEGER NOT NULL DEFAULT 1,  -- 타당범위 검증 통과(0=이상치, 별점서 제외)
    collected_at     TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_psv_product ON product_spec_values(product_id);
CREATE INDEX idx_psv_metric  ON product_spec_values(metric_id);

-- 7) 가격 시계열 (가장 변동 큼 → 따로) ----------------------------------
CREATE TABLE price_observations (
    id          INTEGER PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    price_krw   INTEGER NOT NULL,
    seller      TEXT,
    channel     TEXT,                        -- 다나와최저가/네이버/공식/직구
    url         TEXT,
    in_stock    INTEGER DEFAULT 1,
    observed_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_price_product ON price_observations(product_id, observed_at);

-- 8) 파생 별점 (배치 재계산. 진실 아님, 캐시) ---------------------------
CREATE TABLE ratings (
    id               INTEGER PRIMARY KEY,
    product_id       INTEGER NOT NULL REFERENCES products(id),
    metric_id        INTEGER NOT NULL REFERENCES metrics(id),
    stars            REAL,                   -- 1.0 ~ 5.0 (0.5 단위)
    percentile       REAL,                   -- 0~1
    comparison_scope TEXT,                   -- 'category:3' 또는 'category:3|cap:2'
    computed_at      TEXT DEFAULT (datetime('now')),
    UNIQUE (product_id, metric_id, comparison_scope)
);

-- 9) 스타일 프로파일 + 메트릭 가중치 -----------------------------------
CREATE TABLE style_profiles (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,        -- 백패킹/오토캠핑/미니멀/가성비
    description TEXT
);
CREATE TABLE style_metric_weights (
    profile_id  INTEGER NOT NULL REFERENCES style_profiles(id),
    metric_id   INTEGER NOT NULL REFERENCES metrics(id),
    weight      REAL NOT NULL DEFAULT 1.0,
    PRIMARY KEY (profile_id, metric_id)
);

-- 10) 데이터 품질 플래그 ------------------------------------------------
CREATE TABLE data_quality_flags (
    id          INTEGER PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    metric_id   INTEGER REFERENCES metrics(id),  -- 가격 등 메트릭무관이면 NULL
    flag_type   TEXT NOT NULL CHECK (flag_type IN ('missing','conflict','needs_review','category_mismatch','implausible')),
    note        TEXT,
    resolved    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- 11) 어필리에이트 링크 (수익화: 나중) ---------------------------------
CREATE TABLE affiliate_links (
    id          INTEGER PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    partner     TEXT,                        -- 쿠팡파트너스/네이버 등
    url         TEXT NOT NULL,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- 편의 뷰: 검증된 제품의 채택 스펙만 -----------------------------------
CREATE VIEW v_verified_specs AS
SELECT p.id AS product_id, b.name_ko AS brand, p.model_name, p.model_year, p.variant,
       c.name_ko AS category, p.capacity,
       m.key AS metric, m.label_ko, psv.value_normalized, m.unit, m.direction,
       psv.confidence, s.name AS source
FROM products p
JOIN brands b      ON b.id = p.brand_id
JOIN categories c  ON c.id = p.category_id
JOIN product_spec_values psv ON psv.product_id = p.id AND psv.is_primary = 1
JOIN metrics m     ON m.id = psv.metric_id
LEFT JOIN sources s ON s.id = psv.source_id
WHERE p.curation_status = 'verified';
