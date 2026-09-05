import {
  Award, BookOpen, CalendarCheck, CalendarDays, Cpu, Flame, Footprints,
  Moon, ShieldCheck, Sparkles, Sunrise, Target, Timer, Trophy, Zap, Lock,
} from 'lucide-react'
import { ACHIEVEMENTS } from '../data/achievements'
import { useAppData } from '../context/AppDataContext'

// Achievement icons are looked up by name at runtime, but `import * as Icons`
// pulls in every icon in the library (~700kB before gzip). Naming the exact
// set actually used keeps this route's chunk small.
const ICONS: Record<string, typeof Award> = {
  Award, BookOpen, CalendarCheck, CalendarDays, Cpu, Flame, Footprints,
  Moon, ShieldCheck, Sparkles, Sunrise, Target, Timer, Trophy, Zap,
}

export default function Achievements() {
  const { achievementProgress } = useAppData()
  const unlockedCount = ACHIEVEMENTS.filter((a) => achievementProgress[a.id]?.unlocked).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Achievements</h1>
        <p className="text-sm text-muted">{unlockedCount} of {ACHIEVEMENTS.length} unlocked</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = achievementProgress[a.id]?.unlocked
          const Icon = ICONS[a.icon] ?? Award
          return (
            <div
              key={a.id}
              className={`flex items-start gap-3 rounded-md border p-4 ${
                unlocked ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface opacity-70'
              }`}
            >
              <div className={`shrink-0 rounded-sm p-2 ${unlocked ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted'}`}>
                {unlocked ? <Icon size={18} /> : <Lock size={18} />}
              </div>
              <div>
                <p className="font-medium text-sm">{a.name}</p>
                <p className="text-xs text-muted mt-0.5">{a.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
