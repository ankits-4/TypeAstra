import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CharState } from '../types'
import { calcWpm, calcCpm } from '../utils/wpm'
import { calcAccuracy } from '../utils/accuracy'
import { useSound } from './useSound'

interface UseTypingEngineOptions {
  text: string
  mode?: 'length' | 'time'
  durationSeconds?: number
  onComplete?: (summary: EngineSummary) => void
}

export interface EngineSummary {
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correctChars: number
  incorrectChars: number
  backspaces: number
  durationSeconds: number
  missedKeys: Record<string, number>
  correctKeys: Record<string, number>
  wordsTyped: number
}

export function useTypingEngine({ text, mode = 'length', durationSeconds, onComplete }: UseTypingEngineOptions) {
  const { play } = useSound()
  const [typed, setTyped] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [tick, setTick] = useState(0) // forces re-render for live timer
  const [lastKey, setLastKey] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null)
  const [shake, setShake] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const pausedAtRef = useRef<number | null>(null)
  const totalPausedMsRef = useRef(0)
  const correctCountRef = useRef(0)
  const incorrectCountRef = useRef(0)
  const backspacesRef = useRef(0)
  const missedKeysRef = useRef<Record<string, number>>({})
  const correctKeysRef = useRef<Record<string, number>>({})
  const completedRef = useRef(false)

  const reset = useCallback(() => {
    setTyped('')
    setIsStarted(false)
    setIsPaused(false)
    setIsComplete(false)
    setTick(0)
    setLastKey(null)
    setLastResult(null)
    startTimeRef.current = null
    pausedAtRef.current = null
    totalPausedMsRef.current = 0
    correctCountRef.current = 0
    incorrectCountRef.current = 0
    backspacesRef.current = 0
    missedKeysRef.current = {}
    correctKeysRef.current = {}
    completedRef.current = false
  }, [])

  // A new prompt always represents a fresh run. This also makes changing test
  // length or mode safe while a session is in progress.
  useEffect(() => {
    reset()
  }, [text, reset])

  // live ticking while active
  useEffect(() => {
    if (!isStarted || isPaused || isComplete) return
    const id = setInterval(() => setTick((t) => t + 1), 200)
    return () => clearInterval(id)
  }, [isStarted, isPaused, isComplete])

  const elapsedSeconds = useMemo(() => {
    if (!startTimeRef.current) return 0
    const now = isPaused && pausedAtRef.current ? pausedAtRef.current : Date.now()
    const raw = now - startTimeRef.current - totalPausedMsRef.current
    return Math.max(0, raw / 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, isPaused, isComplete])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsComplete(true)
    const correct = correctCountRef.current
    const incorrect = incorrectCountRef.current
    const total = correct + incorrect
    const duration = elapsedSeconds || 0.1
    const summary: EngineSummary = {
      wpm: calcWpm(correct, duration),
      cpm: calcCpm(correct, duration),
      accuracy: calcAccuracy(correct, total),
      errors: incorrect,
      correctChars: correct,
      incorrectChars: incorrect,
      backspaces: backspacesRef.current,
      durationSeconds: Math.round(duration),
      missedKeys: { ...missedKeysRef.current },
      correctKeys: { ...correctKeysRef.current },
      wordsTyped: Math.round(correct / 5),
    }
    play('complete')
    onComplete?.(summary)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, onComplete])

  // auto-complete for time-based mode
  useEffect(() => {
    if (mode === 'time' && durationSeconds && isStarted && !isComplete) {
      if (elapsedSeconds >= durationSeconds) finish()
    }
  }, [mode, durationSeconds, isStarted, isComplete, elapsedSeconds, finish])

  const handleChange = useCallback((value: string) => {
    if (isComplete || isPaused) return
    if (value.length > text.length) value = value.slice(0, text.length)

    if (!isStarted && value.length > 0) {
      setIsStarted(true)
      startTimeRef.current = Date.now()
    }

    if (value.length > typed.length) {
      // characters added
      for (let i = typed.length; i < value.length; i++) {
        const expected = text[i]
        const actual = value[i]
        if (actual === expected) {
          correctCountRef.current += 1
          correctKeysRef.current[expected] = (correctKeysRef.current[expected] ?? 0) + 1
          play('key')
          setLastKey(actual)
          setLastResult('correct')
        } else {
          incorrectCountRef.current += 1
          missedKeysRef.current[expected] = (missedKeysRef.current[expected] ?? 0) + 1
          play('error')
          setLastKey(actual)
          setLastResult('incorrect')
          setShake(true)
          setTimeout(() => setShake(false), 300)
        }
      }
    } else if (value.length < typed.length) {
      backspacesRef.current += typed.length - value.length
    }

    setTyped(value)

    if (mode === 'length' && value.length >= text.length) {
      setTimeout(finish, 0)
    }
  }, [typed, text, isStarted, isComplete, isPaused, mode, finish, play])

  const pause = useCallback(() => {
    if (!isStarted || isComplete || isPaused) return
    setIsPaused(true)
    pausedAtRef.current = Date.now()
  }, [isStarted, isComplete, isPaused])

  const resume = useCallback(() => {
    if (!isPaused) return
    if (pausedAtRef.current) {
      totalPausedMsRef.current += Date.now() - pausedAtRef.current
    }
    pausedAtRef.current = null
    setIsPaused(false)
  }, [isPaused])

  const restart = useCallback(() => {
    reset()
  }, [reset])

  // character state array for rendering
  const charStates: CharState[] = useMemo(() => {
    return text.split('').map((c, i) => {
      if (i < typed.length) return typed[i] === c ? 'correct' : 'incorrect'
      if (i === typed.length) return 'current'
      return 'upcoming'
    })
  }, [text, typed])

  const liveCorrect = correctCountRef.current
  const liveIncorrect = incorrectCountRef.current
  const liveTotal = liveCorrect + liveIncorrect
  // Avoid flashing an unrealistic four-figure speed on the very first key.
  const wpm = elapsedSeconds >= 1 ? calcWpm(liveCorrect, elapsedSeconds) : 0
  const cpm = elapsedSeconds >= 1 ? calcCpm(liveCorrect, elapsedSeconds) : 0
  const accuracy = calcAccuracy(liveCorrect, liveTotal)

  return {
    text,
    typed,
    currentIndex: typed.length,
    charStates,
    isStarted,
    isPaused,
    isComplete,
    elapsedSeconds,
    wpm,
    cpm,
    accuracy,
    errors: liveIncorrect,
    backspaces: backspacesRef.current,
    lastKey,
    lastResult,
    setLastKey,
    shake,
    handleChange,
    pause,
    resume,
    restart,
    finish,
  }
}
