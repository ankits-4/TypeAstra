import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Keyboard, ArrowRight } from 'lucide-react'
import { readStorage, writeStorage } from '../../services/storage/storageClient'
import { LESSONS } from '../../data/lessons'

type Experience = 'complete-beginner' | 'beginner' | 'intermediate' | 'advanced'
type Goal = 'touch-typing' | 'speed' | 'accuracy' | 'coding' | 'general'

const EXPERIENCE_OPTIONS: { id: Experience; label: string; startLessonId: string }[] = [
  { id: 'complete-beginner', label: 'Complete beginner', startLessonId: 'l1' },
  { id: 'beginner', label: 'Beginner', startLessonId: 'l5' },
  { id: 'intermediate', label: 'Intermediate', startLessonId: 'l10' },
  { id: 'advanced', label: 'Advanced', startLessonId: 'l16' },
]

const GOAL_OPTIONS: { id: Goal; label: string }[] = [
  { id: 'touch-typing', label: 'Learn touch typing' },
  { id: 'speed', label: 'Increase speed' },
  { id: 'accuracy', label: 'Improve accuracy' },
  { id: 'coding', label: 'Type code faster' },
  { id: 'general', label: 'General practice' },
]

export function isOnboardingComplete(profileId: string): boolean {
  return readStorage(`${profileId}:onboardingComplete`, false)
}

export default function OnboardingModal({ profileId, onDone }: { profileId: string; onDone: () => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)

  function finish(goToLesson: boolean) {
    writeStorage(`${profileId}:onboardingComplete`, true)
    onDone()
    if (goToLesson && experience) {
      const rec = EXPERIENCE_OPTIONS.find((e) => e.id === experience)!
      navigate(`/lessons/${rec.startLessonId}`)
    }
  }

  function skip() {
    writeStorage(`${profileId}:onboardingComplete`, true)
    onDone()
  }

  const recommendedLesson = experience
    ? LESSONS.find((l) => l.id === EXPERIENCE_OPTIONS.find((e) => e.id === experience)!.startLessonId)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="pop-in w-full max-w-md rounded-md border border-border bg-surface p-6 md:p-8">
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-md bg-accent/15 text-accent p-3">
              <Keyboard size={28} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Welcome to TypAstra</h2>
              <p className="text-sm text-muted">A few quick questions so we can point you at the right starting place.</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={skip} className="flex-1 rounded-sm border border-border px-4 py-2 text-sm">Skip</button>
              <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
                Get started <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">What's your typing experience?</h2>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setExperience(o.id)}
                  className={`text-left rounded-sm border px-4 py-2.5 text-sm transition-colors ${
                    experience === o.id ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-border hover:border-accent/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={skip} className="text-sm text-muted">Skip onboarding</button>
              <button
                disabled={!experience}
                onClick={() => setStep(2)}
                className="ml-auto flex items-center gap-1.5 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">What's your goal?</h2>
            <div className="flex flex-col gap-2">
              {GOAL_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setGoal(o.id)}
                  className={`text-left rounded-sm border px-4 py-2.5 text-sm transition-colors ${
                    goal === o.id ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-border hover:border-accent/40'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={skip} className="text-sm text-muted">Skip onboarding</button>
              <button
                disabled={!goal}
                onClick={() => setStep(3)}
                className="ml-auto flex items-center gap-1.5 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && recommendedLesson && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">You're all set</h2>
            <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
              <p className="text-xs text-muted mb-1">Recommended starting point</p>
              <p className="font-medium">{recommendedLesson.title}</p>
              <p className="text-xs text-muted mt-1">{recommendedLesson.description}</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={() => finish(false)} className="flex-1 rounded-sm border border-border px-4 py-2 text-sm">
                Explore first
              </button>
              <button onClick={() => finish(true)} className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
                Start lesson <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
