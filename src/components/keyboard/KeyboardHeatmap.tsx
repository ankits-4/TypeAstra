import { UserStats } from '../../types'

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
]

function accuracyFor(keyStats: UserStats['keyStats'], key: string): number | null {
  const stat = keyStats[key]
  if (!stat) return null
  const total = stat.correct + stat.incorrect
  if (total < 3) return null // not enough data to be meaningful
  return Math.round((stat.correct / total) * 100)
}

function colorFor(accuracy: number | null): string {
  if (accuracy === null) return 'bg-surface-2 text-muted border-border'
  if (accuracy >= 97) return 'bg-good/20 text-good border-good/40'
  if (accuracy >= 90) return 'border-accent/40 text-accent bg-accent/10'
  if (accuracy >= 80) return 'bg-bad/10 text-bad border-bad/30'
  return 'bg-bad/25 text-bad border-bad/50'
}

export default function KeyboardHeatmap({ keyStats }: { keyStats: UserStats['keyStats'] }) {
  const hasAnyData = Object.keys(keyStats).length > 0

  if (!hasAnyData) {
    return <p className="text-sm text-muted py-4">Keep practicing — this heatmap fills in as you type.</p>
  }

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5" style={{ marginLeft: ri * 14 }}>
          {row.map((key) => {
            const acc = accuracyFor(keyStats, key)
            return (
              <div
                key={key}
                title={acc !== null ? `${key.toUpperCase()}: ${acc}% accuracy` : `${key.toUpperCase()}: no data yet`}
                className={`flex h-9 w-9 md:h-10 md:w-10 flex-col items-center justify-center rounded-[5px] border font-mono transition-colors ${colorFor(acc)}`}
              >
                <span className="text-xs uppercase leading-none">{key}</span>
                {acc !== null && <span className="text-[9px] leading-none mt-0.5 opacity-80">{acc}</span>}
              </div>
            )
          })}
        </div>
      ))}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-muted">
        <LegendDot cls="bg-good/20 border-good/40" label="97%+" />
        <LegendDot cls="border-accent/40 bg-accent/10" label="90–96%" />
        <LegendDot cls="bg-bad/10 border-bad/30" label="80–89%" />
        <LegendDot cls="bg-bad/25 border-bad/50" label="<80%" />
      </div>
    </div>
  )
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm border ${cls}`} />
      {label}
    </span>
  )
}
