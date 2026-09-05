import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  UserProfile, UserStats, TypingResult, LessonProgress, AchievementProgress,
  DailyChallenge, GameHighScore, UserSettings, TestMode,
} from '../types'
import { loadProfile, saveProfile, loadStats, saveStats } from '../services/storage/userStorage'
import { loadResults, appendResult } from '../services/storage/sessionStorage'
import { loadSettings, saveSettings } from '../services/storage/settingsStorage'
import {
  loadLessonProgress, saveLessonProgress,
  loadAchievementProgress, saveAchievementProgress,
  loadDailyChallenges, saveDailyChallenges,
  loadGameScores, saveGameScores,
} from '../services/storage/progressStorage'
import { levelFromXp, xpForResult } from '../utils/xp'
import { todayDateOnly, daysBetween } from '../utils/date'
import { ACHIEVEMENTS } from '../data/achievements'
import { LESSONS } from '../data/lessons'
import { useSound } from '../hooks/useSound'

export interface Toast {
  id: string
  title: string
  message?: string
  kind: 'success' | 'info' | 'levelup' | 'achievement'
}

interface RecordResultInput {
  mode: TestMode
  label: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  correctChars: number
  incorrectChars: number
  backspaces: number
  durationSeconds: number
  missedKeys: Record<string, number>
  correctKeys?: Record<string, number>
  lessonId?: string
  wordsTyped: number
}

interface AppDataContextValue {
  profile: UserProfile
  stats: UserStats
  results: TypingResult[]
  lessonProgress: Record<string, LessonProgress>
  achievementProgress: Record<string, AchievementProgress>
  dailyChallenges: DailyChallenge[]
  gameScores: GameHighScore[]
  settings: UserSettings
  toasts: Toast[]
  level: number
  xpIntoLevel: number
  xpForNext: number
  recordResult: (input: RecordResultInput) => TypingResult
  recordGameScore: (game: string, score: number, wpm: number) => void
  updateSettings: (partial: Partial<UserSettings>) => void
  updateProfile: (partial: Partial<UserProfile>) => void
  dismissToast: (id: string) => void
  resetAllData: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function ensureDailyChallenges(existing: DailyChallenge[]): DailyChallenge[] {
  const today = todayDateOnly()
  if (existing.some((c) => c.date === today)) return existing
  const fresh: DailyChallenge[] = [
    { id: `${today}-words`, date: today, description: 'Type 300 words', target: 300, progress: 0, xp: 50, type: 'words', completed: false },
    { id: `${today}-wpm`, date: today, description: 'Reach 45 WPM in a session', target: 45, progress: 0, xp: 100, type: 'wpm', completed: false },
    { id: `${today}-tests`, date: today, description: 'Complete 3 sessions', target: 3, progress: 0, xp: 75, type: 'tests', completed: false },
  ]
  return [...existing.filter((c) => c.date !== today), ...fresh]
}

// profileId + defaultUsername identify whose data to load/save. Mount this
// provider with `key={profileId}` so it fully resets when the active profile changes.
export function AppDataProvider({ profileId, defaultUsername, children }: { profileId: string; defaultUsername: string; children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile(profileId, defaultUsername))
  const [stats, setStats] = useState<UserStats>(() => loadStats(profileId))
  const [results, setResults] = useState<TypingResult[]>(() => loadResults(profileId))
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>(() => loadLessonProgress(profileId))
  const [achievementProgress, setAchievementProgress] = useState<Record<string, AchievementProgress>>(() => loadAchievementProgress(profileId))
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => ensureDailyChallenges(loadDailyChallenges(profileId)))
  const [gameScores, setGameScores] = useState<GameHighScore[]>(() => loadGameScores(profileId))
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings())
  const [toasts, setToasts] = useState<Toast[]>([])
  const { play } = useSound()

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...t, id }])
    if (t.kind === 'levelup') play('levelup')
    else if (t.kind === 'achievement') play('achievement')
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4500)
  }, [play])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const recordResult = useCallback((input: RecordResultInput): TypingResult => {
    const xpEarned = xpForResult(input.wpm, input.accuracy, input.durationSeconds)
    const result: TypingResult = {
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
      mode: input.mode,
      label: input.label,
      wpm: input.wpm,
      cpm: input.cpm,
      accuracy: input.accuracy,
      errors: input.errors,
      correctChars: input.correctChars,
      incorrectChars: input.incorrectChars,
      backspaces: input.backspaces,
      durationSeconds: input.durationSeconds,
      xpEarned,
      missedKeys: input.missedKeys,
    }
    const newResults = appendResult(profileId, result)
    setResults(newResults)

    // ---- stats ----
    const today = todayDateOnly()
    let currentStreak = stats.currentStreak
    let longestStreak = stats.longestStreak
    if (!stats.lastPracticeDate) {
      currentStreak = 1
    } else if (stats.lastPracticeDate === today) {
      currentStreak = stats.currentStreak
    } else if (daysBetween(stats.lastPracticeDate, today) === 1) {
      currentStreak = stats.currentStreak + 1
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)

    const keyStats = { ...stats.keyStats }
    Object.entries(input.missedKeys).forEach(([key, count]) => {
      const prev = keyStats[key] ?? { correct: 0, incorrect: 0 }
      keyStats[key] = { correct: prev.correct, incorrect: prev.incorrect + count }
    })
    Object.entries(input.correctKeys ?? {}).forEach(([key, count]) => {
      const prev = keyStats[key] ?? { correct: 0, incorrect: 0 }
      keyStats[key] = { correct: prev.correct + count, incorrect: prev.incorrect }
    })

    const totalTests = stats.totalTests + 1
    const newStats: UserStats = {
      totalTests,
      totalWordsTyped: stats.totalWordsTyped + input.wordsTyped,
      totalCharsTyped: stats.totalCharsTyped + input.correctChars + input.incorrectChars,
      totalPracticeSeconds: stats.totalPracticeSeconds + input.durationSeconds,
      totalMistakes: stats.totalMistakes + input.errors,
      bestWpm: Math.max(stats.bestWpm, input.wpm),
      bestAccuracy: Math.max(stats.bestAccuracy, input.accuracy),
      averageWpm: Math.round(((stats.averageWpm * stats.totalTests) + input.wpm) / totalTests),
      averageAccuracy: Math.round((((stats.averageAccuracy * stats.totalTests) + input.accuracy) / totalTests) * 10) / 10,
      currentStreak,
      longestStreak,
      lastPracticeDate: today,
      practiceDates: stats.practiceDates.includes(today) ? stats.practiceDates : [...stats.practiceDates, today],
      keyStats,
    }
    setStats(newStats)
    saveStats(profileId, newStats)

    const wasRecordWpm = input.wpm > stats.bestWpm && stats.totalTests > 0
    if (wasRecordWpm) {
      pushToast({ title: 'New personal record', message: `${input.wpm} WPM — +${xpEarned} XP`, kind: 'success' })
    }

    // ---- xp / level ----
    const prevLevelInfo = levelFromXp(profile.xp)
    const newXp = profile.xp + xpEarned
    const newLevelInfo = levelFromXp(newXp)
    const newProfile = { ...profile, xp: newXp, level: newLevelInfo.level }
    setProfile(newProfile)
    saveProfile(profileId, newProfile)
    if (newLevelInfo.level > prevLevelInfo.level) {
      pushToast({ title: 'Level up!', message: `You reached level ${newLevelInfo.level}`, kind: 'levelup' })
    }

    // ---- lesson progress ----
    if (input.lessonId) {
      const lesson = LESSONS.find((l) => l.id === input.lessonId)
      const prevProgress = lessonProgress[input.lessonId]
      const meetsTarget = lesson ? input.wpm >= lesson.targetWpm && input.accuracy >= lesson.targetAccuracy : true
      const updated: LessonProgress = {
        lessonId: input.lessonId,
        completed: (prevProgress?.completed ?? false) || meetsTarget,
        bestWpm: Math.max(prevProgress?.bestWpm ?? 0, input.wpm),
        bestAccuracy: Math.max(prevProgress?.bestAccuracy ?? 0, input.accuracy),
        attempts: (prevProgress?.attempts ?? 0) + 1,
        lastAttempt: new Date().toISOString(),
      }
      const newLP = { ...lessonProgress, [input.lessonId]: updated }
      setLessonProgress(newLP)
      saveLessonProgress(profileId, newLP)
      if (meetsTarget && !prevProgress?.completed) {
        pushToast({ title: 'Lesson completed', message: lesson?.title, kind: 'success' })
      }
    }

    // ---- daily challenges ----
    const refreshed = ensureDailyChallenges(dailyChallenges)
    const updatedChallenges = refreshed.map((c) => {
      if (c.date !== today || c.completed) return c
      let progress = c.progress
      if (c.type === 'words') progress += input.wordsTyped
      if (c.type === 'wpm') progress = Math.max(progress, input.wpm)
      if (c.type === 'tests') progress += 1
      const completed = progress >= c.target
      if (completed && !c.completed) {
        pushToast({ title: 'Daily challenge complete', message: `${c.description} — +${c.xp} XP`, kind: 'success' })
      }
      return { ...c, progress, completed }
    })
    setDailyChallenges(updatedChallenges)
    saveDailyChallenges(profileId, updatedChallenges)

    // ---- achievements ----
    const newAchievementProgress = { ...achievementProgress }
    let unlockedAny = false
    ACHIEVEMENTS.forEach((a) => {
      if (newAchievementProgress[a.id]?.unlocked) return
      if (a.check(newStats, newResults)) {
        newAchievementProgress[a.id] = { id: a.id, unlocked: true, unlockedAt: new Date().toISOString() }
        unlockedAny = true
        pushToast({ title: 'Achievement unlocked', message: a.name, kind: 'achievement' })
      }
    })
    if (unlockedAny) {
      setAchievementProgress(newAchievementProgress)
      saveAchievementProgress(profileId, newAchievementProgress)
    }

    return result
  }, [stats, profile, lessonProgress, dailyChallenges, achievementProgress, pushToast, profileId])

  const recordGameScore = useCallback((game: string, score: number, wpm: number) => {
    const entry: GameHighScore = { game, score, wpm, date: new Date().toISOString() }
    const newScores = [...gameScores, entry]
    setGameScores(newScores)
    saveGameScores(profileId, newScores)
  }, [gameScores, profileId])

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial }
      saveProfile(profileId, next)
      return next
    })
  }, [profileId])

  const resetAllData = useCallback(() => {
    // Only clear this profile's data — other profiles on this device are untouched.
    const prefix = `typeflow:${profileId}:`
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }, [profileId])

  const { level, xpIntoLevel, xpForNext } = useMemo(() => levelFromXp(profile.xp), [profile.xp])

  const value: AppDataContextValue = {
    profile, stats, results, lessonProgress, achievementProgress,
    dailyChallenges: useMemo(() => ensureDailyChallenges(dailyChallenges), [dailyChallenges]),
    gameScores, settings, toasts,
    level, xpIntoLevel, xpForNext,
    recordResult, recordGameScore, updateSettings, updateProfile, dismissToast, resetAllData,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
