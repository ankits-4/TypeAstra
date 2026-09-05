// ---- Core session / result types ----

export type TestMode = 'time' | 'words' | 'quote' | 'paragraph' | 'lesson' | 'game'

export interface TypingResult {
  id: string
  date: string // ISO
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
  xpEarned: number
  missedKeys: Record<string, number>
}

// ---- Lessons ----

export interface Lesson {
  id: string
  number: number
  title: string
  description: string
  difficulty: number // 1-14
  targetWpm: number
  targetAccuracy: number
  xpReward: number
  estimatedMinutes: number
  skills: string[]
  keys: string[]
  textGenerator: 'keys' | 'words' | 'punctuation' | 'numbers' | 'paragraph'
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  bestWpm: number
  bestAccuracy: number
  attempts: number
  lastAttempt?: string
}

// ---- Achievements ----

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // lucide icon name
  check: (stats: UserStats, results: TypingResult[]) => boolean
}

export interface AchievementProgress {
  id: string
  unlocked: boolean
  unlockedAt?: string
}

// ---- User / progression ----

export interface UserProfile {
  username: string
  level: number
  xp: number
  createdAt: string
}

export interface UserStats {
  totalTests: number
  totalWordsTyped: number
  totalCharsTyped: number
  totalPracticeSeconds: number
  totalMistakes: number
  bestWpm: number
  bestAccuracy: number
  averageWpm: number
  averageAccuracy: number
  currentStreak: number
  longestStreak: number
  lastPracticeDate: string | null
  practiceDates: string[] // ISO date-only strings, for streak calendar
  keyStats: Record<string, { correct: number; incorrect: number }>
}

export interface DailyChallenge {
  id: string
  date: string // date-only
  description: string
  target: number
  progress: number
  xp: number
  type: 'words' | 'wpm' | 'lessons' | 'tests'
  completed: boolean
}

export interface GameHighScore {
  game: string
  score: number
  wpm: number
  date: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  showKeyboard: boolean
  smoothCaret: boolean
  soundEnabled: boolean
  reducedMotion: boolean
}

export type CharState = 'upcoming' | 'current' | 'correct' | 'incorrect'
