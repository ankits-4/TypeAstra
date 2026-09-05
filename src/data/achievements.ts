import { Achievement } from '../types'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first typing session.',
    icon: 'Footprints',
    check: (stats) => stats.totalTests >= 1,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Reach 60 WPM in a single session.',
    icon: 'Zap',
    check: (stats) => stats.bestWpm >= 60,
  },
  {
    id: 'fast-fingers',
    name: 'Fast Fingers',
    description: 'Reach 80 WPM in a single session.',
    icon: 'Flame',
    check: (stats) => stats.bestWpm >= 80,
  },
  {
    id: 'typing-machine',
    name: 'Typing Machine',
    description: 'Reach 100 WPM in a single session.',
    icon: 'Cpu',
    check: (stats) => stats.bestWpm >= 100,
  },
  {
    id: 'accuracy-master',
    name: 'Accuracy Master',
    description: 'Achieve 99% accuracy in a session.',
    icon: 'Target',
    check: (stats) => stats.bestAccuracy >= 99,
  },
  {
    id: 'perfect-run',
    name: 'Perfect Run',
    description: 'Complete a test with 100% accuracy.',
    icon: 'Sparkles',
    check: (stats) => stats.bestAccuracy >= 100,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row.',
    icon: 'CalendarCheck',
    check: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak.',
    icon: 'CalendarDays',
    check: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Complete 100 typing sessions.',
    icon: 'Trophy',
    check: (stats) => stats.totalTests >= 100,
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Type 10,000 words in total.',
    icon: 'BookOpen',
    check: (stats) => stats.totalWordsTyped >= 10000,
  },
  {
    id: 'marathoner',
    name: 'Marathoner',
    description: 'Practice for 5 total hours.',
    icon: 'Timer',
    check: (stats) => stats.totalPracticeSeconds >= 5 * 3600,
  },
  {
    id: 'ten-sessions',
    name: 'Getting Serious',
    description: 'Complete 10 typing sessions.',
    icon: 'Award',
    check: (stats) => stats.totalTests >= 10,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Practice between midnight and 4am.',
    icon: 'Moon',
    check: (_stats, results) =>
      results.some((r) => {
        const h = new Date(r.date).getHours()
        return h >= 0 && h < 4
      }),
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Practice before 7am.',
    icon: 'Sunrise',
    check: (_stats, results) =>
      results.some((r) => new Date(r.date).getHours() < 7),
  },
  {
    id: 'consistent',
    name: 'Steady Hands',
    description: 'Complete 5 sessions with 95%+ accuracy.',
    icon: 'ShieldCheck',
    check: (_stats, results) => results.filter((r) => r.accuracy >= 95).length >= 5,
  },
]
