/* 캠핑기어 정직비교 — 서비스워커 (오프라인 + 빠른 로딩)
   CACHE 이름의 __BUILD__는 stamp_version.py가 app.js+style.css 해시로 자동 치환.
   → 내용이 바뀌면 캐시명이 바뀌어 옛 캐시가 폐기된다(구버전 잔류 방지). */
const CACHE = "camping-2e9227fe";

// 앱 셸 — 버전쿼리 없는 정적 진입점들(버전 붙은 app.js/style.css는 런타임 캐싱이 잡음)
const SHELL = [
  "./", "index.html", "category.html", "brand.html", "recommend.html",
  "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "icon-maskable-512.png", "apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL).catch(() => {});
    // 오프라인서 전 카테고리 탐색 가능하게 데이터 전체 precache
    try {
      const m = await (await fetch("data/manifest.json", { cache: "no-cache" })).json();
      const urls = ["data/manifest.json", "data/search.json",
        ...m.categories.map((x) => `data/${x.slug}.json`)];
      await c.addAll(urls).catch(() => {});
    } catch (e) { /* 데이터 precache 실패해도 셸은 동작 */ }
    self.skipWaiting();
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
        const c = await caches.open(CACHE); c.put(req, net.clone());
        return net;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match("index.html")) ||
          new Response("오프라인입니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // 자산·데이터: 캐시 우선 + 백그라운드 갱신(stale-while-revalidate)
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const fetching = fetch(req).then((net) => {
      if (net && net.ok) caches.open(CACHE).then((c) => c.put(req, net.clone()));
      return net;
    }).catch(() => null);
    return cached || (await fetching) || new Response("", { status: 504 });
  })());
});
