// delete-account — PIPA 탈퇴권 처리 Edge Function (설계 DESIGN-social.md §L2-20)
//
// 동작:
//   1. 호출자 JWT 검증 → 본인 user_id 확정
//   2. delete_account_atomic RPC(service_role 전용): profiles.deleted_at + posts 소프트삭제
//      → 리뷰·댓글 내용은 보존하고 user_id는 ON DELETE SET NULL로 익명화됨
//   3. auth.users 물리 삭제(admin API) → 재로그인 불가, 30일 쿨다운은 handle_new_user가 강제
//
// 배포(서버/노트북에서 supabase CLI 링크 후):
//   supabase functions deploy delete-account --no-verify-jwt=false
// 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)는 Edge Function 런타임이 자동 주입.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// apex가 canonical(SITE_BASE=https://gear-forest.com). www도 함께 허용해 리다이렉트/구버전 대응.
const ALLOWED_ORIGINS = new Set([
  'https://gear-forest.com',
  'https://www.gear-forest.com',
])

function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://gear-forest.com'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(body: unknown, cors: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  const cors = corsFor(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, cors, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) return json({ error: 'unauthorized' }, cors, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // 1. 호출자 본인 확인 (JWT로 user 조회)
  const userClient = createClient(url, serviceKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser(jwt)
  if (userErr || !user) return json({ error: 'unauthorized' }, cors, 401)

  // 2. service_role로 원자적 소프트삭제(프로필 익명화 + 게시글 소프트삭제)
  const admin = createClient(url, serviceKey)
  const { error: rpcErr } = await admin.rpc('delete_account_atomic', { p_user_id: user.id })
  if (rpcErr) {
    console.error('delete_account_atomic', rpcErr)
    return json({ error: 'delete_failed', detail: rpcErr.message }, cors, 500)
  }

  // 3. auth.users 물리 삭제 (재로그인 차단; 쿨다운은 handle_new_user 트리거가 enforce)
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id)
  if (delErr) {
    // 프로필은 이미 익명화됨. auth 삭제 실패는 로깅 후 부분성공으로 보고.
    console.error('admin.deleteUser', delErr)
    return json({ ok: true, auth_deleted: false, detail: delErr.message }, cors, 200)
  }

  return json({ ok: true, auth_deleted: true }, cors)
})
