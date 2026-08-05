import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  delta,
  glow,
}: {
  label: string
  value: string
  delta: number
  glow?: boolean
}) {
  const positive = delta >= 0
  return (
    <Card className={cn('p-5 relative overflow-hidden', glow && 'violet-glow')}>
      <div className="relative z-10">
        <p className="text-xs text-[var(--color-text-secondary)] mb-2">{label}</p>
        <p className="mono text-2xl font-medium text-[var(--color-text-primary)]">{value}</p>
        <div className={cn('flex items-center gap-1 mt-2 text-xs mono', positive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta).toFixed(1)}% vs last week
        </div>
      </div>
    </Card>
  )
}
