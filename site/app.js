/* 캠핑기어 정직비교 — 정적 프론트엔드 (DB→data/*.json) */
const GRADE_CLASS = { "🟢 A": "A", "🟡 B": "B", "🔴 한계": "L" };
const gradeBadge = g => `<span class="grade ${GRADE_CLASS[g] || ""}">${g}</span>`;
const won = n => n == null ? "—" : n.toLocaleString("ko-KR") + "원";
const priceRange = (a, b) => a == null ? '<span class="nd">가격없음</span>'
  : (a === b ? won(a) : `${won(a)}~${won(b)}`);

/* 값 표시: 무게(g) 1000↑ → kg, 부피(cm3) 1000↑ → L 환산 */
function fmtVal(v, unit) {
  if (v == null) return "—";
  if (unit === "g" && v >= 1000) return +(v / 1000).toFixed(2) + "kg";
  if (unit === "cm3" && v >= 1000) return +(v / 1000).toFixed(1) + "L";
  return (+v.toFixed(2)) + (unit || "");
}

function stars(n) {
  if (n == null) return '<span class="nd">—</span>';
  let h = "", full = Math.floor(n), half = (n - full) >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) h += "★";
    else if (i === full && half) h += "◐";
    else h += '<span class="e">★</span>';
  }
  return `<span class="stars" title="★${n}">${h}</span>`;
}

const GRADE_LEGEND = `
  <div class="legend">
    <b>신뢰등급</b>
    <span><span class="grade A">🟢 A</span> 모든 핵심 비교축의 데이터가 80%+ — 비교 신뢰</span>
    <span><span class="grade B">🟡 B</span> 신뢰 축 2개+ 있으나 일부 축은 데이터 부족</span>
    <span><span class="grade L">🔴 한계</span> 핵심 스펙이 국내 미공개 — ⚠ 표시 지표는 표본 적음</span>
    <span class="lg-sep"></span>
    <b>값 배지</b>
    <span><span class="b 확정">확정</span> 외부 교차확인</span>
    <span><span class="b 참고">참고</span> 다나와(기준 불명)</span>
    <span><span class="b 외형기준">외형기준</span> 이너 미상</span>
    <span><span class="b 데이터부족">데이터부족</span> 미공개</span>
  </div>`;

async function getJSON(p) { const r = await fetch(p); if (!r.ok) throw new Error(p); return r.json(); }

/* HTML 이스케이프 (모델명에 < > & " ' 들어가도 안전) */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* 공통: 카테고리 네비게이션 바 (어느 카테고리든 직접 이동) */
async function renderCatNav(activeSlug) {
  const el = document.getElementById("catnav");
  if (!el) return;
  try {
    const m = await getJSON("data/manifest.json");
    el.innerHTML = m.categories.map(c =>
      `<a class="navchip${c.slug === activeSlug ? " on" : ""}" href="category.html?cat=${c.slug}"
         title="${c.name} · ${c.grade}">${c.name}<i>${GRADE_CLASS[c.grade] || ""}</i></a>`).join("");
  } catch (e) { /* noop */ }
}

/* ---------- 허브 ---------- */
async function renderHub() {
  let m;
  try { m = await getJSON("data/manifest.json"); }
  catch (e) { document.getElementById("lead").textContent = "데이터를 불러오지 못했습니다. (로컬서버 필요)"; return; }
  document.getElementById("lead").innerHTML =
    `검증된 <b>${m.total_verified.toLocaleString()}개</b> 제품 · ${m.categories.length}개 카테고리 · 기준일 ${m.generated}`;

  document.getElementById("legend").innerHTML = GRADE_LEGEND;

  const grid = document.getElementById("grid");
  grid.innerHTML = m.categories.map(c => `
    <a class="card" href="category.html?cat=${c.slug}">
      <div class="ct"><h3>${c.name}</h3>${gradeBadge(c.grade)}</div>
      <div class="meta">${c.count.toLocaleString()}개 모델</div>
      <div class="metrics">
        ${c.star_metrics.map(s => `<span class="chip${c.limits.includes(s) ? " lim" : ""}"
           title="${c.limits.includes(s) ? s + ' — 데이터 부족(표본 적음)' : s}">${s}${c.limits.includes(s) ? " ⚠" : ""}</span>`).join("")}
      </div>
    </a>`).join("");

  // 홈 전역 검색
  setupHomeSearch();
  document.getElementById("foot").innerHTML =
    `자동생성 LIMITS 기반 · 측정값만 · 추측 없음.`;
}

async function setupHomeSearch() {
  let idx = [];
  try { idx = await getJSON("data/search.json"); } catch (e) { return; }
  const inp = document.getElementById("homeq"), box = document.getElementById("homeres");
  if (!inp) return;
  const run = () => {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 1) { box.innerHTML = ""; box.style.display = "none"; return; }
    const hits = idx.filter(x => (x.b + " " + x.m).toLowerCase().includes(q)).slice(0, 30);
    box.style.display = "block";
    box.innerHTML = hits.length ? hits.map(x =>
      `<a class="sres" href="category.html?cat=${x.s}&q=${encodeURIComponent(x.m)}">
         <span class="sb">${esc(x.b)}</span> ${esc(x.m)}${x.cap ? ` <i>${x.cap}인</i>` : ""}
         <span class="scat">${esc(x.c)}</span></a>`).join("")
      : `<div class="sres nd">"${esc(inp.value)}" 검색 결과 없음</div>`;
  };
  inp.oninput = run;
  inp.onfocus = run;
}

/* ---------- 카테고리 비교표 + 필터 ---------- */
let STATE = {};

async function renderCategory() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("cat");
  let d;
  try { d = await getJSON(`data/${slug}.json`); }
  catch (e) { document.getElementById("title").textContent = "카테고리를 찾을 수 없습니다."; return; }
  const rawQ = params.get("q") || "";   // 홈검색 링크의 q(대문자 포함 가능)
  STATE = { data: d, q: rawQ.toLowerCase(), cap: "", brand: "", minStar: 0, sortKey: null, sortAsc: false,
            dir: Object.fromEntries(d.metrics.map(m => [m.key, m.direction])) };
  renderCatNav(slug);

  document.getElementById("crumbName").textContent = d.name;
  document.title = `${d.name} 비교 — 캠핑기어 정직비교`;
  document.getElementById("title").innerHTML = `${d.name} ${gradeBadge(d.grade)}`;
  document.getElementById("lead").innerHTML =
    `${d.count.toLocaleString()}개 모델 (색상·구매처 변형 통합) · 같은 세그먼트 안 순위백분위 별점`;
  document.getElementById("legend").innerHTML = GRADE_LEGEND;

  const star = d.metrics.filter(m => m.is_star);
  const lims = star.filter(m => m.limit);
  const note = document.getElementById("limitNote");
  if (lims.length) {
    note.style.display = "";
    note.innerHTML = `<b>⚠ 데이터 한계.</b> ` +
      lims.map(m => `<b>${m.label}</b> 충전율 ${m.fill}% — 별점은 소수 표본 기준, 값 없는 제품은 <span class="b 데이터부족">데이터부족</span>.`).join(" ");
  } else { note.style.display = "none"; }

  buildFilters(d, star);
  buildHead(d, star);
  STATE.sortKey = "spec:" + (star[0] && star[0].key);
  STATE.sortAsc = defaultAsc(STATE.sortKey);   // 주력지표 '좋은 것 먼저'
  document.getElementById("q").value = rawQ;   // 표시는 원본 대소문자, 필터는 소문자(STATE.q)
  document.getElementById("q").oninput = e => { STATE.q = e.target.value.trim().toLowerCase(); draw(); };
  draw();
}

/* 필터 태그 바 (카테고리 상단) */
function buildFilters(d, star) {
  const bar = document.getElementById("filters");
  const parts = [];
  // 인원
  const caps = [...new Set(d.models.map(x => x.capacity).filter(x => x != null))].sort((a, b) => a - b);
  if (caps.length) {
    parts.push(`<div class="fgrp"><span class="flab">인원</span>` +
      `<button class="ftag on" data-f="cap" data-v="">전체</button>` +
      caps.map(c => `<button class="ftag" data-f="cap" data-v="${c}">${c}인</button>`).join("") + `</div>`);
  }
  // 별점 임계 (주력 지표)
  parts.push(`<div class="fgrp"><span class="flab">별점</span>` +
    [0, 3, 4, 4.5].map(s => `<button class="ftag${s === 0 ? " on" : ""}" data-f="star" data-v="${s}">${s === 0 ? "전체" : "★" + s + "+"}</button>`).join("") + `</div>`);
  // 브랜드 (상위 빈도)
  const bc = {};
  d.models.forEach(m => bc[m.brand] = (bc[m.brand] || 0) + 1);
  const topBrands = Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 12);
  parts.push(`<div class="fgrp"><span class="flab">브랜드</span>` +
    `<button class="ftag on" data-f="brand" data-v="">전체</button>` +
    topBrands.map(([b, n]) => `<button class="ftag" data-f="brand" data-v="${b}">${b} <i>${n}</i></button>`).join("") + `</div>`);
  bar.innerHTML = parts.join("");
  bar.querySelectorAll(".ftag").forEach(btn => btn.onclick = () => {
    const f = btn.dataset.f;
    bar.querySelectorAll(`.ftag[data-f="${f}"]`).forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    if (f === "cap") STATE.cap = btn.dataset.v;
    if (f === "brand") STATE.brand = btn.dataset.v;
    if (f === "star") STATE.minStar = +btn.dataset.v;
    draw();
  });
}

function buildHead(d, star) {
  const cols = [["brand", "브랜드"], ["model", "모델"]];
  const hasCap = d.models.some(m => m.capacity != null);
  if (hasCap) cols.push(["capacity", "인원"]);
  cols.push(["price_min", "가격"]);
  star.forEach(m => cols.push(["spec:" + m.key, `${m.label}${m.unit ? `(${m.unit})` : ""}`]));
  STATE.cols = cols; STATE.hasCap = hasCap;
  document.getElementById("head").innerHTML = cols.map(([k, lab]) => `<th data-k="${k}">${lab}</th>`).join("");
  document.querySelectorAll("#head th").forEach(th => th.onclick = () => {
    if (STATE.sortKey === th.dataset.k) STATE.sortAsc = !STATE.sortAsc;
    else { STATE.sortKey = th.dataset.k; STATE.sortAsc = defaultAsc(th.dataset.k); }
    draw();
  });
}

function cellVal(m, key) {
  // 스펙 컬럼은 표시되는 '값'으로 정렬(별점 아님) → 클릭한 컬럼이 단조 정렬돼 직관적.
  if (key.startsWith("spec:")) { const s = m.specs[key.slice(5)]; return s ? s.value : null; }
  return m[key];
}
// 컬럼 기본 정렬방향: 스펙은 '좋은 것 먼저'(낮을수록좋음→오름차순), 가격=싼것먼저(asc), 그외 asc
function defaultAsc(key) {
  if (key.startsWith("spec:")) return (STATE.dir[key.slice(5)] === "lower_better");
  return true;
}

function draw() {
  const d = STATE.data, star = d.metrics.filter(m => m.is_star);
  const primary = star[0] && star[0].key;
  let rows = d.models.filter(m =>
    (!STATE.cap || String(m.capacity) === STATE.cap) &&
    (!STATE.brand || m.brand === STATE.brand) &&
    (!STATE.q || (m.brand + " " + m.model).toLowerCase().includes(STATE.q)) &&
    (!STATE.minStar || (m.specs[primary] && m.specs[primary].stars >= STATE.minStar)));

  const k = STATE.sortKey, asc = STATE.sortAsc;
  rows.sort((a, b) => {
    let va = cellVal(a, k), vb = cellVal(b, k);
    if (typeof va === "string" || typeof vb === "string")
      return asc ? String(va).localeCompare(vb) : String(vb).localeCompare(va);
    // 데이터부족(null)은 정렬 방향과 무관하게 항상 맨 아래
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return asc ? va - vb : vb - va;
  });

  document.querySelectorAll("#head th").forEach(th => {
    th.classList.toggle("sorted", th.dataset.k === k);
    th.classList.toggle("asc", th.dataset.k === k && asc);
  });

  const body = rows.map(m => {
    let tds = `<td class="brand">${esc(m.brand)}</td><td class="model"><b>${esc(m.model)}</b>` +
      (m.variants > 1 ? ` <span class="nd">+${m.variants - 1}색</span>` : "") + `</td>`;
    if (STATE.hasCap) tds += `<td>${m.capacity != null ? m.capacity + "인" : "—"}</td>`;
    tds += `<td class="price">${priceRange(m.price_min, m.price_max)}</td>`;
    star.forEach(mt => {
      const s = m.specs[mt.key];
      if (!s || s.value == null) { tds += `<td><span class="b 데이터부족">데이터부족</span></td>`; return; }
      tds += `<td><div class="cell"><span class="val">${fmtVal(s.value, mt.unit)}</span>` +
        `${stars(s.stars)}<span class="b ${s.badge}">${s.badge}</span></div></td>`;
    });
    return `<tr>${tds}</tr>`;
  }).join("");
  document.getElementById("body").innerHTML = body ||
    `<tr><td colspan="${STATE.cols.length}" class="nd" style="padding:20px">조건에 맞는 결과 없음 — 필터를 완화하세요</td></tr>`;
  document.getElementById("count").textContent = `${rows.length} / ${d.models.length}개`;
  document.getElementById("foot").innerHTML =
    `컬럼 클릭=그 값으로 정렬(스펙은 좋은 것 먼저) · 별점=세그먼트 내 순위백분위(중앙값 ★3) · ` +
    `가격=국내가 우선 · 무게 1kg↑는 kg 표기 · 측정값만.`;
}
