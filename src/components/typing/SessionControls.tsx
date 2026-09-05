import { Pause, Play, RotateCcw } from 'lucide-react'

interface SessionControlsProps {
  isStarted: boolean
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onRestart: () => void
}

export default function SessionControls({ isStarted, isPaused, onPause, onResume, onRestart }: SessionControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {isStarted && (
        <button onClick={isPaused ? onResume : onPause} className="flex items-center gap-1.5 rounded-sm border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-ink">
          {isPaused ? <Play size={14} /> : <Pause size={14} />}{isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      <button onClick={onRestart} className="flex items-center gap-1.5 rounded-sm border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-ink">
        <RotateCcw size={14} /> Restart
      </button>
      {isPaused && <span className="text-xs font-mono text-accent">Session paused</span>}
    </div>
  )
}
