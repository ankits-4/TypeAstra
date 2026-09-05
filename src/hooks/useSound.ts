import { useCallback, useRef } from 'react'
import { loadSettings } from '../services/storage/settingsStorage'

type SoundKind = 'key' | 'correct' | 'error' | 'levelup' | 'achievement' | 'complete'

// Keep ordinary typing nearly silent. Feedback is reserved for gentle errors
// and completion cues, so a long session never becomes a stream of beeps.
function playTone(ctx: AudioContext, freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.05) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ctx.destination)
  const now = ctx.currentTime
  g.gain.setValueAtTime(gain, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  osc.start(now)
  osc.stop(now + durationMs / 1000)
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const play = useCallback((kind: SoundKind) => {
    if (!loadSettings().soundEnabled) return
    const ctx = getCtx()
    if (!ctx) return
    try {
      switch (kind) {
        case 'key':
          playTone(ctx, 260, 8, 'sine', 0.004)
          break
        case 'correct':
          playTone(ctx, 520, 40, 'sine', 0.03)
          break
        case 'error':
          playTone(ctx, 180, 34, 'sine', 0.012)
          break
        case 'levelup':
          playTone(ctx, 523, 120, 'triangle', 0.06)
          setTimeout(() => playTone(ctx, 659, 120, 'triangle', 0.06), 100)
          setTimeout(() => playTone(ctx, 784, 180, 'triangle', 0.06), 200)
          break
        case 'achievement':
          playTone(ctx, 660, 90, 'triangle', 0.05)
          setTimeout(() => playTone(ctx, 880, 150, 'triangle', 0.05), 90)
          break
        case 'complete':
          playTone(ctx, 440, 90, 'sine', 0.045)
          setTimeout(() => playTone(ctx, 660, 120, 'triangle', 0.045), 85)
          setTimeout(() => playTone(ctx, 880, 180, 'sine', 0.04), 185)
          break
      }
    } catch {
      // audio unsupported or blocked — fail silently
    }
  }, [getCtx])

  return { play }
}
