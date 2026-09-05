import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LESSONS } from '../data/lessons'
import { useTypingEngine, EngineSummary } from '../hooks/useTypingEngine'
import TypingArea from '../components/typing/TypingArea'
import LiveMetrics from '../components/typing/LiveMetrics'
import ResultsPanel from '../components/typing/ResultsPanel'
import SessionControls from '../components/typing/SessionControls'
import VirtualKeyboard from '../components/keyboard/VirtualKeyboard'
import { useAppData } from '../context/AppDataContext'
import { generateKeyDrill, generateRandomWords, generateNumberText, generatePunctuationText } from '../data/words'
import { PARAGRAPHS } from '../data/quotes'
import LessonStars from '../components/lessons/LessonStars'
import { masteryStars } from '../utils/mastery'

function buildLessonText(lesson: (typeof LESSONS)[number]): string {
  switch (lesson.textGenerator) {
    case 'keys': return generateKeyDrill(lesson.keys, 45)
    case 'words': return generateRandomWords(25).join(' ')
    case 'numbers': return generateNumberText(18)
    case 'punctuation': return generatePunctuationText(4)
    case 'paragraph': return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
  }
}

export default function LessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recordResult, lessonProgress, settings } = useAppData()
  const lesson = LESSONS.find((l) => l.id === id)

  const [text, setText] = useState(() => (lesson ? buildLessonText(lesson) : ''))
  const [summary, setSummary] = useState<EngineSummary | null>(null)
  const [xpEarned, setXpEarned] = useState(0)

  // The route reuses this component when only :id changes. Reset all
  // session-specific state so “Next lesson” opens a genuinely fresh lesson.
  useEffect(() => {
    if (!lesson) return
    setText(buildLessonText(lesson))
    setSummary(null)
    setXpEarned(0)
  }, [lesson?.id])

  const onComplete = useCallback((s: EngineSummary) => {
    if (!lesson) return
    setSummary(s)
    const result = recordResult({
      mode: 'lesson',
      label: lesson.title,
      lessonId: lesson.id,
      wpm: s.wpm, cpm: s.cpm, accuracy: s.accuracy, errors: s.errors,
      correctChars: s.correctChars, incorrectChars: s.incorrectChars, backspaces: s.backspaces,
      durationSeconds: s.durationSeconds, missedKeys: s.missedKeys, correctKeys: s.correctKeys, wordsTyped: s.wordsTyped,
    })
    setXpEarned(result.xpEarned)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id])

  const engine = useTypingEngine({ text, mode: 'length', onComplete })

  const progress = lesson ? lessonProgress[lesson.id] : undefined
  const nextLesson = useMemo(() => {
    if (!lesson) return null
    const idx = LESSONS.findIndex((l) => l.id === lesson.id)
    return LESSONS[idx + 1] ?? null
  }, [lesson])

  if (!lesson) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-medium">Lesson not found</p>
        <button onClick={() => navigate('/lessons')} className="text-sm text-accent hover:underline">Back to lessons</button>
      </div>
    )
  }

  function tryAgain() {
    setText(buildLessonText(lesson!))
    setSummary(null)
    engine.restart()
  }

  const met = summary ? summary.wpm >= lesson.targetWpm && summary.accuracy >= lesson.targetAccuracy : false
  const stars = summary ? masteryStars(summary.wpm, summary.accuracy, lesson.targetWpm, lesson.targetAccuracy) : progress ? masteryStars(progress.bestWpm, progress.bestAccuracy, lesson.targetWpm, lesson.targetAccuracy) : 0

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/lessons')} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink w-fit">
        <ArrowLeft size={15} /> All lessons
      </button>

      <div>
        <p className="text-xs text-muted mb-1">Lesson {lesson.number}</p>
        <h1 className="text-2xl font-semibold mb-1">{lesson.title}</h1>
        <p className="text-sm text-muted">{lesson.description}</p>
        <div className="flex gap-4 mt-3 text-xs text-muted font-mono">
          <span>Target {lesson.targetWpm} WPM</span>
          <span>Target {lesson.targetAccuracy}% accuracy</span>
          <span className="text-accent">+{lesson.xpReward} XP</span>
          {progress?.completed && <span className="text-good">Completed</span>}
          <LessonStars value={stars} compact />
        </div>
      </div>

      {!summary && (
        <>
          <LiveMetrics wpm={engine.wpm} accuracy={engine.accuracy} time={`${Math.floor(engine.elapsedSeconds)}s`} />
          <SessionControls isStarted={engine.isStarted} isPaused={engine.isPaused} onPause={engine.pause} onResume={engine.resume} onRestart={tryAgain} />
          <TypingArea text={engine.text} charStates={engine.charStates} typed={engine.typed} onChange={engine.handleChange} shake={engine.shake} disabled={engine.isPaused} smoothCaret={settings.smoothCaret} />
          {settings.showKeyboard && <VirtualKeyboard nextChar={engine.text[engine.currentIndex]} lastResult={engine.lastResult} showFingerGuide />}
        </>
      )}

      {summary && (
        <>
          {!met && (
            <div className="rounded-md border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
              Not quite at target yet — try again to lock in the lesson as complete.
            </div>
          )}
          {met && (
            <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
              <span className="font-medium">Lesson mastered</span>
              <LessonStars value={stars} />
            </div>
          )}
          <ResultsPanel
            summary={summary}
            xpEarned={xpEarned}
            onRestart={tryAgain}
            onNext={nextLesson ? () => navigate(`/lessons/${nextLesson.id}`) : undefined}
            nextLabel="Next lesson"
          />
        </>
      )}
    </div>
  )
}
