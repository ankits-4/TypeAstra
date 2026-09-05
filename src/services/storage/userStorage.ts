import { UserProfile, UserStats } from '../../types'
import { readStorage, writeStorage } from './storageClient'

const DEFAULT_STATS: UserStats = {
  totalTests: 0,
  totalWordsTyped: 0,
  totalCharsTyped: 0,
  totalPracticeSeconds: 0,
  totalMistakes: 0,
  bestWpm: 0,
  bestAccuracy: 0,
  averageWpm: 0,
  averageAccuracy: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  practiceDates: [],
  keyStats: {},
}

export function loadProfile(profileId: string, defaultUsername: string): UserProfile {
  const defaultProfile: UserProfile = {
    username: defaultUsername,
    level: 1,
    xp: 0,
    createdAt: new Date().toISOString(),
  }
  return readStorage(`${profileId}:profile`, defaultProfile)
}
export function saveProfile(profileId: string, profile: UserProfile) {
  writeStorage(`${profileId}:profile`, profile)
}
export function loadStats(profileId: string): UserStats {
  return readStorage(`${profileId}:stats`, DEFAULT_STATS)
}
export function saveStats(profileId: string, stats: UserStats) {
  writeStorage(`${profileId}:stats`, stats)
}
