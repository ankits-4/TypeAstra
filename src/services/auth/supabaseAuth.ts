export interface AuthUser {
  id: string
  email: string
  username: string
}

interface StoredSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
  user: AuthUser
}

const SESSION_KEY = 'typastra:auth-session'
const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const authEnabled = Boolean(url && anonKey)

// Refresh a bit before actual expiry so an in-flight request never races the clock.
const REFRESH_SKEW_MS = 60_000

function headers(token?: string) {
  return {
    apikey: anonKey ?? '',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function userFrom(data: any): AuthUser {
  return {
    id: data.id,
    email: data.email ?? '',
    username: data.user_metadata?.username || data.email?.split('@')[0] || 'TypAstra user',
  }
}

function persist(session: StoredSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export function loadStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

function sessionFromAuthResponse(data: any, fallbackUser?: AuthUser): StoredSession {
  const user = data.user ? userFrom(data.user) : fallbackUser
  if (!user) throw new Error('Sign-in response was missing user details.')
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    user,
  }
}

async function request(path: string, body: unknown, token?: string, method: 'POST' | 'PUT' = 'POST') {
  const response = await fetch(`${url}/auth/v1/${path}`, { method, headers: headers(token), body: JSON.stringify(body) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || 'Something went wrong. Please try again.')
  return data
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const data = await request('token?grant_type=password', { email, password })
  const session = sessionFromAuthResponse(data)
  persist(session)
  return session.user
}

export async function signUp(username: string, email: string, password: string): Promise<{ user: AuthUser; needsEmailConfirmation: boolean }> {
  const data = await request('signup', { email, password, data: { username } })
  const user = userFrom(data.user)
  if (data.access_token) persist(sessionFromAuthResponse(data, user))
  return { user, needsEmailConfirmation: !data.access_token }
}

export async function signOut() {
  const session = loadStoredSession()
  if (session) {
    try { await request('logout', {}, session.accessToken) } catch { /* Local cleanup still signs the user out here. */ }
  }
  persist(null)
}

// Called proactively before the access token expires, and reactively if a
// request ever comes back 401. Returns null (and clears the session) if the
// refresh token itself is no longer valid — the caller should treat that as
// a full sign-out.
export async function refreshSession(): Promise<AuthUser | null> {
  const current = loadStoredSession()
  if (!current?.refreshToken) return null
  try {
    const data = await request('token?grant_type=refresh_token', { refresh_token: current.refreshToken })
    const session = sessionFromAuthResponse(data, current.user)
    persist(session)
    return session.user
  } catch {
    persist(null)
    return null
  }
}

// Returns an access token guaranteed valid for at least REFRESH_SKEW_MS,
// refreshing first if the stored one is close to expiring.
export async function getFreshAccessToken(): Promise<string | null> {
  const session = loadStoredSession()
  if (!session) return null
  if (session.expiresAt - Date.now() > REFRESH_SKEW_MS) return session.accessToken
  const refreshed = await refreshSession()
  return refreshed ? loadStoredSession()?.accessToken ?? null : null
}

export function msUntilRefreshDue(): number | null {
  const session = loadStoredSession()
  if (!session) return null
  return Math.max(0, session.expiresAt - Date.now() - REFRESH_SKEW_MS)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await request('recover', { email, options: { redirect_to: window.location.origin } })
}

export async function updatePasswordWithRecoveryToken(accessToken: string, password: string): Promise<void> {
  await request('user', { password }, accessToken, 'PUT')
}
