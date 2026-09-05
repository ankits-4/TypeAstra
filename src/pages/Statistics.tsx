import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import StatCard from '../components/dashboard/StatCard'
import WpmTrendChart from '../components/charts/WpmTrendChart'
import { Gauge, Target, Hash, AlertTriangle } from 'lucide-react'
import { dateOnly } from '../utils/date'
import KeyboardHeatmap from '../components/keyboard/KeyboardHeatmap'

const RANGES = [
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '3 months', days: 90 },
  { id: 'all', label: 'All time', days: Infinity },
]

export default function Statistics() {
  const { results, stats } = useAppData()
  const [range, setRange] = useState('30d')

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.id === range)!
    if (r.days === Infinity) return results
    const cutoff = Date.now() - r.days * 86400000
    return results.filter((res) => new Date(res.date).getTime() >= cutoff)
  }, [results, range])

  const trendData = useMemo(
    () => filtered.map((r, i) => ({ label: dateOnly(r.date).slice(5), wpm: r.wpm, accuracy: r.accuracy })),
    [filtered]
  )

  const keyEntries = useMemo(() => {
    return Object.entries(stats.keyStats)
      .map(([key, v]) => ({ key, incorrect: v.incorrect }))
      .filter((k) => k.incorrect > 0)
      .sort((a, b) => b.incorrect - a.incorrect)
      .slice(0, 10)
  }, [stats.keyStats])

  const avgWpm = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.wpm, 0) / filtered.length) : 0
  const avgAcc = filtered.length ? Math.round((filtered.reduce((s, r) => s + r.accuracy, 0) / filtered.length) * 10) / 10 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Statistics</h1>
          <p className="text-sm text-muted">Your typing performance over time.</p>
        </div>
        <div className="flex rounded-sm border border-border overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-xs ${range === r.id ? 'bg-accent/15 text-accent font-medium' : 'text-muted hover:text-ink'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Average WPM" value={avgWpm || '—'} icon={Gauge} accent />
        <StatCard label="Average accuracy" value={avgAcc ? `${avgAcc}%` : '—'} icon={Target} />
        <StatCard label="Sessions in range" value={filtered.length} icon={Hash} />
        <StatCard label="Total mistakes" value={stats.totalMistakes} icon={AlertTriangle} />
      </div>

      {filtered.length > 0 ? (
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-sm font-medium text-muted mb-2">WPM over time</h2>
          <WpmTrendChart data={trendData} height={260} />
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          No sessions in this range yet.
        </div>
      )}

      <div className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted mb-3">Keyboard accuracy heatmap</h2>
        <KeyboardHeatmap keyStats={stats.keyStats} />
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-muted mb-3">Keys that need work</h2>
        {keyEntries.length === 0 ? (
          <p className="text-sm text-muted">Not enough data yet — keep practicing and this will fill in.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keyEntries.map((k) => (
              <div key={k.key} className="flex items-center gap-2 rounded-sm border border-border bg-surface-2 px-3 py-1.5">
                <span className="font-mono text-sm uppercase">{k.key}</span>
                <span className="text-xs text-bad font-mono">{k.incorrect}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
