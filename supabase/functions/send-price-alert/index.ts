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

function buildPayload(ev: AlertEvent): string {
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
  return JSON.stringify({
    title,
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: ev.url || "/" },
  });
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

      // 3. 디바이스 구독 조회
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth_key")
        .eq("user_id", userId);
      if (!subs?.length) continue;

      // 4. 전송 (+ 만료 구독 정리)
      let delivered = false;
      await Promise.allSettled(
        subs.map(async (s) => {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
              payload,
            );
            delivered = true;
          } catch (err) {
            const code = (err as { statusCode?: number })?.statusCode;
            if (code === 404 || code === 410) {
              // 만료/해지된 구독 제거
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
