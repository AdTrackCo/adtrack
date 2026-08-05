import { AlertTriangle, TrendingDown, DollarSign, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { alerts } from '@/lib/mockData'

const icons = {
  fatigue: AlertTriangle,
  budget: DollarSign,
  ctr: TrendingDown,
  policy: ShieldAlert,
}

export function AlertsPanel() {
  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = icons[alert.type]
        return (
          <div key={alert.id} className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="flex items-start gap-2.5">
              <Icon size={15} className={alert.severity === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium">{alert.title}</p>
                  <Badge tone={alert.severity}>{alert.severity}</Badge>
                </div>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{alert.description}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1.5 mono">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
