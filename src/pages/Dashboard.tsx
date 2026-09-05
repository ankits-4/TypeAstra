import { useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gauge, Target, Clock, Flame, Trophy, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import StatCard from '../components/dashboard/StatCard'
import { LESSONS } from '../data/lessons'

// Recharts is a heavy dependency (~150kB gzipped). Dashboard is the one page
// that's never lazy-loaded (it's the landing route), so the chart specifically
// is split out — first paint and interactivity don't need to wait on it.
const WpmTrendChart = lazy(() => import('../components/charts/WpmTrendChart'))

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { stats, results, level, profile, dailyChallenges, lessonProgress } = useAppData()
  const navigate = useNavigate()

  const trendData = useMemo(() => {
    return results.slice(-10).map((r, i) => ({
      label: `#${results.length - results.slice(-10).length + i + 1}`,
      wpm: r.wpm,
      accuracy: r.accuracy,
    }))
  }, [results])

  const nextLesson = useMemo(() => LESSONS.find((l) => !lessonProgress[l.id]?.completed) ?? LESSONS[LESSONS.length - 1], [lessonProgress])
  const nextLessonProgress = lessonProgress[nextLesson.id]

  const recent = results.slice(-5).reverse()

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-surface/80 p-6 md:p-8 astral-card">
        <div className="absolute right-8 top-6 h-3 w-3 rounded-full bg-accent shadow-[0_0_25px_8px_rgba(169,155,255,.25)]" />
        <p className="text-xs font-mono uppercase tracking-[.2em] text-accent mb-2">Command deck</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{greeting()}, {profile.username}.</h1>
        <p className="text-sm text-muted">Your next level is one focused session away.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Current best WPM" value={stats.bestWpm || '—'} icon={Gauge} accent />
        <StatCard label="Accuracy" value={stats.bestAccuracy ? `${stats.bestAccuracy}%` : '—'} icon={Target} />
        <StatCard label="Practice time" value={`${Math.round(stats.totalPracticeSeconds / 60)}m`} icon={Clock} />
        <StatCard label="Day streak" value={stats.currentStreak} icon={Flame} />
        <StatCard label="Level" value={level} icon={Zap} accent />
        <StatCard label="XP" value={profile.xp} icon={Trophy} />
        <StatCard label="Sessions" value={stats.totalTests} icon={CheckCircle2} />
        <StatCard label="Words typed" value={stats.totalWordsTyped} icon={Gauge} />
      </div>

      {results.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface/90 p-5 astral-card">
          <h2 className="text-sm font-medium text-muted mb-2">Recent WPM trend</h2>
          <Suspense fallback={<div className="h-[220px]" />}>
            <WpmTrendChart data={trendData} />
          </Suspense>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface/80 p-8 text-center">
          <p className="text-sm text-muted mb-3">No typing sessions yet. Complete your first test to start building your statistics.</p>
          <button onClick={() => navigate('/tests')} className="rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
            Start typing
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/lessons/${nextLesson.id}`)}
          className="text-left rounded-xl border border-border bg-surface/90 p-5 hover:border-accent/50 hover:-translate-y-0.5 transition-all astral-card"
        >
          <p className="text-xs text-muted mb-1">Lesson {nextLesson.number}</p>
          <p className="font-medium mb-3">{nextLesson.title}</p>
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden mb-3">
            <div
              className="h-full bg-accent"
              style={{ width: `${nextLessonProgress ? Math.min(100, (nextLessonProgress.bestWpm / nextLesson.targetWpm) * 100) : 0}%` }}
            />
          </div>
          <span className="flex items-center gap-1.5 text-sm text-accent font-medium">
            Continue <ArrowRight size={14} />
          </span>
        </button>

        <div className="rounded-xl border border-border bg-surface/90 p-5 astral-card">
          <p className="text-sm font-medium mb-3">Today's challenges</p>
          <div className="flex flex-col gap-2.5">
            {dailyChallenges.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 size={16} className={c.completed ? 'text-good' : 'text-border'} />
                <span className={c.completed ? 'text-muted line-through' : ''}>{c.description}</span>
                <span className="ml-auto text-xs text-accent font-mono">+{c.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="rounded-xl border border-border bg-surface/90 p-5 astral-card">
          <p className="text-sm font-medium mb-3">Recent activity</p>
          <div className="flex flex-col divide-y divide-border">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted">{r.label}</span>
                <span className="font-mono">{r.wpm} WPM · {r.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
