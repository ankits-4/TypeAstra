import { LessonProgress, AchievementProgress, DailyChallenge, GameHighScore } from '../../types'
import { readStorage, writeStorage } from './storageClient'

export function loadLessonProgress(profileId: string): Record<string, LessonProgress> {
  return readStorage(`${profileId}:lessonProgress`, {})
}
export function saveLessonProgress(profileId: string, progress: Record<string, LessonProgress>) {
  writeStorage(`${profileId}:lessonProgress`, progress)
}

export function loadAchievementProgress(profileId: string): Record<string, AchievementProgress> {
  return readStorage(`${profileId}:achievements`, {})
}
export function saveAchievementProgress(profileId: string, progress: Record<string, AchievementProgress>) {
  writeStorage(`${profileId}:achievements`, progress)
}

export function loadDailyChallenges(profileId: string): DailyChallenge[] {
  return readStorage(`${profileId}:dailyChallenges`, [])
}
export function saveDailyChallenges(profileId: string, challenges: DailyChallenge[]) {
  writeStorage(`${profileId}:dailyChallenges`, challenges)
}

export function loadGameScores(profileId: string): GameHighScore[] {
  return readStorage(`${profileId}:gameScores`, [])
}
export function saveGameScores(profileId: string, scores: GameHighScore[]) {
  writeStorage(`${profileId}:gameScores`, scores)
}
