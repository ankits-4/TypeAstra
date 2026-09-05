import { X } from 'lucide-react'

export default function PrivacyNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="pop-in w-full max-w-md rounded-2xl border border-border bg-surface p-6 astral-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">Privacy</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted">
          <p>
            Creating an account stores your email and a securely hashed password with Supabase, the
            authentication provider TypAstra uses. That's the only thing that leaves your device.
          </p>
          <p>
            Everything else — your typing stats, WPM history, lesson progress, XP, streaks, and
            achievements — is stored only in your browser's local storage, on this device. It is
            never sent to a server, and signing in on another device won't show it there.
          </p>
          <p>
            Signing out or deleting your local profile removes that local data. Deleting your
            account removes your email and password from Supabase; it doesn't reach back into any
            browser's local storage.
          </p>
        </div>
      </div>
    </div>
  )
}
