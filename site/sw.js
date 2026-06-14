/* 장비의 숲 — 서비스워커 (오프라인 + 빠른 로딩)
   CACHE 이름의 __BUILD__는 stamp_version.py가 app.js+style.css 해시로 자동 치환.
   → 내용이 바뀌면 캐시명이 바뀌어 옛 캐시가 폐기된다(구버전 잔류 방지). */
const CACHE = "camping-db627d9f";

// 앱 셸 — 버전쿼리 없는 정적 진입점들(버전 붙은 app.js/style.css는 런타임 캐싱이 잡음)
const SHELL = [
  "./", "index.html", "category.html", "brand.html", "recommend.html",
  "account.html",   // L-329/434: community.html은 아카이브(COMMUNITY_ENABLED=false) → 프리캐시 제외(필요 시 런타임 캐싱)
  "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "icon-maskable-512.png", "apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // L-268: SHELL 프리캐시 성공 시에만 skipWaiting — 실패 시 빈 캐시로 활성화 방지
    let shellOk = true;
    await c.addAll(SHELL).catch(err => { console.warn("[SW] SHELL precache 실패:", err); shellOk = false; });
    // 오프라인서 전 카테고리 탐색 가능하게 데이터 전체 precache
    try {
      const m = await (await fetch("data/manifest.json", { cache: "no-cache" })).json();
      // L-145: data/search.json은 앱이 ?v= URL로 요청하므로 프리캐시에서 제외(캐시키 불일치)
      const urls = ["data/manifest.json",
        ...m.categories.map((x) => `data/${x.slug}.json`)];
      await c.addAll(urls).catch(() => {});
    } catch (e) { /* 데이터 precache 실패해도 셸은 동작 */ }
    if (shellOk) self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 외부(쿠팡 등)는 건드리지 않음

  // HTML 네비게이션: 네트워크 우선(최신 우선) → 실패 시 캐시 → 최후 index
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        // 리다이렉트된 응답은 캐싱 금지 (H-28). www→apex 301을 따라간 응답을 캐시에 넣으면
        // 이후 캐시 히트 시 redirect 꼬리표가 남아 ERR_TOO_MANY_REDIRECTS 루프가 발생한다.
        if (net.ok && !net.redirected) {
          const c = await caches.open(CACHE); c.put(req, net.clone());
        }
        return net;
      } catch (err) {
        // 캐시 폴백 — 쿼리스트링 무시(H-19): category.html?cat=X 가 캐시된 category.html 에 매치되도록.
        // (ignoreSearch 없으면 ?cat= URL이 캐시 miss → index.html 폴백 → 엉뚱한 홈 화면 노출)
        return (await caches.match(req, { ignoreSearch: true })) ||
          (await caches.match("index.html")) ||
          new Response("오프라인입니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // 자산·데이터: 캐시 우선 + 백그라운드 갱신(stale-while-revalidate)
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const fetching = fetch(req).then((net) => {
      // 리다이렉트 응답은 캐싱 금지 (H-28) — 캐시 히트 시 redirect 루프 방지
      if (net && net.ok && !net.redirected) {
        const clone = net.clone();
        // H-85: 캐시 쓰기 Promise를 waitUntil로 잡아 SW 조기 종료로 인한 갱신 누락 방지
        e.waitUntil(caches.open(CACHE).then((c) => c.put(req, clone)));
      }
      return net;
    }).catch((err) => {
      // H-85: 백그라운드 갱신 실패를 무음 폐기하지 않고 기록 — 반복 실패 시 구버전 캐시 고착 진단 가능
      console.warn("[SW] 백그라운드 갱신 실패:", req.url, err);
      return null;
    });
    return cached || (await fetching) || new Response("", { status: 504 });
  })());
});

// Web Push 수신 → 알림 표시
self.addEventListener("push", (e) => {
  let data = { title: "장비의 숲", body: "새 알림이 있어요", icon: "/icon-192.png", data: { url: "/" } };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: "/icon-192.png",
    tag: data.tag || "gear-forest-push",   // L-259: 동종 알림 교체(중복 누적 방지)
    renotify: !!data.tag,                  // tag가 있으면 소리/진동 재발생
    data: data.data,
  }));
});

// 알림 클릭 → 해당 URL 열기 (L-131/L-152: URL 일치 탭 우선 탐색 + navigate)
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const raw = e.notification.data?.url || "/";
  // H-141: 악의적 푸시가 `{"url":"javascript:..."}`를 보내면 openWindow가 스크립트를 실행할 수 있다(XSS).
  //   동일 출처 http(s) URL만 허용하고, javascript:/data:/타출처 등은 루트로 폴백.
  let absUrl;
  try {
    const u = new URL(raw, location.origin);
    absUrl = (u.origin === location.origin && (u.protocol === "https:" || u.protocol === "http:"))
      ? u.href : location.origin + "/";
  } catch (_) {
    absUrl = location.origin + "/";
  }
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const exact = list.find((c) => c.url === absUrl);
    if (exact) return exact.focus();
    const any = list.find((c) => c.url.startsWith(location.origin));
    if (any) return any.focus().then(() => any.navigate ? any.navigate(absUrl) : null).catch(() => clients.openWindow(absUrl));
    return clients.openWindow(absUrl);
  }));
});
