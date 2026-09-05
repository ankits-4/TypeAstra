import { Star } from 'lucide-react'

export default function LessonStars({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} of 5 mastery stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={compact ? 13 : 17} className={index < value ? 'fill-accent text-accent' : 'text-border'} />
      ))}
    </div>
  )
}
