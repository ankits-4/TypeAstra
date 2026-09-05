import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Keyboard, GraduationCap, Gauge, Gamepad2, BarChart3, Trophy, Settings, Flame, Moon, Sun, UserPlus, Sparkles } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useProfiles } from '../../context/ProfileContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import ToastContainer from '../ui/ToastContainer'
import OnboardingModal, { isOnboardingComplete } from '../ui/OnboardingModal'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/practice', label: 'Practice', icon: Keyboard },
  { to: '/lessons', label: 'Lessons', icon: GraduationCap },
  { to: '/tests', label: 'Speed test', icon: Gauge },
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/stats', label: 'Statistics', icon: BarChart3 },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
]

export default function AppShell() {
  const { profile, stats, level, xpIntoLevel, xpForNext } = useAppData()
  const { activeProfileId, logOut } = useProfiles()
  const { enabled: authEnabled, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete(activeProfileId!))
  const handleSignOut = () => {
    if (authEnabled) void signOut()
    else logOut()
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex starfield">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface/85 backdrop-blur-xl px-4 py-5">
        <div className="flex items-center gap-2.5 px-2 mb-9">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-lg shadow-accent/25"><Sparkles size={18} /></div>
          <span className="font-semibold text-lg tracking-tight">Typ<span className="text-accent">Astra</span></span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-accent/15 text-accent font-semibold shadow-sm' : 'text-muted hover:text-ink hover:bg-surface-2'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-accent/15 text-accent font-semibold' : 'text-muted hover:text-ink hover:bg-surface-2'
              }`
            }
          >
            <Settings size={17} />
            Settings
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-accent/15 text-accent font-semibold' : 'text-muted hover:text-ink hover:bg-surface-2'
              }`
            }
          >
            <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-accent/20 text-accent text-[10px] font-bold">
              {profile.username.slice(0, 1).toUpperCase()}
            </div>
            {profile.username}
          </NavLink>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <UserPlus size={17} />
            {authEnabled ? 'Sign out' : 'Switch profile'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-surface/75 backdrop-blur-xl px-4 py-3 md:px-7">
          <div className="md:hidden flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-ink"><Sparkles size={14} /></div>
            <span className="font-semibold">Typ<span className="text-accent">Astra</span></span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              aria-label={authEnabled ? 'Sign out' : 'Switch profile'}
              className="md:hidden rounded-sm p-1.5 text-muted hover:text-ink hover:bg-surface-2"
            >
              <UserPlus size={17} />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <Flame size={16} className="text-accent" />
              <span className="font-medium text-ink">{stats.currentStreak}</span>
              <span className="hidden sm:inline">day streak</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
              <span className="text-xs font-mono text-muted">Lv {level}</span>
              <div className="h-1.5 w-16 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${Math.min(100, (xpIntoLevel / xpForNext) * 100)}%` }}
                />
              </div>
            </div>
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-sm p-1.5 text-muted hover:text-ink hover:bg-surface-2"
            >
              {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-9 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-border bg-surface/95 backdrop-blur px-1 py-1.5">
        {[...NAV_ITEMS.slice(0, 4), { to: '/settings', label: 'More', icon: Settings }].map(({ to, label, icon: Icon, end }: any) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-sm px-2 py-1.5 text-[10px] ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <ToastContainer />
      {showOnboarding && <OnboardingModal profileId={activeProfileId!} onDone={() => setShowOnboarding(false)} />}
    </div>
  )
}
