import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: boolean
}

export default function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 flex items-center gap-3">
      <div className={`shrink-0 rounded-sm p-2 ${accent ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-muted'}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-mono font-semibold leading-tight truncate">{value}</p>
        <p className="text-xs text-muted truncate">{label}</p>
      </div>
    </div>
  )
}
