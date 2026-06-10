/* 캠핑기어 정직비교 — 정적 프론트엔드 (DB→data/*.json) */
/* PWA: 서비스워커 등록(오프라인+홈화면 설치). 실패해도 사이트는 정상 동작 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
const GRADE_CLASS = { "🟢 A": "A", "🟡 B": "B", "🔴 한계": "L" };

/* 운영자 모드: ?ops=1 로 켜면(localStorage 영속) 신뢰등급·값배지·데이터한계가 보인다.
   기본(사용자)은 깔끔하게 별점·스펙만. ?ops=0 으로 끈다. */
(() => {
  const v = new URLSearchParams(location.search).get("ops");
  if (v === "1") localStorage.setItem("ops", "1");
  else if (v === "0") localStorage.removeItem("ops");
})();
const OPS = localStorage.getItem("ops") === "1";

/* 카테고리 아이콘(이미지 수집 전 단계: 이모지 타일). 중복 없이 1:1 */
const CAT_ICON = {
  "백패킹텐트": "⛺", "오토캠핑텐트": "🏕️", "기타텐트": "🎪", "침낭": "🛌", "매트": "🧘",
  "의자": "🪑", "랜턴": "🔦", "아이스박스": "🧊", "버너": "🍳", "타프": "⛱️",
  "테이블": "🪵", "야전침대": "🛏️", "코펠": "🥘", "웨건": "🛒", "화로대": "🔥", "파워뱅크": "🔋",
};
const catIcon = name => CAT_ICON[name] || "🏕️";
/* 카테고리별 옅은 배경 톤(아이콘 타일 — 단색 회색 대신 생동감) */
const CAT_TINT = {
  "백패킹텐트": "#eaf4ec", "오토캠핑텐트": "#eaf4ec", "기타텐트": "#eaf4ec", "타프": "#e6f4f7",
  "침낭": "#eef0fb", "매트": "#eef0fb", "야전침대": "#eef0fb", "아이스박스": "#e6f4f7",
  "의자": "#f6efe7", "테이블": "#f6efe7", "웨건": "#f6efe7",
  "버너": "#fdeee7", "화로대": "#fdeee7", "코펠": "#fdeee7",
  "랜턴": "#fdf6e0", "파워뱅크": "#fdf6e0",
};
const catTint = name => CAT_TINT[name] || "var(--card2)";

/* 캠핑 스타일 페르소나 — 측정 지표의 '좋은 방향'으로 추천(추측 없이 별점 재배열).
   각 pick: 카테고리 + 정렬 기준 지표(+선택 필터). 정직성 원칙상 측정 가능한 4개만. */
const PERSONAS = [
  { key: "backpacker", emoji: "🎒", name: "백패커", tagline: "메고 걷는다 — 가볍고 작게",
    note: "무게가 가벼운 순, 1~2인 기준",
    picks: [
      { cat: "backpacking-tent", metric: "weight_min", filter: m => m.capacity != null && m.capacity <= 2, label: "경량 텐트 (1~2인)" },
      { cat: "sleeping-bag", metric: "weight_min", label: "경량 침낭" },
      { cat: "mat", metric: "weight_min", label: "경량 매트" },
      { cat: "cookware", metric: "weight_min", label: "미니 코펠" },
      { cat: "burner", metric: "weight_min", label: "초경량 버너" },
    ] },
  { key: "minimal", emoji: "📦", name: "미니멀리스트", tagline: "적게, 다용도로",
    note: "최소 구성 — 텐트 대신 타프, 가벼운 순",
    picks: [
      { cat: "tarp", metric: "weight_min", label: "경량 타프 (텐트 대신)" },
      { cat: "sleeping-bag", metric: "weight_min", label: "경량 침낭" },
      { cat: "mat", metric: "weight_min", label: "경량 매트" },
      { cat: "cookware", metric: "weight_min", label: "미니 코펠" },
      { cat: "chair", metric: "weight_min", label: "경량 의자" },
    ] },
  { key: "auto", emoji: "🚙", name: "오토 / 맥시멀", tagline: "차로 싣고, 집처럼 편하게",
    note: "공간·용량·스펙이 큰 순 (무게 무관) · 스펙 상위일수록 가격이 높은 경향",
    picks: [
      { cat: "auto-tent", metric: "floor_area", label: "넓은 거실형 텐트" },
      { cat: "cooler", metric: "capacity_l", label: "대용량 아이스박스" },
      { cat: "burner", metric: "power_output", label: "고화력 버너" },
      { cat: "chair", metric: "max_load", label: "튼튼한 의자" },
      { cat: "powerbank", metric: "capacity_mah", label: "대용량 파워뱅크" },
    ] },
  { key: "family", emoji: "👨‍👩‍👧‍👦", name: "4인 가족", tagline: "안전하게, 넉넉하게",
    note: "4인 이상 · 넓고(공간분리) 방수 좋은 순 · ‘신속설치’는 측정값이 없어 미반영 · 스펙 상위는 고가 경향",
    picks: [
      { cat: "auto-tent", metric: "floor_area", filter: m => m.capacity != null && m.capacity >= 4, label: "4인+ 넓은 텐트" },
      { cat: "auto-tent", metric: "water_head", filter: m => m.capacity != null && m.capacity >= 4, label: "방수 좋은 텐트 (우천 안전)" },
      { cat: "cooler", metric: "capacity_l", label: "대용량 아이스박스" },
      // 가족 3~4계절 기준: -20℃ 미만 극지 동계백은 과스펙·고가라 제외(따뜻한 순)
      { cat: "sleeping-bag", metric: "comfort_temp",
        filter: m => m.specs.comfort_temp && m.specs.comfort_temp.value >= -20, label: "따뜻한 침낭 (3계절~겨울)" },
    ] },
];

const gradeBadge = g => OPS ? `<span class="grade ${GRADE_CLASS[g] || ""}">${g}</span>` : "";
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
         title="${c.name}"><span class="ni">${catIcon(c.name)}</span>${c.name}${OPS ? `<i>${GRADE_CLASS[c.grade] || ""}</i>` : ""}</a>`).join("");
  } catch (e) { /* noop */ }
}

/* ---------- 허브 ---------- */
async function renderHub() {
  let m;
  try { m = await getJSON("data/manifest.json"); }
  catch (e) { document.getElementById("lead").textContent = "데이터를 불러오지 못했습니다. (로컬서버 필요)"; return; }
  document.getElementById("lead").innerHTML =
    `<b>${m.total_verified.toLocaleString()}개</b> 제품 · ${m.categories.length}개 카테고리를 정량 스펙으로 별점 비교`;

  document.getElementById("legend").innerHTML = OPS ? GRADE_LEGEND : "";

  // 캠핑 스타일 추천 진입
  const pel = document.getElementById("personas");
  if (pel) pel.innerHTML = PERSONAS.map(p =>
    `<a class="pcard" href="recommend.html?p=${p.key}">
       <span class="pe">${p.emoji}</span>
       <span class="pn">${p.name}</span>
       <span class="pt">${p.tagline}</span></a>`).join("");

  const grid = document.getElementById("grid");
  grid.innerHTML = m.categories.map(c => `
    <a class="card" href="category.html?cat=${c.slug}">
      <div class="icon" style="background:${catTint(c.name)}">${catIcon(c.name)}</div>
      <div class="ct"><h3>${c.name}</h3>${gradeBadge(c.grade)}</div>
      <div class="meta">${c.count.toLocaleString()}개 모델</div>
      <div class="metrics">
        ${c.star_metrics.map(s => OPS
          ? `<span class="chip${c.limits.includes(s) ? " lim" : ""}" title="${c.limits.includes(s) ? s + ' — 데이터 부족(표본 적음)' : s}">${s}${c.limits.includes(s) ? " ⚠" : ""}</span>`
          : `<span class="chip">${s}</span>`).join("")}
      </div>
    </a>`).join("");

  // 홈 전역 검색
  setupHomeSearch();
  document.getElementById("foot").innerHTML = OPS
    ? `운영자 모드 · 자동생성 LIMITS 기반 · 측정값만 · 추측 없음.`
    : `같은 그룹 안에서 순위로 환산한 별점 · 측정값 기반.`;
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
      `<a class="sres" href="category.html?cat=${x.s}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">
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
    if (mm) {
      const f = parseFloat(pv);
      if (Number.isFinite(f)) (STATE.range[mm[1]] = STATE.range[mm[1]] || {})[mm[2]] = f;  // 71R: NaN 차단
    }
  }
  // 71R: sort는 실제 존재하는 옵션일 때만 채택(가짜키→기본 정렬, UI/상태 불일치 방지)
  const srt = params.get("sort");
  const validSort = srt && (srt === "value" || srt === "price_min" ||
    STATE.data.metrics.some(m => m.is_star && "spec:" + m.key === srt));
  if (validSort) { STATE.sortKey = srt; STATE.sortAsc = params.get("sa") === "1"; }
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
  document.getElementById("title").innerHTML =
    `<span class="titleicon" style="background:${catTint(d.name)}">${catIcon(d.name)}</span>${d.name} ${gradeBadge(d.grade)}`;
  document.getElementById("lead").innerHTML =
    `${d.count.toLocaleString()}개 모델 · 같은 그룹 안 순위로 환산한 별점`;
  document.getElementById("legend").innerHTML = OPS ? GRADE_LEGEND : "";

  const star = d.metrics.filter(m => m.is_star);
  const lims = star.filter(m => m.limit);
  const note = document.getElementById("limitNote");
  if (OPS && lims.length) {   // 데이터 한계 안내는 운영자 전용
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
      <option value="value">가성비순(${star[0] ? esc(star[0].label) : '별점'}/가격)</option>
      <option value="price_min">가격 낮은순</option>
      ${star.map(m => `<option value="spec:${m.key}">${m.label} ${m.direction === 'higher_better' ? '높은' : '좋은'}순</option>`).join("")}
    </select>
    <label class="fchk" title="정렬 중인 항목의 값이 없는 제품을 숨깁니다"><input type="checkbox" data-qx> 스펙값 있는 것만</label></div>`);

  bar.innerHTML = parts.join("");
  // 모바일: 필터바 기본접기+토글(첫 화면에 표 노출). 71R: 라벨을 실제 상태서 동기화 + 폭전환 대응
  if (!document.getElementById("filtoggle")) {
    bar.insertAdjacentHTML("beforebegin",
      `<button id="filtoggle" class="filtoggle" type="button"></button>`);
    const tg = document.getElementById("filtoggle");
    const syncLabel = () => tg.textContent = bar.classList.contains("collapsed") ? "필터 펼치기 ▾" : "필터 접기 ▴";
    tg.onclick = () => { bar.classList.toggle("collapsed"); syncLabel(); };
    const mq = window.matchMedia("(max-width:640px)");
    const applyMq = () => { bar.classList.toggle("collapsed", mq.matches); syncLabel(); };
    mq.addEventListener("change", applyMq);   // 640px 경계 넘나들 때 상태·라벨 재설정
    applyMq();                                 // 초기: 모바일이면 접힘
  }

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
  if (STATE.qExclude) chips.push(["스펙값 있는 것만", () => { STATE.qExclude = false; }]);
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
  document.getElementById("head").innerHTML = cols.map(([k, lab]) =>
    `<th data-k="${k}" tabindex="0" role="columnheader" aria-sort="none" title="클릭/Enter=정렬">${lab}</th>`).join("");
  const sortBy = k => {
    if (STATE.sortKey === k) STATE.sortAsc = !STATE.sortAsc;
    else { STATE.sortKey = k; STATE.sortAsc = defaultAsc(k); }
    draw();
  };
  document.querySelectorAll("#head th").forEach(th => {
    th.onclick = () => sortBy(th.dataset.k);
    th.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortBy(th.dataset.k); } };
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

// 0건일 때 '어느 필터가 범인'인지 진단 — 필터 하나씩 빼며 건수 재계산. 71R [중]
function passExcept(m, skip, sortK) {
  if (skip !== "cap" && STATE.cap && String(m.capacity) !== STATE.cap) return false;
  if (skip !== "brands" && STATE.brands.size && !STATE.brands.has(m.brand)) return false;
  if (skip !== "q" && STATE.q && !(m.brand + " " + m.model).toLowerCase().includes(STATE.q)) return false;
  for (const [key, r] of Object.entries(STATE.range)) {
    if (skip === "range:" + key) continue;
    const v = key === "price" ? m.price_min : (m.specs[key] && m.specs[key].value);
    if (v == null || (r.min != null && v < r.min) || (r.max != null && v > r.max)) return false;
  }
  if (skip !== "qx" && STATE.qExclude && cellVal(m, sortK) == null) return false;
  return true;
}
function diagnoseEmpty(sortK) {
  const d = STATE.data;
  const filters = [];
  if (STATE.cap) filters.push(["cap", `인원 ${STATE.cap}인`]);
  if (STATE.brands.size) filters.push(["brands", `브랜드(${[...STATE.brands].join("·")})`]);
  if (STATE.q) filters.push(["q", `검색 "${STATE.q}"`]);
  Object.keys(STATE.range).forEach(key => {
    const lab = key === "price" ? "가격" : (d.metrics.find(m => m.key === key) || {}).label || key;
    filters.push(["range:" + key, `${lab} 범위`]);
  });
  if (STATE.qExclude) filters.push(["qx", "스펙값 있는 것만"]);
  if (!filters.length) return "— 데이터가 없습니다";
  // 각 필터를 뺐을 때 건수 → 가장 많이 살아나는 것 제안
  const sug = filters.map(([id, lab]) => [lab, d.models.filter(m => passExcept(m, id, sortK)).length])
    .filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  if (!sug.length) return "— 여러 필터가 겹쳐 0건입니다. 활성 필터를 해제해보세요";
  return `— <b>${esc(sug[0][0])}</b> 조건을 빼면 ${sug[0][1]}개` + (sug[1] ? `, ${esc(sug[1][0])} 빼면 ${sug[1][1]}개` : "");
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
    const on = th.dataset.k === k;
    th.classList.toggle("sorted", on);
    th.classList.toggle("asc", on && asc);
    th.setAttribute("aria-sort", on ? (asc ? "ascending" : "descending") : "none");
  });

  const body = rows.map(m => {
    let tds = `<td class="brand">${esc(m.brand)}</td><td class="model"><b>${esc(m.model)}</b>` +
      (m.variants > 1 ? ` <span class="nd">+${m.variants - 1}색</span>` : "") + `</td>`;
    if (STATE.hasCap) tds += `<td>${m.capacity != null ? m.capacity + "인" : "—"}</td>`;
    tds += `<td class="price">${priceRange(m.price_min, m.price_max)}</td>`;
    star.forEach(mt => {
      const s = m.specs[mt.key];
      if (!s || s.value == null) {   // 사용자=깔끔한 '—', 운영자=데이터부족 배지
        tds += OPS ? `<td><span class="b 데이터부족">데이터부족</span></td>` : `<td><span class="nd">—</span></td>`;
        return;
      }
      tds += `<td><div class="cell"><span class="val">${fmtVal(s.value, mt.unit)}</span>` +
        `${stars(s.stars)}${OPS ? `<span class="b ${s.badge}">${s.badge}</span>` : ""}</div></td>`;
    });
    return `<tr>${tds}</tr>`;
  }).join("");
  document.getElementById("body").innerHTML = body ||
    `<tr><td colspan="${STATE.cols.length}" class="nd" style="padding:20px">조건에 맞는 결과 없음 ${diagnoseEmpty(k)}</td></tr>`;
  document.getElementById("count").textContent = `${rows.length} / ${d.models.length}개`;
  serializeState();   // 필터상태를 URL에 반영(공유·뒤로가기·새로고침 보존)
  document.getElementById("foot").innerHTML = OPS
    ? `컬럼 클릭=그 값으로 정렬(스펙은 좋은 것 먼저) · 별점=세그먼트 내 순위백분위(중앙값 ★3) · 가격=국내가 우선 · 측정값만.`
    : `컬럼을 누르면 그 항목으로 정렬 · 별점은 같은 그룹 내 순위 기준.`;
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
    document.getElementById("lead").innerHTML = !bn
      ? "아래 목록에서 브랜드를 고르거나 위에서 검색하세요."
      : rows.length
      ? `<b>${rows.length}개</b> 모델 · ${cats.length}개 카테고리에 분포. 카테고리 제목을 누르면 그 카테고리에서 <b>${esc(bn)}</b>만 필터된 비교표로 이동.`
      : `<b>${esc(bn)}</b> 제품이 없습니다. 브랜드명을 확인하거나 위에서 다시 검색하세요.`;
    document.getElementById("sections").innerHTML = cats.map(c => `
      <h2 class="sec" style="margin-top:24px">
        <a href="category.html?cat=${c.slug}&brands=${encodeURIComponent(bn)}" style="color:var(--accent)">
          ${esc(c.name)} <span class="nd">${c.items.length}개 ›</span></a></h2>
      <div class="tablewrap"><table>
        <thead><tr><th>모델</th><th>인원</th><th>최저가</th></tr></thead>
        <tbody>${c.items.sort((a, b) => (a.p == null) - (b.p == null) || (a.p || 0) - (b.p || 0)).map(x => `
          <tr><td class="model"><a href="category.html?cat=${x.s}&brands=${encodeURIComponent(bn)}&q=${encodeURIComponent(x.m)}"><b>${esc(x.m)}</b></a></td>
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
    blist.innerHTML = show.length
      ? show.map(([b, n]) =>
          `<button class="achip${b === (params.get("b") || "") ? "" : " clear"}" data-b="${esc(b)}">${esc(b)} ${n}</button>`).join("")
      : `<span class="nd">"${esc(filter)}" 브랜드 없음 · 철자를 확인하세요</span>`;
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

/* ---------- 캠핑 스타일 추천 ---------- */
async function renderRecommend() {
  renderCatNav("");
  const params = new URLSearchParams(location.search);
  const persona = PERSONAS.find(p => p.key === params.get("p")) || PERSONAS[0];

  document.getElementById("pswitch").innerHTML = PERSONAS.map(p =>
    `<a class="pchip${p.key === persona.key ? " on" : ""}" href="recommend.html?p=${p.key}">
       <span class="pe">${p.emoji}</span>${p.name}</a>`).join("");
  document.getElementById("crumbName").textContent = persona.name;
  document.title = `${persona.name} 추천 — 캠핑기어 정직비교`;
  document.getElementById("title").innerHTML = `<span class="titleicon">${persona.emoji}</span>${persona.name}`;
  document.getElementById("lead").textContent = persona.tagline;
  document.getElementById("pnote").innerHTML =
    `<b>측정 스펙 기준 추천</b> — ${persona.note}. 디자인·설치 편의성 등 측정할 수 없는 요소는 반영하지 않습니다.`;

  // 필요한 카테고리 데이터만 로드(중복 제거)
  const cats = [...new Set(persona.picks.map(p => p.cat))];
  const data = {};
  await Promise.all(cats.map(async c => { try { data[c] = await getJSON(`data/${c}.json`); } catch (e) { data[c] = null; } }));

  const sections = persona.picks.map(pick => {
    const d = data[pick.cat]; if (!d) return "";
    const mt = d.metrics.find(m => m.key === pick.metric); if (!mt) return "";
    const lower = mt.direction === "lower_better";
    let rows = d.models.filter(m => {
      const s = m.specs[pick.metric];
      return s && s.value != null && (pick.filter ? pick.filter(m) : true);
    });
    rows.sort((a, b) => { const va = a.specs[pick.metric].value, vb = b.specs[pick.metric].value; return lower ? va - vb : vb - va; });
    rows = rows.slice(0, 4);
    if (!rows.length) return "";
    const more = `category.html?cat=${pick.cat}&sort=spec:${pick.metric}&sa=${lower ? 1 : 0}`;
    const cards = rows.map(m => {
      const s = m.specs[pick.metric];
      const starHtml = s.stars != null ? " " + stars(s.stars) : "";   // 별점 없으면 외톨이 '—' 대신 생략
      const opsBadge = (OPS && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
      return `<a class="rcard" href="category.html?cat=${pick.cat}&brands=${encodeURIComponent(m.brand)}&q=${encodeURIComponent(m.model)}">
        <div class="ricon" style="background:${catTint(d.name)}">${catIcon(d.name)}</div>
        <div class="rb">${esc(m.brand)}${m.capacity != null ? ` · ${m.capacity}인` : ""}</div>
        <div class="rm">${esc(m.model)}</div>
        <div class="rs"><b>${esc(mt.label)} ${fmtVal(s.value, mt.unit)}</b>${starHtml}${opsBadge}</div>
        <div class="rp">${won(m.price_min)}</div>
      </a>`;
    }).join("");
    return `<section class="rsec"><div class="rsec-h"><h2>${esc(pick.label)}</h2>
       <a class="rmore" href="${more}">${esc(d.name)} 전체 ›</a></div>
       <div class="rgrid">${cards}</div></section>`;
  }).join("");
  document.getElementById("recs").innerHTML = sections || `<p class="nd">추천할 데이터가 없습니다.</p>`;
  document.getElementById("foot").innerHTML = `측정 스펙 기반 추천 · 정직성 우선 · 추측 없음.`;
}
