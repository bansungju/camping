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
  'account_deleted_cooldown':      '탈퇴 후 30일 이내에는 재가입할 수 없습니다',
  'report_target_deleted':         '이미 삭제된 게시물입니다',
  'unauthorized':                  '권한이 없습니다',
}

export function getErrorMessage(error) {
  if (!error) return null
  const msg = error.message ?? ''
  for (const [key, label] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return label
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요'
}

// ── 기어 세트 동기화 ─────────────────────────────────────────────────────
export async function loadRemoteGearSets() {
  const { data, error } = await supabase
    .from('gear_sets')
    .select('id, title, style, items, completeness, created_at, updated_at')
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

// ── 전역 에러 핸들러 (네트워크 실패 등) ───────────────────────────────────
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason)
})
