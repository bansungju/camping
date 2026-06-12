#!/usr/bin/env node
// 장비 상세 정적 페이지 생성기
// Usage: node scripts/build-item-pages.js
// Output: site/item/{category}/{slug}.html

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../site/data");
const OUT_DIR = path.join(__dirname, "../site/item");
const SITE_URL = "https://gear-forest.com";

// 자산 캐시버스팅 — app.js/style.css 내용 해시를 생성 시점에 동적 스탬프.
// (하드코딩 버전은 내용이 바뀌어도 캐시 키가 안 바뀌어 재방문자가 구버전 자산을 받는다 — H-38 근본 보강)
const _assetV = (rel) =>
  crypto.createHash("md5").update(fs.readFileSync(path.join(__dirname, "../site", rel))).digest("hex").slice(0, 8);
const APP_V = _assetV("app.js");
const CSS_V = _assetV("style.css");

const CAT_LABELS = {
  "backpacking-tent": "백패킹 텐트",
  "auto-tent": "오토캠핑 텐트",
  "shelter": "쉘터",
  "misc": "기타용품",
  "tarp": "타프",
  "sleeping-bag": "침낭",
  "mat": "매트",
  "chair": "의자",
  "table": "테이블",
  "cot": "코트",
  "burner": "버너",
  "cookware": "코펠",
  "lantern": "랜턴",
  "powerbank": "보조배터리",
  "cooler": "쿨러",
  "firepit": "화로대",
  "wagon": "왜건",
};

function slugify(brand, model, idx) {
  // Use cat-index as filename to avoid ENAMETOOLONG; keep brand/model in HTML content
  return `item-${idx}`;
}

function starsHtml(stars) {
  if (stars == null) return "";
  const full = Math.floor(stars);
  const half = stars % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty) + ` (${stars})`;
}

const UNIT_DISPLAY = { m2: "m²", cm3: "cm³", C: "°C" };
function specTableRows(specs, metrics) {
  return metrics
    .filter(m => specs[m.key] != null)
    .map(m => {
      const s = specs[m.key];
      const unit = UNIT_DISPLAY[m.unit] || m.unit;
      const val = s.value != null ? `${s.value}${unit}` : "-";
      const stars = s.stars != null ? starsHtml(s.stars) : "";
      const badge = s.badge ? `<span class="spec-badge">${s.badge}</span>` : "";
      const starsLabel = s.stars != null ? ` aria-label="${s.stars}점"` : "";
      return `<tr><th scope="row">${m.label}</th><td>${val} ${badge}</td><td class="spec-stars"${starsLabel}>${stars}</td></tr>`;
    })
    .join("\n");
}

function buildRelatedSection(catSlug, catLabel, model, allModels, currentIdx) {
  // 같은 카테고리에서 가격 가까운 3개 (현재 모델 제외)
  const withPrice = allModels
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => i !== currentIdx && m.price_min != null);
  if (!withPrice.length) return "";
  const ref = model.price_min;
  const sorted = ref != null
    ? withPrice.sort((a, b) => Math.abs(a.m.price_min - ref) - Math.abs(b.m.price_min - ref))
    : withPrice.slice(0, 3);
  const picks = sorted.slice(0, 3);
  const cards = picks.map(({ m, i }) => {
    const pr = m.price_min != null ? `${m.price_min.toLocaleString()}원` : "";
    const imgTag = m.img ? `<img src="../../${m.img}" alt="${m.brand} ${m.model}" style="width:60px;height:60px;object-fit:contain;border-radius:6px;border:1px solid var(--line);flex-shrink:0" loading="lazy">` : "";
    return `<a href="item-${i}.html" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--card);border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--txt)">
      ${imgTag}
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--muted)">${m.brand}</div>
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.model}</div>
        ${pr ? `<div style="font-size:12px;color:var(--accent);font-weight:600;margin-top:2px">${pr}</div>` : ""}
      </div>
    </a>`;
  }).join("");
  return `<h2 style="font-size:16px;font-weight:600;margin:24px 0 8px">비슷한 ${catLabel} 더 보기</h2>
<div style="display:flex;flex-direction:column;gap:6px">${cards}</div>`;
}

function buildPage(catSlug, catLabel, model, metrics, rank, total, idx, allModels) {
  const { brand, model: modelName, price_min, price_max, img, specs, capacity, coupang_url } = model;
  const pageSlug = slugify(brand, modelName, idx);
  const canonicalUrl = `${SITE_URL}/item/${catSlug}/${pageSlug}.html`;
  const catUrl = `${SITE_URL}/category.html?cat=${catSlug}`;
  const imgUrl = img ? `${SITE_URL}/${img}` : `${SITE_URL}/og-image.png`;
  const title = `${brand} ${modelName} — ${catLabel} 스펙 비교 | 장비의 숲`;
  const desc = `${brand} ${modelName} 정량 스펙 실측 데이터. ${catLabel} 내 ${rank}위/${total}개 비교. 무게·가격 등 실측값 기반 별점.`;

  const priceRange = price_min != null
    ? price_min === price_max ? `${price_min.toLocaleString()}원` : `${price_min.toLocaleString()}~${price_max.toLocaleString()}원`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": modelName,
    "brand": { "@type": "Brand", "name": brand },
    "url": canonicalUrl,
    "image": imgUrl,
    "description": desc,
    ...(price_min != null ? {
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KRW",
        "price": price_min,
        "availability": coupang_url ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
      }
    } : {}),
    "aggregateRating": (() => {
      const starVals = Object.values(specs).map(s => s.stars).filter(v => v != null);
      if (!starVals.length) return undefined;
      const avg = (starVals.reduce((a, b) => a + b, 0) / starVals.length).toFixed(1);
      return { "@type": "AggregateRating", "ratingValue": avg, "bestRating": "5", "ratingCount": 1, "reviewCount": 1 };
    })()
  };
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": SITE_URL + "/" },
      { "@type": "ListItem", "position": 2, "name": catLabel, "item": catUrl },
      { "@type": "ListItem", "position": 3, "name": `${brand} ${modelName}`, "item": canonicalUrl }
    ]
  };

  const specRows = specTableRows(specs, metrics);

  return { pageSlug, html: `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="장비의 숲">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${brand} ${modelName} — ${catLabel} 스펙 | 장비의 숲">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="${imgUrl}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="600">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@gear_forest">
<meta name="twitter:title" content="${brand} ${modelName} — 장비의 숲">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgUrl}">
<meta name="theme-color" content="#2f7a4e" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)">
<meta property="og:image:alt" content="${brand} ${modelName} — 장비의 숲">
<meta name="twitter:image:alt" content="${brand} ${modelName} — 장비의 숲">
<link rel="icon" type="image/png" href="../../icon-192.png">
<script>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')</script>
<link rel="stylesheet" href="../../style.css?v=${CSS_V}">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
<style>
.item-hero{display:flex;gap:20px;align-items:flex-start;margin:24px 0 20px;flex-wrap:wrap}
.item-img{width:200px;height:200px;object-fit:contain;border-radius:8px;background:var(--card);border:1px solid var(--line);flex-shrink:0}
.item-info{flex:1;min-width:200px}
.item-title{font-size:22px;font-weight:700;margin:0 0 4px}
.item-brand{font-size:14px;color:var(--muted);margin:0 0 12px}
.item-price{font-size:18px;font-weight:600;color:var(--accent);margin:0 0 12px}
.item-rank{font-size:13px;color:var(--muted);margin-bottom:16px}
.spec-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}
.spec-table th,.spec-table td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left}
.spec-table th{width:110px;color:var(--muted);font-weight:500;word-break:keep-all}
.spec-badge{font-size:11px;background:var(--card2);border-radius:4px;padding:1px 5px;color:var(--muted);margin-left:4px}
.spec-stars{color:var(--accent)}
.back-link{display:inline-block;margin-top:20px;font-size:13px;color:var(--muted);text-decoration:none}
.back-link:hover{color:var(--accent)}
.item-wish{display:inline-flex;align-items:center;gap:6px;margin-top:4px;padding:9px 16px;border:1.5px solid var(--line);border-radius:11px;background:var(--card);color:var(--muted);font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.item-wish:hover{border-color:var(--accent);color:var(--accent)}
.item-wish.on{border-color:var(--accent);background:var(--accent);color:#fff}
.item-wish .wish-ico{width:18px;height:18px;fill:none}
.item-wish.on .wish-ico{fill:#fff}
.item-buy{display:block;width:100%;max-width:320px;margin-top:14px;padding:13px;border:0;border-radius:11px;background:var(--accent);color:#fff;font-size:15px;font-weight:700;text-align:center;text-decoration:none;cursor:pointer}
.item-buy[disabled]{cursor:not-allowed;opacity:.4}
.item-buynote{font-size:12px;color:var(--muted);margin:8px 0 0;max-width:320px}
.item-set-btn{display:block;width:100%;max-width:320px;margin-top:8px;padding:11px;border:1.5px solid var(--accent);border-radius:11px;background:var(--card);color:var(--accent);font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.item-set-btn:hover{background:var(--accent);color:#fff}
.item-log-btn{display:block;width:100%;max-width:320px;margin-top:8px;padding:11px;border:1.5px solid var(--line);border-radius:11px;background:var(--card);color:var(--muted);font-size:14px;font-weight:600;text-align:center;text-decoration:none;transition:.15s}
.item-log-btn:hover{border-color:var(--accent);color:var(--accent)}
@media(max-width:480px){.item-hero{flex-direction:column}.item-img{width:100%;height:auto;aspect-ratio:1;max-height:260px}}
</style>
</head>
<body>
<a class="skip-link" href="#main">메인 콘텐츠로 바로가기</a>
<header class="top"><div class="wrap">
  <a class="logo" href="../../index.html"><img class="logo-mark" src="../../icon-192.png" alt="" width="26" height="26">장비의 <b>숲</b></a>
  <div class="sub">정량 스펙 별점 · 브랜드만 · 측정값만</div>
  <a href="../../account.html" class="header-acct" aria-label="내 계정">👤</a>
</div></header>

<main class="wrap" id="main">
  <nav style="font-size:12px;color:var(--muted);margin-top:16px;margin-bottom:4px">
    <a href="../../index.html" style="color:var(--muted);text-decoration:none">홈</a> ›
    <a href="../../category.html?cat=${catSlug}" style="color:var(--muted);text-decoration:none">${catLabel}</a> ›
    ${brand} ${modelName}
  </nav>

  <div class="item-hero">
    ${img ? `<img class="item-img" src="../../${img}" alt="${brand} ${modelName}" fetchpriority="high" onerror="this.onerror=null;this.style.display='none'">` : ""}
    <div class="item-info">
      <h1 class="item-title">${brand} ${modelName}</h1>
      ${priceRange ? `<p class="item-price">${priceRange}</p>` : ""}
      <p class="item-rank">${catLabel} ${rank}위 / ${total}개 비교</p>
      ${capacity ? `<p style="font-size:13px;color:var(--muted)">수용인원: ${capacity}인</p>` : ""}
      <button id="item-wish" class="item-wish" type="button" aria-label="찜" aria-pressed="false">
        <svg class="wish-ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>
        <span class="iw-label">찜하기</span>
      </button>
      <button id="item-set-add" class="item-set-btn" type="button">＋ 장비 꾸러미에 담기</button>
      <a class="item-log-btn" href="../../community.html?open-log=1">📝 커뮤니티 장비 로그 작성</a>
      ${coupang_url
        ? `<a class="item-buy" href="${String(coupang_url).replace(/"/g, "%22")}" target="_blank" rel="nofollow sponsored noopener">🛒 쿠팡에서 구매하기</a>
      <p class="item-buynote">이 링크는 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받습니다.</p>`
        : `<button class="item-buy" type="button" disabled aria-disabled="true">🛒 구매 링크 준비 중</button>`}
    </div>
  </div>

  <h2 style="font-size:16px;font-weight:600;margin-bottom:8px">실측 스펙</h2>
  <table class="spec-table">
    <caption style="position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden">${brand} ${modelName} 실측 스펙</caption>
    <tbody>${specRows}</tbody>
  </table>

  ${buildRelatedSection(catSlug, catLabel, model, allModels || [], idx)}
  <a class="back-link" href="../../category.html?cat=${catSlug}">← ${catLabel} 전체 비교 보기</a>
  <button type="button" class="scroll-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="맨 위로 이동">↑</button>
</main>

<footer><div class="wrap">정량 스펙 기반 정직 비교 · <a href="${canonicalUrl}" style="color:inherit">${brand} ${modelName}</a></div></footer>

<script src="../../app.js?v=${APP_V}"></script>
<script>
// 찜하기 — app.js의 전역 찜 API(wishKey·inWish·toggleWish) 재사용 (H-07)
(function(){
  var ITEM = ${JSON.stringify({ b: brand, m: modelName, cap: capacity == null ? null : capacity, s: catSlug, p: price_min == null ? null : price_min, img: img || null })};
  var btn = document.getElementById('item-wish');
  if (!btn || typeof wishKey !== 'function' || typeof toggleWish !== 'function') return;
  var key = wishKey(ITEM.b, ITEM.m, ITEM.cap);
  function paint(on){ btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); var l = btn.querySelector('.iw-label'); if (l) l.textContent = on ? '찜함' : '찜하기'; }
  paint(inWish(key));
  btn.addEventListener('click', function(){
    var added = toggleWish({ key: key, b: ITEM.b, m: ITEM.m, cap: ITEM.cap, s: ITEM.s, p: ITEM.p, img: ITEM.img });
    paint(added);
  });
  var setBtn = document.getElementById('item-set-add');
  if (setBtn && typeof openSetModal === 'function') {
    setBtn.addEventListener('click', function(){ openSetModal({ pcode: key, b: ITEM.b, m: ITEM.m, cap: ITEM.cap, s: ITEM.s, p: ITEM.p, img: ITEM.img, weight_g: null }); });
  }
})();
</script>
</body>
</html>` };
}

let totalPages = 0;
const sitemapEntries = [];

const categories = Object.keys(CAT_LABELS);
for (const catSlug of categories) {
  const dataPath = path.join(DATA_DIR, `${catSlug}.json`);
  if (!fs.existsSync(dataPath)) continue;

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!data.models || !data.metrics) continue;

  const catDir = path.join(OUT_DIR, catSlug);
  fs.mkdirSync(catDir, { recursive: true });

  const catLabel = CAT_LABELS[catSlug];
  const total = data.models.length;

  data.models.forEach((model, idx) => {
    const { pageSlug, html } = buildPage(catSlug, catLabel, model, data.metrics, idx + 1, total, idx, data.models);
    const outPath = path.join(catDir, `${pageSlug}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    sitemapEntries.push(`  <url><loc>${SITE_URL}/item/${catSlug}/${pageSlug}.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    totalPages++;
  });

  console.log(`  ${catSlug}: ${total}개`);
}

// Append to sitemap (or create sitemap-items.xml)
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</urlset>`;
fs.writeFileSync(path.join(__dirname, "../site/sitemap-items.xml"), sitemapXml, "utf8");

console.log(`\n✅ 총 ${totalPages}개 상세 페이지 생성 완료`);
console.log(`📄 site/sitemap-items.xml 생성됨`);
