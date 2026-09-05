import { FormEvent, useState } from 'react'
import { AtSign, LockKeyhole, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PrivacyNotice from './PrivacyNotice'

type Mode = 'signin' | 'signup' | 'recover'

export default function AuthScreen() {
  const { signIn, signUp, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(''); setMessage('')
    if (mode === 'recover') {
      setLoading(true)
      try {
        await requestPasswordReset(email.trim())
        setMessage('If an account exists for that email, a reset link is on its way.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to send reset email. Please try again.')
      } finally { setLoading(false) }
      return
    }
    if (mode === 'signup' && username.trim().length < 2) return setError('Please enter a display name with at least 2 characters.')
    if (password.length < 8) return setError('Use a password with at least 8 characters.')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const result = await signUp(username.trim(), email.trim(), password)
        if (result.needsEmailConfirmation) setMessage('Check your email to confirm your account, then sign in.')
      } else {
        await signIn(email.trim(), password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue. Please try again.')
    } finally { setLoading(false) }
  }

  function switchMode(next: Mode) {
    setMode(next); setError(''); setMessage('')
  }

  const heading = mode === 'signup' ? 'Create your typing journey.' : mode === 'recover' ? 'Reset your password.' : 'Welcome back, pilot.'
  const buttonLabel = loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'recover' ? 'Send reset link' : 'Sign in'

  return (
    <main className="min-h-screen starfield bg-bg px-4 py-10 text-ink flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface/90 p-6 md:p-8 astral-card">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-ink"><Sparkles size={20} /></div>
          <h1 className="text-2xl font-bold">Typ<span className="text-accent">Astra</span></h1>
          <p className="mt-1 text-sm text-muted">{heading}</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          {mode === 'signup' && <Field icon={<UserRound size={16} />} label="Display name" value={username} onChange={setUsername} autoComplete="name" />}
          <Field icon={<AtSign size={16} />} label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          {mode !== 'recover' && (
            <Field icon={<LockKeyhole size={16} />} label="Password" type="password" value={password} onChange={setPassword} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          )}
          {mode === 'signin' && (
            <button type="button" onClick={() => switchMode('recover')} className="self-end text-xs text-muted hover:text-accent hover:underline">
              Forgot password?
            </button>
          )}
          {error && <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</p>}
          {message && <p className="rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">{message}</p>}
          <button disabled={loading} className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-ink disabled:opacity-60">{buttonLabel}</button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {mode === 'recover' ? (
            <button onClick={() => switchMode('signin')} className="font-semibold text-accent hover:underline">Back to sign in</button>
          ) : mode === 'signup' ? (
            <>Already have an account? <button onClick={() => switchMode('signin')} className="font-semibold text-accent hover:underline">Sign in</button></>
          ) : (
            <>New to TypAstra? <button onClick={() => switchMode('signup')} className="font-semibold text-accent hover:underline">Create account</button></>
          )}
        </p>
        <button onClick={() => setShowPrivacy(true)} className="mt-3 block w-full text-center text-xs text-muted hover:text-ink hover:underline">
          Privacy
        </button>
      </div>
      {showPrivacy && <PrivacyNotice onClose={() => setShowPrivacy(false)} />}
    </main>
  )
}

function Field({ icon, label, type = 'text', value, onChange, autoComplete }: { icon: React.ReactNode; label: string; type?: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 text-muted focus-within:border-accent"><span>{icon}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={label} className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted" /></label>
}
