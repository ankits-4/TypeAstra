import { RotateCcw, ArrowRight } from 'lucide-react'
import { EngineSummary } from '../../hooks/useTypingEngine'
import MissedKeysChart from '../charts/MissedKeysChart'

interface ResultsPanelProps {
  summary: EngineSummary
  xpEarned: number
  previous?: { wpm: number; accuracy: number } | null
  onRestart: () => void
  onNext?: () => void
  nextLabel?: string
}

export default function ResultsPanel({ summary, xpEarned, previous, onRestart, onNext, nextLabel = 'Next' }: ResultsPanelProps) {
  const missedKeys = Object.entries(summary.missedKeys)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const wpmDelta = previous ? summary.wpm - previous.wpm : null
  const accDelta = previous ? Math.round((summary.accuracy - previous.accuracy) * 10) / 10 : null

  return (
    <div className="pop-in rounded-md border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Session complete</h2>
        <span className="text-sm font-mono text-accent">+{xpEarned} XP</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <ResultStat label="WPM" value={summary.wpm} delta={wpmDelta} />
        <ResultStat label="Accuracy" value={`${summary.accuracy}%`} delta={accDelta} suffix="%" />
        <ResultStat label="CPM" value={summary.cpm} />
        <ResultStat label="Errors" value={summary.errors} invertGood />
      </div>

      {missedKeys.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted mb-2">Most missed keys</h3>
          <MissedKeysChart data={missedKeys} />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-sm border border-border bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-border/40 transition-colors"
        >
          <RotateCcw size={15} /> Try again
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {nextLabel} <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

function ResultStat({ label, value, delta, invertGood }: { label: string; value: string | number; delta?: number | null; suffix?: string; invertGood?: boolean }) {
  const isGood = delta != null ? (invertGood ? delta <= 0 : delta >= 0) : null
  return (
    <div className="rounded-sm bg-surface-2 border border-border p-3">
      <p className="text-xl font-mono font-semibold">{value}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-muted">{label}</p>
        {delta != null && delta !== 0 && (
          <span className={`text-[11px] font-mono ${isGood ? 'text-good' : 'text-bad'}`}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
    </div>
  )
}
