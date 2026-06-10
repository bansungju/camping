#!/usr/bin/env node
// 장비 상세 정적 페이지 생성기
// Usage: node scripts/build-item-pages.js
// Output: site/item/{category}/{slug}.html

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../site/data");
const OUT_DIR = path.join(__dirname, "../site/item");
const SITE_URL = "https://gear-forest.com";

const CAT_LABELS = {
  "backpacking-tent": "백패킹 텐트",
  "auto-tent": "오토캠핑 텐트",
  "other-tent": "기타 텐트",
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

function specTableRows(specs, metrics) {
  return metrics
    .filter(m => specs[m.key] != null)
    .map(m => {
      const s = specs[m.key];
      const val = s.value != null ? `${s.value}${m.unit}` : "-";
      const stars = s.stars != null ? starsHtml(s.stars) : "";
      const badge = s.badge ? `<span class="spec-badge">${s.badge}</span>` : "";
      return `<tr><th>${m.label}</th><td>${val} ${badge}</td><td class="spec-stars">${stars}</td></tr>`;
    })
    .join("\n");
}

function buildPage(catSlug, catLabel, model, metrics, rank, total, idx) {
  const { brand, model: modelName, price_min, price_max, img, specs, capacity } = model;
  const pageSlug = slugify(brand, modelName, idx);
  const canonicalUrl = `${SITE_URL}/item/${catSlug}/${pageSlug}.html`;
  const catUrl = `${SITE_URL}/category/${catSlug}/`;
  const imgUrl = img ? `${SITE_URL}/${img}` : `${SITE_URL}/og-image.png`;
  const title = `${brand} ${modelName} — ${catLabel} 스펙 비교 | 장비의 숲`;
  const desc = `${brand} ${modelName} 정량 스펙 실측 데이터. ${catLabel} 내 ${rank}위/${total}개 비교. 무게·가격 등 실측값 기반 별점.`;

  const priceRange = price_min != null
    ? price_min === price_max ? `${price_min.toLocaleString()}원` : `${price_min.toLocaleString()}~${price_max.toLocaleString()}원`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${brand} ${modelName}`,
    "brand": { "@type": "Brand", "name": brand },
    "url": canonicalUrl,
    "image": imgUrl,
    "description": desc,
    ...(price_min != null ? {
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KRW",
        "price": price_min,
        "availability": "https://schema.org/InStock"
      }
    } : {}),
    "aggregateRating": (() => {
      const starVals = Object.values(specs).map(s => s.stars).filter(v => v != null);
      if (!starVals.length) return undefined;
      const avg = (starVals.reduce((a, b) => a + b, 0) / starVals.length).toFixed(1);
      return { "@type": "AggregateRating", "ratingValue": avg, "bestRating": "5", "ratingCount": starVals.length };
    })()
  };
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

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
<meta name="twitter:title" content="${brand} ${modelName} — 장비의 숲">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${imgUrl}">
<meta name="theme-color" content="#2f7a4e">
<link rel="icon" type="image/png" href="../../icon-192.png">
<link rel="stylesheet" href="../../style.css?v=ada1470d">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
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
.spec-table th{width:110px;color:var(--muted);font-weight:500}
.spec-badge{font-size:11px;background:var(--card2);border-radius:4px;padding:1px 5px;color:var(--muted);margin-left:4px}
.spec-stars{color:var(--accent)}
.back-link{display:inline-block;margin-top:20px;font-size:13px;color:var(--muted);text-decoration:none}
.back-link:hover{color:var(--accent)}
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a class="logo" href="../../index.html">장비의 <b>숲</b></a>
  <div class="sub">정량 스펙 별점 · 브랜드만 · 측정값만</div>
</div></header>

<main class="wrap">
  <nav style="font-size:12px;color:var(--muted);margin-top:16px;margin-bottom:4px">
    <a href="../../index.html" style="color:var(--muted);text-decoration:none">홈</a> ›
    <a href="../../category/${catSlug}/" style="color:var(--muted);text-decoration:none">${catLabel}</a> ›
    ${brand} ${modelName}
  </nav>

  <div class="item-hero">
    ${img ? `<img class="item-img" src="../../${img}" alt="${brand} ${modelName}" loading="lazy">` : ""}
    <div class="item-info">
      <h1 class="item-title">${modelName}</h1>
      <p class="item-brand">${brand}</p>
      ${priceRange ? `<p class="item-price">${priceRange}</p>` : ""}
      <p class="item-rank">${catLabel} ${rank}위 / ${total}개 비교</p>
      ${capacity ? `<p style="font-size:13px;color:var(--muted)">수용인원: ${capacity}인</p>` : ""}
    </div>
  </div>

  <h2 style="font-size:16px;font-weight:600;margin-bottom:8px">실측 스펙</h2>
  <table class="spec-table">
    <tbody>${specRows}</tbody>
  </table>

  <a class="back-link" href="../../category/${catSlug}/">← ${catLabel} 전체 비교 보기</a>
</main>

<footer><div class="wrap">정량 스펙 기반 정직 비교 · <a href="${canonicalUrl}" style="color:inherit">${brand} ${modelName}</a></div></footer>

<script src="../../app.js?v=df140e15"></script>
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
    const { pageSlug, html } = buildPage(catSlug, catLabel, model, data.metrics, idx + 1, total, idx);
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
