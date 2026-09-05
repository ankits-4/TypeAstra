import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { useProfiles } from '../context/ProfileContext'
import { ACHIEVEMENTS } from '../data/achievements'

export default function Profile() {
  const { profile, updateProfile, stats, level, xpIntoLevel, xpForNext, achievementProgress } = useAppData()
  const { renameActiveProfile, logOut } = useProfiles()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.username)

  const unlockedCount = ACHIEVEMENTS.filter((a) => achievementProgress[a.id]?.unlocked).length

  function save() {
    if (name.trim()) {
      updateProfile({ username: name.trim() })
      renameActiveProfile(name.trim())
    }
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="rounded-md border border-border bg-surface p-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent text-2xl font-bold font-mono shrink-0">
          {profile.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 rounded-sm border border-border bg-surface-2 px-2 py-1 text-sm"
                autoFocus
              />
              <button onClick={save} className="text-xs text-accent font-medium">Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="font-semibold text-lg hover:text-accent">
              {profile.username}
            </button>
          )}
          <p className="text-xs text-muted mt-0.5">Level {level} · {profile.xp} XP total</p>
          <div className="h-1.5 w-full max-w-xs rounded-full bg-surface-2 overflow-hidden mt-2">
            <div className="h-full bg-accent" style={{ width: `${Math.min(100, (xpIntoLevel / xpForNext) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ProfileStat label="Best WPM" value={stats.bestWpm} />
        <ProfileStat label="Average WPM" value={stats.averageWpm} />
        <ProfileStat label="Best accuracy" value={`${stats.bestAccuracy}%`} />
        <ProfileStat label="Longest streak" value={`${stats.longestStreak} days`} />
        <ProfileStat label="Sessions" value={stats.totalTests} />
        <ProfileStat label="Achievements" value={`${unlockedCount}/${ACHIEVEMENTS.length}`} />
      </div>

      <button
        onClick={logOut}
        className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-muted hover:text-ink w-fit"
      >
        <LogOut size={15} /> Switch profile
      </button>
    </div>
  )
}

function ProfileStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <p className="text-xl font-mono font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}
