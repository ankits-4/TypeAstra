import { useState, useCallback, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTypingEngine, EngineSummary } from '../hooks/useTypingEngine'
import TypingArea from '../components/typing/TypingArea'
import LiveMetrics from '../components/typing/LiveMetrics'
import ResultsPanel from '../components/typing/ResultsPanel'
import SessionControls from '../components/typing/SessionControls'
import VirtualKeyboard from '../components/keyboard/VirtualKeyboard'
import { useAppData } from '../context/AppDataContext'
import { generateRandomWords, generateNumberText, generatePunctuationText, generateMixedWords, generateKeyDrill } from '../data/words'
import { QUOTES, PARAGRAPHS } from '../data/quotes'
import { randomCodeSnippet } from '../data/codeSnippets'

type PracticeMode = 'words' | 'quote' | 'paragraph' | 'numbers' | 'punctuation' | 'mixed' | 'code' | 'focus'

const MODES: { id: PracticeMode; label: string }[] = [
  { id: 'words', label: 'Random words' },
  { id: 'quote', label: 'Quote' },
  { id: 'paragraph', label: 'Paragraph' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'punctuation', label: 'Punctuation' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'code', label: 'Code' },
  { id: 'focus', label: 'Focus keys' },
]

function buildText(mode: PracticeMode, focusKeys: string[] = ['f', 'j', 'd', 'k']): string {
  switch (mode) {
    case 'words': return generateRandomWords(30).join(' ')
    case 'quote': return QUOTES[Math.floor(Math.random() * QUOTES.length)]
    case 'paragraph': return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
    case 'numbers': return generateNumberText(20)
    case 'punctuation': return generatePunctuationText(5)
    case 'mixed': return generateMixedWords(30).join(' ')
    case 'code': return randomCodeSnippet()
    case 'focus': return generateKeyDrill(focusKeys, 60)
  }
}

export default function Practice() {
  const { recordResult, results, settings, stats } = useAppData()
  const [mode, setMode] = useState<PracticeMode>('words')
  const [text, setText] = useState(() => buildText('words'))
  const [summary, setSummary] = useState<EngineSummary | null>(null)
  const [xpEarned, setXpEarned] = useState(0)
  const [sessionKey, setSessionKey] = useState(0)

  const focusKeys = useMemo(() => {
    const keys = Object.entries(stats.keyStats)
      .filter(([key, data]) => key.length === 1 && data.incorrect > 0)
      .sort(([, a], [, b]) => b.incorrect - a.incorrect)
      .slice(0, 5)
      .map(([key]) => key.toLowerCase())
    return keys.length ? keys : ['f', 'j', 'd', 'k']
  }, [stats.keyStats])

  const onComplete = useCallback((s: EngineSummary) => {
    setSummary(s)
    const result = recordResult({
      mode: 'time',
      label: `Practice · ${mode}`,
      wpm: s.wpm, cpm: s.cpm, accuracy: s.accuracy, errors: s.errors,
      correctChars: s.correctChars, incorrectChars: s.incorrectChars, backspaces: s.backspaces,
      durationSeconds: s.durationSeconds, missedKeys: s.missedKeys, correctKeys: s.correctKeys, wordsTyped: s.wordsTyped,
    })
    setXpEarned(result.xpEarned)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const engine = useTypingEngine({ text, mode: 'length', onComplete })

  const previousResult = useMemo(() => {
    const prior = results.filter((r) => r.label === `Practice · ${mode}`)
    return prior.length > 0 ? prior[prior.length - 1] : null
  }, [results, mode])

  function changeMode(m: PracticeMode) {
    setMode(m)
    setText(buildText(m, focusKeys))
    setSummary(null)
    setSessionKey((key) => key + 1)
    engine.restart()
  }

  function tryAgain() {
    setText(buildText(mode, focusKeys))
    setSummary(null)
    setSessionKey((key) => key + 1)
    engine.restart()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-surface/80 p-6 md:p-8 astral-card">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
        <p className="relative text-xs font-mono uppercase tracking-[.2em] text-accent mb-2">Your typing orbit</p>
        <h1 className="relative text-3xl font-bold tracking-tight mb-2">Practice with purpose.</h1>
        <p className="relative text-sm text-muted max-w-xl">Choose a signal, find your rhythm, and turn every session into momentum.</p>
        {mode === 'focus' && <p className="relative mt-3 text-xs font-mono text-accent">Training: {focusKeys.map((key) => key.toUpperCase()).join(' · ')}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => changeMode(m.id)}
            className={`rounded-sm px-3 py-1.5 text-sm border transition-colors ${
              mode === m.id ? 'border-accent bg-accent/15 text-accent font-semibold shadow-sm' : 'border-border bg-surface/60 text-muted hover:text-ink hover:border-accent/40'
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          onClick={tryAgain}
          className="ml-auto flex items-center gap-1.5 rounded-sm border border-border bg-surface/60 px-3 py-1.5 text-sm text-muted hover:border-accent/40 hover:text-ink"
          aria-label="Load a new practice prompt"
        >
          <RefreshCw size={14} /> New prompt
        </button>
      </div>

      {!summary && (
        <>
          <LiveMetrics wpm={engine.wpm} accuracy={engine.accuracy} time={`${Math.floor(engine.elapsedSeconds)}s`} />
          <SessionControls isStarted={engine.isStarted} isPaused={engine.isPaused} onPause={engine.pause} onResume={engine.resume} onRestart={tryAgain} />
          <TypingArea
            key={sessionKey}
            text={engine.text}
            charStates={engine.charStates}
            typed={engine.typed}
            onChange={engine.handleChange}
            shake={engine.shake}
            disabled={engine.isPaused}
            fontSize={mode === 'code' ? 'md' : 'lg'}
            smoothCaret={settings.smoothCaret}
          />
          {settings.showKeyboard && <VirtualKeyboard nextChar={engine.text[engine.currentIndex]} lastResult={engine.lastResult} showFingerGuide />}
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
