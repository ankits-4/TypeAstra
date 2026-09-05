import { useState, useCallback, useMemo } from 'react'
import { useTypingEngine, EngineSummary } from '../hooks/useTypingEngine'
import TypingArea from '../components/typing/TypingArea'
import LiveMetrics from '../components/typing/LiveMetrics'
import ResultsPanel from '../components/typing/ResultsPanel'
import SessionControls from '../components/typing/SessionControls'
import VirtualKeyboard from '../components/keyboard/VirtualKeyboard'
import { useAppData } from '../context/AppDataContext'
import { generateRandomWords } from '../data/words'

type TestKind = 'time' | 'words'

const TIME_OPTIONS = [15, 30, 60, 120]
const WORD_OPTIONS = [10, 25, 50, 100]

export default function Tests() {
  const { recordResult, results, settings } = useAppData()
  const [kind, setKind] = useState<TestKind>('time')
  const [duration, setDuration] = useState(30)
  const [wordCount, setWordCount] = useState(25)
  const [text, setText] = useState(() => generateRandomWords(kind === 'time' ? 250 : wordCount).join(' '))
  const [summary, setSummary] = useState<EngineSummary | null>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [runId, setRunId] = useState(0)

  const label = kind === 'time' ? `${duration}s time test` : `${wordCount} word test`

  const onComplete = useCallback((s: EngineSummary) => {
    setSummary(s)
    const result = recordResult({
      mode: kind,
      label,
      wpm: s.wpm, cpm: s.cpm, accuracy: s.accuracy, errors: s.errors,
      correctChars: s.correctChars, incorrectChars: s.incorrectChars, backspaces: s.backspaces,
      durationSeconds: s.durationSeconds, missedKeys: s.missedKeys, correctKeys: s.correctKeys, wordsTyped: s.wordsTyped,
    })
    setXpEarned(result.xpEarned)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, label])

  const engine = useTypingEngine({
    text,
    mode: kind === 'time' ? 'time' : 'length',
    durationSeconds: kind === 'time' ? duration : undefined,
    onComplete,
  })

  const previousResult = useMemo(() => {
    const prior = results.filter((r) => r.label === label)
    return prior.length > 0 ? prior[prior.length - 1] : null
  }, [results, label])

  function reset(nextKind = kind, nextDuration = duration, nextWordCount = wordCount) {
    setSummary(null)
    setText(generateRandomWords(nextKind === 'time' ? 300 : nextWordCount).join(' '))
    setRunId((n) => n + 1)
  }

  function selectKind(k: TestKind) {
    setKind(k)
    reset(k, duration, wordCount)
  }
  function selectDuration(d: number) {
    setDuration(d)
    reset('time', d, wordCount)
  }
  function selectWordCount(w: number) {
    setWordCount(w)
    reset('words', duration, w)
  }
  function tryAgain() {
    reset()
  }

  const timeRemaining = kind === 'time' && engine.isStarted
    ? Math.max(0, duration - Math.floor(engine.elapsedSeconds))
    : duration

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[.2em] text-accent mb-2">Mission control</p>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Speed test</h1>
        <p className="text-sm text-muted">Choose your format, then launch when you’re ready.</p>
      </div>

      {!summary && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-sm border border-border overflow-hidden">
            {(['time', 'words'] as TestKind[]).map((k) => (
              <button
                key={k}
                onClick={() => selectKind(k)}
                className={`px-3 py-1.5 text-sm capitalize ${kind === k ? 'bg-accent/15 text-accent font-medium' : 'text-muted hover:text-ink'}`}
              >
                {k === 'time' ? 'Time' : 'Words'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(kind === 'time' ? TIME_OPTIONS : WORD_OPTIONS).map((n) => (
              <button
                key={n}
                onClick={() => (kind === 'time' ? selectDuration(n) : selectWordCount(n))}
                className={`rounded-sm px-3 py-1.5 text-sm border font-mono transition-colors ${
                  (kind === 'time' ? duration : wordCount) === n
                    ? 'border-accent bg-accent/15 text-accent font-medium'
                    : 'border-border text-muted hover:text-ink'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {!summary && (
        <>
          <LiveMetrics
            wpm={engine.wpm}
            accuracy={engine.accuracy}
            time={kind === 'time' ? `${timeRemaining}s` : `${engine.typed.split(' ').length - 1}/${wordCount}`}
            timeLabel={kind === 'time' ? 'Time left' : 'Words'}
          />
          <SessionControls isStarted={engine.isStarted} isPaused={engine.isPaused} onPause={engine.pause} onResume={engine.resume} onRestart={tryAgain} />
          <TypingArea
            key={runId}
            text={engine.text}
            charStates={engine.charStates}
            typed={engine.typed}
            onChange={engine.handleChange}
            shake={engine.shake}
            disabled={engine.isPaused}
            smoothCaret={settings.smoothCaret}
          />
          {settings.showKeyboard && <VirtualKeyboard nextChar={engine.text[engine.currentIndex]} lastResult={engine.lastResult} />}
        </>
      )}

      {summary && (
        <ResultsPanel
          summary={summary}
          xpEarned={xpEarned}
          previous={previousResult ? { wpm: previousResult.wpm, accuracy: previousResult.accuracy } : null}
          onRestart={tryAgain}
        />
      )}
    </div>
  )
}
