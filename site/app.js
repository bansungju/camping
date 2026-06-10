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
    // 브랜드 단위 매치(가로지르기) — "헬리녹스 전체 39개 →"를 상단에
    const bcount = {};
    idx.forEach(x => { if (x.b.toLowerCase().includes(q)) bcount[x.b] = (bcount[x.b] || 0) + 1; });
    const brandHits = Object.entries(bcount).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const hits = idx.filter(x => (x.b + " " + x.m).toLowerCase().includes(q)).slice(0, 30);
    box.style.display = "block";
    const brandHtml = brandHits.map(([b, n]) =>
      `<a class="sres sbrand" href="brand.html?b=${encodeURIComponent(b)}">
         <span class="sb">${esc(b)}</span> <b>전체 ${n}개</b> 모아보기
         <span class="scat">브랜드 →</span></a>`).join("");
    box.innerHTML = (brandHtml || "") + (hits.length ? hits.map(x =>
      `<a class="sres" href="category.html?cat=${x.s}&q=${encodeURIComponent(x.m)}">
         <span class="sb">${esc(x.b)}</span> ${esc(x.m)}${x.cap ? ` <i>${x.cap}인</i>` : ""}
         <span class="scat">${esc(x.c)}</span></a>`).join("")
      : (brandHtml ? "" : `<div class="sres nd">"${esc(inp.value)}" 검색 결과 없음</div>`));
  };
  inp.oninput = run;
  inp.onfocus = run;
}

/* ---------- 카테고리 비교표 + 필터 ---------- */
let STATE = {};

/* 필터 상태 → URL (공유·뒤로가기·새로고침에 필터 보존). 69R 사용성감사 [상]1 */
function defaultSortKey() {
  const s0 = STATE.data.metrics.filter(m => m.is_star)[0];
  return "spec:" + (s0 && s0.key);
}
function serializeState() {
  const p = new URLSearchParams();
  p.set("cat", new URLSearchParams(location.search).get("cat") || "");
  if (STATE.q) p.set("q", STATE.q);
  if (STATE.cap) p.set("cap", STATE.cap);
  if (STATE.brands.size) p.set("brands", [...STATE.brands].join("|"));
  for (const [k, r] of Object.entries(STATE.range)) {
    if (r.min != null) p.set(k + "__min", r.min);
    if (r.max != null) p.set(k + "__max", r.max);
  }
  const dk = defaultSortKey();
  if (STATE.sortKey && !(STATE.sortKey === dk && STATE.sortAsc === defaultAsc(dk))) {
    p.set("sort", STATE.sortKey); p.set("sa", STATE.sortAsc ? "1" : "0");
  }
  if (STATE.qExclude) p.set("qx", "1");
  history.replaceState(null, "", "?" + p.toString());
}
function restoreState(params) {
  STATE.q = (params.get("q") || "").toLowerCase();
  STATE.cap = params.get("cap") || "";
  const br = params.get("brands"); if (br) br.split("|").forEach(b => STATE.brands.add(b));
  STATE.range = {};
  for (const [pk, pv] of params.entries()) {
    const mm = pk.match(/^(.+)__(min|max)$/);
    if (mm) { (STATE.range[mm[1]] = STATE.range[mm[1]] || {})[mm[2]] = parseFloat(pv); }
  }
  const srt = params.get("sort");
  if (srt) { STATE.sortKey = srt; STATE.sortAsc = params.get("sa") === "1"; }
  STATE.qExclude = params.get("qx") === "1";
}

async function renderCategory() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("cat");
  let d;
  try { d = await getJSON(`data/${slug}.json`); }
  catch (e) { document.getElementById("title").textContent = "카테고리를 찾을 수 없습니다."; return; }
  const rawQ = params.get("q") || "";   // 홈검색 링크의 q(대문자 포함 가능)
  STATE = { data: d, q: rawQ.toLowerCase(), cap: "", brands: new Set(), range: {}, qExclude: false,
            sortKey: null, sortAsc: false,
            dir: Object.fromEntries(d.metrics.map(m => [m.key, m.direction])),
            unit: Object.fromEntries(d.metrics.map(m => [m.key, m.unit])) };
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
  restoreState(params);                        // URL의 필터상태 복원(공유링크·뒤로가기)
  syncFilterUI();                              // 복원된 STATE를 컨트롤(칩·입력)에 반영
  document.getElementById("q").value = params.get("q") || rawQ;   // 표시는 원본, 필터는 소문자
  document.getElementById("q").oninput = e => { STATE.q = e.target.value.trim().toLowerCase(); draw(); };
  draw();
}

/* 필터 바 (카테고리 상단) — 범위·멀티브랜드·정렬·품질 */
function buildFilters(d, star) {
  const bar = document.getElementById("filters");
  const ms = d.models;
  const num = (arr) => arr.filter(v => v != null);
  const parts = [];

  // 인원 (단일 선택)
  const caps = [...new Set(ms.map(x => x.capacity).filter(x => x != null))].sort((a, b) => a - b);
  if (caps.length) {
    parts.push(`<div class="fgrp"><span class="flab">인원</span>` +
      `<button class="ftag on" data-cap="">전체</button>` +
      caps.map(c => `<button class="ftag" data-cap="${c}">${c}인</button>`).join("") + `</div>`);
  }

  // 가격 범위
  const prices = num(ms.map(m => m.price_min));
  if (prices.length) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    parts.push(`<div class="fgrp"><span class="flab">가격</span>
      <input class="frng" type="number" data-rng="price" data-b="min" placeholder="${lo.toLocaleString()}" inputmode="numeric">
      <span class="rsep">~</span>
      <input class="frng" type="number" data-rng="price" data-b="max" placeholder="${hi.toLocaleString()}" inputmode="numeric">
      <span class="runit">원</span></div>`);
  }

  // 스펙 범위 (각 ★지표) — 무게는 kg환산 안내
  star.forEach(m => {
    const vals = num(ms.map(x => x.specs[m.key] && x.specs[m.key].value));
    if (vals.length < 2) return;
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const u = m.unit || "";
    const hint = (u === "g") ? "g(1000↑kg)" : u;
    parts.push(`<div class="fgrp"><span class="flab">${m.label}</span>
      <input class="frng" type="number" step="any" data-rng="${m.key}" data-b="min" placeholder="${+lo.toFixed(1)}" inputmode="decimal">
      <span class="rsep">~</span>
      <input class="frng" type="number" step="any" data-rng="${m.key}" data-b="max" placeholder="${+hi.toFixed(1)}" inputmode="decimal">
      <span class="runit">${hint}</span></div>`);
  });

  // 브랜드 멀티선택 + 전체 드롭다운
  const bc = {};
  ms.forEach(m => bc[m.brand] = (bc[m.brand] || 0) + 1);
  const sorted = Object.entries(bc).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 12);
  parts.push(`<div class="fgrp"><span class="flab">브랜드</span>` +
    top.map(([b, n]) => `<button class="ftag" data-brand="${esc(b)}">${esc(b)} <i>${n}</i></button>`).join("") +
    (sorted.length > 12 ? `<select class="fsel" data-brandsel>
       <option value="">＋ 브랜드 (${sorted.length})</option>` +
      sorted.map(([b, n]) => `<option value="${esc(b)}">${esc(b)} (${n})</option>`).join("") + `</select>` : "") + `</div>`);

  // 정렬 + 품질
  parts.push(`<div class="fgrp"><span class="flab">정렬</span>
    <select class="fsel" data-sort>
      <option value="">기본(주력지표)</option>
      <option value="value">가성비순(별점/가격)</option>
      <option value="price_min">가격 낮은순</option>
      ${star.map(m => `<option value="spec:${m.key}">${m.label} ${m.direction === 'higher_better' ? '높은' : '좋은'}순</option>`).join("")}
    </select>
    <label class="fchk" title="현재 정렬 중인 지표의 값이 없는(데이터부족) 행을 숨깁니다"><input type="checkbox" data-qx> 정렬지표 데이터부족 행 숨김</label></div>`);

  bar.innerHTML = parts.join("");
  // 모바일: 필터바를 기본 접고 토글 버튼 노출(첫 화면에 표가 바로 보이게). 69R [중]4
  if (!document.getElementById("filtoggle")) {
    bar.insertAdjacentHTML("beforebegin",
      `<button id="filtoggle" class="filtoggle" type="button">필터 펼치기 ▾</button>`);
    const tg = document.getElementById("filtoggle");
    tg.onclick = () => {
      const col = bar.classList.toggle("collapsed");
      tg.textContent = col ? "필터 펼치기 ▾" : "필터 접기 ▴";
    };
  }
  if (window.innerWidth <= 640) bar.classList.add("collapsed");

  // 인원
  bar.querySelectorAll("[data-cap]").forEach(btn => btn.onclick = () => {
    bar.querySelectorAll("[data-cap]").forEach(b => b.classList.remove("on"));
    btn.classList.add("on"); STATE.cap = btn.dataset.cap; draw();
  });
  // 브랜드 멀티(칩 토글)
  bar.querySelectorAll("[data-brand]").forEach(btn => btn.onclick = () => {
    const b = btn.dataset.brand;
    if (STATE.brands.has(b)) { STATE.brands.delete(b); btn.classList.remove("on"); }
    else { STATE.brands.add(b); btn.classList.add("on"); }
    draw();
  });
  // 브랜드 드롭다운(추가)
  const bsel = bar.querySelector("[data-brandsel]");
  if (bsel) bsel.onchange = e => { if (e.target.value) { STATE.brands.add(e.target.value); e.target.value = ""; draw(); } };
  // 범위 입력
  bar.querySelectorAll(".frng").forEach(inp => inp.oninput = () => {
    const key = inp.dataset.rng, b = inp.dataset.b, v = inp.value.trim();
    STATE.range[key] = STATE.range[key] || {};
    if (v === "") delete STATE.range[key][b]; else STATE.range[key][b] = parseFloat(v);
    if (!Object.keys(STATE.range[key]).length) delete STATE.range[key];
    draw();
  });
  // 정렬 셀렉트
  const ssel = bar.querySelector("[data-sort]");
  if (ssel) ssel.onchange = e => {
    const v = e.target.value;
    if (!v) { STATE.sortKey = "spec:" + (star[0] && star[0].key); STATE.sortAsc = defaultAsc(STATE.sortKey); }
    else if (v === "value") { STATE.sortKey = "value"; STATE.sortAsc = false; }
    else { STATE.sortKey = v; STATE.sortAsc = defaultAsc(v); }
    draw();
  };
  // 품질 토글
  const qx = bar.querySelector("[data-qx]");
  if (qx) qx.onchange = e => { STATE.qExclude = e.target.checked; draw(); };
}

// 활성 필터 요약 칩(개별 해제) + 전체해제
function renderActiveFilters() {
  const el = document.getElementById("activefilters");
  if (!el) return;
  const chips = [];
  if (STATE.cap) chips.push([`인원 ${STATE.cap}인`, () => { STATE.cap = ""; }]);
  STATE.brands.forEach(b => chips.push([`브랜드 ${b}`, () => STATE.brands.delete(b)]));
  Object.entries(STATE.range).forEach(([k, r]) => {
    const lab = k === "price" ? "가격" : (STATE.data.metrics.find(m => m.key === k) || {}).label || k;
    const u = k === "price" ? "원" : (STATE.unit[k] || "");
    const txt = `${lab} ${r.min != null ? r.min : ""}~${r.max != null ? r.max : ""}${u}`;
    chips.push([txt, () => delete STATE.range[k]]);
  });
  if (STATE.qExclude) chips.push(["정렬지표 데이터부족 숨김", () => { STATE.qExclude = false; }]);
  if (STATE.q) chips.push([`"${STATE.q}"`, () => { STATE.q = ""; document.getElementById("q").value = ""; }]);
  el.innerHTML = chips.length
    ? chips.map((c, i) => `<button class="achip" data-ai="${i}">${esc(c[0])} ✕</button>`).join("") +
      `<button class="achip clear" data-clear>전체 해제</button>`
    : "";
  el._chips = chips;
  el.querySelectorAll(".achip[data-ai]").forEach(b => b.onclick = () => { chips[+b.dataset.ai][1](); syncFilterUI(); draw(); });
  const cl = el.querySelector("[data-clear]");
  if (cl) cl.onclick = () => {
    STATE.cap = ""; STATE.brands.clear(); STATE.range = {}; STATE.qExclude = false; STATE.q = "";
    document.getElementById("q").value = ""; syncFilterUI(); draw();
  };
}

// 칩/입력 UI를 STATE에 동기화(활성칩에서 해제 시 컨트롤도 반영)
function syncFilterUI() {
  const bar = document.getElementById("filters");
  bar.querySelectorAll("[data-cap]").forEach(b => b.classList.toggle("on", b.dataset.cap === STATE.cap));
  bar.querySelectorAll("[data-brand]").forEach(b => b.classList.toggle("on", STATE.brands.has(b.dataset.brand)));
  bar.querySelectorAll(".frng").forEach(inp => {
    const r = STATE.range[inp.dataset.rng];
    inp.value = (r && r[inp.dataset.b] != null) ? r[inp.dataset.b] : "";
  });
  const qx = bar.querySelector("[data-qx]"); if (qx) qx.checked = STATE.qExclude;
  // 정렬 셀렉트도 복원상태 반영(URL→컨트롤). 기본 주력지표 정렬이면 '기본' 표시
  const ssel = bar.querySelector("[data-sort]");
  if (ssel) ssel.value = (STATE.sortKey === defaultSortKey()) ? "" : (STATE.sortKey || "");
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
  if (key === "value") {   // 가성비 = 주력지표 별점 / 가격(만원)
    const pk = STATE.data.metrics.filter(x => x.is_star)[0];
    const s = pk && m.specs[pk.key];
    if (!s || s.stars == null || !m.price_min) return null;
    return s.stars / (m.price_min / 10000);
  }
  return m[key];
}
// 모델이 범위 필터를 통과하나 (price + 각 스펙)
function passRange(m) {
  for (const [key, r] of Object.entries(STATE.range)) {
    const v = key === "price" ? m.price_min : (m.specs[key] && m.specs[key].value);
    if (v == null) return false;                 // 값 없으면 범위 못 만족
    if (r.min != null && v < r.min) return false;
    if (r.max != null && v > r.max) return false;
  }
  return true;
}
// 컬럼 기본 정렬방향: 스펙은 '좋은 것 먼저'(낮을수록좋음→오름차순), 가격=싼것먼저(asc), 그외 asc
function defaultAsc(key) {
  if (key.startsWith("spec:")) return (STATE.dir[key.slice(5)] === "lower_better");
  return true;
}

function draw() {
  const d = STATE.data, star = d.metrics.filter(m => m.is_star);
  renderActiveFilters();
  let rows = d.models.filter(m =>
    (!STATE.cap || String(m.capacity) === STATE.cap) &&
    (!STATE.brands.size || STATE.brands.has(m.brand)) &&
    (!STATE.q || (m.brand + " " + m.model).toLowerCase().includes(STATE.q)) &&
    passRange(m));

  const k = STATE.sortKey, asc = STATE.sortAsc;
  // 품질: '데이터부족 제외' → 정렬 기준 값이 없는 모델 숨김
  if (STATE.qExclude) rows = rows.filter(m => cellVal(m, k) != null);
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
  serializeState();   // 필터상태를 URL에 반영(공유·뒤로가기·새로고침 보존)
  document.getElementById("foot").innerHTML =
    `컬럼 클릭=그 값으로 정렬(스펙은 좋은 것 먼저) · 별점=세그먼트 내 순위백분위(중앙값 ★3) · ` +
    `가격=국내가 우선 · 무게 1kg↑는 kg 표기 · 측정값만.`;
}

/* ---------- 브랜드 가로지르기 (전 카테고리 한 브랜드 모아보기) ---------- */
async function renderBrand() {
  renderCatNav("");
  let idx;
  try { idx = await getJSON("data/search.json"); }
  catch (e) { document.getElementById("title").textContent = "데이터를 불러오지 못했습니다."; return; }
  const params = new URLSearchParams(location.search);
  const bname = params.get("b") || "";

  // 브랜드 목록(제품수순) — 칩으로 빠른 전환
  const bcount = {};
  idx.forEach(x => bcount[x.b] = (bcount[x.b] || 0) + 1);
  const sortedBrands = Object.entries(bcount).sort((a, b) => b[1] - a[1]);

  const draw = (bn) => {
    const rows = idx.filter(x => x.b === bn);
    document.getElementById("crumbName").textContent = bn || "선택";
    document.title = `${bn} 전체보기 — 캠핑기어 정직비교`;
    document.getElementById("title").innerHTML = bn ? `${esc(bn)} <span class="nd" style="font-size:15px">전 카테고리</span>` : "브랜드를 선택하세요";
    document.getElementById("count").textContent = bn ? `${rows.length}개 모델` : "";
    // 카테고리별 그룹
    const byCat = {};
    rows.forEach(x => { (byCat[x.s] = byCat[x.s] || { name: x.c, slug: x.s, items: [] }).items.push(x); });
    const cats = Object.values(byCat).sort((a, b) => b.items.length - a.items.length);
    document.getElementById("lead").innerHTML = bn
      ? `<b>${rows.length}개</b> 모델 · ${cats.length}개 카테고리에 분포. 카테고리 제목을 누르면 그 카테고리에서 <b>${esc(bn)}</b>만 필터된 비교표로 이동.`
      : "왼쪽 목록에서 브랜드를 고르거나 위에서 검색하세요.";
    document.getElementById("sections").innerHTML = cats.map(c => `
      <h2 class="sec" style="margin-top:24px">
        <a href="category.html?cat=${c.slug}&brands=${encodeURIComponent(bn)}" style="color:var(--accent)">
          ${esc(c.name)} <span class="nd">${c.items.length}개 ›</span></a></h2>
      <div class="tablewrap"><table>
        <thead><tr><th>모델</th><th>인원</th><th>최저가</th></tr></thead>
        <tbody>${c.items.sort((a, b) => (a.p == null) - (b.p == null) || (a.p || 0) - (b.p || 0)).map(x => `
          <tr><td class="model"><a href="category.html?cat=${x.s}&q=${encodeURIComponent(x.m)}"><b>${esc(x.m)}</b></a></td>
            <td>${x.cap != null ? x.cap + "인" : "—"}</td>
            <td class="price">${x.p != null ? won(x.p) : '<span class="nd">가격없음</span>'}</td></tr>`).join("")}
        </tbody></table></div>`).join("") ||
      `<p class="nd">해당 브랜드 제품이 없습니다.</p>`;
  };

  // 브랜드 전환 칩
  const blist = document.getElementById("brandlist");
  const renderChips = (filter = "") => {
    const f = filter.toLowerCase();
    const show = sortedBrands.filter(([b]) => !f || b.toLowerCase().includes(f)).slice(0, 40);
    blist.innerHTML = show.map(([b, n]) =>
      `<button class="achip${b === (params.get("b") || "") ? "" : " clear"}" data-b="${esc(b)}">${esc(b)} ${n}</button>`).join("");
    blist.querySelectorAll("[data-b]").forEach(btn => btn.onclick = () => {
      const nb = btn.dataset.b;
      history.replaceState(null, "", "?b=" + encodeURIComponent(nb));
      params.set("b", nb); draw(nb); renderChips(document.getElementById("bq").value.trim());
    });
  };
  document.getElementById("bq").oninput = e => renderChips(e.target.value.trim());

  draw(bname);
  renderChips();
  document.getElementById("foot").innerHTML = `한 브랜드를 전 카테고리에서 모아봅니다 · 측정값만 · 추측 없음.`;
}
