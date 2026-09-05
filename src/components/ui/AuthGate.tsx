import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfiles } from '../../context/ProfileContext'
import AuthScreen from './AuthScreen'
import ResetPasswordScreen from './ResetPasswordScreen'

function readRecoveryToken(): string | null {
  // Supabase redirects back with #access_token=...&type=recovery in the URL hash.
  if (!window.location.hash) return null
  const params = new URLSearchParams(window.location.hash.slice(1))
  if (params.get('type') !== 'recovery') return null
  return params.get('access_token')
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, user } = useAuth()
  const { activeProfileId, activateAccountProfile } = useProfiles()
  const [recoveryToken, setRecoveryToken] = useState<string | null>(() => readRecoveryToken())

  useEffect(() => {
    if (enabled && user && activeProfileId !== user.id) activateAccountProfile(user.id, user.username)
  }, [enabled, user, activeProfileId, activateAccountProfile])

  if (recoveryToken) {
    return (
      <ResetPasswordScreen
        recoveryToken={recoveryToken}
        onDone={() => {
          history.replaceState(null, '', window.location.pathname + window.location.search)
          setRecoveryToken(null)
        }}
      />
    )
  }

  if (!enabled) return <>{children}</>
  if (!user) return <AuthScreen />
  if (activeProfileId !== user.id) return <div className="min-h-screen bg-bg" />
  return <>{children}</>
}
