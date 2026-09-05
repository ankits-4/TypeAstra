import { useNavigate } from 'react-router-dom'
import { Rocket, Trophy } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'

export default function Games() {
  const navigate = useNavigate()
  const { gameScores } = useAppData()
  const typeRushBest = gameScores.filter((g) => g.game === 'type-rush').reduce((max, g) => Math.max(max, g.score), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Games</h1>
        <p className="text-sm text-muted">Turn typing practice into a game. Speed and accuracy both count.</p>
      </div>

      <button
        onClick={() => navigate('/games/type-rush')}
        className="text-left rounded-md border border-border bg-surface p-6 hover:border-accent/50 transition-colors max-w-md"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-sm bg-accent/15 text-accent p-2">
            <Rocket size={20} />
          </div>
          <p className="font-semibold text-lg">Type Rush</p>
        </div>
        <p className="text-sm text-muted mb-4">
          Words fall toward the danger zone. Type each one before it lands. Speed ramps up the longer you survive.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Trophy size={14} className="text-accent" />
          Best score: <span className="font-mono text-ink">{typeRushBest || 0}</span>
        </div>
      </button>
    </div>
  )
}
