/* 장비의 숲 — 정적 프론트엔드 (DB→data/*.json) */
/* PWA: Capacitor 앱 환경에서는 SW 불필요(업데이트 방해) — 웹 전용으로만 등록 */
if ("serviceWorker" in navigator && !window.Capacitor?.isNativePlatform?.()) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));  // L-85: 절대경로 — item 서브경로에서 sw.js 404 방지
}

// FE-086: body:has(.pmodal.on) 스크롤잠금은 :has()(Safari 15.4+)에 의존 → iOS 15.0~15.3에서 모달 뒤 배경이 스크롤됨.
//   :has 미지원 브라우저에서만 MutationObserver로 .pmodal.on을 감지해 body.modal-open을 토글(모던 브라우저는 CSS만 사용, 옵저버 비용 0).
(function modalScrollLockFallback() {
  const supportsHas = window.CSS && CSS.supports && CSS.supports("selector(:has(*))");
  if (supportsHas) return;
  const sync = () => { document.body.classList.toggle("modal-open", !!document.querySelector(".pmodal.on")); };
  const start = () => {
    new MutationObserver(sync).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    sync();
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();

// FE-181: 전역 에러 핸들러 — 미처리 예외/거부가 빈 화면으로 남지 않도록 로깅 + 사용자 안내.
//   iOS WKWebView는 크래시 시 아무 피드백 없이 흰 화면만 남는다. 토스트 스팸 방지 가드 포함.
(function globalErrorGuard() {
  let _notifiedAt = 0;
  const notify = () => {
    const now = Date.now();
    if (now - _notifiedAt < 5000) return;   // 5초 디바운스(연쇄 에러 토스트 폭주 방지)
    _notifiedAt = now;
    try { if (typeof showToast === "function") showToast("일시적인 오류가 발생했어요. 계속되면 새로고침해 주세요.", 4000); } catch (_) {}
  };
  window.addEventListener("error", (e) => {
    if (e?.target && e.target !== window && e.target.nodeName) return;  // 리소스(img·script) 로드 실패는 무시(각자 onerror 처리)
    console.error("[gf] uncaught error:", e?.error || e?.message || e);
    notify();
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[gf] unhandled rejection:", e?.reason || e);
    notify();
  });
})();

// FE-130: 왼쪽 가장자리 스와이프 뒤로가기 — PWA(standalone)·Capacitor 네이티브는 브라우저 크롬이 없어
//   iOS 기본 가장자리 제스처가 사라진다. 일반 사파리는 OS 기본 제스처가 있으므로 적용 제외(충돌 방지).
(function edgeSwipeBack() {
  const isAppShell = window.matchMedia?.("(display-mode: standalone)").matches
    || window.navigator.standalone === true
    || window.Capacitor?.isNativePlatform?.() === true;
  if (!isAppShell) return;

  const EDGE = 30;    // 시작 인식 가장자리 폭(px) — iOS 기본과 유사
  const DIST = 70;    // 뒤로가기 트리거 최소 가로 이동(px)
  const SLOPE = 0.6;  // |dy| ≤ dx*SLOPE 일 때만 수평 스와이프로 인정(세로 스크롤과 구분)
  let startX = 0, startY = 0, tracking = false;

  window.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    const t = e.touches[0];
    tracking = t.clientX <= EDGE;
    startX = t.clientX; startY = t.clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!(dx >= DIST && Math.abs(dy) <= dx * SLOPE)) return;  // 수평 스와이프 아님
    // FE-180: 모달/필터시트가 열려 있으면 페이지 뒤로가기 대신 모달을 먼저 닫는다.
    //   모든 JS 모달은 .pmodal.on, 필터 시트는 body.filter-sheet-lock. ESC 위임으로 각 모달의 기존 close 경로 재사용.
    if (document.querySelector(".pmodal.on") || document.body.classList.contains("filter-sheet-lock")) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return;
    }
    if (history.length <= 1) return;  // 진입 첫 화면이면 무시(앱 종료 방지)
    history.back();
  }, { passive: true });
})();

// Phase 4: Capacitor 네이티브 UX — StatusBar·SplashScreen
if (window.Capacitor?.isNativePlatform?.()) {
  // 웹 스플래시 오버레이: 네이티브 스플래시 숨기기 전 동적 애니메이션
  (function showWebSplash() {
    // FE-125·127: 인라인 <style> 주입 제거(엄격 CSP 차단·CSSOM 전역 누수 방지). 스타일은 style.css(#web-splash·.ws-*)에 정의.
    const el = document.createElement('div');
    el.id = 'web-splash';
    el.innerHTML = `<div class="ws-stage">
  <div class="ws-ring ws-ring1"></div>
  <div class="ws-ring ws-ring2"></div>
  <div class="ws-ring ws-ring3"></div>
  <img class="ws-icon" src="/splash-mark.png" alt="">
</div>`;
    document.documentElement.appendChild(el);
    window.__hideSplash = function() {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 400);
    };
  })();

  (async () => {
    // FE-126: StatusBar 실패와 SplashScreen.hide()를 분리 — StatusBar가 실패해도 네이티브 스플래시는
    //   반드시 숨김 시도(미숨김 시 LaunchScreen이 화면을 덮은 채 잔류). 실패는 삼키지 말고 로그.
    let SplashScreen
    try {
      const [sb, ss] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/@capacitor/status-bar@8/dist/esm/index.js'),
        import('https://cdn.jsdelivr.net/npm/@capacitor/splash-screen@8/dist/esm/index.js'),
      ])
      SplashScreen = ss.SplashScreen
      try {
        await sb.StatusBar.setStyle({ style: sb.Style.Dark })
        await sb.StatusBar.setBackgroundColor({ color: '#2f7a4e' })
      } catch (e) { console.warn('[splash] StatusBar 설정 실패:', e) }
    } catch (e) { console.warn('[splash] Capacitor 플러그인 로드 실패:', e) }
    try { await SplashScreen?.hide() } catch (e) { console.warn('[splash] SplashScreen.hide 실패:', e) }
    // FE-070: 스플래시(녹색) 이후엔 실제 테마에 맞춰 상태바 동기화(부팅 1회 Dark 고정 해소)
    syncStatusBar(localStorage.getItem('theme') === 'dark');
    // 최소 0.8초 보여준 뒤 페이드 아웃
    setTimeout(() => window.__hideSplash?.(), 800);
  })()
}

// B-3/G2: 외부 링크(쿠팡 등) 오픈 — 앱에선 시스템 브라우저(@capacitor/browser=SFSafariViewController),
//  웹에선 새 탭. 인앱 WebView에 외부 결제페이지를 띄우지 않기 위함(Apple 심사 리스크 회피).
async function openExternal(url) {
  if (!safeHttps(url)) return;   // M-180: 비-https 스킴(javascript:/data: 등) 차단 — buyBtn·세트구매 단일 진입점
  if (window.Capacitor?.isNativePlatform?.()) {
    try {
      const { Browser } = await import('https://cdn.jsdelivr.net/npm/@capacitor/browser@8/dist/esm/index.js');
      await Browser.open({ url, toolbarColor: '#2f7a4e' });  // FE-157: 인앱 브라우저 툴바를 브랜드 그린으로(흰 툴바 불일치 해소)
      return;
    } catch (_) { /* 플러그인 미동기화 등 — 아래 폴백 */ }
  }
  window.open(url, "_blank", "noopener");
}

// FE-070/071: StatusBar를 현재 테마와 동기화. (부팅 1회 Style.Dark 고정·setTheme 토글 미반영 문제 해소)
//   Capacitor Style: Dark=밝은 텍스트(어두운 배경용) / Light=어두운 텍스트(밝은 배경용).
//   setBackgroundColor는 Android 전용(iOS no-op) — iOS는 viewport-fit=cover로 헤더색이 비쳐 보임.
async function syncStatusBar(dark) {
  if (!window.Capacitor?.isNativePlatform?.()) return;
  try {
    const sb = await import('https://cdn.jsdelivr.net/npm/@capacitor/status-bar@8/dist/esm/index.js');
    await sb.StatusBar.setStyle({ style: dark ? sb.Style.Dark : sb.Style.Light });
    try { await sb.StatusBar.setBackgroundColor({ color: dark ? '#121212' : '#ffffff' }); } catch (_) {}  // FE-071: Android만 적용
  } catch (_) {}
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
  syncStatusBar(dark);   // FE-070: 테마 토글 시 상태바도 즉시 동기화
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
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--banner-h", banner.offsetHeight + "px");
    });
  };
  const hideBanner = () => {
    banner.style.display = "none";
    document.documentElement.style.removeProperty("--banner-h");
  };
  showBanner();
  banner.querySelector(".pwa-install-btn").onclick = async () => {
    const prompt = _pwaPrompt;
    _pwaPrompt = null;  // H-51: prompt()는 1회만 유효 — null 처리로 InvalidStateError 방지
    if (!prompt) { hideBanner(); return; }   // L-292: 더블클릭 등으로 prompt 소진 시 null.prompt() TypeError 방지
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") localStorage.setItem("pwa-dismissed", "1");
    hideBanner();
  };
  banner.querySelector(".pwa-dismiss-btn").onclick = () => {
    localStorage.setItem("pwa-dismissed", "1");
    hideBanner();
  };
});
const GRADE_CLASS = { "🟢 A": "A", "🟡 B": "B", "🔴 한계": "L" };

// ── 전역 Auth 토대 (FE-AUTH-01 §A) ─────────────────────────────────────────
// 모든 페이지에서 getSession 완료 후 isLoggedIn/currentUser를 신뢰성 있게 제공.
// account.html 전용 window._accUser 대체(하위호환 유지).
;(function _setupGlobalAuth() {
  let _user = undefined;   // undefined=초기화중, null=비로그인, object=로그인
  let _ready = false;
  let _readyResolve;
  const _readyP = new Promise(r => { _readyResolve = r; });
  const _cbs = [];

  window.authReady   = () => _readyP;
  window.isLoggedIn  = () => _ready && !!_user;
  window.currentUser = () => _user ?? null;
  window.onAuthChange = cb => {
    _cbs.push(cb);
    return () => { const i = _cbs.indexOf(cb); if (i >= 0) _cbs.splice(i, 1); };
  };

  (async () => {
    try {
      const { supabase } = await import('./supabaseClient.js?v=0cfa00cd');
      const { data: { session } } = await supabase.auth.getSession();
      _user = session?.user ?? null;
      window._accUser = _user;   // account.html 등 하위호환
      _ready = true; window._gAuthReady = true; _readyResolve();
      supabase.auth.onAuthStateChange((event, sess) => {
        if (event === 'INITIAL_SESSION') return;
        _user = sess?.user ?? null;
        window._accUser = _user;
        _cbs.forEach(cb => { try { cb(_user, event); } catch (_) {} });
      });
    } catch (_) {
      _ready = true; window._gAuthReady = true; _readyResolve();
    }
  })();
}());

// ── 공용 게이트 노드 requireLogin (FE-AUTH-01 §A) ───────────────────────────
// 개인화 액션 직전에 호출. false 반환 시 호출부는 즉시 중단(리다이렉트 예약됨).
async function requireLogin({ action, returnTo, params } = {}) {
  await window.authReady();
  if (window.isLoggedIn()) return true;
  try {
    sessionStorage.setItem('auth-intent', JSON.stringify({
      action:   action   ?? null,
      params:   params   ?? null,
      returnTo: returnTo ?? location.href
    }));
  } catch (_) {}
  _showAuthGateModal();
  return false;
}

// L-245/356/455/312: 모달 Tab 포커스 트랩 — 컨테이너 내 포커스 가능 요소를 순환(WCAG 2.1.2)
function _trapTab(e, container) {
  if (e.key !== "Tab" || !container) return;
  const f = container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function _showAuthGateModal() {
  document.getElementById('auth-gate-modal')?.remove();
  const m = document.createElement('div');
  m.id = 'auth-gate-modal';
  m.className = 'pmodal on';
  // M-525: 절대경로 사용으로 경로 깊이 무관하게 안전
  m.innerHTML = `<div class="pmbox agm-box" role="dialog" aria-modal="true" aria-labelledby="agm-title">
    <p class="agm-ico">🔒</p>
    <p id="agm-title" class="agm-title">이 기능은 로그인이 필요해요</p>
    <p class="agm-sub">로그인하면 기기 간 동기화돼요</p>
    <a href="/account.html" class="agm-btn">로그인하기</a>
    <button type="button" class="agm-cancel">취소</button>
  </div>`;
  document.body.appendChild(m);
  // M-247/M-259/L-249: 취소·백드롭·ESC 등 모든 닫기에서 keydown 리스너 제거 + 재오픈 시 이전 리스너 정리(누적 방지)
  if (window._authGateOnKey) document.removeEventListener('keydown', window._authGateOnKey);
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); window._authGateOnKey = null; };
  const onKey = e => { if (e.key === 'Escape') { close(); return; } _trapTab(e, m); };   // L-455: Tab 포커스 트랩
  m.querySelector('.agm-cancel').onclick = close;
  m.onclick = e => { if (e.target === m) close(); };
  window._authGateOnKey = onKey;
  document.addEventListener('keydown', onKey);
}

/* 운영자 모드: ?ops=1 로 켜면(localStorage 영속) 신뢰등급·값배지·데이터한계가 보인다.
   기본(사용자)은 깔끔하게 별점·스펙만. ?ops=0 으로 끈다. */
(() => {
  const v = new URLSearchParams(location.search).get("ops");
  if (v === "1") localStorage.setItem("ops", "1");
  else if (v === "0") localStorage.removeItem("ops");
})();
const OPS = localStorage.getItem("ops") === "1";
const LEGAL_LINKS = ` · <a href="privacy.html" style="color:var(--muted);text-decoration:underline">개인정보처리방침</a> · <a href="terms.html" style="color:var(--muted);text-decoration:underline">이용약관</a>`;

/* 세트 수량 한도(같은 상품 pcode 기준): 텐트류·침낭·매트·코트·가방 = 1, 의자 = 4, 테이블 = 2, 나머지 = 4 */
const SET_QTY_MAX = {
  "backpacking-tent": 1, "auto-tent": 1, "shelter": 1, "tarp": 1,
  "sleeping-bag": 1, "mat": 1, "cot": 1, "backpacking-bag": 1,
};
const qtyMax = slug => SET_QTY_MAX[slug] ?? (slug === "chair" ? 4 : slug === "table" ? 2 : 4);

/* FE-WISH-09 — '도장판' 세트 구성(SET-COMPOSITION-PLAN.md, v1).
   핵심 규칙: 완성 = 슬롯에 1개라도 담기면(0→≥1). 정원(cap)은 목표가 아니라 상한선 —
   넘기려 할 때만 교체 유도. 15개 카테고리를 그룹 10칸으로 묶음(타입별 cap=0이면 비노출 → auto는 9칸).
   완성도 = 채운 필수슬롯 / 노출 필수슬롯(슬롯 안 개수 무관, 0이냐 아니냐만 봄). */
const SET_SLOTS = [
  { key: "tent",     slugs: ["backpacking-tent","auto-tent","shelter"], icon: "⛺", label: "텐트·쉘터", tier: "must" },
  { key: "tarp",     slugs: ["tarp"],              icon: "⛱️", label: "타프",      tier: "nice" },
  { key: "sleeping", slugs: ["sleeping-bag"],      icon: "🛌", label: "침낭",      tier: "must" },
  { key: "mat",      slugs: ["mat","cot"],         icon: "🧘", label: "매트·침대",  tier: "must" },
  { key: "chair",    slugs: ["chair"],             icon: "🪑", label: "의자",      tier: "must" },
  { key: "table",    slugs: ["table"],             icon: "🪵", label: "테이블",     tier: "nice" },
  { key: "cook",     slugs: ["burner","cookware"], icon: "🔥", label: "화력",      tier: "nice" },
  { key: "light",    slugs: ["lantern"],           icon: "🔦", label: "랜턴",      tier: "nice" },
  { key: "living",   slugs: ["cooler","wagon","firepit","powerbank"], icon: "🧊", label: "살림", tier: "opt" },
  { key: "bag",      slugs: ["backpacking-bag"],   icon: "🎒", label: "가방",      tier: "opt" },
];
/* 세트 타입별 정원 프리셋(상한선). cap=0 → 해당 타입에서 슬롯 비노출.
   label=짧은 표시명(카드/배지), optLabel=드롭다운용 쉬운 말(상황어+괄호용어), caption=선택 따라 바뀌는 회색 보조 1줄. */
const SET_TYPES = {
  auto:        { label: "오토캠핑", icon: "🏕️", optLabel: "가족과 차로 (오토캠핑)",   caption: "4인 가족 기준 · 침낭·의자 최대 4", caps: { tent:1, tarp:1, sleeping:4, mat:4, chair:4, table:1, cook:2, light:2, living:4, bag:0 } },
  backpacking: { label: "백패킹",   icon: "🥾", optLabel: "가볍게 배낭 메고 (백패킹)", caption: "1~2인 기준 · 무게 줄이기",        caps: { tent:1, tarp:1, sleeping:2, mat:2, chair:1, table:0, cook:1, light:1, living:0, bag:1 } },
  carcamp:     { label: "차박",     icon: "🚐", optLabel: "차에서 자기 (차박)",       caption: "차량 취침 기준 · 텐트 생략",      caps: { tent:0, tarp:1, sleeping:2, mat:2, chair:2, table:1, cook:1, light:1, living:4, bag:0 } },
};
const DEFAULT_SET_TYPE = "auto";
const SET_TYPE_ORDER = ["auto", "backpacking", "carcamp"];
const setTypeCaps = type => (SET_TYPES[type] || SET_TYPES[DEFAULT_SET_TYPE]).caps;
const setTypeCaption = type => (SET_TYPES[type] || SET_TYPES[DEFAULT_SET_TYPE]).caption;
const slotCap = (slot, type) => setTypeCaps(type)[slot.key] ?? 0;
const slotForSlug = slug => SET_SLOTS.find(sl => sl.slugs.includes(slug)) || null;
/* 슬롯에 담긴 수량 합(여러 하위 slug 합산) */
const slotCount = (items, slot) => (items || []).reduce((n, x) => slot.slugs.includes(x.s) ? n + (x.qty || 1) : n, 0);
/* 현재 타입에서 노출되는 슬롯(cap>0) */
const activeSlots = type => SET_SLOTS.filter(sl => slotCap(sl, type) > 0);
/* 완성도: 채운 필수슬롯 / 노출 필수슬롯 (슬롯 안 개수 무관, 0이냐 아니냐만) */
function setCompletion(set) {
  const type = (set && set.type) || DEFAULT_SET_TYPE;
  const must = activeSlots(type).filter(sl => sl.tier === "must");
  const filled = must.filter(sl => slotCount((set && set.items) || [], sl) >= 1).length;
  const total = must.length;
  return { filled, total, pct: total ? Math.round(filled / total * 100) : 0, complete: total > 0 && filled === total };
}
/* FE-WISH-10(B-2-3): 완성도 미니 도장판 — 분수("필수 1/4") 대신 채운 dot(컬러)·빈 dot(점선).
   모달·세트상세·계정카드 3곳 동일 컴포넌트. 표시 전용(완성 판정 로직 불변). */
function miniStampBoard(set) {
  const c = setCompletion(set);
  if (!c.total) return "";
  if (c.complete) return `<span class="stamp-mini" aria-label="필수 도장 모두 채움 (완성)"><span class="stamp-done">🏕️ 완성</span></span>`;
  const type = (set && set.type) || DEFAULT_SET_TYPE;
  const must = activeSlots(type).filter(sl => sl.tier === "must");
  const dots = must.map(sl => {
    const on = slotCount((set && set.items) || [], sl) >= 1;
    return `<span class="stamp-dot${on ? " on" : ""}" title="${esc(sl.label)}${on ? " ✓" : " 비어있음"}"></span>`;
  }).join("");
  return `<span class="stamp-mini" aria-label="필수 도장 ${c.filled}/${c.total} 채움"><span class="stamp-dots">${dots}</span></span>`;
}
/* FE-WISH-10(B-2-2): 세트 타입 선택 — 세그먼트 버튼 3개 + 선택 따라 바뀌는 회색 캡션 1줄.
   모달(새 세트 생성)·세트 상세(타입 변경) 공유. 기본값=auto.
   선택값은 컨테이너 div의 data-value에 저장. */
function setTypePickHtml(currentType, selectClass, labelText) {
  const cur = SET_TYPES[currentType] ? currentType : DEFAULT_SET_TYPE;
  const lbl = labelText || "세트 유형";
  const btns = SET_TYPE_ORDER.map(k => {
    const t = SET_TYPES[k];
    const active = k === cur ? " stp-active" : "";
    return `<button type="button" class="stp-btn${active}" data-val="${k}" aria-pressed="${k === cur}">${t.icon}<span>${esc(t.label)}</span></button>`;
  }).join("");
  return `<div class="set-type-pick">
    <span class="set-type-label">${esc(lbl)}</span>
    <div class="${selectClass} stp-seg" data-value="${cur}" role="group" aria-label="${esc(lbl)}">${btns}</div>
    <span class="set-type-caption">${esc(setTypeCaption(cur))}</span>
  </div>`;
}

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
  "백패킹가방": "🎒",
};
const catIcon = name => CAT_ICON[name] || "🏕️";
/* 카테고리별 옅은 배경 톤(아이콘 타일 — 단색 회색 대신 생동감) */
const CAT_TINT = {
  "백패킹텐트": "#eaf4ec", "오토캠핑텐트": "#eaf4ec", "쉘터": "#eaf4ec", "기타용품": "#f0f0f2", "타프": "#e6f4f7",
  "침낭": "#eef0fb", "매트": "#eef0fb", "야전침대": "#eef0fb", "아이스박스": "#e6f4f7",
  "의자": "#f6efe7", "테이블": "#f6efe7", "웨건": "#f6efe7",
  "버너": "#fdeee7", "화로대": "#fdeee7", "코펠": "#fdeee7",
  "랜턴": "#fdf6e0", "파워뱅크": "#fdf6e0",
  "백패킹가방": "#eaf4ec",
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
const won = n => { const x = Number(n); return (n == null || !Number.isFinite(x)) ? "—" : x.toLocaleString("ko-KR") + "원"; };  // L-250: NaN/비숫자 가드

// FE-002·010·011·013·014: created_at/iso 가 null·빈값·invalid 일 때 new Date(null)→"1970년 1월 1일" 노출 방지 공통 헬퍼.
function fmtDate(iso, opts, fallback) {
  if (!iso) return fallback || "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? (fallback || "") : d.toLocaleDateString("ko-KR", opts || { year: "numeric", month: "long", day: "numeric" });
}
// R2-2(M-180/M-233): https URL만 허용. coupang_url·이미지 src는 localStorage/DB 유래라 javascript:·data: 스킴 주입 가능 → 차단.
const safeHttps = u => (typeof u === "string" && /^https:\/\//i.test(u)) ? u : "";
const priceRange = (a, b) => (a == null || a === 0) ? ((b == null || b === 0) ? '<span class="nd">가격없음</span>' : won(b)) : won(a);  // M-480: price_min null시 price_max 폴백
// FE-ITEM-05: 표시가는 price_min(최저가) 기준 — 실제 쿠팡가와 다를 수 있어 가격 옆 '최저가 기준' 캡션을 일관 부착.
const PRICE_BASIS_CAP = '<span class="price-basis">최저가 기준</span>';
// 가격 + 캡션. 값 없으면 캡션 없이 nullHtml(곳마다 '가격없음'/'—' 등) 반환(AC4).
const priceLabeled = (n, nullHtml = '<span class="nd">가격없음</span>') =>
  (n == null || n === 0) ? nullHtml : won(n) + PRICE_BASIS_CAP;

/* 값 표시: 무게(g) 1000↑ → kg, 부피(cm3) 1000↑ → L 환산 */
const _UNIT_DISPLAY = { C: "°C", m2: "m²", cm3: "cm³" };  // L-17: JSON 데이터 단위 → 표시 문자 매핑 (L-286: cm3<1000도 cm³)
function fmtVal(v, unit) {
  if (v == null) return "—";
  const x = Number(v);                                   // M-232/M-292: string·"N/A" 등 비숫자 입력 시 .toFixed 크래시 방어
  if (!Number.isFinite(x)) return "—";
  if (unit === "g" && x >= 1000) return +(x / 1000).toFixed(2) + "kg";
  if (unit === "cm3" && x >= 1000) return +(x / 1000).toFixed(1) + "L";
  const shown = Number.isInteger(x) ? x : +x.toFixed(2);  // L-240: 정수는 소수점 없이(500g), 소수만 최대 2자리
  return shown + (_UNIT_DISPLAY[unit] || unit || "");
}

function stars(n) {
  if (n == null) return '<span class="nd">—</span>';
  n = Math.max(0, Math.min(5, n));  // M-540: 음수 별점 하한 적용
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

/* BE-073/079: 네이티브(Capacitor) 앱은 셸(HTML/JS/CSS)만 번들하고, 데이터(data/*.json)·상품
   이미지(images/*)는 라이브 gear-forest.com에서 로드한다.
   → 가격·카탈로그가 항상 최신(BE-073: 번들 스냅샷 동결 해소), IPA 경량(BE-079: 158MB 제외).
   웹(gear-forest.com / 로컬 dev)에서는 IS_NATIVE=false → 기존 상대경로 그대로(무회귀). */
const GF_ORIGIN = "https://gear-forest.com";
const IS_NATIVE = !!(typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.());
// 상대 자원경로를 네이티브에선 라이브 절대 URL로 승격. 이미 절대/data:/blob: URL이면 그대로 둔다.
function gfAsset(p) {
  if (!p || !IS_NATIVE) return p;
  if (/^(https?:)?\/\//.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  return GF_ORIGIN + "/" + p.replace(/^\.?\//, "");
}

const _getJSONCache = new Map();  // M-455: 동시 호출 dedup — 동일 URL in-flight 요청 공유
async function _fetchJSON(url, origPath) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${origPath} ${r.status}`);
  // H-60: GitHub Pages가 누락 경로에 200+HTML(커스텀 404/SPA fallback)을 주면 .json() 파싱오류가
  // caller의 .catch(()=>[])에 무음으로 삼켜져 빈 목록이 정상처럼 표시됨 → JSON이 아니면 명시적으로 throw+경고
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("json")) {
    const head = (await r.text()).slice(0, 80).replace(/\s+/g, " ");
    console.warn(`[getJSON] non-JSON response for ${origPath} (content-type: ${ct || "none"}): ${head}`);
    throw new Error(`${origPath}: non-JSON (${ct || "none"})`);
  }
  return r.json();
}
async function getJSON(p) {
  if (_getJSONCache.has(p)) return _getJSONCache.get(p);
  const promise = (async () => {
    // BE-073: 네이티브는 라이브 데이터 우선 → 실패(오프라인 등) 시 번들 스냅샷으로 폴백.
    const remote = gfAsset(p);
    try {
      return await _fetchJSON(remote, p);
    } catch (e) {
      if (IS_NATIVE && remote !== p) {
        console.warn(`[getJSON] live fetch 실패 → 번들 폴백: ${p}`, e);
        return await _fetchJSON(p, p);
      }
      throw e;
    }
  })();
  _getJSONCache.set(p, promise);
  promise.finally(() => _getJSONCache.delete(p));
  return promise;
}

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
  const loadAttr = (imgCls === "hot-card-img") ? "eager" : "lazy";  // FE-148: recard-thumb(최근 본 상품)은 뷰포트 밖이라 lazy로 — 불필요한 eager 요청 제거
  // BE-079: 네이티브 앱은 상품 이미지를 번들에 넣지 않으므로 라이브 gear-forest.com에서 로드.
  return `<img class="${imgCls}" src="${esc(gfAsset(img))}" alt="${esc(name)}" loading="${loadAttr}"${szAttr}` +
    ` data-tint="${tint}" data-icon="${icon}" data-fcls="${noCls}" onerror="thumbFallback(this)">`;
}
function thumbFallback(img) {
  const d = document.createElement("div");
  d.className = img.dataset.fcls || "pli-noimg";
  d.style.background = img.dataset.tint || "var(--card2)";
  d.innerHTML = (img.dataset.icon || "🏕️") + "<span>이미지 준비중</span>";
  img.replaceWith(d);
}

/* 찜(위시리스트) — 로그인 필수(FE-AUTH-01 §C). 비로그인 시 requireLogin 게이트.
   항목: {key, b(브랜드), m(모델), cap(인원), s(카테고리슬러그), p(최저가), img} */
function getWish() { try { return JSON.parse(localStorage.getItem("wish") || "[]"); } catch (e) { return []; } }
function setWish(a) {
  try { localStorage.setItem("wish", JSON.stringify(a)); } catch (e) { showToast("저장 공간이 부족해 찜이 기기에 저장되지 않았어요."); }  // FE-028: 무음 폐기 → 사용자 통보
  if (typeof window !== "undefined" && typeof window.onWishChange === "function") {
    try { window.onWishChange(a); } catch (e) {}
  }
}
function wishKey(b, m, cap) { return [b, m, cap == null ? "" : cap].join("|"); }
const BOOKMARK_SVG = '<svg class="wish-ico" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>';
const SHARE_SVG = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
function inWish(key) { return getWish().some(x => x.key === key); }
// _execToggleWish: 실제 localStorage 토글. requireLogin 통과 후에만 호출.
function _execToggleWish(item) {
  const a = getWish(), i = a.findIndex(x => x.key === item.key);
  const added = i < 0;
  if (i >= 0) a.splice(i, 1);
  else {
    if (a.length >= 500) { showToast("찜은 최대 500개까지 담을 수 있어요."); return false; }  // FE-103: 서버 chk_wishlist_len(500)·merge 상한과 일치 — 초과 시 원격 저장 실패 방지
    a.push(item);
  }
  setWish(a);
  // B-1: 첫 찜(추가) 시 가격알림 푸시 구독을 1회 요청(찜 = 가격 추적 대상).
  //  앱(Capacitor)=네이티브 APNs 토큰 등록 / 웹=Web Push 구독. 둘 다 권한거부·기구독 자체처리.
  if (added) {
    const u = window.currentUser && window.currentUser();
    if (u && u.id) {
      if (window.Capacitor?.isNativePlatform?.()) {
        import("./supabaseClient.js?v=0cfa00cd").then(m => m.registerNativePush && m.registerNativePush()).catch(() => {});
      } else if ("serviceWorker" in navigator && "PushManager" in window) {
        requestPushSubscription(u.id);
      }
    }
  }
  return added;
}
// toggleWish: 비로그인이면 게이트 후 현재 상태 반환(토글 없음).
// auth 완료 전 클릭(드문 케이스)은 완료 후 결정.
function toggleWish(item) {
  function _gate() {
    try { sessionStorage.setItem('auth-intent', JSON.stringify({action:'toggleWish',params:item,returnTo:location.href})); } catch(_){}
    _showAuthGateModal();
  }
  if (window._gAuthReady) {
    if (!window.isLoggedIn()) { _gate(); return inWish(item.key); }
    return _execToggleWish(item);
  }
  // auth 초기화 중 — 완료 후 결정(버튼은 현재 상태 유지)
  window.authReady().then(() => {
    if (window.isLoggedIn()) { const added = _execToggleWish(item); _paintWishBtn(item.key, added); }
    else _gate();
  });
  return inWish(item.key);
}
function _paintWishBtn(key, on) {
  // item 상세 페이지 버튼
  const b = document.getElementById('item-wish');
  if (b && (b.dataset.key === key || !b.dataset.key)) {
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    const l = b.querySelector('.iw-label'); if (l) l.textContent = on ? '찜함' : '찜하기';
  }
  // 리스트/카테고리 뷰 버튼
  document.querySelectorAll(`.wish-btn[data-key="${CSS.escape(key)}"]`).forEach(btn => {
    btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on));
  });
}
// toggleWishWithHint: 기존 호출부(카테고리/상세 뷰)용. 힌트 대신 requireLogin 게이트.
// M-174/M-305/M-372: _gAuthReady 미완료 시 toggleWish와 동일한 authReady() 대기 경로 사용.
// UXUI-015: 찜 토글 결과 토스트. 전(wasIn)/후(inWish) 비교라 500 상한 차단(미변경) 시 중복/오메시지 없음.
function _wishToggleToast(wasIn, key) {
  const nowIn = inWish(key);
  if (!wasIn && nowIn) showToast("찜 목록에 추가했어요");
  else if (wasIn && !nowIn) showToast("찜을 해제했어요");
}
function toggleWishWithHint(item, btn) {
  function _gate() {
    requireLogin({ action: 'toggleWish', params: item, returnTo: location.href });
  }
  if (window._gAuthReady) {
    if (!window.isLoggedIn()) { _gate(); return inWish(item.key); }
    const wasIn = inWish(item.key);
    const added = _execToggleWish(item);
    if (btn) { btn.classList.toggle("on", added); btn.setAttribute("aria-pressed", String(added)); }
    _wishToggleToast(wasIn, item.key);   // UXUI-015: 찜 처리 결과 토스트(전/후 비교 — cap 미변경 시 미표시)
    return added;
  }
  // auth 초기화 중 — 완료 후 결정
  window.authReady().then(() => {
    if (window.isLoggedIn()) {
      const wasIn = inWish(item.key);
      const added = _execToggleWish(item);
      _paintWishBtn(item.key, added);
      if (btn) { btn.classList.toggle("on", added); btn.setAttribute("aria-pressed", String(added)); }
      _wishToggleToast(wasIn, item.key);
    } else _gate();
  });
  return inWish(item.key);
}
// 모델·카테고리슬러그 → 위시/최근 항목(공용 형태)
function wishItem(m, slug) {
  return { key: wishKey(m.brand, m.model, m.capacity), b: m.brand, m: m.model,
           cap: m.capacity, s: slug, p: m.price_min, img: m.img,
           pcode: wishKey(m.brand, m.model, m.capacity),
           gf_code: m.gf_code ?? null,   // P0.5: 가격알림 서버매칭용 내부품번
           weight_g: m.specs?.weight_min?.value ?? null,
           coupang_url: m.coupang_url ?? null };   // M-146: setItem과 필드 일치
}

/* ── 장비 세트 빌더 — localStorage 저장 (로그인 없이도 동작) ──
   세트 구조: {id, title, style, items:[{pcode,b,m,cap,s,p,img,weight_g,qty}], created_at} */
function getSets() { try { return JSON.parse(localStorage.getItem("gear_sets") || "[]"); } catch (e) { return []; } }
function saveSets(a) { try { localStorage.setItem("gear_sets", JSON.stringify(a)); } catch (e) { console.error("saveSets:", e); showToast("저장 공간이 부족해요. 일부 세트가 저장되지 않았을 수 있어요."); } }  // H-115: QuotaExceededError 전파 방지
function showToast(msg, duration) {
  // M-238: isHtml=true(innerHTML 직접삽입) 경로는 호출자가 전무했고 XSS 표면만 남겨 제거 — 항상 textContent.
  let t = document.getElementById("app-toast");
  if (!t) {
    t = document.createElement("div"); t.id = "app-toast";
    t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); t.setAttribute("aria-atomic", "true");  // UXUI-008: 스크린리더에 토스트 메시지 전달(배너·sortbar와 동일 패턴)
    // L-377: GNB 비활성 상태에선 bottom:80px가 불필요한 여백 → GNB 높이 변수 기반(없으면 24px)으로 계산.
    // FE-131: white-space:nowrap 제거 + 줄바꿈 허용(word-break:keep-all) → 긴 한글 메시지 잘림 방지
    t.style.cssText = "position:fixed;bottom:calc(24px + var(--gnb-height, 0px) + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%) translateY(20px);background:var(--txt);color:var(--bg);padding:10px 18px;border-radius:16px;font-size:13px;font-weight:600;line-height:1.45;z-index:9999;opacity:0;transition:opacity .2s,transform .2s;white-space:normal;word-break:keep-all;max-width:min(90vw,360px);text-align:center";
    document.body.appendChild(t);
  }
  clearTimeout(t._tid);
  t.textContent = msg; t.style.pointerEvents = "none";
  if (t._shown) {  // FE-133: 이미 표시 중이면 진입 애니메이션 재실행 없이 텍스트만 교체(연속 호출 깜빡임 방지)
    t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)";
  } else {
    t._shown = true;
    requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
  }
  t._tid = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(20px)"; t.style.pointerEvents = "none"; t._shown = false; }, duration || 2400);  // M-208/M-327: fade 후 포인터 이벤트 차단 유지
}
/* UXUI-019(cluster B): window.confirm()은 iOS WKWebView/PWA에서 차단되어 무응답 → Promise<boolean> 커스텀 모달로 대체.
   alert/confirm 치환 공통 유틸로 재사용. ESC·백드롭=취소, 포커스 트랩·복귀 포함(_trapTab 재사용). */
function uiConfirm(message, { ok = "확인", cancel = "취소", danger = false } = {}) {
  return new Promise(resolve => {
    const prevFocus = document.activeElement;
    const m = document.createElement("div");
    m.className = "pmodal on";
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
    const okStyle = "flex:1;justify-content:center;padding:10px" + (danger ? ";border-color:#e53e3e;color:#e53e3e" : "");
    m.innerHTML = `<div class="pmbox" style="max-width:320px;width:100%;padding:24px">
      <p style="font-size:15px;line-height:1.6;white-space:pre-line;margin:0 0 20px">${esc(message)}</p>
      <div style="display:flex;gap:8px">
        <button type="button" class="achip clear" id="uic-cancel" style="flex:1;justify-content:center;padding:10px">${esc(cancel)}</button>
        <button type="button" class="achip" id="uic-ok" style="${okStyle}">${esc(ok)}</button>
      </div></div>`;
    document.body.appendChild(m);
    let done = false;
    const close = (val) => {
      if (done) return; done = true;
      m.remove();
      document.removeEventListener("keydown", onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      resolve(val);
    };
    const onKey = e => { if (e.key === "Escape") { close(false); return; } _trapTab(e, m); };
    document.addEventListener("keydown", onKey);
    m.querySelector("#uic-cancel").onclick = () => close(false);
    m.querySelector("#uic-ok").onclick = () => close(true);
    m.onclick = e => { if (e.target === m) close(false); };
    m.querySelector("#uic-ok").focus();
  });
}
function newSet(title, type) {
  const s = { id: Date.now().toString(36), title, type: type || DEFAULT_SET_TYPE, style: "", items: [], created_at: new Date().toISOString() };
  const a = getSets(); a.unshift(s); saveSets(a); return s;
}
/* FE-WISH-09 담기 가드: 슬롯 정원(상한) 도달 시 추가 대신 'cap' 반환 → 호출부가 교체 유도.
   반환 { status: 'added'|'cap'|'noset', set?, slot? }. 정원 미만이면 그냥 담거나 수량 증가. */
function addToSet(setId, item) {
  const a = getSets(), s = a.find(x => x.id === setId);
  if (!s) return { status: "noset" };
  const type = s.type || DEFAULT_SET_TYPE;
  const slot = slotForSlug(item.s);
  const cap = slot ? slotCap(slot, type) : 0;
  const i = s.items.findIndex(x => x.pcode != null && x.pcode === item.pcode);  // L-214: pcode 없는 구 항목끼리 undefined===undefined 오매칭(중복 오탐) 방지 — 양쪽 다 있을 때만 동일 취급
  if (i >= 0) {
    // 같은 상품 수량 증가 — 같은-상품 한도(qtyMax)와 슬롯 정원(cap) 둘 다 검사
    const cur = s.items[i].qty || 1;
    const slotFull = slot && cap > 0 && slotCount(s.items, slot) >= cap;
    if (cur >= qtyMax(item.s) || slotFull) return { status: "cap", set: s, slot };
    s.items[i].qty = cur + 1; saveSets(a); return { status: "added", set: s };
  }
  // 새(다른) 상품 — 슬롯 정원 도달 시 교체 유도(P1: 다른 텐트 2개째 차단)
  if (slot && cap > 0 && slotCount(s.items, slot) >= cap) return { status: "cap", set: s, slot };
  s.items.push({ ...item, qty: 1 }); saveSets(a); return { status: "added", set: s };
}
function setItem(m, slug, idx) {
  return { pcode: wishKey(m.brand, m.model, m.capacity), b: m.brand, m: m.model,
           cap: m.capacity, s: slug, p: m.price_min, img: m.img,
           gf_code: m.gf_code ?? null,   // P0.5: 가격알림 서버매칭용 내부품번
           weight_g: m.specs?.weight_min?.value ?? null,
           coupang_url: m.coupang_url ?? null,
           item_idx: idx ?? null };   // 핫섹션 직접 링크(/item/${slug}/item-N.html)용
}

async function openSetModal(item) {
  const allowed = await requireLogin({ action: 'openSetModal', params: item, returnTo: location.href });
  if (!allowed) return;
  let modal = document.getElementById("set-modal");
  if (!modal) {
    modal = document.createElement("div"); modal.id = "set-modal"; modal.className = "pmodal";  // L-112: dialog role은 내부 .pmbox에만
    document.body.appendChild(modal);
  }
  const sets = getSets();
  // FE-WISH-10(B-2-3): 완성도는 미니 도장판으로. (B-2-5) 기존/새 세트 섹션 구분.
  const setListHtml = sets.length
    ? sets.map(s => {
        const tdef = SET_TYPES[s.type] || SET_TYPES[DEFAULT_SET_TYPE];
        return `<button class="sm-set-btn" data-sid="${s.id}">
        <span class="sm-set-name">${tdef.icon} ${esc(s.title)}</span>
        <span class="sm-set-cnt">${miniStampBoard(s) || `${s.items.length}개`}</span></button>`;
      }).join("")
    : `<div class="sm-empty">아직 만든 세트가 없어요 — 아래에서 새로 만들어요.</div>`;
  modal.innerHTML = `<div class="pmbox sm-box" role="dialog" aria-modal="true">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <div class="sm-head">
      <div class="sm-title">장비 꾸러미에 담기</div>
      <div class="sm-item">${esc(item.b)} ${esc(item.m)}</div>
    </div>
    ${sets.length ? `<div class="sm-section-label">기존 세트에 담기</div>` : ""}
    <div class="sm-list">${setListHtml}</div>
    <div class="sm-divider"></div>
    <div class="sm-new">
      <div class="sm-new-label">새 세트 만들기</div>
      ${setTypePickHtml(DEFAULT_SET_TYPE, "sm-type-select", "어떤 캠핑인가요?")}
      <div class="sm-new-row">
        <input class="sm-input" type="text" placeholder="새 세트 이름 입력" maxlength="40">
        <button class="sm-create">만들기</button>
      </div>
    </div></div>`;
  modal.classList.add("on");
  const prevFocus = document.activeElement;   // L-143: 닫을 때 포커스 복귀
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);  // M-474: 중복 등록 방지
  const close = () => { clearTimeout(modal._addTid); modal.classList.remove("on"); document.removeEventListener("keydown", modal._onKey); modal._onKey = null; if (prevFocus && prevFocus.focus) prevFocus.focus(); };  // L-364: 보류 중인 add-후-닫기 타이머 취소(조기 닫기/재오픈 시 새 모달 오닫힘 방지)
  const onKey = e => {   // L-174: Tab focus trap + ESC
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const box = modal.querySelector(".pmbox");
    const f = box.querySelectorAll('button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  modal._onKey = onKey;
  document.addEventListener("keydown", onKey);
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  // 세그먼트 버튼 클릭 시 캡션 갱신(생성 전이라 세트엔 아직 미적용)
  const typeSel = modal.querySelector(".sm-type-select");
  const typeCap = modal.querySelector(".sm-new .set-type-caption");
  if (typeSel) typeSel.querySelectorAll(".stp-btn").forEach(btn => btn.onclick = () => {
    typeSel.querySelectorAll(".stp-btn").forEach(b => { b.classList.remove("stp-active"); b.setAttribute("aria-pressed","false"); });
    btn.classList.add("stp-active"); btn.setAttribute("aria-pressed","true");
    typeSel.dataset.value = btn.dataset.val;
    if (typeCap) typeCap.textContent = setTypeCaption(btn.dataset.val);
  });
  modal.querySelectorAll(".sm-set-btn").forEach(btn => btn.onclick = () => {
    modal.querySelectorAll(".sm-set-btn").forEach(b => b.disabled = true);
    const res = addToSet(btn.dataset.sid, item);
    if (res.status === "cap") {  // FE-024: 슬롯 없는 카테고리 qty 한도 초과 시 빈 교체 모달 대신 안내
      close();
      if (res.slot) openReplaceModal(btn.dataset.sid, item, res.slot);
      else showToast(`같은 장비는 최대 ${qtyMax(item.s)}개까지 담을 수 있어요`);
      return;
    }
    btn.textContent = "✓ 추가됨";
    modal._addTid = setTimeout(() => { close(); showSetConfirm(btn.dataset.sid); }, 400);  // L-364: 타이머 id 저장 → close()에서 취소 가능
  });
  const inp = modal.querySelector(".sm-input");
  modal.querySelector(".sm-create").onclick = () => {
    // L-345: .trim()은 NBSP( )는 제거하나 zero-width(ZWSP/ZWNJ/ZWJ/BOM)는 못 지움 → 보이지 않는 빈 이름 통과 방지
    const t = inp.value.replace(/[​-‍﻿]/g, "").trim(); if (!t) { inp.focus(); return; }
    const type = modal.querySelector(".sm-type-select")?.dataset.value || DEFAULT_SET_TYPE;
    const s = newSet(t, type); const _r = addToSet(s.id, item);  // M-175/M-302: 반환값 검사
    close();
    if (_r.status === "added") showSetConfirm(s.id);
    else showToast("담기에 실패했어요 — 슬롯 한도를 확인해 주세요.");
  };
  inp.onkeydown = e => { if (e.key === "Enter") modal.querySelector(".sm-create").click(); };
  modal.querySelector(".pmx").focus();
}

/* FE-WISH-09: 슬롯 정원(상한) 도달 시 교체 모달 — 기존 항목 하나를 빼고 새 항목을 담는다.
   정원 미만에서는 호출되지 않음(압박 금지 규칙). */
function openReplaceModal(setId, item, slot) {
  const sets = getSets();
  const s = sets.find(x => x.id === setId);
  if (!s || !slot) return;
  const cap = slotCap(slot, s.type || DEFAULT_SET_TYPE);
  const inSlot = s.items.map((x, ii) => ({ x, ii })).filter(o => slot.slugs.includes(o.x.s));
  let modal = document.getElementById("set-replace-modal");
  if (!modal) { modal = document.createElement("div"); modal.id = "set-replace-modal"; modal.className = "pmodal"; document.body.appendChild(modal); }
  // M-237/M-297: pcode를 버튼에 저장해 splice 전 동일성 검증 → 스테일 data-ii 오삭제 방지
  const rows = inSlot.map(o => `<button type="button" class="srp-item" data-ii="${o.ii}" data-pcode="${esc(o.x.pcode || '')}">
      <span class="srp-item-name">${esc(`${o.x.b || ""} ${o.x.m || ""}`.trim())}${(o.x.qty || 1) > 1 ? ` ×${o.x.qty}` : ""}</span>
      <span class="srp-item-act">빼고 담기 ›</span></button>`).join("");
  modal.innerHTML = `<div class="pmbox" role="dialog" aria-modal="true" aria-labelledby="srp-title" style="max-width:380px;width:100%;padding:22px">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <h2 id="srp-title" style="font-size:16px;font-weight:700;margin:0 0 4px">${slot.icon} ${esc(slot.label)} 칸이 찼어요</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 16px">이 칸은 최대 ${cap}개예요. <b>${esc(`${item.b || ""} ${item.m || ""}`.trim())}</b>을(를) 담으려면 무엇을 뺄까요?</p>
    <div class="srp-list">${rows}</div>
    <button type="button" class="srp-cancel">그냥 둘게요</button>
  </div>`;
  modal.classList.add("on");
  const prevFocus = document.activeElement;
  const close = () => { modal.classList.remove("on"); document.removeEventListener("keydown", onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); };
  const onKey = e => { if (e.key === "Escape") { close(); return; } _trapTab(e, modal); };   // L-245: Tab 포커스 트랩
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);  // L-243: 재호출 시 onKey 누적 방지
  modal._onKey = onKey;
  document.addEventListener("keydown", onKey);
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  modal.querySelector(".srp-cancel").onclick = close;
  modal.querySelectorAll(".srp-item").forEach(btn => btn.onclick = () => {
    const arr = getSets(); const set = arr.find(x => x.id === setId); if (!set) { close(); return; }
    // M-237/M-297: 스테일 data-ii 방지 — pcode로 동일성 검증 후 splice
    const ii = +btn.dataset.ii;
    const actual = set.items.findIndex((x, i) => i === ii && (x.pcode || '') === (btn.dataset.pcode || ''));
    const spliceIdx = actual >= 0 ? actual : set.items.findIndex(x => (x.pcode || '') === (btn.dataset.pcode || '') && slot.slugs.includes(x.s));
    if (spliceIdx < 0) { close(); return; }
    set.items.splice(spliceIdx, 1);   // 기존 항목 제거
    saveSets(arr);
    const res = addToSet(setId, item);       // 이제 자리 생김 → 새 항목 담기
    close();
    renderAccount();
    openSetDetail(setId);  // M-543: 교체 후 세트 상세 재열기 (UI stale 방지)
    if (res.status === "added") showSetConfirm(setId);
  });
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
  const pStr = tp > 0 ? `${tp.toLocaleString('ko-KR')}원` : null;
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
  card.querySelector(".sac-view").onclick = () => {
    dismiss();
    location.href = `/account.html?open-set=${encodeURIComponent(setId)}#sets`;
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
  if (!item.s || !item.key) return;   // M-485: key 없으면 dedup 불가 → 기록 생략
  const a = getRecent().filter(x => x.key !== item.key);
  a.unshift(item);
  // L-403/L-461: QuotaExceeded 시 항목 수를 줄여 1회 재시도 → 저장공간 압박에도 최근 목록이 계속 갱신되도록
  try { localStorage.setItem("recent", JSON.stringify(a.slice(0, 12))); }
  catch (e) { try { localStorage.setItem("recent", JSON.stringify(a.slice(0, 4))); } catch (_) { /* 끝까지 실패 시 무시 */ } }
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
const COMMUNITY_LOG_ENABLED = false; // FE-SOC-10: 마이페이지 '내 로그'의 커뮤니티 글(posts) 노출 아카이브 — 복구하려면 true. 데이터·편집/삭제 로직은 보존, 노출만 끔

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
    a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`;
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
    `<b>${totalModels.toLocaleString('ko-KR')}개</b> 모델 · ${m.categories.length}개 카테고리를 정량 스펙으로 별점 비교`;

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

  // 캠핑 스타일 추천 진입 — 모든 스타일 recommend.html?p=KEY 로 연결 (H-40)
  const PERSONA_CAT = {};
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
      <div class="meta">${c.count.toLocaleString('ko-KR')}개 모델</div>
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
    // M-204/M-371/M-435: 실패 시 idx·idxLoading 모두 초기화 → 재시도 가능
    if (!idxLoading) idxLoading = getJSON("data/search.json?v=9416ba63").then(d => (idx = d)).catch(e => { idxLoading = null; console.warn("search.json load failed", e); return []; });
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
    if (!idx) { const _q = inp.value; ensureIdx().then(() => { if (inp.value === _q) run(); }); return; }  // L-14+M-369: 인덱스 미로드 시 로드 후 재실행, 쿼리 바뀌면 취소
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
      // H-65: raw 텍스트를 캡처그룹으로 split → 홀수 인덱스가 매치 조각. 각 조각을 개별 escape.
      // (esc 먼저 적용 후 정규식을 돌리면 &amp; 등 엔티티 내부에 <mark>가 끼어 깨진 HTML 생성)
      return String(text).split(re).map((seg, i) =>
        i % 2 === 1 ? `<mark class="shl">${esc(seg)}</mark>` : esc(seg)
      ).join("");
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
        const item = { key: wishKey(x.b, x.m, x.cap || null), b: x.b, m: x.m, cap: x.cap || null, s: x.s, p: x.p, img: x.img, gf_code: x.g ?? null };
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
  inp.onblur = () => { setTimeout(() => closeBox(), 150); }
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
      // L-338: 미선택(active=-1)에서 ArrowUp은 마지막 항목으로. setActive(-2)=둘째 뒤 항목 off-by-one 방지.
      if (box.style.display !== "none" && opts.length) { e.preventDefault(); setActive(active <= 0 ? opts.length - 1 : active - 1); }
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

/* ---------- search.html 전용 인라인 검색 결과 ---------- */
async function setupSearchPage() {
  const inp = document.getElementById("homeq");
  const resultsEl = document.getElementById("search-results");
  if (!inp || !resultsEl) return;

  let idx = null;
  let _idxLoading;
  const ensureIdx = () => {
    if (idx) return Promise.resolve(idx);
    // M-369/M-371/M-450: 실패 시 _idxLoading 초기화 → 재시도 가능, in-flight 가드(H-75) 유지
    if (!_idxLoading) _idxLoading = getJSON("data/search.json?v=9416ba63").then(d => (idx = d)).catch(e => { _idxLoading = null; console.warn("search.json load failed", e); return []; });
    return _idxLoading;
  };

  let _ofsLoading = false;
  const openFromSearch = async (x) => {
    // M-451: 진행 중 fetch 동안 중복 클릭이 들어오면 모달 이중 오픈·STATE prev 스냅샷 경합이 생긴다
    //   (correctness는 M-262/M-405가 보호하나 UX 깜빡임 방지) → in-flight 가드.
    if (_ofsLoading) return;
    _ofsLoading = true;
    try {
      const catData = await getJSON(`data/${x.s}.json`);
      // FE-040: brand+model만 비교하면 다인원(1인/2인) 변형에서 첫 변형이 잡혀 오모달. capacity까지 일치시킴.
      const prod = (catData.models || []).find(p => p.brand === x.b && p.model === x.m && String(p.capacity ?? "") === String(x.cap ?? ""));
      if (prod) {
        // M-262: 직전 검색모달이 STATE를 바꿔둔 채 닫히지 않았으면 먼저 복원 → prev가 원본을 가리키게(중첩 오염 방지)
        const _pmOld = document.getElementById("pmodal");
        if (_pmOld && typeof _pmOld._onCloseOnce === "function") { const cb = _pmOld._onCloseOnce; _pmOld._onCloseOnce = null; cb(); }
        const prev = { slug: STATE.slug, data: STATE.data };
        STATE.slug = x.s; STATE.data = catData;
        openProduct(prod);
        // H-49/H-92: STATE는 모달이 닫힐 때 복원(즉시 복원 시 비동기 핸들러가 잘못된 slug 참조).
        // 모든 close 경로(ESC·백드롭·X)에서 복원되도록 일회성 close 훅 사용(onclick 패치는 ESC 우회됨).
        const _pm = document.getElementById("pmodal");
        if (_pm) _pm._onCloseOnce = () => { STATE.slug = prev.slug ?? null; STATE.data = prev.data ?? null; };  // M-405: search.html 등 STATE 미초기화 페이지에서 undefined 복원 방지
        return;
      }
    } catch (_) {}
    finally { _ofsLoading = false; }
    location.href = `category.html?cat=${x.s}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}`;
  };

  const render = (hits, q) => {
    if (!q) { resultsEl.innerHTML = ""; return; }
    if (!hits.length) {
      resultsEl.innerHTML = `<p style="color:var(--muted);font-size:14px;padding:20px 0">"${esc(q)}"에 대한 결과가 없어요.</p>`;
      return;
    }
    resultsEl.innerHTML = `<p style="font-size:12px;color:var(--muted);margin:8px 0 12px">${hits.length}개 결과${hits.length >= 50 ? " · 상위 50개" : ""}</p>` +
      `<div class="plist">` +
      hits.map((x, i) => {
        const wished = inWish(wishKey(x.b, x.m, x.cap));
        return `<div class="pli" data-si="${i}" style="cursor:pointer">
          ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "pli-thumb", "pli-noimg")}
          <div class="pli-body">
            <div class="pli-top">${esc(x.b)}${x.cap != null ? ` · ${x.cap}인` : ""}<span class="pli-cat" style="color:var(--muted);font-size:11px;margin-left:6px">${esc(x.c || "")}</span></div>
            <div class="pli-name">${esc(x.m)}</div>
            <div class="pli-price">${x.p ? x.p.toLocaleString('ko-KR') + "원~" : ""}</div>
          </div>
          <button class="pli-wish${wished ? " on" : ""}" data-si="${i}" aria-label="찜" aria-pressed="${wished}">${BOOKMARK_SVG}</button>
        </div>`;
      }).join("") + `</div>`;

    resultsEl.querySelectorAll(".pli").forEach((el, i) => {
      el.onclick = e => { if (e.target.closest(".pli-wish")) return; openFromSearch(hits[i]); };
    });
    resultsEl.querySelectorAll(".pli-wish").forEach(btn => {
      btn.onclick = () => {
        // H-70: 인라인 setWish가 requireLogin 게이트를 우회 → 비로그인 찜이 서버 미동기화되던 문제.
        // 캐노니컬 toggleWishWithHint로 위임(게이트·원격동기화·가격알림 푸시구독·버튼 페인팅 일괄).
        const x = hits[+btn.dataset.si];
        const key = wishKey(x.b, x.m, x.cap);
        const item = { key, b: x.b, m: x.m, cap: x.cap, s: x.s, p: x.p, img: x.img, pcode: key, gf_code: x.g ?? null, weight_g: x.weight_g ?? null, coupang_url: x.coupang_url ?? null };
        toggleWishWithHint(item, btn);
      };
    });
  };

  let debounce;
  const run = async () => {
    const q = inp.value.trim();
    history.replaceState(null, "", q ? `?q=${encodeURIComponent(q)}` : location.pathname);
    if (!q) { render([], ""); return; }
    const list = await ensureIdx();
    // FE-167: search.json fetch 실패 시 idx는 null로 잔류 → idx.filter 역참조 TypeError로 검색이 죽는다.
    //   ensureIdx() 반환값(실패 시 [])을 쓰고, 로드 실패(idx===null)는 안내 메시지로 분기 + 다음 입력 때 재시도(_idxLoading 리셋).
    if (idx == null) { resultsEl.innerHTML = `<p style="color:var(--muted);font-size:14px;padding:20px 0">검색 데이터를 불러오지 못했어요. 네트워크 확인 후 다시 시도해주세요.</p>`; return; }
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = list.filter(x => { const t = (x.b + " " + x.m).toLowerCase(); return terms.every(tok => t.includes(tok)); }).slice(0, 50);
    render(hits, q);
  };

  inp.addEventListener("input", e => { if (e.isComposing) return; clearTimeout(debounce); debounce = setTimeout(run, 120); });  // M-389: IME 가드
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { clearTimeout(debounce); run(); } });

  const initQ = new URLSearchParams(location.search).get("q") || "";
  if (initQ) { inp.value = initQ; await run(); }
  else inp.focus();
}

/* ---------- 캠핑 스타일 칩 상수 ---------- */
// cats: 표시할 카테고리 slug 화이트리스트. 없으면 전 카테고리.
const STYLE_META = [
  { key:"backpacking", label:"백패킹",  icon:"🏕", cats:["backpacking-tent","backpacking-bag","sleeping-bag","mat","tarp"] },
  { key:"car-camping", label:"오토캠핑",icon:"🚗", cats:["auto-tent","chair","table","cooler","cot","burner","cookware","lantern","firepit","wagon","shelter"] },
  { key:"glamping",    label:"글램핑",  icon:"✨", cats:["auto-tent","shelter","chair","table","cot","lantern","cooler","firepit"] },
  { key:"winter",      label:"겨울",    icon:"❄", cats:["backpacking-tent","auto-tent","sleeping-bag","mat"] },
  { key:"beach",       label:"해변",    icon:"🏖", cats:["auto-tent","shelter","tarp","chair","table","cooler"] },
  { key:"family",      label:"가족",    icon:"👨‍👩‍👧", cats:["auto-tent","shelter","chair","table","cooler","wagon","cot","burner","cookware"] },
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
  const s0 = (STATE.data?.metrics || []).filter(m => m.is_star)[0];
  return s0 ? "spec:" + s0.key : "price";  // M-358: star 없으면 price 폴백
}
function serializeState() {
  // M-198: category.html 외 페이지에서 URL 덮어쓰기 방지
  if (!location.pathname.includes("category.html")) return;
  const p = new URLSearchParams();
  // M-306: cat을 URLSearchParams에 포함 → 수동 문자열 접합 제거로 중복 방지
  p.set("cat", STATE.slug);
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
  // M-347: 절대 경로 사용 → 중첩 경로에서 상대 URL 404 방지
  history.replaceState(null, "", "/category.html?" + p.toString());
}
function restoreState(params) {
  STATE.q = params.get("q") || "";  // M-326: 원본 케이스 보존 (비교는 toLowerCase 사용)
  STATE.cap = params.get("cap") || "";
  STATE.brands.clear();  // M-397: 재호출 시 누산 방지
  const br = params.get("brands"); if (br) br.split("|").filter(Boolean).forEach(b => STATE.brands.add(b));  // M-506: 빈 문자열 필터
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
    STATE.data?.metrics?.some(m => m.is_star && "spec:" + m.key === srt));  // H-67: 데이터 로드 실패 시 STATE.data null 가드
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
    if (!star[0]) return;  // H-107: star 메트릭 없는 카테고리에서 "spec:undefined" 방지
    STATE.sortKey = "spec:" + star[0].key;
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
  const availKeys = new Set(d.models.flatMap(m => Object.keys(m.specs || {})));
  const slug = STATE.slug;
  const relevant = STYLE_META.filter(s => {
    // cats 화이트리스트: 이 카테고리가 포함된 스타일만 표시
    if (s.cats && !s.cats.includes(slug)) return false;
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
    if (tipEl) {
      const tip = STYLE_TIPS[STATE.campStyle];
      const ss = STYLE_SORT[STATE.campStyle];
      const specLabel = ss && d.metrics.find(m => m.key === ss.key)?.label;
      const sortHint = specLabel ? ` · ${specLabel} 기준 정렬` : "";
      tipEl.textContent = STATE.campStyle ? ((tip?.tip || "") + sortHint) : "";
    }
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
    // H-132: campStyle이 STYLE_META에 없는 키면 sm=undefined → sm.icon TypeError 크래시 → 스타일 표기 생략.
    if (!sm) { leadEl.textContent = `${d.count.toLocaleString('ko-KR')}개 모델`; return; }
    leadEl.innerHTML = `${d.count.toLocaleString('ko-KR')}개 모델 · <span style="color:var(--accent);font-weight:700">${sm.icon} ${sm.label} 기준</span> — 관련 스펙 슬라이더를 활용해보세요`;
  } else {
    leadEl.innerHTML = `${d.count.toLocaleString('ko-KR')}개 모델 · 같은 그룹 안 순위로 환산한 별점`;
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
  if (lead) lead.innerHTML = `<b>${m.categories.reduce((s,c)=>s+(c.count||0),0).toLocaleString('ko-KR')}개</b> 모델 · ${m.categories.length}개 카테고리`;
  // 상단 검색창(홈 검색과 동일 동작) — 카테고리 내 검색용 #q 입력은 숨김
  const tb = document.querySelector(".toolbar"); if (tb) tb.style.display = "none";
  const sc = document.getElementById("sortchips"); if (sc) sc.innerHTML = "";
  // M-115: 탐색 랜딩에서 cat-aside(사이드바) 숨김 — 카테고리 없으면 220px 빈 공간 생김
  const aside = document.getElementById("cat-aside"); if (aside) aside.style.display = "none";
  // 카테고리 그리드를 #list에 렌더(홈과 동일 카드)
  const list = document.getElementById("list");
  if (!list) return;  // M-351: null 가드
  list.className = "grid";
  list.innerHTML = m.categories.map(c => `
    <a class="card" href="category.html?cat=${c.slug}">
      <div class="icon" style="background:${catTint(c.name)}">${catIcon(c.name)}</div>
      <div class="ct"><h3>${c.name}</h3>${OPS ? gradeBadge(c.grade) : ""}</div>
      <div class="meta">${c.count.toLocaleString('ko-KR')}개 모델</div>
    </a>`).join("");
  renderCatNav("");
}

let _catGen = 0;  // M-370: 빠른 카테고리 전환 레이스 가드
async function renderCategory() {
  const gen = ++_catGen;
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
    if (gen !== _catGen) return;  // M-370: 전환된 카테고리에 에러 기록 방지
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
  if (gen !== _catGen) return;  // M-370: 최신 카테고리 전환만 처리
  const rawQ = params.get("q") || "";   // 홈검색 링크의 q(대문자 포함 가능)
  STATE = { data: d, slug: slug, q: rawQ, cap: "", brands: new Set(), range: {}, qExclude: false,  // M-326: 원본 케이스 보존
            sortKey: null, sortAsc: false, campStyle: "",
            dir: Object.fromEntries(d.metrics.map(m => [m.key, m.direction])),
            unit: Object.fromEntries([...d.metrics.map(m => [m.key, m.unit]), ...(EXTRA_SPECS[slug]||[]).map(e => [e.key, e.unit||""])]) };  // M-336: EXTRA_SPECS 단위 포함
  // 비교 세트는 카테고리 데이터에 종속 — 카테고리 진입 시 초기화(M-110: 이전 카테고리 잔존 방지)
  _cmpSet = [];
  const _prevCmpBar = document.getElementById("cmp-bar");
  if (_prevCmpBar) _prevCmpBar.style.display = "none";
  renderCatNav(slug);

  const _crumb = document.getElementById("crumbName"); if (_crumb) _crumb.textContent = d.name;  // M-352
  const shareUrl = `https://gear-forest.com/category.html?cat=${slug}`;
  const shareTitle = `${d.name} 비교 — 장비의 숲`;
  const shareDesc = `${d.count.toLocaleString('ko-KR')}개 모델을 정량 스펙으로 별점 비교. 실측값만 사용합니다.`;
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
    const currentUrl = location.href.replace(/^https?:\/\/localhost(:\d+)?/, "https://gear-forest.com");  // FE-091: 포트 옵셔널 — Capacitor 네이티브 https://localhost(포트 없음)도 치환
    const hasFilter = location.search.length > 1;
    const shareTarget = hasFilter ? currentUrl : shareUrl;
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareTarget }); return; }
      catch (err) { if (err && err.name === "AbortError") return; }  // FE-092: 공유 취소 시 클립보드 폴백·거짓 ✓ 금지
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(shareTarget);
      const btn = document.getElementById("share-btn");
      btn.textContent = "✓"; btn.style.color = "var(--accent)";
      setTimeout(() => { btn.textContent = "🔗"; btn.style.color = ""; }, 2000);
      showToast("링크를 복사했어요 📋");   // UXUI-053: 아이콘 변경만으론 성공 여부 불명확 → 토스트
    } catch (_) {  // FE-179: 무응답 → 수동 복사 폴백(prompt 차단 환경도 토스트로 안내)
      try { window.prompt("아래 링크를 복사해 공유하세요", shareTarget); }
      catch (__) { showToast("이 환경에서는 링크 복사를 지원하지 않아요"); }
    }
  };
  document.getElementById("lead").innerHTML =
    `${d.count.toLocaleString('ko-KR')}개 모델 · 같은 그룹 안 순위로 환산한 별점`;
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
  STATE.sortKey = star[0] ? "spec:" + star[0].key : "price";  // M-258: star 없으면 price 폴백
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
    qInp.oninput = e => { if (e.isComposing) return; STATE.q = e.target.value.trim(); draw(); };  // L-59, M-326: 원본 케이스 보존
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
  const num = (arr) => arr.filter(v => v != null && Number.isFinite(v));  // H-135: NaN이 통과하면 Math.min/max가 NaN→슬라이더 min=NaN 비기능 → 유한수만
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
    if (lo >= hi) { /* M-570: lo===hi 시 슬라이더 범위 0 → NaN%, 스킵 */ }
    else {
    const step = Math.max(1000, Math.round((hi - lo) / 100 / 1000) * 1000);
    parts.push(`<div class="fgrp fgrp-slider"><span class="flab">가격</span>
      <div class="dslider" data-rng="price" data-lo="${lo}" data-hi="${hi}" data-step="${step}" data-unit="price">
        <div class="dslider-track"><div class="dslider-fill"></div></div>
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${lo}" data-b="min" aria-label="가격 최솟값">
        <input class="dsl-input" type="range" min="${lo}" max="${hi}" step="${step}" value="${hi}" data-b="max" aria-label="가격 최댓값">
        <div class="dslider-labels">
          <span class="dsl-val" data-b="min">${lo.toLocaleString('ko-KR')}원</span>
          <span class="dsl-val" data-b="max">${hi.toLocaleString('ko-KR')}원</span>
        </div>
      </div></div>`);
    } // end else (M-570)
  }

  // 스펙 범위 (각 ★지표) — 무게는 kg 단위 슬라이더
  star.forEach(m => {
    const vals = num(ms.map(x => x.specs[m.key] && x.specs[m.key].value));
    if (vals.length < 2) return;
    const isWeight = (m.unit || "") === "g";
    const rawLo = Math.min(...vals), rawHi = Math.max(...vals);
    if (rawLo >= rawHi) return;  // L-409: 전 모델 동일값 시 min===max 퇴화 슬라이더(NaN fill·이동불가) 스킵 — 가격 M-570과 동일
    // 슬라이더는 kg 단위, STATE.range는 g 단위 유지 (passRange가 specs.value와 비교하므로)
    const slo = isWeight ? rawLo / 1000 : rawLo;
    const shi = isWeight ? rawHi / 1000 : rawHi;
    const displayUnit = isWeight ? "kg" : (_UNIT_DISPLAY[m.unit] || m.unit || "");   // L-311(xcode): m2→m² 등 표시 단위 매핑
    const step = isWeight ? 0.1 : Math.max(0.1, +((shi - slo) / 100).toFixed(2));
    const fmtVal = v => isWeight ? (+v).toFixed(1) + "kg" : (+(+v).toFixed(1)) + displayUnit;   // L-312(xcode): 정수 스펙값 불필요한 .0 제거
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
    if (lo >= hi) return;  // L-409: 퇴화 슬라이더(min===max) 스킵
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
    // M-199: 브랜드·스타일·cap은 건드리지 않음 — 프리셋 무관 필터 유지
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
    const openSheet = () => { aside.scrollTop = 0; aside.classList.add("open"); backdrop.classList.add("on"); document.body.classList.add("filter-sheet-lock"); tg.setAttribute("aria-expanded", "true"); const fx = aside.querySelector(".fsheet-x"); if (fx) fx.focus(); };  // FE-147: 열 때 시트 내부로 포커스 이동 · FE-159: 재열기 시 스크롤 상단 초기화
    const closeSheet = () => { aside.classList.remove("open"); backdrop.classList.remove("on"); document.body.classList.remove("filter-sheet-lock"); tg.setAttribute("aria-expanded", "false"); if (tg) tg.focus(); };  // FE-146: 닫을 때 필터 토글로 포커스 복귀
    tg.onclick = openSheet;
    backdrop.onclick = closeSheet;
    aside.querySelector(".fsheet-x").onclick = closeSheet;
    aside.querySelector(".fsheet-apply").onclick = closeSheet;   // 필터는 실시간 적용(draw) — 닫기만
    // H-64: buildFilters 재호출 시 익명 리스너가 누적되지 않도록 이전 핸들러 제거 후 재등록
    if (document._filterSheetKeyHandler) document.removeEventListener("keydown", document._filterSheetKeyHandler);
    document._filterSheetKeyHandler = e => {  // FE-147: Esc 닫기 + Tab 포커스 트랩(배경 요소 이탈 방지)
      if (!aside.classList.contains("open")) return;
      if (e.key === "Escape") { closeSheet(); return; }
      if (e.key === "Tab") _trapTab(e, aside);
    };
    document.addEventListener("keydown", document._filterSheetKeyHandler);
  }

  // 인원
  bar.querySelectorAll("[data-cap]").forEach(btn => btn.onclick = () => {
    bar.querySelectorAll("[data-cap]").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });  // L-132
    // M-396: 이미 선택된 버튼 재클릭 시 해제
    if (STATE.cap === btn.dataset.cap) { STATE.cap = ""; draw(); return; }
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
      if (isPrice) return (+v).toLocaleString('ko-KR') + "원";
      if (isWeight) return (+v).toFixed(1) + "kg";
      return (+(+v).toFixed(1)) + (sl.dataset.unit || "");   // L-312: 정수 스펙값 .0 제거
    };
    const updateFill = () => {
      const lo = parseFloat(minInp.value), hi = parseFloat(maxInp.value);
      const pct = v => totalHi === totalLo ? 0 : ((v - totalLo) / (totalHi - totalLo)) * 100;
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
  let _syncSortChips = () => {};   // L-277/L-291: 칩 생성 후 실제 동기화 함수 할당(아래)
  const applySort = v => {
    // M-228: 수동 정렬 시 스타일 칩 이중활성 방지 — campStyle 초기화
    if (STATE.campStyle) { STATE.campStyle = ""; if (STATE.data) renderStyleChips(STATE.data); }
    if (!v) { STATE.sortKey = star[0] ? "spec:" + star[0].key : "price"; STATE.sortAsc = defaultAsc(STATE.sortKey); }  // M-258
    else if (v === "value") { STATE.sortKey = "value"; STATE.sortAsc = false; }
    else { STATE.sortKey = v; STATE.sortAsc = defaultAsc(v); }
    if (ssel) ssel.value = (STATE.sortKey === defaultSortKey()) ? "" : STATE.sortKey;
    _syncSortChips();   // L-291: 정렬 변경 후 빠른 칩 활성표시 갱신
    draw();
  };
  if (ssel) ssel.onchange = e => applySort(e.target.value);
  // 빠른 정렬 칩(항상 노출 — 모바일에서 필터바가 접혀도 한 번에 정렬). 발견율 개선
  const sc = document.getElementById("sortchips");
  if (sc) {
    const hasValue = STATE.data?.models?.some(m => cellVal(m, "value") != null);
    const CHIPS = [["", "기본"], ["price_min", "가격 낮은순"], ...(hasValue ? [["value", "가성비순"]] : [])];
    sc.innerHTML = `<span class="flab">정렬</span>` + CHIPS.map(([v, lab]) =>
      `<button type="button" class="schip" data-sortval="${v}" aria-pressed="false">${esc(lab)}</button>`).join("");  // L-16
    sc.querySelectorAll(".schip").forEach(b => b.onclick = () => applySort(b.dataset.sortval));
    // L-277/L-291: 현재 정렬키에 맞춰 칩 .on·aria-pressed 동기화. 빈값 칩=기본(spec)정렬일 때만 활성.
    //   비기본 spec 헤더정렬이면 일치 칩이 없어 모두 비활성(정상 — 해당 칩 부재).
    _syncSortChips = () => {
      const dk = defaultSortKey();
      sc.querySelectorAll(".schip").forEach(b => {
        const v = b.dataset.sortval;
        const on = v ? STATE.sortKey === v : STATE.sortKey === dk;
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      });
    };
    _syncSortChips();
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
  // M-243: campStyle 활성 필터 칩 표시 — 개별 해제 지원
  if (STATE.campStyle) {
    const sm = (typeof STYLE_META !== "undefined" ? STYLE_META : []).find(s => s.key === STATE.campStyle);
    chips.push([`스타일 ${sm ? sm.label : STATE.campStyle}`, () => { STATE.campStyle = ""; if (STATE.data) renderStyleChips(STATE.data); }]);
  }
  if (STATE.cap) chips.push([`인원 ${STATE.cap}인`, () => { STATE.cap = ""; }]);
  STATE.brands.forEach(b => chips.push([`브랜드 ${b}`, () => STATE.brands.delete(b)]));
  Object.entries(STATE.range).forEach(([k, r]) => {
    if (r.min == null && r.max == null) return;  // M-303: 빈 range 칩 숨김
    const lab = metricLabel(k);   // L-156: EXTRA_SPECS 키도 한글 레이블
    const rawUnit = k === "price" ? "원" : ((STATE.unit && STATE.unit[k]) || "");  // M-336/H-137: STATE.unit 미초기화(STATE={}) 시 TypeError 가드
    // 무게(g) 필터는 STATE.range에 g 단위로 저장되지만 사용자에게는 kg으로 표시
    const isWeight = rawUnit === "g";
    const fmt = v => {
      if (v == null) return "";
      if (k === "price") return v.toLocaleString("ko-KR");
      if (isWeight) return (v / 1000).toFixed(1) + "kg";
      return (+(+v).toFixed(2)) + rawUnit;   // L-419: 부동소수점 노이즈(1.5000000000000002) 제거 — 2자리 반올림 후 trailing zero 정리
    };
    // M-313: 단방향 범위는 틸드 없이 ≤/≥ 표시
    const txt = r.min == null ? `${lab} ≤ ${fmt(r.max)}`
              : r.max == null ? `${lab} ≥ ${fmt(r.min)}`
              : `${lab} ${fmt(r.min)}~${fmt(r.max)}`;
    chips.push([txt, () => delete STATE.range[k]]);
  });
  if (STATE.qExclude) chips.push(["스펙값 있는 것만", () => { STATE.qExclude = false; }]);
  if (STATE.q) chips.push([`"${STATE.q}"`, () => { STATE.q = ""; const q = document.getElementById("q"); if (q) q.value = ""; }]);  // H-97: #q 없는 페이지 null 가드
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
  STATE.campStyle = "";   // H-63: 스타일 칩(.on)·URL style 파라미터 잔류 방지(clearPresetFilters와 동일)
  // M-391: 스타일 해제 후 sortKey를 기본(star 지표)로 복원
  if (STATE.data) { STATE.sortKey = defaultSortKey(); STATE.sortAsc = defaultAsc(STATE.sortKey); }
  const q = document.getElementById("q"); if (q) q.value = "";
  if (STATE.data) renderStyleChips(STATE.data);   // 스타일 칩 하이라이트 재그리기
  syncFilterUI(); draw(); serializeState();
}

// 칩/입력 UI를 STATE에 동기화(활성칩에서 해제 시 컨트롤도 반영)
function syncFilterUI() {
  const bar = document.getElementById("filters");
  if (!bar) return;
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
      if (isPrice) return (+v).toLocaleString('ko-KR') + "원";
      if (isWeight) return (+v).toFixed(1) + "kg";
      return (+(+v).toFixed(1)) + (sl.dataset.unit || "");   // L-312: 정수 스펙값 .0 제거
    };
    const loVal = (r && r.min != null) ? toDisplay(r.min) : totalLo;
    const hiVal = (r && r.max != null) ? toDisplay(r.max) : totalHi;
    minInp.value = loVal; maxInp.value = hiVal;
    if (minLbl) minLbl.textContent = fmtLabel(loVal);
    if (maxLbl) maxLbl.textContent = fmtLabel(hiVal);
    const pct = v => totalHi === totalLo ? 0 : ((v - totalLo) / (totalHi - totalLo)) * 100;
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
    if (r.min == null && r.max == null) continue;  // M-325: 빈 range 엔트리 무시
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
  if (skip !== "q" && STATE.q) { const t = (m.brand + " " + m.model + " " + _brandAlias(m.brand)).toLowerCase(); if (!STATE.q.toLowerCase().split(/\s+/).every(tok => t.includes(tok))) return false; }  // M-326+M-483+M-390: 영문 브랜드명 매칭
  for (const [key, r] of Object.entries(STATE.range)) {
    if (skip === "range:" + key) continue;
    const v = key === "price" ? m.price_min : (m.specs[key] && m.specs[key].value);
    if (v == null || (r.min != null && v < r.min) || (r.max != null && v > r.max)) return false;
  }
  if (skip !== "qx" && STATE.qExclude && cellVal(m, sortK) == null) return false;
  // L-269: campStyle 정렬 시 value-null 행 제외 반영 (skip="style"이면 campStyle 필터 무시)
  if (skip !== "style" && STATE.campStyle && sortK && cellVal(m, sortK) == null) return false;
  return true;
}
function diagnoseEmpty(sortK) {
  const d = STATE.data;
  const filters = [];
  // M-344: campStyle 필터 진단 포함
  if (STATE.campStyle) filters.push(["style", "스타일 필터"]);
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
  if (!STATE.data) return;  // M-267: STATE.data null 시 d.metrics TypeError 방지
  const _tb = document.getElementById("spec-tip-bubble"); if (_tb) _tb.style.display = "none";  // M-186: 모달 오픈 시 버블 숨김
  pushRecent(wishItem(m, STATE.slug));   // 최근 본 상품 기록
  const d = STATE.data, star = d.metrics.filter(x => x.is_star);
  const mIdx = d.models ? d.models.indexOf(m) : -1;   // L-237/275/301/399: indexOf 1회 계산 후 재사용(중복 O(n) 제거)
  let modal = document.getElementById("pmodal");
  if (!modal) { modal = document.createElement("div"); modal.id = "pmodal"; modal.className = "pmodal"; document.body.appendChild(modal); }  // L-112: dialog role은 내부 .pmbox에만 — 중첩 제거
  modal._onCloseOnce = null;   // H-92: 이전 open이 남긴 close 훅 제거(잔여 restore 누수 방지)
  const imgHtml = thumbCell(m.img, m.model, catTint(d.name), catIcon(d.name), "pmimg", "pmicon");
  const specRows = star.map(mt => {
    const s = m.specs[mt.key];
    const has = s && s.value != null;
    const val = has ? fmtVal(s.value, mt.unit) : (OPS ? '<span class="b 데이터부족">데이터부족</span>' : "—");
    const st = (has && s.stars != null) ? " " + stars(s.stars) : "";
    const badge = (OPS && has && s.badge) ? ` <span class="b ${s.badge}">${s.badge}</span>` : "";
    const isValue = mt.key === "value_score" || mt.key === "value_per_g" || mt.key === "value_per_l";
    const tooltip = isValue
      ? `<button type="button" class="spec-tip-btn" aria-label="가성비 기준 설명" title="가성비 = 같은 그룹 내 주요 스펙 별점을 가격(만원)으로 나눈 점수. 100점에 가까울수록 가격 대비 스펙이 우수해요.">?</button>`
      : "";
    return `<div class="pmspec"><span class="pml">${esc(mt.label)}${tooltip}</span>` +
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
         </div>
       </div>
       <div class="pmprice">${priceRange(m.price_min, m.price_max)}</div>
       <div class="pmprice-note">제품은 최저가를 표기하고 있습니다. 링크의 가격과 다를 수 있습니다.</div>
       <div class="pmspecs">
         <div class="pmspec pmspec-user"><span class="pml">유저 평가</span><span class="pmv" id="pm-userrating"><span class="nd">—</span></span></div>
         ${specRows}
       </div>
       ${m.coupang_url
         ? `<div class="pmbuynote">이 링크는 쿠팡 파트너스 활동의 일환으로, 일정액의 수수료를 제공받습니다.</div>
       <button class="pmbuy pmbuy-active" type="button" data-url="${esc(m.coupang_url)}">🛒 쿠팡에서 구매하기</button>`
         : `<div class="pmbuynote">구매 링크를 준비 중입니다.</div>
       <button class="pmbuy" type="button" disabled aria-disabled="true">구매하기</button>`
       }
       <button class="pmset" type="button">＋ 장비 꾸러미에 담기</button>
       <a class="pmlink" href="brand.html?b=${encodeURIComponent(m.brand)}">${esc(m.brand)} 다른 제품 보기 ›</a>
       ${STATE.slug && mIdx >= 0 ? `<a class="pmlink" href="/item/${STATE.slug}/item-${mIdx}.html" style="font-size:12px;color:var(--muted)">🔗 상세 페이지 (공유·즐겨찾기용)</a>` : ""}
       <section class="pmrv" aria-label="유저 후기">
         <div class="pmrv-head">
           <span class="pmrv-title">유저 후기<span class="pmrv-cnt" id="pmrv-cnt"></span></span>
           <button class="pmrv-add" type="button">✍️ 후기 남기기</button>
         </div>
         <div class="pmrv-formbox" id="pmrv-formbox" hidden></div>
         <div class="pmrv-list" id="pmrv-list"><div class="pmrv-empty">후기를 불러오는 중…</div></div>
       </section>
       <div class="pm-report-row"><button class="pm-report-link" type="button">상품의 정보가 달라요</button></div>
     </div></div>`;
  modal.classList.add("on");
  const buyBtn = modal.querySelector(".pmbuy-active");
  if (buyBtn) {
    buyBtn.onclick = async () => {
      const url = buyBtn.dataset.url;
      openExternal(url);
      // GA4 클릭 이벤트(쿠팡 구매) — Supabase 집계와 병행, 미로드 시 무해 no-op
      if (typeof gtag === "function") gtag("event", "coupang_buy", {
        item_brand: m.brand, item_model: m.model, item_category: STATE.slug,
      });
      try {
        const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
        let sessionId = localStorage.getItem("_sid");
        if (!sessionId) { sessionId = Math.random().toString(36).slice(2); try { localStorage.setItem("_sid", sessionId); } catch (_) {} }  // FE-023: setItem 예외가 insert를 막지 않게 격리
        await supabase.from("click_events").insert({
          slug: STATE.slug, brand: m.brand, model: m.model,
          item_idx: d.models ? mIdx : null,
          coupang_url: url, session_id: sessionId
        });
      } catch (_) {}
    };
  }
  const wbtn = modal.querySelector(".pmwish");
  wbtn.onclick = () => {
    // L-347: .pmwish는 생성 시 이미 BOOKMARK_SVG를 담고 있고 토글 시각상태는 .on 클래스(toggleWishWithHint)가
    //   담당 → innerHTML 재설정은 동일 SVG를 다시 그려 아이콘만 깜빡이게 함. 제거.
    toggleWishWithHint(wishItem(m, STATE.slug), wbtn);
  };
  const setBtn = modal.querySelector(".pmset");
  if (setBtn) setBtn.onclick = () => openSetModal(setItem(m, STATE.slug, d.models ? mIdx : undefined));
  const reportLink = modal.querySelector(".pm-report-link");   // M-116: ⚠️ 버튼 제거 → 하단 텍스트 링크
  if (reportLink) reportLink.onclick = () => {
    const subject = encodeURIComponent(`[오류 제보] ${m.brand} ${m.model}`);
    const body = encodeURIComponent(`제품명: ${m.brand} ${m.model}\n\n오류 내용:\n`);
    window.open(`mailto:bangsungju@gmail.com?subject=${subject}&body=${body}`, "_self");
  };
  // 공유 — 정적 상세페이지 URL(공유·즐겨찾기용)을 우선, 없으면 현재 주소. Web Share → 실패 시 클립보드 복사.
  const shareBtn = modal.querySelector(".pmshare");
  if (shareBtn) shareBtn.onclick = async () => {
    const idx = mIdx;
    // FE-090: Capacitor 네이티브는 location.origin이 https://localhost → 공유 링크가 깨짐. 정식 도메인으로 치환.
    const _origin = location.hostname === "localhost" ? "https://gear-forest.com" : location.origin;
    const url = STATE.slug && idx >= 0
      ? `${_origin}/item/${STATE.slug}/item-${idx}.html`
      : location.href.replace(/^https?:\/\/localhost(:\d+)?/, "https://gear-forest.com");
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
    const tb = document.getElementById("spec-tip-bubble"); if (tb) tb.style.display = "none";  // M-425: 모달 닫힌 후 툴팁 잔류 방지
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    // H-92: ESC·백드롭·X 등 모든 닫기 경로에서 일회성 close 훅 실행(STATE 복원 등) — 호출부가 onclick만 패치하면 ESC가 우회됨
    if (typeof modal._onCloseOnce === "function") { const cb = modal._onCloseOnce; modal._onCloseOnce = null; cb(); }
  };
  modal.onclick = e => { if (e.target === modal) close(); };
  const xbtn = modal.querySelector(".pmx");
  xbtn.onclick = close;
  xbtn.focus();
  // 가성비 ? 툴팁 — fixed 버블로 뷰포트 기준 위치 계산(좌우 잘림 방지)
  let _tipBubble = document.getElementById("spec-tip-bubble");
  if (!_tipBubble) {
    _tipBubble = document.createElement("div");
    _tipBubble.id = "spec-tip-bubble";
    document.body.appendChild(_tipBubble);
  }
  const showTip = (btn) => {
    _tipBubble.textContent = btn.title;
    _tipBubble.style.display = "block";
    const r = btn.getBoundingClientRect();
    const bw = _tipBubble.offsetWidth || 220;
    let left = r.left + r.width / 2 - bw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - bw - 12));
    const top = r.top - _tipBubble.offsetHeight - 8;
    _tipBubble.style.left = left + "px";
    _tipBubble.style.top = (top < 8 ? r.bottom + 8 : top) + "px";
  };
  const hideTip = () => { _tipBubble.style.display = "none"; };
  modal.querySelectorAll(".spec-tip-btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => showTip(btn));
    btn.addEventListener("mouseleave", hideTip);
    btn.addEventListener("focus", () => showTip(btn));
    btn.addEventListener("blur", hideTip);
    btn.onclick = e => {
      e.stopPropagation();
      // FE-152: iOS는 tap 시 focus(showTip)→click 순으로 발생. 토글이면 click이 방금 뜬 버블을 즉시 닫아
      //   툴팁이 깜빡이고 사라진다. click은 항상 showTip(닫기는 바깥 영역 탭=pmbox click이 담당).
      showTip(btn);
    };
  });
  modal.querySelector(".pmbox").addEventListener("click", hideTip);
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
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);  // M-181: 모달 재오픈 시 이전 onKey 누적 → ESC 중복 close 방지
  modal._onKey = onKey;
  document.addEventListener("keydown", onKey);
}

/* ── 유저 후기 (reviews 테이블) — 사진 중심 메이슨리 그리드 ──────
   product_pcode = wishKey(brand|model|cap) — 찜·세트와 동일 키 스킴.
   목록·평균별점은 anon도 읽기 가능(RLS reviews_select_public). 작성은 로그인 필요.
   사진은 review-images 버킷 업로드 + reviews.image_urls(마이그 020). 사진은 선택. */
const REVIEW_MAX_PHOTOS = 4;

function _reviewDate(iso) {
  return fmtDate(iso, { year: "numeric", month: "long", day: "numeric" });
}

// image_urls 컬럼은 마이그(020) 적용 전이면 없을 수 있다 → 있으면 쓰고, 없으면 우아하게 제외(기존 후기 안 깨짐).
async function _fetchReviews(supabase, pcode) {
  const base = "id, rating, body, created_at, user_id, profiles(nickname)";
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
  // L-467: https 통과한 이미지만 사진으로 취급 — 비-https URL은 safeHttps()가 ""를 반환해 src="" 빈 이미지로
  //   has-photo 카드 레이아웃이 깨짐. 유효 사진이 하나도 없으면 텍스트 카드로 폴백.
  const validImgs = (r.image_urls || []).filter(safeHttps);
  if (validImgs.length) {
    const more = validImgs.length > 1 ? `<span class="pmrv-more">+${validImgs.length - 1}</span>` : "";
    return `<button type="button" class="pmrv-card has-photo" data-i="${i}">
      <span class="pmrv-photowrap"><img class="pmrv-photo" src="${esc(validImgs[0])}" alt="${nick}님의 후기 사진" loading="lazy" onerror="this.style.display='none'">${more}</span>
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
  const imgs = (r.image_urls || []).filter(safeHttps).map((u, _i) => `<img class="pmrvd-img" src="${esc(u)}" alt="${nick}님의 후기 사진 ${_i + 1}" loading="eager" onerror="this.style.display='none'">`).join("");  // FE-113: 빈 alt → 스크린리더가 후기 사진 인지 가능하게 설명 부여
  const me = window.currentUser ? window.currentUser() : null;
  const isMine = me && r.user_id && me.id === r.user_id;
  const reportBtn = isMine ? "" : `<button type="button" class="rv-report">🚩 신고</button>`;
  ov.innerHTML = `<div class="pmbox pmrvd-box" role="dialog" aria-modal="true" aria-label="${nick}님의 후기">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    ${imgs ? `<div class="pmrvd-imgs">${imgs}</div>` : ""}
    <div class="pmrvd-body">
      <div class="pmrvd-meta"><span class="pmrv-nick">${nick}</span><span class="pmrv-stars">${stars(r.rating)}</span><span class="pmrv-date">${_reviewDate(r.created_at)}</span></div>
      <div class="pmrv-fulltext">${esc(r.body)}</div>
      ${reportBtn}
    </div></div>`;
  ov.classList.add("on");
  const prevFocus = document.activeElement;
  const close = () => {
    ov.classList.remove("on");
    document.removeEventListener("keydown", onKey, true);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  };
  ov.onclick = e => { if (e.target === ov) close(); };
  const xbtn = ov.querySelector(".pmx");
  xbtn.onclick = close;
  xbtn.focus();
  // 신고 버튼
  const rbtn = ov.querySelector(".rv-report");
  if (rbtn) rbtn.onclick = async () => {
    if (!window.currentUser || !window.currentUser()) { showToast("로그인 후 신고할 수 있어요"); return; }
    // M-544: prompt() → 인라인 폼 (iOS Safari PWA에서 prompt() 차단 방지)
    rbtn.style.display = "none";
    const rform = document.createElement("div");
    rform.style.cssText = "display:flex;gap:6px;margin-top:4px";
    rform.innerHTML = `<input class="rv-report-inp lf-input" type="text" maxlength="100" placeholder="신고 사유 (5자 이상)" style="flex:1;font-size:13px;padding:7px 10px">
      <button type="button" class="rv-report-submit achip" style="font-size:13px">신고</button>
      <button type="button" class="rv-report-cancel achip clear" style="font-size:13px">취소</button>`;
    rbtn.insertAdjacentElement("afterend", rform);
    const inp = rform.querySelector(".rv-report-inp");
    const submitBtn2 = rform.querySelector(".rv-report-submit");
    rform.querySelector(".rv-report-cancel").onclick = () => { rform.remove(); rbtn.style.display = ""; };
    inp.focus();
    submitBtn2.onclick = async () => {
      const reason = inp.value.trim();
      if (reason.length < 5) { showToast("5자 이상 입력해주세요"); inp.focus(); return; }
      submitBtn2.disabled = true; submitBtn2.textContent = "신고 중…";
      try {
        const { reportContent } = await import("./supabaseClient.js?v=0cfa00cd");
        const { error } = await reportContent({ target_type: "review", target_id: r.id, reason: reason.trim() });
        if (error) {
          const msg = error.message || "";
          showToast(msg === "already_reported" || msg.includes("duplicate") || msg.includes("unique") ? "이미 신고한 후기예요" : (getErrorMessage ? getErrorMessage(error) : "신고 중 오류가 발생했어요"));
          submitBtn2.disabled = false; submitBtn2.textContent = "신고";
        } else {
          rform.remove(); rbtn.style.display = ""; rbtn.textContent = "신고됨"; rbtn.disabled = true;
          showToast("신고가 접수되었어요. 검토 후 조치합니다.");
        }
      } catch (e) { showToast("신고 중 오류가 발생했어요"); submitBtn2.disabled = false; submitBtn2.textContent = "신고"; }
    };
  };
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
  if (ov._onKey) document.removeEventListener("keydown", ov._onKey, true);  // L-255: 리뷰 재오픈 시 capture onKey 누적 방지
  ov._onKey = onKey;
  document.addEventListener("keydown", onKey, true);
}

let _rvGen = 0;  // FE-034: loadReviews 동시 호출 경합 가드(스테일 응답이 신규 후기를 덮어쓰는 문제)
async function loadReviews(modal, pcode) {
  const gen = ++_rvGen;
  const listEl = modal.querySelector("#pmrv-list");
  const cntEl = modal.querySelector("#pmrv-cnt");
  const ratingEl = modal.querySelector("#pm-userrating");
  try {
    const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
    const rv = await _fetchReviews(supabase, pcode);
    if (gen !== _rvGen) return;  // FE-034: 더 최신 호출이 시작됐으면 이 응답은 폐기(신규 후기 사라짐 방지)
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
    // 공용 게이트(FE-AUTH-01 §B): 폼 열기 전 로그인 확인
    const allowed = await requireLogin({ action: 'openReviewForm', returnTo: location.href });
    if (!allowed) return;
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
      // L-459: 인덱스 대신 렌더 시점의 File 참조로 splice → 더블탭(분리된 구버튼 재발화) 시 stale 인덱스로 다른 사진 삭제 방지(indexOf -1이면 no-op)
      thumbsEl.querySelectorAll(".pmrv-thumb-x").forEach((btn, i) => {
        const f = photos[i];
        btn.onclick = () => { const idx = photos.indexOf(f); if (idx >= 0) photos.splice(idx, 1); renderThumbs(); };
      });
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
      if ([...body].length < 10) { showToast("후기는 10자 이상 입력해주세요"); return; }  // FE-121: 코드포인트 수로 검증(DB char_length 일치 — 이모지 .length 과대계수로 DB CHECK 위반 방지)
      const submitBtn = form.querySelector(".pmrv-submit");
      submitBtn.disabled = true;
      const uploadedPaths = [];  // FE-099: 외부 catch에서도 정리 가능하도록 try 밖 선언
      try {
        const { supabase, getErrorMessage, uploadImage, removeUploadedImages } = await import("./supabaseClient.js?v=0cfa00cd");
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) { showToast("로그인이 필요해요"); submitBtn.disabled = false; return; }
        // 사진 업로드(순차)
        const urls = [];
        if (photos.length) {
          submitBtn.textContent = "사진 올리는 중…";
          for (const f of photos) {
            const { url, path, error } = await uploadImage(f);
            if (error) {
              // L-111: 부분 업로드 실패 시 이미 올라간 파일 정리
              await removeUploadedImages(uploadedPaths);  // M-182: await 추가 — Storage 롤백 보장
              showToast((getErrorMessage && getErrorMessage(error)) || "사진 업로드 실패"); submitBtn.disabled = false; submitBtn.textContent = "등록"; return;
            }
            urls.push(url); uploadedPaths.push(path);
          }
        }
        submitBtn.textContent = "등록 중…";
        const row = { user_id: u.id, product_pcode: pcode, rating, body };
        if (urls.length) row.image_urls = urls;
        const { error } = await supabase.from("reviews").insert(row);
        if (error) {
          // M-134: INSERT 실패 시 업로드된 Storage 파일 롤백
          await removeUploadedImages(uploadedPaths);  // FE-012·026: await 추가 — 롤백 완료 보장
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
        // FE-099: 네트워크 예외 등으로 catch 진입 시에도 업로드된 사진 롤백(if-error 경로와 별개)
        if (uploadedPaths.length) { try { const { removeUploadedImages } = await import("./supabaseClient.js?v=0cfa00cd"); await removeUploadedImages(uploadedPaths); } catch (__) {} }
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
    const setItems = items.map(m => setItem(m, STATE.slug, STATE.data?.models?.indexOf(m)));
    const sets = getSets();
    sets.push({ id: Date.now().toString(36), title: setName, style: "비교", items: setItems, created_at: new Date().toISOString() });
    saveSets(sets);
    btn.textContent = "✅ 저장됐어요! 마이페이지에서 확인하세요";
    btn.style.background = "var(--muted)";
  };
}

function draw() {
  const d = STATE.data;
  if (!d) return;  // H-127: STATE.data stale 시 metrics.filter() TypeError 방지
  const star = d.metrics.filter(m => m.is_star);
  renderActiveFilters();
  let rows = d.models.filter(m =>
    (!STATE.cap || String(m.capacity) === STATE.cap) &&
    (!STATE.brands.size || STATE.brands.has(m.brand)) &&
    (!STATE.q || STATE.q.toLowerCase().split(/\s+/).every(tok => (m.brand + " " + m.model).toLowerCase().includes(tok))) &&  // M-326+M-483
    passRange(m));

  const k = STATE.sortKey, asc = STATE.sortAsc;
  // 품질: '데이터부족 제외' or 가성비순 → 정렬 기준 값이 없는 모델 숨김
  let valueExcluded = 0;   // H-95: 가성비순에서 무음 제외된 개수를 사용자에게 안내하기 위해 집계
  if (STATE.qExclude || k === "value") {
    const before = rows.length;
    // M-316: 검색어 매칭 상품은 qExclude 예외 — 검색 의도 우선
    const _qToks = STATE.q ? STATE.q.toLowerCase().split(/\s+/) : null;
    const qMatch = _qToks ? (m => { const t = (m.brand + " " + m.model).toLowerCase(); return _qToks.every(tok => t.includes(tok)); }) : null;  // M-326+M-483
    rows = rows.filter(m => (qMatch && qMatch(m)) || cellVal(m, k) != null);
    if (k === "value") valueExcluded = before - rows.length;
  }
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
  // M-257/M-304: 원본 인덱스 Map(O(1))으로 href 링크 일관성 + O(n²) 탐색 제거
  const _origIdx = new Map(d.models.map((m, i) => [m, i]));
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
    return `<a class="pli" href="/item/${STATE.slug}/item-${_origIdx.get(m) ?? i}.html" data-mi="${i}" aria-label="${esc(m.brand)} ${esc(m.model)} 상세 보기">
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
  const hasFilter = STATE.cap || STATE.brands.size || Object.keys(STATE.range).length || STATE.qExclude || STATE.q || STATE.campStyle;  // M-345
  document.getElementById("list").innerHTML = cards
    ? cards + `<div class="list-end" aria-live="polite" role="status">─ 총 ${rows.length}개 모두 표시됨${valueExcluded ? ` · 가성비 데이터 없는 ${valueExcluded}개 제외됨` : ""} ─</div>`
    : `<div class="pli-empty"><div class="pe-ico">🔍</div>
       <div class="pe-msg">조건에 맞는 결과가 없어요 ${diagnoseEmpty(k)}</div>
       ${hasFilter ? `<button type="button" class="achip clear" id="emptyclear">필터 전체 해제</button>` : ""}
       ${STATE.q ? `<a href="/?q=${encodeURIComponent(STATE.q)}" class="achip" style="text-decoration:none;display:inline-block;margin-top:6px">전체 카테고리에서 "${esc(STATE.q)}" 검색 →</a>` : ""}</div>`;
  document.querySelectorAll("#list .pli").forEach(el => {
    // L-234: Ctrl/Cmd/Shift+클릭(또는 새 탭 의도)은 막지 않고 <a href>의 기본 동작(정적 상세 페이지 새 탭)을 허용
    el.onclick = e => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); openProduct(rows[+el.dataset.mi]); };
    el.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); openProduct(rows[+el.dataset.mi]); } };  // M-565: Enter 키 처리 추가
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
  const _modelIdx = new Map(d.models.map((mm, ix) => [mm, ix]));   // L-301: indexOf O(n²) → Map O(1) 조회
  ldEl.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
    "name": d.name, "url": catUrl,
    "numberOfItems": rows.length,
    "itemListElement": rows.slice(0, 20).map((m, i) => ({
      "@type": "ListItem", "position": i + 1,
      "item": {
        "@type": "Product",
        "name": `${m.brand} ${m.model}`,
        "brand": { "@type": "Brand", "name": m.brand },
        "url": `https://gear-forest.com/item/${STATE.slug}/item-${_modelIdx.get(m)}.html`,  // M-119: 개별 상품 상세 URL (카테고리 URL 중복 제거)
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
  try { idx = await getJSON("data/search.json?v=9416ba63"); }
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
    // L-254: 선택된 브랜드가 상위 40개(또는 필터 결과) 밖이면 활성 표시가 사라지므로 맨 앞에 강제 추가
    const sel = params.get("b") || "";
    if (sel && !show.some(([b]) => b === sel)) {
      const selEntry = sortedBrands.find(([b]) => b === sel);
      if (selEntry) show.unshift(selEntry);
    }
    blist.innerHTML = show.length
      ? show.map(([b, n]) =>
          `<button class="achip${b === (params.get("b") || "") ? " on" : " clear"}" data-b="${esc(b)}">${esc(b)} ${n}</button>`).join("")  // M-293: 선택된 칩에 on 클래스
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
      return s && s.value != null && (typeof pick.filter === "function" ? pick.filter(m) : true);  // M-399/M-453
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

const HOT_LOW_CLICK = 5;  // 이 미만이면 '이번주 인기' 라벨로 — 빈약한 'N회' 노출 방지(저트래픽 단계)
const HOT_TARGET = 8;     // 카드 목표 개수 — 실클릭 데이터가 부족하면 가성비 시드로 채움

// 첫 방문/저트래픽 단계용 '가성비' 시드 — 카테고리별 스펙 별점 대비 가격이 우수한 모델.
// item_idx로 카테고리 JSON과 조인해 실제 이미지·가격을 채운다(brand/model은 idx 드리프트 보정용).
const HOT_SEED = [
  { cat: "auto-tent",        item_idx: 224, brand: "코베아",   model: "와우 쉐이드 L" },
  { cat: "backpacking-tent", item_idx: 148, brand: "플라이탑", model: "파이어 플라이 2" },
  { cat: "sleeping-bag",     item_idx: 138, brand: "살레와",   model: "오리털 침낭 1500g" },
  { cat: "cot",              item_idx: 46,  brand: "투마운트", model: "초경량 접이식 야전침대" },
  { cat: "tarp",             item_idx: 162, brand: "캠프365",  model: "히말라야 별빛 렉타 타프" },
  { cat: "lantern",          item_idx: 51,  brand: "에너자이저", model: "웨어러블 라이트" },
  { cat: "table",            item_idx: 12,  brand: "메사",     model: "빈슨메시프 블랙에디션 백패킹 테이블" },
  { cat: "wagon",            item_idx: 21,  brand: "블랙독",   model: "CBD2300JJ023 다용도 캠핑 웨건" },
];

async function renderHotSection(categories) {
  const sec = document.getElementById("hot-section");
  const listEl = document.getElementById("hot-list");
  if (!sec || !listEl) return;

  // 1) RPC로 최근 7일 클릭 상위 집계(클릭수 내림차순). 실패해도 시드로 진행.
  let real = [];
  try {
    const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
    const { data, error: hotErr } = await supabase.rpc("get_hot_items", { days_n: 7, limit_n: 30 });  // M-558: error 구조분해
    if (hotErr) throw hotErr;
    if (Array.isArray(data)) real = data;
  } catch (e) { console.warn("renderHotSection rpc:", e); }

  // 2) 실데이터 우선 + 부족분은 가성비 시드로 채워 항상 풍성한 카드(첫 방문 빈 화면 방지).
  const items = real.slice(0, HOT_TARGET);
  const seen = new Set(items.map(h => `${h.brand}|${h.model}`));
  for (const s of HOT_SEED) {
    if (items.length >= HOT_TARGET) break;
    const k = `${s.brand}|${s.model}`;
    if (seen.has(k)) continue;
    seen.add(k);
    items.push({ cat: s.cat, brand: s.brand, model: s.model, clicks: 0, item_idx: s.item_idx });
  }

  if (items.length) {
    // 3) 카드에 필요한 img/price를 카테고리 JSON에서 item_idx로 조인(필요한 카테고리만 1회 로드).
    const cats = [...new Set(items.map(h => h.cat))];
    const catData = {};
    await Promise.all(cats.map(async c => {
      try { catData[c] = await getJSON(`data/${c}.json`); } catch (_) { catData[c] = null; }
    }));

    const cards = items.map((h, i) => {
      const models = catData[h.cat]?.models || [];
      // 1차: item_idx로 룩업. 없거나(레거시 클릭 item_idx=null) 어긋나면 브랜드+모델 매칭으로 인덱스까지 보정.
      let idx = (h.item_idx != null && h.item_idx >= 0) ? h.item_idx : -1;
      let m = idx >= 0 ? models[idx] : null;
      if (!m || m.brand !== h.brand || m.model !== h.model) {
        const found = models.findIndex(p => p.brand === h.brand && p.model === h.model);
        if (found >= 0) { idx = found; m = models[found]; }
      }
      const img = m?.img || null;                 // 없으면 thumbCell이 '이미지 준비중' 폴백
      const price = m?.price_min ?? null;
      const catName = (categories || []).find(c => c.slug === h.cat)?.name || h.cat;
      // 인덱스를 복원했으면 상세 직링크, 끝내 못 찾으면 카테고리 목록으로 폴백.
      const href = (idx >= 0 && m)
        ? `/item/${h.cat}/item-${idx}.html`
        : `category.html?cat=${encodeURIComponent(h.cat)}&brands=${encodeURIComponent(h.brand)}&q=${encodeURIComponent(h.model)}`;  // FE-042: 모델명 q 추가 — 폴백 시 브랜드 전체가 아닌 해당 모델로 좁힘
      const rk = i < 3 ? ` rank-${i + 1}` : "";    // 1~3위만 금/은/동 색
      const tagTxt = Number(h.clicks) >= HOT_LOW_CLICK ? `이번주 ${Number(h.clicks)}회` : "이번주 인기";
      return `<a class="hot-card" href="${href}">
        ${thumbCell(img, h.model, catTint(catName), "🏕️", "hot-card-img", "hot-card-noimg")}
        <span class="hot-card-rank${rk}">${i + 1}</span>
        <span class="hot-card-cat">${esc(catName)}</span>
        <div class="hot-card-scrim">
          <div class="hot-card-b">${esc(h.brand)}</div>
          <div class="hot-card-m">${esc(h.model)}</div>
          <div class="hot-card-p">${priceLabeled(price, '<span class="nd" style="color:#fff">—</span>')}</div>
          <div class="hot-card-tag">🔥 ${tagTxt}</div>
        </div>
      </a>`;
    }).join("");
    listEl.innerHTML = `<div class="hot-card-row">${cards}</div>`;
    sec.style.display = "block";
    return;
  }

  // 4) 최후 폴백: 카테고리 chip
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
    a.filter(x => x.s && x.b && x.m).map((x, i) => `<div class="recard-wrap">
      <a class="recard" href="category.html?cat=${encodeURIComponent(x.s)}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}">  <!-- M-481: undefined 필드 필터 · L-355: 슬러그도 인코딩 -->
        ${thumbCell(x.img, x.m, "var(--card2)", "🏕️", "recard-thumb", "recard-noimg")}
        <div class="recard-b">${esc(x.b)}</div>
        <div class="recard-m">${esc(x.m)}</div>
        <div class="recard-p">${priceLabeled(x.p, '<span class="nd">—</span>')}</div>
      </a>
    </div>`).join("") + `</div>`;
}

/* ---------- 내 정보 — 섹션 나열(FE-SOC-07) ---------- */
/* 세트 상세 모달 — 수량 ± 편집 포함 */
function openSetDetail(sid) {
  // M-226/M-338: 배열 인덱스 대신 안정 id로 세트 탐색 — renderAccount 후 인덱스 어긋남 방지
  const sets = getSets();
  const si = sets.findIndex(s => s.id === sid);
  const s = si >= 0 ? sets[si] : null;
  if (!s) return;
  const fmtW = g => g >= 1000 ? `${(g/1000).toFixed(1)}kg` : `${g}g`;
  const fmtP = p => p ? p.toLocaleString('ko-KR') + "원" : "—";
  const type = s.type || DEFAULT_SET_TYPE;
  const tw = s.items.reduce((sum, x) => x.weight_g != null ? sum + x.weight_g * (x.qty || 1) : sum, 0);
  const tp = s.items.reduce((sum, x) => x.p ? sum + x.p * (x.qty || 1) : sum, 0);
  const rows = s.items.map((x, ii) => {
    const w = x.weight_g != null ? fmtW(x.weight_g * (x.qty || 1)) : "—";
    const p = x.p ? fmtP(x.p * (x.qty || 1)) : "—";
    const qty = x.qty || 1;
    // FE-WISH-09: 증가 가능 여부 = 같은상품 한도(qtyMax) & 슬롯 정원(cap) 둘 다 여유 있을 때만
    const slot = slotForSlug(x.s);
    const cap = slot ? slotCap(slot, type) : qtyMax(x.s);
    const canInc = qty < qtyMax(x.s) && (!slot || cap <= 0 || slotCount(s.items, slot) < cap);
    const buyCell = x.coupang_url
      ? `<button type="button" class="set-buy" data-ii="${ii}">🛒 구매</button>`
      : `<button type="button" class="set-buy is-off" disabled aria-disabled="true" title="구매 링크 준비 중">준비 중</button>`;
    return `<tr>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);font-size:13px">${esc(x.b || "")} ${esc(x.m || "")}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);font-size:13px;text-align:right;color:var(--muted)">${w}</td>
      <td style="padding:7px 8px;border-bottom:1px solid var(--line);font-size:13px;text-align:right;color:var(--muted)">${p}</td>
      <td style="padding:4px 8px;border-bottom:1px solid var(--line)">
        <div class="qty-ctrl">
          <button class="qty-dec" data-ii="${ii}" aria-label="수량 감소">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-inc" data-ii="${ii}" aria-label="수량 증가"${canInc ? '' : ' disabled'}>＋</button>
        </div>
      </td>
      <td style="padding:4px 8px;border-bottom:1px solid var(--line);text-align:right">${buyCell}</td>
    </tr>`;
  }).join("");
  // FE-WISH-09/10: 도장판(타입 <select> + 미니 도장판 + 슬롯) — 완성=0→≥1, 빈 칸은 담으러 가기 링크.
  const boardCells = activeSlots(type).map(sl => {
    const n = slotCount(s.items, sl);
    const cap = slotCap(sl, type);
    const on = n >= 1;
    const over = on && cap > 0 && n > cap;   // §6 하위호환: 정원 초과는 경고만(강제삭제 안 함)
    const must = sl.tier === "must";
    // 숫자(0/cap·×n) 비표시 — 도장 dot만. 채움=● 컬러, 빈칸=○ 점선. 정원 초과만 ⚠️ 경고 유지.
    const state = over
      ? `<span class="ssb-state over">⚠️</span>`
      : `<span class="stamp-dot${on ? " on" : ""}"></span>`;
    const body = `<span class="ssb-icon">${sl.icon}</span><span class="ssb-label">${esc(sl.label)}</span>${state}`;
    return on
      ? `<div class="ssb-cell on${must ? " must" : ""}${over ? " over" : ""}" title="${esc(sl.label)}${over ? ` 정원 초과(최대 ${cap})` : " 완료"}">${body}</div>`
      : `<a class="ssb-cell${must ? " must" : ""}" href="category.html?cat=${sl.slugs[0]}" title="${esc(sl.label)} 담으러 가기">${body}</a>`;
  }).join("");
  const miniBoard = miniStampBoard(s);
  const boardHtml = `
    ${setTypePickHtml(type, "set-type-select", "캠핑 유형")}
    ${miniBoard ? `<div class="ssb-prog">${miniBoard}</div>` : ""}
    <div class="ssb-grid">${boardCells}</div>
    <p class="ssb-hint">빈 칸을 누르면 담으러 갈 수 있어요. 정원은 상한선이에요(다 채울 필요 없어요).</p>`;
  let modal = document.getElementById("set-detail-modal");
  if (!modal) { modal = document.createElement("div"); modal.id = "set-detail-modal"; modal.className = "pmodal"; modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true"); modal.setAttribute("aria-labelledby","set-detail-title"); document.body.appendChild(modal); }
  modal.innerHTML = `<div class="pmbox" style="max-width:520px;width:100%;padding:20px">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <h2 id="set-detail-title" style="font-size:16px;font-weight:700;margin-bottom:4px">${esc(s.title)}</h2>
    <p style="font-size:12px;color:var(--muted);margin-bottom:14px">${s.items.length}개 장비</p>
    ${boardHtml}
    <table style="width:100%;border-collapse:collapse;margin-top:18px">
      <thead><tr>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:left;color:var(--muted)">장비</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">무게</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">가격</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">수량</th>
        <th style="padding:6px 8px;border-bottom:2px solid var(--line);font-size:12px;text-align:right;color:var(--muted)">구매</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--muted)">장비가 없어요</td></tr>'}</tbody>
      <tfoot><tr>
        <td style="padding:8px 8px 0;font-size:13px;font-weight:700">합계</td>
        <td style="padding:8px 8px 0;font-size:13px;font-weight:700;text-align:right;color:var(--accent)">${tw ? fmtW(tw) : "—"}</td>
        <td style="padding:8px 8px 0;font-size:13px;font-weight:700;text-align:right;color:var(--accent)">${tp ? tp.toLocaleString('ko-KR') + "원~" : "—"}</td>
        <td></td>
        <td></td>
      </tr></tfoot>
    </table>
    ${COMMUNITY_ENABLED ? `<button type="button" id="set-to-log-btn" style="margin-top:16px;width:100%;padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--txt)">📝 이 세트로 커뮤니티 로그 작성</button>` : ""}
  </div>`;
  // L-142: prevFocus 저장(재진입 시 최초 1회만)·ESC 닫기·초기 포커스 — 다른 모달과 일관
  const reopening = modal.classList.contains("on");
  if (!reopening) modal._prevFocus = document.activeElement;
  // H-87: 타입/수량 변경은 renderAccount()로 계정 세트 목록을 재생성 → 저장된 _prevFocus 노드가 분리됨.
  // 재진입 시 분리된 경우 재생성된 세트 카드로 갱신해 닫을 때 포커스 복귀가 끊기지 않게 함.
  else if (modal._prevFocus && !document.contains(modal._prevFocus)) {
    modal._prevFocus = document.querySelector(`.acc-set[data-sid="${sid}"]`) || modal._prevFocus;
  }
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);
  modal.classList.add("on");
  const close = () => {
    modal.classList.remove("on");
    document.removeEventListener("keydown", modal._onKey);
    if (modal._prevFocus && modal._prevFocus.focus) modal._prevFocus.focus();
  };
  modal._onKey = e => { if (e.key === "Escape") { close(); return; } _trapTab(e, modal); };   // L-312: Tab 포커스 트랩
  document.addEventListener("keydown", modal._onKey);
  modal.querySelector(".pmx").onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").focus();
  // FE-WISH-09/10: 세트 타입 전환(세그먼트) → 정원 프리셋 재적용. 초과분은 강제 삭제 안 함(§6 하위호환).
  const detailTypeSel = modal.querySelector(".set-type-select");
  if (detailTypeSel) detailTypeSel.querySelectorAll(".stp-btn").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    detailTypeSel.querySelectorAll(".stp-btn").forEach(b => { b.classList.remove("stp-active"); b.setAttribute("aria-pressed","false"); });
    btn.classList.add("stp-active"); btn.setAttribute("aria-pressed","true");
    detailTypeSel.dataset.value = btn.dataset.val;
    // M-226: getSets() 재조회 후 sid로 세트 탐색 — renderAccount 이후 인덱스 어긋남 방지
    const arr = getSets(); const si2 = arr.findIndex(x => x.id === sid); const set = arr[si2]; if (!set) return;
    set.type = btn.dataset.val; saveSets(arr);
    renderAccount(); openSetDetail(sid);
  });
  modal.querySelectorAll(".qty-dec").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    // M-253/M-318: 더블탭 중 재렌더 방지 — 클릭 즉시 모달 내 qty 버튼 전체 비활성화
    modal.querySelectorAll(".qty-dec,.qty-inc").forEach(b => { b.disabled = true; });
    const arr = getSets(); const si2 = arr.findIndex(x => x.id === sid); const set = arr[si2]; if (!set) return;
    const ii = +btn.dataset.ii; const item = set.items[ii]; if (!item) return;
    if ((item.qty || 1) <= 1) set.items.splice(ii, 1);
    else item.qty = (item.qty || 1) - 1;
    saveSets(arr); renderAccount(); openSetDetail(sid);
  });
  modal.querySelectorAll(".qty-inc").forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    // M-253/M-318: 더블탭 중 재렌더 방지 — 클릭 즉시 모달 내 qty 버튼 전체 비활성화
    modal.querySelectorAll(".qty-dec,.qty-inc").forEach(b => { b.disabled = true; });
    const arr = getSets(); const si2 = arr.findIndex(x => x.id === sid); const set = arr[si2]; if (!set) return;
    const ii = +btn.dataset.ii; const item = set.items[ii]; if (!item) return;
    // 같은상품 한도 + 슬롯 정원 둘 다 검사(정원 도달 시 증가 무시)
    const slot = slotForSlug(item.s);
    const cap = slot ? slotCap(slot, set.type || DEFAULT_SET_TYPE) : qtyMax(item.s);
    if ((item.qty || 1) >= qtyMax(item.s)) return;
    if (slot && cap > 0 && slotCount(set.items, slot) >= cap) return;
    item.qty = (item.qty || 1) + 1;
    saveSets(arr); renderAccount(); openSetDetail(sid);
  });
  // FE-WISH-07: 항목별 쿠팡 구매 — 새 탭으로 열고 click_events 집계(상품 상세 pmbuy와 동일 패턴)
  modal.querySelectorAll(".set-buy:not(.is-off)").forEach(btn => btn.onclick = async e => {
    e.stopPropagation();
    const item = getSets().find(x => x.id === sid)?.items[+btn.dataset.ii];
    const url = item?.coupang_url;
    if (!url) return;
    openExternal(url);
    // GA4 클릭 이벤트(쿠팡 구매) — Supabase 집계와 병행, 미로드 시 무해 no-op
    if (typeof gtag === "function") gtag("event", "coupang_buy", {
      item_brand: item.b, item_model: item.m, item_category: item.s,
    });
    try {
      const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
      let sessionId = localStorage.getItem("_sid");
      if (!sessionId) { sessionId = Math.random().toString(36).slice(2); try { localStorage.setItem("_sid", sessionId); } catch (_) {} }  // FE-023: setItem 예외가 insert를 막지 않게 격리
      await supabase.from("click_events").insert({
        slug: item.s, brand: item.b, model: item.m,
        item_idx: item.item_idx ?? null,
        coupang_url: url, session_id: sessionId
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

/* FE-SOC-09: '내 로그'의 상품 후기 카드. product_pcode=b|m|cap에서 라벨 파싱,
   search.json 인덱스(prodMap)로 슬러그를 찾아 상품으로 이동(없으면 링크 없이 표기). */
function _myReviewCard(r, prodMap) {
  const parts = (r.product_pcode || "").split("|");
  const b = parts[0] || "", m = parts[1] || "";
  const ent = prodMap.get(r.product_pcode);
  const href = ent ? `category.html?cat=${ent.s}&brands=${encodeURIComponent(ent.b)}&q=${encodeURIComponent(ent.m)}` : null;
  const dt = fmtDate(r.created_at, { month: "long", day: "numeric" });
  const photo = safeHttps(r.image_urls && r.image_urls[0])
    ? `<img src="${esc(safeHttps(r.image_urls[0]))}" alt="" loading="lazy" onerror="this.style.display='none'" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0">` : "";
  const body = (r.body || "").replace(/\n/g, " ");
  const title = (`${b} ${m}`).trim() || "상품";
  const inner = `<div style="display:flex;gap:12px">
      ${photo}
      <div style="min-width:0;flex:1">
        <div class="log-card-head"><span class="pmrv-stars">${stars(r.rating)}</span><span class="log-date">${dt}</span></div>
        <div class="log-title">${esc(title)}${href ? ` <span class="pli-chev" aria-hidden="true">›</span>` : ""}</div>
        <div class="log-preview">${esc(body.slice(0, 80))}${body.length > 80 ? "…" : ""}</div>
      </div>
    </div>`;
  return href
    ? `<a class="my-log-card" href="${esc(href)}" style="display:block;text-decoration:none;color:inherit">${inner}</a>`
    : `<div class="my-log-card">${inner}</div>`;
}

function renderAccount() {
  if (!document.getElementById("wishlist")) return;
  const wishes = getWish();
  const sets = getSets();
  // H-69: account.html이 관리하는 _accUser와 전역 캐노니컬 auth 중 하나라도 로그인이면 로그인으로 간주.
  // (둘은 동일 세션 반영이나 초기화 타이밍이 독립적 — OR로 auth 미완료 구간의 false-logged-out 방지)
  const isLoggedIn = !!window._accUser || !!(window.isLoggedIn && window.isLoggedIn());
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
    // M-317/M-403/M-246: 사용자 변경 또는 로그아웃 시 loaded 플래그 초기화 → 재로그인·사용자 교체 시 이전 데이터 노출 방지
    if (myLogsList.dataset.loadedUser && myLogsList.dataset.loadedUser !== (userId || "")) {
      delete myLogsList.dataset.loaded;
      delete myLogsList.dataset.logLoginShown;
    }
    if (userId) {
      myLogsList.dataset.loadedUser = userId;
      logsSec._accHasContent = true;
      logsSec.style.display = isLoggedIn ? "block" : "none";
      if (!myLogsList.dataset.loaded) {
        myLogsList.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:12px 0">불러오는 중…</div>`;
        import("./supabaseClient.js?v=0cfa00cd").then(async ({ supabase, getMyReviews }) => {
          myLogsList.dataset.loaded = "1";
          const logsCnt = document.getElementById("logscount");

          // 후기 → 상품 이동 링크 해석용 인덱스(있으면). 실패해도 후기는 링크 없이 표시.
          let prodMap = new Map();
          try { (await getJSON("data/search.json?v=9416ba63")).forEach(e => prodMap.set(wishKey(e.b, e.m, e.cap), e)); } catch (_) {}

          // FE-SOC-09: 내가 쓴 상품 후기
          const reviews = await getMyReviews();

          // FE-SOC-10: 커뮤니티 글(posts)은 COMMUNITY_LOG_ENABLED일 때만 '내 로그'에 노출(복구 가능)
          let posts = [];
          if (COMMUNITY_LOG_ENABLED) {
            const { data } = await supabase
              .from("posts").select("id, title, body, created_at")
              .eq("user_id", userId).is("deleted_at", null)
              .order("created_at", { ascending: false }).limit(10);
            posts = data || [];
          }
          const reviewCount = reviews.length;
          const setCount = (postN) => { if (logsCnt) { const t = reviewCount + postN; logsCnt.textContent = t ? `${t}개` : ""; } };

          if (!reviewCount && !posts.length) {
            setCount(0);
            myLogsList.innerHTML = `
              <div style="text-align:center;padding:32px 0 16px">
                <div style="font-size:36px;margin-bottom:10px">📝</div>
                <div style="font-size:14px;font-weight:600;margin-bottom:6px">아직 남긴 후기가 없어요</div>
                <div style="font-size:13px;color:var(--muted);margin-bottom:16px">상품 상세에서 별점과 후기를 남기면 여기에 모여요</div>
              </div>`;
            return;
          }
          setCount(posts.length);

          // 후기 목록 + (복구 시) 커뮤니티 글 컨테이너
          myLogsList.innerHTML =
            `<div id="my-reviews">${reviews.map(r => _myReviewCard(r, prodMap)).join("")}</div>` +
            `<div id="my-community-logs"></div>`;

          if (!(COMMUNITY_LOG_ENABLED && posts.length)) return;

          // ── 커뮤니티 글(복구 시): 편집/삭제 포함. #my-community-logs에 렌더(후기 영역 보존). ──
          const postsBox = document.getElementById("my-community-logs");
          const renderMyLogs = (list) => {
            postsBox.innerHTML = `
              <div style="display:flex;justify-content:flex-end;margin:6px 0 10px">
                ${COMMUNITY_ENABLED ? `<a class="achip clear" href="community.html" style="font-size:12px;padding:5px 12px">+ 새 로그</a>` : ""}
              </div>` +
              list.map((p, pi) => {
                const dt = fmtDate(p.created_at, { month: "long", day: "numeric" });
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

            postsBox.querySelectorAll(".my-log-edit").forEach(btn => {
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
                  // try/catch — import·update가 reject로 throw해도 "저장 중…" 고착 방지(2.1a 부류).
                  let _le;
                  try {
                    const { supabase: sb } = await import("./supabaseClient.js?v=0cfa00cd");
                    _le = await sb.from("posts")
                      .update({ title: newTitle, body: newBody })
                      .eq("id", p.id).eq("user_id", userId);
                  } catch (e) { _le = { error: e }; }
                  if (_le.error) { errEl2.textContent = "저장 중 오류가 발생했어요."; errEl2.style.display = ""; saveBtn.disabled = false; saveBtn.textContent = "저장"; return; }
                  list[pi] = { ...p, title: newTitle, body: newBody };
                  renderMyLogs(list);
                };
              };
            });

            postsBox.querySelectorAll(".my-log-del").forEach(btn => {
              btn.onclick = async () => {
                const p = list[+btn.dataset.pi];
                if (!confirm(`"${p.title}" 로그를 삭제할까요?`)) return;
                btn.disabled = true;
                // try/catch — import·update가 reject로 throw해도 삭제 버튼이 영구 비활성되지 않게(2.1a 부류).
                let _ld;
                try {
                  const { supabase: sb } = await import("./supabaseClient.js?v=0cfa00cd");
                  _ld = await sb.from("posts")
                    .update({ deleted_at: new Date().toISOString() })
                    .eq("id", p.id).eq("user_id", userId);
                } catch (e) { _ld = { error: e }; }
                if (_ld.error) { showToast("삭제 중 오류가 발생했어요."); btn.disabled = false; return; }   // L-448: alert→showToast(iOS Safari PWA 차단 방지, M-452/539와 동일)
                const remaining = list.filter((_, i) => i !== +btn.dataset.pi);
                setCount(remaining.length);   // 후기 수 + 남은 글 수
                renderMyLogs(remaining);
              };
            });
          };
          renderMyLogs(posts);
        }).catch(() => { logsSec._accHasContent = false; logsSec.style.display = "none"; delete myLogsList.dataset.loaded; });  // H-129: 실패 시 loaded 리셋 → 다음 렌더서 재시도(영구 미로드 방지)
      }
    } else {
      // 비로그인 시 '내 로그' 섹션 완전히 숨김 (상단 로그인 버튼으로 유도 — 섹션별 CTA 제거)
      logsSec._accHasContent = false;
      logsSec.style.display = "none";
      const logsCntEl = document.getElementById("logscount");
      if (logsCntEl) logsCntEl.textContent = "";   // 직전 로그인 세션의 잔여 카운트 제거
    }
  }

  // 찜 섹션
  const wishSec = document.getElementById("wish-section");
  const wishEl = document.getElementById("wishlist");
  const cnt = document.getElementById("wishcount");
  if (wishSec) {
    wishSec._accHasContent = true;
    wishSec.style.display = isLoggedIn ? "block" : "none";  // H-42: 비로그인 시 섹션 숨김
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
  // L-113: 찜 0개 시 bulkBtn 숨김
  if (wishEl && !wishes.length) { const bb = document.getElementById("wish-bulk-add"); if (bb) bb.style.display = "none"; }
  if (wishEl && wishes.length) {
    wishEl.innerHTML = wishes.map((x, i) => {
      // H-133: x.b/x.m 누락 시 encodeURIComponent(undefined)="undefined"로 "?brands=undefined&q=undefined"
      //   브로큰 URL·0건 검색이 된다 → 둘 다 있을 때만 brands/q 부착, 없으면 카테고리 페이지로 폴백.
      const href = (x.b && x.m)
        ? `category.html?cat=${encodeURIComponent(x.s)}&brands=${encodeURIComponent(x.b)}&q=${encodeURIComponent(x.m)}`
        : `category.html?cat=${encodeURIComponent(x.s)}`;  // L-355: 카테고리 슬러그도 인코딩(방어)
      // L-75: role="button" + 내부 <button> 중첩 HTML 위반 → 찜 해제 버튼만 interactive, pli는 click 핸들러만 유지
      return `<div class="pli" data-href="${esc(href)}" data-wkey="${esc(x.key)}" style="cursor:pointer">
        <button type="button" class="pli-wish on" data-key="${esc(x.key)}" aria-label="찜 해제" aria-pressed="true">${BOOKMARK_SVG}</button>
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
    // M-53: 찜 카드 클릭 시 카테고리 이탈 대신 인라인 모달 열기
    wishEl.querySelectorAll(".pli").forEach((card) => {
      const go = async () => {
        if (card.dataset.loading) return;  // M-404: 중복 클릭 가드
        const wx = getWish().find(w => w.key === card.dataset.wkey) || null;  // M-515: 렌더 시점 스냅샷 대신 재조회
        if (!wx || wx.s == null) { location.href = card.dataset.href; return; }  // M-516: 빈 문자열 wx.s 허용
        card.dataset.loading = "1";
        try {
          const catJson = await getJSON(`data/${wx.s}.json`);  // M-357/M-408 + BE-073: getJSON 경유(네이티브 라이브 fetch·오프라인 폴백)
          // FE-039: capacity까지 일치(다인원 변형 오모달 방지)
          const prod = (catJson.models || []).find(p => p.brand === wx.b && p.model === wx.m && String(p.capacity ?? "") === String(wx.cap ?? ""));
          if (prod) {
            const prevSlug = STATE.slug, prevData = STATE.data;
            STATE.slug = wx.s; STATE.data = catJson;
            openProduct(prod);
            // H-92: STATE 복원을 모든 close 경로(ESC 포함)에서 보장 — 일회성 close 훅 사용
            const _pm = document.getElementById("pmodal");
            if (_pm) _pm._onCloseOnce = () => { STATE.slug = prevSlug ?? null; STATE.data = prevData ?? null; delete card.dataset.loading; };  // M-557/M-564
            return;
          }
        } catch (_) {}
        delete card.dataset.loading;
        location.href = card.dataset.href;
      };
      card.onclick = go;
      card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
    });
    wishEl.querySelectorAll(".pli-wish").forEach(b => b.onclick = e => {
      e.stopPropagation();
      // H-88: 렌더시점 data-i를 재로드 배열에 splice하면 빠른 연속삭제 시 stale 인덱스로 엉뚱한 항목 제거.
      // 안정적 key로 식별·필터해 삭제.
      const key = b.dataset.key;
      setWish(getWish().filter(w => w.key !== key)); renderAccount();
      window.accAnnounce?.('찜 해제됐어요');
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
    // L-113: 재호출 시 disabled 초기화
    bulkBtn.disabled = false;
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
      showToast(`"${setName}" 저장됨${wStr ? " · ⚖️ " + wStr : ""}${tp ? " · 💰 " + tp.toLocaleString('ko-KR') + "원" : ""}`, 3000);
      bulkBtn.textContent = "✅ 세트 저장됨 — 마이페이지 세트 탭에서 확인";
      bulkBtn.disabled = true;
    };
  }

  // 세트 섹션
  const setsSec = document.getElementById("sets-section");
  const setsEl = document.getElementById("setslist");
  const setsCnt = document.getElementById("setscount");
  if (setsSec) {
    // 비로그인 시 '내 세트' 섹션 완전히 숨김 (상단 로그인 버튼으로 유도 — 섹션별 CTA 제거)
    setsSec._accHasContent = isLoggedIn;
    setsSec.style.display = isLoggedIn ? "block" : "none";
  }
  if (setsCnt) setsCnt.textContent = (isLoggedIn && sets.length) ? `${sets.length}개` : "";
  if (setsEl && !sets.length && isLoggedIn) {  // M-526: 비로그인 시 CTA가 이미 표시됨, empty msg 중복 방지
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
    const setGoal = (id, g) => { try { localStorage.setItem(`set-goal-${id}`, String(g)); return true; } catch (e) { console.error("setGoal:", e); return false; } };  // FE-182: QuotaExceeded/Private Mode 예외가 저장 핸들러를 깨 모달이 닫히지 않던 동결 방지
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
      const type = s.type || DEFAULT_SET_TYPE;
      const tdef = SET_TYPES[type] || SET_TYPES[DEFAULT_SET_TYPE];
      // FE-WISH-09: 노출 슬롯만, 1개라도 담겼으면 도장 켜짐(0→≥1). 개수 압박 없음.
      const slotBadges = activeSlots(type).map(slot => {
        const on = slotCount(s.items, slot) >= 1;
        return `<span class="set-slot${on ? " on" : ""}" title="${slot.label}${on ? " ✓" : ""}">${slot.icon}</span>`;
      }).join("");
      // FE-WISH-10(B-2-3): 완성도 '필수 n/m'/배지 → 미니 도장판(모달·상세와 동일 컴포넌트).
      const miniBoard = miniStampBoard(s);
      return `<div class="pli acc-set" role="button" tabindex="0" data-sid="${s.id}" aria-label="${esc(s.title)} 세트 상세 보기">
        <div class="pli-info">
          <div class="pli-top">${tdef.icon} ${esc(tdef.label)}</div>
          <div class="pli-name">${esc(s.title)}</div>
          <div class="pli-top" style="margin-top:3px">${s.items.length}개 장비 ${weightBadge(totalWeight(s.items))}</div>
          ${miniBoard ? `<div class="set-prog">${miniBoard}</div>` : ""}
          ${goalBar(s)}
          <div class="set-slots">${slotBadges}</div>
        </div>
        <div class="pli-side">
          <div class="pli-price">${priceLabeled(totalPrice(s.items) || null, '<span class="nd">—</span>')}</div>
          <button type="button" class="acc-set-share" data-sid="${s.id}" aria-label="링크 복사" title="공유 링크 복사">🔗</button>
          <button type="button" class="acc-set-del" data-sid="${s.id}" aria-label="세트 삭제">✕</button>
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
      const onGoalKey = ev => { if (ev.key === "Escape") { closeGoal(); return; } _trapTab(ev, dialog); };   // L-126: ESC 닫기 · FE-027: Tab 포커스 트랩
      document.addEventListener("keydown", onGoalKey);
      dialog.querySelector(".pmx").onclick = closeGoal;
      dialog.onclick = ev => { if (ev.target === dialog) closeGoal(); };
      dialog.querySelector("#goal-save").onclick = () => {
        const ok = setGoal(setId, +slider.value); closeGoal();   // FE-182: 저장 성공/실패와 무관하게 항상 모달 닫기
        if (ok) renderAccount(); else showToast("저장 공간이 부족해 목표를 저장하지 못했어요");
      };
      dialog.querySelector(".pmx").focus();   // L-126: 초기 포커스
    });
    setsEl.querySelectorAll(".acc-set-share").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const s = getSets().find(x => x.id === b.dataset.sid);
      if (!s) return;
      try {
        const payload = { name: s.title || s.name || "세트", type: s.type || DEFAULT_SET_TYPE, items: (s.items || []).map(x => ({ b: x.b, m: x.m, qty: x.qty || 1, weight_g: x.weight_g ?? null, cap: x.cap ?? null, s: x.s || "", pcode: x.pcode || "", coupang_url: x.coupang_url || "", p: x.p ?? null, img: x.img ?? null })) };  // FE-110: type 포함 — 미포함 시 복원 세트가 DEFAULT_SET_TYPE로 오분류돼 슬롯·완성도 오계산
        // H-78: deprecated escape/unescape 대신 TextEncoder로 UTF-8 바이트→base64(한글·이모지 안전). 출력은 기존 idiom과 동일.
        const _utf8 = new TextEncoder().encode(JSON.stringify(payload));
        const encoded = btoa(Array.from(new Uint8Array(_utf8), c => String.fromCharCode(c)).join("")).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');  // H-108: spread 대신 Array.from → 대형 세트 스택 오버플로 방지
        const _origin = location.hostname === "localhost" ? "https://gear-forest.com" : location.origin;  // M-219: localhost URL 방지
        const url = `${_origin}/account.html?view-set=${encoded}`;
        // M-274: URL 2000자 초과 시 경고(일부 환경에서 링크 단축기 파손)
        if (url.length > 2000) showToast("세트 크기가 커 일부 환경에서 링크가 깨질 수 있어요");
        const done = () => { b.textContent = "✓"; setTimeout(() => { b.textContent = "🔗"; }, 1500); window.accAnnounce?.('링크가 복사됐어요'); showToast('링크가 복사됐어요'); };
        const fallbackCopy = () => {  // FE-150: iOS WKWebView는 prompt() 차단 → execCommand 폴백 후 토스트 안내
          try { const ta = document.createElement('textarea'); ta.value = url; ta.style.cssText = 'position:fixed;top:0;opacity:0'; document.body.appendChild(ta); ta.focus(); ta.select(); const ok = document.execCommand('copy'); ta.remove(); if (ok) { done(); return; } } catch (_) {}
          showToast('복사에 실패했어요. 링크를 길게 눌러 복사해주세요');
        };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(fallbackCopy);
        else fallbackCopy();
      } catch { showToast("링크 생성에 실패했어요."); }  // FE-139: alert()는 WKWebView서 차단될 수 있어 토스트로
    });
    setsEl.querySelectorAll(".acc-set-del").forEach(b => b.onclick = e => {
      e.stopPropagation();
      const arr = getSets();
      // M-272: 배열 인덱스 대신 안정 id로 삭제 — renderAccount 후 인덱스 어긋남 방지
      const delIdx = arr.findIndex(x => x.id === b.dataset.sid);
      const deleted = delIdx >= 0 ? arr.splice(delIdx, 1)[0] : null;
      if (deleted?.remoteId && typeof window._deleteRemoteGearSet === 'function') {
        // L-198: fire-and-forget이던 원격 삭제 실패를 사용자에게 알린다(로컬 삭제는 그대로 진행).
        Promise.resolve(window._deleteRemoteGearSet(deleted.remoteId))
          .then(r => { if (r?.error) showToast("원격 세트 삭제에 실패했어요. 다른 기기에 남아 있을 수 있어요."); })
          .catch(() => showToast("원격 세트 삭제에 실패했어요. 다른 기기에 남아 있을 수 있어요."));
      }
      saveSets(arr); renderAccount();
      window.accAnnounce?.('세트가 삭제됐어요');
    });

    // 세트 카드 클릭 → 상세 모달 (수량 ± 편집 포함)
    setsEl.querySelectorAll(".acc-set").forEach(card => {
      card.onclick = () => openSetDetail(card.dataset.sid);
      card.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSetDetail(card.dataset.sid); } };  // H-126
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
const VAPID_PUBLIC_KEY = "BDj43GvN0UZ1DzeEtjxl_rsj9c5m7BtzuSXgE39e-ixDGELVyU1hbfd-CFxr_cBtLwHI4j8oOi1HhAsUBBt8SOE";

async function requestPushSubscription(userId) {
  if (localStorage.getItem("push-denied")) {
    // L-216: 브라우저 설정에서 권한을 다시 허용했으면 영구 차단 플래그 해제 후 진행
    if (typeof Notification !== "undefined" && Notification.permission === "granted") localStorage.removeItem("push-denied");
    else return;
  }
  try {
    // L-378: SW가 끝내 활성화 안 되면 serviceWorker.ready가 무한 대기 → 10s 타임아웃 가드
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, rej) => setTimeout(() => rej(new Error("sw-ready-timeout")), 10000)),
    ]);
    let sub = await reg.pushManager.getSubscription();
    if (sub) { await _savePushSub(sub, userId); return; }

    // 알림 권한 요청
    const perm = await Notification.requestPermission();
    // H-81: "denied"(명시적 거부)일 때만 영구 차단 기록. "default"(다이얼로그 단순 닫기)는
    // 기록 없이 조용히 반환 — 다음 기회에 다시 요청 가능해야 함.
    if (perm === "denied") { localStorage.setItem("push-denied", "1"); return; }
    if (perm !== "granted") return;

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
  if (!j || !j.keys) { console.warn("_savePushSub: keys 없음"); return; }  // M-466: keys null 가드
  const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
  // L-267: 같은 endpoint를 다른 사용자가 재구독할 때 이전 사용자 행이 잔존하면 푸시가 누출되므로
  //   서버 RPC(save_push_subscription)가 해당 endpoint의 기존 행을 삭제하고 현재 사용자로 재등록한다.
  const { error } = await supabase.rpc("save_push_subscription", {
    p_endpoint: j.endpoint,
    p_p256dh: j.keys.p256dh,
    p_auth_key: j.keys.auth,
  });
  // M-170/M-440: upsert 오류 무음 방지
  if (error) { console.error("_savePushSub:", error); showToast("알림 구독 저장에 실패했어요. 다시 시도해 주세요."); }
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
    const { supabase: sb } = await import("./supabaseClient.js?v=0cfa00cd");
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
      const star = (d.metrics || []).filter(m => m.is_star)[0];  // FE-003: metrics 누락 JSON 가드
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

let _logGen = 0;  // FE-018: 빠른 정렬/태그 전환 레이스 가드(구식 응답 폐기)
async function renderLogFeed(sortMode = "latest", filterTag = _logFeedTag) {
  _logFeedTag = filterTag;
  _logFeedSort = sortMode;
  const gen = ++_logGen;
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
    const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
    const orderCol = sortMode === "popular" ? "likes" : "created_at";
    let query = supabase
      .from("posts")
      .select("id, title, body, tags, created_at, user_id, image_urls, likes, comment_count, gear_set_snapshot, profiles(nickname)")
      .eq("is_public", true)
      .order(orderCol, { ascending: false })
      .limit(50);
    if (filterTag) query = query.contains("tags", [filterTag]);
    const { data: posts, error } = await query;
    if (gen !== _logGen) return;  // FE-018: 그 사이 정렬/태그가 바뀌면 구식 응답 폐기
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
      const dt = fmtDate(p.created_at, { month: "long", day: "numeric" });
      const tagHtml = (p.tags || []).slice(0, 4).map(t => `<button type="button" class="log-tag log-tag-btn" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
      const preview = (p.body || "").slice(0, 80).replace(/\n/g, " ");
      const _img0 = p.image_urls?.[0];  // FE-171: posts에 단수 image_url 컬럼은 없음 — image_urls(text[]) 첫 장 사용
      const imgHtml = safeHttps(_img0) ? `<img class="log-card-img" src="${esc(safeHttps(_img0))}" alt="" loading="lazy" onerror="this.style.display='none'">` : "";  // M-233 · FE-138: 깨진 이미지 폴백
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
        <div class="log-preview">${esc(preview)}${(p.body || "").length > 80 ? "…" : ""}</div>
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
        if (!window._commUser) { showToast("로그인 후 좋아요를 누를 수 있어요"); return; }
        const pid = btn.dataset.pid;
        const wasLiked = btn.dataset.liked === "1";
        const cntEl = btn.querySelector(".log-like-cnt");
        const cur = parseInt(cntEl.textContent, 10) || 0;
        const next = !wasLiked;
        _setPostLiked(pid, next);  // 낙관적 업데이트
        btn.dataset.liked = next ? "1" : "0";
        btn.classList.toggle("on", next);
        btn.innerHTML = `${next ? "♥" : "♡"} <span class="log-like-cnt">${cur + (next ? 1 : -1)}</span>`;
        try {
          const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
          const { error } = await supabase.rpc(next ? "increment_post_likes" : "decrement_post_likes", { post_id: pid });
          if (error) throw error;
        } catch (_) {  // FE-020: RPC 실패 시 낙관적 업데이트 롤백
          _setPostLiked(pid, wasLiked);
          btn.dataset.liked = wasLiked ? "1" : "0";
          btn.classList.toggle("on", wasLiked);
          btn.innerHTML = `${wasLiked ? "♥" : "♡"} <span class="log-like-cnt">${cur}</span>`;
          showToast("좋아요 처리 중 오류가 발생했어요");
        }
      };
    });
  } catch (e) {
    if (gen !== _logGen) return;  // FE-018: 구식 에러가 최신 렌더를 덮지 않게
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
  const dt = fmtDate(p.created_at, { year: "numeric", month: "long", day: "numeric" });
  const tagHtml = (p.tags || []).map(t => `<span class="log-tag" style="font-size:12px;padding:3px 10px">${esc(t)}</span>`).join("");
  const body = esc(p.body || "").replace(/\n/g, "<br>");
  modal.innerHTML = `<div class="pmbox log-detail-box" role="dialog" aria-modal="true">
    <button type="button" class="pmx" aria-label="닫기">✕</button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <span class="log-nick" style="font-size:14px">${esc(nick)}</span>
      <span class="log-date">${dt}</span>
    </div>
    <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;line-height:1.4">${esc(p.title)}</h2>
    ${safeHttps(p.image_urls?.[0]) ? `<img src="${esc(safeHttps(p.image_urls[0]))}" alt="" onerror="this.style.display='none'" style="width:100%;max-height:240px;object-fit:cover;border-radius:8px;margin-bottom:14px">` : ""}
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
  const prevFocus = document.activeElement;   // L-175: 닫을 때 포커스 복귀
  const close = () => { modal.classList.remove("on"); document.removeEventListener("keydown", onKey); if (prevFocus && prevFocus.focus) prevFocus.focus(); };   // L-173+L-175
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
  modal.querySelector(".pmx").focus();
  const likeBtn = modal.querySelector("#detail-like-btn");
  if (likeBtn) {
    likeBtn.onclick = async e => {
      e.stopPropagation();
      const pid = likeBtn.dataset.pid;
      const wasLiked = likeBtn.dataset.liked === "1";
      const cntEl = likeBtn.querySelector(".log-like-cnt");
      const cur = parseInt(cntEl.textContent, 10) || 0;
      const next = !wasLiked;
      _setPostLiked(pid, next);  // 낙관적 업데이트
      likeBtn.dataset.liked = next ? "1" : "0"; likeBtn.classList.toggle("on", next);
      likeBtn.innerHTML = `${next ? "♥" : "♡"} <span class="log-like-cnt">${cur + (next ? 1 : -1)}</span> 좋아요`;
      try {
        const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
        const { error } = await supabase.rpc(next ? "increment_post_likes" : "decrement_post_likes", { post_id: pid });
        if (error) throw error;
      } catch (_) {  // FE-020: RPC 실패 시 낙관적 업데이트 롤백
        _setPostLiked(pid, wasLiked);
        likeBtn.dataset.liked = wasLiked ? "1" : "0"; likeBtn.classList.toggle("on", wasLiked);
        likeBtn.innerHTML = `${wasLiked ? "♥" : "♡"} <span class="log-like-cnt">${cur}</span> 좋아요`;
        showToast("좋아요 처리 중 오류가 발생했어요");
      }
    };
  }
  const onKey = e => { if (e.key === "Escape") { close(); return; } _trapTab(e, modal); };   // L-245: Tab 포커스 트랩
  if (modal._onKey) document.removeEventListener("keydown", modal._onKey);  // M-193: 로그 연속 클릭 시 onKey 누적 → ESC 중복 close 방지
  modal._onKey = onKey;
  document.addEventListener("keydown", onKey);

  // 댓글 로드 및 제출
  (async () => {
    const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
    const cmtList = document.getElementById("detail-cmt-list");
    const cmtCnt = document.getElementById("detail-cmt-cnt");
    const cmtForm = document.getElementById("detail-cmt-form");
    const cmtInput = document.getElementById("detail-cmt-input");

    async function loadComments() {
      const { data: cmts } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, profiles(nickname)")
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
          const dt = fmtDate(c.created_at, { month: "long", day: "numeric" });
          const isMine = window._commUser && window._commUser.id === c.user_id;
          return `<div class="cmt-row" data-cid="${esc(c.id)}">
            <div class="cmt-meta"><span class="cmt-nick">${esc(nick)}</span><span class="cmt-date">${dt}</span>${isMine ? `<button type="button" class="cmt-del-btn" data-cid="${esc(c.id)}">✕</button>` : ""}</div>
            <div class="cmt-body">${esc(c.body)}</div>
          </div>`;
        }).join("");
        cmtList.querySelectorAll(".cmt-del-btn").forEach(btn => {
          btn.onclick = async () => {
            const cid = btn.dataset.cid;
            if (!window._commUser) { showToast("로그인이 필요해요."); return; }  // FE-009: 세션 만료 시 null.id TypeError 방지
            const { error } = await supabase.from("comments").update({ deleted_at: new Date().toISOString() }).eq("id", cid).eq("user_id", window._commUser.id);
            if (error) { console.error("cmt delete:", error); showToast("댓글 삭제에 실패했어요."); return; }  // M-171
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
        if (!window._commUser) { showToast("로그인 후 댓글을 작성할 수 있어요."); return; }  // FE-168: alert()는 iOS WKWebView PWA에서 차단 → 무피드백 → showToast로 교체
        const submitBtn = cmtForm.querySelector("button[type=submit]");
        if (submitBtn) submitBtn.disabled = true;
        // try/finally — insert가 reject로 throw해도 제출 버튼이 영구 비활성되지 않게(2.1a 부류).
        try {
          const { error } = await supabase.from("comments").insert({ post_id: p.id, user_id: window._commUser.id, body: content });
          if (!error) { if (cmtInput) cmtInput.value = ""; await loadComments(); }
          else { showToast("댓글을 등록하지 못했어요. 잠시 후 다시 시도해주세요."); }  // FE-021: 실패 피드백
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      };
    }
  })().catch(e => console.error("openLogDetail async:", e));  // M-211: UnhandledPromiseRejection 방지
}

function openLogModal(presetSetIndex) {
  const modal = document.getElementById("log-modal");
  if (!modal) return;
  const body = document.getElementById("log-modal-body");
  if (!body) return;   // M-112: body null → TypeError 방지
  // H-72: 캠핑 로그는 account 페이지에서도 동작 — 커뮤니티 전용 _commUser(미할당=항상 undefined) 대신 전역 캐노니컬 auth 사용
  if (!window.isLoggedIn()) {
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

  // M-407: 재오픈 시 이전 Blob URL 해제 (body.innerHTML 교체 전)
  const _prevThumb = body.querySelector("#lf-img-thumb");
  if (_prevThumb?.src?.startsWith("blob:")) URL.revokeObjectURL(_prevThumb.src);
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
    if (imgThumb.src.startsWith("blob:")) URL.revokeObjectURL(imgThumb.src);
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
    const user = window.currentUser();  // FE-005: 제출 시점 세션 만료 시 null.id TypeError 방지
    if (!user) { errEl.textContent = "로그인 세션이 만료됐어요. 다시 로그인해주세요."; errEl.style.display = ""; return; }
    errEl.style.display = "none";
    submitBtn.disabled = true; submitBtn.textContent = "등록 중…";
    let uploadedPath = null;  // FE-017: posts.insert 실패 시 고아 Storage 파일 롤백 위해 try 바깥 선언
    try {
      const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
      let image_url = null;
      const imgFile = imgInput.files[0];
      if (imgFile) {
        const _np = imgFile.name.split(".");
        const ext = (_np.length > 1 ? _np.pop().toLowerCase() : "") || "jpg";  // FE-006: 점 없는 파일명이 확장자로 쓰이는 것 방지
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-images").upload(path, imgFile, { upsert: false });
        if (upErr) throw upErr;
        uploadedPath = path;  // FE-017: 업로드 성공분만 롤백 대상
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
        user_id: user.id, title, body: content,
        tags, is_public, image_urls: image_url ? [image_url] : [], gear_set_snapshot   // FE-171: 스키마는 image_urls(text[]). 단수 image_url 컬럼 미존재로 INSERT 전체 실패하던 것 수정
      });
      if (error) throw error;
      close();  // FE-019: classList 직접 조작 대신 close() — onEsc 리스너 제거·blob URL 해제 포함
      renderLogFeed();
    } catch (err) {
      if (uploadedPath) {  // FE-017: 업로드 성공 후 INSERT 실패 시 고아 파일 삭제
        try {
          const { supabase } = await import("./supabaseClient.js?v=0cfa00cd");
          await supabase.storage.from("post-images").remove([uploadedPath]);
        } catch (_) {}
      }
      errEl.textContent = "저장 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
      errEl.style.display = "";
      submitBtn.disabled = false; submitBtn.textContent = "로그 등록";
    }
  };

  modal.classList.add("on");
  const close = () => {
    if (imgThumb.src.startsWith("blob:")) URL.revokeObjectURL(imgThumb.src);
    modal.classList.remove("on");
    document.removeEventListener("keydown", onEsc);
  };
  const onEsc = e => { if (e.key === "Escape") close(); };
  if (modal._onEsc) document.removeEventListener("keydown", modal._onEsc);  // FE-004: 재호출 시 이전 onEsc 누적 방지
  modal._onEsc = onEsc;
  document.addEventListener("keydown", onEsc);
  modal.onclick = e => { if (e.target === modal) close(); };
  modal.querySelector(".pmx").onclick = close;
}

// ── auth intent 재개 (FE-AUTH-01 §D) ───────────────────────────────────────
// 로그인 후 returnTo로 복귀 시 저장된 action을 자동 재개(찜 토글 · 세트 담기만).
document.addEventListener("DOMContentLoaded", async () => {
  const raw = sessionStorage.getItem('auth-intent');
  if (!raw) return;
  try {
    const intent = JSON.parse(raw);
    await window.authReady();
    if (!window.isLoggedIn() || !intent.action) return;
    // returnTo가 현재 페이지와 일치할 때만 재개(다른 페이지 intent 오염 방지)
    if (intent.returnTo) { const u = new URL(intent.returnTo, location.href); if (u.pathname !== location.pathname || u.search !== location.search) return; }  // M-273: search 포함 비교
    sessionStorage.removeItem('auth-intent');
    if (intent.action === 'toggleWish' && intent.params) {
      const added = _execToggleWish(intent.params);
      _paintWishBtn(intent.params.key, added);
      // FE-178: account.html 외 페이지(category 등)엔 onWishChange가 없어 _execToggleWish가 로컬에만 저장된다.
      //   로그인 직후 복귀라 사용자가 account.html을 들르기 전엔 원격 유실. 공용 모듈로 remote merge→save 1회 실행.
      //   (onWishChange가 이미 있으면 account.html이 처리하므로 건너뜀)
      if (typeof window.onWishChange !== "function") {
        try {
          const m = await import("./supabaseClient.js?v=0cfa00cd");
          const remote = await m.loadRemoteWishlist();
          if (remote !== null) {
            const merged = m.mergeWishlists(getWish(), remote);  // 로컬 우선 병합(원격 항목 보존)
            setWish(merged);
            await m.saveRemoteWishlist(merged);
          }
        } catch (_) { /* 원격 실패는 비파괴 — 로컬 찜은 유지, 다음 account.html 방문 시 병합 */ }
      }
    } else if (intent.action === 'openSetModal' && intent.params) {
      openSetModal(intent.params);
    }
    // openReviewForm: 재개 없음(spec §3-3). 사용자가 직접 버튼 재클릭.
  } catch (_) { sessionStorage.removeItem('auth-intent'); }
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("comm-best-list")) renderCommunity();

  // 공유 세트 URL 처리 (?view-set=BASE64) — account.html에서만 동작
  // (H-33: 가드가 존재하지 않는 'acc-section'을 찾아 분기 진입 자체가 안 되던 dead code 수정)
  const vsParam = new URLSearchParams(location.search).get("view-set");
  if (vsParam && document.getElementById("auth-section")) {
    try {
      const vsFixed = vsParam.replace(/-/g, '+').replace(/_/g, '/');
      // H-78: deprecated escape 대신 TextDecoder로 base64→UTF-8 디코드(한글·이모지 안전). 기존 공유 URL과 호환.
      const s = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(vsFixed), c => c.charCodeAt(0))));
      // FE-108: 신뢰 불가 공유 페이로드의 숫자 필드를 신뢰 경계에서 강제 변환·정규화.
      //   weight_g/p/qty/cap를 검증 없이 렌더하면 문자열 HTML이 innerHTML에 삽입돼 XSS(반사형+import 후 저장형).
      // FE-109: 조작된 링크의 대량 아이템 렌더·localStorage 적재(프리즈/쿼터 DoS) 방지 — 아이템 수 상한.
      if (Array.isArray(s.items) && s.items.length > 50) s.items = s.items.slice(0, 50);
      const _vsNum = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
      if (Array.isArray(s.items)) s.items.forEach(it => {
        it.weight_g = _vsNum(it.weight_g, null);
        it.p   = _vsNum(it.p, null);
        it.qty = _vsNum(it.qty, 1) || 1;
        it.cap = _vsNum(it.cap, null);
      });
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
        <button type="button" class="achip" id="vs-import-btn" style="width:100%;justify-content:center">내 세트에 추가</button>
      </div>`;
      document.body.appendChild(modal);
      // L-76: 공유 세트 열람 시 배경 개인 데이터 섹션 숨김
      const hiddenSections = ["wish-section","sets-section","logs-section","settings-section","profile-section"].map(id => document.getElementById(id)).filter(Boolean);
      hiddenSections.forEach(el => { el._vsDisplay = el.style.display; el.style.display = "none"; });
      const _vsEsc = e => { if (e.key === "Escape") { closeVs(); return; } _trapTab(e, modal); };   // L-356: Tab 포커스 트랩
      const closeVs = () => {
        document.removeEventListener("keydown", _vsEsc);
        modal.remove();
        hiddenSections.forEach(el => { el.style.display = el._vsDisplay ?? ""; });
        history.replaceState(null, "", location.pathname);
      };
      document.addEventListener("keydown", _vsEsc);
      modal.onclick = e => { if (e.target === modal) closeVs(); };
      modal.querySelector(".pmx").onclick = closeVs;
      modal.querySelector("#vs-import-btn").onclick = async function() {
        // M-346/L-247: 중복 import 방지 — 버튼 즉시 비활성화 + 제목+아이템 수 지문 비교
        this.disabled = true;
        await window.authReady();  // M-286: auth 완료 후 _accUser 사용
        const arr = getSets();
        const fingerprint = `${s.name || ""}|${(s.items || []).length}|${(s.items || []).map(x => `${x.b}${x.m}`).join(",")}`;
        const isDup = arr.some(x => `${x.title || x.name || ""}|${(x.items || []).length}|${(x.items || []).map(i => `${i.b}${i.m}`).join(",")}` === fingerprint);
        if (isDup) { showToast("이미 동일한 세트가 있어요."); closeVs(); return; }  // M-539: alert() → showToast() (iOS Safari PWA 차단 방지)
        const newSet = { id: Date.now().toString(36), title: s.name || "공유 세트", type: (SET_TYPES[s.type] ? s.type : DEFAULT_SET_TYPE), style: "공유", items: (s.items || []).map(x => ({ b: x.b || "", m: x.m || "", qty: x.qty || 1, weight_g: x.weight_g ?? null, cap: x.cap ?? null, img: x.img ?? null, p: x.p ?? null, s: x.s || "", pcode: x.pcode || wishKey(x.b || "", x.m || "", x.cap ?? null), coupang_url: safeHttps(x.coupang_url || "") })) };  // L-432: coupang_url https만 허용. FE-110: type 복원(화이트리스트 검증 — 조작값은 DEFAULT)
        newSet.completeness = setCompletion(newSet).pct;   // H-146: 총 아이템 수가 아닌 실제 완성도 pct(0~100) 저장
        arr.push(newSet); saveSets(arr);
        // L-114: 로그인 상태면 즉시 Supabase 동기화
        if (window._accUser?.id) {
          import("./supabaseClient.js?v=0cfa00cd").then(async ({ upsertGearSet }) => {
            const id = await upsertGearSet(newSet, window._accUser.id);
            if (id) { newSet.remoteId = id; const all = getSets(); const idx = all.findIndex(x => x.id === newSet.id); if (idx >= 0) { all[idx].remoteId = id; saveSets(all); } }
          }).catch(() => {});
        }
        closeVs();
        showToast(window._accUser ? "세트가 추가됐어요! 내 세트에서 확인하세요." : "세트가 추가됐어요! 로그인 후 내 세트에서 확인하세요.");  // M-452: iOS Safari는 history.replaceState 후 alert() 차단 → showToast로 교체
      };
    } catch {
      // M-497/M-508: atob/JSON.parse 실패 시 숨겨진 섹션 복원
      ["wish-section","sets-section","logs-section","settings-section","profile-section"].forEach(id => {
        const el = document.getElementById(id); if (el && el._vsDisplay !== undefined) el.style.display = el._vsDisplay ?? "";
      });
      history.replaceState(null, "", location.pathname);
    }
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
