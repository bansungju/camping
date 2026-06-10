/* 장비의 숲 — 정적 프론트엔드 (DB→data/*.json) */
/* PWA: 서비스워커 등록(오프라인+홈화면 설치). 실패해도 사이트는 정상 동작 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

// PWA 설치 유도 배너
let _pwaPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  _pwaPrompt = e;
  const banner = document.getElementById("pwa-banner");
  if (!banner || localStorage.getItem("pwa-dismissed")) return;
  banner.innerHTML = `<div class="pwa-banner-inner">
    <span class="pwa-banner-ico">🌲</span>
    <span class="pwa-banner-msg">장비의 숲을 홈 화면에 추가하면 더 빠르게 열려요</span>
    <button type="button" class="pwa-install-btn">설치</button>
    <button type="button" class="pwa-dismiss-btn" aria-label="닫기">✕</button>
  </div>`;
  banner.style.display = "block";
  banner.querySelector(".pwa-install-btn").onclick = async () => {
    _pwaPrompt.prompt();
    const { outcome } = await _pwaPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem("pwa-dismissed", "1");
    banner.style.display = "none";
  };
  banner.querySelector(".pwa-dismiss-btn").onclick = () => {
    localStorage.setItem("pwa-dismissed", "1");
    banner.style.display = "none";
  };
});
const GRADE_CLASS = { "🟢 A": "A", "🟡 B": "B", "🔴 한계": "L" };

/* 운영자 모드: ?ops=1 로 켜면(localStorage 영속) 신뢰등급·값배지·데이터한계가 보인다.
   기본(사용자)은 깔끔하게 별점·스펙만. ?ops=0 으로 끈다. */
(() => {
  const v = new URLSearchParams(location.search).get("ops");
  if (v === "1") localStorage.setItem("ops", "1");
  else if (v === "0") localStorage.removeItem("ops");
})();
const OPS = localStorage.getItem("ops") === "1";

/* 운영자 모드일 땐 눈에 띄는 배너+끄기 버튼(조용히 갇히는 것 방지) */
if (OPS) window.addEventListener("DOMContentLoaded", () => {
  const b = document.createElement("div");
  b.className = "opsbar";
  b.innerHTML = `🛠 운영자 모드 — 신뢰등급·정직성 배지가 표시됩니다 ` +
    `<button type="button" id="opsoff">사용자 화면으로 전환</button>`;
  document.body.prepend(b);
  document.getElementById("opsoff").onclick = () => {
    localStorage.removeItem("ops");
    const u = new URL(location.href); u.searchParams.delete("ops");
    location.replace(u.pathname + u.search + u.hash);
  };
});

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
  { key: "minimal", emoji: "📦", name: "미니멀리스트", tagline: "적게, 군더더기 없이",
    note: "텐트 대신 타프 · 가볍고 합리적인 '가성비'(별점÷가격) 순 — 백패커의 프리미엄 최경량과 차별",
    picks: [
      { cat: "tarp", metric: "weight_min", rankBy: "value", label: "타프 (텐트 대신)" },
      { cat: "sleeping-bag", metric: "weight_min", rankBy: "value", label: "침낭" },
      { cat: "mat", metric: "weight_min", rankBy: "value", label: "매트" },
      { cat: "cookware", metric: "weight_min", rankBy: "value", label: "코펠" },
    ] },
  { key: "auto", emoji: "🚙", name: "오토 / 맥시멀", tagline: "차로 싣고, 집처럼 편하게",
    note: "공간·용량·스펙이 큰 순 (무게 무관) · 스펙 상위일수록 가격이 높은 경향",
    picks: [
      // 외형기준(외피 footprint·이너 미상)은 실내공간 비교에 부적합 → 실내 측정값만 추천(정직)
      { cat: "auto-tent", metric: "floor_area", filter: m => m.specs.floor_area.badge !== "외형기준", label: "넓은 거실형 텐트" },
      { cat: "cooler", metric: "capacity_l", label: "대용량 아이스박스" },
      { cat: "burner", metric: "power_output", label: "고화력 버너" },
      { cat: "table", metric: "max_load", label: "튼튼한 테이블" },
      { cat: "chair", metric: "max_load", label: "튼튼한 의자" },
      // 파워스테이션(대형) 제외 — 일반 휴대 파워뱅크만(mAh 단일 이상치 독점 방지)
      { cat: "powerbank", metric: "capacity_mah", filter: m => m.specs.capacity_mah.value <= 100000, label: "대용량 파워뱅크" },
    ] },
  { key: "family", emoji: "👨‍👩‍👧‍👦", name: "4인 가족", tagline: "안전하게, 넉넉하게",
    note: "4인 이상 · 넓고(공간분리) 방수 좋은 순 · ‘신속설치’는 측정값이 없어 미반영 · 스펙 상위는 고가 경향",
    picks: [
      { cat: "auto-tent", metric: "floor_area", filter: m => m.capacity != null && m.capacity >= 4 && m.specs.floor_area.badge !== "외형기준", label: "4인+ 넓은 텐트" },
      { cat: "auto-tent", metric: "water_head", filter: m => m.capacity != null && m.capacity >= 4, label: "방수 좋은 텐트 (우천 안전)" },
      { cat: "cooler", metric: "capacity_l", label: "대용량 아이스박스" },
      { cat: "table", metric: "max_load", label: "넓고 튼튼한 테이블" },
      // 가족 3~4계절: 내한온도가 적정대(-5℃ 안팎)에 가까운 순. 극지 동계백·한여름백 둘 다 배제
      { cat: "sleeping-bag", metric: "comfort_temp", target: -5, label: "3계절용 침낭" },
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

/* 공통: 상품 썸네일 셀 — 이미지가 있으면 <img>, 없거나 로드 실패하면 '이미지 준비중' 카드.
   data-* 로 폴백에 쓸 톤/아이콘/클래스를 실어, 깨진 링크도 onerror로 우아하게 대체. */
function thumbCell(img, name, tint, icon, imgCls, noCls) {
  imgCls = imgCls || "pli-thumb"; noCls = noCls || "pli-noimg";
  if (!img) return `<div class="${noCls}" style="background:${tint}">${icon}<span>이미지 준비중</span></div>`;
  return `<img class="${imgCls}" src="${esc(img)}" alt="${esc(name)}" loading="lazy"` +
    ` data-tint="${tint}" data-icon="${icon}" data-fcls="${noCls}" onerror="thumbFallback(this)">`;
}
function thumbFallback(img) {
  const d = document.createElement("div");
  d.className = img.dataset.fcls || "pli-noimg";
  d.style.background = img.dataset.tint || "var(--card2)";
  d.innerHTML = (img.dataset.icon || "🏕️") + "<span>이미지 준비중</span>";
  img.replaceWith(d);
}

/* 찜(위시리스트) — localStorage 저장. 로그인 없이도 동작, '내 정보' 탭에서 모아봄.
   항목: {key, b(브랜드), m(모델), cap(인원), s(카테고리슬러그), p(최저가), img} */
function getWish() { try { return JSON.parse(localStorage.getItem("wish") || "[]"); } catch (e) { return []; } }
function setWish(a) { localStorage.setItem("wish", JSON.stringify(a)); }
function wishKey(b, m, cap) { return [b, m, cap == null ? "" : cap].join("|"); }
function inWish(key) { return getWish().some(x => x.key === key); }
function toggleWish(item) {   // 반환: 추가됐으면 true, 해제됐으면 false
  const a = getWish(), i = a.findIndex(x => x.key === item.key);
  if (i >= 0) a.splice(i, 1); else a.push(item);
  setWish(a);
  return i < 0;
}
// 모델·카테고리슬러그 → 위시/최근 항목(공용 형태)
function wishItem(m, slug) {
  return { key: wishKey(m.brand, m.model, m.capacity), b: m.brand, m: m.model,
           cap: m.capacity, s: slug, p: m.price_min, img: m.img };
}

/* ── 장비 세트 빌더 — localStorage 저장 (로그인 없이도 동작) ──
   세트 구조: {id, title, style, items:[{pcode,b,m,cap,s,p,img,weight_g,qty}], created_at} */
function getSets() { try { return JSON.parse(localStorage.getItem("gear_sets") || "[]"); } catch (e) { return []; } }
function saveSets(a) { localStorage.setItem("gear_sets", JSON.stringify(a)); }
function newSet(title) {
  const s = { id: Date.now().toString(36), title, style: "", items: [], created_at: new Date().toISOString() };
  const a = getSets(); a.unshift(s); saveSets(a); return s;
}
function addToSet(setId, item) {
  const a = getSets(), s = a.find(x => x.id === setId);
  if (!s) return;
  const i = s.items.findIndex(x => x.pcode === item.pcode);
  if (i >= 0) s.items[i].qty = (s.items[i].qty || 1) + 1;
  else s.items.push({ ...item, qty: 1 });
  saveSets(a);
}
function setItem(m, slug) {
  return { pcode: wishKey(m.brand, m.model, m.capacity), b: m.brand, m: m.model,
           cap: m.capacity, s: slug, p: m.price_min, img: m.img,
           weight_g: m.specs?.weight?.value ?? null };
}

function openSetModal(item) {
  let modal = document.getElementById("set-modal");
  if (!modal) {
    modal = document.createElement("div"); modal.id = "set-modal"; modal.className = "pmodal";
    document.body.appendChild(modal);
  }
  const sets = getSets();
  const setListHtml = sets.length
    ? sets.map(s => `<button class="sm-set-btn" data-sid="${s.id}">
        <span class="sm-set-name">${esc(s.title)}</span>
        <span class="sm-set-cnt">${s.items.length}개 장비</span></button>`).join("")
    : `<div class="sm-empty">저장된 세트가 없어요</div>`;
  modal.innerHTML = `<div class="pmbox sm-box" role="dialog" aria-modal="true">
    <button class="pmx" aria-label="닫기">✕</button>
    <div class="sm-head">
      <div class="sm-title">세트에 추가</div>
      <div class="sm-item">${esc(item.b)} ${esc(item.m)}</div>
    </div>
    <div class="sm-list">${setListHtml}</div>
    <div class="sm-new">
      <input class="sm-input" type="text" placeholder="새 세트 이름 입력" maxlength="40">
      <button class="sm-create">만들기</button>
    </div></div>`;
  modal.classList.add("on");
  const close = () => modal.classList.remove("on");
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  modal.querySelectorAll(".sm-set-btn").forEach(btn => btn.onclick = () => {
    addToSet(btn.dataset.sid, item);
    btn.textContent = "✓ 추가됨"; btn.disabled = true;
    setTimeout(close, 700);
  });
  const inp = modal.querySelector(".sm-input");
  modal.querySelector(".sm-create").onclick = () => {
    const t = inp.value.trim(); if (!t) { inp.focus(); return; }
    const s = newSet(t); addToSet(s.id, item);
    close();
  };
  inp.onkeydown = e => { if (e.key === "Enter") modal.querySelector(".sm-create").click(); };
  modal.querySelector(".pmx").focus();
}

/* 최근 본 상품 — 상세 모달 열 때 기록. 최신순, 중복 제거, 최대 12개. */
function getRecent() { try { return JSON.parse(localStorage.getItem("recent") || "[]"); } catch (e) { return []; } }
function pushRecent(item) {
  if (!item.s) return;   // 슬러그 없으면(되돌아갈 경로 불명) 기록 생략
  const a = getRecent().filter(x => x.key !== item.key);
  a.unshift(item);
  localStorage.setItem("recent", JSON.stringify(a.slice(0, 12)));
}

/* 공통: 하단(모바일)/상단(데스크탑) 탭바 자동 주입 — 모든 페이지에서 app.js만 로드하면 노출.
   로그인·커뮤니티는 계획 단계라 '준비중' 플레이스홀더로 연결. */
const TABS = [
  { href: "index.html", icon: "📊", label: "비교", match: ["index.html", "", "category.html", "brand.html", "recommend.html"] },
  { href: "community.html", icon: "💬", label: "커뮤니티", match: ["community.html"] },
  { href: "account.html", icon: "👤", label: "내 정보", match: ["account.html"] },
];
window.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".tabbar")) return;
  const here = (location.pathname.split("/").pop() || "").toLowerCase();
  const nav = document.createElement("nav");
  nav.className = "tabbar";
  nav.innerHTML = `<div class="wrap tabbar-in">` + TABS.map(t => {
    const on = t.match.includes(here);
    return `<a class="tab${on ? " on" : ""}" href="${t.href}"${on ? ' aria-current="page"' : ""}>` +
      `<span class="ti">${t.icon}</span><span class="tl">${t.label}</span></a>`;
  }).join("") + `</div>`;
  const header = document.querySelector("header.top");
  if (header) header.insertAdjacentElement("afterend", nav);
  else document.body.prepend(nav);
});

/* 공통: 카테고리 네비게이션 바 (어느 카테고리든 직접 이동) */
async function renderCatNav(activeSlug) {
  const el = document.getElementById("catnav");
  if (!el) return;
  try {
    const m = await getJSON("data/manifest.json");
    el.innerHTML = m.categories.map(c =>
      `<a class="navchip${c.slug === activeSlug ? " on" : ""}" href="category/${c.slug}"
         title="${c.name}"><span class="ni">${catIcon(c.name)}</span>${c.name}${OPS ? `<i>${GRADE_CLASS[c.grade] || ""}</i>` : ""}</a>`).join("");
  } catch (e) { /* noop */ }
}

/* ---------- 허브 ---------- */
async function renderHub() {
  let m;
  try { m = await getJSON("data/manifest.json"); }
  catch (e) { document.getElementById("lead").textContent = "데이터를 불러오지 못했습니다. (로컬서버 필요)"; return; }
  // 헤드라인 카운트를 앱 전체와 동일하게 dedup 모델 기준으로 통일(변형 포함 raw와 불일치 해소)
  const totalModels = m.categories.reduce((s, c) => s + (c.count || 0), 0);
  document.getElementById("lead").innerHTML =
    `<b>${totalModels.toLocaleString()}개</b> 모델 · ${m.categories.length}개 카테고리를 정량 스펙으로 별점 비교`;

  document.getElementById("legend").innerHTML = OPS ? GRADE_LEGEND : "";

  // 첫 진입 1회성 안내 — 별점이 '추측'이 아니라 '측정값 순위'임을 각인(정직성 정체성 강화)
  if (!localStorage.getItem("seenIntro")) {
    const h1 = document.querySelector("main h1");
    if (h1) {
      const ib = document.createElement("div");
      ib.className = "introbar";
      ib.innerHTML = `<span class="ii">⭐</span>
        <span class="it"><b>별점은 같은 그룹 안에서의 순위를 환산한 값</b>이에요. 측정값만 쓰고, 추측은 없습니다.</span>
        <button type="button" class="ix" aria-label="안내 닫기">✕</button>`;
      h1.insertAdjacentElement("beforebegin", ib);
      ib.querySelector(".ix").onclick = () => { localStorage.setItem("seenIntro", "1"); ib.remove(); };
    }
  }

  renderRecent();   // 최근 본 상품(있으면)
  renderHotSection(m.categories);   // 이번 주 인기

  // 캠핑 스타일 추천 진입
  const pel = document.getElementById("personas");
  if (pel) pel.innerHTML = PERSONAS.map(p =>
    `<a class="pcard" href="recommend.html?p=${p.key}">
       <span class="pe">${p.emoji}</span>
       <span class="pn">${p.name}</span>
       <span class="pt">${p.tagline}</span></a>`).join("");

  const grid = document.getElementById("grid");
  grid.innerHTML = m.categories.map(c => `
    <a class="card" href="category/${c.slug}">
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
    box.innerHTML = (brandHtml || "") + (hits.length ? hits.map((x, i) => {
      const wk = wishKey(x.b, x.m, x.cap || null);
      const wished = inWish(wk);
      return `<div class="sres-wrap">
        <a class="sres" href="category/${x.s}?brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">
          ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "sres-thumb", "sres-noimg")}
          <span class="stxt"><span class="sb">${esc(x.b)}</span> ${esc(x.m)}${x.cap ? ` <i>${x.cap}인</i>` : ""}</span>
          <span class="scat">${esc(x.c)}</span></a>
        <button type="button" class="sres-wish${wished ? " on" : ""}" data-hi="${i}" aria-label="찜" aria-pressed="${wished}">${wished ? "♥" : "♡"}</button>
      </div>`;
    }).join("")
      : (brandHtml ? "" : `<div class="sres nd">"${esc(inp.value)}" 검색 결과 없음</div>`));
    // 찜 버튼 이벤트
    box.querySelectorAll(".sres-wish").forEach(btn => {
      btn.onclick = e => {
        e.preventDefault(); e.stopPropagation();
        const x = hits[+btn.dataset.hi];
        const item = { key: wishKey(x.b, x.m, x.cap || null), b: x.b, m: x.m, cap: x.cap || null, s: x.s, p: x.p, img: x.img };
        const added = toggleWish(item);
        btn.classList.toggle("on", added);
        btn.textContent = added ? "♥" : "♡";
        btn.setAttribute("aria-pressed", added);
      };
    });
  };
  inp.oninput = run;
  inp.onfocus = run;
}

/* ---------- 캠핑 스타일 칩 상수 ---------- */
const STYLE_META = [
  { key:"backpacking", label:"백패킹",  icon:"🏕" },
  { key:"car-camping", label:"오토캠핑",icon:"🚗" },
  { key:"glamping",    label:"글램핑",  icon:"✨" },
  { key:"winter",      label:"겨울",    icon:"❄" },
  { key:"beach",       label:"해변",    icon:"🏖" },
  { key:"family",      label:"가족",    icon:"👨‍👩‍👧" },
];
// 스타일별 "이 스펙이 중요해요" 설명 (재정렬보다 설명 레이어가 먼저)
const STYLE_TIPS = {
  backpacking: { label:"백패킹", keys:["weight_min"], tip:"가벼울수록 좋아요 — 무게를 최우선으로 확인하세요." },
  "car-camping":{ label:"오토캠핑", keys:["floor_area","max_load"], tip:"공간이 넓을수록 쾌적해요 — 면적·적재하중을 확인하세요." },
  glamping:    { label:"글램핑", keys:["floor_area","brightness"], tip:"넓고 밝은 환경이 핵심 — 면적·조도를 확인하세요." },
  winter:      { label:"겨울", keys:["comfort_temp","water_head","r_value"], tip:"보온·방수·단열이 생명 — 온도·내수압·R값을 확인하세요." },
  beach:       { label:"해변", keys:["water_head","floor_area"], tip:"방수와 통풍이 중요 — 내수압·면적을 확인하세요." },
  family:      { label:"가족", keys:["floor_area","max_load","capacity_l"], tip:"용량과 공간이 핵심 — 면적·하중·용량을 확인하세요." },
};

/* ---------- 카테고리 비교표 + 필터 ---------- */
let STATE = {};

/* 필터 상태 → URL (공유·뒤로가기·새로고침에 필터 보존). 69R 사용성감사 [상]1 */
function defaultSortKey() {
  const s0 = STATE.data.metrics.filter(m => m.is_star)[0];
  return "spec:" + (s0 && s0.key);
}
function serializeState() {
  const p = new URLSearchParams();
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
  if (STATE.campStyle) p.set("style", STATE.campStyle);
  // 클린 URL 유지: /category/{slug}?필터  (cat= 쿼리 제거)
  const pathMatch = location.pathname.match(/^\/category\/[a-z0-9-]+/);
  const qs = p.toString();
  if (pathMatch) {
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  } else {
    const full = qs ? `?cat=${STATE.slug}&${qs}` : `?cat=${STATE.slug}`;
    history.replaceState(null, "", full);
  }
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
  const sty = params.get("style");
  if (sty && STYLE_META.some(s => s.key === sty)) STATE.campStyle = sty;
}

// 스타일 선택 시 해당 스타일의 핵심 스펙으로 sortKey 자동 전환
const STYLE_SORT = {
  backpacking:  { key:"weight_min",    asc: true  },  // 가벼울수록
  "car-camping":{ key:"floor_area",    asc: false },  // 넓을수록
  glamping:     { key:"floor_area",    asc: false },
  winter:       { key:"comfort_temp",  asc: true  },  // 낮을수록(더 따뜻)
  beach:        { key:"water_head",    asc: false },  // 방수 높을수록
  family:       { key:"floor_area",    asc: false },
};
function applyStyleSort(d) {
  if (!STATE.campStyle) {
    // 스타일 해제 → 기본 정렬로 복귀
    const star = d.metrics.filter(m => m.is_star);
    STATE.sortKey = "spec:" + (star[0] && star[0].key);
    STATE.sortAsc = defaultAsc(STATE.sortKey);
    return;
  }
  const ss = STYLE_SORT[STATE.campStyle];
  if (!ss) return;
  // 해당 spec_key가 이 카테고리에 존재하는지 확인
  const specExists = d.models.some(m => m.specs[ss.key] && m.specs[ss.key].value != null);
  if (specExists) {
    STATE.sortKey = "spec:" + ss.key;
    STATE.sortAsc = ss.asc;
  }
}

function renderStyleChips(d) {
  const el = document.getElementById("stylechips");
  if (!el) return;
  // 이 카테고리 데이터에 어떤 spec_key가 실제 있는지 확인
  const availKeys = new Set(d.models.flatMap(m => Object.keys(m.specs || {})));
  // 각 스타일이 이 카테고리와 관련 있으면 표시 (tip의 keys 중 1개라도 있으면)
  const relevant = STYLE_META.filter(s => {
    const tip = STYLE_TIPS[s.key];
    return !tip || tip.keys.some(k => availKeys.has(k));
  });
  if (!relevant.length) { el.style.display = "none"; return; }
  el.innerHTML = `<div class="sc-row">` +
    relevant.map(s =>
      `<button class="sc-chip${STATE.campStyle === s.key ? " on" : ""}" data-style="${s.key}">${s.icon} ${s.label}</button>`
    ).join("") +
    `</div><div class="sc-tip" id="sc-tip-text">${STATE.campStyle ? (STYLE_TIPS[STATE.campStyle]?.tip || "") : ""}</div>`;
  el.style.display = "block";
  el.querySelectorAll(".sc-chip").forEach(btn => btn.onclick = () => {
    const sk = btn.dataset.style;
    STATE.campStyle = STATE.campStyle === sk ? "" : sk;
    el.querySelectorAll(".sc-chip").forEach(b => b.classList.toggle("on", b.dataset.style === STATE.campStyle));
    const tipEl = document.getElementById("sc-tip-text");
    if (tipEl) tipEl.textContent = STATE.campStyle ? (STYLE_TIPS[STATE.campStyle]?.tip || "") : "";
    applyStyleSort(d);
    updateLeadText(d);
    serializeState();
    draw();
  });
}

function updateLeadText(d) {
  const leadEl = document.getElementById("lead");
  if (!leadEl) return;
  if (STATE.campStyle) {
    const sm = STYLE_META.find(s => s.key === STATE.campStyle);
    leadEl.innerHTML = `${d.count.toLocaleString()}개 모델 · <span style="color:var(--accent);font-weight:700">${sm.icon} ${sm.label} 기준</span> — 관련 스펙 슬라이더를 활용해보세요`;
  } else {
    leadEl.innerHTML = `${d.count.toLocaleString()}개 모델 · 같은 그룹 안 순위로 환산한 별점`;
  }
}

function renderCategorySkeleton() {
  const listEl = document.getElementById("list");
  if (!listEl) return;
  listEl.innerHTML = Array.from({ length: 6 }).map(() =>
    `<div class="pli pli-skel" aria-hidden="true">
      <div class="skel-thumb"></div>
      <div class="pli-info">
        <div class="skel-line" style="width:40%;height:11px;margin-bottom:6px"></div>
        <div class="skel-line" style="width:70%;height:14px;margin-bottom:8px"></div>
        <div class="skel-line" style="width:55%;height:11px"></div>
      </div>
      <div class="pli-side" style="gap:6px">
        <div class="skel-line" style="width:52px;height:14px"></div>
        <div class="skel-line" style="width:28px;height:11px"></div>
      </div>
    </div>`
  ).join("");
}

async function renderCategory() {
  renderCategorySkeleton();
  const params = new URLSearchParams(location.search);
  // 클린 URL /category/{slug} 또는 ?cat= 파라미터 두 방식 모두 지원
  const pathMatch = location.pathname.match(/^\/category\/([a-z0-9-]+)/);
  const slug = params.get("cat") || (pathMatch && pathMatch[1]);
  let d;
  try { d = await getJSON(`data/${slug}.json`); }
  catch (e) { document.getElementById("title").textContent = "카테고리를 찾을 수 없습니다."; return; }
  const rawQ = params.get("q") || "";   // 홈검색 링크의 q(대문자 포함 가능)
  STATE = { data: d, slug: slug, q: rawQ.toLowerCase(), cap: "", brands: new Set(), range: {}, qExclude: false,
            sortKey: null, sortAsc: false, campStyle: "",
            dir: Object.fromEntries(d.metrics.map(m => [m.key, m.direction])),
            unit: Object.fromEntries(d.metrics.map(m => [m.key, m.unit])) };
  renderCatNav(slug);

  document.getElementById("crumbName").textContent = d.name;
  const shareUrl = `https://gear-forest.com/category/${slug}`;
  const shareTitle = `${d.name} 비교 — 장비의 숲`;
  const shareDesc = `${d.count.toLocaleString()}개 모델을 정량 스펙으로 별점 비교. 실측값만 사용합니다.`;
  document.title = shareTitle;
  // OG / Twitter 메타 동적 업데이트 (SNS 공유 미리보기)
  [["og:title", shareTitle], ["og:description", shareDesc], ["og:url", shareUrl],
   ["twitter:title", shareTitle], ["twitter:description", shareDesc]].forEach(([prop, content]) => {
    const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
    if (el) el.setAttribute("content", content);
  });
  const canonEl = document.querySelector("link[rel=canonical]");
  if (canonEl) canonEl.setAttribute("href", shareUrl);
  document.getElementById("title").innerHTML =
    `<span class="titleicon" style="background:${catTint(d.name)}">${catIcon(d.name)}</span>${d.name} ${gradeBadge(d.grade)}`
    + `<button class="share-btn" id="share-btn" aria-label="공유">🔗</button>`;
  document.getElementById("share-btn").onclick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareUrl }); return; } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById("share-btn");
      btn.textContent = "✓"; btn.style.color = "var(--accent)";
      setTimeout(() => { btn.textContent = "🔗"; btn.style.color = ""; }, 2000);
    } catch (_) {}
  };
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
  renderStyleChips(d);
  STATE.hasCap = d.models.some(m => m.capacity != null);
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

  // 가격 범위 — 듀얼 슬라이더
  const prices = num(ms.map(m => m.price_min));
  if (prices.length) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    const step = Math.max(1000, Math.round((hi - lo) / 100 / 1000) * 1000);
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">가격</span>
      <div class="dslider" data-rng="price" data-lo="${lo}" data-hi="${hi}" data-step="${step}" data-unit="price">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${lo}" data-b="min">
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${hi}" data-b="max">
        <div class="dslider-labels">
          <span class="dsl-val" data-b="min">${lo.toLocaleString()}원</span>
          <span class="dsl-val" data-b="max">${hi.toLocaleString()}원</span>
        </div>
      </div></div>`);
  }

  // 스펙 범위 (각 ★지표) — 무게는 kg 단위 슬라이더
  star.forEach(m => {
    const vals = num(ms.map(x => x.specs[m.key] && x.specs[m.key].value));
    if (vals.length < 2) return;
    const isWeight = (m.unit || "") === "g";
    const rawLo = Math.min(...vals), rawHi = Math.max(...vals);
    const slo = isWeight ? rawLo / 1000 : rawLo;
    const shi = isWeight ? rawHi / 1000 : rawHi;
    const displayUnit = isWeight ? "kg" : (m.unit || "");
    const step = isWeight ? 0.1 : Math.max(0.1, +((shi - slo) / 100).toFixed(2));
    const fmtVal = v => isWeight ? (+v).toFixed(1) + "kg" : (+v).toFixed(1) + displayUnit;
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">${m.label}</span>
      <div class="dslider" data-rng="${m.key}" data-lo="${slo}" data-hi="${shi}" data-step="${step}"
           data-unit="${displayUnit}" data-isweight="${isWeight ? 1 : 0}">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${slo}" max="${shi}" step="${step}" value="${slo}" data-b="min">
        <input class="dsl-input" type="range" min="${slo}" max="${shi}" step="${step}" value="${shi}" data-b="max">
        <div class="dslider-labels">
          <span class="dsl-val" data-b="min">${fmtVal(slo)}</span>
          <span class="dsl-val" data-b="max">${fmtVal(shi)}</span>
        </div>
      </div></div>`);
  });

  // 카테고리별 핵심 스펙 추가 슬라이더
  const EXTRA_SPECS = {
    "backpacking-tent": [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
    "auto-tent":        [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
    "other-tent":       [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
    "tarp":             [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
    "sleeping-bag":     [{key:"comfort_temp",label:"쾌적온도",unit:"°C"},{key:"fill_weight",label:"다운충전량",unit:"g"}],
    "mat":              [{key:"r_value",label:"R값",unit:""},{key:"thickness",label:"두께",unit:"mm"}],
    "lantern":          [{key:"brightness",label:"밝기",unit:"lm"},{key:"runtime",label:"사용시간",unit:"h"}],
    "burner":           [{key:"power_output",label:"출력",unit:"W"}],
    "powerbank":        [{key:"capacity_mah",label:"용량",unit:"mAh"},{key:"power_output",label:"출력",unit:"W"}],
    "cooler":           [{key:"capacity_l",label:"용량",unit:"L"}],
    "cookware":         [{key:"capacity_l",label:"용량",unit:"L"}],
    "chair":            [{key:"max_load",label:"최대하중",unit:"kg"}],
    "table":            [{key:"max_load",label:"최대하중",unit:"kg"}],
    "cot":              [{key:"max_load",label:"최대하중",unit:"kg"}],
    "wagon":            [{key:"max_load",label:"최대하중",unit:"kg"}],
  };
  const starKeys = new Set(star.map(m => m.key));
  const extraMeta = (EXTRA_SPECS[d.slug] || []).filter(em => !starKeys.has(em.key));
  extraMeta.forEach(em => {
    const vals = num(ms.map(x => x.specs[em.key] && x.specs[em.key].value));
    if (vals.length < 2) return;
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const step = +((hi - lo) / 100).toFixed(2) || 0.1;
    const fmt = v => (+v).toFixed(step < 1 ? 1 : 0) + (em.unit ? " " + em.unit : "");
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">${em.label}</span>
      <div class="dslider" data-rng="${em.key}" data-lo="${lo}" data-hi="${hi}" data-step="${step}" data-unit="${em.unit}">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${lo}" data-b="min">
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${hi}" data-b="max">
        <div class="dslider-labels">
          <span class="dsl-val" data-b="min">${fmt(lo)}</span>
          <span class="dsl-val" data-b="max">${fmt(hi)}</span>
        </div>
      </div></div>`);
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

  // 필터 프리셋 칩 (경량/저가/가족형)
  const weightMeta = star.find(m => (m.unit || "") === "g");
  const weightVals = weightMeta ? num(ms.map(x => x.specs[weightMeta.key] && x.specs[weightMeta.key].value)) : [];
  const priceVals = num(ms.map(m => m.price_min));
  const hasCap4 = ms.some(m => m.capacity != null && m.capacity >= 4);
  const presets = [];
  if (weightVals.length >= 3) {
    const sorted = [...weightVals].sort((a, b) => a - b);
    const p33 = sorted[Math.floor(sorted.length * 0.33)];
    presets.push({ label: "🪶 경량 우선", fn: () => {
      const kg = +(p33 / 1000).toFixed(1);
      STATE.range[weightMeta.key] = { max: kg };
      syncFilterUI(); draw();
    }});
  }
  if (priceVals.length >= 3) {
    const sorted = [...priceVals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length * 0.5)];
    presets.push({ label: "💰 저가 우선", fn: () => {
      STATE.range.price = { max: median };
      syncFilterUI(); draw();
    }});
  }
  if (hasCap4) presets.push({ label: "👨‍👩‍👧 가족형", fn: () => { STATE.cap = "4"; syncFilterUI(); draw(); } });

  if (presets.length) {
    parts.unshift(`<div class="fgrp fgrp-preset"><span class="flab">빠른 설정</span>` +
      presets.map((p, i) => `<button type="button" class="ftag fpre" data-pi="${i}">${esc(p.label)}</button>`).join("") +
      `</div>`);
  }

  bar.innerHTML = parts.join("");

  // 프리셋 클릭 핸들러
  if (presets.length) {
    bar.querySelectorAll(".fpre").forEach(b => b.onclick = () => {
      presets[+b.dataset.pi].fn();
      bar.querySelectorAll(".fpre").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
    });
  }

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
  // 듀얼 슬라이더 이벤트
  bar.querySelectorAll(".dslider").forEach(sl => {
    const key = sl.dataset.rng;
    const isWeight = sl.dataset.isweight === "1";
    const isPrice = sl.dataset.unit === "price";
    const totalLo = parseFloat(sl.dataset.lo), totalHi = parseFloat(sl.dataset.hi);
    const minInp = sl.querySelector('[data-b="min"]'), maxInp = sl.querySelector('[data-b="max"]');
    const minLbl = sl.querySelector('.dsl-val[data-b="min"]'), maxLbl = sl.querySelector('.dsl-val[data-b="max"]');
    const fill = sl.querySelector(".dslider-fill");
    const fmtLabel = v => {
      if (isPrice) return (+v).toLocaleString() + "원";
      if (isWeight) return (+v).toFixed(1) + "kg";
      return (+v).toFixed(1) + (sl.dataset.unit || "");
    };
    const updateFill = () => {
      const lo = parseFloat(minInp.value), hi = parseFloat(maxInp.value);
      const pct = v => ((v - totalLo) / (totalHi - totalLo)) * 100;
      fill.style.left = pct(lo) + "%";
      fill.style.width = (pct(hi) - pct(lo)) + "%";
    };
    const toStateVal = v => isWeight ? parseFloat(v) * 1000 : parseFloat(v);
    const applyToState = () => {
      const lo = parseFloat(minInp.value), hi = parseFloat(maxInp.value);
      if (lo <= totalLo && hi >= totalHi) { delete STATE.range[key]; }
      else {
        STATE.range[key] = {};
        if (lo > totalLo) STATE.range[key].min = toStateVal(lo);
        if (hi < totalHi) STATE.range[key].max = toStateVal(hi);
      }
      draw();
    };
    minInp.oninput = () => {
      if (parseFloat(minInp.value) > parseFloat(maxInp.value)) minInp.value = maxInp.value;
      minLbl.textContent = fmtLabel(minInp.value);
      updateFill(); applyToState();
    };
    maxInp.oninput = () => {
      if (parseFloat(maxInp.value) < parseFloat(minInp.value)) maxInp.value = minInp.value;
      maxLbl.textContent = fmtLabel(maxInp.value);
      updateFill(); applyToState();
    };
    updateFill();
  });
  // 정렬 적용(셀렉트·빠른칩 공용) — 셀렉트 값도 동기화
  const ssel = bar.querySelector("[data-sort]");
  const applySort = v => {
    if (!v) { STATE.sortKey = "spec:" + (star[0] && star[0].key); STATE.sortAsc = defaultAsc(STATE.sortKey); }
    else if (v === "value") { STATE.sortKey = "value"; STATE.sortAsc = false; }
    else { STATE.sortKey = v; STATE.sortAsc = defaultAsc(v); }
    if (ssel) ssel.value = (STATE.sortKey === defaultSortKey()) ? "" : STATE.sortKey;
    draw();
  };
  if (ssel) ssel.onchange = e => applySort(e.target.value);
  // 빠른 정렬 칩(항상 노출 — 모바일에서 필터바가 접혀도 한 번에 정렬). 발견율 개선
  const sc = document.getElementById("sortchips");
  if (sc) {
    const CHIPS = [["", "기본"], ["price_min", "가격 낮은순"], ["value", "가성비순"]];
    sc.innerHTML = `<span class="flab">정렬</span>` + CHIPS.map(([v, lab]) =>
      `<button type="button" class="schip" data-sortval="${v}">${esc(lab)}</button>`).join("");
    sc.querySelectorAll(".schip").forEach(b => b.onclick = () => applySort(b.dataset.sortval));
  }
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
  if (cl) cl.onclick = clearAllFilters;
}

// 모든 필터 초기화(활성칩 '전체 해제' + 빈 상태 버튼 공용)
function clearAllFilters() {
  STATE.cap = ""; STATE.brands.clear(); STATE.range = {}; STATE.qExclude = false; STATE.q = "";
  const q = document.getElementById("q"); if (q) q.value = "";
  syncFilterUI(); draw();
}

// 칩/입력 UI를 STATE에 동기화(활성칩에서 해제 시 컨트롤도 반영)
function syncFilterUI() {
  const bar = document.getElementById("filters");
  bar.querySelectorAll("[data-cap]").forEach(b => b.classList.toggle("on", b.dataset.cap === STATE.cap));
  bar.querySelectorAll("[data-brand]").forEach(b => b.classList.toggle("on", STATE.brands.has(b.dataset.brand)));
  bar.querySelectorAll(".dslider").forEach(sl => {
    const key = sl.dataset.rng;
    const isWeight = sl.dataset.isweight === "1";
    const isPrice = sl.dataset.unit === "price";
    const totalLo = parseFloat(sl.dataset.lo), totalHi = parseFloat(sl.dataset.hi);
    const r = STATE.range[key];
    const minInp = sl.querySelector('[data-b="min"]'), maxInp = sl.querySelector('[data-b="max"]');
    const minLbl = sl.querySelector('.dsl-val[data-b="min"]'), maxLbl = sl.querySelector('.dsl-val[data-b="max"]');
    const fill = sl.querySelector(".dslider-fill");
    const toDisplay = v => isWeight ? v / 1000 : v;
    const fmtLabel = v => {
      if (isPrice) return (+v).toLocaleString() + "원";
      if (isWeight) return (+v).toFixed(1) + "kg";
      return (+v).toFixed(1) + (sl.dataset.unit || "");
    };
    const loVal = (r && r.min != null) ? toDisplay(r.min) : totalLo;
    const hiVal = (r && r.max != null) ? toDisplay(r.max) : totalHi;
    minInp.value = loVal; maxInp.value = hiVal;
    if (minLbl) minLbl.textContent = fmtLabel(loVal);
    if (maxLbl) maxLbl.textContent = fmtLabel(hiVal);
    const pct = v => ((v - totalLo) / (totalHi - totalLo)) * 100;
    if (fill) { fill.style.left = pct(loVal) + "%"; fill.style.width = (pct(hiVal) - pct(loVal)) + "%"; }
  });
  const qx = bar.querySelector("[data-qx]"); if (qx) qx.checked = STATE.qExclude;
  // 정렬 셀렉트도 복원상태 반영(URL→컨트롤). 기본 주력지표 정렬이면 '기본' 표시
  const ssel = bar.querySelector("[data-sort]");
  if (ssel) ssel.value = (STATE.sortKey === defaultSortKey()) ? "" : (STATE.sortKey || "");
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

/* 상품 클릭 → 이미지·스펙 상세 모달 */
function openProduct(m) {
  if (!m) return;
  pushRecent(wishItem(m, STATE.slug));   // 최근 본 상품 기록
  const d = STATE.data, star = d.metrics.filter(x => x.is_star);
  let modal = document.getElementById("pmodal");
  if (!modal) { modal = document.createElement("div"); modal.id = "pmodal"; modal.className = "pmodal"; document.body.appendChild(modal); }
  const imgHtml = thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "pmimg", "pmicon");
  const specRows = star.map(mt => {
    const s = m.specs[mt.key];
    const has = s && s.value != null;
    const val = has ? fmtVal(s.value, mt.unit) : (OPS ? '<span class="b 데이터부족">데이터부족</span>' : "—");
    const st = (has && s.stars != null) ? " " + stars(s.stars) : "";
    const badge = (OPS && has && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
    return `<div class="pmspec"><span class="pml">${esc(mt.label)}${mt.unit ? `(${mt.unit})` : ""}</span>` +
      `<span class="pmv">${val}${st}${badge}</span></div>`;
  }).join("");
  const wished = inWish(wishKey(m.brand, m.model, m.capacity));
  modal.innerHTML = `<div class="pmbox" role="dialog" aria-modal="true">
     <button class="pmx" aria-label="닫기">✕</button>
     <button class="pmwish${wished ? " on" : ""}" aria-label="찜" aria-pressed="${wished}">${wished ? "♥" : "♡"}</button>
     ${imgHtml}
     <div class="pmbody">
       <div class="pmbrand">${esc(m.brand)}${m.capacity != null ? ` · ${m.capacity}인` : ""}${m.variants > 1 ? ` · +${m.variants - 1}색` : ""}</div>
       <div class="pmname">${esc(m.model)}</div>
       <div class="pmprice">${priceRange(m.price_min, m.price_max)}</div>
       <div class="pmspecs">${specRows}</div>
       ${m.coupang_url
         ? `<button class="pmbuy pmbuy-active" type="button" data-url="${esc(m.coupang_url)}">🛒 쿠팡에서 구매하기</button>`
         : `<button class="pmbuy" type="button" disabled aria-disabled="true">구매하기</button>
       <div class="pmbuynote">구매 링크를 준비 중입니다.</div>`
       }
       <a class="pmlink" href="brand.html?b=${encodeURIComponent(m.brand)}">${esc(m.brand)} 다른 제품 보기 ›</a>
     </div></div>`;
  modal.classList.add("on");
  const buyBtn = modal.querySelector(".pmbuy-active");
  if (buyBtn) {
    buyBtn.onclick = async () => {
      const url = buyBtn.dataset.url;
      window.open(url, "_blank", "noopener");
      try {
        const { supabase } = await import("./supabaseClient.js");
        let sessionId = localStorage.getItem("_sid");
        if (!sessionId) { sessionId = Math.random().toString(36).slice(2); localStorage.setItem("_sid", sessionId); }
        await supabase.from("click_events").insert({
          slug: STATE.slug, brand: m.brand, model: m.model,
          coupang_url: url, session_id: sessionId
        });
      } catch (_) {}
    };
  }
  const wbtn = modal.querySelector(".pmwish");
  wbtn.onclick = () => {
    const added = toggleWish(wishItem(m, STATE.slug));
    wbtn.classList.toggle("on", added); wbtn.textContent = added ? "♥" : "♡";
    wbtn.setAttribute("aria-pressed", added);
  };
  const prevFocus = document.activeElement;   // 닫을 때 원래 위치로 포커스 복귀(접근성)
  const close = () => { modal.classList.remove("on"); if (prevFocus && prevFocus.focus) prevFocus.focus(); };
  modal.onclick = e => { if (e.target === modal) close(); };
  const xbtn = modal.querySelector(".pmx");
  xbtn.onclick = close;
  xbtn.focus();
  const onKey = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); } };
  document.addEventListener("keydown", onKey);
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

  // 빠른 정렬 칩 활성표시(칩·셀렉트·URL복원 어느 경로로 바뀌든 일치)
  document.querySelectorAll("#sortchips .schip").forEach(b => {
    const v = b.dataset.sortval;
    b.classList.toggle("on", (v === "" && k === defaultSortKey()) || v === k);
  });

  const tint = catTint(d.name), icon = catIcon(d.name);
  const cards = rows.map((m, i) => {
    const top = `${esc(m.brand)}${STATE.hasCap && m.capacity != null ? ` · ${m.capacity}인` : ""}` +
      (m.variants > 1 ? ` · +${m.variants - 1}색` : "");
    const specs = star.map(mt => {
      const s = m.specs[mt.key];
      const on = k === "spec:" + mt.key;   // 현재 정렬 중인 지표는 강조
      if (!s || s.value == null)
        return `<span class="pli-spec${on ? " on" : ""}"><i>${esc(mt.label)}</i> <span class="nd">—</span></span>`;
      const badge = OPS && s.badge ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
      return `<span class="pli-spec${on ? " on" : ""}"><i>${esc(mt.label)}</i> ${fmtVal(s.value, mt.unit)}` +
        `${s.stars != null ? " " + stars(s.stars) : ""}${badge}</span>`;
    }).join("");
    const wished = inWish(wishKey(m.brand, m.model, m.capacity));
    return `<div class="pli" role="button" tabindex="0" data-mi="${i}">
      <button type="button" class="pli-wish${wished ? " on" : ""}" data-mi="${i}"
        aria-label="찜" aria-pressed="${wished}">${wished ? "♥" : "♡"}</button>
      <button type="button" class="pli-setadd" data-mi="${i}" aria-label="세트에 추가">⊕</button>
      ${thumbCell(m.img, m.model, tint, icon)}
      <div class="pli-info">
        <div class="pli-top">${top}</div>
        <div class="pli-name">${esc(m.model)}</div>
        <div class="pli-specs">${specs}</div>
      </div>
      <div class="pli-side">
        <div class="pli-price">${priceRange(m.price_min, m.price_max)}</div>
        <span class="pli-chev" aria-hidden="true">›</span>
      </div></div>`;
  }).join("");
  const hasFilter = STATE.cap || STATE.brands.size || Object.keys(STATE.range).length || STATE.qExclude || STATE.q;
  document.getElementById("list").innerHTML = cards ||
    `<div class="pli-empty"><div class="pe-ico">🔍</div>
       <div class="pe-msg">조건에 맞는 결과가 없어요 ${diagnoseEmpty(k)}</div>
       ${hasFilter ? `<button type="button" class="achip clear" id="emptyclear">필터 전체 해제</button>` : ""}</div>`;
  document.querySelectorAll("#list .pli").forEach(el => {
    el.onclick = () => openProduct(rows[+el.dataset.mi]);
    el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProduct(rows[+el.dataset.mi]); } };
  });
  // 찜 토글(카드 클릭=모달과 분리 → stopPropagation)
  document.querySelectorAll("#list .pli-wish").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    const added = toggleWish(wishItem(rows[+btn.dataset.mi], STATE.slug));
    btn.classList.toggle("on", added); btn.textContent = added ? "♥" : "♡";
    btn.setAttribute("aria-pressed", added);
  });
  // 세트에 추가 버튼
  document.querySelectorAll("#list .pli-setadd").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    openSetModal(setItem(rows[+btn.dataset.mi], STATE.slug));
  });
  const ec = document.getElementById("emptyclear"); if (ec) ec.onclick = clearAllFilters;
  document.getElementById("count").textContent = `${rows.length} / ${d.models.length}개`;
  serializeState();   // 필터상태를 URL에 반영(공유·뒤로가기·새로고침 보존)

  // JSON-LD Product schema (현재 표시 중인 상위 20개)
  let ldEl = document.getElementById("jsonld-products");
  if (!ldEl) { ldEl = document.createElement("script"); ldEl.type = "application/ld+json"; ldEl.id = "jsonld-products"; document.head.appendChild(ldEl); }
  const catUrl = `https://gear-forest.com/category/${STATE.slug}`;
  ldEl.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
    "name": d.name, "url": catUrl,
    "numberOfItems": rows.length,
    "itemListElement": rows.slice(0, 20).map((m, i) => ({
      "@type": "ListItem", "position": i + 1,
      "item": {
        "@type": "Product",
        "name": `${m.brand} ${m.model}`,
        "brand": { "@type": "Brand", "name": m.brand },
        "url": catUrl,
        ...(m.price_min != null ? { "offers": { "@type": "Offer", "priceCurrency": "KRW", "price": m.price_min, "availability": "https://schema.org/InStock" } } : {})
      }
    }))
  });

  document.getElementById("foot").innerHTML = OPS
    ? `카드를 누르면 이미지·전체 스펙 · 정렬은 위 ‘정렬’ 메뉴 · 별점=세그먼트 내 순위백분위(중앙값 ★3) · 가격=국내가 우선 · 측정값만.`
    : `카드를 누르면 상세 스펙 · 위 ‘정렬’로 순서 변경 · 별점은 같은 그룹 내 순위 기준.`;
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
    document.title = `${bn} 전체보기 — 장비의 숲`;
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
    document.getElementById("sections").innerHTML = cats.map(c => {
      const tint = catTint(c.name), icon = catIcon(c.name);
      const items = c.items.sort((a, b) => (a.p == null) - (b.p == null) || (a.p || 0) - (b.p || 0)).map(x =>
        `<a class="pli" href="category/${x.s}?brands=${encodeURIComponent(bn)}&q=${encodeURIComponent(x.m)}">
          ${thumbCell(x.img, x.m, tint, icon)}
          <div class="pli-info">
            <div class="pli-top">${esc(c.name)}${x.cap != null ? ` · ${x.cap}인` : ""}</div>
            <div class="pli-name">${esc(x.m)}</div>
          </div>
          <div class="pli-side">
            <div class="pli-price">${x.p != null ? won(x.p) : '<span class="nd">가격없음</span>'}</div>
            <span class="pli-chev" aria-hidden="true">›</span>
          </div></a>`).join("");
      return `<h2 class="sec" style="margin-top:24px">
        <a href="category/${c.slug}?brands=${encodeURIComponent(bn)}" style="color:var(--accent)">
          ${esc(c.name)} <span class="nd">${c.items.length}개 ›</span></a></h2>
      <div class="plist">${items}</div>`;
    }).join("") ||
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
  document.title = `${persona.name} 추천 — 장비의 숲`;
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
    // 순위 점수(클수록 추천 상위). target=목표근접 / rankBy:value=가성비 / 기본=지표 좋은방향
    const score = m => {
      const s = m.specs[pick.metric];
      if (pick.target != null) return -Math.abs(s.value - pick.target);
      if (pick.rankBy === "value") return (s.stars != null && m.price_min) ? s.stars / (m.price_min / 10000) : -Infinity;
      return lower ? -s.value : s.value;
    };
    // 점수 동점이면 가격 오름차순(고가 임의혼입 방지). target/value 동점다발에 특히 중요
    rows.sort((a, b) => (score(b) - score(a)) ||
      ((a.price_min == null ? Infinity : a.price_min) - (b.price_min == null ? Infinity : b.price_min)));
    rows = rows.slice(0, 4);
    if (!rows.length) return "";
    const showStars = pick.target == null && pick.rankBy !== "value";  // 정렬축과 별점이 일치할 때만 별점 표시
    const more = pick.rankBy === "value"
      ? `category/${pick.cat}?sort=value`
      : `category/${pick.cat}?sort=spec:${pick.metric}&sa=${lower ? 1 : 0}`;
    const cards = rows.map(m => {
      const s = m.specs[pick.metric];
      const starHtml = (showStars && s.stars != null) ? " " + stars(s.stars) : "";   // 가성비·목표 정렬엔 별점 숨김(축 불일치)
      const opsBadge = (OPS && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
      return `<a class="rcard" href="category/${pick.cat}?brands=${encodeURIComponent(m.brand)}&q=${encodeURIComponent(m.model)}">
        ${thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "rthumb", "rnoimg")}
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

/* ---------- 최근 본 상품(홈, 가로 스크롤) ---------- */
const HOT_FALLBACK = [
  { slug: "backpacking-tent", name: "백패킹텐트" },
  { slug: "sleeping-bag",     name: "침낭" },
  { slug: "burner",           name: "버너" },
  { slug: "lantern",          name: "랜턴" },
];

async function renderHotSection(categories) {
  const sec = document.getElementById("hot-section");
  const listEl = document.getElementById("hot-list");
  if (!sec || !listEl) return;

  let hotSlugs = HOT_FALLBACK;
  try {
    const { supabase } = await import("./supabaseClient.js");
    const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { data } = await supabase
      .from("click_events")
      .select("slug")
      .gte("created_at", since);
    if (data && data.length >= 3) {
      const counts = {};
      data.forEach(r => { counts[r.slug] = (counts[r.slug] || 0) + 1; });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
      const catMap = Object.fromEntries((categories || []).map(c => [c.slug, c.name]));
      hotSlugs = sorted.map(([slug, cnt]) => ({ slug, name: catMap[slug] || slug, cnt }));
    }
  } catch (_) {}

  listEl.innerHTML = hotSlugs.map(h =>
    `<a class="hot-chip" href="category/${h.slug}">
      <span class="hot-icon">${catIcon(h.name || h.slug)}</span>
      <span class="hot-name">${esc(h.name || h.slug)}</span>
      ${h.cnt ? `<span class="hot-cnt">${h.cnt}회</span>` : ""}
    </a>`
  ).join("");
  sec.style.display = "block";
}

function renderRecent() {
  const el = document.getElementById("recent");
  if (!el) return;
  const a = getRecent();
  if (!a.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<h2 class="sec">최근 본 상품</h2><div class="recent-row">` +
    a.map(x => `<a class="recard" href="category/${x.s}?brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">
      ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "recard-thumb", "recard-noimg")}
      <div class="recard-b">${esc(x.b)}</div>
      <div class="recard-m">${esc(x.m)}</div>
      <div class="recard-p">${x.p != null ? won(x.p) : '<span class="nd">—</span>'}</div></a>`).join("") + `</div>`;
}

/* ---------- 내 정보 — Progressive Disclosure ---------- */
function _accActiveTab() {
  const t = sessionStorage.getItem("acc-tab") || "wish";
  return t;
}
function _accSetTab(tab) {
  sessionStorage.setItem("acc-tab", tab);
  document.querySelectorAll(".acc-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ["wish-section", "sets-section", "logs-section"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const map = { "wish-section": "wish", "sets-section": "sets", "logs-section": "logs" };
    el.style.display = (map[id] === tab && el._accHasContent) ? "block" : "none";
  });
}
function renderAccount() {
  if (!document.getElementById("wishlist")) return;
  const wishes = getWish();
  const sets = getSets();
  const isLoggedIn = !!window._accUser;
  const hasAny = wishes.length || sets.length;

  const emptyEl = document.getElementById("acc-empty");
  const navEl = document.getElementById("acc-nav");
  const tabsEl = document.getElementById("acc-tabs");

  // 탭 바는 로그인 상태에서만 표시
  if (tabsEl) {
    if (isLoggedIn) {
      tabsEl.style.display = "flex";
      tabsEl.querySelectorAll(".acc-tab").forEach(b => {
        b.onclick = () => { _accSetTab(b.dataset.tab); renderAccount(); };
      });
    } else {
      tabsEl.style.display = "none";
    }
  }

  // 비로그인: 앵커 링크 fallback
  if (navEl) {
    if (!isLoggedIn && hasAny) {
      const links = [];
      if (wishes.length) links.push(`<a class="acc-anchor" href="#sec-wish">찜 ${wishes.length}</a>`);
      if (sets.length) links.push(`<a class="acc-anchor" href="#sec-sets">세트 ${sets.length}</a>`);
      navEl.innerHTML = links.join("");
      navEl.style.display = "flex";
    } else {
      navEl.style.display = "none";
    }
  }

  if (emptyEl) emptyEl.style.display = (!isLoggedIn && !hasAny) ? "block" : "none";

  const activeTab = _accActiveTab();

  // 내 로그 섹션 (로그인 사용자만)
  const logsSec = document.getElementById("logs-section");
  const myLogsList = document.getElementById("my-logs-list");
  if (logsSec && myLogsList) {
    const userId = window._accUser?.id;
    if (userId) {
      logsSec._accHasContent = true;
      logsSec.style.display = (isLoggedIn && activeTab === "logs") ? "block" : "none";
      if (!myLogsList.dataset.loaded) {
        myLogsList.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:12px 0">불러오는 중…</div>`;
        import("./supabaseClient.js").then(async ({ supabase }) => {
          const { data: posts } = await supabase
            .from("posts")
            .select("id, title, content, tags, created_at, is_public")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);
          const logsCnt = document.getElementById("logscount");
          myLogsList.dataset.loaded = "1";
          if (!posts || posts.length === 0) {
            if (logsCnt) logsCnt.textContent = "";
            myLogsList.innerHTML = `
              <div style="text-align:center;padding:32px 0 16px">
                <div style="font-size:36px;margin-bottom:10px">📝</div>
                <div style="font-size:14px;font-weight:600;margin-bottom:6px">아직 작성한 로그가 없어요</div>
                <div style="font-size:13px;color:var(--muted);margin-bottom:16px">캠핑 경험을 기록하고 장비를 태그해보세요</div>
                <a class="achip clear" href="community.html">커뮤니티에서 로그 쓰기 ›</a>
              </div>`;
            return;
          }
          if (logsCnt) logsCnt.textContent = `${posts.length}개`;
          const renderMyLogs = (list) => {
            myLogsList.innerHTML = `
              <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
                <a class="achip clear" href="community.html" style="font-size:12px;padding:5px 12px">+ 새 로그</a>
              </div>` +
              list.map((p, pi) => {
                const dt = new Date(p.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
                const preview = (p.content || "").slice(0, 60).replace(/\n/g, " ");
                const vis = p.is_public ? "" : `<span style="font-size:10px;padding:2px 6px;border-radius:10px;background:var(--chip-bg);color:var(--muted);margin-left:6px">비공개</span>`;
                return `<div class="my-log-card" id="mlc-${pi}" style="position:relative">
                  <div class="my-log-card-actions">
                    <button type="button" class="my-log-edit" data-pi="${pi}" aria-label="수정">✎</button>
                    <button type="button" class="my-log-del" data-pi="${pi}" aria-label="삭제">✕</button>
                  </div>
                  <div class="log-card-head"><span class="log-date">${dt}</span>${vis}</div>
                  <div class="log-title">${esc(p.title)}</div>
                  <div class="log-preview">${esc(preview)}${p.content.length > 60 ? "…" : ""}</div>
                  ${(p.tags||[]).slice(0,3).map(t=>`<span class="log-tag">${esc(t)}</span>`).join("")}
                </div>`;
              }).join("");

            myLogsList.querySelectorAll(".my-log-edit").forEach(btn => {
              btn.onclick = () => {
                const pi = +btn.dataset.pi;
                const p = list[pi];
                const card = document.getElementById(`mlc-${pi}`);
                card.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px">
                    <input id="le-title-${pi}" class="lf-input" type="text" value="${esc(p.title)}" maxlength="60" style="font-size:14px">
                    <textarea id="le-body-${pi}" class="lf-textarea" rows="4" maxlength="1000" style="font-size:13px">${esc(p.content)}</textarea>
                    <div style="display:flex;align-items:center;gap:8px">
                      <input id="le-pub-${pi}" type="checkbox" ${p.is_public ? "checked" : ""} style="width:14px;height:14px">
                      <label for="le-pub-${pi}" style="font-size:12px;color:var(--muted)">공개</label>
                    </div>
                    <div id="le-err-${pi}" style="font-size:12px;color:#e53e3e;display:none"></div>
                    <div style="display:flex;gap:8px">
                      <button type="button" id="le-save-${pi}" class="lf-submit" style="padding:9px;font-size:13px;flex:1">저장</button>
                      <button type="button" id="le-cancel-${pi}" style="padding:9px;font-size:13px;flex:1;border:1px solid var(--line);border-radius:8px;background:none;cursor:pointer">취소</button>
                    </div>
                  </div>`;
                document.getElementById(`le-cancel-${pi}`).onclick = () => renderMyLogs(list);
                document.getElementById(`le-save-${pi}`).onclick = async () => {
                  const newTitle = document.getElementById(`le-title-${pi}`).value.trim();
                  const newContent = document.getElementById(`le-body-${pi}`).value.trim();
                  const newPublic = document.getElementById(`le-pub-${pi}`).checked;
                  const errEl2 = document.getElementById(`le-err-${pi}`);
                  if (!newTitle) { errEl2.textContent = "제목을 입력해주세요."; errEl2.style.display = ""; return; }
                  if (newContent.length < 20) { errEl2.textContent = "내용을 20자 이상 작성해주세요."; errEl2.style.display = ""; return; }
                  const saveBtn = document.getElementById(`le-save-${pi}`);
                  saveBtn.disabled = true; saveBtn.textContent = "저장 중…";
                  const { supabase: sb } = await import("./supabaseClient.js");
                  const { error } = await sb.from("posts")
                    .update({ title: newTitle, content: newContent, is_public: newPublic })
                    .eq("id", p.id).eq("user_id", userId);
                  if (error) { errEl2.textContent = "저장 중 오류가 발생했어요."; errEl2.style.display = ""; saveBtn.disabled = false; saveBtn.textContent = "저장"; return; }
                  list[pi] = { ...p, title: newTitle, content: newContent, is_public: newPublic };
                  renderMyLogs(list);
                };
              };
            });

            myLogsList.querySelectorAll(".my-log-del").forEach(btn => {
              btn.onclick = async () => {
                const p = list[+btn.dataset.pi];
                if (!confirm(`"${p.title}" 로그를 삭제할까요?`)) return;
                btn.disabled = true;
                const { supabase: sb } = await import("./supabaseClient.js");
                const { error } = await sb.from("posts")
                  .update({ deleted_at: new Date().toISOString() })
                  .eq("id", p.id).eq("user_id", userId);
                if (error) { alert("삭제 중 오류가 발생했어요."); btn.disabled = false; return; }
                const remaining = list.filter((_, i) => i !== +btn.dataset.pi);
                if (remaining.length === 0) {
                  if (logsCnt) logsCnt.textContent = "";
                  myLogsList.innerHTML = `
                    <div style="text-align:center;padding:32px 0 16px">
                      <div style="font-size:36px;margin-bottom:10px">📝</div>
                      <div style="font-size:14px;font-weight:600;margin-bottom:6px">아직 작성한 로그가 없어요</div>
                      <div style="font-size:13px;color:var(--muted);margin-bottom:16px">캠핑 경험을 기록하고 장비를 태그해보세요</div>
                      <a class="achip clear" href="community.html">커뮤니티에서 로그 쓰기 ›</a>
                    </div>`;
                } else {
                  if (logsCnt) logsCnt.textContent = `${remaining.length}개`;
                  renderMyLogs(remaining);
                }
              };
            });
          };
          renderMyLogs(posts);
        }).catch(() => { logsSec._accHasContent = false; logsSec.style.display = "none"; });
      }
    } else {
      logsSec._accHasContent = false;
      logsSec.style.display = "none";
    }
  }

  // 찜 섹션
  const wishSec = document.getElementById("wish-section");
  const wishEl = document.getElementById("wishlist");
  const cnt = document.getElementById("wishcount");
  if (wishSec) {
    wishSec._accHasContent = wishes.length > 0;
    wishSec.style.display = (wishes.length && (!isLoggedIn || activeTab === "wish")) ? "block" : "none";
  }
  if (cnt) cnt.textContent = wishes.length ? `${wishes.length}개` : "";
  if (wishEl && wishes.length) {
    wishEl.innerHTML = wishes.map((x, i) => {
      const href = `category/${x.s}?brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}`;
      return `<div class="pli" role="button" tabindex="0" data-href="${esc(href)}">
        <button type="button" class="pli-wish on" data-i="${i}" aria-label="찜 해제" aria-pressed="true">♥</button>
        ${thumbCell(x.img, x.m, "var(--card2)", "🏕️")}
        <div class="pli-info">
          <div class="pli-top">${esc(x.b)}${x.cap != null ? ` · ${x.cap}인` : ""}</div>
          <div class="pli-name">${esc(x.m)}</div>
        </div>
        <div class="pli-side">
          <div class="pli-price">${x.p != null ? won(x.p) : '<span class="nd">가격없음</span>'}</div>
          <span class="pli-chev" aria-hidden="true">›</span>
        </div></div>`;
    }).join("");
    wishEl.querySelectorAll(".pli").forEach(card => {
      const go = () => { location.href = card.dataset.href; };
      card.onclick = go;
      card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
    wishEl.querySelectorAll(".pli-wish").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const arr = getWish(); arr.splice(+b.dataset.i, 1); setWish(arr); renderAccount();
    });
  }

  // 세트 섹션
  const setsSec = document.getElementById("sets-section");
  const setsEl = document.getElementById("setslist");
  const setsCnt = document.getElementById("setscount");
  if (setsSec) {
    setsSec._accHasContent = sets.length > 0;
    setsSec.style.display = (sets.length && (!isLoggedIn || activeTab === "sets")) ? "block" : "none";
  }
  if (setsCnt) setsCnt.textContent = sets.length ? `${sets.length}개` : "";
  if (setsEl && sets.length) {
    const totalPrice = items => items.reduce((s, x) => s + (x.p || 0) * (x.qty || 1), 0);
    const totalWeight = items => { const w = items.reduce((s, x) => x.weight_g != null ? s + x.weight_g * (x.qty || 1) : s, 0); return w > 0 ? w : null; };
    const fmtWeight = g => g >= 1000 ? `${(g/1000).toFixed(1)}kg` : `${g}g`;
    const weightBadge = g => g == null ? '' : `<span class="pli-wt-badge" style="font-size:11px;color:${g<5000?'var(--ok,#2e7d32)':g<10000?'#e65100':'#b71c1c'}">${g<5000?'🪶경량':g<10000?'⚖️보통':'🏋️무거움'} ${fmtWeight(g)}</span>`;
    setsEl.innerHTML = sets.map((s, si) =>
      `<div class="pli acc-set" role="button" tabindex="0" data-si="${si}">
        <div class="pli-info">
          <div class="pli-top">${esc(s.style || "세트")}</div>
          <div class="pli-name">${esc(s.title)}</div>
          <div class="pli-top" style="margin-top:3px">${s.items.length}개 장비 ${weightBadge(totalWeight(s.items))}</div>
        </div>
        <div class="pli-side">
          <div class="pli-price">${totalPrice(s.items) ? won(totalPrice(s.items)) : '<span class="nd">—</span>'}</div>
          <button type="button" class="acc-set-share" data-si="${si}" aria-label="링크 복사" title="공유 링크 복사">🔗</button>
          <button type="button" class="acc-set-del" data-si="${si}" aria-label="세트 삭제">✕</button>
        </div></div>`
    ).join("");
    setsEl.querySelectorAll(".acc-set-share").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const s = getSets()[+b.dataset.si];
      if (!s) return;
      try {
        const payload = { name: s.title || s.name || "세트", items: (s.items || []).map(x => ({ b: x.b, m: x.m, qty: x.qty || 1, weight_g: x.weight_g ?? null })) };
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        const url = `${location.origin}/account.html?view-set=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
          b.textContent = "✓"; setTimeout(() => { b.textContent = "🔗"; }, 1500);
        }).catch(() => { prompt("링크를 복사해 주세요:", url); });
      } catch { alert("링크 생성에 실패했어요."); }
    });
    setsEl.querySelectorAll(".acc-set-del").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const arr = getSets();
      const deleted = arr.splice(+b.dataset.si, 1)[0];
      if (deleted?.remoteId && typeof window._deleteRemoteGearSet === 'function') {
        window._deleteRemoteGearSet(deleted.remoteId);
      }
      saveSets(arr); renderAccount();
    });
  }

  // 탭 레이블에 카운트 뱃지 업데이트
  if (tabsEl && isLoggedIn) {
    tabsEl.querySelectorAll(".acc-tab").forEach(b => {
      const labels = { wish: `❤️ 찜목록${wishes.length ? ` <span style="font-size:11px;background:var(--accent);color:#fff;border-radius:99px;padding:1px 6px">${wishes.length}</span>` : ""}`,
                       sets: `🎒 내 세트${sets.length ? ` <span style="font-size:11px;background:var(--accent);color:#fff;border-radius:99px;padding:1px 6px">${sets.length}</span>` : ""}`,
                       logs: `📝 내 로그` };
      b.innerHTML = labels[b.dataset.tab] || b.textContent;
    });
  }
}

/* ---------- 커뮤니티 ---------- */
const BEST_SLUGS = [
  { slug:"backpacking-tent", label:"백패킹텐트", style:"🏕 백패킹" },
  { slug:"sleeping-bag",     label:"침낭",       style:"❄ 겨울·백패킹" },
  { slug:"mat",              label:"매트",       style:"🏕 백패킹" },
  { slug:"burner",           label:"버너",       style:"🚗 오토캠핑" },
  { slug:"lantern",          label:"랜턴",       style:"✨ 글램핑" },
  { slug:"chair",            label:"체어",       style:"🚗 오토캠핑" },
];

async function renderCommunity() {
  if (!document.getElementById("comm-best-list")) return;

  // 탭 전환
  document.querySelectorAll(".comm-tab").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".comm-tab").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    document.getElementById("comm-best").style.display = btn.dataset.tab === "best" ? "block" : "none";
    document.getElementById("comm-logs").style.display  = btn.dataset.tab === "logs"  ? "block" : "none";
  });

  // 로그 작성 버튼
  const writeBtn = document.getElementById("comm-write-btn");
  if (writeBtn) writeBtn.onclick = () => openLogModal();

  // 베스트 장비 큐레이션 로드
  renderBestGear();

  // 정렬 버튼 이벤트
  document.querySelectorAll(".log-sort-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".log-sort-btn").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      renderLogFeed(btn.dataset.sort, _logFeedTag);
    };
  });

  // 로그 피드 (현재 empty state)
  renderLogFeed("latest");
}

function _isPostLiked(pid) {
  try { return JSON.parse(localStorage.getItem("post_likes") || "[]").includes(pid) } catch { return false }
}
function _setPostLiked(pid, on) {
  try {
    let arr = JSON.parse(localStorage.getItem("post_likes") || "[]");
    arr = on ? [...new Set([...arr, pid])] : arr.filter(x => x !== pid);
    localStorage.setItem("post_likes", JSON.stringify(arr));
  } catch {}
}

async function renderBestGear() {
  const el = document.getElementById("comm-best-list");
  if (!el) return;
  el.innerHTML = `<div style="color:var(--muted);font-size:12px;padding:8px 0 12px">측정 스펙 기반 카테고리별 상위 장비</div>`;

  for (const { slug, label, style } of BEST_SLUGS) {
    try {
      const d = await getJSON(`data/${slug}.json`);
      const star = d.metrics.filter(m => m.is_star)[0];
      if (!star) continue;
      // 주력 스펙 기준 상위 3개
      const sorted = [...d.models]
        .filter(m => m.specs[star.key] && m.specs[star.key].value != null)
        .sort((a, b) => {
          const av = a.specs[star.key].value, bv = b.specs[star.key].value;
          return star.direction === "lower_better" ? av - bv : bv - av;
        })
        .slice(0, 3);
      if (!sorted.length) continue;

      const cards = sorted.map(m =>
        `<a class="comm-gear-card" href="category/${slug}?brands=${encodeURIComponent(m.brand)}&q=${encodeURIComponent(m.model)}">
          ${thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "comm-gear-thumb", "comm-gear-noimg")}
          <div class="comm-gear-info">
            <div class="comm-gear-brand">${esc(m.brand)}</div>
            <div class="comm-gear-model">${esc(m.model)}</div>
            <div class="comm-gear-spec">${star.label} ${fmtVal(m.specs[star.key].value, star.unit)}</div>
          </div>
          <div class="comm-gear-price">${m.price_min != null ? won(m.price_min) : '<span class="nd">—</span>'}</div>
        </a>`
      ).join("");

      const sec = document.createElement("div");
      sec.className = "comm-sec";
      sec.innerHTML = `
        <div class="comm-sec-head">
          <span class="comm-sec-label">${catIcon(d.name)} ${label}</span>
          <span class="comm-sec-style">${style}</span>
          <a class="comm-sec-more" href="category/${slug}">전체 보기 ›</a>
        </div>
        <div class="comm-gear-row">${cards}</div>`;
      el.appendChild(sec);
    } catch (e) { /* 로드 실패 시 섹션 건너뜀 */ }
  }
}

let _logFeedTag = null;
let _logFeedSort = "latest";

async function renderLogFeed(sortMode = "latest", filterTag = _logFeedTag) {
  _logFeedTag = filterTag;
  _logFeedSort = sortMode;
  const el = document.getElementById("comm-logs-list");
  if (!el) return;

  const tagFilterBar = document.getElementById("comm-tag-filter-bar");
  if (tagFilterBar) {
    if (filterTag) {
      tagFilterBar.innerHTML = `<span style="font-size:12px;color:var(--muted)">태그 필터:</span> <span class="log-tag" style="font-size:12px">#${esc(filterTag)}</span> <button id="tag-filter-clear" style="border:none;background:none;font-size:12px;color:var(--muted);cursor:pointer;padding:2px 4px">✕ 해제</button>`;
      tagFilterBar.style.display = "flex";
      const clrBtn = tagFilterBar.querySelector("#tag-filter-clear");
      if (clrBtn) clrBtn.onclick = () => renderLogFeed(sortMode, null);
    } else {
      tagFilterBar.style.display = "none";
    }
  }

  el.innerHTML = `<div style="text-align:center;padding:32px 0;color:var(--muted);font-size:13px">불러오는 중…</div>`;
  try {
    const { supabase } = await import("./supabaseClient.js");
    const orderCol = sortMode === "popular" ? "likes" : "created_at";
    let query = supabase
      .from("posts")
      .select("id, title, content, tags, created_at, user_id, image_url, likes, comment_count, gear_set_snapshot, profiles(nickname)")
      .eq("is_public", true)
      .order(orderCol, { ascending: false })
      .limit(50);
    if (filterTag) query = query.contains("tags", [filterTag]);
    const { data: posts, error } = await query;
    if (error) throw error;
    if (!posts || posts.length === 0) {
      el.innerHTML = `
        <div class="pli-empty" style="padding:48px 0">
          <div class="pe-ico">📝</div>
          <div class="pe-msg">아직 로그가 없어요.<br>첫 캠핑 로그를 작성해보세요!</div>
          <button type="button" class="achip clear" style="margin-top:12px" onclick="openLogModal()">로그 쓰기</button>
        </div>`;
      return;
    }
    el.innerHTML = posts.map((p, i) => {
      const nick = p.profiles?.nickname || "익명";
      const dt = new Date(p.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
      const tagHtml = (p.tags || []).slice(0, 4).map(t => `<button type="button" class="log-tag log-tag-btn" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
      const preview = (p.content || "").slice(0, 80).replace(/\n/g, " ");
      const imgHtml = p.image_url ? `<img class="log-card-img" src="${esc(p.image_url)}" alt="" loading="lazy">` : "";
      const gs = p.gear_set_snapshot;
      const gsBadge = gs ? (() => { const w = gs.total_weight_g; const wTxt = w ? (w >= 1000 ? `${(w/1000).toFixed(1)}kg` : `${w}g`) : ""; const cnt = (gs.items||[]).length; return `<div class="log-set-badge">🎒 ${esc(gs.name)}${cnt ? ` · ${cnt}개` : ""}${wTxt ? ` · ${wTxt}` : ""}</div>`; })() : "";
      const liked = _isPostLiked(p.id);
      const likeCount = p.likes || 0;
      return `<div class="log-card" role="button" tabindex="0" data-li="${i}" style="cursor:pointer">
        ${imgHtml}
        <div class="log-card-head">
          <span class="log-nick">${esc(nick)}</span>
          <span class="log-date">${dt}</span>
        </div>
        <div class="log-title">${esc(p.title)}</div>
        <div class="log-preview">${esc(preview)}${p.content.length > 80 ? "…" : ""}</div>
        ${tagHtml ? `<div class="log-tags">${tagHtml}</div>` : ""}
        ${gsBadge}
        <div class="log-card-foot">
          <button type="button" class="log-like-btn${liked ? " on" : ""}" data-pid="${esc(p.id)}" data-liked="${liked ? "1" : "0"}" aria-label="좋아요">
            ${liked ? "♥" : "♡"} <span class="log-like-cnt">${likeCount}</span>
          </button>
          <span class="log-cmt-count">💬 ${p.comment_count || 0}</span>
        </div>
      </div>`;
    }).join("");
    el.querySelectorAll(".log-card").forEach(card => {
      const p = posts[+card.dataset.li];
      card.onclick = () => openLogDetail(p);
      card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLogDetail(p); } };
    });
    el.querySelectorAll(".log-tag-btn").forEach(btn => {
      btn.onclick = e => { e.stopPropagation(); renderLogFeed(_logFeedSort || "latest", btn.dataset.tag); };
    });
    el.querySelectorAll(".log-like-btn").forEach(btn => {
      btn.onclick = async e => {
        e.stopPropagation();
        const pid = btn.dataset.pid;
        const wasLiked = btn.dataset.liked === "1";
        const cntEl = btn.querySelector(".log-like-cnt");
        const cur = parseInt(cntEl.textContent, 10) || 0;
        if (wasLiked) {
          _setPostLiked(pid, false);
          btn.dataset.liked = "0";
          btn.classList.remove("on");
          btn.innerHTML = `♡ <span class="log-like-cnt">${cur - 1}</span>`;
          const { supabase } = await import("./supabaseClient.js");
          await supabase.rpc("decrement_post_likes", { post_id: pid });
        } else {
          _setPostLiked(pid, true);
          btn.dataset.liked = "1";
          btn.classList.add("on");
          btn.innerHTML = `♥ <span class="log-like-cnt">${cur + 1}</span>`;
          const { supabase } = await import("./supabaseClient.js");
          await supabase.rpc("increment_post_likes", { post_id: pid });
        }
      };
    });
  } catch (e) {
    el.innerHTML = `<div style="text-align:center;padding:32px 0;color:var(--muted);font-size:13px">로그를 불러오지 못했어요.</div>`;
  }
}

function openLogDetail(p) {
  let modal = document.getElementById("log-detail-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "log-detail-modal";
    modal.className = "pmodal";
    document.body.appendChild(modal);
  }
  const nick = p.profiles?.nickname || "익명";
  const dt = new Date(p.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const tagHtml = (p.tags || []).map(t => `<span class="log-tag" style="font-size:12px;padding:3px 10px">${esc(t)}</span>`).join("");
  const body = (p.content || "").replace(/\n/g, "<br>");
  modal.innerHTML = `<div class="pmbox log-detail-box" role="dialog" aria-modal="true">
    <button class="pmx" aria-label="닫기">✕</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <span class="log-nick" style="font-size:14px">${esc(nick)}</span>
      <span class="log-date">${dt}</span>
    </div>
    <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;line-height:1.4">${esc(p.title)}</h2>
    ${p.image_url ? `<img src="${esc(p.image_url)}" alt="" style="width:100%;max-height:240px;object-fit:cover;border-radius:8px;margin-bottom:14px">` : ""}
    <div style="font-size:14px;line-height:1.8;color:var(--fg);margin-bottom:16px">${body}</div>
    ${tagHtml ? `<div class="log-tags" style="margin-top:12px">${tagHtml}</div>` : ""}
    ${(() => { const gs = p.gear_set_snapshot; if (!gs) return ""; const w = gs.total_weight_g; const wTxt = w ? (w >= 1000 ? `${(w/1000).toFixed(1)}kg` : `${w}g`) : ""; const itemsHtml = (gs.items||[]).slice(0,5).map(x => `<span class="log-set-item">${esc(x.name)}${x.weight_g ? ` <span style="color:var(--muted)">${x.weight_g >= 1000 ? (x.weight_g/1000).toFixed(1)+"kg" : x.weight_g+"g"}</span>` : ""}</span>`).join(""); return `<div class="log-set-detail" style="margin-top:14px;padding:10px 12px;border-radius:8px;background:var(--card);border:1px solid var(--line)"><div style="font-size:12px;font-weight:600;margin-bottom:6px">🎒 ${esc(gs.name)}${wTxt ? ` · 총 ${wTxt}` : ""}</div><div style="display:flex;flex-wrap:wrap;gap:4px">${itemsHtml}${(gs.items||[]).length > 5 ? `<span style="font-size:11px;color:var(--muted)">외 ${(gs.items||[]).length - 5}개</span>` : ""}</div></div>`; })()}
    <div class="log-card-foot" style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">
      <button type="button" class="log-like-btn${_isPostLiked(p.id) ? " on" : ""}" id="detail-like-btn" data-pid="${esc(p.id)}" data-liked="${_isPostLiked(p.id) ? "1" : "0"}">
        ${_isPostLiked(p.id) ? "♥" : "♡"} <span class="log-like-cnt">${p.likes || 0}</span> 좋아요
      </button>
    </div>
    <div id="detail-comments" style="margin-top:18px;border-top:1px solid var(--line);padding-top:14px">
      <div style="font-size:13px;font-weight:700;color:var(--fg);margin-bottom:10px">댓글 <span id="detail-cmt-cnt" style="color:var(--muted);font-weight:400">${p.comment_count || 0}</span></div>
      <div id="detail-cmt-list" style="font-size:13px;color:var(--muted);padding:8px 0">불러오는 중…</div>
      <form id="detail-cmt-form" style="display:flex;gap:8px;margin-top:10px">
        <textarea id="detail-cmt-input" rows="2" maxlength="300" placeholder="댓글을 입력하세요 (최대 300자)" style="flex:1;resize:none;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;background:var(--bg);color:var(--fg)"></textarea>
        <button type="submit" class="achip" style="align-self:flex-end;white-space:nowrap;font-size:13px">등록</button>
      </form>
    </div>
  </div>`;
  modal.classList.add("on");
  const close = () => modal.classList.remove("on");
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  const likeBtn = modal.querySelector("#detail-like-btn");
  if (likeBtn) {
    likeBtn.onclick = async e => {
      e.stopPropagation();
      const pid = likeBtn.dataset.pid;
      const wasLiked = likeBtn.dataset.liked === "1";
      const cntEl = likeBtn.querySelector(".log-like-cnt");
      const cur = parseInt(cntEl.textContent, 10) || 0;
      if (wasLiked) {
        _setPostLiked(pid, false);
        likeBtn.dataset.liked = "0"; likeBtn.classList.remove("on");
        likeBtn.innerHTML = `♡ <span class="log-like-cnt">${cur - 1}</span> 좋아요`;
        const { supabase } = await import("./supabaseClient.js");
        await supabase.rpc("decrement_post_likes", { post_id: pid });
      } else {
        _setPostLiked(pid, true);
        likeBtn.dataset.liked = "1"; likeBtn.classList.add("on");
        likeBtn.innerHTML = `♥ <span class="log-like-cnt">${cur + 1}</span> 좋아요`;
        const { supabase } = await import("./supabaseClient.js");
        await supabase.rpc("increment_post_likes", { post_id: pid });
      }
    };
  }
  const onKey = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); } };
  document.addEventListener("keydown", onKey);

  // 댓글 로드 및 제출
  (async () => {
    const { supabase } = await import("./supabaseClient.js");
    const cmtList = document.getElementById("detail-cmt-list");
    const cmtCnt = document.getElementById("detail-cmt-cnt");
    const cmtForm = document.getElementById("detail-cmt-form");
    const cmtInput = document.getElementById("detail-cmt-input");

    async function loadComments() {
      const { data: cmts } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .eq("post_id", p.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(50);
      if (!cmtList) return;
      if (!cmts || cmts.length === 0) {
        cmtList.innerHTML = `<div style="color:var(--muted);padding:4px 0">첫 댓글을 남겨보세요!</div>`;
      } else {
        if (cmtCnt) cmtCnt.textContent = cmts.length;
        cmtList.innerHTML = cmts.map(c => {
          const nick = c.profiles?.nickname || "익명";
          const dt = new Date(c.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
          const isMine = window._commUser && window._commUser.id === c.user_id;
          return `<div class="cmt-row" data-cid="${esc(c.id)}">
            <div class="cmt-meta"><span class="cmt-nick">${esc(nick)}</span><span class="cmt-date">${dt}</span>${isMine ? `<button type="button" class="cmt-del-btn" data-cid="${esc(c.id)}">✕</button>` : ""}</div>
            <div class="cmt-body">${esc(c.content)}</div>
          </div>`;
        }).join("");
        cmtList.querySelectorAll(".cmt-del-btn").forEach(btn => {
          btn.onclick = async () => {
            const cid = btn.dataset.cid;
            await supabase.from("comments").update({ deleted_at: new Date().toISOString() }).eq("id", cid).eq("user_id", window._commUser.id);
            await loadComments();
          };
        });
      }
    }

    await loadComments();

    if (cmtForm) {
      cmtForm.onsubmit = async e => {
        e.preventDefault();
        const content = (cmtInput?.value || "").trim();
        if (!content) return;
        if (!window._commUser) { alert("로그인 후 댓글을 작성할 수 있어요."); return; }
        const submitBtn = cmtForm.querySelector("button[type=submit]");
        if (submitBtn) submitBtn.disabled = true;
        const { error } = await supabase.from("comments").insert({ post_id: p.id, user_id: window._commUser.id, content });
        if (submitBtn) submitBtn.disabled = false;
        if (!error) { if (cmtInput) cmtInput.value = ""; await loadComments(); }
      };
    }
  })();
}

function openLogModal() {
  const modal = document.getElementById("log-modal");
  if (!modal) return;
  const body = document.getElementById("log-modal-body");
  if (!window._commUser) {
    body.innerHTML = `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:36px;margin-bottom:12px">🌲</div>
        <p style="font-size:14px;color:var(--muted);margin-bottom:20px">로그 작성은 로그인 후 이용할 수 있어요.</p>
        <a class="achip clear" href="account.html">로그인하러 가기</a>
      </div>`;
    modal.classList.add("on");
    modal.onclick = e => { if (e.target === modal) modal.classList.remove("on"); };
    modal.querySelector(".pmx").onclick = () => modal.classList.remove("on");
    return;
  }

  // 기어 세트에서 태그 후보 추출
  const sets = getSets();
  const tagSuggestions = sets.flatMap(s => (s.items || []).map(i => `${i.b} ${i.m}`)).slice(0, 20);

  body.innerHTML = `
    <form id="log-form" autocomplete="off">
      <div class="lf-field">
        <label class="lf-label" for="lf-title">제목 <span class="lf-req">*</span></label>
        <input id="lf-title" class="lf-input" type="text" placeholder="오늘 캠핑은 어땠나요?" maxlength="60" required>
      </div>
      <div class="lf-field">
        <label class="lf-label" for="lf-body">내용 <span class="lf-req">*</span></label>
        <textarea id="lf-body" class="lf-textarea" placeholder="캠핑 경험을 자유롭게 적어주세요. (날씨, 장소, 장비 소감 등)" rows="5" maxlength="1000" required></textarea>
        <div class="lf-count"><span id="lf-body-cnt">0</span>/1000</div>
      </div>
      <div class="lf-field">
        <label class="lf-label">장비 태그 <span class="lf-req">*</span> <span class="lf-hint">최소 1개</span></label>
        <div id="lf-tags" class="lf-tags"></div>
        <div class="lf-taginput-row">
          <input id="lf-tag-input" class="lf-input" type="text" placeholder="브랜드 + 모델명 입력 후 Enter" maxlength="40">
          <button type="button" id="lf-tag-add" class="lf-tag-addbtn">추가</button>
        </div>
        ${tagSuggestions.length ? `<div class="lf-tag-sug">${tagSuggestions.map(t => `<button type="button" class="lf-sug-chip" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
      </div>
      ${sets.length ? `<div class="lf-field">
        <label class="lf-label" for="lf-set">내 세트 첨부 <span class="lf-hint">선택</span></label>
        <select id="lf-set" class="lf-input" style="cursor:pointer">
          <option value="">첨부 안 함</option>
          ${sets.map((s, i) => `<option value="${i}">${esc(s.name || "이름 없는 세트")} (${(s.items || []).length}개)</option>`).join("")}
        </select>
      </div>` : ""}
      <div class="lf-field">
        <label class="lf-label" for="lf-img">사진 <span class="lf-hint">선택 · 최대 5MB</span></label>
        <input id="lf-img" type="file" accept="image/*" style="font-size:13px;width:100%">
        <div id="lf-img-preview" style="margin-top:8px;display:none">
          <img id="lf-img-thumb" style="max-width:100%;max-height:160px;border-radius:8px;object-fit:cover">
        </div>
      </div>
      <div class="lf-field" style="display:flex;align-items:center;gap:10px">
        <input id="lf-public" type="checkbox" checked style="width:16px;height:16px;cursor:pointer">
        <label for="lf-public" style="font-size:13px;cursor:pointer">공개 로그로 등록 (비공개 시 나만 볼 수 있어요)</label>
      </div>
      <div id="lf-err" class="lf-err" style="display:none"></div>
      <button type="submit" class="lf-submit" id="lf-submit">로그 등록</button>
    </form>`;

  const tags = [];
  const tagsEl = body.querySelector("#lf-tags");
  const tagInput = body.querySelector("#lf-tag-input");

  function renderTags() {
    tagsEl.innerHTML = tags.map((t, i) =>
      `<span class="lf-tag">${esc(t)}<button type="button" class="lf-tagx" data-i="${i}">×</button></span>`
    ).join("");
    tagsEl.querySelectorAll(".lf-tagx").forEach(b => {
      b.onclick = () => { tags.splice(+b.dataset.i, 1); renderTags(); };
    });
  }

  function addTag(val) {
    const v = val.trim();
    if (!v || tags.includes(v) || tags.length >= 10) return;
    tags.push(v);
    renderTags();
    tagInput.value = "";
  }

  body.querySelector("#lf-tag-add").onclick = () => addTag(tagInput.value);
  tagInput.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput.value); } };

  body.querySelectorAll(".lf-sug-chip").forEach(c => {
    c.onclick = () => addTag(c.dataset.tag);
  });

  const bodyTxt = body.querySelector("#lf-body");
  const cntEl = body.querySelector("#lf-body-cnt");
  bodyTxt.oninput = () => { cntEl.textContent = bodyTxt.value.length; };

  const form = body.querySelector("#log-form");
  const errEl = body.querySelector("#lf-err");
  const submitBtn = body.querySelector("#lf-submit");
  const imgInput = body.querySelector("#lf-img");
  const imgPreview = body.querySelector("#lf-img-preview");
  const imgThumb = body.querySelector("#lf-img-thumb");

  imgInput.addEventListener("change", () => {
    const file = imgInput.files[0];
    if (!file) { imgPreview.style.display = "none"; return; }
    if (file.size > 5 * 1024 * 1024) {
      errEl.textContent = "사진은 5MB 이하만 가능해요."; errEl.style.display = "";
      imgInput.value = ""; imgPreview.style.display = "none"; return;
    }
    imgThumb.src = URL.createObjectURL(file);
    imgPreview.style.display = "";
  });

  form.onsubmit = async e => {
    e.preventDefault();
    const title = form.querySelector("#lf-title").value.trim();
    const content = form.querySelector("#lf-body").value.trim();
    const is_public = form.querySelector("#lf-public").checked;
    if (!title) { errEl.textContent = "제목을 입력해주세요."; errEl.style.display = ""; return; }
    if (content.length < 20) { errEl.textContent = "내용을 20자 이상 작성해주세요."; errEl.style.display = ""; return; }
    if (tags.length < 1) { errEl.textContent = "장비 태그를 1개 이상 추가해주세요."; errEl.style.display = ""; return; }
    errEl.style.display = "none";
    submitBtn.disabled = true; submitBtn.textContent = "등록 중…";
    try {
      const { supabase } = await import("./supabaseClient.js");
      let image_url = null;
      const imgFile = imgInput.files[0];
      if (imgFile) {
        const ext = imgFile.name.split(".").pop().toLowerCase() || "jpg";
        const path = `${window._commUser.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images").upload(path, imgFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
        image_url = urlData?.publicUrl ?? null;
      }
      const setSelect = form.querySelector("#lf-set");
      let gear_set_snapshot = null;
      if (setSelect && setSelect.value !== "") {
        const s = sets[+setSelect.value];
        if (s) {
          const totalW = (s.items || []).reduce((acc, x) => x.weight_g != null ? acc + x.weight_g * (x.qty || 1) : acc, 0);
          gear_set_snapshot = { name: s.name || "이름 없는 세트", items: (s.items || []).map(x => ({ name: `${x.b || ""} ${x.m || ""}`.trim(), weight_g: x.weight_g ?? null, qty: x.qty || 1 })), total_weight_g: totalW > 0 ? totalW : null };
        }
      }
      const { error } = await supabase.from("posts").insert({
        user_id: window._commUser.id, title, content,
        tags, is_public, image_url, gear_set_snapshot
      });
      if (error) throw error;
      modal.classList.remove("on");
      renderLogFeed();
    } catch (err) {
      errEl.textContent = "저장 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
      errEl.style.display = "";
      submitBtn.disabled = false; submitBtn.textContent = "로그 등록";
    }
  };

  modal.classList.add("on");
  const close = () => modal.classList.remove("on");
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("comm-best-list")) renderCommunity();

  // 공유 세트 URL 처리 (?view-set=BASE64)
  const vsParam = new URLSearchParams(location.search).get("view-set");
  if (vsParam && document.getElementById("acc-section")) {
    try {
      const s = JSON.parse(decodeURIComponent(escape(atob(vsParam))));
      const modal = document.createElement("div");
      modal.className = "pmodal on";
      modal.style.zIndex = "300";
      const tw = (s.items || []).reduce((acc, x) => x.weight_g != null ? acc + x.weight_g * (x.qty || 1) : acc, 0);
      const wTxt = tw > 0 ? (tw >= 1000 ? `${(tw / 1000).toFixed(1)}kg` : `${tw}g`) : "";
      const itemsHtml = (s.items || []).map(x =>
        `<div class="cmt-row"><div class="cmt-body">${esc(`${x.b || ""} ${x.m || ""}`.trim())}${x.qty > 1 ? ` ×${x.qty}` : ""}${x.weight_g ? ` <span style="color:var(--muted);font-size:11px">${x.weight_g >= 1000 ? (x.weight_g / 1000).toFixed(1) + "kg" : x.weight_g + "g"}</span>` : ""}</div></div>`
      ).join("");
      modal.innerHTML = `<div class="pmbox" style="max-width:400px;width:100%;padding:24px">
        <button class="pmx">✕</button>
        <div style="font-size:11px;color:var(--muted);margin-bottom:4px">공유된 세트</div>
        <h2 style="font-size:18px;font-weight:700;margin:0 0 6px">${esc(s.name || "세트")}</h2>
        ${wTxt ? `<div style="font-size:13px;color:var(--muted);margin-bottom:12px">총 무게 ${wTxt}</div>` : ""}
        <div style="margin-bottom:16px">${itemsHtml || '<div style="color:var(--muted);font-size:13px">장비 없음</div>'}</div>
        <button type="button" class="achip" id="vs-import-btn" style="width:100%;justify-content:center">내 세트에 추가 (로그인 필요)</button>
      </div>`;
      document.body.appendChild(modal);
      const close = () => { modal.remove(); history.replaceState(null, "", location.pathname); };
      modal.onclick = e => { if (e.target === modal) close(); };
      modal.querySelector(".pmx").onclick = close;
      modal.querySelector("#vs-import-btn").onclick = () => {
        const arr = getSets();
        const newSet = { id: Date.now().toString(36), title: s.name || "공유 세트", style: "공유", items: (s.items || []).map(x => ({ b: x.b || "", m: x.m || "", qty: x.qty || 1, weight_g: x.weight_g ?? null })) };
        arr.push(newSet); saveSets(arr);
        close();
        alert("세트가 추가됐어요! 로그인 후 내 세트에서 확인하세요.");
      };
    } catch { /* 잘못된 파라미터 무시 */ }
  }
});
