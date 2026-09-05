import { useState } from 'react'
import { Plus, Trash2, Keyboard } from 'lucide-react'
import { useProfiles } from '../../context/ProfileContext'

export default function ProfilePicker() {
  const { profiles, switchTo, addProfile, removeProfile } = useProfiles()
  const [adding, setAdding] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function submitNew() {
    if (!name.trim()) return
    addProfile(name)
    setName('')
    setAdding(false)
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="rounded-md bg-accent/15 text-accent p-3">
            <Keyboard size={28} />
          </div>
          <h1 className="text-2xl font-semibold">Typ<span className="text-accent">Astra</span></h1>
          <p className="text-sm text-muted">Who's typing?</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {profiles.map((p) => (
            <div key={p.id} className="relative group">
              <button
                onClick={() => switchTo(p.id)}
                className="w-full flex flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 hover:border-accent/50 transition-colors"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold font-mono"
                  style={{ backgroundColor: `${p.color}30`, color: p.color }}
                >
                  {p.username.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate max-w-full">{p.username}</span>
              </button>
              <button
                aria-label={`Delete ${p.username}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDeleteId(p.id)
                }}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-surface border border-border p-1 text-muted opacity-0 group-hover:opacity-100 hover:text-bad transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-4 text-muted hover:text-accent hover:border-accent/50 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
                <Plus size={20} />
              </div>
              <span className="text-sm">Add profile</span>
            </button>
          )}
        </div>

        {adding && (
          <div className="flex gap-2 pop-in">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              placeholder="Enter a name"
              maxLength={24}
              className="flex-1 rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button onClick={submitNew} className="rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
              Start
            </button>
            {profiles.length > 0 && (
              <button onClick={() => { setAdding(false); setName('') }} className="rounded-sm border border-border px-3 py-2 text-sm">
                Cancel
              </button>
            )}
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="pop-in w-full max-w-xs rounded-md border border-border bg-surface p-5 text-center">
              <p className="text-sm mb-4">
                Delete <b>{profiles.find((p) => p.id === confirmDeleteId)?.username}</b>'s profile? Their progress on this device will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { removeProfile(confirmDeleteId); setConfirmDeleteId(null) }}
                  className="flex-1 rounded-sm bg-bad text-white px-3 py-2 text-sm"
                >
                  Delete
                </button>
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-sm border border-border px-3 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted mt-8">
          Profiles are stored only in this browser, on this device.
        </p>
      </div>
    </div>
  )
}
