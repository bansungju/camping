// Supabase Edge Function: send-push-notification
// Triggered by DB Webhook on comments INSERT
// Sends Web Push to the post author if they have a push subscription

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="https://esm.sh/v135/web-push@3.6.6/src/index.d.ts"
import webpush from "https://esm.sh/web-push@3.6.6";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:bangsungju@gmail.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body: { record?: { post_id?: string; user_id?: string; content?: string } };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const comment = body.record;
  if (!comment?.post_id || !comment?.user_id) {
    return new Response("Missing fields", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 포스트 작성자 조회
  const { data: post } = await supabase
    .from("posts")
    .select("user_id, title")
    .eq("id", comment.post_id)
    .single();

  if (!post || post.user_id === comment.user_id) {
    // 포스트 없음 또는 자기 댓글
    return new Response("Skip", { status: 200 });
  }

  // 작성자의 Push 구독 조회
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", post.user_id);

  if (!subs?.length) return new Response("No subscriptions", { status: 200 });

  const payload = JSON.stringify({
    title: "새 댓글이 달렸어요",
    body: comment.content?.slice(0, 80) || "캠핑 로그에 댓글이 달렸습니다",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: `/community.html#post-${comment.post_id}` },
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } },
        payload,
      )
    ),
  );

  return new Response("OK", { status: 200 });
});
