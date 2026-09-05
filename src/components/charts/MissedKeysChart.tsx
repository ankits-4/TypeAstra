import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function MissedKeysChart({ data }: { data: { key: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">No mistakes recorded — clean run.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="key" type="category" tick={{ fill: 'var(--ink)', fontSize: 13, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="count" fill="var(--bad)" radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  )
}
