/* 장비의 숲 — 정적 프론트엔드 (DB→data/*.json) */
/* PWA: 서비스워커 등록(오프라인+홈화면 설치). 실패해도 사이트는 정상 동작 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));  // L-85: 절대경로 — item 서브경로에서 sw.js 404 방지
}

// 테마: 기본 라이트. 다크는 '내 정보 > 설정'에서 명시적으로 켤 때만 적용(prefers-dark 자동 추종 안 함).
// 헤더 토글 버튼은 제거됨(.theme-toggle CSS도 display:none). 토글 UI는 account.html 설정 섹션이 담당.
(function initTheme() {
  const saved = localStorage.getItem("theme");
  document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
}());
// 설정 토글에서 호출 — 테마 적용 + 영속화
window.setTheme = function (mode) {
  const dark = mode === "dark";
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
};

// PWA 설치 유도 배너
let _pwaPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  _pwaPrompt = e;
  const banner = document.getElementById("pwa-banner");
  if (!banner || localStorage.getItem("pwa-dismissed")) return;
  banner.setAttribute("role", "status");         // L-118·L-129: 비긴급 배너 → status(+polite). alert(assertive 내포)와 polite 의미충돌 해소
  banner.setAttribute("aria-live", "polite");
  banner.setAttribute("aria-atomic", "true");
  banner.innerHTML = `<div class="pwa-banner-inner">
    <span class="pwa-banner-ico">🌲</span>
    <span class="pwa-banner-msg">장비의 숲을 홈 화면에 추가하면 더 빠르게 열려요</span>
    <button type="button" class="pwa-install-btn">설치</button>
    <button type="button" class="pwa-dismiss-btn" aria-label="닫기">✕</button>
  </div>`;
  const showBanner = () => {
    banner.style.display = "block";
    document.documentElement.style.setProperty("--banner-h", banner.offsetHeight + "px");
  };
  const hideBanner = () => {
    banner.style.display = "none";
    document.documentElement.style.removeProperty("--banner-h");
  };
  showBanner();
  banner.querySelector(".pwa-install-btn").onclick = async () => {
    _pwaPrompt.prompt();
    const { outcome } = await _pwaPrompt.userChoice;
    if (outcome === "accepted") localStorage.setItem("pwa-dismissed", "1");
    hideBanner();
  };
  banner.querySelector(".pwa-dismiss-btn").onclick = () => {
    localStorage.setItem("pwa-dismissed", "1");
    hideBanner();
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
const LEGAL_LINKS = ` · <a href="privacy.html" style="color:var(--muted);text-decoration:underline">개인정보처리방침</a> · <a href="terms.html" style="color:var(--muted);text-decoration:underline">이용약관</a>`;

/* 세트 수량 한도: 텐트류·침낭·매트·코트 = 1, 의자 = 4, 테이블 = 2, 나머지 = 4 */
const SET_QTY_MAX = {
  "backpacking-tent": 1, "auto-tent": 1, "shelter": 1, "tarp": 1,
  "sleeping-bag": 1, "mat": 1, "cot": 1, "backpacking-bag": 1,
};
const qtyMax = slug => SET_QTY_MAX[slug] ?? (slug === "chair" ? 4 : slug === "table" ? 2 : 4);

/* 세트 슬롯 도장판 — 8개 슬롯, 해당 카테고리 장비가 있으면 불 들어옴 */
const SET_SLOTS = [
  { slugs: ["backpacking-tent","auto-tent","shelter","tarp"], icon: "⛺", label: "텐트" },
  { slugs: ["sleeping-bag"], icon: "🛌", label: "침낭" },
  { slugs: ["mat","cot"], icon: "🧘", label: "매트" },
  { slugs: ["burner"], icon: "🔥", label: "버너" },
  { slugs: ["cookware"], icon: "🍳", label: "코펠" },
  { slugs: ["chair"], icon: "🪑", label: "의자" },
  { slugs: ["table"], icon: "🪵", label: "테이블" },
  { slugs: ["lantern"], icon: "🔦", label: "랜턴" },
  { slugs: ["backpacking-bag"], icon: "🎒", label: "가방" },
];

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
  "백패킹텐트": "⛺", "오토캠핑텐트": "🏕️", "쉘터": "🏖️", "기타용품": "🧰", "침낭": "🛌", "매트": "🧘",
  "의자": "🪑", "랜턴": "🔦", "아이스박스": "🧊", "버너": "🍳", "타프": "⛱️",
  "테이블": "🪵", "야전침대": "🛏️", "코펠": "🥘", "웨건": "🛒", "화로대": "🔥", "파워뱅크": "🔋",
  "백패킹 가방": "🎒",
};
const catIcon = name => CAT_ICON[name] || "🏕️";
/* 카테고리별 옅은 배경 톤(아이콘 타일 — 단색 회색 대신 생동감) */
const CAT_TINT = {
  "백패킹텐트": "#eaf4ec", "오토캠핑텐트": "#eaf4ec", "쉘터": "#eaf4ec", "기타용품": "#f0f0f2", "타프": "#e6f4f7",
  "침낭": "#eef0fb", "매트": "#eef0fb", "야전침대": "#eef0fb", "아이스박스": "#e6f4f7",
  "의자": "#f6efe7", "테이블": "#f6efe7", "웨건": "#f6efe7",
  "버너": "#fdeee7", "화로대": "#fdeee7", "코펠": "#fdeee7",
  "랜턴": "#fdf6e0", "파워뱅크": "#fdf6e0",
  "백패킹 가방": "#eaf4ec",
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
const priceRange = (a, b) => a == null ? '<span class="nd">가격없음</span>' : won(a);
// FE-ITEM-05: 표시가는 price_min(최저가) 기준 — 실제 쿠팡가와 다를 수 있어 가격 옆 '최저가 기준' 캡션을 일관 부착.
const PRICE_BASIS_CAP = '<span class="price-basis">최저가 기준</span>';
// 가격 + 캡션. 값 없으면 캡션 없이 nullHtml(곳마다 '가격없음'/'—' 등) 반환(AC4).
const priceLabeled = (n, nullHtml = '<span class="nd">가격없음</span>') =>
  n == null ? nullHtml : won(n) + PRICE_BASIS_CAP;

/* 값 표시: 무게(g) 1000↑ → kg, 부피(cm3) 1000↑ → L 환산 */
const _UNIT_DISPLAY = { C: "°C", m2: "m²" };  // L-17: JSON 데이터 단위 → 표시 문자 매핑
function fmtVal(v, unit) {
  if (v == null) return "—";
  if (unit === "g" && v >= 1000) return +(v / 1000).toFixed(2) + "kg";
  if (unit === "cm3" && v >= 1000) return +(v / 1000).toFixed(1) + "L";
  return (+v.toFixed(2)) + (_UNIT_DISPLAY[unit] || unit || "");
}

function stars(n) {
  if (n == null) return '<span class="nd">—</span>';
  let h = "", full = Math.floor(n), half = (n - full) >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) h += "★";
    else if (i === full && half) h += "◐";
    else h += '<span class="e">★</span>';
  }
  // role=img + aria-label로 별점을 하나의 그래픽으로 노출 — 개별 별(빈 별 포함)은
  // AT에서 숨겨져 "별 5개"로 오독되지 않고 "별점 N / 5"로 정확히 읽힌다 (M-48)
  return `<span class="stars" role="img" aria-label="별점 ${n} / 5" title="★${n}">${h}</span>`;
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
const _THUMB_SZ = {"pli-thumb":74,"sres-thumb":34,"cmp-thumb":70};  // L-50: CLS 방지용 명시적 크기
function thumbCell(img, name, tint, icon, imgCls, noCls) {
  imgCls = imgCls || "pli-thumb"; noCls = noCls || "pli-noimg";
  if (!img) return `<div class="${noCls}" style="background:${tint}">${icon}<span>이미지 준비중</span></div>`;
  const sz = _THUMB_SZ[imgCls]; const szAttr = sz ? ` width="${sz}" height="${sz}"` : "";
  return `<img class="${imgCls}" src="${esc(img)}" alt="${esc(name)}" loading="lazy"${szAttr}` +
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
function setWish(a) {
  try { localStorage.setItem("wish", JSON.stringify(a)); } catch (e) { /* 저장공간 부족 시 로컬 동작만 */ }
  // 로그인 상태에서 account 페이지가 등록한 훅이 있으면 원격 동기화. 없으면 로컬만(오프라인 우선).
  if (typeof window !== "undefined" && typeof window.onWishChange === "function") {
    try { window.onWishChange(a); } catch (e) { /* 동기화 실패는 로컬 동작 막지 않음 */ }
  }
}
function wishKey(b, m, cap) { return [b, m, cap == null ? "" : cap].join("|"); }
// 찜 버튼 아이콘 — 북마크(채움 여부는 버튼 .on 클래스 + CSS가 처리)
const BOOKMARK_SVG = '<svg class="wish-ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>';
const SHARE_SVG = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
function inWish(key) { return getWish().some(x => x.key === key); }
function toggleWish(item) {   // 반환: 추가됐으면 true, 해제됐으면 false
  const a = getWish(), i = a.findIndex(x => x.key === item.key);
  if (i >= 0) a.splice(i, 1); else a.push(item);
  setWish(a);
  return i < 0;
}
// 비로그인 상태에서 처음 찜 추가 시 1회 로그인 유도 토스트
function _showWishLoginHint() {
  if (window._accUser || sessionStorage.getItem("wish-login-hint")) return;
  sessionStorage.setItem("wish-login-hint", "1");
  const msg = `🔖 찜 목록은 로그인하면 기기 간 동기화돼요 &nbsp;<a href="account.html" style="color:#fff;text-decoration:underline;font-weight:700">로그인</a>`;
  showToast(msg, 4000, true);
}
function toggleWishWithHint(item, btn) {
  const added = toggleWish(item);
  if (added) _showWishLoginHint();
  if (btn) { btn.classList.toggle("on", added); btn.setAttribute("aria-pressed", String(added)); }
  return added;
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
function showToast(msg, duration, isHtml) {
  let t = document.getElementById("app-toast");
  if (!t) {
    t = document.createElement("div"); t.id = "app-toast";
    t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--txt);color:var(--bg);padding:10px 18px;border-radius:99px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:opacity .2s,transform .2s;white-space:nowrap;max-width:90vw;text-align:center";
    document.body.appendChild(t);
  }
  clearTimeout(t._tid);
  if (isHtml) { t.innerHTML = msg; t.style.pointerEvents = "auto"; }
  else { t.textContent = msg; t.style.pointerEvents = "none"; }
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
  t._tid = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)"; }, duration || 2400);
}
function newSet(title) {
  const s = { id: Date.now().toString(36), title, style: "", items: [], created_at: new Date().toISOString() };
  const a = getSets(); a.unshift(s); saveSets(a); return s;
}
function addToSet(setId, item) {
  const a = getSets(), s = a.find(x => x.id === setId);
  if (!s) return;
  const i = s.items.findIndex(x => x.pcode === item.pcode);
  if (i >= 0) { const cur = s.items[i].qty || 1; if (cur < qtyMax(s.items[i].s)) s.items[i].qty = cur + 1; }
  else s.items.push({ ...item, qty: 1 });
  saveSets(a);
}
function setItem(m, slug) {
  return { pcode: wishKey(m.brand, m.model, m.capacity), b: m.brand, m: m.model,
           cap: m.capacity, s: slug, p: m.price_min, img: m.img,
           weight_g: m.specs?.weight?.value ?? null,
           coupang_url: m.coupang_url ?? null };   // FE-WISH-07: 세트 표 항목별 구매 버튼용
}

function openSetModal(item) {
  let modal = document.getElementById("set-modal");
  if (!modal) {
    modal = document.createElement("div"); modal.id = "set-modal"; modal.className = "pmodal";  // L-112: dialog role은 내부 .pmbox에만
    document.body.appendChild(modal);
  }
  const sets = getSets();
  const setListHtml = sets.length
    ? sets.map(s => `<button class="sm-set-btn" data-sid="${s.id}">
        <span class="sm-set-name">${esc(s.title)}</span>
        <span class="sm-set-cnt">${s.items.length}개 장비</span></button>`).join("")
    : `<div class="sm-empty">저장된 세트가 없어요</div>`;
  modal.innerHTML = `<div class="pmbox sm-box" role="dialog" aria-modal="true">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <div class="sm-head">
      <div class="sm-title">장비 꾸러미에 담기</div>
      <div class="sm-item">${esc(item.b)} ${esc(item.m)}</div>
    </div>
    <div class="sm-list">${setListHtml}</div>
    <div class="sm-new">
      <input class="sm-input" type="text" placeholder="새 세트 이름 입력" maxlength="40">
      <button class="sm-create">만들기</button>
    </div></div>`;
  modal.classList.add("on");
  const prevFocus = document.activeElement;   // L-143: 닫을 때 포커스 복귀
  const close = () => { modal.classList.remove("on"); document.removeEventListener("keydown", onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); };
  const onKey = e => { if (e.key === "Escape") close(); };   // L-106: ESC 닫기
  document.addEventListener("keydown", onKey);
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  modal.querySelectorAll(".sm-set-btn").forEach(btn => btn.onclick = () => {
    addToSet(btn.dataset.sid, item);
    btn.textContent = "✓ 추가됨"; btn.disabled = true;
    setTimeout(() => { close(); showSetConfirm(btn.dataset.sid); }, 400);
  });
  const inp = modal.querySelector(".sm-input");
  modal.querySelector(".sm-create").onclick = () => {
    const t = inp.value.trim(); if (!t) { inp.focus(); return; }
    const s = newSet(t); addToSet(s.id, item);
    close(); showSetConfirm(s.id);
  };
  inp.onkeydown = e => { if (e.key === "Enter") modal.querySelector(".sm-create").click(); };
  modal.querySelector(".pmx").focus();
}

/* FE-WISH-05/06 — 장비 꾸러미 담기 직후 '2~3초 자동소멸 확인 카드' + '꾸러미 보기' 확인 루트.
   순수 프론트(app.js+style.css). 확인 루트는 openSetDetail(인덱스)로 어느 페이지·로그인 상태에서도
   세트 내용을 모달로 열람 보장(account 세트 섹션은 비로그인 시 숨겨지므로 페이지 이동에 의존하지 않음). */
function showSetConfirm(setId) {
  const sets = getSets();
  const s = sets.find(x => x.id === setId);
  if (!s) return;
  const tw = s.items.reduce((sum, x) => x.weight_g != null ? sum + x.weight_g * (x.qty || 1) : sum, 0);
  const tp = s.items.reduce((sum, x) => sum + (x.p || 0) * (x.qty || 1), 0);
  const wStr = tw >= 1000 ? `${(tw / 1000).toFixed(1)}kg` : tw > 0 ? `${tw}g` : null;
  const pStr = tp > 0 ? `${tp.toLocaleString()}원` : null;
  const meta = [`${s.items.length}개 장비`, wStr && `⚖️ ${wStr}`, pStr && `💰 ${pStr}`].filter(Boolean).join(" · ");

  let card = document.getElementById("set-added-card");
  if (!card) {
    card = document.createElement("div");
    card.id = "set-added-card";
    card.className = "set-added-card";
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");
    document.body.appendChild(card);
  }
  clearTimeout(card._tid);
  card.innerHTML = `
    <div class="sac-body">
      <div class="sac-text">
        <div class="sac-title">🎒 <b>${esc(s.title)}</b>에 담았어요</div>
        <div class="sac-meta">${esc(meta)}</div>
      </div>
      <button type="button" class="sac-close" aria-label="확인 닫기">✕</button>
    </div>
    <div class="sac-actions"><button type="button" class="sac-view">꾸러미 보기 ›</button></div>
    <div class="sac-bar" aria-hidden="true"><i></i></div>`;

  const DUR = 2500; // 2~3초 자동소멸(AC1)
  const dismiss = () => { clearTimeout(card._tid); card.classList.remove("on"); };
  const startTimer = () => { clearTimeout(card._tid); card._tid = setTimeout(dismiss, DUR); };

  card.querySelector(".sac-close").onclick = dismiss;
  card.querySelector(".sac-view").onclick = () => {     // AC2: 한 번의 액션으로 방금 담은 꾸러미 내용 열람
    dismiss();
    const idx = getSets().findIndex(x => x.id === setId);
    if (idx >= 0) openSetDetail(idx);
  };
  // 사용자가 카드 위에 머무는 동안엔 자동소멸 일시정지(버튼 누르려는 중 사라짐 방지). 무조작 시엔 그대로 소멸.
  card.onpointerenter = () => clearTimeout(card._tid);
  card.onpointerleave = startTimer;

  card.classList.add("on");
  const bar = card.querySelector(".sac-bar > i");
  if (bar) {
    bar.style.transition = "none"; bar.style.transform = "scaleX(1)";
    requestAnimationFrame(() => { bar.style.transition = `transform ${DUR}ms linear`; bar.style.transform = "scaleX(0)"; });
  }
  startTimer();
}

/* 최근 본 상품 — 상세 모달 열 때 기록. 최신순, 중복 제거, 최대 12개. */
function getRecent() { try { return JSON.parse(localStorage.getItem("recent") || "[]"); } catch (e) { return []; } }
function pushRecent(item) {
  if (!item.s) return;   // 슬러그 없으면(되돌아갈 경로 불명) 기록 생략
  const a = getRecent().filter(x => x.key !== item.key);
  a.unshift(item);
  try { localStorage.setItem("recent", JSON.stringify(a.slice(0, 12))); } catch (e) { /* 저장공간 부족 시 무시 */ }
}

/* ── 내비게이션 정책(2026-06) ────────────────────────────────────────────────
   GNB(홈·탐색·커뮤·마이 상/하단 탭바)는 '아카이브'. 복구하려면 GNB_ENABLED=true.
   · 탐색: 홈 검색과 기능 중복 → 제외
   · 커뮤니티: 버그 다수로 임시 숨김 → COMMUNITY_ENABLED=false (복구 시 true)
   · 마이: 헤더 우상단 아이콘으로 상시 노출(GNB 대체)
   탭 정의(TABS)·하단바(.bottom-nav)는 복구 대비 코드만 보존하고 플래그로 비활성. */
const GNB_ENABLED = false;        // GNB(상/하단 탭바) 아카이브 — 복구하려면 true
const COMMUNITY_ENABLED = false;  // 커뮤니티 임시 숨김(버그 다수) — 복구하려면 true
const COMPARE_ENABLED = false;    // 스펙 비교 기능(⚖ 카드버튼·비교바·비교모달) 아카이브(2026-06-12) — 복구하려면 true. 코드(toggleCmp·updateCmpBar·openCmpModal)는 보존

// href는 루트 기준 절대경로(H-38): 상세 페이지(/item/{cat}/item-N.html, 2단계 하위)에서도
// 상대경로 404 없이 동작. 모바일 .bottom-nav와 동일 규칙.
const TABS = [
  { href: "/index.html", icon: "📊", label: "홈", match: ["index.html", ""] },
  // 탐색 탭(H-37): 데스크톱에도 카테고리 탐색 진입 경로 추가(모바일 .bottom-nav와 일치)
  { href: "/category.html", icon: "🧭", label: "탐색", match: ["category.html", "brand.html", "recommend.html"] },
  { href: "/community.html", icon: "💬", label: "커뮤니티", match: ["community.html"] },
  { href: "/account.html", icon: "👤", label: "내 정보", match: ["account.html"] },
];
window.addEventListener("DOMContentLoaded", () => {
  const here = (location.pathname.split("/").pop() || "").toLowerCase();

  // 데스크톱 상단 탭바(GNB) — 아카이브: 플래그 켤 때만 주입
  if (GNB_ENABLED && !document.querySelector(".tabbar")) {
    const nav = document.createElement("nav");
    nav.className = "tabbar";
    nav.setAttribute("aria-label", "주 내비게이션");  // M-17
    nav.innerHTML = `<div class="wrap tabbar-in">` + TABS
      .filter(t => COMMUNITY_ENABLED || t.href !== "/community.html")
      .map(t => {
        const on = t.match.includes(here);
        return `<a class="tab${on ? " on" : ""}" href="${t.href}"${on ? ' aria-current="page"' : ""}>` +
          `<span class="ti">${t.icon}</span><span class="tl">${t.label}</span></a>`;
      }).join("") + `</div>`;
    const header = document.querySelector("header.top");
    if (header) header.insertAdjacentElement("afterend", nav);
    else document.body.prepend(nav);
  }

  // '마이' 아이콘 — 헤더 우상단 상시 노출(GNB 대체).
  // 대부분 페이지는 HTML에 .header-acct(👤)가 하드코딩돼 있음 → 그대로 사용(중복 주입 금지).
  // 누락 페이지(account/terms/privacy/404 등)에만 동일 모양으로 주입해 전 페이지 일관 노출.
  const hwrap = document.querySelector("header.top .wrap");
  if (hwrap && !hwrap.querySelector(".header-acct")) {
    const a = document.createElement("a");
    a.className = "header-acct";
    a.href = "/account.html";
    a.setAttribute("aria-label", "내 계정");
    a.title = "내 계정";
    if (here === "account.html") a.setAttribute("aria-current", "page");
    a.textContent = "👤";
    hwrap.appendChild(a);
  }

  // 커뮤니티 임시 숨김(버그 다수): HTML에 하드코딩된 커뮤니티 진입 링크 일괄 제거.
  // 상세페이지의 .item-log-btn(📝 커뮤니티 장비 로그 작성) 등. 복구는 COMMUNITY_ENABLED=true.
  // community.html 자체는 직접 URL 접근 시 디버깅용으로 동작하도록 그 페이지에선 제거하지 않음.
  if (!COMMUNITY_ENABLED && here !== "community.html") {
    document.querySelectorAll('a[href*="community.html"], .item-log-btn').forEach(el => el.remove());
  }
});

/* 공통: 카테고리 네비게이션 바 (어느 카테고리든 직접 이동) */
async function renderCatNav(activeSlug) {
  const el = document.getElementById("catnav");
  if (!el) return;
  try {
    const m = await getJSON("data/manifest.json");
    el.innerHTML = m.categories.map(c =>
      `<a class="navchip${c.slug === activeSlug ? " on" : ""}"${c.slug === activeSlug ? ' aria-current="page"' : ""} href="category.html?cat=${c.slug}"
         title="${c.name}"><span class="ni">${catIcon(c.name)}</span>${c.name}${OPS ? `<i>${GRADE_CLASS[c.grade] || ""}</i>` : ""}</a>`).join("");
  } catch (e) { /* noop */ }
}

/* ---------- 허브 ---------- */
async function renderHub() {
  let m;
  try { m = await getJSON("data/manifest.json"); }
  catch (e) { document.getElementById("lead").textContent = "데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요."; return; }
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
      ib.querySelector(".ix").onclick = () => {
        try { localStorage.setItem("seenIntro", "1"); } catch (e) {}
        const nextFocus = document.querySelector("main h1") || document.getElementById("homeq");  // L-127: 닫기 후 포커스 복귀(body 이탈 방지)
        ib.remove();
        if (nextFocus) { if (!nextFocus.hasAttribute("tabindex")) nextFocus.setAttribute("tabindex", "-1"); nextFocus.focus(); }
      };
    }
  }

  // L-110: 계정 삭제 완료 후 리다이렉트 메시지
  if (new URLSearchParams(location.search).get('account_deleted') === '1') {
    showToast('계정이 삭제됐어요. 이용해 주셔서 감사합니다.', 5000);
    history.replaceState(null, '', location.pathname);
  }

  renderRecent();   // 최근 본 상품(있으면)
  renderHotSection(m.categories);   // 이번 주 인기

  // 캠핑 스타일 추천 진입 — 클릭 시 카테고리+필터 직접 이동
  const PERSONA_CAT = {
    backpacker: { cat: "backpacking-tent", sort: "weight_min", sa: "1", cap: "2" },
    minimal:    { cat: "tarp",             sort: "weight_min", sa: "1" },
    auto:       { cat: "auto-tent",        sort: "floor_area", sa: "0", cap: "4" },
    // family: recommend.html?p=family 로 연결 (PERSONA_CAT에서 제외 시 fallback 사용, M-100)
  };
  const pel = document.getElementById("personas");
  if (pel) pel.innerHTML = PERSONAS.map(p => {
    const pc = PERSONA_CAT[p.key];
    let url;
    if (pc) {
      const u = new URLSearchParams({ cat: pc.cat });
      if (pc.sort) { u.set("sort", "spec:" + pc.sort); u.set("sa", pc.sa || "0"); }
      if (pc.cap)  u.set("cap", pc.cap);
      url = `category.html?${u.toString()}`;
    } else {
      url = `recommend.html?p=${p.key}`;
    }
    return `<a class="pcard" href="${url}">
       <span class="pe">${p.emoji}</span>
       <span class="pn">${p.name}</span>
       <span class="pt">${p.tagline}</span></a>`;
  }).join("");

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
  document.getElementById("foot").innerHTML = (OPS
    ? `운영자 모드 · 자동생성 LIMITS 기반 · 측정값만 · 추측 없음.`
    : `같은 그룹 안에서 순위로 환산한 별점 · 측정값 기반. <span class="disc">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>`) + LEGAL_LINKS;
}

// L-48: 오타 제안용 편집거리(Levenshtein) — 짧은 검색어 한정으로 가벼움
function _lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}
// L-48: 브랜드 목록 중 입력어와 편집거리 1~2 이내 가장 가까운 브랜드 1개
function _closestBrand(q, brands) {
  const ql = q.toLowerCase();
  let best = null, bestD = Infinity;
  for (const b of brands) {
    const bl = b.toLowerCase();
    if (bl.includes(ql) || ql.includes(bl)) return null;  // 부분일치는 오타 아님 → 제안 안 함
    const d = _lev(ql, bl);
    if (d < bestD) { bestD = d; best = b; }
  }
  // 길이에 비례한 허용 오차(짧은 단어는 1, 길면 2)
  const tol = ql.length <= 3 ? 1 : 2;
  return bestD <= tol ? best : null;
}

// M-70: 브랜드 영문 별칭 — 인덱스가 한글 음차만 포함해 "Helinox" 등 영문 검색이 0건이던 문제.
// 값은 소문자 영문(공백구분 변형 허용). 검색 시 브랜드 한글명에 이 별칭을 합쳐 매칭한다.
const BRAND_ALIAS = {
  "코베아":"kovea","네이처하이크":"naturehike","카즈미":"kazmi","씨투써밋":"sea to summit seatosummit",
  "그레고리":"gregory","컬럼비아":"columbia","오스프리":"osprey","노스페이스":"the north face northface tnf",
  "콜맨":"coleman","반고":"vango","니모이큅먼트":"nemo equipment","블랙야크":"blackyak","스노우피크":"snow peak snowpeak",
  "스노우라인":"snowline","미니멀웍스":"minimal works minimalworks","몽벨":"montbell mont-bell","헬리녹스":"helinox",
  "캠핑문":"camping moon campingmoon","밀레":"millet","노마드":"nomad","써미트":"summit","메사":"mesa","썬터치":"suntouch",
  "레드렌서":"ledlenser","노스피크":"north peak northpeak","폴라리스":"polaris","시마노":"shimano","도이터":"deuter",
  "피엘라벤":"fjallraven fjall raven","백컨트리":"backcountry","코오롱스포츠":"kolon sport kolonsport","블랙독":"blackdog black dog",
  "스탠리":"stanley","제드코리아":"zed","써머레스트":"thermarest therm-a-rest","바낙스":"banax","티에라":"tierra",
  "헬스포츠":"helsport","마운틴이큅먼트":"mountain equipment mountainequipment","이와타니":"iwatani","지라프":"giraffe",
  "에코플로우":"ecoflow","소토":"soto","듀랑고":"durango","힐레베르그":"hilleberg","이글루":"igloo","캡스톤":"capstone",
  "마무트":"mammut","로고스":"logos","모비가든":"mobi garden mobigarden","노르디스크":"nordisk","마운티아":"mountia",
  "필립스":"philips","아크테릭스":"arcteryx arc'teryx","밴프":"banff","유니프레임":"uniflame","테라노바":"terra nova terranova",
  "펠리칸":"pelican","오라이트":"olight","헬리콘텍스":"helikon-tex helikon","나이트코어":"nitecore","루메나":"lumena",
  "페닉스":"fenix","빅아그네스":"big agnes bigagnes","살로몬":"salomon","위너웰":"winnerwell","페크론":"pecron",
  "블랙다이아몬드":"black diamond blackdiamond","켈티":"kelty","네파":"nepa","제로그램":"zerogram","잭커리":"jackery",
  "에너자이저":"energizer","아이캠퍼":"ikamper","프로스펙스":"prospecs","인텍스":"intex","캠프타운":"camptown","다이와":"daiwa",
  "샤오미":"xiaomi","페츨":"petzl","아이더":"eider","프리머스":"primus","내셔널지오그래픽":"national geographic natgeo",
  "랩":"rab","데카트론":"decathlon","에버뉴":"evernew","웨버":"weber","페트로막스":"petromax","도메틱":"dometic",
  "골제로":"goal zero goalzero","살레와":"salewa","큐물러스":"cumulus","퀘차":"quechua","몬테인":"montane",
  "킹캠프":"king camp kingcamp","사마야":"samaya","파이어메이플":"fire maple firemaple","마운틴스미스":"mountainsmith",
  "글라스락":"glasslock","예티":"yeti","베스트웨이":"bestway","파이브스타":"five star fivestar","쟈칼":"jackal",
  "스패로우":"sparrow","듀라맥스":"duramax","제스트":"zest","콜핑":"kolping","마운틴하이커":"mountain hiker",
  "도플갱어아웃도어":"doppelganger","캠프365":"camp365","코스모스":"cosmos","아우토반디자인하우스":"autobahn",
  "콜럼버스코리아":"columbus","하이그라운즈":"high grounds highgrounds","몬테라":"montera","스위스마운틴":"swiss mountain",
  "마운트리버":"mount river mountriver","레토":"reto","디노맥스":"dinomax","삼성비즈솔루션":"samsung","리베로":"libero",
};
const _brandAlias = b => BRAND_ALIAS[b] || "";

async function setupHomeSearch() {
  // L-14: search.json(298KB)을 페이지 로드 시점이 아닌 검색창 첫 상호작용(focus·input) 시 지연 로드
  let idx = null, idxLoading = null, _brandList = null;
  const brandList = () => _brandList || (_brandList = [...new Set((idx || []).map(x => x.b))]);
  const ensureIdx = () => {
    if (idx) return Promise.resolve(idx);
    if (!idxLoading) idxLoading = getJSON("data/search.json?v=2cd7b927").then(d => (idx = d)).catch(() => (idx = []));
    return idxLoading;
  };
  const inp = document.getElementById("homeq"), box = document.getElementById("homeres");
  if (!inp || !box) return;
  // WAI-ARIA combobox 패턴 (H-17) — 입력창/목록에 역할·상태 부여
  inp.setAttribute("role", "combobox");
  inp.setAttribute("aria-autocomplete", "list");
  inp.setAttribute("aria-haspopup", "listbox");
  inp.setAttribute("aria-controls", "homeres");
  inp.setAttribute("aria-expanded", "false");
  inp.setAttribute("aria-label", "장비 검색");  // M-14
  box.setAttribute("role", "listbox");
  box.setAttribute("aria-label", "검색 자동완성 결과");
  // M-80: 스크린리더 결과 고지용 SR 전용 영역
  let srStatus = document.getElementById("homeq-sr-status");
  if (!srStatus) {
    srStatus = document.createElement("span");
    srStatus.id = "homeq-sr-status";
    srStatus.setAttribute("aria-live", "polite");
    srStatus.setAttribute("aria-atomic", "true");
    srStatus.style.cssText = "position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden";
    inp.parentNode.appendChild(srStatus);
  }
  // M-26: 커스텀 초기화 버튼 (iOS Safari 등 네이티브 X 버튼 없는 환경 대응)
  let clearBtn = document.getElementById("homeq-clear");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "homeq-clear";
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", "검색어 지우기");
    clearBtn.style.cssText = "display:none;position:absolute;right:10px;top:50%;transform:translateY(-50%);width:20px;height:20px;border:0;background:none;cursor:pointer;font-size:14px;color:var(--muted);padding:0;line-height:1";
    clearBtn.textContent = "✕";
    const wrap = inp.parentNode;
    if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
    wrap.appendChild(clearBtn);
  }
  const syncClearBtn = () => { clearBtn.style.display = inp.value ? "block" : "none"; };
  let opts = [], active = -1;   // 키보드 탐색 대상(선택 가능한 항목)과 현재 활성 인덱스
  const closeBox = () => {
    box.innerHTML = ""; box.style.display = "none";
    opts = []; active = -1;
    inp.setAttribute("aria-expanded", "false");
    inp.removeAttribute("aria-activedescendant");
  };
  const setActive = i => {
    if (!opts.length) return;
    if (active >= 0 && opts[active]) { opts[active].classList.remove("sres-active"); opts[active].setAttribute("aria-selected", "false"); }
    active = (i + opts.length) % opts.length;   // 순환
    const el = opts[active];
    el.classList.add("sres-active"); el.setAttribute("aria-selected", "true");
    inp.setAttribute("aria-activedescendant", el.id);
    el.scrollIntoView({ block: "nearest" });
  };
  const run = () => {
    syncClearBtn();
    const q = inp.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) { closeBox(); return; }
    if (!idx) { ensureIdx().then(run); return; }  // L-14: 인덱스 미로드 시 로드 후 재실행
    // 브랜드 단위 매치 — 첫 번째 토큰으로 브랜드 히트, 전체 토큰 AND로 상품 히트
    const bcount = {};
    idx.forEach(x => { if (terms[0] && (x.b.toLowerCase().includes(terms[0]) || _brandAlias(x.b).includes(terms[0]))) bcount[x.b] = (bcount[x.b] || 0) + 1; });  // M-70: 영문 별칭 매칭
    const brandHits = Object.entries(bcount).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const q1 = terms.join(" ");
    const hits = idx.filter(x => { const text = (x.b + " " + x.m + " " + _brandAlias(x.b)).toLowerCase(); return terms.every(t => text.includes(t)); })  // M-70: 브랜드 영문 별칭 포함
      .sort((a, b) => {  // L-46: 정확 일치 → 접두어 → 부분 포함 순
        const am = a.m.toLowerCase(), bm = b.m.toLowerCase();
        const ae = am === q1, be = bm === q1, ap = am.startsWith(q1), bp = bm.startsWith(q1);
        return (be - ae) || (bp - ap);
      })
      .slice(0, 30);
    box.style.display = "block";
    const brandHtml = brandHits.map(([b, n]) =>
      `<a class="sres sbrand" href="brand.html?b=${encodeURIComponent(b)}">
         <span class="sb">${esc(b)}</span> <b>전체 ${n}개</b> 모아보기
         <span class="scat">브랜드 →</span></a>`).join("");
    // M-24: 검색어 하이라이트 헬퍼
    const hlText = (text, tms) => {
      if (!tms.length) return esc(text);
      const re = new RegExp(`(${tms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
      return esc(text).replace(re, `<mark class="shl">$1</mark>`);
    };
    // L-48: 결과·브랜드 매치 모두 없을 때 가장 가까운 브랜드 오타 제안
    let sugHtml = "";
    if (!hits.length && !brandHits.length && q1.length >= 2) {
      const sug = _closestBrand(q1, brandList());
      if (sug) sugHtml = `<a class="sres sres-suggest" href="brand.html?b=${encodeURIComponent(sug)}">혹시 <b>${esc(sug)}</b> 찾으셨나요?</a>`;
    }
    box.innerHTML = (brandHtml || "") + (hits.length ? hits.map((x, i) => {
      const wk = wishKey(x.b, x.m, x.cap || null);
      const wished = inWish(wk);
      return `<div class="sres-wrap">
        <a class="sres" href="category.html?cat=${x.s}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">
          ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "sres-thumb", "sres-noimg")}
          <span class="stxt"><span class="sb">${hlText(x.b, terms)}</span> ${hlText(x.m, terms)}${x.cap ? ` <i>${x.cap}인</i>` : ""}</span>
          <span class="scat">${esc(x.c)}</span></a>
        <button type="button" class="sres-wish${wished ? " on" : ""}" data-hi="${i}" aria-label="찜" aria-pressed="${wished}">${BOOKMARK_SVG}</button>
      </div>`;
    }).join("")
      : (brandHtml ? "" : `<div class="sres nd" role="option" aria-disabled="true">"${esc(inp.value)}" 검색 결과 없음</div>` + sugHtml))
      + (hits.length ? `<div class="sres-footer" role="presentation">${hits.length}개 결과${hits.length >= 30 ? " · 상위 30개" : ""}</div>`
        : (!brandHtml ? `<div class="sres-footer" role="presentation"><a href="category.html" style="color:var(--accent);text-decoration:none">📂 카테고리 탐색하기</a></div>` : ""));  // L-07 · L-117 role=presentation
    // 찜 버튼 이벤트
    box.querySelectorAll(".sres-wish").forEach(btn => {
      btn.onclick = e => {
        e.preventDefault(); e.stopPropagation();
        const x = hits[+btn.dataset.hi];
        const item = { key: wishKey(x.b, x.m, x.cap || null), b: x.b, m: x.m, cap: x.cap || null, s: x.s, p: x.p, img: x.img };
        btn.innerHTML = BOOKMARK_SVG;
        toggleWishWithHint(item, btn);
      };
    });
    // 키보드 탐색 대상 옵션 등록 (브랜드/상품 링크) — role=option·id 부여 (H-17)
    opts = [...box.querySelectorAll("a.sres")];
    active = -1;
    opts.forEach((el, i) => {
      el.id = "homeres-opt-" + i;
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", "false");
    });
    inp.setAttribute("aria-expanded", "true");  // L-86: 결과 없음 div만 있어도 expanded=true 유지
    inp.removeAttribute("aria-activedescendant");
    if (srStatus) srStatus.textContent = hits.length ? `${hits.length}개 결과` : (brandHits.length ? `브랜드 ${brandHits.length}개` : "결과 없음");
    // M-40: URL ?q= 반영 (replaceState — 히스토리 오염 없이 공유 가능)
    const qval = inp.value.trim();
    try { history.replaceState(null, "", qval ? `?q=${encodeURIComponent(qval)}` : location.pathname); } catch (_) {};
  };
  clearBtn.onclick = () => { inp.value = ""; closeBox(); syncClearBtn(); inp.focus(); };
  // 한글 IME 조합 중에는 자동완성을 트리거하지 않고, 조합이 끝나면 1회 실행 (M-49)
  inp.oninput = e => { if (e.isComposing) return; run(); };
  inp.addEventListener("compositionend", run);
  inp.onfocus = () => { ensureIdx(); run(); };  // L-14: 포커스 시 인덱스 선로드(타이핑 전 준비)
  inp.onblur = () => { setTimeout(() => { box.style.display = "none"; inp.setAttribute("aria-expanded", "false"); }, 150); }
  inp.addEventListener("keydown", e => {
    // IME 조합 중 키(특히 조합완료 Enter)는 검색/탐색을 발동시키지 않는다 (M-50)
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Escape") {
      // input[type=search]의 네이티브 Esc=입력값 초기화 동작 차단.
      // Esc는 드롭다운만 닫고 입력값은 유지한다. (H-18)
      e.preventDefault();
      closeBox();
      return;
    }
    // ↓/↑ — 드롭다운 항목 간 이동 (WAI-ARIA combobox, H-17)
    if (e.key === "ArrowDown") {
      if (box.style.display !== "none" && opts.length) { e.preventDefault(); setActive(active + 1); }
      return;
    }
    if (e.key === "ArrowUp") {
      if (box.style.display !== "none" && opts.length) { e.preventDefault(); setActive(active - 1); }
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    // 활성 옵션이 있으면 그 항목으로 이동 (↓로 선택 후 Enter)
    if (active >= 0 && opts[active]) { location.href = opts[active].href; return; }
    const q = inp.value.trim();
    if (!q) {
      // L-06: 빈 입력으로 Enter 시 무반응 → 안내 박스 + 포커스로 피드백 제공
      inp.focus();
      box.innerHTML = `<div class="sres nd" role="option" aria-disabled="true">검색어를 입력해 주세요</div>`;
      box.style.display = "block";
      inp.setAttribute("aria-expanded", "true");
      if (srStatus) srStatus.textContent = "검색어를 입력해 주세요";
      return;
    }
    if (!idx) { ensureIdx().then(run); return; }  // L-14: 미로드 시 로드 후 드롭다운 표시
    // 브랜드명 정확 일치 우선 (H-39): "헬리녹스" 입력 시 brand.html 이동 (모델 매치보다 먼저)
    const ql = q.toLowerCase();
    // M-70: 영문 별칭 정확 일치도 브랜드로 간주 ("helinox" → 헬리녹스)
    const exactBrand = idx.find(x => x.b.toLowerCase() === ql || _brandAlias(x.b).split(" ").includes(ql));
    if (exactBrand) { location.href = `brand.html?b=${encodeURIComponent(exactBrand.b)}`; return; }
    // 카테고리명 정확 일치 (M-94): "침낭" → category.html?cat=sleeping-bag (공백 정규화)
    const catMap = {};
    idx.forEach(x => { if (x.c && x.s) catMap[x.c.replace(/\s/g,"").toLowerCase()] = x.s; });
    const catSlugHit = catMap[ql.replace(/\s/g,"")];
    if (catSlugHit) { location.href = `category.html?cat=${catSlugHit}`; return; }
    // 첫 번째 모델 매치의 카테고리 슬러그로 이동 (드롭다운과 동일한 토큰 AND 매칭, M-111)
    const terms2 = ql.split(/\s+/).filter(Boolean);
    const first = idx.find(x => { const t = (x.b + " " + x.m).toLowerCase(); return terms2.every(tok => t.includes(tok)); });  // (한글 q만 category로 — 영문 브랜드는 아래 brandMatch가 brand.html로)
    if (first) {
      location.href = `category.html?cat=${first.s}&q=${encodeURIComponent(q)}`;
    } else {
      // 부분 브랜드 매치면 brand 페이지
      const brandMatch = idx.find(x => x.b.toLowerCase().includes(ql) || _brandAlias(x.b).includes(ql));  // M-70
      if (brandMatch) {
        location.href = `brand.html?b=${encodeURIComponent(brandMatch.b)}`;
      } else {
        // L-61: 일치 결과 없음 — "결과 없음" 박스 열어 피드백 표시
        // L-48: 오타로 추정되면 가장 가까운 브랜드 제안 동봉
        const sug = _closestBrand(q, brandList());
        const sugHtml = sug ? `<a class="sres sres-suggest" href="brand.html?b=${encodeURIComponent(sug)}">혹시 <b>${esc(sug)}</b> 찾으셨나요?</a>` : "";
        box.innerHTML = `<div class="sres nd" role="option" aria-disabled="true">"${esc(q)}" 검색 결과 없음</div>` + sugHtml;
        box.style.display = "block";
        inp.setAttribute("aria-expanded", "true");
        if (srStatus) srStatus.textContent = sug ? `결과 없음, ${sug} 제안` : "결과 없음";
      }
    }
  });
  // URL ?q= 파라미터 복원 — 공유 링크 접근 시 검색창 pre-fill (M-62)
  const initQ = new URLSearchParams(location.search).get("q");
  if (initQ) { inp.value = initQ; run(); }
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
  // 항상 category.html?cat= 형식 유지(클린 경로는 GitHub Pages에서 자산 404 → 사용 안 함)
  const qs = p.toString();
  const base = location.pathname.endsWith("/category.html") ? location.pathname : "category.html";
  history.replaceState(null, "", `${base}?cat=${STATE.slug}${qs ? "&" + qs : ""}`);
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
  if (validSort) {
    STATE.sortKey = srt;
    // sa 파라미터가 있으면 그대로, 없으면 정렬키의 자연 기본방향을 적용 (M-59)
    // (sa 없는 공유 URL이 비싼것부터 등 역방향으로 뒤집히던 문제 — applySort와 동일 규칙)
    STATE.sortAsc = params.has("sa") ? params.get("sa") === "1"
      : (srt === "value" ? false : defaultAsc(srt));
  }
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
      `<button class="sc-chip${STATE.campStyle === s.key ? " on" : ""}" data-style="${s.key}" aria-pressed="${STATE.campStyle === s.key}">${s.icon} ${s.label}</button>`
    ).join("") +
    `</div><div class="sc-tip" id="sc-tip-text">${STATE.campStyle ? (STYLE_TIPS[STATE.campStyle]?.tip || "") : ""}</div>`;
  el.style.display = "block";
  el.querySelectorAll(".sc-chip").forEach(btn => btn.onclick = () => {
    const sk = btn.dataset.style;
    STATE.campStyle = STATE.campStyle === sk ? "" : sk;
    el.querySelectorAll(".sc-chip").forEach(b => { const on = b.dataset.style === STATE.campStyle; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });  // L-120
    const tipEl = document.getElementById("sc-tip-text");
    if (tipEl) tipEl.textContent = STATE.campStyle ? (STYLE_TIPS[STATE.campStyle]?.tip || "") : "";
    applyStyleSort(d);
    syncFilterUI();                  // 정렬 드롭다운 UI 동기화 (M-102)
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

/* 탐색 랜딩 — cat= 없이 진입(GNB '탐색') 시 검색창 + 전체 카테고리 그리드 */
async function renderBrowse() {
  let m;
  try { m = await getJSON("data/manifest.json"); }
  catch (e) { document.getElementById("title").textContent = "데이터를 불러오지 못했습니다."; return; }
  document.title = "탐색 — 장비의 숲";
  const crumb = document.getElementById("crumbName"); if (crumb) crumb.textContent = "탐색";
  document.getElementById("title").textContent = "무엇을 찾으세요?";
  const lead = document.getElementById("lead");
  if (lead) lead.innerHTML = `<b>${m.categories.reduce((s,c)=>s+(c.count||0),0).toLocaleString()}개</b> 모델 · ${m.categories.length}개 카테고리`;
  // 상단 검색창(홈 검색과 동일 동작) — 카테고리 내 검색용 #q 입력은 숨김
  const tb = document.querySelector(".toolbar"); if (tb) tb.style.display = "none";
  const sc = document.getElementById("sortchips"); if (sc) sc.innerHTML = "";
  // M-115: 탐색 랜딩에서 cat-aside(사이드바) 숨김 — 카테고리 없으면 220px 빈 공간 생김
  const aside = document.getElementById("cat-aside"); if (aside) aside.style.display = "none";
  // 카테고리 그리드를 #list에 렌더(홈과 동일 카드)
  const list = document.getElementById("list");
  list.className = "grid";
  list.innerHTML = m.categories.map(c => `
    <a class="card" href="category.html?cat=${c.slug}">
      <div class="icon" style="background:${catTint(c.name)}">${catIcon(c.name)}</div>
      <div class="ct"><h3>${c.name}</h3>${OPS ? gradeBadge(c.grade) : ""}</div>
      <div class="meta">${c.count.toLocaleString()}개 모델</div>
    </a>`).join("");
  renderCatNav("");
}

async function renderCategory() {
  renderCategorySkeleton();
  const params = new URLSearchParams(location.search);
  // 클린 URL /category/{slug} 또는 ?cat= 파라미터 두 방식 모두 지원
  const pathMatch = location.pathname.match(/^\/category\/([a-z0-9-]+)/i);
  // 슬러그는 소문자로 정규화 (M-58): cat=Backpacking-Tent 같은 대문자 URL도 data/backpacking-tent.json 로드
  const slug = (params.get("cat") || (pathMatch && pathMatch[1]) || "").toLowerCase() || null;
  // cat= 없이 진입 → 탐색 랜딩(카테고리 그리드)
  if (!slug) { return renderBrowse(); }
  let d;
  try { d = await getJSON(`data/${slug}.json`); }
  catch (e) {
    // 데이터 로드 실패 — 스켈레톤 잔존(H-05) 및 오류 메시지·스켈레톤 동시 노출(H-15) 방지.
    // 목록을 비우고 단일 에러 상태 + 복구 경로를 표시한다.
    document.getElementById("title").textContent = "카테고리를 불러오지 못했습니다.";
    const crumbEl = document.getElementById("crumbName"); if (crumbEl) crumbEl.textContent = slug || "카테고리";
    const listEl = document.getElementById("list");
    if (listEl) listEl.innerHTML =
      `<div class="cat-error" role="alert">
         <p class="cat-error-t">데이터를 불러오지 못했어요.</p>
         <p class="nd">잠시 후 다시 시도하거나 다른 카테고리를 둘러보세요.</p>
         <a class="cat-error-link" href="category.html">전체 카테고리 보기 ›</a>
       </div>`;
    const tbEl = document.querySelector(".toolbar"); if (tbEl) tbEl.style.display = "none";
    const scEl = document.getElementById("sortchips"); if (scEl) scEl.innerHTML = "";
    return;
  }
  const rawQ = params.get("q") || "";   // 홈검색 링크의 q(대문자 포함 가능)
  STATE = { data: d, slug: slug, q: rawQ.toLowerCase(), cap: "", brands: new Set(), range: {}, qExclude: false,
            sortKey: null, sortAsc: false, campStyle: "",
            dir: Object.fromEntries(d.metrics.map(m => [m.key, m.direction])),
            unit: Object.fromEntries(d.metrics.map(m => [m.key, m.unit])) };
  // 비교 세트는 카테고리 데이터에 종속 — 카테고리 진입 시 초기화(M-110: 이전 카테고리 잔존 방지)
  _cmpSet = [];
  const _prevCmpBar = document.getElementById("cmp-bar");
  if (_prevCmpBar) _prevCmpBar.style.display = "none";
  renderCatNav(slug);

  document.getElementById("crumbName").textContent = d.name;
  const shareUrl = `https://gear-forest.com/category.html?cat=${slug}`;
  const shareTitle = `${d.name} 비교 — 장비의 숲`;
  const shareDesc = `${d.count.toLocaleString()}개 모델을 정량 스펙으로 별점 비교. 실측값만 사용합니다.`;
  document.title = shareTitle;
  // OG / Twitter 메타 동적 업데이트 (SNS 공유 미리보기)
  [["og:title", shareTitle], ["og:description", shareDesc], ["og:url", shareUrl],
   ["twitter:title", shareTitle], ["twitter:description", shareDesc]].forEach(([prop, content]) => {
    const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
    if (el) el.setAttribute("content", content);
  });
  const metaDesc = document.querySelector("meta[name=description]");
  if (metaDesc) metaDesc.setAttribute("content", shareDesc);
  const canonEl = document.querySelector("link[rel=canonical]");
  if (canonEl) canonEl.setAttribute("href", shareUrl);
  document.getElementById("title").innerHTML =
    `<span class="titleicon" style="background:${catTint(d.name)}">${catIcon(d.name)}</span>${d.name} ${gradeBadge(d.grade)}`
    + `<button class="share-btn" id="share-btn" aria-label="공유">🔗</button>`;
  document.getElementById("share-btn").onclick = async () => {
    // 현재 필터 상태가 URL에 반영돼 있으므로 location.href 사용 (필터 공유)
    const currentUrl = location.href.replace(/^https?:\/\/localhost:\d+/, "https://gear-forest.com");
    const hasFilter = location.search.length > 1;
    const shareTarget = hasFilter ? currentUrl : shareUrl;
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareTarget }); return; } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(shareTarget);
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
  STATE.hasCap = d.models.some(m => m.capacity != null);
  STATE.sortKey = "spec:" + (star[0] && star[0].key);
  STATE.sortAsc = defaultAsc(STATE.sortKey);   // 주력지표 '좋은 것 먼저'
  restoreState(params);                        // URL의 필터상태 복원(공유링크·뒤로가기)
  // style= 파라미터로 직접 진입·공유 시 명시적 sort가 없으면 스타일 기본 정렬을 적용한다. (H-22 ②)
  if (STATE.campStyle && !params.get("sort")) applyStyleSort(d);
  // 칩 active(.on) 복원은 STATE.campStyle 복원 이후에 그려야 한다. (H-22 ①)
  renderStyleChips(d);
  syncFilterUI();                              // 복원된 STATE를 컨트롤(칩·입력)에 반영
  const qInp = document.getElementById("q");
  if (qInp) {
    qInp.value = params.get("q") || rawQ;
    qInp.setAttribute("aria-label", `${d.name || "카테고리"} 내 모델·브랜드 검색`);
    qInp.setAttribute("role", "searchbox");
    qInp.setAttribute("aria-autocomplete", "list");
    qInp.oninput = e => { if (e.isComposing) return; STATE.q = e.target.value.trim().toLowerCase(); draw(); };  // L-59
  }
  draw();
  // 최근 본 상품·검색 결과·추천 카드처럼 brands+q로 단일 상품을 특정한 링크면
  // 필터된 목록이 아니라 상품 상세 모달을 바로 연다. (H-20)
  // 단일 브랜드(brands에 '|' 없음) + q가 모두 있을 때만 — 일반 검색(q만)은 제외.
  const jumpB = params.get("brands"), jumpQ = params.get("q");
  if (jumpB && jumpQ && !jumpB.includes("|")) {
    const hit = d.models.find(m => m.brand === jumpB && m.model === jumpQ);
    if (hit) openProduct(hit);
  }
}

let _syncPresetOn = null;   // L-155: 현재 필터바의 프리셋 .on 동기화 함수(buildFilters가 설정)
// L-156: 별점지표 외 추가 슬라이더 메타 — 모듈 스코프로 올려 renderActiveFilters·diagnoseEmpty도 레이블 조회 가능
const EXTRA_SPECS = {
  "backpacking-tent": [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
  "auto-tent":        [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
  "shelter":          [{key:"water_head",label:"내수압",unit:"mm"},{key:"floor_area",label:"바닥면적",unit:"m²"}],
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
// L-156: 지표 레이블 조회 — d.metrics 우선, 없으면 EXTRA_SPECS(현재 슬러그)에서. 둘 다 없으면 key 그대로.
function metricLabel(key) {
  if (key === "price") return "가격";
  const m = STATE.data && STATE.data.metrics && STATE.data.metrics.find(x => x.key === key);
  if (m) return m.label;
  const ex = (EXTRA_SPECS[STATE.slug] || []).find(e => e.key === key);
  return ex ? ex.label : key;
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
      `<button class="ftag on" data-cap="" aria-pressed="true">전체</button>` +
      caps.map(c => `<button class="ftag" data-cap="${c}" aria-pressed="false">${c}인</button>`).join("") + `</div>`);  // L-119
  }

  // 가격 범위 — 듀얼 슬라이더
  const prices = num(ms.map(m => m.price_min));
  if (prices.length) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    const step = Math.max(1000, Math.round((hi - lo) / 100 / 1000) * 1000);
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">가격</span>
      <div class="dslider" data-rng="price" data-lo="${lo}" data-hi="${hi}" data-step="${step}" data-unit="price">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${lo}" data-b="min" aria-label="가격 최솟값">
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${hi}" data-b="max" aria-label="가격 최댓값">
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
    // 슬라이더는 kg 단위, STATE.range는 g 단위 유지 (passRange가 specs.value와 비교하므로)
    const slo = isWeight ? rawLo / 1000 : rawLo;
    const shi = isWeight ? rawHi / 1000 : rawHi;
    const displayUnit = isWeight ? "kg" : (m.unit || "");
    const step = isWeight ? 0.1 : Math.max(0.1, +((shi - slo) / 100).toFixed(2));
    const fmtVal = v => isWeight ? (+v).toFixed(1) + "kg" : (+v).toFixed(1) + displayUnit;
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">${m.label}</span>
      <div class="dslider" data-rng="${m.key}" data-lo="${slo}" data-hi="${shi}" data-step="${step}"
           data-unit="${displayUnit}" data-isweight="${isWeight ? 1 : 0}">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${slo}" max="${shi}" step="${step}" value="${slo}" data-b="min" aria-label="${m.label} 최솟값">
        <input class="dsl-input" type="range" min="${slo}" max="${shi}" step="${step}" value="${shi}" data-b="max" aria-label="${m.label} 최댓값">
        <div class="dslider-labels">
          <span class="dsl-val" data-b="min">${fmtVal(slo)}</span>
          <span class="dsl-val" data-b="max">${fmtVal(shi)}</span>
        </div>
      </div></div>`);
  });

  // 카테고리별 핵심 스펙 추가 슬라이더
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
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${lo}" data-b="min" aria-label="${em.label} 최솟값">
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${hi}" data-b="max" aria-label="${em.label} 최댓값">
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
    top.map(([b, n]) => `<button class="ftag" data-brand="${esc(b)}" aria-pressed="false">${esc(b)} <i>${n}</i></button>`).join("") +
    (sorted.length > 12 ? `<select class="fsel" data-brandsel aria-label="브랜드 필터 선택">
       <option value="">＋ 브랜드 (${sorted.length})</option>` +
      sorted.map(([b, n]) => `<option value="${esc(b)}">${esc(b)} (${n})</option>`).join("") + `</select>` : "") + `</div>`);

  // 정렬 + 품질
  parts.push(`<div class="fgrp"><span class="flab">정렬</span>
    <select class="fsel" data-sort aria-label="정렬 기준 선택">
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
  // 프리셋이 관리하는 필터(무게range·가격range·cap)를 모두 리셋 — 프리셋끼리 상호배타로 동작 (M-68)
  // (다른 프리셋의 잔여 필터가 AND 누적돼 결과가 비정상적으로 적어지던 문제 방지)
  const clearPresetFilters = () => {
    STATE.range = {};                // 모든 range 초기화 (comfort_temp 등 누적 방지, M-89)
    STATE.brands.clear();            // 브랜드 필터 초기화 (M-89)
    STATE.campStyle = "";            // 스타일 칩 초기화 (M-101)
    STATE.cap = "";
  };
  // 각 프리셋은 isOn()으로 현재 활성 여부를 판정하고, fn()은 토글(켜져 있으면 끄기) (M-68)
  const presets = [];
  if (weightVals.length >= 3) {
    const sorted = [...weightVals].sort((a, b) => a - b);
    const p33 = sorted[Math.floor(sorted.length * 0.33)];
    presets.push({
      label: "🪶 경량 우선",
      isOn: () => !!STATE.range[weightMeta.key],
      fn: () => {
        const on = !!STATE.range[weightMeta.key];
        clearPresetFilters();
        if (!on) STATE.range[weightMeta.key] = { max: p33 };
        syncFilterUI(); draw();
      }});
  }
  if (priceVals.length >= 3) {
    const sorted = [...priceVals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length * 0.5)];
    presets.push({
      label: "💰 저가 우선",
      isOn: () => !!STATE.range.price,
      fn: () => {
        const on = !!STATE.range.price;
        clearPresetFilters();
        if (!on) STATE.range.price = { max: median };
        syncFilterUI(); draw();
      }});
  }
  if (hasCap4) presets.push({
    label: "👨‍👩‍👧 가족형",
    isOn: () => STATE.cap === "4",
    fn: () => {
      const on = STATE.cap === "4";
      clearPresetFilters();
      if (!on) STATE.cap = "4";
      syncFilterUI(); draw();
    }});

  if (presets.length) {
    parts.unshift(`<div class="fgrp fgrp-preset"><span class="flab">빠른 설정</span>` +
      presets.map((p, i) => `<button type="button" class="ftag fpre" data-pi="${i}" aria-pressed="false">${esc(p.label)}</button>`).join("") +
      `</div>`);
  }

  bar.innerHTML = parts.join("");

  // 프리셋 클릭 핸들러
  if (presets.length) {
    const syncPresetOn = () => bar.querySelectorAll(".fpre").forEach(x => {
      const on = presets[+x.dataset.pi].isOn(); x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on));  // L-119
    });
    _syncPresetOn = syncPresetOn;   // L-155: syncFilterUI(복원 후)에서 재호출하도록 노출
    bar.querySelectorAll(".fpre").forEach(b => b.onclick = () => {
      presets[+b.dataset.pi].fn();
      syncPresetOn();   // 토글 결과(상호배타·재클릭 OFF)를 .on 표시에 반영 (M-68)
    });
    syncPresetOn();     // 초기 진입 시(URL 복원 등) 활성 프리셋 강조
  } else { _syncPresetOn = null; }

  // FE-CAT-07: 모바일에선 필터를 하단 바텀시트로 노출(데스크톱은 사이드바 그대로).
  // 열기 버튼은 본문 흐름(cat-body) 상단, 시트 크롬(헤더/푸터)·백드롭은 1회 구성. 기본 닫힘 → 첫 화면에 목록 바로 노출.
  const aside = bar.parentNode;                          // #cat-aside (모바일=바텀시트)
  const catBody = document.getElementById("cat-body");
  if (catBody && aside && !document.getElementById("filtoggle")) {
    catBody.insertAdjacentHTML("afterbegin",
      `<button id="filtoggle" class="filtoggle" type="button" aria-controls="cat-aside" aria-expanded="false">🎛️ 필터</button>`);
    aside.insertAdjacentHTML("afterbegin",
      `<div class="fsheet-head"><span class="fsheet-title">필터</span><button type="button" class="fsheet-x" aria-label="필터 닫기">✕</button></div>`);
    aside.insertAdjacentHTML("beforeend",
      `<div class="fsheet-foot"><button type="button" class="fsheet-apply">결과 보기</button></div>`);
    let backdrop = document.getElementById("filter-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "filter-backdrop"; backdrop.className = "filter-backdrop";
      document.body.appendChild(backdrop);
    }
    const tg = document.getElementById("filtoggle");
    const openSheet = () => { aside.classList.add("open"); backdrop.classList.add("on"); document.body.classList.add("filter-sheet-lock"); tg.setAttribute("aria-expanded", "true"); };
    const closeSheet = () => { aside.classList.remove("open"); backdrop.classList.remove("on"); document.body.classList.remove("filter-sheet-lock"); tg.setAttribute("aria-expanded", "false"); };
    tg.onclick = openSheet;
    backdrop.onclick = closeSheet;
    aside.querySelector(".fsheet-x").onclick = closeSheet;
    aside.querySelector(".fsheet-apply").onclick = closeSheet;   // 필터는 실시간 적용(draw) — 닫기만
    document.addEventListener("keydown", e => { if (e.key === "Escape" && aside.classList.contains("open")) closeSheet(); });
  }

  // 인원
  bar.querySelectorAll("[data-cap]").forEach(btn => btn.onclick = () => {
    bar.querySelectorAll("[data-cap]").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });  // L-132
    btn.classList.add("on"); btn.setAttribute("aria-pressed", "true"); STATE.cap = btn.dataset.cap; draw();
  });
  // 브랜드 멀티(칩 토글)
  bar.querySelectorAll("[data-brand]").forEach(btn => btn.onclick = () => {
    const b = btn.dataset.brand;
    if (STATE.brands.has(b)) { STATE.brands.delete(b); btn.classList.remove("on"); }
    else { STATE.brands.add(b); btn.classList.add("on"); }
    btn.setAttribute("aria-pressed", String(btn.classList.contains("on")));  // L-132
    draw();
  });
  // 브랜드 드롭다운(추가)
  const bsel = bar.querySelector("[data-brandsel]");
  if (bsel) bsel.onchange = e => { if (e.target.value) { STATE.brands.add(e.target.value); e.target.value = ""; syncFilterUI(); draw(); } };  // L-94
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
    const toStateVal = v => isWeight ? Math.round(parseFloat(v) * 1000) : parseFloat(v);  // L-68 float precision
    const applyToState = () => {
      const lo = parseFloat(minInp.value), hi = parseFloat(maxInp.value);
      const isDefault = (lo <= totalLo && hi >= totalHi);
      if (isDefault) { delete STATE.range[key]; }
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
      minInp.setAttribute("aria-valuetext", fmtLabel(minInp.value));  // L-70
      updateFill(); applyToState();
    };
    maxInp.oninput = () => {
      if (parseFloat(maxInp.value) < parseFloat(minInp.value)) maxInp.value = minInp.value;
      maxLbl.textContent = fmtLabel(maxInp.value);
      maxInp.setAttribute("aria-valuetext", fmtLabel(maxInp.value));  // L-70
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
      `<button type="button" class="schip" data-sortval="${v}" aria-pressed="false">${esc(lab)}</button>`).join("");  // L-16
    sc.querySelectorAll(".schip").forEach(b => b.onclick = () => applySort(b.dataset.sortval));
  }
  // 품질 토글
  const qx = bar.querySelector("[data-qx]");
  if (qx) qx.onchange = e => { STATE.qExclude = e.target.checked; draw(); };
}

// FE-CAT-10: '가성비순(value)' 정렬 활성 시 정의 안내 배너. ✕로 닫으면 localStorage로 영구 기억.
function renderValueBanner(sortKey) {
  const list = document.getElementById("list");
  if (!list) return;
  let banner = document.getElementById("value-banner");
  const dismissed = (() => { try { return localStorage.getItem("value_banner_dismissed") === "1"; } catch (e) { return false; } })();
  const show = sortKey === "value" && !dismissed;
  if (!show) { if (banner) banner.remove(); return; }
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "value-banner";
    banner.className = "value-banner";
    banner.setAttribute("role", "note");
    banner.setAttribute("aria-live", "polite");   // L-133: 동적 삽입 배너 AT 고지
    list.parentNode.insertBefore(banner, list);   // 리스트 바로 위(활성필터 아래)
  }
  banner.innerHTML = `<span class="vb-ico" aria-hidden="true">💡</span>
    <span class="vb-txt"><b>가성비순</b> = 별점 대비 가격이 좋은 순으로 정렬돼요</span>
    <button type="button" class="vb-x" aria-label="안내 닫기">✕</button>`;
  banner.querySelector(".vb-x").onclick = () => {
    try { localStorage.setItem("value_banner_dismissed", "1"); } catch (e) {}
    banner.remove();
  };
}

// 활성 필터 요약 칩(개별 해제) + 전체해제
function renderActiveFilters() {
  const el = document.getElementById("activefilters");
  if (!el) return;
  const chips = [];
  if (STATE.cap) chips.push([`인원 ${STATE.cap}인`, () => { STATE.cap = ""; }]);
  STATE.brands.forEach(b => chips.push([`브랜드 ${b}`, () => STATE.brands.delete(b)]));
  Object.entries(STATE.range).forEach(([k, r]) => {
    const lab = metricLabel(k);   // L-156: EXTRA_SPECS 키도 한글 레이블
    const rawUnit = k === "price" ? "원" : (STATE.unit[k] || "");
    // 무게(g) 필터는 STATE.range에 g 단위로 저장되지만 사용자에게는 kg으로 표시
    const isWeight = rawUnit === "g";
    const fmt = v => {
      if (v == null) return "";
      if (k === "price") return v.toLocaleString("ko-KR");
      if (isWeight) return (v / 1000).toFixed(1) + "kg";
      return v + rawUnit;
    };
    const txt = `${lab} ${fmt(r.min)}~${fmt(r.max)}`;
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
  bar.querySelectorAll("[data-cap]").forEach(b => { const on = b.dataset.cap === STATE.cap; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });  // L-119
  bar.querySelectorAll("[data-brand]").forEach(b => { const on = STATE.brands.has(b.dataset.brand); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });  // L-119
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
  if (_syncPresetOn) _syncPresetOn();   // L-155: 복원/변경 후 프리셋 버튼 .on·aria-pressed 동기화
}

function cellVal(m, key) {
  // 스펙 컬럼은 표시되는 '값'으로 정렬(별점 아님) → 클릭한 컬럼이 단조 정렬돼 직관적.
  if (key.startsWith("spec:")) { const s = m.specs[key.slice(5)]; return s ? s.value : null; }
  if (key === "value") {   // 가성비 — value_score/value_per_g/value_per_l 별점 우선, fallback 기존 방식
    const vs = m.specs.value_score || m.specs.value_per_g || m.specs.value_per_l;
    if (vs && vs.stars != null) return vs.stars;
    // fallback: 주력지표 별점 / 가격(만원)
    const pk = STATE.data.metrics.filter(x => x.is_star)[0];
    const s = pk && m.specs[pk.key];
    if (!s || !m.price_min) return null;
    if (pk.unit === "L") return s.value != null ? s.value / (m.price_min / 10000) : null;
    if (s.stars == null) return null;
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
    const lab = metricLabel(key);   // L-156: EXTRA_SPECS 키도 한글 레이블
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
  if (!modal) { modal = document.createElement("div"); modal.id = "pmodal"; modal.className = "pmodal"; document.body.appendChild(modal); }  // L-112: dialog role은 내부 .pmbox에만 — 중첩 제거
  const imgHtml = thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "pmimg", "pmicon");
  const specRows = star.map(mt => {
    const s = m.specs[mt.key];
    const has = s && s.value != null;
    const val = has ? fmtVal(s.value, mt.unit) : (OPS ? '<span class="b 데이터부족">데이터부족</span>' : "—");
    const st = (has && s.stars != null) ? " " + stars(s.stars) : "";
    const badge = (OPS && has && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
    return `<div class="pmspec"><span class="pml">${esc(mt.label)}${mt.unit ? ` (${mt.unit})` : ""}</span>` +
      `<span class="pmv">${val}${st}${badge}</span></div>`;
  }).join("");
  const wished = inWish(wishKey(m.brand, m.model, m.capacity));
  const pcode = wishKey(m.brand, m.model, m.capacity);
  modal.innerHTML = `<div class="pmbox" role="dialog" aria-modal="true" aria-labelledby="pm-title">
     <button type="button" class="pmx" aria-label="닫기">✕</button>
     <button class="pmwish${wished ? " on" : ""}" aria-label="찜" aria-pressed="${wished}">${BOOKMARK_SVG}</button>
     ${imgHtml}
     <div class="pmbody">
       <div class="pmbrand">${esc(m.brand)}${m.capacity != null ? ` · ${m.capacity}인` : ""}${m.variants > 1 ? ` · +${m.variants - 1}색` : ""}</div>
       <div class="pmname-row">
         <h2 class="pmname" id="pm-title">${esc(m.model)}</h2>
         <div class="pmname-tools">
           <button class="pmtool pmshare" type="button" aria-label="공유하기" title="공유하기">${SHARE_SVG}</button>
           <button class="pmtool pmreport" type="button" aria-label="제품 정보 오류 신고" title="제품 정보 오류 신고">⚠️</button>
         </div>
       </div>
       <div class="pmprice">${priceRange(m.price_min, m.price_max)}</div>
       <div class="pmprice-note">제품은 최저가를 표기하고 있습니다. 링크의 가격과 다를 수 있습니다.</div>
       <div class="pmspecs">
         <div class="pmspec pmspec-user"><span class="pml">유저 평가</span><span class="pmv" id="pm-userrating"><span class="nd">—</span></span></div>
         ${specRows}
       </div>
       ${m.coupang_url
         ? `<button class="pmbuy pmbuy-active" type="button" data-url="${esc(m.coupang_url)}">🛒 쿠팡에서 구매하기</button>
       <div class="pmbuynote">이 링크는 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받습니다.</div>`
         : `<button class="pmbuy" type="button" disabled aria-disabled="true">구매하기</button>
       <div class="pmbuynote">구매 링크를 준비 중입니다.</div>`
       }
       <button class="pmset" type="button">＋ 장비 꾸러미에 담기</button>
       <a class="pmlink" href="brand.html?b=${encodeURIComponent(m.brand)}">${esc(m.brand)} 다른 제품 보기 ›</a>
       ${STATE.slug ? `<a class="pmlink" href="/item/${STATE.slug}/item-${d.models.indexOf(m)}.html" style="font-size:12px;color:var(--muted)">🔗 상세 페이지 (공유·즐겨찾기용)</a>` : ""}
       <section class="pmrv" aria-label="유저 후기">
         <div class="pmrv-head">
           <span class="pmrv-title">유저 후기<span class="pmrv-cnt" id="pmrv-cnt"></span></span>
           <button class="pmrv-add" type="button">✍️ 후기 남기기</button>
         </div>
         <div class="pmrv-formbox" id="pmrv-formbox" hidden></div>
         <div class="pmrv-list" id="pmrv-list"><div class="pmrv-empty">후기를 불러오는 중…</div></div>
       </section>
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
    wbtn.innerHTML = BOOKMARK_SVG;
    toggleWishWithHint(wishItem(m, STATE.slug), wbtn);
  };
  const setBtn = modal.querySelector(".pmset");
  if (setBtn) setBtn.onclick = () => openSetModal(setItem(m, STATE.slug));
  const reportBtn = modal.querySelector(".pmreport");
  if (reportBtn) reportBtn.onclick = () => {
    const subject = encodeURIComponent(`[오류 제보] ${m.brand} ${m.model}`);
    const body = encodeURIComponent(`제품명: ${m.brand} ${m.model}\n\n오류 내용:\n`);
    window.open(`mailto:bangsungju@gmail.com?subject=${subject}&body=${body}`, "_self");
  };
  // 공유 — 정적 상세페이지 URL(공유·즐겨찾기용)을 우선, 없으면 현재 주소. Web Share → 실패 시 클립보드 복사.
  const shareBtn = modal.querySelector(".pmshare");
  if (shareBtn) shareBtn.onclick = async () => {
    const idx = d.models.indexOf(m);
    const url = STATE.slug && idx >= 0
      ? `${location.origin}/item/${STATE.slug}/item-${idx}.html`
      : location.href;
    const title = `${m.brand} ${m.model} — 장비의 숲`;
    const text = `${m.brand} ${m.model} 스펙·후기 보러가기`;
    try {
      if (navigator.share) { await navigator.share({ title, text, url }); return; }
      throw new Error("no-share");
    } catch (err) {
      if (err && err.name === "AbortError") return;   // 사용자가 공유 취소 — 폴백 금지
      try { await navigator.clipboard.writeText(url); showToast("링크를 복사했어요 📋 주변에 공유해보세요!"); }
      catch (_) { window.prompt("아래 링크를 복사해 공유하세요", url); }
    }
  };
  // 유저 후기 — 목록·평균 별점 로드 + '후기 남기기' 폼 연결
  wireReviews(modal, m, pcode);
  const prevFocus = document.activeElement;   // 닫을 때 원래 위치로 포커스 복귀(접근성)
  const close = () => {
    modal.classList.remove("on");
    document.removeEventListener("keydown", onKey);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  modal.onclick = e => { if (e.target === modal) close(); };
  const xbtn = modal.querySelector(".pmx");
  xbtn.onclick = close;
  xbtn.focus();
  // 포커스 트랩 (H-29, WCAG 2.1.2) — Tab/Shift+Tab이 모달 밖으로 탈출하지 않고 순환.
  const onKey = e => {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const box = modal.querySelector(".pmbox");
    const f = box.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');   // L-158: select·textarea 추가
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey);
}

/* ── 유저 후기 (reviews 테이블) — 사진 중심 메이슨리 그리드 ──────
   product_pcode = wishKey(brand|model|cap) — 찜·세트와 동일 키 스킴.
   목록·평균별점은 anon도 읽기 가능(RLS reviews_select_public). 작성은 로그인 필요.
   사진은 review-images 버킷 업로드 + reviews.image_urls(마이그 020). 사진은 선택. */
const REVIEW_MAX_PHOTOS = 4;

function _reviewDate(iso) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

// image_urls 컬럼은 마이그(020) 적용 전이면 없을 수 있다 → 있으면 쓰고, 없으면 우아하게 제외(기존 후기 안 깨짐).
async function _fetchReviews(supabase, pcode) {
  const base = "rating, body, created_at, user_id, profiles(nickname)";
  let res = await supabase.from("reviews").select(base + ", image_urls")
    .eq("product_pcode", pcode).order("created_at", { ascending: false }).limit(40);
  if (res.error && /image_urls/i.test(res.error.message || "")) {
    res = await supabase.from("reviews").select(base)
      .eq("product_pcode", pcode).order("created_at", { ascending: false }).limit(40);
  }
  if (res.error) throw res.error;
  return (res.data || []).map(r => ({ ...r, image_urls: Array.isArray(r.image_urls) ? r.image_urls : [] }));
}

function _reviewCard(r, i) {
  const nick = esc(r.profiles?.nickname || "익명");
  const cap = `<span class="pmrv-cap"><span class="pmrv-nick">${nick}</span><span class="pmrv-stars">${stars(r.rating)}</span></span>`;
  if (r.image_urls.length) {
    const more = r.image_urls.length > 1 ? `<span class="pmrv-more">+${r.image_urls.length - 1}</span>` : "";
    return `<button type="button" class="pmrv-card has-photo" data-i="${i}">
      <span class="pmrv-photowrap"><img class="pmrv-photo" src="${esc(r.image_urls[0])}" alt="" loading="lazy">${more}</span>
      ${cap}</button>`;
  }
  return `<button type="button" class="pmrv-card textcard" data-i="${i}">
    <span class="pmrv-q">${esc(r.body)}</span>${cap}</button>`;
}

// 후기 상세 라이트박스 — 큰 사진 + 별점 + 전체 텍스트
function openReviewDetail(r) {
  let ov = document.getElementById("pmrv-detail");
  if (!ov) { ov = document.createElement("div"); ov.id = "pmrv-detail"; ov.className = "pmodal"; document.body.appendChild(ov); }  // M-128: dialog role은 내부 .pmbox에만
  const nick = esc(r.profiles?.nickname || "익명");
  const imgs = (r.image_urls || []).map(u => `<img class="pmrvd-img" src="${esc(u)}" alt="" loading="lazy">`).join("");
  ov.innerHTML = `<div class="pmbox pmrvd-box" role="dialog" aria-modal="true" aria-label="${nick}님의 후기">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    ${imgs ? `<div class="pmrvd-imgs">${imgs}</div>` : ""}
    <div class="pmrvd-body">
      <div class="pmrvd-meta"><span class="pmrv-nick">${nick}</span><span class="pmrv-stars">${stars(r.rating)}</span><span class="pmrv-date">${_reviewDate(r.created_at)}</span></div>
      <div class="pmrv-fulltext">${esc(r.body)}</div>
    </div></div>`;
  ov.classList.add("on");
  const prevFocus = document.activeElement;   // L-122: 닫을 때 포커스 복귀(보통 하위 상품모달의 후기 카드)
  const close = () => {
    ov.classList.remove("on");
    document.removeEventListener("keydown", onKey, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  ov.onclick = e => { if (e.target === ov) close(); };
  const xbtn = ov.querySelector(".pmx");
  xbtn.onclick = close;
  xbtn.focus();   // L-122: 초기 포커스
  // M-120: capture+stopImmediatePropagation — ESC가 하위 상품모달 onKey까지 전파돼 동시에 닫히는 것 방지
  // L-122: Tab 포커스 트랩
  const onKey = e => {
    if (e.key === "Escape") { e.stopImmediatePropagation(); close(); return; }
    if (e.key !== "Tab") return;
    const box = ov.querySelector(".pmbox");
    const f = box.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey, true);
}

async function loadReviews(modal, pcode) {
  const listEl = modal.querySelector("#pmrv-list");
  const cntEl = modal.querySelector("#pmrv-cnt");
  const ratingEl = modal.querySelector("#pm-userrating");
  try {
    const { supabase } = await import("./supabaseClient.js");
    const rv = await _fetchReviews(supabase, pcode);
    if (cntEl) cntEl.textContent = rv.length ? ` ${rv.length}` : "";
    if (ratingEl) {
      if (rv.length) {
        const avg = Math.round((rv.reduce((a, r) => a + r.rating, 0) / rv.length) * 10) / 10;
        ratingEl.innerHTML = `${stars(avg)} <span class="pmrv-avgn">${avg.toFixed(1)} · ${rv.length}명</span>`;
      } else {
        ratingEl.innerHTML = `<span class="nd">아직 평가 없음</span>`;
      }
    }
    if (!listEl) return;
    if (!rv.length) {
      listEl.className = "pmrv-list";
      listEl.innerHTML = `<div class="pmrv-empty">아직 후기가 없어요. 사진과 함께 첫 후기를 남겨보세요! 📷</div>`;
      return;
    }
    listEl.className = "pmrv-list pmrv-grid";
    listEl.innerHTML = rv.map((r, i) => _reviewCard(r, i)).join("");
    listEl.querySelectorAll(".pmrv-card").forEach(card => {
      card.onclick = () => openReviewDetail(rv[+card.dataset.i]);
    });
  } catch (e) {
    if (ratingEl) ratingEl.innerHTML = `<span class="nd">—</span>`;
    if (listEl) { listEl.className = "pmrv-list"; listEl.innerHTML = `<div class="pmrv-empty">후기를 불러오지 못했어요.</div>`; }
  }
}

function wireReviews(modal, m, pcode) {
  loadReviews(modal, pcode);
  const addBtn = modal.querySelector(".pmrv-add");
  const formbox = modal.querySelector("#pmrv-formbox");
  if (!addBtn || !formbox) return;
  let open = false;
  const reset = () => {
    formbox.querySelectorAll("img").forEach(img => { if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src); });   // L-159: Blob URL 누수 방지
    formbox.hidden = true; formbox.innerHTML = ""; open = false; addBtn.textContent = "✍️ 후기 남기기";
  };
  addBtn.onclick = async () => {
    if (open) { reset(); return; }
    // 로그인 확인 — reviews_insert_own 정책상 authenticated만 작성 가능
    let user = null;
    try { const { supabase } = await import("./supabaseClient.js"); ({ data: { user } } = await supabase.auth.getUser()); } catch (_) {}
    if (!user) {
      formbox.innerHTML = `<div class="pmrv-login">후기 작성은 로그인 후 이용할 수 있어요. <a class="pmlink" href="account.html">로그인하러 가기 ›</a></div>`;
      formbox.hidden = false; open = true; addBtn.textContent = "닫기";
      return;
    }
    formbox.innerHTML = `<form class="pmrv-form">
      <div class="pmrv-rate" role="radiogroup" aria-label="별점 선택">
        ${[1,2,3,4,5].map(n => `<button type="button" class="pmrv-star" data-v="${n}" role="radio" aria-checked="false" aria-label="${n}점">★</button>`).join("")}
        <span class="pmrv-rate-hint">별점을 선택하세요</span>
      </div>
      <div class="pmrv-photos">
        <div class="pmrv-thumbs"></div>
        <label class="pmrv-addphoto">📷 사진 추가 <span class="pmrv-photohint">(최대 ${REVIEW_MAX_PHOTOS}장)</span>
          <input type="file" accept="image/*" multiple hidden></label>
      </div>
      <textarea class="pmrv-ta" rows="3" minlength="10" maxlength="2000" placeholder="제품을 사용한 솔직한 후기를 남겨주세요 (10자 이상)"></textarea>
      <div class="pmrv-form-foot"><span class="pmrv-ta-cnt">0 / 2000</span><button type="submit" class="pmrv-submit">등록</button></div>
    </form>`;
    formbox.hidden = false; open = true; addBtn.textContent = "닫기";

    const form = formbox.querySelector(".pmrv-form");
    const ta = form.querySelector(".pmrv-ta");
    const taCnt = form.querySelector(".pmrv-ta-cnt");
    const rateHint = form.querySelector(".pmrv-rate-hint");
    const starBtns = [...form.querySelectorAll(".pmrv-star")];
    const fileInput = form.querySelector('input[type=file]');
    const thumbsEl = form.querySelector(".pmrv-thumbs");
    let rating = 0;
    let photos = [];   // File[]

    const paint = v => starBtns.forEach((b, i) => {
      b.classList.toggle("on", i < v);
      b.setAttribute("aria-checked", (i + 1) === rating ? "true" : "false");
    });
    starBtns.forEach(b => {
      b.onmouseenter = () => paint(+b.dataset.v);
      b.onclick = () => { rating = +b.dataset.v; paint(rating); rateHint.textContent = `${rating}점`; };
    });
    form.onmouseleave = () => paint(rating);
    ta.oninput = () => { taCnt.textContent = `${ta.value.length} / 2000`; };

    function renderThumbs() {
      // L-105: 재렌더 전 이전 Blob URL 해제(메모리 누수 방지)
      thumbsEl.querySelectorAll("img").forEach(img => { if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src); });
      thumbsEl.innerHTML = photos.map((f, i) =>
        `<span class="pmrv-thumb"><img src="${URL.createObjectURL(f)}" alt=""><button type="button" class="pmrv-thumb-x" data-i="${i}" aria-label="사진 삭제">✕</button></span>`
      ).join("");
      thumbsEl.querySelectorAll(".pmrv-thumb-x").forEach(btn =>
        btn.onclick = () => { photos.splice(+btn.dataset.i, 1); renderThumbs(); });
      form.querySelector(".pmrv-addphoto").style.display = photos.length >= REVIEW_MAX_PHOTOS ? "none" : "";
    }
    fileInput.onchange = () => {
      for (const f of fileInput.files) {
        if (photos.length >= REVIEW_MAX_PHOTOS) { showToast(`사진은 최대 ${REVIEW_MAX_PHOTOS}장까지 가능해요`); break; }
        if (!f.type.startsWith("image/")) { showToast("이미지 파일만 추가할 수 있어요"); continue; }
        if (f.size > 5 * 1024 * 1024) { showToast("이미지는 5MB 이하만 가능해요"); continue; }
        photos.push(f);
      }
      fileInput.value = "";
      renderThumbs();
    };

    form.onsubmit = async e => {
      e.preventDefault();
      const body = ta.value.trim();
      if (!rating) { showToast("별점을 선택해주세요"); return; }
      if (body.length < 10) { showToast("후기는 10자 이상 입력해주세요"); return; }
      const submitBtn = form.querySelector(".pmrv-submit");
      submitBtn.disabled = true;
      try {
        const { supabase, getErrorMessage, uploadImage } = await import("./supabaseClient.js");
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) { showToast("로그인이 필요해요"); submitBtn.disabled = false; return; }
        // 사진 업로드(순차)
        const urls = [];
        if (photos.length) {
          submitBtn.textContent = "사진 올리는 중…";
          for (const f of photos) {
            const { url, error } = await uploadImage(f);
            if (error) { showToast((getErrorMessage && getErrorMessage(error)) || "사진 업로드 실패"); submitBtn.disabled = false; submitBtn.textContent = "등록"; return; }
            urls.push(url);
          }
        }
        submitBtn.textContent = "등록 중…";
        const row = { user_id: u.id, product_pcode: pcode, rating, body };
        if (urls.length) row.image_urls = urls;
        const { error } = await supabase.from("reviews").insert(row);
        if (error) {
          // image_urls 컬럼 미적용(마이그 020 전) 감지 → 명확한 안내
          const colMissing = /image_urls/i.test(error.message || "") || error.code === "PGRST204";
          const msg = colMissing
            ? "사진 후기 기능이 아직 준비 중이에요. 잠시 후 다시 시도해주세요."
            : ((getErrorMessage && getErrorMessage(error)) || "후기를 등록하지 못했어요.");
          showToast(msg);
          submitBtn.disabled = false; submitBtn.textContent = "등록";
          return;
        }
        showToast("후기가 등록됐어요. 고마워요! 🌲");
        reset();
        loadReviews(modal, pcode);
      } catch (_) {
        showToast("후기를 등록하지 못했어요.");
        submitBtn.disabled = false; submitBtn.textContent = "등록";
      }
    };
    ta.focus();
  };
}

/* ---- 비교 기능 ---- */
let _cmpSet = [];  // 선택된 '모델 객체' 배열 (최대 3). 인덱스가 아니라 객체 참조 —
                   // 정렬·필터로 rows 순서가 바뀌어도 같은 제품을 가리킨다(M-110).

function toggleCmp(m, rows) {
  if (!COMPARE_ENABLED) return;   // 비교 기능 아카이브
  const idx = _cmpSet.indexOf(m);
  if (idx >= 0) { _cmpSet.splice(idx, 1); }
  else if (_cmpSet.length < 3) { _cmpSet.push(m); }
  else { return; }  // 3개 초과 무시
  updateCmpBar(rows);
  document.querySelectorAll("#list .pli-cmp").forEach(btn => {
    const cm = rows[+btn.dataset.mi];
    btn.classList.toggle("on", _cmpSet.includes(cm));
    btn.setAttribute("aria-pressed", _cmpSet.includes(cm));
  });
}

function updateCmpBar(rows) {
  if (!COMPARE_ENABLED) { const b = document.getElementById("cmp-bar"); if (b) b.style.display = "none"; return; }   // 비교 기능 아카이브
  let bar = document.getElementById("cmp-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "cmp-bar";
    bar.className = "cmp-bar";
    bar.setAttribute("aria-live", "polite");  // L-58
    bar.setAttribute("role", "status");
    document.body.appendChild(bar);
  }
  if (_cmpSet.length < 2) { bar.style.display = "none"; return; }
  bar.style.display = "flex";
  bar.innerHTML = `<span class="cmp-bar-label">${_cmpSet.length}개 선택됨</span>
    <button type="button" class="cmp-bar-btn" id="cmp-go">비교하기 →</button>
    <button type="button" class="cmp-bar-clear" id="cmp-clear" aria-label="비교 선택 해제">✕</button>`;
  bar.querySelector("#cmp-clear").onclick = () => { _cmpSet = []; updateCmpBar(rows); draw(); };
  bar.querySelector("#cmp-go").onclick = () => openCmpModal(rows);
}

function openCmpModal(rows) {
  if (!COMPARE_ENABLED) return;   // 비교 기능 아카이브
  const d = STATE.data;
  const metrics = d.metrics.filter(m => m.is_star);
  const items = _cmpSet.filter(Boolean);
  if (items.length < 2) return;

  let modal = document.getElementById("cmp-modal");
  if (!modal) { modal = document.createElement("div"); modal.id = "cmp-modal"; modal.className = "pmodal"; modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true"); modal.setAttribute("aria-labelledby","cmp-modal-title"); document.body.appendChild(modal); }

  // 각 지표별 최선값 계산
  const best = {};
  metrics.forEach(mt => {
    const vals = items.map(m => m.specs[mt.key]?.value).filter(v => v != null);
    if (!vals.length) return;
    best[mt.key] = mt.direction === "lower_better" ? Math.min(...vals) : Math.max(...vals);
  });

  const colWidth = items.length === 2 ? "46%" : "30%";
  const cols = items.map(m => {
    const rows = metrics.map(mt => {
      const s = m.specs[mt.key];
      const val = s?.value;
      const isBest = val != null && best[mt.key] === val;
      const cell = val != null ? fmtVal(val, mt.unit) : '<span class="nd">—</span>';
      return `<tr><th scope="row" style="padding:6px 8px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--line);font-weight:500;text-align:left">${esc(mt.label)}</th>
        <td style="padding:6px 8px;font-size:13px;font-weight:${isBest ? "700" : "400"};color:${isBest ? "var(--accent)" : "var(--txt)"};border-bottom:1px solid var(--line)">${cell}${isBest ? " ✓" : ""}</td></tr>`;
    }).join("");
    const tint = catTint(d.name), icon = catIcon(d.name);
    const mi = STATE.data.models.indexOf(m);
    const detailUrl = (STATE.slug && mi >= 0) ? `/item/${STATE.slug}/item-${mi}.html` : null;
    return `<div style="flex:1;min-width:0;max-width:${colWidth}">
      ${thumbCell(m.img, m.model, tint, icon, "cmp-thumb", "cmp-noimg")}
      <div style="font-size:11px;color:var(--muted);margin:6px 4px 2px">${esc(m.brand)}</div>
      <div style="font-size:13px;font-weight:700;margin:0 4px 8px;line-height:1.3">${esc(m.model)}</div>
      ${detailUrl ? `<a href="${detailUrl}" style="display:inline-block;font-size:11px;color:var(--accent);margin:0 4px 8px;text-decoration:underline">상세 페이지 →</a>` : ""}
      <table style="width:100%;border-collapse:collapse"><caption style="position:absolute;width:1px;height:1px;clip:rect(0,0,0,0);overflow:hidden">${esc(m.brand)} ${esc(m.model)} 스펙</caption><tbody>${rows}</tbody></table>
    </div>`;
  }).join('<div style="width:1px;background:var(--line);flex-shrink:0"></div>');

  const catLabel = d.name || STATE.slug || "";
  modal.innerHTML = `<div class="pmbox" style="max-width:600px;width:100%;padding:20px;overflow-x:auto">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <h2 id="cmp-modal-title" style="font-size:16px;font-weight:700;margin-bottom:16px">📊 스펙 비교</h2>
    <div style="display:flex;gap:12px;align-items:flex-start">${cols}</div>
    <p style="font-size:11px;color:var(--muted);margin-top:12px;text-align:center">✓ 표시: 해당 지표 최선값</p>
    <button type="button" id="cmp-save-set" style="margin-top:12px;width:100%;padding:10px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">🎒 선택 장비를 세트로 저장</button>
  </div>`;
  modal.classList.add("on");
  // L-106·M-127: ESC 닫기 + 포커스 트랩 + 초기 포커스 (openProduct와 동일 패턴)
  const prevFocus = document.activeElement;   // L-149: 닫을 때 포커스 복귀
  const close = () => { modal.classList.remove("on"); document.removeEventListener("keydown", onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); };
  const onKey = e => {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const box = modal.querySelector(".pmbox");
    const f = box.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey);
  const cmpX = modal.querySelector(".pmx");
  cmpX.onclick = close;
  cmpX.focus();
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector("#cmp-save-set").onclick = () => {
    const btn = modal.querySelector("#cmp-save-set");
    if (btn.disabled) return;  // L-82: 더블클릭 중복 저장 방지
    btn.disabled = true;
    const today = new Date().toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
    const setName = `${catLabel} 비교 ${today}`;
    const setItems = items.map(m => ({
      b: m.brand, m: m.model, cap: m.capacity ?? null,
      weight_g: m.specs.weight_min?.value ?? null, qty: 1,
      img: m.img ?? null, p: m.price_min ?? null
    }));
    const sets = getSets();
    sets.push({ id: Date.now().toString(36), title: setName, style: "비교", items: setItems, created_at: new Date().toISOString() });
    saveSets(sets);
    btn.textContent = "✅ 저장됐어요! 마이페이지에서 확인하세요";
    btn.style.background = "var(--muted)";
  };
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
      return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    // 데이터부족(null)은 정렬 방향과 무관하게 항상 맨 아래
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return asc ? va - vb : vb - va;
  });

  // 빠른 정렬 칩 활성표시(칩·셀렉트·URL복원 어느 경로로 바뀌든 일치)
  document.querySelectorAll("#sortchips .schip").forEach(b => {
    const v = b.dataset.sortval;
    const active = (v === "" && k === defaultSortKey()) || v === k;
    b.classList.toggle("on", active);
    b.setAttribute("aria-pressed", String(active));  // L-16
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
    const inCmp = _cmpSet.includes(m);
    return `<a class="pli" href="/item/${STATE.slug}/item-${d.models.indexOf(m)}.html" data-mi="${i}" aria-label="${esc(m.brand)} ${esc(m.model)} 상세 보기">
      <button type="button" class="pli-wish${wished ? " on" : ""}" data-mi="${i}"
        aria-label="찜" aria-pressed="${wished}">${BOOKMARK_SVG}</button>
      ${thumbCell(m.img, m.model, tint, icon)}
      <div class="pli-info">
        <div class="pli-top">${top}</div>
        <div class="pli-name">${esc(m.model)}</div>
        <div class="pli-specs">${specs}</div>
      </div>
      <div class="pli-side">
        <div class="pli-price">${priceLabeled(m.price_min)}</div>
        ${COMPARE_ENABLED ? `<button type="button" class="pli-cmp${inCmp ? " on" : ""}" data-mi="${i}" aria-label="비교에 추가" aria-pressed="${inCmp}" title="비교에 추가">⚖</button>` : ""}
        <span class="pli-chev" aria-hidden="true">›</span>
      </div></a>`;
  }).join("");
  const hasFilter = STATE.cap || STATE.brands.size || Object.keys(STATE.range).length || STATE.qExclude || STATE.q;
  document.getElementById("list").innerHTML = cards
    ? cards + `<div class="list-end" aria-live="polite" role="status">─ 총 ${rows.length}개 모두 표시됨 ─</div>`
    : `<div class="pli-empty"><div class="pe-ico">🔍</div>
       <div class="pe-msg">조건에 맞는 결과가 없어요 ${diagnoseEmpty(k)}</div>
       ${hasFilter ? `<button type="button" class="achip clear" id="emptyclear">필터 전체 해제</button>` : ""}
       ${STATE.q ? `<a href="/?q=${encodeURIComponent(STATE.q)}" class="achip" style="text-decoration:none;display:inline-block;margin-top:6px">전체 카테고리에서 "${esc(STATE.q)}" 검색 →</a>` : ""}</div>`;
  document.querySelectorAll("#list .pli").forEach(el => {
    el.onclick = e => { e.preventDefault(); openProduct(rows[+el.dataset.mi]); };
    el.onkeydown = e => { if (e.key === " ") { e.preventDefault(); openProduct(rows[+el.dataset.mi]); } };
  });
  // 찜 토글(카드 클릭=모달과 분리 → stopPropagation)
  document.querySelectorAll("#list .pli-wish").forEach(btn => btn.onclick = e => {
    e.preventDefault();   // L-03 회귀: <a class=pli> 내부 버튼 → 기본 네비게이션 차단
    e.stopPropagation();
    btn.innerHTML = BOOKMARK_SVG;
    toggleWishWithHint(wishItem(rows[+btn.dataset.mi], STATE.slug), btn);
  });
  document.querySelectorAll("#list .pli-cmp").forEach(btn => btn.onclick = e => {
    e.preventDefault();   // L-03 회귀: 카드 a태그 네비게이션 차단
    e.stopPropagation();
    toggleCmp(rows[+btn.dataset.mi], rows);
  });
  const ec = document.getElementById("emptyclear"); if (ec) ec.onclick = clearAllFilters;
  document.getElementById("count").textContent = `${rows.length} / ${d.models.length}개`;
  renderValueBanner(k);   // FE-CAT-10: '가성비순' 정렬 시 정의 안내 배너(닫기 가능)
  serializeState();   // 필터상태를 URL에 반영(공유·뒤로가기·새로고침 보존)

  // JSON-LD Product schema (현재 표시 중인 상위 20개)
  let ldEl = document.getElementById("jsonld-products");
  if (!ldEl) { ldEl = document.createElement("script"); ldEl.type = "application/ld+json"; ldEl.id = "jsonld-products"; document.head.appendChild(ldEl); }
  const catUrl = `https://gear-forest.com/category.html?cat=${STATE.slug}`;
  ldEl.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
    "name": d.name, "url": catUrl,
    "numberOfItems": rows.length,
    "itemListElement": rows.slice(0, 20).map((m, i) => ({
      "@type": "ListItem", "position": i + 1,
      "item": {
        "@type": "Product",
        "name": `${m.brand} ${m.model}`,
        "brand": { "@type": "Brand", "name": m.brand },
        "url": `https://gear-forest.com/item/${STATE.slug}/item-${d.models.indexOf(m)}.html`,  // M-119: 개별 상품 상세 URL (카테고리 URL 중복 제거)
        ...(m.price_min != null ? { "offers": { "@type": "Offer", "priceCurrency": "KRW", "price": m.price_min, "availability": "https://schema.org/InStock" } } : {})
      }
    }))
  });

  document.getElementById("foot").innerHTML = (OPS
    ? `카드를 누르면 이미지·전체 스펙 · 정렬은 위 ‘정렬’ 메뉴 · 별점=세그먼트 내 순위백분위(중앙값 ★3) · 가격=국내가 우선 · 측정값만.`
    : `카드를 누르면 상세 스펙 · 위 ‘정렬’로 순서 변경 · 별점은 같은 그룹 내 순위 기준. <span class="disc">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>`) + LEGAL_LINKS;
}

/* ---------- 브랜드 가로지르기 (전 카테고리 한 브랜드 모아보기) ---------- */
async function renderBrand() {
  renderCatNav("");
  let idx;
  try { idx = await getJSON("data/search.json?v=2cd7b927"); }
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
    document.title = bn ? `${bn} 전체보기 — 장비의 숲` : `브랜드 — 장비의 숲`;
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
        `<a class="pli" href="category.html?cat=${x.s}&brands=${encodeURIComponent(bn)}&q=${encodeURIComponent(x.m)}">
          ${thumbCell(x.img, x.m, tint, icon)}
          <div class="pli-info">
            <div class="pli-top">${esc(c.name)}${x.cap != null ? ` · ${x.cap}인` : ""}</div>
            <div class="pli-name">${esc(x.m)}</div>
          </div>
          <div class="pli-side">
            <div class="pli-price">${priceLabeled(x.p)}</div>
            <span class="pli-chev" aria-hidden="true">›</span>
          </div></a>`).join("");
      return `<h2 class="sec" style="margin-top:24px">
        <a href="category.html?cat=${c.slug}&brands=${encodeURIComponent(bn)}" style="color:var(--accent)">
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
  const bqInput = document.getElementById("bq");
  bqInput.oninput = e => renderChips(e.target.value.trim());
  // Enter → 현재 필터된 첫 브랜드로 이동 (M-61: 입력 필터는 동작하나 Enter 핸들러 부재였음)
  bqInput.onkeydown = e => {
    if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
    const firstChip = blist.querySelector("[data-b]");
    if (firstChip) firstChip.click();
  };

  draw(bname);
  renderChips();
  document.getElementById("foot").innerHTML = `한 브랜드를 전 카테고리에서 모아봅니다 · 측정값만 · 추측 없음. <span class="disc">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>` + LEGAL_LINKS;
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
      ? `category.html?cat=${pick.cat}&sort=value`
      : `category.html?cat=${pick.cat}&sort=spec:${pick.metric}&sa=${lower ? 1 : 0}`;
    const cards = rows.map(m => {
      const s = m.specs[pick.metric];
      const starHtml = (showStars && s.stars != null) ? " " + stars(s.stars) : "";   // 가성비·목표 정렬엔 별점 숨김(축 불일치)
      const opsBadge = (OPS && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
      return `<a class="rcard" href="category.html?cat=${pick.cat}&brands=${encodeURIComponent(m.brand)}&q=${encodeURIComponent(m.model)}">
        ${thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "rthumb", "rnoimg")}
        <div class="rb">${esc(m.brand)}${m.capacity != null ? ` · ${m.capacity}인` : ""}</div>
        <div class="rm">${esc(m.model)}</div>
        <div class="rs"><b>${esc(mt.label)} ${fmtVal(s.value, mt.unit)}</b>${starHtml}${opsBadge}</div>
        <div class="rp">${priceLabeled(m.price_min, '<span class="nd">—</span>')}</div>
      </a>`;
    }).join("");
    return `<section class="rsec"><div class="rsec-h"><h2>${esc(pick.label)}</h2>
       <a class="rmore" href="${more}">${esc(d.name)} 전체 ›</a></div>
       <div class="rgrid">${cards}</div></section>`;
  }).join("");
  document.getElementById("recs").innerHTML = sections || `<p class="nd">추천할 데이터가 없습니다.</p>`;
  document.getElementById("foot").innerHTML = `측정 스펙 기반 추천 · 정직성 우선 · 추측 없음. <span class="disc">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>` + LEGAL_LINKS;
}

/* ---------- 이번 주 인기: 카테고리별 랭킹 ---------- */
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

  // RPC로 최근 7일 클릭 상위 30개 집계 (카테고리별 분류용으로 여유있게)
  try {
    const { supabase } = await import("./supabaseClient.js");
    const { data } = await supabase.rpc("get_hot_items", { days_n: 7, limit_n: 30 });
    if (data && data.length >= 1) {
      // cat별로 그룹핑 (클릭수 내림차순 유지 — RPC가 이미 정렬함)
      const catMap = new Map();
      for (const h of data) {
        if (!catMap.has(h.cat)) catMap.set(h.cat, []);
        catMap.get(h.cat).push(h);
      }
      // 카테고리별 최대 3개씩, 최소 1개 항목 있는 카테고리만 표시 (M-87 저트래픽 단계 fallback 방지)
      const sections = [...catMap.entries()]
        .filter(([, items]) => items.length >= 1)
        .slice(0, 5); // 최대 5개 카테고리

      if (sections.length >= 1) {
        listEl.innerHTML = sections.map(([cat, items]) => {
          const catName = (categories || []).find(c => c.slug === cat)?.name || cat;
          const icon = catIcon(catName);
          const tint = catTint(catName);
          const top3 = items.slice(0, 3);
          const rowsHtml = top3.map((h, i) =>
            `<a class="hot-rank-row" href="category.html?cat=${cat}&brands=${encodeURIComponent(h.brand)}&q=${encodeURIComponent(h.model)}">
              <span class="hot-rank-num rank-${i + 1}">${i + 1}</span>
              <span class="hot-rank-info">
                <span class="hot-rank-brand">${esc(h.brand)}</span>
                <span class="hot-rank-model">${esc(h.model)}</span>
              </span>
              <span class="hot-rank-cnt">${h.clicks}회</span>
            </a>`
          ).join("");
          return `<div class="hot-cat-block">
            <div class="hot-cat-header">
              <span class="hot-cat-icon" style="background:${tint}">${icon}</span>
              <span class="hot-cat-name">${esc(catName)}</span>
              <a class="hot-cat-more" href="category.html?cat=${cat}">전체보기 ›</a>
            </div>
            <div class="hot-rank-list">${rowsHtml}</div>
          </div>`;
        }).join("");
        sec.style.display = "block";
        return;
      }
    }
  } catch (_) {}

  // fallback: 카테고리 chip
  listEl.innerHTML = HOT_FALLBACK.map(h =>
    `<a class="hot-chip" href="category.html?cat=${h.slug}">
      <span class="hot-icon">${catIcon(h.name)}</span>
      <span class="hot-name">${esc(h.name)}</span>
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
    a.map((x, i) => `<div class="recard-wrap">
      <a class="recard" href="category.html?cat=${x.s}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">
        ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "recard-thumb", "recard-noimg")}
        <div class="recard-b">${esc(x.b)}</div>
        <div class="recard-m">${esc(x.m)}</div>
        <div class="recard-p">${priceLabeled(x.p, '<span class="nd">—</span>')}</div>
      </a>
    </div>`).join("") + `</div>`;
}

/* ---------- 내 정보 — 섹션 나열(FE-SOC-07) ---------- */
/* 세트 상세 모달 — 수량 ± 편집 포함 */
function openSetDetail(si) {
  const sets = getSets();
  const s = sets[si];
  if (!s) return;
  const fmtW = g => g >= 1000 ? `${(g/1000).toFixed(1)}kg` : `${g}g`;
  const tw = s.items.reduce((sum, x) => x.weight_g != null ? sum + x.weight_g * (x.qty || 1) : sum, 0);
  const rows = s.items.map((x, ii) => {
    const w = x.weight_g != null ? fmtW(x.weight_g * (x.qty || 1)) : "—";
    const qty = x.qty || 1;
    const max = qtyMax(x.s);
    // FE-WISH-07: 항목별 구매 버튼. coupang_url 있으면 활성, 없으면 '준비 중' 비활성(상품 상세 pmbuy 패턴)
    const buyCell = x.coupang_url
      ? `<button type="button" class="set-buy" data-ii="${ii}">🛒 구매</button>`
      : `<button type="button" class="set-buy is-off" disabled aria-disabled="true" title="구매 링크 준비 중">준비 중</button>`;
    return `<tr>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);font-size:13px">${esc(x.b || "")} ${esc(x.m || "")}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);font-size:13px;text-align:right;color:var(--muted)">${w}</td>
      <td style="padding:4px 8px;border-bottom:1px solid var(--line)">
        <div class="qty-ctrl">
          <button class="qty-dec" data-ii="${ii}" aria-label="수량 감소">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-inc" data-ii="${ii}" aria-label="수량 증가"${qty >= max ? ' disabled' : ''}>＋</button>
        </div>
      </td>
      <td style="padding:4px 8px;border-bottom:1px solid var(--line);text-align:right">${buyCell}</td>
    </tr>`;
  }).join("");
  let modal = document.getElementById("set-detail-modal");
  if (!modal) { modal = document.createElement("div"); modal.id = "set-detail-modal"; modal.className = "pmodal"; modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true"); modal.setAttribute("aria-labelledby","set-detail-title"); document.body.appendChild(modal); }
  modal.innerHTML = `<div class="pmbox" style="max-width:520px;width:100%;padding:20px">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <h2 id="set-detail-title" style="font-size:16px;font-weight:700;margin-bottom:4px">${esc(s.title)}</h2>
    <p style="font-size:12px;color:var(--muted);margin-bottom:16px">${s.items.length}개 장비</p>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:left;color:var(--muted)">장비</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">무게</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">수량</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">구매</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--muted)">장비가 없어요</td></tr>'}</tbody>
      <tfoot><tr>
        <td style="padding:8px 8px 0;font-size:13px;font-weight:700">합계</td>
        <td style="padding:8px 8px 0;font-size:14px;font-weight:700;text-align:right;color:var(--accent)">${tw ? fmtW(tw) : "—"}</td>
        <td></td>
        <td></td>
      </tr></tfoot>
    </table>
    ${COMMUNITY_ENABLED ? `<button type="button" id="set-to-log-btn" style="margin-top:16px;width:100%;padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--txt)">📝 이 세트로 커뮤니티 로그 작성</button>` : ""}
  </div>`;
  // L-142: prevFocus 저장(재진입 시 최초 1회만)·ESC 닫기·초기 포커스 — 다른 모달과 일관
  const reopening = modal.classList.contains("on");
  if (!reopening) modal._prevFocus = document.activeElement;
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);
  modal.classList.add("on");
  const close = () => {
    modal.classList.remove("on");
    document.removeEventListener("keydown", modal._onKey);
    if (modal._prevFocus && modal._prevFocus.focus) modal._prevFocus.focus();
  };
  modal._onKey = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", modal._onKey);
  modal.querySelector(".pmx").onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").focus();
  modal.querySelectorAll(".qty-dec").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    const arr = getSets(); const set = arr[si]; if (!set) return;
    const ii = +btn.dataset.ii; const item = set.items[ii]; if (!item) return;
    if ((item.qty || 1) <= 1) set.items.splice(ii, 1);
    else item.qty = (item.qty || 1) - 1;
    saveSets(arr); renderAccount(); openSetDetail(si);
  });
  modal.querySelectorAll(".qty-inc").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    const arr = getSets(); const set = arr[si]; if (!set) return;
    const ii = +btn.dataset.ii; const item = set.items[ii]; if (!item) return;
    if ((item.qty || 1) >= qtyMax(item.s)) return;
    item.qty = (item.qty || 1) + 1;
    saveSets(arr); renderAccount(); openSetDetail(si);
  });
  // FE-WISH-07: 항목별 쿠팡 구매 — 새 탭으로 열고 click_events 집계(상품 상세 pmbuy와 동일 패턴)
  modal.querySelectorAll(".set-buy:not(.is-off)").forEach(btn => btn.onclick = async e => {
    e.stopPropagation();
    const item = getSets()[si]?.items[+btn.dataset.ii];
    const url = item?.coupang_url;
    if (!url) return;
    window.open(url, "_blank", "noopener");
    try {
      const { supabase } = await import("./supabaseClient.js");
      let sessionId = localStorage.getItem("_sid");
      if (!sessionId) { sessionId = Math.random().toString(36).slice(2); localStorage.setItem("_sid", sessionId); }
      await supabase.from("click_events").insert({
        slug: item.s, brand: item.b, model: item.m, coupang_url: url, session_id: sessionId
      });
    } catch (_) {}
  });
  const setToLogBtn = modal.querySelector("#set-to-log-btn");
  if (setToLogBtn) setToLogBtn.onclick = () => {
    close();
    if (document.getElementById("log-modal")) openLogModal(si);
    else location.href = `community.html?open-log=1&set=${si}`;
  };
}

function renderAccount() {
  if (!document.getElementById("wishlist")) return;
  const wishes = getWish();
  const sets = getSets();
  const isLoggedIn = !!window._accUser;
  const hasAny = wishes.length || sets.length;

  const emptyEl = document.getElementById("acc-empty");
  const navEl = document.getElementById("acc-nav");

  // FE-SOC-07: 탭 제거 — 찜/세트/로그를 한 화면에 섹션으로 나열(탭 전환 없음).
  // 비로그인: navEl / emptyEl 모두 숨김 (찜·세트 섹션 자체가 비로그인 미표시)
  if (navEl) navEl.style.display = "none";
  if (emptyEl) emptyEl.style.display = "none";

  // 내 로그 섹션 (로그인 사용자만)
  const logsSec = document.getElementById("logs-section");
  const myLogsList = document.getElementById("my-logs-list");
  if (logsSec && myLogsList) {
    const userId = window._accUser?.id;
    if (userId) {
      logsSec._accHasContent = true;
      logsSec.style.display = isLoggedIn ? "block" : "none";
      if (!myLogsList.dataset.loaded) {
        myLogsList.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:12px 0">불러오는 중…</div>`;
        import("./supabaseClient.js").then(async ({ supabase }) => {
          const { data: posts } = await supabase
            .from("posts")
            .select("id, title, body, created_at")
            .eq("user_id", userId)
            .is("deleted_at", null)
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
                ${COMMUNITY_ENABLED ? `<a class="achip clear" href="community.html">커뮤니티에서 로그 쓰기 ›</a>` : ""}
              </div>`;
            return;
          }
          if (logsCnt) logsCnt.textContent = `${posts.length}개`;
          const renderMyLogs = (list) => {
            myLogsList.innerHTML = `
              <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
                ${COMMUNITY_ENABLED ? `<a class="achip clear" href="community.html" style="font-size:12px;padding:5px 12px">+ 새 로그</a>` : ""}
              </div>` +
              list.map((p, pi) => {
                const dt = new Date(p.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
                const preview = (p.body || "").slice(0, 60).replace(/\n/g, " ");
                return `<div class="my-log-card" id="mlc-${pi}" style="position:relative">
                  <div class="my-log-card-actions">
                    <button type="button" class="my-log-edit" data-pi="${pi}" aria-label="수정">✎</button>
                    <button type="button" class="my-log-del" data-pi="${pi}" aria-label="삭제">✕</button>
                  </div>
                  <div class="log-card-head"><span class="log-date">${dt}</span></div>
                  <div class="log-title">${esc(p.title)}</div>
                  <div class="log-preview">${esc(preview)}${(p.body || "").length > 60 ? "…" : ""}</div>
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
                    <textarea id="le-body-${pi}" class="lf-textarea" rows="4" maxlength="1000" style="font-size:13px">${esc(p.body)}</textarea>
                    <div id="le-err-${pi}" style="font-size:12px;color:#e53e3e;display:none"></div>
                    <div style="display:flex;gap:8px">
                      <button type="button" id="le-save-${pi}" class="lf-submit" style="padding:9px;font-size:13px;flex:1">저장</button>
                      <button type="button" id="le-cancel-${pi}" style="padding:9px;font-size:13px;flex:1;border:1px solid var(--line);border-radius:8px;background:none;cursor:pointer">취소</button>
                    </div>
                  </div>`;
                document.getElementById(`le-cancel-${pi}`).onclick = () => renderMyLogs(list);
                document.getElementById(`le-save-${pi}`).onclick = async () => {
                  const newTitle = document.getElementById(`le-title-${pi}`).value.trim();
                  const newBody = document.getElementById(`le-body-${pi}`).value.trim();
                  const errEl2 = document.getElementById(`le-err-${pi}`);
                  if (!newTitle) { errEl2.textContent = "제목을 입력해주세요."; errEl2.style.display = ""; return; }
                  if (newBody.length < 20) { errEl2.textContent = "내용을 20자 이상 작성해주세요."; errEl2.style.display = ""; return; }
                  const saveBtn = document.getElementById(`le-save-${pi}`);
                  saveBtn.disabled = true; saveBtn.textContent = "저장 중…";
                  const { supabase: sb } = await import("./supabaseClient.js");
                  const { error } = await sb.from("posts")
                    .update({ title: newTitle, body: newBody })
                    .eq("id", p.id).eq("user_id", userId);
                  if (error) { errEl2.textContent = "저장 중 오류가 발생했어요."; errEl2.style.display = ""; saveBtn.disabled = false; saveBtn.textContent = "저장"; return; }
                  list[pi] = { ...p, title: newTitle, body: newBody };
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
                      ${COMMUNITY_ENABLED ? `<a class="achip clear" href="community.html">커뮤니티에서 로그 쓰기 ›</a>` : ""}
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
      // L-39: 비로그인 시 섹션 숨김 대신 로그인 안내 표시
      logsSec._accHasContent = false;
      logsSec.style.display = "block";
      if (myLogsList && !myLogsList.dataset.logLoginShown) {
        myLogsList.dataset.logLoginShown = "1";
        myLogsList.innerHTML = `<div style="text-align:center;padding:28px 0;color:var(--muted);font-size:14px">
          <div style="font-size:28px;margin-bottom:10px">📝</div>
          <div>로그인하면 내 캠핑 로그를 기록할 수 있어요</div>
          <a href="account.html" style="display:inline-block;margin-top:14px;padding:8px 18px;background:var(--accent);color:#fff;border-radius:20px;font-size:13px;font-weight:600">로그인</a>
        </div>`;
      }
    }
  }

  // 찜 섹션
  const wishSec = document.getElementById("wish-section");
  const wishEl = document.getElementById("wishlist");
  const cnt = document.getElementById("wishcount");
  if (wishSec) {
    wishSec._accHasContent = true;
    wishSec.style.display = "block";   // L-22: 비로그인에도 섹션 표시 — 빈 상태에서 로그인 CTA 노출
  }
  if (cnt) cnt.textContent = wishes.length ? `${wishes.length}개` : "";
  let wishEmptyEl = document.getElementById("wish-empty");
  if (wishEl) {
    if (!wishes.length) {
      wishEl.innerHTML = "";
      if (!wishEmptyEl) {
        wishEmptyEl = document.createElement("div");
        wishEmptyEl.id = "wish-empty";
        wishEmptyEl.style.cssText = "text-align:center;padding:32px 0;color:var(--muted);font-size:14px";
        wishEl.after(wishEmptyEl);
      }
      // 로그인 상태가 바뀌어도 버튼 표시 여부가 반영되도록 항상 innerHTML 갱신
      wishEmptyEl.innerHTML = `<div style="font-size:32px;margin-bottom:10px">🔖</div>
        <div>아직 찜한 상품이 없어요</div>
        <div style="font-size:12px;margin-top:6px">상품 카드의 🔖 버튼으로 추가해보세요</div>
        ${!isLoggedIn ? `<a href="account.html#auth-section" style="display:inline-block;margin-top:14px;padding:8px 18px;background:var(--accent);color:#fff;border-radius:20px;font-size:13px;font-weight:600">로그인하고 기기 간 동기화</a>` : ""}`;
      wishEmptyEl.style.display = "block";
    } else {
      if (wishEmptyEl) wishEmptyEl.style.display = "none";
    }
  }
  if (wishEl && wishes.length) {
    wishEl.innerHTML = wishes.map((x, i) => {
      const href = `category.html?cat=${x.s}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}`;
      return `<div class="pli" role="button" tabindex="0" data-href="${esc(href)}" aria-label="${esc(x.b)} ${esc(x.m)} 상세 보기">
        <button type="button" class="pli-wish on" data-i="${i}" aria-label="찜 해제" aria-pressed="true">${BOOKMARK_SVG}</button>
        ${thumbCell(x.img, x.m, "var(--card2)", "🏕️")}
        <div class="pli-info">
          <div class="pli-top">${esc(x.b)}${x.cap != null ? ` · ${x.cap}인` : ""}</div>
          <div class="pli-name">${esc(x.m)}</div>
        </div>
        <div class="pli-side">
          <div class="pli-price">${priceLabeled(x.p)}</div>
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

    // 찜 → 세트 일괄 추가 버튼
    let bulkBtn = document.getElementById("wish-bulk-add");
    if (!bulkBtn) {
      bulkBtn = document.createElement("button");
      bulkBtn.id = "wish-bulk-add";
      bulkBtn.type = "button";
      bulkBtn.style.cssText = "margin-top:10px;width:100%;padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--txt)";
      wishEl.after(bulkBtn);
    }
    bulkBtn.textContent = `🎒 찜한 ${wishes.length}개 전체 → 새 세트로 저장`;
    bulkBtn.onclick = () => {
      const dateStr = new Date().toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
      const base = `찜 목록 세트 ${dateStr}`;
      const all0 = getSets();
      const dup = all0.filter(s => s.title && s.title.startsWith(base)).length;
      const setName = dup ? `${base} (${dup + 1})` : base;
      const setItems = wishes.map(x => ({ b: x.b, m: x.m, cap: x.cap ?? null, weight_g: x.weight_g ?? null, qty: 1, img: x.img ?? null, p: x.p ?? null, s: x.s ?? null, pcode: x.pcode ?? null, coupang_url: x.coupang_url ?? null }));
      const s = { id: Date.now().toString(36), title: setName, style: "찜", items: setItems, created_at: new Date().toISOString() };
      const all = getSets(); all.unshift(s); saveSets(all);
      const tw = setItems.reduce((sum, x) => x.weight_g != null ? sum + x.weight_g : sum, 0);
      const tp = setItems.reduce((sum, x) => sum + (x.p || 0), 0);
      const wStr = tw >= 1000 ? `${(tw/1000).toFixed(1)}kg` : tw > 0 ? `${tw}g` : null;
      showToast(`"${setName}" 저장됨${wStr ? " · ⚖️ " + wStr : ""}${tp ? " · 💰 " + tp.toLocaleString() + "원" : ""}`, 3000);
      bulkBtn.textContent = "✅ 세트 저장됨 — 마이페이지 세트 탭에서 확인";
      bulkBtn.disabled = true;
    };
  }

  // 세트 섹션
  const setsSec = document.getElementById("sets-section");
  const setsEl = document.getElementById("setslist");
  const setsCnt = document.getElementById("setscount");
  if (setsSec) {
    setsSec._accHasContent = true;
    setsSec.style.display = isLoggedIn ? "block" : "none";
  }
  if (setsCnt) setsCnt.textContent = sets.length ? `${sets.length}개` : "";
  if (setsEl && !sets.length) {
    setsEl.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--muted)">
      <div style="font-size:32px;margin-bottom:10px">🎒</div>
      <div>아직 만든 세트가 없어요</div>
      <div style="font-size:12px;margin-top:6px">카테고리 상품 카드의 '꾸러미에 담기' 버튼으로 추가해 보세요</div>
    </div>`;
  }
  if (setsEl && sets.length) {
    const totalPrice = items => items.reduce((s, x) => s + (x.p || 0) * (x.qty || 1), 0);
    const totalWeight = items => { const w = items.reduce((s, x) => x.weight_g != null ? s + x.weight_g * (x.qty || 1) : s, 0); return w > 0 ? w : null; };
    const fmtWeight = g => g >= 1000 ? `${(g/1000).toFixed(1)}kg` : `${g}g`;
    const weightBadge = g => g == null ? '' : `<span class="pli-wt-badge" style="font-size:11px;color:${g<5000?'var(--ok,#2e7d32)':g<10000?'#e65100':'#b71c1c'}">${g<5000?'🪶경량':g<10000?'⚖️보통':'🏋️무거움'} ${fmtWeight(g)}</span>`;
    const getGoal = id => parseInt(localStorage.getItem(`set-goal-${id}`) || "0", 10) || 0;
    const setGoal = (id, g) => localStorage.setItem(`set-goal-${id}`, String(g));
    const goalBar = (s) => {
      const tw = totalWeight(s.items);
      const goal = getGoal(s.id);
      if (!tw) return "";
      const goalHtml = goal > 0
        ? (() => {
          const pct = Math.min(100, Math.round(tw / goal * 100));
          const over = tw > goal;
          const color = over ? "#e53e3e" : tw / goal > 0.9 ? "#d97706" : "var(--accent)";
          return `<div class="set-goal-bar-wrap">
            <div class="set-goal-bar-track"><div class="set-goal-bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="set-goal-label" style="color:${color}">${over ? "⚠️초과" : "🎯"} ${pct}% (목표 ${fmtWeight(goal)})</span>
          </div>`;
        })()
        : `<button type="button" class="set-goal-set" data-si="${s.id}">🎯 무게 목표 설정</button>`;
      return goalHtml;
    };
    setsEl.innerHTML = sets.map((s, si) => {
      const cats = new Set(s.items.map(x => x.s));
      const slotBadges = SET_SLOTS.map(slot => {
        const has = slot.slugs.some(sg => cats.has(sg));
        return `<span class="set-slot${has ? " on" : ""}" title="${slot.label}">${slot.icon}</span>`;
      }).join("");
      return `<div class="pli acc-set" role="button" tabindex="0" data-si="${si}" aria-label="${esc(s.title)} 세트 상세 보기">
        <div class="pli-info">
          <div class="pli-top">${esc(s.style || "세트")}</div>
          <div class="pli-name">${esc(s.title)}</div>
          <div class="pli-top" style="margin-top:3px">${s.items.length}개 장비 ${weightBadge(totalWeight(s.items))}</div>
          ${goalBar(s)}
          <div class="set-slots">${slotBadges}</div>
        </div>
        <div class="pli-side">
          <div class="pli-price">${priceLabeled(totalPrice(s.items) || null, '<span class="nd">—</span>')}</div>
          <button type="button" class="acc-set-share" data-si="${si}" aria-label="링크 복사" title="공유 링크 복사">🔗</button>
          <button type="button" class="acc-set-del" data-si="${si}" aria-label="세트 삭제">✕</button>
        </div></div>`;
    }).join("");
    // 무게 목표 설정 버튼
    setsEl.querySelectorAll(".set-goal-set").forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const setId = btn.dataset.si;
      const current = getGoal(setId) || 5000;
      const prevFocus = document.activeElement;   // L-126: 닫을 때 포커스 복귀
      const dialog = document.createElement("div");
      dialog.className = "pmodal on";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "goal-title");
      dialog.innerHTML = `<div class="pmbox" style="max-width:320px;width:100%;padding:24px">
        <button type="button" class="pmx" aria-label="닫기">✕</button>
        <h2 id="goal-title" style="font-size:16px;font-weight:700;margin-bottom:16px">🎯 무게 목표 설정</h2>
        <div style="text-align:center;font-size:24px;font-weight:700;margin-bottom:8px" id="goal-display">${fmtWeight(current)}</div>
        <input type="range" id="goal-slider" min="500" max="15000" step="100" value="${current}" style="width:100%;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:16px">
          <span>500g</span><span>5kg</span><span>10kg</span><span>15kg</span>
        </div>
        <button type="button" id="goal-save" class="achip" style="width:100%;justify-content:center;padding:10px">저장</button>
      </div>`;
      document.body.appendChild(dialog);
      const slider = dialog.querySelector("#goal-slider");
      const display = dialog.querySelector("#goal-display");
      slider.oninput = () => { display.textContent = fmtWeight(+slider.value); };
      const closeGoal = () => {
        dialog.remove();
        document.removeEventListener("keydown", onGoalKey);
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      };
      const onGoalKey = ev => { if (ev.key === "Escape") closeGoal(); };   // L-126: ESC 닫기
      document.addEventListener("keydown", onGoalKey);
      dialog.querySelector(".pmx").onclick = closeGoal;
      dialog.onclick = ev => { if (ev.target === dialog) closeGoal(); };
      dialog.querySelector("#goal-save").onclick = () => {
        setGoal(setId, +slider.value); closeGoal(); renderAccount();
      };
      dialog.querySelector(".pmx").focus();   // L-126: 초기 포커스
    });
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

    // 세트 카드 클릭 → 상세 모달 (수량 ± 편집 포함)
    setsEl.querySelectorAll(".acc-set").forEach(card => {
      card.onclick = () => openSetDetail(+card.dataset.si);
    });
  }

  // FE-SOC-07: 섹션 개수는 각 섹션 헤더의 .nd 뱃지(#wishcount/#setscount/#logscount)로 표시.
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

  // 로그인 사용자에게 댓글 알림 구독 요청 (최초 1회)
  if (window._commUser && "serviceWorker" in navigator && "PushManager" in window) {
    requestPushSubscription(window._commUser.id);
  }
}

// VAPID 공개키 — supabase db push 후 Edge Function 환경변수에 등록한 값과 쌍을 이룸
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZJTuT2wEGKwRCCLjLJAo-gFPRlY";

async function requestPushSubscription(userId) {
  if (localStorage.getItem("push-denied")) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub) { await _savePushSub(sub, userId); return; }

    // 알림 권한 요청
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { localStorage.setItem("push-denied", "1"); return; }

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    await _savePushSub(sub, userId);
  } catch (err) {
    console.warn("Push 구독 실패:", err);
  }
}

async function _savePushSub(sub, userId) {
  const j = sub.toJSON();
  const { supabase } = await import("./supabaseClient.js");
  await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: j.endpoint,
    p256dh: j.keys.p256dh,
    auth_key: j.keys.auth,
  }, { onConflict: "user_id,endpoint" });
}

function _urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
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
  el.innerHTML = "";

  // 커뮤니티 태그 집계 TOP-10 (RPC)
  try {
    const { supabase: sb } = await import("./supabaseClient.js");
    const { data: topTags } = await sb.rpc("get_top_gear_tags", { limit_n: 10 });
    if (topTags && topTags.length) {
      const sec = document.createElement("div");
      sec.className = "comm-sec";
      sec.innerHTML = `
        <div class="comm-sec-head">
          <span class="comm-sec-label">🏆 커뮤니티 인기 장비</span>
          <span class="comm-sec-style" style="font-size:11px;color:var(--muted)">로그 태그 기준</span>
        </div>
        <div class="comm-top-tags">${topTags.map((r, i) =>
          `<button type="button" class="comm-top-tag" data-tag="${esc(r.tag)}" title="${esc(r.tag)} — ${r.cnt}개 로그">
            <span class="comm-tag-rank">${i + 1}</span>
            <span class="comm-tag-name">${esc(r.tag)}</span>
            <span class="comm-tag-cnt">${r.cnt}</span>
          </button>`).join("")}
        </div>`;
      el.appendChild(sec);
      // 태그 클릭 → 로그 탭 + 태그 필터 적용
      sec.querySelectorAll(".comm-top-tag").forEach(btn => btn.onclick = () => {
        document.querySelectorAll(".comm-tab").forEach(b => b.classList.remove("on"));
        const logsTab = document.querySelector('.comm-tab[data-tab="logs"]');
        if (logsTab) logsTab.classList.add("on");
        document.getElementById("comm-best").style.display = "none";
        document.getElementById("comm-logs").style.display = "block";
        renderLogFeed("latest", btn.dataset.tag);
      });
    }
  } catch {}

  el.insertAdjacentHTML("beforeend", `<div style="color:var(--muted);font-size:12px;padding:8px 0 12px">측정 스펙 기반 카테고리별 상위 장비</div>`);

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
        `<a class="comm-gear-card" href="category.html?cat=${slug}&brands=${encodeURIComponent(m.brand)}&q=${encodeURIComponent(m.model)}">
          ${thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "comm-gear-thumb", "comm-gear-noimg")}
          <div class="comm-gear-info">
            <div class="comm-gear-brand">${esc(m.brand)}</div>
            <div class="comm-gear-model">${esc(m.model)}</div>
            <div class="comm-gear-spec">${star.label} ${fmtVal(m.specs[star.key].value, star.unit)}</div>
          </div>
          <div class="comm-gear-price">${priceLabeled(m.price_min, '<span class="nd">—</span>')}</div>
        </a>`
      ).join("");

      const sec = document.createElement("div");
      sec.className = "comm-sec";
      sec.innerHTML = `
        <div class="comm-sec-head">
          <span class="comm-sec-label">${catIcon(d.name)} ${label}</span>
          <span class="comm-sec-style">${style}</span>
          <a class="comm-sec-more" href="category.html?cat=${slug}">전체 보기 ›</a>
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
    <button type="button" class="pmx" aria-label="닫기">✕</button>
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

function openLogModal(presetSetIndex) {
  const modal = document.getElementById("log-modal");
  if (!modal) return;
  const body = document.getElementById("log-modal-body");
  if (!body) return;   // M-112: body null → TypeError 방지
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
          ${sets.map((s, i) => `<option value="${i}">${esc(s.title || "이름 없는 세트")} (${(s.items || []).length}개)</option>`).join("")}
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

  // 세트에서 직접 로그 작성 진입 시 해당 세트 자동 선택
  if (presetSetIndex != null) {
    const setSelect = body.querySelector("#lf-set");
    if (setSelect) setSelect.value = String(presetSetIndex);
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
          gear_set_snapshot = { name: s.title || "이름 없는 세트", items: (s.items || []).map(x => ({ name: `${x.b || ""} ${x.m || ""}`.trim(), weight_g: x.weight_g ?? null, qty: x.qty || 1 })), total_weight_g: totalW > 0 ? totalW : null };
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

  // 공유 세트 URL 처리 (?view-set=BASE64) — account.html에서만 동작
  // (H-33: 가드가 존재하지 않는 'acc-section'을 찾아 분기 진입 자체가 안 되던 dead code 수정)
  const vsParam = new URLSearchParams(location.search).get("view-set");
  if (vsParam && document.getElementById("auth-section")) {
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
        <button type="button" class="pmx" aria-label="닫기">✕</button>
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

  // 모바일 하단 내비게이션 바 (동적 삽입) — GNB 아카이브: 플래그 켤 때만 노출
  (function insertBottomNav() {
    if (!GNB_ENABLED) return;
    const path = location.pathname;

    // 라인 아이콘(24x24, stroke=currentColor → 활성 시 --accent 자동 상속)
    const SVG = {
      home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/></svg>`,
      explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/></svg>`,
      community: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5a6.5 6 0 0 1 13 0c0 3.3-2.9 6-6.5 6-.9 0-1.7-.1-2.5-.4L3.5 18.5l1-3A5.7 5.6 0 0 1 3 11.5z"/><path d="M16.5 8.2A5 4.8 0 0 1 21 13c0 1.5-.7 2.9-1.8 3.8l.8 2.4-2.6-1.2"/></svg>`,
      profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
    };
    const tabs = [
      { href: "/index.html",       icon: SVG.home,      label: "홈",    match: ["/", "/index.html"] },
      { href: "/category.html",    icon: SVG.explore,   label: "탐색",  match: ["/category", "/brand", "/recommend", "/item"] },
      { href: "/community.html",   icon: SVG.community, label: "커뮤니티",  match: ["/community"] },
      { href: "/account.html",     icon: SVG.profile,   label: "마이",  match: ["/account"] },
    ];

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "주 내비게이션");
    nav.innerHTML = tabs.map(t => {
      const active = t.match.some(m => path === m || path.startsWith(m + "?") || (m !== "/" && path.includes(m)));
      return `<a class="bnav-item${active ? " on" : ""}" href="${t.href}"${active ? ' aria-current="page"' : ""}>
        <span class="bnav-icon">${t.icon}</span>
        <span class="bnav-label">${t.label}</span>
      </a>`;
    }).join("");
    document.body.appendChild(nav);

    // 내비 높이만큼 main/footer에 padding-bottom 확보 (모바일 전용 — L-43 데스크톱 잉여 공백 방지)
    if (window.matchMedia("(max-width:767px)").matches) {
      const pb = "64px";
      const main = document.querySelector("main");
      const footer = document.querySelector("footer");
      if (main) main.style.paddingBottom = pb;
      if (footer) footer.style.paddingBottom = pb;
    }
  })();
});
