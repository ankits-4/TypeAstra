import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, RotateCcw } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { COMMON_WORDS } from '../data/words'
import { calcWpm } from '../utils/wpm'
import { calcAccuracy } from '../utils/accuracy'

interface FallingWord {
  id: string
  text: string
  x: number
  y: number
}

type Difficulty = 'easy' | 'medium' | 'hard'
const DIFFICULTY_SETTINGS: Record<Difficulty, { baseSpeed: number; spawnMs: number }> = {
  easy: { baseSpeed: 0.06, spawnMs: 1800 },
  medium: { baseSpeed: 0.09, spawnMs: 1300 },
  hard: { baseSpeed: 0.13, spawnMs: 950 },
}

const DANGER_Y = 88

export default function TypeRush() {
  const navigate = useNavigate()
  const { recordGameScore, recordResult, gameScores } = useAppData()
  const [phase, setPhase] = useState<'intro' | 'playing' | 'gameover'>('intro')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [words, setWords] = useState<FallingWord[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [lives, setLives] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [correctChars, setCorrectChars] = useState(0)
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0)
  const [shake, setShake] = useState(false)

  const startRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const wordsRef = useRef(words)
  const hasRecordedRef = useRef(false)
  wordsRef.current = words

  const best = gameScores.filter((g) => g.game === 'type-rush').reduce((m, g) => Math.max(m, g.score), 0)

  const targetWord = words
    .filter((w) => input.length > 0 && w.text.startsWith(input))
    .sort((a, b) => b.y - a.y)[0]

  const endGame = useCallback(() => {
    if (hasRecordedRef.current) return
    hasRecordedRef.current = true
    setPhase('gameover')
    const durationSeconds = Math.max(1, elapsed)
    const wpm = calcWpm(correctChars, durationSeconds)
    const totalKeys = correctChars + incorrectKeystrokes
    const accuracy = calcAccuracy(correctChars, totalKeys)
    recordGameScore('type-rush', score, wpm)
    recordResult({
      mode: 'game',
      label: 'Type Rush',
      wpm, cpm: wpm * 5, accuracy, errors: incorrectKeystrokes,
      correctChars, incorrectChars: incorrectKeystrokes, backspaces: 0,
      durationSeconds: Math.round(durationSeconds), missedKeys: {}, wordsTyped: Math.round(correctChars / 5),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, correctChars, incorrectKeystrokes, score])

  function startGame() {
    hasRecordedRef.current = false
    setWords([])
    setInput('')
    setScore(0)
    setCombo(0)
    setLives(3)
    setElapsed(0)
    setCorrectChars(0)
    setIncorrectKeystrokes(0)
    startRef.current = performance.now()
    lastSpawnRef.current = 0
    setPhase('playing')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // main game loop
  useEffect(() => {
    if (phase !== 'playing') return
    let raf: number
    let last = performance.now()

    function tick(now: number) {
      const dt = now - last
      last = now
      const secondsElapsed = (now - startRef.current) / 1000
      setElapsed(secondsElapsed)

      const settings = DIFFICULTY_SETTINGS[difficulty]
      const speedMultiplier = 1 + secondsElapsed / 45 // ramps up over time
      const fallSpeed = settings.baseSpeed * speedMultiplier * (dt / 16.6)

      // spawn
      const spawnInterval = Math.max(500, settings.spawnMs - secondsElapsed * 8)
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now
        const text = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]
        setWords((prev) => [
          ...prev,
          { id: Math.random().toString(36).slice(2), text, x: 5 + Math.random() * 85, y: 0 },
        ])
      }

      // move + check danger
      setWords((prev) => {
        const next: FallingWord[] = []
        let lostLife = false
        for (const w of prev) {
          const ny = w.y + fallSpeed
          if (ny >= DANGER_Y) {
            lostLife = true
          } else {
            next.push({ ...w, y: ny })
          }
        }
        if (lostLife) {
          setLives((l) => {
            const remaining = l - 1
            if (remaining <= 0) setTimeout(() => endGame(), 0)
            return remaining
          })
          setCombo(0)
        }
        return next
      })

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, difficulty, endGame])

  function handleInput(value: string) {
    if (phase !== 'playing') return
    if (value.length < input.length) {
      setInput(value)
      return
    }
    const candidateMatches = wordsRef.current.filter((w) => w.text.startsWith(value))
    if (candidateMatches.length === 0) {
      setIncorrectKeystrokes((n) => n + 1)
      setShake(true)
      setTimeout(() => setShake(false), 250)
      return
    }
    setCorrectChars((n) => n + 1)
    setInput(value)

    const completed = candidateMatches.find((w) => w.text === value)
    if (completed) {
      setWords((prev) => prev.filter((w) => w.id !== completed.id))
      setCombo((c) => c + 1)
      setScore((s) => s + completed.text.length * 10 * Math.min(5, 1 + Math.floor((combo + 1) / 5)))
      setInput('')
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <button onClick={() => navigate('/games')} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink w-fit">
          <ArrowLeft size={15} /> All games
        </button>
        <div>
          <h1 className="text-2xl font-semibold mb-1">Type Rush</h1>
          <p className="text-sm text-muted">Words fall toward the danger zone. Type each one fully before it lands. Miss three and it's game over.</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Difficulty</p>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-sm px-4 py-2 text-sm capitalize border ${
                  difficulty === d ? 'border-accent bg-accent/15 text-accent font-medium' : 'border-border text-muted'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted">Best score: <span className="font-mono text-ink">{best}</span></p>
        <button onClick={startGame} className="rounded-sm bg-accent text-accent-ink px-5 py-2.5 text-sm font-medium w-fit">
          Start game
        </button>
      </div>
    )
  }

  if (phase === 'gameover') {
    const durationSeconds = Math.max(1, elapsed)
    const wpm = calcWpm(correctChars, durationSeconds)
    return (
      <div className="flex flex-col gap-6 max-w-lg pop-in">
        <h1 className="text-2xl font-semibold">Game over</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-mono font-semibold text-accent">{score}</p>
            <p className="text-xs text-muted">Score</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-mono font-semibold">{wpm}</p>
            <p className="text-xs text-muted">WPM</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-mono font-semibold">{Math.round(durationSeconds)}s</p>
            <p className="text-xs text-muted">Survived</p>
          </div>
        </div>
        {score >= best && score > 0 && <p className="text-sm text-good">New high score!</p>}
        <div className="flex gap-3">
          <button onClick={startGame} className="flex items-center gap-2 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
            <RotateCcw size={15} /> Play again
          </button>
          <button onClick={() => navigate('/games')} className="rounded-sm border border-border px-4 py-2 text-sm">
            Back to games
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 font-mono text-sm">
          <span>Score <b className="text-accent">{score}</b></span>
          <span>Combo <b>x{Math.min(5, 1 + Math.floor(combo / 5))}</b></span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} size={16} className={i < lives ? 'text-bad fill-bad' : 'text-border'} />
          ))}
        </div>
      </div>

      <div
        className={`relative h-[440px] rounded-md border border-border bg-surface overflow-hidden ${shake ? 'shake' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        {words.map((w) => {
          const isTarget = w.id === targetWord?.id
          return (
            <div
              key={w.id}
              className={`absolute font-mono text-base px-2 py-0.5 rounded-[3px] -translate-x-1/2 ${
                isTarget ? 'bg-accent/20 text-accent font-semibold' : 'text-ink'
              }`}
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
            >
              {isTarget ? (
                <>
                  <span className="text-accent">{input}</span>
                  <span>{w.text.slice(input.length)}</span>
                </>
              ) : (
                w.text
              )}
            </div>
          )
        })}
        <div className="absolute left-0 right-0 border-t border-dashed border-bad/50" style={{ top: `${DANGER_Y}%` }}>
          <span className="absolute -top-5 left-2 text-[10px] text-bad">danger zone</span>
        </div>
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Type the highlighted word…"
        className="rounded-md border border-border bg-surface px-4 py-3 font-mono text-lg focus:outline-none focus:border-accent"
      />
    </div>
  )
}
