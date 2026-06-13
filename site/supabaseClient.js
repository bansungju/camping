// Supabase 클라이언트 싱글톤 — createClient() 는 이 파일에서만 호출
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://kavfzsdimsrhteohmirc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_5_z5YGgiq4Fc1LeXHTZdGA_6JVd6ITY'
const SITE_BASE   = 'https://gear-forest.com'

// detectSessionInUrl:false — auth-callback.html이 exchangeCodeForSession을 직접 호출하므로
// 자동 감지를 켜두면 클라이언트 생성 시 ?code=를 먼저 자동 교환하며 code verifier를
// storage에서 소비·삭제한다. 그러면 우리 수동 교환이 "PKCE code verifier not found"로 실패한다.
// 수동 교환 1회만 일어나도록 자동 감지를 끈다(PKCE SPA 표준 패턴).
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true }
})

// ── Auth ──────────────────────────────────────────────────────────────────
let authSubscription = null

export async function initAuth(onStateChange) {
  if (authSubscription) { authSubscription.unsubscribe(); authSubscription = null }
  const { data: { session } } = await supabase.auth.getSession()
  if (onStateChange) onStateChange(session?.user ?? null, 'INITIAL')
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return   // M-132: 위에서 수동으로 'INITIAL' 이미 발화
    if (onStateChange) onStateChange(session?.user ?? null, event)
  })
  authSubscription = subscription
}

export async function signInWithOAuth(provider) {
  const isApp = !!(window.Capacitor?.isNativePlatform?.())
  if (isApp) {
    const { Browser } = await import('https://cdn.jsdelivr.net/npm/@capacitor/browser/dist/esm/index.js')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'com.gearforest.app://auth-callback',
        skipBrowserRedirect: true
      }
    })
    if (error || !data?.url) return { data, error }
    await Browser.open({ url: data.url })
    return { data, error: null }
  }
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${SITE_BASE}/auth-callback.html` }
  })
}

// B-2: iOS 네이티브 Sign in with Apple — @capacitor-community/apple-sign-in → Supabase nonce 연동
// Apple Console 설정(Services ID·Key) 완료 전에는 호출되지 않음(account.html 환경 분기로 제어)
export async function signInWithApple() {
  const { SignInWithApple } = await import('https://cdn.jsdelivr.net/npm/@capacitor-community/apple-sign-in/dist/esm/index.js')
  const { response } = await SignInWithApple.authorize({
    clientId: 'com.gearforest.app',
    redirectURI: 'com.gearforest.app://auth-callback',
    scopes: 'email name',
    state: crypto.randomUUID(),
    nonce: crypto.randomUUID(),
  })
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: response.identityToken,
    nonce: response.nonce,
  })
  return { error }
}

// ── B-1/G1: 네이티브 푸시(APNs/FCM) 토큰 ────────────────────────────────────
// iOS 앱은 Web Push가 안 되므로 디바이스 토큰을 push_subscriptions에 저장(platform 구분).
// 발송은 Edge Function send-price-alert가 platform별 분기(web=Web Push / ios=APNs).
export async function savePushToken(token, platform) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !token) return { error: { message: 'no user/token' } }
  return supabase.from('push_subscriptions').upsert(
    { user_id: user.id, native_token: token, platform },
    { onConflict: 'user_id,native_token' }
  )
}

// 네이티브 앱에서 푸시 권한 요청 + 토큰 등록. 웹/미설치 환경에선 조용히 no-op.
// (Push Notifications capability·plugin 동기화가 안 됐으면 catch로 무시)
export async function registerNativePush() {
  if (!window.Capacitor?.isNativePlatform?.()) return
  try {
    const { PushNotifications } = await import('https://cdn.jsdelivr.net/npm/@capacitor/push-notifications/dist/esm/index.js')
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return
    PushNotifications.addListener('registration', (t) => {
      savePushToken(t.value, window.Capacitor.getPlatform?.() || 'ios')
    })
    await PushNotifications.register()
  } catch (_) { /* 플러그인 미동기화 등 — 무시 */ }
}

export async function signOut() {
  localStorage.removeItem("wish");
  localStorage.removeItem("sets");
  localStorage.removeItem("gear_sets");  // M-430: gear_sets 키도 정리
  return supabase.auth.signOut()
}

// 계정 삭제(PIPA 탈퇴권) — delete-account Edge Function 호출.
// 본인 JWT는 functions.invoke가 자동 첨부. 성공 시 프로필 익명화 + auth 물리삭제(30일 쿨다운).
export async function deleteAccount() {
  return supabase.functions.invoke('delete-account', { method: 'POST' })
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Profile (닉네임은 profiles 테이블이 단일 진실. auth 메타데이터의 실명 사용 금지) ──
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, role, created_at')
    .eq('id', user.id)
    .maybeSingle()
  if (error) { console.error('getProfile', error); return null }
  // 트리거(handle_new_user)가 만든 행이 복제 지연 등으로 아직 없으면 null
  return data ? { ...data, email: user.email } : { id: user.id, nickname: null, avatar_url: user.user_metadata?.avatar_url ?? null, email: user.email }
}

export const NICKNAME_RE = /^[가-힣a-zA-Z0-9_]{2,20}$/

// 닉네임 사용 가능 여부(중복 검사). true=사용가능
export async function isNicknameAvailable(nickname) {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('nickname', nickname)
  if (error) { console.error('isNicknameAvailable', error); return null }
  return count === 0
}

// 닉네임 설정/변경. 형식·금지어·중복(23505)·쿨다운은 DB 트리거가 최종 검증.
export async function setNickname(nickname) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  return supabase.from('profiles').update({ nickname }).eq('id', user.id)
}

// ── 찜(위시리스트) 동기화 ──────────────────────────────────────────────────
export async function loadRemoteWishlist() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('wishlists').select('items').eq('user_id', user.id).maybeSingle()
  if (error) { console.error('loadRemoteWishlist', error); return null }
  return Array.isArray(data?.items) ? data.items : []
}

// H-59: 동시/연속 호출 시 원격 upsert가 네트워크 순서 뒤바뀌어 이전 상태가 최신을 덮어쓰는 race 방지.
// 쓰기를 단일 체인으로 직렬화(FIFO)하고, 대기 중에는 최신 payload만 남겨(coalesce) 마지막 상태가 항상 이긴다.
// (payload는 항상 localStorage 전체 배열의 누적 스냅샷이므로 마지막 write가 곧 정답.)
let _wishWriteChain = Promise.resolve()
let _wishPending = undefined
export async function saveRemoteWishlist(items) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  _wishPending = items   // 대기 중 이전 payload는 폐기 — 누적 스냅샷이라 최신만 쓰면 충분
  _wishWriteChain = _wishWriteChain.then(async () => {
    if (_wishPending === undefined) return            // 더 최신 호출이 이미 flush함
    const payload = _wishPending
    _wishPending = undefined
    const res = await supabase.from('wishlists')
      .upsert({ user_id: user.id, items: payload }, { onConflict: 'user_id' })
    if (res?.error) console.error('saveRemoteWishlist', res.error)
    return res
  }).catch(e => { console.error('saveRemoteWishlist', e) })
  return _wishWriteChain
}

// 로컬·원격 찜을 key 기준 합집합(원격 항목의 가격/이미지 등은 로컬 최신값 우선)
export function mergeWishlists(local = [], remote = []) {
  const byKey = new Map()
  for (const it of remote) if (it && it.key) byKey.set(it.key, it)
  for (const it of local)  if (it && it.key) byKey.set(it.key, it)  // 로컬 우선
  return Array.from(byKey.values()).slice(0, 500)
}

// ── 커뮤니티: posts / comments / likes ─────────────────────────────────────
// 닉네임/아바타는 profiles 조인(공개 RLS). image_urls 등은 `*`로 받아 컬럼
// 부재(마이그레이션 005 미적용) 시에도 글 목록이 깨지지 않게 한다.
// posts↔profiles 임베드는 경로가 둘(user_id FK, likes 다대다)이라 FK를 명시해야 함(PGRST201 방지)
const POST_SELECT = '*, author:profiles!posts_user_id_fkey(nickname, avatar_url)'

export async function listPosts({ limit = 20, before = null } = {}) {
  let q = supabase.from('posts').select(POST_SELECT)
    .order('created_at', { ascending: false }).limit(limit)
  if (before) q = q.lt('created_at', before)
  const { data, error } = await q
  if (error) { console.error('listPosts', error); return { error } }
  return { data: data ?? [] }
}

export async function getPost(id) {
  const { data, error } = await supabase.from('posts').select(POST_SELECT)
    .eq('id', id).maybeSingle()
  if (error) { console.error('getPost', error); return { error } }
  return { data }
}

export async function createPost({ title, body, image_urls, product_pcodes }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  const row = { user_id: user.id, title, body }
  if (Array.isArray(image_urls) && image_urls.length) row.image_urls = image_urls
  if (Array.isArray(product_pcodes) && product_pcodes.length) row.product_pcodes = product_pcodes
  return supabase.from('posts').insert(row).select(POST_SELECT).maybeSingle()
}

export async function deletePost(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  // 소프트 삭제(본인 글만 — RLS update_own이 강제)
  return supabase.from('posts').update({ deleted_at: new Date().toISOString() }).eq('id', id)
}

export async function listComments(postId) {
  const { data, error } = await supabase.from('comments')
    .select('*, author:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .eq('post_id', postId).order('created_at', { ascending: true })
  if (error) { console.error('listComments', error); return { error } }
  return { data: data ?? [] }
}

export async function createComment({ post_id, body, parent_id = null }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  return supabase.from('comments')
    .insert({ post_id, user_id: user.id, body, parent_id })
    .select('*, author:profiles!comments_user_id_fkey(nickname, avatar_url)').maybeSingle()
}

// 본인 댓글 수정(body). RLS comments_update_own(USING deleted_at IS NULL) + user_id 가드.
export async function editComment(id, body) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  return supabase.from('comments')
    .update({ body }).eq('id', id).eq('user_id', user.id)
    .select('*, author:profiles!comments_user_id_fkey(nickname, avatar_url)').maybeSingle()
}

// 본인 댓글 소프트삭제(deleted_at). 트리거 trg_comment_count(015)가 카운트 감소.
export async function deleteComment(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  const { error } = await supabase.from('comments')
    .update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id)
  return error ? { error } : { ok: true }
}

// 현재 사용자가 좋아요한 post id 집합(보이는 게시글 한정). likes RLS: 본인 것만 조회 가능.
export async function getMyLikes(postIds) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !postIds?.length) return new Set()
  const { data, error } = await supabase.from('likes')
    .select('post_id').eq('user_id', user.id).in('post_id', postIds)
  if (error) { console.error('getMyLikes', error); return new Set() }
  return new Set((data ?? []).map(r => r.post_id))
}

// 좋아요 토글. 반환: { liked } 또는 { error }
export async function toggleLike(postId, liked) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  if (liked) {
    const { error } = await supabase.from('likes').delete()
      .eq('post_id', postId).eq('user_id', user.id)
    return error ? { error } : { liked: false }
  }
  const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  return error ? { error } : { liked: true }
}

export async function reportContent({ target_type, target_id, reason }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  const { error } = await supabase.from('reports').insert({ reporter_id: user.id, target_type, target_id, reason })
  if (error?.code === '23505') return { error: { message: 'already_reported' } }
  return { error }
}

// FE-SOC-09: 내가 쓴 상품 후기(마이페이지 '내 로그'용). user_id로 필터.
// RLS reviews_select_public(hidden=false AND deleted_at IS NULL)로 읽기 허용 → 신규 마이그 불필요.
// image_urls 컬럼은 마이그 020 적용 전이면 없을 수 있어 우아하게 폴백(상품 상세 _fetchReviews와 동일 패턴).
export async function getMyReviews() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const cols = 'id, product_pcode, rating, body, created_at'
  let res = await supabase.from('reviews').select(cols + ', image_urls')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
  if (res.error && /image_urls/i.test(res.error.message || '')) {
    res = await supabase.from('reviews').select(cols)
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
  }
  if (res.error) { console.error('getMyReviews', res.error); return [] }
  return (res.data ?? []).map(r => ({ ...r, image_urls: Array.isArray(r.image_urls) ? r.image_urls : [] }))
}

// ── 사진 업로드(review-images 버킷 재사용. 경로: {user_id}/{uuid}.{ext}) ────
const IMG_BUCKET = 'review-images'
const MAX_IMG_BYTES = 5 * 1024 * 1024

export async function uploadImage(file) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  if (!file.type?.startsWith('image/')) return { error: { message: '이미지 파일만 업로드할 수 있습니다' } }
  if (file.size > MAX_IMG_BYTES) return { error: { message: '이미지는 5MB 이하만 가능합니다' } }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const uuid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))
  const path = `${user.id}/${uuid}.${ext}`
  const { error } = await supabase.storage.from(IMG_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) { console.error('uploadImage', error); return { error } }
  const { data } = supabase.storage.from(IMG_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

// M-134/L-111: orphan 이미지 정리 — paths 배열을 Storage에서 삭제
export async function removeUploadedImages(paths) {
  if (!paths || !paths.length) return
  await supabase.storage.from(IMG_BUCKET).remove(paths).catch(() => {})
}

// ── localStorage (incognito fallback) ────────────────────────────────────
export const safeLocalStorage = {
  getItem(key) {
    try { return localStorage.getItem(key) }
    catch { try { return sessionStorage.getItem(key) } catch { return null } }
  },
  setItem(key, value) {
    try { localStorage.setItem(key, value) }
    catch { try { sessionStorage.setItem(key, value) } catch {} }
  },
  removeItem(key) {
    try { localStorage.removeItem(key) } catch {}
    try { sessionStorage.removeItem(key) } catch {}
  }
}

// ── 에러 메시지 매핑 ──────────────────────────────────────────────────────
const ERROR_MAP = {
  'rate_limit_exceeded: review':   '잠시 후 다시 시도해주세요 (리뷰는 1분에 3건 제한)',
  'rate_limit_exceeded: comment':  '잠시 후 다시 시도해주세요 (댓글은 1분에 10건 제한)',
  'rate_limit_exceeded: like':     '잠시 후 다시 시도해주세요',
  'rate_limit_exceeded: post':     '잠시 후 다시 시도해주세요',
  'rate_limit_exceeded: export':   '데이터 내보내기는 하루 5회까지 가능합니다',
  'account_too_new':               '리뷰는 가입 후 24시간이 지나야 작성할 수 있습니다',
  'content_policy_violation':      '금지된 표현이 포함되어 있습니다',
  'nickname_policy_violation':     '사용할 수 없는 닉네임입니다',
  'nickname_format_invalid':       '닉네임은 2~20자 (한글/영문/숫자/_)만 사용 가능합니다',
  'nickname_cooldown':             '닉네임은 변경 후 30일이 지나야 다시 바꿀 수 있습니다',
  'account_deleted_cooldown':      '탈퇴 후 30일 이내에는 재가입할 수 없습니다',
  'report_target_deleted':         '이미 삭제된 게시물입니다',
  'unauthorized':                  '권한이 없습니다',
}

export function getErrorMessage(error) {
  if (!error) return null
  // Postgres unique violation(닉네임 중복 등)
  if (error.code === '23505') return '이미 사용 중인 닉네임입니다'
  const msg = error.message ?? ''
  for (const [key, label] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return label
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요'
}

// ── 기어 세트 동기화 ─────────────────────────────────────────────────────
export async function loadRemoteGearSets() {
  // L-136: getUser 가드 + 명시적 user_id 필터(RLS와 이중 보호)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('gear_sets')
    .select('id, title, style, items, completeness, created_at, updated_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return null
  return data || []
}

export async function upsertGearSet(set, userId) {
  const payload = {
    user_id: userId,
    title: set.title || '새 세트',
    style: set.style || null,
    items: set.items || [],
    completeness: set.items?.length || 0,
  }
  if (set.remoteId) {
    const { error } = await supabase.from('gear_sets').update(payload).eq('id', set.remoteId)
    return error ? null : set.remoteId
  }
  const { data, error } = await supabase.from('gear_sets').insert(payload).select('id').single()
  return error ? null : data?.id
}

export async function deleteRemoteGearSet(remoteId) {
  return supabase.from('gear_sets').update({ deleted_at: new Date().toISOString() }).eq('id', remoteId)
}

// ── 전역 에러 핸들러 (네트워크 실패 등) — 모듈 중복 로드 시 리스너 중복 방지 ──
if (!window._supaErrorHandlerRegistered) {
  window._supaErrorHandlerRegistered = true
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason)
  })
}
