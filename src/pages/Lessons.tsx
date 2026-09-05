import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Lock, Play } from 'lucide-react'
import { LESSONS } from '../data/lessons'
import { useAppData } from '../context/AppDataContext'
import LessonStars from '../components/lessons/LessonStars'
import { masteryStars } from '../utils/mastery'

export default function Lessons() {
  const { lessonProgress } = useAppData()
  const navigate = useNavigate()

  const firstIncomplete = LESSONS.findIndex((l) => !lessonProgress[l.id]?.completed)
  const completedCount = LESSONS.filter((lesson) => lessonProgress[lesson.id]?.completed).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Lessons</h1>
        <p className="text-sm text-muted">A structured path from home row basics to expert-level typing.</p>
        <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(completedCount / LESSONS.length) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs font-mono text-muted">{completedCount} / {LESSONS.length} lessons mastered</p>
      </div>

      <div className="flex flex-col gap-2">
        {LESSONS.map((lesson, i) => {
          const progress = lessonProgress[lesson.id]
          const isLocked = i > 0 && firstIncomplete !== -1 && i > firstIncomplete
          const isNext = i === firstIncomplete || (firstIncomplete === -1 && i === LESSONS.length - 1 && !progress?.completed)
          const stars = progress ? masteryStars(progress.bestWpm, progress.bestAccuracy, lesson.targetWpm, lesson.targetAccuracy) : 0

          return (
            <button
              key={lesson.id}
              disabled={isLocked}
              onClick={() => navigate(`/lessons/${lesson.id}`)}
              className={`flex items-center gap-4 rounded-md border p-4 text-left transition-colors ${
                isLocked
                  ? 'border-border bg-surface opacity-50 cursor-not-allowed'
                  : 'border-border bg-surface hover:border-accent/50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm ${
                  progress?.completed
                    ? 'bg-good/15 text-good'
                    : isLocked
                    ? 'bg-surface-2 text-muted'
                    : 'bg-accent/15 text-accent'
                }`}
              >
                {progress?.completed ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={15} /> : lesson.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{lesson.title}</p>
                <p className="text-xs text-muted truncate">{lesson.description}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end text-xs text-muted shrink-0">
                <LessonStars value={stars} compact />
                <span>{lesson.targetWpm} WPM · {lesson.targetAccuracy}%</span>
                <span className="text-accent">+{lesson.xpReward} XP</span>
              </div>
              {isNext && !isLocked && <Play size={16} className="text-accent shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
