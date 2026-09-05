import { Trophy, Zap, Sparkles, CheckCircle2, X } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'

const ICONS: Record<string, any> = {
  success: CheckCircle2,
  info: Sparkles,
  levelup: Zap,
  achievement: Trophy,
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useAppData()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind] ?? Sparkles
        return (
          <div
            key={t.id}
            className="pop-in flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3 shadow-lg"
          >
            <div className="mt-0.5 shrink-0 rounded-sm bg-accent/15 p-1.5 text-accent">
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.message && <p className="text-xs text-muted truncate">{t.message}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 text-muted hover:text-ink">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
