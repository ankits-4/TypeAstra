import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  AuthUser, authEnabled, loadStoredSession, signIn, signOut, signUp,
  refreshSession, msUntilRefreshDue, requestPasswordReset, updatePasswordWithRecoveryToken,
} from '../services/auth/supabaseAuth'

interface AuthContextValue {
  enabled: boolean
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (username: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePasswordWithRecoveryToken: (accessToken: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredSession()?.user ?? null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    const delay = msUntilRefreshDue()
    if (delay === null) return
    refreshTimer.current = setTimeout(async () => {
      const refreshedUser = await refreshSession()
      setUser(refreshedUser)
      if (refreshedUser) scheduleRefresh()
    }, delay)
  }, [])

  useEffect(() => {
    if (user) scheduleRefresh()
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const login = useCallback(async (email: string, password: string) => setUser(await signIn(email, password)), [])
  const register = useCallback(async (username: string, email: string, password: string) => {
    const result = await signUp(username, email, password)
    if (!result.needsEmailConfirmation) setUser(result.user)
    return { needsEmailConfirmation: result.needsEmailConfirmation }
  }, [])
  const logout = useCallback(async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    await signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      enabled: authEnabled, user, signIn: login, signUp: register, signOut: logout,
      requestPasswordReset, updatePasswordWithRecoveryToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
