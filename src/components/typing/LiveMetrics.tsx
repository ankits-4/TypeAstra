interface LiveMetricsProps {
  wpm: number
  accuracy: number
  time: number | string
  timeLabel?: string
}

export default function LiveMetrics({ wpm, accuracy, time, timeLabel = 'Time' }: LiveMetricsProps) {
  return (
    <div className="flex items-center gap-6 md:gap-10 font-mono">
      <Metric label="WPM" value={wpm} />
      <Metric label="Accuracy" value={`${accuracy}%`} />
      <Metric label={timeLabel} value={time} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl md:text-3xl font-semibold text-accent leading-tight">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}
