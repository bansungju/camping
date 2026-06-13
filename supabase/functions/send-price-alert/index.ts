// Supabase Edge Function: send-price-alert
// 파이프라인(가격 하락/재입고 감지)이 X-Alert-Secret 헤더로 호출.
// 찜(wishlists.items)에 해당 상품 key를 가진 사용자에게 Web Push 전송.
// 설계: APP-PUSH-PRICE-ALERT-PLAN.md
//
// 배포:  supabase functions deploy send-price-alert
// 환경변수(secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (기존 공유),
//                    ALERT_SECRET (파이프라인 호출 인증용 — 새로 발급)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="https://esm.sh/v135/web-push@3.6.6/src/index.d.ts"
import webpush from "https://esm.sh/web-push@3.6.6";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:bangsungju@gmail.com";
const ALERT_SECRET = Deno.env.get("ALERT_SECRET")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const DEDUP_HOURS = 24; // 동일 사용자·상품 재전송 최소 간격

interface AlertEvent {
  key: string;            // 찜 key = '브랜드|모델|인원'
  name?: string;          // 표시용 상품명
  category?: string;
  old_price?: number;
  new_price?: number;
  url?: string;           // 상품 상세 경로 (예: /item/auto-tent/item-0.html)
  kind: "drop" | "restock";
}

function fmtKRW(n?: number): string {
  return typeof n === "number" ? n.toLocaleString("ko-KR") + "원" : "";
}

function buildContent(ev: AlertEvent): { title: string; body: string; url: string } {
  const name = ev.name || "찜한 상품";
  let title: string, body: string;
  if (ev.kind === "restock") {
    title = `${name} 다시 판매중이에요`;
    body = ev.new_price ? `현재가 ${fmtKRW(ev.new_price)}` : "재입고되었습니다";
  } else {
    const pct =
      ev.old_price && ev.new_price && ev.old_price > 0
        ? Math.round((1 - ev.new_price / ev.old_price) * 100)
        : null;
    title = pct ? `${name} 가격이 ${pct}% 내렸어요` : `${name} 가격이 내렸어요`;
    body =
      ev.old_price && ev.new_price
        ? `${fmtKRW(ev.old_price)} → ${fmtKRW(ev.new_price)}`
        : "가격이 하락했습니다";
  }
  return { title, body, url: ev.url || "/" };
}

// 웹 Web Push 페이로드(JSON 문자열)
function buildPayload(ev: AlertEvent): string {
  const c = buildContent(ev);
  return JSON.stringify({
    title: c.title, body: c.body,
    icon: "/icon-192.png", badge: "/icon-192.png",
    data: { url: c.url },
  });
}

// ── APNs (iOS 네이티브 푸시) ────────────────────────────────────────────────
// env: APNS_KEY_ID·APNS_TEAM_ID·APNS_P8(.p8 내용)·APNS_BUNDLE_ID·APNS_PRODUCTION
const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID") || "";
const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID") || "";
const APNS_P8 = Deno.env.get("APNS_P8") || "";
const APNS_BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID") || "com.gearforest.app";
const APNS_HOST = Deno.env.get("APNS_PRODUCTION") === "true"
  ? "https://api.push.apple.com"
  : "https://api.sandbox.push.apple.com";
const apnsEnabled = !!(APNS_KEY_ID && APNS_TEAM_ID && APNS_P8);

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let _apnsJwt: { token: string; iat: number } | null = null;
async function apnsJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (_apnsJwt && now - _apnsJwt.iat < 3000) return _apnsJwt.token; // <55분 재사용
  const pem = APNS_P8.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );
  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ alg: "ES256", kid: APNS_KEY_ID })).buffer as ArrayBuffer);
  const claims = b64url(enc.encode(JSON.stringify({ iss: APNS_TEAM_ID, iat: now })).buffer as ArrayBuffer);
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${header}.${claims}`),
  );
  const token = `${header}.${claims}.${b64url(sig)}`;
  _apnsJwt = { token, iat: now };
  return token;
}

// 반환: HTTP 상태(200=성공, 410=만료 토큰). 미설정/실패 시 0.
async function sendAPNs(deviceToken: string, c: { title: string; body: string; url: string }): Promise<number> {
  if (!apnsEnabled) return 0;
  try {
    const jwt = await apnsJwt();
    const res = await fetch(`${APNS_HOST}/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": APNS_BUNDLE_ID,
        "apns-push-type": "alert",
      },
      body: JSON.stringify({
        aps: { alert: { title: c.title, body: c.body }, sound: "default" },
        url: c.url,
      }),
    });
    return res.status;
  } catch (_) {
    return 0;
  }
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  // 인증: 공유 시크릿 헤더
  if (req.headers.get("x-alert-secret") !== ALERT_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { events?: AlertEvent[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  const events = (body.events || []).filter((e) => e?.key && e?.kind);
  if (!events.length) return new Response("No events", { status: 200 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const since = new Date(Date.now() - DEDUP_HOURS * 3600 * 1000).toISOString();

  let sent = 0,
    skipped = 0;

  for (const ev of events) {
    // 1. 이 상품 key를 찜한 사용자 조회 (jsonb 배열 포함 검색)
    const { data: watchers, error: wErr } = await supabase
      .from("wishlists")
      .select("user_id")
      .contains("items", [{ key: ev.key }]);
    if (wErr || !watchers?.length) continue;

    const payload = buildPayload(ev);
    const content = buildContent(ev);

    for (const w of watchers) {
      const userId = w.user_id as string;

      // 2. 중복 차단 — 최근 DEDUP_HOURS 내 동일 사용자·상품·종류 전송 여부
      const { count } = await supabase
        .from("price_alert_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("item_key", ev.key)
        .eq("kind", ev.kind)
        .gte("sent_at", since);
      if (count && count > 0) {
        skipped++;
        continue;
      }

      // 3. 디바이스 구독 조회 (웹 Web Push + 네이티브 토큰)
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key, platform, native_token")
        .eq("user_id", userId);
      if (!subs?.length) continue;

      // 4. 전송 — platform 분기 (web=Web Push / ios=APNs) (+ 만료 토큰 정리)
      let delivered = false;
      await Promise.allSettled(
        subs.map(async (s) => {
          // 네이티브(APNs)
          if (s.native_token && (s.platform === "ios" || s.platform === "android")) {
            const status = await sendAPNs(s.native_token, content); // 현재 iOS만 구현(android는 추후 FCM)
            if (status === 200) delivered = true;
            else if (status === 410) {
              await supabase.from("push_subscriptions").delete().eq("native_token", s.native_token);
            }
            return;
          }
          // 웹(Web Push)
          if (!s.endpoint) return;
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
              payload,
            );
            delivered = true;
          } catch (err) {
            const code = (err as { statusCode?: number })?.statusCode;
            if (code === 404 || code === 410) {
              await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
            }
          }
        }),
      );

      // 5. 전송 성공 시에만 로그 기록(다음 중복 차단의 기준)
      if (delivered) {
        await supabase.from("price_alert_log").insert({
          user_id: userId,
          item_key: ev.key,
          kind: ev.kind,
          price_krw: ev.new_price ?? null,
        });
        sent++;
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, skipped }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
