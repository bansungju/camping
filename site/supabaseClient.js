// Supabase 클라이언트 싱글톤 — createClient() 는 이 파일에서만 호출
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://kavfzsdimsrhteohmirc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_5_z5YGgiq4Fc1LeXHTZdGA_6JVd6ITY'
const SITE_BASE   = 'https://gear-forest.com'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Auth ──────────────────────────────────────────────────────────────────
let authSubscription = null

export async function initAuth(onStateChange) {
  if (authSubscription) { authSubscription.unsubscribe(); authSubscription = null }
  const { data: { session } } = await supabase.auth.getSession()
  if (onStateChange) onStateChange(session?.user ?? null, 'INITIAL')
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (onStateChange) onStateChange(session?.user ?? null, event)
  })
  authSubscription = subscription
}

export async function signInWithOAuth(provider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${SITE_BASE}/auth-callback.html` }
  })
}

export async function signOut() {
  return supabase.auth.signOut()
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

export async function saveRemoteWishlist(items) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'unauthorized' } }
  return supabase.from('wishlists')
    .upsert({ user_id: user.id, items }, { onConflict: 'user_id' })
}

// 로컬·원격 찜을 key 기준 합집합(원격 항목의 가격/이미지 등은 로컬 최신값 우선)
export function mergeWishlists(local = [], remote = []) {
  const byKey = new Map()
  for (const it of remote) if (it && it.key) byKey.set(it.key, it)
  for (const it of local)  if (it && it.key) byKey.set(it.key, it)  // 로컬 우선
  return Array.from(byKey.values()).slice(0, 500)
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

// ── 전역 에러 핸들러 (네트워크 실패 등) ───────────────────────────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason)
})
