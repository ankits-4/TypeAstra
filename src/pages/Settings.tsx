import { useAppData } from '../context/AppDataContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 shrink-0 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-surface-2 border border-border'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings, resetAllData } = useAppData()
  const { theme, setTheme } = useTheme()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted">Customize how TypAstra looks and feels.</p>
      </div>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted mb-1">Appearance</h2>
        <div className="divide-y divide-border">
          <Row label="Theme">
            <div className="flex rounded-sm border border-border overflow-hidden">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 text-xs capitalize ${theme === t ? 'bg-accent/15 text-accent font-medium' : 'text-muted'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted mb-1">Typing</h2>
        <div className="divide-y divide-border">
          <Row label="Show virtual keyboard" description="Display the on-screen keyboard during practice">
            <Toggle checked={settings.showKeyboard} onChange={(v) => updateSettings({ showKeyboard: v })} />
          </Row>
          <Row label="Smooth caret" description="Animate the typing cursor">
            <Toggle checked={settings.smoothCaret} onChange={(v) => updateSettings({ smoothCaret: v })} />
          </Row>
          <Row label="Sound effects" description="Play sounds on keystrokes and events">
            <Toggle checked={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
          </Row>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted mb-1">Accessibility</h2>
        <div className="divide-y divide-border">
          <Row label="Reduced motion" description="Minimize animations throughout the app">
            <Toggle checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
          </Row>
        </div>
      </section>

      <section className="rounded-md border border-bad/40 bg-bad/5 p-5">
        <h2 className="text-sm font-medium mb-1">Reset data</h2>
        <p className="text-xs text-muted mb-3">Permanently clear this profile's progress and statistics in this browser. Other profiles on this device are unaffected.</p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="rounded-sm border border-bad/50 text-bad px-3 py-1.5 text-sm">
            Reset this profile's data
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={resetAllData} className="rounded-sm bg-bad text-white px-3 py-1.5 text-sm">Yes, erase everything</button>
            <button onClick={() => setConfirmReset(false)} className="rounded-sm border border-border px-3 py-1.5 text-sm">Cancel</button>
          </div>
        )}
      </section>
    </div>
  )
}
