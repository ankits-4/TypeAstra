import { FormEvent, useState } from 'react'
import { KeyRound, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ResetPasswordScreen({ recoveryToken, onDone }: { recoveryToken: string; onDone: () => void }) {
  const { updatePasswordWithRecoveryToken } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use a password with at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await updatePasswordWithRecoveryToken(recoveryToken, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your password. The link may have expired — request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen starfield bg-bg px-4 py-10 text-ink flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface/90 p-6 md:p-8 astral-card">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-ink">
            {done ? <Sparkles size={20} /> : <KeyRound size={20} />}
          </div>
          <h1 className="text-2xl font-bold">Typ<span className="text-accent">Astra</span></h1>
          <p className="mt-1 text-sm text-muted">{done ? 'Password updated.' : 'Choose a new password.'}</p>
        </div>

        {done ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">
              Your password has been updated. Sign in with your new password.
            </p>
            <button onClick={onDone} className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
              Back to sign in
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 text-muted focus-within:border-accent">
              <input
                required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" placeholder="New password"
                className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 text-muted focus-within:border-accent">
              <input
                required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password" placeholder="Confirm new password"
                className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted"
              />
            </label>
            {error && <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</p>}
            <button disabled={loading} className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-ink disabled:opacity-60">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
